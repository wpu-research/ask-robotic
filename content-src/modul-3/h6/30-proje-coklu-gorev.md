# Proje: Çoklu görev paneli
süre: 35

## Merak
Bir arabanın panelinde aynı anda gösterge ışığı yanıp söner, sürücü butona basar, gerekirse uyarı sesi çalar. Tek bir işlemci bunların hepsini nasıl aynı anda yapar? Bu projede öğrendiklerinle bunu kuracaksın: `millis`, durum makinesi ve kesme tek bir panelde.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| LED 1 (nabız, yeşil) + 330 Ω | **D13** → direnç → LED anodu; katot → GND |
| LED 2 (alarm, kırmızı) + 330 Ω | **D12** → direnç → LED anodu; katot → GND |
| Buzzer (pasif) | Artı bacağı **D8**, öbür bacağı GND |
| Buton 1 (MOD) | **D2** ile GND arası (`INPUT_PULLUP`) |
| Buton 2 (SUSTUR) | **D3** ile GND arası (`INPUT_PULLUP`) |

### Görevler
Panel üç iş yapar ve hepsi aynı anda sürer:
1. **Nabız LED'i (D13):** moda göre hızı değişir.
2. **Mod değişimi (D2, kesme):** her basışta BEKLE → CALISIR → ALARM → BEKLE.
3. **Zamanlı buzzer (D8):** BEKLE'de sessiz; CALISIR'da her 2 saniyede 0,1 saniyelik tek bip; ALARM'da 0,2 sn çalıp 0,2 sn susan 2 kHz uyarı.

| Mod | D13 LED | D12 LED | Buzzer |
|---|---|---|---|
| BEKLE | 1000 ms'de bir değişir (0,5 Hz) | söner | sessiz |
| CALISIR | 250 ms'de bir değişir (2 Hz) | söner | 2 sn'de bir 100 ms'lik 1 kHz bip |
| ALARM | 100 ms'de bir değişir (5 Hz) | yanar | 200 ms çalar, 200 ms susar (2 kHz) |

ALARM modundan iki yolla çıkılır: SUSTUR butonuna (D3) basarsan ya da 5 saniye geçerse BEKLE'ye dönülür.

### Program
```cpp
// sketch: coklu_gorev_paneli
const int LED_NABIZ = 13;
const int LED_ALARM = 12;
const int BUZZER = 8;
const int BTN_SUSTUR = 3;

enum Mod { BEKLE, CALISIR, ALARM };
Mod mod = BEKLE;

volatile bool modIstegi = false;           // ISR ile loop arasında paylaşılır
volatile unsigned long sonKesme = 0;

unsigned long ledZaman = 0;
unsigned long buzzerZaman = 0;
unsigned long modBasi = 0;
bool ledYanik = false;
bool buzzerAcik = false;

void modTusu() {                           // ISR: kısa tut
  unsigned long simdi = millis();
  if (simdi - sonKesme > 50) {             // sıçrama koruması
    modIstegi = true;
    sonKesme = simdi;
  }
}

void modGec(int yeni) {
  mod = (Mod)yeni;
  modBasi = millis();
  ledZaman = modBasi;
  buzzerZaman = modBasi;
  ledYanik = false;
  buzzerAcik = false;
  digitalWrite(LED_NABIZ, LOW);
  noTone(BUZZER);
}

void buzzerYonet(unsigned long simdi, unsigned long acikSure,
                 unsigned long kapaliSure, int frekans) {
  if (buzzerAcik) {
    if (simdi - buzzerZaman >= acikSure) {
      noTone(BUZZER);
      buzzerAcik = false;
      buzzerZaman = simdi;
    }
  } else if (simdi - buzzerZaman >= kapaliSure) {
    tone(BUZZER, frekans);
    buzzerAcik = true;
    buzzerZaman = simdi;
  }
}

void setup() {
  pinMode(LED_NABIZ, OUTPUT);
  pinMode(LED_ALARM, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(BTN_SUSTUR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), modTusu, FALLING);
}

void loop() {
  unsigned long simdi = millis();

  // 1) Mod değişimi (kesmeden gelen istek)
  if (modIstegi) {
    modIstegi = false;
    modGec((mod + 1) % 3);
  }

  // 2) ALARM'dan çıkış: SUSTUR butonu ya da 5 sn dolması
  if (mod == ALARM) {
    if (digitalRead(BTN_SUSTUR) == LOW || simdi - modBasi >= 5000) {
      modGec(BEKLE);
    }
  }

  // 3) Nabız LED'i
  unsigned long aralik = 1000;
  if (mod == CALISIR) aralik = 250;
  if (mod == ALARM) aralik = 100;
  if (simdi - ledZaman >= aralik) {
    ledZaman = simdi;
    ledYanik = !ledYanik;
    digitalWrite(LED_NABIZ, ledYanik);
  }

  // 4) Alarm LED'i
  digitalWrite(LED_ALARM, mod == ALARM ? HIGH : LOW);

  // 5) Zamanlı buzzer
  switch (mod) {
    case BEKLE:
      break;                               // sessiz
    case CALISIR:
      buzzerYonet(simdi, 100, 1900, 1000);
      break;
    case ALARM:
      buzzerYonet(simdi, 200, 200, 2000);
      break;
  }
}
```

### Nasıl çalışıyor?
1. **Hiç `delay` yok.** Her görevin kendi zaman değişkeni var (`ledZaman`, `buzzerZaman`, `modBasi`).
2. **Mod bir durum makinesidir.** `mod` değişkeni hangi hâlde olduğumuzu tutar; geçişler `modGec()` içinde yapılır ve zaman sayaçlarını sıfırlar.
3. **MOD butonu kesmeyle okunur.** ISR yalnızca bir bayrak kaldırır; asıl iş `loop()`'ta yapılır. Buzzer çalarken ya da LED beklerken bile basış kaçmaz.
4. **Buzzer da bir küçük durum makinesidir:** "açık" ve "kapalı" iki hâli var, süreleri ayrı ayrı verilir.
5. SUSTUR butonu `loop()` içinde `digitalRead` ile okunur. Her tur çok hızlı döndüğü için bu da yeterlidir; iki yöntemi karşılaştır.

### Ek: Kontrol kopunca ne olur?
Hyvex gibi uzaktan kumandalı sistemlerde kumandanın ya da kablosuz bağlantının kopması gerçek bir risktir. Son komut "motoru çalıştır" idiyse ve bağlantı kesilirse motor sonsuza kadar dönmeye devam edebilir. Çözüm: komutlar düzenli gelmelidir; belli bir süre komut gelmezse çıkış **kendiliğinden kapanmalıdır**. Buna yazılımla "zaman aşımı" ya da "watchdog" mantığı denir. Aşağıdaki sketch, seri porttan `1` komutu geldikçe D7 çıkışını (motor/röle pini) açık tutar; 700 ms komut gelmezse kapatır. `millis` ile yazıldığı için `delay` kullanmaz. (Arduino'nun işlemcisinde ayrıca donanım watchdog zamanlayıcısı da vardır; bu ders kapsamında yalnızca yazılım yöntemini işliyoruz.)

```cpp
// sketch: komut_zaman_asimi
const unsigned long ZAMAN_ASIMI = 700;   // ms
unsigned long sonKomut = 0;
bool cikisAcik = false;

void setup() {
  pinMode(7, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '1') {                      // "çalış" komutu: çıkışı aç, sayacı yenile
      cikisAcik = true;
      sonKomut = millis();
      digitalWrite(7, HIGH);
    } else if (c == '0') {               // "dur" komutu
      cikisAcik = false;
      digitalWrite(7, LOW);
    }
  }

  if (cikisAcik && millis() - sonKomut >= ZAMAN_ASIMI) {
    cikisAcik = false;                   // komut kesildi: güvenli duruma geç
    digitalWrite(7, LOW);
    Serial.println("Komut yok: cikis kapandi");
  }
}
```
Gerçek bir motoru D7'ye doğrudan bağlama; transistör ya da sürücü (22. ve 23. dersler) kullan. Röle ile yalnızca düşük gerilim ve yetişkin gözetiminde çalış.

### Dene
- CALISIR modunda bip süresini 50 ms yap. Bip hâlâ duyuluyor mu?
- ALARM'ı zaman aşımı yerine yalnızca SUSTUR butonuyla bitir. Bu durumda dönmeyi unutan bir kullanıcı için ne olur?
- Panele dördüncü bir mod ekle (örneğin SESSIZ: LED yanar, buzzer susar).

### Sık yapılan hatalar
- ISR içinde `Serial.print` ya da `delay` kullanmak.
- `modIstegi` ve `sonKesme` değişkenlerinden `volatile`'ı çıkarmak.
- Mod değişince zaman sayaçlarını sıfırlamamak: yeni modun ilk bip ya da yanıp sönmesi yanlış zamanda olur.
- `tone()` çalarken `noTone()` ile kapatmayı unutmak: buzzer susmaz.
- `millis` farkını toplamayla kontrol etmek (taşma tuzağı).

## Konuşalım
Bu panelde en çok hangi görev zamanlamaya duyarlı: LED mi, buzzer mı, buton mu? Yeni bir görev eklemek (örneğin bir sensör okumak) mevcut görevleri nasıl etkiler? Eklediğin işin `loop()`'u yavaşlatmaması için neye dikkat etmelisin?
