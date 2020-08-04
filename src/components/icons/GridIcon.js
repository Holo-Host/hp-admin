import React from 'react'
import Icon from './Icon'

export const title = 'Grid Icon'

export default function GridIcon ({ className, color = '#000000' }) {
  return <Icon
    color={color}
    title={title}
    className={className}
  >
    <path d='M4.8 0H1.1C.5 0 0 .5 0 1.1v3.7c0 .6.5 1.1 1.1 1.1h3.7c.6 0 1.1-.5 1.1-1.1V1.1C5.9.5 5.4 0 4.8 0zM12.9 0H9.2c-.6 0-1.1.5-1.1 1.1v3.7c0 .6.5 1.1 1.1 1.1h3.7c.6 0 1.1-.5 1.1-1.1V1.1c0-.6-.5-1.1-1.1-1.1zM4.8 8.1H1.1c-.6 0-1.1.44-1.1.97v3.23c0 .53.5.96 1.1.96h3.7c.6 0 1.1-.43 1.1-.96V9.07c0-.53-.5-.96-1.1-.96zM12.9 8.1H9.2c-.6 0-1.1.44-1.1.97v3.23c0 .53.5.96 1.1.96h3.7c.6 0 1.1-.43 1.1-.96V9.07c0-.53-.5-.96-1.1-.96z' fill='#00818D' />
  </Icon>
}
