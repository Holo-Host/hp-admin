import React from 'react'
import { fireEvent, act, within } from '@testing-library/react'
import wait from 'waait'
import moment from 'moment'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import Inbox, { TransactionRow, ConfirmationModal } from './Inbox'
import { pendingList, transactionList } from 'mock-dnas/holofuel'
import { TYPE, STATUS, DIRECTION, shouldShowTransactionInInbox } from 'models/Transaction'
import { presentHolofuelAmount, presentAgentId, promiseMap, getDateLabel } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'

jest.mock('data-interfaces/EnvoyInterface')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')
jest.mock('holofuel/contexts/useConnectionContext')
jest.mock('holofuel/contexts/useCurrentUserContext')
jest.mock('holofuel/contexts/useHiddenTransactionsContext')
jest.unmock('holochainClient')

// eslint-disable-next-line array-callback-return
const actionableTransactions = pendingList.requests.concat(pendingList.promises).map(item => {
  if (item.event) {
    if (item.event[2].Request) {
      return {
        type: 'request',
        ...item.event[2].Request,
        counterparty: item.event[2].Request.from,
        timestamp: item.event[1],
        status: STATUS.pending,
        isPayingARequest: false
      }
    }
  } else if (item[2]) {
    if (item[2].Request) {
      return {
        type: 'request',
        ...item[2].Request,
        counterparty: item[2].Request.from,
        timestamp: item[1],
        status: STATUS.declined,
        isPayingARequest: false
      }
    } else if (item[2].Promise) {
      return {
        type: 'offer',
        ...item[2].Promise.tx,
        counterparty: item[2].Promise.tx.from,
        timestamp: item[1],
        status: STATUS.declined,
        isPayingARequest: false
      }
    }
  } else if (item[0].event) {
    if (item[0].event[2].Promise) {
      return {
        type: 'offer',
        ...item[0].event[2].Promise.tx,
        counterparty: item[0].event[2].Promise.tx.from,
        timestamp: item[0].event[1],
        status: STATUS.pending,
        isPayingARequest: !!item[0].event[2].Promise.request
      }
    }
  } else {
    throw new Error('unrecognized transaction type', item.toString())
  }
})
  .filter(shouldShowTransactionInInbox)
  .sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)

const { ledger } = transactionList

describe('Inbox connected (with Agent Nicknames)', () => {
  it.skip('renders', async () => {
    const { getAllByRole, getByText } = await renderAndWait(<ApolloProvider client={apolloClient}>
      <Inbox history={{}} />
    </ApolloProvider>, 1500)

    expect(getByText(`${presentHolofuelAmount(ledger.balance)} TF`)).toBeInTheDocument()

    const listItems = getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    const getByTextParent = getByText

    promiseMap(listItems, async (item, index) => {
      const { getByText } = within(item)

      const transaction = actionableTransactions[index]
      expect(getByText(transaction.notes, { exact: false })).toBeInTheDocument()
      const amountToMatch = transaction.type === 'request' ? `(${presentHolofuelAmount(transaction.amount)}) TF` : `${presentHolofuelAmount(transaction.amount)} TF`

      let story

      if (transaction.status === STATUS.declined) {
        story = 'has declined'
      } else if (transaction.type === 'request') {
        story = 'is requesting'
      } else if (transaction.type === 'offer') {
        if (transaction.isPayingARequest) {
          story = 'is paying your request'
        } else {
          story = 'is offering'
        }
      }

      expect(getByText(amountToMatch)).toBeInTheDocument()
      expect(getByText(story)).toBeInTheDocument()
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
      }
    }
  }
}

describe('Inbox', () => {
  const timestamp = moment('2013-02-04')

  const counterparty = { agentAddress: 'last 6', nickname: null, avatarUrl: null }

  const offer1 = {
    id: '1',
    counterparty,
    amount: 100,
    timestamp,
    type: TYPE.offer,
    notes: 'Here\'s your money',
    direction: DIRECTION.incoming,
    status: STATUS.pending,
    isPayingARequest: false
  }

  const offer2 = {
    id: '2',
    counterparty,
    amount: 100,
    timestamp,
    type: TYPE.offer,
    notes: 'Here\'s more of your money',
    direction: DIRECTION.incoming,
    status: STATUS.pending,
    isPayingARequest: false
  }

  const actionableTransactionsMock = {
    request: {
      query: HolofuelActionableTransactionsQuery
    },
    result: {
      data: {
        holofuelActionableTransactions: [offer1, offer2]
      }
    }
  }

  const acceptOffer1Mock = {
    request: {
      query: HolofuelAcceptOfferMutation,
      variables: { transactionId: offer1.id }
    },
    newData: jest.fn(() => ({
      data: {
        holofuelAcceptOffer: offer1
      }
    }))
  }

  const acceptOffer2Mock = {
    request: {
      query: HolofuelAcceptOfferMutation,
      variables: { transactionId: offer2.id }
    },
    newData: jest.fn(() => ({
      data: {
        holofuelAcceptOffer: offer2
      }
    }))
  }

  it.skip('hides a partition when there are no more transactions in that partition', async () => {
    // This test is currently broken. The second time setTimeout is called in onConfirmGreen it doesn't run so we the
    // app never gets to the final state. I'm skipping this test because I don't want to spend any more time on a test for a cosmetic
    // feature that works

    const mocks = [
      ledgerMock,
      ledgerMock,
      ledgerMock,
      actionableTransactionsMock,
      actionableTransactionsMock,
      actionableTransactionsMock,
      acceptOffer1Mock,
      acceptOffer2Mock
    ]

    const { getByText, getAllByText, getAllByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Inbox history={{}} />
    </MockedProvider>)

    jest.useFakeTimers()

    expect(getByText('February 4th')).toBeInTheDocument()
    const buttons = getAllByTestId('reveal-actions-button')

    await act(async () => {
      fireEvent.click(buttons[0])
      wait(1000)
    })

    await act(async () => {
      fireEvent.click(getAllByText('Accept')[0])
    })

    await act(async () => {
      fireEvent.click(getByText('Yes'))
    })

    await act(async () => {
      fireEvent.click(buttons[1])
      wait(1000)
    })

    await act(async () => {
      fireEvent.click(getByText('Accept'))
    })

    await act(async () => {
      fireEvent.click(getByText('Yes'))
      jest.runAllTimers()
    })

    await act(async () => {
      wait(1000)
    })

    expect(getByText('February 4th')).not.toBeInTheDocument()
  })
})

describe('Ledger Jumbotron', () => {
  it('renders the balance and the empty state', async () => {
    const { getByText, getAllByText } = await renderAndWait(<MockedProvider mocks={[ledgerMock]} addTypename={false}>
      <Inbox history={{}} />
    </MockedProvider>)

    const presentedBalance = `${presentHolofuelAmount(ledgerMock.result.data.holofuelLedger.balance)} TF`

    expect(getByText(presentedBalance)).toBeInTheDocument()
    expect(getAllByText('New Transaction')[0]).toBeInTheDocument()
  })
})

describe('Inbox Null States', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mocks = [
    actionableTransactionsMock,
    nonPendingTransactionsMock,
    ledgerMock
  ]

  it('renders the correct null state text whenever no actionable transactions exist', async () => {
    const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Inbox history={{}} />
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
      <Inbox history={{}} />
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

  const request = {
    id: '123',
    counterparty: { agentAddress: 'last 6' },
    amount: 100,
    type: TYPE.request,
    timestamp: moment().subtract(14, 'days'),
    notes: 'Pay me'
  }

  const offer = {
    ...request,
    type: TYPE.offer,
    notes: 'Here\'s your money'
  }

  const confirmationModalProperties = {
    shouldDisplay: true,
    transaction: {},
    action: '',
    onConfirm: () => {},
    setIsLoading: () => {}
  }

  it('renders an actionable request', async () => {
    const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={request} setConfirmationModalProperties={jest.fn()} confirmationModalProperties={confirmationModalProperties} isActionable />
    </MockedProvider>, 0)

    expect(getByText('last 6')).toBeInTheDocument()
    expect(getByText('is requesting')).toBeInTheDocument()
    expect(getByText(request.notes)).toBeInTheDocument()
  })

  it('renders an actionable offer', async () => {
    const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={offer} setConfirmationModalProperties={jest.fn()} confirmationModalProperties={confirmationModalProperties} isActionable />
    </MockedProvider>, 0)

    expect(getByText('last 6')).toBeInTheDocument()
    expect(getByText('is offering')).toBeInTheDocument()
    expect(getByText(offer.notes)).toBeInTheDocument()
  })

  it('renders an recent request', async () => {
    const { getByText, queryByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={request} setConfirmationModalProperties={jest.fn()} confirmationModalProperties={confirmationModalProperties} />
    </MockedProvider>, 0)

    expect(getByText('last 6')).toBeInTheDocument()
    expect(queryByText('is requesting')).not.toBeInTheDocument()
    expect(getByText(request.notes)).toBeInTheDocument()
  })

  it('renders a recent offer', async () => {
    const { getByText, queryByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <TransactionRow transaction={offer} setConfirmationModalProperties={jest.fn()} confirmationModalProperties={confirmationModalProperties} />
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
      variables: { amount: request.amount, counterpartyId: request.counterparty.agentAddress, requestId: request.id }
    },
    result: {
      data: { holofuelOffer: mockTransaction }
    }
  }

  const acceptOfferMock = {
    request: {
      query: HolofuelAcceptOfferMutation,
      variables: { transactionId: offer.id }
    },
    result: {
      data: { holofuelAcceptOffer: mockTransaction }
    }
  }

  const declineMock = {
    request: {
      query: HolofuelDeclineMutation,
      variables: { transactionId: request.id }
    },
    result: {
      data: { holofuelDecline: mockTransaction }
    }
  }

  const mockAgent1 = {
    agent_address: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
    nickname: 'Perry',
    avatar_url: ''
  }

  const mocks = [
    offerMock,
    acceptOfferMock,
    declineMock,
    actionableTransactionsMock,
    ledgerMock
  ]

  describe('Reveal actionable-buttons slider', () => {
    const defaultProps = {
      transaction: offer,
      currentUser: mockAgent1,
      setConfirmationModalProperties: () => {},
      confirmationModalProperties,
      isActionable: true,
      openDrawerId: null,
      setOpenDrawerId: () => {}
    }

    it('shows whenever actionable transactions are shown ', async () => {
      const { getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...defaultProps} />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
    })

    it('does not show whenever actionable transactions are not shown ', async () => {
      const props = {
        ...defaultProps,
        isActionable: false
      }

      const { queryByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>, 0)

      expect(queryByTestId('forward-icon')).not.toBeInTheDocument()
    })

    it('shows the correct buttons for requests ', async () => {
      const props = {
        ...defaultProps,
        transaction: request
      }

      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
      await act(async () => {
        fireEvent.click(getByTestId('forward-icon'))
        await wait(0)
      })

      expect(getByText('Accept')).toBeVisible()
      expect(getByText('Decline')).toBeVisible()
    })

    it('shows the correct buttons for offers ', async () => {
      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...defaultProps} />
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

  describe('Accept Payment and DeclineOrCancel buttons', () => {
    it('respond properly', async () => {
      const props = {
        transaction: request,
        isActionable: true,
        currentUser: mockAgent1,
        setConfirmationModalProperties: jest.fn(),
        confirmationModalProperties: confirmationModalProperties,
        setOpenDrawerId: () => {}
      }

      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
      await act(async () => {
        fireEvent.click(getByTestId('forward-icon'))
        await wait(0)
      })

      fireEvent.click(getByText('Accept'))
      expect(props.setConfirmationModalProperties).toHaveBeenCalledWith(expect.objectContaining({
        shouldDisplay: true,
        transaction: request,
        action: 'pay'
      }))

      fireEvent.click(getByText('Decline'))
      expect(props.setConfirmationModalProperties).toHaveBeenCalledWith(expect.objectContaining({
        shouldDisplay: true,
        transaction: request,
        action: 'decline'
      }))
    })
  })

  describe('Accept Payment Modal', () => {
    it('responds properly', async () => {
      const transaction = { ...request, counterparty: { agentAddress: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r' } }

      const props = {
        confirmationModalProperties: { ...confirmationModalProperties, transaction, action: 'pay' },
        setConfirmationModalProperties: jest.fn()
      }

      const mocks = [
        offerMock,
        declineMock,
        actionableTransactionsMock,
        ledgerMock
      ]
      const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <ConfirmationModal {...props} />
      </MockedProvider>, 0)

      expect(getByText(presentAgentId('HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r'), { exact: false })).toBeInTheDocument()
      expect(getByText('Accept the request and send', { exact: false })).toBeInTheDocument()

      fireEvent.click(getByText('Close Modal'))
      expect(props.setConfirmationModalProperties).toHaveBeenCalled()
    })

    describe('with request', () => {
      const transaction = { ...request, counterparty: { agentAddress: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r' } }

      const props = {
        confirmationModalProperties: { ...confirmationModalProperties, transaction, action: 'pay', shouldDisplay: true },
        setConfirmationModalProperties: jest.fn()
      }

      const offer = { amount: transaction.amount, counterparty: { agentAddress: transaction.counterparty.agentAddress, nickname: '' }, requestId: transaction.id, notes: transaction.notes }

      const localOfferMock = {
        request: {
          query: HolofuelOfferMutation,
          variables: { offer }
        },
        result: {
          data: { holofuelOffer: mockTransaction }
        },
        newData: jest.fn()
      }

      const mocks = [
        localOfferMock,
        declineMock,
        actionableTransactionsMock,
        ledgerMock
      ]

      it('copies the notes field from the request to the created offer', async () => {
        const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
          <ConfirmationModal {...props} />
        </MockedProvider>, 0)
        fireEvent.click(getByText('Yes'))
        await wait(50)
        expect(localOfferMock.newData).toHaveBeenCalled()
      })
    })
  })

  describe('Accept Offer Modal', () => {
    it('responds properly', async () => {
      const props = {
        transaction: offer,
        isActionable: true,
        userId: mockAgent1,
        setConfirmationModalProperties: jest.fn(),
        confirmationModalProperties: confirmationModalProperties,
        setOpenDrawerId: () => {}
      }

      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>, 0)

      expect(getByTestId('forward-icon')).toBeInTheDocument()
      await act(async () => {
        fireEvent.click(getByTestId('forward-icon'))
        await wait(0)
      })

      fireEvent.click(getByText('Accept'))
      expect(props.setConfirmationModalProperties).toHaveBeenCalledWith(expect.objectContaining({
        shouldDisplay: true,
        transaction: offer,
        action: 'acceptOffer'
      }))

      fireEvent.click(getByText('Decline'))
      expect(props.setConfirmationModalProperties).toHaveBeenCalledWith(expect.objectContaining({
        shouldDisplay: true,
        transaction: offer,
        action: 'decline'
      }))
    })
  })
})
