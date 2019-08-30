import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import apolloClient from 'apolloClient'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCompleteTransactionsQuery from 'graphql/HolofuelCompleteTransactionsQuery.gql'
import HoloFuelTxOverview from './HoloFuelTxOverview'
import mockHoloFuel from 'mock-dnas/holofuel'

describe('HoloFuel is connected', () => {
  it('renders', async () => {
    const props = {
      history: {}
    }

    let getByLabelText, getByText
    await act(async () => {
      let getAllByRole
      ({ getByText, getAllByRole } = render(<ApolloProvider client={apolloClient}>
        <HoloFuelTxOverview {...props} />
      </ApolloProvider>))
      await wait(0)
    })

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(1)

    expect(getByText('HoloFuel Transaction Overview')).toBeInTheDocument()
    expect(getByText('Date/Time')).toBeInTheDocument()
  })
})
