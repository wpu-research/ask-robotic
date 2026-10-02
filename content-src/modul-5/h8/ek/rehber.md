### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Bitirme robotu için yolunu (A otonom araç, B robot kol, C takip robotu) seçer ve "bitti" kelimesini sayı, birim ve ölçüm yöntemi içeren kabul ölçütlerine çevirir.
2. Tasarım belgesi doldurur: amaç, gereksinimler, alt sistemler, durum makinesi, test planı, riskler.
3. Seçtiği yolun alt sistemlerini (sürüş-mesafe-çizgi, ters kinematik-servo sürücü ya da mesafe PID) tek başına, geçme koşullarıyla sınar.
4. Alt sistemleri durum makinesiyle birleştirir ve bir test matrisini önce beklenenleri yazarak doldurur.
5. Robot durumunu sözleşmeli JSON satırlarıyla yazar, ortalama ve en büyük mutlak hatayı hesaplar.
6. Sonuç tablosu, kök neden analizli hata raporu ve günlük rapor yazar; simülatör ile gerçek ölçümü ayırarak sunar.

### Haftanın planı
Hafta beş derstir; her ders 35-40 dakikadır. Aşağıdaki plan günde bir ders içindir. Yol seçimi 1. günde yapılır ve hafta boyunca değişmez.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Bitirme robotu: proje seçimi ve tasarım | ~35 dk | Üç yolu karşılaştır, birini seç, tasarım belgesini doldur, kabul ölçütü sketch'ini dene. |
| 2 | Yapım 1: alt sistemler | ~40 dk | Yolunun alt sistemlerini seri komutlarla tek tek sına; geçme koşullarını ölç. |
| 3 | Yapım 2: entegrasyon ve test | ~40 dk | Alt sistemleri durum makinesiyle birleştir, test matrisini doldur. |
| 4 | 3D robota bağlama, hata ayıklama, ölçüm | ~40 dk | Telemetri satırını yaz ve doğrula; hata istatistiğini hesapla. |
| 5 | Sergi ve sunum | ~40 dk | Sonuç tablosu, hata raporu ve günlük rapor yaz; sergiye hazırlan. |

### Ön koşul kontrolü
Bu hafta önceki haftaların hepsini kullanır. Seçeceğin yola göre şunlar hazır olmalı:
- **Yol A:** 76-78. dersler (iki motorlu sürüş, ölü bölge), 82. ders (HC-SR04), 86-89. dersler (çizgi sensörü, eşik), 84. ders (durum makinesi).
- **Yol B:** 21. ders (servo), 108-109. dersler (ters kinematik, al-bırak).
- **Yol C:** 82. ders (mesafe), 96-99. dersler (P, I, D ve ayar).
- Hepsi için: `millis()` ile bloklamayan kod (26-27. dersler) ve seri porttan okuma/yazma.
- Güç güvenliği: motor ve servo harici kaynaktan beslenir, GND ortaktır; şebeke gerilimiyle devre kurulmaz.

### Kavram haritası
- **Planlama:** "iyi çalışıyor" → kabul ölçütü (sayı, birim, yöntem) → tasarım belgesi → alt sistemler ve geçme koşulları
- **Yapım:** alt sistem testi → durum makinesi → test matrisi (beklenen önce) → güvenli varsayılan
- **Ölçüm:** veri sözleşmesi (`t, x, y, th, d`) → `null` ve aralıklar → ortalama ve en büyük mutlak hata
- **Anlatım:** sonuç tablosu → kapsam sınırı → hata raporu (belirti, kök neden) → günlük rapor

### Sık yapılan hatalar
- **Ölçülemeyen gereksinim yazmak.** "Düzgün gitsin" gibi cümleye sayı ve birim ekle.
- **Ölçütü sonradan gevşetmek.** Değişecekse nedeni belgeye yazılır ve tüm testlere uygulanır.
- **`<` yerine `<=` yazmak.** "5 mm'den az" ifadesinde tam 5,0 geçmez.
- **Alt sistemi sınamadan birleştirmek.** Hatanın hangi parçadan geldiği bilinmez.
- **Durum değişince zamanlayıcıyı sıfırlamamak.** Sonraki durum hemen biter.
- **Hedef kaybolunca son komutu sürdürmek.** Emin olmadığında motoru durdur.
- **Ölçüm yok için 0 yazmak.** Telemetride `null` kullan.
- **Hata ortalamasını işaretli almak.** +3 ile -3 birbirini götürür.
- **Simülatör sonucunu gerçek sonuç gibi sunmak.** Kapsam sınırını yaz.

### Hafta sonu tekrarı
1. Tasarım belgeni sıfırdan oku: her gereksinimin yanında sayı ve ölçüm yöntemi var mı?
2. Kabul ölçütü sketch'ine `C 17 23`, `C 16.9 20`, `B 4.9`, `B 5`, `A 0 0` yaz; her sonucun nedenini açıkla.
3. Test matrisinde kırılan bir satırı seç; önce nedenini ölç, sonra tek değişiklik yap, komşu testleri yeniden koş.
4. Telemetri satırının her alanını sözleşme kuralıyla karşılaştır; bozuk bir satır uydur ve neden bozuk olduğunu söyle.
5. Altı ay sonra okuyacak birine günlük raporunu ver: "neden bu değer?" sorusunun cevabı bulunuyor mu?

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Bitirme robotu)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Gereksinimler | Sayısız dilekler var | Her gereksinimde sayı, birim ve ölçüm yöntemi var | Ölçütler sınır değerleriyle (`<`/`<=`) ve gerekçeleriyle yazılmış |
| Alt sistemler | Birleşik kod, ayrı test yok | Her alt sistem kendi geçme koşuluyla tek başına sınanmış | Gidiş-dönüş ya da cetvel gibi bağımsız bir ölçümle doğrulanmış |
| Entegrasyon | `delay()` ile bloklu ya da karar katmanı yok | Durum makinesi ve en az 5 satırlı test matrisi | Beklenen sütun önce yazılmış; başarısız satır nedeniyle düzeltilmiş |
| Güvenlik | Motor/servo Arduino 5 V'undan besleniyor, hedef kaybında son komut sürüyor | Harici güç ve ortak GND; kayıpta robot duruyor | Güvenli varsayılan test matrisinde bir satır olarak sınanmış |
| Ölçüm ve rapor | Sonuçlar sözlü, kanıt yok | Sonuç tablosu, hata raporu ve günlük rapor var | Kök neden katmanlarla ölçülmüş, kapsam sınırı yazılmış |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta "çalışan robot" kadar "çalıştığını kanıtlayan robot" önemlidir. Öğrenci sonuçlarını sayıyla, ölçüm yöntemiyle ve sınırlarıyla anlatmalıdır.
- **Yol seçimi.** Hiçbir yol "kolay" değildir. A en çok parçayı birleştirir, B matematiği öne çıkarır, C PID ayarını ister. Üçünü birden yapmaya çalışmak yerine bir yolu bitirmek önerilir.
- **Nasıl destek olunur?** Cevabı söylemek yerine şu soruları sor: "Bunu hangi sayıyla ölçtün?", "Hangi katman sağlam, hangisi değil?", "Tek değişiklik hangisiydi?"
- **3D robot.** Şu anda 3 boyutlu gösterim yoktur. 114. ders yalnızca veri biçimini sınar; "3D robot çalışıyor" diye bir beklenti oluşturmayın.
- **Güvenlik.** Gerçek kartla çalışılırsa piller kısa devre yapılmaz ya da ters bağlanmaz, motorlar kartın 5 V'undan beslenmez; şüphede yetişkin yardımı istenir. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
