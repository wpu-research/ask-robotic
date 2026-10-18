'use client'
// Sensör verisinden ML dersinin tarayıcı simülasyonları. Veri lib/sensor-ml/sensors.ts üretecinden gelir (aynı tohum =
// /veri/ml/sera-sensorleri.csv ile aynı seri); temizleme, özellik, model, kod üretimi ve anomali mantığı lib/sensor-ml'de (testli).
import { useMemo, useState } from 'react'
import { Bars, Body, Btn, Check, LineChart, Readout, Select, SimFrame, Slider, color, nf, type Lang } from '@/components/kurs/ui'
import { ALARM_DEFAULTS, alarm, evaluate, pipeline } from '@/lib/sensor-ml/anomaly'
import { dropMask, ema, ffill, hampel, interpLinear, iqrOutliers, kalman1d, medianFilter, movingAvg, rmseValid, steadyGain, zscoreOutliers } from '@/lib/sensor-ml/clean'
import { IN_SCALE, cost, fitsInt32, linearC, linearFixedC, predictFixed, quantize, stumpC, worstAcc } from '@/lib/sensor-ml/codegen'
import { FEAT_DEFAULTS, buildTable, type FeatOpts } from '@/lib/sensor-ml/features'
import { clsScore, fitLinear, fitStump, mae, pick, predictLinear, predictStump, r2, randomSplit, rmse, timeSplit, walkForward, type Split } from '@/lib/sensor-ml/model'
import { FAULT_WINDOW, SENSOR_DEFAULTS, seriesCsv, simulate, type Series } from '@/lib/sensor-ml/sensors'
import { corrMatrix, dailyProfile, histogram, pearson, welfordOf, welfordVar } from '@/lib/sensor-ml/stats'
import { SENSOR_SIM_META, type SensorSimId } from './sim-meta'

type P = { lang: Lang }
const DEFAULT = simulate()
const isSpike = (v: number) => v > 60 || v < -20
const cleanTemp = (s: Series) => interpLinear(dropMask(s.temp, hampel(s.temp, 3, 4)))
const faultBand = (s: Series, x: (i: number) => number) => {
  const a = s.fault.indexOf(1), b = s.fault.lastIndexOf(1)
  return a < 0 ? [] : [{ x0: x(a), x1: x(b), color: 'var(--red)' }]
}
const days = (s: Series) => s.t.map((t) => t / 1440)
const pct = (lang: Lang, v: number) => (lang === 'en' ? `${Math.round(v * 100)}%` : `%${Math.round(v * 100)}`)

// --- 1. Kaydedici -----------------------------------------------------------------------------------------------------------

function LoggerSim({ lang }: P) {
  const en = lang === 'en'
  const [seed, setSeed] = useState(SENSOR_DEFAULTS.seed)
  const [stepMin, setStepMin] = useState(SENSOR_DEFAULTS.stepMin)
  const [noise, setNoise] = useState(1)
  const [missing, setMissing] = useState(SENSOR_DEFAULTS.missing)
  const [spikes, setSpikes] = useState(SENSOR_DEFAULTS.spikes)
  const [nDays, setNDays] = useState(7)
  const [fault, setFault] = useState(true)
  const s = useMemo(() => simulate({ seed, stepMin, noise, missing, spikes, days: nDays, fault }), [seed, stepMin, noise, missing, spikes, nDays, fault])
  const x = days(s)
  const nNaN = s.temp.filter(Number.isNaN).length, nSp = s.temp.filter(isSpike).length
  const download = () => {
    const url = URL.createObjectURL(new Blob([seriesCsv(s)], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = `sera-${seed}-${stepMin}dk.csv`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <Body
      stage={
        <>
          <LineChart title={en ? 'DHT22 temperature (raw, spikes clipped at the chart edge), fault window shaded' : 'DHT22 sıcaklık (ham, sıçramalar grafik kenarında kesilir), arıza penceresi gölgeli'} xLabel={en ? 'day' : 'gün'} yLabel="°C" yRange={[8, 34]} h={220}
            series={[{ x, y: s.temp, color: 'var(--red)', width: 1.2, label: en ? 'temp' : 'sıcaklık' }]} bands={faultBand(s, (i) => x[i])}
            marks={s.temp.flatMap((v, i) => (isSpike(v) ? [{ x: x[i], y: v > 0 ? 34 : 8, color: 'var(--gold)' }] : []))} />
          <LineChart title={en ? 'Humidity and light' : 'Nem ve ışık'} xLabel={en ? 'day' : 'gün'} h={180}
            series={[{ x, y: s.hum, color: 'var(--sky)', width: 1.2, label: en ? 'humidity %' : 'nem %' }, { x, y: s.light.map((v) => v / 10.23), color: 'var(--gold)', width: 1, label: en ? 'light (0–100)' : 'ışık (0–100)' }]} />
          <div className="ks-scroll">
            <table className="ks-table"><thead><tr>{['dakika', 'saat', 'sicaklik', 'nem', 'basinc', 'isik', 'mesafe', 'ariza'].map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{s.t.slice(0, 5).map((t, i) => <tr key={t}>{[t, s.hour[i], s.temp[i], s.hum[i], s.press[i], s.light[i], s.dist[i], s.fault[i]].map((v, k) => <td key={k}>{Number.isNaN(v) ? 'NaN' : v}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <Readout testid="sml-log-sum">{en
            ? `${s.t.length} rows · ${nNaN} failed reads (NaN) · ${nSp} spikes (85 / −40 °C) · ${s.fault.filter(Boolean).length} samples in the fault window`
            : `${s.t.length} satır · ${nNaN} okunamayan (NaN) · ${nSp} sıçrama (85 / −40 °C) · arıza penceresinde ${s.fault.filter(Boolean).length} örnek`}{seed === 42 && stepMin === 10 && noise === 1 && missing === SENSOR_DEFAULTS.missing && spikes === SENSOR_DEFAULTS.spikes && nDays === 7 && fault ? (en ? '\nThese settings give exactly sera-sensorleri.csv.' : '\nBu ayarlar tam olarak sera-sensorleri.csv\'yi verir.') : ''}</Readout>
        </>
      }
      side={
        <>
          <Slider label={en ? 'Seed' : 'Tohum'} min={1} max={99} step={1} value={seed} onChange={setSeed} />
          <Select label={en ? 'Sampling interval' : 'Örnekleme aralığı'} value={String(stepMin)} options={[1, 5, 10, 30, 60].map((v) => [String(v), en ? `${v} min` : `${v} dk`])} onChange={(v) => setStepMin(Number(v))} />
          <Slider label={en ? 'Days' : 'Gün'} min={1} max={7} step={1} value={nDays} onChange={setNDays} />
          <Slider label={en ? 'Noise ×' : 'Gürültü ×'} min={0} max={4} step={0.25} value={noise} onChange={setNoise} fmt={nf(lang, 2)} />
          <Slider label={en ? 'Failed reads' : 'Okunamayan örnek'} min={0} max={0.2} step={0.01} value={missing} onChange={setMissing} fmt={(v) => pct(lang, v)} />
          <Slider label={en ? 'Spikes' : 'Sıçrama'} min={0} max={0.05} step={0.002} value={spikes} onChange={setSpikes} fmt={(v) => `${nf(lang, 1)(v * 100)}${en ? '%' : ''}`.replace(/^(.*)$/, en ? '$1' : '%$1')} />
          <Check label={en ? 'Heater fault on day 5' : '5. günde ısıtıcı arızası'} value={fault} onChange={setFault} />
          <Btn onClick={download} testid="sml-log-csv">{en ? 'Download CSV' : 'CSV indir'}</Btn>
        </>
      }
    />
  )
}

// --- 2. Temizleme -----------------------------------------------------------------------------------------------------------

type OutM = 'none' | 'z' | 'iqr' | 'hampel'
type FillM = 'none' | 'ffill' | 'interp'
type SmoothM = 'none' | 'ma' | 'median' | 'ema'

function CleanSim({ lang }: P) {
  const en = lang === 'en'
  const s = DEFAULT
  const [out, setOut] = useState<OutM>('hampel')
  const [k, setK] = useState(4)
  const [fill, setFill] = useState<FillM>('interp')
  const [smooth, setSmooth] = useState<SmoothM>('none')
  const [w, setW] = useState(5)
  const [alpha, setAlpha] = useState(0.3)
  const [day, setDay] = useState(2)
  const r = useMemo(() => {
    const mask = out === 'z' ? zscoreOutliers(s.temp, k) : out === 'iqr' ? iqrOutliers(s.temp, k / 2) : out === 'hampel' ? hampel(s.temp, 3, k) : s.temp.map(() => false)
    const a = dropMask(s.temp, mask)
    const b = fill === 'ffill' ? ffill(a) : fill === 'interp' ? interpLinear(a) : a
    const c = smooth === 'ma' ? movingAvg(b, w) : smooth === 'median' ? medianFilter(b, w) : smooth === 'ema' ? ema(b, alpha) : b
    const spikes = s.temp.map(isSpike)
    return { mask, b, c, flagged: mask.filter(Boolean).length, caught: mask.filter((m, i) => m && spikes[i]).length, nSp: spikes.filter(Boolean).length, gaps: c.filter((v) => !Number.isFinite(v)).length }
  }, [out, k, fill, smooth, w, alpha, s])
  const per = 144, from = (day - 1) * per, to = from + per
  const x = s.t.slice(from, to).map((t) => (t / 60) % 24)
  const raw = s.temp.slice(from, to)
  const rm = (y: readonly number[]) => nf(lang, 3)(rmseValid(y, s.trueTemp))
  return (
    <Body
      stage={
        <>
          <LineChart title={en ? `Day ${day}: raw (grey), cleaned (colour), truth (dashed); circles are flagged outliers` : `${day}. gün: ham (gri), temiz (renkli), gerçek (kesikli); halkalar işaretlenen aykırı değerler`} xLabel={en ? 'hour' : 'saat'} yLabel="°C" yRange={[10, 32]} h={250}
            series={[
              { x, y: raw, color: 'var(--mute)', width: 1, label: en ? 'raw' : 'ham' },
              { x, y: s.trueTemp.slice(from, to), color: 'var(--ink)', dash: '4 3', width: 1, label: en ? 'truth' : 'gerçek' },
              { x, y: r.c.slice(from, to), color: 'var(--sim-a)', width: 2, label: en ? 'cleaned' : 'temiz' },
            ]}
            marks={r.mask.slice(from, to).flatMap((m, i) => (m ? [{ x: x[i], y: Math.max(10, Math.min(32, raw[i])), color: 'var(--red)' }] : []))}
            bands={day === FAULT_WINDOW.day + 1 ? [{ x0: FAULT_WINDOW.from, x1: FAULT_WINDOW.to, color: 'var(--red)' }] : []} />
          <Readout testid="sml-clean-sum">{en
            ? `Flagged ${r.flagged} points, ${r.caught}/${r.nSp} real spikes caught · gaps left ${r.gaps}\nRMSE vs truth (7 days): after fill ${rm(r.b)} °C · after smoothing ${rm(r.c)} °C`
            : `${r.flagged} nokta işaretlendi, gerçek ${r.nSp} sıçramanın ${r.caught} tanesi yakalandı · kalan boşluk ${r.gaps}\nGerçeğe göre RMSE (7 gün): doldurmadan sonra ${rm(r.b)} °C · yumuşatmadan sonra ${rm(r.c)} °C`}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? '1. Outliers' : '1. Aykırı değer'} value={out} options={[['none', en ? 'none' : 'yok'], ['z', 'z-score'], ['iqr', 'IQR (Tukey)'], ['hampel', 'Hampel (MAD)']]} onChange={setOut} />
          <Slider label={out === 'iqr' ? (en ? 'IQR multiplier' : 'IQR çarpanı') : (en ? 'Threshold k (σ)' : 'Eşik k (σ)')} min={1} max={6} step={0.5} value={k} onChange={setK} fmt={(v) => nf(lang, 1)(out === 'iqr' ? v / 2 : v)} />
          <Select label={en ? '2. Missing values' : '2. Eksik değer'} value={fill} options={[['none', en ? 'leave NaN' : 'NaN kalsın'], ['ffill', en ? 'forward fill' : 'ileri doldur'], ['interp', en ? 'linear interpolation' : 'doğrusal ara değer']]} onChange={setFill} />
          <Select label={en ? '3. Smoothing (causal)' : '3. Yumuşatma (nedensel)'} value={smooth} options={[['none', en ? 'none' : 'yok'], ['ma', en ? 'moving average' : 'hareketli ortalama'], ['median', en ? 'median filter' : 'medyan süzgeci'], ['ema', en ? 'exponential (EMA)' : 'üstel (EMA)']]} onChange={setSmooth} />
          {smooth === 'ema' ? <Slider label="α" min={0.05} max={1} step={0.05} value={alpha} onChange={setAlpha} fmt={nf(lang, 2)} />
            : <Slider label={en ? 'Window' : 'Pencere'} min={2} max={15} step={1} value={w} onChange={setW} fmt={(v) => (en ? `${v} samples` : `${v} örnek`)} />}
          <Slider label={en ? 'Day shown' : 'Gösterilen gün'} min={1} max={7} step={1} value={day} onChange={setDay} />
        </>
      }
    />
  )
}

// --- 3. Kalman --------------------------------------------------------------------------------------------------------------

function KalmanSim({ lang }: P) {
  const en = lang === 'en'
  const [lq, setLq] = useState(-1.7)
  const [lr, setLr] = useState(-1.2)
  const [noise, setNoise] = useState(2)
  const q = 10 ** lq, r = 10 ** lr
  const s = useMemo(() => simulate({ noise, spikes: 0, missing: 0.03, days: 2 }), [noise])
  const kf = useMemo(() => kalman1d(s.temp, q, r), [s, q, r])
  const K = steadyGain(q, r)
  const e = useMemo(() => ema(s.temp, K), [s, K])
  const x = s.t.map((t) => t / 60)
  return (
    <Body
      stage={
        <>
          <LineChart title={en ? 'Measurement (grey), Kalman estimate, truth (dashed)' : 'Ölçüm (gri), Kalman kestirimi, gerçek (kesikli)'} xLabel={en ? 'hour' : 'saat'} yLabel="°C" h={240}
            series={[
              { x, y: s.temp, color: 'var(--mute)', width: 1, label: en ? 'measured' : 'ölçülen' },
              { x, y: s.trueTemp, color: 'var(--ink)', dash: '4 3', width: 1, label: en ? 'truth' : 'gerçek' },
              { x, y: kf.est, color: 'var(--sim-a)', width: 2, label: 'Kalman' },
            ]} />
          <LineChart title={en ? 'Kalman gain K over the first 60 samples' : 'İlk 60 örnekte Kalman kazancı K'} h={140} yRange={[0, 1]}
            series={[{ y: kf.gain.slice(0, 60), color: 'var(--gold)', label: 'K' }]} hlines={[{ y: K, color: 'var(--sim-a)', label: 'K∞' }]} />
          <Readout testid="sml-kalman-sum">{en
            ? `K∞ = ${nf(lang, 3)(K)} (EMA α with the same value)\nRMSE vs truth: raw ${nf(lang, 3)(rmseValid(s.temp, s.trueTemp))} · Kalman ${nf(lang, 3)(rmseValid(kf.est, s.trueTemp))} · EMA(α = K∞) ${nf(lang, 3)(rmseValid(e, s.trueTemp))} °C`
            : `K∞ = ${nf(lang, 3)(K)} (aynı değerli EMA α'sı)\nGerçeğe göre RMSE: ham ${nf(lang, 3)(rmseValid(s.temp, s.trueTemp))} · Kalman ${nf(lang, 3)(rmseValid(kf.est, s.trueTemp))} · EMA(α = K∞) ${nf(lang, 3)(rmseValid(e, s.trueTemp))} °C`}</Readout>
        </>
      }
      side={
        <>
          <Slider label={en ? 'Process noise Q' : 'Süreç gürültüsü Q'} min={-4} max={0} step={0.1} value={lq} onChange={setLq} fmt={() => q.toExponential(1)} />
          <Slider label={en ? 'Measurement noise R' : 'Ölçüm gürültüsü R'} min={-3} max={1} step={0.1} value={lr} onChange={setLr} fmt={() => r.toExponential(1)} />
          <Slider label={en ? 'Sensor noise ×' : 'Sensör gürültüsü ×'} min={0.5} max={6} step={0.5} value={noise} onChange={setNoise} fmt={nf(lang, 1)} />
          <Readout>{en ? `Sensor σ ≈ ${nf(lang, 2)(0.25 * noise)} °C → a matching R is σ² ≈ ${nf(lang, 3)((0.25 * noise) ** 2)}` : `Sensör σ ≈ ${nf(lang, 2)(0.25 * noise)} °C → uygun R = σ² ≈ ${nf(lang, 3)((0.25 * noise) ** 2)}`}</Readout>
        </>
      }
    />
  )
}

// --- 4. Analiz panosu -------------------------------------------------------------------------------------------------------

type VarK = 'temp' | 'hum' | 'press' | 'light' | 'dist'
const VARS: Record<VarK, { tr: string; en: string; unit: string }> = {
  temp: { tr: 'sıcaklık', en: 'temperature', unit: '°C' }, hum: { tr: 'nem', en: 'humidity', unit: '%' }, press: { tr: 'basınç', en: 'pressure', unit: 'hPa' },
  light: { tr: 'ışık', en: 'light', unit: 'ADC' }, dist: { tr: 'su mesafesi', en: 'water distance', unit: 'cm' },
}

function AnalysisSim({ lang }: P) {
  const en = lang === 'en'
  const [v, setV] = useState<VarK>('temp')
  const [bins, setBins] = useState(20)
  const cols = useMemo(() => ({ temp: cleanTemp(DEFAULT), hum: interpLinear(DEFAULT.hum), press: DEFAULT.press, light: DEFAULT.light, dist: DEFAULT.dist }), [])
  const y = cols[v]
  const h = histogram(y, bins)
  const prof = dailyProfile(DEFAULT.hour, y)
  const keys = Object.keys(VARS) as VarK[]
  const C = corrMatrix(keys.map((k) => cols[k]))
  const wf = welfordOf(y)
  const heat = (r: number) => (r >= 0 ? `color-mix(in srgb, var(--sim-a) ${Math.round(Math.abs(r) * 100)}%, var(--sim-bg))` : `color-mix(in srgb, var(--red) ${Math.round(Math.abs(r) * 100)}%, var(--sim-bg))`)
  const d = v === 'press' ? 2 : 1
  return (
    <Body
      stage={
        <>
          <LineChart title={`${VARS[v][lang]} (${VARS[v].unit}), ${en ? '7 days, cleaned' : '7 gün, temiz'}`} xLabel={en ? 'day' : 'gün'} h={180} series={[{ x: days(DEFAULT), y, color: 'var(--sim-a)', width: 1.2 }]} bands={faultBand(DEFAULT, (i) => DEFAULT.t[i] / 1440)} />
          <div className="rb-two" style={{ gap: 10 }}>
            <Bars title={en ? 'Daily profile (mean by hour)' : 'Günlük profil (saate göre ortalama)'} values={prof.map((p) => p - Math.min(...prof) + (Math.max(...prof) - Math.min(...prof)) * 0.05)} labels={prof.map((_, i) => String(i))} h={170} yLabel={en ? 'hour 0–23' : 'saat 0–23'} />
            <Bars title={en ? 'Histogram' : 'Histogram'} values={h.counts} labels={h.edges.slice(0, -1).map((e) => String(Math.round(e)))} colors={h.counts.map(() => 'var(--gold)')} h={170} yLabel={en ? 'count' : 'adet'} />
          </div>
          <div className="ks-scroll">
            <table className="ks-table ks-heat" data-testid="sml-corr">
              <thead><tr><th>r</th>{keys.map((k) => <th key={k}>{VARS[k][lang]}</th>)}</tr></thead>
              <tbody>{keys.map((a, i) => <tr key={a}><th style={{ textAlign: 'left' }}>{VARS[a][lang]}</th>{keys.map((b, j) => <td key={b} style={{ background: heat(C[i][j]), color: Math.abs(C[i][j]) > 0.5 ? '#fff' : 'var(--ink)' }}>{nf(lang, 2)(C[i][j])}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </>
      }
      side={
        <>
          <Select label={en ? 'Variable' : 'Değişken'} value={v} options={keys.map((k) => [k, VARS[k][lang]])} onChange={setV} />
          <Slider label={en ? 'Histogram bins' : 'Histogram kovası'} min={5} max={40} step={1} value={bins} onChange={setBins} />
          <Readout testid="sml-welford">{`Welford (${en ? 'on device, O(1) memory' : 'cihazda, O(1) bellek'})\nn = ${wf.n}\n${en ? 'mean' : 'ortalama'} = ${nf(lang, d)(wf.mean)} ${VARS[v].unit}\nσ = ${nf(lang, d + 1)(Math.sqrt(welfordVar(wf)))}\nmin = ${nf(lang, d)(wf.min)} · max = ${nf(lang, d)(wf.max)}`}</Readout>
          <Readout>{en ? `Temperature vs humidity r = ${nf(lang, 2)(pearson(cols.temp, cols.hum))}: correlation is not causation, both follow the sun.` : `Sıcaklık ile nem r = ${nf(lang, 2)(pearson(cols.temp, cols.hum))}: korelasyon nedensellik değildir, ikisi de güneşi izler.`}</Readout>
        </>
      }
    />
  )
}

// --- 5. Özellik tablosu -----------------------------------------------------------------------------------------------------

const LAGS = [1, 2, 3, 6, 12]
function FeatureSim({ lang }: P) {
  const en = lang === 'en'
  const [lags, setLags] = useState<number[]>(FEAT_DEFAULTS.lags)
  const [roll, setRoll] = useState(FEAT_DEFAULTS.roll)
  const [hour, setHour] = useState(true)
  const [light, setLight] = useState(true)
  const [horizon, setHorizon] = useState(FEAT_DEFAULTS.horizon)
  const [leak, setLeak] = useState(false)
  const clean = useMemo(() => cleanTemp(DEFAULT), [])
  const o: FeatOpts = { lags, roll, hour, light, horizon, leak }
  const tab = useMemo(() => buildTable(clean, DEFAULT.hour, DEFAULT.light, o), [clean, lags, roll, hour, light, horizon, leak]) // eslint-disable-line react-hooks/exhaustive-deps
  const corr = tab.names.map((_, j) => pearson(tab.X.map((r) => r[j]), tab.y))
  const sp = timeSplit(tab.X.length, 0.25, horizon)
  const m = fitLinear(pick(tab.X, sp.train), pick(tab.y, sp.train), 1)
  const pr = pick(tab.X, sp.test).map((xx) => predictLinear(m, xx))
  const e = rmse(pick(tab.y, sp.test), pr), base = rmse(pick(tab.y, sp.test), pick(tab.now, sp.test))
  return (
    <Body
      stage={
        <>
          <Bars title={en ? 'Correlation of each feature with the target (|r|)' : 'Her özelliğin hedefle korelasyonu (|r|)'} values={corr.map(Math.abs)} labels={tab.names.map((n) => n.replace('temp_', ''))} colors={tab.names.map((n) => (n === 'temp_center' ? 'var(--red)' : 'var(--sim-a)'))} h={180} />
          <div className="ks-scroll">
            <table className="ks-table" data-testid="sml-feat-table">
              <thead><tr><th>t</th>{tab.names.map((n) => <th key={n}>{n}</th>)}<th>y (t+{horizon})</th></tr></thead>
              <tbody>{tab.X.slice(0, 5).map((r, i) => <tr key={i}><td>{tab.idx[i]}</td>{r.map((v, j) => <td key={j}>{nf(lang, 2)(v)}</td>)}<td><b>{nf(lang, 2)(tab.y[i])}</b></td></tr>)}</tbody>
            </table>
          </div>
          <Readout testid="sml-feat-sum">{en
            ? `${tab.X.length} rows × ${tab.names.length} features (rows with NaN dropped) · time-split test RMSE ${nf(lang, 3)(e)} °C, "no change" baseline ${nf(lang, 3)(base)} °C${leak ? '\nLEAK: temp_center averages the future. The score looks great but this feature does not exist at prediction time.' : ''}`
            : `${tab.X.length} satır × ${tab.names.length} özellik (NaN'lı satırlar atıldı) · zamana göre bölmede test RMSE ${nf(lang, 3)(e)} °C, "değişmez" tabanı ${nf(lang, 3)(base)} °C${leak ? '\nSIZINTI: temp_center geleceğin ortalamasını alır. Puan harika görünür ama tahmin anında bu özellik yoktur.' : ''}`}</Readout>
        </>
      }
      side={
        <>
          <span className="sl-h">{en ? 'Lags (samples, 10 min each)' : 'Gecikmeler (örnek, her biri 10 dk)'}</span>
          {LAGS.map((k) => <Check key={k} label={`t−${k}`} value={lags.includes(k)} onChange={(v) => setLags((ls) => (v ? [...ls, k].sort((a, b) => a - b) : ls.filter((x) => x !== k)))} />)}
          <Select label={en ? 'Rolling window' : 'Kayan pencere'} value={String(roll)} options={[['1', en ? 'none' : 'yok'], ['3', '3'], ['6', '6 (1 h)'], ['12', '12 (2 h)'], ['36', '36 (6 h)']]} onChange={(v) => setRoll(Number(v))} />
          <Check label={en ? 'Hour of day (sin, cos)' : 'Günün saati (sin, cos)'} value={hour} onChange={setHour} />
          <Check label={en ? 'Light' : 'Işık'} value={light} onChange={setLight} />
          <Slider label={en ? 'Horizon h' : 'Ufuk h'} min={1} max={18} step={1} value={horizon} onChange={setHorizon} fmt={(v) => `${v} (${v * 10} ${en ? 'min' : 'dk'})`} />
          <Check label={en ? 'Leaky feature (centred mean)' : 'Sızıntılı özellik (merkezli ortalama)'} value={leak} onChange={setLeak} />
        </>
      }
    />
  )
}

// --- 6. Eğitim ve değerlendirme ---------------------------------------------------------------------------------------------

type SplitK = 'random' | 'time' | 'walk'
function TrainSim({ lang }: P) {
  const en = lang === 'en'
  const [task, setTask] = useState<'reg' | 'cls'>('reg')
  const [horizon, setHorizon] = useState(6)
  const [split, setSplit] = useState<SplitK>('time')
  const [lambda, setLambda] = useState(1)
  const [thr, setThr] = useState(26)
  const clean = useMemo(() => cleanTemp(DEFAULT), [])
  const tab = useMemo(() => buildTable(clean, DEFAULT.hour, DEFAULT.light, { ...FEAT_DEFAULTS, horizon }), [clean, horizon])
  const res = useMemo(() => {
    const n = tab.X.length
    const folds: Split[] = split === 'random' ? [randomSplit(n, 0.25)] : split === 'time' ? [timeSplit(n, 0.25, horizon)] : walkForward(n, 4, Math.round(n * 0.4), horizon)
    const y: number[] = [], p: number[] = [], base: number[] = [], idx: number[] = [], cy: number[] = [], cp: number[] = []
    for (const f of folds) {
      const Xtr = pick(tab.X, f.train), Xte = pick(tab.X, f.test)
      if (task === 'reg') {
        const m = fitLinear(Xtr, pick(tab.y, f.train), lambda)
        Xte.forEach((x) => p.push(predictLinear(m, x)))
      } else {
        const st = fitStump(Xtr, pick(tab.y, f.train).map((v) => (v > thr ? 1 : 0)))
        Xte.forEach((x) => cp.push(predictStump(st, x)))
        cy.push(...pick(tab.y, f.test).map((v) => (v > thr ? 1 : 0)))
      }
      y.push(...pick(tab.y, f.test)); base.push(...pick(tab.now, f.test)); idx.push(...f.test)
    }
    return { y, p, base, idx, cy, cp, folds: folds.length }
  }, [tab, split, task, lambda, thr, horizon])
  const order = res.idx.map((t, i) => [t, i]).sort((a, b) => a[0] - b[0]).map((a) => a[1])
  const last = order.slice(-288)
  const sc = task === 'cls' ? clsScore(res.cy, res.cp) : null
  const ri = res.y.map((v) => (v > thr ? 1 : 0))
  const persistCls = clsScore(ri, res.base.map((v) => (v > thr ? 1 : 0)))
  return (
    <Body
      stage={
        <>
          {task === 'reg'
            ? <LineChart title={en ? 'Test samples (last 2 days shown in time order): actual vs forecast' : 'Test örnekleri (zaman sırasıyla son 2 gün): gerçek ve tahmin'} xLabel={en ? 'day' : 'gün'} yLabel="°C" h={230}
              series={[
                { x: last.map((i) => DEFAULT.t[tab.idx[res.idx[i]]] / 1440), y: last.map((i) => res.y[i]), color: 'var(--ink)', width: 1.2, label: en ? 'actual' : 'gerçek' },
                { x: last.map((i) => DEFAULT.t[tab.idx[res.idx[i]]] / 1440), y: last.map((i) => res.p[i]), color: 'var(--sim-a)', width: 1.8, label: en ? 'model' : 'model' },
                { x: last.map((i) => DEFAULT.t[tab.idx[res.idx[i]]] / 1440), y: last.map((i) => res.base[i]), color: 'var(--mute)', dash: '4 3', width: 1, label: en ? 'no change' : 'değişmez' },
              ]} />
            : <Bars title={en ? 'Confusion matrix: TP, FP, FN, TN' : 'Karışıklık matrisi: DP, YP, YN, DN'} values={[sc!.tp, sc!.fp, sc!.fn, sc!.tn]} labels={en ? ['TP', 'FP', 'FN', 'TN'] : ['DP', 'YP', 'YN', 'DN']} colors={['var(--green)', 'var(--red)', 'var(--gold)', 'var(--sim-a)']} h={200} />}
          <Readout testid="sml-train-sum">{task === 'reg'
            ? (en
              ? `${res.folds} fold(s), ${res.y.length} test samples · model: MAE ${nf(lang, 3)(mae(res.y, res.p))}, RMSE ${nf(lang, 3)(rmse(res.y, res.p))} °C, R² ${nf(lang, 3)(r2(res.y, res.p))}\n"No change" baseline: RMSE ${nf(lang, 3)(rmse(res.y, res.base))} °C`
              : `${res.folds} kat, ${res.y.length} test örneği · model: MAE ${nf(lang, 3)(mae(res.y, res.p))}, RMSE ${nf(lang, 3)(rmse(res.y, res.p))} °C, R² ${nf(lang, 3)(r2(res.y, res.p))}\n"Değişmez" tabanı: RMSE ${nf(lang, 3)(rmse(res.y, res.base))} °C`)
            : (en
              ? `"Above ${thr} °C in ${horizon * 10} min?" · stump: accuracy ${pct(lang, sc!.acc)}, precision ${pct(lang, sc!.precision)}, recall ${pct(lang, sc!.recall)}\n"No change" baseline: accuracy ${pct(lang, persistCls.acc)}, recall ${pct(lang, persistCls.recall)}`
              : `"${horizon * 10} dk sonra ${thr} °C üstü mü?" · kütük: doğruluk ${pct(lang, sc!.acc)}, kesinlik ${pct(lang, sc!.precision)}, duyarlılık ${pct(lang, sc!.recall)}\n"Değişmez" tabanı: doğruluk ${pct(lang, persistCls.acc)}, duyarlılık ${pct(lang, persistCls.recall)}`)}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? 'Task' : 'Görev'} value={task} options={[['reg', en ? 'Regression (ridge)' : 'Regresyon (ridge)'], ['cls', en ? 'Classification (stump)' : 'Sınıflandırma (kütük)']]} onChange={setTask} />
          <Select label={en ? 'Validation' : 'Doğrulama'} value={split} options={[['random', en ? 'random split (wrong)' : 'rastgele bölme (yanlış)'], ['time', en ? 'time split + gap' : 'zamana göre bölme + boşluk'], ['walk', en ? 'walk-forward (4 folds)' : 'kayan pencere (4 kat)']]} onChange={setSplit} />
          <Slider label={en ? 'Horizon h' : 'Ufuk h'} min={1} max={18} step={1} value={horizon} onChange={setHorizon} fmt={(v) => `${v * 10} ${en ? 'min' : 'dk'}`} />
          {task === 'reg' ? <Slider label={en ? 'Ridge λ' : 'Ridge λ'} min={0} max={50} step={0.5} value={lambda} onChange={setLambda} fmt={nf(lang, 1)} />
            : <Slider label={en ? 'Threshold' : 'Eşik'} min={20} max={28} step={0.5} value={thr} onChange={setThr} fmt={(v) => `${nf(lang, 1)(v)} °C`} />}
        </>
      }
    />
  )
}

// --- 7. Kod üreteci ---------------------------------------------------------------------------------------------------------

function DeploySim({ lang }: P) {
  const en = lang === 'en'
  const [target, setTarget] = useState<'float' | 'fixed' | 'stump'>('fixed')
  const [q, setQ] = useState(12)
  const [horizon, setHorizon] = useState(6)
  const clean = useMemo(() => cleanTemp(DEFAULT), [])
  const tab = useMemo(() => buildTable(clean, DEFAULT.hour, DEFAULT.light, { ...FEAT_DEFAULTS, horizon }), [clean, horizon])
  const sp = timeSplit(tab.X.length, 0.25, horizon)
  const m = useMemo(() => fitLinear(pick(tab.X, sp.train), pick(tab.y, sp.train), 1), [tab]) // eslint-disable-line react-hooks/exhaustive-deps
  const st = useMemo(() => fitStump(pick(tab.X, sp.train), pick(tab.y, sp.train).map((v) => (v > 26 ? 1 : 0))), [tab]) // eslint-disable-line react-hooks/exhaustive-deps
  const f = quantize(m, q)
  const Xte = pick(tab.X, sp.test)
  const errs = Xte.map((x) => Math.abs(predictFixed(f, x) - predictLinear(m, x)))
  const maxIn = tab.names.map((_, j) => Math.max(...tab.X.map((r) => Math.abs(r[j]))))
  const worst = worstAcc(f, maxIn)
  const ok = fitsInt32(f, maxIn)
  const c = cost(tab.names.length)
  const note = en ? `trained on ${sp.train.length} rows, horizon ${horizon * 10} min` : `${sp.train.length} satırda eğitildi, ufuk ${horizon * 10} dk`
  const code = target === 'float' ? linearC(tab.names, m, note) : target === 'fixed' ? linearFixedC(tab.names, f, `${note}, Q${q}, ${en ? 'inputs ×' : 'girdiler ×'}${IN_SCALE}`) : stumpC(tab.names, st, `${note}: temp(t+h) > 26 °C`)
  return (
    <Body
      stage={
        <>
          <Readout log testid="sml-deploy-code">{code}</Readout>
          {target === 'fixed' && (
            <Readout testid="sml-deploy-sum">{en
              ? `Quantisation error vs float: max ${nf(lang, 4)(Math.max(...errs))} °C, mean ${nf(lang, 4)(errs.reduce((a, b) => a + b, 0) / errs.length)} °C\nWorst-case accumulator ${worst.toLocaleString('en-GB')} of 2 147 483 647 (${nf(lang, 1)((100 * worst) / 2147483647)}%) → ${ok ? 'fits int32' : 'OVERFLOWS int32'}`
              : `Float'a göre nicemleme hatası: en çok ${nf(lang, 4)(Math.max(...errs))} °C, ortalama ${nf(lang, 4)(errs.reduce((a, b) => a + b, 0) / errs.length)} °C\nEn kötü toplam ${worst.toLocaleString('tr-TR')} / 2 147 483 647 (%${nf(lang, 1)((100 * worst) / 2147483647)}) → ${ok ? 'int32\'ye sığar' : 'int32 TAŞAR'}`}</Readout>
          )}
          <Readout>{en
            ? `${tab.names.length} weights: ${c.floatBytes} B · Uno software float ≈ ${nf(lang, 0)(c.unoFloatUs)} µs, Uno fixed ≈ ${nf(lang, 0)(c.unoFixedUs)} µs, ESP32 FPU ≈ ${nf(lang, 2)(c.esp32FloatUs)} µs per prediction`
            : `${tab.names.length} ağırlık: ${c.floatBytes} B · Uno yazılım float ≈ ${nf(lang, 0)(c.unoFloatUs)} µs, Uno sabit nokta ≈ ${nf(lang, 0)(c.unoFixedUs)} µs, ESP32 FPU ≈ ${nf(lang, 2)(c.esp32FloatUs)} µs / tahmin`}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? 'Target' : 'Hedef'} value={target} options={[['float', en ? 'ESP32: float' : 'ESP32: float'], ['fixed', en ? 'Uno: fixed point (Q)' : 'Uno: sabit nokta (Q)'], ['stump', en ? 'Classifier: stump' : 'Sınıflandırıcı: kütük']]} onChange={setTarget} />
          <Slider label={en ? 'Q bits' : 'Q bit'} min={4} max={20} step={1} value={q} onChange={setQ} />
          <Slider label={en ? 'Horizon h' : 'Ufuk h'} min={1} max={18} step={1} value={horizon} onChange={setHorizon} fmt={(v) => `${v * 10} ${en ? 'min' : 'dk'}`} />
          <Btn ghost onClick={() => { void navigator.clipboard?.writeText(code) }}>{en ? 'Copy C code' : 'C kodunu kopyala'}</Btn>
        </>
      }
    />
  )
}

// --- 8. Anomali uyarısı -----------------------------------------------------------------------------------------------------

function AnomalySim({ lang }: P) {
  const en = lang === 'en'
  const [horizon, setHorizon] = useState(3)
  const [on, setOn] = useState(ALARM_DEFAULTS.on)
  const [off, setOff] = useState(ALARM_DEFAULTS.off)
  const [minRun, setMinRun] = useState(ALARM_DEFAULTS.minRun)
  const [cooldown, setCooldown] = useState(ALARM_DEFAULTS.cooldown)
  const P = useMemo(() => pipeline(DEFAULT, { ...FEAT_DEFAULTS, horizon }), [horizon])
  const A = alarm(P.z, { on, off: Math.min(off, on), minRun, cooldown })
  const label = P.idx.map((i) => DEFAULT.fault[i] ?? 0)
  const ev = evaluate(A.alerts, label)
  const x = P.idx.map((i) => (DEFAULT.t[i] ?? i * 10) / 1440)
  const band = faultBand(DEFAULT, (i) => DEFAULT.t[i] / 1440)
  return (
    <Body
      stage={
        <>
          <LineChart title={en ? 'Actual vs forecast temperature (trained on days 1–4)' : 'Gerçek ve tahmin sıcaklık (1–4. günlerde eğitildi)'} xLabel={en ? 'day' : 'gün'} yLabel="°C" h={190} bands={band}
            series={[{ x, y: P.actual, color: 'var(--ink)', width: 1.1, label: en ? 'actual' : 'gerçek' }, { x, y: P.pred, color: 'var(--sim-a)', width: 1.5, label: en ? 'forecast' : 'tahmin' }]} />
          <LineChart title={en ? 'Residual z-score, thresholds and alerts (circles)' : 'Artık z-skoru, eşikler ve uyarılar (halkalar)'} xLabel={en ? 'day' : 'gün'} h={190} bands={band} yRange={[-8, 12]}
            series={[{ x, y: P.z, color: color(2), width: 1.1, label: 'z' }]} hlines={[{ y: on, color: 'var(--red)', label: en ? 'on' : 'aç' }, { y: Math.min(off, on), color: 'var(--gold)', label: en ? 'off' : 'kapa' }, { y: -on, color: 'var(--red)' }]}
            marks={A.alerts.map((i) => ({ x: x[i], y: Math.max(-8, Math.min(12, P.z[i])), color: 'var(--red)' }))} />
          <Readout testid="sml-anom-sum">{en
            ? `Heater fault ${ev.caught ? `CAUGHT after ${ev.delay * 10} min` : 'MISSED'} · ${ev.falseAlerts} false alarm(s) · ${A.alerts.length} alert(s) in total · training residual σ = ${nf(lang, 3)(P.sd)} °C`
            : `Isıtıcı arızası ${ev.caught ? `${ev.delay * 10} dk sonra YAKALANDI` : 'KAÇIRILDI'} · ${ev.falseAlerts} yanlış alarm · toplam ${A.alerts.length} uyarı · eğitim artığı σ = ${nf(lang, 3)(P.sd)} °C`}</Readout>
        </>
      }
      side={
        <>
          <Select label={en ? 'Forecast horizon' : 'Tahmin ufku'} value={String(horizon)} options={[['1', en ? '10 min' : '10 dk'], ['3', en ? '30 min' : '30 dk'], ['6', en ? '1 hour' : '1 saat']]} onChange={(v) => setHorizon(Number(v))} />
          <Slider label={en ? 'On threshold |z|' : 'Açma eşiği |z|'} min={1.5} max={8} step={0.25} value={on} onChange={setOn} fmt={nf(lang, 2)} />
          <Slider label={en ? 'Off threshold |z|' : 'Kapama eşiği |z|'} min={0.5} max={6} step={0.25} value={off} onChange={setOff} fmt={nf(lang, 2)} />
          <Slider label={en ? 'Consecutive samples' : 'Ardışık örnek'} min={1} max={6} step={1} value={minRun} onChange={setMinRun} />
          <Slider label={en ? 'Cooldown' : 'Bekleme süresi'} min={0} max={72} step={6} value={cooldown} onChange={setCooldown} fmt={(v) => `${v * 10} ${en ? 'min' : 'dk'}`} />
        </>
      }
    />
  )
}

// --- Kayıt ------------------------------------------------------------------------------------------------------------------

const SIMS: Record<SensorSimId, (p: P) => React.ReactElement> = {
  toplama: LoggerSim, temizleme: CleanSim, kalman: KalmanSim, gorsel: AnalysisSim, ozellik: FeatureSim, egitim: TrainSim, yerlestirme: DeploySim, anomali: AnomalySim,
}

export function SensorSim({ id, lang }: { id: SensorSimId; lang: Lang }) {
  const S = SIMS[id]
  const m = SENSOR_SIM_META[id][lang]
  return <SimFrame id={id} title={m.title} desc={m.desc} testid={`sml-sim-${id}`}><S lang={lang} /></SimFrame>
}
