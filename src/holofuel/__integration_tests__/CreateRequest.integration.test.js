import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import { getAgent } from 'utils/conductorConfig'
import runConductor from 'util/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

const agentId = getAgent().id

describe('CreateRequest', () => {
  it('user can create a request and then view it in the transaction history', runConductor(async () => {
    const amount = 123

    const { getByTestId, getByText, getByLabelText } = await renderAndWait(<HoloFuelApp />)
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Request'))

    fireEvent.click(getByText('Request'))

    await wait(() => getByLabelText('From'))
    // request from ourselves
    fireEvent.change(getByLabelText('From'), { target: { value: agentId } })
    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })
    fireEvent.click(getByText('Send'))

    await wait(() => getByLabelText('History'))
  }), 20000)
})
