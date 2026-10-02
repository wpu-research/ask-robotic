import { describe, expect, it } from 'vitest'
import { OyunSession } from './session'
import { SAMPLES } from './samples'
import { validateProject } from './project'
import { toJavaScript } from './codegen'
import { TILE } from './types'
import type { Button } from './types'

/** Basit oyuncu botları: her örnek oyun için başsız oynama stratejisi + beklenen sonuç. */
type Bot = { frames: number; play: (s: OyunSession, f: number) => void; check: (s: OyunSession) => void }

function steer(s: OyunSession, tx: number, ty: number | null, tol = 3): void {
  const me = s.first('oyuncu')
  if (!me) return
  const want: Record<'left' | 'right' | 'up' | 'down', boolean> = { left: me.x > tx + tol, right: me.x < tx - tol, up: false, down: false }
  if (ty !== null) { want.up = me.y > ty + tol; want.down = me.y < ty - tol }
  for (const k of ['left', 'right', 'up', 'down'] as const) { if (want[k]) s.press(k); else s.release(k) }
}

const BOTS: Record<string, Bot> = {
  yakalamaca: {
    frames: 60 * 20,
    play: (s) => {
      const fr = s.sprites('yiyecek').sort((a, b) => b.y - a.y)[0]
      steer(s, fr ? fr.x : 80, null, 2)
    },
    check: (s) => { expect(s.engine.score).toBeGreaterThanOrEqual(10); expect(s.engine.life).toBe(3) },
  },
  'balon-patlat': {
    frames: 60 * 25,
    play: (s, f) => {
      const t = s.sprites('hedef').filter((b) => b.y > 8 && b.y < 112).sort((a, b) => b.y - a.y)[0]
      const me = s.first('oyuncu')
      if (t) steer(s, t.x, t.y, 2)
      if (t && me && s.engine.overlapping(me, t) && f % 6 === 0) s.engine.press('a')
      else s.engine.release('a')
    },
    check: (s) => expect(s.engine.score).toBeGreaterThanOrEqual(8),
  },
  'uzay-gemisi': {
    frames: 60 * 20,
    play: (s, f) => {
      const t = s.sprites('dusman').filter((e) => e.y > 0).sort((a, b) => b.y - a.y)[0]
      steer(s, t ? t.x : 80, 100, 2)
      if (f % 20 === 0) s.engine.press('a'); else if (f % 20 === 3) s.engine.release('a')
    },
    check: (s) => expect(s.engine.score).toBeGreaterThanOrEqual(30),
  },
  'tugla-kirma': {
    frames: 60 * 60,
    play: (s) => {
      const top = s.first('mermi'), raket = s.first('oyuncu')
      if (top && raket) steer(s, top.x, null, 2)
    },
    check: (s) => expect(s.engine.score).toBeGreaterThanOrEqual(100),
  },
  kosucu: {
    frames: 60 * 20,
    play: (s) => {
      const k = s.first('oyuncu')
      const ob = s.sprites('engel').filter((e) => e.x > k.x).sort((a, b) => a.x - b.x)[0]
      if (ob && ob.x - k.x <= 0.43 * -ob.vx + 1 && ob.x - k.x > 10) s.engine.press('a'); else s.engine.release('a')
    },
    check: (s) => { expect(s.engine.state).toBe('running'); expect(s.engine.score).toBeGreaterThanOrEqual(15) },
  },
  labirent: {
    frames: 60 * 90,
    play: (s) => {
      const e = s.engine, me = s.first('oyuncu'), m = e.map!
      const col = Math.floor(me.x / TILE), row = Math.floor(me.y / TILE)
      // en yakın altına (BFS) giden ilk adım
      const prev = new Map<number, number>()
      const q = [row * m.cols + col]
      prev.set(q[0], -1)
      let goal = -1
      for (let h = 0; h < q.length && goal < 0; h++) {
        const cur = q[h], cx = cur % m.cols, cy = Math.floor(cur / m.cols)
        if (m.cells[cur] === 'nesne-altin') { goal = cur; break }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx, ny = cy + dy, id = ny * m.cols + nx
          if (nx < 0 || ny < 0 || nx >= m.cols || ny >= m.rows || prev.has(id) || e.isWall(nx, ny)) continue
          prev.set(id, cur)
          q.push(id)
        }
      }
      if (goal < 0) return
      let step = goal
      while (prev.get(step) !== row * m.cols + col && prev.get(step) !== -1) step = prev.get(step)!
      const tx = (step % m.cols) * TILE + TILE / 2, ty = Math.floor(step / m.cols) * TILE + TILE / 2
      // önce ortalan, sonra ilerle
      const cx = col * TILE + TILE / 2, cy = row * TILE + TILE / 2
      const horizontal = tx !== cx
      const off = horizontal ? Math.abs(me.y - cy) : Math.abs(me.x - cx)
      if (off > 1.5) steer(s, horizontal ? me.x : cx, horizontal ? cy : me.y, 1)
      else steer(s, tx, ty, 1)
    },
    check: (s) => { expect(s.engine.result).toBe('win'); expect(s.engine.score).toBe(5) },
  },
  'platform-atlayici': {
    frames: 60 * 60,
    play: (s, f) => {
      const e = s.engine, h = s.first('oyuncu')
      e.press('right')
      const enemyAhead = s.sprites('dusman').some((d) => d.x > h.x && d.x - h.x < 34 && Math.abs(d.y - h.y) < 14)
      const spikeAhead = e.tileAt(Math.floor((h.x + 26) / TILE), 12) === 'karo-diken' || e.tileAt(Math.floor((h.x + 18) / TILE), 12) === 'karo-diken'
      if (h.touch.down && (enemyAhead || spikeAhead || h.touch.right)) e.press('a'); else if (f % 3 === 0) e.release('a')
    },
    check: (s) => { expect(s.engine.result).toBe('win'); expect(s.engine.score).toBeGreaterThanOrEqual(1) },
  },
  yilan: {
    frames: 60 * 20,
    play: (s) => {
      const e = s.engine
      const bas = s.first('oyuncu'), yem = s.first('yiyecek')
      if (!bas || !yem) return
      const dx = yem.x - bas.x, dy = yem.y - bas.y
      // yalnızca kafa hizalanmışken yön değiştirir (gövde ters yöne dönmeye izin vermez)
      const horiz = e.isDown('left') || e.isDown('right')
      void horiz
      const ax = Math.abs(dx), ay = Math.abs(dy)
      const want: Button | null = ax > 2 && (ax >= ay || ay <= 2) ? (dx > 0 ? 'right' : 'left') : ay > 2 ? (dy > 0 ? 'down' : 'up') : null
      for (const k of ['left', 'right', 'up', 'down'] as const) e.release(k)
      if (want) e.press(want)
    },
    check: (s) => expect(s.engine.score).toBeGreaterThanOrEqual(2),
  },
}

describe('örnek oyunlar', () => {
  it('8 örnek oyun var ve proje olarak doğrulanır', () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(8)
    for (const smp of SAMPLES) {
      const p = smp.project()
      expect(validateProject(JSON.parse(JSON.stringify(p))), smp.id).not.toBeNull()
      expect(toJavaScript(p.blocks).length, smp.id).toBeGreaterThan(40)
    }
  })

  for (const smp of SAMPLES) {
    it(`${smp.id}: 20 sn boyunca hatasız çalışır (bot'suz)`, () => {
      const s = new OyunSession(smp.project(), { seed: 7 })
      s.start().tick(60 * 20)
      expect(s.error, JSON.stringify(s.error)).toBeNull()
      expect(s.engine.sprites.length).toBeGreaterThan(0)
    })
    const bot = BOTS[smp.id]
    if (bot) {
      it(`${smp.id}: bot oynayınca hedefe ulaşır`, () => {
        const s = new OyunSession(smp.project(), { seed: 3 })
        s.start().play(bot.frames, bot.play)
        expect(s.error, JSON.stringify(s.error)).toBeNull()
        bot.check(s)
      })
    }
  }
})

void TILE
