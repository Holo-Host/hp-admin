import React, { createContext, useContext, useState } from 'react'

export const CurrentUserContext = createContext()

export function CurrentUserProvider ({ children }) {
  const [currentUser, setCurrentUser] = useState({})
  const [currentUserLoading, setCurrentUserLoading] = useState(false)

  return <CurrentUserContext.Provider value={{ currentUser, setCurrentUser, currentUserLoading, setCurrentUserLoading }}>
    {children}
  </CurrentUserContext.Provider>
}

export default function useCurrentUserContext () {
  return useContext(CurrentUserContext)
}
