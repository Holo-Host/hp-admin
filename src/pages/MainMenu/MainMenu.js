import React from 'react'
import { Link } from 'react-router-dom'

export default function MainMenu () {
  return <div>
    <Menu />
  </div>
}

export function Menu () {
  return <ul>
    <li><Link to='/'>Dashboard</Link></li>
    <li><Link to='/browse-happs'>Browse Happs</Link></li>
    <li><Link to='/earnings'>Hosting Earnings</Link></li>
    <li><Link to='/pricing'>Manage Pricing</Link></li>
  </ul>
}
