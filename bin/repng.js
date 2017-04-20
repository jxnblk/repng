#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const meow = require('meow')
const ora = require('ora')
const render = require('..')
const devServer = require('../dev-server')

const cli = meow(`
  Usage
    $ repng <Root-component>

  Options
    -c --css        CSS file to include

    -p --props      Props in JSON format to pass to the React component

    -w --width      Width of image

    -h --height     Height of image

    -C --crop       Crop image to specified height

    -s --scale      Scale image

    -d --delay      Delay in seconds before rendering image

    -o --out-dir    Directory to save file to

    -f --filename   Name for rendered image

    -F --font       Path to font to include as a webfont

    -D --dev        Runs a webpack-dev-server

    -P --port       Port to run the dev server on (default 8080)
`, {
  alias: {
    c: 'css',
    p: 'props',
    w: 'width',
    h: 'height',
    C: 'crop',
    s: 'scale',
    d: 'delay',
    o: 'outDir',
    f: 'filename',
    F: 'font',
    D: 'dev',
    P: 'port'
  }
})

const filepath = cli.input[0]

global.spinner = ora(`Reading ${filepath}`).start()

if (!filepath) {
  spinner.fail('No Root component specified')
  return
}

const componentPath = path.resolve(process.cwd(), filepath)
const Root = require(componentPath)

const Comp = typeof Root.default ==='function'
  ? Root.default
  : Root

if (!Comp) {
  spinner.fail(`Could not file file: ${componentPath}`)
  return
}

const cssPath = cli.flags.css ? path.join(process.cwd(), cli.flags.css) : null
let css
if (cli.flags.css && fs.existsSync(cssPath)) {
  spinner.text = `Importing CSS: ${cssPath}`
  css = fs.readFileSync(cssPath, 'utf8').replace(/\n/g, '')
}

if (cli.flags.props) {
  try {
    spinner.text = (`Parsing JSON props`)
    cli.flags.props = JSON.parse(cli.flags.props)
  } catch (e) {
    spinner.text = (`Could not parse props (${cli.flags.props})`)
  }
}

const options = Object.assign({
  _file: componentPath,
  outDir: process.cwd()
}, cli.flags, {
  css
})

if (cli.flags.dev) {
  spinner.info(`Starting dev server`)
  devServer(Object.assign({ componentPath }, options))
  return
}

render(Comp, options)

spinner.succeed(`Rendered component to PNG`)

