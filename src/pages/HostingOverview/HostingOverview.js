import React, { useState } from 'react'
import { isEmpty } from 'lodash'
import './HostingOverview.module.css'
import Button from 'components/Button'

export default function HostingOverview ({ allAvailableHapps = [], enableHapp, disableHapp, history: { push } }) {
  const hostedHapps = allAvailableHapps.filter(h => h.isEnabled)
  const goToMenu = () => push('/menu')
  const goToPricing = () => push('/pricing')

  return <div styleName='container'>
    <div styleName='header'>
      <span styleName='title'>Hosting Overview</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    {!isEmpty(hostedHapps) && <div styleName='happ-list' role='list'>
      {hostedHapps.map(happ => <HappRow
        happ={happ}
        enableHapp={enableHapp}
        disableHapp={disableHapp}
        key={happ.id} />)}
    </div>}

    <Button onClick={goToPricing} styleName='pricing-button'>Manage Pricing</Button>
  </div>
}

export function HappRow ({ happ, disableHapp, enableHapp }) {
  const { id, title, thumbnailUrl, isEnabled } = happ
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = () => setExpanded(!expanded)
  const onToggle = isEnabled ? () => disableHapp(id) : () => enableHapp(id)

  return <div styleName='happ-row' role='listitem'>
    <div styleName='happ-row-main'>
      <img src={thumbnailUrl} styleName='icon' alt={`${title} icon`} />
      <Button onClick={onToggle}>
        {isEnabled ? 'Stop Hosting' : 'Start Hosting'}
      </Button>
      <Button styleName='expansion-arrow' onClick={toggleExpanded}>
        {expanded ? 'less' : 'more'}
      </Button>
    </div>
    {expanded && <div styleName='happ-row-expanded'>
      <div>
        <span>Number of users:</span>
        <span>13</span>
      </div>
      <div>
        <span>Disk space used:</span>
        <span>7 MB</span>
      </div>
      <div>
        <span>% of CPU used:</span>
        <span>117</span>
      </div>      
    </div>}
  </div>
}
