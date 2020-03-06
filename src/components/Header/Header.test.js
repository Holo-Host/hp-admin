import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { mockNavigateTo } from 'react-router-dom'
import Header from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

it('should render the title and a menu icon', async () => {
  const hamburgerClick = jest.fn()

  const props = {
    title: 'the title',
    settings: {},
    hamburgerClick
  }

  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))
  expect(hamburgerClick).toHaveBeenCalled()

  fireEvent.click(getByTestId('avatar-link'))
  expect(mockNavigateTo).toHaveBeenCalledWith('/admin/settings')
})
