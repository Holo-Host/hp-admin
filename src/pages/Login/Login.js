import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import { get } from 'lodash/fp'
import './Login.module.css'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import HoloFuelIcon from 'components/icons/HoloFuelIcon'
import useConnectionContext from 'contexts/useConnectionContext'
import useAuthContext from 'contexts/useAuthContext'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import HposCheckAuthMutation from 'graphql/HposCheckAuthMutation.gql'
import { getHpAdminKeypair, eraseHpAdminKeypair } from 'holochainClient'

export default function Login ({ history: { push } }) {
  const [checkAuth] = useMutation(HposCheckAuthMutation)
  const { register, handleSubmit, errors } = useForm()
  const { isConnected } = useConnectionContext()
  const { setIsAuthed } = useAuthContext()
  const { setCurrentUser } = useCurrentUserContext()
  const { newMessage } = useFlashMessageContext()

  const onSubmit = async ({ email, password }) => {
    eraseHpAdminKeypair()
    // we call this to SET the singleton value of HpAdminKeypair
    await getHpAdminKeypair(email, password)
    const authResult = await checkAuth()
    const isAuthed = get('data.hposCheckAuth.isAuthed', authResult)
    setIsAuthed(isAuthed)

    if (isAuthed) {
      push('/admin')
      const hposSettings = get('data.hposCheckAuth.hposSettings', authResult)
      const hostCurrentUser = {
        hostPubKey: hposSettings.hostPubKey,
        hostName: hposSettings.hostName || ''
      }
      setCurrentUser(hostCurrentUser)
    } else {
      newMessage('Incorrect email or password. Please check and try again.', 5000)
    }
  }

  return <PrimaryLayout showHeader={false} showAlphaFlag={false}>
    <div styleName='container'>
      <div styleName='backdrop' />
      <form styleName='form' onSubmit={handleSubmit(onSubmit)}>
        <div styleName='form-box'>
          <div styleName='holofuel-icon-disc'>
            <HoloFuelIcon styleName='holofuel-icon' color='#fff' />
          </div>
          <h1 styleName='title'>Login to HP Admin</h1>
          <label styleName='label' htmlFor='email'>Email:</label>
          <input
            type='email'
            name='email'
            id='email'
            styleName='input'
            ref={register({ required: true })}
            disabled={!isConnected}
          />
          {errors.email && <small styleName='field-error'>
            You need to provide a valid email address.
          </small>}

          <label styleName='label' htmlFor='password'>Password:</label>
          <input
            type='password'
            name='password'
            id='password'
            styleName='input'
            ref={register({ required: true, minLength: 6 })}
            disabled={!isConnected}
          />
          {errors.password && <small styleName='field-error'>
            {errors.password.type === 'required' && 'Type in your password, please.'}
            {errors.password.type === 'minLength' && 'Password need to be at least 6 characters long.'}
          </small>}
        </div>
        <Button type='submit' variant='green' wide styleName='login-button' disabled={!isConnected}>Login</Button>
      </form>
      <div styleName='reminder-text-block'>*Remember, Holo doesn’t store your password so we can’t recover it for you. Please save your password securely!</div>
      <div styleName='reminder-text-block'>
        <a styleName='reminder-text' href='https://holo.host/control-your-data' target='_blank' rel='noopener noreferrer'>Learn more</a> about controlling your own data.
      </div>
      <div styleName='version-info'>UI v{process.env.REACT_APP_VERSION}</div>
    </div>
  </PrimaryLayout>
}
