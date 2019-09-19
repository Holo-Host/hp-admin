import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'

export function Header ({ title, accountNumber, avatarUrl, email, backTo, history: { push } }) {
  const goToMenu = () => push('/dashboard')

  const leftNav = <Button onClick={goToMenu} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#FFF' />
  </Button>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>
        {leftNav}
        <span styleName='title header-font'>HoloFuel</span>
      </div>
      <div styleName='right-nav account-number header-font'>{accountNumber}</div>
      <Link to='/dashboard' styleName='avatar-link'>
        <HashAvatar avatarUrl={avatarUrl} seed={accountNumber} size={32} />
      </Link>
    </section>
    {title && <section styleName='sub-header'>
      <div styleName='sub-title'>{title}</div>
    </section>}
  </header>
}

export default withRouter(Header)
