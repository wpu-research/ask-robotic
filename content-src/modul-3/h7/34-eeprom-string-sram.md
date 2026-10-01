# EEPROM, String ve SRAM
süre: 25

## Merak
Kartın fişini çekip taktığında tüm değişkenlerin sıfırlanır. Termostatın "hedef sıcaklık 24 derece" ayarını nasıl hatırlayacak? Üstelik Uno'nun belleği çok küçük: bir telefon fotoğrafı bile ona sığmaz. Bu küçük belleği nasıl akıllıca kullanırız?

## Etkinlik
### Üç bellek
Arduino Uno'nun (ATmega328P) üç ayrı belleği vardır:

| Bellek | Boyut | Ne tutar? | Güç kesilince? |
|---|---|---|---|
| Flash | 32 KB | Programın kendisi | Kalır |
| SRAM | 2 KB | Çalışırken değişkenler | Silinir |
| EEPROM | 1 KB | Kalıcı ayarlar | Kalır |

`int`, `float`, `String` gibi değişkenlerin hepsi SRAM'dedir. Kalıcı olmasını istediğin veriyi **EEPROM**'a yazarsın.

### Devre
Bu derste yalnızca kartın kendisi gerekir; ek parça yok. Sonuçları Serial Monitor'de (9600 baud) okuyacaksın.

### Program: açılış sayacı
Her açılışta EEPROM'daki sayıyı bir artıran program. Hiç yazılmamış bir EEPROM hücresinde `255` bulunur; bunu "boş" kabul ediyoruz.

```cpp
// sketch: eeprom_sayac
#include <EEPROM.h>

void setup() {
  Serial.begin(9600);
  byte sayi = EEPROM.read(0);        // 0. adresteki baytı oku
  if (sayi == 255) sayi = 0;         // hiç yazılmamış: sıfırdan başla
  sayi = sayi + 1;
  EEPROM.update(0, sayi);            // yeni değeri 0. adrese yaz
  Serial.print("Acilis sayisi: ");
  Serial.println(sayi);
}

void loop() {
}
```

Kartı kapatıp açtıkça sayı 1, 2, 3 diye artar.

### Yıpranma: write mi, update mi?
EEPROM hücreleri sonsuza kadar yazılamaz. Üretici her hücre için yaklaşık **100.000 yazma** garanti eder. Bundan sonra hücre bozulabilir. Okumak ise hücreyi yıpratmaz.

Hesap: hedef sıcaklığı her saniye aynı hücreye yazarsan 100.000 saniye = yaklaşık 27,8 saat sonra hücre garanti sınırına ulaşır. Her dakika yazsan bile yaklaşık 69 gün yeter. Bu yüzden EEPROM'a **yalnızca değer değiştiğinde** ve mümkünse seyrek yazmalısın.

- `EEPROM.write(adres, değer)` her çağrıldığında yazar, değer aynı olsa bile.
- `EEPROM.update(adres, değer)` önce hücreyi okur; değer zaten aynıysa **hiç yazmaz**.

```cpp
// sketch: eeprom_yipranma
#include <EEPROM.h>

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 5; i++) {
    EEPROM.write(10, 7);     // her seferinde yazar
  }
  for (int i = 0; i < 5; i++) {
    EEPROM.update(11, 7);    // yalnızca ilkinde yazar
  }
  Serial.print("10. adres: ");
  Serial.println(EEPROM.read(10));
  Serial.print("11. adres: ");
  Serial.println(EEPROM.read(11));
}

void loop() {
}
```

İki adreste de sonuç 7'dir, ama ilk döngü 5 yazma harcar, ikincisi yalnızca 1 (ilk değer 255 olduğu için). Ayrıca bir yazma işlemi yaklaşık 3-4 ms sürer; yani `update` hem hücreyi korur hem de zaman kazandırır.

### Birden çok değer: put ve get
`EEPROM.read` ve `EEPROM.write` tek bayt içindir. `int` iki bayt, `float` dört bayt kaplar. Bunları tek komutla yazmak için `EEPROM.put` ve `EEPROM.get` vardır. Bu komutlar da değer aynıysa baytı yeniden yazmaz.

```cpp
// sketch: eeprom_put_get
#include <EEPROM.h>

struct Ayar {            // birden çok değeri bir arada tutan kutu
  int hedef;
  float fark;
};

void setup() {
  Serial.begin(9600);
  Ayar a = {24, 0.5};
  EEPROM.put(20, a);     // 20. adresten itibaren yaz

  Ayar b;
  EEPROM.get(20, b);     // aynı yerden geri oku
  Serial.print("hedef=");
  Serial.print(b.hedef);
  Serial.print(" fark=");
  Serial.println(b.fark, 1);
}

void loop() {
}
```

`Ayar` 2 + 4 = 6 bayt kaplar; yani 20-25 numaralı adresler dolar. Yeni bir veri yazacaksan 26'dan başlamalısın, yoksa üstüne yazarsın.

### String ve SRAM
SRAM yalnızca 2048 bayttır. Her yazı, her dizi, her değişken buradan yer alır. `String` nesneleri kullanışlıdır (`+` ile birleştirilir) ama uzadıkça SRAM'de yer değiştirir ve belleği parçalayabilir. Kalıcı çalışacak programlarda mümkünse sabit boyutlu `char` dizileri kullan ve `String` kullanımını az tut.

Bir ipucu da şu: `Serial.println("Merhaba")` yazısı SRAM'de yer tutar. `Serial.println(F("Merhaba"))` ise yazıyı Flash'ta bırakır ve SRAM'i korur.

Aşağıdaki program, boş SRAM'i ölçer ve bir `String`'in ne kadar yer tuttuğunu gösterir.

```cpp
// sketch: sram_string
extern int __heap_start, *__brkval;

int bosRam() {
  int v;
  return (int)&v - (__brkval == 0 ? (int)&__heap_start : (int)__brkval);
}

void setup() {
  Serial.begin(9600);
  Serial.println(F("SRAM olcumu"));
  Serial.print(F("Once: "));
  Serial.println(bosRam());

  String s = "";
  for (int i = 0; i < 10; i++) {
    s += "0123456789";          // her turda 10 karakter ekle (toplam 100)
  }
  Serial.print(F("Sonra: "));
  Serial.println(bosRam());
  Serial.print(F("String uzunlugu: "));
  Serial.println(s.length());
}

void loop() {
}
```

`bosRam()` yığın (stack) ile öbek (heap) arasındaki boşluğu hesaplar. `Sonra` değeri `Once` değerinden yaklaşık 100 küçüktür, çünkü `String` 100 karakteri SRAM'de saklar. Tam sayı kartına ve derleyiciye göre birkaç bayt oynayabilir.

### Kütüphane kullanımı
Bu hafta üç kütüphane gördün: `LiquidCrystal`, `Wire`, `EEPROM`. Hepsi aynı kalıbı izler:
1. `#include <Ad.h>` ile kütüphaneyi ekle.
2. Gerekiyorsa bir **nesne** oluştur: `LiquidCrystal lcd(...)`. (`EEPROM` ve `Wire` için nesne hazırdır.)
3. `nesne.komut()` biçiminde komutlarını çağır: `lcd.print()`, `Wire.begin()`, `EEPROM.read()`.

Yeni bir kütüphane kullanmak istediğinde Arduino IDE'de **Taslak > Kütüphane Ekle > Kütüphaneleri Yönet** menüsünden ara ve kur. Kütüphanenin **Dosya > Örnekler** altındaki hazır örnekleri, nasıl kullanılacağını gösteren en iyi kaynaktır.

### Dene
- `eeprom_sayac` programını kartta çalıştır, kartı çıkarıp tak. Sayı artmaya devam ediyor mu?
- `eeprom_yipranma` içinde `update` döngüsünü 1000 kez döndür. Sonuç neden hâlâ 7?
- `sram_string` programında `String` uzunluğunu 200 karaktere çıkar. `Sonra` değeri ne kadar azalıyor?
- Pot ile ayarlanan bir değeri butona basıldığında EEPROM'a kaydet. Her döngüde kaydetsen ne olurdu?

### Sık yapılan hatalar
- EEPROM'a her `loop` turunda yazmak: hücre kısa sürede yıpranır. Yalnızca değer değiştiğinde yaz; `update` kullan.
- Adresleri çakıştırmak: iki farklı veriyi aynı adrese yazarsan biri ötekini bozar. Hangi veri hangi adreste, bir yere not et.
- `EEPROM.read` ile `int` okumaya çalışmak: `read` yalnızca 1 bayt döndürür. 2 baytlık değerler için `get` kullan.
- Hiç yazılmamış hücrenin 0 olduğunu sanmak: boş hücrede 255 vardır. Okuduğun değerin geçerli olup olmadığını kontrol et.
- Uzun ve çok sayıda `String` birleştirmek: SRAM dolabilir ve kart zamanla beklenmedik davranabilir.

## Konuşalım
Termostatın hedef sıcaklığını tam olarak ne zaman EEPROM'a yazmalısın? Butona her basışta mı, yoksa kullanıcı ayarı bitirdikten bir süre sonra mı? Neden?
