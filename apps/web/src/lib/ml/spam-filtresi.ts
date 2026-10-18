// Ders: Naive Bayes ile spam süzgeci (kelime sayan, "multinomial" naive Bayes). Atölyenin ortak e-posta kutusu: 400 e-posta,
// yarısı spam; aralarında zor olanlar var (iş yazışması gibi görünen spam, üye olunan mağazanın bülteni). Her kelimenin spam'de ve
// normal postada kaç kez geçtiği sayılır, +1 eklenir, iki oranın logaritması kelimenin puanıdır; e-postanın puanı kelimelerin toplamı.
// Kelimeler dizinle tutulur; Türkçe ve İngilizce sözlük aynı sırada olduğu için iki dilde de model ve sayılar birebir aynıdır.
import { cap, fmt, rng, type Frame, type Lesson, shifted } from './core'
import { B, ogrenmeEgrisi, siniflandirmaBlok, type EgitimRaporu } from './egitim/rapor'
import { accuracy } from './egitim/metrics'

/** [Türkçe, İngilizce] kelime çiftleri; dört grup: spam, kişisel, bülten, nötr. */
const SP: Array<[string, string]> = [['hemen', 'now'], ['tıkla', 'click'], ['ücretsiz', 'free'], ['kazan', 'win'], ['ödül', 'prize'], ['şimdi', 'instantly'], ['bedava', 'bonus'], ['tebrikler', 'congratulations'], ['onayla', 'confirm'], ['kredi', 'loan'], ['şans', 'lucky'], ['hediye', 'gift'], ['link', 'link'], ['kazandın', 'won'], ['acil', 'urgent']]
const NO: Array<[string, string]> = [['yarın', 'tomorrow'], ['toplantı', 'meeting'], ['öğle', 'lunch'], ['yemek', 'dinner'], ['rapor', 'report'], ['kahve', 'coffee'], ['akşam', 'evening'], ['proje', 'project'], ['notlar', 'notes'], ['görüşelim', 'talk'], ['hocam', 'professor'], ['ödev', 'homework'], ['robot', 'robot'], ['müsait', 'available'], ['sunum', 'slides']]
const NL: Array<[string, string]> = [['indirim', 'discount'], ['kampanya', 'campaign'], ['yeni', 'new'], ['sezon', 'season'], ['abonelik', 'subscription'], ['mağaza', 'store'], ['ürün', 'product'], ['fırsat', 'deal'], ['sipariş', 'order'], ['koleksiyon', 'collection']]
const NE: Array<[string, string]> = [['bir', 'a'], ['bu', 'this'], ['için', 'for'], ['ve', 'and'], ['bugün', 'today'], ['hafta', 'week'], ['mi', 'is'], ['gibi', 'like'], ['sen', 'you'], ['biz', 'we'], ['teşekkürler', 'thanks'], ['merhaba', 'hello']]

/** Bütün sözlük: WORDS[i] = [tr, en]. */
export const WORDS: Array<[string, string]> = [...SP, ...NO, ...NL, ...NE]
const off = { SP: 0, NO: SP.length, NL: SP.length + NO.length, NE: SP.length + NO.length + NL.length }
const ix = (tr: string) => { const i = WORDS.findIndex((w) => w[0] === tr); if (i < 0) throw new Error(tr); return i }

/** E-posta türleri: 0 spam, 1 kılık değiştirmiş spam, 2 kişisel, 3 bülten. 0 ve 1 spam'dir. */
export type Kind = 0 | 1 | 2 | 3
export const KIND_NAMES: Array<[string, string]> = [['spam', 'spam'], ['kılık değiştirmiş spam', 'disguised spam'], ['kişisel', 'personal'], ['bülten', 'newsletter']]
export interface Mail { w: number[]; kind: Kind; spam: boolean }

/** 400 e-posta (160 spam, 40 kılık değiştirmiş spam, 160 kişisel, 40 bülten), karıştırılmış; ilk 300 eğitim, son 100 test. */
export function inbox(seed = 16): Mail[] {
  const r = rng(seed)
  const ri = (n: number) => Math.floor(r() * n)
  const pick = (o: number, n: number, k: number) => Array.from({ length: k }, () => o + ri(n))
  const mk = (kind: Kind): Mail => {
    let w: number[]
    if (kind === 0) w = [...pick(off.SP, SP.length, 3 + ri(3)), ...pick(off.NE, NE.length, 1 + ri(3)), ...pick(off.NL, NL.length, ri(2))]
    else if (kind === 2) w = [...pick(off.NO, NO.length, 3 + ri(3)), ...pick(off.NE, NE.length, 1 + ri(3))]
    else if (kind === 3) w = [...pick(off.NL, NL.length, 3 + ri(3)), ...pick(off.NE, NE.length, 1 + ri(2)), ...pick(off.SP, SP.length, ri(2))]
    else w = [...pick(off.NO, NO.length, 3 + ri(2)), ...pick(off.NE, NE.length, 1 + ri(2)), ...pick(off.SP, SP.length, 1)]
    for (let i = w.length - 1; i > 0; i--) { const j = ri(i + 1); [w[i], w[j]] = [w[j], w[i]] }
    return { w, kind, spam: kind === 0 || kind === 1 }
  }
  const plan: Array<[Kind, number]> = [[0, 160], [1, 40], [2, 160], [3, 40]]
  const M = plan.flatMap(([k, n]) => Array.from({ length: n }, () => mk(k)))
  for (let i = M.length - 1; i > 0; i--) { const j = ri(i + 1); [M[i], M[j]] = [M[j], M[i]] }
  return M
}

export interface SpamModel { cs: number[]; cn: number[]; ts: number; tn: number; vocab: boolean[]; V: number }
/** Sayar: her kelimenin spam'de ve normal postada kaç kez geçtiği; toplamlara sözlük boyu eklenir (+1 ekleme). */
export function fitSpam(train: Mail[]): SpamModel {
  const cs = new Array<number>(WORDS.length).fill(0), cn = new Array<number>(WORDS.length).fill(0)
  for (const m of train) for (const w of m.w) (m.spam ? cs : cn)[w]++
  const vocab = cs.map((c, i) => c + cn[i] > 0)
  const V = vocab.filter(Boolean).length
  return { cs, cn, ts: cs.reduce((a, b) => a + b, 0) + V, tn: cn.reduce((a, b) => a + b, 0) + V, vocab, V }
}
/** Kelimenin spam puanı: sıfırın üstü spam'e, altı normale işaret eder; sözlükte yoksa null (atlanır). */
export const wordScore = (M: SpamModel, w: number): number | null => (M.vocab[w] ? Math.log((M.cs[w] + 1) / M.ts) - Math.log((M.cn[w] + 1) / M.tn) : null)
export const mailScore = (M: SpamModel, words: number[]): number => words.reduce((s, w) => s + (wordScore(M, w) ?? 0), 0)
export const isSpam = (M: SpamModel, words: number[], t = 0) => mailScore(M, words) > t

/** Sahnede tek tek yargılanan dört örnek: açık spam, kişisel, kılık değiştirmiş spam, bülten. */
export const EXAMPLES: Array<{ w: number[]; kind: Kind }> = [
  { w: ['tebrikler', 'bu', 'hafta', 'bedava', 'hediye', 'kazandın', 'hemen', 'tıkla'].map(ix), kind: 0 },
  { w: ['merhaba', 'hocam', 'yarın', 'öğle', 'yemek', 'için', 'görüşelim', 'mi'].map(ix), kind: 2 },
  { w: ['yarın', 'toplantı', 'notlar', 'için', 'hemen', 'tıkla'].map(ix), kind: 1 },
  { w: ['yeni', 'sezon', 'indirim', 'kampanya', 'mağaza', 'fırsat'].map(ix), kind: 3 },
]

/** Test kümesinde tür başına [doğru, toplam]. */
export function evaluate(M: SpamModel, test: Mail[], t = 0) {
  const by = [0, 1, 2, 3].map((k) => { const g = test.filter((m) => m.kind === k); return [g.filter((m) => isSpam(M, m.w, t) === m.spam).length, g.length] as [number, number] })
  const ok = by.reduce((s, [a]) => s + a, 0)
  return { by, ok, n: test.length, acc: ok / test.length }
}

/**
 * Eğitim raporu: öğrenme eğrisi (ilk 50, 100, … 300 e-postayla sayılan model; eğitim ve test doğruluğu), tam modelin 100 test
 * e-postasında karışıklık matrisi, e-posta puanıyla (log oran toplamı) ROC ve kesinlik–duyarlılık, tür başına doğruluk ve en
 * güçlü kelime puanları. Eşik dersin "spam eşiği" parametresidir.
 */
export function spamReport({ esik = 0 }: Record<string, number>): EgitimRaporu {
  const all = inbox(), train = all.slice(0, 300), test = all.slice(300)
  const yOf = (S: Mail[]) => S.map((m) => (m.spam ? 1 : 0))
  const predOf = (M: SpamModel, S: Mail[]) => S.map((m) => (isSpam(M, m.w, esik) ? 1 : 0))
  const h = { n_train: [] as number[], train_acc: [] as number[], test_acc: [] as number[] }
  for (let n = 50; n <= 300; n += 50) {
    const M = fitSpam(train.slice(0, n))
    h.n_train.push(n); h.train_acc.push(accuracy(yOf(train.slice(0, n)), predOf(M, train.slice(0, n)))); h.test_acc.push(accuracy(yOf(test), predOf(M, test)))
  }
  const M = fitSpam(train)
  const blk = siniflandirmaBlok({
    y: yOf(test), pred: predOf(M, test), scores: test.map((m) => mailScore(M, m.w)), threshold: esik,
    labels: ['normal', 'spam'], pos: B('spam', 'spam'), neg: B('normal', 'normal'), prefix: 'test_', title: B('test', 'test'),
  })
  const ev = evaluate(M, test, esik)
  const ws = WORDS.map((_, i) => [i, wordScore(M, i)] as const).filter((x): x is readonly [number, number] => x[1] !== null).sort((a, b) => b[1] - a[1])
  const strong = [...ws.slice(0, 6), ...ws.slice(-6)]
  const trAcc = h.train_acc.at(-1)!
  return {
    kind: 'siniflandirma', model: 'multinomial naive Bayes (+1 ekleme)', seed: 16, hyper: { esik, train: 300, test: 100, vocab: M.V },
    history: { x: 'n_train', cols: h },
    final: [
      { key: 'train_acc', label: B('eğitim doğruluğu', 'training accuracy'), value: trAcc, fmt: 'pct' },
      ...blk.final,
      { key: 'gap', label: B('eğitim − test farkı', 'train − test gap'), value: trAcc - h.test_acc.at(-1)!, fmt: 3 },
    ],
    confusion: blk.confusion,
    scores: blk.scores,
    charts: [
      ogrenmeEgrisi(h.n_train, h.train_acc, h.test_acc, B('doğruluk', 'accuracy'), { yMin: 0.5, yMax: 1 }),
      { kind: 'bar', id: 'by-kind', title: B('Tür başına test doğruluğu', 'Test accuracy by kind'), labels: KIND_NAMES.map((k) => k[0]), yMin: 0, yMax: 1, series: [{ key: 'acc', label: B('doğruluk', 'accuracy'), values: ev.by.map(([a, n]) => (n ? a / n : NaN)), tone: 3 }] },
      { kind: 'bar', id: 'word-scores', title: B('En güçlü kelime puanları (log oran)', 'Strongest word scores (log ratio)'), labels: strong.map(([i]) => WORDS[i][0]), series: [{ key: 'score', label: B('puan', 'score'), values: strong.map(([, v]) => v), tone: 0 }] },
      ...blk.charts,
    ],
  }
}

export interface SpamFrame extends Frame {
  view: 'inbox' | 'counts' | 'smooth' | 'scores' | 'mail' | 'test'
  /** Gelen kutusu: her e-postanın türü ve eğitimde mi. */
  kinds?: Kind[]
  nTrain?: number
  /** En sık kelimeler: [kelime dizini, sayı]. */
  top?: { spam: Array<[number, number]>; normal: Array<[number, number]> }
  /** Kelime puanları: [kelime dizini, puan]. */
  scores?: Array<[number, number]>
  /** Yargılanan e-posta. */
  mail?: { w: number[]; s: Array<number | null>; total: number; kind: Kind; shown: number; t: number }
  /** Test sonucu: tür başına [doğru, toplam]. */
  by?: Array<[number, number]>
  acc?: number
}

export const SPAM_FILTRESI: Lesson<SpamFrame> = {
  slug: 'spam-filtresi',
  n: 0,
  title: { tr: 'Naive Bayes ile spam süzgeci', en: 'A spam filter with naive Bayes' },
  sub: { tr: 'Kelime saymak, +1 eklemek ve puanları toplamak: gelen kutusunu koruyan algoritma', en: 'Counting words, adding one and summing scores: the algorithm that guards your inbox' },
  story: {
    tr: "Robot atölyesinin ortak e-posta kutusu: 400 e-posta, yarısı spam. Aralarında zor olanlar da var: iş yazışması gibi görünen spam ('yarın toplantı notları için hemen tıkla') ve üye olunan mağazanın bülteni. Süzgeç yalnızca ilk 300 e-postanın etiketini görür; kalan 100 e-postayla sınanır.",
    en: "The robot workshop's shared mailbox: 400 e-mails, half of them spam. Some are tricky: spam dressed up as work mail ('tomorrow meeting notes, click now') and the newsletter of a shop you signed up to. The filter only sees the labels of the first 300 e-mails and is tested on the other 100.",
  },
  how: [
    { tr: 'Süzgeç eğitim e-postalarındaki her kelimenin spam’de ve normal postada kaç kez geçtiğini sayar. Eğitimin tamamı budur.', en: 'The filter counts how often each word appears in spam and in normal mail in the training e-mails. That is all the training there is.' },
    { tr: 'Her sayıya 1 eklenir (Laplace düzeltmesi): bir kelime spam’de hiç görülmediyse bile olasılığı sıfır olmaz ve tek bir kelime kararı kilitleyemez.', en: 'One is added to every count (Laplace smoothing): even a word never seen in spam does not get probability zero, so a single word cannot lock the decision.' },
    { tr: 'Kelimenin puanı iki oranın logaritmasıdır: log P(kelime | spam) − log P(kelime | normal). Sıfırın üstü spam’e, altı normale işaret eder.', en: 'A word’s score is the log of the two ratios: log P(word | spam) − log P(word | normal). Above zero points to spam, below to normal.' },
    { tr: '“Naive” varsayım: kelimeler birbirinden bağımsız sayılır, bu yüzden e-postanın puanı kelime puanlarının toplamıdır. Süzgeç cümleyi anlamaz; kılık değiştirmiş spam bu yüzden bazen kaçar.', en: 'The “naive” assumption: words are treated as independent, so an e-mail’s score is the sum of its word scores. The filter does not understand sentences, which is why disguised spam sometimes slips through.' },
    { tr: 'Şunu dene: spam eşiğini −4’e indir. Kılık değiştirmiş spam’in çoğu yakalanır ama bu kez mağaza bültenlerinin hepsi spam kutusuna düşer. Eşiği +2’ye çıkar: bültenler kurtulur, kılık değiştirmiş spam hep kaçar. Hiçbir eşik ikisini birden çözmez; süzgeç cümleyi değil kelimeyi görür.', en: 'Try this: lower the spam threshold to −4. Most disguised spam is caught, but now every shop newsletter lands in the spam folder. Raise it to +2: the newsletters are saved and disguised spam always slips through. No threshold fixes both; the filter sees words, not sentences.' },
  ],
  why: {
    tr: 'İlk ciddi spam süzgeçleri tam olarak bu birkaç satırdı ve bugün de metin sınıflandırmada ilk denenen yöntemdir: eğitimi bir sayım, tahmini bir toplamdır, binlerce kelimeyle bile anında çalışır. Aynı kod robotun hata günlüklerini “donanım / yazılım / ağ” diye ayırmak ya da kullanıcı komutlarını sınıflandırmak için de kullanılır. Sensör verisiyle çalışan Gauss sürümü bir önceki derste.',
    en: 'The first serious spam filters were exactly these few lines, and it is still the first thing people try for text classification: training is a count and prediction is a sum, instantly, even with thousands of words. The same code sorts robot error logs into “hardware / software / network” or classifies user commands. The Gaussian version for sensor data is in the previous lesson.',
  },
  file: 'spam_suzgeci.py',
  code: [
    ['import math'],
    ['from collections import Counter'],
    ['import numpy as np'],
    ['D = np.genfromtxt(\'spam-epostalar.csv\', delimiter=\',\', names=True, dtype=None, encoding=\'utf-8\')', '400 e-posta', '400 e-mails'],
    ['posta = [(m.split(), s == 1) for m, s in zip(D[\'metin\'], D[\'spam\'])]', '(kelimeler, spam_mi) çiftleri', '(words, is_spam) pairs'],
    ['egitim, test = posta[:300], posta[300:]', 'ilk 300 eğitim, son 100 test', 'first 300 training, last 100 test'],
    ['sayac = {True: Counter(), False: Counter()}'],
    ['for kelimeler, spam in egitim:'],
    ['    sayac[spam].update(kelimeler)', 'her kelimeyi say', 'count every word'],
    ['sozluk = set(sayac[True]) | set(sayac[False])'],
    ['toplam = {s: sum(c.values()) + len(sozluk) for s, c in sayac.items()}', '+1 ekleme', 'add-one smoothing'],
    ['def puan(k):'],
    ['    return math.log((sayac[True][k] + 1) / toplam[True]) - math.log((sayac[False][k] + 1) / toplam[False])', 'kelimenin spam puanı', "the word's spam score"],
    ['def spam_mi(kelimeler, esik=0.0):'],
    ['    return sum(puan(k) for k in kelimeler if k in sozluk) > esik', 'eşiğin üstü spam', 'above the threshold is spam'],
    ['dogru = sum(spam_mi(k) == s for k, s in test)'],
    ['print(dogru, "/", len(test))'],
    ['history = {\'n_train\': [], \'train_acc\': [], \'test_acc\': []}', 'öğrenme eğrisi: 50, 100, … 300 e-posta', 'learning curve: 50, 100, … 300 e-mails'],
    ['for n in range(50, 301, 50):'],
    ['    sayac = {True: Counter(), False: Counter()}', 'yalnız ilk n e-postayla yeniden say', 'recount with the first n e-mails only'],
    ['    for kelimeler, spam in egitim[:n]: sayac[spam].update(kelimeler)'],
    ['    sozluk = set(sayac[True]) | set(sayac[False])'],
    ['    toplam = {s: sum(c.values()) + len(sozluk) for s, c in sayac.items()}'],
    ['    basari = lambda kume: sum(spam_mi(k) == s for k, s in kume) / len(kume)'],
    ['    for k, v in zip(history, (n, basari(egitim[:n]), basari(test))): history[k].append(float(v))', 'son turda n = 300: tam model', 'last round n = 300: the full model'],
    ['skor = [sum(puan(k) for k in kel if k in sozluk) for kel, _ in test]', 'e-posta puanları (ROC için)', 'e-mail scores (for ROC)'],
    ['tp = sum(p > 0 and s for p, (_, s) in zip(skor, test)); fp = sum(p > 0 and not s for p, (_, s) in zip(skor, test))'],
    ['fn = sum(p <= 0 and s for p, (_, s) in zip(skor, test))'],
    ['for k, v in [(\'test_acc\', history[\'test_acc\'][-1]), (\'precision\', tp / max(tp + fp, 1)), (\'recall\', tp / max(tp + fn, 1))]:', 'son ölçümler tablosu', 'final metrics table'],
    ['    print(f\'{k:<10}{v:>10.4f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir eğitim büyüklüğü', 'one row per training size'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    for k in (\'train_acc\', \'test_acc\'): plt.plot(history[\'n_train\'], history[k], marker=\'o\', label=k)'],
    ['    plt.xlabel(\'n_train\'); plt.ylabel(\'accuracy\'); plt.legend(); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [{ key: 'esik', label: { tr: 'Spam eşiği', en: 'Spam threshold' }, min: -6, max: 3, step: 0.5, value: 0 }],
  report: spamReport,
  run({ esik = 0 }) {
    const all = inbox()
    const nTrain = 300
    const train = all.slice(0, nTrain), test = all.slice(300)
    const M = fitSpam(train)
    const F: SpamFrame[] = []
    const kinds = all.map((m) => m.kind)
    const nSpam = train.filter((m) => m.spam).length
    const stat = cap(`${nTrain} eğitim (${nSpam} spam) · 100 test · eşik ${fmt(esik, 1, 'tr')}`, `${nTrain} training (${nSpam} spam) · 100 test · threshold ${esik.toFixed(1)}`)
    F.push({ view: 'inbox', kinds, nTrain, line: 2, cap: cap('400 e-posta · yarısı spam', '400 e-mails · half of them spam'), stat, hold: 2 })
    const topOf = (c: number[]) => c.map((v, i) => [i, v] as [number, number]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 8)
    const top = { spam: topOf(M.cs), normal: topOf(M.cn) }
    F.push({ view: 'counts', top, line: 5, cap: cap('her kelime sayılır', 'every word is counted'), stat: cap(`sözlük: ${M.V} kelime`, `vocabulary: ${M.V} words`), hold: 2.2 })
    F.push({ view: 'smooth', top, line: 7, cap: cap('her sayıya +1: hiçbir kelime sıfır olmaz', '+1 on every count: no word gets zero'), stat: cap(`spam toplamı ${M.ts} · normal toplamı ${M.tn}`, `spam total ${M.ts} · normal total ${M.tn}`), hold: 2 })
    const scores = WORDS.map((_, i) => [i, wordScore(M, i)] as [number, number | null]).filter((x): x is [number, number] => x[1] !== null)
    const pickScores = [...scores].sort((a, b) => b[1] - a[1])
    const shown = [...pickScores.slice(0, 6), ...pickScores.filter(([i]) => i >= off.NL && i < off.NE).slice(0, 2), ...pickScores.slice(-6)]
    const uniq = shown.filter((x, k) => shown.findIndex((y) => y[0] === x[0]) === k)
    F.push({ view: 'scores', scores: uniq, line: 9, cap: cap('kelime puanı = log oran', 'word score = log ratio'), stat: cap('sağ: spam · sol: normal', 'right: spam · left: normal'), hold: 2.4 })
    EXAMPLES.forEach((e, k) => {
      const s = e.w.map((w) => wordScore(M, w))
      const total = mailScore(M, e.w)
      const kn = KIND_NAMES[e.kind]
      for (let shownN = 1; shownN <= e.w.length; shownN += k === 0 ? 1 : e.w.length) {
        const part = e.w.slice(0, shownN).reduce((a, w) => a + (wordScore(M, w) ?? 0), 0)
        F.push({ view: 'mail', mail: { w: e.w, s, total: part, kind: e.kind, shown: shownN, t: esik }, line: 11, cap: cap(`örnek ${k + 1} (${kn[0]}) · toplam ${part >= 0 ? '+' : ''}${fmt(part, 2, 'tr')}`, `example ${k + 1} (${kn[1]}) · total ${part >= 0 ? '+' : ''}${part.toFixed(2)}`), stat: cap(`${shownN} / ${e.w.length} kelime`, `${shownN} / ${e.w.length} words`), hold: k === 0 ? 0.8 : 1.4 })
      }
      const sp = total > esik
      F.push({ view: 'mail', mail: { w: e.w, s, total, kind: e.kind, shown: e.w.length, t: esik }, line: 11, cap: cap(`örnek ${k + 1}: ${total >= 0 ? '+' : ''}${fmt(total, 2, 'tr')} → ${sp ? 'SPAM' : 'normal'}`, `example ${k + 1}: ${total >= 0 ? '+' : ''}${total.toFixed(2)} → ${sp ? 'SPAM' : 'normal'}`), stat: cap(`gerçekte: ${kn[0]}`, `actually: ${kn[1]}`), hold: 2 })
    })
    const ev = evaluate(M, test, esik)
    const nlBad = ev.by[3][1] - ev.by[3][0]
    F.push({
      view: 'test', by: ev.by, acc: ev.acc, line: 13,
      cap: cap(`test: ${ev.ok} / 100 doğru`, `test: ${ev.ok} / 100 correct`),
      stat: cap(`kılık değiştirmiş spam ${ev.by[1][0]} / ${ev.by[1][1]} yakalandı · ${nlBad} bülten spam sayıldı`, `disguised spam ${ev.by[1][0]} / ${ev.by[1][1]} caught · ${nlBad} newsletters flagged`), hold: 3,
    })
    return F
  },
}
// Veri CSV'den açılınca 2. satırdan sonra 3 satır eklendi: vurgulanan satırlar kayar.
SPAM_FILTRESI.run = shifted(SPAM_FILTRESI.run, 2, 3)
