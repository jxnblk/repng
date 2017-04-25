
// JSX and ES2015 are supported as well

import React from 'react'

const Svg = props => (
  <svg
    viewBox='0 0 32 32'
    width={512}
    height={512}
    style={{
      display: 'block',
      margin: 0
    }}>
    <rect
      width={32}
      height={32}
      rx={1/4}
      rx={1/4}
      fill='#222' />
    <text
      textAnchor='middle'
      x={16}
      y={18}
      fill='#02ffff'
      style={{
        fontFamily: '"RobotoMono-Regular", serif',
        fontWeight: 400,
        fontSize: 6
      }}>
      $ repng
    </text>
  </svg>
)

export default Svg

