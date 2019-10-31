import React from 'react'
import { MockedProvider } from '@apollo/react-testing'
import { SettingsRow, getLabelFromPortName } from './Settings'
import { renderAndWait } from 'utils/test-utils'

jest.mock('components/layout/PrimaryLayout')
// TODO: switch to mock pattern for Router
jest.unmock('react-router-dom')

const mockedSettings = {
  deviceName: 'My HoloPort',
  hostName: 'Holo Naut',
  hostPubKey: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8',
  networkStatus: 'live',
  registrationEmail: 'sam.rose@holo.host',
  sshAccess: true
}

const mockedStatus = {
  versionInfo: {
    availableVersion: 'b13891c28d78f1e916fdefb5edc1d386e4f533c8',
    currentVersion: '4707080a5cba68e8bc215e22ef1c8e7d8e70791b'
  },
  networkId: '505688f5c97313e5c7e34547e49a6ac46a05746b2e3faad724103b8ed34a4b108e15d08051db09eedd53ed089b19a5bfae9b1afdb7a9c65ad6f8aa9d98e4f2f2',
  ports: { primaryPort: '9993' }
}

describe('Settings', () => {
  describe('Rendering', () => {
    it('renders HoloPort Device Name from props', async () => {
      const props = {
        label: 'Device Name',
        content: mockedSettings.deviceName
      }

      const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
        <SettingsRow {...props} />
      </MockedProvider>, 0)

      expect(getByText('Device Name')).toBeInTheDocument()
      expect(getByText(mockedSettings.deviceName)).toBeInTheDocument()
    })

    it('renders HoloPort Device Network ID from props', async () => {
      const props = {
        label: 'Network ID',
        content: mockedStatus.networkId
      }

      const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
        <SettingsRow {...props} />
      </MockedProvider>, 0)

      expect(getByText('Network ID')).toBeInTheDocument()
      expect(getByText(mockedStatus.networkId)).toBeInTheDocument()
    })

    it('renders HoloPort Ports from props', async () => {
      const props = {
        label: getLabelFromPortName(Object.entries(mockedStatus.ports)[0][0]),
        content: mockedStatus.ports.primaryPort
      }

      const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
        <SettingsRow {...props} />
      </MockedProvider>, 0)

      expect(getByText('Primary Port')).toBeInTheDocument()
      expect(getByText(mockedStatus.ports.primaryPort)).toBeInTheDocument()
    })
  })
})
