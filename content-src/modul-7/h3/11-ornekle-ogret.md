# Örnek vererek öğret
süre: 25

## Merak
Bir arkadaşına "olumlu mu olumsuz mu" oyununu anlatmak yerine iki örnek göstersen anlar. Dil modelleri için de güçlü bir yol: birkaç örnek göster, model kalıbı yakalasın. Buna az örnekli (few-shot) istem denir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Örnekle öğretmek
- **Sıfır örnek:** Yalnız talimat verirsin.
- **Az örnek:** Talimat + birkaç örnek (girdi ve beklenen çıktı çiftleri).
Örnekler biçimi, üslubu ve etiket adlarını netleştirir. Talimatla örnek çelişirse model karışabilir, bu yüzden tutarlı ol.

### Aracı aç
1. **Prompt denetleyici** aracında görev: yorum sınıflandırma.
2. En az iki "Girdi:" ve iki "Çıktı:" yaz.
3. Bir örnek "olumlu", diğeri "olumsuz" etiketli olsun.
4. Prompt'ta "yorum" ve "olumlu" kelimeleri geçsin.

### Nasıl çalışıyor?
- Denetleyici "Girdi:" ve "Çıktı:" kalıplarını sayar. Örneklerin gerçekten iyi olup olmadığını bilemez.
- İyi örnekler: farklı etiketlerden, gerçekçi, kısa ve tutarlı biçimde yazılmış olanlardır.
- Örnek sırası ve sayısı sonucu etkileyebilir. Bunu sezgiyle değil, 4. haftada öğreneceğin ölçümlerle (eval) sına.

### Dene
1. Üç örnek yaz: biri "kararsız" etiketli olsun. Biçimi nasıl belirtirsin?
2. Örneği sil ve puanın değişimine bak.

### Kendini sına
1. Örneklerin hepsi aynı etiketliyse model nasıl yanılabilir?
2. Few-shot ile "ince ayar" aynı şey midir?

## Konuşalım
Bir modele örnek vermek ile ona kural söylemek arasında ne fark olabilir? Hangisini hangi durumda seçerdin?
