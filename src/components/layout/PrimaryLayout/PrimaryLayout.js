import React, { useContext, useState, useEffect, useRef } from 'react'
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
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import { useInterval } from 'utils'
import { wsConnection } from 'holochainClient'
import { ROOT, HP_ADMIN_LOGIN } from 'utils/urls'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/colors.css'
import 'global-styles/index.css'

export function PrimaryLayout ({
  children,
  headerProps = {},
  showHeader = true
}) {
  const [isInsideApp, setIsInsideApp] = useState(true)
  const [isHposConnectionAlive, setIsHposConnectionAlive] = useState(true)
  const { setIsConnected, isConnected } = useConnectionContext()
  const { setCurrentUser } = useCurrentUserContext()
  const { newMessage } = useFlashMessageContext()
  const { push } = useHistory()

  const onError = ({ graphQLErrors: { isHposConnectionActive } }) => {
    setIsHposConnectionAlive(isHposConnectionActive)
  }

  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: 10000, onError, notifyOnNetworkStatusChange: true, ssr: false })
  const isFreshHpAdminRender = useRef(true)

  useInterval(() => {
    if (isInsideApp) {
      setIsConnected({ hpos: isHposConnectionAlive, holochain: wsConnection })
    }
  }, 5000)

  useEffect(() => {
    setIsInsideApp(window.location.pathname !== ROOT && window.location.pathname !== HP_ADMIN_LOGIN)

    if (!isConnected.hpos) {
      // reroute to login on network/hpos connection error
      if (isInsideApp) {
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
      if (!isFreshHpAdminRender.current && isConnected.hpos && !isConnected.holochain) {
        // reroute to login on conductor connection error as it signals emerging hpos connetion failure
        if (isInsideApp) {
          push('/admin/login')
        }
      } else {
        newMessage('', 0)
        setUser()
      }

      if (isFreshHpAdminRender.current) {
        // set timeout to allow time to let ws connection check to complete
        setTimeout(() => {
          isFreshHpAdminRender.current = false
        }, 5000)
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
    isHposConnectionAlive,
    isInsideApp,
    setIsInsideApp])

  const isWide = useContext(ScreenWidthContext)

  return <div styleName='styles.primary-layout'>
    <div styleName={cx({ 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
      {showHeader && <Header
        {...headerProps}
        settings={isConnected.hpos ? settings : {}} />}

      <div styleName='styles.content'>
        <FlashMessage />
        {children}
      </div>
    </div>

    {isInsideApp && <div styleName='styles.wrapper'>
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
