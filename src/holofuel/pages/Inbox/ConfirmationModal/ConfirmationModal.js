import React from 'react'
import cx from 'classnames'
import { useMutation } from '@apollo/react-hooks'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import Button from 'components/UIButton'
import Modal from 'holofuel/components/Modal'
import './ConfirmationModal.module.css'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { TYPE, STATUS } from 'models/Transaction'

function useOffer () {
  const [offerHoloFuel] = useMutation(HolofuelOfferMutation)
  return (offer) => offerHoloFuel({
    variables: { offer },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

function useAcceptOffer () {
  const [acceptOfferHoloFuel] = useMutation(HolofuelAcceptOfferMutation)
  return ({ id }) => acceptOfferHoloFuel({
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
  const [declineHoloFuel] = useMutation(HolofuelDeclineMutation)
  return ({ id }) => declineHoloFuel({
    variables: { transactionId: id },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

export default function ConfirmationModal ({ confirmationModalProperties, setConfirmationModalProperties }) {
  const payTransaction = useOffer()
  const acceptOffer = useAcceptOffer()
  const declineTransaction = useDecline()

  const { newMessage } = useFlashMessageContext()
  const { transaction, action, shouldDisplay, onConfirm, setIsLoading, onSignalInProcessEvent } = confirmationModalProperties

  const { id, amount, type, notes, counterparty = {} } = transaction

  let message, actionHook, actionParams, contentLabel, flashMessage
  switch (action) {
    case 'pay': {
      const counterpartyInput = { agentAddress: counterparty.agentAddress, nickname: counterparty.nickname || '' }
      contentLabel = 'Pay request'
      actionParams = { amount, counterparty: counterpartyInput, notes, requestId: id }
      actionHook = payTransaction
      message = <>
        Accept the request and send {counterparty.nickname || presentAgentId(counterparty.agentAddress)} {presentHolofuelAmount(amount)} TF?
      </>
      flashMessage = 'Payment sent succesfully'
      break
    }
    case 'acceptOffer': {
      contentLabel = 'Accept offer'
      actionParams = { id }
      actionHook = acceptOffer
      message = <>
        Accept offer of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.agentAddress)}?
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
          Decline request for payment of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.agentAddress)}?
        </>
      } else {
        message = <>
          Decline offer of {presentHolofuelAmount(amount)} TF from {counterparty.nickname || presentAgentId(counterparty.agentAddress)}?
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
          onSignalInProcessEvent()
          newMessage('Timed out waiting for transaction confirmation from counterparty, will retry later', 5000)
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
    styleName={cx('modal')}
  >
    <div styleName='modal-message'>{message}</div>
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
      >
        Yes
      </Button>
    </div>
  </Modal>
}
