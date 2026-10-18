// Ders: CI/CD hattı. Robot yazılımının her commit'i derleme → birim test → entegrasyon → hazırlık → üretim yolundan geçer;
// hatalı commit bir testte durur, testlerden kaçan saha hatası canary'de (%10 filo) yakalanır ve geri alınır.
import { cap, rng, type Frame, type Lesson } from './core'

export type BugType = 'yok' | 'derleme' | 'birim' | 'entegre' | 'saha'
export interface CiCommit {
  id: string
  /** Sıra numarası (0'dan). */
  n: number
  bug: BugType
  /** Durduğu aşama: 1 derleme, 2 birim, 3 entegrasyon, 4 hazırlık, 5 canary (geri alındı), 6 üretime tam çıktı. */
  stopAt: number
  /** Canary: 20 robotun her birinde 50 görevdeki hata sayısı ve toplam oran. */
  errs?: number[]
  rate?: number
}
export interface CiFrame extends Frame {
  commits: CiCommit[]
  /** Şu an hattaki commit (commits dizinindeki sıra); -1: başlamadı. */
  cur: number
  /** Şu anki aşama (0 commit … 6 üretim). */
  stage: number
  status: 'run' | 'pass' | 'fail'
  /** Üretim yayılımı: 0, 10, 50, 100 (%). */
  rollout: number
  rolledBack?: boolean
  /** Filoda tam yayılmış sürüm sayısı. */
  version: number
  done?: boolean
}

export const STAGES = 6
const CATCH: Record<BugType, number[]> = { yok: [0, 0, 0, 0], derleme: [1, 0, 0, 0], birim: [0, 0.85, 0.7, 0.5], entegre: [0, 0, 0.8, 0.5], saha: [0, 0, 0, 0] }
const TYPES: BugType[] = ['derleme', 'birim', 'entegre', 'saha']
const PT = [0.25, 0.35, 0.25, 0.15]
export const THRESH = 0.02
export const N_COMMITS = 14

export function pipeline(hata: number, seed: number): CiCommit[] {
  const r = rng(seed * 7919 + 11)
  const out: CiCommit[] = []
  for (let c = 0; c < N_COMMITS; c++) {
    const id = Math.floor(r() * 0xfffffff).toString(16).padStart(7, '0')
    let bug: BugType = 'yok'
    if (r() < hata) { let u = r(), j = 0; while (j < 3 && u >= PT[j]) { u -= PT[j]; j++ } bug = TYPES[j] }
    let stopAt = 0
    for (let s = 0; s < 4; s++) if (r() < CATCH[bug][s]) { stopAt = s + 1; break }
    if (stopAt) { out.push({ id, n: c, bug, stopAt }); continue }
    // canary: 20 robot × 50 görev
    const p = bug !== 'yok' ? 0.1 : 0.005
    const errs: number[] = []
    let tot = 0
    for (let i = 0; i < 20; i++) { let e = 0; for (let g = 0; g < 50; g++) if (r() < p) e++; errs.push(e); tot += e }
    const rate = tot / 1000
    out.push({ id, n: c, bug, stopAt: rate < THRESH ? 6 : 5, errs, rate })
  }
  return out
}

const STN: Array<[string, string]> = [['commit', 'commit'], ['derleme', 'build'], ['birim test', 'unit tests'], ['entegrasyon', 'integration'], ['hazırlık', 'staging'], ['üretim', 'production']]
const BUGN: Record<BugType, [string, string]> = { yok: ['hatasız', 'clean'], derleme: ['derleme hatası', 'build error'], birim: ['mantık hatası', 'logic bug'], entegre: ['entegrasyon hatası', 'integration bug'], saha: ['yalnız sahada görülen hata', 'field-only bug'] }

export const CI_CD_HATTI: Lesson<CiFrame> = {
  slug: 'ci-cd-hatti',
  n: 0,
  title: { tr: 'CI/CD hattı ve kademeli dağıtım', en: 'CI/CD pipeline and staged rollout' },
  sub: { tr: 'Robot yazılımı güncellemesi testlerden ve canary filodan geçerek dağıtılıyor', en: 'A robot software update reaches the fleet through tests and a canary group' },
  story: {
    tr: "200 robotluk bir depo filosunun yazılım ekibi günde 14 commit gönderiyor; bunların yaklaşık %30'unda bir hata var. Her commit otomatik olarak derlenir, birim testleri ve simülasyonda entegrasyon testi koşar, 3 test robotlu hazırlık ortamına çıkar. Geçen sürüm önce filonun %10'una (20 robot) gider: 50'şer görevde hata oranı %2'yi aşarsa otomatik geri alınır, aşmazsa %50'ye ve %100'e yayılır.",
    en: "The software team of a 200-robot warehouse fleet pushes 14 commits a day; about 30% of them contain a bug. Every commit is built automatically, runs unit tests and an integration test in simulation, then goes to a staging area with 3 test robots. A passing version first goes to 10% of the fleet (20 robots): if the error rate over 50 missions each exceeds 2% it is rolled back automatically, otherwise it spreads to 50% and 100%.",
  },
  how: [
    { tr: 'Sürekli entegrasyon (CI): her commit ana depoya girer girmez derlenir ve testlerden geçer; hata, yazıldığı gün bulunur.', en: 'Continuous integration (CI): every commit is built and tested as soon as it reaches the main repository; a bug is found the day it is written.' },
    { tr: 'Her aşama bir eleğe benzer: derleme sözdizimi hatasını kesin yakalar, birim ve entegrasyon testleri mantık hatalarının çoğunu yakalar. Bir aşama kırmızıysa commit orada durur, sonraki aşamalara gitmez.', en: 'Each stage is a sieve: the build always catches syntax errors, unit and integration tests catch most logic bugs. A red stage stops the commit there; it never moves on.' },
    { tr: 'Sürekli teslim (CD): testi geçen sürüm kendiliğinden yayılır ama kademeli: önce %10 (canary). Canary robotlarındaki hata oranı eşiği aşarsa sürüm geri alınır.', en: 'Continuous delivery (CD): a version that passes the tests rolls out by itself, but in stages: first 10% (the canary). If the canary robots exceed the error threshold the version is rolled back.' },
    { tr: 'Testlerden kaçan hata bile tüm filoya ulaşmaz: yalnız 20 robot kısa süre etkilenir.', en: 'Even a bug that slips past every test never reaches the whole fleet: only 20 robots are affected, briefly.' },
    { tr: "Şunu dene: hatalı commit oranını 0,6'ya çıkar; kırmızı kutular artar ama üretime yine yalnız hatasız sürümler çıkar. Tohumu değiştir, saha hatasının canary'de geri alındığını gör.", en: 'Try this: raise the bug rate to 0.6; more boxes turn red but only clean versions reach production. Change the seed to see a field bug rolled back at the canary stage.' },
  ],
  why: {
    tr: "Otonom araç, drone ve depo robotu şirketleri yazılımı haftada birçok kez günceller; tek bir hatalı sürüm tüm filoyu durdurabilir. Bu yüzden simülasyon testleri, donanımlı test tezgâhı (HIL) ve canary dağıtım standarttır; geri alma düğmesi de otomatik olmalıdır, çünkü gece 3'te kimse uyanık değildir.",
    en: 'Autonomous vehicle, drone and warehouse robot companies update software several times a week; one bad release can halt the whole fleet. That is why simulation tests, hardware-in-the-loop benches and canary rollouts are standard, and the rollback must be automatic, because nobody is awake at 3 am.',
  },
  file: 'ci_cd.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(4)'],
    ['HATA = 0.3', 'hatalı commit oranı', 'share of buggy commits'],
    ["TUR = ['derleme', 'birim', 'entegre', 'saha']", 'hata türleri', 'bug types'],
    ["YAKALAR = {'yok': [0, 0, 0, 0],", 'derleme, birim, entegr., hazırlık', 'build, unit, integr., staging'],
    ["    'derleme': [1, 0, 0, 0], 'birim': [0, .85, .7, .5],", 'yakalama olasılığı', 'catch probability'],
    ["    'entegre': [0, 0, .8, .5], 'saha': [0, 0, 0, 0]}", 'saha: testler görmez', 'field: tests miss it'],
    ['def canary(hatali):', '20 robot × 50 görev (%10)', '20 robots × 50 missions (10%)'],
    ['    oran = 0.10 if hatali else 0.005'],
    ['    return (rng.random((20, 50)) < oran).mean() < 0.02', 'eşik %2', 'threshold 2%'],
    ['uretim, geri = [], 0'],
    ['for c in range(14):', 'günün commit\'leri', "the day's commits"],
    ["    tur = 'yok'"],
    ['    if rng.random() < HATA:'],
    ['        tur = rng.choice(TUR, p=[.25, .35, .25, .15])', 'gizli hata', 'hidden bug'],
    ['    if any(rng.random() < p for p in YAKALAR[tur]):', 'aşamalar sırayla', 'stages in order'],
    ["        print(c, tur, 'testte durdu'); continue", 'kırmızı: dur', 'red: stop'],
    ['    if not canary(tur != \'yok\'):', '%10 filoya çık', 'go to 10% of fleet'],
    ["        geri += 1; print(c, tur, 'canary: geri'); continue", 'geri al', 'roll back'],
    ['    uretim.append(tur)', '%50 → %100', '50% → 100%'],
    ["print('üretim:', uretim, 'geri alma:', geri)"],
    ["assert all(t == 'yok' for t in uretim)", 'hatalı sürüm üretimde yok', 'no buggy version in production'],
  ],
  params: [
    { key: 'hata', label: { tr: 'Hatalı commit oranı', en: 'Buggy commit rate' }, min: 0, max: 0.8, step: 0.05, value: 0.3 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 50, step: 1, value: 2 },
  ],
  run({ hata = 0.3, seed = 2 }) {
    const commits = pipeline(hata, seed)
    const F: CiFrame[] = []
    const pctS = (x: number) => (100 * x).toFixed(1)
    let version = 0
    const stat0 = cap(`hatalı oran ${hata.toFixed(2).replace('.', ',')} · tohum ${seed}`, `bug rate ${hata.toFixed(2)} · seed ${seed}`)
    const push = (f: Omit<CiFrame, 'commits' | 'version' | 'stat'> & { stat?: CiFrame['stat'] }) => F.push({ commits, version, stat: stat0, ...f })
    push({ cur: -1, stage: 0, status: 'run', rollout: 0, line: 4, cap: cap('hat: derleme → birim → entegrasyon → hazırlık → üretim', 'pipeline: build → unit → integration → staging → production'), hold: 2.2 })
    push({ cur: -1, stage: 0, status: 'run', rollout: 0, line: 7, cap: cap('canary: önce filonun %10\'u (20 robot)', 'canary: first 10% of the fleet (20 robots)'), hold: 1.6 })
    for (const c of commits) {
      const slow = c.n < 2
      const h = (x: number) => (slow ? x : x * 0.5)
      const label = cap(`commit #${c.n + 1} ${c.id}`, `commit #${c.n + 1} ${c.id}`)
      push({ cur: c.n, stage: 0, status: 'run', rollout: 0, line: c.bug === 'yok' ? 12 : 14, cap: cap(`${label[0]}: hattaki ilk adım`, `${label[1]}: enters the pipeline`), hold: h(1.3) })
      const lastTest = c.stopAt <= 4 ? c.stopAt : 4
      for (let s = 1; s <= lastTest; s++) {
        const fail = s === c.stopAt
        push({ cur: c.n, stage: s, status: 'run', rollout: 0, line: 15, cap: cap(`${label[0]} · ${STN[s][0]} koşuyor`, `${label[1]} · running ${STN[s][1]}`), hold: h(0.8) })
        if (fail) push({ cur: c.n, stage: s, status: 'fail', rollout: 0, line: 16, cap: cap(`${STN[s][0]} kırmızı: ${BUGN[c.bug][0]} · commit durdu`, `${STN[s][1]} red: ${BUGN[c.bug][1]} · commit stopped`), hold: h(2) })
        else if (slow || s === 4) push({ cur: c.n, stage: s, status: 'pass', rollout: 0, line: 15, cap: cap(`${STN[s][0]} yeşil`, `${STN[s][1]} green`), hold: h(0.8) })
      }
      if (c.stopAt <= 4) continue
      const rs = `%${pctS(c.rate!).replace('.', ',')}`, re = `${pctS(c.rate!)}%`
      push({ cur: c.n, stage: 5, status: 'run', rollout: 10, line: 17, cap: cap(`canary: 20 robot × 50 görev · hata ${rs}`, `canary: 20 robots × 50 missions · errors ${re}`), stat: cap(`eşik %2`, 'threshold 2%'), hold: h(1.8) })
      if (c.stopAt === 5) {
        push({ cur: c.n, stage: 5, status: 'fail', rollout: 10, rolledBack: true, line: 18, cap: cap(`hata ${rs} > %2 → otomatik geri alma (${BUGN[c.bug][0]})`, `errors ${re} > 2% → automatic rollback (${BUGN[c.bug][1]})`), stat: cap('etkilenen: yalnız 20 robot', 'affected: only 20 robots'), hold: h(2.6) })
        continue
      }
      push({ cur: c.n, stage: 6, status: 'run', rollout: 50, line: 19, cap: cap(`hata ${rs} < %2 → filonun %50'si`, `errors ${re} < 2% → 50% of the fleet`), hold: h(1) })
      version++
      push({ cur: c.n, stage: 6, status: 'pass', rollout: 100, line: 19, cap: cap(`üretimde: filo sürüm v1.${version}`, `in production: fleet version v1.${version}`), hold: h(1.2) })
    }
    const prod = commits.filter((c) => c.stopAt === 6)
    const back = commits.filter((c) => c.stopAt === 5).length
    const stopped = commits.filter((c) => c.stopAt <= 4).length
    push({ cur: -1, stage: 0, status: 'pass', rollout: 0, done: true, line: 20, cap: cap(`${prod.length} sürüm üretimde · ${stopped} testte durdu · ${back} geri alındı`, `${prod.length} versions in production · ${stopped} stopped in tests · ${back} rolled back`), hold: 2 })
    const bad = prod.filter((c) => c.bug !== 'yok').length
    push({ cur: -1, stage: 0, status: 'pass', rollout: 0, done: true, line: 21, cap: cap(`üretimdeki hatalı sürüm: ${bad}`, `buggy versions in production: ${bad}`), hold: 3 })
    return F
  },
}
