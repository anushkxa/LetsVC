import './App.css'
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import LandingPage from  "./pages/landing/landing.jsx";
import HeaderPage from './pages/headerPage.jsx';
import Authentication from './pages/auth/authentication.jsx';
import FooterPage from './pages/footer.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
function App() {

  return (
    <>
    <Router>
      <AuthProvider>
      <HeaderPage/>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path='/auth' element={<Authentication/>}/>
      </Routes>
      <FooterPage/>
      </AuthProvider>
    </Router>
    </>
  )
}

export default App
