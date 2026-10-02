### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Haritayı 16 x 16 pikselik karoların ızgarası olarak anlatabilir; sütun ve satırı 0'dan sayarak bir karoyu gösterebilir.
2. Karonun "duvar" kutusunun sprite'ı durdurduğunu bilir ve bir odayı ya da labirenti duvarlarla kurabilir.
3. `bir [Oyuncu] sprite'ı [Karo] karosuna dokununca` olayını kurar; olayın ilk değmede bir kez çalıştığını bilir.
4. Olay karosunun sütun ve satırıyla dokunulan karoyu boşaltır; sayaçla kazanma koşulunu doğru sırayla kurar.
5. Kamerayla büyük bir dünyada gezer; karoları sprite'a çevirir; anahtar, elmas, lav ve sandıklı Hazine adası oyununu kurar.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 22-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | İlk odan: duvarlı bir harita | ~22 dk | Anlatımı oku, odayı taş duvarla çevir, kediyi yürüt, mini testi çöz. |
| 2 | Labirentten çık | ~22 dk | Kapı karosuna dokununca kazanma olayını kur, labirenti değiştirip kendin dene. |
| 3 | Mağarada elmas avı | ~25 dk | Olay karosuyla elması boşalt, sayaçla kazan, lavı kur. |
| 4 | Büyük bir dünya, kayan kamera | ~25 dk | Kamerayı bağla, elma karolarını sprite'a çevir, kameranın sınırlarını deney. |
| 5 | Proje: Hazine adası | ~35 dk | Kural tablosunu yaz, dört olayı kur, haritayı kendi fikrinle değiştir. |

### Ön koşul kontrolü
Hafta 1 ve Hafta 2 (Modül 11) tamamlanmış olmalı. Başlamadan önce şunları kontrol et:
- `oyun başlayınca` bloğu, sprite oluşturma ve `oyuncu tuşlarıyla hareket etsin` bloğunu kullanabiliyor mu?
- Sprite'lar arası çarpışma olayını, skor ve can bloklarını hatırlıyor mu?
- Çarpma, bölme ve çıkarma ile küçük hesaplar (7 x 16, 480 - 160) yapabiliyor mu?

### Kavram haritası
- **Harita:** karo (16 x 16) → ızgara (sütun, satır; 0'dan) → karo takımı → duvar kutusu
- **Olay:** karoya dokununca → ilk değmede bir kez → olay karosunun sütunu ve satırı → karoyu boşalt
- **Kural:** sayaç (karo sayısı) → kazanma koşulu → lav (can ve başa dönüş) → oyunu bitir
- **Dünya:** harita (büyük) ve ekran (160 x 120) → kamera takibi → karoyu sprite'a çevirme
- **Proje:** kural tablosu → anahtar-kapı → skorlu mesaj → kendi harita tasarımı

### Sık yapılan hatalar
- **Sütun ve satırı 1'den saymak.** İlk sütun ve ilk satır 0'dır.
- **Sütun ile satırı karıştırmak.** `sütun 10 satır 5` ile `sütun 5 satır 10` farklıdır; ikincisi 10 satırlı haritanın dışındadır.
- **Duvar kutusunu işaretlememek.** Karo duvar gibi görünür ama sprite içinden geçer.
- **`haritayı yükle` bloğunu `oyun başlayınca` dışında bırakmak.** Harita hiç gelmez.
- **Karoyu boşaltan bloğa sabit sayı yazmak.** Hep aynı karo silinir; olay karosunu kullan.
- **Kazanma kontrolünü karo silinmeden önce yapmak.** Sayaç bir fazla görünür.
- **`oyunu bitir` bloğunu unutmak.** Mesaj çıkar ama oyun sürer.
- **Karoları sprite'a çevirmeyi ya da kamerayı unutmak.** Elma toplanmaz; kedi ekrandan çıkar.
- **Olayın beklemekle tekrar çalışacağını sanmak.** Karo olayı ilk değmede yalnız bir kez çalışır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Boş bir haritada 12 x 8 bir oda çiz; çıkışı olan bir labirente çevir; kapı karosuna dokununca kazanılsın.
4. Kendi haritanın genişliğini ve yüksekliğini piksel olarak hesapla; ekrana sığıp sığmadığını söyle.
5. Kendi cümlelerinle şu soruyu cevapla: "Kamera olmasa büyük bir harita ne olurdu?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Hazine adası)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Plan | Kural tablosu yok | Dört karo için ne olacağı tabloda yazılı | Tablo, bloklarla birebir uyuyor ve açıklanmış |
| Anahtar ve kapı | Anahtar kayboluyor ama kapı açılmıyor | Anahtar alınınca kapı (sütun 10, satır 5) açılıyor | Kapı yerine başka bir engel ya da ikinci bir anahtar-kapı eklenmiş |
| Elmas, lav, sandık | Bir ya da daha fazla kural çalışmıyor | Elmas skor veriyor, lav can götürüp başa gönderiyor, sandık oyunu kazandırıyor | Mesajda skor yazıyor; lav ve elmas değerleri düşünerek ayarlanmış |
| Harita | Haritayı değiştirmemiş ya da yol kapanmış | Haritayı değiştirmiş ve sandığa yol açık | Yeni karo türü ve yeni kuralla genişletmiş |
| Anlatım | Ne yaptığını anlatamıyor | Dört olayı adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta çocuk bir oyunun kurallarını haritanın karolarına bağlamayı öğrenir. "Hangi karoya dokununca ne olsun?" sorusu, bir oyun tasarımcısının temel sorusudur.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: "Hangi karoya dokununca olay çalışmalı?", "Bu karo duvar mı değil mi?", "Sütun mu önce, satır mı?", "Kazanma kontrolü karo silindikten önce mi sonra mı?"
- **Hata yapmak güvenlidir.** Her şey sanaldır; ↺ düğmesi oyunu başa alır.
- **Süre.** Dersleri aralıklı çalışmak kalıcılığı artırır. Proje dersinde çocuğa kendi haritasını çizmesi için ek zaman tanı.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
