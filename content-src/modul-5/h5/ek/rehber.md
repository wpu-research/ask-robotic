### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Hata, ayar noktası ve kontrol çıkışı kavramlarını açıklayabilir; çizgi dizisinden konum hesaplayıp P kontrolle (`u = Kp x e`) direksiyon verebilir.
2. D teriminin aşımı nasıl sönümlediğini, gürültülü ölçümde süzgeçsiz D'nin neden zararlı olduğunu ve türevi süzmeyi açıklayabilir.
3. P kontrolün kalıcı hata bıraktığını, integralin bunu kapattığını ve windup ile anti-windup'ı anlatabilir.
4. PID'i sırayla (önce P, sonra D, en sonda I) ayarlayabilir; adım cevabından k, tau ve theta'yı hesaplayıp SIMC ile Kc ve Ti bulabilir.
5. PID ile bang-bang'i aynı koşullarda ölçerek karşılaştırabilir ve sonucu dürüstçe yorumlayabilir.

### Haftanın planı
Hafta beş derstir; dersler 30-40 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | P: orantılı kontrol | ~30 dk | Konumu hesapla, P kontrollü çizgi izleyiciyi çalıştır, Kp'yi değiştirip etkisini gözle, mini testi çöz. |
| 2 | D: türev ve gürültü | ~30 dk | Duvar takipçisinde Kd'yi değiştir, süzgeçli ve süzgeçsiz D'yi karşılaştır, testi çöz. |
| 3 | I: integral ve windup | ~35 dk | Zayıf motorlu robotta Ki'nin etkisini ölç, anti-windup'ı aç ve kapat, testi çöz. |
| 4 | PID ayarı: el ile ve SIMC | ~40 dk | Adım cevabını kaydet, k, tau ve theta'yı hesapla, SIMC değerlerini sketch'e yaz. |
| 5 | Bitirme projesi: PID çizgi izleyen ve duvar takipçisi | ~35 dk | PID ve bang-bang'i aynı pistte koştur, duvar takipçisini ayarla, proje ölçütüyle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce şunları kontrol et:
- Hafta 1-4 tamamlandı mı? Özellikle iki tekerlekli sürüş (PWM ve yön pinleri), bang-bang çizgi izleme, HC-SR04 ile servo ve enkoder ile hız ölçümü gerekir.
- `millis()` ile sabit periyotlu döngü yazabiliyor mu? (Modül 3, 27. ders)
- Kesme ve `volatile` kavramı hatırlanıyor mu? (Modül 3, 29. ders) Hız ölçümü bunu kullanır.
- Ondalık sayılar ve basit oran hesabı rahat mı? Formüller çarpma ve bölmeden ibarettir.

### Kavram haritası
- **Temel:** ayar noktası → ölçüm → hata (`e = ayar - ölçüm`) → kontrol çıkışı (`u`) → motorlar
- **P:** `u = Kp x e` → çok küçük Kp: çizgiyi kaybeder; çok büyük Kp: titrer ve aşar → kalıcı hata
- **D:** hatanın değişim hızı → sönümleme → gürültüde sahte hız → türev süzgeci (`ALFA`)
- **I:** hatanın birikimi → kalıcı hatayı kapatır → çıkış doyması → windup → anti-windup (sınırlama, doyunca durdurma)
- **Ayar:** el ile (P, D, I sırası) · Ziegler-Nichols (Ku, Pu; riskli) · SIMC (adım cevabı → k, tau, theta → Kc, Ti)
- **Proje:** çizgi ve duvar aynı iskelet → ayrı kazançlar → PID ve bang-bang'in adil karşılaştırması

### Sık yapılan hatalar
- **Tekerlek formülünde işaretleri karıştırmak.** `TABAN - u` ve `TABAN + u` yer değiştirirse robot çizgiden uzağa döner.
- **Hatanın işaretini ters tanımlamak.** Duvar takibinde `e = mesafe - HEDEF` olmalıdır.
- **Kp'yi bir seferde çok büyütmek.** Küçükten başla, her seferinde iki katına çıkar ve ölç.
- **`dt` ile bölmeyi ya da çarpmayı unutmak.** Türev `dt`'ye bölünür, integral `dt` ile çarpılır.
- **`sonHata`'yı güncellememek ya da başlatmamak.** İlk türev sıçrar ya da hata giderek büyür.
- **Gürültülü ölçümde süzgeçsiz D kullanmak.** Motor titrer.
- **Integrali hiç sınırlamamak.** Çıkış doyunca windup oluşur.
- **`loop()` içine `delay()` koymak.** Sabit kontrol periyodu bozulur.
- **Z-N'yi gerçek donanımda kararlılık sınırına kadar zorlamak.** Adım testi daha güvenlidir.
- **Tek koşuya bakarak PID ile bang-bang arasında karar vermek.** Aynı koşullarda en az iki koşu yap.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. `u = Kp x e + Ki x integral + Kd x turev` formülünü bakmadan yaz ve her terimin ne işe yaradığını tek cümleyle söyle.
4. Bir adım testinden k, tau ve theta'yı kendi elinle hesapla ve SIMC formülüne koy.
5. Kendi cümlelerinle şu soruyu cevapla: "Hangi durumda bang-bang PID'den daha mantıklıdır?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (PID çizgi izleyen ve duvar takipçisi)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Çizgi izleme | Robot çizgiyi kaybediyor | PID ile pisti bitiriyor | Kp, Kd ve Ki seçimini ölçüme dayanarak açıklıyor |
| Duvar takibi | Duvara çarpıyor ya da hedeften sürekli uzakta kalıyor | Başlangıçtan sonra ±2 cm bandında kalıyor | Kd ve süzgeci ölçüp seçiyor, yalnız P ile karşılaştırıyor |
| Ayar yöntemi | Değerleri rastgele deniyor | Önce P, sonra D, sonra I sırasını izliyor | Adım testi ya da SIMC ile ayar değerini hesaplıyor |
| Karşılaştırma | Tek koşuya bakıyor | PID ve bang-bang'i aynı pist ve TABAN'da koşturuyor | En az iki koşuda ölçüp dürüstçe yorumluyor (hangi pistte kim önde) |
| Anlatım | Ne yaptığını anlatamıyor | Her terimin ne işe yaradığını söylüyor | Hata yapıp nasıl bulduğunu ve windup gibi tuzakları anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta formül ezberletmek değil, "ölç, değiştir, yeniden ölç" alışkanlığı kazandırmaktır. Dersin sonuçları benzetim ölçümleridir; öğrenci kendi robotunda sayıların farklı çıkmasını normal karşılamalıdır.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: "Hatanın işareti ne?", "Robot hedefi aşıyor mu, hiç varmıyor mu?", "Hangi sayıyı değiştirdin, tek başına mı değiştirdin?"
- **Süre.** Dersler yoğundur. Aynı gün birden çok ders yapmak yerine aralıklı çalışmak kalıcılığı artırır.
- **Güvenlik.** Gerçek robotta motorlar için harici güç ve ortak GND kullanılır, pil kısa devre yapılmaz ve ters bağlanmaz. Robotu masa kenarında çalıştırma. İntegral açıkken robotu elinle tutup bırakma; robot fırlayabilir. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
