import React from 'react'
import Button from 'components/Button'
import './Settings.module.css'

export default function Settings (props) {
  console.log(' =========== HOLOFUEL PROPS ================= : ', props)
  const goToMenu = () => props.history.push('/menu')

  if (props) {
    return <div>
      <div styleName='header'>
        <span styleName='title'>HoloPort Settings</span>
        <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
      </div>
      <h4>HoloFuel Page Loaded with Props</h4>
      <p>HF Page Props: { props && JSON.stringify(props) }</p>
    </div>
  } else {
    return <div>
      <div styleName='header'>
        <span styleName='title'>HoloPort Settings</span>
        <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
      </div>
      <h4>Loading Settings</h4>
    </div>
  }
}
