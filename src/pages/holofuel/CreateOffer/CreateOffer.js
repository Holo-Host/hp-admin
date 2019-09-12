import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import moment from 'moment'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import { TYPE } from 'models/Transaction'
import Header from 'components/holofuel/Header'
import Button from 'components/holofuel/Button'
import Modal from 'components/holofuel/Modal'
import './CreateOffer.module.css'
import cx from 'classnames'

const FormValidationSchema = yup.object().shape({
  counterparty: yup.string().required(),
  // hostPubKey: yup.string().required(),
  // registrationEmail: yup.string()
  //   .email()
  //   .required(),
  // deviceName: yup.string().required(),
  // networkId: yup.string().required(),
  // deviceAdminPort: yup.number()
  //   .min(1000)
  //   .max(65000)
  //   .required(),
  // hcAdminPort: yup.number()
  //   .min(1000)
  //   .max(65000)
  //   .required(),
  // hcNetworkPort: yup.number()
  //   .min(1000)
  //   .max(65000)
  //   .required(),
  // hostingPort: yup.number()
  //   .min(1000)
  //   .max(65000)
  //   .required()
})

function useOffer (amount, counterparty) {
  const [offer] = useMutation(HolofuelOfferMutation)
  return () => offer({
    variables: { amount, counterparty }
  })
}

export default function CreateOffer ({ history: { push } }) {
  const [amount, setAmount] = useState()
  const [counterparty, setcounterparty] = useState()
  const offer = useOffer(amount, counterparty)

  const { register, handleSubmit, errors } = useForm()
  const onSubmit = () => push('/')

  console.log('CreateOffer form errors (leave here until proper error handling is implemented):', errors)

  return <>
    <Header title='Offer' />
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterparty'>To</label>
        <input
          name='counterparty'
          placeholder='To'
          styleName='form-input'
          ref={register} />
      </div>
    </form>
  </>
}

//
//
//

const lastSix = counterparty => (counterparty || '').slice(-6)

function useDecline () {
  const [decline] = useMutation(HolofuelDeclineMutation)
  return id => decline({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    }]
  })
}

export function Inbox () {
  const { data: { holofuelActionableTransactions: transactions = [] } } = useQuery(HolofuelActionableTransactionsQuery)
  const declineTransaction = useDecline()
  const [modalTransaction, setModalTransaction] = useState()
  const isTransactionsEmpty = isEmpty(transactions)

  const pageTitle = `Inbox${isTransactionsEmpty ? '' : ` (${transactions.length})`}`

  const showRejectionModal = transaction => setModalTransaction(transaction)

  return <React.Fragment>
    <Header title={pageTitle} />

    {!isTransactionsEmpty && <div styleName='transaction-list'>
      {transactions.map(transaction => <TransactionRow
        transaction={transaction}
        showRejectionModal={showRejectionModal}
        role='list'
        key={transaction.id} />)}
    </div>}

    <ConfirmRejectionModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction}
      declineTransaction={declineTransaction} />

  </React.Fragment>
}

function presentDate (dateTime) {
  const daysDifferent = moment().diff(dateTime, 'days')
  if (daysDifferent < 1) {
    return 'Today'
  } else if (daysDifferent < 7) {
    return dateTime.fromNow()
  } else {
    return dateTime.format('MMM D')
  }
}

export function TransactionRow ({ transaction, showRejectionModal }) {
  const { counterparty, amount, type, timestamp, notes } = transaction

  const isOffer = type === TYPE.offer
  const isRequest = !isOffer

  const dateTime = moment(timestamp)

  const date = presentDate(dateTime)
  const time = dateTime.format('kk:mm')

  const shortCounterparty = lastSix(counterparty)

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
      <div styleName='story'><span styleName='counterparty'>{shortCounterparty}</span>{story}</div>
      <div styleName='notes'>{notes}</div>
    </div>
    <div styleName={cx('amount', { debit: isRequest })}>{Number(amount).toLocaleString()} HF</div>
    <div styleName='actions'>
      {isOffer && <AcceptButton transaction={transaction} />}
      {isRequest && <PayButton transaction={transaction} />}
      <RejectButton transaction={transaction} showRejectionModal={showRejectionModal} />
    </div>
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
    Accept
  </Button>
}

function PayButton ({ transaction: { id, amount, counterparty } }) {
  const pay = useOffer(id, amount, counterparty)
  return <Button
    onClick={pay}
    styleName='pay-button'>
    Pay
  </Button>
}

function RejectButton ({ showRejectionModal, transaction }) {
  return <Button
    onClick={() => showRejectionModal(transaction)}
    styleName='reject-button'>
    Reject
  </Button>
}

function ConfirmRejectionModal ({ transaction, handleClose, declineTransaction }) {
  if (!transaction) return null

  const { id, counterparty, amount, type } = transaction
  const onYes = () => {
    declineTransaction(id)
    handleClose()
  }

  return <Modal
    contentLabel={`Reject ${type}?`}
    isOpen={!!transaction}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-title'>Are you sure?</div>
    <div styleName='modal-text'>
      Reject <span styleName='modal-counterparty'>{lastSix(counterparty)}</span>'s {type} of <span styleName='modal-amount'>{Number(amount).toLocaleString()} HF</span>?
    </div>
    <div styleName='modal-buttons'>
      <Button
        onClick={handleClose}
        styleName='modal-button-no'>
        No
      </Button>
      <Button
        onClick={onYes}
        styleName='modal-button-yes'>
        Yes
      </Button>
    </div>
  </Modal>
}
