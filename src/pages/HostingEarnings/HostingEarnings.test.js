import React from 'react'
import { fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import moment from 'moment'
import HolofuelEarningsTransactionsQuery from 'graphql/HolofuelEarningsTransactionsQuery.gql'
import { presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import HostingEarnings from './HostingEarnings'

jest.mock('components/layout/PrimaryLayout')
jest.mock('./Graph', () => () => <div>Graph</div>)

const transactions = [{
  id: 1,
  timestamp: moment(),
  amount: 150,
  happName: 'HoloFuel',
  counterparty: {
    id: 1,
    nickname: 'Perry',
    avatarUrl: ''
  }
},
{
  id: 2,
  timestamp: moment().subtract(3, 'days'),
  amount: 250,
  happName: 'HoloFuel',
  counterparty: {
    id: 1,
    nickname: 'Perry',
    avatarUrl: ''
  }
},
{
  id: 3,
  timestamp: moment().subtract(10, 'days'),
  amount: 350,
  happName: 'HoloFuel',
  counterparty: {
    id: 1,
    nickname: 'Perry',
    avatarUrl: ''
  }
}]

const mocks = [
  {
    request: {
      query: HolofuelEarningsTransactionsQuery
    },
    result: {
      data: { holofuelEarningsTransactions: transactions }
    }
  }
]

describe('HostingEarnings', () => {
  it('renders', async () => {
    const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}><HostingEarnings /></MockedProvider>)
    expect(getByText('hApp')).toBeInTheDocument()
    expect(getByText('Price/Unit')).toBeInTheDocument()
    expect(getByText('Total')).toBeInTheDocument()
  })

  describe('Day Buttons', () => {
    it('switches between different transaction lists', async () => {
      const { getByText, getAllByText, getAllByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}><HostingEarnings /></MockedProvider>)
      expect(getAllByTestId('transaction-row')).toHaveLength(3)

      const oneDayTotal = transactions.slice(0, 1).reduce((sum, transaction) => sum + transaction.amount, 0)
      expect(getAllByText(`${presentHolofuelAmount(oneDayTotal)} TF`)).toHaveLength(2)

      fireEvent.click(getByText('7 Days'))

      const sevenDayTotal = transactions.slice(0, 2).reduce((sum, transaction) => sum + transaction.amount, 0)
      expect(getByText(`${presentHolofuelAmount(sevenDayTotal)} TF`)).toBeInTheDocument()

      fireEvent.click(getByText('30 Days'))

      const thirtyDayTotal = transactions.slice(0, 3).reduce((sum, transaction) => sum + transaction.amount, 0)
      expect(getByText(`${presentHolofuelAmount(thirtyDayTotal)} TF`)).toBeInTheDocument()

      fireEvent.click(getByText('Today'))

      expect(getAllByText(`${presentHolofuelAmount(oneDayTotal)} TF`)).toHaveLength(2)
    })
  })
})
