const SoundEffects = require('./soundEffects');
const config = require('./.env.js')

const tmi = require('tmi.js');

const ws = require('ws')
const wss = new ws.WebSocketServer({ port: 8888 });
let thisSocket

wss.on('connection', function connection(socket) {
  thisSocket = socket
});

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) return // Ignore messages from the bot
  if (context["message-type"] !== 'chat') return // ignore messages that are not chat type

  // Remove whitespace from edges of chat message
  const chatMsg = msg.trim().toLowerCase();

  // console.log(context)

  if (config.modules.soundEffects) {
    SoundEffects(target, context, chatMsg, client, thisSocket)
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// Create a client with our options
const client = new tmi.client({
  options: {
    debug: false
  },
  connection: {
      reconnect: true,
      secure: true
  },
  identity: {
    username: config.oauthUsername,
    password: config.oauthPassword
  },
  channels: config.channels
});

// // Register our event handlers (defined below)
client.on('message', onMessageHandler);

client.on('connected', onConnectedHandler);

// // Connect to Twitch:
client.connect();