# Token: model yazıyı nasıl görür?
süre: 20

## Merak
Sen bir cümleyi kelimelerden oluşmuş görürsün. Bir dil modeli ise onu "token" denen parçalardan oluşmuş görür. "Robot" tek parça mı, yoksa "ro" ve "bot" gibi iki parça mı? Parçalama biçimi, modelin neye ne kadar hızlı ve ucuz bakabildiğini değiştirir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Token nedir?
Token, modelin metni işlerken kullandığı en küçük birimdir. Bir token bazen bütün bir kelime, bazen kelimenin bir parçası, bazen tek bir harf ya da noktalamadır. Model metni doğrudan okumaz; önce token'lara böler, her token'ı bir sayıya çevirir.

### Aracı aç
1. **Token ve BPE** aracında "Metin" kutusuna en az sekiz kelimelik bir cümle yaz.
2. **Birleştirme sayısını** 0'dan yukarı çek. Başta her karakter ayrı token'dır. Birleştirme arttıkça sık geçen parçalar tek token olur.
3. Token sayısı karakter sayısından az olunca ikinci hedefi yaparsın.
4. **Eğitim derlemini** Türkçe ile İngilizce arasında değiştir. Aynı metnin token sayısı değişir.

### Nasıl çalışıyor?
- Araç, küçük bir Türkçe ve küçük bir İngilizce metinden öğrenilmiş **BPE** birleştirmeleri kullanır. Hesap gerçektir.
- Türkçe derlemle öğrenilen parçalar Türkçe metne daha iyi uyar; İngilizce metni daha çok parçalar. Gerçek modellerin parçalayıcıları çok büyük ve çok dilli metinlerle eğitilir ama aynı etki, daha küçük ölçekte de olabilir: eğitimde az görülen dil, daha çok token tutar.
- Kelime başındaki boşluk "·" ile gösterilir.

### Dene
1. "robot" ve "robotlar" kelimelerini karşılaştır. Ortak bir token paylaşıyorlar mı?
2. Çok uzun bir kelime yaz: parça sayısı nasıl değişiyor?
3. Aynı anlamda bir Türkçe ve bir İngilizce cümle yaz; hangisi daha çok token tutuyor?

### Sık yapılan hatalar
- "Token = kelime" sanmak. Token çoğu zaman kelimeden küçüktür ya da büyüktür.
- Bu aracın parçalayıcısını gerçek bir modelinki sanmak. Bu yalnız mekanizmayı gösteren küçük bir örnektir.

### Kendini sına
1. Token sayısı neden önemlidir? (İpucu: model bir seferde yalnız belli sayıda token görebilir.)
2. Birleştirme sayısı 0 iken token sayısı neye eşittir?

## Konuşalım
Türkçe gibi ekli bir dilde kelimeler kolayca uzar. Bu, bir modelin Türkçe metni işleme maliyetini nasıl etkileyebilir?
