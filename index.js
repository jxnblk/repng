
const fs = require('fs')
const { Readable } = require('stream')
const path = require('path')
const { createElement: h } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const Datauri = require('datauri')
const Nightmare = require('nightmare')

const nm = Nightmare({
  show: false,
  width: 512,
  height: 512,
  enableLargerThanScreen: true,
  frame: false,
  switches: {
    'force-device-scale-factor': 1
  },
})

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
    scale = 1
  } = _options

  const body = renderToStaticMarkup(h(Root, props))

  // todo: move to createCss function
  let wfcss = ''
  if (_options.font) {
    wfcss = getWebfontCss(_options.font)
  }

  const data = getHtmlData({
    body,
    baseCss,
    css: wfcss + css
  })

  const opts = Object.assign({
    show: false,
    width: 512,
    height: 512,
    enableLargerThanScreen: true,
    frame: false,
    switches: {
      'force-device-scale-factor': 1
    },
    webPreferences: {
      zoomFactor: scale
    },
  }, _options)

  const { width, height } = opts

  // const nightmare = Nightmare(opts)

  const result = nm
    .goto(data)
    .wait(_options.delay)
    .screenshot(null, {
      x: 0,
      y: 0,
      width: width * scale,
      height: height * scale
    })

  const stream = new Readable()
  // wut?
  stream._read = () => {}

  result.then(buffer => {
    stream.push(buffer)
    stream.push(null)
  })

  return stream
}

const baseCss = `*{box-sizing:border-box}body{margin:0}`

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

const getHtmlData = ({ body, baseCss, css }) => {
  const html = `<!DOCTYPE html><style>${baseCss + css}</style>${body}`
  const htmlBuffer = new Buffer(html, 'utf8')
  const datauri = new Datauri()
  datauri.format('.html', htmlBuffer)
  const data = datauri.content
  return data
}

