import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty, capitalize, intersectionBy, includes, find, reject } from 'lodash/fp'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import Modal from 'holofuel/components/Modal'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import Loading from 'components/Loading'
import Loader from 'react-loader-spinner'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelNewCompletedTransactionsQuery from 'graphql/HolofuelNewCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId, presentHolofuelAmount, partitionByDate } from 'utils'
import { caribbeanGreen } from 'utils/colors'
import { DIRECTION, STATUS } from 'models/Transaction'
import './TransactionHistory.module.css'
import HashAvatar from '../../../components/HashAvatar/HashAvatar'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'

// Data - Mutation hooks with refetch:
function useCancel () {
  const [cancel] = useMutation(HolofuelCancelMutation)
  return (id) => cancel({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelCompletedTransactionsQuery
    }, {
      query: HolofuelWaitingTransactionsQuery
    }]
  })
}

function usePollCompletedTransactions ({ since }) {
  const { data: { holofuelNewCompletedTransactions = [] } = {} } = useQuery(HolofuelNewCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: 5000, variables: { since } })
  return holofuelNewCompletedTransactions
}

const FILTER_TYPES = ['all', 'withdrawals', 'deposits', 'pending']

export default function TransactionsHistory ({ history: { push } }) {
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'network-only' })
  const { loading: loadingPendingTransactions, data: { holofuelWaitingTransactions = [] } = {} } = useQuery(HolofuelWaitingTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: loadingCompletedTransactions, data: { holofuelCompletedTransactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network' })

  const since = !isEmpty(holofuelCompletedTransactions) ? holofuelCompletedTransactions[0].timestamp : ''
  const pollingResult = usePollCompletedTransactions({ since })

  const completedTransactions = holofuelCompletedTransactions.concat(pollingResult)
  const filteredTransactionById = intersectionBy('id', completedTransactions, holofuelWaitingTransactions)
  const pendingTransactions = reject(({ id }) => find({ id }, filteredTransactionById), holofuelWaitingTransactions)

  const cancelTransaction = useCancel()
  const [modalTransaction, setModalTransaction] = useState()
  const showCancellationModal = transaction => setModalTransaction(transaction)

  const goToCreateTransaction = () => push(OFFER_REQUEST_PATH)

  const [hasTransactionBeenActioned, setHasTransactionBeenActioned] = useState({})

  const disableActionedTransaction = transactionId => {
    if (hasTransactionBeenActioned.idList) {
      return hasTransactionBeenActioned.idList.find(txid => txid === transactionId)
    } else return false
  }

  const increaseAction = () => includes(DIRECTION.incoming, hasTransactionBeenActioned)
  const decreseAction = () => includes(DIRECTION.outgoing, hasTransactionBeenActioned)
  const statusQuoAction = () => includes('status-quo', hasTransactionBeenActioned)

  const [filter, setFilter] = useState(FILTER_TYPES[0])

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

  const noVisibleTransactions = isEmpty(filteredPendingTransactions) &&
    isEmpty(filteredCompletedTransactions) &&
    !loadingPendingTransactions &&
    !loadingCompletedTransactions

  const completedTransactionsPartitionedByDate = partitionByDate(filteredCompletedTransactions)

  let firstCompletedLabel, firstCompletedTransaction
  if (completedTransactionsPartitionedByDate[0]) {
    firstCompletedLabel = completedTransactionsPartitionedByDate[0].label
    firstCompletedTransaction = completedTransactionsPartitionedByDate[0].transactions
  }
  const completedPartitionedTransactions = [{
    label: firstCompletedLabel || 'Completed',
    transactions: firstCompletedTransaction || [],
    loading: loadingCompletedTransactions
  }].concat(completedTransactionsPartitionedByDate.slice(1))

  const partitionedTransactions = ([{
    label: 'Pending',
    transactions: filteredPendingTransactions,
    loading: loadingPendingTransactions
  }]).concat(completedPartitionedTransactions).filter(({ transactions, loading }) => !isEmpty(transactions) || loading)

  return <PrimaryLayout headerProps={{ title: 'History' }}>
    <div styleName='header'>
      <h4 styleName='balance-label'>Balance</h4>
      <div styleName='balance-amount'>
        <DisplayBalance
          holofuelBalance={holofuelBalance}
          ledgerLoading={ledgerLoading} />
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
          partition={partition}
          disableActionedTransaction={disableActionedTransaction}
          increaseAction={increaseAction}
          decreseAction={decreseAction}
          statusQuoAction={statusQuoAction}
          showCancellationModal={showCancellationModal} />)}
    </div>}

    <ConfirmCancellationModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction}
      cancelTransaction={cancelTransaction}
      setHasTransactionBeenActioned={setHasTransactionBeenActioned} />
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

function TransactionPartition ({ partition, disableActionedTransaction, showCancellationModal, increaseAction, decreseAction, statusQuoAction }) {
  const { label, loading, transactions } = partition
  return <>
    <h4 styleName='partition-label'>{label}</h4>
    {loading && <Loading styleName='partition-loading' />}
    {transactions.map((transaction, index) => <TransactionRow
      key={transaction.id}
      transaction={transaction}
      disableActionedTransaction={disableActionedTransaction}
      increaseAction={increaseAction}
      decreseAction={decreseAction}
      statusQuoAction={statusQuoAction}
      showCancellationModal={showCancellationModal}
      isFirst={index === 0} />)}
  </>
}

export function TransactionRow ({ transaction, disableActionedTransaction, showCancellationModal, isFirst, increaseAction, decreseAction, statusQuoAction }) {
  const { amount, counterparty, direction, presentBalance, notes, status } = transaction
  const pending = status === STATUS.pending

  const presentedAmount = direction === DIRECTION.incoming
    ? `+ ${presentHolofuelAmount(amount)}`
    : `- ${presentHolofuelAmount(amount)}`

  const disabledTransaction = disableActionedTransaction(transaction.id)
  let higlightGreen, highlightRed, highlightNeutral
  if (disabledTransaction) {
    higlightGreen = increaseAction()
    highlightRed = decreseAction()
    highlightNeutral = statusQuoAction()
  }

  return <div styleName={cx('transaction-row', { 'not-first-row': !isFirst }, { disabled: disabledTransaction }, { higlightGreen }, { highlightRed }, { highlightNeutral })} data-testid='transaction-row'>
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
      {presentBalance && <div styleName='transaction-balance'>
        {presentHolofuelAmount(presentBalance)}
      </div>}
    </div>
    {pending && <CancelButton transaction={transaction} showCancellationModal={showCancellationModal} />}
  </div>
}

function CancelButton ({ showCancellationModal, transaction }) {
  return <div
    onClick={() => showCancellationModal(transaction)}
    styleName='cancel-button'
    data-testid='cancel-button'>
    -
  </div>
}

// NOTE: Check to see if/agree as to whether we can abstract out the below modal component
export function ConfirmCancellationModal ({ transaction, handleClose, cancelTransaction, setHasTransactionBeenActioned }) {
  const { newMessage } = useFlashMessageContext()
  const { id, counterparty, amount, type, direction } = transaction

  useEffect(() => {
    // eslint-disable-next-line no-useless-return
    if (isEmpty(transaction)) return
  }, [transaction])

  const onYes = () => {
    newMessage(<>
      <Loader type='Circles' color='#FFF' height={30} width={30} timeout={5000}>Sending...</Loader>
    </>, 5000)

    setHasTransactionBeenActioned({
      direction,
      idList: [id]
    })

    cancelTransaction(id).then(() => {
      newMessage(`${capitalize(type)} succesfully cancelled.`, 5000)
    }).catch(() => {
      newMessage('Sorry, something went wrong', 5000)
    })
    handleClose()
  }
  return <Modal
    contentLabel={`Cancel ${type}?`}
    isOpen={!!transaction}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-text' role='heading'>
      Cancel {capitalize(type)} of {presentHolofuelAmount(amount)} TF {direction === 'incoming' ? 'from' : 'to'} {counterparty.nickname || presentAgentId(counterparty.id)}?
    </div>
    <div styleName='modal-buttons'>
      <Button
        onClick={handleClose}
        variant='green'
        styleName='modal-button-no'>
        No
      </Button>
      <Button
        onClick={onYes}
        variant='green'
        styleName='modal-button-yes'>
        Yes
      </Button>
    </div>
  </Modal>
}
