import { blockAabb, MAX_HALF, MIN_HALF, normalizeBlock, subtractBox, uniqueBlockId, type Aabb, type Block, type Govde } from './govde'

export type BooleanOperation = 'union' | 'subtract' | 'intersect'
export function canBoolean(first?: Block, second?: Block): boolean {
  return !!first && !!second && first.id !== second.id && [first, second].every((block) => !block.cut && block.shape === 'kutu' && Math.abs(block.yaw % 90) < 1e-6)
}

export function booleanBlocks(body: Govde, firstId: string, secondId: string, operation: BooleanOperation): { ok: true; body: Govde; selected: string | null } | { ok: false; reason: 'unsupported' | 'empty' | 'precision' } {
  const first = body.blocks.find((block) => block.id === firstId)
  const second = body.blocks.find((block) => block.id === secondId)
  if (!canBoolean(first, second)) return { ok: false, reason: 'unsupported' }
  const firstBox = blockAabb(first!)
  const secondBox = blockAabb(second!)
  let pieces: Aabb[]
  if (operation === 'subtract') pieces = subtractBox(firstBox, secondBox)
  else if (operation === 'union') pieces = [firstBox, ...subtractBox(secondBox, firstBox)]
  else {
    const intersection: Aabb = [Math.max(firstBox[0], secondBox[0]), Math.max(firstBox[1], secondBox[1]), Math.max(firstBox[2], secondBox[2]), Math.min(firstBox[3], secondBox[3]), Math.min(firstBox[4], secondBox[4]), Math.min(firstBox[5], secondBox[5])]
    pieces = [0, 1, 2].every((axis) => intersection[axis + 3] > intersection[axis]) ? [intersection] : []
  }
  const remaining = body.blocks.filter((block) => block.id !== firstId && block.id !== secondId)
  if (!pieces.length && !remaining.some((block) => !block.cut)) return { ok: false, reason: 'empty' }
  if (pieces.some((bounds) => [0, 1, 2].some((axis) => {
    const half = (bounds[axis + 3] - bounds[axis]) / 2
    const center = (bounds[axis] + bounds[axis + 3]) / 2
    return half < MIN_HALF - 1e-9 || half > MAX_HALF + 1e-9 || Math.abs(center) > 0.5
  }))) return { ok: false, reason: 'precision' }
  const added: Block[] = []
  for (const [index, bounds] of pieces.entries()) {
    const id = uniqueBlockId([...remaining, ...added].map((block) => block.id))
    added.push(normalizeBlock({ ...first!, id, name: `${operation}_${index + 1}`, yaw: 0, pos: [0, 1, 2].map((axis) => (bounds[axis] + bounds[axis + 3]) / 2) as Block['pos'], size: [0, 1, 2].map((axis) => (bounds[axis + 3] - bounds[axis]) / 2) as Block['size'] }))
  }
  return { ok: true, body: { ...body, blocks: [...remaining, ...added] }, selected: added[0]?.id ?? null }
}
