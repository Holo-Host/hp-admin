import React from 'react'
import Modal from 'react-modal'
import { render, fireEvent, act, within } from '@testing-library/react'
import wait from 'waait'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import moment from 'moment'
import apolloClient from 'apolloClient'
import Inbox, { TransactionRow, RenderNickname } from './Inbox'
import { pendingList } from 'mock-dnas/holofuel'
import { TYPE } from 'models/Transaction'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'

import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
// import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'

const actionableTransactions = pendingList.requests.concat(pendingList.promises).reverse().map(item => {
  if (item.event[2].Request) {
    return {
      type: 'request',
      ...item.event[2].Request
    }
  } else if (item.event[2].Promise) {
    return {
      type: 'offer',
      ...item.event[2].Promise.tx
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
    let getAllByRole

    await act(async () => {
      ({ getAllByRole } = render(<ApolloProvider client={apolloClient}>
        <Inbox />
      </ApolloProvider>))
      await wait(15)
    })

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    listItems.forEach(async (item, index) => {
      // const whois = await HoloFuelDnaInterface.user.getCounterparty({ agentId: actionableTransactions[index].counterparty })
      const { getByText } = within(item)
      const transaction = actionableTransactions[index]
      expect(getByText(transaction.notes)).toBeInTheDocument()
      const amountToMatch = transaction.type === 'request' ? `(${presentHolofuelAmount(transaction.amount)})` : presentHolofuelAmount(transaction.amount)
      expect(getByText(amountToMatch)).toBeInTheDocument()
      // expect(getByText(whois.nickname)).toBeInTheDocument()
    })
  })
})

describe('TransactionRow', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const request = {
    id: '123',
    counterparty: 'only care about the last 6',
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
    let getByText
    await act(async () => {
      ({ getByText } = render(<MockedProvider addTypename={false}>
        <TransactionRow transaction={request} />
      </MockedProvider>))
      await wait(0)
    })

    expect(getByText(request.timestamp.format('MMM D YYYY'))).toBeInTheDocument()
    expect(getByText(request.timestamp.utc().format('kk:mm UTC'))).toBeInTheDocument()
    expect(getByText('last 6')).toBeInTheDocument()
    expect(getByText('is requesting')).toBeInTheDocument()
    expect(getByText(request.notes)).toBeInTheDocument()
    expect(getByText('Pay')).toBeInTheDocument()
    expect(getByText('Reject')).toBeInTheDocument()
  })

  it('renders an offer', async () => {
    let getByText
    await act(async () => {
      ({ getByText } = render(<MockedProvider addTypename={false}>
        <TransactionRow transaction={offer} />
      </MockedProvider>))
      await wait(0)
    })

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
      variables: { amount: request.amount, counterparty: request.counterparty, requestId: request.id }
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
      let getByText
      await act(async () => {
        ({ getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <TransactionRow {...props} />
        </MockedProvider>))
        await wait(0)
      })

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
      let getByText
      await act(async () => {
        ({ getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <TransactionRow transaction={offer} />
        </MockedProvider>))
        await wait(0)
      })

      await act(async () => {
        fireEvent.click(getByText('Accept'))
        await wait(0)
      })

      expect(acceptOfferMock.newData).toHaveBeenCalled()
    })
  })

  const mockWhoIsAgent1 = {
    id: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
    nickname: 'Sam'
  }

  const newRequest = {
    ...request,
    counterparty: mockWhoIsAgent1.id
  }

  const counterpartyQueryMockError = {
    request: {
      query: HolofuelCounterpartyQuery,
      variables: { agentId: newRequest.counterparty }
    },
    error: new Error('ERROR! : <Error Message>')
  }

  const actionableTransactionsQueryMock = {
    request: {
      query: HolofuelActionableTransactionsQuery
    },
    result: {
      data: {
        holofuelActionableTransactions: [newRequest]
      }
    }
  }

  it('should default to rendering last 6 of AgentId', async () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    const rowContent = actionableTransactionsQueryMock.result.data.holofuelActionableTransactions[0]

    const mocks = [
      counterpartyQueryMockError
    ]

    let container, getByText
    await act(async () => {
      ({ container, getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
        <RenderNickname agentId={rowContent.counterparty} className='mock-style' />
      </MockedProvider>))
      await wait(0)
      Modal.setAppElement(container)
    })

    const nameDiv = getByText(presentAgentId(rowContent.counterparty))
    expect(nameDiv).toBeInTheDocument()
  })
})
