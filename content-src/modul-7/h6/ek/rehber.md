### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Araç kullanımını açıklayabilir: model çağrı ister, uygulama aracı çalıştırır, sonuç gözlem olarak döner.
2. Düşün-yap-gözle döngüsünü sıralayabilir ve `$1`, `$2`, `$son` ile adım sonuçlarını zincirleyebilir.
3. Adım sınırı, hata gözlemi ve durma koşullarını anlatabilir; `tekrar` ile yazılan bir hareketin toplamını duvarla karşılaştırabilir.
4. "Önce ölç, sonra hareket et", güvenlik payı, en az yetki ve insan onayı ilkelerini örneklerle açıklayabilir.
5. İki kez ölçüp iki kez ilerleyen bir mini ajan betiği yazabilir, adım numaralarını doğru kullanabilir ve betikli ajan ile gerçek model arasındaki farkı dürüstçe söyleyebilir.

### Haftanın planı
Hafta beş derstir; ders yaklaşık 30-40 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Araç kullanımı | ~30 dk | Anlatımı oku, `hesapla(12*7)` betiğini yaz, hata gözlemini ve zincirlemeyi dene, mini testi çöz. |
| 2 | Düşün, yap, gözle | ~30 dk | Betikli demoyu incele, iki `ara` ve bir `hesapla` ile grup sayısını bul. |
| 3 | Hata, sınır ve durma | ~30 dk | Robotu duvara çarpmadan ilerlet, `tekrar 6` ile çarpmayı ve adım sınırını gözle. |
| 4 | Önce ölç, sonra hareket et | ~30 dk | `mesafe()` ile ölç, güvenlik payı bırak, payı değiştirip etkisini karşılaştır. |
| 5 | Proje: Mini ajan | ~40 dk | Planı kâğıda yaz, betiği kur, raporu doldur, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta öğrenci şunları bilmeli:
- Dil modelinin sözcük tahmin ederek çalıştığını (Hafta 1) ve modelin kendi başına kesin bilgi garantisi vermediğini.
- Bilgi getirme fikrini (Hafta 5): model bilgiyi dışarıdan alabilir.
- Dört işlem, yüzde hesabı ve çıkarma. Bu hafta kodlama bilgisi gerekmez; betik yazımı basit satırlardan oluşur.
- Yapay Zekâ Atölyesi'nin açılıp kullanıldığını (tarayıcıda çalışır, hesap ya da anahtar gerekmez).

### Kavram haritası
- **Araçlar:** araç listesi -> çağrı `arac(girdi)` -> gözlem -> `$n` ile taşıma -> hata gözlemi
- **Ajan:** hedef -> düşün-yap-gözle döngüsü -> bitti mi? -> `bitir(...)`
- **Sınırlar:** adım sınırı (30) -> hata ile durma -> geri alınamaz eylem (çarpma)
- **Güvenlik:** önce ölç -> güvenlik payı -> en az yetki -> insan onayı
- **Dürüstlük:** atölyede "model adımı" = senin betiğin (simülasyon); araçlar gerçek hesaplanır -> gerçek ajan ölçülür (eval)

### Sık yapılan hatalar
- **Var olmayan `$n` kullanmak.** Tek adım atılmışken `$2` yazmak boş metin verir.
- **Hata gözlemini kontrol etmemek.** Başarısız adımın hata metni `$n` ile sonraki adıma taşınır ve hesap makinesine sayı yerine yazı gider.
- **`tekrar` toplamını hesaplamamak.** `tekrar 6: ileri(20)` beşinci çağrıda duvara çarpar.
- **Güvenlik payını yanlış yöne uygulamak.** `hesapla($1+20)` yerine `hesapla($1-20)` olmalıdır.
- **`$1` ile `$4`'ü karıştırmak.** İkinci hesap ikinci ölçüme dayanmalıdır.
- **Atölyedeki "model adımı"nı gerçek model sanmak.** Kararı betik olarak sen veriyorsun; model cevabı bir simülasyondur.
- **Adım sınırına güvenmek.** Sınır sonsuz döngüyü keser, planın doğruluğunu garanti etmez.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Proje betiğini bakmadan sıfırdan yaz; sonra ikinci hareketi kalanın yüzde 40'ı yap ve robotun nerede duracağını önce hesapla, sonra atölyede doğrula.
4. Kendi cümlelerinle cevapla: "Atölyedeki ajan ile gerçek bir model kullanan ajan arasındaki fark nedir?"
5. Bir ajana e-posta gönderme yetkisi verilseydi hangi güvenlik adımlarını koyardın? Üç madde yaz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Mini ajan)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Ölçüm ve hesap | Ölçüm yok ya da hesap kafadan yapılmış | `mesafe()` iki kez çağrılmış, `hesapla` ile yarı ve yüzde 60 bulunmuş | Adım numaraları kâğıtta planlanmış, hesaplar önceden kestirilmiş |
| Güvenlik | Robot duvara çarpıyor | Çarpma yok, robot duvara 5-20 cm kala duruyor | Güvenlik payının neden seçildiğini açıklıyor |
| Betik | `$n` numaraları yanlış ya da hatalı adımlar var | Betik hatasız çalışıyor, `dur()` ve `bitir()` çağrılmış | Hata senaryosunu (ör. yanlış `$n`) kasıtlı deneyip düzeltmiş |
| Rapor | Gözlemler ve açıklama eksik | Betik, gözlemler ve "neden iki kez ölçtün" cevabı var | Gerçek robot için ek güvenlik önlemlerini (hareket sırasında ölçüm, acil durdurma, onay) gerekçelendirmiş |
| Dürüstlük | Betiği "yapay zekâ karar verdi" diye anlatıyor | "Model adımı benim betiğim" diyor | Betikli ajan ile model kullanan ajan arasındaki güvenilirlik farkını ve değerlendirme (eval) ihtiyacını açıklıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir yapay zekâ ürününü kullanmak değil, ajanların nasıl çalıştığını ve neden sınırlara, ölçmeye ve onaya ihtiyaç duyduğunu anlamaktır.
- **Her şey sanaldır.** Atölyedeki araçlar (hesap makinesi, küçük bilgi tabanı, sanal robot) tarayıcıda yerel çalışır; dış servis, hesap ya da anahtar yoktur. "Model adımı" bir model değildir: öğrencinin yazdığı betiktir. Gerçek bir ajanda kararı bir dil modeli verir ve her seferinde aynı sonuca ulaşmayabilir. Derslerde bu fark bilinçli olarak vurgulanır.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şunu sor: "Hangi adımın sonucunu hangi `$n` ile alıyorsun?", "Gözlem sütununda ne yazıyor?", "Toplam hareket duvarı aşıyor mu?"
- **Konuşma önerisi.** Bir yazılıma "dosya silme" ya da "e-posta gönderme" yetkisi vermenin riskini birlikte konuşun; insan onayı hangi adımlarda gerekli olmalı?
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
