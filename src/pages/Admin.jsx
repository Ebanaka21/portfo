import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyticsPanel from '../components/AnalyticsPanel'
import {
  createProject,
  deleteProject,
  getAdminDashboard,
  getInquiries,
  getMe,
  getProjects,
  logout,
  updateInquiry,
  updateProject,
  uploadProjectFiles,
} from '../api/client'

const emptyForm = {
  title: '', slug: '', description: '', category: '', image_url: '', tags: '',
  case_study: '', preview_type: 'template', preview_config: '{}',
  featured: false, sort_order: 0,
}

const inquiryStatusLabels = {
  new: 'Новая',
  in_progress: 'В работе',
  waiting: 'Ждём ответа',
  won: 'Согласовано',
  rejected: 'Отклонена',
  archived: 'Архив',
}

const activityLabels = {
  created_project: 'Создан проект',
  updated_project: 'Обновлён проект',
  deleted_project: 'Удалён проект',
  uploaded_preview: 'Загружен mini-site',
  updated_inquiry: 'Обновлена заявка',
}

function parseTags(value) {
  try {
    const tags = JSON.parse(value || '[]')
    return Array.isArray(tags) ? tags : []
  } catch {
    return []
  }
}

function parsePreviewConfig(value) {
  try {
    const config = JSON.parse(value || '{}')
    return config && typeof config === 'object' ? config : {}
  } catch {
    return {}
  }
}

function uploadPath(file, files) {
  const paths = files.map(item => item.webkitRelativePath || item.name)
  const firstSegment = paths[0]?.split('/')[0]
  const hasCommonFolder = firstSegment && paths.length > 0 && paths.every(value => value.split('/')[0] === firstSegment && value.includes('/'))
  const value = file.webkitRelativePath || file.name
  return hasCommonFolder ? value.split('/').slice(1).join('/') : value
}

function ignoredUploadPath(value) {
  return value.split('/').some(part => {
    const lower = part.toLowerCase()
    return lower === 'node_modules' || lower === '.git' || lower === '.env' || lower.startsWith('.env.')
  })
}

function formatDate(value) {
  if (!value) return 'только что'
  const date = new Date(value.replace(' ', 'T') + (value.includes('Z') ? '' : 'Z'))
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date)
}

export default function Admin() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [inquiries, setInquiries] = useState([])
  const [inquiryQuery, setInquiryQuery] = useState('')
  const [inquiryFilter, setInquiryFilter] = useState('all')
  const [noteDrafts, setNoteDrafts] = useState({})
  const [uploadFiles, setUploadFiles] = useState([])
  const [entryFile, setEntryFile] = useState('')
  const [uploading, setUploading] = useState(false)
  const knownInquiryIds = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const msg = (text, kind = 'success') => {
    setMessage({ text, kind })
    window.setTimeout(() => setMessage(null), 2800)
  }

  const loadProjects = () => {
    getProjects().then(setProjects).catch(() => {})
  }

  const loadDashboard = () => {
    getAdminDashboard().then(setDashboard).catch(() => {})
  }

  const loadInquiries = () => {
    getInquiries().then(nextInquiries => {
      const previousIds = knownInquiryIds.current
      if (previousIds && nextInquiries.some(item => item.status === 'new' && !previousIds.has(item.id))) {
        msg('Новая заявка появилась в inbox')
      }
      knownInquiryIds.current = new Set(nextInquiries.map(item => item.id))
      setInquiries(nextInquiries)
    }).catch(() => {})
  }

  useEffect(() => {
    getMe()
      .then(data => {
        if (data.user.role !== 'admin') {
          navigate('/')
          return
        }
        setUser(data.user)
        loadProjects()
        loadInquiries()
        loadDashboard()
      })
      .catch(() => navigate('/login'))

    const polling = window.setInterval(() => {
      loadInquiries()
      loadDashboard()
    }, 30000)
    return () => window.clearInterval(polling)
  }, [])

  useEffect(() => {
    if (!uploadFiles.length) return

    const filteredFiles = uploadFiles.filter(file => !ignoredUploadPath(uploadPath(file, uploadFiles)))
    if (filteredFiles.length === uploadFiles.length) return

    const entries = filteredFiles
      .map(file => uploadPath(file, filteredFiles))
      .filter(value => value.toLowerCase().endsWith('.html'))
      .sort()
    setUploadFiles(filteredFiles)
    setEntryFile(current => entries.includes(current) ? current : entries.find(value => value.toLowerCase() === 'index.html') || entries[0] || '')
  }, [uploadFiles])

  const handleInquiryUpdate = async (inquiry, status) => {
    try {
      const adminNote = noteDrafts[inquiry.id] ?? inquiry.admin_note ?? ''
      await updateInquiry(inquiry.id, { status, admin_note: adminNote })
      setInquiries(current => current.map(item => item.id === inquiry.id ? { ...item, status, admin_note: adminNote } : item))
      loadDashboard()
      msg('Статус заявки обновлён')
    } catch (err) {
      msg(err.message, 'error')
    }
  }

  const handleInquiryNote = async (inquiry) => {
    try {
      const adminNote = noteDrafts[inquiry.id] ?? inquiry.admin_note ?? ''
      await updateInquiry(inquiry.id, { status: inquiry.status, admin_note: adminNote })
      setInquiries(current => current.map(item => item.id === inquiry.id ? { ...item, admin_note: adminNote } : item))
      msg('Заметка сохранена')
    } catch (err) {
      msg(err.message, 'error')
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    try {
      if (editId) {
        await updateProject(editId, form)
        msg('Проект обновлён')
      } else {
        const created = await createProject(form)
        setEditId(created.id)
        if (uploadFiles.length) {
          await publishUpload(created.id)
        } else {
          msg('Проект создан. Теперь можно опубликовать папку preview')
        }
      }
      loadProjects()
      loadDashboard()
    } catch (err) {
      msg(err.message, 'error')
    }
  }

  const handleEdit = project => {
    setForm({
      title: project.title,
      slug: project.slug || '',
      description: project.description || '',
      category: project.category || '',
      image_url: project.image_url || '',
      tags: project.tags || '[]',
      case_study: project.case_study || '',
      preview_type: project.preview_type || 'template',
      preview_config: project.preview_config || '{}',
      featured: project.featured,
      sort_order: project.sort_order,
    })
    setEditId(project.id)
    setEntryFile(parsePreviewConfig(project.preview_config).entry || '')
    setUploadFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const publishUpload = async projectId => {
    if (!uploadFiles.length) {
      msg('Выбери папку с HTML/CSS/JS', 'error')
      return
    }

    const body = new FormData()
    if (entryFile) body.append('entry', entryFile)
    uploadFiles.forEach(file => body.append('files', file, uploadPath(file, uploadFiles)))
    setUploading(true)
    try {
      const result = await uploadProjectFiles(projectId, body)
      const previewConfig = JSON.stringify({ entry: result.entry })
      setForm(current => ({ ...current, preview_type: 'uploaded', preview_config: previewConfig }))
      setEntryFile(result.entry)
      setUploadFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadProjects()
      loadDashboard()
      msg(`Preview опубликован: ${result.entry}`)
    } catch (err) {
      msg(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = async () => {
    if (!editId) {
      msg('Сначала создай проект — папка прикрепится автоматически', 'error')
      return
    }
    await publishUpload(editId)
  }

  const handleDelete = async id => {
    if (!window.confirm('Удалить проект?')) return
    try {
      await deleteProject(id)
      if (id === editId) {
        setEditId(null)
        setForm(emptyForm)
        setEntryFile('')
      }
      loadProjects()
      loadDashboard()
      msg('Проект удалён')
    } catch (err) {
      msg(err.message, 'error')
    }
  }

  const handleLogout = async () => {
    await logout().catch(() => {})
    navigate('/login')
  }

  const visibleInquiries = inquiries.filter(inquiry => {
    const query = inquiryQuery.trim().toLowerCase()
    const matchesFilter = inquiryFilter === 'all' || inquiry.status === inquiryFilter
    const matchesQuery = !query || [inquiry.name, inquiry.email, inquiry.telegram, inquiry.company, inquiry.brief, inquiry.project_title]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(query))
    return matchesFilter && matchesQuery
  })

  if (!user) return null

  const uploadEntries = uploadFiles.map(file => uploadPath(file, uploadFiles)).filter(value => value.toLowerCase().endsWith('.html')).sort()
  const uploadSummary = {
    html: uploadFiles.filter(file => uploadPath(file, uploadFiles).toLowerCase().endsWith('.html')).length,
    css: uploadFiles.filter(file => uploadPath(file, uploadFiles).toLowerCase().endsWith('.css')).length,
    js: uploadFiles.filter(file => uploadPath(file, uploadFiles).toLowerCase().endsWith('.js')).length,
  }
  const uploadHasPackageJson = uploadFiles.some(file => uploadPath(file, uploadFiles).toLowerCase() === 'package.json')

  const stats = [
    { label: 'Проекты', value: dashboard?.projects ?? projects.length, note: 'в портфолио', icon: '↗' },
    { label: 'Новые заявки', value: dashboard?.new_inquiries ?? inquiries.filter(item => item.status === 'new').length, note: 'ждут ответа', icon: '✦', accent: true },
    { label: 'Mini-sites', value: dashboard?.uploaded_previews ?? projects.filter(item => item.preview_type === 'uploaded').length, note: 'опубликовано', icon: '◌' },
    { label: 'Всего заявок', value: dashboard?.inquiries ?? inquiries.length, note: 'в inbox', icon: '⌁' },
  ]

  return (
    <div className="admin-shell flex-1 px-5 pb-24 pt-28 md:px-8 md:pt-32">
      <div className="mx-auto max-w-[1280px]">
        <header className="admin-hero mb-8 overflow-hidden rounded-[2rem] border border-[#34343d] p-6 md:p-10">
          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Control room / 01</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] md:text-6xl">Собирай портфолио как продукт.</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">Проекты, загруженные mini-sites и заявки в одном рабочем пространстве.</p>
            </div>
            <div className="flex items-center gap-3"><span className="status-dot text-xs text-white/45"><i /> Система online</span><button type="button" onClick={handleLogout} className="btn-outline !px-4 !py-2 !text-xs">Выйти</button></div>
          </div>
          <div className="relative z-10 mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(stat => <div key={stat.label} className={`admin-stat ${stat.accent ? 'admin-stat-accent' : ''}`}><div className="flex items-center justify-between text-xs text-white/40"><span>{stat.label}</span><span>{stat.icon}</span></div><strong>{stat.value}</strong><span>{stat.note}</span></div>)}
          </div>
        </header>

        <AnalyticsPanel analytics={dashboard?.analytics} formatDate={formatDate} />

        {uploadFiles.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-xs text-white/55">
            <span className={`h-2 w-2 rounded-full ${uploadHasPackageJson ? 'bg-[#7453D1]' : 'bg-[#71d49a]'}`} />
            {uploadHasPackageJson ? 'Frontend-проект: после публикации выполнится npm build, наружу попадёт только dist.' : 'Статический mini-site: папка будет опубликована как есть.'}
          </div>
        )}

        {message && <div aria-live="polite" className={`mb-6 rounded-2xl border px-5 py-3 text-sm ${message.kind === 'error' ? 'border-[#ff4444]/30 bg-[#ff4444]/10 text-[#ff8585]' : 'border-[#4caf50]/30 bg-[#4caf50]/10 text-[#7dd681]'}`}>{message.text}</div>}

        {!editId && <div className="upload-zone mb-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow">Mini-site files</p><p className="mt-2 text-sm font-bold">Сразу прикрепить папку проекта</p><p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/40">Выбери папку с сайтом сейчас. После нажатия «Создать проект» она автоматически загрузится. Внутри могут быть любые HTML, CSS, JS, JSON, SVG, fonts и assets.</p></div><span className="badge-tag !bg-white/[0.06] !text-white/55">шаг 1 / 2</span></div><div className="mt-4"><input ref={fileInputRef} type="file" multiple webkitdirectory="" directory="" className="block w-full text-xs text-white/45 file:mr-3 file:rounded-xl file:border-0 file:bg-[#7453D1] file:px-4 file:py-2 file:font-semibold file:text-black" onChange={event => { const nextFiles = Array.from(event.target.files || []); const nextEntries = nextFiles.map(file => uploadPath(file, nextFiles)).filter(value => value.toLowerCase().endsWith('.html')).sort(); setUploadFiles(nextFiles); setEntryFile(nextEntries.find(value => value.toLowerCase() === 'index.html') || nextEntries[0] || '') }} /></div>{uploadFiles.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><label className="admin-field">Главный HTML-файл<select className="input-dark" value={entryFile} onChange={event => setEntryFile(event.target.value)} disabled={uploadEntries.length === 0}><option value="">Выбери HTML-файл</option>{uploadEntries.map(entry => <option key={entry} value={entry}>{entry}</option>)}</select></label><div className="rounded-2xl border border-[#25252d] bg-[#111114] px-4 py-3 text-xs text-white/40"><p><span className="text-white/75">{uploadSummary.html}</span> HTML</p><p><span className="text-white/75">{uploadSummary.css}</span> CSS · <span className="text-white/75">{uploadSummary.js}</span> JS</p><p><span className="text-white/75">{uploadFiles.length - uploadSummary.html - uploadSummary.css - uploadSummary.js}</span> other</p></div></div>} </div>}
        <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
          <form id="project-editor" onSubmit={handleSubmit} className="admin-panel space-y-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="eyebrow">Project builder</p><h2 className="mt-2 text-2xl font-black tracking-tight">{editId ? 'Редактирование проекта' : 'Новый проект'}</h2></div>{editId && <span className="badge-tag">ID сохранён</span>}</div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="admin-field">Название *<input className="input-dark" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required /></label>
              <label className="admin-field">Категория<input className="input-dark" placeholder="Web, 3D, Branding" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} /></label>
              <label className="admin-field">Slug<input className="input-dark" placeholder="my-project" value={form.slug} onChange={event => setForm({ ...form, slug: event.target.value })} /></label>
              <label className="admin-field">Тип preview<select className="input-dark" value={form.preview_type} onChange={event => setForm({ ...form, preview_type: event.target.value })}><option value="template">Встроенный шаблон</option><option value="uploaded">Загруженный mini-site</option><option value="embedded">Embedded URL</option><option value="link">Внешняя ссылка</option></select></label>
            </div>

            <label className="admin-field">Короткое описание<textarea className="input-dark" rows="3" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
            <label className="admin-field">Case study<textarea className="input-dark" rows="5" placeholder="Задача, решение, результат и особенности проекта" value={form.case_study} onChange={event => setForm({ ...form, case_study: event.target.value })} /></label>
            <div className="grid gap-4 md:grid-cols-2"><label className="admin-field">URL обложки<input className="input-dark" placeholder="/static/img/projects/..." value={form.image_url} onChange={event => setForm({ ...form, image_url: event.target.value })} /></label><label className="admin-field">Теги JSON<input className="input-dark" placeholder='["UI","Figma"]' value={form.tags} onChange={event => setForm({ ...form, tags: event.target.value })} /></label></div>

            {editId && <div className="upload-zone"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-bold">Загрузить папку mini-site</p><p className="mt-1 text-xs leading-relaxed text-white/40">Все HTML, CSS, JS, JSON, SVG, шрифты и assets сохранятся с исходной структурой. По умолчанию главным будет index.html.</p></div><span className="badge-tag !bg-white/[0.06] !text-white/55">{form.preview_type === 'uploaded' ? 'published' : 'not published'}</span></div><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><input ref={fileInputRef} type="file" multiple webkitdirectory="" directory="" className="block w-full text-xs text-white/45 file:mr-3 file:rounded-xl file:border-0 file:bg-[#7453D1] file:px-4 file:py-2 file:font-semibold file:text-black" onChange={event => { const nextFiles = Array.from(event.target.files || []); const nextEntries = nextFiles.map(file => uploadPath(file, nextFiles)).filter(value => value.toLowerCase().endsWith('.html')).sort(); setUploadFiles(nextFiles); setEntryFile(nextEntries.find(value => value.toLowerCase() === 'index.html') || nextEntries[0] || '') }} /><button type="button" disabled={uploading || uploadFiles.length === 0 || !entryFile} onClick={handleUpload} className="btn-primary shrink-0 !px-4 !py-2.5 !text-xs disabled:cursor-not-allowed disabled:opacity-40">{uploading ? 'Загружаем…' : 'Опубликовать'}</button></div>{uploadFiles.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><label className="admin-field">Главный HTML-файл<select className="input-dark" value={entryFile} onChange={event => setEntryFile(event.target.value)} disabled={uploadEntries.length === 0}><option value="">Выбери HTML-файл</option>{uploadEntries.map(entry => <option key={entry} value={entry}>{entry}</option>)}</select></label><div className="rounded-2xl border border-[#25252d] bg-[#111114] px-4 py-3 text-xs text-white/40"><p><span className="text-white/75">{uploadSummary.html}</span> HTML</p><p><span className="text-white/75">{uploadSummary.css}</span> CSS · <span className="text-white/75">{uploadSummary.js}</span> JS</p><p><span className="text-white/75">{uploadFiles.length - uploadSummary.html - uploadSummary.css - uploadSummary.js}</span> other</p></div></div>}{form.preview_type === 'uploaded' && <a className="mt-3 inline-flex text-xs text-[#8d76e8] hover:underline" href={`/preview/projects/${editId}/${parsePreviewConfig(form.preview_config).entry || 'index.html'}`} target="_blank" rel="noreferrer">Открыть опубликованный preview ↗</a>}</div>}

            <div className="flex flex-wrap items-center gap-5 border-t border-[#25252d] pt-5"><label className="flex cursor-pointer items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={form.featured} onChange={event => setForm({ ...form, featured: event.target.checked })} className="h-5 w-5 rounded-md accent-[#7453D1]" /> Избранное</label><label className="flex items-center gap-2 text-sm text-white/40">Порядок<input type="number" className="input-dark !w-20 !py-2" value={form.sort_order} onChange={event => setForm({ ...form, sort_order: parseInt(event.target.value, 10) || 0 })} /></label><div className="ml-auto flex gap-3">{editId && <button type="button" className="btn-outline !px-4 !py-2.5 !text-xs" onClick={() => { setForm(emptyForm); setEditId(null); setUploadFiles([]); setEntryFile('') }}>Сбросить</button>}<button type="submit" className="btn-primary !px-5 !py-2.5 !text-xs">{editId ? 'Сохранить изменения' : 'Создать проект'}</button></div></div>
          </form>

          <aside className="admin-panel flex flex-col"><div><p className="eyebrow">Activity feed</p><h2 className="mt-2 text-2xl font-black tracking-tight">Что происходило</h2></div><div className="mt-6 flex-1 space-y-1">{(dashboard?.activity || []).length === 0 && <p className="rounded-2xl border border-dashed border-[#34343d] p-5 text-sm text-white/35">Здесь появятся действия команды и загрузки.</p>}{(dashboard?.activity || []).map(item => <div key={item.id} className="activity-row"><span className="activity-dot" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{activityLabels[item.action] || item.action}</p><p className="mt-1 truncate text-xs text-white/35">{item.user_name || 'system'} · {formatDate(item.created_at)}</p></div></div>)}</div><div className="mt-6 rounded-2xl border border-[#25252d] bg-[#111114] p-4 text-xs leading-relaxed text-white/40">Логи запросов пишутся в <code className="text-white/65">backend/logs/app.log</code>.</div></aside>
        </div>

        <section className="mb-12"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Portfolio index</p><h2 className="mt-2 text-3xl font-black tracking-tight">Проекты</h2></div><button type="button" className="btn-outline !px-4 !py-2.5 !text-xs" onClick={() => { setForm(emptyForm); setEditId(null); setUploadFiles([]); setEntryFile(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>+ Новый проект</button></div>{projects.length === 0 ? <div className="empty-state">Проектов пока нет. Создай первый выше.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map(project => { const previewConfig = parsePreviewConfig(project.preview_config); return <article key={project.id} className="admin-project-card"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-lg font-bold">{project.title}</p><p className="mt-1 truncate text-xs text-white/35">/{project.slug || project.id}</p></div><span className={`status-badge ${project.preview_type === 'uploaded' ? 'status-won' : 'status-archived'}`}>{project.preview_type === 'uploaded' ? 'live' : project.preview_type}</span></div><p className="mt-5 line-clamp-2 min-h-10 text-sm leading-relaxed text-white/45">{project.description || 'Без описания'}</p><div className="mt-5 flex flex-wrap gap-2">{parseTags(project.tags).slice(0, 3).map(tag => <span key={tag} className="badge-tag !px-2.5 !py-1 !text-[10px]">{tag}</span>)}</div><div className="mt-6 flex items-center justify-between border-t border-[#25252d] pt-4"><div className="flex gap-1"><button type="button" className="btn-ghost !px-2 !py-1.5 !text-xs" onClick={() => handleEdit(project)}>Редактировать</button><button type="button" className="btn-ghost !px-2 !py-1.5 !text-xs !text-[#ff8585]" onClick={() => handleDelete(project.id)}>Удалить</button></div>{project.preview_type === 'uploaded' && <a href={`/preview/projects/${project.id}/${previewConfig.entry || 'index.html'}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#8d76e8] hover:underline">Открыть ↗</a>}</div></article> })}</div>}</section>

        <section id="inbox" className="border-t border-[#25252d] pt-10"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Incoming / inbox</p><h2 className="mt-2 text-3xl font-black tracking-tight">Заявки на проекты</h2></div><span className="badge-tag">{inquiries.filter(item => item.status === 'new').length} новых</span></div><div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]"><input className="input-dark" value={inquiryQuery} onChange={event => setInquiryQuery(event.target.value)} placeholder="Поиск по имени, email, Telegram или ТЗ" /><select className="input-dark md:!w-52" value={inquiryFilter} onChange={event => setInquiryFilter(event.target.value)}><option value="all">Все статусы</option>{Object.entries(inquiryStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="space-y-4">{inquiries.length === 0 && <div className="empty-state">Заявок пока нет.</div>}{inquiries.length > 0 && visibleInquiries.length === 0 && <div className="empty-state">По фильтру ничего не найдено.</div>}{visibleInquiries.map(inquiry => <article key={inquiry.id} className="admin-inquiry-card"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-bold">{inquiry.name}</h3><span className={`status-badge status-${inquiry.status}`}>{inquiryStatusLabels[inquiry.status] || inquiry.status}</span></div><p className="mt-1 text-sm text-white/40">{inquiry.email}{inquiry.telegram ? ` · ${inquiry.telegram}` : ''}</p>{inquiry.project_title && <p className="mt-2 text-xs text-[#8d76e8]">Проект: {inquiry.project_title}</p>}</div><select className="input-dark !w-auto !py-2 text-xs" value={inquiry.status} onChange={event => handleInquiryUpdate(inquiry, event.target.value)}>{Object.entries(inquiryStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-white/65">{inquiry.brief}</p><div className="mt-5 flex flex-col gap-3 border-t border-[#25252d] pt-4 sm:flex-row sm:items-end"><label className="admin-field flex-1">Внутренняя заметка<textarea className="input-dark mt-2 !py-3 text-sm" rows="2" value={noteDrafts[inquiry.id] ?? inquiry.admin_note ?? ''} onChange={event => setNoteDrafts(current => ({ ...current, [inquiry.id]: event.target.value }))} placeholder="Следующий шаг, договорённости, комментарий" /></label><button type="button" onClick={() => handleInquiryNote(inquiry)} className="btn-outline shrink-0 !px-4 !py-3 !text-xs">Сохранить заметку</button></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#25252d] pt-4 text-xs text-white/35">{inquiry.service && <span>{inquiry.service}</span>}{inquiry.budget && <span>Бюджет: {inquiry.budget}</span>}{inquiry.deadline && <span>Сроки: {inquiry.deadline}</span>}{inquiry.reference_url && <a href={inquiry.reference_url} target="_blank" rel="noreferrer" className="text-[#8d76e8] hover:underline">Референсы ↗</a>}</div></article>)}</div></section>
      </div>
    </div>
  )
}
