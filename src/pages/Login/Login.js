import React from 'react'
import useForm from 'react-hook-form'
import './Login.module.css'
import Header from 'components/Header'
import Button from 'components/Button'
import Input from 'components/Input'

export default function Login ({ history: { push } }) {
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = () => push('/')

  console.log('Login form errors (leave here until proper error handling is implemented):', errors)

  return <>
    <Header title='HoloPort' />

    <form styleName='login-form' onSubmit={handleSubmit(onSubmit)}>
      <label styleName='login-label' htmlFor='email'>Email</label>
      <Input
        variant='big'
        type='email'
        name='email'
        placeholder='Email address'
        ref={register} />
      <label styleName='login-label' htmlFor='email'>Password</label>
      <Input
        variant='big'
        type='password'
        name='password'
        placeholder='Password'
        ref={register} />
      <Button type='submit' variant='primary' wide styleName='login-button'>Login</Button>
    </form>
  </>
}
