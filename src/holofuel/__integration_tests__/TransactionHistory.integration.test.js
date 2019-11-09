import React from 'react'
import { fireEvent, wait, act } from '@testing-library/react'
import waait from 'waait'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

describe('HOLOFUEL : Transaction History', () => {
  it('A request is displayed', runConductor(async () => {
    const { getByTestId, getByText } = await renderAndWait(<HoloFuelApp />)
    await act(async () => {
      fireEvent.click(getByTestId('menu-button'))
      await waait(0)
    })
    await wait(() => getByText('History'))
    await act(async () => {
      fireEvent.click(getByText('History'))
      await waait(0)
    })

    // This is the test. If an element with text 'Pending' doesn't appear before timeout interval, the test will timeout.
    await wait(() => getByText('Pending'))
    expect(getByText('Pre-Seed Data')).toBeInTheDocument()
    expect(getByText('100')).toBeInTheDocument()
  }), 150000)
})
