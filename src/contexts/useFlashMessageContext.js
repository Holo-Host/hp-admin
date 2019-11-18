import React, { createContext, useContext, useState } from 'react'

export const FlashMessageContext = createContext()

export function FlashMessageProvider ({ children }) {
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

export default function useFlashMessageContext () {
  return useContext(FlashMessageContext)
}
