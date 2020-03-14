import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

function useAcceptOffer () {
  const [acceptOffer] = useMutation(HolofuelAcceptOfferMutation)
  return ({ id }) => acceptOffer({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

function AcceptRequestedOffers ({
  children
}) {
  const { data: { holofuelActionableTransactions: actionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const requestPayments = actionableTransactions.filter(transaction => transaction.isPayingARequest)
  const acceptOffer = useAcceptOffer()

  useEffect(() => {
    if (!isEmpty(requestPayments)) {
      requestPayments.forEach(offer => {
        acceptOffer(offer)
      })
    }
  }, [requestPayments, acceptOffer])

  return <>{children}</>
}

export default AcceptRequestedOffers
