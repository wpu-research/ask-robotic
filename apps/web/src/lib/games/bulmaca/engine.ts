// Bulmaca motoru: blok programı bir hayvan "kurar"; zafer = kurulan hayvan karttakiyle birebir aynı.
import { HaltProgram, type BlockCtx, type BlockHandler, type RunApi } from '../interpreter'
import type { GameRun, LevelDef } from '../types'
import { COLORS, FEATURE_INFO, FEATURE_ORDER, featureCount, firstDifference, firstDifferenceEn, makeFeatures, type Card, type ColorKey, type Features, type FeatureKey } from './features'

export interface PuzzleLevelData {
  cards: Card[]
  /** true: program her kart için ayrı çalışır ("her kart için" bloğu); false: tek kart. */
  multi?: boolean
}

export interface PuzzleState {
  cards: Card[]
  multi: boolean
  /** Şu anki kartın sırası. */
  index: number
  target: Features
  targetTitle: string
  /** Kart başlığının İngilizcesi (yoksa Türkçesi). */
  targetTitleEn: string
  built: Features
  /** Kart başına sonuç (null: henüz bakılmadı). */
  results: (boolean | null)[]
  /** "her özellik için" döngüsünün şu anki özelliği. */
  current: FeatureKey | null
  /** Son uyarı (fazla parça gibi). */
  error: string | null
  /** Son eklenen parça (sahne animasyonu için). */
  lastAdded: string | null
  /** Eklemeler sayacı (sahne anahtarı). */
  tick: number
}

const FEATURE_KEYS = new Set<string>(FEATURE_ORDER)
const isFeatureKey = (s: unknown): s is FeatureKey => typeof s === 'string' && FEATURE_KEYS.has(s)
const isColorKey = (s: unknown): s is ColorKey => typeof s === 'string' && s in COLORS

const PLURAL_MSG: Record<FeatureKey, string> = {
  BACAK: 'Bir hayvanın en fazla 8 bacağı olabilir!',
  KANAT: 'Bir hayvanın en fazla 2 kanadı olur!',
  GOZ: 'Bir hayvanın en fazla 2 gözü olur!',
  KULAK: 'Bir hayvanın en fazla 2 kulağı olur!',
  GAGA: 'Bir hayvanın tek gagası olur!',
  KUYRUK: 'Bir hayvanın tek kuyruğu olur!',
  BIYIK: 'Bıyıklar bir kere eklenir!',
}
const PLURAL_MSG_EN: Record<FeatureKey, string> = {
  BACAK: 'An animal can have at most 8 legs!',
  KANAT: 'An animal has at most 2 wings!',
  GOZ: 'An animal has at most 2 eyes!',
  KULAK: 'An animal has at most 2 ears!',
  GAGA: 'An animal has only one beak!',
  KUYRUK: 'An animal has only one tail!',
  BIYIK: 'Whiskers are added only once!',
}

export function createPuzzleRun(level: LevelDef): GameRun<PuzzleState> {
  const data = level.data as PuzzleLevelData
  const cards = data.cards
  const multi = !!data.multi
  const st: PuzzleState = {
    cards, multi, index: 0, target: cards[0].f, targetTitle: cards[0].title, targetTitleEn: cards[0].titleEn ?? cards[0].title, built: makeFeatures({}),
    results: cards.map(() => null), current: null, error: null, lastAdded: null, tick: 0,
  }

  const card = () => cards[st.index]
  const add = (k: FeatureKey, n = 1): void => {
    const info = FEATURE_INFO[k]
    for (let i = 0; i < n; i++) {
      if (featureCount(st.built, k) >= info.max) { st.error = PLURAL_MSG[k]; throw new HaltProgram(PLURAL_MSG[k], PLURAL_MSG_EN[k]) }
      if (typeof st.built[info.prop] === 'boolean') (st.built as unknown as Record<string, unknown>)[info.prop] = true
      else (st.built as unknown as Record<string, number>)[info.prop] += 1
      st.lastAdded = k
      st.tick++
    }
    st.error = null
  }
  const addOne = (k: FeatureKey): BlockHandler => () => add(k)
  const intN = (c: BlockCtx, name: string): number => Math.max(0, Math.min(20, Math.floor(c.num(name, 0))))
  const needCurrent = (): FeatureKey => {
    if (!st.current) throw new HaltProgram('Bu blok yalnızca "her özellik için" bloğunun içinde çalışır.', 'This block only works inside the "for each feature" block.')
    return st.current
  }
  /** Yorumlayıcıya "bir an göster" adımı: sahne anlık görüntüyü yeniler. */
  const pause = (c: BlockCtx) => ({ blockId: c.id, type: c.type, wait: true, step: 0 })

  const blocks: Record<string, BlockHandler> = {
    bulmaca_bacak: addOne('BACAK'),
    bulmaca_kanat: addOne('KANAT'),
    bulmaca_goz: addOne('GOZ'),
    bulmaca_kulak: addOne('KULAK'),
    bulmaca_gaga: addOne('GAGA'),
    bulmaca_kuyruk: addOne('KUYRUK'),
    bulmaca_biyik: addOne('BIYIK'),
    bulmaca_bacak_n: (c) => add('BACAK', intN(c, 'N')),
    bulmaca_goz_n: (c) => add('GOZ', intN(c, 'N')),
    bulmaca_boya: (c) => { const v = c.field('RENK'); if (isColorKey(v)) st.built.color = v; st.lastAdded = 'RENK'; st.tick++ },
    bulmaca_ad: (c) => { st.built.name = String(c.field('AD') ?? '').slice(0, 24); st.lastAdded = 'AD'; st.tick++ },
    bulmaca_boya_kart: () => { st.built.color = card().f.color; st.lastAdded = 'RENK'; st.tick++ },
    bulmaca_ad_kart: () => { st.built.name = card().f.name; st.lastAdded = 'AD'; st.tick++ },
    bulmaca_ekle_bu: () => add(needCurrent()),
    bulmaca_kartta_var: (c) => { const k = c.field('OZ'); return isFeatureKey(k) && featureCount(card().f, k) > 0 },
    bulmaca_kart_say: (c) => { const k = c.field('OZ'); return isFeatureKey(k) ? featureCount(card().f, k) : 0 },
    bulmaca_kart_say_bu: () => featureCount(card().f, needCurrent()),
    bulmaca_her_ozellik: function* (c: BlockCtx) {
      for (const k of FEATURE_ORDER) {
        st.current = k
        yield* c.statements('DO')
      }
      st.current = null
    },
    bulmaca_her_kart: function* (c: BlockCtx) {
      for (let i = 0; i < cards.length; i++) {
        st.index = i
        st.target = cards[i].f
        st.targetTitle = cards[i].title
        st.targetTitleEn = cards[i].titleEn ?? cards[i].title
        st.built = makeFeatures({})
        st.current = null
        st.error = null
        st.lastAdded = null
        yield pause(c) // yeni kart görünsün
        yield* c.statements('DO')
        const diff = firstDifference(cards[i].f, st.built)
        st.results[i] = diff === null
        st.tick++
        yield pause(c) // sonuç görünsün
        if (diff !== null) { st.error = `${i + 1}. kart: ${diff}`; throw new HaltProgram(st.error, `Card ${i + 1}: ${firstDifferenceEn(cards[i].f, st.built)}`) }
      }
    },
  }

  const api: RunApi = { hats: ['bulmaca_basla'], blocks }
  return {
    api,
    snapshot: () => structuredClone(st),
    evaluate: (result) => {
      if (multi) {
        if (st.results.every((r) => r === true)) return { ok: true, message: 'Bütün kartları doğru yaptın!', messageEn: 'You got every card right!' }
        if (result.reason === 'halted' && result.message) return { ok: false, message: result.message, messageEn: result.messageEn }
        return { ok: false, message: 'Programın her kart için çalışmalı: blokları "her kart için" bloğunun içine koy.', messageEn: 'Your program must run for every card: put the blocks inside the "for each card" block.' }
      }
      if (result.reason === 'halted' && result.message) return { ok: false, message: result.message, messageEn: result.messageEn }
      if (result.reason !== 'finished') return { ok: false, message: result.message ?? 'Program tamamlanamadı.', messageEn: result.message ? result.messageEn : 'The program could not finish.' }
      const diff = firstDifference(card().f, st.built)
      if (diff === null) { st.results[0] = true; return { ok: true, message: 'Hayvanın karttakiyle birebir aynı!', messageEn: 'Your animal is exactly the same as the card!' } }
      st.results[0] = false
      return { ok: false, message: diff, messageEn: firstDifferenceEn(card().f, st.built) ?? undefined }
    },
    stepDelay: (info) => (info.type === 'bulmaca_her_kart' ? 700 : undefined),
  }
}
