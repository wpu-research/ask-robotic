// Sensör verisinden ML dersi üniteleri 5–8: özellik mühendisliği, eğitim ve değerlendirme, modeli mikrodenetleyiciye taşıma,
// anomali uyarısı. HTML iki dilde aynı etiket dizisinde; kod iki dilde aynı, yalnız yorumlar çevrilir (satır sayısı eşit).
// Python kodları tarayıcıda Pyodide + NumPy ile sera-sensorleri.csv üzerinde çalışır.
import type { SensorSimId } from '@/components/sensor-ml/sim-meta'
import type { CourseUnit } from '@/lib/kurs/types'
import type { CodeLine, Lang } from '@/lib/ml/core'

const L = (l: Lang, tr: string, en: string) => (l === 'tr' ? tr : en)

// --- Python (Pyodide) ortak satırlar ------------------------------------------------------------------------------------------

const LOAD: CodeLine[] = [
  ['import numpy as np'],
  ["D = np.genfromtxt('sera-sensorleri.csv', delimiter=',', names=True)", '7 gün, 10 dakikada bir', '7 days, every 10 minutes'],
  ["T = D['sicaklik'].copy()"],
  ['bad = ~np.isfinite(T) | (T > 60) | (T < -20)', 'okunamayan ve imkansız değerler', 'failed reads and impossible values'],
  ['i = np.arange(len(T))'],
  ['T[bad] = np.interp(i[bad], i[~bad], T[~bad])', 'doğrusal ara değerle doldur', 'fill by linear interpolation'],
]
const LAG: CodeLine[] = [
  ['def lag(x, k):', 'out[i] = x[i - k]', 'out[i] = x[i - k]'],
  ['    out = np.full(len(x), np.nan)'],
  ['    out[k:] = x[:-k]'],
  ['    return out'],
]
const HOUR: CodeLine[] = [
  ["hs = np.sin(2 * np.pi * D['saat'] / 24)", 'saat döngüseldir: sin/cos çifti', 'the hour is cyclic: a sin/cos pair'],
  ["hc = np.cos(2 * np.pi * D['saat'] / 24)"],
]

const PY_FEATURES: CodeLine[] = [
  ...LOAD, ...LAG, ...HOUR,
  ['def roll(x, w, f):', 'son w örnek (i dahil), yalnız geçmiş', 'last w samples (including i), past only'],
  ['    out = np.full(len(x), np.nan)'],
  ['    for j in range(w - 1, len(x)):'],
  ['        out[j] = f(x[j - w + 1:j + 1])'],
  ['    return out'],
  ['H = 6', 'ufuk: 6 adım = 1 saat sonrası', 'horizon: 6 steps = 1 hour ahead'],
  ['y = np.full(len(T), np.nan)'],
  ['y[:-H] = T[H:]', 'hedef: h adım sonraki sıcaklık', 'target: temperature h steps later'],
  ['cols = {'],
  ["    'temp': T, 'lag1': lag(T, 1), 'lag2': lag(T, 2), 'lag3': lag(T, 3), 'lag6': lag(T, 6),"],
  ["    'mean6': roll(T, 6, np.mean), 'std6': roll(T, 6, np.std),"],
  ["    'hour_sin': hs, 'hour_cos': hc, 'light': D['isik'] / 1023,"],
  ['}'],
  ['X = np.column_stack(list(cols.values()))'],
  ['ok = np.isfinite(X).all(axis=1) & np.isfinite(y)', 'NaN içeren satırı at', 'drop any row with a NaN'],
  ['print("rows:", len(T), "-> table:", ok.sum(), "x", X.shape[1])'],
  ['for name, c in cols.items():'],
  ['    r = np.corrcoef(c[ok], y[ok])[0, 1]'],
  ['    print(f"{name:9s} r = {r:+.3f}")'],
  ['leak = np.full(len(T), np.nan)', 'BİLEREK HATALI: merkezli ortalama', 'WRONG ON PURPOSE: centred mean'],
  ['for j in range(H, len(T) - H):'],
  ['    leak[j] = T[j - H:j + H + 1].mean()', 'j + H\'ye kadar bakar: geleceği görür', 'looks up to j + H: sees the future'],
  ['m = ok & np.isfinite(leak)'],
  ['print("leaky centred mean r =", round(np.corrcoef(leak[m], y[m])[0, 1], 3))'],
]

const TABLE8: CodeLine[] = [
  ["X = np.column_stack([T, lag(T, 1), lag(T, 2), lag(T, 3), lag(T, 6), hs, hc, D['isik'] / 1023])"],
  ['y = np.full(len(T), np.nan)'],
  ['y[:-H] = T[H:]'],
]

const PY_TRAIN: CodeLine[] = [
  ...LOAD, ...LAG, ...HOUR,
  ['H = 6', '1 saat sonrası', '1 hour ahead'],
  ...TABLE8,
  ['ok = np.isfinite(X).all(axis=1) & np.isfinite(y)'],
  ['X, y, now = X[ok], y[ok], T[ok]', 'now: persistence tabanı için', 'now: for the persistence baseline'],
  ['def fit_ridge(X, y, lam=1.0):'],
  ['    mu, sd = X.mean(0), X.std(0) + 1e-9', 'standartlaştır', 'standardise'],
  ['    Z = np.column_stack([np.ones(len(X)), (X - mu) / sd])'],
  ['    A = Z.T @ Z + lam * np.diag([0] + [1] * X.shape[1])', 'sabit terim cezalanmaz', 'the bias is not penalised'],
  ['    w = np.linalg.solve(A, Z.T @ y)', 'normal denklemler', 'normal equations'],
  ['    return lambda Xn: np.column_stack([np.ones(len(Xn)), (Xn - mu) / sd]) @ w'],
  ['def scores(y, p):'],
  ['    e = y - p'],
  ['    return np.abs(e).mean(), np.sqrt((e ** 2).mean()), 1 - (e ** 2).sum() / ((y - y.mean()) ** 2).sum()'],
  ['n = len(y)'],
  ['cut = int(n * 0.75)'],
  ['tr, te = np.arange(cut - H), np.arange(cut, n)', 'zamana göre bölme, arada H satır boşluk', 'time split with an H-row gap'],
  ['f = fit_ridge(X[tr], y[tr])'],
  ['print("time split   MAE %.3f  RMSE %.3f  R2 %.3f" % scores(y[te], f(X[te])))'],
  ['print("persistence  MAE %.3f  RMSE %.3f  R2 %.3f" % scores(y[te], now[te]))', '"değişmez" tabanı', 'the "no change" baseline'],
  ['idx = np.random.default_rng(7).permutation(n)', 'rastgele bölme: zaman serisinde yanıltıcı', 'random split: misleading on a time series'],
  ['f2 = fit_ridge(X[idx[:cut]], y[idx[:cut]])'],
  ['print("random split MAE %.3f  RMSE %.3f  R2 %.3f" % scores(y[idx[cut:]], f2(X[idx[cut:]])))'],
  ['c = (y > 26).astype(int)', 'sınıf: 1 saat sonra 26 C üstü mü?', 'class: above 26 C in one hour?'],
  ['best = (1.0, 0.0)'],
  ['for t in np.unique(X[tr, 0]):', 'karar kütüğü: tek eşik', 'decision stump: one threshold'],
  ['    err = ((X[tr, 0] > t).astype(int) != c[tr]).mean()'],
  ['    if err < best[0]:'],
  ['        best = (err, t)'],
  ['acc = ((X[te, 0] > best[1]).astype(int) == c[te]).mean()'],
  ['print("stump: temp > %.2f -> hot, test accuracy %.3f" % (best[1], acc))'],
]

const PY_EXPORT: CodeLine[] = [
  ...LOAD, ...LAG, ...HOUR,
  ['H = 6'],
  ["names = ['temp', 'lag1', 'lag6', 'hour_sin', 'hour_cos', 'light']", 'cihaz için küçük model: 6 özellik', 'a small model for the device: 6 features'],
  ["X = np.column_stack([T, lag(T, 1), lag(T, 6), hs, hc, D['isik'] / 1023])"],
  ['y = np.full(len(T), np.nan)'],
  ['y[:-H] = T[H:]'],
  ['ok = np.isfinite(X).all(axis=1) & np.isfinite(y)'],
  ['X, y = X[ok], y[ok]'],
  ['A = np.column_stack([np.ones(len(X)), X])'],
  ['w = np.linalg.lstsq(A, y, rcond=None)[0]', 'w[0] sabit terim, ham ölçekte', 'w[0] is the bias, raw scale'],
  ['print("// float: ESP32 has an FPU")'],
  ['print("float predict_temp(" + ", ".join("float " + s for s in names) + ") {")'],
  ['body = "%.6ff" % w[0] + "".join("\\n    + %.6ff * %s" % (wi, s) for wi, s in zip(w[1:], names))'],
  ['print("  return " + body + ";\\n}")'],
  ['Q = 12', 'Q12: ağırlık x 4096', 'Q12: weight x 4096'],
  ['Wq = np.round(w[1:] * 2 ** Q).astype(np.int64)'],
  ['Bq = int(round(w[0] * 100 * 2 ** Q))', 'sabit terim santi-birimde', 'bias in centi-units'],
  ['print("\\n// fixed point Q%d: the Uno has no FPU" % Q)'],
  ['print("static const int32_t W[%d] = { %s };" % (len(Wq), ", ".join(str(v) for v in Wq)))'],
  ['print("static const int32_t B = %d;" % Bq)'],
  ['Xc = np.round(X * 100).astype(np.int64)', 'girdiler int16, santi-birim (23,45 -> 2345)', 'inputs as int16 centi-units (23.45 -> 2345)'],
  ['pf = np.floor((Xc @ Wq + Bq) / 2 ** Q) / 100', 'C\'deki acc >> Q ile aynı', 'same as acc >> Q in C'],
  ['print("\\nmax quantisation error: %.4f C" % np.abs(pf - A @ w).max())'],
  ['worst = abs(Bq) + int((np.abs(Wq) * np.abs(Xc).max(0)).sum())', 'en kötü durumda toplam', 'worst-case accumulator'],
  ['print("worst accumulator %d of %d (%.0f%%)" % (worst, 2 ** 31 - 1, 100 * worst / (2 ** 31 - 1)))'],
]

const PY_ANOMALY: CodeLine[] = [
  ...LOAD, ...LAG, ...HOUR,
  ['H = 3', '30 dakika sonrası', '30 minutes ahead'],
  ...TABLE8,
  ['ok = np.isfinite(X).all(axis=1) & np.isfinite(y)'],
  ["tr = ok & (D['dakika'] + 10 * H < 4 * 1440)", 'ilk 4 gün: arızasız eğitim', 'first 4 days: fault-free training'],
  ['A = np.column_stack([np.ones(len(X)), X])'],
  ['w = np.linalg.lstsq(A[tr], y[tr], rcond=None)[0]'],
  ['res = y - A @ w', 'artık: gerçek - tahmin', 'residual: actual - forecast'],
  ['mu, sd = res[tr].mean(), res[tr].std()'],
  ['z = (res - mu) / sd', 'eğitim artıklarının sigmasıyla', 'scaled by the training residual sigma'],
  ['ON, OFF, MIN_RUN, COOLDOWN = 3.0, 1.5, 2, 18', 'histerezis ve bekleme (18 x 10 dk = 3 saat)', 'hysteresis and cooldown (18 x 10 min = 3 h)'],
  ['on, run, last, alerts = False, 0, -10 ** 9, []'],
  ['for k in range(len(z)):'],
  ['    a = abs(z[k]) if np.isfinite(z[k]) else 0.0'],
  ['    if not on:'],
  ['        run = run + 1 if a >= ON else 0'],
  ['        if run >= MIN_RUN:', 'art arda MIN_RUN örnek eşik üstünde', 'MIN_RUN samples in a row above the threshold'],
  ['            on = True'],
  ['            if k - last >= COOLDOWN:'],
  ['                alerts.append(k)'],
  ['                last = k'],
  ['    elif a < OFF:', 'kapanış eşiği daha düşük', 'the off threshold is lower'],
  ['        on, run = False, 0'],
  ["fault = D['ariza']"],
  ['start = int(np.argmax(fault > 0))'],
  ['end = len(fault) - 1 - int(np.argmax(fault[::-1] > 0))'],
  ['hits = [k + H for k in alerts]', 'artık hedefin zamanına aittir', 'a residual belongs to the target time'],
  ['inside = [t for t in hits if start <= t <= end + 6]'],
  ['print("training residual sigma: %.3f C" % sd)'],
  ['print("alerts (day, hour):", [(t // 144 + 1, round(t % 144 / 6, 1)) for t in hits])'],
  ['print("fault caught:", bool(inside), " delay:", (inside[0] - start) * 10 if inside else None, "min")'],
  ['print("false alarms:", len(hits) - len(inside))'],
]

// --- Kod blokları (C++ / Python) ----------------------------------------------------------------------------------------------

const featCpp = (l: Lang) => ({
  title: L(l, 'features.h: cihazda halka tampon ve özellik vektörü (C++)', 'features.h: ring buffer and feature vector on the device (C++)'),
  src: `#include <math.h>
const int N = 7;                       // ${L(l, 'şimdi + 6 gecikme', 'now + 6 lags')}
float hist[N];
int head = 0, filled = 0;

void pushTemp(float t) {               // ${L(l, 'her 10 dakikada bir çağrılır', 'called every 10 minutes')}
  hist[head] = t;
  head = (head + 1) % N;
  if (filled < N) filled++;
}
float lagOf(int k) {                   // ${L(l, 'k adım önceki değer (0 = şimdi)', 'value k steps back (0 = now)')}
  return hist[(head - 1 - k + N) % N];
}
bool buildFeatures(float hour, int ldr, float x[10]) {
  if (filled < N) return false;        // ${L(l, 'geçmiş yetmiyor: tahmin yok', 'not enough history: no forecast')}
  x[0] = lagOf(0); x[1] = lagOf(1); x[2] = lagOf(2); x[3] = lagOf(3); x[4] = lagOf(6);
  float m = 0, s = 0;
  for (int k = 0; k < 6; k++) m += lagOf(k);
  m /= 6;
  for (int k = 0; k < 6; k++) s += (lagOf(k) - m) * (lagOf(k) - m);
  x[5] = m; x[6] = sqrtf(s / 6);       // ${L(l, 'kayan ortalama ve sapma', 'rolling mean and std')}
  x[7] = sinf(2 * M_PI * hour / 24);
  x[8] = cosf(2 * M_PI * hour / 24);
  x[9] = ldr / 1023.0f;                // ${L(l, 'eğitimdeki ölçekle aynı', 'same scale as in training')}
  return true;
}`,
})

const leakPy = (l: Lang) => ({
  title: L(l, 'test_ozellik.py: gelecekten sızıntı testi (Python)', 'test_features.py: future leakage test (Python)'),
  src: `import numpy as np

def lag(x, k):
    out = np.full(len(x), np.nan)
    out[k:] = x[:-k]
    return out

def centred(x, k):                     # ${L(l, 'grafik için güzel, özellik olarak yasak', 'nice for plots, forbidden as a feature')}
    out = np.full(len(x), np.nan)
    for j in range(k, len(x) - k):
        out[j] = x[j - k:j + k + 1].mean()
    return out

def leaks(f, n=200, cut=120):          # ${L(l, 'geleceği değiştir, geçmiş özellik değişiyor mu?', 'change the future: does a past feature change?')}
    a = np.arange(n, dtype=float)
    b = a.copy()
    b[cut:] = 999.0
    return not np.allclose(f(a)[:cut], f(b)[:cut], equal_nan=True)

def test_lags_do_not_leak():
    assert not leaks(lambda x: lag(x, 1))
    assert not leaks(lambda x: lag(x, 6))

def test_centred_mean_leaks():
    assert leaks(lambda x: centred(x, 6))`,
})

const walkPy = (l: Lang) => ({
  title: L(l, 'walk_forward.py: kayan pencereli doğrulama (Python)', 'walk_forward.py: walk-forward validation (Python)'),
  src: `import numpy as np

def walk_forward(n, folds, min_train, gap):
    block = (n - min_train) // folds
    for f in range(folds):
        start = min_train + f * block
        stop = n if f == folds - 1 else start + block
        train = np.arange(0, max(0, start - gap))   # ${L(l, 'geçmişin tamamı, boşluklu', 'all of the past, with a gap')}
        test = np.arange(start, stop)               # ${L(l, 'hemen sonraki blok', 'the very next block')}
        yield train, test

def evaluate(X, y, now, fit, h):
    rows = []
    for train, test in walk_forward(len(y), 4, len(y) // 3, gap=h):
        model = fit(X[train], y[train])
        e = y[test] - model(X[test])
        base = y[test] - now[test]                  # ${L(l, 'persistence: "değişmez"', 'persistence: "no change"')}
        rows.append((np.sqrt((e ** 2).mean()), np.sqrt((base ** 2).mean())))
    for k, (m, b) in enumerate(rows):
        print(f"fold {k}: model RMSE {m:.3f}  baseline {b:.3f}  skill {1 - m / b:+.0%}")
    return rows`,
})

const stumpCpp = (l: Lang) => ({
  title: L(l, 'stump.h: eğitilmiş karar kütüğü cihazda (C++)', 'stump.h: the trained decision stump on the device (C++)'),
  src: `// ${L(l, 'Python\'da bulunan eşik buraya yapıştırılır', 'the threshold found in Python is pasted here')}
const float HOT_THRESHOLD = 24.81f;    // ${L(l, 'özellik: şimdiki sıcaklık', 'feature: current temperature')}

uint8_t willBeHot(float tempNow) {     // ${L(l, '1: bir saat içinde 26 °C üstü bekleniyor', '1: above 26 °C expected within an hour')}
  return tempNow > HOT_THRESHOLD ? 1 : 0;
}

void loop() {
  float t = readTemperature();
  if (willBeHot(t)) openWindowEarly();  // ${L(l, 'erken önlem: pencere şimdi aralanır', 'early action: open the window now')}
  delay(600000UL);                      // ${L(l, '10 dakika', '10 minutes')}
}`,
})

const floatCpp = (l: Lang) => ({
  title: L(l, 'predict_esp32.ino: float model ve süre ölçümü (ESP32, C++)', 'predict_esp32.ino: float model and timing (ESP32, C++)'),
  src: `// ${L(l, 'export.py çıktısı: ağırlıklar ham ölçekte, ölçekleme gerekmez', 'export.py output: weights in raw scale, no scaling needed')}
float predict_temp(float temp, float lag1, float lag6,
                   float hour_sin, float hour_cos, float light) {
  return 2.498785f
       + 0.795491f * temp + 0.233786f * lag1 - 0.190635f * lag6
       + 0.592475f * hour_sin + 0.569771f * hour_cos + 3.463065f * light;
}

void setup() {
  Serial.begin(115200);
  uint32_t t0 = micros();
  volatile float p = 0;
  for (int i = 0; i < 1000; i++) p = predict_temp(24.1f, 24.0f, 23.2f, 0.5f, -0.87f, 0.62f);
  uint32_t us = micros() - t0;         // ${L(l, '1000 tahmin', '1000 forecasts')}
  Serial.printf("forecast %.2f C, %.3f us each\\n", p, us / 1000.0f);
}
void loop() {}`,
})

const fixedCpp = (l: Lang) => ({
  title: L(l, 'predict_uno.ino: sabit noktalı model, FPU yok (Uno, C++)', 'predict_uno.ino: fixed-point model, no FPU (Uno, C++)'),
  src: `#include <stdint.h>
#define Q 12                           // ${L(l, 'ağırlık = round(w x 4096)', 'weight = round(w x 4096)')}
static const int32_t W[6] = { 3258, 958, -781, 2427, 2334, 14185 };
static const int32_t B = 1023503;      // ${L(l, 'sabit terim, santi-birim x 4096', 'bias, centi-units x 4096')}

// ${L(l, 'girdiler santi-birim int16: 23,45 °C -> 2345, ışık 0..1 -> 0..100', 'inputs as int16 centi-units: 23.45 °C -> 2345, light 0..1 -> 0..100')}
int16_t predict_temp_c(const int16_t x[6]) {
  int32_t acc = B;
  for (uint8_t i = 0; i < 6; i++) acc += W[i] * (int32_t)x[i];  // ${L(l, 'en kötü durum int32\'ye sığmalı', 'the worst case must fit in int32')}
  return (int16_t)(acc >> Q);          // ${L(l, 'aritmetik kaydırma = aşağı yuvarlama', 'arithmetic shift = round down')}
}

void setup() {
  Serial.begin(9600);
  int16_t x[6] = { 2410, 2400, 2320, 50, -87, 62 };
  int16_t c = predict_temp_c(x);
  Serial.print(c / 100); Serial.print('.'); Serial.println(abs(c % 100));
}
void loop() {}`,
})

const alarmCpp = (l: Lang) => ({
  title: L(l, 'alarm.h: histerezisli ve beklemeli uyarı durum makinesi (C++)', 'alarm.h: alert state machine with hysteresis and cooldown (C++)'),
  src: `struct Alarm {
  float on = 3.0f, off = 1.5f;         // ${L(l, 'açma eşiği > kapama eşiği', 'on threshold > off threshold')}
  uint8_t minRun = 2;                  // ${L(l, 'art arda kaç örnek', 'how many samples in a row')}
  uint16_t cooldown = 18;              // ${L(l, '18 x 10 dk = 3 saat', '18 x 10 min = 3 hours')}
  bool active = false;
  uint8_t run = 0;
  int32_t last = -100000, k = 0;

  // ${L(l, 'true: yeni bir uyarı gönderilmeli', 'true: a new alert must be sent')}
  bool step(float z) {
    float a = fabsf(z);
    bool fire = false;
    if (!active) {
      run = (a >= on) ? run + 1 : 0;
      if (run >= minRun) {
        active = true;
        if (k - last >= cooldown) { fire = true; last = k; }
      }
    } else if (a < off) {
      active = false; run = 0;
    }
    k++;
    return fire;
  }
};`,
})

const mqttCpp = (l: Lang) => ({
  title: L(l, 'alert_mqtt.ino: uyarıyı MQTT ile yayımla (ESP32, PubSubClient)', 'alert_mqtt.ino: publish the alert over MQTT (ESP32, PubSubClient)'),
  src: `#include <WiFi.h>
#include <PubSubClient.h>
WiFiClient net;
PubSubClient mqtt(net);
Alarm alarm;                           // ${L(l, 'alarm.h', 'alarm.h')}

void onSample(float actual, float forecast, float mu, float sd) {
  float z = (actual - forecast - mu) / sd;   // ${L(l, 'eğitim artıklarıyla ölçeklenmiş', 'scaled by the training residuals')}
  char msg[96];
  snprintf(msg, sizeof msg, "{\\"z\\":%.2f,\\"t\\":%.2f,\\"pred\\":%.2f}", z, actual, forecast);
  mqtt.publish("sera/01/anomali/z", msg);    // ${L(l, 'her örnek: pano için', 'every sample: for the dashboard')}
  if (alarm.step(z)) {
    mqtt.publish("sera/01/uyari", msg, true);  // ${L(l, 'retained: yeni abone son uyarıyı görür', 'retained: a new subscriber sees the last alert')}
  }
  mqtt.publish("sera/01/uyari/durum", alarm.active ? "1" : "0", true);
}`,
})

// --- Üniteler ---------------------------------------------------------------------------------------------------------------

export const UNITS_B: CourseUnit<SensorSimId>[] = [
  {
    n: 5, sims: ['ozellik'], parts: ['dht22', 'ldr'],
    related: [
      { href: '/makine-ogrenmesi/dogrusal-regresyon', tr: 'ML dersi: doğrusal regresyon', en: 'ML course: linear regression' },
      { href: '/makine-ogrenmesi/veri-setleri', tr: 'Veri setleri: sera sensörleri CSV', en: 'Datasets: greenhouse sensors CSV' },
    ],
    py: { file: 'ozellikler.py', code: PY_FEATURES, data: ['sera-sensorleri'] },
    tr: {
      title: 'Özellik mühendisliği: zaman serisinden tablo',
      summary: 'Gecikmeler, kayan ortalama ve sapma, döngüsel saat, ışık ve hedef ufku: bir sıcaklık serisini modelin okuyabileceği bir tabloya çevir, gelecekten sızıntıya düşme.',
      goals: ['Bir zaman serisinden gecikme (t−k) ve kayan pencere özellikleri üretmek', 'Günün saatini sin/cos çiftiyle döngüsel olarak kodlamak', 'Hedefi h adım sonraki değer olarak tanımlamak ve NaN satırları dürüstçe atmak', 'Geleceği gören bir özelliği (sızıntı) tanımak ve bunu bir testle yakalamak'],
      notes: `<p>Doğrusal regresyon, karar ağacı ya da sinir ağı: hepsi bir <b>tablo</b> ister. Her satır bir örnek, her sütun bir özellik, bir de hedef sütunu. Sensör verisi ise tek bir uzun seridir. Özellik mühendisliği, "şu anda bildiklerim" ile "tahmin etmek istediğim" arasındaki köprüyü kurar: <i>t</i> anındaki satıra yalnız <i>t</i> anında ya da öncesinde ölçülmüş değerler girebilir.</p>
<h3>Hangi özellikler?</h3>
<ul><li><b>Gecikmeler</b>: <code>temp_lag1</code>, <code>temp_lag2</code>, <code>temp_lag6</code>. 10 dakikalık örneklemede lag6 bir saat öncesidir. Sıcaklık yavaş değişir; yakın geçmiş en güçlü ipucudur.</li><li><b>Kayan ortalama ve sapma</b>: son 6 örneğin ortalaması gürültüyü bastırır, sapması "şu an hava ne kadar oynak" bilgisini verir (bulut geçişleri, pencere açılması).</li><li><b>Döngüsel saat</b>: saat 23,8 ile 0,2 birbirine yakındır ama sayı olarak uzaktır. <code>sin(2πh/24)</code> ve <code>cos(2πh/24)</code> çifti saati bir çemberin üstüne koyar; doğrusal model günlük döngüyü bu iki sütunla öğrenir.</li><li><b>Işık</b>: LDR değeri 0..1023, 1023'e bölünür. Sera güneşten biraz geride ısınır; ışık yarım saat sonraki sıcaklığı haber verir.</li></ul>
<div class="eq">satır t: [x(t), x(t−1), x(t−2), x(t−3), x(t−6), ort6(t), σ6(t), sin, cos, ışık(t)] &nbsp;→&nbsp; hedef: x(t + h)</div>
<h3>Hedef ufku ve atılan satırlar</h3>
<p>Ufuk <i>h</i> = 6 ise model bir saat sonrasını tahmin eder. Serinin başındaki 6 satırın gecikmesi yoktur, sonundaki 6 satırın hedefi yoktur: bunlar atılır. Eksik bir hücreyi sıfırla doldurmak modele "o an 0 °C idi" yalanını söyler; temizleme ünitesindeki ara değer ya da satırı atmak dürüst seçeneklerdir. 1008 örnekten yaklaşık 990 satırlık bir tablo kalır.</p>
<h3>Sızıntı: sahte başarı</h3>
<p>Grafikte güzel duran <b>merkezli ortalama</b> (<i>t − h</i> .. <i>t + h</i>) özellik olarak kullanılırsa hedefin kendisini içerir. Korelasyonu en güçlü gerçek özelliği bile geçer, test hatası şaşırtıcı küçülür; ama cihazda gelecek elinizde olmadığı için bu özellik hesaplanamaz. Sızıntının belirtisi: tek bir özelliğin "fazla iyi" olması. Kural basittir: her özellik yalnız geçmişe bakan, nedensel bir fonksiyon olmalıdır. Bunu sözle değil, testle güvenceye al.</p>`,
      code: [featCpp('tr'), leakPy('tr')],
      lab: 'Simülasyonda varsayılan özelliklerle başla ve her özelliğin hedefle korelasyonunu not et. Sonra hedef ufkunu 1\'den 12\'ye çıkar: hangi gecikmenin korelasyonu en hızlı düşüyor? Saat bilgisini kapatıp aç, tablonun sütun sayısının nasıl değiştiğine bak. Son olarak "sızıntılı özellik" kutusunu işaretle: korelasyonu kaç oldu ve neden cihazda hesaplanamaz? Aşağıdaki Python kodunu çalıştırıp aynı korelasyonları CSV üzerinde doğrula.',
      pitfalls: ['Eksik hücreyi 0 ile doldurmak: model gerçekte hiç olmamış soğuk anlar öğrenir.', 'Saati 0..23 tamsayı olarak vermek: doğrusal model 23:50 ile 00:10\'un komşu olduğunu bilemez.', 'Kayan ortalamayı merkezli almak (pandas rolling(center=True) gibi): özellik geleceği görür, test hatası sahte küçülür.', 'Eğitimde 1023\'e bölüp cihazda ham LDR değerini vermek: aynı ağırlıklar bin kat büyük bir girdiyle çarpılır.'],
      se: `<p>Özellik kodu iki yerde yaşar: Python'da eğitimde, C++'ta cihazda. İkisi ayrışırsa model sessizce bozulur. Bu, klasik bir <b>eğitim/sunum farkı</b> (training-serving skew) hatasıdır.</p>
<ul><li>Özellik listesini (ad, gecikme, ölçek) tek bir yapılandırmada tut; iki taraf da onu okusun.</li><li>Aynı 20 satırlık girdiye iki uygulamanın aynı vektörü ürettiğini gösteren bir <b>altın dosya testi</b> yaz.</li><li>"Geleceği değiştir, geçmiş özellik değişmemeli" testi her yeni özellik için CI'da koşsun.</li></ul>`,
      quiz: [
        { q: '10 dakikalık örneklemede "temp_lag6" ne demektir?', options: ['6 örneğin ortalaması', '6 dakika önceki sıcaklık', 'Bir saat önceki sıcaklık', '6 saat önceki sıcaklık'], answer: 2, why: '6 adım × 10 dakika = 60 dakika: bir saat önceki ölçüm.' },
        { q: 'Günün saatini neden sin ve cos çifti olarak veririz?', options: ['Saat döngüseldir: 23:50 ile 00:10 birbirine yakın olmalı', 'Model negatif sayı sevmez', 'Böylece daha az bellek harcanır', 'Saat bilgisi hiç işe yaramadığı için'], answer: 0, why: 'Tek bir sayı olarak 23,8 ile 0,2 uzaktır; çember üstündeki (sin, cos) noktaları ise komşudur.' },
        { q: 'Hangisi gelecekten bilgi sızdıran bir özelliktir?', options: ['Son 6 örneğin ortalaması', 'Bir önceki ölçüm', 'Şu anki ışık seviyesi', 't − 6 ile t + 6 arasının ortalaması'], answer: 3, why: 'Merkezli ortalama t + 6\'ya kadar bakar; hedefin (t + h) kendisini içerir ve cihazda hesaplanamaz.' },
        { q: 'Ufuk h = 6 iken 1008 örnekten tablo kurulunca neden satır kaybedilir?', options: ['Model 1000\'den fazla satırı kabul etmez', 'Başta gecikmesi, sonda hedefi olmayan ve eksik hücreli satırlar atılır', 'Gece satırları atılır', 'Rastgele örneklenir'], answer: 1, why: 'İlk 6 satırda lag6 yoktur, son 6 satırda x(t + 6) yoktur; NaN içeren satırlar da dürüstçe atılır.' },
      ],
    },
    en: {
      title: 'Feature engineering: from a time series to a table',
      summary: 'Lags, rolling mean and std, a cyclic hour, light and a target horizon: turn a temperature series into a table a model can read, without leaking the future.',
      goals: ['Build lag (t−k) and rolling-window features from a time series', 'Encode the hour of day cyclically with a sin/cos pair', 'Define the target as the value h steps ahead and drop NaN rows honestly', 'Recognise a feature that sees the future (leakage) and catch it with a test'],
      notes: `<p>Linear regression, a decision tree or a neural network: they all want a <b>table</b>. Each row is an example, each column a feature, plus a target column. Sensor data, however, is one long series. Feature engineering builds the bridge between "what I know right now" and "what I want to forecast": the row at time <i>t</i> may only contain values measured at <i>t</i> or before.</p>
<h3>Which features?</h3>
<ul><li><b>Lags</b>: <code>temp_lag1</code>, <code>temp_lag2</code>, <code>temp_lag6</code>. With 10-minute sampling, lag6 is one hour ago. Temperature changes slowly; the recent past is the strongest clue.</li><li><b>Rolling mean and std</b>: the mean of the last 6 samples suppresses noise, and their std tells you "how jumpy the weather is right now" (passing clouds, an opened window).</li><li><b>Cyclic hour</b>: hour 23.8 and hour 0.2 are close in time but far apart as numbers. The pair <code>sin(2πh/24)</code> and <code>cos(2πh/24)</code> puts the hour on a circle; a linear model learns the daily cycle from these two columns.</li><li><b>Light</b>: the LDR value 0..1023, divided by 1023. The greenhouse warms up a little after the sun; light announces the temperature half an hour later.</li></ul>
<div class="eq">row t: [x(t), x(t−1), x(t−2), x(t−3), x(t−6), mean6(t), σ6(t), sin, cos, light(t)] &nbsp;→&nbsp; target: x(t + h)</div>
<h3>Target horizon and dropped rows</h3>
<p>With horizon <i>h</i> = 6 the model forecasts one hour ahead. The first 6 rows of the series have no lags and the last 6 rows have no target: they are dropped. Filling a missing cell with zero tells the model the lie "it was 0 °C at that moment"; interpolation from the cleaning unit or dropping the row are the honest options. From 1008 samples a table of about 990 rows remains.</p>
<h3>Leakage: fake success</h3>
<p>A <b>centred mean</b> (<i>t − h</i> .. <i>t + h</i>), which looks nice on a plot, contains the target itself when used as a feature. Its correlation beats even the strongest real feature and the test error shrinks surprisingly; but on the device the future is not available, so the feature cannot be computed. The symptom of leakage: a single feature that is "too good". The rule is simple: every feature must be a causal function that only looks at the past. Guarantee it with a test, not with words.</p>`,
      code: [featCpp('en'), leakPy('en')],
      lab: 'In the simulation, start with the default features and note the correlation of each feature with the target. Then raise the target horizon from 1 to 12: which lag loses correlation fastest? Turn the hour features off and on and watch how the column count of the table changes. Finally tick the "leaky feature" box: what is its correlation now, and why can it not be computed on the device? Run the Python code below and confirm the same correlations on the CSV.',
      pitfalls: ['Filling a missing cell with 0: the model learns cold moments that never happened.', 'Giving the hour as an integer 0..23: a linear model cannot know that 23:50 and 00:10 are neighbours.', 'Taking the rolling mean centred (like pandas rolling(center=True)): the feature sees the future and the test error is falsely small.', 'Dividing by 1023 in training but feeding the raw LDR value on the device: the same weights are multiplied by an input a thousand times larger.'],
      se: `<p>Feature code lives in two places: in Python during training and in C++ on the device. If the two drift apart the model breaks silently. This is the classic <b>training/serving skew</b> bug.</p>
<ul><li>Keep the feature list (name, lag, scale) in one configuration and let both sides read it.</li><li>Write a <b>golden file test</b> showing that both implementations produce the same vector for the same 20-row input.</li><li>Run the "change the future, past features must not change" test in CI for every new feature.</li></ul>`,
      quiz: [
        { q: 'With 10-minute sampling, what does "temp_lag6" mean?', options: ['The mean of 6 samples', 'The temperature 6 minutes ago', 'The temperature one hour ago', 'The temperature 6 hours ago'], answer: 2, why: '6 steps × 10 minutes = 60 minutes: the reading from one hour ago.' },
        { q: 'Why do we give the hour of day as a sin and cos pair?', options: ['The hour is cyclic: 23:50 and 00:10 should be close', 'Models dislike negative numbers', 'It uses less memory', 'Because hour information is useless'], answer: 0, why: 'As a single number 23.8 and 0.2 are far apart; as (sin, cos) points on a circle they are neighbours.' },
        { q: 'Which of these features leaks information from the future?', options: ['The mean of the last 6 samples', 'The previous reading', 'The current light level', 'The mean from t − 6 to t + 6'], answer: 3, why: 'The centred mean looks up to t + 6; it contains the target (t + h) itself and cannot be computed on the device.' },
        { q: 'With h = 6, why are rows lost when the table is built from 1008 samples?', options: ['The model accepts at most 1000 rows', 'Rows without lags at the start, without a target at the end, and with missing cells are dropped', 'Night rows are dropped', 'Rows are sampled at random'], answer: 1, why: 'The first 6 rows have no lag6, the last 6 rows have no x(t + 6); rows containing NaN are dropped honestly too.' },
      ],
    },
  },
  {
    n: 6, sims: ['egitim'], parts: ['dht22'],
    related: [
      { href: '/makine-ogrenmesi/dogrusal-regresyon', tr: 'ML dersi: doğrusal regresyon', en: 'ML course: linear regression' },
      { href: '/makine-ogrenmesi/karar-agaci', tr: 'ML dersi: karar ağacı', en: 'ML course: decision tree' },
      { href: '/makine-ogrenmesi/asiri-ogrenme', tr: 'ML dersi: aşırı öğrenme', en: 'ML course: overfitting' },
    ],
    py: { file: 'egitim.py', code: PY_TRAIN, data: ['sera-sensorleri'] },
    tr: {
      title: 'Eğit ve değerlendir: ridge, karar kütüğü ve dürüst doğrulama',
      summary: 'Bir saat sonraki sıcaklığı ridge regresyonla tahmin et, "26 °C\'yi aşacak mı?" sorusunu karar kütüğüyle sınıflandır; zaman serisini zamana göre böl ve "değişmez" tabanını geç.',
      goals: ['Standartlaştırılmış özelliklerle ridge regresyonu normal denklemlerle eğitmek', 'MAE, RMSE ve R² değerlerini yorumlamak ve persistence tabanıyla karşılaştırmak', 'Rastgele bölme, boşluklu zaman bölmesi ve kayan pencereli doğrulama arasındaki farkı açıklamak', 'Bir eşik sorusunu karar kütüğüyle sınıflandırıp doğruluğunu ölçmek'],
      notes: `<p>Tablo hazır; şimdi bir model seçip eğitiyoruz. Başlangıç için en dürüst seçim <b>doğrusal model</b>dir: hızlıdır, ağırlıkları okunur ve mikrodenetleyiciye birkaç çarpmayla sığar (7. ünite). ML dersindeki doğrusal regresyon ve karar ağacı derslerinin aynısını burada gerçek sensör verisine uyguluyoruz.</p>
<h3>Ridge regresyon</h3>
<p>Özellikler önce standartlaştırılır (ortalama 0, σ 1), sonra <i>(XᵀX + λI) w = Xᵀy</i> denklemi çözülür. λ küçük bir cezadır: lag1, lag2 ve lag3 neredeyse aynı bilgiyi taşıdığı için ağırlıklar birbirini dengeleyen büyük sayılara kaçabilir; ceza onları makul tutar. Sabit terim cezalanmaz. Eğitimden sonra ağırlıklar ham ölçeğe geri çevrilir ki cihaz ölçekleme yapmadan <i>y = w₀ + Σ wᵢxᵢ</i> hesaplasın.</p>
<h3>Ölçütler ve taban</h3>
<ul><li><b>MAE</b>: ortalama mutlak hata, °C. "Ortalama kaç derece yanılıyorum?"</li><li><b>RMSE</b>: büyük hataları daha çok cezalandırır; birimi yine °C.</li><li><b>R²</b>: varyansın ne kadarını açıkladım? Günlük döngü yüzünden kolayca 0,95 çıkar, tek başına yanıltıcıdır.</li><li><b>Persistence tabanı</b>: "bir saat sonra da şimdiki kadar olacak". Hiç eğitim gerektirmez. Modelin anlamı, bu tabanı ne kadar geçtiğidir.</li></ul>
<div class="eq">beceri = 1 − RMSE<sub>model</sub> / RMSE<sub>taban</sub></div>
<p>Sera verisinde, son %25'i test olarak ayırınca h = 6 için model RMSE yaklaşık 0,68 °C, persistence 1,24 °C çıkar: yaklaşık %45 beceri. h = 1 için fark küçüktür (0,34 ve 0,42): on dakika sonrası zaten şimdiye çok benzer.</p>
<h3>Zaman serisini nasıl bölmeli?</h3>
<p><b>Rastgele bölme</b>de test satırının komşuları eğitimdedir; model "dün ile yarını" görmüş gibi olur. <b>Zamana göre bölme</b>de geçmişle eğitilir, gelecekle test edilir; ikisinin arasına ufuk kadar <b>boşluk</b> konur, çünkü eğitimin son satırının hedefi testin ilk satırlarına uzanır. <b>Kayan pencereli doğrulama</b> (walk-forward) bunu birkaç kez tekrarlar: her katta geçmişin tamamıyla eğit, hemen sonraki bloğu test et. Böylece tek bir şanslı günün sonucu yanıltmaz.</p>
<h3>Sınıflandırma: karar kütüğü</h3>
<p>Bazen soru sayı değil evet/hayırdır: "bir saat sonra 26 °C'yi aşacak mı?" Tek bölmeli karar ağacı (kütük) en iyi eşiği arar; sera verisinde seçtiği özellik şimdiki sıcaklıktır, eşik yaklaşık 24,8 °C ve test doğruluğu 0,94 civarıdır. Python kodundaki sade sürüm Gini yerine hata oranını küçülttüğü için biraz farklı bir eşik bulabilir. Sınıflar dengesizdir (sıcak saatler azdır): doğruluğun yanında kesinlik ve duyarlılığa da bak.</p>`,
      code: [walkPy('tr'), stumpCpp('tr')],
      lab: 'Simülasyonda regresyon kipinde ufku 6 yap ve önce rastgele bölmeyi, sonra zamana göre bölmeyi seç: RMSE nasıl değişti ve hangisine güvenirsin? Kayan pencereli doğrulamayı aç ve katlar arasındaki farkı yorumla. Modelin "değişmez" tabanını kaç yüzde geçtiğini yaz. Sonra sınıflandırma kipine geç: kütük hangi özelliği ve eşiği seçti, kesinlik ve duyarlılık kaç? Python kodunu çalıştırıp aynı karşılaştırmayı CSV üzerinde yap.',
      pitfalls: ['Zaman serisini rastgele bölüp çıkan hatayı rapor etmek: komşu satırlar eğitimde olduğu için sonuç iyimserdir.', 'Zaman bölmesinde boşluk bırakmamak: eğitimin son hedefleri test dönemine taşar.', 'Persistence tabanını hiç hesaplamamak: R² = 0,96 etkileyici görünür ama taban zaten 0,9\'u veriyor olabilir.', 'Standartlaştırmanın ortalama ve σ değerlerini tüm veriden hesaplamak: test döneminin bilgisi eğitime sızar.'],
      se: `<p>Değerlendirme kodu da üretim kodudur: bir hata, yanlış bir modeli sahaya gönderir.</p>
<ul><li>Bölme fonksiyonları için <b>özellik testleri</b> yaz: "testteki her indeks eğitimdeki her indeksten en az h büyük".</li><li>Her deneyde veri sürümü, özellik listesi, bölme ve ölçütleri bir <b>deney kaydı</b>na yaz; tekrarlanamayan bir sonuç sonuç değildir.</li><li>Modelin tabanı geçemediği durumda CI'ın kırmızıya dönmesi bir <b>kabul ölçütü</b>dür.</li></ul>`,
      quiz: [
        { q: 'Persistence tabanı neyi tahmin eder?', options: ['Eğitim verisinin ortalamasını', 'h adım sonra değerin şimdiki değerle aynı olacağını', 'Dünün aynı saatini', 'Sıfırı'], answer: 1, why: '"Değişmez" tahmini: x(t + h) ≈ x(t). Eğitim gerektirmez; modelin bunu geçmesi gerekir.' },
        { q: 'Zaman serisinde rastgele bölme neden yanıltıcıdır?', options: ['Daha yavaş çalışır', 'Eğitim kümesi küçülür', 'Model daha basit olur', 'Test satırlarının hemen komşuları eğitimde olduğu için hata iyimser çıkar'], answer: 3, why: 'Sıcaklık 10 dakikada az değişir; komşusunu görmüş model gelecekle karşılaşmamış olur.' },
        { q: 'Model RMSE 0,68 °C, persistence 1,24 °C. Beceri yaklaşık kaçtır?', options: ['%45', '%55', '%68', '%124'], answer: 0, why: '1 − 0,68 / 1,24 ≈ 0,45.' },
        { q: 'Ridge regresyondaki λ cezası ne işe yarar?', options: ['Sabit terimi sıfırlar', 'Satır sayısını azaltır', 'Birbirine çok benzeyen özelliklerde ağırlıkların aşırı büyümesini engeller', 'Sınıflandırmayı mümkün kılar'], answer: 2, why: 'lag1, lag2, lag3 neredeyse aynıdır; ceza, birbirini dengeleyen büyük ağırlıkları makul tutar.' },
      ],
    },
    en: {
      title: 'Train and evaluate: ridge, a decision stump and honest validation',
      summary: 'Forecast the temperature one hour ahead with ridge regression, classify "will it exceed 26 °C?" with a decision stump; split the time series by time and beat the "no change" baseline.',
      goals: ['Train ridge regression on standardised features with the normal equations', 'Interpret MAE, RMSE and R² and compare them with the persistence baseline', 'Explain the difference between a random split, a time split with a gap and walk-forward validation', 'Classify a threshold question with a decision stump and measure its accuracy'],
      notes: `<p>The table is ready; now we pick a model and train it. The most honest first choice is a <b>linear model</b>: it is fast, its weights are readable and it fits on a microcontroller in a few multiplications (unit 7). We apply exactly the linear regression and decision tree lessons of the ML course to real sensor data here.</p>
<h3>Ridge regression</h3>
<p>The features are first standardised (mean 0, σ 1), then the equation <i>(XᵀX + λI) w = Xᵀy</i> is solved. λ is a small penalty: lag1, lag2 and lag3 carry almost the same information, so the weights can run off into large numbers that cancel each other; the penalty keeps them reasonable. The bias is not penalised. After training, the weights are converted back to raw scale so the device computes <i>y = w₀ + Σ wᵢxᵢ</i> without any scaling.</p>
<h3>Metrics and the baseline</h3>
<ul><li><b>MAE</b>: mean absolute error, in °C. "How many degrees am I off on average?"</li><li><b>RMSE</b>: punishes large errors more; its unit is still °C.</li><li><b>R²</b>: how much of the variance did I explain? Because of the daily cycle it easily reaches 0.95, which is misleading on its own.</li><li><b>Persistence baseline</b>: "in an hour it will be the same as now". It needs no training. The point of the model is how far it beats this baseline.</li></ul>
<div class="eq">skill = 1 − RMSE<sub>model</sub> / RMSE<sub>baseline</sub></div>
<p>On the greenhouse data, holding out the last 25% as the test set, h = 6 gives a model RMSE of about 0.68 °C against 1.24 °C for persistence: roughly 45% skill. For h = 1 the gap is small (0.34 and 0.42): ten minutes ahead already looks very much like now.</p>
<h3>How to split a time series?</h3>
<p>In a <b>random split</b> the neighbours of a test row are in the training set; the model has as good as seen "yesterday and tomorrow". In a <b>time split</b> you train on the past and test on the future, with a <b>gap</b> the size of the horizon in between, because the targets of the last training rows reach into the first test rows. <b>Walk-forward validation</b> repeats this several times: in each fold train on all of the past, test on the very next block. That way the result of one lucky day does not mislead you.</p>
<h3>Classification: a decision stump</h3>
<p>Sometimes the question is not a number but yes/no: "will it exceed 26 °C in an hour?" A one-split decision tree (a stump) searches for the best threshold; on the greenhouse data it picks the current temperature, a threshold of about 24.8 °C and a test accuracy around 0.94. The plain version in the Python code minimises the error rate instead of Gini, so it may find a slightly different threshold. The classes are imbalanced (hot hours are rare): look at precision and recall as well as accuracy.</p>`,
      code: [walkPy('en'), stumpCpp('en')],
      lab: 'In the simulation, in regression mode set the horizon to 6 and pick first the random split, then the time-based split: how did the RMSE change and which one do you trust? Turn on walk-forward validation and interpret the differences between folds. Write down by what percentage the model beats the "no change" baseline. Then switch to classification mode: which feature and threshold did the stump choose, and what are precision and recall? Run the Python code and repeat the comparison on the CSV.',
      pitfalls: ['Splitting a time series at random and reporting that error: neighbouring rows are in training, so the result is optimistic.', 'Leaving no gap in a time split: the last training targets spill into the test period.', 'Never computing the persistence baseline: R² = 0.96 looks impressive, but the baseline may already give 0.9.', 'Computing the standardisation mean and σ on all the data: information from the test period leaks into training.'],
      se: `<p>Evaluation code is production code too: a bug sends the wrong model to the field.</p>
<ul><li>Write <b>property tests</b> for the split functions: "every test index is at least h larger than every training index".</li><li>Record the data version, feature list, split and metrics of every run in an <b>experiment log</b>; a result you cannot reproduce is not a result.</li><li>CI turning red when the model fails to beat the baseline is an <b>acceptance criterion</b>.</li></ul>`,
      quiz: [
        { q: 'What does the persistence baseline forecast?', options: ['The mean of the training data', 'That the value h steps ahead equals the current value', 'The same hour yesterday', 'Zero'], answer: 1, why: 'The "no change" forecast: x(t + h) ≈ x(t). It needs no training; the model has to beat it.' },
        { q: 'Why is a random split misleading on a time series?', options: ['It runs slower', 'The training set gets smaller', 'The model becomes simpler', 'The immediate neighbours of test rows are in training, so the error is optimistic'], answer: 3, why: 'Temperature changes little in 10 minutes; a model that has seen the neighbour has not really faced the future.' },
        { q: 'Model RMSE is 0.68 °C, persistence 1.24 °C. What is the skill, roughly?', options: ['45%', '55%', '68%', '124%'], answer: 0, why: '1 − 0.68 / 1.24 ≈ 0.45.' },
        { q: 'What does the λ penalty in ridge regression do?', options: ['Sets the bias to zero', 'Reduces the number of rows', 'Stops weights from blowing up when features are very similar', 'Makes classification possible'], answer: 2, why: 'lag1, lag2 and lag3 are almost the same; the penalty keeps large cancelling weights reasonable.' },
      ],
    },
  },
  {
    n: 7, sims: ['yerlestirme'], parts: ['esp32-esp32-wroom-devkit', 'arduino-uno-atmega328p', 'esp32-s3-tinyml'], wokwi: true,
    related: [
      { href: '/makine-ogrenmesi/model-damitma', tr: 'ML dersi: model damıtma', en: 'ML course: model distillation' },
      { href: '/muhendislik/iot', tr: 'ESP32 ile Nesnelerin İnterneti dersi', en: 'Internet of Things with the ESP32 course' },
    ],
    py: { file: 'disa_aktar.py', code: PY_EXPORT, data: ['sera-sensorleri'] },
    tr: {
      title: 'Modeli mikrodenetleyiciye taşı: ağırlıklardan C koduna',
      summary: 'Eğitilmiş doğrusal modelden C fonksiyonu üret: FPU\'lu ESP32 için float, FPU\'su olmayan Uno için Q-biçiminde sabit noktalı tamsayı. Nicemleme hatasını, taşma payını, bellek ve süreyi ölç.',
      goals: ['Eğitilmiş ağırlıklardan derlenebilir bir C fonksiyonu üretmek', 'Q-biçiminde sabit noktalı aritmetiği ve santi-birim girdileri açıklamak', 'Nicemleme hatasını ve int32 taşma payını hesaplamak', 'Float ve sabit noktalı modelin bellek ve süre maliyetini karşılaştırmak'],
      notes: `<p>Model bulutta da çalışabilir; ama ağ koptuğunda serayı korumak, pili korumak ve gecikmeyi sıfıra indirmek için tahmini <b>cihazın üstünde</b> yapmak isteriz. Doğrusal model bunun için idealdir: on özellikli bir model on çarpma ve on toplamadır, 44 baytlık ağırlık tablosudur.</p>
<h3>ESP32: float yeterli</h3>
<p>ESP32'nin tek duyarlıklı kayan nokta birimi (FPU) vardır. Python'daki ağırlıkları doğrudan <code>float</code> sabitleri olarak yazmak yeterlidir; bir tahmin mikrosaniyenin altında biter. Üretilen kodun tek şartı, girdilerin eğitimdeki ölçekte gelmesidir (ışık 0..1, saat sin/cos).</p>
<h3>Uno: sabit noktalı tamsayı</h3>
<p>ATmega328P'nin FPU'su yoktur; her float çarpması yazılımla, yüzlerce çevrimde yapılır. Çözüm <b>sabit nokta</b>dır:</p>
<ul><li>Girdiler santi-birim <code>int16_t</code>: 23,45 °C → 2345. Işık 0..1 → 0..100.</li><li>Ağırlıklar <b>Q-biçimi</b>nde <code>int32_t</code>: <i>w<sub>q</sub> = round(w · 2<sup>q</sup>)</i>. q = 12 için 0,7955 → 3258.</li><li>Toplam <code>int32_t</code> biriktiricide yapılır, sonunda <code>acc &gt;&gt; q</code> ile geri ölçeklenir.</li></ul>
<div class="eq">ŷ<sub>santi</sub> = (B + Σ W<sub>i</sub> · x<sub>i</sub>) &gt;&gt; q &nbsp;&nbsp; B = round(w₀ · 100 · 2<sup>q</sup>)</div>
<h3>İki risk: nicemleme ve taşma</h3>
<p><b>Nicemleme hatası</b>: her ağırlık en çok 2<sup>−q−1</sup> kadar yuvarlanır. Sera modelinde q = 12 ile en büyük fark yaklaşık 0,01–0,04 °C'dir, sensörün kendi gürültüsünden çok küçük. q'yu 4'e indirirsen hata derecelere çıkar. <b>Taşma</b>: q büyüdükçe ağırlıklar büyür; en kötü girdide <i>|B| + Σ |W<sub>i</sub>| · max|x<sub>i</sub>|</i> toplamı 2³¹ − 1'i aşarsa sonuç sessizce eksiye döner. Bu sınırı üretim anında hesaplayıp kodun yanına yaz.</p>
<h3>Daha büyük modeller: TinyML</h3>
<p>Doğrusal model yetmezse küçük bir sinir ağı da cihaza sığar. TensorFlow Lite Micro gibi çatılar ağırlıkları int8'e nicemler ve ESP32-S3'ün vektör komutlarını kullanır. İlke aynıdır: eğitim bilgisayarda, çıkarım cihazda; nicemlemenin bedeli ölçülür, tahmin edilmez.</p>`,
      code: [floatCpp('tr'), fixedCpp('tr')],
      lab: 'Simülasyonda önce float hedefini (ESP32) seç ve üretilen C fonksiyonunu oku. Sonra sabit noktalı hedefe (Uno) geç ve Q bit sayısını 12\'den 4\'e, sonra 20\'ye taşı: en büyük nicemleme hatası ve int32 taşma payı nasıl değişti? Hatanın 0,05 °C altında, taşma payının güvenli olduğu en küçük q\'yu bul. Python kodunu çalıştır, kendi ağırlıklarınla üretilen C kodunu Wokwi\'deki bir Uno ya da ESP32 projesine yapıştırıp seri çıktıyı karşılaştır.',
      pitfalls: ['Cihazda girdiyi eğitimdekinden farklı ölçekte vermek (ışığı 0..1023 olarak): model tutarlı ama yanlış tahmin üretir.', 'Uno\'da float kullanıp sürenin önemsiz olduğunu varsaymak: özellik hesabıyla birlikte milisaniyelere çıkabilir.', 'Taşma payını hesaplamadan q\'yu büyütmek: uç bir girdide toplam int32 sınırını aşar ve tahmin eksiye döner.', 'Ağırlıkları elle kopyalamak: model yeniden eğitilince C dosyası eski kalır; kodu betikle üret.'],
      se: `<p>Üretilen kod, elle yazılan koddan daha güvenilir olabilir; yeter ki üreticinin kendisi test edilsin.</p>
<ul><li>Üreticiyle birlikte aynı tamsayı hesabını yapan bir <b>referans uygulama</b> yaz ve ikisinin bin rastgele girdide bit bit aynı sonucu verdiğini test et.</li><li>Üretilen dosyaya model sürümü, eğitim tarihi ve q değerini <b>yorum olarak</b> göm; sahadaki cihazın hangi modeli çalıştırdığı bilinmeli.</li><li>Model değişince C dosyasını CI üretsin; elle düzenleme yasak olsun.</li></ul>`,
      quiz: [
        { q: 'q = 12 ile 0,75 ağırlığı Q-biçiminde hangi tamsayıdır?', options: ['75', '750', '4096', '3072'], answer: 3, why: 'round(0,75 · 4096) = 3072.' },
        { q: 'Arduino Uno\'da sabit noktalı model neden tercih edilir?', options: ['Daha doğru sonuç verir', 'ATmega328P\'de FPU yoktur, float çarpması yazılımla ve yavaş yapılır', 'C dili float desteklemez', 'Ağırlıklar daha az yer kaplar'], answer: 1, why: 'Donanım kayan nokta birimi yoktur; tamsayı çarpması çok daha az çevrim sürer.' },
        { q: 'q değerini çok büyütmenin riski nedir?', options: ['Kod derlenmez', 'Nicemleme hatası artar', 'Biriktiricideki toplam int32 sınırını aşabilir', 'Girdi ölçeği değişir'], answer: 2, why: 'Ağırlıklar 2^q ile büyür; en kötü girdide toplam 2³¹ − 1\'i aşarsa sonuç sessizce bozulur.' },
        { q: 'Santi-birim girdide 23,45 °C hangi int16 değeridir?', options: ['2345', '23', '234', '23450'], answer: 0, why: 'Santi-birim = ×100: 23,45 · 100 = 2345.' },
      ],
    },
    en: {
      title: 'Move the model to a microcontroller: from weights to C code',
      summary: 'Generate a C function from the trained linear model: float for the ESP32 with its FPU, fixed-point integers in Q format for the Uno without one. Measure the quantisation error, overflow headroom, memory and time.',
      goals: ['Generate a compilable C function from trained weights', 'Explain Q-format fixed-point arithmetic and centi-unit inputs', 'Compute the quantisation error and the int32 overflow headroom', 'Compare the memory and time cost of the float and fixed-point models'],
      notes: `<p>The model could run in the cloud; but to protect the greenhouse when the network drops, to save battery and to cut latency to zero we want to forecast <b>on the device</b>. A linear model is ideal for this: a ten-feature model is ten multiplications and ten additions, a 44-byte weight table.</p>
<h3>ESP32: float is enough</h3>
<p>The ESP32 has a single-precision floating-point unit (FPU). Writing the Python weights directly as <code>float</code> constants is enough; one forecast finishes in under a microsecond. The only requirement of the generated code is that the inputs arrive in the training scale (light 0..1, hour as sin/cos).</p>
<h3>Uno: fixed-point integers</h3>
<p>The ATmega328P has no FPU; every float multiplication is done in software, in hundreds of cycles. The solution is <b>fixed point</b>:</p>
<ul><li>Inputs as centi-unit <code>int16_t</code>: 23.45 °C → 2345. Light 0..1 → 0..100.</li><li>Weights in <b>Q format</b> as <code>int32_t</code>: <i>w<sub>q</sub> = round(w · 2<sup>q</sup>)</i>. For q = 12, 0.7955 → 3258.</li><li>The sum is accumulated in an <code>int32_t</code> and scaled back at the end with <code>acc &gt;&gt; q</code>.</li></ul>
<div class="eq">ŷ<sub>centi</sub> = (B + Σ W<sub>i</sub> · x<sub>i</sub>) &gt;&gt; q &nbsp;&nbsp; B = round(w₀ · 100 · 2<sup>q</sup>)</div>
<h3>Two risks: quantisation and overflow</h3>
<p><b>Quantisation error</b>: each weight is rounded by at most 2<sup>−q−1</sup>. In the greenhouse model q = 12 gives a largest difference of about 0.01–0.04 °C, far smaller than the sensor noise itself. Drop q to 4 and the error grows to degrees. <b>Overflow</b>: as q grows the weights grow; if <i>|B| + Σ |W<sub>i</sub>| · max|x<sub>i</sub>|</i> exceeds 2³¹ − 1 for the worst input, the result silently turns negative. Compute this bound at generation time and write it next to the code.</p>
<h3>Bigger models: TinyML</h3>
<p>If a linear model is not enough, a small neural network fits on the device too. Frameworks such as TensorFlow Lite Micro quantise the weights to int8 and use the vector instructions of the ESP32-S3. The principle is the same: training on the computer, inference on the device; the cost of quantisation is measured, not guessed.</p>`,
      code: [floatCpp('en'), fixedCpp('en')],
      lab: 'In the simulation, first pick the float target (ESP32) and read the generated C function. Then switch to the fixed-point target (Uno) and move the number of Q bits from 12 down to 4, then up to 20: how did the largest quantisation error and the int32 overflow headroom change? Find the smallest q with an error below 0.05 °C and safe headroom. Run the Python code, paste the C code generated from your own weights into an Uno or ESP32 project in Wokwi and compare the serial output.',
      pitfalls: ['Feeding the input on the device in a different scale than in training (light as 0..1023): the model produces consistent but wrong forecasts.', 'Using float on the Uno and assuming the time is negligible: together with feature computation it can reach milliseconds.', 'Raising q without computing the overflow headroom: on an extreme input the sum exceeds the int32 limit and the forecast turns negative.', 'Copying weights by hand: when the model is retrained the C file stays stale; generate the code with a script.'],
      se: `<p>Generated code can be more reliable than hand-written code, as long as the generator itself is tested.</p>
<ul><li>Write a <b>reference implementation</b> that does the same integer arithmetic as the generator, and test that both give bit-identical results on a thousand random inputs.</li><li>Embed the model version, training date and q value in the generated file <b>as comments</b>; you must know which model a device in the field is running.</li><li>Let CI generate the C file when the model changes; forbid hand edits.</li></ul>`,
      quiz: [
        { q: 'With q = 12, which integer is the weight 0.75 in Q format?', options: ['75', '750', '4096', '3072'], answer: 3, why: 'round(0.75 · 4096) = 3072.' },
        { q: 'Why is a fixed-point model preferred on the Arduino Uno?', options: ['It gives more accurate results', 'The ATmega328P has no FPU, so float multiplication is done slowly in software', 'C does not support float', 'The weights take less space'], answer: 1, why: 'There is no hardware floating-point unit; integer multiplication takes far fewer cycles.' },
        { q: 'What is the risk of making q very large?', options: ['The code does not compile', 'The quantisation error grows', 'The accumulated sum can exceed the int32 limit', 'The input scale changes'], answer: 2, why: 'Weights grow with 2^q; if the worst-case sum exceeds 2³¹ − 1 the result is silently corrupted.' },
        { q: 'As a centi-unit input, which int16 value is 23.45 °C?', options: ['2345', '23', '234', '23450'], answer: 0, why: 'Centi-units = ×100: 23.45 · 100 = 2345.' },
      ],
    },
  },
  {
    n: 8, sims: ['anomali'], parts: ['esp32-esp32-wroom-devkit', 'dht22'], wokwi: true,
    related: [
      { href: '/muhendislik/iot', tr: 'ESP32 ile Nesnelerin İnterneti: MQTT ile uyarı göndermek', en: 'Internet of Things with the ESP32: sending alerts over MQTT' },
      { href: '/makine-ogrenmesi/kesinlik-duyarlilik', tr: 'ML dersi: kesinlik ve duyarlılık', en: 'ML course: precision and recall' },
    ],
    py: { file: 'anomali.py', code: PY_ANOMALY, data: ['sera-sensorleri'] },
    tr: {
      title: 'Sıcaklık tahmini ve anomali uyarısı: bitirme projesine hazırlık',
      summary: 'Tahmin artığını eğitimdeki dağılımla z-skoruna çevir; histerezis, ardışık örnek ve bekleme süresiyle uyarı üret. 5. gündeki ısıtıcı arızasını yakala, yanlış alarmı az tut, uyarıyı MQTT ile gönder.',
      goals: ['Tahmin artığından z-skoru hesaplayıp bir anomali puanına çevirmek', 'Histerezisli, ardışık örnekli ve beklemeli bir uyarı durum makinesi kurmak', 'Bir uyarı sistemini yakalama, gecikme ve yanlış alarm sayısıyla değerlendirmek', 'Uç hattı (temizle, özellik, tahmin, uyarı) cihazda ve MQTT ile uçtan uca bağlamak'],
      notes: `<p>Şimdiye kadar "bir saat sonra kaç derece olacak?" diye sorduk. Bu ünitede soruyu tersine çeviriyoruz: <b>gerçekleşen değer, beklediğimden ne kadar farklı?</b> İyi bir tahmin modeli, normal davranışın ölçüsüdür; modelin açıklayamadığı sapma ise bir şeylerin ters gittiğinin işaretidir.</p>
<h3>Hat</h3>
<ul><li><b>Temizle</b>: Hampel süzgeciyle sıçramaları sil, doğrusal ara değerle boşlukları doldur (2. ünite).</li><li><b>Özellik ve tahmin</b>: aynı özellik tablosu, ilk dört gün (arızasız) ile eğitilmiş doğrusal model (5–6. üniteler).</li><li><b>Artık</b>: <i>r = gerçek − tahmin</i>. Eğitim dönemindeki artıkların ortalaması μ ve sapması σ hesaplanır.</li><li><b>Puan</b>: <i>z = (r − μ) / σ</i>. Normal günlerde |z| çoğunlukla 2'nin altındadır.</li></ul>
<div class="eq">z(t) = (x(t) − x̂(t) − μ) / σ &nbsp;&nbsp; σ: eğitim artıklarının sapması</div>
<h3>Puanı uyarıya çevirmek</h3>
<p>Tek bir eşik iki sorun çıkarır: eşiğin çevresinde salınan puan uyarıyı açıp kapatıp durur, tek bir gürültülü örnek de alarm çaldırır. Üç önlem:</p>
<ul><li><b>Histerezis</b>: açma eşiği 3, kapama eşiği 1,5. Uyarı bir kez açılınca puan iyice düşmeden kapanmaz.</li><li><b>Ardışık örnek</b>: eşik en az 2 örnek art arda aşılmalı; tek sıçrama yetmez.</li><li><b>Bekleme</b>: bir uyarıdan sonra 3 saat yeni bildirim gönderilmez; telefonu susturan kullanıcı sistemi kapatır.</li></ul>
<h3>Değerlendirme</h3>
<p>Veri setinde 5. günün 13:00–19:00 arası takılı kalan bir ısıtıcı vardır (<code>ariza = 1</code>). Bir uyarı sistemini üç sayıyla ölçeriz: arıza <b>yakalandı mı</b>, arıza başladıktan kaç dakika sonra (<b>gecikme</b>) ve arıza penceresi dışında kaç <b>yanlış alarm</b> çaldı. Bunlar birbirine karşı çalışır: eşiği düşürmek gecikmeyi kısaltır ama yanlış alarmı artırır. Ufuk da önemlidir: 30 dakikalık tahminde rampa daha erken sezilir, 10 dakikalıkta model sapmaya hızla uyar ve geç fark eder.</p>
<h3>Uyarı nereye gider?</h3>
<p>Cihaz her örnekte puanı panoya, uyarıyı ise ayrı bir konuya <b>retained</b> olarak yayımlar: sonradan bağlanan bir telefon son uyarıyı hemen görür. IoT dersindeki MQTT broker'ı, konu düzeni ve son vasiyet aynen kullanılır; bitirme projesinde bu hattı uçtan uca kuracaksın.</p>`,
      code: [alarmCpp('tr'), mqttCpp('tr')],
      lab: 'Simülasyonda varsayılan ayarlarla 5. gündeki ısıtıcı arızasının yakalandığını ve gecikmeyi not et. Açma eşiğini 2\'ye indir: kaç yanlış alarm çıktı? Ardışık örnek sayısını 1, 2 ve 4 yaparak gecikme ile yanlış alarm arasındaki dengeyi yaz. Bekleme süresini 0 yapınca aynı olay için kaç bildirim geliyor? Sıfır yanlış alarm ve en kısa gecikmeyi veren ayarı bul, sonra Python kodunu çalıştırıp aynı sonucu CSV üzerinde doğrula.',
      pitfalls: ['σ\'yı arızalı dönemi de içeren tüm veriden hesaplamak: arıza σ\'yı büyütür ve kendi uyarısını bastırır.', 'Artığı tahminin yapıldığı satıra yazmak: artık h adım sonraki gerçek değere aittir, zamanı kaydırmak gerekir.', 'Açma ve kapama eşiğini aynı yapmak: eşik çevresinde salınan puan uyarıyı sürekli açıp kapatır.', 'Bekleme süresi koymamak: tek bir olay için onlarca bildirim gelir ve kullanıcı uyarıları kapatır.'],
      se: `<p>Uyarı sistemi bir <b>durum makinesi</b>dir; durum makineleri tablo testleriyle sınanır.</p>
<ul><li>Elle yazılmış kısa puan dizileriyle test yaz: "tek sıçrama uyarı açmaz", "iki ardışık örnek açar", "bekleme içinde ikinci bildirim yok".</li><li>Uyarıyı gönderen kod ile karar veren kodu ayır; karar saf fonksiyon olsun, MQTT yalnız bir çıkış.</li><li>Sahadaki yanlış alarmları etiketleyip veri setine geri ekle; eşikler sürüm numarasıyla değişsin.</li></ul>`,
      quiz: [
        { q: 'Artığın z-skoru hangi σ ile hesaplanmalıdır?', options: ['Arızasız eğitim dönemindeki artıkların σ\'sı', 'Tüm verideki sıcaklığın σ\'sı', 'Sensör belgesindeki doğruluk', 'Test dönemindeki artıkların σ\'sı'], answer: 0, why: 'Normal davranışın ölçüsü eğitim artıklarıdır; arızalı veri σ\'yı büyütüp uyarıyı bastırır.' },
        { q: 'Histerezis (açma 3, kapama 1,5) neyi önler?', options: ['Arızanın hiç yakalanmamasını', 'Modelin aşırı öğrenmesini', 'Eşik çevresinde salınan puanın uyarıyı sürekli açıp kapatmasını', 'Taşmayı'], answer: 2, why: 'Uyarı bir kez açılınca puan kapama eşiğinin altına inene kadar açık kalır.' },
        { q: 'Açma eşiğini 3\'ten 2\'ye düşürmenin olası etkisi nedir?', options: ['Gecikme artar, yanlış alarm azalır', 'Gecikme kısalır, yanlış alarm artar', 'Hiçbir şey değişmez', 'Model yeniden eğitilir'], answer: 1, why: 'Daha düşük eşik sapmayı erken yakalar ama normal gürültünün de eşiği aşma olasılığı artar.' },
        { q: 'Uyarıyı MQTT\'de retained bayrağıyla yayımlamak ne sağlar?', options: ['Mesaj şifrelenir', 'Mesaj iki kez teslim edilir', 'Broker mesajı siler', 'Sonradan abone olan istemci son uyarıyı hemen alır'], answer: 3, why: 'Broker konu başına son retained mesajı saklar ve yeni aboneye hemen iletir.' },
      ],
    },
    en: {
      title: 'Temperature forecast and anomaly alert: preparing the capstone',
      summary: 'Turn the forecast residual into a z-score with the training distribution; raise alerts with hysteresis, consecutive samples and a cooldown. Catch the heater fault on day 5, keep false alarms low and send the alert over MQTT.',
      goals: ['Compute a z-score from the forecast residual and use it as an anomaly score', 'Build an alert state machine with hysteresis, consecutive samples and a cooldown', 'Evaluate an alert system by catch, delay and false alarm count', 'Connect the full pipeline (clean, features, forecast, alert) on the device and over MQTT end to end'],
      notes: `<p>So far we asked "how warm will it be in an hour?". In this unit we turn the question around: <b>how different is the actual value from what I expected?</b> A good forecasting model is a measure of normal behaviour; a deviation the model cannot explain is a sign that something is going wrong.</p>
<h3>Pipeline</h3>
<ul><li><b>Clean</b>: remove spikes with a Hampel filter and fill gaps by linear interpolation (unit 2).</li><li><b>Features and forecast</b>: the same feature table and a linear model trained on the first four (fault-free) days (units 5–6).</li><li><b>Residual</b>: <i>r = actual − forecast</i>. The mean μ and std σ of the residuals in the training period are computed.</li><li><b>Score</b>: <i>z = (r − μ) / σ</i>. On normal days |z| stays mostly below 2.</li></ul>
<div class="eq">z(t) = (x(t) − x̂(t) − μ) / σ &nbsp;&nbsp; σ: std of the training residuals</div>
<h3>Turning the score into an alert</h3>
<p>A single threshold causes two problems: a score hovering around the threshold keeps switching the alert on and off, and a single noisy sample sets off the alarm. Three remedies:</p>
<ul><li><b>Hysteresis</b>: on threshold 3, off threshold 1.5. Once the alert is on it does not switch off until the score has clearly dropped.</li><li><b>Consecutive samples</b>: the threshold must be exceeded for at least 2 samples in a row; one spike is not enough.</li><li><b>Cooldown</b>: after an alert no new notification is sent for 3 hours; a user whose phone keeps buzzing turns the system off.</li></ul>
<h3>Evaluation</h3>
<p>The dataset has a heater stuck on from 13:00 to 19:00 on day 5 (<code>ariza = 1</code>). We measure an alert system with three numbers: was the fault <b>caught</b>, how many minutes after the fault began (<b>delay</b>), and how many <b>false alarms</b> fired outside the fault window. They work against each other: lowering the threshold shortens the delay but adds false alarms. The horizon matters too: with a 30-minute forecast the ramp is noticed earlier, with a 10-minute one the model adapts to the deviation quickly and notices late.</p>
<h3>Where does the alert go?</h3>
<p>The device publishes the score to the dashboard at every sample and the alert to a separate topic as <b>retained</b>: a phone that connects later sees the last alert at once. The MQTT broker, topic layout and last will from the IoT course are reused as they are; in the capstone you will build this pipeline end to end.</p>`,
      code: [alarmCpp('en'), mqttCpp('en')],
      lab: 'In the simulation, with the default settings, note that the heater fault on day 5 is caught and note the delay. Lower the on threshold to 2: how many false alarms appear? Set the consecutive samples to 1, 2 and 4 and write down the trade-off between delay and false alarms. With a cooldown of 0, how many notifications arrive for the same event? Find the setting with zero false alarms and the shortest delay, then run the Python code and confirm the same result on the CSV.',
      pitfalls: ['Computing σ from all the data, including the faulty period: the fault inflates σ and suppresses its own alert.', 'Writing the residual on the row where the forecast was made: the residual belongs to the actual value h steps later, so the time must be shifted.', 'Making the on and off thresholds equal: a score hovering around the threshold keeps switching the alert on and off.', 'Having no cooldown: dozens of notifications arrive for one event and the user turns alerts off.'],
      se: `<p>An alert system is a <b>state machine</b>; state machines are tested with table tests.</p>
<ul><li>Write tests with short hand-written score sequences: "one spike does not raise an alert", "two consecutive samples do", "no second notification during the cooldown".</li><li>Separate the code that sends the alert from the code that decides; the decision is a pure function, MQTT is just an output.</li><li>Label false alarms from the field and add them back to the dataset; change thresholds with a version number.</li></ul>`,
      quiz: [
        { q: 'With which σ should the residual z-score be computed?', options: ['The σ of the residuals in the fault-free training period', 'The σ of the temperature over all the data', 'The accuracy from the sensor datasheet', 'The σ of the residuals in the test period'], answer: 0, why: 'The training residuals measure normal behaviour; faulty data inflates σ and suppresses the alert.' },
        { q: 'What does hysteresis (on 3, off 1.5) prevent?', options: ['The fault never being caught', 'The model overfitting', 'A score hovering around the threshold switching the alert on and off', 'Overflow'], answer: 2, why: 'Once the alert is on, it stays on until the score drops below the off threshold.' },
        { q: 'What is the likely effect of lowering the on threshold from 3 to 2?', options: ['Longer delay, fewer false alarms', 'Shorter delay, more false alarms', 'Nothing changes', 'The model is retrained'], answer: 1, why: 'A lower threshold catches the deviation earlier, but normal noise is also more likely to cross it.' },
        { q: 'What does publishing the alert with the MQTT retained flag give you?', options: ['The message is encrypted', 'The message is delivered twice', 'The broker deletes the message', 'A client that subscribes later receives the last alert at once'], answer: 3, why: 'The broker keeps the last retained message per topic and delivers it to a new subscriber immediately.' },
      ],
    },
  },
]
