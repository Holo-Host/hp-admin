import React, { useContext, useState, useEffect, useCallback } from 'react'
import { object } from 'prop-types'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import ScreenWidthContext from 'contexts/screenWidth'
import FlashMessage from 'components/FlashMessage'
import Header from 'components/Header'
import AlphaFlag from 'components/AlphaFlag'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import useConnectionContext from 'contexts/useConnectionContext'
import useHFConnectionContext from 'holofuel/contexts/useConnectionContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import { useInterval } from 'utils'
import { wsConnection } from 'holochainClient'
import { isLoginPage, HP_ADMIN_LOGIN_PATH } from 'utils/urls'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/colors.css'
import 'global-styles/index.css'

export function PrimaryLayout ({
  children,
  headerProps = {},
  showHeader = true,
  showAlphaFlag = true
}) {
  const [isInsideApp, setIsInsideApp] = useState(true)
  const [isHposConnectionAlive, setIsHposConnectionAlive] = useState(true)
  const { connectionStatus, setConnectionStatus } = useConnectionContext()
  const { isConnected: isHFConductorConnected } = useHFConnectionContext()
  const { setCurrentUser } = useCurrentUserContext()
  const { newMessage } = useFlashMessageContext()
  const { push } = useHistory()

  const [isPausedConnectionCheckInterval, setIsPausedConnectionCheckInterval] = useState(false)
  const [userMessage, setUserMessage] = useState('')

  const onError = ({ graphQLErrors: { isHposConnectionActive } }) => {
    setIsHposConnectionAlive(isHposConnectionActive)
  }

  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: 10000, onError, notifyOnNetworkStatusChange: true, ssr: false })

  useInterval(() => {
    if (isLoginPage(window)) {
      setConnectionStatus({ hpos: isHposConnectionAlive, holochain: wsConnection })
    } else {
      // on login page, set holochain conductor connnection as false when hpos connection is false, or true when true
      setConnectionStatus({ hpos: isHposConnectionAlive, holochain: isHposConnectionAlive })
    }
  }, 5000)

  const setConductorConnectionFalse = useCallback(() => setConnectionStatus({ ...connectionStatus, holochain: false }), [setConnectionStatus, connectionStatus])

  useEffect(() => {
    const setUser = () => {
      setCurrentUser({
        hostPubKey: settings.hostPubKey,
        hostName: settings.hostName || ''
      })
    }

    if (!isHFConductorConnected && connectionStatus.holochain) {
      setConductorConnectionFalse()
    }

    if (!connectionStatus.hpos && !isPausedConnectionCheckInterval) {
      // reroute to login on network/hpos connection error
      if (!isLoginPage(window)) {
        push(HP_ADMIN_LOGIN_PATH)
      }
      const noHoloportConnectionMsg = 'Connecting to your Holoport...'
      if (userMessage !== noHoloportConnectionMsg) {
        setUserMessage(noHoloportConnectionMsg)
        newMessage(noHoloportConnectionMsg, 0)
      }
      setIsPausedConnectionCheckInterval(true)
      setTimeout(() => setIsPausedConnectionCheckInterval(false), 5000)
    } else if (connectionStatus.hpos && !connectionStatus.holochain) {
      if (!isLoginPage(window)) {
        push(HP_ADMIN_LOGIN_PATH)
      }
      const noConductorConnectionMsg = 'Connecting to your Conductor...'
      if (userMessage !== noConductorConnectionMsg) {
        setUserMessage(noConductorConnectionMsg)
        newMessage(noConductorConnectionMsg, 0)
      }
      // set as false until receive back onError result from next hpos (settingsQuery) polling
      setIsHposConnectionAlive(false)
    } else if (connectionStatus.hpos) {
      setUserMessage('')
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
    setIsHposConnectionAlive,
    setIsPausedConnectionCheckInterval,
    isInsideApp,
    setIsInsideApp,
    userMessage])

  const isWide = useContext(ScreenWidthContext)

  return <div styleName='styles.primary-layout'>
    <div styleName={cx({ 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
      {showHeader && <Header
        {...headerProps}
        settings={connectionStatus.hpos ? settings : {}} />}
      {showAlphaFlag && <AlphaFlag styleName='styles.alpha-flag' />}
      <div styleName='styles.content'>
        <FlashMessage />
        {children}
      </div>
    </div>

    {!isLoginPage(window) && <div styleName='styles.wrapper'>
      <div styleName='styles.container'>
        <footer styleName='styles.footer'>
          <div styleName='styles.alpha-info'>
            <AlphaFlag variant='right' styleName='styles.alpha-flag' />
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
    </div>}
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
