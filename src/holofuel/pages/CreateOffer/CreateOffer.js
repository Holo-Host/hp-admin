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
import './CreateOffer.module.css'

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

  const [fee, setFee] = useState(0)
  const [total, setTotal] = useState(0)

  const { newMessage } = useFlashMessageContext()

  const onAmountChange = amount => {
    if (isNaN(amount)) return
    const newFee = Number(amount) * FEE_PERCENTAGE
    setFee(newFee)
    setTotal(Number(amount) + newFee)
  }

  const onSubmit = ({ amount, counterpartyId, notes }) => {
    createOffer(amount, counterpartyId, notes)
    push('/history')
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
