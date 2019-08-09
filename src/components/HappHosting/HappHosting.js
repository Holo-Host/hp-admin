import React from 'react'
import { isEmpty } from 'lodash'
import './HappHosting.module.css'
import RoundImage from 'components/RoundImage'
import HashIcon from 'components/HashIcon'
import SpecificButton from 'components/SpecificButton'

<<<<<<< HEAD
export default function HappHosting ({ allAvailableHapps = [], registerHostingUser, hostingUser, enableHapp, disableHapp }) {
  const unHostedHapps = allAvailableHapps.filter(h => !h.isEnabled)
  const hostedHapps = allAvailableHapps.filter(h => h.isEnabled)
=======
export default function HappHosting ({
  allHapps,
  allAvailableHapps,
  allHostedHapps,
  registerHostingUser,
  hostingUser,
  enableHapp,
  disableHapp
}) {
  // console.log("Host WHOAMI Result >> ", hostingUser)
>>>>>>> 89f33349ab424961da7a74994044e69c7f1c6f8a

  return <div>
    {hostingUser && hostingUser.id
      ? <h2>Current Host: {hostingUser.id}</h2>
      : <SpecificButton styleName='center-items' onClick={() => registerHostingUser('info to register host')} >Register as Host</SpecificButton>
    }

    <hr />

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

<<<<<<< HEAD
export function HappRow ({ happ, enableHapp, disableHapp, hosted }) {
  const { id, title, thumbnailUrl, homepageUrl, dnaHash } = happ
=======
export function HappRow ({ happ, hhaId, dataIshosted, dataHhaHapp, enableHapp, disableHapp }) {
  // console.log("happName, hhaId : ", happ.title, hhaId);
  const { title, thumbnailUrl, homepageUrl, hash } = happ
>>>>>>> 89f33349ab424961da7a74994044e69c7f1c6f8a
  return <div styleName='happ-row'>
    <RoundImage url={thumbnailUrl} size={60} styleName='thumbnail' />
    <div>{title}</div>
    <a styleName='homepage' href={homepageUrl}>Home Page</a>
    <HashIcon hash={dnaHash} size={64} />
    {hosted && <SpecificButton onClick={() => disableHapp(id)}>Stop hosting</SpecificButton>}
    {!hosted && <SpecificButton onClick={() => enableHapp(id)}>Start hosting</SpecificButton>}
  </div>
}
