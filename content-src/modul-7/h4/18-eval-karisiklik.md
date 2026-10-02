# Doğruluk yetmez: hangi etiket kaçıyor?
süre: 30

## Merak
%80 doğruluk iyi mi? Eğer verinin %80'i "olumlu" ise ve sistem hep "olumlu" diyorsa bu sayı hiçbir şey söylemiyor demektir. Etiket etiket bakmak gerekir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Etiket başına bakmak
Her beklenen etiket için kaç vakanın doğru bulunduğuna **geri çağırma** (recall) denir. Örneğin 4 olumsuz vakadan 3'ü doğru bulunduysa olumsuz için geri çağırma 3/4'tür. Toplam doğruluk iyi görünürken tek bir etikette ciddi zayıflık saklanabilir.

### Aracı aç
1. **Eval tablosu** aracında en az iki "olumsuz" vaka yaz.
2. Sistemin en az iki vakada yanıldığı bir set kur.
3. Doğruluğun yine de %40'ın altına düşmemesine dikkat et (sistem tamamen kötü değil).
4. Etiket çubuklarına bak: hangi etiket daha zayıf?

### Nasıl çalışıyor?
- Çubuk, o etiket için doğru bilinen vaka oranını gösterir; yeşil: hepsi doğru, sarı: eksik var.
- Gerçek projelerde de önce "hangi tür vakada hata yapıyoruz?" sorusunu sorarsın, sonra ona özel düzeltme yaparsın.

### Kendini sına
1. 10 vakadan 9'u "olumlu" ve sistem hep "olumlu" diyorsa doğruluk kaç, olumsuz için geri çağırma kaçtır?
2. Hatalı vakaları gruplamak neden işe yarar?

## Konuşalım
Bir tıbbi test düşün: hasta olmayan kişiye "hasta" demek ile hasta kişiye "sağlıklı" demek aynı ölçüde mi önemli? Bu, hangi hatayı ölçtüğümüzü nasıl etkiler?
