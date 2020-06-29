import React, { createContext, useContext, useState } from 'react'

export const ErrorContext = createContext()

export function ErrorProvider ({ children }) {
  const [currentError, setCurrentError] = useState({})
  return <ErrorContext.Provider value={{ currentError, setCurrentError }}>
    {children}
  </ErrorContext.Provider>
}

export default function useErrorContext () {
  return useContext(ErrorContext)
}
