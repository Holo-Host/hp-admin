import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import cx from 'classnames'
import HFDashboard from 'pages/HFDashboard'
import ScreenWidthContext from 'contexts/screenWidth'
import './HoloFuelPrimaryLayout.module.css'

export function HoloFuelPrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('primary-layout', { wide: isWide }, { narrow: !isWide })}>

    <Route path='/(|dashboard)' exact component={HFDashboard} />

  </div>
}

export default HoloFuelPrimaryLayout
