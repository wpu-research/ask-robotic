// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/parcalar/ · Komut: node tools/content/build.mjs parcalar
import type { ComponentGuide } from './types'

export const parcalar: ComponentGuide[] = [
  {
    "slug": "arduino-uno",
    "title": "Arduino Uno",
    "partType": "uno",
    "category": "Kart",
    "summary": "ATmega328P mikrodenetleyicili geliştirme kartı. Programı çalıştırır, pinleriyle devreyi sürer ve okur.",
    "pins": [
      {
        "name": "D0",
        "description": "Dijital pin 0 (seri haberleşme RX ile paylaşılır; derslerde LED/butonda kullanılmaz)"
      },
      {
        "name": "D1",
        "description": "Dijital pin 1 (seri haberleşme TX ile paylaşılır)"
      },
      {
        "name": "D2",
        "description": "Dijital pin 2. Bu sitede ilk buton girişi"
      },
      {
        "name": "D3",
        "description": "Dijital pin 3 (PWM). Bu sitede ikinci buton girişi"
      },
      {
        "name": "D4",
        "description": "Dijital pin 4"
      },
      {
        "name": "D5",
        "description": "Dijital pin 5 (PWM)"
      },
      {
        "name": "D6",
        "description": "Dijital pin 6 (PWM)"
      },
      {
        "name": "D7",
        "description": "Dijital pin 7"
      },
      {
        "name": "D8",
        "description": "Dijital pin 8. Bu sitede buzzer"
      },
      {
        "name": "D9",
        "description": "Dijital pin 9 (PWM). Servo/RGB"
      },
      {
        "name": "D10",
        "description": "Dijital pin 10 (PWM)"
      },
      {
        "name": "D11",
        "description": "Dijital pin 11 (PWM)"
      },
      {
        "name": "D12",
        "description": "Dijital pin 12"
      },
      {
        "name": "D13",
        "description": "Dijital pin 13. Karttaki dahili L LED'ine de bağlıdır"
      },
      {
        "name": "A0",
        "description": "Analog giriş 0 (0-5 V okur). Bu sitede potansiyometre"
      },
      {
        "name": "A1",
        "description": "Analog giriş 1. Bu sitede LDR"
      },
      {
        "name": "A2",
        "description": "Analog giriş 2. Bu sitede NTC"
      },
      {
        "name": "A3",
        "description": "Analog giriş 3"
      },
      {
        "name": "A4",
        "description": "Analog giriş 4 (I2C SDA)"
      },
      {
        "name": "A5",
        "description": "Analog giriş 5 (I2C SCL)"
      },
      {
        "name": "5V",
        "description": "5 volt besleme çıkışı"
      },
      {
        "name": "3V3",
        "description": "3,3 volt besleme çıkışı"
      },
      {
        "name": "GND",
        "description": "Toprak (0 V)"
      },
      {
        "name": "GND2",
        "description": "Toprak (0 V); GND ile aynı düğüm"
      },
      {
        "name": "GND3",
        "description": "Toprak (0 V); GND ile aynı düğüm"
      },
      {
        "name": "VIN",
        "description": "Dış besleme girişi"
      }
    ],
    "howItWorksMd": "Arduino Uno, **ATmega328P** mikrodenetleyicisi üzerine kurulmuş bir kartdır. Program (sketch) çipin **flash** belleğinde durur; güç gelince `setup()` bir kez, sonra `loop()` sürekli çalışır.\n\nBaşlıca özellikler: 16 MHz saat, 32 KB flash (program), 2 KB SRAM (çalışma belleği), 1 KB EEPROM (kalıcı veri).\n\n**Dijital pinler (D0-D13)** iki durumdan birinde olur: HIGH (≈ 5 V) ya da LOW (0 V). `pinMode` ile çıkış ya da giriş yaparsın. **Analog girişler (A0-A5)** 0-5 V arasındaki gerilimi 10 bitlik ADC ile 0-1023 sayısına çevirir. **PWM** işaretli pinler (D3, D5, D6, D9, D10, D11) `analogWrite` ile 0-255 arası \"ayarlanabilir\" çıkış verir.\n\nPin akımı sınırlıdır: bir pinin önerilen en yüksek akımı yaklaşık 20 mA, mutlak sınır 40 mA'dir. Laboratuvar 40 mA'i aşınca uyarı verir. Çıkış pini modelde yaklaşık 25 Ω iç dirençle sürer.",
    "wiringMd": "Laboratuvarı açınca Uno tuvalde hazır durur. Laboratuvar Uno'nun **5V**, **3V3** ve **GND** pinlerini otomatik besler, programı da otomatik yükler: ▶ **Derle ve çalıştır**, ■ durdurur, ↺ baştan başlatır (gerçek kartın Reset düğmesi gibi).\n\nParçaların uçlarını Uno'daki pin adlarına kablo çekerek bağlarsın (örneğin direnç **1** → **D13**). **GND, GND2 ve GND3** aynı düğümdür; hangisine bağlarsan bağla fark etmez.",
    "typicalValues": [
      {
        "label": "Mantık gerilimi",
        "value": "5 V",
        "note": "HIGH ≈ 5 V, LOW ≈ 0 V"
      },
      {
        "label": "Dijital giriş eşiği",
        "value": "≈ 2,5 V",
        "note": "Üstü HIGH, altı LOW okunur (laboratuvar modeli)"
      },
      {
        "label": "Pin akımı (önerilen)",
        "value": "≤ 20 mA",
        "note": "Mutlak sınır 40 mA"
      },
      {
        "label": "ADC çözünürlüğü",
        "value": "10 bit",
        "note": "0-1023, basamak ≈ 4,9 mV"
      },
      {
        "label": "INPUT_PULLUP direnci",
        "value": "≈ 35 kΩ",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Saat",
        "value": "16 MHz",
        "note": "-"
      },
      {
        "label": "Bellekler",
        "value": "32 KB flash, 2 KB SRAM, 1 KB EEPROM",
        "note": "-"
      }
    ],
    "commonMistakesMd": "- **`A0` ile `0`'ı karıştırmak.** `A0` analog giriş, `0` dijital pindir.\n- **D0 ve D1'i parça için kullanmak.** Bu pinler seri haberleşmeyle paylaşılır; derslerde LED/buton için D2'den başla.\n- **GND'yi unutmak.** Devre tamamlanmaz.\n- **Bir pinden fazla akım çekmek.** Motor, röle ve büyük yükleri doğrudan pine bağlama.\n- **Bir pine aynı anda iki çıkış bağlamak.** Biri HIGH, diğeri LOW sürerse kısa devre olur.\n- **`pinMode` yazmayı unutmak.** Pin çıkış olmaz; LED çok sönük yanar ya da hiç yanmaz.",
    "relatedLessons": [
      "arduino-temelleri:1:1",
      "arduino-temelleri:1:3",
      "arduino-temelleri:1:4"
    ]
  },
  {
    "slug": "bmp280",
    "title": "BMP280 basınç sensörü",
    "partType": "bmp280",
    "category": "Sensör",
    "summary": "Hava basıncını ve sıcaklığı I2C ile veren sensör. Basınçtan rakım hesaplanabilir.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. Laboratuvarda 5V'a bağlanır."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      },
      {
        "name": "SDA",
        "description": "I2C veri hattı. Uno'nun A4 pinine gider."
      },
      {
        "name": "SCL",
        "description": "I2C saat hattı. Uno'nun A5 pinine gider."
      }
    ],
    "howItWorksMd": "BMP280, havanın basıncını ölçer. Yükseldikçe üstümüzdeki hava azaldığı için basınç düşer; bu yüzden basınçtan **rakım** hesaplanabilir. Sensör I2C üzerinde **0x76** ya da **0x77** adresinde durur. Aynı iki kabloyu (SDA ve SCL) farklı adresli başka I2C cihazlarıyla paylaşabilir.\n\n`Adafruit_BMP280` kütüphanesinde `bmp.begin(0x76)` sensörü adresinden arar; kütüphanenin varsayılan adresi 0x77'dir. `readPressure()` basıncı **Pa** olarak, `readTemperature()` sıcaklığı santigrat olarak verir. `readAltitude(P0)` rakımı hesaplar ve deniz seviyesi basıncı P0'ı **hPa** olarak bekler.\n\n**İleri düzey:** Rakım formülü `44330 × (1 − (P / P0) ^ (1 / 5,255))` standart atmosfer varsayımına dayanır. P0 hava durumuyla değiştiğinden rakım okuması da kayar; deniz seviyesine yakın yerlerde 1 hPa yaklaşık 8 m eder. Gerçek bir modülün besleme gerilimi için veri sayfasına bakılmalıdır.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| BMP280 **VCC** | Uno **5V** |\n| BMP280 **GND** | Uno **GND** |\n| BMP280 **SDA** | Uno **A4** |\n| BMP280 **SCL** | Uno **A5** |\n\nÖzellik panelinde **Sıcaklık** (-40 ile 85 °C), **Basınç** (300 ile 1100 hPa) ve **I2C adresi** (0x76 ya da 0x77) bulunur. Sıcaklık ve basınç program çalışırken değiştirilebilir. Koddaki adres özellik panelindeki adresle aynı olmalıdır.",
    "typicalValues": [
      {
        "label": "Deniz seviyesinde standart basınç",
        "value": "1013,25 hPa",
        "note": "101 325 Pa"
      },
      {
        "label": "I2C adresi",
        "value": "0x76 (varsayılan)",
        "note": "Laboratuvarda 0x77 de seçilebilir"
      },
      {
        "label": "Basınç 954,5 hPa",
        "value": "≈ 500 m",
        "note": "P0 = 1013,25 hPa için"
      },
      {
        "label": "Basınç 898,75 hPa",
        "value": "≈ 1000 m",
        "note": "P0 = 1013,25 hPa için"
      },
      {
        "label": "1 hPa değişim",
        "value": "≈ 8 m",
        "note": "Deniz seviyesine yakın yerlerde"
      }
    ],
    "commonMistakesMd": "- **Adresi unutmak.** Sensör 0x76 iken parametresiz `begin()` ile \"bulunamadı\" sonucu almak.\n- **Pa ile hPa'yı karıştırmak.** `readAltitude(101325)` yazılırsa rakım çok yanlış çıkar.\n- **SDA ve SCL'yi ters bağlamak.** Sensör hiç bulunamaz.\n- **`begin` sonucunu denetlememek.** Sensör yokken anlamsız sayılar okunur.\n- **Rakımı kesin saymak.** Hava değişince P0 değişir ve rakım yer değiştirmeden kayar.",
    "relatedLessons": [
      "sensorler-ve-projeler:3:2",
      "sensorler-ve-projeler:3:4",
      "sensorler-ve-projeler:3:5"
    ]
  },
  {
    "slug": "buton",
    "title": "Buton",
    "partType": "button",
    "category": "Girdi",
    "summary": "Basılınca iki ucunu birleştiren anahtar. Kart, butonun durumunu bir giriş pininden okur.",
    "pins": [
      {
        "name": "A",
        "description": "Birinci uç. Basılınca B ile birleşir."
      },
      {
        "name": "B",
        "description": "İkinci uç."
      }
    ],
    "howItWorksMd": "Buton, basılmadığında iki ucu arasında bağlantı olmayan, basılınca iki ucu birleştiren (kısa devre yapan) bir anahtardır. Kendi başına bir gerilim üretmez; yalnızca bir yolu açar ya da kapatır.\n\nArduino bir butonu okumak için pini **giriş** yapar ve butonun bir ucunu o pine, öbür ucunu GND'ye bağlarsın. Sorun şudur: buton basılmamışken pin hiçbir şeye bağlı kalmaz (yüzen giriş) ve rastgele okunur. Çözüm, pini kodda `INPUT_PULLUP` yapmaktır: kartın içinde pini 5 V'a çeken bir direnç devreye girer.\n\nSonuç **ters mantıktır**:\n- Basılı değil: pin 5 V'a çekilir, `digitalRead` **HIGH** okur.\n- Basılı: pin GND'ye bağlanır, `digitalRead` **LOW** okur.\n\n**İleri düzey:** Gerçek butonların kontakları basarken çok kısa süre titrer (bounce). Bir basış, kodda birkaç kez görünebilir. Bunu önlemeye \"debounce\" denir (Modül 3, 8. ders).",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Buton **A** | Uno **D2** |\n| Buton **B** | Uno **GND** |\n\nKodda `pinMode(2, INPUT_PULLUP);` yazarsın. Butona basmak için parçayı seçip özellik panelinden **Basılı** seçeneğini açarsın ya da parçaya basılı tutarsın; devre çalışırken de değiştirebilirsin. Laboratuvarda basılı butonun direnci çok küçüktür (0,1 Ω), açıkken bağlantı yoktur. İç pull-up direnci modelde yaklaşık 35 kΩ'dur.\n\nLaboratuvar bağlantısız (yüzen) bir giriş için uyarı verir.",
    "typicalValues": [
      {
        "label": "Önerilen bağlantı",
        "value": "D2'ye A, GND'ye B",
        "note": "Bu sitedeki derslerin standardı"
      },
      {
        "label": "Kod ayarı",
        "value": "INPUT_PULLUP",
        "note": "Dış direnç gerekmez"
      },
      {
        "label": "Basılmamış okuma",
        "value": "HIGH",
        "note": "Pin iç pull-up ile 5 V'a çekilir"
      },
      {
        "label": "Basılmış okuma",
        "value": "LOW",
        "note": "Pin GND'ye bağlanır"
      },
      {
        "label": "İkinci buton",
        "value": "D3",
        "note": "Bu sitedeki ikinci giriş pini"
      }
    ],
    "commonMistakesMd": "- **Butonun mantığını ters sanmak.** `INPUT_PULLUP` ile basılı = LOW'dur; \"basılınca HIGH\" beklersen program ters çalışır.\n- **`INPUT_PULLUP` yazmayı unutmak.** Dış direnç yoksa pin yüzer ve okuma rastgele olur.\n- **Butonun ucunu 5 V'a bağlamak.** `INPUT_PULLUP` kullanırken diğer ucu GND'ye bağlarsın.\n- **Bir basışı birden çok basış saymak.** Gerçek butonlarda kontak titreşimi (bounce) buna neden olur.\n- **GND bağlantısını unutmak.** Buton basılsa bile pin LOW'a çekilemez.",
    "relatedLessons": [
      "arduino-temelleri:2:1",
      "arduino-temelleri:2:3"
    ]
  },
  {
    "slug": "buzzer",
    "title": "Buzzer",
    "partType": "buzzer",
    "category": "Çıkış",
    "summary": "Ses çıkaran parça. Aktif türü tek sabit ses, pasif türü `tone()` ile istediğin perde için çalışır.",
    "pins": [
      {
        "name": "+",
        "description": "Artı uç. Uno'nun ses pinine (bu sitede D8) bağlanır."
      },
      {
        "name": "-",
        "description": "Eksi uç. GND'ye bağlanır."
      }
    ],
    "howItWorksMd": "Buzzer, elektrik sinyalini ses titreşimine çeviren küçük bir hoparlördür. İki türü vardır:\n\n- **Aktif buzzer:** İçinde kendi osilatörü vardır. 5 V verince tek bir sabit perdede (yaklaşık 2 kHz) ses çıkarır. Sesi yalnızca açıp kapatabilirsin. Frekansı değiştiremezsin.\n- **Pasif buzzer:** İçinde osilatör yoktur; yalnız bir zardır. Sesin perdesini senin gönderdiğin titreşim belirler. `tone(8, 440)` pini saniyede 440 kez HIGH-LOW yapar ve buzzer 440 Hz (La) çalar. `noTone(8)` sesi keser.\n\nFrekans ne kadar yüksekse ses o kadar ince (tiz) olur.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Buzzer **+** | Uno **D8** |\n| Buzzer **-** | Uno **GND** |\n\nTürü özellik panelindeki **Tür** alanından seçersin: Aktif (kendi sesi var) ya da Pasif (tone ile). Varsayılan Pasif'tir. Sesi duymak için laboratuvardaki ses düğmesini açman gerekir. Bu sitede buzzer doğrudan pine bağlanır; gerçek devrede büyük ya da güçlü buzzerlar için transistör gerekebilir (Modül 3, 22. ders).",
    "typicalValues": [
      {
        "label": "Aktif buzzer frekansı",
        "value": "≈ 2000 Hz",
        "note": "Sabit; 2 V üstünde ses çıkar"
      },
      {
        "label": "La notası (A4)",
        "value": "440 Hz",
        "note": "`tone(8, 440)`"
      },
      {
        "label": "Do notası (C4)",
        "value": "≈ 262 Hz",
        "note": "`tone(8, 262)`"
      },
      {
        "label": "Rahat çalma aralığı",
        "value": "birkaç yüz Hz - birkaç kHz",
        "note": "Çok düşük ya da çok yüksek frekansta nota gibi duyulmaz"
      },
      {
        "label": "Tür",
        "value": "Pasif",
        "note": "Laboratuvar varsayılanı"
      }
    ],
    "commonMistakesMd": "- **Aktif buzzer ile `tone()` ile nota çalmayı denemek.** Hep aynı perdede ses çıkar; nota için pasif tür gerekir.\n- **Yanlış pin.** Kodda `tone(8, ...)` yazdıysan buzzerın + ucu D8'e bağlı olmalı.\n- **GND'yi bağlamamak.** Devre kapanmaz, ses gelmez.\n- **Sesi duyamamak.** Laboratuvarda ses düğmesinin açık olduğunu kontrol et.\n- **`tone()`'un süresiz çalacağını unutmak.** Süre vermezsen ses sürekli çalar; `noTone()` ile kesersin.",
    "relatedLessons": [
      "arduino-temelleri:4:3",
      "arduino-temelleri:4:5"
    ]
  },
  {
    "slug": "dcmotor",
    "title": "DC motor",
    "partType": "dcmotor",
    "category": "Çıkış",
    "summary": "Küçük fırçalı motor. Uçlarındaki gerilim hızı, gerilimin yönü dönüş yönünü belirler.",
    "pins": [
      {
        "name": "M1",
        "description": "Birinci motor ucu."
      },
      {
        "name": "M2",
        "description": "İkinci motor ucu."
      }
    ],
    "howItWorksMd": "DC motor, uçlarına gerilim verilince döner. Gerilim büyüdükçe hız artar; artı ve eksi uçlar yer değiştirince yön tersine döner. Motor bir **bobindir**: akım kesilince ters yönde gerilim sıçraması üretir, bu yüzden transistörle sürülürken flyback diyot gerekir.\n\nArduino pini motoru doğrudan süremez; motor yüzlerce mA çeker. Transistör, MOSFET ya da L293D gibi bir sürücü kullanılır. `analogWrite` ile (PWM) ortalama gerilim ve dolayısıyla hız değiştirilir.\n\n**İleri düzey:** Laboratuvar modelinde motor direnci 10 Ω, anma gerilimi 6 V'tur; hız yaklaşık uç gerilimi / 6 olarak (en çok 1) alınır. Gerçek küçük motorlar çok düşük PWM değerlerinde dönmeye başlamaz.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Motor **M1** | Uno **5V** (transistörlü devre) ya da L293D **OUT1** |\n| Motor **M2** | Transistör **C** ya da L293D **OUT2** |\n\nSanal ölçümde motor seçilirse uç gerilimi ve akımı görünür. NPN ile tam gazda yaklaşık 4,2 V ve 0,4 A, hız yaklaşık 0,70 olur.",
    "typicalValues": [
      {
        "label": "Motor direnci",
        "value": "10 Ω",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Anma gerilimi",
        "value": "6 V",
        "note": "Bu gerilimde tam hız"
      },
      {
        "label": "NPN ile tam gaz",
        "value": "≈ 4,2 V, ≈ 0,4 A",
        "note": "Hız ≈ 0,70"
      },
      {
        "label": "L293D ile (5 V)",
        "value": "≈ 3,3 V",
        "note": "Çıkış kaybı nedeniyle daha yavaş"
      }
    ],
    "commonMistakesMd": "- **Motoru doğrudan pine bağlamak.** Pin akımı yetersizdir ve zarar görebilir.\n- **Flyback diyotu atlamak.** Transistörle sürerken sıçrama transistörü bozar.\n- **Yönü bir anda ters çevirmek.** Önce durdur, sonra yeni yön ver.\n- **Çok düşük PWM'den dönmesini beklemek.** Küçük motor eşik değerin altında durur.",
    "relatedLessons": [
      "arduino-temelleri:5:2",
      "arduino-temelleri:5:3",
      "arduino-temelleri:5:5"
    ]
  },
  {
    "slug": "dht",
    "title": "DHT11 / DHT22 sıcaklık ve nem sensörü",
    "partType": "dht",
    "category": "Sensör",
    "summary": "Sıcaklık ve bağıl nemi tek veri hattından veren sensör. DHT22 ondalıklı, DHT11 tam sayı sonuç verir.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. 5V'a bağlanır."
      },
      {
        "name": "DATA",
        "description": "Veri ucu. Uno'nun bir dijital pinine (derslerde D5) bağlanır."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      }
    ],
    "howItWorksMd": "DHT sensörü sıcaklığı ve **bağıl nemi** ölçer ve ikisini de **tek bir veri hattı** üzerinden sayısal olarak gönderir. Bağıl nem, havanın o sıcaklıkta taşıyabileceği en çok su buharının yüzde kaçını taşıdığını söyler. Sensör yavaştır: iki okuma arasında **en az 2 saniye** beklemek gerekir.\n\nProgramda `DHT.h` kütüphanesi kullanılır: `DHT dht(pin, model)` ile tanıtılır, `readTemperature()` santigrat, `readHumidity()` yüzde verir. Okuma başarısızsa `NaN` döner; değer `isnan()` ile denetlenmelidir.\n\n**İleri düzey:** Çıplak 4 bacaklı DHT sensörlerinde veri ucuyla VCC arasına bir yükseltme (pull-up) direnci gerekir. Laboratuvardaki 3 bacaklı modülde bu direnç kartın üzerindedir. Gerçek sensörün ölçüm aralığı ve doğruluğu için veri sayfasına bakılmalıdır.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| DHT **VCC** | Uno **5V** |\n| DHT **GND** | Uno **GND** |\n| DHT **DATA** | Uno **D5** |\n\nÖzellik panelinde **Tür** (DHT11 ya da DHT22), **Sıcaklık** (-40 ile 80 °C) ve **Nem** (0 ile 100 %) bulunur; sıcaklık ve nem program çalışırken değiştirilebilir. DATA ucu bağlı değilse laboratuvar uyarı verir ve sensör çalışmaz.",
    "typicalValues": [
      {
        "label": "Okuma aralığı",
        "value": "en az 2 sn",
        "note": "Daha sık okuma eski değeri tekrarlar"
      },
      {
        "label": "DHT22 çözünürlüğü",
        "value": "1 ondalık basamak",
        "note": "Laboratuvarda 23,5 °C değeri \"23.5\" yazar"
      },
      {
        "label": "DHT11 çözünürlüğü",
        "value": "tam sayı",
        "note": "Laboratuvarda 23,5 °C değeri \"24.0\" yazar"
      },
      {
        "label": "Veri pini",
        "value": "D5",
        "note": "Bu sitedeki derslerin standardı"
      },
      {
        "label": "Okuma başarısızsa",
        "value": "NaN",
        "note": "isnan() ile yakalanır"
      }
    ],
    "commonMistakesMd": "- **`isnan` denetimi koymamak.** Okuma başarısız olunca ekranda `nan` görünür.\n- **Modeli yanlış yazmak.** DHT11 sensöre `DHT22` demek anlamsız değerler üretir.\n- **2 saniyeden sık okumak.** Sensör yetişemez, aynı değer tekrarlanır.\n- **DATA kablosunu unutmak.** Program sürekli \"Okuma hatasi\" yazar.\n- **Basamak sayısını doğruluk sanmak.** DHT22'nin daha çok basamak göstermesi her zaman daha doğru olduğunu kanıtlamaz.",
    "relatedLessons": [
      "sensorler-ve-projeler:3:1",
      "sensorler-ve-projeler:3:4",
      "sensorler-ve-projeler:3:5"
    ]
  },
  {
    "slug": "diode",
    "title": "Diyot",
    "partType": "diode",
    "category": "Güç",
    "summary": "Akımı yalnız bir yöne geçiren parça. Derslerde motorun geri tepme gerilimini sönümleyen flyback diyot olarak kullanılır.",
    "pins": [
      {
        "name": "A",
        "description": "Anot. Akım buradan girer."
      },
      {
        "name": "K",
        "description": "Katot (çizgili uç). Akım buradan çıkar."
      }
    ],
    "howItWorksMd": "Diyot akımı yalnız anottan katoda geçirir. İletirken uçları arasında yaklaşık 0,7 V gerilim düşer (**ileri gerilim**). Ters yönde akım geçirmez.\n\nMotor ve röle bobini akım kesilince ters yönde yüksek gerilim üretir. Bobine paralel, ters yönde bağlanan diyot bu akıma yol açar ve transistörü korur: **flyback diyot**. Normal çalışmada diyot iletmez; yalnız sıçrama anında iletir.\n\n**İleri düzey:** Gerçek devrede 1N4007 gibi bir doğrultucu diyot kullanılır. LED de bir diyottur ama ışık verir ve ileri gerilimi renge göre 1,9-3,0 V'tur.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Diyot **A** | Transistörün **C** ucu (ya da MOSFET **D**) |\n| Diyot **K** (çizgili uç) | Motorun artı tarafı, **5V** |\n\nMotor transistör ya da MOSFET ile sürülüyor ama flyback diyot yoksa ya da ters bağlıysa laboratuvar \"flyback\" uyarısı verir. Doğru bağlantıda diyot normalde akım iletmez.",
    "typicalValues": [
      {
        "label": "İleri gerilim",
        "value": "0,7 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Seri direnç",
        "value": "1 Ω",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Yön",
        "value": "A'dan K'ya",
        "note": "Çizgili uç katottur"
      },
      {
        "label": "Flyback konumu",
        "value": "Motora paralel, ters yönde",
        "note": "K, artı tarafa"
      }
    ],
    "commonMistakesMd": "- **Diyotu ters bağlamak.** Sıçrama için yol açmaz; uyarı çıkar.\n- **Diyotu hiç koymamak.** Transistör zamanla bozulur.\n- **Çizgili ucu karıştırmak.** Çizgili uç katottur ve 5V tarafına gider.\n- **Diyotu motorla seri bağlamak.** Motor çalışmaz; diyot motora paralel olmalıdır.",
    "relatedLessons": [
      "arduino-temelleri:5:2",
      "arduino-temelleri:5:4"
    ]
  },
  {
    "slug": "direnc",
    "title": "Direnç",
    "partType": "resistor",
    "category": "Pasif parça",
    "summary": "Akımı sınırlayan iki uçlu parça. Değeri ohm (Ω) ile ölçülür ve uçları yönsüzdür.",
    "pins": [
      {
        "name": "1",
        "description": "Birinci uç. Yönsüzdür; 1 ile 2 birbirinin yerine kullanılabilir."
      },
      {
        "name": "2",
        "description": "İkinci uç."
      }
    ],
    "howItWorksMd": "**Direnç**, içinden geçen akıma karşı koyar. Uçları arasındaki gerilim, geçen akımla direncin çarpımına eşittir (**Ohm yasası**):\n\n`V = I × R`   ·   `I = V / R`   ·   `R = V / I`\n\nDirenç büyüdükçe aynı gerilimde akım **azalır**. 5 V'a bağlı 1 kΩ'dan 5 mA, 500 Ω'dan 10 mA geçer.\n\nDirencin iki temel işi vardır:\n1. **Akım sınırlamak.** LED'in önüne koyduğun direnç, LED'den geçecek akımı belirler.\n2. **Gerilim bölmek.** İki direnç seri bağlanırsa aralarındaki uçta gerilimin bir kısmını alırsın. Sensör devrelerinin (LDR, NTC) temeli budur.\n\nBirimler: 1 kΩ = 1000 Ω, 1 MΩ = 1.000.000 Ω.\n\n**Renk kodu (gerçek dirençler):** İlk iki halka rakam, üçüncü halka çarpandır. 330 Ω = turuncu (3), turuncu (3), kahverengi (×10). 1 kΩ = kahverengi, siyah, kırmızı (10 × 100).",
    "wiringMd": "Direncin iki ucu eşdeğerdir. Tipik LED bağlantısı:\n\n| Nereden | Nereye |\n|---|---|\n| Uno **D13** | Direnç **1** |\n| Direnç **2** | LED **A** |\n\nDeğeri parçayı seçince özellik panelinde **Direnç** alanından yazarsın (1 Ω ile 1.000.000 Ω arası). Devre çalışırken direnci seçersen panelde uçları arasındaki **gerilimi** ve içinden geçen **akımı** (sanal ölçüm) görürsün.",
    "typicalValues": [
      {
        "label": "LED önü (5 V, kırmızı)",
        "value": "330 Ω",
        "note": "Yaklaşık 9 mA"
      },
      {
        "label": "Daha sönük LED",
        "value": "1 kΩ",
        "note": "Yaklaşık 3 mA"
      },
      {
        "label": "Buton için çekme (pull-up/pull-down)",
        "value": "10 kΩ",
        "note": "Bu sitede iç pull-up kullanılır (INPUT_PULLUP)"
      },
      {
        "label": "Gerilim bölücü (LDR/NTC ile)",
        "value": "10 kΩ",
        "note": "Sensör devrelerinde sık seçilir"
      },
      {
        "label": "Potansiyometre toplam direnci",
        "value": "10 kΩ",
        "note": "Varsayılan değer"
      }
    ],
    "commonMistakesMd": "- **mA ile A'yı karıştırmak.** 20 mA = 0,02 A. Formülde önce ampere çevir.\n- **\"Direnç büyükse akım büyüktür\" sanmak.** Tersine, akım azalır.\n- **Direnç değerini LED için çok küçük seçmek.** 100 Ω ile akım 25-30 mA'e çıkar; LED ve pin zorlanır.\n- **Gerçek direncin halkalarını ters okumak.** Altın/gümüş (tolerans) halka sağda olacak şekilde oku.\n- **Hesabı ideal sanıp ölçümle birebir eşleşmesini beklemek.** Laboratuvar Uno pininin iç direncini (yaklaşık 25 Ω) ve LED'in iç direncini de modeller; ölçüm hesaptan biraz küçük çıkar.",
    "relatedLessons": [
      "arduino-temelleri:1:2",
      "arduino-temelleri:1:3",
      "arduino-temelleri:3:2"
    ]
  },
  {
    "slug": "enkoder",
    "title": "Döner enkoder",
    "partType": "encoder",
    "category": "Girdi",
    "summary": "Sınırsız dönebilen, adım ve yönü iki sinyalle (CLK ve DT) veren döner düğme. Basılabilen düğmesi de vardır.",
    "pins": [
      {
        "name": "CLK",
        "description": "Birinci sinyal (A). Her tıkta bir kez düşer; kesme pinine (D2) bağlanır."
      },
      {
        "name": "DT",
        "description": "İkinci sinyal (B). CLK'dan çeyrek dönem (90 derece) kayıktır; yönü verir."
      },
      {
        "name": "SW",
        "description": "Düğme çıkışı. Basılınca GND'ye bağlanır."
      },
      {
        "name": "VCC",
        "description": "Modülün pull-up dirençleri için besleme (5V). Bağlamasan da INPUT_PULLUP yeterlidir."
      },
      {
        "name": "GND",
        "description": "Toprak. Her durumda bağlı olmalıdır."
      }
    ],
    "howItWorksMd": "**Döner enkoder**, içinde iki kontak taşıyan sınırsız dönen bir düğmedir. Kontaklar aynı anda değil, biri ötekinden biraz önce değişir. Bu yüzden CLK ve DT arasında 90 derece fark vardır (quadrature). Saat yönünde (CLK, DT) durumları 11, 01, 00, 10, 11 sırasıyla değişir; ters yönde 11, 10, 00, 01, 11.\n\nYön kuralı: CLK 1'den 0'a düşerken DT'ye bak. DT 1 ise bir yöne, 0 ise öbür yöne dönülüyordur. Bu yüzden CLK bir kesme pinine bağlanır ve ISR içinde DT okunur.\n\n**İleri düzey:** Gerçek kontaklar sıçrar; bir tık 2-3 kenar üretebilir. Çözüm, iki kenar arasında en az belli bir süre (örneğin 2000 µs) geçmediyse kenarı yok saymaktır. Laboratuvar modeli sıçramaz ve her benzetim milisaniyesinde bir durum geçişi uygular; bir tık 4 geçiştir, bu yüzden en çok 250 tık/sn döner.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Enkoder **CLK** | Uno **D2** (`INPUT_PULLUP`, kesme pini) |\n| Enkoder **DT** | Uno **D3** (`INPUT_PULLUP`) |\n| Enkoder **SW** | Uno **D4** (`INPUT_PULLUP`) |\n| Enkoder **VCC** | Uno **5V** (isteğe bağlı) |\n| Enkoder **GND** | Uno **GND** |\n\nÖzellik panelindeki **Konum (tık)** değeri değişince enkoder o kadar tık çevrilir (saat yönü artı). **Düğme basılı** düğmeyi basar.",
    "typicalValues": [
      {
        "label": "Bir tık",
        "value": "4 durum geçişi",
        "note": "11, 01, 00, 10, 11"
      },
      {
        "label": "Bir geçiş süresi",
        "value": "1 ms",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "En hızlı dönüş",
        "value": "250 tık/sn",
        "note": "Tık başına 4 ms"
      },
      {
        "label": "Pull-up direnci",
        "value": "10 kΩ",
        "note": "Modül kartında, VCC'ye"
      },
      {
        "label": "Önerilen bounce eşiği",
        "value": "2000 µs",
        "note": "4 ms'den küçük olmalı"
      }
    ],
    "commonMistakesMd": "- **CLK'yı kesme pini olmayan bir pine bağlamak.** Uno'da yalnız D2 ve D3 kesme yapar.\n- **sayac değişkenini volatile yapmamak.** loop() değişimi görmeyebilir.\n- **ISR içinde Serial.print ya da delay kullanmak.** ISR kısa olmalıdır.\n- **Bounce filtresi koymamak ya da eşiği fazla büyütmek.** Birincisinde sayaç fazla atlar, ikincisinde hızlı çevirirken tıklar kaybolur.\n- **CLK ile DT'yi karıştırmak.** Yön ters çıkar.",
    "relatedLessons": [
      "arduino-temelleri:6:4",
      "sensorler-ve-projeler:5:2"
    ]
  },
  {
    "slug": "flame",
    "title": "Alev sensörü",
    "partType": "flame",
    "category": "Sensör",
    "summary": "Alevin yaydığı kızılötesi (IR) ışığı algılayan modül. Laboratuvardaki modülde alev arttıkça analog çıkış düşer.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. 5V'a bağlanır; en az 3 V gerekir."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      },
      {
        "name": "AO",
        "description": "Analog çıkış. Uno'nun bir analog girişine (derslerde A1) gider; alevde gerilim düşer."
      },
      {
        "name": "DO",
        "description": "Dijital çıkış. Alev şiddeti eşiği geçince LOW olur; derslerde kullanılmaz."
      }
    ],
    "howItWorksMd": "Alev sensörü, alevin yaydığı **kızılötesi (IR) ışığa** duyarlı bir alıcıdır. Alev yaklaşınca analog çıkış değişir. Laboratuvardaki modülde **alevde değer düşer**; ama bazı modüllerde tersi olabilir. Bu yüzden ham okumayı \"büyük sayı = güçlü alev\" olacak biçimde tek bir fonksiyonda çevirirsin (`siddet()`); geri kalan kod yönden bağımsız kalır.\n\nGüneş ışığı ve bazı lambalar da IR yayar; gerçek devrede bunlar yanlış alarm üretebilir. Sensörün görüş açısı ve menzili sınırlıdır. Bu sensör tek başına güvenilir bir yangın dedektörü değildir.\n\n**İleri düzey:** Laboratuvar modelinde AO = VCC × (1 − 0,95 × Alev şiddeti). Alev yokken AO = VCC olur ve `analogRead` 1023 verir; şiddet 1 iken yaklaşık 0,25 V (ham ≈ 51) okunur.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Alev sensörü **VCC** | Uno **5V** |\n| Alev sensörü **GND** | Uno **GND** |\n| Alev sensörü **AO** | Uno **A1** |\n\nÖzellik panelindeki **Alev şiddeti** (0 ile 1) alevi taklit eder ve program çalışırken değiştirilebilir. **Eşik (DO)** yalnız dijital çıkışı etkiler. Gerçek alevle deney yapılmaz.",
    "typicalValues": [
      {
        "label": "Alev şiddeti 0",
        "value": "ham = 1023, şiddet 0",
        "note": "Alev yok"
      },
      {
        "label": "Alev şiddeti 0,31",
        "value": "ham ≈ 722, şiddet ≈ 301",
        "note": "Derslerdeki UYARI eşiğinin (300) yanı"
      },
      {
        "label": "Alev şiddeti 0,4",
        "value": "ham ≈ 634, şiddet ≈ 389",
        "note": "UYARI"
      },
      {
        "label": "Alev şiddeti 0,62",
        "value": "ham ≈ 420, şiddet ≈ 603",
        "note": "Derslerdeki TEHLIKE eşiğinin (600) yanı"
      },
      {
        "label": "Alev şiddeti 0,8",
        "value": "ham ≈ 246, şiddet ≈ 777",
        "note": "TEHLIKE"
      },
      {
        "label": "Şiddet çevirisi",
        "value": "siddet = 1023 − ham",
        "note": "Alevde değer düşen modül için"
      }
    ],
    "commonMistakesMd": "- **Yönü bilmemek.** `ALEVDE_DUSER` değerini kontrol etmezsen alarm hep ya da hiç çalar.\n- **Yönü her yerde ayrı düşünmek.** Çeviriyi tek fonksiyonda yap.\n- **Kapama eşiğini açma eşiğinden büyük yazmak.** Seviye titrer ya da düşmez.\n- **IR kaynaklarını unutmak.** Güneş ışığı ve bazı lambalar yanlış alarm verebilir (laboratuvar bunu modellemez).\n- **Gerçek alevle deney yapmak.** Tehlikelidir; derste alev yalnızca özellik panelinden taklit edilir.",
    "relatedLessons": [
      "sensorler-ve-projeler:4:4",
      "sensorler-ve-projeler:4:5"
    ]
  },
  {
    "slug": "hcsr04",
    "title": "HC-SR04 ultrasonik mesafe sensörü",
    "partType": "hcsr04",
    "category": "Sensör",
    "summary": "Ses dalgasının gidiş-dönüş süresini ECHO bacağının HIGH kalma süresi olarak veren mesafe sensörü; tipik aralığı 2-400 cm.",
    "pins": [
      {
        "name": "VCC",
        "description": "5 V besleme. Uno'nun 5V pinine bağlanır."
      },
      {
        "name": "TRIG",
        "description": "Tetik girişi. Karttan gelen kısa (10 µs) HIGH darbesi bir ölçümü başlatır."
      },
      {
        "name": "ECHO",
        "description": "Yankı çıkışı. Ses gidip dönene kadar HIGH kalır; süre mesafeyi belirler."
      },
      {
        "name": "GND",
        "description": "Toprak. Uno'nun GND'sine bağlanır."
      }
    ],
    "howItWorksMd": "HC-SR04'ün önünde iki silindir vardır: biri **ultrasonik** (insan kulağının duyamayacağı, bu sensörde 40 kHz) ses yollar, öbürü yankıyı dinler. Kart TRIG'e 10 µs'lik bir HIGH darbesi verince sensör bir ses demeti yollar ve ECHO bacağını yükseltir. Ses bir nesneye çarpıp dönünce ECHO tekrar LOW olur.\n\nSensör mesafeyi söylemez, bir **süre** verir. Süreyi `pulseIn(ECHO, HIGH, 30000)` ile mikrosaniye olarak ölçersin ve çevirirsin:\n\n`mesafe (cm) = süre (µs) × 0,0343 / 2`\n\nİkiye bölünür, çünkü süre gidiş ve dönüşü kapsar. Kısa yol: yaklaşık 58 µs = 1 cm.\n\n**İleri düzey:** Ses hızı sıcaklığa bağlıdır (yaklaşık c = 331,3 + 0,606 × T m/s). Programın 343 m/s varsayması soğukta mesafeyi büyük, sıcakta küçük gösterir; 0 °C ile 40 °C arasında 100 cm'de yaklaşık 7 cm fark oluşur. Sensör koni biçiminde bir alana bakar (veri sayfasında tipik olarak yaklaşık 15°). Eğik, yumuşak ya da çok ince yüzeyler yankıyı zayıflatır ya da yana kaçırır; bu yüzden aykırı değerleri ayıklamak için medyan filtre kullanılır (ders 38).",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| HC-SR04 **VCC** | Uno **5V** |\n| HC-SR04 **GND** | Uno **GND** |\n| HC-SR04 **TRIG** | Uno **D9** |\n| HC-SR04 **ECHO** | Uno **D10** |\n\nÖzellik panelindeki **Mesafe** değeri (2-400 cm) sensörün önündeki nesnenin uzaklığıdır ve program çalışırken değiştirilebilir. Bu aralığın dışında laboratuvar yankı üretmez, `pulseIn` zaman aşımına uğrar ve 0 döndürür. Laboratuvardaki sensör kusursuzdur: Mesafe'ye ne yazarsan onu okur, ses hızı sabittir ve gürültü yoktur. TRIG ve ECHO doğrudan Uno pinlerine bağlanmalıdır.",
    "typicalValues": [
      {
        "label": "Ölçüm aralığı",
        "value": "2-400 cm",
        "note": "Laboratuvar bu aralıkta yankı üretir; gerçek sensörde veri sayfasına bak"
      },
      {
        "label": "Ses frekansı",
        "value": "40 kHz",
        "note": "Duyulmaz"
      },
      {
        "label": "Tetik darbesi",
        "value": "10 µs",
        "note": "TRIG'e HIGH süresi"
      },
      {
        "label": "Süre / mesafe",
        "value": "≈ 58 µs / cm",
        "note": "Gidiş-dönüş; laboratuvar modeli 58,2 µs/cm kullanır"
      },
      {
        "label": "Ölçüm açısı",
        "value": "≈ 15°",
        "note": "Veri sayfasındaki tipik değer; koni biçimindedir"
      },
      {
        "label": "Ölçümler arası bekleme",
        "value": "≈ 60 ms",
        "note": "Önceki yankının yenisine karışmaması için önerilen"
      }
    ],
    "commonMistakesMd": "- **Süreyi ikiye bölmemek.** Mesafe iki kat çıkar.\n- **TRIG ile ECHO'nun yerini değiştirmek.** Hiçbir ölçüm gelmez, hep 0 okunur.\n- **`pulseIn`'e zaman aşımı vermemek.** Yankı gelmezse varsayılan 1 saniye boyunca beklenir.\n- **0 dönüşünü 0 cm sanmak.** 0, yankı yok demektir.\n- **VCC ya da GND'yi bağlamamak.** Sensör beslenmez ve tetikleyince cevap vermez.\n- **Servo ya da motoru aynı zayıf 5 V hattından beslemek (gerçek devre).** Gerilim çökmesi ölçümü bozar; ayrı besleme ve ortak GND kullan.",
    "relatedLessons": [
      "sensorler-ve-projeler:1:1",
      "sensorler-ve-projeler:1:2",
      "sensorler-ve-projeler:1:3",
      "sensorler-ve-projeler:1:5"
    ]
  },
  {
    "slug": "irobstacle",
    "title": "IR engel sensörü",
    "partType": "irobstacle",
    "category": "Sensör",
    "summary": "Kızılötesi ışığın yansımasına bakarak önünde engel olup olmadığını söyleyen modül; mesafe ölçmez, \"var/yok\" der.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme. Laboratuvarda 3 V ve üzeri ile çalışır; derslerde 5V pinine bağlanır."
      },
      {
        "name": "OUT",
        "description": "Dijital çıkış. Engel varken LOW, yokken HIGH olur (yaygın düzen; bazı modüller tersini yapar)."
      },
      {
        "name": "GND",
        "description": "Toprak. Uno'nun GND'sine bağlanır."
      },
      {
        "name": "AO",
        "description": "Analog çıkış. Yansıma şiddeti arttıkça gerilimi artar; eşiği kodda sen seçersin."
      }
    ],
    "howItWorksMd": "Modülün üzerinde bir kızılötesi LED ve bir alıcı vardır. LED ışık yollar; önünde cisim varsa ışığın bir kısmı alıcıya geri döner. Yansıma belli bir düzeyi aşarsa modül \"engel var\" der.\n\nEşik iki yerde ayarlanabilir. **OUT** çıkışında eşik modüldeki küçük **ayar vidasındadır** (donanım). **AO** çıkışında ise ham yansıma gerilimini okur ve eşiği kodda belirlersin. Eşik civarında değer dalgalanıyorsa tek eşik yerine iki eşik (histerezis) kullanmak çıktının titremesini önler.\n\nYansıma yalnız uzaklığa değil cismin rengine ve yüzeyine de bağlıdır: açık renkli mat yüzeyler kolay, koyu ve parlak yüzeyler zor algılanır. Güçlü ortam ışığı gerçek modüllerde ölçümü bozabilir (laboratuvar bunu modellemez).\n\n**İleri düzey:** Laboratuvar modelinde AO, yakınlık değerinin doğrusal bir işlevidir: 0,05 + 0,9 × yakınlık oranında VCC'ye bölünür. Yakınlık 0 iken yaklaşık 0,25 V, 1 iken yaklaşık 4,75 V okunur. Cisim sayarken seviye değil, \"yoktan vara\" geçişi (kenar) sayılır.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| IR engel **VCC** | Uno **5V** |\n| IR engel **GND** | Uno **GND** |\n| IR engel **OUT** | Uno **D3** |\n| IR engel **AO** (isteğe bağlı) | Uno **A0** |\n\nÖzellik panelinde iki kaydırıcı vardır: **Yakınlık** (0-1, cismin yansıtma düzeyi) ve **Eşik (ayar vidası)** (0-1, varsayılan 0,5). Yakınlık eşiğe eşit ya da büyükse engel algılanır. OUT için `INPUT` kullanılır; çıkışı modül sürer.",
    "typicalValues": [
      {
        "label": "OUT, engel varken",
        "value": "LOW",
        "note": "Yaygın düzen; modülün belgesine bak"
      },
      {
        "label": "OUT, engel yokken",
        "value": "HIGH",
        "note": "Yaygın düzen"
      },
      {
        "label": "Varsayılan eşik",
        "value": "0,5",
        "note": "Laboratuvardaki ayar vidası konumu"
      },
      {
        "label": "AO, yakınlık 0",
        "value": "≈ 0,25 V (analogRead ≈ 51)",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "AO, yakınlık 1",
        "value": "≈ 4,75 V (analogRead ≈ 972)",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Çalışma gerilimi",
        "value": "≥ 3 V",
        "note": "Laboratuvarda 3,3 V ile de beslenmiş sayılır"
      }
    ],
    "commonMistakesMd": "- **Çıkış seviyesini her modül için aynı sanmak.** Bazı modüller engelde HIGH verir; seviyeyi bir sabite yaz.\n- **Ondan santimetre beklemek.** OUT yalnız var/yok der; mesafe için HC-SR04 ya da ToF gerekir.\n- **Tek eşik kullanmak.** AO değeri eşik civarında dalgalanınca çıktı titrer; iki eşik kullan.\n- **Cisim sayarken seviyeyi saymak.** Duran cisim her turda sayılır; kenarı say.\n- **Rengi hesaba katmamak.** Koyu ya da parlak yüzeyler az yansıtır ve algılanmayabilir.",
    "relatedLessons": [
      "sensorler-ve-projeler:2:2",
      "sensorler-ve-projeler:2:5"
    ]
  },
  {
    "slug": "joystick",
    "title": "Joystick",
    "partType": "joystick",
    "category": "Girdi",
    "summary": "İki eksenli kol ve basılabilen düğme. Her eksen bir potansiyometre gibi 0-5 V arası gerilim verir.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme. 5V'a bağlanır (en az yaklaşık 3 V gerekir, ama 3V3 ile uç değer 1023 yerine yaklaşık 675 olur)."
      },
      {
        "name": "GND",
        "description": "Toprak."
      },
      {
        "name": "VRX",
        "description": "Yatay (X) eksen çıkışı. Uno'nun bir analog girişine (A0) gider."
      },
      {
        "name": "VRY",
        "description": "Dikey (Y) eksen çıkışı. Başka bir analog girişe (A1) gider."
      },
      {
        "name": "SW",
        "description": "Düğme çıkışı. Basılınca GND'ye bağlanır; dijital bir pine (INPUT_PULLUP) gider."
      }
    ],
    "howItWorksMd": "**Joystick**, birbirine dik duran iki potansiyometre ile kolun ucundaki bir düğmeden oluşur. Her eksen bir gerilim bölücüdür: VCC ile GND arasındaki şeridin üzerinde kayan uç VRX ya da VRY'ye gerilim verir. Kol ortadayken gerilim yaklaşık 2,5 V, `analogRead` değeri yaklaşık 512'dir. Bir yöne tam itince 0 V ya da 5 V'a, yani 0 ya da 1023'e yaklaşır.\n\nGerçek modüllerde merkez tam 512 olmaz (497 ya da 530 gibi). Bu yüzden açılışta merkez ölçülür ve çevresine küçük bir ölü bölge konur.\n\n**İleri düzey:** Laboratuvar modelinde her eksen 10 kΩ'luk toplam dirençli bir bölücüdür. SW pini VCC'ye bağlıyken modülün 10 kΩ'luk pull-up direnciyle HIGH'a çekilir; düğme basılınca yaklaşık 100 Ω ile GND'ye bağlanır. Düğmeyi `INPUT_PULLUP` ile de okuyabilirsin.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Joystick **VCC** | Uno **5V** |\n| Joystick **GND** | Uno **GND** |\n| Joystick **VRX** | Uno **A0** |\n| Joystick **VRY** | Uno **A1** |\n| Joystick **SW** | Uno **D2** (`INPUT_PULLUP`) |\n\nÖzellik panelinde **X ekseni** ve **Y ekseni** (0 ile 1 arası) ve **Düğme basılı** vardır; program çalışırken de değiştirilebilir. `analogRead` için `pinMode` yazman gerekmez.",
    "typicalValues": [
      {
        "label": "Kol ortada (X ya da Y = 0,5)",
        "value": "≈ 2,5 V, okuma ≈ 512",
        "note": "Merkez"
      },
      {
        "label": "Eksen 0",
        "value": "≈ 0 V, okuma ≈ 0",
        "note": "Bir uç"
      },
      {
        "label": "Eksen 1",
        "value": "≈ 5 V, okuma ≈ 1023",
        "note": "Öbür uç"
      },
      {
        "label": "Eksen 0,25",
        "value": "≈ 1,25 V, okuma ≈ 256",
        "note": "Çeyrek konum"
      },
      {
        "label": "Düğme basılı",
        "value": "SW ≈ 0 V (LOW)",
        "note": "INPUT_PULLUP ile LOW okunur"
      },
      {
        "label": "Eksen bölücü direnci",
        "value": "10 kΩ",
        "note": "Toplam, laboratuvar modeli"
      }
    ],
    "commonMistakesMd": "- **Merkezi sabit 512 yazmak.** Gerçek modülde kol bırakılmışken değer kayar; açılışta ölç.\n- **Ölü bölge koymamak.** Kol bırakılmışken değer 510, 514, 509 diye dalgalanır.\n- **SW'yi INPUT_PULLUP yapmamak.** Pin havada kalırsa rastgele basış okunur.\n- **VCC'yi 3V3'e bağlamak.** ADC 5 V'a göre ölçer; uç değer yaklaşık 675 olur.\n- **Kol itiliyken programı başlatmak.** Merkez yanlış ölçülür.",
    "relatedLessons": [
      "arduino-temelleri:3:1",
      "sensorler-ve-projeler:5:1"
    ]
  },
  {
    "slug": "keypad",
    "title": "Keypad 4x4",
    "partType": "keypad",
    "category": "Girdi",
    "summary": "16 tuşu 8 pinle okuyan matris tuş takımı. Satırlar ve sütunlar doğrudan Uno pinlerine bağlanır.",
    "pins": [
      {
        "name": "R1",
        "description": "Birinci satır. Uno'da bir giriş pinine (bu sitede D9) bağlanır."
      },
      {
        "name": "R2",
        "description": "İkinci satır (bu sitede D8)."
      },
      {
        "name": "R3",
        "description": "Üçüncü satır (bu sitede D7)."
      },
      {
        "name": "R4",
        "description": "Dördüncü satır (bu sitede D6)."
      },
      {
        "name": "C1",
        "description": "Birinci sütun (bu sitede D5)."
      },
      {
        "name": "C2",
        "description": "İkinci sütun (bu sitede D4)."
      },
      {
        "name": "C3",
        "description": "Üçüncü sütun (bu sitede D3)."
      },
      {
        "name": "C4",
        "description": "Dördüncü sütun (bu sitede D2)."
      }
    ],
    "howItWorksMd": "Tuş takımında her tuş bir satırla bir sütunu basıldığında birleştirir. 16 tuş için 16 tel yerine 4 satır ve 4 sütun, yani 8 tel yeter. Arduino satırları `INPUT_PULLUP` ile HIGH'ta bekletir, sütunları sırayla LOW yapar. Basılı tuşun sütunu LOW iken o tuşun satırı da LOW okunur; kesişen satır ve sütun tuşu ele verir.\n\n`Keypad` kitaplığı bu taramayı ve sıçrama önlemeyi yapar. `getKey()` yeni basılan tuşu `char` olarak bir kez döndürür; basış yoksa `'\\0'` döndürür.\n\n**İleri düzey:** Diyotsuz bir matriste aynı anda üç tuşa basılırsa bir \"hayalet\" tuş algılanabilir, çünkü akım yanlış bir yoldan döner. Bu yüzden şifre girişi gibi tek tuşla çalışan işler matrisin en güvenli kullanımıdır. Laboratuvardaki parça aynı anda yalnız bir tuşu basılı sayar.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Keypad **R1, R2, R3, R4** | Uno **D9, D8, D7, D6** |\n| Keypad **C1, C2, C3, C4** | Uno **D5, D4, D3, D2** |\n\nSağ paneldeki **Basılı tuş** listesinden bir tuş seçersin; seçilen tuş basılı sayılır, **Yok** dersen bırakılır. Bir tuşu listede seçili bırakmak onu basılı tutmaktır. Tuş haritası satır satır `1 2 3 A`, `4 5 6 B`, `7 8 9 C`, `* 0 # D` biçimindedir.",
    "typicalValues": [
      {
        "label": "Tuş sayısı",
        "value": "16",
        "note": "4 satır × 4 sütun"
      },
      {
        "label": "Gereken pin sayısı",
        "value": "8",
        "note": "4 satır + 4 sütun"
      },
      {
        "label": "Satır pinleri modu",
        "value": "INPUT_PULLUP",
        "note": "Kitaplık kendisi ayarlar"
      },
      {
        "label": "Tuşa basılıyken satır",
        "value": "LOW",
        "note": "Sütun LOW verilirken"
      },
      {
        "label": "Boşta `getKey()`",
        "value": "'\\0'",
        "note": "Basış yoksa"
      }
    ],
    "commonMistakesMd": "- **Satır ve sütun pinlerini ters yazmak.** Tuşlar yanlış harf verir ya da hiç algılanmaz. Her tuşu sırayla seçip seri monitörde ne yazdığına bak.\n- **`getKey()` değerini denetlemeden kullanmak.** Basış yokken `'\\0'` döner; `if (tus)` ile süz.\n- **Keypad pinlerini başka parçalara da vermek.** D2-D9 bu hafta tuş takımına aittir; servo gibi parçalar başka pine taşınmalıdır.\n- **`delay()` ile beklemek.** Beklerken basılan tuşlar kaçabilir; `millis()` kullan.\n- **Tuşu basılı bırakmayı unutmak.** Laboratuvarda her basıştan sonra listeyi **Yok**'a al.",
    "relatedLessons": [
      "sensorler-ve-projeler:6:2",
      "sensorler-ve-projeler:6:5"
    ]
  },
  {
    "slug": "l293d",
    "title": "L293D motor sürücü",
    "partType": "l293d",
    "category": "Güç",
    "summary": "İçinde iki H-köprüsü olan çip. Motorun yönünü IN1 ve IN2 ile, hızını EN ile belirlersin.",
    "pins": [
      {
        "name": "VCC1",
        "description": "Çipin mantık gücü (5 V)."
      },
      {
        "name": "VCC2",
        "description": "Motorun gücü."
      },
      {
        "name": "GND",
        "description": "Toprak (gerçek çipte dört GND bacağı vardır; laboratuvarda tek pin)."
      },
      {
        "name": "EN12",
        "description": "Birinci kanalı açar/kapatır; PWM ile hız."
      },
      {
        "name": "IN1",
        "description": "Birinci kanal yön girişi 1."
      },
      {
        "name": "IN2",
        "description": "Birinci kanal yön girişi 2."
      },
      {
        "name": "OUT1",
        "description": "Birinci motor ucu."
      },
      {
        "name": "OUT2",
        "description": "İkinci motor ucu."
      },
      {
        "name": "EN34",
        "description": "İkinci kanalı açar/kapatır."
      },
      {
        "name": "IN3",
        "description": "İkinci kanal yön girişi 1."
      },
      {
        "name": "IN4",
        "description": "İkinci kanal yön girişi 2."
      },
      {
        "name": "OUT3",
        "description": "İkinci kanalın birinci motor ucu."
      },
      {
        "name": "OUT4",
        "description": "İkinci kanalın ikinci motor ucu."
      }
    ],
    "howItWorksMd": "L293D, **H-köprüsü** mantığıyla motorun uçlarına gelen gerilimin yönünü değiştirir. IN1 ve IN2 farklıysa motor döner: IN1 HIGH, IN2 LOW ise ileri; IN1 LOW, IN2 HIGH ise geri. İkisi aynıysa motor durur. EN12 LOW ise çıkışlar boşta kalır; EN12'ye PWM verilirse hız değişir.\n\nÇipin içinde geri tepme diyotları bulunur; ayrıca flyback diyot gerekmez. Kanal başına en çok 600 mA verir.\n\n**İleri düzey:** Çıkış tranzistörleri yüksek tarafta yaklaşık 1,4 V kaybeder. Yüksek çıkış VCC2 − 1,4 V, düşük çıkış yaklaşık 0,2 V olur. VCC2 = 5 V ise motor yaklaşık 3,3 V görür.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| L293D **EN12** | Uno **D6** |\n| L293D **IN1** | Uno **D7** |\n| L293D **IN2** | Uno **D5** |\n| L293D **VCC1** | Uno **5V** |\n| L293D **VCC2** | Uno **5V** |\n| L293D **GND** | Uno **GND** |\n| L293D **OUT1** | Motor **M1** |\n| L293D **OUT2** | Motor **M2** |\n\nVCC1 ya da VCC2 beslenmemişse laboratuvar uyarı verir. Gerçek devrede motor 5 V'u aşıyorsa VCC2 ayrı kaynaktan beslenir ve GND'ler birleştirilir.",
    "typicalValues": [
      {
        "label": "Kanal akımı",
        "value": "600 mA",
        "note": "Gerçek çip sınırı"
      },
      {
        "label": "Gerilim kaybı",
        "value": "≈ 1,4 V",
        "note": "Yüksek çıkışta"
      },
      {
        "label": "Düşük çıkış",
        "value": "≈ 0,2 V",
        "note": "GND üstünde"
      },
      {
        "label": "VCC1",
        "value": "5 V",
        "note": "Mantık gücü"
      },
      {
        "label": "Motor (VCC2 = 5 V)",
        "value": "≈ 3,3 V",
        "note": "Laboratuvar modeli"
      }
    ],
    "commonMistakesMd": "- **VCC1 ya da VCC2'yi bağlamamak.** Çip çalışmaz ya da çıkış boşta kalır.\n- **GND'yi unutmak.** Çip çalışmaz.\n- **EN12'yi sürmemek ya da LOW tutmak.** Motor durur.\n- **IN1 ve IN2'yi aynı yapmak.** Motor durur.\n- **Motor kaynağını VCC1'e bağlamak.** 5 V üstü gerilim mantık tarafına zarar verebilir.\n- **Büyük motor bağlamak.** Çip aşırı ısınır.",
    "relatedLessons": [
      "arduino-temelleri:5:3",
      "arduino-temelleri:5:2"
    ]
  },
  {
    "slug": "lcd1602",
    "title": "LCD 16x2 ekran",
    "partType": "lcd1602",
    "category": "Çıkış",
    "summary": "İki satırda 16'şar karakter gösteren, 6 sinyal pinle (4 bit kipinde) sürülen karakter ekranı.",
    "pins": [
      {
        "name": "VSS",
        "description": "Toprak. GND'ye bağlanır."
      },
      {
        "name": "VDD",
        "description": "Besleme, 5V."
      },
      {
        "name": "V0",
        "description": "Kontrast ucu. Genellikle potansiyometrenin orta ucuna bağlanır."
      },
      {
        "name": "RS",
        "description": "Komut / veri seçici. Uno'dan sürülür."
      },
      {
        "name": "RW",
        "description": "Okuma / yazma seçici. GND'ye bağlanır (yalnız yazılır)."
      },
      {
        "name": "E",
        "description": "Etkinleştirme darbesi. Uno'dan sürülür."
      },
      {
        "name": "D0",
        "description": "Veri biti 0 (4 bit kipinde boş kalır)."
      },
      {
        "name": "D1",
        "description": "Veri biti 1 (4 bit kipinde boş kalır)."
      },
      {
        "name": "D2",
        "description": "Veri biti 2 (4 bit kipinde boş kalır)."
      },
      {
        "name": "D3",
        "description": "Veri biti 3 (4 bit kipinde boş kalır)."
      },
      {
        "name": "D4",
        "description": "Veri biti 4. Uno'ya bağlanır."
      },
      {
        "name": "D5",
        "description": "Veri biti 5. Uno'ya bağlanır."
      },
      {
        "name": "D6",
        "description": "Veri biti 6. Uno'ya bağlanır."
      },
      {
        "name": "D7",
        "description": "Veri biti 7. Uno'ya bağlanır."
      },
      {
        "name": "A",
        "description": "Arka ışık artı ucu. Direnç üzerinden 5V'a bağlanır."
      },
      {
        "name": "K",
        "description": "Arka ışık eksi ucu. GND'ye bağlanır."
      }
    ],
    "howItWorksMd": "**LCD 16x2** iki satırda 16'şar karakter gösterir; her karakter 5x8 noktadan çizilir. Çoğu ekran HD44780 denetleyicisi taşır. Uno ile **4 bit kipinde** çalışırken RS, E ve D4-D7 olmak üzere 6 sinyal pini yeter; D0-D3 boş kalır.\n\nProgramda `LiquidCrystal lcd(RS, E, D4, D5, D6, D7);` nesnesi oluşturulur, `lcd.begin(16, 2)` ile ekran başlatılır, `lcd.setCursor(sütun, satır)` ve `lcd.print()` ile yazılır. Sayma 0'dan başlar. LCD eski karakteri silmez; yeni yazı üstüne yazılır.\n\n**V0** kontrastı belirler. Gerilim çok yüksekse karakterler görünmez. Arka ışık, yazıdan bağımsızdır; ışık yansa da kontrast uygun değilse ekran boş görünür.\n\n**İleri düzey:** Ekran 5 sütun x 8 satır noktalı karakterler çizer; `createChar` ile 8 özel karakter tanımlanabilir. Çok pin gerektirdiği için aynı ekran I2C adaptörüyle (lcdI2c parçası) iki telle de sürülür.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| **VSS**, **RW** ve **K** | **GND** |\n| **VDD** | **5V** |\n| **A** | 220 Ω direnç üzerinden **5V** |\n| **V0** | Potansiyometre **SIG** ucu (pot VCC = 5V, GND = GND) |\n| **RS** | Uno **D12** |\n| **E** | Uno **D11** |\n| **D4**, **D5**, **D6**, **D7** | Uno **D5**, **D4**, **D3**, **D2** |\n\nLaboratuvarda yazı görünmesi için VDD en az 4 V olmalı; VSS ve RW toprağa bağlı olmalı. V0 gerilimi yaklaşık 1,6 V'u aşarsa ekran boş görünür; V0 hiç bağlı değilse yazı görünür. Arka ışık, A-K arasından 1 mA'den fazla akım geçince yanık sayılır.",
    "typicalValues": [
      {
        "label": "Boyut",
        "value": "16 sütun x 2 satır",
        "note": "32 karakter"
      },
      {
        "label": "Sinyal pini sayısı",
        "value": "6",
        "note": "RS, E, D4, D5, D6, D7 (4 bit kipi)"
      },
      {
        "label": "Kontrast sınırı (V0)",
        "value": "1,6 V",
        "note": "Üstünde ekran boş görünür (laboratuvar modeli)"
      },
      {
        "label": "Arka ışık Vf",
        "value": "3 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Arka ışık yanma eşiği",
        "value": "1 mA",
        "note": "A-K akımı"
      },
      {
        "label": "Özel karakter sayısı",
        "value": "8",
        "note": "Yuva 0-7"
      }
    ],
    "commonMistakesMd": "- **Pin sırasını karıştırmak.** `LiquidCrystal lcd(12, 11, 5, 4, 3, 2)` sırası RS, E, D4, D5, D6, D7'dir; kodla kablolar uyuşmalıdır.\n- **Kontrastı ayarlamamak.** V0 gerilimi yüksekse ekran boş görünür; potansiyometre konumunu düşür.\n- **VSS, VDD ya da RW'yi bağlamamak.** Ekran açılmaz; RW'yi GND'ye bağla.\n- **`lcd.begin(16, 2)` yazmamak.** Ekran başlatılmaz.\n- **Eski yazıyı silmemek.** Kısa yazı uzun yazının üstüne yazılırsa eski karakterler kalır.\n- **Türkçe harf kullanmak.** ı, ş, ğ ekranın karakter tablosunda yoktur.",
    "relatedLessons": [
      "arduino-temelleri:7:2",
      "arduino-temelleri:7:3"
    ]
  },
  {
    "slug": "lcdI2c",
    "title": "I2C LCD 16x2",
    "partType": "lcdI2c",
    "category": "Çıkış",
    "summary": "16 karakterlik iki satırı yalnız iki veri teliyle (SDA ve SCL) yazan, arkasında I2C genişletici bulunan LCD ekran.",
    "pins": [
      {
        "name": "GND",
        "description": "Toprak. Uno GND'ye bağlanır."
      },
      {
        "name": "VCC",
        "description": "Besleme. Uno 5V'a bağlanır."
      },
      {
        "name": "SDA",
        "description": "I2C veri hattı. Uno'da A4'e bağlanır."
      },
      {
        "name": "SCL",
        "description": "I2C saat hattı. Uno'da A5'e bağlanır."
      }
    ],
    "howItWorksMd": "Paralel bir LCD çok pin ister. I2C LCD'nin arkasındaki küçük kart (PCF8574 genişletici) bu pinleri üstlenir; Arduino ekranla yalnız iki telden, SDA ve SCL üzerinden konuşur. Her I2C cihazının hatta 7 bitlik bir adresi vardır ve kart yalnız o adrese yazılan mesajlara cevap verir. Ekran 16 sütun ve 2 satırdır; yani en çok 32 karakter gösterir.\n\n**İleri düzey:** Yaygın kartlarda adres 0x27'dir (PCF8574); bazılarında 0x3F olur (PCF8574A). Kodda yazdığın adres ekranınkiyle aynı olmazsa ekran cevap vermez. Adresi bulmak için I2C tarama programı çalıştırılır. Yerleşik karakter tablosunda Türkçe harfler (ç, ş, ğ, ı) bulunmaz.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| LCD **SDA** | Uno **A4** |\n| LCD **SCL** | Uno **A5** |\n| LCD **VCC** | Uno **5V** |\n| LCD **GND** | Uno **GND** |\n\nÖzellik panelindeki **I2C adresi** alanından 0x27 ya da 0x3F seçilir (varsayılan 0x27). VCC ve GND eksikse \"beslenmemiş\" uyarısı çıkar. Programda `lcd.init()` ve `lcd.backlight()` çağrılmalıdır; `init()` içinde yaklaşık 1 saniyelik bekleme olduğundan yazı ▶'ten sonra biraz gecikmeyle görünür.",
    "typicalValues": [
      {
        "label": "Ekran boyutu",
        "value": "16 × 2",
        "note": "16 sütun, 2 satır"
      },
      {
        "label": "Varsayılan adres",
        "value": "0x27",
        "note": "Bazı kartlarda 0x3F"
      },
      {
        "label": "SDA pini",
        "value": "A4",
        "note": "Uno donanımsal I2C"
      },
      {
        "label": "SCL pini",
        "value": "A5",
        "note": "Uno donanımsal I2C"
      },
      {
        "label": "Besleme",
        "value": "5 V",
        "note": "Laboratuvarda VCC ve GND bağlı olmalı"
      }
    ],
    "commonMistakesMd": "- **Adres uyuşmazlığı.** Özellik panelinde 0x3F iken kodda 0x27 yazılırsa ekran boş kalır. Tarama programıyla adresi doğrula.\n- **SDA ve SCL'yi çaprazlamak.** Ekran ve tarama hiç cihaz bulamaz.\n- **A4 ve A5 dışındaki pine bağlamak.** Uno'nun donanımsal I2C'si yalnız bu iki pindedir.\n- **`init()` ve `backlight()` çağırmamak.** Ekran başlamaz ya da arka ışık yanmaz.\n- **Her turda bütün ekranı yeniden yazmak.** Hat gereksiz yere meşgul olur; yalnız değişen satırı yaz.",
    "relatedLessons": [
      "arduino-temelleri:7:2",
      "arduino-temelleri:7:3",
      "sensorler-ve-projeler:6:5"
    ]
  },
  {
    "slug": "ldr",
    "title": "LDR",
    "partType": "ldr",
    "category": "Girdi",
    "summary": "Işık arttıkça direnci azalan iki uçlu parça. Sabit bir dirençle gerilim bölücü kurularak okunur.",
    "pins": [
      {
        "name": "1",
        "description": "Birinci uç. Yönsüzdür; 1 ile 2 birbirinin yerine kullanılabilir."
      },
      {
        "name": "2",
        "description": "İkinci uç."
      }
    ],
    "howItWorksMd": "**LDR** (ışığa duyarlı direnç), üzerine düşen ışığa göre direnci değişen bir parçadır. Işık arttıkça direnci **azalır**: karanlıkta çok büyük (yüzlerce kΩ), parlak ışıkta çok küçüktür (birkaç yüz Ω). Uno direnci ölçemez, yalnız gerilimi ölçer; bu yüzden LDR bir sabit dirençle seri bağlanıp **gerilim bölücü** yapılır.\n\nBu sitedeki standart devre: LDR 5V ile A1 arasında, 10 kΩ direnç A1 ile GND arasında. Işık arttıkça LDR küçülür, A1 gerilimi ve `analogRead(A1)` değeri **artar**. İki parçanın yeri değişirse yön tersine döner.\n\n**İleri düzey:** A1'de okunan `ham` değerinden LDR direnci `R_ldr = 10000 × (1024 − ham) / ham` ile bulunur. Eşik civarındaki titremeyi önlemek için iki eşikli karar (histerezis) kullanılır.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| LDR **1** | Uno **5V** |\n| LDR **2** | Uno **A1** ve 10 kΩ direncin 1. ucu |\n| 10 kΩ direncin 2. ucu | Uno **GND** |\n\nIşık düzeyini özellik panelindeki **Işık** kaydırıcısıyla (0 ile 1 arası) çalışırken değiştirirsin. `analogRead` için `pinMode` yazman gerekmez.",
    "typicalValues": [
      {
        "label": "Karanlık (Işık 0)",
        "value": "≈ 1 MΩ",
        "note": "Laboratuvar modelinin üst sınırı; 10 kΩ ile okuma ≈ 10"
      },
      {
        "label": "Orta ışık (Işık 0,5)",
        "value": "≈ 14 kΩ",
        "note": "10 kΩ ile okuma ≈ 424"
      },
      {
        "label": "Parlak ışık (Işık 1)",
        "value": "≈ 200 Ω",
        "note": "10 kΩ ile okuma ≈ 1004"
      },
      {
        "label": "Sabit bölücü direnci",
        "value": "10 kΩ",
        "note": "Bu sitedeki derslerin standardı"
      }
    ],
    "commonMistakesMd": "- **Sabit direnci unutmak.** LDR doğrudan 5V ile A1 arasında kalır; pin havada olur ve ölçüm anlamsızlaşır.\n- **LDR ile sabit direncin yerini değiştirmek.** Devre çalışır ama ışık arttıkça `ham` düşer; programın mantığı tersine döner.\n- **Çok küçük sabit direnç seçmek.** 100 Ω gibi bir değerle Vout neredeyse hep 0 V'ta kalır, aralık daralır.\n- **Tek eşik kullanmak.** Işık eşik civarındayken LED sürekli yanıp söner; iki eşik (histerezis) kullan.",
    "relatedLessons": [
      "arduino-temelleri:3:2",
      "arduino-temelleri:3:4",
      "arduino-temelleri:3:5"
    ]
  },
  {
    "slug": "led",
    "title": "LED",
    "partType": "led",
    "category": "Çıkış",
    "summary": "Akım geçince ışık veren, yönlü iki uçlu parça. Mutlaka seri direnç ister.",
    "pins": [
      {
        "name": "A",
        "description": "Anot (+). Gerçek LED'de uzun bacak. Akımın girdiği uç."
      },
      {
        "name": "K",
        "description": "Katot (-). Gerçek LED'de kısa bacak, gövdede düz kesik taraf. GND tarafına gider."
      }
    ],
    "howItWorksMd": "**LED** (ışık yayan diyot), akımı yalnız bir yönde geçiren ve geçirirken ışık veren bir parçadır. Akım **A'dan K'ya** akar. Ters bağlarsan akım geçmez ve LED yanmaz; bu LED'i bozmaz, yalnızca ışık vermez.\n\nLED bir direnç gibi davranmaz. Yanarken uçları arasında yaklaşık **sabit bir gerilim** düşer; buna ileri gerilim (Vf) denir ve rengine bağlıdır. Geri kalan gerilim devredeki başka bir şeyin üzerinde düşmek zorundadır. O \"başka şey\" **seri direnç** değilse akım sınırlanmaz, LED çok akım çeker ve yanar. Bu yüzden LED'in yanına her zaman bir direnç koyarsın:\n\n`I = (Vbesleme − Vf) / R`\n\nParlaklık akımla artar. Birkaç mA'de belirgin ışık verir; Uno pininden çekilecek güvenli akım yaklaşık 20 mA'in altındadır.\n\n**İleri düzey:** LED'in akım-gerilim ilişkisi doğrusal değildir; gerilim biraz artınca akım hızla artar. Bu yüzden LED'i bir gerilim kaynağına doğrudan bağlamak yerine akımı bir dirençle belirlersin. Laboratuvar LED'i \"sabit Vf + küçük iç direnç\" olarak modeller; Uno pininin iç direncini (yaklaşık 25 Ω) de hesaba katar.",
    "wiringMd": "Pin adları laboratuvardaki parçanın uçlarıyla aynıdır.\n\n| Nereden | Nereye |\n|---|---|\n| Uno **D13** (ya da başka bir dijital pin) | Direncin **1** ucu |\n| Direncin **2** ucu | LED **A** |\n| LED **K** | Uno **GND** |\n\nDirenç LED'in anot ya da katot tarafında olabilir; akım sınırlama açısından fark etmez. Bu sitedeki derslerde direnç pin tarafındadır. Rengi özellik panelinden seçersin (kırmızı, sarı, yeşil, mavi, beyaz).\n\nUno üzerinde D13'e bağlı dahili bir L LED'i vardır. Kodla D13'ü sürünce o da yanar.",
    "typicalValues": [
      {
        "label": "Kırmızı LED Vf",
        "value": "1,9 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Sarı LED Vf",
        "value": "2,0 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Yeşil LED Vf",
        "value": "2,2 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Mavi ve beyaz LED Vf",
        "value": "3,0 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Seri direnç (5 V, kırmızı)",
        "value": "330 Ω",
        "note": "Yaklaşık 9 mA; bu sitedeki derslerin standardı"
      },
      {
        "label": "Rahat parlaklık akımı",
        "value": "5-15 mA",
        "note": "Laboratuvarda parlaklık 10 mA civarında tam görünür"
      },
      {
        "label": "Uyarı sınırı",
        "value": "25 mA",
        "note": "Üstünde \"seri direnç yok ya da çok küçük\" uyarısı çıkar"
      },
      {
        "label": "Yanma sınırı",
        "value": "30 mA",
        "note": "Üstünde LED yanar; ↺ ile baştan başlayınca düzelir"
      }
    ],
    "commonMistakesMd": "- **Direnç koymamak.** Akım sınırlanmaz; laboratuvar uyarı verir ve LED yanabilir. Gerçek devrede LED ve Uno pini zarar görebilir.\n- **LED'i ters bağlamak.** Yanmaz. A ucunu pin/direnç tarafına, K ucunu GND'ye bağla.\n- **GND'yi unutmak.** Devre kapanmaz; akım akmaz.\n- **Mavi/beyaz LED'i kırmızıyla aynı parlaklık sanmak.** Vf daha büyük olduğu için aynı dirençle akım daha küçük olur: 330 Ω'da kırmızı yaklaşık 8,6 mA, mavi yaklaşık 5,6 mA çeker (laboratuvar modeli).\n- **Aynı direnci birkaç LED'in ortak ucuna koymak.** Tek direnç yalnız toplam akımı sınırlar; her LED'e kendi direncini ver.",
    "relatedLessons": [
      "arduino-temelleri:1:2",
      "arduino-temelleri:1:3",
      "arduino-temelleri:1:4",
      "arduino-temelleri:1:5"
    ]
  },
  {
    "slug": "mosfet",
    "title": "MOSFET",
    "partType": "mosfet",
    "category": "Güç",
    "summary": "Geçit gerilimiyle çalışan, neredeyse hiç akım çekmeyen ve güçlü yükleri süren N kanallı anahtar.",
    "pins": [
      {
        "name": "G",
        "description": "Geçit. Kumanda ucu; bir Uno pinine bağlanır."
      },
      {
        "name": "D",
        "description": "Akaç. Yük akımı buradan girer."
      },
      {
        "name": "S",
        "description": "Kaynak. GND'ye bağlanır."
      }
    ],
    "howItWorksMd": "MOSFET, **gerilimle** çalışır: geçit ile kaynak arasındaki gerilim eşiği (yaklaşık 2 V) aşınca akaç ile kaynak arasından akım geçer. Geçit neredeyse akım çekmez; bu yüzden NPN gibi baz akımı hesabı gerekmez.\n\nDikkat: her MOSFET 5 V ile tam açılmaz. Arduino ile **mantık seviyeli (logic level)** olan seçilir. İletirken direnci çok küçüktür (laboratuvarda yaklaşık 0,05 Ω); bu yüzden motor neredeyse tam 5 V görür ve NPN'e göre daha hızlı döner.\n\nMotor bobin olduğu için flyback diyot yine gerekir.\n\n**İleri düzey:** Geçit küçük bir kapasite gibi davranır; gerçek devrede geçide 100 Ω civarı seri direnç konur, geçit ile GND arasına da 10 kΩ'luk bir direnç koyarak açılışta geçidin havada kalması önlenir.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| MOSFET **S** | Uno **GND** |\n| MOSFET **D** | Motor **M2** (ve diyot **A**) |\n| MOSFET **G** | 100 Ω direnç üzerinden Uno **D6** |\n| 10 kΩ direnç | **G** ile **GND** arası |\n\nMotor **M1** ucu 5V'a bağlanır; diyotun K ucu da 5V'a gider.",
    "typicalValues": [
      {
        "label": "Eşik gerilimi",
        "value": "≈ 2 V",
        "note": "Laboratuvar modeli, mantık seviyeli"
      },
      {
        "label": "İletim direnci",
        "value": "≈ 0,05 Ω",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Tam gazda motor hızı",
        "value": "≈ 0,83",
        "note": "NPN'de ≈ 0,70"
      },
      {
        "label": "Geçit direnci",
        "value": "100 Ω",
        "note": "Bu sitedeki derslerin standardı"
      }
    ],
    "commonMistakesMd": "- **Mantık seviyeli olmayan MOSFET seçmek.** 5 V ile yeterince açılmaz, ısınır.\n- **Kaynağı GND'ye bağlamamak.** Akım yolu tamamlanmaz.\n- **Flyback diyotu atlamak.** Bobin sıçraması MOSFET'i bozabilir.\n- **Geçidi havada bırakmak.** Açılışta rastgele iletebilir.",
    "relatedLessons": [
      "arduino-temelleri:5:2",
      "arduino-temelleri:5:3"
    ]
  },
  {
    "slug": "mpu6050",
    "title": "MPU6050 ivmeölçer ve jiroskop",
    "partType": "mpu6050",
    "category": "Girdi",
    "summary": "I2C ile konuşan üç eksenli ivmeölçer ve jiroskop. Eğim ve dönüş hızını ölçer.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme. 5V'a bağlanır (en az yaklaşık 3 V gerekir)."
      },
      {
        "name": "GND",
        "description": "Toprak."
      },
      {
        "name": "SDA",
        "description": "I2C veri hattı. Uno'da A4."
      },
      {
        "name": "SCL",
        "description": "I2C saat hattı. Uno'da A5."
      }
    ],
    "howItWorksMd": "**MPU6050**, içinde üç eksenli bir ivmeölçer ve üç eksenli bir jiroskop taşıyan I2C çipidir. İvmeölçer yer çekimini ve hızlanmayı g cinsinden, jiroskop dönüş hızını °/s cinsinden ölçer. Çip açılışta uykudadır; 0x6B yazmacına 0 yazılınca uyanır. Ölçümler 0x3B'den başlayan 14 bayttadır: ivme X, Y, Z, sıcaklık, jiroskop X, Y, Z (her biri 2 bayt, önce yüksek bayt, 16 bit işaretli).\n\nVarsayılan aralıklarda ham değer ivme için 16384'e (g), jiroskop için 131'e (°/s) bölünür. Durağan çip yer çekimini ölçtüğü için eğim açısı `atan2(ax, az)` ile bulunur. İvmeölçer kaymaz ama titreşime duyarlıdır; jiroskop hızlıdır ama sapma biriktirir. İkisi tamamlayıcı filtreyle birleştirilir.\n\n**İleri düzey:** Sıcaklık `ham / 340 + 36,53` derecedir. Gerçek jiroskop durağanken birkaç °/s sapma gösterir; veri sayfası başlangıç sapması için ±20 °/s'ye kadar tolerans verir. Laboratuvar çipi ideal olduğundan sapması yoktur ve sıcaklığı 25 °C'de sabittir.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| MPU6050 **VCC** | Uno **5V** |\n| MPU6050 **GND** | Uno **GND** |\n| MPU6050 **SDA** | Uno **A4** |\n| MPU6050 **SCL** | Uno **A5** |\n\nÖzellik panelinde **İvme X, Y, Z** (g), **Jiroskop X, Y, Z** (°/s) ve **I2C adresi (AD0)** vardır. Değerler program çalışırken de değiştirilebilir. Adresi 0x69 seçersen koddaki `MPU` sabitini de 0x69 yapmalısın.",
    "typicalValues": [
      {
        "label": "I2C adresi",
        "value": "0x68",
        "note": "AD0 5V'a bağlıysa 0x69"
      },
      {
        "label": "Düz duran çip",
        "value": "ax = 0, ay = 0, az = 1 g",
        "note": "Laboratuvar varsayılanı"
      },
      {
        "label": "İvme çevirmesi",
        "value": "ham / 16384",
        "note": "±2 g aralığında; 1 g = 16384"
      },
      {
        "label": "Jiroskop çevirmesi",
        "value": "ham / 131",
        "note": "±250 °/s aralığında"
      },
      {
        "label": "Sıcaklık",
        "value": "25 °C",
        "note": "Laboratuvar çipi için sabit"
      },
      {
        "label": "Eğim örneği",
        "value": "ax = 0,5, az = 0,866 → 30°",
        "note": "pitch = atan2(ax, az)"
      }
    ],
    "commonMistakesMd": "- **0x6B yazmacına 0 yazmayı unutmak.** Çip uykuda kalır.\n- **ax / 16384 yazmak.** Tam sayı bölmesi 0 verir; 16384.0 yaz.\n- **Baytları işaretsiz birleştirmek.** Negatif değer 65000 gibi görünür; int16_t kullan.\n- **RTC (DS3231) ile aynı hatta kullanmak.** İkisi de 0x68 adresindedir.\n- **Hareketli çipin açısına güvenmek.** İvmeölçer yer çekimi ile çipin hızlanmasını ayıramaz.",
    "relatedLessons": [
      "arduino-temelleri:7:3",
      "sensorler-ve-projeler:5:3",
      "sensorler-ve-projeler:5:4"
    ]
  },
  {
    "slug": "mq2",
    "title": "MQ-2 gaz sensörü",
    "partType": "mq2",
    "category": "Sensör",
    "summary": "Yanıcı gazlara ve dumana duyarlı, analog gerilimle \"temiz havaya göre ne kadar arttı\" bilgisi veren modül. Gaz türünü ayırt edemez.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. 5V'a bağlanır; en az 4 V gerekir."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      },
      {
        "name": "AO",
        "description": "Analog çıkış. Uno'nun bir analog girişine (derslerde A3) gider; gaz arttıkça gerilim yükselir."
      },
      {
        "name": "DO",
        "description": "Dijital çıkış. Gaz düzeyi eşiği geçince LOW olur; derslerde kullanılmaz."
      }
    ],
    "howItWorksMd": "MQ-2'nin içinde ısıtılan bir sensör elemanı vardır. Yanıcı gazlar ve duman bu elemanın direncini değiştirir; modül bunu analog çıkışta gerilim olarak verir. Gaz arttıkça AO yükselir. `analogRead` bu gerilimi 0-1023 arası bir sayıya çevirir.\n\nSensör hangi gaz olduğunu **ayırt edemez**. Ayrıca ısıtıcı çalışma sıcaklığına gelene kadar okumalar kararsızdır; gerçek modülde ısınma süresi uzundur. Isındıktan sonra temiz havada bir **baz değer** ölçülür ve alarm eşiği bazın katı olarak yazılır (örneğin 1,5 katı). ppm gibi bir birim için veri sayfasındaki eğri, gazın türü ve kalibrasyon gerekir; bu olmadan ppm yazılmaz.\n\n**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,1 + 0,9 × Gaz düzeyi). Gerçek MQ-2'de sensör direnci ile modüldeki yük direncinin oluşturduğu bölücüyle AO oluşur ve ısınma ile ortam sıcaklığı değeri kaydırır; laboratuvar bunu modellemez. Gerçek MQ-2 ısıtıcısı aynı zamanda sıcak çalışır.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| MQ-2 **VCC** | Uno **5V** |\n| MQ-2 **GND** | Uno **GND** |\n| MQ-2 **AO** | Uno **A3** |\n\nÖzellik panelindeki **Gaz düzeyi** (0 ile 1) gazı taklit eder ve program çalışırken değiştirilebilir. **Eşik (DO)** yalnız dijital çıkışı etkiler. Modül 4 V'un altındaki beslemede çalışmaz; 3,3 V'a bağlarsan beslenmemiş sayılır.",
    "typicalValues": [
      {
        "label": "Gaz düzeyi 0 (temiz hava)",
        "value": "ham ≈ 102",
        "note": "Yaklaşık 0,5 V; bu senin baz değerindir"
      },
      {
        "label": "Gaz düzeyi 0,03",
        "value": "ham ≈ 130",
        "note": "Bazın yaklaşık 1,27 katı"
      },
      {
        "label": "Gaz düzeyi 0,1",
        "value": "ham ≈ 194",
        "note": "Bazın yaklaşık 1,9 katı"
      },
      {
        "label": "Gaz düzeyi 0,3",
        "value": "ham ≈ 379",
        "note": "Bazın yaklaşık 3,7 katı"
      },
      {
        "label": "Gaz düzeyi 1",
        "value": "ham = 1023",
        "note": "Tam ölçek (5 V)"
      },
      {
        "label": "Derslerdeki alarm eşikleri",
        "value": "baz × 1,5 ve × 2,5",
        "note": "Kapama eşikleri baz × 1,25 ve × 2"
      }
    ],
    "commonMistakesMd": "- **Isınmayı beklememek.** Gerçek modülde baz değer yanlış çıkar, alarm yanlış çalar ya da hiç çalmaz.\n- **Bazı gazlı ortamda ölçmek.** Eşikler yukarı kayar ve gerçek bir artış kaçar.\n- **Sabit sayıyla karşılaştırmak.** `okuma > 400` başka modülde ya da başka havada anlamsız olur; bazın katını kullan.\n- **Okumayı ppm gibi birime çevirmek.** Kalibrasyon olmadan sayı güvenilir değildir.\n- **Tamsayı bölmesi.** `ort / baz` iki `int` ise 1,6 değil 1 çıkar; bölmede `float` kullan.\n- **Gerçek güvenlik için tek başına kullanmak.** Bu sensör ve ders devreleri eğitim amaçlıdır; sertifikalı dedektörün yerini tutmaz.",
    "relatedLessons": [
      "sensorler-ve-projeler:4:3",
      "sensorler-ve-projeler:4:4",
      "sensorler-ve-projeler:4:5"
    ]
  },
  {
    "slug": "npn",
    "title": "NPN transistör",
    "partType": "npn",
    "category": "Güç",
    "summary": "Küçük bir baz akımıyla çok daha büyük bir kolektör akımını yöneten elektronik anahtar.",
    "pins": [
      {
        "name": "B",
        "description": "Baz. Kumanda ucu; küçük bir direnç üzerinden bir Uno pinine bağlanır."
      },
      {
        "name": "C",
        "description": "Kolektör. Yük akımı buradan girer (yük genellikle 5V ile C arasındadır)."
      },
      {
        "name": "E",
        "description": "Emitör. GND'ye bağlanır."
      }
    ],
    "howItWorksMd": "Arduino pini yaklaşık 20 mA ile rahat çalışır; motor gibi yükler daha fazla akım çeker. NPN transistör bu sorunu çözer: baz ile emitör arası yaklaşık 0,7 V'u aşınca küçük bir **baz akımı** akar ve transistör kolektörden emitöre çok daha büyük bir akım geçirir. Laboratuvardaki akım kazancı yaklaşık 100'dür.\n\nBaz akımını bir **seri direnç** sınırlar. D6 = 5 V ve 1 kΩ ile baz akımı (5 − 0,7) / 1000 = 4,3 mA olur. Bu akım 100 × 4,3 = 430 mA kadar yük akımına yeter.\n\nYük motor gibi bir bobinse transistörü korumak için motora **flyback diyot** konur.\n\n**İleri düzey:** İletirken kolektör-emitör arasında bir doyum gerilimi (yaklaşık 0,2 V) kalır; bu yüzden motor 5 V'tan biraz az gerilim görür (tam gazda yaklaşık 4,2 V).",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Transistör **E** | Uno **GND** |\n| Transistör **C** | Motor **M2** (ve diyot **A**) |\n| 1 kΩ direnç **2** | Transistör **B** |\n| 1 kΩ direnç **1** | Uno **D6** |\n\nMotor **M1** ucu 5V'a bağlanır. Taban akımı yaklaşık 30 mA'yı aşarsa laboratuvar uyarı verir.",
    "typicalValues": [
      {
        "label": "Taban-emitör eşiği",
        "value": "≈ 0,7 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Akım kazancı",
        "value": "≈ 100",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Baz direnci",
        "value": "1 kΩ",
        "note": "Bu sitedeki derslerin standardı; baz akımı ≈ 4,3 mA"
      },
      {
        "label": "Doyum gerilimi",
        "value": "≈ 0,2 V",
        "note": "İletirken C-E arası"
      },
      {
        "label": "Taban akımı uyarı sınırı",
        "value": "30 mA",
        "note": "Üstünde uyarı çıkar"
      }
    ],
    "commonMistakesMd": "- **Baz direncini koymamak.** Taban akımı sınırsız kalır; laboratuvar uyarı verir.\n- **Emitörü GND'ye bağlamamak.** Akım yolu tamamlanmaz, motor dönmez.\n- **Flyback diyotu unutmak.** Bobin sıçraması transistörü bozar; laboratuvar uyarı verir.\n- **Ayakları karıştırmak.** B, C ve E yer değiştirirse transistör iletmez.",
    "relatedLessons": [
      "arduino-temelleri:5:2",
      "arduino-temelleri:5:5"
    ]
  },
  {
    "slug": "ntc",
    "title": "NTC termistör",
    "partType": "ntc",
    "category": "Girdi",
    "summary": "Sıcaklık arttıkça direnci azalan iki uçlu parça. Sabit bir dirençle bölücü kurularak ve beta formülüyle sıcaklığa çevrilir.",
    "pins": [
      {
        "name": "1",
        "description": "Birinci uç. Yönsüzdür; 1 ile 2 birbirinin yerine kullanılabilir."
      },
      {
        "name": "2",
        "description": "İkinci uç."
      }
    ],
    "howItWorksMd": "**NTC** (Negative Temperature Coefficient) termistör, sıcaklık arttıkça direnci **azalan** bir dirençtir. Yaygın tür 25 °C'de 10 kΩ'dur. Direncin sıcaklıkla değişimi doğrusal değil, üstel bir eğridir.\n\nSensör, 10 kΩ sabit dirençle gerilim bölücü yapılır: sabit direnç 5V ile A2 arasında, NTC A2 ile GND arasında. Sıcaklık artınca NTC küçülür, A2 gerilimi ve `analogRead(A2)` değeri **azalır**. Ham değerden NTC direnci `R = 10000.0 × ham / (1024 − ham)` ile bulunur.\n\n**İleri düzey:** Dirençten sıcaklık için beta formülü kullanılır: `1/T = 1/T0 + log(R / R0) / B`. Burada T0 = 298,15 K, R0 = 10 kΩ, B = 3950 (laboratuvar modeli). Sonuç Kelvin'dir; Celsius için 273,15 çıkarılır. Daha doğru model Steinhart-Hart denklemidir. Gerçek bir parçanın B değeri veri sayfasından okunmalıdır.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| NTC **1** | Uno **A2** ve 10 kΩ direncin 2. ucu |\n| NTC **2** | Uno **GND** |\n| 10 kΩ direncin 1. ucu | Uno **5V** |\n\nSıcaklığı özellik panelindeki **Sıcaklık** kaydırıcısıyla (-20 ile 120 °C) çalışırken değiştirirsin. `analogRead` için `pinMode` yazman gerekmez.",
    "typicalValues": [
      {
        "label": "0 °C",
        "value": "≈ 33,6 kΩ",
        "note": "B = 3950 modeli"
      },
      {
        "label": "25 °C",
        "value": "10 kΩ",
        "note": "Referans noktası; okuma ≈ 512"
      },
      {
        "label": "50 °C",
        "value": "≈ 3,59 kΩ",
        "note": "Okuma ≈ 270"
      },
      {
        "label": "100 °C",
        "value": "≈ 0,70 kΩ",
        "note": "Okuma ≈ 67"
      },
      {
        "label": "Beta katsayısı (B)",
        "value": "3950",
        "note": "Laboratuvar modeli; gerçek parçada değişir"
      }
    ],
    "commonMistakesMd": "- **Kelvin ile Celsius'u karıştırmak.** Formül Kelvin verir; 273,15 çıkarmayı unutursan 298 gibi sayılar görürsün.\n- **`log` yerine `log10` kullanmak.** Beta formülü doğal logaritma ister.\n- **Sabit direncin değerini kodda yanlış yazmak.** Kodda 10000 yazıp devrede başka değer kullanırsan sonuç kayar.\n- **`10000 * ham` yazmak.** `int` taşar; `10000.0 *` yaz.\n- **ham = 0 ya da 1023'ü denetlememek.** Kopuk ya da kısa devre sensörde anlamsız sıcaklık çıkar.",
    "relatedLessons": [
      "arduino-temelleri:3:3",
      "arduino-temelleri:3:5"
    ]
  },
  {
    "slug": "pir",
    "title": "PIR hareket sensörü",
    "partType": "pir",
    "category": "Sensör",
    "summary": "Kızılötesi ışınımın değişimini algılayan ve hareket varken OUT çıkışını HIGH yapan sensör; açılışta bir ısınma süresi ister.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme. Laboratuvarda 5V'a bağlanır."
      },
      {
        "name": "OUT",
        "description": "Dijital çıkış. Hareket varken HIGH, yokken LOW olur."
      },
      {
        "name": "GND",
        "description": "Toprak. Uno'nun GND'sine bağlanır."
      }
    ],
    "howItWorksMd": "PIR (pasif kızılötesi) sensör, çevredeki kızılötesi (ısı) ışınımının değişimini algılar. Sıcak bir cisim (insan, hayvan) görüş alanında hareket edince ışınım değişir ve OUT çıkışı HIGH olur. Duran bir cisim ya da yavaş değişen ortam sıcaklığı bu değişimi yaratmaz. \"Pasif\" demek, sensörün kendisi ışık göndermeyip yalnızca dinlemesidir.\n\nHareket bittikten sonra çıkış bir süre HIGH kalır. Laboratuvarda bu süre 3 saniyedir. Açılışta sensör bir ısınma süresi bekler; bu sırada çıkış parazitli oynayabilir. Laboratuvarda ısınma 2 saniyedir ve bu sırada **Hareket** kutusu yok sayılır.\n\n**İleri düzey:** Gerçek modüllerde ısınma süresi genelde yarım dakika ile bir dakika civarındadır ve modüle göre değişir; çoğunda hassasiyet ve çıkışın HIGH kalma süresi için ayar vidaları vardır. Hangi vidanın ne yaptığı modüle bağlıdır, veri sayfasına bak. Alarm gibi uygulamalarda açılıştan sonra bu süre kadar PIR'ı yok sayarsın (ders 75).",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| PIR **VCC** | Uno **5V** |\n| PIR **GND** | Uno **GND** |\n| PIR **OUT** | Uno **D2** |\n\nKodda `pinMode(2, INPUT)` yazarsın; OUT kendi gerilimini taşıdığı için `INPUT_PULLUP` gerekmez. Hareketi özellik panelindeki **Hareket** kutusuyla verirsin ve çalışırken değiştirebilirsin.",
    "typicalValues": [
      {
        "label": "Laboratuvar ısınması",
        "value": "2 sn",
        "note": "Gerçek modülde genelde yarım dakika-1 dakika, modüle göre değişir"
      },
      {
        "label": "Hareketten sonra HIGH kalma",
        "value": "3 sn",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Beslemeyle çalışma eşiği",
        "value": "4 V",
        "note": "Altında modül beslenmemiş sayılır"
      },
      {
        "label": "Önerilen bağlantı",
        "value": "D2'ye OUT",
        "note": "Bu sitedeki derslerin standardı"
      }
    ],
    "commonMistakesMd": "- **Isınma süresini hesaba katmamak.** Açılışta çıkış parazitli oynar, oda \"dolu\" sanılır.\n- **`INPUT_PULLUP` kullanmak.** OUT kendi gerilimini taşır, düz `INPUT` yeter.\n- **Hareket bittiğinde çıkışın hemen LOW olacağını sanmak.** Çıkış bir süre HIGH kalır.\n- **Durağan bir insanı algılamasını beklemek.** PIR hareket (ışınım değişimi) algılar, varlık değil.\n- **GND bağlamamak.** Devre kapanmaz, çıkış anlamsız olur.",
    "relatedLessons": [
      "sensorler-ve-projeler:2:1",
      "sensorler-ve-projeler:8:5"
    ]
  },
  {
    "slug": "potansiyometre",
    "title": "Potansiyometre",
    "partType": "pot",
    "category": "Girdi",
    "summary": "Konumu değiştirilen üç uçlu direnç. Orta ucundan 0-5 V arası bir gerilim okunur.",
    "pins": [
      {
        "name": "VCC",
        "description": "Bir uç. 5V'a bağlanır."
      },
      {
        "name": "SIG",
        "description": "Orta uç (kayar uç). Konuma göre 0-5 V arası gerilim verir. Uno'nun bir analog girişine gider."
      },
      {
        "name": "GND",
        "description": "Diğer uç. GND'ye bağlanır."
      }
    ],
    "howItWorksMd": "Potansiyometre (pot), iki uç arasında sabit bir direnç şeridi ve bu şeridin üzerinde gezen bir **kayar uç** içerir. Şeridin iki ucunu 5 V ve GND'ye bağlarsan kayar uç, şeridin neresinde durduğuna göre 0 V ile 5 V arasında bir gerilim verir. Bu bir **gerilim bölücüdür**.\n\nKayar uç GND ucuna doğru çevrilince SIG gerilimi 0 V'a, VCC ucuna doğru çevrilince 5 V'a yaklaşır. Laboratuvarda `Konum` özelliği 0 ile 1 arasındadır ve SIG gerilimi ≈ `Konum × 5 V` olur.\n\nArduino'da `analogRead(A0)` bu gerilimi 0-1023 arası bir sayıya çevirir (10 bit ADC). Konum 0,5 ise okuma yaklaşık 512'dir.\n\nPotun toplam direnci (10 kΩ gibi) kayar uç hangi konumda olursa olsun uçlar arasında sabit kalır; konum yalnızca bu direncin nasıl paylaşıldığını değiştirir.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Pot **VCC** | Uno **5V** |\n| Pot **GND** | Uno **GND** |\n| Pot **SIG** | Uno **A0** |\n\nKonumu özellik panelindeki **Konum** kaydırıcısıyla çalışırken değiştirirsin. Toplam direnç 100 Ω ile 1 MΩ arasında ayarlanabilir; varsayılan 10 kΩ'dur. `analogRead` için `pinMode` yazman gerekmez.",
    "typicalValues": [
      {
        "label": "Toplam direnç",
        "value": "10 kΩ",
        "note": "Varsayılan; bu sitedeki derslerin standardı"
      },
      {
        "label": "Konum 0",
        "value": "≈ 0 V, okuma ≈ 0",
        "note": "SIG, GND'ye yakın"
      },
      {
        "label": "Konum 0,5",
        "value": "≈ 2,5 V, okuma ≈ 512",
        "note": "Orta nokta"
      },
      {
        "label": "Konum 1",
        "value": "≈ 5 V, okuma ≈ 1023",
        "note": "SIG, VCC'ye yakın"
      },
      {
        "label": "ADC basamağı",
        "value": "≈ 4,9 mV",
        "note": "5 V / 1024"
      }
    ],
    "commonMistakesMd": "- **SIG'i dijital bir pine bağlayıp analog değer beklemek.** Analog okuma için A0-A5 kullan.\n- **VCC ve GND'yi karıştırmak.** Pot ters çalışır: yön tersine döner. Zarar vermez ama sonuç tersine olur.\n- **Orta ucu (SIG) 5V ya da GND'ye bağlamak.** Okuma sabit kalır.\n- **SIG'i bağlamayı unutmak.** Yüzen analog giriş rastgele sayı okur.\n- **Okumayı doğrudan gerilim sanmak.** `analogRead` 0-1023 sayısı verir; gerilim için `ham × 5,0 / 1024` hesaplanır.",
    "relatedLessons": [
      "arduino-temelleri:3:1",
      "arduino-temelleri:3:4"
    ]
  },
  {
    "slug": "rain",
    "title": "Yağmur sensörü",
    "partType": "rain",
    "category": "Sensör",
    "summary": "Kart üzerine düşen damlaları analog bir gerilimle bildiren sensör. Islandıkça çıkış değeri düşer.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. 5V'a bağlanır."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      },
      {
        "name": "AO",
        "description": "Analog çıkış. Uno'nun bir analog girişine (derslerde A0) gider; ıslandıkça gerilim düşer."
      },
      {
        "name": "DO",
        "description": "Dijital çıkış. Islaklık eşiği geçince LOW olur; derslerde kullanılmaz."
      }
    ],
    "howItWorksMd": "Yağmur sensörünün kartında iki bakır iz vardır. Düşen damlalar bu izleri köprüler ve çıkış gerilimi **düşer**. Kuru kartta çıkış yüksektir. `analogRead` gerilimi 0-1023 arası sayıya çevirir; programda bir eşikle \"yağmur var\" ya da \"yok\" kararı verilir.\n\nEşik civarında okuma dalgalanabilir ve durum hızla değişebilir; bunun çaresi iki eşik (histerezis) kullanmaktır. Sensörün yönü ve sayıları modüle göre değişir; eşikler kullanılan sensörle ölçülerek belirlenmelidir.\n\n**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,95 − 0,85 × ıslaklık). Bu yüzden kuruda yaklaşık 4,75 V (ham ≈ 972), tam ıslakta yaklaşık 0,5 V (ham ≈ 102) çıkar.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Yağmur **VCC** | Uno **5V** |\n| Yağmur **GND** | Uno **GND** |\n| Yağmur **AO** | Uno **A0** |\n\nÖzellik panelindeki **Islaklık (yağmur)** (0 ile 1) kaydırıcısı kartın üstüne ne kadar yağmur düştüğünü belirler ve çalışırken değiştirilebilir. Modülün çalışması için en az 3 V besleme gerekir.",
    "typicalValues": [
      {
        "label": "Islaklık 0 (kuru)",
        "value": "ham ≈ 972",
        "note": "Yaklaşık 4,75 V"
      },
      {
        "label": "Islaklık 0,5",
        "value": "ham ≈ 537",
        "note": "Eşik 600 ise \"yağmur var\""
      },
      {
        "label": "Islaklık 1 (sağanak)",
        "value": "ham ≈ 102",
        "note": "Yaklaşık 0,5 V"
      },
      {
        "label": "Dersteki eşik",
        "value": "600",
        "note": "Altı \"yağmur var\"; bu eşik laboratuvar modeli için ölçüldü"
      }
    ],
    "commonMistakesMd": "- **Yönü ters varsaymak.** Bu modülde yağmurda değer artmaz, düşer.\n- **Tek eşik kullanmak.** Eşik civarında \"VAR\" ve \"YOK\" hızla gidip gelir.\n- **Eşiği başka bir sensörden almak.** Eşikleri kullandığın sensörle ölçerek belirle.\n- **Tek ölçüme güvenmek.** Anlık bir damla yanlış alarm verebilir.",
    "relatedLessons": [
      "sensorler-ve-projeler:3:3",
      "sensorler-ve-projeler:3:5"
    ]
  },
  {
    "slug": "reed",
    "title": "Reed anahtarı",
    "partType": "reed",
    "category": "Girdi",
    "summary": "Mıknatıs yaklaşınca iki ucunu birleştiren anahtar; elektrik bakımından mıknatısla çalışan bir buton.",
    "pins": [
      {
        "name": "A",
        "description": "Birinci uç. Mıknatıs yakınken B ile birleşir."
      },
      {
        "name": "B",
        "description": "İkinci uç."
      }
    ],
    "howItWorksMd": "Reed anahtarı, cam bir tüpün içindeki iki ince metal dilden oluşur. Yanına bir mıknatıs gelince diller birbirine değer ve kontak **kapanır**; mıknatıs uzaklaşınca kontak açılır. Kapı ve pencere alarmlarında bir parça çerçeveye, mıknatıs kapıya yapıştırılır.\n\nArduino'da butonla aynı yöntemle okunur: bir ucu pine, öbür ucu GND'ye bağlanır ve pin `INPUT_PULLUP` yapılır.\n- Mıknatıs uzakta (kontak açık): pin 5 V'a çekilir, `digitalRead` **HIGH** okur.\n- Mıknatıs yakın (kontak kapalı): pin GND'ye bağlanır, `digitalRead` **LOW** okur.\n\nSade reed, mıknatısın hangi kutbunun yaklaştığına bakmaz. Limit anahtarı da elektrik bakımından bir butondur (laboratuvarda yerine buton parçası kullanılır).\n\n**İleri düzey:** Gerçek kontaklar kapanırken kısa süre titrer (bounce); değişimi ancak belirli bir süre kararlı kalırsa kabul etmek yalancı olayları önler. Güvenlik uygulamalarında kontağı normalde kapalı (NC) kullanmak, kopan kablonun da ihlal olarak görülmesini sağlar.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Reed **A** | Uno **D4** |\n| Reed **B** | Uno **GND** |\n\nKodda `pinMode(4, INPUT_PULLUP);` yazarsın. Özellik panelindeki **Mıknatıs yakın** kutusu mıknatısı getirir ve götürür; çalışırken de değiştirilebilir. Laboratuvardaki reed çıplak bir reed gibidir: kendi direnci yoktur, bu yüzden `INPUT_PULLUP` şarttır.",
    "typicalValues": [
      {
        "label": "Önerilen bağlantı",
        "value": "D4'e A, GND'ye B",
        "note": "Bu sitedeki Modül 4 standardı"
      },
      {
        "label": "Kod ayarı",
        "value": "INPUT_PULLUP",
        "note": "Dış direnç gerekmez"
      },
      {
        "label": "Mıknatıs yakın",
        "value": "LOW",
        "note": "Kontak kapalı, ≈ 0,1 Ω"
      },
      {
        "label": "Mıknatıs uzak",
        "value": "HIGH",
        "note": "Kontak açık, iç pull-up ≈ 35 kΩ ile 5 V'a çekilir"
      }
    ],
    "commonMistakesMd": "- **`INPUT_PULLUP` yazmamak.** Kontak açıkken pin yüzer ve okuma rastgele olur.\n- **\"Mıknatıs yakın = HIGH\" sanmak.** Pull-up ile kontak kapanınca pin LOW olur.\n- **B ucunu GND'ye bağlamayı unutmak.** Kontak kapansa bile pin LOW olmaz.\n- **Debounce koymamak.** Gerçek devrede kapı sallanınca yalancı olaylar çıkar.\n- **NO ile NC'yi karıştırmak.** Devre tersine çalışır.",
    "relatedLessons": [
      "sensorler-ve-projeler:2:3",
      "sensorler-ve-projeler:2:5"
    ]
  },
  {
    "slug": "relay",
    "title": "Röle modülü",
    "partType": "relay",
    "category": "Güç",
    "summary": "Elektromıknatısla çalışan anahtar. Arduino'dan elektriksel olarak ayrı bir devreyi açıp kapatır.",
    "pins": [
      {
        "name": "VCC",
        "description": "Modül gücü. 5V'a bağlanır."
      },
      {
        "name": "GND",
        "description": "Toprak. GND'ye bağlanır."
      },
      {
        "name": "IN",
        "description": "Sinyal girişi. Bir Uno pinine bağlanır."
      },
      {
        "name": "COM",
        "description": "Kontak tarafının ortak ucu."
      },
      {
        "name": "NO",
        "description": "Normalde açık uç. Röle çekilince COM'a bağlanır."
      },
      {
        "name": "NC",
        "description": "Normalde kapalı uç. Röle çekilmeyince COM'a bağlıdır."
      }
    ],
    "howItWorksMd": "Röle bobine akım verildiğinde bir elektromıknatıs kontağı çeker. Kontak tarafı bobin tarafından ayrıdır ve yalnız bir anahtar gibi davranır (kuru kontak). Modülde bobini süren transistör ve flyback diyot hazırdır.\n\nÇoğu modül **aktif-LOW** çalışır: IN pinine LOW verilince röle çeker, HIGH verilince bırakır. Laboratuvarda bu, **Tetik** özelliğiyle seçilir.\n\nRöle mekanik bir parçadır; hızlı PWM için kullanılmaz. Eşik civarında titremeyi önlemek için iki eşikli (histerezis) kontrol kullanılır.\n\n**İleri düzey:** Kontak değeri (\"250 V\" gibi) bir güvenli kullanım belgesi değildir. Şebeke gerilimiyle (220 V) çalışmak ölümcüldür ve yalnız eğitimli bir uzmana aittir.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Röle **VCC** | Uno **5V** |\n| Röle **GND** | Uno **GND** |\n| Röle **IN** | Uno **D7** |\n| Röle **COM** | Uno **5V** |\n| Röle **NO** | Direnç **1** (yük) |\n\nÖzellik panelinden Tetik'i \"LOW ile çeker\" seç. VCC'de 4 V'tan az gerilim ya da eksik GND varsa röle çekmez ve uyarı çıkar. Laboratuvar yalnız 5 V'luk düşük gerilimli devreleri sunar.",
    "typicalValues": [
      {
        "label": "Tetik",
        "value": "LOW ile çeker",
        "note": "Derslerin varsayımı"
      },
      {
        "label": "Besleme",
        "value": "5 V",
        "note": "4 V altında çekmez"
      },
      {
        "label": "Kontak direnci",
        "value": "0,1 Ω",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Örnek yük",
        "value": "≈ 9 mA",
        "note": "330 Ω ve kırmızı LED"
      },
      {
        "label": "Güvenli sınır",
        "value": "Yalnız 5 V",
        "note": "Şebeke gerilimi uzman işidir"
      }
    ],
    "commonMistakesMd": "- **Şebeke gerilimiyle denemek.** Ölümcüldür; bu portalda hiç gerekmez.\n- **Aktif-LOW mantığını ters sanmak.** Röle açılışta çekili kalabilir; `pinMode`'dan önce HIGH yaz.\n- **Çıplak röleyi pine bağlamak.** Bobin akımı fazladır ve sıçrama pine zarar verir.\n- **COM, NO, NC'yi karıştırmak.** Yük ters çalışır.\n- **VCC ya da GND'yi bağlamamak.** Röle çekmez.",
    "relatedLessons": [
      "arduino-temelleri:5:4",
      "arduino-temelleri:5:2"
    ]
  },
  {
    "slug": "rgbled",
    "title": "RGB LED",
    "partType": "rgbled",
    "category": "Çıkış",
    "summary": "Kırmızı, yeşil ve mavi üç LED'i tek kılıfta toplayan parça. Üç kanalın parlaklığını karıştırarak her rengi üretirsin.",
    "pins": [
      {
        "name": "R",
        "description": "Kırmızı kanalın ucu. Direnç üzerinden bir PWM pinine (bu sitede D9) bağlanır."
      },
      {
        "name": "G",
        "description": "Yeşil kanalın ucu. Direnç üzerinden bir PWM pinine (bu sitede D10) bağlanır."
      },
      {
        "name": "B",
        "description": "Mavi kanalın ucu. Direnç üzerinden bir PWM pinine (bu sitede D11) bağlanır."
      },
      {
        "name": "COM",
        "description": "Üç kanalın ortak ucu. Ortak katotta GND'ye, ortak anotta 5V'a bağlanır."
      }
    ],
    "howItWorksMd": "**RGB LED**, aynı kılıfta kırmızı, yeşil ve mavi üç ayrı LED taşır. Üç LED'in bir ucu birleşip tek bir **COM** ucu olur. Katotlar birleşmişse **ortak katot**, anotlar birleşmişse **ortak anot** denir. Laboratuvarda varsayılan ortak katottur.\n\nIşıkta renkler **toplanır**: kırmızı + yeşil sarı, yeşil + mavi camgöbeği, kırmızı + mavi mor, üçü birden beyaz verir. Her kanalı `analogWrite(pin, 0-255)` ile ayrı ayrı ayarlarsan yaklaşık 16,7 milyon renk elde edersin (256 × 256 × 256).\n\nOrtak katotta kanal, pin HIGH iken yanar. Ortak anotta mantık tersinedir: COM 5V'a gider ve kanal pin LOW iken yanar. Bu yüzden `analogWrite(pin, 255 - değer)` yazarsın.\n\n**İleri düzey:** Üç LED farklı yarı iletkenlerden yapıldığı için ileri gerilimleri farklıdır: kırmızı en düşük, mavi en yüksektir. Aynı dirençle mavi kanalın akımı daha küçük olur ve mavi daha sönük görünür. Bu yüzden (255, 255, 255) laboratuvarda biraz renkli beyaz görünebilir. Gerçek devrede renk dengesi için kanallara farklı direnç değerleri seçilebilir.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Uno **D9** | Direnç 1 ucu, direncin 2 ucu RGB **R** |\n| Uno **D10** | Direnç 1 ucu, direncin 2 ucu RGB **G** |\n| Uno **D11** | Direnç 1 ucu, direncin 2 ucu RGB **B** |\n| RGB **COM** | Uno **GND** (ortak katot) |\n\nHer kanalın kendi direnci olmalıdır. Özellik panelindeki **Ortak uç** alanından ortak katot ya da ortak anot seçersin; ortak anotta COM, Uno 5V'a bağlanır. Üç pin de PWM yapabilir, böylece her kanalın parlaklığını ayrı ayarlarsın.",
    "typicalValues": [
      {
        "label": "Kırmızı kanal Vf",
        "value": "1,9 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Yeşil kanal Vf",
        "value": "2,2 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Mavi kanal Vf",
        "value": "3,0 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Seri direnç (5 V)",
        "value": "330 Ω",
        "note": "Her kanal için ayrı; bu sitedeki derslerin standardı"
      },
      {
        "label": "Kanal akımı (330 Ω, pin HIGH)",
        "value": "kırmızı ≈ 8,6 mA, yeşil ≈ 7,8 mA, mavi ≈ 5,6 mA",
        "note": "Laboratuvar modeli; pin ve LED iç direnci dahil"
      },
      {
        "label": "Yanma sınırı",
        "value": "30 mA",
        "note": "Bir kanal bunun üstüne çıkarsa yanar; ↺ ile baştan başla"
      },
      {
        "label": "Renk sayısı",
        "value": "≈ 16,7 milyon",
        "note": "256 × 256 × 256"
      }
    ],
    "commonMistakesMd": "- **COM'u yanlış uca bağlamak.** Ortak katotlu LED'de COM, GND'ye gider. 5V'a bağlarsan kanallar yanmaz.\n- **Ortak anotta değerleri ters yazmamak.** Kırmızı isteyip camgöbeği görürsün; `255 - değer` yaz.\n- **Üç kanal için tek direnç kullanmak.** Kanallar birbirinin parlaklığını etkiler; her kanala kendi direncini ver.\n- **R, G ve B uçlarını karıştırmak.** Renkler beklenenden farklı çıkar; kabloları kontrol et.\n- **PWM'siz bir pine bağlamak.** Parlaklık ayarı çalışmaz, kanal yalnız yanar ya da söner. D9, D10 ve D11 kullan.",
    "relatedLessons": [
      "arduino-temelleri:4:2",
      "arduino-temelleri:4:5"
    ]
  },
  {
    "slug": "rtc",
    "title": "RTC saat modülü",
    "partType": "rtc",
    "category": "Sensör",
    "summary": "Fiş çekilse de gerçek tarihi ve saati tutan, I2C ile okunan saat modülü (DS3231 tipi).",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme. Laboratuvarda Uno 5V'a bağlanır."
      },
      {
        "name": "GND",
        "description": "Toprak."
      },
      {
        "name": "SDA",
        "description": "I2C veri hattı. Uno'da A4."
      },
      {
        "name": "SCL",
        "description": "I2C saat hattı. Uno'da A5."
      }
    ],
    "howItWorksMd": "**RTC** (Real Time Clock, gerçek zaman saati), kendi kristaliyle saniyeleri sayan ve takvimi bilen ayrı bir çiptir. Arduino ona yalnızca I2C ile sorar; sayma işi çipin kendisindedir. `millis()` kart açılınca sıfırdan başlar ve güç kesilince unutulur; RTC ise gerçek tarihi ve saati korur.\n\nGerçek modüllerde bir **yedek pil yuvası** vardır: ana güç kesilince saati bu pil çalıştırır. Pil yoksa ya da bittiyse saat unutulur ve yeniden kurulması gerekir. Kütüphane (RTClib) `rtc.now()` ile zamanı bir `DateTime` olarak verir, `rtc.adjust()` ile saati kurar, `rtc.lostPower()` ile saatin durup durmadığını söyler.\n\nRTC yaz saatini ya da saat dilimini bilmez; yalnızca senin kurduğun sayıları sayar.\n\n**İleri düzey:** DS3231 çipinin saat kristali çipin içindedir ve sıcaklığa göre kendini düzeltir; DS1307'de kristal dışarıdan takılır ve sıcaklıktan daha çok etkilenir. DS1307'de donanım alarmı yoktur. İkisi de I2C'de 0x68 adresini kullanır.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| RTC **SDA** | Uno **A4** |\n| RTC **SCL** | Uno **A5** |\n| RTC **VCC** | Uno **5V** |\n| RTC **GND** | Uno **GND** |\n\nKodda `#include <RTClib.h>` ve `RTC_DS3231 rtc;` yazarsın; `rtc.begin()` modül hatta yoksa `false` döner. Laboratuvar yedek pili ve güç kesintisini modellemez: her ▶'e basışta (ya da ↺ Sıfırla'dan sonra) RTC 2026-01-01 00:00:00'dan başlar ve `lostPower()` her zaman `false` döner. Saati `rtc.adjust()` ile kurarsın.",
    "typicalValues": [
      {
        "label": "I2C adresi",
        "value": "0x68",
        "note": "MPU6050 de varsayılan olarak 0x68 kullanır; aynı hatta ikisini bağlama"
      },
      {
        "label": "Laboratuvar başlangıç zamanı",
        "value": "2026-01-01 00:00:00",
        "note": "Her çalıştırmada bu değerden başlar"
      },
      {
        "label": "Bağlantı",
        "value": "SDA A4, SCL A5",
        "note": "Modül 4'ün standart I2C pinleri"
      },
      {
        "label": "Kütüphane sınıfı",
        "value": "RTC_DS3231",
        "note": "DS1307 için RTC_DS1307"
      }
    ],
    "commonMistakesMd": "- **`adjust(__DATE__, __TIME__)` satırını koşulsuz `setup()` içine koymak.** Kart her açıldığında saat derleme anına geri döner; yalnız `lostPower()` doğruysa ayarla.\n- **MPU6050 ile RTC'yi aynı hatta bağlamak.** İkisi de 0x68 kullanır ve çakışır.\n- **Saati `millis()` ile tutmaya çalışmak.** Güç kesilince `millis()` sıfırlanır, RTC kalır.\n- **SDA ile SCL'yi ters bağlamak ya da VCC/GND'yi eksik bırakmak.** `rtc.begin()` false döner ve program \"RTC bulunamadi\" yazar.\n- **Ay, gün, saat değerlerini iki haneli sanmak.** `month()` 3. ay için 3 döner; başına sıfırı kendin eklersin.",
    "relatedLessons": [
      "sensorler-ve-projeler:7:1",
      "sensorler-ve-projeler:7:3",
      "sensorler-ve-projeler:7:5"
    ]
  },
  {
    "slug": "servo",
    "title": "Servo motor",
    "partType": "servo",
    "category": "Çıkış",
    "summary": "Kontrol sinyaline göre milini 0-180 derece arasında bir açıya getiren ve orada tutan küçük motor.",
    "pins": [
      {
        "name": "SIG",
        "description": "Kontrol sinyali. Uno'nun bir dijital pinine (örneğin D6) gider; darbe genişliği açıyı belirler."
      },
      {
        "name": "VCC",
        "description": "Besleme. 5V'a bağlanır (laboratuvarda en az yaklaşık 4 V gerekir)."
      },
      {
        "name": "GND",
        "description": "Toprak."
      }
    ],
    "howItWorksMd": "**Servo**, bir motor, dişli ve konum geri bildirimi içeren kutudur. Her 20 ms'de gelen bir darbenin genişliği açıyı belirler. Arduino'nun `Servo` kütüphanesinde `write(0)` yaklaşık 544 µs, `write(180)` yaklaşık 2400 µs'lik darbe üretir; aradaki açılar doğrusaldır. `write(90)` yaklaşık 1472 µs verir.\n\nServo komutla verilen açıya kendi ulaşır ve orada kalır; bu yüzden açı için döngü yazmak gerekmez. Mekanik uçlara (0 ve 180) dayanmak servoyu zorlar; projelerde açı 10...170 gibi güvenli bir aralığa `constrain` ile sınırlanır.\n\n**İleri düzey:** Gerçek servo yük bindirince akım çeker ve 5 V düşebilir; bu yüzden gerçek kurulumda servo ayrı bir 5 V kaynaktan beslenir ve GND'ler ortak yapılır. Laboratuvar bu gerilim düşmesini modellemez.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Servo **SIG** | Uno **D6** (ya da başka bir dijital pin) |\n| Servo **VCC** | Uno **5V** |\n| Servo **GND** | Uno **GND** |\n\nProgramda `#include <Servo.h>`, `servo.attach(6)` ve `servo.write(açı)` kullanılır. Laboratuvar, servonun mil açısını gelen darbe genişliğinden hesaplayıp gösterir.",
    "typicalValues": [
      {
        "label": "Darbe genişliği aralığı",
        "value": "544...2400 µs",
        "note": "Servo kütüphanesi varsayılanı"
      },
      {
        "label": "0°",
        "value": "≈ 544 µs",
        "note": "Alt uç"
      },
      {
        "label": "90°",
        "value": "≈ 1472 µs",
        "note": "Orta"
      },
      {
        "label": "70°",
        "value": "≈ 1266 µs",
        "note": "544 + 70/180 x 1856"
      },
      {
        "label": "Güvenli açı aralığı",
        "value": "10...170°",
        "note": "Projelerde önerilen sınır"
      },
      {
        "label": "En az besleme",
        "value": "≈ 4 V",
        "note": "Laboratuvar modeli"
      }
    ],
    "commonMistakesMd": "- **Servoyu 5V yerine 3V3'e bağlamak.** Laboratuvarda servo çalışmaz (en az yaklaşık 4 V).\n- **Açıyı mekanik uçlara kadar sürmek.** Servo zorlanır, ısınır ve ses yapar.\n- **write() içine derece yerine mikrosaniye ya da radyan yazmak.** Servo beklenmedik bir açıya gider.\n- **Gerçekte servoyu kartın 5 V pininden beslemek.** Yük bindirince kart sıfırlanabilir.\n- **GND'yi ortak yapmamak.** Servo sinyali anlaşılmaz.",
    "relatedLessons": [
      "arduino-temelleri:5:1",
      "sensorler-ve-projeler:5:5"
    ]
  },
  {
    "slug": "sevenseg",
    "title": "7-segment ekran",
    "partType": "sevenseg",
    "category": "Çıkış",
    "summary": "Yedi çubuk ve bir noktadan oluşan, tek haneli rakam gösteren ekran. Her çubuk ayrı bir LED'dir.",
    "pins": [
      {
        "name": "a",
        "description": "A çubuğu (üst yatay çubuk)."
      },
      {
        "name": "b",
        "description": "B çubuğu (sağ üst dikey çubuk)."
      },
      {
        "name": "c",
        "description": "C çubuğu (sağ alt dikey çubuk)."
      },
      {
        "name": "d",
        "description": "D çubuğu (alt yatay çubuk)."
      },
      {
        "name": "e",
        "description": "E çubuğu (sol alt dikey çubuk)."
      },
      {
        "name": "f",
        "description": "F çubuğu (sol üst dikey çubuk)."
      },
      {
        "name": "g",
        "description": "G çubuğu (orta yatay çubuk)."
      },
      {
        "name": "dp",
        "description": "Nokta LED'i (ondalık nokta)."
      },
      {
        "name": "COM",
        "description": "Ortak uç. Ortak katotlu ekranda GND'ye, ortak anotlu ekranda 5V'a bağlanır."
      }
    ],
    "howItWorksMd": "**7-segment ekran**, yedi küçük LED çubuğu (a-g) ve bir nokta LED'inden (dp) oluşur. Hangi çubukların yandığına göre rakam görünür. Her çubuk ayrı bir LED olduğundan **kendi seri direnci** olmalıdır.\n\nEkran iki türdedir. **Ortak katotta** tüm LED'lerin eksi uçları COM'da birleşir; COM GND'ye bağlanır ve bir çubuk HIGH verilince yanar. **Ortak anotta** artı uçları birleşir; COM 5V'a bağlanır ve çubuk LOW verilince yanar. Bu yüzden ortak anotta desen ters çevrilir.\n\nSekiz LED'i sekiz pinle sürmek pahalıdır; derslerde 74HC595 ile üç pine indirilir. Bir rakam bir bayttır: bit 0 = a, bit 1 = b, ... bit 6 = g, bit 7 = dp.\n\n**İleri düzey:** Birden çok haneli ekranlarda haneler hızla sırayla yakılır (çoğullama) ve göz hepsini birden yanıyor sanar. Laboratuvardaki parça tek hanelidir ve her çubuğu LED gibi modeller.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| 74HC595 **QA** ... **QG** | Her biri bir 330 Ω dirençten geçip ekranın **a** ... **g** ucuna |\n| 74HC595 **QH** (isteğe bağlı) | Bir dirençten geçip ekranın **dp** ucuna |\n| Ekran **COM** | **GND** (ortak katot) |\n\nParçayı seçince özellik panelinde **Ortak uç** seçeneği çıkar: \"Ortak katot\" (varsayılan) ya da \"Ortak anot\". Çalışırken bir direnci seçip **Sanal ölçüm** ile çubuk akımını görebilirsin.",
    "typicalValues": [
      {
        "label": "Çubuk ileri gerilimi (Vf)",
        "value": "1,9 V",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Seri direnç (74HC595 ile)",
        "value": "330 Ω",
        "note": "Çubuk başına yaklaşık 8 mA"
      },
      {
        "label": "74HC595 çıkış direnci",
        "value": "50 Ω",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Varsayılan ortak uç",
        "value": "Ortak katot",
        "note": "COM GND'ye bağlanır"
      },
      {
        "label": "Rakam 1 deseni",
        "value": "0x06",
        "note": "Yalnız b ve c yanar (bit 1 ve bit 2)"
      }
    ],
    "commonMistakesMd": "- **Çubuk başına direnç koymamak.** Çubuk fazla akım çeker; laboratuvar uyarı verir. Yedi çubuğa yedi direnç gerekir.\n- **Ortak anot ile ortak katodu karıştırmak.** Rakamlar ters görünür; ortak anotta COM 5V'a bağlanır ve desen `~RAKAM[i]` ile ters çevrilir.\n- **Çubuk adlarını karıştırmak.** a-g sırası bit sırasıyla uyuşmalıdır; yoksa rakamlar bozuk görünür.\n- **Tek direnci COM'a koymak.** Yanan çubuk sayısına göre parlaklık değişir (1'de iki çubuk, 8'de yedi çubuk yanar).",
    "relatedLessons": [
      "arduino-temelleri:7:1",
      "arduino-temelleri:7:2"
    ]
  },
  {
    "slug": "soil",
    "title": "Toprak nemi sensörü",
    "partType": "soil",
    "category": "Sensör",
    "summary": "Toprağın ne kadar ıslak olduğunu analog bir gerilimle veren modül. Islandıkça çıkış değeri düşer.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. 5V'a bağlanır."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      },
      {
        "name": "AO",
        "description": "Analog çıkış. Uno'nun bir analog girişine (derslerde A2) gider; ıslandıkça gerilim düşer."
      },
      {
        "name": "DO",
        "description": "Dijital çıkış. Nem eşiği geçince LOW olur; derslerde kullanılmaz."
      }
    ],
    "howItWorksMd": "Toprak nemi modülü toprağın nemini bir gerilime çevirir. Laboratuvardaki modülde **kuruda çıkış yüksektir, ıslandıkça düşer**. `analogRead` bu gerilimi 0-1023 arası sayıya çevirir. Sayıyı yüzdeye çevirmek için kuru ve ıslak uç değerleri ölçülür ve `map` ile `constrain` kullanılır.\n\nGerçekte iki tür vardır. **Dirençli** sensörün toprağa gömülen açık metal uçları zamanla paslanır. **Kapasitif** sensörün uçları yalıtkanla kaplıdır ve genelde daha uzun ömürlüdür. Çıkış yönü ve sayılar üreticiden üreticiye değişir; her sensörü kendi kuru ve ıslak ölçümüyle kalibre etmek gerekir.\n\n**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,9 − 0,6 × nem). Bu yüzden 5 V ile nem 0 iken yaklaşık 4,5 V (ham ≈ 921), nem 1 iken yaklaşık 1,5 V (ham ≈ 307) çıkar.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Toprak nemi **VCC** | Uno **5V** |\n| Toprak nemi **GND** | Uno **GND** |\n| Toprak nemi **AO** | Uno **A2** |\n\nÖzellik panelindeki **Toprak nemi** (0 ile 1) kaydırıcısı toprağın ne kadar ıslak olduğunu belirler ve program çalışırken değiştirilebilir. **Eşik (DO)** yalnız dijital çıkış için kullanılır. Modülün çalışması için en az 3 V besleme gerekir.",
    "typicalValues": [
      {
        "label": "Nem 0 (kuru)",
        "value": "ham ≈ 921",
        "note": "Yaklaşık 4,5 V"
      },
      {
        "label": "Nem 0,5",
        "value": "ham ≈ 614",
        "note": "Orta nokta"
      },
      {
        "label": "Nem 1 (ıslak)",
        "value": "ham ≈ 307",
        "note": "Yaklaşık 1,5 V"
      },
      {
        "label": "Kalibrasyon örneği",
        "value": "KURU = 800, ISLAK = 350",
        "note": "Ham 575 değeri yaklaşık %50 eder"
      },
      {
        "label": "Okuma gürültüsü",
        "value": "8 ölçümün ortalaması",
        "note": "Tek ölçüm yanıltabilir"
      }
    ],
    "commonMistakesMd": "- **Yönü bilmemek.** \"Büyük sayı ıslak demektir\" diye varsaymak; bu modülde ıslandıkça değer düşer.\n- **`constrain` unutmak.** Kalibrasyon dışındaki okumalar %-26 ya da %130 gibi değerler verir.\n- **Başka sensörün uçlarını kullanmak.** Yüzde hesabı yanlış çıkar.\n- **Dirençli sensörü sürekli toprakta ve açık bırakmak.** Uçlar paslanır, okuma zamanla kayar.\n- **Tek ölçüme bakmak.** Gürültü yüzünden ortalama almak gerekir.",
    "relatedLessons": [
      "sensorler-ve-projeler:3:3",
      "sensorler-ve-projeler:3:5"
    ]
  },
  {
    "slug": "sound",
    "title": "Ses sensörü",
    "partType": "sound",
    "category": "Sensör",
    "summary": "Mikrofonlu ses modülü. Sessizken analog çıkış bir baz seviyede durur, ses geldikçe bu seviyeden uzaklaşır.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. 5V'a bağlanır; en az 3 V gerekir."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      },
      {
        "name": "AO",
        "description": "Analog çıkış. Uno'nun bir analog girişine (derslerde A0) gider; ses şiddeti arttıkça gerilim yükselir."
      },
      {
        "name": "DO",
        "description": "Dijital çıkış. Ses şiddeti eşiği geçince LOW olur; derslerde kullanılmaz."
      }
    ],
    "howItWorksMd": "Ses modülünde bir mikrofon ve bir yükselteç vardır. Ortam sessizken analog çıkış sabit bir **baz seviyede** durur. Gerçek mikrofonda ses gelince çıkış bu seviyenin hem üstüne hem altına salınır; bu yüzden sapma `abs(analogRead - baz)` ile hesaplanır. Baz seviye modülden modüle farklıdır, bu yüzden varsayılmaz, açılışta ölçülür.\n\nBir alkışı tanımak için tek başına yükseklik yetmez: olayın **süresine** da bakılır. Çok kısa ses parazit, çok uzun ses (müzik, bağırış) alkış değildir.\n\n**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,25 + 0,7 × Ses şiddeti) olur ve yalnız yukarı çıkar; gerçek mikrofonun iki yönlü salınımını modellemez. Sessizken (şiddet 0) AO = 1,25 V, yani `analogRead` ≈ 256 (512 değil).",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Ses sensörü **VCC** | Uno **5V** |\n| Ses sensörü **GND** | Uno **GND** |\n| Ses sensörü **AO** | Uno **A0** |\n\nÖzellik panelindeki **Ses şiddeti** (0 ile 1) sesi taklit eder ve program çalışırken değiştirilebilir. Bir alkışı taklit etmek için şiddeti 0,8 yapıp hemen 0'a döndür. **Eşik (DO)** yalnız dijital çıkışı etkiler.",
    "typicalValues": [
      {
        "label": "Ses şiddeti 0 (sessiz)",
        "value": "ham ≈ 256",
        "note": "Yaklaşık 1,25 V; baz seviye"
      },
      {
        "label": "Ses şiddeti 0,1",
        "value": "ham ≈ 327",
        "note": "Baza göre sapma ≈ 71"
      },
      {
        "label": "Ses şiddeti 0,5",
        "value": "ham ≈ 614",
        "note": "Baza göre sapma ≈ 358"
      },
      {
        "label": "Ses şiddeti 0,8",
        "value": "ham ≈ 829",
        "note": "Baza göre sapma ≈ 573"
      },
      {
        "label": "Derslerdeki tepe eşiği",
        "value": "150",
        "note": "Bundan küçük sapmalar olay sayılmaz"
      },
      {
        "label": "Derslerdeki süre sınırları",
        "value": "10 ms ve 500 ms",
        "note": "Kısa parazit / alkış / uzun ses"
      }
    ],
    "commonMistakesMd": "- **Baz seviyeyi 512 sanmak.** Modülün baz seviyesi farklıdır; her zaman ölç.\n- **Baz seviyeyi ses varken ölçmek.** Bütün sapmalar yanlış hesaplanır.\n- **Olayı tek örnekle bitirmek.** Salınan sinyal baz seviyeden geçince tek alkış iki olay gibi görünür; sessizlik payı kullan.\n- **Sadece yüksekliğe bakmak.** Kapı çarpması da alkışa benzer; süreyi de kontrol et.\n- **`abs()` unutmak.** Gerçek mikrofon baz seviyenin altına da salınır.",
    "relatedLessons": [
      "sensorler-ve-projeler:4:2",
      "sensorler-ve-projeler:4:5"
    ]
  },
  {
    "slug": "sr595",
    "title": "74HC595 kaydırmalı yazmaç",
    "partType": "sr595",
    "category": "Çıkış",
    "summary": "Üç Uno pinini sekiz çıkışa çeviren çip. Bitleri seri alır, sekiz pini birden sürer ve zincirlenebilir.",
    "pins": [
      {
        "name": "QA",
        "description": "1. çıkış (bit 0)."
      },
      {
        "name": "QB",
        "description": "2. çıkış (bit 1)."
      },
      {
        "name": "QC",
        "description": "3. çıkış (bit 2)."
      },
      {
        "name": "QD",
        "description": "4. çıkış (bit 3)."
      },
      {
        "name": "QE",
        "description": "5. çıkış (bit 4)."
      },
      {
        "name": "QF",
        "description": "6. çıkış (bit 5)."
      },
      {
        "name": "QG",
        "description": "7. çıkış (bit 6)."
      },
      {
        "name": "QH",
        "description": "8. çıkış (bit 7)."
      },
      {
        "name": "SER",
        "description": "Seri veri girişi; bitler bu telden gelir."
      },
      {
        "name": "SRCLK",
        "description": "Kaydırma saati; her yükselen kenarda bir bit içeri kayar."
      },
      {
        "name": "RCLK",
        "description": "Mandal saati; yükselen kenarda içerideki bayt çıkışlara aktarılır."
      },
      {
        "name": "OE",
        "description": "Çıkış etkin (aktif-LOW). GND'ye bağlıysa çıkışlar açıktır; 5V'a bağlıysa kapalıdır."
      },
      {
        "name": "SRCLR",
        "description": "Yazmaç temizle (aktif-LOW). 5V'a bağlıysa normal çalışır; GND'deyse yazmaç temizlenir."
      },
      {
        "name": "QH_",
        "description": "Seri çıkış (QH'). Bir sonraki çipin SER ucuna bağlanarak zincir kurulur."
      },
      {
        "name": "VCC",
        "description": "Besleme, 5V."
      },
      {
        "name": "GND",
        "description": "Toprak."
      }
    ],
    "howItWorksMd": "**74HC595**, seri gelen bitleri sekiz çıkışa çeviren kaydırmalı yazmaçtır. Uno bitleri SER telinden gönderir, SRCLK'ye her darbe verişinde bir bit içeri kayar. Sekiz bit girince RCLK (mandal) yükselir ve baytı çıkışlara topluca aktarır. Çıkışlar mandaldan önce değişmez.\n\n`shiftOut(veri, saat, MSBFIRST, bayt)` bu işi yapar. MSBFIRST ile en değerli bit önce gider; son giden bit 0, QA'ya yerleşir. Mandal bir pinle sürülür: `digitalWrite(mandal, LOW)`, `shiftOut`, `digitalWrite(mandal, HIGH)`. Üç pin (SER, SRCLK, RCLK) yeter.\n\nİkinci bir çip varsa, birincinin QH_ ucu ikincinin SER ucuna bağlanır; saat ve mandal ikisine ortaktır. Böylece üç pinle 16 çıkış elde edilir.\n\n**İleri düzey:** Her çıkış kendi başına sınırlı akım verir (gerçek çipte pin başına yaklaşık 35 mA'e kadar izin verilir); LED'lerin her biri kendi direncini ister.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| **VCC** ve **SRCLR** | **5V** |\n| **GND** ve **OE** | **GND** |\n| **SER** | Uno **D4** |\n| **SRCLK** | Uno **D6** |\n| **RCLK** | Uno **D5** |\n| **QA** ... **QG** | Direnç üzerinden ekranın a ... g uçlarına (ya da LED'lere) |\n\nOE ve SRCLR'yi boş bırakırsan laboratuvar \"bağlı olmayan giriş\" uyarısı verir: OE açık bırakılırsa çıkışlar kapalı, SRCLR açık bırakılırsa yazmaç sürekli temizlenmiş sayılır. VCC ve GND bağlı değilse \"beslenmemiş\" uyarısı çıkar; çıkış olmaz.",
    "typicalValues": [
      {
        "label": "Çıkış sayısı",
        "value": "8",
        "note": "QA-QH"
      },
      {
        "label": "Gereken Uno pini",
        "value": "3",
        "note": "SER, SRCLK, RCLK"
      },
      {
        "label": "Çıkış direnci",
        "value": "50 Ω",
        "note": "Laboratuvar modeli"
      },
      {
        "label": "Beslenmiş sayılma",
        "value": "4 V ve üstü",
        "note": "VCC-GND farkı"
      },
      {
        "label": "İki çip zinciri",
        "value": "16 çıkış",
        "note": "Yine 3 Uno pini"
      }
    ],
    "commonMistakesMd": "- **Mandalı kullanmamak.** Bitler içeri kayar ama çıkışlar değişmez; ekran boş kalır.\n- **OE ya da SRCLR'yi yanlış bağlamak.** OE'yi 5V'a ya da SRCLR'yi GND'ye bağlarsan çip çıkış vermez ya da yazmacı temizler.\n- **Besleme kablolarını unutmak.** VCC ve GND bağlı değilse çip çalışmaz.\n- **Bit sırasını karıştırmak.** MSBFIRST yerine LSBFIRST yazılırsa desen ters yönde görünür.\n- **Her çıkışa direnç koymamak.** LED ya da çubuk fazla akım çeker.",
    "relatedLessons": [
      "arduino-temelleri:7:1",
      "arduino-temelleri:7:2"
    ]
  },
  {
    "slug": "waterlevel",
    "title": "Su seviyesi sensörü",
    "partType": "waterlevel",
    "category": "Sensör",
    "summary": "Çıplak izli bir çubuğun ne kadarının suda olduğunu analog gerilimle veren sensör. Su yükseldikçe çıkış değeri artar.",
    "pins": [
      {
        "name": "VCC",
        "description": "Besleme ucu. 5V'a bağlanır."
      },
      {
        "name": "GND",
        "description": "Toprak ucu. GND'ye bağlanır."
      },
      {
        "name": "AO",
        "description": "Analog çıkış. Uno'nun bir analog girişine (derslerde A1) gider; su yükseldikçe gerilim artar."
      },
      {
        "name": "DO",
        "description": "Dijital çıkış. Seviye eşiği geçince LOW olur; derslerde kullanılmaz."
      }
    ],
    "howItWorksMd": "Su seviyesi sensörünün çubuğunda çıplak iletken izler vardır. Su yükseldikçe daha çok iz suya girer ve çıkış gerilimi **artar**. Bu, toprak nemi ve yağmur sensörlerinin tersidir. `analogRead` gerilimi sayıya çevirir; programda eşiklerle \"boş\", \"orta\" ya da \"dolu\" gibi durumlar ayrılır.\n\nÇubuk 5 V ile bile tam ölçeğe (1023) ulaşmaz; en yüksek değeri yaklaşık 819'dur. Bu yüzden eşikler 1023'e göre değil sensörün gerçek aralığına göre seçilmelidir. Suyla temas eden çıplak izler zamanla aşınabilir; gerçek sensör için veri sayfasına bakılmalıdır.\n\n**İleri düzey:** Laboratuvar modelinde AO = VCC × (0,05 + 0,75 × seviye). Seviye 0 iken yaklaşık 0,25 V (ham ≈ 51), seviye 1 iken yaklaşık 4 V (ham ≈ 819) çıkar.",
    "wiringMd": "| Nereden | Nereye |\n|---|---|\n| Su seviyesi **VCC** | Uno **5V** |\n| Su seviyesi **GND** | Uno **GND** |\n| Su seviyesi **AO** | Uno **A1** |\n\nÖzellik panelindeki **Su seviyesi** (0 ile 1) kaydırıcısı çubuğun ne kadarının suda olduğunu belirler ve çalışırken değiştirilebilir. Modülün çalışması için en az 3 V besleme gerekir.",
    "typicalValues": [
      {
        "label": "Seviye 0 (boş)",
        "value": "ham ≈ 51",
        "note": "Yaklaşık 0,25 V"
      },
      {
        "label": "Seviye 0,4",
        "value": "ham ≈ 358",
        "note": "Dersteki eşiklere göre \"orta\""
      },
      {
        "label": "Seviye 1 (tam dolu)",
        "value": "ham ≈ 819",
        "note": "Yaklaşık 4 V; 1023'e ulaşmaz"
      },
      {
        "label": "Dersteki eşikler",
        "value": "300 ve 600",
        "note": "Altı boş, arası orta, üstü dolu"
      }
    ],
    "commonMistakesMd": "- **Yönü ters varsaymak.** Bu sensörde su yükseldikçe değer artar.\n- **Eşikleri 1023'e göre seçmek.** Çubuğun en üst değeri yaklaşık 819'dur.\n- **Tek eşik kullanmak.** Su yüzeyi dalgalanınca durum hızla değişir.\n- **Sensörü sürekli suda bırakmak.** Çıplak izler zamanla aşınır.",
    "relatedLessons": [
      "sensorler-ve-projeler:3:3",
      "sensorler-ve-projeler:3:5"
    ]
  }
]
