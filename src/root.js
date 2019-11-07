import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { useMediaPredicate } from 'react-media-hook'
import apolloClient from 'apolloClient'
import ReactModal from 'react-modal'
import HFRouter from './holofuel/HFRouter'
import RegisterUser from 'components/RegisterUser'
import ScreenWidthContext from 'contexts/screenWidth'
import HFScreenWidthContext from 'holofuel/contexts/screenWidth'
import { FlashMessageProvider } from 'holofuel/contexts/useFlashMessageContext'
import HPAdminRouter from './HPAdminRouter'

export function App () {
  if (process.env.REACT_APP_HOLOFUEL_APP) {
    return <HoloFuelApp />
  } else {
    return <HPAdminApp />
  }
}

function HoloFuelAppCore () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <HFScreenWidthContext.Provider value={isWide}>
    <FlashMessageProvider>
      <HFRouter />
    </FlashMessageProvider>
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
      <RegisterUser>
        <ScreenWidthContext.Provider value={isWide}>
          <HPAdminRouter />
          <Route path='/holofuel' component={HoloFuelAppCore} />
        </ScreenWidthContext.Provider>
      </RegisterUser>
    </Router>
  </ApolloProvider>
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.render(<App />, rootElement)
  ReactModal.setAppElement('#root')
}
