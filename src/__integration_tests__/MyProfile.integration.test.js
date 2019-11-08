import React from 'react'
import { fireEvent, within, wait } from '@testing-library/react'
import { renderAndWaitWithModal } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runHposApi from 'utils/integration-testing/runHposApiWithSetup'
import HposInterface from 'data-interfaces/HposInterface'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

describe('HP Admin : MyProfile', () => {
  it('User navigates to Profile Page, updates avatar url and name, then reviews TOS', runHposApi(async () => {
    const hposSettings = await HposInterface.os.settings()
    const newHostName = 'Host-Name-Test-123'

    const { getByTestId, getByLabelText, getByText, getAllByRole } = await renderAndWaitWithModal(<HPAdminApp />)
    // check starting hostname displayed on home screen
    await wait(() => getByText(hposSettings.hostName))

    // navigate to Profile Update Page
    fireEvent.click(getByTestId('profile-link'))
    const header = getAllByRole('region')[1]
    await wait(() => within(header).getByText('Edit Profile'))

    // navigate to TOS info
    await wait(() => getByTestId('tos-button'))
    fireEvent.click(getByTestId('tos-button'))
    // exit TOS modal
    await wait(() => getByText('Close'))
    fireEvent.click(getByText('Close'))

    // // TODO: Test avatar seed :
    // const avatarImage = getByTestId('host-avatar')
    // expect(avatarImage.prop('src')).toEqual(hposSettings.hostPubKey)

    // Update HPOS Host Name
    fireEvent.change(getByLabelText('Name'), { target: { value: newHostName } })
    fireEvent.click(getByText('Save Changes'))

    // navigate back to home dashboard
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Home'))
    fireEvent.click(getByText('Home'))

    // TODO : UNCOMMENT BELOW once HPOS Integration Testing is nixified and in place
    // Confirm new HPOS hostname on Home Page
    // await wait(() => getByText(newHostName))
  }), 150000)
})
