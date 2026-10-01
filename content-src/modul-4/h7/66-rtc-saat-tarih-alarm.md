# RTC: saat, tarih, alarm
süre: 25

## Merak
`millis()` kart açılınca sıfırdan saymaya başlar, fişi çekince her şeyi unutur. "Dün gece saat kaçta sıcaklık yükseldi?" sorusuna bununla cevap veremezsin. Duvar saati gibi fişsiz de akan, tarihi ve saati bilen bir saat gerekir. Bu işi **RTC** (Real Time Clock, gerçek zaman saati) modülü yapar. Bu derste onu laboratuvarda Arduino'ya bağlayıp saati okuyacak, ayarlayacak ve kendi alarmını yazacaksın.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| RTC | SDA → Uno **A4**, SCL → Uno **A5**, VCC → **5V**, GND → **GND** |
| Direnç (özellik panelinden 330 Ω) + LED | Uno **D13** → direnç **1**; direnç **2** → LED **A**; LED **K** → **GND** (yalnız alarm programı) |
| Buzzer (Tür: Pasif) | **+** → Uno **D8**; **-** → **GND** (yalnız alarm programı) |

RTC modülü I2C ile konuşur (33. ders) ve adresi **0x68**'dir. Laboratuvarda RTC'yi 5V'a bağlıyoruz; gerçek modüllerin besleme aralığı model modele değişir, kullanılan modülün veri sayfasına bakılır.

**Bilgi notu:** Gerçek modülde bir **yedek pil yuvası** vardır. Ana güç kesilince saati bu pil çalıştırmaya devam eder; pil yoksa ya da bittiyse güç kesilince saat unutulur ve yeniden ayarlanması gerekir. Laboratuvar pili ve güç kesintisini modellemez: her ▶'e bastığında (ya da ↺ Sıfırla'dan sonra) RTC **2026-01-01 00:00:00**'dan başlar ve `rtc.lostPower()` her zaman `false` döner. Saati istediğin değere `rtc.adjust()` ile kurarsın (aşağıda).

Dikkat: MPU6050 ivme sensörü de varsayılan olarak 0x68 adresini kullanır. Aynı I2C hattına ikisini birden bağlarsan çakışırlar. (MPU6050'nin AD0 ucu 5V'a bağlanırsa adresi 0x69 olur ve çakışma biter; laboratuvarda parçanın "I2C adresi" özelliği bunu seçtirir.) Bu kursta MPU6050 ile RTC'yi aynı devrede kullanmayacağız.

### Program: saati oku
Kütüphane olarak **RTClib** kullanıyoruz. DS3231 için sınıfın adı `RTC_DS3231`.

```cpp
// sketch: rtc_saat
#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;
unsigned long sonOkuma = 0;

void iki(int n) {                     // 5 -> "05"
  if (n < 10) Serial.print('0');
  Serial.print(n);
}

void setup() {
  Serial.begin(9600);
  if (!rtc.begin()) {                 // modül I2C hattında yoksa false
    Serial.println("RTC bulunamadi");
    while (true) {}
  }
  if (rtc.lostPower()) {              // saat durmuşsa (pil bitti, hiç kurulmadı)
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
}

void loop() {
  if (millis() - sonOkuma >= 1000) {
    sonOkuma = millis();
    DateTime t = rtc.now();
    Serial.print(t.year()); Serial.print('-'); iki(t.month()); Serial.print('-'); iki(t.day());
    Serial.print(' ');
    iki(t.hour()); Serial.print(':'); iki(t.minute()); Serial.print(':'); iki(t.second());
    Serial.println();
  }
}
```

`rtc.now()` o anki zamanı bir `DateTime` nesnesi olarak verir. `year()`, `month()`, `day()`, `hour()`, `minute()`, `second()` ile parçalarını alırsın. Tek haneli sayıların başına 0 koyan `iki()` fonksiyonu "8:5:3" yerine "08:05:03" yazdırır.

`rtc.lostPower()` çipin tuttuğu bir bayrağı okur: osilatör durmuşsa bayrak kalkar. O zaman saati `DateTime(F(__DATE__), F(__TIME__))` ile ayarlıyoruz. `__DATE__` ve `__TIME__` programı **derlediğin** anın tarihi ve saatidir. Gerçek kartta yükleme birkaç saniye sürdüğü için kurulan saat o kadar geride olur. Laboratuvarda `lostPower()` hep `false` olduğundan bu satır çalışmaz; saat 2026-01-01 00:00:00'dan başlar ve çıktın `2026-01-01 00:00:01`, `2026-01-01 00:00:02` ... diye akar.

### Program: saati kendin ayarla
Saati istediğin değere `rtc.adjust()` ile kurarsın. Aşağıdaki program önce saati okur, sonra gece yarısından 5 saniye öncesine ayarlar, sonra tekrar okur. Gün değişimini ve haftanın gününü de görürsün.

```cpp
// sketch: rtc_ayarla
#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;
const char* GUNLER[] = {"Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi"};
unsigned long sonOkuma = 0;

void iki(int n) {
  if (n < 10) Serial.print('0');
  Serial.print(n);
}

void yaz(DateTime t) {
  Serial.print(t.year()); Serial.print('-'); iki(t.month()); Serial.print('-'); iki(t.day());
  Serial.print(' ');
  iki(t.hour()); Serial.print(':'); iki(t.minute()); Serial.print(':'); iki(t.second());
  Serial.print(' ');
  Serial.println(GUNLER[t.dayOfTheWeek()]);   // 0 = Pazar
}

void setup() {
  Serial.begin(9600);
  rtc.begin();

  Serial.print("Once:  ");
  yaz(rtc.now());

  rtc.adjust(DateTime(2026, 3, 14, 23, 59, 55));   // yıl, ay, gün, saat, dakika, saniye

  Serial.print("Sonra: ");
  yaz(rtc.now());
}

void loop() {
  if (millis() - sonOkuma >= 1000) {
    sonOkuma = millis();
    yaz(rtc.now());
  }
}
```

Çıktının başı şuna benzer: `Once:` satırında RTC'nin eski değeri (laboratuvarda `2026-01-01 00:00:00 Persembe`), `Sonra:` satırında `2026-03-14 23:59:55 Cumartesi` görürsün. Birkaç saniye sonra saat 23:59:59'dan `2026-03-15 00:00:00`'a geçer ve gün adı Pazar olur. RTC takvimi de bilir: ay sonlarında günü kendisi değiştirir. Yaz saati uygulamasını ya da saat dilimini bilmez; yalnızca senin verdiğin sayıları sayar.

### Program: kendi alarmımız
Bazı RTC çiplerinde donanım alarmı vardır, ama DS1307'de yoktur. Biz her iki çipte de çalışacak yolu seçiyoruz: saati düzenli aralıkla oku, alarm saatiyle karşılaştır. Okumayı `millis()` ile çeyrek saniyede bir yapıyoruz (27. ders); `delay` yok, böylece `loop()` başka işlere de bakabilir.

```cpp
// sketch: rtc_alarm
#include <Wire.h>
#include <RTClib.h>

const int LED = 13;
const int BUZZER = 8;
const int ALARM_SAAT = 7;
const int ALARM_DAKIKA = 30;
const unsigned long KONTROL_ARALIGI = 250;   // ms: RTC'ye çeyrek saniyede bir bak
const unsigned long ALARM_SURESI = 5000;     // ms: alarm 5 saniye çalsın

RTC_DS3231 rtc;
unsigned long sonKontrol = 0;
unsigned long alarmBasla = 0;
bool alarmCaliyor = false;
int sonTetikGunu = -1;                       // alarmın son çaldığı ayın günü

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  rtc.begin();
  rtc.adjust(DateTime(2026, 3, 14, 7, 29, 55));   // gösteri için: alarmdan 5 sn önce
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonKontrol >= KONTROL_ARALIGI) {
    sonKontrol = simdi;
    DateTime t = rtc.now();
    bool saatGeldi = (t.hour() == ALARM_SAAT && t.minute() == ALARM_DAKIKA);
    if (saatGeldi && !alarmCaliyor && t.day() != sonTetikGunu) {
      sonTetikGunu = t.day();
      alarmCaliyor = true;
      alarmBasla = simdi;
      digitalWrite(LED, HIGH);
      tone(BUZZER, 1000);
      Serial.println("ALARM 07:30");
    }
  }

  if (alarmCaliyor && simdi - alarmBasla >= ALARM_SURESI) {
    alarmCaliyor = false;
    digitalWrite(LED, LOW);
    noTone(BUZZER);
  }
}
```

Program başlarken saati 07:29:55'e kuruyor, böylece alarm 5 saniye sonra çalışır: LED yanar, buzzer pininde (D8) 1000 Hz'lik ton başlar ve seri monitörde `ALARM 07:30` yazar. Gerçek bir alarmda `setup()` içindeki `rtc.adjust` satırını silersin.

### DS1307 ile fark
Piyasada iki yaygın RTC çipi var. İkisi de I2C'de **0x68** adresini kullanır ve RTClib ile aynı biçimde okunur. Laboratuvardaki RTC parçası tek türdür; DS1307 kodunu da bu parçayla çalıştırabilirsin.

| | DS3231 | DS1307 |
|---|---|---|
| RTClib sınıfı | `RTC_DS3231` | `RTC_DS1307` |
| Saat kristali | Çipin içinde, sıcaklığa göre kendini düzelten (sıcaklık kompanzasyonlu) | Dışarıdan takılan kristal; sıcaklıktan etkilenir |
| Doğruluk | Genelde DS1307'den belirgin biçimde daha iyi; kesin değer için veri sayfasına bak | Daha çok sapar |
| Alarm | Donanım alarmı var | Yok |
| "Saat durdu mu?" | `lostPower()` | `isrunning()` |

DS1307'ye geçmek için kodda yalnızca sınıf adını ve bu kontrolü değiştirirsin:

```cpp
// sketch: rtc_ds1307
#include <Wire.h>
#include <RTClib.h>

RTC_DS1307 rtc;                              // tek fark: sınıf adı
unsigned long sonOkuma = 0;

void setup() {
  Serial.begin(9600);
  rtc.begin();
  if (!rtc.isrunning()) {                    // DS1307'de "saat çalışıyor mu?" kontrolü
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
}

void loop() {
  if (millis() - sonOkuma >= 1000) {
    sonOkuma = millis();
    Serial.println(rtc.now().timestamp());   // ISO 8601: 2026-03-14T08:30:01
  }
}
```

`timestamp()` zamanı tek bir yazı olarak verir: yıl-ay-günTsaat:dakika:saniye. Bu biçimin neden iyi olduğunu 68. derste göreceksin.

### Nasıl çalışıyor?
1. RTC çipi kendi kristaliyle saniyeleri sayar ve tarihi tutar. Arduino sadece I2C ile ona sorar.
2. `rtc.now()` çipin yazmaçlarını okur ve sana `DateTime` verir. Her çağrıda I2C trafiği olur, bu yüzden `loop()` içinde saniyede birkaç kez bakmak yeter.
3. `rtc.adjust()` çipin saatini değiştirir. Çip pil sayesinde bu değeri güç kesilse de korur.
4. Alarm, RTC'den okunan saat ile hedef saatin karşılaştırmasıdır. `sonTetikGunu` alarmın aynı dakika boyunca tekrar tekrar çalmasını engeller ve ertesi gün yine çalmasına izin verir.

### Dene
- `rtc_ayarla` programında tarihi `DateTime(2027, 2, 28, 23, 59, 55)` yap. Gece yarısından sonra hangi tarih ve gün adı çıkıyor? Neden? (2027 artık yıl değildir.)
- `rtc_alarm` programında alarm süresini 2 saniyeye düşür, sonra alarmı yalnız hafta içi (Pazartesi-Cuma) çalacak biçimde değiştir. İpucu: `t.dayOfTheWeek()` 1 ile 5 arasında olmalı.
- `rtc_saat` programını çalıştır, 10 saniye bekle, ■ ile durdurup yeniden ▶'e bas. Saat nereden başlıyor? Gerçek modülde yedek pil takılıyken sonuç ne olurdu, pil yokken ne olurdu?

### Sık yapılan hatalar
- `rtc.adjust(DateTime(F(__DATE__), F(__TIME__)))` satırını koşulsuz `setup()` içine koymak: kart her açıldığında saat derleme anına geri döner. Yalnızca `lostPower()` doğruysa ayarla.
- MPU6050 ile RTC'yi aynı hatta bağlamak: ikisi de 0x68 kullanır.
- Saati `millis()` ile tutmaya çalışıp RTC'yi gereksiz saymak: `millis()` güç kesilince sıfırlanır, RTC kalır.
- Alarmı `t.second() == 0` kontrolüyle yazıp RTC'yi seyrek okumak: o saniyeyi kaçırırsın. Okuma aralığını 1 saniyeden kısa tut ve "bugün çaldı mı?" bayrağı kullan.
- SDA ile SCL'yi ters bağlamak ya da VCC/GND'yi eksik bırakmak: program "RTC bulunamadi" yazar.

## Konuşalım
Okul zili ya da ilaç hatırlatıcı yapsan alarmı Arduino'nun `millis()` saatine mi, RTC'ye mi bağlarsın? Elektrik kesilip geldiğinde ikisi ne yapar?
