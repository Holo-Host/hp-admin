import React from 'react'
import Btn from 'components/Button'
import Header from 'components/Header'
import './Dashboard.module.css'

export default function Dashboard ({ me, happStoreUser, registerUser }) {
  return <div styleName='container'>
    <Header title='My HoloPort' />

    <div styleName='linkBox'>
      <h2><a href='/browse-happs'>Hosting</a></h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    </div>

    <div styleName='linkBox'>
      <h2><a href='/earnings'>Earnings</a></h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>

    <div styleName='linkBox'>
      <h2><a href='/settings'>Settings</a></h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>

    <div styleName='testing'>
      <Btn variant='primary' onClick={() => registerUser('Test User', 'testuserface.png')}>Register a test user</Btn>

      <p>
        <strong>User data:</strong> {me && JSON.stringify(me)}
      </p>

      <p>
        <strong>Happ Store User data:</strong> {happStoreUser && JSON.stringify(happStoreUser)}
      </p>
    </div>
  </div>
}
