import React from 'react'
import { fireEvent } from '@testing-library/react'
import { mockNavigateTo } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HappsQuery from 'graphql/HappsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import { defaultHapp } from 'models/Happ'
import Dashboard from './Dashboard'

jest.mock('components/layout/PrimaryLayout')

describe('Dashboard', () => {
  it('renders empty states', async () => {
    const mocks = [
      {
        request: {
          query: HappsQuery
        },
        result: {
          data: {
            happs: []
          }
        }
      },
      {
        request: {
          query: HolofuelUserQuery
        },
        result: {
          data: {
            holofuelUser: {
              id: '1',
              nickname: ''
            }
          }
        }
      },
      {
        request: {
          query: HolofuelLedgerQuery
        },
        result: {
          data: {
            holofuelLedger: {
              balance: 0,
              credit: 0,
              payable: 0,
              receivable: 0,
              fees: 0
            }
          }
        }
      }
    ]

    const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <Dashboard />
    </MockedProvider>, 0)

    expect(getByText('Hi!')).toBeInTheDocument()

    const hosting = getByText('+ Host your first app')
    expect(hosting).toBeInTheDocument()
    fireEvent.click(hosting)
    expect(mockNavigateTo).toHaveBeenCalledWith('/browse-happs')

    const earnings = getByText("You haven't earned any HoloFuel yet")
    expect(earnings).toBeInTheDocument()
    fireEvent.click(earnings)
    expect(mockNavigateTo).toHaveBeenCalledWith('/earnings')

    const holofuel = getByText('You have no HoloFuel')
    expect(holofuel).toBeInTheDocument()
    fireEvent.click(holofuel)
    expect(mockNavigateTo).toHaveBeenCalledWith('/holofuel')
  })

  it('renders normal states', async () => {
    const nickname = 'Jane'
    const balance = 123
    const macks = [
      {
        request: {
          query: HappsQuery
        },
        result: {
          data: {
            happs: [
              {
                ...defaultHapp,
                isEnabled: true
              },
              {
                ...defaultHapp,
                isEnabled: false
              }
            ]
          }
        }
      },
      {
        request: {
          query: HolofuelUserQuery
        },
        result: {
          data: {
            holofuelUser: {
              id: '1',
              nickname
            }
          }
        }
      },
      {
        request: {
          query: HolofuelLedgerQuery
        },
        result: {
          data: {
            holofuelLedger: {
              balance,
              credit: 0,
              payable: 0,
              receivable: 0,
              fees: 0
            }
          }
        }
      }
    ]

    const { getByText } = await renderAndWait(<MockedProvider mocks={macks} addTypename={false}>
      <Dashboard />
    </MockedProvider>, 0)

    expect(getByText('Hi Jane!')).toBeInTheDocument()

    expect(getByText('1 Application')).toBeInTheDocument()

    expect(getByText(`Today: ${presentHolofuelAmount(balance)}`)).toBeInTheDocument()

    expect(getByText('HoloFuel Balance')).toBeInTheDocument()
  })
})
