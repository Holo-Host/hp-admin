import React, { useEffect, useCallback } from 'react' // useState,
import { useQuery } from '@apollo/react-hooks'
import { useHistory, Link } from 'react-router-dom'
import { isEmpty, get, uniqBy } from 'lodash/fp'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { DIRECTION } from 'models/Transaction'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import Button from 'holofuel/components/Button'
import HashAvatar from 'components/HashAvatar'
import './Home.module.css'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { OFFER_REQUEST_PATH, HISTORY_PATH } from 'holofuel/utils/urls'

const declinedTransactionNotice = 'Notice: Hey there. Looks like one or more of your initated transactions has been declined. Please visit your transaction Inbox to view and/or cancel your pending transaction.'

function useTransactionsWithCounterparties () {
  const { data: { holofuelUser: whoami = {} } = {} } = useQuery(HolofuelUserQuery)
  const { data: { holofuelHistoryCounterparties = [] } = {} } = useQuery(HolofuelHistoryCounterpartiesQuery)
  const { data: { holofuelCompletedTransactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery)

  const updateCounterparties = (transactions, counterparties) => transactions.map(transaction => ({
    ...transaction,
    counterparty: counterparties.find(counterparty => counterparty.id === transaction.counterparty.id) || transaction.counterparty
  }))

  const allCounterparties = uniqBy('id', holofuelHistoryCounterparties.concat([whoami]))

  const updatedCompletedTransactions = updateCounterparties(holofuelCompletedTransactions, allCounterparties)

  return {
    transactions: updatedCompletedTransactions
  }
}

const DisplayBalance = ({ ledgerLoading, holofuelBalance }) => {
  if (ledgerLoading) return <>-- TF</>
  else return <>{presentHolofuelAmount(holofuelBalance)} TF</>
}

export default function Home () {
  const { data: { holofuelActionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'network-only' })
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'network-only' })
  const { data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const greeting = !isEmpty(get('nickname', holofuelUser)) ? `Hi ${holofuelUser.nickname}!` : 'Hi!'

  const { transactions } = useTransactionsWithCounterparties()
  const isTransactionsEmpty = isEmpty(transactions)
  const firstSixTransactions = transactions.slice(0, 6)

  const history = useHistory()
  const goToOfferRequest = () => history.push(OFFER_REQUEST_PATH)

  const { newMessage } = useFlashMessageContext()

  const filterActionableTransactionsByStatus = useCallback(status => holofuelActionableTransactions.filter(actionableTx => actionableTx.status === status), [holofuelActionableTransactions])

  useEffect(() => {
    if (!isEmpty(filterActionableTransactionsByStatus('declined'))) {
      newMessage(declinedTransactionNotice)
    }
  }, [filterActionableTransactionsByStatus, newMessage])

  return <PrimaryLayout headerProps={{ title: 'Home' }}>
    <div styleName='avatar'>
      <CopyAgentId agent={holofuelUser} isMe>
        <HashAvatar seed={holofuelUser.id} size={48} />
      </CopyAgentId>
    </div>
    <div styleName='greeting'>{greeting}</div>
    <div styleName='button-row'>
      <Button onClick={goToOfferRequest} styleName='send-button'>Send / Request</Button>
    </div>

    <div styleName='balance-and-transactions'>
      <Link to={HISTORY_PATH} styleName='balance-link'>
        <div styleName='balance'>
          <div styleName='balance-header'>
            <div styleName='balance-label'>
              Available Balance
            </div>
            <div styleName='balance-arrow'>
              >
            </div>
          </div>
          <div styleName='balance-amount'>
            <DisplayBalance
              ledgerLoading={ledgerLoading}
              holofuelBalance={holofuelBalance} />
          </div>
        </div>
      </Link>

      <div styleName='transactions'>
        <div styleName='transactions-label'>Recent Transactions</div>

        {isTransactionsEmpty && <div styleName='transactions-empty'>
          You have no offers or requests
        </div>}

        {!isTransactionsEmpty && <div styleName='transaction-list'>
          {firstSixTransactions.map(transaction => <TransactionRow
            transaction={transaction}
            key={transaction.id} />)}
        </div>}
      </div>

    </div>
  </PrimaryLayout>
}

export function TransactionRow ({ transaction }) {
  const { counterparty, amount, notes, direction } = transaction

  const presentedAmount = direction === DIRECTION.incoming
    ? `+ ${presentHolofuelAmount(amount)}`
    : `- ${presentHolofuelAmount(amount)}`

  return <div styleName='transaction-row' role='listitem'>
    <div styleName='counterparty-amount-row'>
      <div styleName='counterparty'>
        <CopyAgentId agent={counterparty}>
          {counterparty.nickname || presentAgentId(counterparty.id)}
        </CopyAgentId>
      </div>
      <div styleName='amount'>
        {presentedAmount}
      </div>
    </div>
    <div styleName='notes'>{notes}</div>
  </div>
}
