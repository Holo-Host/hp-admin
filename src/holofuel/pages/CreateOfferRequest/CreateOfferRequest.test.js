import React from 'react'
import { fireEvent, within, act } from '@testing-library/react'
import wait from 'waait'
import { MockedProvider } from '@apollo/react-testing'
import moment from 'moment'
import CreateOfferRequest, { FEE_PERCENTAGE } from './CreateOfferRequest'
import { TYPE } from 'models/Transaction'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelRecentCounterpartiesQuery from 'graphql/HolofuelRecentCounterpartiesQuery.gql'
import { newMessage as mockNewMessage } from 'holofuel/contexts/useFlashMessageContext'
import { currentUser as mockCurrentUser } from 'holofuel/contexts/useCurrentUserContext'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import { HISTORY_FROM_SENT_TRANSACTION_PATH } from 'holofuel/utils/urls'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')
jest.mock('holofuel/contexts/useCurrentUserContext')

const counterparty = {
  agentAddress: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
  nickname: 'Perry',
  avatarUrl: ''
}
const amount = '35674'
const notes = 'Hi there'
const offer = { amount, counterparty: { agentAddress: counterparty.agentAddress, nickname: '' }, notes }

const offerMock = {
  request: {
    query: HolofuelOfferMutation,
    variables: { offer }
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
        status: '',
        isActioned: false
      }
    }
  }
}

const mocks = [
  offerMock
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
        fireEvent.change(getByLabelText('To:'), { target: { value: counterparty.agentAddress } })
        await wait(50)
      })

      expect(getByTestId('hash-icon')).toBeInTheDocument()

      expect(getByText(`${presentHolofuelAmount(amount)} TF`)).toBeInTheDocument()
      expect(getByText(`Total Amount: ${presentHolofuelAmount(amount)} TF`)).toBeInTheDocument()
      expect(getByText(`For TestFuel, a ${100 * FEE_PERCENTAGE}% fee is processed with all outgoing transactions`)).toBeInTheDocument()

      act(() => {
        fireEvent.change(getByLabelText('For:'), { target: { value: notes } })
      })

      await act(async () => {
        fireEvent.click(getByTestId('submit-button'))
        await wait(0)
      })

      expect(push).toHaveBeenCalledWith(HISTORY_FROM_SENT_TRANSACTION_PATH)
      expect(mockNewMessage).toHaveBeenCalledWith(`Offer of ${presentHolofuelAmount(amount)} TF sent to ${presentAgentId(counterparty.agentAddress)}.`, 5000)
    })

    it('renders error message upon attempt to transact with self', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const push = jest.fn()

      const { getByLabelText, getByTestId, getByText } = await renderAndWait(<MockedProvider addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })

      await act(async () => {
        fireEvent.change(getByLabelText('To:'), { target: { value: mockCurrentUser.id } })
        await wait(50)
      })

      expect(mockNewMessage).toHaveBeenCalledWith('You cannot send yourself TestFuel.', 5000)
    })

    it('renders a clickable list of recent counterparties', async () => {
      const agent1 = {
        agentAddress: 'fkljdn',
        nickname: 'Jo',
        avatarUrl: ''
      }

      const agent2 = {
        agentAddress: 'dskajl',
        nickname: 'Bob',
        avatarUrl: ''
      }

      const mocks = [
        {
          request: {
            query: HolofuelRecentCounterpartiesQuery
          },
          result: {
            data: { holofuelRecentCounterparties: [agent1, agent2] }
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

      expect(getByLabelText('To:').value).toEqual(agent1.agentAddress)

      const { getByText: getByTextInAgent1Row } = within(agent1Row)
      expect(getByTextInAgent1Row('Selected')).toBeInTheDocument()
    })

    it('takes you back to the amount edit screen when clicking on the amount', async () => {
      const { getByTestId, getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{}} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Send', getByTestId, getByText })
      fireEvent.click(getByText(`${presentHolofuelAmount(amount)} TF`))
      expect(getByTestId('amount').value).toEqual(amount)
    })
  })

  describe('request mode', () => {
    const request = { amount, counterparty: { agentAddress: counterparty.agentAddress, nickname: '' }, notes }

    const requestMock = {
      request: {
        query: HolofuelRequestMutation,
        variables: { request }
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
      requestMock
    ]

    it('renders a form that can be filled out and submitted', async () => {
      const push = jest.fn()

      const { getByLabelText, queryByTestId, getByTestId, getByText, queryByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <CreateOfferRequest history={{ push }} />
      </MockedProvider>)

      await enterAmountAndMode({ amount, modeLabel: 'Request', getByTestId, getByText })

      expect(queryByTestId('hash-icon')).not.toBeInTheDocument()

      await act(async () => {
        fireEvent.change(getByLabelText('From:'), { target: { value: counterparty.agentAddress } })
        await wait(50)
      })

      expect(getByTestId('hash-icon')).toBeInTheDocument()

      expect(getByText(`${presentHolofuelAmount(amount)} TF`)).toBeInTheDocument()
      expect(getByText(`Total Amount: ${presentHolofuelAmount(amount)} TF`)).toBeInTheDocument()
      expect(queryByText(`A ${100 * FEE_PERCENTAGE}% fee is processed with all outgoing transactions`)).not.toBeInTheDocument()

      act(() => {
        fireEvent.change(getByLabelText('For:'), { target: { value: notes } })
      })

      await act(async () => {
        fireEvent.click(getByTestId('submit-button'))
        await wait(0)
      })

      expect(push).toHaveBeenCalledWith(HISTORY_FROM_SENT_TRANSACTION_PATH)
      expect(mockNewMessage).toHaveBeenCalledWith(`Request for ${presentHolofuelAmount(amount)} TF sent to ${presentAgentId(counterparty.agentAddress)}.`, 5000)
    })
  })
})

describe('AmountInput', () => {
  it('allows input of non integer amounts where the fractional part begins with 0', async () => {
    const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={[]}>
      <CreateOfferRequest history={{ }} />
    </MockedProvider>)

    fireEvent.click(getByText('1'))
    fireEvent.click(getByText('.'))
    fireEvent.click(getByText('0'))

    expect(getByTestId('amount').value).toEqual('1.0')

    fireEvent.click(getByText('2'))

    fireEvent.click(getByText('Send'))
    expect(getByText(`${presentHolofuelAmount('1.02')} TF`)).toBeInTheDocument()
  })

  it('ignores all presses of . beyond the first', async () => {
    const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={[]}>
      <CreateOfferRequest history={{ }} />
    </MockedProvider>)

    fireEvent.click(getByText('1'))
    fireEvent.click(getByText('.'))
    fireEvent.click(getByText('0'))
    fireEvent.click(getByText('.'))
    fireEvent.click(getByText('3'))

    expect(getByTestId('amount').value).toEqual('1.03')

    fireEvent.click(getByText('.'))
    fireEvent.click(getByText('4'))

    fireEvent.click(getByText('Send'))
    expect(getByText(`${presentHolofuelAmount('1.034')} TF`)).toBeInTheDocument()
  })

  it('presses of < if string is empty', async () => {
    const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={[]}>
      <CreateOfferRequest history={{ }} />
    </MockedProvider>)

    fireEvent.click(getByText('1'))
    fireEvent.click(getByText('.'))
    fireEvent.click(getByText('0'))
    fireEvent.click(getByText('<'))
    fireEvent.click(getByText('<'))
    fireEvent.click(getByText('<'))
    fireEvent.click(getByText('<'))

    expect(getByTestId('amount').value).toEqual('0')
  })

  it("doesn't allow amount of zero to be submitted", async () => {
    const { getByText, queryByTestId, getByTestId } = await renderAndWait(<MockedProvider mocks={[]}>
      <CreateOfferRequest history={{ }} />
    </MockedProvider>)

    fireEvent.click(getByText('Send'))
    expect(getByTestId('amount')).toBeInTheDocument()

    fireEvent.click(getByText('Request'))
    expect(getByTestId('amount')).toBeInTheDocument()

    fireEvent.click(getByText('1'))

    fireEvent.click(getByText('Send'))
    expect(queryByTestId('amount')).not.toBeInTheDocument()
  })
})
