import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty, pick } from 'lodash/fp'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelRefundTransactionsMutation from 'graphql/HolofuelRefundTransactionsMutation.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { TYPE, STATUS } from 'models/Transaction'
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

function useRefundTransactions () {
  const [refundTransactions] = useMutation(HolofuelRefundTransactionsMutation)
  return transactions => {
    const transactionInputs = transactions.map(transaction => ({
      ...pick(['id', 'amount', 'counterparty', 'direction', 'status', 'type', 'timestamp', 'fees', 'notes'], transaction),
      counterparty: pick(['id', 'nickname'], transaction.counterparty)
    }))

    refundTransactions({
      variables: { transactions: transactionInputs },
      refetchQueries: [{
        query: HolofuelLedgerQuery
      }]
    })
  }
}

function RefundDeclinedOffers ({
  children
}) {
  const { data: { holofuelActionableTransactions: actionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const refundTransactions = useRefundTransactions()
  const declinedOffers = actionableTransactions.filter(transaction => ((transaction.status === STATUS.declined) && (transaction.type === TYPE.offer)))

  // // I hate this
  const [hasCalledRefundTransactions, setHasCalledRefundTransactions] = useState(false)

  useEffect(() => {
    if (!isEmpty(declinedOffers) && !hasCalledRefundTransactions) {
      refundTransactions(declinedOffers)
      setHasCalledRefundTransactions(true)
    }
  }, [refundTransactions, declinedOffers, setHasCalledRefundTransactions, hasCalledRefundTransactions])

  return <>{children}</>
}

export default RefundDeclinedOffers
