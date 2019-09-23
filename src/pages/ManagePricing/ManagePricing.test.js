import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import apolloClient from 'apolloClient'
import ManagePricing from './ManagePricing'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import UpdateHostPricingMutation from 'graphql/UpdateHostPricingMutation.gql'
import { UNITS } from 'models/HostPricing'
import mockHha from 'mock-dnas/hha'

jest.mock('components/layout/PrimaryLayout')

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
  updateHostPricingMock,
  {
    request: {
      query: UpdateHostPricingMutation,
      variables: { units: UNITS.cpu, pricePerUnit: newPrice }
    },
    result: {
      data: { updateHostPricing: { units: 'not', pricePerUnit: 'used' } }
    }
  }
]

describe('ManagePricing', () => {
  it('renders', async () => {
    const props = {
      history: {}
    }

    let getByText, getByTestId
    await act(async () => {
      ({ getByText, getByTestId } = render(<ApolloProvider client={apolloClient}>
        <ManagePricing {...props} />
      </ApolloProvider>))
      await wait(0)
    })

    expect(getByText('HoloFuel per')).toBeInTheDocument()
    expect(getByText('CPU (MS)')).toBeInTheDocument()
    expect(getByTestId('price-input').value).toEqual(mockHha.provider.get_service_log_details.price_per_unit)
  })

  it('allows you to set and save units and pricePerUnit', async () => {
    const props = {
      history: {}
    }
    let getByText, getByTestId

    await act(async () => {
      ({ getByText, getByTestId } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <ManagePricing {...props} />
      </MockedProvider>))
      await wait(0)
    })

    fireEvent.change(getByTestId('units-dropdown'), { target: { value: UNITS.storage } })

    fireEvent.change(getByTestId('price-input'), { target: { value: newPrice } })

    fireEvent.click(getByText('Save'))

    expect(updateHostPricingMock.newData).toHaveBeenCalled()
  })

  it('changes button state based on user actions', async () => {
    const props = {
      history: {}
    }

    let getByText, getByTestId
    await act(async () => {
      ({ getByText, getByTestId } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <ManagePricing {...props} />
      </MockedProvider>))
      await wait(0)
    })

    expect(getByText('Save')).toHaveAttribute('disabled')

    fireEvent.change(getByTestId('price-input'), { target: { value: newPrice } })

    expect(getByText('Save')).not.toHaveAttribute('disabled')

    act(() => {
      fireEvent.click(getByText('Save'))
    })

    expect(getByText('Saving')).toHaveAttribute('disabled')

    await act(() => wait(0))

    expect(getByText('Saved')).toHaveAttribute('disabled')

    fireEvent.change(getByTestId('price-input'), { target: { value: '123' } })

    expect(getByText('Save')).not.toHaveAttribute('disabled')
  })
})
