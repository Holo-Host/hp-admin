import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty, get } from 'lodash/fp'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'

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
  const counterparty = (get('counterparty', transaction) || '').slice(-6)
  const isOffer = transaction.type === TYPE.offer
  const isRequest = !isOffer

  const story = isOffer ? ' is offering' : ' is requesting'
  const notes = 'For the pizza'
  const amount = transaction.amount
  const { id } = transaction

  return <div styleName='transaction-row'>
    <div>{timestamp}</div>
    <div styleName='description-cell'>
      <div><span styleName='counterparty'>{counterparty}</span>{story}</div>
      <div styleName='notes'>{notes}</div>
    </div>
    <div styleName={cx('amount', { debit: isRequest })}>{amount} HF</div>
    <div styleName='actions'>
      {isOffer && <AcceptButton transaction={transaction} />}
      {isRequest && <PayButton transaction={transaction} />}
      <RejectButton transaction={transaction} />
    </div>
  </div>
}

// these are pulled out into custom hooks ready for if we need to move them to their own file for re-use elsewhere
function useAcceptOffer (id) {
  const [acceptOffer] = useMutation(HolofuelAcceptOfferMutation)
  return () => acceptOffer({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    }]
  })
}

function AcceptButton ({ transaction: { id } }) {
  const acceptOffer = useAcceptOffer(id)
  return <Button
    onClick={acceptOffer}>
    Accept
  </Button>
}

function useOffer (id, amount, counterparty) {
  const [offer] = useMutation(HolofuelOfferMutation)
  return () => offer({
    variables: { amount, counterparty, requestId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    }]
  })
}

function PayButton ({ transaction: { id, amount, counterparty } }) {
  const pay = useOffer(id, amount, counterparty)
  return <Button
    onClick={pay}>
    Pay
  </Button>
}

function RejectButton ({ transaction: { id } }) {
  return <Button onClick={() => console.log('reject transaction', id)}>Reject</Button>
}
