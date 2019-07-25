import React from 'react'
import { Route } from 'react-router-dom'
import './App.css'
import Btn from 'components/SpecificButton'

export function App ({ me, happStoreUser, registerUser }) {
  return (
    <div className='App'>
      <header className='App-header'>
        <p>
          User data: {me && JSON.stringify(me)}
        </p>

        <p>
          Happ Store User data: {happStoreUser && JSON.stringify(happStoreUser)}
        </p>

        <Route path='/' render={() =>
          <div>You can always see me (Routing)</div>
        } />

        <Route path='/test-route' render={() =>
          <div>You can only see me at "/test-route"</div>
        } />
        <div>
          <p />
          <Btn onClick={() => registerUser('Test User', 'testuserface.png')}>Register a test user</Btn>
        </div>
      </header>
    </div>
  )
}

export default App
