
const fs = require('fs')
const test = require('ava')
const React = require('react')
const isStream = require('is-stream')
const repng = require('./index')

const Icon = require('./example/Alt')
const Grid = require('./example/Grid')
const Root = () => (
  <h1>Hello</h1>
)

test('is a function', t => {
  t.is(typeof repng, 'function')
})

test('returns a stream', async t => {
  const width = 128
  const height = width

  const result = await repng(Grid.default, {
    width,
    height,
    delay: 100,
    filename: 'test',
    props: {
      // width: 24,
      // height,
      // size: 2
    }
    // css: 'body{background-color:tomato}'
  })

  const file = fs.createWriteStream('_test.png')
  result.pipe(file)
  // file.end()
  t.true(isStream(result))
})

