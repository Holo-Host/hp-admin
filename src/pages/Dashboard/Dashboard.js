import React from 'react'
import Btn from 'components/SpecificButton'

export default function Dashboard ({ me, happStoreUser, registerUser }) {
  return <div>
    `Here's the dashboard. It will have more information than this later.`

    <p>
      User data: {me && JSON.stringify(me)}
    </p>

    <p>
      Happ Store User data: {happStoreUser && JSON.stringify(happStoreUser)}
    </p>

    <p>
      <Btn onClick={() => registerUser('Test User', 'testuserface.png')}>Register a test user</Btn>
    </p>
  </div>
}
