
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const MemoryFS = require('memory-fs')

const config = {
  entry: [
    'webpack-dev-server/client?http://localhost:8080/',
    'webpack/hot/dev-server',
    path.resolve(__dirname, 'entry.js')
  ],
  resolveLoaders: {
    root: [
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
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            'es2015',
            'stage-0',
            'react'
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}

const createEntry = ({ componentPath, css }) => (`
const React = require('react')
const ReactDOM = require('react-dom')
const Root = require('${componentPath}')

const style = document.createElement('style')
const app = document.createElement('div')
document.body.appendChild(app)
document.head.appendChild(style)

style.innerHTML = \`${css}\`

const App = typeof Root.default === 'function' ? Root.default : Root
ReactDOM.render(React.createElement(App), app)
`)

module.exports = (componentPath, css = '') => {
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

  const compiler = webpack(config)

  compiler.inputFileSystem = mfs
  compiler.resolvers.normal.fileSystem = mfs
  compiler.resolvers.loader.fileSystem = mfs
  compiler.resolvers.context.fileSystem = mfs

  const server = new WebpackDevServer(compiler, {
    contentBase: 'dev/',
    hot: true,
    historyApiFallback: { index: '/dev' }
  })

  server.listen(8080, 'localhost', () => {
    console.log('Listening on port 8080')
  })
}

