import React from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
// import { presentHolofuelAmount } from 'utils' // presentAgentId
import './SideMenu.module.css'

const MOCK_HOLO_HPOS_AGENT = {
  nickname: 'Holo Naut',
  id: 'Tw7179WYi/zSRLRSb6DWgZf4dhw5+b0ACdlvAw3WYH8'
}

export function SideMenu ({
  isOpen,
  handleClose,
  avatarUrl = ''
}) {
  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
      <header styleName='header'>
        <h1 styleName='appName'>HoloFuel</h1>
        <HashAvatar seed={MOCK_HOLO_HPOS_AGENT.id} size={100} styleName='avatar' />

        <span styleName='header-account'>
          {MOCK_HOLO_HPOS_AGENT.nickname}
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
            <Link to='/browse-happs' styleName='nav-link'>
              <div styleName='nav-icon' />
              Hosting
            </Link>
          </li>
          <li>
            <Link to='/earnings' styleName='nav-link'>
              <div styleName='nav-icon' />
              Earnings
            </Link>
          </li>
          <li>
            <Link to='/hpadmin/holofuel' styleName='nav-link'>
              <div styleName='nav-icon' />
              HoloFuel
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
