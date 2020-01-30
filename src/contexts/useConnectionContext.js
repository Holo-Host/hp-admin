import React, { createContext, useContext, useState, useEffect } from 'react'

export const ConnectionContext = createContext()

let clientHposConnection = false
export const setConnection = ({ hposConnection = false } = {}) => {
  clientHposConnection = hposConnection
  console.log('::::: clientHposConnection : ', clientHposConnection)
  return clientHposConnection
}

export function ConnectionProvider ({ children }) {
  const [isConnected, setIsConnected] = useState(clientHposConnection)
  // eslint-disable-next-line
  useEffect(() => setIsConnected(clientHposConnection),[clientHposConnection])

  console.log('>>>>> WITHIN ConnectionProvider >>>> clientHposConnection : ', clientHposConnection)
  console.log('isConnected : ', isConnected)

  return <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
    {children}
  </ConnectionContext.Provider>
}

export default function useConnectionContext () {
  return useContext(ConnectionContext)
}
