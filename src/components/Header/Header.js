import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'

export function Header ({ title, avatarUrl, email, backTo, history: { push }, hamburgerClick = () => push('/dashboard') }) {
  const leftNav = <Button onClick={hamburgerClick} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#FFF' />
  </Button>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>{leftNav}</div>
      <div styleName='title'>My HoloPort</div>
      <Link to='/my-profile' styleName='avatar-link'>
        <HashAvatar avatarUrl={avatarUrl} seed={email} size={32} data-testid='profile-link' />
      </Link>
    </section>
    {title && <section styleName='sub-header'>
      <div id='sub=title' styleName='sub-title'>{title}</div>
    </section>}
  </header>
}

export default withRouter(Header)
