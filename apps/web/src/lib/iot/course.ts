// ESP32 ile Nesnelerin İnterneti (büyükler için, 16+): 10 ünite, 13 tarayıcı simülasyonu, bitirme projesi "akıllı sera".
// Yapı Drone dersiyle aynı (ünite = notlar + simülasyon + kod + kendin dene + quiz); sayfalar components/kurs ortak çatısında.
import type { IotSimId } from '@/components/iot/sim-meta'
import { D, type Capstone, type CodeBlock, type CourseMeta, type CourseUnit, type Lang } from '@/lib/kurs/types'
import { UNITS_A } from './units-a'
import { UNITS_B } from './units-b'

export const IOT_UNITS: readonly CourseUnit<IotSimId>[] = [...UNITS_A, ...UNITS_B]
export const iotUnitOf = (n: number) => IOT_UNITS.find((u) => u.n === n)

export const IOT_META: CourseMeta = {
  slug: 'iot', code: 'IOT', hours: 40,
  tr: {
    title: 'ESP32 ile Nesnelerin İnterneti',
    lede: 'Bir ESP32\'yi Wi-Fi\'ye bağla, sensör verisini MQTT ile buluta gönder, uzaktan röle ve servo sür, canlı pano kur, pille aylarca çalıştır ve güvenli hâle getir. Broker, cihazlar ve bağlantı kaybı tarayıcıda benzetilir; aynı kod Wokwi\'de ve gerçek kartta çalışır.',
    audience: '16 yaş ve üstü; meslek lisesi, ön lisans ve üniversite öğrencileri, elektronik ve yazılım alanında çalışanlar.',
    duration: '10 hafta, haftada yaklaşık 4 saat (toplam 40 saat: 30 saat ünite + 10 saat bitirme projesi).',
    prereq: 'Arduino ile temel deneyim (pinMode, digitalWrite, Serial) ya da temel Python. Devre laboratuvarındaki DHT22 ve BME280 kitleri yeterli; gerçek ESP32 isteğe bağlı.',
    outcomes: [
      'ESP32 ile Arduino Uno\'yu karşılaştırmak, pin kısıtlarına uyan bir bağlantı planı çıkarmak',
      'Kopmalara dayanıklı, bloklamayan Wi-Fi bağlantısı ve üstel geri çekilme yazmak',
      'ESP32 üzerinde doğru durum kodları döndüren küçük bir REST API ve JSON gövdesi tasarlamak',
      'MQTT konu ağacı tasarlamak; joker, QoS, kalıcı mesaj ve son vasiyeti doğru yerde kullanmak',
      'Sensör verisini verimli bir yükle buluta göndermek, uzaktan eyleyiciyi idempotent komutlarla sürmek',
      'Derin uyku ile pil ömrünü hesaplamak, OTA güncellemesini geri dönüşlü kurgulamak',
      'TLS, cihaz başına kimlik bilgisi ve ACL ile bir IoT sistemini güvenli hâle getirmek; BLE temellerini açıklamak',
      'Kural motorlu bir akıllı sera sistemini gereksinim, mimari, test ve demo ile teslim etmek',
    ],
    certificate: 'Üniteleri ve bitirme projesini tamamlayanlar Macademia katılım belgesi alır.',
  },
  en: {
    title: 'Internet of Things with the ESP32',
    lede: 'Connect an ESP32 to Wi-Fi, send sensor data to the cloud over MQTT, drive a relay and a servo remotely, build a live dashboard, run on a battery for months and make it secure. The broker, devices and link loss are simulated in your browser; the same code runs in Wokwi and on a real board.',
    audience: 'Ages 16 and up; vocational high school, associate degree and university students, people working in electronics and software.',
    duration: '10 weeks, about 4 hours a week (40 hours in total: 30 hours of units + 10 hours of capstone project).',
    prereq: 'Basic Arduino experience (pinMode, digitalWrite, Serial) or basic Python. The DHT22 and BME280 kits in the circuit lab are enough; a real ESP32 is optional.',
    outcomes: [
      'Compare the ESP32 with the Arduino Uno and draw up a wiring plan that respects the pin limits',
      'Write a non-blocking Wi-Fi connection that survives drops, with exponential backoff',
      'Design a small REST API on the ESP32 with correct status codes and JSON bodies',
      'Design an MQTT topic tree; use wildcards, QoS, retained messages and the last will in the right places',
      'Send sensor data to the cloud with an efficient payload and drive a remote actuator with idempotent commands',
      'Work out battery life with deep sleep and plan an OTA update with rollback',
      'Secure an IoT system with TLS, per-device credentials and ACLs; explain the basics of BLE',
      'Deliver a smart greenhouse system with a rules engine, with requirements, architecture, tests and a demo',
    ],
    certificate: 'Learners who complete the units and the capstone project receive a Macademia certificate of participation.',
  },
}

export const IOT_CAPSTONE: Capstone = {
  parts: ['esp32-esp32-wroom-devkit', 'dht22', 'bme280', 'ldr', 'irf540', 'sg90', 'oled-ssd1306-0-96', 'li-ion-18650-batarya'],
  tr: {
    title: 'Akıllı sera (ya da akıllı ev) sistemi',
    summary: 'İki ESP32 düğümü, bir MQTT broker\'ı, kural motoru ve canlı pano: sıcaklık, nem, ışık ve toprak nemine göre pencere, fan, ısıtıcı ve sulamayı yöneten, bağlantı koptuğunda güvenli kalan bir sistem.',
    scenario: 'Bir okul serası hafta sonları kimsesiz kalıyor. Sıcak günlerde bitkiler yanıyor, soğuk gecelerde donuyor. Senden sensör düğümü ve eyleyici düğümünden oluşan, MQTT ile haberleşen, kurallarla kendini yöneten ve öğretmene telefondan canlı durum ve uyarı gösteren bir sistem isteniyor. Aynı tasarım bir evin ısıtma ve aydınlatmasına da uyarlanabilir.',
    requirements: [
      'G1: Sensör düğümü sıcaklık, nem, basınç ve ışığı en çok 60 s aralıkla, ölü bantla (değişince bildir) ve en az 15 dakikada bir kalp atışıyla yayımlar.',
      'G2: Konu ağacı belgelenmiştir (sera/<düğüm>/<ölçüm>, sera/<düğüm>/komut/<eyleyici>, sera/<düğüm>/durum); durum konusu kalıcıdır ve son vasiyetle "offline" olur.',
      'G3: Eyleyici komutları idempotenttir (mutlak değer + komut kimliği); aynı komutun iki kez gelmesi durumu bozmaz.',
      'G4: Kurallar cihaz üstünde çalışır; Wi-Fi ya da broker 5 dakikadan uzun koparsa ısıtıcı kapanır, pencere yarı açık kalır (güvenli varsayılan).',
      'G5: Sıcaklık 36 °C\'yi aşınca 30 s içinde uyarı yayımlanır; histerezisle aynı olay için tekrar eden uyarı gönderilmez.',
      'G6: Pano son 24 saati gösterir, çizimde min/max seyreltme kullanır ve tüm düğümlerin çevrim içi durumunu gösterir.',
      'G7: Bağlantı TLS\'lidir, her düğümün kendi kimliği ve ACL kaydı vardır; parolalar depoda yoktur.',
      'G8: Pille çalışan sensör düğümünün hesaplanan pil ömrü en az 30 gündür (derin uyku ile).',
    ],
    architecture: [
      'Sensör düğümü (ESP32 + DHT22 + BME280 + LDR): uyan, oku, bağlan, yayımla, derin uyku; okuma sayacı RTC belleğinde.',
      'Eyleyici düğümü (ESP32 + röle/MOSFET + servo + OLED): komut konularına abone, kural motoru ve güvenli varsayılan burada; durumu kalıcı mesajla bildirir.',
      'Broker (Mosquitto, TLS 8883, parola dosyası + ACL); bulutta ya da okul sunucusunda.',
      'Pano (Node-RED, Grafana ya da bu dersteki pano yapısı): telemetri konularına abone, halka tampon ve uyarı listesi.',
      'Yazılım katmanları: sürücü (sensör okuma) / alan mantığı (kurallar, histerezis, saf fonksiyon) / iletişim (MQTT, Wi-Fi yeniden bağlanma). Alan mantığı donanımsız test edilir.',
    ],
    tests: [
      'Birim: kural motoru ve histerezis için en az 10 test (eşik altı, eşik üstü, BEKLE süresi, güvenli varsayılan).',
      'Birim: konu ve yük biçimi için ayrıştırma testleri (bozuk JSON, eksik alan, yanlış tip).',
      'Tümleşik: broker\'ı durdur, 6 dakika bekle: eyleyici güvenli varsayılana geçiyor ve vasiyet "offline" yayımlanıyor mu?',
      'Tümleşik: aynı komutu üç kez gönder: röle durumu ve komut sayacı doğru mu?',
      'Kabul: tarayıcıdaki kural motoru simülasyonunda üç hava senaryosunda (sıcak, soğuk, bulutlu) konfor en az %85, aşırı sıcak 0 dakika.',
      'Güvenlik: anonim istemci bağlanamıyor; bir düğüm başka düğümün komut konusuna yazamıyor.',
    ],
    demo: [
      '5 dakikalık canlı gösterim: pano, sıcaklığı elle artırınca (saç kurutma makinesi ya da simülasyon) pencere ve fanın açılması, uyarının gelmesi.',
      'Kabloyu çek: panoda düğümün "offline" olduğunu ve eyleyicinin güvenli varsayılana geçtiğini göster.',
      'Mimari çizimi, konu ağacı ve test raporunu (geçen/kalan) sun; pil ömrü hesabını göster.',
    ],
  },
  en: {
    title: 'Smart greenhouse (or smart home) system',
    summary: 'Two ESP32 nodes, an MQTT broker, a rules engine and a live dashboard: a system that drives the window, fan, heater and watering from temperature, humidity, light and soil moisture, and stays safe when the link drops.',
    scenario: 'A school greenhouse is left alone at weekends. On hot days the plants burn, on cold nights they freeze. You are asked for a system made of a sensor node and an actuator node that talk over MQTT, manage themselves with rules and show the teacher live status and alerts on a phone. The same design can be adapted to the heating and lighting of a home.',
    requirements: [
      'R1: The sensor node publishes temperature, humidity, pressure and light at most every 60 s, with a dead band (report on change) and a heartbeat at least every 15 minutes.',
      'R2: The topic tree is documented (sera/<node>/<measurement>, sera/<node>/komut/<actuator>, sera/<node>/durum); the status topic is retained and becomes "offline" through the last will.',
      'R3: Actuator commands are idempotent (absolute value + command id); receiving the same command twice does not break the state.',
      'R4: Rules run on the device; if Wi-Fi or the broker is gone for more than 5 minutes, the heater switches off and the window stays half open (safe default).',
      'R5: When the temperature exceeds 36 °C an alert is published within 30 s; with hysteresis, no repeated alert is sent for the same event.',
      'R6: The dashboard shows the last 24 hours, uses min/max downsampling for plotting and shows the online status of every node.',
      'R7: The connection uses TLS, each node has its own identity and ACL entry; passwords are not in the repository.',
      'R8: The computed battery life of the battery-powered sensor node is at least 30 days (with deep sleep).',
    ],
    architecture: [
      'Sensor node (ESP32 + DHT22 + BME280 + LDR): wake, read, connect, publish, deep sleep; the reading counter lives in RTC memory.',
      'Actuator node (ESP32 + relay/MOSFET + servo + OLED): subscribes to command topics, runs the rules engine and the safe default, reports its state with a retained message.',
      'Broker (Mosquitto, TLS 8883, password file + ACL); in the cloud or on a school server.',
      'Dashboard (Node-RED, Grafana or the dashboard design from this course): subscribes to telemetry topics, ring buffer and alert list.',
      'Software layers: driver (sensor reading) / domain logic (rules, hysteresis, pure functions) / communication (MQTT, Wi-Fi reconnect). The domain logic is tested without hardware.',
    ],
    tests: [
      'Unit: at least 10 tests for the rules engine and hysteresis (below threshold, above threshold, HOLD time, safe default).',
      'Unit: parsing tests for topics and payload format (broken JSON, missing field, wrong type).',
      'Integration: stop the broker and wait 6 minutes: does the actuator switch to the safe default and is the will "offline" published?',
      'Integration: send the same command three times: are the relay state and the command counter correct?',
      'Acceptance: in the in-browser rules engine simulation, comfort at least 85% and 0 minutes too hot in three weather scenarios (hot, cold, cloudy).',
      'Security: an anonymous client cannot connect; one node cannot write to another node\'s command topic.',
    ],
    demo: [
      'A 5-minute live demo: the dashboard, the window and fan opening when you raise the temperature by hand (a hair dryer or the simulation), the alert arriving.',
      'Pull the cable: show the node going "offline" on the dashboard and the actuator switching to its safe default.',
      'Present the architecture drawing, the topic tree and the test report (passed/failed); show the battery life calculation.',
    ],
  },
  deliverables: [
    D(3, ['Gereksinim ve pin planı', 'G1–G8\'i kendi serana uyarla, her biri için ölçülebilir kabul ölçütü yaz; iki düğümün pin planını planlayıcıda hatasız çıkar ve REST ile yerel durum sayfası tasarla.'], ['Requirements and pin plan', 'Adapt R1–R8 to your greenhouse and write a measurable acceptance criterion for each; produce a clean pin plan for both nodes in the planner and design a local status page with REST.']),
    D(5, ['Konu ağacı ve MQTT sözleşmesi', 'Konu ağacını, yük biçimlerini, QoS ve retain kararlarını ve son vasiyeti bir sayfalık sözleşme olarak yaz; broker simülasyonunda dene.'], ['Topic tree and MQTT contract', 'Write the topic tree, payload formats, QoS and retain decisions and the last will as a one-page contract; try it in the broker simulation.']),
    D(7, ['Uçtan uca ilk sürüm', 'Sensör düğümü yayımlıyor, eyleyici düğümü idempotent komutla röle ve servoyu sürüyor, pano canlı çiziyor (Wokwi ya da gerçek kart).'], ['End-to-end first version', 'The sensor node publishes, the actuator node drives the relay and servo with idempotent commands, the dashboard plots live (Wokwi or a real board).']),
    D(9, ['Güç ve güvenlik', 'Derin uyku ile pil ömrü hesabı (en az 30 gün), TLS, cihaz başına kimlik ve ACL; güvenlik denetiminde risk puanı 20\'nin altında.'], ['Power and security', 'Battery life calculation with deep sleep (at least 30 days), TLS, per-device credentials and ACL; risk score below 20 in the security audit.']),
    D(10, ['Kural motoru, testler ve demo', 'Cihaz üstü kurallar ve güvenli varsayılan; test raporu; 5 dakikalık demo videosu ve mimari çizimi.'], ['Rules engine, tests and demo', 'On-device rules and safe default; test report; a 5-minute demo video and architecture drawing.']),
  ],
  grading: [
    { tr: 'Gereksinim ve mimari belgesi', en: 'Requirements and architecture document', pct: 20 },
    { tr: 'Çalışan sistem (uçtan uca)', en: 'Working system (end to end)', pct: 30 },
    { tr: 'Testler ve test raporu', en: 'Tests and test report', pct: 20 },
    { tr: 'Güç ve güvenlik', en: 'Power and security', pct: 15 },
    { tr: 'Demo ve sunum', en: 'Demo and presentation', pct: 15 },
  ],
}

export const IOT_RELATED = [
  { href: '/muhendislik/sensor-ml', tr: 'Sensör verisinden makine öğrenmesi tahmini (devam dersi)', en: 'Machine learning forecasting from sensor data (follow-up course)' },
  { href: '/laboratuvar?parca=dht22', tr: 'Devre laboratuvarı: DHT22 kiti', en: 'Circuit lab: DHT22 kit' },
  { href: '/laboratuvar?parca=bme280', tr: 'Devre laboratuvarı: BME280 kiti', en: 'Circuit lab: BME280 kit' },
  { href: '/muhendislik/parca/esp32-esp32-wroom-devkit', tr: 'Hyvex parça kartı: ESP32-WROOM DevKit', en: 'Hyvex part card: ESP32-WROOM DevKit' },
  { href: '/makine-ogrenmesi', tr: 'Makine öğrenmesi dersi', en: 'Machine learning course' },
  { href: '/muhendislik/robotik', tr: 'Robotik dersi (ESOF 323): gömülü programlama haftaları', en: 'Robotics course (ESOF 323): embedded programming weeks' },
]

/** Bitirme projesinin başlangıç kodu: kural motorunun saf mantığı (donanımsız test edilir) ve güvenli varsayılan. */
export function iotStarter(l: Lang): CodeBlock {
  const c = (tr: string, en: string) => (l === 'tr' ? tr : en)
  return {
    title: c('Arduino C++: eyleyici düğümü iskeleti', 'Arduino C++: actuator node skeleton'),
    src: `#include <WiFi.h>
#include <PubSubClient.h>
#include "secrets.h"            // ${c('WIFI_SSID, WIFI_PASS, MQTT_USER, MQTT_PASS (git\'e girmez)', 'WIFI_SSID, WIFI_PASS, MQTT_USER, MQTT_PASS (not in git)')}

struct Env { float temp; float hum; float soil; };
struct Acts { bool window; bool fan; bool heater; bool pump; };

// ${c('Alan mantığı: saf fonksiyon, donanımsız test edilir', 'Domain logic: a pure function, tested without hardware')}
Acts decide(const Env& e, const Acts& now) {
  Acts a = now;
  if (e.temp > 30) a.window = true;  else if (e.temp < 26) a.window = false;   // ${c('histerezis', 'hysteresis')}
  if (e.temp > 33) a.fan = true;     else if (e.temp < 29) a.fan = false;
  if (e.temp < 14) a.heater = true;  else if (e.temp > 17) a.heater = false;
  if (e.soil < 35) a.pump = true;    else if (e.soil > 60) a.pump = false;
  return a;
}

// ${c('Bağlantı 5 dakikadan uzun koparsa güvenli varsayılan', 'Safe default when the link is down for more than 5 minutes')}
Acts failsafe(const Acts& now) { Acts a = now; a.heater = false; a.window = true; a.pump = false; return a; }

WiFiClient net;            // ${c('teslimde WiFiClientSecure + CA sertifikası', 'use WiFiClientSecure + CA certificate for delivery')}
PubSubClient mqtt(net);
Env env{20, 60, 50};
Acts acts{};
unsigned long lastSeen = 0;

void setup() { /* ${c('Wi-Fi, MQTT, son vasiyet, abonelikler (ünite 2, 4, 5)', 'Wi-Fi, MQTT, last will, subscriptions (units 2, 4, 5)')} */ }

void loop() {
  if (mqtt.connected()) { mqtt.loop(); lastSeen = millis(); }
  acts = (millis() - lastSeen > 5UL * 60 * 1000) ? failsafe(acts) : decide(env, acts);
  // ${c('eyleyicilere yaz, durum değiştiyse kalıcı durum mesajı yayımla', 'write to the actuators, publish a retained state message if anything changed')}
}`,
  }
}
