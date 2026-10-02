// WebAudio ile basit enstrüman sentezi (örnek dosya yok): piyano, flüt, keman, zil.
import { freqOf, type Inst } from '@/lib/games/muzik/notes'

type Ctor = typeof AudioContext
export interface Voice { stop(): void }

export class Synth {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private voices = new Set<Voice>()

  /** Kullanıcı tıklamasından sonra çağır. */
  ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const C: Ctor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext
      if (!C) return null
      try {
        this.ctx = new C()
        const comp = this.ctx.createDynamicsCompressor()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.55
        this.master.connect(comp)
        comp.connect(this.ctx.destination)
      } catch { this.ctx = null; return null }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined)
    return this.ctx
  }

  get now(): number { return this.ctx?.currentTime ?? 0 }

  /** Notayı `when` (AudioContext saniyesi) zamanında `dur` saniye çalar. */
  note(midi: number, when: number, dur: number, inst: Inst): void {
    const ctx = this.ctx, out = this.master
    if (!ctx || !out) return
    const f = freqOf(midi)
    const t0 = Math.max(when, ctx.currentTime)
    const nodes: (OscillatorNode | AudioBufferSourceNode)[] = []
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    const osc = (type: OscillatorType, freq: number, gain: number, detune = 0) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = detune
      const og = ctx.createGain(); og.gain.value = gain
      o.connect(og); og.connect(g)
      nodes.push(o)
      return o
    }
    let end = t0 + dur
    let tail: AudioNode = g

    if (inst === 'piyano') {
      osc('triangle', f, 0.7); osc('sine', f * 2, 0.22); osc('sine', f * 3, 0.07)
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(6000, f * 7)
      g.connect(lp); tail = lp
      const decay = Math.max(dur + 0.2, 0.7)
      g.gain.linearRampToValueAtTime(0.5, t0 + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + decay)
      end = t0 + decay
    } else if (inst === 'flut') {
      const main = osc('sine', f, 0.8); osc('sine', f * 2, 0.08); osc('triangle', f * 3, 0.03)
      const lfo = ctx.createOscillator(); lfo.frequency.value = 5; const lg = ctx.createGain(); lg.gain.value = 6
      lfo.connect(lg); lg.connect(main.detune); nodes.push(lfo)
      g.gain.linearRampToValueAtTime(0.45, t0 + 0.07)
      g.gain.setValueAtTime(0.45, t0 + Math.max(0.08, dur - 0.08))
      g.gain.linearRampToValueAtTime(0.0001, t0 + dur + 0.06)
      end = t0 + dur + 0.08
    } else if (inst === 'keman') {
      const main = osc('sawtooth', f, 0.45); osc('sawtooth', f, 0.3, 7)
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(3200, f * 5); lp.Q.value = 1.2
      g.connect(lp); tail = lp
      const lfo = ctx.createOscillator(); lfo.frequency.value = 5.5; const lg = ctx.createGain(); lg.gain.value = 9
      lfo.connect(lg); lg.connect(main.detune); nodes.push(lfo)
      g.gain.linearRampToValueAtTime(0.4, t0 + 0.1)
      g.gain.setValueAtTime(0.4, t0 + Math.max(0.11, dur - 0.1))
      g.gain.linearRampToValueAtTime(0.0001, t0 + dur + 0.08)
      end = t0 + dur + 0.1
    } else {
      osc('sine', f, 0.6); osc('sine', f * 2.76, 0.25); osc('sine', f * 5.4, 0.1)
      const decay = Math.max(dur + 0.4, 1.4)
      g.gain.linearRampToValueAtTime(0.5, t0 + 0.003)
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + decay)
      end = t0 + decay
    }
    tail.connect(out)
    for (const n of nodes) { (n as OscillatorNode).start(t0); (n as OscillatorNode).stop(end + 0.05) }
    const voice: Voice = {
      stop: () => {
        try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(0.0001, ctx.currentTime) } catch { /* yoksay */ }
        for (const n of nodes) { try { (n as OscillatorNode).stop() } catch { /* yoksay */ } }
        this.voices.delete(voice)
      },
    }
    this.voices.add(voice)
    nodes[0].onended = () => { this.voices.delete(voice); try { tail.disconnect() } catch { /* yoksay */ } }
  }

  stopAll(): void { for (const v of [...this.voices]) v.stop() }
  close(): void { this.stopAll(); void this.ctx?.close().catch(() => undefined); this.ctx = null; this.master = null }
}
