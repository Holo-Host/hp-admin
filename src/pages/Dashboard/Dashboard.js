import React from 'react'
import { Link } from 'react-router-dom'
import Btn from 'components/Button'

export default function Dashboard ({ me, happStoreUser, registerUser }) {
  return <>

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
      <Btn variant='primary' onClick={() => registerUser('Test User', 'testuserface.png')}>Register a test user</Btn>
    </p>
  </>
}
