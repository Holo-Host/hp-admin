import React, { useCallback, useEffect } from 'react'
import { isEmpty } from 'lodash/fp'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import './FlashMessage.module.css'
import { Link } from 'react-router-dom'

export default function FlashMessage () {
  const { message, time, newMessage, linkText, link } = useFlashMessageContext()
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
    <div styleName='flash-body'>
      {link ? <>
        <div styleName='message'>{message}</div>
        <br />
        <Link to={link}>{linkText}</Link>
      </>
        : <div styleName='message'>{message}</div> }
    </div>
    <button styleName='close-button' onClick={clearMessage}>x</button>
  </div>
}
