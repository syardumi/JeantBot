const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const config = require('./.env.js');

webpush.setVapidDetails(config.vapid.subject, config.vapid.publicKey, config.vapid.privateKey);

const SoundEffects = async (target, context, chatMsg, client, db) => {
    if (chatMsg.includes('!iamjeant')) {
        const files = fs.readdirSync(path.join(__filename, '../assets'));
        const file = files[Math.floor(Math.random() * files.length)];

        // send a broadcast push to all clients
        const msg = JSON.stringify({
            audioSrc: `/audio/${file}`
        });
        const result = await db.all('SELECT * FROM push_subscriptions');
        if (result && result.length) {
            const pushPromises = []
            result.forEach((record) => {
                pushPromises.push(webpush.sendNotification({
                    endpoint: record.endpoint,
                    keys: {
                        p256dh: record.keys_p256dh,
                        auth: record.keys_auth
                    }
                }, msg).catch(async (e) => {
                    await db.run('DELETE FROM push_subscriptions WHERE endpoint = ?', e.endpoint)
                }));
            });
            await Promise.all(pushPromises)
        }

        console.log(`* Executed ${chatMsg} command. Sent '${msg}'`);
    }
}

module.exports = SoundEffects