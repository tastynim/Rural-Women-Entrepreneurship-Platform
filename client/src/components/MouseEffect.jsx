import { useEffect, useRef } from 'react'

export default function MouseEffect() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = [
      'rgba(16,185,129,',
      'rgba(5,150,105,',
      'rgba(20,184,166,',
      'rgba(52,211,153,',
      'rgba(110,231,183,',
    ]

    const addParticles = (x, y) => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -(Math.random() * 1.8 + 0.4),
          r: Math.random() * 3.5 + 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 1,
          decay: 0.016 + Math.random() * 0.014,
        })
      }
    }

    const onMove = (e) => addParticles(e.clientX, e.clientY)
    window.addEventListener('mousemove', onMove)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles = particles.filter(p => p.life > 0)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy *= 0.97
        p.life -= p.decay
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
        ctx.fillStyle = p.color + p.life.toFixed(2) + ')'
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
    />
  )
}
