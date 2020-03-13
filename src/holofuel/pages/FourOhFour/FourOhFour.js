import React from 'react'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import { Link } from 'react-router-dom'
import './FourOhFour.module.css'

export default function FourOhFourTos () {
  return <PrimaryLayout>
    <div styleName='card'>
      <div styleName='fourohfour'>404</div>
      <div styleName='message'>We couldn't find that page. Please check the URL and try again.</div>
      <Link to='/holofuel/home' styleName='dashboard-link'>Back to Home Page</Link>
    </div>
  </PrimaryLayout>
}
