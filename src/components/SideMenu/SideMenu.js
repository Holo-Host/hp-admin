import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import { sliceHash as presentHash } from 'utils'
import './SideMenu.module.css'

export function SideMenu ({
  isOpen,
  handleClose,
  avatarUrl = ''
}) {
  const { loading, data: { hposSettings: settings = [] } = {} } = useQuery(HposSettingsQuery)

  let loadingDisplay
  if (loading) loadingDisplay = '...Loading'

  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
      <header styleName='header'>
        <h1 styleName='appName'>HP Admin</h1>
        {loading
          ? <div />
          : <HashAvatar avatarUrl={avatarUrl} seed={settings.hostPubKey} size={100} styleName='avatar' />
        }

        <span styleName='header-account'>
          {settings.hostName || loadingDisplay || presentHash(settings.hostPubKey)}
        </span>
      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li>
            <Link to='/dashboard' styleName='nav-link'>
              <div styleName='nav-icon' />
              Home
            </Link>
          </li>
          <li>
            <Link to='/browse-happs' styleName='nav-link' data-testid='hosting-link'>
              <div styleName='nav-icon' />
              Hosting
            </Link>
          </li>
          <li>
            <Link to='/earnings' styleName='nav-link' data-testid='earnings-link'>
              <div styleName='nav-icon' />
              Earnings
            </Link>
          </li>
          <li>
            <Link to='/holofuel' styleName='nav-link'>
              <div styleName='nav-icon' />
              HoloFuel
            </Link>
          </li>
          <li>
            <Link to='/settings' styleName='nav-link'>
              <div styleName='nav-icon' />
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      <footer styleName='footer'>
        <ul styleName='footer-list'>
          <li>
            <a href='https://holo.freshdesk.com/support/home' target='_blank' rel='noopener noreferrer' styleName='footer-link'>Help</a>
          </li>
          <li>
            <Link to='/tos' styleName='footer-link'>View Disclaimer</Link>
          </li>
          <li>
            <Link to='/tos' styleName='footer-link'>View Terms of Service</Link>
          </li>
        </ul>
      </footer>
    </div>

    <div styleName='drawer-overlay' onClick={handleClose} />
  </aside>
}

export default SideMenu
