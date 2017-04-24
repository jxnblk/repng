
const test = require('ava')
const React = require('react')
const repng = require('./index')

const Icon = require('./example/Alt')
const Root = () => (
  <h1>Hello</h1>
)

test('is a function', t => {
  t.is(typeof repng, 'function')
})

test('returns a buffer', async t => {
  const result = await repng(Icon.default, {
    width: 512,
    height: 512,
    delay: 10,
    filename: 'test',
    // css: 'body{background-color:tomato}'
  })
  // console.log(result)
  t.true(Buffer.isBuffer(result))
})

