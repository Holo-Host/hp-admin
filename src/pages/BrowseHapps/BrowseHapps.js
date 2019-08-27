import React from 'react'
import { isEmpty } from 'lodash/fp'
import { Link } from 'react-router-dom'
import HappThumbnail from 'components/HappThumbnail'
import HostButton from 'components/HostButton'
import './BrowseHapps.module.css'

import { useQuery, useMutation } from '@apollo/react-hooks'
import Button from 'components/Button'
import HappsQuery from 'graphql/HappsQuery.gql'
import EnableHappMutation from 'graphql/EnableHappMutation.gql'
import DisableHappMutation from 'graphql/DisableHappMutation.gql'

export default function BrowseHapps ({ history: { push } }) {
  const { data: { happs = [] } } = useQuery(HappsQuery)
  const [enableHappMutation] = useMutation(EnableHappMutation)
  const [disableHappMutation] = useMutation(DisableHappMutation)
  const enableHapp = appId => enableHappMutation({ variables: { appId } })
  const disableHapp = appId => disableHappMutation({ variables: { appId } })

  const sortedHapps = happs.sort((a, b) => a.isEnabled ? -1 : b.isEnabled ? 1 : 0)
  const goToMenu = () => push('/menu')
  const goToPricing = () => push('/pricing')

  return <div styleName='container'>
    <div styleName='header'>
      <span styleName='title'>hApps</span>
      <button onClick={goToMenu} styleName='menu-button'>Menu</button>
    </div>

    {!isEmpty(sortedHapps) && <div styleName='happ-list' role='list'>
      {sortedHapps.map(happ =>
        <HappRow
          happ={happ}
          enableHapp={enableHapp}
          disableHapp={disableHapp}
          key={happ.id} />)}
    </div>}

    <Button variant='primary' wide onClick={goToPricing} styleName='pricing-button'>Manage Pricing</Button>

  </div>
}

export function HappRow ({ happ, enableHapp, disableHapp }) {
  const { id, happStoreId, title, description, thumbnailUrl, isEnabled } = happ
  return <Link to={'/browse-happs/' + happStoreId} styleName='happ-row' role='listitem'>
    <HappThumbnail url={thumbnailUrl} title={title} />
    <div styleName='details'>
      <div styleName='title-row'>
        <span styleName='title'>{title}</span>
        <HostButton
          isEnabled={isEnabled}
          enableHapp={() => enableHapp(id)}
          disableHapp={() => disableHapp(id)} />
      </div>
      <div styleName='description'>{description}</div>
    </div>
  </Link>
}
