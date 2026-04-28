import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Zap, Target, Shield, Database, Brain, Rocket,
  ArrowRight, ChevronRight, BarChart3, MessageSquare,
  Store, Palette, Wrench, FileSearch, TrendingUp,
  AlertCircle, HelpCircle, Clock, Copy,
} from 'lucide-react'

// ─── Easing ───────────────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}
const slide = (delay = 0) => ({
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease, delay } },
})

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL PARTICLE BACKGROUND — fixed, covers all sections
// ═══════════════════════════════════════════════════════════════════════════
function GlobalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY } }
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    const COUNT = 90
    type P = { x: number; y: number; vx: number; vy: number; r: number }
    const pts: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      // fixed base speed — never changes, so density stays constant forever
      vx: (Math.random() - 0.5) * 0.45 || 0.1,
      vy: (Math.random() - 0.5) * 0.45 || 0.1,
      r: Math.random() * 1.8 + 0.5,
    }))

    const LINK = 150
    const MR = 200 // mouse radius

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouse.current.x
      const my = mouse.current.y

      // Particle ↔ particle lines
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.hypot(dx, dy)
          if (d < LINK) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / LINK) * 0.22})`
            ctx.lineWidth = 0.7
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }

      // Mouse → particle beams (purely visual, does NOT modify particle velocity)
      pts.forEach((p) => {
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.hypot(dx, dy)
        if (d < MR) {
          const t = 1 - d / MR
          ctx.beginPath()
          const grad = ctx.createLinearGradient(mx, my, p.x, p.y)
          grad.addColorStop(0, `rgba(139,92,246,${t * 0.75})`)
          grad.addColorStop(1, `rgba(99,102,241,${t * 0.3})`)
          ctx.strokeStyle = grad
          ctx.lineWidth = t * 1.5
          ctx.moveTo(mx, my)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        }
      })

      // Mouse cursor glow
      if (mx > 0 && mx < canvas.width) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, MR * 0.55)
        g.addColorStop(0, 'rgba(99,102,241,0.1)')
        g.addColorStop(1, 'rgba(99,102,241,0)')
        ctx.beginPath()
        ctx.arc(mx, my, MR * 0.55, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }

      // Particles — move at constant velocity, bounce at edges
      pts.forEach((p) => {
        const d = Math.hypot(p.x - mx, p.y - my)
        const near = d < MR
        const t = near ? 1 - d / MR : 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, near ? p.r + t * 2.5 : p.r, 0, Math.PI * 2)
        ctx.fillStyle = near ? `rgba(167,139,250,${0.5 + t * 0.5})` : 'rgba(139,92,246,0.45)'
        ctx.fill()

        // Constant velocity — no damping, no modification
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  { p.vx *= -1; p.x = Math.max(0, Math.min(canvas.width,  p.x)) }
        if (p.y < 0 || p.y > canvas.height) { p.vy *= -1; p.y = Math.max(0, Math.min(canvas.height, p.y)) }
      })

      raf.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────
function Section({ children, className = '', id, style }:
  { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} id={id} style={style}
      initial="hidden" animate={inView ? 'visible' : 'hidden'}
      className={`snap-section ${className}`}>
      {children}
    </motion.div>
  )
}

// ─── Glow orb ─────────────────────────────────────────────────────────────
function Glow({ className = '', w = 500, h = 500, blur = 140, color = '99,102,241', opacity = 0.07 }:
  { className?: string; w?: number; h?: number; blur?: number; color?: string; opacity?: number }) {
  return (
    <div className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ width: w, height: h, filter: `blur(${blur}px)`, background: `rgba(${color},${opacity})` }} />
  )
}

// ─── Dot grid ─────────────────────────────────────────────────────────────
function DotGrid({ opacity = 0.25 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.16) 1px, transparent 1px)',
      backgroundSize: '32px 32px', opacity,
    }} />
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────
// default → hover: border brightens, bg deepens, box-shadow appears, lifts
function Card({ children, className = '', glow = false, style }:
  { children: React.ReactNode; className?: string; glow?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={style}
      className={[
        'rounded-2xl border border-white/[0.08] bg-white/[0.05] backdrop-blur-md',
        'transition-all duration-300 group cursor-default',
        'hover:border-indigo-400/45 hover:bg-indigo-500/[0.1]',
        'hover:shadow-[0_6px_32px_-8px_rgba(99,102,241,0.4)]',
        glow ? 'shadow-[0_0_50px_-15px_rgba(99,102,241,0.35)]' : '',
        className,
      ].join(' ')}>
      {children}
    </div>
  )
}

// ─── Gradient heading ─────────────────────────────────────────────────────
function H2({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <h2 className={`font-bold leading-tight tracking-[-0.03em] bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent ${className}`}
      style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', ...style }}>
      {children}
    </h2>
  )
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-indigo-400/70 mb-4">
      {children}
    </p>
  )
}

// ─── Icon box ─────────────────────────────────────────────────────────────
const iColors: Record<string, string> = {
  indigo:  'bg-indigo-500/10 border-indigo-500/18 text-indigo-400 group-hover:bg-indigo-500/28 group-hover:border-indigo-400/55 group-hover:text-indigo-300',
  red:     'bg-red-500/10 border-red-500/18 text-red-400 group-hover:bg-red-500/22 group-hover:border-red-400/50 group-hover:text-red-300',
  yellow:  'bg-amber-500/10 border-amber-500/18 text-amber-400 group-hover:bg-amber-500/22 group-hover:border-amber-400/50 group-hover:text-amber-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/18 text-emerald-400 group-hover:bg-emerald-500/22 group-hover:border-emerald-400/50 group-hover:text-emerald-300',
}
function IconBox({ icon: Icon, color = 'indigo', sm = false }:
  { icon: React.ElementType; color?: string; sm?: boolean }) {
  return (
    <div className={`${sm ? 'w-9 h-9 rounded-lg' : 'w-11 h-11 rounded-xl'} border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${iColors[color] ?? iColors.indigo}`}>
      <Icon size={sm ? 15 : 18} />
    </div>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────
function PrimaryBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-all duration-200 shadow-[0_0_36px_-8px_rgba(99,102,241,0.65)] hover:shadow-[0_0_52px_-4px_rgba(99,102,241,0.85)] hover:-translate-y-0.5 active:translate-y-0"
      style={{ padding: '10px 20px' }}>
      {children}
    </a>
  )
}
function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] text-slate-400 hover:text-white hover:border-indigo-400/40 hover:bg-indigo-500/10 text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5"
      style={{ padding: '10px 20px' }}>
      {children}
    </a>
  )
}

// ─── Container ────────────────────────────────────────────────────────────
function Container({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={style} className={`w-full max-w-5xl mx-auto px-8 md:px-12 ${className}`}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════════════════
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between border-b border-white/[0.05] bg-[#06060a]/85 backdrop-blur-xl"
      style={{ zIndex: 100, padding: '0 44px' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_14px_rgba(99,102,241,0.5)]">
          <span className="text-white text-[9px] font-black tracking-tight">DL</span>
        </div>
        <span className="text-[13px] font-semibold text-white/85 tracking-wide">DalingLab · 归零增长系统</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-[13px] text-slate-500">
        {(['痛点', '方法论', '服务', '成果'] as const).map((item, i) => (
          <a key={item} href={['#pain','#method','#services','#results'][i]}
            className="hover:text-slate-200 transition-colors duration-200">{item}</a>
        ))}
      </div>

      <a href="#cta"
        className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.09] text-[12px] text-white/70 font-medium transition-all duration-200 hover:border-white/[0.18]"
        style={{ padding: '6px 14px' }}>
        预约诊断 <ChevronRight size={12} />
      </a>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <div className="snap-section relative" style={{ zIndex: 2 }}>
      {/* Layered glows */}
      <Glow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" w={800} h={700} blur={180} color="99,102,241" opacity={0.07} />
      <Glow className="bottom-10 right-1/4" w={400} h={400} blur={120} color="139,92,246" opacity={0.055} />
      <DotGrid opacity={0.22} />

      <div className="relative flex flex-col items-center text-center" style={{ zIndex: 3, paddingTop: 56, paddingLeft: 24, paddingRight: 24 }}>
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/22 bg-indigo-500/7"
          style={{ padding: '6px 16px', marginBottom: 36 }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
          <span className="text-[11px] text-indigo-300/85 tracking-wide font-medium">
            AI 数字化咨询工作室 · 服务茶饮 / 餐饮 / 零售品牌
          </span>
        </motion.div>

        {/* Headline — no comma */}
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible"
          className="font-bold text-white leading-[1.06] tracking-[-0.04em]"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', marginBottom: 28 }}>
          让增长更快
          <br />
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
            让决策更准
          </span>
        </motion.h1>

        {/* Subline */}
        <motion.p variants={slide(0.15)} initial="hidden" animate="visible"
          className="text-[15px] text-slate-500 max-w-md leading-relaxed font-light"
          style={{ marginBottom: 40 }}>
          用 AI 重构品牌增长的效率与确定性——
          帮助品牌<span className="text-slate-300"> 多赚钱</span>、<span className="text-slate-300">少试错</span>。
        </motion.p>

        {/* CTAs */}
        <motion.div variants={slide(0.28)} initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row items-center gap-3" style={{ marginBottom: 56 }}>
          <PrimaryBtn href="#cta">获取增长诊断 <ArrowRight size={14} /></PrimaryBtn>
          <GhostBtn href="#services">查看服务方案 <ChevronRight size={14} /></GhostBtn>
        </motion.div>

        {/* Stat strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="flex items-center gap-14">
          {[['70%','决策周期缩短'],['3×','套餐优化效率'],['60%','分析成本降低']].map(([v, l]) => (
            <div key={v} className="flex flex-col items-center gap-1.5">
              <span className="text-[1.7rem] font-bold text-white tracking-tight">{v}</span>
              <span className="text-[11px] text-slate-600 tracking-wide">{l}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 3 }}>
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600 to-transparent animate-pulse" />
        <span className="text-[9px] text-slate-700 tracking-[0.2em]">SCROLL</span>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PAIN POINTS
// ═══════════════════════════════════════════════════════════════════════════
const pains = [
  { icon: HelpCircle,    title: '不知道竞品为什么卖得好', desc: '爆款持续复购，却看不透背后的套餐逻辑和定价策略。' },
  { icon: BarChart3,     title: '套餐定价靠经验',         desc: '没有数据支撑，定高了怕没人买，定低了利润薄，一直试错。' },
  { icon: MessageSquare, title: '用户差评没有被系统分析', desc: '每天差评涌来，不知道哪些问题真正影响复购率。' },
  { icon: Copy,          title: '运营动作无法复制',       desc: '换了人或换了门店就失效，成功靠运气而非方法论。' },
]

function PainPoints() {
  return (
    <Section id="pain" style={{ zIndex: 2 } as React.CSSProperties}>
      <DotGrid opacity={0.2} />
      <Glow className="bottom-0 left-1/4 translate-y-1/3" w={450} h={450} blur={130} color="139,92,246" opacity={0.055} />
      <Container className="relative" style={{ zIndex: 3 } as React.CSSProperties}>
        <div className="grid md:grid-cols-2 gap-20 md:gap-28 items-center">
          {/* Left */}
          <motion.div variants={fadeUp}>
            <Eyebrow>问题所在</Eyebrow>
            <H2 className="mb-6">品牌增长<br />最怕靠感觉试错</H2>
            <p className="text-[14px] text-slate-500 leading-[1.9] font-light" style={{ maxWidth: 320 }}>
              市场在变，竞争在加剧。没有数据支撑的每一次决策，都在消耗品牌的试错成本。
            </p>
          </motion.div>
          {/* Right — cards with relative+z-index so hover never overlaps siblings */}
          <div className="flex flex-col gap-3">
            {pains.map((p, i) => (
              <motion.div key={p.title} variants={slide(i * 0.09)} className="relative hover:z-10">
                <Card className="flex items-start gap-5" style={{ padding: '20px 24px' }}>
                  <IconBox icon={p.icon} color="red" sm />
                  <div style={{ paddingTop: 1 }}>
                    <p className="text-[13px] font-semibold text-white/88 mb-2 group-hover:text-white transition-colors duration-300">{p.title}</p>
                    <p className="text-[12px] text-slate-500 leading-[1.75] font-light group-hover:text-slate-400 transition-colors duration-300">{p.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// METHODOLOGY
// ═══════════════════════════════════════════════════════════════════════════
const methods = [
  {
    icon: Zap, word: '快', title: '快速决策',
    desc: 'AI 自动分析竞品、套餐、价格，将原本数天的分析压缩到小时级，让团队不再等数据做决策。',
    bg: 'from-amber-500/8 to-transparent', border: 'border-amber-500/15 hover:border-amber-400/45',
    iconColor: 'yellow', wFrom: 'from-amber-400', wTo: 'to-orange-400',
    hoverShadow: 'hover:shadow-[0_8px_40px_-8px_rgba(251,191,36,0.25)]',
  },
  {
    icon: Target, word: '准', title: '精准判断',
    desc: '基于平台数据、用户评价与市场信号，构建判断依据，让每个关键决策都有数据支撑而非直觉。',
    bg: 'from-indigo-500/8 to-transparent', border: 'border-indigo-500/15 hover:border-indigo-400/50',
    iconColor: 'indigo', wFrom: 'from-indigo-400', wTo: 'to-violet-400',
    hoverShadow: 'hover:shadow-[0_8px_40px_-8px_rgba(99,102,241,0.35)]',
  },
  {
    icon: Shield, word: '稳', title: '稳定复制',
    desc: '沉淀可复用增长模型，让成功不靠运气，让有效的方法在每个门店、每个周期都能持续生效。',
    bg: 'from-emerald-500/8 to-transparent', border: 'border-emerald-500/15 hover:border-emerald-400/45',
    iconColor: 'emerald', wFrom: 'from-emerald-400', wTo: 'to-teal-400',
    hoverShadow: 'hover:shadow-[0_8px_40px_-8px_rgba(16,185,129,0.25)]',
  },
]

function Methodology() {
  return (
    <Section id="method" style={{ zIndex: 2 } as React.CSSProperties}>
      <Glow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" w={900} h={700} blur={200} color="99,102,241" opacity={0.045} />
      <Container className="relative" style={{ zIndex: 3 } as React.CSSProperties}>
        {/* Section header — generous spacing between each text element */}
        <motion.div variants={fadeUp} className="text-center" style={{ marginBottom: 56 }}>
          <Eyebrow>核心方法论</Eyebrow>
          <H2 style={{ marginBottom: 16 }}>快 · 准 · 稳</H2>
          <p className="text-[13px] text-slate-500 font-light tracking-wide">
            三个维度，系统重构品牌增长的效率体系
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 relative" style={{ gap: 20 }}>
          {methods.map((m, i) => (
            <motion.div key={m.word} variants={slide(i * 0.11)} className="relative hover:z-10">
              <div
                className={`group rounded-2xl border bg-gradient-to-b backdrop-blur-md ${m.bg} ${m.border} ${m.hoverShadow}
                  h-full transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1`}
                style={{ padding: '36px 30px' }}
              >
                {/* Icon */}
                <IconBox icon={m.icon} color={m.iconColor as keyof typeof iColors} />

                {/* Decorative character */}
                <div
                  className={`text-[4.2rem] font-black leading-none bg-gradient-to-br ${m.wFrom} ${m.wTo} bg-clip-text text-transparent opacity-[0.15] group-hover:opacity-[0.28] transition-opacity duration-300`}
                  style={{ marginTop: 28, marginBottom: 20 }}
                >
                  {m.word}
                </div>

                {/* Title */}
                <h3
                  className="text-[14px] font-semibold text-white/90 group-hover:text-white transition-colors duration-300"
                  style={{ marginBottom: 12 }}
                >
                  {m.title}
                </h3>

                {/* Description */}
                <p className="text-[12px] text-slate-500 leading-[1.9] font-light group-hover:text-slate-400 transition-colors duration-300">
                  {m.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// AI CAPABILITIES
// ═══════════════════════════════════════════════════════════════════════════
const flow = [
  { icon: Database,  n: '01', title: '数据采集', desc: '平台数据、竞品信息、用户评价自动抓取，结构化整理' },
  { icon: Brain,     n: '02', title: '智能分析', desc: 'AI 模型识别趋势、模式与关键异常，提炼核心洞察' },
  { icon: BarChart3, n: '03', title: '策略生成', desc: '输出可执行的增长建议，附优先级排序与判断依据' },
  { icon: Rocket,    n: '04', title: '方案落地', desc: '具体执行方案 + 复盘追踪机制，形成增长闭环' },
]

function AICapabilities() {
  return (
    <Section style={{ zIndex: 2 } as React.CSSProperties}>
      <DotGrid opacity={0.18} />
      <Glow className="top-1/3 right-0 translate-x-1/2" w={500} h={600} blur={160} color="139,92,246" opacity={0.05} />
      <Container className="relative" style={{ zIndex: 3 } as React.CSSProperties}>
        <motion.div variants={fadeUp} style={{ marginBottom: 52 }}>
          <Eyebrow>AI 能力</Eyebrow>
          <H2 style={{ marginBottom: 14 }}>AI 不只是工具<br />而是增长系统</H2>
          <p className="text-[13px] text-slate-500 font-light">四步闭环，从数据到落地的完整增长路径</p>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden">
          {flow.map((s, i) => (
            <motion.div key={s.n} variants={slide(i * 0.1)}>
              <div className="group bg-[#06060a]/90 backdrop-blur-md h-full flex flex-col hover:bg-indigo-600/[0.09] transition-colors duration-300 cursor-default"
                style={{ padding: '36px 28px', gap: 22 }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-500/50 tracking-[0.2em] group-hover:text-indigo-400/85 transition-colors duration-300">{s.n}</span>
                  {i < flow.length - 1 && <ChevronRight size={11} className="text-white/10 hidden md:block group-hover:text-indigo-400/50 transition-colors duration-300" />}
                </div>
                <IconBox icon={s.icon} color="indigo" sm />
                <div>
                  <h3 className="text-[13px] font-semibold text-white/85 group-hover:text-white transition-colors duration-300" style={{ marginBottom: 10 }}>{s.title}</h3>
                  <p className="text-[12px] text-slate-500 leading-[1.9] font-light group-hover:text-slate-400 transition-colors duration-300">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════
const services = [
  { icon: FileSearch,    title: '竞品分析报告',       desc: '自动抓取竞品套餐、价格与用户反馈，生成结构化分析报告。' },
  { icon: BarChart3,     title: '套餐设计与定价策略', desc: '基于市场数据与价格带分析，提供套餐组合优化建议。' },
  { icon: MessageSquare, title: '用户评价洞察',       desc: 'AI 聚类分析用户评价，识别关键痛点与增长机会。' },
  { icon: Store,         title: '门店运营优化',       desc: '诊断门店运营流程，找到可标准化的效率提升点。' },
  { icon: Palette,       title: '品牌体验设计',       desc: '从用户视角出发，优化品牌触点与完整消费体验。' },
  { icon: Wrench,        title: 'AI 增长工具定制',   desc: '根据品牌需求，定制专属 AI 分析工具与增长系统。' },
]

function Services() {
  return (
    <Section id="services" style={{ zIndex: 2 } as React.CSSProperties}>
      <Glow className="bottom-0 left-1/3 translate-y-1/3" w={500} h={500} blur={140} color="99,102,241" opacity={0.06} />
      <Container className="relative" style={{ zIndex: 3 } as React.CSSProperties}>
        <motion.div variants={fadeUp} style={{ marginBottom: 52 }}>
          <Eyebrow>服务模块</Eyebrow>
          <H2 style={{ marginBottom: 14 }}>覆盖增长全链路的服务体系</H2>
          <p className="text-[13px] text-slate-500 font-light">从洞察到落地，每个环节都有对应的 AI 能力支撑</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 relative" style={{ gap: 16 }}>
          {services.map((s, i) => (
            <motion.div key={s.title} variants={slide(i * 0.08)} className="relative hover:z-10">
              <Card className="h-full flex flex-col" style={{ padding: '28px 26px', gap: 20 }}>
                <IconBox icon={s.icon} color="indigo" sm />
                <div>
                  <h3
                    className="text-[13px] font-semibold text-white/88 group-hover:text-indigo-300 transition-colors duration-300"
                    style={{ marginBottom: 10 }}
                  >{s.title}</h3>
                  <p className="text-[12px] text-slate-500 leading-[1.9] font-light group-hover:text-slate-400 transition-colors duration-300">{s.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE OUTPUTS
// ═══════════════════════════════════════════════════════════════════════════
const outputs = [
  { label: '竞品套餐结构分析', content: '头部品牌 TOP5 套餐中，双人套餐占比 42%，均价 ¥58-78，核心卖点集中于"性价比 + 新品体验"组合。' },
  { label: '价格带建议',       content: '市场高频段 ¥25-35，溢价段 ¥55-85，¥38-52 区间存在明显空白，适合差异化切入。' },
  { label: '爆款组合逻辑',     content: '爆款共性：招牌主品 + 限定配品 + 增值小物，构成"确定性 + 惊喜感"消费结构。' },
  { label: '差评聚类洞察',     content: '近 90 天差评：等待过长 38%、甜度不符 24%、包装破损 17%，三项均可通过流程优化系统解决。' },
  { label: '增长策略建议',     content: '优先切入双人套餐空白价格带，结合限定联名概念，预期客单价提升 15-22%，复购率改善 8-12%。' },
]

function SampleOutputs() {
  return (
    <Section style={{ zIndex: 2 } as React.CSSProperties}>
      <DotGrid opacity={0.16} />
      <Glow className="top-1/2 right-0 -translate-y-1/2 translate-x-1/3" w={450} h={650} blur={160} color="139,92,246" opacity={0.045} />
      <Container className="relative" style={{ zIndex: 3 } as React.CSSProperties}>
        <div className="grid md:grid-cols-[1fr_1.45fr] items-center" style={{ gap: '0 96px' }}>
          {/* Left */}
          <motion.div variants={fadeUp}>
            <Eyebrow>示例输出</Eyebrow>
            <H2 style={{ marginBottom: 20 }}>AI 输出的<br />不是报告<br />是决策依据</H2>
            <p className="text-[13px] text-slate-500 leading-[1.9] font-light" style={{ maxWidth: 260, marginBottom: 28 }}>
              每一份输出都直接对应一个业务判断，不产生无效信息噪声。
            </p>
            <p className="text-[11px] text-slate-700 flex items-center gap-1.5">
              <AlertCircle size={10} className="flex-shrink-0" />
              示例数据，实际分析结果因品牌情况而异
            </p>
          </motion.div>
          {/* Right */}
          <div className="flex flex-col" style={{ gap: 10 }}>
            {outputs.map((o, i) => (
              <motion.div key={o.label} variants={slide(i * 0.09)} className="relative hover:z-10">
                <div
                  className="group rounded-xl border border-white/[0.08] bg-white/[0.05] backdrop-blur-md transition-all duration-300 hover:border-indigo-400/40 hover:bg-indigo-500/[0.09] hover:shadow-[0_6px_28px_-8px_rgba(99,102,241,0.35)]"
                  style={{ padding: '16px 20px' }}
                >
                  <span
                    className="inline-block text-[9px] font-semibold tracking-[0.16em] uppercase text-indigo-400/60 border border-indigo-500/18 bg-indigo-500/7 rounded group-hover:text-indigo-300/85 group-hover:border-indigo-400/40 transition-all duration-300"
                    style={{ padding: '3px 8px', display: 'inline-block', marginBottom: 10 }}
                  >{o.label}</span>
                  <p className="text-[12px] text-slate-400/80 leading-[1.8] font-light group-hover:text-slate-300 transition-colors duration-300">{o.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════════════════════════════════════
const stats = [
  { value: '70%', label: '决策周期缩短', sub: '从数天压缩至小时级', icon: Clock },
  { value: '3×',  label: '套餐优化效率', sub: '相比传统人工分析',   icon: TrendingUp },
  { value: '60%', label: '分析成本降低', sub: '减少低效重复工作',   icon: BarChart3 },
]

function Results() {
  return (
    <Section id="results" style={{ zIndex: 2 } as React.CSSProperties}>
      <Glow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" w={800} h={600} blur={180} color="99,102,241" opacity={0.06} />
      <Container className="relative text-center" style={{ zIndex: 3 } as React.CSSProperties}>
        <motion.div variants={fadeUp} style={{ marginBottom: 56 }}>
          <Eyebrow>参考成果</Eyebrow>
          <H2 style={{ marginBottom: 14 }}>效率的量级差</H2>
          <p className="text-[13px] text-slate-500 font-light" style={{ marginBottom: 10 }}>三项核心指标的可量化提升</p>
          <p className="text-[11px] text-slate-700 flex items-center justify-center gap-1.5">
            <AlertCircle size={10} className="flex-shrink-0" /> 以下为示例参考数据
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 relative" style={{ gap: 20 }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={slide(i * 0.12)} className="relative hover:z-10">
              <Card glow={i === 1} className="flex flex-col items-center text-center" style={{ padding: '48px 32px', gap: 22 }}>
                <IconBox icon={s.icon} color="indigo" />
                <div className="text-[4.2rem] font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent tracking-[-0.04em] leading-none group-hover:from-indigo-200 group-hover:to-violet-300 transition-all duration-500">{s.value}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="text-[13px] font-semibold text-white/85 group-hover:text-white transition-colors duration-300">{s.label}</div>
                  <div className="text-[12px] text-slate-600 font-light group-hover:text-slate-500 transition-colors duration-300">{s.sub}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA
// ═══════════════════════════════════════════════════════════════════════════
function CTA() {
  return (
    <Section id="cta" className="flex-col justify-between" style={{ zIndex: 2 } as React.CSSProperties}>
      <Glow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" w={900} h={800} blur={220} color="99,102,241" opacity={0.08} />
      <Glow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" w={450} h={450} blur={110} color="139,92,246" opacity={0.055} />

      <div className="relative flex flex-col items-center justify-center text-center flex-1" style={{ zIndex: 3, padding: '0 24px' }}>
        <motion.div variants={fadeUp} className="max-w-xl mx-auto">
          <Eyebrow>开始增长</Eyebrow>
          <h2
            className="font-bold text-white leading-[1.06] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', marginBottom: 20 }}
          >
            从归零开始
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
              重做品牌增长
            </span>
          </h2>
          <p className="text-[14px] text-slate-500 leading-[1.85] font-light" style={{ marginBottom: 44 }}>
            用更快、更准、更稳的方法，找到下一次增长机会。
          </p>
          <PrimaryBtn href="mailto:hello@guiling.ai">
            预约一次增长诊断 <ArrowRight size={15} />
          </PrimaryBtn>
        </motion.div>
      </div>

      {/* Footer bar */}
      <div className="relative w-full border-t border-white/[0.04]" style={{ zIndex: 3, padding: '20px 44px' }}>
        <Container className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-[9px] font-black">归</span>
            </div>
            <span className="text-[12px] text-white/50 font-medium">DalingLab · 归零增长系统</span>
          </div>
          <p className="text-[11px] text-slate-700">AI 数字化咨询 · 服务茶饮 / 餐饮 / 零售品牌</p>
          <p className="text-[11px] text-slate-700">帮助品牌多赚钱、少试错</p>
        </Container>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <>
      <GlobalParticles />
      <Nav />
      <div className="snap-container" style={{ position: 'relative', zIndex: 2 }}>
        <Hero />
        <PainPoints />
        <Methodology />
        <AICapabilities />
        <Services />
        <SampleOutputs />
        <Results />
        <CTA />
      </div>
    </>
  )
}
