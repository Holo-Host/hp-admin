import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import Button from 'holofuel/components/Button'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelUpdateUserMutation from 'graphql/HolofuelUpdateUserMutation.gql'
import Loading from 'components/Loading'
import './Profile.module.css'

export default function Profile () {
  const { loading, data: { holofuelUser: { nickname, imageUrl } = {} } = {} } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const [updateUser] = useMutation(HolofuelUpdateUserMutation)

  const { register, handleSubmit, errors } = useForm()

  const onSubmit = ({ nickname, imageUrl }) => {
    updateUser({
      variables: { nickname, imageUrl }
    })
  }

  return <PrimaryLayout headerProps={{ title: 'Profile' }}>
    <div>
      {loading && <Loading />}
      <form styleName='form' onSubmit={handleSubmit(onSubmit)}>
        <label styleName='label' htmlFor='nickname'>Name:</label>
        <input
          type='text'
          name='nickname'
          id='nickname'
          styleName='input'
          defaultValue={nickname}
          ref={register({ required: true, minLength: 5, maxLength: 20 })} />
        {errors.nickname && <small styleName='field-error'>
          Name must be between 5 and 20 characters.
        </small>}

        <label styleName='label' htmlFor='imageUrl'>User image:</label>
        <input
          type='text'
          name='imageUrl'
          id='imageUrl'
          styleName='input'
          defaultValue={imageUrl}
          ref={register} />
        <Button type='submit' variant='primary' wide styleName='update-button' disabled={!!errors.nickname}>Update</Button>
      </form>
    </div>
  </PrimaryLayout>
}
