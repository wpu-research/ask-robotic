// PyTorch dersi: diziler boyunca gradyan akışı (saf, testli). Tek boyutlu bir RNN ve bir LSTM aynı rastgele girdi dizisinde
// çalıştırılır; son gizli durumun her adımdaki gizli duruma göre türevi |∂h_T/∂h_t| zincir kuralıyla hesaplanır.
// RNN: h_t = tanh(w·h_{t−1} + u·x_t + b) → ∂h_t/∂h_{t−1} = w·(1 − h_t²).
// LSTM hücre yolu: c_t = f_t·c_{t−1} + i_t·g_t → ∂c_t/∂c_{t−1} = f_t (unutma kapısı); f ≈ 1 iken gradyan sönmeden taşınır.
// (LSTM'de yalnız hücre durumu üzerinden giden doğrudan yol izlenir; kapıların dolaylı katkısı küçük olduğundan atlanır.)

const sig = (z: number) => 1 / (1 + Math.exp(-z))
function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32) }

export interface SeqOpts { T: number; w: number; forgetBias: number; seed?: number }
export interface SeqResult { xs: number[]; rnnH: number[]; rnnGrad: number[]; lstmC: number[]; lstmF: number[]; lstmGrad: number[] }

export function gradientFlow(o: SeqOpts): SeqResult {
  const r = lcg(o.seed ?? 3), xs = Array.from({ length: o.T }, () => r() * 2 - 1)
  // RNN
  const rnnH: number[] = []
  let h = 0
  for (const x of xs) { h = Math.tanh(o.w * h + 0.8 * x); rnnH.push(h) }
  const rnnGrad = new Array<number>(o.T).fill(0)
  let g = 1
  for (let t = o.T - 1; t >= 0; t--) { rnnGrad[t] = Math.abs(g); g *= o.w * (1 - rnnH[t] ** 2) }
  // LSTM (tek hücre, sabit küçük ağırlıklar; unutma kapısı ön yargısı kullanıcıdan)
  const lstmC: number[] = [], lstmF: number[] = []
  let c = 0, hl = 0
  for (const x of xs) {
    const f = sig(o.forgetBias + 0.5 * x + 0.3 * hl), i = sig(0.5 * x - 0.2 * hl), gg = Math.tanh(0.9 * x + 0.2 * hl), oo = sig(0.4 * x)
    c = f * c + i * gg; hl = oo * Math.tanh(c)
    lstmC.push(c); lstmF.push(f)
  }
  const lstmGrad = new Array<number>(o.T).fill(0)
  g = 1
  for (let t = o.T - 1; t >= 0; t--) { lstmGrad[t] = Math.abs(g); g *= lstmF[t] }
  return { xs, rnnH, rnnGrad, lstmC, lstmF, lstmGrad }
}
/** Gradyanın ilk değerinin %1'inin altına düştüğü en uzak adım sayısı ("etkili bellek"). */
export const memorySpan = (grad: number[]) => { let k = 0; for (let t = grad.length - 1; t >= 0; t--) { if (grad[t] < 0.01) break; k++ } return k }
