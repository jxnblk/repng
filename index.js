
const { createElement: h } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const Pageres = require('pageres')
const Datauri = require('datauri')

require('babel-register')({
  presets: [
    'es2015',
    'stage-0',
    'react'
  ]
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

  pageres
    .src(data, [`${width}x${height}`])
    .dest(outDir)
    .run()
    .then(streams => {
      console.log('Saved file to: ', outDir)
    })

  pageres.on('warning', () => {
    return 'Error'
  })
}

