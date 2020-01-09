import React from 'react'
import Loader from 'react-loader-spinner'
import { caribbeanGreen } from 'utils/colors'

export default function Loading ({
  color = caribbeanGreen,
  type = 'TailSpin',
  height = 60,
  width = 60,
  className
}) {
  return <div className={className}>
    <Loader
      type={type}
      color={color}
      height={height}
      width={width} />
  </div>
}
