import React from 'react'
import { render, fireEvent } from '@testing-library/react'
// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'
import { title as backIconTitle } from 'components/icons/BackIcon'

it('should render the title and a menu icon', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() }
  }
  const { getByText, getByTestId } = render(
    <Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

// describe('with backTo defined', () => {
//   it('should render the title and a back button', () => {
//     const props = {
//       title: 'the title',
//       backTo: '/previous-page',
//       history: { push: jest.fn() }
//     }
//     const { getByText, getByTestId } = render(
//       <Header {...props} />)

//     expect(getByText(props.title)).toBeInTheDocument()
//     expect(getByText(backIconTitle)).toBeInTheDocument()
//     expect(getByText('Back')).toBeInTheDocument()

//     fireEvent.click(getByTestId('back-button'))

//     expect(props.history.push).toHaveBeenCalledWith(props.backTo)
//   })
// })
