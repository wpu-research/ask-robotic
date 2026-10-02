# Proje: Uzaktan kumanda
süre: 32

## Merak
Oyuncak arabanın kumandasını eğdikçe araba yön değiştirir. Kumanda ile araba aslında iki ayrı alet ve aralarındaki tek bağ bir radyo mesajı: "sola git", "sağa git". Bu projede Kart 1 kumanda, Kart 2 araba olacak. Kumandayı eğdiğinde araba o yöne bir ok gösterecek ve direksiyon servosunu çevirecek.

## Etkinlik
### Proje: Uzaktan kumanda
Bu haftanın bütün fikirlerini birleştireceksin: radyo grubu, sayı gönderme, alma, değişkenle okuma ve iç içe **eğer** zinciri. Üstüne ivmeölçerle eğim algılama ve servo çıkışı ekleniyor.

**Hedefler:**
- Kart 1'i sola, sağa, öne ve arkaya yatırınca 1, 2, 3 ve 4 komutları gitsin.
- Kart 2 komutu alınca ilgili yön okunu göstersin.
- Sola yatırınca servo 45 dereceye, sağa yatırınca 135 dereceye dönsün.
- A düğmesi "dur" komutunu (0) göndersin ve Kart 2 "hayır" simgesini göstersin.

### Komut tablosu
| Komut sayısı | Kumanda hareketi | Araç ekranı | Servo (P0) |
|---|---|---|---|
| 1 | sola yatır | sol ok | 45° |
| 2 | sağa yatır | sağ ok | 135° |
| 3 | öne yatır | yukarı ok | 90° |
| 4 | arkaya yatır | aşağı ok | 90° |
| 0 | A düğmesi | "hayır" simgesi | 90° |

### Yeni bloklar
- **Giriş** kategorisindeki **kart [sola yatınca]** başlığı, kart yatırıldığında çalışır. Listeden **sağa yatınca**, **öne yatınca** ve **arkaya yatınca** seçilebilir.
- **LED** kategorisindeki **oku göster [↑ kuzey]** bloğu sekiz yönden birine bir ok çizer. Biz **← batı** (sol), **→ doğu** (sağ), **↑ kuzey** (yukarı), **↓ güney** (aşağı) kullanacağız.
- **Pinler** kategorisindeki **[P0] servo açısı [90]** bloğu P0 pinine bağlı sanal servoyu 0 ile 180 derece arasında bir açıya çevirir. Kartın yanındaki **Pinler** bölümünde servonun dönmesini görürsün.

### Adım adım
Editörde **başlangıçta**, dört **kart [sola yatınca]** başlığı, **düğme [A] [basılınca]** ve **radyo mesajı alınınca** hazır.

**Kumanda tarafı**
1. **başlangıçta** içine **radyo grubunu [1] yap** koy.
2. **kart [sola yatınca]** içine **radyoyla sayı gönder [1]**; **kart [sağa yatınca]** içine **2**; **kart [öne yatınca]** içine **3**; **kart [arkaya yatınca]** içine **4** koy.
3. **düğme [A] [basılınca]** içine **radyoyla sayı gönder [0]** koy.

**Araba tarafı**
4. **Değişken** kategorisinde **komut** değişkenini oluştur.
5. **radyo mesajı alınınca** içine **komut değerini [0] yap** koy; sıfır yerine **alınan [sayı]** tak.
6. Altına **eğer ... ise ... değilse** zinciri kur:
   - **komut = 1** ise: **oku göster [← batı]** ve **[P0] servo açısı [45]**.
   - değilse **komut = 2** ise: **oku göster [→ doğu]** ve **[P0] servo açısı [135]**.
   - değilse **komut = 3** ise: **oku göster [↑ kuzey]** ve **[P0] servo açısı [90]**.
   - değilse **komut = 4** ise: **oku göster [↓ güney]** ve **[P0] servo açısı [90]**.
   - değilse (yani 0): **simgeyi göster [hayır]** ve **[P0] servo açısı [90]**.

**Deneme**
7. ▶ **Çalıştır**. Sağ paneldeki **Kart 1** sekmesini seç. **Hareket (ivmeölçer)** bölümündeki **Sola yatır**, **Sağa yatır**, **Öne yatır** ve **Arkaya yatır** düğmelerine sırayla bas. Sonra Kart 1'in **A** düğmesine bas.
8. **Kart 2** sekmesine geç, **Pinler** bölümünü aç ve servonun açısına bak.

### Beklenen sonuç
Kart 1'i her yatırışında Kart 2'nin ekranında o yönün oku belirir. Sola ve sağa yatırınca Kart 2'nin **P0** servosu 45° ve 135°'ye döner. **A**'ya basınca Kart 2 "hayır" simgesini gösterir ve servo ortaya (90°) gelir. Dokuz hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- Kart yatınca ivmeölçer yeni bir duruş algılar ve **kart [sola yatınca]** başlığı çalışır. Olay ancak duruş **değişince** çıkar. Aynı yöne iki kez art arda yatırırsan ikinci kez komut gitmez; önce **Yüzü yukarı** ile düzelt.
- Kart 2 de aynı programı çalıştırdığı için Kart 2'yi yatırırsan Kart 1 de bir araba gibi davranır. İki kart birbirini kumanda eder.
- Komut sayıları tablodaki sözleşmedir. Gönderen ve alan taraf aynı tabloyu kullanır; tabloyu değiştirirsen ikisini birden değiştir.
- Sanal portalda gerçek bir motor ya da servo yoktur; **Pinler** bölümündeki sanal servo göstergesi açıyı gösterir.

### Dene
1. **Yüzü yukarı** durumunda da "dur" gitsin: **kart [yüzü yukarı bakınca]** başlığına **radyoyla sayı gönder [0]** koy.
2. Komutu aldığında kısa bir bip çalsın: **[Do] notasını [1/8] vuruş çal** bloğunu **radyo mesajı alınınca** içine ekle.
3. Kumandanın eğim açısını da gönder: **Giriş** kategorisindeki **eğim ([yan]) derece** bloğunu **radyoyla [aci] = [...] gönder** ile yolla ve alan kartta servonun açısını buna göre ayarla.

### Sık yapılan hatalar
- **Kumanda ve araba tablosunu karıştırmak.** Gönderen 1 yollar ama alan 1'i sağ ok sanırsa yanlış yön görürsün.
- **Aynı yöne tekrar yatırmayı komut sanmak.** Duruş değişmedikçe yeni olay üretilmez.
- **Başlığı boş bırakmak.** Bir **kart [sola yatınca]** başlığının içi boşsa o yön hiçbir mesaj göndermez.
- **Servoyu 180'in dışına çevirmeye çalışmak.** Servo açısı 0-180 aralığına çekilir.

## Konuşalım
Kumanda ile araç arasında tek bir şey akıyor: sayılar. Bu çok basit bir yöntem. Gerçek bir araçta bu yöntem nerelerde yetersiz kalırdı? Mesaj kaybolursa ya da yanlış gelirse araç ne yapmalı?
