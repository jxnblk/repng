
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
    css,
    crop = true,
    scale,
    delay,
    outDir,
  } = options

  const html = renderToStaticMarkup(h(Root, props))

  const datauri = new Datauri()
  const buffer = new Buffer(html, 'utf8')

  datauri.format('.html', buffer)
  const data = datauri.content

  const key = file.split('/').reduce((a, b) => b)
  const filename = `${key}-<%= date %>-<%= time %>-<%= size %>`

  const pageres = new Pageres({
    css,
    crop,
    width,
    height,
    scale,
    delay,
    filename
  })

  const result = pageres
    .src(data, [`${width}x${height}`])
    .dest(outDir)
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

