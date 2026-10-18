// Yapılandırılmış çıktı: model metninden JSON çıkarma ve JSON Schema'nın küçük bir alt kümesiyle doğrulama
// (type, properties, required, additionalProperties, enum, minimum, maximum, minLength, maxLength, pattern, items,
// minItems, maxItems). Gerçek projede jsonschema / Ajv kullanılır; bu, dersteki doğrulayıcı ve onarım döngüsüdür.
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }
export interface Schema {
  type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null'
  properties?: Record<string, Schema>
  required?: string[]
  additionalProperties?: boolean
  enum?: Json[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  items?: Schema
  minItems?: number
  maxItems?: number
  description?: string
}
export type ErrCode = 'type' | 'required' | 'extra' | 'enum' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'minItems' | 'maxItems'
export interface SchemaError { path: string; code: ErrCode; detail: string }

const typeOf = (v: Json): string => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v === 'number' ? (Number.isInteger(v) ? 'integer' : 'number') : typeof v)
const typeOk = (want: NonNullable<Schema['type']>, v: Json): boolean => {
  const t = typeOf(v)
  return want === t || (want === 'number' && t === 'integer')
}

export function validate(schema: Schema, value: Json, path = '$'): SchemaError[] {
  const errs: SchemaError[] = []
  if (schema.type && !typeOk(schema.type, value)) {
    errs.push({ path, code: 'type', detail: `${schema.type} ≠ ${typeOf(value)}` })
    return errs
  }
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) errs.push({ path, code: 'enum', detail: schema.enum.map((e) => JSON.stringify(e)).join(' | ') })
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errs.push({ path, code: 'min', detail: `≥ ${schema.minimum}` })
    if (schema.maximum !== undefined && value > schema.maximum) errs.push({ path, code: 'max', detail: `≤ ${schema.maximum}` })
  }
  if (typeof value === 'string') {
    const n = Array.from(value).length
    if (schema.minLength !== undefined && n < schema.minLength) errs.push({ path, code: 'minLength', detail: `≥ ${schema.minLength}` })
    if (schema.maxLength !== undefined && n > schema.maxLength) errs.push({ path, code: 'maxLength', detail: `≤ ${schema.maxLength}` })
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, 'u').test(value)) errs.push({ path, code: 'pattern', detail: schema.pattern })
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errs.push({ path, code: 'minItems', detail: `≥ ${schema.minItems}` })
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errs.push({ path, code: 'maxItems', detail: `≤ ${schema.maxItems}` })
    if (schema.items) value.forEach((v, i) => errs.push(...validate(schema.items!, v, `${path}[${i}]`)))
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const k of schema.required ?? []) if (!(k in value)) errs.push({ path: `${path}.${k}`, code: 'required', detail: k })
    for (const [k, v] of Object.entries(value)) {
      const sub = schema.properties?.[k]
      if (sub) errs.push(...validate(sub, v, `${path}.${k}`))
      else if (schema.additionalProperties === false) errs.push({ path: `${path}.${k}`, code: 'extra', detail: k })
    }
  }
  return errs
}

export interface Extracted { ok: boolean; value?: Json; error?: string; /** JSON'un çevresinde metin vardı ve atıldı. */ trimmed: boolean }
/** Model çıktısından JSON nesnesini çıkarır: önce tamamını dener, sonra ``` bloğunu, sonra ilk { ile son } arasını. */
export function extractJson(text: string): Extracted {
  const tryParse = (s: string): Json | undefined => { try { return JSON.parse(s) as Json } catch { return undefined } }
  const whole = tryParse(text.trim())
  if (whole !== undefined) return { ok: true, value: whole, trimmed: false }
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
  if (fence) { const v = tryParse(fence[1].trim()); if (v !== undefined) return { ok: true, value: v, trimmed: true } }
  const a = text.indexOf('{'), b = text.lastIndexOf('}')
  if (a >= 0 && b > a) {
    const inner = text.slice(a, b + 1)
    const v = tryParse(inner)
    if (v !== undefined) return { ok: true, value: v, trimmed: true }
    try { JSON.parse(inner) } catch (e) { return { ok: false, error: (e as Error).message, trimmed: true } }
  }
  try { JSON.parse(text) } catch (e) { return { ok: false, error: (e as Error).message, trimmed: false } }
  return { ok: false, error: 'JSON', trimmed: false }
}

/** Onarım döngüsünde modele geri gönderilecek mesaj (hata listesiyle). */
export function repairMessage(errors: readonly SchemaError[], parseError: string | undefined, lang: 'tr' | 'en' = 'tr'): string {
  if (parseError) return lang === 'en'
    ? `Your previous reply was not valid JSON (${parseError}). Reply again with only one JSON object that matches the schema, with no text around it.`
    : `Önceki cevabın geçerli JSON değildi (${parseError}). Şemaya uyan tek bir JSON nesnesiyle, çevresinde hiç metin olmadan yeniden cevap ver.`
  if (errors.length === 0) return ''
  const list = errors.map((e) => `- ${e.path}: ${e.code} (${e.detail})`).join('\n')
  return lang === 'en'
    ? `Your previous JSON did not match the schema:\n${list}\nFix only these fields and reply again with the whole JSON object.`
    : `Önceki JSON çıktın şemaya uymadı:\n${list}\nYalnız bu alanları düzelt ve JSON nesnesinin tamamıyla yeniden cevap ver.`
}

/** Dersteki örnek şema: bir öğrencinin laboratuvar raporu özetinin yapılandırılmış hâli. */
export const LAB_SCHEMA: Schema = {
  type: 'object',
  additionalProperties: false,
  required: ['ogrenci_no', 'deney', 'sonuc', 'puan', 'etiketler'],
  properties: {
    ogrenci_no: { type: 'string', pattern: '^[0-9]{8}$', description: '8 haneli öğrenci numarası' },
    deney: { type: 'string', enum: ['ohm', 'pwm', 'i2c', 'pid'] },
    sonuc: { type: 'string', minLength: 10, maxLength: 200 },
    puan: { type: 'integer', minimum: 0, maximum: 100 },
    etiketler: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
  },
}

export type SampleId = 'gecerli' | 'eksik' | 'tur' | 'metin' | 'enum' | 'bozuk'
export const SAMPLES: Record<SampleId, string> = {
  gecerli: '{"ogrenci_no": "20260143", "deney": "pwm", "sonuc": "Doluluk oranı arttıkça motor hızı doğrusal arttı.", "puan": 88, "etiketler": ["motor", "pwm"]}',
  eksik: '{"ogrenci_no": "20260143", "deney": "pwm", "sonuc": "Doluluk oranı arttıkça motor hızı arttı.", "etiketler": ["motor"]}',
  tur: '{"ogrenci_no": 20260143, "deney": "pwm", "sonuc": "Doluluk oranı arttıkça motor hızı arttı.", "puan": "88", "etiketler": ["motor"]}',
  metin: 'Tabii! İşte istediğin özet:\n```json\n{"ogrenci_no": "20260143", "deney": "i2c", "sonuc": "MPU6050 0x68 adresinde bulundu ve okundu.", "puan": 92, "etiketler": ["i2c", "sensör"]}\n```\nBaşka bir şey ister misin?',
  enum: '{"ogrenci_no": "2026014", "deney": "spi", "sonuc": "Çalıştı.", "puan": 120, "etiketler": [], "not": "fazladan alan"}',
  bozuk: '{"ogrenci_no": "20260143", "deney": "pid", "sonuc": "Aşım azaldı", "puan": 75, "etiketler": ["pid",]}',
}
export const SAMPLES_EN: Record<SampleId, string> = {
  gecerli: '{"ogrenci_no": "20260143", "deney": "pwm", "sonuc": "Motor speed rose linearly as the duty cycle rose.", "puan": 88, "etiketler": ["motor", "pwm"]}',
  eksik: '{"ogrenci_no": "20260143", "deney": "pwm", "sonuc": "Motor speed rose as the duty cycle rose.", "etiketler": ["motor"]}',
  tur: '{"ogrenci_no": 20260143, "deney": "pwm", "sonuc": "Motor speed rose as the duty cycle rose.", "puan": "88", "etiketler": ["motor"]}',
  metin: 'Sure! Here is the summary you asked for:\n```json\n{"ogrenci_no": "20260143", "deney": "i2c", "sonuc": "The MPU6050 was found at address 0x68 and read.", "puan": 92, "etiketler": ["i2c", "sensor"]}\n```\nAnything else?',
  enum: '{"ogrenci_no": "2026014", "deney": "spi", "sonuc": "Worked.", "puan": 120, "etiketler": [], "not": "extra field"}',
  bozuk: '{"ogrenci_no": "20260143", "deney": "pid", "sonuc": "Overshoot fell", "puan": 75, "etiketler": ["pid",]}',
}
export const samplesFor = (lang: 'tr' | 'en'): Record<SampleId, string> => (lang === 'en' ? SAMPLES_EN : SAMPLES)
