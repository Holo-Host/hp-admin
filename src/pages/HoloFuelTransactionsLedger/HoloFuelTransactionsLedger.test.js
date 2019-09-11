import React from 'react'
import { render, within, act, cleanup } from '@testing-library/react' // fireEvent,
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import wait from 'waait'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'
import { transactionList } from 'mock-dnas/holofuel' // pendingList,
import HoloFuelTransactionsLedger, { makeDisplayName } from './HoloFuelTransactionsLedger' // formatDateTime

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
          <HoloFuelTransactionsLedger history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      expect(getByText('HoloFuel')).toBeVisible()
      expect(getByText('Completed Transactions')).toBeVisible()
    })

    it('should render the account balance', async () => {
      let getAllByRole
      await act(async () => {
        ({ getAllByRole } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <HoloFuelTransactionsLedger history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      const listSections = getAllByRole('region')
      expect(listSections).toHaveLength(2)

      const { getByTestId } = within(listSections[0])
      const balanceElement = getByTestId('account-balance')

      expect(within(balanceElement).getByText(transactionList.ledger.balance)).toBeVisible()
    })

    it('should render and populate completed transaction table', async () => {
      beforeEach(cleanup)

      let getAllByRole
      await act(async () => {
        ({ getAllByRole } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <HoloFuelTransactionsLedger history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      const hfInterfaceCompleteTxList = await HoloFuelDnaInterface.transactions.allComplete()

      const listTableGroups = getAllByRole('rowgroup')
      expect(listTableGroups).toHaveLength(2)

      const NUM_TABLE_HEADERS = 6
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
          expect(getByText('Date')).toBeVisible()
          expect(getByText('From/To')).toBeVisible()
          expect(getByText('Notes')).toBeVisible()
          expect(getByText('Amount (+/-)')).toBeVisible()
          expect(getByText('Fees')).toBeVisible()
          expect(getByText('Balance')).toBeVisible()
        } else if (index === 1) {
          // tbody :
          const rows = getAllByTestId('transactions-table-row')
          // number of rows check => tbody should have the same number of rows as the # of completed transactions
          expect(rows).toHaveLength(hfInterfaceCompleteTxList.length)

          // cell content check
          rows.forEach((row, rowIndex) => {
            const { getByTestId } = within(row)
            const directionDisplay = hfInterfaceCompleteTxList[rowIndex].direction === 'incoming' ? '+' : '-'
            const notesDisplay = hfInterfaceCompleteTxList[rowIndex].notes === null ? 'none' : hfInterfaceCompleteTxList[rowIndex].notes
            // const datetimeDisplay = formatDateTime(hfInterfaceCompleteTxList[rowIndex].timestamp)

            // expect(within(getByTestId('cell-date-time')).getByText(datetimeDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-counterparty')).getByText(makeDisplayName(hfInterfaceCompleteTxList[rowIndex].counterparty))).toBeInTheDocument()
            expect(within(getByTestId('cell-notes')).getByText(notesDisplay)).toBeInTheDocument()
            expect(within(getByTestId('cell-amount')).getByText(directionDisplay + (hfInterfaceCompleteTxList[rowIndex].amount))).toBeInTheDocument()
            expect(within(getByTestId('cell-fees')).getByText(hfInterfaceCompleteTxList[rowIndex].fees)).toBeInTheDocument()
            expect(within(getByTestId('cell-present-balance')).getByText(hfInterfaceCompleteTxList[rowIndex].presentBalance)).toBeInTheDocument()
          })
        } else {
          throw new Error('There was an unknown table-group found : group label, index in tableGroup Array', tableGroup, index)
        }
      })
    })
  })
})
