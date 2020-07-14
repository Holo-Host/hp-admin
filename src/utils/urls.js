
export const ROOT = '/'
export const HP_ADMIN_LOGIN = '/admin/login'
export const HP_ADMIN_DASHBOARD_PATH = '/admin/dashboard'
export const HP_ADMIN_SETTINGS = '/admin/settings'

export function isLoginPage(window) {
  return window.location.pathname !== '/' && window.location.pathname !== '/admin/login'
}