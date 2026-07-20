import { defineStore } from 'pinia'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user',
  },
  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.login(username, password)
        this.user = response.data.user
        this.token = response.data.token
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('token', this.token)
        return this.user
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    logout() {
      // Clear state IMMEDIATELY (synchronous) so router guard works instantly
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      // Fire-and-forget the API call (no await)
      authService.logout().catch(() => {})
    },
    async updateProfile({ name, password }) {
      this.loading = true
      this.error = null
      try {
        const userId = this.user.id || this.user.username
        const response = await authService.updateProfile(userId, { name, password })
        this.user = { ...this.user, ...response.data.user }
        localStorage.setItem('user', JSON.stringify(this.user))
        return this.user
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    init() {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      if (storedUser && storedToken) {
        try {
          this.user = JSON.parse(storedUser)
          this.token = storedToken
        } catch (e) {
          this.logout()
        }
      }
    }
  }
})
