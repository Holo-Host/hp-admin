import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import moment from 'moment'
import CreateRequest from './CreateRequest'
import { TYPE } from 'models/Transaction'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'

jest.mock('holofuel/components/Header')

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

describe('CreateRequest', () => {
  it('renders a form that can be filled out and submitted', async () => {
    const push = jest.fn()

    let getByLabelText, getByText, queryByTestId, getByTestId
    await act(async () => {
      ({ getByLabelText, getByText, queryByTestId, getByTestId } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateRequest history={{ push }} />
      </MockedProvider>))
      await wait(0)
    })

    expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('To'), { target: { value: counterparty } })

    expect(getByTestId('hash-icon')).toBeInTheDocument()

    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })

    await act(async () => {
      fireEvent.click(getByText('Send'))
      await wait(0)
    })

    expect(requestMock.newData).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/history')
  })

  it.skip('responds appropriately to bad input', () => {
    // this is a placeholder for once we add proper error handling
  })
})
