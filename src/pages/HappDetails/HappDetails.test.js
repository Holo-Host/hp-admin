import React from 'react'
import { render, fireEvent, within, act } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import HappDetails from './HappDetails'
import { appOne as appHoloFuel} from 'mock-dnas/happStore'
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

async function renderHoloFuelApp (address = 'QmHHAHappEntryAddressHash1') {
  const render = await renderWithRouter(<MockedProvider mocks={mocks} addTypename={false}>
    <HappDetails history={{}} match={{ params: { address } }} />
  </MockedProvider>)

  await wait(0)
  return render
}

describe('HappDetails', () => {

  describe('rendering', () => {
    let getByText

    beforeEach(async () => {
      await act(async () => {
        ({ getByText } = await renderHoloFuelApp())
      })
    })

    it('renders app title', () => {
      expect(getByText(appHoloFuel.appEntry.title)).toBeInTheDocument()
    })

    it('renders app description', () => {
      expect(getByText(appHoloFuel.appEntry.description)).toBeInTheDocument()
    })
  })

  describe('HostButton', () => {
    it('calls disableHapp', async () => {
      let getByText
      await act(async () => {
        ({ getByText } = await renderHoloFuelApp())
      })

      expect(enableHappMock.newData).not.toHaveBeenCalled()
      expect(disableHappMock.newData).not.toHaveBeenCalled()

      fireEvent.click(getByText('Un-Host'))
      await act(() => wait(0))

      expect(enableHappMock.newData).not.toHaveBeenCalled()
      expect(disableHappMock.newData).toHaveBeenCalled()
    })

    it('calls enableHapp', async () => {
      let getByText
      await act(async () => {
        ({ getByText } = await renderHoloFuelApp('QmHHAHappEntryAddressHash2'))
      })

      expect(enableHappMock.newData).not.toHaveBeenCalled()
      expect(disableHappMock.newData).not.toHaveBeenCalled()

      fireEvent.click(getByText('Host'))
      await act(() => wait(0))

      expect(enableHappMock.newData).toHaveBeenCalled()
      expect(disableHappMock.newData).not.toHaveBeenCalled()
    })
  })
})
