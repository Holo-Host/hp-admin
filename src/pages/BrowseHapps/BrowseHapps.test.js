import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import wait from 'waait'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import HappsQuery from 'graphql/HappsQuery.gql'
import mockEnvoyInterface from 'data-interfaces/EnvoyInterface'
import hhaInterface from 'data-interfaces/HhaDnaInterface'
import { happs as hhaHapps } from 'mock-dnas/hha'
import { appOne as appHoloFuel, appTwo as appHylo } from 'mock-dnas/happStore'
import BrowseHapps from './BrowseHapps'

jest.mock('data-interfaces/EnvoyInterface')
jest.mock('components/layout/PrimaryLayout')

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

describe('BrowseHapps Connected', () => {
  it('renders', async () => {
    let getAllByRole
    await act(async () => {
      ({ getAllByRole } = renderWithRouter(<ApolloProvider client={apolloClient}>
        <BrowseHapps history={{}} />
      </ApolloProvider>))
      await wait(15)
    })

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    const apps = [appHoloFuel, appHylo]

    listItems.forEach((item, index) => {
      const { getByText } = within(item)
      expect(getByText(apps[index].appEntry.title)).toBeInTheDocument()
      expect(getByText(apps[index].appEntry.description)).toBeInTheDocument()
      if (index === 0) {
        expect(getByText('Un-Host')).toBeInTheDocument()
      }
      if (index === 1) {
        expect(getByText('Host')).toBeInTheDocument()
      }
    })
  })

  describe('HostButton', () => {
    it('enables and disables happs', async () => {
      hhaInterface.happs.enable = jest.fn()
      let getAllByRole, queryAllByText
      await act(async () => {
        ({ getAllByRole, queryAllByText } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <BrowseHapps history={{}} />
        </ApolloProvider>))
        await wait(15)
      })

      const listItems = getAllByRole('listitem')
      expect(queryAllByText('Un-Host')).toHaveLength(1)
      expect(queryAllByText('Host')).toHaveLength(1)

      const { getByText: getByTextFromListItem } = within(listItems[0])
      fireEvent.click(getByTextFromListItem('Un-Host'))

      await act(() => wait(0))

      expect(queryAllByText('Un-Host')).toHaveLength(0)
      expect(queryAllByText('Host')).toHaveLength(2)

      fireEvent.click(getByTextFromListItem('Host'))

      await act(() => wait(0))

      expect(queryAllByText('Un-Host')).toHaveLength(1)
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
    it("calls history.push with '/pricing'", async () => {
      const mockHistory = {
        push: jest.fn()
      }
      const { getByText } = renderWithRouter(<MockedProvider mocks={mocks} addTypename={false}>
        <BrowseHapps history={mockHistory} />
      </MockedProvider>)
      fireEvent.click(getByText('Manage Pricing'))
      expect(mockHistory.push).toHaveBeenCalledWith('/pricing')
    })
  })

  describe('hApp entry', () => {
    // we don't currently link to happ description.
    it.skip("navigates to '/browse-happs/APP_HASH' on click", async () => {
      let getByText, history
      await act(async () => {
        ({ getByText, history } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <BrowseHapps history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      fireEvent.click(getByText('HoloFuel'))
      expect(history.location.pathname).toBe('/browse-happs/QmHHAHappEntryAddressHash1')
    })
  })
})
