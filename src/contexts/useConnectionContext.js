import React, { createContext, useContext, useState, useCallback } from 'react'

export const ConnectionContext = createContext()

let clientHposConnection = false
export const setConnection = ({ hposConnection = false } = {}) => {
  clientHposConnection = hposConnection
  console.log('::::: clientHposConnection : ', clientHposConnection)
  return clientHposConnection
}

export function ConnectionProvider ({ children }) {
  const [isConnected, setIsConnected] = useState(clientHposConnection)
  useCallback(() => setIsConnected(clientHposConnection), [])

  console.log('>>>>> WITHIN ConnectionProvider >>>> clientHposConnection : ', clientHposConnection)
  console.log('isConnected : ', isConnected)

  return <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
    {children}
  </ConnectionContext.Provider>
}

export default function useConnectionContext () {
  return useContext(ConnectionContext)
}
