import React from 'react'
import Icon from './Icon'

export const title = 'Phone Icon'

export default function PhoneIcon ({ className, color = '#000000' }) {
  return <Icon
    color={color}
    title={title}
    className={className}
  >
    <path d='M12.2 17c-2.7 0-5.5-1.4-8.2-4C-1.7 7.1.1 2.6.8 1.4 1.4.5 3 .2 4 0c.4 0 .8.2 1 .5l2 3.9c.2.3 0 .8-.2 1l-2 2c.3.6 1.1 1.8 2 2.8 1 .9 2.2 1.7 2.8 2l2-2a1 1 0 011-.2l3.9 2c.3.2.6.6.5 1-.2 1-.5 2.6-1.5 3.2-1 .5-2.1.8-3.3.8z' fill='#00818D' />
  </Icon>
}
