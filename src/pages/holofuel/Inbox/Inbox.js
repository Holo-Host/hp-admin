import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import Header from 'components/holofuel/Header'
import './Inbox.module.css'

export default function Inbox () {
  const { data: { holofuelActionableTransactions: transactions = [] } } = useQuery(HolofuelActionableTransactionsQuery)

  console.log('transactions', transactions)

  return <React.Fragment>
    <Header title='Inbox' />

    {!isEmpty(transactions) && <div styleName='transaction-list'>
      {transactions.map(transaction => <TransactionRow 
        transaction={transaction}
        key={transaction.id} />)}
    </div>}

  </React.Fragment>
}

export function TransactionRow ({ transaction }) {
  return <div styleName='transaction-row'>
    {transaction.amount}
  </div>
}
