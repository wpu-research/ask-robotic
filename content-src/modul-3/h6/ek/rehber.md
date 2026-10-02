### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. `delay()` kullanan bir programın neden butona ya da başka işe bakamadığını (bloklama) açıklayabilir.
2. `millis()` ile `simdi - son >= aralik` kalıbını kullanarak bekletmeden zamanlama yapabilir ve `unsigned long` taşmasını bilir.
3. Bir işi durumlar ve geçişler olarak çizip `enum` ile `switch` kullanan bir durum makinesi yazabilir.
4. D2 ve D3 pinlerinde `attachInterrupt` kurabilir; ISR'yi kısa tutmanın ve `volatile` kullanmanın nedenini söyleyebilir.
5. Birden çok görevi (LED, buzzer, iki buton) `delay` olmadan tek bir panelde birleştirebilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | delay'in tuzağı | ~20 dk | Anlatımı oku, `delay`'li programda butona kısa bas, kaçan basışları gör, mini testi çöz. |
| 2 | millis() ile bloklamayan kod | ~25 dk | Aynı işi `millis` ile yaz, iki LED'i bağımsız hızlarda yak, taşma örneğini hesapla. |
| 3 | Durum makineleri (FSM) | ~25 dk | Trafik ışığı durumlarını kâğıda çiz, sonra `switch` ile kodla, buton modunu dene. |
| 4 | Kesmeler ve timer'lar | ~30 dk | D2'de kesme kur, `CHANGE` ile `FALLING` farkını gör, timer süresini hesapla. |
| 5 | Proje: Çoklu görev paneli | ~35 dk | Görev tablosunu yaz, devreyi kur, paneli çalıştır, proje ölçütüyle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce şunları kontrol et:
- Butonu `INPUT_PULLUP` ile okuyabiliyor mu? Basılı = LOW kuralını biliyor mu? (Ders 6)
- `if`, `else` ve `switch` yazabiliyor mu? (Ders 7)
- Buton basışının kenarını (yeni basış) algılamayı biliyor mu? (Ders 8)
- `tone()` ve `noTone()` ile buzzer çaldırabiliyor mu? (Ders 18)
- Fonksiyon tanımlayıp çağırabiliyor mu? (Ders 19)

### Kavram haritası
- **Sorun:** `delay` bloklar → bakış anları arası olaylar kaçar
- **Çözüm 1:** `millis()` → `simdi - son >= aralik` → her işe kendi `son` değişkeni → `unsigned long` ve taşma
- **Çözüm 2:** durum makinesi → `enum` + `switch` + `break` → zamanla ya da olayla geçiş
- **Çözüm 3:** kesme → `attachInterrupt` (D2, D3) → ISR kısa → `volatile` → bayrak; timer kesmesi
- **Proje:** görev tablosu → modlar → kesme + `millis` + FSM bir arada → zaman aşımı güvenliği

### Sık yapılan hatalar
- **`loop()` içinde yine `delay` bırakmak.** Bütün kazanç kaybolur; diğer görevler de beklemeye girer.
- **Süreyi toplamayla kontrol etmek.** `simdi >= son + aralik` taşmada bozulur; `simdi - son >= aralik` yaz.
- **Süre değişkeninde `int` kullanmak.** `int` yaklaşık 32,8 saniyede taşar; `unsigned long` kullan.
- **Bütün işlere tek ortak `son` değişkeni vermek.** İşler birbirinin zamanını bozar.
- **`case` sonunda `break;` unutmak.** Program alttaki durumun kodunu da çalıştırır.
- **Durum değişince `durumBasi = simdi;` yazmamak.** Yeni durum hemen biter.
- **Basılı tutulan butonu her turda saymak.** Kenar algılama (`basili && !oncekiBasili`) kullan.
- **ISR içinde `delay`, `Serial.print` ya da uzun iş yapmak.** ISR'yi kısa tut, işi `loop()` yapsın.
- **`volatile` yazmamak.** Paylaşılan değişken `loop()`'ta güncel görünmeyebilir.
- **Kesmeyi D2/D3 dışında bir pinde denemek.** Uno'da dış kesme yalnızca bu iki pindedir.
- **Mod değişince sayaçları sıfırlamamak.** Yeni modun ilk yanıp sönmesi yanlış zamanda gelir.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Yanlış yaptığın mini test sorularının açıklamalarını oku, sonra soruyu yeniden çöz.
3. Blink'i `delay` olmadan, `millis` ile sıfırdan bakmadan yaz; sonra aralığı değiştir.
4. Kendi seçtiğin bir cihaz (örneğin mikrodalga fırın) için durum şemasını kâğıda çiz: durumlar, olaylar, geçişler.
5. Timer için bölücü 256 iken `OCR1A = 12499` değerinin kesme aralığını hesapla.
6. Kendi cümlelerinle şu soruyu cevapla: "Kesme ile `millis` arasında hangi durumda hangisini seçerim?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Çoklu görev paneli)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | LED, buzzer ya da butonlardan biri bağlı değil veya yanlış pinde | LED'ler dirençli, buzzer D8'de, butonlar D2 ve D3'te doğru bağlı | Bağlantılar düzenli, renkler ve türler (pasif buzzer) bilinçli seçilmiş |
| Plan | Görev tablosu yok | Görev, tetikleyici ve değişken tablosu var | Tablo kodla birebir uyuyor ve kesme/yoklama seçimi gerekçelendirilmiş |
| Zamanlama | Kodda `delay` var ya da görevler birbirini bekletiyor | Hiç `delay` yok; LED ve buzzer süreleri tabloyla uyuşuyor | Süreler değiştirilip etkisi açıklanıyor; taşma güvenliği (çıkarma) bilinçli |
| Kesme ve durum | Mod değişimi çalışmıyor ya da ISR içinde uzun iş var | Kesme + bayrak ve mod durum makinesi doğru çalışıyor | Sıçrama koruması, `volatile` ve sayaç sıfırlama gerekçeleriyle açıklanıyor; yeni mod eklenmiş |
| Anlatım | Ne yaptığını anlatamıyor | Görevleri ve modları adım adım anlatıyor | Hata yapıp nasıl bulduğunu (örneğin kaçan basış) anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta tek bir işlemcinin birden çok işi nasıl yürüttüğünü anlamaktır. En zor kavram "beklemeden zamanı sormak"tır; öğrenci ilk anda `delay`'e dönmek isteyebilir. Ders 26'daki kaçan basış deneyimi bu geçişin gerekçesidir.
- **Nasıl destek olunur?** Cevabı vermek yerine sor: "Bu satır çalışırken başka hangi iş bekliyor?", "Son değişim ne zaman yazıldı?", "Bu fonksiyon kesmeden mi çağrılıyor, `loop()`'tan mı?" Durum şemasını önce kâğıda çizdirmek çoğu karışıklığı önler.
- **Süre.** Kesme ve timer dersi (29) yoğundur; Timer1 kodunun satır satır anlaşılması beklenmez, mantığı (sayaç, eşleşme, kesme) yeterlidir.
- **Güvenlik.** Platformdaki her şey sanaldır. Ders 30'daki zaman aşımı örneği, motor ve röle gibi çıkışlarda güvenli duruma geçmenin neden önemli olduğunu gösterir. Gerçek donanımda motor doğrudan Uno pininden sürülmez; şebeke gerilimiyle hiçbir devre kurulmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
