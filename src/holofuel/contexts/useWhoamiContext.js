import React, { createContext, useContext, useState } from 'react'

export const WhoamiContext = createContext()

export function WhoamiProvider ({ children }) {
  const [whoami, setWhoami] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  return <WhoamiContext.Provider value={{ whoami, setWhoami, isLoading, setIsLoading }}>
    {children}
  </WhoamiContext.Provider>
}

export default function useWhoamiContext () {
  return useContext(WhoamiContext)
}
