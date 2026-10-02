### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Sahne, sprite, tür ve değişkenin ne olduğunu söyleyebilir; x ve y koordinatlarıyla bir sprite'ı sahnede istediği yere koyabilir.
2. Bir sprite'ı ok tuşlarıyla yürütebilir, hızı seçebilir ve sprite'ı ekranda tutabilir.
3. Düğme olaylarıyla (A, B, yön tuşları) sprite'ın resmini, yönünü ve konuşmasını değiştirebilir.
4. Bir sprite'a hız verip kenarlardan sektirebilir; derece ile yön verebilir.
5. Küçük bir oyunu hedef listesine bölerek kurabilir, ses ve patlama gibi geri bildirimler ekleyebilir.

### Haftanın planı
Hafta beş derstir. Aşağıdaki plan günde bir ders içindir. Her etkinlik Oyun Atölyesi'nde, sanal sahnede yapılır; kamera, kit ya da kâğıt gerekmez.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Sahneni kur: renk, kedi ve elma | ~20 dk | Anlatımı oku, kediyi ve elmayı sahneye koy, x ve y değerlerini değiştirip sonucu gör, mini testi çöz. |
| 2 | Kediyi ok tuşlarıyla yürüt | ~20 dk | Tuşla hareket bloğunu kur, hızı dene, ekranda kalsın ayarını ekle. |
| 3 | A düğmesine basınca değiş ve konuş | ~20 dk | Düğme olaylarını yaz; resim, yön ve konuşma bloklarını dene. |
| 4 | Sekip duran top | ~20 dk | Hız ver, sekmeyi aç, çimen döşe, dereceyle yön ver. |
| 5 | Proje: Gezgin kedi | ~30 dk | Yedi hedefi tek tek yap, A ve B yeteneklerini ekle, kendi dokunuşunu kat. |

### Ön koşul kontrolü
Bu hafta özel bir bilgi gerekmez. Başlamadan önce şunları kontrol et:
- Tarayıcıda Oyun Atölyesi açılıyor mu ve sahnenin altındaki başlat, durdur, baştan başlat düğmeleri çalışıyor mu?
- Öğrenci fareyle blok sürükleyip birbirine takabiliyor mu?
- Sayıları karşılaştırabiliyor mu? (Hangisi büyük, hangisi küçük? Eksi sayı nedir?)
- Çarpma ve toplama (hız x süre) yapabiliyor mu? Ders 2 ve 4 bunu kullanır.

### Kavram haritası
- **Sahne:** sahne (160 x 120) → sprite → konum (x, y) → tür → değişken
- **Girdi:** denetleyici → tuşla hareket → hareket biçimi → ekranda kalsın → olay (basılınca, bırakılınca)
- **Hareket:** hız (x hızı, y hızı) → eksi ve artı → sekme → yön (derece) → döşenmiş arka plan
- **Sprite eylemleri:** resim değiştirme → yön (sağa/sola baksın) → konuşma balonu
- **Proje:** hedef listesi → çalıştır, dene, düzelt → geri bildirim (patlama, sarsıntı, ses)

### Sık yapılan hatalar
- **Blokları `oyun başlayınca` bloğuna bağlamamak.** Bağlı olmayan blok hiç çalışmaz.
- **Değişiklikten sonra baştan başlatmamak.** Sahne eski hâliyle çalışır; ↺ düğmesine bas.
- **y'nin yukarı doğru arttığını sanmak.** y aşağı doğru artar; yukarı çıkmak için y'yi küçült.
- **`bu sprite` kullanmak.** En son oluşturulan sprite etkilenir; her sprite için ayrı değişken adı ver.
- **İki sprite için aynı değişken adı vermek.** İlk sprite'a bir daha ulaşılamaz.
- **Ekranda kalsın ayarını unutmak.** Sprite ekrandan çıkıp görünmez olur.
- **Hareket biçimini yanlış seçmek.** Sağa-sola seçiliyken yukarı tuşu işe yaramaz; bu hata değildir.
- **Derecede yukarı için 90 yazmak.** Yukarı 0, sağ 90, aşağı 180, sol 270'tir.
- **Sekme ayarını açmamak.** Top kenardan çıkar, bir daha görünmez.
- **Peş peşe nota koyup sıralı çalacağını sanmak.** Ses blokları birbirini beklemez; hepsi aynı anda çalar.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Sahneyi baştan, bakmadan kur: mavi fon, kedi sol alta, elma sağ üste. x ve y değerlerini önce kâğıda yaz, sonra dene.
4. Kediyi önce hız 40, sonra hız 120 ile yürüt. 2 saniyede kaç piksel gittiğini hesapla ve gözle karşılaştır.
5. Kendi cümlelerinle şu soruyu cevapla: "Tuşla hareket ile düğme olayı arasındaki fark nedir?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Gezgin kedi)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Sahne ve hareket | Kedi yürümüyor ya da ekrandan çıkıyor | Kedi yürüyor, ekranda kalıyor, yıldız sekiyor, zemin döşeli | Hızlar oyuna uygun seçilmiş ve nedeni anlatılabiliyor |
| Olaylar | A ve B olaylarından biri çalışmıyor | A'da konuşma ve melodi, B'de patlama ve ses çalışıyor | Olaylara kendi fikirlerinden en az iki yetenek eklenmiş |
| Hedefler | Yeşil olan hedef sayısı yarıdan az | Yedi hedefin hepsi yeşil | Hedefler bozulmadan ek yetenekler konmuş |
| Düzen | Bloklar dağınık, değişken adları karışık | Her sprite'ın kendi değişkeni var, bloklar düzenli | Bloklar gruplanmış, ne yaptığı anlatılabiliyor |
| Anlatım | Ne yaptığını anlatamıyor | Oyunun nasıl çalıştığını adım adım anlatıyor | Bir hatayı nasıl bulup düzelttiğini anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta çocuğun "bilgisayara söz geçirebildiğini" görmesi hedeflenir. İlk oyun küçük ama çalışan bir oyundur. Bloklarla programlama, yazım hatası korkusu olmadan mantığı öğretir.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şu soruları sor: "Bu blok hangi olayın altında?", "Önce hangi blok çalışıyor?", "Sahneyi baştan başlattın mı?"
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Etkinlik biter bitmez çocuğun oyunu size göstermesini isteyin; anlatmak en iyi tekrardır.
- **Merak ve yaratıcılık.** "Dene" bölümlerindeki serbest denemeler zorunlu değildir ama en çok öğrenmenin yaşandığı yerlerdir. Sprite'ın resmini ve zeminini değiştirmek çocuğa oyunun kendisine ait olduğunu hissettirir.
- **Güvenlik.** Bu platformdaki her şey sanaldır; kişisel bilgi girilmez. Oyunları paylaşırken isim ve fotoğraf kullanmayın.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
