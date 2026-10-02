# Proje: Zar oyunu skor panosu
süre: 35

## Merak
Masa oyunlarında zar atılır, puan toplanır, kazanan belli olur. Hep birinin hesap tutması gerekir. Bu projede kartın hem zarı atacak hem de puanı toplayacak, hatta 6 gelince zafer müziği çalacak. Böylece oyun masasının tek yardımcısı olacak!

## Etkinlik
### Proje: Zar oyunu skor panosu
Bu hafta öğrendiğin her şeyi birleştireceksin: düğme olayları, değişkenler, rastgele sayı ve eğer.

**Kurallar:**
- **A:** zar atar, sonucu ekranda gösterir ve **toplam** puana ekler. 6 gelirse zafer ezgisi çalar.
- **B:** toplam puanı gösterir.
- **A+B:** toplamı sıfırlar ve ekranda 0 gösterir.

### Yeni blok: ezgiyi çal
**Müzik** kategorisindeki **ezgiyi çal [Neşe ezgisi]** bloğu hazır bir müzik parçası çalar. Listeden **Zafer** seç. Ezgi bitene kadar sonraki blok bekler. Ses sanal hoparlörden gelir. Tarayıcın ses vermek için sayfada bir kez tıklama bekler. Ses duymuyorsan kartın sağ panelindeki **Hoparlör** bölümünde **Ses açık** yazdığına bak.

### Adım adım
Editörde **başlangıçta**, A, B ve A+B blokları hazır. **zar** ve **toplam** değişkenleri de hazır.

1. **A düğmesi:**
   1. **zar değerini [0] yap** bloğunu koy, içine **[1] ile [6] arasında rastgele sayı** tak.
   2. Altına **toplam değerine [1] ekle** bloğunu koy. Sayı yerine **zar** değişkenini tak.
   3. **sayıyı göster** bloğunu ekle, içine **zar** koy.
   4. **eğer ... ise** bloğu ekle: koşul **zar = 6**.
   5. Eğer'in içine **Müzik** kategorisinden **ezgiyi çal** bloğunu koy ve **Zafer** seç.
2. **B düğmesi:** içine **sayıyı göster** koy, **toplam** değişkenini tak.
3. **A+B düğmesi:** **toplam değerini [0] yap**, sonra **sayıyı göster** ile 0'ı (ya da **toplam**) göster.
4. ▶ **Çalıştır**. A'ya en az beş kez bas, 6 gelene kadar devam et. Sonra B'ye, en sonda A+B'ye bas.

### Beklenen sonuç
A'ya her basışta ekranda yarım saniye kadar 1 ile 6 arası bir rakam görünür. 6 gelince zafer ezgisi çalar. B'ye basınca o ana kadarki toplam kayarak görünür (örneğin 17). A+B'ye basınca ekranda 0 görünür. Hedefler kutusundaki beş görevin hepsi ✓ olmalı.

### Nasıl çalışıyor?
- **zar** o anki atışı, **toplam** bütün atışların toplamını tutar. Her atışta **toplam değerine zar ekle** ile toplam büyür.
- **eğer zar = 6 ise** bloğu zafer müziğini yalnızca 6 gelince çalar. Başka sayıda atlanır.
- **başlangıçta** bloğu toplamı sıfırlar. Böylece her çalıştırma sıfırdan başlar.
- Ezgi çalarken A bloğu bitene kadar bekler. Ezgi bitmeden yeni bir A'ya basarsan, yeni basış sıraya girer.
- **JavaScript** sekmesinde bütün programı oku: `toplam += zar;` satırını bulabilir misin? Bloktaki "ekle" kelimesinin kod karşılığı budur.

### Dene
1. Toplam 30'u aşınca ekranda mutlu yüz çıksın. İpucu: A'ya bir **eğer toplam > 30 ise** bloğu daha ekle.
2. B'ye uzun basış olarak bir "puanı sıfırla" ekle. İki ayrı sıfırlama yolu olsun.
3. Zafer için başka bir ezgi seç. Hangisi sana daha çok zafer müziği gibi geliyor?

### Sık yapılan hatalar
- **Toplamı sıfırlamayı unutmak.** Yeni oyuna başlarken A+B ile toplamı sıfırlamazsan eski oyunun puanı üzerine eklenir.
- **Zarı iki kez atmak.** Hem göstermek hem toplamak için **zar** kutusunu kullan; iki ayrı rastgele blok koyma. Yoksa ekrandaki sayı ile toplanan sayı farklı olur.
- **6'yı beklemeden pes etmek.** 6 her atışta gelmez. Zafer ezgisini duymak için birkaç kez bas.
- **Ses duyamayınca hata aramak.** Hoparlör kapalı olabilir. Sağ paneldeki **Hoparlör** bölümüne bak.

## Konuşalım
Oyununa hangi kuralı eklemek istersin? Mesela 1 gelince puan sıfırlansın mı? Kuralları değiştirdikçe oyun nasıl daha eğlenceli ya da daha zor oluyor?
