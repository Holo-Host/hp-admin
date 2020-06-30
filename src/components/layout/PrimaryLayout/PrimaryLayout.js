import React, { useContext, useState, useEffect, useRef } from 'react'
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

  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: 30000, onError, notifyOnNetworkStatusChange: true, ssr: false })
  const isFirstLoginRender = useRef(true)
  const isFirstAppRender = useRef(true)

  useInterval(() => {
    if (window.location.pathname === '/' || window.location.pathname === '/admin/login') {
      setIsConnected({ ...isConnected, hpos: isHposConnectionAlive })
    } else {
      setIsConnected({ hpos: isHposConnectionAlive, holochain: wsConnection })
    }
  }, 5000)

  useEffect(() => {
    if (!isFirstLoginRender.current && !isConnected.hpos) {
      newMessage('Your Holoport is currently unreachable.', 0)
      // reroute to login on network/hpos connection error
      if (window.location.pathname !== '/' && window.location.pathname !== '/admin/login') {
        push('/')
      }
    }

    if (isFirstLoginRender.current) {
      setTimeout(() => {
        isFirstLoginRender.current = false
      }, 3000)
    }

    if (window.location.pathname !== '/' && window.location.pathname !== '/admin/login') {
      // if inside happ, check for connection to holochain
      if (!isFirstAppRender.current && isConnected.hpos && !isConnected.holochain) {
        newMessage('Your Holochain Conductor is currently unreachable.', 0)
        // reroute to dashboard on ws connection / hc conductor failure
        if (window.location.pathname !== '/admin' && window.location.pathname !== '/admin/' && window.location.pathname !== '/admin/dashboard') {
          push('/admin/dashboard')
        }
      } else {
        newMessage('', 0)
      }

      if (isFirstAppRender.current) {
        isFirstAppRender.current = false
      }

    } else {
      // if on login page and connected to hpos, clear message and set user
      if (isConnected.hpos) {  
        newMessage('', 0)
        setCurrentUser({
          hostPubKey: settings.hostPubKey,
          hostName: settings.hostName || ''
        })
      }
    }
  }, [isConnected, newMessage, push, setCurrentUser, settings.hostPubKey, settings.hostName])

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
