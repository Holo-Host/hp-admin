import React from 'react'
import Button from 'components/Button'
import './HoloFuel.module.css'

export default function HoloFuel (props) {
  console.log(' =========== HOLOFUEL PROPS ================= : ', props)
  const goToMenu = () => props.history.push('/menu')
  const { allHoloFuelCompleteTransations } = props

  if (props) {
    return <div>
      <div styleName='header'>
        <span styleName='title'>HoloFuel</span>
        <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
      </div>
      <h4>HoloFuel Page Loaded with Props</h4>
      <p>HF Completed Tx Props: { props && JSON.stringify(allHoloFuelCompleteTransations) }</p>
    </div>
  } else {
    return <div>
      <div styleName='header'>
        <span styleName='title'>HoloFuel</span>
        <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
      </div>
      <h4>Loading HoloFuel</h4>
    </div>
  }
}
