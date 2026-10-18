// Makine Öğrenmesi (sıfırdan) ders listesi. Her ders lib/ml/<ders>.ts'te; sırayı ve bölümü lib/ml/sections.ts verir.
// Çizim: eski dersler components/ml/draw.ts'te, yeniler components/ml/scenes/<slug>.ts'te.
import type { Lesson } from './core'
import { SECTIONS } from './sections'
import { AKTIVASYON } from './aktivasyon-fonksiyonlari'
import { AYNI_KOD } from './ayni-kod-uc-urun'
import { BOLGE_IHLALI } from './bolge-ihlali'
import { BORUTA } from './boruta'
import { CI_CD_HATTI } from './ci-cd-hatti'
import { COP_TOPLAMA } from './cop-toplama'
import { DBSCAN } from './dbscan'
import { SVM } from './destek-vektor-makinesi'
import { DIKKAT } from './dikkat-mekanizmasi'
import { DUSME_TESPITI } from './dusme-tespiti'
import { GERI_YAYILIM } from './geri-yayilim'
import { GIT_DALLARI } from './git-dallari'
import { GORUNTU_URETECI } from './goruntu-ureteci'
import { GRADYAN_ARTIRMA } from './gradyan-artirma'
import { GRADYAN_INISI } from './gradyan-inisi'
import { HIZ_SINIRI } from './hiz-siniri'
import { IKILI_ARAMA } from './ikili-arama'
import { KELIME_VEKTORLERI } from './kelime-vektorleri'
import { KESINLIK_DUYARLILIK } from './kesinlik-duyarlilik'
import { KILITLENME } from './kilitlenme'
import { KMEANS } from './kmeans'
import { KNN } from './knn'
import { KONTEYNER_OLCEKLEME } from './konteyner-olcekleme'
import { LOJISTIK_NORON } from './lojistik-noron'
import { MINI_DIL_MODELI } from './mini-dil-modeli'
import { MLP } from './mlp'
import { MODEL_DAMITMA } from './model-damitma'
import { NAIVE_BAYES } from './naive-bayes'
import { NESNE_TAKIBI } from './nesne-takibi'
import { OLAY_DONGUSU } from './olay-dongusu'
import { ONBELLEK } from './onbellek'
import { ONERI_SISTEMI } from './oneri-sistemi'
import { OVERFIT } from './overfit'
import { PCA } from './pca'
import { PERCEPTRON } from './perceptron'
import { Q_OGRENME } from './q-ogrenme'
import { RAG } from './rag'
import { RAKAM_TANIMA } from './rakam-tanima'
import { RASTGELE_ORMAN } from './rastgele-orman'
import { REGRESSION } from './regression'
import { SHAP } from './shap-degerleri'
import { SIRALAMA } from './siralama-algoritmalari'
import { TREE } from './tree'
import { YAPAY_ZEKA_AJANI } from './yapay-zeka-ajani'
import { YIGIN_VE_OBEK } from './yigin-ve-obek'
import { YUZ_DOGRULAMA } from './yuz-dogrulama'
import { ZINCIR_KURALI } from './zincir-kurali'

const ALL = [AKTIVASYON, AYNI_KOD, BOLGE_IHLALI, BORUTA, CI_CD_HATTI, COP_TOPLAMA, DBSCAN, SVM, DIKKAT, DUSME_TESPITI, GERI_YAYILIM, GIT_DALLARI, GORUNTU_URETECI, GRADYAN_ARTIRMA, GRADYAN_INISI, HIZ_SINIRI, IKILI_ARAMA, KELIME_VEKTORLERI, KESINLIK_DUYARLILIK, KILITLENME, KMEANS, KNN, KONTEYNER_OLCEKLEME, LOJISTIK_NORON, MINI_DIL_MODELI, MLP, MODEL_DAMITMA, NAIVE_BAYES, NESNE_TAKIBI, OLAY_DONGUSU, ONBELLEK, ONERI_SISTEMI, OVERFIT, PCA, PERCEPTRON, Q_OGRENME, RAG, RAKAM_TANIMA, RASTGELE_ORMAN, REGRESSION, SHAP, SIRALAMA, TREE, YAPAY_ZEKA_AJANI, YIGIN_VE_OBEK, YUZ_DOGRULAMA, ZINCIR_KURALI].map((l) => l as unknown as Lesson)
const BY_SLUG = new Map(ALL.map((l) => [l.slug, l]))

/** Bölüm sırasıyla tüm dersler; `n` kurs boyunca 1'den başlar, `section` bölüm kimliğidir. */
export const LESSONS: Lesson[] = SECTIONS.flatMap((s) => s.slugs.map((slug) => {
  const l = BY_SLUG.get(slug)
  if (!l) throw new Error(`ML dersi bulunamadı: ${slug}`)
  return { ...l, section: s.id }
})).map((l, i) => ({ ...l, n: i + 1 }))
export const lessonBySlug = (slug: string): Lesson | undefined => LESSONS.find((l) => l.slug === slug)
