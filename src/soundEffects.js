const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const addMilliseconds = require('date-fns/addMilliseconds')

const config = require('./.env.js');
webpush.setVapidDetails(config.vapid.subject, config.vapid.publicKey, config.vapid.privateKey);

const COOLDOWN_IN_MS = process.argv && process.argv.length > 2 ? process.argv[2].split('=')[1] * 1000 : 30000
let lastRunDateTimestamp

const SoundEffects = async (target, context, chatMsg, client, db) => {
    if (chatMsg.includes('!iamjeant')) {
        // ONLY VIPS AND MODS CAN RUN THIS CMD
        const isVipOrModUser = (context['badges'] && context['badges']['broadcaster'] === '1') || (context['badges'] && context['badges']['vip'] === '1') || context['mod'] === true || context['username'] === 'thefinaledge'
        if (!isVipOrModUser) return

        // CMD CAN ONLY RUN AFTER COOLDOWN (via argument or defaults to 30s)
        if (lastRunDateTimestamp && Date.now() < addMilliseconds(new Date(lastRunDateTimestamp), COOLDOWN_IN_MS)) {
          const timeLeft = (addMilliseconds(new Date(lastRunDateTimestamp), COOLDOWN_IN_MS) - Date.now()) / 1000
          console.log(`tried command too soon; ${timeLeft} sec left`)
          return
        }
        lastRunDateTimestamp = Date.now()

        // get a random audio file
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
