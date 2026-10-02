### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. DHT11/DHT22 ile sıcaklık ve nemi okuyabilir; `NaN` değerini `isnan` ile yakalayıp okuma aralığının (en az 2 saniye) neden gerekli olduğunu açıklayabilir.
2. BMP280'i I2C adresiyle bulabilir, basıncı Pa'dan hPa'ya çevirebilir ve rakımın deniz seviyesi basıncına (P0) neden bağlı olduğunu söyleyebilir.
3. Toprak nemi, yağmur ve su seviyesi sensörlerinin yönünü ölçerek bulabilir; `map` ve `constrain` ile ham değeri yüzdeye çevirebilir.
4. Birden çok değeri çok sayfalı bir LCD ekranda `delay` kullanmadan gösterebilir.
5. Hava istasyonu ve sulama uyarısı projesini plan tablosundan yola çıkarak kurabilir; iki eşikle (histerezis) uyarının titremesini önleyebilir.

### Haftanın planı
Hafta beş derstir; ilk dört ders yaklaşık 25 dakika, proje yaklaşık 35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | DHT11 ve DHT22: sıcaklık ve nem | ~25 dk | Anlatımı oku, DHT'yi D5'e bağla, sıcaklık ve nem kaydırıcılarını oynat, DATA kablosunu çıkarıp hata yolunu dene, mini testi çöz. |
| 2 | BMP280: basınç ve rakım (I2C) | ~25 dk | Basınç kaydırıcısıyla rakımın değiştiğini gör, formülü elle hesapla ve kütüphaneyle karşılaştır, adres hatasını dene. |
| 3 | Toprak nemi, yağmur ve su seviyesi (analog) | ~25 dk | Üç sensörün yönünü ham sayılardan bul, kalibrasyon uçlarını kaydet, eşiklerle durum yazdır. |
| 4 | Çok sayfalı ekran arayüzü (LCD/OLED) | ~25 dk | Üç sayfalı ekranı kur, butonla sayfa çevir, dolgusuz yazının artık bıraktığını gör. |
| 5 | Proje: Hava istasyonu ve sulama uyarısı | ~35 dk | Durum tablosunu yaz, devreyi kur, programı çalıştır, toprak nemini düşürüp uyarıyı sına, proje ölçütüyle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce öğrenci şunları yapabilmeli:
- `millis()` ile `delay` kullanmadan iki işi birlikte yürütmek (27. ders).
- I2C hattında SDA/SCL bağlantısını ve cihaz adresi kavramını tanımak (33. ders).
- Bir kütüphaneyi `#include` ile kullanmak (34. ders).
- `analogRead`, `map` ve `constrain` ile ham değeri yüzdeye çevirmek (11. ve 14. dersler).
- Histerezis fikrini (iki eşik) bilmek (35. ders).
- `tone` ile buzzer çalmak (18. ders).

Eksik varsa ilgili Modül 3 dersine dönülmeli; özellikle 27. ve 35. dersler bu haftanın temelidir.

### Kavram haritası
- **Ortam sensörleri:** DHT (sıcaklık, bağıl nem) → `NaN` ve `isnan` → 2 saniye kuralı → ardışık hata sayacı
- **Basınç:** BMP280 → I2C adresi (0x76/0x77) → Pa ve hPa → rakım formülü → P0 ve hava durumu
- **Analog sensörler:** toprak nemi, yağmur, su seviyesi → yön → kalibrasyon uçları → `map` ve `constrain` → eşik ve histerezis
- **Arayüz:** sayfa değişkeni → `%` işleci → satırı 16 karaktere tamamlama → `snprintf` ve `dtostrf` → OLED
- **Proje:** durum tablosu → `uyari` durumu → iki eşik → bloklamayan buzzer → arızaya dayanıklılık

### Sık yapılan hatalar
- **`isnan` denetimini atlamak.** DHT okuyamazsa `NaN` döner; hesap ve ekran `nan` olur.
- **DHT'yi 2 saniyeden sık okumak.** Aynı eski değer tekrarlanır.
- **BMP280'i parametresiz `begin()` ile aramak.** Varsayılan adres 0x77'dir; 0x76'daki sensör bulunamaz.
- **Pa ile hPa'yı karıştırmak.** `readAltitude` hPa bekler; `101325` yazılırsa rakım anlamsız çıkar.
- **Sensör yönünü bilmeden "büyük sayı = ıslak" varsaymak.** Toprak ve yağmur sensörlerinde ıslandıkça değer düşer.
- **`constrain` unutmak.** Yüzde %-26 ya da %130 gibi değerler çıkar.
- **Satırı 16 karaktere tamamlamamak.** Ekranda eski yazının artıkları kalır.
- **`snprintf` ile `%f` kullanmak.** Uno'da ondalık sayı yerine `?` yazılır; `dtostrf` kullanılır.
- **Tek eşik kullanmak ve bip için `delay` kullanmak.** Uyarı titrer ve program donar.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. DHT'yi bağla ve kaydırıcıları çalışırken oynat; sonra DATA kablosunu çıkarıp programın ne yazdığını açıkla.
4. BMP280 basıncını 1013,25 hPa'dan 1003,25 hPa'ya çek ve rakımın kaç metre kaydığını hesaplayıp ölç.
5. Kendi cümlelerinle şu soruyu cevapla: "Uyarı için neden iki eşik kullandık?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Hava istasyonu ve sulama uyarısı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Birkaç parça bağlı değil ya da LED dirençsiz | DHT, BMP280, LCD, toprak sensörü, LED ve buzzer doğru pinlerde | Bağlantılar düzenli; LCD ve BMP280 aynı I2C hattını adresleriyle paylaşıyor |
| Plan | Durum tablosu yok | Normal ve uyarı durumları ile eşikler tabloda yazılı | Tablo kodla birebir uyuyor ve her geçiş açıklanmış |
| Ölçüm | Değerler yanlış birimde ya da `nan` görünüyor | Sıcaklık, nem, basınç, rakım ve toprak yüzdesi doğru | Kalibrasyon uçları kendi sensöründen ölçülmüş |
| Uyarı | Uyarı titriyor ya da hiç çalışmıyor | İki eşikle uyarı doğru açılıp kapanıyor; mesaj yalnız durum değişince yazılıyor | Ek bir geliştirme var (örneğin susturma butonu) |
| Dayanıklılık | Sensör çıkarılınca program çöküyor | DHT ya da BMP280 yokken ekranda `--` ve "BMP280 yok" görünüyor | Bozuk sensörü anlamak için ek bir kontrol eklenmiş |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta sensör okumanın yalnızca bir sayıyı almak olmadığını, o sayıya güvenmeden önce denetlemek ve yorumlamak gerektiğini öğrenmektir. "Sensör yoksa ne olur?" sorusu haftanın ortak sorusudur.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: "Bu sayının birimi ne?", "Sensör cevap vermezse ne olur?", "Bu değer hangi yönde artıyor?"
- **Doğruluk uyarısı.** Ekranda çok basamak görmek doğru ölçmek demek değildir. Sensörün gerçek doğruluğu için veri sayfasına bakılır; derslerdeki sayılar laboratuvar modelinindir.
- **Güvenlik.** Platformdaki her şey sanaldır. Proje bir pompa içermez; gerçek bir pompa için transistör ya da röle ve ayrı güç kaynağı gerekir ve şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
