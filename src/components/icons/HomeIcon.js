import React from 'react'
import Icon from './Icon'

export const title = 'Home Icon'

export default function HomeIcon ({ className, color = '#000000' }) {
  return <Icon
    color={color}
    title={title}
    className={className}
  >
    <path d='M10.5 5L6 .4a.8.8 0 00-1.2 0L.5 5a.8.8 0 00.6 1.3h.3v4a.3.3 0 00.3.3h7.6a.3.3 0 00.3-.2v-4h.3a.8.8 0 00.6-1.4zM4.7 10V7.9h1.6v2.2H4.7zM10 5.6a.3.3 0 01-.2.2h-.6A.3.3 0 009 6v4.1H7V7.7a.3.3 0 00-.3-.3H4.4a.3.3 0 00-.3.3V10H2v-4a.3.3 0 00-.3-.3h-.6a.3.3 0 01-.2-.5L5.3.8a.3.3 0 01.4 0L10 5.3a.3.3 0 010 .3z' fill='#2C405A' />
  </Icon>
}
