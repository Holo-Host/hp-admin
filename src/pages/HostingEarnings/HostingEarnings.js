import React, { useState } from 'react'
import { isEmpty } from 'lodash/fp'
import cx from 'classnames'
import moment from 'moment'

import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import { UNITS } from 'models/HostPricing'
import './HostingEarnings.module.css'

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
    amount: 343,
    pricePerUnit: 50,
    units: UNITS.cpu,
    happName: 'HoloFuel'
  },
  {
    id: 6,
    timestamp: '2019-08-27T14:20:25.106Z',
    amount: 123,
    pricePerUnit: 1,
    units: UNITS.ram,
    happName: 'Personas'
  },
  {
    id: 7,
    timestamp: '2019-08-26T14:20:25.106Z',
    amount: 10,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'HoloFuel'
  },
  {
    id: 8,
    timestamp: '2019-08-26T12:20:25.106Z',
    amount: 389,
    pricePerUnit: 5,
    units: UNITS.cpu,
    happName: 'Community'
  },
  {
    id: 9,
    timestamp: '2019-08-26T10:20:25.106Z',
    amount: 45,
    pricePerUnit: 10,
    units: UNITS.bandwidth,
    happName: 'Personas'
  },
  {
    id: 10,
    timestamp: '2019-08-25T14:20:25.106Z',
    amount: 920,
    pricePerUnit: 15,
    units: UNITS.storage,
    happName: 'HoloFuel'
  }
])

const thirtyDayTransactions = sevenDayTransactions.concat([
  {
    id: 11,
    timestamp: '2019-08-19T14:20:25.106Z',
    amount: 56,
    pricePerUnit: 100,
    units: UNITS.cpu,
    happName: 'HoloFuel'
  },
  {
    id: 12,
    timestamp: '2019-08-18T14:20:25.106Z',
    amount: 805,
    pricePerUnit: 20,
    units: UNITS.bandwidth,
    happName: 'Community'
  },
  {
    id: 13,
    timestamp: '2019-08-17T14:20:25.106Z',
    amount: 10,
    pricePerUnit: 25,
    units: UNITS.ram,
    happName: 'HoloFuel'
  },
  {
    id: 14,
    timestamp: '2019-08-16T14:20:25.106Z',
    amount: 734,
    pricePerUnit: 200,
    units: UNITS.storage,
    happName: 'Personas'
  },
  {
    id: 15,
    timestamp: '2019-08-16T12:20:25.106Z',
    amount: 200,
    pricePerUnit: 3,
    units: UNITS.cpu,
    happName: 'Personas'
  },
  {
    id: 16,
    timestamp: '2019-08-16T10:20:25.106Z',
    amount: 505,
    pricePerUnit: 11,
    units: UNITS.bandwidth,
    happName: 'Community'
  },
  {
    id: 17,
    timestamp: '2019-08-15T14:20:25.106Z',
    amount: 438,
    pricePerUnit: 35,
    units: UNITS.bandwidth,
    happName: 'HoloFuel'
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
  const { timestamp, amount, pricePerUnit, units, happName } = transaction
  const prettyDate = moment(timestamp).format('D MMM YYYY')
  const prettyTime = moment(timestamp).format('kk:mm')
  return <tr data-testid='transaction-row'>
    <td>{prettyDate}<br />{prettyTime}</td>
    <td>{amount} HF</td>
    <td>{pricePerUnit} / {units}</td>
    <td>{happName}</td>
  </tr>
}
