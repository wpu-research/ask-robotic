# İvmeölçer: salla ve yatır
süre: 20

## Merak
Telefonunu yatay çevirdiğinde ekran kendiliğinden döner. Bazı uygulamalar telefonu sallayınca geri alır, bazı oyunlarda arabayı telefonu eğerek sürersin. Telefonun içindeki **ivmeölçer** denen bir parça, hareketi ve eğimi hisseder. Kartın da bir ivmeölçeri var. Onunla bir "sihirli top" yapalım!

## Etkinlik
### İvmeölçer ne hisseder?
İvmeölçer kartın hareketini ve **hangi yöne yattığını** ölçer. Ölçümler üç eksende verilir:

- **x:** kartın sola (eksi) ve sağa (artı) yatması
- **y:** kartın arkaya (eksi) ve öne (artı) yatması
- **z:** kartın yüzünün yukarı (artı) ya da aşağı (eksi) bakması

Değerler **milli-g** cinsindendir. Kart yüzü yukarı dururken yerçekimi z ekseninde yaklaşık 1024 ölçer. Yani (x, y, z) = (0, 0, 1024).

Sanal kartta kartın sağındaki **Hareket (ivmeölçer)** bölümünde şunları bulursun:

- Düğmeler: **Salla**, **Sola yatır**, **Sağa yatır**, **Öne yatır**, **Arkaya yatır**, **Yüzü yukarı**, **Yüzü aşağı**, **Serbest düşüş**.
- Üç kaydırıcı: **x (yan)**, **y (ön-arka)**, **z (yüz)**.
- Altında üç okuma: **güç**, **boy eğimi**, **yan eğim**.

### Hareket blokları
**Giriş** kategorisinde şu bloklar var:

- **kart [sallandığında]:** başlık bloğu. Listeden hareketi seç: sallandığında, sola yatınca, sağa yatınca, öne yatınca, arkaya yatınca, yüzü yukarı bakınca, yüzü aşağı bakınca, serbest düşünce.
- **kart [sallanıyor] mu?:** şu an kart bu durumda mı diye sorar. Doğru ya da yanlış verir.
- **ivme ([güç])** ve **eğim ([boy (öne +)]) derece:** sayı verir.

### Program: sihirli top
Editörde üç **kart ... ** başlık bloğu hazır: sallandığında, sola yatınca, sağa yatınca.

1. **sallandığında** bloğunun içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy (iki çeşit eğer var; "değilse" olanı al).
2. Eğer'in koşul yuvasına **Mantık** kategorisinden **yazı tura (rastgele doğru/yanlış)** bloğunu tak.
3. "ise" kısmına **simgeyi göster**, listeden **evet** seç. "değilse" kısmına **simgeyi göster**, **hayır** seç.
4. **sola yatınca** bloğunun içine **simgeyi göster**, **sol ok** seç.
5. **sağa yatınca** bloğunun içine **simgeyi göster**, **sağ ok** seç.
6. ▶ **Çalıştır**.
7. Sanal kartta **Salla** düğmesine bas. Birkaç kez salla. Sonra **Sola yatır**, sonra **Sağa yatır**.

### Beklenen sonuç
Her sallamada rastgele "evet" ya da "hayır" görünür. Sola yatırınca sol ok, sağa yatırınca sağ ok çıkar. Beş hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Bir hareket bloğu, kartın durumu **değiştiği an** çalışır. Kart zaten sola yatıksa **sola yatınca** tekrar çalışmaz; önce başka bir duruma, örneğin **Yüzü yukarı**, dönmen gerekir.
- **Sallama** kısa bir olaydır: kart sallanınca blok hemen çalışır ve yaklaşık yarım saniye boyunca ivme okumaları titrer.
- **yazı tura** her çalıştığında rastgele **doğru** ya da **yanlış** verir. Bu bir yazı tura atmak gibi.
- Bir eksen 700 milli-g'yi geçince kart o yöne yatmış sayılır.

### Dene
1. **Öne yatınca** ve **arkaya yatınca** için de iki blok ekle: yukarı ok ve aşağı ok göstersinler.
2. **Yüzü aşağı bakınca** bloğu ekle ve ekranı temizlet. Kartı ters çevirince ekran söner.
3. Kaydırıcıları elle oynat. **güç** okuması ne zaman büyüyor? Kartı sallarken güç değeri nasıl değişiyor?

### Sık yapılan hatalar
- **Aynı yatışı tekrar tekrar denemek.** Sola yatırdıktan sonra tekrar **Sola yatır** düğmesine basarsan olay yeniden çalışmaz. Önce **Yüzü yukarı** düğmesine bas.
- **"değilse" kolunu atlamak.** Sadece **ise** bölümü olan bir eğer koyarsan yarı yarıya hiçbir şey görmezsin.
- **Kaydırıcıyı az oynatmak.** Kartın yatık sayılması için bir eksenin 700'ün ötesine geçmesi gerekir. Küçük bir kaydırma yatış sayılmaz; hazır düğmeleri kullanmak daha kolay.

## Konuşalım
Telefonunda ya da oyun kolunda hareket algılayan başka neler biliyorsun? Kartı salladığında bir şeyin olmasını istemek ile bir düğmeye basmak arasında sence ne fark var?
