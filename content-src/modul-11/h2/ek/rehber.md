### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Çarpışma olayını kurabilir; `bu sprite` ile `diğer sprite` farkını ve sprite türünün rolünü açıklayabilir.
2. Skoru `yap` ve `değiştir` blokları ile yönetebilir; `eğer ... ise` ile skora bağlı karar verdirebilir.
3. `her ... ms'de bir` olayı ve rastgele sayıyla gökten düşen nesneler üretebilir; ekran dışına çıkanları silmeyi bilir.
4. Can sayısını yönetebilir; `can bitince` ve `süre bitince` olaylarında oyunu kendisi bitirebilir.
5. Amaç, risk ve sondan oluşan eksiksiz bir oyun (Meyve avı) tamamlayabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Elmayı ye, hayaleti patlat | ~20 dk | Anlatımı oku, çarpışma olaylarını kur, `bu sprite` ve `diğer sprite` farkını dene, mini testi çöz. |
| 2 | Üç meyveyi topla, oyunu kazan | ~22 dk | Skor bloklarını kur, `eğer skor = 3` ile kazanmayı ekle, `=` ve `≥` farkını dene. |
| 3 | Gökten meyve yağsın | ~25 dk | `her 800 ms'de bir` olayını kur, rastgele konum ve hız ver, silinsin ayarını aç ve kapatıp farkı gör. |
| 4 | Bombadan kaç, canını koru | ~22 dk | Bomba çarpışmasını, canı, sallanmayı ve `can bitince` olayını yaz. |
| 5 | Proje: Meyve avı | ~35 dk | Eksikleri tamamla (ceza, geri sayım, kazanma, kaybetme), oyunu oyna, dengele ve ölçütle değerlendir. |

### Ön koşul kontrolü
Hafta 1'den şunlar gerekir. Başlamadan kontrol et:
- Bloğu çalışma alanına sürükleyip başka bloğa takabiliyor mu?
- `oyun başlayınca` içinde yeni sprite oluşturup konum verebiliyor mu?
- Ok tuşlarıyla sprite'ı yürütebiliyor mu ve hız bloğunun x ve y'sini ayırt ediyor mu?
- Değişken oluşturup sprite'ı onda tutabiliyor mu?
- ▶ ve ↺ düğmelerinin ne yaptığını biliyor mu?

### Kavram haritası
- **Etkileşim:** sprite kutusu → çarpışma → çarpışma olayı → `bu sprite` / `diğer sprite` → sprite türü
- **Durum:** skor (`yap`, `değiştir`) → koşul → `eğer ... ise` → `=` ve `≥`
- **Üretim:** `her ... ms'de bir` → yeni sprite → rastgele sayı → hız (piksel/sn) → silinsin ayarı
- **Risk:** can → tehlike olayı → geri bildirim (ses, sallanma) → `can bitince`
- **Bütün oyun:** amaç + risk + son → olaylara bölme → geri sayım → `süre bitince` → denge

### Sık yapılan hatalar
- **`bu sprite` ile `diğer sprite`'ı karıştırmak.** Yanlış sprite silinir; çoğu zaman kedi kaybolur.
- **Sprite türünü yanlış seçmek.** Olay hiç çalışmaz; hayalet ve bomba Düşman, meyve Yiyecek olmalı.
- **`skoru yap` ile `skoru değiştir`'i karıştırmak.** İlki skoru sabitler, ikincisi ekler.
- **Hedefi `=` ile kontrol etmek.** Skor hedefi atlarsa oyun hiç kazanılmaz; `≥` daha güvenlidir.
- **Hız bloğunda 0'ı yanlış eksene yazmak.** Meyve düşmez, yana kayar.
- **Ekrandan çıkanları silmemek.** Sprite sayısı birikir, 500'ü geçince oyun hata verir.
- **`can bitince` ya da `süre bitince` içinde oyunu bitirmeyi unutmak.** Oyun sıfır canla ya da sıfır süreyle devam eder.
- **Geri sayım bloğunu bir olayın dışında bırakmak.** Süre hiç başlamaz.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Meyve avını bakmadan yeniden kur: önce çarpışmalar, sonra skor, düşen nesneler, can, en son geri sayım.
4. Sayıları değiştir ve tahmin et: süreyi 30 saniyeye indirirsen oyun nasıl değişir? Hedefi 12 yaparsan?
5. Kendi cümlelerinle şu soruyu cevapla: "Bir oyunun amacı, riski ve sonu ne işe yarar?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Meyve avı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Çarpışmalar | Meyve ya da bomba çarpışması çalışmıyor | Meyve skoru artırıyor, bomba can götürüyor ve ikisi de siliniyor | Geri bildirim eklenmiş (ses, sallanma, mesaj) |
| Kurallar | Kazanma ya da kaybetme yok | Skor 8 olunca kazanma, can ya da süre bitince kaybetme var | Hedef ve süre oynanarak dengelenmiş |
| Zaman | Geri sayım başlamıyor | 45 saniyelik sayım var ve süre bitince oyun kaybediliyor | Kalan süre mesajda kullanılıyor |
| Karar | `=` ile kontrol, bilmeden yazılmış | Kazanma `≥` ile yazılmış | Neden `≥` seçtiğini anlatıyor |
| Anlatım | Ne yaptığını anlatamıyor | Oyunun amacını, riskini ve sonunu söylüyor | Arkadaşından aldığı geri bildirimle bir şeyi değiştiriyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta oyun yapmanın "bir şeyin başka bir şeye değince ne olacağını tasarlamak" olduğunu görmek; ezber değil. Hata yapmak güvenlidir, ↺ ile baştan başlanır.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine sor: "Hangi iki şey değince bu olmalıydı?", "Türleri doğru seçtin mi?", "Skoru bu bloktan sonra mı kontrol ediyorsun?", "Oyunu kim bitiriyor?"
- **Oyun testi.** Çocuk oyununu bir arkadaşına ya da aileden birine oynatsın ve nerede zorlandığını izlesin. Oyun tasarımının yarısı oynayanı izlemektir.
- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Her ders arasında kısa bir tekrar yeterlidir.
- **Ekran süresi ve güvenlik.** Bu platformdaki her şey sanaldır ve kişisel veri istemez. Oyun yapmak oyun oynamaktan farklıdır; ara vermeyi unutmayın.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
