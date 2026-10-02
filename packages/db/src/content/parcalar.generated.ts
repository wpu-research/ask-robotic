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
  }
]
