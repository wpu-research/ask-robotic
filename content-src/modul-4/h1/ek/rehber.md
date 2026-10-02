### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. HC-SR04'ün sesin gidiş-dönüş süresiyle mesafe ölçtüğünü anlatabilir; süreden santimetreyi (süre × 0,0343 / 2) hesaplayabilir.
2. TRIG'e doğru tetik darbesi verip `pulseIn` ile ECHO süresini zaman aşımıyla ölçebilir; `0` dönüşünü "yankı yok" diye yorumlar.
3. Aykırı değerin ne olduğunu, ortalama ile medyanın farkını söyler; kayan pencereli medyan filtre yazabilir.
4. Servo ve sensörle açı açı tarama yapıp en yakın nesnenin yönünü bulabilir.
5. Mesafe sensörünü LED, buzzer ve I2C LCD ile birleştirerek `millis()` ile bloklamayan bir park sensörü kurabilir.

### Haftanın planı
Hafta beş derstir; ilk dört ders yaklaşık 20-25 dakika, proje dersi yaklaşık 35 dakikadır. Aşağıdaki plan günde bir ders içindir.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Ultrasonik prensip: ses, süre, mesafe | ~20 dk | Anlatımı oku, formülü elle uygula, sıcaklık tablosunu çalıştırıp yorumla, mini testi çöz. |
| 2 | pulseIn, trig/echo ve santimetre hesabı | ~25 dk | HC-SR04'ü bağla, Mesafe değerini değiştirerek ölçümü izle, "yankı yok" durumunu dene. |
| 3 | Gürültü, yansıma açısı ve medyan filtre | ~25 dk | Ortalama ve medyanı aykırı değerli dizilerde karşılaştır, kayan pencereyi canlı sensörle dene. |
| 4 | Servo ile tarama (sonar) | ~25 dk | Servoyu ekle, taramayı çalıştır; Mesafe'yi açıya göre elle değiştirip en yakın yönü bul. |
| 5 | Proje: Park sensörü (LED + buzzer + LCD) | ~35 dk | Davranış tablosunu oku, devreyi kur, programı çalıştır, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta Modül 1-3'ten şunlar gerekir. Başlamadan kısaca kontrol et:
- `for` döngüsü, diziler ve fonksiyon yazma (Modül 3, ders 4 ve 19).
- `millis()` ile bloklamayan zamanlama (ders 27); projede üç iş birlikte yürür.
- `map()` (ders 14), buzzer (ders 18), servo (ders 21) ve I2C LCD (ders 32-33).
- Seri Monitor'a yazdırma (ders 9).
- Ondalık sayılarla çarpma ve bölme; birim çevirme (m/s'den cm/µs'ye).

### Kavram haritası
- **Fizik:** ses → yankı → gidiş-dönüş süresi → mesafe = süre × 0,0343 / 2 → sıcaklığın ses hızına etkisi
- **Ölçüm:** TRIG darbesi (10 µs) → ECHO süresi → `pulseIn` → zaman aşımı → `0` = yankı yok
- **Veri kalitesi:** yansıma açısı ve yüzey → aykırı değer → ortalama / medyan → kayan pencere → filtre gecikmesi
- **Sistem:** servo + sensör = tarama → en küçüğü tutma → eşikler → `map()` → `millis()` ile çok görev

### Sık yapılan hatalar
- **İkiye bölmeyi unutmak.** Süre gidiş + dönüş olduğu için mesafe iki kat çıkar.
- **Birim karıştırmak.** 343 m/s değerini 0,0343 cm/µs yapmadan formüle koymak.
- **Zaman aşımı yazmamak ve 0'ı mesafe sanmak.** Program takılır ya da "0 cm" sanılır; LED veya buzzer yanlış çalışır.
- **`delay(10)` ile `delayMicroseconds(10)` karıştırmak.** Biri milisaniye, öbürü mikrosaniyedir.
- **Ortalamayla aykırı değeri temizlediğini sanmak.** Medyan yanlışları atar, ortalama kendine katar.
- **Pencereyi doldurmamak ya da `% N` unutmak.** Başlangıçta sıfırlar medyanı bozar, indeks diziden taşar.
- **En yakın nesne aramasında başlangıcı 0 yapmak.** Hiçbir ölçüm 0'dan küçük olmaz.
- **Bip için `delay()` kullanmak.** Ölçüm ve ekran bip süresince durur.
- **LCD satırını 16 karaktere tamamlamamak.** Eski harfler ekranda kalır.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Süre × 0,0343 / 2 formülünü bakmadan yaz; 1750 µs, 5830 µs ve 11660 µs için santimetreyi hesapla (yaklaşık 30, 100 ve 200 cm).
4. `100, 100, 100, 350, 100` dizisinin ortalamasını ve medyanını kâğıtta bul; sonra iki yanlışlı bir dizi kendin yaz.
5. Kendi cümlelerinle şunu cevapla: "Park sensöründe pencereyi büyütünce ne kazanır, ne kaybedersin?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Park sensörü)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | HC-SR04, LED, buzzer ya da LCD eksik veya yanlış pine bağlı | Tüm parçalar doğru pinlerde (TRIG D9, ECHO D10, buzzer D8, LED D11-D13, LCD A4/A5) | Bağlantılar düzenli, buzzer türü ve LCD adresi bilinçli seçilmiş |
| Ölçüm ve filtre | Ham ölçümle karar veriyor; yankı yok durumu işlenmemiş | Medyan filtre ve geçersiz ölçüm ele alınmış | Pencere boyunun gecikme etkisini açıklıyor, deneyle gösteriyor |
| Eşikler ve davranış | LED, bip ya da ekran tabloyla uyuşmuyor | Dört bölge tabloya uygun çalışıyor | Sınırda titremeyi histerezisle çözmüş |
| Zamanlama | Bip için `delay()` kullanılmış, ölçüm duruyor | Ölçüm, bip ve ekran `millis()` ile ayrı çalışıyor | Süreleri değiştirip etkisini açıklıyor |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor ve gerçek bir arabadaki farkları sayıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta bir sensörün "mesafeyi bilmediğini, bir süre ölçtüğünü" anlamak ve gerçek dünyadaki ölçümün gürültülü olduğunu görmek. Formülü ezberletmek yerine "ses gidip dönüyor, bu yüzden ikiye bölüyoruz" sorusunu öğrencinin kendi cümleleriyle söylemesini bekle.
- **Nasıl destek olunur?** Öğrenci takıldığında cevabı söylemek yerine şu soruları sor: "ECHO ne kadar HIGH kalıyor?", "Süre gidiş mi, gidiş-dönüş mü?", "Yankı gelmezse ne okuyor?", "Bu okuma bir aykırı değer olabilir mi?"
- **Sanal laboratuvar ve gerçek sensör.** Laboratuvardaki sensör kusursuzdur: Mesafe özelliğine ne yazılırsa onu okur ve ses hızı sabittir. Gerçek HC-SR04 eğik yüzeylerde, yumuşak malzemelerde ve sıcaklık değişince yanlış okuyabilir; medyan filtre bu yüzden öğretilir.
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Medyan dersi ve proje yeni bir düşünce biçimi içerir; gerekirse bir gün ara ver.
- **Güvenlik.** Servo ve motorlar gerçek devrede ayrı bir 5 V kaynaktan beslenir ve GND'ler ortak yapılır. Şebeke gerilimiyle (220 V) hiçbir devre kurulmaz; pil kullanılırsa kısa devre ve ters bağlamaya dikkat edilir.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
