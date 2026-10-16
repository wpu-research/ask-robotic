// Parça ansiklopedisinin dile bağlı metin alanları (İngilizce çeviri: content-src/parcalar/en/*.md ->
// parca-rehberi.en.generated.ts). partType ve relatedLessons dilden bağımsızdır, Türkçe kayıttan gelir.
import type { ComponentGuide } from '@ask/db'

export type ComponentGuideText = Pick<ComponentGuide, 'title' | 'category' | 'summary' | 'pins' | 'howItWorksMd' | 'wiringMd' | 'typicalValues' | 'commonMistakesMd'>
