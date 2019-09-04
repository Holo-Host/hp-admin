import React from 'react'
import useForm from 'react-hook-form'

import Header from 'components/Header'
import Button from 'components/Button'
import HashIcon from 'components/HashIcon'
import './MyProfile.module.css'

// eslint-disable-next-line no-useless-escape
const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const MyProfile = ({
  history: { push }
}) => {
  const { register, handleSubmit, errors, watch } = useForm()
  const onSubmit = data => {
    push('/dashboard')
  }
  const avatarUrl = watch('avatar')
  const emailSeed = watch('email') || 'default-seed'

  return [
    <Header title='Edit Profile' key='header' />,

    <form onSubmit={handleSubmit(onSubmit)} styleName='form'>
      {avatarUrl
        ? <img src={avatarUrl} alt='Avatar' styleName='avatar-image' />
        : <HashIcon hash={emailSeed} styleName='avatar-image' size={96} />
      }
      <label styleName='field'>
        <span styleName='field-name'>Avatar URL</span>
        <input
          name='avatar'
          placeholder='eg. https://example.com/avatar.jpg'
          ref={register}
          styleName='field-input'
        />
        {errors.avatar && <small styleName='field-error'>
          Avatar needs to be a valid URL.
        </small>}
      </label>

      <label styleName='field'>
        <span styleName='field-name'>Name</span>
        <input
          name='name'
          placeholder='eg. Alice Cooper'
          ref={register({ required: true })}
          styleName='field-input'
        />
        {errors.name && <small styleName='field-error'>
          You need to set your name.
        </small>}
      </label>

      <label styleName='field'>
        <span styleName='field-name'>Email</span>
        <input
          name='email'
          placeholder='eg. alice@example.com'
          ref={register({ required: true, pattern: EMAIL_REGEXP })}
          styleName='field-input'
        />
        {errors.email && <small styleName='field-error'>
          You need to provide a valid email address.
        </small>}
      </label>

      <label styleName='field'>
        <span styleName='field-name'>Password</span>
        <input
          name='password'
          type='password'
          placeholder='type to reset password'
          ref={register}
          styleName='field-input'
        />
      </label>

      <Button
        variant='primary'
        wide

        styleName='save-button'
      >
        Save Changes
      </Button>
    </form>
  ]
}

export default MyProfile
