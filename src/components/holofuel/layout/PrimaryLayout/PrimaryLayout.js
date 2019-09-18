import React, { useContext, useState } from 'react'
import { object } from 'prop-types'
import cx from 'classnames'
import ScreenWidthContext from 'contexts/screenWidth'
import SideMenu from 'components/holofuel/SideMenu'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/colors.css'
import 'global-styles/index.css'

import Header from 'components/holofuel/Header'

export function PrimaryLayout ({
  children,
  accountNumber,
  inboxCount,
  headerProps = {}
}) {
  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} accountNumber={accountNumber} hamburgerClick={hamburgerClick} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      accountNumber={accountNumber}
      inboxCount={inboxCount}
    />
    <div styleName='styles.content'>
      {children}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
