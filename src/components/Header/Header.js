import React from 'react'
import Button from 'components/Button'
import './Header.module.css'
import { withRouter } from 'react-router'
import MenuIcon from 'components/icons/MenuIcon'
import BackIcon from 'components/icons/BackIcon'

export function Header ({ title = 'Untitled', backTo, history: { push } }) {
  const goToMenu = () => push('/menu')
  const goBack = () => push(backTo)

  const leftNav = backTo
    ? <Button onClick={goBack} styleName='back-button' dataTestId='back-button'>
      <BackIcon styleName='back-icon' />
      <span styleName='back-text'>Back</span>
    </Button>
    : <Button onClick={goToMenu} styleName='menu-button' dataTestId='menu-button'>
      <MenuIcon styleName='menu-icon' />
    </Button>

  return <div styleName='header'>
    <div styleName='left-nav'>{leftNav}</div>
    <div styleName='title'>{title}</div>
    <div styleName='empty-spacer' />
  </div>
}

export default withRouter(Header)
