// ESP32 ile Nesnelerin İnterneti dersi üniteleri 1–5: ESP32'ye giriş ve pinler, Wi-Fi, HTTP/REST ve JSON, MQTT temelleri,
// MQTT güvenilirliği (QoS, retained, LWT, keepalive). HTML iki dilde aynı etiket dizisinde; kod aynı, yalnız yorumlar çevrilir.
import type { IotSimId } from '@/components/iot/sim-meta'
import type { CodeBlock, CourseUnit, Lang } from '@/lib/kurs/types'

const k = (l: Lang, tr: string, en: string) => (l === 'tr' ? tr : en)

// --- Kod blokları (iki dilde aynı satırlar) -----------------------------------------------------------------------------------

const blinkCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: LED ve LDR (ADC1)', 'Arduino C++: LED and LDR (ADC1)'),
  src: `// ${k(l, 'ESP32 DevKit: GPIO 2 kart LED\'i, GPIO 34 LDR bölücüsü', 'ESP32 DevKit: GPIO 2 on-board LED, GPIO 34 LDR divider')}
const int LED_PIN = 2;    // ${k(l, 'çıkış; açılış pini, LED yalnız sürüş için uygun', 'output; boot pin, fine for driving an LED')}
const int LDR_PIN = 34;   // ${k(l, 'ADC1_CH6, yalnız giriş, iç pull-up yok', 'ADC1_CH6, input only, no internal pull-up')}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  analogReadResolution(12);             // ${k(l, '0..4095', '0..4095')}
  analogSetAttenuation(ADC_11db);       // ${k(l, 'yaklaşık 0..3,1 V ölçüm aralığı', 'about 0..3.1 V input range')}
}

void loop() {
  int raw = analogRead(LDR_PIN);
  float v = raw * 3.1f / 4095.0f;       // ${k(l, 'doğrusal yaklaşım; uçlarda ADC doğrusal değil', 'linear approximation; the ADC is not linear at the ends')}
  digitalWrite(LED_PIN, raw < 1200 ? HIGH : LOW);  // ${k(l, 'karanlıkta LED yanar', 'LED on in the dark')}
  Serial.printf("raw=%d  V=%.2f\\n", raw, v);
  delay(500);
}`,
})

const blinkPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: aynı devre, REPL\'de dene', 'MicroPython: the same circuit, try it in the REPL'),
  src: `from machine import Pin, ADC
import time

led = Pin(2, Pin.OUT)
ldr = ADC(Pin(34))          # ${k(l, 'ADC1: Wi-Fi açıkken de çalışır', 'ADC1: works while Wi-Fi is on')}
ldr.atten(ADC.ATTN_11DB)    # ${k(l, 'yaklaşık 0..3,1 V', 'about 0..3.1 V')}
ldr.width(ADC.WIDTH_12BIT)  # ${k(l, '0..4095', '0..4095')}

while True:
    raw = ldr.read()
    led.value(1 if raw < 1200 else 0)   # ${k(l, 'karanlıkta yan', 'on in the dark')}
    print(raw, round(raw * 3.1 / 4095, 2))
    time.sleep_ms(500)`,
})

const wifiCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: bloklamayan bağlantı ve üstel geri çekilme', 'Arduino C++: non-blocking connect and exponential backoff'),
  src: `#include <WiFi.h>
#include "secrets.h"        // ${k(l, 'WIFI_SSID, WIFI_PASS; dosya .gitignore\'da', 'WIFI_SSID, WIFI_PASS; file is in .gitignore')}

const uint32_t BASE_MS = 1000, CAP_MS = 30000;
uint32_t nextTry = 0;
uint8_t failures = 0;

uint32_t backoffMs(uint8_t k) {
  uint32_t w = BASE_MS << min<uint8_t>(k, 15);   // ${k(l, 'base, 2·base, 4·base…', 'base, 2*base, 4*base...')}
  w = min(w, CAP_MS);
  return w / 2 + random(w / 2);                   // ${k(l, 'sarsıntı (jitter): cihazlar aynı anda denemesin', 'jitter: devices should not retry in lockstep')}
}

void wifiTask() {                                 // ${k(l, 'loop() içinden çağrılır, asla beklemez', 'called from loop(), never blocks')}
  wl_status_t s = WiFi.status();
  if (s == WL_CONNECTED) { failures = 0; return; }
  if (millis() < nextTry) return;
  Serial.printf("status=%d, try %u\\n", s, failures + 1);
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  nextTry = millis() + backoffMs(failures++);
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);                            // ${k(l, 'istemci kipi; AP kipi kurulum sayfası içindir', 'station mode; AP mode is for a setup page')}
  WiFi.setAutoReconnect(false);                   // ${k(l, 'yeniden bağlanmayı biz yönetiyoruz', 'we manage reconnecting ourselves')}
}

void loop() {
  wifiTask();
  if (WiFi.status() == WL_CONNECTED) {
    // ${k(l, 'sensör oku, yayımla; RSSI -80 dBm altındaysa uyar', 'read sensors, publish; warn if RSSI is below -80 dBm')}
    if (WiFi.RSSI() < -80) Serial.println("weak signal");
  }
}`,
})

const wifiPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: durum kodları ve geri çekilme', 'MicroPython: status codes and backoff'),
  src: `import network, time, random
from secrets import SSID, PASSWORD   # ${k(l, 'Wokwi\'de SSID = "Wokwi-GUEST", parola boş', 'in Wokwi SSID = "Wokwi-GUEST", empty password')}

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

def connect(base=1, cap=30):
    k = 0
    while not wlan.isconnected():
        wlan.connect(SSID, PASSWORD)
        t0 = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), t0) < 5000 and not wlan.isconnected():
            time.sleep_ms(100)
        if wlan.isconnected():
            break
        print('status', wlan.status())      # ${k(l, 'STAT_NO_AP_FOUND, STAT_WRONG_PASSWORD…', 'STAT_NO_AP_FOUND, STAT_WRONG_PASSWORD...')}
        w = min(cap, base * 2 ** k)
        time.sleep(w / 2 + random.random() * w / 2)
        k += 1
    print('ip', wlan.ifconfig()[0], 'rssi', wlan.status('rssi'))

connect()`,
})

const restCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: WebServer + ArduinoJson ile /api/led', 'Arduino C++: /api/led with WebServer + ArduinoJson'),
  src: `#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include "secrets.h"                // ${k(l, 'WIFI_SSID, WIFI_PASS', 'WIFI_SSID, WIFI_PASS')}

WebServer server(80);
const int LED_PIN = 2;
bool ledOn = false;

void sendJson(int code, JsonDocument& doc) {
  String body;
  serializeJson(doc, body);
  server.send(code, "application/json", body);
}

void getLed() {
  JsonDocument doc;
  doc["on"] = ledOn;
  sendJson(200, doc);
}

void putLed() {
  JsonDocument in, out;
  DeserializationError e = deserializeJson(in, server.arg("plain"));
  if (e) { out["error"] = e.c_str(); return sendJson(400, out); }          // ${k(l, 'JSON bozuk', 'malformed JSON')}
  if (!in["on"].is<bool>()) { out["error"] = "on must be true or false"; return sendJson(422, out); }
  ledOn = in["on"];                 // ${k(l, 'mutlak değer: PUT idempotent kalır', 'absolute value: PUT stays idempotent')}
  digitalWrite(LED_PIN, ledOn);
  getLed();                         // ${k(l, 'yeni durumu döndür', 'return the new state')}
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  server.on("/api/led", HTTP_GET, getLed);
  server.on("/api/led", HTTP_PUT, putLed);
  server.onNotFound([] { server.send(404, "application/json", R"({"error":"not found"})"); });
  server.begin();
}

void loop() { server.handleClient(); }`,
})

const restPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython istemci: urequests ile GET ve PUT', 'MicroPython client: GET and PUT with urequests'),
  src: `import urequests as requests
import ujson
from secrets import TOKEN               # ${k(l, 'belirteç kodda değil', 'token is not in the code')}

BASE = 'http://sera.local/api'           # ${k(l, 'Wi-Fi bağlantısı önceki ünitedeki connect() ile', 'Wi-Fi via connect() from the previous unit')}
H = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN}

r = requests.get(BASE + '/sensor')
print(r.status_code, r.json())           # ${k(l, '200 {"temp": 22.4, "hum": 54.1}', '200 {"temp": 22.4, "hum": 54.1}')}
r.close()                                # ${k(l, 'soketi bırak: ESP32\'de sayısı sınırlı', 'free the socket: the ESP32 has only a few')}

r = requests.put(BASE + '/led', data=ujson.dumps({'on': True}), headers=H)
if r.status_code == 200:
    print('LED:', r.json()['on'])
elif r.status_code in (400, 422):
    print('bad request:', r.json()['error'])
elif r.status_code == 401:
    print('token missing or wrong')
r.close()`,
})

const mqttCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: PubSubClient ile yayımla ve abone ol', 'Arduino C++: publish and subscribe with PubSubClient'),
  src: `#include <WiFi.h>
#include <PubSubClient.h>
#include "secrets.h"                     // ${k(l, 'WIFI_SSID, WIFI_PASS, MQTT_HOST', 'WIFI_SSID, WIFI_PASS, MQTT_HOST')}

WiFiClient net;
PubSubClient mqtt(net);
const char* ID = "sera-01";              // ${k(l, 'broker\'da benzersiz olmalı', 'must be unique on the broker')}
uint32_t lastPub = 0, nextTry = 0;

void onMessage(char* topic, byte* payload, unsigned int len) {
  String msg((char*)payload, len);
  if (String(topic) == "sera/01/led/set") digitalWrite(2, msg == "1");
}

void mqttTask() {
  if (mqtt.connected()) { mqtt.loop(); return; }   // ${k(l, 'loop() gelen mesajları ve PING\'i işler', 'loop() handles incoming messages and PINGs')}
  if (millis() < nextTry) return;
  if (mqtt.connect(ID)) mqtt.subscribe("sera/01/+/set");
  else nextTry = millis() + 5000;                   // ${k(l, 'bloklamadan sonra yeniden dene', 'retry later without blocking')}
}

void setup() {
  pinMode(2, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  mqtt.setServer(MQTT_HOST, 1883);                  // ${k(l, '1883 açık metin; gerçek kurulumda 8883 + TLS', '1883 is plain text; use 8883 + TLS for real')}
  mqtt.setCallback(onMessage);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) return;
  mqttTask();
  if (mqtt.connected() && millis() - lastPub > 10000) {
    lastPub = millis();
    mqtt.publish("sera/01/sicaklik", String(temperatureRead(), 1).c_str());  // ${k(l, 'çip sıcaklığı; DHT22 sonraki ünitelerde', 'chip temperature; DHT22 in later units')}
  }
}`,
})

const mqttPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: umqtt.simple', 'MicroPython: umqtt.simple'),
  src: `from umqtt.simple import MQTTClient
from machine import Pin
import time, esp32
from secrets import MQTT_HOST

led = Pin(2, Pin.OUT)

def on_msg(topic, msg):                  # ${k(l, 'konu ve yük bytes olarak gelir', 'topic and payload arrive as bytes')}
    if topic == b'sera/01/led/set':
        led.value(msg == b'1')

c = MQTTClient('sera-01', MQTT_HOST, keepalive=30)
c.set_callback(on_msg)
c.connect()
c.subscribe(b'sera/01/+/set')            # ${k(l, '+ tek seviye: led/set, fan/set…', '+ is one level: led/set, fan/set...')}

last = 0
while True:
    c.check_msg()                        # ${k(l, 'bloklamaz; bekleyen mesaj varsa on_msg çağrılır', 'non-blocking; calls on_msg if a message is waiting')}
    if time.ticks_diff(time.ticks_ms(), last) > 10000:
        last = time.ticks_ms()
        t = (esp32.raw_temperature() - 32) / 1.8
        c.publish(b'sera/01/sicaklik', str(round(t, 1)))
    time.sleep_ms(50)`,
})

const lwtCpp = (l: Lang): CodeBlock => ({
  title: k(l, 'Arduino C++: son vasiyet, doğum mesajı ve keepalive', 'Arduino C++: last will, birth message and keepalive'),
  src: `#include <WiFi.h>
#include <PubSubClient.h>
#include "secrets.h"                     // ${k(l, 'MQTT_HOST, MQTT_USER, MQTT_PASS', 'MQTT_HOST, MQTT_USER, MQTT_PASS')}

WiFiClient net;
PubSubClient mqtt(net);
const char* STATUS = "sera/01/durum";

bool mqttConnect() {
  mqtt.setKeepAlive(30);                 // ${k(l, 'broker 45 s sessizlikten sonra ölü sayar', 'the broker declares us dead after 45 s of silence')}
  // ${k(l, 'id, kullanıcı, parola, vasiyet konusu, QoS, retain, vasiyet, cleanSession', 'id, user, password, will topic, QoS, retain, will, cleanSession')}
  bool ok = mqtt.connect("sera-01", MQTT_USER, MQTT_PASS, STATUS, 1, true, "offline", false);
  if (!ok) return false;
  mqtt.publish(STATUS, "online", true);  // ${k(l, 'doğum mesajı: kalıcı, vasiyetin tersi', 'birth message: retained, the opposite of the will')}
  mqtt.subscribe("sera/01/+/set", 1);    // ${k(l, 'PubSubClient: abonelik QoS 0/1, yayın yalnız QoS 0', 'PubSubClient: subscribe QoS 0/1, publish QoS 0 only')}
  return true;
}

void goToSleep() {
  mqtt.publish(STATUS, "sleeping", true);
  mqtt.disconnect();                     // ${k(l, 'DISCONNECT gönderildi: vasiyet yayımlanmaz', 'DISCONNECT sent: the will is not published')}
}

void setup() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  mqtt.setServer(MQTT_HOST, 1883);
  while (!mqttConnect()) delay(2000);
}

void loop() { mqtt.loop(); }`,
})

const lwtPy = (l: Lang): CodeBlock => ({
  title: k(l, 'MicroPython: QoS 1, kalıcı oturum ve vasiyet', 'MicroPython: QoS 1, persistent session and will'),
  src: `from umqtt.simple import MQTTClient
from secrets import MQTT_HOST, MQTT_USER, MQTT_PASS

STATUS = b'sera/01/durum'
c = MQTTClient('sera-01', MQTT_HOST, user=MQTT_USER, password=MQTT_PASS, keepalive=30)
c.set_last_will(STATUS, b'offline', retain=True, qos=1)   # ${k(l, 'CONNECT içinde gider', 'travels inside CONNECT')}
c.set_callback(lambda t, m: print(t, m))
c.connect(clean_session=False)           # ${k(l, 'kalıcı oturum: çevrimdışıyken QoS 1 mesajlar bekletilir', 'persistent session: QoS 1 messages wait while offline')}
c.publish(STATUS, b'online', retain=True, qos=1)          # ${k(l, 'doğum mesajı', 'birth message')}
c.subscribe(b'sera/01/+/set', qos=1)

# ${k(l, 'QoS 1 "en az bir kez" demektir: komut iki kez gelebilir.', 'QoS 1 means "at least once": a command may arrive twice.')}
# ${k(l, 'Bu yüzden komutlar mutlak değer taşır (1/0), "çevir" değil.', 'So commands carry an absolute value (1/0), not "toggle".')}
while True:
    c.wait_msg()`,
})

// --- Üniteler ----------------------------------------------------------------------------------------------------------------

export const UNITS_A: CourseUnit<IotSimId>[] = [
  {
    n: 1, sims: ['pinler'], parts: ['esp32-esp32-wroom-devkit', 'arduino-uno-atmega328p', 'led', 'ldr'], wokwi: true,
    related: [
      { href: '/laboratuvar', tr: 'Devre laboratuvarı: aynı LED ve LDR devresini Uno ile kur', en: 'Circuit lab: build the same LED and LDR circuit on the Uno' },
      { href: '/muhendislik/seviye/7', tr: 'Mühendislik yolu, 7. seviye: mikrodenetleyici kartları', en: 'Engineering path, level 7: microcontroller boards' },
      { href: '/muhendislik/robotik/hafta/1', tr: 'ESOF 323, 1. hafta: gömülü programlama', en: 'ESOF 323, week 1: embedded programming' },
    ],
    tr: {
      title: 'ESP32\'ye giriş: Uno\'dan bağlı karta',
      summary: 'Çift çekirdek, 3,3 V mantık, Wi-Fi ve BLE: ESP32\'yi Uno ile karşılaştır, pinlerinin kurallarını öğren, ilk kodu Arduino ve MicroPython ile yaz.',
      goals: ['ESP32 ile Arduino Uno\'yu işlemci, bellek, gerilim ve bağlantı açısından karşılaştırmak', 'Flash, yalnız-giriş, açılış (strapping) ve ADC2 pinlerinin kısıtlarını açıklamak', 'Bir projenin pin planını kısıtlara uyarak yapmak', 'Aynı devreyi Arduino çekirdeği ve MicroPython ile programlamak'],
      notes: `<p>Uno, bir ATmega328P etrafında kurulu basit ve sağlam bir karttır: 16 MHz, 2 KB RAM, 5 V mantık. Bir sensörü okumak ve bir motoru sürmek için yeterlidir ama tek başına internete çıkamaz. ESP32 ise Wi-Fi ve Bluetooth radyosunu aynı çipe koyar; Nesnelerin İnterneti (IoT) projelerinin en yaygın kalbi olmasının nedeni budur.</p>
<h3>Uno ile ESP32 yan yana</h3>
<ul><li><b>İşlemci</b>: Uno 8 bit, 16 MHz; ESP32 iki çekirdekli 32 bit Xtensa, 240 MHz'e kadar. Bir çekirdek Wi-Fi yığınına, öbürü senin koduna ayrılabilir.</li><li><b>Bellek</b>: Uno 2 KB RAM ve 32 KB flash; ESP32 yaklaşık 520 KB RAM ve kartta genellikle 4 MB flash.</li><li><b>Gerilim</b>: Uno 5 V; ESP32 3,3 V. ESP32 pinleri 5 V'a dayanıklı değildir: 5 V'luk bir sensör çıkışı seviye dönüştürücü ya da gerilim bölücü ister.</li><li><b>ADC</b>: Uno 10 bit (0..1023); ESP32 12 bit (0..4095), iki birim: ADC1 ve ADC2.</li><li><b>Bağlantı</b>: Uno'da yok; ESP32'de 2,4 GHz Wi-Fi ve Bluetooth (klasik ve BLE).</li></ul>
<div class="eq">Uno: V = 5 · ham / 1023 &nbsp;&nbsp; ESP32 (11 dB): V ≈ 3,1 · ham / 4095</div>
<h3>Pinler: her GPIO her işi yapmaz</h3>
<p>ESP32 DevKit üzerinde 30 ya da 38 bacak vardır ama hepsi serbest değildir. Pin planı yapmadan lehim yapmak, "kart açılmıyor" ya da "Wi-Fi açılınca sensör sıfır okuyor" gibi sinsi hatalara yol açar. Bu ünitenin simülasyonu bu kuralları bir <code>checkPin</code> fonksiyonuyla denetler.</p>
<ul><li><b>GPIO 6–11</b>: kartın flash belleğine bağlıdır. Dokunursan kod çalışmaz.</li><li><b>GPIO 34, 35, 36, 39</b>: yalnız giriştir ve iç pull-up/pull-down dirençleri yoktur. Düğme bağlayacaksan dış direnç gerekir.</li><li><b>Açılış pinleri 0, 2, 5, 12, 15</b>: açılışta düzeyleri önyükleme kipini seçer. GPIO 12 açılışta yüksekse flash gerilimi yanlış seçilir ve kart açılmaz.</li><li><b>ADC2</b> (GPIO 0, 2, 4, 12–15, 25–27): Wi-Fi sürücüsü bu birimi kullanır. Wi-Fi açıkken analog okuma için ADC1 pinlerini (32–39) seç.</li></ul>
<h3>Arduino çekirdeği mi, MicroPython mı?</h3>
<p>Espressif'in Arduino çekirdeği tanıdık <code>setup()</code> / <code>loop()</code> yapısını, <code>WiFi.h</code> ve binlerce kütüphaneyi getirir; derlenmiş C++ hızlıdır ve bellekte küçüktür. MicroPython ise karta bir Python yorumlayıcısı yükler: kodu derlemeden REPL'de satır satır denersin. Bu derste her konu iki dilde de yazılır; ürün kodu için genellikle C++, hızlı deneme için MicroPython seçilir.</p>
<p>Donanımın yoksa Wokwi'de yeni bir ESP32 projesi aç: kart, LED, LDR ve DHT22 sanal olarak bağlanır, Wi-Fi bile benzetilir.</p>`,
      code: [blinkCpp('tr'), blinkPy('tr')],
      lab: 'Pin planlayıcıda bir sera düğümü planla: LED, LDR (analog), DHT22 (veri), I²C OLED (SDA, SCL) ve bir düğme. Önce LDR\'yi GPIO 4\'e koy ve Wi-Fi\'yi aç: hangi uyarı çıktı? LDR\'yi GPIO 34\'e taşı. Düğmeyi GPIO 35\'e bağlayınca ne söylüyor, neden dış direnç gerekir? Bir LED\'i GPIO 12\'ye koyup açılış uyarısını oku. Sonra Wokwi\'de aynı devreyi kur ve iki kodu da çalıştır.',
      pitfalls: ['ESP32 pinine 5 V sensör çıkışı bağlamak: pin zarar görebilir, seviye dönüştürücü ya da bölücü kullan.', 'Wi-Fi açıkken ADC2 pinlerinden analog okumak: değer sabit kalır ya da hata döner.', 'GPIO 34–39\'a düğme bağlayıp iç pull-up beklemek: bu pinlerde yoktur, giriş havada kalır.', 'Flash pinlerine (6–11) ya da açılışta yüksek kalan bir devreyi GPIO 12\'ye bağlamak: kart açılmaz.', 'ESP32 ADC\'sini hassas ölçüm aleti sanmak: uçlarda doğrusal değildir, kalibrasyon gerekir.'],
      se: `<p>Pin planı, donanımın <b>arayüz sözleşmesidir</b>. Onu kodun içine dağıtma; tek bir başlık dosyasında topla.</p>
<ul><li><code>pins.h</code> içinde her pin bir sabit olsun ve yanında görevi yazsın. Kart değişince yalnız bu dosya değişir.</li><li>Planlayıcıdaki kurallar bir <b>statik denetleyicidir</b>: aynı denetimi derleme öncesi bir betikle (ya da <code>static_assert</code> ile) çalıştırabilirsin.</li><li>Uno ve ESP32 için aynı uygulama kodunu yazıp donanım katmanını ayırmak (HAL), ileride kart değiştirmeyi ucuzlatır.</li></ul>`,
      quiz: [
        { q: 'Wi-Fi açıkken bir LDR\'yi analog okumak için hangi pin uygundur?', options: ['GPIO 4 (ADC2)', 'GPIO 34 (ADC1)', 'GPIO 6', 'GPIO 12'], answer: 1, why: 'ADC2 Wi-Fi sürücüsüyle paylaşılır; GPIO 34 ADC1\'dedir ve yalnız giriş olarak analog okumaya uygundur. GPIO 6 flash pinidir.' },
        { q: '5 V ile çalışan bir sensörün dijital çıkışını ESP32\'ye bağlamak için ne yaparsın?', options: ['Doğrudan bağlarım, ESP32 5 V toleranslıdır', 'Uno\'nun 5 V pinini ESP32\'nin 3V3 pinine bağlarım', 'Seviye dönüştürücü ya da gerilim bölücü kullanırım', 'Pini OUTPUT yaparım'], answer: 2, why: 'ESP32 3,3 V mantıkla çalışır ve pinleri 5 V\'a dayanıklı değildir; sinyal 3,3 V\'a indirilmelidir.' },
        { q: 'Kart, GPIO 12\'ye bağlı bir devre yüzünden açılmıyor. En olası neden nedir?', options: ['GPIO 12 yalnız giriştir', 'GPIO 12 ADC1\'dedir', 'GPIO 12 flash veri pinidir', 'GPIO 12 açılışta flash gerilimini seçer; yüksek kalırsa yanlış gerilim seçilir'], answer: 3, why: 'GPIO 12 bir açılış (strapping) pinidir. Açılışta yüksekse flash 1,8 V sanılır ve önyükleme başarısız olur.' },
        { q: 'MicroPython\'un bu derste hızlı deneme için seçilmesinin nedeni nedir?', options: ['REPL\'de kodu derlemeden satır satır deneyebilmek', 'C++\'tan daha hızlı çalışması', 'Daha az bellek kullanması', 'Wi-Fi\'yi yalnız MicroPython\'un desteklemesi'], answer: 0, why: 'MicroPython yorumlanır: REPL\'de anında denersin. Derlenmiş C++ ise daha hızlı ve bellekte daha küçüktür.' },
      ],
    },
    en: {
      title: 'Getting started with the ESP32: from the Uno to a connected board',
      summary: 'Dual core, 3.3 V logic, Wi-Fi and BLE: compare the ESP32 with the Uno, learn the rules of its pins and write the first code in Arduino and MicroPython.',
      goals: ['Compare the ESP32 and the Arduino Uno by processor, memory, voltage and connectivity', 'Explain the limits of flash, input-only, boot (strapping) and ADC2 pins', 'Make a pin plan for a project that respects these limits', 'Program the same circuit with the Arduino core and with MicroPython'],
      notes: `<p>The Uno is a simple, robust board built around an ATmega328P: 16 MHz, 2 KB RAM, 5 V logic. It is enough to read a sensor and drive a motor but it cannot reach the internet on its own. The ESP32 puts a Wi-Fi and Bluetooth radio on the same chip; that is why it is the most common heart of Internet of Things (IoT) projects.</p>
<h3>The Uno and the ESP32 side by side</h3>
<ul><li><b>Processor</b>: the Uno is 8-bit, 16 MHz; the ESP32 is a dual-core 32-bit Xtensa at up to 240 MHz. One core can be left to the Wi-Fi stack, the other to your code.</li><li><b>Memory</b>: the Uno has 2 KB RAM and 32 KB flash; the ESP32 has about 520 KB RAM and usually 4 MB flash on the board.</li><li><b>Voltage</b>: the Uno is 5 V; the ESP32 is 3.3 V. ESP32 pins are not 5 V tolerant: a 5 V sensor output needs a level shifter or a voltage divider.</li><li><b>ADC</b>: the Uno is 10-bit (0..1023); the ESP32 is 12-bit (0..4095) with two units: ADC1 and ADC2.</li><li><b>Connectivity</b>: none on the Uno; 2.4 GHz Wi-Fi and Bluetooth (classic and BLE) on the ESP32.</li></ul>
<div class="eq">Uno: V = 5 · raw / 1023 &nbsp;&nbsp; ESP32 (11 dB): V ≈ 3.1 · raw / 4095</div>
<h3>Pins: not every GPIO does every job</h3>
<p>An ESP32 DevKit has 30 or 38 legs but not all of them are free. Soldering without a pin plan leads to sneaky bugs such as "the board does not boot" or "the sensor reads zero once Wi-Fi is on". This unit's simulation checks these rules with a <code>checkPin</code> function.</p>
<ul><li><b>GPIO 6 to 11</b>: wired to the board's flash memory. Touch them and the code stops running.</li><li><b>GPIO 34, 35, 36, 39</b>: input only, with no internal pull-up or pull-down resistors. A button needs an external resistor.</li><li><b>Boot pins 0, 2, 5, 12, 15</b>: their levels at boot select the boot mode. If GPIO 12 is high at boot the wrong flash voltage is chosen and the board does not start.</li><li><b>ADC2</b> (GPIO 0, 2, 4, 12 to 15, 25 to 27): the Wi-Fi driver uses this unit. For analog reads while Wi-Fi is on, choose ADC1 pins (32 to 39).</li></ul>
<h3>Arduino core or MicroPython?</h3>
<p>Espressif's Arduino core brings the familiar <code>setup()</code> / <code>loop()</code> structure, <code>WiFi.h</code> and thousands of libraries; compiled C++ is fast and small in memory. MicroPython loads a Python interpreter onto the board: you try code line by line in the REPL without compiling. In this course every topic is written in both; C++ is usually chosen for product code and MicroPython for quick experiments.</p>
<p>No hardware? Open a new ESP32 project in Wokwi: the board, LED, LDR and DHT22 are wired virtually, and even Wi-Fi is simulated.</p>`,
      code: [blinkCpp('en'), blinkPy('en')],
      lab: 'Plan a greenhouse node in the pin planner: LED, LDR (analog), DHT22 (data), I2C OLED (SDA, SCL) and a button. First put the LDR on GPIO 4 and turn Wi-Fi on: which warning appears? Move the LDR to GPIO 34. What does it say when the button goes on GPIO 35, and why is an external resistor needed? Put an LED on GPIO 12 and read the boot warning. Then build the same circuit in Wokwi and run both programs.',
      pitfalls: ['Wiring a 5 V sensor output to an ESP32 pin: the pin can be damaged, use a level shifter or a divider.', 'Reading analog values from ADC2 pins while Wi-Fi is on: the value sticks or an error is returned.', 'Wiring a button to GPIO 34 to 39 and expecting an internal pull-up: these pins have none and the input floats.', 'Using the flash pins (6 to 11) or a circuit that holds GPIO 12 high at boot: the board does not start.', 'Treating the ESP32 ADC as a precision instrument: it is not linear at the ends and needs calibration.'],
      se: `<p>The pin plan is the hardware's <b>interface contract</b>. Do not scatter it through the code; keep it in one header file.</p>
<ul><li>In <code>pins.h</code> each pin is a constant with its role next to it. When the board changes, only this file changes.</li><li>The planner rules are a <b>static checker</b>: you can run the same checks before compiling with a script (or with <code>static_assert</code>).</li><li>Writing the same application code for the Uno and the ESP32 and separating the hardware layer (HAL) makes changing boards cheap later.</li></ul>`,
      quiz: [
        { q: 'Which pin suits an analog LDR read while Wi-Fi is on?', options: ['GPIO 4 (ADC2)', 'GPIO 34 (ADC1)', 'GPIO 6', 'GPIO 12'], answer: 1, why: 'ADC2 is shared with the Wi-Fi driver; GPIO 34 is on ADC1 and, as an input-only pin, suits analog reads. GPIO 6 is a flash pin.' },
        { q: 'How do you connect the digital output of a 5 V sensor to an ESP32?', options: ['Directly, the ESP32 is 5 V tolerant', 'Connect the 5 V pin of the Uno to the 3V3 pin of the ESP32', 'Use a level shifter or a voltage divider', 'Set the pin to OUTPUT'], answer: 2, why: 'The ESP32 uses 3.3 V logic and its pins are not 5 V tolerant; the signal must be brought down to 3.3 V.' },
        { q: 'The board does not boot because of a circuit on GPIO 12. What is the most likely cause?', options: ['GPIO 12 is input only', 'GPIO 12 is on ADC1', 'GPIO 12 is a flash data pin', 'GPIO 12 selects the flash voltage at boot; if it is held high the wrong voltage is chosen'], answer: 3, why: 'GPIO 12 is a strapping pin. If it is high at boot the flash is assumed to be 1.8 V and booting fails.' },
        { q: 'Why is MicroPython chosen for quick experiments in this course?', options: ['You can try code line by line in the REPL without compiling', 'It runs faster than C++', 'It uses less memory', 'Only MicroPython supports Wi-Fi'], answer: 0, why: 'MicroPython is interpreted: you try things instantly in the REPL. Compiled C++ is faster and smaller in memory.' },
      ],
    },
  },
  {
    n: 2, sims: ['wifi'], parts: ['esp32-esp32-wroom-devkit'], wokwi: true,
    related: [
      { href: '/muhendislik/robotik/hafta/1', tr: 'ESOF 323, 1. hafta: bloklamayan döngü ve durum makinesi', en: 'ESOF 323, week 1: non-blocking loop and state machine' },
    ],
    tr: {
      title: 'Wi-Fi: bağlanmak, kopmak, yeniden bağlanmak',
      summary: 'İstemci (STA) ve erişim noktası (AP) kipleri, WiFi.status() durumları, olaylar, RSSI ve üstel geri çekilmeyle bloklamayan yeniden bağlanma.',
      goals: ['STA, AP ve AP+STA kiplerini ve kullanım yerlerini ayırt etmek', 'WiFi.status() durum kodlarını okuyup hatanın nedenini bulmak', 'Bloklamayan ve üstel geri çekilmeli bir yeniden bağlanma döngüsü yazmak', 'RSSI değerine göre bağlantının sağlığını yorumlamak'],
      notes: `<p>Bir IoT cihazı aylarca açık kalır. Bu sürede modem yeniden başlar, elektrik kesilir, komşunun ağı kanalı doldurur. İyi bir cihaz Wi-Fi'nin kopacağını <b>varsayar</b> ve kendi kendine toparlanır; kötü bir cihaz <code>while</code> döngüsünde sonsuza kadar bekler.</p>
<h3>Kipler</h3>
<ul><li><b>STA (istemci)</b>: cihaz evdeki modeme bağlanır. Sensör düğümlerinin olağan kipi.</li><li><b>AP (erişim noktası)</b>: cihaz kendi ağını yayar. İlk kurulumda telefonla bağlanıp Wi-Fi parolasını girdiğin sayfa böyle çalışır.</li><li><b>AP+STA</b>: ikisi birlikte; kurulum sırasında hem sayfayı sunar hem ağı dener.</li></ul>
<h3>Durumlar</h3>
<p><code>WiFi.status()</code> bir durum kodu döndürür: <code>WL_CONNECTED</code> bağlı ve IP almış, <code>WL_IDLE_STATUS</code> deneme sürüyor, <code>WL_DISCONNECTED</code> bağlı değil, <code>WL_NO_SSID_AVAIL</code> ağ adı görünmüyor, <code>WL_CONNECT_FAILED</code> parola ya da kimlik doğrulama hatası. Durum kodunu günlüğe yazmak, "Wi-Fi çalışmıyor" şikâyetini "SSID görünmüyor" ya da "parola yanlış" tanısına çevirir. Arduino çekirdeği ayrıca <code>WiFi.onEvent()</code> ile bağlanma, IP alma ve kopma olaylarını bildirir.</p>
<h3>Yeniden bağlanma: sabit bekleme mi, geri çekilme mi?</h3>
<p>Elektrik kesintisinden sonra binadaki yüz cihaz aynı saniyede açılır. Hepsi her saniye yeniden denerse modem ve broker gereksiz yük altında kalır. Üstel geri çekilmede her başarısız denemeden sonra bekleme iki katına çıkar ve bir üst sınırda durur; küçük bir rastgele pay (jitter) cihazların aynı anda denemesini önler.</p>
<div class="eq">bekleme<sub>k</sub> = min(üst sınır, taban · 2<sup>k</sup>)</div>
<p>Bekleme <code>delay()</code> ile değil, <code>millis()</code> karşılaştırmasıyla yapılır: döngü dönmeye devam eder, sensör okunur, yerel röle kuralları çalışır. Wi-Fi yokken de cihaz işini yapmalıdır.</p>
<h3>RSSI</h3>
<p>Alınan sinyal gücü dBm cinsindendir ve negatiftir. Kabaca: -50 çok iyi, -67 akış için yeterli, -75 sensör verisi için sınırda, -85 ve altı sık kopma demektir. Anteni metal kutunun içine gömmek ya da kartı toprağa yakın koymak RSSI'yi 10–20 dB düşürebilir.</p>`,
      code: [wifiCpp('tr'), wifiPy('tr')],
      lab: 'Simülasyonda erişim noktasını 20. ile 60. saniye arasında kapat. Önce sabit 1 saniyelik beklemeyi seç: kaç deneme yapıldı, kopuk kalınan süre ne kadar? Sonra üstel geri çekilmeye geç (taban 1 s, üst sınır 30 s): deneme sayısı nasıl değişti, AP geri gelince toparlanma süresi ne oldu? Sinyali -88 dBm\'e indir ve kopma sayısını izle. Son olarak Wokwi\'de SSID olarak "Wokwi-GUEST" ile iki kodu çalıştır ve seri monitördeki durum kodlarını oku.',
      pitfalls: ['setup() içinde while (WiFi.status() != WL_CONNECTED) ile sonsuza kadar beklemek: ağ gelmezse cihaz hiçbir iş yapmaz.', 'Tüm cihazlara aynı sabit yeniden deneme süresi vermek: kesintiden sonra hepsi aynı anda dener.', 'Wi-Fi parolasını kaynak koda yazıp depoya göndermek: secrets.h dosyası .gitignore\'a girmeli.', 'Yalnız "bağlı mı" diye bakıp durum kodunu günlüğe yazmamak: sahada hatanın nedeni bulunamaz.', 'ESP32\'nin 5 GHz ağa bağlanabileceğini sanmak: yalnız 2,4 GHz destekler.'],
      se: `<p>Wi-Fi bağlantısı bir <b>durum makinesidir</b>: bağlanıyor, bağlı, bekliyor, AP yok. Onu açıkça modellemek test edilebilir yapar.</p>
<ul><li>Durum geçişlerini saf bir fonksiyona koy: girdi şimdiki durum, zaman ve olay; çıktı yeni durum ve bir sonraki deneme zamanı. Simülasyon tam olarak budur.</li><li>Zamanı dışarıdan ver (<code>millis()</code> yerine parametre): birim testinde 10 dakikalık kesintiyi milisaniyede benzetirsin.</li><li>Gözlemlenebilirlik: deneme sayısı, son durum kodu ve RSSI periyodik olarak yayımlansın; filo panosunda zayıf cihazlar görünür.</li></ul>`,
      quiz: [
        { q: 'Taban 1 s, üst sınır 30 s olan üstel geri çekilmede 6. başarısız denemeden sonra (k = 5) bekleme kaç saniyedir (sarsıntısız)?', options: ['16 s', '32 s', '30 s', '60 s'], answer: 2, why: '1 · 2⁵ = 32 s olur ama üst sınır 30 s\'dir; bekleme 30 s\'de sabitlenir.' },
        { q: 'Üstel geri çekilme ve sarsıntının asıl amacı nedir?', options: ['Kesintiden sonra çok sayıda cihazın modemi ve broker\'ı aynı anda yüklemesini önlemek', 'Bağlantıyı daha hızlı kurmak', 'Wi-Fi parolasını gizlemek', 'RSSI değerini yükseltmek'], answer: 0, why: 'Herkes her saniye denerse sunucu tarafı boğulur. Artan bekleme ve rastgele pay denemeleri zamana yayar.' },
        { q: 'Seri monitörde WL_NO_SSID_AVAIL görüyorsun. Bu ne demektir?', options: ['Parola yanlış', 'Ağ adı (SSID) görünmüyor', 'IP adresi alındı', 'Cihaz AP kipinde'], answer: 1, why: 'Cihaz taramada bu adı bulamadı: yanlış SSID, kapalı modem, menzil dışı ya da 5 GHz ağ olabilir.' },
        { q: 'RSSI -88 dBm ölçülüyor. Bu ne anlama gelir?', options: ['Mükemmel sinyal', 'Video akışı için yeterli', 'Ölçüm hatası, RSSI pozitif olmalı', 'Zayıf sinyal; kopmalar ve yeniden denemeler beklenir'], answer: 3, why: 'RSSI negatiftir; -85 dBm altı zayıftır. Anteni konumlandırmak ya da erişim noktasını yaklaştırmak gerekir.' },
      ],
    },
    en: {
      title: 'Wi-Fi: connecting, dropping, reconnecting',
      summary: 'Station (STA) and access point (AP) modes, WiFi.status() states, events, RSSI and non-blocking reconnecting with exponential backoff.',
      goals: ['Tell apart STA, AP and AP+STA modes and where each is used', 'Read WiFi.status() codes and find the cause of a failure', 'Write a non-blocking reconnect loop with exponential backoff', 'Judge the health of a link from its RSSI'],
      notes: `<p>An IoT device stays on for months. In that time the router reboots, the power fails, the neighbour's network fills the channel. A good device <b>assumes</b> Wi-Fi will drop and recovers on its own; a bad device waits forever in a <code>while</code> loop.</p>
<h3>Modes</h3>
<ul><li><b>STA (station)</b>: the device joins the router at home. The usual mode for sensor nodes.</li><li><b>AP (access point)</b>: the device broadcasts its own network. The page you join with your phone during first setup to enter the Wi-Fi password works like this.</li><li><b>AP+STA</b>: both at once; during setup it serves the page and tries the network.</li></ul>
<h3>States</h3>
<p><code>WiFi.status()</code> returns a status code: <code>WL_CONNECTED</code> connected with an IP, <code>WL_IDLE_STATUS</code> an attempt is in progress, <code>WL_DISCONNECTED</code> not connected, <code>WL_NO_SSID_AVAIL</code> the network name is not visible, <code>WL_CONNECT_FAILED</code> password or authentication error. Logging the status code turns the complaint "Wi-Fi does not work" into the diagnosis "SSID not visible" or "wrong password". The Arduino core also reports connect, got-IP and disconnect events through <code>WiFi.onEvent()</code>.</p>
<h3>Reconnecting: fixed delay or backoff?</h3>
<p>After a power cut a hundred devices in a building start in the same second. If all of them retry every second, the router and the broker carry pointless load. With exponential backoff the wait doubles after each failed attempt and stops at a cap; a small random share (jitter) keeps devices from retrying together.</p>
<div class="eq">wait<sub>k</sub> = min(cap, base · 2<sup>k</sup>)</div>
<p>The wait is done with a <code>millis()</code> comparison, not with <code>delay()</code>: the loop keeps turning, sensors are read and local relay rules run. The device must do its job without Wi-Fi too.</p>
<h3>RSSI</h3>
<p>Received signal strength is in dBm and negative. Roughly: -50 is very good, -67 is enough for streaming, -75 is borderline for sensor data, -85 and below means frequent drops. Burying the antenna inside a metal box or placing the board close to the ground can cost 10 to 20 dB of RSSI.</p>`,
      code: [wifiCpp('en'), wifiPy('en')],
      lab: 'In the simulation turn the access point off between second 20 and 60. First choose a fixed 1 second delay: how many attempts were made and how long was the device offline? Then switch to exponential backoff (base 1 s, cap 30 s): how did the attempt count change and what was the recovery time once the AP came back? Lower the signal to -88 dBm and watch the drop count. Finally run both programs in Wokwi with the SSID "Wokwi-GUEST" and read the status codes in the serial monitor.',
      pitfalls: ['Waiting forever in setup() with while (WiFi.status() != WL_CONNECTED): if the network never comes, the device does nothing.', 'Giving every device the same fixed retry delay: after an outage they all retry at once.', 'Writing the Wi-Fi password in the source and pushing it to the repository: secrets.h belongs in .gitignore.', 'Only checking "connected or not" without logging the status code: the cause cannot be found in the field.', 'Assuming the ESP32 can join a 5 GHz network: it supports 2.4 GHz only.'],
      se: `<p>A Wi-Fi connection is a <b>state machine</b>: connecting, connected, waiting, no AP. Modelling it explicitly makes it testable.</p>
<ul><li>Put the transitions in a pure function: input the current state, the time and an event; output the new state and the next attempt time. The simulation is exactly that.</li><li>Inject the time (a parameter instead of <code>millis()</code>): in a unit test you simulate a 10 minute outage in milliseconds.</li><li>Observability: publish the attempt count, the last status code and the RSSI periodically; weak devices show up on the fleet dashboard.</li></ul>`,
      quiz: [
        { q: 'With exponential backoff, base 1 s and cap 30 s, what is the wait after the 6th failed attempt (k = 5), without jitter?', options: ['16 s', '32 s', '30 s', '60 s'], answer: 2, why: '1 * 2^5 = 32 s, but the cap is 30 s; the wait is held at 30 s.' },
        { q: 'What is the main purpose of exponential backoff with jitter?', options: ['To stop many devices from loading the router and the broker at the same moment after an outage', 'To connect faster', 'To hide the Wi-Fi password', 'To raise the RSSI'], answer: 0, why: 'If everyone retries every second the server side is flooded. Growing waits and a random share spread the attempts over time.' },
        { q: 'The serial monitor shows WL_NO_SSID_AVAIL. What does it mean?', options: ['Wrong password', 'The network name (SSID) is not visible', 'An IP address was obtained', 'The device is in AP mode'], answer: 1, why: 'The device did not find that name in its scan: wrong SSID, router off, out of range or a 5 GHz network.' },
        { q: 'The RSSI reads -88 dBm. What does that mean?', options: ['Excellent signal', 'Enough for video streaming', 'A measurement error, RSSI must be positive', 'Weak signal; expect drops and retries'], answer: 3, why: 'RSSI is negative; below -85 dBm is weak. Reposition the antenna or bring the access point closer.' },
      ],
    },
  },
  {
    n: 3, sims: ['rest'], parts: ['esp32-esp32-wroom-devkit', 'dht22', 'led'], wokwi: true,
    related: [
      { href: '/laboratuvar?parca=dht22', tr: 'Laboratuvarda DHT22: sıcaklık ve nem okuma', en: 'DHT22 in the lab: reading temperature and humidity' },
    ],
    tr: {
      title: 'HTTP, REST ve JSON: ESP32 bir web sunucusu',
      summary: 'Yollar, yöntemler ve durum kodlarıyla ESP32 üzerinde küçük bir REST API: JSON gövde doğrulama, idempotentlik, belirteç ve istemci tarafı.',
      goals: ['Bir HTTP isteğinin ve yanıtının parçalarını (yöntem, yol, başlık, gövde, durum kodu) okumak', 'GET, POST, PUT ve DELETE yöntemlerini idempotentlik açısından karşılaştırmak', 'Doğru durum kodunu seçmek: 200, 201, 204, 400, 401, 404, 405, 422', 'ESP32\'de ArduinoJson ile JSON üreten ve doğrulayan bir uç nokta yazmak'],
      notes: `<p>HTTP, tarayıcının web sayfasını çektiği protokoldür; ESP32 üzerinde de aynı protokolle küçük bir sunucu çalıştırabilirsin. İstemci (telefon, tarayıcı, başka bir cihaz) bir istek gönderir, sunucu bir yanıt döndürür. Bağlantı istek bitince kapanabilir: HTTP <b>istek-yanıt</b> modelidir, sunucu kendiliğinden konuşmaz.</p>
<h3>Bir isteğin anatomisi</h3>
<ul><li><b>Yöntem ve yol</b>: <code>PUT /api/led</code>. Yol bir kaynağı (LED), yöntem o kaynağa ne yapılacağını söyler.</li><li><b>Başlıklar</b>: <code>Content-Type: application/json</code>, <code>Authorization: Bearer …</code> gibi anahtar-değer satırları.</li><li><b>Gövde</b>: JSON metni, örneğin <code>{"on": true}</code>.</li><li><b>Durum kodu</b>: yanıtın ilk satırı. 2xx başarı, 4xx istemci hatası, 5xx sunucu hatası.</li></ul>
<h3>REST: kaynaklar ve yöntemler</h3>
<p>REST bir kuraldan çok bir üsluptur: her şey bir kaynaktır, yöntemler standarttır. <code>GET</code> okur ve hiçbir şeyi değiştirmez. <code>PUT</code> kaynağı verilen değere ayarlar; iki kez göndermek bir kez göndermekle aynı sonucu verir, yani <b>idempotenttir</b>. <code>POST</code> yeni bir kaynak oluşturur; iki kez göndermek iki zamanlama yaratır. <code>DELETE</code> siler ve o da idempotenttir. Ağ kötüyken istemci isteği yeniden gönderebileceği için bu ayrım önemlidir.</p>
<div class="eq">idempotent: f(f(x)) = f(x) &nbsp;&nbsp; GET, PUT, DELETE evet; POST hayır</div>
<h3>Durum kodları</h3>
<p>Bu ünitenin sunucusu şunları döndürür: <code>200 OK</code> başarılı okuma ya da güncelleme, <code>201 Created</code> ve <code>Location</code> başlığı yeni zamanlama, <code>204 No Content</code> başarılı silme, <code>400 Bad Request</code> bozuk JSON, <code>401 Unauthorized</code> belirteç yok ya da yanlış, <code>404 Not Found</code> böyle bir yol ya da kayıt yok, <code>405 Method Not Allowed</code> ve <code>Allow</code> başlığı yöntem desteklenmiyor, <code>422 Unprocessable Entity</code> JSON geçerli ama alanlar anlamsız. Doğru kod, istemcinin hatayı otomatik olarak ayırt etmesini sağlar.</p>
<h3>JSON ve bellek</h3>
<p>ArduinoJson ile <code>JsonDocument</code> oluşturur, <code>serializeJson</code> ile metne çevirirsin. Gelen gövdeyi <code>deserializeJson</code> ile ayrıştırırken dönen hatayı mutlaka denetle ve alan türünü (<code>is&lt;bool&gt;()</code>) doğrula: cihazına gelen her bayt güvenilmezdir.</p>`,
      code: [restCpp('tr'), restPy('tr')],
      lab: 'REST oyun alanında önce GET /api/sensor gönder ve ham yanıtı oku. PUT /api/led ile {"on": true} gönder; sonra aynı isteği ikinci kez gönder: durum değişti mi? Gövdeyi {"on": "evet"} yap: hangi kod döndü? PUT /api/status dene ve Allow başlığına bak. POST /api/schedules ile iki kez {"at":"07:30","on":true} gönder: kaç kayıt oluştu, Location başlığı ne? Belirteç zorunluluğunu açıp belirteçsiz PUT gönder. Ardından Wokwi\'de WebServer kodunu çalıştır.',
      pitfalls: ['Her hataya 200 dönüp gövdeye "error" yazmak: istemci başarı ile başarısızlığı durum kodundan ayıramaz.', 'Durumu değiştiren işlemi GET ile yapmak (GET /led/toggle): tarayıcı önbelleği ya da bir tarayıcı eklentisi LED\'i kendiliğinden çevirebilir.', 'deserializeJson hatasını denetlemeden alanları okumak: bozuk gövde sessizce yanlış değer üretir.', 'urequests yanıtını kapatmamak (r.close()): birkaç istekten sonra soketler biter.', 'Belirteci URL\'ye koymak (?token=...): günlüklerde ve tarayıcı geçmişinde açıkta kalır, Authorization başlığı kullan.'],
      se: `<p>API bir <b>sözleşmedir</b>: istemci ve sunucu ayrı ayrı geliştirilir, sözleşmede buluşur.</p>
<ul><li>Sözleşmeyi yaz: yollar, yöntemler, gövde şeması ve hata kodları (OpenAPI dosyası ya da tek sayfalık bir tablo).</li><li><b>Sözleşme testleri</b>: her yol için "geçerli istek 2xx, bozuk JSON 400, eksik alan 422, yanlış yöntem 405" sınamalarını otomatikleştir. Simülasyonun <code>handle</code> fonksiyonu saf olduğu için bu testler tarayıcısız çalışır.</li><li>Sürümleme: alan eklemek geriye uyumludur, alan silmek değildir; kırıcı değişiklikte <code>/api/v2</code> aç.</li></ul>`,
      quiz: [
        { q: 'POST /api/schedules başarıyla yeni bir zamanlama oluşturdu. En uygun durum kodu hangisidir?', options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'], answer: 1, why: 'Yeni kaynak oluştu: 201 ve yeni kaydın adresini gösteren Location başlığı uygundur.' },
        { q: 'Sunucu /api/status için yalnız GET destekliyor. PUT /api/status gelince ne döndürmeli?', options: ['404 Not Found', '400 Bad Request', '401 Unauthorized', '405 Method Not Allowed ve Allow: GET başlığı'], answer: 3, why: 'Yol var ama yöntem desteklenmiyor: 405 ve izinli yöntemleri listeleyen Allow başlığı.' },
        { q: 'PUT /api/led gövdesi {"on": "evet"}. JSON geçerli ama alan türü yanlış. Hangi kod?', options: ['200 OK', '400 Bad Request', '422 Unprocessable Entity', '500 Internal Server Error'], answer: 2, why: 'JSON ayrıştırıldı (400 değil) ama "on" bir boolean değil: anlamsal doğrulama hatası, 422.' },
        { q: 'Hangi yöntem idempotent değildir?', options: ['POST', 'PUT', 'DELETE', 'GET'], answer: 0, why: 'Aynı POST\'u iki kez göndermek iki kaynak yaratır. PUT aynı değeri yazar, DELETE zaten silineni silmez, GET bir şey değiştirmez.' },
      ],
    },
    en: {
      title: 'HTTP, REST and JSON: the ESP32 as a web server',
      summary: 'A small REST API on the ESP32 with routes, methods and status codes: JSON body validation, idempotency, a token and the client side.',
      goals: ['Read the parts of an HTTP request and response (method, path, header, body, status code)', 'Compare GET, POST, PUT and DELETE by idempotency', 'Choose the right status code: 200, 201, 204, 400, 401, 404, 405, 422', 'Write an endpoint on the ESP32 that produces and validates JSON with ArduinoJson'],
      notes: `<p>HTTP is the protocol your browser uses to fetch a web page; you can run a small server on the ESP32 with the same protocol. A client (phone, browser, another device) sends a request and the server returns a response. The connection may close once the request is done: HTTP is a <b>request-response</b> model, the server never speaks first.</p>
<h3>Anatomy of a request</h3>
<ul><li><b>Method and path</b>: <code>PUT /api/led</code>. The path names a resource (the LED), the method says what to do with it.</li><li><b>Headers</b>: key-value lines such as <code>Content-Type: application/json</code> and <code>Authorization: Bearer ...</code>.</li><li><b>Body</b>: JSON text, for example <code>{"on": true}</code>.</li><li><b>Status code</b>: the first line of the response. 2xx success, 4xx client error, 5xx server error.</li></ul>
<h3>REST: resources and methods</h3>
<p>REST is a style more than a rule: everything is a resource and the methods are standard. <code>GET</code> reads and changes nothing. <code>PUT</code> sets the resource to the given value; sending it twice has the same result as sending it once, so it is <b>idempotent</b>. <code>POST</code> creates a new resource; sending it twice creates two schedules. <code>DELETE</code> removes and is idempotent too. This distinction matters because a client may resend a request when the network is bad.</p>
<div class="eq">idempotent: f(f(x)) = f(x) &nbsp;&nbsp; GET, PUT, DELETE yes; POST no</div>
<h3>Status codes</h3>
<p>This unit's server returns: <code>200 OK</code> a successful read or update, <code>201 Created</code> with a <code>Location</code> header for a new schedule, <code>204 No Content</code> a successful delete, <code>400 Bad Request</code> malformed JSON, <code>401 Unauthorized</code> missing or wrong token, <code>404 Not Found</code> no such path or record, <code>405 Method Not Allowed</code> with an <code>Allow</code> header when the method is not supported, <code>422 Unprocessable Entity</code> valid JSON with meaningless fields. The right code lets the client tell errors apart automatically.</p>
<h3>JSON and memory</h3>
<p>With ArduinoJson you create a <code>JsonDocument</code> and turn it into text with <code>serializeJson</code>. When parsing an incoming body with <code>deserializeJson</code>, always check the returned error and validate the field type (<code>is&lt;bool&gt;()</code>): every byte arriving at your device is untrusted.</p>`,
      code: [restCpp('en'), restPy('en')],
      lab: 'In the REST playground first send GET /api/sensor and read the raw response. Send {"on": true} with PUT /api/led; then send the same request a second time: did the state change? Make the body {"on": "yes"}: which code came back? Try PUT /api/status and look at the Allow header. Send {"at":"07:30","on":true} twice with POST /api/schedules: how many records were created and what is the Location header? Turn on the token requirement and send a PUT without a token. Then run the WebServer code in Wokwi.',
      pitfalls: ['Returning 200 for every error and writing "error" in the body: the client cannot tell success from failure by the status code.', 'Changing state with GET (GET /led/toggle): a browser cache or a browser extension may toggle the LED on its own.', 'Reading fields without checking the deserializeJson error: a broken body silently produces wrong values.', 'Not closing the urequests response (r.close()): sockets run out after a few requests.', 'Putting the token in the URL (?token=...): it is exposed in logs and browser history, use the Authorization header.'],
      se: `<p>An API is a <b>contract</b>: the client and the server are developed separately and meet at the contract.</p>
<ul><li>Write the contract down: paths, methods, body schema and error codes (an OpenAPI file or a one-page table).</li><li><b>Contract tests</b>: automate "valid request 2xx, broken JSON 400, missing field 422, wrong method 405" for every path. Because the simulation's <code>handle</code> function is pure, these tests run without a browser.</li><li>Versioning: adding a field is backward compatible, removing one is not; on a breaking change open <code>/api/v2</code>.</li></ul>`,
      quiz: [
        { q: 'POST /api/schedules successfully created a new schedule. Which status code fits best?', options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'], answer: 1, why: 'A new resource was created: 201 with a Location header pointing to the new record.' },
        { q: 'The server supports only GET for /api/status. What should it return for PUT /api/status?', options: ['404 Not Found', '400 Bad Request', '401 Unauthorized', '405 Method Not Allowed with an Allow: GET header'], answer: 3, why: 'The path exists but the method is not supported: 405 and an Allow header listing the permitted methods.' },
        { q: 'The PUT /api/led body is {"on": "yes"}. The JSON is valid but the field type is wrong. Which code?', options: ['200 OK', '400 Bad Request', '422 Unprocessable Entity', '500 Internal Server Error'], answer: 2, why: 'The JSON parsed (so not 400) but "on" is not a boolean: a semantic validation error, 422.' },
        { q: 'Which method is not idempotent?', options: ['POST', 'PUT', 'DELETE', 'GET'], answer: 0, why: 'Sending the same POST twice creates two resources. PUT writes the same value, DELETE does not delete what is already gone, GET changes nothing.' },
      ],
    },
  },
  {
    n: 4, sims: ['broker'], parts: ['esp32-esp32-wroom-devkit', 'dht22'], wokwi: true,
    related: [
      { href: '/muhendislik/sensor-ml', tr: 'Sensör verisinden ML tahmini: MQTT ile toplanan veriyi modelle', en: 'ML forecasting from sensor data: model the data collected over MQTT' },
    ],
    tr: {
      title: 'MQTT temelleri: broker, konular ve jokerler',
      summary: 'Yayımla-abone ol modeli, broker, istemci kimliği, konu tasarımı, + ve # jokerleri, $SYS ve PubSubClient ile umqtt.simple.',
      goals: ['Yayımla-abone ol modelini istek-yanıt modeliyle karşılaştırmak', 'Bir cihaz filosu için tutarlı bir konu ağacı tasarlamak', '+ ve # jokerlerinin hangi konularla eşleştiğini önceden söylemek', 'ESP32\'de MQTT ile yayımlayan ve komut dinleyen bir istemci yazmak'],
      notes: `<p>HTTP'de istemci sunucuya sorar. Peki bir sensör yüz pano ekranına veri göndermek isterse ya da telefon, ağın arkasındaki bir röleye komut vermek isterse? MQTT bunun için tasarlanmış hafif bir protokoldür. Ortada bir <b>broker</b> vardır; cihazlar birbirini tanımaz, yalnız broker'a bağlanır. Yayımlayan bir <b>konuya</b> mesaj gönderir, o konuya abone olan herkes mesajı alır.</p>
<h3>Parçalar</h3>
<ul><li><b>Broker</b>: Mosquitto, EMQX, HiveMQ gibi bir sunucu. Varsayılan port 1883 (açık metin), TLS ile 8883.</li><li><b>İstemci kimliği</b>: her bağlantının broker'daki adı. Benzersiz olmalı: aynı kimlikle ikinci bir istemci bağlanırsa broker eskisini düşürür.</li><li><b>Konu</b>: eğik çizgiyle ayrılmış seviyeler, örneğin <code>sera/01/sicaklik</code>. Önceden tanımlanmaz; ilk yayında var olur.</li><li><b>Yük</b>: bayt dizisi. Metin, JSON ya da ikili olabilir; broker içine bakmaz.</li></ul>
<h3>Konu tasarımı</h3>
<p>Konu ağacı, filonun adres defteridir. Genelden özele git: <code>yer/cihaz/ölçüm</code>. Komutları ayrı bir dalda tut (<code>sera/01/led/set</code>), durumu ayrı dalda (<code>sera/01/led</code>). Küçük harf, boşluksuz ve başında eğik çizgi olmayan adlar kullan: <code>/sera</code> ile <code>sera</code> farklı konulardır.</p>
<h3>Jokerler</h3>
<p>Abonelik süzgeci joker içerebilir, yayın konusu içeremez.</p>
<div class="eq">sera/+/sicaklik → sera/01/sicaklik ✓ &nbsp; sera/01/kat/sicaklik ✗ &nbsp;&nbsp; sera/# → sera ✓, sera/01/nem ✓</div>
<ul><li><code>+</code> tam olarak bir seviyenin yerini tutar ve seviyenin tamamı olmalıdır: <code>sera/0+</code> geçersizdir.</li><li><code>#</code> kalan tüm seviyeleri kapsar, yalnız sonda ve tek başına yazılır; üst seviyenin kendisiyle de eşleşir.</li><li><code>$</code> ile başlayan konular (<code>$SYS/broker/uptime</code>) baştaki bir jokerle eşleşmez; broker istatistiklerini bilerek istemelisin.</li></ul>
<h3>Açık broker'lar</h3>
<p><code>test.mosquitto.org</code> ve <code>broker.hivemq.com</code> denemek için ücretsizdir ama <b>herkese açıktır</b>: konunu bilen herkes okur ve yazar. Ders denemeleri için benzersiz bir önek seç, gerçek veri ve komut için kendi broker'ını kimlik doğrulama ve TLS ile kur (9. ünite).</p>`,
      code: [mqttCpp('tr'), mqttPy('tr')],
      lab: 'Simülasyonda panoyu sera/+/sicaklik konusuna abone et ve üç cihazın yayınlarını izle; sonra süzgeci sera/# yap: neler eklendi? sera/01/kat/sicaklik konusuna elle yayın yap: + süzgeci yakaladı mı? Geçersiz bir süzgeç dene (sera/#/nem). Bir cihazın kablosunu çek ve son vasiyetin hangi abonelere gittiğini gör. Ardından Wokwi\'de PubSubClient kodunu test.mosquitto.org ile çalıştır, kendi benzersiz önekini kullan ve bir MQTT istemcisinden sera/01/led/set konusuna 1 gönder.',
      pitfalls: ['İki cihaza aynı istemci kimliğini vermek: biri bağlanınca öbürü düşer, sonsuz bir bağlan-düş döngüsü oluşur.', 'Konunun başına eğik çizgi koymak (/sera/01): sera/01 ile aynı konu değildir, abonelik eşleşmez.', 'Üretimde # ile her şeye abone olmak: istemci gereksiz trafikle boğulur ve başka cihazların verisini görür.', 'Açık bir test broker\'ına gerçek veri ya da komut göndermek: herkes okuyup yazabilir.', 'mqtt.loop() çağırmayı unutmak: gelen mesajlar işlenmez ve keepalive PING\'i gitmez, bağlantı kopar.'],
      se: `<p>Yayımla-abone ol modeli <b>gevşek bağlılık</b> sağlar: sensör, verisini kimin kullandığını bilmez.</p>
<ul><li>Konu ağacını bir <b>arayüz belgesi</b> gibi yönet: her konunun yükü, birimi, sıklığı ve sahibi yazılı olsun. Konu adını değiştirmek, bir API\'den alan silmek kadar kırıcıdır.</li><li>Yeni bir tüketici (veri kaydedici, ML modeli, pano) eklemek cihaz yazılımına dokunmadan olur: yalnız abone olur.</li><li>Simülasyondaki <code>topicMatches</code> saf bir fonksiyondur; joker kurallarını tablo tabanlı testlerle sınamak kolaydır.</li></ul>`,
      quiz: [
        { q: 'sera/+/sicaklik süzgeci hangi konuyla eşleşir?', options: ['sera/02/sicaklik', 'sera/02/kat1/sicaklik', 'sera/sicaklik', 'depo/02/sicaklik'], answer: 0, why: '+ tam olarak bir seviyenin yerini tutar: sera/02/sicaklik eşleşir; iki seviye ya da sıfır seviye eşleşmez.' },
        { q: 'Hangi abonelik süzgeci geçersizdir?', options: ['sera/#', 'sera/+/nem', 'sera/#/nem', '+/+/nem'], answer: 2, why: '# yalnız son seviyede ve tek başına yazılabilir; sera/#/nem geçersizdir.' },
        { q: 'İki cihaz aynı istemci kimliğiyle aynı broker\'a bağlanıyor. Ne olur?', options: ['Broker iki bağlantıyı birden kabul eder', 'Yeni bağlantı gelince broker eskisini düşürür', 'İkisi de reddedilir', 'Broker kimliğin sonuna rastgele sayı ekler'], answer: 1, why: 'Kimlik broker\'da oturumun anahtarıdır; aynı kimlikle gelen yeni bağlantı eskisini kapatır. İki cihaz birbirini sürekli düşürür.' },
        { q: '# süzgeciyle abone olan bir istemci $SYS/broker/uptime mesajlarını alır mı?', options: ['Evet, # her şeyle eşleşir', 'Yalnız QoS 2 ile', 'Yalnız kalıcı mesajsa', 'Hayır, $ ile başlayan konular baştaki jokerle eşleşmez'], answer: 3, why: 'MQTT, $ ile başlayan konuları baştaki + ya da # ile eşleştirmez; $SYS/# diye açıkça abone olmak gerekir.' },
      ],
    },
    en: {
      title: 'MQTT basics: broker, topics and wildcards',
      summary: 'The publish-subscribe model, the broker, client ids, topic design, + and # wildcards, $SYS, and PubSubClient with umqtt.simple.',
      goals: ['Compare the publish-subscribe model with the request-response model', 'Design a consistent topic tree for a fleet of devices', 'Predict which topics the + and # wildcards match', 'Write an ESP32 client that publishes over MQTT and listens for commands'],
      notes: `<p>In HTTP the client asks the server. But what if a sensor wants to send data to a hundred dashboard screens, or a phone wants to command a relay behind the network? MQTT is a light protocol designed for that. There is a <b>broker</b> in the middle; devices do not know each other, they only connect to the broker. A publisher sends a message to a <b>topic</b> and everyone subscribed to that topic receives it.</p>
<h3>Pieces</h3>
<ul><li><b>Broker</b>: a server such as Mosquitto, EMQX or HiveMQ. Default port 1883 (plain text), 8883 with TLS.</li><li><b>Client id</b>: the name of each connection on the broker. It must be unique: if a second client connects with the same id, the broker drops the old one.</li><li><b>Topic</b>: levels separated by slashes, for example <code>sera/01/sicaklik</code>. Not defined in advance; it exists from the first publish.</li><li><b>Payload</b>: a byte array. Text, JSON or binary; the broker does not look inside.</li></ul>
<h3>Topic design</h3>
<p>The topic tree is the fleet's address book. Go from general to specific: <code>site/device/measurement</code>. Keep commands on a separate branch (<code>sera/01/led/set</code>) and state on another (<code>sera/01/led</code>). Use lower-case names without spaces and without a leading slash: <code>/sera</code> and <code>sera</code> are different topics.</p>
<h3>Wildcards</h3>
<p>A subscription filter may contain wildcards; a publish topic may not.</p>
<div class="eq">sera/+/sicaklik → sera/01/sicaklik ✓ &nbsp; sera/01/kat/sicaklik ✗ &nbsp;&nbsp; sera/# → sera ✓, sera/01/nem ✓</div>
<ul><li><code>+</code> stands for exactly one level and must be the whole level: <code>sera/0+</code> is invalid.</li><li><code>#</code> covers all remaining levels, is written only at the end and on its own; it also matches the parent level itself.</li><li>Topics starting with <code>$</code> (<code>$SYS/broker/uptime</code>) are not matched by a leading wildcard; you must ask for broker statistics on purpose.</li></ul>
<h3>Public brokers</h3>
<p><code>test.mosquitto.org</code> and <code>broker.hivemq.com</code> are free for testing but <b>open to everyone</b>: anyone who knows your topic can read and write it. Pick a unique prefix for course experiments, and for real data and commands run your own broker with authentication and TLS (unit 9).</p>`,
      code: [mqttCpp('en'), mqttPy('en')],
      lab: 'In the simulation subscribe the dashboard to sera/+/sicaklik and watch the three devices publish; then change the filter to sera/#: what was added? Publish by hand to sera/01/kat/sicaklik: did the + filter catch it? Try an invalid filter (sera/#/nem). Pull the plug on a device and see which subscribers get its last will. Then run the PubSubClient code in Wokwi against test.mosquitto.org, use your own unique prefix and send 1 to sera/01/led/set from an MQTT client.',
      pitfalls: ['Giving two devices the same client id: when one connects the other drops, creating an endless connect-drop loop.', 'Putting a slash at the start of the topic (/sera/01): it is not the same topic as sera/01 and the subscription does not match.', 'Subscribing to everything with # in production: the client drowns in traffic and sees other devices\' data.', 'Sending real data or commands to a public test broker: anyone can read and write.', 'Forgetting to call mqtt.loop(): incoming messages are not handled and the keepalive PING is not sent, so the connection drops.'],
      se: `<p>The publish-subscribe model gives <b>loose coupling</b>: the sensor does not know who uses its data.</p>
<ul><li>Manage the topic tree like an <b>interface document</b>: each topic has its payload, unit, rate and owner written down. Renaming a topic breaks clients as badly as removing a field from an API.</li><li>Adding a new consumer (data logger, ML model, dashboard) happens without touching the device firmware: it simply subscribes.</li><li>The simulation's <code>topicMatches</code> is a pure function; the wildcard rules are easy to check with table-driven tests.</li></ul>`,
      quiz: [
        { q: 'Which topic does the filter sera/+/sicaklik match?', options: ['sera/02/sicaklik', 'sera/02/kat1/sicaklik', 'sera/sicaklik', 'depo/02/sicaklik'], answer: 0, why: '+ stands for exactly one level: sera/02/sicaklik matches; two levels or zero levels do not.' },
        { q: 'Which subscription filter is invalid?', options: ['sera/#', 'sera/+/nem', 'sera/#/nem', '+/+/nem'], answer: 2, why: '# may only appear as the last level and on its own; sera/#/nem is invalid.' },
        { q: 'Two devices connect to the same broker with the same client id. What happens?', options: ['The broker accepts both connections', 'When the new connection arrives the broker drops the old one', 'Both are rejected', 'The broker appends a random number to the id'], answer: 1, why: 'The id is the session key on the broker; a new connection with the same id closes the old one. The two devices keep kicking each other off.' },
        { q: 'Does a client subscribed with # receive $SYS/broker/uptime messages?', options: ['Yes, # matches everything', 'Only with QoS 2', 'Only if the message is retained', 'No, topics starting with $ are not matched by a leading wildcard'], answer: 3, why: 'MQTT does not match topics starting with $ against a leading + or #; you must subscribe to $SYS/# explicitly.' },
      ],
    },
  },
  {
    n: 5, sims: ['qos', 'broker'], parts: ['esp32-esp32-wroom-devkit', 'dht22'], wokwi: true,
    related: [
      { href: '/makine-ogrenmesi/kesinlik-duyarlilik', tr: 'ML dersi: kesinlik ve duyarlılık (kaçırılan ve yanlış alarm)', en: 'ML course: precision and recall (missed and false alarms)' },
    ],
    tr: {
      title: 'MQTT güvenilirliği: QoS, kalıcı mesaj, son vasiyet',
      summary: 'QoS 0/1/2 el sıkışmaları ve yinelenen teslim, kalıcı (retained) mesaj, son vasiyet ve doğum mesajı, keepalive ve kalıcı oturum.',
      goals: ['QoS 0, 1 ve 2\'nin paket dizisini ve teslim garantisini açıklamak', 'Kayıplı bağlantıda yinelenen teslimin neden oluştuğunu ve nasıl zararsız hale getirileceğini göstermek', 'Kalıcı mesaj, son vasiyet ve doğum mesajıyla cihaz durumunu yayımlamak', 'Keepalive ve kalıcı oturum ayarlarını senaryoya göre seçmek'],
      notes: `<p>Wi-Fi paket kaybeder, cihaz uyur, broker yeniden başlar. MQTT, mesajın ne kadar "kesin" teslim edileceğini her yayında seçmene izin verir: <b>QoS</b> (hizmet kalitesi). Garanti arttıkça paket sayısı ve gecikme de artar.</p>
<h3>Üç düzey</h3>
<ul><li><b>QoS 0, en çok bir kez</b>: tek PUBLISH paketi, yanıt yok. Kaybolursa kaybolur. Sık gelen sıcaklık ölçümü için çoğu zaman yeterlidir: bir sonraki ölçüm zaten gelir.</li><li><b>QoS 1, en az bir kez</b>: alıcı PUBACK ile onaylar. Onay gelmezse gönderen paketi DUP bayrağıyla yeniden yollar. PUBACK kaybolmuşsa alıcı mesajı <b>iki kez</b> alır.</li><li><b>QoS 2, tam bir kez</b>: PUBLISH, PUBREC, PUBREL, PUBCOMP. Alıcı paket kimliğini saklar ve mesajı uygulamaya yalnız bir kez verir. En yavaşı ve en pahalısı.</li></ul>
<div class="eq">kayıpsız bağlantıda mesaj başına paket: QoS 0 → 1, QoS 1 → 2, QoS 2 → 4</div>
<p>QoS, yayımlayan ile broker arasında ve broker ile abone arasında ayrı ayrı uygulanır. Aboneye giden QoS, yayın QoS'u ile abonelik QoS'unun küçüğüdür. Kütüphane sınırlarını da bil: PubSubClient yalnız QoS 0 yayımlar, QoS 0 ya da 1 abone olur; umqtt.simple QoS 0 ve 1 destekler.</p>
<h3>Kalıcı mesaj</h3>
<p>Retain bayrağıyla yayımlanan mesajı broker o konunun "son değeri" olarak saklar. Yeni abone olan pano, bir sonraki yayını beklemeden son değeri hemen alır. Konuya boş yükle kalıcı yayın yapmak saklanan mesajı siler. Komutları kalıcı yayımlamak tehlikelidir: cihaz her yeniden bağlandığında eski komutu tekrar alır.</p>
<h3>Son vasiyet ve doğum mesajı</h3>
<p>Son vasiyet (LWT), istemcinin CONNECT paketinde broker'a bıraktığı bir mesajdır. Bağlantı DISCONNECT gönderilmeden koparsa (güç gitti, Wi-Fi düştü, keepalive aşıldı) broker vasiyeti yayımlar. Yaygın desen: bağlanınca <code>sera/01/durum</code> konusuna kalıcı <code>online</code>, vasiyet olarak kalıcı <code>offline</code>. Böylece pano her cihazın canlı olup olmadığını her an bilir.</p>
<h3>Keepalive ve oturum</h3>
<p>İstemci keepalive süresince hiç paket göndermezse PINGREQ yollar. Broker, keepalive'ın 1,5 katı boyunca istemciden ses duymazsa bağlantıyı ölü sayar ve vasiyeti yayımlar. Kalıcı oturumda (clean session = false) broker, aynı kimlikli istemci çevrimdışıyken gelen QoS 1 ve 2 mesajları kuyrukta tutar ve geri bağlanınca teslim eder. Uyuyan cihazlar için kullanışlıdır ama broker belleği sınırlıdır.</p>`,
      code: [lwtCpp('tr'), lwtPy('tr')],
      lab: 'QoS simülasyonunda paket kaybını %0\'dan %30\'a çıkar ve aynı 20 mesajı QoS 0, 1 ve 2 ile gönder. Her düzeyde kaybolan, yinelenen ve teslim edilen mesaj sayısını ve toplam paket sayısını bir tabloya yaz. QoS 1\'de yinelenen bir mesajın izini bul: hangi paket kaybolmuştu? Sonra broker simülasyonunda sera/01/durum konusuna kalıcı "online" yayımla, panoyu yeniden abone et ve mesajın hemen geldiğini gör; cihazın kablosunu çek ve vasiyetin geldiğini izle. Wokwi\'de vasiyetli kodu çalıştırıp simülasyonu durdurarak aynı şeyi gerçek broker\'da dene.',
      pitfalls: ['QoS 1\'in "tam bir kez" olduğunu sanmak: PUBACK kaybolunca aynı mesaj iki kez gelir, komutlar idempotent olmalı.', 'Komutları retain bayrağıyla yayımlamak: cihaz her yeniden bağlandığında eski komutu yeniden uygular.', 'Son vasiyeti kalıcı yapmamak: vasiyetten sonra abone olan pano cihazı hâlâ çevrimiçi sanar.', 'Uykudan uyanan cihazda her seferinde farklı istemci kimliği kullanmak: kalıcı oturum ve kuyruk her seferinde kaybolur.', 'Keepalive\'ı derin uyku aralığından kısa tutmak: broker her uykuda vasiyeti yayımlar ve pano sürekli "offline" gösterir.'],
      se: `<p>Dağıtık sistemlerde "tam bir kez" pahalıdır; pratikte <b>en az bir kez + idempotent alıcı</b> kullanılır.</p>
<ul><li>Her komuta bir kimlik ver ve alıcı son kimlikleri hatırlasın: yinelenen teslim ikinci kez uygulanmaz. 7. ünitenin eyleyici simülasyonu bunu ölçer.</li><li>Durum konusu (<code>online</code> / <code>offline</code> / <code>sleeping</code>) bir <b>sağlık sinyalidir</b>: izleme ve uyarı bunun üstüne kurulur.</li><li>Simülasyondaki <code>simulateQos</code> tohumlu bir rastgele sayı üreteci kullanır: aynı tohum aynı kayıpları verir, hata yeniden üretilebilir. Ağ testlerinde de belirlenimci tohum kullan.</li></ul>`,
      quiz: [
        { q: 'QoS 1 ile gönderilen bir mesajın PUBACK paketi kayboldu. Ne olur?', options: ['Mesaj kaybolur', 'Broker bağlantıyı kapatır', 'Gönderen mesajı siler ve devam eder', 'Gönderen DUP bayrağıyla yeniden yollar; alıcı mesajı iki kez alabilir'], answer: 3, why: 'Gönderen onay görmediği için yeniden yollar. Alıcı ilk kopyayı zaten almıştı: yinelenen teslim olur.' },
        { q: 'Cihaz QoS 2 ile yayımlıyor, pano aynı konuya QoS 1 ile abone. Panoya hangi QoS ile gelir?', options: ['QoS 2', 'QoS 1', 'QoS 0', 'Hiç gelmez'], answer: 1, why: 'Aboneye giden QoS, yayın ve abonelik QoS\'unun küçüğüdür: min(2, 1) = 1.' },
        { q: 'Keepalive 20 s. İstemci tamamen sustu. Broker yaklaşık kaç saniye sonra bağlantıyı ölü sayar?', options: ['30 s', '20 s', '40 s', '60 s'], answer: 0, why: 'Broker keepalive\'ın 1,5 katını bekler: 1,5 · 20 = 30 s. Sonra vasiyeti yayımlar.' },
        { q: 'Bir konudaki kalıcı mesajı nasıl silersin?', options: ['QoS 2 ile aynı mesajı tekrar yayımlarım', 'Konuya abone olup çıkarım', 'Konuya boş yükle ve retain bayrağıyla yayımlarım', 'Broker\'ı yeniden başlatırım'], answer: 2, why: 'Boş yüklü kalıcı yayın, broker\'ın o konu için sakladığı mesajı siler.' },
      ],
    },
    en: {
      title: 'MQTT reliability: QoS, retained messages, last will',
      summary: 'QoS 0/1/2 handshakes and duplicate delivery, retained messages, the last will and the birth message, keepalive and persistent sessions.',
      goals: ['Explain the packet sequence and the delivery guarantee of QoS 0, 1 and 2', 'Show why duplicate delivery happens on a lossy link and how to make it harmless', 'Publish device state with a retained message, a last will and a birth message', 'Choose keepalive and persistent session settings for a scenario'],
      notes: `<p>Wi-Fi loses packets, the device sleeps, the broker restarts. MQTT lets you choose with every publish how "certainly" a message is delivered: <b>QoS</b> (quality of service). As the guarantee grows, so do the packet count and the delay.</p>
<h3>Three levels</h3>
<ul><li><b>QoS 0, at most once</b>: one PUBLISH packet, no reply. If it is lost, it is lost. Often enough for a frequent temperature reading: the next reading is coming anyway.</li><li><b>QoS 1, at least once</b>: the receiver confirms with PUBACK. If no confirmation arrives, the sender resends the packet with the DUP flag. If the PUBACK was lost, the receiver gets the message <b>twice</b>.</li><li><b>QoS 2, exactly once</b>: PUBLISH, PUBREC, PUBREL, PUBCOMP. The receiver stores the packet id and hands the message to the application only once. The slowest and most expensive.</li></ul>
<div class="eq">packets per message on a lossless link: QoS 0 → 1, QoS 1 → 2, QoS 2 → 4</div>
<p>QoS is applied separately between publisher and broker and between broker and subscriber. The QoS delivered to a subscriber is the smaller of the publish QoS and the subscription QoS. Know the library limits too: PubSubClient publishes only at QoS 0 and subscribes at QoS 0 or 1; umqtt.simple supports QoS 0 and 1.</p>
<h3>Retained messages</h3>
<p>The broker stores a message published with the retain flag as the topic's "last value". A dashboard that subscribes later gets the last value at once, without waiting for the next publish. A retained publish with an empty payload deletes the stored message. Publishing commands as retained is dangerous: the device receives the old command again every time it reconnects.</p>
<h3>Last will and birth message</h3>
<p>The last will (LWT) is a message the client leaves with the broker in its CONNECT packet. If the connection breaks without a DISCONNECT (power gone, Wi-Fi dropped, keepalive exceeded), the broker publishes the will. A common pattern: on connect, a retained <code>online</code> on <code>sera/01/durum</code>; as the will, a retained <code>offline</code>. The dashboard then always knows whether each device is alive.</p>
<h3>Keepalive and session</h3>
<p>If the client sends no packet for the keepalive period it sends a PINGREQ. If the broker hears nothing from the client for 1.5 times the keepalive, it declares the connection dead and publishes the will. In a persistent session (clean session = false) the broker queues QoS 1 and 2 messages that arrive while the client with the same id is offline and delivers them when it reconnects. Useful for sleeping devices, but broker memory is limited.</p>`,
      code: [lwtCpp('en'), lwtPy('en')],
      lab: 'In the QoS simulation raise packet loss from 0% to 30% and send the same 20 messages at QoS 0, 1 and 2. For each level write the lost, duplicated and delivered message counts and the total packet count in a table. At QoS 1 find the trace of a duplicated message: which packet had been lost? Then in the broker simulation publish a retained "online" on sera/01/durum, resubscribe the dashboard and see the message arrive at once; pull the plug on the device and watch the will arrive. In Wokwi run the code with the will and stop the simulation to try the same on a real broker.',
      pitfalls: ['Thinking QoS 1 is "exactly once": when a PUBACK is lost the same message arrives twice, so commands must be idempotent.', 'Publishing commands with the retain flag: the device applies the old command again on every reconnect.', 'Not making the last will retained: a dashboard that subscribes after the will still thinks the device is online.', 'Using a different client id on every wake-up: the persistent session and its queue are lost each time.', 'Setting keepalive shorter than the deep sleep interval: the broker publishes the will on every sleep and the dashboard keeps showing "offline".'],
      se: `<p>In distributed systems "exactly once" is expensive; in practice <b>at least once + an idempotent receiver</b> is used.</p>
<ul><li>Give each command an id and let the receiver remember recent ids: a duplicate delivery is not applied twice. The actuator simulation in unit 7 measures this.</li><li>The status topic (<code>online</code> / <code>offline</code> / <code>sleeping</code>) is a <b>health signal</b>: monitoring and alerting are built on it.</li><li>The simulation's <code>simulateQos</code> uses a seeded random number generator: the same seed gives the same losses and a bug can be reproduced. Use deterministic seeds in network tests too.</li></ul>`,
      quiz: [
        { q: 'The PUBACK of a message sent at QoS 1 was lost. What happens?', options: ['The message is lost', 'The broker closes the connection', 'The sender deletes the message and carries on', 'The sender resends with the DUP flag; the receiver may get the message twice'], answer: 3, why: 'The sender saw no confirmation, so it resends. The receiver already had the first copy: a duplicate delivery.' },
        { q: 'A device publishes at QoS 2 and the dashboard subscribes to that topic at QoS 1. At which QoS does it reach the dashboard?', options: ['QoS 2', 'QoS 1', 'QoS 0', 'It never arrives'], answer: 1, why: 'The QoS delivered to a subscriber is the smaller of the publish and subscription QoS: min(2, 1) = 1.' },
        { q: 'Keepalive is 20 s and the client goes completely silent. After about how many seconds does the broker declare the connection dead?', options: ['30 s', '20 s', '40 s', '60 s'], answer: 0, why: 'The broker waits 1.5 times the keepalive: 1.5 * 20 = 30 s. Then it publishes the will.' },
        { q: 'How do you delete the retained message on a topic?', options: ['Publish the same message again at QoS 2', 'Subscribe to the topic and unsubscribe', 'Publish an empty payload to the topic with the retain flag', 'Restart the broker'], answer: 2, why: 'A retained publish with an empty payload deletes the message the broker stored for that topic.' },
      ],
    },
  },
]
