import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import cx from 'classnames'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelRecentCounterpartiesQuery from 'graphql/HolofuelRecentCounterpartiesQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'components/UIButton'
import RecentCounterparties from 'holofuel/components/RecentCounterparties'
import AmountInput from './AmountInput'
import Loading from 'components/Loading'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import { presentAgentId } from 'utils'
import { FAILED_TRANSACTION_MESSAGE } from 'models/Transaction'

import { HISTORY_FROM_SENT_TRANSACTION_PATH, INBOX_PATH } from 'holofuel/utils/urls'
import './CreateOfferRequest.module.css'

// TODO: these constants should come from somewhere more scientific
export const FEE_PERCENTAGE = 0
const AGENT_ID_LENGTH = 63

const FormValidationSchema = yup.object().shape({
  counterpartyId: yup.string()
    .required()
    .length(AGENT_ID_LENGTH)
    .trim()
})

function useOfferMutation () {
  const [offerHoloFuel] = useMutation(HolofuelOfferMutation)
  return (offer) => offerHoloFuel({
    variables: { offer }
  })
}

function useRequestMutation () {
  const [requestHoloFuel] = useMutation(HolofuelRequestMutation)
  return (request) => requestHoloFuel({
    variables: { request }
  })
}

const OFFER_MODE = 'offer'
const REQUEST_MODE = 'request'

const modeVerbs = {
  [OFFER_MODE]: 'Send',
  [REQUEST_MODE]: 'Request'
}

const modePrepositions = {
  [OFFER_MODE]: 'To',
  [REQUEST_MODE]: 'From'
}

const modeRelations = {
  [OFFER_MODE]: 'to',
  [REQUEST_MODE]: 'from'
}

export default function CreateOfferRequest ({ history: { push } }) {
  const [numpadVisible, setNumpadVisible] = useState(true)
  const [mode, setMode] = useState(OFFER_MODE)

  const { currentUser } = useCurrentUserContext()
  const { loading: loadingRecentCounterparties, data: { holofuelRecentCounterparties: allRecentCounterparties = [] } = {} } = useQuery(HolofuelRecentCounterpartiesQuery, { fetchPolicy: 'cache-and-network' })
  const recentCounterpartiesWithoutMe = allRecentCounterparties.filter(counterparty => counterparty.id !== currentUser.id)

  const createOffer = useOfferMutation()
  const createRequest = useRequestMutation()
  const { newMessage: newMessageRaw } = useFlashMessageContext()
  const newMessage = useCallback(newMessageRaw, [newMessageRaw])

  const [counterpartyId, setCounterpartyId] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')

  const updateCounterparty = agentAddress => {
    const recentCounterparty = recentCounterpartiesWithoutMe.find(recentCounterparty => recentCounterparty.agentAddress === agentAddress)
    const agentNickname = (!isEmpty(recentCounterparty) && recentCounterparty.nickname)
      ? recentCounterparty.nickname
      : agentAddress === currentUser.id
        ? `${currentUser.nickname || presentAgentId(currentUser.id)} (You)`
        : presentAgentId(agentAddress)

    setCounterpartyNick(agentNickname)
    setCounterpartyId(agentAddress)
  }

  useEffect(() => {
    if (counterpartyId === currentUser.id) {
      newMessage('You cannot send yourself TestFuel.', 5000)
    }
  }, [currentUser.id, counterpartyId, newMessage])

  const { register, handleSubmit, errors, setValue: setFormValue } = useForm({ validationSchema: FormValidationSchema })
  const isValid = yup.reach(FormValidationSchema, 'counterpartyId').isValidSync(counterpartyId)

  const selectAgent = agent => {
    setCounterpartyId(agent.agentAddress)
    setCounterpartyNick(agent.nickname || presentAgentId(agent.agentAddress))
    setFormValue('counterpartyId', agent.agentAddress)
  }

  const [isProcessing, setIsProcessing] = useState(false)

  // NB: amount is maintained as a string, until submission, when the numeric value is verified
  const [amountString, setAmountString] = useState('')
  const [amount, setAmountRaw] = useState(0)

  const setAmount = (amount, presentedAmount) => {
    const hasDot = /\./.test(amount)
    const lastRawAmountIndex = amount.length - 1
    const lastpresentedAmountIndex = presentedAmount.length - 1

    if (hasDot && amount.charAt(lastRawAmountIndex) === '.') {
      setAmountRaw(amount.slice(0, lastRawAmountIndex))
      setAmountString(presentedAmount.slice(0, lastpresentedAmountIndex))
    } else {
      setAmountRaw(amount)
      setAmountString(presentedAmount)
    }
  }

  const onSubmit = ({ counterpartyId, notes }) => {
    setIsProcessing(true)
    const counterpartyNickname = counterpartyNick === presentAgentId(counterpartyId) ? '' : counterpartyNick
    const transaction = { amount, counterparty: { agentAddress: counterpartyId, nickname: counterpartyNickname }, notes }
    switch (mode) {
      case OFFER_MODE:
        createOffer(transaction)
          .then(() => {
            newMessage(`Offer of ${amountString} TF sent to ${counterpartyNick}.`, 5000)
            setIsProcessing(false)
            push(HISTORY_FROM_SENT_TRANSACTION_PATH)
          }).catch(({ message }) => {
            const counterpartyError = message.includes('Counterparty not found')
            if (counterpartyError) {
              push(INBOX_PATH)
              newMessage(FAILED_TRANSACTION_MESSAGE, 10000)
            } else {
              newMessage('Sorry, something went wrong', 5000)
            }
            setIsProcessing(false)
          })
        break
      case REQUEST_MODE:
        createRequest(transaction)
          .then(() => {
            newMessage(`Request for ${amountString} TF sent to ${counterpartyNick}.`, 5000)
            setIsProcessing(false)
            push(HISTORY_FROM_SENT_TRANSACTION_PATH)
          }).catch(({ message }) => {
            const counterpartyError = message.includes('Counterparty not found')
            if (counterpartyError) {
              push(INBOX_PATH)
              newMessage(FAILED_TRANSACTION_MESSAGE, 10000)
            } else {
              newMessage('Sorry, something went wrong', 5000)
            }
            setIsProcessing(false)
          })
        break
      default:
        throw new Error(`Unknown mode: '${mode}' in CreateOfferRequest`)
    }
  }

  const title = mode === OFFER_MODE ? 'Send TestFuel' : 'Request TestFuel'

  const disableSubmit = counterpartyId.length !== AGENT_ID_LENGTH ||
    counterpartyId === currentUser.id ||
    amount < 0 ||
    isProcessing

  // render num pad:
  if (numpadVisible) {
    const chooseSend = () => {
      setMode(OFFER_MODE)
      setNumpadVisible(false)
      setCounterpartyId('')
    }
    const chooseRequest = () => {
      setMode(REQUEST_MODE)
      setNumpadVisible(false)
      setCounterpartyId('')
    }
    return <AmountInput amount={amount} setAmount={setAmount} chooseSend={chooseSend} chooseRequest={chooseRequest} />
  }

  // render main page
  return <PrimaryLayout headerProps={{ title }} showAlphaFlag={false}>
    <div styleName='amount-backdrop' />
    <div styleName='amount-banner'>
      <h4 styleName='amount-label'>
        {title}
      </h4>
      <div styleName='amount' onClick={() => setNumpadVisible(true)}>
        {amountString} TF
      </div>
      <div styleName='fee-notice'>
        {mode === OFFER_MODE
          ? `For TestFuel, a ${100 * FEE_PERCENTAGE}% fee is processed with all outgoing transactions`
          : ' '}
      </div>
    </div>

    <div styleName='mode-toggle'>
      {[OFFER_MODE, REQUEST_MODE].map((buttonMode, i) =>
        <Button
          styleName={cx('mode-toggle-button', 'transaction-button', { selected: buttonMode === mode })}
          variant='white'
          onClick={() => setMode(buttonMode)}
          key={buttonMode}
        >
          {modeVerbs[buttonMode]}
        </Button>)}
    </div>

    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div><label htmlFor='counterpartyId' styleName='form-label'>{modePrepositions[mode]}:</label></div>
        <div styleName='input-row'>
          <input
            name='counterpartyId'
            id='counterpartyId'
            styleName={cx('form-input', { 'form-input-error': !isValid || (!isEmpty(errors) && errors.counterpartyId.message) })}
            placeholder={`Who is this ${modeRelations[mode]}?`}
            ref={register}
            onChange={({ target: { value } }) => updateCounterparty(value)}
          />
          <div styleName='hash-and-nick'>
            {counterpartyId.length === AGENT_ID_LENGTH && <HashIcon hash={counterpartyId} size={26} styleName='hash-icon' />}
            {counterpartyId.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname' styleName='nickname'>{counterpartyNick || ''}</h4>}
          </div>
        </div>
      </div>

      {!isValid && isEmpty(errors) && <h3 styleName='error-text'>You peer hash ID must be {AGENT_ID_LENGTH} characters</h3>}
      {!isEmpty(errors) && <h3 styleName='error-text'>No matching peers found. Check hash ID spelling.</h3>}

      <div>
        <div><label htmlFor='notes' styleName='form-label'>For:</label></div>
        <input
          name='notes'
          id='notes'
          styleName='form-input'
          placeholder='What is this for?'
          ref={register}
        />
        <div />
      </div>

      <div styleName='total'>Total Amount: {amountString} TF</div>

      <Button
        type='submit'
        dataTestId='submit-button'
        variant='green'
        styleName={cx('send-button', { disabled: disableSubmit })}
        disabled={disableSubmit}
      >{title}
      </Button>

      {isProcessing && <>
        <Loading styleName='display-loading' />
      </>}
    </form>

    <RecentCounterparties
      styleName='recent-counterparties'
      agents={recentCounterpartiesWithoutMe}
      selectedAgentId={counterpartyId}
      selectAgent={selectAgent}
      loading={loadingRecentCounterparties} />
  </PrimaryLayout>
}
