import React from 'react'
import Button from 'components/Button'
import './MenuButton.module.css'
import MenuIcon from 'components/icons/MenuIcon'

export function MenuButton ({ onClick, className, inboxCount }) {
  return <Button onClick={onClick} className={className} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#000000' />
    {inboxCount > 0 && <span styleName='nav-badge' data-testid='inboxCount-badge'>{inboxCount}</span>}
  </Button>
}

export default MenuButton
