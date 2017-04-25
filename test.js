
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
      width,
      height,
      // size: 2
    }
  })

  t.true(isStream(result))
})

