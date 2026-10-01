'use client'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { cpp } from '@codemirror/lang-cpp'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { StateEffect, StateField, type Extension } from '@codemirror/state'
import { Decoration, EditorView, drawSelection, highlightActiveLine, keymap, lineNumbers, type DecorationSet } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'

export interface CodePaneApi { goToLine(line: number): void }

const setErrorLines = StateEffect.define<number[]>()
const errorField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(setErrorLines)) {
        const lines = [...new Set(e.value)].filter((n) => n >= 1 && n <= tr.state.doc.lines).sort((a, b) => a - b)
        deco = Decoration.set(lines.map((n) => Decoration.line({ class: 'cm-errline', attributes: { 'data-error-line': String(n) } }).range(tr.state.doc.line(n).from)))
      }
    }
    return deco
  },
  provide: (f) => EditorView.decorations.from(f),
})

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.modifier], color: 'var(--hl-keyword)' },
  { tag: [t.typeName, t.standard(t.typeName)], color: 'var(--hl-type)' },
  { tag: [t.string, t.character], color: 'var(--hl-string)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--hl-number)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--hl-comment)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--hl-title)' },
  { tag: [t.processingInstruction, t.meta], color: 'var(--hl-meta)' },
])

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--code-bg)', color: 'var(--code-text)', fontSize: '14px', height: '100%' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', lineHeight: '1.55', overflow: 'auto' },
  '.cm-content': { caretColor: '#fff', padding: '8px 0' },
  '.cm-gutters': { backgroundColor: 'var(--code-bg)', color: '#64748b', border: 'none', borderRight: '1px solid var(--code-border)' },
  '.cm-activeLine': { backgroundColor: 'rgba(148,163,184,.08)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(148,163,184,.12)', color: '#cbd5e1' },
  '&.cm-focused': { outline: '2px solid var(--focus)', outlineOffset: '-2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(99,102,241,.35)' },
  '.cm-cursor': { borderLeftColor: '#fff' },
}, { dark: true })

interface Props {
  value: string
  onChange: (v: string) => void
  errorLines: number[]
  apiRef?: Ref<CodePaneApi>
  height: number
}

export function CodePane({ value, onChange, errorLines, apiRef, height }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const initial = useRef({ value, errorLines })

  useEffect(() => {
    const exts: Extension[] = [
      lineNumbers(), highlightActiveLine(), history(), drawSelection(), cpp(), syntaxHighlighting(highlight), theme, errorField,
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      EditorView.contentAttributes.of({ 'aria-label': 'Arduino C++ kodu' }),
      EditorView.updateListener.of((u) => { if (u.docChanged) onChangeRef.current(u.state.doc.toString()) }),
    ]
    const v = new EditorView({ doc: initial.current.value, extensions: exts, parent: host.current! })
    view.current = v
    v.dispatch({ effects: setErrorLines.of(initial.current.errorLines) })
    return () => { v.destroy(); view.current = null }
  }, [])

  // Dışarıdan gelen değer (ör. kayıttan yükleme) düzenleyiciye yansıtılır.
  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
  }, [value])
  useEffect(() => { view.current?.dispatch({ effects: setErrorLines.of(errorLines) }) }, [errorLines, value])

  useImperativeHandle(apiRef, () => ({
    goToLine(line: number) {
      const v = view.current
      if (!v) return
      const n = Math.max(1, Math.min(v.state.doc.lines, line))
      const pos = v.state.doc.line(n).from
      v.dispatch({ selection: { anchor: pos }, effects: EditorView.scrollIntoView(pos, { y: 'center' }) })
      v.focus()
    },
  }), [])

  return <div ref={host} className="lab-code" style={{ height }} data-testid="lab-code" />
}
