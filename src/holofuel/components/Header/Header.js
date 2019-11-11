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
    <MenuIcon styleName='menu-icon' color='#000000' />
  </Button>

  if (agentLoading) agentLoading = <h4>Loading...</h4>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>
        {leftNav}
      </div>
      <div styleName='middle-nav'>
        <span styleName='title header-font'>
          {title && <section styleName='page-header'>
            <div styleName='page-title'>{title}</div>
          </section>}
        </span>
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
  </header>
}

export default withRouter(Header)
