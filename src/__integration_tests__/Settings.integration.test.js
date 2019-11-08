import React from 'react'
import waait from 'waait'
import { fireEvent, within, act, wait } from '@testing-library/react'
import { renderAndWaitWithModal } from 'utils/test-utils'
import { sliceHash as presentHash } from 'utils'
import { HPAdminApp } from 'root'
import runHposApi from 'utils/integration-testing/runHposApiWithSetup'
import HposInterface from 'data-interfaces/HposInterface'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// TODO: Look into setting-up mock api data in HPOS API such that software update is needed...
// TODO: Create method to reference MOCK HPOS API data while we await the HPOS API to be completed and integrated into our nix setup

describe('HP Admin : Settings', () => {
  it('User navigates to Settings Page, updates software, reviews factory reset instructions', runHposApi(async () => {
    const hposSettings = await HposInterface.os.settings()
    const hposStatus = await HposInterface.os.status()

    const { getByTestId, getByText } = await renderAndWaitWithModal(<HPAdminApp />)
    // navigate to earnings page
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Settings'))
    fireEvent.click(getByText('Settings'))

    await wait(() => getByText('HoloPort Settings'))

    // Confirm HPOS Data Returned :
    // *************************************************
    // find HPOS Device Name
    await wait(() => getByTestId('settings-header'))
    const deviceName = getByTestId('device-name')
    expect(within(deviceName).getByText(hposSettings.deviceName)).toBeInTheDocument()
    // find (last 6 of) Host's HPOS PubKey
    await wait(() => getByText(presentHash(hposSettings.hostPubKey)))
    // find Network Setting
    const networkStatus = getByTestId('network-type')
    expect(within(networkStatus).getByText(presentHash(hposStatus.networkId, 14))).toBeInTheDocument()
    // TODO : Update Network Id to Network Status:
    // expect(within(networkStatus).getByText(hposSettings.networkStatus)).toBeInTheDocument()

    // // find Port Number
    // await wait(() => getByText('443'))
    // find Software Version
    const currentVersion = await wait(() => getByText(presentHash(hposStatus.versionInfo.currentVersion)))
    const availableVersion = presentHash(hposStatus.versionInfo.availableVersion)
    if (availableVersion !== currentVersion) {
      // verify 'update-software' display
      await wait(() => getByText('Update Software'))
      await act(async () => {
        fireEvent.click(getByText('Update Software'))
        await waait(0)
      })
      // preform update software request
      const modalMessage = getByTestId('modal-message')
      expect(within(modalMessage).getByText(hposSettings.deviceName, { exact: false })).toBeInTheDocument()
      expect(within(modalMessage).getByText(availableVersion, { exact: false })).toBeInTheDocument()

      await wait(() => getByText('Yes'))
      fireEvent.click(getByText('Yes'))
    }
    // TODO: Comment back in below line once the method to reference MOCK HPOS API data is created...
    // await wait(() => getByText('Software is up-to-date'))

    // navigate to factory reset instructions
    await wait(() => getByText('Factory Reset'))
    fireEvent.click(getByText('Factory Reset'))

    // navigate back to home dashboard
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Home'))
    fireEvent.click(getByText('Home'))
  }), 150000)
})
