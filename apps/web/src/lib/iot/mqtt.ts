// Tarayıcıda MQTT: konu doğrulama ve joker eşleme (MQTT 3.1.1 §4.7), küçük bir broker (abonelik, kalıcı/retained mesaj,
// son vasiyet/LWT, temiz oturum) ve kayıplı bağlantıda QoS 0/1/2 el sıkışmalarının deterministik benzetimi. Saf mantık;
// ünite simülasyonları ve testler bunu kullanır. Gerçek ağ yok: "teslim" bir dizi olay olarak döner.
import { rng } from '@/lib/ml/core'

export type QoS = 0 | 1 | 2

/** Yayın konusu: boş değil, joker (+ #) ve NUL içermez, UTF-8 uzunluğu 65535 baytı geçmez. */
export function validTopic(t: string): boolean {
  return t.length > 0 && !/[+#\u0000]/.test(t) && new TextEncoder().encode(t).length <= 65535
}

/** Abonelik süzgeci: '+' bir seviyenin tamamı, '#' yalnız son seviye ve tek başına. */
export function validFilter(f: string): boolean {
  if (!f.length || f.includes('\u0000')) return false
  const lv = f.split('/')
  return lv.every((l, i) => (l.includes('#') ? l === '#' && i === lv.length - 1 : true) && (l.includes('+') ? l === '+' : true))
}

/** Süzgeç konuyla eşleşir mi? '$' ile başlayan konular ilk seviyedeki jokerle eşleşmez ($SYS gibi). */
export function topicMatches(filter: string, topic: string): boolean {
  if (!validFilter(filter) || !validTopic(topic)) return false
  if (topic.startsWith('$') && (filter.startsWith('+') || filter.startsWith('#'))) return false
  const f = filter.split('/'), t = topic.split('/')
  for (let i = 0; i < f.length; i++) {
    if (f[i] === '#') return true // '#' üst seviyeyi de kapsar: "a/#" "a" ile eşleşir
    if (i >= t.length) return false
    if (f[i] !== '+' && f[i] !== t[i]) return false
  }
  return f.length === t.length
}

export interface Will { topic: string; payload: string; qos: QoS; retain: boolean }
export interface Msg { topic: string; payload: string; qos: QoS; retain: boolean }
export interface Delivery { to: string; topic: string; payload: string; qos: QoS; retained: boolean }
interface Client { id: string; connected: boolean; clean: boolean; subs: Map<string, QoS>; will?: Will; queue: Delivery[] }

/**
 * Küçük broker. Bir mesajın birden çok aboneliğe uyması durumunda istemciye tek kopya, en yüksek QoS ile gider.
 * Teslim QoS'u = min(yayın QoS, abonelik QoS). Kalıcı mesaj: konu başına son mesaj saklanır; boş yük kalıcıyı siler.
 * Kalıcı olmayan oturumdaki (clean=false) bağlantısız istemciye QoS ≥ 1 mesajlar kuyruklanır, bağlanınca teslim edilir.
 */
export class Broker {
  readonly clients = new Map<string, Client>()
  readonly retained = new Map<string, Msg>()

  connect(id: string, opt: { clean?: boolean; will?: Will } = {}): Delivery[] {
    const old = this.clients.get(id)
    const clean = opt.clean ?? true
    if (old?.connected) this.drop(id, false) // aynı kimlikle ikinci bağlantı eskisini düşürür (vasiyeti tetikler)
    const c: Client = !clean && old && !old.clean ? { ...old, connected: true, will: opt.will } : { id, connected: true, clean, subs: new Map(), will: opt.will, queue: [] }
    this.clients.set(id, c)
    const q = c.queue
    c.queue = []
    return q
  }

  subscribe(id: string, filter: string, qos: QoS): Delivery[] {
    const c = this.clients.get(id)
    if (!c?.connected || !validFilter(filter)) return []
    c.subs.set(filter, qos)
    // Yeni abonelik: eşleşen kalıcı mesajlar hemen gelir (retained bayrağıyla)
    return [...this.retained.values()].filter((m) => topicMatches(filter, m.topic))
      .map((m) => ({ to: id, topic: m.topic, payload: m.payload, qos: Math.min(m.qos, qos) as QoS, retained: true }))
  }

  unsubscribe(id: string, filter: string): void { this.clients.get(id)?.subs.delete(filter) }

  publish(m: Msg): Delivery[] {
    if (!validTopic(m.topic)) return []
    if (m.retain) { if (m.payload === '') this.retained.delete(m.topic); else this.retained.set(m.topic, { ...m }) }
    const out: Delivery[] = []
    for (const c of this.clients.values()) {
      let best = -1
      for (const [f, q] of c.subs) if (topicMatches(f, m.topic)) best = Math.max(best, q)
      if (best < 0) continue
      const d: Delivery = { to: c.id, topic: m.topic, payload: m.payload, qos: Math.min(m.qos, best) as QoS, retained: false }
      if (c.connected) out.push(d)
      else if (!c.clean && d.qos > 0) c.queue.push(d)
    }
    return out
  }

  /** Bağlantı kopması. graceful (DISCONNECT paketi) ise vasiyet yayımlanmaz; değilse (zaman aşımı, kopma) yayımlanır. */
  drop(id: string, graceful: boolean): Delivery[] {
    const c = this.clients.get(id)
    if (!c?.connected) return []
    c.connected = false
    const will = c.will
    if (c.clean) this.clients.delete(id)
    return !graceful && will ? this.publish(will) : []
  }
}

/** Keepalive: broker, istemciden 1,5 × keepalive saniye boyunca paket görmezse bağlantıyı ölü sayar. */
export const deadAfter = (keepaliveS: number): number => keepaliveS * 1.5

export type Pkt = 'PUBLISH' | 'PUBACK' | 'PUBREC' | 'PUBREL' | 'PUBCOMP'
export interface TraceRow { msg: number; pkt: Pkt; dir: 'up' | 'down'; lost: boolean; dup: boolean }
export interface QosResult { sent: number; delivered: number; duplicates: number; lost: number; packets: number; trace: TraceRow[] }

/**
 * Kayıplı bağlantıda n mesajın QoS el sıkışması. Her paket `loss` olasılıkla kaybolur (tohumlu, tekrarlanabilir).
 * Gönderen yanıt gelmezse paketi DUP bayrağıyla yeniden yollar (en çok `retries` kez). QoS 1'de PUBACK kaybolursa alıcı
 * mesajı ikinci kez uygulamaya verir (yinelenen teslim); QoS 2'de alıcı paket kimliğini saklar, uygulamaya bir kez verir.
 */
export function simulateQos(qos: QoS, n: number, loss: number, seed = 7, retries = 8): QosResult {
  const r = rng(seed)
  const trace: TraceRow[] = []
  let delivered = 0, duplicates = 0, lost = 0, packets = 0
  const send = (msg: number, pkt: Pkt, dir: 'up' | 'down', dup = false) => {
    packets++
    const gone = r() < loss
    trace.push({ msg, pkt, dir, lost: gone, dup })
    return !gone
  }
  for (let m = 0; m < n; m++) {
    if (qos === 0) { if (send(m, 'PUBLISH', 'up')) delivered++; else lost++; continue }
    let got = 0, done = false
    for (let a = 0; a <= retries && !done; a++) {
      if (!send(m, 'PUBLISH', 'up', a > 0)) continue
      if (qos === 1) {
        got++ // alıcı her gelen PUBLISH'i uygulamaya verir
        if (send(m, 'PUBACK', 'down')) done = true
      } else {
        got = 1 // QoS 2: paket kimliği saklı, ikinci kopya uygulamaya verilmez
        if (!send(m, 'PUBREC', 'down')) continue
        // PUBREL/PUBCOMP de kaybolabilir; gönderen PUBREL'i yeniler (mesaj artık "teslim edildi" sayılır)
        let fin = false
        for (let b = 0; b <= retries && !fin; b++) if (send(m, 'PUBREL', 'up', b > 0) && send(m, 'PUBCOMP', 'down')) fin = true
        done = true
      }
    }
    if (got === 0) lost++
    else { delivered++; duplicates += got - 1 }
  }
  return { sent: n, delivered, duplicates, lost, packets, trace }
}
