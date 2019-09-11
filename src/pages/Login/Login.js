import React from 'react'
import useForm from 'react-hook-form'
import './Login.module.css'
import Header from 'components/Header'
import Button from 'components/Button'

export default function Login ({ history: { push } }) {
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = () => push('/')

  console.log('Login form errors (leave here until proper error handling is implemented):', errors)

  return <>
    <Header title='HoloPort' />

    <form styleName='login-form' onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor='email'>Email</label>
      <input
        type='email'
        name='email'
        placeholder='Email address'
        styleName='form-input'
        ref={register} />
      <label htmlFor='email'>Password</label>
      <input
        type='password'
        name='password'
        placeholder='Password'
        styleName='form-input'
        ref={register} />
      <Button type='submit' variant='primary' wide styleName='login-button'>Login</Button>
    </form>
  </>
}
