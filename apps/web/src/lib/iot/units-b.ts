// ESP32 ile Nesnelerin İnterneti dersi üniteleri 6–10: sensörden buluta, uzaktan eyleyici ve canlı pano, güç ve OTA,
// güvenlik ve BLE, akıllı sera kural motoru. HTML iki dilde aynı etiket dizisinde; kod aynı, yalnız yorumlar çevrilir
// (kod üreteçleri dili alır, satır sayısı her iki dilde eşittir).
import type { IotSimId } from '@/components/iot/sim-meta'
import type { CodeBlock, CourseUnit, Lang } from '@/lib/kurs/types'

/** Yorum seçici: kod satırları aynı kalır, yalnız yorum dile göre değişir. */
const k = (l: Lang, tr: string, en: string) => (l === 'tr' ? tr : en)

// --- Ünite 6 kodları ---------------------------------------------------------------------------------------------------------

const telemetryCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: BME280 + DHT22, değişince bildir ve NTP zaman damgası', 'Arduino C++: BME280 + DHT22, report on change and NTP timestamp'),
  src: `#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_BME280.h>
#include <DHT.h>
#include <time.h>
#include "secrets.h"            // ${k(l, 'WIFI_SSID, WIFI_PASS, MQTT_HOST: git\'e girmez', 'WIFI_SSID, WIFI_PASS, MQTT_HOST: not in git')}

Adafruit_BME280 bme;            // ${k(l, 'I2C: SDA 21, SCL 22, adres 0x76 ya da 0x77', 'I2C: SDA 21, SCL 22, address 0x76 or 0x77')}
DHT dht(4, DHT22);              // ${k(l, 'DHT22 veri pini GPIO4 (10k pull-up)', 'DHT22 data pin GPIO4 (10k pull-up)')}
WiFiClient net;
PubSubClient mqtt(net);

const float DEADBAND = 0.3;     // ${k(l, '°C: bundan küçük değişim yayımlanmaz', 'deg C: smaller changes are not published')}
const uint32_t HEARTBEAT_MS = 10UL * 60 * 1000;  // ${k(l, 'en geç 10 dakikada bir yine de yayımla', 'publish at least every 10 minutes anyway')}
float lastSent = NAN;
uint32_t lastMs = 0;

void setup() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  configTime(3 * 3600, 0, "pool.ntp.org");        // ${k(l, 'UTC+3, NTP ile saat', 'UTC+3, clock from NTP')}
  if (!bme.begin(0x76) && !bme.begin(0x77)) Serial.println("BME280?");
  dht.begin();
  mqtt.setServer(MQTT_HOST, 1883);
}

void loop() {
  if (!mqtt.connected()) mqtt.connect("sera-01");
  mqtt.loop();
  static uint32_t lastRead = 0;
  if (millis() - lastRead < 2000) return;         // ${k(l, 'DHT22 en fazla 2 s\'de bir okunur', 'DHT22 can be read at most every 2 s')}
  lastRead = millis();
  float t = bme.readTemperature(), h = dht.readHumidity(), p = bme.readPressure() / 100.0;
  if (isnan(h)) return;                           // ${k(l, 'okunamadı: uydurma değer gönderme', 'failed read: do not send a made-up value')}
  bool changed = isnan(lastSent) || fabs(t - lastSent) >= DEADBAND;
  if (!changed && millis() - lastMs < HEARTBEAT_MS) return;
  char buf[96];
  snprintf(buf, sizeof buf, "{\\"ts\\":%ld,\\"t\\":%.1f,\\"h\\":%.1f,\\"p\\":%.1f}", (long)time(nullptr), t, h, p);
  mqtt.publish("sera/01/telemetri", buf);         // ${k(l, 'QoS 0, kalıcı değil', 'QoS 0, not retained')}
  lastSent = t; lastMs = millis();
}`,
})

const telemetryPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: umqtt.simple ile ikili (8 bayt) yük', 'MicroPython: an 8-byte binary payload with umqtt.simple'),
  src: `import struct, time, ntptime
from machine import Pin, I2C
from umqtt.simple import MQTTClient
import dht
import secrets                      # ${k(l, 'cihaza ayrı yüklenir, depoda yok', 'uploaded separately, not in the repo')}

d = dht.DHT22(Pin(4))
c = MQTTClient("sera-01", secrets.MQTT_HOST)
c.connect()
ntptime.settime()                   # ${k(l, 'RTC saatini NTP\'den al (UTC)', 'set the RTC from NTP (UTC)')}

while True:
    try:
        d.measure()
    except OSError:
        time.sleep(2); continue     # ${k(l, 'okunamadı: atla', 'failed read: skip')}
    t, h = d.temperature(), d.humidity()
    # ${k(l, 'int16 sıcaklık x10, uint16 nem x10, uint32 zaman: 8 bayt, küçük-endian', 'int16 temp x10, uint16 hum x10, uint32 time: 8 bytes, little-endian')}
    yuk = struct.pack("<hHI", round(t * 10), round(h * 10), time.time())
    c.publish(b"sera/01/bin", yuk)
    time.sleep(60)`,
})

// --- Ünite 7 kodları ---------------------------------------------------------------------------------------------------------

const actuatorCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: idempotent röle komutu, komut kimliği ve gölge bildirimi', 'Arduino C++: idempotent relay command, command id and shadow report'),
  src: `#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const int RELAY = 26;           // ${k(l, 'IRF540 kapısı ya da röle modülü girişi', 'IRF540 gate or relay module input')}
WiFiClient net;
PubSubClient mqtt(net);
uint32_t lastCmdId = 0;         // ${k(l, 'aynı kimliği ikinci kez uygulama', 'never apply the same id twice')}

void report(bool on) {
  // ${k(l, 'Bildirilen durum kalıcı (retained): yeni bağlanan pano hemen görür', 'Reported state is retained: a newly connected dashboard sees it at once')}
  mqtt.publish("sera/01/fan/state", on ? "{\\"on\\":true}" : "{\\"on\\":false}", true);
}

void onMsg(char* topic, byte* data, unsigned int len) {
  JsonDocument doc;
  if (deserializeJson(doc, data, len)) return;    // ${k(l, 'bozuk JSON: yok say', 'malformed JSON: ignore')}
  uint32_t id = doc["id"] | 0;
  if (id != 0 && id <= lastCmdId) return;         // ${k(l, 'yinelenen ya da eski komut', 'duplicate or stale command')}
  lastCmdId = id;
  bool on = doc["on"] | false;                    // ${k(l, 'SET: mutlak değer, toggle değil', 'SET: absolute value, not toggle')}
  digitalWrite(RELAY, on ? HIGH : LOW);
  report(on);                                     // ${k(l, 'gerçekten uygulanan durumu bildir', 'report the state actually applied')}
}

void setup() {
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, LOW);                       // ${k(l, 'güvenli varsayılan: kapalı', 'safe default: off')}
  mqtt.setCallback(onMsg);
}

void loop() {
  if (!mqtt.connected() && mqtt.connect("sera-01")) mqtt.subscribe("sera/01/fan/set", 1);
  mqtt.loop();
}`,
})

const dashboardPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: servo komutu ve OLED üzerinde halka tamponlu mini pano', 'MicroPython: servo command and a ring-buffer mini dashboard on an OLED'),
  src: `import json
from machine import Pin, PWM, I2C
from umqtt.simple import MQTTClient
import ssd1306

servo = PWM(Pin(18), freq=50)                  # ${k(l, 'SG90: 50 Hz, 0,5 ile 2,5 ms darbe', 'SG90: 50 Hz, 0.5 to 2.5 ms pulse')}
oled = ssd1306.SSD1306_I2C(128, 64, I2C(0, scl=Pin(22), sda=Pin(21)))
buf, cap, head = [0.0] * 128, 128, 0           # ${k(l, 'halka tampon: sabit bellek', 'ring buffer: fixed memory')}

def on_msg(topic, msg):
    global head
    m = json.loads(msg)
    if topic == b"sera/01/pencere/set":
        aci = max(0, min(90, m["aci"]))        # ${k(l, 'sınırla: mekanik sonu zorlama', 'clamp: do not force the mechanical end')}
        servo.duty_ns(500_000 + aci * 2_000_000 // 180)
    elif topic == b"sera/01/telemetri":
        buf[head] = m["t"]; head = (head + 1) % cap   # ${k(l, 'en eski değer ezilir', 'the oldest value is overwritten')}
        oled.fill(0)
        for x in range(cap):
            v = buf[(head + x) % cap]
            oled.pixel(x, 63 - int((v - 10) * 2), 1)  # ${k(l, '10..40 °C ekrana', '10..40 deg C on screen')}
        oled.show()

c = MQTTClient("pano-01", "broker.local")
c.set_callback(on_msg); c.connect()
c.subscribe(b"sera/01/#")
while True:
    c.wait_msg()`,
})

// --- Ünite 8 kodları ---------------------------------------------------------------------------------------------------------

const deepSleepCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: derin uyku, RTC belleği ve uyanma kaynağı', 'Arduino C++: deep sleep, RTC memory and wake source'),
  src: `#include <WiFi.h>
#include "esp_sleep.h"

RTC_DATA_ATTR uint32_t bootCount = 0;   // ${k(l, 'derin uykuda korunur (RTC yavaş bellek)', 'kept through deep sleep (RTC slow memory)')}
RTC_DATA_ATTR float lastTemp = NAN;     // ${k(l, 'değişince bildir için son değer', 'last value for report on change')}
const uint64_t SLEEP_US = 5ULL * 60 * 1000000;  // ${k(l, '5 dakika', '5 minutes')}

void setup() {
  bootCount++;
  esp_sleep_wakeup_cause_t why = esp_sleep_get_wakeup_cause();
  if (why == ESP_SLEEP_WAKEUP_EXT0) Serial.println("button");  // ${k(l, 'düğmeyle uyandı', 'woken by the button')}
  float t = 23.4;                        // ${k(l, 'sensörü oku (kısa tut)', 'read the sensor (keep it short)')}
  if (isnan(lastTemp) || fabs(t - lastTemp) >= 0.3 || bootCount % 12 == 0) {
    WiFi.begin();                        // ${k(l, 'yalnız gerekince Wi-Fi aç: en pahalı adım', 'turn on Wi-Fi only when needed: the most expensive step')}
    // ... ${k(l, 'bağlan, yayımla, bağlantıyı düzgün kapat', 'connect, publish, disconnect cleanly')}
    lastTemp = t;
  }
  esp_sleep_enable_timer_wakeup(SLEEP_US);
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_33, 0);   // ${k(l, 'GPIO33 LOW olunca uyan', 'wake when GPIO33 goes LOW')}
  esp_deep_sleep_start();                // ${k(l, 'buradan sonrası çalışmaz: uyanış = yeniden başlama', 'nothing after this runs: waking = reboot')}
}

void loop() {}`,
})

const otaCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: HTTPUpdate ile OTA ve geri dönüş onayı', 'Arduino C++: OTA with HTTPUpdate and rollback confirmation'),
  src: `#include <WiFi.h>
#include <HTTPUpdate.h>
#include "esp_ota_ops.h"

bool selfTest() {
  // ${k(l, 'Sensör cevap veriyor mu, broker\'a bağlanabiliyor mu?', 'Does the sensor answer, can we reach the broker?')}
  return WiFi.status() == WL_CONNECTED;
}

void setup() {
  WiFi.begin();
  while (WiFi.status() != WL_CONNECTED) delay(200);
  if (selfTest()) esp_ota_mark_app_valid_cancel_rollback();  // ${k(l, 'yeni sürüm geçerli', 'new version is valid')}
  else esp_ota_mark_app_invalid_rollback_and_reboot();        // ${k(l, 'eski bölüme dön', 'go back to the old partition')}
}

void checkUpdate() {
  WiFiClientSecure tls;
  tls.setCACert(OTA_CA_PEM);             // ${k(l, 'sunucuyu doğrula: sahte güncelleme yok', 'verify the server: no fake updates')}
  t_httpUpdate_return r = httpUpdate.update(tls, "https://ota.example.com/sera/firmware.bin");
  if (r == HTTP_UPDATE_FAILED) Serial.println(httpUpdate.getLastErrorString());
  // ${k(l, 'Başarılıysa kütüphane yeniden başlatır; yeni sürüm "beklemede" açılır', 'On success the library reboots; the new version starts "pending"')}
}

void loop() {}`,
})

const batteryPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: MAX17048 ile pil yüzdesi ve derin uyku', 'MicroPython: battery percent with a MAX17048 and deep sleep'),
  src: `from machine import I2C, Pin, deepsleep
import network, time

i2c = I2C(0, scl=Pin(22), sda=Pin(21))
raw = i2c.readfrom_mem(0x36, 0x04, 2)       # ${k(l, 'SOC yazmacı: yüksek bayt yüzde', 'SOC register: high byte is percent')}
soc = raw[0] + raw[1] / 256
print("pil %", round(soc, 1))
if soc < 15:
    sure_ms = 30 * 60 * 1000                # ${k(l, 'pil azsa daha seyrek uyan', 'wake less often when the battery is low')}
else:
    sure_ms = 5 * 60 * 1000
wlan = network.WLAN(network.STA_IF)
wlan.active(False)                          # ${k(l, 'uyumadan önce radyoyu kapat', 'turn the radio off before sleeping')}
deepsleep(sure_ms)`,
})

// --- Ünite 9 kodları ---------------------------------------------------------------------------------------------------------

const tlsCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: TLS ile MQTT (8883), cihaz başına kimlik ve NVS', 'Arduino C++: MQTT over TLS (8883), per-device credentials and NVS'),
  src: `#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include "ca_cert.h"               // ${k(l, 'broker CA sertifikası (genel, sır değil)', 'broker CA certificate (public, not a secret)')}

WiFiClientSecure tls;
PubSubClient mqtt(tls);
Preferences prefs;

void setup() {
  prefs.begin("kimlik", true);     // ${k(l, 'NVS: üretimde cihaza yazılır, kodda yok', 'NVS: written at provisioning, not in the code')}
  String user = prefs.getString("user", "");
  String pass = prefs.getString("pass", "");
  prefs.end();
  tls.setCACert(CA_CERT);          // ${k(l, 'setInsecure() KULLANMA: araya giren saldırgana açık', 'do NOT use setInsecure(): open to a man in the middle')}
  mqtt.setServer("broker.example.com", 8883);
  String id = "sera-" + String((uint32_t)ESP.getEfuseMac(), HEX);
  // ${k(l, 'Kullanıcı adı = istemci kimliği: ACL %u/%c ile kendi konusuna kilitlenir', 'Username = client id: the ACL locks it to its own topic with %u/%c')}
  mqtt.connect(id.c_str(), user.c_str(), pass.c_str(), "sera/durum", 1, true, "offline");
}

void loop() { mqtt.loop(); }`,
})

const blePy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: aioble ile Çevresel Algılama hizmeti (notify)', 'MicroPython: Environmental Sensing service with aioble (notify)'),
  src: `import asyncio, struct
import aioble, bluetooth

ENV = bluetooth.UUID(0x181A)                 # ${k(l, 'Environmental Sensing hizmeti', 'Environmental Sensing service')}
TEMP = bluetooth.UUID(0x2A6E)                # ${k(l, 'Sıcaklık: sint16, 0,01 °C', 'Temperature: sint16, 0.01 deg C')}
svc = aioble.Service(ENV)
ch = aioble.Characteristic(svc, TEMP, read=True, notify=True)
aioble.register_services(svc)

async def sensor():
    t = 23.45
    while True:
        ch.write(struct.pack("<h", round(t * 100)), send_update=True)  # ${k(l, '23,45 -> 0x0929 -> 29 09', '23.45 -> 0x0929 -> 29 09')}
        await asyncio.sleep(5)

async def reklam():
    while True:
        # ${k(l, 'Reklam aralığı 250 ms: daha uzun = daha az akım, daha geç keşif', 'Advertising interval 250 ms: longer = less current, slower discovery')}
        async with await aioble.advertise(250_000, name="sera-01", services=[ENV]) as conn:
            await conn.disconnected()

asyncio.run(asyncio.gather(sensor(), reklam()))`,
})

const aclConf = (l: Lang): CodeBlock => ({
  title: k(l, 'Mosquitto: kimlik doğrulama ve ACL', 'Mosquitto: authentication and ACL'),
  src: `# mosquitto.conf
listener 8883
cafile   /etc/mosquitto/certs/ca.crt
certfile /etc/mosquitto/certs/server.crt
keyfile  /etc/mosquitto/certs/server.key
allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/acl

# acl  (${k(l, 'her cihaz yalnız kendi konusuna yazar', 'every device writes only to its own topic')})
pattern write sera/%u/#
pattern read  sera/%u/+/set
user pano
topic read sera/#
topic write sera/+/+/set`,
})

// --- Ünite 10 kodları --------------------------------------------------------------------------------------------------------

const rulesCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: cihaz üstünde histerezis, BEKLE ve çevrim dışı güvenli varsayılan', 'Arduino C++: on-device hysteresis, HOLD and an offline failsafe'),
  src: `struct Act { int pin; bool on; uint32_t lastChange; uint32_t holdMs; };
Act fan    = { 26, false, 0, 5UL * 60000 };   // ${k(l, 'BEKLE 5 dk: röleyi koru', 'HOLD 5 min: protect the relay')}
Act heater = { 27, false, 0, 10UL * 60000 };

bool set(Act& a, bool want) {
  if (want == a.on) return false;
  if (millis() - a.lastChange < a.holdMs) return false;  // ${k(l, 'çok erken: değiştirme', 'too soon: do not switch')}
  a.on = want; a.lastChange = millis();
  digitalWrite(a.pin, want);
  return true;
}

void rules(float t, bool online) {
  // ${k(l, 'Histerezis: 33 üstünde aç, 29 altında kapat; arada önceki durum kalır', 'Hysteresis: on above 33, off below 29; in between the old state stays')}
  if (t > 33) set(fan, true);
  else if (t < 29) set(fan, false);
  if (t < 14) set(heater, true);
  else if (t > 17) set(heater, false);
  if (isnan(t) || t > 45) set(heater, false);   // ${k(l, 'sensör arızası: ısıtıcıyı asla açık bırakma', 'sensor fault: never leave the heater on')}
  if (!online) { /* ${k(l, 'bulut yok: yerel kurallar çalışmaya devam eder', 'no cloud: local rules keep running')} */ }
}`,
})

const rulesPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: kuralları JSON olarak MQTT\'den alan küçük motor', 'MicroPython: a small engine that receives rules as JSON over MQTT'),
  src: `import json
OPS = {">": lambda a, b: a > b, "<": lambda a, b: a < b, ">=": lambda a, b: a >= b, "<=": lambda a, b: a <= b}
kurallar = []                               # ${k(l, 'retained "sera/01/kurallar" konusundan gelir', 'comes from the retained "sera/01/rules" topic')}

def kurallari_al(msg):
    global kurallar
    yeni = json.loads(msg)
    if all(r["op"] in OPS for r in yeni):   # ${k(l, 'doğrula, sonra değiştir: bozuk kural seti çalışmayı durdurmaz', 'validate, then swap: a bad rule set does not stop the device')}
        kurallar = yeni

def degerlendir(ortam, eyleyici):
    for r in kurallar:                       # ${k(l, 'sırayla; aynı eyleyicide sonraki kazanır', 'in order; later wins on the same actuator')}
        if all(OPS[c["op"]](ortam[c["s"]], c["v"]) for c in r["kosul"]):
            eyleyici[r["act"]] = r["val"]
    return eyleyici`,
})

// --- Üniteler ----------------------------------------------------------------------------------------------------------------

export const UNITS_B: CourseUnit<IotSimId>[] = [
  {
    n: 6, sims: ['telemetri'], parts: ['esp32-esp32-wroom-devkit', 'dht22', 'bme280', 'ldr'], wokwi: true,
    related: [
      { href: '/laboratuvar', tr: 'Devre laboratuvarı: DHT22, BME280 ve LDR kitleri', en: 'Circuit lab: DHT22, BME280 and LDR kits' },
      { href: '/muhendislik/sensor-ml', tr: 'Sensör verisinden ML tahmini: bu telemetriyle model eğit', en: 'ML forecasting from sensor data: train a model on this telemetry' },
    ],
    tr: {
      title: 'Sensörden buluta: okuma, yük biçimi ve trafik',
      summary: 'DHT11, DHT22 ve BME280\'i doğru hızda oku; JSON, CSV ya da ikili yükle gönder, "değişince bildir" ile trafiği azalt.',
      goals: ['DHT11, DHT22 ve BME280\'i doğruluk, okuma aralığı ve arayüz bakımından karşılaştırmak', 'Aynı okumayı JSON, CSV ve ikili yük olarak kodlayıp MQTT paket boyutunu hesaplamak', 'Yayın aralığı, TLS ve ölü bantla günlük mesaj ve veri miktarını tahmin etmek', 'Okumaya NTP\'den alınmış zaman damgası eklemek ve okunamayan örneği doğru işlemek'],
      notes: `<p>Bir IoT cihazının asıl işi ölçmek ve ölçümü güvenilir biçimde bir yere ulaştırmaktır. Laboratuvardaki üç sensör üç farklı arayüz kullanır: <b>DHT11/DHT22</b> tek telli kendi protokolüyle, <b>BME280</b> I²C ile (adres <code>0x76</code> ya da <code>0x77</code>, SDO pinine göre), <b>LDR</b> ise bir gerilim bölücüyle ADC1 pinine bağlanır.</p>
<h3>Sensörü tanı</h3>
<ul><li><b>DHT11</b>: 0–50 °C, ±2 °C, tam sayı çözünürlük, saniyede en çok bir okuma. Eğitim için yeter, sera için kaba.</li><li><b>DHT22</b>: −40–80 °C, ±0,5 °C, 0,1 °C çözünürlük, en çok 2 saniyede bir okuma. Daha sık okursan bir önceki değeri ya da hata alırsın.</li><li><b>BME280</b>: sıcaklık, nem ve basınç; I²C üzerinden hızlı, ±1 hPa basınç. Kendi ısınmasını azaltmak için "forced mode" ile yalnız gerektiğinde ölç.</li></ul>
<p>Okunamayan örnek (<code>NaN</code>) normaldir: DHT22 zaman aşımına uğrar, kablo uzundur. Doğru davranış o örneği <b>atlamak</b>, son değeri tekrar göndermemektir; aksi halde bulut "sabit sıcaklık" görür.</p>
<h3>Yük biçimi ve paket boyutu</h3>
<p>Aynı okuma üç biçimde gidebilir: JSON (<code>{"t":23.4,"h":51.2}</code>, okunur ve kendini anlatır), CSV (<code>23.4,51.2</code>, sıra anlaşması gerekir) ya da ikili (int16 × 10, sabit 8 bayt). MQTT PUBLISH paketinin boyutu şöyledir:</p>
<div class="eq">boyut = 1 + kalan_uzunluk_baytı + (2 + konu) + (QoS &gt; 0 ? 2 : 0) + yük</div>
<p>Buna TCP/IP başlıkları (yaklaşık 40 bayt) ve TLS kaydı (yaklaşık 29 bayt) eklenir. Küçük yüklerde başlıklar baskındır: 60 bayt JSON yerine 8 bayt ikili yük toplam trafiği yarıya bile indirmeyebilir. Önce <b>aralığı</b> ve <b>ne zaman</b> gönderdiğini düşün.</p>
<h3>Değişince bildir</h3>
<p>Sıcaklık 10 dakikada 0,1 °C değişiyorsa her 10 saniyede bir yayımlamak boşa enerjidir. <b>Ölü bant</b>: son gönderilenden en az Δ kadar farklıysa gönder. <b>Kalp atışı</b>: değişim olmasa da belirli sürede bir gönder, böylece sessizlik "cihaz öldü" ile karışmaz. Her yayına NTP'den alınmış bir zaman damgası koy; ağ gecikmesi ve kuyruk yüzünden broker'ın gördüğü an ölçüm anı değildir.</p>`,
      code: [telemetryCpp('tr'), telemetryPy('tr')],
      lab: 'Telemetri simülasyonunda biçimi JSON, CSV ve ikili arasında değiştir: paket boyutu kaç bayt oluyor? Aralığı 10 s yap, TLS\'i aç ve günlük veri miktarını not et; sonra ölü bandı 0,3 °C\'ye çıkar ve mesaj sayısının ne kadar düştüğünü karşılaştır. Wokwi\'de ESP32 + DHT22 + BME280 devresini kur, C++ kodunu çalıştır ve seri monitörde yalnız değişimde yayın yapıldığını gör.',
      pitfalls: ['DHT22\'yi 2 saniyeden sık okumak: değer güncellenmez ya da okuma hatası artar.', 'Okunamayan örnekte son değeri yeniden göndermek: bulut sensörün sağlıklı olduğunu sanır.', 'LDR\'yi ADC2 pinine bağlamak: Wi-Fi açıkken okuma çalışmaz, ADC1 (GPIO32–39) kullan.', 'Zaman damgasını broker\'ın alış anı saymak: kuyruklu ya da derin uykudan dönen cihazda ölçüm anı farklıdır.', 'Ölü bant koyup kalp atışı koymamak: değişmeyen ortamda sessizlik "cihaz çevrim dışı" ile karışır.'],
      se: `<p>Telemetri biçimi bir <b>sözleşmedir</b>: cihaz ve bulut ayrı ayrı güncellenir, biçim ikisini birden kırmamalıdır.</p>
<ul><li>Yükte bir sürüm alanı (<code>"v":1</code>) taşı; yeni alan eklemek geriye uyumlu, alanın anlamını değiştirmek değildir.</li><li>Kodlayıcı ve çözücüyü saf fonksiyon yaz ve "kodla sonra çöz = aynı değer" testini ekle; ikili biçimde bayt sırası hatası en sık hatadır.</li></ul>`,
      quiz: [
        { q: 'Seradaki bir sıcaklık için DHT11 yerine DHT22 seçmenin ana nedeni nedir?', options: ['DHT22 I²C kullanır', 'DHT22 daha doğru (±0,5 °C) ve 0,1 °C çözünürlüklüdür', 'DHT22 saniyede 10 okuma yapar', 'DHT22 basınç da ölçer'], answer: 1, why: 'DHT11 ±2 °C ve tam sayı çözünürlüktedir; DHT22 ±0,5 °C ve 0,1 °C verir. Okuma hızı daha da yavaştır (2 s).' },
        { q: 'BME280 I²C taramasında bulunamıyor. İlk denenecek şey hangisi?', options: ['Wi-Fi\'yi kapatmak', 'Baud hızını değiştirmek', 'Adresi 0x76 yerine 0x77 (ya da tersi) denemek ve SDA 21, SCL 22 bağlantısını kontrol etmek', 'DHT kütüphanesini kaldırmak'], answer: 2, why: 'Modülün SDO pinine göre adres 0x76 ya da 0x77 olur; ESP32\'de varsayılan I²C pinleri 21 ve 22\'dir.' },
        { q: 'Ölü bant 0,3 °C, kalp atışı 10 dakika. Sıcaklık bir saat boyunca hiç değişmezse kaç yayın yapılır?', options: ['0', '1', '60', '6'], answer: 3, why: 'Değişim yok ama kalp atışı her 10 dakikada bir yayın zorlar: saatte 6.' },
        { q: 'Okunamayan (NaN) bir DHT22 örneğinde doğru davranış nedir?', options: ['O örneği atlamak ve hata sayacını artırmak', 'Son geçerli değeri yeniden yayımlamak', '0 yayımlamak', 'Cihazı yeniden başlatmak'], answer: 0, why: 'Uydurma ya da tekrarlanan değer veriyi bozar; örnek atlanır, sık tekrarlarsa sağlık konusuna hata bildirilir.' },
      ],
    },
    en: {
      title: 'Sensor to cloud: reading, payload format and traffic',
      summary: 'Read DHT11, DHT22 and BME280 at the right rate; send JSON, CSV or a binary payload and cut traffic with report on change.',
      goals: ['Compare DHT11, DHT22 and BME280 by accuracy, read interval and interface', 'Encode the same reading as JSON, CSV and binary and work out the MQTT packet size', 'Estimate daily messages and data from the publish interval, TLS and a dead band', 'Add an NTP timestamp to every reading and handle a failed read correctly'],
      notes: `<p>The real job of an IoT device is to measure and to deliver the measurement somewhere reliably. The three sensors in the lab use three different interfaces: <b>DHT11/DHT22</b> their own single-wire protocol, <b>BME280</b> I2C (address <code>0x76</code> or <code>0x77</code>, depending on the SDO pin), and the <b>LDR</b> a voltage divider into an ADC1 pin.</p>
<h3>Know your sensor</h3>
<ul><li><b>DHT11</b>: 0 to 50 deg C, plus or minus 2 deg C, whole-number resolution, at most one read per second. Fine for teaching, coarse for a greenhouse.</li><li><b>DHT22</b>: -40 to 80 deg C, plus or minus 0.5 deg C, 0.1 deg C resolution, at most one read every 2 seconds. Read faster and you get the previous value or an error.</li><li><b>BME280</b>: temperature, humidity and pressure; fast over I2C, plus or minus 1 hPa. Use "forced mode" and measure only when needed to reduce self-heating.</li></ul>
<p>A failed read (<code>NaN</code>) is normal: the DHT22 times out, the cable is long. The right move is to <b>skip</b> that sample, not to resend the last value; otherwise the cloud sees a "constant temperature".</p>
<h3>Payload format and packet size</h3>
<p>The same reading can go in three formats: JSON (<code>{"t":23.4,"h":51.2}</code>, readable and self-describing), CSV (<code>23.4,51.2</code>, needs an agreed order) or binary (int16 times 10, a fixed 8 bytes). The size of an MQTT PUBLISH packet is:</p>
<div class="eq">size = 1 + remaining_length_bytes + (2 + topic) + (QoS &gt; 0 ? 2 : 0) + payload</div>
<p>On top come TCP/IP headers (about 40 bytes) and a TLS record (about 29 bytes). With small payloads the headers dominate: an 8-byte binary payload instead of 60 bytes of JSON may not even halve the total traffic. Think about the <b>interval</b> and <b>when</b> you send first.</p>
<h3>Report on change</h3>
<p>If the temperature moves 0.1 deg C in 10 minutes, publishing every 10 seconds wastes energy. <b>Dead band</b>: send only if the value differs from the last one sent by at least delta. <b>Heartbeat</b>: send anyway after a set time, so silence is not confused with "the device is dead". Put an NTP timestamp in every message; because of network delay and queues, the moment the broker sees a message is not the moment of measurement.</p>`,
      code: [telemetryCpp('en'), telemetryPy('en')],
      lab: 'In the telemetry simulation switch the format between JSON, CSV and binary: how many bytes is the packet? Set the interval to 10 s, turn TLS on and note the daily data volume; then raise the dead band to 0.3 deg C and compare how far the message count drops. In Wokwi build the ESP32 + DHT22 + BME280 circuit, run the C++ code and see in the serial monitor that it publishes only on change.',
      pitfalls: ['Reading the DHT22 more often than every 2 seconds: the value does not update or read errors increase.', 'Resending the last value after a failed read: the cloud thinks the sensor is healthy.', 'Wiring the LDR to an ADC2 pin: it does not work while Wi-Fi is on, use ADC1 (GPIO32 to 39).', 'Treating the broker arrival time as the timestamp: for a queued device or one waking from deep sleep the measurement time differs.', 'Adding a dead band without a heartbeat: in a stable environment silence is confused with "device offline".'],
      se: `<p>The telemetry format is a <b>contract</b>: device and cloud are updated separately, and the format must not break both at once.</p>
<ul><li>Carry a version field in the payload (<code>"v":1</code>); adding a field is backward compatible, changing the meaning of a field is not.</li><li>Write the encoder and decoder as pure functions and add an "encode then decode = same value" test; byte order is the most common bug in binary formats.</li></ul>`,
      quiz: [
        { q: 'What is the main reason to pick a DHT22 over a DHT11 for a greenhouse temperature?', options: ['The DHT22 uses I2C', 'The DHT22 is more accurate (0.5 deg C) with 0.1 deg C resolution', 'The DHT22 reads 10 times a second', 'The DHT22 also measures pressure'], answer: 1, why: 'The DHT11 is accurate to 2 deg C with whole-number resolution; the DHT22 gives 0.5 deg C and 0.1 deg C. It reads even more slowly (2 s).' },
        { q: 'A BME280 does not show up in an I2C scan. What should you try first?', options: ['Turn Wi-Fi off', 'Change the baud rate', 'Try address 0x77 instead of 0x76 (or the reverse) and check SDA 21, SCL 22', 'Remove the DHT library'], answer: 2, why: 'Depending on the SDO pin the address is 0x76 or 0x77; the default I2C pins on the ESP32 are 21 and 22.' },
        { q: 'Dead band 0.3 deg C, heartbeat 10 minutes. If the temperature does not change for an hour, how many messages are published?', options: ['0', '1', '60', '6'], answer: 3, why: 'No change, but the heartbeat forces a message every 10 minutes: 6 per hour.' },
        { q: 'What is the right behaviour for a failed (NaN) DHT22 read?', options: ['Skip that sample and increase an error counter', 'Republish the last valid value', 'Publish 0', 'Reboot the device'], answer: 0, why: 'A made-up or repeated value corrupts the data; the sample is skipped, and if it keeps happening an error goes to a health topic.' },
      ],
    },
  },
  {
    n: 7, sims: ['eyleyici', 'pano'], parts: ['esp32-esp32-wroom-devkit', 'irf540', 'sg90', 'led', 'oled-ssd1306-0-96'], wokwi: true,
    related: [{ href: '/laboratuvar', tr: 'Devre laboratuvarı: MOSFET, servo ve OLED kitleri', en: 'Circuit lab: MOSFET, servo and OLED kits' }],
    tr: {
      title: 'Uzaktan eyleyiciler ve canlı pano',
      summary: 'Röle, MOSFET ve servoyu MQTT ile güvenle sür: idempotent komut, komut kimliği, cihaz gölgesi; telemetriyi canlı panoda çiz.',
      goals: ['"Çevir" ile "ayarla" komutlarının yinelenen teslimde farkını göstermek', 'Komut kimliği ve kalıcı durum konusuyla istenen/bildirilen gölgeyi kurmak', 'Halka tampon ve min/max seyreltmeyle sabit bellekli canlı grafik çizmek', 'Histerezisli eşik uyarısının neden titreşmediğini açıklamak'],
      notes: `<p>Sensör okumak tek yönlüdür; bir fanı, pencereyi ya da pompayı uzaktan sürmek ise <b>iki yönlü</b> ve risklidir. Komut kaybolabilir, iki kez gelebilir, cihaz o anda kapalı olabilir. Bu ünitede komutları bu durumların hepsine dayanıklı yapacağız.</p>
<h3>Eyleyici donanımı</h3>
<ul><li><b>MOSFET (IRF540)</b>: DC fan ya da LED şeridi için düşük taraf anahtar. IRF540 3,3 V kapı geriliminde tam açılmaz; mantık seviyeli bir MOSFET ya da sürücü transistör kullan, endüktif yükte flyback diyot koy.</li><li><b>Röle modülü</b>: şebeke yükü için yalıtım sağlar ama mekaniktir; ömrü anahtarlama sayısıyla sınırlıdır.</li><li><b>Servo (SG90)</b>: 50 Hz PWM, 0,5–2,5 ms darbe; pencere açısı gibi mutlak konum komutları için doğaldır.</li></ul>
<h3>İdempotent komut</h3>
<p>QoS 1 "en az bir kez" teslim eder: PUBACK kaybolursa mesaj ikinci kez gelir. <code>{"cmd":"toggle"}</code> iki kez uygulanınca fan istenen durumun tersinde kalır. <code>{"on":true}</code> ise kaç kez gelirse gelsin aynı sonucu verir: buna <b>idempotent</b> denir. Bir adım ileri: her komuta artan bir <code>id</code> ver, cihaz son uyguladığı kimliği saklasın ve küçük ya da eşit kimliği yok saysın.</p>
<div class="eq">gölge farkı = { alan : istenen ≠ bildirilen }</div>
<p><b>Cihaz gölgesi</b> iki durum tutar: pano "istenen"i (<code>sera/01/fan/set</code>) yazar, cihaz gerçekten uyguladığını "bildirilen" olarak kalıcı (retained) bir konuya (<code>sera/01/fan/state</code>) yayımlar. Fark boş değilse komut henüz uygulanmamıştır; pano düğmeyi "bekliyor" gösterir, "açık" değil.</p>
<h3>Canlı pano</h3>
<p>Cihazda ya da tarayıcıda sınırsız dizi tutulamaz. <b>Halka tampon</b> sabit kapasitelidir, en eski değer ezilir. Ekran 300 piksel genişse 10 000 noktayı çizmek anlamsızdır; <b>min/max seyreltme</b> her kovadan en küçük ve en büyük değeri alır, böylece kısa bir tepe kaybolmaz (basit ortalama onu siler). Uyarı için <b>histerezis</b> kullan: 30 °C üstünde aç, 28 °C altında kapat; tek eşikte değer 30 civarında gezinirken uyarı saniyede birkaç kez açılıp kapanır. Gerçek projede bu panoyu Node-RED ya da Grafana ile de kurabilirsin; ilkeler aynıdır.</p>`,
      code: [actuatorCpp('tr'), dashboardPy('tr')],
      lab: 'Eyleyici simülasyonunda kayıp oranını %30 yap ve "çevir" komutuyla 20 komut gönder: son durum beklenenle aynı mı, kaç yinelenen teslim oldu? Aynısını "ayarla" ve "ayarla + kimlik" ile tekrarla. Pano simülasyonunda halka tamponu küçült ve çizilen nokta sayısını 30\'a indir: tepe hâlâ görünüyor mu? Uyarı kapanma eşiğini açma eşiğine yaklaştır ve titreşimi izle. Wokwi\'de ESP32 + LED + servo kur ve komutu MQTT ile gönder.',
      pitfalls: ['QoS 1 ile "toggle" komutu göndermek: tek bir yinelenen teslim durumu tersine çevirir.', 'Panoda düğmeyi komut gönderilir gönderilmez "açık" göstermek: cihaz uygulamadan durum değişmiş görünür.', 'Bildirilen durumu kalıcı (retained) yayımlamamak: sonradan açılan pano cihazın durumunu bilemez.', 'IRF540\'ı doğrudan 3,3 V GPIO ile sürmek: tam açılmaz, ısınır.', 'Grafikte seyreltme için ortalama almak: kısa süreli tepeler ve arızalar görünmez olur.'],
      se: `<p>Uzaktan komut, dağıtık sistemlerdeki "tam olarak bir kez" sorununun küçük bir örneğidir. Ağ bunu garanti etmez; <b>uygulama</b> idempotentlikle sağlar.</p>
<ul><li>Komut işleyicisini saf bir fonksiyon olarak yaz: (durum, komut) → yeni durum. "Aynı komutu iki kez uygula = bir kez uygula" bir özellik testidir.</li><li>Pano ile cihaz arasındaki konu adları ve yük şeması bir <code>README</code> ya da AsyncAPI belgesinde yazılı olsun; iki taraf da ona göre test edilir.</li></ul>`,
      quiz: [
        { q: 'QoS 1 ile gönderilen "toggle" komutunun PUBACK\'i kayboldu. Ne olur?', options: ['Mesaj kaybolur', 'Mesaj yeniden gönderilir, cihaz iki kez çevirir ve fan istenenin tersinde kalır', 'Broker yinelenen mesajı süzer', 'Cihaz otomatik olarak QoS 2\'ye geçer'], answer: 1, why: 'QoS 1 en az bir kez teslim eder; yinelenen teslimde toggle durumu iki kez çevirir. Mutlak "set" komutu bu sorundan etkilenmez.' },
        { q: 'Cihaz gölgesinde "istenen" fan=1, "bildirilen" fan=0. Panoda ne gösterilmeli?', options: ['Fan açık', 'Fan kapalı ve hata', 'Hiçbir şey', 'Komut bekliyor (henüz uygulanmadı)'], answer: 3, why: 'Fark boş değil: komut gönderildi ama cihaz uyguladığını bildirmedi. Durum "bekliyor"dur.' },
        { q: 'Ekranda 10 000 noktayı 300 kovaya indirirken kısa bir sıcaklık tepesini korumak için hangisi?', options: ['Her kovanın en küçük ve en büyük değerini almak (min/max seyreltme)', 'Her kovanın ortalamasını almak', 'Her 33. noktayı almak', 'Son 300 noktayı almak'], answer: 0, why: 'Min/max seyreltme her kovanın uç değerlerini tutar; ortalama ve atlama tepeleri kaybedebilir.' },
        { q: 'Uyarı 30 °C\'de açılıyor. Kapanma eşiği neden 28 °C gibi daha düşük seçilir?', options: ['Enerji tasarrufu için', 'MQTT bunu zorunlu kılar', 'Değer eşik civarında gezinirken uyarının sürekli açılıp kapanmasını (titreşimi) önlemek için', 'Sensör hatasını düzeltmek için'], answer: 2, why: 'Histerezis iki eşik arasında önceki durumu korur; tek eşikte gürültü uyarıyı titretir.' },
      ],
    },
    en: {
      title: 'Remote actuators and a live dashboard',
      summary: 'Drive a relay, MOSFET and servo safely over MQTT: idempotent commands, command ids, a device shadow; plot telemetry on a live dashboard.',
      goals: ['Show the difference between "toggle" and "set" commands under duplicate delivery', 'Build a desired/reported shadow with a command id and a retained state topic', 'Draw a fixed-memory live chart with a ring buffer and min/max downsampling', 'Explain why a threshold alert with hysteresis does not flicker'],
      notes: `<p>Reading a sensor is one way; driving a fan, window or pump remotely is <b>two way</b> and risky. A command can get lost, arrive twice, or reach a device that is switched off at that moment. In this unit we make commands robust to all of these.</p>
<h3>Actuator hardware</h3>
<ul><li><b>MOSFET (IRF540)</b>: a low-side switch for a DC fan or LED strip. The IRF540 does not fully turn on at a 3.3 V gate; use a logic-level MOSFET or a driver transistor, and add a flyback diode on inductive loads.</li><li><b>Relay module</b>: gives isolation for mains loads but is mechanical; its life is limited by the number of switching cycles.</li><li><b>Servo (SG90)</b>: 50 Hz PWM, 0.5 to 2.5 ms pulse; natural for absolute position commands such as a window angle.</li></ul>
<h3>Idempotent commands</h3>
<p>QoS 1 delivers "at least once": if the PUBACK is lost the message arrives a second time. <code>{"cmd":"toggle"}</code> applied twice leaves the fan in the opposite of the wanted state. <code>{"on":true}</code> gives the same result however many times it arrives: this is called <b>idempotent</b>. One step further: give every command an increasing <code>id</code>, have the device remember the last id it applied and ignore smaller or equal ids.</p>
<div class="eq">shadow delta = { field : desired != reported }</div>
<p>A <b>device shadow</b> keeps two states: the dashboard writes "desired" (<code>sera/01/fan/set</code>), and the device publishes what it actually applied as "reported" to a retained topic (<code>sera/01/fan/state</code>). If the delta is not empty the command has not been applied yet; the dashboard shows the button as "pending", not "on".</p>
<h3>Live dashboard</h3>
<p>Neither the device nor the browser can keep an unbounded array. A <b>ring buffer</b> has a fixed capacity and overwrites the oldest value. If the screen is 300 pixels wide, drawing 10,000 points is pointless; <b>min/max downsampling</b> keeps the smallest and largest value of each bucket, so a short peak does not vanish (a plain average erases it). For alerts use <b>hysteresis</b>: on above 30 deg C, off below 28 deg C; with a single threshold the alert switches on and off several times a second while the value hovers around 30. In a real project you can also build this dashboard with Node-RED or Grafana; the principles are the same.</p>`,
      code: [actuatorCpp('en'), dashboardPy('en')],
      lab: 'In the actuator simulation set the loss rate to 30% and send 20 commands with "toggle": is the final state the expected one, how many duplicate deliveries were there? Repeat with "set" and "set + id". In the dashboard simulation shrink the ring buffer and cut the drawn points to 30: is the peak still visible? Move the alert off threshold close to the on threshold and watch it flicker. In Wokwi build an ESP32 + LED + servo and send the command over MQTT.',
      pitfalls: ['Sending a "toggle" command with QoS 1: a single duplicate delivery flips the state.', 'Showing the dashboard button as "on" as soon as the command is sent: the state looks changed before the device applies it.', 'Not publishing the reported state as retained: a dashboard opened later cannot know the device state.', 'Driving an IRF540 straight from a 3.3 V GPIO: it does not fully turn on and gets hot.', 'Averaging when downsampling a chart: short peaks and faults become invisible.'],
      se: `<p>A remote command is a small example of the "exactly once" problem in distributed systems. The network does not guarantee it; the <b>application</b> provides it through idempotency.</p>
<ul><li>Write the command handler as a pure function: (state, command) to new state. "Apply the same command twice = apply it once" is a property test.</li><li>Keep the topic names and payload schema between dashboard and device in a <code>README</code> or AsyncAPI document; both sides are tested against it.</li></ul>`,
      quiz: [
        { q: 'The PUBACK of a "toggle" command sent with QoS 1 was lost. What happens?', options: ['The message is lost', 'The message is resent, the device toggles twice and the fan ends up opposite to the wanted state', 'The broker filters the duplicate', 'The device switches to QoS 2 automatically'], answer: 1, why: 'QoS 1 delivers at least once; a duplicate delivery toggles twice. An absolute "set" command is immune to this.' },
        { q: 'In the device shadow "desired" is fan=1 and "reported" is fan=0. What should the dashboard show?', options: ['Fan on', 'Fan off and an error', 'Nothing', 'Command pending (not applied yet)'], answer: 3, why: 'The delta is not empty: the command was sent but the device has not reported applying it. The state is "pending".' },
        { q: 'Reducing 10,000 points to 300 buckets on screen, which keeps a short temperature peak?', options: ['Taking the smallest and largest value of each bucket (min/max downsampling)', 'Taking the average of each bucket', 'Taking every 33rd point', 'Taking the last 300 points'], answer: 0, why: 'Min/max downsampling keeps the extremes of each bucket; averaging and skipping can lose peaks.' },
        { q: 'An alert turns on at 30 deg C. Why choose a lower off threshold such as 28 deg C?', options: ['To save energy', 'MQTT requires it', 'To stop the alert switching on and off (flickering) while the value hovers around the threshold', 'To correct sensor error'], answer: 2, why: 'Hysteresis keeps the previous state between the two thresholds; with one threshold noise makes the alert flicker.' },
      ],
    },
  },
  {
    n: 8, sims: ['guc', 'ota'], parts: ['esp32-esp32-wroom-devkit', 'li-ion-18650-batarya', 'tp4056-korumali-bms', 'max17048-max17043-yakit-gostergesi'],
    related: [{ href: '/laboratuvar', tr: 'Devre laboratuvarı: 18650 ve MAX17048 kitleri', en: 'Circuit lab: 18650 and MAX17048 kits' }],
    tr: {
      title: 'Güç, derin uyku ve kablosuz güncelleme (OTA)',
      summary: 'Pil ömrünü ortalama akımla hesapla, derin uyku ve RTC belleğiyle aylarca çalış; A/B bölümlü OTA ile sahadaki cihazı güvenle güncelle.',
      goals: ['ESP32 güç kiplerinin akımlarını karşılaştırıp ortalama akım ve pil ömrünü hesaplamak', 'Derin uykuda RTC belleğini ve zamanlayıcı/ext0 uyanma kaynaklarını kullanmak', 'DevKit kartının uyku akımını neden bozduğunu açıklamak', 'A/B bölümlü OTA\'nın indirme, doğrulama, öz sınama ve geri dönüş adımlarını sıralamak'],
      notes: `<p>Prize bağlı bir cihazda güç sorun değildir; pille çalışan bir sera sensöründe ise tasarımın merkezindedir. ESP32 Wi-Fi ile yayın yaparken 100–160 mA çeker, derin uykuda yalın modül yaklaşık 10 µA. Aradaki fark dört kattan fazla değil, <b>on bin kat</b>tır.</p>
<h3>Güç kipleri</h3>
<ul><li><b>Sürekli açık</b>: Wi-Fi bağlı, yaklaşık 95 mA ortalama. 2000 mAh pil bir günden az dayanır.</li><li><b>Modem uykusu</b>: CPU çalışır, radyo DTIM aralıklarında uyur; 20 mA civarı.</li><li><b>Hafif uyku</b>: CPU durur, RAM korunur, uyanış hızlıdır; yüzlerce µA.</li><li><b>Derin uyku</b>: yalnız RTC çalışır; uyanış bir yeniden başlamadır. <code>RTC_DATA_ATTR</code> ile işaretli değişkenler korunur.</li></ul>
<div class="eq">I_ort = (I_uyanık · t_uyanık + I_uyku · (T − t_uyanık)) / T &nbsp;&nbsp; ömür = kapasite · 0,8 / I_ort</div>
<p>Örnek: 1,2 s boyunca 120 mA, 60 s aralık, 10 µA uyku: ortalama yaklaşık 2,4 mA; 2500 mAh 18650 ile yaklaşık 35 gün. Aralığı 5 dakikaya çıkarmak ömrü beş kat artırır. Ama dikkat: DevKit kartındaki AMS1117 regülatörü ve USB-seri çipi uykuda bile birkaç mA çeker; aynı hesap birkaç güne iner. Pil projesinde yalın modül ya da düşük sükunet akımlı regülatör seçilir.</p>
<h3>Pil tarafı</h3>
<p>18650 Li-ion ya da LiPo hücre TP4056 korumalı şarj modülüyle doldurulur; koruma devresi aşırı deşarjı keser. Gerilimden kalan yüzdeyi tahmin etmek kabadır; <b>MAX17048</b> yakıt göstergesi I²C ile yüzdeyi verir. Pil azalınca daha seyrek uyanmak basit ve etkili bir stratejidir.</p>
<h3>OTA: kablosuz güncelleme</h3>
<p>Sahadaki yüz cihaza USB ile gidilmez. ESP32 flaşında iki uygulama bölümü vardır (<code>ota_0</code>, <code>ota_1</code>). Yeni yazılım <b>çalışmayan</b> bölüme indirilir, özeti ve imzası doğrulanır, önyükleme bölümü değiştirilir, cihaz yeniden başlar. Yeni sürüm "beklemede" açılır: kendi sınamasını geçerse <code>esp_ota_mark_app_valid_cancel_rollback()</code> ile geçerli işaretlenir; geçemezse ya da çökerse bir sonraki açılışta eski bölüme dönülür. ArduinoOTA yerel ağda geliştirme için, HTTPUpdate ise sunucudan toplu güncelleme için kullanılır.</p>`,
      code: [deepSleepCpp('tr'), otaCpp('tr'), batteryPy('tr')],
      lab: 'Güç simülasyonunda aynı 60 s aralıkta dört kipi karşılaştır ve pil ömürlerini not et. Derin uykuda kart seçimini "DevKit" yap: ömür kaç kat düştü? Aralığı 5 dakikaya çıkar ve uyanık süreyi 3 s\'ye uzat (yavaş Wi-Fi). OTA simülasyonunda başarılı bir güncellemeyi sonuna kadar götür; sonra yeni sürümde öz sınamayı başarısız yap ve geri dönüşü izle. Gerçek kartta derin uyku kodunu yükle ve multimetreyle uyku akımını ölç.',
      pitfalls: ['Pil ömrünü yalın modülün 10 µA\'sıyla hesaplayıp DevKit kartı kullanmak: regülatör ve USB çipi mA düzeyinde çeker.', 'Derin uyku sonrası loop()\'un devam edeceğini sanmak: uyanış yeniden başlamadır, setup() baştan çalışır.', 'Uyanınca her seferinde Wi-Fi\'ye bağlanmak: değişim yoksa yayını atlamak en büyük tasarruftur.', 'OTA\'da sunucu sertifikasını doğrulamamak: araya giren biri kötü amaçlı yazılım yükleyebilir.', 'Yeni sürümü öz sınama yapmadan geçerli işaretlemek: hatalı sürümde geri dönüş şansı kaybolur.'],
      se: `<p>OTA bir <b>sürüm yönetimi</b> sorunudur: hangi cihazda hangi sürüm var, güncelleme nasıl kademeli açılır?</p>
<ul><li>Önce cihazların küçük bir kısmına (kanarya) dağıt, hata oranını izle, sonra herkese aç.</li><li>Yazılım sürümünü telemetriye ekle (<code>"fw":"1.5.0"</code>); bir hata bildiriminde ilk soru "hangi sürüm?" olur.</li></ul>`,
      quiz: [
        { q: 'ESP32 derin uykudan uyanınca ne olur?', options: ['loop() kaldığı yerden devam eder', 'Yalnız Wi-Fi yeniden bağlanır', 'Cihaz yeniden başlar; RTC_DATA_ATTR değişkenleri dışında RAM kaybolur', 'Cihaz hafif uykuya geçer'], answer: 2, why: 'Derin uyku sonrası uyanış bir yeniden başlamadır; yalnız RTC belleğindeki değişkenler korunur.' },
        { q: 'Uyanık 1,2 s × 120 mA, uyku 10 µA, aralık 60 s. Ortalama akım yaklaşık ne kadardır?', options: ['2,4 mA', '0,01 mA', '24 mA', '120 mA'], answer: 0, why: '(120 · 1,2 + 0,01 · 58,8) / 60 ≈ 2,41 mA.' },
        { q: 'Derin uykuda olması gereken 10 µA yerine kart 6 mA çekiyor. En olası neden?', options: ['Wi-Fi açık kalmış', 'DevKit kartındaki regülatör ve USB-seri çip', 'RTC belleği fazla kullanılmış', 'Pil dolu'], answer: 1, why: 'Yalın modül ~10 µA çeker; DevKit üzerindeki regülatör ve USB çipinin sükunet akımı mA düzeyindedir.' },
        { q: 'A/B OTA\'da yeni sürüm açıldı ama öz sınamayı geçemedi. Doğru sonuç hangisi?', options: ['Cihaz çalışmaz hâle gelir', 'Yeni sürüm yine de geçerli işaretlenir', 'Güncelleme sunucusu cihazı siler', 'Cihaz eski bölüme geri döner ve eski sürümle açılır'], answer: 3, why: 'Beklemedeki sürüm geçerli işaretlenmezse önyükleyici eski bölüme döner (rollback).' },
      ],
    },
    en: {
      title: 'Power, deep sleep and over-the-air updates (OTA)',
      summary: 'Work out battery life from the average current, run for months with deep sleep and RTC memory; update devices in the field safely with A/B OTA.',
      goals: ['Compare the currents of the ESP32 power modes and work out the average current and battery life', 'Use RTC memory and timer/ext0 wake sources in deep sleep', 'Explain why a DevKit board ruins the sleep current', 'List the download, verify, self-test and rollback steps of A/B OTA'],
      notes: `<p>For a mains-powered device power is not an issue; for a battery-powered greenhouse sensor it is at the centre of the design. The ESP32 draws 100 to 160 mA while publishing over Wi-Fi and a bare module about 10 uA in deep sleep. The difference is not four times, it is <b>ten thousand times</b>.</p>
<h3>Power modes</h3>
<ul><li><b>Always on</b>: Wi-Fi connected, about 95 mA on average. A 2000 mAh battery lasts less than a day.</li><li><b>Modem sleep</b>: the CPU runs, the radio sleeps between DTIM intervals; around 20 mA.</li><li><b>Light sleep</b>: the CPU stops, RAM is kept, waking is fast; hundreds of uA.</li><li><b>Deep sleep</b>: only the RTC runs; waking is a reboot. Variables marked <code>RTC_DATA_ATTR</code> are kept.</li></ul>
<div class="eq">I_avg = (I_awake * t_awake + I_sleep * (T - t_awake)) / T &nbsp;&nbsp; life = capacity * 0.8 / I_avg</div>
<p>Example: 120 mA for 1.2 s, a 60 s interval, 10 uA sleep: about 2.4 mA average; roughly 35 days on a 2500 mAh 18650. Raising the interval to 5 minutes multiplies the life by five. But careful: the AMS1117 regulator and USB-serial chip on a DevKit board draw a few mA even in sleep; the same calculation drops to a few days. A battery project uses a bare module or a regulator with a low quiescent current.</p>
<h3>The battery side</h3>
<p>An 18650 Li-ion or LiPo cell is charged with a TP4056 module with protection; the protection circuit cuts off over-discharge. Estimating the remaining percent from voltage is rough; a <b>MAX17048</b> fuel gauge gives the percent over I2C. Waking less often when the battery is low is a simple and effective strategy.</p>
<h3>OTA: updating over the air</h3>
<p>You do not visit a hundred devices in the field with a USB cable. The ESP32 flash has two app partitions (<code>ota_0</code>, <code>ota_1</code>). The new firmware is downloaded to the <b>idle</b> partition, its hash and signature are verified, the boot partition is switched and the device reboots. The new version starts "pending": if it passes its self-test it is marked valid with <code>esp_ota_mark_app_valid_cancel_rollback()</code>; if it fails or crashes, the next boot returns to the old partition. ArduinoOTA is for development on the local network, HTTPUpdate for fleet updates from a server.</p>`,
      code: [deepSleepCpp('en'), otaCpp('en'), batteryPy('en')],
      lab: 'In the power simulation compare the four modes at the same 60 s interval and note the battery life of each. In deep sleep switch the board to "DevKit": by what factor did the life drop? Raise the interval to 5 minutes and stretch the awake time to 3 s (slow Wi-Fi). In the OTA simulation take a successful update all the way; then make the self-test fail on the new version and watch the rollback. On a real board upload the deep sleep code and measure the sleep current with a multimeter.',
      pitfalls: ['Calculating battery life with the 10 uA of a bare module and then using a DevKit board: the regulator and USB chip draw mA.', 'Thinking loop() continues after deep sleep: waking is a reboot, setup() runs from the start.', 'Connecting to Wi-Fi on every wake: skipping the publish when nothing changed is the biggest saving.', 'Not verifying the server certificate during OTA: someone in the middle could install malicious firmware.', 'Marking the new version valid without a self-test: the chance to roll back a bad version is lost.'],
      se: `<p>OTA is a <b>release management</b> problem: which version runs on which device, and how is an update rolled out gradually?</p>
<ul><li>Deploy to a small share of devices first (canary), watch the error rate, then open it to everyone.</li><li>Add the firmware version to telemetry (<code>"fw":"1.5.0"</code>); the first question in any bug report is "which version?".</li></ul>`,
      quiz: [
        { q: 'What happens when an ESP32 wakes from deep sleep?', options: ['loop() continues where it left off', 'Only Wi-Fi reconnects', 'The device reboots; RAM is lost except RTC_DATA_ATTR variables', 'The device goes into light sleep'], answer: 2, why: 'Waking from deep sleep is a reboot; only variables in RTC memory are kept.' },
        { q: 'Awake 1.2 s at 120 mA, sleep 10 uA, interval 60 s. Roughly what is the average current?', options: ['2.4 mA', '0.01 mA', '24 mA', '120 mA'], answer: 0, why: '(120 * 1.2 + 0.01 * 58.8) / 60 is about 2.41 mA.' },
        { q: 'In deep sleep the board draws 6 mA instead of 10 uA. What is the most likely cause?', options: ['Wi-Fi was left on', 'The regulator and USB-serial chip on the DevKit board', 'Too much RTC memory is used', 'The battery is full'], answer: 1, why: 'A bare module draws about 10 uA; the quiescent current of the regulator and USB chip on a DevKit is in the mA range.' },
        { q: 'In A/B OTA the new version booted but failed its self-test. What is the right outcome?', options: ['The device is bricked', 'The new version is marked valid anyway', 'The update server wipes the device', 'The device returns to the old partition and boots the old version'], answer: 3, why: 'If the pending version is not marked valid, the bootloader goes back to the old partition (rollback).' },
      ],
    },
  },
  {
    n: 9, sims: ['guvenlik', 'ble'], parts: ['esp32-esp32-wroom-devkit', 'hc-05-bluetooth-modulu'],
    related: [{ href: '/laboratuvar', tr: 'Devre laboratuvarı: HC-05 (klasik Bluetooth) kiti', en: 'Circuit lab: HC-05 (classic Bluetooth) kit' }],
    tr: {
      title: 'IoT güvenliği ve Bluetooth Low Energy',
      summary: 'TLS, cihaz başına kimlik, depoya girmeyen sırlar ve MQTT ACL ile cihazı koru; BLE\'nin GATT modelini ve reklam aralığının pil ömrüne etkisini öğren.',
      goals: ['Basit bir IoT tehdit modeli çıkarıp her tehdide bir önlem eşlemek', 'ESP32\'de CA sertifikasıyla TLS (8883) kurmak ve kimlik bilgisini NVS\'te saklamak', 'Mosquitto ACL\'de %u ve %c ile her cihazı kendi konusuna kilitlemek', 'BLE GATT hizmet/özellik yapısını ve reklam aralığı ile akım arasındaki ilişkiyi açıklamak'],
      notes: `<p>Bir IoT cihazı evin ya da seranın içinde duran, ağa bağlı küçük bir bilgisayardır. Kötü yapılandırılmış bir broker'a internetten herkes bağlanıp ısıtıcıyı açabilir. Güvenlik sonradan eklenen bir özellik değil, <b>tasarım kararıdır</b>.</p>
<h3>Tehdit modeli</h3>
<ul><li><b>Dinleme</b>: şifresiz MQTT (1883) parolayı ve veriyi açık metin taşır. Önlem: TLS (8883).</li><li><b>Araya girme</b>: TLS var ama sertifika doğrulanmıyorsa (<code>setInsecure()</code>) sahte broker konuşmayı okur. Önlem: CA sertifikasıyla doğrulama.</li><li><b>Kimlik çalma</b>: tüm cihazlarda aynı parola varsa biri ele geçince hepsi düşer. Önlem: cihaz başına kimlik, üretimde NVS'e yazılır.</li><li><b>Yetki aşımı</b>: her istemci her konuya yazabiliyorsa bir sensör ısıtıcıyı açabilir. Önlem: ACL.</li><li><b>Kötü güncelleme</b>: imzasız OTA ile zararlı yazılım yüklenir. Önlem: imzalı görüntü ve güvenli önyükleme.</li></ul>
<h3>Sırlar ve ACL</h3>
<p>Wi-Fi ve broker parolası <code>secrets.h</code> dosyasında tutulur ve <code>.gitignore</code>'a eklenir; daha iyisi kurulumda <code>Preferences</code> (NVS) ile cihaza yazmaktır. Mosquitto'da <code>allow_anonymous false</code> ve bir ACL dosyası: <code>pattern write sera/%u/#</code> satırı her kullanıcıyı yalnız kendi adıyla başlayan konuya yazdırır. Eşleşen bir <code>deny</code> her izni ezer, hiç kural eşleşmezse erişim reddedilir. Seri hata ayıklama portunu ve ayrıntılı günlükleri üretim yazılımında kapat.</p>
<h3>BLE: yakın mesafe, düşük güç</h3>
<p>Laboratuvardaki <b>HC-05</b> klasik Bluetooth'tur: seri port gibi sürekli bağlantı, onlarca mA. <b>BLE</b> ise kısa olaylarla çalışır ve düğme pille aylarca dayanır. Veri <b>GATT</b> ile düzenlenir: hizmet (örneğin <code>0x181A</code> Çevresel Algılama) içinde özellikler (<code>0x2A6E</code> sıcaklık, sint16, 0,01 °C). Özellik okunabilir, yazılabilir ya da <b>notify</b> ile değişince telefona itilebilir. 23,45 °C → 2345 → <code>0x0929</code> → küçük-endian <code>29 09</code>.</p>
<div class="eq">I_ort ≈ I_uyku + Q_olay / aralık &nbsp;&nbsp; keşif ≈ aralık / 2 + tarama payı</div>
<p>Reklam aralığını 100 ms'den 1 s'ye çıkarmak ortalama akımı kabaca on kat düşürür ama telefonun cihazı bulması gecikir. ESP32'de Arduino için NimBLE, MicroPython için <code>aioble</code> kütüphanesi kullanılır.</p>`,
      code: [tlsCpp('tr'), aclConf('tr'), blePy('tr')],
      lab: 'Güvenlik simülasyonunda başlangıç kurulumunun risk puanını not et; TLS\'i aç ama sertifika doğrulamayı kapalı bırak, sonra her bulguyu tek tek düzelterek puanı sıfıra indir. ACL düzenleyicisinde "sera-01" kullanıcısının "sera/02/fan/set" konusuna yazamadığını, pano kullanıcısının okuyabildiğini sına. BLE simülasyonunda sıcaklık özelliğinin baytlarını oku, reklam aralığını 100 ms\'den 2 s\'ye çıkar ve düğme pil ömrünü karşılaştır.',
      pitfalls: ['TLS\'i açıp setInsecure() kullanmak: şifreli ama kiminle konuştuğunu bilmeyen bir bağlantı araya girmeye açıktır.', 'Wi-Fi parolasını kaynak koduna yazıp depoya göndermek: git geçmişinden silmek zordur.', 'Bütün cihazlara aynı broker parolasını vermek: biri ele geçirilince hepsi tehlikeye girer.', 'HC-05\'i BLE sanmak: klasik Bluetooth\'tur, telefon uygulamaları BLE GATT ile ona bağlanamaz.', 'BLE sıcaklığını metin olarak göndermek: standart özellik sint16 küçük-endian bekler, hazır uygulamalar yanlış okur.'],
      se: `<p>Güvenlik bir kontrol listesiyle başlar ama <b>otomasyonla</b> sürdürülür.</p>
<ul><li>Depoya sır girmesini engelleyen bir ön işleme kancası (ör. gitleaks) ve CI taraması ekle.</li><li>ACL kurallarını kod gibi test et: "sensör kullanıcısı set konusuna yazamaz" gibi olumsuz testler olumlu testler kadar önemlidir; <code>aclCheck</code> saf bir fonksiyon olduğu için bu kolaydır.</li></ul>`,
      quiz: [
        { q: 'ESP32 TLS ile bağlanıyor ama kod setInsecure() çağırıyor. Hangi saldırıya açıktır?', options: ['Araya girme (sahte broker)', 'Pil tüketme', 'ADC2 çakışması', 'Hiçbirine, TLS yeterlidir'], answer: 0, why: 'Şifreleme var ama sunucu kimliği doğrulanmıyor; sahte bir broker kendini gerçek gibi tanıtabilir.' },
        { q: 'ACL\'de "pattern write sera/%u/#" var. "sera-01" kullanıcısı hangi konuya yazabilir?', options: ['sera/#', 'sera/sera-02/fan', 'sera/sera-01/telemetri', 'Hiçbirine'], answer: 2, why: '%u kullanıcı adıyla değişir: sera/sera-01/# altındaki konular. Başka cihazın konusu eşleşmez.' },
        { q: 'BLE sıcaklık özelliği (sint16, 0,01 °C) 21,50 °C için hangi baytları taşır?', options: ['21 50', '08 66', '50 21', '66 08'], answer: 3, why: '21,50 → 2150 = 0x0866; küçük-endian sırada önce düşük bayt: 66 08.' },
        { q: 'Reklam aralığını 100 ms\'den 1 s\'ye çıkarmanın etkisi nedir?', options: ['Akım artar, keşif hızlanır', 'Ortalama akım düşer ama telefonun cihazı bulması gecikir', 'Hiçbir etkisi yoktur', 'Bağlantı şifrelenir'], answer: 1, why: 'Olay sayısı azalır, ortalama akım düşer; ama tarayan telefon reklamı daha geç yakalar.' },
      ],
    },
    en: {
      title: 'IoT security and Bluetooth Low Energy',
      summary: 'Protect the device with TLS, per-device credentials, secrets kept out of the repo and an MQTT ACL; learn the BLE GATT model and how the advertising interval affects battery life.',
      goals: ['Draw up a simple IoT threat model and map a countermeasure to each threat', 'Set up TLS (8883) on the ESP32 with a CA certificate and store credentials in NVS', 'Lock every device to its own topic with %u and %c in a Mosquitto ACL', 'Explain the BLE GATT service/characteristic structure and the link between advertising interval and current'],
      notes: `<p>An IoT device is a small networked computer sitting inside a home or a greenhouse. On a badly configured broker anyone on the internet can connect and switch the heater on. Security is not a feature added later; it is a <b>design decision</b>.</p>
<h3>Threat model</h3>
<ul><li><b>Eavesdropping</b>: unencrypted MQTT (1883) carries passwords and data in plain text. Countermeasure: TLS (8883).</li><li><b>Man in the middle</b>: TLS is on but the certificate is not verified (<code>setInsecure()</code>), so a fake broker reads the conversation. Countermeasure: verification with a CA certificate.</li><li><b>Credential theft</b>: if every device has the same password, one compromise takes down all of them. Countermeasure: per-device credentials written to NVS at provisioning.</li><li><b>Privilege escalation</b>: if every client can write to every topic, a sensor can switch on the heater. Countermeasure: an ACL.</li><li><b>Malicious update</b>: unsigned OTA lets malware be installed. Countermeasure: signed images and secure boot.</li></ul>
<h3>Secrets and ACL</h3>
<p>The Wi-Fi and broker passwords go into a <code>secrets.h</code> file listed in <code>.gitignore</code>; better still, write them to the device at setup with <code>Preferences</code> (NVS). In Mosquitto use <code>allow_anonymous false</code> and an ACL file: the line <code>pattern write sera/%u/#</code> lets each user write only to topics starting with its own name. A matching <code>deny</code> overrides every permission, and if no rule matches access is refused. Turn off the serial debug port and verbose logs in production firmware.</p>
<h3>BLE: short range, low power</h3>
<p>The <b>HC-05</b> in the lab is classic Bluetooth: a continuous serial-port-like link, tens of mA. <b>BLE</b> works in short events and lasts months on a coin cell. Data is organised with <b>GATT</b>: a service (for example <code>0x181A</code> Environmental Sensing) holds characteristics (<code>0x2A6E</code> temperature, sint16, 0.01 deg C). A characteristic can be read, written or pushed to the phone on change with <b>notify</b>. 23.45 deg C to 2345 to <code>0x0929</code> to little-endian <code>29 09</code>.</p>
<div class="eq">I_avg = I_sleep + Q_event / interval &nbsp;&nbsp; discovery = interval / 2 + scan margin</div>
<p>Raising the advertising interval from 100 ms to 1 s cuts the average current roughly tenfold, but the phone takes longer to find the device. On the ESP32 use NimBLE for Arduino and the <code>aioble</code> library for MicroPython.</p>`,
      code: [tlsCpp('en'), aclConf('en'), blePy('en')],
      lab: 'In the security simulation note the risk score of the starting setup; turn TLS on but leave certificate verification off, then fix each finding one by one until the score reaches zero. In the ACL editor test that user "sera-01" cannot write to "sera/02/fan/set" and that the dashboard user can read it. In the BLE simulation read the bytes of the temperature characteristic, raise the advertising interval from 100 ms to 2 s and compare the coin-cell life.',
      pitfalls: ['Turning TLS on and calling setInsecure(): an encrypted link that does not know who it is talking to is open to a man in the middle.', 'Writing the Wi-Fi password in the source and pushing it to the repo: it is hard to remove from git history.', 'Giving every device the same broker password: one compromised device endangers all of them.', 'Taking the HC-05 for BLE: it is classic Bluetooth, phone apps cannot connect to it with BLE GATT.', 'Sending BLE temperature as text: the standard characteristic expects sint16 little-endian, ready-made apps read it wrongly.'],
      se: `<p>Security starts with a checklist but is kept up through <b>automation</b>.</p>
<ul><li>Add a pre-commit hook (for example gitleaks) and a CI scan that stop secrets from entering the repo.</li><li>Test ACL rules like code: negative tests such as "a sensor user cannot write to a set topic" matter as much as positive ones; since <code>aclCheck</code> is a pure function this is easy.</li></ul>`,
      quiz: [
        { q: 'The ESP32 connects with TLS but the code calls setInsecure(). Which attack is it open to?', options: ['Man in the middle (fake broker)', 'Battery draining', 'ADC2 conflict', 'None, TLS is enough'], answer: 0, why: 'There is encryption but the server identity is not verified; a fake broker can pose as the real one.' },
        { q: 'The ACL contains "pattern write sera/%u/#". Which topic can user "sera-01" write to?', options: ['sera/#', 'sera/sera-02/fan', 'sera/sera-01/telemetri', 'None'], answer: 2, why: '%u is replaced by the username: topics under sera/sera-01/#. Another device\'s topic does not match.' },
        { q: 'Which bytes does the BLE temperature characteristic (sint16, 0.01 deg C) carry for 21.50 deg C?', options: ['21 50', '08 66', '50 21', '66 08'], answer: 3, why: '21.50 to 2150 = 0x0866; little-endian puts the low byte first: 66 08.' },
        { q: 'What is the effect of raising the advertising interval from 100 ms to 1 s?', options: ['Current rises, discovery speeds up', 'Average current drops but the phone takes longer to find the device', 'No effect at all', 'The link becomes encrypted'], answer: 1, why: 'Fewer events mean lower average current; but a scanning phone catches the advertisement later.' },
      ],
    },
  },
  {
    n: 10, sims: ['kurallar'], parts: ['esp32-esp32-wroom-devkit', 'dht22', 'bme280', 'ldr', 'irf540', 'sg90'], wokwi: true,
    related: [
      { href: '/muhendislik/sensor-ml', tr: 'Sensör verisinden ML tahmini: kural yerine öğrenilmiş anomali uyarısı', en: 'ML forecasting from sensor data: a learned anomaly alert instead of a rule' },
      { href: '/makine-ogrenmesi', tr: 'Makine öğrenmesi dersi', en: 'Machine learning course' },
    ],
    tr: {
      title: 'Akıllı ev ve akıllı sera: kural motoru ve sistem mimarisi',
      summary: 'EĞER … İSE … kurallarıyla seranın pencere, fan, ısıtıcı ve sulamasını yönet; histerezis, BEKLE ve çevrim dışı güvenli varsayılanlarla bitirme projesinin mimarisini kur.',
      goals: ['EĞER/İSE/VE/BEKLE diliyle sera kuralları yazıp 24 saatlik benzetimde puanlamak', 'Histerezis ve en kısa bekleme süresiyle röle anahtarlamasını azaltmak', 'Cihaz üstü (yerel) kurallarla bulut kurallarını ayırmak ve çevrim dışı güvenli varsayılan tanımlamak', 'Bitirme projesinin cihaz, broker, kural motoru ve pano mimarisini çizmek'],
      notes: `<p>Önceki ünitelerin hepsi burada birleşir: sensörler telemetri yayımlar, eyleyiciler komut alır, pano durumu gösterir. Eksik olan karar veren parçadır: <b>kural motoru</b>. Bu derste kurallar iki dilli küçük bir dille yazılır:</p>
<div class="eq">EĞER sicaklik &gt; 33 İSE fan = 1 BEKLE 5 &nbsp;&nbsp;|&nbsp;&nbsp; IF temp &gt; 33 THEN fan = 1 HOLD 5</div>
<h3>Kuralların anlamı</h3>
<ul><li>Her dakika kurallar <b>sırayla</b> değerlendirilir; koşulu tutan kural eyleyiciyi ayarlar, aynı eyleyicide sonraki kural kazanır.</li><li>Eyleyici yeni bir kural gelene kadar değerini korur. "33 üstünde aç" ve "29 altında kapat" iki kural birlikte <b>histerezis</b> oluşturur.</li><li><code>BEKLE n</code>: o eyleyici son değişimden bu yana n dakika geçmeden yeniden değiştirilemez. Röleyi, kompresörü ve pompayı sık anahtarlamadan korur.</li><li>Koşullar <code>VE</code> ile birleşir: <code>EĞER toprak &lt; 35 VE saat &gt;= 6 İSE sulama = 1</code> gece sulamayı engeller.</li></ul>
<h3>Yerel mi, bulutta mı?</h3>
<p>Isıtıcıyı kapatmak gibi güvenlik kuralları <b>cihazda</b> çalışmalıdır: Wi-Fi kopunca sera yanmamalı. Bulut kuralları (hava tahminine göre sulamayı ertelemek, birden çok seranın enerji bütçesi) daha esnektir ama gecikmeli ve bağlantıya bağımlıdır. İyi tasarım "yerel önce"dir: bulut kuralları güncellenebilir bir kural setini cihaza retained bir konuyla gönderir, cihaz doğrulayıp uygular. Bağlantı yoksa cihaz son geçerli kural setiyle, o da yoksa güvenli varsayılanlarla (ısıtıcı kapalı, pencere yarı açık) çalışır. Sensör arızasında (NaN ya da imkânsız değer) ısıtıcı asla açık kalmamalıdır.</p>
<h3>Bitirme projesinin mimarisi</h3>
<p>Akıllı sera dört katmandan oluşur: (1) ESP32 düğümleri: DHT22/BME280, LDR, toprak nemi, MOSFET ile fan ve pompa, servo ile pencere; (2) TLS'li MQTT broker ve ACL; (3) kural motoru: güvenlik kuralları cihazda, iyileştirme kuralları sunucuda; (4) pano: canlı grafik, gölge durumu, uyarılar. Kurallarını konfor yüzdesi, aşırı sıcak/soğuk dakika, anahtarlama sayısı ve enerjiyle puanla; bir sonraki derste sabit eşikler yerine öğrenilmiş bir anomali uyarısı kuracaksın.</p>`,
      code: [rulesCpp('tr'), rulesPy('tr')],
      lab: 'Kural motorunda varsayılan kuralları çalıştır ve konfor yüzdesini, fan anahtarlama sayısını ve enerjiyi not et. Fanın BEKLE süresini kaldır: anahtarlama sayısı ne oldu? Dış sıcaklığı düşürüp bulutluluğu artır ve ısıtıcı kurallarını konforu %90\'ın üstüne çıkaracak, enerjiyi en az tutacak şekilde ayarla. Sözdizimi hatalı bir satır ekle ve hatanın satır numarasıyla gösterildiğini gör. Wokwi\'de ESP32 + DHT22 + LED (fan) + servo (pencere) ile C++ kurallarını dene.',
      pitfalls: ['Aynı eşikte açıp kapatmak (EĞER > 30 aç, EĞER < 30 kapat): değer 30 civarında gezinince röle titreşir.', 'Güvenlik kuralını yalnız bulutta çalıştırmak: bağlantı kopunca ısıtıcı açık kalabilir.', 'Kural sırasını önemsememek: aynı eyleyicide sonraki kural kazanır, genel kural özel kuralı ezebilir.', 'Sensör NaN döndüğünde son kararı korumak: arızalı sensörle ısıtıcı saatlerce açık kalabilir.', 'Yeni kural setini doğrulamadan uygulamak: tek bir bozuk satır tüm otomasyonu durdurabilir.'],
      se: `<p>Kural motoru küçük bir <b>alan özgü dil</b>dir (DSL): ayrıştırıcı, değerlendirici ve benzetici ayrı ve saf parçalardır.</p>
<ul><li>Ayrıştırıcıya hatalı girdiler için testler yaz: bilinmeyen sensör, eksik İSE, değer 0/1 dışında. Hata satır numarasıyla dönmeli.</li><li>Benzetimi bir <b>regresyon testi</b> olarak kullan: kural setini değiştiren her commit "konfor ≥ %90, ısıtıcı anahtarlaması ≤ 6" gibi bir ölçütü geçmeli.</li></ul>`,
      quiz: [
        { q: '"EĞER sicaklik > 33 İSE fan = 1" ve "EĞER sicaklik < 29 İSE fan = 0" kuralları varken sıcaklık 31 °C. Fan ne yapar?', options: ['Önceki durumunu korur', 'Her zaman açılır', 'Her zaman kapanır', 'Hata verir'], answer: 0, why: 'Hiçbir kural tutmaz; eyleyici değerini korur. İki kural birlikte histerezis oluşturur.' },
        { q: 'BEKLE 10 olan ısıtıcı 08:00\'de açıldı. Kural 08:04\'te kapatmak istiyor. Ne olur?', options: ['Hemen kapanır', 'Kural silinir', '08:10\'a kadar açık kalır, sonra kural hâlâ tutuyorsa kapanır', 'Alarm çalar'], answer: 2, why: 'BEKLE son değişimden itibaren en kısa süreyi zorunlu kılar; röleyi sık anahtarlamadan korur.' },
        { q: 'Wi-Fi kopunca ısıtıcının güvenli durumu nasıl sağlanır?', options: ['Bulut kuralı bekler', 'Pano uyarı gösterir', 'Broker son vasiyeti yayımlar', 'Güvenlik kuralları cihazda çalışır ve sensör arızasında ısıtıcıyı kapatır'], answer: 3, why: 'Yerel önce tasarım: kritik kurallar bağlantıdan bağımsız olarak cihazda çalışmalıdır.' },
        { q: 'Aynı dakikada iki kural pencereyi farklı değerlere ayarlıyor. Hangisi kazanır?', options: ['İlk yazılan', 'Sonra yazılan (listede alttaki)', 'Değeri 1 olan', 'Hiçbiri, pencere değişmez'], answer: 1, why: 'Kurallar sırayla değerlendirilir ve aynı eyleyicide sonraki kural kazanır.' },
      ],
    },
    en: {
      title: 'Smart home and smart greenhouse: rules engine and system architecture',
      summary: 'Drive the greenhouse window, fan, heater and irrigation with IF ... THEN ... rules; build the capstone architecture with hysteresis, HOLD and safe offline defaults.',
      goals: ['Write greenhouse rules in the IF/THEN/AND/HOLD language and score them in a 24-hour simulation', 'Reduce relay switching with hysteresis and a minimum hold time', 'Separate on-device (local) rules from cloud rules and define a safe offline default', 'Draw the device, broker, rules engine and dashboard architecture of the capstone'],
      notes: `<p>Everything from the earlier units comes together here: sensors publish telemetry, actuators take commands, the dashboard shows the state. The missing piece is the one that decides: the <b>rules engine</b>. In this course rules are written in a small bilingual language:</p>
<div class="eq">EGER sicaklik &gt; 33 ISE fan = 1 BEKLE 5 &nbsp;&nbsp;|&nbsp;&nbsp; IF temp &gt; 33 THEN fan = 1 HOLD 5</div>
<h3>What the rules mean</h3>
<ul><li>Every minute the rules are evaluated <b>in order</b>; a rule whose condition holds sets its actuator, and on the same actuator the later rule wins.</li><li>An actuator keeps its value until a new rule fires. The two rules "on above 33" and "off below 29" together form <b>hysteresis</b>.</li><li><code>HOLD n</code>: that actuator cannot be changed again until n minutes have passed since its last change. It protects relays, compressors and pumps from rapid switching.</li><li>Conditions combine with <code>AND</code>: <code>IF soil &lt; 35 AND hour &gt;= 6 THEN pump = 1</code> prevents watering at night.</li></ul>
<h3>Local or in the cloud?</h3>
<p>Safety rules such as switching off the heater must run <b>on the device</b>: when Wi-Fi drops, the greenhouse must not burn. Cloud rules (delaying irrigation because of the weather forecast, the energy budget of several greenhouses) are more flexible but delayed and depend on the connection. Good design is "local first": cloud rules send an updatable rule set to the device on a retained topic, and the device validates and applies it. Without a connection the device runs on its last valid rule set, and without that on safe defaults (heater off, window half open). On a sensor fault (NaN or an impossible value) the heater must never stay on.</p>
<h3>Capstone architecture</h3>
<p>The smart greenhouse has four layers: (1) ESP32 nodes: DHT22/BME280, LDR, soil moisture, fan and pump through a MOSFET, a window on a servo; (2) an MQTT broker with TLS and an ACL; (3) the rules engine: safety rules on the device, optimisation rules on the server; (4) the dashboard: live chart, shadow state, alerts. Score your rules by comfort percentage, too hot/cold minutes, switch count and energy; in the next course you will build a learned anomaly alert instead of fixed thresholds.</p>`,
      code: [rulesCpp('en'), rulesPy('en')],
      lab: 'In the rules engine run the default rules and note the comfort percentage, fan switch count and energy. Remove the HOLD time of the fan: what happened to the switch count? Lower the outside temperature, raise the cloud cover and tune the heater rules to push comfort above 90% with the least energy. Add a line with a syntax error and see the error reported with its line number. In Wokwi try the C++ rules with an ESP32 + DHT22 + LED (fan) + servo (window).',
      pitfalls: ['Switching on and off at the same threshold (IF > 30 on, IF < 30 off): the relay chatters while the value hovers around 30.', 'Running a safety rule only in the cloud: when the connection drops the heater can stay on.', 'Ignoring rule order: on the same actuator the later rule wins, so a general rule can override a specific one.', 'Keeping the last decision when the sensor returns NaN: with a broken sensor the heater can stay on for hours.', 'Applying a new rule set without validating it: a single broken line can stop all automation.'],
      se: `<p>The rules engine is a small <b>domain-specific language</b> (DSL): the parser, evaluator and simulator are separate, pure pieces.</p>
<ul><li>Write tests for bad input to the parser: unknown sensor, missing THEN, a value other than 0/1. The error must come back with its line number.</li><li>Use the simulation as a <b>regression test</b>: every commit that changes the rule set must pass a criterion such as "comfort at least 90%, heater switches at most 6".</li></ul>`,
      quiz: [
        { q: 'With the rules "IF temp > 33 THEN fan = 1" and "IF temp < 29 THEN fan = 0", the temperature is 31 deg C. What does the fan do?', options: ['Keeps its previous state', 'Always turns on', 'Always turns off', 'Raises an error'], answer: 0, why: 'No rule fires; the actuator keeps its value. The two rules together form hysteresis.' },
        { q: 'A heater with HOLD 10 switched on at 08:00. At 08:04 a rule wants to turn it off. What happens?', options: ['It turns off at once', 'The rule is deleted', 'It stays on until 08:10, then turns off if the rule still holds', 'An alarm sounds'], answer: 2, why: 'HOLD enforces a minimum time since the last change; it protects the relay from rapid switching.' },
        { q: 'How is the heater kept safe when Wi-Fi drops?', options: ['A cloud rule waits', 'The dashboard shows a warning', 'The broker publishes the last will', 'Safety rules run on the device and switch the heater off on a sensor fault'], answer: 3, why: 'Local-first design: critical rules must run on the device independently of the connection.' },
        { q: 'In the same minute two rules set the window to different values. Which wins?', options: ['The one written first', 'The one written later (lower in the list)', 'The one with value 1', 'Neither, the window does not change'], answer: 1, why: 'Rules are evaluated in order and on the same actuator the later rule wins.' },
      ],
    },
  },
]
