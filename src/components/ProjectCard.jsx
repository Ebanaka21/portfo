import { Link } from 'react-router-dom'

export default function ProjectCard({ project, index = 0 }) {
  const tags = (() => {
    try { return JSON.parse(project.tags) }
    catch { return [] }
  })()

  return (
    <Link to={`/projects/${project.id}`} className="block h-full">
      <article
        className="raycast-work-card group cursor-pointer overflow-hidden"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
      <div className="raycast-work-preview relative flex aspect-[4/3] flex-col overflow-hidden bg-[#111114]">
        <div className="raycast-browserbar">
          <span className="raycast-browser-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="raycast-browser-url">preview / {project.title}</span>
        </div>
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="min-h-0 w-full flex-1 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-white/20">
            Изображение
          </div>
        )}
        {project.featured && (
          <span className="raycast-featured absolute top-3 left-3">
            ★ Избранное
          </span>
        )}
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em]">
            {project.category}
          </span>
          <span className="raycast-open-mark" aria-hidden="true">↗</span>
        </div>

        <h3 className="text-xl font-medium tracking-[-0.03em] group-hover:text-[#a995f2] transition-colors">
          {project.title}
        </h3>

        {project.description && (
          <p className="text-sm text-white/55 leading-relaxed line-clamp-2">
            {project.description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag, i) => (
              <span key={i} className="raycast-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      </article>
    </Link>
  )
}
