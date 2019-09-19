import React from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import { presentHolofuelAmount } from 'utils'

import './SideMenu.module.css'

export function SideMenu ({
  isOpen,
  handleClose,
  avatarUrl = '',
  agentId,
  inboxCount,
  holofuelBalance
}) {
  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
      <header styleName='header'>
        <h1 styleName='appName'>HoloFuel</h1>

        <HashAvatar avatarUrl={avatarUrl} seed={agentId} size={100} styleName='avatar' />

        <span styleName='header-account'>{agentId}</span>
        <strong styleName='header-balance'>{presentHolofuelAmount(holofuelBalance)}</strong>
      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li>
            <Link to='/inbox' styleName='nav-link'>
              <div styleName='nav-icon' />
              Inbox
              {inboxCount > 0 && <span styleName='nav-badge'>{inboxCount}</span>}
            </Link>
          </li>
          <li>
            <Link to='/offer' styleName='nav-link'>
              <div styleName='nav-icon' />
              Offer
            </Link>
          </li>
          <li>
            <Link to='/request' styleName='nav-link'>
              <div styleName='nav-icon' />
              Request
            </Link>
          </li>
          <li>
            <Link to='/history' styleName='nav-link'>
              <div styleName='nav-icon' />
              History
            </Link>
          </li>
        </ul>
      </nav>

      <footer styleName='footer'>
        <ul styleName='footer-list'>
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
