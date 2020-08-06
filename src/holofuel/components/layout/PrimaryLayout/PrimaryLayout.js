import React, { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { object } from 'prop-types'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import MyHolofuelUserQuery from 'graphql/MyHolofuelUserQuery.gql'
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

  useInterval(() => {
    setIsConnected(wsConnection)
  }, 5000)
  
  // holo hosted specific
  const [isSignedInAsHostedAgent, setIsSignedInAsHostedAgent] = useState(false)
  const [hostedAgentContext, setHostedAgentContext] = useState(0)
  // console.log('>>>>>>>>>>> isSignedInAsHostedAgent : ', isSignedInAsHostedAgent);

  // const setHostedAgentDetails = useCallback(async () => {
  //   if (webSdkConnection) {
  //     // nb: the context is hard coded in chaperone right now to only return 2,
  //     const hostedAgentContext = await webSdkConnection.context()
  //     console.log('>>>>>>>>>>> hostedAgentContext : ', hostedAgentContext);
  //     setHostedAgentContext(hostedAgentContext)
      
  //     // only require sign-in if hosted agent context returns a hosted anonymous agent/user
  //     if (hostedAgentContext <= 2) {
  //       console.log('>>>>>>>>>>> hostedAgentContext is less than 2 : ');

  //       // const isHostedAgentSignedIn = await webSdkConnection.signIn()
  //       // console.log('>>>>>>>>>>> isHostedAgentSignedIn : ', isHostedAgentSignedIn);
  //       // setIsSignedInAsHostedAgent(isHostedAgentSignedIn)
  //       // // retrigger sign in if failed
  //       // if(!isHostedAgentSignedIn) {
  //       //   await webSdkConnection.signOut()
  //       //   await webSdkConnection.signIn()
  //       // }
  //     }
  //   }
  // }, [])

  useEffect(() => {
    console.log('HOSTED_HOLOFUEL_CONTEXT && !isSignedInAsHostedAgent : ', HOSTED_HOLOFUEL_CONTEXT && !isSignedInAsHostedAgent);
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
      // setHostedAgentDetails()
      if (isSignedInAsHostedAgent && hostedAgentContext <= 2) {
        // TODO: Block proceeding to main page if agent is at all anonymous...
        console.log('Proceeding as an anonymous hosted agent...!  Don\'t allow once chaperone is updated')
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
    // setHostedAgentDetails
  ])

  const isLoadingFirstLedger = useLoadingFirstTime(ledgerLoading)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const closeMenu = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.hosted-landing-overlay' : (HOSTED_HOLOFUEL_CONTEXT && !isSignedInAsHostedAgent) })}>
    <Header {...headerProps} 
      agent={currentUser}
      agentLoading={currentUserLoading}
      hamburgerClick={hamburgerClick}
      newActionableItems={newActionableItems}
      hostedAgentContext={hostedAgentContext}
      isSignedInAsHostedAgent={isSignedInAsHostedAgent}
      setIsSignedInAsHostedAgent={setIsSignedInAsHostedAgent} />
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
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
