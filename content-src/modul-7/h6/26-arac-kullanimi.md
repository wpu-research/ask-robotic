# Araç kullanımı
süre: 30

## Merak
Dil modelleri kelime tahmin etmede iyidir ama çok basamaklı bir çarpmayı ya da bugünün tarihini bilmeyi kendi başlarına garanti edemezler. Çözüm basit: model hesabı yapmaz, hesap makinesini çağırır.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Araç kullanımı
Modele bir araç listesi verilir: her aracın adı, ne yaptığı ve hangi girdiyi aldığı. Model bir adımda "şu aracı şu girdiyle çağırmak istiyorum" der; uygulama aracı **gerçekten çalıştırır**, sonucu modele geri verir. Model sonuca bakarak devam eder.

### Aracı aç
**Ajan döngüsü** aracında araçlar gerçektir (hesap makinesi, bilgi tabanı, sanal robot). "Model adımı" ise bir model değildir: aracı kullanma kararlarını **sen betik olarak yazarsın**. Gerçek bir ajanda bu kararı model verir.

Soru: 12 grup var, her grup 7 proje yapmış. Toplam proje kaç?
1. Betik kutusuna `hesapla(12*7)` yaz.
2. Sonucu `bitir($1)` ile ver. `$1`, birinci adımın sonucudur.
3. Hedefler: hesapla aracı kullanıldı, sonuç 84, hata yok.

### Nasıl çalışıyor?
- Hesap makinesi gerçek bir ifade ayrıştırıcıdır; yalnız sayı ve işlem kabul eder, rastgele kod çalıştırmaz.
- Çağrı biçimi: `arac(girdi)`. Sonuç "gözlem" sütununda görünür.
- Hatalı çağrı (örneğin sıfıra bölme) hata gözlemi üretir; ajan bunu görüp farklı bir şey deneyebilir.

### Dene
1. `hesapla(1/0)` yaz ve hata gözlemini gör.
2. İki hesabı zincirle: `hesapla(12*7)` sonra `hesapla($1+16)`.

### Kendini sına
1. Neden bir araç sonucunu doğrudan modelin "kafadan" cevabına tercih edersin?
2. Araç hatası geldiğinde ajan ne yapmalı?

## Konuşalım
Bir modele "internete bağlan" ya da "dosya sil" aracı vermek ile "hesap makinesi" vermek arasındaki fark nedir? Hangi araçlara onay gerekir?
