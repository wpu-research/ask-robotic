// Sensör Verisinden Makine Öğrenmesi Tahmini (büyükler için, 16+): 8 ünite, 8 tarayıcı simülasyonu, Pyodide ile tarayıcıda
// Python (ML dersinin çalıştırıcısı ve /veri/ml/sera-sensorleri.csv), bitirme projesi "sıcaklık tahmini ve anomali uyarısı".
import type { SensorSimId } from '@/components/sensor-ml/sim-meta'
import { D, type Capstone, type CodeBlock, type CourseMeta, type CourseUnit, type Lang } from '@/lib/kurs/types'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

export const SML_UNITS: readonly CourseUnit<SensorSimId>[] = [...UNITS_A, ...UNITS_B]
export const smlUnitOf = (n: number) => SML_UNITS.find((u) => u.n === n)

export const SML_META: CourseMeta = {
  slug: 'sensor-ml', code: 'SENSÖR-ML', hours: 32,
  tr: {
    title: 'Sensör Verisinden Makine Öğrenmesi Tahmini',
    lede: 'Seradaki sensörlerden zaman serisi topla, gürültüyü, eksik veriyi ve sıçramaları temizle, veriyi gör ve anla, özellik çıkar, model eğit ve dürüstçe değerlendir; sonra modeli mikrodenetleyiciye C kodu olarak taşı ve arızayı önceden haber veren bir uyarı kur. Python tarayıcıda çalışır, veri seti indirilebilir.',
    audience: '16 yaş ve üstü; meslek lisesi, ön lisans ve üniversite öğrencileri, veriyle çalışan teknisyen ve mühendisler.',
    duration: '8 hafta, haftada yaklaşık 4 saat (toplam 32 saat: 24 saat ünite + 8 saat bitirme projesi).',
    prereq: 'Temel Python (liste, döngü, fonksiyon) ve lise matematiği. ESP32 ile Nesnelerin İnterneti dersi ve Makine öğrenmesi dersinin ilk dersleri yardımcıdır ama şart değildir.',
    outcomes: [
      'Sensörden doğru aralıkla, zaman damgalı ve eksikleri işaretli bir zaman serisi kaydetmek',
      'Aykırı değerleri (z-skoru, IQR, Hampel) bulmak, eksik veriyi doldurmak, nedensel süzgeçlerle yumuşatmak',
      'Tek boyutlu Kalman süzgecini kurmak, Q ve R\'nin etkisini açıklamak',
      'Veriyi histogram, günlük profil ve korelasyonla analiz etmek; cihaz üstünde Welford ile istatistik tutmak',
      'Gecikme, kayan istatistik ve döngüsel saat özellikleri çıkarmak; gelecekten sızıntıyı tanımak',
      'Ridge regresyon ve karar kütüğü eğitmek; MAE/RMSE, zamana göre bölme ve kayan pencereyle dürüst değerlendirmek',
      'Eğitilmiş modeli float ve sabit noktalı C koduna çevirip nicemleme hatasını ve taşmayı denetlemek',
      'Tahmin artığıyla histerezisli bir anomali uyarısı kurup gereksinim, test ve demo ile teslim etmek',
    ],
    certificate: 'Üniteleri ve bitirme projesini tamamlayanlar Macademia katılım belgesi alır.',
  },
  en: {
    title: 'Machine Learning Forecasting from Sensor Data',
    lede: 'Collect a time series from greenhouse sensors, clean the noise, missing values and spikes, look at the data and understand it, extract features, train a model and evaluate it honestly; then move the model to a microcontroller as C code and build an alert that warns about a fault early. Python runs in your browser and the dataset can be downloaded.',
    audience: 'Ages 16 and up; vocational high school, associate degree and university students, technicians and engineers who work with data.',
    duration: '8 weeks, about 4 hours a week (32 hours in total: 24 hours of units + 8 hours of capstone project).',
    prereq: 'Basic Python (lists, loops, functions) and high-school maths. The Internet of Things with the ESP32 course and the first lessons of the Machine learning course help but are not required.',
    outcomes: [
      'Log a time series from a sensor at the right interval, with timestamps and missing values marked',
      'Find outliers (z-score, IQR, Hampel), fill missing data and smooth with causal filters',
      'Build a one-dimensional Kalman filter and explain the effect of Q and R',
      'Analyse data with histograms, daily profiles and correlation; keep statistics on the device with Welford',
      'Extract lag, rolling-statistic and cyclic hour features; recognise leakage from the future',
      'Train ridge regression and a decision stump; evaluate honestly with MAE/RMSE, time splits and walk-forward validation',
      'Turn a trained model into float and fixed-point C code and check quantisation error and overflow',
      'Build an anomaly alert with hysteresis from the forecast residual and deliver it with requirements, tests and a demo',
    ],
    certificate: 'Learners who complete the units and the capstone project receive a Macademia certificate of participation.',
  },
}

export const SML_CAPSTONE: Capstone = {
  parts: ['esp32-esp32-wroom-devkit', 'dht22', 'bme280', 'ldr', 'oled-ssd1306-0-96'],
  tr: {
    title: 'Sıcaklık tahmini ve anomali uyarısı',
    summary: 'Sera sıcaklığını 30 dakika sonrası için tahmin eden, tahmin artığı beklenmedik biçimde büyüyünce (takılı kalan ısıtıcı gibi) uyarı veren ve cihaz üstünde çalışan küçük bir model: veriden C koduna, testten demoya.',
    scenario: 'Seranın ısıtıcı rölesi bazen yapışıyor ve kimse fark etmeden sıcaklık saatlerce yükseliyor. Sabit bir "30 °C üstü alarm" eşiği öğle sıcağında boşuna çalıyor, gece ise geç kalıyor. Senden geçmiş veriden "normal"i öğrenen, normalden sapmayı erken yakalayan, yanlış alarmı az ve ESP32\'de çalışabilecek kadar küçük bir tahmin ve uyarı sistemi isteniyor. Veri: /veri/ml/sera-sensorleri.csv (7 gün, 10 dakikada bir) ya da kendi kaydın.',
    requirements: [
      'G1: Temizleme hattı belgelenmiştir; 85 °C ve −40 °C sıçramaların tamamı işaretlenir, eksikler doldurulur, gerçek değere göre RMSE raporlanır.',
      'G2: Model 30 dakika sonrasını tahmin eder ve zamana göre bölünmüş test kümesinde "değişmez" tabanından en az %30 daha düşük RMSE verir.',
      'G3: Doğrulama dürüsttür: rastgele bölme kullanılmaz, eğitim ve test arasında ufuk kadar boşluk vardır; özelliklerde gelecekten bilgi yoktur (testle kanıtlanır).',
      'G4: Uyarı 5. gündeki ısıtıcı arızasını başladıktan sonra en çok 60 dakika içinde yakalar; 7 günde en çok 2 yanlış alarm verir.',
      'G5: Uyarı histerezislidir (açma eşiği > kapama eşiği) ve aynı olay için bekleme süresi içinde tekrarlanmaz.',
      'G6: Model C koduna çevrilir; sabit noktalı sürümün float sürüme göre en büyük hatası 0,05 °C\'nin altındadır ve toplam int32\'ye sığar.',
      'G7: Cihaz üstü kod en çok 1 KB ağırlık ve tampon belleği kullanır; tahmin başına süresi ölçülür ya da hesaplanır.',
    ],
    architecture: [
      'Veri katmanı: kaydedici (ESP32 + DHT22/BME280/LDR) ya da CSV; şema: dakika, saat, sicaklik, nem, basinc, isik, mesafe, ariza.',
      'Hat (Python, tarayıcıda): Hampel → doğrusal ara değer → özellik tablosu (gecikmeler, kayan ortalama/σ, sin/cos saat, ışık) → ridge → değerlendirme.',
      'Dışa aktarım: ağırlıklar → C başlık dosyası (float ve Q-biçimi); aynı tamsayı hesabını yapan Python/JS işleviyle birebir sınanır.',
      'Cihaz: halka tamponda son 12 örnek, özellik hesabı, tahmin, artık z-skoru, histerezisli uyarı durum makinesi; uyarı MQTT ile yayımlanır (IoT dersi).',
      'Her adım saf fonksiyondur; dosya okuma, ağ ve ekran kenarda kalır, böylece hat ve cihaz mantığı donanımsız test edilir.',
    ],
    tests: [
      'Birim: temizleme işlevleri için kenar durumları (baştaki NaN, art arda NaN, tek sıçrama, basamak).',
      'Birim: sızıntı testi: hedefi gelecekte bozunca (h adım sonrasını değiştirince) hiçbir özellik değişmemeli.',
      'Birim: sabit noktalı tahmin ile float tahmin 100 rastgele girdide 0,05 °C içinde.',
      'Tümleşik: kayan pencereli doğrulamanın 4 katında da model tabanı geçiyor.',
      'Kabul: uyarı simülasyonunda arıza yakalanıyor, gecikme ≤ 60 dk, yanlış alarm ≤ 2.',
    ],
    demo: [
      'Defter ya da tarayıcı çalıştırıcısında hattı baştan sona çalıştır: temizleme grafiği, özellik tablosu, model ve taban RMSE\'si.',
      'Üretilen C kodunu göster; Wokwi ya da gerçek ESP32\'de kaydedilmiş veriyi yeniden oynatarak uyarının arıza anında yandığını göster.',
      'Yanlış alarm ve gecikme ödünleşimini eşik değiştirerek anlat; test raporunu sun.',
    ],
  },
  en: {
    title: 'Temperature forecast and anomaly alert',
    summary: 'A small on-device model that forecasts the greenhouse temperature 30 minutes ahead and raises an alert when the forecast residual grows unexpectedly (like a stuck heater): from data to C code, from tests to a demo.',
    scenario: 'The greenhouse heater relay sometimes sticks and the temperature climbs for hours before anyone notices. A fixed "alarm above 30 °C" threshold rings for nothing in the midday heat and is late at night. You are asked for a forecast and alert system that learns "normal" from past data, catches deviations early, keeps false alarms low and is small enough to run on an ESP32. Data: /veri/ml/sera-sensorleri.csv (7 days, every 10 minutes) or your own log.',
    requirements: [
      'R1: The cleaning pipeline is documented; all 85 °C and −40 °C spikes are flagged, gaps are filled, RMSE against the true value is reported.',
      'R2: The model forecasts 30 minutes ahead and, on a time-split test set, has an RMSE at least 30% lower than the "no change" baseline.',
      'R3: Validation is honest: no random split, a gap the size of the horizon between training and test; no information from the future in the features (proven by a test).',
      'R4: The alert catches the heater fault on day 5 at most 60 minutes after it starts; at most 2 false alarms in 7 days.',
      'R5: The alert has hysteresis (on threshold > off threshold) and does not repeat for the same event within the cooldown.',
      'R6: The model is converted to C; the largest error of the fixed-point version against the float version is below 0.05 °C and the sum fits in int32.',
      'R7: The on-device code uses at most 1 KB for weights and buffers; time per prediction is measured or computed.',
    ],
    architecture: [
      'Data layer: logger (ESP32 + DHT22/BME280/LDR) or CSV; schema: dakika, saat, sicaklik, nem, basinc, isik, mesafe, ariza.',
      'Pipeline (Python, in the browser): Hampel → linear interpolation → feature table (lags, rolling mean/σ, sin/cos hour, light) → ridge → evaluation.',
      'Export: weights → C header (float and Q format); tested one to one against a Python/JS function that does the same integer arithmetic.',
      'Device: last 12 samples in a ring buffer, feature computation, forecast, residual z-score, alert state machine with hysteresis; the alert is published over MQTT (IoT course).',
      'Every step is a pure function; file reading, network and display stay at the edges, so the pipeline and device logic are tested without hardware.',
    ],
    tests: [
      'Unit: edge cases for the cleaning functions (leading NaN, consecutive NaN, a single spike, a step).',
      'Unit: leakage test: when the target is changed in the future (h steps ahead), no feature may change.',
      'Unit: fixed-point and float predictions agree within 0.05 °C on 100 random inputs.',
      'Integration: the model beats the baseline in all 4 folds of walk-forward validation.',
      'Acceptance: in the alert simulation the fault is caught, delay ≤ 60 min, false alarms ≤ 2.',
    ],
    demo: [
      'Run the pipeline end to end in a notebook or the browser runner: cleaning chart, feature table, model and baseline RMSE.',
      'Show the generated C code; replay the logged data in Wokwi or on a real ESP32 and show the alert lighting up at the fault.',
      'Explain the false alarm versus delay trade-off by changing the threshold; present the test report.',
    ],
  },
  deliverables: [
    D(2, ['Veri ve temizleme raporu', 'Kendi kaydın ya da sera-sensorleri.csv; temizleme hattı, işaretlenen noktalar, doldurma ve gerçeğe göre RMSE tablosu.'], ['Data and cleaning report', 'Your own log or sera-sensorleri.csv; cleaning pipeline, flagged points, filling and an RMSE table against the truth.']),
    D(4, ['Keşifçi analiz', 'Histogram, günlük profil, korelasyon ısı haritası ve üç cümlelik yorum; cihaz üstü Welford istatistiği.'], ['Exploratory analysis', 'Histogram, daily profile, correlation heat map and a three-sentence interpretation; on-device Welford statistics.']),
    D(6, ['Model ve dürüst değerlendirme', 'Özellik tablosu, sızıntı testi, ridge modeli; zamana göre bölme ve kayan pencereyle tabana karşı RMSE (G2, G3).'], ['Model and honest evaluation', 'Feature table, leakage test, ridge model; RMSE against the baseline with a time split and walk-forward validation (R2, R3).']),
    D(7, ['Cihaz kodu', 'Float ve sabit noktalı C kodu, nicemleme hatası ve taşma denetimi, bellek ve süre hesabı (G6, G7).'], ['Device code', 'Float and fixed-point C code, quantisation error and overflow check, memory and time calculation (R6, R7).']),
    D(8, ['Uyarı, testler ve demo', 'Histerezisli uyarı, değerlendirme (gecikme, yanlış alarm), test raporu ve 5 dakikalık demo.'], ['Alert, tests and demo', 'Alert with hysteresis, evaluation (delay, false alarms), test report and a 5-minute demo.']),
  ],
  grading: [
    { tr: 'Veri, temizleme ve analiz', en: 'Data, cleaning and analysis', pct: 20 },
    { tr: 'Model ve dürüst değerlendirme', en: 'Model and honest evaluation', pct: 25 },
    { tr: 'Cihaz kodu (C, nicemleme)', en: 'Device code (C, quantisation)', pct: 20 },
    { tr: 'Anomali uyarısı ve testler', en: 'Anomaly alert and tests', pct: 20 },
    { tr: 'Demo ve sunum', en: 'Demo and presentation', pct: 15 },
  ],
}

export const SML_RELATED = [
  { href: '/muhendislik/iot', tr: 'ESP32 ile Nesnelerin İnterneti (veriyi toplayan ders)', en: 'Internet of Things with the ESP32 (the course that collects the data)' },
  { href: '/makine-ogrenmesi/veri-setleri', tr: 'ML veri setleri: sera-sensorleri.csv', en: 'ML datasets: sera-sensorleri.csv' },
  { href: '/makine-ogrenmesi/dogrusal-regresyon', tr: 'Makine öğrenmesi: doğrusal regresyon', en: 'Machine learning: linear regression' },
  { href: '/makine-ogrenmesi/karar-agaci', tr: 'Makine öğrenmesi: karar ağacı', en: 'Machine learning: decision tree' },
  { href: '/makine-ogrenmesi/asiri-ogrenme', tr: 'Makine öğrenmesi: aşırı öğrenme', en: 'Machine learning: overfitting' },
  { href: '/laboratuvar?parca=dht22', tr: 'Devre laboratuvarı: DHT22 kiti', en: 'Circuit lab: DHT22 kit' },
]

/** Bitirme projesinin başlangıç kodu: cihaz üstü tahmin ve histerezisli uyarı iskeleti. */
export function smlStarter(l: Lang): CodeBlock {
  const c = (tr: string, en: string) => (l === 'tr' ? tr : en)
  return {
    title: c('Arduino C++: tahmin ve anomali uyarısı iskeleti', 'Arduino C++: forecast and anomaly alert skeleton'),
    src: `#include "model.h"        // ${c('predict_temp(...) ve RESID_SD: Python hattının ürettiği dosya', 'predict_temp(...) and RESID_SD: generated by the Python pipeline')}

const uint8_t N = 12;      // ${c('halka tampon: son 2 saat (10 dk aralık)', 'ring buffer: last 2 hours (10 min interval)')}
float buf[N]; uint8_t head = 0, count = 0;
float lag(uint8_t k) { return buf[(head + N - 1 - k) % N]; }   // ${c('k = 0 en yeni örnek', 'k = 0 is the newest sample')}

const float Z_ON = 3.0, Z_OFF = 1.5;   // ${c('histerezis', 'hysteresis')}
const uint8_t MIN_RUN = 2, COOLDOWN = 18;
bool alarmOn = false; uint8_t run = 0; uint16_t sinceAlert = 1000;
float pending[3]; uint8_t pHead = 0;   // ${c('h = 3 adım önceki tahminler', 'forecasts made h = 3 steps ago')}

void onSample(float temp, float hourOfDay, float light) {
  buf[head] = temp; head = (head + 1) % N; if (count < N) count++;
  if (count < N) return;                       // ${c('tampon dolmadan tahmin yok', 'no forecast until the buffer is full')}
  float z = (temp - pending[pHead]) / RESID_SD;  // ${c('3 adım önce bu an için yapılan tahminin artığı', 'residual of the forecast made 3 steps ago for now')}
  pending[pHead] = predict_temp(lag(0), lag(1), lag(2), lag(3), lag(6) /* ${c('… özellikler', '… features')} */, hourOfDay, light);
  pHead = (pHead + 1) % 3;
  sinceAlert++;
  if (!alarmOn) {
    run = fabsf(z) >= Z_ON ? run + 1 : 0;
    if (run >= MIN_RUN) { alarmOn = true; if (sinceAlert >= COOLDOWN) { sinceAlert = 0; /* ${c('MQTT ile uyarı yayımla', 'publish the alert over MQTT')} */ } }
  } else if (fabsf(z) < Z_OFF) { alarmOn = false; run = 0; }
}`,
  }
}
