import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Loader from 'react-loader-spinner'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'holofuel/components/Button'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId, presentHolofuelAmount } from 'utils'
import './CreateRequest.module.css'

// TODO: this constants should come from somewhere more scientific
const AGENT_ID_LENGTH = 63

const FormValidationSchema = yup.object().shape({
  counterparty: yup.string()
    .required()
    .length(AGENT_ID_LENGTH),
  amount: yup.number()
    .required()
    .positive()
})

function useRequestMutation () {
  const [offer] = useMutation(HolofuelRequestMutation)
  return (amount, counterparty, notes) => offer({
    variables: { amount, counterparty, notes }
  })
}

export default function CreateRequest ({ history: { push } }) {
  const createRequest = useRequestMutation()

  const [counterparty, setCounterparty] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')
  useEffect(() => {
    setCounterpartyNick(presentAgentId(counterparty))
  }, [counterparty])

  const { register, handleSubmit, errors } = useForm({ validationSchema: FormValidationSchema })

  const { newMessage } = useFlashMessageContext()

  const onSubmit = ({ amount, counterparty, notes }) => {
    createRequest(amount, counterparty, notes)
    push('/history')
    newMessage(`Request for ${presentHolofuelAmount(amount)} HF sent to ${counterpartyNick}.`, 5000)
  }

  !isEmpty(errors) && console.log('Request form errors (leave here until proper error handling is implemented):', errors)

  return <PrimaryLayout headerProps={{ title: 'Request' }}>
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='request-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterparty' styleName='form-label'>From</label>
        <input
          name='counterparty'
          id='counterparty'
          styleName='form-input'
          ref={register}
          onChange={({ target: { value } }) => setCounterparty(value)} />
        <div styleName='hash-and-nick'>
          {counterparty.length === AGENT_ID_LENGTH && <HashIcon hash={counterparty} size={26} styleName='hash-icon' />}
          {counterparty.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname'>
            <RenderNickname agentId={counterparty} setCounterpartyNick={setCounterpartyNick} />
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
      <Button type='submit' wide variant='secondary' styleName='send-button'>Send</Button>
    </form>
  </PrimaryLayout>
}

export function RenderNickname ({ agentId, setCounterpartyNick }) {
  const { loading, error, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })
  const { nickname } = holofuelCounterparty
  useEffect(() => {
    setCounterpartyNick(nickname)
  }, [setCounterpartyNick, nickname])

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
