import React, { useState } from 'react'
import cx from 'classnames'
import _ from 'lodash'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './TransactionHistory.module.css'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'holofuel/components/Button'
import Modal from 'holofuel/components/Modal'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'
import { presentAgentId, presentHolofuelAmount, presentDateAndTime } from 'utils'

// Data - Mutation hook with refetch:
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

function useFetchCounterparties () {
  const { loading, error, data: { holofuelHistoryCounterparties } = {}, cache } = useQuery(HolofuelHistoryCounterpartiesQuery)

  if (holofuelHistoryCounterparties && cache) {
    console.log('>>>>>>>>>>>>> INSIDE CACHE R/W && UPDATE')
    const filterTransactionsByAgentId = (agent, txListType) => txListType.filter(transaction => transaction.counterparty.id === agent.id)
    const updateTxListCounterparties = (txListType, counterpartyList) => counterpartyList.map(agent => {
      const matchingTx = filterTransactionsByAgentId(agent, txListType)
      return matchingTx.map(transaction => { Object.assign(transaction.counterparty, agent); return transaction })
    })

    // cache Read/Write/Update for HolofuelCompletedTransactionsQuery
    const { holofuelCompletedTransactions } = cache.readQuery({
      query: HolofuelCompletedTransactionsQuery
    })
    const newCompletedTxList = _.flatten(updateTxListCounterparties(holofuelCompletedTransactions, holofuelHistoryCounterparties))
    cache.writeQuery({
      query: HolofuelCompletedTransactionsQuery,
      data: {
        holofuelCompletedTransactions: { ...newCompletedTxList }
      }
    })

    // cache Read/Write/Update for HolofuelWaitingTransactionsQuery
    const { holofuelWaitingTransactions } = cache.readQuery({
      query: HolofuelWaitingTransactionsQuery
    })
    const newWaitingTxList = _.flatten(updateTxListCounterparties(holofuelWaitingTransactions, holofuelHistoryCounterparties))
    cache.writeQuery({
      query: HolofuelWaitingTransactionsQuery,
      data: {
        holofuelWaitingTransactions: { ...newWaitingTxList }
      }
    })
  }

  let response
  if (loading) response = { loading: true }
  if (error) response = { error: `Error: ${error}` }
  else response = holofuelHistoryCounterparties
  return response
}

// Display - Functional Components with Hooks :
export default function TransactionsHistory () {
  const { data: { holofuelCompletedTransactions: completedTransactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery)
  const { data: { holofuelWaitingTransactions: pendingTransactions = [] } = {} } = useQuery(HolofuelWaitingTransactionsQuery)

  const cancelTransaction = useCancel()
  const counterpartyList = useFetchCounterparties()
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

  return <PrimaryLayout headerProps={{ title: 'History' }}>
    <section styleName='account-ledger-table'>
      <table styleName='completed-transactions-table'>
        <thead>
          <tr key='heading'>
            {headings && headings.map((header, contentIndex) => {
              return (
                <TransactionTableHeading
                  key={`heading-${contentIndex}`}
                  content={header}
                />
              )
            })}
          </tr>
        </thead>
        <tbody>
          {!isEmpty(pendingTransactions) && pendingTransactions.map(pendingTx => {
            return <TransactionRow
              transaction={pendingTx}
              key={pendingTx.id}
              counterpartyList={counterpartyList}
              showCancellationModal={showCancellationModal}
            />
          })}

          {!isEmpty(completedTransactions) && completedTransactions.map(completeTx => {
            return <TransactionRow
              transaction={completeTx}
              key={completeTx.id}
              counterpartyList={counterpartyList}
              showCancellationModal={showCancellationModal}
              completed />
          })}
        </tbody>
      </table>
    </section>

    <ConfirmCancellationModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction}
      cancelTransaction={cancelTransaction} />
  </PrimaryLayout>
}

const TransactionTableHeading = ({ content }) => {
  return <th id={content ? content.toLowerCase() : null} styleName='completed-tx-col table-headers'>
    {content}
  </th>
}

export function TransactionRow ({ transaction, showCancellationModal, completed, counterpartyList }) {
  const { id, timestamp, amount, counterparty, direction, fees, presentBalance, notes } = transaction

  let counterpartyNick = 'Loading...'
  if (counterpartyList && !counterpartyList.loading) counterpartyNick = counterpartyList.find(agent => agent.id === counterparty.id).nickname
  // console.log('COUNTERPARTY NICKNAME : ', counterpartyNick)

  const { date, time } = presentDateAndTime(timestamp)
  return <tr key={id} styleName={cx('table-content-row', { 'pending-transaction': !completed })} data-testid='transactions-table-row'>
    <td styleName='completed-tx-col table-content'>
      <p data-testid='cell-date'>{date}</p>
      <p data-testid='cell-time'>{time}</p>
    </td>
    <td styleName='completed-tx-col table-content align-left'>
      <h4 data-testid='cell-counterparty'>
        {/* <RenderNickname agentId={counterparty.id} copyId /> */}
        {counterpartyNick}
        {/* {counterparty.nickname || counterparty.id} */}
      </h4>
      <p styleName='italic' data-testid='cell-notes'>{notes || 'none'}</p>
    </td>
    <td styleName={cx('completed-tx-col table-content', { 'red-text': fees !== 0 })} data-testid='cell-fees'>{fees}</td>
    <AmountCell amount={amount} direction={direction} />
    { completed
      ? <td styleName='completed-tx-col table-content' data-testid='cell-present-balance'>{presentBalance}</td>
      : <td styleName='completed-tx-col table-content' data-testid='cell-pending-item'>
        <p styleName='italic'>Pending</p>
        <CancelButton transaction={transaction} showCancellationModal={showCancellationModal} />
      </td>
    }
  </tr>
}

function AmountCell ({ amount, direction }) {
  const amountDisplay = direction === 'outgoing' ? `(${presentHolofuelAmount(amount)})` : presentHolofuelAmount(amount)
  return <td
    styleName={cx('completed-tx-col table-content', { 'red-text': direction === 'outgoing' }, { 'green-text': direction === 'incoming' })}
    data-testid='cell-amount'>
    {amountDisplay}
  </td>
}

function CancelButton ({ showCancellationModal, transaction }) {
  return <Button
    onClick={() => showCancellationModal(transaction)}
    styleName='cancel-button'>
    Cancel
  </Button>
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
    <div styleName='modal-title'>Are you sure?</div>
    <div styleName='modal-text' role='heading'>
      Cancel your {_.capitalize(type)} {direction === 'incoming' ? 'for' : 'of'} <span styleName='modal-amount' data-testid='modal-amount'>{presentHolofuelAmount(amount)} HF</span> {direction === 'incoming' ? 'from' : 'to'} <span styleName='modal-counterparty' testid='modal-counterparty'><RenderNickname agentId={counterparty.id} /></span> ?
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

export function RenderNickname ({ agentId, copyId }) {
  const { loading, error, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })

  console.log('RENDERNICKNAME >>> holofuelCounterparty : ', holofuelCounterparty)

  if ((loading || error || holofuelCounterparty === {}) && !copyId) return <>{presentAgentId(agentId)}</>
  else if ((loading || error || holofuelCounterparty === {}) && copyId) {
    return <CopyAgentId agent={{ id: agentId, nickname: '' }}>
      {presentAgentId(agentId)}
    </CopyAgentId>
  } else if (holofuelCounterparty.nickname && copyId) {
    return <CopyAgentId agent={holofuelCounterparty}>
      {holofuelCounterparty.nickname}
    </CopyAgentId>
  } else return <>{holofuelCounterparty.nickname}</>
}
