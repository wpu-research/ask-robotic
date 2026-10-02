# Proje: Hazine adası
süre: 35

## Merak
Bu haftanın bütün parçalarını birleştirip uzun bir macera yapıyoruz. Kahraman bir adada başlıyor. Önce kapıyı açacak anahtarı bulacak, lavlardan sakınacak, elmasları toplayacak ve sonunda hazine sandığına ulaşacak. Her şey haritanın karolarıyla yapılıyor.

## Etkinlik
Adanın haritası hazır: 20 x 10 karo. Kahraman başlangıç karosunda, ok tuşlarıyla yürüyor ve kamera onu izliyor. Skor 0, can 3. Ama hiçbir karo bir şey yapmıyor. Kuralları sen yazacaksın.

### Haritadaki karolar
- **Taş duvar:** Ortada bir duvar var ve adayı ikiye bölüyor.
- **Kapı:** Duvarın içindeki geçit. Başlangıçta duvar gibi kapalı. Yeri: sütun 10, satır 5 (sütun ve satır 0'dan sayılır).
- **Anahtar:** Sol yarıda bir yerde. Kapıyı açar.
- **Lav:** Sol yarıda üç tane lav karosu var.
- **Elmas:** Üç elmas var, ikisi sağ yarıda ve biri sol yarıda.
- **Su:** Sağ yarıda bir su şeridi var. Su duvar gibi davranır, geçemezsin.
- **Sandık:** Hazine sandığı, sağ yarıda bir yerde.

### Kurallar
1. Anahtara dokununca anahtar kaybolsun ve kapı açılsın.
2. Elmasa dokununca elmas kaybolsun ve skor 1 artsın.
3. Lava dokununca 1 can gitsin ve kahraman başlangıca dönsün.
4. Sandığa dokununca "Hazineyi buldun! Skor: ..." yazsın ve oyun kazanılsın.

### Önce incele
1. ▶ düğmesine basıp adayı dolaş. Kahraman duvarlardan ve sudan geçemez. Haritanın her yerine gidemiyorsun, çünkü kapı kapalı.
2. **Harita** sekmesine geç ve karoların yerlerini incele. Anahtar, kapı ve sandık nerede?

### Anahtar ve kapı
1. **Sahne / Harita** kategorisinden `bir [Oyuncu] sprite'ı [Anahtar] karosuna dokununca` olayını koy.
2. İçine `sütun [olay karosunun sütunu] satır [olay karosunun satırı] karosunu boşalt` bloğunu tak. Böylece anahtar kaybolur.
3. Altına ikinci bir `sütun [10] satır [5] karosunu boşalt` bloğu ekle. Bu, kapıyı açar. Sayıları kendin yaz.
4. `ekranda [Kapı açıldı!] yaz, [2] saniye` ve `[güç] melodisini çal` bloklarını ekle.

### Elmaslar
1. `bir [Oyuncu] sprite'ı [Elmas] karosuna dokununca` olayını koy.
2. İçine olay karosunu boşaltan blok, `skoru [1] değiştir` ve `[puan] melodisini çal` bloklarını koy.

### Lav
1. `bir [Oyuncu] sprite'ı [Lav] karosuna dokununca` olayını koy.
2. İçine `canı [-1] değiştir`, `ekranı [250] ms salla`, `[patlama] melodisini çal` ve `[bu sprite] sprite'ını sütun [1] satır [1] karosuna koy` bloklarını tak.

### Sandık ve kazanma
1. `bir [Oyuncu] sprite'ı [Sandık] karosuna dokununca` olayını koy.
2. İçine `ekranda [birleştir ...] yaz, [3] saniye` bloğunu ekle. Birleştir bloğuna önce `[Hazineyi buldun! Skor: ]` metnini, sonra `skor` bloğunu koy.
3. `[zafer] melodisini çal` ve `oyunu bitir: [kazandın]` bloklarını ekle.

### Çalıştır ve dene
1. ↺ düğmesine bas. Önce lavlardan birine dokun. Sonra anahtarı al, kapıdan geç, elmasları topla ve sandığa ulaş.
2. Hedefler panelindeki altı maddenin hepsi yeşil mi?

Beklenen sonuç: Anahtarı alınca kapı açılır. Elmaslar skoru artırır. Lav can götürüp başa gönderir. Sandığa dokununca skorlu bir mesajla oyun kazanılır.

### Nasıl çalışıyor?
- Bu oyunun her kuralı bir **karo olayıdır**. Haritanın karoları oyunun kurallarını taşır. Yeni bir kural eklemek için yalnız yeni bir karo çizip bir olay yazarsın.
- Anahtar-kapı sistemi, bir olayın başka bir yeri değiştirmesinin örneğidir: anahtara dokunmak başka bir yerdeki kapıyı yok eder.
- Kapı başlangıçta **duvar kutusu işaretli** bir karodur. Karo silinince duvar da kaybolur ve yol açılır.
- Kamera adanın dışını göstermez. Harita 320 x 160 piksel olduğundan ekran yalnız bir bölümü görür.

### Kendi dokunuşunu kat
1. Haritayı düzenle: Harita sekmesinde yeni bir lav, elmas ya da duvar boya. Sandığa giden yol hâlâ açık mı?
2. Lav daha çok can götürsün ya da başlangıç canı 5 olsun.
3. Elmas toplayınca `ekranda [Parlak!] yaz, [1] saniye` mesajı çıksın.
4. Kapıyı daha kalın bir duvarla kapat ve anahtarı daha uzağa koy. Oyun zorlaştı mı?

### Sık yapılan hatalar
- Kapı için sütun ve satırı yanlış yazarsan başka bir karo silinir. Harita sekmesinde sütun ve satırı say; ilk karo 0'dır.
- Anahtar olayında olay karosunu silmeyi unutursan anahtar yerinde kalır ve hedef yeşile dönmez.
- Skor mesajında `birleştir` bloğunun yuvalarını doldurmayı unutursan mesaj eksik çıkar.
- Lavda `[bu sprite]` yerine başka bir sprite adı yazarsan yanlış sprite taşınır.

## Konuşalım
Bir haritayı oyun yapan şey nedir? Karoların görevleri mi, yoksa bloklarla yazdığın olaylar mı? Hazine adasına başka hangi karo türleri eklersen oyun daha ilginç olur?
