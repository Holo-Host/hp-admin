import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import HostingEarnings from './HostingEarnings'

jest.mock('data-interfaces/EnvoyInterface')
// mocking Header because it depends on Router
jest.mock('components/Header')

function renderWithRouter (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    history
  }
}

describe('HostingEarnings', () => {
  it('renders', () => {
    const { getByText } = render(<HostingEarnings />)
    expect(getByText('Time')).toBeInTheDocument()
    expect(getByText('Total (HF)')).toBeInTheDocument()
    expect(getByText('Price/Unit')).toBeInTheDocument()
    expect(getByText('hApp')).toBeInTheDocument()
  })

  describe('Day Buttons', () => {
    it('switches between different transaction lists', async () => {
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
