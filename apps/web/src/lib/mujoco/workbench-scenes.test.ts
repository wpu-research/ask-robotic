import { describe, expect, it } from 'vitest'
import { MJ_SCENES, MJ_WORKBENCH_SCENES } from './scenes'
import { localizeScene } from './names-en'
import { DESIGN_SCENE_ID, designScene, emptyDesign } from './design-scene'

describe('MuRoKo tezgâh sahneleri', () => {
  it('hazır MuJoCo robotlarını Türkçe ve İngilizce seçimden çıkarır', () => {
    for (const scenes of [MJ_WORKBENCH_SCENES, MJ_WORKBENCH_SCENES.map(localizeScene)]) {
      expect(scenes.some((scene) => scene.kind === 'gercek')).toBe(false)
      expect(scenes.some((scene) => scene.pack)).toBe(false)
    }
  })

  it('model kataloğunu silmez, diğer sahne türlerini korur', () => {
    expect(MJ_SCENES.some((scene) => scene.kind === 'gercek')).toBe(true)
    expect(MJ_WORKBENCH_SCENES).toEqual(MJ_SCENES.filter((scene) => scene.kind !== 'gercek'))
  })

  it('hazır robotlar olmadan da boş tasarım geçerli bir başlangıç sahnesidir', () => {
    const scene = designScene(emptyDesign())
    expect(scene?.id).toBe(DESIGN_SCENE_ID)
    expect(scene?.kind).toBe('robot')
    expect(scene?.xml).toContain('<mujoco')
    expect(scene?.pack).toBeUndefined()
  })
})
