import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import apolloClient from 'apolloClient'
import HappsQuery from 'graphql/HappsQuery.gql'
import BrowseHapps from './BrowseHapps'
import { appOne as appHoloFuel, appTwo as appHylo } from 'mock-dnas/happStore'
import AllAvailableHappsQuery from 'graphql/AllAvailableHappsQuery.gql'
import EnableHappMutation from 'graphql/EnableHappMutation.gql'
import DisableHappMutation from 'graphql/DisableHappMutation.gql'

const enableHappMock = {
  request: {
    query: EnableHappMutation,
    variables: { appId: 'QmHHAHappEntryAddressHash2' }
  },
  result: {
    data: { enableHapp: { id: 'not', title: 'used', happStoreId: 'at', isEnabled: 'all' } }
  },
  newData: jest.fn()
}

const disableHappMock = {
  request: {
    query: DisableHappMutation,
    variables: { appId: 'QmHHAHappEntryAddressHash1' }
  },
  result: {
    data: { disableHapp: { id: 'not', title: 'used', happStoreId: 'at', isEnabled: 'all' } }
  },
  newData: jest.fn()
}

const mocks = [
  {
    request: {
      query: AllAvailableHappsQuery
    },
    result: {
      data: {
        allAvailableHapps: [
          {
            id: 'QmHHAHappEntryAddressHash1',
            title: 'HoloFuel',
            description: 'Manage and redeem payments for hosting',
            dnaHash: 'foiyuoiyZXBVNBVCuibce',
            happStoreId: 'QmXxiimzfcSHYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoT',
            homepageUrl: 'https://holo.host/faq/what-is-holo-fuel/',
            isEnabled: true,
            thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2cMFvYqaw7TtcTkPFcwE8pupKWqLFMCFu2opap9jqUoqIcAKB',
            ui: null
          },
          {
            id: 'QmHHAHappEntryAddressHash2',
            title: 'Holo Community',
            description: 'Connect with other hosts in the Holo network',
            dnaHash: 'sd;lmsdl;masd;lmds;lmasdlsadm;ldmo',
            happStoreId: 'QmXx7imYqHXV2z6WNopeiFnPBx9YKnHzPcq9o8VoTzfcSH',
            homepageUrl: 'https://hylo.com',
            isEnabled: false,
            thumbnailUrl: 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png',
            ui: null
          }
        ]
      }
    }
  },
  enableHappMock,
  disableHappMock
]

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

describe('BrowseHapps', () => {
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
        query: HappsQuery
      },
      result: {
        data: {
          happs: []
        }
      }
    }
  ]

  describe('menu button', () => {
    it("calls history.push with '/menu'", async () => {
      const mockHistory = {
        push: jest.fn()
      }
      const { getByText } = renderWithRouter(<MockedProvider mocks={mocks} addTypename={false}>
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
      const { getByText } = renderWithRouter(<MockedProvider mocks={mocks} addTypename={false}>
        <BrowseHapps history={mockHistory} />
      </MockedProvider>)
      fireEvent.click(getByText('Manage Pricing'))
      expect(mockHistory.push).toHaveBeenCalledWith('/pricing')
    })
  })

  describe('hApp entry', () => {
    it("navigates to '/browse-happs/APP_HASH' on click", async () => {
      let getByText, history
      await act(async () => {
        ({ getByText, history } = renderWithRouter(<MockedProvider mocks={mocks} addTypename={false}>
          <BrowseHapps history={{}} />
        </MockedProvider>))
        await wait(0)
      })

      fireEvent.click(getByText('HoloFuel'))
      expect(history.location.pathname).toBe('/browse-happs/QmHHAHappEntryAddressHash1')
    })
  })
})
