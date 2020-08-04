import React from 'react'
import Button from 'components/Button'
import './MenuButton.module.css'
import MenuIcon from 'components/icons/MenuIcon'

export function MenuButton ({ onClick, className, newActionableItems }) {
  return <Button onClick={onClick} className={className} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#000000' />
    {newActionableItems && <span styleName='nav-badge' data-testid='inboxCount-badge' />}
  </Button>
}

export default MenuButton
