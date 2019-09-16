import React from 'react'
import { Link } from 'react-router-dom'

export default function MainMenu () {
  return <React.Fragment>
    <Menu />
  </React.Fragment>
}

export function Menu () {
  return <ul>
    {/* <li><Link to='/inbox'>Inbox</Link></li>
    <li><Link to='/offer'>Offer</Link></li>
    <li><Link to='/request'>Earnings</Link></li> */}
    <li><Link to='/history'>History</Link></li>
  </ul>
}
