
const { createElement: h } = require('react')

const Svg = props => h('svg', {
  viewBox: '0 0 32 32',
  width: 512,
  height: 512,
  style: {
    display: 'block',
    margin: 0
  }
},
  h('rect', { width: 32, height: 32, fill: '#222' }),
  h('text', {
    textAnchor: 'middle',
    x: 16,
    y: 18,
    fill: '#02ffff',
    style: {
      fontFamily: '"Roboto Mono", monospace',
      fontWeight: 'bold',
      fontSize: 6
    }
  }, '$ repng')
)

module.exports = Svg

