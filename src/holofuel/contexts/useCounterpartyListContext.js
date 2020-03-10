import React, { createContext, useContext, useState } from 'react'

export const CounterpartyListContext = createContext()

export function CounterpartyListProvider ({ children }) {
  const [counterpartyList, setCounterpartyList] = useState([])

  return <CounterpartyListContext.Provider value={{ counterpartyList, setCounterpartyList }}>
    {children}
  </CounterpartyListContext.Provider>
}

export default function useCounterpartyListContext () {
  return useContext(CounterpartyListContext)
}
