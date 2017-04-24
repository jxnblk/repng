
const fs = require('fs')
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

  const key = _file.split('/').slice(-1)
  const defaultFilename = `${key}-<%= date %>-<%= time %>-<%= size %>`

  let wfcss = ''
  if (_options.font) {
    wfcss = getWebfontCss(_options.font)
  }

  const defaultCss = `*{box-sizing:border-box}body{margin:0}${wfcss}`

  const html = `<style>${defaultCss + css}</style>${body}`
  const buffer = new Buffer(html, 'utf8')
  const datauri = new Datauri()
  datauri.format('.html', buffer)
  const data = datauri.content

  const opts = Object.assign({
    width: 1024,
    height: 768,
    // crop: true,
    // ?? scale: 1,
  }, _options, {
    // ?? css: defaultCss + css,
    // ?? filename: filename || defaultFilename,
    show: false
  })

  console.log(opts)

  const nightmare = Nightmare(opts)

  const buff = nightmare
    .goto(data)
    .wait(_options.delay)
  // .screenshot()
    .screenshot(null, {
      x: 0,
      y: 0,
      width: opts.width,
      height: opts.height,
    })
    /*
    */

  return buff.then(res => {
    const file = fs.createWriteStream('out.png')
    file.write(res)
    file.end()
    // console.log(file)
    return res
  })

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

