// Elektrik çekirdeği için TEK DEĞİŞİM NOKTASI. Arayüz yalnız bu dosyayı kullanır (createRuntime / analyze).
import { analyzeCircuit, createLab } from '@ask/sim'
import type { Circuit, CircuitAnalysis, LabApi, LabOptions } from './contract'

export const RUNTIME_KIND = 'real' as const

/** `opts.eeprom`: önceki çalıştırmanın EEPROM görüntüsü (LabState.eeprom). Verilmezse EEPROM boş (255) başlar. */
export function createRuntime(circuit: Circuit, hex: string, opts?: LabOptions): LabApi {
  return createLab(circuit, hex, opts)
}

export function analyze(circuit: Circuit): CircuitAnalysis {
  return analyzeCircuit(circuit)
}
