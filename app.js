const fs = require('fs/promises');
const path = require('path');

const { App, ExpressReceiver } = require('@slack/bolt');

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initialize the Bolt app with the receiver and bot token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

// Handle challenge verification
receiver.router.post('/slack/events', (req, res) => {
  if (req.body.type === 'url_verification') {
    res.status(200).send(req.body.challenge);
  }
});

const threads = {};

const handleIncomingMessage = async ({ event, client }) => {
  try {
    // Remove the bot's mention (if any) and trim whitespace
    const message = event.text.replace(/<@([A-Z0-9]{9,})>,?/g, '').trim();

    const threadTs = event.thread_ts || event.ts

    if (!threads[threadTs]) {
      // If the thread doesn't exist in the hash, fetch the existing messages in the thread
      const result = await client.conversations.replies({
        channel: event.channel,
        ts: threadTs,
      });

      // Add the messages to a new array and store it in the hash
      threads[threadTs] = result.messages;
    } else {
      // If the thread exists in the hash, append the message to the array
      threads[threadTs].push(event);
    }

    // Send a message to the channel or DM where the message occurred
    const result = await client.chat.postMessage({
      channel: event.channel,
      text: `You said: ${message}`,
      thread_ts: threadTs,
    });
    threads[threadTs].push(result.message)

    await writeThreadsToFile(threads);

    console.log(threads[threadTs].map((message) => message.text))
  } catch (error) {
    console.error(error);
  }
};

// Handle messages
app.event('message', async ({ event, client }) => {
  // Ignore bot messages
  if (event.subtype === 'bot_message') return;

  // Handle direct messages OR messages in threads that the
  // bot is participating in
  if (event.channel_type === 'im' || threads[event.thread_ts]) {
    await handleIncomingMessage({ event, client });
  }
});

// Handle app mentions
app.event('app_mention', async ({ event, client }) => {
  await handleIncomingMessage({ event, client });
});

// Start the Bolt app
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`Bolt app is running on port ${port}`);
})();

const filePath = path.join(__dirname, 'threads.json');

async function readThreadsFromFile() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading threads from file:', error);
    return {};
  }
}

async function writeThreadsToFile(threads) {
  try {
    const data = JSON.stringify(threads, null, 2);
    await fs.writeFile(filePath, data);
  } catch (error) {
    console.error('Error writing threads to file:', error);
  }
}