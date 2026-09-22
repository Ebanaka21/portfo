import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import ParticleBackground from '../components/ParticleBackground'
import { getProjects } from '../api/client'
import { trackEvent } from '../analytics'

const disciplines = ['Web design', 'Brand identity', 'Coding...']

export default function Home() {
  const [projects, setProjects] = useState([])
  const [activeCategory, setActiveCategory] = useState('Все')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError('Увы но сервер не отдает работы. Уже работаем над этим'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => [
    'Все',
    ...new Set(projects.map(project => project.category).filter(Boolean)),
  ], [projects])

  const visibleProjects = useMemo(() => {
    if (activeCategory === 'Все') return projects
    return projects.filter(project => project.category === activeCategory)
  }, [activeCategory, projects])

  const featuredProject = projects.find(project => project.featured) || projects[0]

  return (
    <>
      <section className="hero-section relative min-h-[620px] overflow-hidden px-5 pb-20 pt-28 md:min-h-[720px] md:px-8 md:pb-32 md:pt-40">
        <ParticleBackground />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-[1400px]">
          <div className="max-w-[900px] slide-up">
            <div className="mb-7 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              <span className="status-dot">{/*<i />  */} Available for select projects</span>
              <span className="hidden text-white/20 sm:inline">/</span>
              <span>Zar, digital design team</span>
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.07em] sm:text-7xl lg:text-[7.3rem]">
              Делаем цифровые<br />
              <span className="text-[#7453D1]">продукты</span>, в которые<br />
              хочется вернуться.
            </h1>
            <div className="mt-9 flex flex-col gap-7 sm:flex-row sm:items-end">
              <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
                Веб-дизайн, код и айдентика для брендов, которым важно не просто выглядеть красиво, а работать на результат.
              </p>
            <a href="#works" onClick={() => trackEvent('cta_click', { metadata: { label: 'view_work' } })} className="btn-primary shrink-0 !px-6 !py-3.5 text-white ">Смотреть работу <span>↓</span></a>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-20 flex max-w-[1400px] flex-wrap gap-2 border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
          {disciplines.map((discipline, index) => (
            <span key={discipline} className="mr-5 flex items-center gap-3">
              <span className="text-[#7453D1]">0{index + 1}</span>{discipline}
            </span>
          ))}
        </div>
      </section>

      <section id="works" className="raycast-section scroll-mt-24 px-5 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="raycast-section-heading mb-8 flex flex-col justify-between gap-6 border-b border-white/[0.09] pb-8 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Selected work / 2022—26</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-6xl">Работы, которые<br className="hidden sm:block" /> можно попробовать.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/40">Открывай проект, исследуй интерактивный preview и смотри, как идея превращается в продукт.</p>
          </div>

          <div className="raycast-filterbar mb-6 flex gap-1 overflow-x-auto p-1">
            {categories.map(category => (
              <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`category-pill ${activeCategory === category ? 'category-pill-active' : ''}`}>
                {category}
              </button>
            ))}
          </div>

          {loading && <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(item => <div key={item} className="skeleton-card" />)}</div>}
          {!loading && error && <div className="empty-state"><span>!</span><p>{error}</p></div>}
          {!loading && !error && visibleProjects.length === 0 && <div className="empty-state"><span>—</span><p>Проекты скоро появятся</p></div>}
          {!loading && !error && visibleProjects.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project, index) => (
                <div key={project.id} className={`slide-up ${index === 0 ? 'lg:col-span-2' : ''}`} style={{ animationDelay: `${index * 0.08}s` }}>
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="px-5 pb-24 md:px-8 md:pb-32">
        <div className="raycast-process mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.6fr)]">
          <div>
              <p className="eyebrow">How we work</p>
            <h2 className="mt-4 max-w-md text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">Спокойный процесс.<br /><span className="text-[#7453D1]">Сильный результат.</span></h2>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {[
              ['01', 'Слушаем', 'Разбираемся в задаче, людях и контексте продукта.'],
              ['02', 'Собираем', 'Строим систему, в которой визуал работает на смысл.'],
              ['03', 'Запускаем', 'Доводим до живого интерфейса, который хочется открыть.'],
            ].map(([number, title, text]) => (
              <div key={number} className="raycast-step border-t border-white/10 pt-4">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-[#a995f2]">{number}</span>
                <h3 className="mt-7 text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="studio-section px-5 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">What we bring</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-6xl">Не просто экраны.<br />Цельный <span className="text-[#a995f2]">опыт продукта.</span></h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/45">От первого сценария до готового интерфейса: всё работает как единая система и остаётся понятным для команды.</p>
          </div>
          <div className="studio-grid grid border-t border-white/10 md:grid-cols-3">
            {[
              ['01', 'Направление', 'Находим идею, тон и визуальный язык, которые отличают продукт, а не просто делают его модным.'],
              ['02', 'Система', 'Собираем понятные правила и компоненты, чтобы каждый следующий экран был сильнее предыдущего.'],
              ['03', 'Детали', 'Добавляем те самые микро-решения, которые делают интерфейс спокойным, быстрым и запоминающимся.'],
            ].map(([number, title, text]) => (
              <article key={number} className="studio-card">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="outcome-section px-5 pb-24 md:px-8 md:pb-32">
        <div className="outcome-shell mx-auto max-w-[1440px]">
          <div className="outcome-intro">
            <p className="eyebrow">What remains</p>
            <h2>После запуска<br /><span>становится проще.</span></h2>
          </div>
          <div className="outcome-list">
            {[
              ['Яснее', 'Пользователь сразу понимает, что происходит и куда двигаться дальше.'],
              ['Быстрее', 'Команда получает систему, с которой удобно развивать продукт.'],
              ['Своё', 'У бренда появляется характер, который не спутать с шаблоном.'],
            ].map(([title, text], index) => (
              <div key={title} className="outcome-item">
                <span>0{index + 1}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-32 pt-24 px-5 pb-28 md:px-8 md:pb-36">
        <div className="raycast-contact mx-auto flex max-w-[1440px] flex-col gap-10 px-7 py-12 md:flex-row md:items-end md:justify-between md:px-12 md:py-16">
          <div>
            <p className="eyebrow">Have a good one?</p>
            <h2 className="mt-3 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.06em] md:text-8xl">Давайте сделаем<br /><span className="text-[#7453D1]">что-то живое.</span></h2>
          </div>
          {featuredProject ? (
            <Link to={`/projects/${featuredProject.id}`} className="btn-primary shrink-0 !px-7 !py-4">Обсудить проект <span>↗</span></Link>
          ) : (
            <a href="mailto:hello@karol.design" className="btn-primary shrink-0 !px-7 !py-4">Написать нам <span>↗</span></a>
          )}
        </div>
      </section>
    </>
  )
}
