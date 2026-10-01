# SD kart (SPI): dosyaya yazma
süre: 25

## Merak
Bir bahçeye sıcaklık ölçer koyduğunu ve üç gün orada kalacağını düşün. Bilgisayar yok, Serial Monitor yok. Ölçümleri nereye yazacaksın? EEPROM yalnızca 1 KB'dir (34. ders), birkaç yüz ölçümde dolar. Bir SD kart ise gigabaytlarca yer verir ve içindeki dosyayı bilgisayarda doğrudan açarsın. Bu derste Arduino'nun SD karta nasıl dosya yazdığını öğreneceksin.

## Etkinlik
### Devre
**Laboratuvar notu:** Laboratuvarda SD kart modülü parçası yok. Bu derste SD kodunu yazar ve derlersin; karta gerçekten dosya yazıldığını göremezsin. Laboratuvarda `SD.begin` kart bulamayınca takılıp kalır (gerçek kartta `false` döner). Bu yüzden programı denerken `SD.begin`'den önce seri monitöre bir ilerleme mesajı yazdırırsın: mesajı görüyorsan program başlamış, ama `SD.begin`'de bekliyor demektir.

Bu yüzden bu derste kurulacak bir devre yok; **Parça ekle** menüsünde SD kart göremezsin. Aşağıdaki tablo, kodun gerçek bir modülle nasıl bağlanacağını gösteren bilgidir (pin adları Uno'nunkilerdir):

| SD kart modülü ucu | Uno pini |
|---|---|
| CS | **D10** |
| MOSI | **D11** |
| MISO | **D12** |
| SCK | **D13** |
| VCC | **5V** (modülün belgesine bak) |
| GND | **GND** |

**Önemli:** SD kart SPI ile konuşur. Uno'da SPI pinleri sabittir: D11, D12, D13 ve (bu derste) CS için D10. Bu pinleri Modül 4'ün standart LED'leri (D13/D12/D11) ve HC-SR04'ün ECHO'su (D10) da kullanıyor. SD kartlı bir devrede bu parçaları aynı pinlere bağlama.

**Bilgi notu:** SD kartlar 3,3 V mantığıyla çalışır. Piyasadaki hazır modüllerin çoğunda gerilim düzenleyici ve seviye dönüştürücü bulunur, ama modülün 5 V'a uygun olduğu belgesinden doğrulanmalıdır; çıplak bir kart yuvası Arduino'nun 5 V'una doğrudan bağlanmaz.

### SPI kısaca
SPI'da (63. derste RC522 ile kullandın) dört hat vardır:
- **SCK:** saat. Arduino her bitte bir darbe üretir.
- **MOSI:** Arduino'dan karta giden veri.
- **MISO:** karttan Arduino'ya gelen veri.
- **CS:** "Seç" hattı. Hatta birden çok cihaz olabilir; CS'i LOW olan cihaz dinler.

Bunların hızını ve diğer protokollerle farkını 69. derste ölçeceksin.

### Kart biçimi: FAT ve 8.3 dosya adı
Arduino'nun `SD.h` kütüphanesi FAT16 ya da FAT32 biçimli kart ister. Büyük kartlar bilgisayarda farklı bir biçimle formatlanmış olabilir; gerçek kart kullanırken FAT32 olmasına dikkat edilir. Kütüphanenin dokümantasyonuna göre dosya adları **8.3** biçiminde olmalıdır: en çok 8 karakter, nokta, en çok 3 karakter uzantı. `VERI.CSV`, `LOG0001.TXT` geçerlidir; `sicaklik_kaydi.csv` ise uzundur, kullanma. Türkçe karakter ve boşluk da kullanma.

### Program: dosyaya yaz
Kodu laboratuvardaki düzenleyiciye yapıştırıp ▶'e basabilirsin. Kart olmadığı için `SD.begin`'de bekler; yalnız ilk mesajı görürsün.

```cpp
// sketch: sd_yaz
#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;

void setup() {
  Serial.begin(9600);
  Serial.print("SD kart baslatiliyor... ");
  if (!SD.begin(SD_CS)) {
    Serial.println("HATA: kart yok ya da baglanti yanlis");
    while (true) {}
  }
  Serial.println("tamam");

  File dosya = SD.open("TEST.TXT", FILE_WRITE);   // yoksa oluşturur, varsa sonuna ekler
  if (dosya) {
    dosya.println("Merhaba SD kart");
    dosya.println(millis());
    dosya.close();                                // işin bitince mutlaka kapat
    Serial.println("Yazildi");
  } else {
    Serial.println("HATA: dosya acilamadi");
  }
}

void loop() {
}
```

`SD.begin(10)` kartı başlatır ve başarısızsa `false` döner. Kart takılı değilse, kablo yanlışsa ya da CS pini farklıysa böyle olur. `SD.open("TEST.TXT", FILE_WRITE)` dosyayı yazmak için açar. Dosya yoksa oluşturulur; varsa yazma **sonuna eklenir**, eski içerik silinmez. Bir `File` nesnesi döner, `println` ile `Serial.println`'deki gibi yazarsın.

### Program: dosyayı geri oku
```cpp
// sketch: sd_oku
#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;

void setup() {
  Serial.begin(9600);
  if (!SD.begin(SD_CS)) {
    Serial.println("HATA: SD kart baslatilamadi");
    while (true) {}
  }

  File dosya = SD.open("TEST.TXT");               // yalnız okumak için aç
  if (!dosya) {
    Serial.println("TEST.TXT bulunamadi");
    return;
  }
  while (dosya.available()) {                     // okunacak bayt kaldıkça
    Serial.write(dosya.read());
  }
  dosya.close();
}

void loop() {
}
```

### Kapatmak ve flush: veri nereye gidiyor?
`dosya.println(...)` dediğinde veri hemen karta gitmeyebilir. Kütüphane yazdıklarını önce Arduino'nun RAM'indeki küçük bir tamponda biriktirir. Arduino'nun belgesine göre veri karta **`close()` ya da `flush()`** ile fiziksel olarak yazılır. Bu yüzden:

- İşin bitince `dosya.close()` çağır.
- Dosyayı uzun süre açık tutacaksan her yazıdan sonra `dosya.flush()` çağır.
- **Gerçek bir cihazda kartı çıkarmadan ya da gücü kesmeden önce dosyanın kapalı (ya da en son flush edilmiş) olması gerekir.** Dosya kapatılmadan kart çıkarılırsa son satırlar kaybolabilir ya da dosya bozulabilir. Laboratuvar kart çıkarmayı ve güç kesilmesini modellemez.

Aşağıdaki program dosyayı bir kez açar, her saniye bir satır yazar ve her yazıdan sonra `flush()` çağırır.

```cpp
// sketch: sd_flush
#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;
const unsigned long ARALIK = 1000;                // ms

File dosya;
unsigned long sonYazma = 0;
int sayac = 0;

void setup() {
  Serial.begin(9600);
  if (!SD.begin(SD_CS)) {
    Serial.println("HATA: SD kart baslatilamadi");
    while (true) {}
  }
  dosya = SD.open("SAYAC.TXT", FILE_WRITE);
  if (!dosya) {
    Serial.println("HATA: dosya acilamadi");
    while (true) {}
  }
}

void loop() {
  if (millis() - sonYazma >= ARALIK) {
    sonYazma = millis();
    sayac++;
    dosya.print("satir ");
    dosya.println(sayac);
    dosya.flush();                                // veriyi karta gönder, dosya açık kalsın
    Serial.println(sayac);
  }
}
```

İki yöntemin farkı: **aç-yaz-kapat** her seferinde dosyayı yeniden açar, bu yüzden her yazıdan sonra dosya kapalıdır ve güç kesilirse en güvenli durumdadır. **Açık tut ve flush et** dosyayı bir kez açar. Her ikisi de çalışır; 68. derste ilkini kullanacaksın, çünkü güvenli ve sade.

### Nasıl çalışıyor?
1. `SD.begin(10)` SPI'yı başlatır ve kartla konuşur. Başarılıysa `true` döner.
2. `SD.open(ad, FILE_WRITE)` bir `File` nesnesi verir. `if (dosya)` kontrolü açılıp açılmadığını söyler.
3. `print` ve `println` yazıyı dosyaya ekler. Sayıları da yazı gibi yazar.
4. `close()` ve `flush()` tampondaki veriyi karta gönderir.
5. Okurken `available()` okunacak bayt var mı diye bakar, `read()` bir bayt verir.

### Dene
Laboratuvarda SD yok; bu görevler kodu okuma ve yazma çalışmasıdır.
- `sd_yaz` programını iki kez çalıştırsan `TEST.TXT` içinde kaç satır olurdu? `FILE_WRITE` dosyayı baştan mı yazar, sona mı ekler? Yanıtını yukarıdaki açıklamadan bul.
- `sd_flush` programında `dosya.flush()` satırını yorum yapsan ve gücü bir anda kesseydin, dosyada hangi satırlar eksik kalırdı? Neden?
- `sd_yaz` programında dosya adını `"sicaklik_kaydi.csv"` yap. 8.3 kuralına göre `SD.open` bu adla ne döndürür (dosya açılır mı)? Programın hangi satırı bu durumu yakalar?
- `sd_yaz` programını laboratuvarda çalıştır. Seri monitörde hangi yazıyı görüyorsun, hangisini görmüyorsun? Program nerede bekliyor?

### Sık yapılan hatalar
- `close()` ya da `flush()` çağırmadan kartı çıkarmak ya da gücü kesmek (gerçek cihazda): son satırlar eksik kalır ya da dosya bozulur.
- Uzun ya da Türkçe karakterli dosya adı kullanmak: 8.3 kuralına uy.
- CS pinini yanlış yazmak: `SD.begin(10)` modülün CS bağlantısıyla aynı olmalı. Başka bir pini CS yapsan bile Uno'da D10'u çıkış durumunda bırak; Arduino'nun SD belgesi bunu ister.
- Kartı FAT32 dışında bir biçimle bırakmak: `SD.begin` başarısız olabilir.
- SD kütüphanesinin RAM kullanımını unutmak: 34. derste SRAM'in yalnız 2048 bayt olduğunu gördün. SD, tampon için ciddi bir pay alır; 70. derste derleme çıktısında ne kadar olduğunu göreceksin.
- D13 ve D11'e LED bağlayıp aynı anda SD kullanmak: bu pinler SPI hatlarıdır.

## Konuşalım
Gerçek bir cihazda gücü açıkken SD kartı çıkarmak neden risklidir? Gerçek kayıt cihazlarında "kartı güvenle çıkar" düğmesi ya da ışığı olması sence neden mantıklı?
