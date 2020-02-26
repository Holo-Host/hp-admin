import React, { useState, useCallback, useEffect } from 'react'
import cx from 'classnames'
import { isEmpty, pick } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import HolofuelRecoverFundsMutation from 'graphql/HolofuelRecoverFundsMutation.gql'
import holofuelRefundDeclinedMutation from 'graphql/HolofuelRefundDeclinedMutation.gql'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import Button from 'components/UIButton'
import Modal from 'holofuel/components/Modal'
import Jumbotron from 'holofuel/components/Jumbotron'
import Loader from 'react-loader-spinner'
import NullStateMessage from 'holofuel/components/NullStateMessage'
import PageDivider from 'holofuel/components/PageDivider'
import HashAvatar from 'components/HashAvatar'
import Loading from 'components/Loading'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import ForwardIcon from 'components/icons/ForwardIcon'
import './Inbox.module.css'
import { presentAgentId, presentHolofuelAmount, sliceHash, partitionByDate } from 'utils'
import { caribbeanGreen } from 'utils/colors'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'

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

function useRefund () {
  const [recoverFunds] = useMutation(HolofuelRecoverFundsMutation)
  return ({ id }) => recoverFunds({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery,
      fetchPolicy: 'cache-and-network'
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

function useRefundAllDeclinedTransactions () {
  const [refundAllDeclined] = useMutation(holofuelRefundDeclinedMutation)
  return ({ cleanedTransactions }) => refundAllDeclined({
    variables: { transactions: cleanedTransactions },
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
    variables: { agentId }
  })
  return { holofuelCounterparty, loading }
}

function useUpdatedTransactionLists () {
  const { loading: actionableLoading, data: { holofuelActionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: 5000 })
  const { loading: recentLoading, data: { holofuelNonPendingTransactions = [] } = {} } = useQuery(HolofuelNonPendingTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: 5000 })

  const updatedActionableWOCanceledOffers = holofuelActionableTransactions.filter(actionableTx => actionableTx.status !== STATUS.canceled && !((actionableTx.status === STATUS.declined) && (actionableTx.type === TYPE.request)))

  const updatedCanceledTransactions = holofuelActionableTransactions.filter(actionableTx => actionableTx.status === STATUS.canceled)
  const updatedDeclinedTransactions = holofuelActionableTransactions.filter(actionableTx => actionableTx.status === STATUS.declined)
  const updatedNonPendingTransactions = holofuelNonPendingTransactions.concat(updatedCanceledTransactions).concat(updatedDeclinedTransactions)

  return {
    actionableTransactions: updatedActionableWOCanceledOffers,
    recentTransactions: updatedNonPendingTransactions,
    declinedTransactions: updatedDeclinedTransactions,
    actionableLoading,
    recentLoading
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
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })
  const { data: { holofuelUser: whoami = {} } = {} } = useQuery(HolofuelUserQuery)

  const [inboxView, setInboxView] = useState(VIEW.actionable)
  const { actionableTransactions, recentTransactions, declinedTransactions, actionableLoading, recentLoading } = useUpdatedTransactionLists(inboxView)

  const payTransaction = useOffer()
  const acceptOffer = useAcceptOffer()
  const declineTransaction = useDecline()
  const refundTransaction = useRefund()
  const refundAllDeclinedTransactions = useRefundAllDeclinedTransactions()
  const [counterpartyNotFound, setCounterpartyNotFound] = useState(true)
  const [isDeclinedTransactionModalVisible, setIsDeclinedTransactionModalVisible] = useState(false)
  const [modalTransaction, setModalTransaction] = useState({
    shouldDisplay: false,
    transactions: [],
    action: '',
    hasConfirmed: false
  })

  const resetDefaultModalTransaction = () => {
    setModalTransaction({
      shouldDisplay: false,
      transactions: [],
      action: '',
      hasConfirmed: false
    })
  }

  const setNewModalTransactionValues = (newValues = {}) => {
    if (isEmpty(newValues)) resetDefaultModalTransaction()
    else setModalTransaction(newValues)
  }

  const clearHighlightedTransaction = timeout => setTimeout(() => resetDefaultModalTransaction(), timeout)

  const filterActionableTransactionsByStatusAndType = useCallback((status, type) => actionableTransactions.filter(actionableTx => ((actionableTx.status === status) && (actionableTx.type === type))), [actionableTransactions])

  const shouldShowDeclinedTransactionModal = !isEmpty(filterActionableTransactionsByStatusAndType(STATUS.declined, TYPE.offer))

  useEffect(() => {
    if (shouldShowDeclinedTransactionModal) {
      setIsDeclinedTransactionModalVisible(true)
    }
  }, [shouldShowDeclinedTransactionModal, setIsDeclinedTransactionModalVisible])

  const [actionsVisibleId, setActionsVisibleId] = useState()

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

  const displayBalance = ledgerLoading ? '-- TF' : `${presentHolofuelAmount(holofuelBalance)} TF`

  const isDisplayTransactionsEmpty = isEmpty(displayTransactions)
  const partitionedTransactions = partitionByDate(displayTransactions).filter(({ transactions }) => !isEmpty(transactions))

  return <PrimaryLayout headerProps={{ title: 'Inbox' }}>
    <Jumbotron
      className='inbox-header'
      title={displayBalance}
      titleSuperscript='Balance'
    >
      <Button styleName='new-transaction-button'
        variant='green'
        onClick={() => push(OFFER_REQUEST_PATH)}>
        <PlusInDiscIcon styleName='plus-in-disc' color={caribbeanGreen} backgroundColor={'white'} />
        <div styleName='button-text'>New Transaction</div>
      </Button>

      <div>
        {viewButtons.map(button =>
          <Button
            styleName={button.view === inboxView ? 'view-button-selected' : 'view-button'}
            onClick={() => setInboxView(VIEW[button.view])}
            dataTestId={`${button.view}-transactions`}
            key={button.view}>
            {button.label}
          </Button>)}
      </div>
    </Jumbotron>

    {isDisplayLoading && <>
      <Loading styleName='display-loading' />
    </>}

    {isDisplayTransactionsEmpty && !isDisplayLoading && <>
      <PageDivider title='Today' />
      <NullStateMessage
        styleName='null-state-message'
        message={inboxView === VIEW.actionable
          ? 'You have no pending offers or requests'
          : 'You have no recent activity'}>
        <div onClick={() => push(OFFER_REQUEST_PATH)}>
          <PlusInDiscIcon styleName='null-add-icon' backgroundColor={caribbeanGreen} />
        </div>
      </NullStateMessage>
    </>}

    {!isDisplayTransactionsEmpty && <div className='transaction-by-date-list'>
      {partitionedTransactions.map(({ label: dateLabel, transactions }) => <React.Fragment key={dateLabel}>
        <PageDivider title={dateLabel} />
        <div styleName='transaction-list'>
          {transactions.map(transaction => <TransactionRow
            whoami={whoami}
            transaction={transaction}
            actionsVisibleId={actionsVisibleId}
            setActionsVisibleId={setActionsVisibleId}
            role='list'
            view={VIEW}
            isActionable={inboxView === VIEW.actionable}
            setModalTransaction={setModalTransaction}
            modalTransaction={modalTransaction}
            key={transaction.id} />)}
        </div>
      </React.Fragment>)}
    </div>}

    <DeclinedTransactionModal
      isDeclinedTransactionModalVisible={isDeclinedTransactionModalVisible}
      handleClose={() => setIsDeclinedTransactionModalVisible(false)}
      setNewModalTransactionValues={setNewModalTransactionValues}
      clearHighlightedTransaction={clearHighlightedTransaction}
      declinedTransactions={declinedTransactions}
      refundAllDeclinedTransactions={refundAllDeclinedTransactions} />

    <ConfirmationModal
      setNewModalTransactionValues={setNewModalTransactionValues}
      modalTransaction={modalTransaction || {}}
      clearHighlightedTransaction={clearHighlightedTransaction}
      payTransaction={payTransaction}
      acceptOffer={acceptOffer}
      declineTransaction={declineTransaction}
      refundTransaction={refundTransaction}
      setCounterpartyNotFound={setCounterpartyNotFound}
      counterpartyNotFound={counterpartyNotFound} />
  </PrimaryLayout>
}

export function TransactionRow ({ transaction, setActionsVisibleId, actionsVisibleId, setModalTransaction, modalTransaction: { transactions: modalActionedTransaction, action: modalActionedAction }, isActionable, whoami }) {
  const { counterparty, presentBalance, amount, type, status, direction, notes, canceledBy, isPayingARequest } = transaction
  const agent = canceledBy || counterparty

  const drawerIsOpen = transaction.id === actionsVisibleId

  const handleCloseReveal = () => {
    if (!isEmpty(actionsVisibleId) && actionsVisibleId !== transaction.id) return setActionsVisibleId(transaction.id)
    else return setActionsVisibleId(null)
  }

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
      story = isOffer ? ` Canceled an Offer to ${counterparty.id === whoami.id ? 'you' : (counterparty.nickname || presentAgentId(counterparty.id))}` : ` Canceled a Request from ${counterparty.id === whoami.id ? 'you' : (counterparty.nickname || presentAgentId(counterparty.id))}`
    }
    fullNotes = isOffer ? ` Canceled Offer: ${notes}` : ` Canceled Request: ${notes}`
  } else if (isDeclined) {
    fullNotes = isOffer ? ` Declined Offer: ${notes}` : ` Declined Request: ${notes}`
  } else fullNotes = notes

  const findTransactionById = (transactionId, arrayOfTransactions) => arrayOfTransactions.find(tx => tx.id === transactionId)

  // NB: once modalActionedTransaction no longer has an array or transactions, we can update to:  disabledTransaction = transaction.id === modalActionedTransaction.transaction.id
  const disabledTransaction = findTransactionById(transaction.id, modalActionedTransaction)
  const actionAccept = disabledTransaction && (modalActionedAction === 'pay' || modalActionedAction === 'acceptOffer')
  const actionDecline = disabledTransaction && (modalActionedAction === 'cancel' || modalActionedAction === 'decline')
  const actionRefund = disabledTransaction && modalActionedAction === 'refund'

  /* eslint-disable-next-line quote-props */
  return <div styleName={cx('transaction-row', { 'transaction-row-drawer-open': drawerIsOpen }, { 'annulled': isCanceled || isDeclined }, { disabled: disabledTransaction }, { highlightGreen: actionAccept || actionRefund }, { highlightRed: actionDecline })} role='listitem'>
    <div styleName='avatar'>
      <CopyAgentId agent={agent}>
        <HashAvatar seed={agent.id} size={32} data-testid='hash-icon' />
      </CopyAgentId>
    </div>

    <div styleName='description-cell'>
      <div><span styleName='counterparty'>
        <CopyAgentId agent={agent}>
          {(agent.id === whoami.id ? `${agent.nickname} (You)` : agent.nickname) || presentAgentId(agent.id)}
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
      {isActionable ? <div /> : <div styleName='balance'>{presentBalance}</div>}
    </div>

    {isActionable && !disabledTransaction && <>
      <RevealActionsButton
        actionsVisibleId={actionsVisibleId}
        visible={drawerIsOpen}
        actionsClick={() => setActionsVisibleId(transaction.id)}
        handleClose={handleCloseReveal}
      />
      <ActionOptions
        actionsVisibleId={actionsVisibleId}
        isOffer={isOffer}
        isRequest={isRequest}
        transaction={transaction}
        setModalTransaction={setModalTransaction}
        isDeclined={isDeclined}
        isCanceled={isCanceled}
      />
    </>}
  </div>
}

function RevealActionsButton ({ actionsClick, handleClose, actionsVisibleId, visible }) {
  return <div onClick={actionsVisibleId ? handleClose : actionsClick} styleName={cx('reveal-actions-button', 'drawer', { 'drawer-close': !(actionsVisibleId && visible) })} data-testid='reveal-actions-button'>
    <ForwardIcon styleName='forward-icon' color='#2c405a4d' dataTestId='forward-icon' />
  </div>
}

function ActionOptions ({ isOffer, isRequest, transaction, setModalTransaction, actionsVisibleId, isCanceled, isDeclined }) {
  return <aside styleName={cx('drawer', { 'drawer-close': !(actionsVisibleId && transaction.id === actionsVisibleId) })}>
    <div styleName='actions'>
      <DeclineOrCancelButton isDeclined={isDeclined} transaction={transaction} setModalTransaction={setModalTransaction} />
      {!isDeclined && !isCanceled && isOffer && <AcceptButton transaction={transaction} setModalTransaction={setModalTransaction} />}
      {!isDeclined && !isCanceled && isRequest && <PayButton transaction={transaction} setModalTransaction={setModalTransaction} />}
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

function AcceptButton ({ setModalTransaction, transaction }) {
  return <Button
    onClick={() => setModalTransaction({ shouldDisplay: true, transactions: [transaction], action: 'acceptOffer', hasConfirmed: false })}
    styleName='accept-button'>
    <p>Accept</p>
  </Button>
}

function PayButton ({ setModalTransaction, transaction }) {
  return <Button
    onClick={() => setModalTransaction({ shouldDisplay: true, transactions: [transaction], action: 'pay', hasConfirmed: false })}
    styleName='accept-button'>
    {/* NB: Not a typo. This is to 'Accept Request for Payment' */}
    <p>Accept</p>
  </Button>
}

function DeclineOrCancelButton ({ setModalTransaction, transaction, isDeclined }) {
  const action = isDeclined ? 'cancel' : 'decline'
  return <Button
    onClick={() => setModalTransaction({ shouldDisplay: true, transactions: [transaction], action, hasConfirmed: false })}
    styleName='reject-button'>
    <p>{isDeclined ? 'Cancel' : 'Decline'}</p>
  </Button>
}

export function DeclinedTransactionModal ({ setNewModalTransactionValues, clearHighlightedTransaction, handleClose, isDeclinedTransactionModalVisible, declinedTransactions, refundAllDeclinedTransactions }) {
  const { newMessage } = useFlashMessageContext()
  if (declinedTransactions.length <= 0) return null
  const totalSum = (sum, currentAmount) => sum + currentAmount
  const declinedTransactionSum = declinedTransactions.map(({ amount, fees }) => amount + fees).reduce(totalSum, 0)

  const returnAndClose = () => {
    newMessage(<>
      <Loader type='Circles' color='#FFF' height={30} width={30} timeout={5000}>Sending...</Loader>
    </>, 5000)

    const cleanedTransactions = declinedTransactions.map(tx => {
      const cleanedObj = pick(['id', 'amount', 'counterparty', 'direction', 'status', 'type', 'timestamp', 'fees', 'notes'], tx)
      const cleanedCounterparty = pick(['id', 'nickname'], cleanedObj.counterparty)
      return { ...cleanedObj, counterparty: cleanedCounterparty }
    })

    refundAllDeclinedTransactions({ cleanedTransactions }).then(() => {
      newMessage(`Funds succesfully returned`, 5000)
      setNewModalTransactionValues({ transactions: cleanedTransactions, action: 'refund', shouldDisplay: false, hasConfirmed: true })
      clearHighlightedTransaction(5000)
    }).catch(() => {
      newMessage('Sorry, something went wrong', 5000)
      handleClose()
    })
  }

  return <Modal
    contentLabel={'Restore funds from declined offer.'}
    isOpen={isDeclinedTransactionModalVisible}
    handleClose={returnAndClose}
    styleName='modal'>
    <div styleName='decline-modal-message'> {declinedTransactions.length} of your offers {declinedTransactions.length === 1 ? 'was' : 'were'} declined. {declinedTransactionSum} TF will be returned to your available balance.</div>
    <Button
      onClick={returnAndClose}
      styleName='modal-button-return-funds'>
      Return all funds
    </Button>
  </Modal>
}

export function ConfirmationModal ({ modalTransaction, clearHighlightedTransaction, setNewModalTransactionValues, declineTransaction, refundTransaction, payTransaction, acceptOffer, setCounterpartyNotFound, counterpartyNotFound }) {
  const { newMessage } = useFlashMessageContext()
  const { transactions, action, shouldDisplay } = modalTransaction
  const transaction = transactions[0] || {}

  const { id, amount, type, notes } = transaction
  const { counterparty = {} } = transaction
  const { loading: loaderCounterparty, holofuelCounterparty } = useCounterparty(counterparty.id)
  const { notFound } = holofuelCounterparty

  useEffect(() => {
    if (isEmpty(transaction)) return

    if (loaderCounterparty) {
      setCounterpartyNotFound(true)
      newMessage('Verifying your counterparty is online.', 5000)
    } else if (!isEmpty(holofuelCounterparty)) {
      if (notFound) {
        setCounterpartyNotFound(true)
        newMessage('This HoloFuel Peer is currently unable to be located in the network. \n Please confirm your HoloFuel Peer is online, and try again after a few minutes.')
      } else {
        setCounterpartyNotFound(false)
      }
    }
  }, [transaction, loaderCounterparty, setCounterpartyNotFound, notFound, holofuelCounterparty, newMessage])

  let message, actionHook, actionParams, contentLabel, flashMessage
  switch (action) {
    case 'pay': {
      contentLabel = 'Pay request'
      actionParams = { id, amount, counterparty, notes }
      actionHook = payTransaction
      message = <>
        Accept request for payment of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.id)}?
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
    case 'cancel': {
      contentLabel = `Cancel ${type}?`
      actionParams = { id }
      actionHook = refundTransaction
      message = <>Cancel your declined {type} of <span styleName='modal-amount'>{presentHolofuelAmount(amount)} HF</span> {type === TYPE.offer ? 'to' : 'from'} <span styleName='counterparty'> {counterparty.nickname || presentAgentId(counterparty.id)}</span>?<br /><br /><div styleName='modal-note-text'>Note: Canceling will credit your balance by the outstanding amount.</div></>
      flashMessage = `${type.replace(/^\w/, c => c.toUpperCase())} succesfully cancelled`
      break
    }
    default:
      // NB: action === undefined when first loading page && no transaction is yet passed in
      if (action === undefined || action === '' || action === 'refund') break
      else throw new Error('Error: Transaction action was not matched with a valid modal action. Current transaction action : ', action)
  }

  const onYes = () => {
    newMessage(<>
      <Loader type='Circles' color='#FFF' height={30} width={30} timeout={5000}>Sending...</Loader>
    </>, 5000)

    actionHook(actionParams)
      .then(() => {
        newMessage(flashMessage, 5000)
        setNewModalTransactionValues({ ...modalTransaction, shouldDisplay: false, hasConfirmed: true })
        clearHighlightedTransaction(5000)
      })
      .catch(() => {
        newMessage('Sorry, something went wrong', 5000)
        setNewModalTransactionValues({ ...modalTransaction, shouldDisplay: false, hasConfirmed: true })
        clearHighlightedTransaction(5000)
      })
  }

  return <Modal
    contentLabel={contentLabel}
    isOpen={!isEmpty(transaction) && shouldDisplay && action !== 'refund'}
    handleClose={() => setNewModalTransactionValues()}
    styleName='modal'>
    <div styleName='modal-message'>{message}</div>
    <div styleName='modal-buttons'>
      <Button
        onClick={() => setNewModalTransactionValues()}
        styleName='modal-button-no'>
        No
      </Button>
      <Button
        onClick={onYes}
        styleName='modal-button-yes'
        disabled={counterpartyNotFound}>
        Yes
      </Button>
    </div>
  </Modal>
}
