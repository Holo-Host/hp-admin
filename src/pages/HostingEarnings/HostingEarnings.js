import React, { useState } from 'react'
import { isEmpty } from 'lodash/fp'
import './HostingEarnings.module.css'
import Header from 'components/Header'
import Button from 'components/Button'
import { UNITS } from 'models/HostPricing'

// these transactions are mock data and will come from useQuery calls

const oneDayTransactions = [
  {
    id: 1,
    timestamp: '2019-08-30T22:20:25.106Z',
    amount: 123,
    pricePerUnit: 5,
    units: UNITS.cpu,
    happName: 'Community'
  },
  {
    id: 2,
    timestamp: '2019-08-30T18:20:25.106Z',
    amount: 150,
    pricePerUnit: 15,
    units: UNITS.storage,
    happName: 'HoloFuel'
  },
  {
    id: 3,
    timestamp: '2019-08-30T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  }
]

const sevenDayTransactions = oneDayTransactions.concat([
  {
    id: 4,
    timestamp: '2019-08-29T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 5,
    timestamp: '2019-08-28T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 6,
    timestamp: '2019-08-27T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 7,
    timestamp: '2019-08-26T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 8,
    timestamp: '2019-08-26T12:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 9,
    timestamp: '2019-08-26T10:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 10,
    timestamp: '2019-08-25T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  }
])

const thirtyDayTransactions = sevenDayTransactions.concat([
  {
    id: 4,
    timestamp: '2019-08-29T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 5,
    timestamp: '2019-08-28T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 6,
    timestamp: '2019-08-27T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 7,
    timestamp: '2019-08-26T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 8,
    timestamp: '2019-08-26T12:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 9,
    timestamp: '2019-08-26T10:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 10,
    timestamp: '2019-08-25T14:20:25.106Z',
    amount: 80,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  }
])

const DAYS = {
  one: 'one',
  seven: 'seven',
  thirty: 'thirty'
}

export default function HostingEarnings () {
  const [days, setDays] = useState(DAYS.one)

  var transactions = []
  switch (days) {
    case DAYS.one:
      transactions = oneDayTransactions
      break
    case DAYS.seven:
      transactions = sevenDayTransactions
      break
    default:
      transactions = thirtyDayTransactions
      break
  }

  return <div styleName='container'>
    <Header title='Earnings' />

    <div styleName='day-buttons'>
      <button onClick={() => setDays(DAYS.one)}>1 Day</button>
      <button onClick={() => setDays(DAYS.seven)}>7 Days</button>
      <button onClick={() => setDays(DAYS.thirty)}>30 Days</button>
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
