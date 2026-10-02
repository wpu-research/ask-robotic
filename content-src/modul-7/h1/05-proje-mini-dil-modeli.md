# Proje: Mini dil modeli
süre: 35

## Merak
Bir dil modelinin içini görmek istedin: işte bu proje, elinde bulunan parçalarla bir mini dil modelini baştan sona kullanıp cümle üretmen. Çıkan cümleler garip olabilir ve bu iyi: garipliğin nereden geldiğini açıklamak bu projenin asıl işi.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Görev
**Sonraki kelime ve sıcaklık** aracıyla bir cümle üret ve ürettiğin cümleyi çözümle.

### Adımlar
1. Başlangıç kelimesini seç (örneğin "robot").
2. Modeli **iki kelimelik bağlama** ayarla.
3. En az sekiz kelime ürettir. Üretilen metinde bir cümle sonu (nokta) çıkana kadar dene; gerekirse tohumu değiştir.
4. Üç farklı tohumla üç farklı cümle kaydet.

### Çözümleme (kâğıda ya da not defterine)
- Hangi cümle dil bilgisi bakımından doğru? Hangisi anlamsız?
- Anlamsız olanlarda hangi iki kelimenin yan yana gelmesi modelin "hatası"? Derleme bakıp bu çiftin gerçekten orada olup olmadığını kontrol et.
- Daha uzun bağlam (iki kelime) sonuçları nasıl değiştirdi?

### Nasıl çalışıyor?
- Model, yalnız gördüğü cümlelerin parçalarını yeniden dizebilir. Tamamen yeni bir fikir üretemez.
- Anlamsız çıktıların çoğu, iki kelimelik bağlamın "cümlenin tamamını" görememesinden gelir. Büyük modeller binlerce token'a birden bakar.

### Kendini sına
1. Modelin ürettiği bir cümle derlemdeki bir cümlenin birebir kopyası olabilir mi? Neden?
2. Bağlamı uzatmanın bir bedeli ne olur? (İpucu: daha çok veri gerekir.)

## Konuşalım
Projeden çıkan en komik cümleyi ve onun neden çıktığını sınıfla paylaş. Gerçek bir modelin saçma bir cümle kurmasının nedenleri buradakine benzer mi, farklı mı olurdu?
