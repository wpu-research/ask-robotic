// Ders: yapay zekâ ajanı. Hedef → düşün → araç seç → çağır → gözle → tekrar → bitir döngüsü. Araçlar (sensör, harita, motor,
// tutucu, takvim, mesaj) ortak bir tanımla (MCP fikri) sunulur; "ajan" burada dil modeli DEĞİL, kurallı küçük bir planlayıcıdır.
import { cap, type Bi, type Cap, type Frame, type Lesson } from './core'

export type XY = [number, number]
/** Depo haritası (metre). */
export const PLACES: Record<string, { xy: XY; label: Bi }> = {
  charger: { xy: [1, 1], label: { tr: 'şarj', en: 'charger' } },
  B3: { xy: [8, 5], label: { tr: 'raf B3', en: 'rack B3' } },
  dock: { xy: [9, 1], label: { tr: 'yükleme', en: 'dock' } },
  workshop: { xy: [2, 5], label: { tr: 'atölye', en: 'workshop' } },
  corridor: { xy: [5, 3], label: { tr: 'koridor', en: 'corridor' } },
}
export const START: XY = [4, 1]

/** Araç tanımları: ortak arayüz (ad, açıklama, girdi şeması) — MCP sunucusunun yayınladığı liste gibi. */
export const TOOLS: Array<{ name: string; input: string; desc: Bi }> = [
  { name: 'read_sensor', input: '{name}', desc: { tr: 'batarya ya da LiDAR oku', en: 'read battery or lidar' } },
  { name: 'query_map', input: '{place}', desc: { tr: 'yerin koordinatı', en: 'coordinates of a place' } },
  { name: 'drive_to', input: '{x, y}', desc: { tr: 'motorlarla oraya git', en: 'drive there with the motors' } },
  { name: 'gripper', input: '{op}', desc: { tr: 'kutu al / bırak', en: 'pick / drop a box' } },
  { name: 'calendar', input: '{day}', desc: { tr: 'günün işleri', en: "the day's jobs" } },
  { name: 'send_message', input: '{to, text}', desc: { tr: 'insana mesaj at', en: 'message a person' } },
]

export const TASKS: Array<{ goal: Bi }> = [
  { goal: { tr: "Batarya %20'nin altındaysa şarj istasyonuna git.", en: 'If the battery is below 20%, go to the charging station.' } },
  { goal: { tr: 'Raf B3’teki kutuyu yükleme alanına götür.', en: 'Take the box on rack B3 to the loading dock.' } },
  { goal: { tr: 'Takvimdeki bugünkü bakım için doğru yere git ve teknisyene haber ver.', en: "Go to the place of today's maintenance job and tell the technician." } },
  { goal: { tr: 'Koridoru kontrol et; engel varsa operatöre bildir.', en: 'Check the corridor; if there is an obstacle, report it to the operator.' } },
]
/** Araç hatası açıksa: hangi görevde hangi araç kaç kez hata verir (sonra düzelir). */
const FAULTS: Array<{ tool: string; times: number; err: string }> = [
  { tool: 'read_sensor', times: 1, err: 'timeout' },
  { tool: 'gripper', times: 1, err: 'grip slipped' },
  { tool: 'calendar', times: 1, err: '503 server busy' },
  { tool: 'read_sensor', times: 2, err: 'lidar timeout' },
]
export const MAX_STEPS = 10
export const MAX_TRIES = 3

interface World { pos: XY; battery: number; held: boolean; fail: { tool: string; left: number; err: string } }
interface Mem { battery?: number; loc: Record<string, XY>; event?: { time: string; job: Bi; place: string }; lidar?: { obstacle: boolean; m: number }; picked?: boolean; dropped?: boolean; sent?: boolean }
type Act = { thought: Bi; tool?: string; args?: Record<string, string | number> }

const dist = (a: XY, b: XY) => Math.hypot(a[0] - b[0], a[1] - b[1])
const at = (w: World, p: XY) => dist(w.pos, p) < 1e-9

/** Sahte ama deterministik araçlar. Hata sayacı bitene kadar seçilen araç hata fırlatır. */
function callTool(w: World, tool: string, a: Record<string, string | number>): { ok: boolean; out: Record<string, unknown> | Array<Record<string, unknown>> | string } {
  if (w.fail.tool === tool && w.fail.left > 0) { w.fail.left--; return { ok: false, out: w.fail.err } }
  switch (tool) {
    case 'read_sensor':
      if (a.name === 'battery') return { ok: true, out: { percent: w.battery } }
      return { ok: true, out: at(w, PLACES.corridor.xy) ? { obstacle: true, distance_m: 1.2 } : { obstacle: false } }
    case 'query_map': { const p = PLACES[String(a.place)]; return { ok: true, out: { x: p.xy[0], y: p.xy[1], distance_m: Math.round(dist(w.pos, p.xy) * 10) / 10 } } }
    case 'drive_to': { const to: XY = [Number(a.x), Number(a.y)]; w.battery = Math.round(w.battery - dist(w.pos, to)); w.pos = to; return { ok: true, out: { at: [to[0], to[1]], battery: w.battery } } }
    case 'gripper': w.held = a.op === 'pick'; return { ok: true, out: { holding: w.held } }
    case 'calendar': return { ok: true, out: [{ time: '10:00', job: 'wheel service', place: 'workshop' }] }
    case 'send_message': return { ok: true, out: { delivered: true } }
  }
  return { ok: false, out: 'unknown tool' }
}

const T = (tr: string, en: string): Bi => ({ tr, en })
const goTo = (m: Mem, w: World, place: string, why: Bi): Act | null => {
  if (!m.loc[place]) return { thought: T(`${PLACES[place].label.tr} nerede? haritaya sorayım`, `where is the ${PLACES[place].label.en}? ask the map`), tool: 'query_map', args: { place } }
  if (!at(w, m.loc[place])) return { thought: why, tool: 'drive_to', args: { x: m.loc[place][0], y: m.loc[place][1] } }
  return null
}
/** Kurallı planlayıcı: belleğe (gözlemlere) bakıp sıradaki eylemi seçer. Dil modeli yok; her görev için birkaç "eğer" kuralı. */
function plan(task: number, m: Mem, w: World): Act {
  if (task === 0) {
    if (m.battery === undefined) return { thought: T('önce bataryayı ölçmeliyim', 'first I must measure the battery'), tool: 'read_sensor', args: { name: 'battery' } }
    if (m.battery >= 20) return { thought: T('batarya yeterli, gitmeye gerek yok', 'battery is fine, no need to go') }
    return goTo(m, w, 'charger', T(`%${m.battery} < %20: istasyona gidiyorum`, `${m.battery}% < 20%: driving to the station`)) ?? { thought: T('istasyondayım, hedef tamam', 'at the station, goal reached') }
  }
  if (task === 1) {
    if (m.dropped) return { thought: T('kutu yükleme alanında, hedef tamam', 'the box is at the dock, goal reached') }
    if (!m.picked) return goTo(m, w, 'B3', T('rafa gidiyorum', 'driving to the rack')) ?? { thought: T('raftayım, kutuyu alayım', 'at the rack, pick up the box'), tool: 'gripper', args: { op: 'pick' } }
    return goTo(m, w, 'dock', T('kutu bende, yükleme alanına', 'box in hand, to the dock')) ?? { thought: T('yükleme alanındayım, bırak', 'at the dock, drop it'), tool: 'gripper', args: { op: 'drop' } }
  }
  if (task === 2) {
    if (!m.event) return { thought: T('bugün ne iş var? takvime bakayım', 'what is on today? check the calendar'), tool: 'calendar', args: { day: 'today' } }
    if (m.sent) return { thought: T('teknisyene haber verildi, hedef tamam', 'technician told, goal reached') }
    return goTo(m, w, m.event.place, T(`${m.event.time} ${m.event.job.tr}: atölyeye gidiyorum`, `${m.event.time} ${m.event.job.en}: driving to the workshop`)) ?? { thought: T('geldim, teknisyene yazayım', 'arrived, message the technician'), tool: 'send_message', args: { to: 'technician', text: 'robot at workshop' } }
  }
  const g = goTo(m, w, 'corridor', T('koridora gidiyorum', 'driving to the corridor'))
  if (g) return g
  if (!m.lidar) return { thought: T('koridordayım, LiDAR ile bakayım', 'in the corridor, look with the lidar'), tool: 'read_sensor', args: { name: 'lidar' } }
  if (!m.lidar.obstacle) return { thought: T('engel yok, hedef tamam', 'no obstacle, goal reached') }
  if (!m.sent) return { thought: T(`${m.lidar.m} m önde engel: operatöre bildir`, `obstacle ${m.lidar.m} m ahead: report to the operator`), tool: 'send_message', args: { to: 'operator', text: `obstacle ${m.lidar.m} m` } }
  return { thought: T('bildirildi, hedef tamam', 'reported, goal reached') }
}

/** Gözlemi belleğe yaz. */
function remember(m: Mem, tool: string, a: Record<string, string | number>, out: unknown) {
  const o = out as Record<string, unknown>
  if (tool === 'read_sensor' && a.name === 'battery') m.battery = o.percent as number
  if (tool === 'read_sensor' && a.name === 'lidar') m.lidar = { obstacle: !!o.obstacle, m: (o.distance_m as number) ?? 0 }
  if (tool === 'query_map') m.loc[String(a.place)] = [o.x as number, o.y as number]
  if (tool === 'gripper') { if (a.op === 'pick') m.picked = true; else m.dropped = true }
  if (tool === 'calendar') { const e = (out as Array<Record<string, string>>)[0]; m.event = { time: e.time, job: T('tekerlek bakımı', e.job), place: e.place } }
  if (tool === 'send_message') m.sent = true
}

export interface Step { n: number; thought: Bi; tool?: string; args?: string; attempt: number; ok: boolean; obs?: string; pos: XY; battery: number; held: boolean; from: XY }
export function runAgent(task: number, faults: boolean) {
  const f = FAULTS[task]
  const w: World = { pos: [...START] as XY, battery: task === 0 ? 18 : 64, held: false, fail: { tool: f.tool, left: faults ? f.times : 0, err: f.err } }
  const m: Mem = { loc: {} }
  const steps: Step[] = []
  let done = false, calls = 0, retries = 0
  for (let n = 1; n <= MAX_STEPS; n++) {
    const a = plan(task, m, w)
    if (!a.tool) { steps.push({ n, thought: a.thought, attempt: 0, ok: true, pos: w.pos, battery: w.battery, held: w.held, from: w.pos }); done = true; break }
    const args = JSON.stringify(a.args).replace(/"(\w+)":/g, '$1: ').replace(/,/g, ', ')
    for (let t = 1; t <= MAX_TRIES; t++) {
      const from = w.pos
      const r = callTool(w, a.tool, a.args!)
      calls++
      if (t > 1) retries++
      steps.push({ n, thought: a.thought, tool: a.tool, args, attempt: t, ok: r.ok, obs: typeof r.out === 'string' ? `error: ${r.out}` : JSON.stringify(r.out).replace(/"(\w+)":/g, '$1: ').replace(/"/g, '').replace(/,/g, ', '), pos: w.pos, battery: w.battery, held: w.held, from })
      if (r.ok) { remember(m, a.tool, a.args!, r.out); break }
    }
  }
  return { steps, done, calls, retries, decisions: steps.filter((s) => s.attempt <= 1).length, end: w }
}

export interface AgentFrame extends Frame {
  task: number
  steps: Step[]
  /** Görünen adım kaydı sayısı. */
  upto: number
  phase: 'goal' | 'tools' | 'think' | 'call' | 'obs' | 'move' | 'done' | 'summary'
  tool?: string
  pos: XY
  battery: number
  held: boolean
  /** Hareket animasyonu sırasında çizilecek yol. */
  trail: XY[]
  summary?: Array<{ calls: number; retries: number; done: boolean }>
}

export const YAPAY_ZEKA_AJANI: Lesson<AgentFrame> = {
  slug: 'yapay-zeka-ajani',
  n: 0,
  title: { tr: 'Araç kullanan yapay zekâ ajanı', en: 'An AI agent that uses tools' },
  sub: { tr: 'Hedef → düşün → araç çağır → gözle → tekrar', en: 'Goal → think → call a tool → observe → repeat' },
  story: {
    tr: 'Bir depo robotuna dört görev veriyoruz: şarj kontrolü, raftan kutu taşıma, takvimdeki bakıma gitme, koridor denetimi. Robotun altı aracı var: sensör okuma, harita sorgusu, motor komutu, tutucu, takvim ve mesaj. Her araç aynı biçimde tanımlı (ad, açıklama, girdi şeması); ajan bu listeye bakıp hangisini çağıracağını seçer. Burada ajan bir dil modeli değil, birkaç kuraldan oluşan küçük bir planlayıcı; döngü ise gerçek ajanlarınkiyle aynı.',
    en: 'We give a warehouse robot four tasks: a battery check, moving a box from a rack, going to a scheduled maintenance job and inspecting a corridor. The robot has six tools: read a sensor, query the map, drive the motors, a gripper, a calendar and messaging. Every tool is described the same way (name, description, input schema); the agent looks at this list and chooses which to call. Here the agent is not a language model but a small planner made of a few rules; the loop is the same as in real agents.',
  },
  how: [
    { tr: 'Düşün: ajan hedefe ve şimdiye kadarki gözlemlere (belleğe) bakar ve bir sonraki adımı seçer: "kutunun yeri bilinmiyor → haritaya sor".', en: 'Think: the agent looks at the goal and the observations so far (its memory) and picks the next step: "box location unknown → ask the map".' },
    { tr: 'Araç çağır: seçilen aracın adı ve girdileri (ör. drive_to {x: 8, y: 5}) ortak arayüzle gönderilir. MCP (Model Context Protocol) bu arayüzü standart yapar; aynı araç her ajana takılabilir.', en: 'Call a tool: the chosen tool name and inputs (e.g. drive_to {x: 8, y: 5}) are sent through a common interface. MCP (Model Context Protocol) standardises this interface, so the same tool plugs into any agent.' },
    { tr: 'Gözle: aracın dönüşü belleğe yazılır. Hata dönerse aynı çağrı en fazla 3 kez denenir.', en: 'Observe: the tool result is written to memory. If it returns an error, the same call is retried up to 3 times.' },
    { tr: 'Hedef sağlanınca döngü biter; sağlanmazsa en fazla 10 adımda durur.', en: 'When the goal is met the loop stops; otherwise it gives up after 10 steps.' },
    { tr: 'Şunu dene: araç hatasını kapat; yeniden denemeler kaybolur ve adım sayısı azalır. Görev 4’te LiDAR iki kez zaman aşımına uğrar, üçüncüde cevap verir.', en: 'Try this: turn tool faults off; the retries disappear and the step count drops. In task 4 the lidar times out twice and answers on the third try.' },
  ],
  why: {
    tr: 'Bugünün yapay zekâ asistanları bu döngüyle çalışır: dil modeli "düşün" adımını yapar, araçlar (takvim, e-posta, veritabanı, kod çalıştırma) gerçek işi görür; MCP sayesinde binlerce araç aynı biçimde bağlanır. Robotikte aynı yapı, görev planlayıcının algılama, haritalama ve hareket modüllerini çağırmasıdır; hata durumunda yeniden deneme ve adım sınırı, sahada güvenli çalışmanın temelidir.',
    en: "Today's AI assistants run on this loop: a language model does the 'think' step and tools (calendar, email, databases, running code) do the real work; with MCP thousands of tools connect the same way. In robotics the same structure is a task planner calling perception, mapping and motion modules; retrying on errors and a step limit are the basis of safe operation in the field.",
  },
  file: 'ajan.py',
  code: [
    ['W = {"B3": (8, 5), "dock": (9, 1)}', 'harita', 'map'],
    ['S = {"pos": (4, 1), "held": False, "fails": 1}', 'dünya; tutucu 1 kez kayar', 'world; gripper slips once'],
    ['def gripper(op):'],
    ['    if S["fails"]: S["fails"] -= 1; raise IOError("slip")'],
    ['    S["held"] = op == "pick"; return S["held"]'],
    ['def move(xy): S["pos"] = xy; return xy'],
    ['TOOLS = {"map": W.get, "move": move, "grip": gripper}', 'ortak arayüz', 'common interface'],
    ['def plan(m):', 'kurallı planlayıcı (LLM yok)', 'rule-based planner (no LLM)'],
    ['    if "drop" in m: return None, None', 'hedef tamam', 'goal reached'],
    ['    goal = "dock" if S["held"] else "B3"'],
    ['    if goal not in m: return "map", goal', 'yer bilinmiyor → sor', 'place unknown → ask'],
    ['    if S["pos"] != m[goal]: return "move", m[goal]', 'oraya git', 'drive there'],
    ['    return "grip", "drop" if S["held"] else "pick"'],
    ['m, step = {}, 0', 'bellek', 'memory'],
    ['while step < 10:', 'en fazla 10 adım', 'at most 10 steps'],
    ['    tool, arg = plan(m); step += 1', 'düşün', 'think'],
    ['    if tool is None: break'],
    ['    for attempt in range(3):', 'en fazla 3 deneme', 'up to 3 tries'],
    ['        try: m[arg] = TOOLS[tool](arg); break', 'çağır, gözle', 'call, observe'],
    ['        except IOError as e: print(step, tool, "error:", e)'],
    ['    print(step, tool, arg, "->", m.get(arg))'],
    ['print("done after", step - 1, "tool steps")'],
  ],
  params: [
    { key: 'task', label: { tr: 'Görev no (1 şarj, 2 kutu, 3 takvim, 4 koridor)', en: 'Task no (1 charge, 2 box, 3 calendar, 4 corridor)' }, min: 1, max: 4, step: 1, value: 2 },
    { key: 'fault', label: { tr: 'Araç hatası (0 kapalı, 1 açık)', en: 'Tool fault (0 off, 1 on)' }, min: 0, max: 1, step: 1, value: 1 },
  ],
  run({ task = 2, fault = 1 }) {
    const ti = Math.max(0, Math.min(3, Math.round(task) - 1))
    const faults = Math.round(fault) === 1
    const r = runAgent(ti, faults)
    const F: AgentFrame[] = []
    const S = r.steps
    const goal = TASKS[ti].goal
    const st = (k: number, calls: number): Cap => cap(`adım ${k} / en fazla ${MAX_STEPS} · araç çağrısı ${calls}`, `step ${k} / at most ${MAX_STEPS} · tool calls ${calls}`)
    const base = { task: ti, steps: S, trail: [] as XY[] }
    let pos: XY = [...START] as XY, battery = ti === 0 ? 18 : 64, held = false
    F.push({ ...base, upto: 0, phase: 'goal', pos, battery, held, line: 13, cap: cap(`hedef: ${goal.tr}`, `goal: ${goal.en}`), stat: cap('ajan: kurallı planlayıcı (dil modeli yok)', 'agent: rule-based planner (no language model)'), hold: 2.2 })
    TOOLS.forEach((t, i) => F.push({ ...base, upto: 0, phase: 'tools', tool: t.name, pos, battery, held, line: 6, cap: cap(`araç ${i + 1}: ${t.name} ${t.input} · ${t.desc.tr}`, `tool ${i + 1}: ${t.name} ${t.input} · ${t.desc.en}`), stat: cap('her araç aynı biçimde tanımlı (MCP fikri)', 'every tool is described the same way (the MCP idea)'), hold: i === 0 ? 1.4 : 0.7 }))
    let calls = 0
    S.forEach((s, i) => {
      const slow = i < 3
      const k = s.n
      if (s.attempt <= 1) F.push({ ...base, upto: i + 1, phase: 'think', pos, battery, held, line: 15, cap: cap(`düşün: ${s.thought.tr}`, `think: ${s.thought.en}`), stat: st(k, calls), hold: slow ? 1.4 : 0.8 })
      if (!s.tool) {
        F.push({ ...base, upto: i + 1, phase: 'done', pos, battery, held, line: 16, cap: cap('hedef sağlandı: döngü biter', 'goal met: the loop ends'), stat: st(k, calls), hold: 1.6 })
        return
      }
      calls++
      F.push({ ...base, upto: i + 1, phase: 'call', tool: s.tool, pos, battery, held, line: 18, cap: cap(`çağır: ${s.tool} ${s.args}${s.attempt > 1 ? ` (deneme ${s.attempt})` : ''}`, `call: ${s.tool} ${s.args}${s.attempt > 1 ? ` (try ${s.attempt})` : ''}`), stat: st(k, calls), hold: slow ? 1.3 : 0.7 })
      if (s.tool === 'drive_to' && s.ok) {
        const n = Math.max(3, Math.round(Math.hypot(s.pos[0] - s.from[0], s.pos[1] - s.from[1]) * 1.5))
        for (let j = 1; j <= n; j++) {
          const t = j / n
          const p: XY = [s.from[0] + (s.pos[0] - s.from[0]) * t, s.from[1] + (s.pos[1] - s.from[1]) * t]
          F.push({ ...base, upto: i + 1, phase: 'move', tool: s.tool, pos: p, battery: Math.round(battery + (s.battery - battery) * t), held, trail: [s.from, p], line: 18, cap: cap(`motorlar çalışıyor… ${Math.round(t * 100)}%`, `motors running… ${Math.round(t * 100)}%`), stat: st(k, calls), hold: 0.25 })
        }
      }
      pos = s.pos; battery = s.battery; held = s.held
      F.push({
        ...base, upto: i + 1, phase: 'obs', tool: s.tool, pos, battery, held, line: s.ok ? 18 : 19,
        cap: s.ok ? cap(`gözlem: ${s.obs}`, `observation: ${s.obs}`) : cap(`hata: ${s.obs!.replace('error: ', '')} → yeniden dene`, `error: ${s.obs!.replace('error: ', '')} → retry`),
        stat: st(k, calls), hold: slow || !s.ok ? 1.5 : 0.8,
      })
    })
    F.push({ ...base, upto: S.length, phase: 'done', pos, battery, held, line: 21, cap: r.done ? cap(`bitti: ${r.calls} araç çağrısı, ${r.retries} yeniden deneme`, `done: ${r.calls} tool calls, ${r.retries} retries`) : cap('adım sınırı doldu, hedef sağlanamadı', 'step limit reached, goal not met'), stat: cap('bellek → karar → araç → gözlem', 'memory → decision → tool → observation'), hold: 2.4 })
    // aynı ajan diğer görevlerde (hızlı)
    const runs = [0, 1, 2, 3].map((t) => runAgent(t, faults))
    runs.forEach((q, t) => {
      if (t === ti) return
      const b = { task: t, steps: q.steps, trail: [] as XY[] }
      let ps: XY = [...START] as XY, bt = t === 0 ? 18 : 64, hd = false, cl = 0
      F.push({ ...b, upto: 0, phase: 'goal', pos: ps, battery: bt, held: hd, line: 13, cap: cap(`görev ${t + 1}: ${TASKS[t].goal.tr}`, `task ${t + 1}: ${TASKS[t].goal.en}`), stat: cap('aynı ajan, aynı araçlar', 'same agent, same tools'), hold: 1.4 })
      q.steps.forEach((s, i) => {
        if (s.tool && s.attempt <= 1) F.push({ ...b, upto: i + 1, phase: 'think', pos: ps, battery: bt, held: hd, line: 15, cap: cap(`düşün: ${s.thought.tr}`, `think: ${s.thought.en}`), stat: st(s.n, cl), hold: 0.45 })
        if (s.tool) cl++
        if (s.tool === 'drive_to' && s.ok) for (const u of [1 / 3, 2 / 3]) {
          const p: XY = [s.from[0] + (s.pos[0] - s.from[0]) * u, s.from[1] + (s.pos[1] - s.from[1]) * u]
          F.push({ ...b, upto: i + 1, phase: 'move', tool: s.tool, pos: p, battery: bt, held: hd, trail: [s.from, p], line: 18, cap: cap(`çağır: ${s.tool} ${s.args}`, `call: ${s.tool} ${s.args}`), stat: st(s.n, cl), hold: 0.25 })
        }
        ps = s.pos; bt = s.battery; hd = s.held
        F.push({
          ...b, upto: i + 1, phase: s.tool ? 'obs' : 'done', tool: s.tool, pos: ps, battery: bt, held: hd, line: !s.tool ? 16 : s.ok ? 18 : 19,
          cap: !s.tool ? cap(`düşün: ${s.thought.tr}`, `think: ${s.thought.en}`) : s.ok ? cap(`${s.tool} → ${s.obs}`, `${s.tool} → ${s.obs}`) : cap(`${s.tool} hata: ${s.obs!.replace('error: ', '')} → yeniden dene`, `${s.tool} error: ${s.obs!.replace('error: ', '')} → retry`),
          stat: st(s.n, cl), hold: s.ok ? 0.6 : 1,
        })
      })
    })
    const summary = runs.map((q) => ({ calls: q.calls, retries: q.retries, done: q.done }))
    const L = F.filter((x) => x.task === ti).at(-1)!
    F.push({ ...base, upto: S.length, phase: 'summary', summary, pos: L.pos, battery: L.battery, held: L.held, line: 21, cap: cap(`aynı ajan, dört görev: ${summary.map((q) => q.calls).join(', ')} araç çağrısı`, `same agent, four tasks: ${summary.map((q) => q.calls).join(', ')} tool calls`), stat: cap(`hepsi ${MAX_STEPS} adım sınırının altında`, `all under the ${MAX_STEPS}-step limit`), hold: 3 })
    return F
  },
}
