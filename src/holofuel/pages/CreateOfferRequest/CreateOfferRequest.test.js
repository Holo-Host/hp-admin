import React from 'react'
import { fireEvent, within, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import moment from 'moment'
import CreateOfferRequest, { FEE_PERCENTAGE } from './CreateOfferRequest'
import { TYPE } from 'models/Transaction'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import { newMessage as mockNewMessage } from 'holofuel/contexts/useFlashMessageContext'
import { presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import { HISTORY_PATH } from 'holofuel/utils/urls'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

const counterparty = {
  id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
  nickname: 'Perry'
}
const amount = 35674
const notes = 'Hi there'

const offerMock = {
  request: {
    query: HolofuelOfferMutation,
    variables: { amount, counterpartyId: counterparty.id, notes }
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
  }
}

const mockAgent1 = {
  pub_sign_key: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
  nick: 'Perry'
}

const mockWhoIsAgent1 = {
  id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
  nickname: 'Perry',
  notFound: false
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

const mockWhoamiAgent = {
  id: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
  nickname: 'Sam'
}

const whoamiMock = {
  request: {
    query: HolofuelUserQuery
  },
  result: {
    data: { holofuelUser: mockWhoamiAgent }
  }
}

const mocks = [
  offerMock,
  counterpartyQueryMock,
  whoamiMock
]

const enterAmountAndMode = async ({ amount, modeLabel, getByTestId, getByText }) => {
  await act(async () => {
    fireEvent.change(getByTestId('amount'), { target: { value: amount } })
    await wait(0)
  })
  await act(async () => {
    fireEvent.click(getByText(modeLabel))
    await wait(10)
  })
}

describe('CreateOfferRequest', () => {
  describe('offer mode', () => {
    it('renders a form that can be filled out and submitted', async () => {
      const push = jest.fn()

      const { getByLabelText, queryByTestId, getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })

      expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

      await act(async () => {
        fireEvent.change(getByLabelText('To:'), { target: { value: counterparty.id } })
        await wait(50)
      })

      expect(getByTestId('hash-icon')).toBeInTheDocument()

      expect(getByText(`${presentHolofuelAmount(amount)} TF`)).toBeInTheDocument()
      expect(getByText(`Total Amount: ${presentHolofuelAmount(amount + (amount * FEE_PERCENTAGE))} TF`)).toBeInTheDocument()
      expect(getByText(`A ${100 * FEE_PERCENTAGE}% fee is processed with all outgoing transactions`)).toBeInTheDocument()

      act(() => {
        fireEvent.change(getByLabelText('For:'), { target: { value: notes } })
      })

      await act(async () => {
        fireEvent.click(getByTestId('submit-button'))
        await wait(0)
      })

      expect(push).toHaveBeenCalledWith(HISTORY_PATH)
      expect(mockNewMessage).toHaveBeenCalledWith(`Offer of ${presentHolofuelAmount(amount)} TF sent to ${counterparty.nickname}.`, 5000)
    })

    it('renders error message upon attempt to transact with self', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const mockWhoamiAgent = {
        id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
        nickname: 'Perry'
      }

      const whoamiMock = {
        request: {
          query: HolofuelUserQuery
        },
        result: {
          data: { holofuelUser: mockWhoamiAgent }
        }
      }

      const mocks = [
        counterpartyQueryMock,
        whoamiMock
      ]

      const push = jest.fn()

      const { getByLabelText, getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })

      await act(async () => {
        fireEvent.change(getByLabelText('To:'), { target: { value: mockAgent1.pub_sign_key } })
        await wait(0)
      })

      expect(mockNewMessage).toHaveBeenCalledWith(`You cannot send yourself TestFuel.`, 5000)
    })

    it('renders the counterparty nickname upon *successful* fetch', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const mocks = [
        counterpartyQueryMock
      ]

      const push = jest.fn()

      const { getByLabelText, queryByTestId, getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })

      expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

      await act(async () => {
        fireEvent.change(getByLabelText('To:'), { target: { value: mockAgent1.pub_sign_key } })
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
        nick: 'Perry',
        notFound: false
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

      const { getByLabelText, queryByTestId, getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })

      expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

      await act(async () => {
        fireEvent.change(getByLabelText('To:'), { target: { value: mockAgent1.pub_sign_key } })
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

      const { getByLabelText, queryByTestId, getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })

      expect(queryByTestId('counterparty-nickname')).not.toBeInTheDocument()

      act(() => {
        fireEvent.change(getByLabelText('To:'), { target: { value: mockAgent1.pub_sign_key } })
      })

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

      const { getAllByTestId, getByLabelText, getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{}} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })

      const agentRows = getAllByTestId('agent-row')

      const agent1Row = agentRows.find(agentRow => {
        const { queryByText } = within(agentRow)
        return !!queryByText(agent1.nickname)
      })

      expect(agent1Row).toBeInTheDocument()
      fireEvent.click(agent1Row)

      expect(getByLabelText('To:').value).toEqual(agent1.id)

      const { getByText: getByTextInAgent1Row } = within(agent1Row)
      expect(getByTextInAgent1Row('Selected')).toBeInTheDocument()
    })

    it.skip('responds appropriately to bad input', () => {
      // this is a placeholder for once we add proper error handling
    })
  })

  describe('request mode', () => {
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
      }
    }

    const mocks = [
      requestMock,
      counterpartyQueryMock,
      whoamiMock
    ]

    it('renders a form that can be filled out and submitted', async () => {
      const push = jest.fn()

      const { getByLabelText, queryByTestId, getByTestId, getByText, queryByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Request', getByTestId, getByText })

      expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

      await act(async () => {
        fireEvent.change(getByLabelText('From:'), { target: { value: counterparty.id } })
        await wait(50)
      })

      expect(getByTestId('hash-icon')).toBeInTheDocument()

      expect(getByText(`${presentHolofuelAmount(amount)} TF`)).toBeInTheDocument()
      expect(getByText(`Total Amount: ${presentHolofuelAmount(amount + (amount * FEE_PERCENTAGE))} TF`)).toBeInTheDocument()
      expect(queryByText(`A ${100 * FEE_PERCENTAGE}% fee is processed with all outgoing transactions`)).not.toBeInTheDocument()

      act(() => {
        fireEvent.change(getByLabelText('For:'), { target: { value: notes } })
      })

      await act(async () => {
        fireEvent.click(getByTestId('submit-button'))
        await wait(0)
      })

      expect(push).toHaveBeenCalledWith(HISTORY_PATH)
      expect(mockNewMessage).toHaveBeenCalledWith(`Request for ${presentHolofuelAmount(amount)} TF sent to ${counterparty.nickname}.`, 5000)
    })
  })
})
