import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposUpdateSettingsMutation from 'graphql/HposUpdateSettingsMutation.gql'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import Input from 'components/Input'
import HashAvatar from 'components/HashAvatar'
import TosModal from 'components/TosModal'
import './MyProfile.module.css'

// Data - Mutation hook
function useUpdateDeviceName () {
  const [hposUpdateSettings] = useMutation(HposUpdateSettingsMutation)
  return (hostName) => hposUpdateSettings({
    variables: { hostName }
  })
}

const MyProfile = ({ history: { push } }) => {
  const { data: { hposSettings: settings = [] } = {} } = useQuery(HposSettingsQuery)
  const updateDeviceName = useUpdateDeviceName()

  const [isTosOpen, setTosOpen] = useState(false)
  const { register, handleSubmit, errors, watch } = useForm()
  const onSubmit = data => {
    // TODO : Determine how we would like to handle the data persistance for avatar link updates (not currently apart of any DNA).
    if (data.name) {
      // call HPOS Settings Mutation to update HPOS Host Name
      updateDeviceName(data.name)
    }
    push('/dashboard')
  }
  // const email = watch('email')
  const avatarUrl = watch('avatar')
  const showTos = e => {
    e.preventDefault()
    setTosOpen(true)
  }

  return <PrimaryLayout
    headerProps={{
      title: 'Edit Profile',
      avatarUrl
    }}
  >
    <form onSubmit={handleSubmit(onSubmit)} styleName='form'>
      <HashAvatar avatarUrl={avatarUrl} seed={settings.hostPubKey} styleName='avatar-image' data-testid='host-avatar' />
      <label styleName='field'>
        <span styleName='field-name'>Avatar URL</span>
        <Input
          name='avatar'
          placeholder='eg. https://example.com/avatar.jpg'
          ref={register}
          styleName='field-input'
        />
        {errors.avatar && <small styleName='field-error'>
          Avatar needs to be a valid URL.
        </small>}
      </label>

      <label styleName='field'>
        <span styleName='field-name'>Name</span>
        <Input
          name='name'
          placeholder='eg. Alice Cooper'
          ref={register({ required: true })}
          styleName='field-input'
        />
        {errors.name && <small styleName='field-error'>
          You need to set your name.
        </small>}
      </label>
      <Button variant='link' onClick={showTos}>
        View Terms of Service
      </Button>

      <TosModal isOpen={isTosOpen} handleClose={() => setTosOpen(false)} />

      <Button
        variant='primary'
        wide
        styleName='save-button'
        type='submit'
      >
        Save Changes
      </Button>
    </form>
  </PrimaryLayout>
}

export default MyProfile
