import React from 'react'
import './HappHosting.module.css'
import RoundImage from 'components/RoundImage'
import HashIcon from 'components/HashIcon'
import SpecificButton from 'components/SpecificButton'

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

  return <div>
    {hostingUser && hostingUser.result ?
       <h2>Current Host: {hostingUser.result}</h2>
    :
       <SpecificButton styleName='center-items' onClick={()=>registerHostingUser({host_doc:"info to register host"})} >Register as Host</SpecificButton>
     }

    <hr/>

    {allHapps &&
    <main>
      <h3 styleName='center-items'>hApps Available in hApp Store</h3>
      <div styleName='happ-list'>
        {allHapps.map(happ => <HappRow happ={happ} key={happ.id} enableHapp={enableHapp} disableHapp={disableHapp} hhaId={null} dataIshosted={false} dataHhaHapp={false}/>)}
      </div>
    </main>}

    {allAvailableHapps && allHapps ?
      <div/>
      :
      <main>
        <h3 styleName='center-items'>No hApps are yet registered on HHA.</h3>
      </main>
    }

    {allHostedHapps && allAvailableHapps && allHapps ?
      <main>
        <article>
          <h3 styleName='center-items'>hApps Available to Host</h3>
          <div styleName='happ-list'>
            {allAvailableHapps.map(availHapp => {
              // Determine whether the happ is unhosted.
              const hostedHapp = allHostedHapps.find(hostedHapp => availHapp.id === hostedHapp.id) || null

              const happCurrentlyHosted = hostedHapp ? true : false
              console.log("hosted happ in hha? , happInfo >>", happCurrentlyHosted, availHapp)

              if(happCurrentlyHosted){return(<div key={availHapp.id}/>)}
              else{}

              // Define happ based on happ with HAS entry details
              const happ = allHapps.find(hasHapp => availHapp.happStoreAddress === hasHapp.id)

              if(happ){
                return(<HappRow happ={happ} key={happ.id} enableHapp={enableHapp} disableHapp={disableHapp} dataIshosted={false} hhaId={availHapp.id} dataHhaHapp={true}/>)
              }
              else{return <div key={availHapp.id}/>}

            })}
          </div>
        </article>
        <article>
          <h3 styleName='center-items'>Currently Hosted hApps</h3>
          <div styleName='happ-list'>
            {allHostedHapps.map(hostedHapp => {
              const happIsHosted = allAvailableHapps.find(hhaHapp => hostedHapp.id === hhaHapp.id) || null

              // Define happ for each of the happs that are in HAS, HHA, & are enabled by Host for hosting.
              const happ = happIsHosted && allHapps.find(hasHapp => happIsHosted.happStoreAddress === hasHapp.id)

              if(happ){
                return(<HappRow happ={happ} hhaId={hostedHapp.id} enableHapp={enableHapp} disableHapp={disableHapp} key={happ.id} dataIshosted={true} dataHhaHapp={true}/>)
              }
              else{return <div key={hostedHapp.id}/>}
            })}
          </div>
        </article>
      </main>
      :
      <main>
        <h4 styleName='center-items'>You are not yet hosting any hApps.</h4>
      </main>
    }

  </div>
}

export function HappRow ({ happ, hhaId, dataIshosted, dataHhaHapp, enableHapp, disableHapp }) {
  // console.log("happName, hhaId : ", happ.title, hhaId);
  const { title, thumbnailUrl, homepageUrl, hash } = happ
  return <div styleName='happ-row'>
    <RoundImage url={thumbnailUrl} size={60} styleName='thumbnail' />
    <div>{title}</div>
    <a styleName='homepage' href={homepageUrl}>Home Page</a>
    <HashIcon hash={hash} size={64} />
    {dataHhaHapp && dataIshosted ?
      <SpecificButton onClick={()=>disableHapp({app_hash: hhaId})}>Disable</SpecificButton>
    : dataHhaHapp &&
      <SpecificButton onClick={()=>enableHapp(hhaId)}>Enable</SpecificButton>
    }
  </div>
}
