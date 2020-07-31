import React, { useState } from 'react'
import { isEmpty } from 'lodash'
import cx from 'classnames'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import './AmountInput.module.css'

// NB: The sum of the intgr and fraction cannot exceed 19 and be within a valid holofuel range
const INTEGER_PLACEVALUE_LIMIT = 13
const FRACTION_PLACEVALUE_LIMIT = 6

const useParseHolofuelAmount = () => {
  return stringAmount => {
    const hasDot = /\./.test(stringAmount)
    const [integer, fraction] = stringAmount.split('.')
    let hasAmountError = ''

    let verifiedInteger, verifiedFraction
    const parsedInteger = Number(integer).toString()
    verifiedInteger = !isNaN(parsedInteger) ? parsedInteger : ''
    verifiedFraction = fraction

    if (parsedInteger && parsedInteger.length > INTEGER_PLACEVALUE_LIMIT) {
      // throw error if integer exceeds trillions (13 digits)
      hasAmountError = 'The max transaction amount per a single transaction is 1 trillion TF'
      verifiedInteger = parsedInteger.substring(0, INTEGER_PLACEVALUE_LIMIT)
    }

    if (fraction && fraction.length > FRACTION_PLACEVALUE_LIMIT) {
      // throw error if decimal exceeds 6 place values of percision (one-millionths)
      hasAmountError = `Your transaction amount cannot exceed ${FRACTION_PLACEVALUE_LIMIT} decimals`
      verifiedFraction = fraction.substring(0, FRACTION_PLACEVALUE_LIMIT)
    }

    const amount = (hasDot && verifiedFraction)
      ? verifiedInteger + '.' + verifiedFraction
      : hasDot
        ? verifiedInteger + '.'
        : verifiedInteger || verifiedFraction

    const presentedAmount = (hasDot && verifiedFraction)
      ? Number(verifiedInteger).toLocaleString() + '.' + verifiedFraction
      : hasDot
        ? Number(verifiedInteger).toLocaleString() + '.'
        : Number(verifiedInteger).toLocaleString() || verifiedFraction

    return { amount, presentedAmount, hasAmountError }
  }
}

export default function AmountInput ({ amount, setAmount, chooseSend, chooseRequest }) {
  const [presentedValue, setPresentedValue] = useState(String(amount))
  const [inputValue, setInputValueRaw] = useState(String(amount))
  const [amountError, setAmountError] = useState('')

  const isValidAmount = amount > 0
  const parseHolofuelAmount = useParseHolofuelAmount()

  const setInputValue = value => {
    const cleanValue = value.replace(/[^0-9.]/g, '') || '0' // strips non numerical characters
    const { amount, presentedAmount, hasAmountError } = parseHolofuelAmount(cleanValue)
    setPresentedValue(presentedAmount)
    setInputValueRaw(amount)
    setAmount(amount, presentedAmount)
    setAmountError(hasAmountError)
  }

  const addDigit = digit => () => {
    // return early if trying to add a second .
    if (digit === '.' && /\./.test(inputValue)) return
    setInputValue(inputValue + String(digit))
  }

  const removeDigit = () => setInputValue(inputValue.slice(0, -1))

  return <PrimaryLayout showAlphaFlag={false}>
    <div styleName='amount-input-container'>
      <input
        styleName='amount-input-amount'
        data-testid='amount'
        onChange={e => setInputValue(e.target.value)}
        value={presentedValue}
      />
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
        <Button onClick={chooseSend} disabled={!isValidAmount} variant='white' styleName={cx('action-button', { disabled: !isValidAmount })}>
          Send
        </Button>
        <Button onClick={chooseRequest} disabled={!isValidAmount} variant='white' styleName={cx('action-button', { disabled: !isValidAmount })}>
          Request
        </Button>
      </div>
      {!isEmpty(amountError) && <h3 styleName='error-text'>{amountError}</h3>}
    </div>
  </PrimaryLayout>
}
