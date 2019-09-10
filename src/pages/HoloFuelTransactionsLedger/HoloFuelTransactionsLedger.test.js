import React from 'react'
import { render, within, act, cleanup } from '@testing-library/react' // fireEvent,
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'
import wait from 'waait'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'
// import { transactionList } from 'mock-dnas/holofuel' // pendingList,
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
    it('should render completed transaction details', async () => {
      beforeEach(cleanup)

      let getAllByRole
      await act(async () => {
        ({ getAllByRole } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <HoloFuelTransactionsLedger history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      const hfInterfaceCompleteTxList = await HoloFuelDnaInterface.transactions.allComplete()
      console.log('>>>>>>>>> HERE ARE THE COMPLETED TRANSACTIONS : ', hfInterfaceCompleteTxList)

      const listItems = getAllByRole('rowgroup')
      expect(listItems).toHaveLength(2)

      listItems.forEach((item, index) => {
        const { getByText } = within(item)
        if (index === 0) return null
        else {
          // expect(getByText(formatDateTime(hfInterfaceCompleteTxList[0].timestamp))).toBeInTheDocument()
          expect(getByText(makeDisplayName(hfInterfaceCompleteTxList[0].counterparty))).toBeInTheDocument()
          expect(getByText(hfInterfaceCompleteTxList[0].notes)).toBeInTheDocument()
          expect(getByText(hfInterfaceCompleteTxList[0].amount)).toBeInTheDocument()
          expect(getByText(hfInterfaceCompleteTxList[0].direction)).toBeInTheDocument()
          expect(getByText(hfInterfaceCompleteTxList[0].fees)).toBeInTheDocument()
          expect(getByText(hfInterfaceCompleteTxList[0].presentBalance)).toBeInTheDocument()
        }
      })
    })

    it('should render the header and title', async () => {
      let getByText
      await act(async () => {
        ({ getByText } = renderWithRouter(<ApolloProvider client={apolloClient}>
          <HoloFuelTransactionsLedger history={{}} />
        </ApolloProvider>))
        await wait(0)
      })

      expect(getByText('HoloFuel')).toBeInTheDocument()
      expect(getByText('Completed Transactions')).toBeInTheDocument()
    })

    // it('should render the account balance', async () => {
    //   let getByText
    //   await act(async () => {
    //     ({ getByText } = renderWithRouter(<ApolloProvider client={apolloClient}>
    //       <HoloFuelTransactionsLedger history={{}} />
    //     </ApolloProvider>))
    //     await wait(0)
    //   })

    //   expect(getByText(transactionList.ledger.balance)).toBeInTheDocument()
    // })
  })
})

// Discuss issues with extracting this function and consider less repeative solutions
// const renderHFLedgerTx = async () => {
//   const txLedger = await renderWithRouter(<ApolloProvider client={apolloClient}>
//     <HoloFuelTransactionsLedger history={{}} />
//   </ApolloProvider>)

//   await wait(0)
//   return txLedger
// }
