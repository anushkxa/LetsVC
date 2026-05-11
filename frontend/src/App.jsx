import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import Footer from './footer.jsx'
import './App.css'
import HomePage from './pages/landing/home.jsx'
import MeetingComponent from './pages/landing/meeting.jsx'
import AuthPage from './pages/auth/auth.jsx'
const heroMainImage = '/icons.svg'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8000'

function createMeetingId() {
  return crypto.randomUUID().slice(0, 8)
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
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage createMeetingId={createMeetingId} heroMainImage={heroMainImage} />} />
        <Route path="/meeting/:url" element={<MeetingComponent />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
