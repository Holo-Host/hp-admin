import React from 'react'
import { Link } from 'react-router-dom'
import Btn from 'components/Button'

export default function Dashboard ({ me, happStoreUser, registerUser, allHPSettings }) { // allHPSettings
  return <div>

    <div>
      <Link to='/menu' >Menu</Link>
    </div>

    Here's the dashboard. It will have more information than this later.

    <p>
      User data: {me && JSON.stringify(me)}
    </p>

    <p>
      Happ Store User data: {happStoreUser && JSON.stringify(happStoreUser)}
    </p>

    <p>
      HP Settings data: {allHPSettings && JSON.stringify(allHPSettings)}
    </p>

    <p>
      <Btn onClick={() => registerUser('Test User', 'testuserface.png')}>Register a test user</Btn>
    </p>
  </div>
}
