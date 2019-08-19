import React from 'react'
import './Button.module.css'

const BUTTON_LABEL = 'some domain specific button'

function Button ({ children = BUTTON_LABEL, onClick = () => {}, className, disabled }) {
  return (
    <button onClick={disabled ? () => {} : onClick} className={className} styleName='button' disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
