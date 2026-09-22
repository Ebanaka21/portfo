import { useState } from 'react'
import { createInquiry } from '../api/client'
import { trackEvent } from '../analytics'

const initialForm = {
  name: '',
  email: '',
  telegram: '',
  company: '',
  service: 'Сайт / digital-продукт',
  budget: '',
  deadline: '',
  reference_url: '',
  brief: '',
  consent: false,
}

export default function InquiryModal({ project, onClose }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createInquiry({ ...form, project_id: project.id })
      setSubmitted(true)
      trackEvent('inquiry_submitted', { projectId: project.id })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm md:items-center md:p-6" onMouseDown={onClose}>
      <div className="max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-t-[2rem] border border-[#353545] bg-[#111114] p-6 shadow-2xl md:rounded-[2rem] md:p-8" onMouseDown={event => event.stopPropagation()}>
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7453D1]">Start a project</p>
            <h2 className="text-3xl font-black tracking-tight">Обсудим похожий проект?</h2>
            <p className="mt-2 text-sm text-white/40">Заявка по проекту: {project.title}</p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost !px-2 !text-xl" aria-label="Закрыть">×</button>
        </div>

        {submitted ? (
          <div className="rounded-3xl border border-[#4caf50]/30 bg-[#4caf50]/10 p-8">
            <p className="text-3xl">✓</p>
            <h3 className="mt-4 text-2xl font-bold">Заявка отправлена</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">Спасибо! Я изучу задачу и свяжусь с тобой по указанным контактам.</p>
            <button type="button" onClick={onClose} className="btn-primary mt-6">Закрыть</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-2xl border border-[#ff4444]/30 bg-[#ff4444]/10 px-5 py-3 text-sm text-[#ff6666]">{error}</div>}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-xs font-medium text-white/45">Имя *
                <input className="input-dark mt-2" value={form.name} onChange={event => update('name', event.target.value)} required placeholder="Как к тебе обращаться" />
              </label>
              <label className="block text-xs font-medium text-white/45">Email *
                <input type="email" className="input-dark mt-2" value={form.email} onChange={event => update('email', event.target.value)} required placeholder="hello@example.com" />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-xs font-medium text-white/45">Telegram
                <input className="input-dark mt-2" value={form.telegram} onChange={event => update('telegram', event.target.value)} placeholder="@username" />
              </label>
              <label className="block text-xs font-medium text-white/45">Компания / проект
                <input className="input-dark mt-2" value={form.company} onChange={event => update('company', event.target.value)} placeholder="Название или ссылка" />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-xs font-medium text-white/45">Что нужно сделать?
                <select className="input-dark mt-2" value={form.service} onChange={event => update('service', event.target.value)}>
                  <option>Сайт / digital-продукт</option>
                  <option>UI/UX-дизайн</option>
                  <option>Брендинг</option>
                  <option>3D / визуализация</option>
                  <option>Другое</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-white/45">Примерный бюджет
                <input className="input-dark mt-2" value={form.budget} onChange={event => update('budget', event.target.value)} placeholder="Например, 150 000 ₽" />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-xs font-medium text-white/45">Желаемые сроки
                <input className="input-dark mt-2" value={form.deadline} onChange={event => update('deadline', event.target.value)} placeholder="Например, 1–2 месяца" />
              </label>
              <label className="block text-xs font-medium text-white/45">Ссылка на референсы
                <input type="url" className="input-dark mt-2" value={form.reference_url} onChange={event => update('reference_url', event.target.value)} placeholder="https://..." />
              </label>
            </div>

            <label className="block text-xs font-medium text-white/45">Расскажи о задаче *
              <textarea className="input-dark mt-2" rows="5" value={form.brief} onChange={event => update('brief', event.target.value)} required placeholder="Что нужно сделать, для кого и какой результат хочется получить?" />
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-white/45">
              <input type="checkbox" checked={form.consent} onChange={event => update('consent', event.target.checked)} required className="mt-0.5 h-4 w-4 accent-[#7453D1]" />
              <span>Согласен на обработку заявки и обратную связь по указанным контактам.</span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-4">
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
