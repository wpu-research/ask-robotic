# Bağlam penceresi
süre: 25

## Merak
Uzun bir sohbetin başında modele söylediğin bir şeyi sonlarda "unutmuş" gibi göründüğünü fark etmiş olabilirsin. Çoğu zaman sebep, modelin aynı anda yalnız sınırlı sayıda token görebilmesidir. Buna bağlam penceresi denir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Pencere nedir?
Model bir istekte, belli bir token sayısına kadar metni birlikte işleyebilir. Bu sınıra bağlam penceresi denir. Sınıra yazdıkların, modelin cevabı ve verdiğin belgeler de dâhildir. Sınır aşılırsa metnin bir kısmı kesilir, özetlenir ya da dışarıda bırakılır. Bizim simülasyonumuzda en eski token'lar dışarıda kalır.

### Aracı aç
1. **Token ve BPE** aracında uzun bir metin yaz (en az 25 token).
2. **Bağlam penceresi** kaydırıcısını 20 token civarına indir. Dışarıda kalan token'lar üstü çizili görünür.
3. En az 5 token dışarıda kalsın ama pencerede 8'den fazla token olsun.

### Nasıl çalışıyor?
- Pencerede kalan kısım, "modelin gördüğü" kısımdır. Dışarıda kalan, bu simülasyonda görülmez.
- Gerçek sistemlerde pencere çok daha büyüktür, ama uzun belgeler, uzun sohbetler ve çok sayıda araç çıktısı yine de onu doldurabilir.
- Pencere içinde de her şey eşit iyi kullanılmayabilir. Çok uzun bağlamlarda ortadaki bilgiyi gözden kaçırma gibi sorunlar bildirilmiştir. Bu yüzden önemli bilgiyi kısa ve belirgin tutmak iyi bir alışkanlıktır.

### Dene
1. Pencereyi çok küçültüp cümlenin başında verdiğin bir kuralın dışarıda kaldığını göster.
2. Metni kısalt: aynı kural pencereye sığıyor mu?

### Kendini sına
1. Pencere 100 token ise ve metnin 130 token ise kaç token dışarıda kalır?
2. Uzun bir görevde önemli bilgiyi nereye koyarsın?

## Konuşalım
Bir robot, saniyede yüzlerce sensör satırı üretiyor. Hepsini modele göndermek mümkün mü? Neleri seçip özetlerdin?
