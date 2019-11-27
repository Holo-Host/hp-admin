import React from 'react'
import 'react-toggle/style.css'
import Toggle from 'react-toggle'
// note this is plain css, not a css module
import './ToggleButton.css' 

function ToggleButton (props) {
  return <Toggle {...props} />
}

export default ToggleButton
