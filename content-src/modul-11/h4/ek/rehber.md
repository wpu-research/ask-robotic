### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Zamanlayıcı olayıyla (`her ... ms'de bir`) ve `hızı ters çevir` bloğuyla bir düşmana devriye düzeni verebilir; hız, süre ve yol ilişkisini hesaplayabilir.
2. `takip etsin` ve `arası mesafe` bloklarıyla "yakınsa kovala, uzaksa dur" kuralını kurabilir; `dursun` ile `takibi bıraksın` farkını açıklayabilir.
3. Yönü derece olarak (0 yukarı, 90 sağ, 180 aşağı, 270 sol) okuyabilir ve rastgele sayıyla düşmana tahmin edilmesi zor bir hareket verebilir.
4. A düğmesine basınca mermi sprite'ı yaratabilir; Mermi ve Düşman türleriyle çarpışma kuralı yazabilir; kullanılmayan mermileri silebilir.
5. Devriye, takip, ateş, skor ve can kurallarını birleştirerek "Hayalet avcısı" oyununu tamamlayabilir.

### Haftanın planı
Hafta beş derstir; her ders 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Devriye: düşman gidip gelir | ~20 dk | Anlatımı oku, yarasayı zamanlayıcıyla gidip gelir yap, süreyi değiştirip yolu hesapla, mini testi çöz. |
| 2 | Takip: hayalet seni kovalıyor | ~20 dk | Takip ve mesafe bloklarını dene, uyanma mesafesini 40 ve 100 yap, farkı konuş. |
| 3 | Rastgele hareket: şaşkın yarasa | ~20 dk | Rastgele yön kur, zamanlayıcıyı 300 ve 2000 ms yap, hangisinin daha tehlikeli olduğunu söyle. |
| 4 | Ateş etme: lazerle vur | ~25 dk | Lazeri yarat, hızını ve türünü ayarla, vurma kuralını kur, mermiyi sil. |
| 5 | Proje: Hayalet avcısı | ~35 dk | Planı tabloya yaz, beş parçayı tek tek kur, oyna ve ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta 1-3. haftalardaki şu becerilere dayanır; başlamadan önce kontrol et:
- Bir sprite yaratıp ona tür verebiliyor mu? (Düşman, Oyuncu, Mermi)
- Bir sprite'a hız verip ekranda kalmasını ya da sekmesini ayarlayabiliyor mu?
- Bir `eğer ... değilse` bloğu kurabiliyor mu?
- Çarpışma olayı, skor ve can bloklarını biliyor mu?
- Değişken oluşturup sprite'ı değişkenle seçebiliyor mu?

### Kavram haritası
- **Zaman:** `her karede` (saniyede 60) · `her N ms'de bir` (milisaniye) · yol = hız x süre
- **Hareket:** hız (x, y) · yön (derece) · ters çevirme · takip · dursun
- **Zekâ:** devriye (kendi düzeni) · algılama eşiği (mesafe < N) · rastgelelik (tohumlu formül)
- **Mermi:** düğmeye basılınca yeni sprite · tür (Mermi) · bu sprite / diğer sprite · silme
- **Oyun:** plan tablosu · paylaşılan tür · skor ve kazanma · can ve kaybetme

### Sık yapılan hatalar
- **Hızı ters çevirmek yerine hızı yeniden yazmak.** Zamanlayıcıda "x hızı 40" yarasayı döndürmez.
- **Ters çevirmede yanlış eksen.** y (dikey) seçiliyse yatay hız hiç değişmez.
- **Milisaniyeyi saniye sanmak.** 1500 ms bir buçuk saniyedir; yol hesabından önce saniyeye çevir.
- **Takip bloğunun iki kutusuna aynı sprite'ı koymak.** Sprite kendini takip eder ve kıpırdamaz.
- **`dursun` yerine `takibi bıraksın`.** Hayalet son hızıyla kaymaya devam eder.
- **Mesafe denetimini `oyun başlayınca` içine koymak.** Kural yalnız bir kez sınanır.
- **Yön için 1-100 gibi küçük bir aralık.** Yön için 0-359 gerekir.
- **Lazeri Nesne türünde yaratmak.** Çarpışma kuralı Mermi türünü bekler ve çalışmaz.
- **Mermiyi hiç silmemek.** Vuran lazeri `sil`, kaçanı `dünyadan çıkınca silinsin` ile temizle.
- **Kazanma denetimini skorun değişmediği yere koymak.** Oyun hiç bitmeyebilir.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Devriye yarasasını bakmadan sıfırdan kur; zamanlayıcıyı 1000 ve 2000 ms yapıp yarasanın bir yönde kaç piksel gittiğini hesapla, sonra çalıştırıp kontrol et.
4. Hayaletin uyanma mesafesini 40, 70 ve 100 yap; hangisinde oyun adil geliyor, nedenini bir cümleyle yaz.
5. Kendi cümlelerinle şu soruyu cevapla: "Çarpışma kuralı neden sprite'ın adına değil türüne bakar?"
6. Yeni bir düşman türü düşün (örneğin örümcek) ve onun için bir plan tablosu çiz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Hayalet avcısı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Düşmanlar | Yarasa ya da hayaletlerden biri çalışmıyor | Yarasa sekiyor, hayaletler üstten gelip avcıyı takip ediyor | Hayaletlerin hızı ve üretim aralığı oyunu dengeli kılacak biçimde ayarlanmış |
| Ateş | A'ya basınca lazer çıkmıyor ya da yanlış yöne gidiyor | Lazer avcının burnundan yukarı gidiyor ve ekrandan çıkınca siliniyor | İki lazer ya da B düğmesi gibi bir ekleme yapılmış |
| Çarpışma ve skor | Vuruş skor vermiyor ya da lazer silinmiyor | Vuruş 1 puan veriyor, lazer ve hayalet kalkıyor | Kazanma ve kaybetme mesajları var |
| Can | Düşman değince can değişmiyor | Can azalıyor, ekran sallanıyor, düşman siliniyor | `can bitince` ile oyun bitiyor |
| Anlatım | Ne yaptığını anlatamıyor | Beş parçayı ve olaylarını anlatıyor | Bir hata yapıp nasıl bulduğunu anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta çocuk "kural koyma" fikrini öğrenir: düşmanı bir zamanlayıcı, bir mesafe ya da bir rastgele sayı yönetir. Kod yazmak yerine blok sürüklendiği için sonuç hemen ekranda görülür.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunları sor: "Hangi olay bu bloğu çalıştırıyor?", "Hızın işareti ne?", "Sprite'ın türü ne?", "Bu blok olayın içinde mi?"
- **Hata yapmak güvenlidir.** Her şey sanaldır; ↺ düğmesi oyunu başa sardığında hiçbir şey bozulmaz. Blok değişikliği çalışan oyuna yansımaz, önce ↺ gerekir.
- **Sayılar.** Hız ve yol hesapları dört işlemle yapılır; mesafe sorusu Pisagor'u hazır bilmeyi gerektirmez, sayıları verilen örneklerdeki gibi 3-4-5 oranına yakın seçilmiştir.
- **Düşman tasarımı.** Oyunun adil olması önemli bir tasarım sorusudur; çocukla "bu düşmandan kaçmak mümkün mü?" sorusunu konuşmak hem matematik hem tasarım düşüncesi kazandırır.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
