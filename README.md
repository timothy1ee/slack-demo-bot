# Slack Bot Starter

This project demonstrates how to get started with creating a simple Slack bot using the Slack Bolt Framework. The bot can respond to messages in direct messages (DMs), channels, and threads.

## Supported Use Cases

This demo Slack bot supports the following use cases:

- Respond to direct messages (DMs) with an echo of the received message.
- Respond to mentions in a channel with an echo of the received message.
- Respond to messages in threads where the bot was mentioned with an echo of the received message.

Of course, instead of simply echoing your message, you can determine what bot logic to use.

Some bot logic also requires the full thread history for context, so the demo code also illustrates how to maintain a hash of thread conversations.

## Installation

### Configuring the Slack App

1. Create a new Slack app at https://api.slack.com/apps
2. Navigate to the "OAuth & Permissions" page and add the following scopes:
   - `app_mentions:read` - To receive events when the bot is mentioned.
   - `chat:write` - To send messages as the bot.
   - `channels:history` - To fetch messages in public channels.
   - `channels:write` - To send messages in public channels.
   - `groups:history` - To fetch messages in private channels.
   - `groups:write` - To send messages in private channels.
   - `im:history` - To fetch messages in direct message channels.
   - `im:write` - To send messages in direct message channels.
   - `mpim:history` - To fetch messages in multi-person direct message channels.
   - `mpim:write` - To send messages in multi-person direct message channels.
   - `channels:join` - (Optional) To allow the bot to join channels automatically when invited.
3. Install the app to your workspace and copy the "Bot User OAuth Token" (SLACK_BOT_TOKEN) from the "OAuth & Permissions" page.
4. Navigate to the "Event Subscriptions" page, enable events, and add the following event subscriptions:
   - `message.channels` - To receive messages posted in public channels.
   - `message.groups` - To receive messages posted in private channels.
   - `message.im` - To receive messages posted in direct message channels.
   - `message.mpim` - To receive messages posted in multi-person direct message channels.
   - `app_mention` - To receive events when the bot is mentioned.
5. Save your changes.

### Install Dependencies

In the project directory, run:

```bash
npm install
```

### Running the Server

#### Development

1. Install `ngrok` from https://ngrok.com/download and start it by running:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL (e.g., https://xxxxxxxxxxxx.ngrok.io) and set it as the "Request URL" in the "Event Subscriptions" page of your Slack app configuration.

In the project directory, create a .env file with the following content:

```bash
SLACK_BOT_TOKEN=<your_slack_bot_token>
SLACK_SIGNING_SECRET=<your_slack_signing_secret>
```

Replace <your_slack_bot_token> and <your_slack_signing_secret> with the appropriate values from your Slack app configuration.

Start the development server by running:

```bash
node app.js
```

#### Production

This section assumes you are using Ubuntu.

Install pm2, a process manager for Node.js:

```
npm install -g pm2
```

Start the server with pm2:

```bash
pm2 start app.js
```

This will start the server in the background and automatically restart it if it crashes.

To ensure the server starts automatically when your system boots up, run:

```bash
pm2 startup systemd
```

Follow the instructions provided by the command to enable the startup script.

Save the current pm2 process list:

```bash
pm2 save
```
