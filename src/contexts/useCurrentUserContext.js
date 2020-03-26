import React, { createContext, useContext, useState } from 'react'

export const CurrentUserContext = createContext()

export function CurrentUserProvider ({ children }) {
  const [currentUser, setCurrentUser] = useState({})

  return <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
    {children}
  </CurrentUserContext.Provider>
}

export default function useCurrentUserContext () {
  return useContext(CurrentUserContext)
}
