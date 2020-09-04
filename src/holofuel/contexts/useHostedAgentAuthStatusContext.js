import React, { createContext, useContext, useState } from 'react'

export const HostedAgentAuthStatusContext = createContext()

export function HostedAgentAuthStatusProvider ({ children }) {
  const [isSignedInAsHostedAgent, setIsSignedInAsHostedAgent] = useState(false)
  return <HostedAgentAuthStatusContext.Provider value={{ isSignedInAsHostedAgent, setIsSignedInAsHostedAgent }}>
    {children}
  </HostedAgentAuthStatusContext.Provider>
}

export default function useHostedAgentAuthStatusContext () {
  return useContext(HostedAgentAuthStatusContext)
}
