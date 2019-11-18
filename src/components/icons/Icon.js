import React from 'react'
import './Icon.module.css'

export default function Icon ({
  className,
  children,
  color = '#000000',
  viewBox = '0 0 32 32',
  title = 'Icon',
  dataTestId
}) {
  const styleName = className ? null : 'icon'
  return <svg viewBox={viewBox} version='1' xmlns='http://www.w3.org/2000/svg' className={className} styleName={styleName} data-testid={dataTestId}>
    <title>{title}</title>
    <g fill={color}>
      {children}
    </g>
  </svg>
}
