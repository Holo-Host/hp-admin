import React, { useState } from 'react'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import './AmountInput.module.css'

export default function AmountInput ({ amount, setAmount, chooseSend, chooseRequest }) {
  // we can't just use amount because amount is a number, and here we need to distinguish between values like '23' and '23.'
  const [inputValue, setInputValueRaw] = useState(String(amount))

  const setInputValue = value => {
    const cleanValue = value.replace(/[^0-9.]/g, '') || 0 // strips non numerical characters
    setInputValueRaw(cleanValue)
    setAmount(Number(cleanValue))
  }

  const addDigit = digit => () => {
    // return early if trying to add a second .
    if (digit === '.' && /\./.test(inputValue)) return

    setInputValue(String(inputValue) + String(digit))
  }
  const removeDigit = () => setInputValue(String(inputValue).slice(0, -1))

  return <PrimaryLayout showAlphaFlag={false}>
    <div styleName='amount-input-container'>
      <input styleName='amount-input-amount'
        data-testid='amount'
        onChange={e => setInputValue(e.target.value)}
        value={`${presentHolofuelString(inputValue)}`} />
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

function presentHolofuelString (amount) {
  const hasDot = /\./.test(amount)
  const [integer, fraction] = amount.split('.')
  const parsedInteger = Number.parseFloat(integer).toLocaleString()
  if (hasDot) {
    return parsedInteger + '.' + fraction
  } else {
    return parsedInteger
  }
}
