import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'
// import { title as backIconTitle } from 'components/icons/BackIcon'

const renderHeader = (
  props,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      <Header {...props} />
    </Router>
  ),
  history
})

it('should render the title and a menu icon', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() }
  }
  const { getByText, getByTestId } = renderHeader(props)

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
