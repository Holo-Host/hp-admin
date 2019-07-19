import React from 'react'
import './App.css'
import { Route } from 'react-router-dom'
import Btn from 'components/SpecificButton'

function App () {
  return (
    <div className='App'>
      <header className='App-header'>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <Route path='/' render={() =>
          <div>You can always see me (Routing)</div>
        } />

        <Route path='/test-route' render={() =>
          <div>You can only see me at "/test-route"</div>
        } />

        <Btn
        >
          Learn React
        </Btn>
      </header>
    </div>
  )
}

export default App
