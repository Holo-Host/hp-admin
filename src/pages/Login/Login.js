import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import useForm from 'react-hook-form'
import { get } from 'lodash/fp'
import './Login.module.css'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import HoloFuelIcon from 'components/icons/HoloFuelIcon'
import useAuthTokenContext from 'contexts/useAuthTokenContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import HposCheckAuthMutation from 'graphql/HposCheckAuthMutation.gql'

// This import has to be async because of the way that dumb webpack interacts with wasm
// It took me more than 2 days to make it work so DO NOT even try to touch this code!
const getHpAdminKeypair = async () => {
    const wasm = await import("@holo-host/hp-admin-keypair")
    return wasm.HpAdminKeypair
}

// exported for testing
export const authToken = 'EGeYSAmjxp1kNBzXAR2kv7m3BNxyREZnVwSfh3FX7Ew'

const getHcPubkey = () => window.location.hostname.split('.')[0]

export default function Login ({ history: { push } }) {
  const [checkAuth] = useMutation(HposCheckAuthMutation)
  const { register, handleSubmit, errors } = useForm()
  const { setAuthToken, setIsAuthed } = useAuthTokenContext()
  const { newMessage } = useFlashMessageContext()

  const onSubmit = async ({ email, password }) => {
    const HpAdminKeypair = await getHpAdminKeypair();
    const hckey = '3llrdmlase6xwo9drzs6qpze40hgaucyf7g8xpjze6dz32s957'
    let keypair = new HpAdminKeypair(hckey, email, password)
    setAuthToken(keypair)
    const authResult = await checkAuth({ variables: { keypair } })
    const isAuthed = get('data.hposCheckAuth.isAuthed', authResult)
    setIsAuthed(isAuthed)

    if (isAuthed) {
      push('/')
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
            ref={register({ required: true })} />
          {errors.email && <small styleName='field-error'>
            You need to provide a valid email address.
          </small>}

          <label styleName='label' htmlFor='password'>Password:</label>
          <input
            type='password'
            name='password'
            id='password'
            styleName='input'
            ref={register({ required: true, minLength: 6 })} />
          {errors.password && <small styleName='field-error'>
            {errors.password.type === 'required' && 'Type in your password, please.'}
            {errors.password.type === 'minLength' && 'Password need to be at least 6 characters long.'}
          </small>}
        </div>
        <Button type='submit' variant='green' wide styleName='login-button'>Login</Button>
      </form>
      <div styleName='reminder-text-block'>*Remember, Holo doesn’t store your password so we can’t recover it for you. Please save your password securely!</div>
      <div styleName='reminder-text-block'><a styleName='reminder-text' href='https://www.wheredoesthisgo.com'>Learn more</a> about controlling your own data.</div>
    </div>
  </PrimaryLayout>
}
