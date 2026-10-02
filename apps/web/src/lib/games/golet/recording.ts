// Tekrar izleme için son maç kayıtları (tarayıcı belleğinde; en çok 6 kayıt).
import type { PondFrame } from './sim'

const store = new Map<number, PondFrame[]>()

export function saveRecording(id: number, frames: PondFrame[]): void {
  store.set(id, frames)
  while (store.size > 6) store.delete(store.keys().next().value as number)
}
export const getRecording = (id: number): PondFrame[] | undefined => store.get(id)
