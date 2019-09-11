import React from 'react'
import { render, fireEvent, act, within } from '@testing-library/react'
import wait from 'waait'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import Inbox from './Inbox'

jest.mock('data-interfaces/EnvoyInterface')
// mocking Header because it depends on Router
jest.mock('components/Header')

describe('Inbox Connected', () => {
  it('renders', async () => {
    let getAllByRole

    await act(async () => {
      ({ getAllByRole } = render(<ApolloProvider client={apolloClient}>
        <Inbox />
      </ApolloProvider>))
      await wait(15)
    })

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    listItems.forEach((item, index) => {

    })
  })

  describe('Day Buttons', () => {
    it.skip('switches between different transaction lists', () => {
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
