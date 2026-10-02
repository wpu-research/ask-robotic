### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Sesin bir titreşim olduğunu, **frekansın** (Hz) perdeyi belirlediğini ve kartın notalarını (Do 262 Hz, La 440 Hz) söyleyebilir.
2. Tempoya göre bir notanın süresini `60000 / tempo` ile hesaplayabilir ve **sus** bloğuyla ritim kurabilir.
3. Hazır ezgileri çalabilir; **liste** ile kendi ezgisini kurup **her öğe için** döngüsüyle çalabilir.
4. Düğme, logo ve ışık sensörüyle çalınan bir enstrüman yapabilir; sürekli sesi **sesi durdur** ile kapatabilir.
5. Plan tablosundan yola çıkarak kayıt yapan ve geri oynatan beş tuşlu bir sanal piyano kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 18-32 dakikadır. Aşağıdaki plan günde bir ders içindir. Müzikli derslerde ses açık olmalıdır; ilk ▶ Çalıştır basışından sonra tarayıcı sesi açar.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | İlk nota | ~18 dk | Anlatımı oku, Do, Re, Mi çal, nota simgesini göster, mini testi çöz. |
| 2 | Süre, sus ve tempo | ~20 dk | Tempoyu 60 ve 240 yap, süreleri hesapla ve Hoparlör bölümüyle karşılaştır. |
| 3 | Ezgiler ve listeler | ~22 dk | Hazır ezgileri dinle, dört notalık liste kur, her öğe için döngüsünü dene. |
| 4 | Enstrüman yap | ~22 dk | Üç düğmeyle nota çal, logo ve ışıkla sürekli ses ver, eşle bloğunu dene. |
| 5 | Proje: Sanal piyano | ~32 dk | Tabloyu doldur, A tuşunu çalıştır, kopyala, kayıt ve geri oynatmayı ekle. |

### Ön koşul kontrolü
Bu hafta Modül 10'un üç haftalık temeli gerekir. Başlamadan önce şunları kontrol et:
- Blok sürükleyip başlığın içine bırakabiliyor mu? (Hafta 1)
- **Düğme [A] basılınca** gibi olay başlıklarını ve ▶ Çalıştır düğmesini biliyor mu? (Hafta 2)
- Sensör (ışık) değerlerinin sayı olduğunu ve kaydırıcıyla değiştirildiğini biliyor mu? (Hafta 3)
- Değişken oluşturup değer atayabiliyor mu?
- Ses açık mı? Bilgisayarın sesi ve Hoparlör bölümündeki **Ses açık** düğmesi açılmış olmalı.

### Kavram haritası
- **Ses:** titreşim → frekans (Hz) → nota (Do 262, La 440) → oktav (iki katı)
- **Zaman:** tempo (vuruş/dk) → 60000 / tempo → vuruş değerleri (1/16 ... 2) → sus
- **Veri:** değişken → liste → numara (0'dan) → uzunluk → her öğe için
- **Enstrüman:** giriş (düğme, logo, ışık) → kural → çıkış (hoparlör) → eşle → sürekli ses
- **Proje:** plan tablosu → tek tuş kalıbı → kopyala → kayıt listesi → geri oynatma

### Sık yapılan hatalar
- **Nota bloklarını başlığın dışında bırakmak.** Blok soluk görünür ve hiç çalışmaz.
- **▶ düğmesine basmadan düğmeye basmak.** Program önce çalıştırılmalı.
- **Vuruş ile milisaniyeyi karıştırmak.** **bekle [500] ms** tempoyu dinlemez; nota ve sus dinler.
- **Tempo 60'ta takıldı sanmak.** Tempo 20'de bir 1/4 vuruş 3 saniyedir.
- **Listeyi başlangıçta kurmamak.** Ekleme bloğu "Bu blok için bir liste gerekli." hatasıyla durur.
- **Listede numarayı 1'den başlatmak.** İlk öğe 0 numaralıdır; son numara uzunluktan bir azdır.
- **Sesi durdur koymamak.** Sürekli ses kendiliğinden susmaz.
- **Eşle bloğunda aralıkları ters yazmak.** Önce sensör aralığı, sonra ses aralığı.
- **Aynı sütunu iki tuşa vermek.** Projede tuşlar ekrandan ayırt edilemez.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına yeniden bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını oku, sonra soruyu yeniden çöz.
3. Tempoyu 60, 120 ve 240 yaparak 1/4 vuruşun süresini hesapla (1000, 500, 250 ms) ve Hoparlör bölümüyle karşılaştır.
4. Zafer ezgisinin tempo 120'de 2750 ms sürdüğünü bil; tempo 60'ta ne kadar süreceğini hesapla.
5. Kendi cümlelerinle cevapla: "Liste numaraları neden 0'dan başlar?" ve "Sürekli ses neden sesi durdur ister?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Sanal piyano)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Tuşlar | Bir iki tuş çalışmıyor ya da yanlış nota çalıyor | Beş tuşun hepsi kendi notasını çalıyor | Tablodaki notaların dışında ek tuş ya da oktav değişimi eklenmiş |
| Ekran | Sütunlar karışık ya da yanmıyor | Her tuş kendi sütununu yakıp söndürüyor | Sütun süresi nota süresiyle uyumlu, ekran temiz kalıyor |
| Kayıt | Liste kurulmamış, program hata veriyor | Notalar kayıt listesine sırayla ekleniyor | Kaydı silen bir tuş ya da kayıt uzunluğunu gösteren bir sayı eklenmiş |
| Geri oynatma | Logoya dokununca bir şey çalmıyor | Kayıt çalındığı sırayla baştan çalınıyor | Tempo ya da nota arası duraklama ayarlanmış ve etkisi açıklanmış |
| Anlatım | Ne yaptığını anlatamıyor | Tuş kalıbını ve listeyi adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir şarkıyı ezberletmek değil, öğrencinin sesi bir sayı olarak (frekans) ve zamanı bir hesap olarak (tempo) görmesidir. Müzik sevenler için bu sıradan bir tablo, sevmeyenler için bir bulmacadır; ikisi de yeterlidir.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: "Hangi başlığın içinde?", "Hoparlör bölümü kaç Hz diyor?", "Liste kaç öğeli, son numarası kaç?"
- **Ses.** Ses sanal karttan çıkar ve ilk ▶ Çalıştır'dan sonra açılır. Sesi duymayan öğrenci için önce bilgisayarın sesini, sonra Hoparlör bölümündeki Ses açık düğmesini kontrol edin. Ses olmasa da frekans, ekran ve etkinlik hedefleri yine görünür.
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Tempo hesapları için kâğıt ve kalem uygundur.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Kulaklık kullanılıyorsa ses seviyesi düşük tutulmalıdır.
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
