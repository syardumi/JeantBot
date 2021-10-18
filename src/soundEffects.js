const fs = require('fs')
const path = require('path')

const SoundEffects = (target, context, chatMsg, client, thisSocket) => {
    if (chatMsg.includes('!iamjeant')) {
        const files = fs.readdirSync(path.join(__filename, '../assets'))
        const file = files[Math.floor(Math.random() * files.length)]

        // send a web socket push to our website with a random sound clip
        const msg = `{ "audioSrc": "/audio/${file}" }`
        if (thisSocket) thisSocket.send(msg)

        console.log(`* Executed ${chatMsg} command. Sent '${msg}'`);
    }
}

module.exports = SoundEffects