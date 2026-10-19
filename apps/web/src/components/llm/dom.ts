// LLM dersi simülasyonlarının ortak DOM yardımcıları (sims.ts ve sims3d.ts): denetimler, okuma kutusu, metin biçimi.
export type Lang = 'tr' | 'en'
export type Cfg = Record<string, string>
export type Mount = (stage: HTMLElement, side: HTMLElement, cfg: Cfg, lang: Lang) => () => void

export const T = (lang: Lang) => (tr: string, en: string) => (lang === 'en' ? en : tr)
export const nf = (lang: Lang, d = 2) => (v: number) => v.toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: Array<Node | string>): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else e.setAttribute(k, v) }
  e.append(...kids)
  return e
}
export function controls(host: HTMLElement) { const c = el('div', { class: 'ctrl' }); host.append(c); return c }
export interface Ctl<T> { v: T }
export function slider(p: HTMLElement, label: string, min: number, max: number, step: number, val: number, fmt: (v: number) => string, on: () => void): Ctl<number> {
  const out = el('output', {}, fmt(val))
  const inp = el('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(val), 'aria-label': label })
  const o = { v: +inp.value }
  inp.addEventListener('input', () => { o.v = +inp.value; out.textContent = fmt(o.v); on() })
  p.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, el('span', {}, label), out), inp))
  return o
}
export function select(p: HTMLElement, label: string, opts: Array<[string, string]>, val: string, on: () => void): Ctl<string> {
  const s = el('select', { 'aria-label': label })
  for (const [v, t] of opts) s.append(el('option', { value: v }, t))
  s.value = val
  const o = { v: s.value }
  s.addEventListener('change', () => { o.v = s.value; on() })
  p.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, label), s))
  return o
}
export function check(p: HTMLElement, label: string, val: boolean, on: () => void): Ctl<boolean> {
  const i = el('input', { type: 'checkbox' }); i.checked = val
  const o = { v: val }
  i.addEventListener('change', () => { o.v = i.checked; on() })
  p.append(el('label', { class: 'ck' }, i, label))
  return o
}
export function textInput(p: HTMLElement, label: string, val: string, on: () => void, rows = 0): Ctl<string> {
  const i = rows > 0 ? el('textarea', { rows: String(rows), 'aria-label': label, class: 'lm-ta' }) : el('input', { type: 'text', 'aria-label': label, class: 'lm-in' })
  i.value = val
  const o = { v: val }
  i.addEventListener('input', () => { o.v = i.value; on() })
  p.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, label), i))
  return o
}
export function button(p: HTMLElement, label: string, fn: () => void, cls = '') { const b = el('button', { class: `sbtn ${cls}`, type: 'button' }, label); b.addEventListener('click', fn); p.append(b); return b }
export function readout(p: HTMLElement, cls = '') { const r = el('div', { class: `readout ${cls}`, 'aria-live': 'polite' }); p.append(r); return r }
export const box = (title: string, ...kids: Array<Node | string>) => el('div', { class: 'lm-box' }, el('h4', {}, title), ...kids)
export const pre = (s: string, cls = '') => el('pre', { class: `lm-pre ${cls}` }, s)
