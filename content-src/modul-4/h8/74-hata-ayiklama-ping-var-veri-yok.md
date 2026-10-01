# Hata ayıklama vakası: "ping çalışıyor ama veri yok"
süre: 30

## Merak
Bir gimbal kamerayı laptopa USB-Ethernet ile bağlıyorsun. `ping` cevap veriyor: cihaz orada. Ama telemetri ve video akışı kopuyor, uygulama veri alamıyor. "Bağlantı var, o zaman sorun yazılımda" diye düşünmek çok cazip. Gerçek sebep ise yazılımda değildi. Bu vakadan çıkan ders, ağ kablosu da olsa I2C sensörü de olsa aynı: hatayı **katman katman** ara.

## Etkinlik
### Vaka: Hyvex gimbal
Bu bölüm Hyvex ekibinin staj programındaki bir vakaya dayanır; yalnızca orada yazılanları aktarıyorum.
- Gimbal laptopa Type-C üzerinden USB-Ethernet gibi bağlanıyor ve statik IP ile konuşuluyor.
- **Belirti:** `ping` çalışıyor ama telemetri ve video (RTSP) kopuyor.
- **Kök neden:** NetworkManager, DHCP ile IP'yi siliyordu. Çözüm, kalıcı bir statik profil tanımlamaktı.
- **İpucu:** "Arada düzeliyor" cümlesi, bir **katmanın kararsız** olduğunu gösteren işarettir.
- **Yöntem:** Belirtiyi kök nedene indirgemek için katman katman doğrulama: fiziksel bağlantı, IP, port, uygulama.

Programın sorusu da şu: "Bir hatayı 'çözdüm' demeden önce nasıl emin olursun?" Önce yöntemi bizim dünyamıza uyarlayalım.

### Bizim katmanlarımız: I2C sensörü
Ağdaki "ping" burada **I2C taraması** (33. ders): adreste biri cevap veriyor. Ama bir cihazın adresine cevap vermesi, doğru cihaz olduğunu ya da doğru veri verdiğini kanıtlamaz. Dört katmanı alttan üste sırayla doğrularız. Üstteki katmanı ancak alttakiler tamamsa test etmenin anlamı vardır:

| Katman | Soru | Nasıl denenir |
|---|---|---|
| 1. Fiziksel | Hatlar (SDA/SCL) boşta HIGH mı, kısa devre var mı? | `digitalRead(A4)` ve `digitalRead(A5)` |
| 2. Adres | Beklenen adreste bir cihaz cevap veriyor mu? | `beginTransmission` / `endTransmission` |
| 3. Protokol (kimlik) | Cevap veren, **doğru** cihaz mı? | Kimlik yazmacını (WHO_AM_I) oku, beklenenle karşılaştır |
| 4. Veri mantığı | Okunan değer **makul** mü? | Aralık kontrolü |

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| MPU6050 | VCC → **5V**, GND → **GND**, SDA → **A4**, SCL → **A5** |

MPU6050'de (58. derste gördüğün ivmeölçer, adres 0x68) kimlik yazmacı 0x75'tir ve veri sayfasına göre `0x68` döner. Hareketsiz durumda ivmenin toplam büyüklüğü yaklaşık 1 g (yerçekimi) olmalıdır. Bu sketch dört katmanı sırayla dener ve **ilk hata veren katmanı** söyler:

```cpp
// sketch: katman_testi
#include <Wire.h>

const byte ADRES = 0x68;
const byte YAZMAC_KIMLIK = 0x75;      // WHO_AM_I
const byte BEKLENEN_KIMLIK = 0x68;
const byte YAZMAC_GUC = 0x6B;         // uyku/güç yazmacı
const byte YAZMAC_IVME = 0x3B;        // ivme verisinin başı
const float MIN_G = 0.8;              // hareketsiz ivme büyüklüğü için makul aralık
const float MAKS_G = 1.2;

int sonSonuc = -1;
float sonG = 0;

bool hatlarBosta() {
  return digitalRead(A4) == HIGH && digitalRead(A5) == HIGH;
}

bool cihazVar() {
  Wire.beginTransmission(ADRES);
  return Wire.endTransmission() == 0;
}

int kimlikOku() {
  Wire.beginTransmission(ADRES);
  Wire.write(YAZMAC_KIMLIK);
  if (Wire.endTransmission(false) != 0) return -1;
  if (Wire.requestFrom((int)ADRES, 1) != 1) return -1;
  return Wire.read();
}

bool ivmeBuyuklugu(float &g) {
  Wire.beginTransmission(ADRES);
  Wire.write(YAZMAC_IVME);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((int)ADRES, 6) != 6) return false;
  int16_t ham[3];
  for (int i = 0; i < 3; i++) {
    int yuksek = Wire.read();
    int dusuk = Wire.read();
    ham[i] = (int16_t)((yuksek << 8) | dusuk);
  }
  float x = ham[0] / 16384.0;         // varsayılan aralıkta 16384 LSB = 1 g
  float y = ham[1] / 16384.0;
  float z = ham[2] / 16384.0;
  g = sqrt(x * x + y * y + z * z);
  return true;
}

// 0 = hepsi tamam, 1-4 = ilk hata veren katman
int ilkHataKatmani() {
  if (!hatlarBosta()) return 1;
  if (!cihazVar()) return 2;
  if (kimlikOku() != BEKLENEN_KIMLIK) return 3;
  float g;
  if (!ivmeBuyuklugu(g)) return 4;
  sonG = g;
  if (g < MIN_G || g > MAKS_G) return 4;
  return 0;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(ADRES);      // uykudan uyandır
  Wire.write(YAZMAC_GUC);
  Wire.write(0);
  Wire.endTransmission();
  delay(100);
}

void loop() {
  int sonuc = ilkHataKatmani();
  if (sonuc == 0) {
    Serial.print("TAMAM g=");
    Serial.println(sonG, 2);
  } else if (sonuc == 1) {
    Serial.println("Katman 1 HATA: SDA/SCL LOW'da takili");
  } else if (sonuc == 2) {
    Serial.println("Katman 2 HATA: adreste cihaz yok");
  } else if (sonuc == 3) {
    Serial.println("Katman 3 HATA: adres cevap veriyor ama kimlik yanlis");
  } else {
    Serial.println("Katman 4 HATA: deger makul degil");
  }
  if (sonSonuc != -1 && sonuc != sonSonuc) {
    Serial.println("DEGISTI: sonuc kararsiz");
  }
  sonSonuc = sonuc;
  delay(1000);
}
```

### Nasıl çalışıyor?
1. `hatlarBosta()` I2C hatlarının boşta HIGH olduğuna bakar. Not: `Wire.begin()` Uno'da dahili çekme dirençlerini açar, bu yüzden bağlı olmasa bile hat genelde HIGH okunur. Bu test yalnızca hattın LOW'a takıldığı (kısa devre gibi) durumu yakalar; "kablo hiç yok" durumunu 2. katman bulur.
2. `cihazVar()` 33. dersteki taramanın tek adrese indirgenmiş hâlidir.
3. `kimlikOku()` adrese kimlik yazmacını sorar. Bu **ping'den daha çok bilgi** verir: yanlış cihaz adrese cevap veriyorsa, ya da kablolar yer değiştirmişse, burada yakalarsın.
4. `ivmeBuyuklugu()` altı baytı okur (X, Y, Z için ikişer bayt), g'ye çevirir ve vektör büyüklüğünü hesaplar. Hareketsiz sensör için 0,8-1,2 g makul aralıktır. Sensör sallanıyorsa bu test yanlış alarm verir; aralık, testin **hangi koşulda** geçerli olduğunu bilmeni gerektirir.
5. `ilkHataKatmani()` alttan üste sırayla dener ve ilk hatada durur. Alt katman bozukken üsttekini sormanın anlamı yoktur. Kök neden, **en alttaki** başarısız katmandır.
6. Sonuç iki ölçüm arasında değişirse `DEGISTI` yazar. Vakadaki "arada düzeliyor" ipucunun kodudur.

### Sensör hata modlarını laboratuvarda üretmek
Katmanların hepsi laboratuvarda üretilemez. Hangisini üretebildiğini, hangisini yalnızca gerçek devrede göreceğini bil:

| Hata modu | Hangi katman | Laboratuvarda nasıl üretilir |
|---|---|---|
| SDA ya da SCL kablosu yok | 2 | Kabloyu sil (devre durmuşken), ▶ |
| Besleme yok | 2 | MPU6050'nin VCC kablosunu sil |
| Adres farklı | 2 | Parçayı seç, **I2C adresi** özelliğini `0x69` yap (devre durmuşken); kod hâlâ `0x68`'i arar |
| Veri sıfır (donmuş sensör) | 4 | Çalışırken `ax`, `ay` ve `az` özelliklerini 0 yap |
| Veri doymuş ya da sallanma | 4 | Çalışırken `ax`, `ay` ve `az` özelliklerini 1,9 yap |
| "Arada düzeliyor" | `DEGISTI` | `az`'yi çalışırken 0 yap, sonra 1'e geri al |
| SDA hattı LOW'a takılı (kısa devre) | 1 | Uno'nun **A4** pinini bir kabloyla **GND**'ye bağla (devre durmuşken), ▶ |
| Adreste yanlış cihaz | 3 | **Üretilemez.** Laboratuvarda beklenen adreste başka bir cihaz çıkaramazsın; MPU6050 yalnızca `0x68` ya da `0x69` olur. |

Katman 3 kodda durur ama laboratuvar bu hatayı üretemediği için onu laboratuvarda sınamış olmazsın. Gerçek devrede bu satırın beklediğin gibi çalıştığını ayrıca doğrulaman gerekir.

### Çerçeve ve checksum
Bir katman daha var: veri uzun bir mesajın parçasıysa, bozulup bozulmadığını anlamak için **checksum** kullanılır. Hyvex vakasında gimbal'ın UDP komut çerçevesinde checksum, belirli baytların **XOR**'udur. Çerçeve; sync (başlangıç), uzunluk, komut, parametre, checksum ve footer parçalarından oluşur. Alıcı checksum'ı yeniden hesaplamazsa, bozuk bir çerçeveyi geçerli sanır.

Bizim küçük çerçevemiz şu biçimde: `0xAA` (sync), `N` (veri baytı sayısı), `N` veri baytı, son bayt = `N` ve veri baytlarının XOR'u. Veri baytlarından ilki komut: `0x01` = LED, ikincisi parametre (1 = yan, 0 = sön).

```cpp
// sketch: xor_cerceve
const byte SYNC = 0xAA;
const byte MAKS_VERI = 8;
const int LED = 13;

enum Asama { BEKLE, UZUNLUK, VERI, SUM };
Asama asama = BEKLE;
byte veri[MAKS_VERI];
byte n = 0;
byte alinan = 0;
byte xorHesap = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  while (Serial.available()) {
    byte b = Serial.read();
    switch (asama) {
      case BEKLE:
        if (b == SYNC) asama = UZUNLUK;       // sync dışındaki baytlar yok sayılır
        break;
      case UZUNLUK:
        if (b == 0 || b > MAKS_VERI) {
          Serial.println("UZUNLUK HATA");
          asama = BEKLE;
        } else {
          n = b;
          alinan = 0;
          xorHesap = b;
          asama = VERI;
        }
        break;
      case VERI:
        veri[alinan++] = b;
        xorHesap ^= b;
        if (alinan == n) asama = SUM;
        break;
      case SUM:
        if (b == xorHesap) {
          Serial.println("CERCEVE TAMAM");
          if (veri[0] == 0x01 && n >= 2) digitalWrite(LED, veri[1] ? HIGH : LOW);
        } else {
          Serial.print("CHECKSUM HATA: gelen=");
          Serial.print(b, HEX);
          Serial.print(" hesaplanan=");
          Serial.println(xorHesap, HEX);        // bozuk çerçeve uygulanmaz
        }
        asama = BEKLE;
        break;
    }
  }
}
```

Bu tasarımda checksum tutmazsa çerçeve **yok sayılır**: LED değişmez. Hyvex'teki cihazın tutmayan çerçevede ne yaptığı kaynakta yazılı değil; sana düşen soru da bu: bir cihaz bozuk komutu uygulasaydı ne olurdu?

### Dene
- `katman_testi` çalışırken `ax` özelliğini 0,8 yap (sensör yana doğru hızlanıyormuş gibi). Toplam büyüklük yaklaşık 1,28 g olur: hangi katman hata veriyor? Neden bu bir sensör arızası değil?
- `MIN_G` ve `MAKS_G` değerlerini daralt ve geniş tut: hangisi yanlış alarm, hangisi kaçırılmış hata üretir?
- `xor_cerceve` için `AA 02 01 01 02` çerçevesinin geçerli olduğunu kendin XOR'layarak doğrula (`02 ^ 01 ^ 01 = 02`). Sonra son baytı değiştir.
- Bir cihazı kullanmadan önce her açılışta bu katmanları kendi sketch'ine ekle.
- `az` özelliğini 0 ile 1 arasında hızlıca değiştirip `DEGISTI` mesajının ne zaman çıktığına bak.

### Sık yapılan hatalar
- "Ping (tarama) cevap veriyor, demek ki cihaz çalışıyor" demek. Adres cevabı kimlik ve veri doğruluğu demek değildir.
- Hata bulununca ilk işi yazılımı değiştirmek; önce alt katmanları doğrula.
- "Arada düzeliyor" diye hatayı geçiştirmek. Kararsız davranış bir katmanın sağlıksız olduğunu gösterir.
- Aralık kontrolünü koşulsuz yapmak: sensör hareket ederken yanlış alarm verir.
- Checksum'ı hesaplamayıp gelen baytı güvenmek.

## Konuşalım
Bir hatayı "çözdüm" demeden önce nasıl emin olursun? Bu dersteki dört katmanın hepsini hata öncesi ve sonrası yeniden denemek yeterli mi, yoksa sorunun "arada" geri gelmediğini görmek için bir süre beklemek mi gerekir?
