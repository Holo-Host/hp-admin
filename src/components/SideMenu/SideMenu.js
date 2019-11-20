import React from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import CopyAgentId from 'components/CopyAgentId'
import GearIcon from 'components/icons/GearIcon'
import { sliceHash as presentHash } from 'utils'
import './SideMenu.module.css'

export function SideMenu ({
  isOpen,
  handleClose,
  avatarUrl = '',
  settings
}) {
  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
      <header styleName='header'>
        <CopyAgentId agent={{ id: settings.hostPubKey }} isMe>
          <HashAvatar avatarUrl={avatarUrl} seed={settings.hostPubKey} size={48} styleName='avatar' />
        </CopyAgentId>
        <h2 styleName='host-name'>
          {settings.hostName || presentHash(settings.hostPubKey)}
        </h2>

        <Link to='/settings' styleName='settings-link'>
          <GearIcon styleName='gear-icon' /> <div>Settings</div>
        </Link>

      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li>
            <Link to='/dashboard' styleName='nav-link'>
              Home
            </Link>
          </li>
          <li>
            <Link to='/browse-happs' styleName='nav-link' data-testid='hosting-link'>
              Hosting
            </Link>
          </li>
          <li>
            <Link to='/earnings' styleName='nav-link' data-testid='earnings-link'>
              Earnings
            </Link>
          </li>
          <li>
            <Link to='/holofuel' styleName='nav-link'>
              HoloFuel
            </Link>
          </li>
        </ul>
      </nav>

      <footer styleName='footer'>
        <ul styleName='footer-list'>
          <li styleName='footer-list-item'>
            <a href='https://holo.freshdesk.com/support/home' target='_blank' rel='noopener noreferrer' styleName='footer-link'>Help</a>
          </li>
          <li styleName='footer-list-item'>
            <Link to='/tos' styleName='footer-link'>View Disclaimer</Link>
          </li>
          <li styleName='footer-list-item'>
            <Link to='/tos' styleName='footer-link'>View Terms of Service</Link>
          </li>
        </ul>
      </footer>

    </div>
    <div styleName='drawer-overlay' onClick={handleClose} />
  </aside>
}

export default SideMenu
