import React, { createContext, useContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider ({ children }) {
  const [isAuthed, setIsAuthed] = useState(process.env.NODE_ENV === 'development')

  return <AuthContext.Provider value={{ isAuthed, setIsAuthed }}>
    {children}
  </AuthContext.Provider>
}

export default function useAuthContext () {
  return useContext(AuthContext)
}
