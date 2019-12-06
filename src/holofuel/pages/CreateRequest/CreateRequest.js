import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Loader from 'react-loader-spinner'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'holofuel/components/Button'
import RecentCounterparties from 'holofuel/components/RecentCounterparties'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import { HISTORY_PATH } from 'holofuel/utils/urls'
import './CreateRequest.module.css'

// TODO: this constants should come from somewhere more scientific
const AGENT_ID_LENGTH = 63

const FormValidationSchema = yup.object().shape({
  counterpartyId: yup.string()
    .required()
    .length(AGENT_ID_LENGTH),
  amount: yup.number()
    .required()
    .positive()
})

function useRequestMutation () {
  const [offer] = useMutation(HolofuelRequestMutation)
  return (amount, counterpartyId, notes) => offer({
    variables: { amount, counterpartyId, notes }
  })
}

export default function CreateRequest ({ history: { push } }) {
  const { data: { holofuelHistoryCounterparties: agents } = {} } = useQuery(HolofuelHistoryCounterpartiesQuery)
  const createRequest = useRequestMutation()

  const { newMessage } = useFlashMessageContext()

  const [counterpartyId, setCounterpartyId] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [disabled, setDisabled] = useState('')

  if (errorMessage) {
    newMessage(errorMessage)
    setErrorMessage('')
  }

  useEffect(() => {
    setCounterpartyNick(presentAgentId(counterpartyId))
  }, [counterpartyId])

  const { register, handleSubmit, errors, setValue: setFormValue } = useForm({ validationSchema: FormValidationSchema })

  const selectAgent = id => {
    setCounterpartyId(id)
    setFormValue('counterpartyId', id)
  }

  const onSubmit = ({ amount, counterpartyId, notes }) => {
    createRequest(amount, counterpartyId, notes)
    push(HISTORY_PATH)
    newMessage(`Request for ${presentHolofuelAmount(amount)} HF sent to ${counterpartyNick}.`, 5000)
  }

  !isEmpty(errors) && console.log('Request form errors (leave here until proper error handling is implemented):', errors)

  return <PrimaryLayout headerProps={{ title: 'Request' }}>
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='request-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterpartyId' styleName='form-label'>From</label>
        <input
          name='counterpartyId'
          id='counterpartyId'
          styleName='form-input'
          ref={register}
          onChange={({ target: { value } }) => setCounterpartyId(value)} />
        <div styleName='hash-and-nick'>
          {counterpartyId.length === AGENT_ID_LENGTH && !errorMessage && <HashIcon hash={counterpartyId} size={26} styleName='hash-icon' />}
          {counterpartyId.length === AGENT_ID_LENGTH && !errorMessage && <h4 data-testid='counterparty-nickname'>
            <RenderNickname
              agentId={counterpartyId}
              setCounterpartyNick={setCounterpartyNick}
              setDisabled={setDisabled}
              setErrorMessage={setErrorMessage} />
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
          ref={register} />
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
      <Button type='submit' wide variant='secondary' styleName='send-button' disabled={disabled}>Send</Button>
    </form>
  </PrimaryLayout>
}

export function RenderNickname ({ agentId, setCounterpartyNick, setErrorMessage, setDisabled }) {
  const { loading, error, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })
  const { nickname } = holofuelCounterparty
  useEffect(() => {
    setCounterpartyNick(nickname)
  }, [setCounterpartyNick, nickname])

  let errorMessage = ''
  let disabled = false
  if (!nickname && !loading) {
    errorMessage = 'This HoloFuel Peer with whom you would to transact is currently unable to be located in the network. \n Please verify the hash, ensure your HoloFuel Peer is online, and try again after a few minutes.'
    disabled = true
  }

  useEffect(() => {
    setErrorMessage(errorMessage)
  }, [setErrorMessage, errorMessage])

  useEffect(() => {
    setDisabled(disabled)
  }, [setDisabled, disabled])

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
  if (error || !nickname) return <>No nickname available.</>
  return <>{nickname}</>
}
