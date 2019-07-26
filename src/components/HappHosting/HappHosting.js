import React from 'react'
import './HappHosting.module.css'
import RoundImage from 'components/RoundImage'

export default function HappHosting ({ allHapps }) {
  return <div>
    {allHapps && <div styleName='happ-list'>
      {allHapps.map(happ => <HappRow happ={happ} key={happ.id} />)}
    </div>}
  </div>
}

export function HappRow ({ happ }) {
  const { title, thumbnailUrl, homepageUrl } = happ
  return <div styleName='happ-row'>
    <RoundImage url={thumbnailUrl} />
    <div>{title} - </div>
    <a href={homepageUrl}>Home Page</a>
  </div>
}
