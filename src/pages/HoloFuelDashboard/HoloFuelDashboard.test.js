import React from 'react'
import { render, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import wait from 'waait'
import apolloClient from 'apolloClient'
import HoloFuelDashboard from './HoloFuelDashboard'

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

    expect(getByText('HoloFuel Dashboard')).toBeInTheDocument()
    expect(getByText('Initiate HoloFuel Transaction')).toBeInTheDocument()
  })
})
