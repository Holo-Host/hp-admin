import React from 'react'
import ManagePricing from './ManagePricing'
import { render, fireEvent, act } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import HostPricingQuery from 'graphql/HostPricingQuery.gql'
import { UNITS } from 'models/HostPricing'

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

describe('ManagePricing', () => {
  it('renders', async () => {
    const props = {
      history: {}
    }

    let getByLabelText, getByText
    await act(async () => {
      ({ getByLabelText, getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <ManagePricing {...props} />
      </MockedProvider>))
      await wait(1)
    })

    expect(getByText('Price Settings')).toBeInTheDocument()
    expect(getByText('CPU = 12 HF per second')).toBeInTheDocument()
    expect(getByLabelText('Holofuel per unit').value).toEqual(mockHostPricing.pricePerUnit)
  })

  it.skip('allows you to set and save units and pricePerUnit', () => {
    // this is skipped while we figure out the best way to test apollo mutations
    const props = {
      hostPricing: {
        units: UNITS.cpu,
        pricePerUnit: '7'
      },
      history: {},
      updateHostPricing: jest.fn()
    }
    const { getByLabelText, getByText, getByTestId } = render(<ManagePricing {...props} />)

    fireEvent.change(getByTestId('units-dropdown'), { target: { value: UNITS.storage } })

    const newPrice = '9'

    fireEvent.change(getByLabelText('Holofuel per unit'), { target: { value: newPrice } })

    fireEvent.click(getByText('Save'))

    expect(props.updateHostPricing).toHaveBeenCalledWith({
      units: UNITS.storage,
      pricePerUnit: newPrice
    })
  })
})
