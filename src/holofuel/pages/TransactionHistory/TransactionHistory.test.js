import React from 'react'
import _ from 'lodash'
import { render, within, act, fireEvent, cleanup } from '@testing-library/react' // fireEvent,
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import wait from 'waait'
import { TYPE } from 'models/Transaction'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'
import TransactionsHistory, { TransactionRow, ConfirmCancellationModal } from './TransactionHistory'
import HoloFuelDnaInterface, { currentDataTimeIso } from 'data-interfaces/HoloFuelDnaInterface'
import { presentAgentId, presentHolofuelAmount, presentDateAndTime } from 'utils'

jest.mock('holofuel/components/layout/PrimaryLayout')

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
          rows.forEach((row, rowIndex) => {
            const transaction = fullRowContent[rowIndex]
            const { getByTestId } = within(row)
            const notesDisplay = transaction.notes === null ? 'none' : transaction.notes
            const dateDisplay = presentDateAndTime(transaction.timestamp).date
            const timeDisplay = presentDateAndTime(transaction.timestamp).time
            const amountToMatch = transaction.direction === 'outgoing' ? `(${presentHolofuelAmount(transaction.amount)})` : presentHolofuelAmount(transaction.amount)

            expect(within(getByTestId('cell-date')).getByText(dateDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-time')).getByText(timeDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-counterparty')).getByText(presentAgentId(transaction.counterparty))).toBeInTheDocument()
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

  describe('Cancel Transaction Modal and Mutation Button', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    const pendingRequest = {
      id: 'QmMockEntryAddress123',
      counterparty: 'AgentMockHash2',
      amount: 8000.88,
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

    const mockTransaction = {
      ...pendingRequest,
      direction: '',
      status: ''
    }

    it('should display correct text for CancellationModal for a Pending Request', async () => {
      const { getByRole } = render(<ConfirmCancellationModal transaction={pendingRequest} />)
      const capitalizedType = _.capitalize(pendingRequest.type)

      const heading = getByRole('heading')
      const { getByText } = within(heading) // , getByTestId
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('for', { exact: false })).toBeInTheDocument()
      expect(getByText('from', { exact: false })).toBeInTheDocument()
    })

    it('should display correct text for CancellationModal for a Pending Offer', async () => {
      const { getByRole } = render(<ConfirmCancellationModal transaction={pendingOffer} />)
      const capitalizedType = _.capitalize(pendingOffer.type)

      const heading = getByRole('heading')
      const { getByText } = within(heading) // , getByTestId
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('of', { exact: false })).toBeInTheDocument()
      expect(getByText('to', { exact: false })).toBeInTheDocument()
    })

    it('should open CancellationModal and trigger HolofuelCancelMutation for Pending Request', async () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      const cancelPendingRequestMock = {
        request: {
          query: HolofuelCancelMutation,
          variables: { transactionId: pendingRequest.id }
        },
        result: {
          data: { holofuelCancel: mockTransaction }
        },
        newData: jest.fn()
      }

      const mocks = [
        cancelPendingRequestMock,
        {
          request: {
            query: HolofuelWaitingTransactionsQuery
          },
          result: {
            data: {
              holofuelWaitingTransactions: []
            }
          }
        }
      ]

      const props = {
        transaction: pendingRequest,
        key: pendingRequest.id,
        showCancellationModal: jest.fn()
      }
      let getByText
      await act(async () => {
        ({ getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <table>
            <tbody>
              <TransactionRow {...props} />
            </tbody>
          </table>
        </MockedProvider>))
        await wait(0)
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

      const cancelPendingOfferMock = {
        request: {
          query: HolofuelCancelMutation,
          variables: { transactionId: pendingOffer.id }
        },
        result: {
          data: { holofuelCancel: mockTransaction }
        },
        newData: jest.fn()
      }

      const mocks = [
        cancelPendingOfferMock,
        {
          request: {
            query: HolofuelWaitingTransactionsQuery
          },
          result: {
            data: {
              holofuelWaitingTransactions: []
            }
          }
        }
      ]

      const props = {
        transaction: pendingOffer,
        key: pendingRequest.id,
        showCancellationModal: jest.fn()
      }
      let getByText
      await act(async () => {
        ({ getByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
          <table>
            <tbody>
              <TransactionRow {...props} />
            </tbody>
          </table>
        </MockedProvider>))
        await wait(0)
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
  })
})
