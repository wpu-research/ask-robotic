'use client'
// Yapay Zekâ Atölyesi — bütünleşik editör. Ders oynatıcıya bağlanacak bileşen budur:
//   <AiEditor activity={...} storageKey="..." onGoalsChange={...} />
// Etkinlik verilmezse `tool` ile serbest araç kipi açılır. Her şey tarayıcıda çalışır; ağ çağrısı yoktur.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useT } from '@/i18n/client'
import { defaultStateFor, clearAiState, evaluateAi, loadAiState, saveAiState, type AiActivity, type AiGoalResult, type AiTool, type ToolStates } from '@/lib/ai/activity'
import { AiEtkinlikBilesen } from './ai-etkinlik'
import { GoalsPanel } from './goals-panel'
import './ai.css'

export interface AiEditorProps {
  /** Verilirse ders etkinliği kipi: giriş metni, başlangıç durumu ve hedefler. */
  activity?: AiActivity
  /** Serbest kipte hangi araç (etkinlik verilmişse yok sayılır). */
  tool?: AiTool
  /** Durumun tarayıcıda saklanacağı anahtar (serbest atölye: 'free:<araç>'). */
  storageKey: string
  /** Hedef durumu her değiştiğinde (ve ilk denetimde) çağrılır. */
  onGoalsChange?: (results: AiGoalResult[], allPassed: boolean) => void
}

export function AiEditor({ activity, tool, storageKey, onGoalsChange }: AiEditorProps) {
  const t = useT()
  const locale = useLocale()
  // Ders etkinlikleri (hedefleri Türkçe metinler üzerinde hesaplanır) her zaman Türkçe içerikle çalışır; serbest atölye site diline uyar.
  const lang = activity ? 'tr' : locale
  const kind: AiTool = activity?.tool ?? tool ?? 'tokenizer'
  const makeInitial = useCallback((): ToolStates[AiTool] => (activity ? (activity.initial() as ToolStates[AiTool]) : (defaultStateFor(kind, lang) as ToolStates[AiTool])), [activity, kind, lang])
  const [state, setState] = useState<ToolStates[AiTool]>(makeInitial)
  const [loaded, setLoaded] = useState(false)
  const onGoalsRef = useRef(onGoalsChange); onGoalsRef.current = onGoalsChange

  // ---- kalıcılık (yalnız tarayıcıda; bozuk/boş kayıt güvenle yok sayılır) ----
  useEffect(() => {
    setLoaded(false)
    const saved = loadAiState(kind, storageKey, makeInitial() as never)
    setState((saved ?? makeInitial()) as ToolStates[AiTool])
    setLoaded(true)
  }, [kind, storageKey, makeInitial])
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => saveAiState(storageKey, state), 400)
    return () => clearTimeout(t)
  }, [state, storageKey, loaded])

  // ---- hedefler ----
  const evaluation = useMemo(() => (activity ? evaluateAi(activity, state) : null), [activity, state])
  useEffect(() => {
    if (evaluation && loaded) onGoalsRef.current?.(evaluation.results, evaluation.allPassed)
  }, [evaluation, loaded])

  const reset = () => { clearAiState(storageKey); setState(makeInitial()) }

  return (
    <div className="ai-root" data-nogoals={!activity}>
      <div className="ai-main">
        {activity && (
          <div className="ai-card">
            <h3>{activity.title}</h3>
            <p className="ai-intro">{activity.intro}</p>
          </div>
        )}
        <p className="ai-notice"><strong>{t('studios.ai.editor.localTitle')}</strong> {t('studios.ai.editor.localBody')}</p>
        <AiEtkinlikBilesen tool={kind} state={state as never} onChange={setState as never} locked={!!activity} lang={lang} />
        <div className="ai-topbar">
          <button type="button" className="ai-btn" onClick={reset}>{t('studios.ai.editor.reset')}</button>
        </div>
      </div>
      {evaluation && <aside className="ai-side"><GoalsPanel evaluation={evaluation} /></aside>}
    </div>
  )
}
