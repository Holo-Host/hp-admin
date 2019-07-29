import React from 'react'
import './HappHosting.module.css'
import RoundImage from 'components/RoundImage'
import HashIcon from 'components/HashIcon'

export default function HappHosting ({ allHapps }) {
  return <div>
    {allHapps && <div styleName='happ-list'>
      {allHapps.map(happ => <HappRow happ={happ} key={happ.id} />)}
    </div>}
  </div>
}

export function HappRow ({ happ }) {
  const { title, thumbnailUrl, homepageUrl, hash } = happ
  return <div styleName='happ-row'>
    <RoundImage url={thumbnailUrl} size={60} styleName='thumbnail' />
    <div>{title}</div>
    <a styleName='homepage' href={homepageUrl}>Home Page</a>
    <HashIcon hash={hash} size={64} />
  </div>
}
