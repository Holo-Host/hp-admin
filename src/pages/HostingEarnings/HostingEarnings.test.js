import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import HostingEarnings from './HostingEarnings'

jest.mock('components/layout/PrimaryLayout')

describe('HostingEarnings', () => {
  it('renders', () => {
    const { getByText } = render(<HostingEarnings />)
    expect(getByText('Time')).toBeInTheDocument()
    expect(getByText('Total (HF)')).toBeInTheDocument()
    expect(getByText('Price/Unit')).toBeInTheDocument()
    expect(getByText('hApp')).toBeInTheDocument()
  })

  describe('Day Buttons', () => {
    it('switches between different transaction lists', () => {
      const { getByText, getAllByTestId } = render(<HostingEarnings />)
      expect(getAllByTestId('transaction-row')).toHaveLength(3)

      fireEvent.click(getByText('7 Days'))

      expect(getAllByTestId('transaction-row')).toHaveLength(10)

      fireEvent.click(getByText('30 Days'))

      expect(getAllByTestId('transaction-row')).toHaveLength(17)

      fireEvent.click(getByText('1 Day'))

      expect(getAllByTestId('transaction-row')).toHaveLength(3)
    })
  })
})
