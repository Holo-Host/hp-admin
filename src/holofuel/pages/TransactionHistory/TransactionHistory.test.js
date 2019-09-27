import React from 'react'
import Modal from 'react-modal'
import moment from 'moment'
import _ from 'lodash'
import { useQuery } from '@apollo/react-hooks'
import { renderHook } from '@testing-library/react-hooks'
import { render, within, act, fireEvent, cleanup } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import { MockedProvider } from '@apollo/react-testing'
import apolloClient from 'apolloClient'
import wait from 'waait'
import { TYPE } from 'models/Transaction'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import HolofuelCancelMutation from 'graphql/HolofuelCancelMutation.gql'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import TransactionsHistory, { TransactionRow, ConfirmCancellationModal, RenderNickname, formatDateTime } from './TransactionHistory'
import HoloFuelDnaInterface, { currentDataTimeIso } from 'data-interfaces/HoloFuelDnaInterface'

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
          rows.forEach(async (row, rowIndex) => {
            const { getByTestId } = within(row)

            const whoisNickname = await HoloFuelDnaInterface.user.getCounterparty({ agentId: fullRowContent[rowIndex].counterparty })
            const notesDisplay = fullRowContent[rowIndex].notes === null ? 'none' : fullRowContent[rowIndex].notes
            const dateDisplay = formatDateTime(fullRowContent[rowIndex].timestamp).date
            const timeDisplay = formatDateTime(fullRowContent[rowIndex].timestamp).time

            expect(within(getByTestId('cell-date')).getByText(dateDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-time')).getByText(timeDisplay)).toBeInTheDocument()

            expect(within(getByTestId('cell-counterparty')).getByText(whoisNickname.nickname) || within(getByTestId('cell-counterparty')).getByText(presentAgentId(fullRowContent[rowIndex].counterparty))).toBeInTheDocument()

            expect(within(getByTestId('cell-notes')).getByText(notesDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-amount')).getByText(presentHolofuelAmount(fullRowContent[rowIndex].amount))).toBeInTheDocument()
            expect(within(getByTestId('cell-fees')).getByText(fullRowContent[rowIndex].fees)).toBeInTheDocument()
            if (fullRowContent[rowIndex].presentBalance) expect(within(getByTestId('cell-present-balance')).getByText(fullRowContent[rowIndex].presentBalance)).toBeInTheDocument()
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

    const mockAgent1 = {
      nick: 'Perry',
      pub_sign_key: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r'
    }

    const pendingRequest = {
      id: 'QmMockEntryAddress123',
      counterparty: mockAgent1.pub_sign_key,
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

    const waitingTransactionsQueryMock = {
      request: {
        query: HolofuelWaitingTransactionsQuery
      },
      result: {
        data: {
          holofuelWaitingTransactions: []
        }
      }
    }

    const cancelPendingRequestMock = {
      request: {
        query: HolofuelCancelMutation, // mutation ??
        variables: { transactionId: pendingRequest.id }
      },
      result: {
        data: { holofuelCancel: mockTransaction }
      },
      newData: jest.fn()
    }

    const cancelPendingOfferMock = {
      request: {
        query: HolofuelCancelMutation, // mutation ??
        variables: { transactionId: pendingOffer.id }
      },
      result: {
        data: { holofuelCancel: mockTransaction }
      },
      newData: jest.fn()
    }

    // /////////////
    // it('useQuery Hook performs HolofuelCounterpartyQuery request', async () => {
    //   const mocks = [
    //     counterpartyQueryMock
    //   ]

    //   let component
    //   await act(async () => {
    //     (component = render(<MockedProvider mocks={mocks} addTypename={false}>
    //       <ConfirmCancellationModal
    //         transaction={pendingRequest} />
    //     </MockedProvider>))
    //     await wait(0)
    //   })

    //   const { result, waitForNextUpdate } = renderHook(() =>
    //     component.useQuery(counterpartyQueryMock, { agentId: pendingRequest.counterparty })
    //   )

    //   expect(result.current.data.holofuelCounterparty).toEqual({})
    //   expect(result.current.loading).toBeTruthy()

    //   await waitForNextUpdate()

    //   expect(result.current.data.holofuelCounterparty).toEqual(counterpartyQueryMock.data)
    //   expect(result.current.loading).toBeFalsy()
    // })

    it('should display correct text for CancellationModal for a Pending Request', async () => {
      const mocks = [
        counterpartyQueryMock,
        cancelPendingRequestMock,
        waitingTransactionsQueryMock
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
        counterpartyQueryMock,
        cancelPendingOfferMock,
        waitingTransactionsQueryMock
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
      const { container, getByText } = within(heading)
      await Modal.setAppElement(container)
      expect(getByText(capitalizedType, { exact: false })).toBeInTheDocument()
      expect(getByText('of', { exact: false })).toBeInTheDocument()
      expect(getByText('to', { exact: false })).toBeInTheDocument()
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
        transaction: pendingRequest,
        key: pendingRequest.id,
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
        transaction: pendingOffer,
        key: pendingRequest.id,
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
      expect(time).toBe(moment(MOCK_TIMEDATE.semanticOverAYear).format('kk:mm'))
    })

    it('should format timedate within past year', () => {
      const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticSameYear)
      expect(date).toBe(moment(MOCK_TIMEDATE.semanticSameYear).format('MMMM D'))
      expect(time).toBe(moment(MOCK_TIMEDATE.semanticSameYear).format('kk:mm'))
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
