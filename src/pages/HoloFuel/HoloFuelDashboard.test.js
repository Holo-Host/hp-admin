import React from 'react'
import { render, within, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import wait from 'waait'
import apolloClient from 'apolloClient'
import HoloFuelDashboard from './HoloFuelDashboard'
import { transactionList } from 'mock-dnas/holofuel'

describe('HoloFuel Dashboard is connected', () => {
  it('renders', async () => {
    const props = {
      history: {}
    }

    let getByText, getAllByRole
    await act(async () => {
      ({ getByText, getAllByRole } = render(<ApolloProvider client={apolloClient}>
        <HoloFuelDashboard {...props} />
      </ApolloProvider>))
      await wait(0)
    })

    const listItems = getAllByRole('heading')
    expect(listItems).toHaveLength(7)

    // expect(getByText(transactionList.ledger.balance)).toBeInTheDocument()
    // expect(getByText(transactionList.ledger.payable)).toBeInTheDocument()
    expect(getByText('HoloFuel Dashboard')).toBeInTheDocument()
    expect(getByText('Initiate HoloFuel Transaction')).toBeInTheDocument()
  })
})
