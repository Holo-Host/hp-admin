import React, { useState } from 'react'
import cx from 'classnames'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty, capitalize, uniqBy, get } from 'lodash/fp'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import Modal from 'holofuel/components/Modal'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'
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

function useTransactionsWithCounterparties () {
  const { data: { holofuelUser: whoami = {} } = {} } = useQuery(HolofuelUserQuery)
  const { data: { holofuelHistoryCounterparties = [] } = {} } = useQuery(HolofuelHistoryCounterpartiesQuery, { fetchPolicy: 'network-only' })
  const { data: { holofuelCompletedTransactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'network-only' })
  const { data: { holofuelWaitingTransactions = [] } = {} } = useQuery(HolofuelWaitingTransactionsQuery, { fetchPolicy: 'network-only' })

  const updateCounterparties = (transactions, counterparties) => transactions.map(transaction => ({
    ...transaction,
    counterparty: counterparties.find(counterparty => counterparty.id === get('counterparty.id', transaction)) || transaction.counterparty
  }))

  const allCounterparties = uniqBy('id', holofuelHistoryCounterparties.concat([whoami]))

  const updatedCompletedTransactions = updateCounterparties(holofuelCompletedTransactions, allCounterparties)
  const updatedWaitingTransactions = updateCounterparties(holofuelWaitingTransactions, allCounterparties)

  return {
    completedTransactions: updatedCompletedTransactions,
    pendingTransactions: updatedWaitingTransactions
  }
}

const FILTER_TYPES = ['all', 'withdrawals', 'deposits', 'pending']

export default function TransactionsHistory ({ history: { push }}) {
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'network-only' })
  const { completedTransactions, pendingTransactions } = useTransactionsWithCounterparties()

  const cancelTransaction = useCancel()
  const [modalTransaction, setModalTransaction] = useState()
  const showCancellationModal = transaction => setModalTransaction(transaction)

  const goToCreateTransaction = () => push(OFFER_REQUEST_PATH)

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

  const noVisibleTransactions = isEmpty(filteredPendingTransactions) && isEmpty(filteredCompletedTransactions)

  const partitionedTransactions = ([{
    label: 'Pending',
    transactions: filteredPendingTransactions
  }].concat(partitionByDate(filteredCompletedTransactions)))
    .filter(({ transactions }) => !isEmpty(transactions))

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

    {!noVisibleTransactions && <div styleName='transactions-empty'>
      <div styleName='transactions-empty-text'>You have no recent activity</div>
      <PlusInDiscIcon styleName='plus-icon' color={caribbeanGreen} onClick={goToCreateTransaction} />
    </div>}

    {noVisibleTransactions && <div styleName='transactions'>
      {partitionedTransactions.map(({ label, transactions }) => <React.Fragment key={label}>
        <h4 styleName='partition-label'>{label}</h4>
        {transactions.map((transaction, index) => <TransactionRow
          transaction={transaction}
          key={transaction.id}
          showCancellationModal={showCancellationModal}
          isFirst={index === 0} />)}
      </React.Fragment>)}
    </div>}

    <ConfirmCancellationModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction}
      cancelTransaction={cancelTransaction} />
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

export function TransactionRow ({ transaction, showCancellationModal, isFirst }) {
  const { amount, counterparty, direction, presentBalance, notes, status } = transaction
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
export function ConfirmCancellationModal ({ transaction, handleClose, cancelTransaction }) {
  if (!transaction) return null
  const { id, counterparty, amount, type, direction } = transaction
  const onYes = () => {
    cancelTransaction(id)
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
