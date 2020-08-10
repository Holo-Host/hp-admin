import React, { useContext, useState, useEffect, useCallback } from 'react'
import { object } from 'prop-types'
import { Link, useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import FlashMessage from 'components/FlashMessage'
import Header from 'components/Header'
import AlphaFlag from 'components/AlphaFlag'
import GearIcon from 'components/icons/GearIcon'
import HomeIcon from 'components/icons/HomeIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import ScreenWidthContext from 'contexts/screenWidth'
import useConnectionContext from 'contexts/useConnectionContext'
import useHFConnectionContext from 'holofuel/contexts/useConnectionContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import { useInterval, POLLING_INTERVAL_SETTINGS } from 'utils'
import { wsConnection } from 'holochainClient'
import { isLoginPage, HP_ADMIN_LOGIN_PATH } from 'utils/urls'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/colors.css'
import 'global-styles/index.css'

function PrimaryLayout ({
  children,
  headerProps = {},
  showHeader = true
}) {
  const [isInsideApp, setIsInsideApp] = useState(true)
  const [isHposConnectionAlive, setIsHposConnectionAlive] = useState(true)
  const { connectionStatus, setConnectionStatus } = useConnectionContext()
  const { isConnected: isHFConductorConnected, setIsConnected: setIsHFConductorConnected } = useHFConnectionContext()
  const { setCurrentUser } = useCurrentUserContext()
  const { newMessage } = useFlashMessageContext()
  const { push } = useHistory()

  const [isPausedConnectionCheckInterval, setIsPausedConnectionCheckInterval] = useState(false)

  const onError = ({ graphQLErrors: { isHposConnectionActive } }) => {
    setIsHposConnectionAlive(isHposConnectionActive)
  }

  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: (POLLING_INTERVAL_SETTINGS), onError, notifyOnNetworkStatusChange: true, ssr: false })

  useInterval(() => {
    if (isLoginPage(window)) {
      // on login page, set holochain conductor connnection as false when hpos connection is false, or true when true
      setConnectionStatus({ hpos: isHposConnectionAlive, holochain: isHposConnectionAlive })
      setIsHFConductorConnected(isHposConnectionAlive)
    } else {
      setConnectionStatus({ hpos: isHposConnectionAlive, holochain: wsConnection })
    }
  }, 5000)

  const setConductorConnection = useCallback(connection => setConnectionStatus({ ...connectionStatus, holochain: connection }), [setConnectionStatus, connectionStatus])

  useEffect(() => {
    const setUser = () => {
      setCurrentUser({
        hostPubKey: settings.hostPubKey,
        hostName: settings.hostName || ''
      })
    }

    if (!isHFConductorConnected && connectionStatus.holochain) {
      setConductorConnection(false)
    } else if (isHFConductorConnected && !connectionStatus.holochain) {
      setConductorConnection(true)
    }

    if (!connectionStatus.hpos && !isPausedConnectionCheckInterval) {
      // reroute to login on network/hpos connection error
      if (!isLoginPage(window)) {
        push(HP_ADMIN_LOGIN_PATH)
      }
      newMessage('Connecting to your Holoport...', 0)
      setIsPausedConnectionCheckInterval(true)
      setTimeout(() => setIsPausedConnectionCheckInterval(false), 5000)
    } else if (connectionStatus.hpos && !connectionStatus.holochain && !isHFConductorConnected) {
      if (!isLoginPage(window)) {
        push(HP_ADMIN_LOGIN_PATH)
      }
      const noConductorConnectionMsg = 'Connecting to your Conductor...'
      newMessage(noConductorConnectionMsg, 0)
      // set as false until receive back onError result from next hpos (settingsQuery) polling
      setIsHposConnectionAlive(false)
    } else if (connectionStatus.hpos) {
      newMessage('', 0)
      setUser()
    }
  }, [connectionStatus,
    isPausedConnectionCheckInterval,
    newMessage,
    push,
    setCurrentUser,
    settings.hostPubKey,
    settings.hostName,
    connectionStatus.hpos,
    connectionStatus.holochain,
    isHFConductorConnected,
    setIsHposConnectionAlive,
    setIsPausedConnectionCheckInterval,
    setConductorConnection,
    isInsideApp,
    setIsInsideApp])

  const isWide = useContext(ScreenWidthContext)

  return <div styleName='styles.primary-layout'>
    {!isWide && <MobileLayout showHeader={showHeader} headerProps={headerProps} settings={settings}>
      {children}
    </MobileLayout>}
    {isWide && <DesktopLayout settings={settings} title={headerProps.title}>{children}</DesktopLayout>}
  </div>
}

export function MobileLayout ({ showHeader, headerProps, settings, children }) {
  return <>
    <div styleName='styles.narrow'>
      {showHeader && <Header
        {...headerProps}
        settings={settings} />}
      <div styleName='styles.content-narrow'>
        <FlashMessage />
        {children}
      </div>
    </div>

    {!isLoginPage(window) && <Footer />}
  </>
}

export function DesktopLayout ({ children, settings, title }) {
  return <>
    <div styleName='styles.wide'>
      {!isLoginPage(window) && <Sidebar settings={settings} />}
      <div styleName='styles.content-wide'>
        <FlashMessage />
        <h2 styleName='styles.desktop-title'>{title}</h2>
        {children}
      </div>
    </div>
  </>
}

export function Footer ({ isWide }) {
  return <div styleName={isWide ? 'styles.wrapper-wide' : 'styles.wrapper-narrow'}>
    <div styleName='styles.container'>
      <footer styleName='styles.footer'>
        <div styleName='styles.alpha-info'>
          <AlphaFlag variant='right' styleName='styles.alpha-flag-banner' />
          <p>
            HP Admin is in Alpha testing.
          </p>
          <p>
            Learn more about out our&nbsp;
            <a href='https://holo.host/holo-testnet' target='_blank' rel='noopener noreferrer' styleName='styles.alpha-link'>
              Alpha Testnet.
            </a>
          </p>
          <ul styleName='styles.footer-list'>
            <li styleName='styles.footer-list-item'>
              <a href='https://forum.holo.host' target='_blank' rel='noopener noreferrer' styleName='styles.footer-link'>Help</a>
            </li>
            <li styleName='styles.footer-list-item'>
              <a href='http://holo.host/alpha-terms' target='_blank' rel='noopener noreferrer' styleName='styles.footer-link'>View Terms of Service</a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export function Sidebar ({ settings = {} }) {
  return <div styleName='styles.sidebar'>
    <h1 styleName='styles.sidebar-title'>HP Admin</h1>
    <Link to='/admin/settings' styleName='styles.settings-link'>
      <GearIcon />
    </Link>
    <div styleName='styles.device-name'>
      {settings.deviceName || 'Holoport'}
    </div>
    <Link to='/admin' styleName='styles.home-link'>
      <HomeIcon /> <span styleName='styles.home-text'>Home</span>
    </Link>
    <Footer isWide />
  </div>
}

export default PrimaryLayout
