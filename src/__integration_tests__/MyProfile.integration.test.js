import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runHposApi from 'utils/integration-testing/runHposApiWithSetup'
import HposInterface from 'data-interfaces/HposInterface'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

const hposSettings = HposInterface.os.settings
const newHostName = 'Host-Name-Test-123'

describe('HP Admin : MyProfile', () => {
  it('User navigates to Profile Page, updates avatar url and name, then reviews TOS', runHposApi(async () => {
    const { getByTestId, getByLabelText, getByText } = await renderAndWait(<HPAdminApp />)
    const profileLink = getByTestId('profile-link')
    fireEvent.click(profileLink)

    await wait(() => getByText(hposSettings.hostName))
    // TODO : Find good way to test avatar seed :
    // await wait(() => getByImageSeed(hposSettings.hostPubKey))

    // Update HPOS Host Name
    fireEvent.change(getByLabelText('Name'), { target: { value: newHostName } })
    fireEvent.click(getByText('Save Changes'))
    await wait(() => getByText('Save Changes'))
    // Confirm new HPOS Host Name
    await wait(() => getByText(newHostName))

    // navigate to factory reset instructions
    fireEvent.click(getByText('View Terms of Service'))
    await wait(() => getByText('View Terms of Service'))
    // exit TOS modal
    fireEvent.click(getByText('Close'))
    await wait(() => getByText('Close'))

    // navigate back to home dashboard
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Home'))
    fireEvent.click(getByText('Home'))
  }), 150000)
})
