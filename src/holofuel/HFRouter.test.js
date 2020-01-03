import React from 'react'
import { Link, MemoryRouter } from 'react-router-dom'
import { render, fireEvent } from '@testing-library/react'
import Home from 'holofuel/pages/Home'
import Inbox from 'holofuel/pages/Inbox'
import CreateOfferRequest from 'holofuel/pages/CreateOfferRequest'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import HFRouter from './HFRouter'
import {
  INBOX_PATH,
  OFFER_REQUEST_PATH,
  HISTORY_PATH
} from 'holofuel/utils/urls'

jest.unmock('react-router-dom')

const makeMockHFPage = title => () => <div>
  <div data-testid='title'>{title}</div>
  <Link to='/'>slash</Link>
  <Link to={INBOX_PATH}>inbox</Link>
  <Link to={OFFER_REQUEST_PATH}>offer-request</Link>
  <Link to={HISTORY_PATH}>history</Link>
</div>

jest.mock('holofuel/pages/Home')
Home.mockImplementation(makeMockHFPage('Home'))
jest.mock('holofuel/pages/Inbox')
Inbox.mockImplementation(makeMockHFPage('Inbox'))
jest.mock('holofuel/pages/CreateOfferRequest')
CreateOfferRequest.mockImplementation(makeMockHFPage('CreateOfferRequest'))
jest.mock('holofuel/pages/TransactionHistory')
TransactionHistory.mockImplementation(makeMockHFPage('TransactionHistory'))

const testLinks = ui => {
  const { getByText } = render(ui)

  expect(getByText('Home')).toBeInTheDocument()

  fireEvent.click(getByText('inbox'))
  expect(getByText('Inbox')).toBeInTheDocument()

  fireEvent.click(getByText('offer-request'))
  expect(getByText('CreateOfferRequest')).toBeInTheDocument()

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
