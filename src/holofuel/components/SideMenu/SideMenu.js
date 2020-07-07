import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { Link, useLocation } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import { presentHolofuelAmount, presentAgentId } from 'utils'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import Button from 'components/UIButton'
import Loading from 'components/Loading'
import BackIcon from 'components/icons/BackIcon'

import {
  INBOX_PATH,
  HISTORY_PATH,
  PROFILE_PATH
} from 'holofuel/utils/urls'

import './SideMenu.module.css'

export default function SideMenu ({
  isOpen,
  handleClose,
  avatarUrl = '',
  agent,
  agentLoading,
  inboxCount,
  isLoadingRefetchCalls,
  refetchCalls
}) {

  let location = useLocation()
  const [currentPath, setCurrentPath] = useState()
  useEffect(() => {
    setCurrentPath(location.pathname)
  }, [location])

  const inboxPath = '/holofuel/inbox' || '/holofuel/' || '/holofuel'

  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
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
            <Link to={HISTORY_PATH}  styleName='nav-link'>
              History
            </Link>
          </li>
          <li styleName={cx({ 'active-link': currentPath === '/holofuel/profile/' || currentPath === '/holofuel/profile' })}>
            <Link to={PROFILE_PATH}  styleName='nav-link'>
              Profile
            </Link>
          </li>
          <li>
            <div styleName='loading-row last-list-item'>
              <Button onClick={() => refetchCalls()} styleName={cx('refresh-button', { 'btn-loading': isLoadingRefetchCalls })} variant='green'>
                Refresh
              </Button>
              {isLoadingRefetchCalls && <Loading styleName='refresh-loading' width={20} height={20} />}
            </div>
          </li>

          {process.env.REACT_APP_HOLOFUEL_APP !== 'true' && <li styleName='last-list-item'>
            <Link to='/admin/' styleName='nav-link admin-nav-link'>
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
    <div styleName='drawer-overlay' onClick={handleClose} />
  </aside>
}

function DisplayBalance ({ ledgerLoading, holofuelBalance }) {
  if (ledgerLoading || isNaN(holofuelBalance)) return <>-- TF</>
  else return <>{presentHolofuelAmount(holofuelBalance)} TF</>
}

function InboxBadge ({ count = 0 }) {
  if (count === 0) return null

  return <div styleName='inbox-badge'>
    {count}
  </div>
}
