import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Loader from 'react-loader-spinner'
import cx from 'classnames'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'holofuel/components/Button'
import RecentCounterparties from 'holofuel/components/RecentCounterparties'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { HISTORY_PATH } from 'holofuel/utils/urls'
import './CreateOfferRequest.module.css'

// TODO: these constants should come from somewhere more scientific
export const FEE_PERCENTAGE = 0.01
const AGENT_ID_LENGTH = 63

const FormValidationSchema = yup.object().shape({
  counterpartyId: yup.string()
    .required()
    .length(AGENT_ID_LENGTH)
    .trim(),
  amount: yup.number()
    .required()
    .positive()
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
  const [mode, setMode] = useState(OFFER_MODE)

  const { data: { holofuelUser: whoami = {} } = {} } = useQuery(HolofuelUserQuery)
  const { data: { holofuelHistoryCounterparties: agents } = {} } = useQuery(HolofuelHistoryCounterpartiesQuery)
  const createOffer = useOfferMutation()
  const createRequest = useRequestMutation()

  const { newMessage } = useFlashMessageContext()
  const [hasDisplayedFlashMessage, setHasDisplayedFlashMessage] = useState(false)

  const [counterpartyId, setCounterpartyId] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')
  const [isCounterpartyFound, setCounterpartyFound] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    setCounterpartyNick(presentAgentId(counterpartyId))
    if (counterpartyId.length === AGENT_ID_LENGTH && counterpartyId === whoami.id) {
      setIsFormValid(false)
      if (!hasDisplayedFlashMessage) {
        newMessage('You cannot send yourself TestFuel.')
        setHasDisplayedFlashMessage(true)
      }
    } else {
      setIsFormValid(true)
      setHasDisplayedFlashMessage(false)
    }
  }, [counterpartyId, whoami, setIsFormValid, newMessage, hasDisplayedFlashMessage, setHasDisplayedFlashMessage])

  const { register, handleSubmit, errors, setValue: setFormValue } = useForm({ validationSchema: FormValidationSchema })

  const selectAgent = id => {
    setCounterpartyId(id)
    setFormValue('counterpartyId', id)
  }

  const [fee, setFee] = useState(0)
  const [total, setTotal] = useState(0)

  const onAmountChange = amount => {
    if (isNaN(amount)) return null
    else if (amount < 0) {
      setIsFormValid(false)
      return newMessage(`You cannot ${mode === OFFER_MODE ? 'send' : 'request'} negative amounts.`)
    } else {
      setIsFormValid(true)
      const newFee = Number(amount) * FEE_PERCENTAGE
      setFee(newFee)
      setTotal(Number(amount) + newFee)
    }
  }

  const onSubmit = ({ amount, counterpartyId, notes }) => {
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

  return <PrimaryLayout headerProps={{ title }}>
    <div styleName='mode-toggle'>
      {[OFFER_MODE, REQUEST_MODE].map(buttonMode =>
        <Button styleName={cx('mode-toggle-button', { selected: buttonMode === mode })}
          onClick={() => setMode(buttonMode)}
          key={buttonMode}>
          {modeVerbs[buttonMode]}
        </Button>)}
    </div>
    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterpartyId' styleName='form-label'>{modePrepositions[mode]}</label>
        <input
          name='counterpartyId'
          id='counterpartyId'
          styleName='form-input'
          placeholder='Who is this for?'
          ref={register}
          onChange={({ target: { value } }) => setCounterpartyId(value)} />
        <div styleName='hash-and-nick'>
          {counterpartyId.length === AGENT_ID_LENGTH && <HashIcon hash={counterpartyId} size={26} styleName='hash-icon' />}
          {counterpartyId.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname'>
            <RenderNickname
              agentId={counterpartyId}
              setCounterpartyNick={setCounterpartyNick}
              counterpartyNick={counterpartyNick}
              setCounterpartyFound={setCounterpartyFound}
              newMessage={newMessage}
              whoami={whoami} />
          </h4>}
        </div>
      </div>
      <div styleName='form-row'>
        <label htmlFor='amount' styleName='form-label'>Amount</label>
        <input
          name='amount'
          id='amount'
          type='number'
          min='0'
          styleName='number-input'
          ref={register}
          onChange={({ target: { value } }) => onAmountChange(value)} />
        <span styleName='hf'>TF</span>
      </div>
      {mode === OFFER_MODE && <div styleName='form-row'>
        <label htmlFor='fee' styleName='form-label'>Fee (1%)</label>
        <input
          name='fee'
          id='fee'
          value={fee.toFixed(2)}
          readOnly
          styleName='readonly-input' />
        <span styleName='hf'>TF</span>
      </div>}
      <div styleName='form-row'>
        <label htmlFor='total' styleName='form-label'>Total</label>
        <input
          name='total'
          id='total'
          value={total.toFixed(2)}
          readOnly
          styleName='readonly-input' />
        <span styleName='hf'>TF</span>
      </div>
      <textarea
        styleName='notes-input'
        name='notes'
        placeholder='What is this for?'
        ref={register} />

      <RecentCounterparties
        styleName='recent-counterparties'
        agents={agents}
        selectedAgentId={counterpartyId}
        selectAgent={selectAgent} />
      <Button type='submit' dataTestId='submit-button' wide variant='secondary' styleName='send-button' disabled={counterpartyId.length !== AGENT_ID_LENGTH || !isCounterpartyFound || !isFormValid}>Send</Button>
    </form>
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
  }, [setCounterpartyFound, setHasDisplayedNotFoundMessage, hasDisplayedNotFoundMessage, loading, notFound, newMessage, whoami, id])

  if (loading) {
    // TODO: Unsubscribe from Loader to avoid any potential mem leak.
    return <>
      <Loader
        type='ThreeDots'
        color='#00BFFF'
        height={30}
        width={30}
        timeout={3000}
      />
       Loading
    </>
  }

  if (queryError || !nickname) return <>No nickname available.</>
  return <>{nickname}</>
}
