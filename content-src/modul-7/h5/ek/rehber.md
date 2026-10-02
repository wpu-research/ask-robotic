### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Bir metnin kelime sayımı ve TF-IDF ile vektöre çevrildiğini açıklayabilir; iki küçük vektörün kosinüs benzerliğini elle hesaplayabilir.
2. Sayım vektörünün eş anlamlıları neden bağlayamadığını ve gömme modellerinin hangi fikre dayandığını söyleyebilir.
3. RAG'ın beş adımını (parçala, vektörleştir, getir, yerleştir, sentezle) sıralayabilir; boy ve örtüşmeden parça sayısını hesaplayabilir.
4. Top-K getirmeyi, prompt şablonunu ve "bilmiyorum" talimatının amacını açıklayabilir.
5. Kendi RAG hattını kurup getirme isabeti ile cevabın kaynağa sadakatini ayrı ayrı değerlendirebilir; atölyedeki son adımın bir şablon (simülasyon) olduğunu bilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 25-40 dakikadır. Plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Metinleri sayılarla karşılaştır | ~30 dk | Anlatımı oku, Yapay Zekâ Atölyesi'nde Metin benzerliği aracını aç, TF-IDF ile sorgu dene, mini testi çöz. |
| 2 | Eş anlamlıyı yakalayamayan vektör | ~25 dk | Sıfır benzerlik çıkaran bir sorgu bul, "mesafeyi" ile karşılaştır, sınırı kendi cümlenle yaz. |
| 3 | Parçalama: ne kadar büyük? | ~30 dk | RAG hattı aracında parça boyu ve örtüşmeyi değiştir, parça sayısını elle hesaplayıp araçla karşılaştır. |
| 4 | Getirme: doğru parçayı bul | ~30 dk | Belirsiz ve net soruları karşılaştır, K'yı değiştir, şablon yanıtın bir alıntı olduğunu not et. |
| 5 | Proje: Kendi RAG hattın | ~40 dk | Ayarları seç, üç soru sor, bağlamda olmayan bir soru dene, raporu yaz. |

### Ön koşul kontrolü
- Metni parçalara ayırmayı (token, kelime sayımı) hatırlıyor mu? (Ders 2 ve 4)
- Prompt'a bağlam koymayı ve bağlam penceresinin sınırlı olduğunu biliyor mu? (Ders 7 ve 9)
- Doğruluk oranını (doğru sayısı bölü toplam) hesaplayabiliyor mu? (Ders 16-20)
- Çarpma, toplama ve karekökle rahat mı? (Kosinüs hesabı için)

### Kavram haritası
- **Temsil:** metin → terimler → vektör (sayım, TF-IDF) → kosinüs benzerliği → sınır: eş anlamlı → gömme modeli
- **Hat:** belge → parça (boy, örtüşme) → vektör → getirme (top-K) → bağlam → prompt şablonu → sentez
- **Ölçüm:** getirme isabeti · sadakat · "belgede yok" vakası
- **Dürüstlük:** ilk dört adım gerçek hesap; sentez adımı şablon (simülasyon); kaynak yanlışsa cevap da yanlış

### Sık yapılan hatalar
- **Kosinüs hesabında paydayı unutmak.** Yalnız nokta çarpımı almak uzun belgeleri öne çıkarır.
- **Sayım vektörünü anlam sanmak.** "Mesafe" ve "uzaklık" iki ayrı terimdir; benzerlik 0 çıkar.
- **Parça sayısını belge / boy diye hesaplamak.** Örtüşme varsa adım boy − örtüşmedir.
- **Örtüşmeyi boya eşit ya da büyük seçmek.** Pencere ilerlemez.
- **Belirsiz soru yazmak.** "Yardım" gibi tek kelime doğru parçayı getirmeye yetmez.
- **K'yı büyütünce her şeyin düzeleceğini sanmak.** Bağlam uzar, ilgisiz metin girer; ortak terimi olmayan parça zaten gelmez.
- **Şablon yanıtı model cevabı sanmak.** Atölyede sentez, bağlamdan bir cümle alıntılayan etiketli bir şablondur.
- **Getirme ve sadakat hatasını karıştırmak.** Doğru parça geldiyse sorun getirmede değildir.
- **Kaynak belgeye körü körüne güvenmek.** RAG, belgedeki yanlışı da getirir.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını bir kez daha oku ve "sık yapılan yanlış" satırlarını kendi cümlenle yeniden yaz.
2. İki cümleden kendi sayım vektörlerini çıkar ve kosinüs benzerliğini elle hesapla; sonucu atölyeyle karşılaştır.
3. Beş soruluk bir eval seti yaz: ikisi tek parçada cevaplanan, biri iki parçaya yayılan, biri belgede olmayan, biri belirsiz soru. Hattı her biri için dene ve getirme isabetini not et.
4. Kendi cümlenle şu soruyu cevapla: "Parça boyunu küçültmek neyi kazandırır, neyi kaybettirir?"
5. Bir okul yönetmeliği botu düşün: getirme hatası ve sadakat hatası için birer örnek yaz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Kendi RAG hattın)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Ayarlar | Hedefler tutmuyor ya da ayarlar gelişigüzel | Boy 15-60, örtüşme > 0, K 1-3; şablon yanıt "iki proje" içeriyor | Her ayarın nedenini örtüşme ve bağlam uzunluğu üzerinden açıklıyor |
| Sorular | Tek soruyla yetiniyor | Rehberden üç farklı soru sormuş | Net ve belirsiz soruyu karşılaştırıp farkı yorumluyor |
| Hata analizi | Zorlanan soruyu bulamıyor | Hangi soruda hattın zorlandığını söylüyor | Hatayı getirme ya da sentez adımına bağlıyor |
| Belgede olmayan soru | Denememiş | Denemiş ve sonucu anlatıyor | Gerçek bir modelin "bilmiyorum" demesi gerektiğini ve nedenini açıklıyor |
| Dürüstlük | Şablon yanıtı model cevabı sanıyor | Şablonun simülasyon olduğunu biliyor | Getirme isabeti ile sadakati ayırıp iki iyileştirme önerisi sunuyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir arama sisteminin ve RAG hattının içini açıp ne yaptığını görmektir. Atölyedeki vektör ve getirme hesapları gerçektir; ama bunlar basit kelime vektörleridir, gerçek gömme modelleri değildir.
- **Simülasyon.** Hattın son adımında model yoktur. Şablon, bağlamdaki en çok eşleşen cümleyi alıntılar ve arayüz bunu etiketler. Öğrenciye "yapay zekâ böyle cevapladı" demeyin.
- **Nasıl destek olunur?** Öğrenci takıldığında şunu sorun: "Soruyla parçada ortak hangi kelimeler var?", "Cevap hangi parçada, o parça getirildi mi?", "Sorun getirmede mi, sentezde mi?"
- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Kosinüs hesabı ilk başta zor gelebilir; küçük vektörlerle elle çalışmak yeterlidir.
- **Gizlilik.** Atölye tarayıcıda yerel çalışır; hesap, anahtar ya da dış servis gerekmez. Gerçek bir RAG sistemine okul belgeleri yüklenirse kişisel bilgilerin gizliliği ayrıca düşünülmelidir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
