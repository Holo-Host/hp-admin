import React, { createContext, useContext, useState } from 'react'

export const AuthTokenContext = createContext()

export function AuthTokenProvider ({ children }) {
  const [isAuthed, setIsAuthed] = useState(process.env.NODE_ENV === 'development')

  return <AuthTokenContext.Provider value={{ isAuthed, setIsAuthed }}>
    {children}
  </AuthTokenContext.Provider>
}

export default function useAuthTokenContext () {
  return useContext(AuthTokenContext)
}
