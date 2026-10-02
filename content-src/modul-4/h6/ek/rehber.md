### Hafta hedefleri
Bu haftanın sonunda öğrenci:
1. IR kumandanın mesajı ışığın süreleriyle taşıdığını, NEC mesajının yapısını (ön darbe, 32 bit, ters kopyalar) ve bitleri boşluk süresinden okumayı açıklayabilir.
2. 4x4 tuş takımının matris mantığıyla 8 pinle nasıl okunduğunu anlatabilir; `getKey()` ile rakam biriktirip `strcmp` ile PIN'i doğrulayan program yazabilir.
3. RFID'in ve UID'nin ne olduğunu, SPI'nin dört telini ve UID'nin neden tek başına parola sayılmayacağını söyleyebilir; projenin pin ihtiyacını önceden hesaplayabilir.
4. PIN ve kart listesini EEPROM'da sabit adreslerle tutabilir; kurulum işareti, `EEPROM.update` ve "sayacı en son yaz" kuralının nedenini açıklayabilir.
5. KILITLI, ACIK ve BLOKE durumlarından oluşan, hiç `delay` kullanmayan bir kapı kilidini kurup test edebilir.

### Haftanın planı
Hafta beş derstir; ilk dört ders 30-35 dakika, proje yaklaşık 40 dakika sürer. Plan günde bir ders içindir. Dördüncü dersten sonra bir gün ara vermek proje için iyi olur.

| Gün | Ders | Süre | Ne yapılır |
|---|---|---|---|
| 1 | IR alıcı ve kumanda kodları | ~30 dk | Anlatımı oku, NEC tablosunu incele, butonla darbe süresini ölç, çözücü sketch'ini çalıştır, mini testi çöz. |
| 2 | Keypad 4x4: şifre girişi | ~30 dk | Tuş takımını kur, her tuşun harfini seri monitörde gör, PIN programını dene. |
| 3 | RFID RC522 (SPI): kart okuma | ~30 dk | SPI pinlerini ve pin bütçesi tablosunu incele, `KART:AABBCCDD` ile seri taklidi dene. |
| 4 | Yetki yönetimi: kart + şifre + EEPROM | ~35 dk | EEPROM haritasını çiz, `EKLE`, `SIL`, `LISTE` komutlarını dene, yeniden başlatıp listenin kaldığını gör. |
| 5 | Proje: Akıllı kapı kilidi | ~40 dk | Devreyi kur, durum tablosunu kontrol et, deneme senaryosunun yedi adımını uygula, ölçütle değerlendir. |

### Ön koşul kontrolü
Başlamadan önce şunlara bak:
- `INPUT_PULLUP` ile buton okumayı biliyor mu? (Modül 3, ders 6-7)
- `millis()` ile bloklamayan zamanlamayı ve durum makinesini görmüş mü? (Ders 27-28)
- Servoyu `write` ile döndürmeyi biliyor mu? (Ders 21)
- I2C LCD'yi ve EEPROM'u daha önce kullandı mı? (Ders 32-34)
- `pulseIn` ile süre ölçmeyi hatırlıyor mu? (Ders 37)
- Seri monitörden satır gönderme kutusunu ve ▶ ile ■ düğmelerini kullanabiliyor mu?

### Kavram haritası
- **IR iletişim:** 38 kHz taşıyıcı → ters çıkış (darbe LOW) → NEC → boşlukla bit → `uint32_t` ve bit kaydırma → ters kopya ile hata denetimi
- **Girdi:** tuş matrisi → tarama → `getKey()` → `char` dizisi ve `'\0'` → `strcmp`
- **Kimlik:** RFID → UID → SPI (SCK, MOSI, MISO, SS) → 3,3 V → seri taklit
- **Kalıcılık:** EEPROM haritası → kurulum işareti → `EEPROM.update` → sayacı en son yaz → master PIN
- **Proje:** kural → durum tablosu → `durum` değişkeni → `millis()` ile süre → ortak hata sayacı → ayrı servo beslemesi

### Sık yapılan hatalar
- **`pulseIn(LOW)` ve `pulseIn(HIGH)` karıştırmak.** IR alıcı ters çalışır: boşta HIGH, darbede LOW.
- **32 bit için `int` kullanmak.** Uno'da `int` 16 bittir; `(uint32_t)1 << i` yaz.
- **Tuş takımı satır ve sütunlarını ters yazmak.** Her tuşu sırayla seçip seri monitörde ne yazdığına bak.
- **Yazıları `==` ile karşılaştırmak.** İçerik için `strcmp` (UID gibi baytlar için `memcmp`) kullanılır.
- **Diziyi `'\0'` için bir fazla boyutlandırmamak.** 4 haneli PIN için `char girilen[5]`.
- **Gerçek RC522'yi 5 V ile beslemek.** Modül 3,3 V ister.
- **UID'yi parola sanmak.** UID okunabilir ve taklit edilebilir; kart PIN ile birlikte kullanılır.
- **Sayacı kayıttan önce artırmak.** Yarım yazılmış kart yetkili görünebilir.
- **Servoyu D6 gibi keypad pinlerinde bırakmak.** D2-D9 bu hafta tuş takımına aittir; servo D10'a taşınır.
- **`delay` ile kapıyı açık tutmak ya da bloke beklemek.** Tuşlar ve seri komutlar kaçar, ekran donar.

### Hafta sonu tekrarı
1. Her dersin kavram kartlarını bir kez daha oku ve "sık yapılan yanlış" satırlarını yüksek sesle söyle.
2. Yanlış yaptığın mini test sorularının açıklamasını oku, sonra soruyu yeniden çöz.
3. Bir NEC mesajının neden her zaman yaklaşık 68 ms sürdüğünü kendi cümlelerinle açıkla.
4. Bir EEPROM haritası çiz: 12 kart sığabilsin diye hangi adresleri değiştirmen gerekir? (İpucu: her kart 4 bayt.)
5. Kendi evin için bir kapı kilidi kuralı yaz: kaç yanlışta, kaç saniye bloke olsun? Durum tablosuna dök.
6. Kapı kilidi projesinde bloke süresini her seferinde iki katına çıkaracak bir değişiklik tasarla.

Hafta sonu testi olarak beş dersin mini testleri yeterlidir: her derste 5 soru, toplam 25 soru. Hedef: her dersten en az 4 doğru. Eksik kalan dersin anlatımına dön.

### Proje değerlendirme ölçütü (Akıllı kapı kilidi)
| Ölçüt | Gelişmeli | Yeterli | İleri |
|---|---|---|---|
| Devre | Parçalar eksik ya da pinler keypad ile çakışıyor | Keypad, servo, buzzer, iki LED ve LCD doğru pinlerde; servo D10'da | Pin bütçesini ve neden kart okuyucunun seri taklit edildiğini açıklıyor |
| Durum makinesi | Durumlar karışık, kapı açık kalıyor | KILITLI, ACIK ve BLOKE doğru geçişlerle çalışıyor | Durum tablosunu çizmiş ve kodla birebir uyuşuyor |
| Zamanlama | `delay` kullanıyor, bloke sırasında tuşlar donuyor | Açık kalma 5 sn, bloke 30 sn, `millis()` ile | Süreleri değiştirip etkisini açıklıyor; taşmaya dayanıklı karşılaştırmayı biliyor |
| Yetki | PIN ve kart ayrı sayaçlarla çalışıyor | PIN ve kart ortak sayaçta; yönetim komutları master PIN ister | Bloke süresini artıran bir kural ekledi ya da fabrika PIN'lerini değiştirdi |
| Geri bildirim | Ekran ve buzzer olaylarla uyuşmuyor | LCD, LED ve buzzer her olayı gösteriyor | Mesajları Türkçe karaktersiz ve 16 karaktere sığacak biçimde tasarlamış |
| Güvenlik bilinci | Açıkları düşünmedi | Seri portun yönetim açığı olduğunu fark etti | Gerçek üründe neyin değişeceğini (ayrı besleme, deneme sınırı, seri yönetimi kapatma) anlatıyor |

### Veli ve öğretmen notu
- **Amaç.** Bu hafta birçok bilgiyi bir araya getirme haftasıdır: tuş takımı, kart, EEPROM, servo ve ekran. Öğrenci hepsini ezberlemek zorunda değildir; önemli olan planı yazılı bir tabloya dökmeyi ve parçaları tek tek sınayıp birleştirmeyi öğrenmesidir.
- **Dürüstlük notu.** Laboratuvarda kart okuyucu ve IR kumanda parçası yoktur. Kart seri monitörden taklit edilir; IR için buton kullanılır. Bu, bilerek seçilmiş bir test yöntemidir ve gerçek donanım yerine geçmez. Öğrenciye bunu açıkça söyleyin.
- **Nasıl destek olunur?** Takıldığında cevabı söylemek yerine şunu sorun: "Şu an kapı hangi durumda?", "Seri monitör ne yazıyor?", "Hangi pini iki parçaya birden verdin?"
- **Güvenlik.** Her şey sanaldır. Gerçek bir kapıyı etkileyen sistem kurulacaksa şebeke gerilimiyle (220 V) doğrudan çalışılmaz; yönetim PIN'leri ve deneme sınırı gerçek üründe zorunludur. Fabrika PIN'lerinin (1234 ve 9999) gerçek bir kilitte kullanılmayacağını vurgulayın.
- **Süre.** Dersleri aralıklı yapmak kalıcılığı artırır; dördüncü ders yoğundur, gerekirse iki oturuma bölün.
- **İlerleme.** Mini test sonuçları "İlerlemem" sayfasında beceri bazında görünür (taslak/pilot özellik; yalnız onay verildiyse kaydedilir).
