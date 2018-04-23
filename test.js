const test = require('ava')
const React = require('react')
const isStream = require('is-stream')
const repng = require('./index')

const Grid = require('./examples/Grid').default

test('is a function', t => {
  t.is(typeof repng, 'function')
})

test('returns a stream', async t => {
  const width = 128
  const height = width

  const result = await repng(Grid, {
    width,
    height,
    props: {
      width,
      height,
    }
  })

  t.true(isStream(result))
})

