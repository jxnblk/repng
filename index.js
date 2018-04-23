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

const baseCSS = `*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif}`

const getHtmlData = ({
  body,
  baseCSS,
  css,
  webfont
}) => {
  const fontCSS = webfont ? getWebfontCSS(webfont) : ''
  const html = `<!DOCTYPE html><style>${baseCSS}${fontCSS}${css}</style>${body}`
  const htmlBuffer = new Buffer(html, 'utf8')
  const datauri = new Datauri()
  datauri.format('.html', htmlBuffer)
  const data = datauri.content
  return data
}

const getWebfontCSS = (fontpath) => {
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

module.exports = async (Component, opts = {}) => {
  const {
    props = {},
    css = '',
    filename,
    outDir,
    width,
    height,
    scale = 1,
    webfont
  } = opts

  const body = renderToStaticMarkup(h(Component, props))

  const data = getHtmlData({
    body,
    baseCSS,
    css,
    webfont
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
