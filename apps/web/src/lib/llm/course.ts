// Büyük Dil Modeli Uygulamaları dersi (büyükler için, 16+): 10 ünite, TR/EN. Site hiçbir dış LLM API'sine istek atmaz:
// simülasyonlar tarayıcıda çalışan küçük, deterministik öğretim modelleridir; gerçek API kodu (Anthropic SDK) yalnız örnek
// olarak gösterilir ve anahtar ortam değişkeninden okunur. Yapı Drone dersiyle aynı (kod bloğu ve quiz bileşenleri ESOF 323'ten).
import type { LlmSimId } from '@/components/llm/sim-meta'
import type { CodeBlock, QuizItem } from '@/lib/robotik/course'
import { UNITS_DATA } from './units'

export type Lang = 'tr' | 'en'
export interface UnitText {
  title: string
  /** Kart ve tablo için tek cümle. */
  summary: string
  goals: string[]
  /** Ders notu (HTML, depodaki sabit içerik). */
  notes: string
  /** Python ve JS örnekleri; gerçek API kodu Anthropic SDK ile, model "claude-sonnet-5-5", anahtar ortam değişkeninden. */
  code: CodeBlock[]
  /** "Kendin dene": simülasyonda yapılacak görev. */
  lab: string
  pitfalls: string[]
  /** Yazılım mühendisliği bağlantısı (HTML). */
  se: string
  quiz: QuizItem[]
}
/** Sitenin mevcut sayfalarına bağlantı (AI atölyesi, AI Mühendisliği modülü, ML dersleri). */
export interface Related { href: string; tr: string; en: string }
export interface Unit {
  n: number
  sims: LlmSimId[]
  related: Related[]
  tr: UnitText
  en: UnitText
}

export const UNITS: readonly Unit[] = UNITS_DATA
export const unitOf = (n: number): Unit | undefined => UNITS.find((u) => u.n === n)

/** Gerçek API örneklerinde kullanılan model kimliği (tek yerde). */
export const API_MODEL = 'claude-sonnet-5-5'

/** Ders künyesi. */
export const LLM_COURSE = {
  hours: 40,
  tr: {
    title: 'Büyük Dil Modeli Uygulamaları',
    lede: 'Bir dil modeliyle gerçek bir uygulama kurmayı uçtan uca öğren: tokenlar ve gömmeler, prompt kalıpları, JSON şemalı çıktı, belgeden cevap bulan RAG, araç kullanan ajanlar, değerlendirme, güvenlik ve KVKK, maliyet ve gecikme, akışlı bir web sohbet arayüzü. Simülasyonlar tarayıcıda çalışan küçük öğretim modelleridir; gerçek API kodu Python ve JavaScript örnekleriyle verilir.',
    level: 'Büyükler için · 16 yaş ve üstü, lise son sınıf, üniversite ve meslekten öğrenenler',
    prereq: 'Ön koşul: temel Python (fonksiyon, liste, sözlük) ve biraz JavaScript. Makine öğrenmesi dersindeki kelime vektörleri, dikkat ve RAG dersleri yardımcıdır ama şart değildir.',
    outcomes: [
      'Token, bağlam penceresi ve maliyet arasındaki ilişkiyi hesapla açıklamak',
      'Gömme vektörleriyle anlamsal arama ve benzerlik ölçmek',
      'Görev için doğru prompt kalıbını seçmek ve JSON şemasıyla doğrulanan çıktı almak',
      'Parçalama, gömme, vektör arama ve yeniden sıralama adımlarıyla bir RAG hattı kurmak',
      'Araç kullanan bir ajan döngüsünü sınırlarıyla birlikte tasarlamak',
      'Bir LLM uygulamasını ölçüt, rubrik ve dayanaklılık kontrolleriyle değerlendirmek',
      'Kişisel veriyi maskelemek, prompt enjeksiyonuna karşı katmanlı savunma kurmak',
      'Akışlı (streaming) cevap gösteren bir web sohbet arayüzü yazmak',
    ],
    cert: 'Üniteleri ve bitirme projesini tamamlayana Macademia katılım belgesi verilir.',
    teaching: 'Öğretim modeli: bu sayfadaki simülasyonlar gerçek bir dil modeli değildir. Küçük, deterministik, tarayıcıda çalışan modellerdir; kavramı göstermek için yazıldılar. Site hiçbir dış LLM servisine istek göndermez.',
  },
  en: {
    title: 'Large Language Model Applications',
    lede: 'Learn to build a real application on a language model end to end: tokens and embeddings, prompting patterns, JSON-schema output, RAG that answers from documents, agents that use tools, evaluation, safety and data protection, cost and latency, and a streaming web chat front-end. The simulations are small teaching models running in your browser; real API code is given as Python and JavaScript examples.',
    level: 'For adults · age 16 and up, final-year high school, university and working learners',
    prereq: 'Prerequisites: basic Python (functions, lists, dicts) and a little JavaScript. The word vectors, attention and RAG lessons in the machine learning course help but are not required.',
    outcomes: [
      'Explain the link between tokens, the context window and cost with numbers',
      'Measure similarity and run semantic search with embedding vectors',
      'Choose the right prompting pattern for a task and get output validated against a JSON schema',
      'Build a RAG pipeline with chunking, embedding, vector search and reranking',
      'Design a tool-using agent loop together with its limits',
      'Evaluate an LLM application with metrics, rubrics and groundedness checks',
      'Mask personal data and build layered defences against prompt injection',
      'Write a web chat front-end that shows a streaming response',
    ],
    cert: 'Learners who complete the units and the capstone receive a Macademia certificate of participation.',
    teaching: 'Teaching model: the simulations on this page are not a real language model. They are small, deterministic models running in your browser, written to show the idea. The site never sends a request to any external LLM service.',
  },
} as const
