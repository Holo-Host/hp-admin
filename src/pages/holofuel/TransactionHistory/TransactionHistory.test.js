import React from 'react'
import moment from 'moment'
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
import TransactionsHistory, { LedgerTransactionsTable, ConfirmCancellationModal, capitalizeFirstLetter, makeDisplayName, formatDateTime, MOCK_ACCT_NUM } from './TransactionHistory'
import HoloFuelDnaInterface, { currentDataTimeIso } from 'data-interfaces/HoloFuelDnaInterface'

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

describe('HoloFuel Ledger Transactions', () => {
  describe('Page Rendering', () => {
    it('should render the header and title', async () => {
      let getByText
      await act(async () => {
        ({ getByText } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <TransactionsHistory history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      expect(getByText(MOCK_ACCT_NUM)).toBeVisible()
      expect(getByText('HoloFuel')).toBeVisible()
      expect(getByText('History')).toBeVisible()
    })

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
            const { getByTestId } = within(row)
            const notesDisplay = fullRowContent[rowIndex].notes === null ? 'none' : fullRowContent[rowIndex].notes
            const dateDisplay = formatDateTime(fullRowContent[rowIndex].timestamp).date
            const timeDisplay = formatDateTime(fullRowContent[rowIndex].timestamp).time

            expect(within(getByTestId('cell-date')).getByText(dateDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-time')).getByText(timeDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-counterparty')).getByText(makeDisplayName(fullRowContent[rowIndex].counterparty.toUpperCase()))).toBeInTheDocument()
            expect(within(getByTestId('cell-notes')).getByText(notesDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-amount')).getByText(fullRowContent[rowIndex].amount)).toBeInTheDocument()
            expect(within(getByTestId('cell-fees')).getByText(fullRowContent[rowIndex].fees)).toBeInTheDocument()
            // if (fullRowContent[rowIndex].presentBalance) expect(within(getByTestId('cell-present-balance')).getByText(fullRowContent[rowIndex].presentBalance)).toBeInTheDocument()
          })
        } else {
          throw new Error('There was an unknown table-group found : group label, index in tableGroup Array', tableGroup, index)
        }
      })
    })
  })

  //* ******************************* *//
  // Cancellation Funcationality Tests :

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
      const capitalizedType = capitalizeFirstLetter(pendingRequest.type)

      const heading = getByRole('heading')
      const { getByText } = within(heading) // , getByTestId
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('for', { exact: false })).toBeInTheDocument()
      expect(getByText('from', { exact: false })).toBeInTheDocument()

      // nested in a span :
      // expect(within(getByTestId('modal-amount')).getByText(pendingRequest.amount)).toBeInTheDocument()
      // expect(within(getByTestId('modal-counterparty')).getByText(makeDisplayName(pendingRequest.counterparty))).toBeInTheDocument()
    })

    it('should display correct text for CancellationModal for a Pending Offer', async () => {
      const { getByRole } = render(<ConfirmCancellationModal transaction={pendingOffer} />)
      const capitalizedType = capitalizeFirstLetter(pendingOffer.type)

      const heading = getByRole('heading')
      const { getByText } = within(heading) // , getByTestId
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('of', { exact: false })).toBeInTheDocument()
      expect(getByText('to', { exact: false })).toBeInTheDocument()

      // nested in a span :
      // expect(within(getByTestId('modal-amount')).getByText(pendingOffer.amount)).toBeInTheDocument()
      // expect(within(getByTestId('modal-counterparty')).getByText(makeDisplayName(pendingOffer.counterparty))).toBeInTheDocument()
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
          <LedgerTransactionsTable {...props} />
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
          <LedgerTransactionsTable {...props} />
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

  //* ******************************* *//
  // Helper Functions Tests :

  describe('Helper function : makeDisplayName() - PubKey Truncation and Formatting', () => {
    it('should accept a full hashString and return the last 7 chars', async () => {
      const { id } = await HoloFuelDnaInterface.user.get({})
      const displayName = makeDisplayName(id)
      expect(displayName.length).toEqual(7)
      expect(displayName).toBe(displayName.substring(displayName.length - 7))
    })
  })

  describe('Helper function : formatDateTime() - Semantic timedate formatting.', () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const currentHour = new Date().getHours()
    const currentMinute = new Date().getMinutes()

    const tenYearsAgo = new Date().setFullYear(currentYear - 10)
    const monthAgo = new Date().setMonth(currentMonth - 1)
    const hourAgo = new Date().setHours(currentHour - 1)
    const minAgo = new Date().setMinutes(currentMinute - 1)

    const MOCK_TIMEDATE = {
      semanticSameMinute: new Date().toISOString(),
      semanticSameHour: new Date(minAgo).toISOString(),
      semanticSameDay: new Date(hourAgo).toISOString(),
      semanticSameYear: new Date(monthAgo).toISOString(),
      semanticOverAYear: new Date(tenYearsAgo).toISOString()
    }

    it('should format timedate older than a year ago', () => {
      const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticOverAYear)
      expect(date).toBe(moment(MOCK_TIMEDATE.semanticOverAYear).format('MMMM D YYYY'))
      expect(time).toBe(moment(MOCK_TIMEDATE.semanticOverAYear).format('h:mm'))
    })

    it('should format timedate within past year', () => {
      const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticSameYear)
      expect(date).toBe(moment(MOCK_TIMEDATE.semanticSameYear).format('MMMM D'))
      expect(time).toBe(moment(MOCK_TIMEDATE.semanticSameYear).format('h:mm'))
    })

    it('should format timedate within same day', () => {
      const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticSameDay)
      expect(date).toBe('Today')
      expect(time).toBe('an hour ago')
    })

    it('should format timedate within same hour', () => {
      const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticSameHour)
      expect(date).toBe('Today')
      expect(time).toBe('a minute ago')
    })

    it('should format timedate within same minute', () => {
      const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticSameMinute)
      expect(date).toBe('Today')
      expect(time).toBe('a few seconds ago')
    })
  })
})
