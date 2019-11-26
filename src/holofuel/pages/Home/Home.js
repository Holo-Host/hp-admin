import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { useHistory, Link } from 'react-router-dom'
import { isEmpty, get, uniqBy } from 'lodash/fp'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { DIRECTION } from 'models/Transaction'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import Button from 'holofuel/components/Button'
import HashAvatar from 'components/HashAvatar'
import './Home.module.css'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { OFFER_PATH, REQUEST_PATH, HISTORY_PATH } from 'holofuel/utils/urls'

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

export default function Home () {
  const { data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const greeting = !isEmpty(get('nickname', holofuelUser)) ? `Hi ${holofuelUser.nickname}!` : 'Hi!'

  const { transactions } = useTransactionsWithCounterparties()
  const isTransactionsEmpty = isEmpty(transactions)
  const firstSixTransactions = transactions.slice(0, 6)

  const history = useHistory()
  const goToRequest = () => history.push(REQUEST_PATH)
  const goToOffer = () => history.push(OFFER_PATH)

  const { data: { holofuelLedger: { balance: holofuelBalance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery)

  return <PrimaryLayout headerProps={{ title: 'Home' }}>
    <div styleName='avatar'>
      <CopyAgentId agent={holofuelUser} isMe>
        <HashAvatar seed={holofuelUser.id} size={48} />
      </CopyAgentId>
    </div>
    <div styleName='greeting'>{greeting}</div>
    <div styleName='button-row'>
      <Button onClick={goToOffer} styleName='send-button'>Send</Button>
      <Button onClick={goToRequest} styleName='request-button'>Request</Button>
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
            {presentHolofuelAmount(holofuelBalance)} HF
          </div>
        </div>
      </Link>

      <div styleName='transactions'>
        <div styleName='transactions-label'>Recent Transactions</div>

        {isTransactionsEmpty && <div styleName='transactions-empty'>
          You have no recent transactions
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
