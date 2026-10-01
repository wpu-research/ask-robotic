# IR alıcı ve kumanda kodları
süre: 30

## Merak
Televizyon kumandasının ucundaki ışığı gözle göremezsin, ama bir telefon kamerasından bakınca yanıp söndüğünü görebilirsin. Kumanda her tuşta ışıkla bir mesaj yollar. TV bu mesajı nasıl "ses aç" ya da "kanal değiştir" diye anlıyor? Bu derste mesajın içini açacak, kendi çözücünü yazacaksın.

## Etkinlik
### Devre
Laboratuvarda IR alıcı ve kumanda parçası yok. Bu yüzden önce gerçek devreyi tanı, sonra aynı fikri bir butonla laboratuvarda dene.

Gerçek devrede (bilgi):

| Parça | Bağlantı |
|---|---|
| IR alıcı modül (VS1838B türü, 38 kHz) | OUT → **D2**, VCC → 5 V, GND → GND |
| IR kumanda | Alıcıya doğrultulur, tuşa basınca mesaj gönderir |

Modüllerin bacak sırası değişir; üzerindeki yazıya (OUT, GND, VCC) bakmak gerekir.

Laboratuvardaki deney için parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Buton (alıcının OUT çıkışının yerine) | A → **D2**, B → **GND** |
| LED | Uno'nun dahili LED'i (**D13**) yeter; parça eklemene gerek yok |

Butona basılmamışken D2 `INPUT_PULLUP` sayesinde HIGH okur (boşta); butonu basılı tutunca LOW okur (darbe). IR alıcı modülün çıkışı da aynı şekilde çalışır: boşta HIGH, taşıyıcı varken LOW. Butonun basılı kaldığı süreyi `pulseIn` ile ölçersen, bir IR darbesinin süresini nasıl ölçeceğinin provasını yapmış olursun. Fark şu: kumanda darbeleri milisaniye ve mikrosaniye düzeyindedir, tıklayarak bu kadar hızlı basamazsın.

### Kumanda ne gönderiyor?
Kumandanın ucundaki IR LED, saniyede 38.000 kez yanıp sönerek bir "taşıyıcı" üretir. Alıcı modül yalnızca bu 38 kHz'i tanır; gün ışığı gibi yavaş değişen ışıkları eler. Modülün çıkışı **ters** çalışır:

- Taşıyıcı yokken OUT = **HIGH** (boşta).
- Taşıyıcı varken OUT = **LOW** (darbe).

Yani Arduino taşıyıcıyı görmez; yalnızca "LOW darbe ne kadar sürdü, HIGH boşluk ne kadar sürdü" bilgisini görür. Bilgi **sürelerde** saklıdır. Birçok kumanda NEC adlı protokolü kullanır:

| Parça | LOW (darbe) | HIGH (boşluk) |
|---|---|---|
| Ön darbe (başlangıç) | 9 ms | 4,5 ms |
| Bit 0 | 562,5 µs | 562,5 µs |
| Bit 1 | 562,5 µs | 1687,5 µs |
| Bitiş | 562,5 µs | boşta |

Bitleri darbe değil **boşluk** ayırt eder: kısa boşluk 0, uzun boşluk 1. Ön darbeden sonra 32 bit gelir, **en küçük bit önce**:

1. Adres (8 bit): hangi cihaz?
2. Adresin tersi (8 bit): her biti çevrilmiş hâli
3. Komut (8 bit): hangi tuş?
4. Komutun tersi (8 bit)

Ters kopya bir hata denetimidir: komut ile tersi birbirinin tümleyeni değilse mesaj bozuktur. Bu yüzden her mesajda 16 bit 1, 16 bit 0 olur ve mesaj hangi tuş olursa olsun yaklaşık 68 ms sürer (13,5 ms ön kısım + 16 × 1,125 ms + 16 × 2,25 ms + 0,56 ms bitiş darbesi).

Tuşu basılı tutarsan kumanda aynı mesajı yinelemez; onun yerine kısa bir "tekrar" mesajı yollar: 9 ms darbe, **2,25 ms** boşluk, 562,5 µs bitiş darbesi. Tipik olarak yaklaşık 108 ms'de bir gelir. Bazı kumandalar NEC'in "genişletilmiş" biçimini kullanır (16 bit adres, ters kopya yok); kumandanın NEC'e uymuyorsa çözücü hata verir. Bu derstekiler standart NEC içindir.

### Program 1: Süreleri ölç
Önce ön darbenin gerçekten 9 ms olduğunu görelim. 37. derste öğrendiğin `pulseIn(pin, durum, zamanAşımı)` seviyeyi bekler ve o seviyenin kaç mikrosaniye sürdüğünü döndürür. Burada LOW darbelere bakıyoruz.

```cpp
// sketch: nec_zamanlari
const int IR_PIN = 2;

void setup() {
  Serial.begin(9600);
  pinMode(IR_PIN, INPUT);
}

void loop() {
  unsigned long on = pulseIn(IR_PIN, LOW, 200000);     // ön darbe (LOW)
  if (on < 8000) return;                               // ön darbe değil, yok say
  unsigned long ilkBit = pulseIn(IR_PIN, LOW, 20000);  // bir sonraki LOW darbe: ilk bitin darbesi
  Serial.print("On darbe: ");
  Serial.print(on);
  Serial.print(" us, ilk bit darbesi: ");
  Serial.print(ilkBit);
  Serial.println(" us");
}
```

Gerçek bir kumandada bir tuşa basınca ön darbe 9000 µs civarında, ilk bit darbesi 560 µs civarında çıkar. Gerçek kumandalarda değerler birkaç yüz mikrosaniye oynayabilir; zamanlama pil durumuna ve üretime göre değişir. Laboratuvarda IR kaynağı olmadığı için bu sketch derlenir ama D2'ye NEC darbeleri gelmediği sürece çıktı vermez.

### Program 2: NEC çözücüyü kendin yaz
Şimdi 32 biti oku ve komutu bul. Önemli bir ayrıntı: `pulseIn(HIGH)` çağrıldığında pin zaten LOW ise hemen bir sonraki HIGH'ı bekler ve onu ölçer. Boşluğun ardından LOW darbe geldiği için, `pulseIn(IR_PIN, HIGH)` çağrılarını **peş peşe** yaptığında her çağrı bir sonraki boşluğu ölçer. İlk çağrı ön boşluğu (4,5 ms), sonraki 32 çağrı 32 bitin boşluklarını verir.

```cpp
// sketch: nec_cozucu
const int IR_PIN = 2;
const int LED = 13;
const byte KOMUT_AC = 0x0C;      // kumandana göre değişir: önce yazdırıp bak
const byte KOMUT_KAPAT = 0x18;
const unsigned long BIT_ESIK = 1100;   // us: bundan uzun boşluk = 1

void hexYaz(byte b) {
  if (b < 16) Serial.print('0');
  Serial.print(b, HEX);
}

// Bir mesaj okur. Başarılıysa true döner; tekrar mesajıysa tekrar = true olur.
bool mesajOku(byte &adres, byte &komut, bool &tekrar) {
  unsigned long bosluk = pulseIn(IR_PIN, HIGH, 100000);    // ön boşluk
  if (bosluk == 0) return false;                           // sinyal yok
  if (bosluk > 2000 && bosluk < 2600) {                    // 2,25 ms: tekrar mesajı
    tekrar = true;
    return true;
  }
  if (bosluk < 4000 || bosluk > 5000) return false;        // 4,5 ms değil: gürültü
  tekrar = false;

  uint32_t veri = 0;
  for (int i = 0; i < 32; i++) {
    unsigned long b = pulseIn(IR_PIN, HIGH, 3000);         // i. bitin boşluğu
    if (b == 0 || b > 2200) return false;                  // beklenen süre dışında
    if (b > BIT_ESIK) veri |= (uint32_t)1 << i;            // uzun boşluk: i. biti 1 yap
  }

  adres = veri & 0xFF;
  byte adresTers = (veri >> 8) & 0xFF;
  komut = (veri >> 16) & 0xFF;
  byte komutTers = (veri >> 24) & 0xFF;
  if (komut != (byte)~komutTers) return false;             // ters kopya tutmuyor: bozuk
  (void)adresTers;                                         // genişletilmiş NEC'te tutmaz, denetlemiyoruz
  return true;
}

void setup() {
  Serial.begin(9600);
  pinMode(IR_PIN, INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  byte adres, komut;
  bool tekrar = false;
  if (!mesajOku(adres, komut, tekrar)) return;

  if (tekrar) {
    Serial.println("tekrar");
    return;
  }
  Serial.print("Adres: 0x");
  hexYaz(adres);
  Serial.print(" Komut: 0x");
  hexYaz(komut);
  Serial.println();

  if (komut == KOMUT_AC) digitalWrite(LED, HIGH);
  if (komut == KOMUT_KAPAT) digitalWrite(LED, LOW);
}
```

### Nasıl çalışıyor?
1. `pulseIn(IR_PIN, HIGH, 100000)` boşta bekler: pin HIGH iken önce o seviyenin bitmesini, yani ön darbenin gelmesini bekler. 100 ms içinde sinyal gelmezse `0` döner ve `loop` yeniden dener.
2. Ön boşluk 4,5 ms değilse mesaj başlamamıştır (ya da gürültüdür); `false` döner.
3. `veri |= (uint32_t)1 << i` ifadesi yeni bir kavram: `1 << i`, 1'i `i` basamak sola kaydırır (i = 3 için ikilik 1000, yani 8). `|=` ile bu bit `veri` içinde 1 yapılır. `uint32_t` 32 bitlik işaretsiz tam sayıdır; `int` yalnız 16 bit olduğu için 32 bitlik mesaja sığmaz.
4. Bitler en küçük bit önce geldiği için ilk gelen bit `veri`nin 0. bitine yazılır. Sonra `veri >> 16` ile komutu, `& 0xFF` ile alt 8 biti ayırırız.
5. `~komutTers`, baytın her bitini çevirir (`~` tümleyen). Komut ile tersi tutuyorsa mesaj sağlamdır.
6. `pulseIn` çağrıları **bloklar** (26. dersteki `delay` tuzağı gibi). Bu çözücü bekleme sırasında başka iş yapamaz. Küçük bir deney için yeterlidir, ama çok işli bir programda kütüphane daha uygundur.

### Program 3: IRremote kütüphanesi
Gerçek projelerde bu işi kütüphane yapar. Kütüphane pin değişimlerini kesme ve zamanlayıcıyla izler, bloklamaz ve onlarca protokolü tanır. IRremote 4.x sürümünde başlık dosyası `IRremote.hpp`'dir.

```cpp
// sketch: ir_kutuphane
#include <IRremote.hpp>

const int IR_PIN = 2;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(IR_PIN, ENABLE_LED_FEEDBACK);   // mesaj gelince dahili LED yanıp söner
}

void loop() {
  if (IrReceiver.decode()) {                       // yeni mesaj çözüldü mü?
    Serial.print("Protokol: ");
    Serial.print(getProtocolString(IrReceiver.decodedIRData.protocol));
    Serial.print(" Adres: 0x");
    Serial.print(IrReceiver.decodedIRData.address, HEX);
    Serial.print(" Komut: 0x");
    Serial.println(IrReceiver.decodedIRData.command, HEX);
    IrReceiver.resume();                           // bir sonraki mesaja hazırlan
  }
}
```

Bu kütüphane sketch'i laboratuvarda yalnız derlenir; IR alıcı parçası olmadığı için çıktı vermez. Kütüphanenin içinde bir zamanlayıcı kullanılır; aynı zamanlayıcıyı kullanan başka kütüphanelerle (örneğin `tone()`) çakışabilir. Kullandığın sürümün belgesine bak.

`decode()` mesaj varsa `true` döner, sonuç `decodedIRData` içindedir. İşin bitince `resume()` demezsen kütüphane yeni mesaj almaz.

### Dene
- Laboratuvarda butonu D2'ye bağla (`INPUT_PULLUP`) ve `pulseIn(2, LOW, 3000000)` ile basılı kaldığı süreyi mikrosaniye olarak yazdır. Kısa ve uzun basışta ölçümün nasıl değiştiğine bak.
- NEC'te ön darbe hep 9 ms, ön boşluk 4,5 ms'dir. Peki bir mesaj komut 0x00 iken mi, 0xFF iken mi daha uzun sürer? Dersteki bit sürelerinden hesapla (ipucu: ters kopya yüzünden kaç bit 1 olur?).
- Bir tuşa basılı tutulursa tekrar mesajları yaklaşık 108 ms'de bir gelir. 2 saniyede kaç tekrar mesajı beklersin?

### Sık yapılan hatalar
- Gerçek modülün bacaklarını ters bağlamak: modül bozulabilir. Bacak sırası modüle göre değişir.
- Kodları başka kumandadan alıp kendi kumandanda çalışmasını beklemek: her kumandanın adresi ve komutları farklıdır.
- `pulseIn(LOW)` ve `pulseIn(HIGH)` çağrılarını karıştırmak. Boşta pin HIGH'tır; ön darbe LOW'dur.
- Butonla denerken `INPUT_PULLUP` yazmayı unutmak: D2 boşta kalır, ölçüm anlamsızlaşır (IR modülde bu pull-up modülün içindedir).
- `1 << i` yerine `int` kullanıp 16. bitten sonrasını kaybetmek: 32 bit için `uint32_t` ve `(uint32_t)1 << i` gerekir.
- Gerçek devrede IR alıcıyı doğrudan güneş ya da parlak lamba ışığına bakacak şekilde koymak: alıcı sürekli tetiklenebilir.

## Konuşalım
Aynı odada iki farklı cihazın kumandasını aynı anda kullansan karışırlar mı? NEC mesajındaki adres alanı bu sorunu nasıl çözüyor? Ters kopyaların amacı sence nedir?
