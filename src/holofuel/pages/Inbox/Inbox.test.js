import React from 'react'
import { fireEvent, act, within } from '@testing-library/react'
import wait from 'waait'
import moment from 'moment'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import Inbox, { TransactionRow } from './Inbox'
import { pendingList } from 'mock-dnas/holofuel'
import { TYPE } from 'models/Transaction'
import { presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'

import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'

const actionableTransactions = pendingList.requests.concat(pendingList.promises).reverse().map(item => {
  if (item.event[2].Request) {
    return {
      type: 'request',
      ...item.event[2].Request,
      counterparty: item.event[2].Request.from
    }
  } else if (item.event[2].Promise) {
    return {
      type: 'offer',
      ...item.event[2].Promise.tx,
      counterparty: item.event[2].Promise.tx.from
    }
  } else {
    throw new Error('unrecognized transaction type', item.toString())
  }
})

jest.mock('data-interfaces/EnvoyInterface')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

describe('Inbox Connected (with Agent Nicknames)', () => {
  it('renders', async () => {
    const { getAllByRole } = await renderAndWait(<ApolloProvider client={apolloClient}>
      <Inbox />
    </ApolloProvider>, 15)

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    listItems.forEach(async (item, index) => {
      const whois = await HoloFuelDnaInterface.user.getCounterparty({ agentId: actionableTransactions[index].counterparty })

      const { getByText } = within(item)
      const transaction = actionableTransactions[index]
      expect(getByText(transaction.notes)).toBeInTheDocument()
      const amountToMatch = transaction.type === 'request' ? `(${presentHolofuelAmount(transaction.amount)})` : presentHolofuelAmount(transaction.amount)
      expect(getByText(amountToMatch)).toBeInTheDocument()
      expect(getByText(whois.nickname)).toBeInTheDocument()
    })
  })
})

describe('TransactionRow', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const request = {
    id: '123',
    counterparty: { id: 'last 6' },
    amount: 100,
    type: TYPE.request,
    timestamp: moment().subtract(14, 'days'),
    notes: 'Pay me'
  }

  const offer = {
    ...request,
    type: TYPE.offer
  }

  it('renders a request', async () => {
    const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={request} />
    </MockedProvider>, 0)

    expect(getByText(request.timestamp.format('MMM D YYYY'))).toBeInTheDocument()
    expect(getByText(request.timestamp.utc().format('kk:mm UTC'))).toBeInTheDocument()
    expect(getByText('last 6')).toBeInTheDocument()
    expect(getByText('is requesting')).toBeInTheDocument()
    expect(getByText(request.notes)).toBeInTheDocument()
    expect(getByText('Pay')).toBeInTheDocument()
    expect(getByText('Reject')).toBeInTheDocument()
  })

  it('renders an offer', async () => {
    const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={offer} />
    </MockedProvider>, 0)

    expect(getByText(request.timestamp.format('MMM D YYYY'))).toBeInTheDocument()
    expect(getByText(request.timestamp.utc().format('kk:mm UTC'))).toBeInTheDocument()
    expect(getByText('last 6')).toBeInTheDocument()
    expect(getByText('is offering')).toBeInTheDocument()
    expect(getByText(offer.notes)).toBeInTheDocument()
    expect(getByText('Accept')).toBeInTheDocument()
    expect(getByText('Reject')).toBeInTheDocument()
  })

  const mockTransaction = {
    ...request,
    direction: '',
    status: ''
  }

  const offerMock = {
    request: {
      query: HolofuelOfferMutation,
      variables: { amount: request.amount, counterpartyId: request.counterparty.id, requestId: request.id }
    },
    result: {
      data: { holofuelOffer: mockTransaction }
    },
    newData: jest.fn()
  }

  const acceptOfferMock = {
    request: {
      query: HolofuelAcceptOfferMutation,
      variables: { transactionId: offer.id }
    },
    result: {
      data: { holofuelAcceptOffer: mockTransaction }
    },
    newData: jest.fn()
  }

  const declineMock = {
    request: {
      query: HolofuelDeclineMutation,
      variables: { transactionId: request.id }
    },
    result: {
      data: { holofuelDecline: mockTransaction }
    },
    newData: jest.fn()
  }

  const mocks = [
    offerMock,
    acceptOfferMock,
    declineMock,
    {
      request: {
        query: HolofuelActionableTransactionsQuery
      },
      result: {
        data: {
          holofuelActionableTransactions: []
        }
      }
    }
  ]

  describe('Pay and reject buttons', () => {
    it('respond properly', async () => {
      const props = {
        transaction: request,
        showConfirmationModal: jest.fn()
      }
      const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>, 0)

      await act(async () => {
        fireEvent.click(getByText('Pay'))
        await wait(0)
      })

      expect(props.showConfirmationModal).toHaveBeenCalledWith(request, 'pay')

      fireEvent.click(getByText('Reject'))

      expect(props.showConfirmationModal).toHaveBeenCalledWith(request, 'decline')
    })
  })

  describe('Accept button', () => {
    it('responds properly', async () => {
      const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow transaction={offer} />
      </MockedProvider>, 0)

      await act(async () => {
        fireEvent.click(getByText('Accept'))
        await wait(0)
      })

      expect(acceptOfferMock.newData).toHaveBeenCalled()
    })
  })
})
