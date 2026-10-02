### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. PIR sensörünün ısı ışınımındaki değişimi algıladığını, ısınma ve tutma süresinin ne olduğunu açıklayabilir; ısınmayı bekleyen ve son hareket zamanını tutan bir program yazabilir.
2. IR engel sensörünün "var/yok" bilgisi verdiğini, eşiğin dijital çıkışta vidada, analog çıkışta kodda olduğunu bilir; iki eşikle (histerezis) titremesiz karar verebilir.
3. Reed ve limit anahtarını `INPUT_PULLUP` ile okuyabilir, NO ve NC farkını güvenlik açısından açıklayabilir, kontak titreşimini debounce ile eleyebilir.
4. VL53L0X'i (ToF, I2C, 0x29) tanır; `init()`, `timeoutOccurred()` ve `Wire.begin()` ile hata kontrolü yapan kod yazabilir (laboratuvarda parça yok, yalnız derleme).
5. PIR, reed ve butonu birleştiren, `enum` ve `millis()` ile yazılmış dört durumlu bir hırsız alarmı kurabilir ve zayıf noktalarını tartışabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20 dakika, proje yaklaşık 35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | PIR: hareket algılama ve ısınma süresi | ~20 dk | Anlatımı oku, `pir_isinma` ve `pir_oda_dolu` sketch'lerini çalıştır, Hareket kutusunu ısınma sırasında ve sonrasında dene, mini testi çöz. |
| 2 | IR engel sensörü ve eşik ayarı | ~20 dk | Yakınlık ve Eşik kaydırıcılarını oynat, analog sketch'te histerezisi gözle, mini testi çöz. |
| 3 | Reed anahtarı ve limit anahtarı | ~20 dk | Reed ve butonu aynı mantıkla oku, NO/NC ve debounce üzerine düşün, mini testi çöz. |
| 4 | VL53L0X (I2C ToF): hassas mesafe | ~20 dk | Kodu yaz ve derle, sensörsüz çalıştırıp hata mesajını gör, eşik hesaplarını yap, mini testi çöz. |
| 5 | Proje: Hırsız alarmı (durum makineli) | ~35 dk | Durum tablosunu çiz, devreyi kur, programı çalıştır, durumların hepsini gez, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta Modül 3 ve ilk haftanın bilgilerine dayanır. Başlamadan önce şunları kontrol et:
- `INPUT_PULLUP` ile buton okuyabiliyor mu ve basılı = LOW olduğunu biliyor mu? (6. ders)
- Kenar algılama ve debounce fikrini hatırlıyor mu? (8. ders)
- `millis()` ile `delay()` kullanmadan süre ölçebiliyor mu? (27. ders)
- `enum` ve `switch` ile durum makinesi yazabiliyor mu? (28. ders)
- I2C'nin SDA ve SCL ile çalıştığını, her cihazın bir adresi olduğunu biliyor mu? (33. ders)
- İki eşikli (histerezisli) karar fikrini hatırlıyor mu? (35. ders)
- Ultrasonik sensörün ses gönderip yankıyı beklediğini biliyor mu? (36. ders)

### Kavram haritası
- **Varlık:** PIR (ısı değişimi) → ısınma süresi → tutma süresi → son hareket zamanı → oda dolu/boş
- **Engel:** IR engel (yansıma) → dijital OUT (vida eşiği) ve analog AO (kod eşiği) → histerezis → kenar sayma
- **Kontak:** reed ve limit anahtarı → `INPUT_PULLUP` → NO ve NC → debounce → arızaya karşı güvenlik
- **Mesafe (ışık):** VL53L0X → I2C 0x29 → `init()` ve `timeoutOccurred()` → milimetre eşiği
- **Proje:** durum tablosu → `enum` ve `switch` → çıkış gecikmesi → mandal → şifre penceresi → bloklamayan döngü

### Sık yapılan hatalar
- **Isınmayı beklememek.** PIR açıldıktan sonra yalancı HIGH verir; alarm hemen çalar.
- **PIR için `INPUT_PULLUP` kullanmak ya da LOW'u hareket saymak.** PIR'da hareket = HIGH.
- **PIR'ın hemen LOW olacağını sanmak.** Tutma süresi nedeniyle OUT hareket bittikten sonra bir süre HIGH kalır.
- **Her IR modülünün engelde LOW verdiğini varsaymak.** Seviyeyi bir sabite yaz.
- **Tek eşik kullanmak.** Değer eşik civarında dalgalanınca çıktı titrer; iki eşik kullan.
- **Cisim sayarken seviyeyi saymak.** Duran cisim her turda yeniden sayılır; kenarı say.
- **Reed ve limit anahtarında pull-up'ı unutmak.** Açık kontakta pin yüzer, okuma rastgele olur.
- **NO ile NC'yi karıştırmak.** Mantık tersine çalışır; kopan kablo fark edilmeyebilir.
- **VL53L0X'te `Wire.begin()` ya da `timeoutOccurred()` kontrolünü atlamak.** Hatalı okuma gerçek mesafe sanılır.
- **mm ile cm'yi karıştırmak.** 300 mm = 30 cm.
- **Alarm projesinde `delay()` kullanmak.** Buton ve sensörler o sürede kaçırılır.
- **Şifre sayacını durum değişince sıfırlamamak.** Önceki durumdaki basışlar yenisini bozar.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. `pir_oda_dolu` sketch'ini bakmadan yaz; sonra bekleme süresini değiştirip etkisini açıkla.
4. Kâğıda, hırsız alarmı için durum geçiş şemasını (ok ve koşullarla) çiz; sonra projedeki koddan kontrol et.
5. Kendi cümlelerinle şu soruyu cevapla: "Alarm kapı kontağını neden NC bağlamak, NO bağlamaktan daha güvenli olabilir?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Hırsız alarmı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | PIR, reed ya da buton eksik veya yanlış pinde | Üç giriş ve çıkışlar doğru pinlerde, GND'ler bağlı | Bağlantılar düzenli, her sensörün çalışması tek tek denenmiş |
| Durum tasarımı | Durum tablosu yok, bayraklarla karışık | Dört durum ve geçişleri tabloda var, kod `enum` ve `switch` kullanıyor | Geçiş koşulları şemayla birebir uyuyor, giriş gecikmesi gibi bir ek durum düşünülmüş |
| Zamanlama | `delay()` kullanılıyor, düğme ya da sensör kaçırılıyor | Çıkış gecikmesi, alarm süresi ve şifre penceresi `millis()` ile ölçülüyor | Süreler sabitlerde toplanmış, değiştirilince etkisi açıklanıyor |
| Sensör güvenilirliği | Isınma ve tutma süresi hesaba katılmamış, yalancı alarm çıkıyor | Çıkış gecikmesi PIR'ın sakinleşmesine izin veriyor, reed mantığı doğru | NC/NO ve debounce seçimleri gerekçelendirilmiş |
| Anlatım | Ne yaptığını anlatamıyor | Durumları ve geçişleri adım adım anlatıyor | Zayıf noktaları (kablo kesme, PIR'ı kapatma) ve çözümleri tartışıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta, sensörlerin "doğru cevap" vermediğini; yorumlanması, süzülmesi ve güvenlik için tasarlanması gereken sinyaller verdiğini göstermektir. Isınma, titreşim ve eşik gibi kavramlar gerçek mühendisliğin gündelik sorunlarıdır.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şunları sor: "Sensör o anda ne okuyor?", "Bu durum hangi koşulla değişiyor?", "Kablo kopsaydı ne olurdu?"
- **Laboratuvar sınırı.** VL53L0X parçası laboratuvarda yoktur; bu ders yalnız kod yazma ve derleme üzerinedir. Ölçüm değerleri sanal olarak doğrulanamaz.
- **Güvenlik.** Platformdaki her şey sanaldır. Gerçek kartla çalışılırsa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; röle ve sirenler için harici besleme ve ortak GND kuralı unutulmaz.
- **Etik.** Alarm ve hareket algılama kendi odan ve eşyaların için kullanılır. Başkalarının odasına izinsiz sensör koymak, birini gizlice izlemek yanlıştır; bu konuyu öğrenciyle konuşmak iyi olur.
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
