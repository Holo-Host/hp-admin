import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router } from 'react-router-dom'
import { useMediaPredicate } from 'react-media-hook'
import apolloClient from 'apolloClient'
import ReactModal from 'react-modal'
import PrimaryLayout from 'pages/PrimaryLayout'
import HFPrimaryLayout from 'pages/holofuel/PrimaryLayout'
import RegisterUser from 'components/RegisterUser'
import ScreenWidthContext from 'contexts/screenWidth'

export function App () {
  if (process.env.REACT_APP_HOLOFUEL_APP) {
    return <HoloFuelApp />
  } else {
    return <HPAdminApp />
  }
}

export function HoloFuelApp () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <ApolloProvider client={apolloClient}>
    <Router>
      <ScreenWidthContext.Provider value={isWide}>
        <HFPrimaryLayout />
      </ScreenWidthContext.Provider>
    </Router>
  </ApolloProvider>
}

export function HPAdminApp () {
  const isWide = useMediaPredicate('(min-width: 550px)')

  return <ApolloProvider client={apolloClient}>
    <Router>
      <RegisterUser>
        <ScreenWidthContext.Provider value={isWide}>
          <PrimaryLayout />
        </ScreenWidthContext.Provider>
      </RegisterUser>
    </Router>
  </ApolloProvider>
}

ReactDOM.render(<App />, document.getElementById('root'))
ReactModal.setAppElement('#root')
