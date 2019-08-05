import React from 'react'
import { ApolloProvider } from 'react-apollo'
import { BrowserRouter as Router } from 'react-router-dom'
import apolloClient from 'apolloClient'
import { useMediaPredicate } from 'react-media-hook'
import PrimaryLayout from 'pages/PrimaryLayout'
import ScreenWidthContext from 'contexts/screenWidth'

export default function App () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <ApolloProvider client={apolloClient}>
    <Router>
      <ScreenWidthContext.Provider value={isWide}>
        <PrimaryLayout />
      </ScreenWidthContext.Provider>
    </Router>
  </ApolloProvider>
}
