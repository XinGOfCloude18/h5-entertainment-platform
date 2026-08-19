import api from './index'

export function adminLogin(username, password) {
  return api.post('/api/auth/admin-login', { username, password })
}
