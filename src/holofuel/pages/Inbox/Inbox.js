import React, { useState } from 'react'
import cx from 'classnames'
import { isEmpty, flatten } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelInboxCounterpartiesQuery from 'graphql/HolofuelInboxCounterpartiesQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelRecentTransactionsQuery from 'graphql/HolofuelRecentTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import { TYPE } from 'models/Transaction'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import Button from 'holofuel/components/Button'
import Modal from 'holofuel/components/Modal'
import Jumbotron from 'holofuel/components/Jumbotron'
import NullStateMessage from 'holofuel/components/NullStateMessage'
import PageDivider from 'holofuel/components/PageDivider'
import HashAvatar from 'components/HashAvatar'
import AddIcon from 'components/icons/AddIcon'
import ForwardIcon from 'components/icons/ForwardIcon'
import './Inbox.module.css'
import { presentAgentId, presentHolofuelAmount, sliceHash, partitionByDate } from 'utils'
import { Link } from 'react-router-dom'
import { REQUEST_PATH, OFFER_PATH } from 'holofuel/utils/urls'

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
  return ({ id }) => decline({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    }]
  })
}

function useFetchCounterparties () {
  const { data: { holofuelActionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery)
  const { data: { holofuelInboxCounterparties } = {}, client } = useQuery(HolofuelInboxCounterpartiesQuery)

  if (holofuelInboxCounterparties) {
    const filterTransactionsByAgentId = (agent, txListType) => txListType.filter(transaction => transaction.counterparty.id === agent.id)
    const updateTxListCounterparties = (txListType, counterpartyList) => counterpartyList.map(agent => {
      const matchingTx = filterTransactionsByAgentId(agent, txListType)
      return matchingTx.map(transaction => { Object.assign(transaction.counterparty, agent); return transaction })
    })

    const result = flatten(updateTxListCounterparties(holofuelActionableTransactions, holofuelInboxCounterparties))

    client.writeQuery({
      query: HolofuelActionableTransactionsQuery,
      data: {
        holofuelActionableTransactions: result
      }
    })
  }
}

const VIEW = {
  pending: 'pending',
  recent: 'recent'
}

const presentTruncatedAmount = (string, number = 15) => {
  if (string.length > number) return `${sliceHash(string, number)}...`
  return sliceHash(string, number)
}

export default function Inbox () {
  const { data: { holofuelUser: whoami = {} } = {} } = useQuery(HolofuelUserQuery)
  const { data: { holofuelLedger: { balance: holofuelBalance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery)
  const { data: { holofuelActionableTransactions: actionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery)
  const { data: { holofuelRecentTransactions: recentTransactions = [] } = {} } = useQuery(HolofuelRecentTransactionsQuery)

  useFetchCounterparties()
  const payTransaction = useOffer()
  const declineTransaction = useDecline()
  const [toggleModal, setToggleModal] = useState(null)
  const [modalTransaction, setModalTransaction] = useState(null)

  const showConfirmationModal = (transaction = {}, action = '') => {
    const modalTransaction = { ...transaction, action }
    if (!isEmpty(transaction) && action !== '') return setModalTransaction(modalTransaction)
    else return setToggleModal(true)
  }

  const [actionsVisible, setActionsVisible] = useState(null)
  const actionsClickWithTx = transaction => setActionsVisible(transaction)

  const toggleButtons = [{ view: 'pending', label: 'Pending' }, { view: 'recent', label: 'Recent' }]
  const [inboxView, setInboxView] = useState(VIEW.pending)
  let displayTransactions = []
  switch (inboxView) {
    case VIEW.pending:
      displayTransactions = actionableTransactions
      break
    case VIEW.recent:
      displayTransactions = recentTransactions
      break
    default:
      displayTransactions = actionableTransactions
      break
  }

  const isPendingTransactionsEmpty = isEmpty(actionableTransactions)
  const isDisplayTransactionsEmpty = isEmpty(displayTransactions)
  const pageTitle = `Inbox${isPendingTransactionsEmpty ? '' : ` (${actionableTransactions.length})`}`

  const partitionedTransactions = partitionByDate(displayTransactions).filter(({ transactions }) => !isEmpty(transactions))

  return <PrimaryLayout headerProps={{ title: pageTitle }} inboxCount={actionableTransactions.length}>
    <Jumbotron
      className='inbox-header'
      title={`${presentHolofuelAmount(holofuelBalance)} HF`}
      titleSuperscript='Balance'isTransactionsEmpty
    >
      <Button styleName='new-transaction-button' onClick={() => showConfirmationModal()}>
        {/* TODO: Resolve issue with path for the ADD icon >> not displayed properly */}
        <AddIcon styleName='add-icon' color='#0DC39F' />
        <h3 styleName='button-text'>New Transaction</h3>
      </Button>

      <div>
        {toggleButtons.map(button =>
          <Button
            variant={button.view === inboxView ? 'toggle-selected' : 'toggle'}
            onClick={() => setInboxView(VIEW[button.view])}
            className={cx(`${button.view}-button`)} /* eslint-disable-line quote-props */
            key={button.view}>
            {button.label}
          </Button>)}
      </div>
    </Jumbotron>

    {isEmpty(displayTransactions) && <>
      <PageDivider title='Today' />
      <NullStateMessage
        styleName='null-state-message'
        message={inboxView === VIEW.pending
          ? 'You have no pending offers or requests'
          : 'You have no recent activity'}>
        <div onClick={() => showConfirmationModal()}>
          {/* TODO: Resolve issue with path for the ADD icon >> not displayed properly */}
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
            actionsVisible={actionsVisible}
            actionsClickWithTx={actionsClickWithTx}
            role='list'
            whoami={whoami}
            view={VIEW}
            inboxView={inboxView}
            showConfirmationModal={showConfirmationModal}
            key={transaction.id} />)}
        </div>
      </React.Fragment>)}
    </div>}

    <NewTransactionModal
      handleClose={() => setToggleModal(null)}
      toggleModal={toggleModal} />

    <ConfirmationModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction}
      payTransaction={payTransaction}
      declineTransaction={declineTransaction} />
  </PrimaryLayout>
}

export function TransactionRow ({ transaction, actionsClickWithTx, actionsVisible, showConfirmationModal, inboxView, whoami }) {
  const { counterparty, presentBalance, amount, type, notes } = transaction

  const actionsClick = () => actionsClickWithTx(transaction)
  const handleCloseReveal = () => {
    if (!isEmpty(actionsVisible) && actionsVisible === transaction) return actionsClickWithTx(null)
    else if (!isEmpty(actionsVisible) && actionsVisible !== transaction) return actionsClickWithTx(transaction)
    else return actionsClickWithTx(null)
  }

  let agent
  if (counterparty.id === whoami.id) agent = whoami
  else agent = counterparty

  console.log('agent (check for nickname - in pending...) : ', agent)

  const isOffer = type === TYPE.offer
  const isRequest = !isOffer

  let story
  if (inboxView === VIEW.pending) story = isOffer ? ' is offering' : ' is requesting'

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
      <div styleName='notes'>{notes}</div>
    </div>

    <div styleName='amount-cell'>
      <AmountCell
        amount={amount}
        isRequest={isRequest}
        isOffer={isOffer}
        inboxView={inboxView}
      />
      {inboxView === VIEW.recent && <div styleName='balance'>{presentBalance}</div>}
    </div>

    {inboxView === VIEW.pending && <>
      <RevealActionsButton
        actionsVisible={actionsVisible}
        istransaction={transaction === actionsVisible}
        actionsClick={actionsClick}
        handleClose={handleCloseReveal}
      />
      <ActionOptions
        actionsVisible={actionsVisible}
        isOffer={isOffer}
        isRequest={isRequest}
        transaction={transaction}
        showConfirmationModal={showConfirmationModal}
      />
    </>}
  </div>
}

function RevealActionsButton ({ actionsClick, handleClose, actionsVisible, istransaction }) {
  return <div onClick={actionsVisible ? handleClose : actionsClick} styleName={cx('reveal-actions-button', 'drawer', { 'drawer-close': !(actionsVisible && istransaction) })} data-testid='reveal-actions-button'>
    <ForwardIcon styleName='forward-icon' color='#2c405a4d' dataTestId='forward-icon' />
  </div>
}

function ActionOptions ({ isOffer, isRequest, transaction, showConfirmationModal, actionsVisible }) {
  return <aside styleName={cx('drawer', { 'drawer-close': !(actionsVisible && transaction === actionsVisible) })}>
    <div styleName='actions'>
      <RejectButton transaction={transaction} showConfirmationModal={showConfirmationModal} />
      {isOffer && <AcceptButton transaction={transaction} />}
      {isRequest && <PayButton transaction={transaction} showConfirmationModal={showConfirmationModal} />}
    </div>
  </aside>
}

function AmountCell ({ amount, isRequest, isOffer, inboxView }) {
  const amountDisplay = isRequest ? `(${presentTruncatedAmount(presentHolofuelAmount(amount), 15)})` : presentTruncatedAmount(presentHolofuelAmount(amount), 15)
  return <div styleName={cx('amount', { debit: isRequest && inboxView === VIEW.pending }, { credit: isOffer && inboxView === VIEW.pending })}>
    {amountDisplay} HF
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
    onClick={acceptOffer}
    styleName='accept-button'>
    <p>Accept</p>
  </Button>
}

function PayButton ({ showConfirmationModal, transaction }) {
  const action = 'pay'
  return <Button
    onClick={() => showConfirmationModal(transaction, action)}
    styleName='pay-button'>
    <p>Pay</p>
  </Button>
}

function RejectButton ({ showConfirmationModal, transaction }) {
  const action = 'decline'
  return <Button
    onClick={() => showConfirmationModal(transaction, action)}
    styleName='reject-button'>
    <p>Decline</p>
  </Button>
}

function NewTransactionModal ({ handleClose, toggleModal }) {
  return <Modal
    contentLabel={'Create a new transaction.'}
    isOpen={!!toggleModal}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-title'>Create a new transaction.</div>
    <Button styleName='modal-buttons' onClick={handleClose}>
      <Link to={OFFER_PATH} styleName='button-link'>
        <div styleName='modal-offer-link'>
          Send
        </div>
      </Link>
      <div styleName='button-divide' />
      <Link to={REQUEST_PATH} styleName='button-link'>
        <div styleName='modal-request-link'>
          Request
        </div>
      </Link>
    </Button>
  </Modal>
}

export function ConfirmationModal ({ transaction, handleClose, declineTransaction, payTransaction }) {
  if (!transaction) return null
  const { id, counterparty, amount, type, action } = transaction

  let message, actionHook, actionParams, contentLabel
  switch (action) {
    case 'pay': {
      contentLabel = 'Pay request'
      actionParams = { id, amount, counterparty }
      actionHook = payTransaction
      message = <div styleName='modal-text' data-testid='modal-message'>Pay <span styleName='counterparty'> {counterparty.nickname || presentAgentId(counterparty.id)}</span> <span styleName='modal-amount'>{presentHolofuelAmount(amount)} HF</span>?</div>
      break
    }
    case 'decline': {
      contentLabel = `Reject ${type}?`
      actionParams = id
      actionHook = declineTransaction
      message = <div styleName='modal-text' data-testid='modal-message'>Decline <span styleName='counterparty'> {counterparty.nickname || presentAgentId(counterparty.id)}</span>'s {type} of <span styleName='modal-amount'>{presentHolofuelAmount(amount)} HF</span>?</div>
      break
    }
    default:
      throw new Error('Error: Transaction action was not matched with a modal action. Current transaction action : ', action)
  }

  const onYes = () => {
    actionHook(actionParams)
    handleClose()
  }

  return <Modal
    contentLabel={contentLabel}
    isOpen={!!transaction}
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
        styleName='modal-button-yes'>
        Yes
      </Button>
    </div>
  </Modal>
}
