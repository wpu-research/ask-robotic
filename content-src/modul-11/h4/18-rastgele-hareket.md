# Rastgele hareket: şaşkın yarasa
süre: 20

## Merak
Her seferinde aynı yolu giden düşman çabuk sıkar; oyuncu desenini öğrenir. Bazı düşmanlar ise sanki kafası karışmış gibi her an başka yöne uçar. Bilgisayar "rastgele" yi nasıl yapar? Bu derste bir yarasaya, her yarım saniyeye yakın bir sürede kendi kendine yön seçtireceksin.

## Etkinlik
Sahnede ekranın ortasında duran bir yarasa var. Hiçbir hareketi yok. `her [700] ms'de bir` olayı da boş olarak hazır. Yarasa "ekranda kalsın" ayarıyla başlıyor; bu yüzden ekranın dışına çıkamaz.

### Yön ve rastgele sayı
Yön derecedir: 0 yukarı, 90 sağ, 180 aşağı, 270 sol demektir. **Matematik** kategorisindeki `[1] ile [100] arasında rastgele sayı` bloğu aralıktan her seferinde bir sayı seçer. Aralık 0 ile 359 olursa her yönü kapsar.

### Blokları kur
1. **Hareket** kategorisinden `[bu sprite] [90] derece yönünde [40] hızla gitsin` bloğunu al ve `her 700 ms'de bir` bloğunun içine tak. `bu sprite` yerine `yarasa` değişkenini koy.
2. Yön kutusundaki 90'ın yerine **Matematik** kategorisinden `[1] ile [100] arasında rastgele sayı` bloğunu tak. İlk sayıyı 0, ikinci sayıyı 359 yap.
3. ↺ bas. Yarasa her yarım saniye civarında başka bir yöne uçuyor. Ekranın kenarına gelince duruyor, çünkü "ekranda kalsın" ayarı var.
4. Programı birkaç kez durdurup yeniden başlat. Her seferinde yarasa başka bir yol çiziyor.

Beklenen sonuç: Yarasa kıpırdıyor, ekrandan çıkmıyor ve yolu her çalıştırmada değişiyor. (Etkinlik bunu iki farklı rastgelelik "tohumu" ile deneyip kontrol eder.)

### Nasıl çalışıyor?
- `hızla gitsin` bloğu bir yönü ve hızı birlikte verir. Aslında x ve y hızını senin yerine hesaplar.
- Zamanlayıcı her 700 ms'de yeni bir yön seçtirir. Arada yarasa sabit yönde gider.
- Rastgele sayılar bilgisayarda formülle üretilir. Bu oyunda formül her çalıştırmada başlangıç sayısına ("tohum") göre ilerler; bu yüzden etkinlik kontrolü tutarlı yapılabilir.
- Daha kısa zamanlayıcı, daha titrek ve kaçınılması zor bir yarasa yapar. Daha uzun zamanlayıcı daha kolay tahmin edilir.

### Dene
1. Zamanlayıcıyı 300, sonra 2000 ms yap. Hangisi daha tehlikeli hissettiriyor?
2. Hızı da rastgele yap: `hızla gitsin` bloğunun hız kutusuna 20 ile 60 arası rastgele sayı koy.
3. Yarasa kenara takılıp kalıyor mu? "Ekranda kalsın" yerine "duvar/kenara çarpınca sekmeli: evet" ayarını dene.

### Sık yapılan hatalar
- Rastgele sayı aralığını 1-100 bırakırsan yarasa hep sağa ve biraz yukarı gider. Yön için 0-359 gerekir.
- Rastgele yönü `oyun başlayınca` içine koymak: yön bir kez seçilir ve yarasa hep aynı yöne gider.
- `hızla gitsin` bloğunu zamanlayıcının dışında bırakmak: blok hiç çalışmaz.

## Konuşalım
"Tamamen rastgele" bir düşman her zaman iyi mi? Oyuncu öğrenebileceği bir düzen bulamazsa oyun ne kadar adil olur? Biraz rastgele, biraz düzenli bir düşmanı nasıl tarif edersin?
