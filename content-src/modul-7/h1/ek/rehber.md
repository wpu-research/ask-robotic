### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Yapay zekâ, makine öğrenmesi ve dil modeli kavramlarını ayırt edebilir; bir dil modelinin temel işinin sonraki parçayı tahmin etmek olduğunu söyleyebilir.
2. Bir metnin token'lara bölünüp sayılara çevrildiğini açıklar; token ile kelimenin neden aynı olmadığını örnekle gösterir.
3. BPE'nin "en sık çifti birleştir" kuralını bir kelime listesinde elle uygulayabilir.
4. Bir derlemden sayarak bağlama göre sonraki kelime olasılığını hesaplar (sayı / toplam) ve ikili ile üçlü modeli karşılaştırır.
5. Mini dil modelinin çıktısını derlemle karşılaştırıp garipliğin kaynağını (kopya, yeniden birleştirme, bağlam sınırı) bulur.
6. Portaldaki "gerçek hesap" ile "simülasyon" etiketli adımı birbirinden ayırır.

### Haftanın planı
Hafta beş derstir; ders süreleri 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir. İlk dersin etkinlik aracı yoktur, yalnız okuma ve tartışma vardır.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Yapay zekâ, makine öğrenmesi, dil modeli | ~20 dk | Anlatımı oku, üç kavramı kendi cümlelerinle yaz, mini testi çöz, "anlıyor mu, tahmin mi ediyor?" sorusunu tartış. |
| 2 | Token: model yazıyı nasıl görür? | ~20 dk | Aracı aç, birleştirme sayısını kaydır, Türkçe ve İngilizce derlemi karşılaştır, mini testi çöz. |
| 3 | BPE: parçalar nasıl öğrenilir? | ~25 dk | Birleştirme sırasını izle, "kalemlik" gibi görülmemiş kelime dene, çift sayma alıştırmasını elle yap. |
| 4 | Sonraki kelimeyi tahmin et | ~25 dk | Bağlamı değiştir, ikili ve üçlü modeli karşılaştır, olasılığı elle hesapla, farklı tohumlarla kelime üret. |
| 5 | Proje: Mini dil modeli | ~35 dk | Üç tohumla üç cümle üret, her birini derlemle karşılaştırıp kaynağını yaz. |

### Ön koşul kontrolü
Bu hafta özel bir ön bilgi gerekmez. Başlamadan önce şunları kontrol et:
- Oran ve yüzde hesabı (2/10 = %20) rahat yapılıyor mu?
- Kısa kod parçalarını (döngü, dizi, if) okuyabiliyor mu? Yazması gerekmez, yalnız okuması yeter.
- Tarayıcıda Yapay Zekâ Atölyesi açılıyor mu?

### Kavram haritası
- **Çerçeve:** yapay zekâ → makine öğrenmesi → dil modeli → sonraki parçayı tahmin etmek
- **Metin görünümü:** token → token kimliği (sayı) → birleştirme sayısı → derlem ve dil
- **Parça öğrenme:** BPE → en sık çift → birleştirme listesi ve sırası → görülmemiş kelime
- **Tahmin:** sayım → olasılık = sayı / toplam → ikili ve üçlü model → geri çekilme → tohum
- **Çözümleme:** kopya, yeniden birleştirme, bağlam sınırı → bağlamın bedeli (veri)
- **Dürüstlük:** gerçek hesap ile simülasyon etiketli adım

### Sık yapılan hatalar
- **Token ile kelimeyi karıştırmak.** Token çoğu zaman kelimeden küçüktür; sıfır birleştirmede kelime başı işareti de bir token sayılır.
- **Token sayısını kelime sayarak bulmak.** Gerçek sayı ancak parçalayıcı çalıştırılarak bulunur.
- **BPE'de çift sayımını yalnız kelime sayısıyla yapmak.** Kelimenin kaç kez geçtiği ve içinde kaç çift olduğu birlikte hesaba girer.
- **Birleştirmeden sonra ikinci parçayı atlamamak.** Kodda `i++` unutulursa aynı harf iki kez yazılır.
- **Olasılığın paydasını yanlış almak.** Payda tüm adayların toplamıdır, yalnız kelimenin kendi sayısı değil.
- **Üçlü modelin her zaman daha iyi olduğunu sanmak.** Bağlam derlemde yoksa model geri çekilir.
- **Modelin "anladığını" varsaymak.** Mini model yalnız saydığı örüntüyü tekrarlar.
- **"Simülasyon" etiketli çıktıyı gerçek bir model cevabı sanmak.**

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. "robot ileri" metnini 0 birleştirmede elle token'lara böl, sonra araçta sonucu kontrol et.
4. Küçük bir kelime listesi uydur ve içinde en sık geçen harf çiftini bul; ilk birleştirmeyi yaz.
5. Kendi cümlelerinle şu soruyu cevapla: "Dil modeli neden 'anlıyor' demek yerine 'tahmin ediyor' deniyor?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Mini dil modeli)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Üretim | Araç ayarları eksik, cümle sonu yok | İki kelimelik bağlamla en az 8 kelime ve üç farklı tohumla üç cümle | Tohumları, ayarı ve sonucu başkası yeniden üretecek biçimde yazmış |
| Çözümleme | Cümlelere "saçma" ya da "iyi" demekle yetinmiş | Her cümle için garipliğin ya da doğruluğun kaynağını (kopya, birleştirme, bağlam sınırı) yazmış | Şüpheli çiftleri derlemde arayıp kanıtla göstermiş |
| Kavram | Terimleri karıştırıyor | Bağlam, olasılık ve geri çekilmeyi kendi cümlesiyle anlatıyor | Bağlamı uzatmanın getirisini ve bedelini örnekle açıklıyor |
| Dürüstlük | Modeli "anlıyor" diye tanıtmış | Modelin bir tahmin tablosu olduğunu söylüyor | Mini model ile büyük model arasındaki benzerliği ve farkı sınırlarını bilerek anlatıyor |
| Anlatım | Ne yaptığını anlatamıyor | Adımları sırayla anlatıyor | Yanlış bir tahminini nasıl düzelttiğini anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta amaç, yapay zekâyı bir "sihir" olmaktan çıkarıp sayılabilir parçalara ayırmaktır. Öğrenci, bir dil modelinin sonraki parçayı olasılıkla seçtiğini kendi aracında görür.
- **Dürüstlük.** Portaldaki araçlar tarayıcıda çalışır ve hesapları gerçektir. Gerçek bir sohbet modeli çalıştırılmaz, hesap ya da anahtar gerekmez. Büyük bir modelin yerini tutan adımlar "simülasyon" diye etiketlidir; öğrencinin bu ayrımı fark etmesi haftanın kazanımlarındandır.
- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: "Bu sayıyı nereden buldun?", "Derlemde bu çift gerçekten var mı?", "Aynı tohumla tekrar denesen ne olur?"
- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Her ders arasında kısa bir tekrar yeterlidir.
- **Güvenlik ve gizlilik.** Bu hafta kişisel bilgi girmeye gerek yoktur. İleride gerçek yapay zekâ servisleri kullanılırsa ad, adres ve telefon gibi bilgiler yazılmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
