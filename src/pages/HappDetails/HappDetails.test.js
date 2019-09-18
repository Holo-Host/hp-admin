import React from 'react'
import { render, fireEvent, act, cleanup } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import wait from 'waait'
import mockEnvoyInterface from 'data-interfaces/EnvoyInterface'
import hhaInterface from 'data-interfaces/HhaDnaInterface'
import { appOne as appHoloFuel } from 'mock-dnas/happStore'
import HappDetails from './HappDetails'

jest.mock('data-interfaces/EnvoyInterface')

afterEach(() => {
  apolloClient.resetStore()
})

async function renderHappDetails (appId = 'QmHHAHappEntryAddressHash1') {
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const app = await render(<ApolloProvider client={apolloClient}>
    <Router history={history}>
      <HappDetails history={{}} match={{ params: { appId } }} />
    </Router>
  </ApolloProvider>)

  await wait(0)
  return app
}

describe('HappDetails', () => {
  describe('rendering', () => {
    let getByText

    beforeEach(async () => {
      await act(async () => {
        ({ getByText } = await renderHappDetails())
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
    it('enables apps', async () => {
      hhaInterface.happs.enable = jest.fn()
      let getByText
      await act(async () => {
        ({ getByText } = await renderHappDetails('QmHHAHappEntryAddressHash2'))
      })

      fireEvent.click(getByText('Host'))
      await act(() => wait(0))

      expect(hhaInterface.happs.enable).toHaveBeenCalledWith('QmHHAHappEntryAddressHash2')
      expect(mockEnvoyInterface.happs.install).toHaveBeenCalledWith('QmHHAHappEntryAddressHash2')
    })

    it('calls disableHapp', async () => {
      hhaInterface.happs.disable = jest.fn()
      let getByText
      await act(async () => {
        ({ getByText } = await renderHappDetails())
      })

      expect(hhaInterface.happs.disable).not.toHaveBeenCalled()

      fireEvent.click(getByText('Un-Host'))
      await act(() => wait(0))

      expect(hhaInterface.happs.disable).toHaveBeenCalledWith('QmHHAHappEntryAddressHash1')
    })
  })

  describe('Modal', () => {
    beforeEach(cleanup)
    it('shows modal after enabling hApp', async () => {
      let getByText
      await act(async () => {
        ({ getByText } = await renderHappDetails('QmHHAHappEntryAddressHash2'))
      })

      fireEvent.click(getByText('Host'))
      await act(() => wait(0))

      expect(getByText('now being hosted', { exact: false })).toBeInTheDocument()
    })

    it('"Back to hApps" in modal navigates to /browse-apps', async () => {
      const memoryHistory = createMemoryHistory({ initialEntries: ['/'] })
      const mockHistory = { push: jest.fn() }
      let getByText
      await act(async () => {
        ({ getByText } = render(
          <Router history={memoryHistory}>
            <ApolloProvider client={apolloClient}>
              <HappDetails history={mockHistory} match={{ params: { appId: 'QmHHAHappEntryAddressHash2' } }} />
            </ApolloProvider>
          </Router>
        ))
      })
      await wait(0)
      fireEvent.click(getByText('Host'))
      await act(() => wait(0))

      fireEvent.click(getByText('Back to hApps'))
      await act(() => wait(0))

      expect(mockHistory.push).toHaveBeenCalledWith('/browse-happs')
    })
  })
})
