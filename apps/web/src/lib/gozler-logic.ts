// "Robotun Gözleri" kamera oyunlarının saf mantığı (kamerasız test edilebilsin diye bileşenlerden ayrı):
// yüz ifadesi (blendshape), parmak sayma (el noktaları), poz tanıma (vücut noktaları), oyun soruları.
// Koordinatlar MediaPipe'ın normalize değerleri: x sağa, y aşağı doğru 0…1 (görüntü aynalanmadan önce).

export interface P { x: number; y: number; visibility?: number }

// ---------------------------------------------------------------- yüz
export type FaceK = 'smile' | 'surprise' | 'angry' | 'wink' | 'neutral'
export function readFace(bs: Array<{ categoryName: string; score: number }>): FaceK {
  const s = (n: string) => bs.find((b) => b.categoryName === n)?.score ?? 0
  const blinkL = s('eyeBlinkLeft'), blinkR = s('eyeBlinkRight')
  if ((blinkL > 0.55) !== (blinkR > 0.55) && Math.abs(blinkL - blinkR) > 0.35) return 'wink'
  if (s('jawOpen') > 0.35 && s('browInnerUp') > 0.25) return 'surprise'
  if ((s('mouthSmileLeft') + s('mouthSmileRight')) / 2 > 0.5) return 'smile'
  if ((s('browDownLeft') + s('browDownRight')) / 2 > 0.35) return 'angry'
  return 'neutral'
}
/** Ağız açık mı (jawOpen blendshape). */
export const mouthOpen = (bs: Array<{ categoryName: string; score: number }>, th = 0.35) => (bs.find((b) => b.categoryName === 'jawOpen')?.score ?? 0) > th

// ---------------------------------------------------------------- el
const d = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y)
/**
 * Kalkık parmak sayısı (0–5), 21 el noktasından. Dört parmak: uç, bilekten orta eklemden (PIP) daha uzaksa açık.
 * Başparmak: ucu, serçe parmak kökünden başparmak eklemine göre belirgin uzaksa açık. El yönünden bağımsızdır.
 */
export function countFingers(lm: P[]): number {
  if (!lm || lm.length < 21) return 0
  const w = lm[0]
  let n = 0
  for (const [tip, pip] of [[8, 6], [12, 10], [16, 14], [20, 18]]) if (d(lm[tip], w) > d(lm[pip], w) * 1.15) n++
  if (d(lm[4], lm[17]) > d(lm[2], lm[17]) * 1.25 && d(lm[4], lm[5]) > d(lm[2], lm[5]) * 0.9) n++
  return n
}

// ---------------------------------------------------------------- vücut (PoseLandmarker: 0 burun, 11/12 omuz, 15/16 bilek)
export type PoseK = 'both-up' | 't-pose' | 'right-up' | 'left-up' | 'none'
export const POSES: PoseK[] = ['both-up', 't-pose', 'right-up', 'left-up']
/** Kişinin kendi sağı/solu (16 sağ bilek, 15 sol bilek). Bilek görünmüyorsa 'none'. */
export function classifyPose(lm: P[]): PoseK {
  if (!lm || lm.length < 17) return 'none'
  const nose = lm[0], ls = lm[11], rs = lm[12], lw = lm[15], rw = lm[16]
  const vis = (p: P) => (p.visibility ?? 1) > 0.4
  if (!vis(ls) || !vis(rs)) return 'none'
  const sw = Math.max(0.05, Math.abs(ls.x - rs.x)) // omuz genişliği: ölçek
  const up = (wr: P) => vis(wr) && wr.y < nose.y
  const down = (wr: P, sh: P) => !vis(wr) || wr.y > sh.y + sw * 0.4
  const side = (wr: P, sh: P) => vis(wr) && Math.abs(wr.y - sh.y) < sw * 0.45 && Math.abs(wr.x - sh.x) > sw * 0.9
  if (up(lw) && up(rw)) return 'both-up'
  if (side(lw, ls) && side(rw, rs)) return 't-pose'
  if (up(rw) && down(lw, ls)) return 'right-up'
  if (up(lw) && down(rw, rs)) return 'left-up'
  return 'none'
}

// ---------------------------------------------------------------- sorular
/** Parmak Hesabı: toplamı 0–5 olan toplama/çıkarma sorusu (rastgele kaynağı verilebilir). */
export function mathQuestion(rnd: () => number = Math.random): { a: number; b: number; op: '+' | '−'; answer: number } {
  const answer = Math.floor(rnd() * 6)
  if (rnd() < 0.6 || answer === 5) { const a = Math.floor(rnd() * (answer + 1)); return { a, b: answer - a, op: '+', answer } }
  const b = 1 + Math.floor(rnd() * (5 - answer)); return { a: answer + b, b, op: '−', answer }
}

/** Doğru mu Yanlış mı: Robotun Gözleri derslerinden ifadeler. */
export const QUIZ: Array<{ ok: boolean; tr: string; en: string }> = [
  { ok: true, tr: 'Bir resim küçük karelerden, yani piksellerden oluşur.', en: 'A picture is made of tiny squares called pixels.' },
  { ok: false, tr: 'Robot renkleri kelimelerle hatırlar.', en: 'A robot remembers colours as words.' },
  { ok: false, tr: 'Kırmızı, yeşil ve mavinin üçü de 255 olursa siyah olur.', en: 'If red, green and blue are all 255 you get black.' },
  { ok: true, tr: 'Maske, siyah beyaz bir resimdir.', en: 'A mask is a black and white picture.' },
  { ok: true, tr: 'Beyaz piksellerin ortası, topun yeridir.', en: 'The middle of the white pixels is where the ball is.' },
  { ok: false, tr: 'Daha çok piksel, daha bulanık bir resim demektir.', en: 'More pixels means a blurrier picture.' },
  { ok: true, tr: 'Robotlar örneklerden öğrenebilir.', en: 'Robots can learn from examples.' },
  { ok: false, tr: 'Çizgi kameranın solundaysa çizgi izleyen robot sağa döner.', en: 'If the line is on the left of the camera, a line follower turns right.' },
  { ok: true, tr: 'Robot yüz ifadeni yüzündeki noktalara bakarak anlar.', en: 'The robot reads your face by looking at dots on it.' },
  { ok: false, tr: 'Bu oyunlarda kamera görüntün internete gönderilir.', en: 'In these games your camera picture is sent to the internet.' },
]

/** Fisher–Yates karıştırma (kopya döner). */
export function shuffle<T>(xs: readonly T[], rnd: () => number = Math.random): T[] {
  const a = xs.slice()
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

/** Daire ile nokta çarpışması (oyunlarda dokunma). */
export const hit = (x: number, y: number, cx: number, cy: number, r: number) => Math.hypot(x - cx, y - cy) < r
