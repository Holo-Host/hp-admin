
export const ROOT = '/'
export const HP_ADMIN_LOGIN_PATH = '/admin/login'
export const HP_ADMIN_DASHBOARD_PATH = '/admin/dashboard'
export const HP_ADMIN_SETTINGS_PATH = '/admin/settings'

export function isPage (page, window) {
  const pageTest = window.location.pathname === `/admin/${page}` || window.location.pathname === `/admin/${page}/`
  if (page === 'login') return isLoginPage(window)
  else if (page === 'dashboard') return window.location.pathname === '/admin/' || window.location.pathname === '/admin' || pageTest
  else return pageTest
}

export function isLoginPage (window) {
  return window.location.pathname === '/' || window.location.pathname === '/admin/login' || window.location.pathname === '/admin/login/'
}
