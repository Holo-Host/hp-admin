import React from 'react'
// import moment from 'moment'
import { render, within, act, cleanup } from '@testing-library/react' // fireEvent,
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import wait from 'waait'
import TransactionsHistory, { makeDisplayName, formatDateTime, MOCK_ACCT_NUM } from './TransactionHistory'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'

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
  describe('rendering', () => {
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
            // expect(within(getByTestId('cell-present-balance')).getByText(fullRowContent[rowIndex].presentBalance)).toBeInTheDocument()
          })
        } else {
          throw new Error('There was an unknown table-group found : group label, index in tableGroup Array', tableGroup, index)
        }
      })
    })
  })

  describe('helper function : makeDisplayName', () => {
    it('should take in a full hashString and return only the last 7 chars', async () => {
      const { id } = await HoloFuelDnaInterface.user.get({})
      const displayName = makeDisplayName(id)
      expect(displayName.length).toEqual(7)
      expect(displayName).toBe(displayName.substring(displayName.length - 7))
    })
  })

  describe('HoloFuelTransactionsHistory helper functions (formatDateTime & makeDisplayName)', () => {
    describe('Semantic timedate formatting with momentjs', () => {
      const currentMinute = new Date().getMinutes()
      const minAgo = new Date().setMinutes(currentMinute - 1)
      const currentDate = new Date().getHours()
      const hourAgo = new Date().setHours(currentDate - 1)

      const previousMinuteDateTimeIso = new Date(minAgo).toISOString()
      // console.log('previousMinuteDateTimeIso : ', previousMinuteDateTimeIso)

      const previousHourTimeIso = new Date(hourAgo).toISOString()
      // console.log('previousHourTimeIso : ', previousHourTimeIso)

      const MOCK_TIMEDATE = {
        semanticSameHour: previousMinuteDateTimeIso,
        semanticSameDay: previousHourTimeIso,
        semanticSameYear: '2019-08-30T11:17:16+00:00',
        semanticOverAYear: '2000-08-30T11:17:16+00:00'
      }

      // const genDateFormat = isodate => {
      //   const date = new Date(isodate)
      //   const newDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' at ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
      //   return newDate
      // }
      // console.log('Date-time Check : ', genDateFormat(MOCK_TIMEDATE.semanticSameYear))

      it('should format timedate within past year', () => {
        const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticOverAYear)
        expect(date).toBe('August 30 2000')
        expect(time).toBe('6:17')
      })

      it('should format timedate within past year', () => {
        const { date, time } = formatDateTime(MOCK_TIMEDATE.semanticSameYear)
        expect(date).toBe('August 30')
        expect(time).toBe('6:17')
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
    })
  })
})
