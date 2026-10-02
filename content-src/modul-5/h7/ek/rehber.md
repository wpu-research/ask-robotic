### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Enkoder ve jiroskopun güçlü ve zayıf yanlarını söyleyebilir; jiroskop ölçeğini seçip tamamlayıcı filtreyle birleşik yönelim hesaplayabilir.
2. Robot programını davranışlara ayırabilir; öneri, hakem ve öncelik kavramlarını açıklayabilir; iki eşikli (histerezisli) bir davranış yazabilir.
3. İki eksenli robot kol için ileri ve ters kinematik hesaplayabilir; erişilemeyen hedefleri ve servo sınırlarını yakalayabilir.
4. Robot kolu `millis()` ile yumuşak hareket ettirebilir ve al-bırak işini adım tablosu olarak yazabilir.
5. Konum tahmini, davranışlar ve ölçüm sayılarıyla (kapsama, çarpma, süre) bir gezgin robot kurup değerlendirebilir.

### Haftanın planı
Hafta beş derstir; dersler 30-35 dakikadır. Plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Sensör birleştirme: enkoder + IMU | ~30 dk | Anlatımı oku, jiroskop ölçeğini dene, α değerini değiştirip sapmayı gözle, mini testi çöz. |
| 2 | Davranış tabanlı kontrol ve öncelikler | ~30 dk | Üç davranışı oku, seri çıktıdan hangi davranışın ne zaman devrede olduğunu izle, sırayı değiştirip tahminini sına. |
| 3 | Robot kol: servolar ve iki eksen ters kinematik | ~35 dk | Önce elle bir iki hedef için q1 ve q2 hesapla, sonra programla karşılaştır, erişilemeyen noktaları dene. |
| 4 | Robot kol: al-bırak dizisi | ~35 dk | Ani ve yumuşak hareketi karşılaştır, adım tablosunu oku, süreleri değiştir. |
| 5 | Proje: Gezgin robot (ara, kaç, dolaş) | ~35 dk | Davranışları ve konum tahminini birleştir, ölçüm tablosuyla değerlendir. |

### Ön koşul kontrolü
Başlamadan önce şunları kontrol et:
- Sürüş (D5-D10), enkoder (D2, D3), ultrasonik (D11, D12) bağlantıları ve `millis()` ile bloklamayan döngü rahat mı? (Hafta 1-4)
- Tamamlayıcı filtre ve sabit periyotlu döngü hatırlanıyor mu? (102. ve 103. dersler)
- Sinüs, kosinüs ve radyan-derece dönüşümü okul bilgisi olarak biliniyor mu? Kol dersleri bunu kullanır.
- Servo kullanımı ve harici güç kaynağı kuralı (ortak GND) biliniyor mu? (21. ders)

### Kavram haritası
- **Algılama:** enkoder yönelimi · jiroskop (ölçek, sapma, doyma) · tamamlayıcı filtre → birleşik yönelim
- **Karar:** davranış → öneri → hakem → öncelik · histerezis (iki eşik)
- **Kol:** servo açısı (q1, q2) · ileri ve ters kinematik · menzil ve servo sınırı · darbe genişliği
- **Hareket:** doğrusal ara değer · servo çerçevesi (20 ms) · adım tablosu
- **Birleşim:** konum tahmini (x, y) → hedefe yönelme (açı farkı) → ölçüm (kapsama, çarpma, süre)

### Sık yapılan hatalar
- **Ölçeği değiştirip böleni değiştirmemek.** ±500 için 65,5; 131 yazarsan açılar yarı çıkar.
- **Jiroskop sapmasını ölçmemek.** Dururken `gz` sıfır olmalı; değilse yönelim zamanla kayar.
- **Yönelimi 0-360'a sarıp filtrelemek.** Sarmayı yalnız açı farkında yap.
- **Davranışın içinde motoru sürmek.** Davranış yalnız öneri döndürür; motoru hakem sürer.
- **Tek eşikli KAÇ.** Robot eşik civarında titrer; başlama ve bitirme eşiği ayrı olmalı.
- **Derece ile radyanı karıştırmak.** `cos()` ve `sin()` radyan ister, servo derece ister.
- **Erişilemeyen hedefi servoya yazmak.** Önce menzili ve servo sınırını kontrol et.
- **Tamsayı bölmesi.** `(2400 - 544) / 180` 10 çıkar; oranı hesaplarken biri `float` olmalı.
- **Tutucuyu kol hareket ederken açıp kapamak.** Nesne düşer; yalnız kol durmuşken.
- **Konum tahminine mutlak güvenmek.** Duvara dayanıp dönen tekerlekler tahmini bozar.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Kâğıt üzerinde L1 = L2 = 10 cm kol için (14, 6) ve (10, 10) hedeflerinin q1 ve q2 değerini hesapla; sonra programla doğrula.
4. Kendi cümlenle şu soruyu cevapla: "Hakem ne işe yarar ve davranış neden motoru kendisi sürmemeli?"
5. Gezgin robotta `ARAMA_MS` değerini değiştir ve ziyaret zamanının nasıl değiştiğini yaz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Gezgin robot)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Davranışlar | Davranışlar tek bir `if` merdiveninde karışık | Üç davranış ayrı fonksiyon, hakem öncelik sırasıyla seçiyor | Dördüncü bir davranış (ör. şarj) eklenmiş ve önceliği gerekçelendirilmiş |
| Konum tahmini | Tahmin yok ya da başlangıç değerleri yanlış | Yol ve birleşik yönelimle (x, y) güncelleniyor | Tahmin hatası ölçülmüş, çarpma sonrası kayma açıklanmış |
| Güvenlik | Robot sık çarpıyor, KAÇ iki eşiksiz | KAÇ iki eşikli, çarpma sayısı eşik içinde | Yanlardan gelen engeller için ek önlem düşünülmüş |
| Görev ve ölçüm | Bölgeye varılmıyor, sayı yok | Bölge ziyareti ve kapsama sayıyla ölçülmüş | KAÇ kapatılıp karşılaştırma koşusu yapılmış |
| Anlatım | Ne yaptığını anlatamıyor | Davranışları ve konum hesabını adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve sınırlarını anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta tek tek bilgi vermekten çok, parçaları birleştirmeyi öğretir. Hata yapmak güvenlidir; benzetimdeki robot ve kol zarar görmez.
- **Nasıl destek olunur?** Takılınca cevabı söylemek yerine şunları sor: "Hangi sensör bu bilgiyi veriyor?", "Şu an hangi davranış devrede, seri çıktı ne diyor?", "Açıyı derece mi radyan mı verdin?"
- **Sayılarla çalışmak.** Kapsama, çarpma, hata (mm) gibi ölçümler "iyi oldu" yerine kanıt koymayı öğretir. Öğrenciyi her değişiklikten sonra sayıya bakmaya teşvik edin.
- **Güvenlik.** Gerçek robotta motorlar ve servolar için ayrı güç kaynağı ve ortak GND kullanılır; servoları Arduino'nun 5 V pininden beslemeyin. Pil takarken artıyı eksiyi ters bağlamayın, uçları birbirine değdirmeyin. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **Gerçek robotta farklı olabilecekler.** Benzetimde tekerlekler kaymaz, servo yük taşımaz ve ultrasonik ışın tek bir doğrudur. Gerçek robotta bunların hepsi sonucu bozar; bu yüzden gerçek donanımda her şey yeniden ölçülmeli ve kalibre edilmelidir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
