import React from 'react'
import './SpecificButton.module.css'

const BUTTON_LABEL = 'some domain specific button'

function SpecificButton ({ children = BUTTON_LABEL, onClick = () => {} }) {
  return (
    <button onClick={onClick} styleName='specific-button'>{children}</button>
  )
}

export default SpecificButton
