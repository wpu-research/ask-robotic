// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/modul-4/ · Komut: node tools/content/build.mjs modul-4
import type { ModuleContent } from './types'

export const modul4: ModuleContent = {
  "slug": "sensorler-ve-projeler",
  "title": "Sensörler ve Projeler",
  "track": "maker",
  "position": 4,
  "minAge": 12,
  "weeks": [
    {
      "title": "Mesafe",
      "project": "Park sensörü",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. HC-SR04'ün sesin gidiş-dönüş süresiyle mesafe ölçtüğünü anlatabilir; süreden santimetreyi (süre × 0,0343 / 2) hesaplayabilir.\n2. TRIG'e doğru tetik darbesi verip `pulseIn` ile ECHO süresini zaman aşımıyla ölçebilir; `0` dönüşünü \"yankı yok\" diye yorumlar.\n3. Aykırı değerin ne olduğunu, ortalama ile medyanın farkını söyler; kayan pencereli medyan filtre yazabilir.\n4. Servo ve sensörle açı açı tarama yapıp en yakın nesnenin yönünü bulabilir.\n5. Mesafe sensörünü LED, buzzer ve I2C LCD ile birleştirerek `millis()` ile bloklamayan bir park sensörü kurabilir.\n\n### Haftanın planı\nHafta beş derstir; ilk dört ders yaklaşık 20-25 dakika, proje dersi yaklaşık 35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Ultrasonik prensip: ses, süre, mesafe | ~20 dk | Anlatımı oku, formülü elle uygula, sıcaklık tablosunu çalıştırıp yorumla, mini testi çöz. |\n| 2 | pulseIn, trig/echo ve santimetre hesabı | ~25 dk | HC-SR04'ü bağla, Mesafe değerini değiştirerek ölçümü izle, \"yankı yok\" durumunu dene. |\n| 3 | Gürültü, yansıma açısı ve medyan filtre | ~25 dk | Ortalama ve medyanı aykırı değerli dizilerde karşılaştır, kayan pencereyi canlı sensörle dene. |\n| 4 | Servo ile tarama (sonar) | ~25 dk | Servoyu ekle, taramayı çalıştır; Mesafe'yi açıya göre elle değiştirip en yakın yönü bul. |\n| 5 | Proje: Park sensörü (LED + buzzer + LCD) | ~35 dk | Davranış tablosunu oku, devreyi kur, programı çalıştır, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Modül 1-3'ten şunlar gerekir. Başlamadan kısaca kontrol et:\n- `for` döngüsü, diziler ve fonksiyon yazma (Modül 3, ders 4 ve 19).\n- `millis()` ile bloklamayan zamanlama (ders 27); projede üç iş birlikte yürür.\n- `map()` (ders 14), buzzer (ders 18), servo (ders 21) ve I2C LCD (ders 32-33).\n- Seri Monitor'a yazdırma (ders 9).\n- Ondalık sayılarla çarpma ve bölme; birim çevirme (m/s'den cm/µs'ye).\n\n### Kavram haritası\n- **Fizik:** ses → yankı → gidiş-dönüş süresi → mesafe = süre × 0,0343 / 2 → sıcaklığın ses hızına etkisi\n- **Ölçüm:** TRIG darbesi (10 µs) → ECHO süresi → `pulseIn` → zaman aşımı → `0` = yankı yok\n- **Veri kalitesi:** yansıma açısı ve yüzey → aykırı değer → ortalama / medyan → kayan pencere → filtre gecikmesi\n- **Sistem:** servo + sensör = tarama → en küçüğü tutma → eşikler → `map()` → `millis()` ile çok görev\n\n### Sık yapılan hatalar\n- **İkiye bölmeyi unutmak.** Süre gidiş + dönüş olduğu için mesafe iki kat çıkar.\n- **Birim karıştırmak.** 343 m/s değerini 0,0343 cm/µs yapmadan formüle koymak.\n- **Zaman aşımı yazmamak ve 0'ı mesafe sanmak.** Program takılır ya da \"0 cm\" sanılır; LED veya buzzer yanlış çalışır.\n- **`delay(10)` ile `delayMicroseconds(10)` karıştırmak.** Biri milisaniye, öbürü mikrosaniyedir.\n- **Ortalamayla aykırı değeri temizlediğini sanmak.** Medyan yanlışları atar, ortalama kendine katar.\n- **Pencereyi doldurmamak ya da `% N` unutmak.** Başlangıçta sıfırlar medyanı bozar, indeks diziden taşar.\n- **En yakın nesne aramasında başlangıcı 0 yapmak.** Hiçbir ölçüm 0'dan küçük olmaz.\n- **Bip için `delay()` kullanmak.** Ölçüm ve ekran bip süresince durur.\n- **LCD satırını 16 karaktere tamamlamamak.** Eski harfler ekranda kalır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Süre × 0,0343 / 2 formülünü bakmadan yaz; 1750 µs, 5830 µs ve 11660 µs için santimetreyi hesapla (yaklaşık 30, 100 ve 200 cm).\n4. `100, 100, 100, 350, 100` dizisinin ortalamasını ve medyanını kâğıtta bul; sonra iki yanlışlı bir dizi kendin yaz.\n5. Kendi cümlelerinle şunu cevapla: \"Park sensöründe pencereyi büyütünce ne kazanır, ne kaybedersin?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Park sensörü)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | HC-SR04, LED, buzzer ya da LCD eksik veya yanlış pine bağlı | Tüm parçalar doğru pinlerde (TRIG D9, ECHO D10, buzzer D8, LED D11-D13, LCD A4/A5) | Bağlantılar düzenli, buzzer türü ve LCD adresi bilinçli seçilmiş |\n| Ölçüm ve filtre | Ham ölçümle karar veriyor; yankı yok durumu işlenmemiş | Medyan filtre ve geçersiz ölçüm ele alınmış | Pencere boyunun gecikme etkisini açıklıyor, deneyle gösteriyor |\n| Eşikler ve davranış | LED, bip ya da ekran tabloyla uyuşmuyor | Dört bölge tabloya uygun çalışıyor | Sınırda titremeyi histerezisle çözmüş |\n| Zamanlama | Bip için `delay()` kullanılmış, ölçüm duruyor | Ölçüm, bip ve ekran `millis()` ile ayrı çalışıyor | Süreleri değiştirip etkisini açıklıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor ve gerçek bir arabadaki farkları sayıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta bir sensörün \"mesafeyi bilmediğini, bir süre ölçtüğünü\" anlamak ve gerçek dünyadaki ölçümün gürültülü olduğunu görmek. Formülü ezberletmek yerine \"ses gidip dönüyor, bu yüzden ikiye bölüyoruz\" sorusunu öğrencinin kendi cümleleriyle söylemesini bekle.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: \"ECHO ne kadar HIGH kalıyor?\", \"Süre gidiş mi, gidiş-dönüş mü?\", \"Yankı gelmezse ne okuyor?\", \"Bu okuma bir aykırı değer olabilir mi?\"\n- **Sanal laboratuvar ve gerçek sensör.** Laboratuvardaki sensör kusursuzdur: Mesafe özelliğine ne yazılırsa onu okur ve ses hızı sabittir. Gerçek HC-SR04 eğik yüzeylerde, yumuşak malzemelerde ve sıcaklık değişince yanlış okuyabilir; medyan filtre bu yüzden öğretilir.\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Medyan dersi ve proje yeni bir düşünce biçimi içerir; gerekirse bir gün ara ver.\n- **Güvenlik.** Servo ve motorlar gerçek devrede ayrı bir 5 V kaynaktan beslenir ve GND'ler ortak yapılır. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; pil kullanılırsa kısa devre ve ters bağlamaya dikkat edilir.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Ultrasonik prensip: ses, süre, mesafe",
          "durationMin": 20,
          "problem": "Yarasa karanlıkta duvara çarpmadan uçar. Gözüyle değil, kulağıyla görür: bir ses çıkarır, sesin duvardan dönüp gelmesini bekler. Dönüş ne kadar geç olursa duvar o kadar uzaktadır. HC-SR04 sensörü de aynı şeyi yapar. Peki \"ne kadar geç\" bilgisini santimetreye nasıl çeviririz?",
          "contentMd": "### Sensör nasıl çalışıyor?\nHC-SR04'ün iki \"gözü\" var: biri hoparlör gibi ses gönderir (T), öbürü mikrofon gibi dinler (R). Gönderdiği ses **ultrasonik**tir: insan kulağının duyamayacağı kadar yüksek frekanslı bir sestir (bu sensörde 40 kHz).\n\nBir ölçüm şöyle yürür:\n1. Kart, sensörün **TRIG** bacağına çok kısa bir HIGH darbesi verir. Bu darbe \"ölç\" komutudur.\n2. Sensör 40 kHz'lik kısa bir ses demeti yollar.\n3. Ses bir nesneye çarpıp geri döner.\n4. Sensör, yolladığı andan geri geldiği ana kadar **ECHO** bacağını HIGH tutar.\n\nYani sensör sana mesafeyi vermez. Sana bir **süre** verir: ECHO'nun HIGH kaldığı süre. Mesafeyi bu süreden biz hesaplarız.\n\n### Formül\nSes havada yaklaşık **343 m/s** hızla gider (yaklaşık 20 °C'de). Santimetre ve mikrosaniyeye çevirelim:\n\n343 m/s = 34 300 cm/s = 34 300 / 1 000 000 cm/µs = **0,0343 cm/µs**\n\nSes nesneye gider ve geri gelir. Ölçtüğümüz süre **gidiş + dönüş** süresidir. Mesafe yalnızca gidiş yoludur, bu yüzden ikiye böleriz:\n\n**mesafe (cm) = süre (µs) × 0,0343 / 2**\n\nKısa yol: 1 cm'lik mesafe gidiş dönüş yaklaşık 58 µs sürer. Süreyi 58'e bölersen de santimetreyi bulursun.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 VCC | Uno **5V** |\n| HC-SR04 TRIG | Uno **D9** |\n| HC-SR04 ECHO | Uno **D10** |\n| HC-SR04 GND | Uno **GND** |\n\nBu dersteki programlar sensöre henüz dokunmaz, yalnızca hesap yapar. Bağlantıyı şimdiden kur; 37. derste kullanacaksın. HC-SR04'ü seçince sağ panelde **Mesafe** özelliği çıkar (2-400 cm). Bu değeri devre çalışırken de değiştirebilirsin; sensör \"önündeki nesnenin\" uzaklığını buna göre ölçer. Modülün veri sayfasındaki tipik ölçüm aralığı 2 cm ile 400 cm arasındadır. Bu aralığın dışında ya da ses sensöre geri dönmeyecek şekilde yansıyorsa geçerli bir ölçüm elde edilmez.\n\nBilgi notu: ECHO'nun yankı yokken tam olarak ne yaptığı modülden modüle değişir. Bazı modüller yankı gelmezse ECHO'yu yaklaşık 38 ms boyunca HIGH tutar. 37. derste göreceğimiz 30 ms'lik zaman aşımı her iki durumu da aynı şekilde \"ölçüm yok\" (0) yapar.\n\n### Program 1: süreden mesafeye\nBeş farklı süre için formülü uygulayalım.\n\n```cpp\n// sketch: ses_mesafe_tablosu\nconst float SES_CM_US = 0.0343;   // 343 m/s = 0,0343 cm/us\nunsigned long sureler[] = {583, 2915, 5830, 11660, 23320};   // mikrosaniye\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 5; i++) {\n    float cm = sureler[i] * SES_CM_US / 2.0;\n    Serial.print(\"sure=\");\n    Serial.print(sureler[i]);\n    Serial.print(\" us -> \");\n    Serial.print(cm, 1);\n    Serial.println(\" cm\");\n  }\n}\n\nvoid loop() {\n}\n```\n\nÇıktıda 583 µs için yaklaşık 10 cm, 5830 µs için yaklaşık 100 cm, 23 320 µs için yaklaşık 400 cm görürsün. 400 cm sensörün en uzak sınırıdır: ses 4 metre gidip 4 metre döner ve bu yaklaşık 23 milisaniye sürer. Ses çok hızlı ama ışık değil: 1 metrelik ölçüm bile 5,8 milisaniye alır.\n\n### Sıcaklık ve ses hızı\n343 m/s her zaman doğru değildir. Ses hızı havanın sıcaklığına bağlıdır. Kuru havada yaklaşık değer şöyledir:\n\n**c ≈ 331,3 + 0,606 × T** (c: m/s, T: °C)\n\nSıcak havada ses daha hızlı gider, soğukta yavaş. Sensörün hesabı hep 343 m/s varsaydığı için sıcaklık değişince ölçüm kayar. Sensör, ses gerçekte 331,3 m/s ile giderken 343 m/s varsayarsa mesafeyi olduğundan büyük, ses 355 m/s ile giderken varsayarsa olduğundan küçük bulur. Aşağıdaki program, gerçek mesafesi 100 cm olan bir nesne için sıcaklığa göre ne okuyacağını hesaplar:\n\n```cpp\n// sketch: ses_sicaklik\nfloat sesHizi(float sicaklikC) {          // m/s\n  return 331.3 + 0.606 * sicaklikC;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  float sicakliklar[] = {0, 10, 20, 30, 40};\n  for (int i = 0; i < 5; i++) {\n    float c = sesHizi(sicakliklar[i]);\n    float okunan = 100.0 * 343.0 / c;     // sensör 343 m/s sanıyor\n    Serial.print(\"T=\");\n    Serial.print(sicakliklar[i], 0);\n    Serial.print(\" C  c=\");\n    Serial.print(c, 2);\n    Serial.print(\" m/s  gercek 100 cm -> \");\n    Serial.print(okunan, 1);\n    Serial.println(\" cm\");\n  }\n}\n\nvoid loop() {\n}\n```\n\nSayılarla doğrulayalım: 20 °C'de c = 331,3 + 0,606 × 20 = 343,42 m/s; bu 343'e çok yakın, hata yaklaşık 0,1 cm. 0 °C'de c = 331,3 m/s ve sensör 100 cm'yi 103,5 cm okur. 40 °C'de c = 355,54 m/s ve sensör 96,5 cm okur. Yani sıcaklık 40 derece değişince 1 metrede yaklaşık 7 cm fark oluşur. Park sensörü gibi işlerde bu fark genelde kabul edilebilir. Santimetre hassasiyeti gerekiyorsa sıcaklığı ölçüp formüle koyarsın (13. dersteki NTC işe yarar).\n\n### Nasıl çalışıyor?\n1. `SES_CM_US` ses hızını santimetre/mikrosaniye cinsinden tutar. Birim dönüşümünü tek yerde yapınca hata riski azalır.\n2. `sureler[i] * SES_CM_US / 2.0` gidiş dönüş süresini tek yönlü mesafeye çevirir. `2.0` yazdık ki bölme ondalıklı yapılsın (tam sayı bölmesi küsuratı atar).\n3. `Serial.print(cm, 1)` sayıyı virgülden sonra 1 basamakla yazar.\n4. `sesHizi` fonksiyonu sıcaklığı alıp c değerini m/s olarak döndürür. `okunan = 100 × 343 / c` oranı, sensörün yanlış varsayımının sonucudur.\n\n### Dene\n- 2 metre uzaktaki bir nesne için ECHO kaç µs HIGH kalır? Önce kendin hesapla, sonra `sureler` dizisine yazıp programla karşılaştır.\n- `sicakliklar` dizisine 35 koy. Gerçek 100 cm kaç santimetre okunur?\n- Laboratuvarda `ses_mesafe_tablosu` programını yaz ve çalıştır; seri monitörde 583, 5830 ve 23 320 µs için çıkan santimetreleri formülle karşılaştır.\n- Aynı sıcaklık hesabını 250 cm'lik bir mesafe için yap. Hata santimetre olarak büyür mü, küçülür mü?\n\n### Sık yapılan hatalar\n- `/ 2` bölmesini unutmak: mesafe iki katı çıkar, çünkü ses gidip geri gelmiştir.\n- Birimleri karıştırmak: 343 m/s değerini 343 olarak cm/µs formülüne koymak. Önce aynı birime çevir.\n- Sıcaklığın etkisini hiç bilmemek: sıcak bir günde doğru çalışan park sensörü, soğuk bir garajda birkaç santimetre kayabilir. (Laboratuvardaki HC-SR04 sabit bir ses hızıyla (yaklaşık 58 µs/cm) çalışır; bu kayma yalnızca gerçek sensörde görülür.)\n- `100 * 343 / c` yerine tam sayılarla bölmek: sonuç küsuratsız çıkar. Ondalıklı yaz (`100.0`).",
          "question": "Bir nesne sensöre 10 cm yakınsa ECHO yaklaşık kaç µs HIGH kalır? Hiçbir nesne yoksa, yani ses geri dönmezse ECHO'ya ne olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Ultrasonik sensörün sesle mesafeyi nasıl ölçtüğünü\n- HC-SR04'ün bize mesafe değil bir **süre** verdiğini\n- Süreyi santimetreye çeviren formülü ve neden ikiye bölündüğünü\n- Sıcaklığın ses hızını, dolayısıyla ölçümü nasıl kaydırdığını\n\n### Önceden bilmen gerekenler\nDers 1'de HIGH ve LOW; ders 9'da Serial Monitor'a yazdırma; ders 19'da fonksiyon yazma. Ayrıca ders 4'teki diziler ve `for` döngüsü.\n\n### Ses bir mesafe ölçer\nDağda \"hey!\" diye bağırınca yankı biraz sonra geri gelir. Yankı ne kadar geç gelirse dağ o kadar uzaktır. **HC-SR04** aynı işi insanın duyamayacağı kadar yüksek frekanslı bir sesle (**ultrasonik**, bu sensörde 40 kHz) yapar. Üzerinde iki silindir vardır: biri sesi yollar (T), öbürü dinler (R).\n\n### Dört bacak, iki iş\n| Bacak | Görevi |\n|---|---|\n| VCC, GND | Sensörün 5 V beslemesi |\n| TRIG | Karttan sensöre: \"şimdi ölç\" (kısa HIGH darbesi) |\n| ECHO | Sensörden karta: yankı gelene kadar HIGH |\n\nSensör sana santimetre söylemez. ECHO bacağı, ses çıktığı andan yankı döndüğü ana kadar HIGH kalır. Mesafeyi bu **süreden** sen hesaplarsın.\n\n### Formül\nSes havada yaklaşık 343 m/s gider. Bunu cm/µs'ye çevirelim:\n\n```\n343 m/s = 34 300 cm/s = 0,0343 cm/µs\nmesafe (cm) = süre (µs) × 0,0343 / 2\n```\n\nNeden ikiye bölüyoruz? Ölçtüğün süre **gidiş + dönüş** süresidir, mesafe ise yalnız gidiş yoludur. Örnek: ECHO 2000 µs HIGH kaldıysa 2000 × 0,0343 = 68,6; ikiye bölünce 34,3 cm. Kısa yol: 1 cm, gidiş dönüş yaklaşık 58 µs sürer; süreyi 58'e bölersen de santimetreyi bulursun.\n\n### Her şey 343 m/s değildir\nSes hızı sıcaklıkla değişir. Kuru havada yaklaşık değer:\n\n```\nc ≈ 331,3 + 0,606 × T      (c: m/s, T: °C)\n```\n\n0 °C'de c = 331,3 m/s, 40 °C'de 355,5 m/s olur. Programın hep 343 m/s varsayıyorsa, soğukta mesafeyi olduğundan **büyük**, sıcakta olduğundan **küçük** bulursun. Gerçek 100 cm, 0 °C'de yaklaşık 103,5 cm, 40 °C'de yaklaşık 96,5 cm görünür. Park sensörü için bu fark çoğu zaman kabul edilir; santimetre hassasiyeti gerekirse sıcaklığı ölçüp formüle koyarsın.\n\n### Sınırlar\nHC-SR04'ün tipik ölçüm aralığı 2 cm ile 400 cm arasındadır. 400 cm'de ses 8 metre yol alır ve bu yaklaşık 23 ms sürer. Aralığın dışında ya da ses sensöre geri dönmeyecek biçimde saçılıyorsa geçerli ölçüm olmaz.\n\n### Özet\nHC-SR04 sesin gidiş dönüş süresini ECHO bacağının HIGH kalma süresi olarak verir. Mesafe = süre × 0,0343 / 2 formülüyle bulunur; ikiye bölme, sesin yolu iki kez almasındandır. Ses hızı sıcaklığa bağlı olduğundan sabit 343 m/s varsayımı birkaç santimetre kayma yaratabilir.",
          "concepts": [
            {
              "term": "Ultrasonik ses",
              "definition": "İnsan kulağının duyamayacağı kadar yüksek frekanslı ses; HC-SR04 40 kHz kullanır.",
              "example": "Sensör 40 kHz'lik kısa bir ses demeti yollar ve yankısını dinler.",
              "pitfall": "Sensörün mesafeyi doğrudan \"bildiğini\" sanmak; o yalnızca bir süre ölçer."
            },
            {
              "term": "TRIG ve ECHO",
              "definition": "TRIG karttan sensöre \"ölç\" komutudur; ECHO sensörden karta yankı gelene kadar HIGH kalan bacaktır.",
              "example": "TRIG kısa HIGH alınca ses çıkar; ECHO yankı dönene dek HIGH tutulur.",
              "pitfall": "İki bacağın rolünü karıştırmak: TRIG'i giriş, ECHO'yu çıkış sanmak."
            },
            {
              "term": "Gidiş-dönüş süresi",
              "definition": "ECHO'nun HIGH kaldığı süre; sesin nesneye gidip geri gelmesi için geçen toplam süredir.",
              "example": "ECHO 5830 µs HIGH kaldıysa ses 5830 µs boyunca yolda olmuştur.",
              "pitfall": "Süreyi tek yön sanıp ikiye bölmeyi unutmak: mesafe iki kat çıkar."
            },
            {
              "term": "Mesafe formülü",
              "definition": "mesafe (cm) = süre (µs) × 0,0343 / 2; yaklaşık olarak süre / 58 de aynı sonucu verir.",
              "example": "2915 µs × 0,0343 / 2 yaklaşık 50 cm eder.",
              "pitfall": "343 m/s değerini birim çevirmeden cm/µs formülüne koymak."
            },
            {
              "term": "Ses hızı ve sıcaklık",
              "definition": "Ses hızı sıcaklıkla artar: c ≈ 331,3 + 0,606 × T (m/s, T: °C).",
              "example": "0 °C'de c = 331,3 m/s; sabit 343 m/s varsayan program 100 cm'yi yaklaşık 103,5 cm okur.",
              "pitfall": "Sıcaklığın etkisini hiç düşünmemek: soğuk garajda ölçüm birkaç santimetre kayabilir."
            }
          ],
          "quiz": [
            {
              "id": "m4h1d36-q1",
              "kind": "numeric",
              "prompt": "ECHO bacağı 3500 µs boyunca HIGH kaldı. Ses hızını 0,0343 cm/µs alarak nesnenin mesafesi kaç santimetredir? (En yakın tam sayıya yuvarla.)",
              "answer": 60,
              "tolerance": 0.5,
              "unit": "cm",
              "explanation": "Mesafe = 3500 × 0,0343 / 2 = 60,0 cm. 3500 × 0,0343 = 120,05 değeri gidiş-dönüş yoludur; ikiye bölmeden bırakırsan 120 cm bulursun ve bu yanlıştır.",
              "skills": [
                "sens-ultrasonic"
              ]
            },
            {
              "id": "m4h1d36-q2",
              "kind": "numeric",
              "prompt": "Nesne sensörden 150 cm uzakta. ECHO yaklaşık kaç mikrosaniye HIGH kalır? (0,0343 cm/µs ya da 58 µs/cm ile hesaplayabilirsin.)",
              "answer": 8746,
              "tolerance": 50,
              "unit": "µs",
              "explanation": "Ses 150 cm gidip 150 cm döner, toplam 300 cm yol alır. Süre = 300 / 0,0343 yaklaşık 8746 µs. Yalnız 150 cm'yi kullanırsan yarısını, yani yaklaşık 4373 µs'yi bulursun; bu gidiş-dönüşü unutmaktır.",
              "skills": [
                "sens-ultrasonic"
              ]
            },
            {
              "id": "m4h1d36-q3",
              "kind": "mcq",
              "prompt": "Süreyi santimetreye çeviren formülde sonucu neden ikiye böleriz?",
              "options": [
                "Sensör iki ayrı nesneyi aynı anda ölçer",
                "Ölçülen süre sesin gidiş ve dönüş yolunu içerir, mesafe ise yalnız gidiş yoludur",
                "Ses havada yarı hızla gider",
                "ECHO bacağı süreyi iki kat uzun gösterir"
              ],
              "answer": 1,
              "explanation": "Ses nesneye gider ve geri döner; ECHO bu iki yolun toplam süresince HIGH kalır. Nesneye uzaklık yalnız gidiş yoludur, bu yüzden ikiye bölünür. Ses hızı yarıya düşmez; sensör de süreyi kendiliğinden iki katına çıkarmaz.",
              "skills": [
                "sens-ultrasonic"
              ]
            },
            {
              "id": "m4h1d36-q4",
              "kind": "predict-output",
              "prompt": "Hava 0 °C iken nesne gerçekte 100 cm uzaktadır, ama program sensörün 343 m/s ile çalıştığını varsayıyor. Bu kod çalışınca Serial Monitor'a ne yazılır?\n\n```\nfloat c = 331.3 + 0.606 * 0;       // 0 °C\nfloat okunan = 100.0 * 343.0 / c;\nSerial.println(okunan, 1);\n```",
              "options": [
                "96.5",
                "100.0",
                "103.5",
                "106.2"
              ],
              "answer": 2,
              "explanation": "0 °C'de ses 331,3 m/s ile gider, yani 343 m/s'den yavaştır. Gerçekte ses daha geç döner ama program onu 343 m/s ile hesapladığı için mesafeyi büyük bulur: 100 × 343 / 331,3 yaklaşık 103,5. 96,5 sıcak havada (40 °C) çıkardı.",
              "skills": [
                "sens-sound-speed"
              ]
            },
            {
              "id": "m4h1d36-q5",
              "kind": "find-bug",
              "prompt": "Bir öğrenci 5830 µs'lik süreden mesafeyi hesaplamak istiyor ama sonuç santimetre değil, anlamsız bir sayı çıkıyor. Hatalı satır hangisi?\n\n```\nunsigned long sure = 5830;            // µs\nfloat cm = sure * 343.0 / 2.0;\nSerial.println(cm);\n```",
              "options": [
                "unsigned long sure = 5830;",
                "float cm = sure * 343.0 / 2.0;",
                "Serial.println(cm);"
              ],
              "answer": 1,
              "explanation": "343 m/s değeri cm/µs'ye çevrilmeden kullanılmış. Doğru çarpan 0,0343 cm/µs'dir: sure * 0.0343 / 2.0 yaklaşık 100 cm verir. Dönüşü atlayınca sonuç yaklaşık 10 000 kat büyür. Diğer iki satır doğrudur.",
              "skills": [
                "sens-ultrasonic",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "pulseIn, trig/echo ve santimetre hesabı",
          "durationMin": 25,
          "problem": "Geçen derste sensörün bize mesafeyi değil bir süre verdiğini öğrendin: ECHO bacağının kaç mikrosaniye HIGH kaldığı. Ama `loop()` saniyede binlerce tur atar. Kart, bir pinin HIGH'a çıkıp tekrar LOW'a inmesi arasındaki süreyi mikrosaniye hassasiyetiyle nasıl ölçer? Üstelik hiç yansıma gelmezse sonsuza kadar beklemez mi?",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 VCC | Uno **5V** |\n| HC-SR04 TRIG | Uno **D9** |\n| HC-SR04 ECHO | Uno **D10** |\n| HC-SR04 GND | Uno **GND** |\n| LED + 330 Ω direnç (ikinci program) | Uno **D13** → direnç **1**; direnç **2** → LED **A**; LED **K** → Uno **GND** |\n\nSensörü seçip sağ paneldeki **Mesafe** değerini değiştirerek \"nesneyi\" yaklaştırıp uzaklaştırabilirsin; bunu program çalışırken de yapabilirsin.\n\n### Ölçümün üç adımı\n1. **Tetikle:** TRIG'i 2 µs LOW tut (temiz başlangıç), sonra 10 µs HIGH yap, sonra tekrar LOW. 10 µs'lik bu darbe sensöre \"ölç\" der. Mikrosaniye bekleme için `delayMicroseconds()` kullanılır (`delay` milisaniyedir).\n2. **Süreyi ölç:** `pulseIn(pin, HIGH, zamanAsimi)` pinin HIGH olmasını bekler, HIGH kaldığı süreyi mikrosaniye olarak döndürür.\n3. **Çevir:** süre × 0,0343 / 2 = santimetre (36. ders).\n\n`pulseIn`'in üçüncü parametresi **zaman aşımıdır**: bu süre içinde darbe tamamlanmazsa `pulseIn` **0** döndürür. Nesne yoksa ya da yansıma sensöre dönmüyorsa programın sonsuza kadar takılmaması bunun sayesindedir. Biz 30 000 µs (30 ms) seçtik; bu yaklaşık 5 metreye karşılık gelir ve sensörün 4 metrelik sınırını rahatça kapsar.\n\n### Program 1: ilk ölçüm\n```cpp\n// sketch: mesafe_pulsein\nconst int TRIG = 9;\nconst int ECHO = 10;\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);       // 10 us'lik tetik darbesi\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n\n  unsigned long sure = pulseIn(ECHO, HIGH, 30000);   // us; en çok 30 ms bekle\n\n  if (sure == 0) {\n    Serial.println(\"Yansima yok (menzil disi)\");\n  } else {\n    float cm = sure * 0.0343 / 2.0;\n    Serial.print(\"sure=\");\n    Serial.print(sure);\n    Serial.print(\" us  mesafe=\");\n    Serial.print(cm, 1);\n    Serial.println(\" cm\");\n  }\n  delay(200);\n}\n```\n\n### Nasıl çalışıyor?\n1. `TRIG` çıkış, `ECHO` giriştir. Sensöre komutu kart verir, cevabı sensör verir.\n2. Üç satırlık tetik (LOW, HIGH 10 µs, LOW) sensörü ölçüme başlatır. Sensör kendi içinde ses demetini yollar ve ECHO'yu yükseltir.\n3. `pulseIn(ECHO, HIGH, 30000)` ECHO'nun HIGH kalma süresini döndürür. Tipik bir 100 cm'lik ölçümde bu yaklaşık 5800 µs'dir.\n4. `sure == 0` ise yansıma gelmemiştir. 0'ı mesafe gibi hesaplamak \"0 cm\" yazdırırdı; bu yanlış olurdu.\n5. `delay(200)` ölçümler arasına bekleme koyar. Önceki ölçümün yankısı bitmeden yenisini başlatmamak için ölçümler arasında bekleme bırakılır; veri sayfaları genelde ölçümler arasında yaklaşık 60 ms önerir.\n\n`pulseIn` **bloklayıcıdır**: ölçüm bitene kadar program başka bir şey yapmaz. 100 cm'de 6 ms sürer, ama yansıma yoksa tam 30 ms bekler. 27. dersteki `millis()` düşüncesini hatırla: ölçümü sık yaparsan butonlara ve ekrana ayrılan zaman azalır. Bu yüzden ölçümü bir fonksiyona koyup `millis()` ile belirli aralıklarla çağıracağız.\n\nSüre değişkeninin türü önemlidir: `pulseIn` `unsigned long` döndürür. `int` kullanırsan 32 767 µs'de taşar ve büyük mesafeler eksi sayı olur.\n\n### Program 2: fonksiyon ve LED\nÖlçümü `mesafeOku()` adlı bir fonksiyona taşıyalım. Yansıma yoksa `-1` döndürsün. Ana program her 100 ms'de bir ölçsün ve 30 cm'den yakınsa LED yansın.\n\n```cpp\n// sketch: mesafe_fonksiyon_led\nconst int TRIG = 9;\nconst int ECHO = 10;\nconst int LED = 13;\nconst unsigned long OLCUM_ARALIGI = 100;   // ms\n\nunsigned long sonOlcum = 0;\n\nfloat mesafeOku() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return -1;                 // yansıma yok\n  return sure * 0.0343 / 2.0;\n}\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (simdi - sonOlcum >= OLCUM_ARALIGI) {\n    sonOlcum = simdi;\n    float cm = mesafeOku();\n    digitalWrite(LED, cm >= 0 && cm < 30);  // yakın ve geçerli ölçüm\n    Serial.println(cm);\n  }\n}\n```\n\n`cm >= 0 && cm < 30` koşulu, `-1` (yansıma yok) değerinin \"30'dan küçük\" sayılıp LED'i yakmasını engeller. Bu küçük detay park sensörü gibi güvenlik işlerinde hayati olabilir.\n\n### Hazır kütüphane: NewPing\nBu işi senin yerine yapan bir kütüphane de var: **NewPing**. TRIG ve ECHO pinlerini ve en büyük mesafeyi söyleyip `ping()` dersin; o da süreyi mikrosaniye olarak döndürür (yansıma yoksa 0).\n\n```cpp\n// sketch: newping_ornek\n#include <NewPing.h>\n\nNewPing sonar(9, 10, 400);   // TRIG, ECHO, en büyük mesafe (cm)\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  delay(100);\n  unsigned int sure = sonar.ping();          // us; yansıma yoksa 0\n  Serial.print(\"sure=\");\n  Serial.print(sure);\n  Serial.print(\" us  mesafe=\");\n  Serial.print(sure * 0.0343 / 2.0, 1);\n  Serial.println(\" cm\");\n}\n```\n\nNewPing'in `ping_cm()` fonksiyonu doğrudan tam santimetre verir; kendi içindeki sabit 1 cm için 57 µs aldığından sonucu bizim 0,0343 formülümüzden birkaç yüzde farklı çıkabilir (laboratuvarda 100 cm'lik bir mesafe için `ping_cm()` 102 verdi). Bu modülde `pulseIn` ile devam edeceğiz, çünkü süre, tetik ve çeviri adımlarını görmek asıl amaç. Kütüphane işi kısaltır ama içinde ne olduğunu bilmek senin işin.\n\n### Dene\n- `mesafe_pulsein` programı çalışırken özellik panelinden Mesafe'yi önce 5 cm, sonra en düşük değer olan 2 cm yap. Okuma doğru mu? Veri sayfasına göre 2 cm'den yakın nesneler ölçülemez; panel de zaten 2 cm'nin altına inmez.\n- \"Yansıma yok\" durumunu görmek için programı ■ ile durdur, ECHO kablosunu sil ve yeniden ▶'e bas. Ne yazıyor? Zaman aşımı olmasaydı ne olurdu?\n- `delay(200)` yerine `delay(20)` yaz. Laboratuvarda ölçüm değişiyor mu? Gerçek sensörde ölçümler arasındaki bekleme neden önemlidir? (Önceki ölçümün yankısı sönmeden yenisi başlarsa ikisi karışabilir.)\n- `mesafe_fonksiyon_led` programında LED'in yanma eşiğini 15 cm yap. Sonra eşiği dışarıdan değiştirebilmek için bir sabit olarak yaz.\n\n### Sık yapılan hatalar\n- Zaman aşımı koymamak: `pulseIn(ECHO, HIGH)` varsayılan olarak 1 saniye bekler; yansıma yoksa program takılmış gibi görünür.\n- Tetik darbesini çok kısa ya da çok uzun vermek: sensör ölçüm yapmayabilir. 10 µs'ye uy.\n- `sure == 0` durumunu kontrol etmemek: mesafe \"0 cm\" görünür ve LED ya da buzzer yanlış davranır.\n- `sure` için `int` kullanmak: 32 767 µs üstü taşar.\n- TRIG ile ECHO'nun yerini değiştirmek: hiçbir ölçüm gelmez, hep 0 okursun.\n- ECHO'yu doğrudan 3,3 V'luk bir karta bağlamak: HC-SR04'ün ECHO çıkışı 5 V'tur. Uno'da sorun yok, ama farklı kartlara geçersen gerilim bölücü gerekir.",
          "question": "`pulseIn` bir ölçüm sırasında programı bekletiyor. Aynı programda bir butonu ve ekranı da yönetmen gerekseydi ölçümü nasıl yapardın? Ölçümü daha seyrek yapmanın bedeli ne olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- TRIG bacağına doğru tetik darbesinin nasıl verildiğini\n- `pulseIn()` ile bir pinin HIGH kaldığı süreyi ölçmeyi\n- Zaman aşımının neden gerekli olduğunu ve `0` dönüşünü yorumlamayı\n- Ölçümü bir fonksiyona koyup geçersiz ölçümü ayırt etmeyi\n\n### Önceden bilmen gerekenler\nDers 36'daki mesafe formülü (süre × 0,0343 / 2); ders 3'te `pinMode`, ders 6'da `digitalRead`; ders 19'da fonksiyonlar; ders 27'de `millis()`.\n\n### Üç adımda bir ölçüm\n1. **Tetikle.** TRIG'i 2 µs LOW tut, 10 µs HIGH yap, tekrar LOW'a çek. Mikrosaniye bekleme için `delayMicroseconds()` kullanılır; `delay()` milisaniyedir ve burada çok yavaştır.\n2. **Süreyi ölç.** ECHO'nun HIGH kaldığı süreyi mikrosaniye olarak okursun.\n3. **Çevir.** Süreyi santimetreye çevirirsin (ders 36).\n\n```\ndigitalWrite(TRIG, LOW);\ndelayMicroseconds(2);\ndigitalWrite(TRIG, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(TRIG, LOW);\nunsigned long sure = pulseIn(ECHO, HIGH, 30000);\n```\n\n### pulseIn nasıl çalışır?\n`pulseIn(pin, HIGH, zamanAsimi)` pinin HIGH olmasını bekler, sonra tekrar LOW olana kadar geçen süreyi mikrosaniye olarak döndürür. Üçüncü parametre **zaman aşımıdır** (µs). Bu süre içinde darbe tamamlanmazsa fonksiyon `0` döndürür. Zaman aşımı yazmazsan varsayılan değer 1 saniyedir: yankı gelmezse program bir saniye takılır.\n\n30 000 µs seçmek yaklaşık 514 cm'ye karşılık gelir (30 000 × 0,0343 / 2); sensörün 400 cm sınırını kapsar.\n\n### Sıfır bir mesafe değildir\n`pulseIn` 0 döndürdüyse yankı gelmemiştir. Bunu formüle sokarsan \"0 cm\" çıkar ve program nesne sensörün üstündeymiş gibi davranır. Bu yüzden önce `sure == 0` denetlenir:\n\n```\nif (sure == 0) return -1;            // geçersiz ölçüm\nreturn sure * 0.0343 / 2.0;\n```\n\nArdından `cm >= 0 && cm < 30` gibi bir koşul geçersiz ölçümü \"yakın\" saymaz.\n\n### Tür ve bekleme\n`pulseIn` bir `unsigned long` döndürür; değişkeni de bu türde tut. Ölçümler arasında bir bekleme bırakılır; veri sayfaları genelde yaklaşık 60 ms önerir, böylece önceki ölçümün yankısı yenisine karışmaz.\n\n### Bloklama bedeli\n`pulseIn` ölçüm bitene kadar programı bekletir. 100 cm'de bu yaklaşık 6 ms'dir, yankı yoksa tam zaman aşımı kadar: 30 ms. Butona, ekrana ya da buzzera bakacak başka işin varsa ölçümü seyrek yap ve `millis()` ile zamanla (ders 27).\n\n### Özet\nÖlçüm için TRIG'e 10 µs'lik darbe verilir, `pulseIn` ECHO süresini mikrosaniye olarak döndürür. Zaman aşımı programın takılmasını önler; dönüşü 0 ise yankı yoktur ve mesafe diye kullanılmamalıdır. Ölçüm bloklayıcıdır, bu yüzden sıklığı bilinçle seçilir.",
          "concepts": [
            {
              "term": "Tetik darbesi",
              "definition": "TRIG bacağına verilen kısa HIGH darbesi (10 µs); sensöre ölçüme başlamasını söyler.",
              "example": "LOW (2 µs), HIGH (10 µs), LOW sırası sensörü tetikler.",
              "pitfall": "Darbeyi çok kısa ya da yanlış bacağa vermek: sensör ölçmez ve hep 0 okursun."
            },
            {
              "term": "delayMicroseconds()",
              "definition": "Programı verilen mikrosaniye kadar bekletir; delay() ise milisaniyeyle çalışır.",
              "example": "delayMicroseconds(10); tam 10 µs bekler.",
              "pitfall": "delay(10) yazıp 10 µs sanmak: bu 10 milisaniyedir, bin kat uzundur."
            },
            {
              "term": "pulseIn()",
              "definition": "Bir pinin HIGH (ya da LOW) kaldığı süreyi mikrosaniye olarak ölçer ve döndürür.",
              "example": "pulseIn(ECHO, HIGH, 30000) ECHO'nun HIGH kalma süresini verir.",
              "pitfall": "Dönen sayıyı santimetre sanmak: bu bir süredir, formülle çevrilmelidir."
            },
            {
              "term": "Zaman aşımı",
              "definition": "pulseIn'in en çok ne kadar bekleyeceğini belirleyen üçüncü parametre; darbe bu sürede bitmezse 0 döner.",
              "example": "30000 µs yaklaşık 514 cm'ye karşılık gelir; 400 cm sınırını kapsar.",
              "pitfall": "Zaman aşımı yazmamak: varsayılan 1 saniyedir, yankı yoksa program takılmış gibi görünür."
            },
            {
              "term": "Geçersiz ölçüm (0)",
              "definition": "pulseIn 0 döndürdüyse yankı gelmemiştir; bu 0 cm demek değildir.",
              "example": "sure == 0 ise mesafeOku() -1 döndürür ve LED yanmaz.",
              "pitfall": "0'ı formüle sokmak: mesafe 0 cm çıkar, LED ya da buzzer yanlış davranır."
            }
          ],
          "quiz": [
            {
              "id": "m4h1d37-q1",
              "kind": "mcq",
              "prompt": "pulseIn(ECHO, HIGH, 30000) çağrısında 30 ms dolduğu halde ECHO hiç HIGH olup bitmediyse fonksiyon ne döndürür?",
              "options": [
                "30000",
                "-1",
                "0",
                "Program sonsuza kadar bekler"
              ],
              "answer": 2,
              "explanation": "Zaman aşımı dolunca pulseIn 0 döndürür; bu \"ölçüm yok\" demektir. 30000 değildir, -1 de değildir. Program sonsuza kadar da beklemez; zaman aşımının amacı zaten bunu önlemektir.",
              "skills": [
                "sens-pulsein"
              ]
            },
            {
              "id": "m4h1d37-q2",
              "kind": "numeric",
              "prompt": "pulseIn için 30000 µs zaman aşımı seçildi. Sesin 0,0343 cm/µs hızıyla gidip dönebileceği en uzak mesafe yaklaşık kaç santimetredir?",
              "answer": 514.5,
              "tolerance": 5,
              "unit": "cm",
              "explanation": "Gidiş-dönüş süresi 30000 µs ise tek yön mesafe = 30000 × 0,0343 / 2 = 514,5 cm. Bu, sensörün 400 cm sınırının üstündedir; böylece geçerli bütün ölçümler zaman aşımına takılmaz.",
              "skills": [
                "sens-pulsein",
                "sens-ultrasonic"
              ]
            },
            {
              "id": "m4h1d37-q3",
              "kind": "find-bug",
              "prompt": "Bu kod, nesne 30 cm'den yakınsa LED'i yakıyor. Sensörün önü boşken (yankı yokken) LED yanıyor. Neden?\n\n```\nunsigned long sure = pulseIn(ECHO, HIGH, 30000);\nfloat cm = sure * 0.0343 / 2.0;\ndigitalWrite(LED, cm < 30);\n```",
              "options": [
                "Zaman aşımı olan 30000 çok küçük",
                "sure 0 olunca cm de 0 çıkar ve 0 < 30 doğru sayılır; yankı yok durumu denetlenmiyor",
                "LED pini çıkış yapılmamış olmalı",
                "0.0343 yerine 0.343 yazılmalı"
              ],
              "answer": 1,
              "explanation": "Yankı gelmezse pulseIn 0 döndürür. Formül 0 cm üretir ve cm < 30 koşulu doğru olur. Çözüm: sure == 0 durumunu ayrı ele almak. Zaman aşımı değeri yeterlidir; sorun sabitte ya da LED pininde değil.",
              "skills": [
                "sens-pulsein",
                "prog-debug"
              ]
            },
            {
              "id": "m4h1d37-q4",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca Serial Monitor'a ne yazılır?\n\n```\nunsigned long sure = 4372;   // µs\nSerial.println(sure * 0.0343 / 2.0, 1);\n```",
              "options": [
                "150.0",
                "37.5",
                "74.9",
                "75.0"
              ],
              "answer": 3,
              "explanation": "4372 × 0,0343 = 149,96; ikiye bölünce 74,98. println bir ondalık basamağa yuvarlar: 75.0. 150.0 ikiye bölmeyi unutmaktır. 74.9 yuvarlamak yerine kesmek olurdu; Arduino yuvarlar.",
              "skills": [
                "sens-pulsein",
                "sens-ultrasonic"
              ]
            },
            {
              "id": "m4h1d37-q5",
              "kind": "numeric",
              "prompt": "Bir program her 100 ms'de bir ölçüm yapıyor. Önünde nesne olmadığı için pulseIn zaman aşımına (30 ms) kadar bekliyor. Bu 100 ms'lik turun yüzde kaçında program ölçüm beklemekle meşgul?",
              "answer": 30,
              "tolerance": 0,
              "unit": "%",
              "explanation": "pulseIn bloklayıcıdır: 30 ms boyunca program başka iş yapamaz. 30 / 100 = %30. Bu yüzden ölçümler millis() ile seyrek yapılır ve çok iş varsa süre bilinçle seçilir.",
              "skills": [
                "prog-nonblocking",
                "sens-pulsein"
              ]
            }
          ]
        },
        {
          "title": "Gürültü, yansıma açısı ve medyan filtre",
          "durationMin": 25,
          "problem": "Park sensörü arkandaki duvara 100 cm gösteriyor. Bir an sonra ekranda 350 yanıp sönüyor, sonra yine 100. Duvar bir anda 2,5 metre uzağa gitmedi. Sensör bir kez yanlış ölçtü. Eğer sensörün her okuması arabayı frenletecek ya da bırakacak kadar önemliyse bu tek yanlış okumayı nasıl yok sayarız?",
          "contentMd": "### Yanlış ölçüm nereden gelir?\nSes, bir top gibi sekip geri gelir. Bu yüzden ölçüm nesnenin **yüzeyine ve açısına** bağlıdır:\n- **Yüzeye dik, düz nesne** sesi doğrudan sensöre geri yollar: en iyi ölçüm.\n- **Eğik yüzey** sesi yana yansıtır. Ya yankı hiç dönmez (`pulseIn` 0 verir) ya da ses odadaki başka bir yüzeye çarpıp dolaylı yoldan döner ve mesafe olduğundan büyük görünür. Bu açı sınırı sensöre ve nesneye göre değişir; veri sayfasında ölçüm açısı için tipik bir değer yazar.\n- **Yumuşak ve tüylü yüzeyler** (kumaş, sünger, kazak) sesi büyük ölçüde soğurur; yankı zayıflar.\n- **Çok ince ya da çok küçük nesneler** (kablo, sandalye bacağı) sesin az bir kısmını geri yollar.\n- **Elektriksel gürültü:** motor ya da servo aynı güçten besleniyorsa gerilim çökmeleri sensörün zamanlamasını bozabilir.\n- **Başka sensörler:** iki ultrasonik sensör aynı anda ölçerse biri diğerinin sesini duyabilir.\n\nSonuç: sensör çoğu zaman doğru ölçer, ama arada bir **aykırı değer** (outlier) verir: komşularından çok farklı tek bir okuma. Bunu temizlemenin ilk akla gelen yolu ortalama almaktır. Görelim, işe yarıyor mu.\n\n### Ortalama mı, medyan mı?\n**Ortalama:** tüm değerleri toplayıp sayıya böl. **Medyan:** değerleri küçükten büyüğe sırala, ortadakini al.\n\nBeş okuma: 100, 100, 100, 350, 100.\n- Ortalama: (100 + 100 + 100 + 350 + 100) / 5 = **150**. Tek bir yanlış okuma sonucu 50 cm bozdu.\n- Medyan: sırala → 100, 100, 100, 100, 350 → ortadaki (3.) değer = **100**. Aykırı değer sıralamanın ucuna gitti ve hiç seçilmedi.\n\nBu program iki fonksiyonu aynı dizilere uygular. Fonksiyonlara dizi verirken dizinin kendisini ve eleman sayısını ayrı ayrı veririz (`float a[], int n`).\n\n```cpp\n// sketch: ortalama_medyan_dizi\nfloat ortalama(float a[], int n) {\n  float toplam = 0;\n  for (int i = 0; i < n; i++) toplam += a[i];\n  return toplam / n;\n}\n\nfloat medyan(float a[], int n) {\n  float b[9];                          // kopya (en çok 9 eleman)\n  for (int i = 0; i < n; i++) b[i] = a[i];\n  for (int i = 1; i < n; i++) {        // ekleme sıralaması\n    float x = b[i];\n    int j = i - 1;\n    while (j >= 0 && b[j] > x) {\n      b[j + 1] = b[j];\n      j--;\n    }\n    b[j + 1] = x;\n  }\n  return b[n / 2];                     // ortadaki\n}\n\nvoid raporla(const char* ad, float a[], int n) {\n  Serial.print(ad);\n  Serial.print(\" ortalama=\");\n  Serial.print(ortalama(a, n), 1);\n  Serial.print(\" medyan=\");\n  Serial.println(medyan(a, n), 1);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  float temiz[5] = {100, 101, 99, 100, 100};\n  float bir[5]   = {100, 100, 100, 350, 100};\n  float iki[5]   = {100, 350, 100, 350, 100};\n  float uc[5]    = {100, 350, 350, 350, 100};\n  raporla(\"temiz\", temiz, 5);\n  raporla(\"bir aykiri\", bir, 5);\n  raporla(\"iki aykiri\", iki, 5);\n  raporla(\"uc aykiri\", uc, 5);\n}\n\nvoid loop() {\n}\n```\n\nÇıktıyı oku: tek aykırı değerde ortalama 150, medyan 100. İki aykırı değerde ortalama 200, medyan hâlâ 100. Üç aykırı değerde ise medyan da yanılır (350), çünkü beş değerin üçü yanlış ve ortadaki yanlış çıkar. Kural: **N elemanlı pencerede medyan en çok (N−1)/2 aykırı değeri atar.** Beşlik pencere iki yanlışı affeder.\n\n### Canlı sensörle kayan medyan\nGerçek sistemde okumalar tek seferde gelmez; sürekli akar. Son 5 okumayı bir **kayan pencerede** tutarız: yeni okuma gelince en eskisi çıkar. Her seferinde pencerenin ortalamasını ve medyanını hesaplarız.\n\nDevre (hafta boyunca aynı). Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 VCC | Uno **5V** |\n| HC-SR04 GND | Uno **GND** |\n| HC-SR04 TRIG | Uno **D9** |\n| HC-SR04 ECHO | Uno **D10** |\n\nLaboratuvardaki sensör kusursuz ölçer: Mesafe özelliğine ne yazarsan onu okur. Aykırı değeri sen üretirsin: program çalışırken Mesafe değerini kısa süre 350 cm yapıp geri alırsın. Program 55 ms'de bir ölçtüğü için bu kadar kısa bir sıçrama üretmek zordur; denemek için `delay(50)` değerini geçici olarak `delay(400)` yap. Sıçramayı yarım saniyeden kısa tutarsan pencereye yalnız 1-2 yanlış ölçüm girer.\n\n```cpp\n// sketch: medyan_kayan\nconst int TRIG = 9;\nconst int ECHO = 10;\nconst int N = 5;                      // pencere boyu (tek sayı)\nconst float MENZIL = 400.0;           // yankı yoksa \"uzak\" say\n\nfloat pencere[N];\nint sira = 0;\n\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return MENZIL;       // yankı yok: yansıma kaçtı ya da çok uzak\n  float cm = sure * 0.0343 / 2.0;\n  return cm > MENZIL ? MENZIL : cm;\n}\n\nfloat ortalama(float a[], int n) {\n  float toplam = 0;\n  for (int i = 0; i < n; i++) toplam += a[i];\n  return toplam / n;\n}\n\nfloat medyan(float a[], int n) {\n  float b[N];\n  for (int i = 0; i < n; i++) b[i] = a[i];\n  for (int i = 1; i < n; i++) {\n    float x = b[i];\n    int j = i - 1;\n    while (j >= 0 && b[j] > x) {\n      b[j + 1] = b[j];\n      j--;\n    }\n    b[j + 1] = x;\n  }\n  return b[n / 2];\n}\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n  float ilk = tekOlcum();\n  for (int i = 0; i < N; i++) pencere[i] = ilk;   // pencereyi ilk okumayla doldur\n}\n\nvoid loop() {\n  float ham = tekOlcum();\n  pencere[sira] = ham;                // en eski değerin yerine yaz\n  sira = (sira + 1) % N;              // 0,1,2,3,4,0,1,... döner\n\n  Serial.print(\"ham=\");\n  Serial.print(ham, 1);\n  Serial.print(\" ort=\");\n  Serial.print(ortalama(pencere, N), 1);\n  Serial.print(\" med=\");\n  Serial.println(medyan(pencere, N), 1);\n  delay(50);\n}\n```\n\n### Nasıl çalışıyor?\n1. `pencere[N]` son N okumayı tutar. `sira` bir sonraki yazılacak yerdir; `(sira + 1) % N` onu 4'ten sonra tekrar 0'a döndürür.\n2. `setup` pencereyi ilk okumayla doldurur; yoksa ilk saniyelerde pencere sıfırlarla dolu olur ve medyan 0'a yakın çıkardı.\n3. `tekOlcum` yankı yoksa 400 döndürür. Bu bilerek yapıldı: eğik yüzeyde sesin kaçması \"çok uzak\" gibi görünür. Medyan bu değeri de bir aykırı değer olarak atar.\n4. `medyan` önce pencereyi kopyalar, kopyayı sıralar, ortadakini döndürür. Asıl pencere sırasını korur; kopyalamasaydık \"en eski değer hangisi\" bilgisini kaybederdik.\n\n### Bedel: gecikme\nMedyan filtre bedava değildir. Mesafe gerçekten 100 cm'den 50 cm'e düşerse filtre çıkışı hemen 50 vermez: pencerede 3 tane 50 birikene kadar medyan 100'de kalır. Beş elemanlı pencerede bu 3 ölçüm, yani burada yaklaşık 3 × 55 ms ≈ 165 ms gecikme demektir. Pencereyi büyütürsen gürültüye dayanıklı olursun ama gecikme artar. Pencereyi küçültürsen hızlı olursun ama yanlışları daha az atarsın.\n\nNewPing kütüphanesi de aynı fikri sunar: `sonar.ping_median(5)` beş ölçüm yapar ve ortadaki süreyi mikrosaniye olarak döndürür. Biz kendi filtremizi yazdık ki mantığı bilelim.\n\n### Dene\n- `medyan_kayan` programında `N = 3` ve `N = 7` dene. Aykırı değer atma gücü ve gecikme nasıl değişiyor? Önce tahmin yaz, sonra hesapla.\n- `ortalama_medyan_dizi` dizilerine kendi uydurduğun değerleri yaz. Hangi dizide ortalama ile medyan en çok ayrılıyor?\n- `medyan_kayan` içinde `delay(50)` yerine `delay(400)` yaz. Çalışırken Mesafe'yi yarım saniyeliğine 350 cm yapıp geri al, sonra 100 cm'den 50 cm'e kalıcı olarak indir. Seri monitörde `ort` ve `med` sütunları iki durumda nasıl davranıyor?\n- Ortalamanın da işe yaradığı bir durum düşün: okumalar 100 ± 1 cm gibi küçük dalgalanmalarsa hangisi daha pürüzsüz çıkar? Dizileri deneyerek bak.\n\n### Sık yapılan hatalar\n- Pencereyi ilk okumayla doldurmamak: başlangıçta sıfırlar medyanı bozar.\n- Pencere boyunu çift seçmek: ortadaki değer belirsiz olur. Tek sayı (3, 5, 7) kullan.\n- Sıralamadan önce diziyi kopyalamamak: pencerenin sırası bozulur, hangi elemanın en eski olduğunu bilemezsin.\n- `pulseIn` 0 döndüğünde 0'ı mesafe sanmak: \"0 cm\" okuma, medyanın tam ortasına düşebilir ve sonucu bozar.\n- Medyanla her sorunun çözüldüğünü sanmak: yanlış okumalar pencerenin yarısından fazlaysa medyan da yanılır. Asıl nedeni (açı, yüzey, güç gürültüsü) gider.",
          "question": "Park sensöründe pencere boyunu 5'ten 15'e çıkarsan ekran çok kararlı olur ama araba hızlı yaklaşırken ne olur? Gürültü ile gecikme arasında bir denge kurmanın doğru yeri nasıl belirlenir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Mesafe sensörünün neden bazen yanlış okuduğunu\n- Aykırı değerin ne olduğunu\n- Ortalama ile **medyan** arasındaki farkı ve medyanın neden dayanıklı olduğunu\n- Kayan pencerede son N okumayı tutmayı ve filtrenin gecikme bedelini\n\n### Önceden bilmen gerekenler\nDers 37'deki `pulseIn` ölçümü ve geçersiz ölçüm (0) kuralı; ders 4'te diziler ve `for`; ders 14'te yumuşatma fikri; ders 19'da dizi parametreli fonksiyonlar.\n\n### Yanlış okuma nereden gelir?\nSes sekip döner; sonuç yüzeye bağlıdır. Dik, düz bir duvar sesi sensöre geri yollar. Eğik bir yüzey sesi yana kaçırır: yankı ya hiç gelmez ya da başka bir yüzeyden dolaşıp geç gelir. Kumaş ve sünger sesi yutar. Çok ince nesneler (kablo, sandalye bacağı) çok az yansıtır. Aynı hattan beslenen bir motor gerilimi çökertirse ölçüm de bozulabilir. Sonuçta çoğunlukla doğru ölçen bir sensör arada bir komşularından çok farklı bir değer verir: **aykırı değer**.\n\n### Ortalama mı, medyan mı?\n**Ortalama** tüm değerleri toplar ve sayıya böler. **Medyan** değerleri sıralar, ortadakini seçer. Beş okuma: 100, 100, 100, 350, 100.\n\n```\nortalama = (100+100+100+350+100) / 5 = 150\nmedyan   : 100,100,100,100,350  ->  ortadaki = 100\n```\n\nTek yanlış değer ortalamayı 50 cm bozdu, medyanı hiç etkilemedi; çünkü aykırı değer sıralamanın ucuna gider ve seçilmez. Kural: N elemanlı pencerede medyan en çok (N − 1) / 2 aykırı değeri affeder. Beşlik pencere 2, yedilik 3 yanlışa dayanır. Yanlışlar yarıyı geçerse medyan da yanılır.\n\n### Kayan pencere\nOkumalar akıp gider, son N tanesini saklarsın. Yeni okuma gelince en eskisinin yerine yazılır:\n\n```\npencere[sira] = yeniOkuma;\nsira = (sira + 1) % N;      // 0,1,2,3,4,0,1,...\n```\n\n`% N` indeksin diziden taşmasını önler. Pencere programın başında ilk okumayla doldurulmalıdır; yoksa başlangıçta sıfırlar medyanı bozar. Medyanı alırken diziyi önce **kopyalayıp** kopyayı sıralarsın; asıl pencerenin sırası, hangi değerin en eski olduğunu göstermeye devam eder.\n\n### Bedel: gecikme\nMesafe gerçekten 100 cm'den 50 cm'e düşerse beş elemanlı medyan, pencerede 3 tane yeni değer birikene kadar eski değerde kalır. Ölçüm 55 ms'de bir yapılıyorsa bu yaklaşık 165 ms demektir. Pencere büyüdükçe dayanıklılık artar ama tepki yavaşlar. Pencere boyu **tek** seçilir; çift olursa ortadaki belirsizdir.\n\n### Özet\nSensörler arada aykırı değer üretir. Ortalama bunu kendine katar, medyan ise atar. Kayan pencere ve `% N` ile son N okuma tutulur; medyan en çok (N − 1) / 2 yanlışı affeder. Bunun bedeli, gerçek değişime geç tepki vermektir.",
          "concepts": [
            {
              "term": "Aykırı değer",
              "definition": "Komşu okumalardan çok farklı tek bir yanlış okuma.",
              "example": "100, 100, 350, 100 dizisindeki 350 bir aykırı değerdir.",
              "pitfall": "Her okumayı doğru kabul edip doğrudan karar vermek."
            },
            {
              "term": "Ortalama",
              "definition": "Tüm değerlerin toplamının sayıya bölümü; aykırı değeri kendine katar.",
              "example": "100, 100, 100, 350, 100 dizisinin ortalaması 150'dir.",
              "pitfall": "Ortalamayla aykırı değeri temizlediğini sanmak: yanlış okuma sonucu bozar."
            },
            {
              "term": "Medyan",
              "definition": "Değerler sıralanınca ortadaki değer; uçtaki aykırı değerler seçilmez.",
              "example": "100, 100, 100, 100, 350 sıralamasında ortadaki 100'dür.",
              "pitfall": "Yanlışlar pencerenin yarısını geçerse medyanın da yanılacağını unutmak."
            },
            {
              "term": "Kayan pencere",
              "definition": "Son N okumayı tutan dizi; yeni okuma en eskisinin yerine yazılır.",
              "example": "pencere[sira] = x; sira = (sira + 1) % N; dizinin sonuna gelince başa döner.",
              "pitfall": "% N unutmak ya da pencereyi ilk okumayla doldurmamak."
            },
            {
              "term": "Filtre gecikmesi",
              "definition": "Medyan filtre gerçek değişime hemen tepki vermez; yeni değer pencerenin çoğunluğu olana dek eski değer kalır.",
              "example": "N = 5 ve ölçüm 55 ms'de bir ise tepki yaklaşık 3 × 55 = 165 ms sonra gelir.",
              "pitfall": "Pencereyi gereksiz büyütmek: gürültü azalır ama sistem yavaşlar."
            }
          ],
          "quiz": [
            {
              "id": "m4h1d38-q1",
              "kind": "numeric",
              "prompt": "Beş okuma: 80, 82, 81, 400, 80 cm. Bu okumaların ortalaması kaç santimetredir?",
              "answer": 144.6,
              "tolerance": 0.1,
              "unit": "cm",
              "explanation": "Toplam 80 + 82 + 81 + 400 + 80 = 723; 723 / 5 = 144,6. Tek aykırı değer (400) ortalamayı yaklaşık 64 cm yukarı çekti.",
              "skills": [
                "sens-filter"
              ]
            },
            {
              "id": "m4h1d38-q2",
              "kind": "numeric",
              "prompt": "Aynı beş okumanın (80, 82, 81, 400, 80) medyanı kaç santimetredir?",
              "answer": 81,
              "tolerance": 0,
              "unit": "cm",
              "explanation": "Sıralayınca 80, 80, 81, 82, 400 olur; ortadaki (3.) değer 81'dir. Aykırı değer 400 sıralamanın ucuna gider ve medyanı etkilemez. Ortalamayı (144,6) bununla karşılaştır.",
              "skills": [
                "sens-filter"
              ]
            },
            {
              "id": "m4h1d38-q3",
              "kind": "mcq",
              "prompt": "7 elemanlı bir medyan filtre, penceredeki en çok kaç aykırı değere rağmen doğru sonucu verir?",
              "options": [
                "1",
                "2",
                "3",
                "6"
              ],
              "answer": 2,
              "explanation": "N elemanlı pencerede medyan en çok (N − 1) / 2 aykırı değeri affeder: (7 − 1) / 2 = 3. Dört yanlış varsa yanlışlar çoğunluk olur ve ortadaki değer de yanlış çıkar.",
              "skills": [
                "sens-filter"
              ]
            },
            {
              "id": "m4h1d38-q4",
              "kind": "predict-output",
              "prompt": "Pencere başta {50, 50, 50}. Üç yeni okuma gelirse (200, 200, 50) medyan ne yazdırır?\n\n```\nfloat p[3] = {50, 50, 50};\nint s = 0;\nfloat yeni[] = {200, 200, 50};\nfor (int i = 0; i < 3; i++) {\n  p[s] = yeni[i];\n  s = (s + 1) % 3;\n}\nfloat a = p[0], b = p[1], c = p[2];\nSerial.println(max(min(a, b), min(max(a, b), c)), 0);\n```",
              "options": [
                "50",
                "100",
                "150",
                "200"
              ],
              "answer": 3,
              "explanation": "Döngü sonunda p = {200, 200, 50} olur. Üç değerin ortancası 200'dür, çünkü 3 elemanlı pencerede iki yanlış çoğunluktur ve medyan da yanılır (3 elemanlı pencere en çok 1 yanlışı affeder). Ortalama 150 olurdu; kod medyan hesaplıyor.",
              "skills": [
                "sens-filter",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m4h1d38-q5",
              "kind": "find-bug",
              "prompt": "Kayan pencereli bir program bir süre sonra çökmeye ve saçma değerler okumaya başlıyor. Hatalı satır hangisi?\n\n```\nconst int N = 5;\nfloat pencere[N];\nint sira = 0;\n\nvoid ekle(float x) {\n  pencere[sira] = x;\n  sira = sira + 1;\n}\n```",
              "options": [
                "const int N = 5;",
                "float pencere[N];",
                "pencere[sira] = x;",
                "sira = sira + 1;"
              ],
              "answer": 3,
              "explanation": "sira hiç başa dönmüyor; N turdan sonra pencere[5], pencere[6]... dizinin dışına yazılır. Doğrusu sira = (sira + 1) % N; olmalı. pencere[sira] = x; satırı tek başına doğrudur, taşma buradaki sira değerinden gelir.",
              "skills": [
                "sens-filter",
                "prog-loops-arrays",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Servo ile tarama (sonar)",
          "durationMin": 25,
          "problem": "Denizaltı filmlerinde \"bip... bip...\" diye ekranda dönen bir sonar vardır. Sonar tek yöne bakmaz; sesi her yöne sırayla gönderip nerede ne var diye haritalar. Bizim HC-SR04 yalnızca baktığı yönü ölçer. Peki onu bir servonun üstüne koyup etrafı taratırsak ve en yakın nesnenin hangi yönde olduğunu bulursak?",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 VCC | Uno **5V** |\n| HC-SR04 GND | Uno **GND** |\n| HC-SR04 TRIG | Uno **D9** |\n| HC-SR04 ECHO | Uno **D10** |\n| Servo SIG | Uno **D6** |\n| Servo VCC | Uno **5V** |\n| Servo GND | Uno **GND** |\n\nBilgi notu (21. dersten): servo hareket ederken ani akım çeker. Gerçek bir devrede bu akım Uno'nun 5 V hattını çökertip kartı sıfırlayabilir ya da sensör ölçümlerini bozabilir; bu yüzden gerçek projelerde servo ayrı bir 5 V kaynaktan beslenir ve GND'ler ortak yapılır. Laboratuvarda harici güç kaynağı yoktur, servoyu Uno'nun 5V ve GND pinlerine bağlarsın.\n\n**Laboratuvarda sensör servoyla birlikte dönmez.** Gerçek sonarda HC-SR04, servonun koluna sabitlidir ve servo döndükçe farklı yönlere bakar. Laboratuvarda sensörün tek bir **Mesafe** değeri vardır. Farklı yönlerde farklı nesneler olduğunu taklit etmek için program çalışırken Mesafe'yi kendin değiştirirsin. Örneğin servo 120° civarındayken Mesafe'yi 35 cm yap, sonra 200 cm'ye geri getir. Seri monitörde `120:35.0` satırını görürsün.\n\n### Fikir\nServo açısını 0°'den 180°'ye 30°'lik adımlarla artırırız. Her adımda:\n1. `servo.write(aci)` servoyu açıya yollar.\n2. Servo oraya varana kadar bekleriz (`delay(300)`; küçük servolar için tipik bir değerdir, yük ve servoya göre değişir).\n3. Sensörle mesafeyi ölçeriz. Tek ölçüm yerine 38. dersteki medyan fikrini kullanırız: üç ölçümün ortancası.\n4. Sonucu **\"açı:mesafe\"** biçiminde yazarız, örneğin `120:35.0`.\n5. En küçük mesafeyi ve o andaki açıyı tutarız.\n\nTarama bitince \"EN YAKIN\" satırı yazılır. Hiç nesne bulunamazsa (hepsi 400 cm ya da yankısız) \"nesne yok\" yazılır.\n\n### Program 1: tarama ve en yakın nesne\n```cpp\n// sketch: sonar_tarama\n#include <Servo.h>\n\nconst int TRIG = 9;\nconst int ECHO = 10;\nconst int SERVO_PIN = 6;\nconst int ADIM = 30;                  // derece\nconst float MENZIL = 400.0;           // yankı yok: uzak say\n\nServo servo;\n\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return MENZIL;\n  float cm = sure * 0.0343 / 2.0;\n  return cm > MENZIL ? MENZIL : cm;\n}\n\n// Üç sayının ortancası: ne en küçük ne en büyük olan\nfloat medyan3(float a, float b, float c) {\n  return max(min(a, b), min(max(a, b), c));\n}\n\nfloat olc() {\n  float a = tekOlcum(); delay(30);\n  float b = tekOlcum(); delay(30);\n  float c = tekOlcum();\n  return medyan3(a, b, c);\n}\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  servo.attach(SERVO_PIN);\n  Serial.begin(9600);\n  servo.write(0);\n  delay(600);                         // başlangıç konumuna git\n}\n\nvoid loop() {\n  float enYakin = MENZIL;\n  int enYakinAci = -1;\n\n  for (int aci = 0; aci <= 180; aci += ADIM) {\n    servo.write(aci);\n    delay(300);                       // servo varsın\n    float cm = olc();\n    Serial.print(aci);\n    Serial.print(\":\");\n    Serial.println(cm, 1);\n    if (cm < enYakin) {\n      enYakin = cm;\n      enYakinAci = aci;\n    }\n  }\n\n  if (enYakinAci < 0) {\n    Serial.println(\"EN YAKIN: nesne yok\");\n  } else {\n    Serial.print(\"EN YAKIN: \");\n    Serial.print(enYakinAci);\n    Serial.print(\" derece, \");\n    Serial.print(enYakin, 1);\n    Serial.println(\" cm\");\n  }\n  servo.write(0);                     // başa dön\n  delay(800);\n}\n```\n\n### Nasıl çalışıyor?\n1. `for` döngüsü açıyı 0, 30, 60, ... 180 yapar. `aci += ADIM` her turda 30 ekler.\n2. `delay(300)` servo hareketini bekletir. Beklemezsen sensör servo hâlâ dönerken ölçer ve ölçümün hangi açıya ait olduğu karışır.\n3. `medyan3` üç ölçümden en tuhafını atar. Formül: `max(min(a,b), min(max(a,b),c))`. Üç sayının ortancasını sıralama yapmadan bulur.\n4. `cm < enYakin` karşılaştırması en küçük mesafeyi yakalar. `enYakin` başta `MENZIL` olduğu için yankısız (400) ölçümler hiçbir zaman \"en yakın\" olamaz.\n5. Sonuç satırları `aci:mesafe` biçimindedir. Bu biçim iyi bir alışkanlıktır: bir PC programı ya da çizim aracı `:` işaretinden bölerek veriyi okuyabilir.\n\nServo açısı aslında bir **darbe genişliğidir** (21. ders): yaklaşık 544 µs 0°'ye, yaklaşık 2400 µs 180°'ye denk gelir. Servo kütüphanesi `write(90)` için yaklaşık 1472 µs'lik darbeyi her 20 ms'de bir yollar.\n\n### Program 2: en yakın nesneyi göster\nBu sefer tarama yalnızca bir kez yapılsın. Sonra servo en yakın nesnenin yönüne dönüp orada kalsın ve o yönün mesafesini canlı yazsın.\n\n```cpp\n// sketch: sonar_isaret\n#include <Servo.h>\n\nconst int TRIG = 9;\nconst int ECHO = 10;\nconst int SERVO_PIN = 6;\nconst int ADIM = 30;\nconst float MENZIL = 400.0;\n\nServo servo;\nint hedefAci = 90;\n\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return MENZIL;\n  float cm = sure * 0.0343 / 2.0;\n  return cm > MENZIL ? MENZIL : cm;\n}\n\nfloat medyan3(float a, float b, float c) {\n  return max(min(a, b), min(max(a, b), c));\n}\n\nfloat olc() {\n  float a = tekOlcum(); delay(30);\n  float b = tekOlcum(); delay(30);\n  float c = tekOlcum();\n  return medyan3(a, b, c);\n}\n\n// Tarama yapar, en yakın nesnenin açısını döndürür (yoksa -1)\nint enYakinAciBul() {\n  float enYakin = MENZIL;\n  int aciEn = -1;\n  for (int aci = 0; aci <= 180; aci += ADIM) {\n    servo.write(aci);\n    delay(300);\n    float cm = olc();\n    if (cm < enYakin) {\n      enYakin = cm;\n      aciEn = aci;\n    }\n  }\n  return aciEn;\n}\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  servo.attach(SERVO_PIN);\n  Serial.begin(9600);\n  servo.write(0);\n  delay(600);\n\n  int aci = enYakinAciBul();\n  if (aci >= 0) hedefAci = aci;       // nesne bulunduysa oraya dön\n  else hedefAci = 90;                 // yoksa ortada dur\n  servo.write(hedefAci);\n  delay(500);\n}\n\nvoid loop() {\n  Serial.print(\"isaret=\");\n  Serial.print(hedefAci);\n  Serial.print(\" mesafe=\");\n  Serial.println(olc(), 1);\n  delay(500);\n}\n```\n\nBurada tarama bir fonksiyona taşındı: `enYakinAciBul()` açıyı döndürür. `setup()` bir kez çağırır, sonra servo o açıda kalır. Buna \"nesneyi işaret etme\" dersek, bir sonraki adım nesneyi **takip etmek** olurdu: tarama aralığını daraltıp sürekli güncellemek.\n\n### Dene\n- `ADIM` değerini 15 ve 10 yap. Tarama kaç saniye sürüyor? Çözünürlük arttıkça ne kaybediyorsun? (Hesapla: adım sayısı × yaklaşık 400 ms.)\n- Taramayı geri dönerken de yap (180°'den 0°'ye) ve iki yönün sonuçlarını karşılaştır. Aynı mı çıkıyor?\n- `sonar_tarama` çıktısını bir tablo programına yapıştırıp grafik çiz: açı yatay eksen, mesafe dikey eksen. Nesne nerede \"çukur\" olarak görünüyor?\n\n### Sık yapılan hatalar\n- Servonun VCC ya da GND kablosunu çekmeyi unutmak: servo hiç hareket etmez, laboratuvar \"beslenmemiş\" uyarısı verir.\n- `servo.attach(SERVO_PIN)` satırını unutmak: `servo.write` çağrıları servoyu oynatmaz.\n- Gerçek devrede servoyu ve sensörü aynı zayıf 5 V hattından beslemek ve ortak GND'yi unutmak: kart sıfırlanır, sensör saçmalar.\n- Hareket bitmeden ölçmek: açı ile mesafe eşleşmez. `delay(300)` bunun içindir.\n- Sensörün ışın genişliğini unutmak: veri sayfasında ölçüm açısı tipik olarak yaklaşık 15° civarında verilir, yani sensör tek bir çizgiye değil bir koniye bakar. 30°'lik adımlar bazı nesneleri iki komşu açıda birden gösterebilir ya da hiç göstermeyebilir.\n- `enYakin` değerini çok büyük başlatmamak (0 ile başlamak gibi): hiçbir ölçüm \"daha küçük\" olamaz.",
          "question": "Tarama sırasında bir nesne hareket ederse taramanın sonucu doğru olur mu? 180° tarama 3 saniye sürüyorsa bu sensörü hızlı giden bir araçta kullanmak mantıklı mı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Tek yöne bakan sensörü servoyla tarama yapan bir sonara dönüştürmeyi\n- Açıyı değiştir, bekle, ölç, kaydet döngüsünü kurmayı\n- En küçük değeri (en yakın nesneyi) doğru başlangıç değeriyle bulmayı\n- Sensörün ışın konisinin tarama çözünürlüğünü nasıl sınırladığını\n\n### Önceden bilmen gerekenler\nDers 21'de servo (`attach`, `write`, darbe genişliği); ders 37'de `pulseIn` ölçümü; ders 38'de medyan filtre; ders 4'te `for` döngüsü; ders 19'da fonksiyon.\n\n### Fikir: sensörü döndürmek\nHC-SR04 yalnız baktığı yönü ölçer. Sensörü servonun koluna sabitlersen servo açısı değiştikçe sensör başka yöne bakar. Açı açı ölçüm alırsan odanın bir kesitini çıkarırsın. Denizaltıdaki sonarın mantığı budur.\n\n### Tarama döngüsü\nHer açı için aynı dört adım tekrarlanır:\n\n```\nfor (int aci = 0; aci <= 180; aci += 30) {\n  servo.write(aci);        // 1. açıya git\n  delay(300);              // 2. servo varsın\n  float cm = olc();        // 3. ölç\n  // 4. aci:cm olarak yaz, en küçüğü güncelle\n}\n```\n\nBekleme adımı şart: servo daha dönerken ölçersen ölçümün hangi açıya ait olduğu karışır. 30° adımla 0, 30, ... 180 olmak üzere 7 ölçüm noktası vardır.\n\n### En küçük değeri bulmak\nEn yakın nesneyi bulmak için \"şimdiye kadarki en küçük\"ü tutarsın. Başlangıç değeri **büyük** olmalıdır:\n\n```\nfloat enYakin = 400.0;     // menzilin en büyüğü\nint enYakinAci = -1;       // -1: henüz bulunmadı\nif (cm < enYakin) { enYakin = cm; enYakinAci = aci; }\n```\n\nBaşlangıcı 0 yapsan hiçbir ölçüm 0'dan küçük olamaz ve nesneyi hiç bulamazsın. Tarama bittiğinde `enYakinAci` hâlâ -1 ise nesne yok demektir.\n\n### Veriyi düzenli yazmak\nHer ölçümü `aci:mesafe` biçiminde (örneğin `120:35.0`) yazmak iyi bir alışkanlıktır. Bir tablo programı ya da PC kodu `:` işaretinden bölerek veriyi okuyabilir.\n\n### Işın koni gibidir\nHC-SR04 tek çizgiye değil bir koniye bakar; veri sayfasında ölçüm açısı tipik olarak yaklaşık 15° verilir. 30°'lik adımlar bazı yönlerde koninin kapsamadığı boşluklar bırakabilir, ince bir nesne iki adım arasına düşüp kaçabilir. Adımı küçültürsen çözünürlük artar ama tarama uzar: her adım yaklaşık 400 ms sürüyorsa 7 adım yaklaşık 2,8 s, 19 adım (10°) yaklaşık 7,6 s eder.\n\n### Özet\nServo ve ultrasonik sensör birlikte tarama yapar: açıyı ayarla, servoyu bekle, ölç, kaydet. En yakın nesne, büyük bir değerle başlayan \"en küçüğü tut\" mantığıyla bulunur. Adım küçüldükçe çözünürlük artar ama tarama süresi uzar; ışın konisi nedeniyle çok küçük nesneler kaçabilir.",
          "concepts": [
            {
              "term": "Sonar tarama",
              "definition": "Ultrasonik sensörü servoyla döndürüp her açıda ölçüm alarak çevrenin kesitini çıkarmak.",
              "example": "0°'den 180°'ye 30°'lik adımlarla 7 ölçüm noktası alınır.",
              "pitfall": "Servo daha dönerken ölçmek: ölçüm başka açıya aittir."
            },
            {
              "term": "Servo bekleme süresi",
              "definition": "Servo yeni açıya varana kadar beklenen süre (bu derste 300 ms).",
              "example": "servo.write(aci); delay(300); ölçüm sırasıyla yapılır.",
              "pitfall": "Beklemeyi atlamak: açı ile mesafe eşleşmez."
            },
            {
              "term": "En küçüğü tutma",
              "definition": "Şimdiye kadar görülen en küçük değeri ve konumunu saklayıp her yeni değerle karşılaştırmak.",
              "example": "if (cm < enYakin) { enYakin = cm; enYakinAci = aci; }",
              "pitfall": "Başlangıç değerini 0 yapmak: hiçbir ölçüm 0'dan küçük olamaz, nesne bulunamaz."
            },
            {
              "term": "Işın konisi",
              "definition": "HC-SR04 tek çizgiye değil, tipik olarak yaklaşık 15° genişliğinde bir koniye bakar.",
              "example": "30°'lik adım, koninin kapsamadığı boşluklar bırakabilir.",
              "pitfall": "İnce bir nesnenin her zaman bulunacağını sanmak."
            },
            {
              "term": "aci:mesafe biçimi",
              "definition": "Her ölçümü \"açı:mesafe\" olarak yazmak; başka bir program \":\" işaretinden bölerek veriyi okuyabilir.",
              "example": "120:35.0 satırı 120° yönünde 35 cm anlamına gelir.",
              "pitfall": "Her çıktıyı serbest metinle yazmak: sonradan ayrıştırmak zorlaşır."
            }
          ],
          "quiz": [
            {
              "id": "m4h1d39-q1",
              "kind": "numeric",
              "prompt": "Bir tarama döngüsü şöyle yazıldı: for (int aci = 0; aci <= 180; aci += 20). Tarama başına kaç ölçüm noktası (açı) alınır?",
              "answer": 10,
              "tolerance": 0,
              "explanation": "Açılar 0, 20, 40, ... 180 olur: 180 / 20 + 1 = 10 nokta. Başlangıç noktası (0°) da sayıldığı için bölümün üstüne 1 eklenir.",
              "skills": [
                "prog-loops-arrays",
                "sens-servo-scan"
              ]
            },
            {
              "id": "m4h1d39-q2",
              "kind": "numeric",
              "prompt": "Taramada her adımda servoyu 300 ms beklettin, sonra üç ölçümün arasına 30 ms'lik iki bekleme koydun (ölçüm sürelerini ihmal et). 30°'lik adımla 0-180° tarama (7 nokta) yaklaşık kaç milisaniye sürer?",
              "answer": 2520,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Bir noktada 300 + 2 × 30 = 360 ms bekleme olur. 7 nokta için 7 × 360 = 2520 ms. Gerçek tarama ölçüm süreleri yüzünden biraz daha uzundur; adımı küçültürsen süre nokta sayısıyla orantılı artar.",
              "skills": [
                "prog-timing",
                "sens-servo-scan"
              ]
            },
            {
              "id": "m4h1d39-q3",
              "kind": "predict-output",
              "prompt": "Üç ölçümün ortancasını bulan formül şöyle. Bu kod çalışınca ne yazılır?\n\n```\nfloat a = 400, b = 35, c = 36;\nSerial.println(max(min(a, b), min(max(a, b), c)), 0);\n```",
              "options": [
                "35",
                "36",
                "157",
                "400"
              ],
              "answer": 1,
              "explanation": "min(400, 35) = 35; max(400, 35) = 400 ve min(400, 36) = 36; max(35, 36) = 36. Üç sayının ortancası 36'dır. 157 ortalamadır; 400 aykırı değerdir ve medyan onu seçmez.",
              "skills": [
                "sens-filter",
                "sens-servo-scan"
              ]
            },
            {
              "id": "m4h1d39-q4",
              "kind": "find-bug",
              "prompt": "Tarama programı en yakın nesneyi hiç bulamıyor; enYakinAci hep -1 kalıyor. Hatalı satır hangisi?\n\n```\nfloat enYakin = 0;\nint enYakinAci = -1;\nfor (int aci = 0; aci <= 180; aci += 30) {\n  servo.write(aci);\n  delay(300);\n  float cm = olc();\n  if (cm < enYakin) {\n    enYakin = cm;\n    enYakinAci = aci;\n  }\n}\n```",
              "options": [
                "float enYakin = 0;",
                "servo.write(aci);",
                "delay(300);",
                "if (cm < enYakin) {"
              ],
              "answer": 0,
              "explanation": "enYakin 0 ile başladığı için hiçbir ölçüm 0'dan küçük olamaz ve koşul hiç doğru olmaz. Başlangıç değeri büyük olmalı (örneğin 400.0). Karşılaştırma satırı doğrudur.",
              "skills": [
                "prog-debug",
                "sens-servo-scan"
              ]
            },
            {
              "id": "m4h1d39-q5",
              "kind": "mcq",
              "prompt": "30°'lik adımlarla tarayan bir sonar, ince bir kalemi neden kaçırabilir?",
              "options": [
                "Servo 30° adımda hiç durmaz",
                "Sensör tek bir çizgiye değil yaklaşık 15° genişliğinde bir koniye bakar; adımlar arasında koninin kapsamadığı boşluklar kalabilir",
                "HC-SR04 çok ince nesneleri her zaman 400 cm gösterir",
                "delay(300) ölçümü iptal eder"
              ],
              "answer": 1,
              "explanation": "Işın koni biçimindedir ve adımlar koniden büyük olduğunda iki yön arasında kör bölge kalır; ince bir nesne tam oraya düşebilir. Adımı küçültmek bu riski azaltır, ama taramayı uzatır. Servo adımlarda durur; delay ölçümü iptal etmez.",
              "skills": [
                "sens-servo-scan",
                "sens-ultrasonic"
              ]
            }
          ]
        },
        {
          "title": "Proje: Park sensörü (LED + buzzer + LCD)",
          "durationMin": 35,
          "problem": "Arabanı geri vitese alıp garaja girerken \"bip... bip... bip.bip.bip.biiip\" sesini duymuşsundur. Ses sıklaştıkça duvara yaklaştığını anlarsın; sürekli öttüğünde dur demektir. Hiç ekrana bakmadan, yalnızca sesle mesafe duyabilmek müthiş bir fikir. Şimdi bu sistemi sen yapacaksın.",
          "contentMd": "### Ne yapacağız?\nBu proje bu haftaki ve önceki modüllerdeki parçaları birleştirir:\n- **Bu hafta (36-38):** HC-SR04 ile `pulseIn` ölçümü, santimetre hesabı ve 5 elemanlı **medyan filtre**.\n- **Modül 3, hafta 6:** `millis()` ile bloklamayan kod. Ölçüm, ekran ve bip birbirini beklemez.\n- **Modül 3, hafta 7:** I2C LCD ekran (0x27).\n- **Modül 3, hafta 3:** `map()` ile bir aralığı başka bir aralığa çevirme.\n\nSistemin davranışı:\n\n| Mesafe | LED | Buzzer (D8) | LCD alt satır |\n|---|---|---|---|\n| 100 cm ve üstü | Yeşil | Sessiz | GUVENLI |\n| 50 - 100 cm | Yeşil | Yavaş bip | GUVENLI |\n| 20 - 50 cm | Sarı | Sıklaşan bip | YAKLASIYOR |\n| 20 cm'den az | Kırmızı | Sürekli ses | DUR! |\n\nBip aralığı mesafeye bağlıdır: 100 cm'de 800 ms, 20 cm'de 100 ms. Arası `map()` ile orantılı hesaplanır. Her bip 40 ms sürer.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| HC-SR04 VCC | Uno **5V** |\n| HC-SR04 GND | Uno **GND** |\n| HC-SR04 TRIG | Uno **D9** |\n| HC-SR04 ECHO | Uno **D10** |\n| Buzzer **+** | Uno **D8** |\n| Buzzer **-** | Uno **GND** |\n| Yeşil LED + 330 Ω direnç | Uno **D11** → direnç **1**; direnç **2** → LED **A**; LED **K** → Uno **GND** |\n| Sarı LED + 330 Ω direnç | Uno **D12** → direnç **1**; direnç **2** → LED **A**; LED **K** → Uno **GND** |\n| Kırmızı LED + 330 Ω direnç | Uno **D13** → direnç **1**; direnç **2** → LED **A**; LED **K** → Uno **GND** |\n| I2C LCD 16x2 | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → Uno **5V**, **GND** → Uno **GND** |\n\nBuzzer'ı seçip sağ panelden **Tür**'ü **Aktif** yap (varsayılan \"Pasif\"tir ve `tone()` ister). LED'lerin renklerini de özellik panelinden ayarla (yeşil, sarı, kırmızı). LCD'nin I2C adresi panelde yazar; kodla aynı olmalı (0x27).\n\nAktif buzzer'ın içinde kendi osilatörü vardır: pine HIGH verince öter, LOW verince susar. Pasif buzzer kullanıyorsan `digitalWrite` yerine `tone()` gerekir (18. ders). Bilgi notu: gerçek bir buzzer'ın akımı pinin sınırlarına yakın olabilir; sürücülü bir modül ya da veri sayfasına uygun bir direnç kullanılır.\n\n### Program\nSistem beş iş yapar ve hiçbirinde uzun `delay` yoktur:\n1. Her 60 ms'de bir mesafeyi ölçer.\n2. Ölçümü pencereye koyar ve medyanı alır (filtreli mesafe).\n3. Filtreli mesafeye göre LED'leri seçer.\n4. Buzzer'ı mesafeye göre sessiz, aralıklı ya da sürekli yapar.\n5. Her 250 ms'de bir LCD'yi günceller.\n\n```cpp\n// sketch: park_sensoru\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nconst int TRIG = 9;\nconst int ECHO = 10;\nconst int BUZZER = 8;\nconst int LED_YESIL = 11;\nconst int LED_SARI = 12;\nconst int LED_KIRMIZI = 13;\n\nconst float MENZIL = 400.0;               // yankı yok: uzak say\nconst float BIP_BASLANGIC = 100.0;        // bundan yakında bip başlar\nconst float SARI_MESAFE = 50.0;           // bundan yakında sarı\nconst float DUR_MESAFE = 20.0;            // bundan yakında sürekli ses\nconst unsigned long OLCUM_ARALIGI = 60;   // ms\nconst unsigned long EKRAN_ARALIGI = 250;  // ms\nconst unsigned long BIP_SURESI = 40;      // ms\nconst int N = 5;\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nfloat pencere[N];\nint sira = 0;\nfloat mesafe = MENZIL;                    // filtreli mesafe\n\nunsigned long sonOlcum = 0;\nunsigned long sonEkran = 0;\nunsigned long bipBasla = 0;\nbool bipAcik = false;\n\nfloat tekOlcum() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  unsigned long sure = pulseIn(ECHO, HIGH, 30000);\n  if (sure == 0) return MENZIL;\n  float cm = sure * 0.0343 / 2.0;\n  return cm > MENZIL ? MENZIL : cm;\n}\n\nfloat medyan(float a[], int n) {\n  float b[N];\n  for (int i = 0; i < n; i++) b[i] = a[i];\n  for (int i = 1; i < n; i++) {\n    float x = b[i];\n    int j = i - 1;\n    while (j >= 0 && b[j] > x) {\n      b[j + 1] = b[j];\n      j--;\n    }\n    b[j + 1] = x;\n  }\n  return b[n / 2];\n}\n\nvoid ledGuncelle() {\n  digitalWrite(LED_YESIL, mesafe >= SARI_MESAFE);\n  digitalWrite(LED_SARI, mesafe >= DUR_MESAFE && mesafe < SARI_MESAFE);\n  digitalWrite(LED_KIRMIZI, mesafe < DUR_MESAFE);\n}\n\nvoid buzzerGuncelle(unsigned long simdi) {\n  if (mesafe >= BIP_BASLANGIC) {          // uzak: sessiz\n    digitalWrite(BUZZER, LOW);\n    bipAcik = false;\n    return;\n  }\n  if (mesafe < DUR_MESAFE) {              // çok yakın: sürekli ses\n    digitalWrite(BUZZER, HIGH);\n    bipAcik = true;\n    return;\n  }\n  // 20-100 cm arası: bip aralığı 100-800 ms\n  unsigned long aralik = map((long)mesafe, 20, 100, 100, 800);\n  if (bipAcik) {\n    if (simdi - bipBasla >= BIP_SURESI) {\n      digitalWrite(BUZZER, LOW);\n      bipAcik = false;\n    }\n  } else if (simdi - bipBasla >= aralik) {\n    digitalWrite(BUZZER, HIGH);\n    bipAcik = true;\n    bipBasla = simdi;\n  }\n}\n\nvoid ekranGuncelle() {\n  char sayi[8];\n  lcd.setCursor(0, 0);\n  lcd.print(\"Mesafe:\");\n  if (mesafe >= MENZIL) {\n    lcd.print(\"   ---\");\n  } else {\n    dtostrf(mesafe, 6, 1, sayi);          // 6 karakter genişlikte, 1 ondalık\n    lcd.print(sayi);\n  }\n  lcd.print(\" cm\");                       // toplam tam 16 karakter\n\n  lcd.setCursor(0, 1);\n  if (mesafe < DUR_MESAFE) lcd.print(\"DUR!            \");\n  else if (mesafe < SARI_MESAFE) lcd.print(\"YAKLASIYOR      \");\n  else lcd.print(\"GUVENLI         \");\n}\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(BUZZER, OUTPUT);\n  pinMode(LED_YESIL, OUTPUT);\n  pinMode(LED_SARI, OUTPUT);\n  pinMode(LED_KIRMIZI, OUTPUT);\n  digitalWrite(BUZZER, LOW);\n\n  lcd.init();\n  lcd.backlight();\n\n  float ilk = tekOlcum();\n  for (int i = 0; i < N; i++) pencere[i] = ilk;   // pencereyi ilk okumayla doldur\n  mesafe = ilk;\n  ledGuncelle();\n  ekranGuncelle();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - sonOlcum >= OLCUM_ARALIGI) {\n    sonOlcum = simdi;\n    pencere[sira] = tekOlcum();\n    sira = (sira + 1) % N;\n    mesafe = medyan(pencere, N);\n    ledGuncelle();\n  }\n\n  buzzerGuncelle(simdi);                  // her turda: bip zamanlaması hassas\n\n  if (simdi - sonEkran >= EKRAN_ARALIGI) {\n    sonEkran = simdi;\n    ekranGuncelle();\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. **Üç saat, üç iş:** `sonOlcum` ölçümü, `sonEkran` ekranı, `bipBasla` bipi yönetir. Her biri `millis()` ile kendi aralığına bakar (27. ders). Hiçbiri diğerini beklemez.\n2. **Filtre:** ham ölçüm doğrudan kullanılmaz. Beş ölçümün medyanı `mesafe` olur (38. ders). Böylece tek bir yanlış okuma bip'i bozmaz.\n3. **Bip aralığı:** `map((long)mesafe, 20, 100, 100, 800)` 20 cm'yi 100 ms'ye, 100 cm'yi 800 ms'ye çevirir. 60 cm için sonuç 450 ms'dir: bipler 450 ms arayla başlar.\n4. **Bip süresi:** her bip 40 ms yanık kalır, sonra buzzer susar. Bir sonraki bip `bipBasla`'dan itibaren `aralik` kadar sonra başlar.\n5. **Sürekli ses:** 20 cm'den azsa buzzer pini sürekli HIGH kalır; kenar yoktur, yani düz bir ses.\n6. **Ekran:** `dtostrf(mesafe, 6, 1, sayi)` ondalık sayıyı sağa yaslı, 6 karakterlik bir metne çevirir. Satır her seferinde tam 16 karakter olduğu için eski karakterler ekranda kalmaz. Ekranı 250 ms'de bir güncelleriz; LCD yavaş bir cihazdır, her turda yazmak bipin zamanlamasını bozardı.\n7. **Yankı yok:** `tekOlcum` yankı gelmezse 400 döndürür; bu durumda ekran `---` gösterir, sistem sessizdir ve yeşil yanar.\n\nTepki süresi: medyan filtre yüzünden mesafe aniden değişirse sistem 3 ölçümde, yani yaklaşık 180 ms sonra tepki verir. Park hızlarında (yürüme hızı civarı) bu kabul edilebilir bir bedeldir.\n\n### Dene\n- `BIP_SURESI` değerini 100 ms yap. 20 cm civarında bipler birbirine karışıyor mu?\n- Sarı ve kırmızı sınırlarda LED titrerse (ölçüm 19,9 ile 20,1 arasında gidip geliyorsa) ne olur? Termostattaki histerezis fikrini buraya uygula: kırmızıya geçiş 20 cm'de, kırmızıdan çıkış 25 cm'de olsun.\n- 13. dersteki NTC devresini kur (10 kΩ ve NTC, orta nokta A2) ve ses hızını sıcaklığa göre düzelt (36. dersteki formül). NTC'nin Sıcaklık özelliğini 0 °C ve 35 °C yaparak düzeltilmiş mesafeyi seri monitörde yazdır. Laboratuvardaki HC-SR04 sabit bir ses hızıyla çalışır; bu düzeltme asıl olarak gerçek sensörde fark yaratır, burada yalnızca hesabı denersin.\n- Mesafe özelliğini 150 cm'den 15 cm'e doğru yavaşça kaydır. LED renkleri, bip sıklığı ve LCD yazısı hangi mesafelerde değişiyor? Tabloyla uyuşuyor mu?\n- Pasif buzzer için `digitalWrite(BUZZER, HIGH)` yerine `tone(BUZZER, 2000)`, susturmak için `noTone(BUZZER)` kullan.\n\n### Sık yapılan hatalar\n- Bip için `delay()` kullanmak: ölçüm, ekran ve diğer işler bip süresince durur. Bütün işler `millis()` ile kendi saatinde çalışmalı.\n- LCD'yi her turda güncellemek: I2C iletişimi uzun sürer ve bip ritmi bozulur.\n- LCD satırını tam 16 karaktere tamamlamamak: \"100.0 cm\"den \"45.3 cm\"e inince eski karakterler ekranda kalır.\n- Filtre olmadan ham ölçümle karar vermek: tek bir aykırı değer kısa bir sessizlik ya da yanlış renk getirir.\n- Yankı yok durumunu (`0`) mesafe sanmak: sistem \"0 cm\" diyerek sürekli öter. Biz bunu 400 cm yaparak sessiz bıraktık; ama gerçek bir araçta \"sensör ölçemiyor\" diye ayrıca uyarı vermek daha güvenlidir.\n- Buzzer'ın Tür özelliğini \"Aktif\" yapmamak: pasif buzzer `digitalWrite` ile ses vermez.\n- Bilgi notu: gerçek bir araçta sensörün 2 cm'den yakınındaki bir yüzey (tampon, kablo) sürekli yanlış ölçüme yol açar. Ayrıca servo, motor ya da fan gibi yükleri sensörle aynı güç hattından beslemek gerilim çökmeleriyle ölçümü bozar; ayrı beslenir, GND'ler ortak yapılır.",
          "question": "Gerçek bir arabada sensör arka tamponda yan yana dört tane olurdu. Sensörler aynı anda ölçerse birbirinin sesini duyabilir. Bunu nasıl önlerdin? Sensörleri sırayla ölçmenin bedeli ne olurdu?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birkaç sensör ve çıkış işini tek programda birleştirmeyi\n- Mesafeyi eşiklerle bölgelere ayırıp her bölgeye davranış bağlamayı\n- `map()` ile mesafeyi bip aralığına orantılı çevirmeyi\n- Ölçüm, bip ve ekranı `millis()` ile birbirini beklemeden çalıştırmayı\n\n### Önceden bilmen gerekenler\nDers 37-38'deki ölçüm ve medyan filtre; ders 14'te `map()`; ders 18'de buzzer; ders 27'de `millis()`; ders 32-33'te I2C LCD.\n\n### Sistemi tasarla: önce tablo\nKod yazmadan önce davranışı tabloya dök:\n\n| Mesafe | LED | Buzzer | Ekran |\n|---|---|---|---|\n| 100 cm ve üstü | Yeşil | Sessiz | GUVENLI |\n| 50-100 cm | Yeşil | Yavaş bip | GUVENLI |\n| 20-50 cm | Sarı | Sıklaşan bip | YAKLASIYOR |\n| 20 cm'den az | Kırmızı | Sürekli ses | DUR! |\n\nTablodaki her satır koddaki bir koşula dönüşür. Sınırlarda kural net olsun: \"20 tam olarak\" hangi satırda? Bu projede `>= 20` sarıdır, `< 20` kırmızıdır.\n\n### Mesafeden bip aralığına\nBip sıklığı mesafeyle doğru orantılı değişsin: 100 cm'de 800 ms, 20 cm'de 100 ms. `map(girdi, girdiMin, girdiMaks, çıktıMin, çıktıMaks)` bir aralığı bir başkasına doğrusal çevirir:\n\n```\naralik = map(60, 20, 100, 100, 800);   // 60 cm\n// (60-20) * (800-100) / (100-20) + 100 = 450 ms\n```\n\n`map()` tam sayılarla çalışır ve küsuratı atar. Bu yüzden mesafe `(long)` ile tam sayıya çevrilir.\n\n### Üç iş, üç saat\nÖlçüm 60 ms'de bir, ekran 250 ms'de bir, bip kendi zamanlamasıyla çalışır. Her işin kendi `son...` değişkeni vardır ve `millis()` farkına bakar. Hiçbir yerde uzun `delay()` yoktur; bip için `delay()` kullansaydın ölçüm ve ekran bip süresince durur.\n\n### Ölçüm filtreden geçer\nHam ölçüm doğrudan karar vermez. Son 5 ölçümün medyanı kullanılır; tek bir yanlış okuma yanlış renk ya da sessizlik üretmez. Bedeli yaklaşık 3 ölçüm, yani 180 ms'lik tepki gecikmesidir. Yankı yoksa ölçüm 400 cm sayılır: sistem sessiz kalır.\n\n### Ekran küçük ayrıntılar ister\nLCD yavaştır; her turda yazmak bip ritmini bozar. Her satırı tam 16 karaktere tamamla: \"YAKLASIYOR\" yazdıktan sonra \"DUR!\" yazarsan eski harfler ekranda kalır. Sınırda titreme olursa (ölçüm 19,9 ile 20,1 arasında gidip gelirse) renk sürekli değişir; çözüm giriş ve çıkış eşiğini ayırmaktır (histerezis).\n\n### Özet\nProje sensör, filtre, eşik, `map()` ve `millis()` fikirlerini birleştirir. Önce davranış tablosu yazılır, sonra her satır bir koşula dönüşür. Ölçüm, bip ve ekran kendi saatleriyle çalışır; medyan filtre yanlış okumaları ayıklar ve bunun karşılığında kısa bir gecikme getirir.",
          "concepts": [
            {
              "term": "Eşik ve bölge",
              "definition": "Bir ölçümü sınır değerlerle bölgelere ayırıp her bölgeye ayrı davranış bağlamak.",
              "example": "20 cm altı kırmızı, 20-50 cm sarı, 50 cm üstü yeşil.",
              "pitfall": "Sınır değerini belirsiz bırakmak: tam 20 cm hangi bölgede olduğuna karar verilmemiş olur."
            },
            {
              "term": "map()",
              "definition": "Bir aralıktaki sayıyı başka bir aralığa doğrusal çevirir; tam sayılarla çalışır ve küsuratı atar.",
              "example": "map(60, 20, 100, 100, 800) 450 verir: 60 cm'de bip aralığı 450 ms.",
              "pitfall": "Küsuratlı mesafeyi (long) ile çevirmeden vermek ya da sonucu ondalıklı beklemek."
            },
            {
              "term": "Bloklamayan çok görev",
              "definition": "Ölçüm, bip ve ekranın millis() ile kendi saatlerine göre çalışması; hiçbiri diğerini beklemez.",
              "example": "Ölçüm 60 ms, ekran 250 ms aralıkla yapılır.",
              "pitfall": "Bip için delay() kullanmak: o süre boyunca ölçüm ve ekran durur."
            },
            {
              "term": "Histerezis",
              "definition": "Bir duruma giriş ve çıkış eşiğini farklı seçerek sınırdaki titremeyi önleme.",
              "example": "Kırmızıya 20 cm'de geç, kırmızıdan 25 cm'de çık.",
              "pitfall": "Tek eşik kullanmak: ölçüm sınırda gidip gelince renk sürekli değişir."
            },
            {
              "term": "Ekran satırını tamamlamak",
              "definition": "LCD'ye her seferinde satırı tam 16 karakterle yazmak; kısa yazı eski harfleri silmez.",
              "example": "lcd.print(\"DUR!            \"); satırı boşlukla 16 karaktere tamamlar.",
              "pitfall": "Kısa metin yazıp eski karakterlerin ekranda kaldığını görmek."
            }
          ],
          "quiz": [
            {
              "id": "m4h1d40-q1",
              "kind": "numeric",
              "prompt": "Park sensöründe bip aralığı map((long)mesafe, 20, 100, 100, 800) ile hesaplanıyor. Mesafe 75 cm iken bip aralığı kaç milisaniyedir? (map tam sayılarla çalışır ve küsuratı atar.)",
              "answer": 581,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "map = (75 − 20) × (800 − 100) / (100 − 20) + 100. İşlem sırası: 55 × 700 = 38500; 38500 / 80 = 481 (küsurat atılır); 481 + 100 = 581 ms.",
              "skills": [
                "sens-thresholds"
              ]
            },
            {
              "id": "m4h1d40-q2",
              "kind": "mcq",
              "prompt": "Park sensöründe bip, buzzer pinini 40 ms HIGH tutup susturarak delay(40) ile yapılırsa ne olur?",
              "options": [
                "Hiçbir şey değişmez",
                "Her bip sırasında program durur; ölçüm ve ekran güncellemesi geciker",
                "Buzzer sürekli öter",
                "Ölçüm daha doğru olur"
              ],
              "answer": 1,
              "explanation": "delay() programı bloklar. Bip sırasında ölçüm ve ekran çalışamaz, bip sıklaştıkça program neredeyse sürekli beklemede kalır. Çözüm, bipin başlangıç zamanını tutup millis() farkına bakmaktır (ders 27).",
              "skills": [
                "prog-nonblocking"
              ]
            },
            {
              "id": "m4h1d40-q3",
              "kind": "find-bug",
              "prompt": "Park sensöründe sarı LED, mesafe ne olursa olsun hep yanıyor. Hatalı satır hangisi?\n\n```\nvoid ledGuncelle() {\n  digitalWrite(LED_YESIL,   mesafe >= 50);\n  digitalWrite(LED_SARI,    mesafe >= 20 || mesafe < 50);\n  digitalWrite(LED_KIRMIZI, mesafe < 20);\n}\n```",
              "options": [
                "digitalWrite(LED_YESIL,   mesafe >= 50);",
                "digitalWrite(LED_KIRMIZI, mesafe < 20);",
                "digitalWrite(LED_SARI,    mesafe >= 20 || mesafe < 50);"
              ],
              "answer": 2,
              "explanation": "Sarı için iki koşul aynı anda sağlanmalı: 20 cm ve üstü VE 50 cm altı. || (\"ya da\") kullanılınca her sayı en az birini sağlar, koşul hep doğru olur. Doğrusu && olmalı. Diğer iki satır tablodaki yeşil ve kırmızı bölgelerle uyuşur.",
              "skills": [
                "sens-thresholds",
                "prog-debug"
              ]
            },
            {
              "id": "m4h1d40-q4",
              "kind": "numeric",
              "prompt": "Ölçüm 60 ms'de bir yapılıyor ve filtre 7 elemanlı medyan. Mesafe bir ölçümden hemen sonra aniden değişirse filtre çıkışı yeni değeri en erken kaç milisaniye sonra verir?",
              "answer": 240,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "7 elemanlı pencerede yeni değerin ortanca olması için 4 yeni okuma (çoğunluk) gerekir. 4 × 60 = 240 ms. 5 elemanlı pencerede bu 3 × 60 = 180 ms olurdu; pencere büyüdükçe tepki yavaşlar.",
              "skills": [
                "sens-filter",
                "prog-timing"
              ]
            },
            {
              "id": "m4h1d40-q5",
              "kind": "predict-output",
              "prompt": "LCD'nin ikinci satırına önce \"YAKLASIYOR\", sonra aynı konumdan başlayarak \"DUR!\" yazılıyor. Ekranda ne görünür?\n\n```\nlcd.setCursor(0, 1);\nlcd.print(\"YAKLASIYOR\");\nlcd.setCursor(0, 1);\nlcd.print(\"DUR!\");\n```",
              "options": [
                "DUR!",
                "DUR!ASIYOR",
                "YAKLASIYOR",
                "DUR!KLASIYOR"
              ],
              "answer": 1,
              "explanation": "LCD yazılan karakterlerin üstüne yazar; kalan karakterleri silmez. \"DUR!\" ilk dört harfi (YAKL) ezer, geri kalan \"ASIYOR\" ekranda durur: DUR!ASIYOR. Çözüm satırı boşlukla 16 karaktere tamamlamaktır.",
              "skills": [
                "sens-thresholds",
                "prog-debug"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Varlık ve engel",
      "project": "Hırsız alarmı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. PIR sensörünün ısı ışınımındaki değişimi algıladığını, ısınma ve tutma süresinin ne olduğunu açıklayabilir; ısınmayı bekleyen ve son hareket zamanını tutan bir program yazabilir.\n2. IR engel sensörünün \"var/yok\" bilgisi verdiğini, eşiğin dijital çıkışta vidada, analog çıkışta kodda olduğunu bilir; iki eşikle (histerezis) titremesiz karar verebilir.\n3. Reed ve limit anahtarını `INPUT_PULLUP` ile okuyabilir, NO ve NC farkını güvenlik açısından açıklayabilir, kontak titreşimini debounce ile eleyebilir.\n4. VL53L0X'i (ToF, I2C, 0x29) tanır; `init()`, `timeoutOccurred()` ve `Wire.begin()` ile hata kontrolü yapan kod yazabilir (laboratuvarda parça yok, yalnız derleme).\n5. PIR, reed ve butonu birleştiren, `enum` ve `millis()` ile yazılmış dört durumlu bir hırsız alarmı kurabilir ve zayıf noktalarını tartışabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 20 dakika, proje yaklaşık 35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | PIR: hareket algılama ve ısınma süresi | ~20 dk | Anlatımı oku, `pir_isinma` ve `pir_oda_dolu` sketch'lerini çalıştır, Hareket kutusunu ısınma sırasında ve sonrasında dene, mini testi çöz. |\n| 2 | IR engel sensörü ve eşik ayarı | ~20 dk | Yakınlık ve Eşik kaydırıcılarını oynat, analog sketch'te histerezisi gözle, mini testi çöz. |\n| 3 | Reed anahtarı ve limit anahtarı | ~20 dk | Reed ve butonu aynı mantıkla oku, NO/NC ve debounce üzerine düşün, mini testi çöz. |\n| 4 | VL53L0X (I2C ToF): hassas mesafe | ~20 dk | Kodu yaz ve derle, sensörsüz çalıştırıp hata mesajını gör, eşik hesaplarını yap, mini testi çöz. |\n| 5 | Proje: Hırsız alarmı (durum makineli) | ~35 dk | Durum tablosunu çiz, devreyi kur, programı çalıştır, durumların hepsini gez, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Modül 3 ve ilk haftanın bilgilerine dayanır. Başlamadan önce şunları kontrol et:\n- `INPUT_PULLUP` ile buton okuyabiliyor mu ve basılı = LOW olduğunu biliyor mu? (6. ders)\n- Kenar algılama ve debounce fikrini hatırlıyor mu? (8. ders)\n- `millis()` ile `delay()` kullanmadan süre ölçebiliyor mu? (27. ders)\n- `enum` ve `switch` ile durum makinesi yazabiliyor mu? (28. ders)\n- I2C'nin SDA ve SCL ile çalıştığını, her cihazın bir adresi olduğunu biliyor mu? (33. ders)\n- İki eşikli (histerezisli) karar fikrini hatırlıyor mu? (35. ders)\n- Ultrasonik sensörün ses gönderip yankıyı beklediğini biliyor mu? (36. ders)\n\n### Kavram haritası\n- **Varlık:** PIR (ısı değişimi) → ısınma süresi → tutma süresi → son hareket zamanı → oda dolu/boş\n- **Engel:** IR engel (yansıma) → dijital OUT (vida eşiği) ve analog AO (kod eşiği) → histerezis → kenar sayma\n- **Kontak:** reed ve limit anahtarı → `INPUT_PULLUP` → NO ve NC → debounce → arızaya karşı güvenlik\n- **Mesafe (ışık):** VL53L0X → I2C 0x29 → `init()` ve `timeoutOccurred()` → milimetre eşiği\n- **Proje:** durum tablosu → `enum` ve `switch` → çıkış gecikmesi → mandal → şifre penceresi → bloklamayan döngü\n\n### Sık yapılan hatalar\n- **Isınmayı beklememek.** PIR açıldıktan sonra yalancı HIGH verir; alarm hemen çalar.\n- **PIR için `INPUT_PULLUP` kullanmak ya da LOW'u hareket saymak.** PIR'da hareket = HIGH.\n- **PIR'ın hemen LOW olacağını sanmak.** Tutma süresi nedeniyle OUT hareket bittikten sonra bir süre HIGH kalır.\n- **Her IR modülünün engelde LOW verdiğini varsaymak.** Seviyeyi bir sabite yaz.\n- **Tek eşik kullanmak.** Değer eşik civarında dalgalanınca çıktı titrer; iki eşik kullan.\n- **Cisim sayarken seviyeyi saymak.** Duran cisim her turda yeniden sayılır; kenarı say.\n- **Reed ve limit anahtarında pull-up'ı unutmak.** Açık kontakta pin yüzer, okuma rastgele olur.\n- **NO ile NC'yi karıştırmak.** Mantık tersine çalışır; kopan kablo fark edilmeyebilir.\n- **VL53L0X'te `Wire.begin()` ya da `timeoutOccurred()` kontrolünü atlamak.** Hatalı okuma gerçek mesafe sanılır.\n- **mm ile cm'yi karıştırmak.** 300 mm = 30 cm.\n- **Alarm projesinde `delay()` kullanmak.** Buton ve sensörler o sürede kaçırılır.\n- **Şifre sayacını durum değişince sıfırlamamak.** Önceki durumdaki basışlar yenisini bozar.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. `pir_oda_dolu` sketch'ini bakmadan yaz; sonra bekleme süresini değiştirip etkisini açıkla.\n4. Kâğıda, hırsız alarmı için durum geçiş şemasını (ok ve koşullarla) çiz; sonra projedeki koddan kontrol et.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Alarm kapı kontağını neden NC bağlamak, NO bağlamaktan daha güvenli olabilir?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Hırsız alarmı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | PIR, reed ya da buton eksik veya yanlış pinde | Üç giriş ve çıkışlar doğru pinlerde, GND'ler bağlı | Bağlantılar düzenli, her sensörün çalışması tek tek denenmiş |\n| Durum tasarımı | Durum tablosu yok, bayraklarla karışık | Dört durum ve geçişleri tabloda var, kod `enum` ve `switch` kullanıyor | Geçiş koşulları şemayla birebir uyuyor, giriş gecikmesi gibi bir ek durum düşünülmüş |\n| Zamanlama | `delay()` kullanılıyor, düğme ya da sensör kaçırılıyor | Çıkış gecikmesi, alarm süresi ve şifre penceresi `millis()` ile ölçülüyor | Süreler sabitlerde toplanmış, değiştirilince etkisi açıklanıyor |\n| Sensör güvenilirliği | Isınma ve tutma süresi hesaba katılmamış, yalancı alarm çıkıyor | Çıkış gecikmesi PIR'ın sakinleşmesine izin veriyor, reed mantığı doğru | NC/NO ve debounce seçimleri gerekçelendirilmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Durumları ve geçişleri adım adım anlatıyor | Zayıf noktaları (kablo kesme, PIR'ı kapatma) ve çözümleri tartışıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta, sensörlerin \"doğru cevap\" vermediğini; yorumlanması, süzülmesi ve güvenlik için tasarlanması gereken sinyaller verdiğini göstermektir. Isınma, titreşim ve eşik gibi kavramlar gerçek mühendisliğin gündelik sorunlarıdır.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şunları sor: \"Sensör o anda ne okuyor?\", \"Bu durum hangi koşulla değişiyor?\", \"Kablo kopsaydı ne olurdu?\"\n- **Laboratuvar sınırı.** VL53L0X parçası laboratuvarda yoktur; bu ders yalnız kod yazma ve derleme üzerinedir. Ölçüm değerleri sanal olarak doğrulanamaz.\n- **Güvenlik.** Platformdaki her şey sanaldır. Gerçek kartla çalışılırsa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; röle ve sirenler için harici besleme ve ortak GND kuralı unutulmaz.\n- **Etik.** Alarm ve hareket algılama kendi odan ve eşyaların için kullanılır. Başkalarının odasına izinsiz sensör koymak, birini gizlice izlemek yanlıştır; bu konuyu öğrenciyle konuşmak iyi olur.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "PIR: hareket algılama ve ısınma süresi",
          "durationMin": 20,
          "problem": "Mağaza girişinde kapıya yaklaşınca kendiliğinden açılan ışıkları, koridorda sen geçince yanan lambaları gördün. Ortada ne buton var ne kamera. Bu cihaz seni nasıl \"fark ediyor\"? Üstelik fişe takıldıktan hemen sonra bazen saçma sapan tepki veriyor. Neden?",
          "contentMd": "### PIR nedir?\nPIR (pasif kızılötesi) sensör, çevredeki **kızılötesi (ısı) ışınımının değişimini** algılar. Sıcak bir cisim (insan, hayvan) sensörün görüş alanında hareket edince ışınım değişir ve sensör çıkışını HIGH yapar. Duran bir cisim ya da yavaş yavaş değişen ortam sıcaklığı bu değişimi yaratmaz. \"Pasif\" demek, kendisi ışık göndermez, yalnız dinler demektir (36. dersteki ultrasonik sensör ise ses gönderip dönmesini bekliyordu).\n\nPIR modülünün üç ucu vardır: VCC, OUT, GND. Gerçek modüllerde besleme gerilimi modüle göre değişir (veri sayfasına bakılır); laboratuvardaki PIR 5 V ile çalışır. OUT ucu Arduino için basit bir dijital girişten ibarettir: hareket varken HIGH, yokken LOW.\n\nGerçek modüllerin çoğunda iki ayar vidası ve bir atlama pimi bulunur. Vidalar genelde algılama hassasiyetini ve çıkışın HIGH kalma süresini ayarlar; atlama pimi ise hareket sürerken çıkışın uzamasını (\"yeniden tetikleme\") açıp kapatır. Hangi vidanın ne yaptığı **modüle göre değişir**. Laboratuvardaki PIR'da vida yoktur; hareket bittikten sonra çıkışı **3 saniye** HIGH tutar.\n\n**Isınma süresi:** PIR açıldığında kendini çevreye alıştırmak için bir süre bekler. Bu sırada çıkışı gelişigüzel HIGH-LOW yapabilir. Gerçek modüllerde bu süre genelde yarım dakika ile bir dakika civarındadır, ama **modüle göre değişir**. Laboratuvar dersi hızlandırmak için bunu **2 saniyeye** kısaltır: ▶'e bastıktan sonraki ilk 2 saniyede çıkış parazitli oynar ve **Hareket** kutusu yok sayılır. Bu yüzden alarm gibi uygulamalarda açılıştan sonra bir süre PIR'ı yok sayarız.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| PIR | VCC → 5V, GND → GND, OUT → **D2** |\n| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |\n| LED | A → direncin 2 ucu, K → GND |\n\nPIR'a hareket vermek için parçayı seç ve özellik panelinden **Hareket** kutusunu işaretle; kutuyu kaldırınca hareket biter. Çalışırken de değiştirebilirsin.\n\nPIR'ın OUT ucu kendi gerilimini taşıdığı için `INPUT_PULLUP` kullanmıyoruz; düz `INPUT` yeter.\n\n### Program\nÖnce ısınma, sonra kenar algılama (6. ve 8. derslerdeki \"değişimi yakala\" fikri aynen geçerli). Dersin sketch'inde ısınmayı 5 saniye tuttuk; laboratuvarın kendi ısınması 2 saniye olduğu için sketch'in beklemesi yeterlidir. Gerçek modülde bu süreyi uzatman gerekir.\n\n```cpp\n// sketch: pir_isinma\nconst int PIR = 2;\nconst int LED = 13;\nconst unsigned long ISINMA_MS = 5000;   // gerçek modülde daha uzun tut\n\nbool oncekiHareket = false;\n\nvoid setup() {\n  pinMode(PIR, INPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n  Serial.println(\"Isiniyor...\");\n  while (millis() < ISINMA_MS) {              // ısınma bitene kadar PIR'ı yok say\n    digitalWrite(LED, (millis() / 250) % 2);  // LED hızlı yanıp söner\n  }\n  digitalWrite(LED, LOW);\n  Serial.println(\"Hazir\");\n}\n\nvoid loop() {\n  bool hareket = (digitalRead(PIR) == HIGH);\n  if (hareket && !oncekiHareket) {\n    Serial.println(\"Hareket var\");\n  }\n  if (!hareket && oncekiHareket) {\n    Serial.println(\"Hareket bitti\");\n  }\n  oncekiHareket = hareket;\n  digitalWrite(LED, hareket);\n}\n```\n\nPIR hareketten sonra bir süre HIGH kalır. Bazen bu süre bizim için fazla kısa ya da uzundur. Bir odanın dolu mu boş mu olduğunu bilmek istiyorsak, \"son hareketten sonra 3 saniye boyunca yeni hareket yok\" koşulunu yazılımda kendimiz de kontrol edebiliriz. Bu, 27. dersteki `millis()` yöntemidir:\n\n```cpp\n// sketch: pir_oda_dolu\nconst int PIR = 2;\nconst int LED = 13;\nconst unsigned long BOS_SURE = 3000;   // ms: bu kadar sessizlikten sonra oda \"boş\"\n\nbool odaDolu = false;\nunsigned long sonHareket = 0;\n\nvoid setup() {\n  pinMode(PIR, INPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (digitalRead(PIR) == HIGH) {\n    sonHareket = simdi;                 // hareket sürdükçe sayacı yenile\n    if (!odaDolu) {\n      odaDolu = true;\n      Serial.println(\"Oda dolu\");\n    }\n  }\n\n  if (odaDolu && simdi - sonHareket >= BOS_SURE) {\n    odaDolu = false;\n    Serial.println(\"Oda bos\");\n  }\n\n  digitalWrite(LED, odaDolu);\n}\n```\n\n### Nasıl çalışıyor?\n1. `pir_isinma` içinde `setup()` ısınma bitene kadar dönmez. Bu sırada LED hızlı yanıp söner; kullanıcı \"şimdi hareket etme\" mesajını almış olur.\n2. `loop()` içinde yalnız **kenarlar** yazdırılır: LOW'dan HIGH'a geçiş \"Hareket var\", HIGH'dan LOW'a geçiş \"Hareket bitti\". Aksi halde her turda mesaj basılırdı.\n3. `pir_oda_dolu` sensör çıkışını doğrudan LED'e vermez. Hareket her görüldüğünde `sonHareket` yenilenir. Oda ancak `BOS_SURE` kadar hareket görülmezse \"boş\" olur. Sensör çıkışı kısa süre LOW'a düşse bile oda hemen boşalmış sayılmaz.\n4. Süre karşılaştırmasında çıkarma kullanıldı (`simdi - sonHareket`). Nedenini 27. derste görmüştün.\n\n### Dene\n- `pir_isinma` ile ▶'e bastıktan sonra ilk 5 saniye içinde **Hareket** kutusunu işaretle. Sonuç yazdırılıyor mu? Isınma bitince işaretle, şimdi ne oluyor?\n- `pir_isinma` içindeki ısınma bekleme döngüsünü sil ve ilk 2 saniyede seri monitörü izle. Hareket yokken bile \"Hareket var\" yazdığını görürsün; bu, ısınma parazitidir.\n- `BOS_SURE` değerini 1 saniye ve 10 saniye yap. Laboratuvardaki PIR hareket bittikten sonra çıkışı zaten 3 saniye HIGH tuttuğu için `BOS_SURE` bunun **üstüne** biner. Hangi değer bir odada oturan, az kıpırdayan birine daha uygun?\n- Kutuyu kaldırdığın an ile \"Hareket bitti\" mesajının geldiği an arasındaki farkı `Serial.println(millis())` ile ölç. Kaç saniye çıkıyor?\n\n### Sık yapılan hatalar\n- Isınmayı beklememek: açılıştan hemen sonra gelen yalancı HIGH'lar alarm çaldırır.\n- PIR'ı `INPUT_PULLUP` ile okumak ya da mantığı ters yazmak: PIR'da hareket varken çıkış HIGH'tır, butondaki gibi LOW değil.\n- Her turda mesaj yazdırmak: kenar kontrolü olmadan Serial Monitor dolup taşar.\n- Sensörü güneş alan pencereye, kalorifer ya da klima önüne yerleştirmek: ısı değişimleri hareket gibi görünebilir.\n- PIR'ın VCC ya da GND ucunu bağlamamak: modül beslenmez, çıkışı hep LOW kalır ve laboratuvar \"beslenmemiş\" uyarısı verir.",
          "question": "Odasında hiç kıpırdamadan uyuyan biri PIR için \"orada kimse yok\" demek midir? PIR'ın göremediği başka hangi durumlar olabilir, bir alarm sistemi bunu nasıl telafi eder?",
          "explainerMd": "### Bu derste öğreneceklerin\n- PIR sensörünün sıcaklığı değil, **ısı ışınımındaki değişimi** algıladığını\n- Modülün üç ucunu (VCC, OUT, GND) ve OUT ucunun Arduino'da nasıl okunduğunu\n- Isınma süresinin neden gerektiğini ve programda nasıl beklendiğini\n- Sensörün HIGH kalma süresine güvenmek yerine \"son hareketten beri geçen süre\" ile karar vermeyi\n\n### Önceden bilmen gerekenler\n- 6. ders: `digitalRead` ve giriş pini\n- 8. ders: kenar algılama (LOW'dan HIGH'a geçişi yakalamak)\n- 27. ders: `millis()` ile bloklamayan zamanlama\n- 36. ders: ses gönderen ultrasonik sensör (PIR bunun tersine yalnız dinler)\n\n### Sıcak cisimler ışıma yapar\nİnsan vücudu ve her sıcak cisim görünmeyen **kızılötesi** ışınım yayar. **PIR** (pasif kızılötesi) sensör bu ışınımı dinler. \"Pasif\" demek, kendisi hiçbir şey göndermez demektir. Sensörün içinde görüş alanını iki yarıya bölen bir algılayıcı vardır ve sensör **iki yarıdaki ışınım farkına** bakar.\n\nOdada duran biri iki yarıda da aynı ışınımı verir, fark sıfırdır. Hareket eden biri bir yarıdan ötekine geçerken fark oluşturur ve sensör bunu \"hareket\" sayar. Bu yüzden PIR, **hareketsiz duran** birini fark etmeyebilir.\n\n### Üç uçlu bir modül\nPIR modülünün üç ucu vardır:\n\n| Uç | Görev |\n|---|---|\n| VCC | Besleme (laboratuvardaki PIR 5 V ile çalışır) |\n| OUT | Hareket varken HIGH, yokken LOW |\n| GND | Toprak |\n\nOUT ucunu modül kendisi sürer. Bu yüzden Arduino'da `INPUT_PULLUP` değil, düz `INPUT` kullanırsın. Butondaki ters mantık burada yoktur: hareket = HIGH.\n\n### Isınma süresi\nPIR açıldığında çevresindeki ısı dengesine alışmak için bir süre bekler. Bu sürede OUT rastgele HIGH ve LOW verebilir. Gerçek modüllerde süre genelde yarım dakikadan bir dakikaya kadardır ve modüle göre değişir. Laboratuvar bunu 2 saniyeye kısaltır.\n\n```\nt = 0 s     güç verildi          OUT parazitli (yok say)\nt = 2 s     ısınma bitti         OUT artık güvenilir\n```\n\nAlarm gibi uygulamalarda açılıştan sonra bu süre kadar PIR okunmaz.\n\n### Tutma süresi ve oda dolu/boş kararı\nPIR hareket bitse bile OUT'u bir süre HIGH tutar. Laboratuvarda bu süre 3 saniyedir. Bu süreyi sensörün kendi kararı olarak kabul edersen, kıpırdamadan oturan biri için \"oda boş\" sonucu çıkabilir. Çözüm: her HIGH gördüğünde `millis()` ile bir zaman damgası kaydet ve ancak bu damgadan beri belirli süre geçerse \"boş\" de.\n\nÖrnek: son HIGH t = 23 s'de görüldü ve bekleme süresi 5 s ise \"boş\" kararı t = 28 s'de verilir.\n\n```\nif (digitalRead(PIR) == HIGH) sonHareket = millis();\nbool bos = (millis() - sonHareket >= BOS_SURE);\n```\n\n### Özet\nPIR, kızılötesi ışınımdaki değişimi algılayan pasif bir sensördür; OUT ucu hareket varken HIGH olur ve düz `INPUT` ile okunur. Açıldıktan sonra ısınana kadar çıkışına güvenilmez, bu yüzden bu süre boyunca okuma yok sayılır. Çıkışı doğrudan \"oda dolu\" saymak yerine, son hareketin zamanını tutup yeterince sessizlik geçince \"boş\" demek daha sağlamdır.",
          "concepts": [
            {
              "term": "PIR sensör",
              "definition": "Görüş alanındaki kızılötesi (ısı) ışınımının değişimini algılayan, kendisi ışık göndermeyen pasif sensör.",
              "example": "Koridorda yürüyen birinin ışığı yakan sensör: yürüyen kişi ışınımı bir yarıdan ötekine kaydırır.",
              "pitfall": "Hareketsiz duran birini de göreceğini sanmak; ışınım değişmediği için PIR onu fark etmeyebilir."
            },
            {
              "term": "OUT ucu ve INPUT",
              "definition": "PIR'ın OUT ucu hareket varken HIGH, yokken LOW olur; modül kendi gerilimini sürdüğü için pin düz INPUT yapılır.",
              "example": "pinMode(2, INPUT); digitalRead(2) == HIGH ise hareket vardır.",
              "pitfall": "INPUT_PULLUP kullanmak ya da butondaki gibi LOW'u hareket saymak; mantık ters kurulur."
            },
            {
              "term": "Isınma süresi",
              "definition": "PIR açıldıktan sonra çevreye alışırken çıkışının güvenilmez olduğu bekleme süresi.",
              "example": "Laboratuvardaki PIR'da ilk 2 saniye çıkış rastgele HIGH-LOW oynar; gerçek modüllerde yarım dakika ile bir dakika civarıdır.",
              "pitfall": "Isınmayı beklemeden okumaya başlamak: açılışta yalancı HIGH gelir ve alarm yersiz çalar."
            },
            {
              "term": "Tutma süresi",
              "definition": "Hareket bittikten sonra PIR'ın OUT ucunu HIGH tutmaya devam ettiği süre.",
              "example": "Laboratuvar PIR'ı hareket bitince çıkışı 3 saniye daha HIGH tutar.",
              "pitfall": "Hareket kutusunu kaldırdığın anda OUT'un LOW olacağını beklemek."
            },
            {
              "term": "Son hareket zamanı",
              "definition": "Her HIGH görüşte millis() değerini saklayıp yeterince sessizlik geçince \"boş\" demek.",
              "example": "sonHareket = millis(); ... if (millis() - sonHareket >= BOS_SURE) oda boş.",
              "pitfall": "Sensör çıkışını doğrudan oda dolu bilgisi saymak; kıpırdamadan oturan biri \"yok\" sayılabilir."
            }
          ],
          "quiz": [
            {
              "id": "m4h2d1-q1",
              "kind": "mcq",
              "prompt": "PIR sensörü neyi algılar?",
              "options": [
                "Ses dalgası gönderip yankısının dönme süresini",
                "Görüş alanındaki kızılötesi ışınımın değişimini",
                "Cismin rengini ve parlaklığını",
                "Yakındaki mıknatısın alanını"
              ],
              "answer": 1,
              "explanation": "PIR pasiftir: kendisi bir şey göndermez, yalnız görüş alanındaki kızılötesi ışınımın değişimini dinler. Ses gönderip yankı bekleyen sensör HC-SR04'tür; PIR rengi ya da mıknatısı algılamaz.",
              "skills": [
                "sensor-pir"
              ]
            },
            {
              "id": "m4h2d1-q2",
              "kind": "mcq",
              "prompt": "Alarm kartı prize takılınca PIR ilk saniyelerde rastgele HIGH-LOW veriyor ve siren yersiz çalıyor. Doğru önlem hangisidir?",
              "options": [
                "Pini INPUT_PULLUP yapmak",
                "Sirenin süresini kısaltmak",
                "Isınma süresi dolana kadar PIR okumasını yok saymak",
                "Her turda delay(1000) koymak"
              ],
              "answer": 2,
              "explanation": "Isınma sırasında PIR'ın çıkışı güvenilir değildir. Program, ısınma süresi dolana kadar PIR'ı okumaz (ya da okumayı yok sayar). INPUT_PULLUP pini etkilemez; çıkışı modül sürer. Her tura delay(1000) koymak sorunu çözmez, yalnız programı bloklar.",
              "skills": [
                "sensor-pir",
                "prog-timing"
              ]
            },
            {
              "id": "m4h2d1-q3",
              "kind": "numeric",
              "prompt": "pir_oda_dolu sketch'inde BOS_SURE = 5000 ms yapıldı. Laboratuvardaki PIR'da Hareket kutusunu t = 20 s'de işaretleyip t = 23 s'de kaldırıyorsun. OUT, hareket bittikten sonra 3 s daha HIGH kalıyor. Sketch kaçıncı saniyede \"Oda bos\" der?",
              "answer": 31,
              "tolerance": 0.2,
              "unit": "s",
              "explanation": "Kutu t = 23 s'de kaldırılır; OUT 3 s daha HIGH kalır, yani t = 26 s'ye kadar sonHareket yenilenir. Oda bundan sonra 5 s sessizlik gerekir: 26 + 5 = 31 s. Sensörün kendi tutma süresi, yazılımdaki BOS_SURE'nin üstüne biner.",
              "skills": [
                "sensor-pir",
                "prog-millis",
                "prog-timing"
              ]
            },
            {
              "id": "m4h2d1-q4",
              "kind": "predict-output",
              "prompt": "PIR OUT ucu, her turda okunmak üzere sırasıyla LOW, HIGH, HIGH, HIGH, LOW, LOW oluyor. Bu kod çalışınca seri monitörde ne yazar?\n\n```\nbool onceki = false;\n\nvoid setup() {\n  pinMode(2, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool h = (digitalRead(2) == HIGH);\n  if (h && !onceki) Serial.println(\"A\");\n  if (!h && onceki) Serial.println(\"B\");\n  onceki = h;\n}\n```",
              "options": [
                "A, A, A, B (HIGH kaldığı her tur için A)",
                "A ve B, birer kez",
                "B ve A, birer kez",
                "Hiçbir şey yazmaz"
              ],
              "answer": 1,
              "explanation": "Kod yalnız değişimleri (kenarları) yazar. LOW'dan HIGH'a geçişte bir kez \"A\", HIGH'dan LOW'a geçişte bir kez \"B\" yazılır. HIGH'ın üç tur sürmesi üç satır üretmez; seviye değil, kenar yazdırılır.",
              "skills": [
                "prog-edge-detect",
                "sensor-pir"
              ]
            },
            {
              "id": "m4h2d1-q5",
              "kind": "find-bug",
              "prompt": "Hareket varken LED yansın istiyoruz. PIR modülü doğru bağlı; ama Hareket kutusu işaretliyken LED sönük, işaretsizken yanıyor. Hatalı satır hangisi?\n\n```\nconst int PIR = 2;\n\nvoid setup() {\n  pinMode(PIR, INPUT);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, digitalRead(PIR) == LOW);\n}\n```",
              "options": [
                "const int PIR = 2;",
                "pinMode(PIR, INPUT);",
                "pinMode(13, OUTPUT);",
                "digitalWrite(13, digitalRead(PIR) == LOW);"
              ],
              "answer": 3,
              "explanation": "PIR hareket varken HIGH verir; kodda LOW ile karşılaştırılınca LED hareket yokken yanar. Doğrusu `digitalRead(PIR) == HIGH`. pinMode(PIR, INPUT) doğrudur: OUT'u modül sürdüğü için pull-up gerekmez.",
              "skills": [
                "sensor-pir",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "IR engel sensörü ve eşik ayarı",
          "durationMin": 20,
          "problem": "Bir fabrikada koli bandı üzerinden geçen kutuları kim sayıyor? Ya da otomatik sabun makinesi elini nereden anlıyor? Çoğunda aynı ucuz parça vardır: bir kızılötesi LED ve onun yansımasını bekleyen alıcı. Bu parçanın \"ne kadar yakın\" sorusuna verdiği cevap evet ya da hayırdır. Eşiği kim belirliyor?",
          "contentMd": "### IR engel sensörü nedir?\nIR engel (obstacle avoidance) modülü, kızılötesi ışık yollar ve yansıyan ışığı alıcıyla yakalar. Önünde bir cisim varsa ışık geri döner ve modül çıkışını değiştirir. 36. dersteki ultrasonik sensör mesafeyi **santimetre olarak** ölçüyordu; bu modül ise yalnız \"engel var / yok\" der.\n\nGerçek modülün üzerinde küçük bir ayar vidası (trimpot) vardır. Bu vida, **ne kadar yansımanın \"engel\" sayılacağını** belirler, yani eşiği donanımda ayarlar. Algılama mesafesi vidaya, ortama ve cismin rengine ve yüzeyine bağlıdır; açık renkli, mat yüzeyler genelde daha kolay algılanır, koyu ve parlak yüzeyler zor olabilir. Kesin değerler **modüle göre değişir**.\n\nLaboratuvardaki IR engel parçasında mesafe yerine iki kaydırıcı vardır: **Yakınlık** (0-1, cismin ne kadar yansıma verdiği; büyüdükçe AO gerilimi artar) ve **Eşik (ayar vidası)** (0-1). Yakınlık eşiğe ulaşınca ya da geçince engel algılanır. Eşiği büyütmek, vidayı \"daha az duyarlı\" yapmaktır.\n\n**Çıkış seviyesi:** Yaygın modüllerde engel varken çıkış LOW olur, yokken HIGH. Ama bu **modüle göre değişebilir**: bazı modüller tersini yapar. O yüzden kodda seviyeyi bir sabite koyacağız. Laboratuvardaki parça yaygın düzeni izler: engel varken OUT LOW, yokken HIGH.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| IR engel | VCC → 5V, GND → GND, OUT → **D3** |\n| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |\n| LED | A → direncin 2 ucu, K → GND |\n| (Analog program için) IR engel | AO → **A0** |\n\nÇıkışı modül kendisi sürdüğü için `INPUT` kullanıyoruz.\n\n### Program\n```cpp\n// sketch: ir_engel\nconst int IR = 3;\nconst int LED = 13;\nconst int ENGEL_SEVIYESI = LOW;   // modülüne göre HIGH olabilir\n\nvoid setup() {\n  pinMode(IR, INPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool engel = (digitalRead(IR) == ENGEL_SEVIYESI);\n  digitalWrite(LED, engel);\n  Serial.println(engel ? \"Engel var\" : \"Engel yok\");\n  delay(200);\n}\n```\n\nModülün çıkışı bazen kenarda anlık olarak oynar. Bir cismi **saymak** istiyorsak 8. dersteki fikri kullanırız: değişim ancak belli süre kararlı kalırsa kabul edilir. Ardından bir cismin geçişi tek sayım olur:\n\n```cpp\n// sketch: ir_sayac_kararli\nconst int IR = 3;\nconst int ENGEL_SEVIYESI = LOW;\nconst unsigned long KARARLI_MS = 30;\n\nbool kararliEngel = false;      // kabul edilmiş durum\nbool sonOkunan = false;         // en son okunan ham durum\nunsigned long sonDegisim = 0;\nint sayac = 0;\n\nvoid setup() {\n  pinMode(IR, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  bool engel = (digitalRead(IR) == ENGEL_SEVIYESI);\n\n  if (engel != sonOkunan) {          // ham okuma değişti: sayacı başa al\n    sonOkunan = engel;\n    sonDegisim = simdi;\n  }\n\n  if (sonOkunan != kararliEngel && simdi - sonDegisim >= KARARLI_MS) {\n    kararliEngel = sonOkunan;        // yeterince kararlı: kabul et\n    if (kararliEngel) {              // engel geldi: bir cisim say\n      sayac++;\n      Serial.print(\"Sayac: \");\n      Serial.println(sayac);\n    }\n  }\n}\n```\n\nBazı modüllerde dijital çıkışa ek olarak **analog çıkış (AO)** da bulunur. O zaman eşiği yazılımda kendin seçersin. Hangi yönde değiştiği (engel varken değerin artması mı azalması mı) modüle göre değişir. Aşağıdaki örnekte \"değer yüksek = engel yakın\" varsayıldı; laboratuvardaki parça da böyle çalışır. Gerçek bir modülde `Serial.println(analogRead(A0))` ile bakıp ters ise koşulları çevirmek gerekir. İki ayrı eşik kullanıyoruz (**histerezis**, 35. dersteki termostat gibi): değer eşik civarında dalgalansa da çıktı titremez.\n\n```cpp\n// sketch: ir_analog_esik\nconst int AO = A0;\nconst int LED = 13;\nconst int ESIK_YUKSEK = 600;   // bunun üstünde engel var say\nconst int ESIK_ALCAK = 500;    // bunun altında engel yok say\n\nbool engel = false;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int deger = analogRead(AO);\n  if (!engel && deger >= ESIK_YUKSEK) {\n    engel = true;\n    Serial.println(\"Engel var\");\n  } else if (engel && deger <= ESIK_ALCAK) {\n    engel = false;\n    Serial.println(\"Engel yok\");\n  }\n  digitalWrite(LED, engel);\n  delay(20);\n}\n```\n\n### Nasıl çalışıyor?\n1. `ir_engel`: `ENGEL_SEVIYESI` sabiti modülün \"engel var\" seviyesini söyler. Kodun geri kalanı bu sabite dayanır; modül tersse tek satırı değiştirirsin.\n2. `ir_sayac_kararli`: ham okuma değiştiği anda sayaç sıfırlanır. Değişim 30 ms boyunca sürerse kabul edilir. Sayım yalnız \"engel geldi\" kenarında yapılır; yani uzun süre duran bir cisim tek sayılır.\n3. `ir_analog_esik`: durum iki eşik arasında kalırsa önceki durum korunur. Böylece değer 550 civarında oynasa da çıktı değişmez.\n4. Donanım vidası ile yazılım eşiği iki ayrı yerdir. Dijital çıkışta eşik vidada, analog çıkışta kodda ayarlanır.\n\n### Dene\n- `ir_engel` programını çalıştırırken IR engel parçasını seç ve **Yakınlık** kaydırıcısını 0'dan 1'e doğru yavaşça çek. LED ve seri monitör hangi değerde değişiyor? Bu değer **Eşik** değerine eşit mi?\n- Yakınlığı 0,6 yap, sonra **Eşik (ayar vidası)** değerini 0,8'e çıkar. Engel yok sayılıyor mu? Parlak siyah bir yüzey de gerçekte böyle, az yansıma verdiği için eşiği geçemeyebilir.\n- `ir_analog_esik` ile yakınlığı 0,3 - 0,5 - 0,7 yap. 0,5'te durum ne oluyor? Önce 0,7'den 0,5'e, sonra 0,3'ten 0,5'e git ve sonucu karşılaştır; bu histerezistir.\n- `ir_sayac_kararli` içindeki `KARARLI_MS` değerini 0 yap. Laboratuvar modeli titreşim üretmediği için sayaç şaşmaz. Gerçek modülde şaşabilirdi; neden bu bekleme süresi gerçek devre için yine de gereklidir, kendi cümlenle yaz.\n\n### Sık yapılan hatalar\n- \"Engel varken çıkış LOW olur\" bilgisini her modül için doğru sanmak: gerçek modülün belgesine bak.\n- Gerçek donanımda sensörü doğrudan güneş ışığına ya da güçlü lamba ışığına çevirmek: ortam ışığındaki kızılötesi ölçümü bozabilir (laboratuvar bunu modellemez).\n- Analog eşikte tek eşik kullanmak: değer eşik civarında dalgalanınca çıktı sürekli değişir.\n- Sayım yaparken kenar yerine seviyeyi saymak: duran cisim sürekli sayılır.\n- Tek eşikle hem mesafeyi hem rengi çözmeyi beklemek: IR sensör cisim rengine ve yüzeyine duyarlıdır.",
          "question": "Koli bandında sayım yaparken iki kutu birbirine çok yakın geçerse sensör bunları tek kutu sayar. Bunu hangi yöntemlerle çözebilirsin: yazılımla mı, sensörün yerini değiştirerek mi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- IR engel sensörünün nasıl çalıştığını ve neden \"var/yok\" dediğini\n- Dijital çıkış (OUT) ile analog çıkış (AO) arasındaki farkı\n- Eşiğin nerede ayarlandığını: donanımda vida, yazılımda sayı\n- **Histerezis** ile eşik civarında titremeyi nasıl engelleyeceğini\n- Cisim saymak için seviye yerine **kenar** saymayı\n\n### Önceden bilmen gerekenler\n- 8. ders: debounce ve kenar algılama\n- 11. ders: `analogRead` (0-1023)\n- 35. ders: termostatta iki eşikli (histerezisli) karar\n- 36. ders: ultrasonik sensör mesafeyi santimetre olarak ölçer\n\n### Işık gönder, yansımayı dinle\nIR engel modülü kızılötesi bir LED ile ışık yollar, yansıyan ışığı alıcıyla yakalar. Önünde cisim varsa daha çok ışık döner. Ultrasonik sensörün tersine mesafe ölçmez: yansıma belli bir düzeyi geçti mi, geçmedi mi diye karar verir.\n\nYansımanın şiddeti yalnız uzaklığa değil, cismin **rengine ve yüzeyine** de bağlıdır. Açık renkli mat yüzey çok ışık döndürür. Koyu ya da parlak yüzey az döndürür ve daha yakında bile algılanmayabilir.\n\n### Dijital ve analog çıkış\nModülde iki çıkış olabilir:\n\n| Çıkış | Ne verir | Eşik nerede |\n|---|---|---|\n| OUT | Engel var / yok (dijital) | Modüldeki ayar vidasında |\n| AO | Yansıma şiddeti (analog) | Senin yazdığın sayıda |\n\nLaboratuvardaki modülde OUT, engel varken LOW, yokken HIGH olur. Başka modüllerde ters olabilir. Bu yüzden seviyeyi `const int ENGEL_SEVIYESI = LOW;` gibi bir sabite koymak iyi alışkanlıktır.\n\nLaboratuvar modeli AO gerilimini yakınlıkla doğrusal artırır: yakınlık 0 iken yaklaşık 0,25 V, 1 iken yaklaşık 4,75 V. Yani `analogRead` değeri yaklaşık 51 ile 972 arasında gezinir. Yakınlık 0,4 iken yaklaşık 419, 0,8 iken yaklaşık 788 okursun.\n\n### Tek eşik titretir\nAO değeri 550 civarında dalgalanıyorsa ve tek eşik 550 ise çıktı sürekli açılıp kapanır. Çözüm iki eşiktir:\n\n```\nyüksek eşik = 600   (bunun üstüne çıkınca \"engel var\")\nalçak eşik  = 500   (bunun altına inince \"engel yok\")\n```\n\nAradaki 500-600 bölgesinde durum **değişmez**. Buna histerezis denir. Okumalar 450, 620, 550, 520, 480, 590 gelirse yalnız iki değişim olur: 620'de \"var\", 480'de \"yok\".\n\n### Saymak için kenar\nBir koli bandında kutuları sayıyorsan, kutu sensörün önünde dururken her turda sayarsan sayaç hızla şişer. Doğrusu \"engel yoktan vara geçtiği an\" bir kez saymaktır; bu bir **kenar**dır. Gerçek modüllerde kenar civarındaki titreşimi elemek için değişimin kısa bir süre kararlı kalması beklenir (debounce).\n\n### Özet\nIR engel sensörü yansıyan kızılötesi ışığa bakarak \"engel var/yok\" der; mesafeyi ölçmez ve cismin rengine duyarlıdır. Dijital çıkışta eşik modüldeki vidadadır, analog çıkışta ise kodda iki eşikle (histerezis) belirlenir. Cisim saymak için seviyeyi değil, yoktan vara geçişi saymak gerekir.",
          "concepts": [
            {
              "term": "IR engel sensörü",
              "definition": "Kızılötesi ışık gönderip yansımasını yakalayarak önünde engel olup olmadığını söyleyen modül; mesafeyi ölçmez.",
              "example": "Otomatik sabun makinesi elini bu şekilde fark eder.",
              "pitfall": "Ondan santimetre cinsinden mesafe beklemek; yalnız \"var/yok\" bilgisi verir."
            },
            {
              "term": "Yansıma ve yüzey",
              "definition": "Algılama, cismin geri döndürdüğü ışığın miktarına bağlıdır; renk ve yüzey bunu değiştirir.",
              "example": "Beyaz mat kutu çok yansıtır; parlak siyah yüzey az yansıtır ve daha yakında bile algılanmayabilir.",
              "pitfall": "Aynı mesafede her cismin aynı sonucu vereceğini sanmak."
            },
            {
              "term": "Eşik",
              "definition": "Yansımanın \"engel var\" sayılması için aşması gereken düzey. Dijital çıkışta modüldeki vidayla, analog çıkışta kodla ayarlanır.",
              "example": "Laboratuvarda Eşik kaydırıcısı 0,5 iken Yakınlık 0,5 ve üstü engel sayılır.",
              "pitfall": "Hem vidayı hem kodu aynı işi yapıyor sanmak; dijital çıkışta kod eşiği görmez."
            },
            {
              "term": "Çıkış seviyesi sabiti",
              "definition": "Modülün \"engel var\" derken hangi seviyeyi verdiğini const int ile bir kez yazıp kodun her yerinde onu kullanmak.",
              "example": "const int ENGEL_SEVIYESI = LOW; ... digitalRead(IR) == ENGEL_SEVIYESI",
              "pitfall": "Her modülün engelde LOW verdiğini varsaymak; bazı modüller tersini yapar."
            },
            {
              "term": "Histerezis",
              "definition": "Aç ve kapa kararı için iki ayrı eşik kullanıp aradaki bölgede önceki durumu korumak.",
              "example": "Eşikler 600 ve 500 iken 550 civarında oynayan AO değeri çıktıyı titretmez.",
              "pitfall": "Tek eşik kullanmak: değer eşik civarında dalgalanınca çıktı sürekli değişir."
            },
            {
              "term": "Kenar sayma",
              "definition": "Bir cismi yalnız \"yoktan vara\" geçtiği anda bir kez saymak.",
              "example": "Bandın önünde 3 saniye duran kutu tek sayılır.",
              "pitfall": "Seviyeyi saymak: duran kutu her turda yeniden sayılır."
            }
          ],
          "quiz": [
            {
              "id": "m4h2d2-q1",
              "kind": "mcq",
              "prompt": "IR engel modülü ile HC-SR04 arasındaki en önemli fark hangisidir?",
              "options": [
                "IR engel modülü santimetre cinsinden mesafe verir, HC-SR04 vermez",
                "IR engel modülü yalnızca engel var/yok der, HC-SR04 mesafe ölçer",
                "IR engel modülü ses, HC-SR04 ışık kullanır",
                "IR engel modülü yüzey rengine hiç duyarlı değildir"
              ],
              "answer": 1,
              "explanation": "IR engel modülünün dijital çıkışı yalnız \"engel var/yok\" der; eşik vidayla belirlenir. Mesafeyi santimetre olarak veren HC-SR04'tür. Her iki sensör de yüzeyden etkilenir; ikisi de pasif değildir, çünkü ikisi de kendi sinyalini gönderir.",
              "skills": [
                "sensor-ir-obstacle"
              ]
            },
            {
              "id": "m4h2d2-q2",
              "kind": "mcq",
              "prompt": "Parlak siyah bir kutuyu IR engel modülünün önüne tutuyorsun ama modül hiç algılamıyor; beyaz kutu ise rahatça algılanıyor. En olası açıklama hangisidir?",
              "options": [
                "Kutu çok uzakta olduğu için ses geri dönmüyor",
                "Siyah yüzey az yansıtır, yansıma eşiği aşamıyor",
                "INPUT_PULLUP kullanılmamış",
                "Siyah kutuda manyetik alan oluşuyor"
              ],
              "answer": 1,
              "explanation": "Koyu ve parlak yüzey ışığı sensöre geri döndürmez; yansıma eşiği aşamaz. Çözüm eşiği (vidayı) daha duyarlı yapmak ya da ölçümü yüzeye göre kalibre etmektir. Sensör bozuk değildir ve kod hatası aramak gerekmez; yüzey etkisi gerçek donanımın bilinen bir özelliğidir.",
              "skills": [
                "sensor-ir-obstacle"
              ]
            },
            {
              "id": "m4h2d2-q3",
              "kind": "numeric",
              "prompt": "ir_analog_esik'te ESIK_YUKSEK = 600, ESIK_ALCAK = 500 ve başlangıçta \"engel yok\". AO'dan sırasıyla 450, 620, 550, 520, 480, 590 okunuyor. Kaç kez \"Engel var\" ya da \"Engel yok\" satırı yazılır?",
              "answer": 2,
              "tolerance": 0,
              "unit": "satır",
              "explanation": "450: yok kalır. 620 >= 600: \"Engel var\" (1). 550 ve 520 arada kalır, durum korunur. 480 <= 500: \"Engel yok\" (2). 590 < 600, hâlâ yok. Toplam 2 satır. Tek eşik 550 olsaydı 620'de, 520'de ve 590'da olmak üzere üç değişim yazılırdı; histerezis bunu ikiye indirir.",
              "skills": [
                "prog-hysteresis",
                "sensor-ir-obstacle"
              ]
            },
            {
              "id": "m4h2d2-q4",
              "kind": "predict-output",
              "prompt": "Laboratuvardaki IR engel parçasında AO ucu A0'a bağlı. AO gerilimi yakınlıkla doğrusal artar (yakınlık 0 için yaklaşık 51, yakınlık 1 için yaklaşık 972 okuma). Yakınlığı önce 0,4, sonra 0,8 yaparsın. Seri monitörde ne görürsün?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (analogRead(A0) >= 600) Serial.println(\"Y\");\n  else Serial.println(\"N\");\n  delay(500);\n}\n```",
              "options": [
                "Önce hep Y, sonra hep N",
                "Hep N",
                "Hep Y",
                "Önce hep N, sonra hep Y"
              ],
              "answer": 3,
              "explanation": "Yakınlık 0,4 iken AO okuması yaklaşık 419 olduğu için 600'ün altındadır: N yazılır. Yakınlık 0,8 iken yaklaşık 788 olur, 600'ü geçer: Y yazılır. AO yakınlıkla arttığı için sıra N'den Y'ye doğrudur.",
              "skills": [
                "sensor-ir-obstacle",
                "prog-debug"
              ]
            },
            {
              "id": "m4h2d2-q5",
              "kind": "find-bug",
              "prompt": "Konveyör bandındaki kutuları saymak istiyorsun. Tek kutu sensörün önünde bir saniye duruyor ve sayaç 10'a çıkıyor (her 100 ms'de bir artıyor). Sorun hangi satırda?\n\n```\nint sayac = 0;\n\nvoid setup() {\n  pinMode(3, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool engel = (digitalRead(3) == LOW);\n  if (engel) {\n    sayac++;\n    Serial.println(sayac);\n  }\n  delay(100);\n}\n```",
              "options": [
                "pinMode(3, INPUT);",
                "bool engel = (digitalRead(3) == LOW);",
                "if (engel) {",
                "delay(100);"
              ],
              "answer": 2,
              "explanation": "`if (engel)` seviyeyi sınar: engel var olduğu sürece her turda sayaç artar. Doğrusu \"önceki tur engel yoktu, şimdi var\" kenarını sınamaktır (bool onceki tutup `engel && !onceki`). Okuma satırı ve pinMode doğrudur.",
              "skills": [
                "prog-edge-detect",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Reed anahtarı ve limit anahtarı",
          "durationMin": 20,
          "problem": "Evdeki pencere alarmının iki küçük parçası vardır: biri çerçeveye, biri kanada yapıştırılır. Pencere kapalıyken aralarında bir şey olmaz ama açılınca alarm öter. Aralarında kablo da yok. Bir de yazıcının kafası ya da 3B yazıcının ekseni uç noktaya gelince durur; nasıl bilir?",
          "contentMd": "### İki anahtar, aynı mantık\n**Reed anahtarı:** cam bir tüpün içinde iki ince metal dil. Yanına mıknatıs gelince dillerin kontağı **kapanır**, mıknatıs uzaklaşınca açılır. Elektrik bakımından bir butondur; basan şey parmak yerine mıknatıstır.\n\n**Limit anahtarı (mikro şalter):** küçük bir kol ya da düğmeye mekanik olarak basılınca kontağı değişen anahtar. Hareketli bir parça uç noktaya gelince kola çarpar. Bu da elektrik bakımından bir butondur. Laboratuvarda ayrı bir limit anahtarı parçası yok; limit anahtarı yerine **buton** parçasını kullan. **Basılı** kutusu \"kola basıldı\" demektir.\n\nİkisi de 6. dersteki butonla aynı yöntemle okunur: bir ucu pine, öbür ucu GND'ye, pin `INPUT_PULLUP`. Kontak kapanınca pin GND'ye bağlanır ve `LOW` okunur, kontak açıkken `HIGH`.\n\n| Anahtar | Kontak kapalı (LOW) olduğunda | Laboratuvarda |\n|---|---|---|\n| Reed | Mıknatıs yakın (kapı kapalı, mıknatıs ve reed karşı karşıya) | **Mıknatıs yakın** kutusu işaretli |\n| Limit | Kola basılı | Butonun **Basılı** kutusu işaretli |\n\nGerçek limit anahtarlarında genelde üç uç vardır: ortak (COM), normalde açık (NO) ve normalde kapalı (NC). NO ucunu kullanırsan basınca kontak kapanır, yukarıdaki gibi. **NC ucunu** kullanırsan tersi olur: basılmayınca kontak kapalıdır, basınca açılır. Laboratuvardaki buton yalnız NO gibi çalışır. Güvenlik uygulamalarında NC bağlantı tercih edilebilir, çünkü kablo kopsa bile pin HIGH olur ve sistem bunu \"kontak açıldı\" diye algılar. Yani arıza sessiz kalmaz. Ama bu mantığı kodda tersine çevirmek gerekir.\n\n**Debounce hatırlatması:** 8. derste öğrendiğin gibi gerçek mekanik kontaklar kapanırken kısa süre titrer (bounce). Reed anahtarının dilleri ve limit anahtarının kolu da titrer. Titreşimi bir değişiklik sanıp olay üretirsek yalancı alarm çıkar. O yüzden değişimi ancak kısa bir süre kararlı kalırsa kabul ederiz. Laboratuvardaki reed ve buton temiz değişir, titreşim üretmez; kodun debounce kısmı yine de gerçek devre için doğru alışkanlıktır.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Reed | A → **D4**, B → GND (`INPUT_PULLUP`) |\n| Buton (limit anahtarı yerine) | A → **D3**, B → GND (`INPUT_PULLUP`) |\n| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |\n| LED | A → direncin 2 ucu, K → GND |\n\nGerçek hazır reed modüllerinin üzerinde kendi direnci ve çıkışı olabilir; laboratuvardaki reed çıplak reed gibidir, bu yüzden `INPUT_PULLUP` şarttır.\n\n### Program\n```cpp\n// sketch: reed_kapi\nconst int REED = 4;\nconst int LED = 13;\nconst unsigned long KARARLI_MS = 20;\n\nbool kararliKapali = false;    // kapı kapalı mı (mıknatıs yakın)?\nbool sonOkunan = false;\nunsigned long sonDegisim = 0;\n\nvoid setup() {\n  pinMode(REED, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  bool kapali = (digitalRead(REED) == LOW);      // LOW = kontak kapalı = mıknatıs yakın\n\n  if (kapali != sonOkunan) {\n    sonOkunan = kapali;\n    sonDegisim = simdi;\n  }\n  if (sonOkunan != kararliKapali && simdi - sonDegisim >= KARARLI_MS) {\n    kararliKapali = sonOkunan;\n    Serial.println(kararliKapali ? \"Kapi kapali\" : \"Kapi acik\");\n  }\n\n  digitalWrite(LED, !kararliKapali);             // kapı açıkken LED yansın\n}\n```\n\nİki anahtarı birlikte, aynı mantıkla okumak için diziler kullanabiliriz (4. derste diziler ve `for` döngüsünü görmüştün). Burada her anahtar için kendi \"son değişim\" zamanı tutulur:\n\n```cpp\n// sketch: kontak_debounce\nconst int PIN_SAYISI = 2;\nconst int PINLER[PIN_SAYISI] = {4, 3};     // 0: reed (D4), 1: limit (D3)\nconst unsigned long KARARLI_MS = 20;\n\nbool kararli[PIN_SAYISI];\nbool sonOkunan[PIN_SAYISI];\nunsigned long sonDegisim[PIN_SAYISI];\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < PIN_SAYISI; i++) {\n    pinMode(PINLER[i], INPUT_PULLUP);\n    kararli[i] = false;                   // false = kontak açık\n    sonOkunan[i] = false;\n    sonDegisim[i] = 0;\n  }\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  for (int i = 0; i < PIN_SAYISI; i++) {\n    bool kapali = (digitalRead(PINLER[i]) == LOW);\n    if (kapali != sonOkunan[i]) {\n      sonOkunan[i] = kapali;\n      sonDegisim[i] = simdi;\n    }\n    if (sonOkunan[i] != kararli[i] && simdi - sonDegisim[i] >= KARARLI_MS) {\n      kararli[i] = sonOkunan[i];\n      Serial.print(i == 0 ? \"Reed: \" : \"Limit: \");\n      Serial.println(kararli[i] ? \"kapali\" : \"acik\");\n    }\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. Pin `INPUT_PULLUP` olduğu için kontak açıkken `HIGH`, kapalıyken `LOW` okunur. Kodda \"kapali = (digitalRead(...) == LOW)\" yazarak bu ters mantığı bir kez çeviririz.\n2. Ham okuma değişince `sonDegisim` yenilenir. Değişim `KARARLI_MS` boyunca sürerse yeni durum kabul edilir ve mesaj yazılır. Daha kısa süren titreşimler mesaj üretmez.\n3. `reed_kapi` kapı durumunu tutar; LED kapı açıkken yanar. Bu, projedeki alarmın temel fikridir.\n4. `kontak_debounce` aynı mantığı dizilerle çoğaltır. Yeni bir anahtar eklemek için `PINLER` dizisine pin yazman ve `PIN_SAYISI`ni artırman yeter.\n\n### Dene\n- `reed_kapi` çalışırken reed parçasını seç ve **Mıknatıs yakın** kutusunu işaretle, sonra kaldır. LED ve seri monitör nasıl değişiyor? Not: sade bir reed anahtarı mıknatısın hangi kutbunun yaklaştığına bakmaz, ikisinde de kapanır.\n- Çalışırken reed'i seçince sağ panelde **Sanal ölçüm** ile uçlarındaki gerilimi oku. Kontak açıkken kaç volt, kapalıyken kaç volt görüyorsun? Bu değerleri `INPUT_PULLUP` ile açıkla.\n- `kontak_debounce` ile butonu (limit) ve reed'i sırayla çalıştır. Mesajlar birbirine karışıyor mu?\n- Limit anahtarını NC ucuna bağlasaydın kodda hangi satırı değiştirmen gerekirdi? Laboratuvarda NC yok; cevabı kodu inceleyerek yaz.\n\n### Sık yapılan hatalar\n- Reed anahtarını `INPUT_PULLUP` olmadan bağlamak: kontak açıkken pin havada kalır, rastgele okuma verir.\n- \"Mıknatıs yakın = HIGH\" sanmak: `INPUT_PULLUP` ile kontak kapanınca pin LOW olur.\n- Debounce koymamak: gerçek devrede kapı sallanınca ya da kol titreşince yalancı olaylar çıkar.\n- Reed'in ikinci ucunu GND'ye bağlamayı unutmak: kontak kapansa bile pin LOW olmaz, \"Kapi kapali\" hiç yazmaz.\n- NO ile NC'yi karıştırmak: devre tersine çalışır.",
          "question": "Alarm sisteminde kapı kontağını NC bağlamak, NO bağlamaktan neden daha güvenli olabilir? Bir hırsız kabloyu keserse iki bağlantıda da ne olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Reed anahtarının ve limit anahtarının elektrik bakımından birer buton olduğunu\n- Bu anahtarları `INPUT_PULLUP` ile nasıl okuyacağını ve neden LOW = kontak kapalı olduğunu\n- NO ve NC bağlantı farkını ve güvenlik açısından önemini\n- Kontak titreşimini (bounce) debounce ile nasıl eleyeceğini\n\n### Önceden bilmen gerekenler\n- 6. ders: `INPUT_PULLUP` ve basılı = LOW\n- 8. ders: debounce\n- 4. ders: dizi ve `for` döngüsü\n- 27. ders: `millis()` ile süre ölçme\n\n### Kontak anahtarları\n**Reed anahtarı**, cam tüp içinde iki ince metal dilden oluşur. Yanına mıknatıs gelince diller birbirine değer ve kontak **kapanır**. **Limit anahtarı** (mikro şalter) ise bir koldur: hareketli parça uç noktaya gelip kola basınca kontak değişir. İkisi de bir butondur; basan şey parmak yerine mıknatıs ya da bir parçadır.\n\n| Anahtar | Kontağı ne kapatır | Laboratuvarda |\n|---|---|---|\n| Reed | Yakındaki mıknatıs | Reed parçasında **Mıknatıs yakın** |\n| Limit | Kola basan parça | Buton parçasında **Basılı** |\n\n### INPUT_PULLUP ile okuma\nAnahtarın bir ucu pine, diğer ucu GND'ye gider ve pin `INPUT_PULLUP` yapılır:\n\n```\nkontak açık   -> pin iç dirençle 5 V'a çekilir -> HIGH\nkontak kapalı -> pin GND'ye bağlanır           -> LOW\n```\n\nPull-up unutulursa pin açık ucu havada kalır (yüzen giriş) ve okuma rastgele olur. Kodda ters mantığı bir kez çevirmek iyi olur: `bool kapali = (digitalRead(REED) == LOW);`.\n\n### NO ve NC\nGerçek limit anahtarlarında üç uç bulunur: ortak (COM), normalde açık (NO) ve normalde kapalı (NC).\n\n| Bağlantı | Dinlenme durumunda | Basılınca / mıknatıs gelince |\n|---|---|---|\n| NO | Kontak açık | Kapanır |\n| NC | Kontak kapalı | Açılır |\n\nAlarm sistemlerinde kural şudur: **alarm koşulunu \"kontağın açılması\" yap**. Kontak normalde kapalıyken (NC bağlantı) kapı açılınca kontak açılır ve pin HIGH okur. Hırsız kabloyu kesse de kontak açılır, pin yine HIGH okur ve alarm çalar; arıza sessiz kalmaz. Alarm koşulu \"kontağın kapanması\" olsaydı (NO bağlantı), kesilen kablo hiçbir şey değiştirmezdi ve sistem kör kalırdı. Bunun bedeli, kodda mantığın tersine çevrilmesidir: NC bağlıyken HIGH = ihlal, LOW = her şey yolunda.\n\n### Titreşim ve debounce\nMekanik kontaklar kapanırken kısa süre açılıp kapanır. Bir örnek zaman çizelgesi (ms cinsinden, 20 ms kararlılık koşuluyla):\n\n```\nt=0 LOW, t=3 HIGH, t=6 LOW, t=9 HIGH, t=12 LOW, sonra LOW kalıyor\n```\n\nHer değişimde sayaç sıfırlanır; son değişim t = 12'de olduğu için kabul t = 12 + 20 = 32 ms'de gerçekleşir. Dört değişim yerine tek, temiz bir olay elde edersin. Birden çok anahtar varsa her birinin kendi \"son değişim\" zamanı tutulur; bunu diziyle yaparsın.\n\n### Özet\nReed ve limit anahtarı birer kontaktır ve `INPUT_PULLUP` ile okunur: kontak kapalıyken LOW, açıkken HIGH. NC bağlantı kopan kabloyu bile bir olay olarak gösterdiği için güvenlik uygulamalarında tercih edilir, ama kodda mantığı tersine çevirmek gerekir. Kontak titreşimini elemek için değişim, belirli bir süre kararlı kaldıktan sonra kabul edilir.",
          "concepts": [
            {
              "term": "Reed anahtarı",
              "definition": "Cam tüpte iki metal dilden oluşan, yanına mıknatıs gelince kontağı kapanan anahtar.",
              "example": "Pencere alarmında çerçeveye reed, kanada mıknatıs yapıştırılır.",
              "pitfall": "Mıknatısın belirli bir kutbu gerektiğini sanmak; sade reed her iki kutupta da kapanır."
            },
            {
              "term": "Limit anahtarı",
              "definition": "Bir kola mekanik olarak basılınca kontağı değişen mikro şalter.",
              "example": "3B yazıcıda eksen uç noktaya gelince kola çarpıp durmayı tetikler.",
              "pitfall": "Onu özel bir sensör sanmak; elektrik bakımından sıradan bir butondur."
            },
            {
              "term": "INPUT_PULLUP ile okuma",
              "definition": "Anahtarın bir ucu pine, diğeri GND'ye bağlanır; kontak kapalıyken LOW, açıkken HIGH okunur.",
              "example": "pinMode(4, INPUT_PULLUP); kapali = (digitalRead(4) == LOW);",
              "pitfall": "Pull-up'ı unutmak: kontak açıkken pin havada kalır ve okuma rastgele olur."
            },
            {
              "term": "NO ve NC",
              "definition": "NO (normalde açık) basılınca kapanır; NC (normalde kapalı) basılınca açılır.",
              "example": "Alarm kapı kontağı NC bağlıysa kopan kablo da kontağı açar ve alarm verir.",
              "pitfall": "NO ile NC'yi karıştırmak: mantık tersine çalışır ya da kopan kablo fark edilmez."
            },
            {
              "term": "Kontak titreşimi (bounce)",
              "definition": "Mekanik kontak kapanırken bir an açılıp kapanır ve tek olay birkaç olay gibi görünür.",
              "example": "Kapı sallanınca reed bir an LOW-HIGH-LOW verebilir.",
              "pitfall": "Debounce koymamak: yalancı olaylar ve yalancı alarmlar üretilir."
            }
          ],
          "quiz": [
            {
              "id": "m4h2d3-q1",
              "kind": "mcq",
              "prompt": "Reed anahtarının bir ucu D4'e, diğer ucu GND'ye bağlı ve pin INPUT_PULLUP. Mıknatıs reed'e yaklaşınca digitalRead(4) ne verir?",
              "options": [
                "HIGH",
                "Okuma kararsızdır, rastgele",
                "LOW",
                "Yaklaşık 2,5 V ve belirsiz"
              ],
              "answer": 2,
              "explanation": "Mıknatıs kontağı kapatır, pin GND'ye bağlanır ve LOW okunur. Mıknatıs uzaktayken kontak açıktır ve iç pull-up pini 5 V'a çeker (HIGH). Sade reed mıknatısın hangi kutbunun yaklaştığına bakmaz.",
              "skills": [
                "sensor-contact"
              ]
            },
            {
              "id": "m4h2d3-q2",
              "kind": "mcq",
              "prompt": "Kapı kontağını NC bağlayıp \"kontak açıldı = ihlal\" kuralını uyguladın. Hırsız kapıya dokunmadan kontağın kablosunu kesiyor. Ne olur?",
              "options": [
                "Hiçbir şey olmaz, sistem kapıyı kapalı sanar",
                "Pin LOW okur ve sistem kapıyı kapalı sanar",
                "Pin HIGH okur ve sistem bunu ihlal sayar",
                "Arduino yeniden başlar"
              ],
              "answer": 2,
              "explanation": "Kablo kopunca devre açılır, pin INPUT_PULLUP sayesinde HIGH okur ve sistem bunu kontağın açılması, yani ihlal olarak görür. Alarm çalar. Kontak NO bağlı ve kural \"kontak kapanınca ihlal\" olsaydı, kesilen kablo hiçbir şeyi değiştirmez ve sistem sessiz kalırdı.",
              "skills": [
                "design-failsafe",
                "sensor-contact"
              ]
            },
            {
              "id": "m4h2d3-q3",
              "kind": "numeric",
              "prompt": "reed_kapi sketch'inde KARARLI_MS = 20. Reed kapanırken ham okuma 1 ms aralıkla şöyle değişiyor: t = 0'da LOW, 3'te HIGH, 6'da LOW, 9'da HIGH, 12'de LOW ve sonra LOW kalıyor. Program kapıyı kaçıncı milisaniyede \"kapalı\" olarak kabul eder?",
              "answer": 32,
              "tolerance": 1,
              "unit": "ms",
              "explanation": "Her ham değişimde sonDegisim yenilenir. Son değişim t = 12'dedir ve değer 20 ms boyunca sabit kalmalıdır: 12 + 20 = 32 ms. Daha öncesinde hiçbir değer 20 ms kararlı kalmadığı için erken kabul olmaz.",
              "skills": [
                "prog-debounce",
                "sensor-contact"
              ]
            },
            {
              "id": "m4h2d3-q4",
              "kind": "predict-output",
              "prompt": "Laboratuvarda Mıknatıs yakın kutusu işaretsiz başlıyor. Program iki satır yazdıktan sonra kutuyu işaretliyorsun. Toplam dört satırda ne görürsün?\n\n```\nvoid setup() {\n  pinMode(4, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  Serial.println(digitalRead(4) ? \"acik\" : \"kapali\");\n  delay(500);\n}\n```",
              "options": [
                "kapali, kapali, acik, acik",
                "acik, acik, kapali, kapali",
                "Hep acik",
                "Hep kapali"
              ],
              "answer": 1,
              "explanation": "İşaretsizken kontak açıktır, pin HIGH okunur (ifade doğru sayılır) ve \"acik\" yazılır. Kutu işaretlenince kontak kapanır, pin LOW olur (ifade yanlış sayılır) ve \"kapali\" yazılır. Sıra: acik, acik, kapali, kapali.",
              "skills": [
                "sensor-contact",
                "prog-debug"
              ]
            },
            {
              "id": "m4h2d3-q5",
              "kind": "find-bug",
              "prompt": "Reed'in bir ucu D4'te, diğer ucu GND'de. Mıknatıs uzakta olduğu hâlde LED ara sıra kendiliğinden yanıp sönüyor. Sorun hangi satırda?\n\n```\nconst int REED = 4;\n\nvoid setup() {\n  pinMode(REED, INPUT);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, digitalRead(REED) == LOW);\n}\n```",
              "options": [
                "const int REED = 4;",
                "pinMode(REED, INPUT);",
                "pinMode(13, OUTPUT);",
                "digitalWrite(13, digitalRead(REED) == LOW);"
              ],
              "answer": 1,
              "explanation": "Reed açıkken pin hiçbir yere bağlı değildir (yüzen giriş) ve okuma rastgele olur. `INPUT_PULLUP` pini açık kontakta 5 V'a çeker. Karşılaştırma (`== LOW` kontak kapalı demektir) doğrudur.",
              "skills": [
                "sensor-contact",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "VL53L0X (I2C ToF): hassas mesafe",
          "durationMin": 20,
          "problem": "HC-SR04 ile odanın boyunu ölçtün ama sensör bazen cismi hiç görmedi ya da yanlış yere yansıdı. İnce bir kablonun ucuna kadar yaklaşan bir parçayı ölçmek için ses yerine ışık kullanmak ister misin? Küçük bir kartın üzerinde bir ışık darbesinin gidiş-dönüş süresini ölçen bir sensör var: VL53L0X.",
          "contentMd": "### ToF nedir?\nToF (Time of Flight, uçuş süresi), sensörün bir ışık darbesi gönderip yansımasının dönüş süresini ölçmesidir. VL53L0X bunu kızılötesi bir lazerle yapar ve sonucu **milimetre** cinsinden verir. Veriyi Arduino'ya **I2C** ile iletir (33. dersteki `Wire`). Varsayılan I2C adresi **0x29**'dur.\n\nSınırlar için sensörün veri sayfasına bak. Ölçüm aralığı, doğruluk ve ortam ışığına tepkisi **modele ve kullanım koşullarına göre değişir**.\n\n**Önemli:** Laboratuvarda VL53L0X parçası **yok**. Bu derste devre kurmayacaksın; sensör kodunu yazıp derleyeceksin ve laboratuvarın sensörü bulamadığında programının ne yaptığını göreceksin. İyi bir program, sensör yoksa bunu fark edip haber verir.\n\nGerçek donanım notu: çoğu hazır breakout kartında 5 V'u düşüren bir regülatör vardır, ama çıplak çip 5 V'a dayanıklı değildir; kartın belgesine bakmak gerekir.\n\n### ToF ile ultrasonik karşılaştırması\n36-39. derslerdeki HC-SR04 ile VL53L0X'i genel hatlarıyla karşılaştıralım. Kesin sayılar için ikisinin de veri sayfasına bak.\n\n| Konu | HC-SR04 (ultrasonik) | VL53L0X (ToF) |\n|---|---|---|\n| Ölçüm yöntemi | Ses darbesinin yankısı | Işık darbesinin yansıması |\n| Bağlantı | TRIG ve ECHO için iki dijital pin, `pulseIn` | I2C (SDA ve SCL), kütüphane |\n| Menzil | Daha uzun menzil sunar | Genelde daha kısa menzil |\n| Hız | Ses yavaş olduğu için ölçüm yavaştır | Işık hızlı olduğu için ölçüm hızlı yapılabilir |\n| Yüzey bağımlılığı | Yumuşak (kumaş, sünger) ve eğik yüzeyler sesi dağıtabilir, 38. dersteki gibi | Koyu ve parlak yüzeyler, güçlü ortam ışığı sonucu etkileyebilir |\n| Işın genişliği | Ses konisi, yüzeye göre geniş yayılabilir | Işığın da belli bir görüş açısı vardır; açıları veri sayfalarından karşılaştır |\n| Pin sayısı | Pin harcar | İki I2C pini, diğer I2C cihazlarıyla paylaşılır |\n\nHangisi \"daha iyi\"? Soru yanlış. Büyük bir odada uzak duvarı ölçmek için ve yüzey önemli değilse ultrasonik uygun olabilir. Küçük, hızlı, dar bir açıyla ölçüm gerekiyorsa ToF uygundur. Ucuz olması ve basit olması yüzünden HC-SR04 hâlâ yaygındır.\n\n### Devre\nLaboratuvarda VL53L0X parçası olmadığı için bu derste devre kurulmaz. Gerçek bir devrede bağlantı şöyle olurdu (bilgi için):\n\n| Parça | Bağlantı |\n|---|---|\n| VL53L0X kartı | VCC → 5V (kartın belgesine bak), GND → GND, SDA → **A4**, SCL → **A5** |\n| Direnç (330 Ω) + LED | **D13** → direnç → LED A; LED K → GND |\n\nI2C adresi 0x29'dur. Gerçek devrede emin olmak için 33. dersteki adres tarama programı çalıştırılır; çıktıda 0x29 görünmelidir. Başka bir I2C cihazı (örneğin LCD 0x27) aynı hatta bağlanabilir, adresleri farklıdır.\n\n### Program\nAşağıdaki sketch'ler **Pololu VL53L0X** kütüphanesini kullanır. Başlık dosyası `#include <VL53L0X.h>`. Laboratuvarda sensör parçası olmadığı için bu sketch'ler yalnız **derlenir**; ölçüm davranışı (mm değerleri, eşik geçişleri) burada doğrulanmadı. Programı ▶ ile çalıştırırsan `init()` sensörü bulamaz ve seri monitörde \"VL53L0X bulunamadi\" yazar; bu beklenen davranıştır ve hata kontrolünün işe yaradığını gösterir.\n\nÖnce en basit okuma. `readRangeContinuousMillimeters()` sürekli ölçüm modunda sonucu milimetre olarak döndürür:\n\n```cpp\n// sketch: tof_okuma\n#include <Wire.h>\n#include <VL53L0X.h>\n\nVL53L0X sensor;\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  sensor.setTimeout(500);               // ms\n  if (!sensor.init()) {\n    Serial.println(\"VL53L0X bulunamadi\");\n    while (true) {}                     // sensör yoksa burada dur\n  }\n  sensor.startContinuous();             // sürekli ölçüm başlat\n}\n\nvoid loop() {\n  int mm = sensor.readRangeContinuousMillimeters();\n  if (sensor.timeoutOccurred()) {\n    Serial.println(\"Zaman asimi\");\n  } else {\n    Serial.print(mm);\n    Serial.println(\" mm\");\n  }\n  delay(100);\n}\n```\n\nŞimdi bir eşik ekleyelim: bir cisim 300 mm'den yakınsa LED yansın. Eşik civarında titremesin diye 35. dersteki histerezis fikrini kullandık:\n\n```cpp\n// sketch: tof_esik\n#include <Wire.h>\n#include <VL53L0X.h>\n\nVL53L0X sensor;\n\nconst int LED = 13;\nconst int YAKIN_MM = 300;      // bunun altında \"yakın\"\nconst int UZAK_MM = 340;       // bunun üstünde \"uzak\"\n\nbool yakin = false;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n  Wire.begin();\n  sensor.setTimeout(500);\n  if (!sensor.init()) {\n    Serial.println(\"VL53L0X bulunamadi\");\n    while (true) {}\n  }\n  sensor.startContinuous();\n}\n\nvoid loop() {\n  int mm = sensor.readRangeContinuousMillimeters();\n  if (!sensor.timeoutOccurred()) {\n    if (!yakin && mm < YAKIN_MM) {\n      yakin = true;\n      Serial.println(\"Yakin\");\n    } else if (yakin && mm > UZAK_MM) {\n      yakin = false;\n      Serial.println(\"Uzak\");\n    }\n  }\n  digitalWrite(LED, yakin);\n}\n```\n\n### Nasıl çalışıyor?\n1. `Wire.begin()` I2C hattını başlatır. `sensor.init()` sensöre ulaşabilirse doğru, ulaşamazsa yanlış döner. Bağlantı hatalarını bu şekilde yakalarız.\n2. `setTimeout(500)` okuma 500 ms içinde bitmezse `timeoutOccurred()` ile haber verilmesini sağlar. Okuma başarısızsa dönen sayıya güvenme; önce bu kontrolü yap.\n3. `startContinuous()` sensörün art arda ölçmesini başlatır. `readRangeContinuousMillimeters()` sonucu mm cinsinden verir.\n4. `tof_esik` içinde iki eşik vardır. Mesafe 300 mm'nin altına inince \"yakın\", 340 mm'nin üstüne çıkınca \"uzak\" olur. Arada kalırsa önceki durum korunur. HC-SR04 ile yaptığın medyan filtre (38. ders) burada da kullanılabilir.\n\n### Dene\n- `tof_okuma` programını laboratuvarda çalıştır. Seri monitörde ne yazıyor? `init()` kontrolünü silip çalıştırırsan ne olur? (Neden kontrolün gerekli olduğunu kendi cümlenle yaz.)\n- `tof_esik` içindeki `YAKIN_MM` ve `UZAK_MM` değerlerini 200 ve 260 yap, derle. Aradaki farkın (histerezis payı) neden sıfır olmaması gerektiğini açıkla.\n- Aynı eşik mantığını HC-SR04 ile (laboratuvarda Mesafe kaydırıcısıyla, 37. ders) yaz: 30 cm'den yakınsa LED yansın, 34 cm'den uzaksa sönsün. ToF kodundan farkı ne?\n- Koyu ve parlak yüzeylerin ToF ölçümünü nasıl etkileyebileceğini veri sayfasından araştır ve bir cümleyle yaz.\n\n### Sık yapılan hatalar\n- SDA ve SCL kablolarını ters bağlamak (ya da sensörün hiç olmaması): `init()` başarısız olur.\n- Gerçek donanımda 3,3 V mantıklı çıplak çipi 5 V'a bağlamak: kartın belgesine bakmadan bağlanmaz.\n- `timeoutOccurred()` kontrol etmemek: hatalı okumayı gerçek mesafe sanırsın.\n- `delay` uzun tutmak ya da bloklayıcı kod yazmak: 27. dersteki `millis()` yöntemini kullan.\n- Pololu kütüphanesi yerine başka bir VL53L0X kütüphanesinin fonksiyon adlarını kullanmak: kütüphaneler arasında adlar farklıdır.",
          "question": "Bir robotun önündeki engeli algılamak için HC-SR04 mi VL53L0X mi kullanırdın? Ortam açık havadaysa, yüzeyler yumuşaksa ya da robot çok hızlıysa tercihin değişir mi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- **ToF** (uçuş süresi) ölçümünün ışıkla nasıl yapıldığını\n- VL53L0X'in I2C üzerinden milimetre cinsinden mesafe verdiğini ve adresinin 0x29 olduğunu\n- `init()` ve `timeoutOccurred()` ile hatalı durumları yakalamayı\n- ToF ile HC-SR04'ü hangi bakımlardan karşılaştıracağını\n- Milimetre eşiklerinde histerezis payını hesaplamayı\n\n### Önceden bilmen gerekenler\n- 33. ders: I2C, `Wire` ve adres tarama\n- 35. ders: iki eşikli (histerezisli) karar\n- 36-38. dersler: ultrasonik ölçüm, yüzeyin ölçüme etkisi, filtre\n- 27. ders: `delay` yerine `millis()`\n\n### Işığın gidiş-dönüş süresi\n**ToF** (Time of Flight), sensörün kısa bir ışık darbesi yollayıp yansımanın geri dönme süresini ölçmesidir. Mesafe, ışığın hızı ve bu süreden hesaplanır. VL53L0X bunu kızılötesi bir lazerle yapar ve sonucu **milimetre** olarak verir. 1 cm = 10 mm olduğundan 300 mm, 30 cm demektir.\n\nBurada önemli bir not var: laboratuvarda VL53L0X parçası yoktur. Bu derste kodu yazar ve derlersin; ölçülen değerleri sanal olarak göremezsin. Sensörsüz çalıştırırsan program \"VL53L0X bulunamadi\" yazar ve bu, hata kontrolünün işe yaradığının kanıtıdır.\n\n### I2C ve adres\nSensör Arduino'ya iki telle bağlanır: SDA (A4) ve SCL (A5). Aynı hatta başka I2C cihazları da olabilir; her birinin adresi farklıdır.\n\n| Cihaz | Adres |\n|---|---|\n| I2C LCD (bu kursta) | 0x27 |\n| VL53L0X | 0x29 |\n| MPU6050, RTC | 0x68 |\n| BMP280 | 0x76 |\n\nBağlantıdan emin olmak için 33. dersteki adres tarama programını çalıştırır ve çıktıda 0x29'u ararsın. Çıplak çipler 3,3 V ile çalışır; hazır kartlarda genelde bir regülatör bulunur, ama güç bağlamadan önce kartın belgesine bakılır.\n\n### Hatalara karşı savunma\nKütüphane çağrılarında iki kontrol gerekir:\n\n```\nif (!sensor.init()) { ...sensör bulunamadı... }\nint mm = sensor.readRangeContinuousMillimeters();\nif (sensor.timeoutOccurred()) { ...okuma geçersiz... }\n```\n\n`init()` sensöre ulaşamazsa `false` döner. `timeoutOccurred()` ise okuma süresinde bitmediyse `true` olur. Ayrıca `Wire.begin()` çağrılmalıdır; I2C hattı başlatılmazsa sensörle konuşulamaz. Okuma başarısızken dönen sayıyı gerçek mesafe sanmak, en sık yapılan hatadır.\n\n### Eşik ve histerezis\nHC-SR04 dersindeki gibi, mesafe eşiğinde iki değer kullanılır. Örnek: 300 mm'nin altı \"yakın\", 340 mm'nin üstü \"uzak\" olur. Aradaki fark 40 mm, yani 4 cm'dir.\n\n```\nokumalar: 350, 295, 305, 296, 310, 345, 330, 290 (mm)\ntek eşik (300): yakın-uzak-yakın-uzak ... durum 5 kez değişir\niki eşik (300/340): yalnız 295'te \"yakın\", 345'te \"uzak\", 290'da \"yakın\" olur: 3 değişim\n```\n\n### ToF ve ultrasonik\nToF ışık, HC-SR04 ses kullanır. HC-SR04 iki dijital pin ve `pulseIn` ister; VL53L0X ise iki I2C pini kullanır ve bu pinleri diğer I2C cihazlarıyla paylaşır. Her ikisi de yüzeye duyarlıdır: ses yumuşak yüzeylerde dağılabilir, ışık koyu ve parlak yüzeylerde ya da güçlü ortam ışığında etkilenebilir. Kesin menzil ve doğruluk için veri sayfasına bak.\n\n### Özet\nVL53L0X, ışığın uçuş süresinden mesafeyi milimetre olarak ölçer ve I2C ile 0x29 adresinden konuşur. Kodda `Wire.begin()`, `init()` ve `timeoutOccurred()` ile hatalar yakalanmalıdır. Eşik kararlarında yakın ve uzak değerleri birbirinden ayırmak durumun titremesini önler.",
          "concepts": [
            {
              "term": "ToF (uçuş süresi)",
              "definition": "Sensörün bir ışık darbesi gönderip yansımanın dönme süresinden mesafeyi hesaplaması.",
              "example": "VL53L0X kızılötesi lazerle ölçer ve sonucu milimetre olarak verir.",
              "pitfall": "Ultrasonik gibi sesle çalıştığını sanmak; ToF ışık kullanır."
            },
            {
              "term": "VL53L0X ve adres 0x29",
              "definition": "I2C üzerinden konuşan ToF mesafe sensörü; varsayılan adresi 0x29'dur.",
              "example": "Adres tarama çıktısında 0x29 görmek sensörün hatta bağlı olduğunu gösterir.",
              "pitfall": "Sensör adresini LCD'nin 0x27'si ile karıştırmak."
            },
            {
              "term": "init() ve timeoutOccurred()",
              "definition": "init() sensörün bulunup bulunmadığını, timeoutOccurred() okumanın zamanında bitip bitmediğini bildirir.",
              "example": "if (!sensor.init()) { Serial.println(\"VL53L0X bulunamadi\"); }",
              "pitfall": "Okuma başarısızken dönen sayıyı gerçek mesafe sanmak."
            },
            {
              "term": "Wire.begin()",
              "definition": "I2C hattını başlatan çağrı; sensörle konuşmadan önce setup() içinde yapılır.",
              "example": "Wire.begin(); sensor.init();",
              "pitfall": "Wire.begin()'i unutmak: sensörle iletişim kurulamaz ve init() başarısız olur."
            },
            {
              "term": "Milimetre ve eşik payı",
              "definition": "VL53L0X mm verir (10 mm = 1 cm); yakın ve uzak eşikleri arasındaki fark histerezis payıdır.",
              "example": "300 mm ve 340 mm eşikleri arasındaki pay 40 mm, yani 4 cm'dir.",
              "pitfall": "mm ile cm'yi karıştırmak: 300 mm'yi 300 cm sanmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h2d4-q1",
              "kind": "mcq",
              "prompt": "Aynı I2C hattında I2C LCD (0x27), MPU6050 (0x68) ve BMP280 (0x76) varsa VL53L0X adres taramasında hangi adreste görünür?",
              "options": [
                "0x76",
                "0x68",
                "0x27",
                "0x29"
              ],
              "answer": 3,
              "explanation": "VL53L0X'in varsayılan adresi 0x29'dur. 0x27 LCD'ye, 0x68 MPU6050 ve RTC'ye, 0x76 BMP280'e aittir. Adresler farklı olduğu için hepsi aynı hatta bulunabilir.",
              "skills": [
                "sensor-tof",
                "circuit-wiring"
              ]
            },
            {
              "id": "m4h2d4-q2",
              "kind": "numeric",
              "prompt": "tof_esik sketch'inde YAKIN_MM = 300 ve UZAK_MM = 340. İki eşik arasındaki histerezis payı kaç santimetredir?",
              "answer": 4,
              "tolerance": 0,
              "unit": "cm",
              "explanation": "Fark 340 − 300 = 40 mm'dir. 10 mm = 1 cm olduğundan pay 40 / 10 = 4 cm'dir. Bu pay, mesafe eşik civarında oynasa da durumun titremesini önler.",
              "skills": [
                "prog-hysteresis",
                "sensor-tof"
              ]
            },
            {
              "id": "m4h2d4-q3",
              "kind": "numeric",
              "prompt": "tof_esik mantığıyla (YAKIN_MM = 300, UZAK_MM = 340, başlangıçta \"uzak\") sensör sırasıyla 350, 295, 305, 296, 310, 345, 330, 290 mm okuyor. \"Yakin\" ya da \"Uzak\" mesajı toplam kaç kez yazılır?",
              "answer": 3,
              "tolerance": 0,
              "unit": "mesaj",
              "explanation": "350: değişmez. 295 < 300: \"Yakin\" (1). 305, 296 ve 310 arada kalır, durum korunur (310 hâlâ 340'ın altında). 345 > 340: \"Uzak\" (2). 330 değişmez. 290 < 300: \"Yakin\" (3). Toplam 3 mesaj. Tek eşik olsaydı durum 5 kez değişirdi.",
              "skills": [
                "prog-hysteresis",
                "sensor-tof"
              ]
            },
            {
              "id": "m4h2d4-q4",
              "kind": "find-bug",
              "prompt": "VL53L0X doğru bağlı olduğu hâlde init() hep false dönüyor ve seri monitörde \"VL53L0X bulunamadi\" yazıyor. Kodda eksik olan nedir?\n\n```\n#include <VL53L0X.h>\n\nVL53L0X sensor;\n\nvoid setup() {\n  Serial.begin(9600);\n  sensor.setTimeout(500);\n  if (!sensor.init()) {\n    Serial.println(\"VL53L0X bulunamadi\");\n    while (true) {}\n  }\n  sensor.startContinuous();\n}\n```",
              "options": [
                "sensor.setTimeout(500) çağrısı fazla",
                "startContinuous() init()'ten önce çağrılmalı",
                "Wire.begin() çağrısı eksik",
                "Serial.begin(9600) I2C'yi kapatıyor"
              ],
              "answer": 2,
              "explanation": "Kütüphane I2C hattını kendisi başlatmaz; kullanım örneklerinde setup() içinde önce Wire.begin() çağrılır. Bu çağrı olmadan sensöre ulaşılamaz. setTimeout(500) ve startContinuous() çağrıları doğru yerdedir.",
              "skills": [
                "sensor-tof",
                "prog-debug"
              ]
            },
            {
              "id": "m4h2d4-q5",
              "kind": "mcq",
              "prompt": "sensor.readRangeContinuousMillimeters() çağrısından sonra sensor.timeoutOccurred() true döndü. Elindeki sayı için ne yapmalısın?",
              "options": [
                "Gerçek mesafe kabul edip eşikle karşılaştırmak",
                "Okumayı geçersiz sayıp o turdaki kararı atlamak",
                "Değeri iki ile çarpıp kullanmak",
                "Sensörü santimetreye çevirmek için 10'a bölmek"
              ],
              "answer": 1,
              "explanation": "timeoutOccurred() true ise okuma zamanında bitmemiştir; dönen sayı gerçek bir mesafe değildir. Doğrusu bu turu atlamak ya da hata bildirmektir. Sayıyı mm kabul etmek yanlış eşik kararlarına yol açar.",
              "skills": [
                "sensor-tof",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Proje: Hırsız alarmı (durum makineli)",
          "durationMin": 35,
          "problem": "Evin kapısına bir sensör, odaya bir sensör koyup alarmı kurdun ve kapıyı kapatıp çıkacaksın. Alarm hemen öter mi? Kendi evine girince şifreyi girene kadar sus mu? Susturulmuş bir alarm yine de \"bir şey oldu\" diye hatırlıyor mu? Bu sorulara cevap veren şey sensörlerden çok **durumlar** ve aralarındaki **geçişlerdir**.",
          "contentMd": "### Ne yapacağız?\nBu proje bu haftanın derslerini ve eski konuları birleştirir:\n- **41. ders:** PIR ile hareket algılama (D2).\n- **43. ders:** Reed anahtarıyla kapı kontağı (D4) ve debounce.\n- **18. ders:** Buzzer ile alarm sesi (D8).\n- **27-28. dersler:** `millis()` ile bloklamayan zamanlama ve `enum` ile durum makinesi.\n\nAlarm dört durumlu çalışır:\n\n| Durum | Anlamı | LED (D13) | Buzzer (D8) |\n|---|---|---|---|\n| DEVRE_DISI | Sistem kapalı, sensörler yok sayılır | Sönük | Sessiz |\n| HAZIR | Kurulu, ihlal bekliyor | Her 2 sn'de kısa bir parlama | Sessiz |\n| ALARM | İhlal oldu | Hızlı yanıp söner | Sirenli ses |\n| SUSTURULDU | Alarm susturuldu ama olay hatırlanıyor | Yavaş yanıp söner | Sessiz |\n\nKurma sırasında 5 saniyelik **çıkış gecikmesi** vardır: butona basarsın, LED hızlı yanıp söner; gerçek bir evde bu sürede evden çıkıp kapıyı kapatırdın. Süre bitince sistem HAZIR olur. Çıkış gecikmesi ayrı bir durum değildir; DEVRE_DISI içinde bir bayrakla izlenir.\n\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| PIR | VCC → 5V, GND → GND, OUT → **D2** |\n| Buton \"kur / şifre\" | A → **D3**, B → GND (`INPUT_PULLUP`) |\n| Reed | A → **D4**, B → GND (`INPUT_PULLUP`) |\n| Buzzer (Tür: Pasif) | + → **D8**, − → GND (18. dersteki bağlantıyla aynı) |\n| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |\n| LED | A → direncin 2 ucu, K → GND |\n\nBu projede 42. dersteki IR engel sensörü kullanılmaz; D3'ü şifre butonu için kullanıyoruz. Reed'in **Mıknatıs yakın** kutusu kapıyı temsil eder: işaretliyse kapı kapalıdır ve D4 `LOW`, işaretsizse kapı açıktır ve D4 `HIGH` okunur (43. ders). Kutu başlangıçta işaretsizdir, yani kapı açıktır; kurmadan önce işaretle. **Şifre** için 3 saniye içinde butona üç kez bas ve bırak.\n\n### Kurma ve şifre\n- **Kurma:** DEVRE_DISI durumunda butona **bir kez** bas. Kapı açıksa sistem kurulmaz ve \"Kapi acik\" mesajı yazar. Kapı kapalıysa 5 saniye çıkış gecikmesi başlar.\n- **Çıkış gecikmesi** sırasında PIR yok sayılır. 5 saniye sonunda kapı hâlâ açıksa kurma iptal olur. Aksi halde sistem HAZIR olur.\n- **Şifre:** 3 saniye içinde **üç kez** butona basmak şifredir. Tek bir yanlışlıkla basış sistemi kapatmasın diye bu şekilde seçtik. Süre dolarsa sayaç sıfırlanır.\n- **HAZIR** durumunda şifre girersen DEVRE_DISI'ya, **ALARM**'da girersen SUSTURULDU'ya, **SUSTURULDU**'da girersen DEVRE_DISI'ya geçersin.\n- ALARM, şifre girilmese de `ALARM_SURESI` (10 saniye) sonunda SUSTURULDU'ya geçer. Böylece alarm sonsuza dek çalmaz ama LED olayın izini gösterir.\n\n### Program\n```cpp\n// sketch: hirsiz_alarmi\nconst int PIR = 2;\nconst int BUTON = 3;\nconst int REED = 4;\nconst int BUZZER = 8;\nconst int LED = 13;\n\nconst unsigned long CIKIS_GECIKMESI = 5000;   // ms\nconst unsigned long ALARM_SURESI = 10000;     // ms\nconst unsigned long SIFRE_PENCERESI = 3000;   // ms\nconst unsigned long BUTON_KARARLI = 30;       // ms: debounce\nconst int SIFRE_BASIS = 3;                    // şifre: 3 basış\n\nenum Durum { DEVRE_DISI, HAZIR, ALARM, SUSTURULDU };\nconst char* DURUM_ADI[] = { \"DEVRE_DISI\", \"HAZIR\", \"ALARM\", \"SUSTURULDU\" };\n\nDurum durum = DEVRE_DISI;\nbool cikisBekliyor = false;\nunsigned long cikisBasla = 0;\nunsigned long alarmBasla = 0;\n\nbool oncekiBasili = false;\nunsigned long sonBasis = 0;\nunsigned long ilkBasis = 0;\nint basisSayisi = 0;\n\nbool sirenFaz = false;\n\nvoid durumDegistir(Durum yeni) {\n  durum = yeni;\n  basisSayisi = 0;                 // yeni durumda şifre sayacı sıfırlansın\n  cikisBekliyor = false;\n  noTone(BUZZER);\n  sirenFaz = false;\n  Serial.print(\"Durum: \");\n  Serial.println(DURUM_ADI[durum]);\n}\n\n// Butonun yeni basışını bir kez bildirir (kenar + debounce).\nbool yeniBasis(unsigned long simdi) {\n  bool basili = (digitalRead(BUTON) == LOW);\n  bool yeni = basili && !oncekiBasili && (simdi - sonBasis > BUTON_KARARLI);\n  oncekiBasili = basili;\n  if (yeni) sonBasis = simdi;\n  return yeni;\n}\n\n// Şifre girildi mi? Her yeni basış için bir kez çağrılır.\nbool sifreTamam(unsigned long simdi) {\n  if (basisSayisi == 0 || simdi - ilkBasis > SIFRE_PENCERESI) {\n    basisSayisi = 1;               // pencere dışında: yeni deneme başlat\n    ilkBasis = simdi;\n  } else {\n    basisSayisi++;\n  }\n  if (basisSayisi >= SIFRE_BASIS) {\n    basisSayisi = 0;\n    return true;\n  }\n  return false;\n}\n\nbool ihlalVar() {\n  bool hareket = (digitalRead(PIR) == HIGH);\n  bool kapiAcik = (digitalRead(REED) == HIGH);\n  return hareket || kapiAcik;\n}\n\n// LED desenini durumdan üretir.\nvoid ledGuncelle(unsigned long simdi) {\n  bool yanik = false;\n  if (durum == DEVRE_DISI) {\n    yanik = cikisBekliyor && (simdi % 500 < 250);     // çıkış gecikmesinde hızlı\n  } else if (durum == HAZIR) {\n    yanik = (simdi % 2000 < 100);                     // 2 sn'de bir kısa parlama\n  } else if (durum == ALARM) {\n    yanik = (simdi % 200 < 100);                      // çok hızlı\n  } else {\n    yanik = (simdi % 1000 < 500);                     // yavaş\n  }\n  digitalWrite(LED, yanik);\n}\n\n// Siren: 250 ms'de bir 1 kHz ile 2 kHz arasında geçiş yapar.\nvoid sirenGuncelle(unsigned long simdi) {\n  bool faz = (simdi / 250) % 2;\n  if (faz != sirenFaz) {\n    sirenFaz = faz;\n    tone(BUZZER, faz ? 2000 : 1000);\n  }\n}\n\nvoid setup() {\n  pinMode(PIR, INPUT);\n  pinMode(BUTON, INPUT_PULLUP);\n  pinMode(REED, INPUT_PULLUP);\n  pinMode(BUZZER, OUTPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n  Serial.println(\"Durum: DEVRE_DISI\");\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  bool basis = yeniBasis(simdi);\n\n  switch (durum) {\n    case DEVRE_DISI:\n      if (basis && !cikisBekliyor) {\n        if (digitalRead(REED) == HIGH) {\n          Serial.println(\"Kapi acik, kurulamadi\");\n        } else {\n          cikisBekliyor = true;\n          cikisBasla = simdi;\n          Serial.println(\"Cikis gecikmesi basladi\");\n        }\n      }\n      if (cikisBekliyor && simdi - cikisBasla >= CIKIS_GECIKMESI) {\n        if (digitalRead(REED) == HIGH) {\n          cikisBekliyor = false;\n          Serial.println(\"Kapi kapanmadi, kurma iptal\");\n        } else {\n          durumDegistir(HAZIR);\n        }\n      }\n      break;\n\n    case HAZIR:\n      if (basis && sifreTamam(simdi)) {\n        durumDegistir(DEVRE_DISI);\n      } else if (ihlalVar()) {\n        alarmBasla = simdi;\n        durumDegistir(ALARM);\n      }\n      break;\n\n    case ALARM:\n      sirenGuncelle(simdi);\n      if (basis && sifreTamam(simdi)) {\n        durumDegistir(SUSTURULDU);\n      } else if (simdi - alarmBasla >= ALARM_SURESI) {\n        durumDegistir(SUSTURULDU);\n      }\n      break;\n\n    case SUSTURULDU:\n      if (basis && sifreTamam(simdi)) {\n        durumDegistir(DEVRE_DISI);\n      }\n      break;\n  }\n\n  ledGuncelle(simdi);\n}\n```\n\n### Nasıl çalışıyor?\n1. Durum makinesi (28. ders) `enum Durum` ve bir `switch` ile yazıldı. `loop()` hiç `delay` içermez, her tur çok kısa sürer; çıkış gecikmesi, alarm süresi, şifre penceresi ve LED desenleri `millis()` ile ölçülür (27. ders).\n2. `durumDegistir()` her geçişte aynı temizliği yapar: şifre sayacı sıfırlanır, buzzer susar, mesaj yazılır. Böylece bir durumdan kalan artıklar diğerine taşınmaz.\n3. `yeniBasis()` buton basışını **kenar** ve **debounce** ile bir kez bildirir (8. ders). `sifreTamam()` bu basışları sayar. İlk basıştan 3 saniye geçmişse sayaç yeniden başlar.\n4. HAZIR durumunda `ihlalVar()` PIR'ın HIGH olmasına ya da reed'in HIGH olmasına (kapı açıldı) bakar. İkisinden biri yeter. Alarm başlayınca bir **mandal** gibi çalışır: PIR tekrar LOW olsa ve kapı kapansa bile ALARM, süre dolana ya da şifre girilene kadar sürer.\n5. SUSTURULDU durumunda sensörlere hiç bakılmaz. Yani susturulmuş alarm yeni hareketle yeniden çalmaz; yalnız yavaş LED, olayın olduğunu hatırlatır. Sistemi yeniden kurmak için önce şifreyle DEVRE_DISI'ya, sonra yine butonla kurmak gerekir.\n6. PIR hareketten sonra bir süre HIGH kalabilir (41. ders). Laboratuvardaki PIR bu süreyi 3 saniye tutar. Çıkış gecikmesinin bir amacı da PIR'ın sakinleşmesine zaman tanımaktır: **Hareket** kutusunu kurma butonuna bastıktan 3 saniye sonra kaldırırsan çıkış 6. saniyeye kadar HIGH kalır ve sistem HAZIR olur olmaz alarm çalar. Gerçek bir PIR modülünün tutma süresi modüle göre değişir; gerekirse `CIKIS_GECIKMESI` değerini uzat.\n\n### Dene\n- Kurma, ihlal, susturma ve şifre ile kapatma sırasını laboratuvarda dene: reed'in ve PIR'ın kutularını değiştirerek her durumun LED ve buzzer desenini izle.\n- **Giriş gecikmesi ekle:** Kapı açılınca hemen alarm yerine 10 saniye şifre girme fırsatı ver. Bunun için yeni bir durum mu eklersin, yoksa bir bayrak mı?\n- Alarm sırasında LED'i buzzer ile aynı ritimde yanıp söndür. Hangi fonksiyonu değiştirirsin?\n- 42. dersteki IR engel sensörünü (D3) kullanmak istersen şifre butonunu hangi pine taşırsın? Standart bağlantılar tablosunda boş pin var mı?\n- `SIFRE_BASIS` değerini 4 yap ve `SIFRE_PENCERESI`ni değiştir. Zor bir şifre ile kullanışlılık arasındaki dengeyi düşün.\n\n### Sık yapılan hatalar\n- Reed mantığını ters kurmak: kapı kapalıyken LOW (kontak kapalı), açıkken HIGH okunur. HAZIR durumunda `HIGH` ihlaldir.\n- Kapıyı kapatmadan kurmak: kod bunu yakalar ve kurmayı reddeder. Bu kontrolü kaldırırsan sistem açık kapıyla HAZIR olur ve hemen çalar.\n- PIR'ı çıkış gecikmesinden hemen sonra HIGH bulmak: çıkarken sensörün önünden geçtin. Sensörü kapının dışından değil, çıkış yolunun dışına yerleştir.\n- Şifre sayacını durum değişince sıfırlamamak: bir önceki durumdaki basışlar yenisini bozar.\n- `delay()` kullanmak: şifre basışları ve sensörler kaçırılır.",
          "question": "Bu alarmın zayıf noktaları neler? Biri PIR'ı kapatırsa, mıknatısı kapı çerçevesine yapıştırırsa ya da kabloları keserse ne olur? Gerçek bir alarm bu durumlara karşı ne yapardı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir alarmı sensörlerden çok **durumlar ve geçişler** olarak tasarlamayı\n- Durum tablosundan `enum` ve `switch` ile program çıkarmayı\n- Çıkış gecikmesi, mandal ve şifre penceresi gibi gerçek alarm fikirlerini\n- Bloklamayan (`millis()`) zamanlamanın projede neden şart olduğunu\n- Alarmın zayıf noktalarını düşünmeyi\n\n### Önceden bilmen gerekenler\n- 41. ders: PIR, ısınma, tutma süresi\n- 43. ders: reed anahtarı, `INPUT_PULLUP`, LOW = kapı kapalı\n- 18. ders: buzzer ve `tone`/`noTone`\n- 27-28. dersler: `millis()`, `enum` ile durum makinesi\n- 8. ders: kenar ve debounce\n\n### Önce durumlar, sonra kod\nDört durum yeterlidir:\n\n| Durum | Anlam | Buzzer |\n|---|---|---|\n| DEVRE_DISI | Sensörler yok sayılır | Sessiz |\n| HAZIR | Kurulu, ihlal bekler | Sessiz |\n| ALARM | İhlal oldu | Siren |\n| SUSTURULDU | Alarm susturuldu, olay hatırlanır | Sessiz |\n\nGeçişler: butona basmak DEVRE_DISI'dan kurma sürecini başlatır; 5 saniyelik çıkış gecikmesi bitince HAZIR olunur. HAZIR'da PIR HIGH olursa ya da kapı açılırsa ALARM başlar. Şifre ya da süre dolması ALARM'ı SUSTURULDU'ya taşır.\n\n### Çıkış gecikmesi\nKurduktan hemen sonra alarm çalarsa evden çıkamazsın. Bu yüzden kurma butonuna basınca 5 saniye boyunca sensörler dinlenmez. Süre sonunda kapı hâlâ açıksa kurma iptal edilir. PIR'ın tutma süresi de burada önemlidir: hareket kutusunu butondan 3 saniye sonra kaldırırsan OUT bir 3 saniye daha HIGH kalır, yani 6. saniyeye kadar; sistem 5. saniyede HAZIR olur olmaz alarm çalar.\n\n### Mandal ve susturulmuş durum\nALARM bir **mandal** gibi davranır: PIR LOW'a dönse ve kapı kapansa bile alarm, şifre girilene ya da 10 saniye dolana kadar sürer. Süre dolunca DEVRE_DISI'ya değil SUSTURULDU'ya geçilir; böylece ses susar ama yavaş yanıp sönen LED olayın yaşandığını hatırlatır. SUSTURULDU'da sensörlere bakılmaz, yeni hareket alarmı yeniden çalmaz.\n\n### Şifre penceresi\nŞifre: 3 saniye içinde üç basış. Pencere **ilk basıştan** sayılır. Basışlar t = 0, 1500, 3200, 3500, 4000 ms'de gelirse 3200'deki basış pencerenin dışında kaldığı için sayaç 1'den yeniden başlar; üç basış ancak 4000'de tamamlanır. Kod, tek bir kazara basışla alarmın kapanmasını böyle önler.\n\n### Bloklamayan döngü\nProgramda hiç `delay()` yoktur. `loop()` her turda butonu, sensörleri ve zamanlayıcıları kontrol eder; LED desenleri `simdi % 500 < 250` gibi ifadelerle üretilir. `delay(5000)` yazılsaydı çıkış gecikmesi boyunca buton ve kapı kontrolü yapılamazdı.\n\n### Özet\nAlarm, dört durumun ve aralarındaki geçişlerin tablosudur; kod bu tabloyu `enum` ve `switch` ile yazar. Çıkış gecikmesi, mandal ve şifre penceresi kullanıcıyı korurken sistemi de güvenilir tutar. Hepsi `millis()` ile ölçülür, hiçbir yerde `delay()` yoktur.",
          "concepts": [
            {
              "term": "Durum makinesi",
              "definition": "Sistemi birkaç adlandırılmış durum ve aralarındaki geçiş kurallarıyla anlatan tasarım.",
              "example": "Alarm: DEVRE_DISI, HAZIR, ALARM ve SUSTURULDU durumları.",
              "pitfall": "Durumları bayraklarla karıştırmak: hangi durumda olunduğu belirsizleşir."
            },
            {
              "term": "Çıkış gecikmesi",
              "definition": "Alarmı kurduktan sonra sensörlerin bir süre dinlenmediği, kullanıcının evden çıkabildiği süre.",
              "example": "Projede kur butonundan sonra 5 saniye sensörler yok sayılır; kapı hâlâ açıksa kurma iptal olur.",
              "pitfall": "Gecikmeyi atlamak: kurulur kurulmaz alarm çalar."
            },
            {
              "term": "Mandal",
              "definition": "Bir ihlal olduktan sonra tetikleyen koşul bitse bile durumun korunması.",
              "example": "PIR LOW'a dönse ve kapı kapansa bile ALARM şifre ya da süre dolana kadar sürer.",
              "pitfall": "ALARM'ı doğrudan sensör seviyesine bağlamak: hırsız çıkınca alarm kendiliğinden susar."
            },
            {
              "term": "Şifre penceresi",
              "definition": "Şifrenin belirli bir süre içinde (ilk basıştan itibaren) girilmesi koşulu.",
              "example": "3 saniye içinde 3 basış. İlk basıştan 3 saniye geçerse sayaç yeniden başlar.",
              "pitfall": "Pencereyi son basıştan saymak; kazara basışlar birikir."
            },
            {
              "term": "Bloklamayan zamanlama",
              "definition": "delay() yerine millis() ile geçen süreyi ölçmek; böylece loop() her turda çalışır.",
              "example": "Alarm süresi simdi - alarmBasla >= ALARM_SURESI ile ölçülür.",
              "pitfall": "delay() koymak: buton ve sensörler o sürede kaçırılır."
            }
          ],
          "quiz": [
            {
              "id": "m4h2d5-q1",
              "kind": "mcq",
              "prompt": "hirsiz_alarmi ALARM durumunda. Hırsız PIR'ın önünden çekilip kapıyı geri kapatıyor (PIR LOW, reed LOW). Alarm ne yapar?",
              "options": [
                "Hemen HAZIR'a döner",
                "Hemen DEVRE_DISI'ya geçer",
                "Şifre ya da süre dolana kadar çalmaya devam eder",
                "Sirenin frekansını düşürür"
              ],
              "answer": 2,
              "explanation": "ALARM mandal gibi çalışır: bir kez başlayınca sensörler normale dönse bile şifre girilene ya da ALARM_SURESI (10 s) dolana kadar sürer. Bu, hırsızın kaçıp kapıyı kapatmasıyla alarmın sessizce kapanmasını önler.",
              "skills": [
                "prog-state-machine",
                "design-failsafe"
              ]
            },
            {
              "id": "m4h2d5-q2",
              "kind": "numeric",
              "prompt": "Kapı kapalı (Mıknatıs yakın işaretli) ve program çalışıyor. Kur butonuna bastıktan 1 s sonra Hareket kutusunu işaretleyip butondan 3 s sonra kaldırıyorsun (laboratuvar PIR'ı hareket bitince OUT'u 3 s HIGH tutar; ısınma bitmiştir). Butona basıldıktan kaç saniye sonra ALARM durumuna geçilir?",
              "answer": 5,
              "tolerance": 0.2,
              "unit": "s",
              "explanation": "Çıkış gecikmesi 5 s sürer ve bu sürede PIR yok sayılır. Hareket kutusu butondan 3 s sonra kalkar; OUT 6 s'ye kadar HIGH kalır. 5. saniyede sistem HAZIR olur, ihlalVar() PIR HIGH'ı hemen görür ve ALARM başlar: 5 saniye.",
              "skills": [
                "prog-state-machine",
                "sensor-pir",
                "prog-millis"
              ]
            },
            {
              "id": "m4h2d5-q3",
              "kind": "predict-output",
              "prompt": "Şifre penceresi 3000 ms ve şifre 3 basış. Basışlar t = 0, 1500, 3200, 3500 ve 4000 ms'de geliyor ve her biri için tamam() çağrılıyor. Çıktı ne olur?\n\n```\nconst unsigned long PENCERE = 3000;\nint basis = 0;\nunsigned long ilk = 0;\n\nbool tamam(unsigned long t) {\n  if (basis == 0 || t - ilk > PENCERE) {\n    basis = 1;\n    ilk = t;\n  } else {\n    basis++;\n  }\n  return basis >= 3;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  unsigned long zamanlar[] = {0, 1500, 3200, 3500, 4000};\n  for (int i = 0; i < 5; i++) {\n    Serial.print(tamam(zamanlar[i]) ? \"E \" : \"H \");\n  }\n  Serial.println();\n}\n\nvoid loop() {}\n```",
              "options": [
                "H H E H H",
                "E E E E E",
                "H H H H E",
                "H H H E E"
              ],
              "answer": 2,
              "explanation": "t = 0: basis 1. t = 1500: basis 2. t = 3200: 3200 − 0 > 3000, pencere dışı, sayaç 1'den başlar (ilk = 3200). t = 3500: basis 2. t = 4000: 4000 − 3200 = 800 < 3000, basis 3 ve E. Çıktı \"H H H H E\". Üçüncü basışta E beklemek, pencerenin ilk basıştan sayıldığını unutmaktır.",
              "skills": [
                "prog-state-machine",
                "prog-millis",
                "prog-debug"
              ]
            },
            {
              "id": "m4h2d5-q4",
              "kind": "find-bug",
              "prompt": "Alarm, kapı kapalıyken ve kimse hareket etmezken bile HAZIR olur olmaz çalıyor. Hatalı satır hangisi?\n\n```\nbool ihlalVar() {\n  bool hareket = (digitalRead(PIR) == HIGH);\n  bool kapiAcik = (digitalRead(REED) == LOW);\n  return hareket || kapiAcik;\n}\n```",
              "options": [
                "bool hareket = (digitalRead(PIR) == HIGH);",
                "bool kapiAcik = (digitalRead(REED) == LOW);",
                "return hareket || kapiAcik;",
                "bool ihlalVar() {"
              ],
              "answer": 1,
              "explanation": "Reed INPUT_PULLUP ile bağlıdır: kapı kapalıyken (mıknatıs yakın) kontak kapalıdır ve LOW okunur. `== LOW` kapıyı kapalıyken \"açık\" sayar. Doğrusu `kapiAcik = (digitalRead(REED) == HIGH)`. PIR satırı ve `||` doğrudur: iki ihlalden biri yeter.",
              "skills": [
                "sensor-contact",
                "prog-debug"
              ]
            },
            {
              "id": "m4h2d5-q5",
              "kind": "mcq",
              "prompt": "ALARM_SURESI dolunca sistem neden doğrudan DEVRE_DISI'ya değil SUSTURULDU'ya geçer?",
              "options": [
                "Buzzer'ı korumak için",
                "Olayın izini LED ile hatırlatmak için",
                "Şifre sayacını sıfırlamak için",
                "delay() kullanmamak için"
              ],
              "answer": 1,
              "explanation": "SUSTURULDU'da ses susar ama yavaş yanıp sönen LED ev sahibine bir olay olduğunu hatırlatır. Doğrudan DEVRE_DISI'ya geçilseydi olayın izi kaybolur ve ev sahibi gece neler olduğunu bilemezdi. Sensörlere bakılmadığı için yeni hareket alarmı yeniden çalmaz.",
              "skills": [
                "prog-state-machine",
                "design-failsafe"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Ortam",
      "project": "Hava istasyonu",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. DHT11/DHT22 ile sıcaklık ve nemi okuyabilir; `NaN` değerini `isnan` ile yakalayıp okuma aralığının (en az 2 saniye) neden gerekli olduğunu açıklayabilir.\n2. BMP280'i I2C adresiyle bulabilir, basıncı Pa'dan hPa'ya çevirebilir ve rakımın deniz seviyesi basıncına (P0) neden bağlı olduğunu söyleyebilir.\n3. Toprak nemi, yağmur ve su seviyesi sensörlerinin yönünü ölçerek bulabilir; `map` ve `constrain` ile ham değeri yüzdeye çevirebilir.\n4. Birden çok değeri çok sayfalı bir LCD ekranda `delay` kullanmadan gösterebilir.\n5. Hava istasyonu ve sulama uyarısı projesini plan tablosundan yola çıkarak kurabilir; iki eşikle (histerezis) uyarının titremesini önleyebilir.\n\n### Haftanın planı\nHafta beş derstir; ilk dört ders yaklaşık 25 dakika, proje yaklaşık 35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | DHT11 ve DHT22: sıcaklık ve nem | ~25 dk | Anlatımı oku, DHT'yi D5'e bağla, sıcaklık ve nem kaydırıcılarını oynat, DATA kablosunu çıkarıp hata yolunu dene, mini testi çöz. |\n| 2 | BMP280: basınç ve rakım (I2C) | ~25 dk | Basınç kaydırıcısıyla rakımın değiştiğini gör, formülü elle hesapla ve kütüphaneyle karşılaştır, adres hatasını dene. |\n| 3 | Toprak nemi, yağmur ve su seviyesi (analog) | ~25 dk | Üç sensörün yönünü ham sayılardan bul, kalibrasyon uçlarını kaydet, eşiklerle durum yazdır. |\n| 4 | Çok sayfalı ekran arayüzü (LCD/OLED) | ~25 dk | Üç sayfalı ekranı kur, butonla sayfa çevir, dolgusuz yazının artık bıraktığını gör. |\n| 5 | Proje: Hava istasyonu ve sulama uyarısı | ~35 dk | Durum tablosunu yaz, devreyi kur, programı çalıştır, toprak nemini düşürüp uyarıyı sına, proje ölçütüyle değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce öğrenci şunları yapabilmeli:\n- `millis()` ile `delay` kullanmadan iki işi birlikte yürütmek (27. ders).\n- I2C hattında SDA/SCL bağlantısını ve cihaz adresi kavramını tanımak (33. ders).\n- Bir kütüphaneyi `#include` ile kullanmak (34. ders).\n- `analogRead`, `map` ve `constrain` ile ham değeri yüzdeye çevirmek (11. ve 14. dersler).\n- Histerezis fikrini (iki eşik) bilmek (35. ders).\n- `tone` ile buzzer çalmak (18. ders).\n\nEksik varsa ilgili Modül 3 dersine dönülmeli; özellikle 27. ve 35. dersler bu haftanın temelidir.\n\n### Kavram haritası\n- **Ortam sensörleri:** DHT (sıcaklık, bağıl nem) → `NaN` ve `isnan` → 2 saniye kuralı → ardışık hata sayacı\n- **Basınç:** BMP280 → I2C adresi (0x76/0x77) → Pa ve hPa → rakım formülü → P0 ve hava durumu\n- **Analog sensörler:** toprak nemi, yağmur, su seviyesi → yön → kalibrasyon uçları → `map` ve `constrain` → eşik ve histerezis\n- **Arayüz:** sayfa değişkeni → `%` işleci → satırı 16 karaktere tamamlama → `snprintf` ve `dtostrf` → OLED\n- **Proje:** durum tablosu → `uyari` durumu → iki eşik → bloklamayan buzzer → arızaya dayanıklılık\n\n### Sık yapılan hatalar\n- **`isnan` denetimini atlamak.** DHT okuyamazsa `NaN` döner; hesap ve ekran `nan` olur.\n- **DHT'yi 2 saniyeden sık okumak.** Aynı eski değer tekrarlanır.\n- **BMP280'i parametresiz `begin()` ile aramak.** Varsayılan adres 0x77'dir; 0x76'daki sensör bulunamaz.\n- **Pa ile hPa'yı karıştırmak.** `readAltitude` hPa bekler; `101325` yazılırsa rakım anlamsız çıkar.\n- **Sensör yönünü bilmeden \"büyük sayı = ıslak\" varsaymak.** Toprak ve yağmur sensörlerinde ıslandıkça değer düşer.\n- **`constrain` unutmak.** Yüzde %-26 ya da %130 gibi değerler çıkar.\n- **Satırı 16 karaktere tamamlamamak.** Ekranda eski yazının artıkları kalır.\n- **`snprintf` ile `%f` kullanmak.** Uno'da ondalık sayı yerine `?` yazılır; `dtostrf` kullanılır.\n- **Tek eşik kullanmak ve bip için `delay` kullanmak.** Uyarı titrer ve program donar.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. DHT'yi bağla ve kaydırıcıları çalışırken oynat; sonra DATA kablosunu çıkarıp programın ne yazdığını açıkla.\n4. BMP280 basıncını 1013,25 hPa'dan 1003,25 hPa'ya çek ve rakımın kaç metre kaydığını hesaplayıp ölç.\n5. Kendi cümlelerinle şu soruyu cevapla: \"Uyarı için neden iki eşik kullandık?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Hava istasyonu ve sulama uyarısı)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Birkaç parça bağlı değil ya da LED dirençsiz | DHT, BMP280, LCD, toprak sensörü, LED ve buzzer doğru pinlerde | Bağlantılar düzenli; LCD ve BMP280 aynı I2C hattını adresleriyle paylaşıyor |\n| Plan | Durum tablosu yok | Normal ve uyarı durumları ile eşikler tabloda yazılı | Tablo kodla birebir uyuyor ve her geçiş açıklanmış |\n| Ölçüm | Değerler yanlış birimde ya da `nan` görünüyor | Sıcaklık, nem, basınç, rakım ve toprak yüzdesi doğru | Kalibrasyon uçları kendi sensöründen ölçülmüş |\n| Uyarı | Uyarı titriyor ya da hiç çalışmıyor | İki eşikle uyarı doğru açılıp kapanıyor; mesaj yalnız durum değişince yazılıyor | Ek bir geliştirme var (örneğin susturma butonu) |\n| Dayanıklılık | Sensör çıkarılınca program çöküyor | DHT ya da BMP280 yokken ekranda `--` ve \"BMP280 yok\" görünüyor | Bozuk sensörü anlamak için ek bir kontrol eklenmiş |\n| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta sensör okumanın yalnızca bir sayıyı almak olmadığını, o sayıya güvenmeden önce denetlemek ve yorumlamak gerektiğini öğrenmektir. \"Sensör yoksa ne olur?\" sorusu haftanın ortak sorusudur.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: \"Bu sayının birimi ne?\", \"Sensör cevap vermezse ne olur?\", \"Bu değer hangi yönde artıyor?\"\n- **Doğruluk uyarısı.** Ekranda çok basamak görmek doğru ölçmek demek değildir. Sensörün gerçek doğruluğu için veri sayfasına bakılır; derslerdeki sayılar laboratuvar modelinindir.\n- **Güvenlik.** Platformdaki her şey sanaldır. Proje bir pompa içermez; gerçek bir pompa için transistör ya da röle ve ayrı güç kaynağı gerekir ve şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "DHT11 ve DHT22: sıcaklık ve nem",
          "durationMin": 25,
          "problem": "Hava durumu uygulaması \"sıcaklık 24 derece, nem yüzde 60\" der. Odanın havası kuru mu, bunaltıcı mı, bunu sıcaklık tek başına söylemez; nem de lazımdır. Tek bir küçük sensör ikisini birden ölçebilir. Üstelik tek bir veri kablosuyla. Bu derste DHT sensörünü okuyacak, iki modeli ölçümle karşılaştıracak ve sensör cevap vermediğinde programın çökmemesini öğreneceksin.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| DHT sensörü | VCC → 5V, GND → GND, DATA (veri) → **D5** |\n\nDHT parçasının sağ paneldeki **Tür** özelliği DHT22 ya da DHT11 olur; **Sıcaklık** ve **Nem** kaydırıcıları sensörün \"ölçtüğü\" havayı belirler ve program çalışırken de değiştirilebilir. Laboratuvardaki parça 3 bacaklı modüldür; veri hattı için gereken yükseltme (pull-up) direnci modülün üzerinde sayılır.\n\nBilgi notu: Piyasada çıplak 4 bacaklı DHT sensörleri de vardır; onlarda veri ile VCC arasına bir direnç gerekir (değeri veri sayfasında yazar). Laboratuvardaki modülde buna gerek yok.\n\n### Yeni kavramlar\n- **Bağıl nem:** Havanın o sıcaklıkta taşıyabileceği en çok su buharının yüzde kaçını taşıdığını söyler. % 0 çok kuru, % 100 doyma demektir.\n- **Kütüphane:** 34. derste gördün. DHT sensörü kendi iletişim kuralıyla konuşur; bunu elle yazmak yerine `DHT sensor library` (Adafruit) kütüphanesini kullanırız. Sketch'in başına `#include <DHT.h>` yazarsın.\n- **`isnan(x)`:** \"Bu sayı geçerli mi?\" sorusudur. `isnan`, \"sayı değil\" (not a number, NaN) demektir. Kütüphane okuyamazsa `NaN` döndürür. `NaN` ile hesap yaparsan sonuç da `NaN` olur, o yüzden okumayı **kullanmadan önce** `isnan` ile denetle.\n\n### Program 1: sıcaklık ve nem\n```cpp\n// sketch: dht_oku\n#include <DHT.h>\n\n#define DHT_PIN 5\n#define DHT_TIP DHT22        // DHT11 kullanıyorsan burayı DHT11 yap\n\nDHT dht(DHT_PIN, DHT_TIP);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  delay(2000);                          // okumalar arası en az 2 sn\n  float nem = dht.readHumidity();\n  float sicaklik = dht.readTemperature();   // santigrat\n\n  if (isnan(nem) || isnan(sicaklik)) {\n    Serial.println(\"Okuma hatasi\");\n    return;\n  }\n\n  Serial.print(\"Sicaklik: \");\n  Serial.print(sicaklik, 1);\n  Serial.print(\" C  Nem: \");\n  Serial.print(nem, 1);\n  Serial.println(\" %\");\n}\n```\n\n### Nasıl çalışıyor?\n1. `DHT dht(DHT_PIN, DHT_TIP)` sensörün hangi pinde ve hangi modelde olduğunu söyler. Model yanlışsa değerler anlamsız çıkar.\n2. `delay(2000)` rastgele konmadı. DHT sensörleri yavaştır: iki okuma arasında en az 2 saniye beklemelisin. Daha sık sorarsan kütüphane çoğu zaman bir önceki değeri tekrar verir.\n3. `readHumidity()` nemi yüzde, `readTemperature()` sıcaklığı santigrat olarak döndürür.\n4. `if (isnan(...))` hata yolunu kurar. DATA kablosu bağlı değilse ya da sensör cevap vermiyorsa program \"Okuma hatasi\" yazar ve bir sonraki tura geçer.\n\n### DHT11 ile DHT22 farkını ölç\nProgramdaki tek satırı değiştir: `#define DHT_TIP DHT11`. Sensör parçasının **Tür** özelliğini de DHT11 yap (önce ■ ile durdur). Sıcaklık kaydırıcısını 23,5 °C, Nem kaydırıcısını 55 % yaparak laboratuvarda şunu okuduk:\n\n| Model | Seri çıktı |\n|---|---|\n| DHT22 | `Sicaklik: 23.5 C  Nem: 55.0 %` |\n| DHT11 | `Sicaklik: 24.0 C  Nem: 55.0 %` |\n\nDHT22 virgülden sonra bir basamak verir, DHT11 yalnızca tam sayı verir (23,5 değeri 24'e yuvarlandı). Ama dikkat: ekranda ondalık görmek **doğru ölçtüğü** anlamına gelmez. İki modelin ne kadar doğru ölçtüğü, hangi aralıkta çalıştığı ve ölçüm hızı için gerçek sensörlerin veri sayfalarına bak.\n\n### Program 2: bloklamayan okuma ve sensör yokken davranış\n`delay(2000)` tüm programı 2 saniye durdurur. 27. derste öğrendiğin `millis()` ile okumayı zamanlayalım. Bu sürümde ayrıca üst üste 3 hata olursa eski değeri göstermeyi bırakıp \"SENSOR YOK\" der; çünkü saatlerce eski bir sıcaklığı güncelmiş gibi göstermek yanıltıcıdır.\n\n```cpp\n// sketch: dht_millis\n#include <DHT.h>\n\nDHT dht(5, DHT22);\n\nconst unsigned long ARALIK = 2000;   // ms\nunsigned long sonOlcum = 0;\n\nfloat sicaklik = NAN;                // NAN: henüz geçerli değer yok\nfloat nem = NAN;\nint ardisikHata = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - sonOlcum >= ARALIK) {\n    sonOlcum = simdi;\n\n    float n = dht.readHumidity();\n    float s = dht.readTemperature();\n\n    if (isnan(n) || isnan(s)) {\n      ardisikHata++;\n      if (ardisikHata >= 3) {        // eski değeri artık gösterme\n        sicaklik = NAN;\n        nem = NAN;\n      }\n    } else {\n      sicaklik = s;\n      nem = n;\n      ardisikHata = 0;\n    }\n\n    if (isnan(sicaklik)) {\n      Serial.print(\"SENSOR YOK  Ardisik hata: \");\n      Serial.println(ardisikHata);\n    } else {\n      Serial.print(\"T=\");\n      Serial.print(sicaklik, 1);\n      Serial.print(\" N=\");\n      Serial.println(nem, 1);\n    }\n  }\n  // burada başka işler de yapılabilir; loop() beklemez\n}\n```\n\nBu programı DATA kablosu **olmadan** da çalıştırdık (kabloyu silmek için önce ■'e bas, kabloyu seç, **Delete**'e bas). Laboratuvar \"DHT DATA ucu bağlı değil: sensör çalışmaz.\" uyarısını verir. Henüz hiç geçerli okuma olmadığı için ilk turdan itibaren `SENSOR YOK  Ardisik hata: 1`, `... 2`, `... 3` satırları çıktı; program çökmedi, `loop()` çalışmaya devam etti. DATA kablosunu yeniden çekip ▶'e basınca `T=...  N=...` satırları başlar. Sensör bir süre sağlıklı okuduktan sonra cevap vermezse, kod ilk iki hatada son geçerli değeri göstermeyi sürdürür, üçüncüde bırakır.\n\n### Dene\n- `dht_oku` programında `DHT_TIP` satırını DHT11 yap, sensörün **Tür** özelliğini de DHT11 yap ve tabloyla karşılaştır. Çalışırken sıcaklık kaydırıcısını yavaşça oynat: DHT11 çıktısı nasıl adım adım değişiyor?\n- `delay(2000)` değerini 500 yap. Seri çıktıdaki değerler her tur değişiyor mu, yoksa aynı değer birkaç kez mi tekrarlanıyor?\n- `dht_millis` programında ■ ile durdurup DATA kablosunu sil, ▶'e bas. Kaçıncı satırda \"SENSOR YOK\" görüyorsun? Kabloyu yeniden çekince ne oluyor?\n\n### Sık yapılan hatalar\n- `isnan` denetimi koymamak: okuma başarısızsa `NaN` ile hesap yaparsın ve ekranda `nan` görürsün.\n- Modeli yanlış yazmak (DHT11 sensöre `DHT22` demek): değerler tuhaf çıkar.\n- Okumayı 2 saniyeden sık denemek.\n- Güç vermeden hemen sonra okumak: sensöre açıldıktan sonra biraz zaman tanı (gerçek sensörlerde süre için veri sayfasına bak).\n- DATA kablosunu ya da (çıplak sensörde) yükseltme direncini unutmak: sürekli `Okuma hatasi` görürsün.",
          "question": "DHT22 virgülden sonraki basamağı gösteriyor, DHT11 göstermiyor. Peki fazla basamak göstermek ölçümün daha doğru olduğunu kanıtlar mı? Bir bilgisayarın ya da ekranın \"çok basamak göstermesi\" ile \"doğru göstermesi\" arasındaki farkı örnekle anlat.",
          "explainerMd": "### Bu derste öğreneceklerin\n- DHT11 ve DHT22 sensörünün neyi ölçtüğünü ve tek veri kablosuyla nasıl okunduğunu\n- Bağıl nemin ne anlama geldiğini\n- Okuma başarısız olduğunda `NaN` değerini `isnan` ile yakalamayı\n- Okumalar arasında neden en az 2 saniye beklenmesi gerektiğini\n- Sensör koparsa programın çökmeden \"sensör yok\" demesini sağlamayı\n\n### Önceden bilmen gerekenler\n- Seri monitöre yazdırmak: `Serial.begin`, `Serial.print` (Modül 3)\n- `millis()` ile bloklamayan zamanlama (27. ders)\n- Kütüphane kullanmak: `#include` (34. ders)\n- Küçük koşullar: `if` ve `||` (veya) işleci\n\n### Tek sensörde iki ölçüm\n**DHT** ailesi (DHT11 ve DHT22) hem sıcaklığı hem **bağıl nemi** ölçer. Bağıl nem, havanın o sıcaklıkta taşıyabileceği en çok su buharının yüzde kaçını taşıdığını söyler: % 0 çok kuru, % 100 doymuş hava demektir. Sensör iki değeri de **tek bir veri hattından** (DATA) sayısal paketler hâlinde gönderir. Bu paketi elle çözmek zordur; bu yüzden `DHT.h` kütüphanesini kullanırız. Ona yalnızca pin ve model söylenir.\n\n```\nDHT dht(5, DHT22);        // D5 pini, DHT22 modeli\nfloat nem = dht.readHumidity();\nfloat sic = dht.readTemperature();\n```\n\n### Model seçimi\nİki model aynı kütüphaneyle okunur; fark çözünürlük ve ayrıntıdadır. Laboratuvarda DHT22 sıcaklığı bir ondalık basamakla (23,5), DHT11 ise tam sayı olarak (24) verir. Ama ekranda daha fazla basamak görmek **daha doğru** demek değildir. Doğruluk, sensörün gerçek değere ne kadar yaklaştığıdır ve veri sayfasından öğrenilir. Koddaki model sensörle aynı olmalıdır; yanlış modelle değerler anlamsız çıkar.\n\n### Okuma başarısız olabilir\nKablo gevşekse ya da sensör cevap vermiyorsa kütüphane **NaN** (\"sayı değil\") döndürür. NaN ile yapılan her hesap yine NaN verir ve ekranda `nan` yazar. Çözüm, değeri kullanmadan önce sormaktır:\n\n```\nif (isnan(nem) || isnan(sic)) {\n  Serial.println(\"Okuma hatasi\");\n  return;\n}\n```\n\n`||` \"ya da\" demektir: iki değerden biri bozuksa okuma çöpe atılır.\n\n### Yavaş sensör\nDHT hızlı bir sensör değildir. İki okuma arasında **en az 2 saniye** beklemek gerekir. Daha sık sorarsan çoğu zaman aynı eski değeri alırsın. `delay(2000)` basit çözümdür; `millis()` ile 2 saniyelik aralığı sayarsan program beklemeden başka işler de yapabilir.\n\n### Sensör yoksa ne olur?\nİyi bir program bozuk sensörle de çalışmaya devam eder. Ders sonundaki sürümde **ardışık hata sayacı** vardır: her başarısız okumada sayaç artar, başarılı okumada sıfırlanır. Sayaç 3'e ulaşınca program eski değeri göstermeyi bırakıp \"SENSOR YOK\" der. Saatlerce eski bir sıcaklığı güncelmiş gibi göstermek yanıltıcı olurdu.\n\n### Özet\nDHT sensörü sıcaklık ve bağıl nemi tek veri hattından verir. Kütüphane okuyamazsa `NaN` döndürür; bu yüzden değeri kullanmadan önce `isnan` ile denetlenir. Okumalar arasında en az 2 saniye beklenir. Ardışık hata sayacı, sensör koptuğunda programın çökmeden durumu bildirmesini sağlar.",
          "concepts": [
            {
              "term": "Bağıl nem",
              "definition": "Havanın o sıcaklıkta taşıyabileceği en çok su buharının yüzde kaçını taşıdığı.",
              "example": "% 100 bağıl nemde hava doymuştur; % 30 oldukça kuru bir odayı gösterir.",
              "pitfall": "Bağıl nemi havadaki su miktarının kendisi sanmak; aynı su miktarı soğuk havada daha yüksek yüzde verir."
            },
            {
              "term": "DHT11 ve DHT22",
              "definition": "Sıcaklık ve nemi tek veri hattından veren iki sensör modeli; DHT22 daha ayrıntılı (ondalıklı) sonuç verir.",
              "example": "Laboratuvarda 23,5 °C gerçek sıcaklığı DHT22 \"23.5\", DHT11 \"24.0\" olarak yazdırır.",
              "pitfall": "Çok basamak görmeyi doğru ölçmek sanmak; doğruluğu veri sayfasından öğrenmek gerekir."
            },
            {
              "term": "NaN ve isnan()",
              "definition": "NaN \"sayı değil\" demektir; kütüphane okuyamazsa onu döndürür. isnan(x) değerin geçersiz olup olmadığını sorar.",
              "example": "if (isnan(nem)) { Serial.println(\"Okuma hatasi\"); return; }",
              "pitfall": "Denetimi atlayıp NaN ile hesap yapmak; sonuç da NaN olur ve ekranda nan görünür."
            },
            {
              "term": "Okuma aralığı",
              "definition": "DHT sensörü iki okuma arasında en az 2 saniye bekletilmelidir.",
              "example": "delay(2000) ya da millis() ile 2000 ms'lik zamanlayıcı kurulur.",
              "pitfall": "delay(500) gibi kısa aralıklar yazmak; sensör yetişemez, aynı değer tekrarlanır."
            },
            {
              "term": "Ardışık hata sayacı",
              "definition": "Üst üste kaç okumanın başarısız olduğunu sayan değişken; başarılı okuma onu sıfırlar.",
              "example": "Sayaç 3'e ulaşınca ekran \"SENSOR YOK\" yazar ve eski değeri göstermeyi bırakır.",
              "pitfall": "Tek bir bozuk okumada hemen alarm vermek ya da sayacı hiç sıfırlamamak."
            }
          ],
          "quiz": [
            {
              "id": "m4h3d46-q1",
              "kind": "mcq",
              "prompt": "DHT kütüphanesi bir okumayı başaramazsa readTemperature() ne döndürür ve programın bununla ilgili ne yapması gerekir?",
              "options": [
                "0 döndürür; hiçbir şey yapmak gerekmez",
                "Önceki değerin yarısını döndürür",
                "Programı durdurur; sensörü yeniden başlatmak gerekir",
                "NaN döndürür; değer kullanılmadan önce isnan() ile denetlenmelidir"
              ],
              "answer": 3,
              "explanation": "Başarısız okumada kütüphane NaN (sayı değil) döndürür. NaN ile hesap yapılırsa sonuç da NaN olur ve ekranda nan görünür; bu yüzden isnan() ile önceden denetlenir. Sıfır döndürmez, programı da durdurmaz.",
              "skills": [
                "sens-dht-read"
              ]
            },
            {
              "id": "m4h3d46-q2",
              "kind": "predict-output",
              "prompt": "DHT22 modülünün DATA kablosu Uno'ya bağlı DEĞİL. Bu kod 4,5 saniye çalışırsa seri monitörde ne görünür?\n\n```\n#include <DHT.h>\nDHT dht(5, DHT22);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  delay(2000);\n  float t = dht.readTemperature();\n  if (isnan(t)) Serial.println(\"HATA\");\n  else Serial.println(t * 2);\n}\n```",
              "options": [
                "İki satır: HATA ve HATA",
                "Hiçbir şey yazılmaz",
                "İki satır: 0.00 ve 0.00",
                "İki satır: nan ve nan"
              ],
              "answer": 0,
              "explanation": "Sensör cevap vermediği için readTemperature() NaN döndürür. isnan(t) doğru olduğundan 2. ve 4. saniyede \"HATA\" yazılır (4,5 saniyede iki tur biter). t * 2 satırına hiç gelinmez, bu yüzden nan ya da 0.00 görünmez.",
              "skills": [
                "sens-dht-read",
                "prog-debug"
              ]
            },
            {
              "id": "m4h3d46-q3",
              "kind": "find-bug",
              "prompt": "Bu kodun amacı nemi her 2 saniyede bir güvenle yazdırmaktır. Hangi satırda hata vardır?\n\n```\n1 void loop() {\n2   delay(500);\n3   float nem = dht.readHumidity();\n4   if (isnan(nem)) { Serial.println(\"Okuma hatasi\"); return; }\n5   Serial.println(nem);\n6 }\n```",
              "options": [
                "Satır 2: DHT en az 2 saniyede bir okunmalı, 500 ms çok kısa",
                "Satır 3: readHumidity yerine readTemperature yazılmalı",
                "Satır 4: isnan denetimi gereksiz",
                "Satır 5: println yerine print yazılmalı"
              ],
              "answer": 0,
              "explanation": "Hata aralıktadır: DHT iki okuma arasında en az 2 saniye ister, bu yüzden delay(2000) gerekir. 500 ms'de sensör yetişemez, kütüphane çoğu zaman eski değeri tekrarlar. Satır 4'teki isnan denetimi tam tersine gereklidir.",
              "skills": [
                "sens-dht-read",
                "prog-timing",
                "prog-debug"
              ]
            },
            {
              "id": "m4h3d46-q4",
              "kind": "numeric",
              "prompt": "Ders sonundaki programda okumalar 2000 ms arayla yapılır ve üst üste 3 hata olunca \"SENSOR YOK\" yazılır. Sensör, son geçerli okumadan hemen sonra (t = 0) koptu. \"SENSOR YOK\" mesajı kopmadan kaç saniye sonra görünür?",
              "answer": 6,
              "tolerance": 0,
              "unit": "sn",
              "explanation": "Başarısız okumalar 2., 4. ve 6. saniyede yapılır. Sayaç ilk ikisinde 1 ve 2 olur, eski değer gösterilmeye devam eder. 6. saniyede sayaç 3'e ulaşır ve mesaj görünür: 3 hata × 2 sn = 6 sn.",
              "skills": [
                "sens-dht-read",
                "prog-timing"
              ]
            },
            {
              "id": "m4h3d46-q5",
              "kind": "mcq",
              "prompt": "Bir arkadaşın \"DHT22 virgülden sonra bir basamak gösteriyor, DHT11 göstermiyor; o halde DHT22 mutlaka daha doğru ölçer\" diyor. Ne dersin?",
              "options": [
                "Haklı; basamak sayısı doğruluğu kanıtlar",
                "Haklı; DHT11 zaten çalışmaz",
                "Haksız; ekranda görülen basamak sayısı ile doğruluk ayrı şeylerdir, doğruluk veri sayfasından öğrenilir",
                "Haksız; iki modelin çıktısı her zaman aynıdır"
              ],
              "answer": 2,
              "explanation": "Basamak sayısı sensörün ne kadar ayrıntı verdiğini gösterir, ölçümün gerçeğe ne kadar yakın olduğunu göstermez. İki modelin çıktısı da aynı değildir (23,5 değeri DHT22'de 23.5, DHT11'de 24.0 görünür), ama doğruluk için veri sayfasına bakılır.",
              "skills": [
                "sens-dht-read"
              ]
            }
          ]
        },
        {
          "title": "BMP280: basınç ve rakım (I2C)",
          "durationMin": 25,
          "problem": "Akıllı saatler ve drone'lar hangi katta olduğunu ya da ne kadar yükseldiğini nasıl bilir? Havanın ağırlığına bakarak. Yükseldikçe üstündeki hava azalır ve hava basıncı düşer. Bir basınç sensörü bu yüzden aynı zamanda bir yükseklik ölçerdir. Bu derste BMP280 ile basıncı okuyacak, basınçtan rakım hesaplayacak ve neden \"deniz seviyesi basıncı\" ayarının önemli olduğunu göreceksin.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| BMP280 | VCC → 5V, GND → GND |\n| | SDA → **A4**, SCL → **A5** |\n\nBMP280, 33. derste öğrendiğin I2C ile konuşur. Adresi **0x76** ya da **0x77**'dir. Laboratuvarda parçayı seçince sağ panelde **I2C adresi** özelliğini görürsün (varsayılan 0x76); sensör çalışmıyorsa bu adres ile kodundaki adres aynı olmalı. Emin değilsen 33. dersteki adres tarama programını çalıştır. Sağ panelde ayrıca **Sıcaklık** ve **Basınç** (hPa) kaydırıcıları vardır; program çalışırken de değiştirilebilir.\n\nBilgi notu: Gerçek dünyada bazı çıplak BMP280 modülleri yalnızca 3,3 V ister (laboratuvar 5V ya da 3V3 ile besler); gerçek bir modülü bağlarken veri sayfasına bak. Adres gerçek modüllerde SDO bacağıyla seçilir. BME280 adlı kardeş sensör görünüşte aynıdır ama nem de ölçer; BMP280 kütüphanesi onu tanımayabilir.\n\n### Yeni kavramlar\n- **Basınç birimi:** Kütüphane basıncı **Pascal (Pa)** olarak verir. Hava durumunda **hPa** (hektopaskal) kullanılır: 1 hPa = 100 Pa. Deniz seviyesinde standart basınç yaklaşık 101 325 Pa, yani **1013,25 hPa**'dır.\n- **Rakım:** Bulunduğun yerin deniz seviyesinden yüksekliği (metre).\n- **Rakım formülü:** Basınçtan yükseklik hesaplamak için yaygın kullanılan yaklaşık bir formül:\n\n`rakım = 44330 · (1 − (P / P0) ^ (1 / 5,255))`\n\nBurada `P` ölçtüğün basınç, `P0` ise **deniz seviyesinde şu anki basınç**tır. İkisi aynı birimde olmalıdır (ikisi de hPa ya da ikisi de Pa). Formül standart atmosfer varsayımına dayanır; bu yüzden birkaç yüz metrelik farklarda iyi, çok yüksekte ise yaklaşık bir sonuç verir.\n\n### Program 1: basınç, sıcaklık ve kütüphanenin rakımı\n```cpp\n// sketch: bmp_oku\n#include <Wire.h>\n#include <Adafruit_BMP280.h>\n\nAdafruit_BMP280 bmp;\nbool bmpHazir = false;\n\nvoid setup() {\n  Serial.begin(9600);\n  bmpHazir = bmp.begin(0x76);          // modülün adresi 0x77 ise burayı değiştir\n  if (!bmpHazir) {\n    Serial.println(\"BMP280 bulunamadi\");\n  }\n}\n\nvoid loop() {\n  delay(1000);\n  if (!bmpHazir) {\n    return;                            // sensör yoksa okuma yapma\n  }\n  float sicaklik = bmp.readTemperature();         // santigrat\n  float hpa = bmp.readPressure() / 100.0;         // Pa -> hPa\n  float rakim = bmp.readAltitude(1013.25);        // P0 hPa cinsinden\n\n  Serial.print(\"Sicaklik: \");\n  Serial.print(sicaklik, 1);\n  Serial.print(\" C  Basinc: \");\n  Serial.print(hpa, 1);\n  Serial.print(\" hPa  Rakim: \");\n  Serial.print(rakim, 1);\n  Serial.println(\" m\");\n}\n```\n\n### Nasıl çalışıyor?\n1. `bmp.begin(0x76)` sensörü adresinden arar ve ayarlar. Kütüphanede varsayılan adres 0x77'dir. Bu yüzden 0x76'lık modülde parametresiz `bmp.begin()` çağırırsan sensör bulunamaz. Laboratuvarda da bunu denedik: BMP280'in adresini 0x77 yaptığımızda `begin(0x76)` \"BMP280 bulunamadi\" yazdırdı, parametresiz `begin()` ise sensörü buldu.\n2. `readPressure()` Pa verir. hPa için 100'e bölersin.\n3. `readAltitude(1013.25)` yukarıdaki formülü senin yerine hesaplar. Parametre, deniz seviyesi basıncı `P0`'dır ve **hPa** cinsinden verilir.\n4. `bmpHazir` bayrağı hata yolunu kurar: sensör bulunamazsa program \"BMP280 bulunamadi\" yazar ve okumaya hiç kalkışmaz.\n\n### Program 2: formülü kendin hesapla\nKütüphanenin fonksiyonuna güvenmek yerine formülü sen de yaz; iki sonucu yan yana koyup karşılaştır.\n\n```cpp\n// sketch: bmp_rakim_formul\n#include <Wire.h>\n#include <Adafruit_BMP280.h>\n\nAdafruit_BMP280 bmp;\nconst float P0_HPA = 1013.25;          // deniz seviyesi basinci, hPa\n\nfloat rakimHesapla(float pHpa, float p0Hpa) {\n  return 44330.0 * (1.0 - pow(pHpa / p0Hpa, 1.0 / 5.255));\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  if (!bmp.begin(0x76)) {\n    Serial.println(\"BMP280 bulunamadi\");\n  }\n}\n\nvoid loop() {\n  delay(1000);\n  float hpa = bmp.readPressure() / 100.0;\n  Serial.print(\"Basinc: \");\n  Serial.print(hpa, 1);\n  Serial.print(\" hPa  Formul: \");\n  Serial.print(rakimHesapla(hpa, P0_HPA), 1);\n  Serial.print(\" m  Kutuphane: \");\n  Serial.print(bmp.readAltitude(P0_HPA), 1);\n  Serial.println(\" m\");\n}\n```\n\nBMP280'in **Basınç** kaydırıcısını sırayla bu değerlere getirip laboratuvarda şunu ölçtük (P0 = 1013,25 hPa):\n\n| Kaydırıcıdaki basınç | Ekranda | Formül | Kütüphane |\n|---|---|---|---|\n| 1013,25 hPa | 1013.2 hPa | 0,0 m | 0,0 m |\n| 954,5 hPa | 954.5 hPa | 501,0 m | 501,0 m |\n| 898,75 hPa | 898.8 hPa | 1000,1 m | 1000,1 m |\n\nBu basınçları formülü elle hesaplayarak seçtik: yaklaşık 954,5 hPa için 500 m, yaklaşık 898,75 hPa için 1000 m çıkıyor. Hem senin formülün hem kütüphane aynı sonucu verdi (ekrandaki 1013.2, sensörün basıncı 0,1 hPa'ya yuvarlayarak yazmasındandır). İki yöntem aynı sonucu verir; kütüphane de aynı formülü kullanıyor.\n\n### P0 ayarı: neden önemli?\nDeniz seviyesindeki basınç sabit değildir; hava durumuyla değişir. Bugün 1013 hPa olan P0 yarın 1003 hPa olabilir. Formülde `P0`'ı yanlış verirsen **bulunduğun yerin rakımı kayar**. Bu kaymanın büyüklüğünü laboratuvarda ölçtük: Basınç kaydırıcısı 1000 hPa iken `P0`'ı 1013,25'ten 1003,25'e indirmek rakımı 110,9 m'den 27,4 m'ye düşürdü; fark yaklaşık 84 m. Yani deniz seviyesine yakın yerlerde **1 hPa yaklaşık 8 m**'ye denk gelir.\n\nBu yüzden iki kullanım var:\n- Rakımı mutlak değer olarak istiyorsan, o günkü deniz seviyesi basıncını (hava durumu verisi) `P0` olarak ver.\n- Rakımın gerçek değerini zaten biliyorsan, formülü tersine çevir ve `P0`'ı kendin bul:\n\n`P0 = P / (1 − rakım / 44330) ^ 5,255`\n\n```cpp\n// sketch: bmp_p0_ayar\n#include <Wire.h>\n#include <Adafruit_BMP280.h>\n\nAdafruit_BMP280 bmp;\nconst float BILINEN_RAKIM = 100.0;     // metre: bulundugun yerin gercek rakimi\nfloat p0 = 1013.25;\n\nvoid setup() {\n  Serial.begin(9600);\n  if (!bmp.begin(0x76)) {\n    Serial.println(\"BMP280 bulunamadi\");\n    return;\n  }\n  float hpa = bmp.readPressure() / 100.0;\n  p0 = hpa / pow(1.0 - BILINEN_RAKIM / 44330.0, 5.255);\n  Serial.print(\"P0: \");\n  Serial.print(p0, 1);\n  Serial.println(\" hPa\");\n}\n\nvoid loop() {\n  delay(1000);\n  Serial.print(\"Rakim: \");\n  Serial.print(bmp.readAltitude(p0), 1);\n  Serial.println(\" m\");\n}\n```\n\nBu program açılışta bir kez ayar yapar: o anki basıncı \"şu an rakım 100 m\" kabul eder. Sonrasında basınç değişirse rakım değişir. Bu bir hata değil; sensör yükseklik ile hava değişimini ayıramaz. Laboratuvarda 1000 hPa iken ayar yaptık (P0 = 1011,9 hPa, rakım 100,0 m); basınç kaydırıcısını 999 hPa'ya çekince rakım 108,4 m oldu, yani yaklaşık 8 m arttı. Gerçek bir odada rakımı ölçerken sonuç sabit kalmıyorsa nedeni çoğunlukla havanın kendisidir.\n\n### Dene\n- `bmp_oku` çalışırken BMP280'i seç ve **Sıcaklık** ile **Basınç** kaydırıcılarını oynat. Seri çıktıdaki sıcaklık, basınç ve rakım nasıl değişiyor?\n- `bmp_rakim_formul` programında `P0_HPA` değerini 1003,25 yap. Rakım ne kadar kayıyor? Yukarıdaki \"1 hPa yaklaşık 8 m\" kuralıyla uyuşuyor mu?\n- Sensörün I2C adresini 0x77 yap (önce ■) ve `bmp.begin(0x76)` ile çalıştır. Ne yazıyor? Sonra kodu `bmp.begin(0x77)` yap.\n- `bmp_p0_ayar` programındaki `BILINEN_RAKIM` değerini 300 yap. Sonra çalışırken basınç kaydırıcısını 2 hPa düşür: rakım kaç metre değişti? Gerçek bir yerde bir saat sonra rakım okuması neden değişebilir?\n\n### Sık yapılan hatalar\n- Adresi unutmak: sensör 0x76 iken `begin()` (varsayılan 0x77) ile \"bulunamadi\" almak.\n- Pa ile hPa'yı karıştırmak: `readAltitude` hPa bekler. `readAltitude(101325)` yazarsan sonuç çok yanlış çıkar.\n- SDA ve SCL'yi ters bağlamak: sensör hiç bulunamaz. 33. dersteki tarama programı yardımcı olur.\n- Sensör bulunamadığında okumaya devam etmek: anlamsız sayılar yazdırır.\n- Rakımı \"kesin\" saymak: hava değişince `P0` da değişir. Gerçek ölçüm doğruluğu için veri sayfasına bak.",
          "question": "Bir drone sensörün verdiği rakımı yükseklik tutmak için kullanıyor. Hava durumu değişince rakım okuması kayarsa drone'un davranışını nasıl etkiler? \"Şu andan itibaren ne kadar yükseldim?\" sorusunu cevaplamak için `P0` yerine hangi değeri kullanırdın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Hava basıncının yükseklikle neden düştüğünü\n- Pascal (Pa) ile hektopaskal (hPa) arasında çevirme yapmayı\n- BMP280 sensörünü I2C adresiyle bulmayı ve yoksa programın çökmemesini\n- Basınçtan rakım hesaplamayı ve deniz seviyesi basıncının (P0) önemini\n\n### Önceden bilmen gerekenler\n- I2C hattı, SDA/SCL ve cihaz adresi (33. ders)\n- Kütüphane kullanmak (34. ders)\n- Ondalıklı sayılar (`float`) ve bölme\n- Bir önceki derste öğrenilen \"sensör yoksa programı koru\" fikri (46. ders)\n\n### Havanın ağırlığı\nÜstümüzde kilometrelerce hava vardır ve bu havanın ağırlığı **hava basıncı** yaratır. Yükseğe çıktıkça üstümüzdeki hava azalır, basınç düşer. Bu yüzden bir basınç sensörü aynı zamanda yükseklik ölçerdir. Deniz seviyesinde standart basınç yaklaşık 1013,25 hPa'dır.\n\n### Birimler\nKütüphane basıncı **Pascal (Pa)** cinsinden verir. Hava durumunda **hPa** kullanılır ve 1 hPa = 100 Pa'dır. Örneğin 101 325 Pa, 1013,25 hPa eder. Kodda `readPressure() / 100.0` bu dönüşümü yapar. Birimi karıştırmak bu dersteki en sık hatadır.\n\n### BMP280'i bulmak\nBMP280, I2C üzerinde **0x76** ya da **0x77** adresinde durur. Kütüphanenin varsayılan adresi 0x77'dir. Sensör 0x76'daysa `bmp.begin()` onu bulamaz; `bmp.begin(0x76)` yazman gerekir. `begin` doğruysa `true`, sensör yoksa `false` döner. Bu sonucu bir değişkende saklarsan sensör olmadığında okumaya hiç kalkışmaz, yalnız bir hata mesajı yazarsın.\n\n```\nbool hazir = bmp.begin(0x76);\nif (!hazir) { Serial.println(\"BMP280 bulunamadi\"); }\n```\n\n### Basınçtan rakım\nYaygın yaklaşık formül şudur:\n\n```\nrakım = 44330 × (1 − (P / P0) ^ (1 / 5,255))\n```\n\n`P` ölçtüğün basınç, `P0` ise deniz seviyesindeki **şu anki** basınçtır; ikisi aynı birimde olmalıdır. Kütüphanedeki `readAltitude(P0)` aynı hesabı yapar, P0'ı **hPa** olarak bekler.\n\n| Ölçülen basınç | P0 = 1013,25 hPa ile rakım |\n|---|---|\n| 1013,25 hPa | 0 m |\n| 954,5 hPa | yaklaşık 500 m |\n| 898,75 hPa | yaklaşık 1000 m |\n\n### Hava değişince rakım kayar\nDeniz seviyesi basıncı hava durumuyla değişir. P0'ı yanlış verirsen rakım kayar: deniz seviyesine yakın yerlerde 1 hPa yaklaşık 8 m eder. Sensör \"yükseklik değişti\" ile \"hava değişti\" farkını ayıramaz. Gerçek rakımını biliyorsan formülü tersine çevirip P0'ı kendin bulabilirsin.\n\n### Özet\nHava basıncı yükseldikçe düşer, bu yüzden BMP280 rakım hesaplamakta kullanılır. Kütüphane Pa verir, hPa için 100'e bölünür. Sensörün I2C adresi kodla aynı olmalıdır ve `begin` sonucu denetlenir. Rakım formülü P0'a bağlıdır; hava değişince P0 değişir ve rakım kayar.",
          "concepts": [
            {
              "term": "Hava basıncı",
              "definition": "Üstümüzdeki havanın ağırlığının yarattığı basınç; yükseldikçe azalır.",
              "example": "Bir drone yükseldikçe BMP280'in okuduğu basınç düşer.",
              "pitfall": "Basıncın sabit olduğunu sanmak; hava durumuyla her gün değişir."
            },
            {
              "term": "Pa ve hPa",
              "definition": "Pascal ve hektopaskal basınç birimleridir; 1 hPa = 100 Pa.",
              "example": "readPressure() 101325 verirse bu 1013,25 hPa'dır.",
              "pitfall": "readAltitude'a Pa yazmak (101325); fonksiyon hPa bekler, sonuç çok yanlış çıkar."
            },
            {
              "term": "I2C adresi (0x76 / 0x77)",
              "definition": "BMP280'in I2C hattındaki adı; kodda begin() içinde verilen adres sensörünkiyle aynı olmalıdır.",
              "example": "Sensör 0x76'dayken bmp.begin(0x76) yazılır.",
              "pitfall": "Parametresiz begin() kullanmak; varsayılan 0x77'dir, 0x76'daki sensör bulunamaz."
            },
            {
              "term": "Rakım formülü",
              "definition": "Ölçülen basınç P ve deniz seviyesi basıncı P0'dan rakımı hesaplayan yaklaşık formül: 44330 × (1 − (P/P0)^(1/5,255)).",
              "example": "P0 = 1013,25 hPa iken 954,5 hPa yaklaşık 500 m eder.",
              "pitfall": "P ve P0'ı farklı birimlerde (biri Pa, biri hPa) vermek."
            },
            {
              "term": "P0 (deniz seviyesi basıncı)",
              "definition": "Rakım hesabının referansı; hava durumuyla değişir.",
              "example": "P0 değeri 10 hPa yanlışsa rakım yaklaşık 84 m kayar.",
              "pitfall": "Rakım okumasını kesin sanmak; hava değişince yer değiştirmeden de değer kayar."
            },
            {
              "term": "Sensör bulundu mu? (begin sonucu)",
              "definition": "begin() başarılıysa true, sensör yoksa false döner.",
              "example": "bmpHazir false ise program okumayı atlar ve \"BMP280 bulunamadi\" yazar.",
              "pitfall": "Sonucu denetlememek; bulunmayan sensörden anlamsız sayılar okunur."
            }
          ],
          "quiz": [
            {
              "id": "m4h3d47-q1",
              "kind": "mcq",
              "prompt": "BMP280 modülünün I2C adresi 0x76'dır. Kodda yalnızca bmp.begin() yazılırsa ne olur?",
              "options": [
                "Sensör sorunsuz bulunur",
                "Derleme hatası oluşur",
                "Sensör otomatik olarak 0x77'ye geçer",
                "Kütüphane varsayılan adres 0x77'yi dener, sensörü bulamaz ve false döner"
              ],
              "answer": 3,
              "explanation": "Kütüphanenin varsayılan adresi 0x77'dir. Sensör 0x76'daysa begin() onu göremez ve false döner; bmp.begin(0x76) yazmak gerekir. Sensör adres değiştirmez, kod da derlenir.",
              "skills": [
                "sens-i2c-bmp"
              ]
            },
            {
              "id": "m4h3d47-q2",
              "kind": "numeric",
              "prompt": "readPressure() 98500 değerini döndürüyor (Pa cinsinden). Bu basınç kaç hPa'dır?",
              "answer": 985,
              "tolerance": 0,
              "unit": "hPa",
              "explanation": "1 hPa = 100 Pa olduğu için 98500 / 100 = 985 hPa. Çarpmak yerine bölmek gerekir; Pa sayısı her zaman hPa sayısından 100 kat büyüktür.",
              "skills": [
                "sens-altitude"
              ]
            },
            {
              "id": "m4h3d47-q3",
              "kind": "predict-output",
              "prompt": "Devrede BMP280 HİÇ yok. Bu kod 3,5 saniye çalışırsa seri monitörde ne görünür?\n\n```\nbool hazir = false;\n\nvoid setup() {\n  Serial.begin(9600);\n  hazir = bmp.begin(0x76);\n  if (!hazir) { Serial.println(\"BMP280 bulunamadi\"); }\n}\n\nvoid loop() {\n  delay(1000);\n  if (!hazir) { return; }\n  Serial.println(bmp.readPressure() / 100.0, 1);\n}\n```",
              "options": [
                "Yalnızca bir kez: BMP280 bulunamadi",
                "Her saniye 0.0",
                "Her saniye: BMP280 bulunamadi",
                "Hiçbir şey yazılmaz"
              ],
              "answer": 0,
              "explanation": "Mesaj setup() içinde bir kez yazılır. loop() her turda hazir false olduğu için return ile çıkar ve okuma yapılmaz; bu yüzden sayı yazılmaz ve mesaj tekrarlanmaz.",
              "skills": [
                "sens-i2c-bmp",
                "prog-debug"
              ]
            },
            {
              "id": "m4h3d47-q4",
              "kind": "find-bug",
              "prompt": "Bu kod rakımı metre olarak yazdırmak istiyor ama sonuç saçma çıkıyor. Hangi satırda hata vardır?\n\n```\n1 float hpa = bmp.readPressure() / 100.0;\n2 float rakim = bmp.readAltitude(101325);\n3 Serial.print(\"Rakim: \");\n4 Serial.println(rakim, 1);\n```",
              "options": [
                "Satır 1: / 100.0 gereksiz",
                "Satır 2: readAltitude hPa bekler, 101325 Pa olarak yazılmış; 1013.25 olmalı",
                "Satır 3: print yerine println olmalı",
                "Satır 4: rakim yerine hpa yazdırılmalı"
              ],
              "answer": 1,
              "explanation": "readAltitude deniz seviyesi basıncını hPa olarak ister. 101325 yazılınca P/P0 oranı çok küçülür ve rakım anlamsız çıkar; doğrusu 1013.25'tir. Satır 1'deki bölme ise Pa'dan hPa'ya doğru çevirmedir.",
              "skills": [
                "sens-altitude",
                "prog-debug"
              ]
            },
            {
              "id": "m4h3d47-q5",
              "kind": "numeric",
              "prompt": "Basınç 1000 hPa. P0 yanlışlıkla 1013,25 yerine 1008,25 hPa verilirse rakım kaç metre kayar? Kural: deniz seviyesi yakınında 1 hPa yaklaşık 8 m eder. (Kayma miktarını mutlak değer olarak ver.)",
              "answer": 40,
              "tolerance": 4,
              "unit": "m",
              "explanation": "P0 farkı 1013,25 − 1008,25 = 5 hPa ve 5 × 8 = 40 m eder. Formülle hesaplayınca da yaklaşık 41,6 m çıkar; kural kaba bir tahmindir, bu yüzden 4 m hoşgörü tanınır.",
              "skills": [
                "sens-altitude"
              ]
            }
          ]
        },
        {
          "title": "Toprak nemi, yağmur ve su seviyesi (analog)",
          "durationMin": 25,
          "problem": "Evdeki sardunya haftada bir sulanıyor, ama bazı haftalar toprak hâlâ ıslakken sulanıyor, bazı haftalar da kuruyup sararıyor. Toprağa parmağını sokup bakmak yerine bir sensör nemi sayıya çevirebilir. Aynı yöntem yağmuru ve bir deponun doluluğunu da ölçer. Üçü de analog sensördür: 11. derste potansiyometreyle yaptığın gibi `analogRead` ile okursun. Asıl iş, ham sayıyı anlamlı bir yüzdeye çevirmek.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Toprak nemi modülü | VCC → 5V, GND → GND, AO → **A2** |\n| Yağmur sensörü | VCC → 5V, GND → GND, AO → **A0** |\n| Su seviyesi sensörü | VCC → 5V, GND → GND, AO → **A1** |\n\nÜç modül de analog çıkışlıdır (AO). Sağ paneldeki kaydırıcılar fiziksel büyüklüğü verir: **Toprak nemi** (yüzey ne kadar ıslak), **Islaklık (yağmur)** (kartın üstüne ne kadar yağmur düştüğü) ve **Su seviyesi** (çubuğun ne kadarı suda). Hepsi 0 ile 1 arasındadır. Modüllerin DO çıkışlarını bu derste kullanmıyoruz.\n\nÜç sensörün yönü farklıdır; bunu ham sayılardan okuyacaksın:\n- **Toprak nemi** ve **yağmur sensörü:** ıslandıkça AO **düşer** (kuruda yüksek, ıslakta düşük).\n- **Su seviyesi:** su yükseldikçe AO **artar** (çubuğun çıplak izleri suya gömüldükçe).\n\n### İki tür toprak nemi sensörü\n- **Dirençli (resistive) sensör:** Toprağa gömülen iki açık metal uç vardır. Toprak nemliyse uçlar arasındaki direnç değişir ve bunu okursun. Ucundan sürekli akım geçtiği için metal zamanla **aşınır, paslanır**; bu tür sensörler ömürlü değildir. Akımı azaltmak için sensörü sürekli beslemek yerine yalnız ölçüm anında beslemek yaygın bir yöntemdir; modülün besleme akımı için veri sayfasına bak.\n- **Kapasitif sensör:** Uçlar bir yalıtkanla kaplıdır, toprakla doğrudan akım geçirmez. Toprağın neminin sığa (kapasite) üzerindeki etkisini ölçer. Genelde daha uzun ömürlüdür.\n\n**Çıkış yönü modüle göre değişir.** Çoğu hazır modül kuruda yüksek, ıslakta düşük değer verir; ama bazılarında tersi olabilir ve üreticiden üreticiye sayılar farklıdır. Bu yüzden \"ıslak = büyük sayı\" diye bir kural yoktur. Yönü ve sayıları her sensör için kuru ve ıslak durumda ölçerek öğrenmelisin. Laboratuvardaki Toprak nemi modülünde kaydırıcı 0 (kuru) iken ham değer yaklaşık 921, 1 (ıslak) iken yaklaşık 307 çıkar; yani kuruda yüksek, ıslakta düşük. Bu derste de bu yönü varsayıyoruz; kodu ters yönlü bir sensöre de uyarlayacağız.\n\n### Program 1: kuru/ıslak ucu ile yüzde\nKalibrasyon (14. ders) fikri: iki uç değeri ölç, `map` ile yüzdeye çevir, `constrain` ile 0-100 arasında tut. `map` ters sıralı uçlarla da çalışır: `KURU` ıslaktan büyükse de küçükse de aynı kod doğru yüzdeyi verir.\n\n```cpp\n// sketch: toprak_yuzde\nconst int KURU = 800;                 // sensör havada/kuru toprakta okunan ham değer\nconst int ISLAK = 350;                // sensör suda okunan ham değer\n\nint ortalamaOku(int pin) {\n  long toplam = 0;\n  for (int i = 0; i < 8; i++) {\n    toplam += analogRead(pin);\n  }\n  return toplam / 8;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = ortalamaOku(A2);\n  int yuzde = map(ham, KURU, ISLAK, 0, 100);\n  yuzde = constrain(yuzde, 0, 100);\n\n  Serial.print(\"Toprak ham=\");\n  Serial.print(ham);\n  Serial.print(\" nem=%\");\n  Serial.println(yuzde);\n  delay(500);\n}\n```\n\nLaboratuvarda **Toprak nemi** kaydırıcısını gezdirerek şunu ölçtük:\n\n| Kaydırıcı | Ham değer | Seri monitörde |\n|---|---|---|\n| 0 (en kuru) | 921 | %0 (kuru uçtan da kuru: sınırlanır) |\n| 0,2 | 798 | %0 (KURU = 800'e yakın) |\n| 0,4 | 675 | %27 |\n| 0,6 | 552 | %55 |\n| 0,8 | 430 | %82 |\n| 1 (en ıslak) | 307 | %100 (ıslak uçtan da ıslak: sınırlanır) |\n\n`KURU = 800` ve `ISLAK = 350` seçtik; modülün ulaştığı uçlar (921 ve 307) bunların dışında kaldığı için `constrain` uçlarda %0 ve %100'de tutuyor. `constrain` olmasaydı kaydırıcı 0 iken yaklaşık %-26 görürdün.\n\nSensör ters yönlüyse (kuruda düşük, ıslakta yüksek) yalnız iki sabiti değiştirirsin; örneğin `KURU = 300`, `ISLAK = 700`. Aynı kod, `map` ters sıralı uçlarla da çalıştığı için bu sensörde de doğru yüzdeyi verir. Laboratuvardaki modül hep aynı yönde çalışır; bu yüzden ters yönlü durumu burada denemek için `KURU` ve `ISLAK` değerlerini yer değiştirmen yeter (aşağıdaki \"Dene\").\n\n### Program 2: kalibrasyonu seri porttan yap\nSabitleri kodun içine gömmek yerine sensörü kuru ve ıslak koşulda ölçüp kaydetmek daha güvenilirdir. Bu programda seri monitörden `k` gönderirsen o anki ham değer **kuru** uç olarak kaydedilir, `i` gönderirsen **ıslak** uç olarak. İki uç birbirine çok yakınsa yüzde hesaplanmaz, çünkü `map` bölme yapar ve fark sıfıra yaklaştığında sonuç anlamsızlaşır.\n\n```cpp\n// sketch: toprak_kalibre\nint kuru = 800;\nint islak = 350;\n\nunsigned long sonYazi = 0;\n\nint ortalamaOku(int pin) {\n  long toplam = 0;\n  for (int i = 0; i < 8; i++) {\n    toplam += analogRead(pin);\n  }\n  return toplam / 8;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(\"k: kuru uc, i: islak uc\");\n}\n\nvoid loop() {\n  while (Serial.available() > 0) {\n    char komut = Serial.read();\n    if (komut == 'k') {\n      kuru = ortalamaOku(A2);\n      Serial.print(\"Kuru kaydedildi: \");\n      Serial.println(kuru);\n    } else if (komut == 'i') {\n      islak = ortalamaOku(A2);\n      Serial.print(\"Islak kaydedildi: \");\n      Serial.println(islak);\n    }\n  }\n\n  unsigned long simdi = millis();\n  if (simdi - sonYazi >= 500) {\n    sonYazi = simdi;\n    int ham = ortalamaOku(A2);\n    if (abs(kuru - islak) < 50) {\n      Serial.println(\"Kalibrasyon gecersiz: uclar cok yakin\");\n    } else {\n      int yuzde = constrain(map(ham, kuru, islak, 0, 100), 0, 100);\n      Serial.print(\"nem=%\");\n      Serial.println(yuzde);\n    }\n  }\n}\n```\n\nLaboratuvarda kaydırıcı 0 iken `k` (Kuru kaydedildi: 921), kaydırıcı 1 iken `i` gönderdik (Islak kaydedildi: 307); sonra kaydırıcıyı 0,5 yapınca `nem=%50` yazdı. Kaydırıcı 0,5 iken hem `k` hem `i` gönderince (iki uç da 614) \"Kalibrasyon gecersiz: uclar cok yakin\" yazdı.\n\n### Program 3: yağmur ve su seviyesi\nYağmur sensöründe kartın üstüne düşen damlalar iki bakır iz arasını köprüler ve okuma düşer; su seviyesi sensöründe ise su çıplak izleri kapattıkça değer büyür. Yönler modüle göre değişir. Bu örnekte yağmur sensörü **kuruda yüksek, ıslakta düşük**, su seviyesi sensörü **su arttıkça yüksek** değer verir. Eşikleri gerçek bir sensörde ölçerek belirlemelisin; aşağıdaki eşikler laboratuvardaki modeller için ölçüldü.\n\n```cpp\n// sketch: yagmur_su\nconst int YAGMUR_ESIK = 600;          // altı: yagmur var\nconst int SEVIYE_ORTA = 300;          // bunun altı: bos\nconst int SEVIYE_DOLU = 600;          // bunun ustu: dolu\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int yagmur = analogRead(A0);\n  int seviye = analogRead(A1);\n\n  Serial.print(\"Yagmur: \");\n  Serial.print(yagmur < YAGMUR_ESIK ? \"VAR\" : \"YOK\");\n  Serial.print(\"  Su: \");\n  if (seviye < SEVIYE_ORTA) {\n    Serial.print(\"BOS\");\n  } else if (seviye < SEVIYE_DOLU) {\n    Serial.print(\"ORTA\");\n  } else {\n    Serial.print(\"DOLU\");\n  }\n  Serial.print(\"  (A0=\");\n  Serial.print(yagmur);\n  Serial.print(\" A1=\");\n  Serial.print(seviye);\n  Serial.println(\")\");\n  delay(500);\n}\n```\n\nLaboratuvarda yağmur sensörünün **Islaklık (yağmur)** kaydırıcısını gezdirerek ölçtük:\n\n| Islaklık | A0 | Seri monitörde |\n|---|---|---|\n| 0 (kuru kart) | 972 | `YOK` |\n| 0,2 | 798 | `YOK` |\n| 0,4 | 624 | `YOK` (eşik 600'ün hemen üstünde) |\n| 0,5 | 537 | `VAR` |\n| 0,8 | 276 | `VAR` |\n| 1 (sağanak) | 102 | `VAR` |\n\nSu seviyesi sensörünün **Su seviyesi** kaydırıcısıyla:\n\n| Su seviyesi | A1 | Seri monitörde |\n|---|---|---|\n| 0 (boş) | 51 | `BOS` |\n| 0,2 | 204 | `BOS` |\n| 0,4 | 358 | `ORTA` |\n| 0,7 | 588 | `ORTA` (DOLU eşiği 600'ün hemen altında) |\n| 0,8 | 665 | `DOLU` |\n| 1 (çubuk tamamen suda) | 819 | `DOLU` |\n\nDikkat: su seviyesi sensörü 5 V'ta tam ölçeğe (1023) ulaşmaz; çubuğun en üst değeri yaklaşık 819 kalır. Bu yüzden eşikleri 1023'e göre değil, sensörün gerçek aralığına göre seçtik. Laboratuvarda kaydırıcıyı oynatırken **kartın** ya da **çubuğun** çizimindeki damlaların ve su düzeyinin kaydırıcıyla birlikte değiştiğini de izle.\n\n### Nasıl çalışıyor?\n1. Üç sensör de gerilim üretir ve `analogRead` bunu 0-1023 arası sayıya çevirir (11. ders).\n2. Toprak sensöründe `map` ham sayıyı yüzdeye taşır; `constrain` uç taşmalarını keser. 8 ölçümün ortalaması gürültüyü azaltır (14. ders).\n3. Yağmur ve su seviyesi basit eşiklerle karşılaştırılır. Sınır değerlerine yakın okumalarda durum hızla gidip gelebilir; bunun çaresi 35. dersteki termostatta kullandığın histerezistir.\n4. Yön ve sayılar sensörden sensöre değiştiği için bu sayılar başka bir sensör için doğru olmayabilir. Kalibrasyonu hep kullandığın sensörle yap.\n\n### Dene\n- `toprak_yuzde` programında `KURU` ve `ISLAK` değerlerini yer değiştir. Yüzde ne oluyor? Bir sensörün hangi yönde olduğunu kaydırıcıyı 0'dan 1'e çekip ham sayının nasıl değiştiğine bakarak nasıl anlarsın?\n- `toprak_kalibre` programını çalıştırırken kaydırıcı 0 iken `k`, kaydırıcı 1 iken `i` gönder. Sonra kaydırıcıyı 0,3 yap: yüzde kaç çıkıyor?\n- Sensörün yönü tersse (kuruda düşük) `yagmur_su` programındaki yağmur karşılaştırmasını nasıl değiştirirsin?\n- Yağmur kaydırıcısını 0,4 ile 0,5 arasında yavaşça gezdir: `YOK` ile `VAR` arasında nerede geçiş oluyor? Eşiği 700 yapsan geçiş hangi ıslaklıkta olurdu?\n\n### Sık yapılan hatalar\n- Sensörün yönünü bilmeden \"büyük sayı = ıslak\" varsaymak.\n- `constrain` unutmak: kalibrasyon aralığının dışındaki okumalar %-20 ya da %130 gibi saçma değerler verir.\n- Dirençli sensörü sürekli toprakta ve sürekli açık bırakmak: uçlar paslanır, okuma zamanla kayar (laboratuvar bunu modellemez; gerçek dünya bilgisi).\n- Sensör çıktısını tek bir ölçüme bakarak yorumlamak: gürültü yüzünden ortalama al.",
          "question": "Dirençli bir toprak nemi sensörünü bir yıl toprakta bıraktın ve okumalar yavaş yavaş kaydı. Bunun nedeni ne olabilir? Kalibrasyonu ne sıklıkla yenilersin, bunu otomatik yapmanın bir yolu olabilir mi?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Toprak nemi, yağmur ve su seviyesi sensörlerinin analog çıkışını okumayı\n- Her sensörün yönünün (değer artıyor mu, azalıyor mu) farklı olabileceğini\n- Ham sayıyı `map` ve `constrain` ile yüzdeye çevirmeyi\n- Kuru ve ıslak uçları ölçerek kalibrasyon yapmayı\n- Eşik civarında okumanın titrediğini ve bunun çaresini\n\n### Önceden bilmen gerekenler\n- `analogRead` ve 0-1023 aralığı (11. ders)\n- `map` ve `constrain` ile kalibrasyon (14. ders)\n- Histerezis, yani iki eşik fikri (35. ders)\n- `if / else if` zinciri\n\n### Üç sensör, aynı yöntem\nToprak nemi, yağmur ve su seviyesi modüllerinin üçü de **analog çıkış** (AO) verir. Sensör bir gerilim üretir, `analogRead` bunu 0-1023 arası bir sayıya çevirir. Asıl iş, bu **ham sayıyı** anlamlı bir şeye (yüzde, \"yağmur var\", \"depo dolu\") dönüştürmektir.\n\n### Yön her sensörde aynı değil\nBu derste kullanılan modüllerde yönler şöyledir:\n\n| Sensör | Kuru / boş | Islak / dolu | Yön |\n|---|---|---|---|\n| Toprak nemi | ham ≈ 921 | ham ≈ 307 | ıslandıkça düşer |\n| Yağmur | ham ≈ 972 | ham ≈ 102 | ıslandıkça düşer |\n| Su seviyesi | ham ≈ 51 | ham ≈ 819 | su yükseldikçe artar |\n\n\"Islak, büyük sayı demektir\" diye bir kural yoktur. Sayıları ve yönü her yeni sensörde kuru ve ıslak durumda ölçerek öğrenirsin. Su seviyesi çubuğu 5 V'ta bile 1023'e ulaşmaz; en yüksek değeri yaklaşık 819'dur. Eşikleri sensörün gerçek aralığına göre seçmek gerekir.\n\n### Yüzdeye çevirme\nKalibrasyonda iki uç ölçülür: kuru uç ve ıslak uç. `map(ham, KURU, ISLAK, 0, 100)` bu ikisi arasındaki değeri 0-100'e dönüştürür. `map` ters sıralı uçlarla da çalışır. Ama `map` uçların dışındaki değerleri de oransal olarak uzatır; bu yüzden sonuç `constrain(yuzde, 0, 100)` ile kesilir. `map` tam sayı bölmesi yapar ve ondalık kısmı atar: 66,7 değeri 66 olur.\n\n```\nint yuzde = map(ham, 800, 350, 0, 100);\nyuzde = constrain(yuzde, 0, 100);\n```\n\n### Gürültü ve ortalama\nAnalog okuma her seferinde birkaç birim oynayabilir. Sekiz ölçümün ortalamasını almak okumayı sakinleştirir. Kalibrasyonu sabit sayılarla gömmek yerine seri porttan komutla (kuru için `k`, ıslak için `i`) kaydetmek daha güvenilirdir. İki uç birbirine çok yakınsa `map` anlamsız sonuç verir; bu durumda hesap yapılmaz.\n\n### Eşik ve titreme\nYağmur ya da seviye için tek bir eşik kullanırsan, okuma eşiğin hemen üstünde ve altında gidip gelince durum hızla değişir. Çözüm, 35. dersteki gibi iki eşik (histerezis) kullanmaktır. Dirençli toprak sensörünün açık metal uçları zamanla paslanır; kapasitif türde uçlar yalıtılmıştır ve genelde daha uzun ömürlüdür.\n\n### Özet\nÜç sensör de analog sayı verir, ama yönleri ve sayıları farklıdır. Kuru ve ıslak uçları ölçüp `map` ile yüzdeye çevirir, `constrain` ile 0-100 arasında tutarsın. Ortalama gürültüyü azaltır, histerezis eşik titremesini önler.",
          "concepts": [
            {
              "term": "Sensör yönü",
              "definition": "Fiziksel büyüklük arttıkça ham değerin artıp artmadığı; sensörden sensöre değişir.",
              "example": "Toprak nemi modülünde ıslandıkça ham değer 921'den 307'ye düşer, su seviyesi çubuğunda 51'den 819'a çıkar.",
              "pitfall": "\"Islak = büyük sayı\" varsaymak; yönü her sensörde kuru ve ıslak ölçerek öğrenmek gerekir."
            },
            {
              "term": "Kalibrasyon uçları",
              "definition": "Sensörün kuru ve ıslak durumda verdiği iki ham değer; yüzde hesabının sınırlarıdır.",
              "example": "KURU = 800 ve ISLAK = 350 ile ham 575 değeri %50 eder.",
              "pitfall": "Başkasının sensöründen alınmış sayıları kullanmak; her sensörün uçları farklıdır."
            },
            {
              "term": "map() ve constrain()",
              "definition": "map ham değeri başka bir aralığa oransal çevirir; constrain sonucu verilen alt ve üst sınır arasında tutar.",
              "example": "constrain(map(ham, 800, 350, 0, 100), 0, 100) yüzdeyi 0-100 arasında verir.",
              "pitfall": "constrain'i unutmak; kalibrasyon aralığı dışındaki okumalar %-26 ya da %130 gibi değerler verir."
            },
            {
              "term": "Ortalama alma",
              "definition": "Birkaç ölçümü toplayıp sayıya bölerek gürültüyü azaltmak.",
              "example": "Sekiz analogRead toplanıp 8'e bölünür.",
              "pitfall": "Tek bir ölçüme bakarak karar vermek; anlık bir sıçrama yanlış uyarıya yol açar."
            },
            {
              "term": "Eşik titremesi",
              "definition": "Okuma eşiğin çevresinde dalgalanınca durumun hızlıca değişmesi; iki eşikle (histerezis) önlenir.",
              "example": "Yağmur eşiği 600 iken okuma 595 ile 605 arasında gidip gelirse durum sürekli VAR/YOK olur.",
              "pitfall": "Tek eşiğin yeterli olduğunu sanmak."
            },
            {
              "term": "Dirençli ve kapasitif toprak sensörü",
              "definition": "Dirençli tür toprakla temas eden açık uçlarla ölçer; kapasitif türde uçlar yalıtkanla kaplıdır.",
              "example": "Uzun süre toprakta kalacak bir sensör için kapasitif tür tercih edilir.",
              "pitfall": "Dirençli sensörü sürekli toprakta ve açık bırakmak; uçlar paslanır ve okuma kayar."
            }
          ],
          "quiz": [
            {
              "id": "m4h3d48-q1",
              "kind": "mcq",
              "prompt": "Bir toprak nemi modülünü bağladın. Kaydırıcıyı kurudan ıslağa çekerken ham değer 921'den 307'ye iniyor. Bundan ne çıkarırsın?",
              "options": [
                "Sensör bozuk, çünkü ıslakta değer artmalıdır",
                "Ham değer ne olursa olsun yüzde aynı kalır",
                "Bu modülde ıslandıkça değer düşer; yüzde hesabı bu yöne göre yapılmalı",
                "Sensör yalnız 0 ve 1023 verebilir"
              ],
              "answer": 2,
              "explanation": "Sensör yönü modülden modüle değişir; bu modül ıslandıkça düşen türdendir ve bozuk değildir. Doğru yüzde için KURU ve ISLAK uçları bu yöne göre verilir. Yönü bilmeden hesap yapmak ters sonuç üretir.",
              "skills": [
                "sens-analog-calib"
              ]
            },
            {
              "id": "m4h3d48-q2",
              "kind": "numeric",
              "prompt": "KURU = 800 ve ISLAK = 350 için ham değer 500 okundu. Aşağıdaki kod seri monitöre kaç yazdırır?\n\n```\nint yuzde = map(500, 800, 350, 0, 100);\nSerial.println(yuzde);\n```",
              "answer": 66,
              "tolerance": 0,
              "unit": "%",
              "explanation": "map formülü: (500 − 800) × (100 − 0) / (350 − 800) = (−300 × 100) / (−450) = 66,67. map tam sayı bölmesi yaptığı için ondalık kısım atılır ve sonuç 66 olur (67 değil).",
              "skills": [
                "sens-analog-calib"
              ]
            },
            {
              "id": "m4h3d48-q3",
              "kind": "predict-output",
              "prompt": "Yağmur sensörü A0'da, su seviyesi sensörü A1'de. A0 = 700, A1 = 450 okunuyor. Bu kod ne yazdırır?\n\n```\nint yagmur = analogRead(A0);\nint seviye = analogRead(A1);\nSerial.print(yagmur < 600 ? \"VAR\" : \"YOK\");\nSerial.print(\" \");\nif (seviye < 300) Serial.println(\"BOS\");\nelse if (seviye < 600) Serial.println(\"ORTA\");\nelse Serial.println(\"DOLU\");\n```",
              "options": [
                "VAR ORTA",
                "YOK ORTA",
                "YOK DOLU",
                "VAR BOS"
              ],
              "answer": 1,
              "explanation": "700, 600'den küçük olmadığı için yağmur için \"YOK\" yazılır (bu sensörde yağmurda değer düşer). 450 değeri 300 ile 600 arasında olduğundan seviye \"ORTA\" olur. Sonuç: YOK ORTA.",
              "skills": [
                "sens-analog-calib",
                "sens-threshold-hyst"
              ]
            },
            {
              "id": "m4h3d48-q4",
              "kind": "find-bug",
              "prompt": "Toprak ıslak ve ham değer 350 iken ekranda %100 beklenir, ama bu kod %0 yazdırıyor. KURU ham değeri 800, ISLAK ham değeri 350'dir. Hangi satırda hata vardır?\n\n```\n1 const int KURU = 800;\n2 const int ISLAK = 350;\n3 int yuzde = map(analogRead(A2), ISLAK, KURU, 0, 100);\n4 Serial.println(yuzde);\n```",
              "options": [
                "Satır 1: KURU değeri yanlış",
                "Satır 2: ISLAK değeri sıfır olmalı",
                "Satır 3: map içinde uçların sırası ters; KURU önce, ISLAK sonra gelmeli",
                "Satır 4: println yerine print yazılmalı"
              ],
              "answer": 2,
              "explanation": "map(x, a, b, 0, 100) a değerini 0'a, b değerini 100'e bağlar. ISLAK önce yazılınca 350 değeri %0 olur. Yüzde 0 kuru, 100 ıslak olacağı için doğrusu map(analogRead(A2), KURU, ISLAK, 0, 100) olur.",
              "skills": [
                "sens-analog-calib",
                "prog-debug"
              ]
            },
            {
              "id": "m4h3d48-q5",
              "kind": "mcq",
              "prompt": "Yağmur eşiği 600. Okuma 595 ile 605 arasında titreyince çıktı hızla VAR ve YOK arasında gidip geliyor. En uygun çözüm hangisidir?",
              "options": [
                "İki eşik kullanmak: örneğin 550'nin altında VAR, 650'nin üstünde YOK, arada durumu korumak",
                "Eşiği 601 yapmak",
                "delay'i kaldırmak",
                "Sensörü ters bağlamak"
              ],
              "answer": 0,
              "explanation": "Sorun tek eşiğin etrafında durumun sürekli değişmesidir. İki eşik (histerezis) arası bölgede eski durum korunur ve titreme kesilir. Eşiği 1 birim oynatmak aynı sorunu başka bir değerde yaşatır.",
              "skills": [
                "sens-threshold-hyst"
              ]
            }
          ]
        },
        {
          "title": "Çok sayfalı ekran arayüzü (LCD/OLED)",
          "durationMin": 25,
          "problem": "Küçük bir hava istasyonunun ekranı 16 karakter ve 2 satırdır. Oysa göstermek istediğin sıcaklık, nem, basınç, rakım ve toprak nemidir. Hepsini aynı anda sığdıramazsın. Telefonlardaki gibi \"sayfa\" mantığıyla çözeceğiz: ekran birkaç saniyede bir sayfa değiştirir, istersen butonla sen çevirirsin. Bunu yaparken programın hiçbir yerde `delay` ile durmayacak.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| I2C LCD (adres 0x27) | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND |\n| BMP280 (adres 0x76) | SDA → **A4**, SCL → **A5** (LCD ile aynı hat), VCC → 5V, GND → GND |\n| DHT (DHT22) | DATA → **D5**, VCC → 5V, GND → GND |\n| Toprak nemi modülü | AO → **A2**, VCC → 5V, GND → GND |\n| Buton \"sonraki sayfa\" | A → **D2**, B → GND (`INPUT_PULLUP`) |\n\nLCD (0x27) ve BMP280 (0x76) farklı adreslerde oldukları için aynı iki kabloyu (SDA, SCL) paylaşırlar (33. ders). A4 ve A5 pinlerine iki ayrı kablo çekebilirsin ya da ikinci cihazın SDA/SCL ucunu birinci cihazın aynı ucuna bağlayabilirsin. Çalışırken sensörlerin kaydırıcılarını oynatabilir, Buton parçasına basılı tutarak basabilirsin.\n\n### Fikir: sayfa numarası ve zamanlayıcı\nBir `sayfa` değişkeni hangi sayfanın gösterildiğini tutar. Süre dolunca değişken bir artar, sonuna gelince başa döner:\n\n```cpp\nsayfa = (sayfa + 1) % SAYFA_SAYISI;   // 0, 1, 2, 0, 1, 2, ...\n```\n\n`%` bölümden kalanı verir: 2'den sonra 3 % 3 = 0 olur. Süre için 27. dersteki `millis()` kalıbını kullanırız: `simdi - sonSayfa >= 3000`.\n\n### Ekranı titretmeden güncelleme\nHer güncellemede `lcd.clear()` çağırırsan ekran bir an boşalır ve titrer. Daha iyi yöntem: her satırı **her zaman 16 karaktere tamamlayarak** yaz. Yeni yazı eskisinden kısaysa kalan boşluklar eski karakterlerin üstünü örter. Bu iş için küçük bir yardımcı yazarız. Ayrıca iki yeni araç kullanacağız:\n\n- **`snprintf(tampon, boyut, biçim, ...)`:** Biçimlenmiş bir yazıyı bir karakter dizisine (tampon) yazar. `%s` metin, `%d` tam sayı, `%-16s` \"sola yaslı, 16 karakter genişliğinde metin\" demektir. `%%` ise yüzde işaretini yazdırır. Arduino Uno'da `snprintf` ondalıklı sayıyı (`%f`) yazdırmaz; sayı yerine `?` çıkar.\n- **`dtostrf(sayi, genislik, basamak, tampon)`:** Ondalıklı sayıyı metne çevirir. `dtostrf(23.4, 1, 1, tampon)` tampona `\"23.4\"` yazar. Böylece ondalıklı sayıyı `snprintf` içine metin olarak koyarız.\n\n### Program: 3 sayfalı hava ekranı\nSayfa 1 sıcaklık ve nem, sayfa 2 basınç ve rakım, sayfa 3 toprak nemi gösterir. Sağ üst köşede `1/3` gibi sayfa numarası durur. Sensörler 2 saniyede bir okunur (DHT için gerekli süre), sayfa 3 saniyede bir değişir, buton ise sayfayı hemen değiştirir ve 3 saniyelik süreyi yeniden başlatır.\n\n```cpp\n// sketch: ekran_sayfalar\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <Adafruit_BMP280.h>\n#include <DHT.h>\n\nconst int BUTON = 2;\nconst int SAYFA_SAYISI = 3;\nconst unsigned long SAYFA_SURESI = 3000;   // ms\nconst unsigned long OLCUM_ARALIGI = 2000;  // ms\nconst int KURU = 800;\nconst int ISLAK = 350;\nconst float P0_HPA = 1013.25;\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nAdafruit_BMP280 bmp;\nDHT dht(5, DHT22);\n\nint sayfa = 0;\nunsigned long sonSayfa = 0;\nunsigned long sonOlcum = 0;\nunsigned long sonBasis = 0;\nbool oncekiBasili = false;\nbool bmpHazir = false;\n\nfloat sicaklik = NAN;\nfloat nem = NAN;\nfloat hpa = NAN;\nfloat rakim = NAN;\nint toprakHam = 0;\nint toprakYuzde = 0;\n\n// Sayiyi metne cevirir; gecersizse \"--\" verir.\nconst char* sayi(float v, int basamak, char* tampon) {\n  if (isnan(v)) {\n    return \"--\";\n  }\n  dtostrf(v, 1, basamak, tampon);\n  return tampon;\n}\n\n// Bir satiri her zaman 16 karaktere tamamlayarak yazar.\nvoid satirYaz(int satir, const char* metin) {\n  char tampon[17];\n  snprintf(tampon, sizeof(tampon), \"%-16s\", metin);\n  lcd.setCursor(0, satir);\n  lcd.print(tampon);\n}\n\nvoid sayfaCiz() {\n  char ust[17];\n  char alt[17];\n  char a[10];\n  char b[10];\n\n  if (sayfa == 0) {\n    snprintf(ust, sizeof(ust), \"Sic: %s C\", sayi(sicaklik, 1, a));\n    snprintf(alt, sizeof(alt), \"Nem: %s %%\", sayi(nem, 1, b));\n  } else if (sayfa == 1) {\n    if (bmpHazir) {\n      snprintf(ust, sizeof(ust), \"P:%s hPa\", sayi(hpa, 1, a));\n      snprintf(alt, sizeof(alt), \"Rakim: %s m\", sayi(rakim, 0, b));\n    } else {\n      snprintf(ust, sizeof(ust), \"BMP280 yok\");\n      snprintf(alt, sizeof(alt), \" \");\n    }\n  } else {\n    snprintf(ust, sizeof(ust), \"Toprak: %%%d\", toprakYuzde);\n    snprintf(alt, sizeof(alt), \"Ham: %d\", toprakHam);\n  }\n\n  char baslik[17];\n  snprintf(baslik, sizeof(baslik), \"%-13s%d/%d\", ust, sayfa + 1, SAYFA_SAYISI);\n  satirYaz(0, baslik);\n  satirYaz(1, alt);\n}\n\nvoid olcumYap() {\n  float n = dht.readHumidity();\n  float s = dht.readTemperature();\n  sicaklik = s;                         // okunamazsa NAN kalir, ekran \"--\" yazar\n  nem = n;\n\n  if (bmpHazir) {\n    hpa = bmp.readPressure() / 100.0;\n    rakim = bmp.readAltitude(P0_HPA);\n  }\n\n  long toplam = 0;\n  for (int i = 0; i < 8; i++) {\n    toplam += analogRead(A2);\n  }\n  toprakHam = toplam / 8;\n  toprakYuzde = constrain(map(toprakHam, KURU, ISLAK, 0, 100), 0, 100);\n}\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  lcd.init();\n  lcd.backlight();\n  dht.begin();\n  bmpHazir = bmp.begin(0x76);\n  delay(1500);                          // DHT sensoru acilsin\n  olcumYap();\n  sayfaCiz();\n  sonOlcum = millis();\n  sonSayfa = millis();                  // sayfa suresi simdi baslasin\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // Butona basilinca hemen sonraki sayfa\n  bool basili = (digitalRead(BUTON) == LOW);\n  if (basili && !oncekiBasili && simdi - sonBasis > 50) {\n    sonBasis = simdi;\n    sayfa = (sayfa + 1) % SAYFA_SAYISI;\n    sonSayfa = simdi;                   // 3 saniyelik sure bastan\n    sayfaCiz();\n  }\n  oncekiBasili = basili;\n\n  // Sensorler 2 saniyede bir\n  if (simdi - sonOlcum >= OLCUM_ARALIGI) {\n    sonOlcum = simdi;\n    olcumYap();\n    sayfaCiz();\n  }\n\n  // Sayfa 3 saniyede bir\n  if (simdi - sonSayfa >= SAYFA_SURESI) {\n    sonSayfa = simdi;\n    sayfa = (sayfa + 1) % SAYFA_SAYISI;\n    sayfaCiz();\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `sayfa` 0, 1 ve 2 değerlerini alır. `sayfaCiz()` sayfa numarasına bakıp ilgili iki satırı hazırlar. Ekrana dokunan tek yer `satirYaz`'dır.\n2. `sayi()` yardımcı fonksiyonu ölçüm geçersizse `\"--\"` yazar. Böylece DHT ya da BMP280 yokken ekranda `nan` yerine `--` görünür.\n3. Üç iş birbirinden bağımsız saatlerle çalışır: butona bakma, sensör okuma (2 sn) ve sayfa çevirme (3 sn). Hiçbirinde `delay` yok (27. ders).\n4. `setup` sonunda `sonSayfa = millis()` yazdık. Bunu yapmasaydık `millis()` açılıştan beri saydığı için, `setup` içindeki 1,5 saniyelik `delay` ve LCD başlatma süresi sayfa süresinden yenmiş olur, ilk sayfa çok kısa görünürdü.\n5. Sayfa 2'de BMP280 yoksa ekran \"BMP280 yok\" der; program yine çalışır.\n\nLaboratuvarda gördüğümüz davranış: ekran 3 saniyede bir `1/3`, `2/3`, `3/3`, `1/3` sırasıyla değişti (aralık 3000 ms'ye çok yakın). DHT'nin sıcaklığı 25 °C ve nemi 50 % iken ilk sayfada `Sic: 25.0 C` ve `Nem: 50.0 %` göründü. Buton sayfayı hemen çevirdi ve sonraki otomatik değişim butondan 3 saniye sonra oldu. LCD ve BMP280 aynı I2C hattında birlikte çalıştı. Sıcaklık kaydırıcısını çalışırken değiştirince ilk sayfa en geç 2 saniye içinde yeni değeri gösterdi. Toprak nemi modülünün **Toprak nemi** kaydırıcısı 0,5 iken üçüncü sayfa `Toprak: %41` ve `Ham: 614` gösterir (48. dersteki ölçüm).\n\n### OLED ekran (kısa tanıtım)\n**Laboratuvarda OLED parçası yok**; bu bölüm okuyarak öğrenmen içindir, etkinlikte yalnız LCD kullanılır.\n\nOLED, her piksel kendi ışığını üreten küçük ekrandır. Yaygın modüller 128x64 pikseldir ve I2C ile bağlanır (adres genellikle 0x3C; etiketine bak). LCD'den farkı: karakter değil **piksel** çizersin, yazı boyutu seçebilirsin, çizgi ve şekil de çizebilirsin. Kütüphane olarak Adafruit SSD1306 ve Adafruit GFX kullanılır.\n\nDikkat: 128x64 bir ekranın görüntü tamponu 1024 bayttır. Bu, Uno'nun 2048 baytlık SRAM'ının yarısıdır (34. ders). Büyük metin dizileri ve diğer kütüphanelerle birlikte belleğin dolmamasına dikkat et.\n\nAşağıdaki örnek aynı sayfa mantığını OLED'e uygular. Bu sketch yalnızca derlenerek denendi; laboratuvarda OLED olmadığı için ekran davranışı doğrulanmadı. Kütüphanenin kullanımı için Adafruit SSD1306 ve GFX belgelerine ve örneklerine bak.\n\n```cpp\n// sketch: oled_sayfalar\n#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nAdafruit_SSD1306 oled(128, 64, &Wire, -1);   // genislik, yukseklik, I2C, reset yok\n\nconst int SAYFA_SAYISI = 3;\nconst unsigned long SAYFA_SURESI = 3000;\nint sayfa = 0;\nunsigned long sonSayfa = 0;\nbool oledHazir = false;\n\nvoid sayfaCiz() {\n  oled.clearDisplay();\n  oled.setTextSize(2);\n  oled.setTextColor(SSD1306_WHITE);\n  oled.setCursor(0, 0);\n  if (sayfa == 0) {\n    oled.println(\"Sicaklik\");\n    oled.print(23.4, 1);\n    oled.println(\" C\");\n  } else if (sayfa == 1) {\n    oled.println(\"Basinc\");\n    oled.print(1013.2, 1);\n    oled.println(\" hPa\");\n  } else {\n    oled.println(\"Toprak\");\n    oled.println(\"%45\");\n  }\n  oled.display();                       // cizdiklerini ekrana gonder\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  oledHazir = oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  if (!oledHazir) {\n    Serial.println(\"OLED bulunamadi\");\n    return;\n  }\n  sayfaCiz();\n}\n\nvoid loop() {\n  if (!oledHazir) {\n    return;\n  }\n  unsigned long simdi = millis();\n  if (simdi - sonSayfa >= SAYFA_SURESI) {\n    sonSayfa = simdi;\n    sayfa = (sayfa + 1) % SAYFA_SAYISI;\n    sayfaCiz();\n  }\n}\n```\n\nOLED'de çizdiklerin `oled.display()` çağrılana kadar ekrana gitmez; önce tampona çizersin, sonra tek seferde gönderirsin. Gerçek modüllerde adres 0x3C değilse `begin` içindeki adresi değiştirmek gerekir.\n\n### Dene\n- `SAYFA_SURESI` değerini 1500 yap. Yazıları okuyabiliyor musun? Hangi süre sence okumak için yeterli?\n- Dördüncü bir sayfa ekle (örneğin `millis() / 1000` ile programın kaç saniyedir çalıştığı). `SAYFA_SAYISI` ve `sayfaCiz` içinde nelerin değişmesi gerekiyor?\n- `satirYaz` içindeki dolguyu kaldır, yerine doğrudan `lcd.print(metin)` yaz. Sayfa değiştirince ekranda eski yazının artıkları kalıyor mu?\n\n### Sık yapılan hatalar\n- Sayfayı `delay(3000)` ile bekletmek: butona basışı kaçırırsın ve sensörler durur.\n- Satırı 16 karaktere tamamlamamak: kısa bir yazı uzun olanın üstüne yazılınca eski karakterler ekranda kalır.\n- `snprintf` ile `%f` kullanmak: Uno'da ondalık sayı yazmaz; `dtostrf` kullan.\n- `sayfa` değişkenini sınırlamamak: `sayfa++` yazıp başa dönmeyi unutursan sayfa numarası sınırı aşar.\n- Tampon boyutunu küçük almak: uzun metin taşıp başka değişkenleri bozabilir; `snprintf` boyutu sınırlar, `sprintf` sınırlamaz.",
          "question": "Bir kullanıcı ekrandaki bir değeri okumaya çalışırken ekran 3 saniye dolunca sayfa değiştiriyor. Sence sayfa süresi sabit mi olmalı, yoksa kullanıcı butona basınca daha uzun mu beklemeli? Gösterilmesi gereken kritik bir uyarı (örneğin \"sulama gerekli\") varsa sayfa döngüsünde nasıl bir yer vermelisin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Küçük bir ekranda birçok değeri \"sayfa\" mantığıyla göstermeyi\n- `%` (mod) işleciyle sayfa numarasını başa döndürmeyi\n- Ekranı `clear()` ile titretmeden, satırı 16 karaktere tamamlayarak güncellemeyi\n- `snprintf` ve `dtostrf` ile metni biçimlendirmeyi\n- Sayfa değişimi, buton ve ölçümü `delay` olmadan birlikte çalıştırmayı\n\n### Önceden bilmen gerekenler\n- `millis()` ile bloklamayan zamanlama (27. ders)\n- I2C hattı ve LCD kullanımı (33. ders)\n- Buton okumak: `INPUT_PULLUP` ve kenar yakalama\n- DHT, BMP280 ve toprak nemi ölçümleri (46, 47 ve 48. dersler)\n\n### Ekran küçük, veri çok\n16x2 LCD ekran 2 satır ve satır başına 16 karaktere sahiptir; yani 32 karakter. Sıcaklık, nem, basınç, rakım ve toprak nemi aynı anda sığmaz. Çözüm telefon mantığıdır: bilgiyi **sayfalara** bölersin ve ekran sırayla birini gösterir.\n\n### Sayfa numarası ve mod işleci\nHangi sayfada olduğunu bir değişken tutar. Süre dolunca ya da butona basınca değişken bir artar, sona gelince başa döner. Bunu `%` (bölümden kalan) sağlar:\n\n```\nsayfa = (sayfa + 1) % 3;    // 0, 1, 2, 0, 1, 2 ...\n```\n\nSayfa 2 iken 3 % 3 = 0 olduğu için tekrar başa dönersin. Sayfa sayısını değiştirirsen yalnız `3` değişir.\n\n### Titremeyen güncelleme\nHer güncellemede `lcd.clear()` çağırırsan ekran bir an boşalır ve titrer. Daha iyi yol, satırı **her zaman 16 karaktere tamamlamaktır**. Yeni yazı kısaysa sonundaki boşluklar eski karakterleri örter. Bunu biçim belirleyicisi yapar: `%-16s` \"metni sola yasla, 16 karakter genişliğinde yaz\" demektir.\n\n### Metni biçimlendirmek\n`snprintf(tampon, boyut, biçim, ...)` biçimlenmiş yazıyı bir karakter dizisine koyar ve boyutu aştırmaz. `%d` tam sayı, `%s` metin, `%%` ise yüzde işaretidir. Uno'da `%f` ondalık sayı **yazmaz**, yerine `?` çıkar. Ondalık sayı için `dtostrf(23.4, 1, 1, tampon)` önce sayıyı metne çevirir, sonra `%s` ile yerleştirirsin.\n\n| Komut | Sonuç |\n|---|---|\n| `snprintf(t, 17, \"Nem: %d %%\", 55)` | `Nem: 55 %` |\n| `snprintf(t, 17, \"Sic: %f C\", 23.4)` | `Sic: ? C` (Uno'da) |\n| `dtostrf` ile metne çevirip `%s` | `Sic: 23.4 C` |\n\n### Üç işi birlikte yürütmek\nProgram aynı anda butona bakar, 2 saniyede bir sensör okur ve 3 saniyede bir sayfa çevirir. Hiçbirinde `delay` kullanılmaz; her işin kendi `millis()` zamanlayıcısı vardır. Butona basınca sayfa hemen değişir ve 3 saniyelik süre yeniden başlar. Ölçüm geçersizse ekranda `nan` yerine `--` göstermek kullanıcıyı korur.\n\n### Başka ekran: OLED\nOLED, her pikseli kendi ışığını üreten ekrandır. Karakter yerine piksel çizersin; yazı boyutu seçebilir, çizgi ve şekil çizebilirsin. 128x64 bir OLED'in görüntü tamponu 1024 bayttır. Bu, Uno'nun 2048 baytlık belleğinin yarısıdır. Bu laboratuvarda OLED yoktur; yalnız okuyarak öğrenirsin.\n\n### Özet\nÇok veriyi küçük ekrana sayfalarla sığdırırsın. Sayfa numarası `%` ile başa döner. Satırı 16 karaktere tamamlamak ekranı titretmeden günceller. `snprintf` metni biçimlendirir, ondalık sayıyı `dtostrf` ile metne çevirirsin. Sayfa değişimi, buton ve ölçüm `millis()` ile birlikte çalışır.",
          "concepts": [
            {
              "term": "Sayfa değişkeni",
              "definition": "Ekranda hangi sayfanın gösterildiğini tutan sayıdır; süre dolunca ya da butona basınca değişir.",
              "example": "sayfa 0, 1 ve 2 değerlerini alır; sayfaCiz() ona göre iki satırı hazırlar.",
              "pitfall": "sayfa++ yazıp başa dönmeyi unutmak; numara sınırı aşar ve hiçbir sayfa çizilmez."
            },
            {
              "term": "% (mod) işleci",
              "definition": "Bir bölmeden kalanı verir; sayacı belirli bir aralıkta döndürmek için kullanılır.",
              "example": "(sayfa + 1) % 3 ifadesi 2'den sonra 0 verir.",
              "pitfall": "% işaretini yüzde sanmak; metin içinde yüzde işareti yazmak için %% gerekir."
            },
            {
              "term": "Satırı 16 karaktere tamamlama",
              "definition": "Kısa yazının sonuna boşluk ekleyip ekrandaki eski karakterleri örtmek; clear() çağırmaktan daha az titretir.",
              "example": "snprintf(tampon, 17, \"%-16s\", metin) satırı 16 karaktere doldurur.",
              "pitfall": "Dolgu yapmamak; kısa yazı uzun olanın üstüne yazılınca eski karakterler ekranda kalır."
            },
            {
              "term": "snprintf ve dtostrf",
              "definition": "snprintf yazıyı biçimleyip tampona yazar ve boyutu aşmaz; dtostrf ondalık sayıyı metne çevirir.",
              "example": "dtostrf(23.4, 1, 1, t) ile \"23.4\" metni elde edilir ve %s ile yazıya konur.",
              "pitfall": "Uno'da snprintf içinde %f kullanmak; sayı yerine ? çıkar."
            },
            {
              "term": "Bloklamayan sayfa döngüsü",
              "definition": "Sayfa değişimi, buton ve ölçüm, her biri kendi millis() zamanlayıcısıyla ve delay olmadan yürütülür.",
              "example": "simdi - sonSayfa >= 3000 olduğunda sayfa çevrilir; buton arada hemen çevirir.",
              "pitfall": "Sayfayı delay(3000) ile beklemek; buton ve sensör bu sırada hiç çalışmaz."
            }
          ],
          "quiz": [
            {
              "id": "m4h3d49-q1",
              "kind": "numeric",
              "prompt": "4 sayfalı bir ekranda sayfa değişkeni şu an 3. Buton art arda 6 kez basıldı ve her basışta aşağıdaki satır çalıştı. Sayfa değişkeni şimdi kaçtır?\n\n```\nsayfa = (sayfa + 1) % 4;\n```",
              "answer": 1,
              "tolerance": 0,
              "explanation": "Sıra: 3 → 0 → 1 → 2 → 3 → 0 → 1. Kısa yol: (3 + 6) % 4 = 9 % 4 = 1. Her 4 basışta sayfa kendi değerine döner, geriye 2 basış kalır: 3'ten iki adım sonra 1.",
              "skills": [
                "ui-paging"
              ]
            },
            {
              "id": "m4h3d49-q2",
              "kind": "predict-output",
              "prompt": "Uno'da bu kod seri monitöre hangi iki satırı yazdırır?\n\n```\nchar t[17];\nsnprintf(t, sizeof(t), \"Nem: %d %%\", 55);\nSerial.println(t);\nsnprintf(t, sizeof(t), \"Sic: %f C\", 23.4);\nSerial.println(t);\n```",
              "options": [
                "Nem: 55 %  ve  Sic: 23.4 C",
                "Nem: %d %  ve  Sic: %f C",
                "Nem: 55  ve  Sic: 23.4 C",
                "Nem: 55 %  ve  Sic: ? C"
              ],
              "answer": 3,
              "explanation": "%d tam sayı 55'i, %% ise tek bir % işaretini yazar. Uno'nun snprintf'i %f ile ondalık sayı yazamaz, yerine ? koyar; ondalık sayı için önce dtostrf ile metne çevirmek gerekir.",
              "skills": [
                "ui-text-format"
              ]
            },
            {
              "id": "m4h3d49-q3",
              "kind": "find-bug",
              "prompt": "Bu kodda butona basınca sayfa çoğu zaman değişmiyor, sensör de geç güncelleniyor. Hangi satırda hata vardır?\n\n```\n1 void loop() {\n2   if (digitalRead(BUTON) == LOW) sayfa = (sayfa + 1) % 3;\n3   sayfaCiz();\n4   delay(3000);\n5 }\n```",
              "options": [
                "Satır 2: % 3 yerine % 2 yazılmalı",
                "Satır 3: sayfaCiz() çağrılmamalı",
                "Satır 4: delay(3000) programı 3 saniye durdurur; buton ve ölçüm bu sürede çalışmaz",
                "Satır 5: kapanış parantezi fazla"
              ],
              "answer": 2,
              "explanation": "delay(3000) her turda programı 3 saniye bekletir; bu sürede buton okunmaz ve sensör güncellenmez. Çözüm sayfayı millis() ile zamanlamaktır. Satır 2'deki % 3 üç sayfa için doğrudur.",
              "skills": [
                "ui-paging",
                "prog-timing",
                "prog-debug"
              ]
            },
            {
              "id": "m4h3d49-q4",
              "kind": "mcq",
              "prompt": "LCD'yi her güncellemede lcd.clear() ile silmek yerine her satırı 16 karaktere tamamlayarak yazmanın amacı nedir?",
              "options": [
                "Ekranın boşalıp titremesini önlemek ve kısa yazının eski karakterleri örtmesini sağlamak",
                "Ekranın daha parlak görünmesi",
                "Belleği boşaltmak",
                "Seri portu hızlandırmak"
              ],
              "answer": 0,
              "explanation": "clear() ekranı bir an boşaltır ve titreme yaratır. Satırı boşlukla 16 karaktere tamamlayınca yeni yazı eskisinin üstünü tamamen örter ve ekran hiç boşalmaz. Parlaklık, bellek ya da seri port hızıyla ilgisi yoktur.",
              "skills": [
                "ui-text-format"
              ]
            },
            {
              "id": "m4h3d49-q5",
              "kind": "numeric",
              "prompt": "Bir OLED ekran her piksel için 1 bit bellek kullanır. 128x32 piksellik bir ekranın görüntü tamponu kaç bayt yer kaplar? (1 bayt = 8 bit)",
              "answer": 512,
              "tolerance": 0,
              "unit": "bayt",
              "explanation": "128 × 32 = 4096 piksel = 4096 bit; 8'e bölünce 512 bayt eder. Aynı hesapla 128x64 ekran 1024 bayt tutar, bu da Uno'nun 2048 baytlık belleğinin yarısıdır.",
              "skills": [
                "ui-paging"
              ]
            }
          ]
        },
        {
          "title": "Proje: Hava istasyonu ve sulama uyarısı",
          "durationMin": 35,
          "problem": "Balkondaki domates fidelerini bir hafta sonu tatilinde kimse sulayamadı. Dönünce yapraklar sarkmıştı. Peki kart onlara bakıp \"toprak kurudu, sulama zamanı\" diyebilseydi? Bu projede bir hava istasyonu yapacaksın: sıcaklığı, nemi, basıncı ve rakımı ölçüp ekranda sayfa sayfa gösterecek; toprak kuruyunca da LED yakıp buzzer ile uyaracak.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Modül 3, 18. ders:** Buzzer ile `tone` (D8).\n- **Modül 3, 14. ve 35. dersler:** `map`/`constrain` ile kalibrasyon ve histerezis.\n- **Modül 3, 27. ve 33. dersler:** `millis()` ile bloklamayan kod, I2C hattında birden çok cihaz.\n- **46-49. dersler:** DHT22, BMP280, toprak nemi sensörü ve çok sayfalı LCD.\n\nSistem şöyle çalışır: Her 2 saniyede bir DHT22, BMP280 ve toprak nemi okunur. LCD üç sayfayı 3 saniyede bir değiştirerek gösterir. Toprak nemi **%30'un altına** inince sulama uyarısı başlar: LED yanar, buzzer her 2 saniyede bir kısa öter ve seri porta bir satır yazılır. Uyarı, toprak **%40'a** çıkınca biter. İki ayrı eşik kullanırız (35. dersteki histerezis); böylece nem %30 civarında dalgalanırken uyarı açılıp kapanıp durmaz.\n\n### Devre\nBu projede pompa ya da vana yok; yalnızca LED ve buzzer var. Bilgi notu: gerçek bir sulama pompası eklenecekse 22. ve 24. derslerdeki gibi transistör ya da röle ve ayrı bir güç kaynağı gerekir; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| DHT (DHT22) | DATA → **D5**, VCC → 5V, GND → GND |\n| BMP280 (adres 0x76) | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND |\n| I2C LCD (adres 0x27) | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND |\n| Toprak nemi modülü | AO → **A2**, VCC → 5V, GND → GND |\n| LED + 330 Ω direnç | **D13** → direncin 1 ucu; direncin 2 ucu → LED A (anot); LED K (katot) → GND |\n| Pasif buzzer | **D8** → buzzer +, buzzer − → GND (Tür özelliği Pasif) |\n| Buton \"sonraki sayfa\" | A → **D2**, B → GND (`INPUT_PULLUP`) |\n\nLCD ve BMP280 aynı iki kabloyu (SDA, SCL) paylaşır; adresleri farklı olduğu (0x27, 0x76) için karışmazlar. Toprak nemi için 48. dersteki sayılar geçerlidir: **Toprak nemi** kaydırıcısı 0 iken ham değer yaklaşık 921, 1 iken yaklaşık 307 çıkar; aşağıdaki program `KURU = 800` ve `ISLAK = 350` varsayar. Bu durumda kaydırıcı yaklaşık 0,41 ve altında uyarı (%29 ve altı) başlar, 0,5 ve üstünde (%41) uyarı biter.\n\n### Uyarı mantığı\n| Durum | Koşul | Eylem |\n|---|---|---|\n| Normal | Toprak nemi `%30` ve üstü | LED sönük, buzzer sessiz |\n| Normal → UYARI | Nem `%30`'un **altına** inerse | LED yanar, buzzer öter, seri porta **bir** satır yazılır |\n| UYARI | Nem `%30`-`%40` arasında | Uyarı sürer (histerezis) |\n| UYARI → Normal | Nem `%40` ya da üstüne çıkarsa | LED söner, buzzer susar, seri porta bir satır yazılır |\n\n### Program\n```cpp\n// sketch: hava_istasyonu\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <Adafruit_BMP280.h>\n#include <DHT.h>\n\nconst int LED = 13;\nconst int BUZZER = 8;\nconst int BUTON = 2;\n\nconst int KURU = 800;                       // ham deger: kuru toprak\nconst int ISLAK = 350;                      // ham deger: islak toprak\nconst int ESIK_ALT = 30;                    // % - altina inince uyari\nconst int ESIK_UST = 40;                    // % - ustune cikinca uyari biter\nconst float P0_HPA = 1013.25;               // deniz seviyesi basinci\n\nconst int SAYFA_SAYISI = 3;\nconst unsigned long OLCUM_ARALIGI = 2000;   // ms (DHT icin en az 2 sn)\nconst unsigned long SAYFA_SURESI = 3000;    // ms\nconst unsigned long BIP_ARALIGI = 2000;     // ms\nconst unsigned long BIP_SURESI = 200;       // ms\nconst int BIP_HZ = 1000;\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nAdafruit_BMP280 bmp;\nDHT dht(5, DHT22);\n\nfloat sicaklik = NAN;\nfloat nem = NAN;\nfloat hpa = NAN;\nfloat rakim = NAN;\nint toprakHam = 0;\nint toprakYuzde = 0;\n\nbool bmpHazir = false;\nbool uyari = false;\nint sayfa = 0;\nbool oncekiBasili = false;\nunsigned long sonOlcum = 0;\nunsigned long sonSayfa = 0;\nunsigned long sonBip = 0;\nunsigned long sonBasis = 0;\n\n// Sayiyi metne cevirir; gecersizse \"--\" verir.\nconst char* sayi(float v, int basamak, char* tampon) {\n  if (isnan(v)) {\n    return \"--\";\n  }\n  dtostrf(v, 1, basamak, tampon);\n  return tampon;\n}\n\n// Seri porta sayi yazar; gecersizse \"--\".\nvoid seriSayi(const char* ad, float v, int basamak) {\n  Serial.print(ad);\n  if (isnan(v)) {\n    Serial.print(\"--\");\n  } else {\n    Serial.print(v, basamak);\n  }\n}\n\nvoid satirYaz(int satir, const char* metin) {\n  char tampon[17];\n  snprintf(tampon, sizeof(tampon), \"%-16s\", metin);\n  lcd.setCursor(0, satir);\n  lcd.print(tampon);\n}\n\nvoid sayfaCiz() {\n  char ust[17];\n  char alt[17];\n  char a[10];\n  char b[10];\n\n  if (sayfa == 0) {\n    snprintf(ust, sizeof(ust), \"Sic: %s C\", sayi(sicaklik, 1, a));\n    snprintf(alt, sizeof(alt), \"Nem: %s %%\", sayi(nem, 1, b));\n  } else if (sayfa == 1) {\n    if (bmpHazir) {\n      snprintf(ust, sizeof(ust), \"P:%s hPa\", sayi(hpa, 1, a));\n      snprintf(alt, sizeof(alt), \"Rakim: %s m\", sayi(rakim, 0, b));\n    } else {\n      snprintf(ust, sizeof(ust), \"BMP280 yok\");\n      snprintf(alt, sizeof(alt), \" \");\n    }\n  } else {\n    snprintf(ust, sizeof(ust), \"Toprak: %%%d\", toprakYuzde);\n    snprintf(alt, sizeof(alt), \"%s\", uyari ? \"SULAMA GEREKLI\" : \"Durum: NORMAL\");\n  }\n\n  char baslik[17];\n  char sonSatir[17];\n  snprintf(baslik, sizeof(baslik), \"%-13s%d/%d\", ust, sayfa + 1, SAYFA_SAYISI);\n  snprintf(sonSatir, sizeof(sonSatir), \"%-15s%c\", alt, uyari ? '!' : ' ');\n  satirYaz(0, baslik);\n  satirYaz(1, sonSatir);\n}\n\nvoid olcumYap() {\n  nem = dht.readHumidity();\n  sicaklik = dht.readTemperature();\n  if (bmpHazir) {\n    hpa = bmp.readPressure() / 100.0;\n    rakim = bmp.readAltitude(P0_HPA);\n  }\n  long toplam = 0;\n  for (int i = 0; i < 8; i++) {\n    toplam += analogRead(A2);\n  }\n  toprakHam = toplam / 8;\n  toprakYuzde = constrain(map(toprakHam, KURU, ISLAK, 0, 100), 0, 100);\n}\n\n// Toprak nemine gore uyariyi acar/kapatir (histerezisli).\nvoid uyariKontrol(unsigned long simdi) {\n  if (!uyari && toprakYuzde < ESIK_ALT) {\n    uyari = true;\n    sonBip = simdi - BIP_ARALIGI;           // ilk bip hemen calsin\n    digitalWrite(LED, HIGH);\n    Serial.print(\"UYARI: toprak nemi %\");\n    Serial.print(toprakYuzde);\n    Serial.println(\" - sulama gerekli\");\n  } else if (uyari && toprakYuzde >= ESIK_UST) {\n    uyari = false;\n    digitalWrite(LED, LOW);\n    noTone(BUZZER);\n    Serial.print(\"Toprak nemi normale dondu: %\");\n    Serial.println(toprakYuzde);\n  }\n}\n\nvoid seriDurum() {\n  seriSayi(\"T=\", sicaklik, 1);\n  seriSayi(\" N=\", nem, 1);\n  seriSayi(\" P=\", hpa, 1);\n  seriSayi(\" R=\", rakim, 0);\n  Serial.print(\" Toprak=%\");\n  Serial.print(toprakYuzde);\n  Serial.print(\" Uyari=\");\n  Serial.println(uyari ? 1 : 0);\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  pinMode(BUZZER, OUTPUT);\n  pinMode(BUTON, INPUT_PULLUP);\n  digitalWrite(LED, LOW);\n  Serial.begin(9600);\n\n  lcd.init();\n  lcd.backlight();\n  dht.begin();\n  bmpHazir = bmp.begin(0x76);\n  if (!bmpHazir) {\n    Serial.println(\"BMP280 bulunamadi\");\n  }\n  delay(1500);                              // DHT sensoru acilsin\n\n  olcumYap();\n  uyariKontrol(millis());\n  seriDurum();\n  sayfaCiz();\n  sonOlcum = millis();\n  sonSayfa = millis();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // 1) Buton: hemen sonraki sayfa\n  bool basili = (digitalRead(BUTON) == LOW);\n  if (basili && !oncekiBasili && simdi - sonBasis > 50) {\n    sonBasis = simdi;\n    sayfa = (sayfa + 1) % SAYFA_SAYISI;\n    sonSayfa = simdi;\n    sayfaCiz();\n  }\n  oncekiBasili = basili;\n\n  // 2) Olcum, uyari ve seri cikti: 2 saniyede bir\n  if (simdi - sonOlcum >= OLCUM_ARALIGI) {\n    sonOlcum = simdi;\n    olcumYap();\n    uyariKontrol(simdi);\n    seriDurum();\n    sayfaCiz();\n  }\n\n  // 3) Sayfa degisimi: 3 saniyede bir\n  if (simdi - sonSayfa >= SAYFA_SURESI) {\n    sonSayfa = simdi;\n    sayfa = (sayfa + 1) % SAYFA_SAYISI;\n    sayfaCiz();\n  }\n\n  // 4) Uyari sirasinda buzzer: 2 saniyede bir kisa bip\n  if (uyari && simdi - sonBip >= BIP_ARALIGI) {\n    sonBip = simdi;\n    tone(BUZZER, BIP_HZ, BIP_SURESI);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `olcumYap()` üç sensörü okur ve değerleri genel değişkenlere koyar. DHT okunamazsa değer `NaN` kalır; ekran ve seri port bunu `--` olarak gösterir, program durmaz. BMP280 bulunamazsa `bmpHazir` yanlış olur ve basınç sayfası \"BMP280 yok\" der (47. ders).\n2. Toprak nemi 48. dersteki gibi 8 ölçümün ortalamasından `map` ve `constrain` ile yüzdeye çevrilir.\n3. `uyariKontrol()` bir **durum** tutar: `uyari`. Normalken yüzde 30'un altına inerse açılır; açıkken 40'a çıkarsa kapanır. Seri porta uyarı satırı yalnız **durum değişince** bir kez yazılır; böylece Serial Monitor aynı mesajla dolmaz. Her 2 saniyede bir yazılan `T=... Uyari=1` durum satırı ise sürekli akar.\n4. Buzzer `tone(BUZZER, 1000, 200)` ile 200 ms öter ve program beklemez. `sonBip` ile 2 saniyede bir tekrar edilir (27. ders). Uyarı açıldığında `sonBip = simdi - BIP_ARALIGI` yazarak ilk bipin hemen çalmasını sağladık.\n5. Uyarı varken LCD'nin her sayfasının sağ alt köşesinde `!` görünür; sayfa 3'te ise \"SULAMA GEREKLI\" yazar. Böylece kullanıcı hangi sayfada olursa olsun uyarıyı görür.\n6. Dört iş (buton, ölçüm, sayfa, buzzer) kendi saatiyle çalışır; `loop()` içinde `delay` yoktur.\n\n### Laboratuvarda doğruladıklarımız\n- Toprak nemi kaydırıcısı 0,6 iken (%55) LED söner, buzzer susar, seri portta yalnız durum satırları akar (`T=25.0 N=50.0 P=990.0 R=195 Toprak=%55 Uyari=0`; BMP280 kaydırıcısı 990 hPa, DHT 25 °C ve 50 % iken). LCD sayfaları 3 saniyede bir `1/3`, `2/3`, `3/3` olarak döner. LCD ve BMP280 aynı I2C hattında çalışır.\n- Kaydırıcıyı 0,1'e çekince (%0) 2 saniye içinde LED yanar, seri porta tek bir `UYARI: toprak nemi %0 - sulama gerekli` satırı yazılır, buzzer 1 kHz'de yaklaşık 200 ms'lik bipleri 2 saniye arayla çalar. Sayfa 3 \"SULAMA GEREKLI\" gösterir.\n- Kaydırıcıyı 0,45'e (%34, 30-40 arası) çıkarınca uyarı sürer. 0,5'e (%41) çıkarınca LED söner, buzzer susar ve seri porta \"normale dondu\" satırı yazılır.\n- Eşik tam sınırda: kaydırıcı 0,42 iken (%30) uyarı çıkmaz, 0,41 iken (%29) çıkar.\n- DHT ve BMP280 devrede yokken (bu iki parçayı tuvale hiç eklemeden) program çökmez: ekranda `--` ve \"BMP280 yok\", seri portta `--` görünür ve toprak uyarısı yine çalışır.\n\n### Dene\n- `ESIK_ALT` ve `ESIK_UST` değerlerini %30 ve %32 yap. Toprak nemi kaydırıcısını 0,42 ile 0,44 arasında (yaklaşık %30-%33) ileri geri oynat: uyarı kaç kez açılıp kapanıyor? Neden iki eşik daha iyi?\n- D3'e ikinci bir buton ekle: basınca buzzer'ı 10 dakikalığına sustursun, LED yanık kalsın. Bunun için hangi değişkenlere ihtiyacın var?\n- 48. dersteki gibi bir Yağmur sensörünü A0'a bağla: yağmur yağdığında (yağmur var) toprak kuru olsa bile sulama uyarısı verme. Koşulu nereye yazarsın?\n\n### Sık yapılan hatalar\n- Tek eşik kullanmak: nem eşik civarında dalgalanınca LED ve buzzer hızlıca açılıp kapanır, seri port satırlarla dolar.\n- Seri uyarıyı her turda yazmak: durum değişimini yakalamak yerine sürekli aynı mesajı basarsın.\n- `delay` ile buzzer çaldırmak: sayfa değişimi, buton ve ölçüm durur.\n- DHT'yi 2 saniyeden sık okumak.\n- Toprak sensörünün kuru/ıslak uçlarını kullandığın sensöre göre ölçmemek: yüzde hesabı yanlış olur.\n- DHT22'ye `NaN` dönmesine hazırlıksız olmak: ekranda `nan` görünür, eşik karşılaştırmaları şaşar.",
          "question": "Toprak nemi sensörü bozulup hep \"kuru\" okursa sistem sonsuza kadar uyarı verir, hep \"ıslak\" okursa hiç uyarı vermez. Sensörün bozulduğunu anlamak için hangi kontrolü eklerdin? Sulamayı sensör yerine zamana göre (haftada iki kez) yapmanın artı ve eksileri neler?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birkaç sensörü ve çıkışı tek bir projede birleştirmeyi\n- Bir sistemi \"durum\" (normal / uyarı) ve geçiş kurallarıyla tasarlamayı\n- Histerezisle uyarının titremeden açılıp kapanmasını sağlamayı\n- Birden çok işi `delay` olmadan, kendi zamanlayıcılarıyla yürütmeyi\n- Sensör yokken bile çökmeyen bir program yazmayı\n\n### Önceden bilmen gerekenler\n- DHT okuma, `isnan` ve 2 saniye kuralı (46. ders)\n- BMP280 ve `begin` sonucunu denetlemek (47. ders)\n- Toprak nemi, `map` ve `constrain` ile yüzde (48. ders)\n- Sayfalı LCD ekran ve `snprintf` (49. ders)\n- `tone` ile buzzer (18. ders), `millis()` (27. ders), histerezis (35. ders)\n\n### Proje nedir?\nBu proje bir **hava istasyonu** ve **sulama uyarısıdır**. Sistem sıcaklık, nem, basınç, rakım ve toprak nemini ölçer; LCD'de sayfa sayfa gösterir. Toprak kuruyunca LED yanar, buzzer ötmeye başlar ve seri porta bir satır yazılır. Pompa yoktur; gerçek bir pompa için transistör ya da röle ve ayrı güç kaynağı gerekir.\n\n### Önce plan: durumlar ve kurallar\nKodu yazmadan önce davranışı tabloya dökmek işi kolaylaştırır:\n\n| Durum | Ne zaman | Eylem |\n|---|---|---|\n| Normal | toprak nemi % 30 ve üstü | LED sönük, buzzer sessiz |\n| Normal → Uyarı | nem % 30'un altına iner | LED yanar, buzzer öter, bir satır yazılır |\n| Uyarı | nem % 30 ile % 40 arası | uyarı sürer |\n| Uyarı → Normal | nem % 40 ve üstüne çıkar | LED söner, buzzer susar, bir satır yazılır |\n\nProjedeki `uyari` değişkeni bu durumu tutar. Geçişler yalnız eşik aşılınca olur.\n\n### Neden iki eşik?\nTek eşik (örneğin % 30) kullansaydın, nem 29 ile 31 arasında dalgalandığında uyarı sürekli açılıp kapanırdı. İki eşik (alt: 30, üst: 40) arasında durum korunur. Buna **histerezis** denir. Bir termostat da aynı şekilde çalışır.\n\n### Dört iş, hiç delay yok\n`loop()` içinde dört iş kendi saatiyle çalışır: buton (hemen), ölçüm (2 saniye), sayfa (3 saniye) ve buzzer (uyarı sırasında 2 saniyede bir kısa bip). Buzzer için `tone(pin, frekans, süre)` kullanılır; bu komut beklemez, ses arka planda çalar. Bir `delay` bütün diğer işleri durdururdu.\n\n### Mesajı yalnız durum değişince yaz\nSeri porta uyarı mesajı **her turda değil, yalnız durum değişince** bir kez yazılır; böylece Serial Monitor aynı satırla dolmaz. Uyarı açılırken `sonBip = simdi - BIP_ARALIGI` yazmak ilk bipin hemen çalmasını sağlar.\n\n### Sensör bozulursa\nBozulan DHT `NaN`, bulunamayan BMP280 `bmpHazir = false` üretir; ekran `--` ve \"BMP280 yok\" yazar, program devam eder. Peki toprak sensörü hep \"kuru\" ya da hep \"ıslak\" okursa? Sonsuz uyarı ya da hiç uyarı olmaz. Güvenilir sistemlerde sensörün sağlıklı olduğu ayrıca kontrol edilir.\n\n### Özet\nProje, önceki derslerin parçalarını birleştirir: DHT, BMP280, toprak nemi, LCD sayfaları, LED ve buzzer. Önce durumları ve geçişleri tabloya dökersin. İki eşik uyarının titremesini önler. Her iş kendi zamanlayıcısıyla `delay` olmadan çalışır ve sensör arızası programı çökertmez.",
          "concepts": [
            {
              "term": "Durum (state)",
              "definition": "Sistemin o anda hangi modda olduğunu tutan değişken; bu projede uyari (doğru/yanlış).",
              "example": "uyari doğruyken LED yanar, buzzer ötmeye devam eder ve ekranda SULAMA GEREKLI yazar.",
              "pitfall": "Durumu saklamamak ve her turda yeniden karar vermek; geçişler ve mesajlar karışır."
            },
            {
              "term": "Histerezis (iki eşik)",
              "definition": "Aç ve kapat için farklı eşik kullanmak; iki eşik arasında mevcut durum korunur.",
              "example": "Nem % 30'un altına inince uyarı açılır, % 40'a çıkana kadar kapanmaz.",
              "pitfall": "Tek eşik kullanmak; okuma eşik civarında dalgalanınca LED ve buzzer hızla açılıp kapanır."
            },
            {
              "term": "Durum değişiminde mesaj",
              "definition": "Seri porta uyarı satırını her turda değil, yalnız durum değiştiği anda bir kez yazmak.",
              "example": "uyari yanlıştan doğruya geçerken \"UYARI: toprak nemi %29\" bir kez yazılır.",
              "pitfall": "Aynı mesajı her turda basmak; Serial Monitor dolar ve önemli satır kaybolur."
            },
            {
              "term": "Bloklamayan buzzer (tone ile)",
              "definition": "tone(pin, frekans, süre) sesi başlatıp beklemeden döner; tekrar aralığı millis() ile sayılır.",
              "example": "tone(8, 1000, 200) 200 ms'lik bip çalar, 2 saniyede bir tekrarlanır.",
              "pitfall": "Bip için delay(200) kullanmak; sayfa değişimi, buton ve ölçüm o sırada donar."
            },
            {
              "term": "Arızaya dayanıklı tasarım",
              "definition": "Bir sensör yokken ya da bozukken de programın çökmeden çalışmaya devam etmesi.",
              "example": "DHT NaN verince ekranda -- görünür, toprak uyarısı yine çalışır.",
              "pitfall": "NaN ya da eksik sensör için hazırlık yapmamak; ekranda nan görünür ve eşik karşılaştırmaları şaşar."
            }
          ],
          "quiz": [
            {
              "id": "m4h3d50-q1",
              "kind": "mcq",
              "prompt": "Sulama uyarısı için neden tek bir eşik (% 30) yerine iki eşik (açmak için % 30, kapatmak için % 40) kullanıyoruz?",
              "options": [
                "Kod daha kısa olsun diye",
                "LCD ekranın iki satırı olduğu için",
                "Nem % 30 civarında dalgalanırken uyarının hızla açılıp kapanmasını önlemek için",
                "Buzzer iki frekansta öttüğü için"
              ],
              "answer": 2,
              "explanation": "İki eşik arasındaki bölgede durum korunur: uyarı açıksa % 40'a çıkana kadar kapanmaz. Böylece nem % 30 etrafında oynarken LED ve buzzer titremez. Kodu uzatır, kısaltmaz; ekran ve buzzer ile ilgisi yoktur.",
              "skills": [
                "sens-threshold-hyst",
                "proj-integration"
              ]
            },
            {
              "id": "m4h3d50-q2",
              "kind": "numeric",
              "prompt": "Uyarı kuralı: normalken nem % 30'un altına inerse uyarı açılır (ve seri porta 1 satır yazılır); açıkken nem % 40 ya da üstüne çıkarsa kapanır (ve 1 satır yazılır). Başlangıçta uyarı kapalı. Ölçümler sırayla şöyle geliyor: 45, 32, 29, 33, 38, 41, 36, 28. Seri porta toplam kaç uyarı/normale dönüş satırı yazılır?",
              "answer": 3,
              "tolerance": 0,
              "unit": "satır",
              "explanation": "45 ve 32'de uyarı kapalı kalır (30'un altına inilmedi). 29'da uyarı açılır: 1. satır. 33 ve 38'de uyarı sürer. 41'de kapanır: 2. satır. 36'da kapalı kalır. 28'de yeniden açılır: 3. satır. Toplam 3.",
              "skills": [
                "sens-threshold-hyst",
                "proj-integration"
              ]
            },
            {
              "id": "m4h3d50-q3",
              "kind": "find-bug",
              "prompt": "Bu uyarı kontrolü histerezis olmalıydı, ama nem % 30 civarında oynayınca uyarı hızla açılıp kapanıyor. ESIK_ALT = 30, ESIK_UST = 40 sabitleridir. Hangi satırda hata vardır?\n\n```\n1 if (!uyari && toprakYuzde < ESIK_ALT) {\n2   uyari = true;\n3 }\n4 else if (uyari && toprakYuzde >= ESIK_ALT) {\n5   uyari = false;\n6 }\n```",
              "options": [
                "Satır 1: ESIK_UST yazılmalı",
                "Satır 2: uyari = false olmalı",
                "Satır 4: kapatma koşulu ESIK_UST ile karşılaştırmalı",
                "Satır 6: kapanış parantezi eksik"
              ],
              "answer": 2,
              "explanation": "Kapatma eşiği olarak ESIK_ALT (30) kullanılınca açma ve kapama aynı değerde olur ve histerezis ortadan kalkar. Kapatma koşulu toprakYuzde >= ESIK_UST (40) olmalıdır. Açma koşulu (satır 1) doğrudur.",
              "skills": [
                "sens-threshold-hyst",
                "prog-debug"
              ]
            },
            {
              "id": "m4h3d50-q4",
              "kind": "numeric",
              "prompt": "Uyarı açıldığı anda ilk bip hemen çalar, sonra her 2 saniyede bir yeni bip çalar (tone ile, program beklemeden). Uyarı açıldıktan 9 saniye sonra kapanıyor. Bu sürede kaç bip çalmıştır?",
              "answer": 5,
              "tolerance": 0,
              "unit": "bip",
              "explanation": "Bipler uyarının 0., 2., 4., 6. ve 8. saniyesinde çalar; bir sonraki 10. saniyede olacaktı ama uyarı 9. saniyede kapandı. Toplam 5 bip. Laboratuvarda gerçek programda da bu zamanlar ölçüldü.",
              "skills": [
                "proj-integration",
                "prog-timing"
              ]
            },
            {
              "id": "m4h3d50-q5",
              "kind": "mcq",
              "prompt": "Bir arkadaşın buzzer'ı çaldırmak için tone(8, 1000); delay(200); noTone(8); yazmayı öneriyor. Bu projede en büyük sorun ne olur?",
              "options": [
                "Buzzer hiç ses çıkarmaz",
                "Seri port kapanır",
                "LED söner",
                "Her bip sırasında 200 ms boyunca buton, ölçüm ve sayfa değişimi durur"
              ],
              "answer": 3,
              "explanation": "delay programı bekletir; bu sırada buton okunmaz ve zamanlayıcılar kontrol edilmez. tone(pin, frekans, 200) ise beklemeden döner ve ses arka planda biter. Buzzer ses çıkarır; sorun diğer işlerin durmasıdır.",
              "skills": [
                "proj-integration",
                "prog-timing"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Işık, ses, gaz",
      "project": "Yangın ve gaz alarmı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Bir LDR bölücüsünde ışığın okuma yönünü söyleyebilir; iki eşikli histerezisle titremeyi önleyebilir.\n2. Ses sensöründe baz seviyeyi ölçüp sapmayı hesaplayabilir; sesi yüksekliğine ve süresine göre sınıflandırabilir.\n3. MQ-2 için ısınma ve temiz havada baz değer fikrini açıklayabilir; eşiği bazın katı olarak yazabilir ve neden ppm yazılmadığını söyleyebilir.\n4. Alev sensörünün yönünü tek yerde çözebilir; `enum` ve parametreli `seviyeBul` ile üç seviyeli karar mekanizması kurabilir.\n5. Gaz, alev ve ısı sensörlerinden bir yangın ve gaz alarm paneli kurup test edebilir; panelin eğitim amaçlı olduğunu ve sınırlarını açıklayabilir.\n\n### Haftanın planı\nHafta beş derstir. Aşağıdaki plan günde bir ders içindir; proje günü daha uzundur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Işık sensörü hassasiyeti ve histerezis | ~25 dk | Anlatımı oku, tek eşikle titremeyi gör, iki eşikle gider, mini testi çöz. |\n| 2 | Ses sensörü: alkış anahtarı | ~30 dk | Baz seviyeyi ölç, tepeyi yazdır, alkışı süre ve yükseklikle tanıt, iki alkışla LED aç/kapat. |\n| 3 | MQ-2 gaz sensörü: ısınma ve kalibrasyon | ~25 dk | Isınmayı bekle, baz ölç, bazın katıyla alarm kur. Gazı Gaz düzeyi ile taklit et. |\n| 4 | Alev sensörü ve çoklu eşik yönetimi | ~30 dk | Yönü `siddet()` ile çöz, üç seviyeyi dene, iki sensörde aynı fonksiyonu kullan. |\n| 5 | Proje: Yangın ve gaz alarm paneli | ~35 dk | Devreyi kur, test tablosunu uygula, çıkışları ve ekranı kontrol et, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Modül 3'ün bazı konuları gerekir. Başlamadan önce kontrol et:\n- `analogRead` ile 0-1023 arası okuma yapıp Serial Monitor'a yazdırabiliyor musun? (11. ve 9. dersler)\n- LDR ile gerilim bölücü kurmayı ve ışığa göre değerin yönünü söyleyebiliyor musun? (12. ders)\n- Yumuşatmanın ne işe yaradığını biliyor musun? (14. ders)\n- Parametre alan ve değer döndüren bir fonksiyon yazabiliyor musun? (19. ders)\n- `millis()` ile `delay` kullanmadan zaman ölçebiliyor musun? (27. ders)\n- `enum` ile durum tutmayı biliyor musun? (28. ders)\n- Projede ayrıca röle (24. ders), buzzer (18. ders), NTC (13. ders) ve I2C LCD (32-33. dersler) kullanılır.\n\n### Kavram haritası\n- **Okuma:** sensör → ham sayı → yön → gürültü → baz değer\n- **Karar:** eşik → histerezis (iki eşik) → göreli eşik (bazın katı) → yumuşatma → çoklu seviye (NORMAL, UYARI, TEHLIKE)\n- **Olay:** baz seviye → sapma (`abs`) → tepe → süre → sessizlik payı → sınıflandırma\n- **Yapı:** parametreli fonksiyon → `enum` → `enKotu` → çıkışları seviyeden türetmek\n- **Proje:** üç sensör → genel durum → LED, buzzer, röle, ekran → güvenlik ve sınırlar\n\n### Sık yapılan hatalar\n- **Açma ve kapama eşiğini aynı yapmak.** Bu tek eşiktir; titreme geri gelir. Eşikleri ters yazmak da (açma > kapama) ölü bölgede her turda değişim üretir.\n- **Eşiğin yönünü devreye bakmadan yazmak.** LDR 5V tarafındaysa karanlıkta değer küçüktür.\n- **Baz seviyeyi varsaymak ya da yanlış ortamda ölçmek.** Ses modülünde baz 512 değildir (sanal modülde yaklaşık 256); MQ-2 bazı gazlı ortamda ölçülürse eşikler yukarı kayar.\n- **Isınmayı atlamak.** Gerçek MQ-2'de baz yanlış çıkar.\n- **Sadece yüksekliğe bakmak.** Kapı çarpması da alkışa benzer; süre de kontrol edilmelidir.\n- **Tamsayı bölmesi.** `int` / `int` küsuratı atar: 160 / 100 sonucu 1 olur.\n- **Kapama eşiğini açma eşiğinden büyük yazmak.** Seviye titrer ya da hiç düşmez.\n- **Bir sensörü genel duruma katmamak.** `enKotu` her sensörü kapsamalıdır.\n- **Çıkışları farklı yerlerden sürmek.** LED, buzzer ve ekran birbirinden kopar.\n- **Röleyi şebeke gerilimiyle kullanmak.** Bu projede kesinlikle yapılmaz.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. `seviyeBul` fonksiyonunu bakmadan, kâğıda yaz. Sonra 300 / 250 / 600 / 500 eşikleriyle 320, 280, 240, 650, 520, 480 dizisini elle izle.\n4. Isı için üçüncü bir sensör eklemeyi dene: eşikleri değiştir, fonksiyona dokunma.\n5. Kendi cümlelerinle şu soruları cevapla: \"Histerezis neden gerekir?\" ve \"MQ-2 için neden ppm yazmıyoruz?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Yangın ve gaz alarm paneli)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Sensörlerden biri ya da çıkışlardan biri bağlı değil | Gaz, alev, LED'ler, buzzer, röle ve ekran doğru bağlı | Bağlantılar düzenli; NTC de bağlı ve çalışıyor |\n| Isınma ve baz | Isınma yok ya da baz gazlı ortamda ölçülüyor | Isınma bekleniyor, baz temiz havada ölçülüyor | Baz çok küçükse koruma var ve süre gerçek donanım için tartışılmış |\n| Seviyeler | Seviyeler titriyor ya da yanlış sensörden çıkıyor | Üç sensör için histerezisli NORMAL, UYARI, TEHLIKE çalışıyor | Yeni bir sensör tek satırla ekleniyor, `seviyeBul` değişmiyor |\n| Çıkışlar | Çıkışlar seviyeyle uyuşmuyor | LED, buzzer, röle ve ekran tabloya göre davranıyor | Buzzer deseni değiştirilmiş (örneğin iki kısa bip) ve nedeni açıklanmış |\n| Test | Test yapılmamış | Test tablosundaki değerler denenmiş ve sonuçlar yazılmış | Kenar durumlar (histerezis bandı, sensör kopması) denenmiş |\n| Güvenlik ve anlatım | Sınırlar söylenmiyor | Eğitim amaçlı olduğunu ve röle sınırını söylüyor | Panelin gerçek hayatta neden yetmeyeceğini örneklerle anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta öğrencinin \"sensör bir sayı verir, karar bizim\" fikrini kavraması hedeflenir. Titremeyi görüp çözmesi, ezberlemekten daha değerlidir.\n- **Güvenlik.** Bu platformdaki gaz, alev ve ısı sanaldır. Gerçek gaz, alev ya da ısıtıcıyla deney yapılmaz. Röle yalnızca 5 V'luk bir LED sürer; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Bu panel sertifikalı bir gaz ya da yangın dedektörünün yerini tutmaz; evdeki gerçek koruma için uygun cihazlar kullanılmalıdır.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şunları sor: \"Sensör ışıkla artıyor mu azalıyor mu?\", \"Temiz havada kaç okuyor?\", \"Seri monitör ne yazıyor?\", \"Hangi çıkış hangi seviyeden geliyor?\"\n- **Tartışma sorusu.** Konuşalım bölümündeki soruları sohbetle işleyin: Gaz varken fan çalışsın mı, alev varken de çalışsın mı? Gerçek panolarda bu kuralları kim belirler?\n- **Süre.** Proje dersi uzundur; gerekirse iki oturuma bölünebilir. Isınma süresini beklemek sabır ister, gerçek donanımda çok daha uzundur.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Işık sensörü hassasiyeti ve histerezis",
          "durationMin": 25,
          "problem": "Sokak lambaları akşam alacakaranlıkta bazen yanıp sönüp tekrar yanar, sonra kalıcı olarak yanar. Işık yavaş yavaş azalırken sensör eşiğin tam üstünde bir an \"karanlık\", bir an \"aydınlık\" der. Aynı şey senin gece lambanda da olur: değer eşiğin yanında oynayınca LED titrer. Bu derste titremeyi önce görecek, sonra iki eşikle (histerezis) yok edeceksin.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| LDR (foto direnç) | Uç **1** → Uno **5V**, uç **2** → Uno **A1** |\n| Direnç (özellik panelinden **10000 Ω** yap) | Uç **1** → **A1**, uç **2** → **GND** |\n| Direnç (330 Ω) + LED | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n\nBu, 12. dersteki LDR bölücüsünün aynısıdır: LDR aydınlıkta küçük direnç gösterir, bu yüzden A1'deki gerilim aydınlıkta yükselir. Yani `analogRead` değeri **aydınlıkta büyür, karanlıkta küçülür**. LDR'yi GND tarafına bağlarsan yön tersine döner; o zaman karşılaştırmaların yönünü değiştirmen gerekir.\n\nLDR'nin ışığını laboratuvarda LDR'yi seçip sağ paneldeki **Işık** değeriyle verirsin (0 = karanlık, 1 = çok aydınlık). Çalışırken de değiştirebilirsin. Bu devrede yaklaşık değerler şöyledir:\n\n| Işık | 0,1 | 0,2 | 0,5 | 0,9 |\n|---|---|---|---|---|\n| `analogRead(A1)` | 23 | 53 | 424 | 977 |\n\nBu derste kullanacağımız eşikler Işık değerinde şuna denk gelir: 423 yaklaşık 0,50; 473 yaklaşık 0,52; 523 yaklaşık 0,55. Yani eşik, kaydırıcının çok dar bir bölgesindedir.\n\n### Program 1: tek eşik\nBu derste LED, karanlıkta yanacak. En basit hali tek bir eşikle karşılaştırmaktır. Sketch her saniye eşiği kaç kez geçtiğini de sayıp yazar.\n\n```cpp\n// sketch: ldr_tek_esik\nconst int LDR = A1;\nconst int LED = 13;\nconst int ESIK = 473;\n\nbool onceki = false;\nint gecis = 0;\nunsigned long sonYazma = 0;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int deger = analogRead(LDR);\n  bool karanlik = (deger < ESIK);   // karanlıkta değer küçüktür\n  digitalWrite(LED, karanlik);\n\n  if (karanlik != onceki) {\n    gecis++;\n    onceki = karanlik;\n  }\n\n  if (millis() - sonYazma >= 1000) {\n    sonYazma = millis();\n    Serial.print(\"gecis=\");\n    Serial.println(gecis);\n  }\n}\n```\n\nOrtam ışığı eşiğin hemen yanındaysa (değer yaklaşık 473) ve okuma küçük dalgalanıyorsa, LED saniyede onlarca kez açılıp kapanır. Dalgalanmanın kaynağı ışığın kendisi, bir gölge, kablo ya da ADC'nin küçük sapmalarıdır. Gerçek bir devrede bu dalgalanma kendiliğinden olur.\n\nLaboratuvardaki LDR kendiliğinden dalgalanmaz; titremeyi sen üretirsin. Program çalışırken **Işık** değerini 0,51 ile 0,53 arasında birkaç kez gidip getir: 445 ile 488 arasında gidip gelen değer eşiği (473) her geçişte aşar, LED her seferinde değişir ve `gecis` sayısı hızla artar.\n\n### Program 2: iki eşik (histerezis)\nÇözüm, açma ve kapama için **iki ayrı eşik** kullanmaktır. LED karanlıkta yanar ve ancak ortam **belirgin biçimde** aydınlanınca söner. İki eşik arasındaki bölgeye **ölü bölge** ya da **histerezis bandı** denir. Termostatta (35. ders) hedefin 0,5 derece altı ve üstü ile aynı fikirdir.\n\n```cpp\n// sketch: ldr_histerezis\nconst int LDR = A1;\nconst int LED = 13;\nconst int ACMA = 423;     // bunun altında: karanlık, LED yansın\nconst int KAPAMA = 523;   // bunun üstünde: aydınlık, LED sönsün\n\nbool yanik = false;\nbool onceki = false;\nint gecis = 0;\nunsigned long sonYazma = 0;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int deger = analogRead(LDR);\n\n  if (!yanik && deger < ACMA) {\n    yanik = true;\n  } else if (yanik && deger > KAPAMA) {\n    yanik = false;\n  }\n  digitalWrite(LED, yanik);\n\n  if (yanik != onceki) {\n    gecis++;\n    onceki = yanik;\n  }\n\n  if (millis() - sonYazma >= 1000) {\n    sonYazma = millis();\n    Serial.print(\"gecis=\");\n    Serial.println(gecis);\n  }\n}\n```\n\n423 ile 523 arasındaki değerlerde program hiçbir şey yapmaz: LED ne durumdaysa öyle kalır. Karar, sensörün şimdiki değerine **ve** LED'in şimdiki durumuna bağlıdır.\n\nBandı ne kadar geniş seçeceksin? Gürültünün tepeden tepeye genişliğinden büyük olmalı. Gürültü 80 birim oynuyorsa bant 100 birim olabilir. Fazla geniş bantta ise lamba geç yanar ve geç söner; yani sistem **daha az hassas** olur. Hassasiyet ile kararlılık arasında bir denge kurarsın.\n\n### Program 3: eşiği kendin bul\nEşikleri elle sayıya dökmek yerine ortamdan öğrenebilirsin. Program ilk 3 saniyede (▶'e bastıktan hemen sonra **Işık** değerini bir kez 0,1'e, bir kez 0,9'a getir) en küçük ve en büyük değeri ölçer. Sonra eşikleri bu aralığın %40'ına (yanma) ve %60'ına (sönme) koyar.\n\n```cpp\n// sketch: ldr_otomatik_esik\nconst int LDR = A1;\nconst int LED = 13;\nconst unsigned long OGRENME_MS = 3000;\n\nint enAz = 1023;\nint enCok = 0;\nint acma;\nint kapama;\nbool yanik = false;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n\n  unsigned long bas = millis();\n  while (millis() - bas < OGRENME_MS) {\n    int d = analogRead(LDR);\n    if (d < enAz) enAz = d;\n    if (d > enCok) enCok = d;\n  }\n\n  int aralik = enCok - enAz;\n  acma = enAz + aralik * 4 / 10;     // bunun altı: karanlık\n  kapama = enAz + aralik * 6 / 10;   // bunun üstü: aydınlık\n\n  Serial.print(\"enAz=\");\n  Serial.print(enAz);\n  Serial.print(\" enCok=\");\n  Serial.print(enCok);\n  Serial.print(\" acma=\");\n  Serial.print(acma);\n  Serial.print(\" kapama=\");\n  Serial.println(kapama);\n  if (aralik < 100) {\n    Serial.println(\"UYARI: isik degisimi cok az, sensoru kontrol et\");\n  }\n}\n\nvoid loop() {\n  int deger = analogRead(LDR);\n  if (!yanik && deger < acma) {\n    yanik = true;\n  } else if (yanik && deger > kapama) {\n    yanik = false;\n  }\n  digitalWrite(LED, yanik);\n}\n```\n\n### Nasıl çalışıyor?\n1. Tek eşikte LED'in durumu yalnızca `deger > ESIK` sonucudur. Değer eşiğin iki yanında gidip gelirse LED de gidip gelir.\n2. Histerezisli sürümde `yanik` değişkeni sistemin \"hafızasıdır\". Eşiği geçmek yetmez; **karşı** eşiği geçmek gerekir.\n3. `gecis` sayacı titremeyi sayıya döker. İyi bir çözümün göstergesi, gürültülü ortamda bile bu sayının artmamasıdır.\n4. Üçüncü sürüm bandı ortamın aralığına göre ayarlar. Böylece aynı kod farklı LDR'lerde ve farklı odalarda çalışır.\n\n### Dene\n- `ldr_histerezis` programında `ACMA = 453`, `KAPAMA = 493` yap (dar bant). Işığı önce 0,9'a getir, sonra 0,50 ile 0,55 arasında birkaç kez oynat (yaklaşık 424 ile 532). Titreme geri geliyor mu? Bant 423-523 iken aynı hareket LED'i değiştiriyor mu?\n- Bandı çok genişlet (`ACMA = 200`, `KAPAMA = 800`). Gece lambası ne zaman yanıyor ve ne zaman sönüyor?\n- `ldr_otomatik_esik` programında yüzde 40/60 yerine 30/70 dene. Lamba daha geç mi yanıyor?\n\n### Sık yapılan hatalar\n- Açma ve kapama eşiğini aynı yapmak: bu, tek eşiktir.\n- Eşikleri ters yazmak (`ACMA > KAPAMA`): LED hiç yanmaz ya da hiç sönmez.\n- Bandı gürültüden dar seçmek: titreme tamamen gitmez.\n- LDR'yi GND tarafına bağlayıp yönü değiştirmemek: lamba gündüz yanar.\n- Öğrenme süresinde ışığı hiç değiştirmemek (Işık değerine dokunmamak): aralık çok küçük kalır, eşikler anlamsızlaşır ve program uyarı yazar.",
          "question": "Bir ışık sensörüne hem hızlı tepki vermek hem de titrememek ister misin? Bu iki isteğin neden birbiriyle çeliştiğini, histerezis bandının genişliği üzerinden anlat.",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir LDR bölücüsünde ışığın `analogRead` değerini hangi yönde değiştirdiğini\n- Tek eşikli karşılaştırmanın neden titreme (yanıp sönme) yaptığını\n- **Histerezis** için iki ayrı eşiğin (açma ve kapama) nasıl seçildiğini\n- Bant genişliğinin gürültüye ve hassasiyete etkisini\n\n### Önceden bilmen gerekenler\n- 11. ders: `analogRead` 0-1023 arası bir sayı verir (0 V = 0, 5 V = 1023).\n- 12. ders: LDR ile bir direnç **gerilim bölücü** kurar; A1 pinindeki gerilim ışığa göre değişir.\n- 7. ders: `if` / `else if` ve mantık işleçleri (`&&`, `!`).\n\n### Sensör bir sayı verir, karar sana aittir\nBir ışık sensörü \"karanlık\" demez; yalnızca bir sayı verir. \"Bu sayı karanlık mı?\" sorusunu programın cevaplar. Bunun için bir **eşik** seçer ve okumayı eşikle karşılaştırırsın.\n\n### Yönü bil\nDerste LDR, 5V ile A1 arasına, 10 kΩ direnç ise A1 ile GND arasına bağlı. Işık artınca LDR'nin direnci düşer, A1'e giden gerilim yükselir. Yani bu devrede:\n\n```\nIşık:          0,1   0,2   0,5   0,9\nanalogRead:     23    53   424   977\n```\n\nIşık arttıkça değer **büyür**. İki parçanın yerini değiştirirsen yön tersine döner. Karşılaştırmanın yönünü hep devreye bakarak yaz.\n\n### Tek eşiğin sorunu\nEn kısa karar şudur: `karanlik = (deger < 473)`. Okuma 473'ün çok uzağındaysa sorun yoktur. Okuma 473 civarında dalgalanıyorsa (ışık, gölge, ADC sapması) sonuç her turda değişir ve LED saniyede onlarca kez açılıp kapanır. Dalgalanma 445 ile 488 arasında olsa bile eşiği her geçişte aşar.\n\n### Histerezis: iki eşik, bir hafıza\nÇözüm, açma ve kapama için **farklı** eşik kullanmaktır:\n\n```\nif (!yanik && deger < ACMA) yanik = true;\nelse if (yanik && deger > KAPAMA) yanik = false;\n```\n\nBurada `ACMA = 423`, `KAPAMA = 523`. İkisinin arası (423-523) **ölü bölgedir**: LED ne durumdaysa öyle kalır. `yanik` değişkeni sistemin hafızasıdır; karar hem okumaya hem de şimdiki duruma bağlıdır. Termostat da aynı fikirdir (35. ders).\n\n### Bant ne kadar geniş olmalı?\n- Gürültünün tepeden tepeye genişliğinden **büyük** olmalı. Gürültü 80 birim oynuyorsa 100 birimlik bant yeter.\n- Çok geniş olmamalı. Bant 200-800 olursa lamba çok karanlık olunca yanar, çok aydınlık olunca söner: sistem **daha az hassas** olur.\n\nHassasiyet ile kararlılık arasında bir denge kurarsın. Eşikleri elle sayıya dökmek yerine ortamdan da öğrenebilirsin: en küçük ve en büyük değeri ölç, açma eşiğini aralığın %40'ına, kapama eşiğini %60'ına koy.\n\n### Özet\nIşık sensörü bir sayı üretir; yönü devre belirler. Tek eşik, eşiğin yanındaki gürültüde titreme yapar. İki eşikli histerezis, ölü bölge sayesinde bu titremeyi bitirir. Bant gürültüden geniş, ama hassasiyeti bozmayacak kadar dar olmalıdır.",
          "concepts": [
            {
              "term": "Eşik",
              "definition": "Bir sensör okumasının \"evet\" ile \"hayır\" arasında ayrıldığı sayı.",
              "example": "Karanlık için analogRead(A1) < 473 yazarsan eşik 473'tür.",
              "pitfall": "Eşiğin yönünü devreye bakmadan yazmak: LDR 5V tarafındaysa karanlıkta değer küçüktür, GND tarafındaysa büyüktür."
            },
            {
              "term": "Titreme (eşik gürültüsü)",
              "definition": "Okuma eşiğin yanında dalgalanınca çıkışın hızla açılıp kapanması.",
              "example": "Değer 445 ile 488 arasında oynarsa 473 eşiğini her geçişte aşar ve LED yanıp söner.",
              "pitfall": "Titremeyi sensörün bozuk olduğuna yormak; sorun tek eşikte, kodda."
            },
            {
              "term": "Histerezis",
              "definition": "Açma ve kapama için iki ayrı eşik kullanıp kararı şimdiki duruma da bağlamak.",
              "example": "423'ün altında yan, 523'ün üstünde sön; arası değişmez.",
              "pitfall": "Açma ve kapama eşiğini aynı yazmak: bu yine tek eşiktir ve titreme geri gelir."
            },
            {
              "term": "Ölü bölge (bant)",
              "definition": "İki eşik arasındaki aralık; çıkış bu aralıkta değişmez.",
              "example": "Gürültü 80 birimse 100 birimlik bant titremeyi bitirir.",
              "pitfall": "Bandı gereğinden geniş seçmek: lamba geç yanar, geç söner ve sistem az hassas olur."
            },
            {
              "term": "Hassasiyet ve kararlılık dengesi",
              "definition": "Dar bant hızlı tepki verir ama titreyebilir; geniş bant kararlıdır ama geç tepki verir.",
              "example": "Gece lambası için 423-523 bandı, 200-800 bandından daha hassastır.",
              "pitfall": "Hem çok hızlı hem hiç titremeyen bir sistem istemek; ikisi aynı anda mümkün değildir."
            }
          ],
          "quiz": [
            {
              "id": "m4h4d1-q1",
              "kind": "mcq",
              "prompt": "LDR 5V ile A1 arasında, 10 kΩ direnç A1 ile GND arasında bağlı. Oda aydınlandıkça analogRead(A1) değeri ne yapar?",
              "options": [
                "Büyür",
                "Küçülür",
                "Değişmez",
                "Önce büyür, sonra küçülür"
              ],
              "answer": 0,
              "explanation": "Işık artınca LDR'nin direnci düşer, bölücüden A1'e giden gerilim yükselir ve analogRead büyür (ışık 0,1 iken 23, 0,9 iken 977). LDR'yi GND tarafına alırsan yön tersine döner; bu yüzden karşılaştırmayı devreye göre yazarsın.",
              "skills": [
                "sens-ldr-divider"
              ]
            },
            {
              "id": "m4h4d1-q2",
              "kind": "numeric",
              "prompt": "LED başta sönük. Program iki eşik kullanıyor: değer 423'ün altına inince yanar, 523'ün üstüne çıkınca söner. Okumalar sırayla şöyle geliyor: 500, 460, 480, 450, 490, 440, 400, 510, 540. LED toplam kaç kez durum değiştirir?",
              "answer": 2,
              "tolerance": 0,
              "unit": "kez",
              "explanation": "400 değeri 423'ün altında olduğu için LED yanar (1). Sonra 510 ölü bölgede kalır, LED yanık kalır. 540 değeri 523'ün üstündedir, LED söner (2). Aynı dizi tek eşikle (473) denenseydi LED 6 kez durum değiştirirdi: histerezis titremeyi yok eder.",
              "skills": [
                "sens-hysteresis",
                "sens-noise"
              ]
            },
            {
              "id": "m4h4d1-q3",
              "kind": "predict-output",
              "prompt": "Biri açma ve kapama eşiklerini yanlışlıkla ters yazdı. Işık sabit, analogRead(A1) hep 480 okuyor. Bu kod çalışınca D13'teki LED ne yapar?\n\n```\nconst int ACMA = 523;\nconst int KAPAMA = 423;\nbool yanik = false;\n\nvoid loop() {\n  int d = analogRead(A1);\n  if (!yanik && d < ACMA) yanik = true;\n  else if (yanik && d > KAPAMA) yanik = false;\n  digitalWrite(13, yanik);\n}\n```",
              "options": [
                "Sürekli yanık kalır",
                "Sürekli sönük kalır",
                "Her turda açılıp kapanır (çok hızlı titrer)",
                "Derleme hatası olur"
              ],
              "answer": 2,
              "explanation": "480 değeri 523'ten küçük olduğu için sönükken yanar; yanıkken de 423'ten büyük olduğu için söner. Böylece ölü bölge ters çalışır ve LED her turda değişir. Sürekli yanık ya da sönük kalma yalnızca 423'ün altında ya da 523'ün üstünde olur. Kod derlenir; hata yalnız davranıştadır.",
              "skills": [
                "sens-hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m4h4d1-q4",
              "kind": "find-bug",
              "prompt": "Devre derstekiyle aynı (LDR 5V tarafında). Gece lambası gündüz yanıyor, gece sönüyor. Hata nerede?\n\n```\nconst int ESIK = 473;\n\nvoid loop() {\n  int deger = analogRead(A1);\n  bool karanlik = (deger > ESIK);\n  digitalWrite(13, karanlik);\n}\n```",
              "options": [
                "ESIK sabiti int yerine float olmalı",
                "digitalWrite yerine analogWrite kullanılmalı",
                "analogRead(A1) yerine digitalRead(A1) kullanılmalı",
                "Karşılaştırma yönü ters: bu devrede karanlıkta değer küçüktür"
              ],
              "answer": 3,
              "explanation": "Bu devrede ışık artınca değer büyür, karanlıkta küçülür. Karanlık için deger < ESIK yazılmalıdır; deger > ESIK aydınlığı yakalar. Diğer seçenekler hatayı çözmez: sayı tipi doğru, LED dijital çıkıştır ve sensör analog okunur.",
              "skills": [
                "sens-ldr-divider",
                "prog-debug"
              ]
            },
            {
              "id": "m4h4d1-q5",
              "kind": "mcq",
              "prompt": "Ortamdaki ışık gürültüsü tepeden tepeye yaklaşık 80 birim oynatıyor. Histerezis bandı için hangi seçim en uygundur?",
              "options": [
                "0 birim (tek eşik)",
                "30 birim",
                "100 birim",
                "900 birim"
              ],
              "answer": 2,
              "explanation": "Bant gürültünün tepeden tepeye genişliğinden büyük olmalı: 100 > 80 titremeyi bitirir. 0 ve 30 birim gürültüden dardır, titreme sürer. 900 birim her şeyi kaplar; lamba neredeyse hiç tepki vermez, yani sistem aşırı az hassas olur.",
              "skills": [
                "sens-hysteresis",
                "sens-noise"
              ]
            }
          ]
        },
        {
          "title": "Ses sensörü: alkış anahtarı",
          "durationMin": 30,
          "problem": "\"Alkışla yanan lamba\" bir klasiktir: iki kez alkışla, yansın; iki kez daha alkışla, sönsün. Peki lamba kapı çarpınca, birinin yüksek sesle gülmesiyle ya da uzun süren bir müzikle de yanarsa? Güvenilir bir alkış anahtarı sesin sadece \"var\" ya da \"yok\" olduğuna bakmaz; ne kadar **yüksek** ve ne kadar **uzun** olduğuna da bakar.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Ses sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A0** (**DO** boş kalır) |\n| Direnç (330 Ω) + LED | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n\nGerçek modülde bir mikrofon ve bir yükselteç vardır. Analog çıkış ortam sessizken belli bir **baz seviyede** durur, ses gelince bu seviyenin üstünde ve altında salınır. Baz seviye ve ses hassasiyeti modülden modüle farklıdır (çoğunda bir ayar vidası bulunur). Biz bu yüzden baz seviyeyi sabit bir sayı olarak yazmayız, **ölçeriz**.\n\nLaboratuvardaki modülde mikrofon yoktur; sesi sağ paneldeki **Ses şiddeti** özelliğiyle (0-1) sen verirsin. Bu modülde sessizken (şiddet 0) AO yaklaşık 1,25 V verir, yani `analogRead` yaklaşık **256** okur (512 değil). Şiddet arttıkça AO yükselir: 0,1 için yaklaşık 327, 0,5 için yaklaşık 614, 0,8 için yaklaşık 829. Laboratuvardaki değer yalnızca yukarı çıkar; gerçek mikrofon baz seviyenin hem üstüne hem altına salınır, `abs()` ikisini de karşılar.\n\nAlkış çok kısa bir olaydır: baz seviyeden birdenbire uzaklaşır, bir an kalır ve geri döner. Laboratuvarda bunu şöyle taklit edersin: program çalışırken **Ses şiddeti**ni 0,8 yap, hemen 0'a döndür. Elle yaptığın bu hareket en hızlı halinde bile gerçek bir alkıştan çok daha uzun sürer; bu yüzden aşağıdaki programlarda süre üst sınırını (`SURE_MAX`) 500 ms, iki alkış arası payını (`ARALIK`) 3000 ms seçtik. Gerçek bir devrede bu değerler çok daha küçük olurdu.\n\n### Program 1: baz seviye ve tepe\nÖnce ortamı ölç. Sketch açılışta yaklaşık üçte bir saniye boyunca (64 ölçüm, aralarında 5 ms) ortalama alıp baz seviyeyi bulur. Sonra her yarım saniyede, baz seviyeden **en büyük sapmayı** (tepe) yazar.\n\n```cpp\n// sketch: ses_baz_tepe\nconst int SES = A0;\n\nint baz;\nint tepe = 0;\nunsigned long sonYazma = 0;\n\nint bazOlc() {\n  long toplam = 0;\n  for (int i = 0; i < 64; i++) {\n    toplam += analogRead(SES);\n    delay(5);\n  }\n  return toplam / 64;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  baz = bazOlc();\n  Serial.print(\"baz=\");\n  Serial.println(baz);\n}\n\nvoid loop() {\n  int fark = abs(analogRead(SES) - baz);\n  if (fark > tepe) tepe = fark;\n\n  if (millis() - sonYazma >= 500) {\n    sonYazma = millis();\n    Serial.print(\"tepe=\");\n    Serial.println(tepe);\n    tepe = 0;\n  }\n}\n```\n\nKurulumdaki `delay` kabul edilebilir: ölçüm yalnızca bir kez, program açılırken yapılır. Ölçüm sırasında **Ses şiddeti** 0'da kalsın.\n\n### Program 2: alkış tanıma\nBir ses olayı üç adımda tanınır:\n1. **Tepe yüksekliği:** sapma `TEPE_ESIK` değerini aşarsa bir olay başlar. Daha zayıf sesler (konuşma, fısıltı) sayılmaz.\n2. **Süre:** olay, sapma `SESSIZ_PAY` kadar süre eşiğin altında kalınca biter. Süre, olayın başı ile son yüksek örnek arasındadır. Mikrofon sinyali salındığı için sapma ara sıra sıfıra yakın olur; bu yüzden olayı hemen bitirmeyip kısa bir \"sessizlik payı\" bekleriz.\n3. **Sınıflandırma:** süre çok kısaysa parazit, çok uzunsa (müzik, bağırış, bir motor) alkış değildir. Alkış ikisinin arasındadır.\n\n```cpp\n// sketch: alkis_tani\nconst int SES = A0;\nconst int TEPE_ESIK = 150;          // baz seviyeden en az bu kadar sapma\nconst unsigned long SURE_MIN = 10;  // ms: bundan kısa = parazit\nconst unsigned long SURE_MAX = 500; // ms: bundan uzun = alkış değil\nconst unsigned long SESSIZ_PAY = 20; // ms\n\nint baz;\nbool sesVar = false;\nunsigned long baslangic = 0;\nunsigned long sonYuksek = 0;\nint tepe = 0;\nunsigned long sure = 0;\n\nint bazOlc() {\n  long toplam = 0;\n  for (int i = 0; i < 64; i++) {\n    toplam += analogRead(SES);\n    delay(5);\n  }\n  return toplam / 64;\n}\n\n// Olay bittiğinde türünü döndürür: 'A' alkış, 'U' uzun ses, 'K' kısa parazit.\n// Olay yoksa ya da sürüyorsa 0 döner.\nchar olayOku() {\n  unsigned long simdi = millis();\n  int fark = abs(analogRead(SES) - baz);\n\n  if (fark >= TEPE_ESIK) {\n    if (!sesVar) {\n      sesVar = true;\n      baslangic = simdi;\n      tepe = 0;\n    }\n    sonYuksek = simdi;\n    if (fark > tepe) tepe = fark;\n  } else if (sesVar && simdi - sonYuksek >= SESSIZ_PAY) {\n    sesVar = false;\n    sure = sonYuksek - baslangic;\n    if (sure < SURE_MIN) return 'K';\n    if (sure > SURE_MAX) return 'U';\n    return 'A';\n  }\n  return 0;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  baz = bazOlc();\n  Serial.print(\"baz=\");\n  Serial.println(baz);\n}\n\nvoid loop() {\n  char olay = olayOku();\n  if (olay == 0) return;\n\n  if (olay == 'A') Serial.print(\"ALKIS\");\n  if (olay == 'U') Serial.print(\"UZUN\");\n  if (olay == 'K') Serial.print(\"KISA\");\n  Serial.print(\" sure=\");\n  Serial.print(sure);\n  Serial.print(\" tepe=\");\n  Serial.println(tepe);\n}\n```\n\n`olayOku()` bir **durum** tutar (`sesVar`). Fonksiyon her `loop()` turunda çağrılır, çoğu turda `0` döner ve çok hızlı biter. 27. dersteki bloklamayan kod mantığıdır.\n\n### Program 3: iki alkışta LED aç/kapat\nAlkış anahtarı iki alkışın arasındaki süreye bakar. İki alkışın **başlangıçları** arasında en çok `ARALIK` (burada 3 saniye) varsa LED'in durumu tersine çevrilir. Tek alkış bir şey yapmaz ama \"ilk alkış\" olarak hatırlanır. Uzun bir ses araya girerse hafıza silinir.\n\n```cpp\n// sketch: alkis_anahtar\nconst int SES = A0;\nconst int LED = 13;\nconst int TEPE_ESIK = 150;\nconst unsigned long SURE_MIN = 10;\nconst unsigned long SURE_MAX = 500;\nconst unsigned long SESSIZ_PAY = 20;\nconst unsigned long ARALIK = 3000;   // iki alkış arası en çok\n\nint baz;\nbool sesVar = false;\nunsigned long baslangic = 0;\nunsigned long sonYuksek = 0;\nint tepe = 0;\nunsigned long sure = 0;\n\nbool ledAcik = false;\nint alkisSay = 0;\nunsigned long ilkAlkis = 0;\n\nint bazOlc() {\n  long toplam = 0;\n  for (int i = 0; i < 64; i++) {\n    toplam += analogRead(SES);\n    delay(5);\n  }\n  return toplam / 64;\n}\n\nchar olayOku() {\n  unsigned long simdi = millis();\n  int fark = abs(analogRead(SES) - baz);\n\n  if (fark >= TEPE_ESIK) {\n    if (!sesVar) {\n      sesVar = true;\n      baslangic = simdi;\n      tepe = 0;\n    }\n    sonYuksek = simdi;\n    if (fark > tepe) tepe = fark;\n  } else if (sesVar && simdi - sonYuksek >= SESSIZ_PAY) {\n    sesVar = false;\n    sure = sonYuksek - baslangic;\n    if (sure < SURE_MIN) return 'K';\n    if (sure > SURE_MAX) return 'U';\n    return 'A';\n  }\n  return 0;\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n  baz = bazOlc();\n  Serial.print(\"baz=\");\n  Serial.println(baz);\n}\n\nvoid loop() {\n  char olay = olayOku();\n\n  if (olay == 'A') {\n    if (alkisSay == 1 && baslangic - ilkAlkis <= ARALIK) {\n      ledAcik = !ledAcik;\n      digitalWrite(LED, ledAcik);\n      alkisSay = 0;\n      Serial.println(ledAcik ? \"LED acik\" : \"LED kapali\");\n    } else {\n      alkisSay = 1;\n      ilkAlkis = baslangic;\n    }\n  } else if (olay == 'U') {\n    alkisSay = 0;              // uzun ses: alkış dizisini sıfırla\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `bazOlc()` sessiz ortamın ortalamasını bulur. Bütün sapmalar bu değere göre hesaplanır.\n2. `abs(analogRead(SES) - baz)` baz seviyenin üstündeki ve altındaki salınımı aynı şekilde sayar.\n3. Olay başlayınca `baslangic` kaydedilir, her yüksek örnekte `sonYuksek` yenilenir. Süre `sonYuksek - baslangic` olur.\n4. Tek yüksek ses bir alkıştır ama tek başına LED'i değiştirmez: `alkisSay` 1 olur ve ikinci alkış beklenir.\n5. İkinci alkış `ARALIK`tan (3 saniye) geç gelirse, o alkış yeni bir \"ilk alkış\" olur.\n6. Sesler çok zayıfsa (`TEPE_ESIK` altı), çok kısaysa ya da çok uzunsa hiç alkış sayılmaz.\n\n### Dene\n- Konuşmayı **Ses şiddeti = 0,1** ile taklit et (sapma yaklaşık 71). `TEPE_ESIK` 150 iken olay sayılıyor mu? 50 yapınca? Sonra 400 yap ve şiddeti 0,5 (sapma yaklaşık 358) ile 0,8 (yaklaşık 573) dene: hangi alkışlar kaçıyor?\n- `ARALIK = 1000` yap ve iki alkış arasında yaklaşık 2 saniye bekle. Ne olur?\n- Üçüncü bir alkış ekle: üç alkışta aktif buzzer'ı (D8) kısa çaldır. Buzzer'ı **Parça ekle** menüsünden seçip özellik panelinden **Tür**ünü **Aktif** yap. `alkisSay` değişkeni nasıl değişmeli?\n\n### Sık yapılan hatalar\n- Baz seviyeyi 512 sanmak: modülün baz seviyesi farklıdır (laboratuvardaki modülde yaklaşık 256). Her zaman ölç.\n- Baz seviyeyi **Ses şiddeti** 0 değilken ölçmek: baz yanlış çıkar ve alkış hep tanınır ya da hiç tanınmaz.\n- Olayı tek örnekle bitirmek: salınan sinyal ara sıra baz seviyeden geçer, bir alkış iki olay gibi görünür. Sessizlik payı bunu çözer.\n- Sadece tepe yüksekliğine bakmak: çok yüksek bir kapı çarpması da alkışa benzer. Süreyi de kontrol et.\n- Gerçek devrede gevşek ya da sallanan kablolar da sinyali oynatır ve sahte olay üretir (laboratuvar bunu modellemez, ama aklında olsun).",
          "question": "Alkış anahtarı kalabalık bir odada neden zorlanır? Süre ve yükseklik kontrollerine başka hangi kontrolü ekleyerek (örneğin iki alkış arasındaki süreyi sınırlamak gibi) yanlış tetikleri azaltırdın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Ses sensörünün neden bir \"baz seviye\" çevresinde salındığını\n- Baz seviyeyi ölçmeyi ve baz seviyeden sapmayı (`abs`) hesaplamayı\n- Bir ses olayını **yüksekliğine** ve **süresine** bakarak sınıflandırmayı\n- Bloklamayan bir durum değişkeniyle \"iki alkışta aç/kapat\" mantığını\n\n### Önceden bilmen gerekenler\n- 11. ders: `analogRead` 0-1023 arası bir sayı verir.\n- 19. ders: Değer döndüren fonksiyon yazmak.\n- 27. ders: `millis()` ile bekleme yapmadan zaman ölçmek.\n- 51. ders: Eşik, gürültü ve iki eşikle karar vermek.\n\n### Ses sensörü neyi ölçer?\nSes modülünde bir mikrofon ve bir yükselteç vardır. Ortam sessizken analog çıkış (AO) sabit bir **baz seviyede** durur. Ses gelince çıkış bu seviyenin hem üstüne hem altına salınır. Baz seviye modülden modüle farklıdır: sanal modülümüzde sessizken yaklaşık 256 okunur, 512 değil. Bu yüzden baz seviyeyi varsaymak yerine **ölçersin**.\n\n```\nint baz = ortalama(64 ölçüm);          // sessizken, açılışta\nint fark = abs(analogRead(A0) - baz);  // sapma\n```\n\n`abs()` sapmanın yönünü yok sayar: baz seviyenin üstündeki de altındaki de aynı büyüklükte sapmadır. Ses şiddeti 0,5 iken sanal modül yaklaşık 614 okur; baz 256 olduğundan sapma 358 çıkar.\n\n### Yükseklik tek başına yetmez\nSapma bir eşiği (örneğin 150) aşınca bir **olay** başlar. Ama kapı çarpması da, bağırmak da, müzik de bu eşiği aşar. Alkışı ayıran şey **süredir**:\n\n```\nSüre < 10 ms      -> kısa parazit\n10 ms - 500 ms    -> alkış\nSüre > 500 ms     -> uzun ses (müzik, bağırış)\n```\n\nSüre, olayın başlangıcı ile **son yüksek örnek** arasındaki farktır. Bunun için olay başlarken bir `baslangic`, her yüksek örnekte bir `sonYuksek` kaydedersin.\n\n### Sessizlik payı\nGerçek mikrofon sinyali salınır; salınırken ara sıra baz seviyeden geçer ve sapma bir an sıfıra yaklaşır. Olayı hemen bitirirsen tek alkış iki olay gibi görünür. Bu yüzden olayı, sapma `SESSIZ_PAY` (20 ms) boyunca eşiğin altında kalınca bitirirsin.\n\n### Durum tutan, bloklamayan kod\n`olayOku()` fonksiyonu her `loop()` turunda çağrılır. Çoğu turda hemen `0` döner. İçinde `sesVar` adlı bir durum değişkeni olduğu için olayın ortasında olup olmadığını hatırlar. `delay()` kullanılmadığı için program sürekli ölçüm yapar.\n\n### İki alkışla aç/kapat\nAlkış anahtarı iki alkışın **başlangıçları** arasındaki süreye bakar. Aralık `ARALIK`tan kısaysa LED'in durumu tersine çevrilir. Tek alkış yalnızca \"ilk alkış\" olarak hatırlanır. İkinci alkış geç gelirse yeni bir ilk alkış sayılır. Araya uzun ses girerse hafıza silinir.\n\n### Özet\nSes sensörü baz seviye çevresinde salınır; baz seviyeyi ölçer, sapmayı `abs` ile hesaplarsın. Alkışı tanımak için sapmanın yüksekliğine ve süresine birlikte bakılır. Sessizlik payı, salınan sinyalin tek olayı parçalamasını önler. Durum değişkenli, bloklamayan kod iki alkış mantığını `delay` olmadan çalıştırır.",
          "concepts": [
            {
              "term": "Baz seviye",
              "definition": "Ortam sessizken ses modülünün analog çıkışında okunan sabit değer.",
              "example": "Sanal modülde sessizken analogRead yaklaşık 256 verir; bunu açılışta ortalama alarak ölçersin.",
              "pitfall": "Baz seviyeyi 512 sanmak ya da Ses şiddeti 0 değilken ölçmek: bütün sapmalar yanlış hesaplanır."
            },
            {
              "term": "Sapma ve abs()",
              "definition": "Okumanın baz seviyeden uzaklığı; abs() bu uzaklığı yönden bağımsız pozitif sayıya çevirir.",
              "example": "abs(614 - 256) 358 verir; abs(100 - 256) 156 verir.",
              "pitfall": "abs() kullanmamak: gerçek mikrofon baz seviyenin altına da salındığı için bazı sesler kaçar."
            },
            {
              "term": "Tepe (tepe değer)",
              "definition": "Bir olay süresince görülen en büyük sapma.",
              "example": "Alkışta tepe yaklaşık 348 çıkabilir; fısıltıda 20-30 civarında kalır.",
              "pitfall": "Sadece tepeye bakmak: çok yüksek bir kapı çarpması da alkışa benzer, süre de kontrol edilmelidir."
            },
            {
              "term": "Olay süresi ve sınıflandırma",
              "definition": "Olayın başlangıcı ile son yüksek örnek arasındaki süreye göre sesi kısa parazit, alkış ya da uzun ses diye ayırmak.",
              "example": "5 ms kısa parazittir, 40 ms alkıştır, 800 ms uzun sestir.",
              "pitfall": "Süre sınırlarını gerçek donanıma bakmadan sabit sanmak; sınırlar modüle ve ortama göre ayarlanır."
            },
            {
              "term": "Sessizlik payı",
              "definition": "Olayı bitirmeden önce sapmanın kısa bir süre eşiğin altında kalmasını beklemek.",
              "example": "SESSIZ_PAY = 20 ms: sinyal 20 ms boyunca sakin kalırsa olay biter.",
              "pitfall": "Olayı tek örnekle bitirmek: salınan sinyal baz seviyeden geçince tek alkış iki olay gibi görünür."
            },
            {
              "term": "Durum değişkeni (sesVar)",
              "definition": "Programın olayın ortasında olup olmadığını hatırlamasını sağlayan değişken.",
              "example": "sesVar true iken fonksiyon yeni olay başlatmaz, mevcut olayı sürdürür.",
              "pitfall": "Durumu yerel değişkende tutmak: fonksiyon her çağrıldığında sıfırlanır ve olay hiç bitmez."
            }
          ],
          "quiz": [
            {
              "id": "m4h4d2-q1",
              "kind": "numeric",
              "prompt": "Sanal ses modülünde AO = 5 V × (0,25 + 0,7 × Ses şiddeti) olur ve analogRead = AO / 5 × 1023 kadardır. Sessizken baz 256 ölçüldü. Ses şiddeti 0,5 iken abs(analogRead - baz) yaklaşık kaç çıkar?",
              "answer": 358,
              "tolerance": 2,
              "explanation": "Şiddet 0,5 için AO = 5 × (0,25 + 0,35) = 3,0 V, yani analogRead yaklaşık 614 olur. Sapma 614 - 256 = 358'dir. TEPE_ESIK 150 ise bu ses olay sayılır; şiddet 0,1 olsaydı sapma yaklaşık 71 olurdu ve sayılmazdı.",
              "skills": [
                "sens-noise",
                "sens-event-detect"
              ]
            },
            {
              "id": "m4h4d2-q2",
              "kind": "predict-output",
              "prompt": "Üç ses olayının süreleri 5 ms, 40 ms ve 800 ms. Kısa parazit için 'K', alkış için 'A', uzun ses için 'U' harfi yazdırılıyor. Bu kod ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  unsigned long sureler[] = {5, 40, 800};\n  for (int i = 0; i < 3; i++) {\n    char tur;\n    if (sureler[i] < 10) tur = 'K';\n    else if (sureler[i] > 500) tur = 'U';\n    else tur = 'A';\n    Serial.print(tur);\n  }\n}\n```",
              "options": [
                "AAU",
                "KAU",
                "KAA",
                "UAK"
              ],
              "answer": 1,
              "explanation": "5 ms, 10 ms'den kısa olduğu için 'K'; 40 ms arada kaldığı için 'A'; 800 ms, 500 ms'den uzun olduğu için 'U'. Çıktı KAU olur. İlk seçenek 5 ms'yi alkış sayar, üçüncüsü 800 ms'yi alkış sayar, dördüncüsü sırayı ters okur.",
              "skills": [
                "sens-event-detect"
              ]
            },
            {
              "id": "m4h4d2-q3",
              "kind": "find-bug",
              "prompt": "Her alkış seri monitörde 'KISA sure=0' diye yazılıyor. Süre sonlandırılırken sure = sonYuksek - baslangic hesaplanıyor. Olay yakalama kodunda tek hata var. Nerede?\n\n```\nif (fark >= TEPE_ESIK) {\n  if (!sesVar) {\n    sesVar = true;\n    baslangic = simdi;\n    sonYuksek = simdi;\n  }\n  if (fark > tepe) tepe = fark;\n}\n```",
              "options": [
                "TEPE_ESIK çok küçük seçilmiş",
                "abs() eksik olduğu için sapma negatif çıkıyor",
                "sonYuksek yalnız olay başlarken ayarlanıyor; her yüksek örnekte yenilenmediği için süre hep 0",
                "SURE_MAX çok büyük seçilmiş"
              ],
              "answer": 2,
              "explanation": "Süre, son yüksek örnekle başlangıç arasındaki farktır. sonYuksek yalnızca olay başlarken ayarlanırsa sonYuksek ile baslangic hep aynı kalır ve fark 0 olur; 10 ms'den kısa olduğu için hepsi KISA yazılır. Çözüm sonYuksek = simdi satırını sesVar kontrolünün dışına, her yüksek örnekte çalışacak yere almaktır.",
              "skills": [
                "sens-event-detect",
                "prog-debug"
              ]
            },
            {
              "id": "m4h4d2-q4",
              "kind": "mcq",
              "prompt": "İki alkış anahtarında ARALIK 3000 ms. İlk alkıştan 5 saniye sonra ikinci alkış geliyor. Ne olur?",
              "options": [
                "LED değişmez; ikinci alkış yeni bir 'ilk alkış' sayılır",
                "LED durumunu değiştirir",
                "LED değişmez ve ikinci alkış tamamen unutulur",
                "Program hata verir"
              ],
              "answer": 0,
              "explanation": "Başlangıçlar arası süre 5000 ms, ARALIK'tan (3000) uzun olduğu için LED değişmez. Ama ikinci alkış da bir alkıştır: ilkAlkis olarak kaydedilir ve arkasından 3 saniye içinde gelecek bir alkışla çift oluşturabilir.",
              "skills": [
                "sens-event-detect",
                "prog-timing"
              ]
            },
            {
              "id": "m4h4d2-q5",
              "kind": "mcq",
              "prompt": "Alkış tanıma kodundan sessizlik payı (SESSIZ_PAY) kaldırılırsa ve olay sapma eşiğin altına inen ilk örnekte bitirilirse gerçek bir mikrofonla ne olabilir?",
              "options": [
                "Hiçbir alkış algılanmaz",
                "LED sürekli yanık kalır",
                "Baz seviye kayar",
                "Salınan sinyal baz seviyeden geçerken tek alkış birden çok kısa olaya bölünebilir"
              ],
              "answer": 3,
              "explanation": "Gerçek mikrofon sinyali baz seviyenin iki yanına salınır; baz seviyeden geçerken sapma bir an sıfıra yaklaşır. Olay hemen bitirilirse tek alkış birkaç kısa olay gibi görünür ve süre/yükseklik kontrolü bozulur. Sessizlik payı bu kısa boşlukları yok sayar. Diğer seçeneklerin kodla ilgisi yoktur.",
              "skills": [
                "sens-event-detect",
                "sens-noise"
              ]
            }
          ]
        },
        {
          "title": "MQ-2 gaz sensörü: ısınma ve kalibrasyon",
          "durationMin": 25,
          "problem": "Mutfaktaki gaz kaçağı alarmı sessizce bekler, ama bir gün öter. Peki alarm \"kaç ppm gaz var\" diye mi karar verir? Çoğu ucuz sensörde hayır: sadece \"temiz havaya göre değer çok arttı\" der. Bu derste MQ-2 gaz sensörünün neden önce ısınması gerektiğini, temiz havada nasıl ölçüm yapıp **baz değer** bulacağını ve bu değere göre nasıl alarm vereceğini öğreneceksin.",
          "contentMd": "### Güvenlik notu\n- Gaz kaçağı ve yanıcı gazlar tehlikelidir. Bu derste gaz yoktur: gaz artışını laboratuvarda MQ-2'nin **Gaz düzeyi** özelliğiyle taklit edeceksin.\n- Gerçek MQ-2'nin içinde bir ısıtıcı vardır; çalışırken sıcak olur.\n- Bu devre, sertifikalı bir gaz ya da duman dedektörünün yerini **tutmaz**. Eğitim amaçlıdır.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| MQ-2 gaz sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** (**DO** boş kalır) |\n| Direnç (330 Ω) + LED (durum) | **D12** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n| Direnç (330 Ω) + LED (alarm) | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n\nMQ-2 modülünü 5 V'a bağla; laboratuvarda 3,3 V'a bağlarsan modül beslenmemiş sayılır (gerçek MQ-2'nin ısıtıcısı da 5 V ister). Çoğu MQ-2 modülünde gaz arttıkça analog çıkış gerilimi de artar; laboratuvardaki modül de böyledir. MQ-2 yanıcı gazlara ve dumana duyarlıdır ama hangi gaz olduğunu **ayırt edemez**.\n\nLaboratuvarda **Gaz düzeyi** özelliği 0 (temiz hava) ile 1 arasındadır ve çalışırken değiştirilebilir. Bu modülde AO gerilimi 5 V × (0,1 + 0,9 × düzey) olur:\n\n| Gaz düzeyi | 0 | 0,03 | 0,1 | 0,3 | 1 |\n|---|---|---|---|---|---|\n| `analogRead(A3)` | 102 | 130 | 194 | 379 | 1023 |\n\n### Isınma ve kalibrasyon\nMQ-2'nin ısıtıcısı sensör elemanını çalışma sıcaklığına getirir. Soğukken ya da yeni açıldığında okumalar kararsızdır ve yavaş yavaş oturur. İlk kullanımda ve uzun süre kapalı kaldıktan sonra bu süre **uzundur**; ne kadar olduğu modüle ve üreticiye göre değişir, kendi veri sayfana bak. Bu derste laboratuvarda beklememek için **5 saniye** kullanıyoruz; gerçek bir devrede bu süre çok daha uzun olmalıdır. Laboratuvardaki MQ-2 ısınma etkisini modellemez (okumalar baştan kararlıdır); ısınma beklemesini yine de kodda yazarız, çünkü gerçek modül öyle davranır.\n\nIsındıktan sonra **temiz havada** (laboratuvarda Gaz düzeyi 0 iken, yani `analogRead` yaklaşık 102) bir ölçüm alırsın: bu senin **baz** değerindir. Baz değer ortamdan ortama, modülden modüle ve zamanla değişir. Bu yüzden alarm için sabit bir sayı yerine **baz değere göre** bir eşik kullanırız (örneğin bazın 1,5 katı).\n\nppm (milyonda bir) gibi bir birime çevirmek için veri sayfasındaki eğri, gazın türü ve sensörün kalibrasyon bilgisi gerekir. Bunlar olmadan ortaya çıkan sayı güvenilir değildir. Bu yüzden derslerde **ppm yazmıyoruz**; sadece \"temiz havadaki değerin kaç katı\" diye bakıyoruz.\n\n### Program 1: ısın ve baz ölç\nLED (D12) ısınırken yanıp söner. Isınma bitince sensör 32 kez ölçülür ve ortalaması baz olur.\n\n```cpp\n// sketch: mq2_isinma_baz\nconst int GAZ = A3;\nconst int DURUM_LED = 12;\nconst unsigned long ISINMA_MS = 5000;   // ders için kısa; gerçekte çok daha uzun\n\nint baz;\nunsigned long sonYazma = 0;\n\nint bazOlc() {\n  long toplam = 0;\n  for (int i = 0; i < 32; i++) {\n    toplam += analogRead(GAZ);\n    delay(20);\n  }\n  return toplam / 32;\n}\n\nvoid setup() {\n  pinMode(DURUM_LED, OUTPUT);\n  Serial.begin(9600);\n\n  Serial.println(\"Isiniyor...\");\n  while (millis() < ISINMA_MS) {\n    digitalWrite(DURUM_LED, (millis() / 250) % 2);   // yanıp söner\n  }\n  digitalWrite(DURUM_LED, LOW);\n\n  baz = bazOlc();\n  Serial.print(\"baz=\");\n  Serial.println(baz);\n}\n\nvoid loop() {\n  if (millis() - sonYazma >= 500) {\n    sonYazma = millis();\n    int okuma = analogRead(GAZ);\n    Serial.print(\"okuma=\");\n    Serial.print(okuma);\n    Serial.print(\" fark=\");\n    Serial.println(okuma - baz);\n  }\n}\n```\n\n### Program 2: baz değere göre alarm\nAlarm, okumanın bazın **kaç katı** olduğuna bakar. 51. dersteki gibi iki eşik kullanırız: oran 1,5'e çıkınca alarm başlar, ancak 1,2'nin altına inince biter. Okumayı ayrıca yumuşatırız (14. ders): her 50 ms'de bir örnek alınır ve eski ortalamayla karıştırılır. Böylece tek bir sıçrama alarm vermez.\n\n```cpp\n// sketch: mq2_bagil_alarm\nconst int GAZ = A3;\nconst int DURUM_LED = 12;\nconst int ALARM_LED = 13;\nconst unsigned long ISINMA_MS = 5000;\nconst float ALARM_ORAN = 1.5;   // bazın 1,5 katı: alarm başlar\nconst float BIRAK_ORAN = 1.2;   // bazın 1,2 katının altı: alarm biter\n\nfloat baz;\nfloat ort;\nbool alarm = false;\nunsigned long sonOrnek = 0;\nunsigned long sonYazma = 0;\n\nfloat bazOlc() {\n  long toplam = 0;\n  for (int i = 0; i < 32; i++) {\n    toplam += analogRead(GAZ);\n    delay(20);\n  }\n  return toplam / 32.0;\n}\n\nvoid setup() {\n  pinMode(DURUM_LED, OUTPUT);\n  pinMode(ALARM_LED, OUTPUT);\n  Serial.begin(9600);\n\n  while (millis() < ISINMA_MS) {\n    digitalWrite(DURUM_LED, (millis() / 250) % 2);\n  }\n  digitalWrite(DURUM_LED, LOW);\n\n  baz = bazOlc();\n  if (baz < 20) baz = 20;   // çok küçük baz, oranı anlamsız büyütür\n  ort = baz;\n  Serial.print(\"baz=\");\n  Serial.println(baz, 0);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - sonOrnek >= 50) {\n    sonOrnek = simdi;\n    ort = 0.8 * ort + 0.2 * analogRead(GAZ);\n    float oran = ort / baz;\n\n    if (!alarm && oran >= ALARM_ORAN) {\n      alarm = true;\n    } else if (alarm && oran < BIRAK_ORAN) {\n      alarm = false;\n    }\n    digitalWrite(ALARM_LED, alarm);\n  }\n\n  if (simdi - sonYazma >= 500) {\n    sonYazma = simdi;\n    Serial.print(\"oran=\");\n    Serial.print(ort / baz, 2);\n    Serial.print(\" alarm=\");\n    Serial.println(alarm ? 1 : 0);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `ISINMA_MS` dolana kadar program hiçbir ölçüm kullanmaz; yalnızca durum LED'i yanıp söner.\n2. Isınmadan sonra 32 ölçümün ortalaması `baz` olur. Bu sırada ortamda gaz, duman ya da alkol buharı **olmamalıdır** (laboratuvarda Gaz düzeyi 0 kalmalı).\n3. `ort`, eski ortalamanın %80'i ile yeni okumanın %20'sinin toplamıdır. Okuma bir anda artsa bile `ort` birkaç örnekte yükselir.\n4. `oran = ort / baz` bazın kaç katı olduğunu söyler. 1,0 temiz hava demektir; 2,0 ise değerin iki katına çıktığı.\n5. İki eşik alarmı kararlı tutar: oran 1,2 ile 1,5 arasındayken alarm durumu değişmez.\n6. `baz < 20` kontrolü, baz çok küçükse oranın anlamsız büyük çıkmasını önler.\n\n### Dene\n- Gaz düzeyini 0,03 yap (okuma yaklaşık 130, oran yaklaşık 1,27). `ALARM_ORAN = 1.5` iken alarm var mı? `ALARM_ORAN = 1.2` yapınca? Sonra 3.0 yap: ne zaman alarm veriyor?\n- Isınma süresini 1000 ms yap. `baz` değeri değişiyor mu? (Laboratuvarda değişmez, çünkü ısınma modellenmiyor. Gerçek sensörde ısınma bitmeden ölçmek büyük farklar yaratır.)\n- Sketch'e `Serial.println(okuma)` ekleyip ham değerlerle yumuşatılmış `ort` değerini yan yana yaz. Hangisi daha kararlı?\n\n### Sık yapılan hatalar\n- Isınmayı beklememek: baz değer yanlış çıkar, alarm yanlış çalar ya da hiç çalmaz.\n- Bazı gazlı ortamda ölçmek (laboratuvarda Gaz düzeyi 0 değilken program başlatmak): alarm eşiği yukarı kayar ve gerçek tehlike kaçırılır.\n- Sabit bir sayıyla (`okuma > 400`) karşılaştırmak: başka modülde ya da başka havada anlamsız olur.\n- Okumayı ppm gibi bir birime çevirip doğru sanmak.\n- Alarmı tek bir okumaya bağlamak: tek sıçrama yanlış alarm verir.\n- Bu devreyi gerçek can güvenliği için tek başına kullanmak.",
          "question": "Baz değeri her açılışta yeniden ölçmek iyi bir fikir mi? Sensör gazlı bir odada açılırsa ne olur? Bu sorunu nasıl fark ederdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- MQ-2 gaz sensörünün neden **ısınma** beklemesi istediğini\n- Temiz havada **baz değer** ölçmeyi ve eşiği bazın katı olarak yazmayı\n- Neden \"ppm\" gibi bir birim yazmadığımızı\n- Yumuşatma ve iki eşikle kararlı bir alarm kurmayı\n\n### Önceden bilmen gerekenler\n- 11. ders: `analogRead` ve 0-1023 aralığı.\n- 14. ders: Yumuşatma (eski ortalamayla yeni okumayı karıştırmak).\n- 27. ders: `millis()` ile bloklamayan kod.\n- 51. ders: Histerezis (iki eşik).\n- 52. ders: Baz seviyeyi ortalama alarak ölçmek.\n\n### Güvenlik önce\nGaz kaçağı ve yanıcı gazlar tehlikelidir. Bu derste gerçek gaz yoktur: gazı sanal modüldeki **Gaz düzeyi** değeriyle taklit edersin. Bu devre sertifikalı bir gaz ya da duman dedektörünün yerini **tutmaz**; yalnızca eğitim içindir.\n\n### MQ-2 ne yapar?\nMQ-2 modülünün içinde ısıtılan bir sensör elemanı vardır. Yanıcı gazlar ve duman bu elemanın direncini değiştirir; modül bunu analog çıkışa (AO) gerilim olarak verir. Gaz arttıkça AO yükselir. Sanal modülde AO = 5 V × (0,1 + 0,9 × düzey) olur:\n\n```\nGaz düzeyi:   0     0,03   0,1   0,3    1\nanalogRead:  102    130    194   379   1023\n```\n\nMQ-2 hangi gaz olduğunu **ayırt edemez**. Sadece \"temiz havaya göre arttı\" der.\n\n### Isınma\nIsıtıcı elemanı çalışma sıcaklığına getirmeden okumalar kararsızdır. Gerçek modülde bu süre uzundur ve veri sayfasında yazar. Derste beklememek için 5 saniye kullanırız. Sanal modül ısınmayı modellemez, ama kodda yine bekleriz çünkü gerçek modül öyle davranır.\n\n### Baz değer ve göreli eşik\nIsındıktan sonra **temiz havada** birkaç okumanın ortalamasını alırsın: bu `baz`dır. Baz her modülde ve her ortamda farklıdır. Bu yüzden eşiği sabit sayı (`okuma > 400`) yerine bazın katı olarak yazarsın:\n\n```\nfloat oran = ort / baz;     // 1,0 = temiz hava\n```\n\nDikkat: `ort` ve `baz` iki `int` ise `ort / baz` tamsayı bölmesi yapar. 160 / 100 sonucu 1 olur, 1,6 olmaz. Bu yüzden `baz` ya da `ort` `float` tutulur.\n\n### Neden ppm yazmıyoruz?\nppm'e çevirmek için veri sayfasındaki eğri, gazın türü ve kalibrasyon gerekir. Bunlar olmadan çıkan sayı güvenilir görünür ama değildir. Biz yalnızca \"temiz havadakinin kaç katı\" diye bakarız.\n\n### Kararlı alarm\nAlarm tek bir sıçramaya bağlı olmasın:\n1. Okumayı yumuşat: `ort = 0.8 * ort + 0.2 * okuma`.\n2. İki eşik kullan: oran 1,5'e çıkınca başla, 1,2'nin altına inince bitir.\n\n### Özet\nMQ-2 ısındıktan sonra temiz havada baz değer ölçülür. Alarm eşiği sabit sayı değil, bazın katıdır. ppm yazılmaz çünkü kalibrasyon yoktur. Yumuşatma ve iki eşik alarmı kararlı kılar. Bu devre eğitim amaçlıdır ve gerçek can güvenliği için kullanılmaz.",
          "concepts": [
            {
              "term": "Isınma süresi",
              "definition": "MQ-2'nin içindeki ısıtıcının sensör elemanını çalışma sıcaklığına getirmesi için beklenen süre.",
              "example": "Derste 5 saniye bekleriz; gerçek modül için veri sayfasındaki süreyi kullanırsın.",
              "pitfall": "Isınmayı beklememek: baz değer yanlış çıkar, alarm yanlış çalar ya da hiç çalmaz."
            },
            {
              "term": "Baz değer",
              "definition": "Isındıktan sonra temiz havada ölçülen ortalama okuma.",
              "example": "Sanal modülde Gaz düzeyi 0 iken baz yaklaşık 102'dir.",
              "pitfall": "Bazı gazlı ortamda ölçmek: eşikler yukarı kayar ve gerçek bir artış kaçar."
            },
            {
              "term": "Göreli eşik (oran)",
              "definition": "Eşiği sabit sayı yerine bazın katı olarak yazmak.",
              "example": "ALARM_ORAN = 1,5 ve baz 120 ise alarm 180 ve üstünde başlar.",
              "pitfall": "okuma > 400 gibi sabit sayı kullanmak: başka modülde ya da başka havada anlamsız olur."
            },
            {
              "term": "Yumuşatma",
              "definition": "Her yeni okumayı eski ortalamayla karıştırarak ani sıçramaları yumuşatmak.",
              "example": "ort = 0.8 * ort + 0.2 * okuma satırı tek bir sıçramanın alarm vermesini engeller.",
              "pitfall": "Alarmı tek bir ham okumaya bağlamak: bir sıçrama yanlış alarm üretir."
            },
            {
              "term": "Tamsayı bölmesi tuzağı",
              "definition": "İki int sayıyı bölmek küsuratı atar: 160 / 100 sonucu 1 olur.",
              "example": "float oran = ort / 100.0; yazarsan oran 1,6 çıkar.",
              "pitfall": "Oranı float değişkene atayıp doğru olduğunu sanmak; bölme int ile yapılmışsa küsurat zaten kaybolmuştur."
            },
            {
              "term": "Sayısal ppm yerine bağıl okuma",
              "definition": "ppm için gaz türü, eğri ve kalibrasyon gerekir; yoksa yalnızca bazın katı söylenir.",
              "example": "\"Temiz havanın 1,6 katı\" doğru bir ifadedir; \"500 ppm\" bu devrede uydurmadır.",
              "pitfall": "Okumayı ppm'e çevirip doğru sanmak ya da devreyi gerçek can güvenliği için tek başına kullanmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h4d3-q1",
              "kind": "numeric",
              "prompt": "Başka bir MQ-2 modülünde temiz havada baz değer 120 ölçüldü. Alarm oranı 1,5 ise alarmın başlayacağı en küçük okuma değeri kaçtır?",
              "answer": 180,
              "tolerance": 0,
              "explanation": "Eşik bazın katıdır: 120 × 1,5 = 180. Aynı kodu baz 102 olan sanal modülde çalıştırsan eşik 153 olurdu. Eşiği sabit sayı yazmaman bu yüzden önemlidir.",
              "skills": [
                "sens-baseline"
              ]
            },
            {
              "id": "m4h4d3-q2",
              "kind": "predict-output",
              "prompt": "Baz 100, yumuşatma ort = 0.8 * ort + 0.2 * okuma. Okuma birden 300'e çıkıp orada kalıyor. Bu kod ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  float ort = 100;\n  for (int i = 1; i <= 3; i++) {\n    ort = 0.8 * ort + 0.2 * 300;\n    Serial.println(ort, 0);\n  }\n}\n```\n(println ikinci parametre 0: küsurat basamağı yok.)",
              "options": [
                "300, 300, 300",
                "140, 172, 198",
                "120, 136, 149",
                "140, 140, 140"
              ],
              "answer": 1,
              "explanation": "Birinci adım 0,8 × 100 + 60 = 140, ikinci 0,8 × 140 + 60 = 172, üçüncü 0,8 × 172 + 60 = 197,6 ve println 198 yazar. Ort ancak ikinci adımda 150'yi (bazın 1,5 katı) geçer. Yumuşatma bu yüzden tek bir sıçramada değil, kalıcı artışta alarm verir.",
              "skills": [
                "sens-smoothing",
                "sens-baseline"
              ]
            },
            {
              "id": "m4h4d3-q3",
              "kind": "mcq",
              "prompt": "Gerçek bir MQ-2 modülünü yeni bağladın ve hemen baz ölçüyorsun. Neden bu iyi bir fikir değildir?",
              "options": [
                "Isıtıcı ısınmadan okumalar kararsızdır; bu baz yanlış çıkar",
                "MQ-2 hiç analog çıkış vermez",
                "Baz yalnızca fabrikada ölçülür",
                "analogRead ısınmadan çalışmaz"
              ],
              "answer": 0,
              "explanation": "MQ-2'nin ısıtıcısı sensör elemanını çalışma sıcaklığına getirmeden okumalar yavaş yavaş oturur. O sırada ölçülen baz, sonraki okumalara göre çok farklı olur ve oran hesabı bozulur. Diğer seçenekler yanlıştır: modülün AO çıkışı vardır, analogRead her zaman çalışır ve baz ortamda ölçülür.",
              "skills": [
                "sens-baseline",
                "safety-sensors"
              ]
            },
            {
              "id": "m4h4d3-q4",
              "kind": "find-bug",
              "prompt": "Gerçek oran 1,6 iken (ort = 160, baz = 100) alarm hiç başlamıyor. Hata nerede?\n\n```\nint baz = 100;\nint ort = 160;\nfloat oran = ort / baz;\nif (oran >= 1.5) alarm = true;\n```",
              "options": [
                "int ort = 160; satırı",
                "if (oran >= 1.5) satırı",
                "int baz = 100; satırı",
                "float oran = ort / baz; satırı: iki int bölününce sonuç 1 olur"
              ],
              "answer": 3,
              "explanation": "ort ve baz iki int olduğu için 160 / 100 tamsayı bölmesidir ve sonuç 1 çıkar; float değişkene atamak küsuratı geri getirmez. Çözüm ort / (float)baz ya da ort / 100.0 yazmaktır. Diğer satırlar doğrudur.",
              "skills": [
                "prog-debug",
                "sens-baseline"
              ]
            },
            {
              "id": "m4h4d3-q5",
              "kind": "mcq",
              "prompt": "MQ-2 okuması 500. Bir arkadaşın \"Bu kaç ppm gaz demek?\" diye soruyor. En doğru cevap hangisidir?",
              "options": [
                "500 ppm",
                "5 ppm, çünkü 500 / 100",
                "Bu devrede ppm söylenemez; yalnızca temiz havadaki baza göre kaç kat arttığı söylenebilir",
                "Sıfır ppm, çünkü gaz yok"
              ],
              "answer": 2,
              "explanation": "ppm için veri sayfasındaki eğri, gazın türü ve sensörün kalibrasyonu gerekir. MQ-2 gazı ayırt edemez ve kalibrasyon yapılmamıştır. Bu yüzden yalnızca oran (okuma / baz) söylenir. Diğer seçenekler uydurma bir dönüşüm yapar.",
              "skills": [
                "sens-baseline",
                "safety-sensors"
              ]
            }
          ]
        },
        {
          "title": "Alev sensörü ve çoklu eşik yönetimi",
          "durationMin": 30,
          "problem": "Bir yangın alarmı \"var\" ya da \"yok\" demekle yetinmez. Önce küçük bir uyarı verir (\"bir şey ısınıyor, bak\"), durum kötüleşirse tehlike alarmına geçer, durum düzelince de önce tehlikeden uyarıya, sonra normale döner. Bu derste alev sensörünü tanıyacak, üç seviyeli (NORMAL, UYARI, TEHLIKE) bir karar mekanizması yazacak ve aynı kodu birden fazla sensörde tekrar kullanmayı öğreneceksin.",
          "contentMd": "### Güvenlik notu\nBu derste alev yoktur: alevi laboratuvarda alev sensörünün **Alev şiddeti** özelliğiyle taklit edeceksin. Gerçek alevle deney yapmak tehlikelidir.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Alev sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A1** (**DO** boş kalır) |\n| MQ-2 gaz sensörü modülü (son sketch için) | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** |\n| Direnç (330 Ω) + LED (uyarı; rengi özellik panelinden sarı yap) | **D12** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n| Direnç (330 Ω) + LED (tehlike; rengi kırmızı) | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n| Buzzer (özellik panelinden **Tür: Aktif**) | **+** → **D8**, **-** → **GND** |\n\nA1 pinini bu hafta 51. derste LDR için kullandık; burada LDR'nin yerine alev sensörü bağlıdır (LDR'yi ve ona bağlı direnci tuvalden silebilirsin). Alev sensörleri alevin yaydığı **kızılötesi (IR) ışığa** duyarlıdır. Birçok modülde güçlü bir IR kaynağı yaklaşınca analog değer **düşer**, ama bu modüle göre değişir; ters olabilir. Güneş ışığı ve bazı lambalar da IR yayar, bu yüzden yanlış alarm olabilir. Sensörün görüş açısı ve menzili sınırlıdır.\n\nLaboratuvardaki alev modülünde alev arttıkça AO **düşer** (AO = 5 V × (1 − 0,95 × şiddet)); yani `ALEVDE_DUSER = true` doğrudur. **Alev şiddeti** 0 iken `analogRead` 1023 okur (şiddet değeri 0). Bu derstekiyle karşılaştırma tablosu:\n\n| Alev şiddeti | 0 | 0,31 | 0,4 | 0,62 | 0,8 |\n|---|---|---|---|---|---|\n| `siddet()` | 0 | yaklaşık 300 (UYARI eşiği) | yaklaşık 389 | yaklaşık 600 (TEHLIKE eşiği) | yaklaşık 777 |\n\nMQ-2 için temiz havada (Gaz düzeyi 0) `analogRead(A3)` yaklaşık 102'dir; yani `gazBaz` yaklaşık 102 olur. UYARI için yaklaşık 153'ü, TEHLIKE için yaklaşık 255'i geçmek gerekir: Gaz düzeyi 0,06 UYARI, 0,3 TEHLIKE verir.\n\n### Yön farkını tek yerde çöz\nModülün değeri alevde düşüyor ya da yükseliyor olabilir. Bu farkı programın her yerinde düşünmek yerine, ham okumayı **şiddet** adlı tek bir sayıya çevirirsin: şiddet ne kadar büyükse alev o kadar güçlüdür.\n\n```cpp\nconst bool ALEVDE_DUSER = true;   // modülün alevde değer düşüyorsa true\n\nint siddet(int ham) {\n  return ALEVDE_DUSER ? 1023 - ham : ham;\n}\n```\n\nBundan sonraki bütün eşikler \"şiddet\" üzerinden yazılır. Modülün tersse yalnız bu satırı değiştirirsin.\n\n### Çoklu eşik: seviye ve histerezis\nÜç seviye (NORMAL, UYARI, TEHLIKE) için dört eşik gerekir:\n\n| Geçiş | Eşik |\n|---|---|\n| NORMAL → UYARI | `uyariAc` |\n| UYARI → NORMAL | `uyariKapat` (daha küçük) |\n| UYARI → TEHLIKE | `tehlikeAc` |\n| TEHLIKE → UYARI | `tehlikeKapat` (daha küçük) |\n\nHer seviyenin açma ve kapama eşikleri farklıdır; böylece 51. dersteki histerezis iki yerde birden çalışır. Seviyeleri 28. dersteki gibi bir `enum` ile tutarız. Karar, **şimdiki seviyeye** ve **şimdiki değere** bağlıdır.\n\n### Kod tekrarı\nİki sensör (alev ve gaz) için aynı mantığı kopyalayıp yapıştırırsan program şu hale gelir:\n\n```cpp\n// alev için\nif (alevSeviye == NORMAL && a >= 300) alevSeviye = UYARI;\nelse if (alevSeviye == UYARI && a < 250) alevSeviye = NORMAL;\n// ... TEHLIKE için de aynısı ...\n\n// gaz için aynı kodun kopyası, farklı sayılarla\nif (gazSeviye == NORMAL && g >= 276) gazSeviye = UYARI;\nelse if (gazSeviye == UYARI && g < 230) gazSeviye = NORMAL;\n// ... TEHLIKE için de aynısı ...\n```\n\nBir hata bulursan bunu iki yerde (ileride üç, dört yerde) düzeltmen gerekir. Çözüm, ortak mantığı **bir fonksiyona** koymaktır (19. ders). Fonksiyon eşikleri parametre olarak alır, yeni seviyeyi döndürür.\n\n### Program 1: alev seviyesi\n```cpp\n// sketch: alev_seviye\nconst int ALEV = A1;\nconst int LED_UYARI = 12;\nconst int LED_TEHLIKE = 13;\nconst int BUZZER = 8;\nconst bool ALEVDE_DUSER = true;\n\nenum Seviye { NORMAL, UYARI, TEHLIKE };\n\nSeviye seviye = NORMAL;\n\nint siddet(int ham) {\n  return ALEVDE_DUSER ? 1023 - ham : ham;\n}\n\nSeviye seviyeBul(Seviye simdiki, int deger,\n                 int uyariAc, int uyariKapat,\n                 int tehlikeAc, int tehlikeKapat) {\n  if (simdiki == NORMAL) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger >= uyariAc) return UYARI;\n    return NORMAL;\n  }\n  if (simdiki == UYARI) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger < uyariKapat) return NORMAL;\n    return UYARI;\n  }\n  // simdiki == TEHLIKE\n  if (deger < tehlikeKapat) {\n    return (deger >= uyariKapat) ? UYARI : NORMAL;\n  }\n  return TEHLIKE;\n}\n\nconst char* seviyeAdi(Seviye s) {\n  if (s == UYARI) return \"UYARI\";\n  if (s == TEHLIKE) return \"TEHLIKE\";\n  return \"NORMAL\";\n}\n\nvoid setup() {\n  pinMode(LED_UYARI, OUTPUT);\n  pinMode(LED_TEHLIKE, OUTPUT);\n  pinMode(BUZZER, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int s = siddet(analogRead(ALEV));\n  Seviye yeni = seviyeBul(seviye, s, 300, 250, 600, 500);\n\n  if (yeni != seviye) {\n    seviye = yeni;\n    Serial.print(\"ALEV: \");\n    Serial.print(seviyeAdi(seviye));\n    Serial.print(\" siddet=\");\n    Serial.println(s);\n  }\n\n  digitalWrite(LED_UYARI, seviye == UYARI);\n  digitalWrite(LED_TEHLIKE, seviye == TEHLIKE);\n  digitalWrite(BUZZER, seviye == TEHLIKE);\n}\n```\n\nFonksiyon `NORMAL`ken doğrudan `TEHLIKE`ye atlayabilir (alev birden gelirse). `TEHLIKE`den de doğrudan `NORMAL`e inebilir (alev birden giderse). Ara seviyeyi zorunlu bir basamak yapmadık.\n\n### Program 2: iki sensör, tek fonksiyon\nŞimdi aynı `seviyeBul` fonksiyonunu hem alev (A1) hem de gaz (A3) için kullanalım. Gazın eşikleri sabit sayı değil, 53. dersteki gibi **baz değere göre** hesaplanır: bazın 1,5 katı uyarı, 2,5 katı tehlike (kapamalar 1,25 ve 2 kat). Isınma bekleme kısmını burada kısa tuttuk; gerçek bir devrede 53. dersteki gibi uzun ısıtma yapılmalı.\n\n```cpp\n// sketch: iki_kanal_seviye\nconst int ALEV = A1;\nconst int GAZ = A3;\nconst int LED_UYARI = 12;\nconst int LED_TEHLIKE = 13;\nconst int BUZZER = 8;\nconst bool ALEVDE_DUSER = true;\n\nenum Seviye { NORMAL, UYARI, TEHLIKE };\n\nSeviye alevSeviye = NORMAL;\nSeviye gazSeviye = NORMAL;\nint gazBaz;\n\nint siddet(int ham) {\n  return ALEVDE_DUSER ? 1023 - ham : ham;\n}\n\nSeviye seviyeBul(Seviye simdiki, int deger,\n                 int uyariAc, int uyariKapat,\n                 int tehlikeAc, int tehlikeKapat) {\n  if (simdiki == NORMAL) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger >= uyariAc) return UYARI;\n    return NORMAL;\n  }\n  if (simdiki == UYARI) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger < uyariKapat) return NORMAL;\n    return UYARI;\n  }\n  if (deger < tehlikeKapat) {\n    return (deger >= uyariKapat) ? UYARI : NORMAL;\n  }\n  return TEHLIKE;\n}\n\nconst char* seviyeAdi(Seviye s) {\n  if (s == UYARI) return \"UYARI\";\n  if (s == TEHLIKE) return \"TEHLIKE\";\n  return \"NORMAL\";\n}\n\nSeviye enKotu(Seviye a, Seviye b) {\n  return (a > b) ? a : b;\n}\n\nvoid gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {\n  if (eski == yeni) return;\n  Serial.print(ad);\n  Serial.print(\": \");\n  Serial.print(seviyeAdi(yeni));\n  Serial.print(\" deger=\");\n  Serial.println(deger);\n}\n\nint bazOlc(int pin) {\n  long toplam = 0;\n  for (int i = 0; i < 16; i++) {\n    toplam += analogRead(pin);\n    delay(10);\n  }\n  return toplam / 16;\n}\n\nvoid setup() {\n  pinMode(LED_UYARI, OUTPUT);\n  pinMode(LED_TEHLIKE, OUTPUT);\n  pinMode(BUZZER, OUTPUT);\n  Serial.begin(9600);\n  gazBaz = bazOlc(GAZ);\n  Serial.print(\"gazBaz=\");\n  Serial.println(gazBaz);\n}\n\nvoid loop() {\n  int a = siddet(analogRead(ALEV));\n  int g = analogRead(GAZ);\n\n  Seviye yeniAlev = seviyeBul(alevSeviye, a, 300, 250, 600, 500);\n  Seviye yeniGaz = seviyeBul(gazSeviye, g,\n                             gazBaz * 3 / 2, gazBaz * 5 / 4,\n                             gazBaz * 5 / 2, gazBaz * 2);\n\n  gecisYaz(\"ALEV\", alevSeviye, yeniAlev, a);\n  gecisYaz(\"GAZ\", gazSeviye, yeniGaz, g);\n  alevSeviye = yeniAlev;\n  gazSeviye = yeniGaz;\n\n  Seviye genel = enKotu(alevSeviye, gazSeviye);\n  digitalWrite(LED_UYARI, genel == UYARI);\n  digitalWrite(LED_TEHLIKE, genel == TEHLIKE);\n  digitalWrite(BUZZER, genel == TEHLIKE);\n}\n```\n\n`enum` değerleri sırayla 0, 1, 2 olduğu için `NORMAL < UYARI < TEHLIKE` karşılaştırması çalışır. `enKotu` iki seviyeden büyük olanı verir: sensörlerden biri tehlikedeyse sistem tehlikededir.\n\n### Nasıl çalışıyor?\n1. `siddet()` ham okumayı \"büyük = alev güçlü\" biçimine çevirir. Modülün yönü ne olursa olsun geri kalan kod değişmez.\n2. `seviyeBul()` üç seviyeyi tek fonksiyonda toplar. İki sensör aynı fonksiyonu **farklı eşiklerle** çağırır.\n3. `uyariKapat < uyariAc` ve `tehlikeKapat < tehlikeAc` olduğu için her geçişin bir histerezis bandı vardır. Değer eşiğin yanında oynasa bile seviye titremez.\n4. `gecisYaz()` yalnız seviye değiştiğinde yazar. Seri monitör sürekli akmaz, olaylar okunur.\n5. Çıkışlar (LED, buzzer) her turda seviyeden türetilir. Böylece çıkışlar ile seviye hiç ayrışmaz.\n\n### Dene\n- `uyariKapat` değerini `uyariAc` ile aynı yap. **Alev şiddeti**ni eşiğin iki yanında (örneğin 0,29 ile 0,33) birkaç kez değiştir: seviye titriyor mu? Eski değerlerle (300 ve 250) aynı hareket seviyeyi değiştiriyor mu?\n- Üçüncü bir sensör ekle (örneğin A2'deki NTC için sıcaklığı tam sayı olarak ver; NTC ve 10 kΩ direnci 13. dersteki gibi bağla). `seviyeBul` fonksiyonunu değiştirmeden çalışıyor mu?\n- Alev sensörün değeri alevde yükseliyorsa hangi satırı değiştirirsin? Programın başka hiçbir yerine dokunman gerekiyor mu?\n\n### Sık yapılan hatalar\n- Kapama eşiğini açma eşiğinden büyük yazmak: seviye hiç düşmez ya da sürekli salınır.\n- `ALEVDE_DUSER` değerini kontrol etmemek: alarm hep ya da hiç çalmaz.\n- Aynı mantığı iki kez kopyalamak: bir yerde düzeltilen hata öbüründe kalır.\n- `NORMAL`, `UYARI`, `TEHLIKE` yerine sayılar kullanmak (`0`, `1`, `2`): kod okunmaz.\n- Gerçek devrede güneş ışığına doğrudan bakan sensör: IR yanlış alarmı verebilir (laboratuvar bunu modellemez).",
          "question": "\"UYARI\" seviyesi neden var? Doğrudan NORMAL ve TEHLIKE olsa ne kaybederdik? Üç seviyeyi ne zaman fazla bulursun?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Alev sensörünün yönünü (alevde değer düşer) tek bir fonksiyonda çözmeyi\n- Üç seviyeli (NORMAL, UYARI, TEHLIKE) bir karar mekanizmasını dört eşikle kurmayı\n- `enum` ile seviyeleri adlandırmayı\n- Aynı mantığı kopyalamak yerine parametreli bir fonksiyonla birden çok sensörde kullanmayı\n\n### Önceden bilmen gerekenler\n- 19. ders: Parametre alan ve değer döndüren fonksiyonlar.\n- 28. ders: `enum` ile durum makinesi.\n- 51. ders: Histerezis (açma ve kapama eşiği ayrı).\n- 53. ders: MQ-2 baz değeri ve bazın katı olarak eşik.\n\n### Alev sensörü ne okur?\nAlev sensörü, alevin yaydığı **kızılötesi (IR) ışığa** duyarlıdır. Birçok modülde alev yaklaşınca analog değer **düşer**; ama bazılarında yükselir. Sanal modül düşer: AO = 5 V × (1 - 0,95 × şiddet). Güneş ışığı ve bazı lambalar da IR yaydığı için gerçek devrede yanlış alarm olabilir.\n\n### Yönü tek yerde çöz\nYönü her karşılaştırmada düşünmek yerine ham okumayı bir **şiddet** sayısına çevirirsin: büyük sayı, güçlü alev.\n\n```\nint siddet(int ham) {\n  return ALEVDE_DUSER ? 1023 - ham : ham;\n}\n```\n\nÖrneğin ham okuma 700 ise şiddet 323'tür. Modülün yönü tersse yalnızca `ALEVDE_DUSER` değişir.\n\n### Üç seviye, dört eşik\nSeviyeler arası her geçişin kendi eşiği vardır:\n\n```\nNORMAL  -> UYARI    : deger >= uyariAc\nUYARI   -> NORMAL   : deger <  uyariKapat   (uyariAc'tan küçük)\nUYARI   -> TEHLIKE  : deger >= tehlikeAc\nTEHLIKE -> UYARI    : deger <  tehlikeKapat (tehlikeAc'tan küçük)\n```\n\nBöylece 51. dersteki histerezis iki yerde çalışır. Örnek: eşikler 300/250/600/500 ise şiddet 280'de UYARI'ya girmiş sistem UYARI'da kalır; 240'a inince NORMAL olur.\n\nSeviyeleri `0, 1, 2` gibi sayılarla değil, `enum Seviye { NORMAL, UYARI, TEHLIKE }` ile adlandırırsın. Değerler 0, 1, 2 olduğu için `UYARI < TEHLIKE` gibi karşılaştırmalar da çalışır.\n\n### Karar şimdiki seviyeye bağlıdır\n`seviyeBul(simdiki, deger, ...)` fonksiyonu hem şimdiki seviyeyi hem de okumayı alır, **yeni seviyeyi** döndürür. NORMAL'den doğrudan TEHLIKE'ye (alev birden gelirse) ya da TEHLIKE'den doğrudan NORMAL'e inilebilir.\n\n### Kod tekrarını bitir\nAlev ve gaz için aynı `if` zincirini iki kez kopyalarsan, bir hatayı iki yerde düzeltmen gerekir. Çözüm: aynı fonksiyonu **farklı eşiklerle** çağırmaktır. Alev için sabit eşikler, gaz için bazın katları (1,5; 1,25; 2,5; 2) kullanılır.\n\nİki sensörün seviyesinden genel durumu bulmak için en kötüsünü alırsın:\n\n```\nSeviye enKotu(Seviye a, Seviye b) { return (a > b) ? a : b; }\n```\n\nSensörlerden biri TEHLIKE ise sistem TEHLIKE'dir.\n\n### Özet\nAlev sensörünün yönü tek bir fonksiyonda çözülür. Üç seviye dört eşik gerektirir ve karar şimdiki seviyeye bağlıdır. `enum` seviyeleri okunur kılar. Parametreli `seviyeBul` fonksiyonu aynı mantığı birden çok sensörde kullanmayı sağlar; genel durum, sensör seviyelerinin en kötüsüdür.",
          "concepts": [
            {
              "term": "Şiddet (yönden bağımsız değer)",
              "definition": "Ham okumayı \"büyük sayı = güçlü alev\" olacak biçimde çeviren değer.",
              "example": "Alevde değer düşen modülde siddet(ham) = 1023 - ham verir; ham 700 ise şiddet 323'tür.",
              "pitfall": "ALEVDE_DUSER değerini kontrol etmemek: alarm hep ya da hiç çalar."
            },
            {
              "term": "Seviye (enum)",
              "definition": "Durumu NORMAL, UYARI, TEHLIKE gibi adlarla tutan sıralı bir tür.",
              "example": "enum Seviye { NORMAL, UYARI, TEHLIKE }; değerleri sırayla 0, 1, 2'dir.",
              "pitfall": "Seviyeler için 0, 1, 2 gibi çıplak sayılar kullanmak: kod okunmaz ve hata yapmak kolaylaşır."
            },
            {
              "term": "Çoklu eşik",
              "definition": "Üç seviye için dört eşik: UYARI açma/kapama ve TEHLIKE açma/kapama.",
              "example": "Alev için 300 / 250 ve 600 / 500 çiftleri kullanılır.",
              "pitfall": "Kapama eşiğini açma eşiğinden büyük yazmak: seviye hiç düşmez ya da sürekli salınır."
            },
            {
              "term": "Parametreli fonksiyon ile yeniden kullanım",
              "definition": "Aynı karar mantığını bir fonksiyona koyup eşikleri parametre olarak vermek.",
              "example": "seviyeBul alev için sabit sayılarla, gaz için bazın katlarıyla çağrılır.",
              "pitfall": "Aynı mantığı iki sensör için kopyalayıp yapıştırmak: bir yerde düzeltilen hata öbüründe kalır."
            },
            {
              "term": "En kötü seviye (enKotu)",
              "definition": "Birden çok sensörün seviyelerinden en yüksek olanı genel durum yapmak.",
              "example": "Gaz UYARI, alev TEHLIKE ise genel durum TEHLIKE olur.",
              "pitfall": "Yalnızca son okunan sensörü genel durum yapmak: önceki sensörün tehlikesi kaybolur."
            }
          ],
          "quiz": [
            {
              "id": "m4h4d4-q1",
              "kind": "numeric",
              "prompt": "Sanal alev modülü alevde değer düşürür ve siddet(ham) = 1023 - ham kullanılır. Ham okuma 700 iken şiddet kaçtır?",
              "answer": 323,
              "tolerance": 0,
              "explanation": "1023 - 700 = 323. Bu değer UYARI açma eşiğini (300) aşar; alev yok sayılmaz. Modülün yönü tersse ALEVDE_DUSER false yapılır ve şiddet doğrudan 700 olur.",
              "skills": [
                "sens-direction"
              ]
            },
            {
              "id": "m4h4d4-q2",
              "kind": "predict-output",
              "prompt": "seviyeBul eşikleri 300 / 250 / 600 / 500 ile çağrılıyor. Seviye başta NORMAL. Altı ölçüm sırayla geliyor ve her adımdan sonra yeni seviyenin harfi (N, U ya da T) yazılıyor. Bu kod ne yazar?\n\n```\nenum Seviye { NORMAL, UYARI, TEHLIKE };\n\nSeviye seviyeBul(Seviye simdiki, int deger,\n                 int uyariAc, int uyariKapat,\n                 int tehlikeAc, int tehlikeKapat) {\n  if (simdiki == NORMAL) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger >= uyariAc) return UYARI;\n    return NORMAL;\n  }\n  if (simdiki == UYARI) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger < uyariKapat) return NORMAL;\n    return UYARI;\n  }\n  if (deger < tehlikeKapat) {\n    return (deger >= uyariKapat) ? UYARI : NORMAL;\n  }\n  return TEHLIKE;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  int olcum[] = {320, 280, 240, 650, 520, 480};\n  Seviye s = NORMAL;\n  for (int i = 0; i < 6; i++) {\n    s = seviyeBul(s, olcum[i], 300, 250, 600, 500);\n    Serial.print(s == NORMAL ? 'N' : (s == UYARI ? 'U' : 'T'));\n  }\n}\n```",
              "options": [
                "UNNTUU",
                "UUUTTT",
                "UUNTTU",
                "UUNTTN"
              ],
              "answer": 2,
              "explanation": "320 NORMAL'den UYARI yapar (U). 280, 250'nin altına inmediği için UYARI'da kalır (U). 240 < 250 olduğundan NORMAL (N). 650 doğrudan TEHLIKE (T). 520 ≥ 500 olduğu için TEHLIKE sürer (T). 480 < 500 ve ≥ 250 olduğundan UYARI'ya iner (U). İlk seçenek histerezissiz tek eşik gibi davranır, ikincisi seviyenin hiç düşmediğini varsayar, dördüncüsü TEHLIKE'den doğrudan NORMAL'e indirir.",
              "skills": [
                "sens-levels",
                "sens-hysteresis"
              ]
            },
            {
              "id": "m4h4d4-q3",
              "kind": "find-bug",
              "prompt": "Alev şiddeti 320'de sabit duruyor ama sarı UYARI LED'i çok hızlı yanıp sönüyor. Hata hangisinde?\n\n```\nSeviye yeni = seviyeBul(seviye, s, 300, 350, 600, 500);\n```\n(Argüman sırası: uyariAc, uyariKapat, tehlikeAc, tehlikeKapat.)",
              "options": [
                "uyariAc (300) çok küçük",
                "uyariKapat (350), uyariAc'tan (300) büyük yazılmış",
                "tehlikeKapat (500), tehlikeAc'tan (600) küçük olmamalı",
                "seviye değişkeni global olmamalı"
              ],
              "answer": 1,
              "explanation": "NORMAL'dayken 320 ≥ 300 olduğu için UYARI'ya geçilir. UYARI'dayken 320 < 350 olduğundan hemen NORMAL'e dönülür ve bu böyle sürer: LED her turda değişir. Kapama eşiği açma eşiğinden küçük olmalıdır (örneğin 250). tehlikeKapat < tehlikeAc doğru yazılmıştır, uyariAc de sorun değildir.",
              "skills": [
                "sens-levels",
                "sens-hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m4h4d4-q4",
              "kind": "mcq",
              "prompt": "Elindeki başka marka bir alev modülü, alev yaklaşınca değeri YÜKSELTİYOR. Derstekiyle aynı programı kullanmak için hangi değişiklik yeterlidir?",
              "options": [
                "Yalnızca ALEVDE_DUSER sabitini false yapmak",
                "seviyeBul fonksiyonunu baştan yazmak",
                "Bütün eşikleri tek tek ters çevirmek",
                "Alev ve gaz için ayrı iki program yazmak"
              ],
              "answer": 0,
              "explanation": "Yön farkı siddet() içinde tek bir yerde çözülür. ALEVDE_DUSER false olunca şiddet = ham olur ve geri kalan kod (seviyeBul, eşikler, çıkışlar) aynen çalışır. Yönü her karşılaştırmada ayrı düşünmek hem hata hem de tekrar demektir.",
              "skills": [
                "sens-direction",
                "prog-reuse-functions"
              ]
            },
            {
              "id": "m4h4d4-q5",
              "kind": "mcq",
              "prompt": "Gaz seviyesi UYARI, alev seviyesi TEHLIKE. enum Seviye { NORMAL, UYARI, TEHLIKE } ve enKotu(a, b) \"büyük olanı\" döndürüyor. Genel durum ne olur?",
              "options": [
                "NORMAL",
                "UYARI",
                "Hata verir, çünkü enum karşılaştırılamaz",
                "TEHLIKE"
              ],
              "answer": 3,
              "explanation": "enum değerleri sırayla 0, 1, 2'dir; TEHLIKE (2), UYARI'dan (1) büyüktür, bu yüzden enKotu TEHLIKE döndürür. Sensörlerden biri tehlikedeyse sistem tehlikededir. enum değerleri sayı gibi karşılaştırılır; derleme hatası olmaz.",
              "skills": [
                "sens-levels"
              ]
            }
          ]
        },
        {
          "title": "Proje: Yangın ve gaz alarm paneli",
          "durationMin": 35,
          "problem": "Bir binanın yangın panosuna baktığında yeşil, sarı ve kırmızı ışıklar görürsün; biraz yakında da bir bip sesi duyarsın. Panonun içinde sensörler, bir karar mantığı ve çıkışlar vardır. Hepsi aynı soruya cevap verir: \"Şu an durum ne ve ne yapmalıyım?\" Bu hafta öğrendiklerini birleştirip böyle bir paneli kuracaksın. Gaz ve alev sensörleri hep birlikte çalışacak, panel üç seviyeli alarm verecek ve ekranda durumu gösterecek.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **51. ders:** İki eşikle histerezis; durum değerleri titremesin.\n- **53. ders:** MQ-2 için ısınma ve temiz havada baz değer; eşikler bazın katı olarak.\n- **54. ders:** `enum Seviye` ve her sensör için aynı `seviyeBul` fonksiyonu.\n- **Modül 3:** `millis()` ile bloklamayan kod (27), röle (24), I2C LCD (32-33), buzzer (18), NTC ile sıcaklık (13).\n\nPanel üç sensörden gelen seviyelerin **en kötüsünü** genel durum yapar. Genel durum üç şeyi sürer: LED'ler, buzzer ve ekran. Röle ayrıca gaz seviyesine bağlıdır.\n\n### Güvenlik notu\n- Gerçek bir rölede şebeke gerilimi (220 V) ile devre kurulmaz. Bu projede röle yalnızca 5 V'luk bir LED'i sürer; havalandırma fanını bu LED simgeler.\n- Bu derste gerçek gaz ve alev yoktur; sensör değerlerini özellik panelinden verirsin. Gerçek can ve mal güvenliği için sertifikalı alarm cihazları kullanılır; bu proje eğitim amaçlıdır.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| MQ-2 gaz sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** |\n| Alev sensörü modülü | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A1** |\n| NTC termistör (isteğe bağlı) | Uç **1** → **A2**, uç **2** → **GND** |\n| Direnç (10000 Ω; NTC için) | Uç **1** → **5V**, uç **2** → **A2** |\n| Direnç (330 Ω) + LED (normal; rengi yeşil) | **D11** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n| Direnç (330 Ω) + LED (uyarı; rengi sarı) | **D12** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n| Direnç (330 Ω) + LED (tehlike; rengi kırmızı) | **D13** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n| Buzzer (özellik panelinden **Tür: Aktif**) | **+** → **D8**, **-** → **GND** |\n| Röle modülü | **VCC** → **5V**, **GND** → **GND**, **IN** → **D7** |\n| Havalandırma fanı yerine direnç (330 Ω) + LED | Röle **COM** → **5V**; röle **NO** → direncin ucu **1**; direncin ucu **2** → LED **A**; LED **K** → **GND** |\n| I2C LCD 16x2 | **SDA** → **A4**, **SCL** → **A5**, **VCC** → **5V**, **GND** → **GND** (adres 0x27) |\n\nNTC'yi tuvale eklemeyeceksen programda `ISI_VAR = false` yap; A2 boş kalırsa rastgele değerler okunur ve laboratuvar \"boşta giriş\" uyarısı verir. Alev sensörünün yönü farklıysa 54. dersteki gibi `ALEVDE_DUSER` değerini değiştir; laboratuvardaki alev modülünde alevde değer düşer, yani `true` doğrudur. Röle ters çalışıyorsa `HIGH` ile `LOW` yerlerini değiştir ya da rölenin **Tetik** özelliğine bak.\n\n### Seviyeler ve çıkışlar\n| Genel durum | LED | Buzzer (D8) | Röle (D7, fan) | Ekran satırı |\n|---|---|---|---|---|\n| NORMAL | Yeşil | Sessiz | Gaz NORMAL ise kapalı | `DURUM: NORMAL` |\n| UYARI | Sarı | Yavaş bip (saniyede bir kısa) | Gaz UYARI/TEHLIKE ise açık | `DURUM: UYARI` |\n| TEHLIKE | Kırmızı | Sürekli | Gaz UYARI/TEHLIKE ise açık | `DURUM: TEHLIKE` |\n\nÜç sensörün seviyeleri `seviyeBul` ile ayrı ayrı bulunur:\n\n| Sensör | Büyüklük | UYARI aç / kapat | TEHLIKE aç / kapat |\n|---|---|---|---|\n| Gaz (A3) | okuma, baz değere göre | baz×1,5 / baz×1,25 | baz×2,5 / baz×2 |\n| Alev (A1) | şiddet (54. ders) | 300 / 250 | 600 / 500 |\n| Isı (A2, isteğe bağlı) | °C (tam sayı) | 45 / 42 | 60 / 55 |\n\nRöle gaz seviyesine bağlıdır: gaz temiz havaya dönene kadar (gaz seviyesi NORMAL olana kadar) fan çalışır. Röle ayrı bir histerezis gerektirmez; çünkü gaz seviyesinin kendisi zaten histerezislidir.\n\nPanel açılınca önce **ısınma** yapar (ekranda \"ISINMA\"), sonra temiz havada gaz baz değerini ölçer. Laboratuvarda ısınmayı kısa tuttuk (4 saniye); gerçek MQ-2 için çok daha uzun bir süre kullan. Isınma ve baz ölçümü bitene kadar (yaklaşık 5 saniye) **Gaz düzeyi** 0'da kalmalı; bu durumda `gazBaz` yaklaşık 102 olur.\n\nPaneli denemek için ısınma bittikten sonra özellik panelinden şu değerleri ver:\n\n| Ne yapmak istiyorsun | Değer |\n|---|---|\n| Gaz UYARI | MQ-2 **Gaz düzeyi** 0,1 (okuma yaklaşık 194; eşik yaklaşık 153) |\n| Gaz TEHLIKE | MQ-2 **Gaz düzeyi** 0,3 (okuma yaklaşık 379; eşik yaklaşık 255) |\n| Alev UYARI | Alev sensörü **Alev şiddeti** 0,4 (şiddet yaklaşık 389; eşik 300) |\n| Alev TEHLIKE | Alev sensörü **Alev şiddeti** 0,8 (şiddet yaklaşık 777; eşik 600) |\n| Isı UYARI / TEHLIKE | NTC **Sıcaklık** 50 °C / 70 °C |\n\n### Program\n```cpp\n// sketch: yangin_gaz_paneli\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nconst int ALEV_PIN = A1;\nconst int NTC_PIN = A2;\nconst int GAZ_PIN = A3;\nconst int LED_YESIL = 11;\nconst int LED_SARI = 12;\nconst int LED_KIRMIZI = 13;\nconst int BUZZER = 8;\nconst int ROLE = 7;\n\nconst bool ALEVDE_DUSER = true;\nconst bool ISI_VAR = true;\nconst unsigned long ISINMA_MS = 4000;     // ders için kısa; gerçekte çok daha uzun\nconst unsigned long OLCUM_ARALIGI = 100;  // ms\nconst unsigned long EKRAN_ARALIGI = 250;  // ms\n\nenum Seviye { NORMAL, UYARI, TEHLIKE };\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nSeviye gaz = NORMAL;\nSeviye alev = NORMAL;\nSeviye isi = NORMAL;\nSeviye genel = NORMAL;\nint gazBaz = 100;\nint gazDeger = 0;\nint alevDeger = 0;\nint isiDeger = 25;\nunsigned long sonOlcum = 0;\nunsigned long sonEkran = 0;\n\nint ortalama(int pin) {\n  long toplam = 0;\n  for (int i = 0; i < 4; i++) {\n    toplam += analogRead(pin);\n  }\n  return toplam / 4;\n}\n\nint alevSiddeti() {\n  int ham = ortalama(ALEV_PIN);\n  return ALEVDE_DUSER ? 1023 - ham : ham;\n}\n\nint sicaklikOku() {\n  long toplam = 0;\n  for (int i = 0; i < 8; i++) {\n    toplam += analogRead(NTC_PIN);\n  }\n  float adc = toplam / 8.0;\n  if (adc < 1.0) adc = 1.0;\n  if (adc > 1022.0) adc = 1022.0;\n  float direnc = 10000.0 * adc / (1023.0 - adc);\n  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);\n  return (int)(kelvin - 273.15 + 0.5);\n}\n\nSeviye seviyeBul(Seviye simdiki, int deger,\n                 int uyariAc, int uyariKapat,\n                 int tehlikeAc, int tehlikeKapat) {\n  if (simdiki == NORMAL) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger >= uyariAc) return UYARI;\n    return NORMAL;\n  }\n  if (simdiki == UYARI) {\n    if (deger >= tehlikeAc) return TEHLIKE;\n    if (deger < uyariKapat) return NORMAL;\n    return UYARI;\n  }\n  if (deger < tehlikeKapat) {\n    return (deger >= uyariKapat) ? UYARI : NORMAL;\n  }\n  return TEHLIKE;\n}\n\nSeviye enKotu(Seviye a, Seviye b) {\n  return (a > b) ? a : b;\n}\n\nconst char* seviyeAdi(Seviye s) {\n  if (s == UYARI) return \"UYARI  \";\n  if (s == TEHLIKE) return \"TEHLIKE\";\n  return \"NORMAL \";\n}\n\nchar seviyeHarfi(Seviye s) {\n  if (s == UYARI) return 'U';\n  if (s == TEHLIKE) return 'T';\n  return 'N';\n}\n\nvoid gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {\n  if (eski == yeni) return;\n  Serial.print(ad);\n  Serial.print(\": \");\n  Serial.print(seviyeAdi(yeni));\n  Serial.print(\" deger=\");\n  Serial.println(deger);\n}\n\nvoid seviyeleriGuncelle() {\n  gazDeger = ortalama(GAZ_PIN);\n  alevDeger = alevSiddeti();\n\n  Seviye yeniGaz = seviyeBul(gaz, gazDeger,\n                             gazBaz * 3 / 2, gazBaz * 5 / 4,\n                             gazBaz * 5 / 2, gazBaz * 2);\n  Seviye yeniAlev = seviyeBul(alev, alevDeger, 300, 250, 600, 500);\n  Seviye yeniIsi = isi;\n  if (ISI_VAR) {\n    isiDeger = sicaklikOku();\n    yeniIsi = seviyeBul(isi, isiDeger, 45, 42, 60, 55);\n  }\n\n  gecisYaz(\"GAZ\", gaz, yeniGaz, gazDeger);\n  gecisYaz(\"ALEV\", alev, yeniAlev, alevDeger);\n  gecisYaz(\"ISI\", isi, yeniIsi, isiDeger);\n  gaz = yeniGaz;\n  alev = yeniAlev;\n  isi = yeniIsi;\n\n  Seviye yeniGenel = enKotu(gaz, enKotu(alev, isi));\n  if (yeniGenel != genel) {\n    genel = yeniGenel;\n    Serial.print(\"DURUM: \");\n    Serial.println(seviyeAdi(genel));\n  }\n}\n\nvoid ciktilariSur(unsigned long simdi) {\n  digitalWrite(LED_YESIL, genel == NORMAL);\n  digitalWrite(LED_SARI, genel == UYARI);\n  digitalWrite(LED_KIRMIZI, genel == TEHLIKE);\n\n  bool bip = false;\n  if (genel == TEHLIKE) {\n    bip = true;                          // sürekli\n  } else if (genel == UYARI) {\n    bip = (simdi % 1000) < 150;          // saniyede bir kısa bip\n  }\n  digitalWrite(BUZZER, bip);\n\n  digitalWrite(ROLE, gaz != NORMAL);     // fan: gaz temizlenene kadar\n}\n\nvoid ekranYaz() {\n  lcd.setCursor(0, 0);\n  lcd.print(\"DURUM: \");\n  lcd.print(seviyeAdi(genel));\n  lcd.print(\"  \");\n  lcd.setCursor(0, 1);\n  lcd.print(\"G:\");\n  lcd.print(seviyeHarfi(gaz));\n  lcd.print(\" A:\");\n  lcd.print(seviyeHarfi(alev));\n  lcd.print(\" I:\");\n  lcd.print(ISI_VAR ? seviyeHarfi(isi) : '-');\n  lcd.print(\"     \");\n}\n\nvoid setup() {\n  pinMode(LED_YESIL, OUTPUT);\n  pinMode(LED_SARI, OUTPUT);\n  pinMode(LED_KIRMIZI, OUTPUT);\n  pinMode(BUZZER, OUTPUT);\n  pinMode(ROLE, OUTPUT);\n  digitalWrite(ROLE, LOW);\n  Serial.begin(9600);\n\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print(\"ISINMA...       \");\n  lcd.setCursor(0, 1);\n  lcd.print(\"Temiz havada kal\");\n\n  while (millis() < ISINMA_MS) {\n    digitalWrite(LED_YESIL, (millis() / 250) % 2);   // yanıp söner\n  }\n\n  long toplam = 0;\n  for (int i = 0; i < 32; i++) {\n    toplam += analogRead(GAZ_PIN);\n    delay(20);\n  }\n  gazBaz = toplam / 32;\n  if (gazBaz < 20) gazBaz = 20;\n  Serial.print(\"gazBaz=\");\n  Serial.println(gazBaz);\n\n  seviyeleriGuncelle();\n  ciktilariSur(millis());\n  ekranYaz();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - sonOlcum >= OLCUM_ARALIGI) {\n    sonOlcum = simdi;\n    seviyeleriGuncelle();\n  }\n\n  ciktilariSur(simdi);\n\n  if (simdi - sonEkran >= EKRAN_ARALIGI) {\n    sonEkran = simdi;\n    ekranYaz();\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup` önce ekranı açar ve ısınmayı bekler. Bu sırada yeşil LED yanıp söner. Sonra temiz havada 32 ölçümün ortalaması `gazBaz` olur.\n2. Her 100 ms'de bir `seviyeleriGuncelle()` üç sensörü okur ve **aynı** `seviyeBul` fonksiyonunu üç kez farklı eşiklerle çağırır. Yeni sensör eklemek tek satırdır.\n3. `genel`, üç seviyenin `enKotu` değeridir. Bir sensör TEHLIKE derse panel TEHLIKE olur; hepsi NORMAL olduğunda panel NORMAL olur.\n4. Seviyeler çıkışları doğrudan belirler (`ciktilariSur`). Çıkışları başka yerde değiştiren kod yoktur; bu, durum makinelerinde hataları azaltır.\n5. Yavaş bip `simdi % 1000 < 150` ile yapılır: her saniyenin ilk 150 ms'inde buzzer çalar. `delay` yoktur, `loop` hep döner.\n6. Dönüş (TEHLIKE → UYARI → NORMAL) her sensörde histerezisle olur. Değer eşiğe yakın oynarsa seviye ve çıkışlar titremez.\n7. Röle yalnızca **gaz** seviyesine bağlıdır. Panel TEHLIKE olsa bile gaz NORMAL ise (örneğin alev var, gaz yok) fan çalışmaz.\n8. Ekran 250 ms'de bir yenilenir; `lcd.print` ile her satırın sonunda boşluk basılır, böylece eski karakterler kalmaz.\n9. Seri monitör yalnızca seviye değişince yazar; olay günlüğü gibi okunur.\n\n### Dene\n- `ISI_VAR = false` yap ve NTC'yi (ile direncini) tuvalden sil. Panel yalnız gaz ve alevle çalışıyor mu? Ekranın ikinci satırında ne görüyorsun?\n- Alev sensörünün yönünü bozup `ALEVDE_DUSER = false` yap. Normal ortamda panel nasıl davranır?\n- UYARI için buzzer desenini değiştir: 100 ms çalsın, 400 ms sussun (`simdi % 500 < 100`). TEHLIKE için \"iki kısa bip, bir boşluk\" deseni yazabilir misin?\n- NTC'nin A2 kablosunu silersen ne olur? (İpucu: `adc` değerinin uç değerlerini kontrol et.) Panele \"SENSOR HATASI\" seviyesi ekler misin?\n\n### Sık yapılan hatalar\n- Isınmayı ve bazı atlamak: panel ya sürekli alarm verir ya da hiç vermez.\n- Bazı gazlı ortamda ölçmek: eşikler çok yukarıda kalır, gerçek bir gaz artışı alarm vermez.\n- Kapama eşiğini açma eşiğiyle aynı yapmak: seviye ve buzzer titrer.\n- `NORMAL` ve `UYARI` için aynı çıkışı kullanıp birini diğerinden ayırt edememek.\n- Röleyi şebeke gerilimiyle kullanmak: bu projede kesinlikle yapma.\n- Çıkışları (LED, buzzer, röle) farklı yerlerden sürmek: seviye ile çıkışlar birbirinden kopar.\n- Gerçek devrede sensörü doğrudan güneş ışığına ya da ısıtıcıya bakacak şekilde yerleştirmek: yanlış alarm verir (laboratuvar bunu modellemez).",
          "question": "Gaz algılandığında fanı çalıştırmak mantıklı, ama yangın varken (alev TEHLIKE) fan aynı davranmalı mı? Gerçek bir panoda hangi kuralları kim belirler? Bu sorulara cevap vermeden önce hangi bilgilere ihtiyacın var?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir alarm panelini **girdi, karar, çıktı** katmanlarına ayırmayı\n- Üç sensörün seviyelerinden genel durumu `enKotu` ile bulmayı\n- Çıkışların (LED, buzzer, röle, ekran) hepsini seviyeden türetmenin neden güvenli olduğunu\n- Paneli bir test tablosuyla denemeyi ve sınırlarını açıkça söylemeyi\n\n### Önceden bilmen gerekenler\n- 51. ders: Histerezis, iki eşik.\n- 53. ders: MQ-2 ısınma, baz değer, bazın katı olarak eşik.\n- 54. ders: `enum Seviye`, `seviyeBul` ve `enKotu`.\n- 13. ders: NTC ile sıcaklık. 18. ders: buzzer. 24. ders: röle. 27. ders: `millis()`. 32-33. dersler: I2C LCD.\n\n### Panelin üç katmanı\nBir yangın panosunun içi şöyle düşünülebilir:\n\n```\nGİRDİ        KARAR              ÇIKTI\nGaz (A3)  -> seviyeBul -> gaz   \\\nAlev (A1) -> seviyeBul -> alev   > enKotu -> genel -> LED, buzzer, ekran\nIsı (A2)  -> seviyeBul -> isi   /\n                          gaz -> röle (fan)\n```\n\nHer sensör için aynı `seviyeBul` fonksiyonu farklı eşiklerle çağrılır. Yeni sensör eklemek tek satırdır.\n\n### Eşikler\n| Sensör | Büyüklük | UYARI aç / kapat | TEHLIKE aç / kapat |\n|---|---|---|---|\n| Gaz | okuma, bazın katı | baz × 1,5 / × 1,25 | baz × 2,5 / × 2 |\n| Alev | şiddet | 300 / 250 | 600 / 500 |\n| Isı | °C | 45 / 42 | 60 / 55 |\n\nSanal gaz modülünde baz yaklaşık 102 olduğundan gaz için eşikler yaklaşık 153 / 127 ve 255 / 204 olur.\n\n### Çıkışlar seviyeden türetilir\nÇıkışları kodun farklı yerlerinden değiştirirsen, seviye ile çıkış bir gün birbirinden kopar: ekran TEHLIKE derken buzzer susar. Bu yüzden tek bir fonksiyon (`ciktilariSur`) her turda seviyeye bakıp tüm çıkışları ayarlar.\n\n- **NORMAL:** yeşil LED, sessiz.\n- **UYARI:** sarı LED, saniyede bir kısa bip (`simdi % 1000 < 150`).\n- **TEHLIKE:** kırmızı LED, sürekli ses.\n- **Röle (fan):** yalnız **gaz** seviyesine bağlıdır. Gaz NORMAL olana kadar fan çalışır; alev tek başına fanı açmaz.\n\nEkran, panelin \"neden\" sorusunu cevaplar: ikinci satırda `G:N A:U I:N` gibi her sensörün harfi görünür.\n\n### Bloklamayan akış\nPanel `delay` kullanmaz. Ölçüm 100 ms'de bir, ekran 250 ms'de bir yenilenir; geri kalan zamanda `loop` dönüp çıkışları tazeler. Böylece bip deseni de, ekran da, ölçüm de aynı anda çalışır.\n\n### Güvenlik ve sınırlar\nRöle yalnızca 5 V'luk bir LED'i sürer; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Bu panel eğitim amaçlıdır ve sertifikalı bir gaz ya da yangın dedektörünün yerini tutmaz. Isınma beklenmeli, baz temiz havada ölçülmelidir.\n\n### Özet\nPanel, sensörlerden seviye bulur, seviyelerin en kötüsünü genel durum yapar ve tüm çıkışları bu durumdan türetir. Röle ayrı bir kuralla gaza bağlıdır. Isınma, baz ölçümü ve histerezis hatalı alarmları azaltır. Panelin sınırları (eğitim amaçlı olması) açıkça söylenmelidir.",
          "concepts": [
            {
              "term": "Girdi - karar - çıktı",
              "definition": "Alarm panelini sensör okuma, seviye bulma ve çıkışları sürme olarak üç ayrı katmana bölmek.",
              "example": "analogRead değerleri seviyeBul'a girer, genel seviye ciktilariSur'a gider.",
              "pitfall": "Okuma, karar ve çıkışı aynı kod bloğunda karıştırmak: bir yeri değiştirince başka yer bozulur."
            },
            {
              "term": "Genel durum (enKotu)",
              "definition": "Üç sensörün seviyelerinden en yüksek olanı panelin durumu yapmak.",
              "example": "Gaz NORMAL, alev UYARI, ısı TEHLIKE ise genel durum TEHLIKE'dir.",
              "pitfall": "Bir sensörü hesaba katmamak: o sensör tehlikede olsa bile panel NORMAL gösterir."
            },
            {
              "term": "Çıkışları seviyeden türetmek",
              "definition": "LED, buzzer, röle ve ekranı tek bir fonksiyonda, yalnız seviyeye bakarak sürmek.",
              "example": "ciktilariSur() her turda genel seviyeye göre LED, buzzer ve röleyi ayarlar.",
              "pitfall": "Çıkışları farklı yerlerden sürmek: seviye ile çıkış kopar, ekran TEHLIKE derken buzzer susar."
            },
            {
              "term": "Bloklamayan bip deseni",
              "definition": "millis() kalanıyla (simdi % 1000 < 150) delay olmadan aralıklı ses üretmek.",
              "example": "Her saniyenin ilk 150 ms'inde buzzer çalar, kalan 850 ms susar.",
              "pitfall": "Bip için delay kullanmak: bu sırada sensör okunmaz, ekran güncellenmez."
            },
            {
              "term": "Röle kuralı (gaz için fan)",
              "definition": "Fan yalnız gaz seviyesi NORMAL olana kadar çalışır; alev tek başına fanı açmaz.",
              "example": "Alev TEHLIKE, gaz NORMAL ise kırmızı LED yanar ama röle kapalı kalır.",
              "pitfall": "Röleyi bu kurala bakmadan genel duruma bağlamak: yangında fanın çalışması istenmeyebilir; bu bir tasarım kararıdır ve sorgulanmalıdır."
            },
            {
              "term": "Eğitim amaçlı sınır",
              "definition": "Bu panel sertifikalı bir gaz ya da yangın dedektörünün yerini tutmaz.",
              "example": "Panel röleyle yalnızca 5 V'luk bir LED sürer; şebeke gerilimi kullanılmaz.",
              "pitfall": "Devreyi gerçek can ve mal güvenliği için tek başına kullanmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h4d5-q1",
              "kind": "mcq",
              "prompt": "Panelde gaz NORMAL, ısı NORMAL, ama alev sensörü TEHLIKE seviyesinde. Çıkışlar ne durumdadır?",
              "options": [
                "Yeşil LED yanık, buzzer sessiz, röle açık",
                "Sarı LED yanık, saniyede bir bip, röle açık",
                "Kırmızı LED yanık, buzzer sürekli, röle kapalı",
                "Kırmızı LED yanık, buzzer sessiz, röle açık"
              ],
              "answer": 2,
              "explanation": "Genel durum en kötü seviyedir: TEHLIKE. Bu yüzden kırmızı LED yanar ve buzzer sürekli çalar. Röle yalnızca gaz seviyesine bağlıdır; gaz NORMAL olduğu için fan çalışmaz. Diğer seçenekler genel durumu ya da röle kuralını yanlış uygular.",
              "skills": [
                "alarm-design",
                "sens-levels"
              ]
            },
            {
              "id": "m4h4d5-q2",
              "kind": "numeric",
              "prompt": "Gaz için TEHLIKE kapama eşiği baz × 2'dir (tamsayı hesap). Sanal MQ-2'de temiz havada baz 102 ölçüldü. Gaz TEHLIKE'den UYARI'ya inmek için okuma hangi değerin altına düşmelidir?",
              "answer": 204,
              "tolerance": 0,
              "explanation": "tehlikeKapat = gazBaz × 2 = 102 × 2 = 204. TEHLIKE seviyesindeyken okuma 204'ün altına inince UYARI'ya geçilir. TEHLIKE açma eşiği ise 102 × 5 / 2 = 255'tir; iki eşik arasındaki 204-255 bölgesi histerezis bandıdır.",
              "skills": [
                "sens-levels",
                "sens-baseline"
              ]
            },
            {
              "id": "m4h4d5-q3",
              "kind": "predict-output",
              "prompt": "UYARI seviyesinde buzzer deseni (simdi % 1000) < 150 ile belirleniyor. millis() değeri sırayla 2100, 2200, 2999 ve 3050 iken buzzer durumu (1 = çalıyor) yazdırılıyor. Bu kod ne yazar?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  unsigned long t[] = {2100, 2200, 2999, 3050};\n  for (int i = 0; i < 4; i++) {\n    bool bip = (t[i] % 1000) < 150;\n    Serial.print(bip ? 1 : 0);\n  }\n}\n```",
              "options": [
                "0110",
                "1111",
                "0000",
                "1001"
              ],
              "answer": 3,
              "explanation": "2100 % 1000 = 100 < 150 olduğu için 1. 2200 % 1000 = 200 ≥ 150 olduğu için 0. 2999 % 1000 = 999 olduğundan 0. 3050 % 1000 = 50 < 150 olduğundan 1. Çıktı 1001'dir: her saniyenin ilk 150 ms'i bip, kalanı sessizdir.",
              "skills": [
                "alarm-design",
                "prog-timing"
              ]
            },
            {
              "id": "m4h4d5-q4",
              "kind": "find-bug",
              "prompt": "NTC 70 °C gösteriyor ve ısı seviyesi TEHLIKE olarak bulunuyor, ama panel NORMAL gösterip sessiz kalıyor. Hata nerede?\n\n```\ngaz = yeniGaz;\nalev = yeniAlev;\nisi = yeniIsi;\n\nSeviye yeniGenel = enKotu(gaz, alev);\nif (yeniGenel != genel) {\n  genel = yeniGenel;\n}\n```",
              "options": [
                "gaz = yeniGaz; satırı gereksiz",
                "genel değişkeni global olmamalı",
                "enKotu enum karşılaştıramaz",
                "enKotu(gaz, alev) isi seviyesini hesaba katmıyor"
              ],
              "answer": 3,
              "explanation": "Genel durum üç sensörün en kötüsü olmalıdır: enKotu(gaz, enKotu(alev, isi)). Isı hesaba katılmadığı için TEHLIKE seviyesindeki sensör genel duruma yansımaz ve çıkışlar susar. enum değerleri sayı gibi karşılaştırılabilir ve diğer satırlar doğrudur.",
              "skills": [
                "alarm-design",
                "prog-debug"
              ]
            },
            {
              "id": "m4h4d5-q5",
              "kind": "mcq",
              "prompt": "Panel yanlışlıkla Gaz düzeyi 0,3 iken açıldı; baz yaklaşık 379 ölçüldü. Sonra gaz 0,6'ya çıktı (okuma yaklaşık 655). Temiz havada baz 102 olsaydı bu okuma TEHLIKE sayılırdı (eşik 255). Bu panel şimdi hangi seviyeyi gösterir?",
              "options": [
                "NORMAL",
                "UYARI",
                "TEHLIKE",
                "Hata verir"
              ],
              "answer": 1,
              "explanation": "Baz 379 ise UYARI açma eşiği 379 × 3 / 2 = 568, TEHLIKE açma eşiği 379 × 5 / 2 = 947'dir. 655 yalnızca UYARI eşiğini aşar. Baz gazlı ortamda ölçüldüğü için eşikler yukarı kayar ve gerçek bir tehlike hafife alınır. Bu yüzden baz temiz havada, ısınmadan sonra ölçülür; bu panel ayrıca eğitim amaçlıdır ve gerçek güvenlik için kullanılmaz.",
              "skills": [
                "sens-baseline",
                "safety-sensors"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Hareket ve yön",
      "project": "Eğimle kontrol edilen servo",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Joystick'in iki potansiyometre ve bir düğmeden oluştuğunu söyleyebilir; orta noktayı ölçüp ölü bölge koyarak ham değeri -100...+100 aralığına çevirebilir.\n2. Döner enkoderde CLK ve DT sinyalinden dönüş yönünü bulabilir; sayacı kesme ve `volatile` ile tutabilir, sıçrama filtresinin neden gerektiğini açıklayabilir.\n3. MPU6050'yi yazmaçlarla okuyabilir, ham değeri g ve °/s'ye çevirebilir, `atan2` ile eğim açısı hesaplayabilir.\n4. Jiroskop sapmasının neden hata biriktirdiğini açıklayabilir ve tamamlayıcı filtreyle iki sensörü birleştirebilir.\n5. Eğimi ters yönde servoya çeviren, `millis` ile bloklamayan bir mini gimbal kurabilir.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 25-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Joystick: iki eksen ve düğme | ~25 dk | Anlatımı oku, ham değerleri izle, merkezi ve ölü bölgeyi dene, mini testi çöz. |\n| 2 | Döner enkoder (quadrature) ve kesme | ~25 dk | CLK/DT durum tablosunu çiz, sayacı çalıştır, sıçrama eşiğini değiştir. |\n| 3 | MPU6050: ivmeölçer ve eğim açısı (I2C) | ~30 dk | Yazmaç okumayı dene, ham değeri g'ye çevir, pitch ve roll'u hesapla. |\n| 4 | Jiroskop sapması ve tamamlayıcı filtre | ~30 dk | Sapmayı ölç, integralin kaymasını gör, ALFA değerini değiştir. |\n| 5 | Proje: El eğimiyle kontrol edilen servo (mini gimbal) | ~35 dk | Devreyi kur, programı çalıştır, projeyi ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta önceki haftalardan şunlar gerekir. Başlamadan önce kontrol et:\n- `INPUT_PULLUP` ve basılı düğmenin `LOW` okunduğunu biliyor mu? (ders 6)\n- Kenar algılama ve buton sıçramasını anlıyor mu? (ders 8)\n- `analogRead` ile 0-1023 değerini okuyup `map` ile ölçekleyebiliyor mu? (ders 11 ve 14)\n- Servo açısını ve `millis` ile bloklamayan döngüyü biliyor mu? (ders 21 ve 27)\n- `attachInterrupt`, ISR ve `volatile` kavramlarını biliyor mu? (ders 29)\n- I2C'de SDA, SCL ve cihaz adresini biliyor mu? (ders 33)\n\n### Kavram haritası\n- **Analog girdi:** joystick (iki gerilim bölücü) → merkez → ölü bölge → `map` ile -100...+100\n- **Sayma:** enkoder → CLK ve DT (90 derece fark) → yön kuralı → kesme ve `volatile` → sıçrama filtresi\n- **Hareket algılama:** MPU6050 → yazmaç (0x6B, 0x3B) → ham → g ve °/s → `atan2` ile açı\n- **Sensör birleştirme:** ivmeölçer (kaymaz, gürültülü) + jiroskop (hızlı, kayar) → tamamlayıcı filtre (`ALFA`)\n- **Proje:** açı → ofset → servo = 90 − eğim → `constrain` → `millis` ile işler → açık çevrim\n\n### Sık yapılan hatalar\n- **Merkezi sabit 512 yazmak ya da ölü bölge koymamak.** Kol bırakılmışken değer dalgalanır.\n- **Kol itilmişken programı başlatmak.** Merkez yanlış ölçülür.\n- **CLK'yı kesme pinine (D2, D3) bağlamamak.** `attachInterrupt` çalışmaz.\n- **`sayac`'ı `volatile` yapmamak ya da ISR içinde `Serial.print` / `delay` kullanmak.**\n- **Sıçrama eşiğini çok büyük seçmek.** Hızlı çevirirken gerçek tıklar da atılır.\n- **MPU6050'yi `0x6B` yazmacına 0 yazmadan okumak.** Çip uykuda kalır.\n- **`ax / 16384` yazmak.** Tam sayı bölmesi 0 verir; `16384.0` yaz.\n- **Baytları işaretsiz birleştirmek.** Negatif değer 65000 gibi görünür; `int16_t` kullan.\n- **MPU6050 ile RTC'yi aynı hatta kullanmak.** İkisi de 0x68 adresindedir.\n- **Hareket anında ivmeölçer açısına güvenmek.** Çip eğilmeden `ax` = 0,3 g bile yaklaşık 16,7 derece gösterir.\n- **`dt`'yi milisaniye ya da sabit yazmak.** Integral 1000 kat bozulur ya da süre değişince kayar.\n- **Sapma ölçerken çipi oynatmak.** Bütün açı kayar.\n- **Gimbalde `delay` kullanmak ve servoyu sınırlamamak.** Düğme kaçar, servo mekanik uca dayanır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Joystick programını bakmadan yaz: merkez ölç, ölü bölge ekle, `map` ile ölçekle.\n4. Enkoder için kâğıda iki yönün 11, 01, 00, 10 tablosunu çiz ve \"CLK düşerken DT\" kuralını kendi cümlenle anlat.\n5. `ALFA` değerini 0,90, 0,98 ve 0,999 yaparak filtrenin titreşime ve kaymaya tepkisini karşılaştır; zaman sabitini `ALFA · dt / (1 − ALFA)` ile hesapla.\n6. Şu soruyu kendi cümlelerinle cevapla: \"İvmeölçer ve jiroskop neden birlikte kullanılır?\"\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Mini gimbal)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | MPU6050 ya da servo çalışmıyor, SDA/SCL karışık | MPU6050, LCD, servo ve düğme doğru pinlerde; RTC yok | Düzenli bağlantılar, servo gücünün neden ayrı olması gerektiğini açıklıyor |\n| Ölçüm ve filtre | Yalnız ivmeölçer kullanıyor; açı titriyor | Sapma ölçülüyor, tamamlayıcı filtre çalışıyor | `ALFA` değerini deneyip etkisini açıklıyor |\n| Kontrol | Servo eğimle aynı yönde dönüyor ya da sınırsız | Servo ters yönde dönüyor, 10...170 ile sınırlı, düğme sıfırlıyor | Sınır LED'i çalışıyor, roll ekseni gibi bir geliştirme var |\n| Zamanlama | `delay` kullanıyor; düğme kaçıyor | `millis` ile bloklamayan döngü var | `dt`'yi `micros` ile hesaplıyor ve nedenini açıklıyor |\n| Anlatım | Ne yaptığını anlatamıyor | Sensörden servoya veri akışını adım adım anlatıyor | Açık çevrimin sınırını ve nasıl iyileştirilebileceğini anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta formül ezberlemek değil, bir sensörün kusurlu olduğunu ve kusurunu başka bir sensörle kapatmayı görmektir. \"İvmeölçer neden yanılıyor?\" sorusu haftanın ana sorusudur.\n- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine sor: \"Sensör şu an tam olarak neyi ölçüyor?\", \"Birimler uyumlu mu: derece mi radyan mı, ms mi s mi?\", \"Hangi satır çip uykudayken de çalışırdı?\"\n- **Matematik.** `atan2` ve filtre formülü zor görünebilir. Önce değerleri laboratuvardan değiştirip sonucu izlemek, sonra formüle bakmak daha kolaydır. Hesaplamalar dört işlem ve basit oran düzeyindedir.\n- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Haftanın 3. ve 4. dersi arasında bir gün ara vermek iyi olur.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kartla çalışılırsa servoyu ayrı 5 V kaynaktan besle ve GND'leri ortak yap; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Joystick: iki eksen ve düğme",
          "durationMin": 25,
          "problem": "Oyun kolunu tuttuğunda parmağın hem sağa-sola hem yukarı-aşağı gidebilir, üstelik ne kadar ittiğin de önemlidir. Bir buton yalnızca \"bastı / basmadı\" der. Joystick ise aynı anda iki sayı ve bir düğme verir. Peki bu iki sayı, kol bıraktığında neden tam sıfır değil de \"yaklaşık orta\" bir değer çıkar?",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Joystick VCC | 5V |\n| Joystick GND | GND |\n| Joystick VRX (X ekseni) | **A0** |\n| Joystick VRY (Y ekseni) | **A1** |\n| Joystick SW (düğme) | **D2** (`INPUT_PULLUP`) |\n| Direnç (330 Ω) 1 | **D13** |\n| Direnç 2 | LED **A** (anot) |\n| LED **K** (katot) | GND |\n\nJoystick'i seçince sağ panelde **X ekseni**, **Y ekseni** (0 ile 1 arası) ve **Düğme basılı** özellikleri çıkar; bunları program çalışırken de değiştirebilirsin. Direncin değerini özellik panelinden 330 Ω yap.\n\nJoystick aslında birbirine dik iki **potansiyometredir** (11. ders) ve basılabilen bir düğmedir. Kol ortadayken her potansiyometrenin silgisi yaklaşık yarıda durur, yani `analogRead` yaklaşık 512 verir. Kolu ucuna kadar itince değer 0'a ya da 1023'e yaklaşır. SW düğmesi basılınca GND'ye bağlanır; `INPUT_PULLUP` (6. ders) kullandığımız için basılı düğme `LOW` okunur.\n\nGerçek modüllerde yön yazıları üreticiye göre değişir; hangi yönün artı olduğunu ilk programla denerek bulursun. Laboratuvarda X (ya da Y) özelliği büyüdükçe `analogRead` değeri de büyür.\n\n### Program 1: Ham değerleri oku\n```cpp\n// sketch: joystick_ham\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(2, INPUT_PULLUP);\n}\n\nvoid loop() {\n  int x = analogRead(A0);\n  int y = analogRead(A1);\n  int basili = (digitalRead(2) == LOW) ? 1 : 0;   // 1 = düğmeye basılı\n\n  Serial.print(\"X=\");\n  Serial.print(x);\n  Serial.print(\" Y=\");\n  Serial.print(y);\n  Serial.print(\" BUTON=\");\n  Serial.println(basili);\n  delay(200);\n}\n```\n▶'e bas ve seri monitörü izle. Joystick'in **X ekseni** özelliği 0,5 iken `X` yaklaşık 512 çıkar (0,5 × 5 V = 2,5 V). X'i 0'a çek: değer 0'a düşer; 1'e çek: 1023'e çıkar. Y için de aynısını dene. **Düğme basılı** kutusunu işaretlersen `BUTON=1` olur.\n\nGerçek bir modülde kol bırakılmışken X ve Y tam 512 olmaz; örneğin 497 ya da 530 çıkar, çünkü iki potansiyometre de kusursuz yarıda durmaz. Bunu laboratuvarda taklit edebilirsin: X ekseni özelliğini 0,52 yap, değer yaklaşık 532 olur.\n\n### Orta nokta kalibrasyonu ve ölü bölge\n14. derste kalibrasyonu öğrendin. Joystick için iki iş yapılır:\n\n1. **Orta noktayı ölç.** Program açılırken kolun bırakılmış olduğu varsayılır. 16 okumanın ortalaması \"merkez\" olarak saklanır.\n2. **Ölü bölge ekle.** Merkezin etrafında küçük bir aralıkta (burada ±40) değer sıfır sayılır. Böylece elin titremesi ya da potansiyometrenin küçük kayması robotu ya da servoyu oynatmaz.\n\nMerkezden uzaklığı `-100 ... +100` aralığına `map` ile (14. ders) çeviririz. Ölü bölge dışı kısım yeniden ölçeklenir; böylece değer ölü bölgenin hemen dışında 0'dan başlar, aniden 40'a sıçramaz.\n\n### Program 2: Kalibre edilmiş eksenler ve düğmeyle LED\n```cpp\n// sketch: joystick_kalibre\nconst int SW = 2;\nconst int LED = 13;\nconst int OLU_BOLGE = 40;          // merkezin ± bu kadarı sıfır sayılır\n\nint merkezX;\nint merkezY;\nbool ledAcik = false;\nbool oncekiBasili = false;\nunsigned long sonBasis = 0;\nunsigned long sonYazma = 0;\n\nint merkezOlc(int pin) {\n  long toplam = 0;\n  for (int i = 0; i < 16; i++) {\n    toplam += analogRead(pin);\n    delay(2);\n  }\n  return toplam / 16;\n}\n\n// ham değeri -100 ... +100 aralığına çevirir\nint eksen(int ham, int merkez) {\n  int fark = ham - merkez;\n  if (abs(fark) < OLU_BOLGE) return 0;\n  if (fark > 0) {\n    return constrain(map(fark, OLU_BOLGE, 1023 - merkez, 0, 100), 0, 100);\n  }\n  return constrain(map(fark, -OLU_BOLGE, -merkez, 0, -100), -100, 0);\n}\n\nconst char* yonAdi(int x, int y) {\n  if (abs(x) < 30 && abs(y) < 30) return \"ORTA\";\n  if (abs(x) >= abs(y)) return x > 0 ? \"SAG\" : \"SOL\";\n  return y > 0 ? \"YUKARI\" : \"ASAGI\";\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(SW, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n  merkezX = merkezOlc(A0);          // kol bırakılmışken ölç\n  merkezY = merkezOlc(A1);\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // Düğme: basıldığı an LED'in durumunu tersle (kenar algılama + sıçrama önleme)\n  bool basili = (digitalRead(SW) == LOW);\n  if (basili && !oncekiBasili && simdi - sonBasis > 30) {\n    sonBasis = simdi;\n    ledAcik = !ledAcik;\n    digitalWrite(LED, ledAcik);\n  }\n  oncekiBasili = basili;\n\n  // Saniyede beş kez yaz\n  if (simdi - sonYazma >= 200) {\n    sonYazma = simdi;\n    int x = eksen(analogRead(A0), merkezX);\n    int y = eksen(analogRead(A1), merkezY);\n    Serial.print(\"X=\");\n    Serial.print(x);\n    Serial.print(\" Y=\");\n    Serial.print(y);\n    Serial.print(\" YON=\");\n    Serial.println(yonAdi(x, y));\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `merkezOlc` kolu bırakılmışken 16 kez okur ve ortalama alır. Tek okuma yerine ortalama kullanmak gürültüyü azaltır (14. ders).\n2. `eksen` önce merkezden farkı bulur. Fark ölü bölgenin içindeyse 0 döner.\n3. Fark pozitifse `map` ile `OLU_BOLGE ... (1023 − merkez)` aralığı `0 ... 100` aralığına çevrilir. Negatifse `-OLU_BOLGE ... -merkez` aralığı `0 ... -100` olur. Merkez 512 değilse iki yarı farklı uzunlukta olur; böyle yapınca iki uçta da tam ±100'e ulaşırsın.\n4. `constrain` hesaptaki küçük taşmaları keser.\n5. `yonAdi` hangi eksen daha büyükse onu seçer. Gerçek modüllerde Y ekseninin artı yönü modülden modüle değişir; laboratuvarda Y büyüdükçe \"YUKARI\" yazar. Başka bir modülde ters çıkarsa etiketleri değiştirirsin.\n6. Düğme için 8. dersteki kenar algılama kullanıldı: yalnızca basıldığı an bir kez çalışır, basılı tutmak LED'i yanıp söndürmez.\n\n### Dene\n- `OLU_BOLGE` değerini 10 yap, sonra 120 yap. X ekseni özelliğini 0,5'ten başlayıp yavaşça artır: değer hangi noktada sıfırdan ayrılıyor?\n- X ekseni özelliğini 0,8 yap ve **sonra** ▶'e bas (merkez yanlış ölçülür). Ardından X'i 0,5'e getir. Ne olur? Neden?\n- X eksenine göre bir LED'in parlaklığını değiştir (16. ders): kol sağa gittikçe LED parlasın, sola gidince sönük kalsın. D13 bir PWM pini değildir; LED'i D11'e taşı (PWM pinleri 3, 5, 6, 9, 10, 11).\n\n### Sık yapılan hatalar\n- Merkezi sabit 512 yazmak: bir modülde işe yarar, ötekinde robot kol bırakılmışken kayar.\n- Ölü bölge koymamak: kol bırakılmışken değer 510, 514, 509 diye dalgalanır; servo ya da motor titrer.\n- Kol itilmiş durumdayken (X ya da Y 0,5'ten uzakken) ▶'e basmak: merkez yanlış ölçülür.\n- SW pinini `INPUT_PULLUP` yapmamak: düğme bırakılmışken pin havada kalır, rastgele basış okunur (6. ders).\n- Modülün VCC'sini 5V yerine 3V3'e bağlamak: uç değer 1023 yerine yaklaşık 675 olur (3,3 / 5 × 1023), çünkü ADC 5 V'a göre ölçer. Laboratuvarda dene.",
          "question": "Bir drone kumandasında iki joystick vardır ve hiçbiri tam ortada \"sıfır\" vermez. Üretici bu kusuru nasıl çözüyor olabilir? Ölü bölgeyi çok büyük yaparsak kumandanın hissi nasıl değişir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Joystick'in iki potansiyometre ve bir düğmeden oluştuğunu\n- Kol bırakılmışken `analogRead` değerinin neden yaklaşık 512 olduğunu\n- Orta noktayı ölçerek ve ölü bölge koyarak ham değeri -100 ile +100 arasına çevirmeyi\n- Joystick düğmesini `INPUT_PULLUP` ile okumayı\n\n### Önceden bilmen gerekenler\nDers 6'da `INPUT_PULLUP` ve basılı düğmenin `LOW` okunması; ders 8'de kenar algılama; ders 11'de potansiyometre ve `analogRead`; ders 14'te `map` ile kalibrasyon.\n\n### Joystick neyin içinde?\nBir joystick, birbirine dik duran **iki potansiyometre** ile kolun ucundaki **bir düğmeden** oluşur. Modülde beş pin vardır: VCC, GND, VRX (yatay eksen), VRY (dikey eksen) ve SW (düğme).\n\n```\n 5V ──┬── VRX'in bir ucu          Kol ortada : silgi yarıda  -> ~2,5 V -> ~512\n      │   silgi ──> VRX (A0)      Kol uçta   : silgi uçta    -> 0 V ya da 5 V\n GND ─┴── VRX'in öbür ucu                                       -> 0 ya da 1023\n```\n\nHer eksen bir gerilim bölücüdür. Kol ortadayken silgi şeridin yarısında durur; gerilim yaklaşık 2,5 V, `analogRead` yaklaşık 512 olur. Bir yöne tam itince 0 V ya da 5 V'a, yani 0 ya da 1023'e yaklaşır. Laboratuvarda X ekseni özelliği 0,25 ise gerilim 1,25 V ve okuma yaklaşık 256'dır.\n\n### Neden tam sıfır yok?\nButonun iki hali vardır, joystick'in ise sürekli bir aralığı. Üstelik \"orta\" kusursuz değildir: iki potansiyometre de tam yarıda durmaz. Gerçek bir modülde kol bırakılmışken 497 ya da 530 gibi bir değer okursun. Bu hata değildir, parçanın doğasıdır.\n\n### Merkezi ölç, ölü bölge koy\nİki adım yapılır:\n\n1. **Merkez ölçümü.** Program açılırken kol bırakılmış varsayılır; 16 okumanın ortalaması \"merkez\" olarak saklanır. Ortalama gürültüyü azaltır.\n2. **Ölü bölge.** Merkezin etrafındaki küçük aralık (örneğin ±40) sıfır sayılır. Elin titremesi ya da küçük kayma robotu oynatmaz.\n\nSonra fark `map` ile -100...+100 aralığına çevrilir. Örnek: merkez 532, ham 600 ise fark 68'dir; ölü bölge dışında kalan kısım 40...491 aralığından 0...100'e ölçeklenir ve sonuç tam sayı bölmesiyle 6 çıkar. Böylece değer ölü bölgenin hemen dışında 0'dan başlar, aniden 40'a sıçramaz.\n\n### Düğme\nSW pini düğme basılınca GND'ye bağlanır. Pini `INPUT_PULLUP` yaparsan bırakılmış düğme `HIGH`, basılı düğme `LOW` okunur. Yalnız basıldığı anı yakalamak için önceki durumu saklayıp kenarı algılarsın; basılı tutmak olayı tekrarlamaz.\n\n### Özet\nJoystick iki gerilim bölücü ve bir düğmedir. Kol bırakılmışken değer yaklaşık 512'dir ama tam 512 değildir; bu yüzden açılışta merkez ölçülür ve çevresine ölü bölge konur. Düzeltilmiş değer -100...+100 aralığında robotu ya da servoyu sürmeye hazırdır. Düğme `INPUT_PULLUP` ile okunur ve `LOW` basılı demektir.",
          "concepts": [
            {
              "term": "Joystick",
              "definition": "Birbirine dik iki potansiyometre ve bir düğmeden oluşan girdi parçası; VRX, VRY ve SW pinleri vardır.",
              "example": "X ekseni özelliği 0,25 iken VRX yaklaşık 1,25 V verir ve analogRead yaklaşık 256 okur.",
              "pitfall": "Joystick'i tek bir sensör sanmak: iki ayrı analog pin (A0 ve A1) ve bir dijital pin gerekir."
            },
            {
              "term": "Merkez (orta nokta)",
              "definition": "Kol bırakılmışken okunan değer. Açılışta 16 okumanın ortalamasıyla ölçülür.",
              "example": "Bir modülde merkez 532, ötekinde 491 çıkabilir.",
              "pitfall": "Merkezi sabit 512 yazmak: kol bırakılmışken değer kayar."
            },
            {
              "term": "Ölü bölge",
              "definition": "Merkezin çevresinde değerin sıfır sayıldığı küçük aralık.",
              "example": "Ölü bölge 40 iken merkezden 25 sapma 0 olarak işlenir.",
              "pitfall": "Ölü bölge koymamak: servo ya da motor 510, 514, 509 diye dalgalanan değerle titrer."
            },
            {
              "term": "map() ile ölçekleme",
              "definition": "Bir aralıktaki değeri başka bir aralığa doğrusal olarak çevirir; tam sayı bölmesi yapar.",
              "example": "map(68, 40, 491, 0, 100) sonucu 6'dır.",
              "pitfall": "Ölü bölgeyi ölçeklemeden bırakmak: değer 0'dan aniden 40'a sıçrar."
            },
            {
              "term": "INPUT_PULLUP ile düğme",
              "definition": "Pini içeriden 5 V'a çeker; basılı düğme GND'ye bağlandığı için LOW okunur.",
              "example": "digitalRead(2) == LOW ise joystick düğmesine basılıdır.",
              "pitfall": "INPUT_PULLUP yazmamak: bırakılmış düğmede pin havada kalır, rastgele basış okunur."
            }
          ],
          "quiz": [
            {
              "id": "m4h5d56-q1",
              "kind": "numeric",
              "prompt": "Joystick 5 V ile beslenmiş. X ekseni özelliğini 0,25 yaptın (kol bir çeyrek dolayında). VRX pinini A0'a bağladın. analogRead(A0) yaklaşık kaç okur?",
              "answer": 256,
              "tolerance": 2,
              "explanation": "Gerilim = 0,25 x 5 V = 1,25 V. analogRead = 1,25 / 5 x 1024 yaklaşık 256 (Arduino'da 255 ya da 256). 512 kol ortadayken, 768 ise 0,75 iken çıkar.",
              "skills": [
                "analog-read"
              ]
            },
            {
              "id": "m4h5d56-q2",
              "kind": "mcq",
              "prompt": "Kol bırakılmışken joystick neden \"0\" değil, yaklaşık 512 okutur?",
              "options": [
                "Program hatalıdır, 0 okunmalıdır",
                "Silgi şeridin yarısında durur, gerilim yaklaşık 2,5 V olur",
                "Düğme basılı kalmıştır",
                "ADC 512'den başlar"
              ],
              "answer": 1,
              "explanation": "Her eksen bir gerilim bölücüdür ve kol ortadayken silgi yarıdadır: 5 V'un yarısı, yani yaklaşık 512. Düğme (SW) ayrı bir pindir ve eksen değerini etkilemez. ADC 0 ile 1023 arası okur, 512'den başlamaz.",
              "skills": [
                "analog-read",
                "axis-calibration"
              ]
            },
            {
              "id": "m4h5d56-q3",
              "kind": "numeric",
              "prompt": "Merkez 532 olarak ölçüldü, ölü bölge 40. Kol sağa itilince ham değer 600 okunuyor. Dersteki eksen() fonksiyonu için fark = 68 olur ve map(fark, 40, 1023 - 532, 0, 100) çağrılır. Sonuç kaçtır?",
              "answer": 6,
              "tolerance": 0,
              "explanation": "Girdi aralığı 40...491. (68 - 40) x 100 / (491 - 40) = 2800 / 451 = 6,2; map tam sayı bölmesi yaptığından 6 olur. Ölü bölge dışındaki kısım yeniden ölçeklendiği için değer 0'dan başlar, 68 çıkmaz.",
              "skills": [
                "axis-calibration"
              ]
            },
            {
              "id": "m4h5d56-q4",
              "kind": "find-bug",
              "prompt": "Düğme bırakılmışken bile seri monitörde ara sıra \"BASILDI\" yazıyor. Hatalı satır hangisi?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(2, INPUT);\n}\n\nvoid loop() {\n  if (digitalRead(2) == LOW) {\n    Serial.println(\"BASILDI\");\n  }\n  delay(100);\n}\n```",
              "options": [
                "Serial.begin(9600);",
                "delay(100);",
                "pinMode(2, INPUT);",
                "if (digitalRead(2) == LOW) {"
              ],
              "answer": 2,
              "explanation": "SW pini INPUT_PULLUP olmalı. Düz INPUT ile bırakılmış düğmede pin havada kalır ve rastgele okunur. LOW kontrolü doğrudur çünkü basılı düğme GND'ye bağlanır.",
              "skills": [
                "input-pullup",
                "prog-debug"
              ]
            },
            {
              "id": "m4h5d56-q5",
              "kind": "predict-output",
              "prompt": "Merkez 512. Kol hafifçe itilmiş ve ham değer 540. Bu kod çalışınca seri monitörde ne yazar?\n\n```\nint merkez = 512;\nint ham = 540;\nint fark = ham - merkez;\nif (abs(fark) < 40) {\n  Serial.println(\"ORTA\");\n} else if (fark > 0) {\n  Serial.println(\"SAG\");\n} else {\n  Serial.println(\"SOL\");\n}\n```",
              "options": [
                "ORTA",
                "SAG",
                "SOL",
                "Hiçbir şey"
              ],
              "answer": 0,
              "explanation": "fark = 28 ve 28 < 40 olduğundan ölü bölgededir; \"ORTA\" yazılır. \"SAG\" yazması için fark en az 40 olmalıdır.",
              "skills": [
                "axis-calibration"
              ]
            }
          ]
        },
        {
          "title": "Döner enkoder (quadrature) ve kesme",
          "durationMin": 25,
          "problem": "Eski bir radyonun ses düğmesi sınırsız döner; ucu yoktur. Potansiyometrenin ise başı ve sonu vardır. Peki radyo, düğmenin hangi yöne ve kaç adım döndüğünü nasıl bilir? Cevap, birbirine \"90 derece\" kaymış iki sinyalde saklı.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Döner enkoder CLK (A) | **D2** (`INPUT_PULLUP`, kesme pini) |\n| Döner enkoder DT (B) | **D3** (`INPUT_PULLUP`) |\n| Döner enkoder SW (düğme) | **D4** (`INPUT_PULLUP`) |\n| Döner enkoder VCC | 5V (isteğe bağlı) |\n| Döner enkoder GND | GND |\n\nKY-040 gibi modüllerde pull-up direnci zaten bulunur; VCC'yi bağlarsan bu direnç hatları 5 V'a çeker. VCC'yi bağlamasan da `INPUT_PULLUP` yeterlidir, ama GND her durumda bağlı olmalı. Enkoderi seçince sağ panelde **Konum (tık)** ve **Düğme basılı** özellikleri çıkar. Konum'u değiştirmek enkoderi o kadar tık çevirmek demektir (saat yönü artı). Bu derste D2 pinini CLK için kullanıyoruz (56. dersteki joystick düğmesi de D2'deydi; her etkinlikte laboratuvar temiz devreyle başlar).\n\n### Quadrature nedir?\nEnkoderin içinde iki kontak vardır. Düğme dönerken bu kontaklar birer birer kapanıp açılır, ama **aynı anda değil**: biri ötekinden biraz önce değişir. Bu yüzden CLK ve DT'nin çıktıları arasında çeyrek dönem (90°) fark oluşur.\n\nBir \"tık\" boyunca iki pin şu sırayla değişir (1 = HIGH, 0 = LOW, yazılışı CLK, DT):\n\n| Yön | Durum sırası |\n|---|---|\n| Bir yön (burada \"saat yönü\" diyeceğiz) | 11 → 01 → 00 → 10 → 11 |\n| Ters yön | 11 → 10 → 00 → 01 → 11 |\n\nBu iki sıraya bak. CLK'nın **düştüğü** an (1'den 0'a): saat yönünde DT o sırada hâlâ 1'dir (11 → 01), ters yönde DT çoktan 0 olmuştur (10 → 00). Demek ki yönü bulmak için tek bir kural yeter:\n\n> CLK düşerken DT'ye bak. DT = 1 ise bir yöne, DT = 0 ise öbür yöne gidiyoruz.\n\nModüllerde hangi yönün \"saat yönü\" olduğu üreticiye göre ters çıkabilir. Çıkarsa `sayac++` ile `sayac--` yerlerini değiştir.\n\n### Program 1: En basit sürüm\nCLK'daki her düşüşte bir kesme (29. ders) çalıştırıp DT'yi okuyoruz.\n\n```cpp\n// sketch: enkoder_basit\nconst int CLK = 2;\nconst int DT = 3;\n\nvolatile int sayac = 0;\n\nvoid adim() {                          // kesme servis rutini (ISR)\n  if (digitalRead(DT) == HIGH) {\n    sayac++;\n  } else {\n    sayac--;\n  }\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(CLK, INPUT_PULLUP);\n  pinMode(DT, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);\n}\n\nvoid loop() {\n  static int onceki = 0;\n\n  noInterrupts();                      // 29. ders: okurken kesme araya girmesin\n  int kopya = sayac;\n  interrupts();\n\n  if (kopya != onceki) {\n    onceki = kopya;\n    Serial.print(\"Sayac: \");\n    Serial.println(kopya);\n  }\n}\n```\n▶'e bas, enkoderin **Konum (tık)** özelliğini 5 yap: sayaç 5 olur. Sonra 2 yap: sayaç 2'ye iner. Eksi bir değer (örneğin -3) yaparsan sayaç eksiye geçer. Gerçek enkoderde bir adımın birkaç sayı birden atladığını görebilirsin; laboratuvarın enkoderi ise ideal çalışır ve sıçramaz. Gerçek parçadaki bu sorunun sebebi bir sonraki bölümde.\n\n### Bounce: kontaklar titrer\nKontaklar mekaniktir. Kapanırken bir anda temas etmez, çok kısa bir süre (modüle göre bir milisaniyeden azdan birkaç milisaniyeye kadar) açılıp kapanır. 8. derste butonun sıçramasını görmüştün; aynısı burada da var. Kesme ise çok hızlıdır: her sıçramayı ayrı bir kenar sayar. CLK tek bir tık için `1 → 0 → 1 → 0 → 1 → 0` diye titrerse `adim()` üç kez çalışır ve sayaç 3 artar.\n\nÇözüm: iki kenar arasında en az belli bir süre geçmediyse kenarı yok say. Süre milisaniye değil **mikrosaniye** ölçeğindedir, bu yüzden `micros()` kullanırız. Laboratuvarın enkoderi sıçramadığı için filtrenin asıl işini orada göremezsin; ama filtrenin eşiğinin \"çok büyük\" olunca neler bozduğunu \"Dene\" bölümünde görebilirsin.\n\n### Program 2: Bounce filtreli sayaç ve düğmeyle sıfırlama\n```cpp\n// sketch: enkoder_filtreli\nconst int CLK = 2;\nconst int DT = 3;\nconst int SW = 4;\nconst unsigned long ARALIK_US = 2000;   // iki kenar arası en az 2 ms\n\nvolatile int sayac = 0;\nvolatile unsigned long sonKenar = 0;\n\nvoid adim() {\n  unsigned long simdi = micros();\n  if (simdi - sonKenar < ARALIK_US) return;   // sıçrama: yok say\n  sonKenar = simdi;\n  if (digitalRead(DT) == HIGH) {\n    sayac++;\n  } else {\n    sayac--;\n  }\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(CLK, INPUT_PULLUP);\n  pinMode(DT, INPUT_PULLUP);\n  pinMode(SW, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);\n}\n\nvoid loop() {\n  static int onceki = 0;\n  static bool oncekiBasili = false;\n\n  // Düğme: basıldığı an sayacı sıfırla\n  bool basili = (digitalRead(SW) == LOW);\n  if (basili && !oncekiBasili) {\n    noInterrupts();\n    sayac = 0;\n    interrupts();\n  }\n  oncekiBasili = basili;\n\n  noInterrupts();\n  int kopya = sayac;\n  interrupts();\n\n  if (kopya != onceki) {\n    onceki = kopya;\n    Serial.print(\"Sayac: \");\n    Serial.println(kopya);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `attachInterrupt(..., FALLING)` CLK her 1'den 0'a düştüğünde `adim()` fonksiyonunu çalıştırır. D2 bir kesme pinidir (29. ders), bu yüzden CLK'yı D2'ye bağladık.\n2. `adim()` içinde DT okunur: HIGH ise `sayac++`, LOW ise `sayac--`. Yön işte bu kadar basit bulunur.\n3. `sayac` ve `sonKenar` kesme ile `loop()` arasında paylaşıldığı için `volatile` tanımlıdır. `loop()` bu değerleri okurken kesmeyi kısa süre kapatır.\n4. Program 2'de `micros()` ile son kabul edilen kenar zamanı saklanır. 2 ms'den kısa sürede gelen yeni kenarlar sıçrama sayılır ve atlanır. Eşik, en hızlı çevirdiğinde bile tıklar arasındaki süreden küçük olmalıdır (laboratuvarın enkoderi en çok saniyede 250 tık, yani tıklar arası en az 4 ms); 2 ms makul bir başlangıçtır. Gerçek bir modülde eşiği denemeyle ayarlarsın.\n5. SW düğmesi yavaş bir olaydır, kesme gerektirmez. `loop()` içinde kenar algılamayla (8. ders) bakmak yeter.\n\n### Dene\n- `ARALIK_US` değerini 0 yap (filtreyi kapat). Konum'u 1 artır. Laboratuvarda sayaç 1 artar, çünkü sanal kontak sıçramaz; gerçek bir enkoderde aynı tık 2-3 sayı atlatabilir.\n- `ARALIK_US` değerini 50 000 (50 ms) yap ve Konum'u bir anda 10 artır (hızlı çevirme). Sayaç kaça çıkıyor? Eşiği çok büyütmek neden kötü?\n- Sayacı 0-20 arasında tut (`constrain`) ve değere göre bir LED'in parlaklığını `analogWrite` ile değiştir. LED'i (330 Ω dirençle) D11'e bağla: D13 PWM pini değildir, D11 PWM yapabilir. Böylece sonsuz dönen düğmeden ses düğmesi yaparsın.\n\n### Sık yapılan hatalar\n- CLK'yı kesme pini olmayan bir pine (D2 ya da D3 dışına) bağlamak: `attachInterrupt` çalışmaz.\n- `sayac` değişkenini `volatile` yapmamak: derleyici değeri saklar, `loop()` değişimi görmez.\n- ISR içinde `Serial.print` ya da `delay` kullanmak: ISR çok kısa olmalıdır. Yazdırmayı `loop()` yapar.\n- Bounce filtresi koymamak: yavaş çevirmede bile sayaç beklenenden fazla atlar.\n- Eşiği gereğinden büyük seçmek: hızlı çevirince gerçek adımlar da atılır.\n- CLK ve DT'yi karıştırmak: yön ters çıkar. Kodda `++` ile `--` yer değiştirir ya da kabloların uçlarını değiştirirsin; ikisi de aynı sonucu verir.",
          "question": "Fare tekerleği, yazıcı kafası, robot tekerleği... Hepsinde enkoder var. Tek bir kontak (yalnızca CLK) yönü bulmak için neden yetmez? Çok hızlı dönen bir motorun enkoderini `loop()` içinde okumak yerine kesmeyle okumanın avantajı nedir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Döner enkoderin iki sinyalinin (CLK ve DT) neden 90 derece kaydığını\n- Dönüş yönünü \"CLK düşerken DT'ye bak\" kuralıyla bulmayı\n- Enkoderi `attachInterrupt` ve `volatile` değişkenle saymayı\n- Kontak sıçramasını zaman eşiğiyle süzmeyi\n\n### Önceden bilmen gerekenler\nDers 6'da `INPUT_PULLUP`; ders 8'de buton sıçraması ve kenar algılama; ders 29'da `attachInterrupt`, ISR ve `volatile`.\n\n### Bir tık, iki sinyal\nEnkoderin içinde iki kontak vardır. Düğme dönerken bu kontaklar aynı anda değil, biri ötekinden önce değişir. Pinleri (CLK, DT) sırasıyla yazarsak bir tık şu durumlardan geçer:\n\n```\nSaat yönü : 11 -> 01 -> 00 -> 10 -> 11\nTers yön  : 11 -> 10 -> 00 -> 01 -> 11\n```\n\nDört durum geçişi bir tıktır. Potansiyometrenin başı sonu vardır; enkoder ise sınırsız döner ve konumu yalnızca sayarak bilir.\n\n### Yönü bulan kural\nİki sıraya bak: CLK her iki yönde de 1'den 0'a düşer, yani yalnızca CLK yön söylemez. Fark, o anda DT'dedir. Saat yönünde CLK düşerken DT hâlâ 1'dir (11 -> 01). Ters yönde DT çoktan 0 olmuştur (10 -> 00). Kural:\n\n```\nCLK düşerken: DT = 1 ise sayac++, DT = 0 ise sayac--\n```\n\nModülün hangi yönü artı saydığı üreticiye göre değişebilir; tersse `++` ile `--` yer değiştirir.\n\n### Kesme ile saymak\nHızlı çevirirken `loop()` içinde sürekli bakmak tık kaçırabilir. CLK'yı kesme pinine (Uno'da D2 ya da D3) bağlarsın ve `FALLING` kenarda çalışan kısa bir ISR yazarsın. ISR yalnız DT'yi okur ve sayacı değiştirir. `Serial.print` ve `delay` ISR'de kullanılmaz. `sayac` hem ISR'de hem `loop()` içinde kullanıldığından `volatile` olmalıdır; `loop()` okurken kesme kısa süre kapatılır.\n\n### Sıçrama ve eşik\nGerçek kontaklar kapanırken çok kısa süre açılıp kapanır. Kesme her kenarı ayrı sayar; bir tık 3 sayı atlatabilir. Çözüm, iki kenar arasında en az bir süre geçmemişse kenarı yok saymaktır (`micros()` ile, örneğin 2000 µs). Eşik çok büyük olursa gerçek tıklar da atılır. Laboratuvarın enkoderi bir geçişi her milisaniyede uygular: tık başına 4 ms, yani en çok 250 tık/sn. Eşik bu 4 ms'den küçük olmalıdır.\n\n### Özet\nEnkoder, 90 derece kaymış iki sinyalle hem adımı hem yönü verir. CLK düşerken DT 1 ise bir yöne, 0 ise öbür yöne gidilir. Sayma işi kesmeyle yapılır, paylaşılan değişken `volatile` olur. Sıçramayı süzmek için zaman eşiği konur, ama eşik en hızlı tık aralığından küçük kalmalıdır.",
          "concepts": [
            {
              "term": "Quadrature (çeyrek faz)",
              "definition": "Aynı anda değil, birbirinden 90 derece kaymış iki sinyal. Adımı ve yönü birlikte verir.",
              "example": "Saat yönünde durumlar 11, 01, 00, 10 sırasıyla (CLK, DT) değişir.",
              "pitfall": "Yalnız CLK'ya bakmak: iki yönde de aynı düşer, yön anlaşılmaz."
            },
            {
              "term": "Yön kuralı",
              "definition": "CLK düşerken DT'ye bak: DT 1 ise bir yön (sayac++), 0 ise öbür yön (sayac--).",
              "example": "CLK 1 den 0 a düşerken DT hâlâ 1 ise sayac artar.",
              "pitfall": "CLK ile DT'yi karıştırmak: yön ters çıkar."
            },
            {
              "term": "Kesme (attachInterrupt)",
              "definition": "Bir pin kenarı olunca loop() beklemeden kısa bir fonksiyonu (ISR) çalıştırma.",
              "example": "attachInterrupt(digitalPinToInterrupt(2), adim, FALLING); CLK düşünce adim() çalışır.",
              "pitfall": "CLK'yı D2 ya da D3 dışına bağlamak: Uno'da kesme çalışmaz."
            },
            {
              "term": "volatile",
              "definition": "Değişkenin kesme gibi program akışı dışında değişebileceğini derleyiciye bildirir.",
              "example": "volatile int sayac = 0; hem ISR hem loop() içinde kullanılır.",
              "pitfall": "volatile yazmamak: loop() değişimi görmeyebilir."
            },
            {
              "term": "Bounce filtresi",
              "definition": "İki kenar arasında en az belli bir süre geçmediyse kenarı yok sayma.",
              "example": "micros() farkı 2000 µs'den küçükse kenar atlanır.",
              "pitfall": "Eşiği çok büyütmek: hızlı çevirirken gerçek tıklar da atılır."
            }
          ],
          "quiz": [
            {
              "id": "m4h5d57-q1",
              "kind": "predict-output",
              "prompt": "Enkoder CLK=D2, DT=D3 ile bağlı ve sayac başlangıçta 5. Enkoder ters yönde 2 tık çevriliyor (her tık 11, 10, 00, 01, 11 durum sırasıyla). Sonunda seri monitörde son satır ne yazar?\n\n```\nvolatile int sayac = 5;\n\nvoid adim() {\n  if (digitalRead(3) == HIGH) {\n    sayac++;\n  } else {\n    sayac--;\n  }\n}\n// setup: attachInterrupt(digitalPinToInterrupt(2), adim, FALLING);\n// loop: sayac değişince Serial.print(\"Sayac: \") ve değeri yazar\n```",
              "options": [
                "Sayac: 7",
                "Sayac: 5",
                "Sayac: 3",
                "Sayac: 1"
              ],
              "answer": 2,
              "explanation": "Ters yönde CLK 10 den 00 a düşerken DT zaten 0'dır, bu yüzden her tıkta sayac-- çalışır: 5 - 2 = 3. Saat yönünde DT 1 olurdu ve sayac 7 olurdu.",
              "skills": [
                "quadrature",
                "interrupts"
              ]
            },
            {
              "id": "m4h5d57-q2",
              "kind": "numeric",
              "prompt": "Laboratuvarın enkoderi her benzetim milisaniyesinde bir durum geçişi uygular ve bir tık 4 geçiştir. Konum özelliğini 0'dan 30'a bir anda getirirsen enkoder hareketini kaç ms'de bitirir?",
              "answer": 120,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "30 tık x 4 geçiş = 120 geçiş ve her biri 1 ms sürer: 120 ms. Bu, tık başına 4 ms (en çok 250 tık/sn) demektir; bounce eşiği bu 4 ms'den küçük seçilmelidir.",
              "skills": [
                "debounce",
                "quadrature"
              ]
            },
            {
              "id": "m4h5d57-q3",
              "kind": "find-bug",
              "prompt": "CLK kablosunu D4'e bağladın ve program yön verip saymıyor. Sayaç hiç değişmiyor. Hatalı satır hangisi?\n\n```\nconst int CLK = 4;\nconst int DT = 3;\nvolatile int sayac = 0;\n\nvoid adim() {\n  if (digitalRead(DT) == HIGH) sayac++; else sayac--;\n}\n\nvoid setup() {\n  pinMode(CLK, INPUT_PULLUP);\n  pinMode(DT, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);\n}\n```",
              "options": [
                "const int CLK = 4;",
                "volatile int sayac = 0;",
                "pinMode(DT, INPUT_PULLUP);",
                "if (digitalRead(DT) == HIGH) sayac++; else sayac--;"
              ],
              "answer": 0,
              "explanation": "Uno'da yalnız D2 ve D3 kesme pinidir. digitalPinToInterrupt(4) geçerli bir kesme vermez, ISR hiç çalışmaz. CLK D2'ye (ya da D3'e) bağlanmalı. volatile ve INPUT_PULLUP doğrudur.",
              "skills": [
                "interrupts",
                "prog-debug"
              ]
            },
            {
              "id": "m4h5d57-q4",
              "kind": "mcq",
              "prompt": "Yalnızca CLK sinyaline bakan bir program dönüş yönünü neden bulamaz?",
              "options": [
                "CLK sinyali çok hızlıdır",
                "CLK iki yönde de aynı şekilde düşer; yönü DT'nin o anki durumu belirler",
                "CLK yalnız düğmeyi okur",
                "Enkoder yalnız tek yönde döner"
              ],
              "answer": 1,
              "explanation": "Saat yönünde de ters yönde de CLK 1 den 0 a düşer. Fark, düşme anında DT'nin 1 mi 0 mı olduğudur; bu yüzden iki sinyal birlikte okunur.",
              "skills": [
                "quadrature"
              ]
            },
            {
              "id": "m4h5d57-q5",
              "kind": "numeric",
              "prompt": "Enkoder hızlı çevriliyor ve CLK 4 ms arayla düşüyor. Eşik ARALIK_US = 6000 seçildi. 20 ardışık düşüşte program kaç tıkı sayar? (İlk kenar kabul edilir.)",
              "answer": 10,
              "tolerance": 1,
              "explanation": "Kabul edilen kenar t = 0, sonraki 4 ms sonra gelir ve 6 ms'den küçük olduğu için atılır, 8 ms sonra gelen kabul edilir. Her ikinci kenar sayılır: 20 / 2 = 10. Eşik 4 ms'den küçük (örneğin 2 ms) olsaydı 20 sayılırdı; eşik fazla büyük olduğunda gerçek tıklar kaybolur.",
              "skills": [
                "debounce"
              ]
            }
          ]
        },
        {
          "title": "MPU6050: ivmeölçer ve eğim açısı (I2C)",
          "durationMin": 30,
          "problem": "Telefonunu yan çevirdiğinde ekran kendiliğinden döner. Cihazın içinde \"yukarısı neresi\" sorusuna cevap veren küçük bir çip var. Bu çip yer çekimini ölçer. Masada yatan telefon da yer çekimini ölçer; eğik tutulan da. Aradaki fark, çekimin hangi eksene ne kadar düştüğüdür. Bu farktan bir açı çıkarabilir miyiz?",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| MPU6050 VCC | 5V |\n| MPU6050 GND | GND |\n| MPU6050 SDA | **A4** |\n| MPU6050 SCL | **A5** |\n| Direnç (330 Ω) 1 | **D13** |\n| Direnç 2 | LED **A** (anot) |\n| LED **K** (katot) | GND |\n\nI2C'yi 33. derste öğrendin: iki hat (SDA, SCL) üzerinde birçok cihaz, her birinin bir adresi var. MPU6050'nin adresi **0x68**'dir; gerçek modüldeki AD0 pini 5 V'a bağlanırsa adres 0x69 olur. Laboratuvarda bu, MPU6050'nin **I2C adresi (AD0)** özelliğidir; 0x69 seçersen koddaki `MPU` sabitini de 0x69 yapmalısın. RTC (DS3231) modülü de 0x68 kullanır, bu yüzden bu haftanın devresine RTC parçası ekleme.\n\nMPU6050'yi seçince sağ panelde **İvme X, Y, Z** (g cinsinden) ve **Jiroskop X, Y, Z** (°/s cinsinden) özellikleri çıkar. Bunlar çipin \"ölçtüğü\" değerlerdir ve program çalışırken de değiştirilebilir; çipi elle çevirmek yerine bu sayıları değiştirirsin. Laboratuvar çipinin sıcaklığı 25 °C'de sabittir.\n\n### Yazmaçlar: kütüphanesiz okuma\nBu derste hazır bir kütüphane kullanmayacağız; çipin kendisiyle konuşacağız. Böylece 33. derste gördüğün `Wire` komutlarının gerçekte ne işe yaradığını görürsün. MPU6050'nin içi **yazmaç** (register) denen numaralı hücrelerden oluşur. İşimize yarayanlar:\n\n| Yazmaç | Anlamı |\n|---|---|\n| 0x6B | Güç yönetimi. Çip açılışta uyku modundadır. Buraya 0 yazınca uyanır. |\n| 0x3B'den başlayan 14 bayt | İvme X, Y, Z (2'şer bayt) · sıcaklık (2 bayt) · jiroskop X, Y, Z (2'şer bayt) |\n\nHer ölçüm **16 bitlik işaretli** bir sayıdır ve önce yüksek bayt gelir. Yani iki baytı `(yuksek << 8) | dusuk` ile birleştirip `int16_t` olarak tutmak gerekir.\n\nVarsayılan ayarda çipin ölçüm aralıkları şunlardır:\n\n- İvmeölçer: ±2 g. Ham değeri g'ye çevirmek için **16384'e** bölersin (16384 LSB/g).\n- Jiroskop: ±250 °/s. Ham değeri °/s'ye çevirmek için **131'e** bölersin (131 LSB/(°/s)).\n- Sıcaklık: `ham / 340 + 36,53` derece (veri sayfasındaki formül).\n\ng, dünyanın yer çekimi ivmesidir: masada duran çip, yukarı bakan ekseninde yaklaşık 1 g ölçer.\n\n### Program 1: Ham veriyi oku ve çevir\n```cpp\n// sketch: mpu_ham\n#include <Wire.h>\n\nconst int MPU = 0x68;\n\nint16_t oku16() {\n  int yuksek = Wire.read();\n  int dusuk = Wire.read();\n  return (int16_t)((yuksek << 8) | dusuk);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  Wire.beginTransmission(MPU);\n  Wire.write(0x6B);                 // güç yönetimi yazmacı\n  Wire.write(0);                    // 0 yaz: uyan\n  Wire.endTransmission(true);\n}\n\nvoid loop() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x3B);                 // okumaya başlanacak yazmaç\n  Wire.endTransmission(false);      // bağlantıyı bırakma (tekrar başlat)\n  Wire.requestFrom(MPU, 14, true);  // 14 bayt iste\n\n  int16_t ax = oku16();\n  int16_t ay = oku16();\n  int16_t az = oku16();\n  int16_t sicak = oku16();\n  int16_t gx = oku16();\n  int16_t gy = oku16();\n  int16_t gz = oku16();\n\n  Serial.print(\"HAM ax=\");\n  Serial.print(ax);\n  Serial.print(\" ay=\");\n  Serial.print(ay);\n  Serial.print(\" az=\");\n  Serial.println(az);\n\n  Serial.print(\"g ax=\");\n  Serial.print(ax / 16384.0, 2);\n  Serial.print(\" ay=\");\n  Serial.print(ay / 16384.0, 2);\n  Serial.print(\" az=\");\n  Serial.print(az / 16384.0, 2);\n  Serial.print(\" | dps gx=\");\n  Serial.print(gx / 131.0, 1);\n  Serial.print(\" gy=\");\n  Serial.print(gy / 131.0, 1);\n  Serial.print(\" gz=\");\n  Serial.print(gz / 131.0, 1);\n  Serial.print(\" | C=\");\n  Serial.println(sicak / 340.0 + 36.53, 1);\n\n  delay(500);\n}\n```\nDüz duran bir çip için özellik panelinde **İvme X = 0, İvme Y = 0, İvme Z = 1** olmalı (bunlar varsayılan değerlerdir). ▶'e bas: `az` yaklaşık 1,00 g çıkar, `ax` ve `ay` sıfıra yakın olur. Şimdi çipi bir kenarı üstüne diktiğini düşün: **İvme X = 1** ve **İvme Z = 0** yap. 1 g başka bir eksene geçer ve ham `ax` 16384 olur. Çipin döndüğünü taklit etmek için **Jiroskop X**'i 20 yap: `gx` yaklaşık 20 °/s okunur; 0'a getirince sıfıra döner. Gerçek bir çip durağanken jiroskopta tam sıfır göstermez (bir sonraki ders bunu anlatıyor); laboratuvar çipi ise ideal olduğu için sıfır gösterir.\n\n### Eğim açısı\nÇip durağanken ölçtüğü tek şey yer çekimidir: yaklaşık 1 g'lik bir **vektör**. Çipi eğdikçe bu vektör eksenlere farklı oranlarda dağılır. X ekseni yukarı kalkınca `ax` artar, `az` küçülür. Üçgeni düşün: yatay kenar `az`, dikey kenar `ax`. Açı, bu iki kenarın arctanjantıdır:\n\n```cpp\npitch = atan2(ax, az) * 180.0 / PI;   // öne-arkaya eğim\nroll  = atan2(ay, az) * 180.0 / PI;   // yana eğim\n```\n`atan2(y, x)` iki kenardan açıyı **radyan** olarak verir. 180/π ile çarpınca derece olur. Örnek: `ax = 0,5`, `az = 0,866` ise `atan2(0,5; 0,866) = 30°` (0,5 = sin 30°, 0,866 = cos 30°).\n\nPitch ve roll'un hangi yöne artı olduğu, gerçek çipin kartına nasıl yerleştirildiğine bağlıdır (modülün üzerinde basılı X ve Y okları yönü gösterir). Laboratuvarda İvme X arttıkça pitch artar, İvme Y arttıkça roll artar. Bu derste tek eksende eğim varsayıyoruz; iki eksen aynı anda çok eğilirse bu basit formüller birbirini biraz etkiler.\n\n### Program 2: Pitch, roll ve su terazisi\n```cpp\n// sketch: mpu_egim\n#include <Wire.h>\n\nconst int MPU = 0x68;\nconst int LED = 13;\n\nfloat ax, ay, az;\n\nint16_t oku16() {\n  int yuksek = Wire.read();\n  int dusuk = Wire.read();\n  return (int16_t)((yuksek << 8) | dusuk);\n}\n\nvoid ivmeOku() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 6, true);   // yalnız ivme: 6 bayt\n  ax = oku16() / 16384.0;\n  ay = oku16() / 16384.0;\n  az = oku16() / 16384.0;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(LED, OUTPUT);\n  Wire.begin();\n  Wire.beginTransmission(MPU);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n}\n\nvoid loop() {\n  ivmeOku();\n  float pitch = atan2(ax, az) * 180.0 / PI;\n  float roll = atan2(ay, az) * 180.0 / PI;\n\n  digitalWrite(LED, (abs(pitch) < 2.0 && abs(roll) < 2.0) ? HIGH : LOW);   // terazi\n\n  Serial.print(\"pitch=\");\n  Serial.print(pitch, 1);\n  Serial.print(\" roll=\");\n  Serial.println(roll, 1);\n  delay(200);\n}\n```\n\n### Nasıl çalışıyor?\n1. Çip açılışta uykudadır. `0x6B` yazmacına 0 yazmadan okursan anlamlı veri gelmez.\n2. `beginTransmission` + `write(0x3B)` + `endTransmission(false)` \"şu yazmaçtan okuyacağım\" demektir. `requestFrom` ise art arda gelen baytları ister. Çip her bayttan sonra yazmaç numarasını kendiliğinden bir artırır; bu yüzden tek istekle 14 bayt gelir.\n3. Baytlar iki iki birleştirilir: yüksek bayt 8 bit sola kaydırılır, düşük bayt eklenir. `int16_t` türü işareti doğru yorumlar (negatif eğim negatif sayı olur).\n4. 16384'e bölmek ham sayıyı g'ye çevirir. Örnek: ham 8192 → 0,5 g.\n5. `atan2` açıyı verir. Düz durumda `ax = 0`, `az = 1` olduğu için `pitch = 0`.\n6. LED, iki açı da ±2° içindeyse yanar: dijital bir su terazisi.\n\n### Dene\n- İvme X ve Y'yi 0, İvme Z'yi 1 bırak. `pitch`, `roll` ne çıkıyor? Laboratuvarda tam 0,0 çıkar. Gerçek bir çipte tam 0,0 çıkmıyorsa bu hata mı? (Yanıt: çipin kart üzerindeki montaj açısı ve ölçüm hatası yüzünden küçük bir kayma normaldir.) Bunu taklit etmek için İvme X'i 0,02 yap ve pitch'in kaç derece olduğuna bak.\n- Çipi eğmeden yalnız **İvme X**'i 0,3 yap (çip yatay yönde hızlanıyormuş gibi). `pitch` kaç oluyor? Çip eğilmedi, yine de açı değişti: çip hareket ediyorken ölçtüğü şey yalnız yer çekimi mi?\n- LED'in yanma aralığını ±5° yap, sonra ±0,5° yap. Hangisi daha kullanışlı?\n\n### Sık yapılan hatalar\n- `0x6B` yazmacına 0 yazmayı unutmak: çip uykuda kalır.\n- Baytları `int` olarak birleştirip işaretsiz bırakmak: negatif eğim 65000 gibi bir sayıya döner. `int16_t` kullan.\n- `ax / 16384` yazmak: iki tam sayının bölümü tam sayıdır. `16384.0` yaz.\n- `atan2` sonucunu dereceye çevirmeyi unutmak: sonuç radyandır.\n- Çipin hareketli olduğu an ölçülen açıya güvenmek: ivmeölçer yer çekimini ve çipin kendi hızlanmasını ayıramaz. Çipi yatay yönde hızlandırırsan (örneğin `ax = 0,3 g`, `az = 1 g` olacak şekilde) `atan2` yaklaşık 16,7° verir, oysa çip eğilmemiştir.\n- MPU6050 ile RTC (DS3231) modülünü aynı hatta kullanmak: ikisi de 0x68 adresini kullanır.",
          "question": "Telefon yatay ve dikey durumunu ivmeölçerle anlıyor. Peki bir bisikletin viraj açısını ya da bir drone'un eğimini yalnız ivmeölçerle ölçmek neden sorun çıkarır? Sallanan bir tren vagonunda yer çekimi vektörüne ne olur?",
          "explainerMd": "### Bu derste öğreneceklerin\n- MPU6050'nin ivmeölçerinin yer çekimini ölçtüğünü ve değerin g cinsinden nasıl çıktığını\n- I2C üzerinden yazmaçlarla (register) kütüphanesiz veri okumayı\n- İki baytı birleştirip `int16_t` ile işaretli sayıya çevirmeyi\n- `atan2` ile eğim (pitch ve roll) açısı hesaplamayı\n\n### Önceden bilmen gerekenler\nDers 33'te I2C, SDA/SCL hatları ve cihaz adresi; ders 14'te sensör değerini birime çevirme; ders 32'de LCD gibi I2C cihazların aynı hatta çalışması.\n\n### Çip yer çekimini ölçer\nDurağan bir ivmeölçer tek şey ölçer: yaklaşık 1 g büyüklüğünde yerçekimi vektörü. Çip yatayken bu vektör Z eksenindedir (`az` = 1, `ax` = `ay` = 0). Çipi eğince vektör eksenlere paylaşılır. Açıyı bulmak için bu paylaşımı okursun.\n\n### Yazmaçlar: çipin numaralı hücreleri\nMPU6050 içinde yazmaç denen numaralı hücreler vardır:\n\n| Yazmaç | İş |\n|---|---|\n| 0x6B | Güç yönetimi. Çip uykuda açılır; 0 yazarsan uyanır. |\n| 0x3B'den 14 bayt | İvme X, Y, Z, sıcaklık, jiroskop X, Y, Z (her biri 2 bayt) |\n\nÇip adres 0x68'dedir (AD0 5V'a bağlıysa 0x69). RTC modülü de 0x68 kullandığı için aynı hatta kullanılmaz.\n\n### Baytları sayıya çevirmek\nHer ölçüm 16 bit işaretlidir ve yüksek bayt önce gelir:\n\n```\nint16_t ham = (int16_t)((yuksek << 8) | dusuk);\nfloat g = ham / 16384.0;\n```\n\nVarsayılan ±2 g aralığında 1 g = 16384 ham birimdir. Ham 8192 ise 0,5 g'dir. `16384` yerine `16384.0` yazman gerekir; iki tam sayının bölümü tam sayıdır ve 1'den küçük sonuç 0 olur. `int16_t` negatif eğimi doğru yorumlar; işaretsiz `int` negatif değeri 65000 gibi bir sayıya çevirir.\n\n### Eğim açısı\nYatay kenar `az`, dikey kenar `ax` olan bir üçgen düşün. Açı arctanjanttır:\n\n```\npitch = atan2(ax, az) * 180.0 / PI;\n```\n\n`atan2` radyan verir; 180/π ile derece olur. Örnek: `ax` = 0,5 ve `az` = 0,866 ise pitch 30 derecedir. Roll için `atan2(ay, az)` kullanılır.\n\n### Sınırı bil\nİvmeölçer yer çekimi ile çipin kendi hızlanmasını ayıramaz. Çip eğilmeden `ax` = 0,3 g olursa `atan2(0.3, 1)` yaklaşık 16,7 derece verir; oysa çip eğik değildir. Hareketli bir cihazda yalnız ivmeölçerle açı ölçmek bu yüzden yanıltır.\n\n### Özet\nMPU6050 yazmaçlarından okunan ham değer, 16384'e bölününce g olur. Çip durağansa yer çekiminin eksenlere dağılımından `atan2` ile eğim açısı bulunur. Çipi `0x6B`'ye 0 yazarak uyandırmak, baytları `int16_t` ile birleştirmek ve ondalıklı bölmek gerekir. Hızlanma açı hesabını bozar.",
          "concepts": [
            {
              "term": "Yazmaç (register)",
              "definition": "Çipin içindeki numaralı hücre. I2C ile hangi yazmaçtan okunacağı ya da yazılacağı söylenir.",
              "example": "0x6B güç yönetimi, 0x3B ölçümlerin başladığı yazmaçtır.",
              "pitfall": "Yazmaç numarasını yanlış yazmak: rastgele ya da anlamsız veri gelir."
            },
            {
              "term": "Uyku modu",
              "definition": "MPU6050 açılışta uykudadır; 0x6B yazmacına 0 yazılınca ölçüme başlar.",
              "example": "Wire.write(0x6B); Wire.write(0); çipi uyandırır.",
              "pitfall": "Uyandırmayı unutmak: sensör anlamlı veri vermez."
            },
            {
              "term": "Ham değer ve g",
              "definition": "Çip 16 bitlik işaretli ham sayı verir; ±2 g aralığında g = ham / 16384.0.",
              "example": "Ham 8192 ise 0,5 g'dir.",
              "pitfall": "ax / 16384 yazmak: tam sayı bölmesi 0 verir; 16384.0 yazılmalı."
            },
            {
              "term": "int16_t",
              "definition": "İşaretli 16 bitlik tam sayı türü. İki baytı birleştirince negatif değerleri doğru yorumlar.",
              "example": "(int16_t)((yuksek << 8) | dusuk)",
              "pitfall": "İşaretsiz tür kullanmak: negatif eğim 65000 gibi bir sayıya döner."
            },
            {
              "term": "atan2 ile eğim",
              "definition": "İki kenardan açıyı radyan olarak verir; 180/PI ile derece olur. Pitch = atan2(ax, az).",
              "example": "ax = 0,5 ve az = 0,866 için açı 30 derecedir.",
              "pitfall": "Radyanı dereceye çevirmeyi unutmak ya da çip hızlanırken açıya güvenmek."
            }
          ],
          "quiz": [
            {
              "id": "m4h5d58-q1",
              "kind": "numeric",
              "prompt": "MPU6050'nin İvme Z özelliğini 0,25 g yaptın. Varsayılan ±2 g aralığında ham az değeri kaç okunur?",
              "answer": 4096,
              "tolerance": 1,
              "explanation": "Ham = g x 16384 = 0,25 x 16384 = 4096. Tersi de doğrudur: ham 4096 / 16384,0 = 0,25 g.",
              "skills": [
                "accel-angle",
                "i2c-registers"
              ]
            },
            {
              "id": "m4h5d58-q2",
              "kind": "mcq",
              "prompt": "Devreye MPU6050 (varsayılan adres) ile bir DS3231 RTC modülü eklediğinde ikisi de çalışmıyor. En olası neden nedir?",
              "options": [
                "İkisi de aynı I2C adresini (0x68) kullanır",
                "RTC SDA pinine ihtiyaç duymaz",
                "I2C aynı anda en çok bir cihaz destekler",
                "MPU6050 yalnız 3,3 V ile çalışır"
              ],
              "answer": 0,
              "explanation": "MPU6050 ve DS3231 varsayılan olarak 0x68 adresindedir; aynı hatta iki cihaz aynı adresi kullanamaz. MPU6050'nin AD0 pini 5 V'a bağlanırsa adres 0x69 olur. I2C birçok cihazı destekler, yeter ki adresler farklı olsun.",
              "skills": [
                "i2c-registers"
              ]
            },
            {
              "id": "m4h5d58-q3",
              "kind": "find-bug",
              "prompt": "Çip düz dururken ax ham değeri 8192 (0,5 g) ama ekranda 0.00 yazıyor. Hatalı satır hangisi?\n\n```\nint16_t ax = oku16();\nfloat g = ax / 16384;\nSerial.println(g, 2);\n```",
              "options": [
                "int16_t ax = oku16();",
                "float g = ax / 16384;",
                "Serial.println(g, 2);",
                "Hata yok, 0.00 doğru"
              ],
              "answer": 1,
              "explanation": "ax ve 16384 tam sayıdır; 8192 / 16384 tam sayı bölmesinde 0 olur ve float'a atanınca 0.00 yazılır. 16384.0 yazılmalıdır. int16_t doğru türdür.",
              "skills": [
                "i2c-registers",
                "prog-debug"
              ]
            },
            {
              "id": "m4h5d58-q4",
              "kind": "predict-output",
              "prompt": "Çip eğilmeden yatay yönde hızlanıyor: ax = 0,3 g ve az = 1,0 g okunuyor. Bu kod ne yazar?\n\n```\nfloat pitch = atan2(0.3, 1.0) * 180.0 / PI;\nSerial.println(pitch, 1);\n```",
              "options": [
                "0.0",
                "30.0",
                "73.3",
                "16.7"
              ],
              "answer": 3,
              "explanation": "atan2(0,3; 1) yaklaşık 0,2915 radyandır; x 180/PI = 16,7 derece. Çip eğilmediği hâlde açı çıktı, çünkü ivmeölçer yer çekimi ile çipin kendi hızlanmasını ayıramaz.",
              "skills": [
                "accel-angle"
              ]
            },
            {
              "id": "m4h5d58-q5",
              "kind": "numeric",
              "prompt": "İvme X = 0,26 g ve İvme Z = 0,97 g okunuyor. pitch = atan2(ax, az) x 180 / PI kaç derecedir?",
              "answer": 15,
              "tolerance": 0.5,
              "unit": "derece",
              "explanation": "ax / az = 0,268 ve arctan(0,268) yaklaşık 15,0 derecedir (tan 15 = 0,268). Sonuç radyan değil derece cinsindendir çünkü 180/PI ile çarptık.",
              "skills": [
                "accel-angle"
              ]
            }
          ]
        },
        {
          "title": "Jiroskop sapması ve tamamlayıcı filtre",
          "durationMin": 30,
          "problem": "58. derste ivmeölçerle eğim açısını bulduk. Ama çip sarsılınca (58. dersteki `ax = 0,3 g` deneyi) açı çıldırdı. Jiroskop ise \"ne kadar hızlı dönüyorum\" der ve hareket anında harika çalışır. İki sensör var, ikisi de kusurlu. Birini diğerinin eksiğini kapatacak şekilde birleştirebilir miyiz?",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Devre 58. dersin MPU6050 bölümüyle aynı; LED gerekmez.\n\n| Parça | Bağlantı |\n|---|---|\n| MPU6050 VCC | 5V |\n| MPU6050 GND | GND |\n| MPU6050 SDA | **A4** |\n| MPU6050 SCL | **A5** |\n\n### Jiroskop ne ölçer?\nİvmeölçer açıyı doğrudan verir. Jiroskop ise **dönüş hızını** (°/s) verir. Açıyı bulmak için hızı zamanla toplarız: bir saniye boyunca 10 °/s dönüyorsan 10° dönmüşsün demektir. Bunu küçük adımlarla yaparız:\n\n```cpp\naci = aci + hiz * dt;     // hiz: °/s, dt: son ölçümden bu yana geçen saniye\n```\nBuna **integral** almak denir. Bu hafta pitch (öne-arkaya eğim) çipin Y ekseni etrafındaki dönüşüdür. Bu yüzden jiroskoptan `gy` değerini kullanacağız.\n\nNot: Gerçek MPU6050'de +Y etrafındaki bir dönüş, 58. dersteki `atan2(ax, az)` açısını genelde azaltır; yani iki işaret ters çıkabilir. O durumda `gy`'nin işaretini çevirirsin (aşağıdaki \"Sık yapılan hatalar\"a bak). Laboratuvarda ivme ve jiroskop özellikleri birbirinden bağımsızdır; tutarlı değerleri sen seçersin.\n\n### Sapma (bias): durağanken sıfır değil\nÇip hareketsiz dururken `gy` tam sıfır olmalı, değil mi? Değil. Gerçek çipler küçük bir sabit değer gösterir (tipik olarak birkaç °/s; veri sayfası başlangıç sapması için ±20 °/s'ye kadar tolerans verir, kesin değer için çipinin veri sayfasına bak). Buna **sapma** (bias) denir. Değeri çipten çipe değişir, sıcaklıkla da kayabilir.\n\nSapmayı bulmak kolaydır: çip **kıpırdamıyorken** yüzlerce ölçüm al ve ortalamasını hesapla. O ortalama sapmadır. Sonra her ölçümden sapmayı çıkar.\n\nLaboratuvardaki sanal çipin jiroskop özellikleri varsayılan olarak 0'dır, yani sapması yoktur. Gerçek bir çipin sapmasını taklit etmek için ▶'e basmadan önce MPU6050'nin **Jiroskop Y** özelliğini 2 yap.\n\n### Program 1: Sapmayı ölç ve çıkar\n```cpp\n// sketch: mpu_sapma_olc\n#include <Wire.h>\n\nconst int MPU = 0x68;\nconst int ORNEK = 200;\nfloat sapmaGy = 0;\n\nfloat gyOku() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x45);                 // Y ekseni jiroskop (yüksek bayt)\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 2, true);\n  int yuksek = Wire.read();\n  int dusuk = Wire.read();\n  int16_t ham = (int16_t)((yuksek << 8) | dusuk);\n  return ham / 131.0;               // °/s\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  Wire.beginTransmission(MPU);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  delay(100);\n\n  float toplam = 0;\n  for (int i = 0; i < ORNEK; i++) {\n    toplam += gyOku();\n    delay(5);\n  }\n  sapmaGy = toplam / ORNEK;         // durağan ortalama = sapma\n  Serial.print(\"Sapma gy = \");\n  Serial.print(sapmaGy, 2);\n  Serial.println(\" derece/sn\");\n}\n\nvoid loop() {\n  float gy = gyOku();\n  Serial.print(\"gy ham=\");\n  Serial.print(gy, 1);\n  Serial.print(\" duzeltilmis=\");\n  Serial.println(gy - sapmaGy, 1);\n  delay(500);\n}\n```\n▶'e bastıktan sonra ilk bir saniye (sapma ölçülürken) özellikleri değiştirme. Önce `Sapma gy = 2.00` satırını görürsün. Sonra **Jiroskop Y**'yi 32 yap (30 °/s'lik gerçek dönüş + 2 °/s sapma): `duzeltilmis` yaklaşık 30 gösterir. 2'ye geri döndüğünde `duzeltilmis` sıfıra yakın olur.\n\n### Açıyı jiroskopla toplarsak: sapma birikir\nŞimdi bir deney yapalım. Çip sabit duruyor; ama jiroskop 2 °/s gibi küçük bir sapma gösteriyor olsun. Açıyı integral ile bulursak:\n\n- 1 saniyede: 2 × 1 = 2° kayma\n- 10 saniyede: 2 × 10 = **20° kayma**\n- 1 dakikada: 120° kayma\n\nÇip hiç hareket etmedi ama hesaplanan açı gerçekten uzaklaştı. Her ölçüm çok küçük bir hata ekler, hataları toplayınca büyür. Sapmayı ölçüp çıkarsan bile geriye kalan küçük bir hata (sapma zamanla ya da ısıyla değişebilir) yine birikir.\n\n### Program 2: İntegralin kayması\n```cpp\n// sketch: mpu_integral\n#include <Wire.h>\n\nconst int MPU = 0x68;\nconst int ORNEK = 200;\n\nfloat sapmaGy = 0;\nfloat gyroHam = 0;                  // sapma çıkarılmadan integral\nfloat gyroDuz = 0;                  // sapma çıkarılarak integral\nunsigned long sonUs = 0;\nunsigned long baslaMs = 0;\nunsigned long sonYazMs = 0;\n\nfloat gyOku() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x45);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 2, true);\n  int yuksek = Wire.read();\n  int dusuk = Wire.read();\n  int16_t ham = (int16_t)((yuksek << 8) | dusuk);\n  return ham / 131.0;\n}\n\nfloat ivmeAci() {                   // 58. ders: pitch = atan2(ax, az)\n  Wire.beginTransmission(MPU);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 6, true);\n  int axH = Wire.read(); int axL = Wire.read();\n  int ayH = Wire.read(); int ayL = Wire.read();\n  int azH = Wire.read(); int azL = Wire.read();\n  float ax = (int16_t)((axH << 8) | axL) / 16384.0;\n  float az = (int16_t)((azH << 8) | azL) / 16384.0;\n  return atan2(ax, az) * 180.0 / PI;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  Wire.beginTransmission(MPU);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  delay(100);\n\n  float toplam = 0;\n  for (int i = 0; i < ORNEK; i++) {\n    toplam += gyOku();\n    delay(5);\n  }\n  sapmaGy = toplam / ORNEK;\n\n  gyroHam = ivmeAci();              // başlangıç açısı: ivmeölçerden\n  gyroDuz = gyroHam;\n  sonUs = micros();\n  baslaMs = millis();\n  sonYazMs = baslaMs;\n}\n\nvoid loop() {\n  float gy = gyOku();\n\n  unsigned long simdi = micros();\n  float dt = (simdi - sonUs) / 1000000.0;     // saniye\n  sonUs = simdi;\n\n  gyroHam += gy * dt;\n  gyroDuz += (gy - sapmaGy) * dt;\n\n  if (millis() - sonYazMs >= 1000) {\n    sonYazMs += 1000;\n    Serial.print(\"t=\");\n    Serial.print((millis() - baslaMs) / 1000.0, 1);\n    Serial.print(\" ham=\");\n    Serial.print(gyroHam, 1);\n    Serial.print(\" duz=\");\n    Serial.print(gyroDuz, 1);\n    Serial.print(\" acc=\");\n    Serial.println(ivmeAci(), 1);\n  }\n  delay(10);\n}\n```\nÇipi eğik ve sabit tutmak için ▶'e basmadan önce **Jiroskop Y = 2**, **İvme X = 0,17**, **İvme Z = 0,98** yap (yaklaşık 10°). Seri monitöre bak: `acc` hep aynı kalır (laboratuvar sensörü gürültüsüzdür). `ham` zamanla yürür gider. `duz` ise sapma çıkarıldığı için sabit kalır; sapma sonradan değişirse (aşağıdaki Dene'de göreceksin) yalnızca kalan küçük hata kadar kayar.\n\n### İvmeölçerin sorunu: gürültü ve titreşim\nİvmeölçer kaymaz. Çip aynı eğimde duruyorsa sonsuza kadar aynı açıyı söyler. Ama yer çekimi dışındaki her ivmeyi de ölçer: motor titreşimi, elin sarsıntısı, yürüyen bir robotun sekmesi. (Laboratuvar çipi bu gürültüyü kendiliğinden üretmez; titreşimi, İvme X'i hızlıca değiştirerek sen yaparsın.) 58. dersteki gibi `ax`'e fazladan 0,3 g eklenirse açı 16,7° sapar. Yani ivmeölçer:\n\n- **Uzun vadede doğru** (kaymaz), **kısa vadede gürültülü**.\n\nJiroskop ise tam tersi:\n\n- **Kısa vadede doğru** (hızlı değişimi iyi yakalar), **uzun vadede kayar** (sapma birikir).\n\n### Tamamlayıcı filtre\nİki sensör birbirinin eksiğini tamamlar. Fikir: açıyı jiroskopla güncelle (hızlı, sakin), ama her adımda ivmeölçerin açısına doğru küçük bir çekme uygula (kaymayı durdurur):\n\n```\naci = α · (aci + gy · dt) + (1 − α) · accAci\n```\n- `aci + gy · dt`: önceki açıya jiroskopun gördüğü dönüşü ekler.\n- `accAci`: ivmeölçerden atan2 ile bulunan açı.\n- `α` (alfa): jiroskopa ne kadar güveneceğin. Genelde **0,98**. Yani her adımda %98 jiroskop, %2 ivmeölçer.\n\nBu çok küçük %2'lik çekme, saniyede yüz adım atılan bir döngüde biriktiği için kaymayı durdurur. Sürekli hatayı düzelten küçük bir \"geri çekme\" gibi düşün. Titreşimli ivmeölçer ise hep %2 ağırlıkta girdiği için gürültüsü süzülür.\n\n`dt = 10 ms` ve `α = 0,98` iken filtrenin düzeltme hızı (zaman sabiti) yaklaşık `α · dt / (1 − α) = 0,98 · 0,01 / 0,02 ≈ 0,5 s` kadardır. Yani yanlış başlasa bile filtre birkaç yarım saniyede doğru açıya oturur.\n\n### Program 3: Tamamlayıcı filtre\n```cpp\n// sketch: mpu_tamamlayici\n#include <Wire.h>\n\nconst int MPU = 0x68;\nconst int ORNEK = 200;\nconst float ALFA = 0.98;\n\nfloat sapmaGy = 0;\nfloat aci = 0;                      // filtreli açı\nfloat saf = 0;                      // karşılaştırma: yalnız jiroskop integrali\nunsigned long sonUs = 0;\nunsigned long baslaMs = 0;\nunsigned long sonYazMs = 0;\n\nfloat gyOku() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x45);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 2, true);\n  int yuksek = Wire.read();\n  int dusuk = Wire.read();\n  int16_t ham = (int16_t)((yuksek << 8) | dusuk);\n  return ham / 131.0;\n}\n\nfloat ivmeAci() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 6, true);\n  int axH = Wire.read(); int axL = Wire.read();\n  int ayH = Wire.read(); int ayL = Wire.read();\n  int azH = Wire.read(); int azL = Wire.read();\n  float ax = (int16_t)((axH << 8) | axL) / 16384.0;\n  float az = (int16_t)((azH << 8) | azL) / 16384.0;\n  return atan2(ax, az) * 180.0 / PI;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  Wire.beginTransmission(MPU);\n  Wire.write(0x6B);\n  Wire.write(0);\n  Wire.endTransmission(true);\n  delay(100);\n\n  float toplam = 0;\n  for (int i = 0; i < ORNEK; i++) {\n    toplam += gyOku();\n    delay(5);\n  }\n  sapmaGy = toplam / ORNEK;\n\n  aci = ivmeAci();\n  saf = aci;\n  sonUs = micros();\n  baslaMs = millis();\n  sonYazMs = baslaMs;\n}\n\nvoid loop() {\n  float gy = gyOku() - sapmaGy;\n  float acc = ivmeAci();\n\n  unsigned long simdi = micros();\n  float dt = (simdi - sonUs) / 1000000.0;\n  sonUs = simdi;\n\n  saf += gy * dt;\n  aci = ALFA * (aci + gy * dt) + (1.0 - ALFA) * acc;\n\n  if (millis() - sonYazMs >= 200) {\n    sonYazMs += 200;\n    Serial.print(\"t=\");\n    Serial.print((millis() - baslaMs) / 1000.0, 1);\n    Serial.print(\" acc=\");\n    Serial.print(acc, 1);\n    Serial.print(\" saf=\");\n    Serial.print(saf, 1);\n    Serial.print(\" filtre=\");\n    Serial.println(aci, 1);\n  }\n  delay(10);\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup` içinde 200 ölçümün ortalaması sapma olarak saklanır; çip bu sırada kıpırdamamalıdır.\n2. Başlangıç açısı ivmeölçerden alınır, çünkü integral yalnız **değişimi** bilir, başlangıç açısını bilmez.\n3. `loop` her turda `dt`'yi `micros()` farkından hesaplar. Sabit 0,01 yazmak yerine gerçek geçen süreyi kullanmak, `delay` ve I2C süreleri değişse bile doğru integral verir.\n4. `saf` yalnız jiroskopu toplar. `aci` ise formülü uygular. Seri Ekran'da ikisini yan yana görürsün.\n5. Sabit eğimde ve sapma sonradan değiştiğinde (örneğin çalışırken Jiroskop Y'yi 2'den 4'e çıkardın): `acc` sabit kalır, `saf` yavaşça kayar (sapmayı çıkardıktan sonra kalan küçük hata yüzünden), `filtre` ise sakin ve doğru kalır.\n6. İvme özelliklerini hızlıca oynatıp titreşim yaparsan `acc` zıplar, `filtre` ise jiroskop ağırlıklı olduğu için çok az oynar. Gerçek bir dönüşte (ivme ve jiroskop birlikte değişince) `filtre` jiroskop sayesinde hemen tepki verir.\n\nFiltrenin tam doğru olmadığına da dikkat et. Jiroskopta ölçtüğünle gerçek arasında hâlâ küçük bir hata kalırsa (sapma değiştiyse), `filtre` doğru değerin birazcık yanında durur. Hata `α · hata · dt / (1 − α)` kadardır. Örneğin kalan hata 2 °/s, `dt = 0,01 s`, `α = 0,98` ise yaklaşık 1° olur. Yalnız jiroskop kullansan aynı hata 10 saniyede 20° olurdu.\n\n### Dene\n- `ALFA` değerini 0,90 yap. İvme X'i hızlıca 0,17 ile 0,35 arasında oynat: `filtre` daha çok mu, daha az mı oynuyor? Hızlı hareketi daha iyi mi yakalıyor?\n- `ALFA` değerini 0,999 yap. Filtrenin doğru açıya oturması neden çok yavaşlıyor? (Zaman sabiti yaklaşık 0,999 · 0,01 / 0,001 ≈ 10 saniyedir.)\n- Çip eğikken başlat: ▶'e basmadan önce İvme X = 0,5, İvme Z = 0,87 (yaklaşık 30°). Çalışırken İvme X'i 0, İvme Z'yi 1 yap. `filtre` ve `saf` birbirinden nasıl ayrılıyor? (`saf` yalnız jiroskopa bakar, ivmeölçerin yeni durumunu görmez.)\n- Sapma sonradan değişsin: çalışırken Jiroskop Y'yi 2'den 4'e çıkar. `saf` ile `filtre` 10 saniyede ne kadar kayıyor?\n\n### Sık yapılan hatalar\n- Sapmayı ölçerken (programın ilk saniyesinde) çip hareket ediyormuş gibi özellikleri değiştirmek, ya da gerçek bir çipi tutmak/masaya vurmak: sapma yanlış ölçülür, her şey kayar.\n- Sapmayı hiç çıkarmamak: `saf` ve hatta `filtre` küçük bir sabit hata taşır.\n- `dt` değerini sabit yazıp gerçek süreyi kullanmamak: `delay` ya da yazdırma süresi değişince integral yanlış çıkar.\n- Birimleri karıştırmak: `gy` °/s, `dt` saniye olmalı. Milisaniye yazarsan 1000 kat büyük kayma görürsün.\n- `α` değerini 1'e çok yakın seçmek: ivmeölçer neredeyse hiç etkili olmaz, kayma geri gelir.\n- `atan2` ile bulunan açı ve jiroskop dönüşünün işaretlerini ters almak: filtre açıyı bir yöne iterken öbür yöne çeker. İşaret ters çıkarsa `gy` değerinin işaretini değiştir.",
          "question": "Telefonlarda ve dronelarda bu fikir (iki sensörü birleştirmek) her yerde kullanılır. Daha gelişmiş filtreler (Kalman filtresi gibi) aynı problemi daha akıllı çözer. Sence \"iki kusurlu sensörü birleştirmek\" neden tek mükemmel sensör aramaktan daha mantıklı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Jiroskopun dönüş hızı ölçtüğünü, açının hızın zamanla toplanmasıyla bulunduğunu\n- Sapmanın (bias) ne olduğunu, nasıl ölçülüp çıkarıldığını ve neden hata biriktirdiğini\n- İvmeölçer ile jiroskopun güçlü ve zayıf yanlarını\n- Tamamlayıcı filtre formülünü ve `α` değerinin etkisini\n\n### Önceden bilmen gerekenler\nDers 58'de MPU6050'den ham veri okuma ve `atan2` ile ivmeölçer açısı; ders 27'de `millis`/`micros` ile geçen süreyi ölçme; ders 14'te ortalama alarak gürültüyü azaltma.\n\n### Hızı topla, açıyı bul\nJiroskop açıyı değil **dönüş hızını** (°/s) verir. Açı için hız, geçen süreyle çarpılıp toplanır:\n\n```\naci = aci + hiz * dt;     // hiz: derece/sn, dt: saniye\n```\n\nÖrnek: 10 °/s hızla 3 saniye dönen çip 30 derece döner. Birimler uyumlu olmalı: `dt` milisaniye olursa sonuç 1000 kat büyür.\n\n### Sapma birikir\nDurağan jiroskop tam sıfır göstermez; birkaç °/s'lik sabit bir **sapma** (bias) okur. Sapmayı çip kıpırdamıyorken yüzlerce okumanın ortalamasıyla bulursun ve her okumadan çıkarırsın. Sapmayı çıkarmasan hata hemen büyür; çıkarsan bile geriye kalan küçük hata (sapma ısıyla kayabilir) toplandıkça büyür. Çıkarılmayan 2 °/s için:\n\n```\nsapma 2 °/s   1 sn -> 2 derece   10 sn -> 20 derece   1 dk -> 120 derece\n```\n\nÇip hiç oynamadığı hâlde hesaplanan açı uzaklaşır.\n\n### İki kusurlu sensör\n| Sensör | Kısa vadede | Uzun vadede |\n|---|---|---|\n| İvmeölçer | gürültülü (titreşim bozar) | doğru, kaymaz |\n| Jiroskop | doğru, hızlı | kayar |\n\nBiri öbürünün eksiğini kapatır.\n\n### Tamamlayıcı filtre\n```\naci = ALFA * (aci + gy * dt) + (1 - ALFA) * ivmeAci;\n```\n\nHer adımda jiroskopla güncellenir (hızlı, sakin), sonra ivmeölçerin açısına doğru küçük bir çekme uygulanır (kaymayı durdurur). `ALFA` = 0,98 demek %98 jiroskop, %2 ivmeölçer demektir. Sayısal örnek: `aci` = 10, `gy` = 20, `dt` = 0,01, ivme açısı 12 ise yeni açı 0,98 × 10,2 + 0,02 × 12 = 10,236 olur.\n\n`ALFA` küçülürse ivmeölçer ağırlık kazanır: filtre kaymaz ama titreşimden etkilenir. `ALFA` 1'e yaklaşırsa filtre sakin olur ama kayma geri gelir ve doğru açıya geç oturur. Kalan jiroskop hatası `b` iken filtrenin kalıcı hatası yaklaşık `ALFA · b · dt / (1 − ALFA)` kadardır: 2 °/s, 0,01 s ve 0,98 için yaklaşık 1 derece. Aynı hata yalnız integralde 10 saniyede 20 derece olurdu.\n\n### Özet\nJiroskop hızı verir; açı hızın toplanmasıyla bulunur ve sapma birikerek kaymaya yol açar. İvmeölçer kaymaz ama titreşime duyarlıdır. Tamamlayıcı filtre ikisini ağırlıklı toplar: kısa vadede jiroskopa, uzun vadede ivmeölçere güvenir. `dt` her turda gerçek geçen süreden hesaplanır.",
          "concepts": [
            {
              "term": "Jiroskop",
              "definition": "Dönüş hızını (°/s) ölçen sensör. Açı elde etmek için hızın zamanla toplanması gerekir.",
              "example": "gy = 10 °/s ile 3 saniye dönen çip 30 derece döner.",
              "pitfall": "Jiroskop değerini doğrudan açı sanmak."
            },
            {
              "term": "İntegral (açı = açı + hız x dt)",
              "definition": "Hızı küçük zaman adımlarıyla çarpıp toplayarak açıyı bulma.",
              "example": "aci += gy * dt; ile dt saniye olarak hesaplanır.",
              "pitfall": "dt'yi milisaniye yazmak: sonuç 1000 kat büyür."
            },
            {
              "term": "Sapma (bias)",
              "definition": "Durağan jiroskopun gösterdiği küçük sabit değer. Hareketsizken ortalama alınarak bulunur.",
              "example": "Sapma 2 °/s ise 10 saniyede 20 derecelik sahte dönüş birikir.",
              "pitfall": "Sapma ölçerken çipi oynatmak: sapma yanlış ölçülür."
            },
            {
              "term": "Tamamlayıcı filtre",
              "definition": "Kısa vadede jiroskopa, uzun vadede ivmeölçere güvenerek ikisini ağırlıklı toplayan filtre.",
              "example": "aci = 0,98 x (aci + gy x dt) + 0,02 x ivmeAci",
              "pitfall": "ALFA'yı 1'e çok yaklaştırmak: ivmeölçer etkisiz kalır, kayma geri gelir."
            },
            {
              "term": "ALFA (alfa)",
              "definition": "Filtrede jiroskopa verilen ağırlık. Genelde 0,98.",
              "example": "ALFA = 0,98 ise her adımda %98 jiroskop, %2 ivmeölçer.",
              "pitfall": "ALFA küçük olunca titreşimin açıyı bozmasına şaşırmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h5d59-q1",
              "kind": "numeric",
              "prompt": "Çip masada hiç kıpırdamıyor ama jiroskop 1,5 °/s sapma gösteriyor ve sapma çıkarılmadan açı hız x süre ile toplanıyor. 20 saniye sonra hesaplanan açı kaç derece uzaklaşır?",
              "answer": 30,
              "tolerance": 0,
              "unit": "derece",
              "explanation": "Kayma = sapma x süre = 1,5 x 20 = 30 derece. Çip hareket etmediği hâlde açı uzaklaşır; bu yüzden sapma ölçülüp çıkarılır ve ivmeölçerle düzeltilir.",
              "skills": [
                "gyro-drift"
              ]
            },
            {
              "id": "m4h5d59-q2",
              "kind": "mcq",
              "prompt": "Hangi ifade doğrudur?",
              "options": [
                "Jiroskop uzun vadede doğrudur, ivmeölçer kayar",
                "İvmeölçer kısa vadede gürültülüdür ama uzun vadede kaymaz; jiroskop kısa vadede iyidir ama kayar",
                "İkisi de uzun vadede kayar",
                "İvmeölçer dönüş hızını, jiroskop açıyı doğrudan verir"
              ],
              "answer": 1,
              "explanation": "İvmeölçer yer çekimine bakar, bu yüzden kaymaz ama titreşimi de ölçer. Jiroskop hızı ölçer; hızlı değişimi iyi yakalar ama sapma birikir. İkisini birleştirmek tamamlayıcı filtrenin işidir.",
              "skills": [
                "gyro-drift",
                "complementary-filter"
              ]
            },
            {
              "id": "m4h5d59-q3",
              "kind": "numeric",
              "prompt": "Tamamlayıcı filtrenin tek adımı: önceki aci = 10, düzeltilmiş gy = 20 °/s, dt = 0,01 s, ivmeölçer açısı = 12 ve ALFA = 0,98. Yeni aci kaç olur?",
              "answer": 10.236,
              "tolerance": 0.01,
              "unit": "derece",
              "explanation": "aci + gy x dt = 10 + 0,2 = 10,2. 0,98 x 10,2 = 9,996 ve 0,02 x 12 = 0,24. Toplam 10,236. Yalnız jiroskop 10,2 verirdi; ivmeölçer sonucu 12'ye doğru biraz çeker.",
              "skills": [
                "complementary-filter"
              ]
            },
            {
              "id": "m4h5d59-q4",
              "kind": "predict-output",
              "prompt": "Durağan çipin jiroskopu 2,0 °/s sapma gösteriyor ve sapma çıkarılmıyor. Bu kod ne yazar?\n\n```\nfloat aci = 0;\nfloat gy = 2.0;\nfloat dt = 0.5;\nfor (int i = 0; i < 10; i++) {\n  aci += gy * dt;\n}\nSerial.println(aci, 1);\n```",
              "options": [
                "0.0",
                "2.0",
                "20.0",
                "10.0"
              ],
              "answer": 3,
              "explanation": "Her turda 2,0 x 0,5 = 1,0 eklenir ve 10 tur sonunda 10,0 olur. Çip hiç dönmediği hâlde açı 10 derece uzaklaştı: sapmanın birikmesi. Sapma çıkarılsaydı sonuç yaklaşık 0 olurdu.",
              "skills": [
                "gyro-drift"
              ]
            },
            {
              "id": "m4h5d59-q5",
              "kind": "find-bug",
              "prompt": "Filtre açısı gerçekte olması gerekenden çok farklı ve dönüş sırasında hızlıca patlıyor. Hatalı satır hangisi?\n\n```\nunsigned long simdi = micros();\nfloat dt = (simdi - sonUs) / 1000.0;\nsonUs = simdi;\naci = 0.98 * (aci + gy * dt) + 0.02 * acc;\n```",
              "options": [
                "unsigned long simdi = micros();",
                "sonUs = simdi;",
                "float dt = (simdi - sonUs) / 1000.0;",
                "aci = 0.98 * (aci + gy * dt) + 0.02 * acc;"
              ],
              "answer": 2,
              "explanation": "micros() mikrosaniye verir; saniyeye çevirmek için 1000000.0'a bölmek gerekir. 1000.0 ile bölünce dt milisaniye olur ve integral 1000 kat büyük çıkar. Filtre formülü doğrudur.",
              "skills": [
                "gyro-drift",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Proje: El eğimiyle kontrol edilen servo (mini gimbal)",
          "durationMin": 35,
          "problem": "Kamera taşıyan sistemlerde (el gimbalı, drone) kamera ne kadar sallanırsa sallansın görüntü yatay kalır. İçlerinde küçük motorlar ve bir eğim sensörü vardır: sensör \"taban 20° eğildi\" der, motor ters yönde 20° döner ve kamera yerinde sabit kalır. Bu projede bu fikrin tek eksenli, masaya sığan bir modelini kuracaksın.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Modül 3, Hafta 5 (21. ders):** Servo ve açı → darbe genişliği.\n- **Modül 3, Hafta 6 (27. ders):** `millis()` ile bloklamayan döngü.\n- **Modül 3, Hafta 7 (32-33. dersler):** LCD ve I2C ile açıyı gösterme.\n- **Bu hafta (58-59. dersler):** MPU6050 ile ham veri, pitch hesabı, jiroskop sapması ve tamamlayıcı filtre.\n\nMPU6050 pitch açısını ölçer, tamamlayıcı filtre bunu sakinleştirir. Servo, pitch kadar **ters** yönde döner: pitch +20° ise servo 90 − 20 = 70°'ye gider. Servo koluna bir platform takılı olsaydı, taban eğilince platform yatay kalmaya çalışırdı. Laboratuvarda tabanı MPU6050'nin İvme X ve İvme Z özellikleriyle eğersin, platformun açısını da servonun kol açısından izlersin.\n\nDüğme (D2) o anki eğimi \"sıfır\" kabul eder: taban tam yatay olmasa bile \"şu an yatay\" diyebilirsin.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Laboratuvarda servoyu Uno'nun 5V pininden beslersin.\n\n| Parça | Bağlantı |\n|---|---|\n| MPU6050 VCC | 5V |\n| MPU6050 GND | GND |\n| MPU6050 SDA | **A4** (adres 0x68) |\n| MPU6050 SCL | **A5** |\n| I2C LCD VCC | 5V |\n| I2C LCD GND | GND |\n| I2C LCD SDA | **A4** (adres 0x27) |\n| I2C LCD SCL | **A5** |\n| Servo SIG | **D6** |\n| Servo VCC | 5V |\n| Servo GND | GND |\n| Buton \"sıfırla\" A | **D2** (`INPUT_PULLUP`) |\n| Buton B | GND |\n| Direnç (330 Ω) 1 | **D13** |\n| Direnç 2 | LED **A** (anot) |\n| LED **K** (katot) | GND (\"servo sınırda\" ışığı) |\n\nMPU6050 (0x68) ile LCD (0x27) aynı iki telde yan yana çalışır, çünkü adresleri farklı (33. ders). Devrede RTC (DS3231) parçası bulunmasın; o da 0x68 kullanır.\n\nGerçek donanımda ise servo yük bindirince 5 V düşebilir ve MPU/LCD hatalı çalışabilir; bu yüzden gerçek kurulumda servo ayrı bir 5 V kaynaktan beslenir ve kaynakların GND'leri ortak yapılır. Laboratuvar bu gerilim düşmesini modellemez.\n\n### Tasarım\n- **Pitch:** `atan2(ax, az)` (58. ders).\n- **Filtre:** `aci = 0,98 · (aci + gy · dt) + 0,02 · accAci` (59. ders). Sapma `setup` içinde, çip kıpırdamadan ölçülür.\n- **Sıfırlama:** Düğmeye basılınca o anki `aci` `ofset` olarak saklanır. Kontrol açısı `egim = aci − ofset` olur.\n- **Servo açısı:** `servo = 90 − egim`. Servo mekanik uçlarına dayanmasın diye `10 ... 170°` arasında sınırlanır. Sınıra gelince LED yanar.\n- **Zamanlama:** Döngü her 10 ms'de bir ölçer ve servoyu günceller; LCD ve seri çıktı 250 ms'de bir yenilenir. Hiç `delay` yok (27. ders).\n\nServo, kontrolün sonucunu **görmez**: MPU tabanın eğimini ölçer, platformun gerçekten yatay olup olmadığını ölçmez. Böyle sensör geri bildirimi olmayan kontrole **açık çevrim** denir. Basit ve çoğu masa üstü model için yeterlidir; platformun gerçek açısını ölçüp düzeltmek bir sonraki seviyedir.\n\n### Program\n```cpp\n// sketch: mini_gimbal\n#include <Wire.h>\n#include <Servo.h>\n#include <LiquidCrystal_I2C.h>\n\nconst int MPU = 0x68;\nconst int SERVO_PIN = 6;\nconst int SIFIRLA = 2;\nconst int LED = 13;\n\nconst float ALFA = 0.98;\nconst int SERVO_MERKEZ = 90;\nconst int SERVO_MIN = 10;\nconst int SERVO_MAX = 170;\nconst unsigned long DONGU_MS = 10;\nconst unsigned long EKRAN_MS = 250;\n\nServo servo;\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nfloat sapmaGy = 0;\nfloat aci = 0;                       // filtreli pitch (derece)\nfloat ofset = 0;                     // \"sıfır\" kabul edilen açı\nfloat ax, az, gy;                    // son ölçüm: g, g, °/s\nunsigned long sonDongu = 0;\nunsigned long sonEkran = 0;\nunsigned long sonUs = 0;\nbool oncekiBasili = false;\n\nint16_t oku16() {\n  int yuksek = Wire.read();\n  int dusuk = Wire.read();\n  return (int16_t)((yuksek << 8) | dusuk);\n}\n\nvoid mpuOku() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x3B);\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, 14, true);\n  ax = oku16() / 16384.0;\n  oku16();                           // ay: kullanmıyoruz\n  az = oku16() / 16384.0;\n  oku16();                           // sıcaklık\n  oku16();                           // gx\n  gy = oku16() / 131.0;              // pitch: Y ekseni etrafında dönüş\n  oku16();                           // gz\n}\n\nfloat ivmeAci() {\n  return atan2(ax, az) * 180.0 / PI;\n}\n\nvoid ekranYaz(float egim, int servoAci) {\n  lcd.setCursor(0, 0);\n  lcd.print(\"Egim: \");\n  lcd.print(egim, 1);\n  lcd.print(\"      \");\n  lcd.setCursor(0, 1);\n  lcd.print(\"Servo: \");\n  lcd.print(servoAci);\n  lcd.print(\"      \");\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(SIFIRLA, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n  servo.attach(SERVO_PIN);\n  servo.write(SERVO_MERKEZ);\n\n  Wire.begin();\n  Wire.beginTransmission(MPU);\n  Wire.write(0x6B);\n  Wire.write(0);                     // uyandır\n  Wire.endTransmission(true);\n  delay(100);\n\n  float toplam = 0;                  // sapma ölçümü: çip kıpırdamasın\n  for (int i = 0; i < 100; i++) {\n    mpuOku();\n    toplam += gy;\n    delay(5);\n  }\n  sapmaGy = toplam / 100;\n\n  mpuOku();\n  aci = ivmeAci();                   // başlangıç açısı ivmeölçerden\n  lcd.init();\n  lcd.backlight();\n  sonUs = micros();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // 1) Sıfırlama düğmesi: basıldığı an bir kez\n  bool basili = (digitalRead(SIFIRLA) == LOW);\n  if (basili && !oncekiBasili) {\n    ofset = aci;\n  }\n  oncekiBasili = basili;\n\n  // 2) Her 10 ms'de ölçüm, filtre ve servo\n  if (simdi - sonDongu >= DONGU_MS) {\n    sonDongu = simdi;\n\n    mpuOku();\n    unsigned long us = micros();\n    float dt = (us - sonUs) / 1000000.0;\n    sonUs = us;\n    aci = ALFA * (aci + (gy - sapmaGy) * dt) + (1.0 - ALFA) * ivmeAci();\n\n    float egim = aci - ofset;\n    int servoAci = SERVO_MERKEZ - (int)round(egim);   // ters yönde dön\n    bool sinirda = (servoAci <= SERVO_MIN || servoAci >= SERVO_MAX);\n    servoAci = constrain(servoAci, SERVO_MIN, SERVO_MAX);\n    servo.write(servoAci);\n    digitalWrite(LED, sinirda ? HIGH : LOW);\n\n    // 3) Ekran ve seri çıktı: 250 ms'de bir\n    if (simdi - sonEkran >= EKRAN_MS) {\n      sonEkran = simdi;\n      ekranYaz(egim, servoAci);\n      Serial.print(\"egim=\");\n      Serial.print(egim, 1);\n      Serial.print(\" servo=\");\n      Serial.println(servoAci);\n    }\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup` servoyu ortaya (90°) alır, MPU'yu uyandırır ve 100 ölçümün ortalamasıyla jiroskop sapmasını bulur (59. ders). ▶'e basınca ilk yarım saniye (bu ölçüm sürerken) MPU6050'nin özelliklerini değiştirme.\n2. `mpuOku` 14 baytı tek seferde okur (58. ders) ama yalnız işimize yarayanları saklar: `ax`, `az` ve `gy`.\n3. Her 10 ms'de bir tamamlayıcı filtre çalışır. `dt`, `micros()` farkından hesaplanır; döngünün süresi biraz oynasa bile integral doğru kalır.\n4. `egim = aci − ofset`: düğmeye basınca o anki açı sıfır olur.\n5. `servoAci = 90 − egim`: eğim pozitifse servo 90'ın altına gider, yani ters yönde döner. `constrain` ile 10 ile 170 arasında tutulur. Sınıra gelince LED yanar.\n6. `servo.write` darbe genişliğini ayarlar (21. ders): 90° ≈ 1472 µs, 70° ≈ 1266 µs.\n7. `loop` hiç beklemez; butona, ölçüme ve ekrana ayrı zaman damgalarıyla (`millis`) bakar.\n\nPlatform ters yönde dönüyorsa (servo montajına göre olabilir), `SERVO_MERKEZ - ...` ifadesini `SERVO_MERKEZ + ...` yap.\n\n### Dene\n- `ALFA` değerini 0,90 yap. Titreşimi taklit et: İvme X'i hızlıca 0 ile 0,2 arasında değiştir. Servo ne kadar titriyor? `ALFA` 0,99 iken servo ne kadar geç tepki veriyor?\n- `SERVO_MIN` ve `SERVO_MAX` değerlerini 45 ve 135 yap. Sınırda LED ne zaman yanıyor?\n- Roll eksenini de ekle: ikinci bir servoyu D9'a bağla ve `roll = atan2(ay, az)` açısıyla sür. İki eksenli gimbal olur (`ay` değerini `mpuOku` içinde saklaman gerekir).\n- Sapma sonradan değişsin: çalışırken Jiroskop Y'yi 0'dan 3'e çıkar. Servo yavaşça kayıyor mu, yoksa filtre onu tutuyor mu? Kalan hatayı 59. dersteki formülle (`α · hata · dt / (1 − α)`) hesapla.\n\n### Sık yapılan hatalar\n- Gerçek donanımda servoyu kartın 5 V pininden beslemek ve servo yük bindirince MPU ya da LCD'nin donmasına şaşırmak. Gerçek kurulumda harici güç ve ortak GND kullan.\n- Sapma ölçülürken (programın ilk yarım saniyesinde) tabanı oynatmak: sapma yanlış ölçülür ve servo sürekli kayar.\n- MPU6050 ile aynı hatta RTC (DS3231, aynı 0x68 adresi) kullanmak.\n- `dt` yerine sabit 0,01 yazmak: döngü süresi değişince filtre bozulur.\n- Servo açısını sınırlamamak: servo mekanik ucuna dayanıp zorlanır, ses çıkarır, ısınır.\n- `delay` kullanmak: butona basışı kaçırır ve filtre `dt`'sini bozar.",
          "question": "Gerçek gimbalda platformun kendi açısını ölçen ikinci bir sensör ve hatayı sürekli düzelten bir kontrol vardır. Bizim modelde böyle bir geri bildirim yok. Kameranın tabanı yavaşça ve hızlıca eğildiğinde modelimiz hangisinde daha çok hata yapar? Neden?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Önceki derslerin parçalarını (MPU6050, filtre, servo, LCD, düğme) tek projede birleştirmeyi\n- Eğimi servoya \"ters yönde\" çevirmeyi ve açıyı güvenli aralığa sınırlamayı\n- `millis` ile birden çok işi bloklamadan, farklı hızlarda yürütmeyi\n- Açık çevrim kontrolün ne demek olduğunu\n\n### Önceden bilmen gerekenler\nDers 21'de servo açısı ve darbe genişliği; ders 27'de `millis` ile bloklamayan döngü; ders 33'te I2C'de birden çok cihaz; ders 58 ve 59'da MPU6050, pitch ve tamamlayıcı filtre.\n\n### Fikir: eğimi ters çevir\nBir gimbal tabanı eğilince platformu yatay tutmaya çalışır. Bizim modelde MPU6050 tabanın eğimini ölçer, servo bu açıyı ters yönde uygular:\n\n```\negim  = aci - ofset          // düğmeyle \"yatay\" kabul edilen açı çıkarılır\nservo = 90 - egim            // ortası 90, ters yönde dön\nservo = constrain(servo, 10, 170)\n```\n\nTaban +20 derece eğilirse servo 90 − 20 = 70 dereceye gider. Egim 85 olsa 90 − 85 = 5 çıkar, ama `constrain` bunu 10'a yükseltir; sınırda LED yanar.\n\n### Neden sınırlıyoruz?\nServo 0 ya da 180'e tam dayanırsa mekanik uca zorlanır, ısınır, ses yapar. Bu yüzden 10...170 aralığı güvenli bir paydır. `servo.write(70)` yaklaşık 1266 µs'lik bir darbe üretir (544 µs ile 2400 µs arasında doğrusal).\n\n### Her iş kendi hızında\nProjede üç iş vardır: butonu yakalamak, filtreyi ve servoyu 10 ms'de bir güncellemek, LCD ve seri çıktıyı 250 ms'de bir yenilemek. `delay()` hepsini bekletir: buton kaçar, filtrenin `dt`'si bozulur. Bunun yerine her işin son çalışma zamanı saklanır ve `millis()` farkına bakılır. Düğme, kenar algılamayla yalnız basıldığı anda `ofset`'i günceller.\n\n### Açık çevrim\nBu sistemde MPU yalnız tabanı ölçer; platformun gerçekten yatay olup olmadığına bakan bir sensör yoktur. Çıkışı ölçüp hatayı düzeltmeyen kontrole **açık çevrim** denir. Basit ve masa üstü model için yeterlidir. Gerçek gimbalda platformun kendi açısı da ölçülür ve fark sürekli düzeltilir (kapalı çevrim).\n\n### Gerçek donanım notu\nServo yük bindirince 5 V düşebilir ve MPU ile LCD hatalı çalışabilir. Gerçek kurulumda servo ayrı 5 V kaynaktan beslenir ve GND'ler ortak yapılır. MPU6050 ile LCD farklı adreslerde (0x68 ve 0x27) aynı iki telde çalışır; RTC bu hatta olmaz.\n\n### Özet\nMini gimbal, eğim ölçümünü (MPU6050 ve filtre) servo hareketine çevirir. Servo açısı 90 − eğim olur ve 10...170 ile sınırlanır. Tüm işler `millis` ile ayrı hızlarda yürür. Sensör çıkışı ölçmediği için açık çevrimdir.",
          "concepts": [
            {
              "term": "Ofset (sıfırlama)",
              "definition": "Düğmeye basıldığında o anki açıyı \"yatay\" kabul edip sonraki açılardan çıkarma.",
              "example": "egim = aci - ofset; ofset = 12 iken aci 12 ise egim 0 olur.",
              "pitfall": "Ofseti her turda güncellemek: eğim hep 0 görünür."
            },
            {
              "term": "Ters yönde kompanzasyon",
              "definition": "Eğim kadar zıt yönde dönerek platformu yatay tutma. servo = 90 - egim.",
              "example": "egim = 20 ise servo 70 dereceye gider.",
              "pitfall": "İşareti ters almak: platform eğimi iki katına çıkarır."
            },
            {
              "term": "constrain ile sınırlama",
              "definition": "Servo açısını güvenli aralığa (10...170) kısıtlar.",
              "example": "egim = 85 ise 90 - 85 = 5 çıkar ama constrain 10 yapar.",
              "pitfall": "Sınırlamamak: servo mekanik ucuna dayanır, zorlanır ve ısınır."
            },
            {
              "term": "Bloklamayan döngü",
              "definition": "delay() yerine millis() farkıyla her işi kendi hızında yürütmek.",
              "example": "Filtre 10 ms'de, LCD 250 ms'de bir güncellenir.",
              "pitfall": "delay kullanmak: düğmeye basış kaçar, filtre dt'si bozulur."
            },
            {
              "term": "Açık çevrim",
              "definition": "Çıkışın sonucunu ölçmeyen kontrol. Mini gimbalda platformun gerçek açısını ölçen sensör yoktur.",
              "example": "MPU yalnız tabanı ölçer; servo platformu yatay tuttu mu bilinmez.",
              "pitfall": "Açık çevrimi kusursuz sanmak: servo yükü ya da kayma hatayı görünmez bırakır."
            }
          ],
          "quiz": [
            {
              "id": "m4h5d60-q1",
              "kind": "numeric",
              "prompt": "Düğmeye basılınca ofset = 10 oldu. Şu an filtreli açı aci = 25. Mini gimbal egim = aci - ofset ve servo = 90 - egim kuralıyla çalışıyor. Servo kaç dereceye gider? (Sınırlar aşılmıyor.)",
              "answer": 75,
              "tolerance": 0,
              "unit": "derece",
              "explanation": "egim = 25 - 10 = 15 ve servo = 90 - 15 = 75. Eğim pozitif olduğu için servo 90'ın altına, yani ters yöne gider.",
              "skills": [
                "servo-control"
              ]
            },
            {
              "id": "m4h5d60-q2",
              "kind": "predict-output",
              "prompt": "egim = 85 derece olduğunda bu kod ne yazar?\n\n```\nfloat egim = 85;\nint servoAci = 90 - (int)round(egim);\nbool sinirda = (servoAci <= 10 || servoAci >= 170);\nservoAci = constrain(servoAci, 10, 170);\nSerial.print(servoAci);\nSerial.print(\" \");\nSerial.println(sinirda ? 1 : 0);\n```",
              "options": [
                "5 0",
                "5 1",
                "10 0",
                "10 1"
              ],
              "answer": 3,
              "explanation": "90 - 85 = 5; 5 <= 10 olduğundan sinirda true olur. constrain 5'i 10'a yükseltir. Çıktı \"10 1\" olur: servo 10 dereceye gider ve LED sınır uyarısı için yanar.",
              "skills": [
                "servo-control"
              ]
            },
            {
              "id": "m4h5d60-q3",
              "kind": "numeric",
              "prompt": "Servo kütüphanesi 0 dereceyi 544 µs, 180 dereceyi 2400 µs ile eşler (doğrusal). servo.write(70) yaklaşık kaç µs genişliğinde darbe üretir?",
              "answer": 1266,
              "tolerance": 2,
              "unit": "µs",
              "explanation": "544 + 70 / 180 x (2400 - 544) = 544 + 721,8 = 1265,8 yaklaşık 1266 µs (Arduino'nun tam sayı map'i 1265 verir). 90 derece ise 1472 µs'dir.",
              "skills": [
                "servo-control"
              ]
            },
            {
              "id": "m4h5d60-q4",
              "kind": "mcq",
              "prompt": "Mini gimbalda MPU6050 yalnız tabanın eğimini ölçüyor; platformun gerçek açısını ölçen bir sensör yok. Bu tür kontrole ne ad verilir?",
              "options": [
                "Kapalı çevrim",
                "Açık çevrim",
                "Kesme tabanlı kontrol",
                "Bloklamayan kontrol"
              ],
              "answer": 1,
              "explanation": "Çıkışın sonucu ölçülüp hata düzeltilmiyorsa kontrol açık çevrimdir. Platformun açısını da ölçüp farkı sürekli düzelten sistem kapalı çevrimdir. Bloklamayan, millis ile zamanlama biçimidir; kontrol türü değildir.",
              "skills": [
                "control-loop"
              ]
            },
            {
              "id": "m4h5d60-q5",
              "kind": "find-bug",
              "prompt": "Mini gimbal butona basışı sık sık kaçırıyor ve servo çok ağır tepki veriyor. Hatalı satır hangisi?\n\n```\nvoid loop() {\n  bool basili = (digitalRead(SIFIRLA) == LOW);\n  if (basili && !oncekiBasili) ofset = aci;\n  oncekiBasili = basili;\n\n  mpuOku();\n  servo.write(servoAcisiHesapla());\n  delay(500);\n}\n```",
              "options": [
                "delay(500);",
                "if (basili && !oncekiBasili) ofset = aci;",
                "mpuOku();",
                "servo.write(servoAcisiHesapla());"
              ],
              "answer": 0,
              "explanation": "delay(500) tüm döngüyü yarım saniye bekletir: düğme kaçar, ölçüm ve servo saniyede 2 kez güncellenir. Bunun yerine millis() ile 10 ms'de bir ölçüm yapılır. Kenar algılama satırı doğrudur.",
              "skills": [
                "nonblocking-timing",
                "prog-debug"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Girdi cihazları",
      "project": "Akıllı kapı",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. IR kumandanın mesajı ışığın süreleriyle taşıdığını, NEC mesajının yapısını (ön darbe, 32 bit, ters kopyalar) ve bitleri boşluk süresinden okumayı açıklayabilir.\n2. 4x4 tuş takımının matris mantığıyla 8 pinle nasıl okunduğunu anlatabilir; `getKey()` ile rakam biriktirip `strcmp` ile PIN'i doğrulayan program yazabilir.\n3. RFID'in ve UID'nin ne olduğunu, SPI'nin dört telini ve UID'nin neden tek başına parola sayılmayacağını söyleyebilir; projenin pin ihtiyacını önceden hesaplayabilir.\n4. PIN ve kart listesini EEPROM'da sabit adreslerle tutabilir; kurulum işareti, `EEPROM.update` ve \"sayacı en son yaz\" kuralının nedenini açıklayabilir.\n5. KILITLI, ACIK ve BLOKE durumlarından oluşan, hiç `delay` kullanmayan bir kapı kilidini kurup test edebilir.\n\n### Haftanın planı\nHafta beş derstir; ilk dört ders 30-35 dakika, proje yaklaşık 40 dakika sürer. Plan günde bir ders içindir. Dördüncü dersten sonra bir gün ara vermek proje için iyi olur.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | IR alıcı ve kumanda kodları | ~30 dk | Anlatımı oku, NEC tablosunu incele, butonla darbe süresini ölç, çözücü sketch'ini çalıştır, mini testi çöz. |\n| 2 | Keypad 4x4: şifre girişi | ~30 dk | Tuş takımını kur, her tuşun harfini seri monitörde gör, PIN programını dene. |\n| 3 | RFID RC522 (SPI): kart okuma | ~30 dk | SPI pinlerini ve pin bütçesi tablosunu incele, `KART:AABBCCDD` ile seri taklidi dene. |\n| 4 | Yetki yönetimi: kart + şifre + EEPROM | ~35 dk | EEPROM haritasını çiz, `EKLE`, `SIL`, `LISTE` komutlarını dene, yeniden başlatıp listenin kaldığını gör. |\n| 5 | Proje: Akıllı kapı kilidi | ~40 dk | Devreyi kur, durum tablosunu kontrol et, deneme senaryosunun yedi adımını uygula, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBaşlamadan önce şunlara bak:\n- `INPUT_PULLUP` ile buton okumayı biliyor mu? (Modül 3, ders 6-7)\n- `millis()` ile bloklamayan zamanlamayı ve durum makinesini görmüş mü? (Ders 27-28)\n- Servoyu `write` ile döndürmeyi biliyor mu? (Ders 21)\n- I2C LCD'yi ve EEPROM'u daha önce kullandı mı? (Ders 32-34)\n- `pulseIn` ile süre ölçmeyi hatırlıyor mu? (Ders 37)\n- Seri monitörden satır gönderme kutusunu ve ▶ ile ■ düğmelerini kullanabiliyor mu?\n\n### Kavram haritası\n- **IR iletişim:** 38 kHz taşıyıcı → ters çıkış (darbe LOW) → NEC → boşlukla bit → `uint32_t` ve bit kaydırma → ters kopya ile hata denetimi\n- **Girdi:** tuş matrisi → tarama → `getKey()` → `char` dizisi ve `'\\0'` → `strcmp`\n- **Kimlik:** RFID → UID → SPI (SCK, MOSI, MISO, SS) → 3,3 V → seri taklit\n- **Kalıcılık:** EEPROM haritası → kurulum işareti → `EEPROM.update` → sayacı en son yaz → master PIN\n- **Proje:** kural → durum tablosu → `durum` değişkeni → `millis()` ile süre → ortak hata sayacı → ayrı servo beslemesi\n\n### Sık yapılan hatalar\n- **`pulseIn(LOW)` ve `pulseIn(HIGH)` karıştırmak.** IR alıcı ters çalışır: boşta HIGH, darbede LOW.\n- **32 bit için `int` kullanmak.** Uno'da `int` 16 bittir; `(uint32_t)1 << i` yaz.\n- **Tuş takımı satır ve sütunlarını ters yazmak.** Her tuşu sırayla seçip seri monitörde ne yazdığına bak.\n- **Yazıları `==` ile karşılaştırmak.** İçerik için `strcmp` (UID gibi baytlar için `memcmp`) kullanılır.\n- **Diziyi `'\\0'` için bir fazla boyutlandırmamak.** 4 haneli PIN için `char girilen[5]`.\n- **Gerçek RC522'yi 5 V ile beslemek.** Modül 3,3 V ister.\n- **UID'yi parola sanmak.** UID okunabilir ve taklit edilebilir; kart PIN ile birlikte kullanılır.\n- **Sayacı kayıttan önce artırmak.** Yarım yazılmış kart yetkili görünebilir.\n- **Servoyu D6 gibi keypad pinlerinde bırakmak.** D2-D9 bu hafta tuş takımına aittir; servo D10'a taşınır.\n- **`delay` ile kapıyı açık tutmak ya da bloke beklemek.** Tuşlar ve seri komutlar kaçar, ekran donar.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarını bir kez daha oku ve \"sık yapılan yanlış\" satırlarını yüksek sesle söyle.\n2. Yanlış yaptığın mini test sorularının açıklamasını oku, sonra soruyu yeniden çöz.\n3. Bir NEC mesajının neden her zaman yaklaşık 68 ms sürdüğünü kendi cümlelerinle açıkla.\n4. Bir EEPROM haritası çiz: 12 kart sığabilsin diye hangi adresleri değiştirmen gerekir? (İpucu: her kart 4 bayt.)\n5. Kendi evin için bir kapı kilidi kuralı yaz: kaç yanlışta, kaç saniye bloke olsun? Durum tablosuna dök.\n6. Kapı kilidi projesinde bloke süresini her seferinde iki katına çıkaracak bir değişiklik tasarla.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir: her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Akıllı kapı kilidi)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Parçalar eksik ya da pinler keypad ile çakışıyor | Keypad, servo, buzzer, iki LED ve LCD doğru pinlerde; servo D10'da | Pin bütçesini ve neden kart okuyucunun seri taklit edildiğini açıklıyor |\n| Durum makinesi | Durumlar karışık, kapı açık kalıyor | KILITLI, ACIK ve BLOKE doğru geçişlerle çalışıyor | Durum tablosunu çizmiş ve kodla birebir uyuşuyor |\n| Zamanlama | `delay` kullanıyor, bloke sırasında tuşlar donuyor | Açık kalma 5 sn, bloke 30 sn, `millis()` ile | Süreleri değiştirip etkisini açıklıyor; taşmaya dayanıklı karşılaştırmayı biliyor |\n| Yetki | PIN ve kart ayrı sayaçlarla çalışıyor | PIN ve kart ortak sayaçta; yönetim komutları master PIN ister | Bloke süresini artıran bir kural ekledi ya da fabrika PIN'lerini değiştirdi |\n| Geri bildirim | Ekran ve buzzer olaylarla uyuşmuyor | LCD, LED ve buzzer her olayı gösteriyor | Mesajları Türkçe karaktersiz ve 16 karaktere sığacak biçimde tasarlamış |\n| Güvenlik bilinci | Açıkları düşünmedi | Seri portun yönetim açığı olduğunu fark etti | Gerçek üründe neyin değişeceğini (ayrı besleme, deneme sınırı, seri yönetimi kapatma) anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta birçok bilgiyi bir araya getirme haftasıdır: tuş takımı, kart, EEPROM, servo ve ekran. Öğrenci hepsini ezberlemek zorunda değildir; önemli olan planı yazılı bir tabloya dökmeyi ve parçaları tek tek sınayıp birleştirmeyi öğrenmesidir.\n- **Dürüstlük notu.** Laboratuvarda kart okuyucu ve IR kumanda parçası yoktur. Kart seri monitörden taklit edilir; IR için buton kullanılır. Bu, bilerek seçilmiş bir test yöntemidir ve gerçek donanım yerine geçmez. Öğrenciye bunu açıkça söyleyin.\n- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunu sorun: \"Şu an kapı hangi durumda?\", \"Seri monitör ne yazıyor?\", \"Hangi pini iki parçaya birden verdin?\"\n- **Güvenlik.** Her şey sanaldır. Gerçek bir kapıyı etkileyen sistem kurulacaksa şebeke gerilimiyle (220 V) doğrudan çalışılmaz; yönetim PIN'leri ve deneme sınırı gerçek üründe zorunludur. Fabrika PIN'lerinin (1234 ve 9999) gerçek bir kilitte kullanılmayacağını vurgulayın.\n- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır; dördüncü ders yoğundur, gerekirse iki oturuma bölün.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "IR alıcı ve kumanda kodları",
          "durationMin": 30,
          "problem": "Televizyon kumandasının ucundaki ışığı gözle göremezsin, ama bir telefon kamerasından bakınca yanıp söndüğünü görebilirsin. Kumanda her tuşta ışıkla bir mesaj yollar. TV bu mesajı nasıl \"ses aç\" ya da \"kanal değiştir\" diye anlıyor? Bu derste mesajın içini açacak, kendi çözücünü yazacaksın.",
          "contentMd": "### Devre\nLaboratuvarda IR alıcı ve kumanda parçası yok. Bu yüzden önce gerçek devreyi tanı, sonra aynı fikri bir butonla laboratuvarda dene.\n\nGerçek devrede (bilgi):\n\n| Parça | Bağlantı |\n|---|---|\n| IR alıcı modül (VS1838B türü, 38 kHz) | OUT → **D2**, VCC → 5 V, GND → GND |\n| IR kumanda | Alıcıya doğrultulur, tuşa basınca mesaj gönderir |\n\nModüllerin bacak sırası değişir; üzerindeki yazıya (OUT, GND, VCC) bakmak gerekir.\n\nLaboratuvardaki deney için parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Buton (alıcının OUT çıkışının yerine) | A → **D2**, B → **GND** |\n| LED | Uno'nun dahili LED'i (**D13**) yeter; parça eklemene gerek yok |\n\nButona basılmamışken D2 `INPUT_PULLUP` sayesinde HIGH okur (boşta); butonu basılı tutunca LOW okur (darbe). IR alıcı modülün çıkışı da aynı şekilde çalışır: boşta HIGH, taşıyıcı varken LOW. Butonun basılı kaldığı süreyi `pulseIn` ile ölçersen, bir IR darbesinin süresini nasıl ölçeceğinin provasını yapmış olursun. Fark şu: kumanda darbeleri milisaniye ve mikrosaniye düzeyindedir, tıklayarak bu kadar hızlı basamazsın.\n\n### Kumanda ne gönderiyor?\nKumandanın ucundaki IR LED, saniyede 38.000 kez yanıp sönerek bir \"taşıyıcı\" üretir. Alıcı modül yalnızca bu 38 kHz'i tanır; gün ışığı gibi yavaş değişen ışıkları eler. Modülün çıkışı **ters** çalışır:\n\n- Taşıyıcı yokken OUT = **HIGH** (boşta).\n- Taşıyıcı varken OUT = **LOW** (darbe).\n\nYani Arduino taşıyıcıyı görmez; yalnızca \"LOW darbe ne kadar sürdü, HIGH boşluk ne kadar sürdü\" bilgisini görür. Bilgi **sürelerde** saklıdır. Birçok kumanda NEC adlı protokolü kullanır:\n\n| Parça | LOW (darbe) | HIGH (boşluk) |\n|---|---|---|\n| Ön darbe (başlangıç) | 9 ms | 4,5 ms |\n| Bit 0 | 562,5 µs | 562,5 µs |\n| Bit 1 | 562,5 µs | 1687,5 µs |\n| Bitiş | 562,5 µs | boşta |\n\nBitleri darbe değil **boşluk** ayırt eder: kısa boşluk 0, uzun boşluk 1. Ön darbeden sonra 32 bit gelir, **en küçük bit önce**:\n\n1. Adres (8 bit): hangi cihaz?\n2. Adresin tersi (8 bit): her biti çevrilmiş hâli\n3. Komut (8 bit): hangi tuş?\n4. Komutun tersi (8 bit)\n\nTers kopya bir hata denetimidir: komut ile tersi birbirinin tümleyeni değilse mesaj bozuktur. Bu yüzden her mesajda 16 bit 1, 16 bit 0 olur ve mesaj hangi tuş olursa olsun yaklaşık 68 ms sürer (13,5 ms ön kısım + 16 × 1,125 ms + 16 × 2,25 ms + 0,56 ms bitiş darbesi).\n\nTuşu basılı tutarsan kumanda aynı mesajı yinelemez; onun yerine kısa bir \"tekrar\" mesajı yollar: 9 ms darbe, **2,25 ms** boşluk, 562,5 µs bitiş darbesi. Tipik olarak yaklaşık 108 ms'de bir gelir. Bazı kumandalar NEC'in \"genişletilmiş\" biçimini kullanır (16 bit adres, ters kopya yok); kumandanın NEC'e uymuyorsa çözücü hata verir. Bu derstekiler standart NEC içindir.\n\n### Program 1: Süreleri ölç\nÖnce ön darbenin gerçekten 9 ms olduğunu görelim. 37. derste öğrendiğin `pulseIn(pin, durum, zamanAşımı)` seviyeyi bekler ve o seviyenin kaç mikrosaniye sürdüğünü döndürür. Burada LOW darbelere bakıyoruz.\n\n```cpp\n// sketch: nec_zamanlari\nconst int IR_PIN = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(IR_PIN, INPUT);\n}\n\nvoid loop() {\n  unsigned long on = pulseIn(IR_PIN, LOW, 200000);     // ön darbe (LOW)\n  if (on < 8000) return;                               // ön darbe değil, yok say\n  unsigned long ilkBit = pulseIn(IR_PIN, LOW, 20000);  // bir sonraki LOW darbe: ilk bitin darbesi\n  Serial.print(\"On darbe: \");\n  Serial.print(on);\n  Serial.print(\" us, ilk bit darbesi: \");\n  Serial.print(ilkBit);\n  Serial.println(\" us\");\n}\n```\n\nGerçek bir kumandada bir tuşa basınca ön darbe 9000 µs civarında, ilk bit darbesi 560 µs civarında çıkar. Gerçek kumandalarda değerler birkaç yüz mikrosaniye oynayabilir; zamanlama pil durumuna ve üretime göre değişir. Laboratuvarda IR kaynağı olmadığı için bu sketch derlenir ama D2'ye NEC darbeleri gelmediği sürece çıktı vermez.\n\n### Program 2: NEC çözücüyü kendin yaz\nŞimdi 32 biti oku ve komutu bul. Önemli bir ayrıntı: `pulseIn(HIGH)` çağrıldığında pin zaten LOW ise hemen bir sonraki HIGH'ı bekler ve onu ölçer. Boşluğun ardından LOW darbe geldiği için, `pulseIn(IR_PIN, HIGH)` çağrılarını **peş peşe** yaptığında her çağrı bir sonraki boşluğu ölçer. İlk çağrı ön boşluğu (4,5 ms), sonraki 32 çağrı 32 bitin boşluklarını verir.\n\n```cpp\n// sketch: nec_cozucu\nconst int IR_PIN = 2;\nconst int LED = 13;\nconst byte KOMUT_AC = 0x0C;      // kumandana göre değişir: önce yazdırıp bak\nconst byte KOMUT_KAPAT = 0x18;\nconst unsigned long BIT_ESIK = 1100;   // us: bundan uzun boşluk = 1\n\nvoid hexYaz(byte b) {\n  if (b < 16) Serial.print('0');\n  Serial.print(b, HEX);\n}\n\n// Bir mesaj okur. Başarılıysa true döner; tekrar mesajıysa tekrar = true olur.\nbool mesajOku(byte &adres, byte &komut, bool &tekrar) {\n  unsigned long bosluk = pulseIn(IR_PIN, HIGH, 100000);    // ön boşluk\n  if (bosluk == 0) return false;                           // sinyal yok\n  if (bosluk > 2000 && bosluk < 2600) {                    // 2,25 ms: tekrar mesajı\n    tekrar = true;\n    return true;\n  }\n  if (bosluk < 4000 || bosluk > 5000) return false;        // 4,5 ms değil: gürültü\n  tekrar = false;\n\n  uint32_t veri = 0;\n  for (int i = 0; i < 32; i++) {\n    unsigned long b = pulseIn(IR_PIN, HIGH, 3000);         // i. bitin boşluğu\n    if (b == 0 || b > 2200) return false;                  // beklenen süre dışında\n    if (b > BIT_ESIK) veri |= (uint32_t)1 << i;            // uzun boşluk: i. biti 1 yap\n  }\n\n  adres = veri & 0xFF;\n  byte adresTers = (veri >> 8) & 0xFF;\n  komut = (veri >> 16) & 0xFF;\n  byte komutTers = (veri >> 24) & 0xFF;\n  if (komut != (byte)~komutTers) return false;             // ters kopya tutmuyor: bozuk\n  (void)adresTers;                                         // genişletilmiş NEC'te tutmaz, denetlemiyoruz\n  return true;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(IR_PIN, INPUT);\n  pinMode(LED, OUTPUT);\n}\n\nvoid loop() {\n  byte adres, komut;\n  bool tekrar = false;\n  if (!mesajOku(adres, komut, tekrar)) return;\n\n  if (tekrar) {\n    Serial.println(\"tekrar\");\n    return;\n  }\n  Serial.print(\"Adres: 0x\");\n  hexYaz(adres);\n  Serial.print(\" Komut: 0x\");\n  hexYaz(komut);\n  Serial.println();\n\n  if (komut == KOMUT_AC) digitalWrite(LED, HIGH);\n  if (komut == KOMUT_KAPAT) digitalWrite(LED, LOW);\n}\n```\n\n### Nasıl çalışıyor?\n1. `pulseIn(IR_PIN, HIGH, 100000)` boşta bekler: pin HIGH iken önce o seviyenin bitmesini, yani ön darbenin gelmesini bekler. 100 ms içinde sinyal gelmezse `0` döner ve `loop` yeniden dener.\n2. Ön boşluk 4,5 ms değilse mesaj başlamamıştır (ya da gürültüdür); `false` döner.\n3. `veri |= (uint32_t)1 << i` ifadesi yeni bir kavram: `1 << i`, 1'i `i` basamak sola kaydırır (i = 3 için ikilik 1000, yani 8). `|=` ile bu bit `veri` içinde 1 yapılır. `uint32_t` 32 bitlik işaretsiz tam sayıdır; `int` yalnız 16 bit olduğu için 32 bitlik mesaja sığmaz.\n4. Bitler en küçük bit önce geldiği için ilk gelen bit `veri`nin 0. bitine yazılır. Sonra `veri >> 16` ile komutu, `& 0xFF` ile alt 8 biti ayırırız.\n5. `~komutTers`, baytın her bitini çevirir (`~` tümleyen). Komut ile tersi tutuyorsa mesaj sağlamdır.\n6. `pulseIn` çağrıları **bloklar** (26. dersteki `delay` tuzağı gibi). Bu çözücü bekleme sırasında başka iş yapamaz. Küçük bir deney için yeterlidir, ama çok işli bir programda kütüphane daha uygundur.\n\n### Program 3: IRremote kütüphanesi\nGerçek projelerde bu işi kütüphane yapar. Kütüphane pin değişimlerini kesme ve zamanlayıcıyla izler, bloklamaz ve onlarca protokolü tanır. IRremote 4.x sürümünde başlık dosyası `IRremote.hpp`'dir.\n\n```cpp\n// sketch: ir_kutuphane\n#include <IRremote.hpp>\n\nconst int IR_PIN = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n  IrReceiver.begin(IR_PIN, ENABLE_LED_FEEDBACK);   // mesaj gelince dahili LED yanıp söner\n}\n\nvoid loop() {\n  if (IrReceiver.decode()) {                       // yeni mesaj çözüldü mü?\n    Serial.print(\"Protokol: \");\n    Serial.print(getProtocolString(IrReceiver.decodedIRData.protocol));\n    Serial.print(\" Adres: 0x\");\n    Serial.print(IrReceiver.decodedIRData.address, HEX);\n    Serial.print(\" Komut: 0x\");\n    Serial.println(IrReceiver.decodedIRData.command, HEX);\n    IrReceiver.resume();                           // bir sonraki mesaja hazırlan\n  }\n}\n```\n\nBu kütüphane sketch'i laboratuvarda yalnız derlenir; IR alıcı parçası olmadığı için çıktı vermez. Kütüphanenin içinde bir zamanlayıcı kullanılır; aynı zamanlayıcıyı kullanan başka kütüphanelerle (örneğin `tone()`) çakışabilir. Kullandığın sürümün belgesine bak.\n\n`decode()` mesaj varsa `true` döner, sonuç `decodedIRData` içindedir. İşin bitince `resume()` demezsen kütüphane yeni mesaj almaz.\n\n### Dene\n- Laboratuvarda butonu D2'ye bağla (`INPUT_PULLUP`) ve `pulseIn(2, LOW, 3000000)` ile basılı kaldığı süreyi mikrosaniye olarak yazdır. Kısa ve uzun basışta ölçümün nasıl değiştiğine bak.\n- NEC'te ön darbe hep 9 ms, ön boşluk 4,5 ms'dir. Peki bir mesaj komut 0x00 iken mi, 0xFF iken mi daha uzun sürer? Dersteki bit sürelerinden hesapla (ipucu: ters kopya yüzünden kaç bit 1 olur?).\n- Bir tuşa basılı tutulursa tekrar mesajları yaklaşık 108 ms'de bir gelir. 2 saniyede kaç tekrar mesajı beklersin?\n\n### Sık yapılan hatalar\n- Gerçek modülün bacaklarını ters bağlamak: modül bozulabilir. Bacak sırası modüle göre değişir.\n- Kodları başka kumandadan alıp kendi kumandanda çalışmasını beklemek: her kumandanın adresi ve komutları farklıdır.\n- `pulseIn(LOW)` ve `pulseIn(HIGH)` çağrılarını karıştırmak. Boşta pin HIGH'tır; ön darbe LOW'dur.\n- Butonla denerken `INPUT_PULLUP` yazmayı unutmak: D2 boşta kalır, ölçüm anlamsızlaşır (IR modülde bu pull-up modülün içindedir).\n- `1 << i` yerine `int` kullanıp 16. bitten sonrasını kaybetmek: 32 bit için `uint32_t` ve `(uint32_t)1 << i` gerekir.\n- Gerçek devrede IR alıcıyı doğrudan güneş ya da parlak lamba ışığına bakacak şekilde koymak: alıcı sürekli tetiklenebilir.",
          "question": "Aynı odada iki farklı cihazın kumandasını aynı anda kullansan karışırlar mı? NEC mesajındaki adres alanı bu sorunu nasıl çözüyor? Ters kopyaların amacı sence nedir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Kızılötesi (IR) kumandanın görünmez ışıkla mesaj taşıdığını\n- 38 kHz taşıyıcının ve ters çalışan alıcı çıkışının ne anlama geldiğini\n- NEC mesajının yapısını: ön darbe, 32 bit, ters kopyalar\n- Bitleri **sürelerden** okumayı ve bit kaydırma ile bir sayıya toplamayı\n\n### Önceden bilmen gerekenler\n- Ders 37: `pulseIn` ile bir darbenin süresini ölçmek\n- Ders 26: `delay` ve bloklayan beklemenin bedeli\n- Ders 6: `INPUT_PULLUP` ile boşta HIGH okumak\n\n### Işıkla mesaj\nKumandanın ucundaki IR LED gözle görülmez ama bir telefon kamerasından yanıp sönerken görülür. Mesaj, ışığın **ne kadar süre yandığı ve sustuğu** ile kodlanır. Arduino ışığı değil, bu süreleri okur.\n\n### Taşıyıcı ve ters çıkış\nKumanda LED'i saniyede 38.000 kez yanıp söner; buna **taşıyıcı** denir. Alıcı modül yalnızca bu hızı tanır, güneş ya da lamba gibi yavaş değişen ışıkları eler. Modülün çıkışı ters çalışır:\n\n```\ntaşıyıcı yok  ->  OUT = HIGH (boşta)\ntaşıyıcı var  ->  OUT = LOW  (darbe)\n```\n\nBu yüzden ön darbeyi `pulseIn(pin, LOW)` ile, boşlukları `pulseIn(pin, HIGH)` ile ölçersin.\n\n### NEC mesajı\nÇok kullanılan **NEC** protokolü şöyle ilerler:\n\n| Parça | Darbe (LOW) | Boşluk (HIGH) |\n|---|---|---|\n| Başlangıç | 9 ms | 4,5 ms |\n| Bit 0 | 562,5 µs | 562,5 µs |\n| Bit 1 | 562,5 µs | 1687,5 µs |\n\nDarbe hep aynıdır; bitin 0 ya da 1 olduğunu **boşluğun uzunluğu** söyler. Ön darbeden sonra 4 bayt gelir: adres, adresin tersi, komut, komutun tersi. Her bayt en küçük bit önce gönderilir. Ters kopya bir sağlamadır: komut ile tersi birbirini tamamlamıyorsa mesaj bozuktur ve atılır. Bu yüzden her mesajda 16 bit 1, 16 bit 0 vardır ve süre hangi tuşa basılırsa basılsın yaklaşık 68 ms eder.\n\n### Bitleri bir sayıda toplamak\n32 boşluğu tek tek ölçüp `uint32_t` türünde bir sayıya yazarsın. Uzun boşluk gelince ilgili biti 1 yaparsın:\n\n```\nveri |= (uint32_t)1 << i;\n```\n\n`1 << i`, 1'i `i` basamak sola kaydırır; `|=` bu biti sayıya ekler. Dikkat: Uno'da `int` 16 bittir. `(uint32_t)` yazmazsan 16. bitten sonrası kaybolur.\n\n### Kitaplık ne işe yarar\n`pulseIn` çağrıları programı bekletir (bloklar). Gerçek projelerde IRremote gibi bir kitaplık kullanılır: pin değişimlerini arka planda izler, birçok protokolü tanır. Kendi çözücünü yazmak ise işin nasıl yürüdüğünü gösterir.\n\n### Özet\nIR kumanda, 38 kHz taşıyıcıyı açıp kapatarak süreler biçiminde mesaj gönderir. Alıcı çıkışı ters çalışır: darbe LOW, boşta HIGH. NEC'te bitleri boşluk ayırt eder; 32 bitin yarısı ters kopyadır ve hata denetimi sağlar. Süreleri ölçüp bitleri `uint32_t` içinde toplamak çözücünün özüdür.",
          "concepts": [
            {
              "term": "Taşıyıcı (38 kHz)",
              "definition": "IR LED'in saniyede 38.000 kez yanıp sönmesiyle oluşan, alıcı modülün tanıdığı ışık titreşimi.",
              "example": "Alıcı, 38 kHz'i görünce OUT pinini LOW yapar; güneş ışığı gibi yavaş değişimleri yok sayar.",
              "pitfall": "Alıcıyı doğrudan güneşe ya da parlak lambaya baktırmak; alıcı sürekli tetiklenebilir."
            },
            {
              "term": "Ters çıkış (aktif-LOW)",
              "definition": "IR alıcı modül taşıyıcı yokken HIGH, taşıyıcı varken LOW verir.",
              "example": "Kumandaya basılınca D2 önce 9 ms LOW olur, sonra 4,5 ms HIGH kalır.",
              "pitfall": "pulseIn(LOW) ile pulseIn(HIGH) çağrılarını karıştırmak: boşta pin HIGH'tır, ön darbe LOW'dur."
            },
            {
              "term": "NEC protokolü",
              "definition": "Ön darbeden sonra adres, adresin tersi, komut ve komutun tersi olmak üzere 32 bit gönderen yaygın IR kodlaması.",
              "example": "Komut 0x0C ise ardından 0xF3 (tersi) gelir; ikisi tutuyorsa mesaj sağlamdır.",
              "pitfall": "Başka bir kumandanın kodlarını kendi kumandanda beklemek; adres ve komutlar kumandaya göre değişir."
            },
            {
              "term": "Boşluk süresiyle bit",
              "definition": "NEC'te darbe hep 562,5 µs'dir; kısa boşluk (562,5 µs) 0, uzun boşluk (1687,5 µs) 1 demektir.",
              "example": "1100 µs eşiği: ölçülen boşluk bundan uzunsa bit 1 yazılır.",
              "pitfall": "Bitleri darbe süresinden okumaya çalışmak; bütün darbeler aynı uzunluktadır."
            },
            {
              "term": "Bit kaydırma ve |=",
              "definition": "1 << i, 1'i i basamak sola kaydırır; veri |= ... ile bu bit sayıda 1 yapılır.",
              "example": "i = 3 için 1 << 3 sayısı 8'dir (ikilik 1000).",
              "pitfall": "int kullanmak: Uno'da 16 bittir, 32 bitlik mesajın üst yarısı kaybolur. (uint32_t)1 << i yaz."
            }
          ],
          "quiz": [
            {
              "id": "m4h6d1-q1",
              "kind": "mcq",
              "prompt": "IR alıcı modülün OUT pini hiç kumanda tuşuna basılmıyorken (taşıyıcı yokken) ne okur?",
              "options": [
                "LOW",
                "Sürekli değişen rastgele değer",
                "HIGH",
                "Hiçbir şey; pin yüzer"
              ],
              "answer": 2,
              "explanation": "Alıcı ters çalışır: taşıyıcı yokken OUT HIGH'tır (boşta), taşıyıcı geldiğinde LOW olur. Bu yüzden ön darbeyi LOW olarak ölçersin. Yüzen pin, modülün içindeki yükseltme direnci yüzünden olmaz.",
              "skills": [
                "ir-nec"
              ]
            },
            {
              "id": "m4h6d1-q2",
              "kind": "mcq",
              "prompt": "NEC mesajında bir bitin 0 mu 1 mi olduğunu ne belirler?",
              "options": [
                "Darbenin (LOW) uzunluğu",
                "Boşluğun (HIGH) uzunluğu",
                "Taşıyıcının frekansı",
                "Mesajın kaçıncı sırada geldiği"
              ],
              "answer": 1,
              "explanation": "Darbe her bitte 562,5 µs'dir. Kısa boşluk (562,5 µs) 0, uzun boşluk (1687,5 µs) 1 anlamına gelir. Taşıyıcı frekansı her zaman 38 kHz'dir ve bit bilgisi taşımaz.",
              "skills": [
                "ir-nec"
              ]
            },
            {
              "id": "m4h6d1-q3",
              "kind": "numeric",
              "prompt": "NEC'te bir tekrar mesajı 9 ms darbe, 2,25 ms boşluk ve 0,5625 ms bitiş darbesinden oluşur. Toplam süresi kaç milisaniyedir?",
              "answer": 11.8125,
              "tolerance": 0.05,
              "unit": "ms",
              "explanation": "9 + 2,25 + 0,5625 = 11,8125 ms. Tam mesaj yaklaşık 68 ms sürerken tekrar mesajı çok daha kısadır; bu yüzden tuş basılı tutulunca kısa mesajlar yaklaşık 108 ms'de bir gelir.",
              "skills": [
                "ir-nec"
              ]
            },
            {
              "id": "m4h6d1-q4",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca seri monitörde ne yazar?\n\n```\nuint32_t veri = 0;\nveri |= (uint32_t)1 << 0;\nveri |= (uint32_t)1 << 3;\nSerial.println(veri);\n```",
              "options": [
                "4",
                "8",
                "9",
                "10"
              ],
              "answer": 2,
              "explanation": "1 << 0 sayısı 1, 1 << 3 sayısı 8'dir. |= ile iki bit de eklenir: 1 + 8 = 9 (ikilik 1001). 8 yalnızca üçüncü biti, 4 ise ikinci biti verirdi.",
              "skills": [
                "bit-ops"
              ]
            },
            {
              "id": "m4h6d1-q5",
              "kind": "find-bug",
              "prompt": "Bir arkadaşın 32 boşluğu şöyle toplamış, ama komut hep yanlış çıkıyor. Hata hangi satırda?\n\n```\nuint32_t veri = 0;                  // satır 1\nfor (int i = 0; i < 32; i++) {      // satır 2\n  unsigned long b = pulseIn(2, HIGH, 3000);   // satır 3\n  if (b > 1100) veri |= 1 << i;     // satır 4\n}\n```",
              "options": [
                "Satır 1: veri 32 bitlik tanımlanmamış",
                "Satır 2: döngü 33 kez çalışıyor",
                "Satır 3: pulseIn HIGH yerine LOW olmalı",
                "Satır 4: 1 sayısı int; Uno'da 16. bitten sonrası kaybolur, (uint32_t)1 << i olmalı"
              ],
              "answer": 3,
              "explanation": "Uno'da 1 değişmezi 16 bitlik int'tir; 1 << 16 ve sonrası taşar, mesajın üst yarısı (komut ve tersi) bozulur. Satır 1 zaten uint32_t'dir, satır 2 tam 32 tur döner ve boşlukları HIGH ölçmek doğrudur.",
              "skills": [
                "bit-ops",
                "prog-debug"
              ]
            }
          ]
        },
        {
          "title": "Keypad 4x4: şifre girişi",
          "durationMin": 30,
          "problem": "Apartman kapısındaki tuş takımında 16 tuş var, ama kablo sayısı 16 değil. Arduino'nun 16 pini olsaydı bile bütün pinleri bir tuş takımına harcamak çok pahalı olurdu. Peki 16 tuşu yalnızca 8 telle nasıl okuruz? Üstelik doğru şifreyi girince bir şey açıp yanlış girince seni uyaran bir program yazmak için tuşların \"basıldığı anı\" doğru yakalaman gerek.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Keypad 4x4 | Satırlar R1..R4 → **D9, D8, D7, D6**; sütunlar C1..C4 → **D5, D4, D3, D2** |\n| LED (yeşil) | **D13** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |\n| LED (kırmızı) | **D12** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |\n\nBu hafta D2-D9 pinlerinin hepsi tuş takımına gider. Önceki haftalarda butonlar için kullandığın D2, D3 ve servo için kullandığın D6 bu hafta boştur; haftanın projesinde bu yüzden servo başka bir pine taşınacak.\n\nLaboratuvarda tuş takımını seçince sağ paneldeki **Basılı tuş** listesinden bir tuş seçersin: seçtiğin tuş basılı sayılır, **Yok** dersen bırakılmış olur. Tuş takımı aynı anda yalnız bir tuş basılı tutabilir. Gerçek bir membran tuş takımının 8 telli şeridinde hangi telin satır, hangisinin sütun olduğu üreticiye göre değişir; laboratuvardaki parçada pinler R1-R4 ve C1-C4 olarak yazılıdır.\n\n### Matris nasıl okunur?\n16 tuşu 16 telle okumak yerine tuşları 4 satır × 4 sütunluk bir ızgaraya dizeriz. Her tuş bir satır ile bir sütunu bastığında birleştirir. Okuma şöyle yapılır:\n\n1. Satır pinleri giriştir ve `INPUT_PULLUP` ile HIGH'ta bekler.\n2. Arduino sütunları sırayla LOW yapar (bir seferde yalnızca birini).\n3. Basılı bir tuşun sütunu LOW olduğunda, o tuşun satırı da LOW okunur.\n4. Hangi sütun LOW iken hangi satır LOW okunduysa, tuş o satır ile sütunun kesiştiği tuştur.\n\n8 tel ile 4 × 4 = 16 tuş okunur. `Keypad` kütüphanesi bu taramayı ve sıçrama önlemeyi (debounce) senin yerine yapar. Gerçek tuş takımında aynı anda birden çok tuşa basılırsa matriste bazı tuşlar yanlış algılanabilir (diyotsuz matrislerin bilinen sınırı); şifre girişinde tuşlara tek tek basıldığı için sorun olmaz. Laboratuvarda zaten aynı anda tek tuş seçilebilir.\n\n### Program 1: Tuşu oku\n`Keypad` nesnesini kurarken tuşların harf haritasını, satır ve sütun pinlerini veririz. `makeKeymap` iki boyutlu diziyi kütüphanenin istediği biçime çevirir.\n\n```cpp\n// sketch: keypad_tus\n#include <Keypad.h>\n\nconst byte SATIR = 4;\nconst byte SUTUN = 4;\nchar tuslar[SATIR][SUTUN] = {\n  {'1', '2', '3', 'A'},\n  {'4', '5', '6', 'B'},\n  {'7', '8', '9', 'C'},\n  {'*', '0', '#', 'D'}\n};\nbyte satirPinleri[SATIR] = {9, 8, 7, 6};\nbyte sutunPinleri[SUTUN] = {5, 4, 3, 2};\n\nKeypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  char tus = tusTakimi.getKey();      // basılan tuş; basılmadıysa '\\0'\n  if (tus) {\n    Serial.print(\"Tus: \");\n    Serial.println(tus);\n  }\n}\n```\n\n`getKey()` her basışta **bir kez** o tuşu döndürür; tuşu basılı tutsan bile tekrar etmez (laboratuvarda bir tuşu listede seçili bırakmak, basılı tutmak demektir). Basış yoksa `0` (`'\\0'`) döner, bu da `if (tus)` ile \"yanlış\" sayılır.\n\n### Program 2: PIN girişi\nŞimdi bir kapı kilidinin ilk yarısını yazalım: 4 haneli PIN. Kurallar:\n\n- Rakam tuşları PIN'e eklenir (en fazla 4 hane).\n- `*` son girilen rakamı siler.\n- `#` girişi onaylar.\n- Yanlış girişler sayılır; 3 yanlıştan sonra uyarı verilir.\n\nSeri monitörde PIN'i açıkça göstermeyiz; her rakam için bir `*` yazarız.\n\n```cpp\n// sketch: keypad_sifre\n#include <Keypad.h>\n\nconst byte SATIR = 4;\nconst byte SUTUN = 4;\nchar tuslar[SATIR][SUTUN] = {\n  {'1', '2', '3', 'A'},\n  {'4', '5', '6', 'B'},\n  {'7', '8', '9', 'C'},\n  {'*', '0', '#', 'D'}\n};\nbyte satirPinleri[SATIR] = {9, 8, 7, 6};\nbyte sutunPinleri[SUTUN] = {5, 4, 3, 2};\nKeypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);\n\nconst int YESIL = 13;\nconst int KIRMIZI = 12;\nconst int PIN_UZUNLUK = 4;\nconst int AZAMI_YANLIS = 3;\nconst unsigned long LED_SURESI = 1000;   // ms\n\nconst char DOGRU_PIN[] = \"1234\";\n\nchar girilen[PIN_UZUNLUK + 1];           // +1: dizinin sonundaki '\\0'\nint hane = 0;\nint yanlisSayisi = 0;\nunsigned long ledBitis = 0;\n\nvoid girisiTemizle() {\n  hane = 0;\n  girilen[0] = '\\0';\n}\n\nvoid yildizYaz() {\n  Serial.print(\"Girilen: \");\n  for (int i = 0; i < hane; i++) Serial.print('*');\n  Serial.println();\n}\n\nvoid onayla() {\n  if (hane < PIN_UZUNLUK) {\n    Serial.println(\"PIN 4 haneli olmali\");\n    return;\n  }\n  if (strcmp(girilen, DOGRU_PIN) == 0) {\n    Serial.println(\"PIN dogru\");\n    yanlisSayisi = 0;\n    digitalWrite(YESIL, HIGH);\n  } else {\n    yanlisSayisi++;\n    Serial.print(\"PIN yanlis (\");\n    Serial.print(yanlisSayisi);\n    Serial.print(\"/\");\n    Serial.print(AZAMI_YANLIS);\n    Serial.println(\")\");\n    digitalWrite(KIRMIZI, HIGH);\n    if (yanlisSayisi >= AZAMI_YANLIS) {\n      Serial.println(\"Cok fazla yanlis deneme\");\n      yanlisSayisi = 0;\n    }\n  }\n  ledBitis = millis() + LED_SURESI;\n  girisiTemizle();\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(YESIL, OUTPUT);\n  pinMode(KIRMIZI, OUTPUT);\n  girisiTemizle();\n}\n\nvoid loop() {\n  char tus = tusTakimi.getKey();\n  if (tus >= '0' && tus <= '9') {\n    if (hane < PIN_UZUNLUK) {\n      girilen[hane] = tus;\n      hane++;\n      girilen[hane] = '\\0';\n      yildizYaz();\n    }\n  } else if (tus == '*') {\n    if (hane > 0) {\n      hane--;\n      girilen[hane] = '\\0';\n      yildizYaz();\n    }\n  } else if (tus == '#') {\n    onayla();\n  }\n\n  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {   // LED süresi doldu\n    digitalWrite(YESIL, LOW);\n    digitalWrite(KIRMIZI, LOW);\n    ledBitis = 0;\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `girilen`, 4 rakam ve sonda bir `'\\0'` taşıyan karakter dizisidir. C'de bir yazı, sonu `'\\0'` ile biten karakter dizisidir. `strcmp(a, b)` iki yazı eşitse `0` döndürür.\n2. Rakam gelince dizinin `hane`. yerine yazılır, `hane` artar ve sona yeniden `'\\0'` konur. `*` bunun tersini yapar: `hane` azalır, o yere `'\\0'` yazılır.\n3. `tus >= '0' && tus <= '9'` karşılaştırması karakter kodlarıyla çalışır; rakam karakterleri ardışık kodlara sahiptir.\n4. `#` basıldığında önce uzunluk denetlenir. 4 haneden azsa deneme **sayılmaz**; kullanıcı yalnızca uyarı alır ve girdiği rakamlar silinmez, kaldığı yerden devam edebilir.\n5. Yanlış girişte `yanlisSayisi` bir artar. 3'e ulaşınca uyarı yazılır ve sayaç sıfırlanır. Gerçek bir kilitte burada kilit süresi başlatırsın; proje dersinde yapacağız.\n6. LED'in ne zaman söneceği `millis()` ile hesaplanır, `delay` kullanılmaz (27. ders); böylece LED yanarken de tuşlar okunur. `(long)(millis() - ledBitis) >= 0` ifadesi, `millis()` taşsa bile doğru çalışan karşılaştırmadır.\n7. `A`, `B`, `C`, `D` tuşları bu programda hiçbir şey yapmaz. İleride menü tuşu olarak kullanabilirsin.\n\n### Dene\n- PIN'i 6 haneli yap: `PIN_UZUNLUK` değerini 6 yap ve `DOGRU_PIN` için 6 rakamlı yeni bir yazı seç.\n- `D` tuşuna basınca girişi tümden silen bir özellik ekle.\n- `AZAMI_YANLIS` değerini 5 yap. Başka bir yeri değiştirmen gerekti mi?\n\n### Sık yapılan hatalar\n- Satır ve sütun pinlerini sketch'te ya da kablolarda ters yazmak: tuşlar algılanmaz ya da yanlış harf verir. Her tuşu sırayla seçip seri monitörde ne yazdığına bak.\n- `getKey()` döndürdüğü değeri kontrol etmeden kullanmak. Basış yoksa `'\\0'` döner.\n- `girilen` dizisine yer ayırırken sondaki `'\\0'` için +1 bırakmamak.\n- PIN'i `==` ile karşılaştırmak. Karakter dizilerinde `==` adresleri karşılaştırır; içerik için `strcmp` kullan.\n- `delay()` ile LED'i tutmak: bu sırada basılan tuşlar kaçırılabilir.",
          "question": "PIN'i program kodunun içine yazmak güvenli mi? Programın kodunu okuyabilen biri olsaydı ne olurdu? Bir sonraki derslerde PIN'i neden başka bir yerde tutmak isteyeceğiz?",
          "explainerMd": "### Bu derste öğreneceklerin\n- 16 tuşun neden 16 telle değil 8 telle okunduğunu\n- Matris taramanın satır, sütun ve `INPUT_PULLUP` ile nasıl çalıştığını\n- `Keypad` kitaplığının `getKey()` ile tuşu nasıl verdiğini\n- Rakamları karakter dizisinde biriktirip `strcmp` ile PIN'e karşılaştırmayı\n\n### Önceden bilmen gerekenler\n- Ders 6-7: `INPUT_PULLUP` ile buton okumak ve `if` koşulları\n- Ders 27: `millis()` ile bloklamayan zamanlama\n- Ders 34: `char` dizileri ve sondaki `'\\0'`\n\n### Neden matris\n16 tuşun her biri için ayrı pin gerekseydi Uno'nun pinleri tükenirdi. Çözüm tuşları **matris** biçiminde dizmektir: 4 satır ve 4 sütun. Her tuş, bir satırla bir sütunu basıldığında birleştirir. Pin sayısı satır artı sütundur: 4 + 4 = 8. Matris büyüdükçe kazanç artar; 4x4 matriste 16 tuş 8 pinle okunur.\n\n### Tarama nasıl çalışır\nSatır pinleri `INPUT_PULLUP` ile HIGH'ta bekler. Kart sütunları sırayla LOW yapar, aynı anda yalnız birini:\n\n```\nsütun 1 LOW  -> satırlara bak\nsütun 2 LOW  -> satırlara bak\n...\n```\n\nBasılı bir tuşun sütunu LOW iken, o tuşun satırı da LOW okunur. Hangi sütun LOW iken hangi satır LOW okunduysa, tuş o ikisinin kesiştiği yerdedir. Bu taramayı çok hızlı tekrarlarsın; sıçrama önleme de kitaplığın işidir.\n\n### getKey ve karakterler\n`getKey()` yeni bir basışta tuşu `char` olarak döndürür, basış yoksa `'\\0'` döndürür. Tuşu basılı tutsan bile bir kez verir. Bu yüzden `if (tus)` yazmak \"bir tuşa yeni basıldı mı?\" demektir.\n\n### PIN'i biriktirmek\nRakamlar gelince bir `char` dizisine eklenir; her eklemeden sonra sona `'\\0'` konur, çünkü C'de bir yazı `'\\0'` ile biter:\n\n```\ngirilen[hane] = tus;\nhane++;\ngirilen[hane] = '\\0';\n```\n\nDizinin boyutu PIN uzunluğundan **bir fazla** olmalıdır (4 hane için 5). `*` ile `hane` bir azaltılır ve o yere `'\\0'` yazılır; böylece son rakam silinmiş olur.\n\n### Karşılaştırma ve zaman\nİki yazıyı `==` ile karşılaştırmamalısın. `==` içerikleri değil bellek adreslerini karşılaştırır ve neredeyse hep yanlış çıkar. İçeriği `strcmp(a, b) == 0` ile karşılaştır. Yanlış sayacı ve yanıp sönen LED süresini `millis()` ile yönet; `delay` kullanırsan o sırada basılan tuşlar kaçabilir.\n\n### Özet\nMatris, 16 tuşu 8 pinle okumanın yoludur: sütun LOW verilir, LOW okunan satır tuşu ele verir. `getKey()` her basışta bir kez karakter döndürür. PIN, sonu `'\\0'` ile biten bir diziye biriktirilir ve `strcmp` ile karşılaştırılır. Bloklayan `delay` yerine `millis()` kullanmak tuşların kaçmasını önler.",
          "concepts": [
            {
              "term": "Tuş matrisi",
              "definition": "Tuşları satır ve sütun ızgarasına dizerek az pinle çok tuş okuma yöntemi.",
              "example": "4 satır ve 4 sütun, 8 pinle 16 tuşu okur; 3 satır ve 4 sütunluk telefon tuş takımı 7 pin ister.",
              "pitfall": "Pin sayısını tuş sayısı sanmak; matriste pin sayısı satır artı sütundur."
            },
            {
              "term": "Tarama",
              "definition": "Sütunları sırayla LOW yapıp satırlarda LOW arama; kesişen satır ve sütun basılı tuşu verir.",
              "example": "Sütun 3 LOW iken satır 2 LOW okunuyorsa basılan tuş 6'dır.",
              "pitfall": "Satır ve sütun pinlerini sketch'te kablodakinin tersi yazmak: tuşlar yanlış harf verir."
            },
            {
              "term": "getKey()",
              "definition": "Keypad kitaplığında yeni basılan tuşu char olarak döndürür; basış yoksa '\\0' döndürür.",
              "example": "if (tus) { Serial.println(tus); } yalnızca yeni basışta yazar.",
              "pitfall": "Dönen değeri denetlemeden kullanmak; basış yokken '\\0' gelir."
            },
            {
              "term": "Sonlandırıcı '\\0'",
              "definition": "C'de bir yazının bittiğini gösteren özel karakter; dizide bunun için bir yer ayrılır.",
              "example": "4 haneli PIN için char girilen[5] tanımlanır.",
              "pitfall": "Diziyi 4 elemanlı tanımlamak: '\\0' diziden taşar ve komşu belleği bozar."
            },
            {
              "term": "strcmp",
              "definition": "İki yazının içeriğini karşılaştırır; eşitse 0 döndürür.",
              "example": "strcmp(girilen, \"1234\") == 0 ise PIN doğrudur.",
              "pitfall": "== ile karşılaştırmak: adresleri karşılaştırır, içerik aynı olsa bile yanlış çıkar."
            }
          ],
          "quiz": [
            {
              "id": "m4h6d2-q1",
              "kind": "numeric",
              "prompt": "3 satır ve 4 sütundan oluşan 12 tuşlu telefon tuş takımını matris yöntemiyle okuyacaksın. Kaç Arduino pini gerekir?",
              "answer": 7,
              "unit": "pin",
              "explanation": "Matriste pin sayısı satır artı sütundur: 3 + 4 = 7. Her tuşa ayrı pin verilseydi 12 pin gerekirdi. 12 tuş sayısıdır, pin sayısı değildir.",
              "skills": [
                "keypad-matrix"
              ]
            },
            {
              "id": "m4h6d2-q2",
              "kind": "mcq",
              "prompt": "Tarama sırasında bir sütun LOW yapılmış. O sütundaki bir tuşa basılıysa, satır pini (INPUT_PULLUP ile) ne okur?",
              "options": [
                "HIGH, çünkü pull-up hep HIGH tutar",
                "LOW, çünkü basılı tuş satırı LOW olan sütuna bağlar",
                "Okuma yapılamaz",
                "Önce sütunun HIGH olması gerekir"
              ],
              "answer": 1,
              "explanation": "Tuş basılınca satır ile sütun birleşir; sütun LOW olduğundan satır da LOW okunur. Basılmamışsa pull-up satırı HIGH tutar. Fark, hangi tuşun basıldığını ele verir.",
              "skills": [
                "keypad-matrix"
              ]
            },
            {
              "id": "m4h6d2-q3",
              "kind": "predict-output",
              "prompt": "Tuşlara sırayla 4, 2, *, 7, 9 basılıyor. '*' son rakamı siler. Sonunda ekrana ne yazılır?\n\n```\nchar girilen[5] = \"\";\nint hane = 0;\nchar tuslar[] = {'4', '2', '*', '7', '9'};\nfor (int i = 0; i < 5; i++) {\n  char t = tuslar[i];\n  if (t == '*') {\n    if (hane > 0) { hane--; girilen[hane] = '\\0'; }\n  } else {\n    girilen[hane] = t;\n    hane++;\n    girilen[hane] = '\\0';\n  }\n}\nSerial.println(girilen);\n```",
              "options": [
                "4279",
                "479",
                "47",
                "429"
              ],
              "answer": 1,
              "explanation": "4 ve 2 girilir (42); '*' son rakam olan 2'yi siler (4); 7 ve 9 eklenir (479). 4279 silmeyi unutmak olurdu; 47 son rakamı eksik, 429 ise yanlış rakamı silmiş olurdu.",
              "skills": [
                "c-strings",
                "keypad-matrix"
              ]
            },
            {
              "id": "m4h6d2-q4",
              "kind": "find-bug",
              "prompt": "Bu kod doğru PIN girilse bile \"dogru\" yazmıyor. Neden?\n\n```\nchar girilen[5] = \"1234\";\nif (girilen == \"1234\") {\n  Serial.println(\"dogru\");\n}\n```",
              "options": [
                "char dizisi en az 6 elemanlı olmalı",
                "Println yanlış yazılmış",
                "== adresleri karşılaştırır; içerik için strcmp(girilen, \"1234\") == 0 gerekir",
                "Dizinin başında '\\0' olmalı"
              ],
              "answer": 2,
              "explanation": "C'de iki yazı == ile karşılaştırılınca içerikleri değil bellekteki adresleri karşılaştırılır; adresler farklıdır, koşul yanlış çıkar. Dizi boyutu 5 yeterlidir (4 rakam ve '\\0').",
              "skills": [
                "c-strings",
                "prog-debug"
              ]
            },
            {
              "id": "m4h6d2-q5",
              "kind": "mcq",
              "prompt": "Tuşa 2 saniye boyunca basılı tutarsan getKey() bu tuşu kaç kez döndürür?",
              "options": [
                "Her loop turunda, yani binlerce kez",
                "Yalnız bir kez, basış anında",
                "Hiç döndürmez",
                "Saniyede bir kez"
              ],
              "answer": 1,
              "explanation": "getKey() yeni basışta tuşu bir kez verir, sonra '\\0' döndürmeye devam eder. Bu sayede basılı tutulan tuş PIN'e tekrar tekrar eklenmez.",
              "skills": [
                "keypad-matrix"
              ]
            }
          ]
        },
        {
          "title": "RFID RC522 (SPI): kart okuma",
          "durationMin": 30,
          "problem": "Otobüs kartını okuyucuya yaklaştırırsın, kartın hiçbir pili yok, ama okuyucu onu tanır. Kart enerjisini nereden alıyor? Ve okuyucu kartın \"kim olduğunu\" nasıl öğreniyor? Bu derste kart okuyucuyu tanıyacak, ama bir de dürüst bir sorunla karşılaşacaksın: Arduino Uno'nun pinleri bu hafta yetmiyor.",
          "contentMd": "### RFID nedir?\nRFID, radyo dalgasıyla kimlik okumaktır. RC522 modülü 13,56 MHz'lik bir alan üretir. Kartın (ya da anahtarlığın) içinde pil yoktur; yalnızca bir anten ve küçük bir çip vardır. Kart okuyucunun alanına girince alandan enerji alır ve belleğindeki verileri geri yollar. Bu derste okuyacağımız veri kartın **UID**'sidir (benzersiz kimlik numarası). Yaygın MIFARE kartlarda UID 4 bayttır; bazı kartlarda 7 ya da 10 bayt olur. Biz 4 baytlık UID'yi işleyeceğiz.\n\n**Önemli:** UID bir parola değildir. Kartı okuyabilen herkes UID'yi öğrenebilir ve bazı özel kartlar UID'yi taklit edebilir. Bu yüzden ciddi kilitlerde yalnızca UID'ye güvenilmez. Bu hafta kartı PIN ile birlikte kullanacağız.\n\n### SPI nedir?\nRC522 Arduino ile **SPI** üzerinden konuşur. SPI, dört telli hızlı bir haberleşme biçimidir (33. dersteki I2C'nin iki teline karşılık dört tel kullanır):\n\n| Tel | Görevi | Uno pini |\n|---|---|---|\n| SCK | Saat darbesi (Arduino üretir) | **D13** |\n| MOSI | Arduino'dan modüle veri | **D11** |\n| MISO | Modülden Arduino'ya veri | **D12** |\n| SS (SDA) | \"Seni seçtim\" hattı; LOW iken modül dinler | **D10** (değiştirilebilir) |\n\nBunlara ek olarak RC522'nin **RST** (sıfırlama) bacağı vardır. SCK, MOSI ve MISO pinleri Uno'da donanım tarafından belirlidir ve değiştirilemez. SS ve RST ise istediğin bir pine bağlanabilir.\n\n### Devre\nLaboratuvarda RC522 parçası ve kart yok. Gerçek modülün bağlantısı şöyledir (bilgi):\n\n| Parça | Bağlantı |\n|---|---|\n| RC522 modül | SDA(SS) → **D10**, SCK → **D13**, MOSI → **D11**, MISO → **D12**, RST → **D9**, GND → GND, 3.3V → **3,3 V** |\n\n**Güç uyarısı (gerçek modül için):** RC522 bir **3,3 V** modüldür. 3.3V bacağını Uno'nun 5 V çıkışına bağlama; modül zarar görebilir. Ayrıca modülün veri bacakları da 3,3 V'a göre tasarlıdır. Uno 5 V'luk sinyal verir; birçok kişi modülü doğrudan bağlasa da güvenli yol bir seviye dönüştürücü ya da direnç bölücü kullanmaktır. Modülün veri sayfasına bak.\n\nLaboratuvarda kartı seri monitörden taklit edeceğiz. Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla:\n\n| Parça | Bağlantı |\n|---|---|\n| LED (yeşil) | **D13** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |\n| LED (kırmızı) | **D12** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |\n\n### Program 1: Kartı oku\n`MFRC522` kütüphanesi ile kartın UID'sini seri porta yazan program:\n\n```cpp\n// sketch: rc522_oku\n#include <SPI.h>\n#include <MFRC522.h>\n\nconst int SS_PIN = 10;\nconst int RST_PIN = 9;\n\nMFRC522 okuyucu(SS_PIN, RST_PIN);\n\nvoid setup() {\n  Serial.begin(9600);\n  SPI.begin();               // SPI hattını başlat\n  okuyucu.PCD_Init();        // RC522'yi başlat\n}\n\nvoid loop() {\n  if (!okuyucu.PICC_IsNewCardPresent()) return;   // yeni kart yok\n  if (!okuyucu.PICC_ReadCardSerial()) return;     // UID okunamadı\n\n  Serial.print(\"KART:\");\n  for (byte i = 0; i < okuyucu.uid.size; i++) {\n    if (okuyucu.uid.uidByte[i] < 16) Serial.print('0');\n    Serial.print(okuyucu.uid.uidByte[i], HEX);\n  }\n  Serial.println();\n\n  okuyucu.PICC_HaltA();        // aynı kartı tekrar tekrar okumayı bırak\n}\n```\n\nBu sketch kütüphane kullanır; laboratuvarda derlenir, ama RC522 parçası olmadığı için çalışırken hiç kart bulamaz ve çıktı vermez. `PICC_IsNewCardPresent()` alanda yeni bir kart varsa `true` döner, `PICC_ReadCardSerial()` UID'yi `okuyucu.uid` içine doldurur. Çıktıyı bilerek `KART:AABBCCDD` biçiminde yazdırıyoruz; birazdan bu satırı programa \"kart gelmiş gibi\" göndereceğiz.\n\n### Dürüst bir sorun: pinler çakışıyor\nBu haftanın projesinde keypad, servo, buzzer, LED'ler ve LCD bir arada olacak. Pinleri yan yana koy:\n\n| Pin | Keypad (62) | RC522 (bu ders) | Kapı kilidi projesi (65) |\n|---|---|---|---|\n| D9 | satır 1 | RST | keypad satır 1 |\n| D10 | yok | SS | servo |\n| D11 | yok | MOSI (sabit) | buzzer |\n| D12 | yok | MISO (sabit) | kırmızı LED |\n| D13 | yok | SCK (sabit) | yeşil LED |\n\nTablodaki D9 çakışması, RST'yi D9'a bağlamayı seçtiğimiz için çıkıyor; SS ve RST herhangi bir pine bağlanabilir. Asıl sorun toplam pin sayısıdır. Projede şunlar gerekir: keypad 8, RC522'nin üç sabit SPI pini 3, SS ile RST 2, servo 1, buzzer 1, iki LED 2; toplam **17 pin**. Uno'da D2-D13 (12 pin) ve A0-A3 (4 pin) kullanılabilir (A4 ve A5'i I2C LCD alır): toplam **16 pin**. Üstelik SPI'nin D11, D12 ve D13 pinleri sabittir ve projede buzzer ile LED'lere ayrılmıştır. Keypad ile RC522 tek başlarına Uno'ya sığar (8 + 5 = 13 pin), ama hepsi birden sığmaz. Gerçek bir ürün yapacak olsan şu yollardan birini seçerdin:\n- Daha çok pini olan bir kart (örneğin Arduino Mega).\n- Keypad'i daha az pinle okuyan bir yol (örneğin bir I2C genişletici modül).\n- LED ve buzzeri A0-A3 pinlerine taşımak (analog pinler dijital çıkış olarak da kullanılabilir). Bu da yetmez, çünkü 17 pin 16'ya sığmaz; ayrıca bu derste denemedik.\n\nBiz bu hafta farklı bir yol seçiyoruz: **projede kartı seri porttan taklit edeceğiz**. Okuyucu yerine sen laboratuvarın seri monitörüne `KART:AABBCCDD` yazacaksın; program bunu kartın okunması sayacak. Bu, **kart okuyucu yokken test için seri taklit**tir; gerçek RC522 değildir. Üstelik `rc522_oku` programı da aynı satırı yazdığı için, ileride okuyucuyu eklersen kart verisinin geldiği yer değişir, yetki mantığı aynen kalır.\n\n### Program 2: Seri taklit ile kart testi\nBu program seri porttan bir satır okur. Satır `KART:` ile başlıyor ve ardından 8 onaltılık rakam (4 bayt) geliyorsa UID'yi çözer ve yetkili listesiyle karşılaştırır. `delay` ya da `readStringUntil` kullanmıyoruz: satırı karakter karakter biriktiriyoruz, böylece program beklerken başka iş yapabilir.\n\n```cpp\n// sketch: kart_taklit\nconst int YESIL = 13;\nconst int KIRMIZI = 12;\nconst byte YETKILI_UID[4] = {0xAA, 0xBB, 0xCC, 0xDD};   // tek örnek yetkili kart\nconst unsigned long LED_SURESI = 1000;\n\nchar satir[24];\nint uzunluk = 0;\nunsigned long ledBitis = 0;\n\nint hexDeger(char c) {                      // '0'-'9','A'-'F','a'-'f' -> 0-15; olmazsa -1\n  if (c >= '0' && c <= '9') return c - '0';\n  if (c >= 'A' && c <= 'F') return c - 'A' + 10;\n  if (c >= 'a' && c <= 'f') return c - 'a' + 10;\n  return -1;\n}\n\n// Seri porttan karakterleri biriktirir. Satır bitince true döner.\nbool satirOku() {\n  while (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == '\\r') continue;\n    if (c == '\\n') {\n      satir[uzunluk] = '\\0';\n      uzunluk = 0;\n      return true;\n    }\n    if (uzunluk < (int)sizeof(satir) - 1) {\n      satir[uzunluk] = c;\n      uzunluk++;\n    }\n  }\n  return false;\n}\n\n// \"KART:AABBCCDD\" satırını 4 baytlık UID'ye çevirir. Biçim bozuksa false döner.\nbool uidCoz(const char* s, byte uid[4]) {\n  if (strncmp(s, \"KART:\", 5) != 0) return false;\n  s += 5;                                    // \"KART:\" kısmını atla\n  if (strlen(s) != 8) return false;\n  for (int i = 0; i < 4; i++) {\n    int yuksek = hexDeger(s[2 * i]);\n    int alcak = hexDeger(s[2 * i + 1]);\n    if (yuksek < 0 || alcak < 0) return false;\n    uid[i] = yuksek * 16 + alcak;\n  }\n  return true;\n}\n\nvoid uidYaz(const byte uid[4]) {\n  for (int i = 0; i < 4; i++) {\n    if (i > 0) Serial.print(' ');\n    if (uid[i] < 16) Serial.print('0');\n    Serial.print(uid[i], HEX);\n  }\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(YESIL, OUTPUT);\n  pinMode(KIRMIZI, OUTPUT);\n}\n\nvoid loop() {\n  if (satirOku() && satir[0] != '\\0') {\n    byte uid[4];\n    if (!uidCoz(satir, uid)) {\n      Serial.println(\"Gecersiz satir\");\n    } else {\n      Serial.print(\"UID: \");\n      uidYaz(uid);\n      Serial.println();\n      if (memcmp(uid, YETKILI_UID, 4) == 0) {\n        Serial.println(\"YETKILI\");\n        digitalWrite(YESIL, HIGH);\n      } else {\n        Serial.println(\"YETKISIZ\");\n        digitalWrite(KIRMIZI, HIGH);\n      }\n      ledBitis = millis() + LED_SURESI;\n    }\n  }\n\n  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {\n    digitalWrite(YESIL, LOW);\n    digitalWrite(KIRMIZI, LOW);\n    ledBitis = 0;\n  }\n}\n```\n\nÖnce ▶ ile programı çalıştır. Sonra seri monitörün altındaki kutuya `KART:AABBCCDD` yaz ve **Gönder**'e bas. Laboratuvar satır sonunu (`\\n`) kendisi ekler; ayrıca bir ayar yapman gerekmez.\n\n### Nasıl çalışıyor?\n1. `satirOku()` her turda gelen karakterleri `satir` dizisine ekler. `\\n` gelince satırı bitirir. Yarım gelen satır bir sonraki turda devam eder; program hiçbir yerde beklemez.\n2. `uidCoz` önce `KART:` önekini denetler (`strncmp` ilk 5 karakteri karşılaştırır), sonra 8 karakterin hepsinin onaltılık rakam olduğunu doğrular. İki onaltılık rakam bir bayt eder: `yuksek * 16 + alcak`.\n3. `hexDeger`, `'A'` karakterinden `'A'` kodunu çıkarıp 10 ekleyerek 10-15 değerini üretir. Küçük harfle yazılan `aabbccdd` de kabul edilir.\n4. `memcmp(a, b, 4)` iki bellek bölgesinin 4 baytını karşılaştırır; hepsi aynıysa `0` döner. 4 baytlık UID'yi karşılaştırmanın en kısa yolu budur (`==` dizilerde işe yaramaz).\n5. Biçimi bozuk satırlar (`KART:AABB`, `KART:ZZZZZZZZ`, `MERHABA`) \"Gecersiz satir\" olarak reddedilir; kapıyı açan taraf hiç çalışmaz.\n\n### Dene\n- `YETKILI_UID` yerine başka bir değer yaz (örneğin `{0x01, 0x02, 0x03, 0x04}`), programı yeniden çalıştır ve yeni UID'yi gönder. Eski UID artık yetkisiz mi?\n- Yanlış UID gönder: kırmızı LED yanıyor mu?\n- Büyük ve küçük harfli UID gönder (`AABBCCDD` ve `aabbccdd`). İkisi de aynı sonucu veriyor mu?\n\n### Sık yapılan hatalar\n- Gerçek RC522'yi 5 V ile beslemek.\n- Gerçek devrede SS ve RST pinlerini sketch'te bir yere, kabloda başka yere bağlamak.\n- Program çalışmıyorken (▶'e basmadan) satır göndermeye çalışmak: kutu kapalıdır ve \"Önce başlat\" yazar.\n- `KART:` önekini ya da 8 onaltılık rakamı eksik yazmak: program `Gecersiz satir` der.\n- UID'yi tek başına güvenli sanmak: UID okunabilir ve bazı kartlarla taklit edilebilir.\n- Aynı pinleri iki cihaza birden vermek (bu dersin çakışma tablosu).",
          "question": "Yetki kontrolünü \"kartı okuyan taraf\" ile \"kapıyı açan taraf\" diye iki parçaya ayırmak sence neden iyi bir fikir? Kart okuyucuyu sonradan değiştirmek istesen hangi kısmı değiştirirdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- RFID'in pilsiz bir kartı radyo dalgasıyla nasıl okuduğunu\n- UID'nin ne olduğunu ve neden tek başına parola sayılmayacağını\n- SPI hattının dört telini ve Uno'daki sabit pinlerini\n- Pin sayısını önceden hesaplamayı ve seri taklitle test etmeyi\n\n### Önceden bilmen gerekenler\n- Ders 33: I2C ile iki telli haberleşme\n- Ders 34: bayt ve `char` dizisi\n- Ders 62: tuş takımının pin ihtiyacı\n\n### Pilsiz kart\nRC522 modülü 13,56 MHz'lik bir radyo alanı üretir. Karttaki küçük anten bu alandan enerji toplar ve çip uyanır. Bu yüzden kartta pil yoktur. Çip, belleğindeki **UID**'yi (benzersiz kimlik numarasını) geri gönderir. Yaygın kartlarda UID 4 bayttır; örneğin `AA BB CC DD`.\n\nUID bir parola değildir: kartı okuyabilen herkes onu öğrenir ve bazı özel kartlar UID'yi taklit eder. Ciddi bir kilit yalnızca UID'ye güvenmez; bu hafta kartı PIN ile birlikte kullanacağız.\n\n### SPI hattı\nRC522, Arduino ile dört telli **SPI** üzerinden konuşur. I2C iki tel kullanırken SPI daha hızlıdır ve dört tel ister:\n\n| Tel | Görev | Uno pini |\n|---|---|---|\n| SCK | Saat darbesi | D13 |\n| MOSI | Arduino'dan modüle veri | D11 |\n| MISO | Modülden Arduino'ya veri | D12 |\n| SS | Modülü seçer | D10 (değiştirilebilir) |\n\nRST pini de gerekir ve istediğin pine bağlanır. SCK, MOSI ve MISO Uno'da donanım tarafından belirlidir: bu üç pini başka işe vermek mümkün değildir. Gerçek modül 3,3 V ile çalışır; 5 V'a bağlamak onu bozabilir.\n\n### Pin bütçesi\nBir projeye başlamadan önce pinleri say. Bu hafta keypad 8, RC522 5 (3 sabit SPI, SS ve RST), servo 1, buzzer 1 ve iki LED 2 pin ister; toplam 17. Uno'da D2-D13 (12 pin) ve A0-A3 (4 pin) kullanılabilir, A4 ve A5 LCD'ye gider: 16 pin. Hepsi birden sığmaz. Mühendis bu durumda daha çok pinli bir kart, pin genişletici ya da başka bir çözüm seçer.\n\n### Seri taklit\nKart okuyucu yokken seri monitöre `KART:AABBCCDD` yazarak okumayı taklit ederiz. Program satırı karakter karakter biriktirir, `KART:` önekini ve 8 onaltılık rakamı denetler. İki onaltılık rakam bir bayttır: `yüksek * 16 + alçak`. Yetki kararı UID'ye bakar; UID'nin nereden geldiği (okuyucu ya da seri port) kararı değiştirmez. Bu yüzden gerçek okuyucu eklenince yalnız veri kaynağı değişir.\n\n### Özet\nRFID, pilsiz kartı radyo alanıyla okur ve UID'yi alır; UID tek başına güvenli değildir. RC522 SPI ile konuşur ve D11, D12, D13 sabittir. Pin sayısı önceden hesaplanmalıdır; bu projede 17 pin gerekir, Uno'da 16 vardır. Eksik donanım seri taklitle test edilir ve yetki mantığı veri kaynağından bağımsız kalır.",
          "concepts": [
            {
              "term": "RFID ve UID",
              "definition": "RFID, radyo dalgasıyla pilsiz kartı okumaktır; UID kartın benzersiz kimlik numarasıdır (genellikle 4 bayt).",
              "example": "Kartın UID'si AA BB CC DD ise yetkili listesindeki dört baytla karşılaştırılır.",
              "pitfall": "UID'yi parola sanmak; okunabilir ve bazı kartlarla taklit edilebilir."
            },
            {
              "term": "SPI",
              "definition": "SCK, MOSI, MISO ve SS olmak üzere dört telli hızlı haberleşme biçimi.",
              "example": "RC522 için Uno'da SCK D13, MOSI D11, MISO D12 olur; SS D10 seçilebilir.",
              "pitfall": "SPI pinlerini başka cihaza vermek: D11-D13 donanım tarafından belirlidir."
            },
            {
              "term": "3,3 V mantık",
              "definition": "RC522 modülü 3,3 V ile çalışır; 5 V verilirse zarar görebilir.",
              "example": "Gerçek devrede modülün 3.3V bacağı Uno'nun 3,3 V çıkışına bağlanır.",
              "pitfall": "3.3V bacağını 5 V çıkışına bağlamak."
            },
            {
              "term": "Pin bütçesi",
              "definition": "Projede kullanılacak tüm parçaların pin ihtiyacını toplayıp karttaki pin sayısıyla karşılaştırmak.",
              "example": "Keypad 8 + RC522 5 + servo 1 + buzzer 1 + LED 2 = 17 pin; Uno'da 16 var.",
              "pitfall": "Parçaları tek tek bağlayıp sonunda pinin bittiğini fark etmek."
            },
            {
              "term": "Seri taklit",
              "definition": "Eksik donanımın yerine seri monitörden aynı biçimde satır göndererek mantığı sınamak.",
              "example": "KART:AABBCCDD yazmak, okuyucu o UID'yi okumuş gibi davranır.",
              "pitfall": "Seri taklidi gerçek RC522 sanmak; yalnızca test içindir."
            }
          ],
          "quiz": [
            {
              "id": "m4h6d3-q1",
              "kind": "numeric",
              "prompt": "Keypad'i olmayan bir proje düşün: RC522 (üç sabit SPI pini, SS ve RST), 1 servo, 1 buzzer ve 2 LED var. Toplam kaç pin gerekir?",
              "answer": 9,
              "unit": "pin",
              "explanation": "RC522 için 3 + 2 = 5, servo 1, buzzer 1, LED 2: 5 + 1 + 1 + 2 = 9 pin. Keypad'in 8 pini çıkarılınca 17 - 8 = 9 bulunur ve Uno'da yer kalır.",
              "skills": [
                "pin-budget",
                "rfid-spi"
              ]
            },
            {
              "id": "m4h6d3-q2",
              "kind": "mcq",
              "prompt": "Gerçek bir RC522 modülünün güç bacağını Uno'nun hangi pinine bağlarsın?",
              "options": [
                "5V",
                "VIN",
                "3,3 V",
                "A0"
              ],
              "answer": 2,
              "explanation": "RC522 3,3 V modüldür. 5V pinine bağlamak modülü bozabilir. VIN kart girişidir ve gerilimi kaynağa göre değişir; A0 bir giriş pinidir, güç vermez.",
              "skills": [
                "rfid-spi"
              ]
            },
            {
              "id": "m4h6d3-q3",
              "kind": "predict-output",
              "prompt": "hexDeger('C') 12, hexDeger('5') 5 döndürüyor. Bu kod ne yazar?\n\n```\nint yuksek = hexDeger('C');\nint alcak = hexDeger('5');\nSerial.println(yuksek * 16 + alcak);\n```",
              "options": [
                "125",
                "197",
                "205",
                "17"
              ],
              "answer": 1,
              "explanation": "12 * 16 = 192, 192 + 5 = 197 (0xC5). 125 rakamları yan yana yazmak olurdu; 17 ise 12 + 5 toplamıdır.",
              "skills": [
                "c-strings",
                "rfid-spi"
              ]
            },
            {
              "id": "m4h6d3-q4",
              "kind": "find-bug",
              "prompt": "Bu işlev 'A' harfi için hep 0 döndürüyor, bu yüzden AA gibi UID'ler 00 okunuyor. Hata hangi satırda?\n\n```\nint hexDeger(char c) {\n  if (c >= '0' && c <= '9') return c - '0';        // satır 1\n  if (c >= 'A' && c <= 'F') return c - 'A';        // satır 2\n  return -1;                                       // satır 3\n}\n```",
              "options": [
                "Satır 2: 'A' için sonuç 10 olmalı, + 10 eksik",
                "Satır 1: '0' çıkarılmamalı",
                "Satır 3: -1 yerine 0 olmalı",
                "Hata yok; 'A' gerçekten 0 eder"
              ],
              "answer": 0,
              "explanation": "'A' - 'A' sıfırdır; onaltılık A, değer olarak 10'dur. Doğrusu c - 'A' + 10. Hata yüzünden hem 'A' hem '0' aynı değeri verir ve farklı UID'ler karışır.",
              "skills": [
                "c-strings",
                "prog-debug"
              ]
            },
            {
              "id": "m4h6d3-q5",
              "kind": "mcq",
              "prompt": "Bir kapı kilidi yalnızca kartın UID'sine bakıyor. Bu neden zayıf bir tasarımdır?",
              "options": [
                "UID 4 bayt olduğu için çok kısadır ve hiç okunamaz",
                "UID okunabilir ve taklit edilebilir; kart ele geçirilince ya da kopyalanınca kilit açılır",
                "RC522 UID'yi hiç okuyamaz",
                "UID her okumada değişir"
              ],
              "answer": 1,
              "explanation": "UID gizli bir sır değildir: okuyucuya yaklaşan herkes onu görür, bazı kartlar UID'yi taklit eder. Bu yüzden ikinci bir faktör (PIN) eklenir. UID okunur ve her okumada aynı kalır.",
              "skills": [
                "access-security",
                "rfid-spi"
              ]
            }
          ]
        },
        {
          "title": "Yetki yönetimi: kart + şifre + EEPROM",
          "durationMin": 35,
          "problem": "Bir apartmanda yeni bir kiracı taşındığında yönetici kapının programını bilgisayara bağlayıp yeniden yüklemez. Kiracının kartı bir komutla eklenir, eski kiracınınki silinir. Üstelik elektrikler kesilse bile liste kaybolmaz. Bu derste yetkili kartları ve PIN'i EEPROM'a kaydeden, yetkiyi bir **master PIN** ile yöneten bir sistem yazacaksın.",
          "contentMd": "### Ne yapacağız?\nÜç şeyi EEPROM'da (34. ders) tutacağız:\n- Kullanıcı PIN'i (kapıyı açan PIN)\n- Master PIN (yönetim PIN'i; kart eklemek, silmek ve kullanıcı PIN'ini değiştirmek için)\n- Yetkili kart UID listesi (en çok 8 kart)\n\nKart okuyucu, keypad ve diğer parçalar birlikte Uno'nun pinlerine sığmadığı için (63. ders) kartları ve PIN girişini **seri komutlarla taklit** ediyoruz. Bu derste devre kurmazsın; laboratuvarda yalnız Uno ve seri monitör yeterlidir. Komutu seri monitörün altındaki kutuya yaz ve **Gönder**'e bas (program çalışıyor olmalı); laboratuvar satır sonunu kendisi ekler.\n\n### Komutlar\n| Komut | Ne yapar? |\n|---|---|\n| `KART:AABBCCDD` | Kart okunmuş gibi davranır; listede varsa YETKILI |\n| `GIRIS:1234` | Keypad'den PIN girilmiş gibi davranır |\n| `EKLE:9999:AABBCCDD` | Master PIN doğruysa kartı listeye ekler |\n| `SIL:9999:AABBCCDD` | Master PIN doğruysa kartı listeden siler |\n| `PINDEGIS:9999:4321` | Master PIN doğruysa kullanıcı PIN'ini değiştirir |\n| `LISTE` | Kayıtlı kartları gösterir |\n\nKomutlar iki nokta üstüste (`:`) ile alanlara ayrılır. Fabrika ayarları: kullanıcı PIN `1234`, master PIN `9999`, kart yok.\n\n### EEPROM haritası\nHer bilginin sabit bir adresi olmalı, yoksa üst üste yazarsın:\n\n| Adres | Boyut | İçerik |\n|---|---|---|\n| 0 | 1 bayt | Kurulum işareti (`0xA5`) |\n| 1-4 | 4 bayt | Kullanıcı PIN'i (rakam karakterleri) |\n| 5-8 | 4 bayt | Master PIN |\n| 9 | 1 bayt | Kayıtlı kart sayısı |\n| 10-41 | 8 × 4 bayt | Kart UID'leri |\n\n**Kurulum işareti** önemlidir. Yeni bir EEPROM'da her hücrede `255` bulunur (34. ders); program bunu PIN sanmamalıdır. Açılışta `0xA5` yoksa fabrika ayarları yazılır. İşareti **en son** yazıyoruz: kurulum yarıda kesilirse (güç gitmesi gibi) işaret yazılmamış olur ve program bir sonraki açılışta kurulumu yeniden yapar.\n\n### EEPROM yıpranması\nHer hücre yaklaşık 100.000 yazma için garantilidir (34. ders). Bu sistemde hücreler nadiren değişir, ama yine de iki kural uyguluyoruz:\n- Her yazmada `EEPROM.update` kullanırız. Değer zaten aynıysa hiç yazılmaz.\n- Kartı **okumak** hiçbir şey yazmaz. `KART` ve `GIRIS` komutları EEPROM'a yazmaz; yazma yalnızca `EKLE`, `SIL`, `PINDEGIS` ve ilk kurulumda olur.\n\nKart silerken listeyi baştan yazmak yerine **son kartı silinenin yerine kopyalarız** ve sayacı bir azaltırız. Böylece en çok bir kartlık (4 bayt) ve bir sayaç yazılır.\n\n### Program\n```cpp\n// sketch: yetki_yonetimi\n#include <EEPROM.h>\n\nconst int ADR_ISARET = 0;\nconst int ADR_KULLANICI_PIN = 1;\nconst int ADR_MASTER_PIN = 5;\nconst int ADR_KART_SAYISI = 9;\nconst int ADR_KARTLAR = 10;\nconst int MAX_KART = 8;\nconst int PIN_UZUNLUK = 4;\nconst byte ISARET = 0xA5;\n\nchar satir[40];\nint uzunluk = 0;\n\n// ---- Yardımcılar ----\nint hexDeger(char c) {\n  if (c >= '0' && c <= '9') return c - '0';\n  if (c >= 'A' && c <= 'F') return c - 'A' + 10;\n  if (c >= 'a' && c <= 'f') return c - 'a' + 10;\n  return -1;\n}\n\nbool uidCoz(const char* hex, byte uid[4]) {      // \"AABBCCDD\" -> 4 bayt\n  if (strlen(hex) != 8) return false;\n  for (int i = 0; i < 4; i++) {\n    int yuksek = hexDeger(hex[2 * i]);\n    int alcak = hexDeger(hex[2 * i + 1]);\n    if (yuksek < 0 || alcak < 0) return false;\n    uid[i] = yuksek * 16 + alcak;\n  }\n  return true;\n}\n\nvoid uidYaz(const byte uid[4]) {\n  for (int i = 0; i < 4; i++) {\n    if (i > 0) Serial.print(' ');\n    if (uid[i] < 16) Serial.print('0');\n    Serial.print(uid[i], HEX);\n  }\n}\n\nbool pinGecerli(const char* s) {                 // tam 4 rakam mı?\n  if (strlen(s) != PIN_UZUNLUK) return false;\n  for (int i = 0; i < PIN_UZUNLUK; i++) {\n    if (s[i] < '0' || s[i] > '9') return false;\n  }\n  return true;\n}\n\n// ---- EEPROM işlemleri ----\nvoid pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {\n  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);\n  pin[PIN_UZUNLUK] = '\\0';\n}\n\nvoid pinYaz(int adres, const char* pin) {\n  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);\n}\n\nbool pinEsit(int adres, const char* girilen) {\n  char kayitli[PIN_UZUNLUK + 1];\n  pinOku(adres, kayitli);\n  return strcmp(kayitli, girilen) == 0;\n}\n\nbyte kartSayisi() {\n  byte n = EEPROM.read(ADR_KART_SAYISI);\n  if (n > MAX_KART) n = 0;                       // bozuk ya da boş (255)\n  return n;\n}\n\nvoid kartOku(int sira, byte uid[4]) {\n  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);\n}\n\nvoid kartYaz(int sira, const byte uid[4]) {\n  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);\n}\n\nint kartBul(const byte uid[4]) {                 // sırası ya da -1\n  byte n = kartSayisi();\n  for (int i = 0; i < n; i++) {\n    byte kayitli[4];\n    kartOku(i, kayitli);\n    if (memcmp(kayitli, uid, 4) == 0) return i;\n  }\n  return -1;\n}\n\nvoid fabrikaAyari() {\n  pinYaz(ADR_KULLANICI_PIN, \"1234\");\n  pinYaz(ADR_MASTER_PIN, \"9999\");\n  EEPROM.update(ADR_KART_SAYISI, 0);\n  EEPROM.update(ADR_ISARET, ISARET);             // en son: kurulum tamamlandı\n}\n\n// ---- Komutlar ----\nvoid kartEkle(const char* hex) {\n  byte uid[4];\n  if (!uidCoz(hex, uid)) { Serial.println(\"Gecersiz UID\"); return; }\n  if (kartBul(uid) >= 0) { Serial.println(\"ZATEN VAR\"); return; }\n  byte n = kartSayisi();\n  if (n >= MAX_KART) { Serial.println(\"LISTE DOLU\"); return; }\n  kartYaz(n, uid);\n  EEPROM.update(ADR_KART_SAYISI, n + 1);         // sayaç en son: yarım kayıt görünmez\n  Serial.print(\"EKLENDI (\");\n  Serial.print(n + 1);\n  Serial.print(\"/\");\n  Serial.print(MAX_KART);\n  Serial.println(\")\");\n}\n\nvoid kartSil(const char* hex) {\n  byte uid[4];\n  if (!uidCoz(hex, uid)) { Serial.println(\"Gecersiz UID\"); return; }\n  int sira = kartBul(uid);\n  if (sira < 0) { Serial.println(\"BULUNAMADI\"); return; }\n  byte n = kartSayisi();\n  byte son[4];\n  kartOku(n - 1, son);\n  kartYaz(sira, son);                            // son kartı boşalan yere taşı\n  EEPROM.update(ADR_KART_SAYISI, n - 1);\n  Serial.print(\"SILINDI (\");\n  Serial.print(n - 1);\n  Serial.print(\"/\");\n  Serial.print(MAX_KART);\n  Serial.println(\")\");\n}\n\nvoid listele() {\n  byte n = kartSayisi();\n  Serial.print(\"Kart sayisi: \");\n  Serial.println(n);\n  for (int i = 0; i < n; i++) {\n    byte uid[4];\n    kartOku(i, uid);\n    Serial.print(i + 1);\n    Serial.print(\": \");\n    uidYaz(uid);\n    Serial.println();\n  }\n}\n\nvoid komutIsle(char* s) {\n  char* alan[3];\n  int adet = 0;\n  alan[adet++] = s;\n  for (char* p = s; *p != '\\0' && adet < 3; p++) {\n    if (*p == ':') {                             // ':' yerine bitiş işareti koy, yeni alan başlat\n      *p = '\\0';\n      alan[adet++] = p + 1;\n    }\n  }\n\n  if (strcmp(alan[0], \"KART\") == 0 && adet == 2) {\n    byte uid[4];\n    if (!uidCoz(alan[1], uid)) Serial.println(\"Gecersiz UID\");\n    else Serial.println(kartBul(uid) >= 0 ? \"YETKILI\" : \"YETKISIZ\");\n  } else if (strcmp(alan[0], \"GIRIS\") == 0 && adet == 2) {\n    Serial.println(pinEsit(ADR_KULLANICI_PIN, alan[1]) ? \"PIN DOGRU\" : \"PIN YANLIS\");\n  } else if (strcmp(alan[0], \"LISTE\") == 0 && adet == 1) {\n    listele();\n  } else if (adet == 3 && (strcmp(alan[0], \"EKLE\") == 0 || strcmp(alan[0], \"SIL\") == 0 || strcmp(alan[0], \"PINDEGIS\") == 0)) {\n    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {     // üç yönetim komutu da master PIN ister\n      Serial.println(\"MASTER PIN YANLIS\");\n    } else if (strcmp(alan[0], \"EKLE\") == 0) {\n      kartEkle(alan[2]);\n    } else if (strcmp(alan[0], \"SIL\") == 0) {\n      kartSil(alan[2]);\n    } else {\n      if (!pinGecerli(alan[2])) {\n        Serial.println(\"PIN 4 rakam olmali\");\n      } else {\n        pinYaz(ADR_KULLANICI_PIN, alan[2]);\n        Serial.println(\"PIN DEGISTI\");\n      }\n    }\n  } else {\n    Serial.println(\"Bilinmeyen komut\");\n  }\n}\n\nbool satirOku() {\n  while (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == '\\r') continue;\n    if (c == '\\n') {\n      satir[uzunluk] = '\\0';\n      uzunluk = 0;\n      return true;\n    }\n    if (uzunluk < (int)sizeof(satir) - 1) {\n      satir[uzunluk] = c;\n      uzunluk++;\n    }\n  }\n  return false;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  if (EEPROM.read(ADR_ISARET) != ISARET) {\n    fabrikaAyari();\n    Serial.println(\"Fabrika ayari yazildi\");\n  }\n  Serial.print(\"Yetki sistemi hazir. Kart sayisi: \");\n  Serial.println(kartSayisi());\n}\n\nvoid loop() {\n  if (satirOku() && satir[0] != '\\0') {\n    komutIsle(satir);\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `setup` kurulum işaretine bakar. İlk açılışta fabrika ayarlarını yazar; sonraki açılışlarda EEPROM'a **hiçbir şey yazmaz**, yalnızca okur.\n2. `komutIsle` satırı `:` işaretlerinde keser. `alan[0]` komut, `alan[1]` ve `alan[2]` parametrelerdir. Satırın içindeki `:` yerine `'\\0'` koyduğumuz için her alan kendi başına bir C yazısı olur (62. dersteki `strcmp` ile karşılaştırılabilir).\n3. Üç yönetim komutu (`EKLE`, `SIL`, `PINDEGIS`) aynı yerden geçer ve hepsi önce master PIN'i denetler. Master PIN yanlışsa EEPROM'a dokunulmaz.\n4. `kartEkle` kartı önce arar; zaten varsa yazmaz (`ZATEN VAR`). Yeni kartı listenin sonuna yazar, **sayacı en son** artırır. Yazma sırasında güç giderse sayaç artmadığı için yarım yazılmış kart listede görünmez.\n5. `kartSil` son kartı silinenin yerine taşır. Sayaç bir azalır, böylece son kartın eski baytları artık kullanılmaz. Sonuç olarak liste her zaman boşluksuzdur.\n6. `PIN` EEPROM'da rakam karakterleri olarak durur; kayıtlı PIN ile gelen yazı `strcmp` ile karşılaştırılır.\n7. Boş (`255`) ya da bozuk bir kart sayacı `kartSayisi()` içinde 0 sayılır; liste taşmaz.\n\n### Dene\n- `EKLE:9999:AABBCCDD`, sonra `LISTE`, sonra kartı tekrar `EKLE`. İkincisinde ne yazıyor? EEPROM'a yazıldı mı? (Cevap: yazılmadı, çünkü `kartBul` kartı buldu.)\n- Üç kart ekle, ortadakini `SIL` ile sil, `LISTE` ile sırayı gör. Son kart nereye geldi?\n- Bir kart ekle ve `PINDEGIS` ile PIN'i değiştir. Sonra ■ ile durdurup ▶ ile yeniden başlat ve `LISTE` yaz. Ne görüyorsun? Laboratuvardaki EEPROM, gerçek kartta olduğu gibi güç kesilince korunur: kart listesi yerinde durur ve açılışta `Fabrika ayari yazildi` bir daha çıkmaz (işaret baytı artık yazılı). Verileri silmek için ↺ Sıfırla'ya bas; EEPROM boşalır ve fabrika ayarı yeniden yazılır.\n\n### Sık yapılan hatalar\n- Kurulum işareti koymamak: boş EEPROM'daki `255` değerlerini PIN sanırsın.\n- `EEPROM.write` kullanmak: aynı değeri her seferinde yeniden yazar ve hücreyi gereksiz yıpratır.\n- Sayacı kartı yazmadan önce artırmak: yazma sırasında güç giderse yarım kart yetkili görünebilir.\n- Master PIN ile kullanıcı PIN'ini aynı yapmak: yönetim yetkisi herkese açılır.\n- Master PIN'i denemeye sınırsız açık bırakmak. Bu derste master PIN için deneme sınırı yok; seri port bilgisayara bağlı biri herkesten fazla deneme yapabilir. Gerçek üründe bu sınırlanır ya da yönetim komutları kapalı tutulur.",
          "question": "Kartı kaybeden birinin kartını listeden silmek yeterli mi? PIN'i de değiştirmek gerekir mi? Hangi durumda hangisi gerekir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Yetki bilgisini (PIN ve kartlar) neden EEPROM'da sakladığımızı\n- Her bilgiye sabit adres veren bir EEPROM haritası çıkarmayı\n- Kurulum işareti ve yazma sırasıyla güç kesintisine dayanmayı\n- Master PIN ile yönetim komutlarını korumayı\n\n### Önceden bilmen gerekenler\n- Ders 34: EEPROM'a `read` ve `update` ile yazmak, boş hücrede 255 bulunması\n- Ders 62: `char` dizisi ve `strcmp`\n- Ders 63: UID'nin 4 bayt olması ve seri taklit\n\n### Kalıcı bellek\nKodun içine yazılmış bir PIN, değiştirmek için programı yeniden yüklemeyi gerektirir. RAM'deki bilgi ise güç kesilince kaybolur. **EEPROM** ise elektrik kesilse bile tuttuğu bilgiyi saklar. Yetkili kartlar ve PIN'ler burada durursa yönetici bunları komutla değiştirebilir ve cihaz yeniden açıldığında liste yerinde olur.\n\n### EEPROM haritası\nHer bilgiye sabit bir adres verilmezse üst üste yazarsın. Bu derste:\n\n| Adres | Boyut | İçerik |\n|---|---|---|\n| 0 | 1 bayt | Kurulum işareti (0xA5) |\n| 1-4 | 4 bayt | Kullanıcı PIN'i |\n| 5-8 | 4 bayt | Master PIN |\n| 9 | 1 bayt | Kart sayısı |\n| 10-41 | 8 × 4 bayt | Kart UID'leri |\n\n`k`. kartın (0'dan sayarsan) ilk baytının adresi `10 + k * 4` olur. En çok 8 kart sığar, çünkü 8 × 4 = 32 bayt ayrılmıştır.\n\n### Kurulum işareti\nYeni bir EEPROM'da her hücre 255 taşır; program bunu PIN sanmamalıdır. Açılışta adres 0'da `0xA5` yoksa cihaz ilk kez çalışıyordur ve fabrika ayarları yazılır. İşareti **en son** yazarız: kurulum yarıda kesilirse işaret yoktur ve sonraki açılışta kurulum baştan yapılır.\n\n### Yazma sırası ve yıpranma\nKart eklerken önce kartın baytlarını, **en son** kart sayacını yazarsın. Güç ortada giderse sayaç artmamıştır ve yarım yazılmış kart listede görünmez. Her hücre yaklaşık 100.000 yazma için garantilidir. `EEPROM.update` değer aynıysa yazmaz; okuma ve doğrulama hiç yazma harcamaz. Kart silerken listeyi baştan yazmak yerine **son kartı silinenin yerine kopyalar** ve sayacı bir azaltırsın; bu liste boşluksuz kalır ve en çok bir kartlık yazma yapılır.\n\n### Master PIN\nKart eklemek, silmek ve PIN değiştirmek yönetim işidir; sıradan kullanıcı PIN'i ile yapılamaz. Bu komutların hepsi önce **master PIN**'i denetler. İkisi aynı olursa yönetim herkese açılır. Komutlar `EKLE:9999:AABBCCDD` gibi `:` ile alanlara ayrılır; her `:` yerine `'\\0'` koyunca her alan kendi başına bir yazı olur.\n\n### Özet\nEEPROM, güç kesilse de yetki bilgisini korur. Her bilgiye sabit adres veren bir harita gerekir ve kurulum işareti ilk açılışı ayırt eder. Yazarken sayaç en son güncellenir, böylece yarım kayıt görünmez. Silmede son kart boşalan yere taşınır. Yönetim komutları master PIN ile korunur.",
          "concepts": [
            {
              "term": "EEPROM haritası",
              "definition": "Her bilgiye sabit adres ve boyut veren yazılı düzen; üst üste yazmayı önler.",
              "example": "Adres 9 kart sayısı, 10'dan itibaren 4'er baytlık UID'ler.",
              "pitfall": "Adresleri kod içinde dağınık sayılarla yazmak; biri değişince diğerlerini bozarsın."
            },
            {
              "term": "Kurulum işareti",
              "definition": "İlk açılışı ayırt eden, en son yazılan özel bayt (0xA5).",
              "example": "Adres 0'da 0xA5 yoksa fabrika ayarları yazılır.",
              "pitfall": "İşaret koymamak: boş EEPROM'daki 255 değerleri PIN sanılır."
            },
            {
              "term": "EEPROM.update",
              "definition": "Hücredeki değer yeniden yazılacaksa ve aynıysa hiçbir şey yapmayan yazma komutu.",
              "example": "Aynı kartı yeniden kaydetmek hücreleri yıpratmaz.",
              "pitfall": "EEPROM.write kullanmak: aynı değeri her seferinde yeniden yazar ve hücreyi gereksiz yıpratır."
            },
            {
              "term": "Sayacı en son yazmak",
              "definition": "Önce kayıt baytları, sonra sayaç yazılır; yarım kayıt listede görünmez.",
              "example": "Güç kart baytları yazılırken giderse sayaç artmamış olur.",
              "pitfall": "Sayacı kayıttan önce artırmak: yarım yazılmış kart yetkili görünebilir."
            },
            {
              "term": "Master PIN",
              "definition": "Kart eklemek, silmek ve kullanıcı PIN'ini değiştirmek için gereken ayrı yönetim PIN'i.",
              "example": "EKLE:9999:AABBCCDD komutu 9999 doğruysa kartı ekler.",
              "pitfall": "Master PIN'i kullanıcı PIN'iyle aynı yapmak ya da sınırsız deneme hakkı bırakmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h6d4-q1",
              "kind": "numeric",
              "prompt": "Kart UID'leri adres 10'dan başlıyor ve her kart 4 bayt. 3. kartın (listedeki üçüncü) ilk baytı hangi EEPROM adresindedir?",
              "answer": 18,
              "tolerance": 0,
              "explanation": "Üçüncü kartın sırası 2'dir (0'dan sayılır): 10 + 2 × 4 = 18. 22 hesabı dördüncü karta, 14 ise ikinci karta aittir.",
              "skills": [
                "eeprom-store"
              ]
            },
            {
              "id": "m4h6d4-q2",
              "kind": "mcq",
              "prompt": "Kurulum işareti (0xA5) neden fabrika ayarlarının en sonunda yazılır?",
              "options": [
                "En sona yazılan bayt daha az yıpranır",
                "Kurulum yarıda kesilirse işaret yoktur ve sonraki açılışta kurulum baştan yapılır",
                "0xA5 diğer baytlardan büyük olduğu için",
                "İşaret yazılmadan EEPROM okunamaz"
              ],
              "answer": 1,
              "explanation": "İşaret kurulumun bittiğini kanıtlar. Güç ortada giderse işaret hiç yazılmamıştır; program ilk kez çalışıyormuş gibi kurulumu tekrarlar. Yıpranma ya da değerin büyüklüğüyle ilgisi yoktur.",
              "skills": [
                "eeprom-store"
              ]
            },
            {
              "id": "m4h6d4-q3",
              "kind": "predict-output",
              "prompt": "Kartlar 10, 20, 30, 40 olarak kayıtlı. 20 numaralı kart (sıra 1) silinirken son kart boşalan yere taşınıyor. Kod çalışınca ne yazılır?\n\n```\nbyte kart[4] = {10, 20, 30, 40};\nbyte n = 4;\nint sira = 1;\nkart[sira] = kart[n - 1];\nn--;\nfor (int i = 0; i < n; i++) {\n  Serial.print(kart[i]);\n  Serial.print(' ');\n}\n```",
              "options": [
                "10 30 40",
                "10 40 30",
                "10 20 30",
                "10 30 40 40"
              ],
              "answer": 1,
              "explanation": "kart[1] yerine son kart olan 40 yazılır: 10, 40, 30, 40. n 3'e düşer, yalnız ilk üç sıra yazılır: 10 40 30. Sıra korunmaz ama liste boşluksuz kalır.",
              "skills": [
                "eeprom-store",
                "prog-loops-arrays"
              ]
            },
            {
              "id": "m4h6d4-q4",
              "kind": "find-bug",
              "prompt": "Bu işlev kart eklerken güç kesilirse listede bozuk bir kart belirebiliyor. Neden?\n\n```\nvoid kartEkle(const byte uid[4]) {\n  byte n = kartSayisi();\n  EEPROM.update(ADR_KART_SAYISI, n + 1);   // satır 1\n  kartYaz(n, uid);                          // satır 2\n}\n```",
              "options": [
                "Satır 1: sayaç kart baytlarından önce artıyor; güç satır 2'de giderse yarım kart listeye girmiş olur",
                "Satır 2: kartYaz çağrılmamalı",
                "n + 1 yerine n - 1 olmalı",
                "EEPROM.update hiç kullanılmamalı"
              ],
              "answer": 0,
              "explanation": "Sayaç en son yazılmalıdır. Burada sayaç artmış ama kartın baytları henüz yazılmamıştır; güç bu arada giderse bozuk ya da eski bir UID yetkili sayılır. update kullanmak doğrudur.",
              "skills": [
                "eeprom-store",
                "access-security",
                "prog-debug"
              ]
            },
            {
              "id": "m4h6d4-q5",
              "kind": "numeric",
              "prompt": "Bir EEPROM hücresi yaklaşık 100.000 yazma için garantili. Bir program bu hücreyi günde 50 kez yazıyorsa kaç günde sınıra ulaşır?",
              "answer": 2000,
              "tolerance": 0,
              "unit": "gün",
              "explanation": "100.000 / 50 = 2000 gün (yaklaşık 5,5 yıl). Bu yüzden sık değişen değerler EEPROM'a değil RAM'e yazılır ve EEPROM.update ile gereksiz yazma önlenir.",
              "skills": [
                "eeprom-store"
              ]
            }
          ]
        },
        {
          "title": "Proje: Akıllı kapı kilidi",
          "durationMin": 40,
          "problem": "Bir otelde oda kapısına kartı tutarsın, yeşil ışık yanar, kilit açılır, birkaç saniye sonra kendiliğinden kapanır. Üç kez yanlış şifre girersen ise kapı seni bir süre dinlemez. Bu hafta öğrendiğin parçalar tam olarak bunun için: tuş takımı, kart, EEPROM'da yetki listesi. Şimdi hepsini servo, ekran ve buzzerle birleştirip çalışan bir kapı kilidi yapacaksın.",
          "contentMd": "### Ne yapacağız?\nBu proje önceki derslerden şunları birleştirir:\n- **Bu hafta:** Keypad ile PIN girişi (62), seri taklit ile kart okuma (63), EEPROM'da PIN ve kart listesi, master PIN ile yönetim (64).\n- **Modül 3, hafta 5:** Servo ile kilit mandalı (21. ders).\n- **Modül 3, hafta 6:** `millis()` ile bloklamayan zamanlama ve durum makinesi (27-28. dersler).\n- **Modül 3, hafta 7:** I2C LCD ekran (32-33. dersler) ve EEPROM (34. ders).\n\nKural şöyle:\n- Doğru PIN ya da yetkili kart: kapı **5 saniye** açılır, sonra kendiliğinden kilitlenir.\n- Yanlış PIN ya da yetkisiz kart bir hak yer. **3 yanlış denemede** kapı **30 saniye** boyunca hiçbir girişi kabul etmez.\n- Her olay ekranda gösterilir ve buzzerle sese dökülür.\n\n### Devre\nBu projede kilit yalnızca bir servodur. Laboratuvarda servonun VCC ucunu Uno'nun 5V pinine bağlaman yeterlidir. Gerçek bir devrede küçük bir servo bile kalkışta fazla akım çekebilir; bu yüzden gerçek kapı projelerinde servo ayrı bir 5 V kaynaktan beslenir ve kaynağın GND'si Arduino'nun GND'siyle birleştirilir (ortak GND). Bu, laboratuvarda yapman gereken bir şey değil, gerçek dünya bilgisidir.\n\nBu haftanın pinleri Modül 4'ün standart tablosundan farklıdır, çünkü keypad D2-D9'un hepsini alır. Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla:\n\n| Parça | Bağlantı |\n|---|---|\n| Keypad 4x4 | Satırlar R1..R4 → **D9, D8, D7, D6**; sütunlar C1..C4 → **D5, D4, D3, D2** |\n| Servo (kilit mandalı) | SIG → **D10**; VCC → **5V**; GND → **GND** |\n| Buzzer (pasif) | **+** → **D11**; **-** → **GND** |\n| Kırmızı LED (\"kilitli\") | **D12** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |\n| Yeşil LED (\"açık\") | **D13** → direnç (330 Ω) 1; direnç 2 → LED **A**; LED **K** → **GND** |\n| I2C LCD 16x2 | SDA → **A4**, SCL → **A5**, VCC → **5V**, GND → **GND** (adres 0x27) |\n| Kart okuyucu | **Yok:** kart, seri monitörden `KART:AABBCCDD` yazılarak taklit edilir |\n\nBuzzerin **Tür** özelliği \"Pasif\" olmalı (`tone()` pasif buzzerle çalışır). Kart okuyucu bu projede yoktur çünkü hepsi birden Uno'nun pinlerine sığmaz: RC522 ile keypad, servo, buzzer, iki LED toplam 17 pin ister, Uno'da 16 pin kullanılabilir (63. dersteki hesap). Seri taklit, **kart okuyucu yokken test için** kullanılan bir yöntemdir; gerçek RC522 değildir. Okuyucu ekleneceği gün `rc522_oku` programının yazdığı `KART:...` satırı, burada seri porttan gelen satırın yerini alır.\n\n### Durum makinesi\n| Durum | Servo | LED | Çıkış koşulu |\n|---|---|---|---|\n| KILITLI | 0° | Kırmızı yanık | Doğru PIN ya da yetkili kart: ACIK. 3. yanlış deneme: BLOKE |\n| ACIK | 90° | Yeşil yanık | 5 sn dolunca: KILITLI |\n| BLOKE | 0° | Kırmızı 2 Hz yanıp söner | 30 sn dolunca: KILITLI (yanlış sayacı sıfırlanır) |\n\nACIK ve BLOKE durumlarında tuşlara basmak ve kart göstermek etkisizdir. Kapı açıkken ek bir kart okutarak süreyi uzatma gibi bir kısayol yok; bilinçli bir sadelik.\n\n### Program\n```cpp\n// sketch: akilli_kapi\n#include <Keypad.h>\n#include <Servo.h>\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <EEPROM.h>\n\n// ---- Pinler ----\nconst int SERVO_PIN = 10;\nconst int BUZZER = 11;\nconst int KIRMIZI = 12;\nconst int YESIL = 13;\n\n// ---- Ayarlar ----\nconst int ACIK_ACI = 90;\nconst int KILIT_ACI = 0;\nconst int PIN_UZUNLUK = 4;\nconst int AZAMI_YANLIS = 3;\nconst unsigned long ACIK_SURESI = 5000;        // ms\nconst unsigned long BLOK_SURESI = 30000;       // ms\nconst unsigned long MESAJ_SURESI = 1500;       // ms\nconst unsigned long GIRIS_ZAMAN_ASIMI = 10000; // ms: yarım kalan PIN silinir\n\n// ---- EEPROM haritası (64. ders) ----\nconst int ADR_ISARET = 0;\nconst int ADR_KULLANICI_PIN = 1;\nconst int ADR_MASTER_PIN = 5;\nconst int ADR_KART_SAYISI = 9;\nconst int ADR_KARTLAR = 10;\nconst int MAX_KART = 8;\nconst byte ISARET = 0xA5;\n\n// ---- Nesneler ----\nconst byte SATIR = 4;\nconst byte SUTUN = 4;\nchar tuslar[SATIR][SUTUN] = {\n  {'1', '2', '3', 'A'},\n  {'4', '5', '6', 'B'},\n  {'7', '8', '9', 'C'},\n  {'*', '0', '#', 'D'}\n};\nbyte satirPinleri[SATIR] = {9, 8, 7, 6};\nbyte sutunPinleri[SUTUN] = {5, 4, 3, 2};\nKeypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nServo kilit;\n\n// ---- Durum ----\nenum Durum { KILITLI, ACIK, BLOKE };\nDurum durum = KILITLI;\n\nchar girilen[PIN_UZUNLUK + 1];\nint hane = 0;\nint yanlis = 0;\nunsigned long acikBitis = 0;\nunsigned long blokBitis = 0;\nunsigned long mesajBitis = 0;\nunsigned long sonTus = 0;\nbool mesajVar = false;\nchar mesajUst[17];\nchar mesajAlt[17];\nchar sonUst[17] = \"\";\nchar sonAlt[17] = \"\";\n\nchar satir[40];\nint uzunluk = 0;\n\nbool doldu(unsigned long simdi, unsigned long bitis) {\n  return (long)(simdi - bitis) >= 0;           // millis() taşsa da doğru\n}\n\n// ---- Yardımcılar (63-64. dersler) ----\nint hexDeger(char c) {\n  if (c >= '0' && c <= '9') return c - '0';\n  if (c >= 'A' && c <= 'F') return c - 'A' + 10;\n  if (c >= 'a' && c <= 'f') return c - 'a' + 10;\n  return -1;\n}\n\nbool uidCoz(const char* hex, byte uid[4]) {\n  if (strlen(hex) != 8) return false;\n  for (int i = 0; i < 4; i++) {\n    int yuksek = hexDeger(hex[2 * i]);\n    int alcak = hexDeger(hex[2 * i + 1]);\n    if (yuksek < 0 || alcak < 0) return false;\n    uid[i] = yuksek * 16 + alcak;\n  }\n  return true;\n}\n\nvoid uidYaz(const byte uid[4]) {\n  for (int i = 0; i < 4; i++) {\n    if (i > 0) Serial.print(' ');\n    if (uid[i] < 16) Serial.print('0');\n    Serial.print(uid[i], HEX);\n  }\n}\n\nbool pinGecerli(const char* s) {\n  if (strlen(s) != PIN_UZUNLUK) return false;\n  for (int i = 0; i < PIN_UZUNLUK; i++) {\n    if (s[i] < '0' || s[i] > '9') return false;\n  }\n  return true;\n}\n\n// ---- EEPROM işlemleri (64. ders) ----\nvoid pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {\n  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);\n  pin[PIN_UZUNLUK] = '\\0';\n}\n\nvoid pinYaz(int adres, const char* pin) {\n  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);\n}\n\nbool pinEsit(int adres, const char* girilenPin) {\n  char kayitli[PIN_UZUNLUK + 1];\n  pinOku(adres, kayitli);\n  return strcmp(kayitli, girilenPin) == 0;\n}\n\nbyte kartSayisi() {\n  byte n = EEPROM.read(ADR_KART_SAYISI);\n  if (n > MAX_KART) n = 0;\n  return n;\n}\n\nvoid kartOku(int sira, byte uid[4]) {\n  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);\n}\n\nvoid kartYaz(int sira, const byte uid[4]) {\n  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);\n}\n\nint kartBul(const byte uid[4]) {\n  byte n = kartSayisi();\n  for (int i = 0; i < n; i++) {\n    byte kayitli[4];\n    kartOku(i, kayitli);\n    if (memcmp(kayitli, uid, 4) == 0) return i;\n  }\n  return -1;\n}\n\nvoid fabrikaAyari() {\n  pinYaz(ADR_KULLANICI_PIN, \"1234\");\n  pinYaz(ADR_MASTER_PIN, \"9999\");\n  EEPROM.update(ADR_KART_SAYISI, 0);\n  EEPROM.update(ADR_ISARET, ISARET);\n}\n\nvoid kartEkle(const char* hex) {\n  byte uid[4];\n  if (!uidCoz(hex, uid)) { Serial.println(\"Gecersiz UID\"); return; }\n  if (kartBul(uid) >= 0) { Serial.println(\"ZATEN VAR\"); return; }\n  byte n = kartSayisi();\n  if (n >= MAX_KART) { Serial.println(\"LISTE DOLU\"); return; }\n  kartYaz(n, uid);\n  EEPROM.update(ADR_KART_SAYISI, n + 1);\n  Serial.print(\"EKLENDI (\");\n  Serial.print(n + 1);\n  Serial.print(\"/\");\n  Serial.print(MAX_KART);\n  Serial.println(\")\");\n}\n\nvoid kartSil(const char* hex) {\n  byte uid[4];\n  if (!uidCoz(hex, uid)) { Serial.println(\"Gecersiz UID\"); return; }\n  int sira = kartBul(uid);\n  if (sira < 0) { Serial.println(\"BULUNAMADI\"); return; }\n  byte n = kartSayisi();\n  byte son[4];\n  kartOku(n - 1, son);\n  kartYaz(sira, son);\n  EEPROM.update(ADR_KART_SAYISI, n - 1);\n  Serial.print(\"SILINDI (\");\n  Serial.print(n - 1);\n  Serial.print(\"/\");\n  Serial.print(MAX_KART);\n  Serial.println(\")\");\n}\n\nvoid listele() {\n  byte n = kartSayisi();\n  Serial.print(\"Kart sayisi: \");\n  Serial.println(n);\n  for (int i = 0; i < n; i++) {\n    byte uid[4];\n    kartOku(i, uid);\n    Serial.print(i + 1);\n    Serial.print(\": \");\n    uidYaz(uid);\n    Serial.println();\n  }\n}\n\n// ---- Ekran ----\nvoid satirYaz(int sira, const char* metin) {\n  lcd.setCursor(0, sira);\n  int boy = strlen(metin);\n  for (int i = 0; i < 16; i++) lcd.print(i < boy ? metin[i] : ' ');\n}\n\nvoid ekran(const char* ust, const char* alt) {      // yalnız değişen satırı yeniden yazar\n  if (strcmp(ust, sonUst) != 0) {\n    satirYaz(0, ust);\n    strncpy(sonUst, ust, 16);\n    sonUst[16] = '\\0';\n  }\n  if (strcmp(alt, sonAlt) != 0) {\n    satirYaz(1, alt);\n    strncpy(sonAlt, alt, 16);\n    sonAlt[16] = '\\0';\n  }\n}\n\nvoid mesajGoster(const char* ust, const char* alt) {\n  strncpy(mesajUst, ust, 16);\n  mesajUst[16] = '\\0';\n  strncpy(mesajAlt, alt, 16);\n  mesajAlt[16] = '\\0';\n  mesajVar = true;\n  mesajBitis = millis() + MESAJ_SURESI;\n}\n\n// ---- Kilit mantığı ----\nvoid girisiTemizle() {\n  hane = 0;\n  girilen[0] = '\\0';\n}\n\nvoid erisimVer(const char* yontem) {\n  durum = ACIK;\n  yanlis = 0;\n  mesajVar = false;\n  girisiTemizle();\n  kilit.write(ACIK_ACI);\n  acikBitis = millis() + ACIK_SURESI;\n  tone(BUZZER, 2000, 300);\n  Serial.print(\"ACIK (\");\n  Serial.print(yontem);\n  Serial.println(\")\");\n}\n\nvoid kilitle() {\n  durum = KILITLI;\n  kilit.write(KILIT_ACI);\n  Serial.println(\"KILITLI\");\n}\n\nvoid bloke() {\n  durum = BLOKE;\n  mesajVar = false;\n  girisiTemizle();\n  blokBitis = millis() + BLOK_SURESI;\n  tone(BUZZER, 300, 1000);\n  Serial.println(\"BLOKE 30 sn\");\n}\n\nvoid erisimReddet(const char* yontem) {\n  yanlis++;\n  girisiTemizle();\n  Serial.print(\"YANLIS \");\n  Serial.print(yontem);\n  Serial.print(\" \");\n  Serial.print(yanlis);\n  Serial.print(\"/\");\n  Serial.println(AZAMI_YANLIS);\n  if (yanlis >= AZAMI_YANLIS) {\n    bloke();\n    return;\n  }\n  tone(BUZZER, 400, 500);\n  char alt[17];\n  snprintf(alt, sizeof(alt), \"Kalan hak: %d\", AZAMI_YANLIS - yanlis);\n  mesajGoster(strcmp(yontem, \"PIN\") == 0 ? \"YANLIS PIN\" : \"YETKISIZ KART\", alt);\n}\n\nvoid pinOnayla() {\n  if (hane < PIN_UZUNLUK) {\n    mesajGoster(\"PIN 4 haneli\", \"olmali\");\n    return;\n  }\n  if (pinEsit(ADR_KULLANICI_PIN, girilen)) erisimVer(\"PIN\");\n  else erisimReddet(\"PIN\");\n}\n\nvoid kartIsle(const char* hex) {\n  byte uid[4];\n  if (!uidCoz(hex, uid)) { Serial.println(\"Gecersiz UID\"); return; }\n  if (durum != KILITLI) { Serial.println(\"YOKSAYILDI\"); return; }\n  if (kartBul(uid) >= 0) erisimVer(\"KART\");\n  else erisimReddet(\"KART\");\n}\n\nvoid tuslariIsle(unsigned long simdi) {\n  char tus = tusTakimi.getKey();\n  if (!tus) return;\n  if (durum != KILITLI) return;                    // açıkken ve blokeyken tuşlar yok sayılır\n  sonTus = simdi;\n  mesajVar = false;\n  if (tus >= '0' && tus <= '9') {\n    if (hane < PIN_UZUNLUK) {\n      girilen[hane] = tus;\n      hane++;\n      girilen[hane] = '\\0';\n      tone(BUZZER, 1000, 40);\n    }\n  } else if (tus == '*') {\n    if (hane > 0) {\n      hane--;\n      girilen[hane] = '\\0';\n      tone(BUZZER, 700, 40);\n    }\n  } else if (tus == '#') {\n    pinOnayla();\n  }\n}\n\n// ---- Seri komutlar (kart taklidi + yönetim) ----\nvoid komutIsle(char* s) {\n  char* alan[3];\n  int adet = 0;\n  alan[adet++] = s;\n  for (char* p = s; *p != '\\0' && adet < 3; p++) {\n    if (*p == ':') {\n      *p = '\\0';\n      alan[adet++] = p + 1;\n    }\n  }\n\n  if (strcmp(alan[0], \"KART\") == 0 && adet == 2) {\n    kartIsle(alan[1]);\n  } else if (strcmp(alan[0], \"LISTE\") == 0 && adet == 1) {\n    listele();\n  } else if (adet == 3 && (strcmp(alan[0], \"EKLE\") == 0 || strcmp(alan[0], \"SIL\") == 0 || strcmp(alan[0], \"PINDEGIS\") == 0)) {\n    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {\n      Serial.println(\"MASTER PIN YANLIS\");\n    } else if (strcmp(alan[0], \"EKLE\") == 0) {\n      kartEkle(alan[2]);\n    } else if (strcmp(alan[0], \"SIL\") == 0) {\n      kartSil(alan[2]);\n    } else if (!pinGecerli(alan[2])) {\n      Serial.println(\"PIN 4 rakam olmali\");\n    } else {\n      pinYaz(ADR_KULLANICI_PIN, alan[2]);\n      Serial.println(\"PIN DEGISTI\");\n    }\n  } else {\n    Serial.println(\"Bilinmeyen komut\");\n  }\n}\n\nbool satirOku() {\n  while (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == '\\r') continue;\n    if (c == '\\n') {\n      satir[uzunluk] = '\\0';\n      uzunluk = 0;\n      return true;\n    }\n    if (uzunluk < (int)sizeof(satir) - 1) {\n      satir[uzunluk] = c;\n      uzunluk++;\n    }\n  }\n  return false;\n}\n\n// ---- Zamana bağlı işler ----\nvoid durumGuncelle(unsigned long simdi) {\n  if (durum == ACIK && doldu(simdi, acikBitis)) {\n    kilitle();\n  }\n  if (durum == BLOKE && doldu(simdi, blokBitis)) {\n    yanlis = 0;\n    kilitle();\n    Serial.println(\"BLOKE bitti\");\n  }\n  if (durum == KILITLI && hane > 0 && doldu(simdi, sonTus + GIRIS_ZAMAN_ASIMI)) {\n    girisiTemizle();\n    Serial.println(\"Giris zaman asimi\");\n  }\n  if (mesajVar && doldu(simdi, mesajBitis)) {\n    mesajVar = false;\n  }\n}\n\nvoid ledGuncelle(unsigned long simdi) {\n  digitalWrite(YESIL, durum == ACIK ? HIGH : LOW);\n  if (durum == BLOKE) {\n    digitalWrite(KIRMIZI, (simdi / 250) % 2 == 0 ? HIGH : LOW);   // 2 Hz yanıp söner\n  } else {\n    digitalWrite(KIRMIZI, durum == KILITLI ? HIGH : LOW);\n  }\n}\n\nvoid ekranGuncelle(unsigned long simdi) {\n  char alt[17];\n  if (durum == ACIK) {\n    ekran(\"KAPI ACIK\", \"Hos geldiniz\");\n  } else if (durum == BLOKE) {\n    unsigned long kalan = (blokBitis - simdi + 999) / 1000;      // yukarı yuvarla\n    snprintf(alt, sizeof(alt), \"Bekle: %lu sn\", kalan);\n    ekran(\"KILITLENDI\", alt);\n  } else if (mesajVar) {\n    ekran(mesajUst, mesajAlt);\n  } else if (hane > 0) {\n    strcpy(alt, \"PIN: \");\n    for (int i = 0; i < hane; i++) alt[5 + i] = '*';\n    alt[5 + hane] = '\\0';\n    ekran(\"KAPI KILITLI\", alt);\n  } else {\n    ekran(\"KAPI KILITLI\", \"PIN veya kart\");\n  }\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(KIRMIZI, OUTPUT);\n  pinMode(YESIL, OUTPUT);\n  pinMode(BUZZER, OUTPUT);\n  kilit.attach(SERVO_PIN);\n  kilit.write(KILIT_ACI);\n  girisiTemizle();\n\n  if (EEPROM.read(ADR_ISARET) != ISARET) {\n    fabrikaAyari();\n    Serial.println(\"Fabrika ayari yazildi\");\n  }\n\n  lcd.init();\n  lcd.backlight();\n  Serial.println(\"Akilli kapi hazir\");\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  tuslariIsle(simdi);\n  if (satirOku() && satir[0] != '\\0') komutIsle(satir);\n  durumGuncelle(simdi);\n  ledGuncelle(simdi);\n  ekranGuncelle(simdi);\n}\n```\n\n### Nasıl çalışıyor?\n1. **Üç durum, tek `durum` değişkeni.** `loop` her turda beş iş yapar: tuşlar, seri satır, zaman denetimi, LED'ler, ekran. Hiçbirinde `delay` yok; bu yüzden 30 saniyelik bekleme sırasında bile kart okutma ve tuşlara basma **dinlenir** (ve etkisiz sayıldığı için yok sayılır).\n2. **Zaman denetimi** `doldu(simdi, bitis)` ile yapılır. `(long)(simdi - bitis) >= 0` ifadesi `millis()` 49 günde sıfırlanıp taşsa bile doğru çalışır (27. dersteki çıkarma kuralı).\n3. **İki giriş yolu aynı sonuca varır.** PIN `pinOnayla()`, kart `kartIsle()` üzerinden geçer; ikisi de `erisimVer()` ya da `erisimReddet()` çağırır. Böylece yanlış sayacı **ortak** tutulur: iki yanlış PIN ve bir yetkisiz kart toplamda üç deneme sayılır.\n4. **`erisimVer`** durumu ACIK yapar, servoyu 90° çevirir, sayacı sıfırlar ve 5 saniyelik süreyi başlatır. Süre dolunca `durumGuncelle` kapıyı yeniden kilitler.\n5. **`erisimReddet`** sayacı artırır. Hak bittiyse `bloke()` çağrılır; bitmediyse kullanıcıya LCD'de \"Kalan hak\" gösterilir.\n6. **LCD** `ekran()` fonksiyonuyla güncellenir; bu fonksiyon yalnızca **değişen** satırı yeniden yazar. Her turda 16 karakter yazsaydın I2C hattı gereksiz yere meşgul olurdu. Mesajlar Türkçe karakter içermez; 16x2 LCD'nin yerleşik karakter tablosunda ç, ş, ğ gibi harfler yoktur.\n7. **Buzzer** `tone(pin, frekans, süre)` ile çalar; bu çağrı süre dolmasını beklemez (18. ders). Tuş sesi kısa ve yüksek, hata sesi uzun ve pestir.\n8. **Yarım PIN silinir.** Biri 2 rakam girip gitmişse 10 saniye sonra girişi temizleriz; sonraki kişi başkasının yarım PIN'ini devralmaz.\n9. **EEPROM** 64. dersteki harita ve işlemlerle aynıdır. Açılışta kayıtlı kart ve PIN korunur, yalnızca ilk kurulumda fabrika ayarı yazılır.\n\n### Deneme senaryosu\n▶ ile programı çalıştır ve sırayla dene. Komutları seri monitörün kutusuna yazıp **Gönder**'e bas. Keypad tuşları için tuş takımını seç ve sağ paneldeki **Basılı tuş** listesinden sırayla her tuşu seç; her tuştan sonra listeyi **Yok**'a al (bir tuşu seçili bırakmak, onu basılı tutmak demektir). LCD'deki yazıyı ve servonun açısını tuvalde izle.\n\n| Adım | Ne yap? | Ne olmalı? |\n|---|---|---|\n| 1 | `EKLE:9999:AABBCCDD` | `EKLENDI (1/8)`. Kart yetkili listesine girdi |\n| 2 | Keypad'de `1 2 3 4 #` | Servo 90° olur, yeşil LED yanar, LCD \"KAPI ACIK\" yazar, seri monitörde `ACIK (PIN)` |\n| 3 | 5 saniye bekle | Servo 0°'ye döner, kırmızı LED yanar, `KILITLI` yazılır |\n| 4 | `KART:AABBCCDD` | Aynı biçimde açılır; seri monitörde `ACIK (KART)` |\n| 5 | Keypad'de `0 0 0 0 #`, sonra `KART:11223344`, sonra `1 1 1 1 #` | Üç yanlış deneme; üçüncüde LCD \"KILITLENDI\", kırmızı LED yanıp söner |\n| 6 | Bloke sırasında doğru PIN gir | Hiçbir şey olmaz; kapı açılmaz |\n| 7 | 30 saniye bekle | `BLOKE bitti`, kapı yeniden normal çalışır |\n\n### Dene\n- `ACIK_SURESI` değerini 10 saniye yap. Başka bir yeri değiştirmen gerekti mi?\n- Bloke süresini her bloke olduğunda iki katına çıkaran bir kural ekle (30 sn, 60 sn, 120 sn). Hangi değişkeni saklaman gerekir?\n- Kapı açıkken yeşil LED'i saniyede bir yanıp söndür. Hangi fonksiyona yazacaksın?\n\n### Sık yapılan hatalar\n- Gerçek devrede servoyu Arduino'nun 5 V pininden beslemek: kart sürekli yeniden başlayabilir ya da LCD bozulabilir. Gerçek projede ayrı besleme ve ortak GND kullanılır. Laboratuvarda ise servonun VCC ve GND uçlarını bağlamayı unutma: bağlamazsan servo hareket etmez.\n- Servoyu D6'da bırakmak: D6 bu hafta keypad'in satır pinidir. Tuşlar yanlış okunur, servo titrer.\n- `delay(5000)` ile kapıyı açık tutmak: bu sırada tuşlar ve seri komutlar kaçırılır, bloke mantığı da çalışmaz.\n- Yanlış sayacını PIN ve kart için ayrı tutmak: saldırgan her yoldan ayrı ayrı 3 deneme yapabilir.\n- Fabrika PIN'lerini (1234 ve 9999) değiştirmeden kullanmak. `PINDEGIS` ile kullanıcı PIN'ini değiştir. Master PIN'i değiştiren bir komut bu programda yok; ürün yapacak olsan eklemen gerekir.\n- Bloke süresini `delay(30000)` ile beklemek: kapı 30 saniye boyunca hiçbir şeye tepki vermez, ekran da donar.",
          "question": "Bu kapı kilidi gerçek bir ev kapısına takılsaydı hangi açıklarla karşılaşırdın? Kablo ile kilidin kendisine ulaşan biri ne yapabilir? \"Bilgisayara bağlı seri port\" yönetimi nasıl korunmalı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Bir ürünü kural, durum tablosu ve devre planı olarak önceden tasarlamayı\n- Üç durumlu bir kilidi (KILITLI, ACIK, BLOKE) tek değişkenle yönetmeyi\n- Hiçbir yerde `delay` kullanmadan zaman, tuş ve seri girişi birlikte işlemeyi\n- İki giriş yolunun (PIN ve kart) ortak bir hata sayacı paylaşmasının neden önemli olduğunu\n\n### Önceden bilmen gerekenler\n- Ders 21: servo ile açı vermek\n- Ders 27-28: `millis()` ve durum makinesi\n- Ders 32-34: LCD, I2C ve EEPROM\n- Ders 61-64: tuş takımı, kart taklidi, EEPROM'da yetki\n\n### Önce kural, sonra kod\nAkıllı kapı kilidinin kuralı kısadır: doğru PIN ya da yetkili kart kapıyı 5 saniye açar; üç yanlış denemede kapı 30 saniye hiçbir girişi kabul etmez. Bunu yazarken ilk iş durumları çıkarmaktır:\n\n| Durum | Servo | Çıkış |\n|---|---|---|\n| KILITLI | 0° | Doğru giriş: ACIK. 3. yanlış: BLOKE |\n| ACIK | 90° | 5 sn dolunca KILITLI |\n| BLOKE | 0° | 30 sn dolunca KILITLI |\n\nTablo, kodu yazmadan önce her durumdan nereye gidilebildiğini gösterir; kod bu tablonun çevirisidir.\n\n### Tek değişken, çok iş\n`durum` adlı tek bir değişken kapının nerede olduğunu söyler. `loop()` her turda beş iş yapar: tuşları okur, seri satırı işler, süreleri denetler, LED'leri günceller, ekranı günceller. Hiçbirinde `delay` yoktur; bu yüzden kapı açıkken ya da bloke iken de program girişleri **dinler** (ve durumu bunlara izin vermiyorsa yok sayar).\n\n### Süre dolduğunu anlamak\nBitiş anı `millis() + süre` ile hesaplanır, kontrol `(long)(simdi - bitis) >= 0` ile yapılır. Bu çıkarma `millis()` 49 günde sıfırlanıp taşsa bile doğru sonucu verir.\n\n### Ortak deneme sayacı\nPIN ve kart aynı `yanlis` sayacını kullanır. İki yanlış PIN ile bir yetkisiz kart toplamda üç denemedir. Sayaçlar ayrı olsaydı saldırgan her yoldan ayrı ayrı üç deneme yapardı. Doğru giriş sayacı sıfırlar.\n\n### Servo ve besleme\nServo sinyal pininden (D10) komut alır; gücünü 5V ve GND'den çeker. Laboratuvarda VCC ve GND'yi bağlamak yeter. Gerçek devrede küçük bir servo bile kalkışta anlık yüksek akım çeker; ayrı bir 5 V kaynak kullanılır ve kaynağın GND'si Arduino'nun GND'siyle birleştirilir. Servo 90° için kütüphane yaklaşık 1472 µs'lik darbe üretir.\n\n### Özet\nÖnce kuralı ve durum tablosunu yaz, sonra koda geç. Tek `durum` değişkeni, `millis()` ile süre denetimi ve `delay` kullanmamak kilidin hep duyarlı kalmasını sağlar. PIN ve kart ortak hata sayacını paylaşır. Gerçek devrede servo ayrı beslenir ve GND'ler birleştirilir.",
          "concepts": [
            {
              "term": "Durum tablosu",
              "definition": "Her durumda çıkışları ve bir sonraki durumun koşulunu gösteren planlama tablosu.",
              "example": "BLOKE durumunda servo 0°, kırmızı LED yanıp söner, 30 sn dolunca KILITLI.",
              "pitfall": "Tabloyu çizmeden kodlamaya başlamak; durumlar arası geçişler eksik kalır."
            },
            {
              "term": "Bloklamayan zamanlama",
              "definition": "Bitiş anını millis() ile hesaplayıp her turda karşılaştırmak; program beklemeden çalışmaya devam eder.",
              "example": "acikBitis = millis() + 5000; her turda doldu mu diye bakılır.",
              "pitfall": "delay(5000) ile kapıyı açık tutmak: tuşlar ve seri komutlar kaçırılır."
            },
            {
              "term": "Taşmaya dayanıklı karşılaştırma",
              "definition": "(long)(simdi - bitis) >= 0 ifadesi, millis() sıfırlansa bile süre dolduğunu doğru bulur.",
              "example": "doldu(millis(), blokBitis) bloke bitti mi sorusunu cevaplar.",
              "pitfall": "simdi >= bitis yazmak: sayaç taşınca yanlış sonuç verir."
            },
            {
              "term": "Ortak hata sayacı",
              "definition": "PIN ve kart girişlerinin aynı yanlış deneme sayacını paylaşması.",
              "example": "İki yanlış PIN ve bir yetkisiz kart üçüncü hakkı bitirir.",
              "pitfall": "Sayacı yola göre ayrı tutmak: saldırgan her yoldan ayrı 3 deneme yapar."
            },
            {
              "term": "Ayrı servo beslemesi",
              "definition": "Gerçek devrede servoyu Arduino'dan ayrı bir 5 V kaynaktan beslemek; GND'ler ortak yapılır.",
              "example": "Harici 5 V kaynağın GND'si Uno'nun GND'sine bağlanır.",
              "pitfall": "Servoyu Uno'nun 5 V pininden beslemek: kart yeniden başlayabilir ya da ekran bozulabilir."
            }
          ],
          "quiz": [
            {
              "id": "m4h6d5-q1",
              "kind": "numeric",
              "prompt": "Bloke başlayalı 12,3 saniye (12300 ms) geçti. Ekran kalan süreyi (30000 - 12300 + 999) / 1000 işlemiyle, tam sayı bölmesiyle gösteriyor. Ekranda kaç saniye yazar?",
              "answer": 18,
              "unit": "sn",
              "explanation": "30000 - 12300 = 17700 ms; 999 ekleyince 18699 olur ve tam sayı bölmesi 18 verir. Ek 999 sayesinde 17,7 sn yukarı yuvarlanır; yoksa 17 yazardı ve geri sayım son saniyede 0 gösterirdi.",
              "skills": [
                "prog-millis",
                "state-machine"
              ]
            },
            {
              "id": "m4h6d5-q2",
              "kind": "predict-output",
              "prompt": "Üç hak vardır. Doğru giriş sayacı sıfırlar. Bu çağrılar sırayla ne yazar?\n\n```\nint yanlis = 0;\nvoid reddet() { yanlis++; Serial.println(yanlis); }\nvoid kabul()  { yanlis = 0; }\n\nreddet();\nkabul();\nreddet();\nreddet();\n```",
              "options": [
                "1, 1, 2",
                "1, 2, 3",
                "1, 2, 2",
                "1, 0, 1"
              ],
              "answer": 0,
              "explanation": "İlk reddet 1 yazar. kabul sayacı sıfırlar, sonraki reddet yine 1, onu izleyen 2 yazar. kabul çağrısı bir şey yazmaz, bu yüzden 0 görünmez; 1, 2, 3 ise sıfırlamayı unutmak olurdu.",
              "skills": [
                "access-security",
                "state-machine"
              ]
            },
            {
              "id": "m4h6d5-q3",
              "kind": "find-bug",
              "prompt": "Bloke kapıyı 30 sn kilitlemeli ama bu sürede kart ve tuşlar tepkisiz kalıyor, ekran da donuyor. Sorun nerede?\n\n```\nvoid bloke() {\n  durum = BLOKE;            // satır 1\n  delay(30000);             // satır 2\n  durum = KILITLI;          // satır 3\n}\n```",
              "options": [
                "Satır 1: durum değişkeni tanımsız",
                "Satır 2: delay programı 30 sn boyunca durdurur; bitiş anı hesaplanıp loop içinde denetlenmeli",
                "Satır 3: KILITLI yerine ACIK olmalı",
                "Satır 2: süre milisaniye değil saniye cinsinden yazılmalı"
              ],
              "answer": 1,
              "explanation": "delay çalışırken loop() hiç dönmez; tuş, seri komut, LED ve ekran güncellenmez. Doğrusu blokBitis = millis() + 30000 yazıp durumGuncelle içinde süreyi her turda denetlemektir. delay'in birimi zaten milisaniyedir.",
              "skills": [
                "prog-millis",
                "prog-debug"
              ]
            },
            {
              "id": "m4h6d5-q4",
              "kind": "mcq",
              "prompt": "Gerçek bir kapı projesinde servoyu neden Arduino'nun 5 V pininden değil ayrı bir 5 V kaynaktan beslersin?",
              "options": [
                "Servo 12 V ister",
                "Servo kalkışta anlık yüksek akım çeker; kart yeniden başlayabilir ya da ekran bozulabilir. GND'ler ortak yapılır",
                "Ayrı kaynak servoyu daha hızlı döndürür",
                "Arduino'nun 5V pini yalnız LED besleyebilir"
              ],
              "answer": 1,
              "explanation": "Küçük servo bile kalkışta kartın 5 V hattından fazla akım çeker ve gerilim düşer. Ayrı kaynağın GND'si Arduino'nunkiyle birleştirilmezse sinyalin referansı kaybolur. Servo 12 V istemez, 4-6 V ile çalışır.",
              "skills": [
                "circuit-wiring",
                "servo-control"
              ]
            },
            {
              "id": "m4h6d5-q5",
              "kind": "numeric",
              "prompt": "Servo kütüphanesi 0° için 544 µs, 180° için 2400 µs darbe üretir ve aradaki değerler doğrusaldır. write(90) ile kaç mikrosaniyelik darbe gönderilir?",
              "answer": 1472,
              "tolerance": 1,
              "unit": "µs",
              "explanation": "90°, aralığın tam ortasıdır: 544 + (2400 - 544) / 2 = 544 + 928 = 1472 µs. 1500 yuvarlak bir tahmindir ama kütüphanenin değeri 1472'dir.",
              "skills": [
                "servo-control"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Zaman ve veri",
      "project": "Veri kaydedici",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. RTC modülünü I2C ile bağlayıp `rtc.now()` ile tarih ve saati okuyabilir, `rtc.adjust()` ile kurabilir ve basit bir alarm yazabilir.\n2. SD kartın SPI ile nasıl bağlandığını, 8.3 dosya adı kuralını ve `close()`/`flush()` ile verinin karta nasıl yazıldığını açıklayabilir.\n3. Zaman damgalı bir CSV satırı üreten, donanımdan bağımsız bir fonksiyon yazabilir; ondalık virgül ile sütun ayracı çatışmasını açıklayabilir.\n4. UART, I2C ve SPI protokollerini hat sayısı, hız ve cihaz seçimi bakımından karşılaştırabilir; bit sayısından aktarım süresini hesaplayabilir.\n5. RTC, DHT22, LCD ve butonu birleştiren bir sıcaklık ve nem veri kaydedicisi kurabilir.\n\n### Haftanın planı\nHafta beş derstir; ders süreleri 25-35 dakikadır. Aşağıdaki plan günde bir ders içindir.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | RTC: saat, tarih, alarm | ~25 dk | Anlatımı oku, RTC'yi kur, saati okut, `adjust` ile gece yarısına ayarla, alarmı dene, mini testi çöz. |\n| 2 | SD kart (SPI): dosyaya yazma | ~25 dk | Laboratuvarda SD yok: devreyi tablodan oku, kodu yaz ve derle, \"Dene\" sorularını kağıt üzerinde cevapla. |\n| 3 | Veri kaydı: CSV ve zaman damgası | ~30 dk | Satır fonksiyonunu sabit değerlerle dene, RTC + DHT22 ile canlı satır üret. |\n| 4 | Haberleşme protokolleri: UART, I2C, SPI karşılaştırması | ~30 dk | Üç ölçüm programını çalıştır, tabloları kendi hesabınla karşılaştır. |\n| 5 | Proje: Sıcaklık ve nem veri kaydedici | ~35 dk | Planı tabloya yaz, devreyi kur, kaydediciyi çalıştır, ölçütle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta şunlar gerekir. Eksik olanın dersine dön:\n- `millis()` ile bloklamayan zamanlama (Modül 3, ders 27)\n- I2C, `Wire` ve adresler (ders 33); I2C LCD (ders 32)\n- Buton ve kenar algılama (ders 8)\n- DHT22 ile sıcaklık ve nem okumak (Modül 4, ders 46)\n- `String` ve SRAM sınırı (ders 34)\n- SPI'ya ilk giriş (ders 63)\n\n### Kavram haritası\n- **Zaman:** `millis()` → RTC → `DateTime` → `adjust` ve `lostPower` → alarm\n- **Depolama:** EEPROM (1 KB) → SD kart → SPI (SCK, MOSI, MISO, CS) → 8.3 ad → `close` ve `flush`\n- **Veri biçimi:** CSV → zaman damgası (ISO 8601) → satır fonksiyonu → `NaN` ve boş alan → ondalık ayırıcı\n- **Haberleşme:** UART (baud) → I2C (adres, SDA/SCL) → SPI (CS) → bit süresi ve aktarım süresi\n- **Proje:** RTC saniyesine bağlı kayıt → tekrar önleme bayrağı → butonla aç/kapat → hataya dayanıklı satır\n\n### Sık yapılan hatalar\n- **`adjust(__DATE__, __TIME__)` satırını koşulsuz bırakmak.** Her açılışta saat derleme anına döner; yalnız `lostPower()` doğruysa ayarla.\n- **MPU6050 ile RTC'yi aynı I2C hattına bağlamak.** İkisi de 0x68 kullanır.\n- **`close()` ya da `flush()` çağırmamak.** Gerçek cihazda son satırlar kaybolur.\n- **Dosya adını 8.3 kuralının dışında seçmek.** `sicaklik_kaydi.csv` gibi ad açılamaz.\n- **Ay ve günü iki haneli yazmamak.** Metin sıralaması zaman sırasını bozar.\n- **Ondalık virgül ve ayraç virgülü birlikte kullanmak.** `23,5` iki sütuna bölünür.\n- **Baud hızlarını farklı seçmek.** Karşı taraf anlamsız karakterler görür.\n- **Aynı saniyede satırı birden çok kez yazmak.** `u != sonKayit` bayrağı gerekir.\n- **`delay(10000)` ile kayıt aralığını beklemek.** Buton ve ekran donar.\n- **D11, D12, D13 pinlerine LED bağlayıp SD kartı da kullanmak.** Bu pinler SPI hatlarıdır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Kendi cümlelerinle cevapla: \"Veri kaydedicide neden `millis()` yerine RTC kullanıyoruz?\"\n4. 5 saniyelik aralıkla bir günde kaç satır yazılır? 60 saniyelik aralıkla bir haftada kaç? Hesapla ve dosya boyutunu tahmin et.\n5. Aynı anda RTC, LCD ve SD kullanan bir devrede hangi pinlerin hangi protokole ait olduğunu bir tabloya çiz.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Sıcaklık ve nem veri kaydedici)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | RTC ya da LCD tepki vermiyor, SDA/SCL karışık | DHT22, RTC, LCD ve buton doğru pinlerde, RTC (0x68) ve LCD (0x27) çakışmıyor | Bağlantılar düzenli, adresler ve pin tablosu açıklanmış |\n| Kayıt biçimi | Satırlar bozuk ya da sütun sayısı tutmuyor | Başlık + zaman damgalı, iki haneli, 3 sütunlu CSV satırları | NaN durumunda boş alan yazılıyor ve denenmiş |\n| Zamanlama | `delay` kullanıyor ya da aynı saniyede çok satır yazıyor | Satırlar 10 saniyelik tam adımlarla, tekrarsız çıkıyor | Aralığı değiştirip etkisini açıklıyor |\n| Kontrol | Buton kaydı güvenilir biçimde durduramıyor | Buton kaydı aç/kapat yapıyor, ekranda durum görünüyor | Sıçrama ve kenar algılamayı açıklıyor, ek uyarı (örneğin buzzer) ekliyor |\n| Anlatım | Ne yaptığını anlatamıyor | Veri akışını (sensör → satır → kayıt) adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve SD sürümünün farkını anlatıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta öğrenci, ölçümün \"bir an\"dan çıkıp zamana bağlı bir veri kümesine dönüşmesini görür. Önemli olan mükemmel bir kayıt cihazı değil, verinin neden zaman damgasına ve düzenli bir biçime ihtiyaç duyduğunu anlamasıdır.\n- **SD kart.** Sanal laboratuvarda SD kart modülü yoktur; ikinci ders ve projenin SD sürümü okuma ve derleme çalışmasıdır. Gerçek bir kartla yapılacaksa FAT32 biçimli kart ve 3,3 V uyumlu bir modül gerekir.\n- **Nasıl destek olunur?** Takılınca cevabı söylemek yerine sor: \"Bu satırın kaç sütunu var?\", \"Saat hangi anda kuruldu?\", \"Aynı saniyede kaç kez yazıyor?\"\n- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır. Protokol dersi (4. gün) sayı hesabı içerir; gerekirse hesap makinesi kullanılabilir.\n- **Güvenlik.** Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Gerçek devrede kartı çıkarmadan önce dosyanın kapalı olması gerekir.\n- **İlerleme.** Mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "RTC: saat, tarih, alarm",
          "durationMin": 25,
          "problem": "`millis()` kart açılınca sıfırdan saymaya başlar, fişi çekince her şeyi unutur. \"Dün gece saat kaçta sıcaklık yükseldi?\" sorusuna bununla cevap veremezsin. Duvar saati gibi fişsiz de akan, tarihi ve saati bilen bir saat gerekir. Bu işi **RTC** (Real Time Clock, gerçek zaman saati) modülü yapar. Bu derste onu laboratuvarda Arduino'ya bağlayıp saati okuyacak, ayarlayacak ve kendi alarmını yazacaksın.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| RTC | SDA → Uno **A4**, SCL → Uno **A5**, VCC → **5V**, GND → **GND** |\n| Direnç (özellik panelinden 330 Ω) + LED | Uno **D13** → direnç **1**; direnç **2** → LED **A**; LED **K** → **GND** (yalnız alarm programı) |\n| Buzzer (Tür: Pasif) | **+** → Uno **D8**; **-** → **GND** (yalnız alarm programı) |\n\nRTC modülü I2C ile konuşur (33. ders) ve adresi **0x68**'dir. Laboratuvarda RTC'yi 5V'a bağlıyoruz; gerçek modüllerin besleme aralığı model modele değişir, kullanılan modülün veri sayfasına bakılır.\n\n**Bilgi notu:** Gerçek modülde bir **yedek pil yuvası** vardır. Ana güç kesilince saati bu pil çalıştırmaya devam eder; pil yoksa ya da bittiyse güç kesilince saat unutulur ve yeniden ayarlanması gerekir. Laboratuvar pili ve güç kesintisini modellemez: her ▶'e bastığında (ya da ↺ Sıfırla'dan sonra) RTC **2026-01-01 00:00:00**'dan başlar ve `rtc.lostPower()` her zaman `false` döner. Saati istediğin değere `rtc.adjust()` ile kurarsın (aşağıda).\n\nDikkat: MPU6050 ivme sensörü de varsayılan olarak 0x68 adresini kullanır. Aynı I2C hattına ikisini birden bağlarsan çakışırlar. (MPU6050'nin AD0 ucu 5V'a bağlanırsa adresi 0x69 olur ve çakışma biter; laboratuvarda parçanın \"I2C adresi\" özelliği bunu seçtirir.) Bu kursta MPU6050 ile RTC'yi aynı devrede kullanmayacağız.\n\n### Program: saati oku\nKütüphane olarak **RTClib** kullanıyoruz. DS3231 için sınıfın adı `RTC_DS3231`.\n\n```cpp\n// sketch: rtc_saat\n#include <Wire.h>\n#include <RTClib.h>\n\nRTC_DS3231 rtc;\nunsigned long sonOkuma = 0;\n\nvoid iki(int n) {                     // 5 -> \"05\"\n  if (n < 10) Serial.print('0');\n  Serial.print(n);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  if (!rtc.begin()) {                 // modül I2C hattında yoksa false\n    Serial.println(\"RTC bulunamadi\");\n    while (true) {}\n  }\n  if (rtc.lostPower()) {              // saat durmuşsa (pil bitti, hiç kurulmadı)\n    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));\n  }\n}\n\nvoid loop() {\n  if (millis() - sonOkuma >= 1000) {\n    sonOkuma = millis();\n    DateTime t = rtc.now();\n    Serial.print(t.year()); Serial.print('-'); iki(t.month()); Serial.print('-'); iki(t.day());\n    Serial.print(' ');\n    iki(t.hour()); Serial.print(':'); iki(t.minute()); Serial.print(':'); iki(t.second());\n    Serial.println();\n  }\n}\n```\n\n`rtc.now()` o anki zamanı bir `DateTime` nesnesi olarak verir. `year()`, `month()`, `day()`, `hour()`, `minute()`, `second()` ile parçalarını alırsın. Tek haneli sayıların başına 0 koyan `iki()` fonksiyonu \"8:5:3\" yerine \"08:05:03\" yazdırır.\n\n`rtc.lostPower()` çipin tuttuğu bir bayrağı okur: osilatör durmuşsa bayrak kalkar. O zaman saati `DateTime(F(__DATE__), F(__TIME__))` ile ayarlıyoruz. `__DATE__` ve `__TIME__` programı **derlediğin** anın tarihi ve saatidir. Gerçek kartta yükleme birkaç saniye sürdüğü için kurulan saat o kadar geride olur. Laboratuvarda `lostPower()` hep `false` olduğundan bu satır çalışmaz; saat 2026-01-01 00:00:00'dan başlar ve çıktın `2026-01-01 00:00:01`, `2026-01-01 00:00:02` ... diye akar.\n\n### Program: saati kendin ayarla\nSaati istediğin değere `rtc.adjust()` ile kurarsın. Aşağıdaki program önce saati okur, sonra gece yarısından 5 saniye öncesine ayarlar, sonra tekrar okur. Gün değişimini ve haftanın gününü de görürsün.\n\n```cpp\n// sketch: rtc_ayarla\n#include <Wire.h>\n#include <RTClib.h>\n\nRTC_DS3231 rtc;\nconst char* GUNLER[] = {\"Pazar\", \"Pazartesi\", \"Sali\", \"Carsamba\", \"Persembe\", \"Cuma\", \"Cumartesi\"};\nunsigned long sonOkuma = 0;\n\nvoid iki(int n) {\n  if (n < 10) Serial.print('0');\n  Serial.print(n);\n}\n\nvoid yaz(DateTime t) {\n  Serial.print(t.year()); Serial.print('-'); iki(t.month()); Serial.print('-'); iki(t.day());\n  Serial.print(' ');\n  iki(t.hour()); Serial.print(':'); iki(t.minute()); Serial.print(':'); iki(t.second());\n  Serial.print(' ');\n  Serial.println(GUNLER[t.dayOfTheWeek()]);   // 0 = Pazar\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n\n  Serial.print(\"Once:  \");\n  yaz(rtc.now());\n\n  rtc.adjust(DateTime(2026, 3, 14, 23, 59, 55));   // yıl, ay, gün, saat, dakika, saniye\n\n  Serial.print(\"Sonra: \");\n  yaz(rtc.now());\n}\n\nvoid loop() {\n  if (millis() - sonOkuma >= 1000) {\n    sonOkuma = millis();\n    yaz(rtc.now());\n  }\n}\n```\n\nÇıktının başı şuna benzer: `Once:` satırında RTC'nin eski değeri (laboratuvarda `2026-01-01 00:00:00 Persembe`), `Sonra:` satırında `2026-03-14 23:59:55 Cumartesi` görürsün. Birkaç saniye sonra saat 23:59:59'dan `2026-03-15 00:00:00`'a geçer ve gün adı Pazar olur. RTC takvimi de bilir: ay sonlarında günü kendisi değiştirir. Yaz saati uygulamasını ya da saat dilimini bilmez; yalnızca senin verdiğin sayıları sayar.\n\n### Program: kendi alarmımız\nBazı RTC çiplerinde donanım alarmı vardır, ama DS1307'de yoktur. Biz her iki çipte de çalışacak yolu seçiyoruz: saati düzenli aralıkla oku, alarm saatiyle karşılaştır. Okumayı `millis()` ile çeyrek saniyede bir yapıyoruz (27. ders); `delay` yok, böylece `loop()` başka işlere de bakabilir.\n\n```cpp\n// sketch: rtc_alarm\n#include <Wire.h>\n#include <RTClib.h>\n\nconst int LED = 13;\nconst int BUZZER = 8;\nconst int ALARM_SAAT = 7;\nconst int ALARM_DAKIKA = 30;\nconst unsigned long KONTROL_ARALIGI = 250;   // ms: RTC'ye çeyrek saniyede bir bak\nconst unsigned long ALARM_SURESI = 5000;     // ms: alarm 5 saniye çalsın\n\nRTC_DS3231 rtc;\nunsigned long sonKontrol = 0;\nunsigned long alarmBasla = 0;\nbool alarmCaliyor = false;\nint sonTetikGunu = -1;                       // alarmın son çaldığı ayın günü\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  pinMode(BUZZER, OUTPUT);\n  Serial.begin(9600);\n  rtc.begin();\n  rtc.adjust(DateTime(2026, 3, 14, 7, 29, 55));   // gösteri için: alarmdan 5 sn önce\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  if (simdi - sonKontrol >= KONTROL_ARALIGI) {\n    sonKontrol = simdi;\n    DateTime t = rtc.now();\n    bool saatGeldi = (t.hour() == ALARM_SAAT && t.minute() == ALARM_DAKIKA);\n    if (saatGeldi && !alarmCaliyor && t.day() != sonTetikGunu) {\n      sonTetikGunu = t.day();\n      alarmCaliyor = true;\n      alarmBasla = simdi;\n      digitalWrite(LED, HIGH);\n      tone(BUZZER, 1000);\n      Serial.println(\"ALARM 07:30\");\n    }\n  }\n\n  if (alarmCaliyor && simdi - alarmBasla >= ALARM_SURESI) {\n    alarmCaliyor = false;\n    digitalWrite(LED, LOW);\n    noTone(BUZZER);\n  }\n}\n```\n\nProgram başlarken saati 07:29:55'e kuruyor, böylece alarm 5 saniye sonra çalışır: LED yanar, buzzer pininde (D8) 1000 Hz'lik ton başlar ve seri monitörde `ALARM 07:30` yazar. Gerçek bir alarmda `setup()` içindeki `rtc.adjust` satırını silersin.\n\n### DS1307 ile fark\nPiyasada iki yaygın RTC çipi var. İkisi de I2C'de **0x68** adresini kullanır ve RTClib ile aynı biçimde okunur. Laboratuvardaki RTC parçası tek türdür; DS1307 kodunu da bu parçayla çalıştırabilirsin.\n\n| | DS3231 | DS1307 |\n|---|---|---|\n| RTClib sınıfı | `RTC_DS3231` | `RTC_DS1307` |\n| Saat kristali | Çipin içinde, sıcaklığa göre kendini düzelten (sıcaklık kompanzasyonlu) | Dışarıdan takılan kristal; sıcaklıktan etkilenir |\n| Doğruluk | Genelde DS1307'den belirgin biçimde daha iyi; kesin değer için veri sayfasına bak | Daha çok sapar |\n| Alarm | Donanım alarmı var | Yok |\n| \"Saat durdu mu?\" | `lostPower()` | `isrunning()` |\n\nDS1307'ye geçmek için kodda yalnızca sınıf adını ve bu kontrolü değiştirirsin:\n\n```cpp\n// sketch: rtc_ds1307\n#include <Wire.h>\n#include <RTClib.h>\n\nRTC_DS1307 rtc;                              // tek fark: sınıf adı\nunsigned long sonOkuma = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n  if (!rtc.isrunning()) {                    // DS1307'de \"saat çalışıyor mu?\" kontrolü\n    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));\n  }\n}\n\nvoid loop() {\n  if (millis() - sonOkuma >= 1000) {\n    sonOkuma = millis();\n    Serial.println(rtc.now().timestamp());   // ISO 8601: 2026-03-14T08:30:01\n  }\n}\n```\n\n`timestamp()` zamanı tek bir yazı olarak verir: yıl-ay-günTsaat:dakika:saniye. Bu biçimin neden iyi olduğunu 68. derste göreceksin.\n\n### Nasıl çalışıyor?\n1. RTC çipi kendi kristaliyle saniyeleri sayar ve tarihi tutar. Arduino sadece I2C ile ona sorar.\n2. `rtc.now()` çipin yazmaçlarını okur ve sana `DateTime` verir. Her çağrıda I2C trafiği olur, bu yüzden `loop()` içinde saniyede birkaç kez bakmak yeter.\n3. `rtc.adjust()` çipin saatini değiştirir. Çip pil sayesinde bu değeri güç kesilse de korur.\n4. Alarm, RTC'den okunan saat ile hedef saatin karşılaştırmasıdır. `sonTetikGunu` alarmın aynı dakika boyunca tekrar tekrar çalmasını engeller ve ertesi gün yine çalmasına izin verir.\n\n### Dene\n- `rtc_ayarla` programında tarihi `DateTime(2027, 2, 28, 23, 59, 55)` yap. Gece yarısından sonra hangi tarih ve gün adı çıkıyor? Neden? (2027 artık yıl değildir.)\n- `rtc_alarm` programında alarm süresini 2 saniyeye düşür, sonra alarmı yalnız hafta içi (Pazartesi-Cuma) çalacak biçimde değiştir. İpucu: `t.dayOfTheWeek()` 1 ile 5 arasında olmalı.\n- `rtc_saat` programını çalıştır, 10 saniye bekle, ■ ile durdurup yeniden ▶'e bas. Saat nereden başlıyor? Gerçek modülde yedek pil takılıyken sonuç ne olurdu, pil yokken ne olurdu?\n\n### Sık yapılan hatalar\n- `rtc.adjust(DateTime(F(__DATE__), F(__TIME__)))` satırını koşulsuz `setup()` içine koymak: kart her açıldığında saat derleme anına geri döner. Yalnızca `lostPower()` doğruysa ayarla.\n- MPU6050 ile RTC'yi aynı hatta bağlamak: ikisi de 0x68 kullanır.\n- Saati `millis()` ile tutmaya çalışıp RTC'yi gereksiz saymak: `millis()` güç kesilince sıfırlanır, RTC kalır.\n- Alarmı `t.second() == 0` kontrolüyle yazıp RTC'yi seyrek okumak: o saniyeyi kaçırırsın. Okuma aralığını 1 saniyeden kısa tut ve \"bugün çaldı mı?\" bayrağı kullan.\n- SDA ile SCL'yi ters bağlamak ya da VCC/GND'yi eksik bırakmak: program \"RTC bulunamadi\" yazar.",
          "question": "Okul zili ya da ilaç hatırlatıcı yapsan alarmı Arduino'nun `millis()` saatine mi, RTC'ye mi bağlarsın? Elektrik kesilip geldiğinde ikisi ne yapar?",
          "explainerMd": "### Bu derste öğreneceklerin\n- `millis()` ile RTC arasındaki farkı: biri güç kesilince sıfırlanır, öteki gerçek zamanı tutar\n- RTC modülünü I2C ile bağlamayı (SDA A4, SCL A5, adres 0x68)\n- `rtc.now()` ile tarih ve saati okumayı, `rtc.adjust()` ile kurmayı\n- `millis()` ile bloklamayan bir alarm yazmayı\n\n### Önceden bilmen gerekenler\n- Ders 27: `millis()` ile bloklamayan zamanlama\n- Ders 33: I2C, `Wire` ve cihaz adresleri\n- Ders 9: Serial Monitor'e yazdırma\n\n### Neden ayrı bir saat?\n`millis()` kart açılınca sıfırdan saymaya başlar ve kart kapanınca her şeyi unutur. \"Dün gece saat kaçtı?\" sorusunu bununla cevaplayamazsın. **RTC** (Real Time Clock, gerçek zaman saati) kendi kristaliyle saniyeleri sayan ve takvimi bilen ayrı bir çiptir. Arduino ona yalnızca sorar.\n\n### I2C ile bağlantı\nRTC modülü iki veri hattı kullanır: SDA ve SCL. Uno'da bunlar A4 ve A5'tir. Modülün adresi **0x68**'dir. Aynı hatta başka cihazlar da olabilir; ama adresleri farklı olmalıdır. MPU6050 de varsayılan olarak 0x68 kullandığı için ikisini aynı hatta bağlamayız.\n\n### Saati okumak ve kurmak\nKütüphane (RTClib) saati bir **DateTime** nesnesi olarak verir:\n\n```\nDateTime t = rtc.now();\nSerial.println(t.hour());      // 0-23\nSerial.println(t.minute());    // 0-59\n```\n\n`year()`, `month()`, `day()`, `second()` ve haftanın gününü veren `dayOfTheWeek()` (0 = Pazar) de vardır. Bu fonksiyonlar sayı döndürür ve başa sıfır koymaz: 5 Mart için `month()` 3 verir, \"03\" vermez. Başa sıfırı kendin eklersin.\n\nSaati kurmak için `rtc.adjust(DateTime(2026, 3, 14, 23, 59, 55))` yazarsın (yıl, ay, gün, saat, dakika, saniye). RTC takvimi kendisi bilir: ay ve yıl geçişlerini düzgün yapar. Yaz saatini ya da saat dilimini bilmez; yalnızca senin verdiğin sayıları sayar.\n\n`rtc.lostPower()` saatin durup durmadığını söyler. Saati her açılışta kurarsan cihaz her yeniden başladığında saat o ana geri döner. Bu yüzden `adjust` yalnızca `lostPower()` doğruysa çağrılır. Gerçek modülde ana güç kesilince saati bir yedek pil çalıştırmaya devam eder. Laboratuvar pili ve güç kesintisini modellemez; her ▶'te saat 2026-01-01 00:00:00'dan başlar.\n\n### Alarm = karşılaştırma\nAlarm, RTC'den okunan saat ile hedef saatin karşılaştırılmasıdır. Okumayı `millis()` ile çeyrek saniyede bir yaparsın, böylece `loop()` başka işlere de bakabilir. Aynı dakika boyunca alarmın tekrar tekrar başlamaması için \"bugün çaldı mı?\" bilgisini bir değişkende tutarsın.\n\n### Özet\nRTC, fiş çekilse bile gerçek zamanı tutan I2C cihazıdır. `rtc.now()` okur, `rtc.adjust()` kurar; `adjust` her açılışta değil, yalnızca saat kaybolduğunda çağrılır. Alarm, saatin hedefle karşılaştırılmasından ibarettir. Aynı I2C hattında iki cihazın adresi aynı olamaz.",
          "concepts": [
            {
              "term": "RTC (gerçek zaman saati)",
              "definition": "Kendi kristaliyle saniyeleri sayan ve tarihi tutan ayrı bir çip; Arduino ona I2C ile sorar.",
              "example": "Veri kaydedicin her ölçümün yanına \"2026-03-14 08:30:10\" gibi gerçek bir zaman yazar.",
              "pitfall": "Saati millis() ile tutmaya çalışmak; millis() güç kesilince sıfırlanır, RTC kalır."
            },
            {
              "term": "DateTime ve rtc.now()",
              "definition": "rtc.now() o anki zamanı bir DateTime nesnesi olarak verir; year(), month(), day(), hour(), minute(), second() ile parçalarını alırsın.",
              "example": "t.hour() 7 döndürür; ekrana 07 yazmak için başına sıfırı kendin eklersin.",
              "pitfall": "month() değerinin iki haneli geleceğini sanmak; 3. ay için 3 döner, \"03\" gelmez."
            },
            {
              "term": "rtc.adjust() ve lostPower()",
              "definition": "adjust() saati kurar; lostPower() saatin durup durmadığını söyler.",
              "example": "if (rtc.lostPower()) { rtc.adjust(DateTime(F(__DATE__), F(__TIME__))); } saati yalnız gerekince kurar.",
              "pitfall": "adjust(__DATE__, __TIME__) satırını koşulsuz setup()'a koymak; kart her açıldığında saat derleme anına geri döner."
            },
            {
              "term": "I2C adresi 0x68",
              "definition": "RTC modülünün I2C hattındaki adı; hatta aynı adrese sahip iki cihaz olamaz.",
              "example": "RTC (0x68) ile I2C LCD (0x27) aynı SDA ve SCL kablolarını paylaşabilir.",
              "pitfall": "MPU6050 ile RTC'yi aynı hatta bağlamak; ikisi de 0x68 kullanır ve çakışırlar."
            },
            {
              "term": "Yedek pil",
              "definition": "Gerçek RTC modülünde ana güç kesilince saati çalıştırmaya devam eden küçük pil.",
              "example": "Pil takılıyken fişi çekip bir saat sonra taksan saat doğru ilerlemiş olur.",
              "pitfall": "Pil bitmişken saatin doğru kalacağını sanmak; güç kesilince saat unutulur ve yeniden kurulması gerekir."
            },
            {
              "term": "Bayrakla tekrarı önlemek",
              "definition": "Alarm koşulu bir dakika boyunca doğru kalır; \"bugün çaldı mı?\" değişkeni alarmı bir kez çaldırır.",
              "example": "sonTetikGunu değişkeni alarmın son çaldığı ayın gününü tutar.",
              "pitfall": "Bayrak olmadan 07:30 boyunca alarmı sürekli yeniden başlatmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h7d66-q1",
              "kind": "mcq",
              "prompt": "Bir cihazın günler sonra bile \"dün saat kaçtı\" sorusuna cevap verebilmesi için neden millis() yerine RTC kullanılır?",
              "options": [
                "millis() kart açılınca sıfırdan başlar ve güç kesilince unutulur; RTC ise gerçek tarihi ve saati tutar",
                "millis() çok yavaş sayar",
                "RTC her zaman daha hassas ölçer",
                "millis() yalnızca saniye sayar"
              ],
              "answer": 0,
              "explanation": "millis() kart açıldığından beri geçen süreyi sayar ve her yeniden başlatmada sıfırlanır. RTC ayrı bir çiptir; gerçek tarihi ve saati tutar. Hassasiyet asıl fark değildir: millis() milisaniye sayar, hız sorunu yoktur.",
              "skills": [
                "rtc-time"
              ]
            },
            {
              "id": "m4h7d66-q2",
              "kind": "predict-output",
              "prompt": "RTC takılı. Bu kod çalışınca seri monitörde ne görünür?\n\n```\nrtc.adjust(DateTime(2026, 12, 31, 23, 59, 58));\ndelay(3000);\nDateTime t = rtc.now();\nSerial.print(t.year());  Serial.print('-');\nSerial.print(t.month()); Serial.print('-');\nSerial.println(t.day());\n```",
              "options": [
                "2026-12-31",
                "2027-01-01",
                "2027-1-1",
                "2026-12-34"
              ],
              "answer": 2,
              "explanation": "23:59:58'den 3 saniye sonra saat 00:00:01 olur ve yıl 2027'ye, tarih 1 Ocak'a geçer. RTC takvimi kendisi bilir, bu yüzden 2026-12-34 gibi bir değer çıkmaz. month() ve day() sayı döndürür, başa sıfır koymaz; çıktı 2027-1-1 olur. 2027-01-01 yazmak için iki hane biçimlemesi gerekir.",
              "skills": [
                "rtc-time",
                "prog-debug"
              ]
            },
            {
              "id": "m4h7d66-q3",
              "kind": "find-bug",
              "prompt": "Bu program her yeniden başladığında saat, programın derlendiği ana geri dönüyor. Hatalı satır hangisi?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));\n}\n```",
              "options": [
                "Serial.begin(9600); satırı",
                "rtc.begin(); satırı",
                "rtc.adjust(...) satırı, çünkü koşulsuz çalışıyor; yalnızca rtc.lostPower() doğruysa çağrılmalı",
                "void setup() satırı"
              ],
              "answer": 2,
              "explanation": "adjust satırı koşulsuz olduğu için kart her açıldığında saati derleme anına çeker; RTC'nin güç kesilince saati koruma işi boşa gider. Çözüm: if (rtc.lostPower()) { ... }. Serial.begin ve rtc.begin saatin değerini değiştirmez.",
              "skills": [
                "rtc-time",
                "prog-debug"
              ]
            },
            {
              "id": "m4h7d66-q4",
              "kind": "numeric",
              "prompt": "Alarm programı saati 07:29:55'e kurar. Alarm 07:30'da çalar ve ALARM_SURESI 5000 ms sürer. LED, program başladıktan yaklaşık kaç saniye sonra söner?",
              "answer": 10,
              "tolerance": 1,
              "unit": "saniye",
              "explanation": "Alarm saatine 5 saniye vardır (07:29:55'ten 07:30:00'a). Çaldıktan sonra 5000 ms yani 5 saniye yanık kalır. Toplam yaklaşık 5 + 5 = 10 saniye. Alarmın gerçek başlangıcı çeyrek saniyelik kontrol aralığı kadar gecikebilir; bu yüzden küçük bir pay vardır.",
              "skills": [
                "rtc-time",
                "prog-timing"
              ]
            },
            {
              "id": "m4h7d66-q5",
              "kind": "mcq",
              "prompt": "Aynı devrede RTC (DS3231) ve MPU6050 var; ikisi de varsayılan adreslerinde. Ne olur?",
              "options": [
                "Sorun olmaz; I2C her cihazı otomatik ayırır",
                "Yalnızca RTC çalışır, MPU6050 bozulur",
                "Hız 400 kHz'e düşer",
                "İkisi de 0x68 kullandığı için çakışırlar"
              ],
              "answer": 3,
              "explanation": "I2C'de cihazlar adresle seçilir. İkisi de 0x68 kullanırsa hangisinin cevap vereceği belli olmaz. Çözüm: bu kursta olduğu gibi ikisini aynı devrede kullanmamak ya da MPU6050'nin adresini (AD0 ucuyla 0x69) değiştirmek.",
              "skills": [
                "rtc-time",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "SD kart (SPI): dosyaya yazma",
          "durationMin": 25,
          "problem": "Bir bahçeye sıcaklık ölçer koyduğunu ve üç gün orada kalacağını düşün. Bilgisayar yok, Serial Monitor yok. Ölçümleri nereye yazacaksın? EEPROM yalnızca 1 KB'dir (34. ders), birkaç yüz ölçümde dolar. Bir SD kart ise gigabaytlarca yer verir ve içindeki dosyayı bilgisayarda doğrudan açarsın. Bu derste Arduino'nun SD karta nasıl dosya yazdığını öğreneceksin.",
          "contentMd": "### Devre\n**Laboratuvar notu:** Laboratuvarda SD kart modülü parçası yok. Bu derste SD kodunu yazar ve derlersin; karta gerçekten dosya yazıldığını göremezsin. Laboratuvarda `SD.begin` kart bulamayınca takılıp kalır (gerçek kartta `false` döner). Bu yüzden programı denerken `SD.begin`'den önce seri monitöre bir ilerleme mesajı yazdırırsın: mesajı görüyorsan program başlamış, ama `SD.begin`'de bekliyor demektir.\n\nBu yüzden bu derste kurulacak bir devre yok; **Parça ekle** menüsünde SD kart göremezsin. Aşağıdaki tablo, kodun gerçek bir modülle nasıl bağlanacağını gösteren bilgidir (pin adları Uno'nunkilerdir):\n\n| SD kart modülü ucu | Uno pini |\n|---|---|\n| CS | **D10** |\n| MOSI | **D11** |\n| MISO | **D12** |\n| SCK | **D13** |\n| VCC | **5V** (modülün belgesine bak) |\n| GND | **GND** |\n\n**Önemli:** SD kart SPI ile konuşur. Uno'da SPI pinleri sabittir: D11, D12, D13 ve (bu derste) CS için D10. Bu pinleri Modül 4'ün standart LED'leri (D13/D12/D11) ve HC-SR04'ün ECHO'su (D10) da kullanıyor. SD kartlı bir devrede bu parçaları aynı pinlere bağlama.\n\n**Bilgi notu:** SD kartlar 3,3 V mantığıyla çalışır. Piyasadaki hazır modüllerin çoğunda gerilim düzenleyici ve seviye dönüştürücü bulunur, ama modülün 5 V'a uygun olduğu belgesinden doğrulanmalıdır; çıplak bir kart yuvası Arduino'nun 5 V'una doğrudan bağlanmaz.\n\n### SPI kısaca\nSPI'da (63. derste RC522 ile kullandın) dört hat vardır:\n- **SCK:** saat. Arduino her bitte bir darbe üretir.\n- **MOSI:** Arduino'dan karta giden veri.\n- **MISO:** karttan Arduino'ya gelen veri.\n- **CS:** \"Seç\" hattı. Hatta birden çok cihaz olabilir; CS'i LOW olan cihaz dinler.\n\nBunların hızını ve diğer protokollerle farkını 69. derste ölçeceksin.\n\n### Kart biçimi: FAT ve 8.3 dosya adı\nArduino'nun `SD.h` kütüphanesi FAT16 ya da FAT32 biçimli kart ister. Büyük kartlar bilgisayarda farklı bir biçimle formatlanmış olabilir; gerçek kart kullanırken FAT32 olmasına dikkat edilir. Kütüphanenin dokümantasyonuna göre dosya adları **8.3** biçiminde olmalıdır: en çok 8 karakter, nokta, en çok 3 karakter uzantı. `VERI.CSV`, `LOG0001.TXT` geçerlidir; `sicaklik_kaydi.csv` ise uzundur, kullanma. Türkçe karakter ve boşluk da kullanma.\n\n### Program: dosyaya yaz\nKodu laboratuvardaki düzenleyiciye yapıştırıp ▶'e basabilirsin. Kart olmadığı için `SD.begin`'de bekler; yalnız ilk mesajı görürsün.\n\n```cpp\n// sketch: sd_yaz\n#include <SPI.h>\n#include <SD.h>\n\nconst int SD_CS = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.print(\"SD kart baslatiliyor... \");\n  if (!SD.begin(SD_CS)) {\n    Serial.println(\"HATA: kart yok ya da baglanti yanlis\");\n    while (true) {}\n  }\n  Serial.println(\"tamam\");\n\n  File dosya = SD.open(\"TEST.TXT\", FILE_WRITE);   // yoksa oluşturur, varsa sonuna ekler\n  if (dosya) {\n    dosya.println(\"Merhaba SD kart\");\n    dosya.println(millis());\n    dosya.close();                                // işin bitince mutlaka kapat\n    Serial.println(\"Yazildi\");\n  } else {\n    Serial.println(\"HATA: dosya acilamadi\");\n  }\n}\n\nvoid loop() {\n}\n```\n\n`SD.begin(10)` kartı başlatır ve başarısızsa `false` döner. Kart takılı değilse, kablo yanlışsa ya da CS pini farklıysa böyle olur. `SD.open(\"TEST.TXT\", FILE_WRITE)` dosyayı yazmak için açar. Dosya yoksa oluşturulur; varsa yazma **sonuna eklenir**, eski içerik silinmez. Bir `File` nesnesi döner, `println` ile `Serial.println`'deki gibi yazarsın.\n\n### Program: dosyayı geri oku\n```cpp\n// sketch: sd_oku\n#include <SPI.h>\n#include <SD.h>\n\nconst int SD_CS = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  if (!SD.begin(SD_CS)) {\n    Serial.println(\"HATA: SD kart baslatilamadi\");\n    while (true) {}\n  }\n\n  File dosya = SD.open(\"TEST.TXT\");               // yalnız okumak için aç\n  if (!dosya) {\n    Serial.println(\"TEST.TXT bulunamadi\");\n    return;\n  }\n  while (dosya.available()) {                     // okunacak bayt kaldıkça\n    Serial.write(dosya.read());\n  }\n  dosya.close();\n}\n\nvoid loop() {\n}\n```\n\n### Kapatmak ve flush: veri nereye gidiyor?\n`dosya.println(...)` dediğinde veri hemen karta gitmeyebilir. Kütüphane yazdıklarını önce Arduino'nun RAM'indeki küçük bir tamponda biriktirir. Arduino'nun belgesine göre veri karta **`close()` ya da `flush()`** ile fiziksel olarak yazılır. Bu yüzden:\n\n- İşin bitince `dosya.close()` çağır.\n- Dosyayı uzun süre açık tutacaksan her yazıdan sonra `dosya.flush()` çağır.\n- **Gerçek bir cihazda kartı çıkarmadan ya da gücü kesmeden önce dosyanın kapalı (ya da en son flush edilmiş) olması gerekir.** Dosya kapatılmadan kart çıkarılırsa son satırlar kaybolabilir ya da dosya bozulabilir. Laboratuvar kart çıkarmayı ve güç kesilmesini modellemez.\n\nAşağıdaki program dosyayı bir kez açar, her saniye bir satır yazar ve her yazıdan sonra `flush()` çağırır.\n\n```cpp\n// sketch: sd_flush\n#include <SPI.h>\n#include <SD.h>\n\nconst int SD_CS = 10;\nconst unsigned long ARALIK = 1000;                // ms\n\nFile dosya;\nunsigned long sonYazma = 0;\nint sayac = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  if (!SD.begin(SD_CS)) {\n    Serial.println(\"HATA: SD kart baslatilamadi\");\n    while (true) {}\n  }\n  dosya = SD.open(\"SAYAC.TXT\", FILE_WRITE);\n  if (!dosya) {\n    Serial.println(\"HATA: dosya acilamadi\");\n    while (true) {}\n  }\n}\n\nvoid loop() {\n  if (millis() - sonYazma >= ARALIK) {\n    sonYazma = millis();\n    sayac++;\n    dosya.print(\"satir \");\n    dosya.println(sayac);\n    dosya.flush();                                // veriyi karta gönder, dosya açık kalsın\n    Serial.println(sayac);\n  }\n}\n```\n\nİki yöntemin farkı: **aç-yaz-kapat** her seferinde dosyayı yeniden açar, bu yüzden her yazıdan sonra dosya kapalıdır ve güç kesilirse en güvenli durumdadır. **Açık tut ve flush et** dosyayı bir kez açar. Her ikisi de çalışır; 68. derste ilkini kullanacaksın, çünkü güvenli ve sade.\n\n### Nasıl çalışıyor?\n1. `SD.begin(10)` SPI'yı başlatır ve kartla konuşur. Başarılıysa `true` döner.\n2. `SD.open(ad, FILE_WRITE)` bir `File` nesnesi verir. `if (dosya)` kontrolü açılıp açılmadığını söyler.\n3. `print` ve `println` yazıyı dosyaya ekler. Sayıları da yazı gibi yazar.\n4. `close()` ve `flush()` tampondaki veriyi karta gönderir.\n5. Okurken `available()` okunacak bayt var mı diye bakar, `read()` bir bayt verir.\n\n### Dene\nLaboratuvarda SD yok; bu görevler kodu okuma ve yazma çalışmasıdır.\n- `sd_yaz` programını iki kez çalıştırsan `TEST.TXT` içinde kaç satır olurdu? `FILE_WRITE` dosyayı baştan mı yazar, sona mı ekler? Yanıtını yukarıdaki açıklamadan bul.\n- `sd_flush` programında `dosya.flush()` satırını yorum yapsan ve gücü bir anda kesseydin, dosyada hangi satırlar eksik kalırdı? Neden?\n- `sd_yaz` programında dosya adını `\"sicaklik_kaydi.csv\"` yap. 8.3 kuralına göre `SD.open` bu adla ne döndürür (dosya açılır mı)? Programın hangi satırı bu durumu yakalar?\n- `sd_yaz` programını laboratuvarda çalıştır. Seri monitörde hangi yazıyı görüyorsun, hangisini görmüyorsun? Program nerede bekliyor?\n\n### Sık yapılan hatalar\n- `close()` ya da `flush()` çağırmadan kartı çıkarmak ya da gücü kesmek (gerçek cihazda): son satırlar eksik kalır ya da dosya bozulur.\n- Uzun ya da Türkçe karakterli dosya adı kullanmak: 8.3 kuralına uy.\n- CS pinini yanlış yazmak: `SD.begin(10)` modülün CS bağlantısıyla aynı olmalı. Başka bir pini CS yapsan bile Uno'da D10'u çıkış durumunda bırak; Arduino'nun SD belgesi bunu ister.\n- Kartı FAT32 dışında bir biçimle bırakmak: `SD.begin` başarısız olabilir.\n- SD kütüphanesinin RAM kullanımını unutmak: 34. derste SRAM'in yalnız 2048 bayt olduğunu gördün. SD, tampon için ciddi bir pay alır; 70. derste derleme çıktısında ne kadar olduğunu göreceksin.\n- D13 ve D11'e LED bağlayıp aynı anda SD kullanmak: bu pinler SPI hatlarıdır.",
          "question": "Gerçek bir cihazda gücü açıkken SD kartı çıkarmak neden risklidir? Gerçek kayıt cihazlarında \"kartı güvenle çıkar\" düğmesi ya da ışığı olması sence neden mantıklı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Neden bir veri kaydedicide EEPROM yerine SD kart gerektiğini\n- SPI'nin dört hattını (SCK, MOSI, MISO, CS) ve Uno'daki pinlerini\n- Dosya açma, yazma ve kapatma kalıbını (`SD.open`, `println`, `close`)\n- 8.3 dosya adı kuralını ve `close()` ile `flush()` farkını\n\n### Önceden bilmen gerekenler\n- Ders 34: EEPROM'un yalnızca 1 KB olduğu ve SRAM'in sınırlı olduğu\n- Ders 63: SPI ile bir modülle (RC522) konuşmak\n- Ders 66: RTC ile gerçek zaman (zaman damgası için)\n\n### Neden SD kart?\nBahçede üç gün çalışacak bir sıcaklık kaydedicin olsun. EEPROM yalnızca 1 KB'dir; birkaç yüz ölçümde dolar. SD kart gigabaytlarca yer verir ve kartı çıkarıp bilgisayarda doğrudan açarsın.\n\n### SPI: dört hat\nSD kart **SPI** ile konuşur:\n- **SCK:** saat darbeleri. Arduino üretir.\n- **MOSI:** Arduino'dan karta giden veri.\n- **MISO:** karttan Arduino'ya gelen veri.\n- **CS:** \"seç\" hattı. CS'i LOW olan cihaz dinler.\n\nUno'da SPI pinleri sabittir: SCK D13, MISO D12, MOSI D11. Bu derste CS için D10 kullanırız. Bu pinlere LED bağlayıp aynı anda SD kullanma. SD kartlar 3,3 V mantığıyla çalışır; çıplak bir kart yuvası Arduino'nun 5 V'una doğrudan bağlanmaz, hazır modülün belgesine bakarsın.\n\n### Dosya sistemi ve 8.3 adı\nKütüphane FAT16 ya da FAT32 biçimli kart ister. Dosya adları **8.3** biçiminde olmalıdır: en çok 8 karakter, nokta, en çok 3 karakter uzantı. `VERI.CSV` geçerlidir; `sicaklik_kaydi.csv` çok uzundur.\n\n### Yazma kalıbı\n\n```\nFile dosya = SD.open(\"VERI.CSV\", FILE_WRITE);\nif (dosya) {\n  dosya.println(\"23.5\");\n  dosya.close();\n}\n```\n\n`FILE_WRITE` dosyayı **sonuna ekleyerek** açar; eski içerik silinmez. Dosya yoksa oluşturulur. `SD.begin(10)` başarısız olursa `false` döner (kart yok, kablo yanlış ya da CS farklı). `if (dosya)` kontrolü dosyanın gerçekten açılıp açılmadığını söyler.\n\n### Veri nereye gidiyor? close ve flush\n`println` dediğinde veri hemen karta gitmeyebilir; önce küçük bir tamponda bekler. Karta fiziksel yazma `close()` ya da `flush()` ile olur. Bu yüzden iki güvenli yol vardır:\n1. **Aç-yaz-kapat:** her yazıda dosyayı aç, yaz, kapat. Güç kesilirse son durum güvendedir.\n2. **Açık tut ve flush et:** dosyayı bir kez aç, her yazıdan sonra `flush()` çağır.\n\nGerçek bir cihazda kartı çıkarmadan ya da gücü kesmeden önce dosya kapalı (ya da son flush yapılmış) olmalıdır. Aksi hâlde son satırlar kaybolabilir.\n\n### Özet\nSD kart büyük ve kalıcı depolama sağlar ve SPI ile konuşur. Uno'da SPI pinleri sabittir (D11, D12, D13) ve CS için D10'u kullanırız. Dosya adı 8.3 olmalı; `FILE_WRITE` sona ekler. Veri `close()` ya da `flush()` ile karta yazılır.",
          "concepts": [
            {
              "term": "SPI hatları (SCK, MOSI, MISO, CS)",
              "definition": "SPI dört hatla çalışır: saat (SCK), Arduino'dan veri (MOSI), cihazdan veri (MISO) ve cihazı seçen CS.",
              "example": "Uno'da SCK D13, MISO D12, MOSI D11'dir; SD kartın CS hattını bu derste D10'a bağlarız.",
              "pitfall": "SPI pinleri olan D11-D13'e LED bağlayıp aynı anda SD kart kullanmak."
            },
            {
              "term": "SD.begin(CS)",
              "definition": "SPI'yı başlatır ve kartla konuşmaya çalışır; başarılıysa true, değilse false döner.",
              "example": "if (!SD.begin(10)) { Serial.println(\"kart yok\"); } kart bulunamazsa uyarı verir.",
              "pitfall": "CS pinini modülün gerçek bağlantısından farklı yazmak; begin false döner."
            },
            {
              "term": "FILE_WRITE",
              "definition": "Dosyayı yazmak için açar; dosya yoksa oluşturur, varsa yazıyı sonuna ekler.",
              "example": "Programı iki kez çalıştırırsan ikinci çalıştırmanın satırları ilkinin altına eklenir.",
              "pitfall": "FILE_WRITE'ın dosyayı baştan yazıp eski veriyi sildiğini sanmak."
            },
            {
              "term": "8.3 dosya adı",
              "definition": "En çok 8 karakterlik ad, nokta ve en çok 3 karakterlik uzantı; Türkçe karakter ve boşluk kullanılmaz.",
              "example": "VERI.CSV ve LOG0001.TXT geçerli adlardır.",
              "pitfall": "sicaklik_kaydi.csv gibi uzun bir ad kullanmak; dosya açılamaz ve if (dosya) bunu yakalar."
            },
            {
              "term": "close() ve flush()",
              "definition": "Tamponda bekleyen veriyi karta fiziksel olarak yazan iki komuttur; close dosyayı da kapatır.",
              "example": "Aç-yaz-kapat yönteminde her yazıdan sonra close() çağrıldığı için güç kesilse bile veri güvendedir.",
              "pitfall": "close() ya da flush() çağırmadan kartı çıkarmak ya da gücü kesmek; son satırlar kaybolur."
            },
            {
              "term": "3,3 V mantığı",
              "definition": "SD kartlar 3,3 V ile çalışır; hazır modüllerde gerilim düzenleyici ve seviye dönüştürücü bulunur.",
              "example": "Modül belgesi 5 V Arduino ile kullanılabileceğini söylüyorsa seviye dönüştürücü içindedir.",
              "pitfall": "Çıplak bir SD kart yuvasını Arduino'nun 5 V pinlerine doğrudan bağlamak."
            }
          ],
          "quiz": [
            {
              "id": "m4h7d67-q1",
              "kind": "mcq",
              "prompt": "Arduino Uno'da SPI için SCK, MISO ve MOSI hatları hangi pinlerdedir?",
              "options": [
                "SCK D11, MISO D12, MOSI D13",
                "SCK D13, MISO D12, MOSI D11",
                "SCK D10, MISO D11, MOSI D12",
                "SCK A5, MISO A4, MOSI A3"
              ],
              "answer": 1,
              "explanation": "Uno'da SCK D13, MISO D12, MOSI D11'dir; bu pinler sabittir. D10 bu derste CS için seçildi, SPI hattı değildir. A4 ve A5 ise I2C hatlarıdır (SDA, SCL).",
              "skills": [
                "sd-storage",
                "serial-protocols"
              ]
            },
            {
              "id": "m4h7d67-q2",
              "kind": "numeric",
              "prompt": "Bir program her çalıştırıldığında TEST.TXT dosyasını FILE_WRITE ile açıp iki satır (println) yazar ve kapatır. Dosya başlangıçta yok. Program üç kez çalıştırılırsa dosyada kaç satır olur?",
              "answer": 6,
              "unit": "satır",
              "explanation": "FILE_WRITE dosyanın sonuna ekler, eski içeriği silmez. Her çalıştırma 2 satır ekler; 3 × 2 = 6 satır olur. Dosyanın baştan yazıldığını varsaysaydın 2 bulurdun; bu yanlıştır.",
              "skills": [
                "sd-storage"
              ]
            },
            {
              "id": "m4h7d67-q3",
              "kind": "find-bug",
              "prompt": "Kayıt cihazı bir saat çalıştıktan sonra güç kablosu bir anda çekiliyor ve dosyada son satırlar yok. Kodda tek hata var. Hangisi?\n\n```\nFile dosya = SD.open(\"VERI.CSV\", FILE_WRITE);\nif (dosya) {\n  dosya.println(\"23.5\");\n}\n```",
              "options": [
                "Dosya adı 8.3 kuralına uymuyor",
                "FILE_WRITE yerine FILE_READ kullanılmalı",
                "close() ya da flush() yok; veri tamponda kalıp karta yazılmıyor",
                "println yerine print kullanılmalı"
              ],
              "answer": 2,
              "explanation": "VERI.CSV 8.3 kuralına uygundur (4 harf, nokta, 3 harf). Veri önce RAM'deki tamponda bekler; close() ya da flush() olmadan karta yazılmayabilir. print ile println arasındaki fark yalnız satır sonudur, kayıp sebebi bu değildir.",
              "skills": [
                "sd-storage",
                "prog-debug"
              ]
            },
            {
              "id": "m4h7d67-q4",
              "kind": "mcq",
              "prompt": "Elindeki çıplak bir SD kart yuvasının VCC ve veri pinlerini Uno'nun 5 V'una doğrudan bağlamak istiyorsun. Ne yapmalısın?",
              "options": [
                "Sorun yok, SD kartlar 5 V ile çalışır",
                "Yalnızca GND'yi bağla",
                "CS pinini 5 V'a bağla",
                "Bunu yapma; kart 3,3 V mantığıyla çalışır. Gerilim düzenleyicili ve seviye dönüştürücülü hazır bir modül kullan"
              ],
              "answer": 3,
              "explanation": "SD kartlar 3,3 V mantığıyla çalışır. Hazır modüllerde gerilim düzenleyici ve seviye dönüştürücü bulunur; çıplak yuva Arduino'nun 5 V'una doğrudan bağlanmaz. Modülün 5 V'a uygun olduğunu belgesinden doğrula.",
              "skills": [
                "sd-storage",
                "circuit-wiring"
              ]
            },
            {
              "id": "m4h7d67-q5",
              "kind": "mcq",
              "prompt": "\"Aç-yaz-kapat\" yöntemi \"açık tut ve flush et\" yöntemine göre neden güç kesintisine karşı en güvenli sayılır?",
              "options": [
                "Çünkü her yazıdan sonra dosya kapalıdır, yani tamponda bekleyen veri kalmaz",
                "Çünkü dosya hiç RAM kullanmaz",
                "Çünkü kartın hızı artar",
                "Çünkü 8.3 kuralı gevşer"
              ],
              "answer": 0,
              "explanation": "Aç-yaz-kapat yönteminde her satırın ardından close() çağrılır; tamponda yazılmamış veri kalmaz. Açık tut ve flush et yönteminde de veri flush ile gönderilir; fark, dosyanın açık kalmasıdır. Hız ya da dosya adı kuralıyla ilgisi yoktur.",
              "skills": [
                "sd-storage"
              ]
            }
          ]
        },
        {
          "title": "Veri kaydı: CSV ve zaman damgası",
          "durationMin": 30,
          "problem": "Bir hafta boyunca odanın sıcaklığını kaydettin. Şimdi bunun grafiğini çizmek istiyorsun: gece mi soğuyor, öğleden sonra mı ısınıyor? Bunun için verinin bir tabloya girmesi gerekir, yani her satırda \"ne zaman, kaç derece, nem yüzde kaç\". Bu tablo dosyasının en basit hali **CSV**'dir. Bu derste Arduino'dan her bilgisayar programının açabileceği düzgün satırlar çıkarmayı öğreneceksin.",
          "contentMd": "### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| DHT22 (Tür: DHT22) | **DATA** → Uno **D5** (46. dersteki gibi), **VCC** → **5V**, **GND** → **GND** |\n| RTC | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → **5V**, **GND** → **GND** |\n\nBu dersin programları yalnız Serial'e yazar, SD kart gerekmez. Son program (`csv_sd`) SD karta da yazar; laboratuvarda SD kart modülü parçası yok, o programı okuma örneği olarak incele (aşağıda not var).\n\n### CSV ve zaman damgası\n**CSV** (Comma-Separated Values, virgülle ayrılmış değerler) düz bir metin dosyasıdır. Her satır bir kayıttır, sütunlar virgülle ayrılır. İlk satır sütun adlarını taşır:\n\n```\nzaman,sicaklik_C,nem_yuzde\n2026-03-14 08:30:00,23.5,55.0\n2026-03-14 08:30:05,23.5,55.1\n```\n\nİlk sütun **zaman damgasıdır**: ölçümün hangi anda yapıldığı. Biçimi `yıl-ay-gün saat:dakika:saniye` seçtik. Bu, ISO 8601 adlı uluslararası tarih biçimine uygundur ve iki işe yarar. Birincisi, her yerde aynı okunur (03.04.2026 yazısını bir ülke 3 Nisan, başka bir ülke 4 Mart diye okur). İkincisi, **alfabetik sıralama zaman sıralamasıdır**: önce yıl, sonra ay, sonra gün geldiği için satırları metin olarak sıralasan bile zaman sırasına dizilir. Bunun çalışması için ay, gün, saat gibi alanların hep iki haneli (`03`, `08`) yazılması gerekir.\n\n### Satırı üreten fonksiyon: donanımdan bağımsız\nSatır biçimlemeyi SD karttan, RTC'den, DHT'den ayrı bir fonksiyona koyuyoruz:\n\n`String satirOlustur(DateTime t, float sicak, float nem)`\n\nFonksiyon bir zaman ve iki sayı alır, bir yazı döndürür. Hiçbir donanıma dokunmaz. Bu yüzden sabit değerlerle kolayca denenir: önce fonksiyonun doğru satır ürettiğinden emin ol, sonra gerçek sensörlere bağla. (SD'ye yazarken de aynı fonksiyonu kullanacağız.)\n\n```cpp\n// sketch: csv_fonksiyon\n#include <RTClib.h>\n\nString ikiHane(int n) {                  // 5 -> \"05\"\n  if (n < 10) return \"0\" + String(n);\n  return String(n);\n}\n\nString sayi(float x) {                   // 23.5 -> \"23.5\" (bir ondalık, nokta ile)\n  char tampon[12];\n  dtostrf(x, 1, 1, tampon);\n  return String(tampon);\n}\n\nString satirOlustur(DateTime t, float sicak, float nem) {\n  String s;\n  s.reserve(40);                         // yeri baştan ayır\n  s += t.year();\n  s += '-';\n  s += ikiHane(t.month());\n  s += '-';\n  s += ikiHane(t.day());\n  s += ' ';\n  s += ikiHane(t.hour());\n  s += ':';\n  s += ikiHane(t.minute());\n  s += ':';\n  s += ikiHane(t.second());\n  s += ',';\n  if (!isnan(sicak)) s += sayi(sicak);   // okuma başarısızsa alan boş kalır\n  s += ',';\n  if (!isnan(nem)) s += sayi(nem);\n  return s;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(\"zaman,sicaklik_C,nem_yuzde\");\n  Serial.println(satirOlustur(DateTime(2026, 3, 14, 8, 30, 5), 23.5, 55.0));\n  Serial.println(satirOlustur(DateTime(2026, 12, 1, 0, 0, 0), -2.5, 100.0));\n  Serial.println(satirOlustur(DateTime(2026, 7, 9, 23, 59, 59), NAN, NAN));\n}\n\nvoid loop() {\n}\n```\n\nÇıktı şöyle olur:\n\n```\nzaman,sicaklik_C,nem_yuzde\n2026-03-14 08:30:05,23.5,55.0\n2026-12-01 00:00:00,-2.5,100.0\n2026-07-09 23:59:59,,\n```\n\nÜçüncü satırda sensör okunamamış gibi davranıldı (`NAN`, sayı değil). Zaman damgası yazılır, sensör sütunları boş bırakılır. Boş alan CSV'de \"değer yok\" demektir ve sütunlar kaymaz.\n\n### Canlı veri: RTC + DHT22\nŞimdi fonksiyonu sensörlere bağlayalım. Her 5 saniyede bir RTC'den zamanı, DHT22'den sıcaklık ve nemi okuyup satırı Serial'e yazıyoruz. DHT22'yi iki okuma arasında en az yaklaşık 2 saniye beklemelisin; 5 saniye rahat bir aralıktır. Laboratuvarın RTC'si 2026-01-01 00:00:00'dan başladığı için satırların tarihi `2026-01-01 00:00:00`, `2026-01-01 00:00:05` ... diye akar; DHT'yi seçip sağ panelden sıcaklığı ve nemi çalışırken değiştirebilirsin.\n\n```cpp\n// sketch: csv_satir\n#include <Wire.h>\n#include <RTClib.h>\n#include <DHT.h>\n\nconst int DHT_PIN = 5;\nconst unsigned long OLCUM_ARALIGI = 5000;   // ms\n\nRTC_DS3231 rtc;\nDHT dht(DHT_PIN, DHT22);\nunsigned long sonOlcum = 0;\nbool ilkOlcum = true;\n\nString ikiHane(int n) {\n  if (n < 10) return \"0\" + String(n);\n  return String(n);\n}\n\nString sayi(float x) {\n  char tampon[12];\n  dtostrf(x, 1, 1, tampon);\n  return String(tampon);\n}\n\nString satirOlustur(DateTime t, float sicak, float nem) {\n  String s;\n  s.reserve(40);\n  s += t.year();\n  s += '-';\n  s += ikiHane(t.month());\n  s += '-';\n  s += ikiHane(t.day());\n  s += ' ';\n  s += ikiHane(t.hour());\n  s += ':';\n  s += ikiHane(t.minute());\n  s += ':';\n  s += ikiHane(t.second());\n  s += ',';\n  if (!isnan(sicak)) s += sayi(sicak);\n  s += ',';\n  if (!isnan(nem)) s += sayi(nem);\n  return s;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n  dht.begin();\n  Serial.println(\"zaman,sicaklik_C,nem_yuzde\");\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (ilkOlcum || simdi - sonOlcum >= OLCUM_ARALIGI) {\n    ilkOlcum = false;\n    sonOlcum = simdi;\n    float sicak = dht.readTemperature();\n    float nem = dht.readHumidity();\n    Serial.println(satirOlustur(rtc.now(), sicak, nem));\n  }\n}\n```\n\n`satirOlustur` aynen aynı kaldı; yalnızca `loop()` ona sensörlerden okunan değerleri veriyor. İstersen seri monitördeki satırları kopyalayıp bilgisayarındaki bir metin dosyasına `VERI.CSV` adıyla yapıştırarak tablo programında açabilirsin; bu kısım laboratuvarın dışındadır.\n\n### Ondalık ayırıcı ve Excel\nCSV'de virgül sütunları ayırır. Peki ondalık sayıyı da virgülle (`23,5`) yazarsan? Satır `...,23,5,55,0` olur ve bir program onu 5 sütun sanır. Ondalık ayırıcı ülkeden ülkeye değişir: bizde virgül, birçok ülkede nokta. Bilgisayarının dil ayarına göre tablo programı da farklı bekler. Genel kural:\n\n- **Nokta ondalık + virgül ayraç** (`23.5,55.0`): programlama dünyasında ve İngilizce ayarlı programlarda standarttır.\n- **Virgül ondalık + noktalı virgül ayraç** (`23,5;55,0`): Türkçe ayarlı bir bilgisayarda Excel'in çoğu zaman beklediği biçimdir.\n\nHangisinin sende çalıştığını kendi bilgisayarında denemen gerekir; çünkü bu ayar Excel sürümüne ve bölgesel ayarlara bağlıdır. Dosyayı çift tıklayarak açmak yerine tablo programının \"metinden/CSV'den içe aktar\" özelliğini kullanıp ayracı kendin seçmek de bir yoldur.\n\nİkinci biçimi üretmek için fonksiyon değişir, ama mantık aynıdır:\n\n```cpp\n// sketch: csv_tr\n#include <RTClib.h>\n\nconst char AYRAC = ';';                    // Türkçe Excel'in sütun ayracı\n\nString ikiHane(int n) {\n  if (n < 10) return \"0\" + String(n);\n  return String(n);\n}\n\nString sayiTR(float x) {\n  char tampon[12];\n  dtostrf(x, 1, 1, tampon);\n  String s(tampon);\n  s.replace('.', ',');                     // ondalık ayırıcı virgül\n  return s;\n}\n\nString satirOlusturTR(DateTime t, float sicak, float nem) {\n  String s;\n  s.reserve(40);\n  s += t.year();\n  s += '-';\n  s += ikiHane(t.month());\n  s += '-';\n  s += ikiHane(t.day());\n  s += ' ';\n  s += ikiHane(t.hour());\n  s += ':';\n  s += ikiHane(t.minute());\n  s += ':';\n  s += ikiHane(t.second());\n  s += AYRAC;\n  if (!isnan(sicak)) s += sayiTR(sicak);\n  s += AYRAC;\n  if (!isnan(nem)) s += sayiTR(nem);\n  return s;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(\"zaman;sicaklik_C;nem_yuzde\");\n  Serial.println(satirOlusturTR(DateTime(2026, 3, 14, 8, 30, 5), 23.5, 55.0));\n  Serial.println(satirOlusturTR(DateTime(2026, 12, 1, 0, 0, 0), -2.5, 100.0));\n}\n\nvoid loop() {\n}\n```\n\n### Aynı satırı SD karta yaz\nSon adımda satırı hem Serial'e hem SD karta yazıyoruz. Laboratuvarda SD kart modülü yok ve `SD.begin` kart bulamayınca takılıp kalır; bu yüzden bu programı laboratuvarda çalıştırınca hiçbir şey yazmaz. Gerçek bir kartta çalışan bir kayıt örneği olarak oku. 67. derste öğrendiğin gibi her satırda dosyayı açıp yazıp kapatıyoruz. Dosya yeniyse (`SD.exists` ile kontrol) önce başlık satırını yazıyoruz. SD kart takılı değilse program durmuyor, yalnız Serial'e yazmaya devam ediyor.\n\n```cpp\n// sketch: csv_sd\n#include <Wire.h>\n#include <SPI.h>\n#include <SD.h>\n#include <RTClib.h>\n#include <DHT.h>\n\nconst int SD_CS = 10;\nconst int DHT_PIN = 5;\nconst unsigned long OLCUM_ARALIGI = 5000;   // ms\nconst char DOSYA_ADI[] = \"VERI.CSV\";        // 8.3 kuralı: en çok 8 harf + 3 harf uzantı\n\nRTC_DS3231 rtc;\nDHT dht(DHT_PIN, DHT22);\nunsigned long sonOlcum = 0;\nbool ilkOlcum = true;\nbool sdHazir = false;\n\nString ikiHane(int n) {\n  if (n < 10) return \"0\" + String(n);\n  return String(n);\n}\n\nString sayi(float x) {\n  char tampon[12];\n  dtostrf(x, 1, 1, tampon);\n  return String(tampon);\n}\n\nString satirOlustur(DateTime t, float sicak, float nem) {\n  String s;\n  s.reserve(40);\n  s += t.year();\n  s += '-';\n  s += ikiHane(t.month());\n  s += '-';\n  s += ikiHane(t.day());\n  s += ' ';\n  s += ikiHane(t.hour());\n  s += ':';\n  s += ikiHane(t.minute());\n  s += ':';\n  s += ikiHane(t.second());\n  s += ',';\n  if (!isnan(sicak)) s += sayi(sicak);\n  s += ',';\n  if (!isnan(nem)) s += sayi(nem);\n  return s;\n}\n\nbool sdyeYaz(const String& satir) {\n  File dosya = SD.open(DOSYA_ADI, FILE_WRITE);\n  if (!dosya) return false;\n  dosya.println(satir);\n  dosya.close();                            // kapatınca veri karta yazılır\n  return true;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n  dht.begin();\n\n  sdHazir = SD.begin(SD_CS);\n  if (!sdHazir) {\n    Serial.println(\"UYARI: SD kart yok, yalniz Serial'e yaziliyor\");\n  } else if (!SD.exists(DOSYA_ADI)) {\n    sdyeYaz(\"zaman,sicaklik_C,nem_yuzde\");    // dosya yeniyse başlığı yaz\n  }\n  Serial.println(\"zaman,sicaklik_C,nem_yuzde\");\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n  if (ilkOlcum || simdi - sonOlcum >= OLCUM_ARALIGI) {\n    ilkOlcum = false;\n    sonOlcum = simdi;\n    String satir = satirOlustur(rtc.now(), dht.readTemperature(), dht.readHumidity());\n    Serial.println(satir);\n    if (sdHazir && !sdyeYaz(satir)) {\n      Serial.println(\"UYARI: SD'ye yazilamadi\");\n    }\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `ikiHane` tek haneli sayıların başına 0 koyar. Böylece `08:05:03` düzgün sıralanır.\n2. `dtostrf(x, 1, 1, tampon)` bir `float`'ı yazıya çevirir: en az 1 karakter genişlik, 1 ondalık basamak. AVR derleyicisinin `sprintf` işlevi varsayılan olarak `%f` desteklemez; `dtostrf` bu yüzden kullanılır.\n3. `String s; s.reserve(40);` yazı için yeri baştan ayırır. 34. derste `String`'in SRAM'i parçalayabileceğini gördün; kısa ömürlü ve yeri baştan ayrılmış bir `String` bu riski azaltır.\n4. DHT okuması başarısız olunca `readTemperature()` `NaN` döndürür. `isnan` ile bunu yakalıyor, alanı boş bırakıyoruz. Satırın zaman damgası yine yazılır.\n5. `satirOlustur` donanıma dokunmadığı için aynı fonksiyonu Serial için de SD için de kullanıyoruz. Yazılacak yer değişince satır biçimi değişmez.\n\n### Dene\n- `csv_fonksiyon` programına dördüncü bir test satırı ekle: sıcaklığı 0.0, saniyesi 5 olan bir zaman. Çıktıda `0.0` ve `05` doğru yazılıyor mu?\n- `csv_satir` programında `OLCUM_ARALIGI`'ni 2000 yap. Satırlar arası zamana bak. Neden 2 saniyenin altına inmemelisin?\n- İstersen seri monitör çıktısını kopyalayıp bilgisayarındaki bir tablo programına aktar. Sütunlar doğru ayrıldı mı? Değilse `csv_tr` biçimini dene.\n- `csv_satir` çalışırken DHT'nin sıcaklığını -5 °C yap. Satırda eksi işareti ve bir ondalık basamak görüyor musun? Sonra ■ ile durdurup DHT'nin DATA kablosunu kaldır ve yeniden ▶'e bas: satırlarda sensör sütunları nasıl görünüyor?\n- `satirOlustur` fonksiyonuna üçüncü bir sensör sütunu ekle: Fahrenheit cinsinden sıcaklık (`sicak * 9 / 5 + 32`). Başlık satırını da güncellemeyi unutma.\n\n### Sık yapılan hatalar\n- Başlık satırındaki sütun sayısı ile veri satırlarındaki sütun sayısının farklı olması.\n- Ondalık virgül kullanıp ayracı da virgül bırakmak: sayı iki sütuna bölünür.\n- Ay, gün, saat gibi alanları iki haneli yazmamak: sıralama bozulur, tablo programı biçimi tanımayabilir.\n- Aynı fonksiyonu hem Serial hem SD için kullanmak yerine her yere ayrı biçimleme kodu yazmak: iki yerde biçim farklı çıkar.\n- SD'ye yazarken dosyayı kapatmamak (67. ders).\n- Dosya adını 8.3 biçiminden uzun seçmek.",
          "question": "Zaman damgasını RTC yerine `millis()` ile üretmek (örneğin \"123456 ms\") neden iş görmez gibi duruyor? Bir yıl sonra bu dosyayı açan biri satırların ne zaman yazıldığını nasıl anlar?",
          "explainerMd": "### Bu derste öğreneceklerin\n- CSV dosyasının ne olduğunu ve neden veri kaydında kullanıldığını\n- ISO 8601 zaman damgasını (yıl-ay-gün saat:dakika:saniye) ve neden iyi olduğunu\n- Donanımdan bağımsız bir satır üretme fonksiyonu yazmayı\n- Ondalık virgül ile sütun ayracı arasındaki çatışmayı\n\n### Önceden bilmen gerekenler\n- Ders 66: RTC ile `DateTime` okumak\n- Ders 67: SD karta aç-yaz-kapat ile satır eklemek\n- Ders 46: DHT22 ile sıcaklık ve nem okumak\n- Ders 34: `String` kullanımı ve SRAM sınırı\n\n### CSV nedir?\n**CSV** (virgülle ayrılmış değerler) düz bir metin dosyasıdır. Her satır bir kayıttır, sütunlar virgülle ayrılır, ilk satır sütun adlarını taşır:\n\n```\nzaman,sicaklik_C,nem_yuzde\n2026-03-14 08:30:00,23.5,55.0\n```\n\nHer tablo programı bu dosyayı açabilir; grafiği oradan çizersin.\n\n### Zaman damgası\nHer satırın ilk sütunu ölçümün yapıldığı **zaman damgası**dır. `2026-03-14 08:30:00` biçimi ISO 8601'e uygundur. İki üstünlüğü vardır. Birincisi, her ülkede aynı okunur (03.04.2026'yı biri 3 Nisan, biri 4 Mart diye okur). İkincisi, **alfabetik sıra zaman sırasıdır**: önce yıl, sonra ay, sonra gün gelir. Bunun çalışması için ay, gün, saat, dakika ve saniye hep iki haneli yazılmalıdır (`03`, `08`). `millis()` değeri iş görmez: kart yeniden başlayınca sıfırlanır ve bir yıl sonra kimse \"123456 ms\"in ne zaman olduğunu bilemez.\n\n### Satırı üreten ayrı fonksiyon\nSatır biçimlemeyi bir fonksiyona koy:\n\n```\nString satirOlustur(DateTime t, float sicak, float nem)\n```\n\nFonksiyon donanıma dokunmaz: bir zaman ve iki sayı alır, bir yazı verir. Sabit değerlerle denenebilir. Aynı fonksiyonu Serial için de SD için de kullanırsın; yazılan yer değişir, biçim değişmez. Sensör okunamadığında `NAN` gelir. O zaman alanı boş bırakırsın (`2026-03-14 08:30:00,,`); sütun sayısı değişmez.\n\nFloat'ı yazıya çevirmek için AVR'de `dtostrf` kullanılır, çünkü `sprintf` varsayılan olarak `%f` desteklemez.\n\n### Ondalık ayırıcı tuzağı\nOndalığı virgülle yazarsan (`23,5`) ve ayraç da virgülse satır `...,23,5,55,0` olur ve tablo programı 5 sütun görür. Çözüm iki türlüdür: nokta ondalık ve virgül ayraç (`23.5,55.0`) ya da virgül ondalık ve noktalı virgül ayraç (`23,5;55,0`). Türkçe ayarlı bir bilgisayarda çoğu zaman ikincisi beklenir; bu Excel sürümüne bağlıdır, kendi bilgisayarında dene.\n\n### Özet\nCSV, her satırı bir kayıt olan basit bir metin tablosudur. Zaman damgası ISO biçiminde ve iki haneli yazılırsa her yerde aynı okunur ve doğru sıralanır. Satır üretimini donanımdan ayırmak kodu denemeyi kolaylaştırır. Ondalık ayırıcı ile sütun ayracı birbirine karışmamalıdır.",
          "concepts": [
            {
              "term": "CSV",
              "definition": "Her satırı bir kayıt, sütunları virgülle ayrılmış düz metin tablosu; ilk satır sütun adlarıdır.",
              "example": "zaman,sicaklik_C,nem_yuzde başlığının altına her ölçüm bir satır olarak eklenir.",
              "pitfall": "Başlık satırı ile veri satırlarındaki sütun sayısını farklı yazmak."
            },
            {
              "term": "Zaman damgası (ISO 8601)",
              "definition": "Ölçümün anını yıl-ay-gün saat:dakika:saniye biçiminde, ay ve gün iki haneli yazan düzen.",
              "example": "2026-03-14 08:30:05 her ülkede aynı okunur ve metin olarak sıralansa bile zaman sırasında dizilir.",
              "pitfall": "Ay ve günü tek haneli bırakmak (2026-3-9); sıralama bozulur."
            },
            {
              "term": "Satır üretme fonksiyonu",
              "definition": "Bir zaman ve iki sayıdan CSV satırı üreten, donanıma dokunmayan fonksiyon.",
              "example": "satirOlustur(DateTime(2026,1,5,7,8,9), 21.0, NAN) çıktısı sabit değerlerle denenebilir.",
              "pitfall": "Her yere (Serial, SD) ayrı biçimleme kodu yazmak; iki yerde satır biçimi farklı çıkar."
            },
            {
              "term": "NaN ve boş alan",
              "definition": "Sensör okunamayınca float NaN olur; CSV'de bu, alanın boş bırakılmasıyla gösterilir.",
              "example": "Üçüncü satır 2026-07-09 23:59:59,, olarak yazılır; zaman damgası kalır, sütunlar kaymaz.",
              "pitfall": "NaN'ı yazıya çevirmeye çalışmak ya da o satırı atlayıp kaydı hiç tutmamak."
            },
            {
              "term": "dtostrf()",
              "definition": "float'ı belirli genişlik ve ondalık basamakla yazıya çeviren AVR işlevi.",
              "example": "dtostrf(23.5, 1, 1, tampon) tampona \"23.5\" yazar.",
              "pitfall": "sprintf'in %f ile çalışacağını sanmak; AVR'de varsayılan olarak desteklenmez."
            },
            {
              "term": "Ondalık ayırıcı ve ayraç",
              "definition": "Sayı içindeki ondalık işareti ile sütunları ayıran karakter birbirine karışmamalıdır.",
              "example": "Türkçe Excel için 23,5;55,0 biçimi (virgül ondalık, noktalı virgül ayraç) kullanılabilir.",
              "pitfall": "Ondalık virgül ve ayraç virgül birlikte kullanılırsa 23,5 iki sütuna bölünür."
            }
          ],
          "quiz": [
            {
              "id": "m4h7d68-q1",
              "kind": "predict-output",
              "prompt": "Aşağıdaki çağrı çalışınca seri monitörde ne görünür? (satirOlustur dersteki fonksiyondur: iki haneli alanlar, bir ondalıklı sayılar, NaN için boş alan.)\n\n```\nSerial.println(satirOlustur(DateTime(2026, 1, 5, 7, 8, 9), 21.0, NAN));\n```",
              "options": [
                "2026-1-5 7:8:9,21.0,",
                "2026-01-05 07:08:09,21.0,",
                "2026-01-05 07:08:09,21.0,0",
                "2026-01-05 07:08:09,21,"
              ],
              "answer": 1,
              "explanation": "ikiHane() ay, gün, saat, dakika ve saniyeyi iki haneye tamamlar. dtostrf 1 ondalık basamak verdiği için 21.0 yazılır. nem NaN olduğu için son alan boş kalır; sıfır yazılmaz ve satırın sonundaki virgül sütun sayısını korur.",
              "skills": [
                "data-logging",
                "prog-debug"
              ]
            },
            {
              "id": "m4h7d68-q2",
              "kind": "find-bug",
              "prompt": "CSV dosyasını tablo programında zamana göre sıraladığında 2026-12-01 satırı 2026-3-9 satırından önce çıkıyor. Satır üreten kodun hangi kısmı sorumlu?\n\n```\ns += t.year();\ns += '-';\ns += t.month();\ns += '-';\ns += t.day();\n```",
              "options": [
                "year() yerine yıl iki haneli olmalı",
                "Tire yerine eğik çizgi kullanılmalı",
                "s += yerine s = kullanılmalı",
                "month() ve day() iki haneli yazılmıyor; ikiHane() kullanılmalı"
              ],
              "answer": 3,
              "explanation": "month() ve day() başa sıfır koymaz. \"2026-3-9\" ile \"2026-12-01\" metin olarak karşılaştırılınca \"2026-1\" ile \"2026-3\" karşılaştırılır; 12. ay 3. aydan önce sıralanır. İki haneli yazınca \"2026-03-09\" olur ve metin sırası zaman sırasıyla örtüşür.",
              "skills": [
                "data-logging",
                "prog-debug"
              ]
            },
            {
              "id": "m4h7d68-q3",
              "kind": "numeric",
              "prompt": "Bir kayıt cihazı satırı virgül ayraçlı ve ondalık virgüllü olarak şöyle yazıyor: 2026-03-14 08:30:05,23,5,55,0. Bir tablo programı bu satırı kaç sütun olarak okur?",
              "answer": 5,
              "unit": "sütun",
              "explanation": "Satır virgüllerden bölünür: \"2026-03-14 08:30:05\", \"23\", \"5\", \"55\", \"0\". Beklenen 3 sütun yerine 5 sütun çıkar. Çözüm ondalıkta nokta kullanmak ya da ayracı noktalı virgül yapmaktır.",
              "skills": [
                "data-logging"
              ]
            },
            {
              "id": "m4h7d68-q4",
              "kind": "mcq",
              "prompt": "Zaman damgası olarak millis() değerini (örneğin 123456) yazmak neden yetersizdir?",
              "options": [
                "millis() kart her açıldığında sıfırlanır; satırın gerçek tarih ve saatini söylemez",
                "millis() sayı olduğu için CSV'ye yazılamaz",
                "millis() her zaman 1000'e bölünmelidir",
                "CSV dosyalarında yalnız metin olabilir"
              ],
              "answer": 0,
              "explanation": "millis() kart açıldığından beri geçen süreyi verir ve kart yeniden başlayınca sıfırdan başlar. Bir yıl sonra dosyayı açan biri satırın ne zaman yazıldığını bulamaz. RTC'den alınan tarih ve saat gerçek zamanı verir. Sayıların CSV'ye yazılmasında sorun yoktur.",
              "skills": [
                "data-logging",
                "rtc-time"
              ]
            },
            {
              "id": "m4h7d68-q5",
              "kind": "numeric",
              "prompt": "Cihaz her 5 saniyede bir satır yazıyor. Bir gün (24 saat) kesintisiz çalışırsa dosyaya kaç veri satırı eklenir? (Başlık satırını sayma.)",
              "answer": 17280,
              "unit": "satır",
              "explanation": "Bir günde 24 × 60 × 60 = 86400 saniye vardır. 86400 ÷ 5 = 17280 satır. Bu hesap, ölçüm aralığını seçerken kartın dolma hızını tahmin etmek için kullanılır.",
              "skills": [
                "data-logging",
                "prog-planning"
              ]
            }
          ]
        },
        {
          "title": "Haberleşme protokolleri: UART, I2C, SPI karşılaştırması",
          "durationMin": 30,
          "problem": "Bu hafta Arduino'na üç farklı yolla konuştun: bilgisayarla Serial üzerinden, RTC ve LCD ile I2C üzerinden, SD kartla SPI üzerinden. Hepsi \"veri taşıyor\" ama biri iki kablo kullanıyor, biri dört; biri bir cihazla konuşuyor, biri onlarca cihazla. Hangisi daha hızlı? Hangisini ne zaman seçmelisin? Bu derste her birinin hızını sayılarla bulup karşılaştıracaksın.",
          "contentMd": "### Devre\nBu derste ek parça gerekmiyor; laboratuvarda yalnız Uno'yu kullanıyoruz ve programları düzenleyiciye yazıp ▶'e basıyorsun. Programlar **D4**'ü bir \"ölçüm penceresi\" olarak kullanır: ölçülen işin başında D4'ü HIGH, sonunda LOW yapar. Süreyi program içinde `micros()` ile ölçeriz. (Bilgi notu: gerçek bir devrede D4'e bir osiloskop ya da lojik analizör bağlansa aynı pencerenin süresini dışarıdan görürdük.) Laboratuvarda arka arkaya gelen pencerelerin arasındaki boşluk çok kısa olduğundan D4 tek uzun bir HIGH gibi görünebilir; aralarına `delay(20)` koyarsan ayrı pencereler görürsün.\n\n| Pin | Görevi |\n|---|---|\n| D4 | Ölçüm penceresi |\n| D0 (RX), D1 (TX) | UART |\n| A4 (SDA), A5 (SCL) | I2C |\n| D11 (MOSI), D12 (MISO), D13 (SCK), D10 (CS) | SPI |\n\nD0 ve D1 gerçek kartta aynı zamanda USB üzerinden bilgisayarla konuşmak için kullanılır. Bu pinlere başka bir cihaz bağlıysa program yüklemekte ya da Serial Monitor'de sorun çıkabilir. Bu yüzden D0 ve D1'i başka iş için kullanmaktan kaçın.\n\n### UART: iki kablo, ortak hız\n**UART** (Serial) iki hatla çalışır: bir uçtan TX (gönder), karşı uçtan RX (al). Ortak bir saat hattı yoktur. Bu yüzden iki tarafın **baud hızını** (saniyede bit sayısı) önceden aynı seçmesi gerekir. Bir bayt şöyle gönderilir: 1 başlangıç biti, 8 veri biti, 1 bitiş biti. Yani bir bayt **10 bit** sürer. Bir bitin süresi `1 / baud` olur.\n\nÖlçelim. Program üç hızda 100 tane `'U'` gönderir. `'U'` (0x55) bitleri sürekli değişen, \"01010101\" desenli bir karakterdir ve hat izlenirken kolay tanınır. Gönderme sırasında D4 HIGH kalır. Aynı süreyi program içinde `micros()` ile ölçeriz; gerçek kartta D4'e bağlı bir cihaz da aynı pencereyi görür.\n\n```cpp\n// sketch: uart_hiz\nconst int PENCERE = 4;                        // ölçüm penceresi: yazma süresince HIGH\nconst int BAYT = 100;\nconst long HIZLAR[] = {9600, 19200, 38400};\nunsigned long sureUs[3];\n\nvoid setup() {\n  pinMode(PENCERE, OUTPUT);\n\n  for (int i = 0; i < 3; i++) {\n    Serial.begin(HIZLAR[i]);\n    Serial.flush();\n    digitalWrite(PENCERE, HIGH);\n    unsigned long t0 = micros();\n    for (int k = 0; k < BAYT; k++) {\n      Serial.write('U');\n    }\n    Serial.flush();                           // son bit çıkana kadar bekle\n    sureUs[i] = micros() - t0;\n    digitalWrite(PENCERE, LOW);\n    Serial.end();\n  }\n\n  Serial.begin(9600);\n  Serial.println();\n  for (int i = 0; i < 3; i++) {\n    Serial.print(HIZLAR[i]);\n    Serial.print(\" baud: bit suresi \");\n    Serial.print(sureUs[i] / (BAYT * 10.0), 1);\n    Serial.println(\" us\");\n  }\n}\n\nvoid loop() {\n}\n```\n\nGerçek bir bilgisayarda terminal 9600'dayken 19200 ve 38400 bölümlerinde ekranda anlamsız karakterler görürdün: gönderen ve alan hızlar aynı değildi. Bu UART'ın doğasıdır: hız önceden anlaşılır. Laboratuvarın seri monitörü hız farkını modellemez; 100 tane `U` hep düzgün görünür. Sonda ölçüm tablosu 9600'de yazdırılır.\n\nÖlçüm sonucu:\n\n| Baud | Bit süresi (hesap: 1/baud) | Ölçülen bit süresi | Bayt/s (baud ÷ 10) |\n|---|---|---|---|\n| 9600 | 104,2 µs | 104,4 µs | 960 |\n| 19200 | 52,1 µs | 52,4 µs | 1920 |\n| 38400 | 26,0 µs | 26,4 µs | 3840 |\n\nÖlçülen değerler hesaptan biraz büyüktür (yüzde 2'nin altında). Küçük fark ölçüm yönteminden gelir: `micros()` 4 µs'lik adımlarla sayar, ayrıca döngü ve baytları sıraya koyma işi de süreye girer. 115200 baud için hesap 8,7 µs eder; bunu ölçmedik.\n\n### I2C: iki kablo, adresle konuşma\n**I2C** da iki hatla çalışır: SDA (veri) ve SCL (saat). UART'tan farkı, bir **saat hattı** olması ve cihazların **adresle** seçilmesidir (33. ders). Aynı iki kabloya RTC (0x68), LCD (0x27) ve başka cihazlar birlikte bağlanır. Saat hattının hızını `Wire.setClock()` ile seçersin. Arduino Uno'da bu hız, `TWBR` adlı bir yazmaca yazılan bölenle ayarlanır: `SCL = 16 MHz / (16 + 2 × TWBR × ön bölücü)`.\n\nProgram varsayılan hızı okur, sonra 100 kHz ve 400 kHz'i ayarlar ve yazmaçtan çıkan frekansı hesaplar. Bir I2C baytı 9 saat darbesi sürer (8 veri biti + 1 onay biti). Adres baytı ve bir veri baytı toplam 18 darbe eder; bunu da süreye çeviriyoruz.\n\n```cpp\n// sketch: i2c_hiz\n#include <Wire.h>\n\nconst long ISTENEN[] = {100000, 400000};\n\nlong sclHz() {\n  int onbolucu[] = {1, 4, 16, 64};\n  int p = onbolucu[TWSR & 0x03];\n  return F_CPU / (16L + 2L * TWBR * p);\n}\n\nvoid rapor(const char* etiket) {\n  Serial.print(etiket);\n  Serial.print(\": TWBR=\");\n  Serial.print(TWBR);\n  Serial.print(\"  SCL=\");\n  Serial.print(sclHz());\n  Serial.println(\" Hz\");\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  rapor(\"varsayilan\");\n\n  for (int i = 0; i < 2; i++) {\n    Wire.setClock(ISTENEN[i]);\n    rapor(\"setClock\");\n    // adres baytı + 1 veri baytı = 2 bayt = 18 saat darbesi\n    Serial.print(\"  2 baytlik aktarim ~ \");\n    Serial.print(18.0e6 / sclHz(), 0);\n    Serial.println(\" us\");\n  }\n}\n\nvoid loop() {\n}\n```\n\nSonuç:\n\n| Ayar | TWBR | SCL frekansı | 2 baytlık aktarım (hesap) |\n|---|---|---|---|\n| Varsayılan (`Wire.begin`) | 72 | 100 kHz | 180 µs |\n| `setClock(100000)` | 72 | 100 kHz | 180 µs |\n| `setClock(400000)` | 12 | 400 kHz | 45 µs |\n\nSüreye başlangıç ve bitiş koşulları dahil değildir; gerçek aktarım biraz daha uzun sürer. Bu değerler yazmaçtan okunan ayarlardan **hesaplandı**; gerçek bir devrede SCL hattını osiloskopla ya da lojik analizörle ölçerek doğrulamak gerekirdi. 400 kHz hızı kullanmak için hattaki bütün cihazların bunu desteklemesi gerekir; cihazın veri sayfasına bak.\n\n### SPI: dört kablo, çok hızlı\n**SPI**'da ortak üç hat (SCK, MOSI, MISO) ve her cihaz için bir **CS** hattı vardır (67. ders). Saat hattı olduğu için hız serbesttir ve I2C'den çok yüksektir. Uno'da en yüksek SCK, işlemci saatinin yarısıdır: 16 MHz ÷ 2 = 8 MHz. Hızı iki yolla seçersin: eski `SPI.setClockDivider(...)` ya da yeni `SPISettings(hız, bitSırası, mod)`. Program her ayarda SPI yazmaçlarından (`SPCR`, `SPSR`) gerçek SCK frekansını hesaplar.\n\n```cpp\n// sketch: spi_hiz\n#include <SPI.h>\n\nlong sckHz() {\n  const int bolen[] = {4, 16, 64, 128, 2, 8, 32, 64};\n  int dizin = (SPCR & 0x03) | ((SPSR & 0x01) ? 4 : 0);   // SPR1:SPR0 ve SPI2X\n  return F_CPU / bolen[dizin];\n}\n\nvoid rapor(const char* etiket) {\n  Serial.print(etiket);\n  Serial.print(\" -> SCK=\");\n  Serial.print(sckHz());\n  Serial.println(\" Hz\");\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  SPI.begin();\n\n  SPI.setClockDivider(SPI_CLOCK_DIV4);\n  rapor(\"DIV4 \");\n  SPI.setClockDivider(SPI_CLOCK_DIV16);\n  rapor(\"DIV16\");\n  SPI.setClockDivider(SPI_CLOCK_DIV128);\n  rapor(\"DIV128\");\n\n  const long istenen[] = {250000, 1000000, 3000000, 8000000, 20000000};\n  for (int i = 0; i < 5; i++) {\n    SPI.beginTransaction(SPISettings(istenen[i], MSBFIRST, SPI_MODE0));\n    Serial.print(\"istenen \");\n    Serial.print(istenen[i]);\n    Serial.print(\" Hz\");\n    rapor(\"\");\n    SPI.endTransaction();\n  }\n}\n\nvoid loop() {\n}\n```\n\nSonuç:\n\n| İstenen | Kullanılan SCK |\n|---|---|\n| `SPI_CLOCK_DIV4` | 4 MHz |\n| `SPI_CLOCK_DIV16` | 1 MHz |\n| `SPI_CLOCK_DIV128` | 125 kHz |\n| `SPISettings(250000, ...)` | 250 kHz |\n| `SPISettings(1000000, ...)` | 1 MHz |\n| `SPISettings(3000000, ...)` | **2 MHz** |\n| `SPISettings(8000000, ...)` | 8 MHz |\n| `SPISettings(20000000, ...)` | 8 MHz |\n\nDikkat: 3 MHz istediğinde 2 MHz'e düştü. Uno'da SCK yalnızca işlemci saatinin 2, 4, 8, ... katına bölünmüş hali olabilir (8, 4, 2, 1 MHz ...). `SPISettings` istediğin hızı aşmayan en yüksek değeri seçer. 20 MHz istenince de en fazla 8 MHz'e çıkılabilir.\n\nGerçek bir SPI aktarımı `SPI.transfer(değer)` ile yapılır; bu programda ona gerek duymadık çünkü yalnızca ayarlanan hızı okuyorduk.\n\n### Üçünü yan yana koy\nAşağıdaki tablo bu derste okuduğun sayılarla genel bilgiyi birleştirir.\n\n| | UART | I2C | SPI |\n|---|---|---|---|\n| Uno'da pin | 2 (RX, TX) | 2 (SDA, SCL) | 3 ortak (SCK, MOSI, MISO) + her cihaz için 1 CS |\n| Saat hattı | Yok (hız önceden anlaşılır) | Var | Var |\n| Bu derste okunan hız | 9600-38400 baud | 100 kHz, 400 kHz | 125 kHz - 8 MHz |\n| Bir baytın bit sayısı | 10 | 9 | 8 |\n| Cihaz sayısı | Genellikle 2 uç (birebir) | Aynı hatta çok cihaz, adresle (7 bit adres) | CS pini sayısı kadar |\n| Mesafe (genel bilgi) | TTL seviyesinde kısa; uzun mesafe için RS-485 gibi başka elektrik standartları | Kısa; kablo uzadıkça hat kapasitesi sorun çıkarır | Kısa; hız yükseldikçe kablo boyu daha önemli olur |\n\n100 baytı taşımak ne kadar sürer? Aşağıdaki süreler yukarıdaki bit sayılarından **hesaplandı** (başlangıç/bitiş payı ve adresleme dahil değil):\n\n| Yol | Hesap | Süre |\n|---|---|---|\n| UART, 9600 baud | 100 × 10 bit ÷ 9600 | yaklaşık 104 ms |\n| UART, 38400 baud | 100 × 10 bit ÷ 38400 | yaklaşık 26 ms |\n| I2C, 100 kHz | 100 × 9 bit ÷ 100000 | 9 ms |\n| I2C, 400 kHz | 100 × 9 bit ÷ 400000 | yaklaşık 2,3 ms |\n| SPI, 4 MHz | 100 × 8 bit ÷ 4000000 | 0,2 ms |\n| SPI, 8 MHz | 100 × 8 bit ÷ 8000000 | 0,1 ms |\n\nVeri kaydedicin üçünü birden kullanacak: **UART** ile bilgisayara satır yazar, **I2C** ile RTC ve LCD'yi okur/yazar, **SPI** ile SD karta dosya yazar. Her iş için doğru yol farklıdır: saat ve ekran az veri taşır, I2C'nin iki kablosu yeter. SD kart çok veri taşır, SPI'nin hızı gerekir. Bilgisayarla konuşmak için ise zaten UART vardır.\n\n### Dene\n- `uart_hiz` programında `BAYT` değerini 200 yap. Bit süresi değişiyor mu? Neden değişmemeli? D4 penceresinin süresi nasıl değişir?\n- `i2c_hiz` programında `ISTENEN` dizisindeki 100000 değerini 50000 yap. `TWBR` kaç oluyor, 2 baytlık aktarım kaç µs sürüyor? (Önce formülle hesapla, sonra ▶ ile karşılaştır.)\n- `spi_hiz` programındaki `istenen` dizisinde 250000 yerine 500000 yaz. Hangi SCK hızı çıkıyor? 16 MHz'in kaça bölünmüş hali olduğunu hesapla.\n\n### Sık yapılan hatalar\n- UART'ta iki ucun baud hızını farklı seçmek: gerçek bağlantıda ekranda anlamsız karakterler çıkar.\n- UART bağlantısında TX'i TX'e bağlamak: bir ucun TX'i diğer ucun RX'ine gitmeli.\n- I2C'de iki cihazın aynı adresi kullanması (örneğin RTC ve MPU6050, ikisi de 0x68).\n- I2C hattında hızı artırıp bütün cihazların bunu desteklediğini kontrol etmemek.\n- SPI'da CS hattını unutmak ya da aynı anda iki cihazın CS'ini LOW yapmak.\n- SPI'da ayarlanan hızı istenen hız sanmak: `SPISettings` istenen hıza en yakın **altındaki** değeri kullanır.\n- 3,3 V ve 5 V seviyelerini karıştırmak: bazı SPI cihazlarının (SD kart gibi) belgesini oku.",
          "question": "Bir odada dört sensör, bir LCD ve bir SD kartın var. Hangisini hangi protokolle bağlarsın? Neden RTC için I2C, SD kart için SPI daha mantıklı?",
          "explainerMd": "### Bu derste öğreneceklerin\n- UART, I2C ve SPI protokollerinin kaç hat kullandığını ve nasıl seçildiğini\n- UART'ta baud hızından bit süresini ve bayt hızını hesaplamayı\n- I2C ve SPI'da saat hızının ayarlandığını ve ayarlanan değerin istenenden farklı çıkabileceğini\n- Bir işe (RTC, LCD, SD kart, bilgisayar) uygun protokolü seçmeyi\n\n### Önceden bilmen gerekenler\n- Ders 9: Serial Monitor ve `Serial.begin`\n- Ders 33: I2C, `Wire` ve adresler\n- Ders 63 ve 67: SPI ile RC522 ve SD kart\n\n### Üç protokol, üç mantık\nBu hafta Arduino'na üç yolla konuştun. Hepsi veri taşır; fark hat sayısında, hızda ve cihazı seçme biçimindedir.\n\n| | UART | I2C | SPI |\n|---|---|---|---|\n| Hatlar | RX, TX | SDA, SCL | SCK, MOSI, MISO + her cihaza CS |\n| Saat hattı | Yok | Var | Var |\n| Cihaz seçimi | Birebir | Adres (7 bit) | CS pini |\n| Bayt başına bit | 10 | 9 | 8 |\n\n### UART: hız önceden anlaşılır\nUART'ta ortak saat hattı yoktur; iki taraf **baud hızını** (saniyede bit) önceden aynı seçmelidir. Bir bayt 1 başlangıç, 8 veri, 1 bitiş olmak üzere **10 bit** sürer. Bir bitin süresi `1 / baud`'dur. 9600 baud için bit yaklaşık 104 µs, bayt hızı baud ÷ 10 = 960 bayt/s'dir. Hızlar farklıysa karşı taraf anlamsız karakterler görür. Ayrıca bir ucun TX'i diğer ucun RX'ine gitmelidir.\n\n### I2C: adresle konuşma\nI2C'de saat hattı vardır ve hız `Wire.setClock()` ile seçilir (100 kHz ya da 400 kHz). Bir bayt 9 saat darbesi sürer (8 veri + 1 onay). Adres baytı ve bir veri baytı 18 darbe eder: 100 kHz'de 180 µs, 400 kHz'de 45 µs. Aynı iki kabloya RTC (0x68) ve LCD (0x27) birlikte bağlanır; iki cihaz aynı adresteyse çakışırlar. 400 kHz için hattaki bütün cihazların bunu desteklemesi gerekir.\n\n### SPI: hızlı, çok hat\nSPI'da saat hızı serbesttir ve yüksektir. Uno'da en yüksek SCK, işlemci saatinin yarısıdır: 16 MHz ÷ 2 = 8 MHz. Ayarlanabilen değerler 8, 4, 2, 1 MHz ... diye bölünerek iner. Yani 3 MHz istersen 2 MHz alırsın: kütüphane isteğini aşmayan en yüksek değeri seçer. Her cihaz için ayrı bir CS hattı gerekir ve aynı anda yalnız bir CS LOW olmalıdır.\n\n### Hangisini ne zaman?\nAz veri taşıyan, çok cihazlı işler (RTC, LCD) için I2C'nin iki kablosu yeter. Çok veri taşıyan işler (SD kart) için SPI'nın hızı gerekir. Bilgisayarla konuşmak için ise zaten UART vardır.\n\n### Özet\nUART iki hatlı ve saatsizdir; hız önceden anlaşılır. I2C iki hatlı, saatli ve adreslidir. SPI hızlıdır ama her cihaz için CS ister. Bit sayısı ve hızdan bir aktarımın süresi hesaplanabilir.",
          "concepts": [
            {
              "term": "UART ve baud hızı",
              "definition": "İki hatlı (RX, TX), saat hattı olmayan seri haberleşme; iki ucun baud hızı önceden aynı seçilmelidir.",
              "example": "9600 baud'da bir bit yaklaşık 104 µs, bir bayt (10 bit) yaklaşık 1,04 ms sürer.",
              "pitfall": "İki ucun baud hızını farklı seçmek; ekranda anlamsız karakterler çıkar."
            },
            {
              "term": "I2C: SDA, SCL ve adres",
              "definition": "İki hatlı, saat hattı olan protokol; aynı hattaki cihazlar adresle seçilir.",
              "example": "RTC (0x68) ve I2C LCD (0x27) aynı SDA ve SCL kablolarını paylaşır.",
              "pitfall": "İki cihazın aynı adresi kullanması (RTC ile MPU6050 gibi)."
            },
            {
              "term": "SPI ve CS hattı",
              "definition": "Üç ortak hat (SCK, MOSI, MISO) ve her cihaz için bir CS (seç) hattı kullanan, hızlı protokol.",
              "example": "SD kartın CS hattı D10'dur; CS'i LOW olan cihaz dinler.",
              "pitfall": "CS hattını unutmak ya da aynı anda iki cihazın CS'ini LOW yapmak."
            },
            {
              "term": "Bit süresi ve aktarım süresi",
              "definition": "Bir bitin süresi 1/hız; aktarım süresi = bit sayısı ÷ hız.",
              "example": "100 bayt × 10 bit ÷ 9600 baud ≈ 104 ms.",
              "pitfall": "Bayt başına 8 bit saymak; UART'ta başlangıç ve bitiş bitleriyle 10 bit eder."
            },
            {
              "term": "SPI hız bölücüsü",
              "definition": "Uno'da SCK, 16 MHz'in 2, 4, 8 ... katına bölünmüşüdür; SPISettings istenen hızı aşmayan en yüksek değeri seçer.",
              "example": "3 MHz istenince 2 MHz kullanılır.",
              "pitfall": "Ayarlanan hızı, istenen hızın aynısı sanmak."
            },
            {
              "term": "Wire.setClock()",
              "definition": "I2C saat hattının hızını (100 kHz, 400 kHz) belirler.",
              "example": "400 kHz'de adres + 1 veri baytı yaklaşık 45 µs sürer.",
              "pitfall": "Hızı artırıp hattaki bütün cihazların bunu desteklediğini kontrol etmemek."
            }
          ],
          "quiz": [
            {
              "id": "m4h7d69-q1",
              "kind": "numeric",
              "prompt": "UART 19200 baud'da, her bayt 10 bit sürerse 100 bayt göndermek yaklaşık kaç milisaniye sürer?",
              "answer": 52.1,
              "tolerance": 0.3,
              "unit": "ms",
              "explanation": "Toplam bit sayısı 100 × 10 = 1000. Süre = 1000 ÷ 19200 s ≈ 0,0521 s ≈ 52,1 ms. 8 bit varsaysaydın 41,7 ms bulurdun; bu yanlıştır, çünkü başlangıç ve bitiş bitleri de zamana girer.",
              "skills": [
                "serial-protocols"
              ]
            },
            {
              "id": "m4h7d69-q2",
              "kind": "numeric",
              "prompt": "I2C hızı 400 kHz. Bir adres baytı ve 4 veri baytı gönderiliyor. Her bayt 9 saat darbesi sürerse, başlangıç ve bitiş koşulları sayılmadan aktarım kaç mikrosaniye sürer?",
              "answer": 112.5,
              "tolerance": 0.5,
              "unit": "µs",
              "explanation": "Toplam bayt 1 + 4 = 5; saat darbesi 5 × 9 = 45. Bir darbe 1 ÷ 400000 s = 2,5 µs sürer. 45 × 2,5 = 112,5 µs.",
              "skills": [
                "serial-protocols"
              ]
            },
            {
              "id": "m4h7d69-q3",
              "kind": "predict-output",
              "prompt": "Uno'da (16 MHz) bu kod çalışınca SCK yaklaşık kaç Hz olur?\n\n```\nSPI.begin();\nSPI.beginTransaction(SPISettings(5000000, MSBFIRST, SPI_MODE0));\n```",
              "options": [
                "5000000 Hz",
                "8000000 Hz",
                "4000000 Hz",
                "2500000 Hz"
              ],
              "answer": 2,
              "explanation": "Uno'da SCK yalnızca 8, 4, 2, 1 MHz ... gibi değerler alabilir. SPISettings, istenen hızı aşmayan en yüksek değeri seçer: 5 MHz aşılmadan 4 MHz'e inilir. 8 MHz istenenden büyüktür; 5 MHz ve 2,5 MHz bu bölme dizisinde yoktur.",
              "skills": [
                "serial-protocols"
              ]
            },
            {
              "id": "m4h7d69-q4",
              "kind": "find-bug",
              "prompt": "Bilgisayardaki terminal 115200 baud'a ayarlı. Arduino'da aşağıdaki kod çalışıyor ve terminalde anlamsız karakterler görünüyor. Sorun nerede?\n\n```\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(\"Merhaba\");\n}\n```",
              "options": [
                "println yerine print kullanılmalı",
                "Baud hızı terminalle aynı değil; Serial.begin(115200) olmalı ya da terminal 9600'e ayarlanmalı",
                "setup() yerine loop() kullanılmalı",
                "Metin Türkçe olduğu için"
              ],
              "answer": 1,
              "explanation": "UART'ta saat hattı yoktur; iki taraf bit süresini baud hızından bilir. Arduino 9600, terminal 115200 beklerse bitleri yanlış zamanlarda örnekler ve anlamsız karakterler görürsün. print/println farkı yalnız satır sonudur.",
              "skills": [
                "serial-protocols",
                "prog-debug"
              ]
            },
            {
              "id": "m4h7d69-q5",
              "kind": "mcq",
              "prompt": "Veri kaydedicide RTC'den saat okunacak, bir LCD'ye yazılacak ve SD karta çok satır kaydedilecek. Hangi eşleştirme en mantıklıdır?",
              "options": [
                "RTC ve LCD için I2C (iki kablo, adresle), SD kart için SPI (hızlı)",
                "Üçü için de UART",
                "RTC için SPI, SD kart için I2C",
                "Hepsi için aynı CS hattı"
              ],
              "answer": 0,
              "explanation": "RTC ve LCD az veri taşır ve farklı adreslerle aynı iki kabloyu paylaşabilir; I2C uygundur. SD kart çok veri taşır, SPI'nın yüksek hızı gerekir. UART birebir bağlantı içindir; aynı CS hattını kullanan iki SPI cihaz birbirine karışır.",
              "skills": [
                "serial-protocols",
                "circuit-wiring"
              ]
            }
          ]
        },
        {
          "title": "Proje: Sıcaklık ve nem veri kaydedici",
          "durationMin": 35,
          "problem": "Sera, kuluçka makinesi, ilaç dolabı, müze vitrini: hepsinde sıcaklık ve nem günlerce izlenir, biri bakmadığı zaman bile. \"Salı gecesi 03:10'da ne oldu?\" sorusunun cevabı kayıt defterinde, yani bir veri dosyasındadır. Bu projede kendi veri kaydedicini yapacaksın: her 10 saniyede bir ölçüm alır, zaman damgalı bir CSV satırı üretir ve son ölçümü ekranda gösterir.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Bu modülün 3. haftası:** DHT22 ile sıcaklık ve nem (D5).\n- **Modül 3:** `millis()` ile bloklamayan kod (27. ders), butonla kenar algılama ve sıçrama önleme (8. ders), I2C LCD ekran (32. ve 33. dersler).\n- **Bu hafta:** RTC ile zaman (66), SD kart (67), CSV satırı ve zaman damgası (68), UART/I2C/SPI (69).\n\nKayıt cihazı RTC'nin saniyesi 10'a bölünen her an bir satır üretir: 08:30:10, 08:30:20, 08:30:30 ... Bu satırlar Serial'e gider. Butona (D2) basınca kayıt durur, tekrar basınca devam eder. Ekranda üstte son ölçüm, altta saat ve kayıt durumu görünür. SD karta yazan sürüm, projenin ayrı bir kopyasıdır; laboratuvarda SD kart modülü olmadığı için onu okuma örneği olarak incelersin.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| DHT22 (Tür: DHT22) | **DATA** → Uno **D5**, **VCC** → **5V**, **GND** → **GND** |\n| RTC (adres 0x68) | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → **5V**, **GND** → **GND** |\n| I2C LCD 16x2 (I2C adresi özelliği 0x27) | **SDA** → Uno **A4**, **SCL** → Uno **A5**, **VCC** → **5V**, **GND** → **GND** |\n| Buton \"kayıt aç/kapat\" | **A** → Uno **D2**, **B** → **GND** (`INPUT_PULLUP`) |\n\nSD kart modülü yalnız SD sürümü için gerekir (gerçek modülde CS → D10, MOSI → D11, MISO → D12, SCK → D13). Laboratuvarda SD parçası yok, bu yüzden devreye eklenmez.\n\nRTC ve LCD aynı iki kabloyu (SDA, SCL) paylaşır; adresleri (0x68 ve 0x27) farklı olduğu için karışmazlar (69. ders). Bu hafta D11, D12, D13 SD kart içindir; bu projede o pinlere LED bağlama. Bu devrede MPU6050 yok, 0x68 yalnız RTC'nin.\n\n### Program: Serial'e CSV yazan kaydedici\n```cpp\n// sketch: veri_kaydedici\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <RTClib.h>\n#include <DHT.h>\n\nconst int DHT_PIN = 5;\nconst int BUTON = 2;                          // kaydı durdur / sürdür\nconst uint32_t KAYIT_ARALIGI = 10;            // saniye\nconst unsigned long KONTROL_ARALIGI = 200;    // ms: RTC'ye bu sıklıkta bak\n\nRTC_DS3231 rtc;\nDHT dht(DHT_PIN, DHT22);\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nbool kayitAcik = true;\nbool oncekiBasili = false;\nunsigned long sonButon = 0;\nunsigned long sonKontrol = 0;\nuint32_t sonKayit = 0;                        // son satırın RTC saniyesi (unixtime)\nuint32_t sonEkran = 0;                        // ekranın son güncellendiği saniye\nfloat sonSicak = NAN;\nfloat sonNem = NAN;\n\nString ikiHane(int n) {\n  if (n < 10) return \"0\" + String(n);\n  return String(n);\n}\n\nString sayi(float x) {\n  char tampon[12];\n  dtostrf(x, 1, 1, tampon);\n  return String(tampon);\n}\n\nString satirOlustur(DateTime t, float sicak, float nem) {\n  String s;\n  s.reserve(40);\n  s += t.year();\n  s += '-';\n  s += ikiHane(t.month());\n  s += '-';\n  s += ikiHane(t.day());\n  s += ' ';\n  s += ikiHane(t.hour());\n  s += ':';\n  s += ikiHane(t.minute());\n  s += ':';\n  s += ikiHane(t.second());\n  s += ',';\n  if (!isnan(sicak)) s += sayi(sicak);\n  s += ',';\n  if (!isnan(nem)) s += sayi(nem);\n  return s;\n}\n\nvoid kaydet(const String& satir) {\n  Serial.println(satir);\n}\n\nvoid ekranYaz(DateTime t) {\n  lcd.setCursor(0, 0);\n  lcd.print(\"T:\");\n  if (isnan(sonSicak)) lcd.print(\"--\"); else lcd.print(sonSicak, 1);\n  lcd.print(\"C N:%\");\n  if (isnan(sonNem)) lcd.print(\"--\"); else lcd.print(sonNem, 1);\n  lcd.print(\"      \");\n  lcd.setCursor(0, 1);\n  lcd.print(ikiHane(t.hour()));\n  lcd.print(':');\n  lcd.print(ikiHane(t.minute()));\n  lcd.print(':');\n  lcd.print(ikiHane(t.second()));\n  lcd.print(kayitAcik ? \" KAYIT    \" : \" DURDU    \");\n}\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  Serial.begin(9600);\n  rtc.begin();\n  dht.begin();\n  lcd.init();\n  lcd.backlight();\n  Serial.println(\"zaman,sicaklik_C,nem_yuzde\");\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // Buton: basıldığı an kaydı aç/kapat (50 ms sıçrama koruması)\n  bool basili = (digitalRead(BUTON) == LOW);\n  if (basili && !oncekiBasili && simdi - sonButon > 50) {\n    sonButon = simdi;\n    kayitAcik = !kayitAcik;\n    sonEkran = 0;                             // ekranı hemen yenile\n  }\n  oncekiBasili = basili;\n\n  if (simdi - sonKontrol >= KONTROL_ARALIGI) {\n    sonKontrol = simdi;\n    DateTime t = rtc.now();\n    uint32_t u = t.unixtime();\n\n    // RTC saniyesi aralığa tam bölünüyorsa ve bu saniye daha yazılmadıysa: satır üret\n    if (kayitAcik && u % KAYIT_ARALIGI == 0 && u != sonKayit) {\n      sonKayit = u;\n      sonSicak = dht.readTemperature();\n      sonNem = dht.readHumidity();\n      kaydet(satirOlustur(t, sonSicak, sonNem));\n    }\n\n    if (u != sonEkran) {\n      sonEkran = u;\n      ekranYaz(t);\n    }\n  }\n}\n```\n\nSeri monitörde şuna benzer bir çıktı görürsün (laboratuvarın RTC'si 2026-01-01 00:00:00'dan başladığı için satırlar `2026-01-01 00:00:10`, `2026-01-01 00:00:20` ... diye akar):\n\n```\nzaman,sicaklik_C,nem_yuzde\n2026-03-14 08:30:10,23.5,55.0\n2026-03-14 08:30:20,23.5,55.0\n2026-03-14 08:30:30,23.5,55.0\n```\n\nLCD'de üst satırda `T:23.5C N:%55.0`, alt satırda `08:30:34 KAYIT` gibi bir görüntü olur.\n\n### Program: SD karta da yazan sürüm\nAşağıdaki program aynı kaydedicidir. Tek fark `kaydet()` fonksiyonu: satırı Serial'e yazmanın yanında SD karta da ekler. `setup()` içinde de SD başlatılır; dosya yeniyse başlık satırı yazılır. SD kart yoksa ya da yazma başarısızsa program çalışmaya devam eder ve Serial'e uyarı yazar.\n\n```cpp\n// sketch: veri_kaydedici_sd\n#include <Wire.h>\n#include <SPI.h>\n#include <SD.h>\n#include <LiquidCrystal_I2C.h>\n#include <RTClib.h>\n#include <DHT.h>\n\nconst int DHT_PIN = 5;\nconst int SD_CS = 10;\nconst char DOSYA_ADI[] = \"VERI.CSV\";          // 8.3 kuralı\nconst int BUTON = 2;                          // kaydı durdur / sürdür\nconst uint32_t KAYIT_ARALIGI = 10;            // saniye\nconst unsigned long KONTROL_ARALIGI = 200;    // ms: RTC'ye bu sıklıkta bak\n\nRTC_DS3231 rtc;\nDHT dht(DHT_PIN, DHT22);\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nbool kayitAcik = true;\nbool oncekiBasili = false;\nunsigned long sonButon = 0;\nunsigned long sonKontrol = 0;\nuint32_t sonKayit = 0;                        // son satırın RTC saniyesi (unixtime)\nuint32_t sonEkran = 0;                        // ekranın son güncellendiği saniye\nfloat sonSicak = NAN;\nfloat sonNem = NAN;\nbool sdHazir = false;\n\nString ikiHane(int n) {\n  if (n < 10) return \"0\" + String(n);\n  return String(n);\n}\n\nString sayi(float x) {\n  char tampon[12];\n  dtostrf(x, 1, 1, tampon);\n  return String(tampon);\n}\n\nString satirOlustur(DateTime t, float sicak, float nem) {\n  String s;\n  s.reserve(40);\n  s += t.year();\n  s += '-';\n  s += ikiHane(t.month());\n  s += '-';\n  s += ikiHane(t.day());\n  s += ' ';\n  s += ikiHane(t.hour());\n  s += ':';\n  s += ikiHane(t.minute());\n  s += ':';\n  s += ikiHane(t.second());\n  s += ',';\n  if (!isnan(sicak)) s += sayi(sicak);\n  s += ',';\n  if (!isnan(nem)) s += sayi(nem);\n  return s;\n}\n\nbool sdyeYaz(const String& satir) {\n  File dosya = SD.open(DOSYA_ADI, FILE_WRITE);\n  if (!dosya) return false;\n  dosya.println(satir);\n  dosya.close();                              // kapatınca veri karta yazılır\n  return true;\n}\n\nvoid kaydet(const String& satir) {\n  Serial.println(satir);\n  if (sdHazir && !sdyeYaz(satir)) {\n    Serial.println(\"UYARI: SD'ye yazilamadi\");\n  }\n}\n\nvoid ekranYaz(DateTime t) {\n  lcd.setCursor(0, 0);\n  lcd.print(\"T:\");\n  if (isnan(sonSicak)) lcd.print(\"--\"); else lcd.print(sonSicak, 1);\n  lcd.print(\"C N:%\");\n  if (isnan(sonNem)) lcd.print(\"--\"); else lcd.print(sonNem, 1);\n  lcd.print(\"      \");\n  lcd.setCursor(0, 1);\n  lcd.print(ikiHane(t.hour()));\n  lcd.print(':');\n  lcd.print(ikiHane(t.minute()));\n  lcd.print(':');\n  lcd.print(ikiHane(t.second()));\n  lcd.print(kayitAcik ? \" KAYIT    \" : \" DURDU    \");\n}\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  Serial.begin(9600);\n  rtc.begin();\n  dht.begin();\n  lcd.init();\n  lcd.backlight();\n  Serial.println(\"zaman,sicaklik_C,nem_yuzde\");\n\n  sdHazir = SD.begin(SD_CS);\n  if (!sdHazir) {\n    Serial.println(\"UYARI: SD kart yok, yalniz Serial'e yaziliyor\");\n  } else if (!SD.exists(DOSYA_ADI)) {\n    sdyeYaz(\"zaman,sicaklik_C,nem_yuzde\");    // dosya yeniyse başlığı yaz\n  }\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // Buton: basıldığı an kaydı aç/kapat (50 ms sıçrama koruması)\n  bool basili = (digitalRead(BUTON) == LOW);\n  if (basili && !oncekiBasili && simdi - sonButon > 50) {\n    sonButon = simdi;\n    kayitAcik = !kayitAcik;\n    sonEkran = 0;                             // ekranı hemen yenile\n  }\n  oncekiBasili = basili;\n\n  if (simdi - sonKontrol >= KONTROL_ARALIGI) {\n    sonKontrol = simdi;\n    DateTime t = rtc.now();\n    uint32_t u = t.unixtime();\n\n    // RTC saniyesi aralığa tam bölünüyorsa ve bu saniye daha yazılmadıysa: satır üret\n    if (kayitAcik && u % KAYIT_ARALIGI == 0 && u != sonKayit) {\n      sonKayit = u;\n      sonSicak = dht.readTemperature();\n      sonNem = dht.readHumidity();\n      kaydet(satirOlustur(t, sonSicak, sonNem));\n    }\n\n    if (u != sonEkran) {\n      sonEkran = u;\n      ekranYaz(t);\n    }\n  }\n}\n```\n\nSD kütüphanesi Uno için ucuz değildir. Aynı programın derleme çıktısı SD'siz sürümde yaklaşık 570 bayt, SD'li sürümde yaklaşık 1290 bayt global değişken (RAM) kullandığını gösterdi. Uno'da toplam 2048 bayt SRAM var (34. ders). Flash kullanımı da yaklaşık 13 KB'dan 21 KB'a çıktı. Sayılar kütüphane ve derleyici sürümüne göre değişir.\n\nLaboratuvarda SD modülü olmadığı için bu sürümü çalıştırırsan `SD.begin` kart bulamayıp takılır; başlık satırından sonra ekran ve kayıt ilerlemez. Gerçek bir kartta `SD.begin` `false` döner ve program yalnız uyarı yazıp çalışmayı sürdürür.\n\n### Nasıl çalışıyor?\n1. `loop()` hiç `delay` kullanmaz (27. ders). Buton her turda, RTC ise 200 ms'de bir okunur.\n2. Satır üretme koşulu **RTC saniyesine** bağlıdır: `u % 10 == 0`, yani `unixtime` (1970'ten beri geçen saniye) 10'a tam bölünüyorsa. Bu yüzden satırlar `millis()` kaymasından etkilenmeden 08:30:10, 08:30:20 gibi tam 10 saniyelik adımlarla üretilir. `u != sonKayit` aynı saniye içinde 200 ms'lik turlarda satırın tekrar tekrar yazılmasını engeller.\n3. Her satırda DHT22 yeniden okunur ve `sonSicak`, `sonNem` güncellenir. Ekran bu \"son ölçümü\" gösterir; saat satırı her saniye yenilenir.\n4. `satirOlustur` 68. dersteki aynı fonksiyondur. Satır biçimi hiç değişmez; `kaydet()` fonksiyonu satırın nereye gideceğine karar verir.\n5. Buton, 8. dersteki kenar algılamayla çalışır: yalnız \"basılmadı → basıldı\" geçişi sayılır, 50 ms içindeki tekrar basışlar yok sayılır. Kayıt durunca ekranda `DURDU` yazar ve satır üretilmez.\n6. DHT okuması başarısız olursa `NaN` gelir; satır yine yazılır, sensör alanları boş kalır, ekranda `--` görünür.\n\nBir not: ekran ve kayıt için RTC'yi aynı turda tek kez okuyoruz (`t`). Bu yüzden aynı turda yazılan satır ile ekrandaki saat aynı anı gösterir.\n\n### Dene\n- `KAYIT_ARALIGI`'nı 30 yap. Satırlar hangi saniyelerde çıkıyor? 7 yaparsan satırlar saniyenin kaçında çıkıyor? 60'ı tam bölen değerlerde satırlar dakikanın hep aynı saniyelerine denk gelir; 7'de neden gelmez?\n- Ekranın alt satırına saati değil tarihi (`14.03`) yazdır. Hangi satırı değiştireceksin?\n- DHT22 okuması başarısız olduğunda ne olur? Programı ■ ile durdur, DHT'nin DATA kablosunu kaldır, yeniden ▶'e bas. Ekranda ve CSV'de ne görüyorsun?\n- `veri_kaydedici_sd` içinde `DOSYA_ADI`'nı 8.3 kuralına uymayan bir adla değiştirsen (gerçek kartta) `sdyeYaz` ne döndürür ve program Serial'e hangi uyarıyı yazar? Kodu okuyarak bul.\n- Sıcaklık 30 dereceyi geçince çalan bir buzzer uyarısı (D8) ekle: laboratuvara bir buzzer ekle, kodu yaz, DHT'nin sıcaklığını canlı olarak 31 °C yap. Hangi değişkeni kontrol edeceksin?\n- Butona basıp kaydı durdur, 30 saniye bekle, tekrar bas. Ekranın alt satırı ve CSV'deki zaman damgaları ne gösteriyor?\n\n### Sık yapılan hatalar\n- `delay(10000)` ile 10 saniye beklemek: buton ve ekran 10 saniye boyunca donar. Bunun yerine RTC ya da `millis()` kullan.\n- RTC'yi `loop()`'un her turunda okumak ya da hiç okumamak: çok sık okumak I2C hattını gereksiz meşgul eder, çok seyrek okumak saniyeyi kaçırır.\n- Aynı saniyede satırı birden çok kez yazmak: `u != sonKayit` kontrolünü unutursan 200 ms'lik her turda bir satır çıkar.\n- RTC saatini ayarlamayı unutmak: satırlardaki zaman yanlış çıkar. Gerçek modülde 66. dersteki `lostPower()` kontrolünü ekle; laboratuvarda saat 2026-01-01'den başlar, istersen `rtc.adjust` ile kur.\n- SD'ye yazarken dosyayı kapatmamak ya da (gerçek cihazda) kartı yazma sırasında çıkarmak (67. ders).\n- D11, D12, D13 pinlerine LED bağlayıp SD kartı da kullanmak: bu pinler SPI hatlarıdır.\n- LCD adresinin 0x27 olduğunu varsaymak: çalışmazsa adres tarama programıyla (33. ders) bul; laboratuvarda LCD'nin \"I2C adresi\" özelliği 0x27 mi diye bak.\n- DHT22'yi iki saniyeden sık okumak.",
          "question": "Kaydedicini üç gün çalıştırdın ve elektrik bir gece kesildi. Sabah dosyada ne olduğunu, saatin doğru olup olmadığını ve kesinti sırasındaki ölçümlerin ne olacağını düşün. Cihazı güvenilir yapmak için neyi değiştirirdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Önceki derslerin parçalarını (DHT22, RTC, LCD, buton, CSV) tek bir projede birleştirmeyi\n- Kayıt zamanını `millis()` yerine RTC saniyesine bağlamayı\n- Aynı saniyede satırın tekrar yazılmasını bayrakla engellemeyi\n- Okuma başarısız olduğunda (`NaN`) cihazın çalışmaya devam etmesini sağlamayı\n\n### Önceden bilmen gerekenler\n- Ders 46: DHT22 (D5) ile sıcaklık ve nem\n- Ders 27 ve 8: `millis()` ile bloklamayan kod, butonla kenar algılama\n- Ders 32 ve 33: I2C LCD\n- Dersler 66, 68 ve 67: RTC, CSV satırı, SD'ye aç-yaz-kapat\n\n### Proje ne yapıyor?\nCihaz her 10 saniyede bir ölçüm alır, zaman damgalı bir CSV satırı üretir (Serial'e, SD sürümünde karta da yazar) ve son ölçümü LCD'de gösterir. Bir buton (D2) kaydı durdurup sürdürür. Önce planı tabloya dök:\n\n| Görev | Parça | Nasıl |\n|---|---|---|\n| Zaman | RTC (I2C, 0x68) | `rtc.now()` |\n| Ölçüm | DHT22 (D5) | `readTemperature()`, `readHumidity()` |\n| Gösterim | I2C LCD (0x27) | Üstte ölçüm, altta saat ve durum |\n| Kontrol | Buton (D2, `INPUT_PULLUP`) | Basılınca kaydı aç/kapat |\n| Kayıt | Serial (SD sürümünde SD) | `satirOlustur()` |\n\nRTC ve LCD aynı iki kabloyu (A4, A5) paylaşır; adresleri farklı olduğu için karışmazlar.\n\n### Zamanı RTC belirler\n`delay(10000)` kullanırsan bu sürede buton ve ekran donar. `millis()` ile 10 saniye saymak daha iyidir ama zamanla kayabilir. Bu projede satır, RTC'nin `unixtime()` değeri (1970'ten beri geçen saniye) 10'a tam bölündüğünde üretilir. Böylece satırlar 08:30:10, 08:30:20 gibi tam adımlarla çıkar. RTC her 200 ms'de bir okunur; bu, tek bir saniyeyi kaçırmamak için yeterince sıktır. 200 ms'lik her turda koşul doğru kalacağı için `u != sonKayit` bayrağı gerekir. Onsuz aynı saniyede beş satır yazılır.\n\n### Hata olursa durma\nDHT okuması başarısız olunca `NaN` döner. Satırı yine yazarsın: zaman damgası kalır, sensör alanları boş olur. Ekranda `--` görünür. SD sürümünde kart yoksa ya da yazma başarısızsa cihaz uyarıyı Serial'e yazar ve çalışmaya devam eder. Kayıt cihazı ölçüm alamasa bile \"ölçüm alamadım\" bilgisini kayda geçirmelidir.\n\n### Mimari: yalnız `kaydet()` değişir\nSerial sürümü ile SD sürümü arasındaki tek fark `kaydet()` fonksiyonudur. Satır biçimi hiç değişmez. SD kütüphanesi RAM'i ciddi biçimde artırır; Uno'da toplam SRAM 2048 bayttır, bu yüzden derleme çıktısındaki RAM kullanımına bakmalısın.\n\n### Özet\nVeri kaydedici; RTC zamanını, DHT22 ölçümünü, CSV satırını ve butonlu kontrolü birleştirir. Kayıt zamanı RTC saniyesine bağlanır, aynı saniyede tekrar yazmayı bir bayrak önler. Okuma hatası kaydı durdurmaz; alan boş yazılır. Satırın nereye gideceğine yalnız `kaydet()` karar verir.",
          "concepts": [
            {
              "term": "RTC saniyesine bağlı kayıt",
              "definition": "Satır, RTC'nin unixtime değeri aralığa tam bölündüğünde üretilir; böylece zamanlar millis() kaymasından bağımsız, hep aynı adımlarla çıkar.",
              "example": "unixtime % 10 == 0 olduğunda 08:30:10, 08:30:20, 08:30:30 satırları üretilir.",
              "pitfall": "Kayıt aralığını delay() ile beklemek; buton ve ekran bu sürede donar."
            },
            {
              "term": "unixtime()",
              "definition": "1970'ten beri geçen saniye sayısı; tek bir sayıyla zamanı ifade eder.",
              "example": "u % 10 == 0 koşulu, saniyesi 10'a bölünen her anı yakalar.",
              "pitfall": "Saniye değerini (0-59) tek başına kullanmak; aralık 60'a bölünmüyorsa (7 gibi) dakika geçişinde düzensiz adımlar çıkar."
            },
            {
              "term": "Tekrar önleme bayrağı (sonKayit)",
              "definition": "Son satırın yazıldığı saniyeyi saklayan değişken; aynı saniyede ikinci satırı engeller.",
              "example": "u != sonKayit koşulu, 200 ms'lik beş turun yalnız birinde satır yazdırır.",
              "pitfall": "Bayrağı unutmak: her 200 ms'lik turda aynı zaman damgalı bir satır çıkar."
            },
            {
              "term": "Kenar algılama ile aç/kapat",
              "definition": "Butona basıldığı an (\"basılmadı\"dan \"basıldı\"ya geçiş) bir durum değişkenini tersler.",
              "example": "kayitAcik = !kayitAcik; kayıt açıkken kapanır, kapalıyken açılır.",
              "pitfall": "Basılı olduğu sürece her turda durumu ters çevirmek; kayıt kontrolsüz açılıp kapanır."
            },
            {
              "term": "Hataya dayanıklı kayıt",
              "definition": "Okuma başarısız olsa bile zaman damgası yazılır, sensör alanları boş kalır; cihaz çalışmaya devam eder.",
              "example": "DHT'nin DATA kablosu çıkarsa satır 2026-01-01 00:00:20,, olarak yazılır.",
              "pitfall": "Okuma başarısız olunca program durdurmak (while(true) {}) ya da satırı hiç yazmamak."
            },
            {
              "term": "kaydet() ayrımı",
              "definition": "Satırı üretmek ile satırı bir yere yazmak ayrı fonksiyonlardadır; yazılan yer değişince satır biçimi değişmez.",
              "example": "Serial sürümünden SD sürümüne geçerken yalnız kaydet() içine SD yazma eklenir.",
              "pitfall": "Biçimlemeyi her yazma yerine ayrı ayrı kopyalamak; iki yerde farklı satır çıkar."
            }
          ],
          "quiz": [
            {
              "id": "m4h7d70-q1",
              "kind": "numeric",
              "prompt": "Kayıt cihazı her 10 saniyede bir satır yazıyor ve kesintisiz çalışıyor. 1 saatte kaç veri satırı yazılır?",
              "answer": 360,
              "unit": "satır",
              "explanation": "Bir saat 3600 saniyedir. 3600 ÷ 10 = 360 satır. Bu hesap, kartın ne kadar sürede dolacağını tahmin etmek ve kayıt aralığını seçmek için kullanılır.",
              "skills": [
                "data-logging",
                "prog-planning"
              ]
            },
            {
              "id": "m4h7d70-q2",
              "kind": "mcq",
              "prompt": "KAYIT_ARALIGI 20 yapılırsa, RTC saniyesine bağlı (unixtime % 20 == 0) bu kayıt mantığında satırlar dakikanın hangi saniyelerinde üretilir?",
              "options": [
                "10, 30, 50",
                "5, 25, 45",
                "0, 20, 40",
                "0 ve 30"
              ],
              "answer": 2,
              "explanation": "60 saniye 20'ye tam bölünür; bu yüzden her dakikada aynı üç saniye çıkar: 0, 20 ve 40 (08:30:20, 08:30:40, 08:31:00 gibi). 0 ve 30 aralığı 30 saniye olurdu; 10, 30, 50 ise 20'ye bölünen saniyeler değildir.",
              "skills": [
                "data-logging",
                "rtc-time"
              ]
            },
            {
              "id": "m4h7d70-q3",
              "kind": "find-bug",
              "prompt": "Kayıt aralığı 20 saniye. Ama RTC her 200 ms'de bir okunuyor ve seri monitörde aynı zaman damgalı satır 5 kez çıkıyor. Hangi koşul eksik?\n\n```\nif (kayitAcik && u % KAYIT_ARALIGI == 0) {\n  kaydet(satirOlustur(t, sicak, nem));\n}\n```",
              "options": [
                "kayitAcik kontrolü gereksiz",
                "satirOlustur yerine Serial.println çağrılmalı",
                "u != sonKayit kontrolü eksik; aynı saniye içinde beş tur da koşulu sağlıyor",
                "KAYIT_ARALIGI float olmalı"
              ],
              "answer": 2,
              "explanation": "RTC saniyesi 20'ye bölündüğünde bu saniye 1000 ms sürer ve 200 ms'lik turlar bu sürede 5 kez koşulu doğru bulur. u != sonKayit gibi bir bayrak aynı saniyede satırı bir kez yazdırır. Diğer değişiklikler tekrarı engellemez.",
              "skills": [
                "data-logging",
                "prog-debug"
              ]
            },
            {
              "id": "m4h7d70-q4",
              "kind": "mcq",
              "prompt": "Kayıt aralığını delay(10000) ile beklemek bu projede neden kötü bir fikirdir?",
              "options": [
                "10 saniye boyunca buton okunmaz ve ekran güncellenmez; cihaz tepkisiz kalır",
                "delay() yalnız 1000 ms'e kadar çalışır",
                "RTC bu sırada sıfırlanır",
                "CSV satırı bozulur"
              ],
              "answer": 0,
              "explanation": "delay() programı durdurur: butona basılsa bile fark edilmez, LCD'deki saat donar. Çözüm RTC saniyesi ya da millis() ile bloklamayan kontroldür (ders 27). delay() 1000 ms ile sınırlı değildir; RTC ve CSV satırı da etkilenmez.",
              "skills": [
                "prog-timing",
                "data-logging"
              ]
            },
            {
              "id": "m4h7d70-q5",
              "kind": "mcq",
              "prompt": "Kaydedici çalışırken DHT22'nin DATA kablosu çıkıyor ve okuma NaN dönüyor. Dersteki tasarımda kayıt dosyasında ne görünür?",
              "options": [
                "Zaman damgası yazılır, sıcaklık ve nem sütunları boş bırakılır",
                "Cihaz durur ve hiçbir satır yazılmaz",
                "Sıcaklık sütununa 0 yazılır",
                "Önceki ölçüm olduğu gibi tekrarlanır"
              ],
              "answer": 0,
              "explanation": "satirOlustur, NaN gelen alanı yazmaz ve boş bırakır: 2026-03-14 08:30:20,, gibi bir satır çıkar. Böylece kayıtta ölçümün neden eksik olduğu görünür ve sütunlar kaymaz. Sıfır yazmak, gerçek 0 °C ölçümüyle karışırdı.",
              "skills": [
                "data-logging",
                "prog-debug"
              ]
            }
          ]
        }
      ]
    },
    {
      "title": "Simülasyondan gerçeğe",
      "project": "Akıllı oda",
      "guideMd": "### Hafta hedefleri\nBu haftanın sonunda öğrenci:\n1. Laboratuvarın hangi gerçek dünya etkilerini modellediğini (ADC basamağı, zamanlama, sensör besleme eşikleri), hangilerini modellemediğini (gürültü, buton sıçraması, 5V çökmesi) ayırt edebilir.\n2. Bir ADC basamağının yaklaşık 4,89 mV olduğunu söyler; ortalama ve histerezisle gürültülü okumadan kararlı bir karar çıkarır.\n3. Buton sıçramasını kararlı kalma süresiyle (debounce) ve `delay()` yüzünden kaçan basışı `millis()` ile giderir.\n4. Besleme değişince analog sensör sayılarının kaydığını bilir, `map` ve `constrain` ile iki nokta kalibrasyonu yapar ve sessiz kalan sensörde çıkışı güvenli tarafta bırakır.\n5. Hatayı alttan üste (fiziksel, adres, kimlik, veri) arar; XOR checksum ile bozuk çerçeveyi yakalar.\n6. PIR, LDR, DHT22, röle, LCD ve butonu tek bir durum makinesinde birleştirerek Akıllı oda projesini kurar.\n\n### Haftanın planı\nHafta beş derstir; her ders yaklaşık 30-35 dakikadır. Aşağıdaki plan günde bir ders içindir. Laboratuvarın \"yalan söylediği\" yerler bu hafta bilerek öğretilir; öğrenciye \"laboratuvarda gördün mü, yoksa kodla mı taklit ettik?\" sorusunu sor.\n\n| Gün | Ders | Süre | Ne yapılır |\n|---|---|---|---|\n| 1 | Laboratuvar kusursuzdur: ADC basamağı ve gürültü | ~30 dk | Modellenen ve modellenmeyen etkiler tablosunu oku, ADC basamağını ve sahte gürültüyü dene, tek eşik ile histerezisi karşılaştır. |\n| 2 | Buton sıçraması ve tepki gecikmesi | ~30 dk | Sıçramalı sayacı ve debounce'u çalıştır, `delay` ve `millis` sürümlerinin tepkisini karşılaştır. |\n| 3 | Besleme düşmesi ve kalibrasyon | ~30 dk | Toprak nemini iki nokta ile kalibre et, VCC'yi 3V3'e al, pin yükünü sanal ölçümle oku, `YOK` durumunu üret. |\n| 4 | Hata ayıklama vakası: \"ping çalışıyor ama veri yok\" | ~30 dk | Dört katmanlı testi çalıştır, hata modlarını tek tek üret, XOR çerçevesini elle doğrula. |\n| 5 | Bitirme projesi: Akıllı oda | ~35 dk | Devreyi kur, programı yükle, \"Uçtan uca denemek\" adımlarını sırayla uygula, proje ölçütüyle değerlendir. |\n\n### Ön koşul kontrolü\nBu hafta Modül 3 ve Modül 4'ün ilk yedi haftasından bilgi gerekir. Başlamadan önce kontrol et:\n- `analogRead`, `map`, `constrain` ve yumuşatma (11. ve 14. dersler) biliniyor mu?\n- Buton, `INPUT_PULLUP` ve debounce (6. ve 8. dersler) biliniyor mu?\n- `millis()` ile bloklamayan kod ve durum makinesi (27. ve 28. dersler) yapılabiliyor mu?\n- PIR, DHT22, LDR ve röle ayrı ayrı kullanıldı mı (Hafta 2-4 ve 24. ders)? Proje bunların hepsini birleştirir.\n- I2C ve LCD (32. ve 33. dersler) kullanımı hatırlanıyor mu?\n\n### Kavram haritası\n- **Sınırlar:** laboratuvar neyi modeller → ADC basamağı, zamanlama, sensör besleme eşiği → neyi modellemez → gürültü, sıçrama, 5V çökmesi, referans kayması\n- **Gürültüye karşı:** ortalama (karekök N) → histerezis (iki eşik) → bant, gürültü genliğinden geniş\n- **Zamana karşı:** sıçrama → kararlı kalma süresi (debounce) → `delay` tuzağı → `millis()`\n- **Güce karşı:** AO = VCC x oran → koşula bağlı kalibrasyon → `map` + `constrain` → pin iç direnci → brown-out → fail-safe\n- **Hata ayıklamaya karşı:** fiziksel → adres → kimlik → veri makullüğü → XOR checksum\n- **Proje:** girdi → durum → çıkış → ISINMA / BOS / DOLU / KAPALI → iki histerezis → güvenli varsayılan\n\n### Sık yapılan hatalar\n- **\"Laboratuvarda sorun yoktu, gerçekte de olmaz\" demek.** Gürültü, sıçrama ve güç çökmesi laboratuvarda yoktur.\n- **Histerezis aralığını gürültüden dar seçmek.** Titreme geri gelir.\n- **Ortalamayı gereksiz büyütmek.** 64 okuma 64 kat iştir; kazanç karekökle artar.\n- **Debounce'ta bırakma sıçramasını unutmak.** Bekleme iki yönde de çalışmalıdır.\n- **Kararlı kalma süresini çok uzun seçmek.** Hızlı basışlar kaçar.\n- **`delay()` içinde butonu dinlemeyi beklemek.** Kısa basış iki okuma arasında kalır.\n- **`constrain` unutmak.** Kalibre edilmiş yüzde 0'ın altına ya da 100'ün üstüne çıkar.\n- **Kalibrasyonu başka beslemede kullanmak.** AO gerilimi VCC ile orantılıdır.\n- **`pulseIn` 0 döndüğünde \"mesafe 0\" sanmak.** Cevap yoktur; çıkışı güvenli tarafta bırak.\n- **Adres cevabını \"cihaz doğru\" saymak.** Kimlik ve veri katmanları ayrı sınanır.\n- **Fanı kartın 5V ucundan beslemek.** Gerçek devrede kart sıfırlanabilir; laboratuvar göstermez.\n- **Akıllı odada PIR ısınmasını hesaba katmamak.** Açılışta oda dolu sanılır.\n\n### Hafta sonu tekrarı\n1. Her dersin kavram kartlarına bir kez daha bak ve \"sık yapılan yanlış\" satırlarını yüksek sesle oku.\n2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.\n3. Laboratuvarın modellediği ve modellemediği etkileri kendi cümlelerinle bir tabloya yaz; her satıra gerçek devrede kullanacağın önlemi ekle.\n4. Hesabı elle yap: ADC basamağı kaç mV? 3V3 ile beslenen toprak nemi modülünde nem 0,5 iken ham değer ne olur?\n5. Akıllı oda programının üç durumunu kağıda çiz ve her oktaki koşulu yaz.\n\nHafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.\n\n### Proje değerlendirme ölçütü (Akıllı oda)\n| Ölçüt | Gelişmeli | Yeterli | İleri |\n|---|---|---|---|\n| Devre | Birkaç parça bağlı değil ya da pinler karışmış | Tüm parçalar tabloya göre doğru bağlı | Bağlantılar düzenli ve her parçanın görevi açıklanıyor |\n| Durum makinesi | Durumlar yok, bayraklar dağınık | ISINMA, BOS, DOLU ve KAPALI durumları doğru geçiyor | Durumlar tablo ve kodla birebir uyuşuyor, yeni durum eklenmiş |\n| Eşikler | Tek eşik, lamba ya da fan titriyor | Işık ve fan histerezisle karar veriyor | Eşikler denemeyle seçilmiş ve nedenleri açıklanıyor |\n| Güvenli davranış | DHT hatasında fan açık kalıyor | DHT hatasında fan kapalı ve LCD hata yazıyor | Başka sensör arızaları da ele alınmış |\n| Zamanlama | `delay` kullanıyor, buton ve PIR geç tepki veriyor | `millis()` ile her iş kendi zamanında | Süreler ve DHT aralığı gerekçesiyle seçilmiş |\n| Gerçek dünya farkı | Laboratuvar farkından söz etmiyor | Gürültü, sıçrama ve güç farkını söylüyor | Gerçek devre için kalibrasyon ve önlem listesi yazıyor |\n\n### Veli ve öğretmen notu\n- **Amaç.** Bu hafta yeni bir sensör öğrenilmez; öğrencinin \"çalışıyor\" sözünün ne kadar kanıta dayandığını sorgulaması hedeflenir. Laboratuvarın sınırlarını bilmek, gerçek devreye geçişin en önemli hazırlığıdır.\n- **Nasıl destek olunur?** Öğrenciye cevabı söylemek yerine şunu sor: \"Bunu laboratuvar gerçekten üretti mi, yoksa biz mi taklit ettik?\", \"Bu hatayı hangi katmanda arıyorsun?\", \"Sensör cevap vermezse çıkış ne olmalı?\"\n- **Süre.** Dersler dolu (30-35 dk). Aynı gün iki ders yerine aralıklı çalışmak kalıcılığı artırır.\n- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders gerçek kartla tekrarlanacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; motor, röle ve servo için ayrı güç kaynağı ve ortak GND kullanılır. Pil kullanılacaksa kısa devre ve ters bağlamaya dikkat edilir.\n- **Hyvex vakası.** 74. ders, Hyvex ekibinin staj programındaki bir vakaya dayanır; yalnızca programda yazılan bilgiler aktarılmıştır.\n- **İlerleme.** Dersin sonundaki mini test sonuçları \"İlerlemem\" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).",
      "lessons": [
        {
          "title": "Laboratuvar kusursuzdur: ADC basamağı ve gürültü",
          "durationMin": 30,
          "problem": "Laboratuvarda potansiyometreyi ortaya getirdin, eşik programın LED'i tam zamanında yaktı, hiç titremedi. Aynı kodu gerçek bir devreye koyan biri, ışık sabitken LED'in durmadan yanıp söndüğünü görüyor. Kod aynı, devre aynı. Fark nerede? Cevap: laboratuvar bilerek **temiz** bir dünya çiziyor. Bu hafta o temiz dünyanın neyi gizlediğini, hangi gerçek dünya etkilerini ise laboratuvarın gerçekten gösterdiğini ayıracaksın.",
          "contentMd": "### Laboratuvar neyi modeller, neyi modellemez?\nBu hafta bir kural koyuyoruz: bir etkiyi yalnızca laboratuvar **gerçekten** üretiyorsa \"laboratuvarda gördün\" diyeceğiz. Üretmiyorsa bunu açıkça yazacağız ve etkiyi kodla taklit edeceğiz.\n\n| Gerçek dünya etkisi | Laboratuvarda |\n|---|---|\n| ADC basamağı (10 bit, 1024 seviye) | **Modellenir.** Her gerilim en yakın basamağa yuvarlanır. |\n| Analog gürültü (kablo, güç hattı, ADC titremesi) | **Modellenmez.** Laboratuvarın gerilimleri kusursuz sabittir. |\n| ADC ofset, kazanç hatası, referans geriliminin kayması | **Modellenmez.** Referans tam 5,00 V'tur. |\n| Buton sıçraması | **Modellenmez** (72. ders). |\n| Zamanlama (`delay`, `millis`, `pulseIn` süresi) | **Modellenir.** Kod gerçek Uno komutlarıyla, 16 MHz hızında koşar. |\n| PIR ısınması | **Modellenir** (kısaltılmış; 75. ders). |\n| Sensörlerin en düşük besleme gerilimi | **Modellenir** (73. ders). |\n| 5 V hattının çökmesi, brown-out | **Modellenmez** (73. ders). |\n\nBu tablodaki \"Modellenmez\" satırlarının hepsi gerçek devrede seni bekliyor. Bu derste ilkiyle uğraşıyoruz: **gürültü** ve onunla birlikte **ADC basamağı**.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Potansiyometre | VCC → **5V**, SIG → **A0**, GND → **GND** |\n| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |\n| LED | A → direncin 2 ucu, K → **GND** |\n\n### 1) ADC basamağı: bu modellenir\n`analogRead` 0-5 V aralığını 1024 basamağa böler (11. ders). Bir basamak yaklaşık 5 V / 1023 = 4,9 mV eder. Aradaki gerilimler en yakın basamağa yuvarlanır. Bu sketch ham değeri milivolta çevirir:\n\n```cpp\n// sketch: adc_basamak\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = analogRead(A0);\n  float mv = ham * 5000.0 / 1023.0;\n  Serial.print(\"ADC=\");\n  Serial.print(ham);\n  Serial.print(\" mV=\");\n  Serial.println(mv, 1);\n  delay(500);\n}\n```\n\nPotansiyometre konumunu 0,51 yaptığında A0'daki gerilim 2,550 V olur. ADC 522 verir ve program 2551,3 mV yazar. Aradaki 1,3 mV'lik fark ölçüm hatası değil, **basamak yuvarlamasıdır**: 522. basamak 2551,3 mV'a denk gelir ve 2550 mV bu basamağa yuvarlanır. 1 mV'u ayırt eden bir ölçüm istiyorsan 10 bitlik ADC yetmez. Ayrıca konumu 0,01 oynattığında ADC yaklaşık 10 basamak atlar; aradaki basamaklar ancak gerilim daha ince ayarlanırsa görünür.\n\n### 2) Gürültü: bu modellenmez\nLaboratuvarda potansiyometreyi sabit bıraktığında ADC değeri **hiç** oynamaz. Gerçekte oynar: kablolar anten gibi çalışır, güç hattında dalgalanma vardır, ADC'nin kendisi de bir iki basamak titrer. ATmega328P'nin veri sayfası, ADC'nin mutlak doğruluğunu birkaç basamak (yaklaşık ±2) olarak verir; kesin sayı için kendi veri sayfasına bak.\n\nLaboratuvar gürültü üretmediği için biz **üreteceğiz**: okumaya kodla rastgele bir sayı ekleyeceğiz. Bu bir taklit; gerçek gürültünün şekli farklıdır, ama kodunun neye dayanması gerektiğini görmene yeter. `random(-8, 9)` -8 ile +8 arasında (9 dahil değil) bir tam sayı verir. `randomSeed` ile başlangıcı sabitlediğimiz için her çalıştırmada aynı dizi çıkar.\n\nAşağıdaki sketch, gürültülü tek okumayı ve 16 okumanın ortalamasını yan yana yazar (14. dersteki yumuşatma fikri):\n\n```cpp\n// sketch: gurultu_ortalama\nconst int SENSOR = A0;\n\nint gurultuluOku() {\n  return analogRead(SENSOR) + random(-8, 9);   // sahte gürültü: ±8 basamak\n}\n\nint ortalama(int adet) {\n  long toplam = 0;\n  for (int i = 0; i < adet; i++) {\n    toplam += gurultuluOku();\n  }\n  return toplam / adet;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  randomSeed(42);\n}\n\nvoid loop() {\n  Serial.print(\"Tek=\");\n  Serial.print(gurultuluOku());\n  Serial.print(\" Ort16=\");\n  Serial.println(ortalama(16));\n  delay(300);\n}\n```\n\nPotansiyometre 0,50'de sabitken `Tek` her satırda yaklaşık 503 ile 519 arasında dolaşır, `Ort16` ise çok daha dar bir aralıkta kalır. Ortalama gürültüyü yok etmez, küçültür: 16 okumada gürültü yaklaşık 4 kat azalır (karekök kuralı). Bedeli zamandır: 16 okuma 16 kat iş demektir.\n\n### 3) Gürültü eşiği titretir\nTek eşikle karar veren program, değer eşiğin yakınındayken her gürültü dalgasında kararını değiştirir. Aynı sahte gürültüyü ekleyip D13'teki LED'i bir eşiğe bağlayalım:\n\n```cpp\n// sketch: esik_ham\nconst int SENSOR = A0;\nconst int LED = 13;\nconst int ESIK = 512;\n\nint gurultuluOku() {\n  return analogRead(SENSOR) + random(-8, 9);\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  randomSeed(42);\n}\n\nvoid loop() {\n  digitalWrite(LED, gurultuluOku() > ESIK ? HIGH : LOW);\n  delay(5);\n}\n```\n\nPotansiyometreyi yaklaşık 0,50 konumunda bırak: LED saniyede onlarca kez yanıp sönmeye çalışır. Çözüm iki eşiktir (**histerezis**, 35. ders): yanmak için eşiğin biraz üstüne çık, sönmek için biraz altına in. İki eşik arasındaki boşluk gürültünün genliğinden büyük olmalı; burada gürültü ±8, boşluk ±12.\n\n```cpp\n// sketch: esik_histerezis\nconst int SENSOR = A0;\nconst int LED = 13;\nconst int ACMA = 524;\nconst int KAPAMA = 500;\nbool yanik = false;\n\nint gurultuluOku() {\n  return analogRead(SENSOR) + random(-8, 9);\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  randomSeed(42);\n}\n\nvoid loop() {\n  int deger = gurultuluOku();\n  if (!yanik && deger > ACMA) yanik = true;\n  if (yanik && deger < KAPAMA) yanik = false;\n  digitalWrite(LED, yanik ? HIGH : LOW);\n  delay(5);\n}\n```\n\nPotansiyometreyi 0,50 civarında tutunca LED artık titremez; yavaşça 0,6'ya götürünce **bir kez** yanar, geri indirince **bir kez** söner.\n\n### Gerçek dünyada ek bilgi: referans kayması\n`analogRead` değeri, ölçülen gerilimin **besleme gerilimine oranıdır** (Uno'da varsayılan referans besleme hattıdır). Besleme 5,00 V yerine 4,70 V ise aynı sensör gerilimi daha büyük bir ADC değeri verir ve `ham * 5.0 / 1023.0` hesabı yanlış gerilim yazar. Laboratuvarın referansı hep tam 5,00 V olduğu için bu kayma görünmez; ölçümü gerçek bir devrede doğrulamak gerekir.\n\n### Nasıl çalışıyor?\n1. `adc_basamak` ham değeri milivolta çevirir; çıkıştaki küçük fark ADC basamağından gelir.\n2. `gurultu_ortalama` laboratuvarda olmayan gürültüyü `random` ile ekler ve ortalamanın tek okumadan daha kararlı olduğunu gösterir.\n3. `esik_ham` tek eşikle karar verir, gürültü yüzünden titrer.\n4. `esik_histerezis` yanma ve sönme eşiklerini ayırır; LED yalnızca değer gerçekten karşı tarafa geçince değişir.\n\n### Dene\n- `gurultu_ortalama` içinde `random(-8, 9)` aralığını `random(-30, 31)` yap. `Ort16` ne kadar oynuyor? Ortalama sayısını 64 yaparsan ne olur, sürenin bedeli ne?\n- `esik_histerezis` içinde `ACMA` ile `KAPAMA` değerlerini birbirine çok yaklaştır (510 ve 514). Titreme geri geliyor mu? Gürültü genliğinin yarısından küçük bir boşluk neden yetmez?\n- Potansiyometrenin konumunu 0,01 adımlarla oynat ve `adc_basamak` çıktısına bak. Değer her adımda kaç basamak atlıyor? Bir basamak kaç mV?\n\n### Sık yapılan hatalar\n- \"Laboratuvarda titremedi, demek ki gerçekte de titremez\" demek. Laboratuvarın gürültüsü sıfırdır.\n- Histerezis boşluğunu gürültünün genliğinden dar seçmek.\n- Gürültüyü azaltmak için ortalama alırken okuma sayısını çok büyütüp programı yavaşlatmak.\n- ADC değerini 5,00 V referansı varsayarak gerilime çevirip sonucu mutlak doğru sanmak.",
          "question": "Bu derste gürültünün laboratuvarda hiç olmadığını, ama kodunun gürültüye dayanması gerektiğini gördün. Laboratuvarda sorunsuz çalışan hangi kısmını, gerçek devrede çalışacağından emin olmadan \"bitti\" saymazdın?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Laboratuvarın hangi gerçek dünya etkilerini modellediğini, hangilerini modellemediğini ayırmayı\n- ADC basamağının ne olduğunu ve bir basamağın kaç milivolta denk geldiğini\n- Gürültünün ne olduğunu ve ortalamanın onu nasıl küçülttüğünü\n- Tek eşiğin neden titrediğini ve iki eşikle (histerezis) nasıl çözüldüğünü\n\n### Önceden bilmen gerekenler\n- 11. ders: `analogRead` ve 0-1023 aralığı (10 bit ADC)\n- 14. ders: `map`, `constrain` ve yumuşatma (ortalama alma)\n- 35. ders: histerezis fikri ve eşikle karar verme\n\n### Laboratuvar temiz bir dünyadır\nLaboratuvar gerçek devrenin her yönünü taklit etmez. Bu hafta bir kural koyuyoruz: bir etkiyi yalnızca laboratuvar gerçekten üretiyorsa \"laboratuvarda gördüm\" dersin. Üretmiyorsa bunu açıkça bilir ve etkiyi kodla taklit edersin.\n\n| Etki | Laboratuvarda |\n|---|---|\n| ADC basamağı (1024 seviye) | Modellenir |\n| Zamanlama (`delay`, `millis`) | Modellenir |\n| Analog gürültü | Modellenmez |\n| Referans geriliminin kayması | Modellenmez |\n| Buton sıçraması | Modellenmez |\n\n### ADC basamağı\n`analogRead` 0-5 V aralığını 1023 eşit parçaya böler. Bir **basamak** 5 V / 1023 ≈ 4,89 mV eder. Aradaki gerilimler en yakın basamağa yuvarlanır. Yani ADC, gerilimi en iyi ihtimalle 4,89 mV'luk adımlarla görür. Örneğin 2,550 V gerilim 522. basamağa yuvarlanır ve geri çevirince 2551,3 mV çıkar. Bu 1,3 mV'lik fark bir hata değil, yuvarlamadır.\n\n### Gürültü\n**Gürültü**, sensör gerilimine istemeden karışan küçük, rastgele oynamalardır. Kablolar anten gibi davranır, güç hattı dalgalanır, ADC kendisi bir iki basamak titrer. Laboratuvarın gerilimi ise kusursuz sabittir, bu yüzden potansiyometreyi sabit bıraktığında değer hiç oynamaz. Gerçek devrede oynar.\n\nGürültüyü yok edemezsin ama küçültebilirsin: N okumanın ortalaması gürültüyü yaklaşık karekök(N) kat azaltır. 16 okumada 4 kat, 64 okumada 8 kat. Bedeli zamandır: 64 okuma, 1 okumadan 64 kat daha fazla iş demektir.\n\n### Gürültü eşiği titretir\nTek eşikle karar verirsen (`deger > 512`), değer eşiğin yakınındayken her gürültü dalgasında karar değişir ve LED yanıp söner. Çözüm iki eşiktir:\n\n```\nyanmak için:  değer > 524\nsönmek için:  değer < 500\narası:        önceki karar korunur\n```\n\nAradaki boşluk (burada 24) gürültünün genliğinden büyük olmalıdır. Gürültü ±8 ise, boşluğun ±8'den dar olması titremeyi geri getirir.\n\n### Özet\nLaboratuvar ADC basamağını ve zamanlamayı gerçekten modeller, ama gürültüyü, buton sıçramasını ve referans kaymasını modellemez. Bir okumanın doğruluğu en fazla basamak kadardır. Gürültüye karşı ortalama ve iki eşikli karar (histerezis) kullanırsın. \"Laboratuvarda titremedi\" cümlesi, gerçek devrede titremeyeceğinin kanıtı değildir.",
          "concepts": [
            {
              "term": "ADC basamağı",
              "definition": "10 bitlik ADC'nin ayırt edebildiği en küçük gerilim adımı: 5 V / 1023, yaklaşık 4,89 mV.",
              "example": "2,550 V 522. basamağa yuvarlanır; geri çevirince 2551,3 mV çıkar, aradaki 1,3 mV yuvarlama farkıdır.",
              "pitfall": "1 mV'luk bir değişimi 10 bitlik ADC ile ölçebileceğini sanmak; adım 4,89 mV'tur."
            },
            {
              "term": "Gürültü",
              "definition": "Ölçülen gerilime istemeden karışan küçük ve rastgele oynamalar.",
              "example": "Potansiyometre sabitken gerçek devrede analogRead değeri 510, 513, 509 diye oynar.",
              "pitfall": "Laboratuvarda değer oynamadı diye gerçek devrede de oynamayacağını varsaymak."
            },
            {
              "term": "Ortalama alma",
              "definition": "Birçok okumanın ortalamasını kullanarak gürültüyü küçültme; N okumada yaklaşık karekök(N) kat azalır.",
              "example": "16 okumanın ortalaması gürültüyü yaklaşık 4 kat, 64 okumanın ortalaması 8 kat küçültür.",
              "pitfall": "Okuma sayısını gereksiz büyütüp programı yavaşlatmak; 64 okuma, 1 okumanın 64 katı iştir."
            },
            {
              "term": "Histerezis",
              "definition": "Açma ve kapama için iki ayrı eşik kullanıp aradaki bölgede önceki kararı korumak.",
              "example": "Değer 524'ü geçince LED yanar, 500'ün altına inince söner; arada olduğu gibi kalır.",
              "pitfall": "İki eşik arasındaki boşluğu gürültünün genliğinden dar seçmek; titreme geri gelir."
            }
          ],
          "quiz": [
            {
              "id": "m4h8d1-q1",
              "kind": "mcq",
              "prompt": "Aşağıdakilerden hangisini laboratuvarda gerçekten görürsün?",
              "options": [
                "Potansiyometre sabitken ADC değerinin birkaç basamak titremesi",
                "Gerilimin en yakın ADC basamağına yuvarlanması",
                "Besleme geriliminin 5,00 V'tan 4,70 V'a kayması",
                "Butonun bir basışta birkaç kez sıçraması"
              ],
              "answer": 1,
              "explanation": "Laboratuvar ADC basamağını modeller: her gerilim en yakın basamağa yuvarlanır. Gürültü, referans kayması ve buton sıçraması modellenmez; laboratuvarın gerilimleri kusursuz sabittir.",
              "skills": [
                "sens-sim-limits",
                "sens-adc"
              ]
            },
            {
              "id": "m4h8d1-q2",
              "kind": "numeric",
              "prompt": "10 bitlik ADC 0-5 V aralığını 1023 eşit adıma böler. Bir basamak yaklaşık kaç milivolttur? (Virgülden sonra iki basamak yeter.)",
              "answer": 4.89,
              "tolerance": 0.05,
              "unit": "mV",
              "explanation": "5000 mV / 1023 ≈ 4,89 mV. Bu yüzden 10 bitlik ADC ile 1 mV'luk değişimler ayırt edilemez; sonuç hep en yakın basamağa yuvarlanır.",
              "skills": [
                "sens-adc"
              ]
            },
            {
              "id": "m4h8d1-q3",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca seri monitörde ne yazar?\n\n```cpp\nconst int ACMA = 524;\nconst int KAPAMA = 500;\nint okumalar[] = {510, 530, 515, 505, 495, 520};\nbool yanik = false;\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 6; i++) {\n    int v = okumalar[i];\n    if (!yanik && v > ACMA) yanik = true;\n    if (yanik && v < KAPAMA) yanik = false;\n    Serial.print(yanik ? 1 : 0);\n  }\n}\nvoid loop() {}\n```",
              "options": [
                "010100",
                "011110",
                "000000",
                "011100"
              ],
              "answer": 3,
              "explanation": "510 ve eşik altında: 0. 530 > 524: yanar, 1. 515 ve 505 iki eşiğin arasında, karar korunur: 1, 1. 495 < 500: söner, 0. 520 yine bandın içinde ve zaten sönük: 0. Çıktı 011100. Tek eşik (512) kullansaydın 515 ve 520'de de yanardı.",
              "skills": [
                "sens-hysteresis"
              ]
            },
            {
              "id": "m4h8d1-q4",
              "kind": "find-bug",
              "prompt": "Gürültü ±8 basamak. Bu program LED'i hâlâ titretiyor. Hata nerede?\n\n```cpp\nconst int ACMA = 510;\nconst int KAPAMA = 514;\nbool yanik = false;\n// ...\nif (!yanik && deger > ACMA) yanik = true;\nif (yanik && deger < KAPAMA) yanik = false;\n```",
              "options": [
                "deger değişkeni analogRead ile okunmamalıydı",
                "Sabitler const olmamalıydı",
                "ACMA ve KAPAMA ters yerleşmiş: KAPAMA ACMA'dan büyük, bu yüzden bant yok",
                "bool yerine int kullanılmalıydı"
              ],
              "answer": 2,
              "explanation": "Yanmak için eşik 510, sönmek için 514: değer 511 olunca yanar ama aynı turda 511 < 514 olduğu için hemen söner. Histerezis için açma eşiği kapama eşiğinden yüksek olmalı (örneğin 524 ve 500) ve aradaki boşluk gürültüden büyük olmalı. Diğer seçeneklerin davranışla ilgisi yok.",
              "skills": [
                "sens-hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m4h8d1-q5",
              "kind": "numeric",
              "prompt": "Gürültü, N okumanın ortalamasında yaklaşık karekök(N) kat azalır. 64 okumanın ortalaması gürültüyü yaklaşık kaç kat küçültür?",
              "answer": 8,
              "tolerance": 0,
              "explanation": "Karekök(64) = 8. Ama bedeli 64 kat iş: 16 okumada 4 kat, 64 okumada 8 kat azalır; kazancın azalan getirisi var, bu yüzden okuma sayısını gereksiz büyütmek programı yavaşlatır.",
              "skills": [
                "sens-noise"
              ]
            }
          ]
        },
        {
          "title": "Buton sıçraması ve tepki gecikmesi",
          "durationMin": 30,
          "problem": "Bir sayaç programı yazdın: butona her basışta sayı bir artıyor. Laboratuvarda mükemmel çalışıyor. Aynı program gerçek bir butonla tek basışta bazen 1, bazen 3, bazen 7 sayıyor. Bir de başka bir sorun: programa başka işler eklediğinde, kısa basışlar bazen hiç algılanmıyor. İkisi de \"kod doğru ama zaman ve girdi kirli\" hatalarının ayrı yüzleri.",
          "contentMd": "### Laboratuvar butonu temizdir\nGerçek bir buton mekanik bir parçadır. Kontaklar birbirine değerken kısa süre titreşir; pin tek basışta birkaç kez HIGH ile LOW arasında gidip gelebilir (8. derste debounce). **Laboratuvardaki buton parçası bunu yapmaz:** basılı olduğunda pin tek hamlede LOW olur, bırakıldığında tek hamlede HIGH olur. Yani sıçrama laboratuvarda **modellenmez**.\n\nBiz sıçramayı koda ekleyeceğiz. Aşağıdaki `hamOku()` fonksiyonu gerçek bir kontağı taklit eder: butonun durumu her değiştiğinde 5 ms boyunca okumayı bir doğru, bir ters verir. Bu fonksiyonu anlamak zorunda değilsin; tek işi laboratuvarın temiz butonunu \"kirletmek\". Gerçek sıçramanın süresi ve sayısı her basışta farklıdır; buradaki taklit hep aynıdır.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Buton | A → **D2**, B → **GND** (`INPUT_PULLUP`) |\n| Direnç (330 Ω) | 1 → **D13**, 2 → LED A |\n| LED | A → direncin 2 ucu, K → **GND** |\n\n### 1) Sıçramalı butonu say\nSayaç düşen kenarı (LOW'a geçişi) sayar ama sıçramayı hesaba katmaz:\n\n```cpp\n// sketch: sayac_ham\nconst int BUTON = 2;\nconst int LED = 13;\nint sayac = 0;\nbool onceki = false;\nbool ledDurum = false;\n\n// Gerçek kontağın sıçramasını taklit eder: her değişimden sonraki 5 ms içinde tek ms'lerde ters okur.\nbool hamOku() {\n  static bool son = false;\n  static bool var = false;\n  static unsigned long degisim = 0;\n  bool temiz = (digitalRead(BUTON) == LOW);\n  if (temiz != son) {\n    son = temiz;\n    degisim = millis();\n    var = true;\n  }\n  unsigned long gecen = millis() - degisim;\n  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;\n  return temiz;\n}\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool basili = hamOku();\n  if (basili && !onceki) {          // basılmaya yeni geçti\n    sayac++;\n    ledDurum = !ledDurum;\n    digitalWrite(LED, ledDurum);\n    Serial.print(\"Sayac: \");\n    Serial.println(sayac);\n  }\n  onceki = basili;\n}\n```\n\nButona **bir kez** bas ve bırak. Taklit sıçrama yüzünden basarken 3, bırakırken 2 sahte \"basış\" daha görürsün: seri monitörde `Sayac: 5` yazar ve LED beş kez durum değiştirir; son durumun \"yanık\" çıkması tesadüftür. Kod hatasızdı; girdi kirliydi.\n\nÇözüm: pin değiştikten sonra belli bir süre **sakin kalmasını** bekle. Değer 20 ms boyunca aynı kaldıysa kabul et:\n\n```cpp\n// sketch: sayac_temiz\nconst int BUTON = 2;\nconst int LED = 13;\nconst unsigned long SAKIN_SURE = 20;   // ms\nint sayac = 0;\nbool ledDurum = false;\nbool sonHam = false;\nbool kararli = false;\nunsigned long sonDegisim = 0;\n\n// Gerçek kontağın sıçramasını taklit eder (sayac_ham ile aynı).\nbool hamOku() {\n  static bool son = false;\n  static bool var = false;\n  static unsigned long degisim = 0;\n  bool temiz = (digitalRead(BUTON) == LOW);\n  if (temiz != son) {\n    son = temiz;\n    degisim = millis();\n    var = true;\n  }\n  unsigned long gecen = millis() - degisim;\n  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;\n  return temiz;\n}\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  bool ham = hamOku();\n  if (ham != sonHam) {              // pin oynadı: sayacı sıfırla\n    sonHam = ham;\n    sonDegisim = millis();\n  }\n  if (millis() - sonDegisim >= SAKIN_SURE && ham != kararli) {\n    kararli = ham;                  // yeterince sakin kaldı: kabul et\n    if (kararli) {\n      sayac++;\n      ledDurum = !ledDurum;\n      digitalWrite(LED, ledDurum);\n      Serial.print(\"Sayac: \");\n      Serial.println(sayac);\n    }\n  }\n}\n```\n\nTaklit sıçrama 5 ms sürdüğü için 20 ms'lik sakin bekleme onu tamamen yutar: tek basış, tek sayım. Gerçek butonlarda uygun süre parçaya göre değişir; çok kısa seçersen sıçrama sızar, çok uzun seçersen hızlı basışları kaçırırsın.\n\n### 2) Tepki gecikmesi: `delay` içinde pin okunmaz\nZaman etkileri laboratuvarda **gerçektir**, çünkü kod gerçek hızında koşar. `delay(500)` sırasında program pine bakmaz. Aşağıdaki program \"başka bir iş\" için yarım saniye bekliyor ve butona sadece o aralıkta bir kez bakıyor:\n\n```cpp\n// sketch: tepki_delay\nconst int BUTON = 2;\nconst int LED = 13;\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(BUTON) == LOW) {\n    Serial.println(\"BASILDI\");\n    digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(LED, LOW);\n  }\n  delay(500);                       // \"başka iş\" yerine geçen bekleme\n}\n```\n\nButonu yarım saniyeden kısa bir süre basılı tut: çoğu zaman hiç `BASILDI` yazmaz. Uzun basarsan tepki en fazla 500 ms gecikir. Çözüm 27. dersteki `millis()` yöntemidir: \"başka iş\" kendi zamanını tutar, butona her turda bakılır.\n\n```cpp\n// sketch: tepki_millis\nconst int BUTON = 2;\nconst int LED = 13;\nconst unsigned long ARALIK = 500;   // \"başka iş\" 500 ms'de bir\nunsigned long sonIs = 0;\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(BUTON) == LOW) {\n    Serial.println(\"BASILDI\");\n    digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(LED, LOW);\n  }\n  if (millis() - sonIs >= ARALIK) {\n    sonIs = millis();\n    Serial.println(\"tik\");          // \"başka iş\"\n  }\n}\n```\n\nBu sürümde LED butona anında karşılık verir. Ama dikkat: her turda `BASILDI` yazıldığı için basılı tutarsan seri monitör dolar. Bunu kenar algılamayla (8. ders) kendin düzeltebilirsin.\n\n### Gecikme ve ısınma: sensörler anında cevap vermez\nGerçek sensörlerin kendi süreleri vardır. Laboratuvar bunların bir kısmını **modeller**, bir kısmını modellemez:\n\n| Süre | Laboratuvarda |\n|---|---|\n| HC-SR04 ölçümü (mesafeyle orantılı, 100 cm için yaklaşık 6 ms) | Modellenir (`pulseIn` süresi ölçülebilir) |\n| DHT okuma aralığı (en az 2 sn) | Modellenir (kütüphane bekletir) |\n| I2C LCD açılışı (yaklaşık 1 sn) | Modellenir |\n| PIR ısınması | Modellenir, ama kısaltılmıştır: laboratuvarda 2 sn, gerçekte tipik olarak yarım dakika ile bir dakika arası (modüle göre değişir) |\n| MQ-2 gaz sensörünün ısınması | **Modellenmez** (53. dersteki bekleme süresi yalnızca gerçek devre içindir) |\n| Sensör ömrü, sıcaklıkla kayma | **Modellenmez** |\n\nTablodaki \"modellenir\" satırları, kodunda bekleme süresini unutursan laboratuvarın da seni yakalayacağı anlamına gelir. \"Modellenmez\" satırlarında ise laboratuvarın sessizliği güvence değildir.\n\n### Nasıl çalışıyor?\n1. `sayac_ham` düşen kenarı her görüşünde sayar. Sıçrama kenarı çoğalttığı için tek basış ve bırakış 5 sayım üretir.\n2. `sayac_temiz` kararlı kalma süresini ölçer; 5 ms'lik sıçrama dizisi 20 ms bekleme içinde kaybolur.\n3. `tepki_delay` yarım saniyede bir pine bakar; arada olan kısa basış görünmez.\n4. `tepki_millis` her turda pine bakar; yavaş iş kendi saatini tutar.\n\n### Dene\n- `sayac_temiz` içindeki `SAKIN_SURE` değerini 0 yap. Bu hâliyle hangi sketch'e dönüşüyor?\n- `SAKIN_SURE` değerini 3 yap: 5 ms'lik taklit sıçrama sızıyor mu? Neden?\n- `tepki_delay` programında `delay(500)` değerini 50 yap. Kısa basışlar artık yakalanıyor mu? Ya 5 yaparsan?\n- `hamOku()` içindeki `gecen < 5` değerini 15 yap. Taklit sıçramanın uzaması 20 ms'lik beklemeyi nasıl etkiler?\n\n### Sık yapılan hatalar\n- \"Laboratuvarda sıçrama olmadı, debounce gereksiz\" demek. Laboratuvarın butonu temizdir, gerçeği değil.\n- Sıçramayı `delay(50)` ile gidermeye çalışmak: çalışır ama programı bekletir, `tepki_delay`'deki sorun doğar.\n- Bırakırken oluşan sıçramayı unutmak: basarken bekleyip bırakırken beklememek sahte sayım getirir.\n- `SAKIN_SURE` değerini ölçmeden tahmin etmek.",
          "question": "Debounce, girdinin kirli olduğunu kabul edip \"biraz sakin kal\" demektir. Bunun bedeli ne? Çok hızlı basılan bir oyun düğmesinde 20 ms'lik bekleme sorun yaratır mı, yaratırsa nasıl çözersin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Gerçek butonun neden \"sıçradığını\" ve laboratuvar butonunun neden sıçramadığını\n- Bekleme payıyla (kararlı kalma süresiyle) debounce yapmayı ve bedelini\n- `delay()` içinde pinin neden okunmadığını ve kısa basışın nasıl kaçtığını\n- `millis()` ile tepkinin nasıl hızlandığını\n\n### Önceden bilmen gerekenler\n- 6. ders: `digitalRead`, buton ve `INPUT_PULLUP` (basılı = LOW)\n- 8. ders: debounce ve kenar algılama\n- 26. ve 27. dersler: `delay` tuzağı ve `millis()`\n\n### Buton mekanik bir parçadır\nGerçek bir butonun içinde metal kontaklar vardır. Basarken bu kontaklar birbirine çarpar ve çok kısa süre titrer. Pin, tek basışta birkaç kez HIGH ile LOW arasında gidip gelir. Bu olaya **sıçrama** (bounce) denir. Sıçrama genellikle milisaniyeler sürer ama işlemci mikrosaniyelerle çalıştığı için hepsini ayrı basış olarak görür.\n\nLaboratuvardaki buton parçası bunu yapmaz: pin tek hamlede LOW olur. Bu yüzden derste sıçramayı kodla taklit ettik. Taklitte bir basışı ve bırakışı toplam 5 sayım olarak gördün.\n\n### Debounce: sakin kalmasını bekle\nÇözüm, pinin **belli bir süre aynı kalmasını** beklemektir:\n\n```\nher değişimde: \"son değişim zamanı\" = şimdi\nşimdi - son değişim >= SAKIN_SURE ise:\n    değeri kabul et\n```\n\nBöylece sıçrama dizisi, bekleme süresi içinde yutulur. `SAKIN_SURE` = 20 ms ise, 20 ms dolmadan bırakılan bir basış hiç sayılmaz. Bu bekleme süresinin bedelidir. Çok kısa seçersen sıçrama sızar; çok uzun seçersen hızlı basışları kaçırırsın. Ayrıca bırakırken oluşan sıçramayı da unutma: bekleme iki yönde de çalışmalıdır.\n\n### delay() içinde pin okunmaz\n`delay(500)` çalışırken program hiçbir şey yapmaz, pine de bakmaz. Döngü şöyle işler: pini oku, 500 ms bekle, pini oku. Butona bu iki okuma arasında kısa basıp bırakırsan program basışı hiç görmez. Zaman etkileri laboratuvarda gerçektir, çünkü kod gerçek hızında koşar. Bu yüzden laboratuvarda da basışı kaçırırsın.\n\nÇözüm `millis()` kullanmaktır: yavaş iş kendi zamanını tutar, `loop()` ise her turda pine bakar. Tur birkaç mikrosaniye sürer, basış anında görülür.\n\n### Sensörler anında cevap vermez\nSensörlerin kendi süreleri vardır: DHT iki saniyede bir, I2C LCD açılışta yaklaşık bir saniye ister. Laboratuvar bunları modeller; kodda beklemeyi unutursan laboratuvar da seni yakalar. PIR ısınması da modellenir ama kısaltılmıştır (laboratuvarda 2 sn, gerçekte çok daha uzun).\n\n### Özet\nGerçek butonlar sıçrar, laboratuvar butonu sıçramaz. Debounce, pinin belli bir süre sakin kalmasını bekleyerek sıçramayı yutar; bedeli çok kısa basışları kaçırma riskidir. `delay()` süresince pin okunmaz, `millis()` ise tepkiyi hızlandırır. \"Laboratuvarda sıçrama olmadı\" cümlesi debounce'un gereksiz olduğunu göstermez.",
          "concepts": [
            {
              "term": "Sıçrama (bounce)",
              "definition": "Mekanik kontakların birleşirken kısa süre titreyerek pini birkaç kez HIGH ile LOW arasında gidip getirmesi.",
              "example": "Gerçek bir butona bir kez basarsın, sayaç 1 yerine 3 artar.",
              "pitfall": "Laboratuvar butonu sıçramadığı için debounce'un gereksiz olduğunu düşünmek."
            },
            {
              "term": "Kararlı kalma süresi",
              "definition": "Debounce'ta bir pin değerinin kabul edilmesi için değişmeden kalması gereken süre (örneğin 20 ms).",
              "example": "Pin son değişimden 20 ms sonra hâlâ LOW ise basış kabul edilir.",
              "pitfall": "Süreyi çok kısa seçmek sıçramayı sızdırır, çok uzun seçmek hızlı basışları kaçırır."
            },
            {
              "term": "Tepki gecikmesi",
              "definition": "Bir olayın gerçekleşmesi ile programın buna cevap vermesi arasındaki süre.",
              "example": "loop içinde delay(500) varsa buton tepkisi 500 ms'ye kadar gecikebilir.",
              "pitfall": "Başka işi delay ile bekleterek butonu da aynı sürede dinlemeyi beklemek."
            },
            {
              "term": "millis() ile bloklamayan kod",
              "definition": "Yavaş işin kendi zamanını millis() ile tutması, loop() içinde diğer girdilerin her turda okunması.",
              "example": "Her 500 ms'de bir \"tik\" yazılır ama butona her turda bakılır.",
              "pitfall": "Basılı tutarken her turda mesaj yazıp seri monitörü doldurmak; kenar algılama gerekir."
            }
          ],
          "quiz": [
            {
              "id": "m4h8d2-q1",
              "kind": "mcq",
              "prompt": "Gerçek bir butonla sıçramayı önlemeyen bir sayaç, tek basışta neden birkaç sayım yapar?",
              "options": [
                "Pin basış sırasında kısa süre HIGH ile LOW arasında gidip gelir ve her LOW'a geçiş sayılır",
                "Arduino butonu iki kez okuyacak şekilde tasarlanmıştır",
                "INPUT_PULLUP butonun iki ucunu da 5 V'a bağlar",
                "Sayaç int olduğu için sayıyı iki katına çıkarır"
              ],
              "answer": 0,
              "explanation": "Kontaklar çarpışıp titrediği için pin tek basışta birkaç kez değişir ve kenar algılayan kod her düşen kenarı sayar. Arduino butonu iki kez okumaz; INPUT_PULLUP pini 5 V'a çeker, butonun ucunu değil; int sayım sayısını katlamaz.",
              "skills": [
                "sens-debounce"
              ]
            },
            {
              "id": "m4h8d2-q2",
              "kind": "numeric",
              "prompt": "Debounce kodunda SAKIN_SURE = 20 ms. Bir basışın sayılması için pinin en az kaç ms boyunca değişmeden kalması gerekir?",
              "answer": 20,
              "tolerance": 0,
              "unit": "ms",
              "explanation": "Kod her değişimde zamanı sıfırlar ve yalnızca değer 20 ms sakin kaldığında kabul eder. Bu yüzden 20 ms dolmadan bırakılan bir basış sayılmaz; bu bekleme süresinin bedelidir.",
              "skills": [
                "sens-debounce",
                "prog-timing"
              ]
            },
            {
              "id": "m4h8d2-q3",
              "kind": "predict-output",
              "prompt": "Buton D2'de (INPUT_PULLUP). Program başladıktan hemen sonra butona yalnızca 100 ms basılıp bırakılıyor. Bu kod seri monitöre ne yazar?\n\n```cpp\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  Serial.begin(9600);\n}\nvoid loop() {\n  if (digitalRead(2) == LOW) Serial.println(\"BASILDI\");\n  delay(500);\n}\n```",
              "options": [
                "BASILDI sürekli yazar",
                "Hiçbir şey yazmaz",
                "BASILDI bir kez yazar",
                "BASILDI iki kez yazar"
              ],
              "answer": 1,
              "explanation": "Program pini okuduktan sonra 500 ms uyur. Basış, iki okuma arasındaki 500 ms içinde başlayıp bittiği için hiç görülmez. Okuma tam basış anına denk gelmediği sürece kısa basış kaçar; millis() ile her turda okunsaydı yakalanırdı.",
              "skills": [
                "sens-nonblocking",
                "prog-timing"
              ]
            },
            {
              "id": "m4h8d2-q4",
              "kind": "find-bug",
              "prompt": "Bu debounce kodunda sıçrama yine sayılıyor. Hangi satır eksik?\n\n```cpp\nbool ham = digitalRead(2) == LOW;\nif (ham != sonHam) {\n  sonHam = ham;\n}\nif (millis() - sonDegisim >= 20 && ham != kararli) {\n  kararli = ham;\n  if (kararli) sayac++;\n}\n```",
              "options": [
                "sayac++ yerine sayac-- olmalı",
                "digitalRead yerine analogRead kullanılmalı",
                "20 değeri 0 olmalı",
                "if (ham != sonHam) bloğunda sonDegisim = millis(); yok"
              ],
              "answer": 3,
              "explanation": "Son değişim zamanı hiç güncellenmediği için millis() - sonDegisim hep 20'den büyük kalır; bekleme fiilen yoktur ve her sıçrama hemen kabul edilir. Doğru kodda pin her değiştiğinde sayaç sıfırlanır (sonDegisim = millis()). Diğer seçenekler hatayı gidermez; 20'yi 0 yapmak beklemeyi tamamen kaldırır.",
              "skills": [
                "sens-debounce",
                "prog-debug"
              ]
            },
            {
              "id": "m4h8d2-q5",
              "kind": "numeric",
              "prompt": "Bir programın loop() içinde delay(50) var ve pin her turda yalnızca bir kez okunuyor. Butonu garanti yakalamak için en az kaç ms basılı tutmak gerekir?",
              "answer": 50,
              "tolerance": 5,
              "unit": "ms",
              "explanation": "İki okuma arası yaklaşık 50 ms. Bu süreden kısa bir basış iki okuma arasına sığıp kaçabilir; 50 ms ya da daha uzun basış en az bir okumaya denk gelir. delay'i 5'e indirmek ya da millis() kullanmak bu aralığı küçültür.",
              "skills": [
                "sens-nonblocking",
                "prog-timing"
              ]
            }
          ]
        },
        {
          "title": "Besleme düşmesi ve kalibrasyon",
          "durationMin": 30,
          "problem": "Gerçek devrelerde garip bir olay vardır: motor çalışmaya başlayınca kart kendiliğinden yeniden başlar, ya da pil zayıfladıkça sensör sayıları yavaş yavaş kayar. Kodda hiçbir şey değişmedi; değişen, sensörün **beslendiği gerilim**. Peki bunun laboratuvarda ne kadarını görebilirsin, kalanı için ne yapmalısın?",
          "contentMd": "### Laboratuvarın besleme modeli\nLaboratuvar besleme hakkında bazı şeyleri gerçekten modeller:\n- **Sensörlerin en düşük besleme gerilimi.** HC-SR04 ve PIR gibi parçalar 4 V altında beslenirse cevap vermez. DHT, BMP280, MPU6050 gibi parçalar 3 V civarından itibaren çalışır. MQ-2 modülü 4 V ister.\n- **Analog modüllerin çıkışı besleme gerilimiyle orantılıdır.** Toprak nemi, ses, alev ve MQ-2 modüllerinde AO çıkışı, VCC gerilimi çarpı bir orandır. VCC düşerse AO da düşer.\n- **Uno pininin iç direnci.** Laboratuvarda bir çıkış pini yaklaşık 25 Ω'luk bir iç direnç gibi davranır; yük çektikçe pinin gerilimi 5 V'tan düşer.\n- **Pin akım sınırı.** Bir pinden 40 mA'in üstünde akım geçerse laboratuvar uyarı verir.\n\nLaboratuvar şunları **modellemez:**\n- **5 V hattının çökmesi.** Uno'nun 5V ve 3V3 uçları laboratuvarda ideal kaynaktır: motor, servo ya da röle ne kadar akım çekerse çeksin gerilim düşmez.\n- **Brown-out sıfırlaması.** Kart besleme düştüğü için kendini yeniden başlatmaz. (↺ Sıfırla düğmesini sen basarsın.)\n- **Güç hattı gürültüsü, kondansatör etkisi, kablo direnci.**\n\nYani \"laboratuvarda motor çalışırken kart sıfırlanmadı\" cümlesi gerçek devre için hiçbir şey kanıtlamaz. Gerçekte motoru ve röleyi ayrı bir kaynaktan besleme, ortak GND, besleme hattına kondansatör gibi önlemler kodun dışındaki çözümlerdir. Laboratuvarda bu bölümde yalnızca modellenen kısımlarla çalışacağız.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| Toprak nemi modülü | VCC → **5V**, GND → **GND**, AO → **A0** |\n\n### 1) Besleme gerilimi ölçümü bozar\nToprak nemi modülünün AO çıkışı laboratuvarda `VCC × (0,9 − 0,6 × nem)` biçimindedir (nem 0-1). VCC'yi 5V'ta bırakınca kuru toprakta (nem 0) AO 4,5 V, ıslak toprakta (nem 1) 1,5 V verir. VCC'yi **3V3**'e taşırsan modül hâlâ çalışır (3 V eşiğinin üstünde), ama aynı kuru toprakta AO 3,3 × 0,9 = 2,97 V olur ve `analogRead` yaklaşık 608 gösterir. Sensör aynı, toprak aynı; sayı çok farklı.\n\nBu bize kalibrasyonun ilk kuralını verir: **kalibrasyon, ölçüm koşullarına bağlıdır.** Besleme gerilimi değişirse eski kalibrasyon yanlış sonuç verir.\n\n### 2) İki nokta kalibrasyonu\nHam ADC değerini anlamlı bir birime çevirmek için iki bilinen uç ölçülür: sensör kuruyken ve ıslakken ne okuyor? Sonra `map` ile bu iki uç 0 ve 100'e eşlenir (14. ders).\n\n1. Sensörü seçip özellik panelinden **Toprak nemi** değerini 0 yap (tamamen kuru), seri monitörde okunan `Ham` değerini yaz.\n2. Toprak nemini 1 yap (tamamen ıslak), `Ham` değerini yaz.\n3. Bu iki değeri kodda sabit olarak kullan.\n\nAşağıdaki sketch bu sabitlerle yüzde hesaplar. Sabitler laboratuvarda 5V beslemeyle okunmuştur:\n\n```cpp\n// sketch: nem_kalibrasyon\nconst int SENSOR = A0;\nconst int KURU = 921;     // nem 0 iken okunan ham değer\nconst int ISLAK = 307;    // nem 1 iken okunan ham değer\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = analogRead(SENSOR);\n  int yuzde = map(ham, KURU, ISLAK, 0, 100);\n  yuzde = constrain(yuzde, 0, 100);       // uçların dışına taşan değerleri kırp\n  Serial.print(\"Ham=\");\n  Serial.print(ham);\n  Serial.print(\" Nem: \");\n  Serial.print(yuzde);\n  Serial.println(\"%\");\n  delay(500);\n}\n```\n\n`KURU` büyük, `ISLAK` küçük olduğu için `map`'in ilk aralığı \"ters\" yazıldı: `map` ters aralıkları da doğru işler. `constrain` olmadan kuruluktan daha kuru bir değer %0'ın altına, ıslaktan daha ıslak bir değer %100'ün üstüne çıkardı. Toprak nemini 0,5 yaptığında modülün AO'su 3,0 V olur, `Ham` yaklaşık 614 okunur ve program yaklaşık %50 yazar.\n\nŞimdi aynı sketch'in VCC'sini 3V3'e taşı (■ Dur, kabloyu çek, ▶). Toprak nemi 0,5 iken `Ham` yaklaşık 405 olur ve program neredeyse %84 yazar: kalibrasyon eski koşul için yapılmıştı. Çözüm kalibrasyonu yeni koşulda tekrarlamak ya da besleme gerilimini sabit tutmaktır.\n\n### 3) Yük altında pin gerilimi\nUno'nun bir pinini besleme gibi kullanıp ona yük bağlarsan, iç direnç yüzünden pin gerilimi düşer. Laboratuvarda dene: D13'ü bir 220 Ω dirence, direncin öbür ucunu GND'ye bağla; programda `digitalWrite(13, HIGH)` yap. Çalışırken direnci seç: **Sanal ölçüm** direncin uçlarında yaklaşık 4,5 V ve yaklaşık 20 mA gösterir. Pinin iç direnci (yaklaşık 25 Ω) ile 220 Ω seri bağlı, 5 V ikisine bölünür: 5 × 220 / 245 ≈ 4,49 V. Direnci 47 Ω yaparsan pin gerilimi yaklaşık 3,26 V'a düşer, akım yaklaşık 69 mA olur ve laboratuvar \"pin aşırı akım\" uyarısı verir (sınır 40 mA).\n\n### 4) Sensör beslenmezse ne olur? Güvenli davranış\nBesleme eksik ya da düşükse sensör çoğu zaman **hata vermez, sessiz kalır.** HC-SR04'te bu, `pulseIn`'in 0 döndürmesi demektir. Aşağıdaki sketch, 0 dönünce \"YOK\" yazar ve LED'i söndürür; yani bilinmeyen durumda tehlikeli çıkışı **kapalı** tutar (fail-safe):\n\n```cpp\n// sketch: mesafe_veya_yok\nconst int TRIG = 9;\nconst int ECHO = 10;\nconst int LED = 13;\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long sure = pulseIn(ECHO, HIGH, 30000);     // 30 ms'de cevap gelmezse 0 döner\n  if (sure == 0) {\n    Serial.println(\"YOK\");\n    digitalWrite(LED, LOW);                   // bilinmiyorsa uyarı yakma, güvenli tarafta kal\n  } else {\n    float cm = sure / 58.0;\n    Serial.print(cm, 1);\n    Serial.println(\" cm\");\n    digitalWrite(LED, cm < 20 ? HIGH : LOW);\n  }\n  delay(100);\n}\n```\n\nDene: HC-SR04'ün VCC'sini 5V yerine **3V3**'e bağla. Sensör 4 V altında kaldığı için cevap vermez ve seri monitörde sürekli `YOK` görürsün. Laboratuvar bu durumda sensör üzerinde \"beslenmemiş\" uyarısı da gösterir. Gerçekte ise bazen sensör yarım yamalak çalışır ve tuhaf değerler verir; bu yüzden \"değer makul mü?\" sorusunu 74. derste ayrıca soracağız.\n\n### Gerçek dünya bilgisi: kart neden sıfırlanır?\nMikrodenetleyicide **brown-out detector** adlı bir devre vardır: besleme belli bir eşiğin altına inince işlemciyi sıfırlar, çünkü eşiğin altında kodun güvenilir çalışması garanti değildir. Motor ya da röle çalışmaya başlarken çektiği büyük akım, zayıf bir kaynakta gerilimi bu eşiğin altına çekebilir. Belirti, motor her başladığında kartın başa dönmesidir; seri monitörde `setup()`'taki açılış mesajını tekrar tekrar görürsün. Bu kodla düzeltilen bir hata değil; ayrı güç, kondansatör ve ortak GND ile devrede çözülür. Laboratuvarda bu olay olmaz. Gerçek devrede yeniden başlamayı fark etmenin kolay yolu, `setup()` içinde bir açılış mesajı yazdırmaktır.\n\n### Nasıl çalışıyor?\n1. `nem_kalibrasyon` iki ölçülmüş ucu `map` ile 0-100'e eşler; `constrain` taşmaları keser.\n2. Aynı sabitler başka bir besleme geriliminde yanlış sonuç verir, çünkü AO gerilimi VCC ile orantılıdır.\n3. Pin gerilimi, iç direnç ve yük direncinin gerilim bölücüsüdür (12. ders).\n4. `mesafe_veya_yok` sessiz sensörü `pulseIn` zaman aşımıyla yakalar ve çıkışı güvenli tarafta bırakır.\n\n### Dene\n- `nem_kalibrasyon` içinde toprak nemini 0'dan 1'e 0,1 adımlarla artır. Yüzde doğrusal mı artıyor?\n- `KURU` ve `ISLAK` sabitlerini bilerek yanlış yaz (örneğin 800 ve 400). %0 ve %100 artık hangi toprak nemi değerlerinde görünüyor?\n- `mesafe_veya_yok` içindeki `30000` zaman aşımını 3000 yap ve mesafeyi 100 cm yap. Sensör çalışıyor ama program neden \"YOK\" yazıyor? (İpucu: 100 cm için yankı süresi yaklaşık 5800 µs.)\n\n### Sık yapılan hatalar\n- Kalibrasyonu bir besleme koşulunda yapıp başka koşulda kullanmak.\n- Uç değerleri `constrain` ile kırpmamak: yüzde 0'ın altına ya da 100'ün üstüne çıkar.\n- \"Laboratuvarda 5V hattı çökmedi, demek ki motoru karttan besleyebilirim\" demek.\n- Sensör cevap vermediğinde (`pulseIn` 0) bunu mesafe 0 sanmak ve alarmı çalıştırmak.",
          "question": "Bu derste besleme gerilimi değişince sensör sayılarının kaydığını gördün. Bir sensörü kalibre ettikten sonra hangi koşulların değişmediğinden emin olman gerekir? Hangilerini senin ölçüm düzeneğinde kontrol edemezsin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Besleme gerilimi değişince analog sensör sayılarının neden kaydığını\n- İki nokta kalibrasyonunu (`map` + `constrain`) ve neden koşula bağlı olduğunu\n- Bir Uno pininin yük altında neden 5 V vermediğini\n- Sensör cevap vermediğinde güvenli (fail-safe) davranmayı\n\n### Önceden bilmen gerekenler\n- 12. ders: gerilim bölücü\n- 14. ders: `map`, `constrain` ve kalibrasyon\n- 37. ders: `pulseIn` ve HC-SR04 (`pulseIn` cevap yoksa 0 döner)\n\n### Sayı, besleme gerilimine bağlıdır\nToprak nemi gibi analog modüllerin çıkışı (AO), besleme gerilimiyle orantılıdır. Laboratuvarda formül şöyledir:\n\n```\nAO = VCC x (0,9 - 0,6 x nem)        nem: 0 (kuru) ... 1 (ıslak)\n```\n\nVCC = 5 V ve nem = 0 iken AO 4,5 V olur, ADC 921 okur. Aynı kuru toprakta VCC = 3,3 V ise AO 2,97 V olur ve ADC yaklaşık 608 okur. Sensör aynı, toprak aynı, sayı çok farklı. Kalibrasyon bu yüzden ölçüm koşuluna bağlıdır.\n\n### İki nokta kalibrasyonu\nHam sayıyı yüzdeye çevirmek için iki bilinen ucu ölçersin: kuru ve ıslak. Sonra bunları `map` ile 0 ve 100'e eşlersin:\n\n```\nyuzde = map(ham, KURU, ISLAK, 0, 100);\nyuzde = constrain(yuzde, 0, 100);\n```\n\n`map` ters aralığı da (KURU > ISLAK) doğru işler. `constrain` olmazsa, uçların dışındaki değerler yüzdeyi 0'ın altına ya da 100'ün üstüne taşır. `map` tam sayılarla çalışır ve kesirleri atar.\n\n### Pin bir ideal kaynak değildir\nLaboratuvardaki bir Uno çıkış pini yaklaşık 25 Ω'luk bir iç dirençle gelir. Pine yük bağlarsan 5 V, iç direnç ile yük arasında bölünür. 220 Ω yük için pin gerilimi 5 x 220 / 245 ≈ 4,49 V, 47 Ω için 5 x 47 / 72 ≈ 3,26 V olur. Akım da büyür: 47 Ω'da yaklaşık 69 mA, yani laboratuvarın 40 mA'lik pin sınırının üstünde. Bu yüzden motor ya da röle gibi yükler pinden değil, ayrı kaynaktan beslenir.\n\n### Laboratuvarın göstermediği: çöken besleme\nLaboratuvarın 5V hattı ideal kaynaktır; motor ne kadar akım çekerse çeksin gerilim düşmez. Gerçekte güçlü yük çalışmaya başlayınca besleme çöker ve mikrodenetleyicideki **brown-out detector** kartı yeniden başlatır. Laboratuvarda bu olmaz, bu yüzden \"motor çalışırken kart sıfırlanmadı\" cümlesi gerçek devre için bir şey kanıtlamaz.\n\n### Cevap vermeyen sensör\nBesleme eksikse sensör çoğu zaman hata vermez, sessiz kalır. HC-SR04'te bu, `pulseIn`'in 0 döndürmesidir. 0'ı \"mesafe 0 cm\" sanırsan alarm yanlış çalışır. Doğrusu, 0'ı ayırıp çıkışı **güvenli tarafta** (kapalı) bırakmaktır.\n\n### Özet\nAnalog modüllerin sayısı besleme gerilimiyle birlikte değişir, bu yüzden kalibrasyon koşul değişince yenilenmelidir. İki nokta kalibrasyonu `map` ve `constrain` ile yapılır. Pinin iç direnci yük altında gerilimi düşürür. Laboratuvar 5V çökmesini ve brown-out'u göstermez; sensör sessiz kalırsa bilinmeyen durumda çıkışları güvenli tarafa bırakırsın.",
          "concepts": [
            {
              "term": "İki nokta kalibrasyonu",
              "definition": "İki bilinen ucu (örneğin kuru ve ıslak) ölçüp ham değerleri map ile 0-100 gibi anlamlı bir aralığa eşlemek.",
              "example": "KURU = 921, ISLAK = 307 ölçüldü; map(614, 921, 307, 0, 100) yaklaşık 50 verir.",
              "pitfall": "Kalibrasyonu bir besleme geriliminde yapıp başka beslemede kullanmak; sayılar kayar."
            },
            {
              "term": "constrain()",
              "definition": "Bir değeri verilen alt ve üst sınırlar arasında tutar.",
              "example": "constrain(yuzde, 0, 100) kuruluktan daha kuru bir ölçümü %0'a sabitler.",
              "pitfall": "constrain koymayı unutup yüzdenin 100'ü aşmasına ya da negatif olmasına izin vermek."
            },
            {
              "term": "Pinin iç direnci",
              "definition": "Uno çıkış pininin yaklaşık 25 Ω'luk seri direnci; yük çektikçe pin gerilimi 5 V'tan düşer.",
              "example": "D13'e 220 Ω bağlanınca pin gerilimi 5 x 220 / 245 ≈ 4,49 V olur.",
              "pitfall": "Pini ideal 5 V kaynağı sanıp motor ya da röleyi doğrudan pinden sürmek."
            },
            {
              "term": "Brown-out",
              "definition": "Besleme belli eşiğin altına inince mikrodenetleyicinin kendini yeniden başlatması.",
              "example": "Güçlü bir motor çalışmaya başlayınca zayıf kaynakta kart başa döner ve setup() mesajı yeniden yazılır.",
              "pitfall": "Laboratuvarda sıfırlanma olmadığı için gerçek devrede de olmayacağını sanmak."
            },
            {
              "term": "Fail-safe (güvenli varsayılan)",
              "definition": "Durum bilinmediğinde tehlikeli ya da masraflı çıkışı kapalı tutma ilkesi.",
              "example": "pulseIn 0 dönerse YOK yazılır ve alarm LED'i söndürülür.",
              "pitfall": "Cevap vermeyen sensörü \"değer 0\" sayıp alarmı çalıştırmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h8d3-q1",
              "kind": "numeric",
              "prompt": "Toprak nemi modülü 5 V ile beslenir ve AO = VCC x (0,9 - 0,6 x nem) olur. Nem = 0,25 iken analogRead yaklaşık kaç okur? (5 V = 1023 kabul et.)",
              "answer": 767,
              "tolerance": 1,
              "explanation": "AO = 5 x (0,9 - 0,15) = 3,75 V. ADC = 3,75 / 5 x 1023 ≈ 767. Gerilimi 1023 ile ölçeklemek yerine 1024 kullanırsan 768 çıkar; bu yüzden küçük bir tolerans vardır.",
              "skills": [
                "sens-supply",
                "sens-adc"
              ]
            },
            {
              "id": "m4h8d3-q2",
              "kind": "predict-output",
              "prompt": "Bu kod çalışınca seri monitörde ne yazar?\n\n```cpp\nvoid setup() {\n  Serial.begin(9600);\n  int y = map(768, 921, 307, 0, 100);\n  Serial.println(y);\n  Serial.println(constrain(map(300, 921, 307, 0, 100), 0, 100));\n}\nvoid loop() {}\n```",
              "options": [
                "24 ve 101",
                "75 ve 0",
                "24 ve 100",
                "25 ve 100"
              ],
              "answer": 2,
              "explanation": "map(768, 921, 307, 0, 100) = (768 - 921) x 100 / (307 - 921) = 24,9; map tam sayı bölmesi yapar ve kesiri atar: 24. İkinci satırda ham değer 300 ıslaktan (307) daha ıslak. map yaklaşık 101 verir, constrain bunu 100'e keser.",
              "skills": [
                "sens-calibration"
              ]
            },
            {
              "id": "m4h8d3-q3",
              "kind": "mcq",
              "prompt": "Bir öğrenci laboratuvarda küçük bir DC motoru Uno'nun 5V ucundan besledi ve kart hiç sıfırlanmadı. Bundan ne sonucu çıkar?",
              "options": [
                "Gerçek devrede de sorun çıkmaz",
                "Laboratuvar 5V çökmesini ve brown-out'u modellemediği için gerçek devrede kartın sıfırlanıp sıfırlanmayacağı bilinmez",
                "Motor akımı çok düşük olduğu için laboratuvar sıfırlamıştır",
                "Gerçek devrede kart kesinlikle sıfırlanır"
              ],
              "answer": 1,
              "explanation": "Laboratuvarın 5V hattı ideal kaynaktır; motor ne çekerse çeksin gerilim düşmez. Bu yüzden sonuç hiçbir şey kanıtlamaz. Gerçek devrede sorun çıkıp çıkmayacağı kaynağa ve motora bağlıdır, \"kesinlikle\" ya da \"sorun çıkmaz\" demek ikisi de yanlıştır.",
              "skills": [
                "sens-sim-limits",
                "sens-supply"
              ]
            },
            {
              "id": "m4h8d3-q4",
              "kind": "find-bug",
              "prompt": "Bu program HC-SR04 beslenmediğinde (echo gelmediğinde) alarm LED'ini yakıyor. Asıl hata ne?\n\n```cpp\nlong sure = pulseIn(ECHO, HIGH, 30000);\nfloat cm = sure / 58.0;\ndigitalWrite(LED, cm < 20 ? HIGH : LOW);\n```",
              "options": [
                "30000 zaman aşımı fazla büyük",
                "pulseIn'in 0 döndürdüğü durum (cevap yok) ayrılmıyor; 0 cm sanılıp 20'den küçük olduğu için LED yanıyor",
                "58.0 yerine 58 yazılmalı",
                "digitalWrite yerine analogWrite kullanılmalı"
              ],
              "answer": 1,
              "explanation": "Echo gelmezse pulseIn 0 döndürür, 0 / 58 = 0 cm olur ve 0 < 20 olduğu için LED yanar. Doğrusu önce if (sure == 0) ile cevapsız durumu ayırıp LED'i söndürmektir (fail-safe). Diğer seçenekler bu davranışı değiştirmez.",
              "skills": [
                "sens-failsafe",
                "prog-debug"
              ]
            },
            {
              "id": "m4h8d3-q5",
              "kind": "numeric",
              "prompt": "KURU = 921 ve ISLAK = 307 ile kalibre ettin. Sonra modülün VCC'sini 3,3 V'a taşıdın. Nem = 0,25 iken ham değer 506 okunuyor. map(506, 921, 307, 0, 100) kaç yüzde gösterir?",
              "answer": 67,
              "tolerance": 1,
              "unit": "%",
              "explanation": "(506 - 921) x 100 / (307 - 921) = 67,6; map kesiri atar: 67. Oysa gerçek nem 0,25 iken 5 V ile ham değer 767, yani yüzde yaklaşık 25 olmalıydı. Besleme değişince eski kalibrasyon yanlış sonuç verir.",
              "skills": [
                "sens-calibration",
                "sens-supply"
              ]
            }
          ]
        },
        {
          "title": "Hata ayıklama vakası: \"ping çalışıyor ama veri yok\"",
          "durationMin": 30,
          "problem": "Bir gimbal kamerayı laptopa USB-Ethernet ile bağlıyorsun. `ping` cevap veriyor: cihaz orada. Ama telemetri ve video akışı kopuyor, uygulama veri alamıyor. \"Bağlantı var, o zaman sorun yazılımda\" diye düşünmek çok cazip. Gerçek sebep ise yazılımda değildi. Bu vakadan çıkan ders, ağ kablosu da olsa I2C sensörü de olsa aynı: hatayı **katman katman** ara.",
          "contentMd": "### Vaka: Hyvex gimbal\nBu bölüm Hyvex ekibinin staj programındaki bir vakaya dayanır; yalnızca orada yazılanları aktarıyorum.\n- Gimbal laptopa Type-C üzerinden USB-Ethernet gibi bağlanıyor ve statik IP ile konuşuluyor.\n- **Belirti:** `ping` çalışıyor ama telemetri ve video (RTSP) kopuyor.\n- **Kök neden:** NetworkManager, DHCP ile IP'yi siliyordu. Çözüm, kalıcı bir statik profil tanımlamaktı.\n- **İpucu:** \"Arada düzeliyor\" cümlesi, bir **katmanın kararsız** olduğunu gösteren işarettir.\n- **Yöntem:** Belirtiyi kök nedene indirgemek için katman katman doğrulama: fiziksel bağlantı, IP, port, uygulama.\n\nProgramın sorusu da şu: \"Bir hatayı 'çözdüm' demeden önce nasıl emin olursun?\" Önce yöntemi bizim dünyamıza uyarlayalım.\n\n### Bizim katmanlarımız: I2C sensörü\nAğdaki \"ping\" burada **I2C taraması** (33. ders): adreste biri cevap veriyor. Ama bir cihazın adresine cevap vermesi, doğru cihaz olduğunu ya da doğru veri verdiğini kanıtlamaz. Dört katmanı alttan üste sırayla doğrularız. Üstteki katmanı ancak alttakiler tamamsa test etmenin anlamı vardır:\n\n| Katman | Soru | Nasıl denenir |\n|---|---|---|\n| 1. Fiziksel | Hatlar (SDA/SCL) boşta HIGH mı, kısa devre var mı? | `digitalRead(A4)` ve `digitalRead(A5)` |\n| 2. Adres | Beklenen adreste bir cihaz cevap veriyor mu? | `beginTransmission` / `endTransmission` |\n| 3. Protokol (kimlik) | Cevap veren, **doğru** cihaz mı? | Kimlik yazmacını (WHO_AM_I) oku, beklenenle karşılaştır |\n| 4. Veri mantığı | Okunan değer **makul** mü? | Aralık kontrolü |\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.\n\n| Parça | Bağlantı |\n|---|---|\n| MPU6050 | VCC → **5V**, GND → **GND**, SDA → **A4**, SCL → **A5** |\n\nMPU6050'de (58. derste gördüğün ivmeölçer, adres 0x68) kimlik yazmacı 0x75'tir ve veri sayfasına göre `0x68` döner. Hareketsiz durumda ivmenin toplam büyüklüğü yaklaşık 1 g (yerçekimi) olmalıdır. Bu sketch dört katmanı sırayla dener ve **ilk hata veren katmanı** söyler:\n\n```cpp\n// sketch: katman_testi\n#include <Wire.h>\n\nconst byte ADRES = 0x68;\nconst byte YAZMAC_KIMLIK = 0x75;      // WHO_AM_I\nconst byte BEKLENEN_KIMLIK = 0x68;\nconst byte YAZMAC_GUC = 0x6B;         // uyku/güç yazmacı\nconst byte YAZMAC_IVME = 0x3B;        // ivme verisinin başı\nconst float MIN_G = 0.8;              // hareketsiz ivme büyüklüğü için makul aralık\nconst float MAKS_G = 1.2;\n\nint sonSonuc = -1;\nfloat sonG = 0;\n\nbool hatlarBosta() {\n  return digitalRead(A4) == HIGH && digitalRead(A5) == HIGH;\n}\n\nbool cihazVar() {\n  Wire.beginTransmission(ADRES);\n  return Wire.endTransmission() == 0;\n}\n\nint kimlikOku() {\n  Wire.beginTransmission(ADRES);\n  Wire.write(YAZMAC_KIMLIK);\n  if (Wire.endTransmission(false) != 0) return -1;\n  if (Wire.requestFrom((int)ADRES, 1) != 1) return -1;\n  return Wire.read();\n}\n\nbool ivmeBuyuklugu(float &g) {\n  Wire.beginTransmission(ADRES);\n  Wire.write(YAZMAC_IVME);\n  if (Wire.endTransmission(false) != 0) return false;\n  if (Wire.requestFrom((int)ADRES, 6) != 6) return false;\n  int16_t ham[3];\n  for (int i = 0; i < 3; i++) {\n    int yuksek = Wire.read();\n    int dusuk = Wire.read();\n    ham[i] = (int16_t)((yuksek << 8) | dusuk);\n  }\n  float x = ham[0] / 16384.0;         // varsayılan aralıkta 16384 LSB = 1 g\n  float y = ham[1] / 16384.0;\n  float z = ham[2] / 16384.0;\n  g = sqrt(x * x + y * y + z * z);\n  return true;\n}\n\n// 0 = hepsi tamam, 1-4 = ilk hata veren katman\nint ilkHataKatmani() {\n  if (!hatlarBosta()) return 1;\n  if (!cihazVar()) return 2;\n  if (kimlikOku() != BEKLENEN_KIMLIK) return 3;\n  float g;\n  if (!ivmeBuyuklugu(g)) return 4;\n  sonG = g;\n  if (g < MIN_G || g > MAKS_G) return 4;\n  return 0;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  Wire.beginTransmission(ADRES);      // uykudan uyandır\n  Wire.write(YAZMAC_GUC);\n  Wire.write(0);\n  Wire.endTransmission();\n  delay(100);\n}\n\nvoid loop() {\n  int sonuc = ilkHataKatmani();\n  if (sonuc == 0) {\n    Serial.print(\"TAMAM g=\");\n    Serial.println(sonG, 2);\n  } else if (sonuc == 1) {\n    Serial.println(\"Katman 1 HATA: SDA/SCL LOW'da takili\");\n  } else if (sonuc == 2) {\n    Serial.println(\"Katman 2 HATA: adreste cihaz yok\");\n  } else if (sonuc == 3) {\n    Serial.println(\"Katman 3 HATA: adres cevap veriyor ama kimlik yanlis\");\n  } else {\n    Serial.println(\"Katman 4 HATA: deger makul degil\");\n  }\n  if (sonSonuc != -1 && sonuc != sonSonuc) {\n    Serial.println(\"DEGISTI: sonuc kararsiz\");\n  }\n  sonSonuc = sonuc;\n  delay(1000);\n}\n```\n\n### Nasıl çalışıyor?\n1. `hatlarBosta()` I2C hatlarının boşta HIGH olduğuna bakar. Not: `Wire.begin()` Uno'da dahili çekme dirençlerini açar, bu yüzden bağlı olmasa bile hat genelde HIGH okunur. Bu test yalnızca hattın LOW'a takıldığı (kısa devre gibi) durumu yakalar; \"kablo hiç yok\" durumunu 2. katman bulur.\n2. `cihazVar()` 33. dersteki taramanın tek adrese indirgenmiş hâlidir.\n3. `kimlikOku()` adrese kimlik yazmacını sorar. Bu **ping'den daha çok bilgi** verir: yanlış cihaz adrese cevap veriyorsa, ya da kablolar yer değiştirmişse, burada yakalarsın.\n4. `ivmeBuyuklugu()` altı baytı okur (X, Y, Z için ikişer bayt), g'ye çevirir ve vektör büyüklüğünü hesaplar. Hareketsiz sensör için 0,8-1,2 g makul aralıktır. Sensör sallanıyorsa bu test yanlış alarm verir; aralık, testin **hangi koşulda** geçerli olduğunu bilmeni gerektirir.\n5. `ilkHataKatmani()` alttan üste sırayla dener ve ilk hatada durur. Alt katman bozukken üsttekini sormanın anlamı yoktur. Kök neden, **en alttaki** başarısız katmandır.\n6. Sonuç iki ölçüm arasında değişirse `DEGISTI` yazar. Vakadaki \"arada düzeliyor\" ipucunun kodudur.\n\n### Sensör hata modlarını laboratuvarda üretmek\nKatmanların hepsi laboratuvarda üretilemez. Hangisini üretebildiğini, hangisini yalnızca gerçek devrede göreceğini bil:\n\n| Hata modu | Hangi katman | Laboratuvarda nasıl üretilir |\n|---|---|---|\n| SDA ya da SCL kablosu yok | 2 | Kabloyu sil (devre durmuşken), ▶ |\n| Besleme yok | 2 | MPU6050'nin VCC kablosunu sil |\n| Adres farklı | 2 | Parçayı seç, **I2C adresi** özelliğini `0x69` yap (devre durmuşken); kod hâlâ `0x68`'i arar |\n| Veri sıfır (donmuş sensör) | 4 | Çalışırken `ax`, `ay` ve `az` özelliklerini 0 yap |\n| Veri doymuş ya da sallanma | 4 | Çalışırken `ax`, `ay` ve `az` özelliklerini 1,9 yap |\n| \"Arada düzeliyor\" | `DEGISTI` | `az`'yi çalışırken 0 yap, sonra 1'e geri al |\n| SDA hattı LOW'a takılı (kısa devre) | 1 | Uno'nun **A4** pinini bir kabloyla **GND**'ye bağla (devre durmuşken), ▶ |\n| Adreste yanlış cihaz | 3 | **Üretilemez.** Laboratuvarda beklenen adreste başka bir cihaz çıkaramazsın; MPU6050 yalnızca `0x68` ya da `0x69` olur. |\n\nKatman 3 kodda durur ama laboratuvar bu hatayı üretemediği için onu laboratuvarda sınamış olmazsın. Gerçek devrede bu satırın beklediğin gibi çalıştığını ayrıca doğrulaman gerekir.\n\n### Çerçeve ve checksum\nBir katman daha var: veri uzun bir mesajın parçasıysa, bozulup bozulmadığını anlamak için **checksum** kullanılır. Hyvex vakasında gimbal'ın UDP komut çerçevesinde checksum, belirli baytların **XOR**'udur. Çerçeve; sync (başlangıç), uzunluk, komut, parametre, checksum ve footer parçalarından oluşur. Alıcı checksum'ı yeniden hesaplamazsa, bozuk bir çerçeveyi geçerli sanır.\n\nBizim küçük çerçevemiz şu biçimde: `0xAA` (sync), `N` (veri baytı sayısı), `N` veri baytı, son bayt = `N` ve veri baytlarının XOR'u. Veri baytlarından ilki komut: `0x01` = LED, ikincisi parametre (1 = yan, 0 = sön).\n\n```cpp\n// sketch: xor_cerceve\nconst byte SYNC = 0xAA;\nconst byte MAKS_VERI = 8;\nconst int LED = 13;\n\nenum Asama { BEKLE, UZUNLUK, VERI, SUM };\nAsama asama = BEKLE;\nbyte veri[MAKS_VERI];\nbyte n = 0;\nbyte alinan = 0;\nbyte xorHesap = 0;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  while (Serial.available()) {\n    byte b = Serial.read();\n    switch (asama) {\n      case BEKLE:\n        if (b == SYNC) asama = UZUNLUK;       // sync dışındaki baytlar yok sayılır\n        break;\n      case UZUNLUK:\n        if (b == 0 || b > MAKS_VERI) {\n          Serial.println(\"UZUNLUK HATA\");\n          asama = BEKLE;\n        } else {\n          n = b;\n          alinan = 0;\n          xorHesap = b;\n          asama = VERI;\n        }\n        break;\n      case VERI:\n        veri[alinan++] = b;\n        xorHesap ^= b;\n        if (alinan == n) asama = SUM;\n        break;\n      case SUM:\n        if (b == xorHesap) {\n          Serial.println(\"CERCEVE TAMAM\");\n          if (veri[0] == 0x01 && n >= 2) digitalWrite(LED, veri[1] ? HIGH : LOW);\n        } else {\n          Serial.print(\"CHECKSUM HATA: gelen=\");\n          Serial.print(b, HEX);\n          Serial.print(\" hesaplanan=\");\n          Serial.println(xorHesap, HEX);        // bozuk çerçeve uygulanmaz\n        }\n        asama = BEKLE;\n        break;\n    }\n  }\n}\n```\n\nBu tasarımda checksum tutmazsa çerçeve **yok sayılır**: LED değişmez. Hyvex'teki cihazın tutmayan çerçevede ne yaptığı kaynakta yazılı değil; sana düşen soru da bu: bir cihaz bozuk komutu uygulasaydı ne olurdu?\n\n### Dene\n- `katman_testi` çalışırken `ax` özelliğini 0,8 yap (sensör yana doğru hızlanıyormuş gibi). Toplam büyüklük yaklaşık 1,28 g olur: hangi katman hata veriyor? Neden bu bir sensör arızası değil?\n- `MIN_G` ve `MAKS_G` değerlerini daralt ve geniş tut: hangisi yanlış alarm, hangisi kaçırılmış hata üretir?\n- `xor_cerceve` için `AA 02 01 01 02` çerçevesinin geçerli olduğunu kendin XOR'layarak doğrula (`02 ^ 01 ^ 01 = 02`). Sonra son baytı değiştir.\n- Bir cihazı kullanmadan önce her açılışta bu katmanları kendi sketch'ine ekle.\n- `az` özelliğini 0 ile 1 arasında hızlıca değiştirip `DEGISTI` mesajının ne zaman çıktığına bak.\n\n### Sık yapılan hatalar\n- \"Ping (tarama) cevap veriyor, demek ki cihaz çalışıyor\" demek. Adres cevabı kimlik ve veri doğruluğu demek değildir.\n- Hata bulununca ilk işi yazılımı değiştirmek; önce alt katmanları doğrula.\n- \"Arada düzeliyor\" diye hatayı geçiştirmek. Kararsız davranış bir katmanın sağlıksız olduğunu gösterir.\n- Aralık kontrolünü koşulsuz yapmak: sensör hareket ederken yanlış alarm verir.\n- Checksum'ı hesaplamayıp gelen baytı güvenmek.",
          "question": "Bir hatayı \"çözdüm\" demeden önce nasıl emin olursun? Bu dersteki dört katmanın hepsini hata öncesi ve sonrası yeniden denemek yeterli mi, yoksa sorunun \"arada\" geri gelmediğini görmek için bir süre beklemek mi gerekir?",
          "explainerMd": "### Bu derste öğreneceklerin\n- \"Cihaz cevap veriyor\" ile \"cihaz doğru çalışıyor\" arasındaki farkı\n- Hatayı alttan üste, dört katmanda aramayı\n- Kimlik yazmacıyla (WHO_AM_I) doğru cihazı doğrulamayı ve değer makullüğünü kontrol etmeyi\n- XOR checksum ile bozuk bir mesajı yakalamayı\n\n### Önceden bilmen gerekenler\n- 33. ders: I2C, `Wire` ve adres tarama\n- 58. ders: MPU6050 ivmeölçer (adres 0x68, ivme birimi g)\n- 28. ders: `enum` ile durum makinesi\n\n### Ping var, veri yok\nBir gimbal kamera USB-Ethernet ile laptopa bağlıydı. `ping` cevap veriyordu ama telemetri ve video kopuyordu. Hyvex ekibinin staj programındaki bu vakada kök neden yazılım değildi: NetworkManager, DHCP ile cihazın IP'sini siliyordu ve çözüm kalıcı bir statik profil tanımlamaktı. Vakadaki ipucu \"arada düzeliyor\" cümlesidir: bir katman kararsızdır.\n\nDers şu: bir şeyin **bir** katmanı çalışıyor diye hepsi çalışmıyor demektir.\n\n### Dört katman\nI2C sensöründe \"ping\", adres taramasıdır. Hatayı alttan üste ararız ve ilk başarısız katman kök nedendir:\n\n| Katman | Soru | Nasıl denenir |\n|---|---|---|\n| 1. Fiziksel | SDA/SCL hatları boşta HIGH mı? | `digitalRead(A4)`, `digitalRead(A5)` |\n| 2. Adres | Beklenen adres cevap veriyor mu? | `beginTransmission` / `endTransmission` |\n| 3. Kimlik | Cevap veren doğru cihaz mı? | WHO_AM_I yazmacını oku (MPU6050'de 0x75, beklenen 0x68) |\n| 4. Veri | Değer makul mü? | Aralık kontrolü (hareketsiz ivme ≈ 1 g) |\n\nAdres cevabı kimliği kanıtlamaz: başka bir cihaz aynı adresi kullanabilir. Kimlik doğru olsa bile donmuş bir sensör hep 0 verebilir. Bu yüzden her katman ayrı sınanır.\n\n### Makullük kontrolünün sınırı\nHareketsiz ivmeölçerin üç ekseninin vektör büyüklüğü yaklaşık 1 g'dir:\n\n```\ng = karekök(x*x + y*y + z*z)\n```\n\nAralığı 0,8-1,2 g seçtiysen ve sensör eğik ya da hareket ediyorsa, toplam büyüklük bu aralığın dışına çıkabilir (örneğin x = 0,5, y = 0,5, z = 1 için g ≈ 1,22). Bu bir sensör arızası değildir; kontrolün geçerli olduğu koşul (hareketsiz) sağlanmamıştır.\n\n### Checksum\nBir mesaj uzun bir yoldan geçerse bozulabilir. Alıcı bunu anlamak için **checksum** kullanır. Basit bir yöntem, belirli baytların **XOR**'udur. Bizim çerçevemiz: sync (0xAA), uzunluk N, N veri baytı, son bayt = N ve veri baytlarının XOR'u. Alıcı XOR'u kendisi yeniden hesaplar; tutmuyorsa çerçeveyi yok sayar.\n\nÖrnek: `AA 02 01 01 02`. N = 2, veri 01 ve 01. 2 XOR 1 XOR 1 = 2, son bayt 2 ile eşleşir: çerçeve geçerli.\n\n### Özet\nBir katmanın cevap vermesi sistemin çalıştığını göstermez; hatayı fiziksel, adres, kimlik ve veri katmanlarında alttan üste ara. Kimlik yazmacı ping'den çok bilgi verir. Makullük aralığı yalnızca geçerli olduğu koşulda anlamlıdır. Checksum, bozuk mesajı geçerli sanmanı engeller. \"Arada düzeliyor\" cümlesi, bir katmanın kararsız olduğunun işaretidir.",
          "concepts": [
            {
              "term": "Katmanlı hata ayıklama",
              "definition": "Hatayı alttan üste (fiziksel, adres, kimlik, veri) sırayla doğrulayıp ilk başarısız katmanı kök neden saymak.",
              "example": "Adres cevap veriyor ama kimlik yazmacı beklenenden farklı: kök neden katman 3'tedir.",
              "pitfall": "Alt katmanı doğrulamadan yazılımı değiştirmeye başlamak."
            },
            {
              "term": "WHO_AM_I yazmacı",
              "definition": "Birçok sensörde cihazın kimliğini veren yazmaç; MPU6050'de adresi 0x75, beklenen değeri 0x68'dir.",
              "example": "Wire ile 0x75'i okuyup 0x68 gelmezse yanlış ya da arızalı bir cihaz vardır.",
              "pitfall": "Adres cevabını \"doğru cihaz bu\" diye yorumlamak."
            },
            {
              "term": "Makullük kontrolü",
              "definition": "Okunan değerin fiziksel olarak beklenen aralıkta olup olmadığına bakmak.",
              "example": "Hareketsiz MPU6050'de ivme büyüklüğü yaklaşık 1 g olmalı; 0 g ya da 1,9 g şüphelidir.",
              "pitfall": "Kontrolü koşulsuz yapmak: sensör hareket ederken yanlış alarm verir."
            },
            {
              "term": "XOR checksum",
              "definition": "Mesajdaki baytların XOR'u alınarak elde edilen ve alıcının yeniden hesaplayıp karşılaştırdığı kontrol baytı.",
              "example": "AA 02 01 01 02 çerçevesinde 02 ^ 01 ^ 01 = 02, son bayt eşleşir.",
              "pitfall": "Checksum'ı hesaplamadan gelen baytı doğru sanmak; bozuk çerçeve uygulanır."
            }
          ],
          "quiz": [
            {
              "id": "m4h8d4-q1",
              "kind": "mcq",
              "prompt": "MPU6050 için adres 0x68 cevap veriyor, ama kimlik yazmacından (WHO_AM_I) 0x70 geliyor (beklenen 0x68). Hata hangi katmandadır?",
              "options": [
                "Katman 1 (fiziksel hatlar)",
                "Katman 2 (adres)",
                "Katman 3 (kimlik)",
                "Katman 4 (veri makullüğü)"
              ],
              "answer": 2,
              "explanation": "Fiziksel hatlar ve adres tamam; cevap veren cihaz beklenen kimliği vermiyor, yani yanlış ya da farklı bir cihaz. İlk başarısız katman 3'tür. Katman 4'ü sınamanın anlamı yoktur, çünkü cihazın kim olduğu bilinmiyor.",
              "skills": [
                "dbg-layers"
              ]
            },
            {
              "id": "m4h8d4-q2",
              "kind": "numeric",
              "prompt": "Çerçeve: sync 0xAA, N = 3, veri baytları 0x01, 0x01, 0x06. Son bayt = N ve veri baytlarının XOR'u. Son baytın değeri (onluk) kaçtır?",
              "answer": 5,
              "tolerance": 0,
              "explanation": "3 XOR 1 = 2, 2 XOR 1 = 3, 3 XOR 6 = 5. Alıcı aynı hesabı yapıp 5'i bulamazsa çerçeve bozulmuştur ve yok sayılır.",
              "skills": [
                "dbg-checksum"
              ]
            },
            {
              "id": "m4h8d4-q3",
              "kind": "predict-output",
              "prompt": "Hareketsiz sanılan bir MPU6050 eğik tutuluyor (x = 0,5, y = 0,5, z = 1,0 g). Bu kod ne yazar?\n\n```cpp\nvoid setup() {\n  Serial.begin(9600);\n  float x = 0.5, y = 0.5, z = 1.0;\n  float g = sqrt(x * x + y * y + z * z);\n  if (g < 0.8 || g > 1.2) Serial.println(\"HATA\");\n  else Serial.println(\"TAMAM\");\n}\nvoid loop() {}\n```",
              "options": [
                "TAMAM",
                "Hiçbir şey yazmaz",
                "Derleme hatası verir",
                "HATA"
              ],
              "answer": 3,
              "explanation": "g = karekök(0,25 + 0,25 + 1) ≈ 1,22, bu 1,2'den büyüktür, bu yüzden HATA yazar. Sensör sağlam; makullük aralığı \"hareketsiz\" koşuluna dayandığı için sensör eğik ya da hızlanırken yanlış alarm verir.",
              "skills": [
                "dbg-layers",
                "dbg-plausibility"
              ]
            },
            {
              "id": "m4h8d4-q4",
              "kind": "find-bug",
              "prompt": "Bu çerçeve ayrıştırıcıda geçerli çerçeveler (örneğin AA 02 01 01 02) hep CHECKSUM HATA veriyor. Hata hangisi?\n\n```cpp\ncase UZUNLUK:\n  n = b;\n  alinan = 0;\n  xorHesap = 0;      // satır A\n  asama = VERI;\n  break;\ncase VERI:\n  xorHesap ^= b;     // satır B\n  alinan++;\n  if (alinan == n) asama = SUM;\n  break;\n```",
              "options": [
                "alinan++ satırı gereksiz",
                "n = b satırı gereksiz",
                "Satır A: XOR, uzunluk baytı n ile başlamalı (xorHesap = b)",
                "Satır B: ^= yerine += kullanılmalı"
              ],
              "answer": 2,
              "explanation": "Çerçevenin sağlama baytı N ve veri baytlarının XOR'udur. xorHesap sıfırdan başlarsa N hesaba katılmaz: 01 ^ 01 = 0 çıkar ve gelen 02 ile eşleşmez. Doğrusu xorHesap = b. XOR yerine toplama kullanmak başka bir yöntemdir ve çerçeve tanımıyla uyuşmaz.",
              "skills": [
                "dbg-checksum",
                "prog-debug"
              ]
            },
            {
              "id": "m4h8d4-q5",
              "kind": "mcq",
              "prompt": "Bir arkadaşın \"sensör arada düzeliyor, önemli değil\" diyor. En doğru yaklaşım hangisi?",
              "options": [
                "Düzeldiğine göre sorun yok, bırak",
                "Kararsızlık bir katmanın sağlıksız olduğunu gösterir; katmanları alttan üste yeniden sına ve sorunun geri gelmediğinden emin olana dek izle",
                "Kodu baştan yaz",
                "Sensörü hemen çöpe at"
              ],
              "answer": 1,
              "explanation": "Hyvex vakasındaki gibi \"arada düzeliyor\" kararsız bir katmanın işaretidir. Kök nedeni bulmadan geçiştirmek hatayı sonra geri getirir. Kodu baştan yazmak ya da sensörü atmak, hangi katmanın sorunlu olduğunu bilmeden verilen ölçüsüz tepkilerdir.",
              "skills": [
                "dbg-layers"
              ]
            }
          ]
        },
        {
          "title": "Bitirme projesi: Akıllı oda",
          "durationMin": 35,
          "problem": "Sınıfta ışıklar boş odada yanık kalır, fan kimse yokken döner. Akıllı bir oda ise sana sormaz: kimse yoksa tasarruf eder, biri girince ve hava karanlıksa ışığı yakar, ısınınca fanı açar. Bu, modülün bitirme projesi: öğrendiğin sensörleri tek bir durum makinesinde birleştireceksin ve laboratuvarda gördüğünün gerçek devrede nerede farklı olacağını bileceksin.",
          "contentMd": "### Ne yapacağız?\nBu proje öğrendiklerini birleştirir:\n- **Hafta 2:** PIR ile hareket algılama ve ısınma süresi (D2).\n- **Hafta 3:** DHT22 ile sıcaklık ve nem (D5).\n- **Hafta 4:** LDR ile ışık ölçümü ve histerezis (A1).\n- **Hafta 5 ve Modül 3:** Röleyle fan kontrolü (D7), histerezis.\n- **Hafta 6 ve Modül 3:** `millis()` ile bloklamayan kod, durum makinesi, I2C LCD.\n- **Hafta 8:** Gerçek dünya etkilerine karşı savunma: buton sıçraması için bekleme payı (D3), gürültü için eşik histerezisi, sensör arızasında güvenli davranış (fail-safe) ve PIR ısınması.\n\n### Devre\nParçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. \"Fan\" için küçük bir motor yerine ikinci bir LED kullanıyoruz.\n\n| Parça | Bağlantı |\n|---|---|\n| PIR | VCC → **5V**, GND → **GND**, OUT → **D2** |\n| DHT22 | VCC → **5V**, GND → **GND**, DATA → **D5** (Tür özelliği DHT22) |\n| LDR | 1 → **5V**, 2 → **A1** |\n| Direnç (10 kΩ) | 1 → **A1**, 2 → **GND** (aydınlıkta A1 yükselir) |\n| Röle | VCC → **5V**, GND → **GND**, IN → **D7**; COM → **5V**, NO → fan direncinin 1 ucu |\n| Direnç (330 Ω, fan) | 1 → rölenin NO ucu, 2 → \"fan\" LED'inin A ucu |\n| LED (\"fan\") | A → fan direncinin 2 ucu, K → **GND** |\n| Direnç (330 Ω, lamba) | 1 → **D13**, 2 → \"lamba\" LED'inin A ucu |\n| LED (\"lamba\") | A → lamba direncinin 2 ucu, K → **GND** |\n| Buton | A → **D3**, B → **GND** (`INPUT_PULLUP`) |\n| I2C LCD 16x2 | GND → **GND**, VCC → **5V**, SDA → **A4**, SCL → **A5** (adres 0x27) |\n\nLaboratuvarda 5V hattı ideal olduğu için fanı karttan beslemek sorun çıkarmaz (73. ders); gerçek devrede çıkarırdı. Güvenlik: bu projede şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; röle yalnızca düşük gerilimli \"fan\" yükünü anahtarlar.\n\nPIR çıkışı hareket varken HIGH olur ve hareket bittikten sonra bir süre HIGH kalır; laboratuvarda ısınma 2 sn, bekleme 3 sn'dir (41. ders). Gerçek modüllerde bu süreler modele göre değişir. DHT22 okumaları arası en az 2 saniye bırakılmalıdır (46. ders).\n\n### Durum makinesi\n| Durum | Lamba | Fan | LCD ışığı | Durumdan çıkış |\n|---|---|---|---|---|\n| ISINMA | Kapalı | Kapalı | Açık | `ISINMA_SURESI` dolunca BOS. PIR yok sayılır. |\n| BOS | Kapalı | Kapalı | **Kapalı** (tasarruf) | PIR hareket görürse DOLU |\n| DOLU | Karanlıksa açık | Sıcaksa açık | Açık | Son hareketten `BOS_SURESI` sonra BOS |\n| KAPALI | Kapalı | Kapalı | Açık | Buton: KAPALI ile BOS arasında geçiş |\n\n- **Işık:** Yalnızca oda DOLU iken ve karanlıkken yanar. Karanlık/aydınlık kararı **histerezisle** verilir: ADC değeri 300'ün altına inince karanlık, 400'ün üstüne çıkınca aydınlık. İkisi arasında önceki karar korunur (71. ders). Laboratuvarda eşikleri LDR'nin **Işık** özelliğiyle denersin; gerçek odada eşikleri o ortamın ışığına göre kalibre etmen gerekir (73. ders).\n- **Fan:** Yalnızca DOLU iken ve sıcaklık 28 °C'a ulaşınca açılır, 26 °C'a inince kapanır.\n- **Güvenli varsayılan:** DHT22 okunamıyorsa ya da değer makul aralığın dışındaysa (74. ders) fan **kapalı** kalır ve LCD `DHT HATA` yazar. Bilinmeyen sıcaklıkta fanı açık tutmak yerine kapatmak, Hyvex vakasındaki \"kontrol kopunca ne olur?\" sorusunun bu projedeki karşılığıdır: tehlikeli ya da masraflı çıkış varsayılan olarak kapalı olur.\n- **Süreler:** Derste hızlı denemek için `ISINMA_SURESI` 3 sn, `BOS_SURESI` 8 sn alındı. Laboratuvarın PIR ısınması 2 sn'dir, `ISINMA_SURESI` bunun üstünde olmalıdır. Gerçek modülde ısınma çok daha uzundur ve boş oda süresi dakikalarla ölçülür.\n\n### Program\n```cpp\n// sketch: akilli_oda\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <DHT.h>\n\nconst int PIR = 2;\nconst int DUGME = 3;\nconst int DHT_PIN = 5;\nconst int ROLE = 7;\nconst int LAMBA = 13;\nconst int LDR = A1;\n\nconst unsigned long ISINMA_SURESI = 3000;    // ms (gerçekte çok daha uzun)\nconst unsigned long BOS_SURESI = 8000;       // ms (gerçekte dakikalar)\nconst unsigned long OLCUM_ARALIGI = 2000;    // DHT22 için en az 2 sn\nconst unsigned long EKRAN_ARALIGI = 500;\nconst int KARANLIK_ALT = 300;                // bunun altı: karanlık\nconst int AYDINLIK_UST = 400;                // bunun üstü: aydınlık\nconst float FAN_ACIK = 28.0;\nconst float FAN_KAPAT = 26.0;\n\nenum Durum { ISINMA, BOS, DOLU, KAPALI };\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nDHT dht(DHT_PIN, DHT22);\n\nDurum durum = ISINMA;\nbool karanlik = false;\nbool fan = false;\nbool olculdu = false;                // ilk DHT okuması yapıldı mı?\nbool sensorTamam = false;\nfloat sicaklik = 0;\nfloat nem = 0;\nbool arkaIsik = true;\nbool oncekiDugme = false;\nunsigned long sonDugme = 0;\nunsigned long sonHareket = 0;\nunsigned long sonOlcum = 0;\nunsigned long sonEkran = 0;\n\nconst char *durumAdi() {\n  if (durum == ISINMA) return \"ISINMA\";\n  if (durum == BOS) return \"BOS   \";\n  if (durum == DOLU) return \"DOLU  \";\n  return \"KAPALI\";\n}\n\nvoid gec(Durum yeni) {\n  durum = yeni;\n  Serial.print(\"durum=\");\n  Serial.println(durumAdi());\n}\n\nvoid ekranYaz() {\n  lcd.setCursor(0, 0);\n  if (!olculdu) {\n    lcd.print(\"Olcum bekleniyor\");\n  } else if (!sensorTamam) {\n    lcd.print(\"DHT HATA        \");\n  } else {\n    lcd.print(\"T:\");\n    lcd.print(sicaklik, 1);\n    lcd.print(\"C N:%\");\n    lcd.print((int)nem);\n    lcd.print(\"    \");\n  }\n  lcd.setCursor(0, 1);\n  lcd.print(durumAdi());\n  lcd.print(\" L\");\n  lcd.print(digitalRead(LAMBA) == HIGH ? 1 : 0);\n  lcd.print(\" F\");\n  lcd.print(fan ? 1 : 0);\n  lcd.print(\"   \");\n}\n\nvoid setup() {\n  pinMode(PIR, INPUT);\n  pinMode(DUGME, INPUT_PULLUP);\n  pinMode(ROLE, OUTPUT);\n  pinMode(LAMBA, OUTPUT);\n  digitalWrite(ROLE, LOW);             // varsayılan: kapalı\n  digitalWrite(LAMBA, LOW);\n  Serial.begin(9600);\n  dht.begin();\n  lcd.init();\n  lcd.backlight();\n  ekranYaz();\n}\n\nvoid loop() {\n  unsigned long simdi = millis();\n\n  // 1) Buton: basıldığı an bir kez, 50 ms sıçrama payıyla\n  bool basili = (digitalRead(DUGME) == LOW);\n  if (basili && !oncekiDugme && simdi - sonDugme > 50) {\n    sonDugme = simdi;\n    if (durum == KAPALI) gec(BOS); else gec(KAPALI);\n  }\n  oncekiDugme = basili;\n\n  // 2) PIR: ısınırken ve kapalıyken yok sayılır\n  bool hareket = (digitalRead(PIR) == HIGH);\n  if (hareket && (durum == BOS || durum == DOLU)) {\n    sonHareket = simdi;\n    if (durum == BOS) gec(DOLU);\n  }\n\n  // 3) Işık: her turda oku, histerezisle karar ver\n  int isik = analogRead(LDR);\n  if (!karanlik && isik < KARANLIK_ALT) karanlik = true;\n  if (karanlik && isik > AYDINLIK_UST) karanlik = false;\n\n  // 4) Sıcaklık ve nem: iki saniyede bir\n  if (simdi - sonOlcum >= OLCUM_ARALIGI) {\n    sonOlcum = simdi;\n    float t = dht.readTemperature();\n    float h = dht.readHumidity();\n    olculdu = true;\n    sensorTamam = !isnan(t) && !isnan(h) && t > -40 && t < 80 && h >= 0 && h <= 100;\n    if (sensorTamam) {\n      sicaklik = t;\n      nem = h;\n    }\n  }\n\n  // 5) Durum geçişleri (zamana bağlı)\n  if (durum == ISINMA && simdi >= ISINMA_SURESI) gec(BOS);\n  if (durum == DOLU && simdi - sonHareket >= BOS_SURESI) gec(BOS);\n\n  // 6) Fan: histerezis; sensör bozuksa ya da oda DOLU değilse kapalı\n  if (durum != DOLU || !sensorTamam) {\n    fan = false;\n  } else if (sicaklik >= FAN_ACIK) {\n    fan = true;\n  } else if (sicaklik <= FAN_KAPAT) {\n    fan = false;\n  }\n\n  // 7) Çıkışlar\n  digitalWrite(LAMBA, (durum == DOLU && karanlik) ? HIGH : LOW);\n  digitalWrite(ROLE, fan ? HIGH : LOW);\n\n  // 8) Ekran ve arka ışık: BOS iken ışık kapalı (tasarruf)\n  bool arkaIstenen = (durum != BOS);\n  if (arkaIstenen != arkaIsik) {\n    arkaIsik = arkaIstenen;\n    if (arkaIsik) lcd.backlight(); else lcd.noBacklight();\n  }\n  if (simdi - sonEkran >= EKRAN_ARALIGI) {\n    sonEkran = simdi;\n    ekranYaz();\n  }\n}\n```\n\n### Nasıl çalışıyor?\n1. `loop` hiçbir yerde `delay` kullanmaz; her iş kendi zamanını `millis()` ile tutar (27. ders). Bu sayede buton, PIR ve ışık her turda izlenir, DHT ise iki saniyede bir okunur.\n2. Her turda önce **girdiler** (buton, PIR, LDR, DHT), sonra **durum geçişleri**, sonra **çıkışlar** (lamba, röle, ekran) hesaplanır. Çıkışlar durumun doğrudan sonucudur.\n3. PIR yalnızca BOS ve DOLU durumlarında dikkate alınır: ısınırken PIR'ın verdiği sahte hareket yok sayılır (41. ders). KAPALI iken de PIR yok sayılır.\n4. Fan koşulu açıkça \"güvenli taraf\" yazılmıştır: oda DOLU değilse ya da sensör geçersizse `fan = false`. Aksi hâlde sıcaklığa bakılır.\n5. DHT okuması `isnan` ve aralık kontrolüyle doğrulanır (74. dersteki \"değer makul mü\" katmanı). Sensör bozuksa son iyi değer ekranda kalmaz; `DHT HATA` yazılır.\n6. LCD arka ışığı yalnızca durum değiştiğinde güncellenir; böylece I2C hattı gereksiz meşgul edilmez.\n\n### Uçtan uca denemek\nBu bölümde laboratuvarda sırayla şunları dene; her adımda ne beklediğini önce kendin tahmin et. Parça özelliklerini çalışırken sağ panelden değiştirirsin:\n1. ▶'e bas ve ilk 2 sn içinde PIR'ın **Hareket** özelliğini aç-kapa: ısınma sırasında PIR çıkışı parazitli oynar ama durum ISINMA kalmalı, lamba sönük. LCD'nin alt satırı `ISINMA` yazar.\n2. 3 sn sonra LDR'nin **Işık** özelliğini 0,2 yap (karanlık). PIR'ın **Hareket** özelliğini aç-kapa: durum DOLU olmalı, lamba yanmalı.\n3. **Işık** özelliğini 0,9 yap: lamba sönmeli. Sonra yaklaşık 0,46 yap (ne karanlık ne aydınlık): lamba önceki kararda kalmalı.\n4. DHT22'nin **Sıcaklık** özelliğini 29 °C yap: fan LED'i (röle) 2 sn içinde yanmalı. 27 °C'ye indir: açık kalmalı. 25 °C'de kapanmalı. (DHT22 en çok 2 sn'de bir okunur; tepki gecikmesi laboratuvarda da vardır.)\n5. 8 sn hareket olmasın: durum BOS; lamba ve fan kapanmalı, LCD arka ışığı sönmeli.\n6. Butona bas: KAPALI; PIR'ı tetikle, hiçbir şey olmamalı. Bir daha bas: BOS. (Laboratuvarın butonu sıçramaz; koddaki 50 ms'lik pay bu yüzden denenmemiş kalır.)\n7. ■ ile durdur, DHT22'nin DATA kablosunu sil, ▶ ile yeniden başlat. 3 sn sonra PIR'ı tetikle: fan kapalı, LCD `DHT HATA` yazmalı; lamba çalışmaya devam eder.\n\n### Dene\n- `FAN_ACIK` ile `FAN_KAPAT` farkını 0,5 °C yap: fan ne sıklıkla açılıp kapanıyor?\n- Odada yalnızca ışık değil nem de yüksekse (örneğin %70 üstü) fanı çalıştır. Hangi bölüme ekleyeceksin?\n- BOS durumundan çıkarken LCD'ye \"Hos geldin\" yaz ve 2 sn sonra silinsin (bloklamadan).\n- `BOS_SURESI`'ni EEPROM'a yazıp butonla ayarla.\n\n### Sık yapılan hatalar\n- PIR'ın ısınma süresini hesaba katmamak: açılışta oda \"dolu\" sanılır.\n- LDR bölücüsünü ters kurmak: \"karanlık\" ile \"aydınlık\" yer değiştirir.\n- Tek eşik kullanıp lambanın titremesine izin vermek.\n- DHT22'yi iki saniyeden sık okumak.\n- Sensör geçersizken fanı açık bırakmak.\n- Röleyle şebeke gerilimi kullanmak: bu projede kesinlikle yapılmaz.\n- Fanı kartın 5 V pininden beslemek: gerçek devrede kart sıfırlanabilir; laboratuvar bunu göstermez (73. ders).",
          "question": "Bu proje laboratuvarda mükemmel çalışsa bile gerçek odaya taşıdığında hangi üç şey seni şaşırtır? (Aklına gelsin: buton sıçraması, analog gürültü, besleme gerilimi ve PIR'ın gerçek ısınma süresi.) Odayı gerçekten bırakıp çıkmadan önce hangi güvenlik önlemini eklerdin?",
          "explainerMd": "### Bu derste öğreneceklerin\n- Birkaç sensörü tek bir durum makinesinde birleştirmeyi\n- Girdi, durum ve çıkışı ayrı tutan program düzenini\n- İki farklı histerezisi (ışık ve fan) aynı programda kullanmayı\n- Sensör bozulunca güvenli davranmayı ve laboratuvarın sınırlarını bilmeyi\n\n### Önceden bilmen gerekenler\n- 41. ders: PIR (laboratuvarda ısınma 2 sn, bekleme 3 sn)\n- 46. ders: DHT22 (iki saniyeden sık okunmaz)\n- 51. ders: LDR ve histerezis\n- 24, 27, 28. dersler: röle, `millis()` ve durum makinesi\n- 71, 73 ve 74. dersler: histerezis, fail-safe ve makullük kontrolü\n\n### Akıllı oda ne yapar?\nAkıllı oda; PIR (hareket), LDR (ışık), DHT22 (sıcaklık), röle (fan), I2C LCD ve bir butonu birlikte kullanır. Mantık basittir: oda boşsa tasarruf et, biri girince ve ortam karanlıksa lambayı yak, sıcaksa fanı aç.\n\n### Dört durum\n| Durum | Lamba | Fan | Çıkış koşulu |\n|---|---|---|---|\n| ISINMA | Kapalı | Kapalı | Isınma süresi dolunca BOS |\n| BOS | Kapalı | Kapalı | PIR hareket görürse DOLU |\n| DOLU | Karanlıksa açık | Sıcaksa açık | Son hareketten `BOS_SURESI` sonra BOS |\n| KAPALI | Kapalı | Kapalı | Buton: KAPALI ile BOS arası |\n\nÇıkışlar durumun doğrudan sonucudur. Programın her turu üç adımdır: önce **girdileri** oku (buton, PIR, LDR, DHT), sonra **durumu** güncelle, sonra **çıkışları** yaz (lamba, röle, ekran). `delay()` kullanılmaz, her iş `millis()` ile kendi zamanını tutar.\n\n### İki histerezis\nIşık için: ADC 300'ün altına inince karanlık, 400'ün üstüne çıkınca aydınlık; arada karar korunur. Fan için: 28 °C'ta açılır, 26 °C'ta kapanır. İki bant, gürültü ya da küçük dalgalanmalarda yanıp sönmeyi önler.\n\nLDR 5 V ile A1 arasında, 10 kΩ direnç A1 ile GND arasındadır. Işık özelliği 0,5 iken LDR yaklaşık 14,1 kΩ olur, A1 gerilimi yaklaşık 2,07 V ve ADC yaklaşık 424 okunur; yani \"aydınlık\" tarafındadır.\n\n### Güvenli varsayılanlar\nDHT22 `isnan` döndürürse ya da değer makul aralığın (örneğin -40...80 °C) dışındaysa sensör geçersiz sayılır. Bu durumda fan **kapalı** kalır ve LCD `DHT HATA` yazar. PIR, ISINMA ve KAPALI durumlarında yok sayılır.\n\n### Laboratuvardan gerçeğe\nLaboratuvar ADC basamağını ve zamanlamayı modeller; ama gürültü, buton sıçraması ve 5V çökmesini göstermez. Gerçek odada eşikleri o ortamın ışığına göre yeniden kalibre eder, fanı karttan değil ayrı kaynaktan beslersin. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.\n\n### Özet\nAkıllı oda; girdi, durum ve çıkışı ayıran bir durum makinesidir. Işık ve fan kararları histerezisle verilir. Sensör geçersizse fan kapalı kalır. Laboratuvarda çalışan bir tasarım, gürültü, sıçrama ve güç etkilerine karşı gerçek devrede ayrıca doğrulanmalıdır.",
          "concepts": [
            {
              "term": "Girdi - durum - çıkış düzeni",
              "definition": "Her turda önce girdileri okuyup, sonra durumu güncelleyip, en son çıkışları yazan program düzeni.",
              "example": "Önce buton, PIR, LDR ve DHT okunur; sonra DOLU/BOS kararı verilir; sonra lamba ve röle yazılır.",
              "pitfall": "Çıkışı girdi okunduğu yerde, yarım kalmış bir durumla yazmak; lamba ve fan tutarsız davranır."
            },
            {
              "term": "Durum makinesi",
              "definition": "Programın her an yalnızca bir durumda olduğu ve olaylarla durumlar arasında geçtiği yapı.",
              "example": "ISINMA, BOS, DOLU ve KAPALI durumları; PIR hareketi BOS'tan DOLU'ya geçirir.",
              "pitfall": "Durumu belirtmeden bayraklarla (bool) dağınık bir mantık kurmak; hangi çıkışın neden açıldığı karışır."
            },
            {
              "term": "İki bantlı karar",
              "definition": "Aynı programda birden çok histerezis kullanma: her sensörün kendi açma ve kapama eşiği vardır.",
              "example": "Işık: 300 altı karanlık, 400 üstü aydınlık. Fan: 28 °C açar, 26 °C kapatır.",
              "pitfall": "Fan için de tek eşik (28 °C) kullanmak; sıcaklık eşiğin etrafında dalgalanınca röle çıtırdar."
            },
            {
              "term": "Güvenli varsayılan",
              "definition": "Sensör geçersiz ya da durum belirsizse masraflı veya tehlikeli çıkışı kapalı bırakma.",
              "example": "DHT22 isnan verirse fan = false ve LCD DHT HATA yazar.",
              "pitfall": "Geçersiz bir sıcaklık okumasını son iyi değer sanıp fanı açık bırakmak."
            }
          ],
          "quiz": [
            {
              "id": "m4h8d5-q1",
              "kind": "predict-output",
              "prompt": "Fan eşikleri 28 ve 26 °C. Sıcaklık sırayla 25, 28, 27, 26, 29 olarak okunuyor. Bu kod ne yazar?\n\n```cpp\nfloat t[] = {25, 28, 27, 26, 29};\nbool fan = false;\n\nvoid setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 5; i++) {\n    if (t[i] >= 28.0) fan = true;\n    else if (t[i] <= 26.0) fan = false;\n    Serial.print(fan ? 1 : 0);\n  }\n}\nvoid loop() {}\n```",
              "options": [
                "01100",
                "01101",
                "01111",
                "01001"
              ],
              "answer": 1,
              "explanation": "25: kapalı (0). 28: açar (1). 27: bandın içinde, açık kalır (1). 26: kapatır (0). 29: yeniden açar (1). Çıktı 01101. 27 °C'de açık kalması histerezistir; tek eşik olsaydı 27'de kapalı olurdu.",
              "skills": [
                "sens-hysteresis",
                "proj-statemachine"
              ]
            },
            {
              "id": "m4h8d5-q2",
              "kind": "numeric",
              "prompt": "LDR 5 V ile A1 arasında, 10 kΩ direnç A1 ile GND arasında. Işık = 0,5 iken LDR yaklaşık 14,1 kΩ'dur. analogRead(A1) yaklaşık kaç okur? (Gerilim bölücü: V = 5 x 10 / (10 + 14,1))",
              "answer": 424,
              "tolerance": 3,
              "explanation": "V = 5 x 10 / 24,1 ≈ 2,07 V. ADC = 2,07 / 5 x 1023 ≈ 424. Bu değer 400'ün üstündedir, yani aydınlık eşiğinin üstünde; 300-400 arasında olsaydı önceki karar korunurdu.",
              "skills": [
                "proj-integration",
                "elec-ohm"
              ]
            },
            {
              "id": "m4h8d5-q3",
              "kind": "mcq",
              "prompt": "Oda DOLU, sıcaklık 30 °C, ama DHT22 bağlantısı koptu ve okuma isnan döndürüyor. Doğru davranış hangisi?",
              "options": [
                "Fan son iyi okumaya göre açık kalsın",
                "Fan kapanır ve LCD'de DHT HATA yazar",
                "Sıcaklık 0 °C kabul edilir ve fan kapanır, hata gösterilmez",
                "Program durur ve hiçbir çıkış güncellenmez"
              ],
              "answer": 1,
              "explanation": "Sensör geçersizse bilinmeyen durumda masraflı çıkış (fan) kapalı kalır ve kullanıcı hatadan haberdar edilir. Eski değeri kullanmak gerçekle bağını koparır, sessizce 0 °C kabul etmek hatayı gizler, programı durdurmak lambayı ve ekranı da bozar.",
              "skills": [
                "sens-failsafe",
                "proj-integration"
              ]
            },
            {
              "id": "m4h8d5-q4",
              "kind": "find-bug",
              "prompt": "Lamba karanlık ile aydınlık arasında hızla yanıp sönüyor. Hata nerede?\n\n```cpp\nint isik = analogRead(A1);\nif (!karanlik && isik < 300) karanlik = true;\nif (karanlik && isik > 300) karanlik = false;\n```",
              "options": [
                "analogRead yerine digitalRead kullanılmalı",
                "karanlik bool olmamalı",
                "isik değişkeni global olmalı",
                "İki eşik de 300: histerezis bandı yok, 300 civarındaki dalgalanmada karar sürekli değişir"
              ],
              "answer": 3,
              "explanation": "Karanlık için de aydınlık için de aynı eşik kullanılıyor, arada \"önceki kararı koru\" bölgesi yok. Doğrusu karanlık için < 300, aydınlık için > 400 gibi ayrı eşiklerdir. Diğer seçenekler hatayı gidermez.",
              "skills": [
                "sens-hysteresis",
                "prog-debug"
              ]
            },
            {
              "id": "m4h8d5-q5",
              "kind": "numeric",
              "prompt": "BOS_SURESI = 8000 ms. Odada son hareket program başladıktan 12000 ms sonra algılandı ve bir daha hareket olmadı. Oda BOS durumuna kaçıncı milisaniyede geçer?",
              "answer": 20000,
              "tolerance": 100,
              "unit": "ms",
              "explanation": "Durum, son hareketten BOS_SURESI sonra BOS olur: 12000 + 8000 = 20000 ms. Her yeni hareket sonHareket değerini günceller, bu yüzden bekleme süresi her seferinde yeniden başlar.",
              "skills": [
                "proj-statemachine",
                "prog-timing"
              ]
            }
          ]
        }
      ]
    }
  ]
}
