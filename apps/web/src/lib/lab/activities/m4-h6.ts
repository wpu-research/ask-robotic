import type { LabActivity, LabScenario } from '../activity'
import type { Circuit } from '../contract'
import type { LabGoalCtx } from '../goals'
import { partsOf, part, pin, unoOnly, UNO_GNDS, wire } from './helpers'

/** Modül 4, hafta 6 (Girdi cihazları: IR, keypad, RFID, yetki yönetimi, akıllı kapı) laboratuvar etkinlikleri.
 *  Anahtar: "sensorler-ve-projeler:6:<ders>" (ders 1 tabanlı konum; 61-65). */

const noComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

const toGnd = (ctx: LabGoalCtx, id: string, p: string) => UNO_GNDS.some((g) => ctx.analysis.sameNet(pin(id, p), pin('uno', g)))
const to5V = (ctx: LabGoalCtx, id: string, p: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', '5V'))
const toUno = (ctx: LabGoalCtx, id: string, p: string, unoPin: string) => ctx.analysis.sameNet(pin(id, p), pin('uno', unoPin))
/** a ile b arasında yalnız dirençler üzerinden (doğrudan değil) bir yol var mı. */
const viaResistor = (ctx: LabGoalCtx, a: { part: string; pin: string }, b: { part: string; pin: string }) =>
  ctx.analysis.connected(a, b, ['resistor']) && !ctx.analysis.sameNet(a, b)
/** Bir Uno pinine direnç üzerinden A ucu, katodu GND'ye bağlı LED'ler. */
const ledsOnPin = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'led').filter((l) => viaResistor(ctx, pin('uno', unoPin), pin(l.id, 'A')) && toGnd(ctx, l.id, 'K'))
const ledOnPin = (ctx: LabGoalCtx, unoPin: string) => ledsOnPin(ctx, unoPin).length > 0
/** O pindeki LED en az bir kez yanıp söndü mü (yapışkan davranış hedefleri için). */
const ledToggled = (ctx: LabGoalCtx, unoPin: string) => ledsOnPin(ctx, unoPin).some((l) => (ctx.stats?.ledToggles[l.id] ?? 0) >= 1)
/** Bir parçanın iki ucu: biri Uno pinine, öbürü GND'ye. */
const buttonOnPin = (ctx: LabGoalCtx, unoPin: string) =>
  partsOf(ctx.circuit, 'button').some((b) => (toUno(ctx, b.id, 'A', unoPin) && toGnd(ctx, b.id, 'B')) || (toUno(ctx, b.id, 'B', unoPin) && toGnd(ctx, b.id, 'A')))
const keypadRows = (ctx: LabGoalCtx) =>
  partsOf(ctx.circuit, 'keypad').some((k) => ['R1', 'R2', 'R3', 'R4'].every((p, i) => toUno(ctx, k.id, p, `D${9 - i}`)))
const keypadCols = (ctx: LabGoalCtx) =>
  partsOf(ctx.circuit, 'keypad').some((k) => ['C1', 'C2', 'C3', 'C4'].every((p, i) => toUno(ctx, k.id, p, `D${5 - i}`)))
const serialOf = (ctx: LabGoalCtx) => ctx.lab?.serial ?? ''

const w = (c: Circuit, a: [string, string], b: [string, string]) => c.wires.push(wire(pin(...a), pin(...b)))
/** Direnç + LED'i bir Uno pinine bağlar (anot tarafı dirençli). */
const addLed = (c: Circuit, id: string, unoPin: string, color: string, x: number, y: number) => {
  c.parts.push(part(`r${id}`, 'resistor', x, y, { ohms: 330 }), part(id, 'led', x + 120, y, { color }))
  w(c, ['uno', unoPin], [`r${id}`, '1']); w(c, [`r${id}`, '2'], [id, 'A']); w(c, [id, 'K'], ['uno', 'GND'])
}
const addKeypad = (c: Circuit, x: number, y: number) => {
  c.parts.push(part('pad', 'keypad', x, y))
  ;(['R1', 'R2', 'R3', 'R4'] as const).forEach((p, i) => w(c, ['pad', p], ['uno', `D${9 - i}`]))
  ;(['C1', 'C2', 'C3', 'C4'] as const).forEach((p, i) => w(c, ['pad', p], ['uno', `D${5 - i}`]))
}
/** Keypad tuşuna kısa basıp bırakır (YALNIZ TEST). */
const tus = (s: LabScenario, k: string) => { s.setProp('pad', 'key', k); s.advance(60); s.setProp('pad', 'key', ''); s.advance(60) }
const yaz = (s: LabScenario, metin: string) => { for (const k of metin) tus(s, k) }
/** Seri komut gönderir ve işlenmesini bekler (YALNIZ TEST). */
// Not: Sim.sendSerial çok karakterli metinde yalnız ilk karakteri iletiyor (USART alıcısı meşgulken kalan baytlar düşüyor);
// bu yüzden test karakter karakter gönderir (m3-h2 / m3-h4 ile aynı yöntem).
const komut = (s: LabScenario, metin: string, bekle = 150) => { for (const ch of metin + '\n') { s.sendSerial(ch); s.advance(3) } s.advance(bekle) }

const KEYPAD_FULL = `// sketch: keypad_sifre
#include <Keypad.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

const int YESIL = 13;
const int KIRMIZI = 12;
const int PIN_UZUNLUK = 4;
const int AZAMI_YANLIS = 3;
const unsigned long LED_SURESI = 1000;   // ms

const char DOGRU_PIN[] = "1234";

char girilen[PIN_UZUNLUK + 1];           // +1: dizinin sonundaki '\\0'
int hane = 0;
int yanlisSayisi = 0;
unsigned long ledBitis = 0;

void girisiTemizle() {
  hane = 0;
  girilen[0] = '\\0';
}

void yildizYaz() {
  Serial.print("Girilen: ");
  for (int i = 0; i < hane; i++) Serial.print('*');
  Serial.println();
}

void onayla() {
  if (hane < PIN_UZUNLUK) {
    Serial.println("PIN 4 haneli olmali");
    return;
  }
  if (strcmp(girilen, DOGRU_PIN) == 0) {
    Serial.println("PIN dogru");
    yanlisSayisi = 0;
    digitalWrite(YESIL, HIGH);
  } else {
    yanlisSayisi++;
    Serial.print("PIN yanlis (");
    Serial.print(yanlisSayisi);
    Serial.print("/");
    Serial.print(AZAMI_YANLIS);
    Serial.println(")");
    digitalWrite(KIRMIZI, HIGH);
    if (yanlisSayisi >= AZAMI_YANLIS) {
      Serial.println("Cok fazla yanlis deneme");
      yanlisSayisi = 0;
    }
  }
  ledBitis = millis() + LED_SURESI;
  girisiTemizle();
}

void setup() {
  Serial.begin(9600);
  pinMode(YESIL, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
  girisiTemizle();
}

void loop() {
  char tus = tusTakimi.getKey();
  if (tus >= '0' && tus <= '9') {
    if (hane < PIN_UZUNLUK) {
      girilen[hane] = tus;
      hane++;
      girilen[hane] = '\\0';
      yildizYaz();
    }
  } else if (tus == '*') {
    if (hane > 0) {
      hane--;
      girilen[hane] = '\\0';
      yildizYaz();
    }
  } else if (tus == '#') {
    onayla();
  }

  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {   // LED süresi doldu
    digitalWrite(YESIL, LOW);
    digitalWrite(KIRMIZI, LOW);
    ledBitis = 0;
  }
}
`

const KEYPAD_START = `// sketch: keypad_sifre
#include <Keypad.h>

const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);

const int YESIL = 13;
const int KIRMIZI = 12;
const int PIN_UZUNLUK = 4;
const int AZAMI_YANLIS = 3;
const unsigned long LED_SURESI = 1000;   // ms

const char DOGRU_PIN[] = "1234";

char girilen[PIN_UZUNLUK + 1];           // +1: dizinin sonundaki '\\0'
int hane = 0;
int yanlisSayisi = 0;
unsigned long ledBitis = 0;

void girisiTemizle() {
  hane = 0;
  girilen[0] = '\\0';
}

void yildizYaz() {
  Serial.print("Girilen: ");
  for (int i = 0; i < hane; i++) Serial.print('*');
  Serial.println();
}

void onayla() {
  // # basıldı. Burayı sen yaz:
  // 1) Girilen hane sayısı PIN_UZUNLUK'tan azsa "PIN 4 haneli olmali" yaz ve çık (deneme sayılmaz).
  // 2) strcmp(girilen, DOGRU_PIN) == 0 ise "PIN dogru" yaz, yanlisSayisi'ni sıfırla, YESIL LED'i yak.
  // 3) Değilse yanlisSayisi'ni artır, "PIN yanlis" yaz, KIRMIZI LED'i yak;
  //    AZAMI_YANLIS'a ulaşınca "Cok fazla yanlis deneme" yaz ve sayacı sıfırla.
  // 4) En sonda: ledBitis = millis() + LED_SURESI; girisiTemizle();
  girisiTemizle();
}

void setup() {
  Serial.begin(9600);
  pinMode(YESIL, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
  girisiTemizle();
}

void loop() {
  char tus = tusTakimi.getKey();
  if (tus >= '0' && tus <= '9') {
    if (hane < PIN_UZUNLUK) {
      girilen[hane] = tus;
      hane++;
      girilen[hane] = '\\0';
      yildizYaz();
    }
  } else if (tus == '*') {
    if (hane > 0) {
      hane--;
      girilen[hane] = '\\0';
      yildizYaz();
    }
  } else if (tus == '#') {
    onayla();
  }

  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {   // LED süresi doldu
    digitalWrite(YESIL, LOW);
    digitalWrite(KIRMIZI, LOW);
    ledBitis = 0;
  }
}
`

const KART_FULL = `// sketch: kart_taklit
const int YESIL = 13;
const int KIRMIZI = 12;
const byte YETKILI_UID[4] = {0xAA, 0xBB, 0xCC, 0xDD};   // tek örnek yetkili kart
const unsigned long LED_SURESI = 1000;

char satir[24];
int uzunluk = 0;
unsigned long ledBitis = 0;

int hexDeger(char c) {                      // '0'-'9','A'-'F','a'-'f' -> 0-15; olmazsa -1
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

// Seri porttan karakterleri biriktirir. Satır bitince true döner.
bool satirOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\\r') continue;
    if (c == '\\n') {
      satir[uzunluk] = '\\0';
      uzunluk = 0;
      return true;
    }
    if (uzunluk < (int)sizeof(satir) - 1) {
      satir[uzunluk] = c;
      uzunluk++;
    }
  }
  return false;
}

// "KART:AABBCCDD" satırını 4 baytlık UID'ye çevirir. Biçim bozuksa false döner.
bool uidCoz(const char* s, byte uid[4]) {
  if (strncmp(s, "KART:", 5) != 0) return false;
  s += 5;                                    // "KART:" kısmını atla
  if (strlen(s) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(s[2 * i]);
    int alcak = hexDeger(s[2 * i + 1]);
    if (yuksek < 0 || alcak < 0) return false;
    uid[i] = yuksek * 16 + alcak;
  }
  return true;
}

void uidYaz(const byte uid[4]) {
  for (int i = 0; i < 4; i++) {
    if (i > 0) Serial.print(' ');
    if (uid[i] < 16) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(YESIL, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
}

void loop() {
  if (satirOku() && satir[0] != '\\0') {
    byte uid[4];
    if (!uidCoz(satir, uid)) {
      Serial.println("Gecersiz satir");
    } else {
      Serial.print("UID: ");
      uidYaz(uid);
      Serial.println();
      if (memcmp(uid, YETKILI_UID, 4) == 0) {
        Serial.println("YETKILI");
        digitalWrite(YESIL, HIGH);
      } else {
        Serial.println("YETKISIZ");
        digitalWrite(KIRMIZI, HIGH);
      }
      ledBitis = millis() + LED_SURESI;
    }
  }

  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {
    digitalWrite(YESIL, LOW);
    digitalWrite(KIRMIZI, LOW);
    ledBitis = 0;
  }
}
`

const KART_START = `// sketch: kart_taklit
const int YESIL = 13;
const int KIRMIZI = 12;
const byte YETKILI_UID[4] = {0xAA, 0xBB, 0xCC, 0xDD};   // tek örnek yetkili kart
const unsigned long LED_SURESI = 1000;

char satir[24];
int uzunluk = 0;
unsigned long ledBitis = 0;

int hexDeger(char c) {                      // '0'-'9','A'-'F','a'-'f' -> 0-15; olmazsa -1
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

// Seri porttan karakterleri biriktirir. Satır bitince true döner.
bool satirOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\\r') continue;
    if (c == '\\n') {
      satir[uzunluk] = '\\0';
      uzunluk = 0;
      return true;
    }
    if (uzunluk < (int)sizeof(satir) - 1) {
      satir[uzunluk] = c;
      uzunluk++;
    }
  }
  return false;
}

// "KART:AABBCCDD" satırını 4 baytlık UID'ye çevirir. Biçim bozuksa false döner.
bool uidCoz(const char* s, byte uid[4]) {
  if (strncmp(s, "KART:", 5) != 0) return false;
  s += 5;                                    // "KART:" kısmını atla
  if (strlen(s) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(s[2 * i]);
    int alcak = hexDeger(s[2 * i + 1]);
    if (yuksek < 0 || alcak < 0) return false;
    uid[i] = yuksek * 16 + alcak;
  }
  return true;
}

void uidYaz(const byte uid[4]) {
  for (int i = 0; i < 4; i++) {
    if (i > 0) Serial.print(' ');
    if (uid[i] < 16) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(YESIL, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
}

void loop() {
  if (satirOku() && satir[0] != '\\0') {
    byte uid[4];
    if (!uidCoz(satir, uid)) {
      Serial.println("Gecersiz satir");
    } else {
      Serial.print("UID: ");
      uidYaz(uid);
      Serial.println();
      // Burayı sen yaz: memcmp(uid, YETKILI_UID, 4) == 0 ise "YETKILI" yaz ve YESIL LED'i yak,
      // değilse "YETKISIZ" yaz ve KIRMIZI LED'i yak.
      ledBitis = millis() + LED_SURESI;
    }
  }

  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {
    digitalWrite(YESIL, LOW);
    digitalWrite(KIRMIZI, LOW);
    ledBitis = 0;
  }
}
`

const YETKI_FULL = `// sketch: yetki_yonetimi
#include <EEPROM.h>

const int ADR_ISARET = 0;
const int ADR_KULLANICI_PIN = 1;
const int ADR_MASTER_PIN = 5;
const int ADR_KART_SAYISI = 9;
const int ADR_KARTLAR = 10;
const int MAX_KART = 8;
const int PIN_UZUNLUK = 4;
const byte ISARET = 0xA5;

char satir[40];
int uzunluk = 0;

// ---- Yardımcılar ----
int hexDeger(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

bool uidCoz(const char* hex, byte uid[4]) {      // "AABBCCDD" -> 4 bayt
  if (strlen(hex) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(hex[2 * i]);
    int alcak = hexDeger(hex[2 * i + 1]);
    if (yuksek < 0 || alcak < 0) return false;
    uid[i] = yuksek * 16 + alcak;
  }
  return true;
}

void uidYaz(const byte uid[4]) {
  for (int i = 0; i < 4; i++) {
    if (i > 0) Serial.print(' ');
    if (uid[i] < 16) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
}

bool pinGecerli(const char* s) {                 // tam 4 rakam mı?
  if (strlen(s) != PIN_UZUNLUK) return false;
  for (int i = 0; i < PIN_UZUNLUK; i++) {
    if (s[i] < '0' || s[i] > '9') return false;
  }
  return true;
}

// ---- EEPROM işlemleri ----
void pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {
  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);
  pin[PIN_UZUNLUK] = '\\0';
}

void pinYaz(int adres, const char* pin) {
  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);
}

bool pinEsit(int adres, const char* girilen) {
  char kayitli[PIN_UZUNLUK + 1];
  pinOku(adres, kayitli);
  return strcmp(kayitli, girilen) == 0;
}

byte kartSayisi() {
  byte n = EEPROM.read(ADR_KART_SAYISI);
  if (n > MAX_KART) n = 0;                       // bozuk ya da boş (255)
  return n;
}

void kartOku(int sira, byte uid[4]) {
  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);
}

void kartYaz(int sira, const byte uid[4]) {
  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);
}

int kartBul(const byte uid[4]) {                 // sırası ya da -1
  byte n = kartSayisi();
  for (int i = 0; i < n; i++) {
    byte kayitli[4];
    kartOku(i, kayitli);
    if (memcmp(kayitli, uid, 4) == 0) return i;
  }
  return -1;
}

void fabrikaAyari() {
  pinYaz(ADR_KULLANICI_PIN, "1234");
  pinYaz(ADR_MASTER_PIN, "9999");
  EEPROM.update(ADR_KART_SAYISI, 0);
  EEPROM.update(ADR_ISARET, ISARET);             // en son: kurulum tamamlandı
}

// ---- Komutlar ----
void kartEkle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (kartBul(uid) >= 0) { Serial.println("ZATEN VAR"); return; }
  byte n = kartSayisi();
  if (n >= MAX_KART) { Serial.println("LISTE DOLU"); return; }
  kartYaz(n, uid);
  EEPROM.update(ADR_KART_SAYISI, n + 1);         // sayaç en son: yarım kayıt görünmez
  Serial.print("EKLENDI (");
  Serial.print(n + 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void kartSil(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  int sira = kartBul(uid);
  if (sira < 0) { Serial.println("BULUNAMADI"); return; }
  byte n = kartSayisi();
  byte son[4];
  kartOku(n - 1, son);
  kartYaz(sira, son);                            // son kartı boşalan yere taşı
  EEPROM.update(ADR_KART_SAYISI, n - 1);
  Serial.print("SILINDI (");
  Serial.print(n - 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void listele() {
  byte n = kartSayisi();
  Serial.print("Kart sayisi: ");
  Serial.println(n);
  for (int i = 0; i < n; i++) {
    byte uid[4];
    kartOku(i, uid);
    Serial.print(i + 1);
    Serial.print(": ");
    uidYaz(uid);
    Serial.println();
  }
}

void komutIsle(char* s) {
  char* alan[3];
  int adet = 0;
  alan[adet++] = s;
  for (char* p = s; *p != '\\0' && adet < 3; p++) {
    if (*p == ':') {                             // ':' yerine bitiş işareti koy, yeni alan başlat
      *p = '\\0';
      alan[adet++] = p + 1;
    }
  }

  if (strcmp(alan[0], "KART") == 0 && adet == 2) {
    byte uid[4];
    if (!uidCoz(alan[1], uid)) Serial.println("Gecersiz UID");
    else Serial.println(kartBul(uid) >= 0 ? "YETKILI" : "YETKISIZ");
  } else if (strcmp(alan[0], "GIRIS") == 0 && adet == 2) {
    Serial.println(pinEsit(ADR_KULLANICI_PIN, alan[1]) ? "PIN DOGRU" : "PIN YANLIS");
  } else if (strcmp(alan[0], "LISTE") == 0 && adet == 1) {
    listele();
  } else if (adet == 3 && (strcmp(alan[0], "EKLE") == 0 || strcmp(alan[0], "SIL") == 0 || strcmp(alan[0], "PINDEGIS") == 0)) {
    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {     // üç yönetim komutu da master PIN ister
      Serial.println("MASTER PIN YANLIS");
    } else if (strcmp(alan[0], "EKLE") == 0) {
      kartEkle(alan[2]);
    } else if (strcmp(alan[0], "SIL") == 0) {
      kartSil(alan[2]);
    } else {
      if (!pinGecerli(alan[2])) {
        Serial.println("PIN 4 rakam olmali");
      } else {
        pinYaz(ADR_KULLANICI_PIN, alan[2]);
        Serial.println("PIN DEGISTI");
      }
    }
  } else {
    Serial.println("Bilinmeyen komut");
  }
}

bool satirOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\\r') continue;
    if (c == '\\n') {
      satir[uzunluk] = '\\0';
      uzunluk = 0;
      return true;
    }
    if (uzunluk < (int)sizeof(satir) - 1) {
      satir[uzunluk] = c;
      uzunluk++;
    }
  }
  return false;
}

void setup() {
  Serial.begin(9600);
  if (EEPROM.read(ADR_ISARET) != ISARET) {
    fabrikaAyari();
    Serial.println("Fabrika ayari yazildi");
  }
  Serial.print("Yetki sistemi hazir. Kart sayisi: ");
  Serial.println(kartSayisi());
}

void loop() {
  if (satirOku() && satir[0] != '\\0') {
    komutIsle(satir);
  }
}
`

const YETKI_START = `// sketch: yetki_yonetimi
#include <EEPROM.h>

const int ADR_ISARET = 0;
const int ADR_KULLANICI_PIN = 1;
const int ADR_MASTER_PIN = 5;
const int ADR_KART_SAYISI = 9;
const int ADR_KARTLAR = 10;
const int MAX_KART = 8;
const int PIN_UZUNLUK = 4;
const byte ISARET = 0xA5;

char satir[40];
int uzunluk = 0;

// ---- Yardımcılar ----
int hexDeger(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

bool uidCoz(const char* hex, byte uid[4]) {      // "AABBCCDD" -> 4 bayt
  if (strlen(hex) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(hex[2 * i]);
    int alcak = hexDeger(hex[2 * i + 1]);
    if (yuksek < 0 || alcak < 0) return false;
    uid[i] = yuksek * 16 + alcak;
  }
  return true;
}

void uidYaz(const byte uid[4]) {
  for (int i = 0; i < 4; i++) {
    if (i > 0) Serial.print(' ');
    if (uid[i] < 16) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
}

bool pinGecerli(const char* s) {                 // tam 4 rakam mı?
  if (strlen(s) != PIN_UZUNLUK) return false;
  for (int i = 0; i < PIN_UZUNLUK; i++) {
    if (s[i] < '0' || s[i] > '9') return false;
  }
  return true;
}

// ---- EEPROM işlemleri ----
void pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {
  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);
  pin[PIN_UZUNLUK] = '\\0';
}

void pinYaz(int adres, const char* pin) {
  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);
}

bool pinEsit(int adres, const char* girilen) {
  char kayitli[PIN_UZUNLUK + 1];
  pinOku(adres, kayitli);
  return strcmp(kayitli, girilen) == 0;
}

byte kartSayisi() {
  byte n = EEPROM.read(ADR_KART_SAYISI);
  if (n > MAX_KART) n = 0;                       // bozuk ya da boş (255)
  return n;
}

void kartOku(int sira, byte uid[4]) {
  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);
}

void kartYaz(int sira, const byte uid[4]) {
  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);
}

int kartBul(const byte uid[4]) {                 // sırası ya da -1
  byte n = kartSayisi();
  for (int i = 0; i < n; i++) {
    byte kayitli[4];
    kartOku(i, kayitli);
    if (memcmp(kayitli, uid, 4) == 0) return i;
  }
  return -1;
}

void fabrikaAyari() {
  pinYaz(ADR_KULLANICI_PIN, "1234");
  pinYaz(ADR_MASTER_PIN, "9999");
  EEPROM.update(ADR_KART_SAYISI, 0);
  EEPROM.update(ADR_ISARET, ISARET);             // en son: kurulum tamamlandı
}

// ---- Komutlar ----
void kartEkle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (kartBul(uid) >= 0) { Serial.println("ZATEN VAR"); return; }
  byte n = kartSayisi();
  if (n >= MAX_KART) { Serial.println("LISTE DOLU"); return; }
  kartYaz(n, uid);
  EEPROM.update(ADR_KART_SAYISI, n + 1);         // sayaç en son: yarım kayıt görünmez
  Serial.print("EKLENDI (");
  Serial.print(n + 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void kartSil(const char* hex) {
  // Burayı sen yaz:
  // 1) uidCoz ile UID'yi çöz (olmazsa "Gecersiz UID" yaz).
  // 2) kartBul ile sırasını bul (yoksa "BULUNAMADI" yaz).
  // 3) Son kartı silinenin yerine kopyala (kartOku + kartYaz), sayacı bir azalt (EEPROM.update).
  // 4) "SILINDI (n/8)" yaz.
  Serial.println("SIL henuz yazilmadi");
}

void listele() {
  byte n = kartSayisi();
  Serial.print("Kart sayisi: ");
  Serial.println(n);
  for (int i = 0; i < n; i++) {
    byte uid[4];
    kartOku(i, uid);
    Serial.print(i + 1);
    Serial.print(": ");
    uidYaz(uid);
    Serial.println();
  }
}

void komutIsle(char* s) {
  char* alan[3];
  int adet = 0;
  alan[adet++] = s;
  for (char* p = s; *p != '\\0' && adet < 3; p++) {
    if (*p == ':') {                             // ':' yerine bitiş işareti koy, yeni alan başlat
      *p = '\\0';
      alan[adet++] = p + 1;
    }
  }

  if (strcmp(alan[0], "KART") == 0 && adet == 2) {
    byte uid[4];
    if (!uidCoz(alan[1], uid)) Serial.println("Gecersiz UID");
    else Serial.println(kartBul(uid) >= 0 ? "YETKILI" : "YETKISIZ");
  } else if (strcmp(alan[0], "GIRIS") == 0 && adet == 2) {
    Serial.println(pinEsit(ADR_KULLANICI_PIN, alan[1]) ? "PIN DOGRU" : "PIN YANLIS");
  } else if (strcmp(alan[0], "LISTE") == 0 && adet == 1) {
    listele();
  } else if (adet == 3 && (strcmp(alan[0], "EKLE") == 0 || strcmp(alan[0], "SIL") == 0 || strcmp(alan[0], "PINDEGIS") == 0)) {
    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {     // üç yönetim komutu da master PIN ister
      Serial.println("MASTER PIN YANLIS");
    } else if (strcmp(alan[0], "EKLE") == 0) {
      kartEkle(alan[2]);
    } else if (strcmp(alan[0], "SIL") == 0) {
      kartSil(alan[2]);
    } else {
      if (!pinGecerli(alan[2])) {
        Serial.println("PIN 4 rakam olmali");
      } else {
        pinYaz(ADR_KULLANICI_PIN, alan[2]);
        Serial.println("PIN DEGISTI");
      }
    }
  } else {
    Serial.println("Bilinmeyen komut");
  }
}

bool satirOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\\r') continue;
    if (c == '\\n') {
      satir[uzunluk] = '\\0';
      uzunluk = 0;
      return true;
    }
    if (uzunluk < (int)sizeof(satir) - 1) {
      satir[uzunluk] = c;
      uzunluk++;
    }
  }
  return false;
}

void setup() {
  Serial.begin(9600);
  if (EEPROM.read(ADR_ISARET) != ISARET) {
    fabrikaAyari();
    Serial.println("Fabrika ayari yazildi");
  }
  Serial.print("Yetki sistemi hazir. Kart sayisi: ");
  Serial.println(kartSayisi());
}

void loop() {
  if (satirOku() && satir[0] != '\\0') {
    komutIsle(satir);
  }
}
`

const KAPI_FULL = `// sketch: akilli_kapi
#include <Keypad.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

// ---- Pinler ----
const int SERVO_PIN = 10;
const int BUZZER = 11;
const int KIRMIZI = 12;
const int YESIL = 13;

// ---- Ayarlar ----
const int ACIK_ACI = 90;
const int KILIT_ACI = 0;
const int PIN_UZUNLUK = 4;
const int AZAMI_YANLIS = 3;
const unsigned long ACIK_SURESI = 5000;        // ms
const unsigned long BLOK_SURESI = 30000;       // ms
const unsigned long MESAJ_SURESI = 1500;       // ms
const unsigned long GIRIS_ZAMAN_ASIMI = 10000; // ms: yarım kalan PIN silinir

// ---- EEPROM haritası (64. ders) ----
const int ADR_ISARET = 0;
const int ADR_KULLANICI_PIN = 1;
const int ADR_MASTER_PIN = 5;
const int ADR_KART_SAYISI = 9;
const int ADR_KARTLAR = 10;
const int MAX_KART = 8;
const byte ISARET = 0xA5;

// ---- Nesneler ----
const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo kilit;

// ---- Durum ----
enum Durum { KILITLI, ACIK, BLOKE };
Durum durum = KILITLI;

char girilen[PIN_UZUNLUK + 1];
int hane = 0;
int yanlis = 0;
unsigned long acikBitis = 0;
unsigned long blokBitis = 0;
unsigned long mesajBitis = 0;
unsigned long sonTus = 0;
bool mesajVar = false;
char mesajUst[17];
char mesajAlt[17];
char sonUst[17] = "";
char sonAlt[17] = "";

char satir[40];
int uzunluk = 0;

bool doldu(unsigned long simdi, unsigned long bitis) {
  return (long)(simdi - bitis) >= 0;           // millis() taşsa da doğru
}

// ---- Yardımcılar (63-64. dersler) ----
int hexDeger(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

bool uidCoz(const char* hex, byte uid[4]) {
  if (strlen(hex) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(hex[2 * i]);
    int alcak = hexDeger(hex[2 * i + 1]);
    if (yuksek < 0 || alcak < 0) return false;
    uid[i] = yuksek * 16 + alcak;
  }
  return true;
}

void uidYaz(const byte uid[4]) {
  for (int i = 0; i < 4; i++) {
    if (i > 0) Serial.print(' ');
    if (uid[i] < 16) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
}

bool pinGecerli(const char* s) {
  if (strlen(s) != PIN_UZUNLUK) return false;
  for (int i = 0; i < PIN_UZUNLUK; i++) {
    if (s[i] < '0' || s[i] > '9') return false;
  }
  return true;
}

// ---- EEPROM işlemleri (64. ders) ----
void pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {
  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);
  pin[PIN_UZUNLUK] = '\\0';
}

void pinYaz(int adres, const char* pin) {
  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);
}

bool pinEsit(int adres, const char* girilenPin) {
  char kayitli[PIN_UZUNLUK + 1];
  pinOku(adres, kayitli);
  return strcmp(kayitli, girilenPin) == 0;
}

byte kartSayisi() {
  byte n = EEPROM.read(ADR_KART_SAYISI);
  if (n > MAX_KART) n = 0;
  return n;
}

void kartOku(int sira, byte uid[4]) {
  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);
}

void kartYaz(int sira, const byte uid[4]) {
  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);
}

int kartBul(const byte uid[4]) {
  byte n = kartSayisi();
  for (int i = 0; i < n; i++) {
    byte kayitli[4];
    kartOku(i, kayitli);
    if (memcmp(kayitli, uid, 4) == 0) return i;
  }
  return -1;
}

void fabrikaAyari() {
  pinYaz(ADR_KULLANICI_PIN, "1234");
  pinYaz(ADR_MASTER_PIN, "9999");
  EEPROM.update(ADR_KART_SAYISI, 0);
  EEPROM.update(ADR_ISARET, ISARET);
}

void kartEkle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (kartBul(uid) >= 0) { Serial.println("ZATEN VAR"); return; }
  byte n = kartSayisi();
  if (n >= MAX_KART) { Serial.println("LISTE DOLU"); return; }
  kartYaz(n, uid);
  EEPROM.update(ADR_KART_SAYISI, n + 1);
  Serial.print("EKLENDI (");
  Serial.print(n + 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void kartSil(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  int sira = kartBul(uid);
  if (sira < 0) { Serial.println("BULUNAMADI"); return; }
  byte n = kartSayisi();
  byte son[4];
  kartOku(n - 1, son);
  kartYaz(sira, son);
  EEPROM.update(ADR_KART_SAYISI, n - 1);
  Serial.print("SILINDI (");
  Serial.print(n - 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void listele() {
  byte n = kartSayisi();
  Serial.print("Kart sayisi: ");
  Serial.println(n);
  for (int i = 0; i < n; i++) {
    byte uid[4];
    kartOku(i, uid);
    Serial.print(i + 1);
    Serial.print(": ");
    uidYaz(uid);
    Serial.println();
  }
}

// ---- Ekran ----
void satirYaz(int sira, const char* metin) {
  lcd.setCursor(0, sira);
  int boy = strlen(metin);
  for (int i = 0; i < 16; i++) lcd.print(i < boy ? metin[i] : ' ');
}

void ekran(const char* ust, const char* alt) {      // yalnız değişen satırı yeniden yazar
  if (strcmp(ust, sonUst) != 0) {
    satirYaz(0, ust);
    strncpy(sonUst, ust, 16);
    sonUst[16] = '\\0';
  }
  if (strcmp(alt, sonAlt) != 0) {
    satirYaz(1, alt);
    strncpy(sonAlt, alt, 16);
    sonAlt[16] = '\\0';
  }
}

void mesajGoster(const char* ust, const char* alt) {
  strncpy(mesajUst, ust, 16);
  mesajUst[16] = '\\0';
  strncpy(mesajAlt, alt, 16);
  mesajAlt[16] = '\\0';
  mesajVar = true;
  mesajBitis = millis() + MESAJ_SURESI;
}

// ---- Kilit mantığı ----
void girisiTemizle() {
  hane = 0;
  girilen[0] = '\\0';
}

void erisimVer(const char* yontem) {
  durum = ACIK;
  yanlis = 0;
  mesajVar = false;
  girisiTemizle();
  kilit.write(ACIK_ACI);
  acikBitis = millis() + ACIK_SURESI;
  tone(BUZZER, 2000, 300);
  Serial.print("ACIK (");
  Serial.print(yontem);
  Serial.println(")");
}

void kilitle() {
  durum = KILITLI;
  kilit.write(KILIT_ACI);
  Serial.println("KILITLI");
}

void bloke() {
  durum = BLOKE;
  mesajVar = false;
  girisiTemizle();
  blokBitis = millis() + BLOK_SURESI;
  tone(BUZZER, 300, 1000);
  Serial.println("BLOKE 30 sn");
}

void erisimReddet(const char* yontem) {
  yanlis++;
  girisiTemizle();
  Serial.print("YANLIS ");
  Serial.print(yontem);
  Serial.print(" ");
  Serial.print(yanlis);
  Serial.print("/");
  Serial.println(AZAMI_YANLIS);
  if (yanlis >= AZAMI_YANLIS) {
    bloke();
    return;
  }
  tone(BUZZER, 400, 500);
  char alt[17];
  snprintf(alt, sizeof(alt), "Kalan hak: %d", AZAMI_YANLIS - yanlis);
  mesajGoster(strcmp(yontem, "PIN") == 0 ? "YANLIS PIN" : "YETKISIZ KART", alt);
}

void pinOnayla() {
  if (hane < PIN_UZUNLUK) {
    mesajGoster("PIN 4 haneli", "olmali");
    return;
  }
  if (pinEsit(ADR_KULLANICI_PIN, girilen)) erisimVer("PIN");
  else erisimReddet("PIN");
}

void kartIsle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (durum != KILITLI) { Serial.println("YOKSAYILDI"); return; }
  if (kartBul(uid) >= 0) erisimVer("KART");
  else erisimReddet("KART");
}

void tuslariIsle(unsigned long simdi) {
  char tus = tusTakimi.getKey();
  if (!tus) return;
  if (durum != KILITLI) return;                    // açıkken ve blokeyken tuşlar yok sayılır
  sonTus = simdi;
  mesajVar = false;
  if (tus >= '0' && tus <= '9') {
    if (hane < PIN_UZUNLUK) {
      girilen[hane] = tus;
      hane++;
      girilen[hane] = '\\0';
      tone(BUZZER, 1000, 40);
    }
  } else if (tus == '*') {
    if (hane > 0) {
      hane--;
      girilen[hane] = '\\0';
      tone(BUZZER, 700, 40);
    }
  } else if (tus == '#') {
    pinOnayla();
  }
}

// ---- Seri komutlar (kart taklidi + yönetim) ----
void komutIsle(char* s) {
  char* alan[3];
  int adet = 0;
  alan[adet++] = s;
  for (char* p = s; *p != '\\0' && adet < 3; p++) {
    if (*p == ':') {
      *p = '\\0';
      alan[adet++] = p + 1;
    }
  }

  if (strcmp(alan[0], "KART") == 0 && adet == 2) {
    kartIsle(alan[1]);
  } else if (strcmp(alan[0], "LISTE") == 0 && adet == 1) {
    listele();
  } else if (adet == 3 && (strcmp(alan[0], "EKLE") == 0 || strcmp(alan[0], "SIL") == 0 || strcmp(alan[0], "PINDEGIS") == 0)) {
    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {
      Serial.println("MASTER PIN YANLIS");
    } else if (strcmp(alan[0], "EKLE") == 0) {
      kartEkle(alan[2]);
    } else if (strcmp(alan[0], "SIL") == 0) {
      kartSil(alan[2]);
    } else if (!pinGecerli(alan[2])) {
      Serial.println("PIN 4 rakam olmali");
    } else {
      pinYaz(ADR_KULLANICI_PIN, alan[2]);
      Serial.println("PIN DEGISTI");
    }
  } else {
    Serial.println("Bilinmeyen komut");
  }
}

bool satirOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\\r') continue;
    if (c == '\\n') {
      satir[uzunluk] = '\\0';
      uzunluk = 0;
      return true;
    }
    if (uzunluk < (int)sizeof(satir) - 1) {
      satir[uzunluk] = c;
      uzunluk++;
    }
  }
  return false;
}

// ---- Zamana bağlı işler ----
void durumGuncelle(unsigned long simdi) {
  if (durum == ACIK && doldu(simdi, acikBitis)) {
    kilitle();
  }
  if (durum == BLOKE && doldu(simdi, blokBitis)) {
    yanlis = 0;
    kilitle();
    Serial.println("BLOKE bitti");
  }
  if (durum == KILITLI && hane > 0 && doldu(simdi, sonTus + GIRIS_ZAMAN_ASIMI)) {
    girisiTemizle();
    Serial.println("Giris zaman asimi");
  }
  if (mesajVar && doldu(simdi, mesajBitis)) {
    mesajVar = false;
  }
}

void ledGuncelle(unsigned long simdi) {
  digitalWrite(YESIL, durum == ACIK ? HIGH : LOW);
  if (durum == BLOKE) {
    digitalWrite(KIRMIZI, (simdi / 250) % 2 == 0 ? HIGH : LOW);   // 2 Hz yanıp söner
  } else {
    digitalWrite(KIRMIZI, durum == KILITLI ? HIGH : LOW);
  }
}

void ekranGuncelle(unsigned long simdi) {
  char alt[17];
  if (durum == ACIK) {
    ekran("KAPI ACIK", "Hos geldiniz");
  } else if (durum == BLOKE) {
    unsigned long kalan = (blokBitis - simdi + 999) / 1000;      // yukarı yuvarla
    snprintf(alt, sizeof(alt), "Bekle: %lu sn", kalan);
    ekran("KILITLENDI", alt);
  } else if (mesajVar) {
    ekran(mesajUst, mesajAlt);
  } else if (hane > 0) {
    strcpy(alt, "PIN: ");
    for (int i = 0; i < hane; i++) alt[5 + i] = '*';
    alt[5 + hane] = '\\0';
    ekran("KAPI KILITLI", alt);
  } else {
    ekran("KAPI KILITLI", "PIN veya kart");
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  kilit.attach(SERVO_PIN);
  kilit.write(KILIT_ACI);
  girisiTemizle();

  if (EEPROM.read(ADR_ISARET) != ISARET) {
    fabrikaAyari();
    Serial.println("Fabrika ayari yazildi");
  }

  lcd.init();
  lcd.backlight();
  Serial.println("Akilli kapi hazir");
}

void loop() {
  unsigned long simdi = millis();
  tuslariIsle(simdi);
  if (satirOku() && satir[0] != '\\0') komutIsle(satir);
  durumGuncelle(simdi);
  ledGuncelle(simdi);
  ekranGuncelle(simdi);
}
`

const KAPI_SOL = `// sketch: akilli_kapi
#include <Keypad.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

// ---- Pinler ----
const int SERVO_PIN = 10;
const int BUZZER = 11;
const int KIRMIZI = 12;
const int YESIL = 13;

// ---- Ayarlar ----
const int ACIK_ACI = 90;
const int KILIT_ACI = 0;
const int PIN_UZUNLUK = 4;
const int AZAMI_YANLIS = 3;
const unsigned long ACIK_SURESI = 5000;        // ms
const unsigned long BLOK_SURESI = 3000;        // ms
const unsigned long MESAJ_SURESI = 1500;       // ms
const unsigned long GIRIS_ZAMAN_ASIMI = 10000; // ms: yarım kalan PIN silinir

// ---- EEPROM haritası (64. ders) ----
const int ADR_ISARET = 0;
const int ADR_KULLANICI_PIN = 1;
const int ADR_MASTER_PIN = 5;
const int ADR_KART_SAYISI = 9;
const int ADR_KARTLAR = 10;
const int MAX_KART = 8;
const byte ISARET = 0xA5;

// ---- Nesneler ----
const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo kilit;

// ---- Durum ----
enum Durum { KILITLI, ACIK, BLOKE };
Durum durum = KILITLI;

char girilen[PIN_UZUNLUK + 1];
int hane = 0;
int yanlis = 0;
unsigned long acikBitis = 0;
unsigned long blokBitis = 0;
unsigned long mesajBitis = 0;
unsigned long sonTus = 0;
bool mesajVar = false;
char mesajUst[17];
char mesajAlt[17];
char sonUst[17] = "";
char sonAlt[17] = "";

char satir[40];
int uzunluk = 0;

bool doldu(unsigned long simdi, unsigned long bitis) {
  return (long)(simdi - bitis) >= 0;           // millis() taşsa da doğru
}

// ---- Yardımcılar (63-64. dersler) ----
int hexDeger(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

bool uidCoz(const char* hex, byte uid[4]) {
  if (strlen(hex) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(hex[2 * i]);
    int alcak = hexDeger(hex[2 * i + 1]);
    if (yuksek < 0 || alcak < 0) return false;
    uid[i] = yuksek * 16 + alcak;
  }
  return true;
}

void uidYaz(const byte uid[4]) {
  for (int i = 0; i < 4; i++) {
    if (i > 0) Serial.print(' ');
    if (uid[i] < 16) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
}

bool pinGecerli(const char* s) {
  if (strlen(s) != PIN_UZUNLUK) return false;
  for (int i = 0; i < PIN_UZUNLUK; i++) {
    if (s[i] < '0' || s[i] > '9') return false;
  }
  return true;
}

// ---- EEPROM işlemleri (64. ders) ----
void pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {
  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);
  pin[PIN_UZUNLUK] = '\\0';
}

void pinYaz(int adres, const char* pin) {
  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);
}

bool pinEsit(int adres, const char* girilenPin) {
  char kayitli[PIN_UZUNLUK + 1];
  pinOku(adres, kayitli);
  return strcmp(kayitli, girilenPin) == 0;
}

byte kartSayisi() {
  byte n = EEPROM.read(ADR_KART_SAYISI);
  if (n > MAX_KART) n = 0;
  return n;
}

void kartOku(int sira, byte uid[4]) {
  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);
}

void kartYaz(int sira, const byte uid[4]) {
  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);
}

int kartBul(const byte uid[4]) {
  byte n = kartSayisi();
  for (int i = 0; i < n; i++) {
    byte kayitli[4];
    kartOku(i, kayitli);
    if (memcmp(kayitli, uid, 4) == 0) return i;
  }
  return -1;
}

void fabrikaAyari() {
  pinYaz(ADR_KULLANICI_PIN, "1234");
  pinYaz(ADR_MASTER_PIN, "9999");
  EEPROM.update(ADR_KART_SAYISI, 0);
  EEPROM.update(ADR_ISARET, ISARET);
}

void kartEkle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (kartBul(uid) >= 0) { Serial.println("ZATEN VAR"); return; }
  byte n = kartSayisi();
  if (n >= MAX_KART) { Serial.println("LISTE DOLU"); return; }
  kartYaz(n, uid);
  EEPROM.update(ADR_KART_SAYISI, n + 1);
  Serial.print("EKLENDI (");
  Serial.print(n + 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void kartSil(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  int sira = kartBul(uid);
  if (sira < 0) { Serial.println("BULUNAMADI"); return; }
  byte n = kartSayisi();
  byte son[4];
  kartOku(n - 1, son);
  kartYaz(sira, son);
  EEPROM.update(ADR_KART_SAYISI, n - 1);
  Serial.print("SILINDI (");
  Serial.print(n - 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void listele() {
  byte n = kartSayisi();
  Serial.print("Kart sayisi: ");
  Serial.println(n);
  for (int i = 0; i < n; i++) {
    byte uid[4];
    kartOku(i, uid);
    Serial.print(i + 1);
    Serial.print(": ");
    uidYaz(uid);
    Serial.println();
  }
}

// ---- Ekran ----
void satirYaz(int sira, const char* metin) {
  lcd.setCursor(0, sira);
  int boy = strlen(metin);
  for (int i = 0; i < 16; i++) lcd.print(i < boy ? metin[i] : ' ');
}

void ekran(const char* ust, const char* alt) {      // yalnız değişen satırı yeniden yazar
  if (strcmp(ust, sonUst) != 0) {
    satirYaz(0, ust);
    strncpy(sonUst, ust, 16);
    sonUst[16] = '\\0';
  }
  if (strcmp(alt, sonAlt) != 0) {
    satirYaz(1, alt);
    strncpy(sonAlt, alt, 16);
    sonAlt[16] = '\\0';
  }
}

void mesajGoster(const char* ust, const char* alt) {
  strncpy(mesajUst, ust, 16);
  mesajUst[16] = '\\0';
  strncpy(mesajAlt, alt, 16);
  mesajAlt[16] = '\\0';
  mesajVar = true;
  mesajBitis = millis() + MESAJ_SURESI;
}

// ---- Kilit mantığı ----
void girisiTemizle() {
  hane = 0;
  girilen[0] = '\\0';
}

void erisimVer(const char* yontem) {
  durum = ACIK;
  yanlis = 0;
  mesajVar = false;
  girisiTemizle();
  kilit.write(ACIK_ACI);
  acikBitis = millis() + ACIK_SURESI;
  tone(BUZZER, 2000, 300);
  Serial.print("ACIK (");
  Serial.print(yontem);
  Serial.println(")");
}

void kilitle() {
  durum = KILITLI;
  kilit.write(KILIT_ACI);
  Serial.println("KILITLI");
}

void bloke() {
  durum = BLOKE;
  mesajVar = false;
  girisiTemizle();
  blokBitis = millis() + BLOK_SURESI;
  tone(BUZZER, 300, 1000);
  Serial.println("BLOKE 30 sn");
}

void erisimReddet(const char* yontem) {
  yanlis++;
  girisiTemizle();
  Serial.print("YANLIS ");
  Serial.print(yontem);
  Serial.print(" ");
  Serial.print(yanlis);
  Serial.print("/");
  Serial.println(AZAMI_YANLIS);
  if (yanlis >= AZAMI_YANLIS) {
    bloke();
    return;
  }
  tone(BUZZER, 400, 500);
  char alt[17];
  snprintf(alt, sizeof(alt), "Kalan hak: %d", AZAMI_YANLIS - yanlis);
  mesajGoster(strcmp(yontem, "PIN") == 0 ? "YANLIS PIN" : "YETKISIZ KART", alt);
}

void pinOnayla() {
  if (hane < PIN_UZUNLUK) {
    mesajGoster("PIN 4 haneli", "olmali");
    return;
  }
  if (pinEsit(ADR_KULLANICI_PIN, girilen)) erisimVer("PIN");
  else erisimReddet("PIN");
}

void kartIsle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (durum != KILITLI) { Serial.println("YOKSAYILDI"); return; }
  if (kartBul(uid) >= 0) erisimVer("KART");
  else erisimReddet("KART");
}

void tuslariIsle(unsigned long simdi) {
  char tus = tusTakimi.getKey();
  if (!tus) return;
  if (durum != KILITLI) return;                    // açıkken ve blokeyken tuşlar yok sayılır
  sonTus = simdi;
  mesajVar = false;
  if (tus >= '0' && tus <= '9') {
    if (hane < PIN_UZUNLUK) {
      girilen[hane] = tus;
      hane++;
      girilen[hane] = '\\0';
      tone(BUZZER, 1000, 40);
    }
  } else if (tus == '*') {
    if (hane > 0) {
      hane--;
      girilen[hane] = '\\0';
      tone(BUZZER, 700, 40);
    }
  } else if (tus == '#') {
    pinOnayla();
  }
}

// ---- Seri komutlar (kart taklidi + yönetim) ----
void komutIsle(char* s) {
  char* alan[3];
  int adet = 0;
  alan[adet++] = s;
  for (char* p = s; *p != '\\0' && adet < 3; p++) {
    if (*p == ':') {
      *p = '\\0';
      alan[adet++] = p + 1;
    }
  }

  if (strcmp(alan[0], "KART") == 0 && adet == 2) {
    kartIsle(alan[1]);
  } else if (strcmp(alan[0], "LISTE") == 0 && adet == 1) {
    listele();
  } else if (adet == 3 && (strcmp(alan[0], "EKLE") == 0 || strcmp(alan[0], "SIL") == 0 || strcmp(alan[0], "PINDEGIS") == 0)) {
    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {
      Serial.println("MASTER PIN YANLIS");
    } else if (strcmp(alan[0], "EKLE") == 0) {
      kartEkle(alan[2]);
    } else if (strcmp(alan[0], "SIL") == 0) {
      kartSil(alan[2]);
    } else if (!pinGecerli(alan[2])) {
      Serial.println("PIN 4 rakam olmali");
    } else {
      pinYaz(ADR_KULLANICI_PIN, alan[2]);
      Serial.println("PIN DEGISTI");
    }
  } else {
    Serial.println("Bilinmeyen komut");
  }
}

bool satirOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\\r') continue;
    if (c == '\\n') {
      satir[uzunluk] = '\\0';
      uzunluk = 0;
      return true;
    }
    if (uzunluk < (int)sizeof(satir) - 1) {
      satir[uzunluk] = c;
      uzunluk++;
    }
  }
  return false;
}

// ---- Zamana bağlı işler ----
void durumGuncelle(unsigned long simdi) {
  if (durum == ACIK && doldu(simdi, acikBitis)) {
    kilitle();
  }
  if (durum == BLOKE && doldu(simdi, blokBitis)) {
    yanlis = 0;
    kilitle();
    Serial.println("BLOKE bitti");
  }
  if (durum == KILITLI && hane > 0 && doldu(simdi, sonTus + GIRIS_ZAMAN_ASIMI)) {
    girisiTemizle();
    Serial.println("Giris zaman asimi");
  }
  if (mesajVar && doldu(simdi, mesajBitis)) {
    mesajVar = false;
  }
}

void ledGuncelle(unsigned long simdi) {
  digitalWrite(YESIL, durum == ACIK ? HIGH : LOW);
  if (durum == BLOKE) {
    digitalWrite(KIRMIZI, (simdi / 250) % 2 == 0 ? HIGH : LOW);   // 2 Hz yanıp söner
  } else {
    digitalWrite(KIRMIZI, durum == KILITLI ? HIGH : LOW);
  }
}

void ekranGuncelle(unsigned long simdi) {
  char alt[17];
  if (durum == ACIK) {
    ekran("KAPI ACIK", "Hos geldiniz");
  } else if (durum == BLOKE) {
    unsigned long kalan = (blokBitis - simdi + 999) / 1000;      // yukarı yuvarla
    snprintf(alt, sizeof(alt), "Bekle: %lu sn", kalan);
    ekran("KILITLENDI", alt);
  } else if (mesajVar) {
    ekran(mesajUst, mesajAlt);
  } else if (hane > 0) {
    strcpy(alt, "PIN: ");
    for (int i = 0; i < hane; i++) alt[5 + i] = '*';
    alt[5 + hane] = '\\0';
    ekran("KAPI KILITLI", alt);
  } else {
    ekran("KAPI KILITLI", "PIN veya kart");
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  kilit.attach(SERVO_PIN);
  kilit.write(KILIT_ACI);
  girisiTemizle();

  if (EEPROM.read(ADR_ISARET) != ISARET) {
    fabrikaAyari();
    Serial.println("Fabrika ayari yazildi");
  }

  lcd.init();
  lcd.backlight();
  Serial.println("Akilli kapi hazir");
}

void loop() {
  unsigned long simdi = millis();
  tuslariIsle(simdi);
  if (satirOku() && satir[0] != '\\0') komutIsle(satir);
  durumGuncelle(simdi);
  ledGuncelle(simdi);
  ekranGuncelle(simdi);
}
`


// ---------------------------------------------------------------- Ders 61: IR alıcı ve kumanda kodları
// Laboratuvarda IR alıcı parçası yok: darbe ölçme fikri bir butonla denenir (boşta HIGH, basılıyken LOW).
const DARBE_STARTER = `// Butona basılı kaldığın süreyi pulseIn ile mikrosaniye (µs) olarak ölç.
const int DARBE_PIN = 2;

void setup() {
  Serial.begin(9600);
  // D2'yi dahili pull-up'lı giriş yap
}

void loop() {
  // pulseIn ile D2'nin LOW kaldığı süreyi ölç (zaman aşımı: 3000000 µs)
  // süre 0'dan büyükse "Darbe: ... us" biçiminde yazdır
}
`

const DARBE_SOLUTION = `const int DARBE_PIN = 2;

void setup() {
  Serial.begin(9600);
  pinMode(DARBE_PIN, INPUT_PULLUP);
}

void loop() {
  unsigned long sure = pulseIn(DARBE_PIN, LOW, 3000000);   // LOW darbenin süresi (µs)
  if (sure > 0) {
    Serial.print("Darbe: ");
    Serial.print(sure);
    Serial.println(" us");
  }
}
`

const darbeCircuit = (): Circuit => {
  const c = unoOnly()
  c.parts.push(part('btn', 'button', 360, 80))
  w(c, ['btn', 'A'], ['uno', 'D2']); w(c, ['btn', 'B'], ['uno', 'GND'])
  return c
}

/** Seri çıktıdaki en büyük sayı (µs ölçümü için). */
const enBuyukSayi = (ctx: LabGoalCtx) => Math.max(0, ...(serialOf(ctx).match(/\d+/g) ?? []).map(Number))

const irDarbe: LabActivity = {
  intro: 'Laboratuvarda IR alıcı yok; ama IR alıcının çıkışı da bir butonla aynı çalışır: boşta HIGH, darbe varken LOW. Butonu D2’ye bağla ve butona basılı kaldığın süreyi pulseIn ile mikrosaniye olarak ölç. Butona basılı tutmak için fareyi buton üzerinde basılı tut.',
  starter: () => ({ circuit: unoOnly(), code: DARBE_STARTER }),
  allowedParts: ['button'],
  goals: [
    {
      id: 'buton',
      text: 'Tuvale bir buton ekle.',
      hint: '"Parça ekle" menüsünden butonu seç.',
      check: ({ circuit }) => partsOf(circuit, 'button').length >= 1,
    },
    {
      id: 'baglanti',
      text: 'Butonun bir ucunu D2’ye, öbür ucunu GND’ye bağla.',
      hint: 'A → D2, B → GND. Buton basılınca D2 toprağa bağlanır ve LOW okur.',
      check: (ctx) => buttonOnPin(ctx, 'D2'),
    },
    {
      id: 'pullup',
      text: 'Kodda D2’yi INPUT_PULLUP ile giriş yap.',
      hint: 'setup() içinde pinMode(DARBE_PIN, INPUT_PULLUP); yaz. Pull-up olmazsa boştaki pin HIGH okumaz.',
      check: ({ code }) => /pinMode\s*\([^)]*INPUT_PULLUP\s*\)/.test(noComments(code)),
    },
    {
      id: 'pulsein',
      text: 'Kodda pulseIn ile LOW darbenin süresini ölç.',
      hint: 'unsigned long sure = pulseIn(DARBE_PIN, LOW, 3000000); LOW, pinin LOW kaldığı süreyi ölçmeni söyler.',
      check: ({ code }) => /pulseIn\s*\([^)]*\bLOW\b/.test(noComments(code)),
    },
    {
      id: 'olcum',
      text: 'Programı çalıştır, butona bas ve bırak: seri monitörde ölçtüğün süre yazsın.',
      hint: '▶’e bas, butona bir an basılı tut. Süre sıfırdan büyükse Serial.println ile yaz. Süre mikrosaniye (1000 µs = 1 ms) cinsindendir.',
      behavior: true,
      check: (ctx) => enBuyukSayi(ctx) >= 1000,
    },
    {
      id: 'uzun',
      text: 'Butonu yarım saniyeden uzun basılı tut: ölçüm 500000 µs’yi geçsin.',
      hint: 'Yarım saniye 500000 µs eder. Butona basılı tut ve bir, iki say. Zaman aşımı değerini (3. parametre) küçük bırakırsan uzun darbe ölçülemez.',
      behavior: true,
      check: (ctx) => enBuyukSayi(ctx) >= 500000,
    },
  ],
  solution: () => ({ circuit: darbeCircuit(), code: DARBE_SOLUTION }),
  scenario: (s) => {
    s.advance(200)
    s.setProp('btn', 'pressed', true)
    s.advance(700)
    s.setProp('btn', 'pressed', false)
    s.advance(200)
  },
}

// ---------------------------------------------------------------- Ders 62: Keypad 4x4, şifre girişi
const keypadCircuit = (): Circuit => {
  const c = unoOnly()
  addKeypad(c, 380, 40)
  addLed(c, 'ledY', 'D13', 'green', 380, 300)
  addLed(c, 'ledK', 'D12', 'red', 380, 380)
  return c
}

const keypadSifre: LabActivity = {
  intro: 'Keypad’i satır ve sütun pinlerine bağla, iki LED ekle. Sonra # ile PIN’i onaylayan onayla() fonksiyonunu yaz: doğru PIN (1234) yeşil, yanlış PIN kırmızı LED yaksın. Keypad’i seç, sağ panelden bir tuş seç: seçili tuş basılı sayılır; Yok dersen bırakılır.',
  starter: () => ({ circuit: unoOnly(), code: KEYPAD_START }),
  allowedParts: ['keypad', 'led', 'resistor'],
  goals: [
    {
      id: 'satirlar',
      text: 'Keypad’in R1, R2, R3, R4 uçlarını sırayla D9, D8, D7, D6’ya bağla.',
      hint: 'Koddaki satirPinleri {9, 8, 7, 6} sırasıyla aynı olmalı: R1 → D9, R2 → D8, R3 → D7, R4 → D6.',
      check: (ctx) => keypadRows(ctx),
    },
    {
      id: 'sutunlar',
      text: 'Keypad’in C1, C2, C3, C4 uçlarını sırayla D5, D4, D3, D2’ye bağla.',
      hint: 'Koddaki sutunPinleri {5, 4, 3, 2} sırasıyla aynı olmalı: C1 → D5, C2 → D4, C3 → D3, C4 → D2.',
      check: (ctx) => keypadCols(ctx),
    },
    {
      id: 'yesil-led',
      text: 'Bir LED’i D13’e direnç üzerinden bağla (D13 → direnç → LED A, LED K → GND).',
      hint: 'LED’in uzun bacağı A (anot) ucudur. LED’i dirençsiz bağlarsan laboratuvar uyarı verir.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'kirmizi-led',
      text: 'İkinci bir LED’i D12’ye direnç üzerinden bağla.',
      hint: 'Aynı bağlantı: D12 → direnç → LED A, LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D12'),
    },
    {
      id: 'dogru-pin',
      text: 'Doğru PIN’i gir (1 2 3 4 ve #): D13’teki LED yansın.',
      hint: 'Keypad’i seç, Basılı tuş listesinden sırayla 1, 2, 3, 4 ve # seç; her tuştan sonra Yok’a al. onayla() içinde strcmp(girilen, DOGRU_PIN) == 0 ise digitalWrite(YESIL, HIGH) yap.',
      behavior: true,
      check: (ctx) => ledToggled(ctx, 'D13'),
    },
    {
      id: 'yanlis-pin',
      text: 'Yanlış bir PIN gir (örneğin 0 0 0 0 ve #): D12’deki LED yansın.',
      hint: 'PIN doğru değilse yanlisSayisi’ni artır ve digitalWrite(KIRMIZI, HIGH) yap.',
      behavior: true,
      check: (ctx) => ledToggled(ctx, 'D12'),
    },
  ],
  solution: () => ({ circuit: keypadCircuit(), code: KEYPAD_FULL }),
  scenario: (s) => {
    s.advance(100)
    yaz(s, '0000#')          // yanlış: kırmızı
    s.advance(1100)
    yaz(s, '1234#')          // doğru: yeşil
    s.advance(300)
  },
}

// ---------------------------------------------------------------- Ders 63: RFID RC522 (kart seri porttan taklit edilir)
const kartCircuit = (): Circuit => {
  const c = unoOnly()
  addLed(c, 'ledY', 'D13', 'green', 380, 60)
  addLed(c, 'ledK', 'D12', 'red', 380, 140)
  return c
}

const kartTaklit: LabActivity = {
  intro: 'Laboratuvarda RC522 yok; kartı seri monitörden taklit edeceğiz. İki LED’i bağla, programı çalıştır, seri monitöre KART:AABBCCDD yazıp Gönder’e bas. Karar kısmını (yetkili mi, yetkisiz mi) sen yaz.',
  starter: () => ({ circuit: unoOnly(), code: KART_START }),
  allowedParts: ['led', 'resistor'],
  goals: [
    {
      id: 'yesil-led',
      text: 'Bir LED’i D13’e direnç üzerinden bağla (D13 → direnç → LED A, LED K → GND).',
      hint: 'LED’in uzun bacağı A (anot) ucudur.',
      check: (ctx) => ledOnPin(ctx, 'D13'),
    },
    {
      id: 'kirmizi-led',
      text: 'İkinci bir LED’i D12’ye direnç üzerinden bağla.',
      hint: 'Aynı bağlantı: D12 → direnç → LED A, LED K → GND.',
      check: (ctx) => ledOnPin(ctx, 'D12'),
    },
    {
      id: 'yetkili',
      text: 'Yetkili kartı okut (KART:AABBCCDD): D13’teki LED yansın ve seri monitörde YETKILI yazsın.',
      hint: 'Programı ▶ ile çalıştır, kutuya KART:AABBCCDD yaz, Gönder’e bas. Kodda memcmp(uid, YETKILI_UID, 4) == 0 ise "YETKILI" yaz ve digitalWrite(YESIL, HIGH) yap.',
      behavior: true,
      check: (ctx) => ledToggled(ctx, 'D13') && /\bYETKILI\b/.test(serialOf(ctx)),
    },
    {
      id: 'yetkisiz',
      text: 'Başka bir kart okut (örneğin KART:11223344): D12’deki LED yansın ve YETKISIZ yazsın.',
      hint: 'Aksi durumda "YETKISIZ" yaz ve digitalWrite(KIRMIZI, HIGH) yap.',
      behavior: true,
      check: (ctx) => ledToggled(ctx, 'D12') && /\bYETKISIZ\b/.test(serialOf(ctx)),
    },
    {
      id: 'bozuk-satir',
      text: 'Bozuk bir satır gönder (örneğin KART:ZZZZZZZZ): program Gecersiz satir desin.',
      hint: 'Bozuk satır kapıyı açmamalı. KART: önekini bozabilir ya da onaltılık olmayan harf yazabilirsin.',
      behavior: true,
      check: (ctx) => /Gecersiz satir/.test(serialOf(ctx)),
    },
  ],
  solution: () => ({ circuit: kartCircuit(), code: KART_FULL }),
  scenario: (s) => {
    s.advance(100)
    komut(s, 'KART:11223344', 100)
    komut(s, 'KART:AABBCCDD', 100)
    komut(s, 'KART:ZZZZZZZZ', 100)
  },
}

// ---------------------------------------------------------------- Ders 64: Yetki yönetimi (seri komutlar + EEPROM)
const yetkiYonetimi: LabActivity = {
  intro: 'Bu derste devre yok: Uno ve seri monitör yeterli. Program çalışırken kutuya komutları yaz ve Gönder’e bas (EKLE:9999:AABBCCDD gibi). Kod, kartSil() fonksiyonu hariç hazır; onu sen tamamla. Laboratuvarda EEPROM, durdurup yeniden başlatınca sıfırlanır.',
  starter: () => ({ circuit: unoOnly(), code: YETKI_START }),
  allowedParts: [],
  goals: [
    {
      id: 'master-yanlis',
      text: 'Yanlış master PIN ile bir kart eklemeyi dene (EKLE:0000:AABBCCDD): MASTER PIN YANLIS yazsın.',
      hint: '▶ ile çalıştır, kutuya komutu yaz ve Gönder’e bas. Yönetim komutları önce master PIN’i (9999) denetler.',
      behavior: true,
      check: (ctx) => /MASTER PIN YANLIS/.test(serialOf(ctx)),
    },
    {
      id: 'eklendi',
      text: 'Doğru master PIN ile bir kart ekle (EKLE:9999:AABBCCDD): EKLENDI yazsın.',
      hint: 'Komut: EKLE:9999:AABBCCDD. Kart eklenince EKLENDI (1/8) görürsün.',
      behavior: true,
      check: (ctx) => /EKLENDI \(\d+\/\d+\)/.test(serialOf(ctx)),
    },
    {
      id: 'yetkili',
      text: 'Eklediğin kartı okut (KART:AABBCCDD): YETKILI yazsın.',
      hint: 'Komut: KART:AABBCCDD. Kart listede varsa YETKILI, yoksa YETKISIZ çıkar.',
      behavior: true,
      check: (ctx) => /\bYETKILI\b/.test(serialOf(ctx)),
    },
    {
      id: 'silindi',
      text: 'kartSil() fonksiyonunu yaz, bir kartı sil (SIL:9999:...): SILINDI yazsın.',
      hint: 'uidCoz ile UID’yi çöz, kartBul ile sırasını bul, son kartı kartYaz ile o sıraya kopyala, EEPROM.update ile sayacı bir azalt ve "SILINDI (n/8)" yaz.',
      behavior: true,
      check: (ctx) => /SILINDI \(\d+\/\d+\)/.test(serialOf(ctx)),
    },
    {
      id: 'silinen-yetkisiz',
      text: 'Sildiğin kartı okut: artık YETKISIZ yazsın.',
      hint: 'Önce kartı SIL ile sil, sonra KART: komutuyla aynı UID’yi gönder. Silme gerçekten çalıştıysa YETKISIZ çıkar.',
      behavior: true,
      check: (ctx) => /SILINDI[\s\S]*YETKISIZ/.test(serialOf(ctx)),
    },
    {
      id: 'pin-degisti',
      text: 'Kullanıcı PIN’ini değiştir (PINDEGIS:9999:4321): PIN DEGISTI yazsın.',
      hint: 'Komut: PINDEGIS:9999:4321. Yeni PIN tam 4 rakam olmalı.',
      behavior: true,
      check: (ctx) => /PIN DEGISTI/.test(serialOf(ctx)),
    },
  ],
  solution: () => ({ circuit: unoOnly(), code: YETKI_FULL }),
  scenario: (s) => {
    s.advance(200)
    komut(s, 'EKLE:0000:AABBCCDD')
    komut(s, 'EKLE:9999:AABBCCDD')
    komut(s, 'KART:AABBCCDD')
    komut(s, 'EKLE:9999:01020304')
    komut(s, 'SIL:9999:01020304')
    komut(s, 'KART:01020304')
    komut(s, 'PINDEGIS:9999:4321')
  },
}

// ---------------------------------------------------------------- Ders 65: Proje, akıllı kapı kilidi
const kapiCircuit = (): Circuit => {
  const c = unoOnly()
  addKeypad(c, 400, 20)
  c.parts.push(part('kilit', 'servo', 400, 300), part('bz', 'buzzer', 400, 400), part('lcd', 'lcdI2c', 620, 300, { address: '0x27' }))
  w(c, ['kilit', 'SIG'], ['uno', 'D10']); w(c, ['kilit', 'VCC'], ['uno', '5V']); w(c, ['kilit', 'GND'], ['uno', 'GND'])
  w(c, ['bz', '+'], ['uno', 'D11']); w(c, ['bz', '-'], ['uno', 'GND2'])
  w(c, ['lcd', 'GND'], ['uno', 'GND3']); w(c, ['lcd', 'VCC'], ['uno', '5V']); w(c, ['lcd', 'SDA'], ['uno', 'A4']); w(c, ['lcd', 'SCL'], ['uno', 'A5'])
  addLed(c, 'ledK', 'D12', 'red', 400, 480)
  addLed(c, 'ledY', 'D13', 'green', 400, 560)
  return c
}

const akilliKapi: LabActivity = {
  intro: 'Haftanın projesi: keypad, servo, buzzer, iki LED ve I2C LCD’yi bağla; hazır programı çalıştır. Önce her parçayı koddaki pine bağla. Keypad’i seçip Basılı tuş listesinden tuşlara bas (her tuştan sonra Yok); kartı seri monitöre KART:... yazarak taklit et.',
  starter: () => ({ circuit: unoOnly(), code: KAPI_FULL }),
  allowedParts: ['keypad', 'servo', 'buzzer', 'led', 'resistor', 'lcdI2c'],
  goals: [
    {
      id: 'keypad',
      text: 'Keypad’i bağla: R1-R4 → D9, D8, D7, D6; C1-C4 → D5, D4, D3, D2.',
      hint: 'Koddaki satirPinleri {9, 8, 7, 6} ve sutunPinleri {5, 4, 3, 2} sırasıyla aynı olmalı.',
      check: (ctx) => keypadRows(ctx) && keypadCols(ctx),
    },
    {
      id: 'servo',
      text: 'Servoyu bağla: SIG → D10, VCC → 5V, GND → GND.',
      hint: 'Besleme eksikse servo hareket etmez. Sinyal pini koddaki SERVO_PIN (10) ile aynı olmalı.',
      check: (ctx) => partsOf(ctx.circuit, 'servo').some((s) => toUno(ctx, s.id, 'SIG', 'D10') && to5V(ctx, s.id, 'VCC') && toGnd(ctx, s.id, 'GND')),
    },
    {
      id: 'buzzer',
      text: 'Buzzerin + ucunu D11’e, - ucunu GND’ye bağla.',
      hint: 'tone() pasif buzzerle çalışır: buzzerin Tür özelliği "Pasif" olsun.',
      check: (ctx) => partsOf(ctx.circuit, 'buzzer').some((b) => toUno(ctx, b.id, '+', 'D11') && toGnd(ctx, b.id, '-')),
    },
    {
      id: 'ledler',
      text: 'İki LED bağla: kırmızı D12’ye, yeşil D13’e, ikisi de direnç üzerinden (LED K → GND).',
      hint: 'D12 → direnç → LED A, LED K → GND. Aynısını D13 için de yap. LED dirençsiz olursa laboratuvar uyarı verir.',
      check: (ctx) => ledOnPin(ctx, 'D12') && ledOnPin(ctx, 'D13'),
    },
    {
      id: 'lcd',
      text: 'I2C LCD’yi bağla: SDA → A4, SCL → A5, VCC → 5V, GND → GND.',
      hint: 'LCD’nin adresi 0x27 olmalı (koddaki LiquidCrystal_I2C lcd(0x27, 16, 2) ile aynı).',
      check: (ctx) => partsOf(ctx.circuit, 'lcdI2c').some((l) => toUno(ctx, l.id, 'SDA', 'A4') && toUno(ctx, l.id, 'SCL', 'A5') && to5V(ctx, l.id, 'VCC') && toGnd(ctx, l.id, 'GND')),
    },
    {
      id: 'kapi-acik',
      text: 'Doğru PIN’i gir (1 2 3 4 ve #): servo 90° dönsün, kapı açılsın.',
      hint: 'Keypad’i seçip Basılı tuş listesinden 1, 2, 3, 4 ve # seç; her tuştan sonra Yok’a al. Fabrika PIN’i 1234’tür. Servo dönmüyorsa VCC ve GND kablolarına bak.',
      behavior: true,
      check: ({ lab }) => Object.values(lab?.parts ?? {}).some((p) => p.servo?.attached && p.servo.angleDeg >= 80),
    },
    {
      id: 'bloke',
      text: 'Üç yanlış deneme yap (örneğin KART:11223344 üç kez): kapı bloke olsun, seri monitörde BLOKE yazsın.',
      hint: 'Yanlış PIN ve yetkisiz kart ortak sayılır. Üçüncü yanlışta kapı 30 saniye hiçbir girişi kabul etmez.',
      behavior: true,
      check: (ctx) => /BLOKE 30 sn/.test(serialOf(ctx)),
    },
  ],
  // Test hızı için çözümde bloke süresi 3 sn (derste 30 sn); hedefler aynıdır.
  solution: () => ({ circuit: kapiCircuit(), code: KAPI_SOL }),
  scenario: (s) => {
    s.advance(2000)
    for (let i = 0; i < 3; i++) komut(s, 'KART:11223344', 100)   // 3 yanlış: BLOKE
    s.advance(3500)                                               // bloke biter (testte 3 sn)
    yaz(s, '1234#')                                               // doğru PIN: kapı açılır
    s.advance(500)
  },
}

export const m4h6Activities: Record<string, LabActivity> = {
  'sensorler-ve-projeler:6:1': irDarbe,
  'sensorler-ve-projeler:6:2': keypadSifre,
  'sensorler-ve-projeler:6:3': kartTaklit,
  'sensorler-ve-projeler:6:4': yetkiYonetimi,
  'sensorler-ve-projeler:6:5': akilliKapi,
}
