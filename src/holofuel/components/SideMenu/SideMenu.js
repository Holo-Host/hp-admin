import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { Link, useLocation } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import { presentAgentId } from 'utils'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import BackIcon from 'components/icons/BackIcon'
import MenuButton from 'holofuel/components/MenuButton'

import {
  INBOX_PATH,
  HISTORY_PATH,
  PROFILE_PATH
} from 'holofuel/utils/urls'

import './SideMenu.module.css'

export default function SideMenu ({
  isOpen,
  avatarUrl = '',
  agent,
  agentLoading,
  inboxCount,
  closeMenu
}) {
  const location = useLocation()
  const [currentPath, setCurrentPath] = useState()
  useEffect(() => {
    setCurrentPath(location.pathname)
  }, [location])

  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
      <MenuButton onClick={closeMenu} styleName='menu-button' />
      <header styleName='header'>
        <CopyAgentId agent={{ id: agent.id }} isMe>
          <HashAvatar avatarUrl={avatarUrl} seed={agent.id} size={48} styleName='avatar' />
        </CopyAgentId>
        <h3 styleName='nickname'>
          {agent.nickname || (agentLoading && <>Loading...</>) || presentAgentId(agent.id)}
        </h3>
      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li styleName={cx({ 'active-link': currentPath === '/holofuel/inbox/' || currentPath === '/holofuel/inbox' || currentPath === '/holofuel/' || currentPath === '/holofuel' })}>
            <Link to={INBOX_PATH} styleName='nav-link'>
              Inbox <InboxBadge count={inboxCount} />
            </Link>
          </li>
          <li styleName={cx({ 'active-link': currentPath === '/holofuel/history/' || currentPath === '/holofuel/history' })}>
            <Link to={HISTORY_PATH} styleName='nav-link'>
              History
            </Link>
          </li>
          <li styleName={cx({ 'active-link': currentPath === '/holofuel/profile/' || currentPath === '/holofuel/profile' })}>
            <Link to={PROFILE_PATH} styleName='nav-link'>
              Profile
            </Link>
          </li>
          {process.env.REACT_APP_HOLOFUEL_APP !== 'true' && <li styleName='back-link'>
            <Link to='/admin/' styleName='admin-nav-link'>
              <BackIcon styleName='back-icon' /> HP Admin
            </Link>
          </li>}

        </ul>
      </nav>

      <footer styleName='footer'>
        <div styleName='alpha-info'>
          <AlphaFlag variant='right' styleName='alpha-flag' />
          <p>
            HoloFuel is in Alpha testing.
          </p>
          <p>
            Learn more about out our&nbsp;
            <a href='https://holo.host/holo-testnet' target='_blank' rel='noopener noreferrer' styleName='alpha-link'>
              Alpha Testnet.
            </a>
          </p>
        </div>

        <ul styleName='footer-list'>
          <li styleName='footer-list-item'>
            <a href='https://forum.holo.host' target='_blank' rel='noopener noreferrer' styleName='footer-link'>Help</a>
          </li>
          <li styleName='footer-list-item'>
            <a href='http://holo.host/alpha-terms' target='_blank' rel='noopener noreferrer' styleName='footer-link'>View Terms of Service</a>
          </li>
        </ul>
        <div styleName='version-info'>UI v{process.env.REACT_APP_VERSION}</div>
      </footer>

    </div>
    <div styleName='drawer-overlay' onClick={closeMenu} />
  </aside>
}

function InboxBadge ({ count = 0 }) {
  if (count === 0) return null

  return <div styleName='inbox-badge'>
    {count}
  </div>
}
