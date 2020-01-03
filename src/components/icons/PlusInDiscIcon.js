import React from 'react'
import PlusIcon from 'components/icons/PlusIcon'
import './PlusInDiscIcon.module.css'

export default function PlusInDiscIcon ({ color = '#FFF', backgroundColor = '#D3F5E6', className }) {
  return <div styleName='disc-icon' style={{ backgroundColor }} className={className}>
    <PlusIcon styleName='plus-icon' color={color} />
  </div>
}
