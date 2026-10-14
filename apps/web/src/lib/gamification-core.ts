// Oyunlaştırma çekirdeği: XP, günlük hedef, seri ve seri şarjı. Saf işlevler (DOM yok); depo: gamification.ts.
// Kurallar (Brilliant'tan uyarlandı, docs/analiz-brilliant.md §4):
// - Gün "aktif" sayılır: en az 3 doğru adım ya da 1 tamamlanan ders.
// - Seri şarjı: ders bitirince 1 kazanılır, en çok 2 tutulur; aktif olmayan geçmiş gün otomatik harcanır (seri korunur, artmaz).
// - XP: ilk denemede doğru adım 15, sonraki denemede 10; ders bitirme 20. Aynı ders aynı gün ikinci kez XP vermez.

export const MAX_CHARGES = 2
export const ACTIVE_CORRECT = 3
export const XP = { firstTry: 15, retry: 10, lesson: 20 } as const

export interface DayStat { xp: number; correct: number; lessons: number }
export interface GameState {
  xp: number
  days: Record<string, DayStat>
  /** Şarjla korunan günler. */
  frozen: string[]
  charges: number
  /** reconcile'ın en son işlediği gün (YYYY-AA-GG). */
  checked?: string
  /** Ders XP'sinin verildiği günler: "dersId@gün". Son 200 kayıt. */
  lessonXp: string[]
}

export const emptyGame = (): GameState => ({ xp: 0, days: {}, frozen: [], charges: 0, lessonXp: [] })

/** Yerel saatle YYYY-AA-GG. */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + n))
}

const stat = (s: GameState, day: string): DayStat => s.days[day] ?? { xp: 0, correct: 0, lessons: 0 }
export const isActive = (s: GameState, day: string) => { const d = stat(s, day); return d.correct >= ACTIVE_CORRECT || d.lessons > 0 }

function withDay(s: GameState, day: string, f: (d: DayStat) => DayStat, xp: number): GameState {
  return { ...s, xp: s.xp + xp, days: { ...s.days, [day]: f(stat(s, day)) } }
}

export function recordStep(s: GameState, day: string, firstTry: boolean): GameState {
  const xp = firstTry ? XP.firstTry : XP.retry
  return withDay(s, day, (d) => ({ ...d, xp: d.xp + xp, correct: d.correct + 1 }), xp)
}

export function recordLesson(s: GameState, day: string, lessonId: number): GameState {
  const tag = `${lessonId}@${day}`
  if (s.lessonXp.includes(tag)) return s
  const next = withDay(s, day, (d) => ({ ...d, xp: d.xp + XP.lesson, lessons: d.lessons + 1 }), XP.lesson)
  return { ...next, charges: Math.min(MAX_CHARGES, s.charges + 1), lessonXp: [...s.lessonXp, tag].slice(-200) }
}

/**
 * Bugünden önceki, henüz işlenmemiş günlerde boşluk varsa şarj harcar (en eski önce). Şarj yalnız seri sürüyorsa
 * harcanır (bir önceki gün aktif ya da korunmuş); şarj yetmezse seri kırılır, kalan günlere şarj harcanmaz.
 */
export function reconcile(s: GameState, today: string): GameState {
  const yesterday = addDays(today, -1)
  if (!s.checked) return { ...s, checked: yesterday }
  let out: GameState = s
  for (let d = addDays(s.checked, 1); d <= yesterday; d = addDays(d, 1)) {
    if (isActive(out, d) || out.frozen.includes(d)) continue
    const prev = addDays(d, -1)
    const alive = isActive(out, prev) || out.frozen.includes(prev)
    if (!alive || out.charges === 0) break
    out = { ...out, frozen: [...out.frozen, d].slice(-60), charges: out.charges - 1 }
  }
  return { ...out, checked: yesterday > s.checked ? yesterday : s.checked }
}

/** Bugün itibarıyla seri: bugün aktifse bugünden, değilse dünden geriye sayar; şarjlı gün seriyi sürdürür ama artırmaz. */
export function streak(s: GameState, today: string): number {
  let d = isActive(s, today) ? today : addDays(today, -1)
  let n = 0
  for (let guard = 0; guard < 3650; guard++) {
    if (isActive(s, d)) n++
    else if (!s.frozen.includes(d)) break
    d = addDays(d, -1)
  }
  return n
}

/** Günlük hedef dakika → XP (≈ 5 XP/dk). */
export const goalXp = (minutes: number) => Math.max(25, Math.round(minutes * 5))

/** Pazartesi başlayan haftanın 7 günü ve her günün durumu (panel şeridi). */
export function weekStrip(s: GameState, today: string): { day: string; label: string; state: 'active' | 'frozen' | 'empty' | 'future'; today: boolean }[] {
  const [y, m, d] = today.split('-').map(Number)
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7
  const labels = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
  return labels.map((label, i) => {
    const day = addDays(today, i - dow)
    const state = day > today ? 'future' : isActive(s, day) ? 'active' : s.frozen.includes(day) ? 'frozen' : 'empty'
    return { day, label, state, today: day === today }
  })
}

export function parseGame(raw: string | null): GameState {
  try {
    const v = JSON.parse(raw ?? '')
    if (!v || typeof v !== 'object') return emptyGame()
    return {
      xp: Number.isFinite(v.xp) ? v.xp : 0,
      days: v.days && typeof v.days === 'object' ? v.days : {},
      frozen: Array.isArray(v.frozen) ? v.frozen.filter((x: unknown) => typeof x === 'string') : [],
      charges: Number.isInteger(v.charges) ? Math.max(0, Math.min(MAX_CHARGES, v.charges)) : 0,
      checked: typeof v.checked === 'string' ? v.checked : undefined,
      lessonXp: Array.isArray(v.lessonXp) ? v.lessonXp.filter((x: unknown) => typeof x === 'string') : [],
    }
  } catch { return emptyGame() }
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const byDay = (tag: string) => tag.slice(tag.indexOf('@') + 1)

/**
 * İki cihazın (ya da tarayıcı ↔ sunucu) oyun durumunu birleştirir. Saf, değişmeli, birleşmeli ve eşgüçlü:
 * mergeGame(a, a) = a, mergeGame(a, b) = mergeGame(b, a). Aynı durum tekrar gönderilse de XP şişmez.
 * - days: gün başına her alan (xp, correct, lessons) ayrı ayrı max. Aynı gün iki cihazda çalışılırsa toplam değil
 *   büyüğü sayılır (tekrar gönderimle ayırt edilemez; eksik saymak şişirmekten iyidir).
 * - frozen, lessonXp: birleşim, sıralı; en eski kayıtlar atılır (60 / 200).
 * - charges: max (üst sınır MAX_CHARGES). checked: büyüğü.
 * - xp: birleşik günlerin xp toplamı (her XP bir güne yazıldığından xp = Σ days.xp).
 */
export function mergeGame(a: GameState, b: GameState): GameState {
  const days: Record<string, DayStat> = {}
  for (const k of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) {
    const x = a.days[k], y = b.days[k]
    days[k] = !x ? { ...y } : !y ? { ...x } : { xp: Math.max(x.xp, y.xp), correct: Math.max(x.correct, y.correct), lessons: Math.max(x.lessons, y.lessons) }
  }
  const sortedKeys = Object.keys(days).sort()
  const ordered: Record<string, DayStat> = {}
  for (const k of sortedKeys) ordered[k] = days[k]
  const frozen = [...new Set([...a.frozen, ...b.frozen])].sort().slice(-60)
  const lessonXp = [...new Set([...a.lessonXp, ...b.lessonXp])].sort((p, q) => byDay(p).localeCompare(byDay(q)) || p.localeCompare(q)).slice(-200)
  const checked = a.checked && b.checked ? (a.checked > b.checked ? a.checked : b.checked) : (a.checked ?? b.checked)
  const out: GameState = {
    xp: sortedKeys.reduce((n, k) => n + ordered[k].xp, 0),
    days: ordered,
    frozen,
    charges: Math.min(MAX_CHARGES, Math.max(a.charges, b.charges)),
    lessonXp,
  }
  if (checked) out.checked = checked
  return out
}

export const MAX_DAY_XP = 2000

/**
 * Dışarıdan (istemci) gelen oyun durumunu güvenli hâle getirir: tanınmayan alanlar atılır, gün başı xp ≤ 2000
 * (correct ≤ 200, lessons ≤ 100), `maxDay`'den sonraki günler atılır. Sunucu mergeGame'den önce çağırır.
 */
export function clampGame(v: unknown, maxDay: string): GameState {
  const s = parseGame(JSON.stringify(v ?? null))
  const int = (n: unknown, max: number) => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0)
  const days: Record<string, DayStat> = {}
  for (const [k, d] of Object.entries(s.days).sort(([p], [q]) => p.localeCompare(q)).slice(-800)) {
    if (!DAY_RE.test(k) || k > maxDay || !d || typeof d !== 'object') continue
    const x = d as unknown as Record<string, unknown>
    const stat = { xp: int(x.xp, MAX_DAY_XP), correct: int(x.correct, 200), lessons: int(x.lessons, 100) }
    if (stat.xp || stat.correct || stat.lessons) days[k] = stat
  }
  const okDay = (d: string) => DAY_RE.test(d) && d <= maxDay
  const out: GameState = {
    xp: 0,
    days,
    frozen: s.frozen.filter(okDay).slice(-60),
    charges: s.charges,
    lessonXp: s.lessonXp.filter((t) => /^\d{1,9}@\d{4}-\d{2}-\d{2}$/.test(t) && byDay(t) <= maxDay).slice(-200),
  }
  if (s.checked && okDay(s.checked)) out.checked = s.checked
  return mergeGame(out, emptyGame())
}
