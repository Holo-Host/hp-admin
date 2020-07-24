import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'holofuel/components/Button'
import Input from 'components/Input'
import HashAvatar from 'components/HashAvatar'
import Loading from 'components/Loading'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import MyHolofuelUserQuery from 'graphql/MyHolofuelUserQuery.gql'
import HolofuelUpdateUserMutation from 'graphql/HolofuelUpdateUserMutation.gql'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import './Profile.module.css'

function Card ({ title, subtitle, children }) {
  return <div styleName='card'>
    <h1 styleName='card-title'>{title}</h1>
    <h3 styleName='card-subtitle'>{subtitle}</h3>
    {children}
  </div>
}

export default function Profile () {
  const { loading, data: { myHolofuelUser, myHolofuelUser: { id, nickname } = {} } = {}, refetch: refetchMyHolofuelUser } = useQuery(MyHolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const [updateUser] = useMutation(HolofuelUpdateUserMutation)
  const { setCurrentUser } = useCurrentUserContext()
  const [optimisticNickname, setOptimisticNickname] = useState()
  // FIXME: this is a temporary hack until we can debug the underlying issue in the DNA
  const [hasRefetched, setHasRefetched] = useState(false)

  useEffect(() => {
    if (optimisticNickname && !hasRefetched) {
      refetchMyHolofuelUser()
      setHasRefetched(true)
    }
  }, [optimisticNickname, hasRefetched, refetchMyHolofuelUser])

  const { register, handleSubmit, triggerValidation, reset, errors } = useForm({ mode: 'onChange' })

  const onSubmit = ({ nickname }) => {
    updateUser({
      variables: { nickname },
      refetchQueries: [{
        query: MyHolofuelUserQuery
      }]
    })
      .catch(() => {
        // if updateUser throws an error we roll back our optimistic updates
        setOptimisticNickname()
        setCurrentUser(myHolofuelUser)
      })

    setOptimisticNickname(nickname)
    setCurrentUser({
      ...myHolofuelUser,
      nickname
    })
    setHasRefetched(false)
    reset({ nickname: '' })
  }

  return <PrimaryLayout headerProps={{ title: 'Profile' }}>
    <div styleName='backdrop' />
    {loading && <Loading />}
    <Card title='Update Profile' subtitle='Manage your account nickname.'>
      <form styleName='form' onSubmit={handleSubmit(onSubmit)}>
        <CopyAgentId agent={{ id }} isMe>
          <HashAvatar seed={id} styleName='avatar-image' data-testid='host-avatar' />
        </CopyAgentId>
        <h3 styleName='nickname-display' data-testid='profile-nickname'>{optimisticNickname || nickname || 'Your Nickname'}</h3>
        <label styleName='field'>
          <h3 styleName='field-name'>Nickname</h3>
          <Input

            name='nickname'
            className='input-centered'
            defaultValue={nickname}
            placeholder='eg. HoloNaut'
            ref={register({ required: true, minLength: 5, maxLength: 20 })}
            onKeyUp={() => triggerValidation('nickname')}
          />
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
