/** Kavram kartı: dersin anahtar terimi. */
export interface Concept {
  term: string
  definition: string
  /** Tek cümlelik somut örnek */
  example: string
  /** Sık yapılan yanlış / tuzak */
  pitfall: string
}

export type QuizKind = 'mcq' | 'predict-output' | 'find-bug' | 'numeric'

/**
 * Mini test sorusu.
 * - mcq / predict-output / find-bug: `options` zorunlu, `answer` = doğru seçeneğin 0 tabanlı sırası.
 * - numeric: `options` yok, `answer` = doğru sayı; `tolerance` (mutlak, varsayılan 0) ve `unit` opsiyonel.
 * `skills`: lib/skills.ts'teki beceri kimlikleri.
 */
export interface QuizQuestion {
  id: string
  kind: QuizKind
  prompt: string
  options?: string[]
  answer: number
  tolerance?: number
  unit?: string
  explanation: string
  skills: string[]
}

/**
 * Etkileşimli ders (v2) adımı — Brilliant tarzı akış: kısa metin → hemen etkileşim → anında geri bildirim.
 * Kaynak: content-src/<modül>/<hafta>/ek/NN.adimlar.json (tools/content/ek.mjs doğrular).
 * Ortak alanlar: `why` doğru cevaptan sonra "Neden?" ile açılan açıklama; `hint` ilk yanlıştan sonra gösterilen ipucu;
 * `skills` lib/skills.ts beceri kimlikleri. Metinlerde `kod` ve **kalın** (satır içi Markdown) kullanılabilir.
 */
export type LessonStep =
  /** Dersin açılışı: büyük görsel + başlık + 1-2 cümle hikâye. */
  | { kind: 'intro'; title: string; body: string; art?: string }
  /** Kısa açıklama (≤ 3 cümle), isteğe bağlı kod parçası ve görsel. */
  | { kind: 'explain'; body: string; code?: string; art?: string }
  /** Tek doğru seçenekli soru (çıktıyı tahmin et, hatayı bul, kavram). */
  | { kind: 'choice'; prompt: string; code?: string; options: string[]; answer: number; why: string; hint?: string; skills?: string[] }
  /** Sayısal cevap; `tolerance` mutlak. */
  | { kind: 'numeric'; prompt: string; code?: string; answer: number; tolerance?: number; unit?: string; why: string; hint?: string; skills?: string[] }
  /** Token'lı kod editörü: `code` içindeki her `___` boşluğu sırayla `answer[i]` ile dolar; öğrenci `tokens` çiplerine dokunur. */
  | { kind: 'fill'; prompt: string; code: string; tokens: string[]; answer: string[]; why: string; hint?: string; skills?: string[] }
  /** Satırları doğru sıraya diz (`lines` doğru sıradır; oynatıcı karıştırır). */
  | { kind: 'order'; prompt: string; lines: string[]; why: string; hint?: string; skills?: string[] }
  /** Etkileşimli widget + hedef listesi: aynı widget, değişen kısıtlar. */
  | { kind: 'widget'; prompt: string; widget: WidgetSpec; goals: WidgetGoal[]; why: string; hint?: string; skills?: string[] }
  /** Dersin simülatör etkinliği (laboratuvar/arena/atölye) derse gömülü açılır; hedefler etkinliğin kendi hedefleridir. */
  | { kind: 'activity'; prompt: string }
  /** Konuşalım: doğru/yanlışı olmayan düşünme sorusu. */
  | { kind: 'reflect'; prompt: string }

/** Widget türü ve başlangıç ayarları. Metrikler widget'a göre: bkz. apps/web/src/components/lesson-v2/widgets. */
export type WidgetSpec =
  /** Ohm yasası: gerilim kaynağı + direnç + LED. Metrikler: V, R, I_mA, P_mW, ledOn (0/1). */
  | { type: 'ohm'; v?: number; r?: number; lockV?: boolean; lockR?: boolean; led?: boolean }
  /** Yanıp sönen LED zamanlaması. Metrikler: onMs, offMs, periodMs, hz, duty (0-100). */
  | { type: 'blink'; onMs?: number; offMs?: number }

/** Widget hedefi: metrik [min, max] aralığında olmalı (uçlar dahil). */
export interface WidgetGoal { label: string; metric: string; min?: number; max?: number }

export interface LessonContent {
  title: string
  durationMin: number
  /** Merak uyandıran açılış sorusu / küçük hikâye */
  problem: string
  /** Etkinlik adımları ve ebeveyn notu (Markdown) */
  contentMd: string
  /** Ders sonu konuşma sorusu */
  question: string
  /** Konu anlatımı (Markdown), opsiyonel */
  explainerMd?: string
  /** Kavram kartları (3-6), opsiyonel */
  concepts?: Concept[]
  /** Mini test (3-5 soru), opsiyonel */
  quiz?: QuizQuestion[]
  /** Etkileşimli ders (v2) adımları; varsa ders yeni oynatıcıda açılır. */
  steps?: LessonStep[]
  /**
   * `steps`in İngilizcesi (NN.adimlar.en.json / extras `stepsEn`): aynı yapı, yalnız insan metni çevrilir; kod, sayılar,
   * cevap sıraları aynı kalır (tools/content/ek.mjs mirrorSteps doğrular). Arayüz dili 'en' iken ders sayfası bunu kullanır.
   */
  stepsEn?: LessonStep[]
}

export interface WeekContent {
  title: string
  project: string
  lessons: LessonContent[]
  /** Haftalık çalışma rehberi (Markdown), opsiyonel */
  guideMd?: string
}

export interface ModuleContent {
  slug: string
  title: string
  track: 'cocuk' | 'maker' | 'ai'
  position: number
  minAge: number
  weeks: WeekContent[]
}

/** Parça ansiklopedisi maddesi (içerik dosyası: content-src/parcalar/*.md -> parcalar.generated.ts). */
export interface ComponentGuide {
  slug: string
  title: string
  /** Laboratuvar parça türü (packages/sim contract.ts PartType); pin adları buna göre doğrulanır. */
  partType: string
  category: string
  summary: string
  /** Pinler: ad (contract.ts ile aynı) + açıklama */
  pins: { name: string; description: string }[]
  howItWorksMd: string
  wiringMd: string
  /** Tipik değerler: etiket, değer, not */
  typicalValues: { label: string; value: string; note?: string }[]
  commonMistakesMd: string
  /** İlgili dersler: "modül-slug:hafta:ders" */
  relatedLessons: string[]
}
