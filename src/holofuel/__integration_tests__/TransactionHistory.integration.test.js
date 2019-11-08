import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

describe('HOLOFUEL : Transaction History', () => {
  it('A request is displayed', runConductor(async () => {
    const { getByTestId, getByText } = await renderAndWait(<HoloFuelApp />) // debug,
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('History'))
    fireEvent.click(getByText('History'))

    // This is the test. If an element with text 'Pending' doesn't appear before timeout interval, the test will timeout.
    await wait(() => getByText('Pending'))
    await wait(() => getByText('Pre-Seed Data'))
    // debug()
  }), 150000)
})
