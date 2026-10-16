'use client'
import { useMemo } from 'react'
import type { NextState } from '@/lib/ai/activity'
import { nextView } from '@/lib/ai/views'
import { useT } from '@/i18n/client'
import { Bar, Simulation, pct, type ToolProps } from './ui'

const ORDER_NOTE = { 0: 'studios.ai.nextword.order0', 1: 'studios.ai.nextword.order1', 2: 'studios.ai.nextword.order2' } as const

export function NextwordTool({ state, onChange, lang = 'tr' }: ToolProps<NextState>) {
  const t = useT()
  const v = useMemo(() => nextView(state, lang), [state, lang])
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
        <label className="ai-field"><span>{t('studios.ai.nextword.start')}</span>
          <input type="text" value={state.text} onChange={(e) => set({ text: e.target.value, count: 0 })} placeholder={lang === 'en' ? 'the robot' : 'robot'} />
        </label>
        <div className="ai-row" style={{ marginTop: 10 }}>
          <label className="ai-field"><span>{t('studios.ai.nextword.temperature')} <b className="ai-val">{state.temperature.toFixed(2)}</b></span>
            <input type="range" min={0} max={3} step={0.05} value={state.temperature} onChange={(e) => set({ temperature: Number(e.target.value) })} />
          </label>
          <label className="ai-field"><span>{t('studios.ai.nextword.order')}</span>
            <select value={state.order} onChange={(e) => set({ order: Number(e.target.value) === 2 ? 2 : 1, count: 0 })}>
              <option value={1}>{t('studios.ai.nextword.order1Opt')}</option>
              <option value={2}>{t('studios.ai.nextword.order2Opt')}</option>
            </select>
          </label>
        </div>
      </div>
      <div className="ai-card">
        <h3>{t('studios.ai.nextword.probs')}</h3>
        <p className="muted" style={{ margin: '0 0 8px', fontSize: '.88rem' }}>
          {t('studios.ai.nextword.context')} <b>{v.ctx.length ? v.ctx.slice(-2).join(' ') : t('studios.ai.nextword.empty')}</b>. {t(ORDER_NOTE[v.usedOrder])} {t('studios.ai.nextword.formula')}
        </p>
        <ul className="ai-bars" aria-label={t('studios.ai.nextword.candidatesAria')}>
          {shown.map((c) => <Bar key={c.word} name={`${c.word} (${c.count})`} value={c.p / (maxP || 1)} label={pct(c.p)} />)}
        </ul>
        <ul className="ai-stats">
          <li>{t('studios.ai.nextword.statCandidates')} <b>{v.dist.length}</b></li>
          <li>{t('studios.ai.nextword.statTop')} <b>{v.top ? `${v.top.word} ${pct(v.top.p)}` : '-'}</b></li>
          <li>{t('studios.ai.nextword.statEntropy')} <b>{v.entropy.toFixed(2)} bit</b></li>
        </ul>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>
          {t('studios.ai.nextword.tempNote')}
        </p>
      </div>
      <div className="ai-card">
        <h3>{t('studios.ai.nextword.generation')}</h3>
        <div className="ai-gen" aria-live="polite">
          {v.ctx.join(' ')}{v.gen.words.map((w, i) => <span key={i}>{' '}<mark>{w}</mark></span>)}
        </div>
        <div className="ai-topbar" style={{ marginTop: 10 }}>
          <button type="button" className="ai-btn" data-primary="true" onClick={() => set({ count: state.count + 1 })}>{t('studios.ai.nextword.genOne')}</button>
          <button type="button" className="ai-btn" onClick={() => set({ count: state.count + 5 })}>{t('studios.ai.nextword.genFive')}</button>
          <button type="button" className="ai-btn" onClick={() => set({ seed: state.seed + 1 })}>{t('studios.ai.nextword.newSeed', { n: state.seed })}</button>
          <button type="button" className="ai-btn" onClick={() => set({ count: 0 })}>{t('studios.ai.nextword.clear')}</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <Simulation>{lang === 'en' ? t('studios.ai.nextword.simEn') : t('studios.ai.nextword.sim')}</Simulation>
        </div>
      </div>
    </div>
  )
}
