import React, { useState, useContext, useEffect } from 'react'
import { isEmpty } from 'lodash/fp'
import FlashMessageContext from 'holofuel/contexts/flashMessage'
import './FlashMessage.module.css'

export function FlashMessage () {
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

  return <div>
    {message} <button onClick={() => setIsDisplayed(false)}>Close</button>
  </div>
}
