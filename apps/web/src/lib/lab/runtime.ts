// Elektrik çekirdeği için TEK DEĞİŞİM NOKTASI. Arayüz yalnız bu dosyayı kullanır (createRuntime / analyze).
import { analyzeCircuit, createLab } from '@ask/sim'
import type { Circuit, CircuitAnalysis, LabApi } from './contract'

export const RUNTIME_KIND = 'real' as const

export function createRuntime(circuit: Circuit, hex: string): LabApi {
  return createLab(circuit, hex)
}

export function analyze(circuit: Circuit): CircuitAnalysis {
  return analyzeCircuit(circuit)
}
