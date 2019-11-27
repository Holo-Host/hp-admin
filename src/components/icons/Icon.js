import React from 'react'
import './Icon.module.css'

export default function Icon ({
  className,
  children,
  color = '#000000',
  opacity = '1',
  viewBox,
  title = 'Icon',
  style,
  dataTestId
}) {
  const styleName = className ? null : 'icon'
  return <svg viewBox={viewBox} version='1' xmlns='http://www.w3.org/2000/svg' className={className} styleName={styleName} style={style} data-testid={dataTestId}>
    <title>{title}</title>
    <g fill={color} fillOpacity={opacity}>
      {children}
    </g>
  </svg>
}
