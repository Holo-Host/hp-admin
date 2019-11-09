import React, { createContext, useContext, useState } from 'react'

export const AuthTokenContext = createContext()

export function AuthTokenProvider ({ children }) {
  const [authToken, setAuthToken] = useState('')
  const [isAuthed, setIsAuthed] = useState('')

  return <AuthTokenContext.Provider value={{ authToken, setAuthToken, isAuthed, setIsAuthed }}>
    {children}
  </AuthTokenContext.Provider>
}

export default function useAuthTokenContext () {
  return useContext(AuthTokenContext)
}
