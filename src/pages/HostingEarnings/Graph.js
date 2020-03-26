import React from 'react'
import { VictoryChart, VictoryBar, Bar } from 'victory'
import { flow, groupBy, values, map } from 'lodash/fp'
import moment from 'moment'
import { caribbeanGreen, silverChalice } from 'utils/colors'
import { DAYS } from './HostingEarnings'
import './Graph.module.css'

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

  const chartTheme = {
    axis: {
      style: {
        axis: {
          fill: 'none',
          stroke: 'none'
        },
        tickLabels: {
          fill: silverChalice,
          padding: 10
        },
        grid: {
          fill: 'none',
          stroke: 'none',
          pointerEvents: 'painted'
        }
      }
    }
  }

  const barStyle = {
    data: {
      fill: caribbeanGreen
    }
  }

  return <div styleName='graph'>
    <VictoryChart
      height={400}
      domainPadding={{ x: 25, y: [0, 20] }}
      scale={{ x: 'time' }}
      theme={chartTheme}
    >
      <VictoryBar
        dataComponent={
          <Bar />
        }
        data={data}
        style={barStyle}
      />
    </VictoryChart>
  </div>
}
