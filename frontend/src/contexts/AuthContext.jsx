import { createContext, useContext, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1/users'

const client = axios.create({
  baseURL: API_BASE_URL,
})

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  async function register(name, userNameInput, password) {
    const response = await client.post('/register', {
      name,
      username: userNameInput,
      password,
    })
    return response.data?.message ?? 'Registered'
  }

  async function login(userNameInput, password) {
    const response = await client.post('/login', {
      username: userNameInput,
      password,
    })

    const authToken = response.data?.token
    if (!authToken) {
      throw new Error('Token missing in login response')
    }

    localStorage.setItem('token', authToken)
    localStorage.setItem('username', userNameInput)
    setToken(authToken)
    setUsername(userNameInput)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken('')
    setUsername('')
  }

  const value = useMemo(
    () => ({
      token,
      username,
      isAuthenticated: Boolean(token),
      register,
      login,
      logout,
      apiBaseUrl: API_BASE_URL,
    }),
    [token, username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
