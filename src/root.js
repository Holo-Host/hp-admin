import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { useMediaPredicate } from 'react-media-hook'
import apolloClient from 'apolloClient'
import ReactModal from 'react-modal'
import HFRouter from './holofuel/HFRouter'
import ScreenWidthContext from 'contexts/screenWidth'
import { ConnectionProvider } from 'contexts/useConnectionContext'
import { CurrentUserProvider } from 'contexts/useCurrentUserContext'
import { AuthProvider } from 'contexts/useAuthContext'
import { FlashMessageProvider } from 'contexts/useFlashMessageContext'
import HFScreenWidthContext from 'holofuel/contexts/screenWidth'
import { FlashMessageProvider as HFFlashMessageProvider } from 'holofuel/contexts/useFlashMessageContext'
import { CurrentUserProvider as HFCurrentUserProvider } from 'holofuel/contexts/useCurrentUserContext'
import { HostedAgentAuthStatusProvider as HFHostedAgentProvider } from 'holofuel/contexts/useHostedAgentAuthStatusContext'
import { ConnectionProvider as HFConnectionProvider } from 'holofuel/contexts/useConnectionContext'
import { HiddenTransactionsProvider } from 'holofuel/contexts/useHiddenTransactionsContext'
import AcceptRequestedOffers from 'holofuel/components/wrappers/AcceptRequestedOffers'
import LoadCurrentUser from 'holofuel/components/wrappers/LoadCurrentUser'
import PromptForNickname from 'holofuel/components/wrappers/PromptForNickname'
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
    <HFCurrentUserProvider>
      <HFHostedAgentProvider>
        <HFFlashMessageProvider>
          <HiddenTransactionsProvider>
            <LoadCurrentUser>
              <AcceptRequestedOffers>
                <PromptForNickname>
                  <HFRouter />
                </PromptForNickname>
              </AcceptRequestedOffers>
            </LoadCurrentUser>
          </HiddenTransactionsProvider>
        </HFFlashMessageProvider>
      </HFHostedAgentProvider>
    </HFCurrentUserProvider>
  </HFScreenWidthContext.Provider>
}

export function HoloFuelApp () {
  return <ApolloProvider client={apolloClient}>
    <Router>
      <HFConnectionProvider>
        <HoloFuelAppCore />
      </HFConnectionProvider>
    </Router>
  </ApolloProvider>
}

export function HPAdminApp () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <ApolloProvider client={apolloClient}>
    <Router>
      <ScreenWidthContext.Provider value={isWide}>
        <ConnectionProvider>
          <HFConnectionProvider>
            <AuthProvider>
              <CurrentUserProvider>
                <FlashMessageProvider>
                  <Switch>
                    <Route path='/holofuel' component={HoloFuelAppCore} />
                    <HPAdminRouter />
                  </Switch>
                </FlashMessageProvider>
              </CurrentUserProvider>
            </AuthProvider>
          </HFConnectionProvider>
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
