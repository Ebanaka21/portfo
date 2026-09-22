import { useEffect, useState } from 'react'
import { clearAnalyticsSession } from '../analytics'

const STORAGE_KEY = 'karol_cookie_consent_v1'

const defaultConsent = {
  necessary: true,
  preferences: false,
  analytics: false,
}

function readConsent() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (!value || value.version !== 1) return null
    return value
  } catch {
    return null
  }
}

function saveConsent(value) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    ...value,
    savedAt: new Date().toISOString(),
  }))
}

function CookieRow({ title, description, checked, disabled, onChange }) {
  return (
    <div className="flex items-start justify-between gap-5 border-t border-white/[0.08] py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-white/90">{title}</p>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/45">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition ${checked ? 'border-[#7453D1] bg-[#7453D1]' : 'border-white/20 bg-white/[0.06]'} ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      >
        <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

export default function CookieConsent() {
  const [consent, setConsent] = useState(defaultConsent)
  const [visible, setVisible] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    setVisible(!readConsent())

    const openSettings = () => {
      const stored = readConsent()
      setConsent(stored ? {
        necessary: true,
        preferences: Boolean(stored.preferences),
        analytics: Boolean(stored.analytics),
      } : defaultConsent)
      setVisible(true)
      setSettingsOpen(true)
    }

    window.addEventListener('open-cookie-settings', openSettings)
    return () => window.removeEventListener('open-cookie-settings', openSettings)
  }, [])

  useEffect(() => {
    if (!settingsOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = event => {
      if (event.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [settingsOpen])

  const finish = nextConsent => {
    if (!nextConsent.analytics) clearAnalyticsSession()
    saveConsent(nextConsent)
    setConsent(nextConsent)
    setSettingsOpen(false)
    setVisible(false)
    window.dispatchEvent(new Event('analytics-consent-changed'))
  }

  if (!visible) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-white/[0.12] bg-[#111115]/95 p-5 shadow-[0_-20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7453D1] shadow-[0_0_14px_rgba(116,83,209,0.9)]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a995f2]">Ваши настройки приватности</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Мы используем необходимые cookies для входа и работы сайта. Остальные настройки можно выбрать самостоятельно.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              <button type="button" onClick={() => setSettingsOpen(true)} className="rounded-xl border border-white/[0.14] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white">
                Настроить
              </button>
              <button type="button" onClick={() => finish({ ...defaultConsent, preferences: true, analytics: true })} className="rounded-xl bg-[#7453D1] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#8d76e8]">
                Принять всё
              </button>
            </div>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSettingsOpen(false) }}>
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-white/[0.14] bg-[#111115] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:p-7" role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a995f2]">Privacy center</p>
                <h2 id="cookie-settings-title" className="mt-2 text-2xl font-black tracking-tight text-white">Настройки cookies</h2>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Закрыть настройки cookies" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] text-xl text-white/55 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white">×</button>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/55">
              Обязательные cookies нужны для авторизации и безопасности. Дополнительные категории сейчас не подключают сторонние сервисы и включаются только по вашему выбору.
            </p>

            <div className="mt-6">
              <CookieRow title="Необходимые" description="Авторизация, защита сессии и базовая работа сайта. Отключить нельзя." checked={consent.necessary} disabled onChange={() => {}} />
              <CookieRow title="Предпочтения" description="Сохраняет настройки интерфейса и выбранные пользовательские параметры." checked={consent.preferences} onChange={value => setConsent(current => ({ ...current, preferences: value }))} />
              <CookieRow title="Аналитика" description="Обезличенная статистика внутри сайта. Данные не передаются сторонним сервисам и включаются только по вашему выбору." checked={consent.analytics} onChange={value => setConsent(current => ({ ...current, analytics: value }))} />
            </div>

            <div className="mt-7 flex flex-col-reverse gap-2 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => finish({ ...defaultConsent })} className="rounded-xl border border-white/[0.14] px-4 py-3 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white">Только необходимые</button>
              <button type="button" onClick={() => finish(consent)} className="rounded-xl bg-[#7453D1] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#8d76e8]">Сохранить выбор</button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
