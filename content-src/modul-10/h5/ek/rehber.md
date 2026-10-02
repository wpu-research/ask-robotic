### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Radyo grubunun ne olduğunu açıklayabilir ve iki kartı aynı gruba alarak mesaj gönderip alabilir.
2. Sayı, yazı ve ad = değer mesajlarını ayırt edip doğru alma bloğunu seçebilir.
3. Değişkenlerle toplama ve çıkarma kullanarak basit bir şifre kurabilir ve anahtarın rolünü anlatabilir.
4. Bir komut tablosu hazırlayıp iç içe **eğer** zinciriyle gelen sayıyı simgeye ya da eyleme çevirebilir.
5. Kumanda ve araç rollerinde çalışan iki kartlı bir proje planlayıp kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-32 dakikadır. Plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Mesaj gönder, mesaj al | ~20 dk | Anlatımı oku, iki kartı aynı gruba al, A ve B ile sayı gönder, alan kartta simge göster. |
| 2 | Yazı, ad ve değer | ~20 dk | Yazı ve ad = değer mesajı gönder, alan kartta türü ad kontrolüyle ayır. |
| 3 | Gizli mesaj | ~22 dk | Anahtar değişkeniyle toplayıp gönder, alan kartta çıkararak çöz. |
| 4 | İki kartla sohbet | ~22 dk | Sayı tablosunu kur, iç içe eğer zinciriyle üç simgeyi ayır, ezgi ekle. |
| 5 | Proje: Uzaktan kumanda | ~32 dk | Komut tablosunu yaz, kumanda ve araç tarafını kur, ok ve servoyu dene. |

### Ön koşul kontrolü
- Düğme başlıklarını (A, B, A+B) kullanabiliyor mu? (Hafta 2)
- Değişken oluşturup değerini değiştirebiliyor mu? (Ders 7)
- **eğer ... ise ... değilse** bloğunu kurabiliyor mu? (Ders 8)
- Kartı yatırma olayını ve ezgi çalmayı tanıyor mu? (Ders 11 ve Ders 18)
- Editörde iki kart yan yana açabiliyor mu? (İlk derste gösterilir.)

### Kavram haritası
- **Radyo temeli:** grup (0-255) → gönderen blok → **radyo mesajı alınınca** → **alınan [sayı]**
- **Mesaj türleri:** sayı → yazı (en çok 32 karakter) → ad = değer (ad en çok 12 karakter)
- **Veri düzenleme:** şifreleme (anahtar, toplama ve çıkarma) → komut tablosu (protokol) → mesajı değişkene almak
- **Karar verme:** eğer → iç içe eğer zinciri → son değilse kolu
- **Proje:** kart yatışı → komut → radyo → ok ve servo

### Sık yapılan hatalar
- **İki kartı farklı gruba koymak.** Mesaj ulaşmaz ve hata mesajı çıkmaz.
- **Alma başlığını boş bırakmak.** Gönderen çalışsa bile alan kart hiçbir şey yapmaz.
- **Gönderenin kendi mesajını alacağını sanmak.** Mesaj yalnız gruptaki öteki karta gider.
- **Adı iki tarafta farklı yazmak.** "sicak" ile "sıcak" aynı değildir; ad 12 karakterden uzunsa kesilir.
- **Şifrede iki tarafta aynı işlemi kullanmak.** Gönderen toplarsa alan çıkarmalıdır.
- **Anahtarı ya da mesaj değişkenini doldurmamak.** Değişken 0 kalır, sonuç sessizce yanlış çıkar.
- **İkinci eğer'i değilse kolunun dışına koymak.** Zincirin sırası bozulur.
- **Tabloyu iki tarafta farklı kurmak.** Sayıların anlamı kaybolur.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Bakmadan iki kartlı en küçük programı kur: A ile kalp gönder, alan kart kalbi göstersin.
4. Gizli mesaj programında anahtarı 7'den 20'ye çevir; düz rakam 5 için radyoyla hangi sayı gider? (Cevap: 25.)
5. Kendi cümlelerinle şu soruyu cevapla: "Gönderen ve alan taraf neden aynı tabloyu kullanmalı?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Uzaktan kumanda)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Plan | Komut tablosu yok | Tabloda komut, ekran ve servo açısı var | Tablo kodla birebir uyuyor ve bilinmeyen komut için karar yazılmış |
| Kumanda tarafı | Bazı yönler mesaj göndermiyor | Dört yön ve A düğmesi doğru sayıyı yolluyor | Ek bir olay (örneğin yüzü yukarı) ya da eğim bilgisi de gönderiliyor |
| Araç tarafı | Gelen sayı okunmuyor ya da zincir bozuk | Her komutta doğru ok gösteriliyor ve servo dönüyor | Bip ya da ek bir tepki var, son kol aracı durduruyor |
| Hata ayıklama | Hatayı bulamıyor | Hatayı grup, tablo ya da boş başlık olarak bulup düzeltiyor | Hatayı nasıl bulduğunu ve önlemeyi anlatıyor |
| Anlatım | Ne yaptığını anlatamıyor | Sistemi kumanda, mesaj ve araç diye anlatıyor | Mesaj kaybolursa ne olacağını ve neye ihtiyaç olduğunu tartışıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta iki ayrı şeyin yalnız bir mesajla bağlanabileceğini görmek, gelen mesajı yorumlayan program kurmak ve ortak bir "anlaşma" (tablo) fikrini kavramaktır.
- **Nasıl destek olunur?** Cevabı söylemek yerine şunları sor: "İki kart aynı grupta mı?", "Alma başlığının içinde ne var?", "Hangi sayıyı gönderdin, tabloda o sayı ne demek?"
- **Sessiz hatalar.** Radyoda çoğu hata uyarı üretmez. Öğrenciye hatayı sistematik aratın: önce grup, sonra gönderen blok, sonra alma başlığı.
- **Şifreleme.** Burada kurulan şifre öğretici bir örnektir, gerçek güvenlik sağlamaz. Gerçek hayatta şifre ya da parola paylaşılmaz.
- **Güvenlik ve gizlilik.** Portal tamamen sanaldır; gerçek bir radyo, motor ya da kişisel veri kullanılmaz.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
