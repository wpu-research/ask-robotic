### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Diferansiyel sürüşü açıklayabilir; sol ve sağ tekerlek hızından v, ω ve dönme yarıçapını hesaplayabilir, ters problemi çözebilir.
2. Motor sürücüsünün (L298N, TB6612) yön ve hız girişlerini, doğruluk tablosunu (ileri, geri, fren, serbest) ve güvenli bağlantı kurallarını söyleyebilir.
3. Ölü bölgeyi ve azami hızı ölçüp istenen hızı PWM'e çeviren kalibrasyon fonksiyonunu yazabilir.
4. Seri porttan gelen harfli komutları ayrıştırıp robotu sürebilir.
5. Komut watchdog'lu, durum makineli bir komutlu araba kurabilir ve watchdog'un bedelini (hız × süre) hesaplayabilir.

### Haftanın planı
Hafta beş derstir; her ders 25-35 dakikadır. Plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Diferansiyel sürüş: v, ω ve tekerlek hızları | ~25 dk | Anlatımı oku, formülleri elle uygula, sketch'i benzetimde dene, mini testi çöz. |
| 2 | Motor sürücüsü L298N/TB6612: yön ve PWM | ~25 dk | Doğruluk tablosunu öğren, dört durumu sırayla çalıştır, fren ve serbest bırakmayı karşılaştır. |
| 3 | Hız, ölü bölge ve kalibrasyon | ~30 dk | Ölü bölgeyi tara, iki noktadan doğru çiz, hizdanPwm ile naif eşlemeyi karşılaştır. |
| 4 | Seri komutlarla sürüş (uzaktan kumanda simülasyonu) | ~25 dk | W S A D X komutlarını dene, hata durumlarını (Q, W999) gözle. |
| 5 | Proje: Komutlu araba | ~35 dk | Watchdog'u kur, dizi komutlarını gönder, durma mesafesini ölç ve hesapla. |

### Ön koşul kontrolü
Bu hafta Modül 1-3 (ve Modül 4'ün büyük bölümü) tamamlanmış kabul edilir. Başlamadan önce kontrol et:
- PWM ve analogWrite'ı (Modül 3, 16. ders) açıklayabiliyor mu?
- DC motorun neden doğrudan Arduino pininden sürülmediğini (22. ders) ve H-köprüsünün işini (23. ders) hatırlıyor mu?
- millis() ile bloklamayan zamanlamayı (27. ders) ve enum ile durum makinesini (28. ders) kullanabiliyor mu?
- Serial Monitor'den satır gönderip okuyabiliyor mu (9. ders)?
- Ondalık sayılarla bölme ve çarpma, metre-santimetre çevirisi rahat mı?

### Kavram haritası
- **Hareket:** tekerlek hızları vL, vR → v ve ω → dönme yarıçapı R → ters problem
- **Donanım:** motor sürücüsü → yön (IN) ve hız (EN, PWM) → fren ve serbest bırakma → ortak GND, ayrı motor gücü
- **Hız denetimi:** PWM → ölü bölge → azami hız → iki noktadan kalibrasyon → hizdanPwm
- **Komut:** seri tampon → harf + sayı → atoi, toupper, constrain → switch
- **Güvenlik:** son komut sürer → watchdog (CMD_TIMEOUT) → durma mesafesi = hız × süre → güvenli durum

### Sık yapılan hatalar
- **Birimleri karıştırmak.** L = 0,12 m, 12 cm değil; ω rad/s cinsindendir, derece değil.
- **ω'yı hızların toplamından hesaplamak.** ω fark ister, toplam v'ye gider.
- **vR = vL iken R'yi hesaplamak.** Sıfıra bölme olur; düz gidişte R sonsuzdur.
- **EN'i PWM olmayan pine bağlamak.** Uno'da PWM pinleri 3, 5, 6, 9, 10, 11'dir.
- **GND'leri birleştirmemek ya da motoru Arduino'nun 5V'undan beslemek.** Ayrı pil ve ortak GND gerekir.
- **PWM'i hız sanmak.** 128 yarım hız değildir; ölü bölge yüzünden düşük PWM'de motor hiç dönmez.
- **Kalibrasyon sayılarını başka robota ya da boş pile uygulamak.** OLU_PWM ve V_MAX robota, zemine ve piline özgüdür.
- **Satır sonu ayarını unutmak ya da switch'te break atlamak.** Komut hiç işlenmez ya da bir sonraki case'e düşülür.
- **Geçersiz komutun da watchdog'u yenilemesine izin vermek.** Gürültü robotu sonsuza kadar sürdürebilir.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını oku, sonra soruyu yeniden çöz.
3. Elle hesapla: vL = 0,15 ve vR = 0,25 m/s için v, ω ve R kaç? Sonra aynı ω ve v için tekerlek hızlarını ters formülle yeniden bul.
4. Kendi robotun (ya da benzetimdeki robot) için ölü bölgeyi ve azami hızı ölç; hizdanPwm ile 15 cm/s iste ve gerçek hızı kronometreyle karşılaştır.
5. 700 ms watchdog'u 300 ms yapıp komutları 400 ms aralıkla gönder; ne olduğunu ve nedenini bir cümleyle yaz.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Komutlu araba)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Sürüş | Komutlardan biri yanlış yöne gidiyor | W, S, A, D, X doğru çalışıyor | Yerinde dönüş açısını hesaplayıp süreyle ayarlıyor (ω = 2v / L) |
| Kalibrasyon | PWM'i doğrudan hız sanıyor | hizdanPwm ile cm/s komutları yaklaşık doğru hızda | Kendi OLU_PWM ve V_MAX değerlerini ölçmüş ve gösteriyor |
| Güvenlik | Watchdog yok ya da robot açılışta hareket ediyor | 700 ms watchdog çalışıyor, açılışta duruyor | Geçersiz komutun watchdog'u yenilemediğini sınamış ve süre seçimini gerekçelendirmiş |
| Ölçüm | Durma mesafesi ölçülmemiş | Watchdog sonrası yol ölçülüp hız × süre ile karşılaştırılmış | Farklı hızlarda ve süreler için ölçüp farkı yorumlamış |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Bir hata yapıp nasıl bulduğunu ve nasıl düzelttiğini anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta robotun nasıl hareket ettiğini matematikle anlamak ve ilk güvenlik düşüncesini (kontrol koparsa ne olur?) edinmektir. Hata yapmak güvenlidir: portal tamamen sanaldır.
- **Nasıl destek olunur?** Cevabı söylemek yerine sor: "Hangi tekerlek daha hızlı?", "Birimler metre mi santimetre mi?", "Komut kesilirse robot ne yapar?"
- **Süre.** Bir ders hesap, bir ders donanım, bir ders ölçüm ağırlıklıdır; dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek robota geçilirse tekerlekleri havada denemek, ayrı pil kullanmak, pili ters bağlamamak ve kısa devre etmemek gerekir; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz. Gerçek bir robotta durma mesafesi ölçülmeden güvenli sayılmaz.
- **Gerçekle fark.** Benzetim temiz sonuç verir; gerçek robotta motorlar aynı hızda dönmez, tekerlekler kayar, kablosuz bağlantı gecikir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
