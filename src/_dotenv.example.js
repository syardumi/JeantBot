const config = {
  dbLocation: '/home/user/somebot.db',
  oauthUsername: 'somebot',
  oauthPassword: 'oauth:someencryptedkeyhere',
  channels: [
    'atwitchchannel'
  ],
  modules: {
    amongUs: false,
    requestTokens: true,
    songs: true,
    watermelons: true
  }
}

module.exports = config
