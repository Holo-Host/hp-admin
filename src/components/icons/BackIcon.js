import React from 'react'
import Icon from './Icon'

export const title = 'Back Icon'
const path = 'M145 239L361 23c5-5 5-14 0-19s-14-5-19 0L116 229c-5 5-5 14 0 19l226 225c2 3 6 4 9 4s7-1 10-4c5-5 5-14 0-19L145 239z'
const viewBox = '0 0 477 477'

export default function BackIcon ({ className, color = '#000000' }) {
  return <Icon viewBox={viewBox}
    color={color}
    title={title}
    className={className} >
    <path d={path} />
  </Icon>
}
