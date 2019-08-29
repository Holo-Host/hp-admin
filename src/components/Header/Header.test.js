import React from 'react'
import { render, fireEvent } from '@testing-library/react'
// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { altText as menuIconAltText } from 'components/icons/MenuIcon'

it('should render the title and a menu icon', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() }
  }
  const { getByText, getByAltText, getByTestId } = render(
    <Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByAltText(menuIconAltText)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/menu')
})

describe('with backTo defined', () => {
  it('should render the title and a back button', () => {
    const props = {
      title: 'the title',
      backTo: '/previous-page',
      history: { push: jest.fn() }
    }
    const { getByText, getByTestId } = render(
      <Header {...props} />)

    expect(getByText(props.title)).toBeInTheDocument()
    expect(getByText('Back')).toBeInTheDocument()    

    fireEvent.click(getByTestId('back-button'))

    expect(props.history.push).toHaveBeenCalledWith(props.backTo)
  })
})
