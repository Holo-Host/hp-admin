import React, { useContext, useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty, pick } from 'lodash/fp'
import { object } from 'prop-types'
import cx from 'classnames'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelRefundTransactionsMutation from 'graphql/HolofuelRefundTransactionsMutation.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { TYPE, STATUS } from 'models/Transaction'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

function useRefundTransactions () {
  const [refundTransactions] = useMutation(HolofuelRefundTransactionsMutation)
  return transactions => {
    const transactionInputs = transactions.map(transaction => ({
      ...pick(['id', 'amount', 'counterparty', 'direction', 'status', 'type', 'timestamp', 'fees', 'notes'], transaction),
      counterparty: pick(['id', 'nickname'], transaction.counterparty)
    }))

    refundTransactions({
      variables: { transactions: transactionInputs },
      refetchQueries: [{
        query: HolofuelLedgerQuery
      }]
    })
  }
}

function PrimaryLayout ({
  children,
  headerProps = {},
  showAlphaFlag = true
}) {
  const { data: { holofuelActionableTransactions: actionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: holofuelUserLoading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })

  const inboxCount = actionableTransactions.filter(actionableTx => actionableTx.status !== STATUS.canceled && !((actionableTx.status === STATUS.declined) && (actionableTx.type === TYPE.request))).length

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  const childrenWithProps = React.Children.map(children, child => {
    if (!isEmpty(child)) return React.cloneElement(child, { whoami: holofuelUser })
  })

  const refundTransactions = useRefundTransactions()
  const declinedOffers = actionableTransactions.filter(transaction => ((transaction.status === STATUS.declined) && (transaction.type === TYPE.offer)))

  // useEffect(() => {
  //   if (!isEmpty(declinedOffers)) {
  //     refundTransactions(declinedOffers)
  //   }
  // }, [refundTransactions, declinedOffers])

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={holofuelUser} agentLoading={holofuelUserLoading} hamburgerClick={hamburgerClick} inboxCount={inboxCount} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      agent={holofuelUser}
      agentLoading={holofuelUserLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
      ledgerLoading={ledgerLoading}
      isWide={isWide}
    />
    {showAlphaFlag && <AlphaFlag styleName='styles.alpha-flag' />}
    <div styleName='styles.content'>
      <FlashMessage />
      {childrenWithProps}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
