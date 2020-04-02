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
import { AuthProvider } from 'contexts/useAuthContext'
import { FlashMessageProvider } from 'contexts/useFlashMessageContext'
import HFScreenWidthContext from 'holofuel/contexts/screenWidth'
import { FlashMessageProvider as HFFlashMessageProvider } from 'holofuel/contexts/useFlashMessageContext'
import { CounterpartyListProvider as HFCounterpartyListProvider } from 'holofuel/contexts/useCounterpartyListContext'
import AcceptRequestedOffers from './holofuel/AcceptRequestedOffers'
import PromptForNickname from './holofuel/PromptForNickname'
import HPAdminRouter from './HPAdminRouter'

export function App () {
  if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
    return <HoloFuelApp />
  } else {
    return <HPAdminApp />
  }
}

function HoloFuelAppCore () {
  const isWide = useMediaPredicate('(min-widt h: 550px)')

  return <HFScreenWidthContext.Provider value={isWide}>
    <HFFlashMessageProvider>
      <HFCounterpartyListProvider>
        <AcceptRequestedOffers>
          <PromptForNickname>
            <HFRouter />
          </PromptForNickname>
        </AcceptRequestedOffers>
      </HFCounterpartyListProvider>
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
              <Switch>
                <Route path='/holofuel' component={HoloFuelAppCore} />
                <HPAdminRouter />
              </Switch>
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
