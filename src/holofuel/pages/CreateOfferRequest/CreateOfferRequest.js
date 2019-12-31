import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Loader from 'react-loader-spinner'
import cx from 'classnames'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelCounterpartyQuery from 'graphql/HolofuelCounterpartyQuery.gql'
import HolofuelHistoryCounterpartiesQuery from 'graphql/HolofuelHistoryCounterpartiesQuery.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import HashIcon from 'holofuel/components/HashIcon'
import Button from 'components/UIButton'
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
  const [numpadVisible, setNumpadVisible] = useState(true)
  const [mode, setMode] = useState(OFFER_MODE)

  const { data: { holofuelHistoryCounterparties: agents } = {} } = useQuery(HolofuelHistoryCounterpartiesQuery)
  const createOffer = useOfferMutation()
  const createRequest = useRequestMutation()

  const { newMessage } = useFlashMessageContext()

  const [counterpartyId, setCounterpartyId] = useState('')
  const [counterpartyNick, setCounterpartyNick] = useState('')
  const [isCounterpartyFound, setCounterpartyFound] = useState(false)

  useEffect(() => {
    setCounterpartyNick(presentAgentId(counterpartyId))
  }, [counterpartyId])

  const { register, handleSubmit, errors, setValue: setFormValue } = useForm({ validationSchema: FormValidationSchema })

  const selectAgent = id => {
    setCounterpartyId(id)
    setFormValue('counterpartyId', id)
  }

  const [amount, setAmountRaw] = useState(0)
  const setAmount = amount => setAmountRaw(Number(amount))

  const fee = (amount * FEE_PERCENTAGE) || 0
  const total = amount + fee

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
              newMessage={newMessage} />
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
          value={amount}
          onChange={({ target: { value } }) => setAmount(value)} />
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
      <Button type='submit' dataTestId='submit-button' wide variant='secondary' styleName='send-button' disabled={counterpartyId.length === AGENT_ID_LENGTH ? !isCounterpartyFound : true}>Send</Button>
    </form>
  </PrimaryLayout>
}

export function RenderNickname ({ agentId, setCounterpartyNick, setCounterpartyFound, newMessage }) {
  const { loading, error: queryError, data: { holofuelCounterparty = {} } = {} } = useQuery(HolofuelCounterpartyQuery, {
    variables: { agentId }
  })

  const [hasDisplayedNotFoundMessage, setHasDisplayedNotFoundMessage] = useState(false)

  const { nickname, notFound } = holofuelCounterparty
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
  }, [setCounterpartyFound, setHasDisplayedNotFoundMessage, hasDisplayedNotFoundMessage, loading, notFound, newMessage])

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

export function AmountInput ({ amount, setAmount, chooseSend, chooseRequest }) {
  // we can't just use amount because amount is a number, and here we need to distinguish between values like '23' and '23.'
  const [inputValue, setInputValueRaw] = useState(String(amount))

  const setInputValue = value => {
    const cleanValue = value.replace(/[^0-9.]/g, '') || 0 // strips non numerical characters
    setInputValueRaw(cleanValue)
    setAmount(Number(cleanValue))
  }

  const addDigit = digit => () => setInputValue(String(inputValue) + String(digit))
  const removeDigit = () => setInputValue(String(inputValue).slice(0, -1))

  return <PrimaryLayout showAlphaFlag={false}>
    <div styleName='amount-input-container'>
      <input styleName='amount-input-amount'
        onChange={e => setInputValue(e.target.value)}
        value={`${presentHolofuelAmount(inputValue)}`} />
      <div styleName='numpad'>
        {[1, 4, 7].map(rowStart => <div styleName='numpad-row' key={rowStart}>
          {[0, 1, 2].map(offset => <button styleName='numpad-button' onClick={addDigit(rowStart + offset)} key={offset}>
            {rowStart + offset}
          </button>)}
        </div>)}
        <div styleName='numpad-row'>
          <button styleName='numpad-button' onClick={addDigit('.')}>.</button>
          <button styleName='numpad-button' onClick={addDigit(0)}>0</button>
          <button styleName='numpad-button' onClick={removeDigit}>{'<'}</button>
        </div>
      </div>
      <div styleName='action-row'>
        <Button onClick={chooseSend} variant='white' styleName='action-button'>Send</Button>
        <Button onClick={chooseRequest} variant='white' styleName='action-button'>Request</Button>
      </div>
    </div>
  </PrimaryLayout>
}
