# Yetki yönetimi: kart + şifre + EEPROM
süre: 35

## Merak
Bir apartmanda yeni bir kiracı taşındığında yönetici kapının programını bilgisayara bağlayıp yeniden yüklemez. Kiracının kartı bir komutla eklenir, eski kiracınınki silinir. Üstelik elektrikler kesilse bile liste kaybolmaz. Bu derste yetkili kartları ve PIN'i EEPROM'a kaydeden, yetkiyi bir **master PIN** ile yöneten bir sistem yazacaksın.

## Etkinlik
### Ne yapacağız?
Üç şeyi EEPROM'da (34. ders) tutacağız:
- Kullanıcı PIN'i (kapıyı açan PIN)
- Master PIN (yönetim PIN'i; kart eklemek, silmek ve kullanıcı PIN'ini değiştirmek için)
- Yetkili kart UID listesi (en çok 8 kart)

Kart okuyucu, keypad ve diğer parçalar birlikte Uno'nun pinlerine sığmadığı için (63. ders) kartları ve PIN girişini **seri komutlarla taklit** ediyoruz. Bu derste devre kurmazsın; laboratuvarda yalnız Uno ve seri monitör yeterlidir. Komutu seri monitörün altındaki kutuya yaz ve **Gönder**'e bas (program çalışıyor olmalı); laboratuvar satır sonunu kendisi ekler.

### Komutlar
| Komut | Ne yapar? |
|---|---|
| `KART:AABBCCDD` | Kart okunmuş gibi davranır; listede varsa YETKILI |
| `GIRIS:1234` | Keypad'den PIN girilmiş gibi davranır |
| `EKLE:9999:AABBCCDD` | Master PIN doğruysa kartı listeye ekler |
| `SIL:9999:AABBCCDD` | Master PIN doğruysa kartı listeden siler |
| `PINDEGIS:9999:4321` | Master PIN doğruysa kullanıcı PIN'ini değiştirir |
| `LISTE` | Kayıtlı kartları gösterir |

Komutlar iki nokta üstüste (`:`) ile alanlara ayrılır. Fabrika ayarları: kullanıcı PIN `1234`, master PIN `9999`, kart yok.

### EEPROM haritası
Her bilginin sabit bir adresi olmalı, yoksa üst üste yazarsın:

| Adres | Boyut | İçerik |
|---|---|---|
| 0 | 1 bayt | Kurulum işareti (`0xA5`) |
| 1-4 | 4 bayt | Kullanıcı PIN'i (rakam karakterleri) |
| 5-8 | 4 bayt | Master PIN |
| 9 | 1 bayt | Kayıtlı kart sayısı |
| 10-41 | 8 × 4 bayt | Kart UID'leri |

**Kurulum işareti** önemlidir. Yeni bir EEPROM'da her hücrede `255` bulunur (34. ders); program bunu PIN sanmamalıdır. Açılışta `0xA5` yoksa fabrika ayarları yazılır. İşareti **en son** yazıyoruz: kurulum yarıda kesilirse (güç gitmesi gibi) işaret yazılmamış olur ve program bir sonraki açılışta kurulumu yeniden yapar.

### EEPROM yıpranması
Her hücre yaklaşık 100.000 yazma için garantilidir (34. ders). Bu sistemde hücreler nadiren değişir, ama yine de iki kural uyguluyoruz:
- Her yazmada `EEPROM.update` kullanırız. Değer zaten aynıysa hiç yazılmaz.
- Kartı **okumak** hiçbir şey yazmaz. `KART` ve `GIRIS` komutları EEPROM'a yazmaz; yazma yalnızca `EKLE`, `SIL`, `PINDEGIS` ve ilk kurulumda olur.

Kart silerken listeyi baştan yazmak yerine **son kartı silinenin yerine kopyalarız** ve sayacı bir azaltırız. Böylece en çok bir kartlık (4 bayt) ve bir sayaç yazılır.

### Program
```cpp
// sketch: yetki_yonetimi
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
  pin[PIN_UZUNLUK] = '\0';
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
  for (char* p = s; *p != '\0' && adet < 3; p++) {
    if (*p == ':') {                             // ':' yerine bitiş işareti koy, yeni alan başlat
      *p = '\0';
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
  if (satirOku() && satir[0] != '\0') {
    komutIsle(satir);
  }
}
```

### Nasıl çalışıyor?
1. `setup` kurulum işaretine bakar. İlk açılışta fabrika ayarlarını yazar; sonraki açılışlarda EEPROM'a **hiçbir şey yazmaz**, yalnızca okur.
2. `komutIsle` satırı `:` işaretlerinde keser. `alan[0]` komut, `alan[1]` ve `alan[2]` parametrelerdir. Satırın içindeki `:` yerine `'\0'` koyduğumuz için her alan kendi başına bir C yazısı olur (62. dersteki `strcmp` ile karşılaştırılabilir).
3. Üç yönetim komutu (`EKLE`, `SIL`, `PINDEGIS`) aynı yerden geçer ve hepsi önce master PIN'i denetler. Master PIN yanlışsa EEPROM'a dokunulmaz.
4. `kartEkle` kartı önce arar; zaten varsa yazmaz (`ZATEN VAR`). Yeni kartı listenin sonuna yazar, **sayacı en son** artırır. Yazma sırasında güç giderse sayaç artmadığı için yarım yazılmış kart listede görünmez.
5. `kartSil` son kartı silinenin yerine taşır. Sayaç bir azalır, böylece son kartın eski baytları artık kullanılmaz. Sonuç olarak liste her zaman boşluksuzdur.
6. `PIN` EEPROM'da rakam karakterleri olarak durur; kayıtlı PIN ile gelen yazı `strcmp` ile karşılaştırılır.
7. Boş (`255`) ya da bozuk bir kart sayacı `kartSayisi()` içinde 0 sayılır; liste taşmaz.

### Dene
- `EKLE:9999:AABBCCDD`, sonra `LISTE`, sonra kartı tekrar `EKLE`. İkincisinde ne yazıyor? EEPROM'a yazıldı mı? (Cevap: yazılmadı, çünkü `kartBul` kartı buldu.)
- Üç kart ekle, ortadakini `SIL` ile sil, `LISTE` ile sırayı gör. Son kart nereye geldi?
- Bir kart ekle ve `PINDEGIS` ile PIN'i değiştir. Sonra ■ ile durdurup ▶ ile yeniden başlat ve `LISTE` yaz. Ne görüyorsun? Laboratuvardaki EEPROM çalıştırmalar arasında saklanmaz: liste boşalır ve açılışta yine `Fabrika ayari yazildi` çıkar. Gerçek bir Arduino'da veriler güç kesilse bile EEPROM'da kalırdı.

### Sık yapılan hatalar
- Kurulum işareti koymamak: boş EEPROM'daki `255` değerlerini PIN sanırsın.
- `EEPROM.write` kullanmak: aynı değeri her seferinde yeniden yazar ve hücreyi gereksiz yıpratır.
- Sayacı kartı yazmadan önce artırmak: yazma sırasında güç giderse yarım kart yetkili görünebilir.
- Master PIN ile kullanıcı PIN'ini aynı yapmak: yönetim yetkisi herkese açılır.
- Master PIN'i denemeye sınırsız açık bırakmak. Bu derste master PIN için deneme sınırı yok; seri port bilgisayara bağlı biri herkesten fazla deneme yapabilir. Gerçek üründe bu sınırlanır ya da yönetim komutları kapalı tutulur.

## Konuşalım
Kartı kaybeden birinin kartını listeden silmek yeterli mi? PIN'i de değiştirmek gerekir mi? Hangi durumda hangisi gerekir?
