const babel = require('@babel/core')
const globby = require('globby')
const fs = require('fs-extra')
const path = require('path')
const ora = require('ora')
const colors = require('colors/safe')
const log = require('./logging')
const babelrc = require('./babelrc.json')

const defaultEncoding = { encoding: 'utf8' }

function formatName (name) {
  let n = ''
  const spaces = name.split('-')
  for (let i = 0, j = spaces.length, k = j - 1; i < j; ++i) {
    const fragment = spaces[i]
    n += fragment[0].toUpperCase() + fragment.substring(1) + (i === k ? '' : ' ')
  }
  return n
}

function parseOptions (options) {
  if (options) {
    const optionsType = typeof options
    if (optionsType === 'object') {
      return options
    } else if (optionsType === 'string') {
      return JSON.parse(fs.readFileSync(path, defaultEncoding))
    } else {
      log.error(new Error('Parameter "options" must be an object or path.'), 2)
    }
  }
  return babelrc
}

function run (root, name, version, options) {
  name = formatName(name)
  const srcDirectory = path.join(root, 'src')
  const distDirectory = path.join(root, 'dist')
  const loading = ora({
    color: 'cyan',
    text: 'Building ' + name + '...',
    spinner: 'line'
  })
  const transform = (file) => {
    return fs.readFile(path.join(srcDirectory, file), defaultEncoding)
    .then((content) => {
      return fs.outputFile(path.join(distDirectory, file), babel.transform(content, options).code).then(() => file)
    })
  }
  const onComplete = (files) => {
    return new Promise((resolve) => {
      loading.stop()
      log.success(name + ' was built successfully!')
      const len = files.length
      log.print(len + ' file(s) were transformed.')
      let fragment
      let i = -1
      while (++i < 11 && (fragment = files[i])) {
        log.blank('     ' + colors.grey(fragment))
      }
      const left = len - 10
      if (left > 0) {
        log.blank()
        log.blank(colors.grey('     ... and other ' + (len - 10) + ' more.'))
      }
      resolve(files)
    })
  }
  const onError = (err) => {
    loading.stop()
    log.warning('An error occurred while building ' + name + '.')
    log.error(err)
    log.blank()
  }
  log.blank()
  log.info(name + ' ' + colors.grey(version === undefined ? '[version not found]' : (isNaN(version[0]) ? ('[' + version + ']') : ('v' + version))))
  log.blank()
  loading.start()
  return fs.remove(distDirectory).then(() => globby('**/*.js', { cwd: srcDirectory })).then((files) => Promise.all(files.map(transform)).then(onComplete).catch(onError))
}

module.exports = function (root, options) {
  if (!root) log.error(new Error('Parameter "root" is required.'), 1)
  options = parseOptions(options)
  const pkg = require(path.join(root, 'package.json'))
  if (!pkg) log.error(new Error('File "package.json" was not found.'), 1)
  return run(root, pkg.name, pkg.version, options)
}
