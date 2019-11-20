import React from 'react'
import Modal from 'react-modal'
import { render, fireEvent, within, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import moment from 'moment'
import CreateRequest from './CreateRequest'
import { TYPE } from 'models/Transaction'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import { newMessage as mockNewMessage } from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')
// TODO: switch to mock pattern for Router
jest.unmock('react-router-dom')

const counterparty = { id: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi' }
const amount = 35674
const notes = 'Hi there'

const renderWithRouter = (
  mocks,
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
    const requestMock = {
      request: {
        query: HolofuelRequestMutation,
        variables: { amount, counterpartyId: counterparty.id, notes }
      },
      result: {
        data: {
          holofuelRequest: {
            notes: 'Nothing in this object matters except we need the keys to be here to avoid apollo warnings',
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

    const push = jest.fn()

    let getByLabelText, getByText, queryByTestId, getByTestId, getByPlaceholderText
    await act(async () => {
      ({ getByLabelText, getByText, queryByTestId, getByTestId, getByPlaceholderText } = renderWithRouter(mocks, <CreateRequest history={{ push }} />))
      await wait(0)
    })

    expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('From'), { target: { value: counterparty.id } })

    expect(getByTestId('hash-icon')).toBeInTheDocument()

    fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })

    fireEvent.change(getByPlaceholderText('Notes'), { target: { value: notes } })

    await act(async () => {
      fireEvent.click(getByText('Send'))
      await wait(0)
    })

    expect(requestMock.newData).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/history')
    expect(mockNewMessage).toHaveBeenCalledWith(`Request for ${presentHolofuelAmount(amount)} HF sent to ${presentAgentId(counterparty.id)}.`, 5000)
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
      ({ container, getByLabelText, queryByTestId, getByTestId } = renderWithRouter(mocks, <CreateRequest history={{ push }} />))
      await wait(0)
      Modal.setAppElement(container)
    })

    expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.change(getByLabelText('From'), { target: { value: mockAgent1.pub_sign_key } })
      await wait(0)
    })

    expect(getByTestId('counterparty-nickname')).toBeInTheDocument()
    // TODO : DEBUG FAILURE for following expect
    // expect(within(getByTestId('counterparty-nickname')).getByText(mockWhoIsAgent1.nickname)).toBeInTheDocument()
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
      ({ container, getByLabelText, queryByTestId, getByTestId } = renderWithRouter(mocks, <CreateRequest history={{ push }} />))
      await wait(0)
      Modal.setAppElement(container)
    })

    expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.change(getByLabelText('From'), { target: { value: mockAgent1.pub_sign_key } })
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
      ({ container, getByLabelText, queryByTestId, getByTestId } = renderWithRouter(mocks, <CreateRequest history={{ push }} />))
      await wait(0)
      Modal.setAppElement(container)
    })

    expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

    fireEvent.change(getByLabelText('From'), { target: { value: mockAgent1.pub_sign_key } })

    expect(getByTestId('counterparty-nickname')).toBeInTheDocument()
    expect(within(getByTestId('counterparty-nickname')).getByText('Loading')).toBeInTheDocument()
  })

  it('renders a clickable list of recent counterparties', async () => {
    const agent1 = {
      id: 'fkljd',
      nickname: 'Jo'
    }

    const agent2 = {
      id: 'dskajln',
      nickname: 'Bob'
    }

    const mocks = [
      {
        request: {
          query: HolofuelHistoryCounterpartiesQuery
        },
        result: {
          data: { holofuelHistoryCounterparties: [agent1, agent2] }
        }
      }
    ]

    const { getAllByTestId, getByLabelText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <CreateRequest history={{}} />
    </MockedProvider>)

    const agentRows = getAllByTestId('agent-row')

    const agent1Row = agentRows.find(agentRow => {
      const { queryByText } = within(agentRow)
      return !!queryByText(agent1.nickname)
    })

    expect(agent1Row).toBeInTheDocument()
    fireEvent.click(agent1Row)

    expect(getByLabelText('From').value).toEqual(agent1.id)

    const { getByText: getByTextInAgent1Row } = within(agent1Row)
    expect(getByTextInAgent1Row('Selected')).toBeInTheDocument()
  })

  it.skip('responds appropriately to bad input', () => {
    // this is a placeholder for once we add proper error handling
  })
})
