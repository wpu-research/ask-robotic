### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Eval'ın ne olduğunu, test vakasının girdi ve beklenen çıktıdan oluştuğunu söyleyebilir ve doğruluğu (doğru / toplam) hesaplayabilir.
2. Olumlu, olumsuz ve belirsiz etiketlerinden dengeli, tekrarsız ve net bir test seti yazabilir.
3. Bir etiket için geri çağırmayı hesaplayabilir; tek doğruluk sayısının dengesiz veride neden yanıltıcı olduğunu açıklayabilir.
4. Eşik değerlerinin iki yanını (kenar durumları) ve çift vakaları kullanarak bir kuraldaki eksiği bulabilir; veri sızıntısını açıklayabilir.
5. Kendi eval setini kurup sonuçları, hataları ve güven sınırını içeren kısa bir rapor yazabilir.

Not: Haftadaki sistem gerçek bir dil modeli değil, kural tabanlı küçük bir programdır (etkinlik bunu açıkça söyler). Yöntem gerçektir; sistemin kendisi basitleştirilmiştir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 25-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Neden ölçmeliyiz? | ~25 dk | Anlatımı oku, Eval tablosunda en az beş vaka yaz, sistemin yanıldığı bir vaka bul, mini testi çöz. |
| 2 | İyi test vakası yazmak | ~25 dk | Sekiz vakalık dengeli bir set kur, üç etiketi de kullan, tekrarı ayıkla, bir arkadaşınla etiketleri karşılaştır. |
| 3 | Doğruluk yetmez: hangi etiket kaçıyor? | ~30 dk | Etiket çubuklarını oku, geri çağırmayı elle hesapla, hataları grupla. |
| 4 | Kenar durumlar ve sınırlar | ~30 dk | Robot engel kuralının eşiklerini (19-20, 49-50) sına, hız eksikliğini çift vakalarla bul. |
| 5 | Proje: Kendi eval setin | ~35 dk | On vakalık seti kur, ölç, hataları grupla ve dört bölümlük raporu yaz. |

### Ön koşul kontrolü
Özel bir önceki bilgi gerekmez. Başlamadan önce kontrol et:
- Yüzde hesabı (6 / 8 = %75) rahat yapılıyor mu?
- Prompt, çıktı ve "model her seferinde aynı cevabı vermeyebilir" fikri tanıdık mı? (1-15. dersler)
- Yapay Zekâ Atölyesi tarayıcıda açılıyor mu? Dış hesap ya da anahtar gerekmez.

### Kavram haritası
- **Temel:** eval → test vakası (girdi + beklenen çıktı) → doğruluk
- **Set tasarımı:** üç etiket → kolay ve zor vakalar → tekrarsızlık → etiket doğrulama
- **Ölçü:** geri çağırma → dengesiz veri → hata gruplama → hata maliyeti
- **Sınırlar:** eşik → kenar durum → çift vaka → veri sızıntısı (ayar seti / ölçüm seti)
- **Proje:** vaka yaz → ölç → grupla → iyileştir → yeniden ölç → rapor

### Sık yapılan hatalar
- **Doğruluğu tersine hesaplamak.** Yanlış / toplam hata oranıdır; doğruluk doğru / toplam.
- **Yalnız kolay vaka yazmak.** Doğruluk yüksek çıkar, zayıf noktalar görünmez.
- **"Belirsiz" etiketini atlamak.** Duygu taşımayan metinlerdeki hatalar yakalanmaz.
- **Aynı vakayı birden çok kez saymak.** Önemli olan benzersiz vaka sayısıdır.
- **Beklenen etiketi yanlış yazmak.** Doğru çalışan sistem "yanılmış" görünür.
- **Geri çağırmayı tüm vakalara bölmek.** Payda yalnız o etiketin vakalarıdır.
- **Yalnız ortadaki değerleri denemek.** Hatalar eşiğin hemen yanında (19-20, 49-50) saklanır.
- **Ayar seti ile ölçüm setini aynı tutmak.** Sonuç gerçekte olduğundan iyi çıkar.
- **Küçük bir setin sonucunu kesin sanmak.** 10 vakada tek vaka 10 puan oynatır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını yeniden oku ve "sık yapılan yanlış" satırlarını kendi cümlelerinle anlat.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını oku, sonra soruyu yeniden çöz.
3. Elle bir örnek hesapla: 20 vakalık bir sette 15 olumlu, 5 olumsuz vaka var; sistem 14 olumluyu ve 3 olumsuzu doğru buluyor. Toplam doğruluğu ve her etiket için geri çağırmayı bul. (Cevap: %85; olumlu 14/15, olumsuz 3/5.)
4. Robot kuralı için 0-60 arası hangi mesafelerin "dur", "yavaşla", "devam" verdiğini yaz ve bir sayı doğrulat.
5. Kendi cümlelerinle şu soruyu cevapla: "Bir sistemin %90 doğruluğu neden her zaman iyi haber değildir?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Kendi eval setin)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Set boyutu ve denge | On vakadan az ya da tek etiket ağır basıyor | En az 10 vaka; olumludan ve olumsuzdan en az 3'er, belirsizden en az 1 | Kolay ve zor vakalar bilinçli dengelenmiş, etiketler arkadaşla karşılaştırılmış |
| Vaka kalitesi | Tekrarlar var ya da etiketler tartışmalı | Tekrar yok, etiketler net | Her zor vakanın neden zor olduğu açıklanmış |
| Hata analizi | Yanlış vakalar listelenmemiş | Yanlış vakalar ve nedenleri yazılmış | Hatalar nedenlerine göre gruplanmış |
| Rapor | Yalnız tek bir doğruluk sayısı var | Doğruluk, etiket başına sonuçlar, hatalar ve bir iyileştirme fikri var | Güven sınırı (set boyutu, veri sızıntısı) açıkça yazılmış |
| Dürüstlük | Sistem için "mükemmel" gibi kesin iddialar | Sonuç "bu vakalarda" diye sınırlanmış | Sistemin gerçek bir model olmadığı ve sonucun neyi kanıtlamadığı belirtilmiş |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir yapay zekâ ürünü yapmak değil, bir sistemin ne kadar iyi çalıştığını nasıl ölçeceğini öğrenmektir. Ölçmek, yapay zekâyla çalışan mühendislerin en temel alışkanlığıdır.
- **Dürüstlük.** Atölyedeki sınıflandırıcı kural tabanlı küçük bir programdır; gerçek bir dil modeli değildir. Bu fark çocukla açıkça konuşulmalıdır. Öğrenilen yöntem gerçektir.
- **Nasıl destek olunur?** Cevabı söylemek yerine sor: "Bu cümleye iki kişi aynı etiketi koyar mıydı?", "Sistem neden böyle dedi?", "Bu sayıya kaç vakayla ulaştın?"
- **Etiketlemek öznel olabilir.** Çocuk ile bir cümlenin etiketi hakkında anlaşamıyorsanız bu bir hata değil, güzel bir tartışmadır.
- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır. Proje dersinde raporu yazmaya yeterli zaman bırak.
- **Gizlilik.** Atölye tarayıcıda yerel çalışır; vakalara kişisel bilgi (gerçek ad, telefon) yazmamasını hatırlat.
- **İlerleme.** Mini test sonuçları beceri bazında "İlerlemem" sayfasında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
