import type { Activity } from '../activity'
import { countBlocks, hasRunnableScript, pageCount, runnableScripts, simulate } from '../analysis'
import { BLOCK_BY_TYPE } from '../blocks'
import { newId, scriptIsRunnable } from '../ops'
import { block, emptyProject, singleSprite, script } from '../starters'
import type { Block, BlockType, Page, Project, Script, Sprite } from '../types'

// ---- Yardımcılar ----

const B = (type: BlockType, value?: number, children?: Block[], text?: string): Block =>
  block(type, {
    ...(value !== undefined ? { value } : {}),
    ...(text !== undefined ? { text } : {}),
    ...(children ? { children } : {}),
  })

const mkSprite = (character: string, x: number, y: number, ...scripts: Script[]): Sprite => ({ id: newId('sp'), character, x, y, scripts })
const mkPage = (background: string, ...sprites: Sprite[]): Page => ({ id: newId('pg'), background, sprites })

const flatten = (blocks: Block[], out: Block[] = []): Block[] => {
  for (const b of blocks) {
    out.push(b)
    if (b.children) flatten(b.children, out)
  }
  return out
}

/** Verilen tetikleyiciyle başlayan (çalışabilen) betiklerdeki tüm bloklar, iç bloklar dahil. */
const runnableBlocks = (p: Project, trigger?: 'flag' | 'tap'): Block[] =>
  runnableScripts(p).filter((s) => !trigger || s.blocks[0].type === trigger).flatMap((s) => flatten(s.blocks))

/** Tekrarla / Sonsuza kadar içindeki bloklar (yalnız çalışabilen betiklerde). */
const loopBodies = (p: Project, trigger?: 'flag' | 'tap'): Block[] => {
  const out: Block[] = []
  const walk = (blocks: Block[], inside: boolean) => {
    for (const b of blocks) {
      if (inside) out.push(b)
      if (b.children) walk(b.children, inside || !!BLOCK_BY_TYPE[b.type].container)
    }
  }
  for (const s of runnableScripts(p)) if (!trigger || s.blocks[0].type === trigger) walk(s.blocks, false)
  return out
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

const MOTION_LOOKS = (t: BlockType) => ['motion', 'looks'].includes(BLOCK_BY_TYPE[t].category)

// ---- 1.2 Üç adım yürü ----

const walkStart = { x: 60, y: 198 }

const walk3: Activity = {
  intro: 'Kediyi yürüt! Önce Yeşil bayrak, sonra İleri blokları. 🏁 Başlat\'a basınca kedi bloklara göre yürür.',
  starter: () => singleSprite({ character: 'cat', background: 'grass', ...walkStart }),
  allowedBlocks: ['flag', 'forward', 'back', 'turnRight', 'turnLeft'],
  allowPages: false,
  allowSprites: false,
  goals: [
    {
      id: 'flag',
      text: 'Betiğin en üstüne Yeşil bayrak bloğunu koy.',
      check: (p) => hasRunnableScript(p, 'flag'),
      hint: 'Başlat kategorisindeki 🏁 Yeşil bayrak bloğuna dokun. Betik onunla başlar.',
    },
    {
      id: 'forward3',
      text: 'En az 3 tane İleri bloğu ekle.',
      check: (p) => runnableBlocks(p, 'flag').filter((b) => b.type === 'forward').length >= 3,
      hint: 'Hareket kategorisinde İleri bloğuna 3 kez dokun. Bloklar alt alta dizilir.',
    },
    {
      id: 'turn',
      text: 'Bir dönüş ekle: Sağa dön ya da Sola dön.',
      check: (p) => runnableBlocks(p, 'flag').some((b) => b.type === 'turnRight' || b.type === 'turnLeft'),
      hint: 'Hareket kategorisinden Sağa dön bloğuna dokun.',
    },
    {
      id: 'far',
      text: 'Kedi yürüyerek başladığı yerden uzaklaşsın.',
      check: (p) => {
        const start = p.pages[0].sprites[0]
        const end = simulate(p, { press: 'flag', ms: 15000 }).snapshot.sprites.find((s) => s.id === start.id)
        return !!end && dist(start, end) >= 60
      },
      hint: 'İleri bloklarının adım sayısını − ve + ile artır, sonra 🏁 Başlat\'a bas.',
    },
  ],
  solution: () => {
    const p = singleSprite({ character: 'cat', background: 'grass', ...walkStart })
    p.pages[0].sprites[0].scripts = [script(B('flag'), B('forward', 3), B('turnRight', 90), B('forward', 3), B('forward', 3))]
    return p
  },
}

// ---- 2.2 Dans eden kedi ----

const danceBlocks: BlockType[] = [
  'flag', 'forward', 'back', 'turnRight', 'turnLeft', 'hop', 'grow', 'shrink', 'resetSize', 'pop', 'repeat', 'forever',
]

const dance: Activity = {
  intro: 'Kedi kendi kendine dans etsin! Dans adımlarını Tekrarla bloğunun içine koy ve bir ses ekle.',
  starter: () => emptyProject('cat', 'room'),
  allowedBlocks: danceBlocks,
  allowPages: false,
  allowSprites: false,
  goals: [
    {
      id: 'flag',
      text: 'Dansı Yeşil bayrak ile başlat.',
      check: (p) => hasRunnableScript(p, 'flag'),
      hint: 'Başlat kategorisindeki 🏁 Yeşil bayrak bloğuyla başla.',
    },
    {
      id: 'loop',
      text: 'Tekrarla ya da Sonsuza kadar bloğunun içine en az 2 dans adımı (hareket ya da görünüm bloğu) koy.',
      check: (p) => loopBodies(p, 'flag').filter((b) => MOTION_LOOKS(b.type)).length >= 2,
      hint: 'Blokları sürükleyip C şeklindeki Tekrarla bloğunun içine bırak.',
    },
    {
      id: 'sound',
      text: 'Dans ederken bir ses çalsın.',
      check: (p) => simulate(p, { press: 'flag', ms: 6000 }).events.some((e) => e.kind === 'sound'),
      hint: 'Ses kategorisinden Ses çal bloğunu ekle. Betiğin içinde, Sonsuza kadar\'dan önce ya da C\'nin içinde olsun.',
    },
  ],
  solution: () => {
    const p = emptyProject('cat', 'room')
    p.pages[0].sprites[0].scripts = [
      script(B('flag'), B('repeat', 4, [B('forward', 1), B('hop', 1), B('pop', 1), B('back', 1), B('grow')])),
    ]
    return p
  },
}

// ---- 3.2 Konuşan hayvan ----

const speakBlocks: BlockType[] = [
  'flag', 'tap', 'forward', 'back', 'turnRight', 'turnLeft', 'hop', 'goHome',
  'say', 'grow', 'shrink', 'resetSize', 'pop', 'wait', 'repeat', 'forever',
]

const talk: Activity = {
  intro: 'Hayvana dokununca konuşsun! Dokununca bloğuyla başla, Söyle ve Bekle bloklarını ekle.',
  starter: () => emptyProject('dog', 'grass'),
  allowedBlocks: speakBlocks,
  allowPages: false,
  allowSprites: true,
  goals: [
    {
      id: 'tap',
      text: 'Betiği Dokununca bloğuyla başlat.',
      check: (p) => hasRunnableScript(p, 'tap'),
      hint: 'Başlat kategorisindeki 👆 Dokununca bloğuna dokun.',
    },
    {
      id: 'say-wait',
      text: 'Betiğe bir Söyle ve bir Bekle bloğu ekle.',
      check: (p) => {
        const bs = runnableBlocks(p, 'tap')
        return bs.some((b) => b.type === 'say') && bs.some((b) => b.type === 'wait')
      },
      hint: 'Görünüm kategorisinde Söyle, Kontrol kategorisinde Bekle bloğu var.',
    },
    {
      id: 'speaks',
      text: 'Hayvana dokununca konuşsun.',
      check: (p) =>
        p.pages[0].sprites.some((s) =>
          simulate(p, { press: { tap: s.id }, ms: 4000 }).events.some((e) => e.kind === 'say' && e.spriteId === s.id && e.text.trim() !== ''),
        ),
      hint: 'Söyle bloğuna bir cümle yaz. Betiğin en üstünde Dokununca bloğu olsun.',
    },
    {
      id: 'ball',
      text: 'Bonus: ikinci bir karakter ekle (örneğin Top). Ona dokununca zıplasın.',
      check: (p) =>
        p.pages[0].sprites.length >= 2 &&
        p.pages[0].sprites.slice(1).some((s) => simulate(p, { press: { tap: s.id }, ms: 3000 }).events.some((e) => e.kind === 'hop' && e.spriteId === s.id)),
      hint: 'Karakter şeridindeki + ile Top\'u ekle, şeritten seç. Ona Dokununca ve Zıpla bloklarını ver.',
    },
  ],
  solution: () => {
    const p = emptyProject('dog', 'grass')
    const dog = p.pages[0].sprites[0]
    dog.scripts = [script(B('tap'), B('say', undefined, undefined, 'Merhaba, ben köpeğim!'), B('wait', 1), B('say', undefined, undefined, 'Benimle oynar mısın?'))]
    p.pages[0].sprites.push(mkSprite('ball', 380, 250, script(B('tap'), B('hop', 2))))
    return p
  },
}

// ---- 4.2 İki sayfalı hikâye ----

const storyBlocks: BlockType[] = [
  'flag', 'tap', 'forward', 'back', 'turnRight', 'turnLeft', 'hop', 'goHome',
  'say', 'grow', 'shrink', 'resetSize', 'hide', 'show', 'pop', 'wait', 'repeat', 'goPage',
]

const story2: Activity = {
  intro: 'Hikâyen iki sahne (sayfa) olsun. Birinci sahne bitince Sayfaya git bloğuyla ikinciye geç.',
  starter: () => emptyProject('cat', 'grass'),
  allowedBlocks: storyBlocks,
  allowPages: true,
  allowSprites: true,
  goals: [
    {
      id: 'pages',
      text: 'En az 2 sayfa olsun.',
      check: (p) => pageCount(p) >= 2,
      hint: 'Sayfa şeridindeki + düğmesi yeni sayfa ekler.',
    },
    {
      id: 'bg',
      text: 'İki sayfanın arka planı farklı olsun.',
      check: (p) => p.pages.length >= 2 && p.pages[0].background !== p.pages[1].background,
      hint: 'Sayfayı seç, Arka plan listesinden başka bir manzara seç.',
    },
    {
      id: 'goto',
      text: 'Hikâye 1. sayfadan başlayıp 2. sayfaya geçsin.',
      check: (p) => simulate(p, { press: 'flag', ms: 15000 }).events.some((e) => e.kind === 'page' && e.page === 2),
      hint: '1. sayfadaki Yeşil bayrak betiğinin sonuna Bitiş kategorisinden Sayfaya git (2) bloğunu ekle.',
    },
    {
      id: 'page2-say',
      text: '2. sayfada bir karakter bir şey söylesin.',
      check: (p) => {
        if (p.pages.length < 2) return false
        const ids = new Set(p.pages[1].sprites.map((s) => s.id))
        return simulate(p, { press: 'flag', ms: 15000 }).events.some((e) => e.kind === 'say' && ids.has(e.spriteId))
      },
      hint: '2. sayfaya karakter ekle, ona Yeşil bayrak ve Söyle bloklarını ver.',
    },
  ],
  solution: () => {
    const p = emptyProject('cat', 'grass')
    p.pages[0].sprites[0].scripts = [
      script(B('flag'), B('forward', 3), B('say', undefined, undefined, 'Eve gidiyorum!'), B('goPage', 2)),
    ]
    p.pages.push(mkPage('night', mkSprite('house', 240, 198, script(B('flag'), B('say', undefined, undefined, 'Hoş geldin!')))))
    return p
  },
}

// ---- 5.1 Hata avı ----

const debugBlocks: BlockType[] = [
  'flag', 'tap', 'forward', 'back', 'turnRight', 'turnLeft', 'hop', 'goHome',
  'say', 'grow', 'shrink', 'resetSize', 'pop', 'wait', 'repeat', 'forever',
]

const CAT_START = { x: 48, y: 300 }
const STAR_POS = { x: 264, y: 108 }

const debug: Activity = {
  intro: 'Bu programda saklı hatalar var! Kedinin yıldızın yanına varması gerek. Hataları bul ve düzelt.',
  starter: () => {
    const p = emptyProject('cat', 'sky')
    const cat = mkSprite(
      'cat', CAT_START.x, CAT_START.y,
      // Hata 1: tekrar sayısı eksik (3 olmalı). Hata 2: yanlış dönüş yönü (Sola dön olmalı).
      script(B('flag'), B('repeat', 2, [B('forward', 3)]), B('turnRight', 90)),
      // Hata 3: başlatma bloğu yok, betik hiç çalışmaz.
      script(B('forward', 8)),
    )
    p.pages[0].sprites = [cat, mkSprite('star', STAR_POS.x, STAR_POS.y)]
    return p
  },
  allowedBlocks: debugBlocks,
  allowPages: false,
  allowSprites: false,
  goals: [
    {
      id: 'reach',
      text: 'Yeşil bayrağa basınca kedi yıldızın yanına varsın.',
      check: (p) => {
        const snap = simulate(p, { press: 'flag', ms: 20000 }).snapshot
        const star = snap.sprites.find((s) => s.character === 'star')
        const cats = snap.sprites.filter((s) => s.character === 'cat')
        return !!star && cats.some((c) => dist(c, star) <= 36)
      },
      hint: 'Kedi önce sağa, sonra yukarı gitmeli. Tekrarla sayısına ve dönüş yönüne bak.',
    },
    {
      id: 'no-dead',
      text: 'Çalışmayan betik kalmasın: her betik bir başlatma bloğuyla başlasın.',
      check: (p) => p.pages.every((pg) => pg.sprites.every((s) => s.scripts.every(scriptIsRunnable))),
      hint: 'Başlatma bloğu olmayan betik hiç çalışmaz. Ona Yeşil bayrak ekle ya da betiği sil.',
    },
  ],
  solution: () => {
    const p = emptyProject('cat', 'sky')
    p.pages[0].sprites = [
      mkSprite('cat', CAT_START.x, CAT_START.y, script(B('flag'), B('repeat', 3, [B('forward', 3)]), B('turnLeft', 90), B('forward', 8))),
      mkSprite('star', STAR_POS.x, STAR_POS.y),
    ]
    return p
  },
}

// ---- 5.2 Benim hikâyem (final) ----

const final: Activity = {
  intro: 'Kendi hikâyeni yap! Bir tekrar, bir konuşma ve iki sayfa olsun. Gerisi senin hayal gücün.',
  starter: () => emptyProject('cat', 'grass'),
  allowedBlocks: Object.keys(BLOCK_BY_TYPE) as BlockType[],
  allowPages: true,
  allowSprites: true,
  goals: [
    {
      id: 'runs',
      text: 'Hikâyen çalışsın: bir betik Yeşil bayrak ya da Dokununca ile başlasın.',
      check: (p) => hasRunnableScript(p),
      hint: 'Betiğin en üstüne Başlat kategorisinden bir başlatma bloğu koy.',
    },
    {
      id: 'loop',
      text: 'En az bir Tekrarla ya da Sonsuza kadar bloğu kullan.',
      check: (p) => runnableBlocks(p).some((b) => b.type === 'repeat' || b.type === 'forever'),
      hint: 'Kontrol kategorisinde Tekrarla, Bitiş kategorisinde Sonsuza kadar var.',
    },
    {
      id: 'say',
      text: 'Bir karakter bir şey söylesin (Söyle bloğu).',
      check: (p) => runnableBlocks(p).some((b) => b.type === 'say'),
      hint: 'Görünüm kategorisindeki Söyle bloğunu ekle ve cümleni yaz.',
    },
    {
      id: 'pages',
      text: 'Hikâyen en az 2 sayfa olsun.',
      check: (p) => pageCount(p) >= 2,
      hint: 'Sayfa şeridindeki + düğmesi yeni sayfa ekler.',
    },
    {
      id: 'variety',
      text: 'En az 2 farklı renkte (kategoride) blok kullan, örneğin mavi hareket ve mor görünüm.',
      check: (p) => new Set(runnableBlocks(p).map((b) => BLOCK_BY_TYPE[b.type].category).filter((c) => c !== 'start')).size >= 2,
      hint: 'Sekmelerin renklerine bak: hareket, görünüm, ses, kontrol ya da bitiş bloklarından karıştır.',
    },
  ],
  solution: () => {
    const p = emptyProject('cat', 'grass')
    p.pages[0].sprites[0].scripts = [
      script(B('flag'), B('repeat', 2, [B('forward', 2), B('hop', 1)]), B('say', undefined, undefined, 'Yoruldum!'), B('goPage', 2)),
    ]
    p.pages.push(mkPage('night', mkSprite('house', 240, 198, script(B('flag'), B('say', undefined, undefined, 'Hoş geldin!')))))
    return p
  },
}

// ---- 1.1 Robot oyunu ----

const ROBOT_START = { x: 48, y: 100 }
const GOAL_STAR = { x: 216, y: 244 }

const robotGame: Activity = {
  intro: 'Robotu yıldızın yanına götür! Robot yalnızca verdiğin komutları, verdiğin sırayla yapar.',
  starter: () => {
    const p = emptyProject('robot', 'plain')
    p.pages[0].sprites = [mkSprite('robot', ROBOT_START.x, ROBOT_START.y), mkSprite('star', GOAL_STAR.x, GOAL_STAR.y)]
    return p
  },
  allowedBlocks: ['flag', 'forward', 'turnRight', 'turnLeft', 'hop'],
  allowPages: false,
  allowSprites: false,
  goals: [
    {
      id: 'reach',
      text: 'Robot yıldızın yanına varsın.',
      check: (p) => {
        const snap = simulate(p, { press: 'flag', ms: 20000 }).snapshot
        const star = snap.sprites.find((s) => s.character === 'star')
        return !!star && snap.sprites.some((s) => s.character === 'robot' && dist(s, star) <= 36)
      },
      hint: 'Robot önce sağa gitmeli, sonra Sağa dön ile aşağı bakıp yürümeli. İleri bloklarının adım sayısını − ve + ile ayarla.',
    },
    {
      id: 'order',
      text: 'Sıra önemli: önce İleri, sonra bir dönüş, sonra yine İleri koy.',
      check: (p) =>
        runnableScripts(p).some((s) => {
          const t = s.blocks.map((b) => b.type)
          const turn = t.findIndex((x) => x === 'turnRight' || x === 'turnLeft')
          return turn > 0 && t.slice(0, turn).includes('forward') && t.slice(turn + 1).includes('forward')
        }),
      hint: 'Betik şöyle olsun: Yeşil bayrak, İleri, Sağa dön, İleri.',
    },
    {
      id: 'hop',
      text: 'Yıldıza varınca Zıpla ile kutla.',
      check: (p) => {
        const r = simulate(p, { press: 'flag', ms: 20000 })
        const star = r.snapshot.sprites.find((s) => s.character === 'star')
        if (!star) return false
        return r.events.some((e) => {
          if (e.kind !== 'hop') return false
          const pts = r.positions[e.spriteId]
          const robot = r.snapshot.sprites.find((s) => s.id === e.spriteId)
          if (!pts || !robot || robot.character !== 'robot') return false
          const at = pts.reduce((best, q) => (Math.abs(q.t - e.t) < Math.abs(best.t - e.t) ? q : best), pts[0])
          return dist(at, star) <= 36
        })
      },
      hint: 'Hareket kategorisinden Zıpla bloğunu betiğin en sonuna ekle.',
    },
  ],
  solution: () => {
    const p = emptyProject('robot', 'plain')
    p.pages[0].sprites = [
      mkSprite('robot', ROBOT_START.x, ROBOT_START.y, script(B('flag'), B('forward', 7), B('turnRight', 90), B('forward', 6), B('hop', 1))),
      mkSprite('star', GOAL_STAR.x, GOAL_STAR.y),
    ]
    return p
  },
}

// ---- 2.1 Tekrar etmek ----

const REPEAT_START = { x: 80, y: 250 }
const longUnit = () => [B('hop', 1), B('say', undefined, undefined, 'Hop!'), B('forward', 1)]

const longDanceProject = (): Project => {
  const p = emptyProject('cat', 'grass')
  p.pages[0].sprites = [
    mkSprite('cat', REPEAT_START.x, REPEAT_START.y, script(B('flag'), ...longUnit(), ...longUnit(), ...longUnit(), ...longUnit())),
  ]
  return p
}

const summarize = (p: Project) => {
  const r = simulate(p, { press: 'flag', ms: 30000 })
  const me = r.snapshot.sprites[0]
  return {
    x: Math.round(me.x),
    y: Math.round(me.y),
    say: r.events.filter((e) => e.kind === 'say').length,
    hop: r.events.filter((e) => e.kind === 'hop').length,
  }
}

const MAX_REPEAT_BLOCKS = 8

const repeatLesson: Activity = {
  intro: 'Kedinin betiği çok uzun: aynı üç blok 4 kez. Aynı işi Tekrarla bloğuyla kısa yoldan yap.',
  starter: longDanceProject,
  allowedBlocks: ['flag', 'forward', 'back', 'turnRight', 'turnLeft', 'hop', 'say', 'repeat'],
  allowPages: false,
  allowSprites: false,
  goals: [
    {
      id: 'same',
      text: 'Kedi yine aynı şeyi yapsın: 4 kez zıplasın, 4 kez konuşsun ve aynı yere varsın.',
      check: (p) => {
        const want = summarize(longDanceProject())
        const got = summarize(p)
        return got.x === want.x && got.y === want.y && got.say === want.say && got.hop === want.hop
      },
      hint: 'Tekrarla sayısını 4 yap. Tekrarla\'nın içinde Zıpla, Söyle ve İleri olsun.',
    },
    {
      id: 'use-repeat',
      text: 'Tekrarla bloğunu kullan.',
      check: (p) => runnableBlocks(p, 'flag').some((b) => b.type === 'repeat'),
      hint: 'Kontrol kategorisindeki Tekrarla bloğunu ekle, blokları C\'nin içine sürükle.',
    },
    {
      id: 'short',
      text: `Betiği kısalt: Yeşil bayrak dahil en çok ${MAX_REPEAT_BLOCKS} blok kalsın.`,
      check: (p) => countBlocks(p) <= MAX_REPEAT_BLOCKS,
      hint: 'Fazla kopyaları × ile sil ya da sürükleyip paletin üzerine bırak.',
    },
  ],
  solution: () => {
    const p = emptyProject('cat', 'grass')
    p.pages[0].sprites = [mkSprite('cat', REPEAT_START.x, REPEAT_START.y, script(B('flag'), B('repeat', 4, longUnit())))]
    return p
  },
}

// ---- 3.1 Olay: dokununca ne olur? ----

const eventLesson: Activity = {
  intro: 'Ev, kapı çalınca "Kim o?" desin. Kedi de dokununca zıplasın. Her karakterin kendi betiği var.',
  starter: () => {
    const p = emptyProject('cat', 'grass')
    p.pages[0].sprites = [mkSprite('cat', 120, 250), mkSprite('house', 360, 200)]
    return p
  },
  allowedBlocks: ['flag', 'tap', 'say', 'hop', 'wait', 'pop', 'forward', 'back'],
  allowPages: false,
  allowSprites: false,
  goals: [
    {
      id: 'house-asks',
      text: 'Eve dokununca ev "Kim o?" desin.',
      check: (p) =>
        p.pages[0].sprites
          .filter((s) => s.character === 'house')
          .some((s) => simulate(p, { press: { tap: s.id }, ms: 4000 }).events.some((e) => e.kind === 'say' && e.spriteId === s.id && /kim\s*o/i.test(e.text))),
      hint: 'Evi seç. 👆 Dokununca bloğunu ekle, sonra Söyle bloğuna Kim o? yaz.',
    },
    {
      id: 'cat-hops',
      text: 'Kediye dokununca kedi zıplasın.',
      check: (p) =>
        p.pages[0].sprites
          .filter((s) => s.character === 'cat')
          .some((s) => simulate(p, { press: { tap: s.id }, ms: 3000 }).events.some((e) => e.kind === 'hop' && e.spriteId === s.id)),
      hint: 'Kediyi seç. 👆 Dokununca bloğunun altına Hareket kategorisinden Zıpla ekle.',
    },
    {
      id: 'house-wait',
      text: 'Bonus: ev "Kim o?" dedikten sonra Bekle ile biraz beklesin ve bir şey daha söylesin.',
      check: (p) =>
        p.pages[0].sprites
          .filter((s) => s.character === 'house')
          .some((s) => {
            const waits = s.scripts.filter((sc) => sc.blocks[0]?.type === 'tap').some((sc) => flatten(sc.blocks).some((b) => b.type === 'wait'))
            return waits && simulate(p, { press: { tap: s.id }, ms: 8000 }).events.filter((e) => e.kind === 'say' && e.spriteId === s.id).length >= 2
          }),
      hint: 'Evin betiğinde Söyle, Bekle, Söyle sırasıyla bloklar olsun.',
    },
  ],
  solution: () => {
    const p = emptyProject('cat', 'grass')
    p.pages[0].sprites = [
      mkSprite('cat', 120, 250, script(B('tap'), B('hop', 1))),
      mkSprite('house', 360, 200, script(B('tap'), B('say', undefined, undefined, 'Kim o?'), B('wait', 1), B('say', undefined, undefined, 'Gir, kapı açık!'))),
    ]
    return p
  },
}

// ---- 4.1 Başı, ortası, sonu ----

const planLesson: Activity = {
  intro: 'Hikâyen üç sahne olsun: başlangıç, olay, son. Sayfa ekle, arka plan seç, her sahneye karakter koy.',
  starter: () => emptyProject('cat', 'grass'),
  allowedBlocks: ['flag', 'say'],
  allowPages: true,
  allowSprites: true,
  goals: [
    {
      id: 'pages3',
      text: 'Hikâyenin 3 sayfası (sahnesi) olsun.',
      check: (p) => pageCount(p) >= 3,
      hint: 'Sayfa şeridindeki + düğmesine bas. Her basış yeni bir sayfa ekler.',
    },
    {
      id: 'sprites',
      text: 'Her sayfada en az bir karakter olsun.',
      check: (p) => p.pages.length > 0 && p.pages.every((pg) => pg.sprites.length >= 1),
      hint: 'Sayfayı seç, karakter şeridindeki + ile listeden bir karakter ekle.',
    },
    {
      id: 'backgrounds',
      text: 'En az iki farklı arka plan kullan.',
      check: (p) => new Set(p.pages.map((pg) => pg.background)).size >= 2,
      hint: 'Sayfayı seç, Arka plan listesinden başka bir manzara seç.',
    },
  ],
  solution: () => {
    const p = emptyProject('cat', 'grass')
    p.pages.push(mkPage('night', mkSprite('cat', 240, 198)), mkPage('room', mkSprite('house', 240, 198)))
    return p
  },
}

/** Modül 1 etkinlikleri. Anahtar: "scratchjr:<hafta>:<ders>". Bütün 10 ders uygulamalıdır. */
export const MODUL1_ACTIVITIES: Record<string, Activity> = {
  'scratchjr:1:1': { ...robotGame },
  'scratchjr:1:2': { ...walk3 },
  'scratchjr:2:1': { ...repeatLesson },
  'scratchjr:2:2': { ...dance },
  'scratchjr:3:1': { ...eventLesson },
  'scratchjr:3:2': { ...talk },
  'scratchjr:4:1': { ...planLesson },
  'scratchjr:4:2': { ...story2 },
  'scratchjr:5:1': { ...debug },
  'scratchjr:5:2': { ...final },
}
