import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import cx from 'classnames'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'components/UIButton'
import Loading from 'components/Loading'
import RecentCounterparties from 'holofuel/components/RecentCounterparties'
import AmountInput from './AmountInput'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { HISTORY_PATH } from 'holofuel/utils/urls'
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
  const [offer] = useMutation(HolofuelOfferMutation)
  return (amount, counterpartyId, notes) => offer({
    variables: { amount, counterpartyId, notes }
  })
}

function useRequestMutation () {
  const [offer] = useMutation(HolofuelRequestMutation)
  return (amount, counterpartyId, notes) => offer({
    variables: { amount, counterpartyId, notes }
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

export default function CreateOfferRequest ({ history: { push } }) {
  const [numpadVisible, setNumpadVisible] = useState(true)
  const [mode, setMode] = useState(OFFER_MODE)

  const { data: { holofuelUser: whoami = {} } = {} } = useQuery(HolofuelUserQuery)
  const { loading: loadingRecentCounterparties, data: { holofuelHistoryCounterparties: allRecentCounterparties = [] } = {} } = useQuery(HolofuelHistoryCounterpartiesQuery)
  const recentCounterpartiesWithoutMe = allRecentCounterparties.filter(counterparty => counterparty.id !== whoami.id)

  const createOffer = useOfferMutation()
  const createRequest = useRequestMutation()
  const { newMessage: newMessageRaw } = useFlashMessageContext()
  const newMessage = useCallback(newMessageRaw, [newMessageRaw])

  const [counterpartyId, setCounterpartyId] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')
  const [isCounterpartyFound, setCounterpartyFound] = useState(false)

  useEffect(() => {
    setCounterpartyNick(presentAgentId(counterpartyId))
    if (counterpartyId === whoami.id) {
      newMessage('You cannot send yourself TestFuel.', 5000)
    }
  }, [whoami.id, counterpartyId, newMessage])

  const { register, handleSubmit, errors, setValue: setFormValue } = useForm({ validationSchema: FormValidationSchema })

  const selectAgent = id => {
    setCounterpartyId(id)
    setFormValue('counterpartyId', id)
  }

  const [amount, setAmountRaw] = useState(0)
  const setAmount = amount => setAmountRaw(Number(amount))

  const fee = (amount * FEE_PERCENTAGE) || 0
  const total = mode === OFFER_MODE
    ? amount + fee
    : amount

  const onSubmit = ({ counterpartyId, notes }) => {
    switch (mode) {
      case OFFER_MODE:
        createOffer(amount, counterpartyId, notes)
        newMessage(`Offer of ${presentHolofuelAmount(amount)} TF sent to ${counterpartyNick}.`, 5000)
        break
      case REQUEST_MODE:
        createRequest(amount, counterpartyId, notes)
        newMessage(`Request for ${presentHolofuelAmount(amount)} TF sent to ${counterpartyNick}.`, 5000)
        break
      default:
        throw new Error(`Unknown mode: '${mode}' in CreateOfferRequest`)
    }
    push(HISTORY_PATH)
  }

  !isEmpty(errors) && console.log('Form errors (leave here until proper error handling is implemented):', errors)

  const title = mode === OFFER_MODE ? 'Send TestFuel' : 'Request TestFuel'

  const disableSubmit = counterpartyId.length !== AGENT_ID_LENGTH ||
    !isCounterpartyFound ||
    counterpartyId === whoami.id ||
    amount < 0

  if (numpadVisible) {
    const chooseSend = () => {
      setMode(OFFER_MODE)
      setNumpadVisible(false)
    }

    const chooseRequest = () => {
      setMode(REQUEST_MODE)
      setNumpadVisible(false)
    }

    return <AmountInput amount={amount} setAmount={setAmount} chooseSend={chooseSend} chooseRequest={chooseRequest} />
  }

  return <PrimaryLayout headerProps={{ title }} showAlphaFlag={false}>
    <div styleName='amount-backdrop' />
    <div styleName='amount-banner'>
      <h4 styleName='amount-label'>
        {title}
      </h4>
      <div styleName='amount' onClick={() => setNumpadVisible(true)}>
        {presentHolofuelAmount(amount)} TF
      </div>
      <div styleName='fee-notice'>
        {mode === OFFER_MODE
          ? `For TestFuel, a ${100 * FEE_PERCENTAGE}% fee is processed with all outgoing transactions`
          : ' '}
      </div>
    </div>

    <div styleName='mode-toggle'>
      {[OFFER_MODE, REQUEST_MODE].map((buttonMode, i) =>
        <Button styleName={cx('mode-toggle-button', { 'left-button': i === 0, 'right-button': i === 1, selected: buttonMode === mode })}
          variant='white'
          onClick={() => setMode(buttonMode)}
          key={buttonMode}>
          {modeVerbs[buttonMode]}
        </Button>)}
    </div>

    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <div><label htmlFor='counterpartyId' styleName='form-label'>{modePrepositions[mode]}:</label></div>
        <div styleName='input-row'>
          <input
            name='counterpartyId'
            id='counterpartyId'
            styleName='form-input'
            placeholder='Who is this for?'
            ref={register}
            onChange={({ target: { value } }) => setCounterpartyId(value)} />
          <div styleName='hash-and-nick'>
            {counterpartyId.length === AGENT_ID_LENGTH && <HashIcon hash={counterpartyId} size={26} styleName='hash-icon' />}
            {counterpartyId.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname' styleName='nickname'>
              <RenderNickname
                agentId={counterpartyId}
                setCounterpartyNick={setCounterpartyNick}
                counterpartyNick={counterpartyNick}
                setCounterpartyFound={setCounterpartyFound}
                newMessage={newMessage} />
            </h4>}
          </div>
        </div>
      </div>
      <div styleName='form-row'>
        <div><label htmlFor='notes' styleName='form-label'>For:</label></div>
        <input
          name='notes'
          id='notes'
          styleName='form-input'
          placeholder='What is this for?'
          ref={register} />
        <div />
      </div>

      <div styleName='total'>Total Amount: {presentHolofuelAmount(total)} TF</div>

      <Button
        type='submit'
        dataTestId='submit-button'
        variant='green'
        styleName={cx('send-button', { disabled: disableSubmit })}
        disabled={disableSubmit}>{title}</Button>
    </form>

    <RecentCounterparties
      styleName='recent-counterparties'
      agents={recentCounterpartiesWithoutMe}
      selectedAgentId={counterpartyId}
      selectAgent={selectAgent}
      loading={loadingRecentCounterparties} />
  </PrimaryLayout>
}

export function RenderNickname ({ agentId, setCounterpartyNick, setCounterpartyFound, newMessage, whoami }) {
  const { loading, error: queryError, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })

  const [hasDisplayedNotFoundMessage, setHasDisplayedNotFoundMessage] = useState(false)

  const { nickname, notFound, id } = holofuelCounterparty
  useEffect(() => {
    setCounterpartyNick(nickname)
  }, [setCounterpartyNick, nickname])

  useEffect(() => {
    if (!loading) {
      if (notFound) {
        setCounterpartyFound(false)
        if (!hasDisplayedNotFoundMessage) {
          newMessage('This HoloFuel Peer is currently unable to be located in the network. \n Please verify the hash, ensure your HoloFuel Peer is online, and try again after a few minutes.')
          setHasDisplayedNotFoundMessage(true)
        }
      } else {
        setCounterpartyFound(true)
        setHasDisplayedNotFoundMessage(false)
      }
    } else {
      setCounterpartyFound(false)
      setHasDisplayedNotFoundMessage(false)
    }
  }, [setCounterpartyFound, setHasDisplayedNotFoundMessage, hasDisplayedNotFoundMessage, loading, notFound, newMessage, id])

  if (loading) {
    // TODO: Unsubscribe from Loader to avoid any potential mem leak.
    return <>
      <Loading
        dataTestId='counterparty-loading'
        type='ThreeDots'
        height={30}
        width={30} />
    </>
  }

  if (queryError || !nickname) return <>No nickname available.</>
  return <>{nickname}</>
}
