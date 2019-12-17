import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Loader from 'react-loader-spinner'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'holofuel/components/Button'
import RecentCounterparties from 'holofuel/components/RecentCounterparties'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { HISTORY_PATH } from 'holofuel/utils/urls'
import './CreateOffer.module.css'
import Login from '../../../pages/Login/Login'

// TODO: these constants should come from somewhere more scientific
export const FEE_PERCENTAGE = 0.01
const AGENT_ID_LENGTH = 63

const FormValidationSchema = yup.object().shape({
  counterpartyId: yup.string()
    .required()
    .length(AGENT_ID_LENGTH),
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

export default function CreateOffer ({ history: { push } }) {
  const { data: { holofuelHistoryCounterparties: agents } = {} } = useQuery(HolofuelHistoryCounterpartiesQuery)
  const createOffer = useOfferMutation()

  const { newMessage } = useFlashMessageContext()

  const [counterpartyId, setCounterpartyId] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [counterpartyNotFound, setCounterpartyNotFound] = useState(true)

  useEffect(() => {
    setCounterpartyNick(presentAgentId(counterpartyId))
  }, [counterpartyId])

  const { register, handleSubmit, errors, setValue: setFormValue, getValues } = useForm({ validationSchema: FormValidationSchema })
  const formValues = getValues()

  useEffect(() => {
    console.log(' !!!!!!!!!!!!!!! inside use effect ...')
    console.log('1. page counterpartyNotFound : ', counterpartyNotFound)
    console.log('1. page errorMessage : ', errorMessage)
    if (errorMessage) {
      newMessage(errorMessage)
    }
  }, [errorMessage, setErrorMessage])

  const selectAgent = id => {
    setCounterpartyId(id)
    setFormValue('counterpartyId', id)
  }

  const [fee, setFee] = useState(0)
  const [total, setTotal] = useState(0)

  const onAmountChange = amount => {
    if (isNaN(amount)) return
    const newFee = Number(amount) * FEE_PERCENTAGE
    setFee(newFee)
    setTotal(Number(amount) + newFee)
  }

  const onSubmit = ({ amount, counterpartyId, notes }) => {
    createOffer(amount, counterpartyId, notes)
    push(HISTORY_PATH)
    newMessage(`Offer of ${presentHolofuelAmount(amount)} HF sent to ${counterpartyNick}.`, 5000)
  }

  !isEmpty(errors) && console.log('Offer form errors (leave here until proper error handling is implemented):', errors)

  return <PrimaryLayout headerProps={{ title: 'Offer' }}>
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterpartyId' styleName='form-label'>To</label>
        <input
          name='counterpartyId'
          id='counterpartyId'
          styleName='form-input'
          ref={register}
          onChange={({ target: { value } }) => setCounterpartyId(value)} />
        <div styleName='hash-and-nick'>
          {counterpartyId.length === AGENT_ID_LENGTH && <HashIcon hash={counterpartyId} size={26} styleName='hash-icon' />}
          {counterpartyId.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname'>
            <RenderNickname
              agentId={counterpartyId}
              setCounterpartyNick={setCounterpartyNick}
              setErrorMessage={setErrorMessage}
              errorMessage={errorMessage}
              setCounterpartyNotFound={setCounterpartyNotFound}
              counterpartyNotFound={counterpartyNotFound}
              currentCounterpartyValue={formValues.counterpartyId} />
          </h4>}
        </div>
      </div>
      <div styleName='form-row'>
        <label htmlFor='amount' styleName='form-label'>Amount</label>
        <input
          name='amount'
          id='amount'
          type='number'
          styleName='number-input'
          ref={register}
          onChange={({ target: { value } }) => onAmountChange(value)} />
        <span styleName='hf'>HF</span>
      </div>
      <div styleName='form-row'>
        <label htmlFor='fee' styleName='form-label'>Fee (1%)</label>
        <input
          name='fee'
          id='fee'
          value={fee.toFixed(2)}
          readOnly
          styleName='readonly-input' />
        <span styleName='hf'>HF</span>
      </div>
      <div styleName='form-row'>
        <label htmlFor='total' styleName='form-label'>Total</label>
        <input
          name='total'
          id='total'
          value={total.toFixed(2)}
          readOnly
          styleName='readonly-input' />
        <span styleName='hf'>HF</span>
      </div>
      <textarea
        styleName='notes-input'
        name='notes'
        placeholder='Notes'
        ref={register} />

      <RecentCounterparties
        styleName='recent-counterparties'
        agents={agents}
        selectedAgentId={counterpartyId}
        selectAgent={selectAgent} />
      <Button type='submit' wide variant='secondary' styleName='send-button' disabled={counterpartyId.length === AGENT_ID_LENGTH ? counterpartyNotFound : true}>Send</Button>
    </form>
  </PrimaryLayout>
}

export function RenderNickname ({ agentId, setCounterpartyNick, setErrorMessage, errorMessage, setCounterpartyNotFound, counterpartyNotFound, currentCounterpartyValue }) {
  const { loading, error: queryError, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })

  console.log('2 counterpartyNotFound : ', counterpartyNotFound)
  console.log('2 errorMessage : ', errorMessage)

  const { nickname } = holofuelCounterparty
  useEffect(() => {
    console.log('inside modal useEffect : ', errorMessage, loading)
    if (!loading) {
      if (!errorMessage && !nickname) {
        console.log('NO NICKNAME FOUND')
        errorMessage = 'This HoloFuel Peer is currently unable to be located in the network. \n Please verify the hash, ensure your HoloFuel Peer is online, and try again after a few minutes.'
        setCounterpartyNotFound(true)
        console.log('3 - ERROR >> counterpartyNotFound : ', counterpartyNotFound)
        console.log('3 - ERROR >> errorMessage : ', errorMessage)
      } else if (currentCounterpartyValue && currentCounterpartyValue.length === AGENT_ID_LENGTH) {
        console.log('ALL (SHOULD  BE) GOOD')
        setCounterpartyNick(nickname || '')
        errorMessage = null
        setCounterpartyNotFound(false)
        console.log('3 - SUCCESS >> counterpartyNotFound : ', counterpartyNotFound)
        console.log('3 - SUCCESS >> errorMessage : ', errorMessage)
      }
    }
  })

  useEffect(() => {
    setErrorMessage(errorMessage)
  }, [setErrorMessage, errorMessage])

  if (loading) {
    return <>
      <Loader
        type='ThreeDots'
        color='#00BFFF'
        height={30}
        width={30}
        timeout={5000}
      />
       Loading
    </>
  }

  if (queryError || !nickname) return <>No nickname available.</>
  return <>{nickname}</>
}
