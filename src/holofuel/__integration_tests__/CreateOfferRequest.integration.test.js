import React from 'react'
import wait from 'waait'
import { fireEvent, act } from '@testing-library/react'
import { renderAndWait, hackyWaitForElement } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import { agent2 } from 'utils/const'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')
jest.mock('contexts/useAuthContext')

describe('CreateOfferRequest', () => {
  it('allows you to create an offer', () => {
    jest.setTimeout(60000)
    return runConductor(async () => {
      const { queryByText, getByText, getByLabelText, getByTestId } = await renderAndWait(<HoloFuelApp />)

      const agentId = agent2.id
      const amountText = '- 123'
      const notes = 'Testing 123'

      fireEvent.click(getByText('New Transaction'))

      fireEvent.click(getByText('1'))
      fireEvent.click(getByText('2'))
      fireEvent.click(getByText('3'))
      fireEvent.click(getByText('Send'))

      fireEvent.change(getByLabelText('To', { exact: false }), { target: { value: agentId } })

      fireEvent.change(getByLabelText('For:'), { target: { value: notes } })

      var submitButton = getByTestId('submit-button')

      while (submitButton.disabled) {
        submitButton = getByTestId('submit-button')
        await wait(1000)
      }

      act(() => {
        fireEvent.click(getByTestId('submit-button'))
      })

      const amountField = await hackyWaitForElement(() => queryByText(amountText))

      expect(amountField).toBeInTheDocument()
      expect(getByText(notes)).toBeInTheDocument()
    })()
  })
})
