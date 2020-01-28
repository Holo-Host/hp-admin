import React, { useContext, useState, useEffect } from 'react'
import { get } from 'lodash'
import { object } from 'prop-types'
import cx from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import ScreenWidthContext from 'contexts/screenWidth'
import FlashMessage from 'components/FlashMessage'
import SideMenu from 'components/SideMenu'
import Header from 'components/Header'
import AlphaFlag from 'components/AlphaFlag'
import HposConnectionQuery from 'graphql/HposConnectionQuery.gql'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import useConnectionContext from 'contexts/useConnectionContext'
import useWhoamiContext from 'contexts/useWhoamiContext'

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
  const { data: { hposConnection = {} } = {} } = useQuery(HposConnectionQuery)
  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery)
  const { newMessage } = useFlashMessageContext()
  const { setIsConnected } = useConnectionContext()
  const { setWhoami } = useWhoamiContext()
  const connection = get(hposConnection, 'connection', false)

  useEffect(() => {
    setIsConnected(connection)
    if (!connection) {
      newMessage('Your Holoport is currently unreachable.', 30000)
    } else {
      console.log('settings : ', settings)
      const hostWhoami = get(settings, 'hostPubKey', '')
      console.log('hostWhoami : ', hostWhoami)
      setWhoami(hostWhoami)
    }
  }, [connection, setIsConnected, newMessage])

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    {showHeader && <Header
      {...headerProps}
      hamburgerClick={showSideMenu && hamburgerClick}
      settings={connection ? settings : {}} />}
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      settings={connection ? settings : {}} />
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
