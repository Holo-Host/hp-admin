import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'
import { PROFILE_PATH } from 'holofuel/utils/urls'

export function Header ({ title, agent, agentLoading, avatarUrl, history: { push }, hamburgerClick = () => push('/dashboard'), inboxCount }) {
  const leftNav = <Button onClick={hamburgerClick} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#000000' />
    {inboxCount > 0 && <span styleName='nav-badge' data-testid='inboxCount-badge'>{inboxCount}</span>}
  </Button>

  if (agentLoading) agentLoading = <h4>Loading...</h4>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>
        {leftNav}
      </div>
      <div styleName='center-nav'>
        {title && <div styleName='page-header'>
          <div styleName='page-title'>{title}</div>
        </div>}
      </div>
      <div>
        <Link to={PROFILE_PATH}>
          <HashAvatar avatarUrl={avatarUrl} seed={agent.id} size={32} dataTestId='hash-icon' />
        </Link>
      </div>
    </section>
  </header>
}

export default withRouter(Header)
