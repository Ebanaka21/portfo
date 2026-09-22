import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      if (data.user.role === 'admin') navigate('/admin')
      else navigate('/cabinet')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10 slide-up">
          <h1 className="text-3xl font-black tracking-tight mb-2">Вход</h1>
          <p className="text-white/40 text-sm">Войди в личный кабинет</p>
        </div>

        <form onSubmit={handleSubmit} className="slide-up space-y-5" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff6666] text-sm px-5 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 ml-1">Email</label>
            <input
              type="email"
              className="input-dark"
              placeholder="User@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 ml-1">Пароль</label>
            <input
              type="password"
              className="input-dark"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-8 slide-up" style={{ animationDelay: '0.2s' }}>
          Нет аккаунта?{' '}
          <Link to="/register" className="text-[#7453D1] hover:underline font-medium">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
