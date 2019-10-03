import React from 'react'
import Modal from 'react-modal'
import { render, fireEvent, within, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import moment from 'moment'
import CreateOffer, { FEE_PERCENTAGE } from './CreateOffer'
import { TYPE } from 'models/Transaction'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import { newMessage as mockNewMessage } from 'holofuel/contexts/useFlashMessageContext'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

const counterparty = 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi'
const amount = 35674
const notes = 'Hi there'

const offerMock = {
  request: {
    query: HolofuelOfferMutation,
    variables: { amount, counterparty, notes }
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

    let getByLabelText, getByText, queryByTestId, getByTestId, getByPlaceholderText
    await act(async () => {
      ({ getByLabelText, getByText, queryByTestId, getByTestId, getByPlaceholderText } = renderWithRouter(<CreateOffer history={{ push }} />))
      await wait(0)
    })

    expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('To'), { target: { value: counterparty } })

    expect(getByTestId('hash-icon')).toBeInTheDocument()

    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })

    expect(getByLabelText('Fee (1%)').value).toEqual((amount * FEE_PERCENTAGE).toFixed(2))

    expect(getByLabelText('Total').value).toEqual((amount + (amount * FEE_PERCENTAGE)).toFixed(2))

    fireEvent.change(getByPlaceholderText('Notes'), { target: { value: notes } })

    await act(async () => {
      fireEvent.click(getByText('Send'))
      await wait(0)
    })

    expect(offerMock.newData).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/history')
    expect(mockNewMessage).toHaveBeenCalledWith(`Offer of ${presentHolofuelAmount(amount)} HF sent to ${presentAgentId(counterparty)}.`, 5000)
  })

  it('renders the counterparty nickname upon *successful* fetch', async () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    const mockAgent1 = {
      pub_sign_key: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
      nick: 'Perry'
    }

    const mockWhoIsAgent1 = {
      id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
      nickname: 'Perry'
    }

    const counterpartyQueryMock = {
      request: {
        query: HolofuelCounterpartyQuery,
        variables: { agentId: mockAgent1.pub_sign_key }
      },
      result: {
        data: { holofuelCounterparty: mockWhoIsAgent1 }
      }
    }

    const mocks = [
      counterpartyQueryMock
    ]

    const push = jest.fn()

    let container, getByLabelText, queryByTestId, getByTestId
    await act(async () => {
      ({ container, getByLabelText, queryByTestId, getByTestId } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOffer history={{ push }} />
      </MockedProvider>))
      await wait(0)
      Modal.setAppElement(container)
    })

    expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.change(getByLabelText('To'), { target: { value: mockAgent1.pub_sign_key } })
      await wait(0)
    })

    expect(getByTestId('counterparty-nickname')).toBeInTheDocument()
    expect(within(getByTestId('counterparty-nickname')).getByText(mockWhoIsAgent1.nickname)).toBeInTheDocument()
  })

  it('renders the counterparty error message upon *unsuccessful* fetch', async () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    const mockAgent1 = {
      pub_sign_key: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
      nick: 'Perry'
    }

    const counterpartyQueryMockError = {
      request: {
        query: HolofuelCounterpartyQuery,
        variables: { agentId: mockAgent1.pub_sign_key }
      },
      error: new Error('ERROR! : <Error Message>')
    }

    const mocks = [
      counterpartyQueryMockError
    ]

    const push = jest.fn()

    let container, getByLabelText, queryByTestId, getByTestId
    await act(async () => {
      ({ container, getByLabelText, queryByTestId, getByTestId } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOffer history={{ push }} />
      </MockedProvider>))
      await wait(0)
      Modal.setAppElement(container)
    })

    expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.change(getByLabelText('To'), { target: { value: mockAgent1.pub_sign_key } })
      await wait(0)
    })

    expect(getByTestId('counterparty-nickname')).toBeInTheDocument()
    expect(within(getByTestId('counterparty-nickname')).getByText('No nickname available.')).toBeInTheDocument()
  })

  it('renders loading message/indicator while fetching', async () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    const mockAgent1 = {
      pub_sign_key: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
      nick: 'Perry'
    }

    const counterpartyQueryMockError = {
      request: {
        query: HolofuelCounterpartyQuery,
        variables: { agentId: mockAgent1.pub_sign_key }
      },
      error: new Error('ERROR! : <Error Message>')
    }

    const mocks = [
      counterpartyQueryMockError
    ]

    const push = jest.fn()

    let container, getByLabelText, queryByTestId, getByTestId
    await act(async () => {
      ({ container, getByLabelText, queryByTestId, getByTestId } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOffer history={{ push }} />
      </MockedProvider>))
      await wait(0)
      Modal.setAppElement(container)
    })

    expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('To'), { target: { value: mockAgent1.pub_sign_key } })

    expect(getByTestId('counterparty-nickname')).toBeInTheDocument()
    expect(within(getByTestId('counterparty-nickname')).getByText('Loading')).toBeInTheDocument()
  })

  it.skip('responds appropriately to bad input', () => {
    // this is a placeholder for once we add proper error handling
  })
})
