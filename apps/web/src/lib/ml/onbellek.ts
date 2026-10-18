// Ders: önbellek (LRU). Robot gezerken bulunduğu harita karosunu sunucudan ister (80 ms); son kullanılan karolar yerelde
// tutulursa (2 ms) gecikme düşer. Yer dolunca en uzun süredir kullanılmayan karo atılır; boyut büyüdükçe isabet oranı azalmaz.
import { cap, fmt, rng, type Frame, type Lesson } from './core'

export const COLS = 8, ROWS = 5, HIT_MS = 2, MISS_MS = 80, REQS = 120

export interface CacheFrame extends Frame {
  /** Robotun istediği karolar (y·8 + x), paylaşılan. */
  req: number[]
  /** Şu anki istek (−1: henüz yok). */
  t: number
  size: number
  /** Önbellekteki karolar, en yeniden en eskiye. */
  slots: number[]
  hit?: boolean
  evicted?: number
  hits: number
  done: number
  /** Toplam gecikme (ms). */
  ms: number
  /** Boyut 1–12 için isabet oranı (paylaşılan). */
  curve: number[]
  final?: boolean
}

export const tileName = (id: number) => `${String.fromCharCode(65 + (id % COLS))}${Math.floor(id / COLS) + 1}`

/** Robotun yürüyüşü: her adımda dur ya da dört komşudan birine geç (ızgara 8×5); her adımda bulunduğu karoyu ister. */
export function walk(seed = 1, n = REQS): number[] {
  const r = rng(seed)
  const mv = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]
  let x = 3, y = 2
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const [dx, dy] = mv[Math.floor(r() * 5)]
    x = Math.min(Math.max(x + dx, 0), COLS - 1); y = Math.min(Math.max(y + dy, 0), ROWS - 1)
    out.push(y * COLS + x)
  }
  return out
}

export interface LruStep { t: number; hit: boolean; evicted?: number; slots: number[] }
/** LRU önbellek: her istekten sonra yuvaların durumu (en yeni başta). */
export function lru(req: readonly number[], size: number) {
  let slots: number[] = []
  let hits = 0
  const steps: LruStep[] = []
  for (const t of req) {
    const i = slots.indexOf(t)
    let evicted: number | undefined
    if (i >= 0) { hits++; slots = [t, ...slots.slice(0, i), ...slots.slice(i + 1)] }
    else {
      slots = [t, ...slots]
      if (slots.length > size) evicted = slots.pop()
    }
    steps.push({ t, hit: i >= 0, evicted, slots })
  }
  return { steps, hits, rate: req.length ? hits / req.length : 0 }
}
export const avgMs = (rate: number) => HIT_MS * rate + MISS_MS * (1 - rate)

export const ONBELLEK: Lesson<CacheFrame> = {
  slug: 'onbellek',
  n: 0,
  title: { tr: 'Önbellek (LRU)', en: 'Caching (LRU)' },
  sub: { tr: 'Harita karolarını yakında tutmak: biraz bellek, çok hız', en: 'Keeping map tiles close: a little memory, a lot of speed' },
  story: {
    tr: "Depoda dolaşan robot, haritayı 8×5 = 40 karoya bölünmüş olarak sunucudan çekiyor. Her adımda bulunduğu karoyu istiyor: sunucudan gelmesi 80 ms, robotun kendi belleğinden okunması 2 ms. Robot 120 adım yürüyor ve çoğu zaman yakın karolara geri dönüyor. Bellekte yalnız birkaç karoya yer var: hangisini tutmalı?",
    en: 'A warehouse robot fetches its map from a server, split into 8×5 = 40 tiles. At every step it requests the tile it is on: 80 ms from the server, 2 ms from its own memory. The robot walks 120 steps and keeps returning to nearby tiles. Its memory holds only a few tiles: which ones should it keep?',
  },
  how: [
    { tr: 'İstenen karo önbellekteyse isabet: 2 ms, karo listenin başına (en yeni) taşınır.', en: 'If the requested tile is in the cache it is a hit: 2 ms, and the tile moves to the front (most recent).' },
    { tr: 'Yoksa ıska: 80 ms bekleyip sunucudan çekilir, listenin başına eklenir.', en: 'Otherwise it is a miss: we wait 80 ms for the server and put the tile at the front.' },
    { tr: 'Yer dolduysa listenin sonundaki, en uzun süredir kullanılmayan (LRU) karo atılır. Yakın geçmişte kullanılan, yakın gelecekte yine kullanılır: zamansal yerellik.', en: 'If the cache is full, the tile at the end, the least recently used (LRU), is evicted. What was used recently will likely be used again soon: temporal locality.' },
    { tr: 'LRU’da büyük önbellek, küçüğün tuttuğu her şeyi de tutar; bu yüzden boyut arttıkça isabet oranı hiç düşmez. Ama robotun hiç görmediği karolar için ilk istek her zaman ıskadır.', en: 'With LRU a larger cache always holds everything a smaller one holds, so the hit rate never drops as the size grows. But the first request for a tile the robot has never seen is always a miss.' },
    { tr: 'Şunu dene: önbellek boyunu 1’den 4’e çıkar; ortalama gecikme ~50 ms’den ~30 ms’ye iner. 8’den sonra eğri düzleşir: geri kalan ıskalar robotun ilk kez gördüğü karolar.', en: 'Try this: raise the cache size from 1 to 4; the average latency drops from ~50 ms to ~30 ms. Beyond 8 the curve flattens: the remaining misses are tiles the robot sees for the first time.' },
  ],
  why: {
    tr: "İşlemcinin L1/L2 önbellekleri, web tarayıcıları, CDN'ler, veritabanı tamponları ve robotlarda harita karoları, çıkarım sonuçları ve dönüşüm ağaçları hep aynı fikirle çalışır. Bedeli bayatlıktır: sunucudaki harita güncellenirse önbellekteki kopya eskir; bu yüzden gerçek sistemler ayrıca bir yaşam süresi (TTL) koyar.",
    en: 'CPU L1/L2 caches, web browsers, CDNs, database buffers, and on robots map tiles, inference results and transform trees all run on the same idea. The price is staleness: if the map on the server changes, the cached copy is outdated, which is why real systems also set a time-to-live (TTL).',
  },
  file: 'onbellek.py',
  code: [
    ['import numpy as np'],
    ['from collections import OrderedDict', 'sıralı sözlük', 'ordered dict'],
    ['rng = np.random.default_rng(3)'],
    ['x, y, req = 3, 2, []', 'haritanın ortası', 'map centre'],
    ['moves = [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)]', 'dur ya da komşuya geç', 'stay or step'],
    ['for _ in range(120):', 'robot 120 adım yürür', 'the robot walks 120 steps'],
    ['    dx, dy = moves[rng.integers(5)]'],
    ['    x, y = min(max(x + dx, 0), 7), min(max(y + dy, 0), 4)', '8×5 karo', '8×5 tiles'],
    ['    req.append((x, y))', 'karoyu iste', 'request the tile'],
    ['def lru(size):'],
    ['    cache, hits = OrderedDict(), 0', 'baş: en eski, son: en yeni', 'head: oldest, tail: newest'],
    ['    for t in req:'],
    ['        if t in cache:'],
    ['            hits += 1', 'isabet: 2 ms', 'hit: 2 ms'],
    ['            cache.move_to_end(t)', 'en yeni yap', 'make it newest'],
    ['        else:'],
    ['            cache[t] = "karo"', 'ıska: sunucudan 80 ms', 'miss: 80 ms from server'],
    ['            if len(cache) > size:'],
    ['                cache.popitem(last=False)', 'en eskiyi at', 'evict the oldest'],
    ['    return hits / len(req)'],
    ['for s in (1, 2, 4, 8, 12):'],
    ['    h = lru(s)', 'isabet oranı', 'hit rate'],
    ['    print(s, round(h, 2), round(2*h + 80*(1-h), 1), "ms")', 'ortalama gecikme', 'average latency'],
  ],
  params: [{ key: 'size', label: { tr: 'Önbellek boyu (karo)', en: 'Cache size (tiles)' }, min: 1, max: 12, step: 1, value: 4 }],
  run({ size = 4 }) {
    size = Math.max(1, Math.min(12, Math.round(size)))
    const req = walk()
    const curve = Array.from({ length: 12 }, (_, k) => lru(req, k + 1).rate)
    const L = lru(req, size)
    const base = { req, size, curve }
    const F: CacheFrame[] = []
    const stat0 = cap(`önbellek ${size} karo · isabet 2 ms, ıska 80 ms`, `cache ${size} tiles · hit 2 ms, miss 80 ms`)
    F.push({ ...base, t: -1, slots: [], hits: 0, done: 0, ms: 0, line: 8, cap: cap(`robotun yolu: ${REQS} karo isteği, 40 karoluk harita`, `the robot's path: ${REQS} tile requests, a 40-tile map`), stat: stat0, hold: 2 })
    F.push({ ...base, t: -1, slots: [], hits: 0, done: 0, ms: 0, line: 10, cap: cap('önbellek boş', 'the cache is empty'), stat: stat0, hold: 1.5 })
    let hits = 0, ms = 0
    L.steps.forEach((s, i) => {
      if (s.hit) hits++
      ms += s.hit ? HIT_MS : MISS_MS
      const st = { ...base, t: i, slots: s.slots, hit: s.hit, evicted: s.evicted, hits, done: i + 1, ms }
      const nm = tileName(s.t)
      const c = s.hit ? cap(`istek ${i + 1}: ${nm} → isabet (2 ms)`, `request ${i + 1}: ${nm} → hit (2 ms)`)
        : cap(`istek ${i + 1}: ${nm} → ıska (80 ms)${s.evicted !== undefined ? `, ${tileName(s.evicted)} atıldı` : ''}`, `request ${i + 1}: ${nm} → miss (80 ms)${s.evicted !== undefined ? `, ${tileName(s.evicted)} evicted` : ''}`)
      const stt = cap(`isabet %${Math.round((100 * hits) / (i + 1))} · ortalama ${fmt(ms / (i + 1), 1, 'tr')} ms`, `hit rate ${Math.round((100 * hits) / (i + 1))}% · average ${(ms / (i + 1)).toFixed(1)} ms`)
      if (i < 6) {
        const prev = i ? L.steps[i - 1].slots : []
        F.push({ ...st, slots: prev, hit: undefined, evicted: undefined, line: 12, cap: cap(`istek ${i + 1}: ${nm} önbellekte mi?`, `request ${i + 1}: is ${nm} in the cache?`), stat: stt, hold: 1 })
        F.push({ ...st, line: s.hit ? 14 : s.evicted !== undefined ? 18 : 16, cap: c, stat: stt, hold: 1.3 })
      } else F.push({ ...st, line: s.hit ? 14 : s.evicted !== undefined ? 18 : 16, cap: c, stat: stt, hold: i < 16 ? 0.7 : 0.3 })
    })
    const fin = { ...base, t: REQS - 1, slots: L.steps[REQS - 1].slots, hit: L.steps[REQS - 1].hit, hits, done: REQS, ms, final: true }
    F.push({ ...fin, line: 19, cap: cap(`isabet oranı %${Math.round(100 * L.rate)} (${hits}/${REQS})`, `hit rate ${Math.round(100 * L.rate)}% (${hits}/${REQS})`),
      stat: cap(`ortalama gecikme ${fmt(avgMs(L.rate), 1, 'tr')} ms (önbelleksiz 80 ms)`, `average latency ${avgMs(L.rate).toFixed(1)} ms (80 ms without a cache)`), hold: 2 })
    F.push({ ...fin, line: 22, cap: cap(`boyut 1 → 12: isabet %${Math.round(100 * curve[0])} → %${Math.round(100 * curve[11])}, hiç düşmez`, `size 1 → 12: hit rate ${Math.round(100 * curve[0])}% → ${Math.round(100 * curve[11])}%, never drops`),
      stat: cap(`ortalama ${fmt(avgMs(curve[0]), 1, 'tr')} → ${fmt(avgMs(curve[11]), 1, 'tr')} ms`, `average ${avgMs(curve[0]).toFixed(1)} → ${avgMs(curve[11]).toFixed(1)} ms`), hold: 3 })
    return F
  },
}
