import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'
import BackIcon from 'components/icons/BackIcon'
import { gray } from 'utils/colors'

export function Header ({ title = 'Untitled', avatarUrl, email, backTo, history: { push } }) {
  const goToMenu = () => push('/menu')
  const goBack = () => push(backTo)

  const leftNav = backTo
    ? <Button onClick={goBack} styleName='back-button' dataTestId='back-button'>
      <BackIcon styleName='back-icon' color={gray} />
      <span styleName='back-text'>Back</span>
    </Button>
    : <Button onClick={goToMenu} styleName='menu-button' dataTestId='menu-button'>
      <MenuIcon styleName='menu-icon' />
    </Button>

  return <div styleName='header'>
    <div styleName='left-nav'>{leftNav}</div>
    <div styleName='title'>{title}</div>
    <Link to='/my-profile'>
      <HashAvatar avatarUrl={avatarUrl} email={email} size={32} />
    </Link>
  </div>
}

export default withRouter(Header)
