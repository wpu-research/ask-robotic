### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Joystick'in iki potansiyometre ve bir düğmeden oluştuğunu söyleyebilir; orta noktayı ölçüp ölü bölge koyarak ham değeri -100...+100 aralığına çevirebilir.
2. Döner enkoderde CLK ve DT sinyalinden dönüş yönünü bulabilir; sayacı kesme ve `volatile` ile tutabilir, sıçrama filtresinin neden gerektiğini açıklayabilir.
3. MPU6050'yi yazmaçlarla okuyabilir, ham değeri g ve °/s'ye çevirebilir, `atan2` ile eğim açısı hesaplayabilir.
4. Jiroskop sapmasının neden hata biriktirdiğini açıklayabilir ve tamamlayıcı filtreyle iki sensörü birleştirebilir.
5. Eğimi ters yönde servoya çeviren, `millis` ile bloklamayan bir mini gimbal kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 25-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Joystick: iki eksen ve düğme | ~25 dk | Anlatımı oku, ham değerleri izle, merkezi ve ölü bölgeyi dene, mini testi çöz. |
| 2 | Döner enkoder (quadrature) ve kesme | ~25 dk | CLK/DT durum tablosunu çiz, sayacı çalıştır, sıçrama eşiğini değiştir. |
| 3 | MPU6050: ivmeölçer ve eğim açısı (I2C) | ~30 dk | Yazmaç okumayı dene, ham değeri g'ye çevir, pitch ve roll'u hesapla. |
| 4 | Jiroskop sapması ve tamamlayıcı filtre | ~30 dk | Sapmayı ölç, integralin kaymasını gör, ALFA değerini değiştir. |
| 5 | Proje: El eğimiyle kontrol edilen servo (mini gimbal) | ~35 dk | Devreyi kur, programı çalıştır, projeyi ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta önceki haftalardan şunlar gerekir. Başlamadan önce kontrol et:
- `INPUT_PULLUP` ve basılı düğmenin `LOW` okunduğunu biliyor mu? (ders 6)
- Kenar algılama ve buton sıçramasını anlıyor mu? (ders 8)
- `analogRead` ile 0-1023 değerini okuyup `map` ile ölçekleyebiliyor mu? (ders 11 ve 14)
- Servo açısını ve `millis` ile bloklamayan döngüyü biliyor mu? (ders 21 ve 27)
- `attachInterrupt`, ISR ve `volatile` kavramlarını biliyor mu? (ders 29)
- I2C'de SDA, SCL ve cihaz adresini biliyor mu? (ders 33)

### Kavram haritası
- **Analog girdi:** joystick (iki gerilim bölücü) → merkez → ölü bölge → `map` ile -100...+100
- **Sayma:** enkoder → CLK ve DT (90 derece fark) → yön kuralı → kesme ve `volatile` → sıçrama filtresi
- **Hareket algılama:** MPU6050 → yazmaç (0x6B, 0x3B) → ham → g ve °/s → `atan2` ile açı
- **Sensör birleştirme:** ivmeölçer (kaymaz, gürültülü) + jiroskop (hızlı, kayar) → tamamlayıcı filtre (`ALFA`)
- **Proje:** açı → ofset → servo = 90 − eğim → `constrain` → `millis` ile işler → açık çevrim

### Sık yapılan hatalar
- **Merkezi sabit 512 yazmak ya da ölü bölge koymamak.** Kol bırakılmışken değer dalgalanır.
- **Kol itilmişken programı başlatmak.** Merkez yanlış ölçülür.
- **CLK'yı kesme pinine (D2, D3) bağlamamak.** `attachInterrupt` çalışmaz.
- **`sayac`'ı `volatile` yapmamak ya da ISR içinde `Serial.print` / `delay` kullanmak.**
- **Sıçrama eşiğini çok büyük seçmek.** Hızlı çevirirken gerçek tıklar da atılır.
- **MPU6050'yi `0x6B` yazmacına 0 yazmadan okumak.** Çip uykuda kalır.
- **`ax / 16384` yazmak.** Tam sayı bölmesi 0 verir; `16384.0` yaz.
- **Baytları işaretsiz birleştirmek.** Negatif değer 65000 gibi görünür; `int16_t` kullan.
- **MPU6050 ile RTC'yi aynı hatta kullanmak.** İkisi de 0x68 adresindedir.
- **Hareket anında ivmeölçer açısına güvenmek.** Çip eğilmeden `ax` = 0,3 g bile yaklaşık 16,7 derece gösterir.
- **`dt`'yi milisaniye ya da sabit yazmak.** Integral 1000 kat bozulur ya da süre değişince kayar.
- **Sapma ölçerken çipi oynatmak.** Bütün açı kayar.
- **Gimbalde `delay` kullanmak ve servoyu sınırlamamak.** Düğme kaçar, servo mekanik uca dayanır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Joystick programını bakmadan yaz: merkez ölç, ölü bölge ekle, `map` ile ölçekle.
4. Enkoder için kâğıda iki yönün 11, 01, 00, 10 tablosunu çiz ve "CLK düşerken DT" kuralını kendi cümlenle anlat.
5. `ALFA` değerini 0,90, 0,98 ve 0,999 yaparak filtrenin titreşime ve kaymaya tepkisini karşılaştır; zaman sabitini `ALFA · dt / (1 − ALFA)` ile hesapla.
6. Şu soruyu kendi cümlelerinle cevapla: "İvmeölçer ve jiroskop neden birlikte kullanılır?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Mini gimbal)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | MPU6050 ya da servo çalışmıyor, SDA/SCL karışık | MPU6050, LCD, servo ve düğme doğru pinlerde; RTC yok | Düzenli bağlantılar, servo gücünün neden ayrı olması gerektiğini açıklıyor |
| Ölçüm ve filtre | Yalnız ivmeölçer kullanıyor; açı titriyor | Sapma ölçülüyor, tamamlayıcı filtre çalışıyor | `ALFA` değerini deneyip etkisini açıklıyor |
| Kontrol | Servo eğimle aynı yönde dönüyor ya da sınırsız | Servo ters yönde dönüyor, 10...170 ile sınırlı, düğme sıfırlıyor | Sınır LED'i çalışıyor, roll ekseni gibi bir geliştirme var |
| Zamanlama | `delay` kullanıyor; düğme kaçıyor | `millis` ile bloklamayan döngü var | `dt`'yi `micros` ile hesaplıyor ve nedenini açıklıyor |
| Anlatım | Ne yaptığını anlatamıyor | Sensörden servoya veri akışını adım adım anlatıyor | Açık çevrimin sınırını ve nasıl iyileştirilebileceğini anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta formül ezberlemek değil, bir sensörün kusurlu olduğunu ve kusurunu başka bir sensörle kapatmayı görmektir. "İvmeölçer neden yanılıyor?" sorusu haftanın ana sorusudur.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine sor: "Sensör şu an tam olarak neyi ölçüyor?", "Birimler uyumlu mu: derece mi radyan mı, ms mi s mi?", "Hangi satır çip uykudayken de çalışırdı?"
- **Matematik.** `atan2` ve filtre formülü zor görünebilir. Önce değerleri laboratuvardan değiştirip sonucu izlemek, sonra formüle bakmak daha kolaydır. Hesaplamalar dört işlem ve basit oran düzeyindedir.
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Haftanın 3. ve 4. dersi arasında bir gün ara vermek iyi olur.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kartla çalışılırsa servoyu ayrı 5 V kaynaktan besle ve GND'leri ortak yap; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
