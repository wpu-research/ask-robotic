### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. Bir pini `INPUT_PULLUP` ile giriş yapıp `digitalRead` ile okuyabilir ve "basılı = LOW" mantığını açıklayabilir.
2. `if`, `else if`, `else`, `switch` ile programa karar verdirebilir; `==` ile `=` arasındaki farkı bilir.
3. `&&`, `||` ve `!` ile birden çok koşulu birleştirebilir.
4. Buton sıçramasını (bounce) ve kenar algılamayı açıklayabilir; "tek basış, tek işlem" davranışını programlayabilir.
5. `Serial.print`, `Serial.println`, `Serial.available`, `Serial.read` ve `Serial.parseInt` ile kartla konuşabilir.
6. Plan tablosundan yola çıkarak kapı zili ve basış sayacı projesini kurabilir.

### Haftanın planı
Hafta beş derstir; her ders yaklaşık 20-35 dakikadır. Aşağıdaki plan günde bir ders içindir. Hafta 1'deki Blink ve LED bağlantılarına bu hafta sık sık geri dönülür.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | digitalRead, buton, INPUT_PULLUP | ~20 dk | Anlatımı oku, butonu D2 ve GND arasına bağla, LED'i butonla yak, `1 - durum` hilesini dene. |
| 2 | if/else, switch, mantık işleçleri | ~22 dk | İki butonla `&&`, `\|\|` ve `!` programını dene, `switch` programına `case 0` ekle. |
| 3 | Debounce ve kenar algılama | ~25 dk | Düşen kenarı yakala, basılı tutunca LED'in bir kez değiştiğini doğrula, bekleme süresiyle oyna. |
| 4 | Serial Monitor: yazdır, oku, ayrıştır | ~25 dk | Buton durumunu yazdır, `A` ve `K` komutlarıyla LED'i uzaktan yönet, `B3` komutuyla yanıp söndür. |
| 5 | Proje: Kapı zili ve basış sayacı | ~35 dk | Planı tabloya yaz, devreyi kur, programı çalıştır, `S` ve `R` komutlarını dene, ölçütle değerlendir. |

### Ön koşul kontrolü
Bu hafta Hafta 1'in bilgileri gerekir. Başlamadan önce şunlara bak:
- `setup()`, `loop()`, `pinMode`, `digitalWrite` ve `delay` ile LED yakıp söndürebiliyor mu? (Hafta 1, ders 3)
- LED için seri direncin neden gerektiğini söyleyebiliyor mu? (Hafta 1, ders 2)
- `for` döngüsü ve dizilerle bir LED grubunu sürebiliyor mu? (Hafta 1, ders 4)
- Laboratuvarda parça ekleyip kablo çekmeyi ve butonun "Basılı" özelliğini değiştirmeyi biliyor mu?

Eksik varsa ilgili Hafta 1 anlatımına dönülür.

### Kavram haritası
- **Giriş:** pin → `INPUT_PULLUP` → yüzen giriş sorunu → `digitalRead` → basılı = LOW
- **Karar:** koşul → `if` / `else if` / `else` → `==` ve `=` farkı → `switch`, `case`, `break`
- **Mantık:** `bool` → `&&`, `||`, `!` → doğruluk tablosu
- **Zaman ve olay:** sıçrama → seviye ve kenar → önceki durum değişkeni → debounce
- **Haberleşme:** `Serial.begin` ve baud → `print` / `println` → `available` / `read` → `parseInt`
- **Proje:** plan tablosu → durum değişkenleri (`sayac`, `onceki`) → `sayac++` → sessiz mod

### Sık yapılan hatalar
- **`INPUT_PULLUP` yerine `INPUT` yazmak.** Pin yüzer ve okuma rastgele olur.
- **Basılı = HIGH sanmak.** `INPUT_PULLUP` ile basılı olan LOW'dur.
- **`==` yerine `=` yazmak.** `if (durum = LOW)` koşulu hep yanlış olur ve program sessizce hatalı çalışır.
- **`switch` içinde `break` unutmak.** Program bir sonraki `case`'in koduna da akar.
- **`onceki = simdi;` satırını unutmak.** Kart aynı kenarı her turda yeniden görür.
- **Kenar yerine seviye kullanmak.** Butonu basılı tutunca sayaç ya da LED sürekli değişir.
- **`'A'` yerine `"A"` ya da `'a'` yazmak.** Tek ve çift tırnak farklıdır; büyük ve küçük harf de farklıdır.
- **Sayıyı `read()` ile okumak.** Rakamın değerini değil karakter kodunu alırsın; `parseInt()` kullan.
- **Sayacı `loop()` içinde tanımlamak.** Her turda 0'a döner ve hiç artmaz.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarına bir kez daha bak ve "sık yapılan yanlış" satırlarını yüksek sesle oku.
2. Mini testlerde yanlış yaptığın soruların açıklamalarını yeniden oku, sonra soruyu yeniden çöz.
3. İki butonlu bir devre kur ve `&&`, `||`, `!` için kendi doğruluk tablonu çıkar; sonucu laboratuvarda doğrula.
4. Debounce'lu aç-kapa programını bakmadan sıfırdan yaz. Sonra "bırakınca" ters dönen sürümünü yaz.
5. Kendi cümlelerinle şu soruyu cevapla: "Seviye ile kenar arasındaki fark nedir ve sayaçta hangisi lazım?"

Hafta sonu testi olarak beş dersin mini testleri yeterlidir; her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Kapı zili ve basış sayacı)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Buton ya da buzzer yanlış bağlı, GND eksik | Zil butonu D2-GND, LED dirençli, aktif buzzer D8-GND doğru | İsteğe bağlı sessiz buton da bağlı ve düzenli |
| Plan | Tablo yok | İşleri ve hangi dersten geldiğini gösteren tablo var | Tablo kodla birebir uyuyor ve açıklanmış |
| Basış sayma | Basılı tutunca ya da sıçramada sayaç yanlış artıyor | Her basış tam bir kez sayılıyor | Kenar algılama ve debounce'u kendi cümleleriyle açıklıyor |
| Seri iletişim | Hiçbir şey yazmıyor | `Zil: N` yazıyor, `S` ve `R` komutları çalışıyor | Yeni bir komut ekliyor (örneğin `T`) |
| Anlatım | Ne yaptığını anlatamıyor | Devreyi ve kodu adım adım anlatıyor | Hata yapıp nasıl bulduğunu anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta kartın dış dünyayı "duymasıdır". Öğrencinin kafası en çok "basınca neden LOW?" ve "neden bir basış birden çok sayılabilir?" sorularında karışır; bunlar normal ve öğreticidir.
- **Nasıl destek olunur?** Cevabı söylemek yerine sor: "Butona basmadığında pin kaç volt?", "Kod bir önceki durumu nerede saklıyor?", "Seri monitörde ne görüyorsun?" Seri monitör, ne olduğunu gözle görmenin en iyi yoludur.
- **Sıçrama.** Laboratuvardaki buton temiz sinyal verir; öğrenci sıçramayı ekranda göremeyebilir. Gerçek bir butona geçildiğinde sorun ortaya çıkacağı için debounce'u yine de öğrenmek gerekir.
- **Süre.** Dersleri aynı gün peş peşe yapmak yerine aralıklı çalışmak kalıcılığı artırır. Debounce ve seri iletişim dersleri yoğundur; gerekirse bir günde yalnız birini yapın.
- **Güvenlik.** Bu platformdaki her şey sanaldır. Gerçek kart kullanılacaksa butonlar yalnızca düşük gerilimli hatlara bağlanır; şebeke gerilimiyle (220 V) hiçbir devre kurulmaz.
- **İlerleme.** Dersin sonundaki mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
