#!/usr/bin/env node

const path = require('path')
const meow = require('meow')
const render = require('..')

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
`, {
  alias: {
    c: 'css',
    p: 'props',
    w: 'width',
    h: 'height',
    s: 'scale',
    d: 'delay',
    o: 'outDir'
  }
})

const file = cli.input[0]

if (!file) {
  console.warn('No Root component specified')
}

const Root = require(path.resolve(process.cwd(), file))

const Comp = typeof Root.default ==='function'
  ? Root.default
  : Root

if (!Comp) {
  console.warn('Could not find file: ', file)
}

const options = Object.assign({
  file,
  outDir: process.cwd()
}, cli.flags)

render(Comp, options)

