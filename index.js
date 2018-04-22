require('babel-register')({
  // plugins: [
  //   'babel-plugin-transform-async-to-generator',
  //   'babel-plugin-transform-runtime'
  // ].map(require.resolve),
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

const baseCss = `*{box-sizing:border-box}body{margin:0}`

const getHtmlData = ({ body, baseCss, css }) => {
  const html = `<!DOCTYPE html><style>${baseCss + css}</style>${body}`
  const htmlBuffer = new Buffer(html, 'utf8')
  const datauri = new Datauri()
  datauri.format('.html', htmlBuffer)
  const data = datauri.content
  return data
}


  // nightmare specific options
  /*
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
  }, userOptions)
  // const { width, height } = opts
  // const nightmare = Nightmare(opts)

  const result = nightmare
    .goto(data)
    .wait(_options.delay)
    .screenshot(null, {
      x: 0,
      y: 0,
      width: width * scale,
      height: height * scale
    })
  */
