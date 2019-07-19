import React from 'react'
import './SpecificButton.module.css'

const BUTTON_LABEL = 'some domain specific button'

function SpecificButton () {
  return (
    <button styleName='specific-button'>{BUTTON_LABEL}</button>
  )
}

export default SpecificButton
