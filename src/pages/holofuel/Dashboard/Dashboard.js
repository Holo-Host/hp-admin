import React from 'react'
import { Link } from 'react-router-dom'
import Header from 'components/holofuel/Header'
import './Dashboard.module.css'

export default function Dashboard () {
  return <>
    <Header />

    <div>
      This is the HoloFuel Dashboard.
    </div>

    <Link to='/inbox'>Inbox</Link>
    <Link to='/offer'>Create Offer</Link>
    <Link to='/request'>Create Request</Link>
  </>
}
