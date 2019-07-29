import { string, number, func } from 'prop-types'
import React from 'react'
import { bgImageStyle } from 'utils/index'
import './RoundImage.module.css'

export default function RoundImage ({
  url,
  className,
  size,
  onClick
}) {
  var style = bgImageStyle(url)
  if (size) {
    style = { ...style, width: size, height: size }
  }
  return <div
    style={style}
    styleName='image'
    className={className}
    onClick={onClick}
  />
}

RoundImage.propTypes = {
  url: string,
  className: string,
  square: string,
  size: number,
  onClick: func
}
