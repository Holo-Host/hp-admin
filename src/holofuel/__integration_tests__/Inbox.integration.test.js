import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import runConductor from 'utils/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

describe('Inbox', () => {
  it('A request is displayed', runConductor(async () => {
    console.log('6')

    const { getByTestId, getByText } = await renderAndWait(<HoloFuelApp />)
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByTestId('inbox-link'))

    fireEvent.click(getByTestId('inbox-link'))

    // This is the test. If an element with text 'Pay' doesn't appear before timeout interval, the test will timeout
    await wait(() => getByText('Pay'))

    debug()

    console.log('found "Pay", all is good')
  }), 240000)
})
