import React from 'react'
import './HappHosting.module.css'
import RoundImage from 'components/RoundImage'
import HashIcon from 'components/HashIcon'
import SpecificButton from 'components/SpecificButton'

export default function HappHosting ({ allHapps, allAvailableHapps, allHostedHapps, registerHostingUser, hostingUser }) {

  console.log("registerHostingUser > ", registerHostingUser)
  console.log("hostingUser > ", hostingUser)

  return <div>
    <SpecificButton styleName='center-items' onClick={registerHostingUser} >Register as Host</SpecificButton>

    {allHapps &&
    <main>
      <h3 styleName='center-items'>hApps Available in hApp Store</h3>
      <div styleName='happ-list'>
        {allHapps.map(happ => <HappRow happ={happ} key={happ.id} dataIshosted={false} />)}
      </div>
    </main>}

    {allAvailableHapps && allHapps ?
      <main>
        <h3 styleName='center-items'>hApps Available to Host</h3>
        <div styleName='happ-list'>
          {allAvailableHapps.map(availHapp => {
            const happ = allHapps.find(hasHapp => availHapp.happListing === hasHapp.id)
            console.log("available happ for hosting : ", happ)

            return(<HappRow happ={happ} key={happ.id} dataIshosted={false} />)
          })}
        </div>
      </main>
      :
      <main>
        <h4 styleName='center-items'>No hApps are yet registered on HHA.</h4>
      </main>
    }

    {allHostedHapps && allAvailableHapps && allHapps ?
      <main>
        <h3 styleName='center-items'>Currently Hosted hApps</h3>
        <div styleName='happ-list'>
          {allHostedHapps.map(hostedHapp => {
            const happIsHosted = allAvailableHapps.find(hhaHapp => hostedHapp.id === hhaHapp.id)
            console.log("happIsHosted : ", happIsHosted)

            const happ = allHapps.find(hasHapp => happIsHosted.happListing === hasHapp.id)
            console.log("hosted happ to be displayed : ", happ)

            return(<HappRow happ={happ} key={happ.id} dataIshosted={true} />)
          })}
        </div>
      </main>
      :
      <main>
        <h4 styleName='center-items'>You are not yet hosting any hApps.</h4>
      </main>
    }

  </div>
}

export function HappRow ({ happ, dataIshosted, enableHapp }) {
  const { title, thumbnailUrl, homepageUrl, hash } = happ
  return <div styleName='happ-row' onClick={dataIshosted ? console.log("We need to plug in and disableHapp") : enableHapp}>
    <RoundImage url={thumbnailUrl} size={60} styleName='thumbnail' />
    <div>{title}</div>
    <a styleName='homepage' href={homepageUrl}>Home Page</a>
    <HashIcon hash={hash} size={64} />
  </div>
}
