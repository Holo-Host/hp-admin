import React from 'react'
import Btn from 'components/Button'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import { Link } from 'react-router-dom'
import './Dashboard.module.css'

export default function Dashboard ({ me, happStoreUser, registerUser }) {
  return <PrimaryLayout>
    <div styleName='linkBox'>
      <h2><Link to='/browse-happs'>Hosting</Link></h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    </div>

    <div styleName='linkBox'>
      <h2><Link to='/earnings'>Earnings</Link></h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>

    <div styleName='linkBox'>
      <h2><Link to='/settings'>Settings</Link></h2>
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
  </PrimaryLayout>
}
