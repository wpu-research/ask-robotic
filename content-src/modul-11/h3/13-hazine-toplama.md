# Mağarada elmas avı
süre: 25

## Merak
Bir haritada bazı karolar sadece duvar ya da zemin değildir. Altın, anahtar, elmas ya da lav olabilir. Bunlara dokunmak bir şey yaptırır. Peki bir elmasa dokununca o elmasın haritadan **kaybolmasını** nasıl sağlarsın? Hangi elmasa dokunduğunu bilgisayar nasıl bilir?

## Etkinlik
Bir mağara haritası hazır: dört elmas ve üç kırmızı lav karosu var. Kedi ok tuşlarıyla yürüyor ama elmaslara ve lava dokununca hiçbir şey olmuyor. Başlangıçta skor 0 ve can 3.

### Olay karosu
Karoya dokununca çalışan bir olayın içinde dokunulan karonun yerini öğrenebilirsin:
- `olay karosunun [sütunu]`
- `olay karosunun [satırı]`

Bu iki sayıyı `sütun [0] satır [0] karosunu boşalt` bloğuna verirsen tam o karo kaybolur. Diğer elmaslar yerinde kalır.

### Elmasları topla
1. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Elmas] karosuna dokununca` olayını çalışma alanına bırak. Karo olarak **Elmas**'ı seç.
2. İçine `sütun [0] satır [0] karosunu boşalt` bloğunu tak. Sütun yuvasına `olay karosunun [sütunu]`, satır yuvasına `olay karosunun [satırı]` bloklarını koy.
3. **Oyun** kategorisinden `skoru [1] değiştir` ve **Ses** kategorisinden `[puan] melodisini çal` bloklarını ekle.
4. ▶ düğmesine bas. Elmaslara dokun: kaybolur, skor artar.

### Hepsi toplanınca kazan
1. Olayın en altına **Mantık** kategorisinden `eğer [koşul] ise` bloğunu tak.
2. Koşul için **=** karşılaştırma bloğunu al. Sol yuvaya `haritadaki [Elmas] karo sayısı` bloğunu, sağ yuvaya 0 sayısını koy.
3. `eğer`in içine `ekranda [Bütün elmaslar sende!] yaz, [2] saniye`, `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` bloklarını tak.

### Lav tehlikesi
1. İkinci bir olay getir: `bir [Oyuncu] sprite'ı [Lav] karosuna dokununca`.
2. İçine `canı [-1] değiştir`, `ekranı [250] ms salla` ve `[patlama] melodisini çal` bloklarını tak.
3. Son olarak `[bu sprite] sprite'ını sütun [1] satır [1] karosuna koy` bloğunu ekle. Böylece kedi lava dokununca başlangıç karosuna geri gönderilir.
4. ↺ düğmesine bas. Lava dokun ve kedinin geri döndüğünü gör. Sonra bütün elmasları topla.

Beklenen sonuç: Elmasa dokununca elmas kaybolur ve skor artar. Dördüncü elmasta oyun kazanılır. Lava dokununca bir can gider ve kedi başa döner.

### Nasıl çalışıyor?
- Her elmasa dokunulduğunda aynı olay çalışır ama olay karosunun sütunu ve satırı her seferinde o elmasın yerini söyler.
- `haritadaki [Elmas] karo sayısı` bloğu haritada kaç elmas kaldığını verir. Sıfır olunca hepsi toplanmıştır. Kontrolü karo silindikten **sonra** yaptığın için sayı doğru çıkar.
- Lav olayında `bu sprite` olayı tetikleyen sprite'tır, yani kedi. Bu yüzden kedinin adını yazmana gerek kalmaz.
- Sütun ve satır 0'dan sayılır. Sütun 1, satır 1 kenar duvarının hemen içindeki ilk karodur.

### Dene
1. Kazanma mesajına skoru da yaz: `birleştir` bloğuyla `[Elmaslar: ]` ve `skor`.
2. Lav `canı [-2] değiştir` desin. Oyun zorlaştı mı?
3. Harita sekmesinde yeni bir elmas boya (karo takımından **Elmas**'ı seç). Kazanma hâlâ doğru çalışıyor mu? Neden?

### Sık yapılan hatalar
- Karoyu boşaltan bloğa sabit sayılar yazarsan hep aynı karo silinir. Olay karosunun sütun ve satırını kullan.
- Elmas ve lav karolarının **duvar** kutusunu işaretleme. Duvar olan karonun içine kedi giremez ve toplama garip görünür.
- Kazanma kontrolünü karo silinmeden önce yaparsan sayı bir fazla çıkar ve oyun hiç kazanılmaz.
- Lavın başlangıç karosuna ışınlama bloğunu unutursan kedi lavın üstünde kalır ve canı bir kez kaybeder.

## Konuşalım
Haritadaki karoların farklı işlevleri olması (duvar, tehlike, ödül) oyuna ne katıyor? Sen bir mağara tasarlasan hangi karolara hangi görevleri verirdin?
