import React from 'react'
import { Link, MemoryRouter } from 'react-router-dom'
import { render, fireEvent } from '@testing-library/react'
import Inbox from 'holofuel/pages/Inbox'
import CreateOffer from 'holofuel/pages/CreateOffer'
import CreateRequest from 'holofuel/pages/CreateRequest'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import HFRouter from './HFRouter'
import {
  INBOX_PATH,
  OFFER_PATH,
  REQUEST_PATH,
  HISTORY_PATH
} from 'holofuel/utils/urls'

jest.unmock('react-router-dom')

const makeMockHFPage = title => () => <div>
  <div data-testid='title'>{title}</div>
  <Link to='/'>slash</Link>
  <Link to={INBOX_PATH}>inbox</Link>
  <Link to={OFFER_PATH}>offer</Link>
  <Link to={REQUEST_PATH}>request</Link>
  <Link to={HISTORY_PATH}>history</Link>
</div>

jest.mock('holofuel/pages/Inbox')
Inbox.mockImplementation(makeMockHFPage('Inbox'))
jest.mock('holofuel/pages/CreateOffer')
CreateOffer.mockImplementation(makeMockHFPage('CreateOffer'))
jest.mock('holofuel/pages/CreateRequest')
CreateRequest.mockImplementation(makeMockHFPage('CreateRequest'))
jest.mock('holofuel/pages/TransactionHistory')
TransactionHistory.mockImplementation(makeMockHFPage('TransactionHistory'))

const testLinks = ui => {
  const { getByText } = render(ui)
  expect(getByText('Inbox')).toBeInTheDocument()

  fireEvent.click(getByText('offer'))
  expect(getByText('CreateOffer')).toBeInTheDocument()

  fireEvent.click(getByText('request'))
  expect(getByText('CreateRequest')).toBeInTheDocument()

  fireEvent.click(getByText('history'))
  expect(getByText('TransactionHistory')).toBeInTheDocument()
}

// we test three cases here, urls of the form '/', '/holofuel' and '/holofuel/'

describe('HFRouter', () => {
  it('works with root url', () => {
    testLinks(<MemoryRouter initialEntries={['/']}><HFRouter /></MemoryRouter>)
  })

  it('works from /holofuel', () => {
    testLinks(<MemoryRouter initialEntries={['/holofuel']}><HFRouter /></MemoryRouter>)
  })

  it('works from /holofuel/', () => {
    testLinks(<MemoryRouter initialEntries={['/holofuel/']}><HFRouter /></MemoryRouter>)
  })
})
