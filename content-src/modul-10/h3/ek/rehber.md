### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. İvmeölçerin x, y ve z eksenlerinde ne ölçtüğünü söyleyebilir; hareket bloklarının yalnız durum değişince çalıştığını açıklayabilir.
2. Sıcaklık, ışık ve ses sensörlerinin değerlerini (sıcaklık -5..50, ışık ve ses 0..255) okuyabilir ve bir eşikle karar verebilir.
3. Çubuk grafiğin kaç LED yaktığını değer ÷ en çok × 25 işlemiyle hesaplayabilir.
4. Pusula derecesini yönle eşleştirebilir ve kuzeyi gösteren okun açısını 360 eksi pusula olarak kurabilir.
5. Değişken ve kalan işlemiyle, düğmeyle mod değiştiren üç sensörlü bir Çevre istasyonu yapabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Plan günde bir ders içindir. Daha yoğun bir takvimde iki dersi birleştirmek mümkündür.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | İvmeölçer: salla ve yatır | ~20 dk | Anlatımı oku, sanal kartı salla ve yatır, sihirli topu kur, mini testi çöz. |
| 2 | Sıcaklık ve ışık | ~25 dk | Kaydırıcılarla sıcaklığı ve ışığı değiştir, eşik ve çubuk grafik hesaplarını yap, mini hava istasyonunu kur. |
| 3 | Pusula: kuzeyi bul | ~25 dk | Pusula derecelerini yönlerle eşleştir, 360 eksi pusula kuralıyla kuzey okunu çiz. |
| 4 | Ses seviyesi: alkış sayacı | ~25 dk | Doğru eşiği seç, değişkenle alkışları say, tur süresini hesapla. |
| 5 | Proje: Çevre istasyonu | ~35 dk | Planı yaz, A ile mod değiştir, çubuk ve sayı göster, projeyi ölçütlerle değerlendir. |

### Ön koşul kontrolü
Bu hafta Hafta 1 ve Hafta 2'nin konuları kullanılır. Başlamadan önce kontrol et:
- Öğrenci bir olay (düğme) bloğuna program yığını bağlayabiliyor mu? (Hafta 2, Ders 6)
- Bir değişkeni oluşturup "değerine ekle" ile artırabiliyor mu? (Ders 7)
- Eğer ... ise ... değilse bloğunu kullanabiliyor mu? (Ders 8)
- Sonsuza kadar bloğunun ne yaptığını biliyor mu? (Ders 5)
- Çarpma, bölme ve yüzde oranı (0,4 × 25) gibi işlemlerle rahat mı?

### Kavram haritası
- **Algılama:** sensör → sanal kaydırıcı → okuma anı → eşik
- **Hareket:** ivmeölçer → x, y, z → duruş (700 eşiği) → hareket olayı (yalnız değişimde)
- **Yön:** pusula (0 kuzey, 90 doğu, 180 güney, 270 batı) → 360 ≡ 0 → ok açısı = 360 − pusula → sekiz yönlü ok
- **Gösterim:** çubuk grafik (değer ÷ en çok × 25) → ekranı tek yerden yönetme
- **Program:** değişken → sayaç → kalan işlemi → mod → önce hazırla, sonra çiz

### Sık yapılan hatalar
- **Aynı yatışı tekrar denemek.** Sola yatık kartı yeniden sola yatırmak olay üretmez; önce yüzü yukarı yap.
- **Eşiği 700'ün altında sanmak.** Bir eksen en büyük ve en az 700 olmalı; küçük kaydırma yatış sayılmaz.
- **Sınır değerini unutmak.** sıcaklık > 30 koşulu 30'da yanlıştır; üzgün yüz 31'de çıkar.
- **En çok değerini yanlış yazmak.** Işık 255'e çıkar; en çok 5 bırakılırsa ekran hemen dolar.
- **Okun açısını doğrudan pusula yapmak.** Ok kartla birlikte döner; 360 − pusula gerekir.
- **Eksi yerine artı bırakmak.** Aritmetik blok varsayılan olarak toplar; işareti − yap.
- **Eşiği oda sesinin altında seçmek.** Oda sesi yaklaşık 20; eşik 10 olursa sayaç sürekli artar.
- **Ekrana iki yerden yazmak.** Hem sonsuza kadar hem düğme olayı çizerse görüntü karışır.
- **Kalan yerine mod + 1 yazmak.** Mod başa dönmez, 3, 4, 5 diye büyür.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Çubuk grafik hesabını elle yap: (sıcaklık 12, en çok 40), (ışık 100, en çok 255), (ses 255, en çok 255). Sonra sanal kartta sına.
4. Pusula 0, 90, 180, 270 ve 45 iken okun hangi yöne baktığını önce tahmin et, sonra çalıştırarak doğrula.
5. Kendi cümlelerinle cevapla: "Hareket blokları neden aynı yatışta ikinci kez çalışmaz?" ve "Neden 360 eksi pusula kullandık?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Çevre istasyonu)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Sensörler | Yalnız bir sensör çalışıyor | Sıcaklık, ışık ve ses kendi modunda çubuk olarak görünüyor | Her sensör doğru en çok değeriyle (40 ve 255) ve değer değişince çubuk orantılı değişiyor |
| Mod değiştirme | A mod değiştirmiyor ya da mod 3'ten sonra büyüyor | A her basışta 0, 1, 2 sırasıyla ilerliyor ve başa dönüyor | Dördüncü bir mod (pusula) ekleyip bölen sayıyı kendisi güncelliyor |
| Sayı gösterimi | B basılınca sayı görünmüyor | B basılıyken seçili sensörün sayısı kayıyor | Ekran yalnız sonsuza kadar bloğundan çiziliyor ve neden anlatılabiliyor |
| Program düzeni | Aynı ekrana birden çok yerden yazılıyor | Okuma ve enCok önce hazırlanıp sonra çiziliyor | Değişken adları anlaşılır ve bir uyarı (örneğin sıcaklık yüksekken kalp) eklenmiş |
| Anlatım | Ne yaptığını anlatamıyor | Programı adım adım anlatıyor | Hata yapıp nasıl bulduğunu ve çubuğun hesabını anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta ölçmek ve karar vermektir: değer okunur, bir eşikle karşılaştırılır, ekranda gösterilir. Sanal sensörlerin değerini öğrencinin kendisinin verdiğini vurgulamak, "ölçüm" ile "ayarlama" farkını düşündürür.
- **Nasıl destek olunur?** Cevabı söylemek yerine şu soruları sor: "Bu sensör şu an kaç okuyor?", "Eşik kaç ve bu değer ondan büyük mü?", "Ekrana kaç yerden yazıyorsun?"
- **Hesaplar.** Çubuk grafik ve pusula hesapları ufak ama gerçek matematiktir; öğrenci elle hesaplayıp sanal kartta doğrulayınca ilişki kalıcı olur.
- **Ses ve gizlilik.** Ses seviyesi sanal bir kaydırıcıdır; gerçek mikrofon kullanılmaz. Konuşmada gerçek cihazların sesi dinlerken gizlilik kuralları gerektiğini öğrenciyle tartışabilirsiniz.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Ders ilerleyip gerçek kart kullanılacaksa şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
