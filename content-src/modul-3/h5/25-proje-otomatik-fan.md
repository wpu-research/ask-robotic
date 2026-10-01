# Proje: Sıcaklığa bağlı otomatik fan ve servo tarayıcı
süre: 35

## Merak
Bir bilgisayar kasasındaki fan, işlemci ısınınca hızlanır, soğuyunca yavaşlar. Sen de ortam ısınınca fanı kendiliğinden çalıştıran, üstelik servo ile ortamı tarayan bir sistem kurabilirsin. Bu hafta öğrendiklerin tek bir projede birleşiyor.

## Etkinlik
Sistemin görevi:
- NTC termistörden sıcaklığı oku (A2).
- Sıcaklık **30 °C** ve üstüne çıkınca fanı çalıştır. Hız, sıcaklık arttıkça artsın (30 °C'de yavaş, 50 °C ve üstünde tam hız).
- Sıcaklık **28 °C**'nin altına inene kadar fan kapanmasın (histerezis).
- Fan çalışırken servo 30-150 derece arasında tarasın; soğukken servo 90 dereceye park etsin.
- Sıcaklığı seri monitöre yaz.

### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| NTC termistör | **1** ucu **A2**, **2** ucu GND |
| 10 kΩ direnç | **1** ucu 5V, **2** ucu **A2** |
| NPN transistör | **E** → GND; **C** → fan motorunun **M2** ucu |
| 1 kΩ direnç | **1** ucu **D6**, **2** ucu transistörün **B** ucu |
| DC motor (fan) | **M1** → 5V; **M2** → transistör **C** |
| Diyot | **A** → transistör **C**; **K** (çizgili uç) → 5V (fan artısı) |
| Servo | **SIG** → **D9**; **VCC** → 5V; **GND** → GND |

Bu devre 13. dersteki ile aynıdır: NTC altta, sabit direnç üstte. Isındıkça NTC'nin direnci düşer ve A2'deki gerilim de düşer. Sıcaklık hesabını orada işledik: önce ADC değerinden NTC direncini, sonra Beta denklemiyle sıcaklığı buluruz.

Laboratuvarda fan ve servo Uno'nun 5V ucundan beslenir; ayrı bir kaynak ya da ortak GND bağlantısı gerekmez. Gerçek devrede fan ve servo aynı zayıf kaynaktan beslenince kart sıfırlanabilir; orada ayrı 5 V kaynak kullanılır ve GND'ler birleştirilir.

**Ortamı ısıtmak:** NTC parçasını seç ve sağ paneldeki **Sıcaklık** özelliğini değiştir. Bu özellik çalışırken de değişir. Varsayılan 25 °C'dir: fan kapalı, servo 90 derecede park olmalıdır. Sıcaklığı 45 °C yapınca fan dönmeli ve servo taramaya başlamalıdır. Sonra 29 °C'ye indir: histerezis nedeniyle fan hâlâ açık kalmalıdır. 27 °C'de kapanmalıdır.

**Sanal ölçüm:** Çalışırken NTC'yi, 10 kΩ direnci ve fan motorunu seç. NTC üzerindeki gerilim sıcaklıkla düşer; motor hızı da seçtiğin sıcaklığa göre artar.

### Program
```cpp
// sketch: fan_servo_proje
#include <Servo.h>

const int NTC_PIN = A2;
const int FAN_PIN = 6;          // PWM, transistör üzerinden fan
const int SERVO_PIN = 9;

const float SABIT_R = 10000.0;  // 10 kΩ sabit direnç
const float NTC_R25 = 10000.0;  // 25 °C'de 10 kΩ
const float BETA = 3950.0;

const float ACMA_C = 30.0;      // fan bu sıcaklıkta başlar
const float KAPAMA_C = 28.0;    // fan bu sıcaklığın altında durur

Servo tarayici;
bool fanAcik = false;
int aci = 90;
int yon = 2;                    // her adımda 2 derece
int sayac = 0;

float sicaklikOku() {
  int adc = analogRead(NTC_PIN);
  adc = constrain(adc, 1, 1022);                      // sıfıra bölmeyi önle
  float rntc = SABIT_R * adc / (1023.0 - adc);        // NTC altta (13. ders)
  float kelvin = 1.0 / (1.0 / 298.15 + log(rntc / NTC_R25) / BETA);
  return kelvin - 273.15;
}

void setup() {
  Serial.begin(9600);
  pinMode(FAN_PIN, OUTPUT);
  tarayici.attach(SERVO_PIN);
  tarayici.write(90);
}

void loop() {
  float sicak = sicaklikOku();

  // histerezisli açma/kapama
  if (!fanAcik && sicak >= ACMA_C) {
    fanAcik = true;
  } else if (fanAcik && sicak < KAPAMA_C) {
    fanAcik = false;
  }

  if (fanAcik) {
    // 30-50 °C arasını fan hızına çevir, çok düşük hızlarda motor dönmez
    int hiz = map((int)(sicak * 10), 300, 500, 90, 255);
    hiz = constrain(hiz, 90, 255);
    analogWrite(FAN_PIN, hiz);

    // servo bir adım ilerler
    aci = aci + yon;
    if (aci >= 150 || aci <= 30) {
      yon = -yon;                 // uca gelince yön değiştir
    }
    tarayici.write(aci);
  } else {
    analogWrite(FAN_PIN, 0);
    aci = 90;
    yon = 2;
    tarayici.write(90);           // park
  }

  sayac++;
  if (sayac >= 25) {              // yaklaşık yarım saniyede bir yazdır
    sayac = 0;
    Serial.print("Sicaklik: ");
    Serial.print(sicak, 1);
    Serial.print(" C  Fan: ");
    Serial.println(fanAcik ? "ACIK" : "KAPALI");
  }
  delay(20);
}
```

### Nasıl çalışıyor?
1. `sicaklikOku()` fonksiyonu A2'yi okur, NTC direncini ve sıcaklığı hesaplar. `constrain(adc, 1, 1022)` ADC sıfır ya da 1023 iken bölme hatasını engeller.
2. Fan kararı iki eşiklidir: 30 °C'de açılır, 28 °C'nin altında kapanır. 29 °C'de olduğu durumda kalır.
3. Hız, `map` ile 30-50 °C aralığından 90-255 PWM aralığına çevrilir. 90'ın altına inmeyiz, çünkü gerçek küçük motorlar düşük PWM'de dönmeye başlamaz.
4. Servo taramayı `loop` her döndüğünde yalnızca 2 derece ilerleterek yapar. Böylece sıcaklık her adımda yeniden okunur ve tarama sırasında bile fan kararı güncel kalır.
5. Fan kapanınca servo 90 dereceye park eder; kullandığımız `delay(20)` servoya hareket için zaman verir. Seri yazımı ise `sayac` seyreltir: her 25 turda bir (yaklaşık yarım saniyede bir) yazılır.

### Dene
- Eşikleri 26 ve 24 °C yap. Sıcaklık özelliğini 25 °C civarında oynatarak sistemi tetikle.
- Servo tarama aralığını 60-120 dereceye daralt.
- Sıcaklık 60 °C'yi geçince yalnızca seriye "UYARI" yazan bir koşul ekle. (Sıcaklık özelliği 120 °C'ye kadar çıkar.)

### Sık yapılan hatalar
- NTC ve sabit direnç yerleşimine uygun olmayan formülü kullanmak: sıcaklık ters ya da anlamsız çıkar.
- Fanı doğrudan D6'ya bağlamak: transistör ve diyot gerekir. Laboratuvar eksik diyotu "flyback" uyarısıyla, eksik baz direncini "taban akımı" uyarısıyla bildirir.
- NTC ve sabit direncin yerlerini değiştirmek: A2 hattının davranışı ters olur, kodun formülü de buna göre değişmelidir.
- Servoyu 5V ya da GND'ye bağlamayı unutmak: servo hiç hareket etmez.
- Histerezis koymamak: sıcaklık eşik civarındayken fan sürekli açılıp kapanır.
- Servo kullanırken D9 ve D10'dan `analogWrite` beklemek: Servo kütüphanesi bu iki pinin PWM'ini kapatır. Bu yüzden fan D6'dadır.

## Konuşalım
Fan hızını sıcaklığa orantılı yapmak yerine yalnız "aç/kapa" yapsaydın sistem nasıl davranırdı? Gerçek bir ürün olsaydı, servoyu hangi amaçla kullanırdın: yön göstermek, kapağı açmak, bir sensörü döndürmek?
