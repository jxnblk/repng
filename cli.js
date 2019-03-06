#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const meow = require('meow')
const ora = require('ora')
const render = require('./index')
const readPkg = require('read-pkg-up')

const absolute = (file = '') => !file || path.isAbsolute(file)
  ? file
  : path.join(process.cwd(), file)

const getDateTime = () => {
  const now = new Date()
  const Y = now.getFullYear()
  const M = now.getMonth()
  const d = now.getDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  return {
    date: [ Y, M, d ].join('-'),
    time: [ h, m, s ].join('.')
  }
}

const cli = meow(`
  Usage
    $ repng <ReactComponent>

  Options
    -d --out-dir    Directory to save file to
    -f --filename   Specify a custom output filename
    -w --width      Width of image
    -h --height     Height of image
    -p --props      Props in JSON format to pass to the React component
    --css           Path to CSS file to include
    --webfont       Path to custom webfont for rendering
`, {
  flags: {
    outDir: {
      type: 'string',
      alias: 'd'
    },
    filename: {
      type: 'string',
      alias: 'f'
    },
    width: {
      type: 'string',
      alias: 'w'
    },
    height: {
      type: 'string',
      alias: 'h'
    },
    scale: {
      type: 'string',
      alias: 's'
    },
    delay: {
      type: 'string',
      alias: 'D'
    },
    props: {
      type: 'string',
      alias: 'p'
    },
    css: {
      type: 'string'
    },
    cssLibrary: {
      type: 'string'
    }
  }
})

const [ file ] = cli.input

const spinner = ora(`Rendering ${file}`).start()

const name = path.basename(file, path.extname(file))
const filepath = absolute(file)
const { pkg } = readPkg.sync({ cwd: filepath })
const opts = Object.assign({
  outDir: process.cwd(),
  filepath,
  width: 512,
  height: 512,
}, cli.flags)
const Component = require(filepath).default || require(filepath)

opts.css = absolute(opts.css)
opts.outDir = absolute(opts.outDir)

if (opts.css) {
  opts.css = fs.readFileSync(opts.css, 'utf8')
}

if (opts.props) {
  opts.props = JSON.parse(opts.props)
}

if (pkg && pkg.dependencies) {
  if (pkg.dependencies['styled-components']) {
    opts.cssLibrary = 'styled-components'
  } else if (pkg.dependencies['emotion']) {
    opts.cssLibrary = 'emotion'
  }
}

const run = async () => {
  try {
    const image = await render(Component, opts)
    const { date, time } = getDateTime()
    const outFile = opts.filename
      ? opts.filename
      : `${name}-${date}-${time}-${opts.width}x${opts.height}.png`
    const outPath = path.join(opts.outDir, outFile)

    const file = fs.createWriteStream(outPath)

    file.on('finish', () => {
      spinner.succeed(`File saved to ${outPath}`)
      process.exit()
    })

    file.on('error', err => {
      spinner.fail('Error: ' + err)
    })

    spinner.info('Saving file')

    file.write(image)
    file.end()
  } catch (err) {
    spinner.fail(`Error: ${err}`)
    process.exit(1)
  }
}

run()
