import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { useHistory, Link } from 'react-router-dom'
import { isEmpty, get } from 'lodash/fp'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { DIRECTION } from 'models/Transaction'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import HashAvatar from 'components/HashAvatar'
import './Home.module.css'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { caribbeanGreen } from 'utils/colors'
import { OFFER_REQUEST_PATH, HISTORY_PATH } from 'holofuel/utils/urls'

const DisplayBalance = ({ ledgerLoading, holofuelBalance }) => {
  if (ledgerLoading) return <>-- TF</>
  else return <>{presentHolofuelAmount(holofuelBalance)} TF</>
}

export default function Home () {
  const { data: { holofuelCompletedTransactions: transactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })
  const { data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const greeting = !isEmpty(get('nickname', holofuelUser)) ? `Hi ${holofuelUser.nickname}!` : 'Hi!'

  const isTransactionsEmpty = isEmpty(transactions)
  const firstSixTransactions = transactions.slice(0, 6)

  const history = useHistory()
  const goToOfferRequest = () => history.push(OFFER_REQUEST_PATH)

  return <PrimaryLayout headerProps={{ title: 'Home' }}>
    <div styleName='container'>
      <div styleName='backdrop' />
      <div styleName='avatar'>
        <CopyAgentId agent={holofuelUser} isMe>
          <HashAvatar seed={holofuelUser.id} size={48} />
        </CopyAgentId>
      </div>
      <h2 styleName='greeting'>{greeting}</h2>

      <div styleName='balance-and-transactions'>
        <Link to={HISTORY_PATH} styleName='balance-link'>
          <div styleName='balance'>
            <h4 styleName='balance-label'>
              Balance
            </h4>
            <div styleName='balance-row'>
              <div styleName='balance-padding' />
              <div styleName='balance-amount'>
                <DisplayBalance
                  ledgerLoading={ledgerLoading}
                  holofuelBalance={holofuelBalance} />
              </div>
              <div styleName='balance-arrow-wrapper'>
                <ArrowRightIcon color='white' styleName='balance-arrow' />
              </div>
            </div>
          </div>
        </Link>

        <button onClick={goToOfferRequest} styleName='new-transaction-button'>
          <PlusInDiscIcon styleName='plus-icon' color='white' backgroundColor={caribbeanGreen} />
          <div styleName='new-transaction-text'>New Transaction</div>
        </button>

        <div styleName='transactions'>

          {isTransactionsEmpty && <div styleName='transactions-empty'>
            You have no offers or requests
          </div>}

          {!isTransactionsEmpty && <h2 styleName='transactions-label'>Recent Transactions</h2>}

          {!isTransactionsEmpty && <div styleName='transaction-list'>
            {firstSixTransactions.map(transaction => <TransactionRow
              transaction={transaction}
              key={transaction.id} />)}
          </div>}
        </div>
      </div>
    </div>
  </PrimaryLayout>
}

export function TransactionRow ({ transaction }) {
  const { counterparty, amount, notes, direction } = transaction

  const presentedAmount = direction === DIRECTION.incoming
    ? `${presentHolofuelAmount(amount)}`
    : `- ${presentHolofuelAmount(amount)}`

  return <div styleName='transaction-row' role='listitem'>
    <div styleName='counterparty-amount-row'>
      <div styleName='counterparty'>
        <CopyAgentId agent={counterparty}>
          {counterparty.nickname || presentAgentId(counterparty.id)}
        </CopyAgentId>
      </div>
      <div styleName='amount'>
        {presentedAmount} TF
      </div>
    </div>
    <div styleName='notes'>{notes}</div>
  </div>
}
