import React, { createContext, useContext, useState } from 'react'

export const ConnectionContext = createContext()

export function ConnectionProvider ({ children }) {
<<<<<<< HEAD
  const [isConnected, setIsConnected] = useState({
=======
  const [connectionStatus, setConnectionStatus] = useState({
>>>>>>> develop
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
