import React, { useState } from 'react'
import cx from 'classnames'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import './AmountInput.module.css'
import { isEmpty } from 'lodash'

const useParseHolofuelAmount = () => {
  return stringAmount => {
    const hasDot =  /\./.test(stringAmount)
    const [integer, fraction] = stringAmount.split('.')
    const hasAmountError = { integer: '', fraction: '' }

    const parsedInteger = Number(integer).toString()
    const parsedFraction = (fraction === undefined || fraction === null || fraction === '') 
      ? '' 
      : fraction === 0
        ? '0'
        // toString method will filter a leading zero,
        //  we compare the length diff to determine whether
        //  to maintain the leading 0
        : (fraction.length - Number(fraction).toString().length) === 1
          ? '0' + Number(fraction).toString()
          : Number(fraction).toString()

    let verifiedInteger, verifiedFraction
    verifiedInteger = !isNaN(parsedInteger) ? parsedInteger : ''
    verifiedFraction = !isNaN(parsedFraction) ? parsedFraction : ''

    if (parsedInteger && parsedInteger.length > 13) {
      console.log('PARSED INTEGER : ', parsedInteger);
      // throw error if integer exceeds trillions
      hasAmountError['integer'] = 'The max transaction amount per a single transaction is 1 trillion TF'
      console.log('hasAmountError : ', hasAmountError)
      verifiedInteger = parsedInteger.substring(0, 13)
    }

    if (parsedFraction && parsedFraction.length > 6) {
      console.log('PARSED Fraction : ', parsedFraction);
      // throw error if decimal exceeds 6 place values of percision (one-millionths)
      hasAmountError[fraction] = 'Your transaction amount cannot exceed 6 decimals'
      verifiedFraction = parsedFraction.substring(0, 6)
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
  const [inputValue, setInputValueRaw] = useState(String(amount))
  const [presentedValue, setPresentedValue] = useState('')

  const isValidAmount = amount > 0
  const parseHolofuelAmount = useParseHolofuelAmount()


  const setInputValue = value => {
    const cleanValue = value.replace(/[^0-9.]/g, '') || '0' // strips non numerical characters
    const { amount, presentedAmount } = parseHolofuelAmount(cleanValue)
    setInputValueRaw(amount)
    setPresentedValue(presentedAmount)
    setAmount(amount)
    console.log('AMOUNT >>>>>> ', amount)
  }

  // TODO: determine how to show error...
  const { hasAmountError } = parseHolofuelAmount(inputValue)

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
      {/* for num pad entry errors */}
      {!isEmpty(hasAmountError) && <h3 styleName='numpad-button'>{hasAmountError.integer || hasAmountError.fraction}</h3>} 
    </div>
  </PrimaryLayout>
}

