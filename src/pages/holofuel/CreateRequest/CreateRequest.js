import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import PrimaryLayout from 'components/holofuel/layout/PrimaryLayout'
import HashIcon from 'components/holofuel/HashIcon'
import Button from 'components/holofuel/Button'
import './CreateRequest.module.css'

// TODO: these constants should come from somewhere more scientific
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
  return (amount, counterparty) => offer({
    variables: { amount, counterparty }
  })
}

export default function CreateRequest ({ history: { push } }) {
  const createRequest = useRequestMutation()

  const [counterparty, setCounterparty] = useState('')

  const { register, handleSubmit, errors } = useForm({ validationSchema: FormValidationSchema })

  const onSubmit = ({ amount, counterparty }) => {
    createRequest(amount, counterparty)
    push('/history')
  }

  !isEmpty(errors) && console.log('Request form errors (leave here until proper error handling is implemented):', errors)

  return <PrimaryLayout headerProps={{ title: 'Request' }}>
    <div styleName='help-text'>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    <form styleName='request-form' onSubmit={handleSubmit(onSubmit)}>
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
      <Button type='submit' wide variant='secondary' styleName='send-button'>Send</Button>
    </form>
  </PrimaryLayout>
}
