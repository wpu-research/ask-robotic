'use client'
// MuRoKo blok paneli: Blockly ile motor blokları, canlı Python karşılığı. Yalnız istemcide, dinamik import ile yüklenir.
import { useEffect, useRef, useState } from 'react'
import type * as BlocklyNS from 'blockly'
import { compileWorkspace, type Op } from '@/lib/mujoco/program'

type B = typeof BlocklyNS
export interface Actuator { name: string; lo: number; hi: number }

interface Props {
  actuators: Actuator[]
  en: boolean
  /** Çalışma alanı değişince güncel program (boşsa []). */
  onChange: (programs: Op[][]) => void
}

const T = {
  tr: { set: '%1 motorunu %2 yap', wait: '%1 saniye bekle', repeat: '%1 kez tekrarla %2', forever: 'sonsuza kadar %1', setTip: 'Bir motorun hedef değerini ayarlar', empty: 'Soldan blok sürükle', noMotor: 'Bu sahnede motor yok. "İki eksenli robot kol" ya da "Arabalı ters sarkaç" sahnesini seç.', python: 'Python karşılığı' },
  en: { set: 'set motor %1 to %2', wait: 'wait %1 seconds', repeat: 'repeat %1 times %2', forever: 'forever %1', setTip: 'Sets the target value of a motor', empty: 'Drag blocks from the left', noMotor: 'This scene has no motors. Pick "Two-joint robot arm" or "Cart-pole".', python: 'Python version' },
}

let defined: 'tr' | 'en' | null = null
function define(Blockly: B, lang: 'tr' | 'en', actsRef: { current: Actuator[] }) {
  if (defined === lang) return
  defined = lang
  const t = T[lang]
  const opts = () => (actsRef.current.length ? actsRef.current.map((a) => [a.name, a.name] as [string, string]) : [['—', '']] as [string, string][])
  Blockly.Blocks['muroko_set'] = {
    init(this: BlocklyNS.Block) {
      this.appendDummyInput().appendField(t.set.split('%1')[0]).appendField(new Blockly.FieldDropdown(opts), 'U').appendField(t.set.split('%1')[1].split('%2')[0]).appendField(new Blockly.FieldNumber(0, -100, 100, 0.01), 'V').appendField(t.set.split('%2')[1] ?? '')
      this.setPreviousStatement(true); this.setNextStatement(true); this.setStyle('muroko_motor'); this.setTooltip(t.setTip)
    },
  }
  Blockly.defineBlocksWithJsonArray([
    { type: 'muroko_wait', message0: t.wait, args0: [{ type: 'field_number', name: 'S', value: 1, min: 0, max: 60, precision: 0.1 }], previousStatement: null, nextStatement: null, style: 'muroko_ctl' },
    { type: 'muroko_repeat', message0: t.repeat, args0: [{ type: 'field_number', name: 'N', value: 3, min: 1, max: 100, precision: 1 }, { type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, style: 'muroko_ctl' },
    { type: 'muroko_forever', message0: t.forever, args0: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, style: 'muroko_ctl' },
  ])
}

function pythonOf(Blockly: B, py: { pythonGenerator: BlocklyNS.CodeGenerator }, ws: BlocklyNS.Workspace, lang: 'tr' | 'en'): string {
  const g = py.pythonGenerator
  const fb = g.forBlock as Record<string, (b: BlocklyNS.Block, gen: BlocklyNS.CodeGenerator) => string>
  const body = (b: BlocklyNS.Block, gen: BlocklyNS.CodeGenerator) => gen.statementToCode(b, 'DO') || '    pass\n'
  const [set, wait] = lang === 'tr' ? ['motor', 'bekle'] : ['motor', 'wait']
  fb['muroko_set'] = (b) => `${set}(${JSON.stringify(b.getFieldValue('U'))}, ${b.getFieldValue('V')})\n`
  fb['muroko_wait'] = (b) => `${wait}(${b.getFieldValue('S')})\n`
  fb['muroko_repeat'] = (b, gen) => `for _ in range(${b.getFieldValue('N')}):\n${body(b, gen)}`
  fb['muroko_forever'] = (b, gen) => `while True:\n${body(b, gen)}`
  void Blockly
  const code = g.workspaceToCode(ws).trim()
  return code ? `from muroko import *\n\n${code}` : ''
}

export function MurokoBlocks({ actuators, en, onChange }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const wsRef = useRef<BlocklyNS.WorkspaceSvg | null>(null)
  const acts = useRef(actuators); acts.current = actuators
  const cb = useRef(onChange); cb.current = onChange
  const [py, setPy] = useState('')
  const [failed, setFailed] = useState(false)
  const lang = en ? 'en' : 'tr'
  const hasActs = actuators.length > 0

  useEffect(() => {
    if (!hasActs) return
    let dead = false
    let ws: BlocklyNS.WorkspaceSvg | null = null
    let ro: ResizeObserver | null = null
    ;(async () => {
      try {
        const Blockly = await import('blockly')
        const pyMod = await import('blockly/python')
        const Msgs = await (en ? import('blockly/msg/en') : import('blockly/msg/tr')).catch(() => null)
        if (dead || !host.current) return
        if (Msgs) Blockly.setLocale(Msgs as unknown as Parameters<typeof Blockly.setLocale>[0])
        define(Blockly, lang, acts)
        const theme = Blockly.Theme.defineTheme('muroko', {
          name: 'muroko', base: Blockly.Themes.Classic,
          blockStyles: { muroko_motor: { colourPrimary: '#2f80ed' }, muroko_ctl: { colourPrimary: '#f2994a' } },
          componentStyles: { workspaceBackgroundColour: '#f3f6fc', flyoutBackgroundColour: '#e6edf7', flyoutOpacity: 1 },
          fontStyle: { family: 'system-ui, sans-serif', weight: '700', size: 15 },
        })
        ws = Blockly.inject(host.current, {
          renderer: 'zelos', theme, media: '/blockly/media/', sounds: false, trashcan: true, scrollbars: true,
          toolbox: { kind: 'flyoutToolbox', contents: [{ kind: 'block', type: 'muroko_set' }, { kind: 'block', type: 'muroko_wait' }, { kind: 'block', type: 'muroko_repeat' }, { kind: 'block', type: 'muroko_forever' }] } as BlocklyNS.utils.toolbox.ToolboxInfo,
          move: { scrollbars: true, drag: true, wheel: true }, zoom: { controls: true, startScale: 0.9, minScale: 0.5, maxScale: 1.6 },
        })
        wsRef.current = ws
        const w = ws
        ;(host.current as HTMLDivElement & { __blocklyWs?: unknown }).__blocklyWs = ws // test/hata ayıklama için
        const emit = () => {
          cb.current(compileWorkspace(Blockly.serialization.workspaces.save(w)))
          setPy(pythonOf(Blockly, pyMod as unknown as { pythonGenerator: BlocklyNS.CodeGenerator }, w, lang))
        }
        w.addChangeListener((e) => { if (!e.isUiEvent) emit() })
        ro = new ResizeObserver(() => Blockly.svgResize(w)); ro.observe(host.current)
      } catch { if (!dead) setFailed(true) }
    })()
    return () => { dead = true; ro?.disconnect(); ws?.dispose(); wsRef.current = null; cb.current([]); setPy('') }
  }, [en, lang, hasActs])

  // Sahne değişince eski motor adlı bloklar anlamsızlaşır: çalışma alanını temizle
  useEffect(() => { wsRef.current?.clear() }, [actuators])

  if (actuators.length === 0) return <p className="mj-hint" data-testid="mujoco-nomotor">{T[lang].noMotor}</p>
  return (
    <div className="mj-blocks">
      <div ref={host} className="mj-blocks-ws" data-testid="mujoco-blocks" />
      {failed && <p className="mj-err" role="alert">{en ? 'The block editor could not load.' : 'Blok editörü yüklenemedi.'}</p>}
      <details className="mj-py" open>
        <summary>🐍 {T[lang].python}</summary>
        <pre className="mj-py-pre" data-testid="mujoco-py">{py || `# ${T[lang].empty}`}</pre>
      </details>
    </div>
  )
}
