'use client'
// MuRoKo blok paneli: Blockly ile motor blokları, canlı Python karşılığı. Yalnız istemcide, dinamik import ile yüklenir.
import { useCallback, useEffect, useRef, useState } from 'react'
import type * as BlocklyNS from 'blockly'
import { compileWorkspace, type Op } from '@/lib/mujoco/program'
import type { BlockExample } from '@/lib/mujoco/scenes'

type B = typeof BlocklyNS
export interface Actuator { name: string; lo: number; hi: number }

interface Props {
  actuators: Actuator[]
  /** Sensör kanal adları (lib/mujoco/sensors.ts). */
  sensors: string[]
  en: boolean
  /** Çalışma alanı değişince güncel program (boşsa []). */
  onChange: (programs: Op[][]) => void
  /** Blokların Python karşılığı değişince (Python sekmesine aktarmak için). */
  onPython?: (py: string) => void
  /** Açılışta ve "Örnek" düğmesinde yüklenen örnek program. */
  example?: BlockExample | null
}

const T = {
  tr: { set: '%1 motorunu %2 yap', wait: '%1 saniye bekle', repeat: '%1 kez tekrarla %2', forever: 'sonsuza kadar %1', setTip: 'Bir motorun hedef değerini ayarlar', empty: 'Soldan blok sürükle',
    exampleBtn: 'Örnek program', clearBtn: 'Temizle', catMotor: 'Motor', catSense: 'Sensör', catControl: 'Kontrol', hint: 'Blokları soldan sürükle ve alt alta birleştir.', if: 'eğer %1 %2 %3 ise %4 değilse %5', calc: '%1 motorunu %2 × %3 + %4 yap', lt: 'küçükse', gt: 'büyükse', noMotor: 'Bu tasarımda motor yok. CAD → Montaj bölümünden servo veya parça kütüphanesinden motorlu tekerlek ekle.', python: 'Python karşılığı' },
  en: { set: 'set motor %1 to %2', wait: 'wait %1 seconds', repeat: 'repeat %1 times %2', forever: 'forever %1', setTip: 'Sets the target value of a motor', empty: 'Drag blocks from the left',
    exampleBtn: 'Example program', clearBtn: 'Clear', catMotor: 'Motor', catSense: 'Sensor', catControl: 'Control', hint: 'Drag blocks from the left and snap them together.', if: 'if %1 %2 %3 then %4 else %5', calc: 'set motor %1 to %2 × %3 + %4', lt: 'is below', gt: 'is above', noMotor: 'This design has no motors. Add a servo under CAD → Assembly, or a motorized wheel from the parts library.', python: 'Python version' },
}

let defined: 'tr' | 'en' | null = null
const en2 = (l: 'tr' | 'en') => l === 'en'
function define(Blockly: B, lang: 'tr' | 'en', actsRef: { current: Actuator[] }, sensRef: { current: string[] }) {
  if (defined === lang) return
  defined = lang
  const t = T[lang]
  const opts = () => (actsRef.current.length ? actsRef.current.map((a) => [a.name, a.name] as [string, string]) : [['—', '']] as [string, string][])
  Blockly.Blocks['muroko_set'] = {
    init(this: BlocklyNS.Block) {
      this.appendDummyInput().appendField(t.set.split('%1')[0]).appendField(new Blockly.FieldDropdown(opts), 'U').appendField(t.set.split('%1')[1].split('%2')[0]).appendField(new Blockly.FieldNumber(0, -1000, 1000, 0.01), 'V').appendField(t.set.split('%2')[1] ?? '')
      this.setPreviousStatement(true); this.setNextStatement(true); this.setStyle('muroko_motor'); this.setTooltip(t.setTip)
    },
  }
  const sopts = () => (sensRef.current.length ? sensRef.current.map((n) => [n, n] as [string, string]) : [['—', '']] as [string, string][])
  const cmpOpts = [[t.lt, 'lt'], [t.gt, 'gt']] as [string, string][]
  Blockly.Blocks['muroko_if'] = {
    init(this: BlocklyNS.Block) {
      this.appendDummyInput().appendField(en2(lang) ? 'if' : 'eğer').appendField(new Blockly.FieldDropdown(sopts), 'S').appendField(new Blockly.FieldDropdown(cmpOpts), 'C').appendField(new Blockly.FieldNumber(0.3, -1000, 1000, 0.01), 'V').appendField(en2(lang) ? 'then' : 'ise')
      this.appendStatementInput('DO')
      this.appendDummyInput().appendField(en2(lang) ? 'else' : 'değilse')
      this.appendStatementInput('ELSE')
      this.setPreviousStatement(true); this.setNextStatement(true); this.setStyle('muroko_sensor')
    },
  }
  Blockly.Blocks['muroko_calc'] = {
    init(this: BlocklyNS.Block) {
      this.appendDummyInput().appendField(new Blockly.FieldDropdown(opts), 'U').appendField(en2(lang) ? '=' : 'motoru =').appendField(new Blockly.FieldDropdown(sopts), 'S').appendField('×').appendField(new Blockly.FieldNumber(1, -1000, 1000, 0.01), 'K').appendField('+').appendField(new Blockly.FieldNumber(0, -1000, 1000, 0.01), 'C')
      this.setPreviousStatement(true); this.setNextStatement(true); this.setStyle('muroko_sensor')
    },
  }
  Blockly.defineBlocksWithJsonArray([
    { type: 'muroko_wait', message0: t.wait, args0: [{ type: 'field_number', name: 'S', value: 1, min: 0, max: 60, precision: 0.01 }], previousStatement: null, nextStatement: null, style: 'muroko_ctl' },
    { type: 'muroko_repeat', message0: t.repeat, args0: [{ type: 'field_number', name: 'N', value: 3, min: 1, max: 100, precision: 1 }, { type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, style: 'muroko_ctl' },
    { type: 'muroko_forever', message0: t.forever, args0: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, style: 'muroko_ctl' },
  ])
}

function pythonOf(Blockly: B, py: { pythonGenerator: BlocklyNS.CodeGenerator }, ws: BlocklyNS.Workspace, lang: 'tr' | 'en'): string {
  const g = py.pythonGenerator
  const fb = g.forBlock as Record<string, (b: BlocklyNS.Block, gen: BlocklyNS.CodeGenerator) => string>
  const body = (b: BlocklyNS.Block, gen: BlocklyNS.CodeGenerator) => gen.statementToCode(b, 'DO') || '    pass\n'
  const [set, wait] = lang === 'tr' ? ['motor', 'bekle'] : ['motor', 'wait']
  const cmp = (c: string) => (c === 'gt' ? '>' : '<')
  fb['muroko_set'] = (b) => `${set}(${JSON.stringify(b.getFieldValue('U'))}, ${b.getFieldValue('V')})\n`
  fb['muroko_wait'] = (b) => `await ${wait}(${b.getFieldValue('S')})\n`
  fb['muroko_if'] = (b, gen) => `if sensor(${JSON.stringify(b.getFieldValue('S'))}) ${cmp(b.getFieldValue('C'))} ${b.getFieldValue('V')}:\n${body(b, gen)}` + (gen.statementToCode(b, 'ELSE') ? `else:\n${gen.statementToCode(b, 'ELSE')}` : '')
  fb['muroko_calc'] = (b) => `${set}(${JSON.stringify(b.getFieldValue('U'))}, sensor(${JSON.stringify(b.getFieldValue('S'))}) * ${b.getFieldValue('K')} + ${b.getFieldValue('C')})\n`
  fb['muroko_repeat'] = (b, gen) => `for _ in range(${b.getFieldValue('N')}):\n${body(b, gen)}`
  fb['muroko_forever'] = (b, gen) => `while True:\n${body(b, gen)}`
  void Blockly
  const code = g.workspaceToCode(ws).trim()
  return code ? `from muroko import *\n\n${code}` : ''
}

export function MurokoBlocks({ actuators, sensors, en, onChange, onPython, example }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const wsRef = useRef<BlocklyNS.WorkspaceSvg | null>(null)
  const acts = useRef(actuators); acts.current = actuators
  const sens = useRef(sensors); sens.current = sensors
  const pyCb = useRef(onPython); pyCb.current = onPython
  const exRef = useRef(example); exRef.current = example
  const blocklyRef = useRef<B | null>(null)
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
        define(Blockly, lang, acts, sens)
        const theme = Blockly.Theme.defineTheme('muroko', {
          name: 'muroko', base: Blockly.Themes.Classic,
          blockStyles: { muroko_motor: { colourPrimary: '#2f80ed' }, muroko_ctl: { colourPrimary: '#f2994a' }, muroko_sensor: { colourPrimary: '#27ae60' } },
          componentStyles: { workspaceBackgroundColour: '#f3f6fc', flyoutBackgroundColour: '#e6edf7', flyoutOpacity: 1 },
          fontStyle: { family: 'system-ui, sans-serif', weight: '700', size: 15 },
        })
        ws = Blockly.inject(host.current, {
          renderer: 'zelos', theme, media: '/blockly/media/', sounds: false, trashcan: true, scrollbars: true,
          toolbox: {
            kind: 'categoryToolbox',
            contents: [
              { kind: 'category', name: T[lang].catMotor, colour: '#2f80ed', contents: [{ kind: 'block', type: 'muroko_set' }, { kind: 'block', type: 'muroko_calc' }] },
              { kind: 'category', name: T[lang].catSense, colour: '#27ae60', contents: [{ kind: 'block', type: 'muroko_if' }] },
              { kind: 'category', name: T[lang].catControl, colour: '#f2994a', contents: [{ kind: 'block', type: 'muroko_wait' }, { kind: 'block', type: 'muroko_repeat' }, { kind: 'block', type: 'muroko_forever' }] },
            ],
          } as BlocklyNS.utils.toolbox.ToolboxInfo,
          move: { scrollbars: true, drag: true, wheel: true }, zoom: { controls: true, startScale: 0.9, minScale: 0.5, maxScale: 1.6 },
        })
        wsRef.current = ws; blocklyRef.current = Blockly
        const w = ws
        ;(host.current as HTMLDivElement & { __blocklyWs?: unknown }).__blocklyWs = ws // test/hata ayıklama için
        const emit = () => {
          cb.current(compileWorkspace(Blockly.serialization.workspaces.save(w)))
          const code = pythonOf(Blockly, pyMod as unknown as { pythonGenerator: BlocklyNS.CodeGenerator }, w, lang)
          setPy(code); pyCb.current?.(code)
        }
        w.addChangeListener((e) => { if (!e.isUiEvent) emit() })
        if (exRef.current) Blockly.serialization.workspaces.load(exRef.current as object, w)
        ro = new ResizeObserver(() => Blockly.svgResize(w)); ro.observe(host.current)
      } catch { if (!dead) setFailed(true) }
    })()
    return () => { dead = true; ro?.disconnect(); ws?.dispose(); wsRef.current = null; cb.current([]); setPy(''); pyCb.current?.('') }
  }, [en, lang, hasActs])

  // Sahne değişince eski motor adlı bloklar anlamsızlaşır: çalışma alanını temizle
  // Sahne (motor ve sensör listesi) değişince çalışma alanı temizlenir ve o sahnenin örneği yüklenir
  const loadExample = useCallback(() => {
    const w = wsRef.current, Bk = blocklyRef.current
    if (!w || !Bk) return
    w.clear()
    if (exRef.current) Bk.serialization.workspaces.load(exRef.current as object, w)
  }, [])
  useEffect(() => { loadExample() }, [actuators, sensors, loadExample])

  if (actuators.length === 0) return <p className="mj-hint" data-testid="mujoco-nomotor">{T[lang].noMotor}</p>
  return (
    <div className="mj-blocks">
      <div className="mj-blocks-bar">
        <span className="mj-blocks-hint">{T[lang].hint}</span>
        <button type="button" className="mj-mini" onClick={loadExample} data-testid="mujoco-example">{T[lang].exampleBtn}</button>
        <button type="button" className="mj-mini" onClick={() => wsRef.current?.clear()} data-testid="mujoco-clear">{T[lang].clearBtn}</button>
      </div>
      <div ref={host} className="mj-blocks-ws" data-testid="mujoco-blocks" />
      {failed && <p className="mj-err" role="alert">{en ? 'The block editor could not load.' : 'Blok editörü yüklenemedi.'}</p>}
      <details className="mj-py" open>
        <summary>🐍 {T[lang].python}</summary>
        <pre className="mj-py-pre" data-testid="mujoco-py">{py || `# ${T[lang].empty}`}</pre>
      </details>
    </div>
  )
}
