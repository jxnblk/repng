
const fs = require('fs')
const { Readable } = require('stream')
const path = require('path')
const { createElement: h } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const Datauri = require('datauri')

const Nightmare = require('nightmare')

require('babel-register')({
  plugins: [
    'babel-plugin-transform-async-to-generator',
    'babel-plugin-transform-runtime'
  ].map(require.resolve),
  presets: [
    'babel-preset-env',
    'babel-preset-stage-0',
    'babel-preset-react'
  ].map(require.resolve)
})

module.exports = (Root, _options = {}) => {
  const {
    _file = 'repng',
    props,
    css = '',
    filename,
    outDir,
  } = _options

  const body = renderToStaticMarkup(h(Root, props))

  // Todo: handle this?
  const key = _file.split('/').slice(-1)
  const defaultFilename = `${key}-<%= date %>-<%= time %>-<%= size %>`

  // todo: move to createCss function
  let wfcss = ''
  if (_options.font) {
    wfcss = getWebfontCss(_options.font)
  }

  const defaultCss = `*{box-sizing:border-box}body{margin:0}${wfcss}`

  // todo: createHtml()
  const html = `<!DOCTYPE html><style>${defaultCss + css}</style>${body}`
  const htmlBuffer = new Buffer(html, 'utf8')
  const datauri = new Datauri()
  datauri.format('.html', htmlBuffer)
  const data = datauri.content

  const opts = Object.assign({
    show: false,
    width: 512,
    height: 512,
    enableLargerThanScreen: true,
    frame: false,
    webPreferences: {
      zoomFactor: _options.scale
    }
  }, _options)

  const nightmare = Nightmare(opts)

  const result = nightmare
    .goto(data)
    .wait(_options.delay)
    .screenshot(null, {
      x: 0,
      y: 0,
      width: opts.width,
      height: opts.height,
    })

  return result.then(buffer => {
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)
    // const stream = fs.createReadStream(buffer)

    const file = fs.createWriteStream('out2.png')
    file.write(buffer)
    file.end()

    // console.log('stream', stream)
    if (outDir) {
      /*
      // console.log(file)
      */
    }
    return stream
    // return buff
  })

  // return result

  /*
  result.then(streams => {
    if (outDir) {
      const msg = 'Saved file to ' + outDir
      if (global.spinner) {
        spinner.succeed(msg)
      } else {
        console.log(msg)
      }
    } else {
      return streams
    }
  })
  */
}

const getWebfontCss = (fontpath) => {
  const { content } = new Datauri(fontpath)
  const [ name, ext ] = fontpath.split('/').slice(-1)[0].split('.')
  const css = (`@font-face {
  font-family: '${name}';
  font-style: normal;
  font-weight: 400;
  src: url(${content});
}`)
  return css
}

