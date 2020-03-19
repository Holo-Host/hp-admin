import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelUpdateUserMutation from 'graphql/HolofuelUpdateUserMutation.gql'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'holofuel/components/Button'
import Input from 'components/Input'
import HashAvatar from 'components/HashAvatar'
import Loading from 'components/Loading'
import './Profile.module.css'

function Card ({ title, subtitle, children }) {
  return <div styleName='card'>
    <h1 styleName='card-title'>{title}</h1>
    <h3 styleName='card-subtitle'>{subtitle}</h3>
    {children}
  </div>
}

export default function Profile () {
  const { loading, data: { holofuelUser: { id, nickname, avatarUrl } = {} } = {} } = useQuery(HolofuelUserQuery)
  const [updateUser] = useMutation(HolofuelUpdateUserMutation)

  const { register, handleSubmit, reset, errors } = useForm()
  const onSubmit = ({ nickname, avatarUrl }) => {
    updateUser({
      variables: { nickname, avatarUrl }
    })
    reset({ nickname: '', avatarUrl: '' })
  }

  return <PrimaryLayout color='iceburg' headerProps={{ title: 'Profile' }}>
    <div styleName='backdrop' />
    {loading && <Loading />}
    <Card title='Update Profile' subtitle='Manage your account nickname and avatar.'>
      <form onSubmit={handleSubmit(onSubmit)} styleName='form'>
        <HashAvatar avatarUrl={avatarUrl} seed={id} styleName='avatar-image' data-testid='host-avatar' />
        <h3 styleName='nickname-display'>{nickname || 'Your Nickname'}</h3>
        <label styleName='field'>
          <span styleName='field-name'>Avatar URL</span>
          <Input
            name='avatarUrl'
            defaultValue={avatarUrl}
            placeholder='eg. https://example.com/avatar.jpg'
            ref={register}
            styleName='field-input'
          />
          {errors.avatar && <small styleName='field-error'>
            Avatar needs to be a valid URL.
          </small>}
        </label>

        <label styleName='field'>
          <span styleName='field-name'>Nickname</span>
          <Input
            name='nickname'
            defaultValue={nickname}
            placeholder='eg. HoloNaut'
            ref={register({ required: true, minLength: 5, maxLength: 20 })}
            styleName='field-input'
          />
          {errors.name && <small styleName='field-error'>
            Nickname must be between 5 and 20 characters.
          </small>}
        </label>

        <Button variant='primary' wide styleName='save-button' type='submit' disabled={!!errors.nickname}>
          Save Changes
        </Button>
      </form>
    </Card>
  </PrimaryLayout>
}
