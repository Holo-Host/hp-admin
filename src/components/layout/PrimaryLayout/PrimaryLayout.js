import React, { useContext, useState, useEffect } from 'react'
import { object } from 'prop-types'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import ScreenWidthContext from 'contexts/screenWidth'
import FlashMessage from 'components/FlashMessage'
import SideMenu from 'components/SideMenu'
import Header from 'components/Header'
import AlphaFlag from 'components/AlphaFlag'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import useConnectionContext from 'contexts/useConnectionContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import { useInterval } from 'utils'
import { wsConnection } from 'holochainClient'
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
  const [isHposConnectionAlive, setIsHposConnectionAlive] = useState(true)
  const { setIsConnected, isConnected } = useConnectionContext()
  const { setCurrentUser } = useCurrentUserContext()
  const { newMessage } = useFlashMessageContext()
  const { push } = useHistory()

  const onError = ({ graphQLErrors: { isHposConnectionActive } }) => {
    setIsHposConnectionAlive(isHposConnectionActive)
  }

  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: 10000, onError, notifyOnNetworkStatusChange: true, ssr: false })

  useInterval(() => {
    if (window.location.pathname !== '/' || window.location.pathname !== '/admin/login') {
      setIsConnected({ hpos: isHposConnectionAlive, holochain: wsConnection })
    }
  }, 5000)

  useEffect(() => {
    if (!isConnected.hpos) {
      // reroute to login on network/hpos connection error
      if (window.location.pathname !== '/' && window.location.pathname !== '/admin/login') {
        push('/admin/login')
      }
      newMessage('Connecting to your Holoport...', 0)
      setIsConnected({ ...isConnected, hpos: isHposConnectionAlive })
    }

    const setUser = () => {
      setCurrentUser({
        hostPubKey: settings.hostPubKey,
        hostName: settings.hostName || ''
      })
    }

    if (window.location.pathname !== '/' && window.location.pathname !== '/admin/login') {
      // if inside happ, check for connection to holochain
      if (isConnected.hpos && !isConnected.holochain) {
        // reroute to login on conductor connection error as it signals emerging hpos connetion failure
        if (window.location.pathname !== '/' && window.location.pathname !== '/admin/login') {
          push('/admin/login')
        }
      } else {
        newMessage('', 0)
        setUser()
      }
    } else {
      // if on login page and connected to hpos, clear message and set user
      if (isConnected.hpos) {
        newMessage('', 0)
        setUser()
      }
    }
  }, [isConnected,
    newMessage,
    push,
    setCurrentUser,
    settings.hostPubKey,
    settings.hostName,
    setIsConnected,
    isHposConnectionAlive])

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    {showHeader && <Header
      {...headerProps}
      hamburgerClick={showSideMenu && hamburgerClick}
      settings={isConnected.hpos ? settings : {}} />}
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      settings={isConnected.hpos ? settings : {}} />
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
