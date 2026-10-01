# Röle: yüksek akım anahtarlama ve güvenlik
süre: 20

## Merak
Transistör küçük motorları sürdü, ama bazen daha büyük bir yükü ya da Arduino'dan tamamen ayrı bir devreyi açıp kapatmak gerekir. "Tık" sesi çıkaran küçük bir kutu bunu yapar: röle. İçinde ne olduğunu ve neden bu kadar dikkat gerektirdiğini birlikte öğrenelim.

## Güvenlik uyarısı
Bu derste yalnızca **düşük gerilimli** devreler kurulur: Arduino'nun 5 V'u, 4 x AA pil kutusu ya da en çok 12 V'luk bir DC kaynak. **Şebeke gerilimi (220 V) ile ASLA devre kurma.** Prize bağlanan bir cihazı röleyle açıp kapatmaya çalışmak ölümcül olabilir. Röle modülünün üzerindeki yüksek gerilim yazıları senin kuracağın devre için geçerli değildir. Röle ile ilgili her deneyi bir yetişkinin gözetiminde yap.

## Etkinlik
Röle, bir **elektromıknatıs** ile çalışan anahtardır. Bobine akım verince mıknatıs bir metal kolu çeker ve kontaklar kapanır. Arduino ile açıp kapattığın devre (kontak tarafı) bobin devresinden elektriksel olarak ayrıdır. Kontak tarafı kendi gerilimini taşımayan, yalnız bir anahtar gibi davranan bir devredir; buna **kuru kontak** denir.

Röle modülünde bobini süren transistör, diyot ve genelde bir LED hazır gelir. Üç pini vardır: VCC (5 V), GND ve IN (sinyal). Kontak tarafında üç vida klemensi bulunur:

- **COM**: ortak uç
- **NO** (normalde açık): röle çekilmeyince açık, çekilince COM'a bağlanır
- **NC** (normalde kapalı): röle çekilmeyince COM'a bağlı, çekilince açılır

Çoğu modül **LOW ile çeker**: IN pinine `LOW` verince röle çeker, `HIGH` verince bırakır. Bazı modüller tersidir; modülünün yazısına bak ya da kısa bir denemeyle öğren. Bu derste LOW ile çeken modül varsayıyoruz.

### Devre
| Parça | Bağlantı |
|---|---|
| Röle modülü | VCC → 5 V, GND → GND, IN → **D7** |
| Kontak tarafı: pil kutusu (+) | Röle COM ucuna |
| Küçük yük (5 V LED + 330 Ω direnç ya da küçük 5 V fan) | Bir ucu röle NO ucuna, öbür ucu pil kutusunun eksisine |
| Buton | **D2** ile GND arası |
| Potansiyometre (ikinci sketch) | Orta bacak → **A0** |

Kontak tarafında yalnızca 4 x AA pil gibi düşük gerilimli bir kaynak kullan. Yük akımı, rölenin üzerinde yazan kontak akım değerinin çok altında kalmalı; biz en çok birkaç yüz mA'lik küçük yüklerle çalışıyoruz.

### Program
İlk sketch butona her basışta röleyi değiştirir. Röle modülü LOW ile çektiği için "kapalı" durumu `HIGH`'tır. Pini çıkış yapmadan önce `HIGH` yazarak açılışta rölenin bir anlığına tıklamasını önleriz.

```cpp
// sketch: role_buton
const int ROLE = 7;
const int BUTON = 2;
bool acik = false;

void setup() {
  digitalWrite(ROLE, HIGH);        // önce kapalı durumu yaz
  pinMode(ROLE, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {     // basıldı
    acik = !acik;                      // durumu ters çevir
    if (acik) {
      digitalWrite(ROLE, LOW);         // röle çeker
    } else {
      digitalWrite(ROLE, HIGH);        // röle bırakır
    }
    delay(50);
    while (digitalRead(BUTON) == LOW) {
      // buton bırakılana kadar bekle
    }
    delay(50);
  }
}
```

İkinci sketch bir sensör değerine göre röleyi açar ve kapatır. A0'daki potansiyometre bir sıcaklık sensörünü taklit eder. Açma eşiği (600) ile kapama eşiği (500) farklıdır. Bu farka **histerezis** denir.

```cpp
// sketch: role_esik
const int ROLE = 7;
const int ACMA = 600;     // bunun üstünde röle çeker
const int KAPAMA = 500;   // bunun altında röle bırakır

bool acik = false;

void setup() {
  digitalWrite(ROLE, HIGH);
  pinMode(ROLE, OUTPUT);
}

void loop() {
  int deger = analogRead(A0);
  if (!acik && deger > ACMA) {
    acik = true;
    digitalWrite(ROLE, LOW);
  } else if (acik && deger < KAPAMA) {
    acik = false;
    digitalWrite(ROLE, HIGH);
  }
  delay(50);
}
```

### Nasıl çalışıyor?
1. Röle bobini transistör ya da modülün kendi sürücüsü üzerinden beslenir. Bobin de bir motor gibi akım kesilince gerilim sıçraması üretir. Bu yüzden bobine flyback diyot gerekir; modülde bu diyot hazırdır.
2. `role_buton` basışı bir kez sayar: butona basılı tutsan bile durum yalnız bir kez değişir.
3. `role_esik` iki ayrı eşik kullanır. Değer 500 ile 600 arasındayken röle olduğu durumda kalır.
4. Tek eşik kullansaydın, değer eşiğin etrafında titrerken röle sürekli tıklar, kontaklar yıpranırdı. Histerezis bunu engeller.
5. Röle bir mekanik parçadır ve ömrü sınırlıdır. Saniyede onlarca kez açıp kapatma, PWM gibi hızlı anahtarlama için kullanma. Hız ayarı gereken yerde transistör ya da MOSFET kullan.

### Dene
- `role_esik` içinde eşikleri 520 ve 480 yap. Histerezis aralığı daralınca ne değişir?
- `role_buton` programını, röle açıkken seri monitöre "ACIK", kapalıyken "KAPALI" yazdıracak şekilde genişlet.
- Röleyi NC ucuna bağladığında yük hangi durumda çalışır? Dene ve not al.

### Sık yapılan hatalar
- Şebeke gerilimi (220 V) bağlamak: yapma. Yalnız düşük gerilim ve yetişkin gözetimi.
- Röle modülünün LOW/HIGH mantığını bilmemek: röle açılışta çekili kalabilir. `pinMode`'dan önce `HIGH` yazmak bu durumu azaltır.
- Röleyi çıplak (modülsüz) doğrudan pine bağlamak: bobin akımı pin için fazladır ve diyotsuz sıçrama pine zarar verir.
- COM, NO ve NC uçlarını karıştırmak: yük ters mantıkla çalışır.
- Kontak devresinde yük akımını kontak değerinin üstüne çıkarmak: kontaklar yapışır ya da yanar.

## Konuşalım
Rölenin kontak tarafı Arduino'dan elektriksel olarak ayrıdır. Bu ayrılığın sana hangi güvenliği sağladığını ve hangisini sağlamadığını düşün. Şebeke gerilimi kullanmak için bir kişinin hangi bilgi ve ekipmana sahip olması gerekir?
