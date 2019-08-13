import React from 'react'
import { isEmpty } from 'lodash'
import './HappHosting.module.css'
import Button from 'components/Button'

export default function HappHosting ({ allAvailableHapps = [], history: { push } }) {
  const sortedHapps = allAvailableHapps.sort((a, b) => a.isEnabled ? -1 : b.isEnabled ? 1 : 0)
  const goToMenu = () => push('/menu')

  return <div>
    <div styleName='header'>
      <span styleName='title'>hApps</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    {!isEmpty(sortedHapps) && <div styleName='happ-list' role='list'>
      {sortedHapps.map(happ => <HappRow happ={happ} key={happ.id} />)}
    </div>}
  </div>
}

export function HappRow ({ happ }) {
  const { title, description, thumbnailUrl, homepageUrl, isEnabled } = happ
  return <div styleName='happ-row' role='listitem'>
    <img src={thumbnailUrl} styleName='icon' alt={`${title} icon`} />
    <div styleName='details'>
      <div styleName='title-row'>
        <span styleName='title'>{title}</span>
        {isEnabled && <span styleName='is-hosted'>Hosted</span>}
      </div>
      <a styleName='homepage' href={homepageUrl}>Home Page</a>
      <div styleName='description'>{description}</div>
    </div>
  </div>
}
