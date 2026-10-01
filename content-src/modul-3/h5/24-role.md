# Röle: yüksek akım anahtarlama ve güvenlik
süre: 20

## Merak
Transistör küçük motorları sürdü, ama bazen daha büyük bir yükü ya da Arduino'dan tamamen ayrı bir devreyi açıp kapatmak gerekir. "Tık" sesi çıkaran küçük bir kutu bunu yapar: röle. İçinde ne olduğunu ve neden bu kadar dikkat gerektirdiğini birlikte öğrenelim.

## Güvenlik uyarısı
Sanal laboratuvarda yalnızca **düşük gerilimli** devreler kurulur: Uno'nun 5 V'u yeterlidir ve laboratuvar şebeke gerilimi sunmaz. Gerçek hayatta **şebeke gerilimi (220 V)** ölümcüldür; röleyle prize bağlı bir cihazı açıp kapatmak, bu işin eğitimini almış ve gerekli donanıma sahip bir uzmana aittir. Bir röle modülünün üzerinde "250 V" yazması, onu kendi başına güvenle kullanabileceğin anlamına gelmez. Burada öğrendiğin mantık (COM, NO, NC, aktif-LOW) düşük gerilimde de aynıdır.

## Etkinlik
Röle, bir **elektromıknatıs** ile çalışan anahtardır. Bobine akım verince mıknatıs bir metal kolu çeker ve kontaklar kapanır. Arduino ile açıp kapattığın devre (kontak tarafı) bobin devresinden elektriksel olarak ayrıdır. Kontak tarafı kendi gerilimini taşımayan, yalnız bir anahtar gibi davranan bir devredir; buna **kuru kontak** denir.

Röle modülünde bobini süren transistör, diyot ve genelde bir LED hazır gelir. Modülün üç giriş pini vardır: VCC (5 V), GND ve IN (sinyal). Kontak tarafında üç uç bulunur:

- **COM**: ortak uç
- **NO** (normalde açık): röle çekilmeyince açık, çekilince COM'a bağlanır
- **NC** (normalde kapalı): röle çekilmeyince COM'a bağlı, çekilince açılır

Piyasadaki modüllerin çoğu (özellikle optokuplörlü olanlar) **LOW ile çeker**: IN pinine `LOW` verince röle çeker, `HIGH` verince bırakır. Bazı modüller tersidir; gerçek modülde yazısına bakar ya da kısa bir denemeyle öğrenirsin. Laboratuvardaki röle parçasında bu, **Tetik** özelliğidir: "HIGH ile çeker" (varsayılan) ya da "LOW ile çeker (aktif-LOW)". Bu derste LOW ile çeken modül varsayıyoruz; bu yüzden röleyi ekledikten sonra Tetik'i **LOW ile çeker** yap. Röle modülü çalışmak için VCC'sinde 4 V'tan fazla gerilim ister; VCC ya da GND bağlı değilse röle hiç çekmez.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| Röle modülü | **VCC** → 5V, **GND** → GND, **IN** → **D7**; özelliklerde Tetik: LOW ile çeker |
| Kontak tarafı | Röle **COM** ucu → Uno 5V |
| Küçük yük: 330 Ω direnç + LED | Röle **NO** ucu → direncin **1** ucu; direncin **2** ucu → LED **A**; LED **K** → GND |
| Buton | **A** ucu **D2**, **B** ucu GND |
| Potansiyometre (ikinci sketch) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

Laboratuvarda kontak tarafındaki gerilim de Uno'nun 5V ucundan gelir. Kontak tarafı ile bobin tarafı elektriksel olarak ayrı olsa da bu kolaylık için aynı 5V hattını kullanıyoruz. Gerçek devrede yük akımı, rölenin üzerinde yazan kontak akım değerinin çok altında kalmalıdır; biz burada en çok birkaç yüz mA'lik küçük yüklerle çalışıyoruz (LED yaklaşık 9 mA çeker).

**Sanal ölçüm:** ▶'e bas, rölenin çekip bıraktığı sırada direnci ya da LED'i seç. Röle çekmişken LED'den yaklaşık 9 mA geçtiğini, bırakınca akımın sıfıra indiğini görürsün.

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
- `role_esik` içinde eşikleri 520 ve 480 yap. Histerezis aralığı daralınca ne değişir? Potansiyometrenin Konum özelliğini yavaşça değiştirerek röleyi izle.
- `role_buton` programını, röle açıkken seri monitöre "ACIK", kapalıyken "KAPALI" yazdıracak şekilde genişlet.
- Yükü NO yerine NC ucuna bağla. Yük hangi durumda çalışıyor? Dene ve not al.
- Tetik özelliğini "HIGH ile çeker" yap ve `role_buton` ile ▶'e bas. Ne oluyor? Neden?

### Sık yapılan hatalar
- Şebeke gerilimi (220 V) ile röle denemeye kalkmak: asla. Bu iş yalnız eğitimli bir uzmana aittir; laboratuvarda 5 V yeter.
- Röle modülünün LOW/HIGH mantığını bilmemek: röle açılışta çekili kalabilir. `pinMode`'dan önce `HIGH` yazmak bu durumu azaltır. Laboratuvarda Tetik özelliğinin yanlış olması aynı karışıklığı doğurur.
- Röleyi çıplak (modülsüz) doğrudan pine bağlamak: bobin akımı pin için fazladır ve diyotsuz sıçrama pine zarar verir.
- COM, NO ve NC uçlarını karıştırmak: yük ters mantıkla çalışır.
- Röle modülünün VCC ya da GND'sini bağlamamak: röle çekmez, "röle modülü beslenmemiş" uyarısı çıkar.
- Gerçek devrede kontak akımını kontak değerinin üstüne çıkarmak: kontaklar yapışır ya da yanar.

## Konuşalım
Rölenin kontak tarafı Arduino'dan elektriksel olarak ayrıdır. Bu ayrılığın sana hangi güvenliği sağladığını ve hangisini sağlamadığını düşün. Şebeke gerilimi kullanmak için bir kişinin hangi bilgi ve ekipmana sahip olması gerekir?
