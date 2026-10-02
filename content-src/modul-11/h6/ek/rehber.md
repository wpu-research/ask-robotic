### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Bir oyunun iskeletini (oyuncu, hedef, tehlike, kazanma, kaybetme) beş soruluk tasarım kartıyla anlatabilir.
2. Skor ve canı oyun başlarken ayarlayıp kazanma kuralını `≥` ile doğru yazabilir.
3. Değişkenlerle zamanla artan zorluk ve bayrakla (anahtar gibi) hafıza kurabilir.
4. `eğer … ise … değilse` ile iki yoldan birini seçebilir ve karo koordinatını piksele çevirebilir.
5. Dört adımlı dedektif yöntemiyle bozuk bir oyunun hatalarını bulup düzeltebilir; oyuna ses ve sarsıntı gibi cila ekleyebilir.
6. Kendi fikrinden, dört turda sekiz hedefin hepsini karşılayan tam bir oyun yapabilir.

### Haftanın planı
Hafta beş derstir. Plan günde bir ders içindir; final dersi daha uzun olduğu için ayrı bir gün ayırmak iyi olur.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Oyun iskeleti: oyuncu, hedef, skor, bitiş | ~25 dk | Tasarım kartını doldur, kedi ve elmalar oyununu kur, ≥ ile = farkını dene. |
| 2 | Tam oyun 1: Uzay savunması | ~30 dk | Vurma, can, süre ve zorluk kurallarını sırayla kur; artış miktarını değiştirip dengele. |
| 3 | Tam oyun 2: Labirent kaçışı | ~30 dk | Anahtar bayrağını ve iki kollu kapı kuralını yaz; hayaletin hızını ayarla. |
| 4 | Cila ve hata ayıklama: bozuk oyunu onar | ~25 dk | Dedektif yöntemiyle üç hatayı düzelt, sonra ses ve sarsıntı ekle. |
| 5 | Final: Kendi oyunun | ~40 dk | Kartı doldur, dört turda oyunu yap, hedefleri ✓ yap ve oyunu arkadaşına oynat. |

### Ön koşul kontrolü
Bu hafta önceki haftaların bloklarını kullanır. Başlamadan önce şunlar rahat olmalı:
- Sprite oluşturma, ok tuşlarıyla hareket ve çarpışma olayı (1. ve 2. hafta)
- Skor, can ve `skoru değiştir` bloğu
- Değişken oluşturmak ve `kadar değiştir` ile `yap` farkı
- Harita sekmesi, karo ve takip eden düşman (3. ve 4. hafta; labirent dersi için)
- Basit çarpma, bölme ve toplama (hız ve süre hesapları için)

### Kavram haritası
- **Tasarım:** tasarım kartı → oyuncu, hedef, tehlike → kazanma ve kaybetme kuralı
- **Kurallar:** olay + koşul → çarpışma olayı (bir kez) → her karede olayı (saniyede 60 kez)
- **Hafıza:** değişken → bayrak (0 ya da 1) → olaylar arası köprü
- **Karar:** `eğer … ise` → `değilse` kolu → `≥` ile `=` farkı
- **Zorluk ve zaman:** `her N ms'de bir` → geri sayım → `süre bitince` → denge
- **Kalite:** dedektif yöntemi → hata ayıklama → cila → hedefler paneli

### Sık yapılan hatalar
- **Kazanma kontrolünü olayın dışına koymak.** Skor değişir ama kural hiç sorulmaz.
- **`skor = 3` yazmak.** Skor atlıyorsa (2, 4, 6) hiç tetiklenmez; `≥` kullan.
- **`yap` yerine `kadar değiştir` ya da tersi.** Artış beklerken değer sabit kalır.
- **Bayrağı 1 yapmamak ya da başlangıçta 0 yapmamak.** Kapı hep kilitli kalır.
- **Karo bloğuna piksel yazmak.** Numaralar 0'dan başlar ve bir karo 16 pikseldir.
- **Karelik kuralda sprite'ı silmemek.** `her karede` olayı saniyede 60 kez çalışır ve üç can 50 ms'de gider.
- **Yanlış sprite türü seçmek.** Olay Yiyecek bekliyorsa Nesne türündeki sprite olayı tetiklemez.
- **Etkinlikteki ↺ Başa dön düğmesine basmak.** Bloklar silinir; oyunu denemek için sahnedeki ↺ kullanılır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını yeniden oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Uzay savunmasında artış miktarını 5 yerine 10 yap. 28. saniyedeki `hiz` değerini ve en yavaş uzaylının hızını hesapla, sonra oyunda dene.
4. Labirent kaçışına ikinci bir anahtar ve ikinci bir kapı ekle. Hangi bayrakları kullanacağını önce kâğıda yaz.
5. Arkadaşından kendi oyununu oynamasını iste; hiçbir şey söylemeden izle. İlk 10 saniyede nerede takıldı?

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Final oyunum)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Tasarım | Kart yok, oyunun amacı belirsiz | Beş sorunun hepsi cevaplanmış ve oyunla uyuşuyor | Kart oyunla birebir uyuyor, oyuncuya amaç ilk 10 saniyede anlaşılıyor |
| Kurallar | Skor ya da can çalışmıyor | Toplayınca skor artıyor, tehlikeye değince can azalıyor | Zaman, bayrak ya da seviye gibi ek bir kural eklenmiş |
| Bitiş | Oyun kazanılamıyor ya da hiç bitmiyor | Kazanma ve kaybetme çalışıyor | Her iki bitişte de anlamlı bir mesaj gösteriliyor |
| Cila ve denge | Ses ve efekt yok, oyun çok kolay ya da imkânsız | Ses ve en az bir efekt var, oyun oynanabilir | Sayılar denenip ayarlanmış ve değişiklikler açıklanmış |
| Anlatım | Ne yaptığını anlatamıyor | Oyunu ve kurallarını adım adım anlatıyor | Bir hata yapıp nasıl bulduğunu dedektif adımlarıyla anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta ezber değil, bir fikri baştan sona çalışan bir ürüne dönüştürme deneyimidir. Final oyunu öğrencinin kendi tasarımıdır; "daha iyisi" yerine "ne eklemek istersin?" diye sorun.
- **Nasıl destek olunur?** Takıldığında cevabı vermeyin. "Belirti ne?", "Hangi olay çalışıyor?", "Hangi bloğu şüphelendin?" sorularıyla dedektif yöntemini birlikte uygulayın.
- **Süre.** Final dersi 40 dakikadır; öğrenci yorulursa tur arasında ara verilebilir. Oyun, ↺ ile sınırsız denenebilir.
- **Güvenlik.** Her şey tarayıcıda çalışır; gerçek donanım yoktur. Oyun dosyası **Kaydet** ile bilgisayara indirilirse kişisel bilgi içermez, ancak adı verirken gerçek ad ve soyad kullanmamaya özen gösterin.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
