import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import apolloClient from 'apolloClient'
import AllAvailableHappsQuery from 'graphql/AllAvailableHappsQuery.gql'
import BrowseHapps from './BrowseHapps'
import { appOne as appHoloFuel, appTwo as appHylo } from 'mock-dnas/happStore'
import { happs as hhaHapps } from 'mock-dnas/hha'
import mockEnvoyInterface from 'graphql-server/dnaInterfaces/EnvoyInterface'

jest.mock('graphql-server/dnaInterfaces/EnvoyInterface')

describe('BrowseHapps Connected', () => {
  it('renders', async () => {
    let getAllByRole
    await act(async () => {
      ({ getAllByRole } = render(<ApolloProvider client={apolloClient}>
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
      let getAllByRole, queryAllByText
      await act(async () => {
        ({ getAllByRole, queryAllByText } = render(<ApolloProvider client={apolloClient}>
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
      expect(mockEnvoyInterface.happs.install).toHaveBeenCalledWith(hhaHapps[0].id)
    })
  })

  const mocks = [
    {
      request: {
        query: AllAvailableHappsQuery
      },
      result: {
        data: {
          allAvailableHapps: []
        }
      }
    }
  ]

  describe('menu button', () => {
    it("calls history.push with '/menu'", async () => {
      const mockHistory = {
        push: jest.fn()
      }
      const { getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <BrowseHapps history={mockHistory} />
      </MockedProvider>)
      fireEvent.click(getByText('Menu'))
      expect(mockHistory.push).toHaveBeenCalledWith('/menu')
    })
  })

  describe('pricing button', () => {
    it("calls history.push with '/pricing'", async () => {
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
