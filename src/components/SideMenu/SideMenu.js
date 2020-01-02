import React from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import CopyAgentId from 'components/CopyAgentId'
import GearIcon from 'components/icons/GearIcon'
import AlphaFlag from 'components/AlphaFlag'
import { presentAgentId } from 'utils'
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
          {settings.hostName || presentAgentId(settings.hostPubKey)}
        </h2>

        <Link to='/admin/settings' styleName='settings-link'>
          <GearIcon styleName='gear-icon' /> <div>Settings</div>
        </Link>

      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li>
            <Link to='/admin/dashboard' styleName='nav-link'>
              Home
            </Link>
          </li>
          <li>
            <Link to='/holofuel/' styleName='nav-link'>
              HoloFuel
            </Link>
          </li>
        </ul>
      </nav>

      <footer styleName='footer'>
        <div styleName='alpha-info'>
          <AlphaFlag variant='right' styleName='alpha-flag' />
          <p>
            HP Admin is in Alpha testing.
          </p>
          <p>
            Learn more about out our&nbsp;
            <a href='https://medium.com/@H_O_L_O_/253c473381fd' target='_blank' rel='noopener noreferrer' styleName='alpha-link'>
              Alpha Testnet.
            </a>
          </p>
        </div>

        <ul styleName='footer-list'>
          <li styleName='footer-list-item'>
            <a href='https://forum.holo.host' target='_blank' rel='noopener noreferrer' styleName='footer-link'>Help</a>
          </li>
          <li styleName='footer-list-item'>
            <Link to='http://holo.host/alpha-terms' target='_blank' rel='noopener noreferrer' styleName='footer-link'>View Terms of Service</Link>
          </li>
        </ul>
      </footer>

    </div>
    <div styleName='drawer-overlay' onClick={handleClose} />
  </aside>
}

export default SideMenu
