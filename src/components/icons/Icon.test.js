import React from 'react'
import { render } from '@testing-library/react'
import Icon from './Icon'

it('should render a title tag and the children', () => {
  const props = {
    title: 'the icon title'
  }
  const childText = 'This would normally be some svg child components like path and circle, this string is just for the purposes of testing.'

  const { getByText } = render(
    <Icon {...props}><span>{childText}</span></Icon>)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(childText)).toBeInTheDocument()
})
