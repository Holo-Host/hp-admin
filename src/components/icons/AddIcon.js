import React from 'react'
import Icon from './Icon'

export const title = 'Add Icon'
const path = 'M11.5 0c6.347 0 11.5 5.153 11.5 11.5s-5.153 11.5-11.5 11.5-11.5-5.153-11.5-11.5 5.153-11.5 11.5-11.5zm0 1c5.795 0 10.5 4.705 10.5 10.5s-4.705 10.5-10.5 10.5-10.5-4.705-10.5-10.5 4.705-10.5 10.5-10.5zm.5 10h6v1h-6v6h-1v-6h-6v-1h6v-6h1v6z'
const viewBox = '0 0 512 512'

export default function AddIcon ({ className, color = '#000000' }) {
  return <Icon
    viewBox={viewBox}
    color={color}
    title={title}
    className={className}
  >
    <path d={path} />
  </Icon>
}
