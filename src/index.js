import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router } from 'react-router-dom'
import { useMediaPredicate } from 'react-media-hook'
import apolloClient from 'apolloClient'
import PrimaryLayout from 'pages/PrimaryLayout'
import RegisterUser from 'components/RegisterUser'
import ScreenWidthContext from 'contexts/screenWidth'
import './index.css'

export function App () {
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
