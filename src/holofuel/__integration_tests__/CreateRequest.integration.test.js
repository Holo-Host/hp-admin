import React from 'react'
import { fireEvent, wait, act } from '@testing-library/react'
import { runConductor } from 'utils/runConductor.js'
import { renderAndWait, renderWithApolloRouterAwait, renderWithApolloRouter } from 'utils/test-utils'
import { id } from 'utils/agentConfig'
import { HoloFuelApp } from 'root'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

const runScenario = async () => {
  const amount = 123

  let getByTestId, getByText, getByLabelText
  await act(async () => {
    ({ getByTestId, getByText, getByLabelText } = renderWithApolloRouter(<HoloFuelApp />))
    await wait(0)
  })

  // const { getByTestId, getByText, getByLabelText } = await renderWithApolloRouterAwait(<HoloFuelApp />)
  fireEvent.click(getByTestId('menu-button'))
  await wait(() => getByText('Request'))

  fireEvent.click(getByText('Request'))

  await wait(() => getByLabelText('From'))
  // request from ourselves
  fireEvent.change(getByLabelText('From'), { target: { value: id } })
  fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })
  fireEvent.click(getByText('Send'))

  await wait(() => getByLabelText('History'))
  return true
}

describe('CreateRequest', () => {
  it('user can create a request and then view it in the transaction history', () => runConductor(runScenario), 20000)
})
