import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import MenuIcon from 'components/icons/MenuIcon'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import { presentAgentId } from 'utils'

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
        <CopyAgentId agent={agent} isMe>
          {agent.nickname || presentAgentId(agent.id)}
        </CopyAgentId>
      </div>
      <CopyAgentId agent={agent} isMe>
        <HashAvatar avatarUrl={avatarUrl} seed={agent.id} size={32} data-testid='hash-icon' />
      </CopyAgentId>
    </section>
    {title && <section styleName='sub-header'>
      <div styleName='sub-title'>{title}</div>
    </section>}
  </header>
}

export default withRouter(Header)
