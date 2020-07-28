import React, { createContext, useContext, useState, useCallback } from 'react'

export const FlashMessageContext = createContext()

export function FlashMessageProvider ({ children }) {
  const [message, setMessage] = useState('')
  const [time, setTime] = useState()

  const newMessage = useCallback((message, time) => {
    console.log('going to set message .... : ', message);
    setMessage(message)
    setTime(time)
  }, [setMessage, setTime])

  return <FlashMessageContext.Provider value={{ message, time, newMessage }}>
    {children}
  </FlashMessageContext.Provider>
}

export default function useFlashMessageContext () {
  return useContext(FlashMessageContext)
}
