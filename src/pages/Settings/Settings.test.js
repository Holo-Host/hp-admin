import React from 'react'
import { render } from '@testing-library/react'
import { SettingsRow } from './Settings'

jest.mock('components/layout/PrimaryLayout')

const mockedSettings = {
  deviceName: 'My HoloPort',
  hostName: 'Holo Naut',
  hostPubKey: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8',
  networkStatus: 'live',
  registrationEmail: 'sam.rose@holo.host',
  sshAccess: true
}

describe('SettingsRow', () => {
  describe('Rendering', () => {
    it('renders HoloPort Device Name from props', async () => {
      const props = {
        label: 'Device Name',
        value: mockedSettings.deviceName
      }

      const { getByText } = await render(<SettingsRow {...props} />)

      expect(getByText('Device Name')).toBeInTheDocument()
      expect(getByText(mockedSettings.deviceName)).toBeInTheDocument()
    })
  })
})
