export type AssemblyType = 'servo' | 'platform' | 'uno' | 'esp32' | 'hcsr04'
export interface AssemblyNode {
  id: string
  type: AssemblyType
  parent: string | null
  pos: [number, number, number]
  yaw: number
  axis: 'x' | 'y' | 'z'
  limits: [number, number]
}

export const ASSEMBLY_PARTS: Record<AssemblyType, { tr: string; en: string; size: [number, number, number]; mountZ: number }> = {
  servo: { tr: 'Servo motor', en: 'Servo motor', size: [0.012, 0.006, 0.014], mountZ: 0.028 },
  platform: { tr: 'Montaj platformu', en: 'Mounting platform', size: [0.026, 0.018, 0.002], mountZ: 0.004 },
  uno: { tr: 'Arduino Uno', en: 'Arduino Uno', size: [0.034, 0.026, 0.004], mountZ: 0.008 },
  esp32: { tr: 'ESP32 · 3B model', en: 'ESP32 · 3D model', size: [0.026, 0.014, 0.004], mountZ: 0.008 },
  hcsr04: { tr: 'Ultrasonik sensör', en: 'Ultrasonic sensor', size: [0.022, 0.009, 0.01], mountZ: 0.02 },
}

export function isAssembly(value: unknown): value is AssemblyNode[] {
  if (!Array.isArray(value) || value.length > 24) return false
  const ids = new Set<string>()
  for (const node of value) {
    if (!node || typeof node !== 'object' || typeof node.id !== 'string' || !/^asm_[1-9][0-9]{0,5}$/.test(node.id) || ids.has(node.id)) return false
    if (!Object.hasOwn(ASSEMBLY_PARTS, node.type) || !['x', 'y', 'z'].includes(node.axis)) return false
    if (!Array.isArray(node.pos) || node.pos.length !== 3 || !node.pos.every((coordinate: unknown) => typeof coordinate === 'number' && Number.isFinite(coordinate) && Math.abs(coordinate) <= 1)) return false
    if (!Number.isFinite(node.yaw) || Math.abs(node.yaw) > 360) return false
    if (!Array.isArray(node.limits) || node.limits.length !== 2 || !node.limits.every((angle: unknown) => typeof angle === 'number' && Number.isFinite(angle) && Math.abs(angle) <= 180)) return false
    if (node.limits[0] > 0 || node.limits[1] < 0 || node.limits[1] - node.limits[0] < 1) return false
    if (node.parent !== null && typeof node.parent !== 'string') return false
    ids.add(node.id)
  }
  if (value.filter((node) => node.type === 'uno').length > 1) return false
  for (const node of value) {
    const seen = new Set([node.id])
    let parent = node.parent
    while (parent !== null) {
      if (!ids.has(parent) || seen.has(parent)) return false
      seen.add(parent)
      parent = value.find((candidate) => candidate.id === parent)!.parent
    }
  }
  return true
}

export function canMount(nodes: AssemblyNode[], id: string, parent: string | null): boolean {
  return isAssembly(nodes.map((node) => node.id === id ? { ...node, parent } : node))
}

export function addAssembly(nodes: AssemblyNode[], type: AssemblyType, parent: string | null = null, baseZ = 0.01): AssemblyNode[] {
  if (nodes.length >= 24 || (type === 'uno' && nodes.some((node) => node.type === 'uno'))) return nodes
  let index = 1
  while (nodes.some((node) => node.id === `asm_${index}`)) index++
  const node: AssemblyNode = { id: `asm_${index}`, type, parent, pos: parent ? [0, 0, 0] : [0.025, -0.02, baseZ], yaw: 0, axis: 'z', limits: [-90, 90] }
  if (type === 'uno' && !parent) node.pos = [-0.025, 0.015, baseZ]
  const next = [...nodes, node]
  return isAssembly(next) ? next : nodes
}

export function updateAssembly(nodes: AssemblyNode[], id: string, patch: Partial<Omit<AssemblyNode, 'id' | 'type'>>): AssemblyNode[] {
  const next = nodes.map((node) => node.id === id ? { ...node, ...patch } : node)
  return isAssembly(next) ? next : nodes
}

export function removeAssembly(nodes: AssemblyNode[], id: string): AssemblyNode[] {
  const removed = new Set([id])
  for (let index = 0; index < nodes.length; index++) {
    for (const node of nodes) if (node.parent && removed.has(node.parent)) removed.add(node.id)
  }
  return nodes.filter((node) => !removed.has(node.id))
}

export const assemblyActuator = (id: string) => `${id}_servo`
export const assemblyChannel = (id: string) => `${id}_distance`
