# Bitirme projesi: Akıllı oda
süre: 35

## Merak
Sınıfta ışıklar boş odada yanık kalır, fan kimse yokken döner. Akıllı bir oda ise sana sormaz: kimse yoksa tasarruf eder, biri girince ve hava karanlıksa ışığı yakar, ısınınca fanı açar. Bu, modülün bitirme projesi: öğrendiğin sensörleri tek bir durum makinesinde birleştireceksin ve laboratuvarda gördüğünün gerçek devrede nerede farklı olacağını bileceksin.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Hafta 2:** PIR ile hareket algılama ve ısınma süresi (D2).
- **Hafta 3:** DHT22 ile sıcaklık ve nem (D5).
- **Hafta 4:** LDR ile ışık ölçümü ve histerezis (A1).
- **Hafta 5 ve Modül 3:** Röleyle fan kontrolü (D7), histerezis.
- **Hafta 6 ve Modül 3:** `millis()` ile bloklamayan kod, durum makinesi, I2C LCD.
- **Hafta 8:** Gerçek dünya etkilerine karşı savunma: buton sıçraması için bekleme payı (D3), gürültü için eşik histerezisi, sensör arızasında güvenli davranış (fail-safe) ve PIR ısınması.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. "Fan" için küçük bir motor yerine ikinci bir LED kullanıyoruz.

| Parça | Bağlantı |
|---|---|
| PIR | VCC → **5V**, GND → **GND**, OUT → **D2** |
| DHT22 | VCC → **5V**, GND → **GND**, DATA → **D5** (Tür özelliği DHT22) |
| LDR | 1 → **5V**, 2 → **A1** |
| Direnç (10 kΩ) | 1 → **A1**, 2 → **GND** (aydınlıkta A1 yükselir) |
| Röle | VCC → **5V**, GND → **GND**, IN → **D7**; COM → **5V**, NO → fan direncinin 1 ucu |
| Direnç (330 Ω, fan) | 1 → rölenin NO ucu, 2 → "fan" LED'inin A ucu |
| LED ("fan") | A → fan direncinin 2 ucu, K → **GND** |
| Direnç (330 Ω, lamba) | 1 → **D13**, 2 → "lamba" LED'inin A ucu |
| LED ("lamba") | A → lamba direncinin 2 ucu, K → **GND** |
| Buton | A → **D3**, B → **GND** (`INPUT_PULLUP`) |
| I2C LCD 16x2 | GND → **GND**, VCC → **5V**, SDA → **A4**, SCL → **A5** (adres 0x27) |

Laboratuvarda 5V hattı ideal olduğu için fanı karttan beslemek sorun çıkarmaz (73. ders); gerçek devrede çıkarırdı. Güvenlik: bu projede şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; röle yalnızca düşük gerilimli "fan" yükünü anahtarlar.

PIR çıkışı hareket varken HIGH olur ve hareket bittikten sonra bir süre HIGH kalır; laboratuvarda ısınma 2 sn, bekleme 3 sn'dir (41. ders). Gerçek modüllerde bu süreler modele göre değişir. DHT22 okumaları arası en az 2 saniye bırakılmalıdır (46. ders).

### Durum makinesi
| Durum | Lamba | Fan | LCD ışığı | Durumdan çıkış |
|---|---|---|---|---|
| ISINMA | Kapalı | Kapalı | Açık | `ISINMA_SURESI` dolunca BOS. PIR yok sayılır. |
| BOS | Kapalı | Kapalı | **Kapalı** (tasarruf) | PIR hareket görürse DOLU |
| DOLU | Karanlıksa açık | Sıcaksa açık | Açık | Son hareketten `BOS_SURESI` sonra BOS |
| KAPALI | Kapalı | Kapalı | Açık | Buton: KAPALI ile BOS arasında geçiş |

- **Işık:** Yalnızca oda DOLU iken ve karanlıkken yanar. Karanlık/aydınlık kararı **histerezisle** verilir: ADC değeri 300'ün altına inince karanlık, 400'ün üstüne çıkınca aydınlık. İkisi arasında önceki karar korunur (71. ders). Laboratuvarda eşikleri LDR'nin **Işık** özelliğiyle denersin; gerçek odada eşikleri o ortamın ışığına göre kalibre etmen gerekir (73. ders).
- **Fan:** Yalnızca DOLU iken ve sıcaklık 28 °C'a ulaşınca açılır, 26 °C'a inince kapanır.
- **Güvenli varsayılan:** DHT22 okunamıyorsa ya da değer makul aralığın dışındaysa (74. ders) fan **kapalı** kalır ve LCD `DHT HATA` yazar. Bilinmeyen sıcaklıkta fanı açık tutmak yerine kapatmak, Hyvex vakasındaki "kontrol kopunca ne olur?" sorusunun bu projedeki karşılığıdır: tehlikeli ya da masraflı çıkış varsayılan olarak kapalı olur.
- **Süreler:** Derste hızlı denemek için `ISINMA_SURESI` 3 sn, `BOS_SURESI` 8 sn alındı. Laboratuvarın PIR ısınması 2 sn'dir, `ISINMA_SURESI` bunun üstünde olmalıdır. Gerçek modülde ısınma çok daha uzundur ve boş oda süresi dakikalarla ölçülür.

### Program
```cpp
// sketch: akilli_oda
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

const int PIR = 2;
const int DUGME = 3;
const int DHT_PIN = 5;
const int ROLE = 7;
const int LAMBA = 13;
const int LDR = A1;

const unsigned long ISINMA_SURESI = 3000;    // ms (gerçekte çok daha uzun)
const unsigned long BOS_SURESI = 8000;       // ms (gerçekte dakikalar)
const unsigned long OLCUM_ARALIGI = 2000;    // DHT22 için en az 2 sn
const unsigned long EKRAN_ARALIGI = 500;
const int KARANLIK_ALT = 300;                // bunun altı: karanlık
const int AYDINLIK_UST = 400;                // bunun üstü: aydınlık
const float FAN_ACIK = 28.0;
const float FAN_KAPAT = 26.0;

enum Durum { ISINMA, BOS, DOLU, KAPALI };

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT22);

Durum durum = ISINMA;
bool karanlik = false;
bool fan = false;
bool olculdu = false;                // ilk DHT okuması yapıldı mı?
bool sensorTamam = false;
float sicaklik = 0;
float nem = 0;
bool arkaIsik = true;
bool oncekiDugme = false;
unsigned long sonDugme = 0;
unsigned long sonHareket = 0;
unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;

const char *durumAdi() {
  if (durum == ISINMA) return "ISINMA";
  if (durum == BOS) return "BOS   ";
  if (durum == DOLU) return "DOLU  ";
  return "KAPALI";
}

void gec(Durum yeni) {
  durum = yeni;
  Serial.print("durum=");
  Serial.println(durumAdi());
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  if (!olculdu) {
    lcd.print("Olcum bekleniyor");
  } else if (!sensorTamam) {
    lcd.print("DHT HATA        ");
  } else {
    lcd.print("T:");
    lcd.print(sicaklik, 1);
    lcd.print("C N:%");
    lcd.print((int)nem);
    lcd.print("    ");
  }
  lcd.setCursor(0, 1);
  lcd.print(durumAdi());
  lcd.print(" L");
  lcd.print(digitalRead(LAMBA) == HIGH ? 1 : 0);
  lcd.print(" F");
  lcd.print(fan ? 1 : 0);
  lcd.print("   ");
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(DUGME, INPUT_PULLUP);
  pinMode(ROLE, OUTPUT);
  pinMode(LAMBA, OUTPUT);
  digitalWrite(ROLE, LOW);             // varsayılan: kapalı
  digitalWrite(LAMBA, LOW);
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Buton: basıldığı an bir kez, 50 ms sıçrama payıyla
  bool basili = (digitalRead(DUGME) == LOW);
  if (basili && !oncekiDugme && simdi - sonDugme > 50) {
    sonDugme = simdi;
    if (durum == KAPALI) gec(BOS); else gec(KAPALI);
  }
  oncekiDugme = basili;

  // 2) PIR: ısınırken ve kapalıyken yok sayılır
  bool hareket = (digitalRead(PIR) == HIGH);
  if (hareket && (durum == BOS || durum == DOLU)) {
    sonHareket = simdi;
    if (durum == BOS) gec(DOLU);
  }

  // 3) Işık: her turda oku, histerezisle karar ver
  int isik = analogRead(LDR);
  if (!karanlik && isik < KARANLIK_ALT) karanlik = true;
  if (karanlik && isik > AYDINLIK_UST) karanlik = false;

  // 4) Sıcaklık ve nem: iki saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    olculdu = true;
    sensorTamam = !isnan(t) && !isnan(h) && t > -40 && t < 80 && h >= 0 && h <= 100;
    if (sensorTamam) {
      sicaklik = t;
      nem = h;
    }
  }

  // 5) Durum geçişleri (zamana bağlı)
  if (durum == ISINMA && simdi >= ISINMA_SURESI) gec(BOS);
  if (durum == DOLU && simdi - sonHareket >= BOS_SURESI) gec(BOS);

  // 6) Fan: histerezis; sensör bozuksa ya da oda DOLU değilse kapalı
  if (durum != DOLU || !sensorTamam) {
    fan = false;
  } else if (sicaklik >= FAN_ACIK) {
    fan = true;
  } else if (sicaklik <= FAN_KAPAT) {
    fan = false;
  }

  // 7) Çıkışlar
  digitalWrite(LAMBA, (durum == DOLU && karanlik) ? HIGH : LOW);
  digitalWrite(ROLE, fan ? HIGH : LOW);

  // 8) Ekran ve arka ışık: BOS iken ışık kapalı (tasarruf)
  bool arkaIstenen = (durum != BOS);
  if (arkaIstenen != arkaIsik) {
    arkaIsik = arkaIstenen;
    if (arkaIsik) lcd.backlight(); else lcd.noBacklight();
  }
  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranYaz();
  }
}
```

### Nasıl çalışıyor?
1. `loop` hiçbir yerde `delay` kullanmaz; her iş kendi zamanını `millis()` ile tutar (27. ders). Bu sayede buton, PIR ve ışık her turda izlenir, DHT ise iki saniyede bir okunur.
2. Her turda önce **girdiler** (buton, PIR, LDR, DHT), sonra **durum geçişleri**, sonra **çıkışlar** (lamba, röle, ekran) hesaplanır. Çıkışlar durumun doğrudan sonucudur.
3. PIR yalnızca BOS ve DOLU durumlarında dikkate alınır: ısınırken PIR'ın verdiği sahte hareket yok sayılır (41. ders). KAPALI iken de PIR yok sayılır.
4. Fan koşulu açıkça "güvenli taraf" yazılmıştır: oda DOLU değilse ya da sensör geçersizse `fan = false`. Aksi hâlde sıcaklığa bakılır.
5. DHT okuması `isnan` ve aralık kontrolüyle doğrulanır (74. dersteki "değer makul mü" katmanı). Sensör bozuksa son iyi değer ekranda kalmaz; `DHT HATA` yazılır.
6. LCD arka ışığı yalnızca durum değiştiğinde güncellenir; böylece I2C hattı gereksiz meşgul edilmez.

### Uçtan uca denemek
Bu bölümde laboratuvarda sırayla şunları dene; her adımda ne beklediğini önce kendin tahmin et. Parça özelliklerini çalışırken sağ panelden değiştirirsin:
1. ▶'e bas ve ilk 2 sn içinde PIR'ın **Hareket** özelliğini aç-kapa: ısınma sırasında PIR çıkışı parazitli oynar ama durum ISINMA kalmalı, lamba sönük. LCD'nin alt satırı `ISINMA` yazar.
2. 3 sn sonra LDR'nin **Işık** özelliğini 0,2 yap (karanlık). PIR'ın **Hareket** özelliğini aç-kapa: durum DOLU olmalı, lamba yanmalı.
3. **Işık** özelliğini 0,9 yap: lamba sönmeli. Sonra yaklaşık 0,46 yap (ne karanlık ne aydınlık): lamba önceki kararda kalmalı.
4. DHT22'nin **Sıcaklık** özelliğini 29 °C yap: fan LED'i (röle) 2 sn içinde yanmalı. 27 °C'ye indir: açık kalmalı. 25 °C'de kapanmalı. (DHT22 en çok 2 sn'de bir okunur; tepki gecikmesi laboratuvarda da vardır.)
5. 8 sn hareket olmasın: durum BOS; lamba ve fan kapanmalı, LCD arka ışığı sönmeli.
6. Butona bas: KAPALI; PIR'ı tetikle, hiçbir şey olmamalı. Bir daha bas: BOS. (Laboratuvarın butonu sıçramaz; koddaki 50 ms'lik pay bu yüzden denenmemiş kalır.)
7. ■ ile durdur, DHT22'nin DATA kablosunu sil, ▶ ile yeniden başlat. 3 sn sonra PIR'ı tetikle: fan kapalı, LCD `DHT HATA` yazmalı; lamba çalışmaya devam eder.

### Dene
- `FAN_ACIK` ile `FAN_KAPAT` farkını 0,5 °C yap: fan ne sıklıkla açılıp kapanıyor?
- Odada yalnızca ışık değil nem de yüksekse (örneğin %70 üstü) fanı çalıştır. Hangi bölüme ekleyeceksin?
- BOS durumundan çıkarken LCD'ye "Hos geldin" yaz ve 2 sn sonra silinsin (bloklamadan).
- `BOS_SURESI`'ni EEPROM'a yazıp butonla ayarla.

### Sık yapılan hatalar
- PIR'ın ısınma süresini hesaba katmamak: açılışta oda "dolu" sanılır.
- LDR bölücüsünü ters kurmak: "karanlık" ile "aydınlık" yer değiştirir.
- Tek eşik kullanıp lambanın titremesine izin vermek.
- DHT22'yi iki saniyeden sık okumak.
- Sensör geçersizken fanı açık bırakmak.
- Röleyle şebeke gerilimi kullanmak: bu projede kesinlikle yapılmaz.
- Fanı kartın 5 V pininden beslemek: gerçek devrede kart sıfırlanabilir; laboratuvar bunu göstermez (73. ders).

## Konuşalım
Bu proje laboratuvarda mükemmel çalışsa bile gerçek odaya taşıdığında hangi üç şey seni şaşırtır? (Aklına gelsin: buton sıçraması, analog gürültü, besleme gerilimi ve PIR'ın gerçek ısınma süresi.) Odayı gerçekten bırakıp çıkmadan önce hangi güvenlik önlemini eklerdin?
