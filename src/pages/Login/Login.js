import React from 'react'
import useForm from 'react-hook-form'
import './Login.module.css'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import Input from 'components/Input'

export default function Login ({ history: { push } }) {
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = () => push('/')

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
