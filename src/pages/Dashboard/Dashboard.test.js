import React from 'react'
import { fireEvent } from '@testing-library/react'
import { mockNavigateTo } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HappsQuery from 'graphql/HappsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'

import { presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import { defaultHapp } from 'models/Happ'
import Dashboard from './Dashboard'

jest.mock('components/layout/PrimaryLayout')
jest.mock('contexts/useAuthContext')
jest.mock('contexts/useFlashMessageContext')

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
      },
      {
        request: {
          query: HposSettingsQuery
        },
        result: {
          data: {
            hposSettings: {
              hostPubKey: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8',
              hostName: 'Holo Naut',
              registrationEmail: 'sam.rose@holo.host',
              networkStatus: 'live',
              sshAccess: true,
              deviceName: 'My HoloPort'
            }
          }
        }
      }
    ]

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
      },
      {
        request: {
          query: HposSettingsQuery
        },
        result: {
          data: {
            hposSettings: {
              hostPubKey: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8',
              hostName: 'Holo Naut',
              registrationEmail: 'sam.rose@holo.host',
              networkStatus: 'live',
              sshAccess: true,
              deviceName: 'My HoloPort'
            }
          }
        }
      }
    ]

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
      },
      {
        request: {
          query: HposSettingsQuery
        },
        result: {
          data: {
            hposSettings: {
              hostPubKey: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8',
              hostName: 'Holo Naut',
              registrationEmail: 'sam.rose@holo.host',
              networkStatus: 'live',
              sshAccess: true,
              deviceName: 'My HoloPort'
            }
          }
        }
      }
    ]

    const earnings = 40948

    const { getByText } = await renderAndWait(<MockedProvider mocks={macks} addTypename={false}>
      <Dashboard earnings={earnings} />
    </MockedProvider>, 0)

    expect(getByText('Hi Holo Naut!')).toBeInTheDocument()

    expect(getByText(`${presentHolofuelAmount(balance)} TF`)).toBeInTheDocument()
  })

  it.skip('renders normal states including ', async () => {
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
      },
      {
        request: {
          query: HposSettingsQuery
        },
        result: {
          data: {
            hposSettings: {
              hostPubKey: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8',
              hostName: 'Holo Naut',
              registrationEmail: 'sam.rose@holo.host',
              networkStatus: 'live',
              sshAccess: true,
              deviceName: 'My HoloPort'
            }
          }
        }
      }
    ]

    const earnings = 40948

    const { getByText } = await renderAndWait(<MockedProvider mocks={macks} addTypename={false}>
      <Dashboard earnings={earnings} />
    </MockedProvider>, 0)

    expect(getByText('Hi Holo Naut!')).toBeInTheDocument()

    expect(getByText('1 hApp')).toBeInTheDocument()

    expect(getByText(`${presentHolofuelAmount(earnings)} TF`)).toBeInTheDocument()

    expect(getByText(`${presentHolofuelAmount(balance)} TF`)).toBeInTheDocument()
  })
})
