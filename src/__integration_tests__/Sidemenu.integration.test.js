import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runHposApi from 'utils/integration-testing/runHposApiWithSetup'
import HposInterface from 'data-interfaces/HposInterface'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

describe('HP Admin : Sidemenu', () => {
  it('Contains the host HPOS API PubKey and Name', runHposApi(async () => {
    const hposSettings = await HposInterface.os.settings()

    const { getByTestId, getByText } = await renderAndWait(<HPAdminApp />)
    const menuButton = getByTestId('menu-button')
    fireEvent.click(menuButton)

    await wait(() => getByText('HP Admin'))
    await wait(() => getByText(hposSettings.hostName))
  }), 150000)
})
