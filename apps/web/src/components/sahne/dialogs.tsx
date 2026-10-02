'use client'
// Küçük iletişim kutuları: ad sorma, "Bir blok yap", proje bilgisi.
import { useEffect, useRef, useState } from 'react'

export function Modal({ title, onClose, children, wide, testid }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean; testid?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', k, true)
    const first = ref.current?.querySelector<HTMLElement>('input, textarea, button.sh-modal-primary, button')
    first?.focus()
    return () => { window.removeEventListener('keydown', k, true); prev?.focus?.() }
  }, [onClose])
  return (
    <div className="sh-modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className="sh-modal" data-wide={!!wide} role="dialog" aria-modal="true" aria-label={title} data-testid={testid}>
        <header className="sh-modal-head"><h3>{title}</h3><button type="button" className="sh-modal-x" onClick={onClose} aria-label="Kapat">✕</button></header>
        {children}
      </div>
    </div>
  )
}

export function NameDialog({ title, label, initial = '', placeholder, okText = 'Tamam', validate, onOk, onClose, help, testid }: {
  title: string; label: string; initial?: string; placeholder?: string; okText?: string; help?: string
  validate?: (name: string) => string | null
  onOk: (name: string) => void; onClose: () => void; testid?: string
}) {
  const [v, setV] = useState(initial)
  const err = v.trim() ? validate?.(v.trim()) ?? null : null
  const submit = (e: React.FormEvent) => { e.preventDefault(); const n = v.trim(); if (n && !validate?.(n)) onOk(n) }
  return (
    <Modal title={title} onClose={onClose} testid={testid}>
      <form onSubmit={submit} className="sh-form">
        <label className="sh-field"><span>{label}</span><input type="text" value={v} maxLength={30} placeholder={placeholder} onChange={(e) => setV(e.target.value)} data-testid="sahne-dialog-input" /></label>
        {help && <p className="muted sh-help">{help}</p>}
        {err && <p className="sh-err" role="alert">{err}</p>}
        <div className="sh-modal-foot"><button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button><button type="submit" className="btn btn-primary sh-modal-primary" disabled={!v.trim() || !!err} data-testid="sahne-dialog-ok">{okText}</button></div>
      </form>
    </Modal>
  )
}

/** "Bir blok yap": ad + girdiler (virgülle ayrılmış). */
export function ProcDialog({ existing, onOk, onClose }: { existing: string[]; onOk: (name: string, params: string[]) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [params, setParams] = useState('')
  const list = params.split(',').map((p) => p.trim()).filter(Boolean).slice(0, 4)
  const err = name.trim() && existing.some((e) => e.toLocaleLowerCase('tr') === name.trim().toLocaleLowerCase('tr')) ? 'Bu adda bir blok zaten var.' : list.length !== new Set(list).size ? 'Girdi adları farklı olmalı.' : null
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim() && !err) onOk(name.trim(), list) }
  return (
    <Modal title="Bir blok yap" onClose={onClose} testid="sahne-proc-dialog">
      <form onSubmit={submit} className="sh-form">
        <label className="sh-field"><span>Bloğun adı</span><input type="text" value={name} maxLength={24} placeholder="zıpla" onChange={(e) => setName(e.target.value)} data-testid="sahne-proc-name" /></label>
        <label className="sh-field"><span>Girdiler (isteğe bağlı, virgülle ayır)</span><input type="text" value={params} maxLength={60} placeholder="yükseklik" onChange={(e) => setParams(e.target.value)} data-testid="sahne-proc-params" /></label>
        <p className="muted sh-help">Önizleme: <b className="sh-proc-prev">{name.trim() || 'blok'}{list.map((p) => <span key={p}> ({p})</span>)}</b>. Yapınca çalışma alanında bir "tanımla" bloğu belirir; altına bloğun yapacağı işleri tutturursun.</p>
        {err && <p className="sh-err" role="alert">{err}</p>}
        <div className="sh-modal-foot"><button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button><button type="submit" className="btn btn-primary sh-modal-primary" disabled={!name.trim() || !!err} data-testid="sahne-proc-ok">Tamam</button></div>
      </form>
    </Modal>
  )
}

export function ProjectDialog({ name, notes, lockName, onOk, onClose }: { name: string; notes: string; lockName?: boolean; onOk: (name: string, notes: string) => void; onClose: () => void }) {
  const [n, setN] = useState(name)
  const [t, setT] = useState(notes)
  return (
    <Modal title="Proje bilgisi" onClose={onClose} testid="sahne-project-dialog">
      <form className="sh-form" onSubmit={(e) => { e.preventDefault(); onOk(n.trim() || 'Projem', t) }}>
        <label className="sh-field"><span>Proje adı</span><input type="text" value={n} maxLength={60} disabled={lockName} onChange={(e) => setN(e.target.value)} data-testid="sahne-project-name" /></label>
        <label className="sh-field"><span>Plan ve notlar: ne yapacaksın, nasıl oynanır?</span>
          <textarea rows={6} value={t} maxLength={4000} onChange={(e) => setT(e.target.value)} placeholder="Kim/ne var? Hangi sahneler? Hangi bloklar gerekecek?" data-testid="sahne-project-notes" />
        </label>
        <p className="muted sh-help">Güvenlik: projeye gerçek adını, okulunu, adresini ya da fotoğrafını yazma.</p>
        <div className="sh-modal-foot"><button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button><button type="submit" className="btn btn-primary sh-modal-primary" data-testid="sahne-project-ok">Kaydet</button></div>
      </form>
    </Modal>
  )
}
