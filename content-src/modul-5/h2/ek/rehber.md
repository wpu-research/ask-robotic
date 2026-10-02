### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Tampon anahtarını `INPUT_PULLUP` ile okuyabilir, sol/sağ/ön çarpmayı ayırıp engelin tersine dönen bir tepki yazabilir.
2. HC-SR04 yankı süresini mesafeye çevirebilir (süre / 58) ve medyan filtrenin neden gerektiğini açıklayabilir.
3. Dur eşiğini seçerken sensör konumunu ve fren payını hesaba katabilir.
4. Servoyla birkaç yönü tarayıp en uzak yönü bulabilir ve açıyı dönüş süresine çevirebilir.
5. Beş durumlu (ILERI, DUR, TARA, DON, GERI) `millis()` tabanlı bir durum makinesi okuyup yazabilir.
6. Robotun başarısını yol ve çarpma sayısı gibi ölçülebilir ölçütlerle değerlendirebilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir. 84. ders en yoğun olanıdır; gerekirse iki güne böl.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Tampon (dokunma) sensörleriyle tepki | ~20 dk | Anlatımı oku, tamponları izle, çarp-geri çekil-dön programını çalıştır, `GERI_MS` ve `DONUS_MS` ile oyna, mini testi çöz. |
| 2 | Mesafe sensörüyle dur ve dön | ~25 dk | Ham ve medyan değerleri karşılaştır, tek ölçümlü ve medyanlı robotun durma noktalarını dene, `ESIK_CM` ve `N` değerlerini değiştir. |
| 3 | Servo taramasıyla en açık yolu bul | ~25 dk | Açı tablosunu çiz, taramayı çalıştır, seçilen açıyı yorumla, adımı 15°'ye indir. |
| 4 | Engelden kaçma durum makinesi | ~30 dk | Durum tablosunu kendi cümlelerinle çiz, seri monitörden `DURUM` satırlarını izle, `ACIK_CM` değerini değiştir. |
| 5 | Proje: Otonom engelden kaçan robot | ~35 dk | Programı çalıştır, yol ve çarpma sayısını ölç, `x` ve `g` komutlarını dene, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta Hafta 1 (76-80. dersler) ve Modül 3-4'ün bazı bilgileri gerekir. Başlamadan önce:
- `surus(sol, sag)` ile iki motoru birlikte sürebiliyor mu? (Modül 5, Hafta 1)
- `INPUT_PULLUP` ile buton okuyup "basılı = LOW" mantığını biliyor mu? (Modül 3, ders 6)
- `millis()` ile `delay` kullanmadan süre ölçebiliyor mu? (Modül 3, ders 27)
- `enum` ve `switch` ile durum makinesi okuyabiliyor mu? (Modül 3, ders 28)
- HC-SR04 ile `pulseIn` kullanımı ve medyan filtre tanıdık mı? (Modül 4, ders 38)
- `Servo` kütüphanesi ile açı verebiliyor mu? (Modül 3, ders 21)

Eksik varsa ilgili dersin anlatımına dönülür.

### Kavram haritası
- **Algılama:** tampon (temas) → ultrasonik (uzaklık) → servoyla tarama (yön) → ölçüm gürültüsü → medyan filtre
- **Karar:** eşik → fren payı → en uzak yön → açıdan dönüş süresine
- **Yapı:** durumlar → geçiş koşulları → `millis()` ile süre → `gec()` → yedek koruma (tampon, sıkışma)
- **Ölçme:** yol → çarpma sayısı (kenar algılama) → eşiği ölçümden türetme → acil durdurma

### Sık yapılan hatalar
- **Basılı tamponu HIGH sanmak.** `INPUT_PULLUP` ile basılı = LOW.
- **Dönüş yönünü ters seçmek.** Sol tampon basıldıysa engel soldadır; robot sağa döner.
- **Yankı gelmeyince 0 sonucunu mesafe sanmak.** 0 "duvar dibindeyim" değil, "yankı yok" demektir.
- **Tek ölçüme güvenmek.** Medyan filtre aykırı ölçümü eler.
- **Eşiği robotun merkezine göre düşünmek.** Sensör robotun önündedir ve robot durmak için de yol alır.
- **Servoya `write` dedikten hemen sonra ölçmek.** Servo yoldadır; ölçüm iki yönün karışımı olur.
- **Sol ile sağı karıştırmak.** 90° ileri, büyük açı sol.
- **Durumu `durum = ...` ile atamak.** `durumBasi` güncellenmez; `gec()` kullan.
- **Durum bloklarına `delay` koymak.** Robot beklerken tamponları göremez.
- **Çarpmayı bayrak doğru olduğu sürece saymak.** Kenar say: bayrağın doğru olmaya başladığı anı.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Beş durumlu tabloyu (durum, ne yapar, çıkış koşulu, sonraki) bakmadan kâğıda çiz.
4. `ESIK_CM` değerini 15 ve 40 yap; durma noktasının ve çarpma sayısının nasıl değiştiğini kısa bir cümleyle yaz.
5. Kendi cümlelerinle şu soruyu cevapla: "Robot işe yarıyor demek için hangi iki sayıyı sorarım ve neden ikisi de gerekli?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Otonom engelden kaçan robot)
Ölçüm arenası: 2 × 2 m, içinde üç engel; 30-35 saniyelik koşu; ölçüm gürültüsü 2 cm.

| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre ve güvenlik | Ortak GND yok ya da motorlar Arduino 5 V'undan besleniyor | Ayrı pil, ortak GND, tamponlar ve sensör doğru pinlerde | Bağlantıyı pin tablosuyla anlatıyor ve acil durdurmayı güvenlik önlemi olarak açıklıyor |
| Davranış | Duvara sürekli çarpıyor ya da hiç ilerlemiyor | 30-35 sn'de en az 3 m yol, en fazla 3 çarpma | Eşik ve hızı değiştirip sonucu ölçüyor, tabloya yazıyor |
| Durum makinesi | `delay` içeriyor ya da durumlar karışık | Beş durum, `gec()` ile geçiş, `delay` yok | Yeni bir durum (örneğin BEKLE) ekleyip tabloyu güncelliyor |
| Ölçme | Sayı vermiyor | Yol ve çarpma sayısını ölçüyor, çarpmayı kenar sayıyor | Eşiği ölçümden türetiyor ve "bu sayı yalnız bizim arenaya mı uyuyor?" sorusunu cevaplıyor |
| Anlatım | Ne yaptığını anlatamıyor | Durum tablosunu ve her geçişi anlatıyor | Hata yapıp nasıl bulduğunu (örneğin `durum` atama hatası) anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta robotun nasıl "karar verdiği"ni görünür kılmaktır: sensör, eşik, durum. Çalışmayan bir robot hata değil, ölçülecek bir veridir.
- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: "Robot şu an hangi durumda?", "Seri monitör ne yazıyor?", "Sensör ne ölçüyor, sen ne bekliyordun?"
- **Süre.** 84. ders yoğundur; iki güne bölmek kalıcılığı artırır.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek robota geçilirse: ilk denemede robotu kaldırıp tekerlekleri havadayken çalıştırın; motorlar ve servo ayrı pille beslenir ve GND ortak yapılır; piller kısa devre yapılmaz ve ters bağlanmaz; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. `x` komutunu bir "acil durdur" gibi düşünün.
- **Gerçek robotla fark.** Derslerdeki ölçümler benzetim sonuçlarıdır. Gerçek sensörler, tamponlar ve motorlar farklı davranır; süreleri ve eşikleri kendi robotunuzda yeniden ölçün.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
