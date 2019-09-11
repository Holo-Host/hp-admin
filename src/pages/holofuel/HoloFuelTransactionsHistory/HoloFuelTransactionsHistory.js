import React from 'react'
import moment from 'moment'
import cx from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './HoloFuelTransactionsHistory.module.css'
import Header from 'components/Header'

import HolofuelCompleteTransactionsQuery from 'graphql/HolofuelCompleteTransactionsQuery.gql'

export default function HoloFuelTransactionsHistory ({ history: { push } }) {
  const { data: { holofuelCompleteTransactions = [] } } = useQuery(HolofuelCompleteTransactionsQuery)

  const headings = [
    null,
    null,
    'Amount',
    'Fees',
    null
  ]

  return <React.Fragment>
    <Header title='HoloFuel' />

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
          {!isEmpty(holofuelCompleteTransactions) && holofuelCompleteTransactions.map(completeTx => {
            return <LedgerTransactionsTable
              transaction={completeTx}
              key={completeTx.id} />
          })}
        </tbody>
      </table>
    </section>
  </React.Fragment>
}

export function LedgerTransactionsTable ({ transaction }) {
  const { id, timestamp, amount, counterparty, direction, fees, presentBalance, notes } = transaction
  return <tr key={id} styleName='table-content-row' data-testid='transactions-table-row'>
    <td id='date-time' styleName='completed-tx-col table-content' data-testid='cell-date-time'>{timestamp && formatDateTime(timestamp)}</td>
    <td id='counterparty' styleName='completed-tx-col table-content'>
      <h4 data-testid='cell-counterparty'>{counterparty && makeDisplayName(counterparty)}</h4>
      <p data-testid='cell-notes'>{notes || 'none'}</p>
    </td>
    <td id='amount' styleName={cx('completed-tx-col table-content', { 'red-text': direction === 'outgoing' }, { 'green-text': direction === 'incoming' })} data-testid='cell-amount'>{direction === 'incoming' ? '+' : '-'}{amount}</td>
    <td id='fees' styleName='completed-tx-col table-content red-text' data-testid='cell-fees'>{fees}</td>
    <td id='present-balance' styleName='completed-tx-col table-content' data-testid='cell-present-balance'>{presentBalance}</td>
  </tr>
}

const TransactionEntry = ({ content }) => {
  return <th id={content ? content.toLowerCase() : null} styleName='completed-tx-col table-headers'>
    {content || null}
  </th>
}

function formatDateTime (isoDate) {
  return <React.Fragment>
    { parseInt(moment(isoDate).startOf('day').fromNow().split(' ')[0]) > 1
      ? <p>{ moment(isoDate).format('LL')}</p>
      : parseInt(moment(isoDate).startOf('hour').fromNow().split(' ')[0]) > 1
        ? <p>{moment(isoDate).calendar()}</p>
        : <p>{moment(isoDate).startOf('minute').fromNow()}</p>
    }
  </React.Fragment>
}

export const makeDisplayName = (agentHash) => {
  if (agentHash.length > 7) return agentHash.substring(agentHash.length - 7).toUpperCase()
  else return agentHash
}
