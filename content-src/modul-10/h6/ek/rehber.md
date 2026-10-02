### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. 10 saniyelik ölçüm ve çarpma ile dakikadaki atışı hesaplayabilir; bir bayrak değişkeni ile sayma zamanını yönetebilir.
2. **kart sallandığında** başlığıyla olay sayabilir; eşitlik ile büyük-eşit koşulunun farkını ve kalan (mod) işlemini açıklayabilir.
3. Alarm gibi bir cihazı durumlar ve geçişler olarak tarif edip değişkenlerle kurabilir.
4. Sensör değerini (0-1023) **eşle** ile yüzdeye çevirebilir; eşik, çubuk grafik ve konsol kullanabilir.
5. İki kartı radyoyla konuşturan bir projeyi önce plan olarak yazıp sonra kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 25-40 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Nabız ölçer | ~28 dk | Anlatımı oku, B ile 10 saniyelik ölçümü başlat, 12 kez A'ya bas, 72'yi gör, mini testi çöz. |
| 2 | Adımsayar | ~25 dk | Kartı sal, A ile adımı oku, 10. adımda kutlamayı gör, "= ya da >=" farkını dene. |
| 3 | Alarm | ~28 dk | Üç durumu kur, kurulu ve alarm değişkenlerini izle, A+B uzun basışla kapat. |
| 4 | Nem ve sıcaklık istasyonu | ~30 dk | P1 kaydırıcısıyla nemi yüzdeye çevir, çubuk grafiği ve konsolu dene, eşiği değiştir. |
| 5 | Proje: Akıllı saksı (final) | ~40 dk | Planı çiz, iki kartı kur, radyoyla nemi karşılıklı izlet, kendini değerlendir. |

### Ön koşul kontrolü
Bu hafta önceki haftaların parçalarını birleştirir. Başlamadan önce kontrol et:
- Değişken oluşturup değer yapabiliyor ve değerine ekleyebiliyor mu? (7. ders)
- **eğer ... ise** ve karşılaştırma bloklarını kullanabiliyor mu? (8. ders)
- Düğme başlıklarını ve uzun basışı biliyor mu? (6. ve 9. dersler)
- **kart sallandığında** başlığını ve **çubuk grafik** bloğunu biliyor mu? (11. ve 12. dersler)
- **ezgiyi çal** bloğunu ve radyo gönder/al bloklarını biliyor mu? (18., 21. ve 22. dersler)
- Yüzde ve oran fikrine alışık mı? (50 / 100 gibi)

### Kavram haritası
- **Sayma ve ölçüm:** bayrak değişkeni → bekle bloğu → sayac x 6
- **Olay ve koşul:** kart sallandığında → adim = 10 / adim >= 10 → kalan işlemi
- **Durum:** kapalı → kurulu → çalıyor → kapat; kurulu ve alarm değişkenleri
- **Sensör:** analog oku (0-1023) → eşle (0-100) → eşik → çubuk grafik ve konsol
- **Proje:** plan → her 2000 ms'de gönder → mesaj gelince alınan değerle tepki ver

### Sık yapılan hatalar
- **Bayrağı yanlış yerde açmak.** olcum değerini bekle bloğundan sonra 1 yaparsan bekleme boyunca hiç sayılmaz.
- **Sayacı sıfırlamamak.** İkinci ölçüm ilkinin üstüne eklenir (126 gibi).
- **Çarpanı unutmak ya da yanlış seçmek.** süre x çarpan = 60 olmalı.
- **Sayma bloğunu eğer'in içine koymak.** Değişken artmaz, koşul hiç doğru olmaz.
- **Eşit yerine büyük-eşit kullanmak.** Kutlama 10. adımdan sonra her adımda tekrarlanır.
- **Alarmı yarım kapatmak.** Yalnız sesi durdurmak; alarm değişkeni 1 kalır ve ezgi yeniden başlar.
- **eşle bloğunda aralıkları ters yazmak.** 512 değeri 50 yerine 5238 olur.
- **Eşik işaretini ters koymak.** nem > 30 yazarsan ıslakken uyarır.
- **Alan kartta kendi sensörünü okumak.** Gelen mesajdaki alınan değer kullanılmalı.
- **Mesaj adını farklı yazmak.** "nem" ile "Nem" eşit sayılmaz.
- **Çubuk grafikte en çok değeri yanlış bırakmak.** Nem yüzde ise 100 olmalı.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Nabız ölçeri bakmadan yeniden kur. Sonra ölçüm süresini 15 saniye yapıp çarpanı değiştir ve aynı sonucu bul.
4. Alarm için durum tablosunu kâğıda çiz: üç durum, hangi olay hangi durumu değiştirir.
5. P1 kaydırıcısını 0, 100, 300, 512 ve 1023 yap; her birinin yüzde karşılığını tahmin et, sonra konsolda karşılaştır.
6. Kendi cümlelerinle şu soruyu cevapla: "bekle bloğu neden öteki düğmeleri durdurmaz?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Akıllı saksı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Plan | Plan yok | Dört başlığın ne zaman çalıştığı yazılmış | Plan kodla birebir uyuyor ve eşiğin neden seçildiği açıklanmış |
| Ölçüm | Nem ham sayı olarak gösteriliyor | P1 değeri eşle ile 0-100'e çevrilmiş | Eşik bir değişkende tutuluyor, kolayca değiştirilebiliyor |
| Radyo | Kartlar birbirini görmüyor | İki kart aynı grupta, nem mesajı gidiyor ve alan kart alınan değeri kullanıyor | Mesaj adı ve grup kontrol edilmiş, ek bir mesaj (sıcaklık gibi) eklenmiş |
| Tepki | Uyarı yok ya da hep çalıyor | Nem 30'un altında üzgün yüz ve ezgi, değilse çubuk grafik | Çubuk grafik doğru ölçekli, ezgi sürerken gelen mesajlar anlatılabiliyor |
| Anlatım | Ne yaptığını anlatamıyor | Programı üç cümleyle anlatıyor | Hata yapıp nasıl bulduğunu ve ders parçalarını nerede kullandığını anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Hafta ezber değil, öğrencinin önceki haftaları birleştirerek küçük bir "ürün" kurmasıdır. Her derste bir cihaz (nabız ölçer, adımsayar, alarm, istasyon) çıkar.
- **Nasıl destek olunur?** Takıldığında cevabı söyleme; şu soruları sor: "Hangi olay bu başlığı çalıştırıyor?", "O anda değişkenlerin değeri ne?", "Bu bloğu eğer'in içine mi dışına mı koydun?", "Hangi karttan okuyorsun, gelen mesajdan mı kendi pininden mi?"
- **Sağlık notu.** Nabız ölçer bir eğitim aracıdır, tıbbi ölçüm değildir. Gerçek bir sağlık kaygısı için bir yetişkine ya da doktora danışılmalıdır.
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Final projesini farklı bir günde yapmak iyi olur.
- **Güvenlik.** Bu platformdaki her şey sanaldır; gerçek bir sensör, pil ya da radyo kullanılmaz.
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
