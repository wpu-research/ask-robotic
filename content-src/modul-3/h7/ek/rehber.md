### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. 7-segment ekranda bir rakamın bir bayt olduğunu söyleyebilir; 74HC595 ve `shiftOut` ile üç pinle sekiz çıkışı sürebilir.
2. 16x2 LCD'yi `LiquidCrystal` ile bağlayıp `setCursor` ve `print` ile istediği yere yazdırabilir; eski yazının silinmediğini bilir.
3. I2C hattının SDA (A4) ve SCL (A5) ile çalıştığını, adresin ne olduğunu açıklayabilir; adres taramasıyla cihaz bulabilir.
4. Flash, SRAM ve EEPROM'un farkını söyleyebilir; ayarı EEPROM'a `update` ile ve seyrek yazabilir; yazma ömrünü hesaplayabilir.
5. NTC, LCD, röle ve EEPROM'u birleştiren, histerezisli ve durum makineli bir termostat kurup anlatabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir. Bitirme projesi için gerekirse iki gün ayır.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | 7-segment ekran ve 74HC595 | ~25 dk | Anlatımı oku, devreyi kur, 0-9 sayacını çalıştır, bir rakamın baytını elle bul, mini testi çöz. |
| 2 | LCD 16x2 ekran | ~20 dk | Kontrastı ayarla, iki satıra yazı yaz, eski yazının üstüne yazma sorununu dene. |
| 3 | I2C: Wire ve adres tarama | ~25 dk | Adres taramasını çalıştır, adresi değiştirip farkı gör, I2C LCD'ye yazdır. |
| 4 | EEPROM, String ve SRAM | ~25 dk | Açılış sayacını çalıştır, `write` ve `update` farkını gör, yazma ömrü hesabını yap. |
| 5 | Bitirme projesi: Termostat | ~35 dk | Planı çiz, devreyi kur, programı çalıştır, histerezisi ve EEPROM'u dene, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta önceki haftaların konuları birleşir. Başlamadan önce şunları kontrol et:
- NTC ile sıcaklık hesabı ve gerilim bölücü (Hafta 3). A2'den okunan ADC değerinden direnç bulabiliyor mu?
- Röle ile bir yükü açıp kapatma (Hafta 5). Röle düşük gerilimle, yetişkin gözetiminde kullanılıyor mu?
- `millis()` ile bekleme yapmayan kod ve durum makinesi (Hafta 6). `delay` kullanmadan iki işi birlikte yürütebiliyor mu?
- Butonu `INPUT_PULLUP` ile okuma ve basış anını yakalama (Hafta 2).
- Onaltılık sayı ve ikilik sayı (bit) fikri yeni gelir; ders 31'de yavaşça işlenir, takılırsa baytı 8 lambalı bir sıra olarak düşün.

### Kavram haritası
- **Ekran çıkışı:** 7-segment (bayt deseni) → 74HC595 (SER, SRCLK, RCLK) → `shiftOut` → mandal
- **Karakter ekranı:** LCD 16x2 → RS, E, D4-D7 → `begin`, `setCursor`, `print` → kontrast (V0)
- **Haberleşme:** I2C → SDA (A4) ve SCL (A5) → cihaz adresi → `Wire` ve adres taraması → `LiquidCrystal_I2C`
- **Bellek:** Flash, SRAM, EEPROM → `read`, `update`, `put/get` → yazma ömrü → `String` ve SRAM
- **Proje:** NTC ölçümü → histerezis → durum makinesi (KAPALI, ISITIYOR, AYAR) → röle → EEPROM'da hedef

### Sık yapılan hatalar
- **Mandalı unutmak.** `shiftOut` çağrıldı ama RCLK HIGH yapılmadı; 7-segment ekran değişmez.
- **Ortak anot ile ortak katodu karıştırmak.** Desen ters görünür; ortak anotta COM 5V'a bağlanır.
- **LCD pin sırasını karıştırmak.** `LiquidCrystal lcd(RS, E, D4, D5, D6, D7)` sırası kablolarla uyuşmalıdır; kontrastı (V0) ayarlamayı da unutma.
- **Eski yazıyı silmemek.** Kısalan sayıda eski rakamlar kalır (`250` yerine `7` yazınca `750`).
- **I2C adresini tahmin etmek.** Önce taramayı çalıştır; kodla cihaz adresi aynı olmalı.
- **SDA ve SCL'yi A4-A5 dışına bağlamak.** Uno'nun I2C'si yalnız bu pinlerdedir.
- **EEPROM'a her turda yazmak.** Hücre ömrü yaklaşık 100.000 yazmadır. `update` kullan, seyrek yaz.
- **Boş EEPROM'u 0 sanmak.** Hiç yazılmamış hücrede 255 vardır; geçerli aralık kontrolü yap.
- **Tek eşikle ısıtıcıyı sürmek.** Röle sürekli açılıp kapanır; histerezis kullan.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını bir kez daha oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. 7-segment için 5 ve 9 rakamlarının baytını elle yaz; sonra programda dene.
4. Bir EEPROM hücresine her dakika, her saat ve her 10 saniyede yazarsan ömrünün kaç günde biteceğini hesapla.
5. Termostat durum tablosunu hedef 25 için kendi eşik sayılarınla (24,5 ve 25,5) yeniden doldur.
6. Kendi cümlelerinle şu soruyu cevapla: "Histerezis olmasa röleye ne olurdu?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Termostat)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | NTC ters bağlı ya da röle / LCD bağlantısı eksik | NTC, butonlar, röle (LED yükü) ve I2C LCD doğru bağlı | Bağlantılar düzenli; sensör değeri seri monitörle doğrulanmış |
| Ölçüm | Sıcaklık mantıksız ya da hiç okunmuyor | Sıcaklık ekranda ve seri monitörde makul görünüyor | Ortalama alıyor, makul aralık dışı okumaları yakalıyor |
| Kontrol | Tek eşik; röle titriyor | Histerezis çalışıyor; röle yalnız ISITIYOR durumunda açık | Histerezis değerini deneyerek seçmiş ve etkisini açıklıyor |
| Bellek | Hedef güç kesilince kayboluyor ya da her turda yazılıyor | Hedef ayar bitince bir kez, `update` ile yazılıyor; geçersiz değerde varsayılan kullanılıyor | Yazma sayısını ölçmüş, ömür hesabını yapmış |
| Program yapısı | `delay` ile bloklanıyor | `millis()` ve `switch` ile durum makinesi kurulu | Sensör arızası gibi bir güvenlik önlemi eklenmiş |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi, durumları ve EEPROM kullanımını adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve geliştirme fikrini anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta, önceki haftalarda öğrenilenlerin gerçek bir ürün gibi birleştiği haftadır. Hesaplamalar ve pin numaraları bu hafta sıkça karışır; öğrencinin devre şemasını ve durum tablosunu kâğıda çizmesi çok yardımcı olur.
- **Nasıl destek olunur?** Cevabı söylemek yerine şu soruları sor: "Hangi pin hangi kabloya bağlı?", "Mandalı kullandın mı?", "Seri monitör ne yazıyor?", "Bu değer EEPROM'a ne zaman yazılıyor?"
- **Zor kavramlar.** Bit ve onaltılık gösterim (ders 31, 33) ve I2C adresi soyuttur. İkilik sayıyı sekiz lambalı bir sıra, adresi de apartman daire numarası gibi anlatmak yardımcı olur.
- **Süre.** Bitirme projesi 35 dakikanın üstüne çıkabilir. Gerekirse devreyi bir gün, programı ertesi gün çalıştırın.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kartla çalışırken röleyi yalnız düşük gerilimle (LED, küçük yük) kullanın; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Gerçek bir ısıtıcı bağlanmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
