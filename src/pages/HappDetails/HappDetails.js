import React, { useState } from 'react'
import HappThumbnail from 'components/HappThumbnail'
import HostButton from 'components/HostButton'
import Button from 'components/Button'
import Modal from 'components/Modal'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import './HappDetails.module.css'

import { useQuery, useMutation } from '@apollo/react-hooks'
import HappQuery from 'graphql/HappQuery.gql'
import EnableHappMutation from 'graphql/EnableHappMutation.gql'
import DisableHappMutation from 'graphql/DisableHappMutation.gql'

export default function HappDetails ({
  history: { push },
  match: { params }
} = {}) {
  const { data: { happ = [] } = {} } = useQuery(HappQuery, {
    variables: {
      id: params.appId || ''
    }
  })
  const [enableHappMutation] = useMutation(EnableHappMutation)
  const [disableHappMutation] = useMutation(DisableHappMutation)
  const enableHapp = appId => enableHappMutation({ variables: { appId } })
  const disableHapp = appId => disableHappMutation({ variables: { appId } })
  const [isModalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState({})

  if (!happ) {
    return null
  }

  const { id, title, description, thumbnailUrl, isEnabled } = happ
  const { summary: errorSummary, details: errorDetails } = error

  const handleEnableHapp = () => {
    enableHapp(id)
      .then(() => setModalOpen(true))
      .catch(errorDetails => setError({
        summary: 'Couldn\'t enable this hApp',
        details: errorDetails
      }))
  }

  return <PrimaryLayout headerProps={{ title: 'Hosting' }}>
    {errorSummary && <div styleName='error'>
      {errorSummary}
      {errorDetails && <code>{errorDetails.message}</code>}
    </div>}

    <summary styleName='summary'>
      <HappThumbnail url={thumbnailUrl} title={title} styleName='thumbnail' />
      <div styleName='details'>
        <h1 styleName='title'>{title}</h1>
        <HostButton
          isEnabled={isEnabled}
          enableHapp={handleEnableHapp}
          disableHapp={() => disableHapp(id)} />
      </div>
    </summary>

    <HappSection title='About'>
      <div styleName='description'>{description}</div>
    </HappSection>
    <Modal
      contentLabel='App Hosting Success'
      isOpen={isModalOpen}
      handleClose={() => setModalOpen(false)}
    >
      <header styleName='modal-header'>
        <p>
          <strong>{title}</strong> is now being hosted!
        </p>
      </header>
      <footer styleName='modal-footer'>
        <Button
          variant='primary'
          wide
          onClick={() => push('/browse-happs')}
        >
          Back to hApps
        </Button>

        {/* TODO: Implement this action */}
        <Button wide>Hosting Overview</Button>
      </footer>
    </Modal>
  </PrimaryLayout>
}

const HappSection = ({ title, className, children }) => (
  <section styleName='section' className={className}>
    <h2 styleName='section-title'>{title}</h2>
    {children}
  </section>
)
