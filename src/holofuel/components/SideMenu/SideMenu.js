import React from 'react'
import cx from 'classnames'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import { presentHolofuelAmount } from 'utils'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import {
  HOME_PATH,
  INBOX_PATH,
  HISTORY_PATH
} from 'holofuel/utils/urls'

import './SideMenu.module.css'

export default function SideMenu ({
  isOpen,
  handleClose,
  avatarUrl = '',
  agent,
  agentLoading,
  inboxCount,
  holofuelBalance,
  ledgerLoading
}) {
  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
      <header styleName='header'>
        <CopyAgentId agent={{ id: agent.id }} isMe>
          <HashAvatar avatarUrl={avatarUrl} seed={agent.id} size={48} styleName='avatar' />
        </CopyAgentId>
        <h3 styleName='nickname'>
          {agent.nickname || (agentLoading && <>Loading...</>)}
        </h3>

        <h1 styleName='balance'><DisplayBalance
          holofuelBalance={holofuelBalance}
          ledgerLoading={ledgerLoading} />
        </h1>
      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li>
            <Link to={HOME_PATH} styleName='nav-link'>
              Home
            </Link>
          </li>
          <li>
            <Link to={INBOX_PATH} styleName='nav-link'>
              Inbox <InboxBadge count={inboxCount} />
            </Link>
          </li>
          <li>
            <Link to={HISTORY_PATH} styleName='nav-link'>
              History
            </Link>
          </li>
          <li>
            <Link to='/admin/' styleName='nav-link'>
              HP Admin
            </Link>
          </li>
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

function DisplayBalance ({ ledgerLoading, holofuelBalance }) {
  if (ledgerLoading) return <>-- TF</>
  else return <>{presentHolofuelAmount(holofuelBalance)} TF</>
}

function InboxBadge ({ count = 0 }) {
  if (count === 0) return null

  return <div styleName='inbox-badge'>
    {count}
  </div>
}
