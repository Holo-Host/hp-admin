import React from 'react'
import { render } from '@testing-library/react'

import UIButton from './UIButton'

it('should render child text', () => {
  const childText = 'Child Text'
  const { getByText } = render(
    <UIButton>{childText}</UIButton>
  )

  expect(getByText(childText)).toBeInTheDocument()
})

it('should pass disabled attribute to underlying UIButton element', () => {
  const childText = 'Child Text'
  const { getByText } = render(
    <UIButton disabled>{childText}</UIButton>
  )

  expect(getByText(childText)).toHaveAttribute('disabled')
})
