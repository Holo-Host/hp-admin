import React from 'react'
import { MockedProvider } from '@apollo/react-testing'
import wait from 'waait'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { renderAndWait } from 'utils/test-utils'
import { DIRECTION, STATUS, TYPE } from 'models/Transaction'
import AcceptRequestedOffers from './AcceptRequestedOffers'

describe('AcceptRequestedOffers', () => {
  const counterparty = {
    id: 101,
    nickname: 'bill'
  }

  const offer = {
    id: 1,
    amount: '222',
    counterparty,
    direction: DIRECTION.incoming,
    status: STATUS.pending,
    type: TYPE.offer,
    timestamp: '123',
    notes: '',
    fees: '',
    isPayingARequest: false
  }

  const offerPayingRequest = {
    ...offer,
    id: 2,
    isPayingARequest: true
  }

  const ledgerMock = {
    request: {
      query: HolofuelLedgerQuery
    },
    result: {
      data: {
        holofuelLedger: {
          balance: '1110000',
          credit: 0,
          payable: 0,
          receivable: 0,
          fees: 0
        }
      }
    }
  }

  const actionableTransactionsMock = {
    request: {
      query: HolofuelActionableTransactionsQuery
    },
    result: {
      data: {
        holofuelActionableTransactions: [offer, offerPayingRequest]
      }
    },
    newData: jest.fn(() => ({
      data: {
        holofuelActionableTransactions: [offer]
      }
    }))
  }

  const acceptOfferMock = {
    request: {
      query: HolofuelAcceptOfferMutation,
      variables: { transactionId: offerPayingRequest.id }
    },
    newData: jest.fn(() => ({
      data: {
        holofuelAcceptOffer: offerPayingRequest
      }
    }))
  }

  const mocks = [
    actionableTransactionsMock,
    acceptOfferMock,
    ledgerMock
  ]

  it.skip('calls acceptOfferMutation with incoming payments for requests', async () => {
    await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
      <AcceptRequestedOffers />
    </MockedProvider>)

    await wait(4000)

    expect(acceptOfferMock.newData).toHaveBeenCalled()
  })
})
