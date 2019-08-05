import React, { useContext, useState } from 'react'
import { Route, Link } from 'react-router-dom'
import './PrimaryLayout.module.css'
import Dashboard from 'components/Dashboard'
import MainMenu, { Menu } from 'components/MainMenu'
import HappHosting from 'components/HappHosting'
import ScreenWidthContext from 'contexts/screenWidth'
import SpecificButton from 'components/SpecificButton'

export function PrimaryLayout () {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName='primary-layout'>
    {isWide && <SideMenu />}
    <div>
      {!isWide && <div styleName='menu-link'>
        <Link to='/menu' >Menu</Link>
      </div>}

      <Route path='/(|dashboard)' exact component={Dashboard} />
      <Route path='/menu' component={MainMenu} />
      <Route path='/happ-hosting' component={HappHosting} />
    </div>
  </div>
}

export function SideMenu () {
  const [expanded, setExpanded] = useState(false)
  return <div styleName='side-menu'>
    <div styleName='menu-link'>
      <SpecificButton onClick={() => setExpanded(!expanded)}>Menu</SpecificButton>
    </div>
    {expanded && <Menu />}
  </div>
}

export default PrimaryLayout
