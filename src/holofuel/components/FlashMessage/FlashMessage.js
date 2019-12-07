import React, { useCallback, useEffect } from 'react'
import { isEmpty } from 'lodash/fp'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import './FlashMessage.module.css'

export default function FlashMessage () {
  const { message, time, newMessage } = useFlashMessageContext()
  const clearMessage = useCallback(
    () => newMessage('', 0),
    [newMessage])

  useEffect(() => {
    if (time) {
      setTimeout(() => {
        clearMessage()
      }, time)
    }
  }, [message, time, clearMessage])

  if (isEmpty(message)) return null

  return <div styleName='flash-message'>
    <div styleName='message'>{message}</div>
    <button styleName='close-button' onClick={clearMessage}>x</button>
  </div>
}
