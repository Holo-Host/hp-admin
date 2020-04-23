import React from 'react'
import waait from 'waait'
import { fireEvent, within, act, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
// import { mockNavigateTo } from 'react-router-dom'
import { HoloFuelApp } from 'root'
import { presentHolofuelAmount, presentAgentId } from 'utils'
import { agent1 } from 'utils/const'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')
jest.mock('contexts/useAuthContext')

describe('CreateOfferRequest', () => {
  it('allows you to create an offer', async () => {
    jest.setTimeout(60000)

    const { debug, getByText, getByLabelText, getByTestId, findByText } = await renderAndWait(<HoloFuelApp />)

    const agentId = agent1.id
    const amount = '123'
    const notes = 'Testing 123'

    // act(() => {
      fireEvent.click(getByText('New Transaction'))
    // })

    // act(() => {
      fireEvent.click(getByText('1'))
      fireEvent.click(getByText('2'))
      fireEvent.click(getByText('3'))
      fireEvent.click(getByText('Send'))
    // })

    // act(() => {
      fireEvent.change(getByLabelText('To', { exact: false }), { target: { value: agentId } })
    // })

    // act(() => {
      fireEvent.change(getByLabelText('For:'), { target: { value: notes } })
    // })

    var submitButton = getByTestId('submit-button')

    while (submitButton.disabled) {
      console.log('still disabled')
      submitButton = getByTestId('submit-button')
      await waait(1000)
    }

    console.log('submitButton.disabled', submitButton.disabled)

    console.log('clicking submit!')
    fireEvent.click(getByTestId('submit-button'))

    // await waait(55000)



    // debug()

    const amountField = await findByText(amount)

    expect(getByText(getByText(amount))).toBeInTheDocument()

    // debug()
  })
})
