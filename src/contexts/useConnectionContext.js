import React, { createContext, useContext, useState } from 'react'

export const ConnectionContext = createContext()

export function ConnectionProvider ({ children }) {
  const [connectionStatus, setConnectionStatus] = useState({
    hpos: true,
    holochain: true
  })

  return <ConnectionContext.Provider value={{ connectionStatus, setConnectionStatus }}>
    {children}
  </ConnectionContext.Provider>
}

export default function useConnectionContext () {
  return useContext(ConnectionContext)
}
