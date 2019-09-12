import React from 'react'
import { Link } from 'react-router-dom'
import Header from 'components/holofuel/Header'
import './Dashboard.module.css'

export default function Dashboard () {
  return <React.Fragment>
    <Header />

    <div>
      This is the HoloFuel Dashboard.
    </div>

    <Link to='/inbox'>Inbox</Link>
    <Link to='/offer'>Create Offer</Link>
  </React.Fragment>
}
