const eventLabels = {
  page_view: 'Просмотр страницы',
  project_view: 'Открыт проект',
  preview_expand: 'Развёрнут preview',
  preview_external: 'Preview открыт отдельно',
  inquiry_open: 'Открыта форма заявки',
  inquiry_submitted: 'Отправлена заявка',
  cta_click: 'Нажата CTA-кнопка',
}

export default function AnalyticsPanel({ analytics, formatDate }) {
  if (!analytics) return null

  const metrics = [
    ['События', analytics.total_events ?? 0],
    ['Сессии', analytics.unique_sessions ?? 0],
    ['Просмотры', analytics.page_views ?? 0],
    ['Заявки', analytics.inquiries_submitted ?? 0],
  ]

  return (
    <section className="mb-8 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
      <div className="admin-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Private analytics</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Что происходит на сайте</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/40">Внутренняя обезличенная статистика. Без сторонних счётчиков, IP и содержимого форм.</p>
          </div>
          <span className="badge-tag">внутренняя</span>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <strong className="block text-2xl font-black tracking-tight">{value}</strong>
              <span className="mt-1 block text-xs text-white/35">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 border-t border-[#25252d] pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Популярные проекты</p>
          <div className="mt-3 space-y-2">
            {(analytics.top_projects || []).length === 0 && <p className="text-sm text-white/35">Данных пока нет.</p>}
            {(analytics.top_projects || []).map(item => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm">
                <span className="truncate text-white/70">{item.title}</span>
                <span className="shrink-0 text-xs text-[#a995f2]">{item.events} событий</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div>
          <p className="eyebrow">Live events</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Последние события</h2>
        </div>
        <div className="mt-6 space-y-1">
          {(analytics.recent_events || []).length === 0 && <p className="rounded-2xl border border-dashed border-[#34343d] p-5 text-sm text-white/35">События появятся после согласия на аналитику.</p>}
          {(analytics.recent_events || []).map(item => (
            <div key={item.id} className="activity-row">
              <span className="activity-dot" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{eventLabels[item.event] || item.event}</p>
                <p className="mt-1 truncate text-xs text-white/35">{item.project_title || item.path || '/'} · {formatDate(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
