import React from 'react'
import { isEmpty } from 'lodash'
import './HappHosting.module.css'
import RoundImage from 'components/RoundImage'
import HashIcon from 'components/HashIcon'
import Button from 'components/Button'

export default function HappHosting ({ allAvailableHapps = [], enableHapp, disableHapp, history: { push } }) {
  const sortedHapps = allAvailableHapps.sort((a, b) => a.isEnabled ? -1 : b.isEnabled ? 1 : 0)
  const goToMenu = () => push('/menu')

  return <div>
    <div styleName='header'>
      <span styleName='title'>hApps</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    {!isEmpty(sortedHapps) && <div>
      {sortedHapps.map(happ => <HappRow
        happ={happ}
        disableHapp={disableHapp}
        enableHapp={enableHapp}
        key={happ.id}
      />)}
    </div>}
  </div>
}

export function HappRow ({ happ, enableHapp, disableHapp }) {
  const { id, title, thumbnailUrl, homepageUrl, dnaHash, isEnabled } = happ
  return <div styleName='happ-row'>
    <RoundImage url={thumbnailUrl} size={60} styleName='thumbnail' />
    <div>{title}</div>
    <a styleName='homepage' href={homepageUrl}>Home Page</a>
    <HashIcon hash={dnaHash} size={64} />
    {isEnabled && <Button onClick={() => disableHapp(id)}>Stop hosting</Button>}
    {!isEnabled && <Button onClick={() => enableHapp(id)}>Start hosting</Button>}
  </div>
}
