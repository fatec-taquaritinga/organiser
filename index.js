const checkVersion = require('version-notifier')

checkVersion(__dirname)
module.exports = require('./src')
