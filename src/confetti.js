// Tiny dependency-free confetti burst on a full-screen canvas.
const COLORS = ['#7c5cff', '#22c3a6', '#ffdd00', '#ff5c8a', '#4cc9f0', '#ff9f1c']

export function confetti({ count = 180, duration = 3800 } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.className = 'confetti'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.append(canvas)
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const resize = () => {
    canvas.width = innerWidth * dpr
    canvas.height = innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  addEventListener('resize', resize)

  const rand = (a, b) => a + Math.random() * (b - a)
  // Two cannons in the bottom corners shooting up and inwards, plus a light rain from the top.
  const particles = Array.from({ length: count }, (_, i) => {
    const kind = i % 3
    const fromLeft = kind === 0
    const rain = kind === 2
    const angle = rain ? rand(80, 100) : fromLeft ? rand(-75, -45) : rand(-135, -105)
    const speed = rain ? rand(1, 3) : rand(11, 19)
    const rad = (angle * Math.PI) / 180
    return {
      x: rain ? rand(0, innerWidth) : fromLeft ? rand(-10, 20) : innerWidth + rand(-20, 10),
      y: rain ? rand(-innerHeight * 0.4, -10) : innerHeight + rand(0, 20),
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed,
      w: rand(6, 11),
      h: rand(8, 15),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.25, 0.25),
      tilt: rand(0, Math.PI * 2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() < 0.25,
    }
  })

  const start = performance.now()
  let frame
  const tick = (now) => {
    const t = now - start
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    ctx.globalAlpha = t > duration - 800 ? Math.max(0, (duration - t) / 800) : 1
    for (const p of particles) {
      p.vx *= 0.985
      p.vy = p.vy * 0.985 + 0.32
      p.x += p.vx + Math.sin(p.tilt) * 0.6
      p.y += p.vy
      p.rot += p.vr
      p.tilt += 0.08
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Scaling the height by cos(tilt) makes the paper look like it flips in the air.
        ctx.fillRect(-p.w / 2, (-p.h / 2) * Math.cos(p.tilt), p.w, p.h * Math.cos(p.tilt))
      }
      ctx.restore()
    }
    if (t < duration) frame = requestAnimationFrame(tick)
    else stop()
  }
  const stop = () => {
    cancelAnimationFrame(frame)
    removeEventListener('resize', resize)
    canvas.remove()
  }
  frame = requestAnimationFrame(tick)
  return stop
}
