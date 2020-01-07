import React from 'react'
import PlusIcon from 'components/icons/PlusIcon'
import './PlusInDiscIcon.module.css'

export default function PlusInDiscIcon ({ color = '#FFF', backgroundColor = '#D3F5E6', className, onClick }) {
  return <div styleName='disc-icon' style={{ backgroundColor }} className={className} onClick={onClick}>
    <PlusIcon styleName='plus-icon' color={color} onClick={onClick} />
  </div>
}
