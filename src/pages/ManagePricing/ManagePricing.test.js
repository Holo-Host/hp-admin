import React from 'react'
import ManagePricing from './ManagePricing'
import { render, fireEvent } from '@testing-library/react'
import { UNITS } from 'models/HostPricing'

describe('ManagePricing', () => {
  it('renders', () => {
    const props = {
      hostPricing: {
        units: UNITS.cpu,
        pricePerUnit: '7'
      },
      history: {}
    }
    const { getByLabelText, getByText } = render(<ManagePricing {...props} />)

    expect(getByText('Price Settings')).toBeInTheDocument()
    expect(getByText('CPU = 7 HF per second')).toBeInTheDocument()
    expect(getByLabelText('Holofuel per unit').value).toEqual(props.hostPricing.pricePerUnit)
  })

  it('allows you to set and save units and pricePerUnit', () => {
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
