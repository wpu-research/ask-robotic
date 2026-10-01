# Kablosuz: Bluetooth (HC-05) ve WiFi — kod ve seri konsol
süre: 25

## Merak
Telefonundan bir tuşa basınca odandaki LED yanıyor. Arada kablo yok ama bir şey o komutu taşıyor. O şey aslında tanıdığın bir şey: **seri port**. Kablosuz modüller, 9. derste kullandığın `Serial` konuşmasını havadan taşır. Komutu doğru okuyan bir program yazarsan, kabloyla da Bluetooth'la da aynı kod çalışır.

## Etkinlik
### Fikir: kablosuz = kablosuz seri hat
HC-05 gibi bir Bluetooth modülü, telefondan gelen veriyi **UART** (seri) olarak karta verir ve karttan gelen seriyi telefona yollar. Arduino açısından bu, bir bilgisayarla `Serial` üzerinden konuşmaktan farklı değildir; yalnızca pinler başkadır.

Bu derste HC-05'in iki farklı modunu bilmen yeter:
- **Veri modu:** Normal çalışma. Telefondan gelen baytlar kartın RX pinine, kartın yazdıkları telefona gider.
- **AT komut modu:** Modülün adını, hızını ve benzeri ayarlarını değiştirmek için kullanılır. Bu moda nasıl girileceği ve hangi hızda konuşulacağı **modüle göre değişir**; modülünün veri sayfasına bak. Veri modunun varsayılan baud hızı da AT modunun hızı da modüle ve üretici yazılımına göre farklıdır; bir sayıyı ezberleme.

### Devre
| Parça | Bağlantı |
|---|---|
| HC-05 VCC | 5 V ya da modülün veri sayfasındaki besleme |
| HC-05 GND | GND |
| HC-05 TXD | **D10** (Arduino'nun yazılım RX'i) |
| HC-05 RXD | **D11** (Arduino'nun yazılım TX'i), arada gerilim bölücü |
| LED + 330 Ω direnç | **D13** → direnç → LED → GND |

HC-05'in RX girişi çoğu modülde 3,3 V mantığıyla çalışır; Arduino ise 5 V verir. Bu yüzden D11 ile HC-05 RXD arasına bir **gerilim bölücü** koy (12. ders): örneğin 1 kΩ + 2 kΩ ile 5 V yaklaşık 3,3 V'a iner. Kendi modülünün giriş seviyesi için veri sayfasına bak.

HC-05'i kartın donanım seri pinlerine (D0/D1) değil, **SoftwareSerial** ile seçtiğin iki pine bağlıyoruz: D0/D1 USB ile ortak olduğu için hem yüklemeyi bozar hem de Seri Monitör'ü işgal eder.

### SoftwareSerial ile kod
`SoftwareSerial`, istediğin iki pini yazılımla seri porta çevirir. Aşağıdaki sketch bir **köprü** kurar: Bluetooth'tan gelen her baytı Seri Monitör'e, Seri Monitör'den yazdığını Bluetooth'a iletir. Telefondan yazdıkların bilgisayarında görünür.

```cpp
// sketch: bt_kopru
#include <SoftwareSerial.h>

const int RX_PIN = 10;      // HC-05 TXD buraya
const int TX_PIN = 11;      // HC-05 RXD buraya (gerilim bölücüyle)
const long BT_HIZ = 9600;   // modüle göre değişir: veri sayfasına bak

SoftwareSerial bt(RX_PIN, TX_PIN);

void setup() {
  Serial.begin(9600);
  bt.begin(BT_HIZ);
  Serial.println("Kopru hazir");
}

void loop() {
  if (bt.available()) {
    Serial.write(bt.read());
  }
  if (Serial.available()) {
    bt.write(Serial.read());
  }
}
```

Bu sketch gerçek bir HC-05 gerektirir; simülatörde bu modül olmadığı için burada **yalnızca derlenir**, çalıştığını gösteremeyiz.

### Komut ayrıştırıcı: aynı protokol, kabloyla test
Kablosuz bir uygulamanın kartı kontrol etmesi için bir **protokol** gerekir: ortak bir komut biçimi. Biz basit bir metin protokolü kullanıyoruz; her komut tek satırdır ve `\n` ile biter:

| Satır | Anlamı | Cevap |
|---|---|---|
| `LED:1` | LED yansın | `OK LED=1` |
| `LED:0` | LED sönsün | `OK LED=0` |
| `DURUM?` | LED şimdi ne durumda? | `LED=0` ya da `LED=1` |
| başka bir şey | tanınmayan komut | `HATA: ...` |

Aşağıdaki program satır satır okur. Önemli nokta: komutların gelip gittiği portu `Stream &hat` adlı bir değişkenle seçiyoruz. `Stream`, `Serial` ve `SoftwareSerial`'in ortak türüdür; yani aynı ayrıştırıcıyı Bluetooth'a bağlamak için yalnızca portu tanımlayan satırları değiştirirsin (aşağıdaki yorum satırına bak) ve `bt.begin(...)` eklersin. Burada test için `Serial` (USB) kullanıyoruz:

```cpp
// sketch: komut_ayristirici
const int LED = 13;
const int TAMPON = 16;

char satir[TAMPON];
int uzunluk = 0;
bool tasti = false;           // satır tampondan uzun mu?

Stream &hat = Serial;         // Bluetooth için: SoftwareSerial bt(10, 11); Stream &hat = bt;

void komutIsle(const char *s) {
  if (strcmp(s, "LED:1") == 0) {
    digitalWrite(LED, HIGH);
    hat.println("OK LED=1");
  } else if (strcmp(s, "LED:0") == 0) {
    digitalWrite(LED, LOW);
    hat.println("OK LED=0");
  } else if (strcmp(s, "DURUM?") == 0) {
    hat.print("LED=");
    hat.println(digitalRead(LED));
  } else {
    hat.print("HATA: ");
    hat.println(s);
  }
}

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  while (hat.available()) {
    char c = hat.read();
    if (c == '\r') continue;                  // Windows satır sonunu yok say
    if (c == '\n') {
      satir[uzunluk] = 0;                     // metni bitir
      if (tasti) {
        hat.println("HATA: satir cok uzun");
      } else if (uzunluk > 0) {
        komutIsle(satir);
      }
      uzunluk = 0;
      tasti = false;
    } else if (uzunluk < TAMPON - 1) {
      satir[uzunluk++] = c;
    } else {
      tasti = true;                           // tampon doldu: satır sonuna kadar yut
    }
  }
}
```

Aynı ayrıştırıcının Bluetooth sürümünü, yalnızca portu değiştirerek yazıyoruz. Bu da derlenir ama gerçek modül gerektirir:

```cpp
// sketch: bt_komut
#include <SoftwareSerial.h>

const int LED = 13;
SoftwareSerial bt(10, 11);    // RX, TX
Stream &hat = bt;             // ayrıştırıcı artık Bluetooth'tan okur
char satir[16];
int uzunluk = 0;

void setup() {
  pinMode(LED, OUTPUT);
  bt.begin(9600);             // hız modüle göre değişir: veri sayfasına bak
}

void loop() {
  while (hat.available()) {
    char c = hat.read();
    if (c == '\n') {
      satir[uzunluk] = 0;
      if (strcmp(satir, "LED:1") == 0) digitalWrite(LED, HIGH);
      if (strcmp(satir, "LED:0") == 0) digitalWrite(LED, LOW);
      uzunluk = 0;
    } else if (c != '\r' && uzunluk < 15) {
      satir[uzunluk++] = c;
    }
  }
}
```

### WiFi: yalnızca kavram
WiFi modülleri (ESP8266, ESP32) çoğu zaman karttan daha güçlü küçük bilgisayarlardır. İki yolla kullanılırlar:
- **AT komutları:** Modül üzerindeki hazır yazılım, seri hattan gelen metin komutlarına göre WiFi'ye bağlanır ve bağlantı açar. Komut listesi yazılım sürümüne göre değişir; ilgili belgeye bak.
- **Modülün kendisini programlamak:** ESP32 gibi kartlar Arduino IDE ile doğrudan programlanabilir ve WiFi'yi kendi kodlarında kullanır.

İnternet üzerinden veri taşımak için iki yaygın fikir:
- **HTTP:** İstek-cevap. Kart bir sunucuya "şu sıcaklığı kaydet" ya da "komut var mı?" diye sorar, cevap alır.
- **MQTT:** Yayın-abone. Kart bir "konu"ya mesaj yayınlar; o konuya abone olan telefon ya da başka kart mesajı alır. Aracı olan sunucuya **broker** denir.

WiFi modülleri çoğu zaman 3,3 V mantığıyla çalışır; 5 V'luk bir pini doğrudan bağlama. WiFi'yi bu kursta **simüle edemiyoruz**: ağ, yönlendirici ve sunucu simülatörde yok. Bu yüzden WiFi bölümü kod değil, anlatımdır.

### Nasıl çalışıyor?
1. `komut_ayristirici` karakterleri bir `char` dizisine (tampon) biriktirir; metin dizisinin sonunu `0` baytı belirler. `\n` gelince tamponu bir komut sayar ve `strcmp` ile komut listesiyle karşılaştırır.
2. Tampon dolarsa satırın kalanı yutulur ve `HATA: satir cok uzun` cevabı verilir; böylece uzun, bozuk bir satır belleği taşırmaz.
3. Cevap, komutun geldiği porta (`hat`) geri yazılır. Böylece aynı kod USB'de de Bluetooth'ta da çalışır.
4. `bt_kopru` ve `bt_komut`, `SoftwareSerial` ile D10/D11'i seri port yapar.

### Dene
- `komut_ayristirici`'ye `ROLE:1` ve `ROLE:0` komutları ekle (röle D7).
- Protokole `ISIK?` gibi bir sorgu ekle; cevap olarak `analogRead(A1)` değerini yaz.
- Telefona bir "seri Bluetooth terminal" uygulaması kurup `bt_komut` ile LED'i dene (yalnızca gerçek donanımda).

### Sık yapılan hatalar
- HC-05'i D0/D1'e bağlayıp yükleme sırasında bağlantı hatası almak.
- HC-05 RX girişine 5 V'u doğrudan vermek.
- İki tarafta baud hızı farklı olmak: bozuk karakterler görürsün.
- Satır sonu karakterini (`\n`, `\r`) hesaba katmamak: komut `LED:1\r` olur ve hiçbir şeye eşleşmez.
- Varsayılan hızı ya da AT modu girişini ezbere yazmak; modülden modüle değişir, veri sayfasına bak.

## Konuşalım
Kablosuz bir kapıya "aç" komutu gönderen telefonu düşün. Komutu bir başkası da gönderebilir mi? Bu derste yazdığın protokolde bunu engelleyen bir şey var mı?
