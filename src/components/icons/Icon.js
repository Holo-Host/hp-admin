import React from 'react'
import './Icon.module.css'

export default function Icon ({
  className,
  children,
  color = '#000000',
  viewBox,
  title = 'Icon',
  style
}) {
  const styleName = className ? null : 'icon'
  return <svg viewBox={viewBox} version='1' xmlns='http://www.w3.org/2000/svg' className={className} styleName={styleName} style={style}>
    <title>{title}</title>
    <g fill={color}>
      {children}
    </g>
  </svg>
}
