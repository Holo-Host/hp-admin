import React from 'react'
import { fireEvent, within, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// TODO: Remove 'hostEarningTransactions' MOCK once Host Earnings Filter is in place,
// ...and Hosting Earning TXs are added to pre-seed data
const hostEarningTransactions = [{
  id: 'QmtXOriginIdHash1',
  timestamp: '2019-08-30T22:20:25.106Z',
  amount: 125000,
  pricePerUnit: 500,
  units: 'cpu',
  happName: 'Community'
},
{
  id: 'QmtXOriginIdHash2',
  timestamp: '2019-08-30T18:20:25.106Z',
  amount: 1600,
  pricePerUnit: 200,
  units: 'ram',
  happName: 'MinerSweeper'
}]

describe('HP Admin : HostedEarnings', () => {
  it('User navigates to Earnings Page, toggles between 1, 7, & 30 day views', runConductor(async () => {
    const { getByTestId, getAllByTestId, getByText } = await renderAndWait(<HPAdminApp />)
    // navigate to earnings page
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Earnings'))
    fireEvent.click(getByText('Earnings'))

    await wait(() => getByText('1 Day'))
    const rows = getAllByTestId('earnings-table-row')

    // Confirm earnings content for 1 DAY (placeholder)
    fireEvent.click(getByText('1 Day'))
    expect(rows).toHaveLength(2)
    rows.forEach((row, index) => {
      const { getByText } = within(row)
      expect(getByText(hostEarningTransactions[index].amount)).toBeInTheDocument()
      expect(getByText(hostEarningTransactions[index].timestamp)).toBeInTheDocument()
      expect(getByText(hostEarningTransactions[index].pricePerUnit)).toBeInTheDocument()
      expect(getByText(hostEarningTransactions[index].units)).toBeInTheDocument()
      expect(getByText(hostEarningTransactions[index].happName)).toBeInTheDocument()
    })

    // confirm earnings content for 7 DAYS (placeholder)
    fireEvent.click(getByText('7 Days'))
    // expect(rows).toHaveLength('!! 7 DAY NUMBER !!')
    // rows.forEach((row, index) => {
    //   const { getByText } = within(row)
    //   expect(getByText(hostEarningTransactions[index].amount)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].timestamp)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].pricePerUnit)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].units)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].happName)).toBeInTheDocument()
    // })

    // confirm earnings content for 30 DAYS (placeholder)
    fireEvent.click(getByText('30 Days'))
    // expect(rows).toHaveLength('!! 30 DAY NUMBER !!')
    // rows.forEach((row, index) => {
    //   const { getByText } = within(row)
    //   expect(getByText(hostEarningTransactions[index].amount)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].timestamp)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].pricePerUnit)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].units)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].happName)).toBeInTheDocument()
    // })

    // navigate back to home dashboard
    fireEvent.click(getByTestId('menu-button'))
    await wait(() => getByText('Home'))
    fireEvent.click(getByText('Home'))

    // verify that dashboard reflects the Hosted Earnings (placeholder)
    await wait(() => getByText('My HoloPort'))
    const hostedHapps = await wait(() => getByTestId('hosted-earnings'))
    expect(hostedHapps).toEqual("You haven't earned any HoloFuel yet")
  }), 150000)
})
