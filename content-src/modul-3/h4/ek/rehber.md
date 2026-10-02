### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. PWM'i ve `analogWrite` değerinden doluluk oranı ile ortalama gerilimi hesaplamayı anlatabilir; LED parlaklığını 0-255 arasında ayarlayabilir.
2. Ortak katotlu RGB LED'i bağlayıp üç değerle (R, G, B) istediği rengi gösterebilir.
3. Pasif buzzer ile `tone` kullanarak nota ve melodi çalabilir; frekans ve oktav ilişkisini söyleyebilir.
4. Parametreli ve dönüş değerli kendi fonksiyonlarını yazabilir; yerel ve global değişken farkını açıklayabilir.
5. Plan tablosundan yola çıkarak ışık, ses ve girdiyi birleştiren Işıklı müzik kutusunu kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | PWM ve analogWrite: nefes alan LED | ~22 dk | Anlatımı oku, parlaklık basamaklarını ve nefes programını çalıştır, potansiyometreyle parlaklık ayarla, mini testi çöz. |
| 2 | RGB LED ve renk karıştırma | ~25 dk | Üç kanalı kur, renk paletini ve gökkuşağı geçişini dene, Serial Monitor'den renk gönder. |
| 3 | Buzzer: tone ve nota frekansları | ~22 dk | Pasif buzzer'ı bağla, La notasını, gamı ve oktavı çal, D11 çakışmasını gözle. |
| 4 | Fonksiyonlar, kapsam, parametreler | ~25 dk | Kendi fonksiyonlarını yaz, melodiyi fonksiyonlarla çal, kapsamı Serial Monitor'de izle. |
| 5 | Proje: Işıklı müzik kutusu | ~35 dk | Planı durum tablosuna yaz, devreyi kur, programı çalıştır, proje ölçütüyle değerlendir. |

### Ön koşul kontrolü
Bu hafta önceki haftalardan şunlar gerekir. Başlamadan kontrol et:
- `delay`, `for` döngüsü ve dizi (Hafta 1).
- `INPUT_PULLUP` ile buton okuma, `if`/`else` ve `switch` (Hafta 2).
- Serial Monitor'den sayı okuma, `parseInt` (Hafta 2).
- `analogRead`, `map` ve `constrain` (Hafta 3).
- LED için seri direnç ve Ohm yasası (Hafta 1).

### Kavram haritası
- **Çıkış kontrolü:** `digitalWrite` (yalnız 0/5 V) → PWM → `analogWrite` (0-255) → doluluk oranı → ortalama gerilim
- **Işık:** LED parlaklığı → RGB LED (R, G, B) → toplamalı karışım → ortak katot ve ortak anot
- **Ses:** titreşim → frekans (Hz) → oktav → aktif ve pasif buzzer → `tone`/`noTone` → Timer2 çakışması (D3, D11)
- **Program düzeni:** fonksiyon → parametre → `return` → yerel ve global kapsam
- **Proje:** durum tablosu → fonksiyonlara bölme → tempo ve vuruş süresi → `delay`'in sınırı

### Sık yapılan hatalar
- **`analogWrite`'a 0-1023 vermek.** Beklenen aralık 0-255'tir; `map` kullan.
- **PWM'siz pine `analogWrite` yazmak.** Yalnız D3, D5, D6, D9, D10 ve D11 (`~`) PWM yapar.
- **RGB'de COM ucunu yanlış bağlamak.** Ortak katotta COM GND'ye gider; ortak anotta 5V'a gider ve değerler ters yazılır.
- **Üç renk için tek direnç kullanmak.** Her kanalın kendi direnci olmalı.
- **Aktif buzzer ile nota çalmak.** Aktif buzzer hep aynı perdeyi verir; nota için pasif tür gerekir.
- **Notalar arasına `delay` koymamak.** `tone` beklemez; yalnız son nota duyulur.
- **`tone` çalarken D3 ya da D11'de parlaklık ayarlamak.** Bu pinlerde PWM bozulur; ayarlı LED'leri D9 ve D10'a bağla.
- **Fonksiyonu tanımlayıp çağırmamak** ya da **yerel değişkeni başka fonksiyonda kullanmak.**
- **`switch` içinde `break;` unutmak.** Renkler karışır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. `analogWrite(9, 64)`, `analogWrite(9, 128)` ve `analogWrite(9, 192)` için doluluk oranını ve ortalama gerilimi elle hesapla; laboratuvarda parlaklığı karşılaştır.
4. Bir Do-Re-Mi melodisini `notaCal(frekans, süre)` fonksiyonuyla bakmadan yaz.
5. Kendi cümlelerinle şu soruyu cevapla: "`tone` çalarken neden D11'e bağlı LED'in parlaklığını ayarlayamıyoruz?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Işıklı müzik kutusu)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Buzzer, RGB LED, buton ya da pot eksik; kanallar dirençsiz | Tüm parçalar doğru pinlerde ve her kanalın kendi direnci var | Bağlantılar düzenli; mavi kanalın D11'de olma nedenini açıklıyor |
| Plan | Durum tablosu yok | Bekleme, çalma, bitiş durumları tabloda | Tablo kodla birebir uyuyor ve fonksiyon ağacı çizilmiş |
| Program | Melodi çalmıyor ya da renkler yanlış | Buton melodiyi başlatıyor, notalar doğru renkte yanıyor, bekleme nefesi çalışıyor | Yeni nota/renk (Si, üst Do) ya da bitiş efekti eklenmiş |
| Fonksiyonlar | Her şey `loop()` içinde | İş anlamlı fonksiyonlara bölünmüş | Parametre ve `return` yerinde kullanılmış, global değişken sayısı az |
| Tempo | Tempo sabit ya da pot etkisiz | Pot 80-200 bpm arasında tempoyu değiştiriyor | Tempoyu vuruş süresiyle hesaplayıp açıklıyor |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Karşılaştığı hatayı ve nasıl bulduğunu anlatıyor; `delay` sınırını söylüyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir parçayı "ezberlemek" değil, ışık, ses ve girdiyi bir arada yönetmeyi denemektir. Öğrenci ilk kez kendi komutlarını (fonksiyonları) yazar; bu, sonraki haftalardaki büyük projelerin temelidir.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: "Hangi pine ne bağlı?", "Bu değer hangi aralıkta olmalı?", "Hangi fonksiyon çağrılmıyor olabilir?", "Ses nerede kesiliyor, ışık nerede değişiyor?"
- **Ses.** Laboratuvarda sesi duymak için ses düğmesi açık olmalıdır. Gerçek buzzer ile çalışılırken sesi uzun süre yüksek ve sürekli çaldırmak rahatsız edici olabilir; kısa süreli denemeler yeterlidir.
- **Işık.** Parlak LED'e uzun süre doğrudan bakmak gözü yorar; gerçek devrede gerekirse bir kâğıtla yumuşatılabilir.
- **Süre.** Proje dersi 35 dakikaya yaklaşabilir; gerekirse iki oturuma bölünebilir. Önce devre, sonra program.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders ilerleyip gerçek kart kullanılacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
