# Ses seviyesi: alkış sayacı
süre: 25

## Merak
Bazı lambalar el çırpınca yanar. Bazı telefonlar yüksek sesi algılayınca uyarı verir. Bunların hepsinde ortamdaki sesin ne kadar yüksek olduğunu ölçen küçük bir "kulak" vardır. Kartın da ses seviyesi bilgisi var. Bu derste alkışları sayacaksın.

## Etkinlik
### Sanal ses seviyesi
Sanal kartta ses seviyesini **Pusula ve sensörler** bölümündeki **Ses** kaydırıcısı belirler. Değer 0 (sessiz) ile 255 (çok yüksek) arasındadır. Başta 20 civarındadır.

**Giriş** kategorisinde **ses seviyesi** bloğu bu değeri verir.

### Eşik: ne zaman "yüksek" sayarız?
Bir alkış sesi kısa ve çok yüksektir. **eğer ses seviyesi > 150 ise** diye sorarsak sadece yüksek sesleri yakalarız. 150 sayısına **eşik** denir.

Alkışı bir kez sayıp bırakmak için, saymadan sonra ekranda sayıyı gösteririz. Sayıyı göstermek kısa bir süre aldığı için aynı alkış iki kez sayılmaz.

### Program: ses ölçer ve alkış sayacı
Editörde **başlangıçta** ve **sonsuza kadar** blokları hazır. **alkis** değişkeni de hazır.

1. **başlangıçta** içine **alkis değerini [0] yap** bloğu konmuş olmalı.
2. **sonsuza kadar** içine **Mantık** kategorisinden **eğer ... ise ... değilse** bloğunu koy (iki çeşit eğer var; "değilse" olanı al).
3. Koşul: **ses seviyesi > 150**. Sol deliğe **Giriş** kategorisinden **ses seviyesi**, sağ deliğe 150 koy.
4. "ise" kısmına şunları tak:
   1. **alkis değerine [1] ekle**
   2. **sayıyı göster** (içine **alkis**)
5. "değilse" kısmına **LED** kategorisinden **çubuk grafik** bloğunu koy. İlk deliğe **ses seviyesi**, ikinci deliğe 255 koy.
6. ▶ **Çalıştır**.
7. **Ses** kaydırıcısını 130'a çek: ekranın yarısından fazlası yanar. Sonra 200'e çek ve hemen geri 20'ye bırak: sayı 1 olur. Bunu üç kez tekrarla.

### Beklenen sonuç
Sessizken ekranda ses çubuğu görünür. Ses seviyesi 150'yi geçince çubuk gider, yerine yarım saniye 1, sonra 2, sonra 3 görünür. Dört hedefin hepsinde ✓ olmalı.

### Nasıl çalışıyor?
- **sonsuza kadar** bloğu sürekli dinler: ses yüksekse sayar, değilse çubuğu çizer.
- **sayıyı göster** bloğu yarım saniye kadar sürer. Bu süre boyunca program bir sonraki turu beklemiş olur. Böylece bir kısa alkış iki kere sayılmaz.
- Çubuk grafik ses seviyesini 25 LED'e dağıtır: 130 gibi bir değer yaklaşık 13 LED yakar.
- **alkis** her sayıda 1 artar. Sayaç sıfırlanmaz; ▶ düğmesine yeniden basınca sıfırdan başlar.

### Dene
1. Eşiği 100 yap ve daha hassas bir alkış algılayıcı olsun.
2. **B düğmesi** için bir olay bloğu ekle: **alkis değerini 0 yap**. Böylece sayaç sıfırlansın.
3. Sayaç 5'e ulaşınca ekranda kalp gösterecek bir **eğer** daha ekle.

### Sık yapılan hatalar
- **Kaydırıcıyı yüksekte bırakmak.** Ses 150'nin üstünde kalırsa sayaç yarım saniyede bir artmaya devam eder. Sesi hemen geri indir.
- **Eşiği çok düşük seçmek.** Ses başta 20 olduğu için eşik 10 olursa hep "yüksek" sayılır ve sayaç durmadan artar.
- **Çubuğu yanlış kola koymak.** Çubuk **değilse** kolunda olmalı. **ise** kolunda olursa sayı hemen silinir.

## Konuşalım
Sesle çalışan bir cihazın yanlışlıkla çalışmasını nasıl önleriz? Gürültülü bir kalabalıkta alkış sayacı doğru çalışır mı? Sence insanlar mikrofonla dinlenirken hangi gizlilik kuralları gerekir?
