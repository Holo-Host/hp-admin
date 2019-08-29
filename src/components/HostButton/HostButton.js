import React from 'react'
import cx from 'classnames'
import Button from 'components/Button'
import './HostButton.module.css'

function HostButton ({ isEnabled, enableHapp, disableHapp }) {
  const action = isEnabled ? disableHapp : enableHapp
  const onClick = (e) => {
    e.preventDefault()
    action()
  }
  return <Button onClick={onClick} variant='mini' styleName={cx('host-button', { unhost: isEnabled })}>
    {isEnabled ? 'Un-Host' : 'Host' }
  </Button>
}

export default HostButton
