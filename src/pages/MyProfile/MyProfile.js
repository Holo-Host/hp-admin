import React, { useState } from 'react'
import useForm from 'react-hook-form'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposUpdateSettingsMutation from 'graphql/HposUpdateSettingsMutation.gql'
import Button from 'components/Button'
import Input from 'components/Input'
import HashAvatar from 'components/HashAvatar'
import TosModal from 'components/TosModal'
import './MyProfile.module.css'

// eslint-disable-next-line no-useless-escape
// const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

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
    // console.log('SUBMITTED DATA : ', data)
    if (data.name) {
      // call HPOS Settings Mutation to update HPOS Host Name
      updateDeviceName(data.name)
    }
    // TODO : Determine how we would like to handle avatar link data persistance.
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
      avatarUrl // ,
      // email
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

      {/* TODO: Disuss email display options with C & Z. - Do we want to display the email here at all ? */}
      {/* NB: This field is not optional in the first release from User's end. */}
      {/* <label styleName='field'>
        <span styleName='field-name'>Email</span>
        <Input
          name='email'
          placeholder='eg. alice@example.com'
          ref={register({ required: true, pattern: EMAIL_REGEXP })}
          styleName='field-input'
        />
        {errors.email && <small styleName='field-error'>
          You need to provide a valid email address.
        </small>}
      </label> */}

      {/* NB: This field is not optional in the first release. A new pw would create new a pubkey / agent... */}
      {/* <label styleName='field'>
        <span styleName='field-name'>Password</span>
        <Input
          name='password'
          type='password'
          placeholder='type to reset password'
          ref={register}
          styleName='field-input'
        />
      </label> */}

      <Button variant='link' onClick={showTos} dataTestId='tos-button'>
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
