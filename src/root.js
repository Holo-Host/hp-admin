import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router } from 'react-router-dom'
import { useMediaPredicate } from 'react-media-hook'
import apolloClient from 'apolloClient'
import ReactModal from 'react-modal'
import ScreenWidthContext from 'contexts/screenWidth'
import { ConnectionProvider } from 'contexts/useConnectionContext'
import { AuthProvider } from 'contexts/useAuthContext'
import { FlashMessageProvider } from 'contexts/useFlashMessageContext'
import HPAdminRouter from './HPAdminRouter'

export function HPAdminApp () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <ApolloProvider client={apolloClient}>
    <Router>
      <ScreenWidthContext.Provider value={isWide}>
        <ConnectionProvider>
          <AuthProvider>
            <FlashMessageProvider>
              <HPAdminRouter />
            </FlashMessageProvider>
          </AuthProvider>
        </ConnectionProvider>
      </ScreenWidthContext.Provider>
    </Router>
  </ApolloProvider>
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.render(<HPAdminApp />, rootElement)
  ReactModal.setAppElement('#root')
}
