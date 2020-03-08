import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty, intersectionBy, find, reject, isNil } from 'lodash/fp'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import Loading from 'components/Loading'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelNewCompletedTransactionsQuery from 'graphql/HolofuelNewCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentAgentId, presentHolofuelAmount, partitionByDate } from 'utils'
import { caribbeanGreen } from 'utils/colors'
import { DIRECTION, STATUS } from 'models/Transaction'
import './TransactionHistory.module.css'
import HashAvatar from '../../../components/HashAvatar/HashAvatar'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'

function usePollCompletedTransactions ({ since }) {
  const { data: { holofuelNewCompletedTransactions = [] } = {} } = useQuery(HolofuelNewCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: 5000, variables: { since } })
  return holofuelNewCompletedTransactions
}

const FILTER_TYPES = ['all', 'withdrawals', 'deposits', 'pending']

export default function TransactionsHistory ({ history: { push } }) {
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network', pollInterval: 5000 })
  const { loading: loadingPendingTransactions, data: { holofuelWaitingTransactions = [] } = {} } = useQuery(HolofuelWaitingTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: 20000 })
  const { loading: loadingCompletedTransactions, data: { holofuelCompletedTransactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network' })

  const since = !isEmpty(holofuelCompletedTransactions) ? holofuelCompletedTransactions[0].timestamp : ''
  const pollingResult = usePollCompletedTransactions({ since })

  const filteredTransactionById = intersectionBy('id', holofuelCompletedTransactions, pollingResult)
  const filteredPollingResult = reject(({ id }) => find({ id }, filteredTransactionById), pollingResult)
  const completedTransactions = holofuelCompletedTransactions.concat(filteredPollingResult)
  const pendingTransactions = holofuelWaitingTransactions.filter(pendingTx => pendingTx.status !== STATUS.completed)

  const goToCreateTransaction = () => push(OFFER_REQUEST_PATH)

  const [filter, setFilter] = useState(FILTER_TYPES[0])

  function useLoadingFirstTime (loading) {
    const [isLoadingFirstTime, setIsLoadingFirstTime] = useState(false)
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

    useEffect(() => {
      if (hasLoadedOnce) return

      if (!isLoadingFirstTime && loading) {
        setIsLoadingFirstTime(true)
      }

      if (isLoadingFirstTime && !loading) {
        setHasLoadedOnce(true)
      }
    }, [loading, isLoadingFirstTime, setIsLoadingFirstTime, hasLoadedOnce, setHasLoadedOnce])

    return !hasLoadedOnce && loading
  }

  let filteredPendingTransactions = []
  let filteredCompletedTransactions = []

  switch (filter) {
    case 'all':
      filteredPendingTransactions = pendingTransactions
      filteredCompletedTransactions = completedTransactions
      break
    case 'withdrawals':
      filteredPendingTransactions = []
      filteredCompletedTransactions = completedTransactions.filter(transaction => transaction.direction === DIRECTION.outgoing)
      break
    case 'deposits':
      filteredPendingTransactions = []
      filteredCompletedTransactions = completedTransactions.filter(transaction => transaction.direction === DIRECTION.incoming)
      break
    case 'pending':
      filteredPendingTransactions = pendingTransactions
      filteredCompletedTransactions = []
      break
    default:
      throw new Error(`unrecognized filter type: "${filter}"`)
  }

  const isLoadingFirstPendingTransactions = useLoadingFirstTime(loadingPendingTransactions)
  const isLoadingFirstCompletedTransactions = useLoadingFirstTime(loadingCompletedTransactions)

  const noVisibleTransactions = isEmpty(filteredPendingTransactions) &&
    isEmpty(filteredCompletedTransactions) &&
    !isLoadingFirstPendingTransactions &&
    !isLoadingFirstCompletedTransactions

  const completedTransactionsPartitionedByDate = partitionByDate(filteredCompletedTransactions)

  let firstCompletedLabel, firstCompletedTransaction
  if (completedTransactionsPartitionedByDate[0]) {
    firstCompletedLabel = completedTransactionsPartitionedByDate[0].label
    firstCompletedTransaction = completedTransactionsPartitionedByDate[0].transactions
  }
  const completedPartitionedTransactions = [{
    label: firstCompletedLabel || 'Completed',
    transactions: firstCompletedTransaction || [],
    loading: isLoadingFirstCompletedTransactions
  }].concat(completedTransactionsPartitionedByDate.slice(1))

  const partitionedTransactions = ([{
    label: 'Pending',
    transactions: filteredPendingTransactions,
    loading: isLoadingFirstPendingTransactions
  }]).concat(completedPartitionedTransactions).filter(({ transactions, loading }) => !isEmpty(transactions) || loading)

  return <PrimaryLayout headerProps={{ title: 'History' }}>
    <div styleName='header'>
      <h4 styleName='balance-label'>Balance</h4>
      <div styleName='balance-amount'>
        <DisplayBalance
          holofuelBalance={holofuelBalance}
          ledgerLoading={isNil(holofuelBalance) && ledgerLoading} />
      </div>

      <FilterButtons filter={filter} setFilter={setFilter} />
    </div>

    {noVisibleTransactions && <div styleName='transactions-empty'>
      <div styleName='transactions-empty-text'>You have no recent activity</div>
      <PlusInDiscIcon styleName='plus-icon' color={caribbeanGreen} onClick={goToCreateTransaction} dataTestId='create-transaction-button' />
    </div>}

    {!noVisibleTransactions && <div styleName='transactions'>
      {partitionedTransactions.map(partition =>
        <TransactionPartition key={partition.label}
          partition={partition} />)}
    </div>}
  </PrimaryLayout>
}

const DisplayBalance = ({ ledgerLoading, holofuelBalance }) => {
  if (ledgerLoading) return <>-- TF</>
  else return <>{presentHolofuelAmount(holofuelBalance)} TF</>
}

function FilterButtons ({ filter, setFilter }) {
  const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1)

  return <div styleName='filter-buttons' data-testid='filter-buttons'>
    {FILTER_TYPES.map(type => <div
      styleName={cx('filter-button', { selected: type === filter })}
      onClick={() => setFilter(type)}
      key={type}>
      {capitalizeFirstLetter(type)}
    </div>)}
  </div>
}

function TransactionPartition ({ partition }) {
  const { label, loading, transactions } = partition

  return <>
    <h4 styleName='partition-label'>{label}</h4>
    {loading && <Loading styleName='partition-loading' />}
    {transactions.map((transaction, index) => <TransactionRow
      key={index}
      transaction={transaction}
      isFirst={index === 0} />)}
  </>
}

export function TransactionRow ({ transaction, isFirst }) {
  const { amount, counterparty, direction, notes, status } = transaction // presentBalance,
  const pending = status === STATUS.pending

  const presentedAmount = direction === DIRECTION.incoming
    ? `+ ${presentHolofuelAmount(amount)}`
    : `- ${presentHolofuelAmount(amount)}`

  return <div styleName={cx('transaction-row', { 'not-first-row': !isFirst })} data-testid='transaction-row'>
    <div styleName='avatar'>
      <CopyAgentId agent={counterparty}>
        <HashAvatar seed={counterparty.id} size={32} />
      </CopyAgentId>
    </div>
    <div styleName='name-and-notes'>
      <div styleName={cx('name', { 'pending-style': pending })}>
        <CopyAgentId agent={counterparty}>
          {counterparty.nickname || presentAgentId(counterparty.id)}
        </CopyAgentId>
      </div>
      <div styleName='notes'>
        {notes}
      </div>
    </div>
    <div styleName='amount-and-balance'>
      <div styleName={cx('amount', { 'pending-style': pending })}>
        {presentedAmount}
      </div>
      {/* BALANCE-BUG: Intentionally commented out until DNA balance bug is resolved. */}
      {/* {presentBalance && <div styleName='transaction-balance'>
        {presentHolofuelAmount(presentBalance)}
      </div>} */}
    </div>
  </div>
}
