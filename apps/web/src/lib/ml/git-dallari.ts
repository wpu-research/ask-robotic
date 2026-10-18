// Ders: Git dalları ve üç yönlü birleştirme. Commit = içeriğin özeti (hash) + ebeveyni; dal = bir commit'e işaretçi.
// İki kişi robot yazılımına aynı anda özellik ekler; Git ortak atayı bulur, satır satır birleştirir, aynı satırda çakışma bildirir.
import { cap, type Cap, type Frame, type Lesson } from './core'

export interface GitCommit {
  id: string
  parents: string[]
  content: string[]
  /** 0: main şeridi, 1: engel şeridi. */
  lane: number
  col: number
  msg: Cap
  /** -1 ortak, 0 Can (main), 1 Ayşe (engel). */
  who: number
  /** Ebeveynine göre değişen satırlar. */
  changed: number[]
}
export interface MergeView {
  O: string[]; A: string[]; B: string[]
  /** Sonuç satırı; null = çakışma. */
  R: Array<string | null>
  /** Şu an incelenen satır (R'nin bu satıra kadarki kısmı dolu). */
  row: number
  /** true: bu satırın kararı da gösterilsin. */
  decided: boolean
}
export interface GitFrame extends Frame {
  commits: GitCommit[]
  /** İlk kaç commit görünür. */
  shown: number
  refs: { main: string | null; engel: string | null }
  head: 'main' | 'engel'
  /** Dosya panelinde gösterilen içerik ve başlığı. */
  file?: string[]
  fileTitle?: Cap
  hl?: number[]
  /** Özet (hash) hesabı: girdi, işlenen karakter sayısı, o anki h. */
  hash?: { s: string; upto: number; h: number }
  ancA?: string[]
  ancB?: string[]
  common?: string[]
  base?: string
  merge?: MergeView
  /** Son: çakışma metni (işaretli dosya) ya da birleştirme commit'i. */
  conflict?: { rows: number[]; text: string[] }
}

export const BASE_FILE = ['HIZ = 0.5', 'ESIK = 0.30', 'PIL_MIN = 0.0', 'def adim(r):', '  r.oku()', '  pass', '  r.git(HIZ)']

/** Python'daki ozet() ile birebir: h = (h·31 + kod) mod 2³², onaltılık 8 hanenin ilk 7'si. */
export function ozet(s: string): string {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.codePointAt(0)!) % 4294967296
  return h.toString(16).padStart(8, '0').slice(0, 7)
}
/** Python'daki str(liste) ile aynı metin. */
export const pyList = (xs: readonly string[]): string => '[' + xs.map((x) => `'${x}'`).join(', ') + ']'

export function gitScenario(conflict: boolean) {
  const G = new Map<string, { parents: string[]; content: string[] }>()
  const commit = (ust: string[], d: string[]) => { const k = ozet(pyList(ust) + pyList(d)); G.set(k, { parents: ust, content: d }); return k }
  const degis = (c: string, i: number, s: string) => { const d = [...G.get(c)!.content]; d[i] = s; return commit([c], d) }
  const c1 = commit([], BASE_FILE)
  const c2 = degis(c1, 0, 'HIZ = 0.6')
  const a1 = degis(c2, 5, '  if r.lidar < ESIK: r.dur()')
  const a2 = degis(a1, 1, 'ESIK = 0.25')
  const b1 = degis(c2, 2, 'PIL_MIN = 11.1')
  const b2 = conflict ? degis(b1, 1, 'ESIK = 0.40') : degis(b1, 6, '  r.git(HIZ, PIL_MIN)')
  const atalar = (c: string): Set<string> => { const s = new Set([c]); for (const u of G.get(c)!.parents) for (const x of atalar(u)) s.add(x); return s }
  const A = atalar(b2), B = atalar(a2)
  const common = [...A].filter((k) => B.has(k))
  const base = common.reduce((m, k) => (atalar(k).size > atalar(m).size ? k : m))
  const O = G.get(base)!.content, Am = G.get(b2)!.content, Bm = G.get(a2)!.content
  const R: Array<string | null> = O.map((x, i) => { const a = Am[i], b = Bm[i]; return b === x || b === a ? a : a === x ? b : null })
  const conflicts = R.flatMap((r, i) => (r === null ? [i] : []))
  const merged = conflicts.length ? null : commit([b2, a2], R as string[])
  return { G, ids: { c1, c2, a1, a2, b1, b2 }, A, B, common, base, O, Am, Bm, R, conflicts, merged, atalar }
}

const diff = (a: string[], b: string[]) => b.flatMap((s, i) => (s !== a[i] ? [i] : []))

export const GIT_DALLARI: Lesson<GitFrame> = {
  slug: 'git-dallari',
  n: 0,
  title: { tr: 'Git: commit, dal ve birleştirme', en: 'Git: commits, branches and merging' },
  sub: { tr: 'İki geliştirici aynı robot yazılımına aynı anda özellik ekliyor', en: 'Two developers add features to the same robot software at once' },
  story: {
    tr: "Robotun hareket kodu robot.py 7 satır. Ayşe 'engel' dalında LiDAR engel kontrolü ekliyor (2 commit), Can aynı sırada main dalında pil sınırını ekliyor (2 commit). İkisi de aynı commit'ten (hız 0,6) yola çıktı. Akşam iki dal birleşecek: Git hangi satırı kimden alacağını nasıl biliyor, ikisi aynı satırı değiştirdiyse ne oluyor?",
    en: "The robot's motion code, robot.py, is 7 lines. Ayşe adds a LiDAR obstacle check on the 'engel' branch (2 commits) while Can adds a battery limit on main (2 commits). Both started from the same commit (speed 0.6). Tonight the branches merge: how does Git know which line to take from whom, and what happens if both changed the same line?",
  },
  how: [
    { tr: "Commit, dosyanın o anki tam hâli ve ebeveyninin kimliğidir. Kimliği bu ikisinin özetidir (hash): içerik bir harf değişse kimlik de değişir.", en: "A commit is the full state of the file plus its parent's id. Its id is a digest (hash) of both: change one letter and the id changes." },
    { tr: "Dal yalnızca bir commit'e işaretçidir; yeni dal açmak kopya yapmaz. HEAD, şu an hangi dalda çalıştığımızı gösterir.", en: 'A branch is just a pointer to a commit; creating one copies nothing. HEAD shows which branch we are working on.' },
    { tr: "Birleştirmede Git iki ucun atalarını çıkarır, ortak olanların en yenisini (ortak ata) bulur ve her satıra bakar: yalnız bir taraf değiştirdiyse onu alır.", en: 'To merge, Git lists the ancestors of both tips, picks the newest shared one (the common ancestor) and checks each line: if only one side changed it, that side wins.' },
    { tr: "İki taraf aynı satırı farklı biçimde değiştirdiyse Git karar veremez: çakışma bildirir ve bir insanın seçmesini bekler.", en: 'If both sides changed the same line differently Git cannot decide: it reports a conflict and waits for a human to choose.' },
    { tr: "Şunu dene: senaryoyu 1 (çakışmalı) yap; Can da ESIK satırını değiştirir ve birleştirme o satırda durur.", en: 'Try this: set the scenario to 1 (conflict); Can also edits the ESIK line and the merge stops on that line.' },
  ],
  why: {
    tr: "Robot ekiplerinde algılama, kontrol ve arayüz kodunu farklı kişiler aynı anda yazar; dallar herkesin işini ayrı tutar, birleştirme hepsini tek sürümde toplar. Aynı satırı iki kişinin değiştirmesi gerçek bir anlaşmazlıktır: Git bunu sessizce çözmek yerine durdurur, çünkü yanlış eşik değeri sahada çarpışma demektir.",
    en: 'In robotics teams different people write perception, control and UI code at the same time; branches keep each piece of work apart and merging brings them into one version. Two people editing the same line is a real disagreement: Git stops instead of guessing, because a wrong threshold means a crash in the field.',
  },
  file: 'git_dallari.py',
  code: [
    ['def ozet(s, h=0):', 'basit özet (hash)', 'simple digest (hash)'],
    ['    for ch in s: h = (h * 31 + ord(ch)) % 2**32'],
    ["    return format(h, '08x')[:7]", '7 haneli kimlik', '7-digit id'],
    ['G = {}', "kimlik -> (ebeveynler, içerik)", 'id -> (parents, content)'],
    ['def commit(ust, d):'],
    ['    G[k := ozet(str(ust) + str(d))] = (ust, d); return k', 'içerik + ebeveyn', 'content + parent'],
    ['def degis(c, i, s):'],
    ['    d = list(G[c][1]); d[i] = s; return commit([c], d)', 'bir satırı değiştir', 'change one line'],
    ['def atalar(c):'],
    ['    return {c}.union(*[atalar(u) for u in G[c][0]])', 'kendisi + ataları', 'itself + ancestors'],
    ["D = ['HIZ = 0.5', 'ESIK = 0.30', 'PIL_MIN = 0.0',", 'robot.py', 'robot.py'],
    ["     'def adim(r):', '  r.oku()', '  pass', '  r.git(HIZ)']"],
    ["main = degis(commit([], D), 0, 'HIZ = 0.6')", 'iki commit', 'two commits'],
    ["engel = degis(main, 5, '  if r.lidar < ESIK: r.dur()')", 'Ayşe: yeni dal', 'Ayşe: new branch'],
    ["engel = degis(engel, 1, 'ESIK = 0.25')"],
    ["main = degis(main, 2, 'PIL_MIN = 11.1')", 'Can: main', 'Can: main'],
    ['CAKISMA = False', 'kaydırıcı: senaryo', 'slider: scenario'],
    ["main = degis(main, 1, 'ESIK = 0.40') if CAKISMA else \\"],
    ["    degis(main, 6, '  r.git(HIZ, PIL_MIN)')"],
    ['ortak = atalar(main) & atalar(engel)'],
    ['o = max(ortak, key=lambda k: len(atalar(k)))', 'en yeni ortak ata', 'newest common ancestor'],
    ["R = [a if b in (x, a) else b if a == x else '<<<'", 'üç yönlü', 'three-way'],
    ['     for x, a, b in zip(G[o][1], G[main][1], G[engel][1])]'],
    ['print(o, R)'],
  ],
  params: [{ key: 'scenario', label: { tr: 'Senaryo (0 çakışmasız, 1 çakışmalı)', en: 'Scenario (0 clean, 1 conflict)' }, min: 0, max: 1, step: 1, value: 0 }],
  run({ scenario = 0 }) {
    const conf = scenario >= 0.5
    const S = gitScenario(conf)
    const { ids, G } = S
    const mk = (id: string, lane: number, col: number, who: number, msg: Cap): GitCommit => {
      const g = G.get(id)!
      const par = g.parents[0] ? G.get(g.parents[0])!.content : g.content
      return { id, parents: g.parents, content: g.content, lane, col, who, msg, changed: g.parents.length ? diff(par, g.content) : [] }
    }
    const commits: GitCommit[] = [
      mk(ids.c1, 0, 0, -1, cap('iskelet', 'skeleton')),
      mk(ids.c2, 0, 1, -1, cap('hız 0,6', 'speed 0.6')),
      mk(ids.a1, 1, 2, 1, cap('engelde dur', 'stop at obstacle')),
      mk(ids.a2, 1, 3, 1, cap('eşik 0,25', 'threshold 0.25')),
      mk(ids.b1, 0, 2, 0, cap('pil sınırı', 'battery limit')),
      mk(ids.b2, 0, 3, 0, conf ? cap('eşik 0,40', 'threshold 0.40') : cap('pille sür', 'drive with battery')),
    ]
    if (S.merged) commits.push({ ...mk(S.merged, 0, 4, -1, cap('birleştir', 'merge')), changed: diff(S.Am, S.R as string[]) })
    const F: GitFrame[] = []
    const stat = cap(conf ? 'senaryo: çakışmalı' : 'senaryo: çakışmasız', conf ? 'scenario: conflict' : 'scenario: clean')
    let shown = 0
    let refs: GitFrame['refs'] = { main: null, engel: null }
    let head: GitFrame['head'] = 'main'
    const push = (f: Partial<GitFrame> & { line: number; cap: Cap }) => F.push({ commits, shown, refs, head, stat, ...f })
    const title = (c: GitCommit): Cap => cap(`robot.py @ ${c.id}`, `robot.py @ ${c.id}`)

    push({ line: 10, file: BASE_FILE, fileTitle: cap('robot.py (henüz commit yok)', 'robot.py (no commit yet)'), cap: cap('robotun hareket kodu: 7 satır', "the robot's motion code: 7 lines"), hold: 2 })
    push({ line: 11, file: BASE_FILE, fileTitle: cap('robot.py: hız, eşik, pil sınırı, adım fonksiyonu', 'robot.py: speed, threshold, battery limit, step function'), cap: cap('her satır bir liste elemanı', 'each line is one list item'), hold: 1.2 })
    push({ line: 3, file: BASE_FILE, fileTitle: cap('depo boş: G = {}', 'empty repository: G = {}'), cap: cap('depo: kimlik → (ebeveynler, içerik)', 'repository: id → (parents, content)'), hold: 1.2 })
    push({ line: 0, file: BASE_FILE, hash: { s: pyList([]) + pyList(BASE_FILE), upto: 0, h: 0 }, cap: cap('özet: metni tek bir sayıya sıkıştır', 'digest: squeeze the text into one number'), hold: 1.5 })
    // 1) özet (hash) adım adım
    const s0 = pyList([]) + pyList(BASE_FILE)
    const chars = [...s0]
    let h = 0
    const marks = [1, 2, 3, 4, 6, 9, 12, 18, 25, 32, 40, 48, 55, 62, 70, 78, 85, 92, 97, chars.length]
    let mi = 0
    chars.forEach((ch, i) => {
      h = (h * 31 + ch.codePointAt(0)!) % 4294967296
      if (i + 1 === marks[mi]) {
        mi++
        const early = mi <= 3
        push({ line: 1, file: BASE_FILE, hash: { s: s0, upto: i + 1, h }, cap: cap(`özet: ${i + 1}/${chars.length} karakter`, `digest: ${i + 1}/${chars.length} characters`), hold: early ? 1.4 : 0.5 })
      }
    })
    push({ line: 2, file: BASE_FILE, hash: { s: s0, upto: chars.length, h }, cap: cap(`kimlik: ${ids.c1}`, `id: ${ids.c1}`), hold: 1.5 })
    shown = 1
    push({ line: 5, file: commits[0].content, fileTitle: title(commits[0]), cap: cap(`ilk commit ${ids.c1}: ebeveyni yok`, `first commit ${ids.c1}: no parent`), hold: 1.5 })
    // 2) ikinci commit, main işaretçisi
    const c2 = commits[1]
    push({ line: 7, file: c2.content, hl: c2.changed, fileTitle: cap('kopya, satır 0 değişti', 'copy, line 0 changed'), cap: cap('kopyala, bir satırı değiştir', 'copy, change one line'), hold: 1.2 })
    shown = 2; refs = { main: c2.id, engel: null }
    push({ line: 12, file: c2.content, hl: c2.changed, fileTitle: title(c2), cap: cap(`main → ${c2.id} (ebeveyn ${ids.c1})`, `main → ${c2.id} (parent ${ids.c1})`), hold: 1.5 })
    // 3) Ayşe dal açar
    refs = { main: c2.id, engel: c2.id }; head = 'engel'
    push({ line: 13, file: c2.content, fileTitle: title(c2), cap: cap('yeni dal = aynı commit\'e ikinci işaretçi', 'new branch = a second pointer to the same commit'), hold: 2 })
    const [a1, a2, b1, b2] = commits.slice(2, 6)
    push({ line: 7, file: a1.content, hl: a1.changed, fileTitle: cap('Ayşe: satır 5', 'Ayşe: line 5'), cap: cap('Ayşe engel kontrolünü yazar', 'Ayşe writes the obstacle check'), hold: 1 })
    shown = 3; refs = { ...refs, engel: a1.id }
    push({ line: 13, file: a1.content, hl: a1.changed, fileTitle: title(a1), cap: cap(`engel → ${a1.id}; main yerinde`, `engel → ${a1.id}; main stays`), hold: 1.3 })
    shown = 4; refs = { ...refs, engel: a2.id }
    push({ line: 14, file: a2.content, hl: a2.changed, fileTitle: title(a2), cap: cap(`engel → ${a2.id}: eşik 0,25`, `engel → ${a2.id}: threshold 0.25`), hold: 1.3 })
    // 4) Can main üzerinde
    head = 'main'
    push({ line: 15, file: c2.content, fileTitle: title(c2), cap: cap('Can main dalında; Ayşe\'nin işini görmüyor', "Can is on main; he does not see Ayşe's work"), hold: 1.3 })
    shown = 5; refs = { ...refs, main: b1.id }
    push({ line: 15, file: b1.content, hl: b1.changed, fileTitle: title(b1), cap: cap(`main → ${b1.id}: pil sınırı`, `main → ${b1.id}: battery limit`), hold: 1.2 })
    shown = 6; refs = { ...refs, main: b2.id }
    push({ line: conf ? 17 : 18, file: b2.content, hl: b2.changed, fileTitle: title(b2), cap: conf ? cap(`main → ${b2.id}: Can de ESIK'i değiştirdi`, `main → ${b2.id}: Can changed ESIK too`) : cap(`main → ${b2.id}: son satır`, `main → ${b2.id}: last line`), hold: 1.5 })
    // 5) atalar ve ortak ata
    const walk = (tip: string) => { const out: string[] = []; let c: string | undefined = tip; while (c) { out.push(c); c = G.get(c)!.parents[0] } return out }
    const wa = walk(b2.id), wb = walk(a2.id)
    wa.forEach((_, i) => push({ line: 9, ancA: wa.slice(0, i + 1), file: b2.content, fileTitle: title(b2), cap: cap(`main'in ataları: ${i + 1}`, `ancestors of main: ${i + 1}`), hold: i < 2 ? 0.9 : 0.5 }))
    wb.forEach((_, i) => push({ line: 9, ancA: wa, ancB: wb.slice(0, i + 1), file: a2.content, fileTitle: title(a2), cap: cap(`engel'in ataları: ${i + 1}`, `ancestors of engel: ${i + 1}`), hold: i < 2 ? 0.9 : 0.5 }))
    push({ line: 19, ancA: wa, ancB: wb, common: S.common, file: a2.content, fileTitle: title(a2), cap: cap(`ortak atalar: ${S.common.join(', ')}`, `common ancestors: ${S.common.join(', ')}`), hold: 1.5 })
    const baseC = commits.find((c) => c.id === S.base)!
    push({ line: 20, common: S.common, base: S.base, file: baseC.content, fileTitle: title(baseC), cap: cap(`ortak ata = ${S.base} (en yenisi)`, `common ancestor = ${S.base} (the newest)`), hold: 2 })
    // 6) satır satır üç yönlü birleştirme
    const why = (i: number): Cap => {
      const x = S.O[i], a = S.Am[i], b = S.Bm[i]
      if (a === x && b === x) return cap(`satır ${i}: kimse değiştirmedi`, `line ${i}: nobody changed it`)
      if (b === x) return cap(`satır ${i}: yalnız Can değiştirdi → Can'ınki`, `line ${i}: only Can changed it → Can's`)
      if (a === x) return cap(`satır ${i}: yalnız Ayşe değiştirdi → Ayşe'ninki`, `line ${i}: only Ayşe changed it → Ayşe's`)
      if (a === b) return cap(`satır ${i}: ikisi de aynı değişikliği yaptı`, `line ${i}: both made the same change`)
      return cap(`satır ${i}: ikisi de farklı değiştirdi → çakışma!`, `line ${i}: both changed it differently → conflict!`)
    }
    for (let i = 0; i < S.O.length; i++) {
      const mv = (decided: boolean): MergeView => ({ O: S.O, A: S.Am, B: S.Bm, R: S.R, row: i, decided })
      push({ line: 21, base: S.base, merge: mv(false), cap: cap(`satır ${i}: ata, Can, Ayşe karşılaştırılıyor`, `line ${i}: comparing ancestor, Can, Ayşe`), hold: i < 2 ? 1 : 0.6 })
      push({ line: 22, base: S.base, merge: mv(true), cap: why(i), hold: S.R[i] === null ? 2 : i < 2 ? 1.2 : 0.8 })
    }
    // 7) sonuç
    if (S.merged) {
      const m = commits[6]
      shown = 7; refs = { main: m.id, engel: a2.id }
      push({ line: 23, base: S.base, file: m.content, hl: m.changed, fileTitle: title(m), cap: cap(`birleştirme commit'i ${m.id}: iki ebeveyn`, `merge commit ${m.id}: two parents`), stat: cap('iki özellik de dosyada: engel + pil', 'both features are in the file: obstacle + battery'), hold: 3 })
    } else {
      const text: string[] = []
      const rows: number[] = []
      S.R.forEach((r, i) => {
        if (r !== null) { text.push(r); return }
        rows.push(text.length)
        text.push('<<<<<<< main (Can)', S.Am[i], '=======', S.Bm[i], '>>>>>>> engel (Ayşe)')
      })
      push({ line: 23, base: S.base, conflict: { rows, text }, cap: cap(`çakışma: satır ${S.conflicts.join(', ')} · birleştirme durdu`, `conflict: line ${S.conflicts.join(', ')} · merge stopped`), stat: cap('Can ile Ayşe hangi eşiği seçecek?', 'Which threshold will Can and Ayşe choose?'), hold: 3 })
    }
    return F
  },
}
