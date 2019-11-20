import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'

export default function Header ({ title, hamburgerClick, settings }) {
  const leftNav = <Button onClick={hamburgerClick} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' />

  </Button>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>{leftNav}</div>
      <h2 styleName='title'>{title}</h2>
      <Link to='/my-profile' styleName='avatar-link'>
        <HashAvatar seed={settings.hostPubKey} size={32} />
      </Link>
    </section>
  </header>
}
