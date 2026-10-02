# Düşün, yap, gözle
süre: 30

## Merak
Bir ajan tek seferde cevap vermez; döngü kurar: neye ihtiyacım var, hangi aracı çağırayım, sonuç ne dedi, işim bitti mi? Bu döngü ajanı basit bir sohbetten ayırır.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Döngü
1. **Düşün:** Hedefe ulaşmak için sıradaki adım ne?
2. **Yap:** Bir aracı çağır.
3. **Gözle:** Sonucu oku.
4. Bitti mi? Evet: cevabı ver. Hayır: başa dön.

### Aracı aç
**Ajan döngüsü** aracında dünya: bilgi tabanı + hesap makinesi. Soru: kulüpte kaç grup olur? (üye sayısı ÷ grup büyüklüğü)
1. Önce **betikli demoyu göster** düğmesine bas ve incele. Oradaki "düşünce" metinleri elle yazılmıştır, bir model üretmemiştir.
2. Kendi betiğini yaz: iki bilgiyi `ara(...)` ile bul, `hesapla($1/$2)` ile böl, `bitir($3)` ile cevabı ver.
3. Hedefler: iki ara, bir hesapla, doğru cevap 6.

### Nasıl çalışıyor?
- `$1`, `$2` adım numarasına göre sonuçları taşır; `$son` en son başarılı sonucu verir.
- Bilgi tabanı küçük ve elle hazırlanmış. Aramayla eşleşmeyen sorgu "bulunamadı" döndürür; ajan bunu nasıl ele alacağına karar vermelidir.
- Gerçek bir ajanda her adımı model seçer ve araç sonucunu görerek planını değiştirebilir. Bizim betiğimiz ise önceden yazılmıştır, bu yüzden "gözleme göre değişen plan" yoktur; bu sınırı biliyoruz.

### Dene
1. Bilgi tabanında olmayan bir şey ara: `ara(yıldız sayısı)`.
2. Doğru sonuç için kaç adım gerekti? Daha az adımla yapabilir misin?

### Kendini sına
1. Döngünün dört parçasını sırala.
2. Ajan sonuca ulaşamadığında hangi durma koşulları gerekir?

## Konuşalım
Bir sohbet botu ile bir ajan arasındaki fark ne? Ajana hangi işleri vermek konusunda temkinli olurdun?
