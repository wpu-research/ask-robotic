// Makine Öğrenmesi projeleri (3B benzetimli): ortak tipler. Proje mantığı saf TypeScript'tir (DOM ve three.js yok), böylece
// testte de tarayıcıda da aynı tohumla aynı sonucu verir. Görüntü components/ml/projeler/scenes/<slug>.ts'te; oynatıcı her karede
// `run.step(perFrame × hız)` çağırır, sonra sahne `run.view`'u okuyup çizer.
import type { Bi, Cap, CodeLine, ParamDef } from '../core'
import type { EgitimRaporu } from '../egitim/rapor'

/** Canlı ölçüm kutusu: başlık ve iki dilli değer (sayılar dile göre biçimlenmiş). */
export interface Metric { label: Bi; value: Cap; tone?: 'good' | 'bad' }
/** Küçük çizgi grafik (ör. nesil başına en iyi uygunluk, bölüm başına başarı). Değerler ham sayı. */
export interface Curve { label: Bi; values: number[]; /** 0 marka rengi, 1 ikinci renk */ tone?: 0 | 1 }
/** Küçük tablo (ör. karışıklık matrisi): satır başlıkları, sütun başlıkları, sayılar. `diag` köşegeni vurgular. */
export interface Table { title: Bi; cols: Cap[]; rows: Array<{ label: Cap; cells: number[] }>; diag?: boolean }

export interface ProjectRun<V = unknown> {
  /** Bir karede `n` iş birimi ilerlet (eğitim adımı, benzetim adımı, nesil parçası…). Kare başına birkaç milisaniyeyi geçmemeli. */
  step(n: number): void
  /** Sahnenin okuyacağı güncel durum (değiştirilebilir nesne olabilir). */
  readonly view: V
  /** Sahnenin altındaki tek satır durum yazısı (ör. "nesil 12 · en iyi araç 2 tur"). */
  status(): Cap
  metrics(): Metric[]
  curves?(): Curve[]
  table?(): Table | null
  /** Eğitim paneli için o ana kadarki gerçek geçmiş ve ölçümler (lib/ml/egitim/rapor.ts). Oynatıcı kısıtlı aralıklarla çağırır. */
  report?(): EgitimRaporu
  /** Hedefe ulaşıldı ya da eğitim bitti: oynatıcı kendiliğinden durur. */
  done(): boolean
}

export interface ProjectDef<V = unknown> {
  slug: string
  title: Bi
  /** Kartta ve başlıkta tek satır. */
  sub: Bi
  /** Senaryo: robotik bağlam. */
  story: Bi
  /** Amaç: neye ulaşınca başarılı sayılır. */
  goal: Bi
  /** Model: hangi algoritma, kursun hangi dersinden. */
  model: Bi
  /** İlgili ders slug'ları (lib/ml/lessons.ts'te bulunmalı). */
  lessons: string[]
  /** Adım adım ne oluyor. */
  steps: Bi[]
  /** "Kendin dene" görevleri. */
  task: Bi[]
  /** Python karşılığı: dosya adı ve satırlar [kod, Türkçe yorum, İngilizce yorum]. */
  file: string
  code: CodeLine[]
  params: ParamDef[]
  /** 1× hızda kare başına iş birimi. */
  perFrame: number
  create(p: Record<string, number>): ProjectRun<V>
}

/** Parametre kümesinin varsayılanları. */
export const defaults = (d: { params: ParamDef[] }): Record<string, number> => Object.fromEntries(d.params.map((p) => [p.key, p.value]))
