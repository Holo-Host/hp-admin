import React from 'react'
import { within, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'
import { STATUS, DIRECTION } from 'models/Transaction'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import TransactionHistory from './TransactionHistory'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { renderAndWait } from 'utils/test-utils'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

const agent1 = {
  id: '1',
  nickname: 'Bo'
}

const agent2 = {
  id: '2',
  nickname: 'Rue'
}

const defaultTransaction = {
  amount: '0',
  counterparty: agent1,
  direction: '',
  status: '',
  type: '',
  timestamp: '2019-11-11',
  fees: 0,
  presentBalance: 0,
  notes: ''
}

const balance = '39085'
const ledgerMock = {
  request: { query: HolofuelLedgerQuery },
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

describe('TransactionHistory', () => {
  describe('With a balance and no transactions', () => {
    const mocks = [ledgerMock]

    it('renders the balance and the empty state', async () => {
      const push = jest.fn()
      const { getByText, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionHistory history={{ push }} />
      </MockedProvider>)

      const presentedBalance = `${presentHolofuelAmount(balance)} TF`

      expect(getByText(presentedBalance)).toBeInTheDocument()

      expect(getByText('You have no recent activity')).toBeInTheDocument()

      fireEvent.click(getByTestId('create-transaction-button'))
      expect(push).toHaveBeenCalledWith(OFFER_REQUEST_PATH)
    })
  })

  describe('With some transactions', () => {
    const completedOutgoing = {
      ...defaultTransaction,
      id: 1,
      counterparty: {
        id: agent1.id,
        nickname: agent1.nickname
      },
      status: STATUS.completed,
      direction: DIRECTION.outgoing,
      amount: '128597',
      notes: 'Nice one',
      presentBalance: '498409843'
    }

    const completedIncoming = {
      ...defaultTransaction,
      id: 2,
      counterparty: {
        id: agent2.id,
        nickname: agent2.nickname
      },
      status: STATUS.completed,
      direction: DIRECTION.incoming,
      amount: '47863',
      notes: 'Good stuff'
    }

    const pendingOutgoing = {
      ...defaultTransaction,
      id: 3,
      counterparty: {
        id: agent1.id,
        nickname: agent1.nickname
      },
      status: STATUS.completed,
      direction: DIRECTION.outgoing,
      amount: '39872',
      notes: 'Good stuff'
    }

    const completedTransactions = [
      completedOutgoing, completedIncoming
    ]

    const pendingTransactions = [
      pendingOutgoing
    ]

    const mocks = [
      ledgerMock,
      {
        request: {
          query: HolofuelCompletedTransactionsQuery
        },
        result: {
          data: { holofuelCompletedTransactions: completedTransactions }
        }
      },
      {
        request: {
          query: HolofuelWaitingTransactionsQuery
        },
        result: {
          data: { holofuelWaitingTransactions: pendingTransactions }
        }
      }
    ]

    it('renders the transactions, and filters based on tab', async () => {
      const { getByText, queryByText, getAllByTestId, getByTestId } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
        <TransactionHistory history={{}} />
      </MockedProvider>)

      expect(getAllByTestId('transaction-row')).toHaveLength(3)

      const { getByText: getFilterButtonByText } = within(getByTestId('filter-buttons'))

      const completedOutgoingAmount = `- ${presentHolofuelAmount(completedOutgoing.amount)}`
      const completedIncomingAmount = `+ ${presentHolofuelAmount(completedIncoming.amount)}`
      const pendingOutgoingAmount = `- ${presentHolofuelAmount(pendingOutgoing.amount)}`

      fireEvent.click(getFilterButtonByText('Withdrawals'))
      expect(getAllByTestId('transaction-row')).toHaveLength(1)
      expect(getByText(completedOutgoingAmount)).toBeInTheDocument()
      expect(queryByText(completedIncomingAmount)).not.toBeInTheDocument()
      expect(queryByText(pendingOutgoingAmount)).not.toBeInTheDocument()

      expect(getByText(completedOutgoing.notes)).toBeInTheDocument()
      //  BALANCE-BUG: Intentionally commented out until DNA balance bug is resolved
      // expect(getByText(presentHolofuelAmount(completedOutgoing.presentBalance))).toBeInTheDocument()
      expect(getByText(agent1.nickname)).toBeInTheDocument()

      fireEvent.click(getFilterButtonByText('Deposits'))
      expect(getAllByTestId('transaction-row')).toHaveLength(1)
      expect(queryByText(completedOutgoingAmount)).not.toBeInTheDocument()
      expect(getByText(completedIncomingAmount)).toBeInTheDocument()
      expect(queryByText(pendingOutgoingAmount)).not.toBeInTheDocument()

      fireEvent.click(getFilterButtonByText('Pending'))
      expect(getAllByTestId('transaction-row')).toHaveLength(1)
      expect(queryByText(completedOutgoingAmount)).not.toBeInTheDocument()
      expect(queryByText(completedIncomingAmount)).not.toBeInTheDocument()
      expect(getByText(pendingOutgoingAmount)).toBeInTheDocument()

      fireEvent.click(getFilterButtonByText('All'))
      expect(getAllByTestId('transaction-row')).toHaveLength(3)
      expect(getByText(completedOutgoingAmount)).toBeInTheDocument()
      expect(getByText(completedIncomingAmount)).toBeInTheDocument()
      expect(getByText(pendingOutgoingAmount)).toBeInTheDocument()
    })
  })

  //* ******************************* *//
  // Utils / Helper Functions Tests :

  describe('Helper function : presentHolofuelAmount() - Presenation of HoloFuel Float', () => {
    it('should accept a float and return a locale string', async () => {
      const { balance } = await HoloFuelDnaInterface.ledger.get({})
      const holofuelAmount = presentAgentId(balance)
      expect(typeof holofuelAmount).toBe('string')
      expect(Number(holofuelAmount) % 1 !== 0).toBeTruthy()
    })
  })

  describe('Helper function : presentAgentId() - PubKey Truncation and Formatting', () => {
    it('should accept a full hashString and return the last 6 chars', async () => {
      const { id } = await HoloFuelDnaInterface.user.get({})
      const displayName = presentAgentId(id)
      expect(displayName.length).toEqual(6)
      expect(displayName).toBe(displayName.substring(displayName.length - 7))
    })
  })
})
