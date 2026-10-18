'use client'
// Demo sayfasının istemci kısmı: slug → demo uygulaması, ortak sahneye (DemoHost) verilir.
import { demoOf, type Demo } from '@/lib/cv-demolar'
import { fallDemo, hotDemo, postureDemo, zoneDemo } from './demos-body'
import { fatigueDemo, fruitDemo, pulseDemo, trafficDemo } from './demos-pixel'
import { DemoHost, type DemoImpl, type L } from './host'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DEMO_IMPLS: Record<Demo['slug'], DemoImpl<any>> = {
  'dusme-tespiti': fallDemo, 'bolge-ihlali': zoneDemo, 'sicak-bolge': hotDemo, 'durus-analizi': postureDemo,
  'nabiz-rppg': pulseDemo, 'trafik-sayaci': trafficDemo, 'meyve-olgunlugu': fruitDemo, yorgunluk: fatigueDemo,
}

export function DemoView({ slug, lang }: { slug: Demo['slug']; lang: L }) {
  const demo = demoOf(slug)!
  return <DemoHost key={slug} demo={demo} impl={DEMO_IMPLS[slug]} lang={lang} />
}
