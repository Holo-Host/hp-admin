import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

// testing the named export Header rather than the default export which is wrapped in withRouter
import MyProfile from './MyProfile'

const renderMyProfile = (
  props,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      <MyProfile history={history} {...props} />
    </Router>
  ),
  history
})

describe('Rendering', () => {
  it('should render the header', () => {
    const { getByText } = renderMyProfile()

    expect(getByText('Edit Profile')).toBeInTheDocument()
  })

  it('should render the avatar url input', async () => {
    const { getByLabelText } = renderMyProfile()
    const input = getByLabelText('Avatar URL')

    expect(input).toBeInTheDocument()
  })

  it('should render the name input', async () => {
    const { getByLabelText } = renderMyProfile()
    const input = getByLabelText('Name')

    expect(input).toBeInTheDocument()
  })

  it('should render the email input', async () => {
    const { getByLabelText } = renderMyProfile()
    const input = getByLabelText('Email')

    expect(input).toBeInTheDocument()
  })

  it('should render the password input', async () => {
    const { getByLabelText } = renderMyProfile()
    const input = getByLabelText('Password')

    expect(input).toBeInTheDocument()
  })

  it('should render the submit button', async () => {
    const { getByText } = renderMyProfile()
    const button = getByText('Save Changes')

    expect(button).toBeInTheDocument()
  })
})

describe('Validation', () => {
  it('should reject empty name', async () => {
    const pushSpy = jest.fn()
    const { getByLabelText, getByText } = renderMyProfile({
      history: { push: pushSpy }
    })
    const input = getByLabelText('Name')
    fireEvent.change(input, { target: { value: '' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    const error = getByText('You need to set your name.')
    expect(error).toBeInTheDocument()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('should reject empty email', async () => {
    const pushSpy = jest.fn()
    const { getByLabelText, getByText } = renderMyProfile({
      history: { push: pushSpy }
    })
    const input = getByLabelText('Email')
    fireEvent.change(input, { target: { value: '' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    const error = getByText('You need to provide a valid email address.')
    expect(error).toBeInTheDocument()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('should reject incorrect email', async () => {
    const pushSpy = jest.fn()
    const { getByLabelText, getByText } = renderMyProfile({
      history: { push: pushSpy }
    })
    const input = getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'some value' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    const error = getByText('You need to provide a valid email address.')
    expect(error).toBeInTheDocument()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('should not show error for correct email', async () => {
    const { getByLabelText, getByText, queryByText } = renderMyProfile()
    const input = getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'alice@example.com' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    const error = queryByText('You need to provide a valid email address.')
    expect(error).not.toBeInTheDocument()
  })

  it('should not show error for name when provided', async () => {
    const { getByLabelText, getByText, queryByText } = renderMyProfile()
    const input = getByLabelText('Name')
    fireEvent.change(input, { target: { value: 'Alice' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    const error = queryByText('You need to set your name.')
    expect(error).not.toBeInTheDocument()
  })

  it('should accept the form when all required fields pass validation', async () => {
    const pushSpy = jest.fn()
    const { getByLabelText, getByText } = renderMyProfile({
      history: { push: pushSpy }
    })
    const nameImput = getByLabelText('Name')
    fireEvent.change(nameImput, { target: { value: 'Alice' } })
    const emailInput = getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } })

    await act(async () => {
      fireEvent.click(getByText('Save Changes'))
      await wait(0)
    })

    expect(pushSpy).toHaveBeenCalled()
  })
})
