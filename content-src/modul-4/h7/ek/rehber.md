### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. RTC modülünü I2C ile bağlayıp `rtc.now()` ile tarih ve saati okuyabilir, `rtc.adjust()` ile kurabilir ve basit bir alarm yazabilir.
2. SD kartın SPI ile nasıl bağlandığını, 8.3 dosya adı kuralını ve `close()`/`flush()` ile verinin karta nasıl yazıldığını açıklayabilir.
3. Zaman damgalı bir CSV satırı üreten, donanımdan bağımsız bir fonksiyon yazabilir; ondalık virgül ile sütun ayracı çatışmasını açıklayabilir.
4. UART, I2C ve SPI protokollerini hat sayısı, hız ve cihaz seçimi bakımından karşılaştırabilir; bit sayısından aktarım süresini hesaplayabilir.
5. RTC, DHT22, LCD ve butonu birleştiren bir sıcaklık ve nem veri kaydedicisi kurabilir.

### Haftanın planı
Hafta beş derstir; ders süreleri 25-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | RTC: saat, tarih, alarm | ~25 dk | Anlatımı oku, RTC'yi kur, saati okut, `adjust` ile gece yarısına ayarla, alarmı dene, mini testi çöz. |
| 2 | SD kart (SPI): dosyaya yazma | ~25 dk | Laboratuvarda SD yok: devreyi tablodan oku, kodu yaz ve derle, "Dene" sorularını kağıt üzerinde cevapla. |
| 3 | Veri kaydı: CSV ve zaman damgası | ~30 dk | Satır fonksiyonunu sabit değerlerle dene, RTC + DHT22 ile canlı satır üret. |
| 4 | Haberleşme protokolleri: UART, I2C, SPI karşılaştırması | ~30 dk | Üç ölçüm programını çalıştır, tabloları kendi hesabınla karşılaştır. |
| 5 | Proje: Sıcaklık ve nem veri kaydedici | ~35 dk | Planı tabloya yaz, devreyi kur, kaydediciyi çalıştır, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta şunlar gerekir. Eksik olanın dersine dön:
- `millis()` ile bloklamayan zamanlama (Modül 3, ders 27)
- I2C, `Wire` ve adresler (ders 33); I2C LCD (ders 32)
- Buton ve kenar algılama (ders 8)
- DHT22 ile sıcaklık ve nem okumak (Modül 4, ders 46)
- `String` ve SRAM sınırı (ders 34)
- SPI'ya ilk giriş (ders 63)

### Kavram haritası
- **Zaman:** `millis()` → RTC → `DateTime` → `adjust` ve `lostPower` → alarm
- **Depolama:** EEPROM (1 KB) → SD kart → SPI (SCK, MOSI, MISO, CS) → 8.3 ad → `close` ve `flush`
- **Veri biçimi:** CSV → zaman damgası (ISO 8601) → satır fonksiyonu → `NaN` ve boş alan → ondalık ayırıcı
- **Haberleşme:** UART (baud) → I2C (adres, SDA/SCL) → SPI (CS) → bit süresi ve aktarım süresi
- **Proje:** RTC saniyesine bağlı kayıt → tekrar önleme bayrağı → butonla aç/kapat → hataya dayanıklı satır

### Sık yapılan hatalar
- **`adjust(__DATE__, __TIME__)` satırını koşulsuz bırakmak.** Her açılışta saat derleme anına döner; yalnız `lostPower()` doğruysa ayarla.
- **MPU6050 ile RTC'yi aynı I2C hattına bağlamak.** İkisi de 0x68 kullanır.
- **`close()` ya da `flush()` çağırmamak.** Gerçek cihazda son satırlar kaybolur.
- **Dosya adını 8.3 kuralının dışında seçmek.** `sicaklik_kaydi.csv` gibi ad açılamaz.
- **Ay ve günü iki haneli yazmamak.** Metin sıralaması zaman sırasını bozar.
- **Ondalık virgül ve ayraç virgülü birlikte kullanmak.** `23,5` iki sütuna bölünür.
- **Baud hızlarını farklı seçmek.** Karşı taraf anlamsız karakterler görür.
- **Aynı saniyede satırı birden çok kez yazmak.** `u != sonKayit` bayrağı gerekir.
- **`delay(10000)` ile kayıt aralığını beklemek.** Buton ve ekran donar.
- **D11, D12, D13 pinlerine LED bağlayıp SD kartı da kullanmak.** Bu pinler SPI hatlarıdır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Kendi cümlelerinle cevapla: "Veri kaydedicide neden `millis()` yerine RTC kullanıyoruz?"
4. 5 saniyelik aralıkla bir günde kaç satır yazılır? 60 saniyelik aralıkla bir haftada kaç? Hesapla ve dosya boyutunu tahmin et.
5. Aynı anda RTC, LCD ve SD kullanan bir devrede hangi pinlerin hangi protokole ait olduğunu bir tabloya çiz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Sıcaklık ve nem veri kaydedici)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | RTC ya da LCD tepki vermiyor, SDA/SCL karışık | DHT22, RTC, LCD ve buton doğru pinlerde, RTC (0x68) ve LCD (0x27) çakışmıyor | Bağlantılar düzenli, adresler ve pin tablosu açıklanmış |
| Kayıt biçimi | Satırlar bozuk ya da sütun sayısı tutmuyor | Başlık + zaman damgalı, iki haneli, 3 sütunlu CSV satırları | NaN durumunda boş alan yazılıyor ve denenmiş |
| Zamanlama | `delay` kullanıyor ya da aynı saniyede çok satır yazıyor | Satırlar 10 saniyelik tam adımlarla, tekrarsız çıkıyor | Aralığı değiştirip etkisini açıklıyor |
| Kontrol | Buton kaydı güvenilir biçimde durduramıyor | Buton kaydı aç/kapat yapıyor, ekranda durum görünüyor | Sıçrama ve kenar algılamayı açıklıyor, ek uyarı (örneğin buzzer) ekliyor |
| Anlatım | Ne yaptığını anlatamıyor | Veri akışını (sensör → satır → kayıt) adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve SD sürümünün farkını anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta öğrenci, ölçümün "bir an"dan çıkıp zamana bağlı bir veri kümesine dönüşmesini görür. Önemli olan mükemmel bir kayıt cihazı değil, verinin neden zaman damgasına ve düzenli bir biçime ihtiyaç duyduğunu anlamasıdır.
- **SD kart.** Sanal laboratuvarda SD kart modülü yoktur; ikinci ders ve projenin SD sürümü okuma ve derleme çalışmasıdır. Gerçek bir kartla yapılacaksa FAT32 biçimli kart ve 3,3 V uyumlu bir modül gerekir.
- **Nasıl destek olunur?** Takılınca cevabı söylemek yerine sor: "Bu satırın kaç sütunu var?", "Saat hangi anda kuruldu?", "Aynı saniyede kaç kez yazıyor?"
- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır. Protokol dersi (4. gün) sayı hesabı içerir; gerekirse hesap makinesi kullanılabilir.
- **Güvenlik.** Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Gerçek devrede kartı çıkarmadan önce dosyanın kapalı olması gerekir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
