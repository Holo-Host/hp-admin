import React, { useContext, useCallback, useEffect } from 'react'
import { isEmpty } from 'lodash/fp'
import cx from 'classnames'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import './FlashMessage.module.css'

export default function FlashMessage () {
  const isWide = useContext(ScreenWidthContext)
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

  return <div styleName={cx('flash-message', { 'desktop': isWide })}>
    <div styleName='flash-body'>{message}</div>
    <button styleName='close-button' onClick={clearMessage}>x</button>
  </div>
}
