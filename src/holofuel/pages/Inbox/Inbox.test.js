import React from 'react'
import { fireEvent, act, within } from '@testing-library/react'
import wait from 'waait'
import moment from 'moment'
import { reverse } from 'lodash/fp'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import Inbox, { TransactionRow } from './Inbox'
import { pendingList, transactionList } from 'mock-dnas/holofuel'
import { TYPE } from 'models/Transaction'
import { presentHolofuelAmount, getDateLabel } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'

const actionableTransactions = pendingList.requests.concat(pendingList.promises).reverse().map(item => {
  if (item.event[2].Request) {
    return {
      type: 'request',
      ...item.event[2].Request,
      counterparty: item.event[2].Request.from,
      timestamp: item.event[1]
    }
  } else if (item.event[2].Promise) {
    return {
      type: 'offer',
      ...item.event[2].Promise.tx,
      counterparty: item.event[2].Promise.tx.from,
      timestamp: item.event[1]
    }
  } else {
    throw new Error('unrecognized transaction type', item.toString())
  }
})
const { ledger } = transactionList

jest.mock('data-interfaces/EnvoyInterface')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

describe('Inbox Connected (with Agent Nicknames)', () => {
  it('renders', async () => {
    const { getAllByRole, getByText } = await renderAndWait(<ApolloProvider client={apolloClient}>
      <Inbox />
    </ApolloProvider>, 15)

    expect(getByText(`${presentHolofuelAmount(ledger.balance)} HF`)).toBeInTheDocument()

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    const getByTextParent = getByText

    reverse(listItems).forEach(async (item, index) => {
      const whois = await HoloFuelDnaInterface.user.getCounterparty({ agentId: actionableTransactions[index].counterparty })

      const { getByText } = within(item)
      const transaction = actionableTransactions[index]
      expect(getByText(transaction.notes)).toBeInTheDocument()
      const amountToMatch = transaction.type === 'request' ? `(${presentHolofuelAmount(transaction.amount)}) HF` : `${presentHolofuelAmount(transaction.amount)} HF`
      const story = transaction.type === 'request' ? 'is requesting' : 'is offering'
      expect(getByText(amountToMatch)).toBeInTheDocument()
      expect(getByText(story)).toBeInTheDocument()
      expect(getByText(whois.nickname)).toBeInTheDocument()
      expect(getByTextParent(getDateLabel(transaction.timestamp))).toBeInTheDocument()
    })
  })
})

const actionableTransactionsMock = {
  request: {
    query: HolofuelActionableTransactionsQuery
  },
  result: {
    data: {
      holofuelActionableTransactions: []
    }
  }
}

const nonPendingTransactionsMock = {
  request: {
    query: HolofuelNonPendingTransactionsQuery
  },
  result: {
    data: {
      holofuelNonPendingTransactions: []
    }
  }
}

const ledgerMock = {
  request: {
    query: HolofuelLedgerQuery
  },
  result: {
    data: {
      holofuelLedger: {
        balance: '1110000',
        credit: 0,
        payable: 0,
        receivable: 0,
        fees: 0
      }
    }
  }
}

describe('Ledger Jumbotron', () => {
  it('renders the balance and the empty state', async () => {
    const { getByText, getAllByText } = await renderAndWait(<MockedProvider mocks={[ledgerMock]} addTypename={false}>
      <Inbox />
    </MockedProvider>)

    const presentedBalance = `${presentHolofuelAmount(ledgerMock.result.data.holofuelLedger.balance)} HF`

    expect(getAllByText('Balance')[0]).toBeInTheDocument()
    expect(getByText(presentedBalance)).toBeInTheDocument()
    expect(getAllByText('New Transaction')[0]).toBeInTheDocument()
  })
})

describe('Inbox Null States', () => {
  const mocks = [
    actionableTransactionsMock,
    nonPendingTransactionsMock,
    ledgerMock
  ]

  it('renders the correct null state text whenever no actionable transactions exist', async () => {
    const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Inbox />
    </MockedProvider>)

    expect(getByTestId('recent-transactions')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(getByTestId('recent-transactions'))
      await wait(0)
    })

    expect(getByText('You have no recent activity')).toBeInTheDocument()
  })

  it('renders the correct null state text whenever no recent transactions exist', async () => {
    const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Inbox />
    </MockedProvider>)

    expect(getByTestId('actionable-transactions')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(getByTestId('actionable-transactions'))
      await wait(0)
    })

    expect(getByText('You have no pending offers or requests')).toBeInTheDocument()
  })
})

describe('TransactionRow', () => {
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
    },
    newData: jest.fn()
  }

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

  it('renders an actionable request', async () => {
    const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={request} isActionable />
    </MockedProvider>, 0)

    expect(getByText('last 6')).toBeInTheDocument()
    expect(getByText('is requesting')).toBeInTheDocument()
    expect(getByText(request.notes)).toBeInTheDocument()
  })

  it('renders an actionable offer', async () => {
    const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={offer} isActionable />
    </MockedProvider>, 0)

    expect(getByText('last 6')).toBeInTheDocument()
    expect(getByText('is offering')).toBeInTheDocument()
    expect(getByText(offer.notes)).toBeInTheDocument()
  })

  it('renders an recent request', async () => {
    const { getByText, queryByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={request} />
    </MockedProvider>, 0)

    expect(getByText('last 6')).toBeInTheDocument()
    expect(queryByText('is requesting')).not.toBeInTheDocument()
    expect(getByText(request.notes)).toBeInTheDocument()
  })

  it('renders a recent offer', async () => {
    const { getByText, queryByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={offer} />
    </MockedProvider>, 0)

    expect(getByText('last 6')).toBeInTheDocument()
    expect(queryByText('is offering')).not.toBeInTheDocument()
    expect(getByText(offer.notes)).toBeInTheDocument()
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
    whoamiMock,
    offerMock,
    acceptOfferMock,
    declineMock,
    actionableTransactionsMock
  ]

  describe('Reveal actionable-buttons slider', () => {
    it('shows whenever actionable transactions are shown ', async () => {
      const { getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow transaction={offer} actionsClickWithTxId={jest.fn()} isActionable />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
    })

    it('does not show whenever actionable transactions are shown ', async () => {
      const { queryByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow transaction={offer} actionsClickWithTxId={jest.fn()} />
      </MockedProvider>, 0)

      expect(queryByTestId('forward-icon')).not.toBeInTheDocument()
    })

    it('shows the correct buttons for requests ', async () => {
      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow transaction={request} actionsClickWithTxId={jest.fn()} isActionable />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
      await act(async () => {
        fireEvent.click(getByTestId('forward-icon'))
        await wait(0)
      })

      expect(getByText('Pay')).toBeVisible()
      expect(getByText('Decline')).toBeVisible()
    })

    it('shows the correct buttons for offers ', async () => {
      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow transaction={offer} actionsClickWithTxId={jest.fn()} isActionable />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
      await act(async () => {
        fireEvent.click(getByTestId('forward-icon'))
        await wait(0)
      })

      expect(getByText('Accept')).toBeVisible()
      expect(getByText('Decline')).toBeVisible()
    })
  })

  describe('Pay and reject buttons', () => {
    it('respond properly', async () => {
      const props = {
        transaction: request,
        actionsClickWithTxId: jest.fn(),
        showConfirmationModal: jest.fn(),
        actionsVisible: jest.fn(),
        isActionable: true
      }
      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
      await act(async () => {
        fireEvent.click(getByTestId('forward-icon'))
        await wait(0)
      })

      await act(async () => {
        fireEvent.click(getByText('Pay'))
        await wait(0)
      })

      expect(props.showConfirmationModal).toHaveBeenCalledWith(request, 'pay')

      fireEvent.click(getByText('Decline'))

      expect(props.showConfirmationModal).toHaveBeenCalledWith(request, 'decline')
    })
  })

  describe('Accept button', () => {
    it('responds properly', async () => {
      const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow transaction={offer} isActionable />
      </MockedProvider>, 0)

      await act(async () => {
        fireEvent.click(getByText('Accept'))
        await wait(0)
      })

      expect(acceptOfferMock.newData).toHaveBeenCalled()
    })
  })
})
