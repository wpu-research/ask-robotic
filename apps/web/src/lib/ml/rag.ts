// Ders: erişim destekli üretim (RAG). Depo robotu kılavuzundan 12 parça TF-IDF ile vektörleştirilir; soru vektörüne kosinüsle
// en yakın k parça "bağlama" girer ve cevap bu parçalara dayanır. Erişimsiz model kılavuzu görmez, kulaktan bir sayı uydurur.
import { cap, fmt, type Bi, type Frame, type Lesson } from './core'

/** Kılavuz parçaları: ekranda gösterilen metin ve vektörleştirilen terimler (ortak, köke indirilmiş sözlük; Python ile aynı). */
export const CHUNKS: Array<{ text: Bi; terms: string }> = [
  { text: { tr: 'Batarya 48 V lityum; tam şarj 3 saat sürer.', en: 'Battery is 48 V lithium; a full charge takes 3 hours.' }, terms: 'battery lithium charge full hours three' },
  { text: { tr: 'Tam dolu batarya ile çalışma süresi 6 saattir.', en: 'Runtime on a full battery is 6 hours.' }, terms: 'battery runtime full hours six' },
  { text: { tr: "Batarya %15'in altına düşünce robot şarj istasyonuna kendisi döner.", en: 'Below 15% battery the robot returns to the charging station by itself.' }, terms: 'battery low station return charge' },
  { text: { tr: 'Azami hız 1,5 m/s; insan yakınında 0,5 m/s.', en: 'Top speed is 1.5 m/s; 0.5 m/s near people.' }, terms: 'speed max human slow' },
  { text: { tr: 'Taşıma kapasitesi 120 kg; 150 kg üstünde motorlar durur.', en: 'Payload is 120 kg; above 150 kg the motors stop.' }, terms: 'load max kg payload motor stop' },
  { text: { tr: 'LiDAR menzili 25 m, saniyede 10 tarama.', en: 'Lidar range is 25 m, 10 scans per second.' }, terms: 'lidar range meters scan' },
  { text: { tr: 'Acil durdurma: kırmızı düğme, motorlar 0,3 s içinde durur.', en: 'Emergency stop: red button, motors stop within 0.3 s.' }, terms: 'emergency stop button motor' },
  { text: { tr: 'Hata E12: tekerlek motoru aşırı ısındı; 10 dakika soğut.', en: 'Error E12: wheel motor overheated; let it cool for 10 minutes.' }, terms: 'error e12 wheel motor overheat cool minutes' },
  { text: { tr: 'Hata E31: LiDAR lensi kirli; kuru bezle sil.', en: 'Error E31: lidar lens is dirty; wipe it with a dry cloth.' }, terms: 'error e31 lidar dirty lens clean' },
  { text: { tr: 'Wi-Fi bağlantısı koparsa robot yerinde durup bekler.', en: 'If the Wi-Fi connection is lost the robot stops and waits.' }, terms: 'wifi network lost connection wait' },
  { text: { tr: 'Rampa: en fazla 8° eğim çıkar.', en: 'Ramps: climbs a slope of at most 8°.' }, terms: 'ramp slope degrees max climb' },
  { text: { tr: 'Çalışma sıcaklığı 0–40 °C arasıdır.', en: 'Operating temperature is 0–40 °C.' }, terms: 'temperature operating degrees range' },
]
/** Terimlerin Türkçe karşılıkları (sahnede soru vektörünü göstermek için). */
export const TERM_TR: Record<string, string> = {
  battery: 'batarya', lithium: 'lityum', charge: 'şarj', full: 'dolu', hours: 'saat', three: 'üç', runtime: 'süre', six: 'altı', low: 'düşük',
  station: 'istasyon', return: 'dön', speed: 'hız', max: 'azami', human: 'insan', slow: 'yavaş', load: 'yük', kg: 'kg', payload: 'kapasite',
  motor: 'motor', stop: 'dur', lidar: 'LiDAR', range: 'menzil', meters: 'metre', scan: 'tarama', emergency: 'acil', button: 'düğme', error: 'hata',
  e12: 'E12', wheel: 'tekerlek', overheat: 'ısınma', cool: 'soğut', minutes: 'dakika', e31: 'E31', dirty: 'kirli', lens: 'lens', clean: 'temizle',
  wifi: 'Wi-Fi', network: 'ağ', lost: 'kop', connection: 'bağlantı', wait: 'bekle', ramp: 'rampa', slope: 'eğim', degrees: 'derece', climb: 'tırman',
  temperature: 'sıcaklık', operating: 'çalışma',
}
/** Örnek sorular: metin, terimler, doğru parça (0'dan) ve erişimsiz modelin uydurduğu cevap. */
export const QUESTIONS: Array<{ text: Bi; terms: string; gold: number; guess: Bi }> = [
  { text: { tr: 'Batarya kaç saatte dolar?', en: 'How many hours does the battery take to charge?' }, terms: 'battery charge hours', gold: 0, guess: { tr: 'Yaklaşık 8 saatte dolar.', en: 'It charges in about 8 hours.' } },
  { text: { tr: 'Ekranda E12 hatası var, ne yapmalıyım?', en: 'The screen shows error E12, what should I do?' }, terms: 'error e12', gold: 7, guess: { tr: 'E12 bir ağ hatasıdır; robotu yeniden başlatın.', en: 'E12 is a network error; restart the robot.' } },
  { text: { tr: 'Robot en fazla kaç kg yük taşır?', en: 'What is the maximum load in kg?' }, terms: 'max kg load', gold: 4, guess: { tr: 'En fazla 50 kg taşır.', en: 'It carries at most 50 kg.' } },
  { text: { tr: 'LiDAR ne kadar uzağı görür (menzili)?', en: 'How far does the lidar see (its range)?' }, terms: 'lidar range', gold: 5, guess: { tr: 'Yaklaşık 100 metre.', en: 'About 100 metres.' } },
  { text: { tr: 'Wi-Fi bağlantısı koparsa robot ne yapar?', en: 'What does the robot do if Wi-Fi is lost?' }, terms: 'wifi lost connection', gold: 9, guess: { tr: 'Görevine devam eder ve şarja döner.', en: 'It continues its task and returns to charge.' } },
  { text: { tr: 'Robot kaç derecelik eğimi çıkabilir?', en: 'How many degrees of slope can the robot climb?' }, terms: 'degrees slope max', gold: 10, guess: { tr: '15 dereceye kadar çıkar.', en: 'Up to 15 degrees.' } },
  // kelime uyuşmazlığı: "ağır" kılavuzda yok; acil durdurma parçası da "motor" ve "dur" içerir ve daha kısa olduğu için öne geçer
  { text: { tr: 'Ağır bir kasada motorlar neden durdu?', en: 'Why did the motors stop with a heavy crate?' }, terms: 'motor stop', gold: 4, guess: { tr: 'Batarya zayıfladığı için.', en: 'Because the battery was weak.' } },
]

export const VOCAB: string[] = [...new Set(CHUNKS.flatMap((c) => c.terms.split(' ')))].sort()
const tf = (s: string) => { const w = s.split(' '); return VOCAB.map((v) => w.filter((x) => x === v).length) }
const N = CHUNKS.length
const D = CHUNKS.map((c) => tf(c.terms))
/** Pürüzsüz IDF (scikit-learn ile aynı): ln((1 + N) / (1 + df)) + 1. Az belgede geçen terim daha ağır. */
export const IDF: number[] = VOCAB.map((_, j) => Math.log((1 + N) / (1 + D.filter((d) => d[j] > 0).length)) + 1)
export const DOCVEC: number[][] = D.map((d) => d.map((x, j) => x * IDF[j]))
export const qvec = (terms: string): number[] => tf(terms).map((x, j) => x * IDF[j])
const nrm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
export function sims(terms: string): number[] {
  const q = qvec(terms), nq = nrm(q) || 1
  return DOCVEC.map((d) => d.reduce((s, x, j) => s + x * q[j], 0) / ((nrm(d) || 1) * nq))
}
export const topK = (s: number[], k: number): number[] => s.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, k).map((p) => p[1])

export interface RagFrame extends Frame {
  qn: number
  k: number
  /** Benzerlikler (gösterilen kadar; null: henüz yok). */
  sim: Array<number | null>
  /** Sıralanmış en iyi k parça (seçildiyse). */
  top: number[] | null
  /** Bağlama girmiş parça sayısı. */
  ctxN: number
  /** Vektörleştirilmiş parça sayısı (başta animasyon). */
  vec: number
  guess: boolean
  answer: boolean
  /** Özet: tüm sorular için doğru parçanın sırası (1'den). */
  ranks?: number[]
}

export const RAG: Lesson<RagFrame> = {
  slug: 'rag',
  n: 0,
  title: { tr: 'Erişim destekli üretim (RAG)', en: 'Retrieval-augmented generation (RAG)' },
  sub: { tr: 'Model önce kılavuzda arar, sonra cevaplar', en: 'The model first searches the manual, then answers' },
  story: {
    tr: 'Depo robotunun kullanım kılavuzunu 12 kısa parçaya böldük (batarya, hız, yük, LiDAR, hata kodları…). Teknisyen robota 7 farklı soru soruyor. Kılavuzu hiç görmemiş bir dil modeli akıcı ama uydurma bir cevap verir ("yaklaşık 8 saat"). RAG önce sorunun kelimelerine en çok benzeyen parçaları bulur, onları cevabın yanına koyar; cevap kılavuzdaki sayıya dayanır.',
    en: 'We split the warehouse robot manual into 12 short chunks (battery, speed, payload, lidar, error codes…). A technician asks the robot 7 different questions. A language model that has never seen the manual gives a fluent but made-up answer ("about 8 hours"). RAG first finds the chunks most similar to the words of the question and puts them next to the answer; the answer rests on the number in the manual.',
  },
  how: [
    { tr: 'Her parça bir kelime torbasına çevrilir: sözlükteki her terim için kaç kez geçtiği (TF).', en: 'Each chunk becomes a bag of words: for every term in the vocabulary, how many times it appears (TF).' },
    { tr: 'IDF: az parçada geçen terim (E12, menzil) ayırt edicidir ve ağırlığı büyür; her yerde geçen terim (batarya, motor) hafifler. Vektör = TF × IDF.', en: 'IDF: a term found in few chunks (E12, range) is distinctive and gets more weight; a term found everywhere (battery, motor) gets lighter. Vector = TF × IDF.' },
    { tr: 'Soru da aynı şekilde vektörleşir. Her parça ile kosinüs benzerliği hesaplanır; en yüksek k parça seçilir.', en: 'The question is vectorised the same way. Its cosine similarity with every chunk is computed and the top k chunks are picked.' },
    { tr: 'Seçilen parçalar bağlam olarak modele verilir; cevap bu bağlamdaki cümleden kurulur ve kaynağı ([parça no]) gösterilir. Burada cevap bir şablondur, gerçek bir dil modeli değil.', en: 'The selected chunks are given to the model as context; the answer is built from the sentence in that context and cites its source ([chunk no]). Here the answer is a template, not a real language model.' },
    { tr: 'Şunu dene: 7. soruyu seç ve k’yı 1 yap. Soru "ağır" diyor, kılavuz "yük, kg"; kelimeler tutmadığı için acil durdurma parçası öne geçer ve doğru parça bağlama giremez. k = 2 ile girer.', en: 'Try this: pick question 7 and set k to 1. The question says "heavy", the manual says "load, kg"; since the words do not match, the emergency-stop chunk comes first and the right chunk misses the context. With k = 2 it gets in.' },
  ],
  why: {
    tr: 'Kurumsal sohbet botları, kod asistanları ve arama motorlarının yapay zekâ cevapları RAG ile çalışır: model güncel ve özel belgeleri ezberlemek yerine arar, böylece uydurma azalır ve kaynak gösterilebilir. Robotikte servis robotunun kılavuz ve arıza kayıtlarından cevap vermesi, sahadaki teknisyene doğru prosedürü getirmesi bu yolla yapılır; gerçek sistemlerde TF-IDF yerine çoğunlukla öğrenilmiş vektörler (embedding) kullanılır.',
    en: "Company chatbots, coding assistants and AI answers in search engines run on RAG: instead of memorising up-to-date and private documents the model searches them, so it makes things up less and can cite a source. In robotics this is how a service robot answers from its manual and fault logs and brings the right procedure to a field technician; real systems mostly use learned vectors (embeddings) instead of TF-IDF.",
  },
  file: 'rag.py',
  code: [
    ['import numpy as np'],
    ['docs = ["battery lithium charge full hours three",', '12 kılavuz parçası (terimler)', '12 manual chunks (terms)'],
    ['        "battery runtime full hours six",'],
    ['        "battery low station return charge",'],
    ['        "speed max human slow",'],
    ['        "load max kg payload motor stop",'],
    ['        "lidar range meters scan",'],
    ['        "emergency stop button motor",'],
    ['        "error e12 wheel motor overheat cool minutes",'],
    ['        "error e31 lidar dirty lens clean",'],
    ['        "wifi network lost connection wait",'],
    ['        "ramp slope degrees max climb",'],
    ['        "temperature operating degrees range"]'],
    ['q = "battery charge hours"', 'soru 1: batarya kaç saatte dolar?', 'question 1: how long to charge?'],
    ['V = sorted(set(" ".join(docs).split())); L = np.linalg.norm', 'sözlük', 'vocabulary'],
    ['tf = lambda s: np.array([s.split().count(w) for w in V])', 'kelime torbası', 'bag of words'],
    ['D = np.array([tf(d) for d in docs])'],
    ['idf = np.log((1 + len(docs)) / (1 + (D > 0).sum(0))) + 1', 'nadir terim = ağır', 'rare term = heavy'],
    ['E, qv = D * idf, tf(q) * idf', 'TF × IDF'],
    ['sim = E @ qv / (L(E, axis=1) * L(qv))', 'kosinüs benzerliği', 'cosine similarity'],
    ['top = np.argsort(-sim)[:3]', 'en iyi k = 3 parça', 'best k = 3 chunks'],
    ['print(top + 1, sim[top].round(2))', 'parça no, benzerlik', 'chunk no, similarity'],
    ['print("context:", [docs[i] for i in top])', 'bağlam → cevap', 'context → answer'],
  ],
  params: [
    { key: 'q', label: { tr: 'Soru no', en: 'Question no' }, min: 1, max: 7, step: 1, value: 1 },
    { key: 'k', label: { tr: 'k (bağlama giren parça)', en: 'k (chunks in context)' }, min: 1, max: 5, step: 1, value: 3 },
  ],
  run({ q = 1, k = 3 }) {
    const qn = Math.max(0, Math.min(QUESTIONS.length - 1, Math.round(q) - 1))
    const kk = Math.max(1, Math.min(5, Math.round(k)))
    const F: RagFrame[] = []
    const none = (): Array<number | null> => CHUNKS.map(() => null)
    const base = { k: kk, ctxN: 0, guess: false, answer: false, top: null }
    const st = cap(`12 parça · sözlük ${VOCAB.length} terim · k = ${kk}`, `12 chunks · vocabulary ${VOCAB.length} terms · k = ${kk}`)
    F.push({ ...base, qn: -1, sim: none(), vec: 0, line: 1, cap: cap('robot kılavuzu: 12 parça', 'robot manual: 12 chunks'), stat: st, hold: 2 })
    F.push({ ...base, qn: -1, sim: none(), vec: 0, line: 14, cap: cap(`sözlük: ${VOCAB.length} farklı terim`, `vocabulary: ${VOCAB.length} different terms`), stat: st, hold: 1.4 })
    for (let i = 0; i < N; i++) {
      const c = cap(`parça ${i + 1} → vektör (${CHUNKS[i].terms.split(' ').length} terim)`, `chunk ${i + 1} → vector (${CHUNKS[i].terms.split(' ').length} terms)`)
      if (i < 4) F.push({ ...base, qn: -1, sim: none(), vec: i + 1, line: 15, cap: c, stat: st, hold: i < 2 ? 1.1 : 0.6 })
      F.push({ ...base, qn: -1, sim: none(), vec: i + 1, line: 16, cap: c, stat: st, hold: i < 2 ? 1 : 0.35 })
    }
    const rare = VOCAB.map((t, j) => [IDF[j], t] as [number, string]).sort((a, b) => b[0] - a[0] || (a[1] < b[1] ? -1 : 1))
    const bi = VOCAB.indexOf('battery')
    F.push({ ...base, qn: -1, sim: none(), vec: N, line: 17, cap: cap(`IDF: "batarya" 3 parçada → ${fmt(IDF[bi], 2, 'tr')}; tek parçada geçen terim → ${fmt(rare[0][0], 2, 'tr')}`, `IDF: "battery" in 3 chunks → ${IDF[bi].toFixed(2)}; a term in one chunk → ${rare[0][0].toFixed(2)}`), stat: st, hold: 2 })
    const Q = QUESTIONS[qn]
    F.push({ ...base, qn, sim: none(), vec: N, line: 13, cap: cap(`soru ${qn + 1}: ${Q.text.tr}`, `question ${qn + 1}: ${Q.text.en}`), stat: st, hold: 1.8 })
    F.push({ ...base, qn, sim: none(), vec: N, guess: true, line: 13, cap: cap('erişimsiz model: kılavuzu görmeden cevap uydurur', 'model without retrieval: makes up an answer without the manual'), stat: cap(`"${Q.guess.tr}"`, `"${Q.guess.en}"`), hold: 2.2 })
    F.push({ ...base, qn, sim: none(), vec: N, guess: true, line: 18, cap: cap(`soru vektörü: ${Q.terms.split(' ').map((t) => TERM_TR[t]).join(', ')}`, `question vector: ${Q.terms.split(' ').join(', ')}`), stat: st, hold: 1.4 })
    Q.terms.split(' ').forEach((t) => {
      const j = VOCAB.indexOf(t), df = D.filter((d) => d[j] > 0).length
      F.push({ ...base, qn, sim: none(), vec: N, guess: true, line: 18, cap: cap(`"${TERM_TR[t]}": ${df} parçada geçiyor → IDF ${fmt(IDF[j], 2, 'tr')}`, `"${t}": found in ${df} chunk${df > 1 ? 's' : ''} → IDF ${IDF[j].toFixed(2)}`), stat: st, hold: 0.9 })
    })
    const S = sims(Q.terms)
    for (let i = 0; i < N; i++) {
      const sim = S.map((x, j) => (j <= i ? x : null))
      F.push({ ...base, qn, sim, vec: N, guess: true, line: 19, cap: cap(`cos(soru, parça ${i + 1}) = ${fmt(S[i], 2, 'tr')}`, `cos(question, chunk ${i + 1}) = ${S[i].toFixed(2)}`), stat: st, hold: i < 2 ? 1.1 : 0.4 })
    }
    const top = topK(S, kk)
    const order = topK(S, N)
    const rank = order.indexOf(Q.gold) + 1
    F.push({ ...base, qn, sim: S, vec: N, guess: true, line: 20, cap: cap(`sırala: ${order.slice(0, 5).map((i) => `${i + 1} (${fmt(S[i], 2, 'tr')})`).join(', ')} …`, `sort: ${order.slice(0, 5).map((i) => `${i + 1} (${S[i].toFixed(2)})`).join(', ')} …`), stat: st, hold: 1.4 })
    F.push({ ...base, qn, sim: S, top, vec: N, guess: true, line: 20, cap: cap(`en iyi ${kk}: parça ${top.map((i) => i + 1).join(', ')}`, `top ${kk}: chunks ${top.map((i) => i + 1).join(', ')}`), stat: cap(`doğru parça (${Q.gold + 1}) ${rank}. sırada`, `the right chunk (${Q.gold + 1}) is ranked ${rank}`), hold: 2 })
    for (let c = 1; c <= kk; c++) F.push({ ...base, qn, sim: S, top, ctxN: c, vec: N, guess: true, line: 22, cap: cap(`bağlama giriyor: parça ${top[c - 1] + 1}`, `into the context: chunk ${top[c - 1] + 1}`), stat: st, hold: c === 1 ? 1 : 0.6 })
    const ok = top.includes(Q.gold)
    F.push({ ...base, qn, sim: S, top, ctxN: kk, vec: N, guess: true, answer: true, line: 22, cap: ok ? cap(`cevabın dayanağı: parça ${top[0] + 1}`, `the answer rests on chunk ${top[0] + 1}`) : cap(`doğru parça bağlamda yok: cevap yanlış parçaya (${top[0] + 1}) dayanıyor`, `the right chunk is not in the context: the answer rests on the wrong chunk (${top[0] + 1})`), stat: cap(`erişimsiz: "${Q.guess.tr}"`, `without retrieval: "${Q.guess.en}"`), hold: 3 })
    F.push({ ...base, qn, sim: S, top, ctxN: kk, vec: N, guess: true, answer: true, line: 22, cap: cap('aynı soru, iki cevap: biri uydurma, biri kaynaklı', 'same question, two answers: one made up, one with a source'), stat: cap(`kaynak: parça ${top.map((i) => i + 1).join(', ')}`, `sources: chunks ${top.map((i) => i + 1).join(', ')}`), hold: 2 })
    // diğer sorular, hızlıca
    const ranks = QUESTIONS.map((qq) => topK(sims(qq.terms), N).indexOf(qq.gold) + 1)
    QUESTIONS.forEach((qq, j) => {
      if (j === qn) return
      const s = sims(qq.terms), t = topK(s, kk)
      F.push({ ...base, qn: j, sim: none(), vec: N, guess: true, line: 13, cap: cap(`soru ${j + 1}: ${qq.text.tr}`, `question ${j + 1}: ${qq.text.en}`), stat: cap(`erişimsiz: "${qq.guess.tr}"`, `without retrieval: "${qq.guess.en}"`), hold: 1.2 })
      F.push({ ...base, qn: j, sim: s, top: t, vec: N, guess: true, line: 20, cap: cap(`en iyi ${kk}: parça ${t.map((i) => i + 1).join(', ')}`, `top ${kk}: chunks ${t.map((i) => i + 1).join(', ')}`), stat: cap(`doğru parça (${qq.gold + 1}) ${ranks[j]}. sırada`, `the right chunk (${qq.gold + 1}) is ranked ${ranks[j]}`), hold: 1 })
      F.push({ ...base, qn: j, sim: s, top: t, ctxN: kk, vec: N, guess: true, answer: true, line: 22, cap: cap(`cevap: parça ${t[0] + 1}`, `answer: chunk ${t[0] + 1}`), stat: st, hold: 1.2 })
    })
    const hit = ranks.filter((r) => r <= kk).length
    F.push({ ...base, qn, sim: S, top, ctxN: kk, vec: N, guess: true, answer: true, ranks, line: 21, cap: cap(`${QUESTIONS.length} sorunun ${hit} tanesinde doğru parça ilk ${kk} içinde`, `for ${hit} of ${QUESTIONS.length} questions the right chunk is in the top ${kk}`), stat: cap(`doğru parçanın sırası: ${ranks.join(', ')}`, `rank of the right chunk: ${ranks.join(', ')}`), hold: 3 })
    return F
  },
}
