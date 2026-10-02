### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Laboratuvarın hangi gerçek dünya etkilerini modellediğini (ADC basamağı, zamanlama, sensör besleme eşikleri), hangilerini modellemediğini (gürültü, buton sıçraması, 5V çökmesi) ayırt edebilir.
2. Bir ADC basamağının yaklaşık 4,89 mV olduğunu söyler; ortalama ve histerezisle gürültülü okumadan kararlı bir karar çıkarır.
3. Buton sıçramasını kararlı kalma süresiyle (debounce) ve `delay()` yüzünden kaçan basışı `millis()` ile giderir.
4. Besleme değişince analog sensör sayılarının kaydığını bilir, `map` ve `constrain` ile iki nokta kalibrasyonu yapar ve sessiz kalan sensörde çıkışı güvenli tarafta bırakır.
5. Hatayı alttan üste (fiziksel, adres, kimlik, veri) arar; XOR checksum ile bozuk çerçeveyi yakalar.
6. PIR, LDR, DHT22, röle, LCD ve butonu tek bir durum makinesinde birleştirerek Akıllı oda projesini kurar.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 30-35 dakikadır. Aşağıdaki plan günde bir ders içindir. Laboratuvarın "yalan söylediği" yerler bu hafta bilerek öğretilir; öğrenciye "laboratuvarda gördün mü, yoksa kodla mı taklit ettik?" sorusunu sor.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Laboratuvar kusursuzdur: ADC basamağı ve gürültü | ~30 dk | Modellenen ve modellenmeyen etkiler tablosunu oku, ADC basamağını ve sahte gürültüyü dene, tek eşik ile histerezisi karşılaştır. |
| 2 | Buton sıçraması ve tepki gecikmesi | ~30 dk | Sıçramalı sayacı ve debounce'u çalıştır, `delay` ve `millis` sürümlerinin tepkisini karşılaştır. |
| 3 | Besleme düşmesi ve kalibrasyon | ~30 dk | Toprak nemini iki nokta ile kalibre et, VCC'yi 3V3'e al, pin yükünü sanal ölçümle oku, `YOK` durumunu üret. |
| 4 | Hata ayıklama vakası: "ping çalışıyor ama veri yok" | ~30 dk | Dört katmanlı testi çalıştır, hata modlarını tek tek üret, XOR çerçevesini elle doğrula. |
| 5 | Bitirme projesi: Akıllı oda | ~35 dk | Devreyi kur, programı yükle, "Uçtan uca denemek" adımlarını sırayla uygula, proje ölçütüyle değerlendir. |

### Ön koşul kontrolü
Bu hafta Modül 3 ve Modül 4'ün ilk yedi haftasından bilgi gerekir. Başlamadan önce kontrol et:
- `analogRead`, `map`, `constrain` ve yumuşatma (11. ve 14. dersler) biliniyor mu?
- Buton, `INPUT_PULLUP` ve debounce (6. ve 8. dersler) biliniyor mu?
- `millis()` ile bloklamayan kod ve durum makinesi (27. ve 28. dersler) yapılabiliyor mu?
- PIR, DHT22, LDR ve röle ayrı ayrı kullanıldı mı (Hafta 2-4 ve 24. ders)? Proje bunların hepsini birleştirir.
- I2C ve LCD (32. ve 33. dersler) kullanımı hatırlanıyor mu?

### Kavram haritası
- **Sınırlar:** laboratuvar neyi modeller → ADC basamağı, zamanlama, sensör besleme eşiği → neyi modellemez → gürültü, sıçrama, 5V çökmesi, referans kayması
- **Gürültüye karşı:** ortalama (karekök N) → histerezis (iki eşik) → bant, gürültü genliğinden geniş
- **Zamana karşı:** sıçrama → kararlı kalma süresi (debounce) → `delay` tuzağı → `millis()`
- **Güce karşı:** AO = VCC x oran → koşula bağlı kalibrasyon → `map` + `constrain` → pin iç direnci → brown-out → fail-safe
- **Hata ayıklamaya karşı:** fiziksel → adres → kimlik → veri makullüğü → XOR checksum
- **Proje:** girdi → durum → çıkış → ISINMA / BOS / DOLU / KAPALI → iki histerezis → güvenli varsayılan

### Sık yapılan hatalar
- **"Laboratuvarda sorun yoktu, gerçekte de olmaz" demek.** Gürültü, sıçrama ve güç çökmesi laboratuvarda yoktur.
- **Histerezis aralığını gürültüden dar seçmek.** Titreme geri gelir.
- **Ortalamayı gereksiz büyütmek.** 64 okuma 64 kat iştir; kazanç karekökle artar.
- **Debounce'ta bırakma sıçramasını unutmak.** Bekleme iki yönde de çalışmalıdır.
- **Kararlı kalma süresini çok uzun seçmek.** Hızlı basışlar kaçar.
- **`delay()` içinde butonu dinlemeyi beklemek.** Kısa basış iki okuma arasında kalır.
- **`constrain` unutmak.** Kalibre edilmiş yüzde 0'ın altına ya da 100'ün üstüne çıkar.
- **Kalibrasyonu başka beslemede kullanmak.** AO gerilimi VCC ile orantılıdır.
- **`pulseIn` 0 döndüğünde "mesafe 0" sanmak.** Cevap yoktur; çıkışı güvenli tarafta bırak.
- **Adres cevabını "cihaz doğru" saymak.** Kimlik ve veri katmanları ayrı sınanır.
- **Fanı kartın 5V ucundan beslemek.** Gerçek devrede kart sıfırlanabilir; laboratuvar göstermez.
- **Akıllı odada PIR ısınmasını hesaba katmamak.** Açılışta oda dolu sanılır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Laboratuvarın modellediği ve modellemediği etkileri kendi cümlelerinle bir tabloya yaz; her satıra gerçek devrede kullanacağın önlemi ekle.
4. Hesabı elle yap: ADC basamağı kaç mV? 3V3 ile beslenen toprak nemi modülünde nem 0,5 iken ham değer ne olur?
5. Akıllı oda programının üç durumunu kağıda çiz ve her oktaki koşulu yaz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Akıllı oda)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Birkaç parça bağlı değil ya da pinler karışmış | Tüm parçalar tabloya göre doğru bağlı | Bağlantılar düzenli ve her parçanın görevi açıklanıyor |
| Durum makinesi | Durumlar yok, bayraklar dağınık | ISINMA, BOS, DOLU ve KAPALI durumları doğru geçiyor | Durumlar tablo ve kodla birebir uyuşuyor, yeni durum eklenmiş |
| Eşikler | Tek eşik, lamba ya da fan titriyor | Işık ve fan histerezisle karar veriyor | Eşikler denemeyle seçilmiş ve nedenleri açıklanıyor |
| Güvenli davranış | DHT hatasında fan açık kalıyor | DHT hatasında fan kapalı ve LCD hata yazıyor | Başka sensör arızaları da ele alınmış |
| Zamanlama | `delay` kullanıyor, buton ve PIR geç tepki veriyor | `millis()` ile her iş kendi zamanında | Süreler ve DHT aralığı gerekçesiyle seçilmiş |
| Gerçek dünya farkı | Laboratuvar farkından söz etmiyor | Gürültü, sıçrama ve güç farkını söylüyor | Gerçek devre için kalibrasyon ve önlem listesi yazıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta yeni bir sensör öğrenilmez; öğrencinin "çalışıyor" sözünün ne kadar kanıta dayandığını sorgulaması hedeflenir. Laboratuvarın sınırlarını bilmek, gerçek devreye geçişin en önemli hazırlığıdır.
- **Nasıl destek olunur?** Öğrenciye cevabı söylemek yerine şunu sor: "Bunu laboratuvar gerçekten üretti mi, yoksa biz mi taklit ettik?", "Bu hatayı hangi katmanda arıyorsun?", "Sensör cevap vermezse çıkış ne olmalı?"
- **Süre.** Dersler dolu (30-35 dk). Aynı gün iki ders yerine aralıklı çalışmak kalıcılığı artırır.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders gerçek kartla tekrarlanacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; motor, röle ve servo için ayrı güç kaynağı ve ortak GND kullanılır. Pil kullanılacaksa kısa devre ve ters bağlamaya dikkat edilir.
- **Hyvex vakası.** 74. ders, Hyvex ekibinin staj programındaki bir vakaya dayanır; yalnızca programda yazılan bilgiler aktarılmıştır.
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
