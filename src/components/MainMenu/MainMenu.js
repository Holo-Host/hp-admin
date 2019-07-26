import React from 'react'
import { Link } from 'react-router-dom'

export default function MainMenu () {
  return <div>
    <ul>
      <li><Link to='/'>Dashboard</Link></li>
      <li><Link to='happ-hosting'>Happ Hosting</Link></li>
    </ul>
  </div>
}
