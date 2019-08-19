import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import cx from 'classnames'
import ScreenWidthContext from 'contexts/screenWidth'
import Dashboard from 'pages/Dashboard'
import MainMenu from 'pages/MainMenu'
import Settings from 'pages/Settings'
import Tos from 'pages/Tos'
import BrowseHapps from 'pages/BrowseHapps'
import ManagePricing from 'pages/ManagePricing'
import './PrimaryLayout.module.css'

export function PrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('primary-layout', { wide: isWide }, { narrow: !isWide })}>
    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/menu' component={MainMenu} />
    <Route path='/browse-happs' component={BrowseHapps} />
    <Route path='/pricing' component={ManagePricing} />
    <Route path='/settings' exact component={Settings} />
    <Route path='/tos' exact component={Tos} />
  </div>
}

export default PrimaryLayout
