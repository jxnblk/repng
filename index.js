require('babel-register')({
  plugins: [
    'babel-plugin-transform-runtime'
  ].map(require.resolve),
  presets: [
    'babel-preset-env',
    'babel-preset-stage-0',
    'babel-preset-react'
  ].map(require.resolve)
})

const fs = require('fs')
const puppeteer = require('puppeteer')
const { Readable } = require('stream')
const path = require('path')
const { createElement: h } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const Datauri = require('datauri')

const baseCss = `*{box-sizing:border-box}body{margin:0}`

const getHtmlData = ({ body, baseCss, css }) => {
  const html = `<!DOCTYPE html><style>${baseCss + css}</style>${body}`
  const htmlBuffer = new Buffer(html, 'utf8')
  const datauri = new Datauri()
  datauri.format('.html', htmlBuffer)
  const data = datauri.content
  return data
}

module.exports = async (Component, userOptions = {}) => {
  const {
    props = {},
    css = '',
    filename,
    outDir,
    width,
    height,
    scale = 1
  } = userOptions

  const body = renderToStaticMarkup(h(Component, props))

  const data = getHtmlData({
    body,
    baseCss,
    css
  })

  // todo:
  // - scale
  // - delay
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(data)
  const result = await page.screenshot({
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      width: parseInt(width),
      height: parseInt(height),
    },
    omitBackground: true
  })
  await browser.close()

  const stream = new Readable()
  stream._read = () => {}

  stream.push(result)
  stream.push(null)


  return stream
}
