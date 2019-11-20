import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import HolofuelEarningsTransactionsQuery from 'graphql/HolofuelEarningsTransactionsQuery.gql'
import { isEmpty } from 'lodash/fp'
import cx from 'classnames'
import moment from 'moment'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import './HostingEarnings.module.css'

const DAYS = {
  one: 'one',
  seven: 'seven',
  thirty: 'thirty'
}

export default function HostingEarnings () {
  const { data: { holofuelEarningsTransactions: transactions = [] } = {} } = useQuery(HolofuelEarningsTransactionsQuery)
  const [days, setDays] = useState(DAYS.one)

  // var transactions = []
  // switch (days) {
  //   case DAYS.one:
  //     transactions = oneDayTransactions
  //     break
  //   case DAYS.seven:
  //     transactions = sevenDayTransactions
  //     break
  //   default:
  //     transactions = thirtyDayTransactions
  //     break
  // }

  const buttons = [{ days: 'one', label: '1 Day' }, { days: 'seven', label: '7 Days' }, { days: 'thirty', label: '30 Days' }]

  return <PrimaryLayout headerProps={{ title: 'Earnings' }}>

    <div styleName='day-buttons'>
      {buttons.map(button =>
        <Button
          onClick={() => setDays(DAYS[button.days])}
          styleName={cx(`${button.days}-button`, { 'selected': button.days === days })} /* eslint-disable-line quote-props */
          key={button.days}>
          {button.label}
        </Button>)}
    </div>

    {!isEmpty(transactions) && <table styleName='transaction-list' role='list'>
      <thead>
        <tr>
          <th>Time</th>
          <th>Total (HF)</th>
          <th>Price/Unit</th>
          <th>hApp</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(transaction =>
          <TransactionRow
            transaction={transaction}
            key={transaction.id} />)}
      </tbody>
    </table>}

  </PrimaryLayout>
}

export function TransactionRow ({ transaction }) {
  const { timestamp, amount, happName } = transaction
  const prettyDate = moment(timestamp).format('D MMM YYYY')
  const prettyTime = moment(timestamp).format('kk:mm')
  return <tr data-testid='transaction-row'>
    <td>{prettyDate}<br />{prettyTime}</td>
    <td>{amount} HF</td>
    <td>5 HF/CPU</td>
    <td>{happName}</td>
  </tr>
}
