import React from 'react'
import Icon from './Icon'

export const title = 'Menu Icon'
const path = 'M491 235H21a21 21 0 1 0 0 42h470a21 21 0 1 0 0-42zM491 78H21a21 21 0 0 0 0 42h470a21 21 0 1 0 0-42zM491 392H21a21 21 0 1 0 0 42h470a21 21 0 1 0 0-42z'
const viewBox = '0 0 512 512'

export default function MenuIcon ({ className, color = '#000000' }) {
  return <Icon viewBox={viewBox}
    color={color}
    title={title}
    className={className} >
    <path d={path} />
  </Icon>
}
