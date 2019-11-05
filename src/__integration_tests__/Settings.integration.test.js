import React from 'react'
import { fireEvent, within, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { sliceHash as presentHash } from 'utils'
import { HPAdminApp } from 'root'
import runHposApi from 'utils/integration-testing/runHposApiWithSetup'
import HposInterface from 'data-interfaces/HposInterface'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// TODO: Look into setting-up mock api data in HPOS API such that software update is needed...

describe('HP Admin : Settings', () => {
  it('User navigates to Settings Page, updates software, reviews factory reset instructions', runHposApi(async () => {
    const hposSettings = await HposInterface.os.settings()
    const hposStatus = await HposInterface.os.status()
    console.log('hposSettings : ', hposSettings)
    console.log('hposStatus : ', hposStatus)

    const { getByTestId, getByLabelText, getByText } = await renderAndWait(<HPAdminApp />)
    // navigate to earnings page
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Settings'))
    fireEvent.click(getByText('Settings'))

    await wait(() => getByText('HoloPort Settings'))

    // Confirm HPOS Data Returned :
    // *************************************************
    // find HPOS Device Name
    await wait(() => getByTestId('settings-header'))
    const deviceName = getByLabelText('Device Name')
    expect(within(deviceName).getByText(hposSettings.deviceName)).toBeInTheDocument()
    // find (last 6 of) Host's HPOS PubKey
    await wait(() => getByText(presentHash(hposSettings.hostPubKey)))
    // find Network Setting
    const networkStatus = getByLabelText('Network Id')
    expect(within(networkStatus).getByText(hposSettings.networkStatus)).toBeInTheDocument()
    // // find Port Number
    // await wait(() => getByText('443'))
    // find Software Version
    const currentVersion = await wait(() => getByText(hposStatus.versionInfo.currentVersion))
    const availableVersion = await wait(() => getByText(hposStatus.versionInfo.availableVersion))

    if (availableVersion !== currentVersion) {
      // verify 'update-software' display
      await wait(() => getByText('Update Software'))
      await wait(() => getByText('Factory Reset'))

      // update software
      fireEvent.click(getByText('Update Software'))
      await wait(() => getByText('Yes'))
      fireEvent.click(getByText('Yes'))
      await wait(() => getByText('Software is up-to-date'))
    } else {
      await wait(() => getByText('Software is up-to-date'))
    }

    // navigate to factory reset instructions
    fireEvent.click(getByText('Factory Reset'))
    await wait(() => getByText('Factory Reset'))

    // navigate back to home dashboard
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Home'))
    fireEvent.click(getByText('Home'))
  }), 150000)
})
