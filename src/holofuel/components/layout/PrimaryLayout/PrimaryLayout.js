import React, { useContext, useState, useCallback } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { object } from 'prop-types'
import cx from 'classnames'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { shouldShowTransactionInInbox } from 'models/Transaction'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'
import { useLoadingFirstTime } from 'utils'

export function useUpdatedTransactionLists () {
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {}, refetch: refetchLedger } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network', pollInterval: 30000 })
  const { loading: actionableTransactionsLoading, data: { holofuelActionableTransactions: actionableTransactions = [] } = {}, refetch: refetchActionableTransactions, stopPolling: stopPollingActionableTransactions, startPolling: startPollingActionableTransactions } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: completedTransactionsLoading, refetch: refetchCompletedTransactions, stopPolling: stopPollingCompletedTransactions, startPolling: startPollingCompletedTransactions } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: nonPendingTransactionsLoading, refetch: refetchNonPendingTransactions } = useQuery(HolofuelNonPendingTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: waitingTransactionsLoading, refetch: refetchWaitingTransactions } = useQuery(HolofuelWaitingTransactionsQuery, { fetchPolicy: 'cache-and-network' })

  const isLoadingRefetchCalls = ledgerLoading || actionableTransactionsLoading || completedTransactionsLoading || nonPendingTransactionsLoading || waitingTransactionsLoading

  const stopPolling = useCallback(() => {
    stopPollingActionableTransactions()
    stopPollingCompletedTransactions()
  }, [stopPollingActionableTransactions, stopPollingCompletedTransactions])

  const startPolling = useCallback(pollInterval => {
    startPollingActionableTransactions(pollInterval)
    startPollingCompletedTransactions(pollInterval)
  }, [startPollingActionableTransactions, startPollingCompletedTransactions])

  const refetchCalls = () => {
    refetchLedger()
    refetchActionableTransactions()
    refetchCompletedTransactions()
    refetchWaitingTransactions()
    refetchNonPendingTransactions()
  }

  return {
    actionableTransactions,
    holofuelBalance,
    ledgerLoading,
    isLoadingRefetchCalls,
    stopPolling,
    startPolling,
    refetchCalls
  }
}

export default function PrimaryLayout ({
  children,
  headerProps = {},
  showAlphaFlag = true
}) {
  const { holofuelBalance, actionableTransactions, ledgerLoading, isLoadingRefetchCalls, stopPolling, startPolling, refetchCalls } = useUpdatedTransactionLists()
  const { currentUser, currentUserLoading } = useCurrentUserContext()
  const isLoadingFirstLedger = useLoadingFirstTime(ledgerLoading)
  const inboxCount = actionableTransactions.filter(shouldShowTransactionInInbox).length
  const isWide = useContext(ScreenWidthContext)
  
  const [isMenuOpen, setMenuOpen] = useState(false)
  
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={currentUser} agentLoading={currentUserLoading} hamburgerClick={hamburgerClick} inboxCount={inboxCount} isWide={isWide} />
    <SideMenu
      isOpen={isWide || isMenuOpen}
      handleClose={handleMenuClose}
      agent={currentUser}
      agentLoading={currentUserLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
      ledgerLoading={isLoadingFirstLedger}
      isWide={isWide}
      isLoadingRefetchCalls={isLoadingRefetchCalls}
      refetchCalls={refetchCalls} />
    {(!isWide && showAlphaFlag) && <AlphaFlag styleName='styles.alpha-flag' />}
    <div styleName={cx('styles.content', { 'styles.desktop': isWide })}>
      <FlashMessage />
      {children}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}
