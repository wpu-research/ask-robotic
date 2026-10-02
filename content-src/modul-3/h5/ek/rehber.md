### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Servoyu `Servo` kütüphanesiyle istediği açıya götürebilir; açının darbe genişliğiyle söylendiğini açıklayabilir.
2. Arduino pininin neden motoru doğrudan süremediğini söyleyebilir; NPN transistör ya da mantık seviyeli MOSFET ile motoru anahtarlayabilir ve baz akımını hesaplayabilir.
3. Flyback diyotun ne işe yaradığını bilir ve doğru yönde bağlar.
4. L293D ile motorun yönünü (IN1, IN2) ve hızını (EN, PWM) denetleyebilir.
5. Röle modülünün COM, NO, NC uçlarını ve aktif-LOW mantığını açıklayabilir; histerezisle eşik kararı yazabilir; şebeke gerilimiyle röle denememesi gerektiğini bilir.
6. Sıcaklığa göre fanı ve servoyu yöneten bir sistemi planlayıp kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Servo: açı kontrolü | ~20 dk | Anlatımı oku, üç sketch'i dene, tarama hızını değiştir, mini testi çöz. |
| 2 | Transistör ve MOSFET ile anahtarlama, DC motor | ~25 dk | Devreyi kur, baz akımını hesapla, diyotu silip uyarıyı gör, mini testi çöz. |
| 3 | H-köprüsü L293D: yön ve hız | ~25 dk | Devreyi kur, yön tablosunu sına, iki butonlu sürüşü dene. |
| 4 | Röle: yüksek akım anahtarlama ve güvenlik | ~20 dk | Güvenlik bölümünü oku, Tetik'i LOW yap, butonlu ve eşikli sketch'leri dene. |
| 5 | Proje: Sıcaklığa bağlı otomatik fan ve servo tarayıcı | ~35 dk | Planı yaz, devreyi kur, sıcaklığı değiştirerek sına, ölçütle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce şunları kontrol et:
- `analogRead`, `map` ve `analogWrite` (PWM) kullanabiliyor mu? (Ders 11, 14, 16)
- `if/else`, `for` ve fonksiyon yazabiliyor mu? (Ders 4, 7, 19)
- Butonu `INPUT_PULLUP` ile okuyabiliyor mu? (Ders 6)
- NTC ile sıcaklık hesabını görmüş mü? (Ders 13; proje dersinde gerekli)
- Ohm yasasıyla akım hesaplayabiliyor mu? (Ders 2)

### Kavram haritası
- **Hareket:** servo (açı, darbe genişliği) → DC motor (hız) → yön (H-köprüsü)
- **Güç aktarımı:** pin → baz direnci → NPN / MOSFET → motor → flyback diyot
- **Yön ve hız:** L293D → IN1, IN2 (yön) → EN (PWM hız) → VCC1 mantık, VCC2 motor
- **Ayrık devre:** röle → COM, NO, NC → aktif-LOW → histerezis → güvenlik
- **Proje:** NTC ölçümü → histerezisli karar → map ile fan hızı → servo taraması

### Sık yapılan hatalar
- **`attach` unutmak.** Servo hiç hareket etmez.
- **Servoda D9 ve D10'dan PWM beklemek.** Servo kütüphanesi bu iki pinin `analogWrite`'ını kapatır.
- **Motoru doğrudan pine bağlamak.** Pinin akım sınırı aşılır; transistör ya da sürücü kullan.
- **Baz direncini ya da flyback diyotu atlamak.** Laboratuvar uyarı verir; gerçekte parça bozulur.
- **Diyotu ters bağlamak.** Çizgili uç (katot) motorun artı tarafına bakmalıdır.
- **L293D'de VCC1, VCC2, GND ya da EN'i unutmak.** Çıkışlar boşta kalır, motor dönmez.
- **IN1 ve IN2'yi aynı yapmak.** Motor durur.
- **Röle mantığını ters sanmak.** Aktif-LOW modül LOW ile çeker.
- **Tek eşik kullanmak.** Röle ve fan eşik civarında titrer; histerezis ekle.
- **Şebeke gerilimiyle röle denemek.** Ölümcüldür; yalnız eğitimli uzman yapabilir.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bak, "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku ve soruyu tekrar çöz.
3. Servo için açıyı 45 dereceye götürüp darbe genişliğini hesapla (≈ 1008 µs).
4. NPN devresi için baz akımını 1 kΩ ve 2,2 kΩ değerleriyle hesapla ve karşılaştır.
5. Kendi cümlelerinle şu soruyu cevapla: "Motoru neden doğrudan pine bağlamıyoruz, ve flyback diyot ne yapar?"
6. Proje programını bakmadan yeniden yaz; eşikleri değiştirip etkisini yaz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Otomatik fan ve servo tarayıcı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Fan doğrudan pinde ya da diyot/baz direnci eksik; laboratuvar uyarı veriyor | Transistör, baz direnci, flyback diyot ve servo doğru bağlı, uyarı yok | Bağlantılar düzenli; her parçanın neden orada olduğunu açıklıyor |
| Karar | Tek eşik; fan eşikte titriyor | 30 °C aç, 28 °C kapat histerezisi çalışıyor | Eşikleri kendi seçip sıcaklık özelliğiyle sınıyor ve nedenini açıklıyor |
| Hız | Fan yalnız aç/kapa | Hız sıcaklıkla `map` ile artıyor | Alt sınırı (90) neden koyduğunu anlatıyor, aralığı kendi deniyor |
| Servo | Servo hiç ya da yanlış açıda hareket ediyor | Fan açıkken 30-150 tarıyor, soğukken 90'da park | Tarama aralığı ve hızını ayarlıyor |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor; geliştirme (UYARI gibi) ekliyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta öğrenci kodun fiziksel dünyada hareket oluşturduğunu görür. Önemli kavram ayrımı: bilgi (pin) ile güç (motor kaynağı) ayrı yollardan gider.
- **Nasıl destek olunur?** Takıldığında cevap vermek yerine sor: "Akım nereden girip nereden çıkıyor?", "Laboratuvar hangi uyarıyı veriyor?", "Hangi pini sürüyorsun, güç nereden geliyor?"
- **Güvenlik.** Platformdaki her şey sanaldır. Gerçek parçaya geçilirse motoru Arduino'nun 5V ucundan beslemek kartı sıfırlayabilir; ayrı kaynak kullanılır ve GND'ler birleştirilir. Röle dersinde şebeke gerilimiyle (220 V) hiçbir deney yapılmaz; bu iş yalnız eğitimli uzmana aittir.
- **Süre.** Dersleri günlere yaymak kalıcılığı artırır.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
