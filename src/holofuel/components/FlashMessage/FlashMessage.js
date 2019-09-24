import React, { useState, useContext, useEffect } from 'react'
import { isEmpty } from 'lodash/fp'
import FlashMessageContext from 'holofuel/contexts/flashMessage'
import './FlashMessage.module.css'

export default function FlashMessage () {
  const [isDisplayed, setIsDisplayed] = useState(false)
  const { message, time, newMessage } = useContext(FlashMessageContext)

  useEffect(() => {
    setIsDisplayed(true)
    if (time) {
      setTimeout(() => {
        newMessage('', 0)
      }, time)
    }
  }, [message, time, newMessage])

  if (!isDisplayed || isEmpty(message)) return null

  return <div styleName='flash-message'>
    <div styleName='message'>{message}</div>
    <button styleName='close-button' onClick={() => setIsDisplayed(false)}>x</button>
  </div>
}
