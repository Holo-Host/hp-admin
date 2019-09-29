import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Loader from 'react-loader-spinner'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
// import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'holofuel/components/Button'
import './CreateOffer.module.css'

// TODO: these constants should come from somewhere more scientific
export const FEE_PERCENTAGE = 0.005
const AGENT_ID_LENGTH = 63

const FormValidationSchema = yup.object().shape({
  counterparty: yup.string()
    .required()
    .length(AGENT_ID_LENGTH),
  amount: yup.number()
    .required()
    .positive()
})

function useOfferMutation () {
  const [offer] = useMutation(HolofuelOfferMutation)
  return (amount, counterparty) => offer({
    variables: { amount, counterparty }
  })
}

export default function CreateOffer ({ history: { push } }) {
  const createOffer = useOfferMutation()

  const [counterparty, setCounterparty] = useState('')
  const [fee, setFee] = useState('0')

  const { register, handleSubmit, errors } = useForm({ validationSchema: FormValidationSchema })

  // const { newMessage } = useFlashMessageContext()

  const onAmountChange = amount => {
    if (isNaN(amount)) return
    setFee((amount * FEE_PERCENTAGE).toFixed(2))
  }

  const onSubmit = ({ amount, counterparty }) => {
    createOffer(amount, counterparty)
    push('/history')
  }

  !isEmpty(errors) && console.log('Offer form errors (leave here until proper error handling is implemented):', errors)

  return <PrimaryLayout headerProps={{ title: 'Offer' }}>
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterparty' styleName='form-label'>To</label>
        <input
          name='counterparty'
          id='counterparty'
          styleName='form-input'
          ref={register}
          onChange={({ target: { value } }) => setCounterparty(value)} />
        <div styleName='hash-icon-wrapper'>
          {counterparty.length === AGENT_ID_LENGTH && <HashIcon hash={counterparty} size={26} />}
        </div>
        <div styleName='hash-nickname-wrapper'>
          {counterparty.length === AGENT_ID_LENGTH && <h4 data-testid='counterparty-nickname'><RenderNickname agentId={counterparty} /></h4>}
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
        <label htmlFor='fee' styleName='form-label'>Fee</label>
        <input
          name='fee'
          id='fee'
          value={fee}
          readOnly
          styleName='fee-input' />
        <span styleName='hf'>HF</span>
      </div>
      <Button type='submit' wide variant='secondary' styleName='send-button'>Send</Button>
    </form>
  </PrimaryLayout>
}

export function RenderNickname ({ agentId }) {
  const { loading, error, data } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })

  // const { newMessage } = useFlashMessageContext()

  if (loading) {
    return <React.Fragment>
      <Loader
        type='ThreeDots'
        color='#00BFFF'
        height={30}
        width={30}
        timeout={5000}
      />
     Loading
    </React.Fragment>
  }
  // NB: TODO: Resolve the Flash Message ERROR:
  // if (error || !data.holofuelCounterparty.nickname) { return newMessage(`No nickname available.`, 5000) }
  if (error || !data.holofuelCounterparty.nickname) { return 'No nickname available.' }
  return <React.Fragment>{data.holofuelCounterparty.nickname}</React.Fragment>
}
