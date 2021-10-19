const tmi = require('tmi.js');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const SoundEffects = require('./soundEffects');
const config = require('./.env.js');

open({
  filename: config.dbLocation,
  driver: sqlite3.cached.Database
}).then((db) => {

  // ------ START HTTPS SERVER
  const app = express();
  app.use(cors());
  app.use(express.json())

  const httpsServer = https.createServer({
    key: fs.readFileSync('/Users/steveyardumian/Downloads/push_jeantbot_site.key'), // fs.readFileSync('/home/syardumi/ssl/push_jeantbot_site.key'),
    cert: fs.readFileSync('/Users/steveyardumian/Downloads/push_jeantbot_site.crt') // fs.readFileSync('/home/syardumi/ssl/push_jeantbot_site.crt'),
  }, app);

  app.post('/notifications/subscribe', async (req, res) => {
    const subscription = req.body
  
    // save user to DB
    let result = await db.get('SELECT * FROM push_subscriptions WHERE endpoint = ?', subscription.endpoint)
    if (!result) {
      await db.run(
        'INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth) VALUES (?, ?, ?)',
        subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth
      )
    }
  
    res.status(200).json({'success': true})
  });

  httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });

  // app.listen(9000, () => console.log('The server has been started on the port 9000'))

  // ------ START TWITCH LISTEN
  // Called every time a message comes in
  async function onMessageHandler (target, context, msg, self) {
    if (self) return // Ignore messages from the bot
    if (context["message-type"] !== 'chat') return // ignore messages that are not chat type

    // Remove whitespace from edges of chat message
    const chatMsg = msg.trim().toLowerCase();

    // console.log(context)

    if (config.modules.soundEffects) {
      await SoundEffects(target, context, chatMsg, client, db)
    }
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  // Create a client with our options
  const client = new tmi.client({
    options: {
      debug: true
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
})