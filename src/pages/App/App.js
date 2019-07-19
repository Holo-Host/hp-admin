import React from 'react'
import { Route } from 'react-router-dom'
import './App.css'
import Btn from 'components/SpecificButton'

export function App ({ data }) {
  return (
    <div className='App'>
      <header className='App-header'>
        <p>
          {data.myQuery && data.myQuery.myString}
        </p>

        <Route path='/' render={() =>
          <div>You can always see me (Routing)</div>
        } />

        <Route path='/test-route' render={() =>
          <div>You can only see me at "/test-route"</div>
        } />

        <Btn>Learn React</Btn>
      </header>
    </div>
  )
}

export default App
