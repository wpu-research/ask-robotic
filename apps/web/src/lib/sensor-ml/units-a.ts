// Sensör verisinden ML dersi, üniteler 1–4: zaman serisi toplama, temizleme, Kalman'a giriş, gömülü veri analizi ve
// görselleştirme. HTML iki dilde aynı etiket dizisinde; kod aynı, yalnız yorumlar çevrilir. Python kodu Pyodide'de (yalnız
// NumPy) sera-sensorleri.csv üzerinde çalışır; notlardaki sayılar lib/sensor-ml üreteciyle aynıdır.
import type { SensorSimId } from '@/components/sensor-ml/sim-meta'
import type { CourseUnit } from '@/lib/kurs/types'
import type { CodeBlock } from '@/lib/robotik/course'
import type { CodeLine } from '@/lib/ml/core'

type L = 'tr' | 'en'
const cm = (l: L, tr: string, en: string) => (l === 'tr' ? tr : en)

// --- Kod blokları (C++ cihaz tarafı ve Python) ---------------------------------------------------------------------------

const loggerCpp = (l: L): CodeBlock => ({
  title: cm(l, 'ESP32: 10 dakikada bir CSV satırı (Arduino C++)', 'ESP32: one CSV line every 10 minutes (Arduino C++)'),
  src: `#include <DHT.h>
#include <Adafruit_BME280.h>

DHT dht(4, DHT22);                 // ${cm(l, 'DHT22 veri ucu GPIO4', 'DHT22 data pin on GPIO4')}
Adafruit_BME280 bme;               // ${cm(l, 'I2C: SDA 21, SCL 22', 'I2C: SDA 21, SCL 22')}
const uint32_t STEP_MS = 10UL * 60 * 1000;
const int LDR_PIN = 34;            // ${cm(l, 'ADC1: Wi-Fi açıkken de çalışır', 'ADC1: works with Wi-Fi on')}
const int TRIG = 5, ECHO = 18;     // HC-SR04
uint32_t next = 0;

float distanceCm() {
  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  unsigned long us = pulseIn(ECHO, HIGH, 30000);   // ${cm(l, 'zaman aşımı 30 ms', 'timeout 30 ms')}
  return us ? us / 58.0 : NAN;                       // ${cm(l, 'yankı yoksa NaN', 'no echo: NaN')}
}

void setup() {
  Serial.begin(115200);
  dht.begin(); bme.begin(0x76);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  Serial.println("dakika,sicaklik,nem,basinc,isik,mesafe");
}

void loop() {
  uint32_t now = millis();
  if ((int32_t)(now - next) < 0) return;  // ${cm(l, 'taşmaya dayanıklı karşılaştırma', 'overflow-safe comparison')}
  next += STEP_MS;                        // ${cm(l, 'kayma birikmez: delay() yok', 'no drift: no delay()')}
  float t = dht.readTemperature();        // ${cm(l, 'okunamazsa NaN döner', 'returns NaN on a failed read')}
  float h = dht.readHumidity();
  Serial.printf("%lu,%.2f,%.2f,%.2f,%d,%.2f\\n", now / 60000UL, t, h,
                bme.readPressure() / 100.0, analogRead(LDR_PIN), distanceCm());
}`,
})

const loggerMpy = (l: L): CodeBlock => ({
  title: cm(l, 'MicroPython: zaman damgalı kayıt ve okunamayan örnek', 'MicroPython: timestamped logging and failed reads'),
  src: `import dht, machine, time

d = dht.DHT22(machine.Pin(4))
ldr = machine.ADC(machine.Pin(34))
ldr.atten(machine.ADC.ATTN_11DB)          # ${cm(l, '0..3,1 V aralığı', '0..3.1 V range')}
t0 = time.ticks_ms()

with open("kayit.csv", "a") as f:
    while True:
        dk = time.ticks_diff(time.ticks_ms(), t0) // 60000
        try:
            d.measure()
            t, h = d.temperature(), d.humidity()
        except OSError:                      # ${cm(l, 'zaman aşımı: veriyi uydurma', 'timeout: do not invent data')}
            t = h = float("nan")
        f.write("%d,%.2f,%.2f,%d\\n" % (dk, t, h, ldr.read() >> 2))
        f.flush()                            # ${cm(l, 'elektrik kesilirse satır kaybolmasın', 'keep the line if power is lost')}
        time.sleep(600)`,
})

const cleanCpp = (l: L): CodeBlock => ({
  title: cm(l, 'Cihazda temizleme: aralık denetimi, 3\'lü medyan, EMA', 'On-device cleaning: range check, median of 3, EMA'),
  src: `// ${cm(l, 'Fiziksel olarak imkânsız değerler hiç kaydedilmez', 'Physically impossible values are never logged')}
bool plausible(float t) { return !isnan(t) && t > -10.0f && t < 60.0f; }

// ${cm(l, 'Son üç örneğin medyanı: tek sıçramayı tamamen siler', 'Median of the last three samples: removes a single spike')}
float median3(float a, float b, float c) {
  return max(min(a, b), min(max(a, b), c));
}

struct Ema {
  float alpha, y = NAN;
  float push(float x) {
    if (isnan(x)) return y;                  // ${cm(l, 'eksikte son tahmini koru', 'hold the last estimate on a gap')}
    y = isnan(y) ? x : y + alpha * (x - y);  // ${cm(l, 'tek çarpma, tek değişken', 'one multiply, one variable')}
    return y;
  }
};

float w[3] = {NAN, NAN, NAN};
Ema ema{0.3f};

float cleanSample(float raw) {
  w[0] = w[1]; w[1] = w[2]; w[2] = plausible(raw) ? raw : NAN;
  float m = (isnan(w[0]) || isnan(w[1])) ? w[2] : median3(w[0], w[1], w[2]);
  return ema.push(m);
}`,
})

const hampelPy = (l: L): CodeBlock => ({
  title: cm(l, 'Python: Hampel süzgeci ve doğrusal ara değer', 'Python: Hampel filter and linear interpolation'),
  src: `import numpy as np

def hampel(x, half=3, k=4.0):
    out = np.zeros(len(x), dtype=bool)
    for i in range(len(x)):
        w = x[max(0, i - half): i + half + 1]
        w = w[~np.isnan(w)]
        if np.isnan(x[i]) or len(w) == 0:
            continue
        m = np.median(w)
        mad = 1.4826 * np.median(np.abs(w - m))  # ${cm(l, 'normal dağılımda sigma', 'sigma for a normal distribution')}
        out[i] = abs(x[i] - m) > k * max(mad, 1e-6)
    return out

def interp_nan(x):
    i = np.arange(len(x)); ok = ~np.isnan(x)
    return np.interp(i, i[ok], x[ok])            # ${cm(l, 'kenarda en yakın değer', 'nearest value at the edges')}`,
})

const kalmanCpp = (l: L): CodeBlock => ({
  title: cm(l, 'Tek boyutlu Kalman süzgeci (C++ yapı)', 'One-dimensional Kalman filter (C++ struct)'),
  src: `// ${cm(l, 'Model: x_k = x_(k-1) + w, Var(w) = q;  ölçüm z_k = x_k + v, Var(v) = r', 'Model: x_k = x_(k-1) + w, Var(w) = q;  measurement z_k = x_k + v, Var(v) = r')}
struct Kalman1D {
  float q, r;          // ${cm(l, 'süreç ve ölçüm gürültüsü (°C²)', 'process and measurement noise (deg C squared)')}
  float x = NAN, p = 1.0f, k = 0.0f;

  float update(float z) {
    if (isnan(x)) { x = z; return x; }   // ${cm(l, 'ilk ölçümle başla', 'start from the first measurement')}
    p += q;                              // ${cm(l, 'tahmin: belirsizlik büyür', 'predict: uncertainty grows')}
    if (isnan(z)) { k = 0; return x; }   // ${cm(l, 'ölçüm yoksa yalnız tahmin', 'no measurement: predict only')}
    k = p / (p + r);                     // ${cm(l, 'kazanç: modele mi ölçüme mi güven', 'gain: trust model or measurement')}
    x += k * (z - x);                    // ${cm(l, 'güncelle: yeniliğin K katı', 'update: K times the innovation')}
    p *= (1.0f - k);
    return x;
  }
};

// ${cm(l, 'DHT22 için: r = 0,25² (belgedeki gürültü), q = 0,02 (sera yavaş ısınır)', 'For the DHT22: r = 0.25^2 (datasheet noise), q = 0.02 (a greenhouse warms slowly)')}
Kalman1D kf{0.02f, 0.0625f};`,
})

const steadyPy = (l: L): CodeBlock => ({
  title: cm(l, 'Python: durağan kazanç ve EMA eşdeğerliği', 'Python: steady-state gain and the EMA equivalence'),
  src: `import math

def steady_gain(q, r):
    p = (q + math.sqrt(q * q + 4 * q * r)) / 2   # ${cm(l, 'tahmin öncesi P sonsuzda', 'prior P at infinity')}
    return p / (p + r)

for q in (0.002, 0.02, 0.2):
    K = steady_gain(q, 0.0625)
    print("q=%.3f  K=%.3f  ~ EMA alpha" % (q, K))  # ${cm(l, 'q büyüdükçe K büyür: daha az yumuşatma', 'larger q gives larger K: less smoothing')}`,
})

const welfordCpp = (l: L): CodeBlock => ({
  title: cm(l, 'Welford: diziyi saklamadan ortalama ve sigma (C++)', 'Welford: mean and sigma without storing the array (C++)'),
  src: `struct Welford {
  uint32_t n = 0;
  double mean = 0, m2 = 0;
  float lo = INFINITY, hi = -INFINITY;
  void push(float x) {
    if (isnan(x)) return;              // ${cm(l, 'eksik örneği atla', 'skip a missing sample')}
    n++;
    double d = x - mean;
    mean += d / n;
    m2 += d * (x - mean);              // ${cm(l, 'eski ve yeni ortalamayla: kararlı', 'old and new mean: numerically stable')}
    lo = min(lo, x); hi = max(hi, x);
  }
  double var() const { return n > 1 ? m2 / (n - 1) : 0; }
};

Welford day;  // ${cm(l, '24 bayt: 144 örneklik günü RAM\'de tutmaya gerek yok', '24 bytes: no need to keep 144 samples of a day in RAM')}

void report() {
  Serial.printf("ort=%.2f sigma=%.2f min=%.2f max=%.2f n=%u\\n",
                day.mean, sqrt(day.var()), day.lo, day.hi, day.n);
}`,
})

const plotterCpp = (l: L): CodeBlock => ({
  title: cm(l, 'Seri Çizici ve OLED için çıktı', 'Output for the Serial Plotter and the OLED'),
  src: `#include <Adafruit_SSD1306.h>
Adafruit_SSD1306 oled(128, 64, &Wire);

void plot(float raw, float clean, float limit) {
  // ${cm(l, 'Arduino Seri Çizici "ad:değer" çiftlerini ayrı çizgi yapar', 'The Arduino Serial Plotter turns "name:value" pairs into lines')}
  Serial.printf("ham:%.2f temiz:%.2f esik:%.1f\\n", raw, clean, limit);
}

void sparkline(const float* v, int n, float lo, float hi) {
  oled.clearDisplay();
  for (int i = 1; i < n; i++) {        // ${cm(l, 'son n örnek, 128 piksele sığar', 'last n samples, fits 128 pixels')}
    int y0 = 63 - (v[i - 1] - lo) * 63 / (hi - lo);
    int y1 = 63 - (v[i] - lo) * 63 / (hi - lo);
    oled.drawLine(i - 1, y0, i, y1, SSD1306_WHITE);
  }
  oled.display();
}`,
})

// --- Python (Pyodide, yalnız NumPy) -------------------------------------------------------------------------------------

const PY_LOAD: CodeLine = ["D = np.genfromtxt('sera-sensorleri.csv', delimiter=',', names=True)", '7 gün, 10 dakikada bir', '7 days, every 10 minutes']

const py1: CodeLine[] = [
  ['import numpy as np'],
  PY_LOAD,
  ['print("satir:", len(D), " sutunlar:", D.dtype.names)', 'kaç örnek, hangi sensörler', 'how many samples, which sensors'],
  ['dt = np.diff(D["dakika"])'],
  ['print("ornekleme araligi (dk):", np.unique(dt))', 'zaman damgası düzenli mi', 'is the timestamp regular'],
  ['print("ornek/gun:", int(1440 / dt[0]))'],
  ['for c in ("sicaklik", "nem", "basinc", "isik", "mesafe"):'],
  ['    x = D[c]'],
  ['    bad = np.isnan(x).sum()', 'okunamayan örnekler NaN', 'failed reads are NaN'],
  ['    print("%-9s NaN=%2d  min=%8.2f  max=%8.2f" % (c, bad, np.nanmin(x), np.nanmax(x)))'],
  ['t = D["sicaklik"]'],
  ['spike = (t > 60) | (t < -20)', 'DHT22 için imkânsız değerler', 'impossible values for a DHT22'],
  ['print("sicrama:", spike.sum(), "->", t[spike])'],
  ['f = D["ariza"] == 1'],
  ['print("ariza ornegi:", f.sum(), " gun", int(D["dakika"][f][0] // 1440) + 1, "saat", D["saat"][f][0], "-", D["saat"][f][-1])'],
  ['gun = (D["dakika"] // 1440).astype(int)'],
  ['for g in range(7):', 'günlük tepe ve dip (sıçramalar hariç)', 'daily peak and low (spikes excluded)'],
  ['    x = t[(gun == g) & ~spike]'],
  ['    print("gun", g + 1, "min %.1f  max %.1f" % (np.nanmin(x), np.nanmax(x)))'],
]

const py2: CodeLine[] = [
  ['import numpy as np'],
  PY_LOAD,
  ['t = D["sicaklik"].copy()'],
  ['ok = ~np.isnan(t)'],
  ['z = np.abs(t - np.nanmean(t)) > 3 * np.nanstd(t)', 'z-skoru, k = 3', 'z-score, k = 3'],
  ['q1, q3 = np.nanpercentile(t, [25, 75])'],
  ['iqr = ok & ((t < q1 - 1.5 * (q3 - q1)) | (t > q3 + 1.5 * (q3 - q1)))', 'Tukey çitleri', 'Tukey fences'],
  ['def hampel(x, half=3, k=4.0):'],
  ['    out = np.zeros(len(x), dtype=bool)'],
  ['    for i in range(len(x)):'],
  ['        w = x[max(0, i - half): i + half + 1]'],
  ['        w = w[~np.isnan(w)]'],
  ['        if np.isnan(x[i]): continue'],
  ['        m = np.median(w); mad = 1.4826 * np.median(np.abs(w - m))', 'yerel medyan ve MAD', 'local median and MAD'],
  ['        out[i] = abs(x[i] - m) > k * max(mad, 1e-6)'],
  ['    return out'],
  ['h = hampel(t)'],
  ['print("isaretlenen  z:", z.sum(), " IQR:", iqr.sum(), " Hampel:", h.sum())'],
  ['t[h] = np.nan', 'aykırıyı sil, sonra doldur', 'drop outliers, then fill'],
  ['i = np.arange(len(t)); g = ~np.isnan(t)'],
  ['c = np.interp(i, i[g], t[g])', 'doğrusal ara değer', 'linear interpolation'],
  ['def ma(x, w): return np.array([x[max(0, k - w + 1): k + 1].mean() for k in range(len(x))])', 'nedensel hareketli ortalama', 'causal moving average'],
  ['def med(x, w): return np.array([np.median(x[max(0, k - w + 1): k + 1]) for k in range(len(x))])'],
  ['def ema(x, a):'],
  ['    y = np.empty(len(x)); y[0] = x[0]'],
  ['    for k in range(1, len(x)): y[k] = y[k - 1] + a * (x[k] - y[k - 1])'],
  ['    return y'],
  ['for name, y in (("ham", c), ("MA5", ma(c, 5)), ("medyan5", med(c, 5)), ("EMA0.3", ema(c, 0.3))):'],
  ['    rough = np.std(np.diff(y))', 'pürüzlülük: ardışık fark', 'roughness: successive difference'],
  ['    lagd = np.argmax(np.correlate(y - y.mean(), c - c.mean(), "full")) - (len(c) - 1)'],
  ['    print("%-8s puruz=%.3f  gecikme=%d ornek" % (name, rough, lagd))', 'yumuşatma bedava değil', 'smoothing is not free'],
]

const py3: CodeLine[] = [
  ['import numpy as np'],
  PY_LOAD,
  ['t = D["sicaklik"].copy()'],
  ['t[(t > 60) | (t < -20)] = np.nan', 'imkânsız değerleri at', 'drop impossible values'],
  ['def kalman(z, q, r):'],
  ['    x, p = z[~np.isnan(z)][0], 1.0'],
  ['    est, gain = [], []'],
  ['    for v in z:'],
  ['        p += q', 'tahmin', 'predict'],
  ['        k = 0.0'],
  ['        if not np.isnan(v):'],
  ['            k = p / (p + r); x += k * (v - x); p *= 1 - k', 'güncelle', 'update'],
  ['        est.append(x); gain.append(k)'],
  ['    return np.array(est), np.array(gain)'],
  ['r = 0.25 ** 2', 'DHT22 gürültüsü ~0,25 °C', 'DHT22 noise ~0.25 C'],
  ['for q in (0.002, 0.02, 0.2):'],
  ['    est, K = kalman(t, q, r)'],
  ['    Ks = (q + np.sqrt(q * q + 4 * q * r)) / 2'],
  ['    Ks = Ks / (Ks + r)', 'durağan kazanç formülü', 'steady-state gain formula'],
  ['    print("q=%.3f  K(ilk 5)=%s  K(son)=%.3f  formul=%.3f" % (q, np.round(K[:5], 3), K[K > 0][-1], Ks))', 'NaN ölçümde K = 0', 'K = 0 on a NaN measurement'],
  ['est, K = kalman(t, 0.02, r)'],
  ['a = K[K > 0][-1]; y = np.empty(len(t)); y[0] = est[0]'],
  ['for k in range(1, len(t)):', 'aynı kazançlı EMA', 'EMA with the same gain'],
  ['    y[k] = y[k - 1] if np.isnan(t[k]) else y[k - 1] + a * (t[k] - y[k - 1])'],
  ['print("Kalman ile EMA arasindaki en buyuk fark (ilk 20 sonrasi): %.4f C" % np.max(np.abs(est - y)[20:]))'],
  ['inn = t - np.roll(est, 1)', 'yenilik: ölçüm eksi önceki tahmin', 'innovation: measurement minus previous estimate'],
  ['gun = (D["dakika"] // 1440).astype(int); h = D["saat"]'],
  ['ramp = (D["ariza"] == 1) & (h < 16)', '5. gün 13:00-16:00, ısıtıcı takılı', 'day 5 13:00-16:00, heater stuck'],
  ['normal = (gun == 3) & (h >= 13) & (h < 16)', '4. gün aynı saatler', 'day 4, same hours'],
  ['print("ortalama yenilik  ariza: %+.2f C   normal gun: %+.2f C" % (np.nanmean(inn[ramp]), np.nanmean(inn[normal])))', 'model "sabit" der, ısıtıcı ısıtır', 'the model says "constant", the heater heats'],
]

const py4: CodeLine[] = [
  ['import numpy as np'],
  PY_LOAD,
  ['cols = ["sicaklik", "nem", "basinc", "isik", "mesafe"]'],
  ['t = D["sicaklik"].copy(); t[(t > 60) | (t < -20)] = np.nan'],
  ['D["sicaklik"] = t', 'sıçramalar analizden çıkarıldı', 'spikes removed from the analysis'],
  ['for c in cols:'],
  ['    x = D[c]'],
  ['    print("%-9s ort=%8.2f  sigma=%7.2f  medyan=%8.2f" % (c, np.nanmean(x), np.nanstd(x, ddof=1), np.nanmedian(x)))'],
  ['cnt, edges = np.histogram(t[~np.isnan(t)], bins=8)', 'metin histogramı', 'text histogram'],
  ['for n, e in zip(cnt, edges):'],
  ['    print("%5.1f C | %s %d" % (e, "#" * (n // 8), n))'],
  ['saat = D["saat"].astype(int)'],
  ['prof = [np.nanmean(t[saat == h]) for h in range(24)]', 'tipik bir gün', 'a typical day'],
  ['print("en sicak saat:", int(np.nanargmax(prof)), " en serin saat:", int(np.nanargmin(prof)))'],
  ['ok = np.all([~np.isnan(D[c]) for c in cols], axis=0)'],
  ['R = np.corrcoef([D[c][ok] for c in cols])', 'Pearson korelasyon matrisi', 'Pearson correlation matrix'],
  ['print(" " * 10 + "".join("%9s" % c[:7] for c in cols))'],
  ['for c, row in zip(cols, R):'],
  ['    print("%-10s" % c + "".join("%9.2f" % v for v in row))'],
  ['n = 0; mean = 0.0; m2 = 0.0', 'Welford: cihazdaki gibi tek geçiş', 'Welford: one pass, as on the device'],
  ['for v in t[~np.isnan(t)]:'],
  ['    n += 1; d = v - mean; mean += d / n; m2 += d * (v - mean)'],
  ['print("Welford ort=%.4f sigma=%.4f | numpy ort=%.4f sigma=%.4f" % (mean, (m2 / (n - 1)) ** 0.5, np.nanmean(t), np.nanstd(t, ddof=1)))'],
]

// --- Üniteler ------------------------------------------------------------------------------------------------------------

export const UNITS_A: CourseUnit<SensorSimId>[] = [
  {
    n: 1, sims: ['toplama', 'sera3b'], parts: ['dht22', 'bme280', 'ldr', 'hc-sr04', 'esp32-esp32-wroom-devkit'], wokwi: true,
    related: [
      { href: '/makine-ogrenmesi/veri-setleri', tr: 'ML veri setleri: sera-sensorleri.csv ve öbürleri', en: 'ML datasets: sera-sensorleri.csv and the rest' },
      { href: '/muhendislik/iot', tr: 'ESP32 ile Nesnelerin İnterneti: veriyi buluta göndermek', en: 'IoT with the ESP32: sending the data to the cloud' },
      { href: '/laboratuvar', tr: 'Devre laboratuvarı: DHT22 ve HC-SR04 kitleri', en: 'Circuit lab: DHT22 and HC-SR04 kits' },
    ],
    py: { file: 'toplama.py', code: py1, data: ['sera-sensorleri'] },
    tr: {
      title: 'Sensörden zaman serisine: seradan veri toplamak',
      summary: 'Örnekleme aralığı, zaman damgası, okunamayan örnek ve imkânsız değer: makine öğrenmesinin ham maddesi nasıl üretilir.',
      goals: ['Bir ölçüm için uygun örnekleme aralığını gerekçesiyle seçmek', 'Kayma biriktirmeyen, zaman damgalı bir kayıt döngüsü yazmak', 'Okunamayan örneği NaN olarak saklamanın neden doğru olduğunu açıklamak', 'sera-sensorleri.csv dosyasının sütunlarını, düzenini ve kusurlarını tanımlamak'],
      notes: `<p>Makine öğrenmesi modeli yalnızca verdiğin veriyi bilir. Bu derste her şey tek bir seradan başlar: bir ESP32, bir <b>DHT22</b> (sıcaklık ve bağıl nem), bir <b>BME280</b> (basınç), bir <b>LDR</b> (ışık) ve su deposunun üstünde bir <b>HC-SR04</b> (sensörden su yüzeyine mesafe). Yedi gün boyunca her on dakikada bir satır yazılır: toplam 7 × 144 = <b>1008 satır</b>.</p>
<h3>Ne sıklıkla ölçmeli?</h3>
<p>Kural basittir: ölçtüğün büyüklüğün en hızlı anlamlı değişiminin en az iki katı sıklıkta örnekle (Nyquist sezgisi). Sera sıcaklığı dakikalar içinde değil, onlarca dakikada değişir; 10 dakika yeterlidir. Kapı açılınca oluşan 30 saniyelik soğuk hava darbesini görmek istiyorsan 10 dakika kaçırır. Daha sık örneklemek bedava değildir: pil, depolama ve gönderilen veri artar. DHT22 zaten en çok iki saniyede bir okunabilir.</p>
<h3>Zaman damgası ve kayma</h3>
<ul><li><code>delay(600000)</code> kullanırsan okuma ve yazma süresi her turda eklenir; bir haftada dakikalar kayar.</li><li>Doğrusu bir sonraki okuma anını hesaplamak: <code>next += STEP_MS</code>. <code>millis()</code> 49,7 günde taşar; <code>(int32_t)(now - next) &lt; 0</code> karşılaştırması taşmaya dayanıklıdır.</li><li>Gerçek saat gerekiyorsa NTP (Wi-Fi) ya da DS3231 gibi bir RTC kullan. Bu veri setinde zaman "başlangıçtan geçen dakika" olarak tutulur, günün saati ondan hesaplanır.</li></ul>
<h3>Kusurlar veriyle birlikte gelir</h3>
<p>Gerçek sensörler kusursuz değildir ve veri seti bunu bilerek taşır:</p>
<ul><li><b>Gürültü</b>: DHT22 sıcaklıkta yaklaşık ±0,25 °C titrer.</li><li><b>Okunamayan örnek</b>: DHT22 zaman aşımına düşer; sıcaklık ve nem birlikte <code>NaN</code> olur. Dosyada 16 sıcaklık örneği NaN.</li><li><b>Sıçrama</b>: gevşek bir kablo 85 °C ya da −40 °C gibi imkânsız değerler üretir; dosyada 7 tane.</li><li><b>Arıza</b>: 5. gün 13:00 ile 19:00 arası ısıtıcı açık kalır; <code>ariza</code> sütunu bu 36 örnekte 1'dir. Bu bitirme projesinin hedefidir.</li></ul>
<p>Okunamayan örneği <b>0 ya da son değerle doldurarak kaydetme</b>. 0 °C gerçek bir ölçüm gibi görünür ve sonraki her adımı zehirler. Eksik veriyi eksik olarak sakla (<code>NaN</code>, boş hücre); nasıl dolduracağına temizleme ünitesinde, bilerek karar verirsin.</p>
<h3>Biçim: CSV</h3>
<p>Sütunlar: <code>dakika, saat, sicaklik, nem, basinc, isik, mesafe, ariza</code>. Seri porttan bilgisayara, SD karta ya da MQTT ile buluta gidebilir. Hangi yolu seçersen seç, başlık satırı, birimler ve örnekleme aralığı belgelenmelidir: veri seti sayfasında hepsi yazılıdır.</p>`,
      code: [loggerCpp('tr'), loggerMpy('tr')],
      lab: 'Sensör kaydedicide önce varsayılan ayarlarla 7 günü kaydet ve grafikte 5. gün öğleden sonraki ısıtıcı arızasını bul. Sonra örnekleme aralığını 60 dakikaya çıkar: günlük tepe hâlâ görünüyor mu? Okunamayan örnek oranını %10 yap, sıçrama oranını artır ve sayaçlardaki NaN ile sıçrama sayısının nasıl değiştiğini not et. Aynı tohumla iki kez kaydedip CSV\'lerin birebir aynı olduğunu doğrula, sonra Python kodunu çalıştırıp dosyadaki 16 NaN ve 7 sıçramayı say.',
      pitfalls: ['delay() ile örnekleme yapmak: okuma süresi her turda eklenir, zaman damgaları kayar.', 'Okunamayan örneği 0 ya da son değerle kaydetmek: sahte ama gerçek görünen veri üretir.', 'Örnekleme aralığını belgelememek: sonraki her gecikme ve kayan pencere hesabı bu sayıya bağlıdır.', 'LDR\'yi ADC2 pinine bağlamak: ESP32\'de Wi-Fi açıkken ADC2 okunamaz; ADC1 (GPIO32 ile 39 arası) kullan.', 'Birimleri dosyaya yazmamak: basınç Pa mı hPa mı, mesafe cm mi mm mi, altı ay sonra kimse hatırlamaz.'],
      se: `<p>Veri toplama kodu bir <b>veri sözleşmesi</b> üretir: sütun adları, birimler, aralıklar ve eksik değerin nasıl gösterildiği. Sözleşme yazılı olmalı ve test edilmelidir.</p>
<ul><li>Bu derste CSV dosyası, onu üreten simülatörle birebir aynı olduğu bir testle korunur; üreteç değişirse test kırılır.</li><li>Tekrarlanabilirlik için tohum (seed) kullan: aynı tohum aynı veriyi verir, hata ayıklama kolaylaşır.</li><li>Ham veriyi asla yerinde değiştirme; temizlenmiş veri ayrı bir dosya ya da ayrı bir sütundur.</li></ul>`,
      quiz: [
        { q: '7 gün boyunca 10 dakikada bir örnek alan bir kaydedici kaç satır üretir?', options: ['144', '504', '1008', '10080'], answer: 2, why: 'Günde 1440 / 10 = 144 örnek, 7 günde 1008 satır.' },
        { q: 'DHT22 zaman aşımına düştü. Kayda ne yazılmalı?', options: ['0', 'Son geçerli değer', 'NaN (eksik)', 'Önceki günün aynı saatindeki değer'], answer: 2, why: 'Eksik veri eksik olarak saklanmalı. Nasıl doldurulacağına temizleme aşamasında bilerek karar verilir.' },
        { q: 'Kayma biriktirmeyen örnekleme için hangisi doğru?', options: ['Her turda delay(600000)', 'Bir sonraki okuma anını next += STEP_MS ile hesaplamak', 'Her okumada ESP32\'yi yeniden başlatmak', 'Seri portu daha hızlı açmak'], answer: 1, why: 'Sabit bir zaman çizelgesi tutulursa okuma süresi birikmez; delay() ise her turda kodun süresini ekler.' },
        { q: 'Sıcaklık sütununda 85 °C ve −40 °C değerleri var. En olası açıklama?', options: ['Seranın gerçekten o kadar ısındığı', 'Gevşek kablo ya da bozuk okuma (imkânsız değer)', 'Örnekleme aralığının çok kısa olması', 'BME280\'in basıncı yanlış ölçmesi'], answer: 1, why: 'Bir serada birkaç dakikada 60 derecelik sıçrama fiziksel olarak imkânsızdır; bunlar aykırı değerdir ve temizlenmelidir.' },
      ],
    },
    en: {
      title: 'From sensor to time series: collecting greenhouse data',
      summary: 'Sampling interval, timestamps, failed reads and impossible values: how the raw material of machine learning is produced.',
      goals: ['Choose a suitable sampling interval for a measurement and justify it', 'Write a timestamped logging loop that does not drift', 'Explain why storing a failed read as NaN is the right thing to do', 'Describe the columns, layout and flaws of the sera-sensorleri.csv file'],
      notes: `<p>A machine learning model knows only the data you give it. In this course everything starts from one greenhouse: an ESP32, a <b>DHT22</b> (temperature and relative humidity), a <b>BME280</b> (pressure), an <b>LDR</b> (light) and an <b>HC-SR04</b> above the water tank (distance from the sensor to the water surface). One line is written every ten minutes for seven days: 7 × 144 = <b>1008 rows</b> in total.</p>
<h3>How often should you measure?</h3>
<p>The rule is simple: sample at least twice as often as the fastest meaningful change of the quantity (the Nyquist intuition). Greenhouse temperature changes over tens of minutes, not seconds; 10 minutes is enough. If you want to see the 30-second cold blast when the door opens, 10 minutes will miss it. Sampling faster is not free: battery, storage and transmitted data all grow. A DHT22 cannot be read more than once every two seconds anyway.</p>
<h3>Timestamps and drift</h3>
<ul><li>If you use <code>delay(600000)</code>, the time spent reading and writing is added every round; in a week you drift by minutes.</li><li>The right way is to compute the next reading time: <code>next += STEP_MS</code>. <code>millis()</code> overflows after 49.7 days; the comparison <code>(int32_t)(now - next) &lt; 0</code> survives the overflow.</li><li>If you need wall-clock time, use NTP (over Wi-Fi) or an RTC such as the DS3231. In this dataset time is kept as "minutes since start" and the hour of day is derived from it.</li></ul>
<h3>Flaws come with the data</h3>
<p>Real sensors are not perfect and the dataset carries this on purpose:</p>
<ul><li><b>Noise</b>: the DHT22 jitters by about ±0.25 °C in temperature.</li><li><b>Failed reads</b>: the DHT22 times out; temperature and humidity become <code>NaN</code> together. The file has 16 NaN temperature samples.</li><li><b>Spikes</b>: a loose wire produces impossible values such as 85 °C or −40 °C; the file has 7 of them.</li><li><b>Fault</b>: on day 5 from 13:00 to 19:00 the heater is stuck on; the <code>ariza</code> column is 1 for these 36 samples. This is the target of the capstone project.</li></ul>
<p><b>Do not log a failed read as 0 or as the last value</b>. 0 °C looks like a real measurement and poisons every later step. Store missing data as missing (<code>NaN</code>, an empty cell); you decide how to fill it, deliberately, in the cleaning unit.</p>
<h3>Format: CSV</h3>
<p>Columns: <code>dakika, saat, sicaklik, nem, basinc, isik, mesafe, ariza</code> (minute, hour, temperature, humidity, pressure, light, distance, fault). It can go over the serial port to a computer, to an SD card or over MQTT to the cloud. Whichever route you choose, the header line, the units and the sampling interval must be documented: the dataset page lists them all.</p>`,
      code: [loggerCpp('en'), loggerMpy('en')],
      lab: 'In the sensor logger, first record 7 days with the default settings and find the heater fault in the afternoon of day 5 on the chart. Then raise the sampling interval to 60 minutes: is the daily peak still visible? Set the failed-read rate to 10%, increase the spike rate and note how the NaN and spike counters change. Record twice with the same seed and confirm the CSV files are identical, then run the Python code and count the 16 NaN values and 7 spikes in the file.',
      pitfalls: ['Sampling with delay(): the reading time is added every round and the timestamps drift.', 'Logging a failed read as 0 or as the last value: it produces fake data that looks real.', 'Not documenting the sampling interval: every later lag and rolling window calculation depends on this number.', 'Wiring the LDR to an ADC2 pin: on the ESP32, ADC2 cannot be read while Wi-Fi is on; use ADC1 (GPIO32 to 39).', 'Not writing units into the file: Pa or hPa, cm or mm, nobody will remember six months later.'],
      se: `<p>Data collection code produces a <b>data contract</b>: column names, units, ranges and how a missing value is shown. The contract should be written down and tested.</p>
<ul><li>In this course the CSV file is protected by a test that checks it is identical to the simulator that produces it; if the generator changes, the test breaks.</li><li>Use a seed for reproducibility: the same seed gives the same data and debugging becomes easier.</li><li>Never modify raw data in place; cleaned data is a separate file or a separate column.</li></ul>`,
      quiz: [
        { q: 'A logger takes one sample every 10 minutes for 7 days. How many rows does it produce?', options: ['144', '504', '1008', '10080'], answer: 2, why: '1440 / 10 = 144 samples a day, 1008 rows in 7 days.' },
        { q: 'The DHT22 timed out. What should be logged?', options: ['0', 'The last valid value', 'NaN (missing)', 'The value at the same hour on the previous day'], answer: 2, why: 'Missing data should be stored as missing. How to fill it is a deliberate decision made during cleaning.' },
        { q: 'Which gives sampling without drift?', options: ['delay(600000) every round', 'Computing the next reading time with next += STEP_MS', 'Restarting the ESP32 at every reading', 'Opening the serial port at a higher speed'], answer: 1, why: 'Keeping a fixed schedule means the reading time does not accumulate; delay() adds the code duration every round.' },
        { q: 'The temperature column contains 85 °C and −40 °C. The most likely explanation?', options: ['The greenhouse really got that hot', 'A loose wire or a corrupted read (an impossible value)', 'The sampling interval is too short', 'The BME280 measured pressure wrongly'], answer: 1, why: 'A 60-degree jump within minutes in a greenhouse is physically impossible; these are outliers and must be cleaned.' },
      ],
    },
  },
  {
    n: 2, sims: ['temizleme'], parts: ['dht22', 'esp32-esp32-wroom-devkit'],
    related: [
      { href: '/makine-ogrenmesi/veri-setleri', tr: 'ML veri setleri: ham sera verisi', en: 'ML datasets: the raw greenhouse data' },
      { href: '/makine-ogrenmesi/dbscan', tr: 'ML dersi: DBSCAN ile aykırı nokta', en: 'ML course: outlier points with DBSCAN' },
      { href: '/laboratuvar', tr: 'Devre laboratuvarı: DHT22 kiti', en: 'Circuit lab: the DHT22 kit' },
    ],
    py: { file: 'temizleme.py', code: py2, data: ['sera-sensorleri'] },
    tr: {
      title: 'Temizleme: aykırı değer, eksik veri ve yumuşatma',
      summary: 'z-skoru neden kandırılır, Hampel neden yereldir, ara değer ne zaman yalan söyler ve yumuşatmanın bedeli olan gecikme.',
      goals: ['Aykırı değeri z-skoru, IQR ve Hampel süzgeciyle bulmak ve farklarını açıklamak', 'Eksik veriyi ileri doldurma ve doğrusal ara değerle doldurmak', 'Hareketli ortalama, medyan süzgeci ve üstel ortalamayı gürültü ve gecikme açısından karşılaştırmak', 'Bir temizleme adımının hatasını gerçek değere karşı ölçmek'],
      notes: `<p>Temizleme üç ayrı sorudur ve sırası önemlidir: önce <b>aykırı değerleri bul</b>, sonra onları ve okunamayan örnekleri <b>doldur</b>, en son <b>yumuşat</b>. Sırayı karıştırırsan 85 °C'lik bir sıçrama hareketli ortalamanın içine karışır ve beş örnek boyunca sıcaklığı 15 derece yukarı çeker.</p>
<h3>Aykırı değer: üç yöntem</h3>
<ul><li><b>z-skoru</b>: ortalamadan k·σ uzaktakileri işaretler. Sorunu <i>maskeleme</i>dir: uç değerler ortalamayı ve σ'yı kendileri büyütür. Sera verisinde sıçramalar o kadar uçtadır ki k = 3 yine yedisini de yakalar, ama 30 °C yerine 32 °C okuyan hafif bir hatayı asla göremez.</li><li><b>IQR (Tukey çitleri)</b>: Q1 − 1,5·IQR altı ve Q3 + 1,5·IQR üstü. Sıralamaya dayandığı için uç değerden etkilenmez; burada da 7 sıçramayı bulur. Ama küreseldir: öğlen 29 °C ile gece 29 °C'yi ayırt edemez.</li><li><b>Hampel süzgeci</b>: her noktayı kendi komşuluğunun (±3 örnek) medyanıyla karşılaştırır, ölçek olarak 1,4826·MAD kullanır. Yerel olduğu için günlük döngüyü bilir. k = 4 ile 18 örnek işaretler; yedi sıçramanın hepsi içindedir, kalanı gürültünün keskin olduğu kısa anlardır. Fazladan işaretlemek burada ucuzdur, çünkü silinen nokta komşularından doldurulur.</li></ul>
<div class="eq">Hampel: |x<sub>i</sub> − medyan(pencere)| &gt; k · 1,4826 · MAD(pencere)</div>
<h3>Eksik veri</h3>
<p><b>İleri doldurma</b> (son geçerli değer) gerçek zamanlıdır ve cihazda bedavadır, ama uzun boşlukta düz bir basamak çizer. <b>Doğrusal ara değer</b> iki komşu arasına düz çizgi çeker; daha doğrudur ama bir sonraki değeri bilmeyi gerektirir, yani yalnız kayıt bittikten sonra kullanılabilir. Altı saatlik bir boşluğu doğrusal ara değerle doldurmak öğlen tepesini siler: uzun boşluk doldurulmaz, işaretlenir.</p>
<h3>Yumuşatma ve gecikme</h3>
<ul><li><b>Hareketli ortalama (w)</b>: son w örneğin ortalaması. Gürültüyü √w kat azaltır, ama yaklaşık (w − 1)/2 örnek geride kalır.</li><li><b>Medyan süzgeci</b>: tek sıçramayı tamamen siler, basamağı bozmadan geçirir.</li><li><b>Üstel ortalama (EMA)</b>: <code>y += α(x − y)</code>. Tek değişken, tek çarpma; mikrodenetleyicinin favorisi.</li></ul>
<p>Simülatör gürültüsüz gerçek sıcaklığı da bildiği için her adımın hatası ölçülebilir. Hampel ve doğrusal ara değerden sonra RMSE yaklaşık <b>0,25 °C</b>dir, yani yalnız sensör gürültüsü kalmıştır. Üstüne 5'li hareketli ortalama koyunca RMSE <b>0,46</b>ya, 5'li medyan <b>0,51</b>e çıkar: nedensel yumuşatıcıların gecikmesi, sıcaklığın hızlı değiştiği sabah ve akşam saatlerinde gürültüden daha çok hata ekler. Ders: yumuşatma her zaman iyileştirmez; ölçmeden karar verme.</p>`,
      code: [cleanCpp('tr'), hampelPy('tr')],
      lab: 'Temizleme tezgâhında aykırı değer yöntemini z-skoru, IQR ve Hampel arasında değiştir; her birinin kaç nokta işaretlediğini ve kaç sıçramayı yakaladığını yaz. Doldurma yöntemini ileri doldurma ve doğrusal ara değer arasında değiştirip RMSE\'ye bak. Sonra yumuşatıcıyı hareketli ortalama, medyan ve üstel ortalama arasında değiştir, pencereyi 3\'ten 15\'e büyüt: RMSE nerede en küçük? Python kodundaki pürüzlülük ve gecikme sütunlarıyla karşılaştır.',
      pitfalls: ['Önce yumuşatıp sonra aykırı değer aramak: sıçrama ortalamaya karışır ve artık bulunamaz.', 'z-skorunu tek başına kullanmak: uç değerler σ\'yı büyütür, orta büyüklükteki hatalar maskelenir.', 'Uzun boşlukları doğrusal ara değerle doldurmak: günlük tepe ya da dip sessizce silinir.', 'Merkezli (geleceğe bakan) yumuşatıcıyı canlı sistemde ya da özellik olarak kullanmak: gelecekten bilgi sızar.', 'Temizlenmiş veriyi ham verinin üstüne yazmak: hangi noktanın değiştirildiği kaybolur.'],
      se: `<p>Temizleme hattı küçük, saf fonksiyonlardan kurulmalıdır: <code>hampel</code>, <code>interpLinear</code>, <code>movingAvg</code>. Her biri tek iş yapar ve ayrı test edilir.</p>
<ul><li>Sınır durumlarını test et: tamamen NaN seri, baştaki ve sondaki boşluk, tek elemanlı pencere.</li><li>Her adımın kaç noktayı değiştirdiğini kaydet (veri soy kütüğü). Sorun çıkınca hangi adımın suçlu olduğunu bulursun.</li><li>Cihazdaki C++ temizleyici ile Python temizleyicinin aynı girdide aynı çıktıyı verdiğini bir test vektörüyle doğrula.</li></ul>`,
      quiz: [
        { q: 'z-skoru yöntemi neden büyük sıçramaların yanında orta büyüklükteki hataları kaçırabilir?', options: ['Çünkü yalnız negatif değerlere bakar', 'Uç değerler ortalamayı ve σ\'yı büyütür, eşik genişler (maskeleme)', 'Çünkü NaN değerleri sayar', 'Çünkü medyan kullanır'], answer: 1, why: 'σ uç değerlerden etkilenir; eşik k·σ genişleyince daha küçük hatalar içeride kalır.' },
        { q: 'Hampel süzgecinin IQR\'a göre üstünlüğü nedir?', options: ['Daha az hesap yapması', 'Yerel olması: günlük döngüde öğlen sıcaklığını sıçramadan ayırması', 'Eksik veriyi doldurması', 'Hiç yanlış işaretleme yapmaması'], answer: 1, why: 'Hampel her noktayı kendi komşuluğunun medyanı ve MAD\'ı ile karşılaştırır; IQR tüm seriye tek eşik uygular.' },
        { q: 'Cihazda, canlı akışta eksik örneği doldurmak için hangisi kullanılabilir?', options: ['Doğrusal ara değer', 'Merkezli hareketli ortalama', 'İleri doldurma (son geçerli değer)', 'Sonraki günün değeri'], answer: 2, why: 'Doğrusal ara değer ve merkezli ortalama geleceği bilmeyi gerektirir; ileri doldurma yalnız geçmişi kullanır.' },
        { q: 'Temiz seriye 5\'li hareketli ortalama eklenince RMSE 0,25\'ten 0,46\'ya çıktı. Neden?', options: ['Hareketli ortalama gürültüyü artırır', 'Nedensel ortalamanın gecikmesi hızlı değişimlerde hata ekler', 'Pencere çok kısadır', 'RMSE yanlış hesaplanmıştır'], answer: 1, why: 'Nedensel pencere yaklaşık iki örnek geride kalır; sabah ve akşam ısınma soğuma hızlıyken bu gecikme gürültüden büyük hatadır.' },
      ],
    },
    en: {
      title: 'Cleaning: outliers, missing data and smoothing',
      summary: 'Why the z-score is fooled, why Hampel is local, when interpolation lies, and the price of smoothing: delay.',
      goals: ['Find outliers with the z-score, IQR and the Hampel filter and explain how they differ', 'Fill missing data with forward fill and linear interpolation', 'Compare the moving average, median filter and exponential average in terms of noise and delay', 'Measure the error of a cleaning step against the true value'],
      notes: `<p>Cleaning is three separate questions and the order matters: first <b>find outliers</b>, then <b>fill</b> them together with the failed reads, and only last <b>smooth</b>. If you mix up the order, an 85 °C spike leaks into the moving average and pulls the temperature up by 15 degrees for five samples.</p>
<h3>Outliers: three methods</h3>
<ul><li><b>z-score</b>: flags points more than k·σ from the mean. Its problem is <i>masking</i>: extreme values inflate the mean and σ themselves. In the greenhouse data the spikes are so extreme that k = 3 still catches all seven, but it will never see a mild error that reads 32 °C instead of 30 °C.</li><li><b>IQR (Tukey fences)</b>: below Q1 − 1.5·IQR or above Q3 + 1.5·IQR. Because it is based on ranks it is not affected by extremes; here it also finds the 7 spikes. But it is global: it cannot tell 29 °C at noon from 29 °C at night.</li><li><b>Hampel filter</b>: compares every point with the median of its own neighbourhood (±3 samples), using 1.4826·MAD as the scale. Being local, it knows the daily cycle. With k = 4 it flags 18 samples; all seven spikes are among them and the rest are short moments where the noise is sharp. Flagging a few extra is cheap here, because a dropped point is filled from its neighbours.</li></ul>
<div class="eq">Hampel: |x<sub>i</sub> − median(window)| &gt; k · 1.4826 · MAD(window)</div>
<h3>Missing data</h3>
<p><b>Forward fill</b> (last valid value) works in real time and costs nothing on the device, but over a long gap it draws a flat step. <b>Linear interpolation</b> draws a straight line between two neighbours; it is more accurate but needs to know the next value, so it can be used only after the recording. Filling a six-hour gap by linear interpolation wipes out the noon peak: long gaps are flagged, not filled.</p>
<h3>Smoothing and delay</h3>
<ul><li><b>Moving average (w)</b>: the mean of the last w samples. It reduces noise by √w but lags by about (w − 1)/2 samples.</li><li><b>Median filter</b>: removes a single spike completely and passes a step without blurring it.</li><li><b>Exponential average (EMA)</b>: <code>y += α(x − y)</code>. One variable, one multiply; the microcontroller favourite.</li></ul>
<p>Because the simulator also knows the noise-free true temperature, the error of every step can be measured. After Hampel and linear interpolation the RMSE is about <b>0.25 °C</b>, meaning only sensor noise is left. Adding a 5-sample moving average raises the RMSE to <b>0.46</b>, a 5-sample median to <b>0.51</b>: the delay of causal smoothers adds more error than the noise during the morning and evening, when temperature changes fast. Lesson: smoothing does not always improve things; do not decide without measuring.</p>`,
      code: [cleanCpp('en'), hampelPy('en')],
      lab: 'On the cleaning bench, switch the outlier method between z-score, IQR and Hampel; write down how many points each flags and how many spikes it catches. Switch the fill method between forward fill and linear interpolation and look at the RMSE. Then switch the smoother between moving average, median and exponential average and grow the window from 3 to 15: where is the RMSE smallest? Compare with the roughness and delay columns of the Python code.',
      pitfalls: ['Smoothing first and looking for outliers afterwards: the spike mixes into the average and can no longer be found.', 'Using the z-score alone: extremes inflate σ and medium-sized errors are masked.', 'Filling long gaps by linear interpolation: the daily peak or low is silently erased.', 'Using a centred (future-looking) smoother in a live system or as a feature: information leaks from the future.', 'Writing the cleaned data over the raw data: you lose track of which points were changed.'],
      se: `<p>A cleaning pipeline should be built from small, pure functions: <code>hampel</code>, <code>interpLinear</code>, <code>movingAvg</code>. Each does one job and is tested separately.</p>
<ul><li>Test the edge cases: an all-NaN series, gaps at the start and at the end, a window with a single element.</li><li>Record how many points each step changed (data lineage). When something goes wrong you can find which step is to blame.</li><li>Check with a test vector that the C++ cleaner on the device and the Python cleaner give the same output for the same input.</li></ul>`,
      quiz: [
        { q: 'Why can the z-score method miss medium-sized errors when large spikes are present?', options: ['Because it only looks at negative values', 'Extremes inflate the mean and σ, so the threshold widens (masking)', 'Because it counts NaN values', 'Because it uses the median'], answer: 1, why: 'σ is affected by extremes; when the k·σ threshold widens, smaller errors stay inside.' },
        { q: 'What is the advantage of the Hampel filter over IQR?', options: ['It does less computation', 'It is local: in a daily cycle it tells the noon temperature from a spike', 'It fills missing data', 'It never flags anything wrongly'], answer: 1, why: 'Hampel compares each point with the median and MAD of its own neighbourhood; IQR applies a single threshold to the whole series.' },
        { q: 'On the device, in a live stream, which can be used to fill a missing sample?', options: ['Linear interpolation', 'A centred moving average', 'Forward fill (last valid value)', 'The value from the next day'], answer: 2, why: 'Linear interpolation and the centred average need to know the future; forward fill uses only the past.' },
        { q: 'Adding a 5-sample moving average to the clean series raised the RMSE from 0.25 to 0.46. Why?', options: ['A moving average increases noise', 'The delay of a causal average adds error during fast changes', 'The window is too short', 'The RMSE was computed wrongly'], answer: 1, why: 'A causal window lags by about two samples; when warming and cooling are fast in the morning and evening, this delay is a larger error than the noise.' },
      ],
    },
  },
  {
    n: 3, sims: ['kalman'], parts: ['dht22', 'bme280'],
    related: [
      { href: '/muhendislik/robotik', tr: 'ESOF 323: sensör füzyonu ve süzgeçler', en: 'ESOF 323: sensor fusion and filters' },
      { href: '/muhendislik/drone', tr: 'Drone dersi: IMU ve barometre füzyonu', en: 'Drone course: IMU and barometer fusion' },
      { href: '/makine-ogrenmesi/nesne-takibi', tr: 'ML dersi: Kalman ile nesne takibi', en: 'ML course: object tracking with Kalman' },
    ],
    py: { file: 'kalman.py', code: py3, data: ['sera-sensorleri'] },
    tr: {
      title: 'Kalman süzgecine giriş: modele mi ölçüme mi güvenmeli',
      summary: 'Tahmin ve güncelleme adımları, Q ve R\'nin anlamı, kazancın oturması ve tek boyutta Kalman ile üstel ortalamanın akrabalığı.',
      goals: ['Tek boyutlu Kalman süzgecinin tahmin ve güncelleme adımlarını yazmak', 'Q ve R\'nin süzgecin davranışını nasıl değiştirdiğini açıklamak', 'Durağan kazancı hesaplamak ve aynı kazançlı üstel ortalamayla karşılaştırmak', 'Kalman\'ın ne zaman EMA\'dan fazlasını verdiğini söylemek'],
      notes: `<p>Bir sensörü okurken iki bilgi kaynağın vardır: <b>model</b> ("sıcaklık on dakikada pek değişmez") ve <b>ölçüm</b> ("DHT22 şu an 24,3 diyor"). İkisi de hatalıdır. Kalman süzgeci her adımda ikisini, belirsizlikleriyle orantılı olarak karıştırır.</p>
<h3>Model ve iki gürültü</h3>
<div class="eq">x<sub>k</sub> = x<sub>k−1</sub> + w, Var(w) = Q &nbsp;&nbsp; z<sub>k</sub> = x<sub>k</sub> + v, Var(v) = R</div>
<ul><li><b>Q (süreç gürültüsü)</b>: gerçek değer bir adımda ne kadar değişebilir? Sera yavaş ısınır, Q küçüktür.</li><li><b>R (ölçüm gürültüsü)</b>: sensöre ne kadar güvenebilirsin? DHT22 için yaklaşık 0,25² = 0,0625 °C².</li></ul>
<h3>İki adım</h3>
<ol><li><b>Tahmin</b>: x aynı kalır, belirsizlik büyür: P ← P + Q.</li><li><b>Güncelleme</b>: kazanç K = P / (P + R). Tahmin yeniliğin K katı kadar ölçüme kayar: x ← x + K(z − x). Belirsizlik küçülür: P ← (1 − K)P.</li></ol>
<p>K 0'a yakınsa süzgeç modele güvenir (yumuşak ama geç tepki), 1'e yakınsa ölçüme güvenir (hızlı ama gürültülü). Ölçüm yoksa (NaN) yalnız tahmin adımı yapılır: P büyür, sonraki ölçüme daha çok güvenilir. Bu, eksik veriyi doldurmanın ilkeli bir yoludur.</p>
<h3>Kazanç oturur</h3>
<p>Q ve R sabitse P birkaç adımda sabit bir değere, K de <b>durağan kazanca</b> oturur:</p>
<div class="eq">P<sub>∞</sub> = (Q + √(Q² + 4QR)) / 2 &nbsp;&nbsp; K<sub>∞</sub> = P<sub>∞</sub> / (P<sub>∞</sub> + R)</div>
<p>Q = 0,02 ve R = 0,0625 için K<sub>∞</sub> ≈ 0,43'tür. Oturduktan sonra Kalman güncellemesi <code>x += K(z − x)</code> tam olarak α = K olan bir <b>üstel ortalamadır</b>. Tek boyutta, sabit gürültüde Kalman'ın sana kattığı şey α'yı tahminle değil, fiziksel olarak anlamlı iki sayıdan (sensör belgesindeki gürültü ve sürecin hızı) türetmektir. Sera verisinde bu süzgeç gerçek sıcaklığa karşı yaklaşık 0,31 °C RMSE verir.</p>
<h3>Kalman ne zaman fazlasını verir?</h3>
<ul><li><b>Değişken R</b>: sensör bazen daha gürültülüyse (ör. GPS uydu sayısı düştüğünde) K her adımda kendini ayarlar.</li><li><b>Eksik ölçüm</b>: P büyüyerek belirsizliği taşır.</li><li><b>Çok boyut ve füzyon</b>: konum ve hız birlikte, ya da barometre ile ivmeölçer birlikte. Drone dersindeki füzyon bunun genelleşmesidir.</li><li><b>Yenilik izleme</b>: z − x yeniliği beklenen dağılımın dışına çıkarsa model bozulmuştur. 5. günkü ısıtıcı arızasının ilk üç saatinde ortalama yenilik +0,68 °C'dir, bir gün önce aynı saatlerde −0,17 °C: bu, anomali uyarısının tohumudur.</li></ul>`,
      code: [kalmanCpp('tr'), steadyPy('tr')],
      lab: '1B Kalman simülasyonunda R\'yi 0,0625\'te tut, Q\'yu 0,002\'den 0,2\'ye çıkar: tahmin eğrisi ve kazanç K nasıl değişiyor? Sonra Q\'yu sabit tutup R\'yi 10 kat büyüt ve aynı etkiyi ters yönden elde ettiğini göster. Kazancın oturduğu değeri not et ve aynı α ile çizilen üstel ortalamanın Kalman eğrisinin üstüne bindiğini doğrula. Python kodunda K(son) ile formül değerini karşılaştır ve arızanın ilk saatlerindeki ortalama yeniliği normal günle karşılaştır.',
      pitfalls: ['Q ve R\'yi gerçek birimlerle düşünmemek: R sensörün varyansıdır (°C²), standart sapması değil.', 'Kalman\'ı aykırı değer temizliğinin yerine koymak: 85 °C\'lik sıçrama, K kadar ağırlıkla tahmini bozar; önce aralık ya da Hampel denetimi.', 'Başlangıç P\'sini çok küçük seçmek: süzgeç ilk ölçümlere güvenmez ve yavaş yakınsar.', 'Model yanlışken Q\'yu küçültmeye devam etmek: süzgeç gerçek değişimi gürültü sanar ve geride kalır.'],
      se: `<p>Kalman süzgeci küçük bir <b>durum makinesi</b>dir: durum (x, P), girdi (z) ve iki saf geçiş (tahmin, güncelleme).</p>
<ul><li>Parametreleri (Q, R, P<sub>0</sub>) koda gömme; yapılandırma olarak ver ve neden o değeri seçtiğini yorumla.</li><li>Özellik testi: sabit girdi verildiğinde tahmin o değere yakınsar; R → ∞ iken K → 0; Q → ∞ iken K → 1.</li><li>Durağan kazanç formülünü uzun bir döngünün son K değeriyle karşılaştıran bir test, iki kodun da doğru olduğunu kanıtlar.</li></ul>`,
      quiz: [
        { q: 'R (ölçüm gürültüsü) büyütülürse kazanç K ne olur?', options: ['Büyür, süzgeç ölçüme daha çok güvenir', 'Küçülür, süzgeç modele daha çok güvenir', 'Değişmez', 'Negatif olur'], answer: 1, why: 'K = P / (P + R); R büyüdükçe K küçülür ve tahmin daha yumuşak ama daha geç olur.' },
        { q: 'Ölçüm NaN geldiğinde 1B Kalman ne yapar?', options: ['Ölçümü 0 sayar', 'Süzgeci sıfırlar', 'Yalnız tahmin adımını yapar: x aynı kalır, P büyür', 'Son ölçümü tekrar kullanır'], answer: 2, why: 'Güncelleme yapılamaz; belirsizlik Q kadar artar ve sonraki ölçüme daha çok güvenilir.' },
        { q: 'Q ve R sabitken, kazanç oturduktan sonra 1B Kalman neye eşdeğerdir?', options: ['Medyan süzgecine', 'Hareketli ortalamaya', 'α = K∞ olan üstel ortalamaya', 'Doğrusal ara değere'], answer: 2, why: 'x += K(z − x) güncellemesi sabit K ile tam olarak bir EMA\'dır.' },
        { q: 'Isıtıcı arızasının ilk saatlerinde Kalman yeniliği (z − x) nasıl davranır?', options: ['Sıfır etrafında rastgele kalır', 'Sıcaklık yükselirken çoğunlukla pozitif kalır, çünkü model "sabit" der', 'Sürekli negatif olur', 'NaN olur'], answer: 1, why: 'Gerçek değer modelin öngördüğünden hızlı arttığı için ölçüm çoğunlukla tahminin üstündedir; bu, anomali işaretidir.' },
      ],
    },
    en: {
      title: 'Introduction to the Kalman filter: trust the model or the measurement',
      summary: 'Predict and update steps, what Q and R mean, how the gain settles, and the kinship between a 1D Kalman filter and an exponential average.',
      goals: ['Write the predict and update steps of a one-dimensional Kalman filter', 'Explain how Q and R change the behaviour of the filter', 'Compute the steady-state gain and compare it with an exponential average of the same gain', 'Say when a Kalman filter gives more than an EMA'],
      notes: `<p>When reading a sensor you have two sources of information: the <b>model</b> ("temperature hardly changes in ten minutes") and the <b>measurement</b> ("the DHT22 says 24.3 right now"). Both are wrong. At every step the Kalman filter blends the two in proportion to their uncertainty.</p>
<h3>Model and two noises</h3>
<div class="eq">x<sub>k</sub> = x<sub>k−1</sub> + w, Var(w) = Q &nbsp;&nbsp; z<sub>k</sub> = x<sub>k</sub> + v, Var(v) = R</div>
<ul><li><b>Q (process noise)</b>: how much can the true value change in one step? A greenhouse warms slowly, so Q is small.</li><li><b>R (measurement noise)</b>: how much can you trust the sensor? About 0.25² = 0.0625 °C² for a DHT22.</li></ul>
<h3>Two steps</h3>
<ol><li><b>Predict</b>: x stays the same, uncertainty grows: P ← P + Q.</li><li><b>Update</b>: gain K = P / (P + R). The estimate moves toward the measurement by K times the innovation: x ← x + K(z − x). Uncertainty shrinks: P ← (1 − K)P.</li></ol>
<p>When K is near 0 the filter trusts the model (smooth but slow to react); near 1 it trusts the measurement (fast but noisy). When there is no measurement (NaN) only the predict step runs: P grows and the next measurement is trusted more. This is a principled way to fill missing data.</p>
<h3>The gain settles</h3>
<p>If Q and R are constant, P settles to a fixed value within a few steps and K settles to the <b>steady-state gain</b>:</p>
<div class="eq">P<sub>∞</sub> = (Q + √(Q² + 4QR)) / 2 &nbsp;&nbsp; K<sub>∞</sub> = P<sub>∞</sub> / (P<sub>∞</sub> + R)</div>
<p>For Q = 0.02 and R = 0.0625, K<sub>∞</sub> ≈ 0.43. Once settled, the Kalman update <code>x += K(z − x)</code> is exactly an <b>exponential average</b> with α = K. In one dimension with constant noise, what the Kalman filter adds is deriving α not by guessing but from two physically meaningful numbers (the noise in the sensor datasheet and the speed of the process). On the greenhouse data this filter gives about 0.31 °C RMSE against the true temperature.</p>
<h3>When does Kalman give more?</h3>
<ul><li><b>Varying R</b>: if the sensor is sometimes noisier (for example when a GPS loses satellites), K adjusts itself at every step.</li><li><b>Missing measurements</b>: P grows and carries the uncertainty.</li><li><b>Many dimensions and fusion</b>: position and velocity together, or a barometer together with an accelerometer. The fusion in the drone course is the generalisation of this.</li><li><b>Innovation monitoring</b>: if the innovation z − x leaves its expected distribution, the model is broken. In the first three hours of the heater fault on day 5 the mean innovation is +0.68 °C, against −0.17 °C at the same hours a day earlier: this is the seed of the anomaly alert.</li></ul>`,
      code: [kalmanCpp('en'), steadyPy('en')],
      lab: 'In the 1D Kalman simulation keep R at 0.0625 and raise Q from 0.002 to 0.2: how do the estimate curve and the gain K change? Then hold Q and make R ten times larger, and show you get the same effect from the other direction. Note the value where the gain settles and confirm that an exponential average drawn with the same α lies on top of the Kalman curve. In the Python code compare K(last) with the formula value and compare the mean innovation in the first hours of the fault with a normal day.',
      pitfalls: ['Not thinking about Q and R in real units: R is the variance of the sensor (°C²), not its standard deviation.', 'Using a Kalman filter instead of outlier cleaning: an 85 °C spike corrupts the estimate with weight K; run a range or Hampel check first.', 'Choosing a very small initial P: the filter distrusts the first measurements and converges slowly.', 'Shrinking Q further when the model is wrong: the filter mistakes real change for noise and lags behind.'],
      se: `<p>A Kalman filter is a small <b>state machine</b>: a state (x, P), an input (z) and two pure transitions (predict, update).</p>
<ul><li>Do not hard-code the parameters (Q, R, P<sub>0</sub>); pass them as configuration and comment on why you chose each value.</li><li>Property tests: for a constant input the estimate converges to that value; as R → ∞, K → 0; as Q → ∞, K → 1.</li><li>A test comparing the steady-state gain formula with the last K of a long loop proves that both pieces of code are right.</li></ul>`,
      quiz: [
        { q: 'What happens to the gain K if R (measurement noise) is increased?', options: ['It grows; the filter trusts the measurement more', 'It shrinks; the filter trusts the model more', 'It does not change', 'It becomes negative'], answer: 1, why: 'K = P / (P + R); as R grows, K shrinks and the estimate becomes smoother but slower.' },
        { q: 'What does a 1D Kalman filter do when the measurement is NaN?', options: ['Treats the measurement as 0', 'Resets the filter', 'Runs only the predict step: x stays, P grows', 'Reuses the last measurement'], answer: 2, why: 'No update is possible; uncertainty grows by Q and the next measurement is trusted more.' },
        { q: 'With constant Q and R, once the gain has settled, a 1D Kalman filter is equivalent to what?', options: ['A median filter', 'A moving average', 'An exponential average with α = K∞', 'Linear interpolation'], answer: 2, why: 'The update x += K(z − x) with a constant K is exactly an EMA.' },
        { q: 'How does the Kalman innovation (z − x) behave in the first hours of the heater fault?', options: ['It stays random around zero', 'It stays mostly positive while the temperature rises, because the model says "constant"', 'It stays negative', 'It becomes NaN'], answer: 1, why: 'The true value rises faster than the model predicts, so the measurement is mostly above the estimate; this is an anomaly sign.' },
      ],
    },
  },
  {
    n: 4, sims: ['gorsel'], parts: ['esp32-esp32-wroom-devkit', 'oled-ssd1306-0-96'], wokwi: true,
    related: [
      { href: '/makine-ogrenmesi/pca', tr: 'ML dersi: korelasyondan PCA\'ya', en: 'ML course: from correlation to PCA' },
      { href: '/makine-ogrenmesi/veri-setleri', tr: 'ML veri setleri: sütun açıklamaları', en: 'ML datasets: column descriptions' },
      { href: '/muhendislik/iot', tr: 'IoT dersi: canlı pano', en: 'IoT course: the live dashboard' },
      { href: '/laboratuvar', tr: 'Devre laboratuvarı: SSD1306 OLED kiti', en: 'Circuit lab: the SSD1306 OLED kit' },
    ],
    py: { file: 'analiz.py', code: py4, data: ['sera-sensorleri'] },
    tr: {
      title: 'Gömülü veri analizi ve görselleştirme',
      summary: 'Model kurmadan önce veriye bak: tanımlayıcı istatistik, histogram, günlük profil, korelasyon ve cihazda Welford ile sabit bellekli istatistik.',
      goals: ['Bir sensör serisinin tanımlayıcı istatistiklerini hesaplayıp yorumlamak', 'Histogram, günlük profil ve korelasyon matrisiyle veri hakkında hipotez kurmak', 'Welford yöntemiyle cihazda diziyi saklamadan ortalama ve varyans hesaplamak', 'Seri Çizici ve küçük bir OLED ekranla cihazda görselleştirme yapmak'],
      notes: `<p>Model eğitmeden önce veriye bakmak, kodu çalıştırmadan önce okumak gibidir: hataların çoğu burada yakalanır. Bu ünitede temizlenmiş sera verisine üç açıdan bakacağız ve aynı istatistiklerin bir kısmını mikrodenetleyicide hesaplayacağız.</p>
<h3>Tanımlayıcı istatistik</h3>
<ul><li><b>Ortalama ve σ</b>: veri setinin merkezi ve yayılımı. Sıçramalar silinmeden hesaplanırsa tek bir 85 °C ortalamayı belirgin biçimde kaydırır; önce temizlik.</li><li><b>Medyan</b>: uç değere dayanıklı merkez. Ortalama ile medyan arasındaki büyük fark, çarpık dağılımın ya da kalmış aykırı değerin işaretidir.</li><li><b>En küçük ve en büyük</b>: sensörün fiziksel aralığıyla karşılaştır. Işık 0 ile 1023 arasında olmalı, nem %100'ü geçmemeli.</li></ul>
<h3>Üç bakış</h3>
<ol><li><b>Zaman serisi ve günlük profil</b>: her saatin ortalaması "tipik bir günü" verir. Sera sıcaklığı güneşten biraz geride kalır: ışığın tepesi 12:00'de, sıcaklığın tepesi 14:00 ile 15:00 arasındadır. Bu gecikme, sonraki ünitede gecikmeli özelliklerin neden işe yaradığının ipucudur.</li><li><b>Histogram</b>: sıcaklık sağa çarpıktır; zamanın çoğu gece ve sabah 17 ile 21 °C arasında geçer, sıcak öğleden sonralar uzun bir kuyruk oluşturur. Ortalama (21,1 °C) medyanın (20,4 °C) üstündedir. Normal dağılım varsayan bir eşik burada yanıltır.</li><li><b>Korelasyon matrisi</b>: Pearson r iki değişkenin doğrusal birlikteliğini ölçer. Sıcaklık ile nem çok güçlü negatiftir (r ≈ −0,98: ısınan havanın bağıl nemi düşer), sıcaklık ile ışık pozitiftir (r ≈ 0,71). Basınç ve su deposu mesafesi sıcaklıkla zayıf ilişkilidir.</li></ol>
<p>Korelasyon nedensellik değildir ve yalnız doğrusal ilişkiyi görür. Yine de hangi sensörün tahmine yardım edeceğine dair ilk ve ucuz ipucudur.</p>
<h3>Cihazda istatistik: Welford</h3>
<p>Bir ESP32 günlük 144 örneği kolayca saklar, ama Uno'nun 2 KB RAM'i ya da saniyede yüz örnek alan bir titreşim sensörü için dizi saklamak lüks olur. <b>Welford yöntemi</b> tek geçişte, sabit bellekle ortalama ve varyans verir:</p>
<div class="eq">n ← n + 1; d = x − ort; ort ← ort + d / n; M2 ← M2 + d · (x − ort); σ² = M2 / (n − 1)</div>
<p>"Kareler toplamı eksi toplamın karesi" formülü float hassasiyetinde büyük sayıları çıkarırken çöker; Welford bu çıkarmayı yapmaz. Python kodu aynı döngüyü çalıştırıp NumPy ile dördüncü basamağa kadar aynı sonucu verdiğini gösterir.</p>
<h3>Cihazda görselleştirme</h3>
<p>Arduino Seri Çizici <code>ad:değer</code> çiftlerini ayrı çizgiler olarak çizer: ham ve temiz sıcaklığı ve eşiği aynı anda izlemenin en ucuz yolu. Sahada bilgisayar yoksa 128×64'lük bir SSD1306 OLED son 128 örneği bir kıvılcım çizgisi (sparkline) olarak gösterir; birlikte Welford özetini de yazdırabilirsin.</p>`,
      code: [welfordCpp('tr'), plotterCpp('tr')],
      lab: 'Veri analizi panosunda önce sıcaklığın zaman serisini ve günlük profilini aç: ışığın ve sıcaklığın tepe saatlerini yaz. Histogramda kutu sayısını değiştir ve sağa çarpık kuyruğu bul. Korelasyon ısı haritasında sıcaklık ile nem, sıcaklık ile ışık değerlerini oku; hangisi negatif? Alttaki Welford özetini NumPy çıktısıyla karşılaştır. Wokwi\'de ESP32 ve SSD1306 ile son 128 örneği sparkline olarak çizen kodu dene.',
      pitfalls: ['Aykırı değerleri silmeden ortalama ve σ hesaplamak: tek bir 85 °C sıçraması özeti bozar.', 'Korelasyonu nedensellik saymak: ışık sıcaklığı etkiler ama nemin sıcaklığı düşürdüğü söylenemez.', 'Cihazda varyansı kareler toplamı formülüyle float olarak hesaplamak: büyük n\'de hassasiyet kaybolur, negatif varyans bile çıkabilir.', 'Histogramı tek bir kutu sayısıyla yorumlamak: çok az kutu kuyruğu ve ikinci tepeleri gizler.', 'Günlük profili zaman damgası yerine satır numarasından hesaplamak: eksik satırlar saatleri kaydırır.'],
      se: `<p>Keşifsel analiz bir kez yapılıp unutulmamalı; tekrarlanabilir bir rapor olmalıdır.</p>
<ul><li>Analizi bir betik ya da defter olarak depoda tut; aynı veri aynı grafikleri versin.</li><li>Gözlemlerini <b>veri varsayımı testlerine</b> çevir: "nem 0 ile 100 arasında", "sıcaklık ile nem korelasyonu negatif". Yeni veri gelince testler kırılırsa veri değişmiştir.</li><li>Cihazdaki Welford ile sunucudaki NumPy özetinin aynı olduğunu doğrulayan bir test, iki uç arasındaki sözleşmeyi korur.</li></ul>`,
      quiz: [
        { q: 'Sera verisinde sıcaklık ile bağıl nem arasındaki korelasyon için en olası işaret?', options: ['Güçlü pozitif', 'Güçlü negatif', 'Tam sıfır', 'Tanımsız'], answer: 1, why: 'Hava ısındıkça aynı su buharı miktarı için bağıl nem düşer; iki seri ters yönde hareket eder.' },
        { q: 'Welford yönteminin cihazdaki üstünlüğü nedir?', options: ['Medyanı da hesaplaması', 'Sabit bellekle tek geçişte ortalama ve varyans vermesi ve sayısal olarak kararlı olması', 'Aykırı değerleri otomatik silmesi', 'Yalnız tamsayı kullanması'], answer: 1, why: 'Birkaç değişken (n, ortalama, M2) yeter; büyük sayıların çıkarılması yapılmadığı için float hassasiyeti korunur.' },
        { q: 'Sıcaklığın tepesi ışığın tepesinden yaklaşık üç saat sonra geliyor. Bu bilgi model için ne anlama gelir?', options: ['Işık sensörü bozuktur', 'Geçmiş ışık ve sıcaklık değerleri (gecikmeli özellikler) gelecek sıcaklığı tahmin etmeye yardım eder', 'Örnekleme aralığı yanlıştır', 'Sıcaklık tahmin edilemez'], answer: 1, why: 'Isıl atalet yüzünden bugünkü güneş birkaç saat sonraki sıcaklığı belirler; bu gecikme özellik mühendisliğinin temelidir.' },
        { q: 'Ortalama ile medyan arasında büyük fark görüyorsun. İlk kontrol ne olmalı?', options: ['Modeli hemen eğitmek', 'Kalmış aykırı değer ya da çarpık dağılım olup olmadığına bakmak', 'Örnekleme aralığını iki katına çıkarmak', 'Medyanı silmek'], answer: 1, why: 'Ortalama uç değerlere duyarlı, medyan değildir; fark çoğu zaman temizlenmemiş sıçramaların ya da çarpıklığın işaretidir.' },
      ],
    },
    en: {
      title: 'Embedded data analysis and visualisation',
      summary: 'Look at the data before building a model: descriptive statistics, histogram, daily profile, correlation, and constant-memory statistics on the device with Welford.',
      goals: ['Compute and interpret the descriptive statistics of a sensor series', 'Form hypotheses about the data with a histogram, a daily profile and a correlation matrix', 'Compute the mean and variance on the device without storing the array, using Welford\'s method', 'Visualise on the device with the Serial Plotter and a small OLED display'],
      notes: `<p>Looking at the data before training a model is like reading code before running it: most mistakes are caught here. In this unit we look at the cleaned greenhouse data from three angles and compute some of the same statistics on the microcontroller.</p>
<h3>Descriptive statistics</h3>
<ul><li><b>Mean and σ</b>: the centre and spread of the dataset. If computed before the spikes are removed, a single 85 °C noticeably shifts the mean; clean first.</li><li><b>Median</b>: a centre that is robust to extremes. A large gap between mean and median signals a skewed distribution or a remaining outlier.</li><li><b>Minimum and maximum</b>: compare them with the physical range of the sensor. Light must be between 0 and 1023, humidity must not exceed 100%.</li></ul>
<h3>Three views</h3>
<ol><li><b>Time series and daily profile</b>: the mean of each hour gives "a typical day". Greenhouse temperature lags slightly behind the sun: light peaks at 12:00, temperature between 14:00 and 15:00. This lag is the hint for why lagged features work in the next unit.</li><li><b>Histogram</b>: temperature is skewed to the right; most of the time is spent between 17 and 21 °C at night and in the morning, and the warm afternoons form a long tail. The mean (21.1 °C) is above the median (20.4 °C). A threshold that assumes a normal distribution misleads here.</li><li><b>Correlation matrix</b>: Pearson r measures the linear association of two variables. Temperature and humidity are very strongly negative (r ≈ −0.98: the relative humidity of warming air drops), temperature and light are positive (r ≈ 0.71). Pressure and water tank distance are weakly related to temperature.</li></ol>
<p>Correlation is not causation and sees only linear relationships. Still, it is the first and cheapest hint about which sensor will help the forecast.</p>
<h3>Statistics on the device: Welford</h3>
<p>An ESP32 easily stores the 144 samples of a day, but for the 2 KB of RAM on an Uno, or for a vibration sensor taking a hundred samples a second, storing the array is a luxury. <b>Welford's method</b> gives the mean and variance in one pass with constant memory:</p>
<div class="eq">n ← n + 1; d = x − mean; mean ← mean + d / n; M2 ← M2 + d · (x − mean); σ² = M2 / (n − 1)</div>
<p>The "sum of squares minus square of the sum" formula breaks down in float precision when subtracting large numbers; Welford never does that subtraction. The Python code runs the same loop and shows it matches NumPy to the fourth decimal.</p>
<h3>Visualisation on the device</h3>
<p>The Arduino Serial Plotter draws <code>name:value</code> pairs as separate lines: the cheapest way to watch the raw and clean temperature and a threshold at the same time. In the field, without a computer, a 128×64 SSD1306 OLED shows the last 128 samples as a sparkline; you can print the Welford summary with it.</p>`,
      code: [welfordCpp('en'), plotterCpp('en')],
      lab: 'On the data analysis board, first open the temperature time series and the daily profile: write down the peak hours of light and of temperature. Change the number of bins in the histogram and find the right-skewed tail. On the correlation heat map read temperature against humidity and temperature against light; which is negative? Compare the Welford summary below with the NumPy output. In Wokwi, try the code that draws the last 128 samples as a sparkline with an ESP32 and an SSD1306.',
      pitfalls: ['Computing the mean and σ without removing outliers: a single 85 °C spike ruins the summary.', 'Treating correlation as causation: light affects temperature, but you cannot say humidity lowers temperature.', 'Computing variance on the device in float with the sum-of-squares formula: precision is lost for large n and the variance can even come out negative.', 'Reading a histogram with a single bin count: too few bins hide the tail and secondary peaks.', 'Computing the daily profile from the row number instead of the timestamp: missing rows shift the hours.'],
      se: `<p>Exploratory analysis should not be done once and forgotten; it should be a reproducible report.</p>
<ul><li>Keep the analysis in the repository as a script or notebook; the same data should produce the same charts.</li><li>Turn your observations into <b>data assumption tests</b>: "humidity is between 0 and 100", "temperature and humidity are negatively correlated". If the tests break when new data arrives, the data has changed.</li><li>A test confirming that Welford on the device and the NumPy summary on the server agree protects the contract between the two ends.</li></ul>`,
      quiz: [
        { q: 'What is the most likely sign of the correlation between temperature and relative humidity in the greenhouse data?', options: ['Strongly positive', 'Strongly negative', 'Exactly zero', 'Undefined'], answer: 1, why: 'As air warms, relative humidity falls for the same amount of water vapour; the two series move in opposite directions.' },
        { q: 'What is the advantage of Welford\'s method on the device?', options: ['It also computes the median', 'It gives the mean and variance in one pass with constant memory and is numerically stable', 'It removes outliers automatically', 'It uses integers only'], answer: 1, why: 'A few variables (n, mean, M2) are enough; since no large numbers are subtracted, float precision is preserved.' },
        { q: 'The temperature peak comes about three hours after the light peak. What does this mean for a model?', options: ['The light sensor is broken', 'Past light and temperature values (lagged features) help forecast future temperature', 'The sampling interval is wrong', 'Temperature cannot be forecast'], answer: 1, why: 'Because of thermal inertia, today\'s sun sets the temperature a few hours later; this lag is the basis of feature engineering.' },
        { q: 'You see a large gap between the mean and the median. What should you check first?', options: ['Train the model right away', 'Whether there is a remaining outlier or a skewed distribution', 'Double the sampling interval', 'Delete the median'], answer: 1, why: 'The mean is sensitive to extremes and the median is not; the gap usually signals uncleaned spikes or skew.' },
      ],
    },
  },
]
