// FreeRTOS zamanlayıcısı (öncelikli, kesintili; eşit öncelikte tick ile zaman dilimleme) ve düşük güç kipleri. Görevler
// periyodik: her periyotta bir iş (wcet tick) gelir, son tarih bir sonraki periyottur. İsteğe bağlı paylaşılan kaynak
// (mutex) öncelik tersine dönmesini ve öncelik kalıtımını gösterir. Saf fonksiyonlar (rtos.test.ts).

export interface Task { name: string; prio: number; period: number; wcet: number; offset?: number; /** İşin hangi tick'lerinde (0'dan) mutex tutulur. */ lockTicks?: [number, number] }
export interface TickRec { t: number; run: string; ready: string[]; event?: string }
export interface SchedResult { timeline: TickRec[]; misses: Array<{ task: string; at: number }>; util: number; idlePct: number; switches: number; responseMax: Record<string, number> }

/** Toplam CPU kullanımı U = Σ C/T. */
export const utilization = (ts: Task[]) => ts.reduce((u, t) => u + t.wcet / t.period, 0)
/** Hız monoton (RM) yeterli koşulu: U ≤ n(2^(1/n) − 1). Geçemese de çizelgelenebilir olabilir (benzetim söyler). */
export const rmBound = (n: number) => n * (2 ** (1 / n) - 1)

interface Job { task: Task; left: number; done: number; release: number; deadline: number; eff: number }

export function schedule(tasks: Task[], horizon: number, opts: { timeSlice?: boolean; inheritance?: boolean } = {}): SchedResult {
  const slice = opts.timeSlice ?? true
  const jobs: Job[] = []
  const timeline: TickRec[] = []
  const misses: Array<{ task: string; at: number }> = []
  const responseMax: Record<string, number> = {}
  let last = '', switches = 0, idle = 0, holder: Job | null = null
  const rr: Record<number, number> = {}
  for (let t = 0; t < horizon; t++) {
    const events: string[] = []
    for (const tk of tasks) {
      const off = tk.offset ?? 0
      if (t >= off && (t - off) % tk.period === 0) {
        const old = jobs.find((j) => j.task === tk)
        if (old) { misses.push({ task: tk.name, at: t }); events.push(`${tk.name} MISS`); jobs.splice(jobs.indexOf(old), 1); if (holder === old) holder = null }
        jobs.push({ task: tk, left: tk.wcet, done: 0, release: t, deadline: t + tk.period, eff: tk.prio })
      }
    }
    // Kilit: bir iş kilit bölgesine girmek istiyor ve kilit başkasındaysa bloklanır
    const wantsLock = (j: Job) => !!j.task.lockTicks && j.done >= j.task.lockTicks[0] && j.done < j.task.lockTicks[1]
    for (const j of jobs) j.eff = j.task.prio
    if (opts.inheritance && holder) {
      const blocked = jobs.filter((j) => j !== holder && wantsLock(j))
      for (const b of blocked) holder.eff = Math.max(holder.eff, b.task.prio)
    }
    const runnable = jobs.filter((j) => !(holder && holder !== j && wantsLock(j)))
    const top = Math.max(-1, ...runnable.map((j) => j.eff))
    const cands = runnable.filter((j) => j.eff === top)
    let run: Job | undefined
    if (cands.length) {
      // Eşit öncelikte sıra: zaman dilimlemede her tick sıradakine geçilir
      const i = slice ? (rr[top] ?? 0) % cands.length : 0
      run = cands[i]
      if (slice) rr[top] = (rr[top] ?? 0) + 1
    }
    const name = run ? run.task.name : 'idle'
    if (name !== last && last !== '') switches++
    last = name
    if (run) {
      if (wantsLock(run) && !holder) { holder = run; events.push(`${run.task.name} LOCK`) }
      run.left--; run.done++
      if (holder === run && run.task.lockTicks && run.done >= run.task.lockTicks[1]) { holder = null; events.push(`${run.task.name} UNLOCK`) }
      if (run.left === 0) {
        jobs.splice(jobs.indexOf(run), 1)
        if (holder === run) holder = null
        const resp = t + 1 - run.release
        responseMax[run.task.name] = Math.max(responseMax[run.task.name] ?? 0, resp)
      }
    } else idle++
    timeline.push({ t, run: name, ready: jobs.filter((j) => j !== run).map((j) => j.task.name), event: events.join(' ') || undefined })
  }
  return { timeline, misses, util: utilization(tasks), idlePct: idle / horizon, switches, responseMax }
}

// ---------- Düşük güç ----------
export type PowerMode = 'run' | 'sleep' | 'stop' | 'standby'
/** Ders içi tipik akımlar (mA), STM32F4 sınıfı bir kart için; kesin değer veri sayfasından okunur. */
export const MODE_MA: Record<PowerMode, number> = { run: 20, sleep: 6, stop: 0.3, standby: 0.003 }
export const WAKE_US: Record<PowerMode, number> = { run: 0, sleep: 1, stop: 20, standby: 300 }
export const MODE_TEXT: Record<PowerMode, { tr: string; en: string; inst: string }> = {
  run: { tr: 'Çalışma: çekirdek ve saatler açık', en: 'Run: core and clocks on', inst: '—' },
  sleep: { tr: 'Uyku: çekirdek durur, çevre birimleri çalışır; herhangi bir kesme uyandırır', en: 'Sleep: core stops, peripherals run; any interrupt wakes it', inst: '__WFI()' },
  stop: { tr: 'Durdurma: saatler durur, RAM korunur; EXTI ya da RTC uyandırır, saat yeniden kurulmalı', en: 'Stop: clocks stop, RAM is kept; EXTI or RTC wakes it, clocks must be reconfigured', inst: 'HAL_PWR_EnterSTOPMode()' },
  standby: { tr: 'Bekleme: neredeyse her şey kapalı, RAM silinir; uyanış sıfırlama gibidir', en: 'Standby: almost everything off, RAM is lost; waking is like a reset', inst: 'HAL_PWR_EnterSTANDBYMode()' },
}
/** Görev döngüsü: her periyotta activeMs çalış, kalan sürede `mode`da bekle. Ortalama akım ve pil ömrü (saat). */
export function batteryLife(mAh: number, periodMs: number, activeMs: number, mode: PowerMode, wakeMs = WAKE_US[mode] / 1000) {
  const act = Math.min(periodMs, activeMs + wakeMs)
  const avg = (MODE_MA.run * act + MODE_MA[mode] * (periodMs - act)) / periodMs
  return { avgMa: avg, hours: mAh / avg, days: mAh / avg / 24 }
}
