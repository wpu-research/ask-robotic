### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Enkoderin tık ürettiğini, tıkın nasıl mesafeye çevrildiğini (çevre / yuva sayısı) hesaplayabilir.
2. Tıkları kesmeyle sayıp sayacı `volatile` ve güvenli okuma ile kullanabilir.
3. Pencere ve tık farkından hız hesaplayabilir; nicemlemenin ve pencere uzunluğunun etkisini açıklayabilir.
4. Tık farkına göre P düzeltmeyle robotu düz götürebilir ve düzeltmenin neden sapmayı sıfırlamadığını söyleyebilir.
5. Odometri formülleriyle x, y ve θ'yı hesaplayabilir; hatanın iki kaynağını (çözünürlük, yanlış sabitler) ayırt edebilir.
6. Kare ve sekiz çizen robotu planlayıp başlangıca dönüş hatasını ölçerek toleransla karşılaştırabilir.

### Haftanın planı
Hafta beş derstir; ilk dört ders yaklaşık 25-30 dakika, proje 35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Tekerlek enkoderi: tık → mesafe | ~25 dk | Anlatımı oku, tık mesafesini elle hesapla, 1 m koşusunu çalıştır, mini testi çöz. |
| 2 | Kesmeyle sayma ve hız hesabı | ~25 dk | Hız formülünü uygula, pencereyi 100 ve 500 ms yap, nicemlemeyi karşılaştır. |
| 3 | Düz gitme: iki tekerleği eşitleme | ~25 dk | Düzeltmesiz ve P düzeltmeli koşuyu karşılaştır, KP değerlerini dene. |
| 4 | Odometri: konum ve yön tahmini, sapma | ~30 dk | Formülleri elle uygula, tahmin ile gerçek konumu karşılaştır, CHANGE ve yanlış sabit deneyini yap. |
| 5 | Proje: Kare ve sekiz çizen robot | ~35 dk | Planı tabloya yaz, şekilleri çizdir, başlangıca dönüş hatasını ölç. |

### Ön koşul kontrolü
Başlamadan önce şunları kontrol et:
- Kesme ve `attachInterrupt` kavramı hatırlanıyor mu? (Modül 3, ders 29)
- `millis()` ile bloklamadan zaman ölçmek biliniyor mu? (Modül 3, ders 27)
- İki motorlu robotu ileri sürmek ve diferansiyel sürüş tanıdık mı? (Modül 5, 1. hafta)
- Dört işlem, yüzde ve ondalık sayılarla rahat mı? Bu hafta sayılarla çok hesap vardır.
- Sinüs, kosinüs ve radyan 4. derste kısaca hatırlatılır; öğrenci ilk kez görüyorsa öğretmen destek verebilir.

### Kavram haritası
- **Ölçüm:** enkoder diski → tık → tık mesafesi (çevre / yuva) → kesmeyle sayma → `volatile` ve güvenli okuma
- **Hız:** pencere → sayaç farkı → hız = Δtık · tık mesafesi / Δt → nicemleme → pencere uzlaşması
- **Düz gitme:** iki motor farkı → tık farkı → birikme → P düzeltme (KP) → kalan sapma
- **Odometri:** Δs, Δθ → x, y, θ → çözünürlük hatası → sistematik hata → birikme
- **Proje:** üç hareket (düz, dönüş, daire) → mutlak açı hedefi → ölü bölge → başlangıca dönüş hatası → tolerans

### Sık yapılan hatalar
- **Yarıçap yerine çapı kullanmak.** Tık mesafesi iki kat çıkar.
- **Santimetre ile metreyi karıştırmak.** Önce tüm uzunlukları aynı birime çevir.
- **Sayacı `volatile` yapmamak ya da 2 baytlık sayacı kesmeleri kapatmadan okumak.**
- **Sayacı pencere sonunda sıfırlamak.** Önceki değeri saklayıp farkı almak daha güvenlidir.
- **Düzeltme işaretini ters yazmak.** Yavaş tekerlek daha da yavaşlar.
- **Açıyı derece ile radyan karıştırmak.** `cos` ve `sin` radyan ister.
- **Dönüşü sabit tık sayısı ya da göreli açıyla yapmak.** Hata her köşede birikir; mutlak açı hedefi kullan.
- **Odometrinin kendi tahminine tam güvenmek.** Gerçek hatayı dışarıdan ölç.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Tık mesafesini farklı bir tekerlek için (örneğin yarıçap 4 cm, 24 yuva) elle hesapla ve 1 m için kaç tık gerektiğini bul.
4. Aynı yolu `KP = 0` ve `KP = 20` ile çalıştırıp sapmayı karşılaştır; farkı kendi cümlenle açıkla.
5. Şu soruyu cevapla: "Odometri neden kendi hatasını göremez?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Kare ve sekiz çizen robot)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Plan | Plan yok | Düz, dönüş ve daire için tık hedefleri hesaplanmış | Hesaplar kodla uyuşuyor ve ölü bölge hesabı açıklanmış |
| Düz gitme | Robot belirgin yana sapıyor | P düzeltme çalışıyor, sayaçlar yaklaşık eşit | KP değerlerini karşılaştırıp seçimini gerekçelendiriyor |
| Dönüş | Sabit tıkla dönüyor, köşeler tutmuyor | Mutlak açı hedefi kullanıyor | Dönüş hatasını (tık çözünürlüğü) açıklıyor |
| Sonuç | Başlangıca uzaklık ölçülmemiş | Uzaklık ölçülmüş ve tolerans ile karşılaştırılmış | KP = 0 ile karşılaştırıp düzeltmenin etkisini gösteriyor |
| Anlatım | Ne yaptığını anlatamıyor | Planı ve sonucu adım adım anlatıyor | Hata kaynaklarını ve gerçek robotta neyin farklı olacağını söylüyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta robotun "ne kadar gittim, nerede olduğumu" nasıl bildiğini öğrenir. Ölçüm, hata ve tolerans kavramları bilimsel düşünmenin temelidir; "tam sıfır hata" beklemeyin.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine sor: "Sayaç kaç gösteriyor, bunu santimetreye nasıl çevirirsin?", "Hata önce mi oluşuyor, düzeltme önce mi?", "Hangi sayı ölçüldü, hangisi tahmin?"
- **Süre.** Hesaplı bir haftadır; dersleri günlere yaymak kalıcılığı artırır.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek robot kurulursa motorları Arduino'nun 5 V pininden beslemeyin, ayrı pil kullanın, pili kısa devre yapmayın ve ilk testi robotu yerden kaldırarak yapın. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **Gerçeklik notu.** Benzetimde tekerlek kaymaz; gerçek robotta hatalar burada ölçülenden belirgin biçimde büyük olabilir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
