# Nem ve sıcaklık istasyonu
süre: 30

## Merak
Evdeki saksı çiçeğin ne zaman susadığını nereden anlarsın? Toprağa parmağını batırırsın. Ama sen evde yokken? İşte bir istasyon tam bunun için: sıcaklığı ve toprağın ne kadar nemli olduğunu ölçer, toprak kuruyunca seni uyarır. Bu derste kendi küçük hava ve saksı istasyonunu kuracaksın.

## Etkinlik
### Sensörler
Kartta doğrudan nem sensörü yoktur. Biz **P1** pinine sanal bir **toprak nemi sensörü** bağlı sayacağız. Sağ paneldeki **Pinler** bölümünü aç; **P1** satırında bir **Giriş** kaydırıcısı var. Bu kaydırıcı sensörün okuduğu sayıyı belirler: **0 çok kuru, 1023 çok ıslak** kabul edeceğiz. Gerçek bir sensörde değerler sensöre göre farklı çıkar; o yüzden gerçek bir sensörü kullanırken önce kalibre etmek gerekir.

Sıcaklık için kartın kendi **sıcaklık (°C)** sensörü var. **Pusula ve sensörler** bölümündeki **Sıcaklık** kaydırıcısıyla değerini değiştirirsin.

### 0-1023'ü yüzdeye çevirmek
Okunan sayı 0-1023 arasındadır; biz **yüzde** (0-100) görmek isteriz. **Matematik** kategorisindeki **eşle** bloğu bunu yapar:

**[P1 analog oku (0-1023)] değerini [0]-[1023] aralığından [0]-[100] aralığına eşle**

Örnekler: 0 → %0, 512 → %50, 1023 → %100.

### Yeni bloklar
- **Pinler** kategorisinde **[P1] analog oku (0-1023)** bloğu pinin giriş değerini sayı olarak verir.
- **LED** kategorisindeki **çubuk grafik [3] / en çok [5]** bloğu bir değeri en çok değere göre LED'lerle gösterir. LED'ler aşağıdan yukarı dolar. Değer **50**, en çok **100** ise 25 LED'in yarısı (yuvarlanınca 13'ü) yanar.
- **Temel** kategorisindeki **konsola yaz [merhaba]** bloğu bir değeri kartın konsoluna yazar. Konsol, sağ paneldeki **Konsol** bölümünde görünür.

### Adım adım
Editörde **başlangıçta**, üç düğme başlığı (**A**, **B**, **A+B**) ve **her [2000] ms'de** hazır.

1. **Değişken** kategorisinde **nem** değişkenini oluştur. **başlangıçta** içine **nem değerini [0] yap** koy.
2. **düğme [A] [basılınca]** içine **sayıyı göster** koy; sayı olarak **Giriş** kategorisinden **sıcaklık (°C)** tak.
3. **düğme [B] [basılınca]** içine **sayıyı göster** koy; sayı olarak yukarıdaki **eşle** bloğunu tak (**[P1] analog oku (0-1023)** değeri 0-1023'ten 0-100'e).
4. **düğme [A+B] [basılınca]** içine **çubuk grafik [...] / en çok [100]** koy. Değer olarak aynı **eşle** bloğunu (kopyalayabilirsin) tak.
5. **her [2000] ms'de** içine sırayla:
   - **nem değerini [...] yap**; değer olarak **eşle** bloğunu tak.
   - **konsola yaz [nem]**
   - **eğer ... ise**: koşul **nem** **<** **30**. İçine **simgeyi göster [üzgün yüz]** ve **ezgiyi çal [Üzgün]**.
6. Hazırlık: **Sıcaklık** kaydırıcısını 27 yap, **P1 Giriş** kaydırıcısını yaklaşık 512'ye getir.
7. ▶ **Çalıştır**. **A**, **B** ve **A+B**'ye sırayla bas. Sonra **P1** kaydırıcısını 100'e çek ve birkaç saniye bekle.

### Beklenen sonuç
**A** 27'yi, **B** 50'yi kaydırır. **A+B** yarı dolu bir çubuk grafik (13 LED) gösterir. Konsol bölümünde iki saniyede bir nem değeri belirir. **P1**'i 100'e çekince nem yaklaşık %10 olur: üzgün yüz ve **Üzgün** ezgisi (3 saniye) başlar. Yedi hedefin hepsinde ✓ olmalı.

**Not:** Program ilk çalıştığında **P1** kaydırıcısı 0'dır. Yani nem %0'dır ve ilk iki saniyenin sonunda hemen üzgün yüz çıkar. Bu bir hata değil; toprak kuru kabul edildi. Kaydırıcıyı yukarı çekince normale döner.

### Nasıl çalışıyor?
- **her [2000] ms'de** iki saniyede bir nemi okur, konsola yazar ve toprak kuruysa uyarır.
- **nem < 30** uyarı eşiğidir. Eşik gerçek bir bitkiye göre değişir; her bitki için ayrı seçilir.
- **A**, **B** ve **A+B** istediğin zaman anlık değer görmek içindir. İstasyon yine arka planda çalışmaya devam eder.
- **eşle** bloğu sonucu en yakın tam sayıya yuvarlar. Bu yüzden 512 değeri %50 olur (50,05).

### Dene
1. Eşiği 30 yerine 20 yap. Hangi **P1** değerinde uyarı başlıyor?
2. Işığı da ölç: **düğme [A+B] [uzun basılınca]** ışık seviyesini göstersin. Karanlıkta (ışık 50'nin altı) bitkinin "uyumak" istediğini düşün: **simgeyi göster [uyuyan yüz]**.
3. Konsola yalnız nem değil, sıcaklığı da yaz: ikinci bir **konsola yaz** bloğu ekle.
4. Isı yüksek (35 °C'nin üstü) ve nem düşükse (30'un altı) farklı bir uyarı çal. İki koşulu birleştirmek için **Mantık** kategorisinde **ve** bloğunu kullan.

### Sık yapılan hatalar
- **Aralıkları yanlış yazmak.** Giriş aralığı **0-1023**, çıkış aralığı **0-100** olmalı. 1023'ü 100'e eşlerken tersini yazarsan sonuçlar ters çıkar.
- **Eşik karşılaştırmasında yanlış işaret.** **nem < 30** kuruluktur; **>** yazarsan ıslakken uyarır.
- **Her turda ezgi çalmak.** Üzgün ezgi 3 saniye sürer. Uyarı sıklığını ve ezgiyi ona göre ayarla.
- **Sıcaklık ile nemi karıştırmak.** Sıcaklık kartın kendi sensöründen, nem **P1** pininden gelir. İkisinin kaydırıcısı farklı bölümlerdedir.

## Konuşalım
Bir saksı için eşik 30 olsa, bir kaktüs için ne olurdu? Eşiği her bitkiye göre değiştirmek için programı nasıl daha esnek yapardın? Gerçek bir sensör sana gelişigüzel sayılar verse ne yapardın?
