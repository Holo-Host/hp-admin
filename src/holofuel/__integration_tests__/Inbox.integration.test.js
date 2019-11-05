import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// NB : REJECTION && CANCELLATION CASES STILL NEED TO BE HANDLED / TESTED....

describe('HOLOFUEL : Inbox', () => {
  it('A request is displayed', runConductor(async () => {
    console.log('6')

    const { debug, getByTestId, getByText } = await renderAndWait(<HoloFuelApp />)
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Inbox'))
    fireEvent.click(getByText('Inbox'))

    // This is the test. If an element with text 'Pay' doesn't appear before timeout interval, the test will timeout.
    await wait(() => getByText('Pay'))
    // await wait(() => getByText('Pre-Seed Data'))
    expect(getByText('Pre-Seed Data')).toBeInTheDocument()
    expect(getByText('(100)')).toBeInTheDocument()
    debug()

    // pay transaction
    fireEvent.click(getByText('Pay'))
    debug()

    // accept transaction
    await wait(() => getByText('Accept'))
    expect(getByText('100')).toBeInTheDocument()
    fireEvent.click(getByText('Accept'))
    debug()

    expect(getByText('Accept')).not.toBeInTheDocument()

    // navigate to tx history to verify tx completion
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('History'))
    fireEvent.click(getByText('History'))

    await wait(() => getByText('History'))
    expect(getByText('100')).toBeInTheDocument()
    expect(getByText('(100)')).toBeInTheDocument()
    expect(getByText('none')).toBeInTheDocument()
    debug()

    console.log('found "Pay", all is good')
  }), 150000)
})
