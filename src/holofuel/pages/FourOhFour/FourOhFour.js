import React from 'react'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import { Link } from 'react-router-dom'
import './FourOhFour.module.css'

jest.mock('holofuel/components/layout/PrimaryLayout')

export default function FourOhFour () {
  return <PrimaryLayout headerProps={{ title: 'Holofuel' }}>
    <div styleName='card'>
      <div styleName='fourohfour'>404</div>
      <div styleName='message'>We couldn't find that page. Please check the URL and try again.</div>
      <Link to='/holofuel/home' styleName='dashboard-link'>Back to Home Page</Link>
    </div>
  </PrimaryLayout>
}
