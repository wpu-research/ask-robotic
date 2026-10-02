### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Mikrodenetleyicinin ne olduğunu ve Arduino Uno üzerindeki pinleri (dijital, analog, 5V, GND) söyleyebilir.
2. Ohm yasasıyla (V = I × R) gerilim, akım ve direnç hesaplayabilir; LED için seri direncin neden gerektiğini açıklayabilir.
3. `setup()`, `loop()`, `pinMode`, `digitalWrite` ve `delay` ile bir LED'i yakıp söndüren program yazabilir.
4. `for` döngüsü ve dizi ile birden çok LED'i sürebilir.
5. Plan tablosundan yola çıkarak üç LED'li bir trafik ışığı kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-30 dakikadır. Aşağıdaki plan günde bir ders içindir. Daha yoğun bir takvim isteyenler iki dersi birleştirebilir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Mikrodenetleyici nedir? | ~20 dk | Anlatımı oku, Uno'yu laboratuvarda tanı, dahili L LED'ini yak, mini testi çöz. |
| 2 | Elektrik: V, I, R ve Ohm yasası | ~20 dk | Hesapları elle yap, sanal ölçümle akımı oku, hesapla karşılaştır. |
| 3 | İlk program: Blink | ~20 dk | İlk devreyi kur, programı çalıştır, bekleme sürelerini değiştir. |
| 4 | Çoklu LED, for döngüsü ve diziler | ~25 dk | Dört LED kur, döngü ve dizi sürümlerini dene. |
| 5 | Proje: Trafik ışığı | ~30 dk | Planı tabloya yaz, devreyi kur, programı yaz, proje ölçütüyle değerlendir. |

### Ön koşul kontrolü
Bu hafta özel bir ön bilgi gerekmez. Başlamadan önce şunları kontrol et:
- Tarayıcıda devre laboratuvarı açılıyor mu? (Menüden "Devre laboratuvarı")
- Öğrenci dört işlem ve ondalık sayılarla rahat mı? (Ohm yasası bölme ve çarpma içerir.)
- Fare ile kablo çekmek ve parça seçmek konusunda sorun var mı?

### Kavram haritası
- **Donanım:** mikrodenetleyici → Arduino Uno → pinler (dijital, analog) → 5V ve GND
- **Elektrik:** gerilim, akım, direnç → Ohm yasası → LED için seri direnç → kapalı devre
- **Program:** sketch → `setup()` ve `loop()` → `pinMode`, `digitalWrite`, `delay` → `for` ve dizi
- **Proje:** plan tablosu → aşamalar → söndür-yak-bekle kalıbı → tur süresi

### Sık yapılan hatalar
- **mA ile A'yı karıştırmak.** 20 mA = 0,02 A. Hesaptan önce ampere çevir.
- **LED'i dirençsiz bağlamak.** Akım sınırlanmaz; laboratuvar uyarı verir.
- **LED'i ters bağlamak ya da GND'yi unutmak.** Devre kapanmaz, LED yanmaz.
- **`pinMode` unutmak.** LED çok sönük yanar ya da hiç yanmaz.
- **Noktalı virgül unutmak.** Derleyici "expected ';'" der. Hata mesajını okumak çözümün yarısıdır.
- **`delay` süresini saniye sanmak.** `delay(5)` 5 milisaniyedir.
- **Dizide 1'den saymak.** İlk eleman `ledler[0]`'dır; 4 elemanlı dizide `ledler[4]` diziden taşar.
- **Önceki aşamanın LED'ini söndürmemek.** Trafik ışığında iki LED birlikte yanar.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Blink programını sıfırdan, bakmadan yaz; sonra bekleme sürelerini değiştir.
4. Kırmızı LED için 330 Ω yerine 1 kΩ ve 150 Ω kullanıldığında akımın nasıl değiştiğini hesapla ve laboratuvarda ölç.
5. Kendi cümlelerinle şu soruyu cevapla: "LED'in önündeki direnç ne işe yarar?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Trafik ışığı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | LED'lerden biri yanmıyor ya da dirençsiz | Üç LED kendi direnciyle ve doğru yönde bağlı | Renkler doğru seçilmiş, bağlantılar düzenli |
| Plan | Tablo yok | Aşama, LED ve süre tablosu var | Tablo, kodla birebir uyuyor ve açıklanmış |
| Program | Aynı anda birden çok LED yanıyor ya da program çalışmıyor | Üç aşama doğru sırada ve tek LED yanıyor | Kırmızı-sarı uyarı aşaması gibi bir geliştirme eklenmiş |
| Zamanlama | Süreler yanlış (örneğin delay(5)) | Süreler tabloyla uyuşuyor | Süreleri değiştirip etkisini açıklıyor |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir şey "ezberletmek" değil, öğrencinin devre kurmaya ve çalışan ilk programı görmeye alışmasıdır. Hata yapmak laboratuvarda güvenlidir; yanan LED ya da kısa devre sanaldır ve ↺ ile sıfırlanır.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: "Akım nereden girip nereden çıkıyor?", "Hata mesajı ne diyor?", "Hangi pinleri bağladın, kodda hangisini yazdın?"
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Her ders arasında kısa bir tekrar yeterlidir.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders ilerleyip gerçek kart kullanılacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
