import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { useMediaPredicate } from 'react-media-hook'
import apolloClient from 'apolloClient'
import ReactModal from 'react-modal'
import HFRouter from './holofuel/HFRouter'
import RefundDeclinedOffers from './holofuel/RefundDeclinedOffers'
import ScreenWidthContext from 'contexts/screenWidth'
import { ConnectionProvider } from 'contexts/useConnectionContext'
import { AuthProvider } from 'contexts/useAuthContext'
import { FlashMessageProvider } from 'contexts/useFlashMessageContext'
import HFScreenWidthContext from 'holofuel/contexts/screenWidth'
import { FlashMessageProvider as HFFlashMessageProvider } from 'holofuel/contexts/useFlashMessageContext'
import HPAdminRouter from './HPAdminRouter'

export function App () {
  if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
    return <HoloFuelApp />
  } else {
    return <HPAdminApp />
  }
}

function HoloFuelAppCore () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <HFScreenWidthContext.Provider value={isWide}>
    <HFFlashMessageProvider>
      <RefundDeclinedOffers>
        <HFRouter />
      </RefundDeclinedOffers>
    </HFFlashMessageProvider>
  </HFScreenWidthContext.Provider>
}

export function HoloFuelApp () {
  return <ApolloProvider client={apolloClient}>
    <Router>
      <HoloFuelAppCore />
    </Router>
  </ApolloProvider>
}

export function HPAdminApp () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <ApolloProvider client={apolloClient}>
    <Router>
      <ScreenWidthContext.Provider value={isWide}>
        <ConnectionProvider>
          <AuthProvider>
            <FlashMessageProvider>
              <HPAdminRouter />
              <Route path='/holofuel' component={HoloFuelAppCore} />
            </FlashMessageProvider>
          </AuthProvider>
        </ConnectionProvider>
      </ScreenWidthContext.Provider>
    </Router>
  </ApolloProvider>
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.render(<App />, rootElement)
  ReactModal.setAppElement('#root')
}
