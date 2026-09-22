import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer mt-auto border-t border-[#25252d] bg-[#0c0c0e]">
      <div className="max-w-[1400px] mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <span>© {new Date().getFullYear()}</span>
          <Link to="/" aria-label="Karol" className="flex items-center text-white/60 hover:text-[#7453D1] transition-colors">
            <img src="/icons.svg" alt="Karol" className="h-7 w-7 object-contain" />
          </Link>
          <span>— Веб-дизайн</span>
        </div>
          {/*
          <div className="flex items-center gap-6 text-sm text-white/40">
          <a href="mailto:hello@karol.design" className="hover:text-white transition-colors">hello@karol.design</a>
          <a href="https://t.me/karol" target="_blank" className="hover:text-white transition-colors">Telegram</a>
          <a href="https://behance.net/karol" target="_blank" className="hover:text-white transition-colors">Behance</a>
          <button type="button" onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))} className="hover:text-white transition-colors">Cookies</button>
        </div>
          */}
      </div>
    </footer>
  )
}
