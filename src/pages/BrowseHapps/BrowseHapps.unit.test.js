import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import wait from 'waait'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import HappsQuery from 'graphql/HappsQuery.gql'
import mockEnvoyInterface from 'data-interfaces/EnvoyInterface'
import hhaInterface from 'data-interfaces/HhaDnaInterface'
import { happs as hhaHapps } from 'mock-dnas/hha'
import { appOne as appHoloFuel, appTwo as appHylo } from 'mock-dnas/happStore'
import BrowseHapps from './BrowseHapps'
import { renderAndWait } from 'utils/test-utils'

jest.mock('data-interfaces/EnvoyInterface')
jest.mock('components/layout/PrimaryLayout')

describe('BrowseHapps Connected', () => {
  it('renders', async () => {
    const { getAllByRole } = await renderAndWait(<ApolloProvider client={apolloClient}>
      <BrowseHapps history={{}} />
    </ApolloProvider>)

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    const apps = [appHoloFuel, appHylo]

    listItems.forEach((item, index) => {
      const { getByText } = within(item)
      expect(getByText(apps[index].appEntry.title)).toBeInTheDocument()
      expect(getByText(apps[index].appEntry.description)).toBeInTheDocument()
      if (index === 0) {
        expect(getByText('Unhost')).toBeInTheDocument()
      }
      if (index === 1) {
        expect(getByText('Host')).toBeInTheDocument()
      }
    })
  })

  describe('HostButton', () => {
    it('enables and disables happs', async () => {
      hhaInterface.happs.enable = jest.fn()

      const { getAllByRole, queryAllByText } = await renderAndWait(<ApolloProvider client={apolloClient}>
        <BrowseHapps history={{}} />
      </ApolloProvider>)

      const listItems = getAllByRole('listitem')
      expect(queryAllByText('Unhost')).toHaveLength(1)
      expect(queryAllByText('Host')).toHaveLength(1)

      const { getByText: getByTextFromListItem } = within(listItems[0])
      fireEvent.click(getByTextFromListItem('Unhost'))

      await act(() => wait(0))

      expect(queryAllByText('Un-Host')).toHaveLength(0)
      expect(queryAllByText('Host')).toHaveLength(2)

      fireEvent.click(getByTextFromListItem('Host'))

      await act(() => wait(0))

      expect(queryAllByText('Unhost')).toHaveLength(1)
      expect(queryAllByText('Host')).toHaveLength(1)
      expect(hhaInterface.happs.enable).toHaveBeenCalledWith(hhaHapps[0].id)
      expect(mockEnvoyInterface.happs.install).toHaveBeenCalledWith(hhaHapps[0].id)
    })
  })

  const mocks = [
    {
      request: {
        query: HappsQuery
      },
      result: {
        data: {
          happs: []
        }
      }
    }
  ]

  describe('pricing button', () => {
    it.skip("calls history.push with '/pricing'", async () => {
      const mockHistory = {
        push: jest.fn()
      }
      const { getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <BrowseHapps history={mockHistory} />
      </MockedProvider>)
      fireEvent.click(getByText('Manage Pricing'))
      expect(mockHistory.push).toHaveBeenCalledWith('/pricing')
    })
  })
})
