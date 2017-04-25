
import React from 'react'

const Grid = ({
  width = 256,
  height = 256,
  size = 2
}) => {
  const rects = Array.from({ length: 32 / size })
    .map((n, y) => (
      Array.from({ length: 32 / size })
        .map((n, x) => (
          <rect
            width={size}
            height={size}
            fill={(x % 2 === (y % 2 ? 1 : 0)) ? 'black' : 'transparent'}
            x={size * x}
            y={size * y}
          />
        ))
    ))

  return (
    <svg
      viewBox='0 0 32 32'
      width={width}
      height={height}>
      {rects}
    </svg>
  )
}

export default Grid

