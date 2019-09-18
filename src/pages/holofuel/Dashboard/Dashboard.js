import React from 'react'
import { Link } from 'react-router-dom'
import PrimaryLayout from 'components/holofuel/layout/PrimaryLayout'
import './Dashboard.module.css'

export default function Dashboard () {
  return <PrimaryLayout>
    <div>
      This is the HoloFuel Dashboard.
    </div>

    <ul>
      <li><Link to='/inbox'>Inbox</Link></li>
      <li><Link to='/offer'>Create Offer</Link></li>
      <li><Link to='/request'>Create Request</Link></li>
      <li><Link to='/history'>History</Link></li>
    </ul>
  </PrimaryLayout>
}
