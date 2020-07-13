import React, { createContext, useContext, useState } from 'react'

export const HiddenTransactionsContext = createContext()

export function HiddenTransactionsProvider ({ children }) {
  const [hiddenTransactionIds, setHiddenTransactionIds] = useState([])

  return <HiddenTransactionsContext.Provider value={{ hiddenTransactionIds, setHiddenTransactionIds }}>
    {children}
  </HiddenTransactionsContext.Provider>
}

export default function useHiddenTransactionsContext () {
  return useContext(HiddenTransactionsContext)
}
