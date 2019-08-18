import React from 'react'
import { render, act } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import connector from './ManagePricing.connector'

const mockHostPricing = {
  units: 'cpu',
  pricePerUnit: '12'
}

const mocks = [
  {
    request: {
      query: HostPricingQuery
    },
    result: {
      data: {
        hostPricing: mockHostPricing
      }
    }
  }
]

describe('connector', () => {
  it('runs the HostPricingQuery', async () => {
    let hostPricing

    const MockComponent = props => {
      hostPricing = props.hostPricing
      return null
    }

    const ConnectedMockComponent = connector(MockComponent)

    await act(async () => {
      render(<MockedProvider mocks={mocks} addTypename={false}>
        <ConnectedMockComponent />
      </MockedProvider>)
      await wait(1)
    })

    expect(hostPricing).toMatchObject(mockHostPricing)
  })
})
