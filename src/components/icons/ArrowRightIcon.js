import React from 'react'
import Icon from './Icon'

export const title = 'Arrow Right Icon'

export default function ArrowRight ({ className, color = '#000000', opacity = '1' }) {
  return <Icon
    style={{ width: '9px', height: '15px' }}
    color={color}
    opacity={opacity}
    title={title}
    className={className}
  >
    <path fillRule='evenodd' clipRule='evenodd' d='M0 1.5L1.5 0l6 6L9 7.5 7.5 9l-6 6L0 13.5l6-6-6-6z' />
  </Icon>
}
