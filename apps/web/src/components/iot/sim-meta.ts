// ESP32 ile Nesnelerin İnterneti dersi simülasyonlarının başlık ve açıklamaları (TR/EN). Kimlikler sims.tsx'teki anahtarlarla aynı.
export type IotSimId = 'pinler' | 'wifi' | 'rest' | 'broker' | 'qos' | 'telemetri' | 'eyleyici' | 'pano' | 'guc' | 'ota' | 'guvenlik' | 'ble' | 'kurallar'
interface Text { title: string; desc: string }

export const IOT_SIM_META: Record<IotSimId, { tr: Text; en: Text }> = {
  pinler: {
    tr: { title: 'ESP32 pin planlayıcı', desc: 'Bir projenin her bağlantısı için pin ve görev seç (çıkış, giriş, ADC, PWM, I²C, DAC, dokunma). Planlayıcı flash pinlerini, yalnız-giriş pinlerini, açılış (strapping) pinlerini ve Wi-Fi açıkken çalışmayan ADC2\'yi işaretler.' },
    en: { title: 'ESP32 pin planner', desc: 'Pick a pin and a role for every connection of a project (output, input, ADC, PWM, I²C, DAC, touch). The planner flags flash pins, input-only pins, boot (strapping) pins and ADC2, which does not work while Wi-Fi is on.' },
  },
  wifi: {
    tr: { title: 'Wi-Fi bağlantı durumları ve yeniden bağlanma', desc: 'Erişim noktası bir süre kapanır, sinyal zayıflar. Sabit beklemeyle ve üstel geri çekilmeyle yeniden bağlanmayı karşılaştır: deneme sayısı, kopuk kalınan süre ve AP geri gelince toparlanma süresi.' },
    en: { title: 'Wi-Fi connection states and reconnecting', desc: 'The access point goes down for a while and the signal weakens. Compare reconnecting with a fixed delay and with exponential backoff: number of attempts, time offline and recovery time once the AP is back.' },
  },
  rest: {
    tr: { title: 'REST oyun alanı: ESP32 web sunucusu', desc: 'Seradaki ESP32\'nin küçük REST API\'sine istek gönder: GET /api/sensor, PUT /api/led, POST /api/schedules. Ham HTTP isteğini ve yanıtını, durum kodlarını (200, 201, 400, 401, 404, 405, 422) ve JSON gövdeyi gör.' },
    en: { title: 'REST playground: an ESP32 web server', desc: 'Send requests to the small REST API of the greenhouse ESP32: GET /api/sensor, PUT /api/led, POST /api/schedules. See the raw HTTP request and response, the status codes (200, 201, 400, 401, 404, 405, 422) and the JSON body.' },
  },
  broker: {
    tr: { title: 'Tarayıcıda MQTT broker\'ı', desc: 'Üç simüle cihaz ve bir pano aynı broker\'a bağlı. Joker karakterli (+ ve #) abonelikler kur, mesaj yayımla, kalıcı (retained) mesajı ve bir cihazın kablosunu çekince yayımlanan son vasiyeti (LWT) izle.' },
    en: { title: 'An MQTT broker in the browser', desc: 'Three simulated devices and a dashboard share one broker. Set up wildcard subscriptions (+ and #), publish messages, and watch a retained message and the last will (LWT) published when you pull the plug on a device.' },
  },
  qos: {
    tr: { title: 'QoS 0, 1, 2: kayıplı bağlantıda teslim', desc: 'Paket kaybı oranını artır ve aynı 20 mesajı üç QoS düzeyiyle gönder. Kaybolan, yinelenen ve teslim edilen mesajları, toplam paket sayısını ve her mesajın el sıkışma dizisini gör.' },
    en: { title: 'QoS 0, 1, 2: delivery over a lossy link', desc: 'Raise the packet loss rate and send the same 20 messages at three QoS levels. See lost, duplicated and delivered messages, the total packet count and the handshake sequence of every message.' },
  },
  telemetri: {
    tr: { title: 'Sensörden buluta: yük ve trafik hesabı', desc: 'DHT22/BME280 okumasını JSON, CSV ya da 8 baytlık ikili yük olarak gönder. Yayın aralığı, QoS, TLS ve "değişince bildir" ölü bandıyla paket boyutunu, günlük mesaj ve veri miktarını hesapla.' },
    en: { title: 'Sensor to cloud: payload and traffic', desc: 'Send a DHT22/BME280 reading as JSON, CSV or an 8-byte binary payload. Work out the packet size and the daily messages and data with the publish interval, QoS, TLS and a "report on change" dead band.' },
  },
  eyleyici: {
    tr: { title: 'Uzaktan eyleyici: idempotent komut ve cihaz gölgesi', desc: 'Kayıplı bir bağlantıda röleye 20 komut gönder. "Çevir" (toggle) komutu yinelenen teslimde durumu bozar; "ayarla" (set) ve komut kimliği bozmaz. Altta istenen/bildirilen gölge farkını gör.' },
    en: { title: 'Remote actuator: idempotent commands and a device shadow', desc: 'Send 20 commands to a relay over a lossy link. A "toggle" command breaks the state on duplicate delivery; "set" and a command id do not. Below, see the desired/reported shadow delta.' },
  },
  pano: {
    tr: { title: 'Canlı pano: halka tampon, seyreltme, uyarı', desc: 'Üç cihazdan gelen telemetriyi canlı çiz. Halka tampon boyutunu ve ekrana çizilecek nokta sayısını değiştir; min/max seyreltmenin tepeleri koruduğunu ve histerezisli eşik uyarısını izle.' },
    en: { title: 'Live dashboard: ring buffer, downsampling, alerts', desc: 'Plot telemetry from three devices live. Change the ring buffer size and the number of points drawn; watch min/max downsampling keep the peaks and a threshold alert with hysteresis.' },
  },
  guc: {
    tr: { title: 'Güç bütçesi: derin uyku ve pil ömrü', desc: 'Sürekli açık, modem uykusu, hafif uyku ve derin uyku kiplerini karşılaştır. Uyanma aralığı, uyanık kalma süresi, pil kapasitesi ve kartın uyku akımıyla ortalama akımı ve pil ömrünü hesapla.' },
    en: { title: 'Power budget: deep sleep and battery life', desc: 'Compare always-on, modem sleep, light sleep and deep sleep. Work out the average current and battery life from the wake interval, awake time, battery capacity and the board\'s sleep current.' },
  },
  ota: {
    tr: { title: 'OTA güncelleme: A/B bölümleri ve geri dönüş', desc: 'Yeni yazılımı çalışmayan bölüme indir, doğrula, yeniden başlat. Kendi sınamasını geçemeyen sürümün eski bölüme geri döndüğünü ve geçersiz olayların durumu değiştirmediğini adım adım izle.' },
    en: { title: 'OTA update: A/B partitions and rollback', desc: 'Download new firmware to the idle partition, verify it, reboot. Watch step by step how a version that fails its self-test rolls back to the old partition and how invalid events leave the state unchanged.' },
  },
  guvenlik: {
    tr: { title: 'IoT güvenlik denetimi ve MQTT ACL', desc: 'Bir cihaz kurulumunu denetle (TLS, sertifika doğrulama, anonim erişim, ortak parola, depodaki sırlar, imzalı OTA) ve risk puanını düşür. Altta Mosquitto tarzı ACL yaz ve hangi kullanıcının hangi konuya yazabildiğini sına.' },
    en: { title: 'IoT security audit and MQTT ACL', desc: 'Audit a device setup (TLS, certificate verification, anonymous access, shared password, secrets in the repo, signed OTA) and bring the risk score down. Below, write a Mosquitto-style ACL and test which user may write to which topic.' },
  },
  ble: {
    tr: { title: 'BLE: GATT hizmetleri ve reklam aralığı', desc: 'Çevresel algılama, pil ve özel LED hizmetinin özelliklerini oku ve yaz; değerin küçük-endian baytlarını gör. Reklam aralığı ve verici gücüyle ortalama akımı, keşif süresini ve düğme pil ömrünü karşılaştır.' },
    en: { title: 'BLE: GATT services and advertising interval', desc: 'Read and write the characteristics of the environmental sensing, battery and custom LED services; see the little-endian bytes of each value. Compare the average current, discovery time and coin-cell life across advertising intervals and TX power.' },
  },
  kurallar: {
    tr: { title: 'Akıllı sera: kural motoru', desc: 'EĞER … İSE … kurallarıyla pencere, fan, ısıtıcı, sulama ve alarmı yönet. 24 saatlik sera gününü dış hava ve bulutlulukla benzet; konfor yüzdesi, aşırı sıcak/soğuk dakika, röle anahtarlama sayısı ve enerjiyle kurallarını puanla.' },
    en: { title: 'Smart greenhouse: rules engine', desc: 'Drive the window, fan, heater, pump and alarm with IF … THEN … rules. Simulate a 24-hour greenhouse day with outside weather and cloud cover; score your rules by comfort percentage, too hot/cold minutes, relay switch count and energy.' },
  },
}
