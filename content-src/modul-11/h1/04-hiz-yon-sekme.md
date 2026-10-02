# Sekip duran top
süre: 20

## Merak
Bir top odanın duvarına çarpınca geri döner. Peki biz sahnede bir sprite'a "saniyede şu kadar piksel git, duvara çarpınca geri dön" demeyi nasıl öğretiriz? Bu derste kendi kendine hareket eden bir top yapacaksın. Hiçbir tuşa basmana gerek kalmayacak.

## Etkinlik
Sahnede ortada duran bir top var. Arka plan düz bir renk. Sen topu hareket ettireceksin ve arka planı çimenle döşeyeceksin.

### Hız ne demek?
Hız iki sayıdan oluşur: x hızı yatay, y hızı dikey gider. Birimi saniyede piksel. x hızı 50 ise sprite saniyede 50 piksel sağa gider. x hızı eksi bir sayıysa sola gider. y hızı pozitifse aşağı, eksi ise yukarı gider.

### Blokları kur
1. **Hareket** kategorisinden `[top] hızı x [30] y [0]` bloğunu al ve `oyun başlayınca` bloğunun içindeki son bloğun altına tak. İçindeki `bu sprite` yerine `top` değişkenini koy. x için 50, y için 35 yaz.
2. ▶ düğmesine bas. Top ekranın dışına çıkıp gidiyor.
3. **Sprite** kategorisinden `[top] [duvar/kenara çarpınca sekmeli]: [evet]` bloğunu al ve alta tak. Ayar ve değer listelerinden doğru seçenekleri seç.
4. ↺ düğmesine bas. Top kenara çarpınca geri sekiyor.
5. Arka planı güzelleştir: **Sahne / Harita** kategorisinden `arka planı [resim] resmiyle döşe` bloğunu al ve `oyun başlayınca` bloğunun içine tak. Resim olarak **Çimen**'i seç.
6. Sahne şimdi çimenle kaplı. Top içinde sekiyor.

Beklenen sonuç: Top sürekli sekip duruyor, 10 saniye sonra hâlâ ekranın içinde. Arka plan çimen döşemeli.

### Nasıl çalışıyor?
- `hızı` bloğu yalnız bir kez çalışır. Ama hız değeri sprite'ın üzerinde saklı kalır ve başka bir blok değiştirene kadar sprite aynı hızla gitmeye devam eder.
- Sekmeli ayar açıkken sprite kenara ya da duvara çarpınca hızı ters döner. Eksi artı olur, artı eksi olur.
- Döşeme, küçük bir resmi (16 x 16 piksel) tüm ekrana tekrar tekrar yan yana koyar.

### Yönle gitmek
`hızı x y` bloğu yerine `[top] [90] derece yönünde [40] hızla gitsin` bloğunu da kullanabilirsin. Yön derecedir: 0 yukarı, 90 sağ, 180 aşağı, 270 sol demektir. Sayıları değiştirerek topu çapraz yönlerde gönder.

### Dene
1. Topu 45 derece yönünde 60 hızla gönder. Hangi köşeye doğru gidiyor?
2. `[top] dursun` bloğunu ekle ve hız bloğunun hemen ardına koy. Top ne yapıyor? Neden?
3. Başka bir döşeme resmi dene: **Kum**, **Zemin** ya da **Su**.

### Sık yapılan hatalar
- `sekmeli` ayarı kapalıysa top kenarlardan çıkıp gider ve bir daha görünmez.
- Çok yüksek hızda küçük bir sprite birkaç karede ekranı geçer. 400'ün üstüne çıkma.
- Döşeme bloğunu yanlış yere (olay bloğunun dışına) bıraktıysan çalışmaz.

## Konuşalım
Hız eksi olunca sprite ters yöne gider. Oyunda bir sprite'ın duvara çarpınca geri dönmesi için başka hangi yolları düşünebilirsin?
