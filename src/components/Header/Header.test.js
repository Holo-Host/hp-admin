import React from 'react'
import { fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { mockNavigateTo } from 'react-router-dom'
import { renderAndWait } from 'utils/test-utils'
import Header from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

jest.mock('contexts/useAuthTokenContext')

it('should render the title and a menu icon', async () => {
  const hamburgerClick = jest.fn()

  const props = {
    title: 'the title',
    settings: {},
    hamburgerClick
  }

  let getByText, getByTestId
  await act(async () => {
    ({ getByText, getByTestId } = await renderAndWait(<Header {...props} />))
    await wait(0)
  })

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))
  expect(hamburgerClick).toHaveBeenCalled()

  fireEvent.click(getByTestId('avatar-link'))
  expect(mockNavigateTo).toHaveBeenCalledWith('/settings')
})
