import React from 'react'
import { render } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Settings from './Settings'

const mockedProps = {
  hostName: 'My Host',
  hostUrl: 'https://some-host-url.holo.host',
  hostPubKey: 'hcsFAkeHashSTring2443223ee',
  registrationEmail: 'iamahost@hosting.com',
  deviceName: 'My Very First HoloPort',
  networkId: 'my-holoport-network-id',
  sshAccess: false,
  deviceAdminPort: 6609,
  hcAdminPort: 8800,
  hcNetworkPort: 35353,
  hostingPort: 8080
}

const renderWithRouter = (
  props,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => render(<Router history={history}>
  <Settings {...props} />
</Router>)

describe('Settings', () => {
  describe('Rendering', () => {
    it('renders HoloPort name from props', () => {
      const { getByText } = renderWithRouter({ settings: mockedProps })

      expect(getByText('Name')).toBeInTheDocument()
      expect(getByText(mockedProps.deviceName)).toBeInTheDocument()
    })

    it('renders HoloPort host url from props', () => {
      const { getByText } = renderWithRouter({ settings: mockedProps })

      expect(getByText('URL')).toBeInTheDocument()
      expect(getByText(mockedProps.hostUrl)).toBeInTheDocument()
    })

    it('renders network id from props', () => {
      const { getByText } = renderWithRouter({ settings: mockedProps })

      expect(getByText('Network ID')).toBeInTheDocument()
      expect(getByText(mockedProps.networkId)).toBeInTheDocument()
    })

    it('renders port numbers from props', () => {
      const { getByText, getByPlaceholderText } = renderWithRouter({ settings: mockedProps })

      expect(getByText('Access Port Numbers')).toBeInTheDocument()

      expect(getByText('Device Admin')).toBeInTheDocument()
      expect(getByPlaceholderText('Device Admin').value).toEqual(String(mockedProps.deviceAdminPort))

      expect(getByText('HC Admin')).toBeInTheDocument()
      expect(getByPlaceholderText('HC Admin').value).toEqual(String(mockedProps.hcAdminPort))

      expect(getByText('HC Network')).toBeInTheDocument()
      expect(getByPlaceholderText('HC Network').value).toEqual(String(mockedProps.hcNetworkPort))

      expect(getByText('Hosting')).toBeInTheDocument()
      expect(getByPlaceholderText('Hosting').value).toEqual(String(mockedProps.hostingPort))
    })
  })
})
