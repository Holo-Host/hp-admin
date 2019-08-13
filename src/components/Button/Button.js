import React from 'react'
import './Button.module.css'

const BUTTON_LABEL = 'some domain specific button'

function Button ({ children = BUTTON_LABEL, onClick = () => {}, className }) {
  return (
    <button onClick={onClick} className={className} styleName='button'>{children}</button>
  )
}

export default Button
