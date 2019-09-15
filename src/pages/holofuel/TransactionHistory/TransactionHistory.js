import React, { useState } from 'react'
import moment from 'moment'
import cx from 'classnames'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './TransactionHistory.module.css'
import Header from 'components/holofuel/Header'
import Button from 'components/holofuel/Button'
import Modal from 'components/holofuel/Modal'

import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'

function useCancel () {
  const [cancel] = useMutation(HolofuelCancelMutation)
  return id => cancel({
    variables: { transactionId: id },
    // (NOTE: Verify that the format below is correct (for refetching two quries upon an actionHandler....)
    refetchQueries: [{
      query: HolofuelCompletedTransactionsQuery
    }, {
      query: HolofuelActionableTransactionsQuery
    }]
  })
}

export default function TransactionsHistory ({ history: { push } }) {
  const { data: { holofuelUser: whoami = [] } } = useQuery(HolofuelUserQuery)
  const { data: { holofuelCompletedTransactions: completeTransactions = [] } } = useQuery(HolofuelCompletedTransactionsQuery)
  const { data: { holofuelActionableTransactions: pendingTransactions = [] } } = useQuery(HolofuelActionableTransactionsQuery)

  console.log(' >>>> HOLOFUEL whoami ? <<<<<<< ', whoami)

  const cancelTransaction = useCancel()
  const [modalTransaction, setModalTransaction] = useState()

  const showCancellationModal = transaction => setModalTransaction(transaction)

  // NOTE: Column Header Titles (or null) => This provides a space fore easy updating of headers, should we decide to rename or substitute a null header with a title.
  const headings = [
    null,
    null,
    'Fees',
    'Amount',
    null
  ]

  return <React.Fragment>
    <Header title='HoloFuel' accountNumber='AC1903F8EAAC1903F8EA' />

    <section styleName='account-ledger-table'>
      <h2 styleName='completed-transactions-title'>History</h2>
      <table styleName='completed-transactions-table'>
        <thead>
          <tr key='heading'>
            {headings && headings.map((header, contentIndex) => {
              return (
                <TransactionEntry
                  key={`heading-${contentIndex}`}
                  content={header}
                />
              )
            })}
          </tr>
        </thead>
        <tbody>
          {!isEmpty(pendingTransactions) && pendingTransactions.filter(t => t.counterparty === whoami.id).map(pendingTx => {
            return <LedgerTransactionsTable
              transaction={pendingTx}
              key={pendingTx.id}
              showCancellationModal={showCancellationModal}
              pending />
          })}

          {!isEmpty(completeTransactions) && completeTransactions.map(completeTx => {
            return <LedgerTransactionsTable
              transaction={completeTx}
              key={completeTx.id}
              showCancellationModal={showCancellationModal}
              complete />
          })}
        </tbody>
      </table>
    </section>

    <ConfirmCancellationModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction}
      cancelTransaction={cancelTransaction} />

  </React.Fragment>
}

export function LedgerTransactionsTable ({ transaction, showCancellationModal, complete }) {
  const { id, timestamp, amount, counterparty, direction, fees, presentBalance, notes } = transaction
  return <tr key={id} styleName='table-content-row' data-testid='transactions-table-row'>
    <td id='date-time' styleName='completed-tx-col table-content' data-testid='cell-date-time'>{timestamp && formatDateTime(timestamp)}</td>
    <td styleName='completed-tx-col table-content'>
      <h4 id='counterparty' data-testid='cell-counterparty'>{counterparty && makeDisplayName(counterparty)}</h4>
      <p id='notes' styleName='italic' data-testid='cell-notes'>{notes || 'none'}</p>
    </td>
    <td id='fees' styleName='completed-tx-col table-content red-text' data-testid='cell-fees'>{fees}</td>
    <td id='amount' styleName={cx('completed-tx-col table-content', { 'red-text': direction === 'outgoing' }, { 'green-text': direction === 'incoming' })} data-testid='cell-amount'>{amount}</td>
    { complete && !isEmpty(presentBalance)
      ? <td id='present-balance' styleName='completed-tx-col table-content' data-testid='cell-present-balance'>{presentBalance}</td>
      : <td id='pending-item' styleName='completed-tx-col table-content' data-testid='cell-pending-item'>
        <p styleName='italic'>Pending</p>
        <CancelButton transaction={transaction} showCancellationModal={showCancellationModal} />
      </td>
    }
  </tr>
}

const TransactionEntry = ({ content }) => {
  return <th id={content ? content.toLowerCase() : null} styleName='completed-tx-col table-headers'>
    {content || null}
  </th>
}

export const makeDisplayName = agentHash => agentHash.substring(agentHash.length - 7).toUpperCase() || ''

export function formatDateTime (isoDate) {
  const dateDifference = moment(isoDate).startOf('date').fromNow()
  const daysDifferent = moment().diff(isoDate, 'days')
  console.log('dateDifference : ', dateDifference)
  console.log('daysDifferent : ', daysDifferent)
  if (dateDifference.split(' ')[1] === 'days' && parseInt(dateDifference.split(' ')[0]) >= 7) {
    return moment(isoDate).format('LLL')
  } else if (dateDifference.split(' ')[1] === 'hours' && parseInt(moment(isoDate).startOf('hour').fromNow().split(' ')[0]) > 1) {
    return moment(isoDate).startOf('hour').fromNow()
  } else return moment(isoDate).startOf('minute').fromNow()
}

function CancelButton ({ showCancellationModal, transaction }) {
  return <Button
    onClick={() => showCancellationModal(transaction)}
    styleName='cancel-button'>
    Cancel
  </Button>
}

// NOTE: Check to see if/agree as to whether we can abstract out the below modal component
function ConfirmCancellationModal ({ transaction, handleClose, cancelTransaction }) {
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
    <div styleName='modal-title'>Are you sure?</div>
    <div styleName='modal-text'>
      Cancel {type} {direction === 'incoming' ? 'from' : 'to'} <span styleName='modal-counterparty'>{makeDisplayName(counterparty)}</span> for <span styleName='modal-amount'>{Number(amount).toLocaleString()} HF</span>?
    </div>
    <div styleName='modal-buttons'>
      <Button
        onClick={handleClose}
        styleName='modal-button-no'>
        No
      </Button>
      <Button
        onClick={onYes}
        styleName='modal-button-yes'>
        Yes
      </Button>
    </div>
  </Modal>
}
