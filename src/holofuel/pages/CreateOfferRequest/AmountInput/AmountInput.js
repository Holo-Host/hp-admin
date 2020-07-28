import React, { useState } from 'react'
import cx from 'classnames'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import './AmountInput.module.css'

const usePresentHolofuelString = () => {
  return stringAmount => {
    let verifiedInteger, verifiedFraction
    const hasAmountError = { integer: '', fraction: '' }
    const [integer, fraction] = stringAmount.split('.')

    const parsedInteger = (Number(integer)).toLocaleString()
    const parsedFraction = (Number(fraction)).toString()
    verifiedInteger = !isNaN(parsedInteger) ? parsedInteger : ''
    verifiedFraction = !isNaN(parsedFraction) ? parsedFraction : ''
    
    if (parsedInteger && parsedInteger.length > 13) {
      console.log('PARSED INTEGER : ', parsedInteger);
      // todo: throw error if integer exceeds trillions
      hasAmountError[parsedInteger] = 'The max transaction amount per a single transaction is 1 trillion TF'
      verifiedInteger = parsedInteger.substring(0, 14)
    }
    if (parsedFraction && parsedFraction.length > 6) {
      console.log('PARSED FRACTION : ', parsedFraction);
      // todo: throw error if decimal exceeds 6 place values of percision (one-millionths)
      hasAmountError[parsedFraction] = 'Your transaction amount cannot exceed 6 decimals'
      verifiedFraction = parsedFraction.substring(0, 7)
    }
    
    const amount = (verifiedInteger && verifiedFraction)
      ? verifiedInteger + '.' + verifiedFraction
      : verifiedInteger || verifiedFraction

    return { verifiedInteger, verifiedFraction, amount, hasAmountError }
  }
}

export default function AmountInput ({ amount, setAmount, chooseSend, chooseRequest }) {
  const [inputValue, setInputValueRaw] = useState(String(amount))

  const isValidAmount = amount > 0
  const presentHolofuelAmont = usePresentHolofuelString()


  const setInputValue = value => {
    const cleanValue = value.replace(/[^0-9.]/g, '') || '0' // strips non numerical characters
    const { verifiedInteger, verifiedFraction, amount } = presentHolofuelAmont(cleanValue)
    setInputValueRaw(amount)
    // setAmount(amount)
    console.log('AMOUNT >>>>>> ', amount)
  }

  const { hasAmountError } = presentHolofuelAmont(inputValue)
  // TODO: determine how to show error...

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
        value={`${inputValue}`}
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
    </div>
  </PrimaryLayout>
}

