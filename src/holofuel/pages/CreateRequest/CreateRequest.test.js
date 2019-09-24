import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import moment from 'moment'
import CreateRequest from './CreateRequest'
import { TYPE } from 'models/Transaction'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import { newMessage as mockNewMessage } from 'holofuel/contexts/useFlashMessageContext'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

const counterparty = 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi'
const amount = 35674

const requestMock = {
  request: {
    query: HolofuelRequestMutation,
    variables: { amount, counterparty }
  },
  result: {
    data: {
      holofuelRequest: {
        notes: 'Nothing in this object matters except we need the key to be here to avoid apollo warnings',
        id: '123',
        counterparty,
        amount,
        type: TYPE.request,
        timestamp: moment().subtract(14, 'days'),
        direction: '',
        status: ''
      }
    }
  },
  newData: jest.fn()
}

const mocks = [
  requestMock
]

const renderWithRouter = (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      <MockedProvider mocks={mocks} addTypename={false}>
        {ui}
      </MockedProvider>
    </Router>
  ),
  history
})

describe('CreateRequest', () => {
  it('renders a form that can be filled out and submitted', async () => {
    const push = jest.fn()

    let getByLabelText, getByText, queryByTestId, getByTestId
    await act(async () => {
      ({ getByLabelText, getByText, queryByTestId, getByTestId } = renderWithRouter(
        <CreateRequest history={{ push }} />
      ))
      await wait(0)
    })

    expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('From'), { target: { value: counterparty } })

    expect(getByTestId('hash-icon')).toBeInTheDocument()

    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })

    await act(async () => {
      fireEvent.click(getByText('Send'))
      await wait(0)
    })

    expect(requestMock.newData).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/history')
    expect(mockNewMessage).toHaveBeenCalledWith(`Request for ${presentHolofuelAmount(amount)} HF sent to ${presentAgentId(counterparty)}.`, 5000)
  })

  it.skip('responds appropriately to bad input', () => {
    // this is a placeholder for once we add proper error handling
  })
})
