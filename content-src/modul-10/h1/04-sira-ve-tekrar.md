# Sıra ve tekrar
süre: 20

## Merak
Bir tarifi yazarken sırayı karıştırırsan yemek bozulur: önce yumurtayı kır, sonra karıştır. Bilgisayarlarda da sıra her şeydir. Peki aynı işi üç kez yaptırmak istiyorsun. Blokları üç kez mi kopyalayacaksın?

## Etkinlik
### Sıra
Kart blokları **yukarıdan aşağıya** çalıştırır. Aynı bloklar farklı sırada farklı sonuç verir.

Şu iki yığını karşılaştır:

| Yığın 1 | Yığın 2 |
|---|---|
| kare göster | ekranı temizle |
| bekle 300 ms | bekle 300 ms |
| ekranı temizle | kare göster |
| bekle 300 ms | bekle 300 ms |

Yığın 1'de önce kare görünür, sonra söner. Yığın 2'de önce ekran boş kalır, sonra kare görünür ve ekranda kalır. Bloklar aynı, sıra farklı.

### Tekrar
Bir kareyi üç kez yanıp söndürmek için 4 bloğu üç kez alt alta koyabilirsin. Ama **Döngü** kategorisindeki **[4] kez tekrarla** bloğu çok daha kısa bir yol sunar. İçine koyduğun bloklar, yazdığın sayı kadar tekrar çalışır.

### Program: üç yanıp sönme ve evet
1. **Döngü** kategorisinden **[4] kez tekrarla** bloğunu **başlangıçta** içine sürükle.
2. Sayıyı 3 yap.
3. Tekrarla bloğunun içine sırayla şunları tak:
   - **Temel** kategorisinden **simgeyi göster** (listeden **kare** seç)
   - **bekle [300] ms**
   - **ekranı temizle**
   - **bekle [300] ms**
4. Tekrarla bloğunun **altına**, yani dışına, **simgeyi göster** bloğunu ekle ve **evet** seç.
5. ▶ **Çalıştır**.

### Beklenen sonuç
Kare üç kez yanıp söner. Her yanıp sönme yaklaşık 0,6 saniye sürer. Sonra ekranda "evet" işareti kalır. Hedefler kutusunda üç görev ✓ olmalı.

### Nasıl çalışıyor?
- Tekrarla bloğunun içindeki bloklar, **sayı kadar** baştan sona çalışır. Üçüncü tur bitince kart bir sonraki bloğa geçer.
- Bir blok tekrarla bloğunun **içindeyse** tekrar eder, **altındaysa** bir kez çalışır. "Evet" simgesi tekrarla bloğunun dışında olduğu için yalnızca bir kez, en sonda görünür.
- **JavaScript** sekmesine bak: tekrarla bloğu `for (let _i = 0; _i < 3; _i++)` satırına dönüşmüş. Süslü parantezlerin içindeki satırlar tekrar eden bloklardır.

### Dene
1. Sayıyı 10 yap. Kare 10 kez yanıp söner. Bekleme süresini 100 ms yap ve hızı karşılaştır.
2. Tekrarla bloğunun içine ikinci bir simge ekle: kare, bekle, elmas, bekle gibi. Yanıp sönme yerine ne oluyor?
3. "Evet" bloğunu tekrarla bloğunun içine taşı ve ne değişiyor gör.

### Sık yapılan hatalar
- **Bloğu yanlış yere takmak.** Tekrarla bloğunun içine mi, altına mı koyduğuna dikkat et. İç ve dış farklı şeyler yapar.
- **Temizlemeyi unutmak.** Temizleme ve bekleme olmazsa kare hiç sönmez, yanıp sönme göremezsin.
- **Çok kısa süre yazmak.** 10 ms gibi çok kısa bekleme gözle görülmez.

## Konuşalım
Günlük hayatta tekrar eden neler var? Diş fırçalamak ya da merdiven çıkmak gibi tekrar eden şeyleri tek bir "kez tekrarla" cümlesiyle nasıl anlatırdın?
