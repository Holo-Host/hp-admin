import React from 'react'
import { fireEvent, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import Home from './Home'
import { presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { DIRECTION } from 'models/Transaction'
import { OFFER_PATH, REQUEST_PATH } from 'holofuel/utils/urls'

// this is importing from the mocked version of this module
import { history } from 'react-router-dom'

jest.mock('data-interfaces/EnvoyInterface')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

describe('Home', () => {
  describe('with no transactions', () => {
    const nickname = 'Julio'
    const balance = '1234.56'

    const mocks = [
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

    it('renders', async () => {
      const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <Home />
      </MockedProvider>)

      expect(getByText(`Hi ${nickname}!`)).toBeInTheDocument()

      history.push.mockReset()
      fireEvent.click(getByText('Send'))
      expect(history.push).toHaveBeenCalledWith(OFFER_PATH)

      history.push.mockReset()
      fireEvent.click(getByText('Request'))
      expect(history.push).toHaveBeenCalledWith(REQUEST_PATH)

      expect(getByText(`${presentHolofuelAmount(balance)} HF`)).toBeInTheDocument()

      expect(getByText('You have no recent transactions')).toBeInTheDocument()
    })
  })

  describe('with a list of transactions', () => {
    const transactionDefaults = {
      status: '',
      type: '',
      timestamp: '',
      fees: '',
      presentBalance: ''
    }

    const transactions = [{
      ...transactionDefaults,
      id: 1,
      counterparty: {
        id: '1',
        nickname: 'Joe'
      },
      amount: '212',
      notes: 'hey chief',
      direction: DIRECTION.incoming
    },
    {
      ...transactionDefaults,
      id: 2,
      counterparty: {
        id: '2',
        nickname: 'Sue'
      },
      amount: '543.4098',
      notes: 'monies',
      direction: DIRECTION.outgoing
    }]

    const mocks = [
      {
        request: {
          query: HolofuelCompletedTransactionsQuery
        },
        result: {
          data: {
            holofuelCompletedTransactions: [
              {
                ...transactions[0],
                counterparty: {
                  id: transactions[0].counterparty.id
                }
              },
              {
                ...transactions[1],
                counterparty: {
                  id: transactions[1].counterparty.id
                }
              }
            ]
          }
        }
      },
      {
        request: {
          query: HolofuelHistoryCounterpartiesQuery
        },
        result: {
          data: {
            holofuelHistoryCounterparties: transactions.map(transaction => transaction.counterparty)
          }
        }
      }
    ]

    it('renders the transactions', async () => {
      const { getAllByRole, queryByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <Home />
      </MockedProvider>)

      expect(queryByText('You have no recent transactions')).not.toBeInTheDocument()

      const listItems = getAllByRole('listitem')
      expect(listItems).toHaveLength(2)

      listItems.forEach((item, index) => {
        const { getByText } = within(item)
        const { notes, direction, amount, counterparty } = transactions[index]

        expect(getByText(notes)).toBeInTheDocument()

        const presentedAmount = direction === DIRECTION.incoming
          ? `+ ${presentHolofuelAmount(amount)}`
          : `- ${presentHolofuelAmount(amount)}`

        expect(getByText(presentedAmount)).toBeInTheDocument()
        expect(getByText(counterparty.nickname)).toBeInTheDocument()
      })
    })
  })
})
