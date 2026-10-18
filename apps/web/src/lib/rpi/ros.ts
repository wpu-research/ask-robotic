// ROS 2 düğüm/konu grafiği (rqt_graph benzeri): hangi düğümler çalışıyor, hangi konuda kim yayınlıyor/abone,
// sorunlar (yayıncısız abonelik, /cmd_vel'de çoklu yayıncı). Kameralı keşif robotunun düğüm mimarisiyle aynı.

export type NodeId = 'camera' | 'detector' | 'teleop' | 'follower' | 'mux' | 'motor' | 'web'
export interface RosNode { id: NodeId; name: string; pubs: string[]; subs: string[]; hz?: Record<string, number> }

export const NODES: RosNode[] = [
  { id: 'camera', name: '/camera_node', pubs: ['/image_raw'], subs: [], hz: { '/image_raw': 30 } },
  { id: 'detector', name: '/ball_detector', pubs: ['/target'], subs: ['/image_raw'], hz: { '/target': 15 } },
  { id: 'follower', name: '/follower', pubs: ['/cmd_vel_auto'], subs: ['/target'], hz: { '/cmd_vel_auto': 15 } },
  { id: 'teleop', name: '/teleop', pubs: ['/cmd_vel_teleop'], subs: [], hz: { '/cmd_vel_teleop': 10 } },
  { id: 'web', name: '/web_panel', pubs: ['/cmd_vel_teleop'], subs: ['/odom'], hz: { '/cmd_vel_teleop': 5 } },
  { id: 'mux', name: '/twist_mux', pubs: ['/cmd_vel'], subs: ['/cmd_vel_auto', '/cmd_vel_teleop'], hz: { '/cmd_vel': 20 } },
  { id: 'motor', name: '/motor_driver', pubs: ['/odom'], subs: ['/cmd_vel'], hz: { '/odom': 50 } },
]

/** İsteğe bağlı: mux yoksa follower ve teleop doğrudan /cmd_vel'e yayınlar (tipik ilk hata). */
export function nodesFor(active: NodeId[]): RosNode[] {
  const mux = active.includes('mux')
  return NODES.filter((n) => active.includes(n.id)).map((n) => mux ? n : { ...n, pubs: n.pubs.map((t) => (t.startsWith('/cmd_vel_') ? '/cmd_vel' : t)), hz: Object.fromEntries(Object.entries(n.hz ?? {}).map(([t, h]) => [t.startsWith('/cmd_vel_') ? '/cmd_vel' : t, h])) })
}

export interface TopicInfo { name: string; pubs: string[]; subs: string[]; hz: number }
export interface Issue { kind: 'no-publisher' | 'multi-publisher' | 'no-subscriber'; topic: string }

export function graph(active: NodeId[]): { nodes: RosNode[]; topics: TopicInfo[]; issues: Issue[] } {
  const nodes = nodesFor(active)
  const map = new Map<string, TopicInfo>()
  const get = (t: string) => map.get(t) ?? (map.set(t, { name: t, pubs: [], subs: [], hz: 0 }), map.get(t)!)
  for (const n of nodes) {
    for (const t of n.pubs) { const ti = get(t); ti.pubs.push(n.name); ti.hz += n.hz?.[t] ?? 0 }
    for (const t of n.subs) get(t).subs.push(n.name)
  }
  const topics = [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  const issues: Issue[] = []
  for (const t of topics) {
    if (!t.pubs.length && t.subs.length) issues.push({ kind: 'no-publisher', topic: t.name })
    if (t.name === '/cmd_vel' && t.pubs.length > 1) issues.push({ kind: 'multi-publisher', topic: t.name })
    if (t.pubs.length && !t.subs.length) issues.push({ kind: 'no-subscriber', topic: t.name })
  }
  return { nodes, topics, issues }
}

/** `ros2 topic list` çıktısı (+ ROS 2'nin her zaman sunduğu iki konu). */
export const topicList = (active: NodeId[]) => [...new Set(['/parameter_events', '/rosout', ...graph(active).topics.map((t) => t.name)])].sort()
