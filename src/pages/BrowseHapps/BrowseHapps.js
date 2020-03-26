import React from 'react'
import { isEmpty } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import './BrowseHapps.module.css'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import GearIcon from 'components/icons/GearIcon'
import HappsQuery from 'graphql/HappsQuery.gql'
import EnableHappMutation from 'graphql/EnableHappMutation.gql'
import DisableHappMutation from 'graphql/DisableHappMutation.gql'

export default function BrowseHapps ({ history: { push } }) {
  const { data: { happs = [] } = {} } = useQuery(HappsQuery)
  const [enableHappMutation] = useMutation(EnableHappMutation)
  const [disableHappMutation] = useMutation(DisableHappMutation)
  const enableHapp = appId => enableHappMutation({ variables: { appId } })
  const disableHapp = appId => disableHappMutation({ variables: { appId } })

  const goToPricing = () => push('/pricing')

  const showPricingLink = false

  return <PrimaryLayout headerProps={{ title: 'Hosting' }}>
    <div styleName='header-row'>
      <h1 styleName='header'>Available hApps</h1>
      {showPricingLink && <div styleName='pricing-link' onClick={goToPricing}>
        <GearIcon styleName='gear-icon' color='#80858C' /> Manage Pricing
      </div>}
    </div>

    {!isEmpty(happs) && <div styleName='happ-list' role='list' data-testid='happ-row'>
      {happs.map(happ =>
        <HappRow
          happ={happ}
          enableHapp={enableHapp}
          disableHapp={disableHapp}
          key={happ.id}
        />)}
    </div>}
  </PrimaryLayout>
}

export function HappRow ({ happ, enableHapp, disableHapp }) {
  const { id, title, description, thumbnailUrl, isEnabled } = happ
  return <div styleName='happ-row' role='listitem'>
    <HappThumbnail url={thumbnailUrl} title={title} />
    <div styleName='details'>
      <h2 styleName='title'>{title}</h2>
      <div styleName='description'>{description}</div>
      <HostButton
        isEnabled={isEnabled}
        enableHapp={() => enableHapp(id)}
        disableHapp={() => disableHapp(id)}
      />
    </div>
  </div>
}

function HappThumbnail ({ title, url, className }) {
  return <img src={url} styleName='thumbnail' className={className} alt={`${title} icon`} />
}

function HostButton ({ isEnabled, enableHapp, disableHapp }) {
  const action = isEnabled ? disableHapp : enableHapp
  const onClick = (e) => {
    e.preventDefault()
    action()
  }
  return <Button onClick={onClick} variant={isEnabled ? 'green' : 'white'} styleName='host-button'>
    {isEnabled ? 'Unhost' : 'Host'}
  </Button>
}
