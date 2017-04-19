
const test = require('ava')
const React = require('react')
const repng = require('./index')

const Root = () => (
  <h1>Hello</h1>
)

test('is a function', t => {
  t.is(typeof repng, 'function')
})

test('returns streams', async t => {
  const streams = await repng(Root, {
    filename: 'test'
  })
  t.is(typeof streams, 'object')
  t.is(streams.length, 1)
  t.is(streams[0].filename, 'test.png')
})

