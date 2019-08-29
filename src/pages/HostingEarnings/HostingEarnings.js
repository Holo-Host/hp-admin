import React, { useState } from 'react'
import { isEmpty } from 'lodash/fp'
import './HostingEarnings.module.css'
import Header from 'components/Header'
import Button from 'components/Button'

const generateTransactions = () => []

// transactions will come from a useQuery call
const transactions = generateTransactions()

const DAYS = {
  one: 'one',
  seven: 'seven',
  thirty: 'thirty'
}

export default function HostingEarnings () {
  const [days, setDays] = useState(DAYS.one)

  return <div styleName='container'>
    <Header title='Earnings' />

    <div styleName='day-buttons'>
      
    </div>

    {!isEmpty(transactions) && <div styleName='transaction-list' role='list'>
      {transactions.map(transaction =>
        <TransactionRow
          transaction={transaction}
          key={transaction.id} />)}
    </div>}

  </div>
}

export function TransactionRow ({ transaction }) {
  const { id, title, description, thumbnailUrl, isEnabled } = transaction
  return <div styleName='transaction-row' />
}
