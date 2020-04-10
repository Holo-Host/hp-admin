import React from 'react'
import { fireEvent, within, wait, act } from '@testing-library/react'
import waait from 'waait'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runConductor from 'utils/integration-testing/runConductorWithFixtures'
import { login } from './Login.integration.test'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// ******************************************************************************************
// NOTE: !! UPDATE Expected data to reflect data from pre-seed, not mock data from component,
// ...once component mock data is removed !!
// ******************************************************************************************

// TODO: Remove 'hostEarningTransactions' MOCK once Host Earnings Filter is in place,
// ...and Hosting Earning TXs are added to pre-seed data
// const hostEarningTransactions = [{
//   id: 'QmtXOriginIdHash1',
//   timestamp: '2019-08-30T22:20:25.106Z',
//   amount: 125000,
//   pricePerUnit: 500,
//   units: 'cpu',
//   happName: 'Community'
// },
// {
//   id: 'QmtXOriginIdHash2',
//   timestamp: '2019-08-30T18:20:25.106Z',
//   amount: 1600,
//   pricePerUnit: 200,
//   units: 'ram',
//   happName: 'MinerSweeper'
// }]

describe.skip('HostedEarnings', () => {
  it('User navigates to Earnings Page, toggles between 1, 7, & 30 day views', runConductor(async () => {
    const queries = await renderAndWait(<HPAdminApp />)
    const { getByTestId, getAllByTestId, getByText } = queries

    // login and arrive at home page
    await login(queries)
      .then(result => result())

    // navigate to earnings page
    await act(async () => {
      fireEvent.click(getByTestId('menu-button'))
      await waait(0)
    })
    await wait(() => getByTestId('earnings-link'))
    await act(async () => {
      fireEvent.click(getByTestId('earnings-link'))
      await waait(0)
    })

    await wait(() => getByText('1 Day'))
    const rows = getAllByTestId('transaction-row')

    // Confirm earnings content for 1 DAY (placeholder)
    await act(async () => {
      fireEvent.click(getByText('1 Day'))
      await waait(0)
    })

    // NOTE: This number reflects the expected output as per the MOCK data located inside the component,
    // ...and NOT the pre-seed data.
    expect(rows).toHaveLength(3)
    // TODO: Uncomment below once component mock data is removed...
    // rows.forEach((row, index) => {
    //   const { getByText } = within(row)
    //   expect(getByText(hostEarningTransactions[index].amount)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].timestamp)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].pricePerUnit)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].units)).toBeInTheDocument()
    //   expect(getByText(hostEarningTransactions[index].happName)).toBeInTheDocument()
    // })

    // confirm earnings content for 7 DAYS (placeholder)
    await act(async () => {
      fireEvent.click(getByText('7 Days'))
      await waait(0)
    })
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
    await act(async () => {
      fireEvent.click(getByText('30 Days'))
      await waait(0)
    })
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
    await act(async () => {
      fireEvent.click(getByTestId('menu-button'))
      await waait(0)
    })
    await wait(() => getByText('Home'))
    await act(async () => {
      fireEvent.click(getByText('Home'))
      await waait(0)
    })

    // verify that dashboard reflects the Hosted Earnings (placeholder)
    await wait(() => getByText('My HoloPort'))
    await wait(() => getByTestId('hosted-earnings'))
    // TODO: Once earnings flag is in place, update below test expect accroding to the hosting earnings as reported from the hf dna :
    expect(within(getByTestId('hosted-earnings')).getByText("You haven't earned any HoloFuel yet"))
  }), 150000)
})
