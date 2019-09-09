import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import cx from 'classnames'
import Dashboard from 'pages/Dashboard'
import MainMenu from 'pages/MainMenu'
import Settings from 'pages/Settings'
import Tos from 'pages/Tos'
import BrowseHapps from 'pages/BrowseHapps'
import HappDetails from 'pages/HappDetails'
import ManagePricing from 'pages/ManagePricing'
import HoloFuelTxOverview from 'pages/HoloFuelTxOverview'
import HoloFuelDashboard from 'pages/HoloFuelDashboard'
import HostingEarnings from 'pages/HostingEarnings'
import MyProfile from 'pages/MyProfile'
import HoloFuelTransactionsLedger from 'pages/HoloFuelTransactionsLedger'
import StyleDemo from 'pages/StyleDemo'
import Login from 'pages/Login'
import ScreenWidthContext from 'contexts/screenWidth'
import './PrimaryLayout.module.css'

export function PrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('primary-layout', { wide: isWide }, { narrow: !isWide })}>
    <Route path='/login' component={Login} />
    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/menu' component={MainMenu} />
    <Route path='/browse-happs' exact component={BrowseHapps} />
    <Route path='/browse-happs/:appId' component={HappDetails} />
    <Route path='/pricing' component={ManagePricing} />
    <Route path='/settings' exact component={Settings} />
    <Route path='/tos' exact component={Tos} />
    <Route path='/earnings' component={HostingEarnings} />
    <Route path='/my-profile' component={MyProfile} />

    <Route path='/holofuel' exact component={HoloFuelTxOverview} />
    <Route path='/holofuel/dashboard' component={HoloFuelDashboard} />
    <Route path='/holofuel/ledger' component={HoloFuelTransactionsLedger} />

    <Route path='/style-demo' component={StyleDemo} />

  </div>
}

export default PrimaryLayout
