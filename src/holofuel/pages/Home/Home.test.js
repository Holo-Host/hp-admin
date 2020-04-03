import React from 'react'
import { fireEvent, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import Home from './Home'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { DIRECTION } from 'models/Transaction'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'
import { currentUser as mockCurrentUser } from 'holofuel/contexts/useCurrentUserContext'

// this is importing from the mocked version of this module
import { history } from 'react-router-dom'

jest.mock('data-interfaces/EnvoyInterface')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')
<<<<<<< HEAD
jest.mock('holofuel/contexts/useCounterpartyListContext')
=======
jest.mock('holofuel/contexts/useCurrentUserContext')
>>>>>>> develop

describe('Home', () => {
  describe('with no transactions', () => {
    const balance = '1234.56'

    const mocks = [
      {
        request: {
<<<<<<< HEAD
          query: HolofuelUserQuery
        },
        result: {
          data: {
            holofuelUser: {
              id: 'agent1ID',
              nickname,
              avatarUrl: ''
            }
          }
        }
      },
      {
        request: {
=======
>>>>>>> develop
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

      expect(getByText(`Hi ${mockCurrentUser.nickname}!`)).toBeInTheDocument()

      history.push.mockReset()
      fireEvent.click(getByText('New Transaction'))
      expect(history.push).toHaveBeenCalledWith(OFFER_REQUEST_PATH)

      expect(getByText(`${presentHolofuelAmount(balance)} TF`)).toBeInTheDocument()

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

    const holofuelCounterparty1 = {
      id: 'agent1ID',
      nickname: 'Joe',
      avatarUrl: ''
    }

    const holofuelCounterparty2 = {
      id: 'agent2ID',
      nickname: 'Sue',
      avatarUrl: ''
    }

    const transactions = [{
      ...transactionDefaults,
      id: 1,
      counterparty: holofuelCounterparty1,
      amount: '212',
      notes: 'hey chief',
      direction: DIRECTION.incoming
    },
    {
      ...transactionDefaults,
      id: 2,
      counterparty: holofuelCounterparty2,
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
                  id: transactions[0].counterparty.id,
                  nickname: transactions[0].counterparty.nickname,
                  avatarUrl: ''
                }
              },
              {
                ...transactions[1],
                counterparty: {
                  id: transactions[1].counterparty.id,
                  nickname: transactions[1].counterparty.nickname,
                  avatarUrl: ''
                }
              }
            ]
          }
        }
      }
    ]

    it('renders the transactions', async () => {
      // const setCounterpartyListSpy = jest.fn()
      const { getAllByRole, queryByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <Home />
      </MockedProvider>)

      expect(queryByText('You have no offers or requests')).not.toBeInTheDocument()

      const listItems = getAllByRole('listitem')
      expect(listItems).toHaveLength(2)

      listItems.forEach((item, index) => {
        const { getByText } = within(item)
        const { notes, direction, amount, counterparty } = transactions[index]

        expect(getByText(notes)).toBeInTheDocument()

        const presentedAmount = direction === DIRECTION.incoming
          ? `${presentHolofuelAmount(amount)} TF`
          : `- ${presentHolofuelAmount(amount)} TF`

        expect(getByText(presentedAmount)).toBeInTheDocument()
        // tests that context is set with correct data
        // expect(setCounterpartyListSpy).toHaveBeenCalledWith(holofuelCounterparty1)

        // tests that shows, whenever nickname is not returned from context
        expect(getByText(presentAgentId(counterparty.id))).toBeInTheDocument()
      })
    })
  })
})
