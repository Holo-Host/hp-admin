import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { mockNavigateTo } from 'react-router-dom'
import Header from './Header'

jest.mock('contexts/useCurrentUserContext')

it('should render the title and a menu icon', async () => {
  const props = {
    title: 'the title',
    settings: {
      deviceName: 'devicename'
    }
  }

  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(props.settings.deviceName)).toBeInTheDocument()

  fireEvent.click(getByTestId('settings-link'))
  expect(mockNavigateTo).toHaveBeenCalledWith('/admin/settings')
})
