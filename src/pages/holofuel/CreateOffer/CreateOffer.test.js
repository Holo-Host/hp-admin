import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import moment from 'moment'
import CreateOffer, { FEE_PERCENTAGE } from './CreateOffer'
import { TYPE } from 'models/Transaction'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'

jest.mock('components/holofuel/layout/PrimaryLayout')

const counterparty = 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi'
const amount = 35674

const offerMock = {
  request: {
    query: HolofuelOfferMutation,
    variables: { amount, counterparty }
  },
  result: {
    data: {
      holofuelOffer: {
        notes: 'Nothing in this object matters except we need the key to be here to avoid apollo warnings',
        id: '123',
        counterparty,
        amount,
        type: TYPE.offer,
        timestamp: moment().subtract(14, 'days'),
        direction: '',
        status: ''
      }
    }
  },
  newData: jest.fn()
}

const mocks = [
  offerMock
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

describe('CreateOffer', () => {
  it('renders a form that can be filled out and submitted', async () => {
    const push = jest.fn()

    let getByLabelText, getByText, queryByTestId, getByTestId
    await act(async () => {
      ({ getByLabelText, getByText, queryByTestId, getByTestId } = renderWithRouter(<CreateOffer history={{ push }} />))
      await wait(0)
    })

    expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('To'), { target: { value: counterparty } })

    expect(getByTestId('hash-icon')).toBeInTheDocument()

    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })

    expect(getByLabelText('Fee').value).toEqual((amount * FEE_PERCENTAGE).toFixed(2))

    await act(async () => {
      fireEvent.click(getByText('Send'))
      await wait(0)
    })

    expect(offerMock.newData).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/history')
  })

  it.skip('responds appropriately to bad input', () => {
    // this is a placeholder for once we add proper error handling
  })
})
