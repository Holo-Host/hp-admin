import React from 'react'
import Icon from './Icon'

export const title = 'Laptop Icon'

export default function LaptopIcon ({ className, color = '#000000' }) {
  return <Icon
    color={color}
    title={title}
    className={className}
  >
    <path fillRule='evenodd' clipRule='evenodd' d='M3.523 13.51H19.62c.889 0 1.61-.726 1.61-1.621V1.62C21.23.726 20.508 0 19.62 0H3.523c-.89 0-1.61.726-1.61 1.621V11.89c0 .895.72 1.62 1.61 1.62zm0-11.889H19.62V11.89H3.523V1.62z' />
    <path d='M.84 14.05h21.463v1.621H.84z' />
  </Icon>
}
