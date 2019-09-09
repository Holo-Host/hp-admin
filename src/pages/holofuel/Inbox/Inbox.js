import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import { TYPE } from 'models/Transaction'
import Header from 'components/holofuel/Header'
import Button from 'components/holofuel/Button'
import './Inbox.module.css'
import cx from 'classnames'

export default function Inbox () {
  const { data: { holofuelActionableTransactions: transactions = [] } } = useQuery(HolofuelActionableTransactionsQuery)

  const isTransactionsEmpty = isEmpty(transactions)

  const pageTitle = `Inbox${isTransactionsEmpty ? '' : ` (${transactions.length})`}`

  return <React.Fragment>
    <Header title={pageTitle} />

    {!isTransactionsEmpty && <div styleName='transaction-list'>
      {transactions.map(transaction => <TransactionRow
        transaction={transaction}
        key={transaction.id} />)}
    </div>}

  </React.Fragment>
}

function TransactionRow ({ transaction }) {
  const timestamp = '2 days ago'
  const counterparty = transaction.counterparty.slice(-6)
  const story = transaction.type === TYPE.offer ? ' is offering' : ' is requesting'
  const notes = 'For the pizza'
  const amount = transaction.amount

  return <div styleName='transaction-row'>
    <div>{timestamp}</div>
    <div styleName='description-cell'>
      <div><span styleName='counterparty'>{counterparty}</span>{story}</div>
      <div styleName='notes'>{notes}</div>
    </div>
    <div styleName={cx('amount', { debit: transaction.type === TYPE.request })}>{amount} HF</div>
    <div styleName='actions'>
      {transaction.type === TYPE.offer && <AcceptButton />}
      {transaction.type === TYPE.request && <PayButton />}
      <Button>Reject</Button>
    </div>
  </div>
}

function AcceptButton () {
  return <Button>Accept</Button>
}

function PayButton () {
  return <Button>Pay</Button>
}
