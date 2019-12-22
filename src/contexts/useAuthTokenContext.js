import React, { createContext, useContext, useState } from 'react'

// For Robbie: everything that sez AuthToken* should prolly be renamed to Auth*
export const AuthTokenContext = createContext()

export function AuthTokenProvider ({ children }) {
  const [isAuthed, setIsAuthed] = useState(false)

  return <AuthTokenContext.Provider value={{ isAuthed, setIsAuthed }}>
    {children}
  </AuthTokenContext.Provider>
}

export default function useAuthTokenContext () {
  return useContext(AuthTokenContext)
}
