import React, { useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { object } from 'prop-types'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import useConnectionContext from 'holofuel/contexts/useConnectionContext'
import useHpAdminConnectionContext from 'contexts/useConnectionContext'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { shouldShowTransactionInInbox } from 'models/Transaction'
import { HOME_PATH } from 'holofuel/utils/urls'
import { wsConnection } from 'holochainClient'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'
import { useInterval, useLoadingFirstTime } from 'utils'

function PrimaryLayout ({
  children,
  headerProps = {},
  showAlphaFlag = true
}) {
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {}, refetch: refetchLedger } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network', pollInterval: 60000 })
  const { loading: actionableTransactionsLoading, data: { holofuelActionableTransactions: actionableTransactions = [] } = {}, refetch: refetchActionableTransactions, stopPolling: stopPollingActionableTransactions, startPolling: startPollingActionableTransactions } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: completedTransactionsLoading, refetch: refetchCompletedTransactions, stopPolling: stopPollingCompletedTransactions, startPolling: startPollingCompletedTransactions } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: nonPendingTransactionsLoading, refetch: refetchNonPendingTransactions } = useQuery(HolofuelNonPendingTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: waitingTransactionsLoading, refetch: refetchWaitingTransactions } = useQuery(HolofuelWaitingTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { refetch: refetchUser } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const { currentUser, currentUserLoading } = useCurrentUserContext()
  const { isConnected, setIsConnected } = useConnectionContext()
  const { isConnected: hpAdminIsConnected, setIsConnected: hpAdminSetIsConnected } = useHpAdminConnectionContext()
  const { newMessage } = useFlashMessageContext()
  const { push } = useHistory()
  const isFreshRender = useRef(true)

  const [shouldRefetchUser, setShouldRefetchUser] = useState(false)
  const refetchHolofuelUser = useCallback(() => {
    setShouldRefetchUser(false)
    refetchUser()
  }, [setShouldRefetchUser, refetchUser])

  useInterval(() => {
    if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
      setIsConnected(wsConnection)
    } else {
      hpAdminSetIsConnected({ ...hpAdminIsConnected, holochain: wsConnection })
    }
  }, 5000)

  useEffect(() => {
    let connection
    if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
      connection = isConnected
    } else {
      connection = hpAdminIsConnected.holochain

      if (!hpAdminIsConnected.hpos) {
        newMessage('Connecting to your Holoport...', 0)
        // reroute to login on network/hpos connection error
        if (window.location.pathname !== '/' && window.location.pathname !== '/admin/login') {
          push('/admin/login')
        }
      }
    }

    if (!isFreshRender.current && !connection) {
      newMessage('Connecting to your Holochain Conductor...', 0)
      stopPollingActionableTransactions()
      stopPollingCompletedTransactions()
      setShouldRefetchUser(true)
      push(HOME_PATH)
    } else {
      newMessage('', 0)
      startPollingActionableTransactions(60000)
      startPollingCompletedTransactions(60000)
      if (shouldRefetchUser) {
        refetchHolofuelUser()
      }
    }
    if (isFreshRender.current) {
      isFreshRender.current = false
    }
  }, [isConnected,
    hpAdminIsConnected,
    setIsConnected,
    push,
    newMessage,
    stopPollingActionableTransactions,
    startPollingActionableTransactions,
    stopPollingCompletedTransactions,
    startPollingCompletedTransactions,
    shouldRefetchUser,
    refetchHolofuelUser])

  const isLoadingFirstLedger = useLoadingFirstTime(ledgerLoading)
  const inboxCount = actionableTransactions.filter(shouldShowTransactionInInbox).length
  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  const refetchCalls = () => {
    refetchLedger()
    refetchActionableTransactions()
    refetchCompletedTransactions()
    refetchWaitingTransactions()
    refetchNonPendingTransactions()
  }

  const isLoadingRefetchCalls = ledgerLoading || actionableTransactionsLoading || completedTransactionsLoading || nonPendingTransactionsLoading || waitingTransactionsLoading

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={currentUser} agentLoading={currentUserLoading} hamburgerClick={hamburgerClick} inboxCount={inboxCount} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      agent={currentUser}
      agentLoading={currentUserLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
      ledgerLoading={isLoadingFirstLedger}
      isWide={isWide}
      isLoadingRefetchCalls={isLoadingRefetchCalls}
      refetchCalls={refetchCalls} />
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
