import React from 'react'
import { isEmpty } from 'lodash'
import './HappHosting.module.css'
import RoundImage from 'components/RoundImage'
import HashIcon from 'components/HashIcon'
import Button from 'components/Button'

export default function HappHosting ({ allAvailableHapps = [], enableHapp, disableHapp, history: { push } }) {
  const unHostedHapps = allAvailableHapps.filter(h => !h.isEnabled)
  const hostedHapps = allAvailableHapps.filter(h => h.isEnabled)

  const goToMenu = () => push('/menu')

  return <div>
    <div styleName='header'>
      <span styleName='title'>hApps</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    {!isEmpty(unHostedHapps) && <div>
      <h3>Available Happs</h3>
      {unHostedHapps.map(happ => <HappRow
        happ={happ}
        enableHapp={enableHapp}
        key={happ.id}
      />)}
    </div>}

    {!isEmpty(hostedHapps) && <div>
      <h3>Currently Hosted Happs</h3>
      {hostedHapps.map(happ => <HappRow
        happ={happ}
        disableHapp={disableHapp}
        hosted
        key={happ.id}
      />)}
    </div>}

  </div>
}

export function HappRow ({ happ, enableHapp, disableHapp, hosted }) {
  const { id, title, thumbnailUrl, homepageUrl, dnaHash } = happ
  return <div styleName='happ-row'>
    <RoundImage url={thumbnailUrl} size={60} styleName='thumbnail' />
    <div>{title}</div>
    <a styleName='homepage' href={homepageUrl}>Home Page</a>
    <HashIcon hash={dnaHash} size={64} />
    {hosted && <Button onClick={() => disableHapp(id)}>Stop hosting</Button>}
    {!hosted && <Button onClick={() => enableHapp(id)}>Start hosting</Button>}
  </div>
}
