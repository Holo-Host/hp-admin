import React from 'react'
import { VictoryChart, VictoryBar, Bar } from 'victory'
import { DAYS } from './HostingEarnings'
import { flow, groupBy, values, map } from 'lodash/fp'
import moment from 'moment'

const getBucket = days => transaction => {
  if (days === DAYS.one) {
    return moment(transaction.timestamp).clone().startOf('hour')
  } else {
    return moment(transaction.timestamp).clone().startOf('day')
  }
}

function generateData (transactions, days) {
  return flow(
    groupBy(getBucket(days)),
    values,
    map(group => ({
      x: getBucket(days)(group[0]),
      y: group.reduce((sum, transaction) => sum + transaction.amount, 0)
    }))
  )(transactions)
}

export default function Graph ({ transactions, days }) {
  const data = generateData(transactions, days)

  return <div>
    <VictoryChart height={400} width={400}
      domainPadding={{ x: 50, y: [0, 20] }}
      scale={{ x: 'time' }}
    >
      <VictoryBar
        dataComponent={
          <Bar />
        }
        data={data}
      />
    </VictoryChart>
  </div>
}
