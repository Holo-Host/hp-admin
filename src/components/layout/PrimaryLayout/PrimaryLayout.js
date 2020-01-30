import React, { useContext, useState, useEffect } from 'react'
import { object } from 'prop-types'
import cx from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import ScreenWidthContext from 'contexts/screenWidth'
import FlashMessage from 'components/FlashMessage'
import SideMenu from 'components/SideMenu'
import Header from 'components/Header'
import AlphaFlag from 'components/AlphaFlag'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import useConnectionContext from 'contexts/useConnectionContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/colors.css'
import 'global-styles/index.css'

export function PrimaryLayout ({
  children,
  headerProps = {},
  showHeader = true,
  showSideMenu = true,
  showAlphaFlag = true
}) {
  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: 30000 })
  const { newMessage } = useFlashMessageContext()
  const { isConnected } = useConnectionContext()

  console.log('isConnected in Primary Layout : ', isConnected)

  useEffect(() => {
    if (!isConnected) {
      newMessage('Your Holoport is currently unreachable.', 0)
    } else {
      newMessage('', 0)
    }
  }, [isConnected, newMessage])

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    {showHeader && <Header
      {...headerProps}
      hamburgerClick={showSideMenu && hamburgerClick}
      settings={isConnected ? settings : {}} />}
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      settings={isConnected ? settings : {}} />
    {showAlphaFlag && <AlphaFlag styleName='styles.alpha-flag' />}
    <div styleName='styles.content'>
      <FlashMessage />
      {children}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
