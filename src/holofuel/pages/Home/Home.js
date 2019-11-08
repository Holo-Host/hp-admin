import React from 'react'
import cx from 'classnames'
import { isEmpty, flatten } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import HolofuelWaitingTransactionsQuery from 'graphql/HolofuelWaitingTransactionsQuery.gql'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import { TYPE } from 'models/Transaction'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import Button from 'holofuel/components/Button'
import Modal from 'holofuel/components/Modal'
import './Home.module.css'
import { presentAgentId, presentHolofuelAmount, presentDateAndTime } from 'utils'

function useFetchCounterparties () {
  const { data: { holofuelCompletedTransactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery)
  const { data: { holofuelWaitingTransactions = [] } = {} } = useQuery(HolofuelWaitingTransactionsQuery)
  const { data: { holofuelHistoryCounterparties } = {}, client } = useQuery(HolofuelHistoryCounterpartiesQuery)

  if (holofuelHistoryCounterparties) {
    const filterTransactionsByAgentId = (agent, txListType) => txListType.filter(transaction => transaction.counterparty.id === agent.id)
    const updateTxListCounterparties = (txListType, counterpartyList) => counterpartyList.map(agent => {
      const matchingTx = filterTransactionsByAgentId(agent, txListType)
      return matchingTx.map(transaction => { Object.assign(transaction.counterparty, agent); return transaction })
    })

    // Cache Write/Update for HolofuelCompletedTransactionsQuery
    const newCompletedTxList = flatten(updateTxListCounterparties(holofuelCompletedTransactions, holofuelHistoryCounterparties))
    client.writeQuery({
      query: HolofuelCompletedTransactionsQuery,
      data: {
        holofuelCompletedTransactions: newCompletedTxList
      }
    })

    // Cache Write/Update for HolofuelWaitingTransactionsQuery
    const newWaitingTxList = flatten(updateTxListCounterparties(holofuelWaitingTransactions, holofuelHistoryCounterparties))
    client.writeQuery({
      query: HolofuelWaitingTransactionsQuery,
      data: {
        holofuelWaitingTransactions: newWaitingTxList
      }
    })
  }
}

export default function Home () {
  const { data: { holofuelCompletedTransactions: transactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery)
  useFetchCounterparties()

  const isTransactionsEmpty = isEmpty(transactions)

  const pageTitle = `Home${isTransactionsEmpty ? '' : ` (${transactions.length})`}`

  return <PrimaryLayout headerProps={{ title: pageTitle }} inboxCount={transactions.length}>

    {!isTransactionsEmpty && <div styleName='transaction-list'>
      {transactions.map(transaction => <TransactionRow
        transaction={transaction}
        role='list'
        key={transaction.id} />)}
    </div>}
  </PrimaryLayout>
}

export function TransactionRow ({ transaction }) {
  const { counterparty, amount, type, timestamp, notes } = transaction

  const isOffer = type === TYPE.offer
  const isRequest = !isOffer

  const { date, time } = presentDateAndTime(timestamp)

  const story = isOffer ? ' is offering' : ' is requesting'

  return <div styleName='transaction-row' role='listitem'>
    <div styleName='date-time'>
      <div styleName='date'>
        {date}
      </div>
      <div styleName='time'>
        {time}
      </div>
    </div>
    <div styleName='description-cell'>
      <div styleName='story'><span styleName='counterparty'>
        <CopyAgentId agent={counterparty}>
          {counterparty.nickname || presentAgentId(counterparty.id)}
        </CopyAgentId>
      </span>{story}</div>
      <div styleName='notes'>{notes}</div>
    </div>
    <AmountCell amount={amount} isRequest={isRequest} />
  </div>
}

function AmountCell ({ amount, isRequest }) {
  const amountDisplay = isRequest ? `(${presentHolofuelAmount(amount)})` : presentHolofuelAmount(amount)
  return <div styleName={cx('amount', { debit: isRequest })}>{amountDisplay}</div>
}
