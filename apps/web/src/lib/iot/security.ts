// IoT güvenliği: Mosquitto tarzı ACL dosyasının ayrıştırılması ve değerlendirilmesi (user / topic / pattern, %u ve %c
// yer tutucuları, deny önceliği) ve bir cihaz kurulumunun güvenlik denetimi (TLS, kimlik bilgisi, kimlik doğrulama). Saf mantık.
import { topicMatches, validFilter } from './mqtt'

export type Access = 'read' | 'write' | 'readwrite' | 'deny'
export interface AclRule { line: number; user: string | null; kind: 'topic' | 'pattern'; access: Access; filter: string }
export interface AclParse { rules: AclRule[]; errors: Array<{ line: number; msg: 'syntax' | 'filter' | 'access' }> }

/**
 * Biçim: "user <ad>" sonraki "topic" satırlarını o kullanıcıya bağlar; ilk "user"dan önceki "topic" satırları
 * kimliksiz (anonim) istemcilere aittir. "pattern" satırları herkese uygulanır; %u kullanıcı adı, %c istemci kimliğiyle değişir.
 * "topic [read|write|readwrite|deny] <süzgeç>": erişim yazılmazsa readwrite.
 */
export function parseAcl(text: string): AclParse {
  const rules: AclRule[] = [], errors: AclParse['errors'] = []
  let user: string | null = null
  text.split('\n').forEach((raw, i) => {
    const line = i + 1, s = raw.trim()
    if (!s || s.startsWith('#')) return
    const w = s.split(/\s+/)
    if (w[0] === 'user' && w.length === 2) { user = w[1]; return }
    if ((w[0] === 'topic' || w[0] === 'pattern') && (w.length === 2 || w.length === 3)) {
      const access = (w.length === 3 ? w[1] : 'readwrite') as Access
      const filter = w[w.length - 1]
      if (!['read', 'write', 'readwrite', 'deny'].includes(access)) { errors.push({ line, msg: 'access' }); return }
      if (!validFilter(filter.replace(/%[uc]/g, 'x'))) { errors.push({ line, msg: 'filter' }); return }
      rules.push({ line, user: w[0] === 'pattern' ? null : user ?? '', kind: w[0], access, filter })
      return
    }
    errors.push({ line, msg: 'syntax' })
  })
  return { rules, errors }
}

export interface AclDecision { allow: boolean; rule: AclRule | null }

/** Bir istemcinin bir konuda okuma/yazma izni. Hiç kural eşleşmezse reddedilir; eşleşen bir deny her izni ezer. */
export function aclCheck(rules: readonly AclRule[], user: string, clientId: string, topic: string, op: 'read' | 'write'): AclDecision {
  const mine = rules.filter((r) => (r.kind === 'pattern') || (r.user === user))
  const expand = (r: AclRule) => (r.kind === 'pattern' ? r.filter.replace(/%u/g, user).replace(/%c/g, clientId) : r.filter)
  const hits = mine.filter((r) => topicMatches(expand(r), topic))
  const deny = hits.find((r) => r.access === 'deny')
  if (deny) return { allow: false, rule: deny }
  const ok = hits.find((r) => r.access === 'readwrite' || r.access === op)
  return { allow: !!ok, rule: ok ?? null }
}

export interface Setup {
  tls: boolean
  verifyCert: boolean
  anonymous: boolean
  sharedPassword: boolean
  secretsInRepo: boolean
  acl: boolean
  signedOta: boolean
  debugPortOpen: boolean
}
export type Finding = keyof Setup
/** Bulgu ağırlıkları (risk puanı). Toplam 100: hepsi kötü = 100 risk. */
export const RISK: Record<Finding, number> = { tls: 20, verifyCert: 10, anonymous: 15, sharedPassword: 10, secretsInRepo: 15, acl: 10, signedOta: 15, debugPortOpen: 5 }
const GOOD: Setup = { tls: true, verifyCert: true, anonymous: false, sharedPassword: false, secretsInRepo: false, acl: true, signedOta: true, debugPortOpen: false }

/** Kurulumu denetler: iyi değerinden sapan her ayar bir bulgudur. verifyCert yalnız TLS açıkken anlamlıdır. */
export function audit(s: Setup): { risk: number; findings: Finding[] } {
  const findings = (Object.keys(GOOD) as Finding[]).filter((k) => s[k] !== GOOD[k] && !(k === 'verifyCert' && !s.tls))
  if (!s.tls && !findings.includes('verifyCert')) findings.push('verifyCert')
  return { risk: findings.reduce((a, k) => a + RISK[k], 0), findings }
}
