import React from 'react'
import moment from 'moment'
import cx from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './HoloFuelTransactionsLedger.module.css'
import Header from 'components/Header'

import HolofuelCompleteTransactionsQuery from 'graphql/HolofuelCompleteTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'

export default function HoloFuelTransactonsLedger ({ history: { push } }) {
  const { data: { holofuelCompleteTransactions = [] } } = useQuery(HolofuelCompleteTransactionsQuery)
  const { data: { holofuelLedger = [] } } = useQuery(HolofuelLedgerQuery)

  const headings = [
    'Date',
    'From/To',
    'Notes',
    'Amount',
    'Fees',
    'Balance'
  ]

  return <React.Fragment>
    <Header title='HoloFuel' />

    <section styleName='account-ledger-subheader'>
      <p id='account-number' styleName='subheader-title'>AC1903F8EAAC1903F8EA</p>
      <p styleName='subheader-title'>Balance <span id='account-balance' styleName='account-balance'>{!isEmpty(holofuelLedger) && holofuelLedger.balance}</span></p>
    </section>

    <section styleName='account-ledger-table'>
      <h3 styleName='completed-transactions-title'>Completed Transactions</h3>
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
  return <tr key={id} styleName='table-content-row'>
    <td id='date-time' styleName='completed-tx-col table-content'>{timestamp && formatDateTime(timestamp)}</td>
    <td id='counterparty' styleName='completed-tx-col table-content'>{counterparty && makeDisplayName(counterparty)}</td>
    <td id='notes' styleName='completed-tx-col table-content'>{notes || 'none'}</td>
    <td id='amount' styleName={cx('completed-tx-col table-content', { 'red-text': direction === 'outgoing' }, { 'green-text': direction === 'incoming' })}>{direction === 'incoming' ? '+' : '-'}{amount}</td>
    <td id='fees' styleName='completed-tx-col table-content'>{fees}</td>
    <td id='present-balance' styleName='completed-tx-col table-content'>{presentBalance}<h6>*Note: This is the adjustment balance, NOT the resulting account balance.*</h6></td>
  </tr>
}

const TransactionEntry = ({ content }) => {
  return <th id={content === 'From/To' ? 'counterparty' : content.toLowerCase()} styleName='completed-tx-col table-headers'>
    {content === 'Amount' ? 'Amount (+/-)' : content}
  </th>
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

export const makeDisplayName = (agentHash) => {
  if (agentHash.length > 7) return '...' + agentHash.substring(agentHash.length - 7)
  else return agentHash
}
