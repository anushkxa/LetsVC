import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import heroMain from '../../assets/heroMain.png'

export default function HomePage({ createMeetingId}) {
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
      navigate(`/${cleanId}`)
    }
  
    return (
      <>
      <main className="landing">
        <header className="landing-nav">
          <h1 className="brand" style={{color: 'purple'}}>LetsVC</h1>
    
          <div className="landing-auth">
            {isAuthenticated ? (
              <>
                <span className="tag">Hi, {username}</span>
                <button className="btn ghost" onClick={logout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="link-minimal">Log in</Link>
                <Link to="/auth" className="btn purple">Sign up</Link>
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
            <img src={heroMain} alt="" className="hero-art-image" />
          </div>
        </section>

          <span />
          <span />
          <span />
      </main>
      <footer style={{ backgroundColor: '#333', color: '#fff', padding: '20px', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Anushka Ltd. . All rights reserved.</p>
      <nav>
        <a href="/privacy" style={{ color: '#fff', marginRight: '10px' }}>Privacy Policy</a>
        <a href="/terms" style={{ color: '#fff' }}>Terms of Service</a>
      </nav>
    </footer>
      </>
    )
  }