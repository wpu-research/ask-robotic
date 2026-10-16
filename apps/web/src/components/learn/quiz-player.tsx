'use client'
import { useMemo, useState } from 'react'
import type { QuizQuestion } from '@ask/db'
import { LessonMarkdown } from '@/app/ders/[id]/lesson-markdown'
import { useConsent } from '@/lib/consent'
import { logEvent } from '@/lib/events'
import { correctLabel, isCorrect, parseNumber } from '@/lib/quiz'
import { skillById } from '@/lib/skills'
import { Icon } from '../shell/icons'
import { InlineMd } from '../lesson-v2/inline-md'
import { useLocale } from '@/i18n/client'
import { SKILLS_EN } from '@/lib/skills-en'

const KIND: Record<QuizQuestion['kind'], string> = { mcq: 'Çoktan seçmeli', 'predict-output': 'Ne olur?', 'find-bug': 'Hatayı bul', numeric: 'Hesapla' }
const KIND_EN: Record<QuizQuestion['kind'], string> = { mcq: 'Multiple choice', 'predict-output': 'What happens?', 'find-bug': 'Find the bug', numeric: 'Calculate' }
const LETTER = ['A', 'B', 'C', 'D', 'E']

interface Given { value: number; ok: boolean }

/** Mini test oynatıcı: soru soru ilerler, her cevapta anında doğru/yanlış ve açıklama gösterir; sonda puan ve beceri özeti verir. */
export function QuizPlayer({ lessonId, questions }: { lessonId?: number; questions: QuizQuestion[] }) {
  const en = useLocale() === 'en'
  const skillName = (id: string) => (en ? SKILLS_EN[id]?.label : undefined) ?? skillById(id)?.label ?? id
  const consent = useConsent()
  const [idx, setIdx] = useState(0)
  const [given, setGiven] = useState<Record<string, Given>>({})
  const [text, setText] = useState('')
  const [bad, setBad] = useState(false)
  const [finished, setFinished] = useState(false)
  const q = questions[idx]
  const g = q ? given[q.id] : undefined
  const score = useMemo(() => questions.filter((x) => given[x.id]?.ok).length, [questions, given])

  function answer(value: number) {
    if (!q || given[q.id]) return
    const ok = isCorrect(q, value)
    setGiven((s) => ({ ...s, [q.id]: { value, ok } }))
    logEvent('quiz_answer', { lessonId, p: { q: q.id, ok, k: q.kind, sk: q.skills.join(',') } })
  }
  function submitNumber() {
    const n = parseNumber(text)
    if (n === null) { setBad(true); return }
    setBad(false)
    answer(n)
  }
  function next() {
    setText(''); setBad(false)
    if (idx + 1 < questions.length) setIdx(idx + 1)
    else {
      setFinished(true)
      logEvent('quiz_done', { lessonId, p: { score, total: questions.length } })
    }
  }
  function restart() { setIdx(0); setGiven({}); setText(''); setBad(false); setFinished(false) }

  if (!questions.length) return <p className="muted">{en ? 'This lesson has no mini quiz.' : 'Bu ders için mini test yok.'}</p>

  const consentNote = consent === undefined ? null : !consent || !consent.ack || consent.mode === 'denied'
    ? <p className="quiz-note">{en ? 'Results are not being saved right now. If you want to see your skill map on the My progress page, you can give consent in the banner below (draft/pilot).' : 'Sonuçlar şu an kaydedilmiyor. İlerlemem sayfasında beceri haritanı görmek istersen alttaki bandan onay verebilirsin (taslak/pilot).'}</p>
    : null

  if (finished) {
    const skills = [...new Set(questions.flatMap((x) => x.skills))]
    return (
      <section className="quiz quiz-result" aria-live="polite">
        <h2>{en ? 'Mini quiz finished' : 'Mini test bitti'}</h2>
        <p className="quiz-score"><b>{score}</b> / {questions.length} {en ? 'correct' : 'doğru'}</p>
        <p className="muted">{score === questions.length ? (en ? 'All correct. You can move on to the activity or the next step.' : 'Hepsi doğru. Etkinliğe ya da sonraki adıma geçebilirsin.') : (en ? 'Read the explanations of the questions you got wrong and try the quiz again.' : 'Yanlış yaptığın soruların açıklamalarını okuyup testi yeniden çözebilirsin.')}</p>
        <ul className="quiz-review">
          {questions.map((x, i) => (
            <li key={x.id} data-ok={given[x.id]?.ok ? 'true' : 'false'}>
              <span className="quiz-mark" aria-hidden="true">{given[x.id]?.ok ? <Icon name="check" size={14} /> : '×'}</span>
              <span className="sr-only">{given[x.id]?.ok ? (en ? 'Correct: ' : 'Doğru: ') : (en ? 'Wrong: ' : 'Yanlış: ')}</span>{en ? 'Question' : 'Soru'} {i + 1}
            </li>
          ))}
        </ul>
        <p className="quiz-skills"><b>{en ? 'Skills measured:' : 'Ölçülen beceriler:'}</b> {skills.map(skillName).join(', ')}</p>
        {consentNote}
        <button type="button" className="btn btn-ghost" onClick={restart}>{en ? 'Try the quiz again' : 'Testi yeniden çöz'}</button>
      </section>
    )
  }

  return (
    <section className="quiz" aria-labelledby="quiz-baslik">
      <div className="quiz-head">
        <h2 id="quiz-baslik">{en ? 'Mini quiz' : 'Mini test'}</h2>
        <span className="quiz-count">{en ? 'Question' : 'Soru'} {idx + 1} / {questions.length}</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={Object.keys(given).length} aria-label={en ? 'Quiz progress' : 'Test ilerlemesi'}><div className="progress-fill" style={{ width: `${(Object.keys(given).length / questions.length) * 100}%` }} /></div>
      <div className="quiz-q">
        <span className="chip">{(en ? KIND_EN : KIND)[q.kind]}</span>
        <div className="quiz-prompt"><LessonMarkdown>{q.prompt}</LessonMarkdown></div>

        {q.kind === 'numeric' ? (
          <form className="quiz-num" onSubmit={(e) => { e.preventDefault(); submitNumber() }}>
            <label htmlFor={`qn-${q.id}`} className="sr-only">{en ? 'Your answer' : 'Cevabın'}</label>
            <input id={`qn-${q.id}`} className="quiz-input" inputMode="decimal" autoComplete="off" value={g ? (en ? String(g.value) : String(g.value).replace('.', ',')) : text} disabled={!!g}
              onChange={(e) => { setText(e.target.value); setBad(false) }} aria-invalid={bad} aria-describedby={bad ? `qe-${q.id}` : undefined} placeholder={en ? 'Type the number' : 'Sayıyı yaz'} />
            {q.unit && <span className="quiz-unit">{q.unit}</span>}
            <button type="submit" className="btn btn-primary" disabled={!!g || !text.trim()}>{en ? 'Check' : 'Kontrol et'}</button>
            {bad && <p id={`qe-${q.id}`} role="alert" className="error">{en ? 'Type a number (for example 4.5).' : 'Bir sayı yaz (örneğin 4,5).'}</p>}
          </form>
        ) : (
          <ul className="quiz-options" role="group" aria-label={en ? 'Options' : 'Seçenekler'}>
            {q.options?.map((o, i) => {
              const state = !g ? undefined : i === q.answer ? 'correct' : i === g.value ? 'wrong' : 'idle'
              return (
                <li key={o}>
                  <button type="button" className="quiz-opt" data-state={state} disabled={!!g} onClick={() => answer(i)}>
                    <span className="quiz-letter" aria-hidden="true">{LETTER[i]}</span><span><InlineMd text={o} /></span>
                    {state === 'correct' && <span className="sr-only"> {en ? '(correct answer)' : '(doğru cevap)'}</span>}
                    {state === 'wrong' && <span className="sr-only"> {en ? '(your answer, wrong)' : '(senin cevabın, yanlış)'}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div aria-live="polite">
          {g && (
            <div className="quiz-feedback" data-ok={g.ok ? 'true' : 'false'}>
              <b>{g.ok ? (en ? 'Correct!' : 'Doğru!') : (en ? 'Wrong.' : 'Yanlış.')}</b>{!g.ok && <> {en ? 'Correct answer:' : 'Doğru cevap:'} <b><InlineMd text={en ? correctLabel(q).replace(/(\d),(\d)/g, '$1.$2') : correctLabel(q)} /></b>.</>}
              <p><InlineMd text={q.explanation} /></p>
            </div>
          )}
        </div>
      </div>
      <div className="quiz-nav">
        <span className="muted">{q.skills.map(skillName).join(' · ')}</span>
        <button type="button" className="btn btn-primary" disabled={!g} onClick={next}>{idx + 1 < questions.length ? (en ? 'Next question' : 'Sonraki soru') : (en ? 'See the result' : 'Sonucu gör')}<Icon name="arrowRight" size={18} /></button>
      </div>
    </section>
  )
}
