import React from 'react'
import { isEmpty } from 'lodash'
import './BrowseHapps.module.css'
import Button from 'components/Button'
import cx from 'classnames'

export default function BrowseHapps ({ allAvailableHapps = [], enableHapp, disableHapp, history: { push } }) {
  const sortedHapps = allAvailableHapps.sort((a, b) => a.isEnabled ? -1 : b.isEnabled ? 1 : 0)
  const goToMenu = () => push('/menu')

  return <div>
    <div styleName='header'>
      <span styleName='title'>hApps</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    {!isEmpty(sortedHapps) && <div styleName='happ-list' role='list'>
      {sortedHapps.map(happ =>
        <HappRow
          happ={happ}
          enableHapp={enableHapp}
          disableHapp={disableHapp}
          key={happ.id} />)}
    </div>}
  </div>
}

export function HappRow ({ happ, enableHapp, disableHapp }) {
  const { id, title, description, thumbnailUrl, isEnabled } = happ
  return <div styleName='happ-row' role='listitem'>
    <img src={thumbnailUrl} styleName='icon' alt={`${title} icon`} />
    <div styleName='details'>
      <div styleName='title-row'>
        <span styleName='title'>{title}</span>
        <HostButton
          isEnabled={isEnabled}
          enableHapp={() => enableHapp(id)}
          disableHapp={() => disableHapp(id)} />
      </div>
      <div styleName='description'>{description}</div>
    </div>
  </div>
}

export function HostButton ({ isEnabled, enableHapp, disableHapp }) {
  const onClick = isEnabled ? disableHapp : enableHapp
  return <Button onClick={onClick} styleName={cx('host-button', { unhost: isEnabled })}>
    {isEnabled ? 'Un-Host' : 'Host' }
  </Button>
}
