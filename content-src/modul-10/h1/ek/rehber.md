### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Mikro Kart'ın parçalarını (25 LED'lik ekran, A ve B düğmeleri, logo, P0-P2) ve sanal kartın ne olduğunu söyleyebilir.
2. Blok editöründe başlık bloğuna (başlangıçta, sonsuza kadar) bloklar takıp ▶ ile çalıştırabilir; blokların yukarıdan aşağıya, sırayla çalıştığını açıklayabilir.
3. LED'lerin (x, y) adresini, 0'dan sayımı ve ekranı temizleme/bekleme mantığını kullanarak tek tek LED yakabilir.
4. Hazır simgeleri ve kendi çizdiği 5 x 5 deseni gösterebilir; iki çizim arasına bekleme koyarak animasyon yapabilir.
5. Tekrarla bloğunu ve bekleme sürelerini kullanıp ritimli bir proje (Atan kalp) kurabilir; döngünün toplam süresini hesaplayabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 15-30 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Merhaba, Mikro Kart | ~15 dk | Anlatımı oku, kartın parçalarını tanı, yazı ve sayı göster, mini testi çöz. |
| 2 | LED'lerin adresi: x ve y | ~20 dk | Çapraz çizgiyi ve dört köşeyi çiz, adresleri kâğıda yazıp kontrol et. |
| 3 | Simgeler ve kendi desenin | ~20 dk | Yüzleri göster, robot başını çiz, iki çizim arasına bekle koyup animasyon yap. |
| 4 | Sıra ve tekrar | ~20 dk | Üç yanıp sönmeyi tekrarla ile kur, sayı ve süreleri değiştirip dene. |
| 5 | Proje: Atan kalp | ~30 dk | Planı tabloya yaz, kalbi kur, ritmi değiştir, proje ölçütüyle değerlendir. |

### Ön koşul kontrolü
Bu hafta özel bir ön bilgi gerekmez. Başlamadan önce şunları kontrol et:
- Tarayıcıda Mikro Kart editörü açılıyor mu ve ▶ düğmesi çalışıyor mu?
- Öğrenci fareyle (ya da parmakla) blok tutup sürükleyebiliyor mu?
- Sayıları 0'dan 10'a kadar sayabiliyor ve toplama/çarpma yapabiliyor mu? (Süre hesaplarında gerekir.)

### Kavram haritası
- **Kart:** LED ekranı (5 x 5 = 25) → düğmeler ve logo → sanal kart
- **Program:** başlık bloğu (başlangıçta, sonsuza kadar) → bloklar yukarıdan aşağıya → JavaScript ve Python görünümü (salt okunur)
- **Ekran:** yazı (kayar) ve tek karakter (durur) → LED adresi (x, y) → simge ve desen → ekranı temizle
- **Zaman:** bekle (ms) → animasyon → tekrarla → tur süresi ve toplam süre
- **Proje:** plan tablosu → parlaklık (0-255) → ritim

### Sık yapılan hatalar
- **Bloğu başlık bloğunun dışında bırakmak.** Soluk görünür ve hiç çalışmaz.
- **Değişiklikten sonra ▶ düğmesine basmamak.** Eski program ekranda kalır.
- **x ile y'yi karıştırmak ya da 1'den saymak.** (4, 0) sağ üst köşedir; en büyük adres 4'tür, 5 değil. Ekran dışı adres hata vermeden yok sayılır.
- **bekle koymamak.** Art arda iki çizimde yalnızca sonuncusu görülür; çizip hemen temizlenen şey de görünmez.
- **Temizlemeyi unutmak.** Yanıp sönmede kare hiç sönmez.
- **Bloğu tekrarla'nın içine/dışına yanlış takmak.** İçeridekiler her turda, dışarıdakiler bir kez çalışır.
- **Yazıyı sonsuza kadar içine koymak.** Her turda yeniden kayar ve kalp atışını bozar.
- **Parlaklığı 0 yapıp programın bozulduğunu sanmak.** Ekran karanlıktır ama program çalışır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Dört köşeyi yakan programı sıfırdan, bakmadan kur; sonra çerçevenin tamamını (16 LED) yakmayı dene.
4. Kendi çizdiğin bir deseni kâğıda 1 ve 0'larla yaz, kaç LED yandığını say ve editörde kontrol et.
5. Atan kalbin tur süresini ve dakikadaki tur sayısını hesapla; sonra bekleme sürelerini değiştirip hızın nasıl değiştiğini anlat.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Atan kalp)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Yapı | Bloklar başlık bloğunun dışında ya da program çalışmıyor | Yazı başlangıçta, kalp sonsuza kadar içinde | Plan tablosuyla birebir uyuşuyor ve bölümlerin neden ayrıldığı anlatılıyor |
| Görünüm | Kalp ya da küçük kalp görünmüyor | Büyük ve küçük kalp sırayla görünüyor, parlaklık ayarlı | Parlaklığı bilerek seçmiş ve nedenini açıklıyor |
| Ritim | Beklemeler yok ya da çok kısa | Tup-tup ve dinlenme ayırt ediliyor | Hızlı ve yavaş iki ritim yapıp tur süresini hesaplıyor |
| Hata ayıklama | Takıldığında nedenini bulamıyor | Hatayı sorarak/bakarak buluyor | Hatayı kendi başına bulup nasıl bulduğunu anlatıyor |
| Anlatım | Ne yaptığını anlatamıyor | Blokları sırayla anlatıyor | Bir arkadaşının programındaki hatayı bulup düzeltiyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta ezber değil, çocuğun blokla düşünmeye ve sonucu hemen görmeye alışmasıdır. Kart sanaldır; hata yapmak güvenlidir ve ↺ ile sıfırlanır.
- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: "Hangi blok önce çalışıyor?", "Bu blok başlangıçta bloğuna bağlı mı?", "Bekle koydun mu?", "Hangi adresi yazdın, ekranın neresi?"
- **Süre.** Dersleri art arda yapmak yerine her gün bir ders ve kısa bir tekrar kalıcılığı artırır. Yaş 8 ise okuma ve sayı işlemlerinde birlikte ilerleyin.
- **Ekran süresi.** Dersler kısadır; uzun oturumlar yerine ara vermek iyi olur.
- **İlerleme.** Dersin sonundaki mini test sonuçları beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
