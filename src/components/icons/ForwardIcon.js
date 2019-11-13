import React from 'react'
import Icon from './Icon'

export const title = 'Forward Icon'
const path = 'M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z'
const viewBox = '0 0 24 24'

export default function ForwardIcon ({ className, color = '#000000' }) {
  return <Icon viewBox={viewBox}
    color={color}
    title={title}
    className={className} >
    <path d={path} />
  </Icon>
}
