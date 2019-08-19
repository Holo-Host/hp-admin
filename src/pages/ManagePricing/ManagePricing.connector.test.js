import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import connector from './ManagePricing.connector'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import UpdateHostPricingMutation from 'graphql/UpdateHostPricingMutation.gql'
import { UNITS } from 'models/HostPricing'

const mockHostPricing = {
  units: 'cpu',
  pricePerUnit: '12'
}

const newPrice = '9'

const updateHostPricingMock = {
  request: {
    query: UpdateHostPricingMutation,
    variables: { units: UNITS.storage, pricePerUnit: newPrice }
  },
  result: {
    data: { updateHostPricing: { units: 'not', pricePerUnit: 'used' } }
  },
  newData: jest.fn()
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
  },
  updateHostPricingMock
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

  it('passes updateHostPricing mutation as a prop', async () => {
    const MockComponent = ({ updateHostPricing }) => {
      return <button onClick={() => updateHostPricing(updateHostPricingMock.request.variables)}>update</button>
    }

    const ConnectedMockComponent = connector(MockComponent)

    let getByText
    await act(async () => {
      ({ getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <ConnectedMockComponent />
      </MockedProvider>))
      await wait(1)
    })

    fireEvent.click(getByText('update'))
    expect(updateHostPricingMock.newData).toHaveBeenCalled()
  })
})
