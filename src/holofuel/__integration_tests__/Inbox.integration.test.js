import React from 'react'
import waait from 'waait'
import { fireEvent, within, act, wait } from '@testing-library/react'
import { renderAndWait, hackyWaitForElement } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')
jest.mock('contexts/useAuthContext')

describe('Inbox', () => {
  it('A request is displayed', runConductor(async () => {
    const { debug, getByTestId, getByText, getAllByTestId, queryByText } = await renderAndWait(<HoloFuelApp />) // debug,

    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Inbox'))

    await act(async () => {
      fireEvent.click(getByText('Inbox'))
      await waait(0)
    })

    console.log('in inbox')

    const inboxOfferAmount = '400 TF'
    const historyOfferAmount = '+ 400'

    // wait for transactionRows to load
    await hackyWaitForElement(() => queryByText(inboxOfferAmount))

    console.log('transaction rows loaded')

    const transactionRows = getAllByTestId('transaction-row')

    console.log('transactionRows.length', transactionRows.length)

    console.log('transactionRows', transactionRows)

    debug()

    for (const transactionRow of transactionRows) {
      const {
        getByText: rowGetByText, queryByText: rowQueryByText, getByTestId: rowGetByTestId
      } = within(transactionRow)

      if (rowQueryByText(inboxOfferAmount)) {
        console.log('WE FOUND THE OFFER')
        act(() => {
          fireEvent.click(rowGetByTestId('reveal-actions-button'))

          fireEvent.click(rowGetByText('Accept'))

          console.log('clicking yes')
          fireEvent.click(getByText('Yes'))
        })
      }
    }

    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('History'))

    await act(async () => {
      fireEvent.click(getByText('History'))
      await waait(0)
    })

    const amountField = await hackyWaitForElement(() => queryByText(historyOfferAmount))

    // await wait(() => getByText(historyOfferAmount))

    // const amountField = getByText(historyOfferAmount)

    expect(amountField).toBeInTheDocument()
  }), 60000)
})
