import React from 'react'
import { fireEvent, wait, act } from '@testing-library/react'
import waait from 'waait'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import runHposApi from 'utils/integration-testing/runHposApiWithSetup'
import HposInterface from 'data-interfaces/HposInterface'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

export const login = async (queries, email = 'test@123.com', password = 'MyHostpw123') => {
  return new Promise(resolve => {
    const loginResult = async () => await act(async () => { // eslint-disable-line no-return-await
      fireEvent.change(queries.getByLabelText('Email'), { target: { value: email } })
      fireEvent.change(queries.getByLabelText('Password'), { target: { value: password } })
      fireEvent.click(queries.getByText('Login'))
      await waait(0)
      return wait(() => queries.getByText('My HoloPort'))
    })
    resolve(loginResult)
  })
}

describe.skip('Login', () => {
  it('User navigates to Settings Page, updates software, reviews factory reset instructions', runHposApi(async () => {
    const hposSettings = await HposInterface.os.settings()

    const email = 'a@example.com'
    const password = 'fkldsjf'

    const queries = await renderAndWait(<HPAdminApp />)
    const { queryByLabelText, getByText } = queries

    await login(queries, email, password)
      .then(result => result())

    expect(getByText(`Hi ${hposSettings.hostName}!`)).toBeInTheDocument()
    expect(queryByLabelText('Email')).not.toBeInTheDocument()
  }), 150000)
})
