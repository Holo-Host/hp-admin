import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import Button from 'components/Button'
import './HoloFuelTxOverview.module.css'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompleteTransactionsQuery from 'graphql/HolofuelCompleteTransactionsQuery.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'

export default function HoloFuelTxOverview ({ history: { push } }) { 
  const { data: { holofuelWaitingTransactions = [] } } = useQuery(HolofuelWaitingTransactionsQuery)
  const { data: { holofuelActionableTransactions = [] } } = useQuery(HolofuelActionableTransactionsQuery)
  const { data: { holofuelCompleteTransactions = [] } } = useQuery(HolofuelCompleteTransactionsQuery)

  const [holofuelOfferMutation] = useMutation(HolofuelOfferMutation)
  const [holofuelAcceptOfferMutation] = useMutation(HolofuelAcceptOfferMutation)
  const holofuelOffer = (counterparty, amount, requestId) => holofuelOfferMutation({ variables: { counterparty, amount, requestId } })
  const holofuelAcceptOffer = transactionId => holofuelAcceptOfferMutation({ variables: { transactionId } })

  return <div styleName='container'>
    <div>
      <span styleName='title'>HoloFuel Transaction Overview</span>
    </div>
    <div styleName='header'>
      <main className='complete-transactions-table' role='main'>
        <h3 className='pending-transactions'> Pending Transactions</h3>
        <table>
          <thead>
            <tr>
              <th className='date-time'>Date/Time</th>
              <th className='amount'>Amount</th>
              <th className='counterparty'>Counterparty</th>
              <th className='status'>Status</th>
              <th className='type'>Type</th>
              <th className='action'>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isEmpty(holofuelActionableTransactions) && holofuelActionableTransactions.map(actionableTx =>
              <ActionableTransactionsTable
                transaction={actionableTx}
                holofuelOffer={holofuelOffer}
                holofuelAcceptOffer={holofuelAcceptOffer}
                key={actionableTx.id} />)}

            {!isEmpty(holofuelWaitingTransactions) && holofuelWaitingTransactions.map(waitingTx =>
              <TransactionsTable
                transaction={waitingTx}
                key={waitingTx.id} />)}
          </tbody>
        </table>
      </main>
    </div>

    <main className='complete-transactions-table' role='main'>
      <h3 className='complete-transactions'>Complete Transactions</h3>
      <table>
        <thead>
          <tr>
            <th className='date-time'>Date/Time</th>
            <th className='amount'>Amount</th>
            <th className='counterparty'>Counterparty</th>
            <th className='status'>Status</th>
            <th className='type'>Type</th>
            <th className='action' />
          </tr>
        </thead>
        <tbody>
          {!isEmpty(holofuelCompleteTransactions) && holofuelCompleteTransactions.map(completeTx =>
            <TransactionsTable
              transaction={completeTx}
              key={completeTx.id} />)}
        </tbody>
      </table>
    </main>
  </div>
}

function separateDateTime (isoDate) {
  const dateString = isoDate.toString().substring(0,10)
  const timeString = isoDate.toString().substring(11)
  return <div>
    {dateString}
    <br />
    {timeString}
  </div>
}

function TransactionsTable ({ transaction }) {
  const { id, timestamp, amount, counterparty, status, type } = transaction
  return <tr key={id}>
    <td className='date-time'>{timestamp && separateDateTime(timestamp)}</td>
    <td className='amount'>{amount}</td>
    <td className='counterparty'>{counterparty}</td>
    <td className='status'>{status}</td>
    <td className='type'>{type}</td>
    <td className='action'>{status === `pending` ? `Awaiting counterparty`: null}</td>
  </tr>
}

function ActionableTransactionsTable ({ transaction, holofuelOffer, holofuelAcceptOffer }) {
  const { id, timestamp, amount, counterparty, status, type } = transaction
  return <tr key={id}>
    <td className='date-time'>{timestamp && separateDateTime(timestamp)}</td>
    <td className='amount'>{amount}</td>
    <td className='counterparty'>{counterparty}</td>
    <td className='status'>{status}</td>
    <td className='type'>{type}</td>
    { type === 'request' && status === 'pending'
      ? <td className='action'>
        <Button onClick={() => holofuelOffer(counterparty, amount, id)} className='holofuel-offer'>Pay in Full</Button>
      </td>
      : type === 'offer' && status === 'pending'
        ? <td className='action'>
          <Button onClick={() => holofuelAcceptOffer(id)} className='holofuel-accept-offer'>Accept Payment</Button>
        </td>
        : null}
  </tr>
}
