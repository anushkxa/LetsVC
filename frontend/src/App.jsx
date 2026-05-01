import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from './contexts/AuthContext.jsx'
import './App.css'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8000'

function createMeetingId() {
  return crypto.randomUUID().slice(0, 8)
}

function HomePage() {
  const [meetingInput, setMeetingInput] = useState('')
  const navigate = useNavigate()
  const { username, logout, isAuthenticated } = useAuth()

  function handleCreateMeeting() {
    const meetingId = createMeetingId()
    navigate(`/meeting/${meetingId}`)
  }

  function handleJoinMeeting(e) {
    e.preventDefault()
    const cleanId = meetingInput.trim()
    if (!cleanId) return
    navigate(`/meeting/${cleanId}`)
  }

  return (
    <main className="landing">
      <header className="landing-nav">
        <h1 className="brand">LetsVC</h1>
        <nav className="landing-links">
          <a href="#home">HOME</a>
          <a href="#contact">CONTACT US</a>
        </nav>
        <div className="landing-auth">
          {isAuthenticated ? (
            <>
              <span className="tag">Hi, {username}</span>
              <button className="btn ghost" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="link-minimal">Log in</Link>
              <Link to="/auth" className="btn dark">Sign up</Link>
            </>
          )}
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <h2>ONLINE VIDEO CALL</h2>
          <p>
            Fast, simple and secure meetings for your team. Start a room in one click
            and invite anyone with a meeting code.
          </p>
          <div className="actions-row">
            <button className="btn soft" onClick={handleCreateMeeting}>Learn more</button>
          </div>
          <form onSubmit={handleJoinMeeting} className="join-form">
            <input
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              placeholder="Enter meeting id"
              aria-label="Meeting id"
            />
            <button className="btn" type="submit">Join meeting</button>
          </form>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="blob blob-one" />
          <div className="blob blob-two" />
          <div className="blob blob-three" />
          <div className="phone left">
            <div className="speaker" />
            <div className="avatar yellow" />
          </div>
          <div className="phone right">
            <div className="speaker" />
            <div className="avatar orange" />
          </div>
        </div>
      </section>

      <section className="dots" id="services">
        <span />
        <span />
        <span />
      </section>
    </main>
  )
}

function AuthPage() {
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

function MeetingPage() {
  const { id } = useParams()
  const { username } = useAuth()
  const [connectedUsers, setConnectedUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const socket = useMemo(() => io(SOCKET_URL, { transports: ['websocket'] }), [])

  useEffect(() => {
    socket.emit('join-call', id)

    socket.on('user-joined', (_socketId, participants) => {
      setConnectedUsers(participants)
    })

    socket.on('user-left', (socketId) => {
      setConnectedUsers((prev) => prev.filter((idValue) => idValue !== socketId))
    })

    socket.on('chat-message', (data, sender, senderId) => {
      setMessages((prev) => [...prev, { id: `${senderId}-${Date.now()}`, sender, data }])
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [id, socket])

  function sendMessage(e) {
    e.preventDefault()
    const cleanMsg = chatInput.trim()
    if (!cleanMsg) return
    socket.emit('chat-message', cleanMsg, username)
    setChatInput('')
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Meeting Room</h1>
          <p className="muted">Meeting ID: <strong>{id}</strong></p>
        </div>
        <Link to="/" className="btn ghost">Back</Link>
      </header>

      <section className="meeting-layout">
        <article className="card">
          <h2>Call area</h2>
          <p className="muted">
            Socket connected participants: {connectedUsers.length || 1}
          </p>
          <div className="video-placeholder">Video streams will render here.</div>
        </article>

        <aside className="card chat">
          <h2>Chat</h2>
          <div className="chat-list">
            {messages.length === 0 && (
              <p className="muted">No messages yet. Say hello to everyone.</p>
            )}
            {messages.map((msg) => (
              <p key={msg.id}>
                <strong>{msg.sender}:</strong> {msg.data}
              </p>
            ))}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message..."
            />
            <button type="submit" className="btn secondary">Send</button>
          </form>
        </aside>
      </section>
    </main>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<HomePage />} />
      <Route
        path="/meeting/:id"
        element={
          <ProtectedRoute>
            <MeetingPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
