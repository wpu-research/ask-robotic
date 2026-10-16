// Modül kataloğunun İngilizcesi (modül adı, kısa tanıtım, hedef kitle, yaş, açıklama, hafta adları ve projeleri).
// Türkçe kaynak: veritabanı (content-src/*/module.json, packages/db/src/content/modul-*.ts) + lib/module-meta.ts.
// Görüntülemede slug ile birleşir (localizeModule); eksik alan Türkçede kalır. Ders başlıkları lib/lesson-titles-en.ts'te; gövdeler Türkçe.
// catalog-en.test.ts: her yayındaki modülün girdisi var ve hafta sayısı Türkçeyle aynı.
import type { Locale } from '@/i18n'
import type { CatalogModule } from './catalog'
import { MODULE_META } from './module-meta'
import { lessonTitle } from './lesson-titles-en'

export interface ModuleEn {
  title: string
  tagline: string
  audience: string
  /** Yaş etiketi (MODULE_META.ages ya da minAge yerine). */
  ages: string
  callout?: string
  /** Hafta sırasıyla: [başlık, proje] */
  weeks: [string, string][]
}

export const MODULES_EN: Record<string, ModuleEn> = {
  scratchjr: {
    title: 'First Steps in Block Coding',
    tagline: 'Drag the blocks and program your character: sequence, repetition, events and stories.',
    audience: 'Ages 5-7, together with an adult',
    ages: 'Ages 5-7',
    callout: 'All activities are done in the platform\'s own block app, right next to the lesson. Nothing to install and nothing extra needed; a browser is enough.',
    weeks: [
      ['Give a command, the robot does it', 'Robot game and first move'],
      ['The same thing again and again', 'Dancing character'],
      ['When this happens, what should happen?', 'Talking animal'],
      ['Scenes of a story', 'Two-page story'],
      ['Making mistakes is a programmer\'s job', 'My story'],
    ],
  },
  scratch: {
    title: 'Make Your Own Game with Scratch',
    tagline: 'Make animations, stories and games. Learn variables, messages, clones and lists.',
    audience: 'Ages 8-12',
    ages: 'Ages 8-12',
    callout: 'Lessons use Stage Workshop, which runs in the browser: you draw your characters or pick them from the gallery and bring them to life with blocks. No installation or account needed; your work is saved in this browser.',
    weeks: [
      ['Getting started', 'My first project'],
      ['Animation', 'A lively character'],
      ['Music and interaction', 'My own instrument'],
      ['Story', 'A story with two characters'],
      ['Game 1', 'Catching game'],
      ['Game 2', 'Improve the game'],
      ['My own blocks and lists', 'Quiz game'],
      ['Project', 'My game / my story'],
    ],
  },
  'arduino-temelleri': {
    title: 'Arduino Basics',
    tagline: 'From an LED to a thermostat: input/output, analog, PWM, motors, timing and displays.',
    audience: 'Ages 12 and up, complete beginners',
    ages: 'Ages 12+',
    callout: 'Every lesson includes a circuit and a working Arduino program; the programs were verified by compiling and running them on an Arduino Uno simulation. The platform\'s own circuit simulator is under development; until it arrives, you can build the circuits on your own board or in a simulator such as Wokwi or Tinkercad.',
    weeks: [
      ['Basics', 'Traffic light'],
      ['Input and logic', 'Doorbell and counter'],
      ['The analog world', 'Smart night light'],
      ['PWM, colour, sound', 'Light-up music box'],
      ['Motors', 'Automatic fan and servo scanner'],
      ['Timing', 'Multitasking panel'],
      ['Displays and data', 'Thermostat'],
    ],
  },
  'sensorler-ve-projeler': {
    title: 'Sensors and Projects',
    tagline: 'Distance, motion, environment, sound, gas and identity sensors. A project every week.',
    audience: 'Students who finished Arduino Basics',
    ages: 'Ages 12+',
    callout: 'Programs were tested with virtual sensor models (HC-SR04, DHT, BMP280, MPU6050, etc.). Some parts (RC522, SD card, VL53L0X) were verified only at the compile level; the lessons say so.',
    weeks: [
      ['Distance', 'Parking sensor'],
      ['Presence and obstacles', 'Burglar alarm'],
      ['Environment', 'Weather station'],
      ['Light, sound, gas', 'Fire and gas alarm'],
      ['Motion and direction', 'Tilt-controlled servo'],
      ['Input devices', 'Smart door'],
      ['Time and data', 'Data logger'],
      ['From simulation to reality', 'Smart room'],
    ],
  },
  robotik: {
    title: 'Robotics',
    tagline: 'Driving, obstacles, lines, encoders, PID and balance in a virtual arena. Pick your own robot for the final project.',
    audience: 'Students who finished Sensors and Projects',
    ages: 'Ages 13+',
    callout: 'Every lesson\'s activity is done in the virtual robot arena in the browser: you write Arduino C++ code, it is compiled, and the robot moves in a top-down 2D arena. Sensor beams, line sensor readings, encoders and odometry are shown live; goals are checked against the robot\'s real position and measurements. No physical parts needed. On a real robot, gains and timings may differ; the lessons point this out.',
    weeks: [
      ['Motion basics', 'Command-driven car'],
      ['Obstacles', 'Obstacle-avoiding robot'],
      ['Lines', 'Line-following robot'],
      ['Encoders and odometry', 'Square-drawing robot'],
      ['PID', 'PID line follower and wall follower'],
      ['IMU and balance', 'Self-balancing robot'],
      ['Behaviours and the robot arm', 'Explorer robot'],
      ['Final robot', 'Final robot'],
    ],
  },
  'ai-muhendisligi': {
    title: 'AI Engineering + Claude',
    tagline: 'Try it yourself: how language models work, writing prompts, evaluation, retrieval, agents and safety.',
    audience: 'Ages 13 and up; basic programming knowledge is enough',
    ages: 'Ages 13+',
    callout: 'Every lesson\'s activity is done with a local tool that runs in the browser: tokens and BPE, next-word probability, similarity, a RAG pipeline, an agent loop, prompt review, injection and eval. The calculations are real; but every step that stands in for a real language model is clearly labelled "simulation" or "template". No external service, account or key needed.',
    weeks: [
      ['How do language models work?', 'Mini language model'],
      ['Temperature, context and the first prompt', 'Prompt template'],
      ['Prompt engineering', 'Announcement summarizer'],
      ['Evaluation (eval)', 'Your own eval set'],
      ['Retrieval: embeddings and RAG', 'Your own RAG pipeline'],
      ['Tools and agents', 'Mini agent'],
      ['AI that writes code, and security', 'Red team report'],
      ['Responsible use and robotics', 'Engineering portfolio'],
    ],
  },
  'mikro-kart': {
    title: 'Micro Board',
    tagline: 'Program a virtual LED board: 5x5 display, buttons, sensors, music and radio.',
    audience: 'Ages 8 and up, complete beginners',
    ages: 'Ages 8+',
    callout: 'Every lesson\'s activity is done with the virtual Micro Board in the browser: you write programs with blocks, and the board\'s 5x5 LED display, buttons and sensors work live. Temperature, light, sound and motion are set with sliders; no physical parts needed. In the radio lessons two virtual boards run side by side. You can also see the JavaScript and Python code that matches your blocks.',
    weeks: [
      ['Meet the board', 'Beating heart'],
      ['Buttons and events', 'Dice game scoreboard'],
      ['Sensors', 'Environment station'],
      ['Music and sound', 'Virtual piano'],
      ['Radio and communication', 'Remote control'],
      ['Projects', 'End-of-course final project'],
    ],
  },
  'oyun-atolyesi': {
    title: 'Game Workshop',
    tagline: 'Make your own game with blocks: sprites, collisions, score, maps, enemies and platforms.',
    audience: 'Ages 8 and up, complete beginners',
    ages: 'Ages 8+',
    callout: 'Every lesson\'s activity is done in the Game Workshop in the browser: you snap blocks together and your game runs on the stage right away. The image and map editors are on the same page; nothing to install. If you change blocks while the game is running, press the reset (↺) button to get the new version.',
    weeks: [
      ['My first game', 'Wandering cat'],
      ['Collisions and score', 'Fruit hunt'],
      ['Maps and worlds', 'Treasure island'],
      ['Enemies and smarts', 'Ghost hunter'],
      ['Platforms and physics', 'Platform jumper'],
      ['Project: complete games', 'My final game'],
    ],
  },
}

/** Modülün dile göre adı. */
export const moduleTitle = (slug: string, trTitle: string, locale: Locale): string =>
  (locale === 'en' && MODULES_EN[slug]?.title) || trTitle

/** Haftanın dile göre adı (sıra 1'den başlar). */
export const weekTitle = (slug: string, position: number, trTitle: string, locale: Locale): string =>
  (locale === 'en' && MODULES_EN[slug]?.weeks[position - 1]?.[0]) || trTitle

/** Modül açıklama kutusu (MODULE_META.callout) dile göre. */
export const moduleCallout = (slug: string, locale: Locale): string | undefined =>
  (locale === 'en' && MODULES_EN[slug]?.callout) || MODULE_META[slug]?.callout

/** Yaş etiketi dile göre: Türkçede lib/module-meta.ts ageLabel ile aynı. */
export function localizedAgeLabel(slug: string, minAge: number | null, locale: Locale): string | null {
  if (locale === 'en') return MODULES_EN[slug]?.ages ?? (minAge ? `Ages ${minAge}+` : null)
  return MODULE_META[slug]?.ages ?? (minAge ? `${minAge}+ yaş` : null)
}

/** Katalog modülünün metinlerini (ad, tanıtım, kitle, hafta adı/projesi, ders başlıkları) dile göre değiştirir. Türkçede aynı nesne döner. */
export function localizeModule(m: CatalogModule, locale: Locale): CatalogModule {
  const en = locale === 'en' ? MODULES_EN[m.slug] : undefined
  if (locale !== 'en') return m
  return {
    ...m,
    ...(en ? { title: en.title, tagline: en.tagline, audience: en.audience } : {}),
    weeks: m.weeks.map((w) => {
      const e = en?.weeks[w.position - 1]
      return {
        ...w,
        ...(e ? { title: e[0], project: w.project ? e[1] : w.project } : {}),
        lessons: w.lessons.map((l) => ({ ...l, title: lessonTitle(m.slug, w.position, l.position, l.title, locale) })),
      }
    }),
  }
}

/** Tüm katalog dile göre (localizeModule). Türkçede aynı dizi döner. */
export const localizeCatalog = (catalog: CatalogModule[], locale: Locale): CatalogModule[] =>
  locale === 'en' ? catalog.map((m) => localizeModule(m, locale)) : catalog
