import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'

export function Header ({ title, avatarUrl, email, backTo, history: { push }, hamburgerClick = () => push('/dashboard') }) {
  const leftNav = <Button onClick={hamburgerClick} styleName='menu-button'>
    <MenuIcon styleName='menu-icon' color='#FFF' />
  </Button>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav' data-testid='menu-button'>{leftNav}</div>
      <div styleName='title'>My HoloPort</div>
      <Link to='/my-profile' styleName='avatar-link' data-testid='profile-link'>
        <HashAvatar avatarUrl={avatarUrl} seed={email} size={32} />
      </Link>
    </section>
    {title && <section styleName='sub-header'>
      <div id='sub=title' styleName='sub-title' data-testid='header-subtitle'>{title}</div>
    </section>}
  </header>
}

export default withRouter(Header)
