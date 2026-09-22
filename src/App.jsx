import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cabinet from './pages/Cabinet'
import Admin from './pages/Admin'
import ProjectDetail from './pages/ProjectDetail'
import CookieConsent from './components/CookieConsent'

export default function App() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
      <CookieConsent />
    </>
  )
}
