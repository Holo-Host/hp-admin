import React from 'react'
import moment from 'moment'
import cx from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './HoloFuelTransactionsLedger.module.css'
import Header from 'components/Header'

import HolofuelCompleteTransactionsQuery from 'graphql/HolofuelCompleteTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'

export default function HoloFuelTxOverview ({ history: { push } }) {
  const { data: { holofuelCompleteTransactions = [] } } = useQuery(HolofuelCompleteTransactionsQuery)
  const { data: { holofuelLedgerQuery = [] } } = useQuery(HolofuelLedgerQuery)

  console.log('holofuelLedgerQuery : ', holofuelLedgerQuery)

  const headings = [
    'Date',
    'To/From',
    'Notes',
    'Amount',
    'Fees',
    'Balance'
  ]

  return <React.Fragment>
    <Header title='HoloFuel' />

    <section styleName='account-ledger-subheader'>
      <p id='account-number' styleName='subheader-title'>AC1903F8EAAC1903F8EA</p>
      <p id='account-balance' styleName='subheader-title'>Balance <span styleName='account-balance'>{!isEmpty(holofuelLedgerQuery) && holofuelLedgerQuery.balance}</span></p>
    </section>

    <section>
      <h3 styleName='complete-transactions-title'>Completed Transactions</h3>
      <table styleName='complete-transactions-table'>
        {/* <LedgerTransactionsTableHeader /> */}

        <thead>
          <tr key='heading'>
            {headings && headings.map((_content, contentIndex) => {
              return (
                <TransactionEntry
                  key={`heading-${contentIndex}`}
                  content={headings[contentIndex]}
                  header
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

function LedgerTransactionsTable ({ transaction }) {
  const { id, timestamp, amount, counterparty, direction, fees, presentBalance, notes } = transaction
  return <tr key={id} styleName='table-content-row'>
    <td id='date-time' styleName='completed-tx-col table-content'>{timestamp && formatDateTime(timestamp)}<ResizeableDiv /></td>
    <td id='counterparty' styleName='completed-tx-col table-content'>{counterparty}<ResizeableDiv /></td>
    <td id='notes' styleName='completed-tx-col table-content'>{notes || 'none'}<ResizeableDiv /></td>
    <td id='amount' styleName={cx('completed-tx-col table-content', { 'red-text': direction === 'outgoing' }, { 'green-text': direction === 'incoming' })}>{direction === 'incoming' ? '+' : '-'}{amount}<ResizeableDiv /></td>
    <td id='fees' styleName='completed-tx-col table-content'>{fees}<ResizeableDiv /></td>
    <td id='present-balance' styleName='completed-tx-col table-content'>{presentBalance}<h6>*Note: This is the adjustment balance, NOT the resulting account balance.*</h6><ResizeableDiv /></td>
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

// NOTE: Functionality to make adjustable talbe cells >> REVISIT
const ResizeableDiv = () => {
  let pageX, currentCol, nextCol, currentColWidth, nextColWidth
  const handleResizingMarkers = (e) => {
    pageX = e.pageX
    currentCol = e.target.parentElement
    currentColWidth = currentCol.offsetWidth
    nextCol = currentCol.nextElementSibling
    if (nextCol) nextColWidth = nextCol.offsetWidth
    else {}
  }
  const handleResizeColumn = (e) => {
    if (currentCol) {
      var diffX = e.pageX - pageX
      if (nextCol) nextCol.style.width = (nextColWidth - (diffX)) + 'px'
      currentCol.style.width = (currentColWidth + diffX) + 'px'
    }
  }
  const handleRefresh = (e) => {
    pageX = undefined
    currentCol = undefined
    currentColWidth = undefined
    nextCol = undefined
    nextColWidth = undefined
  }
  return <div
    styleName='resizeable-div'
    onMouseDown={(e) => handleResizingMarkers(e)}
    onMouseMove={(e) => handleResizeColumn(e)}
    onMouseUp={(e) => handleRefresh(e)} />
}
