// Beceri etiketleri ve ustalık hesabı (PİLOT, taslak: yalnız Modül 3 Hafta 1 eşlenmiştir).
// NOT: tools/content/build.mjs beceri kimliklerini bu dosyadaki `id: '...'` kalıbından okur; SKILLS dışında `id:` yazma.

export interface Skill { id: string; label: string; area: string; description: string }

export const SKILLS: readonly Skill[] = [
  { id: 'mcu-board', label: 'Mikrodenetleyici ve kart', area: 'Donanım', description: 'Mikrodenetleyicinin ne olduğunu ve Arduino Uno üzerindeki parçaları (pinler, 5V, GND, L LED) tanır.' },
  { id: 'elec-ohm', label: 'Ohm yasası', area: 'Elektrik', description: 'V = I × R ilişkisiyle gerilim, akım ve direnci hesaplar; birim çevirir (mA, kΩ).' },
  { id: 'elec-led-resistor', label: 'LED ve seri direnç', area: 'Elektrik', description: 'LED için seri direncin neden gerektiğini bilir, akımı hesaplar ve değeri seçer.' },
  { id: 'circuit-wiring', label: 'Devre kurma', area: 'Elektrik', description: 'Parçaları doğru bağlar: kapalı devre, GND, LED yönü (anot/katot).' },
  { id: 'prog-structure', label: 'Program yapısı', area: 'Programlama', description: 'setup() ve loop() bölümlerinin ne zaman çalıştığını ve sketch kalıbını bilir.' },
  { id: 'digital-out', label: 'Dijital çıkış', area: 'Programlama', description: 'pinMode, digitalWrite, HIGH ve LOW ile bir pini sürer.' },
  { id: 'prog-timing', label: 'Bekleme ve zaman', area: 'Programlama', description: 'delay() süresini (milisaniye) hesaplar ve bir programın tur süresini bulur.' },
  { id: 'prog-loops-arrays', label: 'Döngü ve dizi', area: 'Programlama', description: 'for döngüsü ve dizi indekslerini (0 tabanlı) doğru kullanır.' },
  { id: 'prog-debug', label: 'Hata bulma', area: 'Programlama', description: 'Küçük program hatalarını (noktalı virgül, pinMode eksikliği, indeks taşması) bulur.' },
  { id: 'prog-planning', label: 'Planlama', area: 'Programlama', description: 'Kodu yazmadan önce aşamaları ve süreleri tabloya dökerek işi parçalara ayırır.' },
]

export const SKILL_IDS: ReadonlySet<string> = new Set(SKILLS.map((s) => s.id))
export const skillById = (id: string): Skill | undefined => SKILLS.find((s) => s.id === id)

/**
 * Pilot eşlemesi: ders anahtarı (modül-slug:hafta:ders) -> o dersin hedeflediği beceriler.
 * Mini test sorularındaki `skills` etiketleri bunun alt kümesi olmalıdır (test ile doğrulanır).
 */
export const LESSON_SKILLS: Readonly<Record<string, readonly string[]>> = {
  'arduino-temelleri:1:1': ['mcu-board', 'prog-structure', 'digital-out'],
  'arduino-temelleri:1:2': ['elec-ohm', 'elec-led-resistor'],
  'arduino-temelleri:1:3': ['digital-out', 'prog-structure', 'prog-timing', 'circuit-wiring', 'prog-debug'],
  'arduino-temelleri:1:4': ['prog-loops-arrays', 'digital-out', 'prog-timing', 'prog-debug'],
  'arduino-temelleri:1:5': ['prog-planning', 'digital-out', 'prog-timing', 'circuit-wiring', 'prog-loops-arrays', 'prog-debug', 'elec-led-resistor', 'elec-ohm'],
}

// ---- Ustalık hesabı (saf fonksiyon) ----

/** Bir soruya verilen tek bir cevap. `t` = zaman damgası (ms), `n` = aynı sorudaki deneme sırası (1 = ilk deneme). */
export interface AnswerRecord { skills: readonly string[]; correct: boolean; t: number; n?: number }

export type MasteryLevel = 'yeni' | 'baslangic' | 'gelisiyor' | 'ustalasti'

export interface SkillMastery {
  skill: string
  /** 0-1 ağırlıklı doğru oranı; cevap yoksa 0. */
  score: number
  /** Cevap sayısı. */
  attempts: number
  /** 0-1: ne kadar veriye dayanıyor (5 cevapta 1). */
  confidence: number
  level: MasteryLevel
}

/** Her yeni cevap bir öncekinin ağırlığını bu oranla azaltır (yakın cevaplar daha çok sayılır). */
export const RECENCY_DECAY = 0.85
/** İlk denemedeki doğru/yanlış, tekrar denemelerden daha çok sayılır (ezber/deneme-yanılmayı ayıklamak için). */
export const FIRST_TRY_WEIGHT = 1
export const RETRY_WEIGHT = 0.5
export const CONFIDENCE_FULL_AT = 5

export function levelOf(score: number, attempts: number): MasteryLevel {
  if (attempts === 0) return 'yeni'
  if (score >= 0.8 && attempts >= 3) return 'ustalasti'
  if (score >= 0.5) return 'gelisiyor'
  return 'baslangic'
}

/**
 * Beceri başına ağırlıklı doğru oranı: ağırlık = yenilik (0.85^sıra, en yeni = 1) × deneme (ilk 1, tekrar 0.5).
 * Bir cevabın birden çok becerisi varsa her biri için ayrı sayılır.
 */
export function computeMastery(records: readonly AnswerRecord[], skills: readonly string[] = SKILLS.map((s) => s.id)): SkillMastery[] {
  const byTime = [...records].sort((a, b) => b.t - a.t) // en yeni önce
  return skills.map((skill) => {
    const mine = byTime.filter((r) => r.skills.includes(skill))
    let num = 0
    let den = 0
    mine.forEach((r, i) => {
      const w = RECENCY_DECAY ** i * ((r.n ?? 1) > 1 ? RETRY_WEIGHT : FIRST_TRY_WEIGHT)
      den += w
      if (r.correct) num += w
    })
    const score = den > 0 ? num / den : 0
    return { skill, score, attempts: mine.length, confidence: Math.min(1, mine.length / CONFIDENCE_FULL_AT), level: levelOf(score, mine.length) }
  })
}

export const LEVEL_LABEL: Record<MasteryLevel, string> = { yeni: 'Henüz veri yok', baslangic: 'Başlangıç', gelisiyor: 'Gelişiyor', ustalasti: 'Ustalaştı' }
