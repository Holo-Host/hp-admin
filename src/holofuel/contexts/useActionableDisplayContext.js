import React, { createContext, useContext, useState } from 'react'

export const ActionableDisplayContext = createContext()

export function ActionableDisplayProvider ({ children }) {
  const [hiddenTransactionsById, setHiddenTransactionsById] = useState([])

  return <ActionableDisplayContext.Provider value={{ hiddenTransactionsById, setHiddenTransactionsById }}>
    {children}
  </ActionableDisplayContext.Provider>
}

export default function useActionableDisplayContext () {
  return useContext(ActionableDisplayContext)
}
