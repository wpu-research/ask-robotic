// Notalar, vuruş süreleri ve hazır ezgiler. Ezgilerin hepsi telifsiz halk/klasik ezgilerdir ya da bize aittir.

/** [etiket, frekans Hz]. Orta oktav 4: Do=262. */
export const NOTES: [string, number][] = [
  ['Alçak Do', 131], ['Alçak Re', 147], ['Alçak Mi', 165], ['Alçak Fa', 175], ['Alçak Sol', 196], ['Alçak La', 220], ['Alçak Si', 247],
  ['Do', 262], ['Re', 294], ['Mi', 330], ['Fa', 349], ['Sol', 392], ['La', 440], ['Si', 494],
  ['Tiz Do', 523], ['Tiz Re', 587], ['Tiz Mi', 659], ['Tiz Fa', 698], ['Tiz Sol', 784], ['Tiz La', 880], ['Tiz Si', 988],
]
export const NOTE_FREQ: Record<string, number> = Object.fromEntries(NOTES.map(([n, f]) => [n, f]))

/** Vuruş süreleri: değer = çeyrek vuruş sayısı. */
export const BEATS: [string, string][] = [
  ['1/16', '0.25'], ['1/8', '0.5'], ['1/4', '1'], ['1/2', '2'], ['1', '4'], ['2', '8'],
]

type N = [number, number] // [frekans (0 = sus), vuruş]
const [DO, RE, MI, FA, SOL, LA, SI, TDO, TRE, TMI] = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659]

export interface Melody { id: string; label: string; notes: N[] }

export const MELODIES: Melody[] = [
  { id: 'ode', label: 'Neşe ezgisi', notes: [[MI, 1], [MI, 1], [FA, 1], [SOL, 1], [SOL, 1], [FA, 1], [MI, 1], [RE, 1], [DO, 1], [DO, 1], [RE, 1], [MI, 1], [MI, 1.5], [RE, 0.5], [RE, 2]] },
  { id: 'twinkle', label: 'Yıldız ezgisi', notes: [[DO, 1], [DO, 1], [SOL, 1], [SOL, 1], [LA, 1], [LA, 1], [SOL, 2], [FA, 1], [FA, 1], [MI, 1], [MI, 1], [RE, 1], [RE, 1], [DO, 2]] },
  { id: 'fanfare', label: 'Zafer', notes: [[DO, 0.5], [MI, 0.5], [SOL, 0.5], [TDO, 1.5], [SOL, 0.5], [TDO, 2]] },
  { id: 'sad', label: 'Üzgün', notes: [[LA, 1], [SOL, 1], [FA, 1], [MI, 3]] },
  { id: 'alarm', label: 'Alarm', notes: [[TDO, 0.5], [0, 0.25], [TDO, 0.5], [0, 0.25], [TDO, 0.5], [0, 0.25], [TRE, 1]] },
  { id: 'up', label: 'Yukarı çıkan', notes: [[DO, 0.5], [RE, 0.5], [MI, 0.5], [FA, 0.5], [SOL, 0.5], [LA, 0.5], [SI, 0.5], [TDO, 1]] },
  { id: 'down', label: 'Aşağı inen', notes: [[TDO, 0.5], [SI, 0.5], [LA, 0.5], [SOL, 0.5], [FA, 0.5], [MI, 0.5], [RE, 0.5], [DO, 1]] },
  { id: 'jingle', label: 'Neşeli', notes: [[MI, 0.5], [MI, 0.5], [MI, 1], [MI, 0.5], [MI, 0.5], [MI, 1], [MI, 0.5], [SOL, 0.5], [DO, 0.75], [RE, 0.25], [MI, 2]] },
  { id: 'chirp', label: 'Kuş cıvıltısı', notes: [[TMI, 0.25], [TRE, 0.25], [TMI, 0.25], [TDO, 0.5], [0, 0.25], [TMI, 0.25], [TRE, 0.25], [TMI, 0.5]] },
]
export const MELODY_BY_ID: Record<string, Melody> = Object.fromEntries(MELODIES.map((m) => [m.id, m]))
