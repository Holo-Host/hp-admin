import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'holofuel/components/Button'
import Input from 'components/Input'
import HashAvatar from 'components/HashAvatar'
import Loading from 'components/Loading'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelUpdateUserMutation from 'graphql/HolofuelUpdateUserMutation.gql'
import './Profile.module.css'

function Card ({ title, subtitle, children }) {
  return <div styleName='card'>
    <h1 styleName='card-title'>{title}</h1>
    <h3 styleName='card-subtitle'>{subtitle}</h3>
    {children}
  </div>
}

export default function Profile () {
  const { loading, data: { holofuelUser: { id, nickname } = {} } = {} } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const [updateUser] = useMutation(HolofuelUpdateUserMutation)

  const { register, handleSubmit, reset, errors } = useForm()

  const onSubmit = ({ nickname }) => {
    updateUser({
      variables: { id, nickname },
      refetchQueries: [{
        query: HolofuelUserQuery
      }]
    })
    reset({ nickname: '' })
  }

  return <PrimaryLayout headerProps={{ title: 'Profile' }}>
    <div styleName='backdrop' />
    {loading && <Loading />}
    <Card title='Update Profile' subtitle='Manage your account nickname and avatar.'>
      <form styleName='form' onSubmit={handleSubmit(onSubmit)}>
        <HashAvatar seed={id} styleName='avatar-image' data-testid='host-avatar' />
        <h3 styleName='nickname-display' data-testid='profile-nickname'>{nickname || 'Your Nickname'}</h3>
        <label styleName='field'>
          <span styleName='field-name'>Nickname</span>
          <Input
            name='nickname'
            defaultValue={nickname}
            placeholder='eg. HoloNaut'
            ref={register({ required: true, minLength: 5, maxLength: 20 })} />
          {errors.nickname && <small styleName='field-error'>
            Name must be between 5 and 20 characters.
          </small>}
        </label>

        <Button variant='primary' wide styleName='save-button' type='submit' disabled={!!errors.nickname}>
          Save Changes
        </Button>
      </form>
    </Card>
  </PrimaryLayout>
}
