const fs = require('fs')

const SoundEffects = (target, context, chatMsg, client, thisSocket) => {
    if (chatMsg.includes('!iamjeant')) {
        const files = fs.readdirSync('./src/assets')
        const file = files[Math.floor(Math.random() * files.length)]

        // send a web socket push to our website with a random sound clip
        if (thisSocket) thisSocket.send(`/audio/${file}`)

        console.log(`* Executed ${chatMsg} command`);
    }
}

module.exports = SoundEffects