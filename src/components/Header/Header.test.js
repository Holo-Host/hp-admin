import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { ApolloProvider } from '@apollo/react-hooks'
import apolloClient from 'apolloClient'

// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

// TODO: switch to mock pattern for Router
jest.unmock('react-router-dom')

const renderHeader = (
  props,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      <ApolloProvider client={apolloClient}>
        <Header {...props} />
      </ApolloProvider>
    </Router>
  ),
  history
})

it('should render the title and a menu icon', async () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() }
  }

  let getByText, getByTestId
  await act(async () => {
    ({ getByText, getByTestId } = renderHeader(props))
    await wait(0)
  })

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
