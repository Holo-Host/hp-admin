import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'
import CopyToClipboard from 'holofuel/components/CopyToClipboard'

export function Header ({ title, agent, agentLoading, avatarUrl, history: { push }, hamburgerClick = () => push('/dashboard') }) {
  const leftNav = <Button onClick={hamburgerClick} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#FFF' />
  </Button>

  if (agentLoading) agentLoading = <h4>Loading...</h4>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>
        {leftNav}
        <span styleName='title header-font'>HoloFuel</span>
      </div>
      <div styleName='right-nav account-number header-font'>
        <CopyToClipboard hash={agent.id} nickname={agent.nickname || ''} toolTipId='headerHashNickname'>
          {agent.nickname || agentLoading}
        </CopyToClipboard>
      </div>
      <Link to='/history' styleName='avatar-link'>
        <CopyToClipboard hash={agent.id} nickname={agent.nickname || ''} toolTipId='headerHashAvatar'>
          <HashAvatar avatarUrl={avatarUrl} seed={agent.id} size={32} data-testid='hash-icon' />
        </CopyToClipboard>
      </Link>
    </section>
    {title && <section styleName='sub-header'>
      <div styleName='sub-title'>{title}</div>
    </section>}
  </header>
}

export default withRouter(Header)
