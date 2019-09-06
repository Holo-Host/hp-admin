import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'

export function Header ({ title, avatarUrl, email, backTo, history: { push } }) {
  const goToMenu = () => push('/dashboard')

  const leftNav = <Button onClick={goToMenu} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#FFF' />
  </Button>

  return <div>
    <div styleName='header'>
      <div styleName='left-nav'>{leftNav}</div>
      <div styleName='title'>My HoloPort</div>
      <Link to='/dashboard' styleName='avatar-link'>
        <HashAvatar avatarUrl={avatarUrl} email={email} size={32} />
      </Link>
    </div>
    {title && <div styleName='sub-header'>
      <div styleName='sub-title'>{title}</div>
    </div>}
  </div>
}

export default withRouter(Header)
