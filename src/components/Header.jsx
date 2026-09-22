import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getMe, logout } from '../api/client'

export default function Header() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path, hash = '') => location.pathname === path && (!hash || location.hash === hash)

  useEffect(() => {
    getMe().then(response => setUser(response.user)).catch(() => setUser(null))
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/')
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 glass">
      <div className="mx-auto flex h-[4.5rem] max-w-[1400px] items-center justify-between px-5 md:px-8">
        <Link to="/" aria-label="Karol" className="flex items-center">
          <img src="/icons.svg" alt="Karol" className="h-8 w-8 object-contain" />
        </Link>

        <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/35 md:flex">
          <span className="status-dot">Сервер не отвечает</span>
          <span className="mx-2 text-white/15">/</span>
          <span>Volgograd → worldwide</span>
        </div>

        <nav className="flex items-center gap-1">
          {/* <Link to="/#works" className="btn-ghost hidden md:inline-flex">Работы</Link> */}
          {/* <Link to="/#about" className="btn-ghost hidden md:inline-flex">Обо мне</Link> */}
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" className="btn-ghost hidden lg:inline-flex">Админка</Link>}
              <Link to="/cabinet" className="btn-ghost hidden sm:inline-flex">{user.name}</Link>
              <button onClick={handleLogout} className="btn-ghost hidden lg:inline-flex">Выйти</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2.5 !text-xs">Войти</Link>
          )}
        </nav>
      </div>

      <nav className="mobile-bottom-nav md:hidden">
        <Link to="/" className={`mobile-nav-item ${isActive('/') && !location.hash ? 'mobile-nav-item-active' : ''}`} aria-current={isActive('/') && !location.hash ? 'page' : undefined}><span>⌂</span><small>Главная</small></Link>
        <Link to="/#works" className={`mobile-nav-item ${isActive('/', '#works') ? 'mobile-nav-item-active' : ''}`} aria-current={isActive('/', '#works') ? 'page' : undefined}><span>▦</span><small>Работы</small></Link>
        <a href="mailto:hello@karol.design" className="mobile-nav-item mobile-nav-action"><span>✦</span><small>Старт</small></a>
        <Link to={user ? '/cabinet' : '/login'} className={`mobile-nav-item ${isActive(user ? '/cabinet' : '/login') ? 'mobile-nav-item-active' : ''}`} aria-current={isActive(user ? '/cabinet' : '/login') ? 'page' : undefined}><span>○</span><small>{user ? 'Профиль' : 'Войти'}</small></Link>
      </nav>
    </header>
  )
}
