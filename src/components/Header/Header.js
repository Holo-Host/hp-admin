import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { Link } from 'react-router-dom'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import MenuIcon from 'components/icons/MenuIcon'

export default function Header ({ title, hamburgerClick }) {
  const { currentUser } = useCurrentUserContext()
  const leftNav = hamburgerClick && <Button onClick={hamburgerClick} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' />
  </Button>

  return <div styleName='header'>
    <div styleName='left-nav'>{leftNav}</div>
    <h2 styleName='title'>{title}</h2>
    <Link to='/admin/settings' styleName='avatar-link' data-testid='avatar-link'>
      <HashAvatar seed={currentUser.hostPubKey} size={32} />
    </Link>
  </div>
}
