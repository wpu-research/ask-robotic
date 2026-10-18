// Q-öğrenme: tek öğrenme satırı yeterli oyundan sonra en kısa yolu (18 adım) bulur; eski tablo yeni planda takılır.
import { describe, expect, it } from 'vitest'
import { MAZES, Q_OGRENME, greedyPath, playGame, shortestPath, train } from './q-ogrenme'
import { rng } from './core'

describe('q-öğrenme', () => {
  it('kareler geçerli, hızlı ve deterministik', () => {
    for (const maze of [0, 1]) {
      const t0 = performance.now()
      const F = Q_OGRENME.run({ games: 60, maze })
      expect(performance.now() - t0).toBeLessThan(500)
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(Q_OGRENME.code.length)
      expect(Q_OGRENME.run({ games: 60, maze }).at(-1)!.cap).toEqual(F.at(-1)!.cap)
    }
  })
  it('labirentler çözülebilir: en kısa yol 18 ve 20 adım, tablo 220 puan', () => {
    expect(shortestPath(MAZES[0])).toBe(18)
    expect(shortestPath(MAZES[1])).toBe(20)
    expect(MAZES[0].length * MAZES[0][0].length * 4).toBe(220)
  })
  it('ilk oyun çok uzun; yeterli oyundan sonra açgözlü yol 18 adım', () => {
    const { Q, log } = train(MAZES[0], 60)
    console.log('q-öğrenme adımlar', log.map((g) => g.steps).join(' '), '· ilk oyun çarpma', log[0].bumps)
    expect(log[0].steps).toBeGreaterThan(5 * 18)
    const g = greedyPath(MAZES[0], Q)
    expect(g.reached).toBe(true)
    expect(g.steps).toBe(18)
    expect(log.slice(-20).every((x) => x.steps === 18)).toBe(true)
    // sahnedeki son yazı aynı sayıları söyler
    const last = Q_OGRENME.run({ games: 60, maze: 0 }).at(-1)!
    expect(last.cap[0]).toMatch(/18 adımlık en kısa yol/)
    expect(last.stat![0]).toContain(`ilk oyun ${log[0].steps} adım`)
  })
  it('yeni planda eski tablo (öğrenme kapalı) takılır, yeniden öğrenme 20 adımı bulur', () => {
    const { Q } = train(MAZES[0], 60)
    const old = playGame(MAZES[1], Q, rng(41), false, 400)
    expect(old.reached).toBe(false)
    const fresh = train(MAZES[1], 60, 15)
    expect(greedyPath(MAZES[1], fresh.Q).steps).toBe(20)
  })
})
