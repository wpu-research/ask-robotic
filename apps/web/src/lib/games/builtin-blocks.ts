// Yerleşik (Blockly çekirdeği) bloklarının oyun çerçevesindeki bilgisi: kategori, renk, araç kutusu ön değerleri.
// Bunlar için ayrıca blok tanımı yazılmaz; yorumlayıcı (interpreter.ts) ve kod üretici (codegen.ts) hazırdır.

export interface BuiltinInfo {
  category: string
  /** Araç kutusuna konurken ön tanımlı giriş/alan değerleri (Blockly blok JSON parçası). */
  preset?: { inputs?: Record<string, unknown>; fields?: Record<string, unknown>; extraState?: unknown }
}

const num = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } })

export const BUILTIN_BLOCKS: Record<string, BuiltinInfo> = {
  controls_repeat_ext: { category: 'Döngüler', preset: { inputs: { TIMES: num(5) } } },
  controls_repeat: { category: 'Döngüler', preset: { fields: { TIMES: 5 } } },
  controls_whileUntil: { category: 'Döngüler' },
  controls_for: { category: 'Döngüler', preset: { inputs: { FROM: num(1), TO: num(10), BY: num(1) } } },
  controls_flow_statements: { category: 'Döngüler' },
  controls_if: { category: 'Mantık' },
  logic_compare: { category: 'Mantık' },
  logic_operation: { category: 'Mantık' },
  logic_negate: { category: 'Mantık' },
  logic_boolean: { category: 'Mantık' },
  logic_null: { category: 'Mantık' },
  logic_ternary: { category: 'Mantık' },
  math_number: { category: 'Matematik' },
  math_arithmetic: { category: 'Matematik', preset: { inputs: { A: num(1), B: num(1) } } },
  math_modulo: { category: 'Matematik', preset: { inputs: { DIVIDEND: num(64), DIVISOR: num(10) } } },
  math_single: { category: 'Matematik', preset: { inputs: { NUM: num(9) } } },
  math_round: { category: 'Matematik', preset: { inputs: { NUM: num(3.1) } } },
  math_random_int: { category: 'Matematik', preset: { inputs: { FROM: num(1), TO: num(100) } } },
  math_number_property: { category: 'Matematik', preset: { inputs: { NUMBER_TO_CHECK: num(0) } } },
  math_change: { category: 'Değişkenler', preset: { inputs: { DELTA: num(1) } } },
  variables_get: { category: 'Değişkenler' },
  variables_set: { category: 'Değişkenler' },
  text: { category: 'Metin' },
  text_join: { category: 'Metin' },
  procedures_defnoreturn: { category: 'İşlevler' },
  procedures_defreturn: { category: 'İşlevler' },
  procedures_callnoreturn: { category: 'İşlevler' },
  procedures_callreturn: { category: 'İşlevler' },
  procedures_ifreturn: { category: 'İşlevler' },
}

/** Yerleşik kategori renkleri (Blockly varsayılan ailesinden, çocuk dostu). */
export const CATEGORY_COLOURS: Record<string, string> = {
  Döngüler: '#5ba55b',
  Mantık: '#5b80a5',
  Matematik: '#5b67a5',
  Metin: '#5ba58c',
  Değişkenler: '#a55b80',
  İşlevler: '#995ba5',
}

export const isBuiltinType = (t: string): boolean => t in BUILTIN_BLOCKS

/** Blockly'nin dinamik değişken/işlev kategorileriyle sunulan yerleşik türler. */
export const DYNAMIC_VARIABLE_TYPES = new Set(['variables_get', 'variables_set'])
export const DYNAMIC_PROCEDURE_TYPES = new Set(['procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn', 'procedures_callreturn', 'procedures_ifreturn'])
