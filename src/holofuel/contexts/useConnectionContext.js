import React, { createContext, useContext, useState } from 'react'

export const ConnectionContext = createContext()

export function ConnectionProvider ({ children }) {
  // Assume connection at start; will disconnect if connection times out.
  const [isConnected, setIsConnected] = useState(true)

  return <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
    {children}
  </ConnectionContext.Provider>
}

export default function useConnectionContext () {
  return useContext(ConnectionContext)
}
