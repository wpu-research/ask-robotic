// Ders: DDoS ve hız sınırı. Robot filosunun bulut sunucusu saniyede 100 istek işler; 20 bot saldırı patlaması yapar.
// İstemci başına jeton kovası, botları kapıda durdurur: kuyruk meşru robotlara kalır. İki senaryo aynı istek akışıyla yan yana.
import { cap, fmt, rng, type Frame, type Lesson } from './core'

export interface RateSeries {
  /** Adım sonunda kuyruk uzunluğu ve içindeki meşru istek sayısı. */
  q: number[]
  ql: number[]
  /** Kapıdan geçen meşru / saldırı istekleri (adım başına). */
  inL: number[]
  inB: number[]
  /** Kova reddi ve kuyruk dolu diye düşen istekler. */
  dropB: number[]
  dropQ: number[]
  /** Son 1 s içinde meşru isteklerin kabul oranı. */
  succ: number[]
  /** Örnek bir botun ve örnek bir robotun kovasındaki jeton. */
  tokBot: number[]
  tokRob: number[]
}
export interface HizSim {
  free: RateSeries
  lim: RateSeries
  /** Adım başına üretilen meşru / saldırı istekleri (iki senaryoda aynı). */
  genL: number[]
  genB: number[]
  steps: number
  dt: number
  t0: number
  t1: number
  capacity: number
  qmax: number
  kova: number
  siddet: number
  /** Saldırı süresince meşru isteklerin kabul oranı. */
  okFree: number
  okLim: number
}
export interface HizFrame extends Frame {
  S: HizSim
  k: number
  /** Vurgu: 0 sunucu, 1 istemciler, 2 kova. */
  focus?: number
  done?: boolean
}

const ROBOTS = 50, BOTS = 20, CAP = 100, QMAX = 150, DT = 0.1, REFILL = 2, STEPS = 600, T0 = 10, T1 = 40

function poisson(r: () => number, lam: number): number {
  if (lam <= 0) return 0
  const L = Math.exp(-lam)
  let k = 0, prod = r()
  while (prod > L) { k++; prod *= r() }
  return k
}
/** a meşru + b saldırı arasından n tanesini sırasız seç: kaçı meşru? */
function hyper(r: () => number, a: number, b: number, n: number): number {
  let good = 0
  for (let i = 0; i < n; i++) { if (r() * (a + b) < a) { good++; a-- } else b-- }
  return good
}

export function simulate(siddet: number, kova: number, seed = 7): HizSim {
  const r = rng(seed)
  const N = ROBOTS + BOTS
  // istek üretimi: iki senaryo aynı akışı görür
  const gen: Int16Array[] = []
  const genL: number[] = [], genB: number[] = []
  for (let k = 0; k < STEPS; k++) {
    const t = k * DT, atk = t >= T0 && t < T1
    const n = new Int16Array(N)
    let gl = 0, gb = 0
    for (let i = 0; i < N; i++) {
      n[i] = poisson(r, i < ROBOTS ? DT : atk ? (siddet / BOTS) * DT : 0)
      if (i < ROBOTS) gl += n[i]; else gb += n[i]
    }
    gen.push(n); genL.push(gl); genB.push(gb)
  }
  const run = (limit: boolean, rr: () => number) => {
    const tok = new Float64Array(N).fill(kova)
    const S: RateSeries = { q: [], ql: [], inL: [], inB: [], dropB: [], dropQ: [], succ: [], tokBot: [], tokRob: [] }
    let q = 0, ql = 0
    const okL: number[] = []
    for (let k = 0; k < STEPS; k++) {
      const n = gen[k]
      let a = 0, b = 0, rej = 0
      for (let i = 0; i < N; i++) {
        tok[i] = Math.min(kova, tok[i] + REFILL * DT)
        let m = n[i]
        if (limit) { const allow = Math.min(m, Math.floor(tok[i])); rej += m - allow; m = allow; tok[i] -= m }
        if (i < ROBOTS) a += m; else b += m
      }
      const take = Math.min(a + b, QMAX - q)
      const good = take > 0 ? hyper(rr, a, b, take) : 0
      q += take; ql += good
      const serve = Math.min(q, CAP * DT)
      const sl = q > 0 ? Math.round((serve * ql) / q) : 0
      q -= serve; ql -= sl
      okL.push(good)
      S.q.push(q); S.ql.push(ql); S.inL.push(a); S.inB.push(b); S.dropB.push(rej); S.dropQ.push(a + b - take)
      S.tokBot.push(tok[ROBOTS]); S.tokRob.push(tok[0])
      let so = 0, ss = 0
      for (let j = Math.max(0, k - 9); j <= k; j++) { so += okL[j]; ss += genL[j] }
      S.succ.push(ss ? so / ss : 1)
    }
    let so = 0, ss = 0
    for (let k = T0 / DT; k < T1 / DT; k++) { so += okL[k]; ss += genL[k] }
    return { S, ok: ss ? so / ss : 1 }
  }
  const A = run(false, rng(seed + 1)), B = run(true, rng(seed + 1))
  return { free: A.S, lim: B.S, genL, genB, steps: STEPS, dt: DT, t0: T0, t1: T1, capacity: CAP, qmax: QMAX, kova, siddet, okFree: A.ok, okLim: B.ok }
}

const pct = (x: number) => Math.round(100 * x)

export const HIZ_SINIRI: Lesson<HizFrame> = {
  slug: 'hiz-siniri',
  n: 0,
  title: { tr: 'DDoS saldırısı ve hız sınırı', en: 'DDoS attacks and rate limiting' },
  sub: { tr: 'Jeton kovası, filonun sunucusunu bot selinden korur', en: "A token bucket shields the fleet's server from a bot flood" },
  story: {
    tr: "50 teslimat robotu konumlarını ve görev isteklerini saniyede birer kez bulut sunucusuna yollar; sunucu saniyede 100 istek işleyebilir, bekleme kuyruğu 150 istek alır. 10. saniyede 20 bot saniyede toplam 400 istekle saldırır ve bu 30 s sürer. Kuyruk dolunca sunucu hangi isteğin robottan geldiğini ayırmadan düşürür: robotlar görev alamaz.",
    en: 'Fifty delivery robots send their position and task requests to the cloud server once a second; the server handles 100 requests per second and its waiting queue holds 150. At second 10, 20 bots attack with 400 requests per second in total, for 30 s. Once the queue is full the server drops requests without knowing which came from a robot: the robots cannot get tasks.',
  },
  how: [
    { tr: 'Sunucunun bir kapasitesi vardır. Gelen istek bunu aşarsa kuyruk dolar; dolu kuyruğa gelen istek düşer.', en: 'A server has a capacity. When requests exceed it the queue fills, and requests arriving at a full queue are dropped.' },
    { tr: 'Sınır yokken düşme kör olur: 450 isteğin 100\'ü geçer, meşru robotlar da aynı oranda (yaklaşık %22) kaybeder.', en: 'Without a limit dropping is blind: 100 of 450 requests get through, and the robots lose at the same rate (about 22%).' },
    { tr: 'Jeton kovası: her istemcinin kovası saniyede 2 jetonla dolar; her istek bir jeton harcar, jetonu olmayanın isteği kapıda reddedilir. Robotlar saniyede 1 istekle hiç takılmaz, botlar saniyede 2\'ye iner.', en: "Token bucket: each client's bucket refills at 2 tokens per second; each request spends one, and requests without a token are rejected at the door. Robots at 1 per second never notice, bots drop to 2 per second." },
    { tr: 'Kova boyu ani patlamaya ne kadar izin verildiğini belirler: büyük kova saldırının ilk saniyesinde kuyruğu doldurur, çok küçük kova meşru robotları da keser.', en: 'The bucket size sets how big a burst is allowed: a large bucket lets the first second of the attack fill the queue, a tiny one cuts off the robots too.' },
    { tr: 'Şunu dene: kova boyunu 1 yap, robotların başarısı düşer; 40 yap, saldırının başında kuyruk dolup taşar.', en: 'Try this: set the bucket to 1 and the robots suffer; set it to 40 and the queue overflows at the start of the attack.' },
  ],
  why: {
    tr: "Bulut API'leri, harita sunucuları ve robot filosu yönetim panelleri istemci başına hız sınırıyla korunur; aynı kova, tek bir hatalı robotun döngüye girip sunucuyu boğmasını da önler. Botlar çok sayıda adresten yavaş yavaş gelirse istemci başına sınır yetmez; o zaman ağ düzeyinde süzme ve kapasite artışı gerekir.",
    en: 'Cloud APIs, map servers and fleet dashboards are protected by per-client rate limits; the same bucket also stops a single buggy robot stuck in a loop from choking the server. If bots come slowly from very many addresses, per-client limits are not enough; then network-level filtering and more capacity are needed.',
  },
  file: 'hiz_siniri.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(7)'],
    ['C, QMAX, DT = 100, 150, 0.1', 'istek/s, kuyruk, s', 'req/s, queue, s'],
    ['IYI, KOTU, SIDDET = 50, 20, 400', 'robot, bot, saldırı istek/s', 'robots, bots, attack req/s'],
    ['KOVA, DOLUM = 5, 2.0', 'jeton, jeton/s', 'tokens, tokens/s'],
    ['hiz = np.r_[np.ones(IYI), np.full(KOTU, SIDDET / KOTU)]', 'istemci başına istek/s', 'req/s per client'],
    ['def benzet(sinir):'],
    ['    jeton = np.full(IYI + KOTU, float(KOVA))', 'her istemcinin kovası', 'one bucket per client'],
    ['    kuyruk, gonder, ok = 0, 0, 0'],
    ['    for k in range(300):', '30 s saldırı', '30 s attack'],
    ['        n = rng.poisson(hiz * DT)', 'bu 0,1 s içindeki istekler', 'requests in this 0.1 s'],
    ['        gonder += n[:IYI].sum()', 'meşru gönderilen', 'legitimate sent'],
    ['        jeton = np.minimum(KOVA, jeton + DOLUM * DT)', 'kova dolar', 'bucket refills'],
    ['        if sinir:'],
    ['            n = np.minimum(n, jeton.astype(int)); jeton -= n', 'jetonu olan geçer', 'only tokens pass'],
    ['        a, b = n[:IYI].sum(), n[IYI:].sum()'],
    ['        kabul = int(min(a + b, QMAX - kuyruk))', 'kuyrukta yer kadar', 'as many as fit'],
    ['        ok += kabul and rng.hypergeometric(a, b, kabul)', 'kör seçim', 'blind choice'],
    ['        kuyruk = max(0, kuyruk + kabul - int(C * DT))', 'sunucu 10 istek işler', 'server handles 10'],
    ['    return ok / gonder', 'meşru başarı oranı', 'legitimate success rate'],
    ["print('sınır yok   :', round(benzet(False), 3))", '≈ 0,22', '≈ 0.22'],
    ["print('jeton kovası:', round(benzet(True), 3))", '≈ 1,00', '≈ 1.00'],
  ],
  params: [
    { key: 'siddet', label: { tr: 'Saldırı şiddeti (istek/s)', en: 'Attack strength (req/s)' }, min: 0, max: 1000, step: 50, value: 400 },
    { key: 'kova', label: { tr: 'Kova boyu (jeton)', en: 'Bucket size (tokens)' }, min: 1, max: 40, step: 1, value: 5 },
  ],
  run({ siddet = 400, kova = 5 }) {
    const S = simulate(siddet, kova)
    const F: HizFrame[] = []
    const stat = cap(`saldırı ${siddet} istek/s · kova ${kova} jeton`, `attack ${siddet} req/s · bucket ${kova} tokens`)
    const push = (f: Omit<HizFrame, 'S' | 'stat'> & { stat?: HizFrame['stat'] }) => F.push({ S, stat, ...f })
    push({ k: 0, line: 2, focus: 0, cap: cap('sunucu: 100 istek/s, kuyruk 150', 'server: 100 req/s, queue 150'), hold: 2 })
    push({ k: 0, line: 3, focus: 1, cap: cap('50 robot saniyede 1 istek: toplam 50 istek/s', '50 robots, 1 request/s each: 50 req/s'), hold: 1.6 })
    push({ k: 0, line: 4, focus: 2, cap: cap(`her istemciye ${kova} jetonluk kova, saniyede 2 jeton`, `a ${kova}-token bucket per client, 2 tokens/s`), hold: 1.6 })
    const detail: Array<[number, [string, string]]> = [
      [10, ['0,1 s içinde gelen istekler', 'requests in this 0.1 s']],
      [12, ['kovalar dolar', 'buckets refill']],
      [14, ['jetonu olan geçer, olmayan kapıda kalır', 'requests with a token pass, the rest stop at the door']],
      [16, ['kuyrukta yer varsa kabul', 'accepted if the queue has room']],
      [18, ['sunucu bu adımda 10 istek işler', 'the server handles 10 requests this step']],
    ]
    for (const [line, c] of detail) push({ k: 0, line, cap: cap(c[0], c[1]), hold: 1.1 })
    for (let k = 5; k < S.steps; k += 5) {
      const t = k * S.dt
      const atk = t >= S.t0 && t < S.t1
      const a = S.free.succ[k], b = S.lim.succ[k]
      const c = atk
        ? cap(`t = ${fmt(t, 1, 'tr')} s · SALDIRI · meşru başarı: sınırsız %${pct(a)}, kova %${pct(b)}`, `t = ${t.toFixed(1)} s · ATTACK · legit success: no limit ${pct(a)}%, bucket ${pct(b)}%`)
        : cap(`t = ${fmt(t, 1, 'tr')} s · meşru başarı: sınırsız %${pct(a)}, kova %${pct(b)}`, `t = ${t.toFixed(1)} s · legit success: no limit ${pct(a)}%, bucket ${pct(b)}%`)
      const first = Math.abs(t - S.t0) < 1e-9
      push({ k, line: atk ? (k % 10 ? 17 : 14) : 18, cap: c, hold: first ? 2 : atk && t < S.t0 + 2 ? 0.9 : 0.35 })
    }
    const last = S.steps - 1
    push({ k: last, line: 19, done: true, cap: cap('saldırı boyunca meşru isteklerin kaçı kabul edildi?', 'what share of legitimate requests got in during the attack?'), hold: 1.5 })
    push({ k: last, line: 20, done: true, cap: cap(`sınır yok: meşru başarı %${pct(S.okFree)}`, `no limit: legitimate success ${pct(S.okFree)}%`), hold: 1.5 })
    push({ k: last, line: 21, done: true, cap: cap(`jeton kovası: %${pct(S.okLim)} · sınırsız: %${pct(S.okFree)}`, `token bucket: ${pct(S.okLim)}% · no limit: ${pct(S.okFree)}%`), hold: 3 })
    return F
  },
}
