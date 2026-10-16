// Makine Öğrenmesi (sıfırdan) ders listesi, sırasıyla. Her ders lib/ml/<ders>.ts'te; çizimi components/ml/draw.ts'te.
import type { Lesson } from './core'
import { REGRESSION } from './regression'
import { OVERFIT } from './overfit'
import { KNN } from './knn'
import { NAIVE_BAYES } from './naive-bayes'
import { TREE } from './tree'
import { KMEANS } from './kmeans'
import { PCA } from './pca'
import { PERCEPTRON } from './perceptron'
import { MLP } from './mlp'

export const LESSONS: Lesson[] = [REGRESSION, OVERFIT, KNN, NAIVE_BAYES, TREE, KMEANS, PCA, PERCEPTRON, MLP].map((l) => l as unknown as Lesson).sort((a, b) => a.n - b.n)
export const lessonBySlug = (slug: string): Lesson | undefined => LESSONS.find((l) => l.slug === slug)
