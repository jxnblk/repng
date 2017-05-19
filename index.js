
const path = require('path')
const { createElement: h } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const Pageres = require('pageres')
const Datauri = require('datauri')

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

  const html = renderToStaticMarkup(h(Root, props))

  const datauri = new Datauri()
  const buffer = new Buffer(html, 'utf8')

  datauri.format('.html', buffer)
  const data = datauri.content

  const key = _file.split('/').slice(-1)
  const defaultFilename = `${key}-<%= date %>-<%= time %>-<%= size %>`

  let wfcss = ''
  if (_options.font) {
    wfcss = getWebfontCss(_options.font)
  }

  // Using !important to override screenshot-stream's default color
  // https://github.com/kevva/screenshot-stream/blob/master/stream.js#L83-L85
  const defaultCss = `*{box-sizing:border-box}body{margin:0;background-color:transparent!important}${wfcss}`

  const opts = Object.assign({
    width: 1024,
    height: 768,
    crop: true,
    scale: 1,
  }, _options, {
    css: defaultCss + css,
    filename: filename || defaultFilename
  })

  const pageres = new Pageres(opts)
  const sizes = opts.sizes === undefined ? [`${opts.width}x${opts.height}`] : opts.sizes;
  const result = outDir
    ? pageres
      .src(data, sizes)
      .dest(outDir)
      .run()
    : pageres
      .src(data, [`${opts.width}x${opts.height}`])
      .run()

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

  pageres.on('warning', () => {
    return 'Error'
  })

  return result
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

