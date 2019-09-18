import React from 'react'
import { render, fireEvent, act, within } from '@testing-library/react'
import wait from 'waait'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import moment from 'moment'
import apolloClient from 'apolloClient'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Inbox, { TransactionRow } from './Inbox'
import { pendingList } from 'mock-dnas/holofuel'
import { TYPE } from 'models/Transaction'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'

const actionableTransactions = pendingList.requests.concat(pendingList.promises).reverse().map(item => {
  if (item.event[2].Request) {
    return item.event[2].Request
  } else if (item.event[2].Promise) {
    return item.event[2].Promise.tx
  } else {
    throw new Error('unrecognized transaction type', item.toString())
  }
})

jest.mock('data-interfaces/EnvoyInterface')
// mocking Header because it depends on Router
jest.mock('components/holofuel/Header')

const renderWithRouter = (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      {ui}
    </Router>
  ),
  history
})

describe('Inbox Connected', () => {
  it('renders', async () => {
    let getAllByRole

    await act(async () => {
      ({ getAllByRole } = renderWithRouter(<ApolloProvider client={apolloClient}>
        <Inbox />
      </ApolloProvider>))
      await wait(15)
    })

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    listItems.forEach((item, index) => {
      const { getByText } = within(item)
      expect(getByText(actionableTransactions[index].notes)).toBeInTheDocument()
      expect(getByText(`${Number(actionableTransactions[index].amount).toLocaleString()} HF`)).toBeInTheDocument()
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

    expect(getByText(request.timestamp.format('MMM D'))).toBeInTheDocument()
    expect(getByText(request.timestamp.format('kk:mm'))).toBeInTheDocument()
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

    expect(getByText(request.timestamp.format('MMM D'))).toBeInTheDocument()
    expect(getByText(request.timestamp.format('kk:mm'))).toBeInTheDocument()
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

  const mocks = [
    offerMock,
    acceptOfferMock,
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
        showRejectionModal: jest.fn()
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

      expect(offerMock.newData).toHaveBeenCalled()

      fireEvent.click(getByText('Reject'))

      expect(props.showRejectionModal).toHaveBeenCalledWith(request)
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
})
