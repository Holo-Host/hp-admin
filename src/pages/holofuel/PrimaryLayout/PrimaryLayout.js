import React, { useContext } from 'react'
import { Route } from 'react-router-dom'
import cx from 'classnames'
import Dashboard from 'pages/holofuel/Dashboard'
import MainMenu from 'pages/holofuel/MainMenu'
import TransactionHistory from 'pages/holofuel/TransactionHistory'
import Inbox from 'pages/holofuel/Inbox'
import ScreenWidthContext from 'contexts/screenWidth'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/holofuel/colors.css'
import 'global-styles/holofuel/index.css'

export function PrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>

    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/menu' component={MainMenu} />
    <Route path='/inbox' exact component={Inbox} />
    <Route path='/history' component={TransactionHistory} />

  </div>
}

export default PrimaryLayout
