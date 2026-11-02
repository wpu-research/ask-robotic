'use client'

import { useState } from 'react'
import { useT } from '@/i18n/client'
import { PartIcon } from '@/components/lab/part-art'
import { partName, partShortName } from '@/lib/lab/text'
import type { PartType } from '@/lib/lab/contract'

const GROUPS: { id: string; tr: string; en: string; desc: [string, string]; types: PartType[] }[] = [
  { id: 'boards', tr: 'Kontrol kartları', en: 'Controllers', desc: ['Robotunun beynini seç.', 'The brain that runs your robot.'], types: ['uno'] },
  { id: 'sensors', tr: 'Sensörler', en: 'Sensors', desc: ['Çevreni ölç, robotuna hissettir.', 'Measure the world and report back.'], types: ['hcsr04', 'sharpir', 'irobstacle', 'mpu6050', 'encoder'] },
  { id: 'actuators', tr: 'Motorlar', en: 'Actuators', desc: ['Hareket üret, dünyayla etkileş.', 'Create movement and interact.'], types: ['servo', 'dcmotor'] },
  { id: 'drivers', tr: 'Motor sürücüler', en: 'Motor drivers', desc: ['Kartınla motorların arasında köprü kur.', 'Connect your controller to its motors.'], types: ['l293d', 'l298n', 'drv8833', 'tb6612'] },
  { id: 'components', tr: 'Devre elemanları', en: 'Components', desc: ['Işık, ses ve giriş elemanları ekle.', 'Add lights, sound and inputs.'], types: ['led', 'resistor', 'button', 'pot', 'buzzer'] },
  { id: 'power', tr: 'Güç', en: 'Power', desc: ['Tasarımına enerji ver.', 'Power your design.'], types: ['battery'] },
]

export function RobotPartsLibrary({ types, disabled, onAdd, en }: { types: PartType[]; disabled: boolean; onAdd: (type: PartType) => void; en: boolean }) {
  const translate = useT()
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLocaleLowerCase(en ? 'en' : 'tr')
  const groups = GROUPS.map((group) => ({ ...group, types: group.types.filter((type) => types.includes(type)
    && `${partName(translate, type)} ${partShortName(translate, type)} ${type}`.toLocaleLowerCase(en ? 'en' : 'tr').includes(normalized)) })).filter((group) => group.types.length > 0)
  return (
    <div className="mj-library" data-testid="mujoco-parts-library">
      <label className="mj-library-search">
        <span className="sr-only">{en ? 'Search electronic parts' : 'Elektronik parça ara'}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={en ? 'Search parts…' : 'Parça ara…'} />
        <span aria-hidden="true">⌕</span>
      </label>
      <span className="mj-group-label">{en ? 'ELECTRONICS' : 'ELEKTRONİK'}</span>
      {groups.map((group) => (
        <details className={`mj-library-group ${group.id}`} key={group.id} open>
          <summary><i aria-hidden="true" /><b>{en ? group.en : group.tr}</b><span>{group.types.length}</span><span className="mj-library-chevron" aria-hidden="true">⌄</span></summary>
          <p>{group.desc[en ? 1 : 0]}</p>
          <div className="mj-library-items">
            {group.types.map((type) => {
              const name = partName(translate, type)
              const shortName = partShortName(translate, type)
              return (
                <button type="button" key={type} disabled={disabled} onClick={() => onAdd(type)} data-testid={`mujoco-library-${type}`} aria-label={`${en ? 'Add' : 'Ekle'}: ${name}`}>
                  <PartIcon type={type} size={28} />
                  <span><b>{shortName}</b><small>{shortName !== name ? name : en ? group.en : group.tr}</small></span>
                  <span className="mj-library-add" aria-hidden="true">+</span>
                </button>
              )
            })}
          </div>
        </details>
      ))}
      {groups.length === 0 && <p className="muted" role="status">{en ? 'No matching parts.' : 'Eşleşen parça bulunamadı.'}</p>}
    </div>
  )
}
