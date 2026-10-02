'use client'
import { useMemo } from 'react'
import type { NextState } from '@/lib/ai/activity'
import { nextView } from '@/lib/ai/views'
import { Bar, Simulation, pct, type ToolProps } from './ui'

const ORDER_NOTE: Record<number, string> = {
  0: 'Bağlam yok ya da cümle bitti: cümle BAŞINDA hangi kelimelerin geldiği sayıldı.',
  1: 'Yalnız SON kelimeye bakıldı (ikili model).',
  2: 'Son İKİ kelimeye bakıldı (üçlü model).',
}

export function NextwordTool({ state, onChange }: ToolProps<NextState>) {
  const v = useMemo(() => nextView(state), [state])
  const set = (p: Partial<NextState>) => {
    const n = { ...state, ...p }
    const tried = new Set(n.tried)
    if (n.temperature < 0.3) tried.add('dusuk')
    if (n.temperature > 1.8) tried.add('yuksek')
    n.tried = [...tried]
    onChange(n)
  }
  const shown = v.dist.slice(0, 8)
  const maxP = shown[0]?.p ?? 1
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>Başlangıç metni (bağlam)</span>
          <input type="text" value={state.text} onChange={(e) => set({ text: e.target.value, count: 0 })} placeholder="robot" />
        </label>
        <div className="ai-row" style={{ marginTop: 10 }}>
          <label className="ai-field"><span>Sıcaklık: <b className="ai-val">{state.temperature.toFixed(2)}</b></span>
            <input type="range" min={0} max={3} step={0.05} value={state.temperature} onChange={(e) => set({ temperature: Number(e.target.value) })} />
          </label>
          <label className="ai-field"><span>Bakılan kelime sayısı</span>
            <select value={state.order} onChange={(e) => set({ order: Number(e.target.value) === 2 ? 2 : 1, count: 0 })}>
              <option value={1}>1 kelime (ikili)</option>
              <option value={2}>2 kelime (üçlü)</option>
            </select>
          </label>
        </div>
      </div>
      <div className="ai-card">
        <h3>Sonraki kelime olasılıkları</h3>
        <p className="muted" style={{ margin: '0 0 8px', fontSize: '.88rem' }}>
          Bağlam: <b>{v.ctx.length ? v.ctx.slice(-2).join(' ') : '(boş)'}</b>. {ORDER_NOTE[v.usedOrder]} Olasılık = softmax(log(sayım) / sıcaklık); çubuk uzunluğu en olası kelimeye göre ölçeklenir.
        </p>
        <ul className="ai-bars" aria-label="Aday kelimeler">
          {shown.map((c) => <Bar key={c.word} name={`${c.word} (${c.count})`} value={c.p / (maxP || 1)} label={pct(c.p)} />)}
        </ul>
        <ul className="ai-stats">
          <li>Aday sayısı: <b>{v.dist.length}</b></li>
          <li>En olası: <b>{v.top ? `${v.top.word} ${pct(v.top.p)}` : '-'}</b></li>
          <li>Belirsizlik (entropi): <b>{v.entropy.toFixed(2)} bit</b></li>
        </ul>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>
          Sıcaklık 0 yakınında en olası kelime her zaman seçilir; yükseldikçe olasılıklar düzleşir ve nadir kelimeler şans bulur.
        </p>
      </div>
      <div className="ai-card">
        <h3>Üretim</h3>
        <div className="ai-gen" aria-live="polite">
          {v.ctx.join(' ')}{v.gen.words.map((w, i) => <span key={i}>{' '}<mark>{w}</mark></span>)}
        </div>
        <div className="ai-topbar" style={{ marginTop: 10 }}>
          <button type="button" className="ai-btn" data-primary="true" onClick={() => set({ count: state.count + 1 })}>Bir kelime üret</button>
          <button type="button" className="ai-btn" onClick={() => set({ count: state.count + 5 })}>5 kelime</button>
          <button type="button" className="ai-btn" onClick={() => set({ seed: state.seed + 1 })}>Yeni tohum ({state.seed})</button>
          <button type="button" className="ai-btn" onClick={() => set({ count: 0 })}>Üretimi temizle</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <Simulation>Bu bir sinir ağı değil: ~40 cümlelik mini robot derleminden SAYILAN bir n-gram modelidir. Olasılıklar ve softmax gerçekten hesaplanır; seçim, tohumlu bir rastgele sayıyla yapılır. Gerçek dil modelleri çok daha uzun bağlamlara bakar.</Simulation>
        </div>
      </div>
    </div>
  )
}
