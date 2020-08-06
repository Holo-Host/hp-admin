import React, { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { object } from 'prop-types'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import MyHolofuelUserQuery from 'graphql/MyHolofuelUserQuery.gql'
import useHostedAgentAuthStatusContext from 'holofuel/contexts/useHostedAgentAuthStatusContext'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import useConnectionContext from 'holofuel/contexts/useConnectionContext'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import useHiddenTransactionsContext from 'holofuel/contexts/useHiddenTransactionsContext'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { shouldShowTransactionAsActionable } from 'models/Transaction'
import { INBOX_PATH, isHolofuelPage } from 'holofuel/utils/urls'
import { HP_ADMIN_LOGIN_PATH } from 'utils/urls'
import { wsConnection, holochainClient as webSdkConnection, HOSTED_HOLOFUEL_CONTEXT } from 'holochainClient'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'
import { POLLING_INTERVAL_GENERAL, useInterval, useLoadingFirstTime } from 'utils'

function useUpdatedTransactionLists () {
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {}, refetch: refetchLedger } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network', pollInterval: POLLING_INTERVAL_GENERAL })
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

function PrimaryLayout ({
  children,
  headerProps = {},
  showAlphaFlag = true
}) {
  const { refetch: refetchMyUser } = useQuery(MyHolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const { holofuelBalance, actionableTransactions, ledgerLoading, stopPolling, startPolling } = useUpdatedTransactionLists()

  const { currentUser, currentUserLoading } = useCurrentUserContext()
  const { isConnected, setIsConnected } = useConnectionContext()
  const { newMessage } = useFlashMessageContext()
  const { hiddenTransactionIds } = useHiddenTransactionsContext()
  const { push } = useHistory()

  const actionableTransactionsCount = actionableTransactions.filter(actionableTx => shouldShowTransactionAsActionable(actionableTx, hiddenTransactionIds)).length
  const newActionableItems = !!actionableTransactionsCount && !isHolofuelPage(INBOX_PATH, window)

  const [shouldRefetchMyUser, setShouldRefetchMyUser] = useState(false)
  const refetchMyHolofuelUser = useCallback(() => {
    setShouldRefetchMyUser(false)
    refetchMyUser()
  }, [setShouldRefetchMyUser, refetchMyUser])
  
  // holo hosted specific
  const { isSignedInAsHostedAgent, setIsSignedInAsHostedAgent } = useHostedAgentAuthStatusContext()
  const [hasWebSDKConnection, setHasWebSDKConnection] = useState(false)
  const [hostedAgentContext, setHostedAgentContext] = useState(0)

  const setHostedAgentDetails = useCallback(async () => {
    if (hasWebSDKConnection) {
      // nb: the context is hard coded in chaperone right now to only return 2,
      const hostedAgentContext = await webSdkConnection.context()
      setHostedAgentContext(hostedAgentContext)
      
      // TODO: Update to read as < 3, once chaperonse is updated with contexts...
      // (the context is hard coded in chaperone right now to only return 2)
      // require sign-in if hosted agent context returns a hosted anonymous agent/user
      if (hostedAgentContext < 2) {
        await webSdkConnection.signOut()
        setIsSignedInAsHostedAgent(false)
      }

      if (!isSignedInAsHostedAgent) {
        await webSdkConnection.signIn()
        setIsSignedInAsHostedAgent(true)

        // todo: set IsSignedInAsHostedAgent to isHostedAgentSignedIn response, once resolved have dynamic var from chaperone, informing if signed in...
        // const isHostedAgentSignedIn = await webSdkConnection.signIn()
        // setIsSignedInAsHostedAgent(!!isHostedAgentSignedIn)
        // // retrigger sign in if failed
        // if(!isHostedAgentSignedIn) {
        //   await webSdkConnection.signOut()
        //   await webSdkConnection.signIn()
        // }
      }
    }
  }, [hasWebSDKConnection, isSignedInAsHostedAgent])

  useInterval(() => {
    setIsConnected(wsConnection)
    setHasWebSDKConnection(!!webSdkConnection)
  }, 5000)

  useEffect(() => {
    if (!isConnected) {
      newMessage('Connecting to your Holochain Conductor...', 0)
      stopPolling()
      setShouldRefetchMyUser(true)
      let defaultPath
      if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
        defaultPath = INBOX_PATH
      } else {
        defaultPath = HP_ADMIN_LOGIN_PATH
      }
      push(defaultPath)
    } else {
      startPolling(POLLING_INTERVAL_GENERAL)
      if (shouldRefetchMyUser) {
        refetchMyHolofuelUser()
      }
    }
    // holo hosted specific
    if (HOSTED_HOLOFUEL_CONTEXT) {
      setHostedAgentDetails()
      if (isSignedInAsHostedAgent && hostedAgentContext <= 2) {
        // TODO: Block proceeding to main page if agent is at all anonymous...
        console.log('Proceeding with an anonymous hosted agent context (even though signed in and not anonymous)...  Don\'t allow once chaperone is updated with non static contexts.')
      }
    }  
  }, [isConnected,
    push,
    newMessage,
    startPolling,
    stopPolling,
    shouldRefetchMyUser,
    refetchMyHolofuelUser,
    isSignedInAsHostedAgent,
    hostedAgentContext,
    setHostedAgentDetails
  ])

  const isLoadingFirstLedger = useLoadingFirstTime(ledgerLoading)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const closeMenu = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout')}>
    {(HOSTED_HOLOFUEL_CONTEXT && !isSignedInAsHostedAgent) && <h2 styleName='styles.text'>Connecting to Holo...</ h2>}
    <div styleName={cx('styles.content', { 'styles.hosted-landing-overlay' : (HOSTED_HOLOFUEL_CONTEXT && !isSignedInAsHostedAgent) })}>
      <Header {...headerProps} 
        agent={currentUser}
        agentLoading={currentUserLoading}
        hamburgerClick={hamburgerClick}
        newActionableItems={newActionableItems}
        hostedAgentContext={hostedAgentContext} />
      <SideMenu
        isOpen={isMenuOpen}
        closeMenu={closeMenu}
        agent={currentUser}
        agentLoading={currentUserLoading}
        newActionableItems={newActionableItems}
        holofuelBalance={holofuelBalance}
        ledgerLoading={isLoadingFirstLedger} />
      {showAlphaFlag && <AlphaFlag styleName='styles.alpha-flag' />}

      <div styleName={cx('styles.content')}>
        <FlashMessage />
        {children}
      </div>
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
