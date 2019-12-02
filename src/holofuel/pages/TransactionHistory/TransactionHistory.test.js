import React from 'react'
import Modal from 'react-modal'
import _ from 'lodash'
import { within, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import TransactionsHistory, { TransactionRow, ConfirmCancellationModal } from './TransactionHistory'
import HoloFuelDnaInterface, { currentDataTimeIso } from 'data-interfaces/HoloFuelDnaInterface'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

const agent1 = {
  id: '1',
  nickname: 'Bo'
}

const agent2 = {
  id: '2',
  nickname: 'Rue'
}

const defaultTransaction = {
  amount: '0',
  counterparty: agent1,
  direction: '',
  status: '',
  type: '',
  timestamp: '2019-11-11',
  fees: 0,
  presentBalance: 0,
  notes: ''
}

describe('TransactionsHistory', () => {
  describe('With a balance and no transactions', () => {
    const balance = '39085'
    const mocks = [{
      request: { query: HolofuelLedgerQuery },
      result: {
        data: {
          holofuelLedger: {
            balance,
            credit: 0,
            payable: 0,
            receivable: 0,
            fees: 0
          }
        }
      }
    }]

    it('renders the balance and the empty state', async () => {
      const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionsHistory />
      </MockedProvider>)

      const presentedBalance = `${presentHolofuelAmount(balance)} HF`

      expect(getByText(presentedBalance)).toBeInTheDocument()

      expect(getByText('You have no transactions.')).toBeInTheDocument()
    })
  })

  describe('With some transactions', () => {
    const completedOutgoing = {
      ...defaultTransaction,
      id: 1,
      counterparty: {
        id: agent1.id
      },
      status: STATUS.completed,
      direction: DIRECTION.outgoing,
      amount: '128597',
      notes: 'Nice one',
      presentBalance: '498409843'
    }

    const completedIncoming = {
      ...defaultTransaction,
      id: 2,
      counterparty: {
        id: agent2.id
      },
      status: STATUS.completed,
      direction: DIRECTION.incoming,
      amount: '47863',
      notes: 'Good stuff'
    }

    const pendingOutgoing = {
      ...defaultTransaction,
      id: 3,
      counterparty: {
        id: agent1.id
      },
      status: STATUS.completed,
      direction: DIRECTION.outgoing,
      amount: '39872',
      notes: 'Good stuff'
    }

    const completedTransactions = [
      completedOutgoing, completedIncoming
    ]

    const pendingTransactions = [
      pendingOutgoing
    ]

    const mocks = [
      {
        request: {
          query: HolofuelCompletedTransactionsQuery
        },
        result: {
          data: { holofuelCompletedTransactions: completedTransactions }
        }
      },
      {
        request: {
          query: HolofuelWaitingTransactionsQuery
        },
        result: {
          data: { holofuelWaitingTransactions: pendingTransactions }
        }
      },
      {
        request: {
          query: HolofuelHistoryCounterpartiesQuery
        },
        result: {
          data: { holofuelHistoryCounterparties: [agent1, agent2] }
        }
      }
    ]

    it('renders the transactions, and filters based on tab', async () => {
      const { getByText, queryByText, getAllByTestId, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionsHistory />
      </MockedProvider>)

      expect(getAllByTestId('transaction-row')).toHaveLength(3)

      const { getByText: getFilterButtonByText } = within(getByTestId('filter-buttons'))

      const completedOutgoingAmount = `- ${presentHolofuelAmount(completedOutgoing.amount)}`
      const completedIncomingAmount = `+ ${presentHolofuelAmount(completedIncoming.amount)}`
      const pendingOutgoingAmount = `- ${presentHolofuelAmount(pendingOutgoing.amount)}`

      fireEvent.click(getFilterButtonByText('Withdrawals'))
      expect(getAllByTestId('transaction-row')).toHaveLength(1)
      expect(getByText(completedOutgoingAmount)).toBeInTheDocument()
      expect(queryByText(completedIncomingAmount)).not.toBeInTheDocument()
      expect(queryByText(pendingOutgoingAmount)).not.toBeInTheDocument()

      expect(getByText(completedOutgoing.notes)).toBeInTheDocument()
      expect(getByText(presentHolofuelAmount(completedOutgoing.presentBalance))).toBeInTheDocument()
      expect(getByText(agent1.nickname)).toBeInTheDocument()

      fireEvent.click(getFilterButtonByText('Deposits'))
      expect(getAllByTestId('transaction-row')).toHaveLength(1)
      expect(queryByText(completedOutgoingAmount)).not.toBeInTheDocument()
      expect(getByText(completedIncomingAmount)).toBeInTheDocument()
      expect(queryByText(pendingOutgoingAmount)).not.toBeInTheDocument()

      fireEvent.click(getFilterButtonByText('Pending'))
      expect(getAllByTestId('transaction-row')).toHaveLength(1)
      expect(queryByText(completedOutgoingAmount)).not.toBeInTheDocument()
      expect(queryByText(completedIncomingAmount)).not.toBeInTheDocument()
      expect(getByText(pendingOutgoingAmount)).toBeInTheDocument()

      fireEvent.click(getFilterButtonByText('All'))
      expect(getAllByTestId('transaction-row')).toHaveLength(3)
      expect(getByText(completedOutgoingAmount)).toBeInTheDocument()
      expect(getByText(completedIncomingAmount)).toBeInTheDocument()
      expect(getByText(pendingOutgoingAmount)).toBeInTheDocument()
    })
  })

  //* ******************************* *//
  // Cancellation Functionality Tests :

  describe('Cancel Transaction Modal, Mutation Button, and Completed Tx Query with CounterpartyQuery Call', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    const mockAgent1 = {
      nick: 'Perry',
      pub_sign_key: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r'
    }

    const pendingRequest = {
      id: 'QmMockEntryAddress123',
      counterparty: { id: mockAgent1.pub_sign_key, nickname: mockAgent1.nick },
      amount: 8000.88,
      status: STATUS.pending,
      type: TYPE.request,
      timestamp: currentDataTimeIso(),
      direction: 'incoming'
    }

    const pendingOffer = {
      ...pendingRequest,
      amount: 2000.02,
      type: TYPE.offer,
      direction: 'outgoing'
    }

    const completedRequest = {
      ...pendingRequest,
      status: STATUS.completed,
      fees: presentHolofuelAmount(10.01),
      presentBalance: presentHolofuelAmount(86.68),
      notes: 'Thanks for the Lyft! :)'
    }

    const mockCancelledTransaction = {
      ...pendingRequest,
      direction: '',
      status: ''
    }

    const mockWhoIsAgent1 = {
      id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
      nickname: 'Perry'
    }

    const counterpartyQueryMock = {
      request: {
        query: HolofuelCounterpartyQuery,
        variables: { agentId: pendingRequest.counterparty.id }
      },
      result: {
        data: { holofuelCounterparty: mockWhoIsAgent1 }
      }
    }

    const completedTransactionsQueryMock = {
      request: {
        query: HolofuelCompletedTransactionsQuery
      },
      result: {
        data: {
          holofuelCompletedTransactions: [completedRequest]
        }
      }
    }

    const waitingTransactionsQueryMock = {
      request: {
        query: HolofuelWaitingTransactionsQuery
      },
      result: {
        data: {
          holofuelWaitingTransactions: [
            pendingRequest,
            pendingOffer
          ]
        }
      }
    }

    const cancelPendingRequestMock = {
      request: {
        query: HolofuelCancelMutation, // mutations ALSO live on the 'query' key for mocks.
        variables: { transactionId: pendingRequest.id },
        refetchQueries: [{
          query: completedTransactionsQueryMock
        }, {
          query: waitingTransactionsQueryMock
        }]
      },
      result: {
        data: { holofuelCancel: mockCancelledTransaction }
      },
      newData: jest.fn()
    }

    const cancelPendingOfferMock = {
      request: {
        query: HolofuelCancelMutation, // mutations ALSO live on the 'query' key for mocks.
        variables: { transactionId: pendingOffer.id },
        refetchQueries: [{
          query: completedTransactionsQueryMock
        }, {
          query: waitingTransactionsQueryMock
        }]
      },
      result: {
        data: { holofuelCancel: mockCancelledTransaction }
      },
      newData: jest.fn()
    }

    it('should open CancellationModal and trigger HolofuelCancelMutation for Pending Request', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const mocks = [
        counterpartyQueryMock,
        cancelPendingRequestMock,
        waitingTransactionsQueryMock
      ]

      const props = {
        transaction: waitingTransactionsQueryMock.result.data.holofuelWaitingTransactions[0],
        key: waitingTransactionsQueryMock.result.data.holofuelWaitingTransactions[0].id,
        showCancellationModal: jest.fn(),
        pending: true
      }

      const { container, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>)
      Modal.setAppElement(container)

      fireEvent.click(getByTestId('cancel-button'))
      expect(props.showCancellationModal).toHaveBeenCalledWith(pendingRequest)

      const { getByText: getByTextInModal } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <ConfirmCancellationModal
          transaction={pendingRequest}
          cancelTransaction={cancelPendingRequestMock.newData}
          handleClose={jest.fn()} />
      </MockedProvider>)

      fireEvent.click(getByTextInModal('Yes'))
      expect(cancelPendingRequestMock.newData).toHaveBeenCalled()
    })

    it('should open CancellationModal and trigger HolofuelCancelMutation for Pending Offer', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const mocks = [
        counterpartyQueryMock,
        cancelPendingOfferMock,
        waitingTransactionsQueryMock
      ]

      const props = {
        transaction: waitingTransactionsQueryMock.result.data.holofuelWaitingTransactions[1],
        key: waitingTransactionsQueryMock.result.data.holofuelWaitingTransactions[1].id,
        showCancellationModal: jest.fn(),
        pending: true
      }

      const { getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionRow {...props} />
      </MockedProvider>)

      fireEvent.click(getByTestId('cancel-button'))
      expect(props.showCancellationModal).toHaveBeenCalledWith(pendingOffer)

      const { getByText: getByTextInModal } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <ConfirmCancellationModal
          transaction={pendingRequest}
          cancelTransaction={cancelPendingOfferMock.newData}
          handleClose={jest.fn()} />
      </MockedProvider>)
      fireEvent.click(getByTextInModal('Yes'))
      expect(cancelPendingOfferMock.newData).toHaveBeenCalled()
    })

    it('should display correct text for CancellationModal for a Pending Request', async () => {
      const mocks = [
        counterpartyQueryMock
      ]

      const { getByRole } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <ConfirmCancellationModal
          transaction={pendingRequest} />
      </MockedProvider>)

      const capitalizedType = _.capitalize(pendingRequest.type)

      const heading = getByRole('heading')
      const { getByText } = within(heading)
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('for', { exact: false })).toBeInTheDocument()
      expect(getByText('from', { exact: false })).toBeInTheDocument()
    })

    it('should display correct text for CancellationModal for a Pending Offer', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const mocks = [
        counterpartyQueryMock
      ]

      const { getByRole } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <ConfirmCancellationModal
          transaction={pendingOffer} />
      </MockedProvider>)

      const capitalizedType = _.capitalize(pendingOffer.type)

      const heading = getByRole('heading')
      const { getAllByText, getByText } = within(heading)
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('of', { exact: false })).toBeInTheDocument()
      expect(getAllByText('to', { exact: false })[0]).toBeInTheDocument() // NB: 2 instances of the word two exist, due to the tooltip.
    })
  })

  //* ******************************* *//
  // Utils / Helper Functions Tests :

  describe('Helper function : presentHolofuelAmount() - Presenation of HoloFuel Float', () => {
    it('should accept a float and return a locale string', async () => {
      const { balance } = await HoloFuelDnaInterface.ledger.get({})
      const holofuelAmount = presentAgentId(balance)
      expect(typeof holofuelAmount).toBe('string')
      expect(Number(holofuelAmount) % 1 !== 0).toBeTruthy()
    })
  })

  describe('Helper function : presentAgentId() - PubKey Truncation and Formatting', () => {
    it('should accept a full hashString and return the last 6 chars', async () => {
      const { id } = await HoloFuelDnaInterface.user.get({})
      const displayName = presentAgentId(id)
      expect(displayName.length).toEqual(6)
      expect(displayName).toBe(displayName.substring(displayName.length - 7))
    })
  })
})
