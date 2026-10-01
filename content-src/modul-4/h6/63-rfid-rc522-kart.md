# RFID RC522 (SPI): kart okuma
süre: 30

## Merak
Otobüs kartını okuyucuya yaklaştırırsın, kartın hiçbir pili yok, ama okuyucu onu tanır. Kart enerjisini nereden alıyor? Ve okuyucu kartın "kim olduğunu" nasıl öğreniyor? Bu derste kart okuyucuyu tanıyacak, ama bir de dürüst bir sorunla karşılaşacaksın: Arduino Uno'nun pinleri bu hafta yetmiyor.

## Etkinlik
### RFID nedir?
RFID, radyo dalgasıyla kimlik okumaktır. RC522 modülü 13,56 MHz'lik bir alan üretir. Kartın (ya da anahtarlığın) içinde pil yoktur; yalnızca bir anten ve küçük bir çip vardır. Kart okuyucunun alanına girince alandan enerji alır ve belleğindeki verileri geri yollar. Bu derste okuyacağımız veri kartın **UID**'sidir (benzersiz kimlik numarası). Yaygın MIFARE kartlarda UID 4 bayttır; bazı kartlarda 7 ya da 10 bayt olur. Biz 4 baytlık UID'yi işleyeceğiz.

**Önemli:** UID bir parola değildir. Kartı okuyabilen herkes UID'yi öğrenebilir ve bazı özel kartlar UID'yi taklit edebilir. Bu yüzden ciddi kilitlerde yalnızca UID'ye güvenilmez. Bu hafta kartı PIN ile birlikte kullanacağız.

### SPI nedir?
RC522 Arduino ile **SPI** üzerinden konuşur. SPI, dört telli hızlı bir haberleşme biçimidir (33. dersteki I2C'nin iki teline karşılık dört tel kullanır):

| Tel | Görevi | Uno pini |
|---|---|---|
| SCK | Saat darbesi (Arduino üretir) | **D13** |
| MOSI | Arduino'dan modüle veri | **D11** |
| MISO | Modülden Arduino'ya veri | **D12** |
| SS (SDA) | "Seni seçtim" hattı; LOW iken modül dinler | **D10** (değiştirilebilir) |

Bunlara ek olarak RC522'nin **RST** (sıfırlama) bacağı vardır. SCK, MOSI ve MISO pinleri Uno'da donanım tarafından belirlidir ve değiştirilemez. SS ve RST ise istediğin bir pine bağlanabilir.

### Devre
| Parça | Bağlantı |
|---|---|
| RC522 modül | SDA(SS) → **D10**, SCK → **D13**, MOSI → **D11**, MISO → **D12**, RST → **D9**, GND → GND, 3.3V → **3,3 V** |
| MIFARE kart veya anahtarlık | Modülün üstüne yaklaştır |

**Güç uyarısı:** RC522 bir **3,3 V** modüldür. 3.3V bacağını Uno'nun 5 V çıkışına bağlama; modül zarar görebilir. Ayrıca modülün veri bacakları da 3,3 V'a göre tasarlıdır. Uno 5 V'luk sinyal verir; birçok kişi modülü doğrudan bağlasa da güvenli yol bir seviye dönüştürücü ya da direnç bölücü kullanmaktır. Modülün veri sayfasına bak.

### Program 1: Kartı oku
`MFRC522` kütüphanesi ile kartın UID'sini seri porta yazan program:

```cpp
// sketch: rc522_oku
#include <SPI.h>
#include <MFRC522.h>

const int SS_PIN = 10;
const int RST_PIN = 9;

MFRC522 okuyucu(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();               // SPI hattını başlat
  okuyucu.PCD_Init();        // RC522'yi başlat
}

void loop() {
  if (!okuyucu.PICC_IsNewCardPresent()) return;   // yeni kart yok
  if (!okuyucu.PICC_ReadCardSerial()) return;     // UID okunamadı

  Serial.print("KART:");
  for (byte i = 0; i < okuyucu.uid.size; i++) {
    if (okuyucu.uid.uidByte[i] < 16) Serial.print('0');
    Serial.print(okuyucu.uid.uidByte[i], HEX);
  }
  Serial.println();

  okuyucu.PICC_HaltA();        // aynı kartı tekrar tekrar okumayı bırak
}
```

Bu sketch kütüphane kullanır; derlenir, ama davranışını gerçek bir RC522 ile kendin denemelisin. `PICC_IsNewCardPresent()` alanda yeni bir kart varsa `true` döner, `PICC_ReadCardSerial()` UID'yi `okuyucu.uid` içine doldurur. Çıktıyı bilerek `KART:AABBCCDD` biçiminde yazdırıyoruz; birazdan bu satırı programa "kart gelmiş gibi" göndereceğiz.

### Dürüst bir sorun: pinler çakışıyor
Bu haftanın projesinde keypad, servo, buzzer, LED'ler ve LCD bir arada olacak. Pinleri yan yana koy:

| Pin | Keypad (62) | RC522 (bu ders) | Kapı kilidi projesi (65) |
|---|---|---|---|
| D9 | satır 1 | RST | keypad satır 1 |
| D10 | yok | SS | servo |
| D11 | yok | MOSI (sabit) | buzzer |
| D12 | yok | MISO (sabit) | kırmızı LED |
| D13 | yok | SCK (sabit) | yeşil LED |

Yani keypad ve RC522 aynı kartta bir arada çalışmaz: D9 çakışır; üstelik SPI'nin üç sabit pini projedeki buzzer ve LED'lerin pinleridir. Gerçek bir ürün yapacak olsan şu yollardan birini seçerdin:
- Daha çok pini olan bir kart (örneğin Arduino Mega).
- Keypad'i daha az pinle okuyan bir yol (örneğin bir I2C genişletici modül).
- LED ve buzzeri A0-A3 pinlerine taşımak (analog pinler dijital çıkış olarak da kullanılabilir). Kâğıt üzerinde sığıyor gibi görünür, ama bunu bu derste denemedik.

Biz bu hafta farklı bir yol seçiyoruz: **projede kartı seri porttan taklit edeceğiz**. Okuyucu yerine sen seri monitöre `KART:AABBCCDD` yazacaksın; program bunu kartın okunması sayacak. Bu, **kart okuyucu yokken test için seri taklit**tir; gerçek RC522 değildir. Üstelik `rc522_oku` programı da aynı satırı yazdığı için, ileride okuyucuyu eklersen kart verisinin geldiği yer değişir, yetki mantığı aynen kalır.

### Program 2: Seri taklit ile kart testi
Bu program seri porttan bir satır okur. Satır `KART:` ile başlıyor ve ardından 8 onaltılık rakam (4 bayt) geliyorsa UID'yi çözer ve yetkili listesiyle karşılaştırır. `delay` ya da `readStringUntil` kullanmıyoruz: satırı karakter karakter biriktiriyoruz, böylece program beklerken başka iş yapabilir.

```cpp
// sketch: kart_taklit
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
    if (c == '\r') continue;
    if (c == '\n') {
      satir[uzunluk] = '\0';
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
  if (satirOku() && satir[0] != '\0') {
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
```

Seri monitörün satır sonu ayarını "Yeni satır" (newline) yap, `KART:AABBCCDD` yaz ve gönder.

### Nasıl çalışıyor?
1. `satirOku()` her turda gelen karakterleri `satir` dizisine ekler. `\n` gelince satırı bitirir. Yarım gelen satır bir sonraki turda devam eder; program hiçbir yerde beklemez.
2. `uidCoz` önce `KART:` önekini denetler (`strncmp` ilk 5 karakteri karşılaştırır), sonra 8 karakterin hepsinin onaltılık rakam olduğunu doğrular. İki onaltılık rakam bir bayt eder: `yuksek * 16 + alcak`.
3. `hexDeger`, `'A'` karakterinden `'A'` kodunu çıkarıp 10 ekleyerek 10-15 değerini üretir. Küçük harfle yazılan `aabbccdd` de kabul edilir.
4. `memcmp(a, b, 4)` iki bellek bölgesinin 4 baytını karşılaştırır; hepsi aynıysa `0` döner. 4 baytlık UID'yi karşılaştırmanın en kısa yolu budur (`==` dizilerde işe yaramaz).
5. Biçimi bozuk satırlar (`KART:AABB`, `KART:ZZZZZZZZ`, `MERHABA`) "Gecersiz satir" olarak reddedilir; kapıyı açan taraf hiç çalışmaz.

### Dene
- `YETKILI_UID` yerine kendi kartının UID'sini yaz. (Gerçek okuyucun varsa `rc522_oku` ile öğren; yoksa uydurma bir değer kullan.)
- Yanlış UID gönder: kırmızı LED yanıyor mu?
- Büyük ve küçük harfli UID gönder (`AABBCCDD` ve `aabbccdd`). İkisi de aynı sonucu veriyor mu?

### Sık yapılan hatalar
- RC522'yi 5 V ile beslemek.
- SS ve RST pinlerini sketch'te bir yere, devrede başka yere bağlamak.
- Seri monitörde satır sonu ayarını "Yeni satır yok" bırakmak: program satırın bittiğini anlamaz.
- UID'yi tek başına güvenli sanmak: UID okunabilir ve bazı kartlarla taklit edilebilir.
- Aynı pinleri iki cihaza birden vermek (bu dersin çakışma tablosu).

## Konuşalım
Yetki kontrolünü "kartı okuyan taraf" ile "kapıyı açan taraf" diye iki parçaya ayırmak sence neden iyi bir fikir? Kart okuyucuyu sonradan değiştirmek istesen hangi kısmı değiştirirdin?
