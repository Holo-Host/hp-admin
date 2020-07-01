import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { useHistory, Link } from 'react-router-dom'
import { isEmpty, get, isNil } from 'lodash/fp'
import useConnectionContext from 'holofuel/contexts/useConnectionContext'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import HolofuelCompletedTransactionsQuery from 'graphql/HolofuelCompletedTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import { DIRECTION } from 'models/Transaction'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Loading from 'components/Loading'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import HashAvatar from 'components/HashAvatar'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import './Home.module.css'
import { presentAgentId, presentHolofuelAmount, useLoadingFirstTime } from 'utils'
import { caribbeanGreen } from 'utils/colors'
import { OFFER_REQUEST_PATH, HISTORY_PATH } from 'holofuel/utils/urls'

const DisplayBalance = ({ ledgerLoading, holofuelBalance }) => {
  if (ledgerLoading || isNaN(holofuelBalance)) return <>-- TF</>
  else return <>{presentHolofuelAmount(holofuelBalance)} TF</>
}

export default function Home () {
  const { data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: loadingTransactions, data: { holofuelCompletedTransactions: transactions = [] } = {} } = useQuery(HolofuelCompletedTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })

  const { isConnected } = useConnectionContext()
  const { newMessage } = useFlashMessageContext()
  const { setCurrentUser, currentUser } = useCurrentUserContext()

  useEffect(() => {
    if (!isEmpty(holofuelUser)) {
      setCurrentUser(holofuelUser)
    }
  }, [holofuelUser, setCurrentUser])

  useEffect(() => {
    if (!isConnected) {
      newMessage('Checking connection to your Holochain Conductor...', 0)
    } else if (isConnected) {
      newMessage('', 0)
    }
  }, [isConnected, newMessage])

  const greeting = !isEmpty(get('nickname', currentUser)) ? `Hi ${currentUser.nickname}!` : 'Hi!'

  const isTransactionsEmpty = isEmpty(transactions)
  const firstSixTransactions = transactions.slice(0, 6)

  const history = useHistory()
  const goToOfferRequest = () => history.push(OFFER_REQUEST_PATH)

  const isLoadingFirstPendingTransactions = useLoadingFirstTime(isConnected && loadingTransactions)

  return <PrimaryLayout headerProps={{ title: 'Test Fuel Home' }}>
    <div styleName='container'>
      <div styleName='backdrop' />
      <div styleName='avatar'>
        <CopyAgentId agent={currentUser} isMe>
          <HashAvatar seed={currentUser.id} size={48} />
        </CopyAgentId>
      </div>
      <h2 styleName='greeting'>{greeting}</h2>

      <div styleName='balance-and-transactions'>
        <Link to={HISTORY_PATH} styleName='balance-link'>
          <div styleName='balance'>
            <h4 styleName='balance-label'>
              Current Balance
            </h4>
            <div styleName='balance-row'>
              <div styleName='balance-padding' />
              <div styleName='balance-amount'>
                <DisplayBalance
                  ledgerLoading={isNil(holofuelBalance) && ledgerLoading}
                  holofuelBalance={holofuelBalance}
                />
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

          {isLoadingFirstPendingTransactions && <div styleName='transactions-empty'>
            <Loading />
          </div>}

          {!isLoadingFirstPendingTransactions && isTransactionsEmpty && <div styleName='transactions-empty'>
            {!isConnected ? 'Your transactions cannot be displayed at this time' : 'You have no recent transactions'}
          </div>}

          {!isTransactionsEmpty && <h2 styleName='transactions-label'>Recent Transactions</h2>}

          {!isTransactionsEmpty && <div styleName='transaction-list'>
            {firstSixTransactions.map(transaction => <TransactionRow
              transaction={transaction}
              key={transaction.id}
            />)}
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
