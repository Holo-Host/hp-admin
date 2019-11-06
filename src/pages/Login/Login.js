import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import { get } from 'lodash/fp'
import './Login.module.css'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import Input from 'components/Input'
import useAuthTokenContext from 'contexts/useAuthTokenContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import HposCheckAuthMutation from 'graphql/HposCheckAuthMutation.gql'

const mockWebCryptoModule = (email, password) => {
  if (email === 'a.b@c.com') return 'badauthkey'

  return 'EGeYSAmjxp1kNBzXAR2kv7m3BNxyREZnVwSfh3FX7Ew'
}

export default function Login ({ history: { push } }) {
  const [checkAuth] = useMutation(HposCheckAuthMutation)
  const { register, handleSubmit, errors } = useForm()
  const { setAuthToken, setIsAuthed } = useAuthTokenContext()
  const { newMessage } = useFlashMessageContext()

  const onSubmit = async ({ email, password }) => {
    const authToken = mockWebCryptoModule(email, password)
    setAuthToken(authToken)
    const authResult = await checkAuth({ variables: { authToken } })
    const isAuthed = get('data.hposCheckAuth.isAuthed', authResult)
    setIsAuthed(isAuthed)

    if (isAuthed) {
      push('/')
    } else {
      newMessage('Incorrect email or password. Please check and try again.', 5000)
    }
  }

  return <PrimaryLayout
    headerProps={{
      title: 'HoloPort'
    }}
  >
    <form styleName='login-form' onSubmit={handleSubmit(onSubmit)}>
      <label styleName='login-label' htmlFor='email'>Email</label>
      <Input
        variant='big'
        type='email'
        name='email'
        placeholder='Email address'
        ref={register({ required: true })} />
      {errors.email && <small styleName='field-error'>
        You need to provide a valid email address.
      </small>}

      <label styleName='login-label' htmlFor='email'>Password</label>
      <Input
        variant='big'
        type='password'
        name='password'
        placeholder='Password'
        ref={register({ required: true, minLength: 6 })} />
      {errors.password && <small styleName='field-error'>
        {errors.password.type === 'required' && 'Type in your password, please.'}
        {errors.password.type === 'minLength' && 'Password need to be at least 6 characters long.'}
      </small>}

      <Button type='submit' variant='primary' wide styleName='login-button'>Login</Button>
    </form>
  </PrimaryLayout>
}
