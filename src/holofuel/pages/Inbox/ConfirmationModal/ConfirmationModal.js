import React, { useContext } from 'react'
import cx from 'classnames'
import { useQuery, useMutation } from '@apollo/react-hooks'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import Modal from 'holofuel/components/Modal'
import Button from 'components/UIButton'
import Loading from 'components/Loading'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelDeclineMutation from 'graphql/HolofuelDeclineMutation.gql'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { TYPE, STATUS } from 'models/Transaction'

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
          newMessage('Timed out waiting for transaction confirmation from counterparty, will retry later', 5000)
        } else {
          newMessage(flashMessage, 5000)
        }
        onConfirm(action)
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
