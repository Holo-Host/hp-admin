import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import { pick } from 'lodash/fp'
import { renderAndWait } from 'utils/test-utils'
import Settings, { SettingsRow } from './Settings'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateSettingsMutation from 'graphql/HposUpdateSettingsMutation.gql'
import { act } from 'react-dom/test-utils'

jest.mock('components/layout/PrimaryLayout')
jest.mock('contexts/useFlashMessageContext')

const deviceName = 'My Awesome Holoport'

const hposSettings = {
  hostPubKey: '1',
  hostName: 'name',
  registrationEmail: 'name@email.com',
  networkStatus: 'live',
  sshAccess: true,
  deviceName
}

describe('Settings', () => {  
  const hposSettingsMock = {
    request: {
      query: HposSettingsQuery
    },
    result: {
      data: {
        hposSettings
      }
    }
  }

  const hposStatusMock = {
    request: {
      query: HposStatusQuery
    },
    result: {
      data: {
        hposStatus: {
          versionInfo: {
            availableVersion: '2',
            currentVersion: '1'
          },
          networkId: 'sim2h',
          ports: {
            primaryPort: '3456'
          }
        }
      }
    }
  }

  const newDeviceName = 'Even more awesome HP'

  const hposUpdateSettingsMock = {
    request: {
      query: HposUpdateSettingsMutation,
      variables: {
        ...pick(['hostPubKey', 'hostName', 'sshAccess'], hposSettings),
        deviceName: newDeviceName
      }
    },
    result: {
      data: {
        hposUpdateSettings: {
          ...hposSettings,
          deviceName: newDeviceName
        }
      }
    }
  }

  const mocks = [
    hposSettingsMock,
    // this is intentionally doubled, we need two mocks for this because the query runs twice
    hposSettingsMock,
    hposStatusMock,
    hposUpdateSettingsMock
  ]

  it('optimistically updates device name', async () => {
    const { getByText, getByDisplayValue } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Settings />
    </MockedProvider>)
    act(() => {
      fireEvent.click(getByText(deviceName))
    })

    act(() => {
      fireEvent.change(getByDisplayValue(deviceName), { target: { value: newDeviceName } })
    })

    act(() => {
      fireEvent.click(getByText('Save'))
    })

    expect(getByText(newDeviceName)).toBeInTheDocument()
  })
})

describe('SettingsRow', () => {
  describe('Rendering', () => {
    it('renders HoloPort Device Name from props', async () => {
      const props = {
        label: 'Device Name',
        value: hposSettings.deviceName
      }

      const { getByText } = await render(<SettingsRow {...props} />)

      expect(getByText('Device Name')).toBeInTheDocument()
      expect(getByText(hposSettings.deviceName)).toBeInTheDocument()
    })
  })
})
