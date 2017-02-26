
const { createElement: h } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const Pageres = require('pageres')
const Datauri = require('datauri')

require('babel-register')({
  presets: [
    'babel-preset-es2015',
    'babel-preset-stage-0',
    'babel-preset-react'
  ].map(require.resolve)
})

module.exports = (Root, options = {}) => {
  const {
    file = 'repng',
    props,
    width = 1024,
    height = 768,
    css = '',
    crop = true,
    scale = 1,
    delay,
    outDir,
    filename,
  } = options

  const html = renderToStaticMarkup(h(Root, props))

  const datauri = new Datauri()
  const buffer = new Buffer(html, 'utf8')

  datauri.format('.html', buffer)
  const data = datauri.content

  const key = file.split('/').reduce((a, b) => b)
  const defaultFilename = `${key}-<%= date %>-<%= time %>-<%= size %>`

  const defaultCss = 'body{margin:0}'

  const pageres = new Pageres({
    css: defaultCss + css,
    crop,
    width,
    height,
    scale,
    delay,
    filename: filename || defaultFilename
  })

  const result = outDir
    ? pageres
      .src(data, [`${width}x${height}`])
      .dest(outDir)
      .run()
    : pageres
      .src(data, [`${width}x${height}`])
      .run()

  result.then(streams => {
    if (outDir) {
      console.log('Saved file to: ', outDir)
    }
  })

  pageres.on('warning', () => {
    return 'Error'
  })

  return result
}

