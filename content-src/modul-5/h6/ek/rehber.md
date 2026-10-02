### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. İvmeölçerden `atan2(ax, az)` ile eğim açısını, jiroskoptan dönme hızını hesaplayabilir; jiroskop ölçeğini ve sapmasını açıklayabilir.
2. Tamamlayıcı filtrenin formülünü yazabilir, `α` ve `dt` ile zaman sabitini (`τ = α · dt / (1 − α)`) hesaplayabilir.
3. `delay()` döngüsü ile `micros()` ile planlanan sabit periyotlu döngü arasındaki farkı ölçüme dayanarak açıklayabilir.
4. Kaskad kontrolde dış döngünün (konum ve hız) iç döngüye (açı) hedef açı verdiğini, dış döngünün neden yavaş olması gerektiğini anlatabilir.
5. Dört parçayı birleştirip düşme algılayan, kendi raporunu veren bir denge programı kurabilir; benzetim kazançlarının gerçek robota taşınamayacağını bilir.

### Haftanın planı
Hafta beş derstir. Aşağıdaki plan günde bir ders içindir; proje dersi için fazladan zaman ayır. Bu hafta robot bir benzetimdir (ters sarkaç modeli).

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | IMU ile eğim ölçümü | ~20 dk | Anlatımı oku, eğim ve hız programını çalıştır, jiroskop sapmasını ölç, mini testi çöz. |
| 2 | Tamamlayıcı filtre ve Kalman'a giriş | ~25 dk | Üç açıyı (ivme, jiro, filtre) yan yana izle, `ALFA` değerini değiştir, hatayı karşılaştır. |
| 3 | Sabit periyotlu kontrol döngüsü | ~25 dk | `delay()` döngüsünün gerçek süresini ölç, sabit periyotlu sürümü çalıştır, periyotları dene. |
| 4 | Kaskad PID: açı ve hız | ~30 dk | Süzülmeyi gör, kaskadı ekle, dış döngü hızını (`DIS_ORAN`) değiştir. |
| 5 | Proje: Kendini dengeleyen robot | ~35 dk | Projeyi çalıştır, itme ver, raporu oku, kontrolsüz deneyi yap, ölçütle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce şunları kontrol et:
- Modül 4'ten MPU6050'yi ham `Wire` ile okuyabiliyor mu? (58. ders) Tamamlayıcı filtreyi ilk kez gördü mü? (59. ders)
- Hafta 5'ten P ve D terimlerinin ne işe yaradığını söyleyebiliyor mu? (96-97. dersler)
- Modül 3'ten `millis()` ile bloklamayan zamanlamayı ve `enum` ile durum makinesini hatırlıyor mu? (27 ve 28. dersler)
- Hafta 1'den motor yönü, PWM ve ölü bölge fikrini biliyor mu? (77-78. dersler)
- Derece, radyan ve temel trigonometri (sinüs, kosinüs) fikrine aşina mı? Gerekirse 101. dersteki tabloya bakmak yeter.

### Kavram haritası
- **Ölçüm:** ivmeölçer (yerçekimi, `atan2`) → jiroskop (hız, ölçek, sapma)
- **Birleştirme:** tamamlayıcı filtre → `α`, `dt`, zaman sabiti `τ` → Kalman'a giriş
- **Zamanlama:** `dt` → `delay()` tuzağı → planlanan zaman (`+=`) → taşma, `micros()` sarması
- **Kontrol:** açı PD → süzülme → kaskad (dış döngü hedef açı, iç döngü motor komutu) → hedef açı sınırı
- **Proje:** durum makinesi (DENGE, KONTROLSUZ, DUSTU) → en büyük eğim, oturma süresi → benzetimden gerçek robota

### Sık yapılan hatalar
- **Radyan bırakmak.** `atan2` radyan verir; derece kazançları için 57,2958 ile çarp.
- **`axHam / 16384` yazmak.** Tam sayı bölmesi sıfır verir; `16384.0` yaz.
- **Jiroskop ölçeğini aralıkla eşlememek.** ±500 °/s için 65,5, ±250 °/s için 131.
- **Sapmayı ölçerken robotu tutmak.** Sapma yanlış çıkar ve her ölçüme bulaşır.
- **Filtrede `hiz * dt` terimini unutmak ya da filtreyi 0'dan başlatmak.**
- **`delay(5)` ile 5 ms periyot sanmak.** Tur süresi 5 ms artı işin süresidir.
- **`sonPlanUs = simdi` yazmak.** Gecikmeler birikir; `+=` kullan.
- **Dış döngüyü iç döngüyle aynı hızda çalıştırmak.** İki döngü birbirini kovalar.
- **Hedef açıyı hesaplayıp iç döngüde kullanmamak ya da `KX`, `KV` işaretlerini ters koymak.**
- **Düşme eşiğini tek yönde kontrol etmek.** `fabs(aci)` kullan.
- **Benzetim kazançlarını gerçek robota kopyalamak.** Kazançlar robota özeldir, küçükten başlayarak yeniden ayarlanır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Yanlış yaptığın mini test sorularının açıklamalarını oku, sonra soruyu yeniden çöz.
3. Tamamlayıcı filtrenin formülünü bakmadan yaz. `α = 0,98` ve `dt = 0,01 s` için `τ` değerini hesapla (0,49 s).
4. `delay()` döngüsü ile sabit periyotlu döngünün farkını kendi cümlelerinle anlat: "Neden `+=` ?"
5. Kaskad kontrolü bir paragrafta anlat: dış döngü neyi ölçer, neyi üretir, iç döngü onu nasıl kullanır, neden dış döngü yavaştır?
6. Projeyi bir daha çalıştır; bu kez itmeyi ters yönde ver ve raporu karşılaştır.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Kendini dengeleyen robot)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Denge | Robot 10 saniye ayakta kalmıyor | 10 saniye ayakta kalıyor ve 3. saniyedeki itmeden toparlanıyor | Ters yönde ve farklı büyüklükte itmelerde de toparlanıyor, sınırı biliyor |
| Zamanlama | `delay()` ile döngü kurulmuş, `dt` sabit yazılmış | Planlanan zamana göre sabit periyot, `dt` ölçülüyor | Taşma sayacı var, periyodu değiştirip etkisini ölçmüş |
| Kontrol | Yalnız açı PD'si, robot süzülüyor | Kaskad çalışıyor, hedef açı sınırlı | Dış döngü hızını ve kazancı değiştirip sonucu açıklıyor |
| Güvenlik ve rapor | Düşünce motorlar kesilmiyor ya da rapor yok | Düşme her iki yönde algılanıyor; en büyük eğim ve oturma süresi raporlanıyor | Kontrolsüz deneyle karşılaştırma yapmış, jiroskop sapmasını açılışta ölçüyor |
| Anlatım | Ne yaptığını anlatamıyor | Dört parçayı ve sırasını anlatıyor | Benzetimden gerçek robota geçişte neyin değişeceğini açıklıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta çocuğun ölçmeyi, filtrelemeyi ve geri besleme ile kontrolü birleştirmesi hedeflenir. Robot benzetimdir; devrilen robot hata değil bir ölçümdür ve ↺ ile sıfırlanır.
- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: "Robot hangi yöne yatıyor, motor hangi yöne gidiyor?", "Bu sayıyı hangi sensör üretiyor?", "Bu döngü gerçekten kaç milisaniyede dönüyor, nereden biliyorsun?"
- **Zor noktalar.** Trigonometri (`atan2`) ve zaman sabiti ilk bakışta soyut gelebilir; 101. dersteki ax/az tablosu ve 102. dersteki sayısal örnekler yardımcı olur. Kaskad kontrol bu kursun en soyut kavramlarından biridir; acele edilmemeli.
- **Benzetim ve gerçek.** Derslerdeki kazanç sayıları benzetimdeki robota aittir. İleride gerçek bir robot kurulursa aynı değerler çalışmaz; yapı aynı, sayılar yeniden ayarlanır. Gerçek robotta motor ve pil güvenliği için yetişkin gözetimi gerekir; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **Süre.** Proje dersi uzundur; iki oturuma bölmek serbesttir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
