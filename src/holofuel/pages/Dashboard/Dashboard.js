import React from 'react'
import { Link } from 'react-router-dom'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import './Dashboard.module.css'

export default function Dashboard () {
  return <PrimaryLayout>
    <div>
      This is the HoloFuel Dashboard.
    </div>

    <Link to='/inbox'>Inbox</Link>
    <Link to='/offer'>Create Offer</Link>
    <Link to='/request'>Create Request</Link>
    <Link to='/history'>History</Link>
  </PrimaryLayout>
}
