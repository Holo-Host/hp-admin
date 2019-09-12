import React from 'react'
import moment from 'moment'
import cx from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './HoloFuelTransactionsHistory.module.css'
import Header from 'components/holofuel/Header'

import HolofuelCompleteTransactionsQuery from 'graphql/HolofuelCompleteTransactionsQuery.gql'

export default function HoloFuelTransactionsHistory ({ history: { push } }) {
  const { data: { holofuelCompleteTransactions = [] } } = useQuery(HolofuelCompleteTransactionsQuery)

  // NOTE: Col Headers (or null) => This provides a space fore easy updating of headers, should we decide to rename or substitute a null header with a title.
  const headings = [
    null,
    null,
    'Fees',
    'Amount',
    null
  ]

  return <React.Fragment>
    <Header title='HoloFuel' accountNumber='AC1903F8EAAC1903F8EA' /> {/* NOTE: We will need to pass account number int header too. */}

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
    <td styleName='completed-tx-col table-content'>
      <h4 id='counterparty' data-testid='cell-counterparty'>{counterparty && makeDisplayName(counterparty)}</h4>
      <p id='notes' data-testid='cell-notes'>{notes || 'none'}</p>
    </td>
    <td id='fees' styleName='completed-tx-col table-content red-text' data-testid='cell-fees'>{fees}</td>
    <td id='amount' styleName={cx('completed-tx-col table-content', { 'red-text': direction === 'outgoing' }, { 'green-text': direction === 'incoming' })} data-testid='cell-amount'>{amount}</td>
    <td id='present-balance' styleName='completed-tx-col table-content notes' data-testid='cell-present-balance'>{presentBalance}</td>
  </tr>
}

const TransactionEntry = ({ content }) => {
  return <th id={content ? content.toLowerCase() : null} styleName='completed-tx-col table-headers'>
    {content || null}
  </th>
}

export function formatDateTime (isoDate) {
  const dateDifference = moment(isoDate).startOf('date').fromNow()
  if (dateDifference.split(' ')[1] === 'days' && parseInt(dateDifference.split(' ')[0]) >= 1) {
    return moment(isoDate).format('LLL')
  } else if (parseInt(moment(isoDate).startOf('hour').fromNow().split(' ')[0]) > 1) {
    return moment(isoDate).startOf('hour').fromNow()
  } else return moment(isoDate).startOf('minute').fromNow()
}

export const makeDisplayName = (agentHash) => {
  if (agentHash.length > 7) return agentHash.substring(agentHash.length - 7).toUpperCase()
  else return agentHash
}
