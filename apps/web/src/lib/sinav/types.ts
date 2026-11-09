// ESOF 323 çevrimiçi sınavı: proje sözleşmesi. Her proje bir robot/sistem senaryosudur; öğrenci devreyi görsel
// editörde kurar ve Arduino kodunu yazar. Puanlama sunucuda yapılır (grade.ts): devre ve kod durağan olarak,
// davranış ise öğrencinin KENDİ devresinde, derlenmiş koduyla ve projenin senaryosuyla benzetim çalıştırılarak.
import type { Circuit, CircuitAnalysis, LabState, PartType, PropValue } from '@/lib/lab/contract'
import type { LabSetup } from '@/lib/lab/activity'
import type { LabStats } from '@/lib/lab/stats'

export type GoalKind = 'circuit' | 'code' | 'behavior'

export interface ExamGoalCtx {
  circuit: Circuit
  analysis: CircuitAnalysis
  /** Benzetim durumu (senaryo bittikten sonra). Derleme başarısızsa null. */
  lab: LabState | null
  code: string
  /** Tüm çalıştırma boyunca toplanan sayaçlar. */
  stats: LabStats
  /** Senaryonun `mark` ile kaydettiği gözlemler. Derleme başarısızsa boş. */
  marks: Record<string, boolean>
  /** Senaryo bittiğinde seri monitörde biriken tüm metin. */
  serial: string
}

export interface ExamGoal {
  id: string
  /** Öğrenciye gösterilen gereksinim (İngilizce). */
  text: string
  kind: GoalKind
  /** Bir projedeki tüm hedeflerin puan toplamı 100'dür. */
  points: number
  check: (ctx: ExamGoalCtx) => boolean
}

/** Puanlama senaryosu: parça kimlikleri öğrencinin devresinde farklıdır, parçalar türüne göre bulunur. */
export interface ExamScenario {
  /** Benzetimi ms kadar ilerletir (sayaçlar içeride toplanır). */
  advance(ms: number): void
  /** Bu türdeki parçaların kimlikleri (devredeki sırayla). */
  idsOf(type: PartType): string[]
  /** Bu türdeki TÜM parçalara özellik verir (ör. idsOf boşsa hiçbir şey yapmaz). */
  setAll(type: PartType, key: string, value: PropValue): void
  setProp(partId: string, key: string, value: PropValue): void
  sendSerial(text: string): void
  /** Şu anki benzetim durumu. */
  readonly state: LabState
  /** Seri çıktının şu ana kadarki tamamı. */
  readonly serial: string
  /** Bir gözlem kaydeder; aynı ad birden çok kez kaydedilirse hepsi true olmalıdır (VE). */
  mark(name: string, ok: boolean): void
}

export interface ExamProject {
  /** 'p01' … 'p25' */
  id: string
  /** Robotun adı (ör. "Parking Assist Robot"). */
  title: string
  /** Bir cümlelik hikâye. */
  story: string
  /** Görev metni (İngilizce, HTML değil düz metin; satır sonları korunur). Pinler açıkça yazılır. */
  brief: string
  /** Kapsanan ders haftaları (1-7). */
  weeks: number[]
  allowedParts: PartType[]
  starter: () => LabSetup
  goals: ExamGoal[]
  /** Tüm hedefleri sağlayan örnek çözüm (testlerde ve öğretmen önizlemesinde). */
  solution: () => LabSetup
  /** Puanlamada çalıştırılan etkileşimler. Verilmezse 3 sn çalıştırılır. */
  scenario?: (s: ExamScenario) => void
}

export interface GoalOutcome { id: string; text: string; kind: GoalKind; points: number; earned: number }
export interface ProjectGrade {
  /** 0-100 */
  score: number
  compiled: boolean
  compileError?: string
  goals: GoalOutcome[]
  /** Seri çıktının son 2000 karakteri (öğretmen incelemesi için). */
  serialTail: string
}
