import React from 'react'
import { render, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import wait from 'waait'
import apolloClient from 'apolloClient'
import HoloFuelTxOverview from './HoloFuelTxOverview'

describe('HoloFuel Transaction Overview is connected', () => {
  it('renders', async () => {
    const props = {
      history: {}
    }

    let getAllByText, getByText
    await act(async () => {
      ({ getByText, getAllByText } = render(<ApolloProvider client={apolloClient}>
        <HoloFuelTxOverview {...props} />
      </ApolloProvider>))
      await wait(0)
    })

    expect(getByText('HoloFuel Transaction Overview')).toBeInTheDocument()
    expect(getAllByText('Date/Time')).toHaveLength(3)
  })
})
