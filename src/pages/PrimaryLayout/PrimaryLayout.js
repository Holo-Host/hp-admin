import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import cx from 'classnames'
import './PrimaryLayout.module.css'
import Dashboard from 'pages/Dashboard'
import MainMenu from 'pages/MainMenu'
import BrowseHapps from 'pages/BrowseHapps'
import HappDetails from 'pages/HappDetails'
import ManagePricing from 'pages/ManagePricing'
import HoloFuelTxOverview, { HoloFuelDashboard } from 'pages/HoloFuel'
import HostingEarnings from 'pages/HostingEarnings'
import StyleDemo from 'pages/StyleDemo'
import Login from 'pages/Login'
import ScreenWidthContext from 'contexts/screenWidth'

export function PrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('primary-layout', { wide: isWide }, { narrow: !isWide })}>

    <Route path='/login' component={Login} />
    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/menu' component={MainMenu} />
    <Route path='/browse-happs' exact component={BrowseHapps} />
    <Route path='/browse-happs/:appId' component={HappDetails} />
    <Route path='/pricing' component={ManagePricing} />
    <Route path='/holofuel' exact component={HoloFuelTxOverview} />
    <Route path='/holofuel/dashboard' component={HoloFuelDashboard} />
    <Route path='/earnings' component={HostingEarnings} />
    <Route path='/style-demo' component={StyleDemo} />

  </div>
}

export default PrimaryLayout
