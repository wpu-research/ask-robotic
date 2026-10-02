### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Bir yapay zekâ çıktısındaki iddiaları kaynakla karşılaştırıp uyumlu, çelişiyor ya da kaynakta yok diye ayırabilir; halüsinasyon oranını hesaplayabilir.
2. Bir servise hangi bilgilerin yazılmayacağını söyler, veriyi anonimleştirir, yapay zekâ yardımını belirtir ve önyargıyı grup bazlı doğrulukla gösterir.
3. Bir robot kararını kurala mı modele mi bırakacağını gerekçelendirir; `eğer` koşullu bir kuralla sanal robotu durdurur.
4. Bir kararın otomatiğe bırakılıp bırakılmayacağını geri alınabilirlik, etkilenen kişiler ve hata maliyetiyle değerlendirir; insan döngüde ve güvenli varsayılan örüntülerini bilir.
5. Sekiz haftalık çalışmasını kanıtlı ve dürüst bir portföyde toplar.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 25-40 dakikadır. Plan günde bir ders içindir. Bu haftanın tüm araçları tarayıcıda yerel çalışır; hiçbir dış servis ya da hesap gerekmez.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Halüsinasyon dedektifi | ~30 dk | Anlatımı oku, dedektif aracında sekiz iddiayı kaynakla karşılaştır, mini testi çöz. |
| 2 | Gizlilik, telif ve önyargı | ~25 dk | Okuma dersi: anlatımı oku, anonimleştirme örneğini kendin dene, mini testi çöz. |
| 3 | Robotta karar: kural mı, model mi? | ~35 dk | Ajan döngüsünde sanal robot için bir `eğer` kuralı yaz, eşik değerini değiştirip sonucu karşılaştır. |
| 4 | Ne zaman insan karar vermeli? | ~25 dk | Okuma dersi: dört soruyu kendi örneğine uygula, hata oranını günlük sayıya çevir. |
| 5 | Proje: Mühendislik portföyü | ~40 dk | Portföy iskeletini doldur, her başlığa kanıt ekle, dürüstlük ilkelerini kontrol et. |

### Ön koşul kontrolü
- Token, sıcaklık, prompt, eval, RAG, ajan ve injection derslerini (1-35) tamamladı mı?
- Doğruluk yüzdesini (doğru / toplam x 100) hesaplayabiliyor mu?
- Atölyedeki ajan döngüsünde `mesafe()`, `dur()` ve `$son` kullanımını hatırlıyor mu?
- Basit Python kodunu (toplam, bölme, `if/else`) okuyabiliyor mu?

### Kavram haritası
- **Güvenilirlik:** halüsinasyon → kaynakla karşılaştırma → uyumlu / çelişiyor / kaynakta yok → oran → azaltma (kaynak, araç, eval)
- **Sorumluluk:** gizlilik → anonimleştirme → telif ve dürüstlük → önyargı → grup bazlı eval
- **Robotik:** kural ↔ model → eşik → sert sınır → modelden bağımsız güvenlik katmanı
- **Denetim:** geri alınabilirlik → etkilenen kişiler → hata maliyeti → insan döngüde → güvenli varsayılan → kayıt
- **Proje:** iskelet → kanıt → gerçek hesap ve simülasyon ayrımı → eksikleri yazmak

### Sık yapılan hatalar
- **Akıcı cümleyi doğru sanmak.** Düzgün yazılmış cevap, doğru cevap demek değildir.
- **"Kaynakta yok" ile "çelişiyor"u karıştırmak.** Kaynakta hiç geçmeyen ayrıntı uydurmadır; kaynağın tersini söyleyen çelişkidir.
- **Hata oranı ile doğruluğu karıştırmak.** 40 özette 6 hata = %15 hata, %85 doğruluk.
- **Yalnız ismi değiştirip anonim saymak.** Yaş, okul ve semt bir araya gelince kişi tanınabilir.
- **Genel doğruluğa bakıp gruplara bakmamak.** Ortalama, bir gruptaki sorunu saklayabilir.
- **`$son` değerini yanlış beklemek.** `dur()` başarılı olduktan sonra `$son` "durdu" olur, mesafe değil.
- **Koşulu ters yazmak.** `eğer $son > 30: dur()` ile `<` kuralı tersidir; robot durmaz.
- **Güvenlik kuralını yalnız modelin istemine yazmak.** Sert sınır modelden bağımsız çalışmalıdır.
- **Simülasyonu gerçek model çıktısı gibi sunmak.** Portal araçlarının hangi kısmı gerçek hesap, hangisi simülasyondur; portföyde ayır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Dedektif aracında bir kaynak seç ve kendi sekiz iddiayı yaz; arkadaşına işaretlet.
4. Ajan döngüsünde eşiği 50'den 70'e ve adımı 20'den 35'e çıkar; robotun nerede durduğunu önce tahmin et, sonra çalıştır.
5. Kendi cümlelerinle cevapla: "Hangi kararı hiçbir zaman tamamen modele bırakmam ve neden?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Mühendislik portföyü)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Kapsam | Birkaç başlık eksik | Dokuz başlığın hepsi var | Her başlıkta bir sonraki adım da yazılmış |
| Kanıt | İddialar kanıtsız | Her başlıkta bir sayı, ekran görüntüsü ya da prompt var | Sayıların yanında vaka sayısı ve karşılaştırma var |
| Dürüstlük | Simülasyon gerçek model gibi anlatılmış | Gerçek hesap ve simülasyon ayrılmış | Eksik kalan kısımlar ve sınırlar açıkça yazılmış |
| Sorumluluk | Gizlilik ve denetim konuları geçiştirilmiş | Gizlilik, telif ve insan denetimi için kurallar var | Kurallar, gerçek bir örnek vaka üzerinden gösterilmiş |
| Anlatım | Ne yaptığını anlatamıyor | Her bölümü üç beş cümleyle anlatıyor | Hata yapıp nasıl çözdüğünü anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta teknik beceriden çok sorumluluk ve eleştirel düşünme haftasıdır. Hedef, öğrencinin yapay zekâ çıktısına körü körüne güvenmemesi ve kullandığı aracın sınırlarını söyleyebilmesidir.
- **Dürüstlük.** Portaldaki araçlar küçük örneklerdir. Halüsinasyon vakaları elle yazılmıştır, ajanın model adımı öğrencinin betiğidir. Öğrenciyi bunu portföyünde de belirtmeye yönlendirin.
- **Nasıl destek olunur?** Öğrenci bir sonucu savunurken şu soruları sorun: "Bunu hangi kaynakla kontrol ettin?", "Kaç vakaya baktın?", "Bu kararı yanlış verirsen kim etkilenir?"
- **Gizlilik.** Öğrenciyle gerçek bir yapay zekâ servisi kullanılacaksa önce servisin yaş şartlarına ve gizlilik politikasına birlikte bakın. Parola, adres, telefon ve başkasının bilgisi hiçbir zaman yazılmaz.
- **Ödev dürüstlüğü.** Okulun yapay zekâ kullanım kurallarını öğrenciyle birlikte okuyun; kullanılan yardımın belirtilmesini alışkanlık hâline getirin.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
