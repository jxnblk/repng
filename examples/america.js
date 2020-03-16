
import React from 'react'

const stripes = Array.from({ length: 13 })
  .map((n, i) => (
    <rect
      key={i}
      width={48}
      height={1/13 * 32}
      y={1 / 13 * i * 32}
      fill={i % 2 ? 'white' : 'red'}
    />
  ))

const America = () => (
  <svg
    viewBox='0 0 48 32'
    width='384'
    height='256'>
    {stripes}
    <rect width='20'
      height={7 / 13 * 32}
      fill='blue'
    />
  </svg>
)

export default America

