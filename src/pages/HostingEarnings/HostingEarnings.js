import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import HolofuelEarningsTransactionsQuery from 'graphql/HolofuelEarningsTransactionsQuery.gql'
import { isEmpty } from 'lodash/fp'
import moment from 'moment'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import './HostingEarnings.module.css'
import Graph from './Graph'

function presentHolofuelAmount (amount) {
  if (isNaN(amount)) return '--'
  return Number.parseFloat(amount).toLocaleString()
}

export const DAYS = {
  one: 'one',
  seven: 'seven',
  thirty: 'thirty'
}

export default function HostingEarnings () {
  const { data: { holofuelEarningsTransactions: transactions = [] } = {} } = useQuery(HolofuelEarningsTransactionsQuery)
  const [days, setDays] = useState(DAYS.one)

  const buttons = ['one', 'seven', 'thirty']

  // This is annoying
  const labels = {
    one: {
      button: 'Today',
      earnings: "Today's Earnings",
      number: '1'
    },
    seven: {
      button: '7 Days',
      earnings: '7 Days Earnings',
      number: '7'
    },
    thirty: {
      button: '30 Days',
      earnings: '30 Days Earnings',
      number: '30'
    }
  }

  const dayCutOff = moment().subtract(labels[days].number, 'days')
  const scopedTransactions = transactions.filter(transaction => moment(transaction.timestamp).diff(dayCutOff) > 0)
  const earnings = scopedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  return <PrimaryLayout headerProps={{ title: 'Earnings' }}>
    <div styleName='earnings-banner'>
      <h4 styleName='earnings-label'>{labels[days].earnings}</h4>
      <h1 styleName='earnings-amount'>{presentHolofuelAmount(earnings)} TF</h1>
    </div>

    <div styleName='day-buttons'>
      {buttons.map(button =>
        <Button
          onClick={() => setDays(DAYS[button])}
          styleName='day-button'
          variant={button === days ? 'green' : 'white'}
          key={button}
        >
          {labels[button].button}
        </Button>)}
    </div>

    <Graph transactions={scopedTransactions} days={days} />

    {!isEmpty(transactions) && <table styleName='transaction-list' role='list'>
      <thead>
        <tr styleName='transaction-headers'>
          <th>hApp</th>
          <th>Price/Unit</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(transaction =>
          <TransactionRow
            transaction={transaction}
            key={transaction.id}
          />)}
      </tbody>
    </table>}
  </PrimaryLayout>
}

export function TransactionRow ({ transaction }) {
  const { amount, happName } = transaction
  return <tr styleName='transaction-row' data-testid='transaction-row'>
    <td>{happName}</td>
    <td>5 TF/CPU</td>
    <td>{amount} TF</td>
  </tr>
}
