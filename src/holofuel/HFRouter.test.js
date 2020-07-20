import React from 'react'
import { Link, MemoryRouter } from 'react-router-dom'
import { render, fireEvent } from '@testing-library/react'
import Inbox from 'holofuel/pages/Inbox'
import CreateOfferRequest from 'holofuel/pages/CreateOfferRequest'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import FourOhFour from 'holofuel/pages/FourOhFour'
import HFRouter from './HFRouter'
import {
  INBOX_PATH,
  OFFER_REQUEST_PATH,
  HISTORY_PATH
} from 'holofuel/utils/urls'

jest.unmock('react-router-dom')
jest.mock('components/AuthRoute')

const makeMockHFPage = title => () => <div>
  <div data-testid='title'>{title}</div>
  <Link to='/holofuel'>slash</Link>
  <Link to={`/holofuel/${INBOX_PATH}`}>inbox</Link>
  <Link to={`/holofuel/${OFFER_REQUEST_PATH}`}>offer-request</Link>
  <Link to={`/holofuel/${HISTORY_PATH}`}>history</Link>
</div>

jest.mock('holofuel/pages/Inbox')
Inbox.mockImplementation(makeMockHFPage('Inbox'))
jest.mock('holofuel/pages/CreateOfferRequest')
CreateOfferRequest.mockImplementation(makeMockHFPage('CreateOfferRequest'))
jest.mock('holofuel/pages/TransactionHistory')
TransactionHistory.mockImplementation(makeMockHFPage('TransactionHistory'))
jest.mock('holofuel/pages/FourOhFour')
FourOhFour.mockImplementation(makeMockHFPage('FourOhFour'))

const testLinks = ui => {
  const { getByText, debug } = render(ui)

  debug()

  fireEvent.click(getByText('inbox'))
  expect(getByText('Inbox')).toBeInTheDocument()

  fireEvent.click(getByText('offer-request'))
  expect(getByText('CreateOfferRequest')).toBeInTheDocument()

  fireEvent.click(getByText('history'))
  expect(getByText('TransactionHistory')).toBeInTheDocument()
}

// we test threee cases here, urls of the form '/', '/holofuel' and '/holofuel/'

describe('HFRouter', () => {
  it('works from root url', () => {
    testLinks(<MemoryRouter initialEntries={['/']}><HFRouter /></MemoryRouter>)
  })

  it('works from /holofuel', () => {
    testLinks(<MemoryRouter initialEntries={['/holofuel']}><HFRouter /></MemoryRouter>)
  })

  it('works from /holofuel/', () => {
    testLinks(<MemoryRouter initialEntries={['/holofuel/']}><HFRouter /></MemoryRouter>)
  })
})
