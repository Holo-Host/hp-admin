import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from 'react-apollo'
import { BrowserRouter as Router } from 'react-router-dom'
import apolloClient from 'apolloClient'
import PrimaryLayout from './components/PrimaryLayout'
import './index.css'

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <Router>
      <PrimaryLayout />
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)
