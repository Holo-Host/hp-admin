import { root } from 'holofuel/HFRouter'

export const INBOX_PATH = 'inbox'
export const OFFER_REQUEST_PATH = 'offer-request'
export const HISTORY_PATH = 'history'
export const HISTORY_FROM_SENT_TRANSACTION_PATH = `${HISTORY_PATH}?sent-transaction=true`
export const PROFILE_PATH = 'profile'
export const HP_ADMIN_DASHBOARD_PATH = '/admin/dashboard'
export const HP_ADMIN_LOGIN_PATH = '/admin/login'

export function isHolofuelPage (page, window) {
  const pageTest = window.location.pathname === `/${root}/${page}` || window.location.pathname === `/${root}/${page}/`
  if (page === INBOX_PATH) return window.location.pathname === `/${root}` || window.location.pathname === `/${root}/` || pageTest
  else return pageTest
}
