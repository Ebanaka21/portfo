import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, updateProfile } from '../api/client'

export default function Cabinet() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getMe()
      .then(data => {
        setUser(data.user)
        setName(data.user.name)
      })
      .catch(() => navigate('/login'))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await updateProfile({ name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) return null

  return (
    <div className="flex-1 pt-24 pb-16 px-8">
      <div className="max-w-[600px] mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-2">Личный кабинет</h1>
        <p className="text-white/40 text-sm mb-10">Управление профилем</p>

        <div className="card-dark space-y-6">
          <div className="flex items-center gap-5 pb-6 border-b border-[#25252d]">
            <div className="w-16 h-16 rounded-2xl bg-[#7453D1]/10 flex items-center justify-center text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold">{user.name}</p>
              <p className="text-white/40 text-sm">{user.email}</p>
              <p className="text-xs text-[#7453D1] mt-1 font-medium">
                {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {saved && (
              <div className="bg-[#4caf50]/10 border border-[#4caf50]/30 text-[#4caf50] text-sm px-5 py-3 rounded-2xl">
                ✓ Профиль обновлён
              </div>
            )}
            {error && (
              <div className="bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff6666] text-sm px-5 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-white/40 font-medium mb-2 ml-1">Имя</label>
              <input type="text" className="input-dark" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs text-white/40 font-medium mb-2 ml-1">Email</label>
              <input type="email" className="input-dark opacity-50" value={user.email} disabled />
              <p className="text-xs text-white/20 mt-1 ml-1">Email изменить нельзя</p>
            </div>

            <button type="submit" className="btn-primary">Сохранить изменения</button>
          </form>
        </div>
      </div>
    </div>
  )
}
