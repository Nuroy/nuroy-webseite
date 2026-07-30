/**
 * Waves Animation - Vanilla JS Version
 * Animated wave grid with mouse interaction
 */

class WavesAnimation {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId)
    if (!this.container) {
      console.error(`Container #${containerId} not found`)
      return
    }

    // Configuration
    // Canvas kennt keine CSS-Variablen, deshalb den aktuellen
    // Theme-Wert einmalig aus dem Dokument lesen.
    const themeFarbe = (name, fallback) => {
      const v = getComputedStyle(document.body).getPropertyValue(name).trim()
      return v || fallback
    }
    this.config = {
      strokeColor: options.strokeColor || themeFarbe('--pink', '#1B4F91'),
      backgroundColor: options.backgroundColor || themeFarbe('--bg', '#000000'),
      pointerSize: options.pointerSize || 0.5,
    }

    // References
    this.svg = null
    this.paths = []
    this.lines = []
    this.noise = null
    this.bounding = null
    this.raf = null

    // Mouse state
    this.mouse = {
      x: -10,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
      set: false,
    }

    this.init()
  }

  init() {
    // Create SVG
    this.createSVG()

    // Create pointer dot
    this.createPointer()

    // Initialize noise
    this.noise = this.createNoise2D()

    // Setup
    this.setSize()
    this.setLines()

    // Bind events
    this.onResize = this.onResize.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.tick = this.tick.bind(this)

    window.addEventListener('resize', this.onResize)
    window.addEventListener('mousemove', this.onMouseMove)
    this.container.addEventListener('touchmove', this.onTouchMove, { passive: false })

    // Start animation
    this.raf = requestAnimationFrame(this.tick)
  }

  createSVG() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.classList.add('waves-svg')
    this.svg.style.cssText = 'display: block; width: 100%; height: 100%;'
    this.container.appendChild(this.svg)
  }

  createPointer() {
    const pointer = document.createElement('div')
    pointer.classList.add('waves-pointer')
    pointer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${this.config.pointerSize}rem;
      height: ${this.config.pointerSize}rem;
      background: ${this.config.strokeColor};
      border-radius: 50%;
      transform: translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0);
      will-change: transform;
      pointer-events: none;
    `
    this.container.appendChild(pointer)
    this.pointer = pointer
  }

  setSize() {
    this.bounding = this.container.getBoundingClientRect()
    const { width, height } = this.bounding

    this.svg.style.width = `${width}px`
    this.svg.style.height = `${height}px`
  }

  setLines() {
    if (!this.bounding) return

    const { width, height } = this.bounding
    this.lines = []

    // Clear existing paths
    this.paths.forEach(path => path.remove())
    this.paths = []

    // Grid configuration - Responsive Grid: Größere Abstände auf Mobile
    const isMobile = window.innerWidth <= 600
    const xGap = isMobile ? 16 : 8
    const yGap = isMobile ? 16 : 8
    const oWidth = width + 200
    const oHeight = height + 30
    const totalLines = Math.ceil(oWidth / xGap)
    const totalPoints = Math.ceil(oHeight / yGap)
    const xStart = (width - xGap * totalLines) / 2
    const yStart = (height - yGap * totalPoints) / 2

    // Create vertical lines
    for (let i = 0; i < totalLines; i++) {
      const points = []

      for (let j = 0; j < totalPoints; j++) {
        const point = {
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        }
        points.push(point)
      }

      // Create SVG path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', this.config.strokeColor)
      path.setAttribute('stroke-width', '1')

      this.svg.appendChild(path)
      this.paths.push(path)
      this.lines.push(points)
    }
  }

  onResize() {
    this.setSize()
    this.setLines()
  }

  onMouseMove(e) {
    this.updateMousePosition(e.pageX, e.pageY)
  }

  onTouchMove(e) {
    e.preventDefault()
    const touch = e.touches[0]
    this.updateMousePosition(touch.clientX, touch.clientY)
  }

  updateMousePosition(x, y) {
    if (!this.bounding) return

    this.mouse.x = x - this.bounding.left
    this.mouse.y = y - this.bounding.top + window.scrollY

    if (!this.mouse.set) {
      this.mouse.sx = this.mouse.x
      this.mouse.sy = this.mouse.y
      this.mouse.lx = this.mouse.x
      this.mouse.ly = this.mouse.y
      this.mouse.set = true
    }

    this.container.style.setProperty('--x', `${this.mouse.sx}px`)
    this.container.style.setProperty('--y', `${this.mouse.sy}px`)
  }

  movePoints(time) {
    const isMobile = window.innerWidth <= 600
    const timeScale = isMobile ? 0.008 : 0.012  // Schnellere Animation für mehr Effekt
    const amplitudeScale = isMobile ? 0.85 : 1.0  // Etwas reduzierte Bewegung auf Mobile

    this.lines.forEach((points) => {
      points.forEach((p) => {
        // Wave movement
        const move = this.noise(
          (p.x + time * timeScale) * 0.003,
          (p.y + time * 0.003) * 0.002
        ) * 8

        p.wave.x = Math.cos(move) * (12 * amplitudeScale)
        p.wave.y = Math.sin(move) * (6 * amplitudeScale)

        // Mouse effect - nur auf Desktop (Performance)
        const enableMouseEffect = window.innerWidth > 600

        if (enableMouseEffect) {
          const dx = p.x - this.mouse.sx
          const dy = p.y - this.mouse.sy
          const d = Math.hypot(dx, dy)
          const l = Math.max(175, this.mouse.vs)

          if (d < l) {
            const s = 1 - d / l
            const f = Math.cos(d * 0.001) * s

            p.cursor.vx += Math.cos(this.mouse.a) * f * l * this.mouse.vs * 0.00035
            p.cursor.vy += Math.sin(this.mouse.a) * f * l * this.mouse.vs * 0.00035
          }
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.01
        p.cursor.vy += (0 - p.cursor.y) * 0.01

        p.cursor.vx *= 0.95
        p.cursor.vy *= 0.95

        p.cursor.x += p.cursor.vx
        p.cursor.y += p.cursor.vy

        p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x))
        p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y))
      })
    })
  }

  moved(point, withCursorForce = true) {
    return {
      x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
      y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
    }
  }

  drawLines() {
    this.lines.forEach((points, lIndex) => {
      if (points.length < 2 || !this.paths[lIndex]) return

      const firstPoint = this.moved(points[0], false)
      let d = `M ${firstPoint.x} ${firstPoint.y}`

      for (let i = 1; i < points.length; i++) {
        const current = this.moved(points[i])
        d += `L ${current.x} ${current.y}`
      }

      this.paths[lIndex].setAttribute('d', d)
    })
  }

  tick(time) {
    // Smooth mouse movement
    this.mouse.sx += (this.mouse.x - this.mouse.sx) * 0.1
    this.mouse.sy += (this.mouse.y - this.mouse.sy) * 0.1

    // Mouse velocity
    const dx = this.mouse.x - this.mouse.lx
    const dy = this.mouse.y - this.mouse.ly
    const d = Math.hypot(dx, dy)

    this.mouse.v = d
    this.mouse.vs += (d - this.mouse.vs) * 0.1
    this.mouse.vs = Math.min(100, this.mouse.vs)

    this.mouse.lx = this.mouse.x
    this.mouse.ly = this.mouse.y
    this.mouse.a = Math.atan2(dy, dx)

    this.container.style.setProperty('--x', `${this.mouse.sx}px`)
    this.container.style.setProperty('--y', `${this.mouse.sy}px`)

    this.movePoints(time)
    this.drawLines()

    this.raf = requestAnimationFrame(this.tick)
  }

  // Simple 2D noise generator (simplified version)
  createNoise2D() {
    const p = new Uint8Array(256)
    for (let i = 0; i < 256; i++) p[i] = i

    // Shuffle
    for (let i = 255; i > 0; i--) {
      const n = Math.floor((Math.random() * (i + 1)))
      const q = p[i]
      p[i] = p[n]
      p[n] = q
    }

    const perm = new Uint8Array(512)
    const permMod12 = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255]
      permMod12[i] = perm[i] % 12
    }

    const grad3 = new Float32Array([1,1,0, -1,1,0, 1,-1,0, -1,-1,0,
                                     1,0,1, -1,0,1, 1,0,-1, -1,0,-1,
                                     0,1,1, 0,-1,1, 0,1,-1, 0,-1,-1])

    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0)
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0

    return (xin, yin) => {
      let n0, n1, n2
      const s = (xin + yin) * F2
      const i = Math.floor(xin + s)
      const j = Math.floor(yin + s)
      const t = (i + j) * G2
      const X0 = i - t
      const Y0 = j - t
      const x0 = xin - X0
      const y0 = yin - Y0

      let i1, j1
      if (x0 > y0) { i1 = 1; j1 = 0 }
      else { i1 = 0; j1 = 1 }

      const x1 = x0 - i1 + G2
      const y1 = y0 - j1 + G2
      const x2 = x0 - 1.0 + 2.0 * G2
      const y2 = y0 - 1.0 + 2.0 * G2

      const ii = i & 255
      const jj = j & 255
      const gi0 = permMod12[ii + perm[jj]] * 3
      const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3
      const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3

      let t0 = 0.5 - x0 * x0 - y0 * y0
      if (t0 < 0) n0 = 0.0
      else {
        t0 *= t0
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0)
      }

      let t1 = 0.5 - x1 * x1 - y1 * y1
      if (t1 < 0) n1 = 0.0
      else {
        t1 *= t1
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1)
      }

      let t2 = 0.5 - x2 * x2 - y2 * y2
      if (t2 < 0) n2 = 0.0
      else {
        t2 *= t2
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2)
      }

      return 70.0 * (n0 + n1 + n2)
    }
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('mousemove', this.onMouseMove)
    this.container.removeEventListener('touchmove', this.onTouchMove)
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const wavesContainer = document.getElementById('waves-container')
  if (wavesContainer) {
    // Farben ohne Vorgabe: die Klasse zieht sie aus dem aktiven Theme
    new WavesAnimation('waves-container', {
      pointerSize: 0.5
    })
  }
})
