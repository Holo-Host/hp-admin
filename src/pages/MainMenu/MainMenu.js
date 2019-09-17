import React from 'react'
import { Link } from 'react-router-dom'

export default function MainMenu () {
  return <>
    <Menu />
  </>
}

export function Menu () {
  return <ul>
    <li><Link to='/'>Home</Link></li>
    <li><Link to='/browse-happs'>Hosting</Link></li>
    <li><Link to='/earnings'>Earnings</Link></li>
    <li><Link to='settings'>Settings</Link></li>
  </ul>
}
