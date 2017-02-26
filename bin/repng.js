#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const meow = require('meow')
const chalk = require('chalk')
const { Spinner } = require('cli-spinner')
const render = require('..')
const devServer = require('../dev-server')

// figure out no-crop?
const cli = meow(`
  Usage
    $ repng <Root-component>

  Options
    -c --css        CSS file to include

    -p --props      Props to pass to the React component

    -w --width      Width of image

    -h --height     Height of image

    --crop          Crop image to specified height

    -s --scale      Scale image

    -d --delay      Delay in seconds before rendering image

    -o --out-dir    Directory to save file to

    -f --filename   Name for rendered image

    -D --dev        Runs a webpack-dev-server
`, {
  alias: {
    c: 'css',
    p: 'props',
    w: 'width',
    h: 'height',
    s: 'scale',
    d: 'delay',
    o: 'outDir',
    f: 'filename',
    D: 'dev'
  }
})

const file = cli.input[0]

if (!file) {
  console.warn('No Root component specified')
}

const componentPath = path.resolve(process.cwd(), file)
const Root = require(componentPath)

const Comp = typeof Root.default ==='function'
  ? Root.default
  : Root

if (!Comp) {
  console.warn('Could not find file: ', file)
}

const cssPath = cli.flags.css ? path.join(process.cwd(), cli.flags.css) : null
console.log('css path', cssPath)
let css
if (cli.flags.css && fs.existsSync(cssPath)) {
  css = fs.readFileSync(cssPath, 'utf8').replace(/\n/g, '')
}

if (cli.flags.dev) {
  devServer(componentPath, css)
  return
}

const options = Object.assign({
  file,
  outDir: process.cwd()
}, cli.flags, {
  css
})

render(Comp, options)

