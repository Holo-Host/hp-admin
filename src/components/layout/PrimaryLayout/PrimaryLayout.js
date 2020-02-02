import React, { useContext, useState, useEffect } from 'react'
import { object } from 'prop-types'
// import { isEmpty } from 'lodash/fp'
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
  const onError = ({ graphQLErrors, networkError, response, extraInfo }) => {
    const hposConnection = graphQLErrors.hposConnection
    setIsConnected(hposConnection)
  }

  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: 30000, onError })
  const { newMessage } = useFlashMessageContext()
  const { setIsConnected, isConnected } = useConnectionContext()

  useEffect(() => {
    // console.log('statusCode in useEffect:', isConnected)
    if (!isConnected) {
      newMessage('Your Holoport is currently unreachable.', 0)
    } else {
      newMessage('', 0)
    }
  }, [isConnected, setIsConnected, newMessage])

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
