import React from 'react'
import { fireEvent } from '@testing-library/react'
import { mockNavigateTo } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import EarningsReportQuery from 'graphql/EarningsReportQuery.gql'
import HostingReportQuery from 'graphql/HostingReportQuery.gql'

import { presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import Dashboard from './Dashboard'

jest.mock('components/layout/PrimaryLayout')
jest.mock('contexts/useAuthContext')
jest.mock('contexts/useFlashMessageContext')

describe('Dashboard', () => {
  it.skip('renders empty states', async () => {
    const mocks = []

    const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Dashboard earnings={0} />
    </MockedProvider>)

    expect(getByText('Hi Holo Naut!')).toBeInTheDocument()

    const holofuel = getByText('You have no TestFuel')
    expect(holofuel).toBeInTheDocument()
    fireEvent.click(holofuel)
    expect(mockNavigateTo).toHaveBeenCalledWith('/holofuel/')
  })

  it.skip('renders empty states including earnings and hosting', async () => {
    const mocks = []

    const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Dashboard earnings={0} />
    </MockedProvider>)

    expect(getByText('Hi Holo Naut!')).toBeInTheDocument()

    const holofuel = getByText('You have no TestFuel')
    expect(holofuel).toBeInTheDocument()
    fireEvent.click(holofuel)
    expect(mockNavigateTo).toHaveBeenCalledWith('/holofuel')

    const hosting = getByText('Host your first hApp!')
    expect(hosting).toBeInTheDocument()
    fireEvent.click(hosting)
    expect(mockNavigateTo).toHaveBeenCalledWith('/browse-happs')

    const earningsCard = getByText("You haven't earned TestFuel")
    expect(earningsCard).toBeInTheDocument()
    fireEvent.click(earningsCard)
    expect(mockNavigateTo).toHaveBeenCalledWith('/earnings')
  })

  it.skip('renders normal states', async () => {
    // skipped until Earnings is implemented
    const totalEarnings = 39090

    const hostingReportMock = {
      request: {
        query: HostingReportQuery
      },
      result: {
        data: {
          hostingReport: {
            localSourceChains: 18,
            zomeCalls: 588,
            hostedHapps: [
              {
                name: 'HoloFuel'
              }
            ]
          }
        }
      }
    }

    const earningsReportMock = {
      request: {
        query: EarningsReportQuery
      },
      result: {
        data: {
          earningsReport: {
            totalEarnings,
            cpu: 300,
            bandwidth: 300,
            storage: 300
          }
        }
      }
    }

    const mocks = [
      hostingReportMock,
      earningsReportMock
    ]

    const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Dashboard />
    </MockedProvider>, 0)

    expect(getByText(`${presentHolofuelAmount(totalEarnings)} TF`)).toBeInTheDocument()
  })
})
