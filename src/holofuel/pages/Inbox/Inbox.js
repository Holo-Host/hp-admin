import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { isEmpty, isEqual, remove } from 'lodash/fp'
import { useQuery } from '@apollo/react-hooks'
import MyHolofuelUserQuery from 'graphql/MyHolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import useConnectionContext from 'holofuel/contexts/useConnectionContext'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import useHiddenTransactionsContext from 'holofuel/contexts/useHiddenTransactionsContext'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import ConfirmationModal from './ConfirmationModal'
import OneTimeEducationModal from 'holofuel/components/OneTimeEducationModal'
import Jumbotron from 'holofuel/components/Jumbotron'
import NullStateMessage from 'holofuel/components/NullStateMessage'
import PageDivider from 'holofuel/components/PageDivider'
import HashAvatar from 'components/HashAvatar'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import ToolTip from 'holofuel/components/ToolTip'
import Loading from 'components/Loading'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import ForwardIcon from 'components/icons/ForwardIcon'
import './Inbox.module.css'
import { POLLING_INTERVAL_GENERAL, presentAgentId, presentHolofuelAmount, presentTruncatedAmount, useLoadingFirstTime, partitionByDate } from 'utils'
import { caribbeanGreen } from 'utils/colors'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'
import { TYPE, STATUS, DIRECTION, shouldShowTransactionInInbox } from 'models/Transaction'

const timeoutErrorMessage = 'Timed out waiting for transaction confirmation from counterparty, will retry later'

function useUpdatedTransactionLists () {
  const { hiddenTransactionIds } = useHiddenTransactionsContext()
  const { isConnected } = useConnectionContext()

  const { loading: allActionableLoading, data: { holofuelActionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: allRecentLoading, data: { holofuelNonPendingTransactions = [] } = {} } = useQuery(HolofuelNonPendingTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: POLLING_INTERVAL_GENERAL })

  const updatedDisplayableActionable = holofuelActionableTransactions.filter(actionableTx => shouldShowTransactionInInbox(actionableTx, hiddenTransactionIds))

  // we don't show declined offers because they're handled automatically in the background (see PrimaryLayout.js)
  const updatedDeclinedTransactions = holofuelActionableTransactions.filter(actionableTx => actionableTx.status === STATUS.declined)
  const updatedNonPendingTransactions = holofuelNonPendingTransactions.concat(updatedDeclinedTransactions)

  const actionableLoadingFirstTime = useLoadingFirstTime(isConnected && allActionableLoading)
  const recentLoadingFirstTime = useLoadingFirstTime(isConnected && allRecentLoading)

  return {
    actionableTransactions: updatedDisplayableActionable,
    recentTransactions: updatedNonPendingTransactions,
    declinedTransactions: updatedDeclinedTransactions,
    actionableLoading: actionableLoadingFirstTime,
    recentLoading: recentLoadingFirstTime
  }
}

const VIEW = {
  actionable: 'actionable',
  recent: 'recent'
}

export default function Inbox ({ history: { push } }) {
  const { data: { myHolofuelUser = {} } = {} } = useQuery(MyHolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })
  const { setCurrentUser } = useCurrentUserContext()
  const { isConnected } = useConnectionContext()

  // landing page setup: set the currentUser app context upon load
  useEffect(() => {
    if (!isEmpty(myHolofuelUser)) {
      setCurrentUser(myHolofuelUser)
    }
  }, [myHolofuelUser, setCurrentUser])

  const [inboxView, setInboxView] = useState(VIEW.actionable)
  const { actionableTransactions, recentTransactions, actionableLoading, recentLoading } = useUpdatedTransactionLists(inboxView)

  const [userMessage, setUserMessage] = useState('')
  const { newMessage } = useFlashMessageContext()

  useEffect(() => {
    if (!isEmpty(userMessage)) {
      newMessage(userMessage, 5000)
    } else {
      newMessage('', 0)
    }
  }, [userMessage, newMessage])

  const defaultConfirmationModalProperties = {
    shouldDisplay: false,
    transaction: {},
    action: '',
    onConfirm: () => {}
  }
  const [confirmationModalProperties, setConfirmationModalProperties] = useState(defaultConfirmationModalProperties)

  const [openDrawerId, setOpenDrawerId] = useState()

  const viewButtons = [{ view: VIEW.actionable, label: 'To-Do' }, { view: VIEW.recent, label: 'Activity' }]
  let displayTransactions = []
  let isDisplayLoading
  switch (inboxView) {
    case VIEW.actionable:
      displayTransactions = actionableTransactions
      isDisplayLoading = actionableLoading
      break
    case VIEW.recent:
      displayTransactions = recentTransactions
      isDisplayLoading = recentLoading
      break
    default:
      throw new Error('Invalid inboxView: ' + inboxView)
  }

  const displayBalance = (isEmpty(holofuelBalance) && ledgerLoading) || !isConnected ? '-- TF' : `${presentHolofuelAmount(holofuelBalance)} TF`

  const isDisplayTransactionsEmpty = isEmpty(displayTransactions)
  const partitionedTransactions = partitionByDate(displayTransactions).filter(({ transactions }) => !isEmpty(transactions))

  const [areActionsPaused, setAreActionsPaused] = useState(false)

  return <PrimaryLayout headerProps={{ title: 'Inbox' }}>
    <Jumbotron
      className='inbox-header'
      title={displayBalance}
      titleSuperscript='Current balance'
    >
      <Button
        styleName='new-transaction-button'
        variant='green'
        onClick={() => push(OFFER_REQUEST_PATH)}
      >
        <PlusInDiscIcon styleName='plus-in-disc' color={caribbeanGreen} backgroundColor='white' />
        <div styleName='button-text'>New Transaction</div>
      </Button>

      <div>
        {viewButtons.map(button =>
          <Button
            styleName={button.view === inboxView ? 'view-button-selected' : 'view-button'}
            onClick={() => setInboxView(VIEW[button.view])}
            dataTestId={`${button.view}-transactions`}
            key={button.view}
          >
            {button.label}
          </Button>)}
      </div>
    </Jumbotron>

    {isDisplayTransactionsEmpty && isDisplayLoading && <>
      <Loading styleName='display-loading' />
    </>}

    {isDisplayTransactionsEmpty && !isDisplayLoading && <>
      <NullStateMessage
        styleName='null-state-message'
        message={!isConnected
          ? 'Your transactions cannot be displayed at this time'
          : inboxView === VIEW.actionable
            ? 'You have no pending offers or requests'
            : 'You have no recent activity'}>
        <div onClick={() => push(OFFER_REQUEST_PATH)}>
          <PlusInDiscIcon styleName='null-add-icon' backgroundColor={caribbeanGreen} />
        </div>
      </NullStateMessage>
    </>}

    {!isDisplayTransactionsEmpty && <div className='transaction-by-date-list'>
      {partitionedTransactions.map(({ label: dateLabel, transactions }) => <Partition
        key={dateLabel}
        dateLabel={dateLabel}
        transactions={transactions}
        isActionable={inboxView === VIEW.actionable}
        setConfirmationModalProperties={setConfirmationModalProperties}
        openDrawerId={openDrawerId}
        setOpenDrawerId={setOpenDrawerId}
        areActionsPaused={areActionsPaused}
        setAreActionsPaused={setAreActionsPaused}
        setUserMessage={setUserMessage} />)}
    </div>}

    {inboxView === VIEW.actionable && actionableTransactions.length > 0 && <OneTimeEducationModal
      id='inbox'
      message={<InboxEducationMessage />}
    />}

    <ConfirmationModal
      setConfirmationModalProperties={setConfirmationModalProperties}
      confirmationModalProperties={confirmationModalProperties || {}} />
  </PrimaryLayout>
}

function InboxEducationMessage () {
  return <>
    <div styleName='message'>
      <h2 styleName='message-paragraph'>You have offers or requests for payment needing your attention.</h2>
      <h2 styleName='message-paragraph'>When you accept or decline an item, it will begin processing. Depending on timing, it may show as pending or processing.</h2>
      <h2 styleName='message-paragraph'>Once the transaction has been saved to both peer source chains it will update the display in your history and activity views.</h2>
    </div>
  </>
}

export function Partition ({ dateLabel, transactions, setConfirmationModalProperties, isActionable, openDrawerId, setOpenDrawerId, areActionsPaused, setAreActionsPaused, setUserMessage }) {
  const { hiddenTransactionIds, setHiddenTransactionIds } = useHiddenTransactionsContext()

  const manageHideTransactionWithId = (id, shouldHide) => {
    if (shouldHide) {
      setHiddenTransactionIds(hiddenTransactionIds.concat([id]))
    } else {
      setHiddenTransactionIds(remove(id, hiddenTransactionIds))
    }
  }

  const transactionIsVisible = id => !hiddenTransactionIds.includes(id)
  if (isEqual(hiddenTransactionIds, transactions.map(transaction => transaction.id))) return null

  return <React.Fragment>
    <PageDivider title={dateLabel} />
    <div styleName='transaction-list'>
      {transactions.map(transaction => transactionIsVisible(transaction.id) && <TransactionRow
        role='list'
        key={transaction.id}
        transaction={transaction}
        setConfirmationModalProperties={setConfirmationModalProperties}
        isActionable={isActionable}
        hideTransaction={shouldHide => manageHideTransactionWithId(transaction.id, shouldHide)}
        openDrawerId={openDrawerId}
        setOpenDrawerId={setOpenDrawerId}
        areActionsPaused={areActionsPaused}
        setAreActionsPaused={setAreActionsPaused}
        setUserMessage={setUserMessage} />)}
    </div>
  </React.Fragment>
}

export function TransactionRow ({ transaction, setConfirmationModalProperties, isActionable, hideTransaction, areActionsPaused, setAreActionsPaused, openDrawerId, setOpenDrawerId, setUserMessage }) {
  const { id, counterparty, amount, type, status, direction, notes, isPayingARequest, inProcess, isStale } = transaction

  if (isStale) {
    setUserMessage('Transaction could not be validated and will never pass. Transaction is now stale.')
  }

  const isDrawerOpen = id === openDrawerId
  const setIsDrawerOpen = state => state ? setOpenDrawerId(id) : setOpenDrawerId(null)

  const agent = counterparty

  const isPayment = (isPayingARequest && status === STATUS.pending)
  const isOffer = type === TYPE.offer
  const isRequest = type === TYPE.request
  const isOutgoing = direction === DIRECTION.outgoing
  const isDeclined = status === STATUS.declined

  let story
  if (isActionable && !isDeclined) {
    if (isOffer) {
      if (isPayingARequest) {
        story = ' is paying your request'
      } else {
        story = ' is offering'
      }
    } else {
      story = ' is requesting'
    }
  } else if (isDeclined && isOffer) {
    story = 'has declined'
  }

  let fullNotes
  if (isDeclined) {
    fullNotes = isOffer ? ` Declined Offer${notes ? `: ${notes}` : ''}` : ` Declined Request${notes ? `: ${notes}` : ''}`
  } else fullNotes = notes

  const [highlightGreen, setHighlightGreen] = useState(false)
  const [highlightRed, setHighlightRed] = useState(false)
  const [highlightYellow, setHighlightYellow] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (agent.agentAddress === null) return null

  const onSignalInProcessEvent = () => {
    setHighlightYellow(true)
    setIsDisabled(true)
    setTimeout(() => {
      setHighlightYellow(false)
    }, 5000)
  }

  const onConfirmGreen = () => {
    setHighlightYellow(false)
    setHighlightGreen(true)
    setIsDisabled(true)
    hideTransaction(false)
    setTimeout(() => {
      setHighlightGreen(false)
      hideTransaction(true)
    }, 5000)
  }

  const onConfirmRed = () => {
    setHighlightRed(true)
    setIsDisabled(true)
    hideTransaction(false)
    setTimeout(() => {
      setHighlightRed(false)
      hideTransaction(true)
    }, 5000)
  }

  const setIsLoadingAndPaused = state => {
    setIsLoading(state)
    setAreActionsPaused(state)
  }

  const commonModalProperties = {
    shouldDisplay: true,
    transaction,
    setIsLoading: setIsLoadingAndPaused,
    onSignalInProcessEvent
  }

  const showAcceptModal = () =>
    setConfirmationModalProperties({ ...commonModalProperties, action: 'acceptOffer', onConfirm: onConfirmGreen })

  const showPayModal = () =>
    setConfirmationModalProperties({ ...commonModalProperties, action: 'pay', onConfirm: onConfirmGreen })

  const showDeclineModal = () =>
    setConfirmationModalProperties({ ...commonModalProperties, action: 'decline', onConfirm: onConfirmRed })

  const agentNameDisplay = isEmpty(agent.nickname) ? presentAgentId(agent.agentAddress) : agent.nickname

  /* eslint-disable-next-line quote-props */
  return <div styleName={cx('transaction-row', { 'transaction-row-drawer-open': isDrawerOpen }, { 'annulled': isDeclined }, { disabled: isDisabled }, { highlightGreen }, { 'highlightRed': highlightRed || isStale }, { 'highlightYellow': highlightYellow || isPayment }, { inProcess })} role='listitem'>
    <div styleName='avatar'>
      <CopyAgentId agent={agent}>
        <HashAvatar seed={agent.agentAddress} size={32} data-testid='hash-icon' />
      </CopyAgentId>
    </div>

    <div styleName='description-cell'>
      <div><span styleName='counterparty'>
        <CopyAgentId agent={agent}>
          {agentNameDisplay}
        </CopyAgentId>
      </span><p styleName='story'>{story}</p>
      </div>
      <div styleName='notes'>{fullNotes}</div>
    </div>

    <div styleName='amount-cell'>
      <AmountCell
        amount={amount}
        isDrawerOpen={isDrawerOpen}
        isRequest={isRequest}
        isOffer={isOffer}
        isActionable={isActionable}
        isOutgoing={isOutgoing}
        isDeclined={isDeclined}
      />
    </div>

    {isLoading && !inProcess && <Loading styleName='transaction-row-loading' width={20} height={20} />}

    {inProcess && !highlightGreen && <ToolTip toolTipText={timeoutErrorMessage}>
      <h4 styleName='alert-msg'>{isPayment ? 'incoming payment pending' : 'processing...'}</h4>
    </ToolTip>}

    {isStale && <ToolTip toolTipText='Validation failed. Transaction is stale'>
      <h4 styleName='alert-msg'>stale transaction</h4>
    </ToolTip>}

    {isActionable && !isLoading && !isPayment && !isDisabled && !inProcess && <>
      <RevealActionsButton
        isDrawerOpen={isDrawerOpen}
        openDrawer={() => setIsDrawerOpen(true)}
        closeDrawer={() => setIsDrawerOpen(false)}
        areActionsPaused={areActionsPaused}
      />
      {!isPayment && !inProcess && <ActionOptions
        isOffer={isOffer}
        isRequest={isRequest}
        transaction={transaction}
        showAcceptModal={showAcceptModal}
        showPayModal={showPayModal}
        showDeclineModal={showDeclineModal}
        isDeclined={isDeclined}
        isDrawerOpen={isDrawerOpen}
        areActionsPaused={areActionsPaused}
      />}
    </>}
  </div>
}

function RevealActionsButton ({ openDrawer, closeDrawer, isDrawerOpen, areActionsPaused }) {
  const onClick = isDrawerOpen
    ? closeDrawer
    : areActionsPaused
      ? () => {}
      : openDrawer

  const iconColor = areActionsPaused ? '#ced5de' : '#2c405a'
  return <div onClick={onClick} styleName={cx('reveal-actions-button', 'drawer', { 'drawer-close': !isDrawerOpen })} data-testid='reveal-actions-button'>
    <ForwardIcon styleName={cx('forward-icon')} color={iconColor} dataTestId='forward-icon' />
  </div>
}

function ActionOptions ({ isOffer, isRequest, transaction, showAcceptModal, showPayModal, showDeclineModal, isDeclined, isDrawerOpen }) {
  return <aside styleName={cx('drawer', { 'drawer-close': !isDrawerOpen })}>
    <div styleName='actions'>
      <DeclineButton isDeclined={isDeclined} transaction={transaction} showDeclineModal={showDeclineModal} />
      {!isDeclined && isOffer && <AcceptButton transaction={transaction} showAcceptModal={showAcceptModal} />}
      {!isDeclined && isRequest && <PayButton transaction={transaction} showPayModal={showPayModal} />}
    </div>
  </aside>
}

function AmountCell ({ amount, isDrawerOpen, isRequest, isOffer, isActionable, isOutgoing, isDeclined }) {
  let amountDisplay
  if (isActionable) {
    amountDisplay = isRequest ? `(${presentHolofuelAmount(amount)})` : presentHolofuelAmount(amount)
  } else if (isDeclined) {
    amountDisplay = isRequest ? `+${presentHolofuelAmount(amount)}` : `-${presentHolofuelAmount(amount)}`
  } else {
    amountDisplay = isOutgoing ? `-${presentHolofuelAmount(amount)}` : `+${presentHolofuelAmount(amount)}`
  }

  if (isDrawerOpen) {
    amountDisplay = presentTruncatedAmount(amountDisplay)
  }

  return <div styleName={cx('amount', { debit: (isRequest && isActionable) || (isOffer && isDeclined) }, { credit: (isOffer && isActionable) || (isRequest && isDeclined) }, { removed: isDeclined })}>
    {amountDisplay} TF
  </div>
}

function AcceptButton ({ showAcceptModal }) {
  return <Button
    onClick={showAcceptModal}
    styleName='accept-button'
  >
    <p>Accept</p>
  </Button>
}

function PayButton ({ showPayModal }) {
  return <Button
    onClick={showPayModal}
    styleName='accept-button'
  >
    {/* NB: Not a typo. This is to 'Accept Request for Payment' */}
    <p>Accept</p>
  </Button>
}

function DeclineButton ({ showDeclineModal }) {
  return <Button
    onClick={showDeclineModal}
    styleName='reject-button'
  >
    <p>Decline</p>
  </Button>
}
