import React, { useContext, useState, useEffect } from 'react'
import cx from 'classnames'
import { isEmpty, isNil, isEqual, remove } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import useConnectionContext from 'holofuel/contexts/useConnectionContext'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import Modal from 'holofuel/components/Modal'
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
import { POLLING_INTERVAL, presentAgentId, presentHolofuelAmount, sliceHash, useLoadingFirstTime, partitionByDate } from 'utils'
import { caribbeanGreen } from 'utils/colors'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'
import { TYPE, STATUS, DIRECTION, shouldShowTransactionInInbox } from 'models/Transaction'
import { userNotification } from 'data-interfaces/HoloFuelDnaInterface'

// TODO: Consult C for UX / copy for this
const timeoutErrorMessage = 'Timed out waiting for transaction confirmation from counterparty, will retry later'

function useOffer () {
  const [offer] = useMutation(HolofuelOfferMutation)
  return ({ id, amount, counterparty, notes }) => offer({
    variables: { amount, counterpartyId: counterparty.id, requestId: id, notes },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

function useAcceptOffer () {
  const [acceptOffer] = useMutation(HolofuelAcceptOfferMutation)
  return ({ id }) => acceptOffer({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

function useDecline () {
  const [decline] = useMutation(HolofuelDeclineMutation)
  return ({ id }) => decline({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

function useCounterparty (agentId) {
  const { loading, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    fetchPolicy: 'cache-and-network',
    variables: { agentId }
  })
  return { holofuelCounterparty, loading }
}

function useUpdatedTransactionLists () {
  const { isConnected } = useConnectionContext()

  const { loading: allActionableLoading, data: { holofuelActionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: allRecentLoading, data: { holofuelNonPendingTransactions = [] } = {} } = useQuery(HolofuelNonPendingTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: POLLING_INTERVAL })

  const updatedDisplayableActionable = holofuelActionableTransactions.filter(shouldShowTransactionInInbox)
  const updatedCanceledTransactions = holofuelActionableTransactions.filter(actionableTx => actionableTx.status === STATUS.canceled)
  // we don't show declined offers because they're handled automatically in the background (see PrimaryLayout.js)
  const updatedDeclinedTransactions = holofuelActionableTransactions.filter(actionableTx => actionableTx.status === STATUS.declined)
  const updatedNonPendingTransactions = holofuelNonPendingTransactions.concat(updatedCanceledTransactions).concat(updatedDeclinedTransactions)

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

const presentTruncatedAmount = (string, number = 15) => {
  if (string.length > number) return `${sliceHash(string, number)}...`
  return sliceHash(string, number)
}

export default function Inbox ({ history: { push } }) {
  const { data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })
  const { currentUser, setCurrentUser } = useCurrentUserContext()
  const { isConnected } = useConnectionContext()

  useEffect(() => {
    if (!isEmpty(holofuelUser)) {
      setCurrentUser(holofuelUser)
    }
  }, [holofuelUser, setCurrentUser])

  const [inboxView, setInboxView] = useState(VIEW.actionable)
  const { actionableTransactions, recentTransactions, actionableLoading, recentLoading } = useUpdatedTransactionLists(inboxView)

  const [userMessage, setUserMessage] = useState('')
  const { newMessage } = useFlashMessageContext()
  if (userNotification !== userMessage) {
    setUserMessage(userNotification)
  }
  if (!isEmpty(userMessage)) {
    newMessage(userMessage, 5000)
  }

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

  const displayBalance = (isNil(holofuelBalance) && ledgerLoading) ? '-- TF' : `${presentHolofuelAmount(holofuelBalance)} TF`

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
          : inboxView === VIEW.actionableLoading
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
        userId={currentUser.id}
        isActionable={inboxView === VIEW.actionable}
        setConfirmationModalProperties={setConfirmationModalProperties}
        openDrawerId={openDrawerId}
        setOpenDrawerId={setOpenDrawerId}
        areActionsPaused={areActionsPaused}
        setAreActionsPaused={setAreActionsPaused} />)}
    </div>}

    <ConfirmationModal
      setConfirmationModalProperties={setConfirmationModalProperties}
      confirmationModalProperties={confirmationModalProperties || {}} />
  </PrimaryLayout>
}

export function Partition ({ dateLabel, transactions, userId, setConfirmationModalProperties, isActionable, openDrawerId, setOpenDrawerId, areActionsPaused, setAreActionsPaused }) {
  const [hiddenTransactionIds, setHiddenTransactionIds] = useState([])

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
        transaction={transaction}
        setConfirmationModalProperties={setConfirmationModalProperties}
        isActionable={isActionable}
        userId={userId}
        hideTransaction={shouldHide => manageHideTransactionWithId(transaction.id, shouldHide)}
        openDrawerId={openDrawerId}
        setOpenDrawerId={setOpenDrawerId}
        areActionsPaused={areActionsPaused}
        setAreActionsPaused={setAreActionsPaused}
        role='list'
        key={transaction.id} />)}
    </div>
  </React.Fragment>
}

export function TransactionRow ({ transaction, setConfirmationModalProperties, isActionable, userId, hideTransaction, areActionsPaused, setAreActionsPaused, openDrawerId, setOpenDrawerId }) {
  const { id, counterparty, amount, type, status, direction, notes, canceledBy, isPayingARequest, inProcess, actioned } = transaction

  const isDrawerOpen = id === openDrawerId
  const setIsDrawerOpen = state => state ? setOpenDrawerId(id) : setOpenDrawerId(null)

  const agent = canceledBy || counterparty

  const isPayment = (isPayingARequest && status === STATUS.pending)
  const isOffer = type === TYPE.offer
  const isRequest = type === TYPE.request
  const isOutgoing = direction === DIRECTION.outgoing
  const isCanceled = status === STATUS.canceled
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
  if (isCanceled) {
    if (canceledBy) {
      story = isOffer
        ? ` Canceled an Offer to ${counterparty.id === userId ? 'you' : (counterparty.nickname || presentAgentId(counterparty.id))}`
        : ` Canceled a Request from ${counterparty.id === userId ? 'you' : (counterparty.nickname || presentAgentId(counterparty.id))}`
    }
    fullNotes = isOffer ? ` Canceled Offer${notes ? `: ${notes}` : ''}` : ` Canceled Request${notes ? `: ${notes}` : ''}`
  } else if (isDeclined) {
    fullNotes = isOffer ? ` Declined Offer${notes ? `: ${notes}` : ''}` : ` Declined Request${notes ? `: ${notes}` : ''}`
  } else fullNotes = notes

  const [highlightGreen, setHighlightGreen] = useState(false)
  const [highlightRed, setHighlightRed] = useState(false)
  const [highlightYellow, setHighlightYellow] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDisplayingInProcess, setIsDisplayingInProcess] = useState(false)

  if (agent.id === null) return null

  if (!inProcess && !highlightGreen && actioned) {
    hideTransaction(true)
  }

  const onTimeout = () => {
    setHighlightYellow(true)
    setIsDisabled(true)
    setTimeout(() => {
      setHighlightRed(false)
    }, 5000)
  }

  if (inProcess && !isDisplayingInProcess) {
    setIsDisplayingInProcess(true)
    onTimeout()
  }

  const onConfirmGreen = () => {
    setHighlightYellow(false)
    setHighlightGreen(true)
    setIsDisabled(true)
    hideTransaction(false)
    setTimeout(() => {
      setHighlightGreen(false)
      setIsDisplayingInProcess(false)
      hideTransaction(true)
    }, 5000)
  }

  const onConfirmRed = () => {
    setHighlightYellow(false)
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
    setIsLoading: setIsLoadingAndPaused
  }

  const showAcceptModal = () =>
    setConfirmationModalProperties({ ...commonModalProperties, action: 'acceptOffer', onConfirm: onConfirmGreen })

  const showPayModal = () =>
    setConfirmationModalProperties({ ...commonModalProperties, action: 'pay', onConfirm: onConfirmGreen })

  const showDeclineModal = () =>
    setConfirmationModalProperties({ ...commonModalProperties, action: 'decline', onConfirm: onConfirmRed })

  const showCancelModal = () =>
    setConfirmationModalProperties({ ...commonModalProperties, action: 'cancel', onConfirm: onConfirmRed })

  /* eslint-disable-next-line quote-props */
  return <div styleName={cx('transaction-row', { 'transaction-row-drawer-open': isDrawerOpen }, { 'annulled': isCanceled || isDeclined }, { disabled: isDisabled }, { highlightGreen }, { highlightRed }, { 'highlightYellow': highlightYellow || isPayment }, { inProcess })} role='listitem'>
    <div styleName='avatar'>
      <CopyAgentId agent={agent}>
        <HashAvatar seed={agent.id} size={32} data-testid='hash-icon' />
      </CopyAgentId>
    </div>

    <div styleName='description-cell'>
      <div><span styleName='counterparty'>
        <CopyAgentId agent={agent}>
          {(agent.id === userId ? `${agent.nickname} (You)` : agent.nickname) || presentAgentId(agent.id)}
        </CopyAgentId>
      </span><p styleName='story'>{story}</p>
      </div>
      <div styleName='notes'>{fullNotes}</div>
    </div>

    <div styleName='amount-cell'>
      <AmountCell
        amount={amount}
        isRequest={isRequest}
        isOffer={isOffer}
        isActionable={isActionable}
        isOutgoing={isOutgoing}
        isDeclined={isDeclined}
        isCanceled={isCanceled}
      />
      {/* BALANCE-BUG: Intentionally commented out until DNA balance bug is resolved. */}
      {/* {isActionable ? <div /> : <div styleName='balance'>{presentBalance}</div>} */}
    </div>

    {isLoading && !inProcess && <Loading styleName='transaction-row-loading' width={20} height={20} />}

    {inProcess && !highlightGreen && <ToolTip toolTipText={timeoutErrorMessage}>
      <h4 styleName='alert-msg'>{isPayment ? 'incoming payment pending' : 'acceptance pending'}</h4>
    </ToolTip>}

    {isActionable && !isLoading && !isPayment && !isDisabled && <>
      <RevealActionsButton
        isDrawerOpen={isDrawerOpen}
        openDrawer={() => setIsDrawerOpen(true)}
        closeDrawer={() => setIsDrawerOpen(false)}
        areActionsPaused={areActionsPaused}
      />
      {!isPayment && !isCanceled && !inProcess && <ActionOptions
        isOffer={isOffer}
        isRequest={isRequest}
        transaction={transaction}
        showAcceptModal={showAcceptModal}
        showPayModal={showPayModal}
        showDeclineModal={showDeclineModal}
        showCancelModal={showCancelModal}
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

function AmountCell ({ amount, isRequest, isOffer, isActionable, isOutgoing, isCanceled, isDeclined }) {
  let amountDisplay
  if (isActionable) {
    amountDisplay = isRequest ? `(${presentTruncatedAmount(presentHolofuelAmount(amount), 15)})` : presentTruncatedAmount(presentHolofuelAmount(amount), 15)
  } else if (isDeclined) {
    amountDisplay = isRequest ? `+${presentTruncatedAmount(presentHolofuelAmount(amount), 15)}` : `-${presentTruncatedAmount(presentHolofuelAmount(amount), 15)}`
  } else {
    amountDisplay = isOutgoing ? `-${presentTruncatedAmount(presentHolofuelAmount(amount), 15)}` : `+${presentTruncatedAmount(presentHolofuelAmount(amount), 15)}`
  }
  return <div styleName={cx('amount', { debit: (isRequest && isActionable) || (isOffer && isDeclined) }, { credit: (isOffer && isActionable) || (isRequest && isDeclined) }, { removed: isDeclined || isCanceled })}>
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

export function ConfirmationModal ({ confirmationModalProperties, setConfirmationModalProperties }) {
  const isWide = useContext(ScreenWidthContext)
  const payTransaction = useOffer()
  const acceptOffer = useAcceptOffer()
  const declineTransaction = useDecline()

  const { newMessage } = useFlashMessageContext()
  const { transaction, action, shouldDisplay, onConfirm, setIsLoading } = confirmationModalProperties

  const { id, amount, type, notes, counterparty = {} } = transaction
  const { loading: loadingCounterparty, holofuelCounterparty } = useCounterparty(counterparty.id)
  const { id: activeCounterpartyId } = holofuelCounterparty

  const counterpartyMessage = loadingCounterparty
    ? <div styleName='counterparty-message'>Verifying active status of your counterparty...<Loading styleName='counterparty-loading' width={15} height={15} /></div>
    : !activeCounterpartyId
      ? <div styleName='counterparty-message'>Your counterparty can't be located on the network. If this error persists, please contact your Peer and confirm the Profile ID referenced is still active.</div>
      : null

  let message, actionHook, actionParams, contentLabel, flashMessage
  switch (action) {
    case 'pay': {
      contentLabel = 'Pay request'
      actionParams = { id, amount, counterparty, notes }
      actionHook = payTransaction
      message = <>
        Accept the request and send {counterparty.nickname || presentAgentId(counterparty.id)} {presentHolofuelAmount(amount)} TF?
      </>
      flashMessage = 'Payment sent succesfully'
      break
    }
    case 'acceptOffer': {
      contentLabel = 'Accept offer'
      actionParams = { id }
      actionHook = acceptOffer
      message = <>
        Accept offer of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.id)}?
      </>
      flashMessage = 'Offer Accepted succesfully'
      break
    }
    case 'decline': {
      contentLabel = `Decline ${type}?`
      actionParams = { id }
      actionHook = declineTransaction
      if (type === 'offer') {
        message = <>
          Decline request for payment of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.id)}?
        </>
      } else {
        message = <>
          Decline offer of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.id)}?
        </>
      }
      flashMessage = `${type.replace(/^\w/, c => c.toUpperCase())} succesfully declined`

      break
    }
    // NB: action === undefined when first loading page && no transaction is yet passed in
    case undefined:
    case '':
    case 'refund':
      break
    default:
      throw new Error(`Modal doesn't recognize action: ${action}`)
  }

  const hideModal = () => {
    setConfirmationModalProperties({ ...confirmationModalProperties, shouldDisplay: false })
  }

  const onYes = () => {
    setIsLoading(true)
    hideModal()
    actionHook(actionParams)
      .then(result => {
        const { data } = result
        if (data.holofuelAcceptOffer && data.holofuelAcceptOffer.type === TYPE.offer && data.holofuelAcceptOffer.status === STATUS.pending) {
          newMessage(timeoutErrorMessage, 5000)
        } else {
          onConfirm()
          newMessage(flashMessage, 5000)
        }
        setIsLoading(false)
      })
      .catch(() => {
        newMessage('Sorry, something went wrong', 5000)
      })
  }

  return <Modal
    contentLabel={contentLabel}
    isOpen={shouldDisplay}
    handleClose={() => hideModal()}
    styleName={cx('modal', { 'modal-desktop': isWide })}
  >
    <div styleName='modal-message'>{message}</div>
    {counterpartyMessage}
    <div styleName='modal-buttons'>
      <Button
        onClick={() => hideModal()}
        styleName='modal-button-no'
      >
        No
      </Button>
      <Button
        onClick={onYes}
        styleName='modal-button-yes'
        disabled={loadingCounterparty || !activeCounterpartyId}
      >
        Yes
      </Button>
    </div>
  </Modal>
}
