import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function MeetingPage({ socketUrl }) {
    const { id } = useParams()
    const { username } = useAuth()
    const [connectedUsers, setConnectedUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
  
    const socket = useMemo(() => io(socketUrl, { transports: ['websocket'] }), [socketUrl])
  
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