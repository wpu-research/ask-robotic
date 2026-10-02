### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Bir LDR bölücüsünde ışığın okuma yönünü söyleyebilir; iki eşikli histerezisle titremeyi önleyebilir.
2. Ses sensöründe baz seviyeyi ölçüp sapmayı hesaplayabilir; sesi yüksekliğine ve süresine göre sınıflandırabilir.
3. MQ-2 için ısınma ve temiz havada baz değer fikrini açıklayabilir; eşiği bazın katı olarak yazabilir ve neden ppm yazılmadığını söyleyebilir.
4. Alev sensörünün yönünü tek yerde çözebilir; `enum` ve parametreli `seviyeBul` ile üç seviyeli karar mekanizması kurabilir.
5. Gaz, alev ve ısı sensörlerinden bir yangın ve gaz alarm paneli kurup test edebilir; panelin eğitim amaçlı olduğunu ve sınırlarını açıklayabilir.

### Haftanın planı
Hafta beş derstir. Aşağıdaki plan günde bir ders içindir; proje günü daha uzundur.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Işık sensörü hassasiyeti ve histerezis | ~25 dk | Anlatımı oku, tek eşikle titremeyi gör, iki eşikle gider, mini testi çöz. |
| 2 | Ses sensörü: alkış anahtarı | ~30 dk | Baz seviyeyi ölç, tepeyi yazdır, alkışı süre ve yükseklikle tanıt, iki alkışla LED aç/kapat. |
| 3 | MQ-2 gaz sensörü: ısınma ve kalibrasyon | ~25 dk | Isınmayı bekle, baz ölç, bazın katıyla alarm kur. Gazı Gaz düzeyi ile taklit et. |
| 4 | Alev sensörü ve çoklu eşik yönetimi | ~30 dk | Yönü `siddet()` ile çöz, üç seviyeyi dene, iki sensörde aynı fonksiyonu kullan. |
| 5 | Proje: Yangın ve gaz alarm paneli | ~35 dk | Devreyi kur, test tablosunu uygula, çıkışları ve ekranı kontrol et, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta Modül 3'ün bazı konuları gerekir. Başlamadan önce kontrol et:
- `analogRead` ile 0-1023 arası okuma yapıp Serial Monitor'a yazdırabiliyor musun? (11. ve 9. dersler)
- LDR ile gerilim bölücü kurmayı ve ışığa göre değerin yönünü söyleyebiliyor musun? (12. ders)
- Yumuşatmanın ne işe yaradığını biliyor musun? (14. ders)
- Parametre alan ve değer döndüren bir fonksiyon yazabiliyor musun? (19. ders)
- `millis()` ile `delay` kullanmadan zaman ölçebiliyor musun? (27. ders)
- `enum` ile durum tutmayı biliyor musun? (28. ders)
- Projede ayrıca röle (24. ders), buzzer (18. ders), NTC (13. ders) ve I2C LCD (32-33. dersler) kullanılır.

### Kavram haritası
- **Okuma:** sensör → ham sayı → yön → gürültü → baz değer
- **Karar:** eşik → histerezis (iki eşik) → göreli eşik (bazın katı) → yumuşatma → çoklu seviye (NORMAL, UYARI, TEHLIKE)
- **Olay:** baz seviye → sapma (`abs`) → tepe → süre → sessizlik payı → sınıflandırma
- **Yapı:** parametreli fonksiyon → `enum` → `enKotu` → çıkışları seviyeden türetmek
- **Proje:** üç sensör → genel durum → LED, buzzer, röle, ekran → güvenlik ve sınırlar

### Sık yapılan hatalar
- **Açma ve kapama eşiğini aynı yapmak.** Bu tek eşiktir; titreme geri gelir. Eşikleri ters yazmak da (açma > kapama) ölü bölgede her turda değişim üretir.
- **Eşiğin yönünü devreye bakmadan yazmak.** LDR 5V tarafındaysa karanlıkta değer küçüktür.
- **Baz seviyeyi varsaymak ya da yanlış ortamda ölçmek.** Ses modülünde baz 512 değildir (sanal modülde yaklaşık 256); MQ-2 bazı gazlı ortamda ölçülürse eşikler yukarı kayar.
- **Isınmayı atlamak.** Gerçek MQ-2'de baz yanlış çıkar.
- **Sadece yüksekliğe bakmak.** Kapı çarpması da alkışa benzer; süre de kontrol edilmelidir.
- **Tamsayı bölmesi.** `int` / `int` küsuratı atar: 160 / 100 sonucu 1 olur.
- **Kapama eşiğini açma eşiğinden büyük yazmak.** Seviye titrer ya da hiç düşmez.
- **Bir sensörü genel duruma katmamak.** `enKotu` her sensörü kapsamalıdır.
- **Çıkışları farklı yerlerden sürmek.** LED, buzzer ve ekran birbirinden kopar.
- **Röleyi şebeke gerilimiyle kullanmak.** Bu projede kesinlikle yapılmaz.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. `seviyeBul` fonksiyonunu bakmadan, kâğıda yaz. Sonra 300 / 250 / 600 / 500 eşikleriyle 320, 280, 240, 650, 520, 480 dizisini elle izle.
4. Isı için üçüncü bir sensör eklemeyi dene: eşikleri değiştir, fonksiyona dokunma.
5. Kendi cümlelerinle şu soruları cevapla: "Histerezis neden gerekir?" ve "MQ-2 için neden ppm yazmıyoruz?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Yangın ve gaz alarm paneli)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Sensörlerden biri ya da çıkışlardan biri bağlı değil | Gaz, alev, LED'ler, buzzer, röle ve ekran doğru bağlı | Bağlantılar düzenli; NTC de bağlı ve çalışıyor |
| Isınma ve baz | Isınma yok ya da baz gazlı ortamda ölçülüyor | Isınma bekleniyor, baz temiz havada ölçülüyor | Baz çok küçükse koruma var ve süre gerçek donanım için tartışılmış |
| Seviyeler | Seviyeler titriyor ya da yanlış sensörden çıkıyor | Üç sensör için histerezisli NORMAL, UYARI, TEHLIKE çalışıyor | Yeni bir sensör tek satırla ekleniyor, `seviyeBul` değişmiyor |
| Çıkışlar | Çıkışlar seviyeyle uyuşmuyor | LED, buzzer, röle ve ekran tabloya göre davranıyor | Buzzer deseni değiştirilmiş (örneğin iki kısa bip) ve nedeni açıklanmış |
| Test | Test yapılmamış | Test tablosundaki değerler denenmiş ve sonuçlar yazılmış | Kenar durumlar (histerezis bandı, sensör kopması) denenmiş |
| Güvenlik ve anlatım | Sınırlar söylenmiyor | Eğitim amaçlı olduğunu ve röle sınırını söylüyor | Panelin gerçek hayatta neden yetmeyeceğini örneklerle anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta öğrencinin "sensör bir sayı verir, karar bizim" fikrini kavraması hedeflenir. Titremeyi görüp çözmesi, ezberlemekten daha değerlidir.
- **Güvenlik.** Bu platformdaki gaz, alev ve ısı sanaldır. Gerçek gaz, alev ya da ısıtıcıyla deney yapılmaz. Röle yalnızca 5 V'luk bir LED sürer; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Bu panel sertifikalı bir gaz ya da yangın dedektörünün yerini tutmaz; evdeki gerçek koruma için uygun cihazlar kullanılmalıdır.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şunları sor: "Sensör ışıkla artıyor mu azalıyor mu?", "Temiz havada kaç okuyor?", "Seri monitör ne yazıyor?", "Hangi çıkış hangi seviyeden geliyor?"
- **Tartışma sorusu.** Konuşalım bölümündeki soruları sohbetle işleyin: Gaz varken fan çalışsın mı, alev varken de çalışsın mı? Gerçek panolarda bu kuralları kim belirler?
- **Süre.** Proje dersi uzundur; gerekirse iki oturuma bölünebilir. Isınma süresini beklemek sabır ister, gerçek donanımda çok daha uzundur.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
