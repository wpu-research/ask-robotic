// Blockly için yerel (window.prompt yerine) istem penceresi: çocuk dostu, test edilebilir.
export function askText(message: string, defaultValue: string, done: (v: string | null) => void, labels: { ok: string; cancel: string }): void {
  if (typeof document === 'undefined') { done(null); return }
  const overlay = document.createElement('div')
  overlay.className = 'mk-dialog-overlay'
  overlay.innerHTML = `<div class="mk-dialog" role="dialog" aria-modal="true"><label class="mk-dialog-msg"></label><input class="mk-dialog-input" type="text" maxlength="40" /><div class="mk-dialog-actions"><button type="button" class="mk-btn mk-btn-ghost" data-act="cancel"></button><button type="button" class="mk-btn mk-btn-primary" data-act="ok"></button></div></div>`
  const msg = overlay.querySelector('.mk-dialog-msg') as HTMLElement
  const input = overlay.querySelector('input') as HTMLInputElement
  msg.textContent = message
  ;(overlay.querySelector('[data-act="cancel"]') as HTMLElement).textContent = labels.cancel
  ;(overlay.querySelector('[data-act="ok"]') as HTMLElement).textContent = labels.ok
  input.value = defaultValue
  const finish = (v: string | null) => { overlay.remove(); done(v) }
  overlay.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    if (t === overlay) finish(null)
    const act = t.closest('[data-act]')?.getAttribute('data-act')
    if (act === 'ok') finish(input.value)
    else if (act === 'cancel') finish(null)
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(input.value)
    else if (e.key === 'Escape') finish(null)
  })
  document.body.appendChild(overlay)
  input.focus(); input.select()
}
