# Proje: Akıllı saksı (final)
süre: 40

## Merak
Hepsini birleştirme zamanı. Bu modülde LED'leri yakmayı, düğmeleri dinlemeyi, sensörleri okumayı, müzik çalmayı ve radyoyla konuşmayı öğrendin. Şimdi hepsini aynı projede kullanacaksın: iki akıllı saksı, birbirinin durumunu radyoyla izliyor. Birinin toprağı kuruyunca öteki saksı bunu görüp alarm veriyor.

## Etkinlik
### Proje: Akıllı saksı
İki kart, iki sanal saksıdır. Her kartın **P1** pinine bir toprak nemi sensörü bağlı sayılır (Pinler bölümündeki **Giriş** kaydırıcısı, 0 kuru, 1023 ıslak). İki kart da aynı programı çalıştırır.

**Hedefler:**
- Kart iki saniyede bir kendi nemini yüzde olarak ölçsün ve radyoyla **nem** adıyla göndersin.
- Mesajı alan kart nem 30'un altındaysa üzgün yüz göstersin ve üzgün ezgi çalsın.
- Nem 30 ya da üstündeyse alan kart nemi çubuk grafikle göstersin.
- **A** düğmesi kartın kendi nemini göstersin.

### Hangi ders hangi parçayı veriyor?
| Parça | Nerede öğrendin |
|---|---|
| **her [2000] ms'de**, değişkenler, **eğer** | önceki haftalar |
| **eşle** ile 0-1023'ü yüzdeye çevirmek | 29. ders |
| **çubuk grafik** | 29. ders |
| **radyo grubu**, **radyoyla [ad] = [değer] gönder**, **alınan [ad]**, **alınan [değer]** | 22. ders |
| **ezgiyi çal [Üzgün]**, **simgeyi göster [üzgün yüz]** | 18. ders ve ilk hafta |

### Planını çiz
Önce kâğıda ya da aklına bir akış çiz:

1. **Başlangıç:** radyo grubu 7, **nem** değişkeni 0.
2. **Her 2 saniyede:** nemi ölç, radyoyla **nem = değer** gönder.
3. **A:** nemi ölç ve ekranda göster.
4. **Mesaj alınınca:** adı **nem** ise değeri **uzak** değişkenine koy. 30'dan küçükse üzgün yüz ve ezgi; değilse çubuk grafik.

### Adım adım
Editörde **başlangıçta**, **her [2000] ms'de**, **düğme [A] [basılınca]** ve **radyo mesajı alınınca** hazır.

1. **Değişken** kategorisinde **nem** ve **uzak** değişkenlerini oluştur.
2. **başlangıçta** içine **radyo grubunu [7] yap** ve **nem değerini [0] yap** koy.
3. **her [2000] ms'de** içine **nem değerini [...] yap**; değer olarak **eşle** bloğu: **[P1 analog oku (0-1023)] değerini [0]-[1023] aralığından [0]-[100] aralığına eşle**. Altına **radyoyla [nem] = [...] gönder** koy; adı **nem**, değer olarak **nem** değişkeni.
4. **düğme [A] [basılınca]** içine **nem değerini [...] yap** (aynı eşle bloğu) ve **sayıyı göster [nem]** koy.
5. **radyo mesajı alınınca** içine **eğer ... ise** koy. Koşul: **alınan [ad]** **=** **nem**. İçine sırayla:
   - **uzak değerini [...] yap**; değer olarak **alınan [değer]**
   - **eğer ... ise ... değilse**. Koşul: **uzak** **<** **30**. **ise**: **simgeyi göster [üzgün yüz]** ve **ezgiyi çal [Üzgün]**. **değilse**: **çubuk grafik [uzak] / en çok [100]**.
6. Hazırlık: sağ panelde **Kart 1** sekmesini seç ve **Pinler** bölümünde **P1 Giriş**'i yaklaşık 512 yap. **Kart 2** sekmesini seç ve **P1 Giriş**'i 100 yap.
7. ▶ **Çalıştır**. Birkaç saniye bekle. Kart 1'in **A** düğmesine bas.

### Beklenen sonuç
Kart 1'in nemi %50, Kart 2'nin nemi %10'dur. Kart 2, Kart 1'den **nem = 50** mesajı alınca yarısı dolu bir çubuk grafik gösterir (13 LED). Kart 1, Kart 2'den **nem = 10** mesajını alınca üzgün yüz gösterir ve **Üzgün** ezgisi çalar (3 saniye). **A** düğmesi Kart 1'de **50** sayısını gösterir. Altı hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Her kart iki saniyede bir kendi nemini yollar. Mesajı alan taraf, **nem** adını görünce değeri **uzak** değişkenine koyar.
- Bir kart kendi mesajını almaz. Bu yüzden her kart yalnız **öteki** saksının durumunu görür.
- Üzgün ezgi 3 saniye sürer ve iki saniyelik mesajlardan uzundur. Ezgi bitene kadar başlık meşgul olur; aynı başlık için en çok 3 mesaj sırada bekler.
- Kartlar aynı programı çalıştırdığı için programı bir kez değiştirmen yeterlidir. ▶ düğmesine basınca iki kart da yeni programı çalıştırır.

### Dene
1. **B** düğmesi sıcaklığı göstersin; sıcaklık 35 °C'nin üstündeyse ekranda **şaşkın yüz** olsun.
2. Radyo grubunu bir kartta farklı yapamazsın (program aynı), ama Radyo bölümündeki **Kart 2 grubu** seçicisinden 5 yapabilirsin. Kart 1'in mesajları Kart 2'ye ulaşıyor mu?
3. Işığı da ölç: karanlıkta (ışık 50'nin altı) mesajı gönderme.
4. Kendi eşiğini seç ve bunu bir değişkene (**esik**) koy; programın bir yerinde değiştirmen yeterli olsun.

### Sık yapılan hatalar
- **Mesajın adını farklı yazmak.** Gönderen **nem**, alan **Nem** yazarsa eşit çıkmaz. Harfi harfine aynı yaz.
- **Alan kartta nemi yeniden ölçmek.** Mesaj gelince **alınan [değer]** kullan. Kendi P1'inden okursan öteki saksının durumunu değil kendi durumunu görürsün.
- **Çubuk grafiğin en çok değerini 1023 bırakmak.** Nem artık yüzde olduğu için **100** olmalı.
- **Değişkenleri başlangıçta ayarlamamak.** İlk mesajdan önce **uzak** boş kalmasın.

### Kendini değerlendir
- Bu projede en çok hangi blok grubunu kullandın?
- Hangi parçada takıldın? Nasıl çözdün?
- Programı bir arkadaşına açıklasan hangi üç cümleyi söylerdin?

## Konuşalım
Bu projede yaptığın en güzel şey neydi? Bir sonraki Mikro Kart projen ne olurdu: bir oyun mu, bir ev alarmı mı, yoksa bir müzik aleti mi? Kimle paylaşırdın?
