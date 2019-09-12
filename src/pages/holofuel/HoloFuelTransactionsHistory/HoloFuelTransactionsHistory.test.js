import React from 'react'
// import moment from 'moment'
import { render, within, act, cleanup } from '@testing-library/react' // fireEvent,
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import wait from 'waait'
import HoloFuelTransactionsHistory, { makeDisplayName } from './HoloFuelTransactionsHistory' // formatDateTime
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
          <HoloFuelTransactionsHistory history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      expect(getByText('HoloFuel')).toBeVisible()
      expect(getByText('History')).toBeVisible()
    })

    it('should render and populate completed transaction table', async () => {
      beforeEach(cleanup)

      let getAllByRole
      await act(async () => {
        ({ getAllByRole } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <HoloFuelTransactionsHistory history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      const hfInterfaceCompleteTxList = await HoloFuelDnaInterface.transactions.allComplete()

      const listTableGroups = getAllByRole('rowgroup')
      expect(listTableGroups).toHaveLength(2)

      const NUM_TABLE_HEADERS = 5
      const listTableHeaders = getAllByRole('columnheader')
      // number of cols check
      expect(listTableHeaders).toHaveLength(NUM_TABLE_HEADERS)

      const listTableCells = getAllByRole('cell')
      // number of cells check
      expect(listTableCells).toHaveLength(hfInterfaceCompleteTxList.length * NUM_TABLE_HEADERS)

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
          expect(rows).toHaveLength(hfInterfaceCompleteTxList.length)

          // cell content check
          rows.forEach((row, rowIndex) => {
            const { getByTestId } = within(row)
            const notesDisplay = hfInterfaceCompleteTxList[rowIndex].notes === null ? 'none' : hfInterfaceCompleteTxList[rowIndex].notes
            // const datetimeDisplay = formatDateTime(hfInterfaceCompleteTxList[rowIndex].timestamp)

            // expect(within(getByTestId('cell-date-time')).getByText(datetimeDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-counterparty')).getByText(makeDisplayName(hfInterfaceCompleteTxList[rowIndex].counterparty))).toBeInTheDocument()
            expect(within(getByTestId('cell-notes')).getByText(notesDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-amount')).getByText(hfInterfaceCompleteTxList[rowIndex].amount)).toBeInTheDocument()
            expect(within(getByTestId('cell-fees')).getByText(hfInterfaceCompleteTxList[rowIndex].fees)).toBeInTheDocument()
            expect(within(getByTestId('cell-present-balance')).getByText(hfInterfaceCompleteTxList[rowIndex].presentBalance)).toBeInTheDocument()
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
      expect(displayName.toLowerCase()).toBe(displayName.substring(displayName.length - 7).toLowerCase())
    })
  })

  // describe('HoloFuelTransactionsHistory helper functions (formatDateTime & makeDisplayName)', () => {
  //   it('should format timedate', async () => {
  //     const currentMinute = new Date().getMinutes()
  //     // console.log('>>>>>> currentMinute <<<<<<', currentMinute)
  //     const minAgo = new Date().setMinutes(currentMinute - 1)
  //     const currentDate = new Date().getHours()
  //     // console.log('>>>>>> currentDate <<<<<<', currentDate)
  //     const hourAgo = new Date().setHours(currentDate - 1)

  //     const previousMinuteDateTimeIso = new Date(minAgo).toISOString()
  //     console.log('>>>>>> previousMinuteDateTimeIso <<<<<<', previousMinuteDateTimeIso)
  //     const previousHourTimeIso = new Date(hourAgo).toISOString()
  //     console.log('>>>>>> previousHourTimeIso <<<<<<', previousHourTimeIso)

  //     const MOCK_TIMEDATE = {
  //       semanticSameHour: previousMinuteDateTimeIso,
  //       semanticSameDay: previousHourTimeIso,
  //       semanticFullDate: '2019-08-30T11:17:16+00:00'
  //     }

  //     // const wrapText = (content) => <React.Fragment><p>{content}</p></React.Fragment>

  //     const fullDateTime = formatDateTime(MOCK_TIMEDATE.semanticFullDate)
  //     expect(fullDateTime).toBe('August 30, 2019 6:17 AM')

  //     const hourDiffDateTime = formatDateTime(MOCK_TIMEDATE.semanticSameDay)
  //     expect(hourDiffDateTime).toBe(moment(MOCK_TIMEDATE.semanticSameHour).startOf('hour').fromNow())

  //     const minuteDiffDateTime = formatDateTime(MOCK_TIMEDATE.semanticSameHour)
  //     expect(minuteDiffDateTime).toBe(moment(MOCK_TIMEDATE.semanticSameHour).startOf('minute').fromNow())
  //   })
  // })
})
