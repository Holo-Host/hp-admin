import React, { useContext, useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { object } from 'prop-types'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import useConnectionContext from 'holofuel/contexts/useConnectionContext'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { shouldShowTransactionInInbox } from 'models/Transaction'
import { HOME_PATH, HP_ADMIN_LOGIN_PATH } from 'holofuel/utils/urls'
import { wsConnection } from 'holochainClient'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'
import { useInterval } from 'utils'

function PrimaryLayout ({
  children,
  headerProps = {},
  showAlphaFlag = true
}) {
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {}, stopPolling: stopPollingLedger, startPolling: startPollingLedger } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network', pollInterval: 5000 })
  const { data: { holofuelActionableTransactions: actionableTransactions = [] } = {}, stopPolling: stopPollingActionableTransactions, startPolling: startPollingActionableTransactions } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { stopPolling: stopPollingCompletedTransactions, startPolling: startPollingCompletedTransactions } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { currentUser, currentUserLoading } = useCurrentUserContext()
  const { isConnected, setIsConnected } = useConnectionContext()
  const { newMessage } = useFlashMessageContext()
  const { push } = useHistory()

  useInterval(() => {
    setIsConnected(wsConnection)
  }, 5000)

  useEffect(() => {
    if (!isConnected) {
      let connectionErrorMessage, defaultPath
      if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
        connectionErrorMessage = 'Your Conductor is currently unreachable.'
        defaultPath = HOME_PATH
        console.log('STOPPING NETWORK CALLS')
        stopPollingActionableTransactions()
        stopPollingCompletedTransactions()
      } else {
        connectionErrorMessage = 'Your Holoport is currently unreachable.'
        defaultPath = HP_ADMIN_LOGIN_PATH
      }
      newMessage(connectionErrorMessage, 0)
      if (window.location.pathname !== '/' && window.location.pathname !== defaultPath) {
        push(defaultPath)
        stopPollingActionableTransactions()
      }
    } else {
      newMessage('', 0)
      console.log('STARTING NETWORK CALLS')
      startPollingActionableTransactions(5000)
      startPollingCompletedTransactions(5000)
    }
  }, [isConnected,
    setIsConnected,
    push,
    newMessage,
    stopPollingActionableTransactions,
    startPollingActionableTransactions,
    stopPollingCompletedTransactions,
    startPollingCompletedTransactions,
    stopPollingLedger,
    startPollingLedger])

  const inboxCount = actionableTransactions.filter(shouldShowTransactionInInbox).length
  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={currentUser} agentLoading={currentUserLoading} hamburgerClick={hamburgerClick} inboxCount={inboxCount} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      agent={currentUser}
      agentLoading={currentUserLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
      ledgerLoading={ledgerLoading}
      isWide={isWide} />
    {showAlphaFlag && <AlphaFlag styleName='styles.alpha-flag' />}
    <div styleName={cx('styles.content')}>
      <FlashMessage />
      {children}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
