import React from 'react'
import Icon from './Icon'

export const title = 'Menu Icon'

export default function MenuIcon ({ className, color = '#000000' }) {
  return <Icon
    color={color}
    title={title}
    className={className}
    style={{ paddingTop: '10px' }}>
    <path fillRule='evenodd' clipRule='evenodd' d='M0 0h21v2H0V0zm0 6h21v2H0V6zm21 6H0v2h21v-2z' />
  </Icon>
}
