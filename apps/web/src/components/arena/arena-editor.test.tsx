import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { getArenaActivity } from '@/lib/arena/activity'
import { FREE_STARTERS, freeScenes } from '@/lib/arena/free'
import { ArenaEditor } from './arena-editor'

const html = (el: React.ReactElement) => renderToString(el).replaceAll('&quot;', '"').replaceAll('<!-- -->', '')

describe('ArenaEditor (ders modu)', () => {
  const act = getArenaActivity('robotik:1:4')!
  const h = html(<ArenaEditor scene={act.scene} initialCode={act.starter()} goals={act.goals} quickSend={act.quickSend} />)

  it('yuvarlak ▶ ⏸ ■ ↺ düğmeleri vardır; yalnız ▶ ve ↺ başlangıçta etkin', () => {
    for (const id of ['run', 'pause', 'stop', 'reset']) expect(h).toContain(`data-testid="arena-${id}"`)
    expect(h).toMatch(/data-testid="arena-pause"[^>]*disabled/)
    expect(h).toMatch(/data-testid="arena-stop"[^>]*disabled/)
    expect(h).not.toMatch(/data-testid="arena-run"[^>]*disabled/)
    expect(h).not.toMatch(/data-testid="arena-reset"[^>]*disabled/)
  })
  it('hız ayarı 1x/2x/4x, 1x seçili', () => {
    for (const s of [1, 2, 4]) expect(h).toContain(`data-testid="arena-speed-${s}"`)
    expect(h).toMatch(/data-testid="arena-speed-1"[^>]*aria-pressed="true"/)
    expect(h).toMatch(/data-testid="arena-speed-4"[^>]*aria-pressed="false"/)
  })
  it('başlangıç durumu: Hazır, 00:00.000, derleme ipucu, arena tuvali ve robot', () => {
    expect(h).toContain('Hazır'); expect(h).toContain('00:00.000'); expect(h).toContain('data-status="idle"')
    expect(h).toContain('data-testid="arena-canvas"'); expect(h).toContain('data-testid="arena-robot"')
  })
  it('hedef paneli etkinliğin hedeflerini gösterir, başlangıçta hiçbiri tamam değil', () => {
    expect(h).toContain('data-testid="arena-goals"')
    for (const g of act.goals) expect(h).toContain(`data-goal="${g.id}"`)
    expect(h).not.toContain('data-done="true"') // başlangıçta (kod hedefleri dahil) hiçbiri sağlanmaz
  })
  it('sensör paneli, seri monitör ve hızlı komutlar vardır; hızlı komutlar başlamadan kapalıdır', () => {
    expect(h).toContain('data-testid="arena-sensors"'); expect(h).toContain('Seri monitör')
    expect(h).toContain('data-testid="arena-quick"')
    expect(h).toMatch(/<button[^>]*disabled[^>]*>W200<\/button>/)
  })
  it('kod düzenleyici başlangıç kodunu taşır (tab: robot.ino)', () => { expect(h).toContain('robot.ino'); expect(h).toContain('data-testid="lab-code"') })
  it('sahne seçici ders modunda görünmez', () => expect(h).not.toContain('arena-scene-select'))
})

describe('ArenaEditor (serbest mod)', () => {
  const scenes = freeScenes()
  const h = html(<ArenaEditor scene={scenes[0]} scenes={scenes} starters={FREE_STARTERS} initialCode={FREE_STARTERS[scenes[0].id]} storageKey="ask:arena:sandbox" />)
  it('sahne seçici tüm hazır sahneleri listeler', () => {
    expect(h).toContain('data-testid="arena-scene-select"')
    for (const s of scenes) expect(h).toContain(`>${s.title}</option>`)
    expect(scenes.map((s) => s.id)).toEqual(['cizgi-kolay', 'cizgi-zor', 'engelli', 'tampon', 'labirent', 'duz-yol'])
  })
  it('hedef paneli yoktur; seçili sahne çizilir', () => {
    expect(h).not.toContain('data-testid="arena-goals"')
    expect(h).toContain('data-scene="cizgi-kolay"')
  })
})

describe('ArenaEditor (kol sahnesi)', () => {
  it('kol sahnesinde kol tuvali ve eklem paneli çizilir', async () => {
    const { armScene } = await import('@/lib/arena/arm-scenes')
    const sc = armScene()
    const out = html(<ArenaEditor scene={sc} initialCode="void setup(){} void loop(){}" />)
    expect(out).toContain('data-testid="arena-gripper"'); expect(out).toContain('Eklemler')
  })
})

describe('ArenaEditor (yol sekmeleri: Modül 5, 112-113)', () => {
  const show = (key: string) => { const a = getArenaActivity(key)!; return html(<ArenaEditor scene={a.scene} initialCode={a.starter()} goals={a.goals} quickSend={a.quickSend} />) }
  it('112 ve 113: A, B ve C sekmeleri görünür; temel yol A seçili', () => {
    for (const key of ['robotik:8:2', 'robotik:8:3']) {
      const h = show(key)
      expect(h).toContain('data-testid="arena-variants"')
      for (const v of ['arac', 'kol', 'takip']) expect(h).toContain(`data-variant="${v}"`)
      expect(h).toMatch(/data-variant="arac"[^>]*>A: Araç</)
      expect(h).toMatch(/aria-selected="true"[^>]*aria-pressed="true"[^>]*data-variant="arac"/)
    }
  })
  it('yol sekmesi olmayan derslerde sekme çubuğu yoktur', () => { expect(show('robotik:1:4')).not.toContain('arena-variants') })
  it('serbest modda sekme çubuğu yoktur', () => {
    const scenes = freeScenes()
    expect(html(<ArenaEditor scene={scenes[0]} scenes={scenes} starters={FREE_STARTERS} initialCode={FREE_STARTERS[scenes[0].id]} />)).not.toContain('arena-variants')
  })
  it('denge sahnesinde "İt" düğmeleri vardır (başlamadan kapalı)', () => {
    const h = show('robotik:6:5')
    expect(h).toContain('data-testid="arena-push"')
    expect(h).toMatch(/<button[^>]*disabled[^>]*data-push="200"/)
  })
})
