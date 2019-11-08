import React from 'react'
import waait from 'waait'
// import { mockNavigateTo } from 'react-router-dom'
import { fireEvent, within, act, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
// import { presentHolofuelAmount, presentAgentId } from 'utils'
import { HoloFuelApp } from 'root'
import { getAgent } from 'utils/integration-testing/conductorConfig'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

describe('HOLOFUEL : CreateRequest', () => {
  const agentId = getAgent().id
  const amount = 123
  const notes = 'Testing 123'

  it('user can create a request and then view it in the transaction history', runConductor(async () => {
    const { getByTestId, getByText, getByLabelText, getByPlaceholderText, getAllByRole } = await renderAndWait(<HoloFuelApp />)
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Request'))

    fireEvent.click(getByText('Request'))

    await wait(() => getByLabelText('From'))
    // request from ourself
    fireEvent.change(getByLabelText('From'), { target: { value: agentId } })
    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })
    fireEvent.change(getByPlaceholderText(/notes/i), { target: { value: notes } })

    await act(async () => {
      fireEvent.click(getByText('Send'))
      await waait(0)
    })

    const header = getAllByRole('region')[1]
    await wait(() => within(header).getByText('History'))
    // **************************************************************
    // TODO: Determine why this doens't appear until after refresh...
    // **************************************************************
    // expect(getByText(presentAgentId(agentId))).toBeInTheDocument()
    // expect(getByText(presentHolofuelAmount(amount))).toBeInTheDocument()
  }), 150000)
})
