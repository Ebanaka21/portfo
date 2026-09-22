import { useState } from 'react'

const demoItems = [
  { name: 'Signal / 01', type: 'Digital identity', accent: '#7453D1' },
  { name: 'Form / 02', type: 'Web experience', accent: '#b7a4ff' },
  { name: 'Object / 03', type: '3D direction', accent: '#8ee6c4' },
]

export default function InteractivePreview({ project }) {
  const [activeTab, setActiveTab] = useState('work')
  const [selectedItem, setSelectedItem] = useState(null)

  return (
    <section className="rounded-[2rem] border border-[#30303a] bg-[#111114] p-3 shadow-2xl shadow-black/30 md:p-5">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#f3f1ea] text-[#131316]">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#69d58d]" />
          </div>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-black/35 sm:block">
            interactive preview
          </span>
          <span className="text-xs text-black/40">{project.category || 'digital studio'}</span>
        </div>

        <div className="flex flex-col gap-8 p-6 md:p-10 lg:flex-row lg:gap-14">
          <div className="flex-1">
            <div className="mb-12 flex items-center justify-between gap-4">
              <span className="text-lg font-black tracking-tight">studio<span className="text-[#d6a900]">/</span>01</span>
              <nav className="flex gap-1 rounded-full bg-black/[0.06] p-1 text-xs font-semibold">
                {[
                  ['work', 'Work'],
                  ['about', 'About'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActiveTab(value)}
                    className={`rounded-full px-3 py-1.5 transition-colors ${activeTab === value ? 'bg-[#131316] text-white' : 'text-black/45 hover:text-black'}`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {activeTab === 'work' ? (
              <>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-black/40">Selected direction</p>
                <h3 className="max-w-xl text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
                  Make it simple.<br />Make it <span className="text-[#d6a900]">matter.</span>
                </h3>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-black/55">
                  A small interactive space to show how a real product could feel, move and respond.
                </p>
              </>
            ) : (
              <>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-black/40">About the studio</p>
                <h3 className="max-w-xl text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
                  Digital work<br />with a <span className="text-[#d6a900]">pulse.</span>
                </h3>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-black/55">
                  Strategy, interface and visual direction for products people want to return to.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={() => setSelectedItem(selectedItem ? null : demoItems[0])}
              className="mt-8 rounded-full bg-[#131316] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {selectedItem ? 'Close selected work' : 'Explore selected work'}
            </button>
          </div>

          <div className="flex-1 lg:max-w-[440px]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {demoItems.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`group rounded-2xl p-4 text-left transition-all hover:-translate-y-1 ${selectedItem?.name === item.name ? 'ring-2 ring-black/50' : ''}`}
                  style={{ backgroundColor: item.accent }}
                >
                  <div className="mb-12 flex items-start justify-between text-xs font-bold">
                    <span>0{index + 1}</span>
                    <span className="transition-transform group-hover:rotate-45">↗</span>
                  </div>
                  <strong className="block text-sm tracking-tight">{item.name}</strong>
                  <span className="mt-1 block text-[11px] text-black/55">{item.type}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/[0.06] px-4 py-3 text-xs text-black/50">
              <span>{selectedItem ? `${selectedItem.name} selected` : 'Try the interactions'}</span>
              <span className="font-bold text-black">{project.title}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
