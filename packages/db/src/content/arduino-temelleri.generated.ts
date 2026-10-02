// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/modul-3/ · Komut: node tools/content/build.mjs modul-3
import type { ModuleContent } from './types'

export const modul3: ModuleContent = {
  "slug": "arduino-temelleri",
  "title": "Arduino Temelleri",
  "track": "maker",
  "position": 3,
  "minAge": 12,
  "weeks": [
    {
      "title": "Temeller",
      "project": "Trafik ışığı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Mikrodenetleyicinin ne olduğunu ve Arduino Uno üzerindeki pinleri (dijital, analog, 5V, GND) söyleyebilir.\n2. Ohm yasasıyla (V = I × R) gerilim, akım ve direnç hesaplayabilir; LED için seri direncin neden gerektiğini açıklayabilir.\n3. `setup()`, `loop()`, `pinMode`, `digitalWrite` ve `delay` ile bir LED'i yakıp söndüren program yazabilir.\n4. `for` döngüsü ve dizi ile birden çok LED'i sürebilir.\n5. Plan tablosundan yola çıkarak üç LED'li bir trafik ışığı kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-30 dakikadır. Aşağıdaki plan günde bir ders içindir. Daha yoğun bir takvim isteyenler iki dersi birleştirebilir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Mikrodenetleyici nedir? | ~20 dk | Anlatımı oku, Uno'yu laboratuvarda tanı, dahili L LED'ini yak, mini testi çöz. |\n| 2 | Elektrik: V, I, R ve Ohm yasası | ~20 dk | Hesapları elle yap, sanal ölçümle akımı oku, hesapla karşılaştır. |\n| 3 | İlk program: Blink | ~20 dk | İlk devreyi kur, programı çalıştır, bekleme sürelerini değiştir. |\n| 4 | Çoklu LED, for döngüsü ve diziler | ~25 dk | Dört LED kur, döngü ve dizi sürümlerini dene. |\n| 5 | Proje: Trafik ışığı | ~30 dk | Planı tabloya yaz, devreyi kur, programı yaz, proje ölçütüyle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta özel bir ön bilgi gerekmez. Başlamadan önce şunları kontrol et:\n- Tarayıcıda devre laboratuvarı açılıyor mu? (Menüden \"Devre laboratuvarı\")\n- Öğrenci dört işlem ve ondalık sayılarla rahat mı? (Ohm yasası bölme ve çarpma içerir.)\n- Fare ile kablo çekmek ve parça seçmek konusunda sorun var mı?\n\n### Kavram haritası\n- **Donanım:** mikrodenetleyici → Arduino Uno → pinler (dijital, analog) → 5V ve GND\n- **Elektrik:** gerilim, akım, direnç → Ohm yasası → LED için seri direnç → kapalı devre\n- **Program:** sketch → `setup()` ve `loop()` → `pinMode`, `digitalWrite`, `delay` → `for` ve dizi\n- **Proje:** plan tablosu → aşamalar → söndür-yak-bekle kalıbı → tur süresi\n\n### Sık yapılan hatalar\n- **mA ile A'yı karıştırmak.** 20 mA = 0,02 A. Hesaptan önce ampere çevir.\n- **LED'i dirençsiz bağlamak.** Akım sınırlanmaz; laboratuvar uyarı verir.\n- **LED'i ters bağlamak ya da GND'yi unutmak.** Devre kapanmaz, LED yanmaz.\n- **`pinMode` unutmak.** LED çok sönük yanar ya da hiç yanmaz.\n- **Noktalı virgül unutmak.** Derleyici \"expected ';'\" der. Hata mesajını okumak çözümün yarısıdır.\n- **`delay` süresini saniye sanmak.** `delay(5)` 5 milisaniyedir.\n- **Dizide 1'den saymak.** İlk eleman `ledler[0]`'dır; 4 elemanlı dizide `ledler[4]` diziden taşar.\n- **Önceki aşamanın LED'ini söndürmemek.** Trafik ışığında iki LED birlikte yanar.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Blink programını sıfırdan, bakmadan yaz; sonra bekleme sürelerini değiştir.\n4. Kırmızı LED için 330 Ω yerine 1 kΩ ve 150 Ω kullanıldığında akımın nasıl değiştiğini hesapla ve laboratuvarda ölç.\n5. Kendi cümlelerinle şu soruyu cevapla: \"LED'in önündeki direnç ne işe yarar?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Trafik ışığı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | LED'lerden biri yanmıyor ya da dirençsiz | Üç LED kendi direnciyle ve doğru yönde bağlı | Renkler doğru seçilmiş, bağlantılar düzenli |\n| Plan | Tablo yok | Aşama, LED ve süre tablosu var | Tablo, kodla birebir uyuyor ve açıklanmış |\n| Program | Aynı anda birden çok LED yanıyor ya da program çalışmıyor | Üç aşama doğru sırada ve tek LED yanıyor | Kırmızı-sarı uyarı aşaması gibi bir geliştirme eklenmiş |\n| Zamanlama | Süreler yanlış (örneğin delay(5)) | Süreler tabloyla uyuşuyor | Süreleri değiştirip etkisini açıklıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta bir şey \"ezberletmek\" değil, öğrencinin devre kurmaya ve çalışan ilk programı görmeye alışmasıdır. Hata yapmak laboratuvarda güvenlidir; yanan LED ya da kısa devre sanaldır ve ↺ ile sıfırlanır.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: \"Akım nereden girip nereden çıkıyor?\", \"Hata mesajı ne diyor?\", \"Hangi pinleri bağladın, kodda hangisini yazdın?\"\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Her ders arasında kısa bir tekrar yeterlidir.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders ilerleyip gerçek kart kullanılacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Mikrodenetleyici nedir?",
          "durationMin": 20,
          "problem": "Bir asansör hangi kata gideceğini, bir çamaşır makinesi suyu ne zaman boşaltacağını nereden bilir? İçlerinde küçük bir bilgisayar vardır ve bu bilgisayar tek bir iş için programlanmıştır. Bu derste o küçük bilgisayarın ne olduğunu ve Arduino Uno kartının üzerinde neler bulunduğunu öğreneceksin.",
          "contentMd": "### Mikrodenetleyici ve bilgisayar\nBir bilgisayarda işlemci, bellek ve giriş-çıkış parçaları ayrı ayrı bulunur. **Mikrodenetleyici** bunların hepsini tek bir küçük çipin içinde toplar. Ekranı ve klavyesi yoktur. Onun yerine bacakları vardır. Bu bacaklara LED, buton, sensör, motor gibi parçalar bağlanır.\n\nMikrodenetleyici yaptığı işi **program** sayesinde bilir. Programı bir kez yüklersin. Güç kesilip yeniden verilse bile program çipte kalır ve kart enerji alır almaz çalışmaya başlar.\n\n### Arduino Uno'nun anatomisi\nArduino Uno, ATmega328P adlı bir mikrodenetleyici üzerine kurulmuş bir geliştirme kartıdır. Bu parçaları laboratuvardaki **Uno çiziminde** görebilirsin: laboratuvarı açınca Uno tuvalde hazır durur. Çipi, pin başlıklarını ve D13 yanındaki küçük L LED'ini çizim üzerinde bul. Kartın başlıca parçaları şunlardır.\n\n| Parça | Ne işe yarar? |\n|---|---|\n| ATmega328P çipi | Programı çalıştıran mikrodenetleyici |\n| Dijital pinler (0-13) | Dışarıya HIGH/LOW (5 V / 0 V) verir ya da dışarıdan okur |\n| Analog giriş pinleri (A0-A5) | 0-5 V arasındaki gerilimi ölçer |\n| 5V ve GND pinleri | Parçalara 5 V besleme ve toprak (0 V) verir |\n| USB girişi | Gerçek kartta programı yüklemek ve kartı beslemek için kullanılır. Laboratuvarda yükleme ve besleme otomatiktir |\n| Reset düğmesi | Programı baştan başlatır. Laboratuvarda bu işi ↺ düğmesi görür |\n| D13'e bağlı dahili LED (L) | Hiçbir parça eklemeden deneme yapmak için |\n\nATmega328P'nin bazı sayısal özellikleri: 16 MHz saat hızı, 32 KB program belleği (flash), 2 KB çalışma belleği (SRAM) ve 1 KB EEPROM. Bunlar bir telefonla kıyaslanınca çok küçüktür. Ama bir LED'i yakmak ya da bir motoru kontrol etmek için fazlasıyla yeter.\n\n### Dijital pin ne yapar?\nDijital bir pin iki durumdan birinde olur:\n- **HIGH:** Pin yaklaşık 5 V verir.\n- **LOW:** Pin 0 V verir.\n\nBir pin ya **çıkış** (kart dışarıya gerilim verir, örneğin LED yakmak için) ya da **giriş** (kart dışarıyı dinler, örneğin buton okumak için) olarak çalışır. Bu ayarı programda sen yaparsın.\n\n### Program nasıl çalışır?\nArduino programına **sketch** denir. Her sketch'te iki bölüm bulunur:\n- `setup()`: Kart açılınca bir kez çalışır.\n- `loop()`: Sürekli tekrar eder.\n\nSonraki derslerde bunları kendin yazacaksın. Şimdilik yalnızca kalıbı tanı:\n\n```\nvoid setup() {\n  // bir kez çalışacak komutlar\n}\n\nvoid loop() {\n  // sürekli tekrar eden komutlar\n}\n```\n\n### Çalışma ortamı\nBu modülde her şeyi platformun **devre laboratuvarında** yapacaksın. Solda kod düzenleyici, sağda devre tuvali vardır; Uno tuvalde hazır durur. Parçaları **Parça ekle** menüsünden seçersin, pinleri kablo çekerek bağlarsın. Sonra ▶ **Derle ve çalıştır**'a basarsın ve devre canlanır. Laboratuvar Uno'nun 5V, 3V3 ve GND pinlerini otomatik besler. Hata yaparsan hiçbir şey bozulmaz: ■ ile durdurup düzeltir, ↺ ile baştan başlarsın.\n\n### Dene\n- Laboratuvardaki Uno çizimine bak. 14 dijital pini ve 6 analog pini say.\n- 5V, GND ve D13 yazılarını çizimde bul. D13 yanındaki L LED'ini göster.\n- Etkinlik: devre kurmadan, yalnız kod yazarak D13'e bağlı dahili L LED'i yanıp söndür.\n- Evinde mikrodenetleyici bulunan üç cihaz yaz (ör. mikrodalga fırın, uzaktan kumanda).\n\n### Sık yapılan hatalar\n- Mikrodenetleyiciyi \"küçük bilgisayar\" sanıp her şeyi yapmasını beklemek: tek ve basit işler için tasarlanmıştır.\n- Pin numarasını kartın üzerindeki yazıyla karıştırmak: `A0` analog, `0` dijital pindir.\n- Devreyi kurarken GND'yi unutmak: devre tamamlanmaz, parçalar çalışmaz.",
          "question": "Evindeki hangi cihazın içinde bir mikrodenetleyici olduğunu düşünüyorsun ve bunu nereden anladın? Aynı cihazı tek bir işe değil, çok işe programlayabilsek ne olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Mikrodenetleyicinin ne olduğunu ve sıradan bir bilgisayardan farkını\n- Arduino Uno kartının başlıca parçalarını (pinler, 5V, GND, dahili L LED)\n- Bir pinin HIGH ve LOW durumlarını\n- Her programın iki bölümünü: `setup()` ve `loop()`\n\n### Önceden bilmen gerekenler\nHiçbir şey. Bu ders sıfırdan başlar. Yalnızca bir bilgisayar ve laboratuvarı açabilecek bir tarayıcı yeter.\n\n### Etrafındaki küçük bilgisayarlar\nMikrodalga fırının ne kadar süre çalışacağını, çamaşır makinesinin suyu ne zaman boşaltacağını, uzaktan kumandanın hangi tuşa basıldığını bir devre \"bilir\". Bu devrenin kalbinde genellikle bir **mikrodenetleyici** vardır.\n\nMikrodenetleyici, bir bilgisayarın üç temel parçasını (işlemci, bellek, giriş-çıkış) **tek bir çipe** sığdırır. Ekranı ya da klavyesi yoktur; onun yerine **bacakları (pin)** vardır. Bu pinlere LED, buton, sensör, motor gibi parçalar bağlanır. Bir bilgisayar her işi yapabilsin diye tasarlanır. Mikrodenetleyici ise **tek bir iş için** programlanır ve o işi sürekli yapar.\n\n### Program çipte kalır\nProgramı karta bir kez yüklersin. Program çipin **flash** belleğine yazılır ve güç kesilse bile silinmez. Kartı yeniden çalıştırdığında program kendiliğinden başlar. Bu yüzden bir cihazı prize taktığında hemen çalışır.\n\n### Arduino Uno, çipin etrafına kurulmuş bir kart\nArduino Uno'nun beyni **ATmega328P** çipidir. Kart, çipi kullanmayı kolaylaştıran parçalarla birlikte gelir:\n\n- **Dijital pinler (0-13):** HIGH ya da LOW verir ya da dışarıdan okur.\n- **Analog giriş pinleri (A0-A5):** 0 ile 5 V arasındaki gerilimi ölçer.\n- **5V ve GND pinleri:** Parçalara 5 volt ve toprak (0 V) verir.\n- **Dahili L LED'i:** D13'e bağlıdır. Hiçbir parça eklemeden deneme yapabilirsin.\n\nBu parçaları laboratuvarda Uno çiziminin üzerinde bulabilirsin. Laboratuvar, gerçek kartın USB ile program yükleme ve besleme işlerini senin yerine yapar.\n\n### HIGH ve LOW\nDijital bir pin iki durumdan birinde olur. **HIGH**, pinin yaklaşık 5 V verdiği; **LOW**, 0 V verdiği durumdur. Bir pin **çıkış** olarak ayarlanırsa kart pini kendisi sürer (örneğin LED yakar). **Giriş** olarak ayarlanırsa kart pini dinler (örneğin buton okur). Bu ayarı `pinMode` komutuyla programda sen yaparsın.\n\n### Her programın iki bölümü\nArduino programına **sketch** denir. İki bölümü vardır:\n\n```\nvoid setup() {\n  // kart açılınca BİR KEZ çalışır\n}\n\nvoid loop() {\n  // sürekli, baştan sona, tekrar tekrar çalışır\n}\n```\n\n`setup()` hazırlık içindir (pinlerin yönünü belirlemek gibi). `loop()` asıl iştir ve sonuna gelince başa döner. Kart güç aldığı sürece bu döngü hiç durmaz.\n\n### Özet\nMikrodenetleyici tek çipte küçük bir bilgisayardır ve tek bir iş için programlanır. Arduino Uno bu çipi pinlerle kullanılabilir hâle getirir. Pinler HIGH ya da LOW olur; programın `setup()` bölümü bir kez, `loop()` bölümü sürekli çalışır. Şimdi etkinlikte laboratuvarı açıp Uno'yu tanıyacaksın.",
          "concepts": [
            {
              "term": "Mikrodenetleyici",
              "definition": "İşlemci, bellek ve giriş-çıkış parçalarını tek çipte toplayan, tek bir iş için programlanan küçük bilgisayar.",
              "example": "Çamaşır makinesinin içindeki çip, suyun ne zaman boşaltılacağını programdan bilir.",
              "pitfall": "Onu her işi yapabilen bir bilgisayar sanmak; tek ve basit işler için tasarlanmıştır."
            },
            {
              "term": "Sketch",
              "definition": "Arduino programının adı. İçinde setup() ve loop() bölümleri bulunur.",
              "example": "Dahili LED'i yakıp söndüren on satırlık bir sketch yazabilirsin.",
              "pitfall": "Sketch'i bir kez yüklenip kaybolan bir şey sanmak; güç kesilse de çipin flash belleğinde kalır."
            },
            {
              "term": "setup() ve loop()",
              "definition": "setup() kart açılınca bir kez çalışır; loop() bittiği anda baştan başlar ve sürekli tekrar eder.",
              "example": "Pinin yönünü setup() içinde bir kez belirlersin, LED'i yakıp söndürmeyi loop() içinde yaparsın.",
              "pitfall": "Sürekli tekrar etmesi gereken komutu setup() içine yazmak: yalnız bir kez çalışır."
            },
            {
              "term": "HIGH ve LOW",
              "definition": "Bir dijital pinin iki durumu. HIGH yaklaşık 5 V, LOW 0 V demektir.",
              "example": "D13 HIGH olunca bağlı LED yanar, LOW olunca söner.",
              "pitfall": "HIGH'ı hep \"açık\" sanmak; buton okurken (INPUT_PULLUP) basılı olmak LOW demektir."
            },
            {
              "term": "Çıkış ve giriş (pinMode)",
              "definition": "Çıkış pinini kart sürer; giriş pinini kart dinler. Yönü pinMode ile sen belirlersin.",
              "example": "LED için pinMode(13, OUTPUT), buton için pinMode(2, INPUT_PULLUP) yazılır.",
              "pitfall": "pinMode yazmayı unutmak: pin çıkış olmaz, LED çok sönük yanar ya da hiç yanmaz."
            },
            {
              "term": "GND",
              "definition": "Devrenin 0 V referans noktası (toprak). Akımın geri döndüğü yoldur.",
              "example": "LED'in katot ucu GND'ye bağlanınca devre kapanır ve akım akabilir.",
              "pitfall": "GND'yi bağlamayı unutmak: devre tamamlanmaz, parça çalışmaz."
            }
          ],
          "quiz": [
            {
              "id": "m3h1d1-q1",
              "kind": "mcq",
              "prompt": "Mikrodenetleyiciyi sıradan bir bilgisayardan ayıran en önemli özellik hangisidir?",
              "options": [
                "Mutlaka bir ekranı ve klavyesi olması",
                "İşlemci, bellek ve giriş-çıkışı tek çipte toplaması ve genellikle tek bir iş için programlanması",
                "Yalnızca internete bağlanabilmesi",
                "Elektrik olmadan çalışabilmesi"
              ],
              "answer": 1,
              "explanation": "Mikrodenetleyici bir bilgisayarın temel parçalarını tek çipe sığdırır ve genellikle tek bir iş için programlanır. Ekranı ya da klavyesi yoktur; bacakları vardır.",
              "skills": [
                "mcu-board"
              ]
            },
            {
              "id": "m3h1d1-q2",
              "kind": "mcq",
              "prompt": "Program karta yüklendikten sonra güç kesilip yeniden verilirse ne olur?",
              "options": [
                "Program silinir, yeniden yüklemen gerekir",
                "Program çipte kalır ve kart enerji alınca kendiliğinden çalışmaya başlar",
                "Yalnızca setup() çalışır",
                "Kart yeni bir program bekler"
              ],
              "answer": 1,
              "explanation": "Program flash belleğe yazılır ve güç kesilince silinmez. Güç gelince kart programı baştan çalıştırır.",
              "skills": [
                "mcu-board"
              ]
            },
            {
              "id": "m3h1d1-q3",
              "kind": "predict-output",
              "prompt": "D13 pinine LED bağlı. Bu sketch çalışınca LED ne yapar?\n\n```\nvoid setup() {\n  pinMode(13, OUTPUT);\n  digitalWrite(13, HIGH);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "Yanıp söner",
                "Sürekli yanık kalır",
                "Hiç yanmaz",
                "Derleme hatası olur"
              ],
              "answer": 1,
              "explanation": "setup() bir kez çalışır ve D13'ü HIGH yapar. loop() boş olduğu için pini değiştiren başka komut yoktur; pin HIGH kalır ve LED sürekli yanar.",
              "skills": [
                "digital-out",
                "prog-structure"
              ]
            },
            {
              "id": "m3h1d1-q4",
              "kind": "mcq",
              "prompt": "Aşağıdaki ifadelerden hangisi doğrudur?",
              "options": [
                "A0 ile 0 aynı pindir",
                "A0 bir analog giriş pinidir, 0 ise dijital bir pindir",
                "A0 yalnızca LED yakmak içindir",
                "Uno'da analog pin yoktur"
              ],
              "answer": 1,
              "explanation": "A0-A5 analog giriş pinleridir. 0-13 numaralı pinler ise dijitaldir. Aynı numarayı taşımaları onları aynı yapmaz.",
              "skills": [
                "mcu-board"
              ]
            },
            {
              "id": "m3h1d1-q5",
              "kind": "numeric",
              "prompt": "Arduino Uno'nun D0'dan D13'e kadar kaç dijital pini vardır?",
              "answer": 14,
              "unit": "pin",
              "explanation": "D0'dan D13'e kadar sayılırsa 0, 1, 2 ... 13 olmak üzere 14 pin eder. Saymaya 0'dan başlandığı için son numara (13) ile pin sayısı (14) farklıdır.",
              "skills": [
                "mcu-board"
              ]
            }
          ]
        },
        {
          "title": "Elektrik: V, I, R ve Ohm yasası",
          "durationMin": 20,
          "problem": "Gerçek bir LED'i doğrudan 5 V'a bağlarsan çok kısa sürede bozulabilir. Aradaki küçük bir direnç onu nasıl kurtarır? Ve o direncin değerini tahmin etmek yerine hesaplayabilir miyiz? Laboratuvar bu kuralı modeller: LED'e fazla akım giderse uyarı çıkar. Üstelik akımı kendin ölçebilirsin.",
          "contentMd": "### Üç temel büyüklük\n| Büyüklük | Simge | Birim | Su borusu benzetmesi |\n|---|---|---|---|\n| Gerilim | V | volt (V) | Suyu iten basınç |\n| Akım | I | amper (A) | Borudan geçen su miktarı |\n| Direnç | R | ohm (Ω) | Borunun darlığı |\n\nSu benzetmesi basit bir modeldir. Elektrik suya benzemez ama fikri anlamana yardım eder: basınç artarsa akış artar, boru daralırsa akış azalır.\n\nKüçük akımları **miliamper** (mA) ile yazarız: 1 A = 1000 mA. Büyük dirençleri **kiloohm** (kΩ) ile yazarız: 1 kΩ = 1000 Ω.\n\n### Ohm yasası\nBir direncin uçları arasındaki gerilim, ondan geçen akımla direncin çarpımına eşittir:\n\n**V = I × R**\n\nBuradan iki tane daha formül çıkar:\n- **I = V / R** (akımı bulmak için)\n- **R = V / I** (direnci bulmak için)\n\n### Örnek hesaplar\n1. 5 V ve 1000 Ω (1 kΩ): I = 5 / 1000 = 0,005 A = **5 mA**.\n2. 5 V ve 500 Ω: I = 5 / 500 = 0,01 A = **10 mA**. Direnç yarıya inince akım iki katına çıkar.\n3. 9 V ve 3 A akım isteyen bir yük: R = 9 / 3 = **3 Ω**.\n4. 220 Ω dirençten 20 mA geçiyor: V = 0,02 × 220 = **4,4 V**.\n\n### LED için direnç hesabı\nLED bir direnç değildir. Yanarken uçlarında yaklaşık sabit bir gerilim düşer. Kırmızı bir LED için bu değer tipik olarak yaklaşık 2 V'tur (kesin değer LED'in veri sayfasında yazar). Geri kalan gerilim seri dirençte düşmelidir.\n\nBesleme 5 V, LED gerilimi 2 V ise direncin üzerinde 5 − 2 = 3 V kalır.\n\nBu hesap pinin ve LED'in iç dirençlerini yok sayan idealleştirilmiş bir hesaptır:\n\n- 330 Ω için akım: I = 3 / 330 ≈ 0,0091 A ≈ **9 mA**. LED güvenle yanar.\n- 150 Ω için akım: I = 3 / 150 = 0,02 A = **20 mA**. Daha parlak olur, ama sınıra yakındır.\n- 100 Ω için akım: I = 3 / 100 = **30 mA**. Bu fazladır; LED ve pin zarar görebilir.\n\nArduino Uno'nun bir pini için önerilen en yüksek akım yaklaşık 20 mA'dir; 40 mA ise aşılmaması gereken mutlak sınırdır. Bu yüzden bu modülde kırmızı LED'lerle **330 Ω** kullanıyoruz.\n\n### Sanal ölçüm: akımı ve gerilimi oku\nGerçek devrelerde bu değerleri multimetre ölçer. Laboratuvarda bunun karşılığı **sanal ölçümdür**. Devre çalışırken tuvalde bir parçayı (örneğin direnci ya da LED'i) seç. Parçanın uçları arasındaki **gerilim** ve içinden geçen **akım** özellik panelinde görünür. Önce ▶ ile devreyi çalıştırman gerekir; çalışmayan devrede ölçülecek bir şey yoktur.\n\nOhm yasasını bununla sınayabilirsin: D13'ü 330 Ω'luk bir dirençle LED'e bağla, kod D13'ü HIGH yapsın. Direnci seçince yaklaşık 2,8 V ve 8,6 mA görmelisin. Hesabımız 3 V ve 9 mA demişti; küçük fark normaldir, çünkü laboratuvar Uno pininin iç direncini (yaklaşık 25 Ω) ve LED'in iç direncini de modeller. Bu iki direnç de gerilimden pay alır, o yüzden seri dirence 3 V'un tamamı düşmez. Fark küçük direnç değerlerinde büyür: 150 Ω'da akım 20 mA değil yaklaşık 17 mA, 100 Ω'da 30 mA değil yaklaşık 24 mA ölçülür. Sonra ■ ile durdur, direnci özellik panelinden 1000 Ω yap ve yeniden çalıştırıp ölç: akım yaklaşık 3 mA'e düşmelidir (gerilim de 3 V'a yaklaşır, çünkü akım azalınca pinde ve LED'de kaybolan pay küçülür).\n\n### Dirençte renk kodu\nGerçek dirençlerin üzerindeki renkli halkalar değeri verir. Laboratuvarda değeri özellik panelinden yazarsın, ama gerçek dirençleri okumak için kodu bilmek yararlıdır. 330 Ω için sıra: turuncu, turuncu, kahverengi. İlk iki halka rakamdır (3 ve 3), üçüncü halka çarpandır (kahverengi = ×10), yani 33 × 10 = 330 Ω.\n\n### Dene\n- 5 V'a bağlı 220 Ω'luk bir dirençten ne kadar akım geçer? (Cevap: yaklaşık 22,7 mA)\n- Aynı 5 V ile 10 mA akım geçirmek istiyorsan hangi direnç gerekir? (Cevap: 500 Ω)\n- Kırmızı LED (2 V) ve 5 V besleme ile 330 Ω yerine 1 kΩ kullanırsan akım ne olur? LED nasıl görünür? (Cevap: 3 mA; sönük yanar)\n- Laboratuvarda bu devreyi kur, direnç değerini değiştir ve sanal ölçümle akımı oku. Hesabınla ölçülen değer uyuşuyor mu? Küçük farkın nedenini kendi cümlelerinle açıkla.\n\n### Sık yapılan hatalar\n- mA ile A'yı karıştırmak: 20 mA = 0,02 A'dir. Formülde önce ampere çevir.\n- LED'e direnç koymamak: akım hiçbir şey tarafından sınırlanmaz. Laboratuvar bunu modeller ve LED yanarsa uyarı verir; ↺ ile baştan başlayabilirsin.\n- \"Direnç büyükse akım büyüktür\" sanmak: tersine, direnç büyüdükçe akım **azalır**.",
          "question": "Direnci iki katına çıkarırsan LED'in parlaklığı nasıl değişir ve neden? Çok parlak ama güvenli bir LED için dirençle oynamak iyi bir fikir midir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Gerilim, akım ve direncin ne olduğunu ve birimlerini\n- Ohm yasasını (V = I × R) ve onunla hesap yapmayı\n- Bir LED için seri direncin neden gerektiğini ve değerini nasıl seçeceğini\n- Laboratuvarda sanal ölçümle akımı okumayı\n\n### Önceden bilmen gerekenler\nDers 1'deki HIGH (≈ 5 V) ve LOW (0 V) fikri. Dört işlem ve ondalık sayılar yeter.\n\n### Üç temel büyüklük\nElektrik devresini bir **su borusu** gibi düşünebilirsin. Bu benzetme gerçek değildir ama fikri oturtmaya yardım eder.\n\n| Büyüklük | Simge | Birim | Benzetme |\n|---|---|---|---|\n| Gerilim | V | volt (V) | Suyu iten basınç |\n| Akım | I | amper (A) | Borudan geçen su miktarı |\n| Direnç | R | ohm (Ω) | Borunun darlığı |\n\nKüçük akımları **miliamper** (mA) ile yazarız: 1 A = 1000 mA. Büyük dirençleri **kiloohm** (kΩ) ile yazarız: 1 kΩ = 1000 Ω.\n\n### Ohm yasası\nBir direncin uçları arasındaki gerilim, ondan geçen akımla direncin çarpımına eşittir:\n\n**V = I × R**\n\nBunu üç biçimde kullanırsın: `I = V / R` (akımı bul), `R = V / I` (direnci bul), `V = I × R` (gerilimi bul). Hesap yapmadan önce **birimleri çevir**: akımı amper, direnci ohm yaz.\n\n**Örnek.** 5 V'a bağlı 1 kΩ'luk bir dirençten geçen akım: I = 5 / 1000 = 0,005 A = **5 mA**. Direnci 500 Ω yaparsan akım **10 mA** olur. Direnç yarıya indi, akım iki katına çıktı.\n\n### Neden LED'e direnç koyarız?\nLED bir direnç gibi akımı kendisi sınırlamaz. Yanarken uçlarında yaklaşık sabit bir gerilim düşer (kırmızıda yaklaşık 2 V). Kalan gerilimin bir yerde düşmesi gerekir. Aradaki **seri direnç** o kalan gerilimi üstlenir ve akımı belirler:\n\n`I = (V besleme − V LED) / R`\n\n5 V besleme, 2 V'luk kırmızı LED ve 330 Ω için: I = (5 − 2) / 330 ≈ 0,009 A ≈ **9 mA**. Bu, LED'in güvenle yandığı bir akımdır. 100 Ω kullansaydın akım 30 mA olurdu; bu fazladır.\n\n### Hesap ile ölçüm\nBu hesap idealleştirilmiştir. Gerçekte (ve laboratuvarda) Uno pininin iç direnci ve LED'in iç direnci de gerilimden pay alır. Bu yüzden ölçülen akım hesaptan biraz küçük çıkar: 330 Ω'da yaklaşık 8,6 mA gibi. Küçük fark normaldir ve hata değildir; modelin daha ayrıntılı olduğunu gösterir.\n\n### Özet\nGerilim itici, akım akış, direnç engeldir. Ohm yasası üçünü bağlar: V = I × R. LED'in akımını direnç belirler; bu yüzden LED'e hep seri direnç koyarız. Bu modülde 5 V ile kırmızı LED için **330 Ω** kullanıyoruz.",
          "concepts": [
            {
              "term": "Gerilim (V)",
              "definition": "Akımı iten \"basınç\"; birimi volt. İki nokta arasındaki elektriksel fark.",
              "example": "Uno'nun HIGH pini yaklaşık 5 V verir.",
              "pitfall": "Gerilimi \"içinden geçen şey\" sanmak; gerilim iki nokta arasında ölçülür, akım ise içinden geçer."
            },
            {
              "term": "Akım (I)",
              "definition": "Devreden geçen yük akışı; birimi amper. Elektronikte çoğunlukla miliamper (mA) kullanılır.",
              "example": "Kırmızı LED 330 Ω ile yaklaşık 9 mA çeker.",
              "pitfall": "mA ile A'yı karıştırmak: 20 mA = 0,02 A'dir."
            },
            {
              "term": "Direnç (R)",
              "definition": "Akıma karşı koyan özellik; birimi ohm (Ω). Büyüdükçe akım azalır.",
              "example": "5 V'ta 1 kΩ'dan 5 mA, 500 Ω'dan 10 mA geçer.",
              "pitfall": "\"Direnç büyükse akım büyüktür\" sanmak; tersine, akım azalır."
            },
            {
              "term": "Ohm yasası",
              "definition": "V = I × R. Üç büyüklükten ikisi biliniyorsa üçüncüsü bulunur.",
              "example": "220 Ω'dan 20 mA geçiyorsa V = 0,02 × 220 = 4,4 V.",
              "pitfall": "Birimleri çevirmeden formüle koymak (mA'yi doğrudan yazmak)."
            },
            {
              "term": "Seri direnç",
              "definition": "LED ile art arda bağlanan ve akımı sınırlayan direnç.",
              "example": "D13 → 330 Ω → LED → GND bağlantısında 330 Ω seri dirençtir.",
              "pitfall": "LED'e direnç koymamak: akım sınırlanmaz, LED yanabilir."
            },
            {
              "term": "Sanal ölçüm",
              "definition": "Laboratuvarda devre çalışırken bir parçayı seçince özellik panelinde gerilim ve akımı görmen.",
              "example": "Çalışan devrede 330 Ω direnci seçince yaklaşık 2,8 V ve 8,6 mA görürsün.",
              "pitfall": "Devre çalışmıyorken ölçmeye çalışmak: önce ▶ ile çalıştır."
            }
          ],
          "quiz": [
            {
              "id": "m3h1d2-q1",
              "kind": "numeric",
              "prompt": "5 V'a bağlı 1000 Ω'luk (1 kΩ) bir dirençten kaç mA akım geçer?",
              "answer": 5,
              "tolerance": 0.01,
              "unit": "mA",
              "explanation": "I = V / R = 5 / 1000 = 0,005 A. 0,005 A = 5 mA.",
              "skills": [
                "elec-ohm"
              ]
            },
            {
              "id": "m3h1d2-q2",
              "kind": "numeric",
              "prompt": "5 V ile bir dirençten 10 mA akım geçirmek istiyorsun. Direnç kaç ohm olmalı?",
              "answer": 500,
              "tolerance": 0.5,
              "unit": "Ω",
              "explanation": "Önce akımı ampere çevir: 10 mA = 0,01 A. R = V / I = 5 / 0,01 = 500 Ω.",
              "skills": [
                "elec-ohm"
              ]
            },
            {
              "id": "m3h1d2-q3",
              "kind": "mcq",
              "prompt": "Gerilim sabitken bir dirençin değerini iki katına çıkarırsan akım ne olur?",
              "options": [
                "İki katına çıkar",
                "Yarıya iner",
                "Değişmez",
                "Sıfır olur"
              ],
              "answer": 1,
              "explanation": "I = V / R. Payda iki katına çıkınca sonuç yarıya iner: direnç büyüdükçe akım azalır.",
              "skills": [
                "elec-ohm"
              ]
            },
            {
              "id": "m3h1d2-q4",
              "kind": "mcq",
              "prompt": "Bir LED'i doğrudan, seri direnç olmadan 5 V'a bağlarsan ne olur?",
              "options": [
                "LED daha parlak yanar ve zarar görmez",
                "Akım hiçbir şey tarafından sınırlanmaz; LED çok akım çeker ve zarar görebilir",
                "LED hiç yanmaz",
                "Hiçbir şey değişmez"
              ],
              "answer": 1,
              "explanation": "LED akımı kendisi sınırlamaz. Seri direnç yoksa akım yükselir ve LED (ve Uno pini) zarar görebilir. Laboratuvar bunu modeller ve uyarı verir.",
              "skills": [
                "elec-led-resistor"
              ]
            },
            {
              "id": "m3h1d2-q5",
              "kind": "mcq",
              "prompt": "Laboratuvarda 330 Ω'luk dirençte 8,6 mA ölçtün; hesabın 9 mA demişti. Fark neden çıktı?",
              "options": [
                "Laboratuvar yanlış çalışıyor",
                "Uno pininin ve LED'in iç dirençleri de gerilimden pay alır, hesap bunları yok sayıyordu",
                "Ohm yasası burada geçerli değil",
                "mA ile A karıştırıldı"
              ],
              "answer": 1,
              "explanation": "Hesap idealleştirilmişti. Laboratuvar pinin iç direncini (yaklaşık 25 Ω) ve LED'in iç direncini de modeller; seri dirence 3 V'un tamamı düşmez, akım biraz küçük çıkar.",
              "skills": [
                "elec-ohm",
                "elec-led-resistor"
              ]
            }
          ]
        },
        {
          "title": "İlk program: Blink",
          "durationMin": 20,
          "problem": "Her programın bir \"merhaba dünya\"sı vardır. Donanımda bu bir LED'i yakıp söndürmektir. Peki bir kart, bir LED'in ne zaman yanıp ne zaman sönmesi gerektiğini nereden bilir?",
          "contentMd": "### Devre\n| Parça | Bağlantı |\n|---|---|\n| LED (kırmızı) | **A** (anot, uzun bacak) → direncin bir ucu; **K** (katot, kısa bacak) → GND |\n| 330 Ω direnç | Bir ucu **D13**, öbür ucu LED'in **A** ucu |\n\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Direncin değerini özellik panelinden 330 Ω yap.\n\nUno'daki dahili L LED de D13'e bağlıdır; harici LED olmadan da program onu yakıp söndürür.\n\n### Program\n```cpp\n// sketch: blink\nvoid setup() {\n  pinMode(13, OUTPUT);      // 13. pini çıkış yap\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);   // LED yansın\n  delay(1000);              // 1000 ms bekle\n  digitalWrite(13, LOW);    // LED sönsün\n  delay(1000);\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup()` kart açılınca **bir kez** çalışır. Pinlerin yönünü burada belirlersin.\n2. `loop()` bittiği anda **baştan başlar**, sonsuza kadar.\n3. `HIGH` pine 5 V verir, `LOW` 0 V. LED, direnç üzerinden bu gerilimle yanar.\n4. `delay(1000)` işlemciyi 1000 milisaniye (1 saniye) boyunca bekletir.\n\n### Dene\n- Bekleme süresini 200 ms yap ve yeniden ▶'e bas. LED hâlâ yanıp sönüyor mu, yoksa sürekli yanık mı görünüyor?\n- Yanık süresini 100 ms, sönük süresini 900 ms yap. Hangisi \"nabız\" gibi görünür?\n- S.O.S: üç kısa, üç uzun, üç kısa yanıp sönme programı yaz.\n\n### Sık yapılan hatalar\n- `pinMode` yazmayı unutmak: pin çıkış olmaz, LED çok sönük yanar ya da hiç yanmaz.\n- Her satırın sonundaki `;` işaretini unutmak: derleyici \"expected ';'\" der.\n- LED'i ters bağlamak: LED yönlüdür, A ve K ucu ters bağlanınca yanmaz.\n- Direnç koymamak: gerçek devrede LED ve pin zarar görebilir; laboratuvar bunu modeller ve uyarı verir. Direnç akımı sınırlar.",
          "question": "`delay(1000)` çalışırken kart başka bir iş yapabilir mi? Bu program sırasında bir butona basılsa fark eder mi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir pini çıkış yapmayı (`pinMode`) ve HIGH/LOW yazmayı (`digitalWrite`)\n- `delay` ile beklemeyi ve süreyi milisaniye olarak düşünmeyi\n- İlk devreni kurmayı: LED, direnç ve GND'nin bir halka oluşturması\n- Küçük program hatalarını tanımayı\n\n### Önceden bilmen gerekenler\nDers 1'de `setup()` ve `loop()`, HIGH ve LOW; ders 2'de LED için seri direncin gerekliliği.\n\n### Blink, donanımın \"merhaba dünya\"sı\nYeni bir dil öğrenirken ilk yazılan program ekrana \"Merhaba dünya\" yazar. Donanımda bunun karşılığı bir LED'i **yakıp söndürmektir**. Adı **Blink**'tir. Küçük görünür ama içinde programlamanın ve devrenin temelleri vardır.\n\n### Devre bir halkadır\nAkımın akması için kapalı bir yol gerekir: Uno pini → direnç → LED'in anodu (A) → LED'in katodu (K) → GND. Yolun herhangi bir yerinde kopukluk varsa LED yanmaz. LED **yönlüdür**: akım yalnız A'dan K'ya geçer. Direnç LED'i korur, değeri 330 Ω'dur (2. ders).\n\n### Program: dört komut\n```\npinMode(13, OUTPUT);     // 13. pini çıkış yap\ndigitalWrite(13, HIGH);  // pine 5 V ver\ndigitalWrite(13, LOW);   // pine 0 V ver\ndelay(1000);             // 1000 ms bekle\n```\n\n- `pinMode(pin, OUTPUT)` pinin **yönünü** belirler. `setup()` içinde bir kez yazılır.\n- `digitalWrite(pin, HIGH/LOW)` pinin **durumunu** belirler.\n- `delay(ms)` programı **milisaniye** cinsinden bekletir. 1000 ms = 1 saniye.\n\n### Sıra önemlidir\nKart komutları yukarıdan aşağıya, **sırayla** çalıştırır. `loop()` sonuna gelince en başa döner. Blink'te sıra şudur: yak, bekle, söndür, bekle, baştan. Bekleme süreleri yanık ve sönük kalma sürelerini belirler. Yanık 1000 ms, sönük 1000 ms ise bir tam tur 2000 ms sürer.\n\n### Sık görülen küçük hatalar\n- Her komutun sonundaki `;` unutulursa derleyici hata verir.\n- `pinMode` yazılmazsa pin çıkış olmaz; LED çok sönük yanar ya da hiç yanmaz.\n- LED ters bağlanırsa yanmaz. Hata yapmak bu ortamda güvenlidir: ■ ile durdurup düzeltebilir, ↺ ile baştan başlayabilirsin.\n\n### Özet\nBlink üç şeyi birleştirir: doğru kurulmuş bir devre, pinin yönünü belirleyen `pinMode` ve pini sürüp bekleyen `digitalWrite` ile `delay`. Komutlar sırayla çalışır ve `loop()` sürekli tekrar eder.",
          "concepts": [
            {
              "term": "pinMode()",
              "definition": "Bir pinin çıkış mı giriş mi olacağını belirler. Genellikle setup() içinde bir kez yazılır.",
              "example": "pinMode(13, OUTPUT); komutu D13'ü çıkış yapar.",
              "pitfall": "Yazmayı unutmak: pin çıkış olmaz, LED çok sönük yanar ya da hiç yanmaz."
            },
            {
              "term": "digitalWrite()",
              "definition": "Çıkış yapılmış bir pine HIGH (≈ 5 V) ya da LOW (0 V) yazar.",
              "example": "digitalWrite(13, HIGH); LED'i yakar, digitalWrite(13, LOW); söndürür.",
              "pitfall": "Pini çıkış yapmadan digitalWrite yazmak."
            },
            {
              "term": "delay()",
              "definition": "Programı verilen milisaniye kadar bekletir. 1000 ms = 1 saniye.",
              "example": "delay(500); yarım saniye bekletir.",
              "pitfall": "Süreyi saniye sanmak: delay(5) 5 saniye değil, 5 milisaniyedir."
            },
            {
              "term": "Anot ve katot",
              "definition": "LED'in iki ucu. Akım anot (A) ucundan girer, katot (K) ucundan çıkar. Gerçek LED'de uzun bacak anottur.",
              "example": "Blink devresinde anot dirence, katot GND'ye bağlanır.",
              "pitfall": "LED'i ters bağlamak: yanmaz."
            },
            {
              "term": "Kapalı devre",
              "definition": "Akımın pinden GND'ye kadar kesintisiz bir yol bulduğu devre. Yol kopuksa akım akmaz.",
              "example": "D13 → direnç → LED → GND yolu bir halka oluşturur.",
              "pitfall": "GND bağlantısını unutmak: devre kapanmaz, LED yanmaz."
            },
            {
              "term": "Derleme hatası",
              "definition": "Programın dil kurallarına uymaması yüzünden derleyicinin programı kabul etmemesi.",
              "example": "Satır sonunda ';' eksikse \"expected ';'\" mesajı çıkar.",
              "pitfall": "Hata mesajını okumadan kodu rastgele değiştirmek; mesaj hatanın nerede olduğunu söyler."
            }
          ],
          "quiz": [
            {
              "id": "m3h1d3-q1",
              "kind": "numeric",
              "prompt": "Blink programında LED 1000 ms yanık, 1000 ms sönük kalıyor. Bir tam yanıp sönme turu kaç milisaniye sürer?",
              "answer": 2000,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Bir tur yanık süre ile sönük sürenin toplamıdır: 1000 + 1000 = 2000 ms (2 saniye).",
              "skills": [
                "prog-timing",
                "digital-out"
              ]
            },
            {
              "id": "m3h1d3-q2",
              "kind": "find-bug",
              "prompt": "Bu program derlenirken hata veriyor. Hatalı satır hangisi?\n\n```\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH)\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}\n```",
              "options": [
                "pinMode(13, OUTPUT);",
                "digitalWrite(13, HIGH)",
                "delay(500);",
                "digitalWrite(13, LOW);"
              ],
              "answer": 1,
              "explanation": "digitalWrite(13, HIGH) satırının sonunda noktalı virgül yok. Derleyici \"expected ';'\" hatası verir. Her komut ';' ile bitmelidir.",
              "skills": [
                "prog-debug"
              ]
            },
            {
              "id": "m3h1d3-q3",
              "kind": "find-bug",
              "prompt": "Harici LED D13'e doğru bağlı ama LED çok sönük yanıyor ya da hiç yanmıyor. Sorunun nedeni ne?\n\n```\nvoid setup() {\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}\n```",
              "options": [
                "setup() içinde pinMode(13, OUTPUT) yok",
                "delay değerleri çok büyük",
                "loop() kullanılmış",
                "HIGH büyük harfle yazılmış"
              ],
              "answer": 0,
              "explanation": "Pin çıkış olarak ayarlanmadığı için digitalWrite pini gerçekten sürmez. pinMode(13, OUTPUT) setup() içine yazılmalı.",
              "skills": [
                "prog-debug",
                "digital-out"
              ]
            },
            {
              "id": "m3h1d3-q4",
              "kind": "mcq",
              "prompt": "Blink devresinde LED'in katot (K) ucu nereye bağlanır?",
              "options": [
                "Doğrudan D13'e",
                "5V pinine",
                "GND'ye",
                "Hiçbir yere"
              ],
              "answer": 2,
              "explanation": "Akım pinden direnç ve LED'in anodu üzerinden girer, katottan çıkıp GND'ye döner. Katot GND'ye bağlanmazsa devre kapanmaz.",
              "skills": [
                "circuit-wiring"
              ]
            },
            {
              "id": "m3h1d3-q5",
              "kind": "numeric",
              "prompt": "LED 100 ms yanık, 900 ms sönük kalacak. LED bir turun yüzde kaçında yanıktır?",
              "answer": 10,
              "tolerance": 0,
              "unit": "%",
              "explanation": "Tur süresi 100 + 900 = 1000 ms. Yanık süre 100 ms olduğundan 100 / 1000 = %10.",
              "skills": [
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Çoklu LED, for döngüsü ve diziler",
          "durationMin": 25,
          "problem": "Dört LED'i sırayla yakmak için aynı satırları dört kez yazmak gerekir. Peki 40 LED olsaydı? Programcılar aynı işi tekrar tekrar yazmak yerine kartın bunu kendisinin tekrar etmesini sağlar.",
          "contentMd": "### Devre\n| Parça | Bağlantı |\n|---|---|\n| LED 1 (kırmızı) | Anot → 330 Ω → **D13**; katot → GND |\n| LED 2 (sarı) | Anot → 330 Ω → **D12**; katot → GND |\n| LED 3 (yeşil) | Anot → 330 Ω → **D11**; katot → GND |\n| LED 4 (mavi) | Anot → 330 Ω → **D10**; katot → GND |\n\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Her LED'in kendi direnci olur. Dört K ucunu Uno'nun GND pinlerinden birine bağlayabilirsin. LED'in rengini özellik panelinden seçersin.\n\n### for döngüsü\n`for` döngüsü bir işi belirli sayıda tekrar eder. Üç parçası vardır:\n\n```\nfor (int i = 10; i <= 13; i++) {\n  // i sırasıyla 10, 11, 12, 13 değerini alır\n}\n```\n\n- `int i = 10`: sayaç 10'dan başlar.\n- `i <= 13`: sayaç 13'e eşit ya da küçük olduğu sürece devam et.\n- `i++`: her turdan sonra sayacı 1 artır.\n\nDört `pinMode` satırı yazmak yerine döngü kullanabilirsin:\n\n```\nfor (int pin = 10; pin <= 13; pin++) {\n  pinMode(pin, OUTPUT);\n}\n```\n\n### Program 1: Sırayla yanan LED'ler\n```cpp\n// sketch: coklu_led\nvoid setup() {\n  for (int pin = 10; pin <= 13; pin++) {\n    pinMode(pin, OUTPUT);\n  }\n}\n\nvoid loop() {\n  for (int pin = 10; pin <= 13; pin++) {\n    digitalWrite(pin, HIGH);   // bu LED yansın\n    delay(300);\n    digitalWrite(pin, LOW);    // sonra sönsün\n  }\n}\n```\n\n### Dizi (array)\nBir dizi, aynı türden birçok değeri tek bir isim altında saklar. Elemanlar **0'dan** başlayarak numaralanır.\n\n```\nint ledler[] = {13, 12, 11, 10};\n// ledler[0] = 13, ledler[1] = 12, ledler[2] = 11, ledler[3] = 10\n```\n\nDizi sayesinde pin numaralarının sıralı olması gerekmez. LED'leri istediğin pine bağlarsın, sırayı dizide yazarsın.\n\n### Program 2: Gidip gelen ışık\n```cpp\n// sketch: dizi_led\nint ledler[] = {13, 12, 11, 10};\n\nvoid setup() {\n  for (int i = 0; i < 4; i++) {\n    pinMode(ledler[i], OUTPUT);\n  }\n}\n\nvoid loop() {\n  // ileri: 13, 12, 11, 10\n  for (int i = 0; i < 4; i++) {\n    digitalWrite(ledler[i], HIGH);\n    delay(200);\n    digitalWrite(ledler[i], LOW);\n  }\n  // geri: 11, 12\n  for (int i = 2; i >= 1; i--) {\n    digitalWrite(ledler[i], HIGH);\n    delay(200);\n    digitalWrite(ledler[i], LOW);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup()` içinde döngü, dört pini de çıkış yapar.\n2. İleri döngüsünde `i` 0'dan 3'e gider. `ledler[i]` sırayla 13, 12, 11 ve 10 olur.\n3. Geri döngüsünde `i--` sayacı bir azaltır; `i` 2'den 1'e iner. Böylece uçtaki LED'ler iki kez yanmaz ve ışık gidip gelir.\n4. Her LED 200 ms yanar, sonra söner. Bir tam tur 6 × 200 = 1200 ms sürer.\n\n### Dene\n- `delay` değerlerini 50 ms yap ve yeniden ▶'e bas. Işık hâlâ ayrı ayrı görülebiliyor mu?\n- `ledler` dizisine yeni bir pin ekle (ör. D9) ve döngü sınırlarını buna göre değiştir.\n- Önce hepsini birlikte yakıp sonra hepsini birlikte söndüren bir program yaz.\n\n### Sık yapılan hatalar\n- Dizide `ledler[4]` yazmak: 4 elemanlı dizinin son elemanı `ledler[3]`'tür. Diziden taşmak beklenmedik davranışa yol açar.\n- Döngü koşulunda `<` ile `<=` karıştırmak: bir eleman fazla ya da eksik işlenir.\n- `for` satırının sonuna `;` koymak: döngü gövdesi çalışmaz.\n- Dizinin elemanları 1'den başlıyor sanmak: ilk eleman `ledler[0]`'dır.",
          "question": "Dört LED yerine otuz LED olsaydı, döngü ve dizi kullanmak sana ne kazandırırdı? Dizi kullanmadan aynı programı yazmak ne kadar uzun olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir işi tekrar tekrar yazmak yerine `for` döngüsüyle tekrarlamayı\n- Dizilerle birden çok değeri tek isim altında tutmayı ve elemanlara numarayla ulaşmayı\n- Dört LED'i sırayla yakmayı\n- Döngü ve dizi hatalarını tanımayı\n\n### Önceden bilmen gerekenler\nDers 3: `pinMode`, `digitalWrite`, `delay`, devre kurma. Ders 2: her LED'in kendi seri direnci olur.\n\n### Tekrar eden iş\nDört LED'i sırayla yakmak için aynı üç satırı dört kez yazman gerekir. Otuz LED olsaydı doksan satır yazardın. Programcılar bu tür işleri bilgisayara bırakır: \"Bu adımları şu kadar kez tekrarla.\"\n\n### for döngüsü\n`for` üç parçayla çalışır:\n\n```\nfor (int i = 10; i <= 13; i++) {\n  // gövde: i sırasıyla 10, 11, 12, 13 olur\n}\n```\n\n1. **Başlangıç** (`int i = 10`): sayaç, döngü başlamadan önce bir kez kurulur.\n2. **Koşul** (`i <= 13`): her turdan önce kontrol edilir; doğruysa gövde çalışır, yanlışsa döngü biter.\n3. **Artış** (`i++`): her turdan sonra sayaç 1 artar. `i--` ise 1 azaltır.\n\nBu örnekte gövde i = 10, 11, 12 ve 13 için çalışır, yani **4 tur**. i 14 olunca koşul yanlış olur ve döngü biter.\n\n### Dizi\n**Dizi**, aynı türden birçok değeri tek bir isim altında saklar:\n\n```\nint ledler[] = {13, 12, 11, 10};\n```\n\nElemanlara **numarayla (indeks)** ulaşırsın ve numaralama **0'dan başlar**:\n\n| İndeks | 0 | 1 | 2 | 3 |\n|---|---|---|---|---|\n| Değer | 13 | 12 | 11 | 10 |\n\n`ledler[2]` değeri 11'dir. 4 elemanlı bir dizide geçerli indeksler 0, 1, 2 ve 3'tür; `ledler[4]` diziden **taşar** ve beklenmedik davranışa yol açar.\n\n### Döngü ve dizi birlikte\nDiziyi `for` ile gezersen her LED için aynı kodu bir kez yazarsın:\n\n```\nfor (int i = 0; i < 4; i++) {\n  digitalWrite(ledler[i], HIGH);\n}\n```\n\n`i < 4` ile `i <= 3` aynı sonucu verir. Eleman sayısı N ise dizi döngüsünde genellikle `i < N` yazılır. Pin numaralarının sıralı olması da gerekmez; sırayı dizide sen belirlersin.\n\n### Dikkat\n- `for (...)` satırının sonuna `;` koyarsan döngü gövdesi boş kalır; ardından gelen `{ }` bloğu döngünün parçası olmaz.\n- `<` ile `<=` farkı bir tur fazla ya da eksik demektir.\n\n### Özet\n`for` bir işi tekrarlar; dizi birden çok değeri tek isimde tutar. İndeksler 0'dan başlar, N elemanlı dizinin son indeksi N − 1'dir. İkisini birlikte kullanınca kısa ve değiştirmesi kolay programlar yazılır.",
          "concepts": [
            {
              "term": "for döngüsü",
              "definition": "Bir işi sayaçla belirli sayıda tekrar eder: başlangıç, koşul ve artıştan oluşur.",
              "example": "for (int pin = 10; pin <= 13; pin++) dört pini sırayla işler.",
              "pitfall": "for satırının sonuna ';' koymak: döngü gövdesi boş kalır."
            },
            {
              "term": "Sayaç değişkeni",
              "definition": "Döngünün kaçıncı turda olduğunu tutan değişken. Genellikle i adı verilir.",
              "example": "Döngüde i sırasıyla 0, 1, 2, 3 değerini alır.",
              "pitfall": "Sayacı döngü içinde yanlışlıkla değiştirmek."
            },
            {
              "term": "Dizi (array)",
              "definition": "Aynı türden birçok değeri tek bir isim altında saklar.",
              "example": "int ledler[] = {13, 12, 11, 10}; dört pin numarasını tutar.",
              "pitfall": "Elemanlarının 1'den başladığını sanmak."
            },
            {
              "term": "İndeks",
              "definition": "Dizideki bir elemanın sıra numarası. 0'dan başlar.",
              "example": "ledler[0] = 13, ledler[3] = 10.",
              "pitfall": "4 elemanlı dizide ledler[4] yazmak: diziden taşar."
            },
            {
              "term": "i++ ve i--",
              "definition": "Sayacı 1 artırır ya da 1 azaltır.",
              "example": "for (int i = 2; i >= 1; i--) döngüsü 2 ve 1 değerleriyle iki tur çalışır.",
              "pitfall": "Azalan döngüde koşulu yanlış yönde yazmak (örneğin i <= 1)."
            },
            {
              "term": "< ve <= farkı",
              "definition": "< \"küçükse\", <= \"küçük ya da eşitse\" demektir. Tur sayısını değiştirir.",
              "example": "i < 4 ile i = 0, 1, 2, 3 (4 tur); i <= 4 ile 5 tur döner.",
              "pitfall": "Dizi gezerken <= kullanıp son turda diziden taşmak."
            }
          ],
          "quiz": [
            {
              "id": "m3h1d4-q1",
              "kind": "predict-output",
              "prompt": "Bu dizide ledler[2] hangi değere sahiptir?\n\n```\nint ledler[] = {13, 12, 11, 10};\n```",
              "options": [
                "13",
                "12",
                "11",
                "10"
              ],
              "answer": 2,
              "explanation": "İndeksler 0'dan başlar: ledler[0] = 13, ledler[1] = 12, ledler[2] = 11, ledler[3] = 10.",
              "skills": [
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m3h1d4-q2",
              "kind": "numeric",
              "prompt": "Bu döngünün gövdesi kaç kez çalışır?\n\n```\nfor (int pin = 10; pin <= 13; pin++) {\n  pinMode(pin, OUTPUT);\n}\n```",
              "answer": 4,
              "tolerance": 0,
              "unit": "kez",
              "explanation": "pin sırasıyla 10, 11, 12 ve 13 olur. 14'te koşul (pin <= 13) yanlış olur ve döngü biter. Toplam 4 tur.",
              "skills": [
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m3h1d4-q3",
              "kind": "find-bug",
              "prompt": "Program dört LED'i çıkış yapmak istiyor ama dizi sınırının dışına taşıyor. Hata nerede?\n\n```\nint ledler[] = {13, 12, 11, 10};\n\nvoid setup() {\n  for (int i = 0; i <= 4; i++) {\n    pinMode(ledler[i], OUTPUT);\n  }\n}\n```",
              "options": [
                "int ledler[] = {13, 12, 11, 10};",
                "i <= 4 koşulu",
                "pinMode(ledler[i], OUTPUT);",
                "i++ ifadesi"
              ],
              "answer": 1,
              "explanation": "Dizinin son indeksi 3'tür. i <= 4 olduğundan döngü 5 tur döner ve son turda ledler[4]'e ulaşır; bu dizinin dışıdır. Doğrusu i < 4 (ya da i <= 3).",
              "skills": [
                "prog-loops-arrays",
                "prog-debug"
              ]
            },
            {
              "id": "m3h1d4-q4",
              "kind": "numeric",
              "prompt": "\"Gidip gelen ışık\" programında ileri turda 4 LED, geri turda 2 LED sırayla 200 ms yanıyor. Loop'un bir tam turu kaç ms sürer? (Söndürme anında beklemek yok sayılır.)",
              "answer": 1200,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Toplam 4 + 2 = 6 yanma var ve her biri 200 ms sürüyor: 6 × 200 = 1200 ms.",
              "skills": [
                "prog-timing",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m3h1d4-q5",
              "kind": "numeric",
              "prompt": "Bu döngü kaç tur döner?\n\n```\nfor (int i = 2; i >= 1; i--) {\n  // ...\n}\n```",
              "answer": 2,
              "tolerance": 0,
              "unit": "tur",
              "explanation": "i = 2 için koşul (i >= 1) doğru, gövde çalışır. i = 1 için de doğru. i = 0 olunca koşul yanlış olur. Toplam 2 tur.",
              "skills": [
                "prog-loops-arrays"
              ]
            }
          ]
        },
        {
          "title": "Proje: Trafik ışığı",
          "durationMin": 30,
          "problem": "Her kavşakta ışıklar belli bir düzenle yanar: kırmızıda dur, yeşilde geç, sarıda hazırlan. Aynı düzeni üç LED ve birkaç satır kodla kurabilir misin?",
          "contentMd": "### Devre\n| Parça | Bağlantı |\n|---|---|\n| Kırmızı LED | Anot → 330 Ω → **D13**; katot → GND |\n| Sarı LED | Anot → 330 Ω → **D12**; katot → GND |\n| Yeşil LED | Anot → 330 Ω → **D11**; katot → GND |\n\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. LED'lerin renklerini özellik panelinden kırmızı, sarı ve yeşil yap. Her LED'in kendi direnci olmalı. Kırmızı LED için 330 Ω, 5 V'ta yaklaşık 9 mA akım verir (2. dersteki hesap gibi). Sarı ve yeşil LED'lerin gerilim düşümü biraz farklı olabilir; yine de bu direnç güvenli bir seçimdir.\n\n### Plan\nÖnce ışığın sırasını bir tabloya yaz. Programı yazmadan önce planı yapmak hatayı azaltır.\n\n| Aşama | Yanan LED | Süre |\n|---|---|---|\n| 1 | Kırmızı (D13) | 5 saniye |\n| 2 | Yeşil (D11) | 5 saniye |\n| 3 | Sarı (D12) | 2 saniye |\n\nSonra başa dönülür. Aynı anda yalnızca bir LED yanar.\n\n### Program\n```cpp\n// sketch: trafik_isigi\nvoid setup() {\n  pinMode(13, OUTPUT);   // kırmızı\n  pinMode(12, OUTPUT);   // sarı\n  pinMode(11, OUTPUT);   // yeşil\n}\n\nvoid loop() {\n  // 1. aşama: kırmızı\n  digitalWrite(13, HIGH);\n  digitalWrite(12, LOW);\n  digitalWrite(11, LOW);\n  delay(5000);\n\n  // 2. aşama: yeşil\n  digitalWrite(13, LOW);\n  digitalWrite(11, HIGH);\n  delay(5000);\n\n  // 3. aşama: sarı\n  digitalWrite(11, LOW);\n  digitalWrite(12, HIGH);\n  delay(2000);\n\n  digitalWrite(12, LOW);\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup()` üç pini de çıkış yapar.\n2. `loop()` her aşamada önce hangi LED'lerin yanacağını belirler, sonra `delay` ile bekler.\n3. Aşamalar bittiğinde sarı LED söndürülür ve `loop()` baştan başlar. Böylece kırmızı yeniden yanar.\n4. Bir tam tur 5 + 5 + 2 = 12 saniye sürer.\n\n### Diziyle yeniden yaz\nAynı projeyi `for` döngüsü ve dizi ile de kurabilirsin. Pin numaralarını bir diziye koyup `setup()` içinde döngüyle çıkış yapabilirsin. Bu, 4. derste öğrendiğin yöntemdir.\n\n```\nint ledler[] = {13, 12, 11};\n\nvoid setup() {\n  for (int i = 0; i < 3; i++) {\n    pinMode(ledler[i], OUTPUT);\n  }\n}\n```\n\n### Dene\n- Gerçek kavşaklarda kırmızıdan yeşile geçmeden önce kısa bir uyarı aşaması olabilir. Kırmızı ve sarıyı birlikte yakan 1 saniyelik bir aşama ekle.\n- Yeşil LED'i bitmeden önce 3 kez yanıp söndür.\n- Süreleri değiştir: kırmızı 3 saniye, yeşil 8 saniye. Hangi yönün trafiği daha yoğun olurdu?\n\n### Sık yapılan hatalar\n- Bir önceki aşamanın LED'ini söndürmeyi unutmak: iki LED birlikte yanar.\n- LED'leri GND yerine 5 V'a bağlamak: LED yanmaz ya da ters yanar.\n- Pin numarasını yanlış yazmak: kırmızı için D13 kullandıysan `digitalWrite`'ta da 13 yazmalısın.\n- `delay` süresini saniye sanmak: `delay(5)` 5 saniye değil, 5 milisaniyedir.",
          "question": "Gerçek bir kavşakta iki yönün ışıkları birbirine bağlı çalışır. İkinci bir ışık takımı ekleseydin, kırmızı ve yeşil aşamalarını nasıl düzenlerdin? Aynı anda iki yönün yeşili yanması neden tehlikeli olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir projeye kodla değil **plan** ile başlamayı\n- Aşamaları tabloya dökmeyi (hangi LED, ne kadar süre)\n- Trafik ışığı devresini ve programını kurmayı\n- Önceki derslerin bilgilerini tek bir projede birleştirmeyi\n\n### Önceden bilmen gerekenler\n`pinMode`, `digitalWrite`, `delay` (3. ders), her LED için seri direnç (2. ders), çoklu LED bağlantısı (4. ders). Dizi ve döngü bu derste isteğe bağlıdır.\n\n### Plan, koddan önce gelir\nKüçük bir proje bile birkaç adımdan oluşur. Doğrudan koda atlarsan hangi LED'in ne zaman yanması gerektiğini yazarken kafan karışır. Önce bir **tablo** çiz:\n\n| Aşama | Yanan LED | Süre |\n|---|---|---|\n| 1 | Kırmızı (D13) | 5 saniye |\n| 2 | Yeşil (D11) | 5 saniye |\n| 3 | Sarı (D12) | 2 saniye |\n\nTablo bir kez doğru olunca kod, tablonun satır satır çevirisi olur.\n\n### Tablodan koda\nHer aşama kodda aynı üç adımdan oluşur:\n1. Yanması gerekmeyen LED'leri **söndür** (`LOW`).\n2. Yanacak LED'i **yak** (`HIGH`).\n3. Süre kadar **bekle** (`delay`).\n\nBir aşamada önceki LED'i söndürmeyi unutursan iki LED birlikte yanar. Gerçek bir kavşakta iki yönün birlikte yeşil olması kazaya yol açardı.\n\n### Süreleri doğru yaz\n`delay` **milisaniye** alır. 5 saniye için `delay(5000)` yazarsın. `delay(5)` yalnızca 5 milisaniye bekletir. Tüm turun süresi aşama sürelerinin toplamıdır: 5 + 5 + 2 = 12 saniye.\n\n### Devre\nHer LED'in kendi seri direnci olur. Kırmızı LED için 330 Ω ile 5 V'ta yaklaşık 9 mA akım geçer (2. ders). Sarı ve yeşil LED'lerin gerilim düşümü biraz farklıdır; aynı direnç güvenli bir seçimdir.\n\n### Özet\nProje = plan + devre + kod. Önce tabloyu yaz, sonra her aşamayı \"söndür, yak, bekle\" kalıbıyla koda çevir. Süreleri milisaniyeye çevirmeyi ve önceki LED'i söndürmeyi unutma.",
          "concepts": [
            {
              "term": "Plan tablosu",
              "definition": "Programı yazmadan önce aşamaları, yanacak LED'leri ve süreleri sıralayan tablo.",
              "example": "Trafik ışığında üç satırlık tablo: kırmızı 5 s, yeşil 5 s, sarı 2 s.",
              "pitfall": "Planı atlayıp doğrudan kod yazmak: hata arama süresi uzar."
            },
            {
              "term": "Aşama (durum)",
              "definition": "Bir anda hangi LED'lerin yandığını tanımlayan adım. Süresi dolunca bir sonrakine geçilir.",
              "example": "Kırmızı aşamada yalnız D13 HIGH, diğerleri LOW'dur.",
              "pitfall": "Bir aşamada önceki LED'i söndürmeyi unutmak: iki LED birlikte yanar."
            },
            {
              "term": "Söndür - yak - bekle kalıbı",
              "definition": "Her aşamada önce gereksiz LED'leri söndürür, sonra yanacak olanı yakar, ardından beklersin.",
              "example": "digitalWrite(13, LOW); digitalWrite(11, HIGH); delay(5000);",
              "pitfall": "Sırayı karıştırıp önce bekleyip sonra yakmak."
            },
            {
              "term": "Tur süresi",
              "definition": "loop()'un bir kez baştan sona çalışması için geçen süre; aşama sürelerinin toplamıdır.",
              "example": "5 + 5 + 2 = 12 saniye.",
              "pitfall": "Süreleri milisaniye yerine saniye sanıp delay(5) yazmak."
            },
            {
              "term": "Her LED'e ayrı direnç",
              "definition": "Her LED'in akımını kendi seri direnci sınırlar.",
              "example": "Üç LED için üç tane 330 Ω direnç kullanılır.",
              "pitfall": "Dirençsiz LED bağlamak: akım sınırlanmaz."
            }
          ],
          "quiz": [
            {
              "id": "m3h1d5-q1",
              "kind": "numeric",
              "prompt": "Trafik ışığında kırmızı 5 s, yeşil 5 s ve sarı 2 s yanıyor. Bir tam tur kaç saniye sürer?",
              "answer": 12,
              "tolerance": 0,
              "unit": "s",
              "explanation": "Tur süresi aşama sürelerinin toplamıdır: 5 + 5 + 2 = 12 saniye.",
              "skills": [
                "prog-timing",
                "prog-planning"
              ]
            },
            {
              "id": "m3h1d5-q2",
              "kind": "find-bug",
              "prompt": "Bu programda yeşil aşamada kırmızı LED de yanık kalıyor. Eksik olan nedir?\n\n```\ndigitalWrite(13, HIGH);   // kırmızı\ndelay(5000);\ndigitalWrite(11, HIGH);   // yeşil\ndelay(5000);\n```",
              "options": [
                "Yeşil aşamadan önce kırmızıyı söndüren digitalWrite(13, LOW) satırı",
                "pinMode(13, OUTPUT) satırı",
                "delay(5000) çok kısa",
                "digitalWrite(11, LOW) satırı"
              ],
              "answer": 0,
              "explanation": "Kırmızı bir kez HIGH yapıldıktan sonra LOW yapılmazsa yanık kalır. Yeşile geçmeden önce digitalWrite(13, LOW) gerekir.",
              "skills": [
                "prog-debug",
                "digital-out"
              ]
            },
            {
              "id": "m3h1d5-q3",
              "kind": "numeric",
              "prompt": "5 saniye beklemek için delay() içine hangi sayıyı yazmalısın?",
              "answer": 5000,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "delay milisaniye bekler. 1 saniye = 1000 ms olduğundan 5 saniye = 5000 ms. delay(5) yalnız 5 milisaniye bekler.",
              "skills": [
                "prog-timing"
              ]
            },
            {
              "id": "m3h1d5-q4",
              "kind": "mcq",
              "prompt": "Projeye kod yazarak değil, önce bir plan tablosuyla başlamanın en büyük faydası nedir?",
              "options": [
                "Kod daha hızlı çalışır",
                "Hangi aşamada hangi LED'in ne kadar yanacağı baştan netleşir; kod tablonun çevirisi olur ve hata azalır",
                "Tablo olmadan program derlenmez",
                "LED'ler daha parlak yanar"
              ],
              "answer": 1,
              "explanation": "Plan, programın ne yapacağını önceden netleştirir. Tablo doğruysa kod onun satır satır çevirisidir; hata aramak da kolaylaşır.",
              "skills": [
                "prog-planning"
              ]
            },
            {
              "id": "m3h1d5-q5",
              "kind": "numeric",
              "prompt": "Kırmızı LED (yaklaşık 2 V), 5 V besleme ve 330 Ω direnç için idealleştirilmiş hesapla akım kaç mA çıkar? (En yakın tam sayıya yuvarla.)",
              "answer": 9,
              "tolerance": 0.5,
              "unit": "mA",
              "explanation": "I = (5 − 2) / 330 ≈ 0,0091 A ≈ 9 mA. Laboratuvarda pin ve LED iç dirençleri yüzünden ölçüm biraz daha küçük (yaklaşık 8,6 mA) çıkar.",
              "skills": [
                "elec-led-resistor",
                "elec-ohm"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Girdi ve mantık",
      "project": "Kapı zili ve sayaç",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Bir pini `INPUT_PULLUP` ile giriş yapıp `digitalRead` ile okuyabilir ve \"basılı = LOW\" mantığını açıklayabilir.\n2. `if`, `else if`, `else`, `switch` ile programa karar verdirebilir; `==` ile `=` arasındaki farkı bilir.\n3. `&&`, `||` ve `!` ile birden çok koşulu birleştirebilir.\n4. Buton sıçramasını (bounce) ve kenar algılamayı açıklayabilir; \"tek basış, tek işlem\" davranışını programlayabilir.\n5. `Serial.print`, `Serial.println`, `Serial.available`, `Serial.read` ve `Serial.parseInt` ile kartla konuşabilir.\n6. Plan tablosundan yola çıkarak kapı zili ve basış sayacı projesini kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir. Hafta 1'deki Blink ve LED bağlantılarına bu hafta sık sık geri dönülür.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | digitalRead, buton, INPUT_PULLUP | ~20 dk | Anlatımı oku, butonu D2 ve GND arasına bağla, LED'i butonla yak, `1 - durum` hilesini dene. |\n| 2 | if/else, switch, mantık işleçleri | ~22 dk | İki butonla `&&`, `\\|\\|` ve `!` programını dene, `switch` programına `case 0` ekle. |\n| 3 | Debounce ve kenar algılama | ~25 dk | Düşen kenarı yakala, basılı tutunca LED'in bir kez değiştiğini doğrula, bekleme süresiyle oyna. |\n| 4 | Serial Monitor: yazdır, oku, ayrıştır | ~25 dk | Buton durumunu yazdır, `A` ve `K` komutlarıyla LED'i uzaktan yönet, `B3` komutuyla yanıp söndür. |\n| 5 | Proje: Kapı zili ve basış sayacı | ~35 dk | Planı tabloya yaz, devreyi kur, programı çalıştır, `S` ve `R` komutlarını dene, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Hafta 1'in bilgileri gerekir. Başlamadan önce şunlara bak:\n- `setup()`, `loop()`, `pinMode`, `digitalWrite` ve `delay` ile LED yakıp söndürebiliyor mu? (Hafta 1, ders 3)\n- LED için seri direncin neden gerektiğini söyleyebiliyor mu? (Hafta 1, ders 2)\n- `for` döngüsü ve dizilerle bir LED grubunu sürebiliyor mu? (Hafta 1, ders 4)\n- Laboratuvarda parça ekleyip kablo çekmeyi ve butonun \"Basılı\" özelliğini değiştirmeyi biliyor mu?\n\nEksik varsa ilgili Hafta 1 anlatımına dönülür.\n\n### Kavram haritası\n- **Giriş:** pin → `INPUT_PULLUP` → yüzen giriş sorunu → `digitalRead` → basılı = LOW\n- **Karar:** koşul → `if` / `else if` / `else` → `==` ve `=` farkı → `switch`, `case`, `break`\n- **Mantık:** `bool` → `&&`, `||`, `!` → doğruluk tablosu\n- **Zaman ve olay:** sıçrama → seviye ve kenar → önceki durum değişkeni → debounce\n- **Haberleşme:** `Serial.begin` ve baud → `print` / `println` → `available` / `read` → `parseInt`\n- **Proje:** plan tablosu → durum değişkenleri (`sayac`, `onceki`) → `sayac++` → sessiz mod\n\n### Sık yapılan hatalar\n- **`INPUT_PULLUP` yerine `INPUT` yazmak.** Pin yüzer ve okuma rastgele olur.\n- **Basılı = HIGH sanmak.** `INPUT_PULLUP` ile basılı olan LOW'dur.\n- **`==` yerine `=` yazmak.** `if (durum = LOW)` koşulu hep yanlış olur ve program sessizce hatalı çalışır.\n- **`switch` içinde `break` unutmak.** Program bir sonraki `case`'in koduna da akar.\n- **`onceki = simdi;` satırını unutmak.** Kart aynı kenarı her turda yeniden görür.\n- **Kenar yerine seviye kullanmak.** Butonu basılı tutunca sayaç ya da LED sürekli değişir.\n- **`'A'` yerine `\"A\"` ya da `'a'` yazmak.** Tek ve çift tırnak farklıdır; büyük ve küçük harf de farklıdır.\n- **Sayıyı `read()` ile okumak.** Rakamın değerini değil karakter kodunu alırsın; `parseInt()` kullan.\n- **Sayacı `loop()` içinde tanımlamak.** Her turda 0'a döner ve hiç artmaz.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. İki butonlu bir devre kur ve `&&`, `||`, `!` için kendi doğruluk tablonu çıkar; sonucu laboratuvarda doğrula.\n4. Debounce'lu aç-kapa programını bakmadan sıfırdan yaz. Sonra \"bırakınca\" ters dönen sürümünü yaz.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Seviye ile kenar arasındaki fark nedir ve sayaçta hangisi lazım?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Kapı zili ve basış sayacı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Buton ya da buzzer yanlış bağlı, GND eksik | Zil butonu D2-GND, LED dirençli, aktif buzzer D8-GND doğru | İsteğe bağlı sessiz buton da bağlı ve düzenli |\n| Plan | Tablo yok | İşleri ve hangi dersten geldiğini gösteren tablo var | Tablo kodla birebir uyuyor ve açıklanmış |\n| Basış sayma | Basılı tutunca ya da sıçramada sayaç yanlış artıyor | Her basış tam bir kez sayılıyor | Kenar algılama ve debounce'u kendi cümleleriyle açıklıyor |\n| Seri iletişim | Hiçbir şey yazmıyor | `Zil: N` yazıyor, `S` ve `R` komutları çalışıyor | Yeni bir komut ekliyor (örneğin `T`) |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta kartın dış dünyayı \"duymasıdır\". Öğrencinin kafası en çok \"basınca neden LOW?\" ve \"neden bir basış birden çok sayılabilir?\" sorularında karışır; bunlar normal ve öğreticidir.\n- **Nasıl destek olunur?** Cevabı söylemek yerine sor: \"Butona basmadığında pin kaç volt?\", \"Kod bir önceki durumu nerede saklıyor?\", \"Seri monitörde ne görüyorsun?\" Seri monitör, ne olduğunu gözle görmenin en iyi yoludur.\n- **Sıçrama.** Laboratuvardaki buton temiz sinyal verir; öğrenci sıçramayı ekranda göremeyebilir. Gerçek bir butona geçildiğinde sorun ortaya çıkacağı için debounce'u yine de öğrenmek gerekir.\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Debounce ve seri iletişim dersleri yoğundur; gerekirse bir günde yalnız birini yapın.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kart kullanılacaksa butonlar yalnızca düşük gerilimli hatlara bağlanır; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "digitalRead, buton, INPUT_PULLUP",
          "durationMin": 20,
          "problem": "Şimdiye kadar kart hep konuştu: LED'i yaktı, söndürdü. Peki kart seni nasıl dinler? Bir butona bastığını nereden anlar? Bu derste kartın \"kulağı\" olan `digitalRead` ile tanışacaksın. Küçük bir sürpriz de var: butona basınca pin neden LOW olur?",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Buton | Bir ucu **D2**, öbür ucu **GND** |\n| İkinci buton | Bir ucu **D3**, öbür ucu **GND** |\n| LED (kırmızı) + 330 Ω direnç | Direncin bir ucu **D13**, öbür ucu LED anodu; LED katodu GND |\n| LED (sarı) + 330 Ω direnç | Direncin bir ucu **D12**, öbür ucu LED anodu; LED katodu GND |\n\nLaboratuvardaki butonun iki ucu vardır (A ve B). Butonu seçip sağ panelden **Basılı** özelliğini açarsan basılmış olur; butona basılı tutarak da basabilirsin. Çalışırken de değiştirebilirsin.\n\nBazı gerçek butonlar ve eğim anahtarları da aynı mantıkla çalışır: iki ucu vardır, kapanınca iki ucu birleşir. Kart hepsini aynı görür. Bu derste D3'teki ikinci giriş için laboratuvardaki ikinci butonu kullan. Kodda \"eğim anahtarı\" diye geçen D3 girişi senin için bu ikinci butondur.\n\nLaboratuvar etkinliğini bu sayfanın altındaki bölümde yapacaksın; ▶'e basınca program çalışır.\n\n### Dijital giriş nedir?\nBir pin iki şekilde çalışabilir:\n- `OUTPUT`: Kart pini kendisi sürer. `digitalWrite` ile HIGH ya da LOW yazarsın.\n- `INPUT`: Kart pini sadece dinler. `digitalRead` ile okursun; sonuç `HIGH` ya da `LOW` gelir.\n\nButon basılınca pini GND'ye bağlar. Peki basılmamışken pin neyle bağlıdır? Hiçbir şeyle. Boşta kalan bir giriş pini (yüzen giriş) gerçek devrede çevreden elektrik gürültüsü toplar ve rastgele HIGH, LOW okunur. Laboratuvar bunu modeller: bağlantısız bir giriş için uyarı çıkar. Bunu önlemek için pini bir gerilime \"çekmek\" gerekir.\n\n### INPUT_PULLUP\nArduino'nun her giriş pininin içinde, istersen devreye alabileceğin bir direnç vardır (yaklaşık 20-50 kΩ). Bu direnç pini 5 V'a doğru çeker. Buna **pull-up** (yukarı çekme) denir.\n\n```cpp\npinMode(2, INPUT_PULLUP);\n```\n\nSonuç şöyle olur:\n| Buton | Pin gerilimi | digitalRead |\n|---|---|---|\n| Basılı değil | İç direnç 5 V'a çeker | `HIGH` (1) |\n| Basılı | Buton pini GND'ye bağlar | `LOW` (0) |\n\nYani **basılı = LOW**. Ters gibi görünür ama bu derste bütün butonlar böyle çalışır. Dışarıdan ek direnç gerekmez, devre sade kalır.\n\n### Program\nÖnce okuduğun değeri doğrudan LED'e yazalım.\n\n```cpp\n// sketch: buton_led\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);   // D2 giriş, iç pull-up açık\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  int durum = digitalRead(2); // HIGH (1) ya da LOW (0)\n  digitalWrite(13, durum);    // okuduğunu LED'e yaz\n}\n```\n\n▶'e bas ve dikkat et: LED butona basmadan yanık, basınca sönüyor. Beklediğinin tersi! Sebebi yukarıdaki tablo: basılı değilken pin HIGH, LED'e HIGH yazıyoruz.\n\nDüzeltmek için değeri ters çevirelim. `HIGH` 1'e, `LOW` 0'a eşittir. `1 - durum` işlemi 1'i 0, 0'ı 1 yapar:\n\n```cpp\n// sketch: buton_led_duz\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  int durum = digitalRead(2);\n  digitalWrite(13, 1 - durum);  // basılıyken (0) LED'e 1 yaz\n}\n```\n\nArtık basınca LED yanar. Bir sonraki derste bunu `if` ile çok daha okunaklı yazacaksın.\n\nİki girişi birden okuyalım: D2'deki buton kırmızı LED'i, D3'teki ikinci buton sarı LED'i yaksın.\n\n```cpp\n// sketch: iki_giris\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);   // buton\n  pinMode(3, INPUT_PULLUP);   // eğim anahtarı\n  pinMode(13, OUTPUT);        // kırmızı LED\n  pinMode(12, OUTPUT);        // sarı LED\n}\n\nvoid loop() {\n  digitalWrite(13, 1 - digitalRead(2));\n  digitalWrite(12, 1 - digitalRead(3));\n}\n```\n\n### Nasıl çalışıyor?\n1. `pinMode(2, INPUT_PULLUP)` pini giriş yapar ve iç pull-up direncini açar.\n2. `digitalRead(2)` pindeki gerilime bakar: yaklaşık 5 V ise `HIGH`, yaklaşık 0 V ise `LOW` verir.\n3. `loop()` saniyede binlerce kez döner; yani kart butonu sürekli kontrol eder.\n4. İkinci buton da aynı şekilde pini GND'ye bağlar; kart iki butonu ayırt edemez ve etmesine gerek de yoktur.\n\n### Dene\n- `1 - durum` yerine `durum` yaz, sonra tekrar düzelt. Hangisinde LED basılı tutarken yanıyor?\n- İkinci butonun **Basılı** özelliğini aç ve kapat. Hangi durumda sarı LED yanıyor?\n- `INPUT_PULLUP` yerine `INPUT` yazıp butona basmadan LED'e bak. Ne olur? (Bu bir deneydir, laboratuvarda zarar vermez. Sonra eski haline getir.)\n\n### Sık yapılan hatalar\n- `pinMode`'u yazmamak ya da `INPUT` yazıp bırakmak: pin yüzer, LED rastgele titreşir.\n- Butonu pin ile 5 V arasına bağlamak: bu derste buton her zaman pin ile **GND** arasındadır.\n- \"Basılı = HIGH\" sanmak: `INPUT_PULLUP` ile basılı olan LOW'dur.\n- Butonun iki ucunu aynı düğüme (örneğin ikisini de GND'ye) bağlamak: buton hiçbir şeyi değiştirmez. Bir ucu pine, öbür ucu GND'ye gitmeli.",
          "question": "Boşta kalan bir pin neden rastgele değer okur? Gündelik hayattan benzer bir durum bulabilir misin (ör. kimse konuşmazken bile mikrofonda çıkan hışırtı)?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir pini giriş yapmayı ve `digitalRead` ile okumayı\n- **Yüzen giriş** denen sorunu ve neden rastgele okuma verdiğini\n- `INPUT_PULLUP` ile butonu yalnızca iki kabloyla (pin ve GND) okumayı\n- \"Basılı = LOW\" ters mantığını yorumlamayı\n\n### Önceden bilmen gerekenler\nDers 1'den `setup()`, `loop()`, HIGH ve LOW; ders 2'den Ohm yasası (V = I × R); ders 3'ten `pinMode`, `digitalWrite` ve kapalı devre.\n\n### Kart artık dinliyor\nŞimdiye kadar pinler hep **çıkıştı**: kart pine HIGH ya da LOW yazdı. Bir buton için tersini isteriz: dışarıdan gelen gerilimi kart **okusun**. Bunun için pin giriş olur ve `digitalRead(pin)` pindeki gerilime bakıp `HIGH` ya da `LOW` döndürür. Laboratuvar modelinde eşik 2,5 V'tur: bunun üstü HIGH, altı LOW sayılır.\n\n### Yüzen giriş\nButonun bir ucunu D2'ye, öbür ucunu GND'ye bağladın. Buton açıkken D2 hiçbir şeye bağlı değildir. Böyle boşta kalan pine **yüzen giriş** denir. Gerçek devrede çevredeki elektrik gürültüsü onu bazen HIGH, bazen LOW gösterir; okuma rastgele olur. Laboratuvar da bağlantısız giriş için uyarı verir. Çözüm: pini açıkken bilinen bir gerilime \"çekmek\".\n\n### Pull-up direnci\nUno'nun her giriş pininin içinde isteğe bağlı bir direnç vardır. `INPUT_PULLUP` bunu devreye alır ve pini 5 V'a doğru çeker. Laboratuvar modelinde bu direnç 35 kΩ'dur.\n\n```\n5 V ──[ iç pull-up, 35 kΩ ]──┬── D2 (digitalRead buradan bakar)\n                             │\n                          [ BUTON ]\n                             │\n                            GND\n```\n\nDurum tablosu:\n\n| Buton | D2'nin gerilimi | digitalRead(2) |\n|---|---|---|\n| Basılı değil | 5 V (iç direnç çeker) | HIGH |\n| Basılı | yaklaşık 0 V (GND'ye bağlanır) | LOW |\n\nButon basılıyken 5 V'tan GND'ye iç direnç üzerinden küçük bir akım akar: 5 V ÷ 35 000 Ω ≈ 0,14 mA. Bu çok küçüktür, kimseyi yormaz. Ohm yasasını burada da kullandın.\n\n### Ters mantık\n`INPUT_PULLUP` ile **basılı = LOW**'dur. İlk başta tersine gelir, ama dış direnç gerektirmediği için devreyi sadeleştirir. `digitalRead` sonucunu doğrudan bir LED'e yazarsan LED basmadığında yanar. HIGH = 1 ve LOW = 0 olduğundan `1 - durum` işlemi değeri ters çevirir: 1 olan 0, 0 olan 1 olur. Bir sonraki derste bunu `if` ile daha okunaklı yazacaksın.\n\nÖzetle okuma kalıbı üç adımdır: `setup()` içinde `pinMode(pin, INPUT_PULLUP)`, `loop()` içinde `digitalRead(pin)`, sonra sonucu yorumlamak.\n\n### Özet\nGiriş pinleri çıkış pinlerinin tersine gerilimi okur. Boşta kalan pin yüzer ve rastgele okunur; `INPUT_PULLUP` pini iç dirençle 5 V'a çekerek bunu önler. Buton pini GND'ye bağladığı için basılı olan LOW, basılı olmayan HIGH okunur.",
          "concepts": [
            {
              "term": "digitalRead()",
              "definition": "Giriş yapılmış bir pindeki gerilime bakar ve HIGH (yaklaşık 5 V) ya da LOW (yaklaşık 0 V) döndürür.",
              "example": "int durum = digitalRead(2); komutu D2'nin o anki değerini durum değişkenine koyar.",
              "pitfall": "Pini setup() içinde giriş yapmadan okumak ya da sonucu hiç kullanmadan çağırmak."
            },
            {
              "term": "INPUT_PULLUP",
              "definition": "Pini giriş yapar ve kartın içindeki direnci devreye alıp pini 5 V'a doğru çeker; dış direnç gerekmez.",
              "example": "pinMode(2, INPUT_PULLUP); yazıp butonun bir ucunu D2'ye, öbürünü GND'ye bağlarsın.",
              "pitfall": "Yalnızca INPUT yazmak: pin yüzer ve okuma rastgele olur."
            },
            {
              "term": "Yüzen giriş",
              "definition": "Hiçbir gerilime bağlı olmayan giriş pini; çevre gürültüsünü toplar ve kararsız okunur.",
              "example": "Butonu D2'ye bağladın ama pull-up yok; buton açıkken digitalRead bir HIGH bir LOW verir.",
              "pitfall": "Okumanın rastgele çıkmasını kod hatası sanmak; sorun çoğunlukla devrededir."
            },
            {
              "term": "Ters mantık (basılı = LOW)",
              "definition": "INPUT_PULLUP ile buton GND'ye bağlandığından basılınca LOW, basılmayınca HIGH okunur.",
              "example": "Basılı değilken digitalRead(2) HIGH'dır; LED'in butonla yanması için 1 - durum yazarsın.",
              "pitfall": "Basılınca HIGH beklemek; program tam tersi çalışır."
            },
            {
              "term": "Eşik gerilimi",
              "definition": "Pinin HIGH mı LOW mu sayılacağını belirleyen gerilim sınırı. Laboratuvarda 2,5 V'tur.",
              "example": "Pin 4,9 V ise HIGH, 0,1 V ise LOW okunur.",
              "pitfall": "Dijital girişin ara değerleri de ölçtüğünü sanmak; digitalRead yalnız iki sonuç verir."
            }
          ],
          "quiz": [
            {
              "id": "m3h2d6-q1",
              "kind": "mcq",
              "prompt": "Butonun bir ucu D2'ye, öbür ucu GND'ye bağlı ve kodda pinMode(2, INPUT_PULLUP); yazıyor. Buton basılı DEĞİLKEN digitalRead(2) ne döndürür?",
              "options": [
                "LOW",
                "HIGH",
                "Rastgele bir değer",
                "-1"
              ],
              "answer": 1,
              "explanation": "İç pull-up direnci pini 5 V'a çeker, buton açıkken pin başka bir şeye bağlı olmadığı için HIGH okunur. LOW ancak buton pini GND'ye bağlayınca gelir. Rastgele okuma pull-up olmayan yüzen girişte görülür.",
              "skills": [
                "digital-in"
              ]
            },
            {
              "id": "m3h2d6-q2",
              "kind": "predict-output",
              "prompt": "Buton D2 ile GND arasında, iki LED (D13 ve D12) uygun dirençlerle bağlı. Buton basılı DEĞİLKEN hangi LED yanar?\n\n```\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n  pinMode(12, OUTPUT);\n}\n\nvoid loop() {\n  int d = digitalRead(2);\n  digitalWrite(13, d);\n  digitalWrite(12, 1 - d);\n}\n```",
              "options": [
                "Yalnız D13'teki LED",
                "Yalnız D12'deki LED",
                "İkisi de",
                "İkisi de sönük"
              ],
              "answer": 0,
              "explanation": "Basılı değilken d = HIGH = 1 olur. D13'e 1 yazılır (yanar), D12'ye 1 - 1 = 0 yazılır (söner). Butona basınca d = 0 olur ve durum tersine döner: D12 yanar, D13 söner. İki LED hiçbir zaman birlikte yanmaz çünkü biri d'yi, öbürü d'nin tersini alır.",
              "skills": [
                "digital-in",
                "digital-out"
              ]
            },
            {
              "id": "m3h2d6-q3",
              "kind": "find-bug",
              "prompt": "Buton D2 ile GND arasına doğru bağlı, LED D13'te. Butona dokunmasan bile LED rastgele yanıp sönüyor. Hatalı satır hangisi?\n\n```\nvoid setup() {\n  pinMode(2, INPUT);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, 1 - digitalRead(2));\n}\n```",
              "options": [
                "pinMode(13, OUTPUT);",
                "pinMode(2, INPUT);",
                "digitalWrite(13, 1 - digitalRead(2));",
                "void loop() {"
              ],
              "answer": 1,
              "explanation": "pinMode(2, INPUT) pull-up'ı açmaz; buton açıkken D2 yüzen girişe döner ve rastgele okunur. INPUT_PULLUP yazılmalı. 1 - digitalRead(2) ifadesi hatalı değildir, yalnızca değeri ters çevirir.",
              "skills": [
                "digital-in",
                "prog-debug"
              ]
            },
            {
              "id": "m3h2d6-q4",
              "kind": "numeric",
              "prompt": "Laboratuvar modelinde iç pull-up direnci 35 kΩ. Buton basılı ve pin GND'ye bağlı olsun (butonun direncini yok say). 5 V'tan bu direnç üzerinden GND'ye kaç mA akım akar? (Üç ondalık basamağa kadar yaz.)",
              "answer": 0.143,
              "tolerance": 0.005,
              "unit": "mA",
              "explanation": "Ohm yasası: I = V / R = 5 / 35 000 ≈ 0,000143 A = 0,143 mA. Akımı mA'e çevirmek için 1000 ile çarpmayı unutma. Bu akım çok küçük olduğundan buton basılıyken bile sorun çıkmaz.",
              "skills": [
                "elec-ohm",
                "digital-in"
              ]
            },
            {
              "id": "m3h2d6-q5",
              "kind": "mcq",
              "prompt": "Yüzen giriş nedir?",
              "options": [
                "Pinden fazla akım çekilmesi",
                "Butonun mekanik olarak kırılması",
                "Pinin hiçbir gerilime bağlı olmaması ve bu yüzden okumasının rastgele değişmesi",
                "Pinin sürekli LOW kalması"
              ],
              "answer": 2,
              "explanation": "Yüzen girişte pin ne 5 V'a ne GND'ye bağlıdır; çevre gürültüsü okumayı rastgele HIGH ya da LOW yapar. INPUT_PULLUP bu yüzden kullanılır. Pinin hep LOW kalması ise pinin GND'ye bağlı olduğu anlamına gelir.",
              "skills": [
                "digital-in",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "if/else, switch, mantık işleçleri",
          "durationMin": 22,
          "problem": "Kapıda zil çalınca ne olur? Biri butona basarsa ışık yanar. Ama ya kimse yoksa? Ya iki kişi aynı anda basarsa? Kart karar vermeyi nasıl öğrenir? Bu derste programına \"eğer ... ise ... değilse ...\" diyebilmeyi öğreneceksin.",
          "contentMd": "### Devre\nGeçen dersteki devrenin aynısı; yalnız bir LED daha ekliyoruz. Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Buton | Bir ucu **D2**, öbür ucu **GND** |\n| İkinci buton | Bir ucu **D3**, öbür ucu **GND** |\n| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |\n| LED (sarı) + 330 Ω direnç | **D12** → direnç → LED anodu; katot GND |\n| LED (yeşil) + 330 Ω direnç | **D11** → direnç → LED anodu; katot GND |\n\nD3'teki ikinci buton, kodda \"eğim anahtarı\" diye geçen girişi temsil eder; laboratuvarda eğim anahtarı olmadığı için butonla çalışırız. Kart için fark yoktur.\n\n### if ve else\n`if` bir koşula bakar. Koşul doğruysa süslü parantez içindeki kodu çalıştırır. `else` ise koşul doğru değilse çalışır.\n\n```cpp\n// sketch: if_else\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(2) == LOW) {   // buton basılı mı?\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(13, LOW);\n  }\n}\n```\n\nGeçen dersteki `1 - durum` hilesinden çok daha okunaklı: \"Eğer D2 LOW ise LED'i yak, değilse söndür\".\n\nDikkat: karşılaştırma için **iki** eşittir (`==`) kullanılır. Tek `=` bir değer atar, karşılaştırmaz.\n\nBirden fazla ihtimal varsa `else if` ekleyebilirsin:\n\n```cpp\nif (digitalRead(2) == LOW) {\n  // buton basılı\n} else if (digitalRead(3) == LOW) {\n  // buton basılı değil ama ikinci buton basılı\n} else {\n  // ikisi de açık\n}\n```\n\nZincir yukarıdan aşağı sırayla bakar ve ilk doğru olanı çalıştırır, gerisine bakmaz.\n\n### Karşılaştırma işleçleri\n| İşleç | Anlamı |\n|---|---|\n| `==` | eşit mi? |\n| `!=` | eşit değil mi? |\n| `<` `>` | küçük mü, büyük mü? |\n| `<=` `>=` | küçük eşit mi, büyük eşit mi? |\n\n### Mantık işleçleri\nBirden fazla koşulu birleştirmek için:\n| İşleç | Okunuşu | Doğru olur, eğer... |\n|---|---|---|\n| `&&` | ve | iki koşul da doğruysa |\n| `\\|\\|` | veya | en az biri doğruysa |\n| `!` | değil | koşul doğru DEĞİLSE |\n\nAşağıdaki programda üç LED üç farklı mantık gösteriyor:\n\n```cpp\n// sketch: mantik\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(3, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n  pinMode(12, OUTPUT);\n  pinMode(11, OUTPUT);\n}\n\nvoid loop() {\n  bool buton = (digitalRead(2) == LOW);   // true: buton basılı\n  bool egim  = (digitalRead(3) == LOW);   // true: eğim anahtarı kapalı\n\n  digitalWrite(13, buton && egim);        // kırmızı: ikisi birden\n  digitalWrite(12, buton || egim);        // sarı: en az biri\n  digitalWrite(11, !egim);                // yeşil: eğim anahtarı kapalı değil\n}\n```\n\n`bool` iki değerli bir değişkendir: `true` (doğru) ya da `false` (yanlış). `digitalWrite`, `true`'yu HIGH, `false`'u LOW olarak anlar.\n\n### switch\nBir sayıya göre birçok yola ayrılacaksan `switch` daha derli toplu olur. Aşağıda iki butonun durumunu tek bir sayıya çeviriyoruz: birinci buton 1, ikinci buton 2 puan veriyor.\n\n```cpp\n// sketch: switch_durum\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(3, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n  pinMode(12, OUTPUT);\n  pinMode(11, OUTPUT);\n}\n\nvoid loop() {\n  int kod = 0;\n  if (digitalRead(2) == LOW) {\n    kod = kod + 1;\n  }\n  if (digitalRead(3) == LOW) {\n    kod = kod + 2;\n  }\n\n  switch (kod) {\n    case 1:                      // yalnız buton\n      digitalWrite(13, HIGH);\n      digitalWrite(12, LOW);\n      digitalWrite(11, LOW);\n      break;\n    case 2:                      // yalnız eğim anahtarı\n      digitalWrite(13, LOW);\n      digitalWrite(12, HIGH);\n      digitalWrite(11, LOW);\n      break;\n    case 3:                      // ikisi birden\n      digitalWrite(13, LOW);\n      digitalWrite(12, LOW);\n      digitalWrite(11, HIGH);\n      break;\n    default:                     // hiçbiri (kod = 0)\n      digitalWrite(13, LOW);\n      digitalWrite(12, LOW);\n      digitalWrite(11, LOW);\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `if` koşulu parantez içinde değerlendirilir; doğruysa `{ }` içi çalışır.\n2. `buton && egim` yalnız iki taraf da doğruysa doğrudur; `buton || egim` en az biri doğruysa doğrudur.\n3. `switch (kod)` kodun değerine bakar ve uyan `case` satırına atlar.\n4. `break` switch'ten çıkar. Unutursan program bir sonraki `case`'e de akar.\n5. `default`, hiçbir `case` uymazsa çalışır.\n\n### Dene\n- `mantik` programında sarı LED'in koşulunu `||` yerine `&&` yap. Sarı LED ile kırmızı LED arasında fark kalır mı?\n- `switch_durum` programına `case 0:` ekleyip hiçbir şey basılı değilken yeşil LED'i yaktır.\n- `switch_durum` programında `case 3:` için üç LED'in hepsini yak.\n- `case 1:` ve `case 2:` satırlarındaki `break;` ifadelerini sil ve ne olduğunu gözle.\n\n### Sık yapılan hatalar\n- `if (x = 5)` yazmak: bu bir atamadır. Karşılaştırma için `==` kullan.\n- `&&` yerine tek `&` yazmak: tek `&` başka bir işlemdir (bit işlemi), şimdilik kullanma.\n- `if (...);` gibi parantezin ardına `;` koymak: `if` boş bir iş yapıp biter, süslü parantezin içi her zaman çalışır.\n- `switch` içinde `break` unutmak: program sonraki `case`'in kodunu da çalıştırır.",
          "question": "Evinizdeki bir kapı ya da alarm düşünün. Hangi durumlarda \"ve\", hangilerinde \"veya\" mantığıyla çalışıyor olabilir? Örnek: asansör kapısı hem kapalı hem de bir düğmeye basılmışsa mı harekete geçer?",
          "explainerMd": "### Bu derste öğreneceklerin\n- `if`, `else if` ve `else` ile programa karar verdirmeyi\n- Karşılaştırma (`==`, `!=`, `<`, `>`) ile atama (`=`) arasındaki farkı\n- `&&`, `||` ve `!` ile birden çok koşulu birleştirmeyi\n- `switch`, `case` ve `break` ile çok yollu seçimi\n\n### Önceden bilmen gerekenler\nDers 6'dan `digitalRead`, `INPUT_PULLUP` ve \"basılı = LOW\"; ders 3'ten `digitalWrite`; ders 1'den `loop()`.\n\n### Program karar verir\nŞimdiye kadar programın her satırı sırayla, koşulsuz çalıştı. Gerçek işlerde ise \"eğer buton basılıysa LED'i yak, değilse söndür\" gibi seçimler gerekir. Bunu **if** ile yaparsın: koşul doğruysa `{ }` içindeki kod çalışır, değilse `else` bölümü çalışır.\n\n```\nif (digitalRead(2) == LOW) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}\n```\n\nÜç ya da daha fazla ihtimal varsa araya `else if` eklenir. Zincir yukarıdan aşağı bakar, **ilk doğru** koşulun kodunu çalıştırır ve gerisine hiç bakmaz. Bu yüzden koşulların sırası önemlidir: `x > 3` önce yazılırsa `x > 5` koşuluna hiç sıra gelmez.\n\n### Karşılaştırma ve atama\nKoşul içinde değerleri karşılaştırırsın: `==` eşit mi, `!=` eşit değil mi, `<`, `>`, `<=`, `>=`. En sık hata, `==` yerine tek `=` yazmaktır. Tek `=` bir **atamadır**: sağdaki değeri değişkene koyar ve o değerin kendisini sonuç olarak verir. `if (durum = LOW)` yazarsan durum her seferinde 0 olur, koşul hep yanlış sayılır ve program sessizce hatalı çalışır.\n\n### Mantık işleçleri\nİki koşulu birleştirmek için mantık işleçleri vardır. İki durum bilgisi `a` ve `b` olsun (örneğin iki butonun basılı olup olmadığı). Bunlar **bool** türünde, yani yalnız `true` ya da `false` tutan değişkenlerdir.\n\n| a | b | a && b (ve) | a \\|\\| b (veya) | !a (değil) |\n|---|---|---|---|---|\n| false | false | false | false | true |\n| false | true | false | true | true |\n| true | false | false | true | false |\n| true | true | true | true | false |\n\n`&&` yalnız iki taraf da doğruysa, `||` en az biri doğruysa doğrudur. `!` doğruyu yanlışa, yanlışı doğruya çevirir. `digitalWrite` bir `bool` değerini kabul eder: true HIGH, false LOW olur.\n\n### switch ile çok yollu seçim\nAynı değişkene göre çok sayıda yola ayrılacaksan `switch` düzenli olur. Önce iki butonun durumunu tek bir sayıya çevirebilirsin: birinci buton 1, ikinci buton 2 puan versin; toplam 0, 1, 2 ya da 3 olur. Sonra `switch (kod)` uygun `case` satırına atlar. Her `case` sonunda **break** gerekir; yoksa program bir sonraki `case`'in kodunu da çalıştırır (buna \"aşağı akma\" denir). Hiçbir `case` uymazsa `default` çalışır.\n\n### Özet\n`if/else if/else` programa karar verdirir; zincirde ilk doğru koşul kazanır. Karşılaştırma için `==`, atama için `=` kullanılır; ikisini karıştırmak sessiz hatalara yol açar. `&&`, `||` ve `!` koşulları birleştirir. `switch` çok yollu seçimi derli toplu yazar ama her `case` sonunda `break` ister.",
          "concepts": [
            {
              "term": "if / else",
              "definition": "Bir koşul doğruysa bir kod bloğunu, değilse öbürünü çalıştırır.",
              "example": "if (digitalRead(2) == LOW) { LED yan } else { LED sön } buton durumuna göre iki yoldan birini seçer.",
              "pitfall": "if (...) satırının sonuna ';' koymak: if boş bir iş yapıp biter, süslü parantezin içi her zaman çalışır."
            },
            {
              "term": "== ve = farkı",
              "definition": "== iki değeri karşılaştırır ve doğru ya da yanlış verir; = sağdaki değeri değişkene atar.",
              "example": "durum == LOW \"durum LOW mu?\" diye sorar, durum = LOW durumu LOW yapar.",
              "pitfall": "if (durum = LOW) yazmak: durum hep 0 olur, koşul hiç doğru çıkmaz."
            },
            {
              "term": "&&, || ve !",
              "definition": "&& iki koşul da doğruysa, || en az biri doğruysa doğrudur; ! koşulun tersini alır.",
              "example": "buton && egim yalnız iki giriş de basılıyken doğru olur.",
              "pitfall": "\"ve\" ile \"veya\" mantığını karıştırmak; ikisi arasındaki fark yalnız tek girişin aktif olduğu durumda ortaya çıkar."
            },
            {
              "term": "bool",
              "definition": "Yalnızca true ya da false tutan değişken türü.",
              "example": "bool basili = (digitalRead(2) == LOW); butonun basılı olup olmadığını saklar.",
              "pitfall": "INPUT_PULLUP ile basılı = LOW olduğunu unutup bool değerini tersine kurmak."
            },
            {
              "term": "switch / case / break",
              "definition": "Bir değişkenin değerine göre uyan case satırına atlayan çok yollu seçim.",
              "example": "switch (kod) { case 1: ... break; case 2: ... break; default: ... } kodun değerine göre yol seçer.",
              "pitfall": "break unutmak: program bir sonraki case'in kodunu da çalıştırır."
            }
          ],
          "quiz": [
            {
              "id": "m3h2d7-q1",
              "kind": "numeric",
              "prompt": "a ve b iki bool değişkendir. (a || b) && !(a && b) ifadesi, a ve b'nin dört olası kombinasyonundan kaç tanesinde doğrudur?",
              "answer": 2,
              "tolerance": 0,
              "explanation": "Dört kombinasyonu tek tek dene: (false,false) için ilk parça false; (false,true) ve (true,false) için a||b true ve a&&b false olduğundan ifade true; (true,true) için a&&b true olduğundan ifade false. Doğru olan 2 kombinasyon vardır: ifade \"tam olarak biri doğru\" demektir.",
              "skills": [
                "prog-logic"
              ]
            },
            {
              "id": "m3h2d7-q2",
              "kind": "predict-output",
              "prompt": "Üç LED (D13, D12, D11) başta sönük. Yalnız D3'teki ikinci buton basılı, yani kod = 2. Bu program çalışınca hangi LED'ler yanık kalır?\n\n```\nswitch (kod) {\n  case 1:\n    digitalWrite(13, HIGH);\n    break;\n  case 2:\n    digitalWrite(12, HIGH);\n  case 3:\n    digitalWrite(11, HIGH);\n    break;\n}\n```",
              "options": [
                "Yalnız D12",
                "D12 ve D11",
                "Yalnız D11",
                "Hiçbiri"
              ],
              "answer": 1,
              "explanation": "case 2 satırına girilir ve D12 yanar. case 2'nin sonunda break yok, bu yüzden program case 3'ün koduna da akar ve D11'i yakar; break orada durdurur. Yalnız D12 yanması için case 2'ye break eklemek gerekirdi.",
              "skills": [
                "prog-conditions",
                "prog-debug"
              ]
            },
            {
              "id": "m3h2d7-q3",
              "kind": "find-bug",
              "prompt": "Buton D2 ile GND arasında (INPUT_PULLUP). Butona bassan da LED hiç yanmıyor. Hatalı satır hangisi?\n\n```\nint durum = digitalRead(2);\nif (durum = LOW) {\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}\n```",
              "options": [
                "digitalWrite(13, HIGH);",
                "int durum = digitalRead(2);",
                "} else {",
                "if (durum = LOW) {"
              ],
              "answer": 3,
              "explanation": "if (durum = LOW) bir karşılaştırma değil atamadır: durum'a 0 koyar ve koşul 0 yani yanlış sayılır. else hep çalışır, LED yanmaz. Doğrusu if (durum == LOW) olmalı. Diğer satırlar doğrudur.",
              "skills": [
                "prog-conditions",
                "prog-debug"
              ]
            },
            {
              "id": "m3h2d7-q4",
              "kind": "mcq",
              "prompt": "Buton D2 ile GND arasında ve pin INPUT_PULLUP. Aşağıdakilerden hangisi \"buton basılı DEĞİL\" anlamına gelir?",
              "options": [
                "digitalRead(2) == LOW",
                "!(digitalRead(2) == HIGH)",
                "digitalRead(2) = HIGH",
                "digitalRead(2) != LOW"
              ],
              "answer": 3,
              "explanation": "Basılı değilken pin HIGH'dır, yani LOW'a eşit değildir: digitalRead(2) != LOW doğrudur. Birinci seçenek butonun basılı olduğunu söyler. İkinci seçenek HIGH olmadığını söyler, yani basılı demektir. Üçüncü seçenek bir atamadır.",
              "skills": [
                "prog-logic",
                "digital-in"
              ]
            },
            {
              "id": "m3h2d7-q5",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca sonuc değişkeni kaç olur?\n\n```\nint x = 7;\nint sonuc = 0;\nif (x > 3) {\n  sonuc = 1;\n} else if (x > 5) {\n  sonuc = 2;\n} else {\n  sonuc = 3;\n}\n```",
              "options": [
                "sonuc = 1",
                "sonuc = 2",
                "sonuc = 3",
                "Önce 1, sonra 2 olur"
              ],
              "answer": 0,
              "explanation": "x = 7 hem x > 3 hem x > 5 koşulunu sağlar, ama zincir ilk doğru koşulda durur. x > 3 ilk sırada olduğu için sonuc = 1 olur ve else if hiç değerlendirilmez. Sonuç 2 isteniyorsa koşulların sırası değiştirilmelidir.",
              "skills": [
                "prog-conditions"
              ]
            }
          ]
        },
        {
          "title": "Debounce ve kenar algılama",
          "durationMin": 25,
          "problem": "Bir butona bir kez bastın ama kart iki, üç kez bastığını sandı. Ya da hiç basmadın sandı. Program hatasız, devre doğru. Peki neden? Cevap butonun içinde: metal temaslar çarpıp zıplar. Bu derste bu \"sıçramayı\" nasıl yakalayacağını öğreneceksin.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Buton | Bir ucu **D2**, öbür ucu **GND** |\n| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |\n\n**Önemli:** Laboratuvardaki buton mükemmel temiz bir sinyal verir; sıçrama modellenmez. Yani bu derste sıçrama sorununu ekranda göremeyeceksin. Aşağıdaki sıçrama anlatımı gerçek butonlar için bir bilgi notudur. Yine de debounce'lu programın laboratuvarda da doğru çalıştığını göreceksin: hedef, \"tek basış, tek işlem\" davranışıdır.\n\nEtkinliği bu sayfanın altındaki bölümde yaparsın.\n\n### Sıçrama (bounce) nedir?\nBir buton kapanırken iki metal parça birbirine çarpar. Parçalar yaylanır; temas birkaç milisaniye boyunca açılıp kapanır. Gözümüz bunu göremez ama kart saniyede binlerce kez okuma yaptığı için görür. Gerçek bir butonda basış şöyle görünür (soldan sağa zamanla):\n\n| | Pindeki değerler |\n|---|---|\n| Beklenen | HIGH, HIGH, HIGH, **LOW**, LOW, LOW, LOW |\n| Gerçek | HIGH, HIGH, **LOW, HIGH, LOW, HIGH**, LOW, LOW, LOW |\n\n\nYani tek bir basış, pinde `HIGH, LOW, HIGH, LOW, ...` gibi kısa bir dizi üretir. Butonun bırakılırken de aynı şey olur. Bu sıçrama genellikle birkaç milisaniye sürer; buton kalitesine göre değişir. Eğim anahtarındaki top sallanırken de temas böyle açılıp kapanır.\n\n### Kenar (edge) nedir?\nButon bir durumdan öbürüne geçerken **kenar** oluşur:\n- HIGH'dan LOW'a geçiş: **düşen kenar** (basıldı).\n- LOW'dan HIGH'a geçiş: **yükselen kenar** (bırakıldı).\n\n\"Buton basılı mı?\" sorusu bir **seviyedir**. \"Buton şimdi mi basıldı?\" sorusu bir **kenardır**. Sayaç ya da aç-kapa anahtarı yapacaksan kenar lazım: basılı tuttuğun sürece bir kez sayılmalı.\n\nKenarı yakalamak için önceki durumu bir değişkende saklayıp şimdikiyle karşılaştırırız.\n\n### Sorunlu program: debounce yok\nLED butona her basışta tersine dönsün (yanıksa sönsün, sönükse yansın):\n\n```cpp\n// sketch: sicrama_var\nint onceki = HIGH;\nint ledDurum = LOW;\n\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  int simdi = digitalRead(2);\n\n  if (onceki == HIGH && simdi == LOW) {   // düşen kenar: basıldı\n    ledDurum = 1 - ledDurum;              // LED'in durumunu ters çevir\n    digitalWrite(13, ledDurum);\n  }\n  onceki = simdi;\n}\n```\n\nMantık doğru görünüyor. Laboratuvarda bu program temiz sinyalle düzgün çalışır. Ama gerçek bir butonda sıçrama yüzünden bir basış bazen iki düşen kenar üretir. LED iki kez ters döner ve sanki hiç basılmamış gibi eski durumunda kalır. Bazen de üç kenar olur ve her şey yolunda gözükür. Sonuç tahmin edilemez.\n\n### Çözüm: debounce\nDebounce (sıçrama giderme), \"değişimi gördüm ama bir süre bekleyip tekrar bakayım, gerçekten değişmiş mi?\" demektir. En basit yol `delay` ile beklemektir.\n\n```cpp\n// sketch: debounce_ms\nint onceki = HIGH;\nint ledDurum = LOW;\n\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  int simdi = digitalRead(2);\n\n  if (simdi != onceki) {            // bir değişiklik var gibi\n    delay(20);                      // sıçrama bitsin diye 20 ms bekle\n    simdi = digitalRead(2);         // sakinleşmiş değeri tekrar oku\n    if (simdi != onceki) {          // değişiklik gerçekmiş\n      if (simdi == LOW) {           // düşen kenar: basıldı\n        ledDurum = 1 - ledDurum;\n        digitalWrite(13, ledDurum);\n      }\n      onceki = simdi;\n    }\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `onceki`, butonun bir önceki turdaki değerini tutar. `simdi` bu turdaki değerdir.\n2. İkisi farklıysa bir kenar var demektir. Ama bu sıçrama olabilir.\n3. 20 ms bekleyince sıçrama biter. Pini tekrar okuyup hâlâ `onceki`'nden farklıysa değişim gerçektir.\n4. Yalnız `LOW`'a geçişte (basış) LED'in durumunu ters çeviririz. Bırakma kenarında hiçbir şey yapmayız.\n5. Butonu basılı tutsan bile `simdi == onceki` olduğu için tekrar tekrar sayılmaz: bir basış, bir işlem.\n6. Bırakırken oluşan sıçrama da aynı kontrolden geçer.\n\n20 ms çoğu buton için yeterlidir. Daha kötü bir buton için 30-50 ms'ye çıkarmak gerekebilir. Çok uzun yaparsan hızlı basışları kaçırırsın.\n\n### Dene\n- `delay(20)` satırını sil ve laboratuvarda yirmi kez bas. Laboratuvarın butonu temiz olduğu için fark görmezsin; gerçek butonlarda farkın neden çıkacağını kendi cümlelerinle anlat.\n- Butonu uzun süre basılı tut. LED'in yalnız bir kez değiştiğini doğrula (kenar algılama).\n- Debounce süresini 1 ms yap, sonra 200 ms yap. İkisinde ne bozuluyor?\n- Programı \"bırakıldığında\" ters çevirecek şekilde değiştir (yükselen kenar).\n\n### Sık yapılan hatalar\n- `onceki = simdi;` satırını unutmak: kart hep aynı kenarı görür.\n- Kenar yerine seviye kullanmak (`if (digitalRead(2) == LOW)` içinde LED'i ters çevirmek): basılı tuttuğun sürece LED çılgın gibi yanıp söner.\n- Debounce'u bırakırken unutmak: basarken düzgün, bırakırken sahte basış alırsın.\n- Çok uzun bir `delay`: bu sürede kart başka bir şeye bakamaz. Bu yüzden süreyi gerektiği kadar kısa tut.",
          "question": "Asansör düğmesine bastığında düğme bir kez yanar, art arda iki üç kez basmışsın gibi davranmaz. Sence içindeki program debounce ve kenar algılamayı nasıl kullanıyor olabilir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Gerçek bir butonun neden **sıçradığını** (bounce) ve bunun hangi hataya yol açtığını\n- **Seviye** ile **kenar** arasındaki farkı\n- Önceki durumu bir değişkende saklayıp düşen kenarı yakalamayı\n- Basit bir **debounce** yöntemiyle \"tek basış, tek işlem\" davranışını elde etmeyi\n\n### Önceden bilmen gerekenler\nDers 6'dan `digitalRead`, `INPUT_PULLUP` ve \"basılı = LOW\"; ders 7'den `if`, `&&` ve `!=`; ders 3'ten `delay` (milisaniye).\n\n### Buton sıçrar\nButon kapanırken içindeki iki metal parça çarpıp yaylanır. Temas bir süre açılıp kapanır ve pin birkaç milisaniye boyunca HIGH ile LOW arasında gidip gelir. Kart saniyede binlerce okuma yaptığı için bunların hepsini görür. Tek bir basış şöyle okunabilir:\n\n```\nBeklenen : HIGH HIGH HIGH LOW  LOW  LOW  LOW\nGerçek   : HIGH HIGH LOW  HIGH LOW  HIGH LOW  LOW\n```\n\nLaboratuvardaki buton temiz sinyal verir, yani sıçrama modellenmez. Burada öğrendiğin yöntem, gerçek bir butona geçtiğinde seni hatadan korur.\n\n### Seviye ve kenar\n\"Buton şu an basılı mı?\" sorusu bir **seviye** sorusudur ve her turda aynı cevabı verir. \"Buton az önce mi basıldı?\" sorusu bir **kenar** sorusudur ve yalnız değişim anında doğrudur:\n\n| Geçiş | Adı | Anlamı (INPUT_PULLUP) |\n|---|---|---|\n| HIGH'dan LOW'a | düşen kenar | butona basıldı |\n| LOW'dan HIGH'a | yükselen kenar | buton bırakıldı |\n\nSayaç ya da aç-kapa anahtarı yapıyorsan seviye değil kenar kullanmalısın. Butonu basılı tutarsan seviye binlerce tur boyunca LOW kalır, ama düşen kenar yalnız bir kez olur.\n\n### Önceki durumu hatırlamak\nKenarı bulmak için iki değer gerekir: şimdiki okuma ve bir önceki turdaki okuma. Önceki değeri `loop()` dışında tanımlı bir değişkende tutarsın; böylece tur bitince silinmez. Her turun sonunda `onceki = simdi;` yazarak değişkeni güncellersin. Bu satır unutulursa kart hep eski değerle karşılaştırır ve aynı kenarı sürekli görür.\n\n```\nif (onceki == HIGH && simdi == LOW) {\n  // düşen kenar: şimdi basıldı\n}\nonceki = simdi;\n```\n\n### Debounce\nSıçrama yüzünden tek basış birden çok düşen kenar üretir. Örneğin üç kenar sayılırsa aç-kapa LED'i üç kez ters döner ve sonuç tahmin edilemez hale gelir. **Debounce**, \"değişimi gördüm ama kısa bir süre bekleyip tekrar bakayım\" yöntemidir: değişiklik fark edilince yaklaşık 20 ms beklenir, pin yeniden okunur ve değişiklik hâlâ duruyorsa gerçek sayılır. Bırakırken oluşan sıçrama da aynı kontrolden geçer.\n\nBekleme süresi bir ödündür. Çok kısa olursa sıçrama bitmeden okursun. Çok uzun olursa (örneğin yarım saniye) hızlı art arda basışları kaçırırsın ve kart bu sürede başka işe bakamaz, çünkü `delay` sırasında hiçbir şey çalışmaz. 20 ile 50 ms çoğu buton için yeterlidir.\n\n### Özet\nGerçek butonlar kapanırken sıçrar ve tek basış birden çok kenar üretebilir. Seviye durumu, kenar ise değişimi anlatır; sayma işleri için düşen kenar gerekir. Önceki durumu bir değişkende saklayarak kenar bulunur, kısa bir bekleme ve ikinci okuma ile de sıçrama ayıklanır.",
          "concepts": [
            {
              "term": "Sıçrama (bounce)",
              "definition": "Buton temaslarının kapanırken birkaç milisaniye açılıp kapanması; pinde kısa bir HIGH-LOW dizisi oluşturur.",
              "example": "Tek bir basışta pin HIGH, LOW, HIGH, LOW, LOW diye okunabilir.",
              "pitfall": "Sıçramayı kod hatası sanmak; program doğru olsa da gerçek butonda sayı yanlış çıkar."
            },
            {
              "term": "Seviye ve kenar",
              "definition": "Seviye pinin o anki değeridir; kenar ise bir değerden diğerine geçiş anıdır.",
              "example": "Buton basılı tutulurken seviye LOW kalır, ama düşen kenar yalnız basıldığı anda olur.",
              "pitfall": "Sayaç için seviye kullanmak: basılı tuttuğun sürece sayaç tekrar tekrar artar."
            },
            {
              "term": "Düşen ve yükselen kenar",
              "definition": "HIGH'dan LOW'a geçiş düşen kenardır; LOW'dan HIGH'a geçiş yükselen kenardır.",
              "example": "INPUT_PULLUP ile düşen kenar basış, yükselen kenar bırakış demektir.",
              "pitfall": "Kenarların yönünü karıştırmak: basışı sayacakken bırakışı saymak."
            },
            {
              "term": "Önceki durum değişkeni",
              "definition": "Bir önceki turdaki okumayı saklayan, loop() dışında tanımlı değişken.",
              "example": "int onceki = HIGH; ve her turun sonunda onceki = simdi; kenarı bulmayı sağlar.",
              "pitfall": "onceki = simdi; satırını unutmak: kart aynı kenarı her turda yeniden görür."
            },
            {
              "term": "Debounce",
              "definition": "Sıçramayı ayıklamak için değişimi görünce kısa süre beklemek ve pini yeniden okumak.",
              "example": "Değişiklikten sonra delay(20) yapıp pini tekrar okumak, sıçrayan geçişleri eler.",
              "pitfall": "Bekleme süresini çok uzun tutmak: hızlı basışlar kaçar ve kart o sürede başka iş yapamaz."
            }
          ],
          "quiz": [
            {
              "id": "m3h2d8-q1",
              "kind": "numeric",
              "prompt": "Debounce kullanmayan bir program her turda pini okuyup düşen kenarları (HIGH'dan LOW'a geçişleri) sayıyor. Gerçek bir butona tek kez basılınca okumalar şu sırada geliyor:\n\nHIGH, LOW, HIGH, LOW, HIGH, LOW, HIGH, LOW, LOW\n\nProgram kaç basış sayar?",
              "answer": 4,
              "tolerance": 0,
              "explanation": "Düşen kenarlar 1. okumadan 2.'ye, 3.'den 4.'ye, 5.'den 6.'ya ve 7.'den 8.'ye geçişlerdir: toplam 4. Oysa kullanıcı yalnız bir kez bastı. Debounce bu sahte kenarları eler.",
              "skills": [
                "input-debounce"
              ]
            },
            {
              "id": "m3h2d8-q2",
              "kind": "mcq",
              "prompt": "INPUT_PULLUP kullanan bir butonla sayaç yapıyorsun. Sayaç, butona basıldığı anda yalnızca bir kez artmalı. Neyi algılamalısın?",
              "options": [
                "Pinin LOW olduğu seviyeyi, her turda",
                "Pinin HIGH olduğu seviyeyi, her turda",
                "Pinin HIGH'dan LOW'a geçtiği düşen kenarı",
                "Pinin LOW'dan HIGH'a geçtiği yükselen kenarı"
              ],
              "answer": 2,
              "explanation": "Basış, HIGH'dan LOW'a geçiş yani düşen kenardır ve yalnız bir kez olur. Seviye seçenekleri basılı tuttuğun sürece her turda doğru çıkar ve sayaç çok artar. Yükselen kenar ise butonun bırakıldığı anı yakalar.",
              "skills": [
                "input-debounce",
                "digital-in"
              ]
            },
            {
              "id": "m3h2d8-q3",
              "kind": "find-bug",
              "prompt": "Buton D2 ile GND arasında (INPUT_PULLUP), LED D13'te. Butona basıp basılı tutunca LED çılgınca yanıp sönüyor; hedef, her basışta bir kez ters dönmesi. Kodda tek hata var. Nedir?\n\n```\nint onceki = HIGH;\nint ledDurum = LOW;\n\nvoid loop() {\n  int simdi = digitalRead(2);\n  if (onceki == HIGH && simdi == LOW) {\n    ledDurum = 1 - ledDurum;\n    digitalWrite(13, ledDurum);\n  }\n}\n```",
              "options": [
                "onceki değişkeni loop() dışında tanımlanmış",
                "Koşuldaki && yerine || olmalı",
                "ledDurum = 1 - ledDurum; satırı yanlış",
                "Döngünün sonunda onceki = simdi; satırı eksik"
              ],
              "answer": 3,
              "explanation": "onceki hiç güncellenmediği için HIGH kalır. Buton basılı tutulduğu sürece her turda onceki == HIGH && simdi == LOW doğru çıkar ve LED her turda ters döner. Döngü sonuna onceki = simdi; eklenince kenar yalnız bir kez görülür. Değişkenin loop() dışında olması doğrudur; aksi halde değer saklanamazdı.",
              "skills": [
                "input-debounce",
                "prog-debug",
                "prog-state"
              ]
            },
            {
              "id": "m3h2d8-q4",
              "kind": "predict-output",
              "prompt": "Buton D2 ile GND arasında (INPUT_PULLUP), LED D13'te ve başta sönük. Bu debounce'lu programda butona basıp bir süre basılı tutuyor, sonra bırakıyorsun. LED ne zaman ters döner?\n\n```\nint onceki = HIGH;\nint ledDurum = LOW;\n\nvoid loop() {\n  int simdi = digitalRead(2);\n  if (simdi != onceki) {\n    delay(20);\n    simdi = digitalRead(2);\n    if (simdi != onceki) {\n      if (simdi == HIGH) {\n        ledDurum = 1 - ledDurum;\n        digitalWrite(13, ledDurum);\n      }\n      onceki = simdi;\n    }\n  }\n}\n```",
              "options": [
                "Butona basıldığı anda",
                "Hem basarken hem bırakırken",
                "Butonun bırakıldığı anda",
                "Hiç değişmez"
              ],
              "answer": 2,
              "explanation": "Ters çevirme yalnız simdi == HIGH iken yani yükselen kenarda (bırakışta) yapılıyor. Basarken onceki güncellenir ama LED'e dokunulmaz. Basılı tutarken de bir şey olmaz; LED yalnız bırakma anında bir kez ters döner.",
              "skills": [
                "input-debounce",
                "prog-conditions"
              ]
            },
            {
              "id": "m3h2d8-q5",
              "kind": "mcq",
              "prompt": "Debounce için kullandığın delay süresini 20 ms yerine 500 ms yaparsan en olası sorun nedir?",
              "options": [
                "Sıçrama daha çok görünür",
                "Hızlı art arda basışlar kaçar ve kart bu sürede başka bir şeye bakamaz",
                "LED hep yanık kalır",
                "Buton daha çabuk bozulur"
              ],
              "answer": 1,
              "explanation": "delay sırasında kart başka hiçbir iş yapmaz. 500 ms boyunca yapılan ikinci basış yakalanamaz. Daha uzun bekleme sıçramayı azaltmaz, tersine sorun çıkarır. LED durumu ve butonun ömrü bekleme süresine bağlı değildir.",
              "skills": [
                "input-debounce",
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Serial Monitor: yazdır, oku, ayrıştır",
          "durationMin": 25,
          "problem": "Şimdiye kadar kartın içinde ne olup bittiğini yalnızca bir LED'in yanıp sönmesinden tahmin ettik. Peki kart sana doğrudan yazı yazsa? \"Butona 3 kez bastın\" dese? Ya sen ona bilgisayardan komut yazabilsen? Seri port bunu mümkün kılar.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Buton | Bir ucu **D2**, öbür ucu **GND** |\n| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |\n\nGerçek bir kart USB kablosuyla bilgisayara bağlıyken aynı kablo üzerinden konuşur. Laboratuvarda bu bağlantı hazırdır: alttaki **Seri monitör** kartın yazdıklarını gösterir ve senin yazdıklarını karta gönderir. ▶'e bas, program çalışırken seri monitörün giriş kutusuna yazıp gönder.\n\n### Seri iletişim\nKart ile bilgisayar, bitleri sırayla (seri) göndererek haberleşir. İki tarafın aynı hızda konuşması gerekir. Bu hıza **baud** denir. Biz hep 9600 baud kullanacağız. Laboratuvar bunu kendisi ayarlar; gerçek bir Serial Monitor'da da aynı hızı seçmek gerekir.\n\n```cpp\nSerial.begin(9600);        // setup() içinde bir kez\nSerial.print(\"merhaba\");   // satır sonu eklemeden yazar\nSerial.println(\"dunya\");   // yazar ve alt satıra geçer\nSerial.println(42);        // sayı da yazabilir\n```\n\nNot: Türkçe harfler (ç, ğ, ı, ö, ş, ü) seri monitörde bozuk görünebilir. Bu yüzden yazdırdığımız metinlerde bu harfleri kullanmıyoruz.\n\n### Yazdır\nButon durumunu yarım saniyede bir yazdıran bir program:\n\n```cpp\n// sketch: seri_yazdir\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  Serial.begin(9600);\n  Serial.println(\"Hazir\");\n}\n\nvoid loop() {\n  int d = digitalRead(2);\n  Serial.print(\"D2 = \");\n  Serial.println(d);\n  delay(500);\n}\n```\n\nSeri monitörde `D2 = 1` satırları akar. Butonun **Basılı** özelliğini açınca ya da butona basılı tutunca `D2 = 0` olur. Basılı = LOW = 0 olduğunu artık gözünle görüyorsun.\n\nHata ayıklamanın en kolay yolu budur: \"Kod şu noktaya geldi mi? Değişken ne değerde?\" sorularına `Serial.print` ile cevap ararsın.\n\n### Oku\nBilgisayardan gelen veri kartta bir tampona (buffer) birikir. `Serial.available()` kaç bayt beklediğini söyler, `Serial.read()` bir bayt okur.\n\n```cpp\n// sketch: seri_komut\nvoid setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {       // gelen veri var mı?\n    char c = Serial.read();           // bir karakter oku\n    if (c == 'A') {\n      digitalWrite(13, HIGH);\n      Serial.println(\"LED acik\");\n    } else if (c == 'K') {\n      digitalWrite(13, LOW);\n      Serial.println(\"LED kapali\");\n    } else {\n      Serial.print(\"Bilinmeyen komut: \");\n      Serial.println(c);\n    }\n  }\n}\n```\n\nSeri monitörün giriş kutusuna `A` yazıp gönder: LED yanar. `K` gönder: söner. `char`, tek bir karakter tutan değişkendir ve tek tırnakla yazılır: `'A'`.\n\n### Ayrıştır\nBazen gelen veri \"komut + sayı\" biçimindedir, örneğin `B3`: \"3 kez yanıp sön\". Veriyi parçalara ayırmaya **ayrıştırma** denir. `Serial.parseInt()` seri porttan gelen sıradaki sayıyı okur ve bir `int` olarak verir.\n\n```cpp\n// sketch: seri_ayristir\nvoid setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n  Serial.println(\"B ve bir sayi yaz, ornek: B3\");\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    char komut = Serial.read();           // ilk karakter: komut\n    if (komut == 'B') {\n      int adet = Serial.parseInt();       // arkasından gelen sayi\n      Serial.print(\"Yanip sonme: \");\n      Serial.println(adet);\n      for (int i = 0; i < adet; i++) {\n        digitalWrite(13, HIGH);\n        delay(200);\n        digitalWrite(13, LOW);\n        delay(200);\n      }\n    }\n  }\n}\n```\n\nSeri monitörde `B3` yazıp gönder: LED 3 kez yanıp söner. Gerçek bir Serial Monitor'da satır sonu ayarı \"Yeni satır\" (Newline) ise gönderdiğin yazının sonuna bir satır sonu karakteri eklenir. Program bu karakteri okur ve `B` olmadığı için yok sayar.\n\nBirden fazla sayıyı da arka arkaya okuyabilirsin. Boşlukla ayrılmış iki sayıyı toplayalım:\n\n```cpp\n// sketch: seri_toplam\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(\"Iki sayi yaz, ornek: 12 30\");\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    int a = Serial.parseInt();\n    int b = Serial.parseInt();\n    Serial.print(\"Toplam: \");\n    Serial.println(a + b);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `Serial.begin(9600)` seri portu açar. Gerçek bir Serial Monitor'ın hızı da 9600 olmalı; yoksa ekranda anlamsız karakterler görürsün. Laboratuvar bunu kendisi eşler.\n2. `Serial.print` yazar, `Serial.println` yazıp satırı bitirir.\n3. `Serial.available()` okunmayı bekleyen bayt sayısını verir. `read()` her çağrıda bir bayt tüketir.\n4. `parseInt()` rakam olmayan karakterleri atlar, sayı bitene kadar okur. Sayıdan sonra veri gelmezse yaklaşık bir saniye bekleyip vazgeçer. Satır sonu göndermek bu beklemeyi kısaltır.\n5. Gelen veri tek seferde birden fazla bayt olabilir; `loop()` yeniden dönerken kalan baytlar tamponda bekler.\n\n### Dene\n- `seri_yazdir` programını butona her basışta değil, yalnızca durum değiştiğinde yazdıracak şekilde değiştir. (Geçen dersteki kenar fikrini kullan.)\n- `seri_komut` programına `'T'` komutu ekle: LED'in o anki durumunu yazdırsın.\n- `seri_ayristir` programında yanıp sönme süresini de komuttan al: `B3 500` gibi.\n\n### Sık yapılan hatalar\n- `Serial.begin` yazmamak: hiçbir şey görünmez.\n- `Serial.begin`'e farklı bir hız yazmak: gerçek bir Serial Monitor'da ekran anlamsız karakterlerle dolar.\n- `if (Serial.available())` yerine doğrudan `read()` çağırmak: veri yokken `-1` döner.\n- `'A'` yerine `\"A\"` yazmak: çift tırnak metin, tek tırnak tek karakterdir. `char` ile tek tırnak kullan.\n- Çok sık ve çok uzun yazdırmak: yazma yavaştır, programı yavaşlatır.",
          "question": "Seri port yalnızca bilgisayarla konuşmak için mi? İki Arduino kartı birbirine sadece iki kabloyla bağlansa (biri yazan, biri dinleyen) birbirine ne tür mesajlar gönderebilirdi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kart ile bilgisayarın seri portla nasıl konuştuğunu ve **baud** hızının anlamını\n- `Serial.print` ve `Serial.println` ile ekrana değer yazdırmayı\n- `Serial.available()` ve `Serial.read()` ile bilgisayardan gelen komutu okumayı\n- `Serial.parseInt()` ile komutun içindeki sayıyı ayıklamayı\n\n### Önceden bilmen gerekenler\nDers 6'dan `digitalRead` ve \"basılı = LOW\"; ders 7'den `if`, `else if` ve `==`; ders 4'ten `for` döngüsü; ders 3'ten `delay`.\n\n### Seri iletişim nedir?\nKart ile bilgisayar USB kablosu üzerinden bitleri **sırayla** (seri) göndererek konuşur. İki tarafın aynı hızda konuşması gerekir; bu hıza **baud** denir. Biz hep 9600 baud kullanıyoruz. Gerçek bir Serial Monitor'da hız farklı seçilirse ekranda anlamsız karakterler görünür. Başlangıçta `setup()` içinde bir kez `Serial.begin(9600);` yazılır.\n\n### Yazdırmak\n`Serial.print(x)` değeri yazar ve imleci aynı satırda bırakır. `Serial.println(x)` yazar ve alt satıra geçer. Metin için çift tırnak, sayı ve değişken için doğrudan değer yazılır. Hata ayıklamanın en kolay yolu budur: \"kod şu noktaya geldi mi, değişken ne değerde?\" sorusunu seri monitörde görürsün.\n\n```\nSerial.print(\"D2 = \");\nSerial.println(digitalRead(2));   // ekranda: D2 = 1\n```\n\nTürkçe harfler (ç, ğ, ı, ö, ş, ü) seri monitörde bozuk görünebileceği için yazdırılan metinlerde kullanılmaz.\n\n### Okumak\nBilgisayardan gelen baytlar kartta bir tampona dizilir. `Serial.available()` okunmayı bekleyen bayt sayısını verir; 0 ise bekleyen bir şey yok demektir. `Serial.read()` tampondan bir bayt çeker. Önce `available()` ile bakmak gerekir; yoksa veri yokken `read()` -1 döndürür.\n\nTek bir karakter `char` türünde saklanır ve **tek tırnakla** yazılır: `'A'`. Çift tırnaklı `\"A\"` bir metindir ve `char` ile karşılaştırılamaz. Büyük ve küçük harf farklı karakterlerdir: `'A'` ile `'a'` eşit değildir.\n\n### Ayrıştırmak\nGelen yazı çoğunlukla \"komut + sayı\" biçimindedir, örneğin `B3`. Bu yazıyı anlamlı parçalara bölmeye **ayrıştırma** denir. Önce `read()` ile komut harfini alırsın, ardından `Serial.parseInt()` sıradaki sayıyı bir `int` olarak okur. Seri monitör \"Yeni satır\" ekliyorsa `B3` aslında üç bayt gönderir:\n\n| Sıra | Karakter | Anlamı |\n|---|---|---|\n| 1 | B | komut |\n| 2 | 3 | sayının rakamı |\n| 3 | satır sonu | gönderimin bittiğini gösterir |\n\nSatır sonu karakteri bir sonraki turda `read()` ile okunur, ama hiçbir komuta uymadığı için yok sayılır. Sayıyı `read()` ile okursan rakamın kendisini değil karakter kodunu alırsın; sayı için `parseInt()` kullan. Sayıdan sonra veri gelmezse `parseInt()` yaklaşık bir saniye bekleyip vazgeçer.\n\n### Özet\nSeri port, kart ile bilgisayar arasındaki iki yönlü konuşmadır ve iki tarafın baud hızı eşit olmalıdır. `print` ve `println` yazdırır, `available` ve `read` gelen komutu okur, `parseInt` ise komuttaki sayıyı ayıklar. Tek karakterler tek tırnakla yazılır ve büyük-küçük harf ayrımı vardır.",
          "concepts": [
            {
              "term": "Serial.begin() ve baud",
              "definition": "Seri portu açar ve haberleşme hızını (baud) belirler. Bu derslerde hep 9600 kullanılır.",
              "example": "setup() içinde Serial.begin(9600); yazılır, monitör de 9600'e ayarlanır.",
              "pitfall": "Kodda ve monitörde farklı hız seçmek: ekran anlamsız karakterlerle dolar."
            },
            {
              "term": "print ve println",
              "definition": "print yazıyı aynı satırda bırakır, println yazar ve alt satıra geçer.",
              "example": "Serial.print(\"D2 = \"); Serial.println(1); ekrana tek satırda D2 = 1 yazar.",
              "pitfall": "Hep print kullanıp tüm çıktıların tek satırda birleşmesine şaşırmak."
            },
            {
              "term": "Serial.available() ve read()",
              "definition": "available() okunmayı bekleyen bayt sayısını verir; read() tampondan bir bayt okur.",
              "example": "if (Serial.available() > 0) { char c = Serial.read(); } önce veri var mı diye bakar.",
              "pitfall": "available() ile bakmadan read() çağırmak: veri yokken -1 döner."
            },
            {
              "term": "char ve tek tırnak",
              "definition": "Tek bir karakteri tutan değişken türü; değeri tek tırnakla yazılır ve büyük-küçük harfe duyarlıdır.",
              "example": "if (c == 'A') komutu yalnız büyük A geldiğinde doğru olur.",
              "pitfall": "'A' yerine \"A\" yazmak ya da küçük 'a' ile karşılaştırıp büyük A beklemek."
            },
            {
              "term": "parseInt()",
              "definition": "Seri porttan gelen sıradaki tam sayıyı okur ve int olarak verir; rakam olmayan karakterleri atlar.",
              "example": "B3 geldiğinde 'B' okunduktan sonra parseInt() 3 döndürür.",
              "pitfall": "Sayıyı read() ile okumak: rakamın değerini değil karakter kodunu alırsın."
            },
            {
              "term": "Ayrıştırma",
              "definition": "Gelen yazıyı komut ve sayı gibi anlamlı parçalara ayırma işi.",
              "example": "B3 yazısında B komutu, 3 yanıp sönme adedidir.",
              "pitfall": "Satır sonu karakterini hesaba katmamak; o da bir bayttır ve okunmayı bekler."
            }
          ],
          "quiz": [
            {
              "id": "m3h2d9-q1",
              "kind": "predict-output",
              "prompt": "Bu program seri monitörde ne gösterir?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  Serial.print(\"A\");\n  Serial.print(\"B\");\n  Serial.println(\"C\");\n  Serial.println(\"D\");\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "Tek satırda ABCD",
                "A, B, C ve D dört ayrı satırda",
                "Birinci satırda ABC, ikinci satırda D",
                "Hiçbir şey yazmaz"
              ],
              "answer": 2,
              "explanation": "print satırı bitirmez: A ve B yazılır, println(\"C\") C'yi aynı satıra ekleyip satırı kapatır (ABC). println(\"D\") yeni satıra D yazar. Dört ayrı satır için hepsinin println olması gerekirdi.",
              "skills": [
                "serial-io"
              ]
            },
            {
              "id": "m3h2d9-q2",
              "kind": "numeric",
              "prompt": "Seri monitörden B4 gönderiliyor (komutun ardından satır sonu geliyor). Program her yanıp sönmede LED'i 150 ms yakıp 100 ms söndürüyor. Yanıp sönme döngüsü kaç milisaniye sürer?\n\n```\nchar komut = Serial.read();\nif (komut == 'B') {\n  int adet = Serial.parseInt();\n  for (int i = 0; i < adet; i++) {\n    digitalWrite(13, HIGH);\n    delay(150);\n    digitalWrite(13, LOW);\n    delay(100);\n  }\n}\n```",
              "answer": 1000,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "parseInt() 4 verir, döngü 4 kez döner. Her tur 150 + 100 = 250 ms sürer. Toplam 4 × 250 = 1000 ms'dir.",
              "skills": [
                "serial-io",
                "prog-timing",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m3h2d9-q3",
              "kind": "find-bug",
              "prompt": "Seri monitörden A gönderince LED yanması gerekiyor ama yanmıyor. Monitör 9600 baud, kablolar doğru. Hatalı satır hangisi?\n\n```\nvoid loop() {\n  if (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == 'a') {\n      digitalWrite(13, HIGH);\n    } else if (c == 'K') {\n      digitalWrite(13, LOW);\n    }\n  }\n}\n```",
              "options": [
                "char c = Serial.read();",
                "if (Serial.available() > 0) {",
                "digitalWrite(13, LOW);",
                "if (c == 'a') {"
              ],
              "answer": 3,
              "explanation": "Büyük ve küçük harf farklı karakterlerdir: gelen 'A' ile 'a' eşit değildir. Koşul if (c == 'A') olmalı. Diğer satırlar doğru: available() ile veri varlığı denetleniyor ve read() tek karakter alıyor.",
              "skills": [
                "serial-io",
                "prog-debug",
                "prog-conditions"
              ]
            },
            {
              "id": "m3h2d9-q4",
              "kind": "mcq",
              "prompt": "Serial.available() değeri 0 ise bunun anlamı nedir?",
              "options": [
                "Seri port açılmamıştır",
                "Son okunan karakter '0' idi",
                "Baud hızı yanlıştır",
                "Okunmayı bekleyen bayt yoktur"
              ],
              "answer": 3,
              "explanation": "available() tamponda okunmayı bekleyen bayt sayısını verir; 0 yalnızca şu an okunacak veri olmadığını söyler. Bu durumda read() çağırmak -1 döndürürdü. Baud hızının yanlış olması ayrı bir sorundur ve bu sayıyı değiştirmez.",
              "skills": [
                "serial-io"
              ]
            },
            {
              "id": "m3h2d9-q5",
              "kind": "mcq",
              "prompt": "Kodda Serial.begin(9600); yazıyor ama gerçek Serial Monitor'da hız 115200 seçili. Ekranda ne görürsün?",
              "options": [
                "Anlamsız karakterler",
                "Hiçbir şey, karta zarar gelir",
                "Yazılar iki kat hızlı akar",
                "Yazılar normal görünür"
              ],
              "answer": 0,
              "explanation": "İki taraf farklı hızda konuşunca baytlar yanlış yorumlanır ve ekranda anlamsız karakterler çıkar. Bu yanlış yapılandırma karta zarar vermez; hızı eşitleyince sorun çözülür. Laboratuvar iki hızı kendisi eşler, gerçek monitörde ise sen eşitlersin.",
              "skills": [
                "serial-io"
              ]
            }
          ]
        },
        {
          "title": "Proje: Kapı zili ve basış sayacı",
          "durationMin": 35,
          "problem": "Kapı zilin çaldığında kaç kişi geldiğini bilmek ister misin? Bu projede basit ama akıllı bir kapı zili yapacaksın: her basışta zil çalar, kaç kez çaldığı sayılır ve Serial Monitor'a yazılır. Üstelik zili sessize alan ikinci bir butonun olacak: onu basılı tutarsan zil susar, ama sayaç saymaya devam eder. Bu haftanın her şeyi bu projede bir araya geliyor.",
          "contentMd": "### Hedef\n- D2'deki zil butonuna her basışta: LED yanar, zil (buzzer) çalar, sayaç bir artar ve `Zil: N` yazılır.\n- Butonu basılı tutmak sayacı tekrar tekrar artırmaz (kenar algılama).\n- Butonun sıçraması sayıyı bozmaz (debounce).\n- D3'teki sessiz butonu basılıyken \"sessiz mod\": LED yanar, buzzer çalmaz. (İsteğe bağlı: etkinlik hedefi değil, bir ek özelliktir.)\n- Seri porttan `S` gönderirsen sayacı yazar, `R` gönderirsen sayacı sıfırlar.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Zil butonu | Bir ucu **D2**, öbür ucu **GND** |\n| Sessiz butonu (isteğe bağlı) | Bir ucu **D3**, öbür ucu **GND** |\n| LED (kırmızı) + 330 Ω direnç | **D13** → direnç → LED anodu; katot GND |\n| Aktif buzzer | Artı (+) bacağı **D8**, eksi (-) bacağı **GND** |\n\nAktif buzzerin içinde kendi ses üreteci vardır: pine HIGH verince öter, LOW verince susar. Buzzer'ın uçları yönlüdür: **+** ucu D8'e, **-** ucu GND'ye gider. Parçayı seçince sağ panelden **Tür**'ü **Aktif** yap (varsayılan pasiftir). Pasif buzzer `digitalWrite` ile ses üretmez. Sesi duymak için üstteki ses düğmesini aç.\n\n### Program\n```cpp\n// sketch: kapi_zili\nint sayac = 0;          // kaç kez çalındı\nint onceki = HIGH;      // butonun bir önceki durumu\n\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);   // zil butonu\n  pinMode(3, INPUT_PULLUP);   // eğim anahtarı\n  pinMode(13, OUTPUT);        // LED\n  pinMode(8, OUTPUT);         // buzzer\n  Serial.begin(9600);\n  Serial.println(\"Kapi zili hazir\");\n}\n\nvoid loop() {\n  // 1) Zil butonu: kenar algılama + debounce\n  int simdi = digitalRead(2);\n  if (simdi != onceki) {\n    delay(20);                       // sıçrama bitsin\n    simdi = digitalRead(2);\n    if (simdi != onceki) {\n      onceki = simdi;\n      if (simdi == LOW) {            // basıldı\n        sayac++;\n        bool sessiz = (digitalRead(3) == LOW);   // eğim anahtarı kapalı mı?\n\n        digitalWrite(13, HIGH);\n        if (!sessiz) {\n          digitalWrite(8, HIGH);\n        }\n        delay(300);                  // zil 300 ms çalsın\n        digitalWrite(13, LOW);\n        digitalWrite(8, LOW);\n\n        Serial.print(\"Zil: \");\n        Serial.println(sayac);\n      }\n    }\n  }\n\n  // 2) Seri komutlar\n  if (Serial.available() > 0) {\n    char komut = Serial.read();\n    if (komut == 'S') {\n      Serial.print(\"Toplam: \");\n      Serial.println(sayac);\n    } else if (komut == 'R') {\n      sayac = 0;\n      Serial.println(\"Sayac sifirlandi\");\n    }\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `sayac` ve `onceki` `loop()`'un dışında tanımlı. Böylece her turda sıfırlanmazlar, değerlerini korurlar.\n2. Buton bölümü, 8. dersteki debounce'lu kenar algılamanın aynısıdır. Yalnızca `simdi == LOW` olan düşen kenarda zil çalar.\n3. `sayac++`, `sayac = sayac + 1` ile aynı işi yapar.\n4. `sessiz` bir `bool`'dur (D3'teki sessiz butonu basılıysa true; kodda yorum olarak \"eğim anahtarı\" yazar, laboratuvarda bu bir butondur). `!sessiz` \"sessiz değilse\" demektir; buzzer yalnız o zaman öter. LED her durumda yanar.\n5. Seri bölümü, 9. dersteki komut okuma kalıbının aynısıdır.\n6. `delay(300)` sırasında kart başka şeye bakmaz. Bu proje için sorun değil, çünkü zil zaten kısa sürüyor. Zil çalarken gelen bir seri komut tamponda bekler ve sonra okunur.\n\n### Dene\n- Zil süresini 100 ms ve 1000 ms yap. Hangisi daha doğal geliyor?\n- Sayaç 10 olunca LED'i üç kez hızlı yaktır (ör. \"10. ziyaretçi!\") ve Serial Monitor'a bir mesaj yazdır.\n- Sessiz butonunu ekle, basılı tutarken zil butonuna bas: sessiz modda sayaç artıyor mu? Seri monitörden `S` göndererek kontrol et.\n- Zili iki \"melodiye\" ayır: tek basışta bir uzun, sayaç çiftse iki kısa öt. (İpucu: `sayac % 2 == 0`, `%` bölümden kalanı verir.)\n\n### Sık yapılan hatalar\n- `sayac`'ı `loop()` içinde tanımlamak: her turda 0'a döner, hiç artmaz.\n- Buzzer'ın + ve - uçlarını ters bağlamak: ses çıkmaz.\n- Buzzer türünü Pasif bırakmak: `digitalWrite` ile ses çıkmaz; ses tonu üretmek için başka bir yöntem gerekir (ilerleyen haftalarda).\n- Debounce'u atlamak: sayaç bazen iki, bazen sıfır artar.\n- `Serial.begin(9600)` yazmayı unutmak: seri monitörde hiçbir şey görünmez.",
          "question": "Bu zil sadece sayıyor. Ziyaretçi sayısına göre ne gibi akıllı özellikler eklenebilir? Mesela belirli saatlerde sessiz mod kendiliğinden devreye girse bunun için karta başka ne lazım olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Büyük bir projeyi **parçalara bölüp** her parçayı ayrı ayrı düşünmeyi\n- Programın hafızası olan **durum değişkenlerini** (`sayac`, `onceki`) neden `loop()` dışında tanımladığını\n- Kenar algılama, debounce, `bool` ve seri komutlarını tek programda birleştirmeyi\n- `delay` kullanan bir programın tepki süresini hesaplamayı\n\n### Önceden bilmen gerekenler\nDers 6'dan `INPUT_PULLUP` ve \"basılı = LOW\"; ders 7'den `if`, `bool`, `&&` ve `!`; ders 8'den kenar algılama ve debounce; ders 9'dan `Serial.print`, `available()` ve `read()`; ders 3'ten `digitalWrite` ve `delay`.\n\n### Önce plan, sonra kod\nKapı zili projesi tek bir iş gibi görünür ama aslında beş küçük işin toplamıdır. Her işin hangi dersten geldiğini tabloya yazmak programı yazmayı kolaylaştırır:\n\n| İş | Ne yapar | Kaynak |\n|---|---|---|\n| Okuma | Zil butonunu `INPUT_PULLUP` ile okur | Ders 6 |\n| Basış tespiti | Düşen kenarı yakalar, sıçramayı eler | Ders 8 |\n| Tepki | LED yakar, buzzer öttürür, sayacı artırır | Ders 3, 7 |\n| Sessiz mod | D3'teki sessiz butonu basılıysa buzzer susar | Ders 7 |\n| Raporlama | `Zil: N` yazar; `S` ve `R` komutlarını işler | Ders 9 |\n\nÖnce bu tabloyu doldurup her satırı ayrı ayrı denemek, hepsini tek seferde yazmaktan çok daha güvenlidir.\n\n### Programın hafızası\n`sayac` kaç kez çalındığını, `onceki` butonun bir önceki durumunu tutar. Bu iki değişken `loop()` dışında tanımlanır. `loop()` her tur başa döner; içinde tanımlanan değişken her turda yeniden doğar ve ilk değerine (örneğin 0) sıfırlanır. Dışarıda tanımlı değişken ise program çalıştığı sürece değerini korur. `sayac++`, `sayac = sayac + 1` demektir.\n\n### Parçaları birleştirmek\nBasış tespiti `loop()` içinde iç içe iki `if` ile yapılır: önce değişiklik var mı, sonra 20 ms bekleyip değişiklik gerçek mi diye bakılır. Gerçekse ve yeni değer LOW ise bir zil basışı olmuştur. Sessiz mod için `bool sessiz = (digitalRead(3) == LOW);` yazılır ve buzzer yalnız `!sessiz` iken öttürülür: yani \"sessiz değilse\". LED her durumda yanar.\n\nAktif buzzerin içinde kendi ses üreteci vardır: pine HIGH verince öter, LOW verince susar. Uçları yönlüdür: + ucu D8'e, - ucu GND'ye gider. Laboratuvarda parçanın türünü Aktif yapmayı unutma.\n\n### Beklemenin bedeli\n`delay` sırasında kart başka hiçbir şeye bakamaz. Bir basış işlenirken 20 ms debounce beklemesi ve 300 ms zil süresi art arda çalışır: yaklaşık 20 + 300 = 320 ms boyunca program donmuş gibidir. Bu süre zil için kabul edilebilir, çünkü gelen seri komutlar tamponda bekler ve sonra okunur. Çok daha uzun beklemeler ise projeyi hantallaştırır; ilerleyen haftalarda `delay` kullanmadan zamanlamayı öğreneceksin.\n\n### Özet\nBüyük bir proje plan tablosu ile küçük işlere bölünür ve her iş önceki derslerin bir kalıbıyla çözülür. Durum değişkenleri `loop()` dışında tanımlanırsa tur boyunca korunur. Kenar algılama ve debounce, bir basışın tek sayılmasını sağlar. `delay` süreleri toplanarak programın tepki süresi hesaplanabilir.",
          "concepts": [
            {
              "term": "Plan tablosu",
              "definition": "Projeyi küçük işlere bölüp her işin ne yaptığını ve hangi kalıpla çözüleceğini yazdığın tablo.",
              "example": "Kapı zilinde okuma, basış tespiti, tepki, sessiz mod ve raporlama beş ayrı satırdır.",
              "pitfall": "Hepsini tek seferde yazmak: hata çıkınca hangi parçada olduğunu bulamazsın."
            },
            {
              "term": "Genel (global) ve yerel değişken",
              "definition": "loop() dışındaki değişken program boyunca değerini korur; loop() içindeki her turda yeniden oluşur.",
              "example": "int sayac = 0; loop() dışında yazılırsa sayaç basıştan basışa artarak kalır.",
              "pitfall": "sayac'ı loop() içinde tanımlamak: her turda 0'a döner, hiç artmıyormuş gibi görünür."
            },
            {
              "term": "sayac++",
              "definition": "Bir değişkenin değerini 1 artırır; sayac = sayac + 1 ile aynı işi yapar.",
              "example": "Her zil basışında sayac++; çalıştırılırsa sayaç 1, 2, 3 diye artar.",
              "pitfall": "Artırmayı kenar koşulunun dışına yazmak: basılı tutarken sayaç sürekli artar."
            },
            {
              "term": "Sessiz mod (bool ve !)",
              "definition": "Bir bool durum değişkeni ile bir özelliği (burada buzzer) açıp kapatma kalıbı.",
              "example": "if (!sessiz) { digitalWrite(8, HIGH); } buzzer'ı yalnız sessiz değilken öttürür.",
              "pitfall": "Koşulu ters yazmak: if (sessiz) yazarsan buzzer yalnız sessiz modda öter."
            },
            {
              "term": "Aktif buzzer",
              "definition": "İçinde ses üreteci olan buzzer; HIGH verilince öter, LOW verilince susar.",
              "example": "+ ucu D8'e, - ucu GND'ye bağlanır ve digitalWrite(8, HIGH); ile ötürülür.",
              "pitfall": "Pasif tür bırakmak ya da uçları ters bağlamak: ses çıkmaz."
            }
          ],
          "quiz": [
            {
              "id": "m3h2d10-q1",
              "kind": "predict-output",
              "prompt": "Butona üç kez basıp bırakıyorsun (sıçrama yok). Seri monitörde sırayla ne görünür?\n\n```\nint onceki = HIGH;\n\nvoid loop() {\n  int sayac = 0;\n  int simdi = digitalRead(2);\n  if (onceki == HIGH && simdi == LOW) {\n    sayac++;\n    Serial.println(sayac);\n  }\n  onceki = simdi;\n}\n```",
              "options": [
                "1, 2, 3",
                "1, 1, 1",
                "0, 0, 0",
                "Hiçbir şey yazmaz"
              ],
              "answer": 1,
              "explanation": "sayac loop() içinde tanımlı olduğu için her turda 0'dan başlar. Basış turunda 1'e çıkar, yazılır ve tur biter; değer korunmaz. 1, 2, 3 için sayac loop() dışında tanımlanmalıdır. Kenar koşulu doğru olduğundan üç basışta üç satır yazılır.",
              "skills": [
                "prog-state",
                "serial-io"
              ]
            },
            {
              "id": "m3h2d10-q2",
              "kind": "numeric",
              "prompt": "Kapı zilinde bir basış işlenirken sırayla delay(20) (debounce) ve delay(300) (zil süresi) çalışıyor. Bu iki bekleme sırasında loop() toplam kaç milisaniye başka işe bakamaz?",
              "answer": 320,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "delay süresince kart bekler. Bekleme süreleri art arda çalıştığı için toplanır: 20 + 300 = 320 ms. Bu sırada gelen seri komutlar kaybolmaz, tamponda bekler.",
              "skills": [
                "prog-timing",
                "input-debounce"
              ]
            },
            {
              "id": "m3h2d10-q3",
              "kind": "find-bug",
              "prompt": "Sessiz butona (D3) basmadan zil butonuna basınca buzzer ötmüyor; sessiz butona basılıyken zile basınca ötüyor. Tam tersi olması gerekiyor. Hatalı satır hangisi?\n\n```\nbool sessiz = (digitalRead(3) == LOW);\ndigitalWrite(13, HIGH);\nif (sessiz) {\n  digitalWrite(8, HIGH);\n}\ndelay(300);\ndigitalWrite(13, LOW);\ndigitalWrite(8, LOW);\n```",
              "options": [
                "bool sessiz = (digitalRead(3) == LOW);",
                "digitalWrite(13, HIGH);",
                "if (sessiz) {",
                "delay(300);"
              ],
              "answer": 2,
              "explanation": "Sessiz buton basılıyken digitalRead(3) LOW olduğundan sessiz = true olur. if (sessiz) buzzer'ı tam bu durumda öttürüyor. Doğrusu if (!sessiz) olmalı. bool satırı doğrudur: INPUT_PULLUP ile basılı = LOW.",
              "skills": [
                "prog-debug",
                "prog-logic"
              ]
            },
            {
              "id": "m3h2d10-q4",
              "kind": "mcq",
              "prompt": "Kapı zili programında zil butonunu 5 saniye boyunca basılı tutuyorsun (düşen kenar algılama ve debounce kullanılıyor). Sayaç ne olur?",
              "options": [
                "Her turda artar, 5 saniyede binlerce olur",
                "Saniyede bir artar",
                "Yalnızca bir kez artar",
                "Hiç artmaz"
              ],
              "answer": 2,
              "explanation": "Sayaç yalnız HIGH'dan LOW'a geçiş anında, yani düşen kenarda artar. Butonu basılı tutmak seviyeyi LOW'da tutar ama yeni bir kenar oluşturmaz. Seviyeye bakan bir program olsaydı birinci seçenek olurdu.",
              "skills": [
                "input-debounce",
                "prog-state"
              ]
            },
            {
              "id": "m3h2d10-q5",
              "kind": "numeric",
              "prompt": "Her 5. ziyaretçide özel bir uyarı verilsin istiyorsun. Koşul: sayac % 5 == 0 (% bölümden kalanı verir). Sayaç 1'den 23'e kadar saydığında (her değerde bir kez bakılıyor) bu koşul kaç kez doğru olur?",
              "answer": 4,
              "tolerance": 0,
              "explanation": "5'e bölümünden kalan 0 olan sayılar 5, 10, 15 ve 20'dir. 25 henüz sayılmadı. Dolayısıyla koşul 4 kez doğrudur.",
              "skills": [
                "prog-conditions",
                "prog-state"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Analog dünya",
      "project": "Akıllı gece lambası",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Analog ve dijital sinyali ayırt eder; `analogRead` değerini (0-1023) gerilime (ham × 5,0 / 1024) çevirir.\n2. Gerilim bölücü formülüyle (Vout = Vin × R2 / (R1 + R2)) bir sensörün direncini gerilim ve ham değerden hesaplar.\n3. LDR ile ışığı, NTC ile sıcaklığı (beta formülü, Kelvin, `log`) ölçer ve geçersiz okumayı yakalar.\n4. `map`, `constrain`, kalibrasyon ve yumuşatmayla gürültülü sensör verisini kullanılır hâle getirir.\n5. Üç sensörü birleştirip akıllı bir gece lambası yapar.\n\n### Haftanın planı\nHafta beş derstir. Plan günde bir ders içindir; 5. gün proje dersi daha uzundur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | analogRead, ADC ve potansiyometre | ~20 dk | Pot'u A0'a bağla, ham değeri ve gerilimi seri monitörde izle, LED parlaklığını ayarla. |\n| 2 | Gerilim bölücü ve LDR | ~25 dk | Bölücü hesaplarını yap, LDR'yi kur, ışık kaydırıcısıyla ham değeri oku, histerezisi dene. |\n| 3 | Termistör (NTC) ve sıcaklık hesabı | ~25 dk | NTC'yi kur, sıcaklık kaydırıcısıyla beta formülünün sonuçlarını tabloyla karşılaştır. |\n| 4 | map, constrain, kalibrasyon ve yumuşatma | ~25 dk | Sınırsız ve sınırlı `map` farkını gör, kalibrasyon ve ortalamayı çalıştır. |\n| 5 | Proje: Akıllı gece lambası | ~35 dk | Önce aşama 1, sonra tam sürüm; ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunları kontrol et:\n- Ohm yasası (V = I × R) ve mA/A, kΩ/Ω dönüşümü rahat mı? (Hafta 1, ders 2)\n- `if / else if` ve karşılaştırma işleçlerini yazabiliyor mu? (Hafta 2)\n- `Serial.begin`, `Serial.print` ve `Serial.println` ile değer yazdırabiliyor mu? (Hafta 2, ders 9)\n- `for` döngüsü ve dizi indeksleri (0 tabanlı) tanıdık mı? (Hafta 1, ders 4)\n- Laboratuvarda parça özelliklerini (Konum, Işık, Sıcaklık kaydırıcıları) değiştirebiliyor mu?\n\n### Kavram haritası\n- **Ölçme:** analog sinyal → ADC (10 bit, 1024 değer) → `analogRead` → ham değer → gerilim\n- **Sensör devresi:** gerilim bölücü → LDR (ışık arttıkça direnç azalır) ve NTC (sıcaklık arttıkça direnç azalır) → direnç hesabı → beta formülü\n- **Veriyi işleme:** `map` → `constrain` → kalibrasyon → ortalama ve üstel yumuşatma\n- **Karar:** eşik → histerezis → öncelik sırası (güvenlik normal davranışı ezer)\n- **Proje:** üç girdi (LDR, pot, NTC) → tek çıktı (PWM lamba) + uyarı LED'i\n\n### Sık yapılan hatalar\n- **`ham * 5 / 1024` yazmak.** Tam sayı bölmesi sonucu 0, 1, 2 gibi yuvarlar. `5.0` yaz.\n- **`analogRead` sayısını doğrudan `analogWrite`'a vermek.** 0-1023 ile 0-255 aralıkları farklıdır; `ham / 4` ya da `map` kullan.\n- **`10000 * ham` gibi tam sayı çarpımı.** `int` 16 bittir ve taşar. `10000.0` yaz.\n- **Bölücüde yer değiştirmek.** LDR ile sabit direncin yeri değişirse ışık yönü tersine döner.\n- **Tek eşik kullanmak.** Eşik civarında çıkış titreşir; iki eşik (histerezis) kullan.\n- **`log` yerine `log10` yazmak.** Beta formülü doğal logaritma ister.\n- **Kelvin'i Celsius'a çevirmemek.** 273,15 çıkarmayı unutma.\n- **`map` sonucunu kırpmamak.** `map` sınırlamaz; `constrain` ekle. `map` ondalık da vermez.\n- **Kalibrasyonda `enAz = 0`, `enCok = 1023` ile başlamak.** Tersi doğrudur.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Yanlış yaptığın mini test sorularının açıklamalarını oku, sonra soruyu yeniden çöz.\n3. Elle hesapla: ham = 300 için gerilim, ham = 300 için LDR direnci (LDR üstte), ham = 400 için NTC direnci.\n4. `map(250, 100, 500, 0, 255)` değerini elle hesapla, sonra laboratuvarda sketch ile doğrula.\n5. Kendi cümlelerinle cevapla: \"Gerilim bölücü neden gerekli?\" ve \"Histerezis neden kullanılır?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir: her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Akıllı gece lambası)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Sensörlerden biri bölücü olmadan bağlı ya da LED dirençsiz | LDR, pot, NTC ve iki LED doğru bağlı | Bağlantılar düzenli, direnç değerleri gerekçeli |\n| Parlaklık mantığı | Lamba karanlıkta sönük, aydınlıkta yanık | Karanlıkta parlak, aydınlıkta sönük; `constrain` var | Eşik değerleri kalibrasyonla ölçülmüş |\n| Potansiyometre ve yumuşatma | Pot etkisiz, lamba titriyor | Pot üst sınırı belirliyor, ortalama alınıyor | Yumuşatma yönteminin etkisini açıklıyor |\n| Sıcaklık koruması | Sıcaklık hesabı yanlış ya da koruma yok | 40 °C'de lamba kapanıyor, uyarı yanıyor | Sensör hatasını da ayrı ele alıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Girdi-çıktı tablosunu ve kodu anlatıyor | Hata yapıp nasıl bulduğunu ve bir geliştirmeyi anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta ölçmeyi öğretir: sensörler dünyayı gerilim olarak bildirir ve yazılım bu sayıları anlamlı hâle getirir. Formül ezberi değil, \"neden böyle?\" sorusu önemlidir.\n- **Zorluk.** Gerilim bölücü ve beta formülü matematik içerir. Öğrenci takılırsa önce kaydırıcıyı oynatıp seri monitördeki sayıların nasıl değiştiğine bakmasını, sonra hesabı yapmasını önerin.\n- **Nasıl destek olunur?** Cevabı söylemek yerine sor: \"Işık artınca ham değer hangi yöne gidiyor?\", \"Bu sayı 0-1023 mü, 0-255 mi?\", \"Hesap tam sayıyla mı ondalıkla mı yapılıyor?\"\n- **Gerçek donanım.** LDR ve NTC değerleri parçadan parçaya değişir; laboratuvardaki NTC B = 3950 ile modellenmiştir, gerçek parçanın veri sayfasına bakılmalıdır.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kart kullanılırsa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; gece lambası projesi yalnız 5 V'luk LED ile yapılır.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "analogRead, ADC ve potansiyometre",
          "durationMin": 20,
          "problem": "Bir butonun iki hâli vardır: basılı ya da değil. Peki bir ses düğmesinin, bir ışık sensörünün ya da bir termometrenin hâli kaç tanedir? Sonsuz! Dijital bir kart bu \"ara değerleri\" nasıl anlar?",
          "contentMd": "### Analog ve dijital\n`digitalRead` pindeki gerilimi yalnızca iki sınıfa ayırır: HIGH ya da LOW. Gerçek dünyada (ve laboratuvarda) gerilim 0 V ile 5 V arasında her değeri alabilir. Buna **analog** sinyal denir.\n\nArduino Uno'nun içinde bir **ADC** (Analog-Dijital Çevirici) vardır. ADC, pindeki gerilimi ölçer ve bir sayıya çevirir:\n\n- Ölçüm **10 bit**tir: 2 üzeri 10 = **1024** farklı değer (0 ile 1023).\n- 0 V → 0, 5 V → 1023 civarıdır. Referans gerilimi (en üst sınır) varsayılan olarak 5 V'tur.\n- Bir basamağın genişliği: 5 V / 1024 ≈ **4,9 mV**.\n\nSayıyı gerilime çevirmek için:\n\n`gerilim = ham × 5,0 / 1024`\n\n| Gerilim | `analogRead` değeri |\n|---|---|\n| 0 V | 0 |\n| 1,25 V | 256 |\n| 2,5 V | 512 |\n| 3,75 V | 768 |\n| 5 V | 1023 |\n\nAnalog girişler **A0-A5** pinleridir. `pinMode` yazmana gerek yoktur; `analogRead(A0)` yeterlidir.\n\n### Potansiyometre\nPotansiyometre, üç uçlu, konumu değişen bir dirençtir. Laboratuvardaki pot parçasının uçları **VCC**, **SIG** ve **GND**'dir: VCC'yi 5V'a, GND'yi GND'ye bağlarsın. Orta uç **SIG**, kaydırıcıyı sürükledikçe 0 V ile 5 V arasında gezinir. SIG'i A0'a bağlarsan kaydırıcının konumunu sayı olarak okursun.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Potansiyometre (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |\n| LED (kırmızı) | **A** (anot) → 330 Ω direncin 2. ucu; **K** (katot) → GND |\n| 330 Ω direnç | 1. ucu **D11**, 2. ucu LED'in **A** ucu |\n\nD11'i seçtik çünkü bu pin parlaklık ayarını (PWM) destekler. D13 desteklemez.\n\n### Program\nÖnce okuduğumuz sayıyı ve gerilimi seri monitörde görelim. `float`, ondalıklı sayı tutan değişken türüdür. `Serial.print(volt, 2)` sayıyı virgülden sonra 2 basamakla yazar.\n\n```cpp\n// sketch: pot_oku\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = analogRead(A0);          // 0-1023\n  float volt = ham * 5.0 / 1024.0;   // gerilime çevir\n  Serial.print(\"ham=\");\n  Serial.print(ham);\n  Serial.print(\" volt=\");\n  Serial.println(volt, 2);\n  delay(500);\n}\n```\n\nŞimdi düğmeyle LED'in parlaklığını ayarlayalım. `analogWrite(pin, değer)` pine 0-255 arası bir \"parlaklık\" değeri yazar: 0 söner, 255 tam parlak yanar. Nasıl çalıştığını 16. derste öğreneceksin. Şimdilik bir kullanma aracı olarak al.\n\nADC 0-1023 verir, `analogWrite` 0-255 ister. 1024 / 4 = 256 olduğu için ham değeri 4'e bölmek yeter.\n\n```cpp\n// sketch: pot_parlaklik\nvoid setup() {\n  pinMode(11, OUTPUT);\n}\n\nvoid loop() {\n  int ham = analogRead(A0);\n  analogWrite(11, ham / 4);   // 0-1023 -> 0-255\n}\n```\n\n### Nasıl çalışıyor?\n1. `analogRead(A0)` A0'daki gerilimi ölçer ve 0-1023 arası bir tam sayı verir.\n2. `ham * 5.0 / 1024.0` işleminde `5.0` yazdık, çünkü tam sayı bölmesi virgülden sonrasını atar. Ondalıklı bir sayı katınca sonuç ondalıklı olur.\n3. `ham / 4` tam sayı bölmesidir. 1023 / 4 = 255 çıkar, yani 255'i aşmaz.\n4. Kaydırıcı sona çekilince LED en parlak, başa çekilince söner.\n\n### Dene\n- `delay(500)` değerini 50 yap. Seri monitördeki sayılar kaydırıcıyı sürükledikçe akıcı değişiyor mu?\n- Kaydırıcıyı tam ortaya (0,5) getir. Sayı yaklaşık 512 mi? Gerçek devrelerde pot hiç oynamasa bile sayı 1-2 birim titreyebilir (gürültü); bunu 14. derste yumuşatma ile ele alacağız. Sence neden olur?\n- `ham / 4` yerine `255 - ham / 4` yaz. LED'in davranışı nasıl değişir?\n\n### Sık yapılan hatalar\n- Potansiyometrenin SIG ucu yerine VCC ya da GND ucunu A0'a bağlamak: sayı hiç değişmez.\n- VCC ya da GND ucunu boşta bırakmak: ölçüm anlamsızlaşır (laboratuvarda pin \"havada\" kalır).\n- Analog pini `digitalRead` ile okumaya çalışmak: yalnızca 0 ya da 1 görürsün.\n- `ham * 5 / 1024` yazmak: iki tarafta da tam sayı olduğu için sonuç 0, 1, 2... gibi yuvarlanır. `5.0` yazarak ondalıklı hesap yap.",
          "question": "ADC 10 bit yerine 8 bit olsaydı kaç farklı değer okuyabilirdik? Bir basamağın gerilim genişliği büyür mü, küçülür mü?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Analog ve dijital sinyalin farkını\n- ADC'nin (Analog-Dijital Çevirici) gerilimi 0-1023 arası bir sayıya nasıl çevirdiğini\n- `analogRead` sayısını gerilime çevirmeyi: `ham × 5,0 / 1024`\n- Potansiyometreyi bir gerilim ayarlayıcı olarak kullanmayı\n- Tam sayı bölmesinin ondalıklı hesabı nasıl bozduğunu\n\n### Önceden bilmen gerekenler\nDers 1'de analog pinlerin (A0-A5) varlığı ve 5V ile GND; ders 2'de gerilim kavramı; ders 6'da `digitalRead`'in yalnız HIGH ya da LOW verdiği; ders 9'da `Serial.print` ile yazdırma.\n\n### Analog ve dijital: iki sınıf, sonsuz değer\n`digitalRead` pindeki gerilimi iki sınıftan birine koyar: HIGH ya da LOW. Oysa gerçek dünyada gerilim 0 V ile 5 V arasında her değeri alabilir. Bu sürekli değişen sinyale **analog** denir. Işığı, sıcaklığı, düğmenin konumunu sensörler genellikle böyle bir gerilimle bildirir.\n\n### ADC: gerilimi sayıya çeviren ölçü cetveli\nUno'nun içindeki **ADC**, 0-5 V aralığını 10 bit ile ölçer. 10 bit, 2 üzeri 10 = **1024** farklı sayı demektir (0-1023). Bir basamağın genişliği 5 V / 1024 ≈ 4,9 mV'tur. Bir cetvel düşün: 5 V'luk uzunluk 1024 çentiğe bölünmüş, ADC gerilimin hangi çentiğe düştüğünü söyler.\n\n```\ngerilim = ham * 5.0 / 1024.0\n```\n\n| analogRead | Yaklaşık gerilim |\n|---|---|\n| 0 | 0 V |\n| 256 | 1,25 V |\n| 512 | 2,5 V |\n| 1023 | ≈ 5 V |\n\n`analogRead(A0)` için `pinMode` yazmazsın; analog pinler zaten giriştir.\n\n### Potansiyometre: elle ayarlanan gerilim\nPotansiyometrenin iki ucu 5V ve GND'ye bağlanır; orta uç (SIG) kaydırıcı döndükçe 0-5 V arasında gezer. SIG'i A0'a bağlarsan kaydırıcının konumunu bir sayı olarak okursun. Konum 0,5 ise sayı yaklaşık 512'dir.\n\n### Ondalık hesap ve ölçekleme\n`ham * 5 / 1024` yazarsan iki taraf da tam sayıdır; sonuç virgülden sonrası atılarak 0, 1, 2 gibi çıkar. Bu yüzden `5.0` yazılır. `analogWrite` ise 0-255 ister. 1024 / 4 = 256 olduğundan `ham / 4` sonucu 0-255 aralığındadır.\n\n```\nfloat volt = ham * 5.0 / 1024.0;   // doğru\nint yari = ham / 4;                // 0-255\n```\n\n### Özet\nADC gerilimi 0-1023 arası bir sayıya çevirir; bir basamak yaklaşık 4,9 mV'tur. Sayıdan gerilime dönmek için `ham × 5,0 / 1024` hesaplanır ve `5.0` ondalık yazılmalıdır. Potansiyometre, elle ayarlanan bir gerilim kaynağı gibi davranır. `ham / 4` ile 0-1023 aralığı `analogWrite`'ın 0-255 aralığına taşınır.",
          "concepts": [
            {
              "term": "Analog sinyal",
              "definition": "0 V ile 5 V arasında her değeri alabilen, sürekli değişen gerilim.",
              "example": "Potansiyometrenin orta ucu, kaydırıcı döndükçe 0-5 V arasında gezer.",
              "pitfall": "Analog bir pini digitalRead ile okumak: yalnızca 0 ya da 1 görürsün, ara değerleri kaybedersin."
            },
            {
              "term": "ADC",
              "definition": "Analog-Dijital Çevirici. Uno'da pindeki gerilimi 10 bit ile 0-1023 arası bir sayıya çevirir.",
              "example": "Pin 2,5 V'taysa analogRead yaklaşık 512 verir.",
              "pitfall": "Okunan sayıyı doğrudan gerilim sanmak. analogRead 0-1023 verir; volt için ham * 5.0 / 1024.0 hesaplanır."
            },
            {
              "term": "analogRead()",
              "definition": "Bir analog pindeki (A0-A5) gerilimi 0-1023 arası bir tam sayı olarak döndürür.",
              "example": "int ham = analogRead(A0); potansiyometrenin konumunu sayı olarak verir.",
              "pitfall": "Analog giriş için gereksiz yere pinMode(A0, OUTPUT) yazmak: pin çıkış olur ve okuma anlamsızlaşır."
            },
            {
              "term": "Potansiyometre",
              "definition": "Üç uçlu, konumu değişen direnç. İki ucu 5V ve GND'ye bağlanır, orta ucu (SIG) konuma göre 0-5 V verir.",
              "example": "VCC → 5V, GND → GND, SIG → A0 bağlantısıyla kaydırıcı konumu okunur.",
              "pitfall": "SIG yerine VCC ya da GND ucunu A0'a bağlamak: sayı hiç değişmez."
            },
            {
              "term": "Tam sayı bölmesi",
              "definition": "İki tam sayı bölününce sonuç da tam sayı olur; virgülden sonrası atılır.",
              "example": "5 / 2 sonucu 2 çıkar; 5.0 / 2 sonucu 2,5 çıkar.",
              "pitfall": "ham * 5 / 1024 yazmak: sonuç 0, 1, 2 gibi yuvarlanır. 5.0 yazarak ondalıklı hesap yap."
            }
          ],
          "quiz": [
            {
              "id": "m3h3d11-q1",
              "kind": "numeric",
              "prompt": "analogRead(A0) 820 değerini verdi. A0 pinindeki gerilim yaklaşık kaç volttur? (ham × 5,0 / 1024)",
              "answer": 4,
              "tolerance": 0.02,
              "unit": "V",
              "explanation": "820 × 5,0 / 1024 = 4,004 V, yani yaklaşık 4,0 V. Bölmeyi 1023'e bölerek yapsan da sonuç çok yakın çıkar; burada ders formülü 1024 kullanır.",
              "skills": [
                "analog-adc"
              ]
            },
            {
              "id": "m3h3d11-q2",
              "kind": "numeric",
              "prompt": "10 bitlik ADC'nin bir basamağı kaç milivolttur? (0-5 V aralığı 1024 basamağa bölünüyor; en yakın 0,1'e yuvarla.)",
              "answer": 4.9,
              "tolerance": 0.1,
              "unit": "mV",
              "explanation": "5000 mV / 1024 ≈ 4,88 mV. Yani gerilim yaklaşık 4,9 mV değişince okunan sayı bir artar ya da azalır.",
              "skills": [
                "analog-adc"
              ]
            },
            {
              "id": "m3h3d11-q3",
              "kind": "predict-output",
              "prompt": "Seri monitörde ne görünür?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  int ham = 700;\n  float v = ham * 5 / 1024;\n  Serial.println(v);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "3.42",
                "3.00",
                "0.00",
                "3500.00"
              ],
              "answer": 1,
              "explanation": "ham * 5 = 3500 ve 3500 / 1024 iki tam sayının bölmesidir: sonuç 3 olur, 3,417 değil. Bu 3, float v'ye atanınca 3.00 yazılır. Doğru sonuç için 5.0 yazılmalıydı.",
              "skills": [
                "analog-adc",
                "prog-debug"
              ]
            },
            {
              "id": "m3h3d11-q4",
              "kind": "find-bug",
              "prompt": "Potansiyometre ile LED parlaklığı ayarlanıyor (LED D11'de). Kaydırıcı ortadan sonra LED beklenmedik şekilde davranıyor. Hata hangi satırda?\n\n```\nvoid setup() {\n  pinMode(11, OUTPUT);\n}\n\nvoid loop() {\n  int ham = analogRead(A0);\n  analogWrite(11, ham);\n}\n```",
              "options": [
                "pinMode(11, OUTPUT);",
                "int ham = analogRead(A0);",
                "analogWrite(11, ham);",
                "void loop() {"
              ],
              "answer": 2,
              "explanation": "ham 0-1023 arasıdır ama analogWrite 0-255 ister. ham / 4 yazılmalıdır. Diğer satırlar doğrudur: D11 çıkış olmalı, analogRead(A0) ham değeri okur.",
              "skills": [
                "analog-adc",
                "prog-debug"
              ]
            },
            {
              "id": "m3h3d11-q5",
              "kind": "mcq",
              "prompt": "Potansiyometrenin kaydırıcısı tam ortadayken analogRead(A0) yaklaşık kaç verir?",
              "options": [
                "0",
                "256",
                "512",
                "1023"
              ],
              "answer": 2,
              "explanation": "Orta konumda SIG yaklaşık 2,5 V'tur; bu, 0-1023 aralığının ortası olan 512'ye karşılık gelir. 0 ve 1023 uçlardır, 256 yaklaşık 1,25 V'tur.",
              "skills": [
                "analog-adc",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "Gerilim bölücü ve LDR",
          "durationMin": 25,
          "problem": "Arduino direnci ölçemez; yalnızca gerilimi ölçer. Peki ışığa göre direnci değişen bir parçanın (LDR) karanlıkta mı aydınlıkta mı olduğunu nasıl anlayacağız? Cevap, iki dirençle kurulan küçük bir hilede: gerilim bölücü.",
          "contentMd": "### Gerilim bölücü\nBirbirine seri bağlı iki direnç düşün. Üstteki R1 5 V'a, alttaki R2 GND'ye bağlı. Ortadaki noktadan gerilim alıyoruz.\n\n- Devreden geçen akım: I = Vin / (R1 + R2)\n- R2'nin üzerindeki gerilim: Vout = I × R2\n\nBu ikisini birleştirince:\n\n`Vout = Vin × R2 / (R1 + R2)`\n\nÖrnekler (Vin = 5 V, R1 = 10 kΩ):\n\n| R2 | Vout |\n|---|---|\n| 1 kΩ | 5 × 1 / 11 ≈ 0,45 V |\n| 10 kΩ | 5 × 10 / 20 = 2,50 V |\n| 100 kΩ | 5 × 100 / 110 ≈ 4,55 V |\n\nR2 büyüdükçe çıkış gerilimi büyür. İki direnç eşitse tam ortada, yani 2,5 V olur. Bu sayıları aşağıdaki küçük sketch ile doğrulayabilirsin.\n\n```cpp\n// sketch: bolucu_hesap\nfloat vin = 5.0;\nfloat r1 = 10000.0;\nfloat r2[] = {1000.0, 10000.0, 100000.0};\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 3; i++) {\n    float vout = vin * r2[i] / (r1 + r2[i]);\n    Serial.print(\"R2=\");\n    Serial.print(r2[i], 0);\n    Serial.print(\" Vout=\");\n    Serial.println(vout, 2);\n  }\n}\n\nvoid loop() {\n}\n```\n\n### LDR\nLDR (ışığa duyarlı direnç) üzerine düşen ışık arttıkça direnci azalır. Değerler parçadan parçaya değişir; kabaca karanlıkta yüzlerce kΩ, parlak ışıkta birkaç yüz Ω ile birkaç kΩ arasındadır. Laboratuvardaki LDR'nin değerini aşağıdaki sketch ile okuyabilirsin: ışık kaydırıcısını oynatınca direnç değişir.\n\nLDR'yi bölücünün üst direnci (R1) yaparsak, sabit 10 kΩ direnç R2 olur:\n\n- Aydınlık: LDR küçük, R2 baskın, Vout **yüksek**.\n- Karanlık: LDR büyük, Vout **düşük**.\n\nÖlçülen Vout'tan LDR'nin direncini bulmak için formülü ters çeviririz:\n\n`R_ldr = 10 kΩ × (5 − Vout) / Vout`\n\nADC değeriyle yazarsak: `R_ldr = 10000 × (1024 − ham) / ham`.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. LDR ve direnci seçince özellik panelinden LDR'nin **Işık** kaydırıcısını ve direncin değerini (10000 Ω) ayarlayabilirsin.\n\n| Parça | Bağlantı |\n|---|---|\n| LDR | 1. ucu → 5V; 2. ucu → **A1** |\n| 10 kΩ direnç | 1. ucu **A1**, 2. ucu GND |\n| LED (kırmızı) | **A** (anot) → 330 Ω direncin 2. ucu; **K** (katot) → GND |\n| 330 Ω direnç | 1. ucu **D13**, 2. ucu LED'in **A** ucu |\n\n### Program\nÖnce ışığı ve LDR'nin direncini yazdıralım.\n\n```cpp\n// sketch: isik_oku\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = analogRead(A1);\n  float volt = ham * 5.0 / 1024.0;\n  float rLdr = 0;\n  if (ham > 0) {\n    rLdr = 10000.0 * (1024 - ham) / ham;\n  }\n  Serial.print(\"ham=\");\n  Serial.print(ham);\n  Serial.print(\" volt=\");\n  Serial.print(volt, 2);\n  Serial.print(\" R_ldr=\");\n  Serial.println(rLdr, 0);\n  delay(500);\n}\n```\n\nŞimdi karanlık olunca LED'i yakan bir sistem yapalım. Dikkat: tek bir eşik kullanırsak ışık eşiğe yakınken LED sürekli yanıp söner. Bunu önlemek için iki eşik kullanıyoruz: 250'nin altında yak, 350'nin üstünde söndür. Arasındaki bölgede LED, önceki durumunu korur. Buna **histerezis** denir.\n\n```cpp\n// sketch: karanlik_esik\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  int ham = analogRead(A1);\n  if (ham < 250) {\n    digitalWrite(13, HIGH);   // karanlık: yak\n  } else if (ham > 350) {\n    digitalWrite(13, LOW);    // aydınlık: söndür\n  }\n  delay(50);\n}\n```\n\n### Nasıl çalışıyor?\n1. LDR ve 10 kΩ direnç gerilim bölücü oluşturur. A1, bu ikisinin ortasındaki gerilimi ölçer.\n2. Işık artınca LDR direnci düşer, A1'deki gerilim ve `ham` değeri artar.\n3. `if / else if` zincirinde iki koşuldan hiçbiri doğru değilse (250-350 arası) pine dokunulmaz, LED eski hâlinde kalır.\n4. Sabit direnç LDR'nin orta değerine yakın seçilirse (burada 10 kΩ) ölçüm aralığı en geniş olur.\n\n### Dene\n- LDR'nin **Işık** kaydırıcısını en sola çek (karanlık). `ham` ne kadar düşüyor? Sonra en sağa çek (aydınlık). En yüksek değer kaç?\n- `isik_oku` ile okuduğun karanlık ve aydınlık değerlerine göre 250 ve 350 eşiklerini kendin uyarla.\n- Devrede LDR ile 10 kΩ direncin yerini değiştir. Işık arttıkça `ham` nasıl değişir? Neden?\n\n### Sık yapılan hatalar\n- Sabit direnci unutmak: LDR doğrudan 5 V ile A1 arasında kalır, pin \"havada\" olur ve ölçüm anlamsızlaşır.\n- LDR ile sabit direncin yerlerini değiştirmek: devre çalışır ama ışık arttıkça `ham` değeri düşer. Programın mantığı tersine döner, buna dikkat et.\n- Çok küçük bir sabit direnç (örneğin 100 Ω) seçmek: Vout neredeyse hep 0 V'ta kalır, aralık daralır.\n- Tek eşik kullanıp LED'in eşikte titremesine şaşırmak.",
          "question": "Sabit direnci 1 kΩ yapsaydık, karanlıkta (LDR çok büyükken) A1'deki gerilim ne olurdu? Bu bölücü ışık farklarını ayırt etmede neden daha kötü olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- İki seri dirençten oluşan gerilim bölücünün formülünü\n- Arduino'nun neden direnci değil yalnız gerilimi ölçtüğünü\n- LDR'nin ışıkla direncinin nasıl değiştiğini ve bölücüyle nasıl okunduğunu\n- ADC değerinden LDR direncini geri hesaplamayı\n- Histerezisle (iki eşik) titreyen bir kararı kararlı yapmayı\n\n### Önceden bilmen gerekenler\nDers 2'de Ohm yasası ve seri dirençlerde akımın aynı olması; ders 7'de `if / else if`; ders 11'de `analogRead` ve ham değer.\n\n### Gerilim bölücü\nÜstteki R1 5 V'a, alttaki R2 GND'ye bağlı olsun. Akım her iki dirençten aynıdır: I = Vin / (R1 + R2). Ortadaki noktanın gerilimi R2'nin üzerindeki gerilimdir:\n\n```\nVout = Vin * R2 / (R1 + R2)\n```\n\nEşit iki dirençte Vout tam ortada, 2,5 V olur. Örnek: R1 = 10 kΩ, R2 = 30 kΩ ise Vout = 5 × 30 / 40 = 3,75 V. Alttaki direnç büyüdükçe Vout yükselir.\n\n### Neden bölücü?\nArduino bir parçanın direncini doğrudan ölçemez, yalnız pindeki gerilimi ölçer. Direnci değişen bir sensörü sabit bir dirençle seri bağlarsak, direnç değişimi orta noktada gerilim değişimine dönüşür. ADC bunu okur.\n\n### LDR\n**LDR**, ışık arttıkça direnci azalan bir dirençtir. Karanlıkta çok büyük (yüzlerce kΩ), parlak ışıkta çok küçüktür. LDR'yi üst, 10 kΩ'luk sabit direnci alt yaparsan: aydınlıkta LDR küçülür, Vout ve `ham` yükselir; karanlıkta düşer.\n\nTers yönde hesap da yapılır. LDR üstteyken, A1'de okunan `ham` değerinden:\n\n```\nR_ldr = 10000.0 * (1024 - ham) / ham\n```\n\nÖrnek: ham = 256 ise R_ldr = 10000 × 768 / 256 = 30 000 Ω.\n\n### Histerezis\nIşık tam eşik değerindeyken `ham` 249, 251, 250 gibi oynar; tek eşikli LED sürekli yanıp söner. Çözüm iki eşiktir: 250'nin altında yak, 350'nin üstünde söndür. İkisinin arasında hiçbir şey yapma; LED önceki durumunu korur.\n\n### Özet\nGerilim bölücü, direnç değişimini ölçülebilir bir gerilime çevirir: Vout = Vin × R2 / (R1 + R2). LDR üstte, sabit direnç altta iken ışık arttıkça `ham` artar. Direnci geri bulmak için formül ters çevrilir. Histerezis, eşik civarındaki titremeyi iki eşikle önler.",
          "concepts": [
            {
              "term": "Gerilim bölücü",
              "definition": "Seri bağlı iki dirençle gerilimin bir kısmını orta noktadan almak: Vout = Vin × R2 / (R1 + R2).",
              "example": "R1 = 10 kΩ, R2 = 10 kΩ ise 5 V giriş 2,5 V çıkış verir.",
              "pitfall": "R1 ve R2'nin yerini karıştırmak: formüldeki R2 GND tarafındaki dirençtir."
            },
            {
              "term": "LDR",
              "definition": "Işığa duyarlı direnç. Işık arttıkça direnci azalır.",
              "example": "Karanlıkta yüzlerce kΩ olan LDR, parlak ışıkta birkaç yüz Ω'a kadar düşebilir.",
              "pitfall": "LDR'yi sabit direnç olmadan doğrudan 5V ile A1 arasına bağlamak: pin havada kalır, ölçüm anlamsızlaşır."
            },
            {
              "term": "LDR direnci hesabı",
              "definition": "LDR üstteyken ham değerden direnç: R_ldr = 10000 × (1024 − ham) / ham.",
              "example": "ham = 256 ise R_ldr = 10000 × 768 / 256 = 30 000 Ω.",
              "pitfall": "10000 yazıp 10000.0 yazmamak: int çarpımı taşar ve sonuç anlamsızlaşır."
            },
            {
              "term": "Histerezis",
              "definition": "Aç ve kapa için iki ayrı eşik kullanmak; aradaki bölgede durum korunur.",
              "example": "ham 250'nin altına inince LED yanar, 350'nin üstüne çıkınca söner.",
              "pitfall": "Tek eşik kullanmak: ışık eşik civarındayken LED sürekli yanıp söner."
            },
            {
              "term": "Işık yönü",
              "definition": "LDR üstte ve sabit direnç altta ise ışık arttıkça ham değer artar. Yer değişirse yön tersine döner.",
              "example": "LDR 5V tarafında, 10 kΩ GND tarafında: aydınlıkta ham büyüktür.",
              "pitfall": "Yer değiştirip programın mantığını güncellememek: lamba karanlıkta söner, aydınlıkta yanar."
            }
          ],
          "quiz": [
            {
              "id": "m3h3d12-q1",
              "kind": "numeric",
              "prompt": "Bir gerilim bölücüde Vin = 5 V, üst direnç R1 = 10 kΩ, alt direnç R2 = 30 kΩ. Orta noktadaki gerilim kaç volttur?",
              "answer": 3.75,
              "tolerance": 0.01,
              "unit": "V",
              "explanation": "Vout = 5 × 30 / (10 + 30) = 3,75 V. Alt direnç büyük olduğundan çıkış, ortanın (2,5 V) üstündedir.",
              "skills": [
                "volt-divider",
                "elec-ohm"
              ]
            },
            {
              "id": "m3h3d12-q2",
              "kind": "numeric",
              "prompt": "LDR üstte, 10 kΩ direnç altta ve A1'de okunan ham değer 256. LDR'nin direnci kaç ohmdur? (R_ldr = 10000 × (1024 − ham) / ham)",
              "answer": 30000,
              "tolerance": 10,
              "unit": "Ω",
              "explanation": "10000 × (1024 − 256) / 256 = 10000 × 768 / 256 = 30 000 Ω. Ham değer ortanın (512) altında olduğundan LDR sabit dirençten büyüktür, yani ortam görece karanlıktır.",
              "skills": [
                "sensor-ldr",
                "volt-divider"
              ]
            },
            {
              "id": "m3h3d12-q3",
              "kind": "mcq",
              "prompt": "LDR 5V ile A1 arasında, 10 kΩ direnç A1 ile GND arasında. Ortam aydınlanınca A1'deki ham değer ne olur?",
              "options": [
                "Azalır",
                "Değişmez",
                "Her zaman 512 olur",
                "Artar"
              ],
              "answer": 3,
              "explanation": "Işık artınca LDR direnci düşer. Üst direnç küçülünce alt dirençteki pay büyür ve A1'deki gerilim ile ham değer artar. Yer değiştirirlerse yön tersine döner.",
              "skills": [
                "sensor-ldr",
                "volt-divider"
              ]
            },
            {
              "id": "m3h3d12-q4",
              "kind": "predict-output",
              "prompt": "LED başlangıçta sönük. A1 okumaları sırayla 200, 300, 400, 300 geliyor ve her okumadan sonra bu kod bir kez çalışıyor. Son okumadan sonra LED nasıldır?\n\n```\nif (ham < 250) {\n  digitalWrite(13, HIGH);\n} else if (ham > 350) {\n  digitalWrite(13, LOW);\n}\n```",
              "options": [
                "Yanık, çünkü son değer 300 ve 350'den küçük",
                "Sönük, çünkü 400 okuması LED'i söndürdü ve 300 arada olduğundan durum korunuyor",
                "Yanık, çünkü ilk okuma 200 idi",
                "Sönük, çünkü 300 < 350"
              ],
              "answer": 1,
              "explanation": "200 LED'i yakar. 300 arada olduğu için durum korunur (yanık). 400 > 350 olduğundan LED söner. Son 300 yine arada olduğundan LED sönük kalır. Aynı 300 değeri iki kez farklı sonuç verdi: histerezis budur.",
              "skills": [
                "sensor-ldr",
                "prog-debug"
              ]
            },
            {
              "id": "m3h3d12-q5",
              "kind": "find-bug",
              "prompt": "LDR direnci hesaplanıyor ama sonuç anlamsız çıkıyor. (Arduino Uno'da int 16 bit, en çok 32767.) Hata nerede?\n\n```\nint ham = analogRead(A1);\nif (ham > 0) {\n  float rLdr = 10000 * (1024 - ham) / ham;\n  Serial.println(rLdr, 0);\n}\n```",
              "options": [
                "analogRead(A1) yerine A0 yazılmalı",
                "10000 * (1024 - ham) tam sayı olarak hesaplanır ve int'e sığmayıp taşar",
                "if (ham > 0) koşulu gereksiz",
                "Serial.println ondalık yazamaz"
              ],
              "answer": 1,
              "explanation": "10000 ve (1024 - ham) tam sayıdır; çarpım çoğu ham değeri için 32767'yi aşar ve taşar. Çözüm 10000.0 yazmaktır. if (ham > 0) sıfıra bölmeyi önlediği için doğrudur, println(rLdr, 0) ise sorunsuz çalışır.",
              "skills": [
                "sensor-ldr",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Termistör (NTC) ve sıcaklık hesabı",
          "durationMin": 25,
          "problem": "Bir sıcaklık sensörü içinde sıcaklığı \"bilen\" bir şey yoktur. Sadece direnci değişen bir parça vardır. Peki o direnç değerinden \"23,5 derece\" sonucuna nasıl ulaşırız?",
          "contentMd": "### NTC termistör\n**NTC** (Negative Temperature Coefficient), sıcaklık arttıkça direnci **azalan** bir dirençtir. Çok kullanılan tür, 25 °C'de 10 kΩ olan \"10k NTC\"dir. Direncin sıcaklıkla değişimi doğrusal değildir; bir üstel eğriyi izler.\n\nSensörü bir gerilim bölücüyle okuruz (önceki ders). NTC, alt direnç (R2) olur; üst direnç 10 kΩ sabit dirençtir:\n\n`Vout = 5 × R_ntc / (10 kΩ + R_ntc)`\n\nADC değeriyle ters çevirirsek NTC'nin direnci:\n\n`R_ntc = 10000 × ham / (1024 − ham)`\n\nSıcaklık artınca NTC direnci düşer, A2'deki gerilim de düşer.\n\n### Dirençten sıcaklığa: beta formülü\nEn yaygın yöntem **beta** formülüdür. Parçanın iki sayısına ihtiyaç var, ikisi de veri sayfasında yazar:\n\n- R0: referans sıcaklıktaki direnç (bizde 25 °C'de 10 000 Ω)\n- B: parçanın beta katsayısı (çok satılan 10k NTC'lerde sıklıkla 3950, ama 3435 gibi başka değerler de var; gerçek bir parçada değeri veri sayfasından okursun. Laboratuvardaki NTC 10 kΩ ve B = 3950 olarak modellenmiştir)\n\nSıcaklık Kelvin cinsinden T, T0 = 25 + 273,15 = 298,15 K olmak üzere:\n\n`1/T = 1/T0 + ln(R / R0) / B`\n\nSonra Celsius'a çevir: `°C = T − 273,15`. `ln` doğal logaritmadır; Arduino'da `log()` fonksiyonu bunu verir.\n\nR0 = 10 kΩ, B = 3950 için formülün verdiği değerler:\n\n| Sıcaklık | NTC direnci |\n|---|---|\n| 0 °C | ≈ 33,6 kΩ |\n| 25 °C | 10 kΩ |\n| 50 °C | ≈ 3,59 kΩ |\n| 100 °C | ≈ 0,70 kΩ |\n\nGerçek parçalarda bu değerler birkaç yüzde sapabilir; beta formülü yaklaşık bir modeldir ve en doğru olduğu yer 25 °C civarıdır. Laboratuvardaki NTC doğrudan bu beta modeliyle çalışır.\n\n### Steinhart-Hart denklemi\nDaha doğru model **Steinhart-Hart** denklemidir:\n\n`1/T = A + B × ln(R) + C × (ln(R))³`\n\nA, B, C parçaya özgü üç sayıdır. Üreticinin verdiği direnç-sıcaklık tablosundan üç nokta seçip üç bilinmeyenli denklemi çözerek bulunur. Aşağıdaki ikinci sketch bunu `setup()` içinde senin yerine yapar. Örnek olarak 0, 25 ve 50 °C noktalarını kullanır (burada R değerleri yukarıdaki tablodan alındı; gerçek bir parça için kendi veri sayfandaki üç değeri yazarsın).\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. NTC'yi seçince özellik panelinde **Sıcaklık** kaydırıcısı çıkar (-20 ile 120 °C).\n\n| Parça | Bağlantı |\n|---|---|\n| NTC termistör (10 kΩ) | 1. ucu → **A2**; 2. ucu → GND |\n| 10 kΩ direnç | 1. ucu → 5V; 2. ucu → **A2** |\n\n### Program\n```cpp\n// sketch: ntc_sicaklik\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = analogRead(A2);\n  if (ham <= 0 || ham >= 1023) {\n    Serial.println(\"sensor hatasi\");   // kopuk ya da kisa devre\n  } else {\n    float r = 10000.0 * ham / (1024.0 - ham);               // NTC direnci\n    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);\n    float tC = tK - 273.15;\n    Serial.print(\"R=\");\n    Serial.print(r, 0);\n    Serial.print(\" T=\");\n    Serial.println(tC, 1);\n  }\n  delay(500);\n}\n```\n\nAynı ölçümü Steinhart-Hart ile yapan sürüm:\n\n```cpp\n// sketch: ntc_steinhart\nfloat A, B, C;\n\nvoid setup() {\n  Serial.begin(9600);\n  // Üç nokta: (direnç, sıcaklık)  0 C, 25 C, 50 C\n  float l1 = log(33620.0), l2 = log(10000.0), l3 = log(3588.0);\n  float y1 = 1.0 / 273.15, y2 = 1.0 / 298.15, y3 = 1.0 / 323.15;\n  float g2 = (y2 - y1) / (l2 - l1);\n  float g3 = (y3 - y1) / (l3 - l1);\n  C = (g3 - g2) / (l3 - l2) / (l1 + l2 + l3);\n  B = g2 - C * (l1 * l1 + l1 * l2 + l2 * l2);\n  A = y1 - (B + C * l1 * l1) * l1;\n}\n\nvoid loop() {\n  int ham = analogRead(A2);\n  if (ham <= 0 || ham >= 1023) {\n    Serial.println(\"sensor hatasi\");\n  } else {\n    float r = 10000.0 * ham / (1024.0 - ham);\n    float lr = log(r);\n    float tK = 1.0 / (A + B * lr + C * lr * lr * lr);\n    Serial.print(\"R=\");\n    Serial.print(r, 0);\n    Serial.print(\" T=\");\n    Serial.println(tK - 273.15, 1);\n  }\n  delay(500);\n}\n```\n\n### Nasıl çalışıyor?\n1. `ham` değerinden NTC'nin direncini hesaplarız (gerilim bölücü formülünün tersi).\n2. Beta formülü dirençten Kelvin sıcaklığı verir; 273,15 çıkarıp Celsius'a çeviririz.\n3. `ham` 0 ya da 1023 ise bölme sıfıra gider ya da sonuç anlamsızlaşır. Bu hâller kopuk bağlantı ya da kısa devre demektir; sketch bunu `sensor hatasi` diye bildirir.\n4. Steinhart-Hart sürümü, verdiğimiz üç noktadan geçen eğriyi kurar. Üç noktanın arasında beta ile aynı sonucu verir; uçlara gittikçe ikisi birbirinden ayrılabilir. Hangisinin daha doğru olduğunu parçanın veri sayfası belirler.\n\nGerilimlere göre beklenen sıcaklıklar (beta formülü, B = 3950):\n\n| A2'deki gerilim | ham | Sıcaklık |\n|---|---|---|\n| 1,0 V | 204 | ≈ 60,0 °C |\n| 1,5 V | 307 | ≈ 45,4 °C |\n| 2,0 V | 409 | ≈ 34,5 °C |\n| 2,5 V | 512 | 25,0 °C |\n| 3,0 V | 614 | ≈ 16,2 °C |\n| 4,0 V | 819 | ≈ −3,2 °C |\n\n### Dene\n- NTC'nin **Sıcaklık** kaydırıcısını 25 °C'den 45 °C'ye çek. Seri monitördeki sıcaklık hangi yönde değişiyor? A2'deki gerilim (sanal ölçüm) nasıl değişiyor?\n- Sabit direncin değerini özellik panelinden 10 kΩ yerine 4,7 kΩ yap. Sketch'te hangi sayıyı değiştirmelisin? Oda sıcaklığında sonuç doğru çıkıyor mu?\n- Sıcaklık 30 °C'yi aşınca D13'teki LED'i yakacak bir `if` ekle.\n\n### Sık yapılan hatalar\n- Kelvin ile Celsius'u karıştırmak: formül Kelvin verir, 273,15 çıkarmayı unutursan 298 gibi sayılar görürsün.\n- `log` yerine `log10` kullanmak: formül doğal logaritma ister.\n- Sabit direncin gerçek değerini kodda farklı yazmak: kodda 10000 yazıp devrede 4,7 kΩ kullanırsan sonuç kayar.\n- `10000 * ham` yazmak: `int` taşar. `10000.0 *` yazarak ondalıklı hesap yap.",
          "question": "Sensör direnci doğrusal değişmediği için ADC değeriyle sıcaklık arasında düz bir çizgi yoktur. Bu yüzden `map()` ile ham değeri doğrudan sıcaklığa çevirmek neden iyi bir fikir olmaz?",
          "explainerMd": "### Bu derste öğreneceklerin\n- NTC termistörün sıcaklıkla direncinin nasıl değiştiğini\n- ADC değerinden NTC direncini hesaplamayı\n- Beta formülüyle dirençten sıcaklığa geçmeyi\n- Kelvin ile Celsius'u ve doğal logaritmayı (`log`) kullanmayı\n- Kopuk sensör ve kısa devreyi program içinde fark etmeyi\n\n### Önceden bilmen gerekenler\nDers 11'de ham değer ve gerilim dönüşümü; ders 12'de gerilim bölücü ve dirençten ham değere geçiş; ders 2'de birimler (Ω, kΩ).\n\n### NTC: ısınınca direnci düşen parça\n**NTC** (Negative Temperature Coefficient) termistör, sıcaklık arttıkça direnci azalan bir dirençtir. Yaygın tür 25 °C'de 10 kΩ'dur. Değişim doğrusal değil, üstel bir eğridir; laboratuvardaki NTC'nin beta katsayısı B = 3950 alınmıştır.\n\n| Sıcaklık | NTC direnci |\n|---|---|\n| 0 °C | ≈ 33,6 kΩ |\n| 25 °C | 10 kΩ |\n| 50 °C | ≈ 3,59 kΩ |\n| 100 °C | ≈ 0,70 kΩ |\n\n### Okuma devresi\nÜst direnç 10 kΩ sabit, alt direnç NTC'dir. Sıcaklık artınca NTC küçülür, A2'deki gerilim düşer. ADC değerinden NTC direnci:\n\n```\nfloat r = 10000.0 * ham / (1024.0 - ham);\n```\n\n### Beta formülü\nDirenç R, referans R0 = 10 000 Ω (25 °C), T0 = 298,15 K olmak üzere:\n\n```\n1/T = 1/T0 + log(R / R0) / B\n```\n\nT Kelvin çıkar; Celsius için 273,15 çıkarılır. `log()` doğal logaritmadır; `log10()` değildir. Kontrol: ham = 512 ise R = 10 000 Ω, `log(1)` = 0, T = 298,15 K = 25 °C.\n\n### Güvenlik: geçersiz okuma\n`ham` 0 ya da 1023 ise bölme sıfıra gider ya da sonuç anlamsızlaşır. Bu uçlar sensörün kopuk olduğunu ya da kısa devre yaptığını düşündürür. Hesaplamadan önce bu durumu `if` ile kontrol et.\n\n### Özet\nNTC'nin direnci ısındıkça düşer ve doğrusal değildir. Önce ham değerden direnç, sonra beta formülüyle Kelvin ve Celsius sıcaklık hesaplanır. Kelvin'i Celsius'a çevirmeyi ve doğal logaritma kullanmayı unutma. 0 ya da 1023 okuması sensör hatasının işaretidir.",
          "concepts": [
            {
              "term": "NTC termistör",
              "definition": "Sıcaklık arttıkça direnci azalan, doğrusal olmayan bir direnç.",
              "example": "10 kΩ NTC, 25 °C'de 10 kΩ, 50 °C'de yaklaşık 3,59 kΩ'dur.",
              "pitfall": "Direncin sıcaklıkla doğrusal değiştiğini sanmak: ham değerle sıcaklık arasında düz bir çizgi yoktur."
            },
            {
              "term": "NTC direnci hesabı",
              "definition": "NTC alttayken ham değerden direnç: R = 10000.0 × ham / (1024 − ham).",
              "example": "ham = 512 ise R = 10 000 Ω (25 °C).",
              "pitfall": "Sabit direnç 10 kΩ değilse kodda 10000 değerini güncellememek: sıcaklık hep yanlış çıkar."
            },
            {
              "term": "Beta formülü",
              "definition": "Dirençten sıcaklık veren yaklaşık model: 1/T = 1/T0 + log(R/R0) / B (Kelvin).",
              "example": "R = R0 olduğunda log(1) = 0 ve T = T0 = 298,15 K = 25 °C.",
              "pitfall": "Beta formülünü her sıcaklıkta kusursuz sanmak: en doğru olduğu yer 25 °C civarıdır."
            },
            {
              "term": "Kelvin ve Celsius",
              "definition": "Kelvin = Celsius + 273,15. Beta formülü Kelvin verir.",
              "example": "312,15 K = 39 °C.",
              "pitfall": "273,15 çıkarmayı unutmak: 25 yerine 298 gibi sayılar görürsün."
            },
            {
              "term": "log()",
              "definition": "Arduino'da doğal logaritma (ln) fonksiyonu.",
              "example": "log(1.0) sonucu 0 verir.",
              "pitfall": "log10() kullanmak: formül doğal logaritma ister, sonuç yanlış çıkar."
            },
            {
              "term": "Sensör hatası denetimi",
              "definition": "ham 0 ya da 1023 ise ölçümü geçersiz sayıp hesap yapmamak.",
              "example": "if (ham <= 0 || ham >= 1023) { Serial.println(\"sensor hatasi\"); }",
              "pitfall": "Denetimsiz bölmek: kopuk sensörde sıfıra bölme ve anlamsız sıcaklık."
            }
          ],
          "quiz": [
            {
              "id": "m3h3d13-q1",
              "kind": "numeric",
              "prompt": "NTC alt dirençte, 10 kΩ sabit direnç üstte. A2'de ham = 614 okunuyor. NTC'nin direnci yaklaşık kaç ohmdur? (R = 10000 × ham / (1024 − ham))",
              "answer": 14976,
              "tolerance": 5,
              "unit": "Ω",
              "explanation": "R = 10000 × 614 / (1024 − 614) = 6 140 000 / 410 ≈ 14 976 Ω. 10 kΩ'dan büyük olduğu için ortam 25 °C'den soğuktur (yaklaşık 16 °C).",
              "skills": [
                "sensor-ntc",
                "volt-divider"
              ]
            },
            {
              "id": "m3h3d13-q2",
              "kind": "numeric",
              "prompt": "Beta formülü Kelvin cinsinden 312,15 K verdi. Bu kaç °C'dir?",
              "answer": 39,
              "tolerance": 0.05,
              "unit": "°C",
              "explanation": "°C = K − 273,15 = 312,15 − 273,15 = 39 °C.",
              "skills": [
                "sensor-ntc"
              ]
            },
            {
              "id": "m3h3d13-q3",
              "kind": "mcq",
              "prompt": "NTC alt direnç, 10 kΩ sabit direnç üstte. Ortam ısınınca A2'deki gerilim ne olur?",
              "options": [
                "Artar, çünkü NTC büyür",
                "Azalır, çünkü NTC direnci düşer",
                "Değişmez",
                "Önce artar sonra azalır"
              ],
              "answer": 1,
              "explanation": "NTC'nin direnci sıcaklıkla azalır. Alt direnç küçülünce Vout = 5 × R_ntc / (10 kΩ + R_ntc) düşer. Yani sıcaklık arttıkça ham değer azalır.",
              "skills": [
                "sensor-ntc",
                "volt-divider"
              ]
            },
            {
              "id": "m3h3d13-q4",
              "kind": "predict-output",
              "prompt": "Seri monitörde ne görünür? (ham = 512 için R = 10000 Ω olur.)\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  float r = 10000.0;\n  float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);\n  Serial.println(tK - 273.15, 1);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "298.2",
                "0.0",
                "25.0",
                "sensor hatasi"
              ],
              "answer": 2,
              "explanation": "r / 10000 = 1 ve log(1) = 0, parantez içi 1 / 298,15 olur, tK = 298,15 K. 273,15 çıkarınca 25,0 °C yazılır. 298.2 yazılsaydı Celsius'a çevirmeyi unutmuş olurduk.",
              "skills": [
                "sensor-ntc",
                "prog-debug"
              ]
            },
            {
              "id": "m3h3d13-q5",
              "kind": "find-bug",
              "prompt": "Sıcaklık hesaplanıyor ama sonuçlar hep yanlış çıkıyor. Tek hata hangi satırda?\n\n```\nint ham = analogRead(A2);\nfloat r = 10000.0 * ham / (1024.0 - ham);\nfloat tK = 1.0 / (1.0 / 298.15 + log10(r / 10000.0) / 3950.0);\nfloat tC = tK - 273.15;\n```",
              "options": [
                "int ham = analogRead(A2);",
                "float r = 10000.0 * ham / (1024.0 - ham);",
                "float tK = ... log10(r / 10000.0) ...",
                "float tC = tK - 273.15;"
              ],
              "answer": 2,
              "explanation": "Beta formülü doğal logaritma ister; Arduino'da bu log()'dur. log10() 10 tabanlı logaritma verir ve sıcaklık hep kayar. Diğer satırlar doğrudur: 10000.0 ondalıklıdır ve Kelvin'den 273,15 çıkarılıyor.",
              "skills": [
                "sensor-ntc",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "map, constrain, kalibrasyon ve yumuşatma",
          "durationMin": 25,
          "problem": "Sensörün verdiği sayılar hiç \"temiz\" değildir: LDR'n bir ortamda 120 ile 880 arasında, başka bir ortamda 60 ile 950 arasında oynayabilir. Üstelik sayı sürekli titrer. Programın bu karmaşada nasıl kararlı davranır?",
          "contentMd": "### map ve constrain\n`map(x, girişMin, girişMax, çıkışMin, çıkışMax)`, bir sayıyı bir aralıktan başka aralığa orantılı olarak taşır. Örneğin 0-1023 arasındaki değeri 0-100 yüzdeye çevirir:\n\n```cpp\nint yuzde = map(ham, 0, 1023, 0, 100);\n```\n\nİki şeyi bilmen lazım:\n1. `map` **tam sayı** hesabı yapar. Sonuçtaki virgülden sonrası atılır.\n2. `map` sonucu sınırlamaz. Giriş, verdiğin aralığın dışına çıkarsa sonuç da dışına çıkar: sonuç negatif ya da 100'ün üstünde olabilir.\n\nSınırlamak için `constrain(x, alt, üst)` kullanılır: `x` altın altındaysa `alt`, üstün üstündeyse `üst`, aradaysa `x` döner.\n\n```cpp\nint yuzde = map(ham, 200, 800, 0, 100);   // 200'ün altı negatif olur\nyuzde = constrain(yuzde, 0, 100);         // 0-100 arasında tut\n```\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Potansiyometre (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |\n| LDR + 10 kΩ direnç | 5V → LDR → **A1** → 10 kΩ → GND (12. dersteki gibi) |\n| LED (kırmızı) + 330 Ω | **D13** → 330 Ω → LED **A** (anot); LED **K** (katot) → GND |\n\n### Program 1: map ve constrain\nPotansiyometrenin 200-800 arasını yüzdeye çevirelim; uçlarda sonuç taşabilir.\n\n```cpp\n// sketch: map_constrain\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = analogRead(A0);\n  int p = map(ham, 200, 800, 0, 100);   // sınırsız\n  int k = constrain(p, 0, 100);         // sınırlı\n  Serial.print(\"ham=\");\n  Serial.print(ham);\n  Serial.print(\" p=\");\n  Serial.print(p);\n  Serial.print(\" k=\");\n  Serial.println(k);\n  delay(300);\n}\n```\n\nKaydırıcıyı tamamen sola çekince `p` negatif, sağa çekince 100'ün üstüne çıkacak; `k` ise 0 ve 100'de kalacak.\n\n### Kalibrasyon\nSensörün gerçek en küçük ve en büyük değeri her ortamda farklıdır. **Kalibrasyon**, bu aralığı program açılırken ölçmektir. Aşağıdaki sketch ilk 3 saniye boyunca (D13 yanıkken) LDR'yi izler. Bu sürede LDR'nin **Işık** kaydırıcısını önce en sola (karanlık), sonra en sağa (aydınlık) çek. Sonra ölçtüğü en küçük ve en büyük değeri aralık yapıp ışığı 0-100 arası yüzde olarak bildirir.\n\n```cpp\n// sketch: kalibrasyon\nint enAz = 1023;\nint enCok = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(13, OUTPUT);\n  digitalWrite(13, HIGH);              // kalibrasyon sürüyor\n  for (int i = 0; i < 300; i++) {      // 300 x 10 ms = 3 saniye\n    int ham = analogRead(A1);\n    if (ham < enAz) {\n      enAz = ham;\n    }\n    if (ham > enCok) {\n      enCok = ham;\n    }\n    delay(10);\n  }\n  if (enCok - enAz < 50) {             // aralık çok dar: bölme hatası olmasın\n    enCok = enAz + 50;\n  }\n  digitalWrite(13, LOW);\n}\n\nvoid loop() {\n  int ham = analogRead(A1);\n  int yuzde = map(ham, enAz, enCok, 0, 100);\n  yuzde = constrain(yuzde, 0, 100);\n  Serial.print(\"ham=\");\n  Serial.print(ham);\n  Serial.print(\" yuzde=\");\n  Serial.println(yuzde);\n  delay(300);\n}\n```\n\n### Yumuşatma\nAynı ışıkta bile `analogRead` her seferinde biraz farklı sayı verir (gürültü). Basit çözüm: birkaç ölçüm alıp **ortalamasını** kullanmak. Aşağıda 16 ölçümün ortalamasını alıyoruz. Gürültü ortalamada büyük ölçüde sönümlenir. Karşılığında bir okuma biraz daha uzun sürer (16 × 3 ms ≈ 50 ms).\n\n```cpp\n// sketch: yumusatma\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int toplam = 0;\n  for (int i = 0; i < 16; i++) {\n    toplam = toplam + analogRead(A0);\n    delay(3);\n  }\n  int ort = toplam / 16;\n  Serial.print(\"ham=\");\n  Serial.print(analogRead(A0));    // karşılaştırmak için tek ölçüm\n  Serial.print(\" ort=\");\n  Serial.println(ort);\n  delay(100);\n}\n```\n\nBaşka bir yöntem de **üstel yumuşatma**dır. Her turda eski değerin %90'ını tutar, yeni ölçümden %10 alır; tek satırdır ve dizi gerektirmez:\n\n```cpp\nduzgun = duzgun * 0.9 + ham * 0.1;   // duzgun bir float değişkendir\n```\n\n### Nasıl çalışıyor?\n1. `map(ham, 200, 800, 0, 100)`: 200 → 0, 800 → 100, 500 → 50. Sınır dışı için `constrain` gerekir.\n2. Kalibrasyonda `enAz` büyük bir sayıyla (1023), `enCok` küçük bir sayıyla (0) başlar; böylece ilk ölçüm bile ikisini de günceller.\n3. 16 ölçümün toplamı en çok 16 × 1023 = 16368'dir; `int`'e sığar.\n4. Ortalama aldıkça `ort`, `ham`'dan daha az oynar.\n\n### Dene\n- `map_constrain` sketch'inde `constrain` satırını silip uçlarda ne olduğunu gör.\n- `kalibrasyon` çalışırken ışık kaydırıcısını hiç oynatma. Ne oluyor? Alttaki 50'lik koruma satırı ne işe yarıyor?\n- `yumusatma` içinde 16'yı 4 yap. `ort` ne kadar oynak olur? 64 yaparsan okuma süresi ne olur?\n\n### Sık yapılan hatalar\n- `map`'i ondalıklı sonuç bekleyerek kullanmak: `map(5, 0, 10, 0, 3)` 1 verir, 1,5 değil.\n- `map` sonucunu kırpmadan `analogWrite`'a vermek: negatif ya da 255'ten büyük değer beklenmedik parlaklık verir.\n- `enAz`'ı 0 ile, `enCok`'u 1023 ile başlatmak: ölçümler hiçbir zaman bu uçlara varmaz, aralık hiç daralmaz.\n- Kalibrasyon sırasında ışık kaydırıcısını uçlara götürmeyi unutmak: aralık dar kalır.\n- `toplam`'ı sıfırlamayı unutmak: ortalama sürekli büyür.",
          "question": "Kalibrasyonu program açılırken bir kez yapmak mı daha iyi, yoksa sürekli güncel tutmak mı? Gün boyunca ışık değiştiğinde her birinin avantajı ve riski ne olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- `map` ile bir sayıyı başka bir aralığa orantılı taşımayı\n- `map`'in tam sayı hesabı yaptığını ve sınırlamadığını\n- `constrain` ile sonucu kırpmayı\n- Kalibrasyonla sensörün gerçek en küçük ve en büyük değerini bulmayı\n- Ortalama ve üstel yumuşatma ile gürültüyü azaltmayı\n\n### Önceden bilmen gerekenler\nDers 4'te `for` döngüsü; ders 11'de ham değer aralığı (0-1023); ders 12'de LDR'nin bölücüyle okunması; ders 7'de karşılaştırma.\n\n### map: aralıktan aralığa\n`map(x, girişMin, girişMax, çıkışMin, çıkışMax)` bir sayıyı orantılı taşır. Formül:\n\n```\n(x - girişMin) * (çıkışMax - çıkışMin) / (girişMax - girişMin) + çıkışMin\n```\n\nÖrnek: `map(500, 200, 800, 0, 100)` = 300 × 100 / 600 = 50. İki özelliği vardır: tam sayı hesabıdır (virgülden sonrası atılır, 116,67 → 116) ve giriş aralığın dışındaysa çıkış da dışarı taşar.\n\n### constrain: sınırı sabitle\n`constrain(x, alt, üst)` x'i `alt` ile `üst` arasında tutar. `map` ile birlikte kullanılır: önce `map`, sonra `constrain`. `map(100, 200, 800, 0, 100)` sonucu −16 olur; `constrain(−16, 0, 100)` ise 0 verir.\n\n### Kalibrasyon\nAynı sensör farklı ortamlarda farklı aralıklarda çalışır. **Kalibrasyonda** program açılırken sensör bir süre izlenir, görülen en küçük ve en büyük değer kaydedilir. Başlangıç değerleri ters seçilir: `enAz = 1023`, `enCok = 0`; böylece ilk ölçüm ikisini de günceller. Aralık çok daralırsa `map` bölmesi bozulur, bu yüzden en az bir fark (örneğin 50) zorunlu tutulur.\n\n### Yumuşatma\n`analogRead` aynı ışıkta bile biraz oynar; buna **gürültü** denir. İki basit yöntem vardır:\n\n```\nort = toplam / 16;                   // 16 ölçümün ortalaması\nduzgun = duzgun * 0.9 + ham * 0.1;   // üstel yumuşatma\n```\n\nOrtalama gürültüyü azaltır ama okuma uzar (16 ölçüm × 3 ms ≈ 48 ms). Üstel yumuşatmada yeni değer yavaş etki eder.\n\n### Özet\n`map` bir aralığı orantılı taşır, tam sayı çalışır ve sınırlamaz; `constrain` sonucu kırpar. Kalibrasyon sensörün gerçek aralığını program açılırken öğrenir. Ortalama ve üstel yumuşatma gürültüyü azaltır, karşılığında tepkiyi biraz yavaşlatır.",
          "concepts": [
            {
              "term": "map()",
              "definition": "Bir sayıyı bir aralıktan başka bir aralığa orantılı taşır; tam sayı hesabı yapar.",
              "example": "map(500, 200, 800, 0, 100) sonucu 50 verir.",
              "pitfall": "Ondalıklı sonuç beklemek: map(5, 0, 10, 0, 3) 1,5 değil 1 verir."
            },
            {
              "term": "constrain()",
              "definition": "Bir sayıyı alt ve üst sınır arasında tutar.",
              "example": "constrain(-16, 0, 100) sonucu 0, constrain(116, 0, 100) sonucu 100 verir.",
              "pitfall": "map sonucunu kırpmadan analogWrite'a vermek: negatif ya da 255'ten büyük değer beklenmedik parlaklık üretir."
            },
            {
              "term": "Kalibrasyon",
              "definition": "Program açılırken sensörün gerçek en küçük ve en büyük değerini ölçmek.",
              "example": "İlk 3 saniye LDR izlenir, enAz ve enCok kaydedilir, sonra map bu aralıkla çalışır.",
              "pitfall": "Kalibrasyon sırasında sensörü uçlara götürmemek: aralık dar kalır."
            },
            {
              "term": "Gürültü",
              "definition": "Aynı koşulda bile analogRead'in bir iki birim oynaması.",
              "example": "Pot hiç oynamasa da okuma 511, 512, 513 arasında gidip gelebilir.",
              "pitfall": "Tek ölçüme güvenip eşiğe göre karar vermek: değer eşik civarında titreşir."
            },
            {
              "term": "Ortalama alma",
              "definition": "Birkaç ölçümün toplamını sayıya bölerek gürültüyü azaltmak.",
              "example": "16 ölçüm toplanır, toplam / 16 alınır.",
              "pitfall": "Toplamı sıfırlamayı unutmak: ortalama her turda büyür."
            },
            {
              "term": "Üstel yumuşatma",
              "definition": "Her turda eski değerin büyük kısmını tutup yeni ölçümden küçük pay almak.",
              "example": "duzgun = duzgun * 0.9 + ham * 0.1; (duzgun float olmalı)",
              "pitfall": "duzgun'ü int tanımlamak: küçük artışlar tam sayıya yuvarlanıp kaybolur."
            }
          ],
          "quiz": [
            {
              "id": "m3h3d14-q1",
              "kind": "numeric",
              "prompt": "map(100, 200, 800, 0, 100) ne döndürür? (map tam sayı hesabı yapar; (x − 200) × 100 / 600 işlemi sıfıra doğru kesilir.)",
              "answer": -16,
              "tolerance": 0,
              "explanation": "(100 − 200) × 100 / 600 = −10000 / 600 = −16,67; tam sayı hesabında −16 olur. Giriş aralığın (200-800) altında olduğu için sonuç negatif çıktı; map sonucu sınırlamaz.",
              "skills": [
                "map-constrain"
              ]
            },
            {
              "id": "m3h3d14-q2",
              "kind": "predict-output",
              "prompt": "Seri monitörde ne görünür?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  int p = map(900, 200, 800, 0, 100);\n  p = constrain(p, 0, 100);\n  Serial.println(p);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "116",
                "117",
                "100",
                "0"
              ],
              "answer": 2,
              "explanation": "map: (900 − 200) × 100 / 600 = 116 (116,67 kesilir). Sonra constrain 116'yı üst sınır olan 100'e çeker. 116 yazdırmak constrain'i unutmak olurdu; 117 yuvarlama sanmaktır, map kesme yapar.",
              "skills": [
                "map-constrain",
                "prog-debug"
              ]
            },
            {
              "id": "m3h3d14-q3",
              "kind": "find-bug",
              "prompt": "Kalibrasyon döngüsü sensör aralığını bulamıyor: enAz hep 0, enCok hep 1023 kalıyor. Hata hangi satırda?\n\n```\nint enAz = 0;\nint enCok = 1023;\nfor (int i = 0; i < 300; i++) {\n  int ham = analogRead(A1);\n  if (ham < enAz) enAz = ham;\n  if (ham > enCok) enCok = ham;\n  delay(10);\n}\n```",
              "options": [
                "Başlangıç değerleri: enAz = 0 ve enCok = 1023 ters olmalı",
                "for (int i = 0; i < 300; i++)",
                "int ham = analogRead(A1);",
                "delay(10);"
              ],
              "answer": 0,
              "explanation": "enAz 0 ile başlarsa hiçbir ölçüm 0'dan küçük olmaz; enCok 1023 ile başlarsa hiçbiri 1023'ten büyük olmaz. Doğrusu enAz = 1023, enCok = 0 ile başlamaktır. Döngü, okuma ve bekleme satırları doğrudur.",
              "skills": [
                "calibration-smoothing",
                "prog-debug"
              ]
            },
            {
              "id": "m3h3d14-q4",
              "kind": "numeric",
              "prompt": "duzgun = duzgun * 0.9 + ham * 0.1; satırı çalışmadan önce duzgun = 100 ve ham = 200. Satırdan sonra duzgun kaç olur?",
              "answer": 110,
              "tolerance": 0.01,
              "explanation": "100 × 0,9 + 200 × 0,1 = 90 + 20 = 110. Ham 100 birim sıçrasa da düzgün değer yalnız 10 birim ilerledi; bu yumuşatmanın etkisidir.",
              "skills": [
                "calibration-smoothing"
              ]
            },
            {
              "id": "m3h3d14-q5",
              "kind": "mcq",
              "prompt": "16 ölçümün ortalamasını almak ne sağlar ve bedeli nedir?",
              "options": [
                "Okuma hızlanır, gürültü artar",
                "Gürültü azalır, okuma biraz uzar",
                "Gürültü azalır, okuma hızı değişmez",
                "Sensör aralığı genişler, gürültü aynı kalır"
              ],
              "answer": 1,
              "explanation": "Ortalama gürültüyü sönümler ama 16 ölçüm 16 kez bekleme ve okuma demektir; bu derste 16 × 3 ms ≈ 48 ms sürer. Yani daha kararlı ama biraz daha yavaş.",
              "skills": [
                "calibration-smoothing",
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Proje: Akıllı gece lambası",
          "durationMin": 35,
          "problem": "Oda ışığı kapanınca gece lambası kendiliğinden yansa, sabah güneş doğunca sönse ve üstelik ısınırsa kendini kapatsa nasıl olurdu? Bu haftanın üç sensörünü tek bir akıllı cihazda birleştireceğiz.",
          "contentMd": "### Hedef\n- **LDR (A1):** ortam karardıkça lamba parlaklaşır, aydınlanınca söner.\n- **Potansiyometre (A0):** lambanın en yüksek parlaklığını belirler (gece için çok parlak olmasın).\n- **NTC (A2):** ortam 40 °C'yi aşarsa uyarı LED'i (D13) yanar ve lamba kapanır.\n- **Seri monitör:** her turda ışık, parlaklık ve sıcaklık yazılır.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Potansiyometre (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |\n| LDR | 1. ucu → 5V; 2. ucu → **A1** |\n| 10 kΩ direnç (LDR için) | 1. ucu **A1**, 2. ucu GND |\n| NTC termistör (10 kΩ) | 1. ucu → **A2**; 2. ucu → GND |\n| 10 kΩ direnç (NTC için) | 1. ucu 5V, 2. ucu **A2** |\n| LED (sarı ya da beyaz) = lamba | **D11** → 330 Ω direnç → LED **A**; LED **K** → GND |\n| LED (kırmızı) = uyarı | **D13** → 330 Ω direnç → LED **A**; LED **K** → GND |\n\nLED'in rengine göre direnç değeri değişebilir; 330 Ω kırmızı LED içindir. Sarı ve beyaz LED'lerde de 330 Ω genelde güvenli bir başlangıçtır (laboratuvar akım sınırı aşılırsa uyarı verir). Beyaz LED, sarıya göre biraz daha az parlak görünür; bu, LED'in ileri geriliminin farklı olmasındandır.\n\n### Aşama 1: Işığa göre parlaklık\nÖnce yalnızca LDR ve lamba. Karanlıkta (`ham` küçükken) parlaklık yüksek olmalı. `map`'in çıkış aralığını ters yazarak (255'ten 0'a) bunu sağlarız. Aralığın dışına taşmaması için `constrain` ekliyoruz.\n\n`KARANLIK` ve `AYDINLIK` değerlerini 14. dersteki gibi, LDR'nin ışık kaydırıcısını en uçlara götürüp seri monitörden okuyarak belirleyebilirsin.\n\n```cpp\n// sketch: lamba_adim1\nconst int KARANLIK = 150;   // bunun altı: tam karanlık\nconst int AYDINLIK = 700;   // bunun üstü: oda aydınlık\n\nvoid setup() {\n  pinMode(11, OUTPUT);\n}\n\nvoid loop() {\n  int isik = analogRead(A1);\n  int parlaklik = map(isik, KARANLIK, AYDINLIK, 255, 0);\n  parlaklik = constrain(parlaklik, 0, 255);\n  analogWrite(11, parlaklik);\n  delay(50);\n}\n```\n\n`const int`, değeri hiç değişmeyen bir sayı tanımlar. Ayar sayılarını başa koymak, sonradan bulup değiştirmeyi kolaylaştırır.\n\n### Aşama 2: Tam akıllı gece lambası\nŞimdi potansiyometre, NTC koruması ve yumuşatmayı ekliyoruz:\n\n1. Potansiyometre `enYuksek` değerini belirler (0-255).\n2. LDR 8 ölçümün ortalaması olarak okunur; lamba titremez.\n3. NTC'den sıcaklık hesaplanır (13. ders). Sıcaklık sınırı aşılırsa uyarı yanar, lamba kapanır.\n4. `map` çıkışı artık 255 yerine `enYuksek`'ten 0'a gider.\n\n```cpp\n// sketch: gece_lambasi\nconst int KARANLIK = 150;       // bunun altı: tam karanlık\nconst int AYDINLIK = 700;       // bunun üstü: oda aydınlık\nconst float SICAK_SINIR = 40.0; // bu sıcaklıkta lamba kapanır\n\nvoid setup() {\n  pinMode(11, OUTPUT);   // lamba (PWM)\n  pinMode(13, OUTPUT);   // sıcaklık uyarısı\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // 1. Potansiyometre: en yüksek parlaklık (0-255)\n  int enYuksek = analogRead(A0) / 4;\n\n  // 2. LDR: 8 ölçümün ortalaması\n  int toplam = 0;\n  for (int i = 0; i < 8; i++) {\n    toplam = toplam + analogRead(A1);\n    delay(3);\n  }\n  int isik = toplam / 8;\n\n  // 3. NTC: sıcaklık (beta formülü, B = 3950)\n  float sicaklik = -99.0;                   // -99: geçerli ölçüm yok\n  int hamS = analogRead(A2);\n  if (hamS > 0 && hamS < 1023) {\n    float r = 10000.0 * hamS / (1024.0 - hamS);\n    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);\n    sicaklik = tK - 273.15;\n  }\n\n  // 4. Karar: karanlıkta enYuksek, aydınlıkta 0\n  int parlaklik = map(isik, KARANLIK, AYDINLIK, enYuksek, 0);\n  parlaklik = constrain(parlaklik, 0, enYuksek);\n\n  if (sicaklik > SICAK_SINIR) {\n    parlaklik = 0;                          // çok sıcak: lamba kapansın\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(13, LOW);\n  }\n  analogWrite(11, parlaklik);\n\n  Serial.print(\"isik=\");\n  Serial.print(isik);\n  Serial.print(\" parlaklik=\");\n  Serial.print(parlaklik);\n  Serial.print(\" sicaklik=\");\n  Serial.println(sicaklik, 1);\n  delay(200);\n}\n```\n\n### Nasıl çalışıyor?\n1. `analogRead(A0) / 4` potansiyometreyi 0-255 arasına indirir, `analogWrite`'ın istediği aralık budur.\n2. `map(isik, KARANLIK, AYDINLIK, enYuksek, 0)`: karanlıkta `enYuksek`, aydınlıkta 0, arada orantılı değer verir. Çıkış aralığını ters yazmak `map`'te serbesttir.\n3. `constrain` ışık `KARANLIK`'tan daha karanlıksa ya da `AYDINLIK`'tan daha aydınlıksa parlaklığı sınırda tutar.\n4. Sıcaklık `-99` iken (sensör kopuk) uyarı çıkmaz. Bu seçim bilinçlidir: kopuk sensör yüzünden lambanın hiç yanmaması, daha kötü bir sürpriz olurdu. Seri monitörde `sicaklik=-99.0` görürsen NTC bağlantısını kontrol et.\n5. Her turda `delay` toplamı yaklaşık 224 ms olduğu için lamba, ışık değişimlerine hızlı yanıt verir.\n\nBeklenen davranış (örnek):\n\n| Durum | Sonuç |\n|---|---|\n| Potansiyometre sonda, oda karanlık | Lamba tam parlak |\n| Potansiyometre ortada, oda karanlık | Lamba yarı parlaklıkta |\n| Oda aydınlık | Lamba sönük |\n| NTC 40 °C'nin üstünde | Lamba söner, D13 yanar |\n\n### Dene\n- Potansiyometrenin **Konum** kaydırıcısını oynat; karanlıkta lambanın en yüksek parlaklığı değişiyor mu?\n- LDR'nin **Işık** kaydırıcısını yavaş yavaş sola çek. Lamba kademeli mi parlaklaşıyor?\n- `SICAK_SINIR`'ı oda sıcaklığının biraz altına çek ve uyarının geldiğini gör (ya da NTC'nin **Sıcaklık** kaydırıcısını 45 °C'ye çek).\n- `AYDINLIK` değerini ayarla. Lamba hangi ışıkta tamamen sönüyor?\n- Zor görev: sabit `KARANLIK` ve `AYDINLIK` yerine 14. dersteki kalibrasyonu `setup()` içine ekle.\n\n### Sık yapılan hatalar\n- LDR ve direncin yerini ters bağlamak: lamba karanlıkta söner, aydınlıkta yanar. `map`'in çıkış aralığını ters çevirerek ya da bağlantıyı düzelterek çöz.\n- `constrain`'i unutmak: `map` aralık dışında negatif ya da 255'ten büyük sayı üretir, `analogWrite` bunu beklemediğin bir parlaklığa çevirir.\n- NTC'nin sabit direncini 10 kΩ yerine başka bir değerle bağlayıp koddaki `10000.0` sayısını değiştirmemek: sıcaklık hep yanlış çıkar.\n- Gerçek bir gece lambasında lambayı LDR'ye çok yaklaştırmak: lamba yanınca LDR kendi ışığını görür ve lamba sönüp yanmaya başlar. Laboratuvarda LDR'nin ışığı yalnız kaydırıcıdan gelir, bu etkiyi modellemez; ama \"Konuşalım\"daki soru bu yüzden önemli.\n- Potansiyometreyi en sola çevirip \"lamba bozuk\" sanmak: `enYuksek` 0 ise lamba hiç yanmaz.",
          "question": "Lamba LDR'nin kendi ışığını görürse ne olur ve bunu yazılımla nasıl azaltabilirsin? Gece lambasına bir de buton eklesen, bu butonu hangi derste öğrendiğin yöntemle okurdun?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Üç sensörü (LDR, potansiyometre, NTC) tek programda birleştirmeyi\n- Önce küçük bir sürüm (aşama) yazıp sonra genişletmeyi\n- `map` çıkış aralığını ters yazarak \"karanlıkta parlak\" davranışı elde etmeyi\n- Ayar sayılarını `const` ile başa koymayı\n- Birden çok koşulun önceliğini (güvenlik, sonra normal davranış) kurmayı\n\n### Önceden bilmen gerekenler\nDers 11'den `analogRead` ve `ham / 4`; ders 12'den LDR bölücüsü; ders 13'ten NTC sıcaklığı; ders 14'ten `map`, `constrain` ve ortalama; ders 5'ten proje planı.\n\n### Önce plan\nKodu yazmadan önce her girdinin neyi etkilediğini yaz:\n\n| Girdi | Pin | Etkisi |\n|---|---|---|\n| LDR | A1 | Ortam karardıkça lamba parlar |\n| Potansiyometre | A0 | Lambanın en yüksek parlaklığı |\n| NTC | A2 | 40 °C'yi aşarsa lamba kapanır, uyarı LED'i yanar |\n\nÇıkışlar: lamba D11 (PWM), uyarı D13.\n\n### Ters map\nKaranlıkta `ham` küçük olduğundan parlaklık büyük olmalı. Bunun için `map` çıkış aralığı ters yazılır:\n\n```\nmap(isik, KARANLIK, AYDINLIK, enYuksek, 0)\n```\n\nÖrnek: KARANLIK = 150, AYDINLIK = 700, enYuksek = 200, isik = 425 ise (425−150) × (0−200) / 550 + 200 = 100 çıkar. Işık 150'de 200, 700'de 0 olur. Taşmayı `constrain(…, 0, enYuksek)` engeller.\n\n### Öncelik sırası\nÖnce normal parlaklık hesaplanır, sonra güvenlik koşulu bunu ezer: sıcaklık sınırı aşıldıysa parlaklık 0 yapılır ve uyarı yakılır. Güvenlik kontrolünü sonda yazmak, öncekilerin onu bozmasını önler.\n\n### Aşamalı geliştirme\nÖnce yalnız LDR ve lamba (aşama 1). Çalışınca potansiyometre, ortalama ve NTC eklenir (aşama 2). Her eklemeden sonra seri monitörde `isik`, `parlaklik` ve `sicaklik` değerlerini izlersen hatayı hangi ekleme getirdiğini hemen bulursun.\n\n### Özet\nProje, analog haftanın üç sensörünü birleştirir: LDR parlaklığı belirler, potansiyometre üst sınırı koyar, NTC güvenlik sağlar. Ters `map` ile karanlıkta parlak davranış elde edilir. Önce plan, sonra küçük sürüm, sonra eklemeler: hata aramak kolaylaşır.",
          "concepts": [
            {
              "term": "Ters map",
              "definition": "map'in çıkış aralığını büyükten küçüğe yazarak girdi arttıkça çıktıyı azaltmak.",
              "example": "map(isik, 150, 700, 200, 0): karanlıkta 200, aydınlıkta 0.",
              "pitfall": "Aralığı ters yazmayı unutmak: lamba karanlıkta söner, aydınlıkta yanar."
            },
            {
              "term": "const",
              "definition": "Değeri hiç değişmeyen bir sayı tanımlar; ayar sayılarını başa koymak için kullanılır.",
              "example": "const int KARANLIK = 150;",
              "pitfall": "Aynı sayıyı kodun birçok yerine yazmak: sonradan hepsini bulup değiştirmek zorlaşır."
            },
            {
              "term": "Aşamalı geliştirme",
              "definition": "Önce küçük bir sürümü çalıştırıp sonra özellik eklemek.",
              "example": "Önce yalnız LDR ile lamba, sonra potansiyometre ve NTC.",
              "pitfall": "Her şeyi tek seferde yazmak: hata çıkınca nedenini bulmak zorlaşır."
            },
            {
              "term": "Güvenlik önceliği",
              "definition": "Güvenlik koşulunu normal hesaptan sonra kontrol edip sonucu ezmesine izin vermek.",
              "example": "Sıcaklık 40 °C'yi aşarsa parlaklık, hesaplanan değerden bağımsız olarak 0 yapılır.",
              "pitfall": "Güvenlik kontrolünü en başa yazıp sonra parlaklığı yeniden hesaplamak: güvenlik ezilir."
            },
            {
              "term": "Geçersiz ölçüm işareti",
              "definition": "Ölçüm yapılamadığında sıcaklığa -99 gibi imkansız bir değer vermek.",
              "example": "Seri monitörde sicaklik=-99.0 görürsen NTC bağlantısını kontrol et.",
              "pitfall": "-99 değerini gerçek sıcaklık sanmak ya da bu değerle karar vermek."
            }
          ],
          "quiz": [
            {
              "id": "m3h3d15-q1",
              "kind": "numeric",
              "prompt": "KARANLIK = 150, AYDINLIK = 700, enYuksek = 200. isik = 425 iken map(isik, KARANLIK, AYDINLIK, enYuksek, 0) kaç döndürür?",
              "answer": 100,
              "tolerance": 0,
              "explanation": "(425 − 150) × (0 − 200) / (700 − 150) + 200 = 275 × (−200) / 550 + 200 = −100 + 200 = 100. 425 aralığın tam ortasıdır, bu yüzden çıkış da 200 ile 0'ın ortasıdır.",
              "skills": [
                "map-constrain",
                "analog-adc"
              ]
            },
            {
              "id": "m3h3d15-q2",
              "kind": "find-bug",
              "prompt": "Gece lambası aydınlıkta yanıyor, karanlıkta sönük kalıyor. Bağlantılar doğru (LDR üstte, 10 kΩ altta). Hata hangi satırda?\n\n```\nint isik = analogRead(A1);\nint parlaklik = map(isik, KARANLIK, AYDINLIK, 0, 255);\nparlaklik = constrain(parlaklik, 0, 255);\nanalogWrite(11, parlaklik);\n```",
              "options": [
                "int isik = analogRead(A1);",
                "map(isik, KARANLIK, AYDINLIK, 0, 255)",
                "constrain(parlaklik, 0, 255)",
                "analogWrite(11, parlaklik);"
              ],
              "answer": 1,
              "explanation": "Işık arttıkça isik büyür; çıkış aralığı 0'dan 255'e yazıldığı için parlaklık da artar. Karanlıkta parlak istediğimiz için aralık ters yazılmalıdır: map(isik, KARANLIK, AYDINLIK, 255, 0).",
              "skills": [
                "map-constrain",
                "sensor-ldr",
                "prog-debug"
              ]
            },
            {
              "id": "m3h3d15-q3",
              "kind": "predict-output",
              "prompt": "SICAK_SINIR = 40.0, sicaklik = 42.5 ve hesaplanan parlaklik = 120. Bu kod çalışınca lamba (D11) ve uyarı LED'i (D13) ne yapar?\n\n```\nif (sicaklik > SICAK_SINIR) {\n  parlaklik = 0;\n  digitalWrite(13, HIGH);\n} else {\n  digitalWrite(13, LOW);\n}\nanalogWrite(11, parlaklik);\n```",
              "options": [
                "Lamba söner, uyarı da söner",
                "Lamba 120 parlaklıkla yanar, uyarı söner",
                "Lamba 120 parlaklıkla yanar, uyarı da yanar",
                "Lamba söner, uyarı yanar"
              ],
              "answer": 3,
              "explanation": "42,5 > 40 olduğu için if dalı çalışır: parlaklik 0 olur ve D13 yanar. analogWrite(11, 0) lambayı söndürür. Güvenlik koşulu, önceden hesaplanan 120'yi ezmiştir.",
              "skills": [
                "prog-debug",
                "digital-out"
              ]
            },
            {
              "id": "m3h3d15-q4",
              "kind": "numeric",
              "prompt": "Döngüde 8 ölçümlük ortalamanın içinde delay(3), tur sonunda delay(200) var. Yalnız delay'lerin toplamına göre bir tur kaç milisaniye sürer?",
              "answer": 224,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "8 × 3 = 24 ms ölçüm beklemesi, artı 200 ms tur sonu beklemesi: 224 ms. Gerçekte hesap süresi biraz ekler ama delay'ler baskındır. Yaklaşık 4,5 tur/saniye lambanın ışığa yeterince hızlı yanıt vermesini sağlar.",
              "skills": [
                "prog-timing",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m3h3d15-q5",
              "kind": "mcq",
              "prompt": "Gece lambası projesinde potansiyometre en sola çevrildi (enYuksek = 0) ve oda karanlık. Lamba ne yapar?",
              "options": [
                "Tam parlak yanar",
                "Yarı parlaklıkla yanar",
                "Hiç yanmaz",
                "Yanıp söner"
              ],
              "answer": 2,
              "explanation": "map çıkış aralığı 0'dan 0'a gider, constrain da 0 ile 0 arasında tutar; parlaklık 0 olur. Potansiyometre lambanın üst sınırını belirler, o 0 ise lamba bozuk değildir, sadece izin verilen en yüksek parlaklık sıfırdır.",
              "skills": [
                "analog-adc",
                "map-constrain"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "PWM, renk, ses",
      "project": "Işıklı müzik kutusu",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. PWM'i ve `analogWrite` değerinden doluluk oranı ile ortalama gerilimi hesaplamayı anlatabilir; LED parlaklığını 0-255 arasında ayarlayabilir.\n2. Ortak katotlu RGB LED'i bağlayıp üç değerle (R, G, B) istediği rengi gösterebilir.\n3. Pasif buzzer ile `tone` kullanarak nota ve melodi çalabilir; frekans ve oktav ilişkisini söyleyebilir.\n4. Parametreli ve dönüş değerli kendi fonksiyonlarını yazabilir; yerel ve global değişken farkını açıklayabilir.\n5. Plan tablosundan yola çıkarak ışık, ses ve girdiyi birleştiren Işıklı müzik kutusunu kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | PWM ve analogWrite: nefes alan LED | ~22 dk | Anlatımı oku, parlaklık basamaklarını ve nefes programını çalıştır, potansiyometreyle parlaklık ayarla, mini testi çöz. |\n| 2 | RGB LED ve renk karıştırma | ~25 dk | Üç kanalı kur, renk paletini ve gökkuşağı geçişini dene, Serial Monitor'den renk gönder. |\n| 3 | Buzzer: tone ve nota frekansları | ~22 dk | Pasif buzzer'ı bağla, La notasını, gamı ve oktavı çal, D11 çakışmasını gözle. |\n| 4 | Fonksiyonlar, kapsam, parametreler | ~25 dk | Kendi fonksiyonlarını yaz, melodiyi fonksiyonlarla çal, kapsamı Serial Monitor'de izle. |\n| 5 | Proje: Işıklı müzik kutusu | ~35 dk | Planı durum tablosuna yaz, devreyi kur, programı çalıştır, proje ölçütüyle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftalardan şunlar gerekir. Başlamadan kontrol et:\n- `delay`, `for` döngüsü ve dizi (Hafta 1).\n- `INPUT_PULLUP` ile buton okuma, `if`/`else` ve `switch` (Hafta 2).\n- Serial Monitor'den sayı okuma, `parseInt` (Hafta 2).\n- `analogRead`, `map` ve `constrain` (Hafta 3).\n- LED için seri direnç ve Ohm yasası (Hafta 1).\n\n### Kavram haritası\n- **Çıkış kontrolü:** `digitalWrite` (yalnız 0/5 V) → PWM → `analogWrite` (0-255) → doluluk oranı → ortalama gerilim\n- **Işık:** LED parlaklığı → RGB LED (R, G, B) → toplamalı karışım → ortak katot ve ortak anot\n- **Ses:** titreşim → frekans (Hz) → oktav → aktif ve pasif buzzer → `tone`/`noTone` → Timer2 çakışması (D3, D11)\n- **Program düzeni:** fonksiyon → parametre → `return` → yerel ve global kapsam\n- **Proje:** durum tablosu → fonksiyonlara bölme → tempo ve vuruş süresi → `delay`'in sınırı\n\n### Sık yapılan hatalar\n- **`analogWrite`'a 0-1023 vermek.** Beklenen aralık 0-255'tir; `map` kullan.\n- **PWM'siz pine `analogWrite` yazmak.** Yalnız D3, D5, D6, D9, D10 ve D11 (`~`) PWM yapar.\n- **RGB'de COM ucunu yanlış bağlamak.** Ortak katotta COM GND'ye gider; ortak anotta 5V'a gider ve değerler ters yazılır.\n- **Üç renk için tek direnç kullanmak.** Her kanalın kendi direnci olmalı.\n- **Aktif buzzer ile nota çalmak.** Aktif buzzer hep aynı perdeyi verir; nota için pasif tür gerekir.\n- **Notalar arasına `delay` koymamak.** `tone` beklemez; yalnız son nota duyulur.\n- **`tone` çalarken D3 ya da D11'de parlaklık ayarlamak.** Bu pinlerde PWM bozulur; ayarlı LED'leri D9 ve D10'a bağla.\n- **Fonksiyonu tanımlayıp çağırmamak** ya da **yerel değişkeni başka fonksiyonda kullanmak.**\n- **`switch` içinde `break;` unutmak.** Renkler karışır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. `analogWrite(9, 64)`, `analogWrite(9, 128)` ve `analogWrite(9, 192)` için doluluk oranını ve ortalama gerilimi elle hesapla; laboratuvarda parlaklığı karşılaştır.\n4. Bir Do-Re-Mi melodisini `notaCal(frekans, süre)` fonksiyonuyla bakmadan yaz.\n5. Kendi cümlelerinle şu soruyu cevapla: \"`tone` çalarken neden D11'e bağlı LED'in parlaklığını ayarlayamıyoruz?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Işıklı müzik kutusu)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Buzzer, RGB LED, buton ya da pot eksik; kanallar dirençsiz | Tüm parçalar doğru pinlerde ve her kanalın kendi direnci var | Bağlantılar düzenli; mavi kanalın D11'de olma nedenini açıklıyor |\n| Plan | Durum tablosu yok | Bekleme, çalma, bitiş durumları tabloda | Tablo kodla birebir uyuyor ve fonksiyon ağacı çizilmiş |\n| Program | Melodi çalmıyor ya da renkler yanlış | Buton melodiyi başlatıyor, notalar doğru renkte yanıyor, bekleme nefesi çalışıyor | Yeni nota/renk (Si, üst Do) ya da bitiş efekti eklenmiş |\n| Fonksiyonlar | Her şey `loop()` içinde | İş anlamlı fonksiyonlara bölünmüş | Parametre ve `return` yerinde kullanılmış, global değişken sayısı az |\n| Tempo | Tempo sabit ya da pot etkisiz | Pot 80-200 bpm arasında tempoyu değiştiriyor | Tempoyu vuruş süresiyle hesaplayıp açıklıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Karşılaştığı hatayı ve nasıl bulduğunu anlatıyor; `delay` sınırını söylüyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta bir parçayı \"ezberlemek\" değil, ışık, ses ve girdiyi bir arada yönetmeyi denemektir. Öğrenci ilk kez kendi komutlarını (fonksiyonları) yazar; bu, sonraki haftalardaki büyük projelerin temelidir.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: \"Hangi pine ne bağlı?\", \"Bu değer hangi aralıkta olmalı?\", \"Hangi fonksiyon çağrılmıyor olabilir?\", \"Ses nerede kesiliyor, ışık nerede değişiyor?\"\n- **Ses.** Laboratuvarda sesi duymak için ses düğmesi açık olmalıdır. Gerçek buzzer ile çalışılırken sesi uzun süre yüksek ve sürekli çaldırmak rahatsız edici olabilir; kısa süreli denemeler yeterlidir.\n- **Işık.** Parlak LED'e uzun süre doğrudan bakmak gözü yorar; gerçek devrede gerekirse bir kâğıtla yumuşatılabilir.\n- **Süre.** Proje dersi 35 dakikaya yaklaşabilir; gerekirse iki oturuma bölünebilir. Önce devre, sonra program.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders ilerleyip gerçek kart kullanılacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "PWM ve analogWrite: nefes alan LED",
          "durationMin": 22,
          "problem": "Uno'nun pinleri yalnızca iki durum bilir: 0 V ve 5 V. Peki bir LED'i \"yarım parlak\" yakmak ya da telefonun şarj ışığı gibi nefes aldırmak nasıl mümkün olur? Cevap, pini göz kırpmaktan hızlı açıp kapatmakta saklı.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| LED (kırmızı) | **A** (anot) ucu → direncin 2 ucu; **K** (katot) ucu → GND |\n| 330 Ω direnç | 1 ucu **D9**, 2 ucu LED'in A ucu |\n| Potansiyometre (yalnız son program) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |\n\nD9, \"PWM yapabilen\" pinlerden biridir. Uno'da bu pinlerin yanında `~` işareti vardır: D3, D5, D6, D9, D10, D11. Programı kod düzenleyiciye yazıp ▶ ile çalıştır; LED'in parlaklığını tuvalde izle.\n\n### PWM nedir?\nPWM (darbe genişlik modülasyonu), pini çok hızlı biçimde açıp kapatmaktır. Açık kalma süresinin tüm periyoda oranına **doluluk oranı** denir.\n\n- Doluluk %0: pin hep LOW, LED sönük.\n- Doluluk %50: pin zamanın yarısında HIGH, LED yarım parlak görünür.\n- Doluluk %100: pin hep HIGH, LED tam parlak.\n\nUno'da `analogWrite(pin, değer)` komutu PWM üretir. Değer 0 ile 255 arasındadır ve doluluk oranı `değer / 255` olur. Ortalama gerilim yaklaşık `5 V × değer / 255` kadardır. D9, D10 ve D11'deki PWM yaklaşık 490 Hz'dir: pin saniyede yaklaşık 490 kez açılıp kapanır. Göz bu hızı seçemez, yalnızca ortalama parlaklığı görür.\n\n| `analogWrite` değeri | Doluluk | Ortalama gerilim |\n|---|---|---|\n| 0 | %0 | 0 V |\n| 64 | yaklaşık %25 | yaklaşık 1,25 V |\n| 128 | yaklaşık %50 | yaklaşık 2,5 V |\n| 192 | yaklaşık %75 | yaklaşık 3,8 V |\n| 255 | %100 | 5 V |\n\n### Program 1: Parlaklık basamakları\n```cpp\n// sketch: pwm_basamak\nint seviye[] = {0, 64, 128, 192, 255};\n\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i < 5; i++) {\n    analogWrite(9, seviye[i]);   // 0-255 arası PWM değeri\n    delay(1000);\n  }\n}\n```\n\n### Program 2: Nefes alan LED\n```cpp\n// sketch: pwm_nefes\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  for (int p = 0; p <= 255; p++) {    // yavaşça parlat\n    analogWrite(9, p);\n    delay(5);\n  }\n  for (int p = 255; p >= 0; p--) {    // yavaşça söndür\n    analogWrite(9, p);\n    delay(5);\n  }\n}\n```\n\n### Program 3: Potansiyometre ile parlaklık\nÖnceki haftalarda öğrendiğin `analogRead` (0-1023) ve `map` burada işe yarıyor: okuma aralığını `analogWrite` aralığına (0-255) çeviriyoruz.\n```cpp\n// sketch: pwm_pot\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  int okunan = analogRead(A0);                 // 0-1023\n  int parlaklik = map(okunan, 0, 1023, 0, 255);  // 0-255\n  analogWrite(9, parlaklik);\n  delay(10);\n}\n```\n\n### Nasıl çalışıyor?\n1. `analogWrite(9, 64)` pini yaklaşık %25 doluluk ile açıp kapatır. Pin gerçekten \"analog\" gerilim üretmez; hızlı ve düzenli açılıp kapanır.\n2. Program 2'de `p` değeri 0'dan 255'e çıkar, sonra geri iner. Her adım 5 ms sürer; tam bir \"nefes\" yaklaşık 2,6 saniye sürer.\n3. Program 3'te potansiyometre çevrildikçe `analogRead` değeri değişir, `map` onu 0-255'e ölçekler ve LED parlaklığı potu izler.\n4. `analogWrite(pin, 0)` pini sürekli LOW, `analogWrite(pin, 255)` sürekli HIGH yapar. Bu iki uçta PWM dalgası oluşmaz.\n\n### Dene\n- Program 2'de `delay(5)` değerini 2 ve 15 yap. Nefes hızı nasıl değişiyor?\n- Program 2'de `analogWrite(9, p * p / 255)` dene. Parlaklık artışı daha doğal görünüyor mu? Göz, parlaklığı doğrusal algılamaz; karanlıkta küçük değişimleri daha iyi fark eder.\n- Direncin D9 ucundaki kabloyu D13'e taşı ve `analogWrite(13, 128)` yaz. Ne olur? (İpucu: D13'ün yanında `~` yok.)\n\n### Sık yapılan hatalar\n- PWM yapamayan bir pine `analogWrite` yazmak: o pin yalnızca LOW ya da HIGH olur, yarım parlaklık çıkmaz. Pinin yanında `~` olduğundan emin ol.\n- Değeri 255'ten büyük yazmak (ör. 1023): `analogWrite` yalnızca 0-255 bekler. Potansiyometre değerini önce `map` ile çevir.\n- LED'e direnç koymamak: PWM akımı sınırlamaz, direnç yine gerekir. Laboratuvar bunu modeller: dirençsiz LED için uyarı çıkar.\n- LED'in yarım parlak görünmesini \"gerilim düştü\" diye yorumlamak: aslında pin hızlıca açılıp kapanıyor, ortalama düşüyor.",
          "question": "Bir LED'i saniyede 5 kez açıp kapatırsan göz bunu \"yanıp sönme\" olarak görür. Saniyede 490 kez açıp kapatınca neden \"yarım parlak\" görür? Televizyon ve ekranlar bu özelliği nasıl kullanıyor olabilir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir pinin neden \"yarım parlak\" veremediğini ve PWM'in bunu nasıl çözdüğünü\n- **Doluluk oranı** kavramını ve `analogWrite` değerinden doluluk ile ortalama gerilimi hesaplamayı\n- Hangi Uno pinlerinin PWM yapabildiğini (`~` işareti)\n- Potansiyometre okumasını `map` ile `analogWrite` aralığına çevirmeyi\n\n### Önceden bilmen gerekenler\n- Ders 1: HIGH ve LOW, pinin 0 V ya da 5 V olması\n- Ders 3 ve 4: `delay` ile bekleme, `for` döngüsü ve dizi\n- Ders 11 ve 14: `analogRead` (0-1023) ve `map`\n\n### Neden yarım parlaklık yok?\n`digitalWrite` yalnız iki değer bilir: HIGH (5 V) ve LOW (0 V). LED'i 2,5 V'a \"ayarlayacak\" bir komut yoktur. Çözüm, pini çok hızlı açıp kapatmaktır. Göz bu hızlı titreşimi ayrı ayrı görmez; yalnız ortalamayı görür. Aynı şey bir el fenerini saniyede yüzlerce kez açıp kapatsan olurdu: ışık yarı güçte görünür.\n\n### PWM ve doluluk oranı\n**PWM** (darbe genişlik modülasyonu), pinin tekrar eden kısa turlarda bir süre HIGH, geri kalanında LOW olmasıdır. Bir turun kaçta kaçının HIGH olduğuna **doluluk oranı** denir.\n\n```\n%25 :  ▀▁▁▁▀▁▁▁▀▁▁▁   (4 parçadan 1'i HIGH)\n%50 :  ▀▀▁▁▀▀▁▁▀▀▁▁   (4 parçadan 2'si HIGH)\n%75 :  ▀▀▀▁▀▀▀▁▀▀▀▁   (4 parçadan 3'ü HIGH)\n```\n\nUno'da D9, D10 ve D11'in PWM frekansı yaklaşık 490 Hz'dir. Bir tur 1 / 490 yaklaşık 2 ms sürer. %25 doluluk, bu 2 ms'nin yaklaşık 0,5 ms'sinde HIGH demektir.\n\n### analogWrite ve hesap\n`analogWrite(pin, değer)` komutunda `değer` 0 ile 255 arasındadır:\n\n- Doluluk oranı = `değer / 255`\n- Ortalama gerilim yaklaşık `5 V × değer / 255`\n\nÖrnek: `analogWrite(9, 102)` için doluluk 102 / 255 = 0,4 yani %40, ortalama gerilim 2 V olur. Uçlar özeldir: 0 pini sürekli LOW, 255 sürekli HIGH yapar. Orada gerçek bir dalga oluşmaz.\n\n### Hangi pinler? Ve potansiyometre\nHer pin PWM yapamaz. Uno'da PWM pinleri D3, D5, D6, D9, D10 ve D11'dir; kartta numaralarının yanında `~` işareti vardır. D13 gibi PWM'siz bir pinde `analogWrite` yarım parlaklık vermez, pin yalnız HIGH ya da LOW olur.\n\n`analogRead` 0-1023, `analogWrite` ise 0-255 verir. İkisini bağlamak için `map(okunan, 0, 1023, 0, 255)` yazarsın. Böylece potansiyometreyi çevirdikçe LED parlaklığı değişir.\n\n### Özet\nPWM, pini çok hızlı açıp kapatarak ortalama bir gerilim üretir. `analogWrite(pin, değer)` ile değer 0-255 arasında verilir ve doluluk oranı değer / 255 olur. Yalnız `~` işaretli pinler PWM yapabilir. Potansiyometre gibi 0-1023 aralığındaki bir okumayı `map` ile 0-255'e çevirerek parlaklığı elle ayarlayabilirsin.",
          "concepts": [
            {
              "term": "PWM",
              "definition": "Pini çok hızlı biçimde açıp kapatarak ortalama bir gerilim elde etme yöntemi (darbe genişlik modülasyonu).",
              "example": "Pin saniyede 490 kez açılıp kapanır ve yarı süre HIGH kalırsa LED yarım parlak görünür.",
              "pitfall": "PWM'in pinde gerçekten 2,5 V gibi sabit bir gerilim ürettiğini sanmak; pin hâlâ yalnız 0 V ve 5 V arasında gidip gelir."
            },
            {
              "term": "Doluluk oranı",
              "definition": "Bir PWM turunun ne kadarının HIGH geçtiği; yüzde olarak ya da 0 ile 1 arasında söylenir.",
              "example": "Bir turun dörtte biri HIGH ise doluluk %25'tir.",
              "pitfall": "Doluluğu parlaklıkla aynı şey sanmak; parlaklık doluluğa bağlıdır ama göz bunu doğrusal algılamaz."
            },
            {
              "term": "analogWrite()",
              "definition": "PWM pininin doluluğunu 0-255 arası bir değerle ayarlayan komut.",
              "example": "analogWrite(9, 128) D9'u yaklaşık %50 doluluğa getirir.",
              "pitfall": "analogWrite'a analogRead'in 0-1023 değerini doğrudan vermek; önce map ile 0-255'e çevirmelisin."
            },
            {
              "term": "PWM pinleri (~)",
              "definition": "Uno'da D3, D5, D6, D9, D10 ve D11. Kartta numaralarının yanında ~ işareti bulunur.",
              "example": "Nefes alan LED için D9 uygundur; D13 uygun değildir.",
              "pitfall": "PWM'siz bir pinde analogWrite ile yarım parlaklık beklemek; o pin yalnız HIGH ya da LOW olur."
            },
            {
              "term": "Ortalama gerilim",
              "definition": "Pinin bir tur boyunca ortalama verdiği gerilim: yaklaşık 5 V × değer / 255.",
              "example": "analogWrite(9, 255) için 5 V, değer 0 için 0 V, 128 için yaklaşık 2,5 V.",
              "pitfall": "Ortalama gerilim düşünce LED'e direnç gerekmediğini sanmak; PWM akımı sınırlamaz, direnç yine şarttır."
            }
          ],
          "quiz": [
            {
              "id": "m3h4d1-q1",
              "kind": "mcq",
              "prompt": "analogWrite(9, 128) yazınca D9'a bağlı LED neden yarım parlak görünür?",
              "options": [
                "Pin gerçekten 2,5 V'luk sabit bir gerilim verir",
                "Pin saniyede yaklaşık 490 kez açılıp kapanır, doluluk yaklaşık %50 olur ve göz ortalamayı görür",
                "Kart LED'e giden akımı yarıya böler",
                "128 değeri pini yarım güçte çalışan özel bir kipe sokar"
              ],
              "answer": 1,
              "explanation": "analogWrite pinde sabit bir ara gerilim üretmez; pini çok hızlı açıp kapatır. 128 / 255 yaklaşık %50 doluluk eder ve göz titreşimi ayıramadığı için ortalama parlaklığı görür. Sabit 2,5 V ya da akımı bölmek diye bir şey yoktur.",
              "skills": [
                "pwm-output"
              ]
            },
            {
              "id": "m3h4d1-q2",
              "kind": "numeric",
              "prompt": "D10 pinine analogWrite(10, 153) yazıldı. Pinin ortalama gerilimi yaklaşık kaç volttur? (Ortalama = 5 V × değer / 255)",
              "answer": 3,
              "tolerance": 0.05,
              "unit": "V",
              "explanation": "153 / 255 = 0,6 yani %60 doluluk. Ortalama gerilim 5 V × 0,6 = 3 V olur. Pin yine yalnız 0 V ve 5 V arasında gider; 3 V yalnız ortalamadır.",
              "skills": [
                "pwm-output"
              ]
            },
            {
              "id": "m3h4d1-q3",
              "kind": "predict-output",
              "prompt": "D9 pinine dirençle kırmızı LED bağlı. Bu sketch çalışınca LED ne yapar?\n\n```\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(9, 0);\n  delay(500);\n  analogWrite(9, 255);\n  delay(500);\n}\n```",
              "options": [
                "Sürekli yarım parlak yanar",
                "Sürekli tam parlak yanar",
                "Yarım saniye sönük, yarım saniye tam parlak: yanıp söner",
                "Hiç yanmaz"
              ],
              "answer": 2,
              "explanation": "analogWrite(9, 0) pini sürekli LOW, analogWrite(9, 255) sürekli HIGH yapar; bu iki uçta PWM dalgası oluşmaz. LED yarım saniye söner, yarım saniye tam parlak yanar. Yarım parlaklık için 128 gibi bir ara değer gerekirdi.",
              "skills": [
                "pwm-output",
                "prog-timing"
              ]
            },
            {
              "id": "m3h4d1-q4",
              "kind": "find-bug",
              "prompt": "Potansiyometre A0'a, LED D9'a bağlı. Pot çevrilince LED parlaklığı beklendiği gibi düzgün artmıyor. Hatalı satır hangisi?\n\n```\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  int okunan = analogRead(A0);\n  analogWrite(9, okunan);\n  delay(10);\n}\n```",
              "options": [
                "analogRead(A0): A0 yerine 0 yazılmalı",
                "analogWrite(9, okunan): okunan değeri 0-1023 aralığında, analogWrite ise 0-255 bekler; önce map ile çevirmeli",
                "pinMode(9, OUTPUT): pin INPUT olmalı",
                "delay(10): bu satır hiç olmamalı"
              ],
              "answer": 1,
              "explanation": "analogRead 0-1023 verir ama analogWrite yalnız 0-255 bekler. Doğrusu analogWrite(9, map(okunan, 0, 1023, 0, 255)). A0 doğru yazımdır, LED için pin OUTPUT olmalıdır ve kısa delay zararsızdır.",
              "skills": [
                "pwm-output",
                "prog-debug"
              ]
            },
            {
              "id": "m3h4d1-q5",
              "kind": "numeric",
              "prompt": "Nefes alan LED sketch'inde p değeri 0'dan 255'e, sonra 255'ten 0'a birer birer değişiyor ve her adımdan sonra delay(2) var. Yani 256 + 256 = 512 adım. Tam bir nefes (yüksel + alçal) yaklaşık kaç ms sürer?",
              "answer": 1024,
              "tolerance": 15,
              "unit": "ms",
              "explanation": "512 adım × 2 ms = 1024 ms. analogWrite'ın kendi süresi çok küçüktür, bu yüzden sonuç yaklaşık 1,03 saniye çıkar. Adım sayısını yanlışlıkla 255 + 255 almak ya da delay'i saniye sanmak sonucu bozar.",
              "skills": [
                "prog-timing",
                "prog-loops-arrays"
              ]
            }
          ]
        },
        {
          "title": "RGB LED ve renk karıştırma",
          "durationMin": 25,
          "problem": "Bir ekrana yakından bakarsan her noktanın kırmızı, yeşil ve mavi üç küçük ışıktan oluştuğunu görürsün. Sadece bu üç renkle sarıyı, moru, hatta beyazı nasıl elde ediyorlar? Bugün bunu laboratuvardaki RGB LED'de dene.",
          "contentMd": "### Devre\nOrtak katotlu RGB LED, tek kılıfın içinde kırmızı, yeşil ve mavi üç LED barındırır ve dört bacağı vardır. Üç LED'in katotları (eksi uçları) tek ortak uçta birleşir; laboratuvarda bu uç **COM** adını taşır. Parçanın özellik panelinde **Ortak uç: Ortak katot** seçili olmalıdır (varsayılan budur).\n\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| RGB LED (ortak katot) | **COM** → GND |\n| 330 Ω direnç (kırmızı için) | 1 ucu **D9**, 2 ucu RGB LED'in **R** ucu |\n| 330 Ω direnç (yeşil için) | 1 ucu **D10**, 2 ucu RGB LED'in **G** ucu |\n| 330 Ω direnç (mavi için) | 1 ucu **D11**, 2 ucu RGB LED'in **B** ucu |\n\nHer renk ucunun kendi direnci olmalıdır. Üç pin de PWM yapabilir (D9, D10, D11), böylece her rengin parlaklığını 0-255 arasında ayrı ayrı ayarlarsın.\n\n### Renkler nasıl karışır?\nIşık karışımında renkler **toplanır**:\n\n| Karışım | Sonuç |\n|---|---|\n| Kırmızı + yeşil | Sarı |\n| Yeşil + mavi | Camgöbeği |\n| Kırmızı + mavi | Mor (macenta) |\n| Kırmızı + yeşil + mavi | Beyaz |\n| Hepsi sönük | Siyah (LED sönük) |\n\nHer kanalın değeri 0-255 olduğundan 256 × 256 × 256 yaklaşık 16,7 milyon renk tanımlanabilir. Laboratuvar da bunu modeller: mavi LED'in eşik gerilimi daha yüksek olduğundan aynı dirençle mavi kanal kırmızıdan daha sönük yanar ve \"beyaz\" biraz renkli görünür; bu normaldir.\n\n### Program 1: Renk paleti\n```cpp\n// sketch: rgb_renkler\n// sıra: kırmızı, yeşil, mavi, sarı, camgöbeği, mor, beyaz, turuncu\nint kirmizi[] = {255,   0,   0, 255,   0, 255, 255, 255};\nint yesil[]   = {  0, 255,   0, 255, 255,   0, 255,  80};\nint mavi[]    = {  0,   0, 255,   0, 255, 255, 255,   0};\n\nvoid setup() {\n  pinMode(9, OUTPUT);\n  pinMode(10, OUTPUT);\n  pinMode(11, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  for (int i = 0; i < 8; i++) {\n    analogWrite(9, kirmizi[i]);\n    analogWrite(10, yesil[i]);\n    analogWrite(11, mavi[i]);\n    Serial.print(\"R=\");\n    Serial.print(kirmizi[i]);\n    Serial.print(\" G=\");\n    Serial.print(yesil[i]);\n    Serial.print(\" B=\");\n    Serial.println(mavi[i]);\n    delay(1000);\n  }\n}\n```\n\n### Program 2: Gökkuşağı geçişi\nHer aşamada bir renk azalırken öbürü artar.\n```cpp\n// sketch: rgb_gokkusagi\nvoid setup() {\n  pinMode(9, OUTPUT);\n  pinMode(10, OUTPUT);\n  pinMode(11, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i <= 255; i++) {      // kırmızıdan yeşile\n    analogWrite(9, 255 - i);\n    analogWrite(10, i);\n    analogWrite(11, 0);\n    delay(10);\n  }\n  for (int i = 0; i <= 255; i++) {      // yeşilden maviye\n    analogWrite(9, 0);\n    analogWrite(10, 255 - i);\n    analogWrite(11, i);\n    delay(10);\n  }\n  for (int i = 0; i <= 255; i++) {      // maviden kırmızıya\n    analogWrite(9, i);\n    analogWrite(10, 0);\n    analogWrite(11, 255 - i);\n    delay(10);\n  }\n}\n```\n\n### Program 3: Rengi seri monitörden seç\nAltta **Seri monitör**'ün gönderme kutusuna üç sayı yaz, örneğin `255 128 0` (turuncu), ve Enter'a bas.\n```cpp\n// sketch: rgb_serial\nvoid setup() {\n  pinMode(9, OUTPUT);\n  pinMode(10, OUTPUT);\n  pinMode(11, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    int r = Serial.parseInt();\n    int g = Serial.parseInt();\n    int b = Serial.parseInt();\n    r = constrain(r, 0, 255);   // 255'ten büyükse 255, 0'dan küçükse 0\n    g = constrain(g, 0, 255);\n    b = constrain(b, 0, 255);\n    delay(10);\n    while (Serial.available() > 0) {   // satır sonu karakterlerini at\n      Serial.read();\n    }\n    analogWrite(9, r);\n    analogWrite(10, g);\n    analogWrite(11, b);\n    Serial.print(\"R=\");\n    Serial.print(r);\n    Serial.print(\" G=\");\n    Serial.print(g);\n    Serial.print(\" B=\");\n    Serial.println(b);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Her renk ucu kendi PWM pininden gelir. `analogWrite(9, 255)` kırmızıyı tam açar, `analogWrite(10, 0)` yeşili kapatır.\n2. Program 1'de üç dizi aynı sıra numarasıyla okunur: `kirmizi[3]`, `yesil[3]`, `mavi[3]` birlikte sarıyı verir.\n3. Program 2'de her aşama 256 adımdır. Toplam parlaklık yaklaşık sabit kalır, çünkü biri azalırken öbürü artar.\n4. Program 3'te `parseInt` seri tampondan bir sayı okur. `constrain` kullanıcı 300 yazsa bile değeri 255'te tutar. `parseInt` sonucunu önce bir değişkene alıyoruz; çünkü `constrain` içine doğrudan yazılan ifade birden fazla kez çalışabilir ve seriden fazladan sayı okur. Satır sonu karakterini atmasaydık sonraki `parseInt` boş yere bekler ve 0 döndürürdü.\n\n### Dene\n- Program 1'e kendi favori rengini ekle. Hangi üç sayıyı yazdın? (Dizilerin boyutunu ve `for` sınırını güncelle.)\n- Program 2'de `delay(10)` değerini 3 yap. Renk geçişi nasıl değişti?\n- Program 3'te `128 0 128` yaz. Hangi renk çıkar? Aynı rengi `64 0 64` ile karşılaştır.\n\n### Sık yapılan hatalar\n- COM ucunu 5V'a bağlamak: bu bağlantı ortak **anotlu** LED içindir. Ortak katotlu LED'de COM, GND'ye gider.\n- Özellik panelinden **Ortak uç**'u \"Ortak anot\" yaparsan mantık tersine döner: COM'u 5V'a bağlamalı ve `analogWrite(pin, 255 - değer)` yazmalısın.\n- Üç renk için tek direnç kullanmak: renkler birbirinin parlaklığını etkiler. Her ucun kendi direnci olsun.\n- R, G ve B uçlarını karıştırmak: renkler beklediğinden farklı çıkıyorsa kabloların doğru uca (R, G, B) gittiğini kontrol et.",
          "question": "Bir ekranda \"beyaz\" gördüğünde aslında ne yanıyor? Işıkta renkler toplanırken, boyada renkler neden karıştıkça koyulaşıyor?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Ortak katotlu RGB LED'in yapısını ve nasıl bağlandığını\n- Işığın renklerinin nasıl **toplandığını** (kırmızı, yeşil, mavi karışımı)\n- Üç sayıyla (R, G, B) bir renk tanımlamayı\n- Ortak anotlu LED'de mantığın neden tersine döndüğünü\n\n### Önceden bilmen gerekenler\n- Ders 2: LED için seri direnç ve Ohm yasası\n- Ders 4: dizi ve `for` döngüsü\n- Ders 9: Serial Monitor'den sayı okuma (`parseInt`)\n- Ders 14: `constrain` ile bir değeri sınırlama\n- Ders 16: `analogWrite` ve PWM pinleri\n\n### Tek kılıfta üç LED\n**RGB LED**, aynı kılıfın içine yerleştirilmiş kırmızı (R), yeşil (G) ve mavi (B) üç küçük LED'dir. Dört bacağı vardır. **Ortak katotlu** türde üç LED'in katotları tek bir **COM** ucunda birleşir. COM, GND'ye bağlanır. R, G ve B uçlarına ise ayrı PWM pinleri gider.\n\n```\nD9  --[330 Ω]-- R \\\nD10 --[330 Ω]-- G  >-- LED --- COM --- GND\nD11 --[330 Ω]-- B /\n```\n\nHer renk ucunun kendi direnci olmalıdır. Tek direnç üç kanalın akımını paylaştırır ve renkler birbirinin parlaklığını bozar.\n\n### Işıkta renkler toplanır\nÜç ışık aynı noktada birleşince renkler toplanır:\n\n| Kırmızı | Yeşil | Mavi | Görünen renk |\n|---|---|---|---|\n| tam | tam | sönük | sarı |\n| sönük | tam | tam | camgöbeği |\n| tam | sönük | tam | mor |\n| tam | tam | tam | beyaz |\n| sönük | sönük | sönük | siyah (LED sönük) |\n\nHer kanalın değeri 0-255 arasında seçilir. Üç kanal birleşince 256 × 256 × 256 yaklaşık 16,7 milyon farklı renk çıkar. Üç değer eşitse gri tonları elde edersin: (60, 60, 60) koyu gri, (200, 200, 200) açık gridir. Turuncu için kırmızı tam, yeşil az olur: (255, 80, 0).\n\n### Renk dizileri ve Serial Monitor\nBirçok rengi sırayla göstermek için üç dizi kullanırsın: `kirmizi[]`, `yesil[]`, `mavi[]`. Aynı indeksteki üç sayı bir rengi tanımlar. Serial Monitor'den \"255 128 0\" gibi üç sayı yazıp `parseInt` ile okuyabilirsin. Kullanıcı 300 yazarsa `constrain(değer, 0, 255)` onu 255'te tutar.\n\n### Ortak anot ve gerçek parlaklık farkı\n**Ortak anotlu** LED'de COM, 5 V'a bağlanır ve bir kanal yalnız pin LOW iken yanar. Mantık tersine döner: kanalı `değer` kadar parlak yapmak için `analogWrite(pin, 255 - değer)` yazarsın. Hangi tür olduğu parçanın üzerinde ya da laboratuvarda özellik panelinde yazar.\n\nLaboratuvar modelinde ileri gerilimler farklıdır: kırmızı 1,9 V, yeşil 2,2 V, mavi 3,0 V. 330 Ω ile akımlar yaklaşık 8,6 mA, 7,8 mA ve 5,6 mA çıkar. Mavi daha sönüktür; bu yüzden (255, 255, 255) tam beyaz değil, hafif renkli görünebilir. Bu bir hata değildir.\n\n### Özet\nRGB LED üç LED'i tek kılıfta toplar. Ortak katotta COM, GND'ye gider ve her kanal kendi PWM pininden kendi direnciyle sürülür. Işıkta renkler toplanır ve üç değerle (R, G, B) milyonlarca renk tanımlanır. Ortak anotlu LED'de COM 5 V'a gider ve değerler tersine yazılır: 255 - değer.",
          "concepts": [
            {
              "term": "RGB LED",
              "definition": "Kırmızı, yeşil ve mavi üç LED'i tek kılıfta toplayan, dört bacaklı parça.",
              "example": "D9, D10 ve D11 üç kanalı ayrı ayrı sürerek istediğin rengi elde edersin.",
              "pitfall": "Kanalların R, G, B uçlarını karıştırmak; renkler beklenenden farklı çıkar, kablo uçlarını kontrol etmek gerekir."
            },
            {
              "term": "Ortak katot (COM)",
              "definition": "Üç LED'in katotlarının tek uçta birleştiği tür; COM ucu GND'ye bağlanır.",
              "example": "COM GND'de iken analogWrite(9, 255) kırmızı kanalı tam parlak yakar.",
              "pitfall": "Ortak katotlu LED'in COM ucunu 5V'a bağlamak; COM yalnız ortak anotlu LED'de 5V'a gider."
            },
            {
              "term": "Toplamalı renk karışımı",
              "definition": "Işıkta renkler toplanır: kırmızı + yeşil sarı, kırmızı + yeşil + mavi beyaz verir.",
              "example": "(255, 255, 0) sarı, (0, 255, 255) camgöbeği, (255, 0, 255) mordur.",
              "pitfall": "Işık karışımını boya karışımına benzetmek; boyada renkler karıştıkça koyulaşır, ışıkta açılır."
            },
            {
              "term": "Ortak anot",
              "definition": "Üç LED'in anotlarının tek uçta birleştiği tür; COM 5V'a gider ve kanal pin LOW iken yanar.",
              "example": "Kanalı 200 parlaklıkta yakmak için analogWrite(pin, 255 - 200) yazılır.",
              "pitfall": "Ortak anotlu LED'de değerleri ters yazmayı unutmak; kırmızı istediğinde camgöbeği görürsün."
            },
            {
              "term": "constrain()",
              "definition": "Bir değeri verilen alt ve üst sınır arasında tutar.",
              "example": "constrain(300, 0, 255) sonucu 255 verir.",
              "pitfall": "constrain'in içine doğrudan Serial.parseInt() yazmak; ifade birkaç kez çalışıp seriden fazladan sayı okur. Önce değişkene al."
            }
          ],
          "quiz": [
            {
              "id": "m3h4d2-q1",
              "kind": "mcq",
              "prompt": "Ortak katotlu bir RGB LED kullanıyorsun. COM ucu nereye bağlanmalıdır?",
              "options": [
                "5V'a",
                "GND'ye",
                "D9'a",
                "A0'a"
              ],
              "answer": 1,
              "explanation": "Ortak katotta üç LED'in katotları COM'da birleşir, katot GND tarafıdır. Bu yüzden COM GND'ye gider ve kanallar PWM pinlerinden gelen HIGH ile yanar. 5V'a bağlamak ortak anotlu LED içindir.",
              "skills": [
                "rgb-color",
                "circuit-wiring"
              ]
            },
            {
              "id": "m3h4d2-q2",
              "kind": "predict-output",
              "prompt": "Ortak katotlu RGB LED'in R ucu D9'a, G ucu D10'a, B ucu D11'e bağlı (her biri 330 Ω ile). Bu sketch çalışınca LED hangi rengi gösterir?\n\n```\nvoid setup() {\n  analogWrite(9, 0);\n  analogWrite(10, 255);\n  analogWrite(11, 255);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "Sarı",
                "Mor",
                "Beyaz",
                "Camgöbeği"
              ],
              "answer": 3,
              "explanation": "Kırmızı kapalı, yeşil ve mavi tam açık. Işıkta renkler toplanır: yeşil + mavi camgöbeği verir. Sarı kırmızı + yeşil, mor kırmızı + mavi, beyaz üçünün tam açık olmasıdır.",
              "skills": [
                "rgb-color",
                "pwm-output"
              ]
            },
            {
              "id": "m3h4d2-q3",
              "kind": "numeric",
              "prompt": "Ortak anotlu bir RGB LED'in kırmızı kanalını 200/255 parlaklıkta yakmak istiyorsun. Ortak anotta mantık tersine döner. analogWrite'a hangi değeri yazmalısın?",
              "answer": 55,
              "explanation": "Ortak anotta kanal pin LOW iken yanar, bu yüzden değer ters yazılır: 255 - 200 = 55. 200 yazarsan kanal yalnız yaklaşık %22 parlaklıkta yanar.",
              "skills": [
                "rgb-color",
                "pwm-output"
              ]
            },
            {
              "id": "m3h4d2-q4",
              "kind": "find-bug",
              "prompt": "Üç rengi (kırmızı, yeşil, mavi) sırayla gösteren bu sketch'te LED'in rengi bazen beklenmedik çıkıyor. Hatanın nedeni hangisi?\n\n```\nint kirmizi[] = {255, 0, 0};\nint yesil[]   = {0, 255, 0};\nint mavi[]    = {0, 0, 255};\n\nvoid setup() {\n}\n\nvoid loop() {\n  for (int i = 0; i <= 3; i++) {\n    analogWrite(9, kirmizi[i]);\n    analogWrite(10, yesil[i]);\n    analogWrite(11, mavi[i]);\n    delay(1000);\n  }\n}\n```",
              "options": [
                "setup() boş: pinMode yazılmadığı için analogWrite çalışmaz",
                "for koşulu i <= 3: diziler 3 elemanlı, i = 3 olduğunda dizinin dışı okunur",
                "analogWrite(10, ...) satırı: yeşil için D12 yazılmalı",
                "delay(1000): RGB LED için çok uzun"
              ],
              "answer": 1,
              "explanation": "3 elemanlı dizinin geçerli indeksleri 0, 1, 2'dir. i <= 3 son turda kirmizi[3] gibi dizinin dışındaki bellek değerini okur; rastgele renk çıkar. Doğrusu i < 3'tür. analogWrite pini kendisi çıkış yapar, D10 doğru yeşil pinidir ve delay süresi sorun değildir.",
              "skills": [
                "prog-loops-arrays",
                "prog-debug",
                "rgb-color"
              ]
            },
            {
              "id": "m3h4d2-q5",
              "kind": "numeric",
              "prompt": "Mavi kanalın ileri gerilimi 3,0 V. 5 V ve 330 Ω ile pin tam HIGH iken kanaldan geçen akım kaç mA'dir? (Basit formül: I = (5 - Vf) / R; pin ve LED iç direncini yok say.)",
              "answer": 6.06,
              "tolerance": 0.1,
              "unit": "mA",
              "explanation": "I = (5 - 3,0) / 330 = 2 / 330 yaklaşık 0,00606 A yani 6,06 mA. Laboratuvar modeli pin ve LED iç direncini de katar ve yaklaşık 5,6 mA bulur. Kırmızı kanalda Vf daha küçüktür (1,9 V) ve akım daha büyük, yaklaşık 9,4 mA çıkar.",
              "skills": [
                "elec-led-resistor",
                "elec-ohm"
              ]
            }
          ]
        },
        {
          "title": "Buzzer: tone ve nota frekansları",
          "durationMin": 22,
          "problem": "Müzik aletlerinin hepsi aynı şeyi yapar: havayı belli bir hızda titretir. Titreşim saniyede kaç kez olursa o notayı duyarız. Bir Arduino pinini saniyede 440 kez açıp kapatırsan hangi notayı çalmış olursun?",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Pasif buzzer | **+** ucu → **D8**; **-** ucu → GND |\n\nBuzzer iki türdür. **Aktif** buzzer içinde kendi osilatörü vardır: 5 V verince tek bir sabit ses çıkarır. **Pasif** buzzer ise sadece bir hoparlör gibidir; sesin perdesini senin üreteceğin titreşim belirler. Bu derste pasif buzzer kullanıyoruz. Parça eklerken özellik panelinde **Tür: Pasif (tone ile)** seçili olsun (varsayılan budur). Sesi duymak için üstteki ses düğmesini aç.\n\n### Frekans ve nota\nFrekans, saniyedeki titreşim sayısıdır; birimi hertz (Hz). Frekans arttıkça ses incelir.\n\n| Nota | Frekans (yaklaşık) |\n|---|---|\n| Do (C4) | 262 Hz |\n| Re (D4) | 294 Hz |\n| Mi (E4) | 330 Hz |\n| Fa (F4) | 349 Hz |\n| Sol (G4) | 392 Hz |\n| La (A4) | 440 Hz |\n| Si (B4) | 494 Hz |\n| Do (C5) | 523 Hz |\n\nTablodaki son \"Do\" (C5), ilk \"Do\"nun (C4) bir **oktav** üstüdür ve frekansı yaklaşık iki katıdır (262 → 523). La notası için de 440 → 880 geçerlidir. Bu tablodaki değerler yuvarlanmıştır; `tone` zaten tam sayı frekans ister.\n\n### tone() komutu\n- `tone(pin, frekans)`: pinde o frekansta kare dalga üretir. `noTone(pin)` diyene kadar sürer.\n- `tone(pin, frekans, süre)`: `süre` milisaniye çalıp kendiliğinden susar.\n\nKare dalga, pinin eşit süre HIGH ve LOW olmasıdır (doluluk %50). `tone`, arka planda bir zamanlayıcı (timer) kullandığı için çalarken program akışını **bloklamaz**: komuttan hemen sonraki satır çalışır. Notanın bitmesini beklemek istiyorsan `delay` yazmalısın.\n\n### Program 1: La notası\n```cpp\n// sketch: buzzer_a4\nvoid setup() {\n  tone(8, 440);      // D8'de sürekli 440 Hz (La)\n}\n\nvoid loop() {\n}\n```\n\n### Program 2: Do majör gam\n```cpp\n// sketch: buzzer_gam\nint notalar[] = {262, 294, 330, 349, 392, 440, 494, 523};\n\nvoid setup() {\n}\n\nvoid loop() {\n  for (int i = 0; i < 8; i++) {\n    tone(8, notalar[i], 400);   // 400 ms çal\n    delay(500);                 // 100 ms sessizlik dahil 500 ms bekle\n  }\n  delay(1000);\n}\n```\n\n### Program 3: Oktav\n```cpp\n// sketch: buzzer_oktav\nvoid setup() {\n}\n\nvoid loop() {\n  tone(8, 440, 400);    // La\n  delay(500);\n  tone(8, 880, 400);    // bir oktav yukarısı\n  delay(500);\n  delay(1000);\n}\n```\n\n### Program 4: tone ve PWM bir arada\n`tone` komutu Uno'nun 2 numaralı zamanlayıcısını (Timer2) kullanır. Resmî Arduino belgelerine göre bu, **D3 ve D11'deki `analogWrite` çıkışını bozar.** Bozulma yalnızca `tone` çalarken olur. Bu pinlerde parlaklık ayarı çalışmaz, ama tam açık (255) ya da tam kapalı (0) kullanabilirsin. D9 ve D10 ise etkilenmez.\n```cpp\n// sketch: buzzer_ve_pwm\nvoid setup() {\n  tone(8, 440);            // buzzer çalıyor\n  analogWrite(9, 64);      // D9 PWM çalışmaya devam eder (yaklaşık %25)\n  analogWrite(11, 255);    // D11 yalnızca tam açık/kapalı olur\n}\n\nvoid loop() {\n}\n```\nRGB LED'imizin kırmızısı D9'da, yeşili D10'da, mavisi D11'de. Proje dersinde bu bilgiyi kullanacağız: nota çalarken mavi kanalı yalnızca açıp kapatacağız.\n\n### Nasıl çalışıyor?\n1. `tone(8, 440)` pini saniyede 440 kez HIGH-LOW yapar. Buzzerın zarı bu hızla titreyerek 440 Hz'lik La sesini üretir.\n2. Program 2'de `notalar` dizisi tablodaki frekansları taşır; `for` döngüsü sırayla çalar.\n3. `tone(8, notalar[i], 400)` 400 ms çalar. `delay(500)` ile 100 ms ara bırakırız; ara olmazsa aynı notalar birbirine karışır.\n4. `tone` pini kendisi çıkış yapar; `pinMode` yazmak zorunda değilsin (yazman da zararsız).\n\n### Dene\n- Program 2'de gamı tersten çal (`i` değeri 7'den 0'a insin).\n- `for (int f = 200; f <= 1000; f += 10) { tone(8, f); delay(10); }` yaz. Sirene benzer bir ses duydun mu?\n- Frekansı 20 Hz gibi çok düşük ya da 10000 Hz gibi çok yüksek yapmayı dene. Buzzer neden artık \"nota\" gibi çalmıyor? (İpucu: buzzerların rahat çaldığı bir aralık vardır.)\n\n### Sık yapılan hatalar\n- Aktif buzzer ile `tone` denemek: aktif buzzer her frekansta aynı sesi çıkarır. Notaları duyamıyorsan özellik panelinden buzzerın türünü kontrol et.\n- Notadan sonra `delay` koymamak: `tone` beklemez, bir sonraki `tone` öncekini hemen keser. Sadece son nota duyulur.\n- `tone` çalarken D3 veya D11'de `analogWrite` ile parlaklık ayarı beklemek: bu pinlerde PWM bozulur (yukarıya bak).\n- Buzzerı yanlış pine bağlamak: kodda `tone(8, ...)` yazdıysan buzzerın **+** ucu D8'e kablolanmış olmalı.",
          "question": "Aynı La notasını bir gitar ve bir flüt çaldığında neden farklı duyarız? Buzzerın sesi neden hep \"bip bip\" gibi, enstrüman gibi değil?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Sesin bir titreşim olduğunu ve **frekansın** (Hz) perdeyi belirlediğini\n- Aktif ve pasif buzzer farkını\n- `tone()` ve `noTone()` ile nota çalmayı\n- Oktav kuralını: frekans iki katına çıkınca nota bir oktav yükselir\n- `tone` ile D3 ve D11'deki PWM arasındaki çakışmayı\n\n### Önceden bilmen gerekenler\n- Ders 3: `delay` ile bekleme\n- Ders 4: dizi ve `for` döngüsü\n- Ders 16: `analogWrite` ve PWM pinleri\n\n### Ses bir titreşimdir\nSes, havanın hızlı hızlı titremesidir. Bir saniyedeki titreşim sayısına **frekans** denir; birimi **hertz** (Hz). Frekans yükseldikçe ses incelir. Bir titreşimin süresi, yani **periyot**, 1 / frekanstır. 440 Hz için bir tur 1000 / 440 yaklaşık 2,27 ms sürer.\n\n| Nota | Frekans (yaklaşık) |\n|---|---|\n| Do (C4) | 262 Hz |\n| Mi (E4) | 330 Hz |\n| Sol (G4) | 392 Hz |\n| La (A4) | 440 Hz |\n| Do (C5) | 523 Hz |\n\nAynı notanın bir **oktav** üstü frekansın yaklaşık iki katıdır: 440 Hz La'nın üstü 880 Hz'dir.\n\n### Aktif ve pasif buzzer\n**Aktif buzzer** içinde kendi osilatörü vardır; 5 V verince hep aynı perdede (laboratuvarda yaklaşık 2000 Hz) öter. Perdeyi değiştiremezsin. **Pasif buzzer** yalnız bir zardır; sesin perdesini senin gönderdiğin titreşim belirler. Nota çalmak için pasif buzzer gerekir. Laboratuvarda özellik panelindeki **Tür** alanı bunu belirler.\n\n### tone() ve noTone()\n- `tone(pin, frekans)` pinde o frekansta kare dalga üretir ve `noTone(pin)` diyene kadar sürer.\n- `tone(pin, frekans, süre)` yalnız `süre` milisaniye çalıp kendiliğinden susar.\n\nKare dalgada pin eşit süre HIGH, eşit süre LOW olur. `tone` arka planda bir zamanlayıcı kullandığı için **bloklamaz**: komut ses başlatır ve program hemen bir sonraki satıra geçer. Notanın bitmesini bekletmek istiyorsan kendin `delay` yazarsın. Beklemeden art arda `tone` çağırırsan her biri öncekinin yerine geçer ve yalnız sonuncu duyulur.\n\n```\ntone(8, 262, 400);\ndelay(500);          // 400 ms ses + 100 ms sessizlik\ntone(8, 330, 400);\ndelay(500);\n```\n\n### Zamanlayıcı çakışması\nUno'da `tone` Timer2 adlı zamanlayıcıyı kullanır. Bu zamanlayıcı D3 ve D11'deki PWM'i de üretir. Bu yüzden `tone` çalarken D3 ve D11'de `analogWrite` ile parlaklık ayarı bozulur; yalnız tam açık (255) ya da tam kapalı (0) güvenlidir. D9 ve D10 etkilenmez. Parlaklık ayarı gerekecek LED'leri D9 ya da D10'a bağla.\n\n### Özet\nSes titreşimdir ve perdeyi frekans belirler: frekans yükselince ses incelir, iki katına çıkınca bir oktav yükselir. Nota çalmak için pasif buzzer ve `tone` gerekir. `tone` beklemez, bu yüzden notalar arasına `delay` koyarsın. `tone` çalarken D3 ve D11'de PWM ile parlaklık ayarı yapılamaz; ayarlı LED'ler için D9 ve D10'u kullan.",
          "concepts": [
            {
              "term": "Frekans (Hz)",
              "definition": "Saniyedeki titreşim sayısı. Frekans arttıkça ses incelir.",
              "example": "440 Hz, saniyede 440 tam titreşim demektir ve La notasıdır.",
              "pitfall": "Yüksek frekansı yüksek ses (gürültü) sanmak; frekans sesin inceliğini, şiddet ise yüksekliğini belirler."
            },
            {
              "term": "Oktav",
              "definition": "Frekansı iki katına çıkarak aynı notanın daha tiz hâli.",
              "example": "La: 440 Hz, bir oktav üstü 880 Hz.",
              "pitfall": "Oktavı frekansa sabit bir sayı eklemek sanmak; oktav toplama değil, iki ile çarpmadır."
            },
            {
              "term": "Aktif ve pasif buzzer",
              "definition": "Aktif buzzer kendi osilatörüyle hep aynı sesi verir; pasif buzzer sesini senin tone ile gönderdiğin frekanstan alır.",
              "example": "Do-Re-Mi çalmak için pasif buzzer kullanırsın.",
              "pitfall": "Aktif buzzerle nota çalmayı denemek; her frekansta aynı perdeyi duyarsın."
            },
            {
              "term": "tone() / noTone()",
              "definition": "tone pinde verilen frekansta kare dalga üretir; süre verilmezse noTone ile susturulur.",
              "example": "tone(8, 440, 300) D8'de 300 ms La çalar.",
              "pitfall": "tone'un notayı bitirene kadar beklediğini sanmak; beklemez, notalar arasına delay koymak gerekir."
            },
            {
              "term": "Timer2 çakışması",
              "definition": "tone ve D3/D11 PWM'i aynı zamanlayıcıyı (Timer2) kullanır; tone çalarken bu iki pinde analogWrite ile ayar bozulur.",
              "example": "Bu yüzden müzik kutusunda mavi kanal tone sırasında yalnız 0 ya da 255 alır.",
              "pitfall": "tone çalarken D11'e bağlı LED'in parlaklığını analogWrite ile ayarlamaya çalışmak; D9 ya da D10'u kullanmalısın."
            }
          ],
          "quiz": [
            {
              "id": "m3h4d3-q1",
              "kind": "numeric",
              "prompt": "Mi notası yaklaşık 330 Hz'dir. Aynı notanın bir oktav üstü kaç Hz'dir?",
              "answer": 660,
              "tolerance": 1,
              "unit": "Hz",
              "explanation": "Bir oktav yukarı frekansı iki ile çarpmak demektir: 330 × 2 = 660 Hz. Oktav kuralı çarpmadır; her notaya aynı sabit sayıyı eklemek yanlış sonuç verirdi.",
              "skills": [
                "sound-tone"
              ]
            },
            {
              "id": "m3h4d3-q2",
              "kind": "numeric",
              "prompt": "Pasif buzzer 440 Hz ile çalıyor. Bir tam titreşimin (HIGH + LOW) süresi yaklaşık kaç milisaniyedir? (Periyot = 1000 ms / frekans)",
              "answer": 2.27,
              "tolerance": 0.05,
              "unit": "ms",
              "explanation": "Periyot frekansın tersidir: 1000 ms / 440 yaklaşık 2,27 ms. Frekans büyüdükçe periyot küçülür; 880 Hz için yaklaşık 1,14 ms olurdu.",
              "skills": [
                "sound-tone",
                "prog-timing"
              ]
            },
            {
              "id": "m3h4d3-q3",
              "kind": "predict-output",
              "prompt": "D8'e pasif buzzer bağlı. Bu sketch çalışınca ne duyulur?\n\n```\nvoid setup() {\n  tone(8, 262, 300);\n  tone(8, 330, 300);\n  tone(8, 392, 300);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "Do, Mi, Sol sırayla çalar",
                "Üç nota aynı anda bir akor gibi çalar",
                "Yalnız Sol (392 Hz) duyulur, kısa bir süre",
                "Hiç ses çıkmaz"
              ],
              "answer": 2,
              "explanation": "tone beklemez; üç komut hemen art arda çalışır ve her yeni tone öncekinin yerine geçer. Aynı pinde son çağrı kalır, yani yalnız 392 Hz (Sol) duyulur. Notaları sırayla duymak için her tone'dan sonra delay gerekir. Tek pin tek frekans üretir, akor mümkün değildir.",
              "skills": [
                "sound-tone",
                "prog-timing"
              ]
            },
            {
              "id": "m3h4d3-q4",
              "kind": "find-bug",
              "prompt": "D8'de pasif buzzer çalıyor ve D11'e dirençle bir LED bağlı. LED'i hafif yakmak için yazılan bu kodda LED'in parlaklığı ayarlanamıyor. Hatalı yer hangisi?\n\n```\nvoid setup() {\n  pinMode(11, OUTPUT);\n}\n\nvoid loop() {\n  tone(8, 440, 2000);\n  analogWrite(11, 64);\n  delay(2000);\n}\n```",
              "options": [
                "tone(8, 440, 2000): tone süre parametresi almaz",
                "analogWrite(11, 64): tone çalarken D11'deki PWM bozulur; LED'i D9 ya da D10'a taşımalı",
                "pinMode(11, OUTPUT): tone için pin INPUT olmalı",
                "delay(2000): tone çalarken delay kullanılamaz"
              ],
              "answer": 1,
              "explanation": "tone ve D11 PWM'i aynı Timer2'yi kullanır; tone çalarken D11'de parlaklık ayarı çalışmaz. LED'i PWM'i etkilenmeyen D9 ya da D10'a taşımak çözümdür. tone üçüncü parametre olarak süre alır, pinMode zararsızdır ve delay burada notanın bitmesini beklemek için gerekir.",
              "skills": [
                "sound-tone",
                "pwm-output",
                "prog-debug"
              ]
            },
            {
              "id": "m3h4d3-q5",
              "kind": "mcq",
              "prompt": "Do majör gamı çalan bir program yazdın ama sekiz notanın hepsi hep aynı perdeden, tek bir bip gibi duyuluyor. En olası neden hangisidir?",
              "options": [
                "notalar dizisi 0'dan başlıyor",
                "tone yerine noTone kullanılmış",
                "delay süresi çok uzun",
                "Buzzer aktif türe ayarlı; aktif buzzer her frekansta aynı sesi verir"
              ],
              "answer": 3,
              "explanation": "Aktif buzzerin kendi osilatörü vardır ve frekansı değiştirilemez; tone ile gönderdiğin frekans ses perdesini etkilemez. Çözüm özellik panelinde (ya da gerçek devrede) pasif buzzer seçmektir. Dizinin 0'dan başlaması normaldir, delay perdeyi değil süreyi değiştirir.",
              "skills": [
                "sound-tone",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "Fonksiyonlar, kapsam, parametreler",
          "durationMin": 25,
          "problem": "Bir melodide aynı üç satırı (nota çal, bekle, sustur) onlarca kez yazarsan ne olur? Programın uzar, bir yerde hata yaparsan her kopyayı tek tek düzeltmen gerekir. Programcılar bu işi bir kez yazıp ona isim verir. Bugün kendi komutlarını yazacaksın.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Pasif buzzer | **+** ucu → **D8**; **-** ucu → GND |\n\nSon sketch (kapsam) için devre gerekmez, **Seri monitör** yeter.\n\n### Fonksiyon nedir?\n`setup()` ve `loop()` aslında birer fonksiyondur. Kendi fonksiyonunu da yazabilirsin:\n\n```cpp\nvoid bip() {\n  // buraya komutlar yazılır\n}\n```\n- `void`: fonksiyon bir değer **geri vermez**.\n- `bip`: fonksiyonun adı. Açıklayıcı olsun.\n- `()`: parantez içine **parametreler** yazılır (yoksa boş bırakılır).\n- `{ }`: fonksiyonun gövdesi.\n\nFonksiyonu tanımlamak onu çalıştırmaz. Çalışması için adıyla **çağırman** gerekir: `bip();`\n\n### Program 1: İlk fonksiyon\n```cpp\n// sketch: fonk_bip\nvoid bip() {\n  tone(8, 880, 100);\n  delay(150);\n}\n\nvoid setup() {\n}\n\nvoid loop() {\n  bip();\n  bip();\n  bip();\n  delay(1000);\n}\n```\n\n### Parametre ve geri dönüş değeri\nParametre, fonksiyona dışarıdan verdiğin bilgidir. `notaCal(440, 400)` dediğinde `440` frekansa, `400` süreye karşılık gelir. Bir fonksiyon sonuç da döndürebilir: `void` yerine dönüş tipini (`int` gibi) yazar, sonucu `return` ile verirsin.\n\n### Program 2: Melodi çalan fonksiyon\n\"Küçük yıldız\" melodisini çalıyoruz. Üç fonksiyon birlikte çalışıyor:\n```cpp\n// sketch: fonk_melodi\nconst int BUZZER = 8;           // const: değeri değişmeyen sabit\nconst int NOTA_SAYISI = 14;\n\nint melodi[]  = {262, 262, 392, 392, 440, 440, 392,\n                 349, 349, 330, 330, 294, 294, 262};\nint uzunluk[] = {1, 1, 1, 1, 1, 1, 2,\n                 1, 1, 1, 1, 1, 1, 2};      // kaç vuruş\n\nint vurusSuresi(int bpm) {          // dakikadaki vuruştan ms hesapla\n  return 60000 / bpm;\n}\n\nvoid notaCal(int frekans, int sure) {\n  tone(BUZZER, frekans, sure * 9 / 10);   // sürenin %90'ı ses, %10'u ara\n  delay(sure);\n}\n\nvoid melodiCal(int bpm) {\n  int vurus = vurusSuresi(bpm);\n  for (int i = 0; i < NOTA_SAYISI; i++) {\n    notaCal(melodi[i], uzunluk[i] * vurus);\n  }\n}\n\nvoid setup() {\n}\n\nvoid loop() {\n  melodiCal(150);     // dakikada 150 vuruş: bir vuruş 400 ms\n  delay(2000);\n}\n```\n\n### Kapsam: değişken nerede yaşar?\nBir değişkenin görülebildiği yere **kapsam** denir.\n- **Yerel** değişken bir fonksiyonun içinde tanımlanır; yalnız o fonksiyon görür ve her çağrıda baştan oluşturulur.\n- **Global** değişken fonksiyonların dışında tanımlanır; bütün fonksiyonlar görür ve değeri çağrılar arasında korunur.\n\nParametreler fonksiyona **kopya** olarak gider: fonksiyon içinde parametreyi değiştirmek dışarıdaki değişkeni değiştirmez.\n\n### Program 3: Kapsamı gör\n```cpp\n// sketch: fonk_kapsam\nint toplam = 0;      // global: her yerden görünür\nint sayi = 5;\n\nvoid yerelDene() {\n  int yerel = 0;     // her çağrıda yeniden oluşur\n  yerel = yerel + 1;\n  Serial.print(\"yerel: \");\n  Serial.println(yerel);\n}\n\nvoid globalDene() {\n  toplam = toplam + 1;   // değer korunur\n  Serial.print(\"toplam: \");\n  Serial.println(toplam);\n}\n\nvoid ikiyeKatla(int x) {\n  x = x * 2;             // yalnız kopya değişir\n  Serial.print(\"fonksiyonda x: \");\n  Serial.println(x);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  ikiyeKatla(sayi);\n  Serial.print(\"disarida sayi: \");\n  Serial.println(sayi);\n}\n\nvoid loop() {\n  yerelDene();\n  globalDene();\n  delay(500);\n}\n```\n\n### Nasıl çalışıyor?\n1. Program 1'de `bip()` üç kez çağrılır; kod bir kez yazılır, üç kez çalışır. Sesi değiştirmek için tek satırı değiştirmen yeter.\n2. Program 2'de `melodiCal` her nota için `notaCal`'ı çağırır. `notaCal` frekans ve süre parametresi alır; `vurusSuresi` ise `return` ile bir sayı döndürür: `60000 / 150 = 400` ms.\n3. `uzunluk[i] * vurus` hesabı, iki vuruşluk notayı 800 ms yapar.\n4. Program 3'te `yerel` her seferinde 1 yazar, `toplam` ise 1, 2, 3 diye artar. `ikiyeKatla(sayi)` içinde `x` 10 olur, ama dışarıda `sayi` hâlâ 5'tir.\n\n### Dene\n- `melodiCal(100)` ve `melodiCal(200)` yaz. Tempo nasıl değişiyor?\n- `melodi` ve `uzunluk` dizilerini değiştirerek kendi melodini yaz. `NOTA_SAYISI` değerini de güncelle.\n- `void sessizlik(int sure)` adında, sadece `delay(sure)` yapan bir fonksiyon yaz ve melodinin sonuna ekle.\n\n### Sık yapılan hatalar\n- Fonksiyonu tanımlayıp çağırmamak: tanımlamak çalıştırmaz, `notaCal(440, 300);` yazmalısın.\n- Fonksiyonun içini başka bir fonksiyonun içinde tanımlamak: fonksiyonlar `{ }` bloklarının dışında, yan yana yazılır.\n- Yanlış sayıda parametre vermek: `notaCal(440)` derleyici hatası verir, çünkü iki parametre bekler.\n- Yerel değişkeni başka fonksiyonda kullanmak: derleyici \"was not declared in this scope\" der. Değişkeni global yap ya da parametre olarak ilet.\n- `return` yazmayı unutmak: `int` dönen bir fonksiyonda sonucu `return` ile vermelisin.",
          "question": "Büyük bir programı fonksiyonlara bölmek neden hata bulmayı kolaylaştırır? Her şeyi global değişken yapmak neden iyi bir fikir değildir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Neden kendi **fonksiyonlarını** yazman gerektiğini\n- Bir fonksiyonun parçalarını: dönüş tipi, ad, parametre ve gövde\n- Fonksiyonu tanımlamakla **çağırmak** arasındaki farkı\n- Yerel ve global değişken farkını (**kapsam**)\n- Parametrenin fonksiyona kopya olarak gittiğini\n\n### Önceden bilmen gerekenler\n- Ders 1: `setup()` ve `loop()`\n- Ders 3 ve 4: `delay`, `for` döngüsü ve dizi\n- Ders 18: `tone` ile nota çalma\n\n### Aynı kodu tekrar tekrar yazmak\nBir melodide \"nota çal, bekle\" üç satırını yirmi kez yazarsan program uzar. Hata yaparsan yirmi yeri tek tek düzeltirsin. **Fonksiyon**, bir grup komuta isim verip istediğin kadar çalıştırmandır. Aslında `setup()` ve `loop()` de birer fonksiyondur.\n\n### Fonksiyonun parçaları\n```\nint vurusSuresi(int bpm) {\n  return 60000 / bpm;\n}\n```\n\n| Parça | Anlamı |\n|---|---|\n| `int` | **Dönüş tipi**: fonksiyon bir tamsayı geri verir. Hiçbir şey vermiyorsa `void` yazılır. |\n| `vurusSuresi` | Fonksiyonun adı; ne yaptığını anlatmalı. |\n| `(int bpm)` | **Parametre**: fonksiyona dışarıdan verilen bilgi. |\n| `{ ... }` | Gövde: çalışacak komutlar. |\n| `return` | Sonucu çağırana geri verir. |\n\nFonksiyonu yazmak onu çalıştırmaz. Çalışması için adıyla **çağırmalısın**: `vurusSuresi(120);` Burada `bpm` değeri 120 olur ve sonuç 60000 / 120 = 500 ms'dir. Bir fonksiyon başka fonksiyonları da çağırabilir: `melodiCal` her nota için `notaCal`'ı çağırır.\n\n### Kapsam: değişken nerede yaşar?\n**Kapsam**, bir değişkenin hangi kodlar tarafından görülebildiğidir.\n\n| Tür | Nerede tanımlanır | Özelliği |\n|---|---|---|\n| Yerel | Fonksiyonun içinde | Yalnız o fonksiyon görür; her çağrıda baştan oluşur |\n| Global | Tüm fonksiyonların dışında | Herkes görür; değeri çağrılar arasında korunur |\n\nYerel değişkeni başka bir fonksiyonda kullanırsan derleyici \"was not declared in this scope\" hatası verir.\n\n### Parametre bir kopyadır\nFonksiyona bir değişken verdiğinde fonksiyon onun **kopyasıyla** çalışır:\n\n```\nvoid ikiyeKatla(int x) {\n  x = x * 2;     // yalnız kopya değişir\n}\n// sayi = 5 ise ikiyeKatla(sayi) sonrasında sayi hâlâ 5'tir\n```\n\nDışarıdaki değeri değiştirmek istiyorsan global değişken kullanır ya da sonucu `return` ile geri alırsın: `sayi = ikiyeKatla(sayi);`. Değişmeyen sayılara (buzzer pini gibi) `const` yazarsan yanlışlıkla değiştiremezsin.\n\n### Özet\nFonksiyon, bir grup komuta isim verip tekrar tekrar kullanmaktır. Tanımlamak çalıştırmaz, adıyla çağırmak gerekir. Parametreler dışarıdan bilgi taşır, `return` sonucu geri verir. Yerel değişken yalnız kendi fonksiyonunda yaşar, global değişken her yerde görülür. Parametre bir kopya olduğundan fonksiyon içindeki değişiklik dışarıyı etkilemez.",
          "concepts": [
            {
              "term": "Fonksiyon",
              "definition": "Bir grup komuta verilen isim; adıyla çağrıldığında içindeki komutlar çalışır.",
              "example": "void bip() { tone(8, 880, 100); delay(150); } yazıp loop içinde bip(); diye çağırırsın.",
              "pitfall": "Fonksiyonu yazıp hiç çağırmamak; tanımlamak onu çalıştırmaz."
            },
            {
              "term": "Parametre",
              "definition": "Fonksiyona dışarıdan verilen bilgi; parantez içinde tipiyle birlikte yazılır.",
              "example": "notaCal(440, 400) çağrısında 440 frekansa, 400 süreye karşılık gelir.",
              "pitfall": "Yanlış sayıda parametre vermek: notaCal(440) iki parametre beklediği için derleme hatası verir."
            },
            {
              "term": "Dönüş değeri (return)",
              "definition": "Fonksiyonun çağırana geri verdiği sonuç; dönüş tipi void değilse return ile verilir.",
              "example": "int vurusSuresi(int bpm) { return 60000 / bpm; } 120 için 500 verir.",
              "pitfall": "int dönen bir fonksiyonda return yazmayı unutmak; sonuç beklediğin değer olmaz."
            },
            {
              "term": "Yerel ve global değişken",
              "definition": "Yerel değişken yalnız tanımlandığı fonksiyonda görünür ve her çağrıda baştan oluşur; global değişken her yerde görünür ve değerini korur.",
              "example": "Sayaç gibi çağrılar arasında artması gereken değer global tanımlanır.",
              "pitfall": "Yerel değişkeni başka fonksiyonda kullanmak: derleyici \"was not declared in this scope\" der."
            },
            {
              "term": "Kopya olarak geçen parametre",
              "definition": "Fonksiyona verilen değişken kopyalanır; fonksiyon içinde değiştirmek dışarıdaki değişkeni değiştirmez.",
              "example": "ikiyeKatla(sayi) içinde x = 10 olur ama dışarıda sayi hâlâ 5'tir.",
              "pitfall": "Fonksiyonun dışarıdaki değişkeni değiştirdiğini sanmak; sonucu return ile geri almalısın."
            }
          ],
          "quiz": [
            {
              "id": "m3h4d4-q1",
              "kind": "predict-output",
              "prompt": "Bu sketch çalışınca Serial Monitor'e ne yazılır?\n\n```\nint sayac = 0;\n\nvoid artir() {\n  int adim = 2;\n  sayac = sayac + adim;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  artir();\n  artir();\n  artir();\n  Serial.println(sayac);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "2",
                "3",
                "6",
                "0"
              ],
              "answer": 2,
              "explanation": "sayac global olduğu için değeri çağrılar arasında korunur ve her çağrıda 2 artar: 2, 4, 6. adim yerel bir değişkendir ve her çağrıda yeniden 2 olarak oluşur. Sonuç 6 çıkar. 2 yazması için sayac da yerel olmalıydı ama o zaman değeri korunmazdı.",
              "skills": [
                "prog-scope",
                "prog-functions"
              ]
            },
            {
              "id": "m3h4d4-q2",
              "kind": "numeric",
              "prompt": "vurusSuresi(int bpm) fonksiyonu 60000 / bpm döndürüyor. Tempo 120 vuruş/dakika ve bir nota 3 vuruş uzunluğunda. Bu nota kaç milisaniye sürer?",
              "answer": 1500,
              "unit": "ms",
              "explanation": "vurusSuresi(120) = 60000 / 120 = 500 ms bir vuruştur. Üç vuruşluk nota 3 × 500 = 1500 ms sürer. 500'de bırakmak yalnız tek vuruşu verir.",
              "skills": [
                "prog-functions",
                "prog-timing"
              ]
            },
            {
              "id": "m3h4d4-q3",
              "kind": "find-bug",
              "prompt": "ikiKat(21) çağrısının 42 yazdırması bekleniyor ama doğru sonuç gelmiyor. Hatayı hangisi anlatır?\n\n```\nint ikiKat(int x) {\n  int sonuc = x * 2;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(ikiKat(21));\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "x * 2 yerine x + 2 yazılmalı",
                "Serial.begin(9600) satırı setup() içinde olmamalı",
                "ikiKat fonksiyonu sonucu return ile geri vermiyor",
                "loop() boş bırakılamaz"
              ],
              "answer": 2,
              "explanation": "Fonksiyon int dönecek diye tanımlanmış ama sonuc hiçbir zaman return ile verilmiyor; çağıran taraf beklenen 42'yi alamaz. Doğrusu return x * 2; ya da return sonuc; yazmaktır. Çarpma doğru, Serial.begin setup içinde olmalı ve loop boş olabilir.",
              "skills": [
                "prog-functions",
                "prog-debug"
              ]
            },
            {
              "id": "m3h4d4-q4",
              "kind": "mcq",
              "prompt": "Bir programda aynı üç komutu yirmi yerde kopyalamak yerine bir fonksiyona koymanın en önemli yararı hangisidir?",
              "options": [
                "Program kesinlikle daha hızlı çalışır",
                "Kod bir kez yazılır, değişiklik ya da hata düzeltmesi tek yerde yapılır",
                "Fonksiyonun içindeki değişkenler otomatik global olur",
                "setup() ve loop() yazmaya gerek kalmaz"
              ],
              "answer": 1,
              "explanation": "Fonksiyonun asıl yararı tekrarı azaltmak ve düzeni sağlamaktır: bir kez yazılır, her yerden çağrılır, hata tek yerde düzeltilir. Hız kazancı beklenen bir sonuç değildir, fonksiyon içindeki değişkenler yereldir ve her sketch'te setup() ile loop() yine gerekir.",
              "skills": [
                "prog-functions"
              ]
            },
            {
              "id": "m3h4d4-q5",
              "kind": "predict-output",
              "prompt": "Bu sketch çalışınca Serial Monitor'e ne yazılır?\n\n```\nvoid arttir(int x) {\n  x = x + 10;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  int n = 4;\n  arttir(n);\n  Serial.println(n);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "14",
                "10",
                "4 ve 14",
                "4"
              ],
              "answer": 3,
              "explanation": "arttir(n) fonksiyona n'nin kopyasını verir; x değişir ama n değişmez. Sonuçta 4 yazılır. 14 yazması için fonksiyonun sonucu return ile verip n = arttir(n); demek gerekirdi.",
              "skills": [
                "prog-scope",
                "prog-functions"
              ]
            }
          ]
        },
        {
          "title": "Proje: Işıklı müzik kutusu",
          "durationMin": 35,
          "problem": "Müzik kutularında bir kolu çevirirsin, melodi çalar. Senin müzik kutun bir adım ileri gidecek: butona basınca \"Küçük yıldız\" melodisini çalacak, her nota kendi renginde yanacak, bir potansiyometre ile de hızını ayarlayacaksın. Beklerken mavi bir ışık yavaşça nefes alacak.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Pasif buzzer | **+** ucu → **D8**; **-** ucu → GND |\n| RGB LED (ortak katot) | **COM** → GND |\n| 330 Ω direnç (kırmızı) | **D9** → direncin 1 ucu; 2 ucu → RGB LED **R** ucu |\n| 330 Ω direnç (yeşil) | **D10** → direncin 1 ucu; 2 ucu → RGB LED **G** ucu |\n| 330 Ω direnç (mavi) | **D11** → direncin 1 ucu; 2 ucu → RGB LED **B** ucu |\n| Buton | **A** ucu → **D2**, **B** ucu → GND (`INPUT_PULLUP`) |\n| Potansiyometre | **SIG** → **A0**; **VCC** → 5V, **GND** → GND |\n\nDevre çalışırken butona basmak için buton parçasına basılı tut; tempoyu potansiyometrenin **Konum** özelliğinden değiştir.\n\n### Tasarım\n- **Bekleme:** Mavi LED yavaşça parlayıp söner (Ders 16'daki nefes).\n- **Çalma:** Butona basınca potansiyometreden tempo (dakikada 80-200 vuruş) okunur ve melodi çalınır. Her nota kendi renginde yanar.\n- **Bitiş:** Melodi biter, LED söner ve bekleme nefesi yeniden başlar.\n\nNota renkleri:\n\n| Nota | Frekans | Renk (R, G, B) |\n|---|---|---|\n| Do | 262 | kırmızı (255, 0, 0) |\n| Re | 294 | turuncu (255, 80, 0) |\n| Mi | 330 | sarı (255, 200, 0) |\n| Fa | 349 | yeşil (0, 255, 0) |\n| Sol | 392 | camgöbeği (0, 255, 255) |\n| La | 440 | mavi (0, 0, 255) |\n\nDers 18'de öğrendiğin kurala dikkat: `tone` çalarken D11'de (mavi) parlaklık ayarı yapılamaz. Bu yüzden tablodaki mavi değerleri yalnızca 0 ya da 255'tir. Kırmızı (D9) ve yeşil (D10) ise ince ayar yapabilir; turuncu ve sarının tonu buradan gelir.\n\n### Program\n```cpp\n// sketch: muzik_kutusu\nconst int BUZZER = 8;\nconst int KIRMIZI = 9;\nconst int YESIL = 10;\nconst int MAVI = 11;\nconst int BUTON = 2;\nconst int NOTA_SAYISI = 14;\n\nint melodi[]  = {262, 262, 392, 392, 440, 440, 392,\n                 349, 349, 330, 330, 294, 294, 262};\nint uzunluk[] = {1, 1, 1, 1, 1, 1, 2,\n                 1, 1, 1, 1, 1, 1, 2};\n\nint parlak = 0;     // bekleme nefesinin şu anki parlaklığı\nint yon = 5;        // +5: parlıyor, -5: sönüyor\n\nvoid renkAyarla(int r, int g, int b) {\n  analogWrite(KIRMIZI, r);\n  analogWrite(YESIL, g);\n  analogWrite(MAVI, b);       // tone çalarken yalnız 0 ya da 255 olmalı\n}\n\nvoid notaRengi(int frekans) {\n  switch (frekans) {\n    case 262: renkAyarla(255, 0, 0); break;     // do: kırmızı\n    case 294: renkAyarla(255, 80, 0); break;    // re: turuncu\n    case 330: renkAyarla(255, 200, 0); break;   // mi: sarı\n    case 349: renkAyarla(0, 255, 0); break;     // fa: yeşil\n    case 392: renkAyarla(0, 255, 255); break;   // sol: camgöbeği\n    case 440: renkAyarla(0, 0, 255); break;     // la: mavi\n    default:  renkAyarla(255, 255, 255);        // bilinmeyen nota: beyaz\n  }\n}\n\nvoid notaCal(int frekans, int sure) {\n  notaRengi(frekans);\n  tone(BUZZER, frekans, sure * 9 / 10);\n  delay(sure);\n  renkAyarla(0, 0, 0);\n}\n\nint tempoOku() {\n  return map(analogRead(A0), 0, 1023, 80, 200);   // dakikadaki vuruş\n}\n\nvoid melodiCal(int bpm) {\n  int vurus = 60000 / bpm;                         // bir vuruşun süresi (ms)\n  for (int i = 0; i < NOTA_SAYISI; i++) {\n    notaCal(melodi[i], uzunluk[i] * vurus);\n  }\n}\n\nvoid bekleNefesi() {\n  parlak = parlak + yon;\n  if (parlak >= 255) {\n    parlak = 255;\n    yon = -5;\n  }\n  if (parlak <= 0) {\n    parlak = 0;\n    yon = 5;\n  }\n  analogWrite(MAVI, parlak);\n  delay(10);\n}\n\nvoid setup() {\n  pinMode(BUZZER, OUTPUT);\n  pinMode(KIRMIZI, OUTPUT);\n  pinMode(YESIL, OUTPUT);\n  pinMode(MAVI, OUTPUT);\n  pinMode(BUTON, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(BUTON) == LOW) {     // basılı = LOW\n    int bpm = tempoOku();\n    Serial.print(\"tempo: \");\n    Serial.println(bpm);\n    melodiCal(bpm);\n  } else {\n    bekleNefesi();\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `loop()` yalnızca karar verir: buton basılıysa melodiyi çalar, değilse bekleme nefesini bir adım ilerletir. İş fonksiyonlara bölündüğü için `loop()` kısadır ve okunur.\n2. `tempoOku()` potansiyometreyi `map` ile 80-200 aralığına çevirir. Pot ortadayken yaklaşık 140 vuruş/dakika çıkar; `60000 / 140` ile bir vuruş yaklaşık 428 ms olur.\n3. `notaCal` önce `notaRengi` ile LED'i boyar, sonra `tone` ile notayı çalar. `delay(sure)` notanın bitmesini bekler, sonra LED söndürülür.\n4. `notaRengi` içindeki `switch`, frekansa göre rengi seçer. Dizilere yeni nota eklersen buraya da yeni `case` eklemelisin.\n5. `bekleNefesi` her çağrıda parlaklığı 5 birim değiştirir; 0 ile 255 arasında gidip gelir. Her adım 10 ms sürdüğü için `loop()` hızlı döner ve buton basışları gecikmeden fark edilir. Melodi sırasında buton okunmaz; çünkü `delay` programı bekletir.\n6. Melodi bittiğinde buton hâlâ basılıysa melodi yeniden başlar; butonu bırakırsan bekleme nefesine dönülür.\n\n### Dene\n- Mavi kanalı melodide de kullanmak için Si (494) ve üst Do (523) notalarını ekle. Si için mor (255, 0, 255), üst Do için beyaz (255, 255, 255) yazabilirsin; `switch` içine `case 494:` ve `case 523:` eklemeyi unutma.\n- İkinci bir buton (D3) ekle ve basılınca farklı bir melodi çalsın. Melodiyi parametre olarak alan bir `melodiCal` yazman gerekecek. İpucu: iki ayrı dizi ve bir dizi seçici.\n- Melodi bittikten sonra tüm renklerden geçen bir gökkuşağı bitiş efekti için `bitisEfekti()` fonksiyonu yaz.\n\n### Sık yapılan hatalar\n- Mavi için `analogWrite(MAVI, 128)` yazıp `tone` çalarken yarım parlaklık beklemek: o sırada D11'de PWM çalışmaz. 0 ya da 255 kullan.\n- `case` sonuna `break;` koymamak: `switch` bir sonraki renge de düşer ve renkler karışır.\n- Potansiyometrenin orta bacağını A0 yerine başka bir yere bağlamak: tempo hep aynı kalır.\n- Buzzerı D3 ya da D11'e bağlamak: bu projede D8'de olmalı. D11 mavi LED içindir.\n- Her notanın arasına boşluk koymamak: aynı notalar peş peşe gelince tek uzun nota gibi duyulur. Kodda `sure * 9 / 10` bu boşluğu bırakır.",
          "question": "Melodi çalarken butonlara basarsan program neden tepki vermiyor? Hem melodi çalıp hem butonu izlemenin bir yolu olabilir mi? (Bunu ileriki derslerde çözeceğiz.)",
          "explainerMd": "### Bu derste öğreneceklerin\n- Büyük bir işi önce **aşamalara** ve sonra fonksiyonlara bölmeyi\n- Ses, renk ve girdiyi (buton, potansiyometre) tek programda birleştirmeyi\n- Tempoyu vuruş süresine ve melodinin toplam süresine çevirmeyi\n- `delay` kullanan bir programın neden aynı anda iki işi izleyemediğini\n\n### Önceden bilmen gerekenler\n- Ders 6 ve 7: buton (`INPUT_PULLUP`), `if`/`else` ve `switch`\n- Ders 11 ve 14: `analogRead` ve `map`\n- Ders 16: PWM ve nefes alan LED\n- Ders 17: RGB LED\n- Ders 18: `tone` ve D3/D11 çakışması\n- Ders 19: fonksiyon, parametre, `return`, kapsam\n\n### Önce plan, sonra kod\nProje büyükse doğrudan kod yazmaya başlamazsın. Önce durumları yazarsın:\n\n| Durum | Ne zaman | Ne olur |\n|---|---|---|\n| Bekleme | Buton bırakılmış | Mavi LED yavaşça parlayıp söner |\n| Çalma | Buton basılı (LOW) | Tempo okunur, melodi çalınır, her nota kendi renginde yanar |\n| Bitiş | Melodi biter | LED söner, bekleme nefesi sürer |\n\nDevre: buzzer D8'de, RGB LED D9 (R), D10 (G), D11 (B), buton D2'de (`INPUT_PULLUP`), potansiyometre A0'da.\n\n### İşi fonksiyonlara bölmek\nHer küçük iş bir fonksiyon olur. `loop()` yalnız karar verir:\n\n```\nloop()\n ├─ buton basılı mı?\n │    evet → tempoOku() → melodiCal(bpm)\n │                          └─ her nota için notaCal(f, süre)\n │                                ├─ notaRengi(f) → renkAyarla(r, g, b)\n │                                └─ tone + delay\n │    hayır → bekleNefesi()\n```\n\nBu yapı sayesinde bir hata olduğunda yalnız ilgili küçük fonksiyona bakarsın. `melodi[]` ve `uzunluk[]` dizileri (kaç vuruş) global tanımlanır, çünkü birçok fonksiyon onları kullanır.\n\n### Tempo ve süre hesabı\n`tempoOku()`, potansiyometre okumasını `map(analogRead(A0), 0, 1023, 80, 200)` ile dakikadaki vuruşa çevirir. Bir vuruşun süresi `60000 / bpm` milisaniyedir:\n\n| Pot konumu | bpm | Vuruş | Melodi (16 vuruş) |\n|---|---|---|---|\n| Sonuna kadar GND tarafı | 80 | 750 ms | 12 000 ms |\n| Orta (okuma yaklaşık 512) | 140 | 428 ms | 6 848 ms |\n| Sonuna kadar 5 V tarafı | 200 | 300 ms | 4 800 ms |\n\nMelodi 14 nottur ama iki nota 2 vuruş sürdüğü için toplam 12 × 1 + 2 × 2 = 16 vuruş eder.\n\n### Sınırlar ve kurallar\n- Mavi kanal D11'dedir. `tone` çalarken yalnız 0 ya da 255 yazılır. Bu yüzden nota renklerinde mavi değerler ya tam açık ya tam kapalıdır.\n- `switch` içinde her `case` sonuna `break;` konur; yoksa kod bir sonraki `case`'e düşer ve renk karışır.\n- `delay` çalışırken program başka komut çalıştırmaz. Melodi sırasında butonu ya da potu izleyemezsin. Bunun çözümü ileriki haftalarda gelecek.\n\n### Özet\nProjeyi önce durumlara (bekleme, çalma, bitiş) bölersin, sonra her durumu küçük bir fonksiyona dönüştürürsün. `loop()` yalnız karar verir. Tempo 80-200 vuruş/dakika arasında potansiyometreyle seçilir ve vuruş süresi 60000 / bpm'dir. `tone` çalarken D11'de yalnız tam açık/kapalı kullanılır. `delay` yüzünden melodi sırasında girdiler izlenmez.",
          "concepts": [
            {
              "term": "Durumlara bölmek",
              "definition": "Projeyi bekleme, çalma, bitiş gibi ayrı durumlara ayırıp her durum için ne olacağını önceden yazma.",
              "example": "Müzik kutusunda buton basılıysa çalma, değilse bekleme durumundayız.",
              "pitfall": "Plan yapmadan kod yazmaya başlamak; hangi durumda ne olacağı belli olmadığı için hatalar karışır."
            },
            {
              "term": "loop() karar verir",
              "definition": "İşi fonksiyonlara böldüğünde loop() yalnız hangi fonksiyonun çağrılacağına karar verir.",
              "example": "if (buton basılı) melodiCal(bpm); else bekleNefesi();",
              "pitfall": "Bütün komutları loop() içine yığmak; program uzar, okunmaz ve hata bulmak zorlaşır."
            },
            {
              "term": "Vuruş süresi",
              "definition": "Dakikadaki vuruş sayısından (bpm) bir vuruşun milisaniye cinsinden süresi: 60000 / bpm.",
              "example": "140 bpm için bir vuruş yaklaşık 428 ms sürer.",
              "pitfall": "Tempo yükselince vuruş süresinin de uzayacağını sanmak; tempo arttıkça vuruş kısalır."
            },
            {
              "term": "switch ve break",
              "definition": "switch bir değere göre farklı kod kollarından birini çalıştırır; her kolun sonunda break gerekir.",
              "example": "case 262: kırmızı; case 294: turuncu; gibi nota frekansına göre renk seçilir.",
              "pitfall": "break yazmamak; kod bir sonraki case'e düşer ve renkler karışır."
            },
            {
              "term": "delay'in bedeli",
              "definition": "delay çalışırken program başka satır çalıştırmaz; bu sırada buton ya da pot izlenemez.",
              "example": "Melodi çalarken butona basman programa ulaşmaz, melodi bitince okunur.",
              "pitfall": "delay içindeki bir programın aynı anda butona tepki vereceğini beklemek."
            }
          ],
          "quiz": [
            {
              "id": "m3h4d5-q1",
              "kind": "numeric",
              "prompt": "Müzik kutusu 120 vuruş/dakika ile çalıyor. Melodi 16 vuruş uzunluğunda (iki nota 2, on iki nota 1 vuruş). Bir tur melodi kaç milisaniye sürer?",
              "answer": 8000,
              "unit": "ms",
              "explanation": "Bir vuruş 60000 / 120 = 500 ms'dir. 16 vuruş × 500 ms = 8000 ms. Nota sayısı olan 14'ü vuruşla karıştırırsan 7000 ms gibi yanlış bir sonuç çıkar.",
              "skills": [
                "prog-timing",
                "prog-planning"
              ]
            },
            {
              "id": "m3h4d5-q2",
              "kind": "mcq",
              "prompt": "Müzik kutusunda nota renklerindeki mavi kanal neden yalnız 0 ya da 255 değerini alır?",
              "options": [
                "Mavi LED parlaklık ayarını desteklemez",
                "analogWrite 255'ten sonra otomatik sıfırlanır",
                "RGB LED'in mavisi bağlı olduğu direncin değerinden dolayı ayarlanamaz",
                "Mavi kanal D11'dedir ve tone çalarken D11'deki PWM bozulur"
              ],
              "answer": 3,
              "explanation": "tone ile D3 ve D11'deki PWM aynı zamanlayıcıyı (Timer2) kullanır; tone çalarken D11'de ara parlaklık ayarlanamaz, tam açık ya da kapalı güvenlidir. Kırmızı (D9) ve yeşil (D10) etkilenmez. Mavi LED'in kendisi ya da direnç ayarı engellemez.",
              "skills": [
                "sound-tone",
                "pwm-output",
                "rgb-color"
              ]
            },
            {
              "id": "m3h4d5-q3",
              "kind": "find-bug",
              "prompt": "Do (262 Hz) notası kırmızı yanmalı, Re (294 Hz) turuncu. Ama Do çalarken LED turuncu görünüyor. Hata nerede?\n\n```\nvoid notaRengi(int frekans) {\n  switch (frekans) {\n    case 262: renkAyarla(255, 0, 0);\n    case 294: renkAyarla(255, 80, 0); break;\n    default:  renkAyarla(255, 255, 255);\n  }\n}\n```",
              "options": [
                "default kolu en sona yazılmamalı",
                "case 262 satırının sonunda break; yok, bu yüzden kod bir sonraki case'e düşüyor",
                "renkAyarla(255, 80, 0) satırında 80 yerine 0 yazılmalı",
                "switch yerine for kullanılmalı"
              ],
              "answer": 1,
              "explanation": "case 262 kırmızıyı ayarlar ama break olmadığından akış case 294'e düşer ve renk turuncuya çevrilir. 262 satırının sonuna break; eklemek çözer. default doğru yerdedir, 80 turuncu için gerekir ve switch bu iş için uygundur.",
              "skills": [
                "prog-debug",
                "rgb-color"
              ]
            },
            {
              "id": "m3h4d5-q4",
              "kind": "predict-output",
              "prompt": "Bekleme nefesindeki parlaklık mantığının bir parçası bu. Çalışınca Serial Monitor'e ne yazılır?\n\n```\nint parlak = 250;\nint yon = 5;\n\nvoid adim() {\n  parlak = parlak + yon;\n  if (parlak >= 255) {\n    parlak = 255;\n    yon = -5;\n  }\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  adim();\n  adim();\n  adim();\n  Serial.println(parlak);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "255",
                "260",
                "250",
                "245"
              ],
              "answer": 3,
              "explanation": "Birinci adımda 250 + 5 = 255 olur, koşul sağlanır ve yön -5 yapılır. İkinci adımda 255 - 5 = 250, üçüncü adımda 250 - 5 = 245. Parlaklık 255'te kalmaz, yön değiştiği için geri iner. 260 olamaz çünkü üst sınır 255'e eşitlenir.",
              "skills": [
                "prog-functions",
                "prog-scope",
                "pwm-output"
              ]
            },
            {
              "id": "m3h4d5-q5",
              "kind": "mcq",
              "prompt": "Müzik kutusunda melodi çalarken butonu bırakıp yeniden basarsan program hemen tepki vermiyor. Nedeni nedir?",
              "options": [
                "Buton INPUT_PULLUP olarak ayarlanmamıştır",
                "tone komutu butonu devre dışı bırakır",
                "Melodi sırasında delay çalıştığı için program butonu okuyan satıra gelemez",
                "loop() yalnız bir kez çalışır"
              ],
              "answer": 2,
              "explanation": "notaCal içindeki delay, program akışını notanın süresi boyunca bekletir; buton okuma satırı ancak melodi bitince çalışır. Buton doğru yapılandırılmıştır, tone butonu etkilemez ve loop() sürekli tekrar eder. Bu sınırı ileride bloklamayan zamanlama ile aşacaksın.",
              "skills": [
                "prog-timing",
                "prog-planning"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Motorlar",
      "project": "Otomatik fan ve servo tarayıcı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Servoyu `Servo` kütüphanesiyle istediği açıya götürebilir; açının darbe genişliğiyle söylendiğini açıklayabilir.\n2. Arduino pininin neden motoru doğrudan süremediğini söyleyebilir; NPN transistör ya da mantık seviyeli MOSFET ile motoru anahtarlayabilir ve baz akımını hesaplayabilir.\n3. Flyback diyotun ne işe yaradığını bilir ve doğru yönde bağlar.\n4. L293D ile motorun yönünü (IN1, IN2) ve hızını (EN, PWM) denetleyebilir.\n5. Röle modülünün COM, NO, NC uçlarını ve aktif-LOW mantığını açıklayabilir; histerezisle eşik kararı yazabilir; şebeke gerilimiyle röle denememesi gerektiğini bilir.\n6. Sıcaklığa göre fanı ve servoyu yöneten bir sistemi planlayıp kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Servo: açı kontrolü | ~20 dk | Anlatımı oku, üç sketch'i dene, tarama hızını değiştir, mini testi çöz. |\n| 2 | Transistör ve MOSFET ile anahtarlama, DC motor | ~25 dk | Devreyi kur, baz akımını hesapla, diyotu silip uyarıyı gör, mini testi çöz. |\n| 3 | H-köprüsü L293D: yön ve hız | ~25 dk | Devreyi kur, yön tablosunu sına, iki butonlu sürüşü dene. |\n| 4 | Röle: yüksek akım anahtarlama ve güvenlik | ~20 dk | Güvenlik bölümünü oku, Tetik'i LOW yap, butonlu ve eşikli sketch'leri dene. |\n| 5 | Proje: Sıcaklığa bağlı otomatik fan ve servo tarayıcı | ~35 dk | Planı yaz, devreyi kur, sıcaklığı değiştirerek sına, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunları kontrol et:\n- `analogRead`, `map` ve `analogWrite` (PWM) kullanabiliyor mu? (Ders 11, 14, 16)\n- `if/else`, `for` ve fonksiyon yazabiliyor mu? (Ders 4, 7, 19)\n- Butonu `INPUT_PULLUP` ile okuyabiliyor mu? (Ders 6)\n- NTC ile sıcaklık hesabını görmüş mü? (Ders 13; proje dersinde gerekli)\n- Ohm yasasıyla akım hesaplayabiliyor mu? (Ders 2)\n\n### Kavram haritası\n- **Hareket:** servo (açı, darbe genişliği) → DC motor (hız) → yön (H-köprüsü)\n- **Güç aktarımı:** pin → baz direnci → NPN / MOSFET → motor → flyback diyot\n- **Yön ve hız:** L293D → IN1, IN2 (yön) → EN (PWM hız) → VCC1 mantık, VCC2 motor\n- **Ayrık devre:** röle → COM, NO, NC → aktif-LOW → histerezis → güvenlik\n- **Proje:** NTC ölçümü → histerezisli karar → map ile fan hızı → servo taraması\n\n### Sık yapılan hatalar\n- **`attach` unutmak.** Servo hiç hareket etmez.\n- **Servoda D9 ve D10'dan PWM beklemek.** Servo kütüphanesi bu iki pinin `analogWrite`'ını kapatır.\n- **Motoru doğrudan pine bağlamak.** Pinin akım sınırı aşılır; transistör ya da sürücü kullan.\n- **Baz direncini ya da flyback diyotu atlamak.** Laboratuvar uyarı verir; gerçekte parça bozulur.\n- **Diyotu ters bağlamak.** Çizgili uç (katot) motorun artı tarafına bakmalıdır.\n- **L293D'de VCC1, VCC2, GND ya da EN'i unutmak.** Çıkışlar boşta kalır, motor dönmez.\n- **IN1 ve IN2'yi aynı yapmak.** Motor durur.\n- **Röle mantığını ters sanmak.** Aktif-LOW modül LOW ile çeker.\n- **Tek eşik kullanmak.** Röle ve fan eşik civarında titrer; histerezis ekle.\n- **Şebeke gerilimiyle röle denemek.** Ölümcüldür; yalnız eğitimli uzman yapabilir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bak, \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku ve soruyu tekrar çöz.\n3. Servo için açıyı 45 dereceye götürüp darbe genişliğini hesapla (≈ 1008 µs).\n4. NPN devresi için baz akımını 1 kΩ ve 2,2 kΩ değerleriyle hesapla ve karşılaştır.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Motoru neden doğrudan pine bağlamıyoruz, ve flyback diyot ne yapar?\"\n6. Proje programını bakmadan yeniden yaz; eşikleri değiştirip etkisini yaz.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Otomatik fan ve servo tarayıcı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Fan doğrudan pinde ya da diyot/baz direnci eksik; laboratuvar uyarı veriyor | Transistör, baz direnci, flyback diyot ve servo doğru bağlı, uyarı yok | Bağlantılar düzenli; her parçanın neden orada olduğunu açıklıyor |\n| Karar | Tek eşik; fan eşikte titriyor | 30 °C aç, 28 °C kapat histerezisi çalışıyor | Eşikleri kendi seçip sıcaklık özelliğiyle sınıyor ve nedenini açıklıyor |\n| Hız | Fan yalnız aç/kapa | Hız sıcaklıkla `map` ile artıyor | Alt sınırı (90) neden koyduğunu anlatıyor, aralığı kendi deniyor |\n| Servo | Servo hiç ya da yanlış açıda hareket ediyor | Fan açıkken 30-150 tarıyor, soğukken 90'da park | Tarama aralığı ve hızını ayarlıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor; geliştirme (UYARI gibi) ekliyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta öğrenci kodun fiziksel dünyada hareket oluşturduğunu görür. Önemli kavram ayrımı: bilgi (pin) ile güç (motor kaynağı) ayrı yollardan gider.\n- **Nasıl destek olunur?** Takıldığında cevap vermek yerine sor: \"Akım nereden girip nereden çıkıyor?\", \"Laboratuvar hangi uyarıyı veriyor?\", \"Hangi pini sürüyorsun, güç nereden geliyor?\"\n- **Güvenlik.** Platformdaki her şey sanaldır. Gerçek parçaya geçilirse motoru Arduino'nun 5V ucundan beslemek kartı sıfırlayabilir; ayrı kaynak kullanılır ve GND'ler birleştirilir. Röle dersinde şebeke gerilimiyle (220 V) hiçbir deney yapılmaz; bu iş yalnız eğitimli uzmana aittir.\n- **Süre.** Dersleri günlere yaymak kalıcılığı artırır.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Servo: açı kontrolü",
          "durationMin": 20,
          "problem": "Robot kolların, kamera tutucuların ve radar tarayıcıların ortak bir parçası var: servo. Bir servoya \"tam 37 dereceye git\" dersin, gider ve orada durur. Peki sıradan bir motor bunu neden yapamaz ve servo hangi açıya gideceğini sinyal telinden nasıl öğrenir?",
          "contentMd": "Servonun içinde küçük bir motor, dişliler ve konumu ölçen bir sensör vardır. Servo, üç telinden biriyle gelen **darbe genişliğine** bakar. Darbe 20 ms'de bir tekrarlanır:\n\n- Kısa darbe (yaklaşık 544 µs): 0 derece\n- Orta darbe (yaklaşık 1472 µs): 90 derece\n- Uzun darbe (yaklaşık 2400 µs): 180 derece\n\n`Servo` kütüphanesi bu darbeleri senin yerine üretir. Sen yalnızca açıyı söylersin.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Servo | **GND** pini → Uno GND |\n| | **VCC** pini → Uno 5V |\n| | **SIG** (sinyal) pini → **D9** |\n| Potansiyometre (ikinci sketch için) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |\n\nLaboratuvarda servo, Uno'nun 5V ucundan beslenir; servo gücü için ayrı bir kaynak gerekmez. Servo 4 V'un altında beslenirse ya da VCC/GND bağlı değilse hareket etmez, açısı değişmez. Gerçek bir devrede küçük servolar yük altında kartın 5 V hattını zorlayabilir; laboratuvar bu etkiyi modellemez.\n\nÇalışırken tuvaldeki servo kolunun açısını izleyebilirsin. Servo için Sanal ölçüm göstermez; ölçüm direnç, LED, motor gibi iki uçlu parçalar içindir.\n\n### Program\nİlk sketch servoyu üç konuma götürür. Kodu düzenleyiciye yaz (ya da aşağıdaki bloğu **Kopyala**), sonra ▶'e bas.\n\n```cpp\n// sketch: servo_uc_nokta\n#include <Servo.h>\n\nServo servom;               // bir servo nesnesi oluştur\n\nvoid setup() {\n  servom.attach(9);         // servo sinyal teli D9'a bağlı\n}\n\nvoid loop() {\n  servom.write(0);          // 0 dereceye git\n  delay(1000);\n  servom.write(90);         // 90 dereceye git\n  delay(1000);\n  servom.write(180);        // 180 dereceye git\n  delay(1000);\n}\n```\n\nİkinci sketch açıyı potansiyometreyle ayarlar. `map` ile 0-1023 aralığı 0-180 dereceye çevrilir. Potansiyometrenin **Konum** özelliğini sağ panelden (çalışırken de) değiştirebilirsin.\n\n```cpp\n// sketch: servo_pot\n#include <Servo.h>\n\nServo servom;\n\nvoid setup() {\n  servom.attach(9);\n}\n\nvoid loop() {\n  int okuma = analogRead(A0);              // 0-1023\n  int aci = map(okuma, 0, 1023, 0, 180);   // 0-180 derece\n  servom.write(aci);\n  delay(15);                               // servonun gitmesi için kısa bekleme\n}\n```\n\nÜçüncü sketch servoyu 0'dan 180'e, sonra geri tarattırır. Bu, projede kullanacağımız \"tarayıcı\" hareketinin temelidir.\n\n```cpp\n// sketch: servo_tarama\n#include <Servo.h>\n\nServo servom;\n\nvoid setup() {\n  servom.attach(9);\n}\n\nvoid loop() {\n  for (int aci = 0; aci <= 180; aci++) {   // ileri tara\n    servom.write(aci);\n    delay(15);\n  }\n  for (int aci = 180; aci >= 0; aci--) {   // geri tara\n    servom.write(aci);\n    delay(15);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `#include <Servo.h>` servo kütüphanesini programa ekler. `Servo servom;` bir servo nesnesi tanımlar.\n2. `attach(9)` servoyu D9'a bağlar ve 20 ms'lik darbe üretimini başlatır.\n3. `write(aci)` açıyı 0-180 arasında verirsin. Kütüphane bunu 544-2400 µs arası bir darbeye çevirir; 90 derece yaklaşık 1472 µs eder.\n4. Servo hemen ışınlanmaz, dönmek zaman alır. Bu yüzden her adımdan sonra `delay(15)` bekleriz. Yavaş tarama için bekleme büyütülür, hızlı tarama için küçültülür.\n5. Servo kütüphanesi D9 ve D10'daki `analogWrite` (PWM) özelliğini kapatır. Servo kullandığın programda bu iki pinden PWM çıkışı bekleme.\n\n### Dene\n- `servo_tarama` içinde `delay(15)` değerini 5 ve sonra 40 yap. Tarama hızı nasıl değişiyor?\n- Taramayı yalnızca 30 ile 150 derece arasında yap.\n- `servo_pot` sketch'inde potansiyometrenin konumunu ortaya getir. Servo 90 dereceye gidiyor mu? Gitmiyorsa potansiyometrenin SIG, VCC ve GND kablolarını kontrol et.\n\n### Sık yapılan hatalar\n- Servo gücünü D9'dan almaya çalışmak: pin yalnız sinyal verir. Güç 5V ve GND uçlarından gelir. Laboratuvarda VCC ya da GND kablosu eksikse servo hiç hareket etmez.\n- SIG ile VCC kablolarını karıştırmak: sinyal 5V hattına giderse servo komut alamaz.\n- `attach` yazmayı unutmak: servo hiç hareket etmez.\n- Servoyu mekanik sınırının ötesine zorlamak: gerçek servoda dişliler uğultu yapar ve zarar görebilir. Bu yüzden `write` ile 0-180 aralığının dışına çıkma, tarama aralığını gerekirse daralt.",
          "question": "Servo neden her zaman 0 ile 180 derece arasında döner de bir DC motor gibi sürekli dönmez? Hangi projelerde \"sürekli dönen\" motor, hangilerinde \"istediğin açıya giden\" servo daha doğru olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Servonun sıradan bir DC motordan farkını: istediğin açıya gider ve orada durur\n- Servonun açıyı **darbe genişliğinden** nasıl anladığını\n- `Servo` kütüphanesiyle `attach` ve `write` kullanmayı\n- `map` ile bir potansiyometre değerini 0-180 dereceye çevirmeyi\n\n### Önceden bilmen gerekenler\nDers 3'te `delay` ve milisaniye, ders 4'te `for` döngüsü, ders 11'de `analogRead` ve potansiyometre, ders 14'te `map`.\n\n### Servo neden \"açıya gider\"?\nSıradan bir DC motor, güç verdiğin sürece döner; ne kadar döndüğünü bilmez. **Servo** ise içinde bir motor, bir dişli grubu ve milin açısını ölçen bir sensör barındırır. İçindeki küçük denetleyici, istenen açı ile ölçülen açıyı karşılaştırır ve fark sıfır olana kadar motoru sürer. Bu yüzden servo \"37 derece\" komutunu alınca gider ve orada durur.\n\n### Açı, darbe genişliğiyle söylenir\nServonun üç teli vardır: VCC (5 V), GND ve SIG (sinyal). Açıyı SIG teline gelen darbenin **genişliği** belirler. Darbe her 20 ms'de bir tekrarlanır; önemli olan darbenin ne kadar sürdüğüdür.\n\n```\nAçı     Darbe genişliği\n0 °     ~544 µs\n90 °    ~1472 µs\n180 °   ~2400 µs\n```\n\nAradaki açılar doğrusaldır: açı başına yaklaşık (2400 − 544) / 180 ≈ 10,3 µs eklenir. Örneğin 45 derece için 544 + 45 × 10,31 ≈ 1008 µs gerekir. `Servo` kütüphanesi bu darbeleri senin yerine üretir; sen yalnız açıyı yazarsın.\n\n### Üç komut yeter\n```\n#include <Servo.h>\nServo servom;          // servo nesnesi\nservom.attach(9);      // sinyal teli D9'da\nservom.write(90);      // 90 dereceye git\n```\n`attach` yazılmazsa darbe üretilmez ve servo hareket etmez. `write` yalnız 0-180 arası açı alır. Servo bir anda ışınlanmaz; dönmesi zaman alır, bu yüzden taramada her adımdan sonra kısa bir `delay` koyarız. Bekleme büyüdükçe tarama yavaşlar: 181 adım × 15 ms ≈ 2,7 saniye sürer.\n\n### Potansiyometre ile açı ayarlamak\n`analogRead` 0-1023 verir, servo ise 0-180 ister. `map(okuma, 0, 1023, 0, 180)` aralığı çevirir. `map` tam sayı hesabı yaptığı için sonuç aşağı yuvarlanır. Servo kütüphanesi D9 ve D10'daki `analogWrite` (PWM) özelliğini kapatır; bu iki pinden PWM bekleme.\n\n### Özet\nServo, istenen açıyı 20 ms'lik darbe tekrarının genişliğinden öğrenir: 544 µs 0 derece, 2400 µs 180 derecedir. `attach` ile pini tanıtır, `write` ile açıyı verirsin. Potansiyometreyle sürmek için `map` kullanılır. Servonun gücü 5V ve GND'den, komutu SIG telinden gelir.",
          "concepts": [
            {
              "term": "Servo",
              "definition": "İçinde motor, dişli ve açı sensörü bulunan; istenen açıya gidip orada duran motor.",
              "example": "Bir radar tarayıcısında servo, sensörü 30 ile 150 derece arasında döndürür.",
              "pitfall": "Servoyu sürekli dönen DC motor sanmak: servo 0-180 derece arasında bir açıya gider."
            },
            {
              "term": "Darbe genişliği",
              "definition": "SIG telindeki darbenin ne kadar sürdüğü; servo açıyı buradan anlar (0 derece ≈ 544 µs, 180 derece ≈ 2400 µs).",
              "example": "90 derece için darbe yaklaşık 1472 µs sürer ve her 20 ms'de tekrarlanır.",
              "pitfall": "Darbe sıklığını açı sanmak: açıyı belirleyen sıklık değil, darbenin genişliğidir."
            },
            {
              "term": "attach()",
              "definition": "Servo nesnesini bir pine bağlar ve darbe üretimini başlatır.",
              "example": "servom.attach(9); komutu servonun sinyal telinin D9'da olduğunu söyler.",
              "pitfall": "attach yazmayı unutmak: darbe üretilmez, servo hiç hareket etmez."
            },
            {
              "term": "write()",
              "definition": "Servoya gidilecek açıyı 0-180 derece arasında verir.",
              "example": "servom.write(135); servoyu 135 dereceye götürür.",
              "pitfall": "0-180 dışında açı vermek: servo mekanik sınırını zorlar."
            },
            {
              "term": "map()",
              "definition": "Bir sayıyı bir aralıktan başka bir aralığa çevirir; sonucu tam sayıdır.",
              "example": "map(512, 0, 1023, 0, 180) yaklaşık 90 verir.",
              "pitfall": "map'in küsuratlı sonuç vereceğini sanmak: sonuç tam sayıya aşağı yuvarlanır."
            }
          ],
          "quiz": [
            {
              "id": "m3h5d21-q1",
              "kind": "mcq",
              "prompt": "Servonun gideceği açıyı hangi tel taşır?",
              "options": [
                "VCC teli: gerilim arttıkça açı artar",
                "GND teli: toprak açıyı belirler",
                "SIG teli: darbenin genişliği açıyı belirler",
                "Üç telin hepsi eşit olarak"
              ],
              "answer": 2,
              "explanation": "Açı SIG teline gelen darbenin genişliğiyle söylenir. VCC ve GND yalnız güç taşır; gerilimi değiştirmek açıyı değiştirmez.",
              "skills": [
                "servo-angle"
              ]
            },
            {
              "id": "m3h5d21-q2",
              "kind": "numeric",
              "prompt": "Servo 0 derecede 544 µs, 180 derecede 2400 µs darbe istiyor ve aradaki değerler doğrusal. servom.write(45) için darbe kaç mikrosaniye olur?",
              "answer": 1008,
              "tolerance": 1,
              "unit": "µs",
              "explanation": "Açı başına (2400 − 544) / 180 ≈ 10,31 µs eklenir. 544 + 45 × 10,31 ≈ 1008 µs.",
              "skills": [
                "servo-angle"
              ]
            },
            {
              "id": "m3h5d21-q3",
              "kind": "predict-output",
              "prompt": "Potansiyometre 768 okuyor. Bu kod çalışınca servo ne yapar?\n\n```\nint okuma = 768;\nint aci = map(okuma, 0, 1023, 0, 180);\nservom.write(aci);\n```",
              "options": [
                "Yaklaşık 90 dereceye gider",
                "Yaklaşık 135 dereceye gider",
                "180 dereceye gider",
                "768 dereceye gider"
              ],
              "answer": 1,
              "explanation": "768 × 180 / 1023 ≈ 135,1 ve map tam sayıya yuvarlar: 135 derece. 90 derece ancak okuma 512 civarındayken olur; servo 180 dereceden öteye gidemez.",
              "skills": [
                "servo-angle",
                "prog-debug"
              ]
            },
            {
              "id": "m3h5d21-q4",
              "kind": "find-bug",
              "prompt": "Servo SIG-D9, VCC-5V, GND-GND olarak doğru bağlı ama hiç hareket etmiyor. Nedeni ne?\n\n```\n#include <Servo.h>\nServo servom;\n\nvoid setup() {\n}\n\nvoid loop() {\n  servom.write(90);\n  delay(1000);\n}\n```",
              "options": [
                "setup() içinde servom.attach(9) yok",
                "Servo servom; satırı fazla",
                "delay(1000) çok büyük",
                "write(90) geçerli bir açı değil"
              ],
              "answer": 0,
              "explanation": "attach olmadan darbe üretilmez ve servo komut almaz. 90 geçerli bir açıdır ve delay sorun çıkarmaz.",
              "skills": [
                "servo-angle",
                "prog-debug"
              ]
            },
            {
              "id": "m3h5d21-q5",
              "kind": "numeric",
              "prompt": "Bu tarama döngüsü servoyu 0'dan 180'e götürüyor. Tek yönlü tarama kaç milisaniye sürer?\n\n```\nfor (int aci = 0; aci <= 180; aci++) {\n  servom.write(aci);\n  delay(15);\n}\n```",
              "answer": 2715,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "0'dan 180'e kadar (180 dahil) 181 adım vardır ve her adım 15 ms bekler: 181 × 15 = 2715 ms. 180 × 15 = 2700 demek bir adımı unutmaktır.",
              "skills": [
                "servo-angle",
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Transistör ve MOSFET ile anahtarlama, DC motor",
          "durationMin": 25,
          "problem": "Arduino pini küçük bir LED'i rahatça yakar. Aynı pine bir fan motoru bağlasan ne olur? Motor yeterince akım alamaz, hatta pine zarar verebilirsin. Peki küçücük bir pin, kendisinden çok daha güçlü bir motoru nasıl yönetir?",
          "contentMd": "Bir Arduino pini en fazla yaklaşık 20 mA ile rahat çalışır; çıkış pininin kesin sınırı 40 mA'dir. Küçük bir DC motor ise çalışırken yüzlerce mA çekebilir. Çözüm: pin motoru doğrudan sürmez, bir **transistörü** açıp kapatır. Transistör, küçük bir akımla büyük bir akımı yöneten elektronik bir anahtardır.\n\n- **NPN transistör** (örneğin 2N2222 / PN2222): Bazına küçük bir akım verirsen kolektör-emitör arası iletir. Laboratuvardaki NPN, baz-emitör arası yaklaşık 0,7 V'u aşınca iletmeye başlar ve akım kazancı yaklaşık 100'dür. Küçük motorlar için uygundur.\n- **Mantık seviyeli MOSFET** (örneğin IRLZ44N): Geçide (gate) yaklaşık 2 V'un üstünde gerilim verince iletir. Gerilimle çalışır, neredeyse akım çekmez ve daha güçlü yükleri sürer. Dikkat: her MOSFET 5 V ile tam açılmaz; \"logic level\" olanı seç. Laboratuvardaki MOSFET mantık seviyelidir.\n\nMotor bir **bobindir**. Akımı kesince bobin bir anlığına yüksek gerilimli bir sıçrama üretir; bu sıçrama transistörü bozabilir. Bunu önlemek için motora ters yönde bir **flyback diyot** (örneğin 1N4007) bağlanır. Diyotun çizgili ucu (katot) motorun artı tarafına bakar. Laboratuvar bunu denetler: motor transistör ya da MOSFET ile sürülüyor ama flyback diyotu yoksa (ya da ters bağlıysa) uyarı çıkar. Aynı şekilde NPN'in tabanına seri direnç koymazsan \"taban akımı çok yüksek\" uyarısı alırsın; taban akımı yaklaşık 30 mA'yı aşarsa sorun sayılır.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| NPN transistör | **E** (emitör) → GND; **C** (kolektör) → motorun **M2** ucu |\n| 1 kΩ direnç | **1** ucu **D6**, **2** ucu transistörün **B** (baz) ucu |\n| DC motor | **M1** ucu → Uno 5V; **M2** ucu → transistörün C ucu |\n| Diyot | **A** (anot) → transistörün C ucu; **K** (katot, çizgili uç) → 5V (motorun artı tarafı) |\n| Potansiyometre | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |\n\nMOSFET'i denemek istersen NPN yerine MOSFET ekle: **G** (geçit) → D6 (arada 100 Ω direnç), **S** (kaynak) → GND, **D** (akaç) → motorun M2 ucu. Geçit ile GND arasına 10 kΩ'luk bir direnç koy; gerçek devrelerde Arduino açılırken geçit havada kalmasın diye konur. Flyback diyodu aynı şekilde bağlanır (A → D, K → 5V).\n\nLaboratuvarda motoru Uno'nun 5V ucundan beslersin; ayrı bir kaynak ve ortak GND bağlantısı gerekmez, çünkü tüm GND pinleri laboratuvarda aynı düğümdür. Gerçek devrede ise güçlü motoru Arduino'nun 5 V ucundan beslemek kartı sıfırlayabilir; orada ayrı bir kaynak kullanılır ve GND'ler birleştirilir. Bu ayrıntıyı unutma, ama laboratuvarda modellenmez.\n\n**Sanal ölçüm:** ▶'e bas, motoru seç. NPN ile tam gazda motor uçlarında yaklaşık 4,2 V ve 0,4 A görürsün (5 V'tan yaklaşık 0,8 V eksik: iletirken transistör ve hat da gerilim düşürür). Motor, uçlarındaki gerilimin yaklaşık 6'da biri hızla döner (6 V'ta tam hız): bu yüzden NPN ile tam gazda hız yaklaşık 0,70, MOSFET ile yaklaşık 0,83 olur. MOSFET'te kayıp daha azdır çünkü iletirken direnci çok küçüktür.\n\n### Program\nİlk sketch potansiyometre ile motor hızını ayarlar. D6 bir PWM pinidir; `analogWrite` motora giden ortalama gerilimi değiştirir. Potansiyometrenin **Konum** özelliğini sağ panelden (çalışırken de) değiştirerek hızı ayarla.\n\n```cpp\n// sketch: fan_pot\nconst int MOTOR = 6;        // transistörün bazına giden PWM pini\n\nvoid setup() {\n  pinMode(MOTOR, OUTPUT);\n}\n\nvoid loop() {\n  int okuma = analogRead(A0);       // 0-1023\n  int hiz = okuma / 4;              // 0-255\n  analogWrite(MOTOR, hiz);\n  delay(10);\n}\n```\n\nİkinci sketch motoru yavaşça hızlandırır, bir süre tam hızda tutar, sonra yavaşça yavaşlatır. Ani kalkış yerine yumuşak kalkış, gerçek bir motorda hem kaynağı hem dişlileri korur.\n\n```cpp\n// sketch: fan_rampa\nconst int MOTOR = 6;\n\nvoid setup() {\n  pinMode(MOTOR, OUTPUT);\n}\n\nvoid loop() {\n  for (int hiz = 0; hiz <= 255; hiz += 5) {   // hızlan\n    analogWrite(MOTOR, hiz);\n    delay(40);\n  }\n  delay(1000);                                // tam hızda bekle\n  for (int hiz = 255; hiz >= 0; hiz -= 5) {   // yavaşla\n    analogWrite(MOTOR, hiz);\n    delay(40);\n  }\n  delay(1000);\n}\n```\n\n### Nasıl çalışıyor?\n1. `const int MOTOR = 6;` pin numarasına bir ad verir; `const` bu değerin değişmeyeceğini söyler.\n2. D6 yüksek olunca baz akımı akar, transistör iletir ve motor akımı kolektör-emitör üzerinden GND'ye ulaşır. D6 düşük olunca motor durur.\n3. `analogWrite(MOTOR, 128)` pini hızla açıp kapatır; doluluk oranı yaklaşık %50 olur ve motor yarım güce yakın çalışır.\n4. Flyback diyot, motor akımı kesilince oluşan ters gerilimin gidebileceği bir yol açar. Böylece sıçrama transistöre zarar vermeden sönümlenir.\n5. Küçük motorlar çok düşük PWM değerinde dönmeyebilir. Gerçek motorlarda dönmeye başladığı en küçük değeri denemekle bulursun. Projede bunu kullanacağız.\n\n### Dene\n- `fan_pot` ile potansiyometre konumunu yavaşça artır. Sanal ölçümde motor gerilimi ve hızı nasıl değişiyor?\n- `fan_rampa` içinde `delay(40)` değerini büyüt. Kalkış nasıl değişiyor?\n- Motoru her 3 saniyede bir tam hızda 1 saniye çalıştırıp kapatan bir program yaz.\n- Flyback diyodunu devreden sil ve ▶'e bas. Hangi uyarı çıkıyor? Sonra diyodu ters bağla; uyarı mesajı ne diyor?\n\n### Sık yapılan hatalar\n- Motoru doğrudan pine bağlamak: gerçek pin yetersiz kalır ve zarar görebilir. Laboratuvarda da pinden çekilebilecek akım sınırı aşılınca uyarı çıkar.\n- Flyback diyotu atlamak ya da ters bağlamak: gerçek devrede transistör zamanla bozulur. Laboratuvar \"flyback-missing\" uyarısı verir. Doğru bağlantıda diyot normalde akım iletmez.\n- Baz direncini koymamak: baz akımı sınırsız kalır; gerçek devrede pin ve transistör zarar görür, laboratuvarda \"taban akımı\" uyarısı çıkar.\n- Mantık seviyeli olmayan bir MOSFET kullanmak: 5 V'ta yeterince açılmaz, ısınır ve motor güçsüz kalır.\n- Emitörü (ya da MOSFET'in kaynağını) GND'ye bağlamamak: akım yolu tamamlanmaz, motor dönmez.",
          "question": "Küçük bir pin büyük bir yükü yönetirken gücü nereden geliyor? Transistörü bir \"kapı\" ya da \"musluk\" gibi düşünürsek, musluğu çevirmek için gereken güç ile akan suyun gücü neden aynı olmak zorunda değil?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Arduino pininin neden bir motoru doğrudan süremediğini\n- **Transistörün** küçük bir akımla büyük bir akımı yöneten anahtar olduğunu\n- Baz direncinin değerini ve taban akımını hesaplamayı\n- **Flyback diyotun** ne işe yaradığını ve nasıl bağlandığını\n- `analogWrite` ile motor hızını ayarlamayı\n\n### Önceden bilmen gerekenler\nDers 2'de Ohm yasası, ders 11'de potansiyometre ve `analogRead`, ders 16'da PWM ve `analogWrite`.\n\n### Pin neden yetmez?\nBir Arduino pini yaklaşık 20 mA ile rahat çalışır; 40 mA'yı geçmek pine zarar verir. Küçük bir DC motor ise çalışırken yüzlerce mA çeker. Çözüm: pin motoru değil, motoru süren bir **anahtarı** yönetir. Güç motora 5V hattından gelir, pin yalnız \"aç\" ya da \"kapat\" der.\n\n### NPN transistör: akımla çalışan anahtar\nTransistörün üç ucu vardır: **B** (baz, kumanda), **C** (kolektör, yük akımının girdiği uç) ve **E** (emitör, GND tarafı). Baz-emitör arası yaklaşık 0,7 V'u aşınca küçük bir baz akımı akar ve transistör kolektör-emitör arasından çok daha büyük bir akımı geçirir. Laboratuvardaki kazanç yaklaşık 100'dür: 1 mA baz akımı en çok 100 mA'e izin verir.\n\nBaz direnci akımı sınırlar. D6 = 5 V ve 1 kΩ ile baz akımı yaklaşık (5 − 0,7) / 1000 = 4,3 mA olur; bu, 100 × 4,3 = 430 mA'e kadar yük akımına yeter. Baz direncini unutursan akım sınırsız kalır ve uyarı çıkar.\n\n### MOSFET: gerilimle çalışan anahtar\n**Mantık seviyeli MOSFET** geçit (G) ucuna yaklaşık 2 V üstünde gerilim verilince iletir ve neredeyse akım çekmez. Her MOSFET 5 V ile tam açılmaz; \"logic level\" olanı seçilir.\n\n### Flyback diyot\nMotor bir bobindir. Akım aniden kesilince bobin ters yönde yüksek bir gerilim sıçraması üretir ve transistörü bozabilir. Motora paralel, ters yönde bağlanan diyot bu akıma yol açar. Diyotun çizgili ucu (katot) motorun artı tarafına, yani 5V'a bakar.\n\n```\n5V ──┬── motor ──┬── C (transistör)\n     │           │\n     └── K ◄ A ──┘      diyot: A kolektöre, K 5V'a\n```\n\n### PWM ile hız\nD6 hızla açılıp kapanırsa motor ortalama gerilimi görür. `analogWrite(6, 128)` yaklaşık %50 doluluk verir. Laboratuvardaki motor 6 V'ta tam hızda döner; hız yaklaşık gerilim / 6 olur.\n\n### Özet\nPin küçük akımla transistörü yönetir, motorun gücü ayrı yoldan gelir. NPN için baz direnci, bobin için flyback diyot şarttır. MOSFET gerilimle çalışır ve mantık seviyeli olmalıdır. `analogWrite` motorun hızını PWM doluluğuyla ayarlar.",
          "concepts": [
            {
              "term": "NPN transistör",
              "definition": "Baz-emitör arası yaklaşık 0,7 V'u aşınca küçük baz akımıyla büyük kolektör akımını geçiren anahtar.",
              "example": "D6, 1 kΩ üzerinden bazı sürerek motoru açıp kapatır; kazanç yaklaşık 100'dür.",
              "pitfall": "Baz direncini koymamak: baz akımı sınırsız kalır ve uyarı çıkar."
            },
            {
              "term": "Baz direnci",
              "definition": "Bazdan geçen akımı sınırlayan seri direnç.",
              "example": "5 V, 0,7 V ve 1 kΩ ile baz akımı (5 − 0,7) / 1000 = 4,3 mA olur.",
              "pitfall": "Pini doğrudan bazın üzerine bağlamak: taban akımı 30 mA'yı aşabilir."
            },
            {
              "term": "Mantık seviyeli MOSFET",
              "definition": "Geçit gerilimi yaklaşık 2 V'u aşınca iletmeye başlayan, neredeyse akım çekmeyen anahtar.",
              "example": "G ucu D6'ya, S ucu GND'ye, D ucu motora bağlanır.",
              "pitfall": "Her MOSFET'in 5 V ile tam açıldığını sanmak: logic level olmayan ısınır ve motor güçsüz kalır."
            },
            {
              "term": "Flyback diyot",
              "definition": "Motor akımı kesilince oluşan ters gerilim sıçraması için yol açan, motora ters yönde bağlı diyot.",
              "example": "Diyotun A ucu transistörün C ucuna, çizgili K ucu 5V'a bağlanır.",
              "pitfall": "Diyotu atlamak ya da ters bağlamak: laboratuvar flyback uyarısı verir, gerçekte transistör bozulur."
            },
            {
              "term": "analogWrite ile motor hızı",
              "definition": "PWM doluluğu motora giden ortalama gerilimi, yani hızı değiştirir.",
              "example": "analogWrite(6, 128) yaklaşık %50 doluluk verir.",
              "pitfall": "0-255 dışında değer vermek: okuma / 4 yerine okuma * 4 yazılırsa çoğu konumda tam hız olur."
            }
          ],
          "quiz": [
            {
              "id": "m3h5d22-q1",
              "kind": "mcq",
              "prompt": "Motor neden doğrudan Arduino pinine değil de bir transistörün arkasına bağlanır?",
              "options": [
                "Pin 5 V'tan düşük gerilim verdiği için",
                "Pin yalnız birkaç on mA verebilir; motor gücü ayrı yoldan gelir, pin yalnız anahtarı yönetir",
                "Transistör motoru daha hızlı döndürdüğü için",
                "Motorun yönü transistörle değiştiği için"
              ],
              "answer": 1,
              "explanation": "Pin yaklaşık 20 mA ile rahat çalışır, 40 mA'yı aşmamalıdır; motor yüzlerce mA çeker. Transistör küçük baz akımıyla büyük akımı geçirir. Hız ya da yön için değil, akım kapasitesi için kullanılır.",
              "skills": [
                "transistor-switching"
              ]
            },
            {
              "id": "m3h5d22-q2",
              "kind": "numeric",
              "prompt": "D6 5 V veriyor; baz direnci 1 kΩ, baz-emitör eşiği 0,7 V. Baz akımı kaç mA olur? (Pinin iç direncini yok say.)",
              "answer": 4.3,
              "tolerance": 0.1,
              "unit": "mA",
              "explanation": "Dirence düşen gerilim 5 − 0,7 = 4,3 V. I = V / R = 4,3 / 1000 = 0,0043 A = 4,3 mA. Kazanç 100 olduğundan bu akım yaklaşık 430 mA'e kadar yük akımına yeter.",
              "skills": [
                "transistor-switching",
                "elec-ohm"
              ]
            },
            {
              "id": "m3h5d22-q3",
              "kind": "predict-output",
              "prompt": "Potansiyometre 600 okuyor. D6'daki PWM doluluk oranı yaklaşık ne olur?\n\n```\nint okuma = 600;\nint hiz = okuma / 4;\nanalogWrite(6, hiz);\n```",
              "options": [
                "%25",
                "%50",
                "%59",
                "%100"
              ],
              "answer": 2,
              "explanation": "600 / 4 = 150. Doluluk 150 / 255 ≈ 0,59, yani %59. %50 okuma 512 civarındayken olur; %100 için hız 255 olmalıdır.",
              "skills": [
                "motor-pwm-speed"
              ]
            },
            {
              "id": "m3h5d22-q4",
              "kind": "find-bug",
              "prompt": "Pot ile motor hızı ayarlanacak, ama motor potun orta konumundan önce zaten tam hızda dönüyor. Hatalı satır hangisi?\n\n```\nconst int MOTOR = 6;\nvoid setup() { pinMode(MOTOR, OUTPUT); }\n\nvoid loop() {\n  int okuma = analogRead(A0);\n  int hiz = okuma * 4;\n  analogWrite(MOTOR, hiz);\n  delay(10);\n}\n```",
              "options": [
                "pinMode(MOTOR, OUTPUT);",
                "int hiz = okuma * 4;",
                "analogWrite(MOTOR, hiz);",
                "delay(10);"
              ],
              "answer": 1,
              "explanation": "analogRead 0-1023, analogWrite 0-255 ister. Dönüştürmek için 4'e bölmek gerekir. 4 ile çarpınca okuma 64'ten sonra değer 255'i aşar ve çıkış sürekli HIGH kalır. Diğer satırlar doğrudur.",
              "skills": [
                "motor-pwm-speed",
                "prog-debug"
              ]
            },
            {
              "id": "m3h5d22-q5",
              "kind": "mcq",
              "prompt": "Motor 5V'a ve transistörün kolektörüne bağlı. Flyback diyotun çizgili ucu (katot) nereye bağlanır?",
              "options": [
                "Transistörün emitörüne",
                "GND'ye",
                "D6 pinine",
                "Motorun artı tarafına (5V)"
              ],
              "answer": 3,
              "explanation": "Normal çalışmada diyot ters yönde olmalı ve akım iletmemeli: K ucu artı tarafa (5V), A ucu kolektöre gider. Ters bağlanırsa sıçrama için yol açmaz ve laboratuvar uyarı verir.",
              "skills": [
                "transistor-switching",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "H-köprüsü L293D: yön ve hız",
          "durationMin": 25,
          "problem": "Transistörle motoru çalıştırdık ama motor hep aynı yöne döndü. Radyo kontrollü bir araç ise ileri de gidiyor, geri de. Motoru ters çevirmek için bağlantılarını elle mi değiştirmek gerekir?",
          "contentMd": "Bir DC motoru ters yöne döndürmek için artı ve eksi uçlarını yer değiştirmek yeter. Bunu kodla yapmak için dört anahtarlı bir devre kullanılır; şekli \"H\" harfine benzediği için adı **H-köprüsü**'dür. **L293D** çipi içinde iki H-köprüsü vardır ve motor akımının geri tepmesine karşı diyotları da içerir. Bu yüzden ayrıca flyback diyot gerekmez.\n\nLaboratuvardaki L293D'nin bu derste kullandığımız pinleri (parantez içinde gerçek çipin bacak numarası):\n\n| Laboratuvar pini | Görevi | Bağlantı |\n|---|---|---|\n| **EN12** (bacak 1) | Kanalı aç/kapat, PWM hızı | **D6** |\n| **IN1** (bacak 2) | Yön girişi 1 | **D7** |\n| **IN2** (bacak 7) | Yön girişi 2 | **D5** |\n| **OUT1** (bacak 3) | Motor ucu 1 | Motor **M1** |\n| **OUT2** (bacak 6) | Motor ucu 2 | Motor **M2** |\n| **GND** (bacak 4, 5, 12, 13) | Toprak | Uno GND |\n| **VCC2** (bacak 8) | Motorun gücü (gerçek çipte 4,5-36 V) | Uno 5V |\n| **VCC1** (bacak 16) | Çipin mantık gücü (5 V) | Uno 5V |\n\nLaboratuvarda L293D'nin dört GND bacağı tek bir **GND** pinidir. L293D kanal başına en fazla 600 mA verir; daha büyük motorlar için uygun değildir.\n\n**Dikkat:** L293D çıkışında yaklaşık 1,4 V düşürür. Çıkış \"yüksek\" olduğunda gerilim VCC2 - 1,4 V olur, \"düşük\" olduğunda yaklaşık 0,2 V'tur. Motor 5 V'tan beslenirse uçlarında yaklaşık 3,3 V görür; bu yüzden aynı motor L293D ile transistörlü devredekinden daha yavaş döner. Laboratuvarda bunu Sanal ölçümle görürsün. EN pini düşükken ya da çipin VCC1/VCC2 beslemesi eksikken çıkışlar boşta kalır (yüksek empedans) ve motor durur.\n\nYön tablosu:\n\n| D7 (IN1) | D5 (IN2) | D6 (EN) | Motor |\n|---|---|---|---|\n| HIGH | LOW | PWM | İleri, hız PWM'e bağlı |\n| LOW | HIGH | PWM | Geri, hız PWM'e bağlı |\n| LOW | LOW | herhangi | Durur |\n| HIGH | HIGH | herhangi | Durur (fren gibi) |\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| L293D | Yukarıdaki tabloya göre: EN12 → D6, IN1 → D7, IN2 → D5, VCC1 ve VCC2 → 5V, GND → GND |\n| DC motor | **M1** → L293D **OUT1**, **M2** → L293D **OUT2** |\n| Buton 1 | **A** ucu **D2**, **B** ucu GND (ileri) |\n| Buton 2 | **A** ucu **D3**, **B** ucu GND (geri) |\n| Potansiyometre | **SIG** → **A0** (hız), **VCC** → 5V, **GND** → GND |\n\nLaboratuvarda motor beslemesi Uno'nun 5V ucundan gelir (VCC2 → 5V); ayrı bir motor kaynağı yoktur. Gerçek devrede motor gerilimi 5 V'u aşıyorsa VCC2 ayrı kaynaktan beslenir ve o kaynağın GND'si Arduino GND'siyle birleştirilir.\n\n### Program\nİlk sketch motoru otomatik olarak ileri, dur, geri, dur şeklinde çalıştırır. Yön değiştirmeden önce motoru durdurup biraz bekleriz.\n\n```cpp\n// sketch: motor_yon\nconst int EN = 6;     // hız (PWM)\nconst int IN1 = 7;\nconst int IN2 = 5;\n\nvoid ileri(int hiz) {\n  digitalWrite(IN1, HIGH);\n  digitalWrite(IN2, LOW);\n  analogWrite(EN, hiz);\n}\n\nvoid geri(int hiz) {\n  digitalWrite(IN1, LOW);\n  digitalWrite(IN2, HIGH);\n  analogWrite(EN, hiz);\n}\n\nvoid dur() {\n  analogWrite(EN, 0);\n  digitalWrite(IN1, LOW);\n  digitalWrite(IN2, LOW);\n}\n\nvoid setup() {\n  pinMode(EN, OUTPUT);\n  pinMode(IN1, OUTPUT);\n  pinMode(IN2, OUTPUT);\n  dur();\n}\n\nvoid loop() {\n  ileri(200);\n  delay(2000);\n  dur();\n  delay(1000);\n  geri(200);\n  delay(2000);\n  dur();\n  delay(1000);\n}\n```\n\nİkinci sketch motoru iki butonla yönetir; hızı potansiyometre belirler. İki buton birlikte basılırsa motor durur. Butona basmak için tuvaldeki buton parçasına basılı tut ya da özellik panelinde **Basılı** seçeneğini aç.\n\n```cpp\n// sketch: motor_buton\nconst int EN = 6;\nconst int IN1 = 7;\nconst int IN2 = 5;\n\nvoid surus(bool yonIleri, int hiz) {\n  digitalWrite(IN1, yonIleri ? HIGH : LOW);\n  digitalWrite(IN2, yonIleri ? LOW : HIGH);\n  analogWrite(EN, hiz);\n}\n\nvoid dur() {\n  analogWrite(EN, 0);\n  digitalWrite(IN1, LOW);\n  digitalWrite(IN2, LOW);\n}\n\nvoid setup() {\n  pinMode(EN, OUTPUT);\n  pinMode(IN1, OUTPUT);\n  pinMode(IN2, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n  pinMode(3, INPUT_PULLUP);\n  dur();\n}\n\nvoid loop() {\n  int hiz = analogRead(A0) / 4;\n  bool ileriBas = (digitalRead(2) == LOW);   // basılı = LOW\n  bool geriBas = (digitalRead(3) == LOW);\n\n  if (ileriBas && !geriBas) {\n    surus(true, hiz);\n  } else if (geriBas && !ileriBas) {\n    surus(false, hiz);\n  } else {\n    dur();                                    // hiçbiri ya da ikisi birden\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Yön, `IN1` ve `IN2` pinlerinin farklı olmasıyla belirlenir. Ters çevirmek için ikisini de yer değiştirmek yeter.\n2. Hız, `EN` pinine verilen PWM ile ayarlanır; `analogWrite(EN, 200)` yaklaşık %78 doluluk demektir.\n3. `ileri`, `geri` ve `dur` fonksiyonları kodu okunur yapar. Her işin adı bellidir.\n4. `yonIleri ? HIGH : LOW` ifadesi \"yonIleri doğruysa HIGH, değilse LOW\" demektir.\n5. Motor dönerken yönü bir anda ters çevirmek gerçek motoru ve kaynağı zorlar. Önce `dur()`, sonra yeni yön.\n\n### Dene\n- `motor_yon` içindeki hızı 120 yap. Motor hâlâ dönüyor mu? Sanal ölçümde motorun gerilimine ve hızına bak.\n- Motoru her yönde 3 saniye çalıştıran ve aralarda 2 saniye bekleyen bir program yaz.\n- `motor_buton` sketch'inde iki butona birlikte basarak motorun gerçekten durduğunu doğrula.\n- EN12 kablosunu D6'dan çıkarıp GND'ye bağla ve ▶'e bas. Motor neden hiç dönmüyor?\n\n### Sık yapılan hatalar\n- VCC1'e 5 V vermeyi unutmak: çip hiç çalışmaz. Laboratuvar \"L293D beslenmemiş\" uyarısı verir.\n- VCC2'yi (motor gücü) bağlamamak: çıkışlar boşta kalır, motor dönmez.\n- GND'yi bağlamamak: çip çalışmaz.\n- EN pinini sürmemek ya da LOW tutmak: çıkış boşta kalır, motor durur.\n- Motor kaynağını VCC1'e bağlamak: gerçek çipte motor gerilimi 5 V'u aşarsa mantık tarafı zarar görür. Motor kaynağı VCC2'ye, 5 V mantık gücü VCC1'e gider.\n- Güçlü bir motoru L293D'ye bağlamak: gerçek çip aşırı ısınır. Büyük motorlar için daha güçlü sürücü gerekir.",
          "question": "Bir robot aracın tekerleklerini L293D'nin iki kanalına bağlasaydın, aracı sağa döndürmek için iki motora ne yaptırırdın? Bu yönleri kod olarak nasıl yazardın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir DC motorun yönünün neden artı-eksi uçlarının yer değiştirmesiyle değiştiğini\n- **H-köprüsünün** ve **L293D** çipinin ne yaptığını\n- IN1, IN2 ve EN pinleriyle yön ve hızı denetlemeyi\n- Güç bacaklarını (VCC1, VCC2, GND) doğru bağlamayı\n\n### Önceden bilmen gerekenler\nDers 6 ve 7'de `INPUT_PULLUP` ile `if/else`, ders 16'da `analogWrite`, ders 19'da fonksiyonlar, ders 22'de transistörle motor sürmek.\n\n### Yönü değiştirmek\nTransistörlü devrede motor hep aynı yöne döner. DC motoru ters döndürmek için artı ve eksi uçlarını yer değiştirmek yeter. Bunu elle yapmak yerine dört anahtardan oluşan, şekli \"H\" harfine benzeyen bir devre kullanılır: **H-köprüsü**. Anahtarların çaprazları birlikte kapanır; hangi çaprazın kapandığı akımın motordan hangi yöne geçeceğini belirler.\n\n### L293D\nL293D içinde iki H-köprüsü ve geri tepme diyotları bulunur; bu yüzden ayrı flyback diyot gerekmez. Kanal başına en çok 600 mA verir.\n\n```\nPin    Görevi\nEN12   Kanalı açar/kapatır, PWM ile hız\nIN1    Yön girişi 1\nIN2    Yön girişi 2\nOUT1   Motor ucu 1\nOUT2   Motor ucu 2\nVCC1   Çipin mantık gücü (5 V)\nVCC2   Motorun gücü\nGND    Toprak\n```\n\n### Yön tablosu\n```\nIN1   IN2   Motor\nHIGH  LOW   İleri\nLOW   HIGH  Geri\nLOW   LOW   Durur\nHIGH  HIGH  Durur (fren gibi)\n```\nYön, IN1 ile IN2'nin **farklı** olmasıyla belirlenir; hız EN pinindeki PWM'le ayarlanır. Örneğin `analogWrite(EN, 200)` 200 / 255 ≈ %78 doluluk verir. EN düşükken ya da çipin beslemesi eksikken çıkışlar boşta kalır ve motor durur.\n\n### Kayıp gerilim\nL293D çıkışında yaklaşık 1,4 V kaybeder. VCC2 = 5 V ise yüksek çıkış yaklaşık 3,6 V, düşük çıkış yaklaşık 0,2 V olur; motor yaklaşık 3,3 V görür. Aynı motor transistörlü devredekinden daha yavaş döner.\n\n### Güvenli yön değiştirme\nDönen motorun yönünü bir anda ters çevirmek motoru ve kaynağı zorlar. Önce `dur()`, kısa bekleme, sonra yeni yön. `ileri()`, `geri()` ve `dur()` fonksiyonları kodu okunur yapar.\n\n### Özet\nL293D, IN1 ve IN2 ile motorun yönünü, EN ile hızını belirleyen bir H-köprüsü çipidir. VCC1 mantık gücü, VCC2 motor gücü içindir; GND şarttır. Çip yaklaşık 1,4 V düşürür, bu yüzden motor biraz yavaş döner. Yön değiştirmeden önce motoru durdur.",
          "concepts": [
            {
              "term": "H-köprüsü",
              "definition": "Dört anahtarla motorun uçlarına gelen gerilimin yönünü değiştiren devre; şekli H harfine benzer.",
              "example": "L293D içinde iki H-köprüsü vardır, bu yüzden iki motoru ayrı ayrı yönetir.",
              "pitfall": "Dört anahtarı aynı anda kapatmak: gerçek köprüde kısa devre yapabilir; L293D bunu giriş mantığıyla önler."
            },
            {
              "term": "IN1 ve IN2",
              "definition": "Motorun yönünü belirleyen iki giriş; farklılarsa motor döner, aynıysa durur.",
              "example": "IN1 = HIGH ve IN2 = LOW iken motor ileri döner.",
              "pitfall": "İkisini de HIGH ya da LOW yapıp motorun döneceğini sanmak."
            },
            {
              "term": "EN12",
              "definition": "L293D'nin birinci kanalını açıp kapatan pin; PWM verilirse hızı ayarlar.",
              "example": "analogWrite(6, 200) yaklaşık %78 doluluk, yani yaklaşık %78 hız verir.",
              "pitfall": "EN'i bağlamamak ya da LOW bırakmak: çıkışlar boşta kalır, motor durur."
            },
            {
              "term": "VCC1 ve VCC2",
              "definition": "VCC1 çipin mantık gücüdür (5 V); VCC2 motorun gücünü taşır.",
              "example": "Laboratuvarda ikisi de 5V'a bağlanır.",
              "pitfall": "Motor kaynağını VCC1'e bağlamak: motor gerilimi 5 V'u aşarsa mantık tarafı zarar görür."
            },
            {
              "term": "Çıkış gerilim kaybı",
              "definition": "L293D yüksek çıkışta yaklaşık 1,4 V kaybeder; VCC2 = 5 V ise yaklaşık 3,6 V görülür.",
              "example": "Motor uçlarında yaklaşık 3,3 V kalır ve transistörlü devreden daha yavaş döner.",
              "pitfall": "Motorun 5 V alacağını beklemek."
            }
          ],
          "quiz": [
            {
              "id": "m3h5d23-q1",
              "kind": "numeric",
              "prompt": "L293D'nin VCC2'si 5 V. Yüksek çıkışta 1,4 V, düşük çıkışta 0,2 V kaybolur gibi düşün (yüksek çıkış 5 − 1,4 = 3,6 V, düşük çıkış 0,2 V). Motorun iki ucu arasında yaklaşık kaç volt kalır? (Küçük direnç kayıplarını yok say.)",
              "answer": 3.3,
              "tolerance": 0.15,
              "unit": "V",
              "explanation": "Yüksek uç 3,6 V, düşük uç 0,2 V; fark 3,4 V. Çıkış dirençlerinde ufak bir kayıp daha olduğundan laboratuvarda yaklaşık 3,3 V okunur. 5 V sanmak çipin kaybını unutmaktır.",
              "skills": [
                "h-bridge"
              ]
            },
            {
              "id": "m3h5d23-q2",
              "kind": "numeric",
              "prompt": "EN12 pinine analogWrite(EN, 200) yazıldı. PWM doluluk oranı yüzde kaçtır? (Tam sayıya yuvarla.)",
              "answer": 78,
              "tolerance": 1,
              "unit": "%",
              "explanation": "analogWrite 0-255 aralığındadır: 200 / 255 ≈ 0,784, yani yaklaşık %78. Motorun hızı bu oranla ortalama gerilimi değiştirir.",
              "skills": [
                "motor-pwm-speed"
              ]
            },
            {
              "id": "m3h5d23-q3",
              "kind": "predict-output",
              "prompt": "EN12 D6'ya, IN1 D7'ye, IN2 D5'e bağlı. Bu kod çalışınca motor ne yapar?\n\n```\ndigitalWrite(7, LOW);\ndigitalWrite(5, HIGH);\nanalogWrite(6, 200);\n```",
              "options": [
                "İleri döner",
                "Durur",
                "Geri döner, yaklaşık %78 güçle",
                "Geri döner, tam hızla"
              ],
              "answer": 2,
              "explanation": "IN1 = LOW ve IN2 = HIGH geri yönüdür. EN'e 200 / 255 ≈ %78 doluluk verildiği için tam hız değil. İleri için IN1 HIGH, IN2 LOW olmalıdır.",
              "skills": [
                "h-bridge",
                "motor-pwm-speed"
              ]
            },
            {
              "id": "m3h5d23-q4",
              "kind": "find-bug",
              "prompt": "ileri() fonksiyonu çağrılıyor ama motor hiç dönmüyor. Hatalı satır hangisi?\n\n```\nvoid ileri(int hiz) {\n  digitalWrite(IN1, HIGH);\n  digitalWrite(IN2, HIGH);\n  analogWrite(EN, hiz);\n}\n```",
              "options": [
                "void ileri(int hiz) {",
                "digitalWrite(IN1, HIGH);",
                "digitalWrite(IN2, HIGH);",
                "analogWrite(EN, hiz);"
              ],
              "answer": 2,
              "explanation": "IN1 ve IN2 ikisi de HIGH olunca motor durur. İleri için IN2 LOW olmalıdır. IN1'in HIGH olması doğrudur; EN satırı da sorun değildir.",
              "skills": [
                "h-bridge",
                "prog-debug"
              ]
            },
            {
              "id": "m3h5d23-q5",
              "kind": "mcq",
              "prompt": "Gerçek bir devrede motor 9 V ile çalışacak. 9 V kaynağın artısı L293D'nin hangi pinine bağlanır?",
              "options": [
                "VCC1",
                "EN12",
                "IN1",
                "VCC2"
              ],
              "answer": 3,
              "explanation": "Motor gücü VCC2'den gelir. VCC1 çipin 5 V mantık gücüdür; 9 V verilirse mantık tarafı zarar görebilir. EN12 ve IN1 sinyal girişleridir. Kaynağın GND'si Arduino GND'siyle birleştirilmelidir.",
              "skills": [
                "h-bridge",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "Röle: yüksek akım anahtarlama ve güvenlik",
          "durationMin": 20,
          "problem": "Transistör küçük motorları sürdü, ama bazen daha büyük bir yükü ya da Arduino'dan tamamen ayrı bir devreyi açıp kapatmak gerekir. \"Tık\" sesi çıkaran küçük bir kutu bunu yapar: röle. İçinde ne olduğunu ve neden bu kadar dikkat gerektirdiğini birlikte öğrenelim.\n\n## Güvenlik uyarısı\nSanal laboratuvarda yalnızca **düşük gerilimli** devreler kurulur: Uno'nun 5 V'u yeterlidir ve laboratuvar şebeke gerilimi sunmaz. Gerçek hayatta **şebeke gerilimi (220 V)** ölümcüldür; röleyle prize bağlı bir cihazı açıp kapatmak, bu işin eğitimini almış ve gerekli donanıma sahip bir uzmana aittir. Bir röle modülünün üzerinde \"250 V\" yazması, onu kendi başına güvenle kullanabileceğin anlamına gelmez. Burada öğrendiğin mantık (COM, NO, NC, aktif-LOW) düşük gerilimde de aynıdır.",
          "contentMd": "Röle, bir **elektromıknatıs** ile çalışan anahtardır. Bobine akım verince mıknatıs bir metal kolu çeker ve kontaklar kapanır. Arduino ile açıp kapattığın devre (kontak tarafı) bobin devresinden elektriksel olarak ayrıdır. Kontak tarafı kendi gerilimini taşımayan, yalnız bir anahtar gibi davranan bir devredir; buna **kuru kontak** denir.\n\nRöle modülünde bobini süren transistör, diyot ve genelde bir LED hazır gelir. Modülün üç giriş pini vardır: VCC (5 V), GND ve IN (sinyal). Kontak tarafında üç uç bulunur:\n\n- **COM**: ortak uç\n- **NO** (normalde açık): röle çekilmeyince açık, çekilince COM'a bağlanır\n- **NC** (normalde kapalı): röle çekilmeyince COM'a bağlı, çekilince açılır\n\nPiyasadaki modüllerin çoğu (özellikle optokuplörlü olanlar) **LOW ile çeker**: IN pinine `LOW` verince röle çeker, `HIGH` verince bırakır. Bazı modüller tersidir; gerçek modülde yazısına bakar ya da kısa bir denemeyle öğrenirsin. Laboratuvardaki röle parçasında bu, **Tetik** özelliğidir: \"HIGH ile çeker\" (varsayılan) ya da \"LOW ile çeker (aktif-LOW)\". Bu derste LOW ile çeken modül varsayıyoruz; bu yüzden röleyi ekledikten sonra Tetik'i **LOW ile çeker** yap. Röle modülü çalışmak için VCC'sinde 4 V'tan fazla gerilim ister; VCC ya da GND bağlı değilse röle hiç çekmez.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Röle modülü | **VCC** → 5V, **GND** → GND, **IN** → **D7**; özelliklerde Tetik: LOW ile çeker |\n| Kontak tarafı | Röle **COM** ucu → Uno 5V |\n| Küçük yük: 330 Ω direnç + LED | Röle **NO** ucu → direncin **1** ucu; direncin **2** ucu → LED **A**; LED **K** → GND |\n| Buton | **A** ucu **D2**, **B** ucu GND |\n| Potansiyometre (ikinci sketch) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |\n\nLaboratuvarda kontak tarafındaki gerilim de Uno'nun 5V ucundan gelir. Kontak tarafı ile bobin tarafı elektriksel olarak ayrı olsa da bu kolaylık için aynı 5V hattını kullanıyoruz. Gerçek devrede yük akımı, rölenin üzerinde yazan kontak akım değerinin çok altında kalmalıdır; biz burada en çok birkaç yüz mA'lik küçük yüklerle çalışıyoruz (LED yaklaşık 9 mA çeker).\n\n**Sanal ölçüm:** ▶'e bas, rölenin çekip bıraktığı sırada direnci ya da LED'i seç. Röle çekmişken LED'den yaklaşık 9 mA geçtiğini, bırakınca akımın sıfıra indiğini görürsün.\n\n### Program\nİlk sketch butona her basışta röleyi değiştirir. Röle modülü LOW ile çektiği için \"kapalı\" durumu `HIGH`'tır. Pini çıkış yapmadan önce `HIGH` yazarak açılışta rölenin bir anlığına tıklamasını önleriz.\n\n```cpp\n// sketch: role_buton\nconst int ROLE = 7;\nconst int BUTON = 2;\nbool acik = false;\n\nvoid setup() {\n  digitalWrite(ROLE, HIGH);        // önce kapalı durumu yaz\n  pinMode(ROLE, OUTPUT);\n  pinMode(BUTON, INPUT_PULLUP);\n}\n\nvoid loop() {\n  if (digitalRead(BUTON) == LOW) {     // basıldı\n    acik = !acik;                      // durumu ters çevir\n    if (acik) {\n      digitalWrite(ROLE, LOW);         // röle çeker\n    } else {\n      digitalWrite(ROLE, HIGH);        // röle bırakır\n    }\n    delay(50);\n    while (digitalRead(BUTON) == LOW) {\n      // buton bırakılana kadar bekle\n    }\n    delay(50);\n  }\n}\n```\n\nİkinci sketch bir sensör değerine göre röleyi açar ve kapatır. A0'daki potansiyometre bir sıcaklık sensörünü taklit eder. Açma eşiği (600) ile kapama eşiği (500) farklıdır. Bu farka **histerezis** denir.\n\n```cpp\n// sketch: role_esik\nconst int ROLE = 7;\nconst int ACMA = 600;     // bunun üstünde röle çeker\nconst int KAPAMA = 500;   // bunun altında röle bırakır\n\nbool acik = false;\n\nvoid setup() {\n  digitalWrite(ROLE, HIGH);\n  pinMode(ROLE, OUTPUT);\n}\n\nvoid loop() {\n  int deger = analogRead(A0);\n  if (!acik && deger > ACMA) {\n    acik = true;\n    digitalWrite(ROLE, LOW);\n  } else if (acik && deger < KAPAMA) {\n    acik = false;\n    digitalWrite(ROLE, HIGH);\n  }\n  delay(50);\n}\n```\n\n### Nasıl çalışıyor?\n1. Röle bobini transistör ya da modülün kendi sürücüsü üzerinden beslenir. Bobin de bir motor gibi akım kesilince gerilim sıçraması üretir. Bu yüzden bobine flyback diyot gerekir; modülde bu diyot hazırdır.\n2. `role_buton` basışı bir kez sayar: butona basılı tutsan bile durum yalnız bir kez değişir.\n3. `role_esik` iki ayrı eşik kullanır. Değer 500 ile 600 arasındayken röle olduğu durumda kalır.\n4. Tek eşik kullansaydın, değer eşiğin etrafında titrerken röle sürekli tıklar, kontaklar yıpranırdı. Histerezis bunu engeller.\n5. Röle bir mekanik parçadır ve ömrü sınırlıdır. Saniyede onlarca kez açıp kapatma, PWM gibi hızlı anahtarlama için kullanma. Hız ayarı gereken yerde transistör ya da MOSFET kullan.\n\n### Dene\n- `role_esik` içinde eşikleri 520 ve 480 yap. Histerezis aralığı daralınca ne değişir? Potansiyometrenin Konum özelliğini yavaşça değiştirerek röleyi izle.\n- `role_buton` programını, röle açıkken seri monitöre \"ACIK\", kapalıyken \"KAPALI\" yazdıracak şekilde genişlet.\n- Yükü NO yerine NC ucuna bağla. Yük hangi durumda çalışıyor? Dene ve not al.\n- Tetik özelliğini \"HIGH ile çeker\" yap ve `role_buton` ile ▶'e bas. Ne oluyor? Neden?\n\n### Sık yapılan hatalar\n- Şebeke gerilimi (220 V) ile röle denemeye kalkmak: asla. Bu iş yalnız eğitimli bir uzmana aittir; laboratuvarda 5 V yeter.\n- Röle modülünün LOW/HIGH mantığını bilmemek: röle açılışta çekili kalabilir. `pinMode`'dan önce `HIGH` yazmak bu durumu azaltır. Laboratuvarda Tetik özelliğinin yanlış olması aynı karışıklığı doğurur.\n- Röleyi çıplak (modülsüz) doğrudan pine bağlamak: bobin akımı pin için fazladır ve diyotsuz sıçrama pine zarar verir.\n- COM, NO ve NC uçlarını karıştırmak: yük ters mantıkla çalışır.\n- Röle modülünün VCC ya da GND'sini bağlamamak: röle çekmez, \"röle modülü beslenmemiş\" uyarısı çıkar.\n- Gerçek devrede kontak akımını kontak değerinin üstüne çıkarmak: kontaklar yapışır ya da yanar.",
          "question": "Rölenin kontak tarafı Arduino'dan elektriksel olarak ayrıdır. Bu ayrılığın sana hangi güvenliği sağladığını ve hangisini sağlamadığını düşün. Şebeke gerilimi kullanmak için bir kişinin hangi bilgi ve ekipmana sahip olması gerekir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Röle** denen elektromıknatıslı anahtarın nasıl çalıştığını\n- COM, NO ve NC uçlarının ne anlama geldiğini\n- **Aktif-LOW** bir modülü doğru sürmeyi\n- **Histerezis** ile rölenin titremesini önlemeyi\n- Neden düşük gerilimle çalışmayı ve şebeke gerilimine dokunmamayı\n\n### Önceden bilmen gerekenler\nDers 6 ve 7'de `INPUT_PULLUP`, `digitalRead` ve `if/else`, ders 8'de buton basışını bir kez saymak, ders 11'de `analogRead`, ders 22'de bobinin flyback diyotla korunması.\n\n### Güvenlik önce gelir\nBu portalda yalnız Uno'nun 5 V'uyla çalışırsın. Gerçek hayatta **şebeke gerilimi (220 V)** ölümcüldür; prize bağlı bir cihazı röleyle kontrol etmek eğitimli bir uzmanın işidir. Modülün üstünde \"250 V\" yazması senin güvenle kullanabileceğin anlamına gelmez.\n\n### Röle nedir?\nRöle, bir elektromıknatısla çalışan anahtardır. Bobine akım verilince mıknatıs bir kolu çeker ve kontaklar konum değiştirir. Bobin tarafı ile kontak tarafı elektriksel olarak ayrıdır; kontak tarafı yalnız bir anahtar gibi davranır (**kuru kontak**).\n\n```\nCOM  ortak uç\nNO   normalde açık:   çekilmeyince açık,   çekilince COM'a bağlanır\nNC   normalde kapalı: çekilmeyince COM'a bağlı, çekilince açılır\n```\n\nModülde bobini süren transistör ve diyot hazırdır; sen yalnız VCC, GND ve IN bağlarsın.\n\n### Aktif-LOW\nÇoğu modül IN pinine **LOW** verilince çeker, HIGH verilince bırakır. Bu yüzden \"kapalı\" durumu HIGH'tır. Açılışta rölenin bir anlığına tıklamaması için `pinMode`'dan önce `digitalWrite(ROLE, HIGH)` yazılır.\n\n### Histerezis\nSıcaklık gibi bir değer tek bir eşikte dalgalanırsa röle sürekli tıklar ve mekanik kontaklar yıpranır. Çözüm iki eşiktir.\n\n```\ndeger > 600  ise  çek\ndeger < 500  ise  bırak\n500-600 arası: olduğu gibi kal\n```\n\nBu 100 birimlik aralığa **histerezis** denir. Röle mekanik olduğu için hızlı PWM'e uygun değildir; hız ayarı için transistör ya da MOSFET kullan.\n\n### Özet\nRöle, düşük akımlı bir sinyalle ayrı bir devreyi açıp kapatan elektromıknatıslı anahtardır. Yük COM ile NO ya da NC arasına girer. Çoğu modül LOW ile çeker. Histerezis, eşik civarındaki titremeyi önler. Şebeke gerilimi yalnız uzmana aittir.",
          "concepts": [
            {
              "term": "Röle",
              "definition": "Elektromıknatısla çalışan, kontak tarafı kumanda tarafından elektriksel olarak ayrı bir anahtar.",
              "example": "Arduino bir röleyi sürer, röle de ayrı bir devredeki LED ya da yükü açar.",
              "pitfall": "Röleyi çıplak doğrudan pine bağlamak: bobin akımı pin için fazladır ve sıçrama pine zarar verir."
            },
            {
              "term": "COM, NO ve NC",
              "definition": "COM ortak uçtur; NO çekilince COM'a bağlanır, NC çekilmeyince COM'a bağlıdır.",
              "example": "Yük NO ile COM arasındaysa yük yalnız röle çekilince çalışır.",
              "pitfall": "NO ile NC'yi karıştırmak: yük ters mantıkla çalışır."
            },
            {
              "term": "Aktif-LOW",
              "definition": "IN pinine LOW verilince çeken, HIGH verilince bırakan röle modülü.",
              "example": "digitalWrite(7, LOW) röleyi çeker, HIGH bırakır.",
              "pitfall": "Mantığı bilmemek: röle açılışta çekili kalabilir; pinMode'dan önce HIGH yazmak bunu önler."
            },
            {
              "term": "Histerezis",
              "definition": "Açma ve kapama için iki ayrı eşik kullanmak; aradaki bölgede durum korunur.",
              "example": "600'ün üstünde çek, 500'ün altında bırak.",
              "pitfall": "Tek eşik kullanmak: değer eşik civarında titreyince röle sürekli tıklar ve kontaklar yıpranır."
            },
            {
              "term": "Şebeke gerilimi",
              "definition": "Prizdeki 220 V; ölümcüldür ve röleyle kontrolü yalnız eğitimli bir uzmana aittir.",
              "example": "Bu portalda yalnız 5 V'luk sanal devreler kurulur.",
              "pitfall": "Modül üzerindeki 250 V yazısını güvenli sanmak ve prizle denemek."
            }
          ],
          "quiz": [
            {
              "id": "m3h5d24-q1",
              "kind": "numeric",
              "prompt": "Röle çekmişken COM 5V'a, NO ucu 330 Ω direnç üzerinden kırmızı LED'e (Vf = 1,9 V) bağlı. LED'den geçen akım yaklaşık kaç mA'dir? (Röle ve kablo dirençlerini yok say.)",
              "answer": 9.3,
              "tolerance": 0.3,
              "unit": "mA",
              "explanation": "Dirence düşen gerilim 5 − 1,9 = 3,1 V. I = 3,1 / 330 ≈ 0,0094 A ≈ 9,4 mA. Röle bırakınca devre açılır ve akım sıfır olur.",
              "skills": [
                "relay-logic",
                "elec-ohm"
              ]
            },
            {
              "id": "m3h5d24-q2",
              "kind": "predict-output",
              "prompt": "Röle modülü LOW ile çekiyor ve başta bırakılmış. analogRead sırayla 650, 550, 480 döndürüyor. Her okumadan sonra röle durumu ne olur?\n\n```\nif (!acik && deger > 600) {\n  acik = true;\n  digitalWrite(7, LOW);\n} else if (acik && deger < 500) {\n  acik = false;\n  digitalWrite(7, HIGH);\n}\n```",
              "options": [
                "Çeker, bırakır, bırakır",
                "Çeker, çeker, bırakır",
                "Çeker, çeker, çeker",
                "Bırakır, çeker, bırakır"
              ],
              "answer": 1,
              "explanation": "650 > 600 olduğundan röle çeker. 550 iki eşiğin arasındadır, durum korunur ve röle çekili kalır. 480 < 500 olunca bırakır. Bu, histerezisin görevidir.",
              "skills": [
                "hysteresis",
                "relay-logic"
              ]
            },
            {
              "id": "m3h5d24-q3",
              "kind": "find-bug",
              "prompt": "Eşik aşılınca röle çekiyor ama hemen bırakıp yeniden çekiyor ve sürekli tıklıyor. Hatalı satır hangisi?\n\n```\nif (!acik && deger > ACMA) {\n  acik = true;\n  digitalWrite(ROLE, LOW);\n} else if (acik && deger > KAPAMA) {\n  acik = false;\n  digitalWrite(ROLE, HIGH);\n}\n```\n(ACMA = 600, KAPAMA = 500)",
              "options": [
                "if (!acik && deger > ACMA) {",
                "digitalWrite(ROLE, LOW);",
                "} else if (acik && deger > KAPAMA) {",
                "digitalWrite(ROLE, HIGH);"
              ],
              "answer": 2,
              "explanation": "Kapama koşulu deger < KAPAMA olmalıydı. > yazılınca röle çektikten hemen sonra (deger hâlâ 500'ün üstünde) bırakılır ve döngü tekrarlanır. LOW ile çekme ve HIGH ile bırakma doğrudur.",
              "skills": [
                "hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m3h5d24-q4",
              "kind": "mcq",
              "prompt": "Yük COM ile NO ucu arasına bağlı. Röle çekilince ne olur?",
              "options": [
                "NO, COM'a bağlanır ve yük çalışır",
                "NO, COM'dan ayrılır ve yük durur",
                "Yük her zaman çalışır",
                "Yük GND'ye bağlanır"
              ],
              "answer": 0,
              "explanation": "NO normalde açıktır: röle çekmediğinde COM'dan ayrıdır, çekince COM'a bağlanır. Yük NC ucuna bağlı olsaydı tam tersi olurdu.",
              "skills": [
                "relay-logic"
              ]
            },
            {
              "id": "m3h5d24-q5",
              "kind": "numeric",
              "prompt": "Açma eşiği 600, kapama eşiği 500. Histerezis aralığı 5 V / 1024 ölçeğinde yaklaşık kaç volttur?",
              "answer": 0.49,
              "tolerance": 0.02,
              "unit": "V",
              "explanation": "Aralık 600 − 500 = 100 birimdir. Bir birim 5 / 1024 ≈ 4,88 mV olduğundan 100 × 4,88 mV ≈ 0,49 V.",
              "skills": [
                "hysteresis",
                "elec-ohm"
              ]
            }
          ]
        },
        {
          "title": "Proje: Sıcaklığa bağlı otomatik fan ve servo tarayıcı",
          "durationMin": 35,
          "problem": "Bir bilgisayar kasasındaki fan, işlemci ısınınca hızlanır, soğuyunca yavaşlar. Sen de ortam ısınınca fanı kendiliğinden çalıştıran, üstelik servo ile ortamı tarayan bir sistem kurabilirsin. Bu hafta öğrendiklerin tek bir projede birleşiyor.",
          "contentMd": "Sistemin görevi:\n- NTC termistörden sıcaklığı oku (A2).\n- Sıcaklık **30 °C** ve üstüne çıkınca fanı çalıştır. Hız, sıcaklık arttıkça artsın (30 °C'de yavaş, 50 °C ve üstünde tam hız).\n- Sıcaklık **28 °C**'nin altına inene kadar fan kapanmasın (histerezis).\n- Fan çalışırken servo 30-150 derece arasında tarasın; soğukken servo 90 dereceye park etsin.\n- Sıcaklığı seri monitöre yaz.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| NTC termistör | **1** ucu **A2**, **2** ucu GND |\n| 10 kΩ direnç | **1** ucu 5V, **2** ucu **A2** |\n| NPN transistör | **E** → GND; **C** → fan motorunun **M2** ucu |\n| 1 kΩ direnç | **1** ucu **D6**, **2** ucu transistörün **B** ucu |\n| DC motor (fan) | **M1** → 5V; **M2** → transistör **C** |\n| Diyot | **A** → transistör **C**; **K** (çizgili uç) → 5V (fan artısı) |\n| Servo | **SIG** → **D9**; **VCC** → 5V; **GND** → GND |\n\nBu devre 13. dersteki ile aynıdır: NTC altta, sabit direnç üstte. Isındıkça NTC'nin direnci düşer ve A2'deki gerilim de düşer. Sıcaklık hesabını orada işledik: önce ADC değerinden NTC direncini, sonra Beta denklemiyle sıcaklığı buluruz.\n\nLaboratuvarda fan ve servo Uno'nun 5V ucundan beslenir; ayrı bir kaynak ya da ortak GND bağlantısı gerekmez. Gerçek devrede fan ve servo aynı zayıf kaynaktan beslenince kart sıfırlanabilir; orada ayrı 5 V kaynak kullanılır ve GND'ler birleştirilir.\n\n**Ortamı ısıtmak:** NTC parçasını seç ve sağ paneldeki **Sıcaklık** özelliğini değiştir. Bu özellik çalışırken de değişir. Varsayılan 25 °C'dir: fan kapalı, servo 90 derecede park olmalıdır. Sıcaklığı 45 °C yapınca fan dönmeli ve servo taramaya başlamalıdır. Sonra 29 °C'ye indir: histerezis nedeniyle fan hâlâ açık kalmalıdır. 27 °C'de kapanmalıdır.\n\n**Sanal ölçüm:** Çalışırken NTC'yi, 10 kΩ direnci ve fan motorunu seç. NTC üzerindeki gerilim sıcaklıkla düşer; motor hızı da seçtiğin sıcaklığa göre artar.\n\n### Program\n```cpp\n// sketch: fan_servo_proje\n#include <Servo.h>\n\nconst int NTC_PIN = A2;\nconst int FAN_PIN = 6;          // PWM, transistör üzerinden fan\nconst int SERVO_PIN = 9;\n\nconst float SABIT_R = 10000.0;  // 10 kΩ sabit direnç\nconst float NTC_R25 = 10000.0;  // 25 °C'de 10 kΩ\nconst float BETA = 3950.0;\n\nconst float ACMA_C = 30.0;      // fan bu sıcaklıkta başlar\nconst float KAPAMA_C = 28.0;    // fan bu sıcaklığın altında durur\n\nServo tarayici;\nbool fanAcik = false;\nint aci = 90;\nint yon = 2;                    // her adımda 2 derece\nint sayac = 0;\n\nfloat sicaklikOku() {\n  int adc = analogRead(NTC_PIN);\n  adc = constrain(adc, 1, 1022);                      // sıfıra bölmeyi önle\n  float rntc = SABIT_R * adc / (1023.0 - adc);        // NTC altta (13. ders)\n  float kelvin = 1.0 / (1.0 / 298.15 + log(rntc / NTC_R25) / BETA);\n  return kelvin - 273.15;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(FAN_PIN, OUTPUT);\n  tarayici.attach(SERVO_PIN);\n  tarayici.write(90);\n}\n\nvoid loop() {\n  float sicak = sicaklikOku();\n\n  // histerezisli açma/kapama\n  if (!fanAcik && sicak >= ACMA_C) {\n    fanAcik = true;\n  } else if (fanAcik && sicak < KAPAMA_C) {\n    fanAcik = false;\n  }\n\n  if (fanAcik) {\n    // 30-50 °C arasını fan hızına çevir, çok düşük hızlarda motor dönmez\n    int hiz = map((int)(sicak * 10), 300, 500, 90, 255);\n    hiz = constrain(hiz, 90, 255);\n    analogWrite(FAN_PIN, hiz);\n\n    // servo bir adım ilerler\n    aci = aci + yon;\n    if (aci >= 150 || aci <= 30) {\n      yon = -yon;                 // uca gelince yön değiştir\n    }\n    tarayici.write(aci);\n  } else {\n    analogWrite(FAN_PIN, 0);\n    aci = 90;\n    yon = 2;\n    tarayici.write(90);           // park\n  }\n\n  sayac++;\n  if (sayac >= 25) {              // yaklaşık yarım saniyede bir yazdır\n    sayac = 0;\n    Serial.print(\"Sicaklik: \");\n    Serial.print(sicak, 1);\n    Serial.print(\" C  Fan: \");\n    Serial.println(fanAcik ? \"ACIK\" : \"KAPALI\");\n  }\n  delay(20);\n}\n```\n\n### Nasıl çalışıyor?\n1. `sicaklikOku()` fonksiyonu A2'yi okur, NTC direncini ve sıcaklığı hesaplar. `constrain(adc, 1, 1022)` ADC sıfır ya da 1023 iken bölme hatasını engeller.\n2. Fan kararı iki eşiklidir: 30 °C'de açılır, 28 °C'nin altında kapanır. 29 °C'de olduğu durumda kalır.\n3. Hız, `map` ile 30-50 °C aralığından 90-255 PWM aralığına çevrilir. 90'ın altına inmeyiz, çünkü gerçek küçük motorlar düşük PWM'de dönmeye başlamaz.\n4. Servo taramayı `loop` her döndüğünde yalnızca 2 derece ilerleterek yapar. Böylece sıcaklık her adımda yeniden okunur ve tarama sırasında bile fan kararı güncel kalır.\n5. Fan kapanınca servo 90 dereceye park eder; kullandığımız `delay(20)` servoya hareket için zaman verir. Seri yazımı ise `sayac` seyreltir: her 25 turda bir (yaklaşık yarım saniyede bir) yazılır.\n\n### Dene\n- Eşikleri 26 ve 24 °C yap. Sıcaklık özelliğini 25 °C civarında oynatarak sistemi tetikle.\n- Servo tarama aralığını 60-120 dereceye daralt.\n- Sıcaklık 60 °C'yi geçince yalnızca seriye \"UYARI\" yazan bir koşul ekle. (Sıcaklık özelliği 120 °C'ye kadar çıkar.)\n\n### Sık yapılan hatalar\n- NTC ve sabit direnç yerleşimine uygun olmayan formülü kullanmak: sıcaklık ters ya da anlamsız çıkar.\n- Fanı doğrudan D6'ya bağlamak: transistör ve diyot gerekir. Laboratuvar eksik diyotu \"flyback\" uyarısıyla, eksik baz direncini \"taban akımı\" uyarısıyla bildirir.\n- NTC ve sabit direncin yerlerini değiştirmek: A2 hattının davranışı ters olur, kodun formülü de buna göre değişmelidir.\n- Servoyu 5V ya da GND'ye bağlamayı unutmak: servo hiç hareket etmez.\n- Histerezis koymamak: sıcaklık eşik civarındayken fan sürekli açılıp kapanır.\n- Servo kullanırken D9 ve D10'dan `analogWrite` beklemek: Servo kütüphanesi bu iki pinin PWM'ini kapatır. Bu yüzden fan D6'dadır.",
          "question": "Fan hızını sıcaklığa orantılı yapmak yerine yalnız \"aç/kapa\" yapsaydın sistem nasıl davranırdı? Gerçek bir ürün olsaydı, servoyu hangi amaçla kullanırdın: yön göstermek, kapağı açmak, bir sensörü döndürmek?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir sensörü, bir karar kuralını ve iki çıkışı tek programda birleştirmeyi\n- Sıcaklığa göre fan hızını `map` ile belirlemeyi\n- Histerezisli bir açma/kapama kararı yazmayı\n- Fan ve servoyu birbirini engellemeden aynı döngüde yönetmeyi\n\n### Önceden bilmen gerekenler\nDers 9'da seri monitör, ders 13'te NTC ile sıcaklık hesabı, ders 14'te `map` ve `constrain`, ders 21'de servo, ders 22'de transistörle fan, ders 24'te histerezis.\n\n### Sistem üç parçadır\nBu proje girdi, karar ve çıkıştan oluşur.\n\n```\nGirdi:  NTC termistör (A2)  ->  sıcaklık\nKarar:  >= 30 °C aç, < 28 °C kapat (histerezis)\nÇıkış:  fan hızı (D6, PWM) + servo taraması (D9)\n```\n\nBir proje yazarken önce bu üç parçayı ayır, sonra tek tek sına: önce sıcaklığı seriye yazdır, sonra fanı, en son servoyu ekle.\n\n### Sıcaklığı okumak\nNTC altta, 10 kΩ sabit direnç üstte olduğu için `rntc = R * adc / (1023 - adc)` kullanılır. Isındıkça NTC direnci düşer: 25 °C'de 10 kΩ, 45 °C'de yaklaşık 4,3 kΩ. Böylece A2'deki gerilim 2,5 V'tan yaklaşık 1,5 V'a iner. `constrain(adc, 1, 1022)` sıfıra bölmeyi önler.\n\n### Hızı sıcaklığa bağlamak\n```\nint hiz = map((int)(sicak * 10), 300, 500, 90, 255);\nhiz = constrain(hiz, 90, 255);\n```\n`map` tam sayı çalıştığı için sıcaklığı 10 ile çarparız; 30,0-50,0 °C aralığı 300-500 olur. Çıkış 90'dan başlar, çünkü küçük motor çok düşük PWM'de dönmez. 40 °C için hız 172 olur.\n\n### Karar: histerezis\nFan 30 °C ve üstünde açılır, ancak 28 °C'nin altında kapanır. 29 °C'de fan eski durumunu korur. Bunun için bir `fanAcik` değişkeni tutulur.\n\n### Bekleme koymadan paylaşmak\nServo taraması `for` ile tek seferde yapılsaydı tarama bitene kadar sıcaklık okunmazdı. Bunun yerine `loop` her dönüşünde servoyu yalnız 2 derece ilerletir. Aynı fikirle seri çıktı her 25 turda bir yazılır. Servo kütüphanesi D9 ve D10'daki PWM'i kapattığı için fan D6'dadır.\n\n### Özet\nProje, NTC ile ölçüm, histerezisli karar ve fan ile servo çıkışlarını birleştirir. Hız `map` ile 90-255 aralığına çevrilir, servo adım adım ilerler, böylece her turda sıcaklık güncel kalır. Önce parçaları tek tek sına, sonra birleştir.",
          "concepts": [
            {
              "term": "Girdi, karar, çıkış",
              "definition": "Bir otomasyonun üç parçası: ölçüm yapan sensör, kuralı uygulayan program ve harekete geçen aygıt.",
              "example": "NTC sıcaklığı ölçer, program eşiğe bakar, fan ve servo çalışır.",
              "pitfall": "Hepsini birden yazıp denemek: önce parçaları tek tek sına."
            },
            {
              "term": "map ile hız",
              "definition": "Sıcaklık aralığını PWM aralığına çevirir.",
              "example": "map(400, 300, 500, 90, 255) 40 °C için 172 verir.",
              "pitfall": "map'e küsuratlı sıcaklık vermek: önce 10 ile çarpıp tam sayıya çevir."
            },
            {
              "term": "Minimum PWM",
              "definition": "Küçük motorun dönmeye başladığı en düşük PWM değeri; projede 90 alındı.",
              "example": "constrain(hiz, 90, 255) hızın 90'ın altına inmesini engeller.",
              "pitfall": "PWM'i sıfırdan başlatmak: motor ilk değerlerde dönmeyip uğuldayabilir."
            },
            {
              "term": "Adım adım tarama",
              "definition": "Servoyu her loop turunda birkaç derece ilerletmek; sıcaklık okuması bekletilmez.",
              "example": "aci = aci + yon; sonra tarayici.write(aci);",
              "pitfall": "Taramayı for ile tek seferde yapmak: tarama bitene kadar sıcaklık okunmaz."
            },
            {
              "term": "Servo ve PWM pinleri",
              "definition": "Servo kütüphanesi Uno'da D9 ve D10'daki analogWrite çıkışını kapatır.",
              "example": "Fan D6'dadır, servo D9'dadır.",
              "pitfall": "Fanı D9 ya da D10'a bağlamak: hız ayarı çalışmaz."
            }
          ],
          "quiz": [
            {
              "id": "m3h5d25-q1",
              "kind": "mcq",
              "prompt": "Fan 30 °C'de açılıyor ama 28 °C'nin altına inene kadar kapanmıyor. Bu iki ayrı eşik neden kullanılır?",
              "options": [
                "Fan daha hızlı dönsün diye",
                "Sıcaklık eşik civarında oynarken fan sürekli açılıp kapanmasın diye",
                "NTC'nin direnci ters çalıştığı için",
                "Seri monitörde daha az yazı çıksın diye"
              ],
              "answer": 1,
              "explanation": "Tek eşikte sıcaklık 29,9 ile 30,1 arasında titrerse fan sürekli açılır kapanır. İki eşik arasındaki bölgede (28-30 °C) durum korunur. Hız, direnç ya da seri çıktı ile ilgisi yoktur.",
              "skills": [
                "hysteresis"
              ]
            },
            {
              "id": "m3h5d25-q2",
              "kind": "predict-output",
              "prompt": "Fan başta kapalı (fanAcik = false). Sıcaklık sırayla 31, 29 ve 27,5 °C oluyor. Her ölçümden sonra fan durumu ne olur?\n\n```\nif (!fanAcik && sicak >= 30.0) {\n  fanAcik = true;\n} else if (fanAcik && sicak < 28.0) {\n  fanAcik = false;\n}\n```",
              "options": [
                "Kapalı, açık, kapalı",
                "Açık, açık, kapalı",
                "Açık, kapalı, kapalı",
                "Açık, açık, açık"
              ],
              "answer": 1,
              "explanation": "31 ≥ 30 olduğundan açılır. 29 °C, 28-30 arasındadır; açık kalır. 27,5 < 28 olunca kapanır.",
              "skills": [
                "hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m3h5d25-q3",
              "kind": "numeric",
              "prompt": "Fan hızı map((int)(sicak * 10), 300, 500, 90, 255) ile hesaplanıyor. Sıcaklık 40 °C ise PWM değeri kaçtır? (map tam sayı hesabı yapar.)",
              "answer": 172,
              "tolerance": 0,
              "explanation": "sicak * 10 = 400. map: (400 − 300) × (255 − 90) / (500 − 300) + 90 = 100 × 165 / 200 + 90 = 82 + 90 = 172 (82,5 aşağı yuvarlanır).",
              "skills": [
                "motor-pwm-speed",
                "sensor-actuator-project"
              ]
            },
            {
              "id": "m3h5d25-q4",
              "kind": "numeric",
              "prompt": "NTC altta, 10 kΩ sabit direnç üstte; A2 NTC üzerinden okunuyor. 45 °C'de NTC'nin direnci yaklaşık 4,35 kΩ. A2'deki gerilim yaklaşık kaç volttur?",
              "answer": 1.5,
              "tolerance": 0.05,
              "unit": "V",
              "explanation": "Gerilim bölücü: V = 5 × 4,35 / (4,35 + 10) ≈ 1,52 V. Isındıkça NTC direnci düşer, A2 gerilimi de düşer; 25 °C'de 2,5 V'tu.",
              "skills": [
                "sensor-actuator-project",
                "elec-ohm"
              ]
            },
            {
              "id": "m3h5d25-q5",
              "kind": "find-bug",
              "prompt": "Servo kullanan bu projede fan hızı ayarlanamıyor; fan ya hep açık ya hep kapalı gibi davranıyor. Hatalı satır hangisi?\n\n```\nconst int SERVO_PIN = 9;\n// ...\ntarayici.attach(SERVO_PIN);\n// ...\nanalogWrite(FAN_PIN, hiz);\n```\n(Başka bir yerde: const int FAN_PIN = 10;)",
              "options": [
                "tarayici.attach(SERVO_PIN);",
                "const int SERVO_PIN = 9;",
                "analogWrite(FAN_PIN, hiz);",
                "const int FAN_PIN = 10;"
              ],
              "answer": 3,
              "explanation": "Servo kütüphanesi Uno'da D9 ve D10'daki PWM'i kapatır, bu yüzden D10'dan analogWrite hız ayarı yapmaz. Fan D6 gibi başka bir PWM pinine taşınmalıdır. Diğer satırlar doğrudur.",
              "skills": [
                "sensor-actuator-project",
                "servo-angle",
                "prog-debug"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Zamanlama",
      "project": "Çoklu görev paneli",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. `delay()` kullanan bir programın neden butona ya da başka işe bakamadığını (bloklama) açıklayabilir.\n2. `millis()` ile `simdi - son >= aralik` kalıbını kullanarak bekletmeden zamanlama yapabilir ve `unsigned long` taşmasını bilir.\n3. Bir işi durumlar ve geçişler olarak çizip `enum` ile `switch` kullanan bir durum makinesi yazabilir.\n4. D2 ve D3 pinlerinde `attachInterrupt` kurabilir; ISR'yi kısa tutmanın ve `volatile` kullanmanın nedenini söyleyebilir.\n5. Birden çok görevi (LED, buzzer, iki buton) `delay` olmadan tek bir panelde birleştirebilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | delay'in tuzağı | ~20 dk | Anlatımı oku, `delay`'li programda butona kısa bas, kaçan basışları gör, mini testi çöz. |\n| 2 | millis() ile bloklamayan kod | ~25 dk | Aynı işi `millis` ile yaz, iki LED'i bağımsız hızlarda yak, taşma örneğini hesapla. |\n| 3 | Durum makineleri (FSM) | ~25 dk | Trafik ışığı durumlarını kâğıda çiz, sonra `switch` ile kodla, buton modunu dene. |\n| 4 | Kesmeler ve timer'lar | ~30 dk | D2'de kesme kur, `CHANGE` ile `FALLING` farkını gör, timer süresini hesapla. |\n| 5 | Proje: Çoklu görev paneli | ~35 dk | Görev tablosunu yaz, devreyi kur, paneli çalıştır, proje ölçütüyle değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunları kontrol et:\n- Butonu `INPUT_PULLUP` ile okuyabiliyor mu? Basılı = LOW kuralını biliyor mu? (Ders 6)\n- `if`, `else` ve `switch` yazabiliyor mu? (Ders 7)\n- Buton basışının kenarını (yeni basış) algılamayı biliyor mu? (Ders 8)\n- `tone()` ve `noTone()` ile buzzer çaldırabiliyor mu? (Ders 18)\n- Fonksiyon tanımlayıp çağırabiliyor mu? (Ders 19)\n\n### Kavram haritası\n- **Sorun:** `delay` bloklar → bakış anları arası olaylar kaçar\n- **Çözüm 1:** `millis()` → `simdi - son >= aralik` → her işe kendi `son` değişkeni → `unsigned long` ve taşma\n- **Çözüm 2:** durum makinesi → `enum` + `switch` + `break` → zamanla ya da olayla geçiş\n- **Çözüm 3:** kesme → `attachInterrupt` (D2, D3) → ISR kısa → `volatile` → bayrak; timer kesmesi\n- **Proje:** görev tablosu → modlar → kesme + `millis` + FSM bir arada → zaman aşımı güvenliği\n\n### Sık yapılan hatalar\n- **`loop()` içinde yine `delay` bırakmak.** Bütün kazanç kaybolur; diğer görevler de beklemeye girer.\n- **Süreyi toplamayla kontrol etmek.** `simdi >= son + aralik` taşmada bozulur; `simdi - son >= aralik` yaz.\n- **Süre değişkeninde `int` kullanmak.** `int` yaklaşık 32,8 saniyede taşar; `unsigned long` kullan.\n- **Bütün işlere tek ortak `son` değişkeni vermek.** İşler birbirinin zamanını bozar.\n- **`case` sonunda `break;` unutmak.** Program alttaki durumun kodunu da çalıştırır.\n- **Durum değişince `durumBasi = simdi;` yazmamak.** Yeni durum hemen biter.\n- **Basılı tutulan butonu her turda saymak.** Kenar algılama (`basili && !oncekiBasili`) kullan.\n- **ISR içinde `delay`, `Serial.print` ya da uzun iş yapmak.** ISR'yi kısa tut, işi `loop()` yapsın.\n- **`volatile` yazmamak.** Paylaşılan değişken `loop()`'ta güncel görünmeyebilir.\n- **Kesmeyi D2/D3 dışında bir pinde denemek.** Uno'da dış kesme yalnızca bu iki pindedir.\n- **Mod değişince sayaçları sıfırlamamak.** Yeni modun ilk yanıp sönmesi yanlış zamanda gelir.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Yanlış yaptığın mini test sorularının açıklamalarını oku, sonra soruyu yeniden çöz.\n3. Blink'i `delay` olmadan, `millis` ile sıfırdan bakmadan yaz; sonra aralığı değiştir.\n4. Kendi seçtiğin bir cihaz (örneğin mikrodalga fırın) için durum şemasını kâğıda çiz: durumlar, olaylar, geçişler.\n5. Timer için bölücü 256 iken `OCR1A = 12499` değerinin kesme aralığını hesapla.\n6. Kendi cümlelerinle şu soruyu cevapla: \"Kesme ile `millis` arasında hangi durumda hangisini seçerim?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Çoklu görev paneli)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | LED, buzzer ya da butonlardan biri bağlı değil veya yanlış pinde | LED'ler dirençli, buzzer D8'de, butonlar D2 ve D3'te doğru bağlı | Bağlantılar düzenli, renkler ve türler (pasif buzzer) bilinçli seçilmiş |\n| Plan | Görev tablosu yok | Görev, tetikleyici ve değişken tablosu var | Tablo kodla birebir uyuyor ve kesme/yoklama seçimi gerekçelendirilmiş |\n| Zamanlama | Kodda `delay` var ya da görevler birbirini bekletiyor | Hiç `delay` yok; LED ve buzzer süreleri tabloyla uyuşuyor | Süreler değiştirilip etkisi açıklanıyor; taşma güvenliği (çıkarma) bilinçli |\n| Kesme ve durum | Mod değişimi çalışmıyor ya da ISR içinde uzun iş var | Kesme + bayrak ve mod durum makinesi doğru çalışıyor | Sıçrama koruması, `volatile` ve sayaç sıfırlama gerekçeleriyle açıklanıyor; yeni mod eklenmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Görevleri ve modları adım adım anlatıyor | Hata yapıp nasıl bulduğunu (örneğin kaçan basış) anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta tek bir işlemcinin birden çok işi nasıl yürüttüğünü anlamaktır. En zor kavram \"beklemeden zamanı sormak\"tır; öğrenci ilk anda `delay`'e dönmek isteyebilir. Ders 26'daki kaçan basış deneyimi bu geçişin gerekçesidir.\n- **Nasıl destek olunur?** Cevabı vermek yerine sor: \"Bu satır çalışırken başka hangi iş bekliyor?\", \"Son değişim ne zaman yazıldı?\", \"Bu fonksiyon kesmeden mi çağrılıyor, `loop()`'tan mı?\" Durum şemasını önce kâğıda çizdirmek çoğu karışıklığı önler.\n- **Süre.** Kesme ve timer dersi (29) yoğundur; Timer1 kodunun satır satır anlaşılması beklenmez, mantığı (sayaç, eşleşme, kesme) yeterlidir.\n- **Güvenlik.** Platformdaki her şey sanaldır. Ders 30'daki zaman aşımı örneği, motor ve röle gibi çıkışlarda güvenli duruma geçmenin neden önemli olduğunu gösterir. Gerçek donanımda motor doğrudan Uno pininden sürülmez; şebeke gerilimiyle hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "delay'in tuzağı",
          "durationMin": 20,
          "problem": "`delay()` ile LED'i yakıp söndürmek çok kolaydı. Ama LED yanıp sönerken bir butona kısa süre bassan ne olur? Kart, butona bastığını fark eder mi, yoksa o an \"uyuyor\" mu? Bu derste bunu deneyle göreceksin.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| LED (kırmızı) + 330 Ω direnç | Direnç 1 ucu **D13**, direnç 2 ucu LED **A**; LED **K** → GND |\n| Buton | **A** ucu **D2**, **B** ucu GND (`INPUT_PULLUP`, basılı = LOW) |\n\nSonra kodu `sketch.ino`'ya yazıp ▶'e bas. Direnci seçip özellik panelinden 330 Ω yap.\n\n### Program\nAşağıdaki program LED'i 1 saniye yakıp 1 saniye söndürür. Her turun sonunda butona bakar; basılıysa sayacı artırır ve yazdırır.\n\n```cpp\n// sketch: delay_kacirir\nint sayac = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n\n  if (digitalRead(2) == LOW) {   // butona yalnızca burada bakılıyor\n    sayac++;\n    Serial.print(\"Basis sayisi: \");\n    Serial.println(sayac);\n  }\n}\n```\n\nŞimdi LED yanarken devre tuvalindeki butona kısa bir an (0,1 saniye) tıkla; tuşa basılı tutmak için fare düğmesini bırakmadan bekle. Büyük olasılıkla Seri monitörde hiçbir şey çıkmaz. Butonu 2 saniyeden uzun basılı tutarsan ise sayılır. Laboratuvarda bunu sen yapmadan da görebilirsin: etkinlik hedefleri bu davranışı kontrol eder.\n\n### Nasıl çalışıyor?\n1. `delay(1000)` çalışırken işlemci başka hiçbir satıra geçmez; sadece sayar. Buna **bloklayan** kod denir.\n2. Butona `digitalRead` ile yalnızca turun sonunda, 2 saniyede bir bakılıyor.\n3. Bu iki \"bakış\" arasında yapılan her kısa basış kaçırılır. Kart butonu hiç görmemiştir.\n4. Basış ancak tam bakış anına denk gelirse (ya da basılı tutulursa) yakalanır.\n\nKaç kez döndüğünü kendin de görebilirsin:\n\n```cpp\n// sketch: delay_tur_sayaci\nint tur = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  tur++;\n  Serial.println(tur);\n  digitalWrite(13, !digitalRead(13));   // LED'in durumunu tersine çevir\n  delay(1000);\n}\n```\n\n`loop()` saniyede yalnızca **bir kez** çalışır. Yani kartın \"gözü\" saniyede bir kez açılır. İşlemci saniyede milyonlarca işlem yapabilir, ama `delay` onun neredeyse tüm zamanını boşa harcatır.\n\n### Dene\n- İlk programda LED yanarken butona kısa bas. Sayaç artıyor mu? Sonra butonu 2 saniye basılı tut ve tekrar dene.\n- `delay(1000)` değerlerini `delay(100)` yap. Kısa basışlar artık daha sık yakalanıyor mu? LED hâlâ 1 saniyede bir yanıp sönüyor mu?\n- Bir LED'i her 1000 ms'de, ikinci LED'i her 300 ms'de yanıp söndürmeyi yalnızca `delay` ile yapmaya çalış. Neden zor olduğunu açıkla.\n\n### Sık yapılan hatalar\n- \"Buton bozuk\" sanmak: Buton parçası sağlam; program basışı görmüyor.\n- Çözümü `delay` süresini küçültmekte aramak: Basışlar biraz daha sık yakalanır ama sorun bitmez, LED'in zamanlaması da bozulur.\n- Seri porta çok yazı yazdırıp `delay` ile yavaşlatmak: Bu da kartı bloklar.",
          "question": "Bir robotun hem motorunu sürmesi hem de engel butonuna bakması gerekiyor. `delay` kullanırsa ne olur? Sence bekleme işini `delay` olmadan nasıl yapabiliriz?",
          "explainerMd": "### Bu derste öğreneceklerin\n- `delay()` çalışırken işlemcinin başka hiçbir iş yapmadığını (**bloklama**)\n- Bir butona yalnızca belirli anlarda bakılırsa kısa basışların kaçacağını\n- Turun uzunluğunun \"kartın gözünün\" ne sıklıkla açıldığını belirlediğini\n- `delay` süresini küçültmenin neden gerçek bir çözüm olmadığını\n\n### Önceden bilmen gerekenler\nDers 3'te `delay` ve Blink; ders 6'da butonun `INPUT_PULLUP` ile okunması (basılı = LOW); ders 7'de `if` koşulu; ders 9'da `Serial.println` ile yazdırma.\n\n### Kart \"uyurken\" ne olur?\n`delay(1000)` yazdığında kart bir saniye boyunca yalnızca sayar. Bu sırada başka satıra geçmez, butonu okumaz, seri porta bakmaz. Bu davranışa **bloklama** denir. Kart donmuş değildir; yalnızca \"bekle\" komutunu yerine getirir.\n\n### Bakış anları\nŞu döngüyü düşün:\n\n```\nyak → delay(1000) → söndür → delay(1000) → butona bak\n```\n\nButona turda yalnızca **bir kez** bakılır. İki bakış arası 2000 ms'dir. Bir basış ancak bakış anına denk gelirse görülür. Basış 100 ms sürüyorsa yakalanma şansı yaklaşık 100 / 2000 = %5'tir. Yani on basıştan dokuzu kaçar. Buton bozuk değildir; program onu görmemektedir.\n\n### Metinsel zaman çizelgesi\nAşağıda tur 2000 ms. `|` bakış anıdır, `#` butona basılı olduğu süreyi gösterir:\n\n```\nzaman (ms):  0 ........ 1000 ........ 2000 ........ 4000\nLED:         yanık       sönük        yanık/sönük\nbakış:                               |             |\nbasış A:       ##                                    (kaçtı)\nbasış B:                         ##########          (2000'deki bakışta basılı: yakalandı)\n```\n\nBasış A iki bakış arasında başlayıp bitti; hiçbir iz bırakmadı. Basış B bakış anını kapsadığı için sayıldı.\n\n### Süreyi küçültmek çözüm mü?\n`delay(100)` yazarsan tur 200 ms olur ve bakış sıklığı artar. Ama iki sorun kalır. Birincisi, yine de bakış anları arasında kaçan basışlar vardır. İkincisi, LED'in zamanlaması bozulur: artık saniyede yanıp sönmez, 10 kat hızlı yanıp söner. Bir sorunu çözmek için diğerini bozmuş olursun.\n\n### İki iş neden zor?\nBir LED 1000 ms'de, ikincisi 300 ms'de değişsin. `delay` ile her iki bekleme birbirini engeller; ikisini aynı anda doğru sürmek için karmaşık hesaplar gerekir. Gerçek projeler (robotun motoru, ekran, buton) böyle çok işlidir. Bu yüzden bundan sonraki derslerde bekleme yerine **zamanı sorgulamayı** öğreneceksin.\n\n### Özet\n`delay()` bloklayan bir komuttur: beklerken kart başka işe bakmaz. Bir girişe yalnızca turun sonunda bakılırsa, tur ne kadar uzunsa kısa olaylar o kadar kaçar. Süreyi küçültmek sorunu azaltır ama çözmez. Çözüm, bekleme yerine \"süre doldu mu?\" diye sorup hemen devam eden kodlardır.",
          "concepts": [
            {
              "term": "Bloklama",
              "definition": "Bir komutun bitmesini beklerken programın başka hiçbir satırı çalıştırmaması.",
              "example": "delay(2000) çalışırken kart 2 saniye boyunca butona da seri porta da bakmaz.",
              "pitfall": "Bloklamayı \"kart donuyor\" sanmak; kart çalışıyor, yalnızca bekleme komutunu yerine getiriyor."
            },
            {
              "term": "Tur süresi",
              "definition": "loop() içindeki tüm komutların bir kez çalışması için geçen toplam süre. Delay'li kodda neredeyse tamamı bekleme süresidir.",
              "example": "İki delay(500) içeren loop() tur başına yaklaşık 1000 ms sürer.",
              "pitfall": "Yalnızca tek bir delay'i sayıp turdaki diğer delay'leri unutmak."
            },
            {
              "term": "Bakış anı",
              "definition": "Bir girişin (örneğin butonun) okunduğu an. Bakış anları arasındaki olaylar programa hiç ulaşmaz.",
              "example": "Butona turun sonunda bakan 2000 ms'lik bir programda bakış anları 2 saniye arayla gelir.",
              "pitfall": "\"Butona bastım ama sayılmadı, buton bozuk\" demek; sorun genellikle program yapısındadır."
            },
            {
              "term": "Kaçan basış",
              "definition": "Bakış anları arasında başlayıp biten, bu yüzden programın hiç görmediği buton basışı.",
              "example": "100 ms'lik basışın 2000 ms'lik turda yakalanma şansı yaklaşık %5'tir.",
              "pitfall": "Kaçan basışı \"şansızlık\" saymak; yapıdaki bir kusurdur ve sürekli tekrarlanır."
            },
            {
              "term": "Süreyi kısaltma çözümü",
              "definition": "delay değerlerini küçülterek bakış sıklığını artırma denemesi; sorunu azaltır, bitirmez.",
              "example": "delay(1000) yerine delay(100) yazmak turu kısaltır ama LED'i de 10 kat hızlandırır.",
              "pitfall": "Bu yolla hem zamanlamayı bozmak hem de kaçan basışları tümüyle yok edemeyip \"çözdüm\" sanmak."
            }
          ],
          "quiz": [
            {
              "id": "m3h6d26-q1",
              "kind": "mcq",
              "prompt": "delay(1500) çalışırken Arduino ne yapar?",
              "options": [
                "Başka satırları çalıştırmaya devam eder, yalnızca LED beklemeye girer",
                "Giriş pinlerini okumaya devam eder ama çıkışları dondurur",
                "Bekleme bitene kadar başka hiçbir satırı çalıştırmaz",
                "Yalnızca loop() içindeki sonraki delay'i atlar"
              ],
              "answer": 2,
              "explanation": "delay() bloklayan bir komuttur: süre dolana kadar işlemci sonraki satıra geçmez, butona da bakmaz. Diğer seçenekler delay'in yalnızca bir kısmı beklettiğini ya da girişlerin okunduğunu söyler; hiçbiri doğru değildir.",
              "skills": [
                "prog-blocking"
              ]
            },
            {
              "id": "m3h6d26-q2",
              "kind": "numeric",
              "prompt": "Bir program loop() içinde butona yalnızca turun sonunda bakıyor. Tur, 1000 ms + 1000 ms'lik iki delay'den oluşuyor. Butona 100 ms boyunca basılıyor ve basışın başlama anı rastgele. Bu basışın yakalanma olasılığı yaklaşık yüzde kaçtır? (Bakışın anlık olduğunu varsay.)",
              "answer": 5,
              "tolerance": 0,
              "unit": "%",
              "explanation": "Bakış anları 2000 ms arayla gelir. 100 ms süren basış, ancak bakış anını kapsarsa yakalanır; bu da 100 / 2000 = 0,05, yani %5 demektir. %50 ya da %10 yazmak, turu 1000 ms ya da 200 ms sanmaktan çıkar.",
              "skills": [
                "prog-blocking",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d26-q3",
              "kind": "predict-output",
              "prompt": "Bu program çalışırken (butona basılmıyor) şu olaylar yaşanıyor: 100-200 ms arasında buton basılı tutuluyor, sonra 550-700 ms arasında yeniden basılı tutuluyor. 2 saniyenin sonunda Seri monitörde ne görünür?\n\n```\nint sayac = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(300);\n  digitalWrite(13, LOW);\n  delay(300);\n  if (digitalRead(2) == LOW) {\n    sayac++;\n    Serial.print(\"Basis sayisi: \");\n    Serial.println(sayac);\n  }\n}\n```",
              "options": [
                "Hiçbir şey",
                "Basis sayisi: 1 ve Basis sayisi: 2",
                "Basis sayisi: 1",
                "Basis sayisi: 2"
              ],
              "answer": 2,
              "explanation": "Buton yalnızca 600. ms'de okunur (300 + 300). 100-200 ms'deki basış bakıştan önce bitmiştir, kaçar. 550-700 ms'deki basış 600. ms'i kapsar, sayılır. Sonraki bakış 1200. ms'dedir ve buton bırakılmıştır. Sonuç tek satırdır.",
              "skills": [
                "prog-blocking",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d26-q4",
              "kind": "find-bug",
              "prompt": "Bu programın amacı butona basılınca LED'i hemen yakmaktır. Ama çoğu basış hiçbir şey yapmıyor. Asıl soruna yol açan satır hangisi?\n\n```\nvoid setup() {\n  pinMode(13, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n}\n\nvoid loop() {\n  if (digitalRead(2) == LOW) {\n    digitalWrite(13, HIGH);\n  }\n  delay(3000);\n}\n```",
              "options": [
                "pinMode(2, INPUT_PULLUP);",
                "if (digitalRead(2) == LOW) {",
                "digitalWrite(13, HIGH);",
                "delay(3000);"
              ],
              "answer": 3,
              "explanation": "Buton her 3 saniyede yalnızca bir kez okunuyor; delay(3000) kartı bloklar ve basışlar kaçar. Pull-up ve LOW karşılaştırması basılı = LOW kuralına uygundur, digitalWrite satırı da doğrudur.",
              "skills": [
                "prog-blocking",
                "prog-debug"
              ]
            },
            {
              "id": "m3h6d26-q5",
              "kind": "mcq",
              "prompt": "Bir arkadaşın kaçan basışları azaltmak için delay(1000) değerlerini delay(100) yaptı. Bu yaklaşımın en önemli sakıncası nedir?",
              "options": [
                "LED'in yanıp sönme hızı da değişir ve yine de bazı basışlar kaçar",
                "Derleyici hata verir",
                "Butona hiç bakılmaz",
                "Kart ısınır ve yavaşlar"
              ],
              "answer": 0,
              "explanation": "Süreyi küçültmek bakış sıklığını artırır ama basışlar yine bakış anları arasında kaçabilir; üstelik LED'in zamanlaması 10 kat hızlanarak bozulur. Derleme hatası ya da ısınma gibi sonuçlar doğmaz.",
              "skills": [
                "prog-blocking",
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "millis() ile bloklamayan kod",
          "durationMin": 25,
          "problem": "Mutfaktaki zamanlayıcıyı düşün: yumurtayı kaynatırken başında durmazsın, zamanlayıcıyı kurar ve başka işler yaparsın. Arduino'da `millis()` işte bu saat gibidir: kart çalışmaya başladığından beri geçen milisaniyeyi söyler. Biz de saate arada bir bakıp \"süre doldu mu?\" diye sorarız.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| LED 1 + 330 Ω direnç | **D13** → direnç → LED **A**; **K** → GND |\n| LED 2 + 330 Ω direnç | **D12** → direnç → LED **A**; **K** → GND |\n| Buton | **A** ucu **D2**, **B** ucu GND (`INPUT_PULLUP`) |\n\n### Program\nFikir: şimdiki zamanı oku, son değişimden bu yana geçen süreye bak. Yeterliyse LED'i değiştir ve \"son değişim\" zamanını yenile. Başka bir şey yapma, `loop()` hemen dönsün.\n\n```cpp\n// sketch: millis_blink_buton\nconst unsigned long ARALIK = 500;   // ms\nunsigned long sonDegisim = 0;\nbool ledYanik = false;\nbool oncekiBasili = false;\nint sayac = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - sonDegisim >= ARALIK) {   // 500 ms geçti mi?\n    sonDegisim = simdi;\n    ledYanik = !ledYanik;\n    digitalWrite(13, ledYanik);\n  }\n\n  bool basili = (digitalRead(2) == LOW);\n  if (basili && !oncekiBasili) {        // yeni basış (kenar)\n    sayac++;\n    Serial.print(\"Basis sayisi: \");\n    Serial.println(sayac);\n  }\n  oncekiBasili = basili;\n}\n```\n\nBu, önceki dersteki `delay`'li programla aynı işi yapar: LED yanıp söner ve butona bakar. Fark: `loop()` saniyede binlerce kez döner, butona hiç kaçırmadan bakar. Bir önceki derste kaçırdığın o kısa basış artık sayılır.\n\nAynı yöntemle iki ayrı işi, her birine kendi saatini vererek yürütebilirsin:\n\n```cpp\n// sketch: millis_iki_led\nunsigned long son1 = 0;\nunsigned long son2 = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  pinMode(12, OUTPUT);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - son1 >= 1000) {          // LED 1: her 1000 ms\n    son1 = simdi;\n    digitalWrite(13, !digitalRead(13));\n  }\n  if (simdi - son2 >= 300) {           // LED 2: her 300 ms\n    son2 = simdi;\n    digitalWrite(12, !digitalRead(12));\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `millis()` program çalışmaya başlayınca 0'dan başlar ve her milisaniyede 1 artar.\n2. Her iş için bir \"son yaptığım zaman\" değişkeni tutarsın (`sonDegisim`).\n3. `simdi - sonDegisim >= aralik` ifadesi \"aralık kadar süre geçti mi?\" demektir.\n4. `loop()` hiç beklemediği için her tur çok kısa sürer. Bu yüzden bütün işlere sırayla, sürekli bakılabilir.\n\n### Taşma uyarısı\n`millis()` değeri `unsigned long` türündedir (0 ile 4 294 967 295 arası). Yaklaşık 49,7 günde sınıra ulaşır ve **0'a döner**. Bir sistem haftalarca açık kalacaksa bu önemlidir. Süre değişkenlerini hep `unsigned long` yap ve süreyi **çıkararak** hesapla:\n\n```cpp\n// sketch: millis_tasma\nvoid setup() {\n  Serial.begin(9600);\n\n  unsigned long onceki = 4294967000UL;   // taşmaya 296 ms var\n\n  unsigned long simdi = 4294967100UL;    // 100 ms geçti\n  Serial.print(\"Dogru (cikarma): \");\n  Serial.println(simdi - onceki);        // 100\n  Serial.print(\"Yanlis (toplama): \");\n  Serial.println(simdi >= onceki + 500 ? \"sure doldu\" : \"dolmadi\");\n\n  simdi = 10;                            // sayaç sıfırlandı, toplam 306 ms geçti\n  Serial.print(\"Tasmadan sonra fark: \");\n  Serial.println(simdi - onceki);        // 306\n}\n\nvoid loop() {\n}\n```\n\nÇıkarma yöntemi taşmada bile doğru sonucu verir. `simdi >= onceki + 500` yazımı ise yanlıştır: `onceki + 500` taşıp küçük bir sayıya döner ve program süre dolmadan \"doldu\" der. Kural: **`simdi - onceki >= aralik`** yaz.\n\n### Dene\n- `millis_blink_buton` programında LED yanıp sönerken butona kısa kısa tıkla. Her basış sayılıyor mu? Önceki dersteki programla karşılaştır.\n- `millis_iki_led` programına üçüncü bir LED ekle (D11, her 700 ms). Başka hiçbir şeyi bozmadan çalışıyor mu?\n- Butona bastığında `Serial.println(millis())` yazdır. İki basış arasındaki farkı hesapla.\n\n### Sık yapılan hatalar\n- `unsigned long` yerine `int` kullanmak: `int` yaklaşık 32 saniyede (32 767 ms) taşar.\n- Süreyi toplamayla kontrol etmek (`simdi >= onceki + aralik`): taşmada hata verir.\n- `loop()` içine yine `delay` koymak: bütün kazanç kaybolur.\n- Her işe aynı \"son zaman\" değişkenini vermek: işler birbirinin zamanını bozar. Her işe kendi değişkenini ver.",
          "question": "`delay` programları ile `millis` programları arasındaki en büyük fark nedir? `millis` kullanırken kodu yazmak neden biraz daha uzun?",
          "explainerMd": "### Bu derste öğreneceklerin\n- `millis()` ile kartın çalışmaya başladığından beri geçen süreyi okumayı\n- \"Süre doldu mu?\" sorusunu `simdi - son >= aralik` kalıbıyla sormayı\n- Birden çok işe ayrı zaman değişkenleri vererek bloklamadan yürütmeyi\n- `millis()` taşmasını ve neden çıkarma yöntemiyle güvenli olduğunu\n\n### Önceden bilmen gerekenler\nDers 26'da `delay`'in bloklaması ve kaçan basışlar; ders 3'te `digitalWrite`; ders 8'de basışın kenarını algılama (önceki durumu hatırlama).\n\n### Kartın saati\n**`millis()`**, kart açıldığından beri geçen milisaniyeyi verir. Program başlayınca 0'dır, her milisaniyede 1 artar. Mutfak zamanlayıcısı gibi düşün: yumurta kaynarken başında beklemezsin, arada saate bakarsın. `millis()` ile de program başka işlerle uğraşırken arada saate bakar.\n\n### Kalıp: bak, karşılaştır, güncelle\n```\nunsigned long simdi = millis();\nif (simdi - son >= aralik) {\n  son = simdi;      // saati yenile\n  // işi yap\n}\n```\n\n`son`, işi en son yaptığın anı tutar. `simdi - son`, o günden bu yana geçen süredir. Süre `aralik` kadarsa işi yap ve `son`'u güncelle. Bu kodun hiçbir yerinde bekleme yoktur; koşul sağlanmıyorsa `loop()` hemen başa döner.\n\n### Neden bloklamaz?\n`loop()` bu kalıpla saniyede binlerce kez döner. Her turda butona da bakılır, saate de. Önceki dersteki 2000 ms'lik bakış aralığı artık birkaç yüz mikrosaniyedir; kısa basışlar kaçmaz.\n\n### Her işe kendi saati\nİki LED farklı hızlarda yanıp sönecekse her birine ayrı değişken ver:\n\n```\nunsigned long son1 = 0;   // LED 1 için, aralık 1000 ms\nunsigned long son2 = 0;   // LED 2 için, aralık 300 ms\n```\n\nOrtak bir `son` kullanırsan ilk iş değişkeni güncelleyince ikinci iş kendi zamanını yanlış hesaplar. Küçük bir yapılacaklar tablosu işi netleştirir:\n\n| İş | Aralık | Değişken |\n|---|---|---|\n| LED 1 değiştir | 1000 ms | `son1` |\n| LED 2 değiştir | 300 ms | `son2` |\n| Butona bak | her tur | (saat gerekmez) |\n\n### Taşma: sayaç sıfıra dönünce\n`millis()` değeri **`unsigned long`** tipindedir (en büyük değer 4 294 967 295). Bu sayıya yaklaşık 49,7 günde ulaşır ve 0'a döner. `int` kullanırsan Uno'da en büyük değer 32 767 olduğundan yaklaşık 32,8 saniyede taşar. Süre tutan değişkenler hep `unsigned long` olmalıdır.\n\nGüvenli kalıp **çıkarmadır**: `simdi - son >= aralik`. İşaretsiz sayılarda çıkarma, sayaç sıfıra dönse bile doğru farkı verir. Örneğin `son = 4 294 967 000` iken sayaç dönüp `simdi = 10` olsa fark 306 ms çıkar. `simdi >= son + aralik` ise yanlıştır: `son + aralik` taşıp küçük bir sayıya döner ve program süre dolmadan \"doldu\" der.\n\n### Özet\n`millis()` kartın saatidir. `simdi - son >= aralik` kalıbı beklemeden \"süre doldu mu?\" sorusunu sorar; `loop()` hızlı döner ve her iş kendi `son` değişkeniyle bağımsız çalışır. Süre değişkenleri `unsigned long` olmalı ve fark çıkarmayla hesaplanmalıdır; böylece 49,7 günlük taşma sorun çıkarmaz.",
          "concepts": [
            {
              "term": "millis()",
              "definition": "Kart çalışmaya başladığından beri geçen süreyi milisaniye olarak veren fonksiyon. Her milisaniyede 1 artar.",
              "example": "Kart açıldıktan 3 saniye sonra millis() yaklaşık 3000 verir.",
              "pitfall": "millis()'in saati göstermesini beklemek; yalnızca açılıştan itibaren geçen süreyi verir."
            },
            {
              "term": "Süre doldu mu kalıbı",
              "definition": "simdi - son >= aralik ifadesi: son işten bu yana yeterli süre geçtiyse işi yap ve son'u güncelle.",
              "example": "if (simdi - son >= 500) { son = simdi; digitalWrite(13, !digitalRead(13)); }",
              "pitfall": "if içinde son = simdi satırını unutmak: koşul bir kez doğru olunca hep doğru kalır ve iş her turda yapılır."
            },
            {
              "term": "Her işe ayrı saat",
              "definition": "Birden çok iş için her birine kendi son-zaman değişkenini vermek.",
              "example": "LED 1 için son1, LED 2 için son2 kullanılır; biri güncellenince diğerinin zamanı bozulmaz.",
              "pitfall": "Tüm işlere tek ortak son değişkeni vermek: işler birbirinin zamanını sıfırlar."
            },
            {
              "term": "unsigned long",
              "definition": "Eksi değer tutmayan 32 bitlik tam sayı tipi (0 ile 4 294 967 295). millis() değeri bu tiptedir.",
              "example": "unsigned long simdi = millis();",
              "pitfall": "millis() değerini int içine koymak: int yaklaşık 32,8 saniyede taşar."
            },
            {
              "term": "Taşma (rollover)",
              "definition": "Bir sayaç en büyük değerine ulaşınca 0'a dönmesi. millis() için yaklaşık 49,7 günde olur.",
              "example": "simdi = 10 iken son = 4 294 967 000 ise çıkarma 306 ms verir; yanlış yapılmaz.",
              "pitfall": "Süreyi toplamayla kontrol etmek (simdi >= son + aralik): taşma anında yanlış sonuç verir."
            }
          ],
          "quiz": [
            {
              "id": "m3h6d27-q1",
              "kind": "mcq",
              "prompt": "millis() fonksiyonu ne döndürür?",
              "options": [
                "Saatin o anki saat ve dakikasını",
                "loop()'un kaç kez döndüğünü",
                "Son delay()'in süresini",
                "Kart çalışmaya başladığından beri geçen milisaniyeyi"
              ],
              "answer": 3,
              "explanation": "millis() açılıştan itibaren geçen milisaniyedir, gerçek saati bilmez. Son delay süresiyle ya da tur sayısıyla ilgisi yoktur.",
              "skills": [
                "prog-millis"
              ]
            },
            {
              "id": "m3h6d27-q2",
              "kind": "numeric",
              "prompt": "millis() değeri unsigned long tipinde (en fazla 4 294 967 295) ve her milisaniyede 1 artıyor. Sayaç kaç günde sıfıra döner? (Bir gün 86 400 000 ms. Bir ondalık basamağa yuvarla.)",
              "answer": 49.7,
              "tolerance": 0.1,
              "unit": "gün",
              "explanation": "2^32 = 4 294 967 296 ms. Bunu 86 400 000'e bölünce yaklaşık 49,71 gün çıkar. 49,7 gün civarında taşma olur.",
              "skills": [
                "prog-millis",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d27-q3",
              "kind": "numeric",
              "prompt": "Bir arkadaşın süreyi int tipinde tutuyor: int simdi = millis(); Uno'da int 16 bittir ve en fazla 32 767 değerini tutar. Program çalışmaya başladıktan yaklaşık kaç saniye sonra bu değişken taşar? (Bir ondalık basamağa yuvarla.)",
              "answer": 32.8,
              "tolerance": 0.1,
              "unit": "s",
              "explanation": "32 767 ms = 32,767 s, yani yaklaşık 32,8 saniye. Bu yüzden süre değişkenleri int değil unsigned long olmalıdır.",
              "skills": [
                "prog-millis",
                "prog-debug"
              ]
            },
            {
              "id": "m3h6d27-q4",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca Seri monitörde ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  unsigned long onceki = 4294967000UL;\n  unsigned long simdi = 100;\n  Serial.println(simdi - onceki);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "396",
                "-4294966900",
                "100",
                "Derleme hatası verir"
              ],
              "answer": 0,
              "explanation": "Sayaç 4 294 967 000'den dönüp 100 olmuş. Kalan 296 ms (sınıra kadar) + 100 ms = 396. İşaretsiz çıkarma bu farkı doğru verir; eksi sayı oluşmaz çünkü unsigned long eksi tutmaz.",
              "skills": [
                "prog-millis",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d27-q5",
              "kind": "find-bug",
              "prompt": "Bu program LED'i yarım saniyede bir değiştiriyor. Ama kart yaklaşık 49 gün açık kalınca davranış bir süre bozuluyor. Hataya neden olan satır hangisi?\n\n```\nunsigned long onceki = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (simdi >= onceki + 500) {\n    onceki = simdi;\n    digitalWrite(13, !digitalRead(13));\n  }\n}\n```",
              "options": [
                "unsigned long onceki = 0;",
                "unsigned long simdi = millis();",
                "if (simdi >= onceki + 500) {",
                "digitalWrite(13, !digitalRead(13));"
              ],
              "answer": 2,
              "explanation": "Toplamayla kontrol taşma anında bozulur: onceki + 500 sınırı aşıp küçük bir sayıya döner ve koşul süre dolmadan doğru olur. Doğrusu simdi - onceki >= 500 yazmaktır. Değişken tipleri doğrudur, ve LED'i tersleyen satır da sorunsuzdur.",
              "skills": [
                "prog-millis",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Durum makineleri (FSM)",
          "durationMin": 25,
          "problem": "Asansör \"kapı açık\", \"yukarı çıkıyor\", \"bekliyor\" gibi belirli hâllerden yalnızca birinde olur. Bir hâlden ötekine ancak belli olaylarla geçer. Programlarını da böyle düzenlersen karışık `if` yığınları yerine okunaklı bir yapı elde edersin. Buna **durum makinesi** (FSM, finite state machine) denir.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| LED 1 (kırmızı) + 330 Ω | **D13** |\n| LED 2 (sarı) + 330 Ω | **D12** |\n| LED 3 (yeşil) + 330 Ω | **D11** |\n| Buton | **A** ucu **D2**, **B** ucu GND (`INPUT_PULLUP`) |\n\nHer LED'in **A** ucu direncine, **K** ucu GND'ye gider.\n\n### Program 1: Butonla mod değiştiren LED\nÜç mod var: **KAPALI**, **YAVAS** (1000 ms'de bir değişir), **HIZLI** (250 ms'de bir değişir). Butona her basışta bir sonraki moda geçilir. `enum`, sayılara isim verir: KAPALI = 0, YAVAS = 1, HIZLI = 2.\n\n```cpp\n// sketch: fsm_mod\nenum Mod { KAPALI, YAVAS, HIZLI };\nMod mod = KAPALI;\n\nunsigned long sonDegisim = 0;\nbool ledYanik = false;\nbool oncekiBasili = false;\n\nvoid yanipSon(unsigned long aralik) {\n  unsigned long simdi = millis();\n  if (simdi - sonDegisim >= aralik) {\n    sonDegisim = simdi;\n    ledYanik = !ledYanik;\n    digitalWrite(13, ledYanik);\n  }\n}\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n}\n\nvoid loop() {\n  bool basili = (digitalRead(2) == LOW);\n  if (basili && !oncekiBasili) {              // yeni basış: sonraki moda geç\n    mod = (Mod)((mod + 1) % 3);\n    sonDegisim = millis();\n    ledYanik = false;\n    digitalWrite(13, LOW);\n  }\n  oncekiBasili = basili;\n\n  switch (mod) {\n    case KAPALI:\n      digitalWrite(13, LOW);\n      break;\n    case YAVAS:\n      yanipSon(1000);\n      break;\n    case HIZLI:\n      yanipSon(250);\n      break;\n  }\n}\n```\n\n### Program 2: Zamanlı trafik ışığı\nBurada durumlar butonla değil **zamanla** değişir. Her durumun bir süresi vardır: KIRMIZI 3 sn, YESIL 3 sn, SARI 1 sn, sonra tekrar KIRMIZI.\n\n```cpp\n// sketch: fsm_trafik\nenum Durum { KIRMIZI, YESIL, SARI };\nDurum durum = KIRMIZI;\nunsigned long durumBasi = 0;\n\nvoid setup() {\n  pinMode(13, OUTPUT);   // kırmızı\n  pinMode(12, OUTPUT);   // sarı\n  pinMode(11, OUTPUT);   // yeşil\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  switch (durum) {\n    case KIRMIZI:\n      digitalWrite(13, HIGH); digitalWrite(12, LOW); digitalWrite(11, LOW);\n      if (simdi - durumBasi >= 3000) { durum = YESIL; durumBasi = simdi; }\n      break;\n    case YESIL:\n      digitalWrite(13, LOW); digitalWrite(12, LOW); digitalWrite(11, HIGH);\n      if (simdi - durumBasi >= 3000) { durum = SARI; durumBasi = simdi; }\n      break;\n    case SARI:\n      digitalWrite(13, LOW); digitalWrite(12, HIGH); digitalWrite(11, LOW);\n      if (simdi - durumBasi >= 1000) { durum = KIRMIZI; durumBasi = simdi; }\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Bir değişken (`mod`, `durum`) programın **şu an hangi hâlde** olduğunu tutar.\n2. `switch`, `loop()` her döndüğünde yalnızca o hâlin kodunu çalıştırır.\n3. Hâl değişimi, o hâlin içinde yazılır: bir olay (buton) ya da süre dolması.\n4. Hâl değişirken zaman sayacını (`durumBasi`) yeniden başlatmayı unutma.\n5. Hiçbir yerde `delay` yok; bu yüzden program butona ve zamana aynı anda bakabilir.\n\nBir FSM çizerken önce hâlleri daire, geçişleri ok olarak bir taslağa (not defterine ya da tahtaya) çiz. Sonra kodu çizime bakarak yaz.\n\n### Dene\n- `fsm_mod` programına dördüncü bir mod ekle: KAPALI → YAVAS → HIZLI → SABIT (LED sürekli yanık). `% 3` ifadesini de güncellemeyi unutma.\n- `fsm_trafik` programına \"yaya düğmesi\" ekle: D2'ye basılınca YESIL durumu hemen SARI'ya geçsin.\n- Kırmızıdan önce kırmızı+sarı birlikte yansın (gerçek trafik ışığı gibi). Bunun için yeni bir durum gerekir mi?\n\n### Sık yapılan hatalar\n- `case` sonuna `break;` koymamak: program bir sonraki durumun kodunu da çalıştırır.\n- Durum değişince `durumBasi = simdi;` yazmamak: yeni durum hemen biter.\n- Butonun \"basılı\" olduğu her turda geçiş yapmak: basış bir kez sayılsın diye kenar algılama (`basili && !oncekiBasili`) kullan.\n- `enum` isimlerini ve sayı kullanımını karıştırmak: durumlara hep isimle başvur.",
          "question": "Ev aletlerinden (çamaşır makinesi, mikrodalga fırın) birini seç. Hangi hâllerde olabilir, hâller arasında hangi olaylar geçiş yaptırır? Bunu bir şema olarak çizebilir misin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir programı **durumlar** (hâller) ve **geçişler** olarak düşünmeyi\n- `enum` ile durumlara isim vermeyi ve `switch` ile o duruma ait kodu çalıştırmayı\n- Geçişi bir olaya (buton) ya da süre dolmasına (`millis`) bağlamayı\n- Durum değişince zaman sayacını yeniden başlatmayı\n\n### Önceden bilmen gerekenler\nDers 7'de `if` ve `switch`; ders 8'de basışın kenarını algılama; ders 27'de `millis()` ve `simdi - son >= aralik` kalıbı.\n\n### Neden durum makinesi?\nBir asansör aynı anda \"kapı açık\" ve \"yukarı çıkıyor\" olamaz; her an belli bir hâldedir. Programı da böyle düzenlersen kodun okunur kalır. **Durum makinesi** (FSM), programın şu an hangi **durumda** olduğunu bir değişkende tutar ve durumlar arasındaki **geçişleri** tanımlar. Karışık `if` yığınlarının yerini düzen alır.\n\n### Önce çiz, sonra yaz\nTrafik ışığı için üç durum vardır. Önce şemayı kâğıda çiz:\n\n```\n[KIRMIZI] --3 sn dolunca--> [YESIL] --3 sn dolunca--> [SARI]\n    ^                                                     |\n    +------------------1 sn dolunca-----------------------+\n```\n\nHer kutu bir durum, her ok bir geçiştir. Okun üzerindeki yazı geçişi tetikleyen **olaydır**: bir buton basışı ya da bir sürenin dolması. Kod çizimin birebir çevirisidir.\n\n### enum ve switch\n**`enum`**, sayılara isim verir: `enum Durum { KIRMIZI, YESIL, SARI };` yazınca KIRMIZI = 0, YESIL = 1, SARI = 2 olur. Kodda `durum = YESIL;` yazmak, `durum = 1;` yazmaktan çok daha okunaklıdır.\n\n`switch (durum)`, her turda yalnızca geçerli durumun `case` bloğunu çalıştırır. Her blok üç iş yapar:\n1. Çıkışları o duruma göre ayarlar (hangi LED yansın).\n2. Geçiş koşuluna bakar (süre doldu mu, düğmeye basıldı mı).\n3. Koşul sağlanırsa yeni durumu yazar ve zaman sayacını yeniler.\n\n```\ncase KIRMIZI:\n  digitalWrite(13, HIGH);\n  if (simdi - durumBasi >= 3000) { durum = YESIL; durumBasi = simdi; }\n  break;\n```\n\nBloğun sonundaki **`break;`** şarttır. Unutursan program aşağıdaki durumun kodunu da çalıştırır (buna \"düşme\" denir).\n\n### Zamanla ve olayla geçiş\nGeçiş iki biçimde olabilir. Zamanla geçişte `simdi - durumBasi >= süre` sorulur; durum değişirken `durumBasi = simdi;` yazılmazsa yeni durum hemen biter, çünkü fark hâlâ eski değerdedir. Olayla geçişte buton **kenarı** (yeni basış) aranır; yoksa basılı tutulan buton her turda bir sonraki duruma atlatır. Mod döngüsü için `(mod + 1) % 3` ifadesi 0, 1, 2, 0, 1... sırasını üretir.\n\n### Özet\nDurum makinesi, programın hangi hâlde olduğunu bir `enum` değişkeninde tutar ve `switch` ile o hâle ait kodu çalıştırır. Geçişler zamana (`millis`) ya da olaya (buton kenarı) bağlanır; durum değişince zaman sayacı yenilenir ve her `case` `break;` ile biter. Önce şema çiz, sonra kodla.",
          "concepts": [
            {
              "term": "Durum (state)",
              "definition": "Programın o an içinde bulunduğu hâl. Bir değişkende tutulur ve her an yalnızca biri geçerlidir.",
              "example": "Trafik ışığı programında KIRMIZI, YESIL ve SARI üç durumdur.",
              "pitfall": "Birden çok durum değişkenini birbirinden bağımsız sanmak ve aynı anda iki hâlde olmaya izin vermek."
            },
            {
              "term": "Geçiş (transition)",
              "definition": "Bir durumdan ötekine geçmeyi tetikleyen koşul: bir olay ya da süre dolması.",
              "example": "KIRMIZI durumunda 3000 ms dolunca YESIL'e geçilir.",
              "pitfall": "Geçişte yeni durumun zaman sayacını (durumBasi = simdi) yenilememek; yeni durum hemen biter."
            },
            {
              "term": "enum",
              "definition": "Sayılara anlamlı isimler veren tür. İlk ada 0 verir, sonrakilere birer artırarak devam eder.",
              "example": "enum Mod { KAPALI, YAVAS, HIZLI }; yazınca KAPALI = 0, YAVAS = 1, HIZLI = 2 olur.",
              "pitfall": "İsim yerine ham sayı yazıp kodun anlamını gizlemek (durum = 2;)."
            },
            {
              "term": "switch / case / break",
              "definition": "Bir değişkenin değerine göre yalnızca ilgili case bloğunu çalıştıran yapı. Her blok break; ile biter.",
              "example": "switch (durum) { case YESIL: ...; break; }",
              "pitfall": "break; unutmak: program bir sonraki case'in kodunu da çalıştırır (düşme)."
            },
            {
              "term": "Kenar algılama",
              "definition": "Butonun \"basılı olmasına\" değil, basılı olmaya yeni geçmesine bakmak. Önceki durumu bir değişkende tutarak yapılır.",
              "example": "if (basili && !oncekiBasili) { ... } kodu bir basışı yalnızca bir kez sayar.",
              "pitfall": "Yalnızca basili koşuluyla geçiş yapmak: basılı tutulan buton her turda moda atlatır."
            }
          ],
          "quiz": [
            {
              "id": "m3h6d28-q1",
              "kind": "mcq",
              "prompt": "Bir durum makinesi programında durum değişkeninin işi nedir?",
              "options": [
                "Programın şu an hangi hâlde olduğunu tutar",
                "Kartın hangi pine bağlı olduğunu tutar",
                "Geçen süreyi milisaniye olarak tutar",
                "Butonun kaç kez basıldığını tutar"
              ],
              "answer": 0,
              "explanation": "Durum değişkeni (örneğin durum ya da mod) o anki hâli tutar; switch bu değere bakarak hangi blokun çalışacağına karar verir. Geçen süre ayrı bir değişkende (durumBasi), basış sayısı ise başka bir sayaçta tutulur.",
              "skills": [
                "prog-fsm"
              ]
            },
            {
              "id": "m3h6d28-q2",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca Seri monitörde ne yazar?\n\n```\nenum Mod { KAPALI, YAVAS, HIZLI };\n\nvoid setup() {\n  Serial.begin(9600);\n  int mod = KAPALI;\n  for (int i = 0; i < 4; i++) {\n    mod = (mod + 1) % 3;\n  }\n  Serial.println(mod);\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "0",
                "1",
                "2",
                "3"
              ],
              "answer": 1,
              "explanation": "Mod 0'dan başlar; her adımda 1, 2, 0, 1 olur. 4 basıştan sonra 1 (YAVAS) kalır. % 3 işlemi sonucu hiçbir zaman 3 olmasına izin vermez; 3'e ulaşınca 0'a döner.",
              "skills": [
                "prog-fsm",
                "prog-debug"
              ]
            },
            {
              "id": "m3h6d28-q3",
              "kind": "numeric",
              "prompt": "Bir trafik ışığı programı döngüde şu süreleri kullanıyor: KIRMIZI 5000 ms, YESIL 4000 ms, SARI 1500 ms, sonra yine KIRMIZI. Bir kırmızı başladıktan sonra bir sonraki kırmızının başlamasına kadar kaç milisaniye geçer?",
              "answer": 10500,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Üç durumun süreleri toplanır: 5000 + 4000 + 1500 = 10 500 ms. Döngü tamamlanınca kırmızıya dönülür.",
              "skills": [
                "prog-fsm",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d28-q4",
              "kind": "find-bug",
              "prompt": "İki durumlu bu programda kırmızı aşamada kırmızı LED beklenen gibi sürekli yanmıyor; D13 ile D11 birlikte titreşiyor. Hata nerede?\n\n```\nswitch (durum) {\n  case KIRMIZI:\n    digitalWrite(13, HIGH);\n    digitalWrite(11, LOW);\n    if (simdi - durumBasi >= 3000) { durum = YESIL; durumBasi = simdi; }\n  case YESIL:\n    digitalWrite(13, LOW);\n    digitalWrite(11, HIGH);\n    if (simdi - durumBasi >= 3000) { durum = KIRMIZI; durumBasi = simdi; }\n    break;\n}\n```",
              "options": [
                "durumBasi = simdi; yazılmamalı",
                "digitalWrite(11, LOW); satırı gereksiz",
                "KIRMIZI bloğunun sonunda break; yok",
                "case YESIL: sözcüğü yanlış yazılmış"
              ],
              "answer": 2,
              "explanation": "KIRMIZI bloğu break; ile bitmediği için program YESIL bloğuna düşer ve aynı turda kırmızıyı söndürüp yeşili yakar. Böylece iki LED birlikte titreşir. KIRMIZI bloğunun sonuna break; eklemek sorunu çözer. Diğer seçenekler doğru çalışan satırlardır.",
              "skills": [
                "prog-fsm",
                "prog-debug"
              ]
            },
            {
              "id": "m3h6d28-q5",
              "kind": "mcq",
              "prompt": "Bir durum makinesinde yeni duruma geçerken durumBasi = simdi; satırı yazılmazsa ne olur?",
              "options": [
                "Derleyici hata verir",
                "LED'ler söner ve yeniden yanmaz",
                "Program eski duruma geri döner ve hiç ilerlemez",
                "Yeni durumun süresi hesaplanırken eski sayaç kullanılır ve durum hemen bitebilir"
              ],
              "answer": 3,
              "explanation": "simdi - durumBasi hâlâ eski durumun başlangıcından hesaplanır; fark zaten büyük olduğundan yeni durum bir tur sonra bitebilir. Derleme hatası olmaz, program geri de dönmez; yalnızca süreler yanlış çalışır.",
              "skills": [
                "prog-fsm",
                "prog-millis"
              ]
            }
          ]
        },
        {
          "title": "Kesmeler ve timer'lar",
          "durationMin": 30,
          "problem": "Telefon çalınca ne yaparsın? Ne yapıyor olursan ol, işi bırakıp açarsın, konuşur, sonra kaldığın yerden devam edersin. Arduino da bunu yapabilir: bir pinde olay olunca çalışan kodu **hemen** durdurur, küçük bir \"kesme\" fonksiyonunu çalıştırır, sonra ana programa döner. `delay` içinde bile!",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Buton | **A** ucu **D2**, **B** ucu GND (`INPUT_PULLUP`) |\n| LED + 330 Ω direnç | **D13** → direnç → LED **A**; **K** → GND |\n\nArduino Uno'da yalnızca iki pin dış kesme alabilir: **D2 (INT0)** ve **D3 (INT1)**. Bu yüzden butonlarımız bu pinlerde.\n\n### Program 1: Delay içinde bile basış sayan kesme\n```cpp\n// sketch: kesme_sayac\nvolatile unsigned int basisSayisi = 0;\nvolatile unsigned long sonKesme = 0;\n\nvoid basildi() {                              // ISR: kesme servis rutini\n  unsigned long simdi = millis();\n  if (simdi - sonKesme > 50) {                // 50 ms'den sık gelen sıçramaları yok say\n    basisSayisi++;\n    sonKesme = simdi;\n  }\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(2, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);\n}\n\nvoid loop() {\n  delay(1000);                                // ana program \"uyuyor\"\n\n  noInterrupts();                             // okurken kesme araya girmesin\n  unsigned int kopya = basisSayisi;\n  interrupts();\n\n  Serial.print(\"Basis: \");\n  Serial.println(kopya);\n}\n```\nBu programda `loop()` neredeyse hep `delay(1000)` içindedir; ama butona basıldığında `basildi()` yine de çalışır ve sayaç artar. 26. dersteki kaçırma sorunu yok.\n\n### Program 2: Kısa ISR, işi loop yapsın\nEn iyi yöntem, ISR içinde yalnızca bir bayrak kaldırmak ve asıl işi `loop()`'a bırakmaktır:\n\n```cpp\n// sketch: kesme_bayrak\nvolatile bool basisVar = false;\n\nvoid basildi() {\n  basisVar = true;                            // yalnızca bayrağı kaldır\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(2, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);\n}\n\nvoid loop() {\n  if (basisVar) {\n    basisVar = false;\n    Serial.println(\"Kesme geldi\");            // yazdırma işi burada, ISR'de değil\n  }\n}\n```\n\n### Program 3: Timer kesmesi ile tam 1 Hz\nKartın içindeki Timer1, `delay` ve `millis` kullanmadan düzenli aralıklarla kesme üretebilir. Aşağıdaki kod ileri düzeydir; şimdilik mantığını anlaman yeterli.\n\n```cpp\n// sketch: timer1_led\nISR(TIMER1_COMPA_vect) {                      // Timer1 eşleşme kesmesi\n  digitalWrite(13, !digitalRead(13));\n}\n\nvoid setup() {\n  pinMode(13, OUTPUT);\n  noInterrupts();\n  TCCR1A = 0;\n  TCCR1B = 0;\n  TCNT1 = 0;\n  OCR1A = 31249;                              // 16 MHz / 256 = 62 500 tik/sn; 31 250 tik = 0,5 sn\n  TCCR1B |= (1 << WGM12);                     // CTC modu: eşleşince sayaç sıfırlanır\n  TCCR1B |= (1 << CS12);                      // bölücü 256\n  TIMSK1 |= (1 << OCIE1A);                    // eşleşme kesmesini aç\n  interrupts();\n}\n\nvoid loop() {\n  // ana program burada başka işler yapabilir\n}\n```\nLED her 0,5 saniyede değişir, yani 1 Hz yanıp söner. Timer1 pin 9 ve 10'daki `analogWrite` ile `Servo` kütüphanesinin de kullandığı bir birimdir; onlarla birlikte kullanırsan çakışır.\n\n### Nasıl çalışıyor?\n1. `attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING)`: D2 pinine bir olayda `basildi` fonksiyonunu çalıştır demektir. Modlar: `FALLING` (HIGH→LOW, buton basışı), `RISING` (LOW→HIGH), `CHANGE` (her ikisi), `LOW`.\n2. `digitalPinToInterrupt(2)` pin numarasını kesme numarasına çevirir; kendin sayı yazma.\n3. ISR içinde ve ana program arasında paylaşılan değişkenler `volatile` olmalıdır. Bu, derleyiciye \"bu değer program akışı dışında değişebilir, her seferinde belleğe bak\" der. Yazmazsan derleyici değeri saklayıp güncel olmayan kopyayı kullanabilir.\n4. `unsigned int` 2 bayttır ve işlemci 8 bit olduğu için iki adımda okunur. Okurken kesme gelirse yarım yamalak değer okunur. Bu yüzden `noInterrupts()` / `interrupts()` arasında kopya al.\n\n### ISR kuralları\n- **Kısa ol.** Birkaç satır; sayaç artır, bayrak kaldır.\n- **`delay()` kullanma.** ISR içinde `delay` çalışmaz, program takılabilir.\n- **`Serial.print` kullanma.** Yavaştır ve çıkış tamponu dolarsa program takılabilir. Yazdırmayı `loop()`'ta yap.\n- **`millis()` ISR içinde ilerlemez.** Okuyabilirsin ama değeri ISR boyunca sabittir.\n- Paylaşılan değişkeni `volatile` yap; birden fazla bayt ise okurken kesmeleri kapat.\n- Buton sıçraması (bounce) kesmeyi birkaç kez tetikleyebilir; 1. programdaki gibi 50 ms'lik bir koruma ekle.\n\n### Dene\n- `kesme_sayac` programında `FALLING` yerine `CHANGE` yap. Bir basış sayaca kaç ekliyor? Neden?\n- `kesme_bayrak` programında ISR'nin içine `Serial.println` koymak neden önerilmez? Kendi cümlelerinle anlat.\n- Timer programında `OCR1A` değerini 15624 yap. LED hızı nasıl değişir? Hesapla ve doğrula.\n\n### Sık yapılan hatalar\n- `volatile` yazmamak: sayaç ana programda artmıyor gibi görünebilir.\n- ISR'nin içine `delay` ya da `Serial.print` koymak.\n- Kesme için D2 ya da D3 dışında bir pin kullanmak (Uno'da `attachInterrupt` yalnızca bu iki pinde çalışır).\n- ISR'ye parametre vermeye çalışmak: ISR parametre almaz ve değer döndürmez.",
          "question": "Kesme kullanmak her zaman `millis`'ten iyi midir? Hangi durumda (hızlı bir olayı kaçırmamak gerekirse) kesme, hangi durumda `millis` yeterli olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **Kesme** (interrupt) fikrini: bir olay olunca ana programı durdurup küçük bir fonksiyonu çalıştırmayı\n- `attachInterrupt` ile D2 ve D3'te kesme kurmayı ve `FALLING`, `RISING`, `CHANGE` modlarını\n- `volatile` değişkenin ve kısa kesme fonksiyonunun (ISR) neden gerektiğini\n- Timer'ın `millis` ve `delay` kullanmadan düzenli kesme üretebildiğini ve süresini hesaplamayı\n\n### Önceden bilmen gerekenler\nDers 26'da `delay` içinde kaçan basışlar; ders 27'de `millis()`; ders 8'de buton titremesi (bounce); ders 19'da fonksiyon tanımlama.\n\n### Telefon çalınca\nNe yaparsan yap telefon çalınca işi bırakıp açarsın, konuşursun, sonra kaldığın yerden devam edersin. **Kesme**, bunun karşılığıdır. Belirlenen bir pinde olay olunca işlemci o anki işi durdurur, **ISR** (kesme servis rutini) denen küçük bir fonksiyonu çalıştırır ve ana programa geri döner. `delay` içinde bile çalışır; bu yüzden kısa bir olayı kaçırma riskin neredeyse yoktur.\n\n### Uno'da hangi pinler?\nUno'da dış kesme yalnızca iki pindedir:\n\n| Pin | Kesme |\n|---|---|\n| D2 | INT0 |\n| D3 | INT1 |\n\nKurulum: `attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);` Mod olayın türünü belirler: `FALLING` HIGH'dan LOW'a düşme (INPUT_PULLUP'ta butona basış), `RISING` LOW'dan HIGH'a çıkış (bırakış), `CHANGE` ikisi birden. Bir basış ve bırakış `CHANGE` ile iki kesme üretir.\n\n### ISR kuralları\n- **Kısa ol.** Sayaç artır ya da bayrak kaldır; asıl işi `loop()` yapsın.\n- **`delay()` ve `Serial.print` kullanma.** ISR içinde zaman akmaz ve yazma tamponu dolarsa program takılır.\n- **Parametre alma, değer döndürme.** ISR `void` bir fonksiyondur ve argümansızdır.\n- **Buton sıçramasına karşı** birkaç on milisaniyelik koruma ekle.\n\n### volatile ve atomik okuma\nISR ile `loop()` arasında paylaşılan değişkene **`volatile`** yazılır. Derleyiciye \"bu değer program akışı dışında değişebilir, her seferinde belleğe bak\" der. Yazmazsan `loop()` eski bir kopyayı kullanabilir ve sayaç hiç artmıyor gibi görünür. Uno 8 bitlik bir işlemcidir; 2 bayt ya da 4 baytlık değişken iki-dört adımda okunur. Tam ortasında kesme gelirse yarım değer okursun. Bu yüzden `noInterrupts();` ile kopya alıp `interrupts();` ile geri aç.\n\n### Timer: düzenli kesme\nKartın içindeki **Timer1**, 16 MHz saati bölerek sayar. Bölücü 256 ise saniyede 16 000 000 / 256 = 62 500 tik olur. Karşılaştırma değeri `OCR1A` N+1 tik sayınca kesme gelir:\n\n```\nkesme aralığı = (OCR1A + 1) / 62 500 saniye   (bölücü 256)\n```\n\n`OCR1A = 31249` için 31 250 / 62 500 = 0,5 s. Timer1, pin 9-10'daki `analogWrite` ve `Servo` ile aynı birimi kullanır; birlikte kullanılırsa çakışırlar.\n\n### Özet\nKesme, olay olunca ana programı durdurup kısa bir ISR çalıştıran düzenektir. Uno'da D2 ve D3 pinlerinde `attachInterrupt` ile kurulur. ISR kısa olmalı; paylaşılan değişken `volatile` olmalı, çok baytlıysa okurken kesmeler kapatılmalıdır. Timer kesmesinde aralık `(OCR1A + 1) / tik hızı` ile hesaplanır.",
          "concepts": [
            {
              "term": "Kesme (interrupt)",
              "definition": "Bir olay olunca işlemcinin o anki işi bırakıp ilgili fonksiyonu çalıştırması, sonra kaldığı yere dönmesi.",
              "example": "Buton D2'de LOW'a düşünce basildi() fonksiyonu loop() ne yapıyor olursa olsun çalışır.",
              "pitfall": "Kesmeyi her işin çözümü sanmak; ISR içinde uzun iş yapılamaz."
            },
            {
              "term": "ISR",
              "definition": "Kesme servis rutini: kesme gelince çalışan, parametresiz ve değer döndürmeyen kısa fonksiyon.",
              "example": "void basildi() { sayac++; } fonksiyonu bir ISR'dir.",
              "pitfall": "ISR içine delay ya da Serial.print koymak; program takılabilir."
            },
            {
              "term": "volatile",
              "definition": "Bir değişkenin program akışı dışında (ISR'de) değişebileceğini derleyiciye bildiren sözcük.",
              "example": "volatile unsigned int sayac = 0;",
              "pitfall": "volatile yazmamak: loop() değeri eski kopyadan okuyabilir ve sayaç artmıyor gibi görünür."
            },
            {
              "term": "Kesme modları",
              "definition": "attachInterrupt'ın hangi olayda tetikleneceğini belirleyen ayar: FALLING, RISING, CHANGE, LOW.",
              "example": "INPUT_PULLUP butonuna basışı yakalamak için FALLING kullanılır.",
              "pitfall": "CHANGE seçip bir basışı bir kesme sanmak; basış ve bırakış iki kesme üretir."
            },
            {
              "term": "Timer kesmesi",
              "definition": "Kartın saat birimi sayaçlarından birinin belirlenen değere ulaşınca ürettiği düzenli kesme.",
              "example": "Bölücü 256, OCR1A = 31249 için kesme her 0,5 saniyede gelir.",
              "pitfall": "Timer1'i Servo ya da pin 9-10'daki analogWrite ile birlikte kullanmak: aynı birim çakışır."
            }
          ],
          "quiz": [
            {
              "id": "m3h6d29-q1",
              "kind": "mcq",
              "prompt": "Arduino Uno'da attachInterrupt ile dış kesme alabilen pinler hangileridir?",
              "options": [
                "D0 ve D1",
                "Tüm dijital pinler",
                "D8 ve D9",
                "D2 ve D3"
              ],
              "answer": 3,
              "explanation": "Uno'da dış kesme yalnızca INT0 (D2) ve INT1 (D3) pinlerindedir. D0 ve D1 seri haberleşme içindir; D8-D9 ya da diğer pinlerde bu kesme yoktur.",
              "skills": [
                "prog-interrupts"
              ]
            },
            {
              "id": "m3h6d29-q2",
              "kind": "numeric",
              "prompt": "Timer1 bölücü 256 ile çalışıyor (16 MHz / 256 = 62 500 tik/sn) ve OCR1A = 6249 yazılmış. Kesme kaç milisaniyede bir gelir?",
              "answer": 100,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Sayılan tik sayısı OCR1A + 1 = 6250. 6250 / 62 500 = 0,1 s = 100 ms. +1'i unutup 6249 / 62 500 hesaplarsan 99,98 ms bulursun; doğru formül (OCR1A + 1) kullanır.",
              "skills": [
                "prog-interrupts",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d29-q3",
              "kind": "find-bug",
              "prompt": "Buton D4 ile GND arasına bağlı. Butona basınca sayaç hiç artmıyor. Programdaki hatanın nedeni nedir?\n\n```\nvolatile unsigned int basis = 0;\n\nvoid say() {\n  basis++;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(4, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(4), say, FALLING);\n}\n\nvoid loop() {\n  Serial.println(basis);\n  delay(500);\n}\n```",
              "options": [
                "Uno'da D4 bir dış kesme pini değil; kesme D2 ya da D3'te kurulmalı",
                "say() fonksiyonu volatile olmalı",
                "FALLING yerine HIGH yazılmalı",
                "basis değişkeni unsigned olmamalı"
              ],
              "answer": 0,
              "explanation": "Uno'da dış kesme yalnızca D2 (INT0) ve D3 (INT1) pinlerinde vardır; digitalPinToInterrupt(4) geçerli bir kesme numarası vermez, bu yüzden attachInterrupt hiçbir şey kurmaz. Buton D2'ye taşınmalı. say() bir ISR'dir, volatile değişkenler için yazılır; FALLING doğru moddur; unsigned olması sorun değildir.",
              "skills": [
                "prog-interrupts",
                "prog-debug"
              ]
            },
            {
              "id": "m3h6d29-q4",
              "kind": "predict-output",
              "prompt": "İdeal bir butona (sıçrama yok) yalnızca bir kez basılıp bırakılıyor; bu işlem ilk 2 saniye içinde bitiyor. İlk yazdırılan değer nedir?\n\n```\nvolatile int sayac = 0;\n\nvoid kes() {\n  sayac++;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(2, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(2), kes, CHANGE);\n}\n\nvoid loop() {\n  delay(2000);\n  Serial.println(sayac);\n}\n```",
              "options": [
                "0",
                "1",
                "2",
                "Yazmaz, program takılır"
              ],
              "answer": 2,
              "explanation": "CHANGE hem basış (HIGH→LOW) hem bırakış (LOW→HIGH) için kesme üretir; iki kesme sayacı 2 yapar. FALLING seçilseydi sonuç 1 olurdu. Kesme delay içinde bile çalışır, bu yüzden 0 çıkmaz ve program takılmaz.",
              "skills": [
                "prog-interrupts"
              ]
            },
            {
              "id": "m3h6d29-q5",
              "kind": "mcq",
              "prompt": "Bir kesme fonksiyonunun içinde Serial.println kullanmak neden önerilmez?",
              "options": [
                "Serial yalnızca setup() içinde çalışır",
                "Yazdırma yavaştır, tampon dolarsa program takılabilir; ISR kısa olmalıdır",
                "ISR içinde hiçbir değişken kullanılamaz",
                "Seri monitör kesmeleri kapatır"
              ],
              "answer": 1,
              "explanation": "ISR kısa olmalıdır. Serial.println hem yavaştır hem de çıkış tamponu dolarsa bekleyebilir; kesme içinde bu beklemenin işleyeceği kesmeler kapalıdır. Bayrak kaldırıp yazdırmayı loop()'a bırakmak doğrudur. Değişkenler ISR'de kullanılabilir (volatile olmaları gerekir).",
              "skills": [
                "prog-interrupts"
              ]
            }
          ]
        },
        {
          "title": "Proje: Çoklu görev paneli",
          "durationMin": 35,
          "problem": "Bir arabanın panelinde aynı anda gösterge ışığı yanıp söner, sürücü butona basar, gerekirse uyarı sesi çalar. Tek bir işlemci bunların hepsini nasıl aynı anda yapar? Bu projede öğrendiklerinle bunu kuracaksın: `millis`, durum makinesi ve kesme tek bir panelde.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| LED 1 (nabız, yeşil) + 330 Ω | **D13** → direnç → LED **A**; **K** → GND |\n| LED 2 (alarm, kırmızı) + 330 Ω | **D12** → direnç → LED **A**; **K** → GND |\n| Buzzer (pasif; özellik panelinden Tür = Pasif) | **+** ucu **D8**, **-** ucu GND |\n| Buton 1 (MOD) | **A** ucu **D2**, **B** ucu GND (`INPUT_PULLUP`) |\n| Buton 2 (SUSTUR) | **A** ucu **D3**, **B** ucu GND (`INPUT_PULLUP`) |\n\n### Görevler\nPanel üç iş yapar ve hepsi aynı anda sürer:\n1. **Nabız LED'i (D13):** moda göre hızı değişir.\n2. **Mod değişimi (D2, kesme):** her basışta BEKLE → CALISIR → ALARM → BEKLE.\n3. **Zamanlı buzzer (D8):** BEKLE'de sessiz; CALISIR'da her 2 saniyede 0,1 saniyelik tek bip; ALARM'da 0,2 sn çalıp 0,2 sn susan 2 kHz uyarı.\n\n| Mod | D13 LED | D12 LED | Buzzer |\n|---|---|---|---|\n| BEKLE | 1000 ms'de bir değişir (0,5 Hz) | söner | sessiz |\n| CALISIR | 250 ms'de bir değişir (2 Hz) | söner | 2 sn'de bir 100 ms'lik 1 kHz bip |\n| ALARM | 100 ms'de bir değişir (5 Hz) | yanar | 200 ms çalar, 200 ms susar (2 kHz) |\n\nALARM modundan iki yolla çıkılır: SUSTUR butonuna (D3) basarsan ya da 5 saniye geçerse BEKLE'ye dönülür.\n\n### Program\n```cpp\n// sketch: coklu_gorev_paneli\nconst int LED_NABIZ = 13;\nconst int LED_ALARM = 12;\nconst int BUZZER = 8;\nconst int BTN_SUSTUR = 3;\n\nenum Mod { BEKLE, CALISIR, ALARM };\nMod mod = BEKLE;\n\nvolatile bool modIstegi = false;           // ISR ile loop arasında paylaşılır\nvolatile unsigned long sonKesme = 0;\n\nunsigned long ledZaman = 0;\nunsigned long buzzerZaman = 0;\nunsigned long modBasi = 0;\nbool ledYanik = false;\nbool buzzerAcik = false;\n\nvoid modTusu() {                           // ISR: kısa tut\n  unsigned long simdi = millis();\n  if (simdi - sonKesme > 50) {             // sıçrama koruması\n    modIstegi = true;\n    sonKesme = simdi;\n  }\n}\n\nvoid modGec(int yeni) {\n  mod = (Mod)yeni;\n  modBasi = millis();\n  ledZaman = modBasi;\n  buzzerZaman = modBasi;\n  ledYanik = false;\n  buzzerAcik = false;\n  digitalWrite(LED_NABIZ, LOW);\n  noTone(BUZZER);\n}\n\nvoid buzzerYonet(unsigned long simdi, unsigned long acikSure,\n                 unsigned long kapaliSure, int frekans) {\n  if (buzzerAcik) {\n    if (simdi - buzzerZaman >= acikSure) {\n      noTone(BUZZER);\n      buzzerAcik = false;\n      buzzerZaman = simdi;\n    }\n  } else if (simdi - buzzerZaman >= kapaliSure) {\n    tone(BUZZER, frekans);\n    buzzerAcik = true;\n    buzzerZaman = simdi;\n  }\n}\n\nvoid setup() {\n  pinMode(LED_NABIZ, OUTPUT);\n  pinMode(LED_ALARM, OUTPUT);\n  pinMode(BUZZER, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n  pinMode(BTN_SUSTUR, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(2), modTusu, FALLING);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // 1) Mod değişimi (kesmeden gelen istek)\n  if (modIstegi) {\n    modIstegi = false;\n    modGec((mod + 1) % 3);\n  }\n\n  // 2) ALARM'dan çıkış: SUSTUR butonu ya da 5 sn dolması\n  if (mod == ALARM) {\n    if (digitalRead(BTN_SUSTUR) == LOW || simdi - modBasi >= 5000) {\n      modGec(BEKLE);\n    }\n  }\n\n  // 3) Nabız LED'i\n  unsigned long aralik = 1000;\n  if (mod == CALISIR) aralik = 250;\n  if (mod == ALARM) aralik = 100;\n  if (simdi - ledZaman >= aralik) {\n    ledZaman = simdi;\n    ledYanik = !ledYanik;\n    digitalWrite(LED_NABIZ, ledYanik);\n  }\n\n  // 4) Alarm LED'i\n  digitalWrite(LED_ALARM, mod == ALARM ? HIGH : LOW);\n\n  // 5) Zamanlı buzzer\n  switch (mod) {\n    case BEKLE:\n      break;                               // sessiz\n    case CALISIR:\n      buzzerYonet(simdi, 100, 1900, 1000);\n      break;\n    case ALARM:\n      buzzerYonet(simdi, 200, 200, 2000);\n      break;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. **Hiç `delay` yok.** Her görevin kendi zaman değişkeni var (`ledZaman`, `buzzerZaman`, `modBasi`).\n2. **Mod bir durum makinesidir.** `mod` değişkeni hangi hâlde olduğumuzu tutar; geçişler `modGec()` içinde yapılır ve zaman sayaçlarını sıfırlar.\n3. **MOD butonu kesmeyle okunur.** ISR yalnızca bir bayrak kaldırır; asıl iş `loop()`'ta yapılır. Buzzer çalarken ya da LED beklerken bile basış kaçmaz.\n4. **Buzzer da bir küçük durum makinesidir:** \"açık\" ve \"kapalı\" iki hâli var, süreleri ayrı ayrı verilir.\n5. SUSTUR butonu `loop()` içinde `digitalRead` ile okunur. Her tur çok hızlı döndüğü için bu da yeterlidir; iki yöntemi karşılaştır.\n\n### Ek: Kontrol kopunca ne olur?\nHyvex gibi uzaktan kumandalı sistemlerde kumandanın ya da kablosuz bağlantının kopması gerçek bir risktir. Son komut \"motoru çalıştır\" idiyse ve bağlantı kesilirse motor sonsuza kadar dönmeye devam edebilir. Çözüm: komutlar düzenli gelmelidir; belli bir süre komut gelmezse çıkış **kendiliğinden kapanmalıdır**. Buna yazılımla \"zaman aşımı\" ya da \"watchdog\" mantığı denir. Aşağıdaki sketch, seri porttan `1` komutu geldikçe D7 çıkışını (motor/röle pini) açık tutar; 700 ms komut gelmezse kapatır. `millis` ile yazıldığı için `delay` kullanmaz. (Arduino'nun işlemcisinde ayrıca donanım watchdog zamanlayıcısı da vardır; bu ders kapsamında yalnızca yazılım yöntemini işliyoruz.)\n\n```cpp\n// sketch: komut_zaman_asimi\nconst unsigned long ZAMAN_ASIMI = 700;   // ms\nunsigned long sonKomut = 0;\nbool cikisAcik = false;\n\nvoid setup() {\n  pinMode(7, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == '1') {                      // \"çalış\" komutu: çıkışı aç, sayacı yenile\n      cikisAcik = true;\n      sonKomut = millis();\n      digitalWrite(7, HIGH);\n    } else if (c == '0') {               // \"dur\" komutu\n      cikisAcik = false;\n      digitalWrite(7, LOW);\n    }\n  }\n\n  if (cikisAcik && millis() - sonKomut >= ZAMAN_ASIMI) {\n    cikisAcik = false;                   // komut kesildi: güvenli duruma geç\n    digitalWrite(7, LOW);\n    Serial.println(\"Komut yok: cikis kapandi\");\n  }\n}\n```\nGerçek bir motor Uno pininden doğrudan beslenemez; transistör ya da sürücü gerekir (22. ve 23. dersler). Laboratuvarda D7 çıkışını bir LED ile izleyebilirsin.\n\n### Dene\n- CALISIR modunda bip süresini 50 ms yap. Bip hâlâ duyuluyor mu?\n- ALARM'ı zaman aşımı yerine yalnızca SUSTUR butonuyla bitir. Bu durumda dönmeyi unutan bir kullanıcı için ne olur?\n- Panele dördüncü bir mod ekle (örneğin SESSIZ: LED yanar, buzzer susar).\n\n### Sık yapılan hatalar\n- ISR içinde `Serial.print` ya da `delay` kullanmak.\n- `modIstegi` ve `sonKesme` değişkenlerinden `volatile`'ı çıkarmak.\n- Mod değişince zaman sayaçlarını sıfırlamamak: yeni modun ilk bip ya da yanıp sönmesi yanlış zamanda olur.\n- `tone()` çalarken `noTone()` ile kapatmayı unutmak: buzzer susmaz.\n- `millis` farkını toplamayla kontrol etmek (taşma tuzağı).",
          "question": "Bu panelde en çok hangi görev zamanlamaya duyarlı: LED mi, buzzer mı, buton mu? Yeni bir görev eklemek (örneğin bir sensör okumak) mevcut görevleri nasıl etkiler? Eklediğin işin `loop()`'u yavaşlatmaması için neye dikkat etmelisin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Büyük bir işi **görevlere** bölüp her göreve kendi zaman değişkenini vermeyi\n- `millis`, durum makinesi ve kesmeyi tek bir projede birleştirmeyi\n- Hangi işi kesmeyle, hangisini `loop()` içinde yoklamayla yapacağına karar vermeyi\n- Bağlantı kopunca çıkışı güvenli duruma getiren zaman aşımı mantığını\n\n### Önceden bilmen gerekenler\nDers 26-29: `delay`'in bloklaması, `millis` kalıbı, durum makinesi (`enum` + `switch`) ve kesme (`attachInterrupt`, `volatile`). Ders 18'de `tone` ve `noTone`; ders 6'da `INPUT_PULLUP`.\n\n### Hepsi aynı anda?\nTek işlemci aslında işleri aynı anda yapmaz; çok hızlı sırayla yapar. Her `loop()` turu birkaç mikrosaniye sürerse, her göreve her tur bir bakış atınca hepsi aynı anda çalışıyor gibi görünür. Püf noktası, **hiçbir görevin beklememesidir**: görev ya işi yapar ya da \"henüz zamanı değil\" diyip çıkar.\n\n### Önce görev tablosu\nKodu yazmadan önce işi tabloya dök:\n\n| Görev | Tetikleyici | Yöntem | Kendi değişkeni |\n|---|---|---|---|\n| Nabız LED'i | Moda göre 1000/250/100 ms | `millis` | `ledZaman` |\n| Mod değişimi | MOD butonu (D2) | Kesme + bayrak | `modIstegi` |\n| Buzzer | Moda göre açık/kapalı süre | `millis` + küçük FSM | `buzzerZaman` |\n| Alarmdan çıkış | SUSTUR (D3) ya da 5 sn | Yoklama + `millis` | `modBasi` |\n\nBöylece her satırı yazmadan önce kimin kimi etkilediğini görürsün. Yeni bir görev eklemek tabloya yeni satır eklemekten ibarettir.\n\n### Hangi iş kesme, hangisi yoklama?\nKesme, kısa ve kaçırılmaması gereken olaylar içindir: MOD butonu bir kez basılıp bırakıldığında `loop()` başka işle meşgul olsa da kaybolmasın. ISR yalnızca `modIstegi = true;` yazar (ve sıçramaya karşı 50 ms'lik koruma kullanır); modu değiştirme işi `loop()`'ta yapılır. SUSTUR butonu ise her tur `digitalRead` ile yoklanabilir, çünkü tur çok kısadır. Kesmeyi her yerde kullanmak gerekmez.\n\n### Mod değişince sıfırla\nMod, bir durum makinesidir. Geçişte `modGec()` fonksiyonu zaman sayaçlarını sıfırlar, LED'i ve buzzerı kapatır. Bunu unutursan yeni modun ilk yanıp sönmesi yanlış zamanda gelir. Buzzer için de iki hâlli (açık/kapalı) küçük bir durum makinesi yazılır; açık ve kapalı süreleri parametre olarak verilir.\n\n### Kontrol kopunca ne olur?\nUzaktan kumandalı bir sistemde bağlantı kopabilir. Son komut \"motoru çalıştır\" ise motor sonsuza kadar dönebilir. Çözüm **zaman aşımıdır**: her komut sayacı yeniler (`sonKomut = millis()`), belli bir süre komut gelmezse çıkış kendiliğinden kapanır. Kural: güvenli durum \"kapalı\"dır.\n\n### Özet\nÇoklu görev, işleri bekletmeden sırayla yoklayan bir `loop()` ile sağlanır. Görev tablosu yazılır, her göreve kendi zaman değişkeni verilir; hızlı olaylar kesme + bayrakla, geri kalanlar `millis` ve durum makinesiyle yürütülür. Mod geçişlerinde sayaçlar sıfırlanır. Uzaktan kumanda gibi sistemlerde komut kesilince çıkışı kapatan zaman aşımı güvenliği sağlar.",
          "concepts": [
            {
              "term": "Görev (task)",
              "definition": "Programın bağımsız yürüttüğü küçük bir iş: LED yanıp sönmesi, buzzer, buton okuma. Her görevin kendi zaman değişkeni vardır.",
              "example": "Nabız LED'i ledZaman ile, buzzer buzzerZaman ile yönetilir.",
              "pitfall": "İki göreve tek ortak zaman değişkeni vermek: biri güncellenince öteki zamanını kaybeder."
            },
            {
              "term": "Bekletmeyen döngü",
              "definition": "Hiç delay içermeyen, her turda tüm görevlere kısaca bakıp hemen başa dönen loop().",
              "example": "Her tur birkaç mikrosaniye sürer; buton, LED ve buzzer her turda kontrol edilir.",
              "pitfall": "Bir göreve küçük bir delay eklemek: bütün diğer görevler de o kadar bekler."
            },
            {
              "term": "ISR + bayrak",
              "definition": "Kesme fonksiyonunda yalnızca bir volatile bayrak kaldırılır; asıl iş loop()'ta yapılır.",
              "example": "modTusu() içinde modIstegi = true; loop() bayrağı görünce modGec() çağırır.",
              "pitfall": "ISR içinde mod değiştirmek, LED sürmek ya da Serial.print kullanmak."
            },
            {
              "term": "Zaman aşımı (timeout)",
              "definition": "Belli süre komut ya da olay gelmezse çıkışı kendiliğinden güvenli duruma getiren mantık.",
              "example": "700 ms komut gelmezse D7 çıkışı LOW olur ve motor durur.",
              "pitfall": "Son komut \"çalış\" iken bağlantı kopsa da çıkışı açık bırakmak; motor kontrolsüz döner."
            },
            {
              "term": "Görev tablosu",
              "definition": "Kodu yazmadan önce görev, tetikleyici, yöntem ve değişkenleri listeleyen plan tablosu.",
              "example": "Mod değişimi: tetikleyici D2 butonu, yöntem kesme + bayrak, değişken modIstegi.",
              "pitfall": "Planlamadan kod yazmaya başlamak: görevlerin birbirinin değişkenini bozduğu sonradan fark edilir."
            }
          ],
          "quiz": [
            {
              "id": "m3h6d30-q1",
              "kind": "mcq",
              "prompt": "Çoklu görev panelinde MOD butonunun kesmesi (ISR) neden yalnızca modIstegi = true; yazıyor da modu kendisi değiştirmiyor?",
              "options": [
                "Kesmeler değişken yazamaz",
                "Mod değişkeni yalnızca setup()'ta yazılabilir",
                "ISR kısa kalmalı; asıl iş loop()'ta yapılır",
                "Buton okuma yalnızca loop()'ta mümkündür"
              ],
              "answer": 2,
              "explanation": "ISR kısa olmalıdır; mod değiştirme LED ve buzzer sayaçlarını sıfırlama gibi işler içerir ve ana programla çakışabilir. Kesmeler değişken yazabilir (volatile olmaları gerekir), buton da kesmeyle okunabilir.",
              "skills": [
                "prog-multitask",
                "prog-interrupts"
              ]
            },
            {
              "id": "m3h6d30-q2",
              "kind": "find-bug",
              "prompt": "SUSTUR butonu (D3, INPUT_PULLUP) basılınca ALARM'dan çıkılması gerekiyor. Ama ALARM'a girer girmez hemen BEKLE'ye dönülüyor. Hatalı satır hangisi?\n\n```\nif (mod == ALARM) {\n  if (digitalRead(3) == HIGH || simdi - modBasi >= 5000) {\n    modGec(BEKLE);\n  }\n}\n```",
              "options": [
                "if (mod == ALARM) {",
                "if (digitalRead(3) == HIGH || simdi - modBasi >= 5000) {",
                "modGec(BEKLE);",
                "Kod doğru; sorun devrede"
              ],
              "answer": 1,
              "explanation": "INPUT_PULLUP ile basılmamış buton HIGH okunur, basılı buton LOW. Koşul == HIGH olduğu için buton basılmadan koşul hemen doğru olur. Doğrusu == LOW. Diğer satırlar doğrudur.",
              "skills": [
                "prog-multitask",
                "prog-debug"
              ]
            },
            {
              "id": "m3h6d30-q3",
              "kind": "numeric",
              "prompt": "ALARM modunda buzzer 200 ms çalıp 200 ms susuyor; moda girildiğinde buzzerZaman = modBasi olarak sıfırlanıyor ve buzzer önce 200 ms susuyor. ALARM 5 saniye sürüyor (5000 ms'de BEKLE'ye dönülüyor). Bu sürede buzzer kaç kez çalmaya başlar?",
              "answer": 12,
              "tolerance": 0,
              "unit": "bip",
              "explanation": "Bip başlangıçları 200, 600, 1000, ... ms (her 400 ms'de bir). 200 + 400k < 5000 koşulunu k = 0...11 sağlar: 12 bip. 5000. ms'de alarmdan çıkış kontrolü buzzer kontrolünden önce yapıldığı için 13. bip başlamaz.",
              "skills": [
                "prog-multitask",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d30-q4",
              "kind": "numeric",
              "prompt": "Bir çıkış 700 ms zaman aşımıyla korunuyor: her '1' komutu sayacı yeniliyor, 700 ms komut gelmezse çıkış kapanıyor. Son '1' komutu t = 600 ms'de geldi, sonra hiçbiri gelmedi. Çıkış kaçıncı milisaniyede kapanır?",
              "answer": 1300,
              "tolerance": 10,
              "unit": "ms",
              "explanation": "Zaman aşımı, son komuttan itibaren sayılır: 600 + 700 = 1300 ms. İlk komut zamanına bakmak (700 ms) ya da toplam süreye 700 eklemek yanlış olur; sayaç her komutla yenilenir.",
              "skills": [
                "prog-multitask",
                "prog-timing"
              ]
            },
            {
              "id": "m3h6d30-q5",
              "kind": "mcq",
              "prompt": "Uzaktan kumandalı bir sistemde bağlantı kopunca çıkışın otomatik kapanması neden istenir?",
              "options": [
                "Kod daha kısa olsun diye",
                "Buzzer çalmaya devam etsin diye",
                "Bağlantı kopunca kart kendini kapatır zaten",
                "Son komut \"çalış\" ise çıkışın sonsuza kadar açık kalmasını önlemek için"
              ],
              "answer": 3,
              "explanation": "Bağlantı koparsa son komut hâlâ geçerli sanılabilir ve motor kontrolsüz dönebilir. Zaman aşımı güvenli duruma (kapalı) geçer. Kart bağlantı kopunca kendiliğinden bir şey yapmaz; mantığı sen yazarsın.",
              "skills": [
                "prog-multitask"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Ekranlar ve veri",
      "project": "Termostat",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. 7-segment ekranda bir rakamın bir bayt olduğunu söyleyebilir; 74HC595 ve `shiftOut` ile üç pinle sekiz çıkışı sürebilir.\n2. 16x2 LCD'yi `LiquidCrystal` ile bağlayıp `setCursor` ve `print` ile istediği yere yazdırabilir; eski yazının silinmediğini bilir.\n3. I2C hattının SDA (A4) ve SCL (A5) ile çalıştığını, adresin ne olduğunu açıklayabilir; adres taramasıyla cihaz bulabilir.\n4. Flash, SRAM ve EEPROM'un farkını söyleyebilir; ayarı EEPROM'a `update` ile ve seyrek yazabilir; yazma ömrünü hesaplayabilir.\n5. NTC, LCD, röle ve EEPROM'u birleştiren, histerezisli ve durum makineli bir termostat kurup anlatabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir. Bitirme projesi için gerekirse iki gün ayır.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | 7-segment ekran ve 74HC595 | ~25 dk | Anlatımı oku, devreyi kur, 0-9 sayacını çalıştır, bir rakamın baytını elle bul, mini testi çöz. |\n| 2 | LCD 16x2 ekran | ~20 dk | Kontrastı ayarla, iki satıra yazı yaz, eski yazının üstüne yazma sorununu dene. |\n| 3 | I2C: Wire ve adres tarama | ~25 dk | Adres taramasını çalıştır, adresi değiştirip farkı gör, I2C LCD'ye yazdır. |\n| 4 | EEPROM, String ve SRAM | ~25 dk | Açılış sayacını çalıştır, `write` ve `update` farkını gör, yazma ömrü hesabını yap. |\n| 5 | Bitirme projesi: Termostat | ~35 dk | Planı çiz, devreyi kur, programı çalıştır, histerezisi ve EEPROM'u dene, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftaların konuları birleşir. Başlamadan önce şunları kontrol et:\n- NTC ile sıcaklık hesabı ve gerilim bölücü (Hafta 3). A2'den okunan ADC değerinden direnç bulabiliyor mu?\n- Röle ile bir yükü açıp kapatma (Hafta 5). Röle düşük gerilimle, yetişkin gözetiminde kullanılıyor mu?\n- `millis()` ile bekleme yapmayan kod ve durum makinesi (Hafta 6). `delay` kullanmadan iki işi birlikte yürütebiliyor mu?\n- Butonu `INPUT_PULLUP` ile okuma ve basış anını yakalama (Hafta 2).\n- Onaltılık sayı ve ikilik sayı (bit) fikri yeni gelir; ders 31'de yavaşça işlenir, takılırsa baytı 8 lambalı bir sıra olarak düşün.\n\n### Kavram haritası\n- **Ekran çıkışı:** 7-segment (bayt deseni) → 74HC595 (SER, SRCLK, RCLK) → `shiftOut` → mandal\n- **Karakter ekranı:** LCD 16x2 → RS, E, D4-D7 → `begin`, `setCursor`, `print` → kontrast (V0)\n- **Haberleşme:** I2C → SDA (A4) ve SCL (A5) → cihaz adresi → `Wire` ve adres taraması → `LiquidCrystal_I2C`\n- **Bellek:** Flash, SRAM, EEPROM → `read`, `update`, `put/get` → yazma ömrü → `String` ve SRAM\n- **Proje:** NTC ölçümü → histerezis → durum makinesi (KAPALI, ISITIYOR, AYAR) → röle → EEPROM'da hedef\n\n### Sık yapılan hatalar\n- **Mandalı unutmak.** `shiftOut` çağrıldı ama RCLK HIGH yapılmadı; 7-segment ekran değişmez.\n- **Ortak anot ile ortak katodu karıştırmak.** Desen ters görünür; ortak anotta COM 5V'a bağlanır.\n- **LCD pin sırasını karıştırmak.** `LiquidCrystal lcd(RS, E, D4, D5, D6, D7)` sırası kablolarla uyuşmalıdır; kontrastı (V0) ayarlamayı da unutma.\n- **Eski yazıyı silmemek.** Kısalan sayıda eski rakamlar kalır (`250` yerine `7` yazınca `750`).\n- **I2C adresini tahmin etmek.** Önce taramayı çalıştır; kodla cihaz adresi aynı olmalı.\n- **SDA ve SCL'yi A4-A5 dışına bağlamak.** Uno'nun I2C'si yalnız bu pinlerdedir.\n- **EEPROM'a her turda yazmak.** Hücre ömrü yaklaşık 100.000 yazmadır. `update` kullan, seyrek yaz.\n- **Boş EEPROM'u 0 sanmak.** Hiç yazılmamış hücrede 255 vardır; geçerli aralık kontrolü yap.\n- **Tek eşikle ısıtıcıyı sürmek.** Röle sürekli açılıp kapanır; histerezis kullan.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını bir kez daha oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. 7-segment için 5 ve 9 rakamlarının baytını elle yaz; sonra programda dene.\n4. Bir EEPROM hücresine her dakika, her saat ve her 10 saniyede yazarsan ömrünün kaç günde biteceğini hesapla.\n5. Termostat durum tablosunu hedef 25 için kendi eşik sayılarınla (24,5 ve 25,5) yeniden doldur.\n6. Kendi cümlelerinle şu soruyu cevapla: \"Histerezis olmasa röleye ne olurdu?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Termostat)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | NTC ters bağlı ya da röle / LCD bağlantısı eksik | NTC, butonlar, röle (LED yükü) ve I2C LCD doğru bağlı | Bağlantılar düzenli; sensör değeri seri monitörle doğrulanmış |\n| Ölçüm | Sıcaklık mantıksız ya da hiç okunmuyor | Sıcaklık ekranda ve seri monitörde makul görünüyor | Ortalama alıyor, makul aralık dışı okumaları yakalıyor |\n| Kontrol | Tek eşik; röle titriyor | Histerezis çalışıyor; röle yalnız ISITIYOR durumunda açık | Histerezis değerini deneyerek seçmiş ve etkisini açıklıyor |\n| Bellek | Hedef güç kesilince kayboluyor ya da her turda yazılıyor | Hedef ayar bitince bir kez, `update` ile yazılıyor; geçersiz değerde varsayılan kullanılıyor | Yazma sayısını ölçmüş, ömür hesabını yapmış |\n| Program yapısı | `delay` ile bloklanıyor | `millis()` ve `switch` ile durum makinesi kurulu | Sensör arızası gibi bir güvenlik önlemi eklenmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi, durumları ve EEPROM kullanımını adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve geliştirme fikrini anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta, önceki haftalarda öğrenilenlerin gerçek bir ürün gibi birleştiği haftadır. Hesaplamalar ve pin numaraları bu hafta sıkça karışır; öğrencinin devre şemasını ve durum tablosunu kâğıda çizmesi çok yardımcı olur.\n- **Nasıl destek olunur?** Cevabı söylemek yerine şu soruları sor: \"Hangi pin hangi kabloya bağlı?\", \"Mandalı kullandın mı?\", \"Seri monitör ne yazıyor?\", \"Bu değer EEPROM'a ne zaman yazılıyor?\"\n- **Zor kavramlar.** Bit ve onaltılık gösterim (ders 31, 33) ve I2C adresi soyuttur. İkilik sayıyı sekiz lambalı bir sıra, adresi de apartman daire numarası gibi anlatmak yardımcı olur.\n- **Süre.** Bitirme projesi 35 dakikanın üstüne çıkabilir. Gerekirse devreyi bir gün, programı ertesi gün çalıştırın.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kartla çalışırken röleyi yalnız düşük gerilimle (LED, küçük yük) kullanın; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Gerçek bir ısıtıcı bağlanmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "7-segment ekran ve 74HC595",
          "durationMin": 25,
          "problem": "Hesap makinesindeki rakamlar nasıl çiziliyor? Aslında yedi küçük çubuk LED'in bir kısmı yanıyor, bir kısmı sönük. Ama yedi çubuk için yedi pin harcamak çok pahalı. Bir kartın yalnızca üç pinle sekiz çıkışı birden yönetmesi mümkün mü?",
          "contentMd": "### Devre\n7-segment ekran, \"a\" ile \"g\" arasında adlandırılmış yedi çubuktan ve bir de nokta (dp) LED'inden oluşur. Bu derste **ortak katotlu** (tüm LED'lerin eksi uçları birleşik) bir ekran kullanıyoruz; laboratuvarda parçanın **Ortak uç** özelliği varsayılan olarak \"Ortak katot\"tur. Yedi çubuğu tek tek pinlere bağlamak yerine bir **74HC595 kaydırmalı yazmaç** kullanacağız. Uno ona bitleri sırayla yollar, çip de sekiz çıkışı birden değiştirir.\n\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Gereken parçalar: 74HC595 (`sr595`), 7-segment ekran (`sevenseg`) ve 7 direnç.\n\n| Parça | Bağlantı |\n|---|---|\n| 74HC595 VCC ve SRCLR | 5V |\n| 74HC595 GND ve OE | GND |\n| 74HC595 SER (veri) | **D4** |\n| 74HC595 SRCLK (saat) | **D6** |\n| 74HC595 RCLK (mandal) | **D5** |\n| 74HC595 QA, QB, QC, QD, QE, QF, QG | Her biri bir 330 Ω dirençten geçip ekranın sırasıyla a, b, c, d, e, f, g ucuna |\n| 74HC595 QH (isteğe bağlı) | 330 Ω direnç üzerinden ekranın dp ucuna (Dene bölümünde kullanılacak) |\n| 7-segment COM | GND |\n\nDirenç değerini direnci seçip sağ paneldeki özelliklerden ayarla (varsayılan 330 Ω uygundur). Her çubuk için ayrı bir direnç gerekir. Gerçek çipte bu uçların numaraları VCC için 16, GND için 8, SER için 14, SRCLK için 11, RCLK için 12, OE için 13 ve SRCLR için 10'dur; ama laboratuvarda pinleri adlarıyla seçersin.\n\nLaboratuvar 74HC595'in iki önemli ucunu da modeller: **OE** (çıkış etkin) 5V'a bağlıysa ya da boş bırakılmışsa çıkışlar kapalıdır; **SRCLR** (yazmaç temizle) GND'ye bağlıysa ya da boş bırakılmışsa yazmaç sürekli temizlenir. İkisi için de boş bıraktığında \"bağlı olmayan giriş\" uyarısı görürsün.\n\n### Program\nHer rakam bir **bayt**tır (8 bit). Bit 0 \"a\" çubuğunu, bit 1 \"b\" çubuğunu, ... bit 6 \"g\" çubuğunu, bit 7 nokta LED'ini yönetir (bit 0 QA'ya, bit 7 QH'ye gider). Örneğin 1 rakamı için yalnız b ve c yanar: `0b00000110`, yani 0x06.\n\n```cpp\n// sketch: yedi_segment_sayac\nconst int VERI = 4;    // DS\nconst int MANDAL = 5;  // ST_CP\nconst int SAAT = 6;    // SH_CP\n\n// 0'dan 9'a rakam desenleri (bit 0 = a ... bit 6 = g)\nconst byte RAKAM[10] = {\n  0x3F, 0x06, 0x5B, 0x4F, 0x66,\n  0x6D, 0x7D, 0x07, 0x7F, 0x6F\n};\n\nvoid yaz(byte desen) {\n  digitalWrite(MANDAL, LOW);                 // mandalı aç: çıkışlar sabit kalsın\n  shiftOut(VERI, SAAT, MSBFIRST, desen);     // 8 biti sırayla kaydır\n  digitalWrite(MANDAL, HIGH);                // mandalı kapat: çıkışlar bir anda güncellenir\n}\n\nvoid setup() {\n  pinMode(VERI, OUTPUT);\n  pinMode(MANDAL, OUTPUT);\n  pinMode(SAAT, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i < 10; i++) {\n    yaz(RAKAM[i]);\n    delay(1000);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `shiftOut` bir baytı bit bit gönderir. Her bit için önce **veri** pinini HIGH ya da LOW yapar, sonra **saat** pinine bir darbe verir. 74HC595 saatin yükselen kenarında veri pinine bakar ve biti içindeki yazmaca kaydırır.\n2. `MSBFIRST` \"en değerli bit önce\" demektir. Bayt 0x06 (0b00000110) ise önce 0, 0, 0, 0, 0, 1, 1, 0 sırasıyla gider.\n3. Sekiz saat darbesinden sonra bayt çipin içindedir, ama çıkışlar henüz değişmez. **Mandal** (ST_CP) pini LOW'dan HIGH'a geçince çip içindeki baytı çıkışlara aktarır. Böylece ekran kayarak değil, tek seferde değişir.\n4. Çip zincirlenebilir: iki 74HC595 arka arkaya bağlanırsa `shiftOut`'u iki kez çağırarak 16 çıkışı üç pinle yönetirsin.\n5. Hesap: ekranı doğrudan sürseydin 8 pin gerekirdi. 74HC595 ile 3 pin yetiyor; bir zincire her çip eklediğinde pin sayısı yine 3 kalıyor.\n\nAynı çipi ekran yerine 8 LED'e (her biri bir dirençle) bağlayabilirsin. Aşağıdaki program tek bir LED'i soldan sağa kaydırır. `1 << i` ifadesi, yalnızca i numaralı biti 1 yapar.\n\n```cpp\n// sketch: led_seridi\nconst int VERI = 4;\nconst int MANDAL = 5;\nconst int SAAT = 6;\n\nvoid setup() {\n  pinMode(VERI, OUTPUT);\n  pinMode(MANDAL, OUTPUT);\n  pinMode(SAAT, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i < 8; i++) {\n    digitalWrite(MANDAL, LOW);\n    shiftOut(VERI, SAAT, MSBFIRST, 1 << i);   // yalnızca i. LED yanar\n    digitalWrite(MANDAL, HIGH);\n    delay(200);\n  }\n}\n```\n\n### Dene\n- ▶ ile programı çalıştır, ekranda 0'dan 9'a sayımı izle. Çalışırken bir direnci seç: **Sanal ölçüm** o çubuğun akımını gösterir (yaklaşık 8 mA). Direnci 1 kΩ yapıp çubuğun nasıl sönükleştiğine bak.\n- `RAKAM` dizisindeki desenlerden birini elle bozup ekranda neyin değiştiğini gözle (örneğin 0x3F yerine 0x7F yaz).\n- Nokta LED'ini yakmak için bayta 0x80 ekle: `yaz(RAKAM[i] | 0x80)`. Bunun için QH'nin dp'ye bağlı olması gerekir. Her rakamın yanında nokta yanar mı?\n- Ekranı seçip **Ortak uç** özelliğini \"Ortak anot\" yap. COM'u GND yerine 5V'a bağla ve desenin tersini gönder (`~RAKAM[i]`).\n- Geriye doğru sayan bir program yaz: 9'dan 0'a.\n\n### Sık yapılan hatalar\n- Mandal pinini hiç kullanmamak: bitler çipin içine kayar ama çıkışlar hiç değişmez, ekran boş kalır.\n- Ortak anotlu ekranı ortak katotluymuş gibi kullanmak: rakamlar tersine görünür (yanan çubuklar sönük, sönükler yanık). Ortak anotlu ekranda COM'u 5V'a bağlarsın ve desen bayt ters çevrilir: `~RAKAM[i]`.\n- Dirençsiz bağlamak: laboratuvar \"LED'in seri direnci yok\" uyarısı verir ve çubuk yanar (74HC595 çıkışının iç direnci yalnızca yaklaşık 50 Ω'dur). Gerçek çubuklarda da aşırı akım çubuğa ve çipe zarar verir.\n- 74HC595'in OE ve SRCLR uçlarını yanlış bağlamak ya da boş bırakmak: çip çıkış vermez ya da yazmacı sürekli temizler.\n- Besleme (VCC ve GND) kablolarını unutmak: laboratuvar \"beslenmemiş\" uyarısı verir, çıkış olmaz.",
          "question": "Sekiz LED'i üç pinle yönetmek harika, ama bir bedeli de var. Sence bu bedel ne olabilir? (İpucu: bir LED'in durumunu değiştirmek için kaç bayt göndermen gerekiyor?)",
          "explainerMd": "### Bu derste öğreneceklerin\n- 7-segment ekranın yedi çubuktan (a-g) ve bir noktadan (dp) oluştuğunu ve bir rakamın bir **bayt** ile nasıl anlatıldığını\n- Bir bayttaki bitleri hangi çubuğun yaktığını bulmayı\n- 74HC595 kaydırmalı yazmacın üç pinle sekiz çıkışı nasıl yönettiğini\n- `shiftOut` ve mandal (RCLK) ile ekranı güncellemeyi\n\n### Önceden bilmen gerekenler\nDers 3'te `pinMode` ve `digitalWrite`; ders 4'te `for` döngüsü ve diziler; ders 2'de LED için seri direncin gerekliliği.\n\n### Bir rakam, bir bayt\n7-segment ekran, yan yana dizilmiş yedi küçük LED çubuğudur. Çubuklar a, b, c, d, e, f, g harfleriyle adlandırılır; sekizinci LED nokta (dp) olarak geçer. Bir rakamı göstermek, hangi çubukların yanacağını seçmektir. Sekiz LED iki durumlu (yanık ya da sönük) olduğundan seçim tam bir **bayttır**: sekiz **bit**.\n\n```\nbit:     7   6   5   4   3   2   1   0\nçubuk:  dp   g   f   e   d   c   b   a\n```\n\nÖrnek: 1 rakamı için yalnız b ve c yanar. Bit 1 ve bit 2 değeri 1 olur: `0b00000110`. Bu sayı onaltılık (hexadecimal) yazımla `0x06`'dır. Onaltılık yazım bir baytı iki karakterle gösterir: `0x3F` = 3 × 16 + 15 = 63 ve bu sayı 0 rakamıdır (a-f çubukları yanar, g sönük).\n\n### Pin sıkıntısı ve çözümü\nEkranı doğrudan sürmek 8 pin ister. Bir de başka parçalar varsa Uno'nun pinleri hemen biter. **74HC595** bu sorunu çözer: Uno ona bitleri tek bir tel (SER) üzerinden **sırayla** yollar, çip bunları içindeki yazmaca dizer ve sekiz çıkışı (QA-QH) birden sürer. Gereken Uno pini üçtür:\n\n| Çip ucu | Görevi | Derste bağlandığı pin |\n|---|---|---|\n| SER | Veri: bitler bu telden gelir | D4 |\n| SRCLK | Saat: her darbede bir bit içeri kayar | D6 |\n| RCLK | Mandal: kayan baytı çıkışlara aktarır | D5 |\n\n### shiftOut ve mandal\n`shiftOut(VERI, SAAT, MSBFIRST, bayt)` komutu sekiz biti sırayla gönderir. `MSBFIRST` en değerli bitin (bit 7) önce gittiğini söyler. Sekiz darbeden sonra ilk giden bit en uzağa (QH), son giden bit 0 ise QA'ya varmıştır; bu yüzden bit 0 \"a\" çubuğunu yakar.\n\nBitler içeri kayarken çıkışlar değişmez. Çıkışlar ancak **mandal** pini LOW'dan HIGH'a geçince topluca güncellenir. Böylece ekran \"kayarak\" değil bir anda değişir:\n\n```\ndigitalWrite(MANDAL, LOW);\nshiftOut(VERI, SAAT, MSBFIRST, desen);\ndigitalWrite(MANDAL, HIGH);\n```\n\n### Zincirleme\nİkinci bir 74HC595'in girişine birinci çipin seri çıkışını bağlarsan iki çip arka arkaya çalışır. Yine yalnız üç Uno pini kullanırsın; `shiftOut` iki kez çağrılır ve 16 çıkış elde edilir. Bedeli zamandır: her çıkış değişikliği için tüm baytlar yeniden gönderilir.\n\n### Özet\nBir rakam, çubuklara karşılık gelen sekiz bitlik bir bayttır. 74HC595 ile bu baytı üç pin üzerinden sırayla gönderirsin; `shiftOut` bitleri kaydırır, mandal HIGH olunca çıkışlar güncellenir. Mandalı unutursan ekran hiç değişmez. Her çubuğun kendi seri direnci olmalıdır.",
          "concepts": [
            {
              "term": "Segment ve bayt deseni",
              "definition": "7-segment ekranda her çubuk bir bite karşılık gelir: bit 0 = a, bit 1 = b, ... bit 6 = g, bit 7 = dp. Bir rakam, hangi bitlerin 1 olduğunu gösteren bir bayttır.",
              "example": "1 rakamında yalnız b ve c yanar: 0b00000110, yani 0x06.",
              "pitfall": "Bit sırasını karıştırmak: bit 0'ı g sanırsan rakamlar ters ya da bozuk görünür."
            },
            {
              "term": "74HC595",
              "definition": "Kaydırmalı yazmaç: seri gelen bitleri alıp sekiz çıkışı (QA-QH) birden süren çip. Üç Uno pini yeter.",
              "example": "Üç pinle (SER, SRCLK, RCLK) bir 7-segment ekranın sekiz LED'ini sürmek.",
              "pitfall": "OE ya da SRCLR ucunu boş bırakmak veya yanlış bağlamak: çip çıkış vermez ya da yazmacı sürekli temizler."
            },
            {
              "term": "shiftOut()",
              "definition": "Bir baytı bit bit gönderir: her bit için veri pinini ayarlar, saat pinine bir darbe verir.",
              "example": "shiftOut(VERI, SAAT, MSBFIRST, 0x06); baytı en değerli bit önce olacak biçimde yollar.",
              "pitfall": "Yalnız shiftOut çağırıp mandalı kullanmamak: bitler çipin içine kayar ama çıkışlar değişmez."
            },
            {
              "term": "Mandal (RCLK)",
              "definition": "74HC595'in içindeki baytı çıkış pinlerine aktaran uç. LOW'dan HIGH'a geçişte çıkışlar topluca güncellenir.",
              "example": "Önce mandal LOW, shiftOut, sonra mandal HIGH: ekran bir anda yeni rakamı gösterir.",
              "pitfall": "Mandalı hiç HIGH yapmamak: ekran boş ya da eski haliyle kalır."
            },
            {
              "term": "Ortak katot ve ortak anot",
              "definition": "Çubukların eksi uçlarının birleşik olduğu ekrana ortak katot, artı uçlarının birleşik olduğu ekrana ortak anot denir. Ortak anotta COM 5V'a bağlanır ve bir bit 0 olan çubuk yanar.",
              "example": "Ortak anotlu ekranda rakam deseni ters çevrilir: ~RAKAM[i].",
              "pitfall": "Ortak anotlu ekrana ortak katot deseni göndermek: yanan çubuklar sönük, sönükler yanık görünür."
            }
          ],
          "quiz": [
            {
              "id": "m3h7d31-q1",
              "kind": "numeric",
              "prompt": "Ortak katotlu bir ekranda yalnız a, d ve g çubuklarını (üç yatay çizgi) yakmak istiyorsun. Bit 0 = a, bit 3 = d, bit 6 = g ise göndereceğin baytın ondalık değeri kaçtır?",
              "answer": 73,
              "tolerance": 0,
              "explanation": "Bit 0 değeri 1, bit 3 değeri 8, bit 6 değeri 64'tür. Toplam 1 + 8 + 64 = 73 (0b01001001, onaltılıkta 0x49). Diğer bitler 0 olduğu için diğer çubuklar sönük kalır.",
              "skills": [
                "bits-bytes"
              ]
            },
            {
              "id": "m3h7d31-q2",
              "kind": "mcq",
              "prompt": "Bir 74HC595'te RCLK (mandal) ucunun görevi nedir?",
              "options": [
                "Veri bitlerini Uno'dan çipe taşımak",
                "Her biti içeri kaydıran saat darbesini üretmek",
                "İçeri kaymış baytı çıkış pinlerine topluca aktarmak",
                "Çipe 5 V besleme vermek"
              ],
              "answer": 2,
              "explanation": "Bitleri SER telinden taşıyan veri pinidir; her biti kaydıran SRCLK saat pinidir. RCLK ise sekiz bit içeri girdikten sonra LOW'dan HIGH'a geçerek baytı QA-QH çıkışlarına aktarır. Besleme VCC ucundan gelir.",
              "skills": [
                "shift-register"
              ]
            },
            {
              "id": "m3h7d31-q3",
              "kind": "predict-output",
              "prompt": "VERI, SAAT ve MANDAL pinleri 74HC595'e doğru bağlı (QA ilk LED, QH sekizinci LED). Bu komutlar çalışınca hangi LED'ler yanar?\n\n```\ndigitalWrite(MANDAL, LOW);\nshiftOut(VERI, SAAT, MSBFIRST, 0b00000101);\ndigitalWrite(MANDAL, HIGH);\n```",
              "options": [
                "QF ve QH",
                "QA ve QC",
                "QB ve QD",
                "Yalnız QC"
              ],
              "answer": 1,
              "explanation": "0b00000101 sayısında bit 0 ve bit 2 değeri 1'dir. MSBFIRST ile bit 0 en son gider ve QA'ya yerleşir, bit 2 de QC'ye yerleşir. QF ve QH, LSBFIRST kullanılsaydı yanacak olan çıkışlardır (bit sırası ters olurdu).",
              "skills": [
                "shift-register",
                "bits-bytes"
              ]
            },
            {
              "id": "m3h7d31-q4",
              "kind": "numeric",
              "prompt": "Üç adet 74HC595 arka arkaya zincirlendi. Toplam kaç çıkış elde edilir?",
              "answer": 24,
              "tolerance": 0,
              "unit": "çıkış",
              "explanation": "Her çip 8 çıkış sağlar: 3 × 8 = 24. Uno'dan yine yalnız üç pin (veri, saat, mandal) kullanılır. Pin sayısı çip sayısıyla artmaz, ama her güncellemede 3 bayt göndermen gerekir.",
              "skills": [
                "shift-register"
              ]
            },
            {
              "id": "m3h7d31-q5",
              "kind": "find-bug",
              "prompt": "Devre doğru kurulu; ancak ekran hiç değişmiyor. Sorun hangisi?\n\n```\nvoid yaz(byte desen) {\n  digitalWrite(MANDAL, LOW);\n  shiftOut(VERI, SAAT, MSBFIRST, desen);\n}\n```",
              "options": [
                "MSBFIRST yerine LSBFIRST yazılmalı",
                "digitalWrite(MANDAL, LOW) satırı fazla",
                "Sonunda mandalı HIGH yapan bir satır yok; bayt çıkışlara aktarılmıyor",
                "desen parametresi byte olmamalı"
              ],
              "answer": 2,
              "explanation": "Bitler çipin içine kayar ama çıkışlar yalnız mandal LOW'dan HIGH'a geçince güncellenir. Fonksiyon sonunda digitalWrite(MANDAL, HIGH) olmalı. MSBFIRST yanlış olsaydı ekran değişir ama desen ters görünürdü. byte tam olarak bu iş için doğru türdür.",
              "skills": [
                "shift-register",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "LCD 16x2 ekran",
          "durationMin": 20,
          "problem": "Şimdiye kadar kartın söylediklerini Serial Monitor'de okudun. Ama bir termostatın başına bilgisayar götürmezsin. Cihazın kendi küçük ekranında \"Sıcaklık: 23.5 C\" yazsa nasıl olurdu? Üstelik bunu yalnızca birkaç satır kodla yapabilirsin.",
          "contentMd": "### Devre\n16x2 LCD, her biri 16 karakter alan iki satırdan oluşur. Çoğu modül HD44780 denetleyicili çiptir. Uno ile **4 bitlik** kipte konuşmak için 6 sinyal pini yeter: RS, E ve D4-D7.\n\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Gereken parçalar: `lcd1602` ekran, bir potansiyometre (kontrast için) ve bir 220 Ω direnç (arka ışık için).\n\n| Parça | Bağlantı |\n|---|---|\n| LCD VSS, RW ve K | GND |\n| LCD VDD | 5V |\n| LCD A (arka ışık +) | 220 Ω direnç üzerinden 5V |\n| LCD V0 (kontrast) | Potansiyometrenin SIG ucu (potansiyometrenin VCC ucu 5V'a, GND ucu GND'ye) |\n| LCD RS | **D12** |\n| LCD E | **D11** |\n| LCD D4 | **D5** |\n| LCD D5 | **D4** |\n| LCD D6 | **D3** |\n| LCD D7 | **D2** |\n\nLCD'nin D0-D3 uçları boş kalır. Laboratuvar ekranı şöyle modeller: yazı görünmesi için VDD en az 4 V olmalı, VSS ve RW toprağa bağlı olmalı. **V0 gerilimi yaklaşık 1,6 V'u aşarsa ekran boş kalır**; V0 hiç bağlı değilse yazı görünür. Potansiyometrenin varsayılan konumu 0,5'tir (V0 = 2,5 V), yani ilk başta ekran boş görünür. Çalışırken potansiyometreyi seçip **Konum** değerini 0,3'ün altına indir ya da V0 pinini seçip **Sanal ölçüm** ile gerilimine bak. Arka ışık A ve K uçlarından akım (1 mA'den fazla) geçince yanar; ışık yanmasa bile yazı görünebilir.\n\n### Program\n```cpp\n// sketch: lcd_merhaba\n#include <LiquidCrystal.h>\n\n// Sıra: RS, E, D4, D5, D6, D7\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n\nvoid setup() {\n  lcd.begin(16, 2);          // 16 sütun, 2 satır\n  lcd.print(\"Merhaba!\");     // 1. satır, 1. sütundan başlar\n  lcd.setCursor(0, 1);       // sütun 0, satır 1 (alt satır)\n  lcd.print(\"Saniye:\");\n}\n\nvoid loop() {\n  lcd.setCursor(8, 1);               // sayıyı sabit yere yaz\n  lcd.print(millis() / 1000);\n}\n```\n\n### Nasıl çalışıyor?\n1. `#include <LiquidCrystal.h>` kütüphaneyi programa ekler. Kütüphane, ekranla konuşmanın zor ayrıntılarını senin yerine halleder.\n2. `LiquidCrystal lcd(12, 11, 5, 4, 3, 2);` bir **nesne** oluşturur. Parantez içindeki sayılar bağlantı pinleridir: önce RS, sonra E, sonra D4'ten D7'ye.\n3. `lcd.begin(16, 2)` ekranın boyutunu söyler ve ekranı başlatır. Bunu `setup` içinde bir kez çağırırsın.\n4. `lcd.print(...)` yazıyı imlecin bulunduğu yere yazar. Sayı da verebilirsin; `Serial.print` ile aynı biçimde çalışır.\n5. `lcd.setCursor(sütun, satır)` imleci taşır. Sayma 0'dan başlar: sol üst köşe `(0, 0)`, sağ alt köşe `(15, 1)`.\n6. `loop` içinde sayıyı hep aynı yere yazıyoruz; böylece ekran yanıp sönmeden güncellenir.\n\n**Eski yazıyı temizleme.** Ekranda \"100\" yazılıyken yerine \"99\" yazarsan \"990\" görürsün; çünkü LCD eski karakteri silmez, üzerine yazar. İki çözüm var:\n- Her yazıdan önce `lcd.clear()` çağırmak (ekran titreyebilir).\n- Yeni yazıyı boşluklarla tamamlamak: `lcd.print(\"99 \");`\n\n**Özel karakter.** Ekran her karakteri 5x8 noktadan çizer. Derece işareti gibi kendi simgeni tanımlayabilirsin:\n\n```cpp\n// sketch: lcd_derece\n#include <LiquidCrystal.h>\n\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n\nbyte derece[8] = {\n  0b00110,\n  0b01001,\n  0b01001,\n  0b00110,\n  0b00000,\n  0b00000,\n  0b00000,\n  0b00000\n};\n\nvoid setup() {\n  lcd.begin(16, 2);\n  lcd.createChar(0, derece);       // 0 numaralı özel karakter yuvasına kaydet\n  lcd.clear();                     // imleci ekran belleğine (DDRAM) döndür; yoksa yazı karakter belleğine gider\n  lcd.print(\"Sicaklik: 23.5\");\n  lcd.write(byte(0));              // özel karakteri ekrana yaz\n  lcd.print(\"C\");\n}\n\nvoid loop() {\n}\n```\n\nHer satır karakterin bir sırasıdır; `1` olan bit yanık noktadır. Yuva numarası 0-7 arasındadır; yani en fazla 8 özel karakter tanımlayabilirsin.\n\n**Dikkat:** `createChar` çağrısından sonra mutlaka `lcd.clear()` ya da `lcd.setCursor(...)` çağır. HD44780'de `createChar` imleci karakter belleğine (CGRAM) taşır; arkasından gelen `print` yazıyı ekran belleğine değil bu belleğe yazar, ekran boş kalır. Bu davranış gerçek ekranda da aynıdır, laboratuvar da bunu modeller.\n\n### Dene\n- Üst satıra adını, alt satıra yaşını yazdır.\n- `lcd.print(millis() / 1000)` satırında sayıyı 9'dan 10'a geçerken izle. Yazıyı hep aynı yerden başlattığın için bir sorun çıkıyor mu?\n- `lcd.scrollDisplayLeft()` komutunu `loop` içinde `delay(300)` ile çağır. Yazı ne yapıyor?\n\n### Sık yapılan hatalar\n- Pin sırasını ya da kablolarını karıştırmak: `LiquidCrystal lcd(12, 11, 5, 4, 3, 2)` içindeki sıra RS, E, D4, D5, D6, D7'dir. Kodla kablolar uyuşmazsa ekran boş ya da anlamsız karakter gösterir.\n- Kontrastı yanlış ayarlamak: V0 gerilimi yüksekse (laboratuvarda yaklaşık 1,6 V üstü) ekran boştur. Önce potansiyometre konumunu düşür.\n- VDD, VSS ya da RW'yi bağlamamak: ekran açılmaz ya da yazı görünmez. RW'yi mutlaka GND'ye bağla.\n- `createChar`'dan sonra `clear()` ya da `setCursor()` çağırmamak: yazı ekranda görünmez.\n- `lcd.begin(16, 2)` satırını unutmak: ekran başlatılmaz.\n- Türkçe karakterler (ı, ş, ğ) ekranın karakter tablosunda yoktur; yazılarda `i, s, g` kullan.\n- Ekrana 16 karakterden uzun yazı yazmak: fazla kısım ekranda görünmez.",
          "question": "Bu ekran için 6 pin harcadık. Elinde yalnızca birkaç boş pin olan bir projede ne yapardın? Ekranı daha az pinle bağlamanın bir yolu olabilir mi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- 16x2 LCD'nin yapısını (2 satır, satır başına 16 karakter) ve dört bit kipinde hangi 6 sinyal pinini kullandığını\n- `LiquidCrystal` kütüphanesiyle nesne oluşturmayı ve ekranı başlatmayı\n- `print`, `setCursor` ve `clear` ile ekranda istediğin yere yazmayı\n- Kontrast pinini (V0) ve özel karakteri tanımayı\n\n### Önceden bilmen gerekenler\nDers 9'da `Serial.print` ile yazdırma; ders 11'de potansiyometreyle gerilim ayarı; ders 31'de çok pinli bağlantının getirdiği pin sıkıntısı.\n\n### Karakter ekranı nasıl düşünülür\n16x2 LCD, 2 satır ve her satırda 16 kutudan oluşan bir ızgaradır. Her kutuya bir karakter yazılır. Kutular 5x8 noktadan çizilir. Yazı, serial monitördeki yazı gibi **imlecin** olduğu yere gider. Sayma 0'dan başlar:\n\n```\nsütun:  0  1  2 ... 15\nsatır 0 [ ][ ][ ]...[ ]\nsatır 1 [ ][ ][ ]...[ ]\n```\n\nSol üst köşe `(0, 0)`, sağ alt köşe `(15, 1)`'dir. `lcd.setCursor(sütun, satır)` imleci taşır; önce sütun, sonra satır yazılır.\n\n### Bağlantı: 6 sinyal, 2 besleme grubu\nÇoğu ekran HD44780 denetleyicisiyle çalışır. Dört bit kipinde sinyal pinleri **RS** (komut mu veri mi), **E** (okuma izni) ve **D4-D7**'dir (veri). RW pini GND'ye bağlanır, çünkü ekrandan okuma yapmayız. VDD 5V'a, VSS GND'ye gider. Arka ışık A ve K uçlarıyla bir dirençle beslenir.\n\n**V0** ucu kontrastı belirler. Genellikle potansiyometre ile 0-5 V arasında ayarlanır. Gerilim çok yüksek olursa ekran boş görünür. Bu laboratuvar modelinde V0 yaklaşık 1,6 V'u aşarsa ekran boştur.\n\n### Kütüphane ve nesne\n```\n#include <LiquidCrystal.h>\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);   // RS, E, D4, D5, D6, D7\n\nvoid setup() {\n  lcd.begin(16, 2);\n  lcd.print(\"Merhaba\");\n}\n```\nParantezdeki sayıların **sırası** RS, E, D4, D5, D6, D7'dir. Kablo ile kod uyuşmazsa ekran boş ya da bozuk görünür. `lcd.begin(16, 2)` ekranı başlatır ve boyutunu bildirir; unutulursa ekran çalışmaz.\n\n### Yazı silinmez, üstüne yazılır\nLCD eski karakteri kendiliğinden silmez. Ekranda `250` varken aynı yere `7` yazarsan `750` görürsün. İki çözüm: `lcd.clear()` ile her şeyi silmek (ekran titreyebilir) ya da yeni yazıyı boşlukla tamamlamak, örneğin `lcd.print(\"7  \")`.\n\n### Özel karakter\nHer karakter 5 sütun ve 8 satırlık noktalardan oluşur. Her satır 5 bitlik bir sayıdır ve `1` olan bit yanık noktadır. `lcd.createChar(yuva, dizi)` ile 0-7 numaralı en fazla 8 özel karakter tanımlanır. Tanımdan sonra `lcd.clear()` ya da `lcd.setCursor()` çağırmalısın; yoksa yazı ekran belleğine değil karakter belleğine gider ve ekran boş kalır. Ekran karakter tablosunda ı, ş, ğ gibi Türkçe harfler yoktur.\n\n### Özet\nLCD'ye yazmak üç adımdır: kütüphaneyi ekle ve nesneyi doğru pin sırasıyla oluştur, `begin(16, 2)` ile başlat, `setCursor` ve `print` ile yaz. Eski yazı silinmediği için güncellerken üstüne yazılacak alanı temizle ya da boşlukla doldur. Ekran boşsa önce kontrast ayarına (V0) bak.",
          "concepts": [
            {
              "term": "LiquidCrystal nesnesi",
              "definition": "LCD ile konuşmayı sağlayan kütüphane nesnesi. Oluştururken bağlantı pinleri RS, E, D4, D5, D6, D7 sırasıyla verilir.",
              "example": "LiquidCrystal lcd(12, 11, 5, 4, 3, 2); RS = D12, E = D11, D4 = D5 ... D7 = D2 demektir.",
              "pitfall": "Pin sırasını kablolarla uyuşmayacak biçimde yazmak: ekran boş kalır ya da anlamsız karakter gösterir."
            },
            {
              "term": "lcd.begin()",
              "definition": "Ekranı başlatır ve sütun ile satır sayısını bildirir. setup() içinde bir kez çağrılır.",
              "example": "lcd.begin(16, 2); 16 sütun, 2 satırlık ekran demektir.",
              "pitfall": "begin çağırmayı unutmak: ekran başlatılmaz, yazı görünmez."
            },
            {
              "term": "setCursor(sütun, satır)",
              "definition": "İmleci taşır; sonraki yazı oradan başlar. Sayma 0'dan başlar, önce sütun gelir.",
              "example": "lcd.setCursor(0, 1); alt satırın başına gider.",
              "pitfall": "Satırı 1'den saymak ya da sütun ile satırın sırasını karıştırmak."
            },
            {
              "term": "Kontrast (V0)",
              "definition": "Yazının görünürlüğünü belirleyen uç. Genellikle bir potansiyometreyle ayarlanır.",
              "example": "Laboratuvar modelinde V0 yaklaşık 1,6 V'un üstüne çıkarsa ekran boş görünür.",
              "pitfall": "Kontrastı hiç ayarlamamak: arka ışık yansa da yazı görünmeyebilir."
            },
            {
              "term": "Eski yazının kalması",
              "definition": "LCD bir kutuya yazılan karakteri otomatik silmez; yeni yazı eskisinin üstüne yazılır.",
              "example": "Ekranda 250 varken aynı yere 7 yazılırsa 750 görünür; lcd.print(\"7  \") ile boşluk eklemek bunu çözer.",
              "pitfall": "Kısalan bir sayıyı temizlemeden yazmak: eski rakamlar ekranda kalır."
            },
            {
              "term": "Özel karakter",
              "definition": "createChar ile 5x8 noktalık kendi simgeni 0-7 arası bir yuvaya kaydedersin; en fazla 8 simge olur.",
              "example": "Derece işaretini tanımlayıp lcd.write(byte(0)) ile ekrana yazmak.",
              "pitfall": "createChar'dan sonra clear() ya da setCursor() çağırmamak: yazı ekranda görünmez."
            }
          ],
          "quiz": [
            {
              "id": "m3h7d32-q1",
              "kind": "mcq",
              "prompt": "Programda LiquidCrystal lcd(9, 8, 7, 6, 5, 4); yazılı. LCD'nin E ucu Uno'nun hangi pinine bağlı olmalıdır?",
              "options": [
                "D9",
                "D7",
                "D8",
                "D4"
              ],
              "answer": 2,
              "explanation": "Parametre sırası RS, E, D4, D5, D6, D7'dir. İkinci sayı E'dir, yani 8: E ucu D8'e bağlanır. D9 RS'ye, D4 ise D7 ucuna gider.",
              "skills": [
                "lcd-display",
                "circuit-wiring"
              ]
            },
            {
              "id": "m3h7d32-q2",
              "kind": "numeric",
              "prompt": "lcd.setCursor(5, 1); komutundan sonra lcd.print(\"Merhaba\"); çalışıyor. Yazının son harfi (a) hangi sütunda olur? (Sütunlar 0'dan başlar.)",
              "answer": 11,
              "tolerance": 0,
              "explanation": "Yazı 5. sütundan başlar. Merhaba 7 harftir; harfler 5, 6, 7, 8, 9, 10, 11 numaralı sütunlara yerleşir. Son harf 11. sütundadır. Yani 5 + 7 − 1 = 11. 12 cevabı, 5 + 7 işleminde fazladan bir sütun saymaktan gelir.",
              "skills": [
                "lcd-display"
              ]
            },
            {
              "id": "m3h7d32-q3",
              "kind": "predict-output",
              "prompt": "Ekran başlatıldı ve boş. Bu komutlar çalışınca 1. satırın başında ne görünür?\n\n```\nlcd.setCursor(0, 0);\nlcd.print(\"250\");\nlcd.setCursor(0, 0);\nlcd.print(\"7\");\n```",
              "options": [
                "7",
                "750",
                "250",
                "257"
              ],
              "answer": 1,
              "explanation": "LCD eski karakteri silmez. 250 yazıldıktan sonra imleç başa döner ve yalnız ilk kutuya 7 yazılır: kutular 7, 5, 0 olur ve 750 görünür. Yalnız 7 görünmesi için lcd.clear() ya da lcd.print(\"7  \") gerekir.",
              "skills": [
                "lcd-display"
              ]
            },
            {
              "id": "m3h7d32-q4",
              "kind": "find-bug",
              "prompt": "Pinler doğru bağlı, kontrast ayarlı, ama ekranda hiçbir şey görünmüyor. Sorun nedir?\n\n```\n#include <LiquidCrystal.h>\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n\nvoid setup() {\n  lcd.print(\"Merhaba\");\n}\n\nvoid loop() {\n}\n```",
              "options": [
                "lcd.print komutu loop() içinde olmalı",
                "#include satırı yanlış",
                "Pin sırası RS, E, D4, D5, D6, D7 olmamalı",
                "lcd.begin(16, 2) çağrısı eksik"
              ],
              "answer": 3,
              "explanation": "Nesne oluşturmak ekranı başlatmaz. setup() içinde lcd.begin(16, 2) çağrılmalı. print() setup() içinde de çalışır; include ve pin sırası da doğrudur.",
              "skills": [
                "lcd-display",
                "prog-debug"
              ]
            },
            {
              "id": "m3h7d32-q5",
              "kind": "mcq",
              "prompt": "LCD'nin arka ışığı yanıyor ama ekranda hiç yazı görünmüyor; kablolar ve kod doğru. İlk hangi ayara bakmalısın?",
              "options": [
                "Kontrast (V0 ucundaki gerilim)",
                "Arka ışık direncinin rengi",
                "Satır sayısı",
                "Baud hızı"
              ],
              "answer": 0,
              "explanation": "Arka ışık yazıdan bağımsızdır; yazının görünmesi kontrasta bağlıdır. V0 gerilimi uygun değilse (laboratuvarda yaklaşık 1,6 V'un üstünde) ekran boş görünür. Baud hızı seri iletişim ayarıdır, LCD'yi etkilemez.",
              "skills": [
                "lcd-display",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "I2C: Wire ve adres tarama",
          "durationMin": 25,
          "problem": "Önceki derste LCD için 6 pin harcadın. Oysa pek çok sensör ve ekran yalnızca **iki telle** konuşabilir ve aynı iki telin üzerine onlarca cihaz bağlanabilir. Peki tek bir hatta bu kadar cihaz varken kart, hangisiyle konuştuğunu nasıl anlıyor?",
          "contentMd": "### Devre\nI2C (\"ay-kare-si\") hattı iki telden oluşur: **SDA** (veri) ve **SCL** (saat). Arduino Uno'da bu uçlar **A4 (SDA)** ve **A5 (SCL)** pinleridir. Her cihazın hat üzerinde **7 bitlik bir adresi** vardır. Kart, mesajın başına adresi yazar; yalnızca o adresteki cihaz cevap verir.\n\nBu derste laboratuvardaki **I2C LCD** parçasını (`lcdI2c`) kullanıyoruz: 16x2 ekranın arkasında PCF8574 çipli bir adaptör (\"backpack\") bulunur ve ekran yalnızca 4 uçla bağlanır.\n\nParçayı laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| I2C LCD GND | GND |\n| I2C LCD VCC | 5V |\n| I2C LCD SDA | **A4** |\n| I2C LCD SCL | **A5** |\n\nLaboratuvar I2C LCD'yi şöyle modeller: SDA doğrudan A4'e, SCL doğrudan A5'e bağlı olmalı; VCC ve GND de tamam olmalı (eksikse \"beslenmemiş\" uyarısı çıkar). Parçayı seçince sağ panelde **I2C adresi** özelliği çıkar (0x27 ya da 0x3F). Kodda yazdığın adres bununla aynı olmazsa ekran cevap vermez.\n\nGerçek devrede birden çok I2C cihazının SDA uçları birbirine, SCL uçları da birbirine bağlanır; çekme dirençleri (pull-up) çoğu modülün üzerinde hazırdır. Laboratuvarda bu ayrıntıyı sen kurmazsın.\n\n### Program\nÖnce cihazın adresini bulalım. Bu program 1'den 126'ya kadar her adrese \"orada biri var mı?\" diye sorar:\n\n```cpp\n// sketch: i2c_tarama\n#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();                       // kart I2C hattında \"yönetici\" olur\n  Serial.println(\"I2C taraniyor...\");\n\n  int bulunan = 0;\n  for (byte adres = 1; adres < 127; adres++) {\n    Wire.beginTransmission(adres);    // bu adrese konuşmayı başlat\n    byte hata = Wire.endTransmission();   // 0 = cihaz cevap verdi\n    if (hata == 0) {\n      Serial.print(\"Cihaz bulundu: 0x\");\n      if (adres < 16) Serial.print(\"0\");\n      Serial.println(adres, HEX);\n      bulunan++;\n    }\n  }\n  Serial.print(\"Toplam: \");\n  Serial.println(bulunan);\n}\n\nvoid loop() {\n}\n```\n\nSeri monitörde çoğu LCD modülü için `0x27` ya da `0x3F` göreceksin. Bu iki adres, PCF8574 ve PCF8574A çiplerinin varsayılan adresleridir. Laboratuvarda LCD parçasının **I2C adresi** özelliğini değiştirip taramayı yeniden çalıştırarak farkı gör.\n\nAdresi bulduktan sonra I2C LCD'yi `LiquidCrystal_I2C` kütüphanesiyle kullanırsın. Ekran bu kez yalnızca 2 telle bağlıdır:\n\n```cpp\n// sketch: i2c_lcd\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);   // adres, sütun, satır\n\nvoid setup() {\n  lcd.init();             // ekranı başlat\n  lcd.backlight();        // arka ışığı aç\n  lcd.setCursor(0, 0);\n  lcd.print(\"I2C ile merhaba\");\n  lcd.setCursor(0, 1);\n  lcd.print(\"Adres: 0x27\");\n}\n\nvoid loop() {\n}\n```\n\n### Nasıl çalışıyor?\n1. `Wire.begin()` kartı I2C hattına hazırlar. Bunu `setup` içinde bir kez çağırırsın.\n2. `Wire.beginTransmission(adres)` ile bir cihaza mesaj hazırlarsın. `Wire.endTransmission()` mesajı gönderir ve bir **hata kodu** döndürür. `0`, cihazın \"aldım\" dediği anlamına gelir; başka bir sayı cihazın cevap vermediğini gösterir.\n3. Tarama programı bu hata kodundan yararlanır: 126 adrese sırayla sorar, `0` dönenleri yazdırır.\n4. `Serial.println(adres, HEX)` sayıyı onaltılık (hexadecimal) yazar. `0x27` onaltılık gösterimdir: 2×16 + 7 = 39.\n5. `LiquidCrystal_I2C lcd(0x27, 16, 2)` nesnesi, 0x27 adresli LCD ile konuşur. `print`, `setCursor` gibi komutlar önceki dersteki LCD ile aynıdır; farklı olan tek şey ekranın başlatılması (`lcd.init()` ve `lcd.backlight()`). `lcd.init()` içinde yaklaşık 1 saniyelik bir bekleme vardır; bu yüzden ▶'e bastıktan sonra yazının görünmesi 1,5 saniye kadar sürer. Biraz bekle.\n6. Aynı hatta iki cihaz aynı adrese sahipse ikisi birbirine karışır. Gerçek modüllerde adres, üzerindeki küçük köprülerle değiştirilebilir; laboratuvarda bunu özellik panelinden yaparsın.\n\n### Dene\n- Tarama programını çalıştırırken LCD'nin SDA kablosunu sil ya da LCD'yi tuvalden kaldır. Bulunan cihaz sayısı ne oluyor?\n- LCD'nin **I2C adresi** özelliğini 0x3F yap. Tarama programı ne gösteriyor? Ekran programında adresi `LiquidCrystal_I2C lcd(0x3F, 16, 2);` olarak değiştirip ekranı yeniden dene.\n- Adres özelliği 0x3F iken kodda 0x27 bırak. Ekranda ne oluyor?\n- SDA ve SCL kablolarını (A4 ile A5'i) çaprazla. Ekran ve tarama ne yapıyor?\n\n### Sık yapılan hatalar\n- SDA ve SCL'yi ters bağlamak: ekran ya da tarama hiçbir şey bulamaz.\n- Yanlış adres yazmak: ekranda yazı çıkmaz. Önce adres taraması yap.\n- Yazı geç görünüyorsa program takılmış değildir: `lcd.init()` yaklaşık 1 saniye bekler, ▶'ten sonra birkaç saniye bekle.\n- SDA ya da SCL'yi A4 ve A5 dışındaki bir pine bağlamak: Uno'nun donanımsal I2C'si yalnız bu iki pindedir.\n- VCC ya da GND'yi bağlamayı unutmak: laboratuvar \"beslenmemiş\" uyarısı verir, ekran cevap vermez.\n- `lcd.init()` ve `lcd.backlight()` çağırmayı unutmak.\n- Gerçek dünyada 3,3 V ile çalışan bir I2C cihazını 5 V hatta bağlamak cihaza zarar verebilir; çalışma gerilimi cihazın üzerinde yazar.",
          "question": "Tarama programı \"0x27 adresinde bir cihaz var\" dedi ama bu cihazın bir LCD mi, sensör mü olduğunu söylemedi. Bir adresten cihazın ne olduğunu anlamak için neye ihtiyacın var?",
          "explainerMd": "### Bu derste öğreneceklerin\n- I2C hattının iki telden (SDA ve SCL) oluştuğunu ve Uno'da hangi pinlerde olduğunu\n- Cihaz adresinin ne olduğunu ve neden gerektiğini\n- Onaltılık (0x) yazımı ondalığa çevirmeyi\n- `Wire` ile adres taramasını ve `LiquidCrystal_I2C` ile ekran kullanmayı\n\n### Önceden bilmen gerekenler\nDers 32'de LCD'nin paralel bağlantısı ve 6 pin gereksinimi; ders 31'de bayt ve onaltılık gösterim; ders 4'te `for` döngüsü.\n\n### Neden iki tel yeter?\nDers 32'de bir ekran için 6 sinyal pini harcadın. **I2C** (\"ay-kare-si\") aynı işi iki telle yapar:\n- **SDA:** veri teli\n- **SCL:** saat teli, bitlerin ritmini belirler\n\nUno'da SDA **A4**, SCL **A5** pinindedir. Başka pine bağlayamazsın; donanımsal I2C yalnız bu iki pindedir. Aynı iki telin üzerine birden çok cihaz bağlanabilir. Buna **hat** (bus) denir.\n\n### Adres: kim konuşuyor?\nHattaki herkes aynı telleri duyar. Kart mesajın başına bir **adres** yazar; yalnız o adrese sahip cihaz cevap verir, diğerleri susar. Adres 7 bitlik bir sayıdır ve genellikle onaltılık yazılır. Onaltılıkta her basamak 16'lıktır:\n\n```\n0x27 = 2 × 16 + 7  = 39\n0x3F = 3 × 16 + 15 = 63   (F = 15)\n```\n\nI2C LCD modüllerinin adresi çoğunlukla 0x27 ya da 0x3F'dir. İki cihaz aynı adresi taşıyorsa karışırlar; çözüm adres köprülerini (ya da laboratuvarda adres özelliğini) değiştirmektir.\n\n### Adres taraması\nAdresini bilmediğin bir cihazı bulmak için tüm adresleri sırayla denersin:\n\n```\nWire.beginTransmission(adres);\nbyte hata = Wire.endTransmission();\n```\n\n`endTransmission()` bir **hata kodu** döndürür. `0`, \"adresteki cihaz cevap verdi\" demektir. Başka bir sayı sorun var demektir; taramada bunun genel anlamı \"orada cihaz yok\"tur. Tarama programı 1'den 126'ya kadar her adresi dener ve `0` dönenleri yazdırır. `Serial.println(adres, HEX)` sayıyı onaltılık yazar; HEX yazmazsan 63 gibi ondalık görürsün.\n\n### Kütüphaneyle kullanım\n`Wire.begin()` kartı hatta bağlar. I2C LCD için ayrıca `LiquidCrystal_I2C` kütüphanesi kullanılır:\n\n```\nLiquidCrystal_I2C lcd(0x27, 16, 2);   // adres, sütun, satır\nlcd.init();\nlcd.backlight();\n```\n\n`print` ve `setCursor` komutları ders 32'dekiyle aynıdır. Farklı olan, nesnenin pin yerine **adres** alması ve ekranın `init()` ile başlatılmasıdır. Adresi yanlış yazarsan ekran cevap vermez.\n\n### Özet\nI2C ile bir cihaz yalnız SDA (A4) ve SCL (A5) telleriyle bağlanır ve her cihazın hat üzerinde bir adresi vardır. Adresi bilmiyorsan tarama programıyla bulursun: `endTransmission()` sonucu 0 ise cihaz oradadır. Kodda yazdığın adres cihazınkiyle aynı olmak zorundadır; 3,3 V'luk cihazları 5 V hatta bağlamamaya da dikkat et.",
          "concepts": [
            {
              "term": "I2C hattı (SDA ve SCL)",
              "definition": "İki telle haberleşme: SDA veri, SCL saat taşır. Aynı iki tele birden çok cihaz bağlanabilir. Uno'da SDA = A4, SCL = A5.",
              "example": "I2C LCD'nin yalnız SDA, SCL, VCC ve GND olmak üzere 4 ucu vardır.",
              "pitfall": "SDA ve SCL'yi ters ya da A4-A5 dışındaki pinlere bağlamak: hiçbir cihaz bulunmaz."
            },
            {
              "term": "I2C adresi",
              "definition": "Hattaki her cihazın 7 bitlik kimlik numarası. Kart mesajı bu adrese gönderir; yalnız o cihaz cevap verir.",
              "example": "Çoğu LCD modülü 0x27 ya da 0x3F adresindedir.",
              "pitfall": "Kodda cihazın gerçek adresinden farklı bir adres yazmak: ekran cevap vermez."
            },
            {
              "term": "Onaltılık sayı (0x)",
              "definition": "16 tabanlı yazım; 0x öneki ile başlar. A-F harfleri 10-15 değerlerini gösterir.",
              "example": "0x3F = 3 × 16 + 15 = 63.",
              "pitfall": "0x27'yi ondalık 27 sanmak: 0x27 aslında 39'dur."
            },
            {
              "term": "Wire.endTransmission()",
              "definition": "Hazırlanan mesajı gönderir ve bir hata kodu döndürür. 0 = adresteki cihaz cevap verdi.",
              "example": "if (Wire.endTransmission() == 0) Serial.println(\"Cihaz var\");",
              "pitfall": "Sonucu hiç kontrol etmemek: cihaz bağlı olmasa da program sorunsuz sanılır."
            },
            {
              "term": "Adres taraması",
              "definition": "Tüm adresleri sırayla deneyip cevap verenleri listeleyen küçük program. Adresini bilmediğin cihazı bulmak için kullanılır.",
              "example": "Tarama 0x3F bulursa kodda LiquidCrystal_I2C lcd(0x3F, 16, 2); yazarsın.",
              "pitfall": "Adres çakışmasını görmemek: iki cihaz aynı adresteyse ikisi birbirine karışır."
            }
          ],
          "quiz": [
            {
              "id": "m3h7d33-q1",
              "kind": "numeric",
              "prompt": "Adres taraması bir I2C LCD'yi 0x3F adresinde buldu. Bu adres ondalık olarak kaçtır?",
              "answer": 63,
              "tolerance": 0,
              "explanation": "Onaltılıkta 3F, 3 × 16 + 15 = 63 eder (F rakamı 15'tir). Serial.println(adres, HEX) 3F yazdırır; HEX yazmadan println(adres) ise 63 yazdırır.",
              "skills": [
                "bits-bytes",
                "i2c-bus"
              ]
            },
            {
              "id": "m3h7d33-q2",
              "kind": "mcq",
              "prompt": "Arduino Uno'da I2C hattı hangi pinlerdedir?",
              "options": [
                "SDA = A4, SCL = A5",
                "SDA = A5, SCL = A4",
                "SDA = D2, SCL = D3",
                "SDA = D4, SCL = D5"
              ],
              "answer": 0,
              "explanation": "Uno'nun donanımsal I2C pinleri veri için A4 (SDA), saat için A5 (SCL) pinleridir. Bunlar sonradan değiştirilemez. D2-D3 ve D4-D5 dijital pinlerdir; I2C'ye ayrılmamıştır.",
              "skills": [
                "i2c-bus",
                "circuit-wiring"
              ]
            },
            {
              "id": "m3h7d33-q3",
              "kind": "predict-output",
              "prompt": "Hatta yalnız bir cihaz var ve adresi 0x3F. Bu program çalışınca seri monitörde ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  for (byte adres = 1; adres < 127; adres++) {\n    Wire.beginTransmission(adres);\n    if (Wire.endTransmission() == 0) {\n      Serial.println(adres);\n    }\n  }\n}\n```",
              "options": [
                "3F",
                "0x3F",
                "63",
                "Hiçbir şey yazmaz"
              ],
              "answer": 2,
              "explanation": "0x3F adresinde cihaz vardır, bu yüzden bir satır yazılır. Serial.println(adres) sayıyı ondalık yazdırır: 63. 3F yazması için println(adres, HEX) gerekir; 0x öneki ise elle yazılmadıkça çıkmaz.",
              "skills": [
                "i2c-bus",
                "bits-bytes"
              ]
            },
            {
              "id": "m3h7d33-q4",
              "kind": "find-bug",
              "prompt": "Adres taraması cihazı 0x3F adresinde buldu. SDA, SCL, VCC ve GND doğru bağlı, ama ekran yazı göstermiyor. Hatalı satır hangisi?\n\n```\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.print(\"Merhaba\");\n}\n```",
              "options": [
                "lcd.init();",
                "LiquidCrystal_I2C lcd(0x27, 16, 2);",
                "lcd.backlight();",
                "lcd.print(\"Merhaba\");"
              ],
              "answer": 1,
              "explanation": "Kodda 0x27 yazılı, ama cihaz 0x3F adresinde. Kart yanlış adrese konuşur, o adreste kimse yoktur. Doğrusu LiquidCrystal_I2C lcd(0x3F, 16, 2); olmalıdır. init, backlight ve print doğru kullanılmıştır.",
              "skills": [
                "i2c-bus",
                "lcd-display",
                "prog-debug"
              ]
            },
            {
              "id": "m3h7d33-q5",
              "kind": "mcq",
              "prompt": "Aynı I2C hattına iki cihaz bağlandı ve ikisinin de adresi 0x27. Ne olur?",
              "options": [
                "Kart ikisine sırayla yazar, sorun çıkmaz",
                "Hat otomatik olarak yeni adres atar",
                "Yalnızca ilk bağlanan çalışır",
                "İki cihaz aynı mesajı duyar ve birbirine karışır; birinin adresi değiştirilmeli"
              ],
              "answer": 3,
              "explanation": "Kart yalnızca adresle seslenir. İki cihaz aynı adresteyse ikisi de cevap vermeye çalışır ve hat karışır. Çözüm modül üzerindeki adres köprülerini (laboratuvarda adres özelliğini) değiştirmektir. Hat adresleri kendiliğinden atamaz.",
              "skills": [
                "i2c-bus"
              ]
            }
          ]
        },
        {
          "title": "EEPROM, String ve SRAM",
          "durationMin": 25,
          "problem": "Bir cihazın gücü kesilip yeniden verildiğinde tüm değişkenlerinin değerleri sıfırlanır. Termostatın \"hedef sıcaklık 24 derece\" ayarını nasıl hatırlayacak? Üstelik Uno'nun belleği çok küçük: bir telefon fotoğrafı bile ona sığmaz. Bu küçük belleği nasıl akıllıca kullanırız?",
          "contentMd": "### Üç bellek\nArduino Uno'nun (ATmega328P) üç ayrı belleği vardır:\n\n| Bellek | Boyut | Ne tutar? | Güç kesilince? |\n|---|---|---|---|\n| Flash | 32 KB | Programın kendisi | Kalır |\n| SRAM | 2 KB | Çalışırken değişkenler | Silinir |\n| EEPROM | 1 KB | Kalıcı ayarlar | Kalır |\n\n`int`, `float`, `String` gibi değişkenlerin hepsi SRAM'dedir. Kalıcı olmasını istediğin veriyi **EEPROM**'a yazarsın.\n\n### Devre\nBu derste devre kurmayacaksın: laboratuvardaki Uno yeterli, ek parça yok. Sonuçları **Seri monitörde** (9600 baud) okuyacaksın.\n\n**Laboratuvar notu:** İlk ▶'de Uno'nun EEPROM'u boştur (her hücrede 255). ■ ile durdurup yeniden ▶'e basmak, gerçek kartta **güç kesip yeniden vermek** gibidir: laboratuvar EEPROM içeriğini korur ve yeni çalıştırma o içerikle başlar. Çalıştırma sırasında EEPROM'a yazdıkların bir sonraki çalıştırmada orada durur. Hücreleri tekrar boşaltmak (255) için ↺ Sıfırla'ya bas. (Yalnız ■/▶ ile durdurup başlatmak EEPROM'a dokunmaz; kodu değiştirsen de içerik kalır, tıpkı gerçek kartta yeni program yüklemenin EEPROM'u silmemesi gibi.)\n\n### Program: açılış sayacı\nHer açılışta EEPROM'daki sayıyı bir artıran program. Hiç yazılmamış bir EEPROM hücresinde `255` bulunur; bunu \"boş\" kabul ediyoruz.\n\n```cpp\n// sketch: eeprom_sayac\n#include <EEPROM.h>\n\nvoid setup() {\n  Serial.begin(9600);\n  byte sayi = EEPROM.read(0);        // 0. adresteki baytı oku\n  if (sayi == 255) sayi = 0;         // hiç yazılmamış: sıfırdan başla\n  sayi = sayi + 1;\n  EEPROM.update(0, sayi);            // yeni değeri 0. adrese yaz\n  Serial.print(\"Acilis sayisi: \");\n  Serial.println(sayi);\n}\n\nvoid loop() {\n}\n```\n\nGüç kesilip yeniden verildikçe sayı 1, 2, 3 diye artar. Laboratuvarda da böyle: ilk ▶'de \"Acilis sayisi: 1\" görürsün; ■ ile durdurup yeniden ▶'e basınca (güç kesip verme) 2, sonra 3 olur. ↺ Sıfırla'ya basarsan EEPROM boşalır ve sayaç yeniden 1'den başlar.\n\n### Yıpranma: write mi, update mi?\nEEPROM hücreleri sonsuza kadar yazılamaz. Üretici her hücre için yaklaşık **100.000 yazma** garanti eder. Bundan sonra hücre bozulabilir. Okumak ise hücreyi yıpratmaz.\n\nHesap: hedef sıcaklığı her saniye aynı hücreye yazarsan 100.000 saniye = yaklaşık 27,8 saat sonra hücre garanti sınırına ulaşır. Her dakika yazsan bile yaklaşık 69 gün yeter. Bu yüzden EEPROM'a **yalnızca değer değiştiğinde** ve mümkünse seyrek yazmalısın.\n\n- `EEPROM.write(adres, değer)` her çağrıldığında yazar, değer aynı olsa bile.\n- `EEPROM.update(adres, değer)` önce hücreyi okur; değer zaten aynıysa **hiç yazmaz**.\n\n```cpp\n// sketch: eeprom_yipranma\n#include <EEPROM.h>\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 5; i++) {\n    EEPROM.write(10, 7);     // her seferinde yazar\n  }\n  for (int i = 0; i < 5; i++) {\n    EEPROM.update(11, 7);    // yalnızca ilkinde yazar\n  }\n  Serial.print(\"10. adres: \");\n  Serial.println(EEPROM.read(10));\n  Serial.print(\"11. adres: \");\n  Serial.println(EEPROM.read(11));\n}\n\nvoid loop() {\n}\n```\n\nİki adreste de sonuç 7'dir, ama ilk döngü 5 yazma harcar, ikincisi yalnızca 1 (ilk değer 255 olduğu için). Ayrıca bir yazma işlemi yaklaşık 3-4 ms sürer; yani `update` hem hücreyi korur hem de zaman kazandırır.\n\n### Birden çok değer: put ve get\n`EEPROM.read` ve `EEPROM.write` tek bayt içindir. `int` iki bayt, `float` dört bayt kaplar. Bunları tek komutla yazmak için `EEPROM.put` ve `EEPROM.get` vardır. Bu komutlar da değer aynıysa baytı yeniden yazmaz.\n\n```cpp\n// sketch: eeprom_put_get\n#include <EEPROM.h>\n\nstruct Ayar {            // birden çok değeri bir arada tutan kutu\n  int hedef;\n  float fark;\n};\n\nvoid setup() {\n  Serial.begin(9600);\n  Ayar a = {24, 0.5};\n  EEPROM.put(20, a);     // 20. adresten itibaren yaz\n\n  Ayar b;\n  EEPROM.get(20, b);     // aynı yerden geri oku\n  Serial.print(\"hedef=\");\n  Serial.print(b.hedef);\n  Serial.print(\" fark=\");\n  Serial.println(b.fark, 1);\n}\n\nvoid loop() {\n}\n```\n\n`Ayar` 2 + 4 = 6 bayt kaplar; yani 20-25 numaralı adresler dolar. Yeni bir veri yazacaksan 26'dan başlamalısın, yoksa üstüne yazarsın.\n\n### String ve SRAM\nSRAM yalnızca 2048 bayttır. Her yazı, her dizi, her değişken buradan yer alır. `String` nesneleri kullanışlıdır (`+` ile birleştirilir) ama uzadıkça SRAM'de yer değiştirir ve belleği parçalayabilir. Kalıcı çalışacak programlarda mümkünse sabit boyutlu `char` dizileri kullan ve `String` kullanımını az tut.\n\nBir ipucu da şu: `Serial.println(\"Merhaba\")` yazısı SRAM'de yer tutar. `Serial.println(F(\"Merhaba\"))` ise yazıyı Flash'ta bırakır ve SRAM'i korur.\n\nAşağıdaki program, boş SRAM'i ölçer ve bir `String`'in ne kadar yer tuttuğunu gösterir.\n\n```cpp\n// sketch: sram_string\nextern int __heap_start, *__brkval;\n\nint bosRam() {\n  int v;\n  return (int)&v - (__brkval == 0 ? (int)&__heap_start : (int)__brkval);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(F(\"SRAM olcumu\"));\n  Serial.print(F(\"Once: \"));\n  Serial.println(bosRam());\n\n  String s = \"\";\n  for (int i = 0; i < 10; i++) {\n    s += \"0123456789\";          // her turda 10 karakter ekle (toplam 100)\n  }\n  Serial.print(F(\"Sonra: \"));\n  Serial.println(bosRam());\n  Serial.print(F(\"String uzunlugu: \"));\n  Serial.println(s.length());\n}\n\nvoid loop() {\n}\n```\n\n`bosRam()` yığın (stack) ile öbek (heap) arasındaki boşluğu hesaplar. `Sonra` değeri `Once` değerinden yaklaşık 100 küçüktür, çünkü `String` 100 karakteri SRAM'de saklar. Tam sayı kartına ve derleyiciye göre birkaç bayt oynayabilir.\n\n### Kütüphane kullanımı\nBu hafta üç kütüphane gördün: `LiquidCrystal`, `Wire`, `EEPROM`. Hepsi aynı kalıbı izler:\n1. `#include <Ad.h>` ile kütüphaneyi ekle.\n2. Gerekiyorsa bir **nesne** oluştur: `LiquidCrystal lcd(...)`. (`EEPROM` ve `Wire` için nesne hazırdır.)\n3. `nesne.komut()` biçiminde komutlarını çağır: `lcd.print()`, `Wire.begin()`, `EEPROM.read()`.\n\nLaboratuvarda bu kütüphaneler (`LiquidCrystal`, `LiquidCrystal_I2C`, `Wire`, `EEPROM`, `Servo`) hazırdır; programın başına `#include` yazman yeter, ayrıca kurulum gerekmez. Gerçek Arduino IDE'de yeni bir kütüphaneyi **Taslak > Kütüphane Ekle > Kütüphaneleri Yönet** menüsünden kurarsın; kütüphanenin **Dosya > Örnekler** altındaki hazır örnekleri, nasıl kullanılacağını gösteren en iyi kaynaktır.\n\n### Dene\n- `eeprom_sayac` programını çalıştır, ■ ile durdurup yeniden ▶'e bas; bunu üç kez yap. Sayı neden 1, 2, 3 diye arttı? Sonra ↺ Sıfırla'ya basıp yeniden çalıştır: sayı neden yine 1? Program her açılışta EEPROM'a kaç kez yazıyor?\n- `eeprom_yipranma` içinde `update` döngüsünü 1000 kez döndür. Sonuç neden hâlâ 7?\n- `sram_string` programında `String` uzunluğunu 200 karaktere çıkar. `Sonra` değeri ne kadar azalıyor?\n- Laboratuvara bir potansiyometre ve bir buton ekle. Pot ile ayarlanan değeri butona basıldığında EEPROM'a kaydet. Her döngüde kaydetsen ne olurdu?\n\n### Sık yapılan hatalar\n- EEPROM'a her `loop` turunda yazmak: hücre kısa sürede yıpranır. Yalnızca değer değiştiğinde yaz; `update` kullan.\n- Adresleri çakıştırmak: iki farklı veriyi aynı adrese yazarsan biri ötekini bozar. Hangi veri hangi adreste, bir yere not et.\n- `EEPROM.read` ile `int` okumaya çalışmak: `read` yalnızca 1 bayt döndürür. 2 baytlık değerler için `get` kullan.\n- Hiç yazılmamış hücrenin 0 olduğunu sanmak: boş hücrede 255 vardır. Okuduğun değerin geçerli olup olmadığını kontrol et.\n- Uzun ve çok sayıda `String` birleştirmek: SRAM dolabilir ve kart zamanla beklenmedik davranabilir.",
          "question": "Termostatın hedef sıcaklığını tam olarak ne zaman EEPROM'a yazmalısın? Butona her basışta mı, yoksa kullanıcı ayarı bitirdikten bir süre sonra mı? Neden?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Uno'nun üç belleğini (Flash, SRAM, EEPROM) ve her birinin ne tuttuğunu\n- Ayarı `EEPROM.read`, `update` ve `put/get` ile kalıcı saklamayı\n- Neden EEPROM'a gereksiz yazmamak gerektiğini ve ömrü hesaplamayı\n- `String` kullanımının SRAM'e etkisini\n\n### Önceden bilmen gerekenler\nDers 9'da Serial Monitor ile yazdırma; ders 7'de `if` ile karşılaştırma; ders 31'de bayt kavramı.\n\n### Üç ayrı bellek\nUno'nun beyninde üç ayrı depo vardır:\n\n| Bellek | Boyut | Ne tutar? | Güç kesilince |\n|---|---|---|---|\n| Flash | 32 KB | Programın kendisi | Kalır |\n| SRAM | 2 KB | Çalışırken değişkenler | Silinir |\n| EEPROM | 1 KB | Kalıcı ayarlar | Kalır |\n\n`int sayac`, `float sicaklik` ve `String` gibi değişkenler SRAM'dedir. Güç kesilince hepsi kaybolur. Termostatın hedef sıcaklığı gibi hatırlanması gereken veri EEPROM'a yazılır.\n\n### EEPROM'a okuma ve yazma\nEEPROM 1024 bayttır; her bayt bir **adrestedir** (0-1023). Hiç yazılmamış bir hücrede **255** bulunur.\n\n```\nbyte a = EEPROM.read(0);     // 0. adresi oku\nEEPROM.update(0, 24);        // yalnız değer farklıysa yaz\n```\n\n`read` ve `update` tek bayt içindir. Bir `byte` en çok 255 tutar; `EEPROM.write(0, 300)` yazarsan sayı 300 − 256 = 44 olarak kaydolur. İki bayttan büyük veriler için `EEPROM.put(adres, değer)` ve `EEPROM.get(adres, değer)` vardır: bir `int` 2 bayt, bir `float` 4 bayt yer tutar. Birden çok değerli bir **struct** toplam boyutu kadar adres kaplar; sonraki veriyi bunun ardından yazmalısın.\n\n### Yıpranma ve hesabı\nBir EEPROM hücresi yaklaşık **100.000** yazma ömrüne sahiptir; okumak ömrü azaltmaz. Hesap örneği: aynı hücreye her 10 saniyede bir yazarsan 100.000 × 10 = 1.000.000 saniye, yani yaklaşık 11,6 günde ömür dolar. Bu yüzden:\n- Her `loop` turunda yazma.\n- `write` yerine `update` kullan; değer zaten aynıysa hiç yazmaz.\n- Kullanıcı ayarı bitirdikten sonra bir kez yaz.\n\n### SRAM ve String\nSRAM yalnızca 2048 bayttır. Her değişken ve her `String` buradan yer alır. `String` kullanışlıdır, ancak uzun süre çalışan programda sürekli büyüyüp küçülürse SRAM'i parçalayabilir. Sabit boyutlu `char` dizisi daha güvenlidir. Metni `F(\"...\")` ile yazmak sabit yazıyı Flash'ta bırakır: `Serial.println(F(\"Merhaba\"));`.\n\n### Kütüphane kalıbı\nBu hafta üç kütüphane kullandın. Hepsi aynı kalıbı izler: `#include` ile ekle, gerekiyorsa nesne oluştur, `nesne.komut()` ile çağır. Yeni bir kütüphanenin nasıl kullanıldığını öğrenmenin en iyi yolu onun hazır örneklerine bakmaktır.\n\n### Özet\nFlash programı, SRAM çalışan değişkenleri, EEPROM ise kalıcı ayarları tutar. EEPROM'a yalnızca gerektiğinde ve `update` ile yazarsın, çünkü her hücrenin yaklaşık 100.000 yazma ömrü vardır. Boş hücrede 255 okunur; bunu geçerli bir değer sanma. SRAM küçüktür, bu yüzden `String` kullanımını dikkatli yap.",
          "concepts": [
            {
              "term": "Flash, SRAM, EEPROM",
              "definition": "Uno'nun üç belleği: Flash (32 KB) programı, SRAM (2 KB) çalışan değişkenleri, EEPROM (1 KB) kalıcı ayarları tutar. SRAM güç kesilince silinir; Flash ve EEPROM kalır.",
              "example": "Hedef sıcaklık çalışırken bir int değişkende (SRAM), güç kesilince kaybolmaması için EEPROM'da saklanır.",
              "pitfall": "Değişkenin güç kesildikten sonra da kalacağını sanmak."
            },
            {
              "term": "EEPROM.read ve EEPROM.update",
              "definition": "read, verilen adresten 1 bayt okur. update, o adrese 1 bayt yazar ama değer zaten aynıysa yazmaz.",
              "example": "EEPROM.update(0, 24); sonra EEPROM.read(0) 24 verir.",
              "pitfall": "Hiç yazılmamış hücrede 0 beklemek: boş hücrede 255 vardır."
            },
            {
              "term": "Yazma ömrü",
              "definition": "Bir EEPROM hücresi yaklaşık 100.000 yazmaya dayanır. Okumak ömrü azaltmaz.",
              "example": "Aynı hücreye her saniye yazarsan yaklaşık 27,8 saatte (100.000 saniye) ömür dolar.",
              "pitfall": "EEPROM'a her loop turunda yazmak: hücre kısa sürede bozulur."
            },
            {
              "term": "EEPROM.put ve EEPROM.get",
              "definition": "int, float ya da struct gibi birden çok baytlık veriyi tek komutla yazar ve okur. Veri kendi boyutu kadar adres kaplar.",
              "example": "int 2 bayt, float 4 bayt tutar; EEPROM.put(20, deger) ile int 20-21 adreslerine yazılır.",
              "pitfall": "Verileri aynı adrese yazıp birbirinin üstüne yazmak; her verinin adres aralığını not et."
            },
            {
              "term": "String ve SRAM",
              "definition": "String nesneleri SRAM'de yer tutar ve büyüdükçe belleği parçalayabilir. F(\"...\") ile yazılan sabit metin Flash'ta kalır.",
              "example": "Serial.println(F(\"Merhaba\")); metni SRAM'e kopyalamaz.",
              "pitfall": "Uzun süre çalışan programda sürekli String birleştirmek: SRAM dolar, kart beklenmedik davranabilir."
            }
          ],
          "quiz": [
            {
              "id": "m3h7d34-q1",
              "kind": "numeric",
              "prompt": "Bir EEPROM hücresi yaklaşık 100.000 yazma dayanıyor. Aynı hücreye her 30 saniyede bir yazıyorsun. Hücrenin ömrü yaklaşık kaç günde dolar? (Bir ondalık basamağa yuvarla.)",
              "answer": 34.7,
              "tolerance": 0.1,
              "unit": "gün",
              "explanation": "100.000 yazma × 30 saniye = 3.000.000 saniye. Bir gün 86.400 saniyedir: 3.000.000 / 86.400 ≈ 34,7 gün. 30 saniyeyi dakika sanıp 100.000 dakika hesaplamak yanlış olurdu (yaklaşık 69 gün).",
              "skills": [
                "mem-eeprom"
              ]
            },
            {
              "id": "m3h7d34-q2",
              "kind": "predict-output",
              "prompt": "EEPROM'a hiç yazılmamış; tüm hücreler boş. Bu program ne yazdırır?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  EEPROM.update(0, 12);\n  Serial.println(EEPROM.read(0));\n  Serial.println(EEPROM.read(1));\n}\n```",
              "options": [
                "12 ve 0",
                "12 ve 255",
                "12 ve 12",
                "0 ve 0"
              ],
              "answer": 1,
              "explanation": "0. adrese 12 yazıldı, bu yüzden ilk satır 12. 1. adrese hiç yazılmadı ve boş hücrede 255 vardır. Boş hücrenin 0 olduğunu sanmak sık yapılan bir hatadır.",
              "skills": [
                "mem-eeprom"
              ]
            },
            {
              "id": "m3h7d34-q3",
              "kind": "find-bug",
              "prompt": "Hedef 300 olarak yazılıyor ama geri okununca 44 çıkıyor. Neden?\n\n```\nint hedef = 300;\nEEPROM.write(0, hedef);\nint okunan = EEPROM.read(0);\nSerial.println(okunan);\n```",
              "options": [
                "write ve read yalnız 1 bayt işler; 300 bir bayta sığmaz (300 − 256 = 44)",
                "int değişken EEPROM'a yazılamaz",
                "Serial.println int yazdıramaz",
                "Adres 0 olamaz, 1'den başlamalı"
              ],
              "answer": 0,
              "explanation": "write bir bayt (en çok 255) yazar. 300 sığmadığı için 300 − 256 = 44 kaydolur. İki baytlık değerler için EEPROM.put(0, hedef) ve EEPROM.get(0, okunan) kullanılmalıdır. Adresler 0'dan başlar, println ise int yazdırabilir.",
              "skills": [
                "mem-eeprom",
                "prog-debug"
              ]
            },
            {
              "id": "m3h7d34-q4",
              "kind": "mcq",
              "prompt": "Bir akvaryum ısıtıcı kontrolünde hedef sıcaklığın güç kesilince de kalması istiyor. Hedef nasıl saklanmalı?",
              "options": [
                "Bir int değişkende; değişkenler zaten kalıcıdır",
                "SRAM'de bir String olarak",
                "Flash'a her saniye yazarak",
                "EEPROM'a, yalnızca değer değiştiğinde yazarak"
              ],
              "answer": 3,
              "explanation": "Değişkenler ve String'ler SRAM'dedir ve güç kesilince silinir. Flash'a program yüklenir; çalışırken ayar yazmak için kullanılmaz. Kalıcı ayar için EEPROM kullanılır ve ömrü korumak için yalnızca değer değişince (update) yazılır.",
              "skills": [
                "mem-eeprom",
                "mem-sram"
              ]
            },
            {
              "id": "m3h7d34-q5",
              "kind": "numeric",
              "prompt": "Aşağıdaki yapı EEPROM.put(20, k) ile yazılıyor. Bir sonraki verinin çakışmadan yazılabileceği ilk adres kaçtır?\n\n```\nstruct Kayit {\n  byte mod;\n  int hedef;\n  float fark;\n};\nKayit k;\n```",
              "answer": 27,
              "tolerance": 0,
              "explanation": "byte 1, int 2, float 4 bayt tutar: toplam 7 bayt. 20. adresten başlayınca 20-26 adresleri dolar; ilk boş adres 27'dir. 28 yazmak bir adresi boş bırakır, 26 yazmak float'ın son baytını bozar.",
              "skills": [
                "mem-eeprom",
                "bits-bytes"
              ]
            }
          ]
        },
        {
          "title": "Bitirme projesi: Termostat",
          "durationMin": 35,
          "problem": "Evdeki kombi, akvaryum ısıtıcısı, kuluçka makinesi: hepsinin içinde aynı küçük beyin var. Sıcaklığı ölçer, istenen değerle karşılaştırır, ısıtıcıyı açar ya da kapatır. Üstelik fişi çekilse de istenen sıcaklığı unutmaz. Bu modülün bitirme projesinde bu beyni sen yapacaksın.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Hafta 3:** NTC termistörle sıcaklık hesabı (A2).\n- **Hafta 5:** Röle ile açma-kapama ve histerezis (D7).\n- **Hafta 6:** `millis()` ile bloklamayan kod ve durum makinesi.\n- **Hafta 7:** I2C LCD ekran ve EEPROM'da kalıcı ayar.\n\nKullanıcı iki butonla hedef sıcaklığı ayarlar. Ölçülen sıcaklık hedefin altına düşünce röle ısıtıcıyı açar, hedefe ulaşınca kapatır. Hedef sıcaklık EEPROM'da saklanır.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Gereken parçalar: NTC (`ntc`), iki direnç (10 kΩ ve 330 Ω), iki buton, bir röle (`relay`), bir LED ve bir I2C LCD (`lcdI2c`).\n\n| Parça | Bağlantı |\n|---|---|\n| NTC termistör | 1 ucu **A2**, 2 ucu GND |\n| 10 kΩ direnç (sabit) | 1 ucu 5V, 2 ucu **A2** |\n| Buton \"artır\" | A ucu **D2**, B ucu GND |\n| Buton \"azalt\" | A ucu **D3**, B ucu GND |\n| Röle IN | **D7** (röle VCC → 5V, röle GND → GND) |\n| \"Isıtıcı\" yerine LED | Röle COM → 5V; röle NO → 330 Ω direnç → LED A; LED K → GND |\n| I2C LCD 16x2 | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND (adres 0x27) |\n\nIsıtıcı yerine LED kullanıyoruz: LED yanıyorsa \"ısıtıcı açık\" demektir. Butonlar `INPUT_PULLUP` olduğu için basılı buton `LOW` okunur. NTC'nin direnci 10 kΩ'dur (25 °C'de) ve β değeri 3950'dir; sıcaklığı NTC'yi seçip sağ panelden değiştirirsin (çalışırken de olur). Röle özelliklerinde **Tetik** \"HIGH ile çeker\" olmalı (varsayılan); \"LOW ile çeker\" seçersen programdaki `HIGH` ve `LOW` yerlerini değiştirmen gerekir. LCD adresi 0x27'den farklıysa, önceki derste öğrendiğin tarama programıyla bul. LCD, `lcd.init()` içindeki bekleme yüzünden ▶'ten yaklaşık 1,5 saniye sonra yazı gösterir.\n\nNTC ve sabit direnç bir **gerilim bölücü** oluşturur: sıcaklık arttıkça NTC'nin direnci düşer ve A2'deki gerilim azalır. NTC direncini `R = 10000 × ADC / (1023 − ADC)` formülüyle buluruz. Sıcaklığı ise β = 3950 değerli Steinhart-Hart (beta) formülüyle hesaplarız. Gerçek bir termistörün β değeri farklıysa sabiti değiştirirsin; laboratuvarın NTC'si 3950 kullanır.\n\n### Durum makinesi\nTermostatın üç durumu var:\n\n| Durum | Röle | Bu durumdan çıkış |\n|---|---|---|\n| KAPALI | Kapalı | Sıcaklık `hedef − 0,5` değerine eşit ya da daha düşükse ISITIYOR; bir butona basılırsa AYAR |\n| ISITIYOR | Açık | Sıcaklık `hedef + 0,5` değerine eşit ya da daha yüksekse KAPALI; bir butona basılırsa AYAR |\n| AYAR | Kapalı | Son buton basışından 2 saniye sonra hedef EEPROM'a yazılır, KAPALI |\n\nHedefin 0,5 derece altında ve üstünde iki ayrı eşik vardır (**histerezis**). Böylece sıcaklık hedef civarında dalgalanırken röle bir açılıp bir kapanmaz.\n\nAYAR durumunda her basış hedefi 1 derece değiştirir ve 2 saniyelik süreyi yeniden başlatır. EEPROM'a yazma, ayar bittikten sonra **bir kez** yapılır; böylece art arda 5 basış 5 yazma harcamaz.\n\n### Program\n```cpp\n// sketch: termostat\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <EEPROM.h>\n\nconst int ARTIR = 2;\nconst int AZALT = 3;\nconst int ROLE = 7;\nconst int NTC_PIN = A2;\n\nconst int ADRES = 0;                // hedef sıcaklığın EEPROM adresi\nconst int HEDEF_MIN = 10;\nconst int HEDEF_MAX = 35;\nconst int HEDEF_VARSAYILAN = 22;\nconst float HISTEREZIS = 0.5;       // hedefin altı ve üstü için pay\nconst unsigned long AYAR_SURESI = 2000;   // ms\nconst unsigned long OLCUM_ARALIGI = 500;  // ms\n\nenum Durum { KAPALI, ISITIYOR, AYAR };\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nDurum durum = KAPALI;\nint hedef;\nfloat sicaklik;\nunsigned long sonOlcum = 0;\nunsigned long ayarBasla = 0;\nunsigned long sonBasis = 0;\nbool oncekiArtir = false;\nbool oncekiAzalt = false;\n\nfloat sicaklikOku() {\n  long toplam = 0;\n  for (int i = 0; i < 8; i++) {\n    toplam += analogRead(NTC_PIN);\n  }\n  float adc = toplam / 8.0;\n  if (adc < 1.0) adc = 1.0;           // sıfıra bölmeyi önle\n  if (adc > 1022.0) adc = 1022.0;\n  float direnc = 10000.0 * adc / (1023.0 - adc);\n  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);\n  return kelvin - 273.15;\n}\n\nconst char* durumAdi() {\n  if (durum == ISITIYOR) return \"ISIT  \";\n  if (durum == AYAR) return \"AYAR  \";\n  return \"KAPALI\";\n}\n\nvoid ekranYaz() {\n  lcd.setCursor(0, 0);\n  lcd.print(\"Su an: \");\n  lcd.print(sicaklik, 1);\n  lcd.print(\" C    \");\n  lcd.setCursor(0, 1);\n  lcd.print(\"Hedef:\");\n  lcd.print(hedef);\n  lcd.print(\"C \");\n  lcd.print(durumAdi());\n}\n\nvoid setup() {\n  pinMode(ARTIR, INPUT_PULLUP);\n  pinMode(AZALT, INPUT_PULLUP);\n  pinMode(ROLE, OUTPUT);\n  digitalWrite(ROLE, LOW);\n  Serial.begin(9600);\n\n  hedef = EEPROM.read(ADRES);\n  if (hedef < HEDEF_MIN || hedef > HEDEF_MAX) {\n    hedef = HEDEF_VARSAYILAN;         // boş (255) ya da bozuk değer\n  }\n\n  lcd.init();\n  lcd.backlight();\n  sicaklik = sicaklikOku();\n  ekranYaz();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // 1) Butonlar: basıldığı an (yüksekten alçağa geçiş) bir kez işle\n  bool artirBasili = (digitalRead(ARTIR) == LOW);\n  bool azaltBasili = (digitalRead(AZALT) == LOW);\n  bool artirYeni = artirBasili && !oncekiArtir;\n  bool azaltYeni = azaltBasili && !oncekiAzalt;\n  oncekiArtir = artirBasili;\n  oncekiAzalt = azaltBasili;\n\n  if ((artirYeni || azaltYeni) && simdi - sonBasis > 50) {   // 50 ms: sıçrama önleme\n    sonBasis = simdi;\n    if (artirYeni && hedef < HEDEF_MAX) hedef++;\n    if (azaltYeni && hedef > HEDEF_MIN) hedef--;\n    durum = AYAR;                      // ayar moduna gir, 2 saniyelik süreyi başlat\n    ayarBasla = simdi;\n    ekranYaz();\n  }\n\n  // 2) Sıcaklık: yarım saniyede bir ölç\n  bool olcumZamani = false;\n  if (simdi - sonOlcum >= OLCUM_ARALIGI) {\n    sonOlcum = simdi;\n    sicaklik = sicaklikOku();\n    olcumZamani = true;\n  }\n\n  // 3) Durum makinesi\n  switch (durum) {\n    case KAPALI:\n      if (sicaklik <= hedef - HISTEREZIS) durum = ISITIYOR;\n      break;\n    case ISITIYOR:\n      if (sicaklik >= hedef + HISTEREZIS) durum = KAPALI;\n      break;\n    case AYAR:\n      if (simdi - ayarBasla >= AYAR_SURESI) {\n        EEPROM.update(ADRES, hedef);   // ayar bitti: yalnızca değiştiyse yazar\n        durum = KAPALI;\n      }\n      break;\n  }\n  digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW);\n\n  // 4) Ekran ve seri çıktı: her ölçümden sonra\n  if (olcumZamani) {\n    ekranYaz();\n    Serial.print(\"sicaklik=\");\n    Serial.print(sicaklik, 1);\n    Serial.print(\" hedef=\");\n    Serial.print(hedef);\n    Serial.print(\" role=\");\n    Serial.println(durum == ISITIYOR ? 1 : 0);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup` içinde önce EEPROM'dan hedef okunur. Hiç yazılmamış hücrede 255 vardır; bu değer 10-35 aralığının dışında olduğu için varsayılan 22 derece kullanılır.\n2. `loop` dört iş yapar ve hiçbirinde `delay` yoktur: butonlar, ölçüm, durum makinesi, ekran. Ölçüm ve ekran `millis()` ile yarım saniyede bir yapılır. Sıçrama önleme de `millis()` ile yapılır: son basıştan 50 ms geçmediyse yeni basış sayılmaz.\n3. Butonlar yalnızca **basıldığı anda** işlenir: önceki turda basılı değil, şimdi basılı ise hedef değişir. Böylece düğmeyi basılı tutmak hedefi sürekli artırmaz.\n4. Butona basılınca `AYAR` durumuna geçilir. Bu durumda röle kapalıdır; ısıtıcı, kullanıcı hedefi değiştirirken çalışmaz. 2 saniye hiçbir tuşa basılmazsa hedef EEPROM'a yazılır.\n5. `switch` ile üç durum tek bir yerde yazılmıştır. Röle çıkışı durumun doğrudan sonucudur: `digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW)`.\n6. `EEPROM.update` kullanıldığı için hedef aynı kalmışsa (örneğin artırıp geri azalttıysan) EEPROM'a hiç yazılmaz.\n\n### Dene\n- `HISTEREZIS` değerini 0,2 ve 2 yap. Röle ne kadar sık açılıp kapanıyor?\n- Hedefi sıcaklığın üstüne çıkar, sonra NTC'nin **Sıcaklık** özelliğini adım adım yükselt. Röle hangi sıcaklıkta kapanıyor?\n- Hedefi bir kez değiştir (örneğin 22 → 24), 2 saniye bekle, ■ ile durdurup yeniden ▶'e bas (güç kesip verme). Hedef 24 olarak mı açıldı? Neden? Sonra ↺ Sıfırla'ya bas ve yeniden çalıştır: hedef neden yine 22 oldu? (EEPROM güç kesilince korunur; ↺ Sıfırla EEPROM'u boşaltır, böylece `255` okunur ve varsayılan 22 kullanılır.) Bir de ayarı değiştirdikten hemen sonra (2 saniye dolmadan) ■'ya bas: yeni hedef kaydedilmiş mi?\n- Yeni bir özellik ekle: laboratuvara bir buzzer ekle (+ ucu D8, - ucu GND). Sıcaklık hedefin 5 dereceden fazla altındaysa çaldır. Hangi duruma ekleyeceksin?\n\n### Sık yapılan hatalar\n- NTC ile sabit direnci ters yerleştirmek (NTC'yi 5V'a, sabit direnci GND'ye bağlamak): sıcaklık arttıkça ölçüm düşer ya da tersine çalışır. Direnç bölücüsünü gerilim formülüyle yeniden hesapla.\n- Histerezis olmadan tek eşik kullanmak: sıcaklık eşik civarında dalgalanınca röle çok hızlı açılıp kapanır, röle bozulur.\n- EEPROM'a her buton basışında yazmak: art arda basışlar gereksiz yazma harcar. Yazmayı ayar bittikten sonra yap.\n- Hedef değerini sınırlamamak: negatif ya da çok yüksek hedefler ısıtıcıyı sürekli açık bırakabilir.\n- 255 olarak okunan boş EEPROM'u geçerli hedef sanmak.",
          "question": "Sıcaklık sensörü koptuysa ya da yanlış bağlandıysa termostatın ne yaptığını düşün: ısıtıcı sonsuza kadar açık kalır mı? Bu projeye bir güvenlik önlemi eklemek istesen ne eklerdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir termostatın ölçüm, karar ve çıkış olarak üç parçaya ayrıldığını\n- **Histerezis** ile rölenin neden bir açılıp bir kapanmadığını\n- Üç durumlu (KAPALI, ISITIYOR, AYAR) bir durum makinesini kurmayı\n- Ayarı `millis()` ile bekleyip EEPROM'a bir kez yazmayı\n\n### Önceden bilmen gerekenler\nDers 13'te NTC ile sıcaklık hesabı; ders 24'te röle ile güvenli anahtarlama; ders 27 ve 28'de `millis()` ile zamanlama ve durum makinesi; ders 33 ve 34'te I2C ekran ve EEPROM.\n\n### Sistemin üç parçası\nTermostat şu döngüyü tekrarlar: **ölç, karar ver, uygula**. Ölçüm NTC ve sabit direnç bölücüsünden gelir. A2'deki ADC değerinden NTC direnci `R = 10000 × ADC / (1023 − ADC)` ile bulunur ve β = 3950 formülü sıcaklığa çevirir. Sıcaklık yükseldikçe NTC direnci düşer, ADC değeri küçülür. Örneğin ADC = 400 yaklaşık 35,3 °C demektir. Karar durum makinesindedir. Uygulama ise D7'deki röledir.\n\n### Histerezis: iki eşik\nTek bir eşik kullanırsan (hedef 22 °C iken \"22'nin altındaysa aç, üstündeyse kapat\") sıcaklık 22 civarında dalgalandığında röle saniyede çok kez açılıp kapanır. Bu hem rölenin ömrünü bitirir hem de ısıtıcıyı yıpratır. Çözüm iki eşiktir:\n\n```\naçma eşiği   = hedef − 0,5   (22 için 21,5)\nkapama eşiği = hedef + 0,5   (22 için 22,5)\n```\n\nSıcaklık 21,5'in altına inince ısıtıcı açılır ve 22,5'e ulaşana kadar açık kalır. Aradaki 1 derecelik bölgede röle **önceki durumunu korur**. Bu aralığa histerezis denir.\n\n### Durum makinesi\n| Durum | Röle | Çıkış koşulu |\n|---|---|---|\n| KAPALI | Kapalı | sıcaklık ≤ hedef − 0,5 ise ISITIYOR; butona basılırsa AYAR |\n| ISITIYOR | Açık | sıcaklık ≥ hedef + 0,5 ise KAPALI; butona basılırsa AYAR |\n| AYAR | Kapalı | son basıştan 2 saniye sonra hedef yazılır, KAPALI |\n\nRöle çıkışı durumdan türetilir: ISITIYOR ise HIGH, değilse LOW. Böylece röleyi yanlış durumda bırakmak zorlaşır.\n\n### Ayarı kaydetmek\nHer buton basışında EEPROM'a yazarsan ayar yapmak ömrü tüketir. Bunun yerine her basışta yalnız 2 saniyelik süre yeniden başlar; süre dolunca hedef bir kez `EEPROM.update` ile yazılır. Altı basış da tek yazmaya dönüşür, hedef hiç değişmediyse hiç yazılmaz. Açılışta okunan değer 10-35 arasında değilse (örneğin boş EEPROM'daki 255) varsayılan 22 kullanılır.\n\n### Güvenlik düşüncesi\nSensör koparsa A2 pini 5 V'a çekilir ve ADC en yüksek değerine yaklaşır; program bunu çok soğuk sanır ve ısıtıcı sürekli açık kalır. Gerçek bir ısıtıcıda bu tehlikelidir. Bu yüzden \"okuma makul aralıkta mı?\" kontrolü ve yetişkin gözetimi şarttır. Bu derste ısıtıcı yerine bir LED kullanırsın.\n\n### Özet\nTermostat; NTC ölçümü, histerezisli bir durum makinesi ve röle çıkışından oluşur. İki eşik rölenin titremesini önler, `millis()` programın hiç beklememesini sağlar, EEPROM ise hedefi güç kesilince korur. Ayarı yalnız süre dolunca bir kez yazarsın ve sensör arızasını ayrıca düşünürsün.",
          "concepts": [
            {
              "term": "Histerezis",
              "definition": "Açma ve kapama için iki ayrı eşik kullanmak. Eşikler arasında sistem önceki durumunu korur.",
              "example": "Hedef 22 °C iken ısıtıcı 21,5 °C'de açılır, 22,5 °C'de kapanır.",
              "pitfall": "Tek eşik kullanmak: sıcaklık eşik civarında dalgalanınca röle çok hızlı açılıp kapanır."
            },
            {
              "term": "Durum makinesi (termostat)",
              "definition": "Sistemin her an tek bir durumda olduğu tasarım. Termostatın üç durumu KAPALI, ISITIYOR ve AYAR'dır; her durumun röle çıkışı ve çıkış koşulu belirlidir.",
              "example": "Röle çıkışı durumdan türetilir: digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW);",
              "pitfall": "Durumları if'lerle dağınık yazmak: hangi durumda röle açık kalmalı sorusu kontrolden çıkar."
            },
            {
              "term": "NTC bölücüsünden sıcaklık",
              "definition": "NTC ve sabit direnç bir gerilim bölücü kurar; ADC değerinden R = 10000 × ADC / (1023 − ADC) ile NTC direnci, β formülüyle sıcaklık bulunur. Isındıkça NTC direnci düşer.",
              "example": "ADC = 512 iken R ≈ 10 kΩ, yani yaklaşık 25 °C.",
              "pitfall": "NTC ile sabit direncin yerini değiştirmek: ölçüm tersine döner."
            },
            {
              "term": "Ayarı geciktirerek kaydetmek",
              "definition": "Kullanıcı ayarı bitirene kadar beklemek (burada son basıştan 2 saniye) ve EEPROM'a bir kez yazmak.",
              "example": "Beş kez art arda basış tek EEPROM.update çağrısıyla kaydedilir.",
              "pitfall": "Her buton basışında EEPROM'a yazmak: gereksiz yazma ömrü harcar."
            },
            {
              "term": "Varsayılan ve sınır değerleri",
              "definition": "Açılışta EEPROM'dan okunan değerin geçerli aralıkta (10-35) olup olmadığı kontrol edilir; değilse varsayılan (22) kullanılır. Butonlar da hedefi bu aralıkta tutar.",
              "example": "Boş EEPROM 255 verir; 255, 35'ten büyük olduğu için hedef 22 olur.",
              "pitfall": "255 olarak okunan boş EEPROM'u geçerli hedef sanmak: ısıtıcı sürekli açık kalır."
            }
          ],
          "quiz": [
            {
              "id": "m3h7d35-q1",
              "kind": "numeric",
              "prompt": "Termostatta A2 pininden ADC = 600 okundu. Sabit direnç 10 kΩ ve R = 10000 × ADC / (1023 − ADC) formülü kullanılıyor. NTC'nin direnci yaklaşık kaç ohmdur? (En yakın tam sayıya yuvarla.)",
              "answer": 14184,
              "tolerance": 5,
              "unit": "Ω",
              "explanation": "R = 10000 × 600 / (1023 − 600) = 6.000.000 / 423 ≈ 14.184 Ω. Direnç 10 kΩ'dan büyük olduğu için NTC 25 °C'den daha soğuktur (NTC ısındıkça direnci düşer).",
              "skills": [
                "sensor-ntc"
              ]
            },
            {
              "id": "m3h7d35-q2",
              "kind": "predict-output",
              "prompt": "Hedef 22, HISTEREZIS 0,5; durum başta KAPALI. Sıcaklık okumaları sırayla 22,0 - 21,4 - 21,8 - 22,4 - 22,6 - 22,2 geliyor. Her okumadan sonra rölenin durumu (1 = açık) nedir?\n\n```\ncase KAPALI:\n  if (sicaklik <= hedef - HISTEREZIS) durum = ISITIYOR;\n  break;\ncase ISITIYOR:\n  if (sicaklik >= hedef + HISTEREZIS) durum = KAPALI;\n  break;\n```",
              "options": [
                "1 1 1 0 0 0",
                "0 1 0 0 1 0",
                "0 1 1 1 0 1",
                "0 1 1 1 0 0"
              ],
              "answer": 3,
              "explanation": "22,0 > 21,5: KAPALI kalır (0). 21,4 ≤ 21,5: ISITIYOR (1). 21,8 ve 22,4 kapama eşiği olan 22,5'in altında: röle açık kalır (1, 1). 22,6 ≥ 22,5: KAPALI (0). 22,2 açma eşiği olan 21,5'in üstünde: kapalı kalır (0). Sonuç: 0 1 1 1 0 0.",
              "skills": [
                "ctl-hysteresis",
                "prog-fsm"
              ]
            },
            {
              "id": "m3h7d35-q3",
              "kind": "find-bug",
              "prompt": "Isıtıcı çok sık açılıp kapanıyor. Hangi satır hatalı?\n\n```\ncase KAPALI:\n  if (sicaklik <= hedef - HISTEREZIS) durum = ISITIYOR;\n  break;\ncase ISITIYOR:\n  if (sicaklik >= hedef - HISTEREZIS) durum = KAPALI;\n  break;\n```",
              "options": [
                "if (sicaklik <= hedef - HISTEREZIS) durum = ISITIYOR;",
                "if (sicaklik >= hedef - HISTEREZIS) durum = KAPALI;",
                "case KAPALI:",
                "break;"
              ],
              "answer": 1,
              "explanation": "ISITIYOR durumunun kapama eşiği hedef + HISTEREZIS olmalı. Eksi yazılırsa açma ve kapama eşiği aynı sayıya (hedef − 0,5) düşer; sıcaklık 21,5'in altına inince ısıtıcı açılır ve sıcaklık biraz yükselince hemen kapanır. Histerezisin amacı yok olur.",
              "skills": [
                "ctl-hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m3h7d35-q4",
              "kind": "mcq",
              "prompt": "Termostat çalışırken NTC'nin bağlantı teli kopuyor, yani NTC devreden çıkıyor (A2 sabit direnç üzerinden 5 V'a çekiliyor). Program sıcaklığı nasıl hesaplar ve ne olur?",
              "options": [
                "Sıcaklığı çok düşük sanar ve ısıtıcı sürekli açık kalır",
                "Sıcaklığı çok yüksek sanar ve ısıtıcı kapanır",
                "Sıcaklığı 0 °C sanar ve program durur",
                "Hiçbir şey değişmez"
              ],
              "answer": 0,
              "explanation": "A2 5 V olunca ADC en yüksek değerine (1022 civarı) ulaşır. Formül çok büyük bir direnç bulur ve sıcaklık yaklaşık -77 °C çıkar: program 'çok soğuk' sanır, röle sürekli açık kalır. Gerçek ısıtıcıda tehlikelidir; bu yüzden makul aralık kontrolü ve güvenlik sınırı eklenmelidir.",
              "skills": [
                "sensor-ntc",
                "ctl-hysteresis"
              ]
            },
            {
              "id": "m3h7d35-q5",
              "kind": "numeric",
              "prompt": "EEPROM'da hedef zaten 22 kayıtlı. Kullanıcı artır butonuna 3 kez, azalt butonuna 3 kez basıyor; her basış arasında 1 saniye var, sonra 2 saniye bekleniyor. Program ayar bittikten sonra EEPROM.update kullanıyor. EEPROM'a toplam kaç yazma yapılır?",
              "answer": 0,
              "tolerance": 0,
              "unit": "yazma",
              "explanation": "Her basış 2 saniyelik süreyi yeniden başlatır, bu yüzden AYAR yalnızca son basıştan 2 saniye sonra biter ve tek bir update çağrılır. Hedef 22 → 25 → 22 olduğundan değer EEPROM'dakiyle aynıdır; update bu durumda hiç yazmaz. Yani 0 yazma yapılır.",
              "skills": [
                "mem-eeprom",
                "prog-fsm"
              ]
            }
          ]
        }
      ]
    }
  ]
}
