import React from 'react'
import Modal from 'react-modal'
import _ from 'lodash'
import { render, within, act, fireEvent, cleanup } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import wait from 'waait'
import { TYPE, STATUS } from 'models/Transaction'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import TransactionsHistory, { TransactionRow, ConfirmCancellationModal, RenderNickname } from './TransactionHistory'
import HoloFuelDnaInterface, { currentDataTimeIso } from 'data-interfaces/HoloFuelDnaInterface'
import { presentAgentId, presentHolofuelAmount, presentDateAndTime } from 'utils'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

function renderWithRouter (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    history
  }
}

describe('TransactionsHistory', () => {
  describe('Page Rendering', () => {
    it('should render and populate completed transaction table', async () => {
      beforeEach(cleanup)

      let getAllByRole
      await act(async () => {
        ({ getAllByRole } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <TransactionsHistory history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      const hfInterfaceCompletedTxList = await HoloFuelDnaInterface.transactions.allCompleted()
      const hfInterfaceWaitingTxList = await HoloFuelDnaInterface.transactions.allWaiting()

      const listTableGroups = getAllByRole('rowgroup')
      expect(listTableGroups).toHaveLength(2)

      const NUM_TABLE_HEADERS = 5
      const listTableHeaders = getAllByRole('columnheader')
      // number of cols check
      expect(listTableHeaders).toHaveLength(NUM_TABLE_HEADERS)

      const listTableCells = getAllByRole('cell')
      // number of cells check
      expect(listTableCells).toHaveLength((hfInterfaceCompletedTxList.length + hfInterfaceWaitingTxList.length) * NUM_TABLE_HEADERS)

      listTableGroups.forEach((tableGroup, index) => {
        const { getByText, getAllByTestId } = within(tableGroup)
        if (index === 0) {
          // thead :
          // header label content check
          expect(getByText('Amount')).toBeVisible()
          expect(getByText('Fees')).toBeVisible()
        } else if (index === 1) {
          // tbody :
          const rows = getAllByTestId('transactions-table-row')
          // number of rows check => tbody should have the same number of rows as the # of completed transactions
          expect(rows).toHaveLength(hfInterfaceCompletedTxList.length + hfInterfaceWaitingTxList.length)
          const fullRowContent = hfInterfaceWaitingTxList.concat(hfInterfaceCompletedTxList)
          // cell content check

          rows.forEach(async (row, rowIndex) => {
            const transaction = fullRowContent[rowIndex]
            const { getByTestId } = within(row)
            const whois = await HoloFuelDnaInterface.user.getCounterparty({ agentId: fullRowContent[rowIndex].counterparty })
            const notesDisplay = transaction.notes === null ? 'none' : transaction.notes
            const dateDisplay = presentDateAndTime(transaction.timestamp).date
            const timeDisplay = presentDateAndTime(transaction.timestamp).time
            const amountToMatch = transaction.direction === 'outgoing' ? `(${presentHolofuelAmount(transaction.amount)})` : presentHolofuelAmount(transaction.amount)

            expect(within(getByTestId('cell-date')).getByText(dateDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-time')).getByText(timeDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-counterparty')).getByText(whois.nickname) || within(getByTestId('cell-counterparty')).getByText(presentAgentId(transaction.counterparty))).toBeInTheDocument()
            expect(within(getByTestId('cell-notes')).getByText(notesDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-amount')).getByText(amountToMatch)).toBeInTheDocument()
            expect(within(getByTestId('cell-fees')).getByText(transaction.fees)).toBeInTheDocument()
            if (transaction.presentBalance) expect(within(getByTestId('cell-present-balance')).getByText(transaction.presentBalance)).toBeInTheDocument()
            else expect(within(getByTestId('cell-pending-item')).getByRole('button')).toBeInTheDocument()
          })
        } else {
          throw new Error('There was an unknown table-group found : group label, index in tableGroup Array', tableGroup, index)
        }
      })
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
      counterparty: mockAgent1.pub_sign_key,
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

    const counterpartyQueryMockError = {
      request: {
        query: HolofuelCounterpartyQuery,
        variables: { agentId: pendingRequest.counterparty.id }
      },
      error: new Error('ERROR! : <Error Message>')
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

    it('should fetch and display completed Transaction', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const rowContent = completedTransactionsQueryMock.result.data.holofuelCompletedTransactions[0]
      const whois = await HoloFuelDnaInterface.user.getCounterparty({ agentId: rowContent.counterparty })
      const notesDisplay = rowContent === null ? 'none' : rowContent.notes

      const mocks = [
        counterpartyQueryMock,
        completedTransactionsQueryMock
      ]

      let container, getAllByRole
      await act(async () => {
        ({ container, getAllByRole } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <TransactionsHistory history={{}} />
        </MockedProvider>))
        await wait(0)
        Modal.setAppElement(container)
      })

      const row = getAllByRole('row')
      const { getByTestId } = within(row[1])
      expect(rowContent.status).toBe('completed')
      expect(within(getByTestId('cell-counterparty')).getByText(presentAgentId(rowContent.counterparty)) || within(getByTestId('cell-counterparty')).getByText(whois.nickname)).toBeInTheDocument()
      expect(within(getByTestId('cell-notes')).getByText(notesDisplay)).toBeInTheDocument()
      expect(within(getByTestId('cell-fees')).getByText(rowContent.fees)).toBeInTheDocument()
      expect(within(getByTestId('cell-present-balance')).getByText(rowContent.presentBalance)).toBeInTheDocument()
      expect(within(getByTestId('cell-amount')).getByText(presentHolofuelAmount(rowContent.amount))).toBeInTheDocument()
    })

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
        showCancellationModal: jest.fn()
      }
      let container, getByText
      await act(async () => {
        ({ container, getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <table>
            <tbody>
              <TransactionRow {...props} />
            </tbody>
          </table>
        </MockedProvider>))
        await wait(0)
        Modal.setAppElement(container)
      })

      fireEvent.click(getByText('Cancel'))
      expect(props.showCancellationModal).toHaveBeenCalledWith(pendingRequest)

      await act(async () => {
        ({ getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <ConfirmCancellationModal
            transaction={pendingRequest}
            cancelTransaction={cancelPendingRequestMock.newData}
            handleClose={jest.fn()} />
        </MockedProvider>))
        await wait(0)
      })
      fireEvent.click(getByText('Yes'))
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
        showCancellationModal: jest.fn()
      }
      let container, getByText
      await act(async () => {
        ({ container, getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <table>
            <tbody>
              <TransactionRow {...props} />
            </tbody>
          </table>
        </MockedProvider>))
        await wait(0)
        Modal.setAppElement(container)
      })
      fireEvent.click(getByText('Cancel'))
      expect(props.showCancellationModal).toHaveBeenCalledWith(pendingOffer)

      await act(async () => {
        ({ getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <ConfirmCancellationModal
            transaction={pendingRequest}
            cancelTransaction={cancelPendingOfferMock.newData}
            handleClose={jest.fn()} />
        </MockedProvider>))
        await wait(0)
      })
      fireEvent.click(getByText('Yes'))
      expect(cancelPendingOfferMock.newData).toHaveBeenCalled()
    })

    it('should display correct text for CancellationModal for a Pending Request', async () => {
      const mocks = [
        counterpartyQueryMock
      ]

      let container, getByRole
      await act(async () => {
        ({ container, getByRole } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <ConfirmCancellationModal
            transaction={pendingRequest} />
        </MockedProvider>))
        await wait(0)
        Modal.setAppElement(container)
      })

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

      let getByRole
      await act(async () => {
        let container
        ({ container, getByRole } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <ConfirmCancellationModal
            transaction={pendingOffer} />
        </MockedProvider>))
        await wait(0)
        Modal.setAppElement(container)
      })

      const capitalizedType = _.capitalize(pendingOffer.type)

      const heading = getByRole('heading')
      const { container, getAllByText, getByText } = within(heading)
      await Modal.setAppElement(container)
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('of', { exact: false })).toBeInTheDocument()
      expect(getAllByText('to', { exact: false })[0]).toBeInTheDocument() // NB: 2 instances of the word two exist, due to the tooltip.
    })

    it('should return last 6 of AgentId in RenderNickname Component when HolofuelCounterpartyQuery request is *unsuccessful*', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const rowContent = completedTransactionsQueryMock.result.data.holofuelCompletedTransactions[0]

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
