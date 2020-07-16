import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { mockNavigateTo } from 'react-router-dom'
import Header from './Header'

jest.mock('contexts/useCurrentUserContext')

it('should render the title', async () => {
  const props = {
    title: 'the title'
  }

  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()

  fireEvent.click(getByTestId('avatar-link'))
  expect(mockNavigateTo).toHaveBeenCalledWith('/admin/dashboard')
})
