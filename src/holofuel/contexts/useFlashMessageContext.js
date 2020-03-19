import React, { createContext, useContext, useState, useCallback } from 'react'

export const FlashMessageContext = createContext()

export function FlashMessageProvider ({ children }) {
  const [message, setMessage] = useState('')
  const [time, setTime] = useState()
  const [linkText, setLinkText] = useState('')
  const [link, setLink] = useState()

  const newMessage = useCallback((message, time, linkText, link) => {
    setMessage(message)
    setTime(time)
    setLinkText(linkText)
    setLink(link)
  }, [setMessage, setTime])

  return <FlashMessageContext.Provider value={{ message, time, newMessage, linkText, link }}>
    {children}
  </FlashMessageContext.Provider>
}

export default function useFlashMessageContext () {
  return useContext(FlashMessageContext)
}
