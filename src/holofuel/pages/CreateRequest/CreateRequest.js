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

  const [counterpartyId, setCounterpartyId] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')

  useEffect(() => {
    setCounterpartyNick(presentAgentId(counterpartyId))
  }, [counterpartyId])

  const { register, handleSubmit, errors, setValue: setFormValue } = useForm({ validationSchema: FormValidationSchema })

  const selectAgent = id => {
    setCounterpartyId(id)
    setFormValue('counterpartyId', id)
  }

  const { newMessage } = useFlashMessageContext()

  const onSubmit = ({ amount, counterpartyId, notes }) => {
    createRequest(amount, counterpartyId, notes)
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
        <label htmlFor='counterpartyId' styleName='form-label'>From</label>
        <input
          name='counterpartyId'
          id='counterpartyId'
          styleName='form-input'
          ref={register}
          onChange={({ target: { value } }) => setCounterpartyId(value)} />
        <div styleName='hash-and-nick'>
          {counterpartyId.length === AGENT_ID_LENGTH && <HashIcon hash={counterpartyId} size={26} styleName='hash-icon' />}
          {counterpartyId.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname'>
            <RenderNickname agentId={counterpartyId} setCounterpartyNick={setCounterpartyNick} />
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
