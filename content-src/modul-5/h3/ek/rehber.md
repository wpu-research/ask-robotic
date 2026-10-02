### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Yansımalı IR sensörün çizgiyi nasıl okuduğunu anlatır; beş sensörü dizi ve `for` ile okuyup eşikle 0/1 desenine çevirir ve çizgi konumunu (−2…+2) bulur.
2. Sensör aralığı ile çizgi genişliğinden kör bölgeyi hesaplar.
3. Min/max ölçerek her sensör için eşiği `(min + max) / 2` ile bulur; sabit eşiğin ışık değişince neden yanıldığını açıklar.
4. Bang-bang kontrolü ve `sonYon` hafızasını uygular; iki eşikli (histerezisli) kararı kullanır.
5. Boşluk, dik viraj ve kavşağı durum makinesiyle yönetir; her aramaya süre sınırı koyar.
6. Bütün parçaları tek programda birleştirip robotun tur süresini ve çizgiyi görmediği süreyi ölçer, hız ile güvenilirlik arasındaki ödünleşimi yorumlar.

### Haftanın planı
Hafta beş derstir. Aşağıdaki plan günde bir ders içindir; proje dersi biraz daha uzundur.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Yansımalı IR sensör ve çizgi okuma | ~20 dk | Anlatımı oku, ham okumayı ve deseni çalıştır, kör bölgeyi bul, mini testi çöz. |
| 2 | Kalibrasyon: min/max ve eşik | ~25 dk | Sallanarak kalibrasyonu çalıştır, ışık örneğinde sabit ve kalibreli eşiği karşılaştır. |
| 3 | Bang-bang çizgi izleme ve histerezis | ~25 dk | Tek sensörlü ve beş sensörlü programı karşılaştır, kayıp süresini oku. |
| 4 | Kavşak, keskin viraj ve çizgi kaybı | ~25 dk | Boşluk, dik viraj ve T kavşağını dene; `BOSLUK_MS` ve karar değerini değiştir. |
| 5 | Proje: Çizgi izleyen robot (pist) | ~35 dk | Programı pistte çalıştır, `HIZ` değerini değiştirip raporu karşılaştır, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta Modül 3 ve Modül 5'in ilk haftası (77. ve 78. dersler dahil) gerekir. Başlamadan önce şunları kontrol et:
- `analogRead` ile 0-1023 arası okuma yapabiliyor mu? (Modül 3, 11. ders)
- Dizi ve `for` döngüsünü kullanabiliyor mu? (4. ders)
- `millis()` ve `enum` ile durum makinesi yazabiliyor mu? (27. ve 28. dersler)
- Motoru yön + PWM ile sürebiliyor mu ve ölü bölgeyi biliyor mu? (77. ve 78. dersler)
- Serial Monitor'de değer okuyabiliyor mu? (9. ders)

### Kavram haritası
- **Algılama:** yansımalı IR sensör → `analogRead` → eşik → bit deseni → çizgi konumu → kör bölge
- **Kalibrasyon:** min ve max → `(min + max) / 2` → her sensör için ayrı eşik → sallanma koşulları
- **Karar:** bang-bang → `sonYon` hafızası → iki eşikli karar (histerezis) → zigzag ve kayıp süresi
- **Zor durumlar:** boşluk, viraj aşımı, kavşak → `IZLE`, `BOSLUK`, `ARAMA`, `DUR` → süre sınırı
- **Proje:** kalibrasyon + izleme + kurtarma + bitiş → ölçüm (tur, kayıp, en uzun kesinti) → hız ödünleşimi

### Sık yapılan hatalar
- **Sensör sırasını karıştırmak.** A0 en soldur; ters sanılırsa robot hep ters yöne döner.
- **Modülün yönünü kontrol etmemek.** Çizgi alçak okuyorsa `>` tersine çalışır; önce ham değerlere bak.
- **Eşiği tahminle seçmek.** Işık değişince karar bozulur; eşiği ölç.
- **`enAz` ve `enCok` başlangıcını ters yazmak.** Min ve max hiç güncellenmez.
- **Sallanma PWM'ini ölü bölgenin altında bırakmak.** Robot dönmez, kalibrasyon yanlış çıkar.
- **Çizgi kaybolunca `sonYon`'u sıfırlamak.** Hafıza silinir, robot virajı kaçırır.
- **Kavşakta hemen dönmek.** Sensör dizisi aksın önündedir; önce kısa süre ileri git.
- **Aramayı sınırsız bırakmak.** Çizgi yoksa robot sonsuza dek döner; süre dolunca dur.
- **`sonTur`'u güncellememek.** Kayıp süresi kat kat fazla çıkar.
- **Hızı artırıp süreleri aynı bırakmak.** Aynı sürede daha uzun yol alınır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Elle bir tablo çiz: çizginin yedi farklı konumu için (merkez sensör hizasında, iki sensör arasında, uçta) beş bitlik deseni yaz.
4. Işığın arttığı bir durum uydur (zemin ve çizgi için iki sayı seç) ve sabit eşik ile kalibreli eşiğin sonucunu karşılaştır.
5. Kendi cümlelerinle şu soruyu cevapla: "Çizgi kaybolduğunda robot boşluk mu olduğunu, virajı aştığını mı nasıl anlar?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Çizgi izleyen robot)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Kalibrasyon | Eşikler elle yazılmış ya da kalibrasyon hata veriyor | Robot sallanıyor, min/max ölçülüyor ve eşikler yazılıyor | Kontrast denetimini ve nedenini açıklıyor, sallanma süresini ölçerek seçmiş |
| İzleme | Robot çizgiyi sık kaybediyor ya da pisti bitiremiyor | Robot pisti bitiriyor ve bitişte duruyor | Kayıp süresi hafızasız sürümden belirgin biçimde düşük, bunu ölçümle gösteriyor |
| Kurtarma | Boşlukta ya da virajda takılıyor | Boşluk geçiliyor, çizgi bulunamazsa duruyor | Süreleri hıza göre yeniden ayarlamış, nedenini anlatıyor |
| Ölçüm | Rapor satırı yok | Tur süresi, kayıp ve en uzun kesinti raporda | En az üç `HIZ` değeri için tablo çıkarmış ve yorumlamış |
| Anlatım | Ne yaptığını anlatamıyor | Durumları ve geçişleri adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta robotun "çalışması" kadar, çalışmadığı yeri bulup ölçmeyi öğrenmektir. Robotun çizgiyi kaybetmesi başarısızlık değil, veri toplama fırsatıdır.
- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: "Sensörler şu an ne görüyor, deseni yazdırdın mı?", "Çizgi en son hangi taraftaydı?", "Hızı değiştirince hangi sayı değişti?"
- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır. Proje gününde sabırlı olunmalı; ayar çoğu zaman birkaç deneme ister.
- **Gerçek robotla fark.** Burada her şey sanaldır. Gerçek robotta okumalar titrer, pil gerilimi düştükçe hız değişir, ortam ışığı (güneş ışığı kızılötesi de içerir) değerleri kaydırır; süreler ve eşikler yeniden ayarlanmalıdır.
- **Güvenlik.** Gerçek robota geçilirse motorlar için harici güç ve ortak GND kullanılır; pil ters bağlanmaz, uçları kısa devre edilmez. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Hata durumunda robotun durması güvenli varsayılandır.
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak özellik; yalnız onay verildiyse kaydedilir).
