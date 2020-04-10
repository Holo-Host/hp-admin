import React from 'react'
import { fireEvent, within, wait } from '@testing-library/react'
import { renderAndWait, setupModal } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runHposApi from 'utils/integration-testing/runHposApiWithSetup'
import HposInterface from 'data-interfaces/HposInterface'
import { login } from './Login.integration.test'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

describe.skip('MyProfile', () => {
  it('User navigates to Profile Page, updates avatar url and name, then reviews TOS', runHposApi(async () => {
    const hposSettings = await HposInterface.os.settings()
    const newHostName = 'Host-Name-Test-123'

    const queries = await setupModal(renderAndWait(<HPAdminApp />))
    const { getByTestId, getByLabelText, getByText, getAllByText, getAllByRole } = queries

    // login and arrive at home page
    await login(queries)
      .then(result => result())

    // check starting hostname displayed on home screen
    await wait(() => getByText(hposSettings.hostName))

    // navigate to Profile Update Page
    fireEvent.click(getByTestId('profile-link'))
    const header = getAllByRole('region')[1]
    await wait(() => within(header).getByText('Edit Profile'))

    // navigate to TOS info
    // NB: First instance of TOS appears in the side nav-bar.
    const profileTOS = getAllByText('View Terms of Service')[1]
    await wait(() => profileTOS)
    fireEvent.click(profileTOS)
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
