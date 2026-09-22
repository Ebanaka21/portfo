import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../analytics'

function getEntry(previewConfig) {
  if (!previewConfig) return 'index.html'

  try {
    const parsed = JSON.parse(previewConfig)
    if (typeof parsed?.entry === 'string' && parsed.entry.trim()) {
      return parsed.entry.trim()
    }
  } catch {
    // Старые проекты могли хранить конфигурацию в другом формате.
  }

  return 'index.html'
}

function previewPath(project) {
  return getEntry(project.preview_config)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" className="h-[18px] w-[18px] shrink-0">
      <path d="M7 3H3v4M13 3h4v4M17 13v4h-4M3 13v4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" className="h-[18px] w-[18px] shrink-0">
      <path d="M11 3h6v6M17 3l-8 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 11v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" className="h-[18px] w-[18px] shrink-0">
      <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  )
}

function PreviewAction({ label, children, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/[0.12] bg-white/[0.045] px-4 text-[11px] font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/[0.1] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7453d1]/70 focus:ring-offset-2 focus:ring-offset-[#0b0b0e] ${className}`}
    >
      {children}
    </button>
  )
}

function PreviewFrame({ project, entry, className }) {
  const url = `/preview/projects/${project.id}/${entry}`

  return (
    <iframe
      title={`Предпросмотр проекта ${project.title}`}
      src={url}
      className={className}
      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads"
    />
  )
}

export default function UploadedPreview({ project }) {
  const [immersive, setImmersive] = useState(false)
  const [immersiveVisible, setImmersiveVisible] = useState(false)
  const closeTimer = useRef(null)
  const entry = previewPath(project)

  const openImmersive = () => {
    trackEvent('preview_expand', { projectId: project.id })
    window.clearTimeout(closeTimer.current)
    setImmersive(true)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setImmersiveVisible(true))
    })
  }

  const closeImmersive = () => {
    window.clearTimeout(closeTimer.current)
    setImmersiveVisible(false)
    closeTimer.current = window.setTimeout(() => setImmersive(false), 280)
  }

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current)
  }, [])

  useEffect(() => {
    if (!immersive) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeImmersive()
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [immersive])

  const url = `/preview/projects/${project.id}/${entry}`

  return (
    <>
      <section className="overflow-hidden rounded-[1.5rem] border border-white/[0.13] bg-[#070709] shadow-[0_30px_100px_rgba(0,0,0,0.24)] md:rounded-[1.85rem]">
        <div className="flex flex-col items-stretch gap-3 border-b border-white/[0.1] bg-[#0b0b0e] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 md:px-7 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#7453d1] shadow-[0_0_16px_rgba(116,83,209,0.9)]" />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-white/58 sm:text-[11px]">
                  Live preview
                </p>
                <span className="hidden h-1 w-1 shrink-0 rounded-full bg-white/25 sm:block" />
                <p className="hidden truncate text-[11px] text-white/35 sm:block">/{entry}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center gap-1 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-1 sm:w-auto">
            <PreviewAction label="Развернуть preview" onClick={openImmersive} className="min-w-0 flex-1 border-[#7453d1]/60 bg-[#7453d1] px-4 text-white hover:border-[#8d76e8] hover:bg-[#8d76e8] sm:flex-none">
              <span>Развернуть</span>
              <ExpandIcon />
            </PreviewAction>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('preview_external', { projectId: project.id })}
              aria-label="Открыть проект отдельно"
              title="Открыть проект отдельно"
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-[11px] font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7453d1]/70 sm:flex-none"
            >
              <span>Открыть отдельно</span>
              <ExternalIcon />
            </a>
          </div>
        </div>

        {!immersive && (
          <PreviewFrame
            project={project}
            entry={entry}
            className="block h-[min(82svh,900px)] min-h-[560px] w-full border-0 bg-black md:h-[min(82vh,900px)] md:min-h-[680px]"
          />
        )}
      </section>

      {immersive && (
        <div className={`fixed inset-0 z-[999] flex flex-col bg-[#070709] p-2 transition-opacity duration-300 sm:p-4 md:p-5 ${immersiveVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`} role="dialog" aria-modal="true" aria-label={`Предпросмотр проекта ${project.title}`}>
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-[1.1rem] border border-white/[0.12] bg-[#111115] px-3 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={closeImmersive}
                className="rounded-full border border-white/[0.14] px-3.5 py-2 text-xs font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7453d1]/70"
              >
                <span className="sm:hidden">← Назад</span>
                <span className="hidden sm:inline">← К проекту</span>
              </button>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
                  Live project
                </p>
                <p className="truncate text-sm font-medium text-white/90">{project.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-white/35 lg:block">/{entry}</span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('preview_external', { projectId: project.id })}
                aria-label="Открыть проект отдельно"
                title="Открыть проект отдельно"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-3 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
              >
                <span className="hidden sm:inline">Открыть отдельно</span>
                <ExternalIcon />
              </a>
              <button
                type="button"
                onClick={closeImmersive}
                aria-label="Закрыть полноэкранный предпросмотр"
                title="Закрыть preview"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-3 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7453d1]/70"
              >
                <span className="hidden sm:inline">Закрыть</span>
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className={`mt-2 min-h-0 flex-1 overflow-hidden rounded-[1.25rem] border border-white/[0.14] bg-black transition-transform duration-500 ease-out sm:mt-4 sm:rounded-[1.5rem] ${immersiveVisible ? 'translate-y-0 scale-100' : 'translate-y-5 scale-[0.97]'}`}>
            <PreviewFrame project={project} entry={entry} className="h-full min-h-0 w-full border-0 bg-black" />
          </div>
        </div>
      )}
    </>
  )
}
