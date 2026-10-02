# İki kartla sohbet
süre: 22

## Merak
Mesajlaşırken emoji yollarsın: kalp, gülen yüz, üzgün yüz. Emoji aslında küçük bir resimdir ama telefon onu bir sayı olarak yollar ve karşı taraf o sayıyı yine resme çevirir. İki Mikro Kart arasında aynı numarayı sen de yapabilirsin. Bu derste iki kart, birbirine kalp ve yüz simgeleri yollayan küçük bir sohbet uygulaması olacak.

## Etkinlik
### Fikir
Her simgeye bir sayı verelim ve bu sayıyı radyoyla yollayalım:

| Sayı | Simge | Hangi tuş yolluyor? |
|---|---|---|
| 1 | kalp | A |
| 2 | mutlu yüz | B |
| 3 | üzgün yüz | A+B |

Alan kart sayıyı görünce karşılık gelen simgeyi gösterir ve küçük bir ses çalar. İki kart da aynı programı çalıştırdığı için her iki yön de çalışır.

### Yeni fikir: değişkenle okumak
**alınan [sayı]** bloğu mesaj geldiğinde okunur. Bu sayıyı birden çok yerde karşılaştıracaksan önce bir değişkene (**mesaj**) koymak daha düzgündür. Böylece her karşılaştırmada **alınan** bloğunu tekrar tekrar bulman gerekmez.

Üç ihtimali kontrol etmek için **eğer ... ise ... değilse** bloklarını iç içe koyacaksın: "sayı 1 mi? Değilse sayı 2 mi? Değilse (o zaman 3)".

### Adım adım
Editörde **başlangıçta**, **düğme [A] [basılınca]**, **düğme [B] [basılınca]**, **düğme [A+B] [basılınca]** ve **radyo mesajı alınınca** hazır.

1. **başlangıçta** içine **radyo grubunu [1] yap** koy.
2. **düğme [A] [basılınca]** içine **radyoyla sayı gönder [1]**, **düğme [B] [basılınca]** içine **radyoyla sayı gönder [2]**, **düğme [A+B] [basılınca]** içine **radyoyla sayı gönder [3]** koy.
3. **Değişken** kategorisinde **mesaj** adlı bir değişken oluştur.
4. **radyo mesajı alınınca** içine sırayla:
   - **mesaj değerini [0] yap**. Sıfır yerine **alınan [sayı]** tak.
   - **eğer ... ise ... değilse**. Koşul: **mesaj** **=** **1**. **ise**: **simgeyi göster [kalp]**.
   - **değilse** kolunun içine ikinci bir **eğer ... ise ... değilse** koy. Koşul: **mesaj** **=** **2**. **ise**: **simgeyi göster [mutlu yüz]**. **değilse**: **simgeyi göster [üzgün yüz]**.
   - **Müzik** kategorisinden **ezgiyi çal [Kuş cıvıltısı]**.
5. ▶ **Çalıştır**. Kart 1'de **A**'ya, sonra Kart 2'de **B**'ye, sonra yine Kart 1'de **A+B**'ye bas.

### Beklenen sonuç
Kart 1'in **A**'sı Kart 2'de kalp gösterir. Kart 2'nin **B**'si Kart 1'de mutlu yüz gösterir. Kart 1'in **A+B**'si Kart 2'de üzgün yüz gösterir. Her mesajdan sonra kuş cıvıltısı çalar (yaklaşık 1,25 saniye). Yedi hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Gönderen mesajı alamaz; mesaj yalnız gruptaki öteki karta gider.
- İç içe **eğer** zinciri sırayla bakar. İlki tutarsa diğerlerine hiç bakılmaz.
- **ezgiyi çal** bloğu bitene kadar bekler. O sırada başka mesaj gelirse sıraya girer; aynı başlık için en çok 3 mesaj sırada bekler.

### Dene
1. Dördüncü bir simge ekle: **düğme [A] [uzun basılınca]** başlığı **4** göndersin, alan kart **güneş** göstersin. (**eğer** zincirine bir kol daha eklemen gerekir.)
2. Kuş cıvıltısı yerine her simge için ayrı bir ezgi seç: kalp için **Neşeli**, üzgün yüz için **Üzgün** ezgisi.
3. Kendi mesajını da ekranında görmek için gönderen taraf da simgeyi **göstersin**. Hangi başlığın içine koymalısın?

### Sık yapılan hatalar
- **İkinci eğer'i değilse kolunun dışına koymak.** O zaman "değilse" kolunda mutlu yüz görünmez.
- **Ayrı sayı yerine hep 1 göndermek.** Alan kart hangi tuşa basıldığını anlayamaz.
- **Mesajı hiç okumamak.** **mesaj** değişkenine **alınan [sayı]** koymazsan değişken sıfır kalır ve hep üzgün yüz görünür.

## Konuşalım
Sayıları simgelere çevirmek bir tür "anlaşma" değil mi? Karşı taraf da senin tablonu bilmeseydi mesajı nasıl anlardı? Bu "ortak tablo" fikri gerçek mesajlaşma uygulamalarında nerede karşımıza çıkar?
