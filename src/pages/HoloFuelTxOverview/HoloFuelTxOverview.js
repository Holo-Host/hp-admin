// eslint-disable array-callback-return

import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import Button from 'components/Button'
import './HoloFuelTxOverview.module.css'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompleteTransactionsQuery from 'graphql/HolofuelCompleteTransactionsQuery.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelRejectOfferMutation from 'graphql/HolofuelRejectOfferMutation.gql'

export default function HoloFuelTxOverview ({ history: { push } }) {
  const { data: { holofuelWaitingTransactions = [] } } = useQuery(HolofuelWaitingTransactionsQuery)
  const { data: { holofuelActionableTransactions = [] }, refetch } = useQuery(HolofuelActionableTransactionsQuery)
  const { data: { holofuelCompleteTransactions = [] } } = useQuery(HolofuelCompleteTransactionsQuery)

  const [holofuelOfferMutation] = useMutation(HolofuelOfferMutation)
  const [holofuelAcceptOfferMutation] = useMutation(HolofuelAcceptOfferMutation)
  const [holofuelRejectOfferMutation] = useMutation(HolofuelRejectOfferMutation)
  const holofuelOffer = (counterparty, amount, requestId) => holofuelOfferMutation({ variables: { counterparty, amount, requestId } })
  const holofuelAcceptOffer = transactionId => holofuelAcceptOfferMutation({ variables: { transactionId } })
  const holofuelRejectOffer = transactionId => holofuelRejectOfferMutation({ variables: { transactionId } })

  const goToHfDash = () => push('/holofuel/dashboard')

  // NOTE: This array will update the displayed data before the next query refetch.  In testing enviornments, it also helps track/maintain the visual display of data updates .
  const updatedTx = []
  // Filtering by ID to prevent display of duplicate transactions - purely for mock data / testing scenarios.
  const filterDuplicates = array => _.uniqBy(array, 'id')

  return <div styleName='container'>
    <div styleName='header'>
      <span styleName='title'>HoloFuel Transaction Overview</span>
      <Button onClick={goToHfDash} styleName='menu-button'>HoloFuel Dashboard</Button>
    </div>

    <Button styleName='small-btn' onClick={() => refetch()}>Refetch Actionable Tx</Button>

    <section className='actionable-transactions-table'>
      <h3 className='actionable-transactions'> Actionable Transactions</h3>
      <table>
        <TransactionTableHeader incomplete />
        <tbody>
          {!isEmpty(holofuelActionableTransactions) && holofuelActionableTransactions.map(actionableTx => {
            if (actionableTx.status === 'pending') {
              return <ActionableTransactionsTable
                transaction={actionableTx}
                holofuelRejectOffer={holofuelRejectOffer}
                holofuelOffer={holofuelOffer}
                holofuelAcceptOffer={holofuelAcceptOffer}
                key={actionableTx.id} />
            } else updatedTx.push(actionableTx)
          })}
        </tbody>
      </table>
    </section>

    <section className='waiting-transactions-table'>
      <h3 className='waiting-transactions'> Waiting Transactions</h3>
      <table>
        <TransactionTableHeader incomplete />
        <tbody>
          {!isEmpty(holofuelWaitingTransactions) && holofuelWaitingTransactions.map(waitingTx => {
            if (waitingTx.status === 'pending') {
              return <UnactionableTransactionsTable
                transaction={waitingTx}
                key={waitingTx.id} />
            } else updatedTx.push(waitingTx)
          })}
        </tbody>
      </table>
    </section>

    <section className='complete-transactions-table'>
      <h3 className='complete-transactions'>Complete Transactions</h3>
      <table>
        <TransactionTableHeader />
        <tbody>
          {!isEmpty(holofuelCompleteTransactions) && holofuelCompleteTransactions.concat(filterDuplicates(updatedTx)).map(completeTx => {
            if (completeTx.status === 'complete' || completeTx.status === 'rejected') {
              return <UnactionableTransactionsTable
                transaction={completeTx}
                key={completeTx.id} />
            }
          })}
        </tbody>
      </table>
    </section>
  </div>
}

function UnactionableTransactionsTable ({ transaction }) {
  const { id, timestamp, amount, counterparty, status, type, direction } = transaction
  return <tr key={id}>
    <td className='date-time'>{timestamp && formatDateTime(timestamp)}</td>
    <td className='amount'>{amount}</td>
    <td className='counterparty'>{counterparty}</td>
    <td className='status'>{status}</td>
    <td className='type'>{type}</td>
    <td className='action'>{status === `pending` ? `Awaiting counterparty` : direction === 'incoming' ? 'Recipient' : 'Spender' }</td>
  </tr>
}

function ActionableTransactionsTable ({ transaction, holofuelRejectOffer, holofuelOffer, holofuelAcceptOffer }) {
  const { id, timestamp, amount, counterparty, status, type } = transaction
  return <tr key={id}>
    <td className='date-time'>{timestamp && formatDateTime(timestamp)}</td>
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
          <Button onClick={() => holofuelRejectOffer(id)} className='holofuel-reject-offer'>Reject Payment</Button>
        </td>
        : null}
  </tr>
}

const TransactionTableHeader = ({ incomplete }) => {
  return <thead>
    <tr>
      <th className='date-time'>Date/Time</th>
      <th className='amount'>Amount</th>
      <th className='counterparty'>Counterparty</th>
      <th className='status'>Status</th>
      <th className='type'>Type</th>
      <th className='action'>{incomplete ? 'Action' : 'Role'}</th>
    </tr>
  </thead>
}

function formatDateTime (isoDate) {
  return <React.Fragment>
    { parseInt(moment(isoDate).startOf('day').fromNow().split(' ')[0]) > 1
      ? <p>{ moment(isoDate).format('LLLL')}</p>
      : parseInt(moment(isoDate).startOf('hour').fromNow().split(' ')[0]) > 1
        ? <p>{moment(isoDate).calendar()}</p>
        : <p>{moment(isoDate).startOf('minute').fromNow()}</p>
    }
  </React.Fragment>
}
