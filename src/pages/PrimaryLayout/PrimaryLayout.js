import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import './PrimaryLayout.module.css'
import Dashboard from 'pages/Dashboard'
import MainMenu from 'pages/MainMenu'
import BrowseHapps from 'pages/BrowseHapps'
import ManagePricing from 'pages/ManagePricing'
import HoloFuelTxOverview, { HoloFuelDashboard } from 'pages/HoloFuel'
import ScreenWidthContext from 'contexts/screenWidth'
import cx from 'classnames'

export function PrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('primary-layout', { wide: isWide }, { narrow: !isWide })}>

    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/menu' component={MainMenu} />
    <Route path='/browse-happs' component={BrowseHapps} />
    <Route path='/pricing' component={ManagePricing} />
    <Route path='/holofuel' exact component={HoloFuelTxOverview} />
    <Route path='/holofuel/dashboard' component={HoloFuelDashboard} />

  </div>
}

export default PrimaryLayout
