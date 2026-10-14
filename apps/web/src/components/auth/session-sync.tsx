'use client'
// Oturum açıksa tarayıcıdaki öğrenme durumunu (oyun, tamamlanan dersler, profil) sunucuyla eşitler.
// 1) Açılışta: yerel durum bu hesaba aitse (ya da sahipsizse = misafirken yapılanlar) sunucuya gönderilir ve birleştirilir;
//    başka hesaba aitse atılır. Birleşik sunucu durumu localStorage'a yazılır (anahtar ve biçim aynı).
// 2) Sonra: yerel değişiklikler gecikmeli (debounce) gönderilir; XP kazanımları xp_events defterine yazılır.
import { useEffect } from 'react'
import { XP_EVENT, type XpGain } from '@/lib/gamification'
import { emptyGame, mergeGame, parseGame, type GameState } from '@/lib/gamification-core'
import { parseProfile } from '@/lib/profile'
import { parseIds } from '@/lib/progress-store'
import { LOCAL, OWNER_KEY, loadMe } from '@/lib/session'

const DEBOUNCE_MS = 2500

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch { /* yoksay */ } }

async function send<T>(method: 'POST' | 'PUT', url: string, body: unknown, keepalive = false): Promise<T | null> {
  const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive }).catch(() => null)
  return res?.ok ? ((await res.json().catch(() => null)) as T | null) : null
}

const hasActivity = (g: GameState) => Object.keys(g.days).length > 0 || g.lessonXp.length > 0 || g.frozen.length > 0

export function SessionSync() {
  useEffect(() => {
    let alive = true
    let ready = false // açılış eşitlemesi bitti, kullanıcı var
    let suppress = false // kendi yazdıklarımızın olaylarını yok say
    let known = new Set<number>()
    const timers = new Map<string, ReturnType<typeof setTimeout>>()
    let xpQueue: XpGain[] = []

    const pushGame = (keepalive = false) => send('POST', '/api/me/game', { game: parseGame(read(LOCAL.game.key)) }, keepalive)
    const pushProgress = async (keepalive = false) => {
      const ids = [...parseIds(read(LOCAL.progress.key) ?? '[]')]
      if (!ids.some((id) => !known.has(id))) return
      const r = await send<{ doneLessonIds: number[] }>('POST', '/api/me/progress', { lessonIds: ids }, keepalive)
      if (r) known = new Set(r.doneLessonIds)
    }
    const pushProfile = (keepalive = false) => {
      const p = parseProfile(read(LOCAL.profile.key))
      return p ? send('PUT', '/api/me/profile', { profile: p }, keepalive) : null
    }
    const flushXp = async (keepalive = false) => {
      while (xpQueue.length) {
        const items = xpQueue.slice(0, 20)
        xpQueue = xpQueue.slice(20)
        if (!(await send('POST', '/api/me/xp', { items }, keepalive))) break // başarısız: kayıp kabul (defter yalnız lig içindir)
      }
    }
    const jobs: Record<string, (keepalive?: boolean) => unknown> = { game: pushGame, progress: pushProgress, profile: pushProfile, xp: flushXp }

    const schedule = (name: string) => {
      if (suppress) return
      clearTimeout(timers.get(name))
      timers.set(name, setTimeout(() => { timers.delete(name); if (ready) void jobs[name]() }, DEBOUNCE_MS))
    }
    const onGame = () => schedule('game')
    const onProgress = () => schedule('progress')
    const onProfile = () => schedule('profile')
    const onXp = (e: Event) => {
      const g = (e as CustomEvent<XpGain>).detail
      if (!g || !alive) return
      xpQueue.push(g)
      schedule('xp')
    }
    const onHide = () => {
      if (document.visibilityState !== 'hidden' || !ready) return
      for (const [name, t] of timers) { clearTimeout(t); timers.delete(name); void jobs[name](true) }
    }
    window.addEventListener(LOCAL.game.event, onGame)
    window.addEventListener(LOCAL.progress.event, onProgress)
    window.addEventListener(LOCAL.profile.event, onProfile)
    window.addEventListener(XP_EVENT, onXp)
    document.addEventListener('visibilitychange', onHide)

    void (async () => {
      const me = await loadMe()
      if (!alive) return
      if (!me?.user) { xpQueue = []; return } // misafir: her şey tarayıcıda kalır
      const uid = me.user.id
      const owner = read(OWNER_KEY)
      const mine = !owner || owner === uid

      let game: GameState | null = me.game
      let done = me.doneLessonIds
      let profile = me.profile
      if (mine) {
        const localGame = parseGame(read(LOCAL.game.key))
        if (hasActivity(localGame)) game = (await send<{ game: GameState }>('POST', '/api/me/game', { game: localGame }))?.game ?? mergeGame(game ?? emptyGame(), localGame)
        const localIds = [...parseIds(read(LOCAL.progress.key) ?? '[]')]
        const server = new Set(done)
        if (localIds.some((id) => !server.has(id))) done = (await send<{ doneLessonIds: number[] }>('POST', '/api/me/progress', { lessonIds: localIds }))?.doneLessonIds ?? done
        const localProfile = parseProfile(read(LOCAL.profile.key))
        if (localProfile && (!profile || localProfile.createdAt > profile.createdAt)) {
          await send('PUT', '/api/me/profile', { profile: localProfile })
          profile = localProfile
        }
      } else {
        xpQueue = [] // önceki hesabın kazanımları bu hesaba yazılmaz
      }
      if (!alive) return

      // Birleşik durumu geri yaz; istek sürerken yerelde olanlar kaybolmasın diye yerel (bu hesabınsa) yeniden birleştirilir
      suppress = true
      try {
        const nowGame = mine ? parseGame(read(LOCAL.game.key)) : emptyGame()
        const finalGame = game ? mergeGame(game, nowGame) : mine ? nowGame : null
        write(LOCAL.game.key, finalGame && hasActivity(finalGame) ? JSON.stringify(finalGame) : mine ? read(LOCAL.game.key) : null)
        const ids = new Set(done)
        if (mine) for (const id of parseIds(read(LOCAL.progress.key) ?? '[]')) ids.add(id)
        write(LOCAL.progress.key, JSON.stringify([...ids]))
        write(LOCAL.profile.key, profile ? JSON.stringify(profile) : mine ? read(LOCAL.profile.key) : null)
        write(OWNER_KEY, uid)
        for (const ev of [LOCAL.game.event, LOCAL.progress.event, LOCAL.profile.event]) window.dispatchEvent(new Event(ev))
      } finally { suppress = false }
      known = new Set(done)
      ready = true
      if (xpQueue.length) schedule('xp')
    })()

    return () => {
      alive = false
      for (const t of timers.values()) clearTimeout(t)
      window.removeEventListener(LOCAL.game.event, onGame)
      window.removeEventListener(LOCAL.progress.event, onProgress)
      window.removeEventListener(LOCAL.profile.event, onProfile)
      window.removeEventListener(XP_EVENT, onXp)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])
  return null
}
