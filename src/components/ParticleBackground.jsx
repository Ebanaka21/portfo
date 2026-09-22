import { useEffect, useRef } from 'react'

const PURPLE = '116, 83, 209'

function ribbonPoint(t, width, height, lane, time) {
  const laneBase = 0.25 + lane * 0.17
  const wave = Math.sin(t * Math.PI * 2.35 + lane * 1.25 + time) * height * 0.14
  const detail = Math.sin(t * Math.PI * 6.5 + lane * 2 + time * 0.7) * height * 0.035
  return {
    x: width * (0.02 + t * 0.96),
    y: height * laneBase + wave + detail,
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 640px)').matches
    const particleCount = mobile ? 230 : 900
    const particles = Array.from({ length: particleCount }, (_, index) => ({
      progress: Math.random(),
      lane: Math.floor(Math.random() * 4),
      offset: (Math.random() - 0.5) * (mobile ? 28 : 78),
      speed: 0.000018 + Math.random() * 0.000035,
      radius: Math.random() * (mobile ? 1.1 : 1.8) + 0.35,
      alpha: Math.random() * 0.55 + 0.12,
      phase: index * 0.37,
    }))
    let width = 0
    let height = 0
    let pixelRatio = 1
    let frame = 0

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'lighter'
      particles.forEach(particle => {
        if (!reducedMotion) particle.progress += particle.speed * 16
        if (particle.progress > 1) particle.progress -= 1

        const point = ribbonPoint(particle.progress, width, height, particle.lane, time * 0.00045 + particle.phase)
        const nextPoint = ribbonPoint(Math.min(particle.progress + 0.008, 1), width, height, particle.lane, time * 0.00045 + particle.phase)
        const normalX = -(nextPoint.y - point.y)
        const normalY = nextPoint.x - point.x
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY) || 1
        const x = point.x + (normalX / normalLength) * particle.offset
        const y = point.y + (normalY / normalLength) * particle.offset
        const fade = Math.min(1, particle.progress * 8, (1 - particle.progress) * 8)

        context.beginPath()
        context.arc(x, y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = particle.phase % 1 > 0.9
          ? `rgba(255, 255, 255, ${particle.alpha * fade})`
          : `rgba(${PURPLE}, ${particle.alpha * fade})`
        context.fill()
      })
      context.globalCompositeOperation = 'source-over'

      if (!reducedMotion) frame = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="particle-canvas" />
}
