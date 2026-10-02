### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Hız ile ivmenin farkını söyleyebilir; yerçekimini aşağı yönlü ivme olarak kurabilir.
2. Zıplamayı eksi y hızı olarak kurar, havada zıplamayı `alttan bir duvara dokunuyor mu?` koşuluyla engeller.
3. Altın, diken ve kapı gibi geçilebilir karolar için `karosuna dokununca` olayı yazar; `olay karosunun` bloklarını kullanır.
4. Çarpışmayı düşüş hızı ve konum ölçütleriyle "ezme" ve "yan çarpma" olarak ayırır.
5. Haftanın parçalarını kurallar tablosuyla planlayıp tek bir platform seviyesinde birleştirir.

### Haftanın planı
Hafta beş derstir. Aşağıdaki plan günde bir ders içindir; son gün proje olduğu için daha uzundur.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | Yerçekimi: kahraman yere insin | ~20 dk | Anlatımı oku, ivme bloğunu kur, hareket biçimini sağa-sola seç, mini testi çöz. |
| 2 | Zıplama: A ile zıpla | ~20 dk | Zıplama hızını dene, `eğer` koşulunu ekle, havada zıplamayı engelle. |
| 3 | Platformlar, altınlar ve dikenler | ~25 dk | Altın ve diken olaylarını kur, karo boşaltmayı dene. |
| 4 | Düşmanın üstüne zıpla | ~25 dk | İki ölçütü kur, ezme ve yan çarpmayı sına. |
| 5 | Proje: Platform atlayıcı | ~35 dk | Kurallar tablosunu doldur, altın-diken-kapı olaylarını yaz, oyunu oyna ve ayarla. |

### Ön koşul kontrolü
Bu hafta şu bilgiler gerekir; eksik varsa ilgili dersi tekrar et:
- Sprite oluşturmak ve `hızı x y` bloğunu kullanmak (Modül 11, ders 1-4).
- Çarpışma olayını ve `diğer sprite` kavramını bilmek (ders 6).
- `eğer` bloğu ve skor/can bloklarını kullanmak (ders 7 ve 9).
- Karo haritası, duvar ve `karosuna dokununca` olayı (ders 11-13) ve kamera (ders 14).
- Öğrenci toplama ve çarpma işlemlerinde rahat olmalı; bu hafta hız x süre hesapları var.

### Kavram haritası
- **Fizik:** hız → ivme → yerçekimi (y yönünde pozitif ivme) → zıplama (eksi y hızı) → tepe ve düşüş
- **Koordinat:** x sağa, y aşağı artar → yukarı = eksi hız, küçük y
- **Karo olayları:** geçilebilir karo → `karosuna dokununca` → kenar tetikleme → `olay karosunun sütunu / satırı` → karoyu boşalt
- **Çarpışma:** çarpışma olayı → `bu sprite` / `diğer sprite` → düşüş hızı ve konum ölçütü → `ve` → `eğer ... değilse`
- **Proje:** kurallar tablosu → altın, diken, kapı, ezme → kamera → sınama ve zorluk ayarı

### Sık yapılan hatalar
- **Hareket biçimini dört yöne seçmek.** Motor y hızını tuşlara göre yeniden yazar; yerçekimi neredeyse etkisiz kalır.
- **Hız ile ivmeyi karıştırmak.** Hızla düşersen kahraman hep aynı hızla gider, ivmeyle düşersen hızlanır.
- **Zıplama hızına artı sayı yazmak.** y aşağı doğru artar; zıplamak için eksi gerekir.
- **Zıplamayı yerde mi koşuluna bağlamamak.** Kahraman havada da zıplar.
- **Yatay hızı sıfırlamak.** Zıplarken `x hızı` kutusuna kahramanın kendi x hızı konmalı.
- **Altın karosunu boşaltmamak ya da sabit sütun/satır yazmak.** Altın yerinde kalır ya da yanlış karo boşalır.
- **Olay türünü yanlış seçmek.** Oyuncu yerine Düşman seçersen olay çalışmaz.
- **Ezme ölçütünde ters karşılaştırma.** Düşman üstte olduğunda ezme sayılır.
- **`bu sprite` ile `diğer sprite`ı karıştırmak.** Düşman yerine kahraman yok olur.
- **Dikenden sonra hızı sıfırlamamak.** Kahraman yukarı hızla başlangıçtan havaya fırlayabilir.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını bir kez daha oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. Yerçekimi ve zıplamayı sıfırdan, bakmadan kur. Zıplama hızını -150, -250 ve -350 yap ve kahramanın yüksekliğini karşılaştır.
4. Hız -260 ve ivme 520 iken tepe noktasının kaç saniyede geldiğini hesapla, sonra oyunda dene.
5. Kendi cümlelerinle şu soruyu cevapla: "Oyun, kahramanın düşmanı ezdiğini mi yoksa yandan çarptığını mı nasıl anlıyor?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Platform atlayıcı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Hareket | Kahraman düşmüyor ya da zıplamıyor | Yerçekimi, yürüme ve zıplama çalışıyor; havada zıplama engelli | Zıplama gücünü kendisi ayarlamış ve nedenini açıklıyor |
| Karo olayları | Altın ya da diken olayı çalışmıyor | Altın kayboluyor ve skor artıyor; dikende can azalıp kahraman başa dönüyor | Başa dönerken hızı sıfırlıyor ve nedenini söylüyor |
| Kapı ve kazanma | Kapıya dokununca bir şey olmuyor | Mesaj yazılıyor ve oyun kazanılıyor | Kazanma koşulunu değiştirmiş (örneğin skor şartı) ve açığı düşünmüş |
| Düşman | Ezme ve yan çarpma ayrılmıyor | Üstten ezince düşman yok oluyor, yandan çarpınca can azalıyor | İki ölçütü açıklıyor ve eşiği değiştirip etkisini gösteriyor |
| Tasarım ve anlatım | Oyun oynanamayacak kadar zor ya da kolay | Seviye oynanabilir; kuralları anlatabiliyor | Arkadaşına oynatıp zorluğu ayarlamış |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta çocuk fizik formüllerini ezberlemez; yerçekimi ve zıplamanın bir sayıyla ayarlanabildiğini deneyerek görür. Hız ve ivmeyi tartışırken oyundaki hissi konuşmak yeterlidir.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunu sor: "Hangi blok bunu yapıyor?", "Sayıyı değiştirirsen ne olur?", "Kahraman düşüyor mu, yoksa yerde mi?" Birlikte tahmin edip sonra denemek iyi çalışır.
- **Süre.** Dersler 20-35 dakikadır. Zıplama gücünü ayarlamak gibi deneme zamanı gerektiren işlerde acele ettirme.
- **Güvenlik.** Her şey tarayıcıda çalışır, harici bir donanım yoktur. Oyunda dikenden korunmak yalnız bir oyun kuralıdır.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
