require('@babel/register')({
  plugins: [
  ].map(require.resolve),
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ].map(require.resolve)
})

const fs = require('fs')
const { chromium, firefox, webkit } = require('playwright')
const { Readable } = require('stream')
const path = require('path')
const { createElement: h } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const Datauri = require('datauri')
const resolveCWD = require('resolve-cwd')

const baseCSS = `*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif}`

const getHtmlData = ({
  body,
  baseCSS,
  css,
  styles,
  webfont
}) => {
  const fontCSS = webfont ? getWebfontCSS(webfont) : ''
  const html = `<!DOCTYPE html>
    <head>
    <meta charset="utf-8"><style>${baseCSS}${fontCSS}${css}</style>
    ${styles}
    </head>
    <body style="display:inline-block">
    ${body}`
  return html
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
    css = '',
    filename,
    outDir,
    webfont,
    type = 'png', // jpeg, png and pdf are allowed
  } = opts

  const props = Object.assign({
    width: opts.width,
    height: opts.height,
  }, opts.props)

  let styles = ''
  const el = h(Component, props)
  const body = renderToStaticMarkup(el)

  const html = getHtmlData({
    body,
    baseCSS,
    css,
    styles,
    webfont
  })

  const browser = await chromium.launch(opts.launcher)
  const page = await browser.newPage()
  await page.setContent(html)

  let rect = {}
  if (!opts.width && !opts.height) {
    const bodyEl = await page.$('body')
    rect = await bodyEl.boxModel()
  }
  const width = parseInt(opts.width || rect.width)
  const height = parseInt(opts.height || rect.height)

  await page.setViewportSize({
    width,
    height,
  })

  let result
  if (type === 'pdf') {
    // https://playwright.dev/docs/api/class-page#page-pdf
    result = await page.pdf({
      width,
      height,
    })
  } else {
    // https://playwright.dev/docs/api/class-page#page-screenshot
    result = await page.screenshot({
      type: type,
      clip: {
        x: 0,
        y: 0,
        width,
        height,
      },
      omitBackground: true
    })
  }

  await browser.close()

  return result
}
