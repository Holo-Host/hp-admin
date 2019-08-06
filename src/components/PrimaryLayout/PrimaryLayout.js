import React from 'react'
import { Route, Link } from 'react-router-dom'
import './PrimaryLayout.module.css'
import Dashboard from 'components/Dashboard'
import MainMenu from 'components/MainMenu'
import HappHosting from 'components/HappHosting'
import mockData from 'mock-dnas/mockData'

export function PrimaryLayout () {
  console.log('***** mockData *****', mockData)

  return (
    <div styleName='primary-layout'>
      <header>
        <div styleName='menu-link'>
          <Link to='/menu' >Menu</Link>
        </div>

        <Route path='/(|dashboard)' exact component={Dashboard} />
        <Route path='/menu' component={MainMenu} />
        <Route path='/happ-hosting' component={HappHosting} />

      </header>
    </div>
  )
}

export default PrimaryLayout
