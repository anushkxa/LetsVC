import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function AuthPage() {
    const { login, register, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({ name: '', username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
  
    if (isAuthenticated) {
      return <Navigate to="/" replace />
    }
  
    async function handleSubmit(e) {
      e.preventDefault()
      setLoading(true)
      setError('')
      try {
        if (isLogin) {
          await login(form.username, form.password)
        } else {
          await register(form.name, form.username, form.password)
          await login(form.username, form.password)
        }
        navigate('/')
      } catch (err) {
        setError(err?.response?.data?.message ?? 'Unable to continue. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  
    return (
      <main className="page auth">
        <section className="card auth-card">
          <h2>{isLogin ? 'Login' : 'Create account'}</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            )}
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            {error && <p className="error">{error}</p>}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          <button className="link-btn" onClick={() => setIsLogin((prev) => !prev)}>
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </section>
      </main>
    )
  }