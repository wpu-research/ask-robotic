// Tarayıcıda Python: worker dosyası var, Pyodide sabit sürümle jsdelivr'den yüklenir, 'run' mesajını işler; sayfa metinleri tam.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { codeText } from '@/components/ml/py-runner'
import { ML_TEXT } from './text'

const W = join(__dirname, '../../../public/pyodide/worker.js')

describe('tarayıcıda Python (Pyodide)', () => {
  it('worker var, Pyodide 0.26.x jsdelivr’den sabit sürümle, numpy yüklenir, run/out/done mesajları', () => {
    expect(existsSync(W)).toBe(true)
    const s = readFileSync(W, 'utf8')
    expect(s).toMatch(/PYODIDE_VERSION = '0\.26\.\d+'/)
    expect(s).toContain('https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/')
    expect(s).toContain("loadPackage('numpy')")
    for (const k of ["m.type !== 'run'", "type: 'out'", "type: 'done'", 'FS.writeFile', "globals.get('dict')", 'runPythonAsync']) expect(s).toContain(k)
  })
  it('kod metni ders panelindeki gibi: yorumlar dile göre, aynı sütunda', () => {
    const t = codeText([['import numpy as np'], ['x = 1', 'bir', 'one']], 'en')
    expect(t).toBe('import numpy as np\nx = 1' + ' '.repeat(15) + '# one\n')
    expect(codeText([['x = 1', 'bir', 'one']], 'tr')).toContain('# bir')
  })
  it('veri ve çalıştırma metinleri iki dilde dolu', () => {
    for (const k of ['dataTitle', 'dataDownload', 'dataSetsTitle', 'dataSetsLead', 'runTitle', 'run', 'stop', 'upload', 'uploaded', 'loadingPy', 'runTimeout'] as const) {
      expect(ML_TEXT.tr[k].length, k).toBeGreaterThan(0); expect(ML_TEXT.en[k].length, k).toBeGreaterThan(0)
    }
    expect(Object.keys(ML_TEXT.en).sort()).toEqual(Object.keys(ML_TEXT.tr).sort())
  })
})
