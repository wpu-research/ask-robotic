'use client'
// Konuşan Yüz atölyesi: three.js ile 3B robot yüzü. Duygu, göz (LED ya da gerçek), kırpma, bakış, yazıdan sese ve dudak.
// "Mac'e sor": soruyu Mac'e (güvenli yapay zekâ rehberi, /api/tutor) sorar, yüz cevabı konuşur.
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createStage, hasWebGL, type Stage } from '@/components/three/core'
import { useLocale } from '@/i18n/client'
import { getDeviceId } from '@/lib/events'
import { historyForRequest, tutorErrorText } from '@/lib/tutor/client'
import { visibleText } from '@/lib/tutor/protocol'
import { blinkAt, EMOTIONS, emotionForText, lerp, lerpPose, mouthFromLevel, POSES, type Emotion, type Pose } from '@/lib/yuz/face'
import { MAX_SPEAK_CHARS, speak, unlockAudio, type Speaking } from './speak'

const SKINS = [
  { id: 'mavi', color: '#5b9bd5', tr: 'Mavi', en: 'Blue' },
  { id: 'nane', color: '#6fcf97', tr: 'Nane', en: 'Mint' },
  { id: 'turuncu', color: '#f2994a', tr: 'Turuncu', en: 'Orange' },
  { id: 'mor', color: '#a78bfa', tr: 'Mor', en: 'Purple' },
]
const EMO_LABEL: Record<Emotion, { tr: string; en: string; icon: string }> = {
  notr: { tr: 'Sakin', en: 'Calm', icon: '😐' }, mutlu: { tr: 'Mutlu', en: 'Happy', icon: '😄' }, uzgun: { tr: 'Üzgün', en: 'Sad', icon: '😢' },
  saskin: { tr: 'Şaşkın', en: 'Surprised', icon: '😮' }, kizgin: { tr: 'Kızgın', en: 'Angry', icon: '😠' },
}
const SAMPLES = {
  tr: ['Merhaba! Ben MacademiaX robotuyum.', 'Bugün birlikte ne yapalım?', 'Bir robotun gözleri sensör, ağzı hoparlördür.'],
  en: ['Hello! I am the MacademiaX robot.', 'What shall we build today?', 'A robot has sensors for eyes and a speaker for a mouth.'],
}

interface Rig {
  skin: THREE.MeshStandardMaterial
  eyeL: THREE.Group; eyeR: THREE.Group
  ball: THREE.Mesh[]; pupil: THREE.Mesh[]; led: THREE.Mesh[]
  browL: THREE.Mesh; browR: THREE.Mesh
  lip: THREE.Mesh; mouth: THREE.Mesh
  head: THREE.Group
}

function buildFace(scene: THREE.Scene): Rig {
  const head = new THREE.Group(); scene.add(head)
  const skin = new THREE.MeshStandardMaterial({ color: '#5b9bd5', roughness: 0.4, metalness: 0.1 })
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), skin); skull.scale.set(1.12, 1, 0.98); skull.castShadow = true; head.add(skull)
  const dark = new THREE.MeshStandardMaterial({ color: '#1b1f2a', roughness: 0.6 })
  const white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25 })
  const ledMat = new THREE.MeshStandardMaterial({ color: '#22d3ee', emissive: '#22d3ee', emissiveIntensity: 1.6 })

  const eyes: THREE.Group[] = [], ball: THREE.Mesh[] = [], pupil: THREE.Mesh[] = [], led: THREE.Mesh[] = []
  for (const sx of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(0.4 * sx, 0.2, 0.8); head.add(g)
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), white); b.scale.z = 0.7; g.add(b); ball.push(b)
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), dark); p.position.z = 0.1; g.add(p); pupil.push(p)
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 28).rotateX(Math.PI / 2), ledMat); l.position.z = 0.12; l.visible = false; g.add(l); led.push(l)
    eyes.push(g)
  }
  const brows: THREE.Mesh[] = []
  for (const sx of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.3, 6, 12).rotateZ(Math.PI / 2), dark)
    m.position.set(0.4 * sx, 0.58, 0.82); head.add(m); brows.push(m)
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), dark); nose.position.set(0, -0.02, 0.98); head.add(nose)
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), dark); mouth.position.set(0, -0.42, 0.9); mouth.scale.set(0.27, 0.01, 0.06); head.add(mouth)
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.032, 10, 32, Math.PI), new THREE.MeshStandardMaterial({ color: '#1b1f2a', side: THREE.DoubleSide }))
  lip.position.set(0, -0.42, 0.92); head.add(lip)
  // anten
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), dark); stem.position.set(0, 1.12, 0); head.add(stem)
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), ledMat); tip.position.set(0, 1.3, 0); head.add(tip)
  // kulaklar
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24).rotateZ(Math.PI / 2), dark); e.position.set(1.12 * sx, 0, 0); head.add(e) }
  return { skin, eyeL: eyes[0], eyeR: eyes[1], ball, pupil, led, browL: brows[0], browR: brows[1], lip, mouth, head }
}

function applyPose(r: Rig, p: Pose, blink: number, gaze: { x: number; y: number }, mouthOpen: number, ledEyes: boolean, t: number) {
  const lid = Math.min(1, Math.max(p.lid, blink))
  for (const g of [r.eyeL, r.eyeR]) g.scale.set(p.eye, Math.max(0.06, p.eye * (1 - lid * 0.95)), p.eye)
  r.ball.forEach((b) => { b.visible = !ledEyes }); r.pupil.forEach((b) => { b.visible = !ledEyes }); r.led.forEach((b) => { b.visible = ledEyes })
  const gx = gaze.x * 0.09, gy = gaze.y * 0.07
  r.pupil.forEach((m) => m.position.set(gx, gy, 0.1)); r.led.forEach((m) => m.position.set(gx * 1.3, gy * 1.3, 0.12))
  r.browL.position.y = r.browR.position.y = 0.58 + p.browY
  r.browL.rotation.z = -p.browTilt; r.browR.rotation.z = p.browTilt
  const open = Math.max(p.open, mouthOpen)
  const sm = p.smile; const mag = Math.max(0.08, Math.abs(sm)) * (sm < 0 ? 1 : -1)
  r.lip.scale.y = mag
  const lipY = -0.42 + (sm > 0 ? -0.04 * sm : 0.04)
  r.lip.position.y = lipY
  // Açıklık, gülümseme yayının içinde kalır: yayın derinliği kadar iner, üstte düz bir çizgiyle kapanır
  const depth = sm > 0 ? 0.27 * Math.abs(mag) : 0
  const half = 0.005 + open * 0.11
  r.mouth.scale.set(0.27 * (1 - open * 0.1) * (sm > 0 ? 0.92 : 1), Math.min(half, sm > 0 ? depth * 0.5 + open * 0.06 : half), 0.06)
  r.mouth.position.y = lipY - (sm > 0 ? depth * 0.5 : 0) - open * 0.02
  r.head.position.y = Math.sin(t * 1.4) * 0.02
}

export function YuzStudio() {
  const en = useLocale() === 'en'
  const locale = en ? 'en' : 'tr'
  const L = (tr: string, e: string) => (en ? e : tr)
  const host = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage | null>(null)
  const rig = useRef<Rig | null>(null)
  const emo = useRef<Emotion>('notr')
  const pose = useRef<Pose>(POSES.notr)
  const level = useRef(0)
  const mouth = useRef(0)
  const gaze = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const talking = useRef(false)
  const ledRef = useRef(false)
  const speaking = useRef<Speaking | null>(null)
  const abort = useRef<AbortController | null>(null)

  const [emotion, setEmotion] = useState<Emotion>('notr')
  const [ledEyes, setLedEyes] = useState(false)
  const [skin, setSkin] = useState(SKINS[0].id)
  const [text, setText] = useState('')
  const [question, setQuestion] = useState('')
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [talk, setTalk] = useState(false)
  const [note, setNote] = useState('')
  const [webgl] = useState(() => typeof document === 'undefined' || hasWebGL())

  const chooseEmotion = useCallback((e: Emotion) => { emo.current = e; setEmotion(e) }, [])

  useEffect(() => {
    if (!webgl || !host.current) return
    const stage = createStage(host.current)
    stage.scene.background = new THREE.Color('#e8edf5')
    stage.camera.position.set(0, 0.1, 4.4); stage.controls.target.set(0, 0.1, 0)
    stage.controls.enablePan = false; stage.controls.minDistance = 2.5; stage.controls.maxDistance = 7
    stage.controls.maxPolarAngle = Math.PI * 0.75
    const r = buildFace(stage.scene); rig.current = r
    let t = 0
    stage.onFrame = (dt) => {
      t += dt
      pose.current = lerpPose(pose.current, POSES[emo.current], Math.min(1, dt * 9))
      mouth.current = mouthFromLevel(level.current, mouth.current)
      gaze.current.x = lerp(gaze.current.x, talking.current ? 0 : target.current.x, Math.min(1, dt * 8))
      gaze.current.y = lerp(gaze.current.y, talking.current ? 0 : target.current.y, Math.min(1, dt * 8))
      applyPose(r, pose.current, blinkAt(t), gaze.current, mouth.current, ledRef.current, t)
    }
    stageRef.current = stage
    const move = (e: PointerEvent) => {
      const b = host.current!.getBoundingClientRect()
      target.current = { x: Math.max(-1, Math.min(1, ((e.clientX - b.left) / b.width) * 2 - 1)), y: Math.max(-1, Math.min(1, -(((e.clientY - b.top) / b.height) * 2 - 1))) }
    }
    window.addEventListener('pointermove', move)
    return () => { window.removeEventListener('pointermove', move); speaking.current?.stop(); abort.current?.abort(); stage.dispose(); stageRef.current = null; rig.current = null }
  }, [webgl])

  useEffect(() => { ledRef.current = ledEyes }, [ledEyes])
  useEffect(() => { rig.current?.skin.color.set(SKINS.find((s) => s.id === skin)!.color) }, [skin])

  const say = useCallback((raw: string) => {
    speaking.current?.stop()
    const txt = raw.trim()
    if (!txt) return
    unlockAudio()
    chooseEmotion(emotionForText(txt, locale))
    talking.current = true; setTalk(true); setNote('')
    const s = speak(txt, locale, (v) => { level.current = v })
    speaking.current = s
    void s.done.then(() => { if (speaking.current === s) { talking.current = false; setTalk(false); level.current = 0; window.setTimeout(() => { if (!talking.current) chooseEmotion('notr') }, 700) } })
  }, [locale, chooseEmotion])

  const stopSpeaking = () => { speaking.current?.stop() }

  const ask = async () => {
    const q = question.trim()
    if (!q || busy) return
    unlockAudio()
    setBusy(true); setReply(''); setNote('')
    chooseEmotion('saskin')
    const ctrl = new AbortController(); abort.current = ctrl
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ page: '/robot-atolyesi/yuz', messages: historyForRequest([{ role: 'user', content: q }]), deviceId: getDeviceId(), locale }),
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null) as { error?: string } | null
        setNote(tutorErrorText(err?.error, locale)); chooseEmotion('uzgun'); return
      }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = ''
      for (;;) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }) }
      acc += dec.decode()
      const out = visibleText(acc).replace(/[*`#]/g, '').trim()
      setReply(out)
      if (out) say(out); else chooseEmotion('notr')
    } catch {
      if (!ctrl.signal.aborted) { setNote(tutorErrorText(undefined, locale)); chooseEmotion('uzgun') }
    } finally { setBusy(false) }
  }

  return (
    <section className="yz" data-testid="yuz-studio">
      <div className="yz-body">
        <div className="yz-stage-wrap">
          {webgl
            ? <div ref={host} className="yz-stage" data-testid="yuz-stage" />
            : <div className="yz-stage yz-msg">{L('Bu tarayıcıda WebGL yok; 3B yüz açılamıyor.', 'WebGL is not available in this browser.')}</div>}
          <div className="yz-bar" role="group" aria-label={L('Duygu', 'Emotion')}>
            {EMOTIONS.map((e) => (
              <button key={e} className={`yz-emo${e === emotion ? ' on' : ''}`} aria-pressed={e === emotion} onClick={() => chooseEmotion(e)} data-testid={`yuz-emo-${e}`}>
                <span aria-hidden="true">{EMO_LABEL[e].icon}</span> {en ? EMO_LABEL[e].en : EMO_LABEL[e].tr}
              </button>
            ))}
          </div>
        </div>

        <aside className="yz-side">
          <h3>{L('Yüze konuştur', 'Make it speak')}</h3>
          <label className="yz-field">
            <span>{L('Ne söylesin?', 'What should it say?')}</span>
            <textarea value={text} maxLength={MAX_SPEAK_CHARS} rows={3} onChange={(e) => setText(e.target.value)} placeholder={SAMPLES[locale][0]} data-testid="yuz-text" />
          </label>
          <div className="yz-row">
            <button className="sbtn" onClick={() => say(text || SAMPLES[locale][0])} data-testid="yuz-say">🔊 {L('Konuştur', 'Speak')}</button>
            <button className="sbtn ghost" onClick={stopSpeaking} disabled={!talk}>{L('Sustur', 'Stop')}</button>
          </div>
          <div className="yz-row">
            {SAMPLES[locale].map((s) => <button key={s} className="yz-chip" onClick={() => { setText(s); say(s) }}>{s.length > 26 ? `${s.slice(0, 24)}…` : s}</button>)}
          </div>

          <h3>{L('Mac\'e sor', 'Ask Mac')}</h3>
          <label className="yz-field">
            <span>{L('Robotik hakkında bir şey sor, yüz cevabı söylesin.', 'Ask something about robotics; the face says the answer.')}</span>
            <input value={question} maxLength={200} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void ask() }} placeholder={L('LED neden yanar?', 'Why does an LED light up?')} data-testid="yuz-question" />
          </label>
          <button className="sbtn" onClick={() => void ask()} disabled={busy || !question.trim()} data-testid="yuz-ask">{busy ? L('Düşünüyor…', 'Thinking…') : L('Sor', 'Ask')}</button>
          {reply && <p className="yz-reply" data-testid="yuz-reply">{reply}</p>}
          {note && <p className="yz-note" role="status">{note}</p>}

          <h3>{L('Görünüm', 'Look')}</h3>
          <div className="yz-row">
            <button className={`yz-chip${ledEyes ? ' on' : ''}`} aria-pressed={ledEyes} onClick={() => setLedEyes((v) => !v)} data-testid="yuz-led">{L('LED gözler', 'LED eyes')}</button>
            {SKINS.map((s) => (
              <button key={s.id} className={`yz-dot${skin === s.id ? ' on' : ''}`} style={{ background: s.color }} aria-label={en ? s.en : s.tr} aria-pressed={skin === s.id} onClick={() => setSkin(s.id)} />
            ))}
          </div>
          <p className="yz-hint">{L('Fareni yüzün etrafında gezdir: gözler seni izler. Sürükleyerek yüzü döndürebilirsin.', 'Move your pointer around: the eyes follow it. Drag to rotate the face.')}</p>
        </aside>
      </div>
    </section>
  )
}
