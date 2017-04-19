
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const MemoryFS = require('memory-fs')

const config = ({ port }) => ({
  entry: [
    `webpack-dev-server/client?http://localhost:${port}`,
    'webpack/hot/dev-server',
    path.resolve(__dirname, 'entry.js'),
  ],
  resolveLoader: {
    modules: [
      __dirname,
      path.resolve(__dirname, 'node_modules'),
      path.resolve(process.cwd(), 'node_modules'),
    ]
  },
  output: {
    path: __dirname,
    filename: 'dev.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
        options: {
          plugins: [
            'babel-plugin-transform-async-to-generator',
            'babel-plugin-transform-runtime'
          ].map(require.resolve),
          presets: [
            'babel-preset-env',
            'babel-preset-stage-0',
            'babel-preset-react',
          ].map(require.resolve)
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})

const reactPath = require.resolve('react')
const reactDomPath = require.resolve('react-dom')

const createEntry = ({ componentPath, css }) => (`
const React = require('${reactPath}')
const ReactDOM = require('${reactDomPath}')
const Root = require('${componentPath}')

const style = document.createElement('style')
const app = document.createElement('div')
document.body.appendChild(app)
document.head.appendChild(style)

style.innerHTML = \`*{box-sizing:border-box}body{margin:0}${css}\`

const App = typeof Root.default === 'function' ? Root.default : Root
ReactDOM.render(React.createElement(App), app)
`)

module.exports = (opts) => {
  const {
    componentPath,
    css = '',
    port = 8080
  } = opts
  const entry = createEntry({ componentPath, css })

  const mfs = new MemoryFS()
  const statOrig = mfs.stat.bind(mfs)
  const readFileOrig = mfs.readFile.bind(mfs)

  mfs.stat = function (_path, cb) {
    statOrig(_path, function(err, result) {
      if (err) {
        return fs.stat(path.resolve(__dirname, _path), cb)
      } else {
        return cb(err, result)
      }
    })
  }

  mfs.readFile = function (_path, cb) {
    readFileOrig(_path, function (err, result) {
      if (err) {
        return fs.readFile(path.resolve(__dirname, _path), cb)
      } else {
        return cb(err, result)
      }
    })
  }

  mfs.mkdirpSync(path.join(__dirname, '/'))
  mfs.writeFileSync(path.join(__dirname, 'entry.js'), entry)

  const compiler = webpack(config({ port }))

  compiler.inputFileSystem = mfs
  compiler.resolvers.normal.fileSystem = mfs
  compiler.resolvers.loader.fileSystem = mfs
  compiler.resolvers.context.fileSystem = mfs

  const server = new WebpackDevServer(compiler, {
    contentBase: 'dev/',
    hot: true,
    historyApiFallback: { index: '/dev' }
  })

  server.listen(port, 'localhost', () => {
    console.log(`Listening on port ${port}`)
  })
}

