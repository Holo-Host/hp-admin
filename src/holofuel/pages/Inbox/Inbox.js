import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { isEmpty, uniqBy } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelInboxCounterpartiesQuery from 'graphql/HolofuelInboxCounterpartiesQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelNonPendingTransactionsQuery from 'graphql/HolofuelNonPendingTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import HolofuelRecoverFundsMutation from 'graphql/HolofuelRecoverFundsMutation.gql'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import Button from 'holofuel/components/Button'
import Modal from 'holofuel/components/Modal'
import Jumbotron from 'holofuel/components/Jumbotron'
import Loader from 'react-loader-spinner'
import NullStateMessage from 'holofuel/components/NullStateMessage'
import PageDivider from 'holofuel/components/PageDivider'
import HashAvatar from 'components/HashAvatar'
import AddIcon from 'components/icons/AddIcon'
import ForwardIcon from 'components/icons/ForwardIcon'
import './Inbox.module.css'
import { presentAgentId, presentHolofuelAmount, sliceHash, partitionByDate } from 'utils'
import { Link } from 'react-router-dom'
import { OFFER_REQUEST_PATH } from 'holofuel/utils/urls'
import { TYPE, STATUS } from 'models/Transaction'

function useOffer () {
  const [offer] = useMutation(HolofuelOfferMutation)
  return ({ id, amount, counterparty }) => offer({
    variables: { amount, counterpartyId: counterparty.id, requestId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    }]
  })
}

function useDecline () {
  const [decline] = useMutation(HolofuelDeclineMutation)
  return ({ id }) => {
    decline({
      variables: { transactionId: id },
      refetchQueries: [{
        query: HolofuelActionableTransactionsQuery
      }]
    })
  }
}

function useRefund () {
  const [recoverFunds] = useMutation(HolofuelRecoverFundsMutation)
  return (id) => recoverFunds({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    }]
  })
}

function useCounterparty (agentId) {
  const { loading, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })
  return { holofuelCounterparty, loading }
}

function useTransactionsWithCounterparties () {
  const { data: { holofuelUser: whoami = {} } = {} } = useQuery(HolofuelUserQuery)
  const { data: { holofuelInboxCounterparties = [] } = {} } = useQuery(HolofuelInboxCounterpartiesQuery, { fetchPolicy: 'network-only' })
  const { data: { holofuelActionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'network-only' })
  const { data: { holofuelNonPendingTransactions = [] } = {} } = useQuery(HolofuelNonPendingTransactionsQuery, { fetchPolicy: 'network-only' })

  const updateCounterparties = (transactions, counterparties) => transactions.map(transaction => ({
    ...transaction,
    counterparty: counterparties.find(counterparty => counterparty.id === transaction.counterparty.id) || transaction.counterparty
  }))

  const allCounterparties = uniqBy('id', holofuelInboxCounterparties.concat([whoami]))

  const updatedActionableTransactions = updateCounterparties(holofuelActionableTransactions, allCounterparties)

  const updatedActionableWOCanceledOffers = updatedActionableTransactions.filter(actionableTx => (actionableTx.status !== STATUS.canceled) && (actionableTx.type !== TYPE.request))
  const updatedCanceledTransactions = updatedActionableTransactions.filter(actionableTx => actionableTx.status === STATUS.canceled)
  const updatedDeclinedTransactions = updatedActionableTransactions.filter(actionableTx => actionableTx.status === STATUS.declined)
  const updatedNonPendingTransactions = updateCounterparties(holofuelNonPendingTransactions, allCounterparties).concat(updatedCanceledTransactions).concat(updatedDeclinedTransactions)

  return {
    actionableTransactions: updatedActionableWOCanceledOffers,
    recentTransactions: updatedNonPendingTransactions
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

export default function Inbox () {
  const { data: { holofuelLedger: { balance: holofuelBalance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'network-only' })

  const { actionableTransactions, recentTransactions } = useTransactionsWithCounterparties()
  const payTransaction = useOffer()
  const declineTransaction = useDecline()
  const refundTransaction = useRefund()
  const [counterpartyNotFound, setCounterpartyNotFound] = useState(true)
  const [isNewTransactionModalVisible, setIsNewTransactionModalVisible] = useState(null)
  const [modalTransaction, setModalTransaction] = useState(null)

  const showConfirmationModal = (transaction = {}, action = '') => {
    const modalTransaction = { ...transaction, action }
    if (!isEmpty(transaction) && action !== '') return setModalTransaction(modalTransaction)
    return null
  }

  const showNewTransactionModal = () => setIsNewTransactionModalVisible(true)

  const [actionsVisibleId, setActionsVisibleId] = useState(null)
  const actionsClickWithTxId = transactionId => setActionsVisibleId(transactionId)

  const toggleButtons = [{ view: VIEW.actionable, label: 'To-Do' }, { view: VIEW.recent, label: 'Activity' }]
  const [inboxView, setInboxView] = useState(VIEW.actionable)
  let displayTransactions = []
  switch (inboxView) {
    case VIEW.actionable:
      displayTransactions = actionableTransactions
      break
    case VIEW.recent:
      displayTransactions = recentTransactions
      break
    default:
      throw new Error('Invalid inboxView: ' + inboxView)
  }

  const isDisplayTransactionsEmpty = isEmpty(displayTransactions)
  const partitionedTransactions = partitionByDate(displayTransactions).filter(({ transactions }) => !isEmpty(transactions))

  return <PrimaryLayout headerProps={{ title: 'Inbox' }} inboxCount={actionableTransactions.length}>
    <Jumbotron
      className='inbox-header'
      title={`${presentHolofuelAmount(holofuelBalance)} TF`}
      titleSuperscript='Balance'
    >
      <Button styleName='new-transaction-button' onClick={() => showNewTransactionModal()}>
        <AddIcon styleName='add-icon' color='#0DC39F' />
        <h3 styleName='button-text'>New Transaction</h3>
      </Button>

      <div>
        {toggleButtons.map(button =>
          <Button
            variant={button.view === inboxView ? 'toggle-selected' : 'toggle'}
            onClick={() => setInboxView(VIEW[button.view])}
            className={cx(`${button.view}-button`)} /* eslint-disable-line quote-props */
            dataTestId={`${button.view}-transactions`}
            key={button.view}>
            {button.label}
          </Button>)}
      </div>
    </Jumbotron>

    {isEmpty(displayTransactions) && <>
      <PageDivider title='Today' />
      <NullStateMessage
        styleName='null-state-message'
        message={inboxView === VIEW.actionable
          ? 'You have no pending offers or requests'
          : 'You have no recent activity'}>
        <div onClick={() => showNewTransactionModal()}>
          <AddIcon styleName='add-icon' color='#0DC39F' />
          {/* TODO: Remove once the above ADD Icon works... */}
          <p style={{ fontSize: 30 }}>+</p>
        </div>
      </NullStateMessage>
    </>}

    {!isDisplayTransactionsEmpty && <div className='transaction-by-date-list'>
      {partitionedTransactions.map(({ label: dateLabel, transactions }) => <React.Fragment key={dateLabel}>
        <PageDivider title={dateLabel} />
        <div styleName='transaction-list'>
          {transactions.map(transaction => <TransactionRow
            transaction={transaction}
            actionsVisibleId={actionsVisibleId}
            actionsClickWithTxId={actionsClickWithTxId}
            role='list'
            view={VIEW}
            isActionable={inboxView === VIEW.actionable}
            showConfirmationModal={showConfirmationModal}
            key={transaction.id} />)}
        </div>
      </React.Fragment>)}
    </div>}

    <NewTransactionModal
      handleClose={() => setIsNewTransactionModalVisible(null)}
      isNewTransactionModalVisible={isNewTransactionModalVisible} />

    <ConfirmationModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction || {}}
      payTransaction={payTransaction}
      declineTransaction={declineTransaction}
      refundTransaction={refundTransaction}
      setCounterpartyNotFound={setCounterpartyNotFound}
      counterpartyNotFound={counterpartyNotFound} />
  </PrimaryLayout>
}

export function TransactionRow ({ transaction, actionsClickWithTxId, actionsVisibleId, showConfirmationModal, isActionable }) {
  const { counterparty, presentBalance, amount, type, status, notes } = transaction
  const agent = counterparty

  const handleCloseReveal = () => {
    if (!isEmpty(actionsVisibleId) && actionsVisibleId !== transaction.id) return actionsClickWithTxId(transaction.id)
    else return actionsClickWithTxId(null)
  }

  const isOffer = type === TYPE.offer
  const isRequest = !isOffer
  const isCanceled = status === STATUS.canceled
  const isDeclined = status === STATUS.declined

  let story
  if (isActionable && !isDeclined) story = isOffer ? ' is offering' : ' is requesting'
  else if (isDeclined && isOffer) story = 'has declined'

  let fullNotes
  if (isCanceled) {
    fullNotes = isOffer ? ` Canceled Offer: ${notes}` : ` Canceled Request: ${notes}`
  } else if (isDeclined) {
    fullNotes = isOffer ? notes : ` Declined Request: ${notes}`
  } else fullNotes = notes

  return <div styleName='transaction-row' role='listitem'>
    <div styleName='avatar'>
      <CopyAgentId agent={agent}>
        <HashAvatar seed={agent.id} size={32} data-testid='hash-icon' />
      </CopyAgentId>
    </div>

    <div styleName='description-cell'>
      <div><span styleName='counterparty'>
        <CopyAgentId agent={agent}>
          {agent.nickname || presentAgentId(agent.id)}
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
        isDeclined={isDeclined}
        isCanceled={isCanceled}
      />
      {!isActionable ? <div /> : <div styleName='balance'>{presentBalance}</div>}
    </div>

    {isActionable && <>
      <RevealActionsButton
        actionsVisibleId={actionsVisibleId}
        istransaction={transaction.id === actionsVisibleId}
        actionsClick={() => actionsClickWithTxId(transaction.id)}
        handleClose={handleCloseReveal}
      />
      <ActionOptions
        actionsVisibleId={actionsVisibleId}
        isOffer={isOffer}
        isRequest={isRequest}
        transaction={transaction}
        showConfirmationModal={showConfirmationModal}
        isDeclined={isDeclined}
        isCanceled={isCanceled}
      />
    </>}
  </div>
}

function RevealActionsButton ({ actionsClick, handleClose, actionsVisibleId, istransaction }) {
  return <div onClick={actionsVisibleId ? handleClose : actionsClick} styleName={cx('reveal-actions-button', 'drawer', { 'drawer-close': !(actionsVisibleId && istransaction) })} data-testid='reveal-actions-button'>
    <ForwardIcon styleName='forward-icon' color='#2c405a4d' dataTestId='forward-icon' />
  </div>
}

function ActionOptions ({ isOffer, isRequest, transaction, showConfirmationModal, actionsVisibleId, isCanceled, isDeclined }) {
  return <aside styleName={cx('drawer', { 'drawer-close': !(actionsVisibleId && transaction.id === actionsVisibleId) })}>
    <div styleName='actions'>
      <DeclineOrCancelButton transaction={transaction} isDeclined={isDeclined} showConfirmationModal={showConfirmationModal} />
      {!isDeclined && !isCanceled && isOffer && <AcceptButton transaction={transaction} />}
      {!isDeclined && !isCanceled && isRequest && <PayButton transaction={transaction} showConfirmationModal={showConfirmationModal} />}
    </div>
  </aside>
}

function AmountCell ({ amount, isRequest, isOffer, isActionable, isCanceled, isDeclined }) {
  const amountDisplay = isRequest ? `(${presentTruncatedAmount(presentHolofuelAmount(amount), 15)})` : presentTruncatedAmount(presentHolofuelAmount(amount), 15)
  return <div styleName={cx('amount', { debit: (isRequest && isActionable) || (isOffer && isDeclined) }, { credit: (isOffer && isActionable) || (isRequest && isDeclined) }, { removed: isDeclined || isCanceled })}>
    {amountDisplay} TF
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
  const { newMessage } = useFlashMessageContext()
  const acceptOffer = useAcceptOffer(id)
  const accept = () => {

    newMessage(<>
      <Loader
        type='Circles'
        color='#FFF'
        height={30}
        width={30}
        timeout={5000}
      /> Sending...
    </>, 5000)

    acceptOffer().then(() => {
      newMessage('Offer successfully accepted', 5000)
    }).catch(() => {
      newMessage('Offer acceptance unsuccessfully', 5000)
    })
  }
  return <Button
    onClick={accept}
    styleName='accept-button'>
    <p>Accept</p>
  </Button>
}

function PayButton ({ showConfirmationModal, transaction }) {
  const action = 'pay'
  return <Button
    onClick={() => showConfirmationModal(transaction, action)}
    styleName='pay-button'>
    <p>Accept</p>
  </Button>
}

function DeclineOrCancelButton ({ showConfirmationModal, transaction, isDeclined }) {
  const action = isDeclined ? 'cancel' : 'decline'
  return <Button
    onClick={() => showConfirmationModal(transaction, action)}
    styleName='reject-button'>
    <p>{isDeclined ? 'Cancel' : 'Decline'}</p>
  </Button>
}



function NewTransactionModal ({ handleClose, isNewTransactionModalVisible }) {
  return <Modal
    contentLabel={'Create a new transaction.'}
    isOpen={!!isNewTransactionModalVisible}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-title'>Create a new transaction.</div>
    <Button styleName='modal-buttons' onClick={handleClose}>
      <Link to={OFFER_REQUEST_PATH} styleName='button-link'>
        <div styleName='modal-offer-link'>
          Send / Request
        </div>
      </Link>
    </Button>
  </Modal>
}

export function ConfirmationModal ({ transaction, handleClose, declineTransaction, refundTransaction, payTransaction, setCounterpartyNotFound, counterpartyNotFound }) {
  const { newMessage } = useFlashMessageContext()
  const { id, amount, type, action } = transaction
  const { counterparty = {} } = transaction
  const { holofuelCounterparty, loading } = useCounterparty(counterparty.id)

  useEffect(() => {
    if (!transaction) return null
    else if (holofuelCounterparty || loading) {
      if (holofuelCounterparty.notFound) {
        setCounterpartyNotFound(true)
        newMessage('This HoloFuel Peer is currently unable to be located in the network. \n Please confirm your HoloFuel Peer is online, and try again after a few minutes.')
      } else setCounterpartyNotFound(false)
    }
  })

  let message, actionHook, actionParams, contentLabel, flashMessage
  switch (action) {
    case 'pay': {
      contentLabel = 'Pay request'
      actionParams = { id, amount, counterparty }
      actionHook = payTransaction
      message = <div styleName='modal-text' data-testid='modal-message'>
        Accept request for payment of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.id)}?
      </div>
      flashMessage = 'Payment sent succesfully'
      break
    }
    case 'decline': {
      contentLabel = `Decline ${type}?`
      actionParams = { id }
      actionHook = declineTransaction
      if (type === 'offer') {
        message = <div styleName='modal-text' data-testid='modal-message'>
          Decline request for payment of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.id)}?
        </div>
      } else {
        message = <div styleName='modal-text' data-testid='modal-message'>
          Decline offer of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.id)}?
        </div>
      }
      flashMessage = `${type.replace(/^\w/, c => c.toUpperCase())} succesfully declined`

      break
    }
    case 'cancel': {
      contentLabel = `Cancel ${type}?`
      actionParams = { id }
      actionHook = refundTransaction
      message = <div styleName='modal-text' data-testid='modal-message'>Cancel your declined {type} of <span styleName='modal-amount'>{presentHolofuelAmount(amount)} HF</span> {type === TYPE.offer ? 'to' : 'from'} <span styleName='counterparty'> {counterparty.nickname || presentAgentId(counterparty.id)}</span>?<br /><br /><div styleName='modal-note-text'>Note: Canceling will credit your balance by the outstanding amount.</div></div>
      break
    }
    default:
      // NB: action === undefined when first loading page && no transaction is yet passed in
      if (action === undefined) break
      else throw new Error('Error: Transaction action was not matched with a valid modal action. Current transaction action : ', action)
  }

  const onYes = () => {
    actionHook(actionParams)
    handleClose()
    newMessage(flashMessage, 5000)
  }

  return <Modal
    contentLabel={contentLabel}
    isOpen={!isEmpty(transaction)}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-title'>Are you sure?</div>
    {message}
    <div styleName='modal-buttons'>
      <Button
        onClick={handleClose}
        styleName='modal-button-no'>
        No
      </Button>
      <div styleName='button-divide' />
      <Button
        onClick={onYes}
        styleName='modal-button-yes'
        disabled={counterpartyNotFound}>
        Yes
      </Button>
    </div>
  </Modal>
}
