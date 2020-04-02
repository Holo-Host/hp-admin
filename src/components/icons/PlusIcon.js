import React from 'react'
import Icon from './Icon'

export const title = 'Plus Icon'

export default function PlusIcon ({ className, color = '#000000' }) {
  return <Icon
    color={color}
    title={title}
    className={className}
  >
    <path fillRule='evenodd' clipRule='evenodd' d='M10.6 5h-4L6.4 1c0-.3-.2-.5-.4-.7a.7.7 0 00-.7 0C5 .4 5 .6 5 1L5.1 5H.9c-.2 0-.5 0-.6.3-.2.2-.2.5 0 .7 0 .3.3.4.6.4h4.2v4c0 .3 0 .6.3.7.2.2.5.2.7 0 .3 0 .4-.3.4-.6v-4l4.1-.1c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7z' />
  </Icon>
}
