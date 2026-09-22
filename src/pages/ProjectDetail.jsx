import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import InteractivePreview from '../components/InteractivePreview'
import InquiryModal from '../components/InquiryModal'
import UploadedPreview from '../components/UploadedPreview'
import { getProject } from '../api/client'
import { trackEvent } from '../analytics'

function parseTags(value) {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inquiryOpen, setInquiryOpen] = useState(false)

  useEffect(() => {
    getProject(id)
      .then(nextProject => {
        setProject(nextProject)
        trackEvent('project_view', { projectId: nextProject.id })
      })
      .catch(() => setError('Не удалось загрузить проект'))
      .finally(() => setLoading(false))
  }, [id])

  const tags = parseTags(project?.tags)
  const caseStudy = project?.case_study?.trim()

  if (loading) {
    return <div className="flex-1 px-8 pb-24 pt-32 text-center text-white/40">Загружаем проект...</div>
  }

  if (error || !project) {
    return (
      <div className="flex-1 px-8 pb-24 pt-32 text-center">
        <p className="mb-6 text-white/40">{error || 'Проект не найден'}</p>
        <Link to="/" className="btn-primary">Вернуться к работам</Link>
      </div>
    )
  }

  return (
    <div className="flex-1 px-5 pb-24 pt-28 md:px-8 md:pt-32">
      <div className="mx-auto max-w-[1200px]">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-[#7453D1]">
          <span>←</span> Все работы
        </Link>

        <header className="mb-12 max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="badge-tag">{project.category || 'Project'}</span>
            {project.featured && <span className="text-xs font-semibold uppercase tracking-wider text-[#7453D1]">★ Featured</span>}
          </div>
          <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-8xl">{project.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/50">{project.description || 'Интерактивный digital-проект с вниманием к деталям.'}</p>
        </header>

        {project.preview_type === 'uploaded' ? <UploadedPreview project={project} /> : <InteractivePreview project={project} />}

        <div className="mt-16 grid gap-12 border-t border-[#25252d] pt-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7453D1]">About the project</p>
            <p className="mt-3 text-sm text-white/35">Case study / {project.category || 'Digital product'}</p>
          </div>
          <div>
            <p className="max-w-2xl text-xl leading-relaxed text-white/75">
              {caseStudy || 'Здесь будет полноценный разбор задачи, решения и визуальной системы проекта. Пока этот экран уже работает как отдельный интерактивный кейс.'}
            </p>
            {tags.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map(tag => <span key={tag} className="badge-tag">{tag}</span>)}
              </div>
            )}
          </div>
        </div>

        <section className="mt-20 rounded-[2rem] border border-[#34343d] bg-[#16161a] p-8 md:flex md:items-center md:justify-between md:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7453D1]">Next step</p>
            <h2 className="mt-3 max-w-lg text-3xl font-black tracking-tight md:text-5xl">Хочешь проект с таким же характером?</h2>
          </div>
          <button type="button" onClick={() => { trackEvent('inquiry_open', { projectId: project.id }); setInquiryOpen(true) }} className="btn-primary mt-7 shrink-0 md:mt-0">
            Обсудить проект <span>↗</span>
          </button>
        </section>
      </div>
      {inquiryOpen && <InquiryModal project={project} onClose={() => setInquiryOpen(false)} />}
    </div>
  )
}
