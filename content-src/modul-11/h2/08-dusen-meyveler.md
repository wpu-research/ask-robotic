# Gökten meyve yağsın
süre: 25

## Merak
Şimdiye kadar nesneleri oyun başlarken tek tek yerleştirdik. Gerçek oyunlarda ise sürekli yeni şeyler çıkar: düşen meyveler, gelen düşmanlar. Elle yüz tane sprite yaratamayız. Bilgisayara "her saniye yeni bir tane yap" demenin yolu var mı? Bir de ekranda sonsuza kadar birikmesinler.

## Etkinlik
Sepet (kedi) sağa sola gidiyor ve meyve yakalayınca skor artıyor. Ama gökten hiç meyve düşmüyor.

### Tekrar eden olay
`her [1000] ms'de bir` bloğu belli bir sürede bir çalışır. 1000 milisaniye bir saniyedir. İçine "yeni bir meyve yarat" yazarsan her saniye bir meyve doğar.

### Blokları kur
1. **Oyun** kategorisinden `her [1000] ms'de bir` olay bloğunu çalışma alanına bırak. Sayıyı 800 yap.
2. **Değişken** kategorisinde **Değişken oluştur...** ile `meyve` adlı bir değişken yap. İçine `[meyve] değişkenini [ ] yap` bloğunu al ve olayın içine tak. Değerine **Sprite** kategorisinden `yeni [Elma] sprite'ı, türü [Yiyecek]` bloğunu bağla.
3. Meyveyi gökyüzüne koy: `[meyve] konumu x [80] y [60]` bloğunu ekle. y için -8 yaz (ekranın hemen üstü). x için **Matematik** kategorisinden `[10] ile [150] arasında rastgele sayı` bloğunu koy.
4. Meyveyi düşür: **Hareket** kategorisinden `[meyve] hızı x [30] y [0]` bloğunu ekle. x için 0 yaz. y için bir rastgele sayı koy: 35 ile 70 arasında.
5. Ekrandan çıkanları sil: **Sprite** kategorisinden `[meyve] [dünyadan çıkınca silinsin]: [evet]` bloğunu ekle.
6. ▶ düğmesine bas. Meyveler rastgele yerlerden düşüyor. Sepetle yakala ve skorun artışını gör.

Beklenen sonuç: Her 0,8 saniyede farklı bir yerden meyve düşer. Yakaladığın meyve skoru artırır. Kaçırdığın meyveler ekrandan çıkınca silinir.

### Nasıl çalışıyor?
- `her [800] ms'de bir` olayı oyun açık kaldığı sürece tekrar eder.
- Her turda `yeni [Elma] sprite'ı, türü [Yiyecek]` bloğu yepyeni bir meyve doğurur. `meyve` değişkeni her seferinde en yeni meyveyi gösterir. Eski meyveler kendi hızlarıyla düşmeye devam eder.
- **Rastgele sayı** her çalıştığında 10 ile 150 arasından bir sayı seçer. Böylece meyve her seferinde başka yerden düşer.
- Meyve başlangıçta ekranın dışında (y -8). Dünyadan çıkınca silinsin ayarı, sprite bir kez ekrana girdikten sonra tekrar çıkarsa silinmesini sağlar. Bu ayarı kapatırsan ekran dışında binlerce meyve birikir ve oyun yavaşlar.

### Dene
1. Düşme hızını daha geniş yap: 20 ile 120 arası. Oyun zorlaştı mı?
2. Sıklığı 400 ms yap. Oyun nasıl değişti?
3. Meyvenin resmini değiştir: olayın içine `[meyve] resmi [resim]` bloğunu ekle ve **Portakal**'ı seç.

### Sık yapılan hatalar
- y değerini 60 bırakırsan meyve ekranın ortasında doğar.
- Hız bloğunda x yerine y'ye 0 yazarsan meyve yana kayar ve hiç düşmez.
- Ekrandan çıkan meyveleri silmezsen oyun bir süre sonra durur. Oyun Atölyesi en çok 500 sprite'a izin verir.
- Rastgele sayı bloğunda küçük sayıyı ilk yuvaya, büyük sayıyı ikinci yuvaya yaz.

## Konuşalım
Oyun neden hep aynı sırayla meyve düşürmüyor da rastgelelik kullanıyor? Rastgelelik olmasa oyun nasıl bir şey olurdu? Gerçek hayatta rastgele olan şeylere örnek ver.
