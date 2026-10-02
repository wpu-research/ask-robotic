# LED'lerin adresi: x ve y
süre: 20

## Merak
Hazine haritasında "üç adım sağa, iki adım aşağı" dendiğinde hazineyi bulursun. Her yerin bir adresi vardır. Kartın ekranındaki 25 ışığın da adresi var. Bu adreslerle istediğin ışığı yakıp söndürebilirsin. Bir çizgi ya da kendi şeklini nasıl çizersin?

## Etkinlik
### Adres: x ve y
Her LED'in iki sayılı bir adresi vardır:

- **x:** soldan sağa sütun numarası, 0 ile 4 arası.
- **y:** yukarıdan aşağıya satır numarası, 0 ile 4 arası.

Sayıma **0'dan** başlanır. Yani en soldaki sütun 0, en sağdaki 4'tür.

| Yer | x | y |
|---|---|---|
| Sol üst köşe | 0 | 0 |
| Sağ üst köşe | 4 | 0 |
| Tam orta | 2 | 2 |
| Sol alt köşe | 0 | 4 |
| Sağ alt köşe | 4 | 4 |

Adres yazarken önce x, sonra y yazılır: (x, y).

### Program: çapraz çizgi, sonra dört köşe
Bu derste **Temel** ve **LED** kategorilerini kullanacaksın.

1. **LED** kategorisinden **LED yak x [2] y [2]** bloğunu **başlangıçta** içine sürükle.
2. x ve y kutularını 0 ve 0 yap. Bu, sol üst köşeyi yakar.
3. Aynı bloktan dört tane daha ekle. Adresleri sırayla (1, 1), (2, 2), (3, 3), (4, 4) yap.
4. **Temel** kategorisinden **bekle [500] ms** bloğunu al, sürenin yerine 1000 yaz ve LED bloklarının altına tak.
5. Altına **Temel** kategorisinden **ekranı temizle** bloğunu ekle.
6. Ardından dört tane **LED yak** bloğu daha ekle: (0, 0), (4, 0), (0, 4), (4, 4).
7. ▶ **Çalıştır**.

### Beklenen sonuç
Önce sol üstten sağ alta uzanan bir çapraz çizgi yanar. Bir saniye sonra ekran söner ve dört köşe yanar. Hedefler kutusunda üç görev de ✓ olmalı.

### Nasıl çalışıyor?
- **LED yak** bloğu belirtilen adresteki ışığı yakar. **LED söndür** bloğu aynı adresteki ışığı söndürür.
- LED blokları **beklemez**. Beş LED bloğunu art arda koyarsan beşi aynı anda yanmış gibi görünür. Bir şeyin ne kadar süre ekranda kalacağını **bekle** bloğuyla sen belirlersin.
- **bekle** süresi milisaniye (ms) cinsindendir. 1000 ms bir saniyedir.
- **ekranı temizle** hepsini birden söndürür. Tek tek söndürmekten çok daha kısa.
- Ekranın dışında kalan bir adres yazarsan (örneğin x = 7) kart hata vermez, o bloğu yok sayar.

### Dene
1. Ekranın tam ortasındaki ışığı yak: (2, 2). Sonra onu **LED söndür** ile söndür.
2. Dış çerçeveyi (kenardaki 16 ışığı) yakmayı dene. Hangi adresleri yazman gerekiyor?
3. Çapraz çizgiyi öbür yönden çiz: sağ üstten sol alta. (4, 0), (3, 1), (2, 2), (1, 3), (0, 4) adreslerini kullan.

### Sık yapılan hatalar
- **x ile y'yi karıştırmak.** x yatay, y dikeydir. (4, 0) sağ üst köşedir, sol alt değil.
- **1'den saymak.** Sayım 0'dan başlar. En sağ sütun 5 değil 4'tür.
- **Hepsini yakıp bir şey göremediğini düşünmek.** Bekle bloğu koymazsan ilk çizim anında silinir. Aralara **bekle** koy.

## Konuşalım
Bir ışığı yakmak için neden iki sayıya ihtiyacımız var? Sence 25 ışığın her birine 1'den 25'e kadar tek bir numara verseydik daha kolay mı olurdu?
