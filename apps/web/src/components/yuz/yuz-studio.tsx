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
  /** Kabuk malzemesi (renk seçici bunu boyar) ve daha açık yüz plakası. */
  skin: THREE.MeshStandardMaterial
  plate: THREE.MeshStandardMaterial
  neck: THREE.Group
  eyes: THREE.Group[]; ball: THREE.Mesh[]; led: THREE.Mesh[]; lids: THREE.Mesh[]
  browL: THREE.Mesh; browR: THREE.Mesh
  /** Ağız: üst dudak (orta + iki yan parça), alt dudak, koyu boşluk. */
  lipC: THREE.Mesh; lipL: THREE.Mesh; lipR: THREE.Mesh; jaw: THREE.Mesh; cavity: THREE.Mesh
  glow: THREE.MeshStandardMaterial
}

/** Ohbot'tan esinli mekanik insansı kafa: metalik kabuk, koyu göz yuvaları, dönen gözler, hareketli göz kapakları, bölmeli ağız, boyun ve omuzlar. */
function buildFace(scene: THREE.Scene): Rig {
  const shell = new THREE.MeshStandardMaterial({ color: '#4a7fc1', roughness: 0.28, metalness: 0.55 })
  const plate = new THREE.MeshStandardMaterial({ color: '#6f9bd6', roughness: 0.3, metalness: 0.45 })
  const steel = new THREE.MeshStandardMaterial({ color: '#8c97a8', roughness: 0.35, metalness: 0.85 })
  const dark = new THREE.MeshStandardMaterial({ color: '#10131b', roughness: 0.55, metalness: 0.2 })
  const white = new THREE.MeshStandardMaterial({ color: '#f4f6fa', roughness: 0.18 })
  const iris = new THREE.MeshStandardMaterial({ color: '#2f80ed', roughness: 0.2, emissive: '#1b4f9a', emissiveIntensity: 0.5 })
  const glow = new THREE.MeshStandardMaterial({ color: '#22d3ee', emissive: '#22d3ee', emissiveIntensity: 1.6 })
  const mesh = <T extends THREE.BufferGeometry>(g: T, m: THREE.Material, pos: [number, number, number] = [0, 0, 0], cast = true) => {
    const o = new THREE.Mesh(g, m); o.position.set(...pos); o.castShadow = cast; return o
  }

  // Gövde: omuzlar, göğüs plakası, boyun
  const body = new THREE.Group(); scene.add(body)
  const shoulders = mesh(new THREE.SphereGeometry(1, 40, 20), shell, [0, -2.15, -0.05]); shoulders.scale.set(2.1, 0.62, 0.85); body.add(shoulders)
  body.add(mesh(new THREE.BoxGeometry(0.9, 0.45, 0.12), plate, [0, -2.0, 0.78]))
  body.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20).rotateX(Math.PI / 2), glow, [0, -2.0, 0.85], false))
  const neckBase = mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.5, 28), steel, [0, -1.55, 0]); body.add(neckBase)

  // Boyun: kafa buradan döner (yaw/pitch)
  const neck = new THREE.Group(); neck.position.set(0, -1.28, 0); body.add(neck)
  for (const y of [0.05, 0.22]) neck.add(mesh(new THREE.TorusGeometry(0.33, 0.045, 10, 28).rotateX(Math.PI / 2), dark, [0, y, 0], false))
  const head = new THREE.Group(); head.position.set(0, 1.35, 0); neck.add(head)

  // Kafa kabuğu + yüz plakası
  const skull = mesh(new THREE.SphereGeometry(1, 48, 32), shell); skull.scale.set(1.0, 1.18, 0.96); head.add(skull)
  const face = mesh(new THREE.SphereGeometry(1, 40, 24), plate, [0, -0.02, 0.28]); face.scale.set(0.8, 1.0, 0.7); head.add(face)
  head.add(mesh(new THREE.TorusGeometry(0.97, 0.03, 8, 48).rotateY(Math.PI / 2), steel, [0, 0.25, 0], false))
  head.add(mesh(new THREE.SphereGeometry(0.06, 12, 8), glow, [0, 0.92, 0.5], false))
  for (const sx of [-1, 1]) {
    head.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 28).rotateZ(Math.PI / 2), steel, [1.0 * sx, 0.05, 0]))
    head.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 20).rotateZ(Math.PI / 2), dark, [1.06 * sx, 0.05, 0], false))
  }

  // Gözler: koyu yuva, dönen göz küresi (beyaz + iris + gözbebeği), LED alternatifi, üst göz kapağı
  const eyes: THREE.Group[] = [], ball: THREE.Mesh[] = [], led: THREE.Mesh[] = [], lids: THREE.Mesh[] = []
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(0.37 * sx, 0.28, 0.72); head.add(eye)
    eye.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 32).rotateX(Math.PI / 2), dark, [0, 0, 0.02], false))
    const ballG = new THREE.Group(); ballG.position.z = 0.1; eye.add(ballG)
    const eb = mesh(new THREE.SphereGeometry(0.23, 32, 20), white); ballG.add(eb)
    const ir = mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 28).rotateX(Math.PI / 2), iris, [0, 0, 0.215], false); ballG.add(ir)
    const pu = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 20).rotateX(Math.PI / 2), dark, [0, 0, 0.225], false); ballG.add(pu)
    ball.push(ballG as unknown as THREE.Mesh)
    const l = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32).rotateX(Math.PI / 2), glow, [0, 0, 0.14], false); l.visible = false; eye.add(l); led.push(l)
    const lid = mesh(new THREE.SphereGeometry(0.255, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), shell, [0, 0, 0.1]); eye.add(lid); lids.push(lid)
    eyes.push(eye)
  }
  // Kaşlar: ince plakalar
  const brows: THREE.Mesh[] = []
  for (const sx of [-1, 1]) { const m = mesh(new THREE.BoxGeometry(0.42, 0.06, 0.08), steel, [0.37 * sx, 0.72, 0.8]); head.add(m); brows.push(m) }
  // Burun
  const nose = mesh(new THREE.ConeGeometry(0.07, 0.2, 4), plate, [0, 0.0, 0.93]); nose.rotation.x = Math.PI / 2; head.add(nose)

  // Ağız: üst dudak (3 parça), koyu boşluk, alt dudak (çene)
  const lipMat = dark
  const lipC = mesh(new THREE.BoxGeometry(0.3, 0.05, 0.07), lipMat, [0, -0.44, 0.85], false); head.add(lipC)
  const lipL = mesh(new THREE.BoxGeometry(0.2, 0.05, 0.07), lipMat, [-0.23, -0.44, 0.83], false); head.add(lipL)
  const lipR = mesh(new THREE.BoxGeometry(0.2, 0.05, 0.07), lipMat, [0.23, -0.44, 0.83], false); head.add(lipR)
  const cavity = mesh(new THREE.BoxGeometry(0.52, 1, 0.06), dark, [0, -0.5, 0.83], false); cavity.scale.y = 0.001; head.add(cavity)
  const jaw = mesh(new THREE.BoxGeometry(0.62, 0.08, 0.1), steel, [0, -0.5, 0.84]); head.add(jaw)

  scene.add(new THREE.AmbientLight('#ffffff', 0.25))
  return { skin: shell, plate, neck, eyes, ball, led, lids, browL: brows[0], browR: brows[1], lipC, lipL, lipR, jaw, cavity, glow }
}

function applyPose(r: Rig, p: Pose, blink: number, gaze: { x: number; y: number }, mouthOpen: number, ledEyes: boolean, t: number) {
  const lid = Math.min(1, Math.max(p.lid, blink))
  r.eyes.forEach((e) => e.scale.setScalar(p.eye))
  // göz kapağı: -90° arkada gizli ... +90° önde tam kapalı
  r.lids.forEach((l) => { l.rotation.x = -Math.PI / 2 + lid * Math.PI * 0.98 })
  r.ball.forEach((b) => { b.visible = !ledEyes; (b as unknown as THREE.Group).rotation.set(-gaze.y * 0.45, gaze.x * 0.55, 0) })
  r.led.forEach((m) => { m.visible = ledEyes; m.position.x = gaze.x * 0.07; m.position.y = gaze.y * 0.06 })
  r.browL.position.y = r.browR.position.y = 0.72 + p.browY
  r.browL.rotation.z = -p.browTilt; r.browR.rotation.z = p.browTilt
  // ağız: yan parçalar gülümsemeyle yukarı/aşağı eğilir, çene açıklıkla iner
  const open = Math.max(p.open, mouthOpen)
  const sm = p.smile
  r.lipL.rotation.z = -sm * 0.5; r.lipR.rotation.z = sm * 0.5
  r.lipL.position.y = r.lipR.position.y = -0.44 + sm * 0.035
  r.lipC.position.y = -0.44 - sm * 0.01
  const drop = open * 0.22
  r.jaw.position.y = -0.5 - drop
  r.jaw.rotation.x = open * 0.25
  r.cavity.scale.y = Math.max(0.001, 0.06 + drop)
  r.cavity.position.y = -0.47 - drop * 0.5
  r.cavity.visible = open > 0.02
  // boyun: bakışı izler; konuşurken hafif başını sallar
  r.neck.rotation.y = gaze.x * 0.32
  r.neck.rotation.x = -gaze.y * 0.16 + mouthOpen * 0.04
  r.neck.rotation.z = Math.sin(t * 0.7) * 0.012
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
    stage.scene.background = new THREE.Color('#dfe6f1')
    stage.camera.position.set(0, 0.5, 5.2); stage.controls.target.set(0, -0.25, 0)
    stage.controls.enablePan = false; stage.controls.minDistance = 3; stage.controls.maxDistance = 9
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
  useEffect(() => { const r = rig.current; if (!r) return; const c = new THREE.Color(SKINS.find((x) => x.id === skin)!.color); r.skin.color.copy(c); r.plate.color.copy(c).lerp(new THREE.Color('#ffffff'), 0.22) }, [skin])

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
