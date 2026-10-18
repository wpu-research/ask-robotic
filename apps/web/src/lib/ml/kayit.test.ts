// Kurs kaydı: her bölümdeki her ders var, numaralar kesintisiz, her dersin bir sahnesi var.
import { describe, expect, it } from 'vitest'
import { LESSONS } from './lessons'
import { SECTIONS } from './sections'
import { DRAW } from '@/components/ml/draw'
import { SCENES } from '@/components/ml/scenes'

describe('ML kurs kaydı', () => {
  it('bölümlerdeki tüm slug’lar derse dönüşür, numaralar 1’den kesintisiz', () => {
    expect(LESSONS.length).toBe(SECTIONS.reduce((s, x) => s + x.slugs.length, 0))
    LESSONS.forEach((l, i) => expect(l.n).toBe(i + 1))
    expect(new Set(LESSONS.map((l) => l.slug)).size).toBe(LESSONS.length)
    for (const l of LESSONS) expect(SECTIONS.some((s) => s.id === l.section), l.slug).toBe(true)
  })
  it('her dersin bir sahnesi var', () => {
    for (const l of LESSONS) expect(typeof (DRAW[l.slug] ?? SCENES[l.slug]), l.slug).toBe('function')
  })
})
