import React from 'react'
import { fireEvent, within, act, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// NB : REJECTION && CANCELLATION CASES STILL NEED TO BE HANDLED / TESTED....

describe('HOLOFUEL : Inbox', () => {
  it('A request is displayed', runConductor(async () => {
    const { getByTestId, getByText, getAllByRole } = await renderAndWait(<HoloFuelApp />) // debug,
    const header = getAllByRole('region')[1]
    await wait(() => within(header).getByText('Inbox'))

    // This is the test. If an element with text 'Pay' doesn't appear before timeout interval, the test will timeout.
    await wait(() => getByText('Pay'))
    expect(getByText('Pre-Seed Data')).toBeInTheDocument()
    expect(getByText('(100)')).toBeInTheDocument()
    // debug()

    // pay transaction
    await act(async () => {
      fireEvent.click(getByText('Pay'))
      await wait(0)
    })

    // accept transaction
    await wait(() => getByText('Accept'))
    expect(getByText('100')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(getByText('Accept'))
      await wait(0)
    })
    // debug()

    expect(getByText('Accept')).not.toBeInTheDocument()

    // navigate to tx history to verify tx completion
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('History'))
    fireEvent.click(getByText('History'))

    await wait(() => getByText('History'))
    expect(getByText('100')).toBeInTheDocument()
    expect(getByText('(100)')).toBeInTheDocument()
    expect(getByText('none')).toBeInTheDocument()
    // debug()

    console.log('found "Pay", all is good')
  }), 150000)
})
