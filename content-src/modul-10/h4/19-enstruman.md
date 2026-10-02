# Enstrüman yap
süre: 22

## Merak
Bir piyanonun tuşları basılınca ses çıkarır. Peki hiç tuşu olmayan bir enstrüman olur mu? Teremin adlı garip bir enstrüman, ona hiç dokunmadan elini yaklaştırarak çalınır. Biz sanal kartın ışık sensörüyle buna benzer bir "ışıklı tel" yapacağız.

## Etkinlik
### Düğmeler: üç tuşlu enstrüman
Kartta üç düğme birleşimi var: **A**, **B** ve **A+B**. **A+B** ikisine birden bastığın zaman çalışır. Bu üç düğmeyi üç nota için kullanacağız.

### Sürekli ses
Şimdiye kadarki nota blokları belli bir süre çalıp susuyordu. **Müzik** kategorisindeki **[440] Hz sesi sürekli çal** bloğu ise sesi başlatır ve sen **sesi durdur** bloğunu kullanana kadar bırakmaz. Bu iki blok birlikte kullanılır: biri sesi açar, öteki kapatır. Hoparlör bölümündeki **çalan** kutusu yalnız süreli notaları gösterir; sürekli sesi göstermeyebilir.

### Yeni bloklar
- **Temel** kategorisindeki **her [1000] ms'de** bloğu içindekileri belli aralıkla tekrar tekrar çalıştırır. Aralığı 100 yapacağız.
- **Giriş** kategorisindeki **ışık seviyesi** bloğu 0 (karanlık) ile 255 (çok aydınlık) arasında bir sayı verir. Kartın yanındaki **Pusula ve sensörler** bölümünde **Işık** kaydırıcısıyla değiştirebilirsin.
- **Giriş** kategorisindeki **logoya dokunuluyor mu?** bloğu, logoya şu an dokunuluyorsa doğru olur.
- **Matematik** kategorisindeki **[ışık seviyesi] değerini [0]-[255] aralığından [200]-[1000] aralığına eşle** bloğu bir sayıyı bir aralıktan başka bir aralığa orantılar. Işık 0 iken 200, ışık 255 iken 1000 çıkar. Aradaki ışıklar aradaki frekansları verir.
- **logoya [dokununca]** ve **logoya [bırakılınca]** başlıkları.

### Adım adım
Editörde beş başlık hazır: üç düğme, zamanlayıcı **her [100] ms'de** ve **logoya [bırakılınca]**.

1. **düğme [A] [basılınca]** içine **[Do] notasını [1/4] vuruş çal**, **düğme [B] [basılınca]** içine **Re**, **düğme [A+B] [basılınca]** içine **Mi** koy.
2. **her [100] ms'de** içine **Mantık** kategorisinden **eğer ... ise** bloğunu koy. Koşula **Giriş** kategorisinden **logoya dokunuluyor mu?** tak.
3. **eğer** içine **Müzik** kategorisinden **[440] Hz sesi sürekli çal** koy. Frekans yerine **eşle** bloğunu tak. Eşle bloğunun ilk girişine **ışık seviyesi** bloğunu bırak ve aralıkları 0-255 ve 200-1000 yap.
4. **logoya [bırakılınca]** içine **sesi durdur** bloğunu koy.
5. ▶ **Çalıştır**. Üç düğmeyle notaları çal. Sonra logoya tıkla ve basılı tut; ışık kaydırıcısını oynat.

### Beklenen sonuç
Düğmelerle Do, Re, Mi çalar. Logoya basılı tutunca ses sürekli çınlar. Işık kaydırıcısını yukarı çekince ses tizleşir (1000 Hz'e yaklaşır), aşağı çekince kalınlaşır (200 Hz'e yaklaşır). Logoyu bırakınca ses susar. Dört hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- **her [100] ms'de** her 0,1 saniyede bir ışığa bakar ve sesi günceller. Işığı değiştirdikçe ses de takip eder.
- Logoya dokunulmuyorsa **eğer** içine girilmez, ses hiç başlamaz.
- **sesi durdur** logoyu bırakınca çalışır. Bu bloğu koymazsan sürekli ses kendiliğinden susmaz.
- **eşle** bloğu sonucu en yakın tam sayıya yuvarlar.

### Dene
1. Aralığı 100-2000 yap. Çok tiz sesi duymak ister misin?
2. **ses seviyesini [128] yap (0-255)** bloğu sesin gürlüğünü ayarlar. Önce 40, sonra 255 dene.
3. Işığın yerine **ses seviyesi** bloğunu koyup sesle tel çalmayı dene. Kartın **Ses** kaydırıcısını oynat.

### Sık yapılan hatalar
- **sesi durdur** koymamak.
- **eşle** bloğunda aralıkları ters sırayla yazmak. İlk aralık sensörün aralığı (0-255), ikincisi sesin aralığı (200-1000) olmalı.
- **eğer** bloğunu unutup sesi her 100 ms'de açmak. Logoya hiç dokunmasan da ses çalar.

## Konuşalım
Teremin elini yaklaştırarak çalınır, senin kartın ise ışıkla. Başka hangi sensörleri bir enstrümana çevirebilirsin? Ses seviyesi, sıcaklık ya da eğim nasıl bir ses çıkarırdı?
