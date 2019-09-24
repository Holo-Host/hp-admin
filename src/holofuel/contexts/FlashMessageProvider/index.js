import React, { useState } from 'react'
import FlashMessageContext from 'holofuel/contexts/flashMessage'

export default function FlashMessageProvider ({ children }) {
  const [message, setMessage] = useState('')
  const [time, setTime] = useState()
  const newMessage = (message, time) => {
    setMessage(message)
    setTime(time)
  }
  return <FlashMessageContext.Provider value={{ message, time, newMessage }}>
    {children}
  </FlashMessageContext.Provider>
}
