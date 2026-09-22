import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/client'

export default function Register() {
  const [name, setName] = useState('')
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
      await register(email, password, name)
      navigate('/cabinet')
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
          <h1 className="text-3xl font-black tracking-tight mb-2">Регистрация</h1>
          <p className="text-white/40 text-sm">Создай аккаунт для личного кабинета</p>
        </div>

        <form onSubmit={handleSubmit} className="slide-up space-y-5" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff6666] text-sm px-5 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 ml-1">Имя</label>
            <input type="text" className="input-dark" placeholder="User" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 ml-1">Email</label>
            <input type="email" className="input-dark" placeholder="User@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs text-white/40 font-medium mb-2 ml-1">Пароль</label>
            <input type="password" className="input-dark" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-8 slide-up" style={{ animationDelay: '0.2s' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-[#7453D1] hover:underline font-medium">Войти</Link>
        </p>
      </div>
    </div>
  )
}
