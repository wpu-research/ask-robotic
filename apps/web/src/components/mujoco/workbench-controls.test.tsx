import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ToolButton, ViewCube } from './workbench-controls'
import { RobotPartsLibrary } from './robot-parts-library'
import { I18nProvider } from '@/i18n/client'

describe('Macademia workbench controls', () => {
  it('exposes the selected tool and its keyboard shortcut', () => {
    const markup = renderToStaticMarkup(<ToolButton icon="move" label="Taşı" shortcut="W" active onClick={() => {}} />)
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('<kbd>W</kbd>')
    expect(markup).toContain('Taşı')
    expect(markup).toContain('type="button"')
  })

  it('disables surface operations without a selection', () => {
    const markup = renderToStaticMarkup(<ToolButton icon="slice" label="Böl" disabled />)
    expect(markup).toContain('disabled=""')
    expect(markup).not.toContain('aria-pressed=')
  })

  it('provides top, front, right and perspective camera actions', () => {
    const markup = renderToStaticMarkup(<ViewCube view="ust" onView={() => {}} en={false} />)
    expect(markup.match(/<button /g)).toHaveLength(4)
    expect(markup).toContain('aria-label="Üst" aria-pressed="true"')
    expect(markup).toContain('aria-label="Ön"')
    expect(markup).toContain('aria-label="Sağ"')
    expect(markup).toContain('Perspektif')
  })

  it('localizes the camera controls', () => {
    const markup = renderToStaticMarkup(<ViewCube view="serbest" onView={() => {}} en />)
    expect(markup).toContain('aria-label="Camera view"')
    expect(markup).toContain('aria-label="Top"')
    expect(markup).toContain('Perspective')
  })

  it('lists only supported parts without duplicate catalog entries', () => {
    const markup = renderToStaticMarkup(<RobotPartsLibrary types={['uno', 'hcsr04', 'servo']} disabled={false} onAdd={() => {}} en={false} />)
    expect(markup.match(/data-testid="mujoco-library-/g)).toHaveLength(3)
    expect(markup).toContain('mujoco-library-uno')
    expect(markup).toContain('mujoco-library-hcsr04')
    expect(markup).not.toContain('mujoco-library-l298n')
  })

  it('locks part insertion while the circuit is running', () => {
    const markup = renderToStaticMarkup(<RobotPartsLibrary types={['uno', 'servo']} disabled onAdd={() => {}} en={false} />)
    expect(markup.match(/disabled=""/g)).toHaveLength(2)
  })

  it('translates the electronics library with the application locale', () => {
    const markup = renderToStaticMarkup(<I18nProvider locale="en"><RobotPartsLibrary types={['uno']} disabled={false} onAdd={() => {}} en /></I18nProvider>)
    expect(markup).toContain('Controllers')
    expect(markup).toContain('Search electronic parts')
    expect(markup).not.toContain('Kontrol kartları')
  })
})
