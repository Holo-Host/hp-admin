import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import Header from 'components/holofuel/Header'
import HashIcon from 'components/holofuel/HashIcon'
import Button from 'components/holofuel/Button'
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

  const onAmountChange = amount => {
    if (isNaN(amount)) return
    setFee((amount * FEE_PERCENTAGE).toFixed(2))
  }

  const onSubmit = ({ amount, counterparty }) => {
    createOffer(amount, counterparty)
    // TODO: this should redirect to the transaction list once that page is merged
    push('/')
  }

  !isEmpty(errors) && console.log('Offer form errors (leave here until proper error handling is implemented):', errors)

  return <>
    <Header title='Offer' />
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='offer-form' onSubmit={handleSubmit(onSubmit)}>
      <div styleName='form-row'>
        <label htmlFor='counterparty' styleName='form-label'>To</label>
        <input
          name='counterparty'
          styleName='form-input'
          ref={register}
          onChange={({ target: { value } }) => setCounterparty(value)} />
        <div styleName='hash-icon-wrapper'>
          {counterparty.length === AGENT_ID_LENGTH && <HashIcon hash={counterparty} size={26} />}
        </div>
      </div>
      <div styleName='form-row'>
        <label htmlFor='amount' styleName='form-label'>Amount</label>
        <input
          name='amount'
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
          value={fee}
          readOnly
          styleName='fee-input' />
        <span styleName='hf'>HF</span>
      </div>
      <Button type='submit' wide variant='secondary' styleName='send-button'>Send</Button>
    </form>
  </>
}
