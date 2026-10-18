// Sensör verisinden ML dersi simülasyonlarının başlık ve açıklamaları (TR/EN). Kimlikler sims.tsx'teki SIMS anahtarlarıyla aynı.
export type SensorSimId = 'toplama' | 'temizleme' | 'kalman' | 'gorsel' | 'ozellik' | 'egitim' | 'yerlestirme' | 'anomali'
interface Text { title: string; desc: string }

export const SENSOR_SIM_META: Record<SensorSimId, { tr: Text; en: Text }> = {
  toplama: {
    tr: { title: 'Sensör kaydedici: seradan zaman serisi', desc: 'DHT22, BME280, LDR ve HC-SR04\'ü seranın içine koy ve kaydet. Örnekleme aralığını, gürültüyü, okunamayan örnek ve sıçrama oranını değiştir; kaydı CSV olarak indir. Aynı tohum her seferinde aynı veriyi verir.' },
    en: { title: 'Sensor logger: a time series from the greenhouse', desc: 'Put a DHT22, BME280, LDR and HC-SR04 in the greenhouse and record. Change the sampling interval, noise, failed-read and spike rates; download the log as CSV. The same seed always gives the same data.' },
  },
  temizleme: {
    tr: { title: 'Temizleme tezgâhı: aykırı değer, eksik veri, yumuşatma', desc: 'Ham sıcaklığa üç adım uygula: aykırı değerleri bul (z-skoru, IQR, Hampel), boşlukları doldur (ileri doldurma, doğrusal ara değer), yumuşat (hareketli ortalama, medyan, üstel). Simülatör gerçek sıcaklığı da bildiği için her adımın hatası ölçülür.' },
    en: { title: 'Cleaning bench: outliers, missing data, smoothing', desc: 'Apply three steps to the raw temperature: find outliers (z-score, IQR, Hampel), fill gaps (forward fill, linear interpolation), smooth (moving average, median, exponential). The simulator also knows the true temperature, so the error of every step is measured.' },
  },
  kalman: {
    tr: { title: '1B Kalman süzgeci: Q ve R ile oyna', desc: 'Gürültülü bir ölçüm, bir model ve iki sayı: süreç gürültüsü Q (değer ne kadar hızlı değişebilir) ve ölçüm gürültüsü R (sensöre ne kadar güvenilir). Kazanç K\'nın nasıl oturduğunu ve aynı kazançlı üstel ortalamayla farkı gör.' },
    en: { title: '1D Kalman filter: play with Q and R', desc: 'A noisy measurement, a model and two numbers: process noise Q (how fast the value can change) and measurement noise R (how much to trust the sensor). Watch the gain K settle and compare with an exponential average of the same gain.' },
  },
  gorsel: {
    tr: { title: 'Veri analizi panosu: seri, histogram, korelasyon', desc: 'Temizlenmiş veriyi üç bakışla incele: zaman serisi ve günlük profil, histogram, değişkenler arası korelasyon ısı haritası. Altta Welford yöntemiyle cihaz üstünde, diziyi saklamadan hesaplanan ortalama, σ, en küçük ve en büyük değer.' },
    en: { title: 'Data analysis board: series, histogram, correlation', desc: 'Look at the cleaned data three ways: time series and daily profile, histogram, a correlation heat map between variables. Below, the mean, σ, minimum and maximum computed on the device with Welford\'s method, without storing the array.' },
  },
  ozellik: {
    tr: { title: 'Özellik tablosu kurucu', desc: 'Hangi gecikmeleri, kayan pencereyi ve saat bilgisini kullanacağını seç; hedef ufku (kaç adım sonrası) ayarla. Tablonun ilk satırlarını ve her özelliğin hedefle korelasyonunu gör. "Sızıntılı özellik"i açıp geleceği gören bir özelliğin sahte başarısını izle.' },
    en: { title: 'Feature table builder', desc: 'Choose which lags, rolling window and time-of-day features to use; set the target horizon (how many steps ahead). See the first rows of the table and the correlation of every feature with the target. Turn on the "leaky feature" and watch the fake success of a feature that sees the future.' },
  },
  egitim: {
    tr: { title: 'Eğit ve değerlendir: regresyon ve sınıflandırma', desc: 'Sıcaklığı h adım sonrası için doğrusal (ridge) modelle tahmin et ya da "1 saat sonra 26 °C\'yi aşacak mı?" sorusunu karar kütüğüyle sınıflandır. Rastgele bölme, zamana göre bölme ve kayan pencereli doğrulamayı karşılaştır; "değişmez" tabanını geçebiliyor musun?' },
    en: { title: 'Train and evaluate: regression and classification', desc: 'Forecast the temperature h steps ahead with a linear (ridge) model, or classify "will it exceed 26 °C in an hour?" with a decision stump. Compare a random split, a time-based split and walk-forward validation; can you beat the "no change" baseline?' },
  },
  yerlestirme: {
    tr: { title: 'Modeli mikrodenetleyiciye taşı: C kodu üreteci', desc: 'Eğitilmiş ağırlıklardan C fonksiyonu üret: ESP32 için float, FPU\'su olmayan Uno için sabit noktalı tamsayı (Q-biçimi). Q bit sayısını değiştir; nicemleme hatasını, int32 taşma payını, bellek ve süre tahminini gör.' },
    en: { title: 'Move the model to a microcontroller: C code generator', desc: 'Generate a C function from the trained weights: float for the ESP32, fixed-point integer (Q format) for the Uno, which has no FPU. Change the number of Q bits; see the quantisation error, int32 overflow headroom, memory and time estimate.' },
  },
  anomali: {
    tr: { title: 'Sıcaklık tahmini ve anomali uyarısı', desc: 'Model ilk dört günde (arızasız) eğitilir, sonra her örnekte tahmin artığının z-skoru hesaplanır. Açma ve kapama eşiği (histerezis), ardışık örnek sayısı ve bekleme süresiyle uyarıyı ayarla: 5. gündeki ısıtıcı arızasını yakala, yanlış alarmı az tut.' },
    en: { title: 'Temperature forecast and anomaly alert', desc: 'The model is trained on the first four days (no fault), then the z-score of the forecast residual is computed at every sample. Tune the alert with on and off thresholds (hysteresis), consecutive samples and a cooldown: catch the heater fault on day 5 and keep false alarms low.' },
  },
}
