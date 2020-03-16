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
    -p --props      Props in JSON format (or path to JSON file) to pass to the React component
    -t --type       Type of ouptut (png default) (pdf, jpeg or png)
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
    props: {
      type: 'string',
      alias: 'p'
    },
    css: {
      type: 'string'
    },
    type: {
      type: 'string',
      alias: 't'
    },
    puppeteer: {
      type: 'string',
    },
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
}, cli.flags)
const Component = require(filepath).default || require(filepath)

opts.css = absolute(opts.css)
opts.outDir = absolute(opts.outDir)

if (opts.css) {
  opts.css = fs.readFileSync(opts.css, 'utf8')
}

if (opts.props) {
  const stat = fs.statSync(opts.props)
  if (stat.isFile()) {
    const req = path.join(process.cwd(), opts.props)
    try {
      opts.props = require(req)
    } catch (e) {
      console.log(e)
      opts.props = {}
    }
  } else {
    opts.props = JSON.parse(opts.props)
  }
}

if (opts.puppeteer) opts.puppeteer = JSON.parse(opts.puppeteer)

const run = async () => {
  try {
    const image = await render(Component, opts)
    const { date, time } = getDateTime()
    const outFile = opts.filename
      ? opts.filename
      : `${name}-${date}-${time}.png`
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
