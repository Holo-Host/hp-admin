import React, { createContext, useContext, useState } from 'react'

export const WhoamiContext = createContext()

export function WhoamiProvider ({ children }) {
  const [whoami, setWhoami] = useState({})

  return <WhoamiContext.Provider value={{ whoami, setWhoami }}>
    {children}
  </WhoamiContext.Provider>
}

export default function useWhoamiContext () {
  return useContext(WhoamiContext)
}
