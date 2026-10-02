# Sonraki kelimeyi tahmin et
süre: 25

## Merak
Telefonunun klavyesi "Merhaba, nasıl..." yazınca "...sın" önerir. Bunu bir ezber listesinden değil, daha önce gördüğü metinlerdeki sıklıklardan çıkarır. Bir dil modeli de aynı fikrin çok daha güçlü bir hâlidir. Şimdi bunu küçük bir metinden gerçekten sayacağız.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### n-gram modeli
Mini bir robot metni var (yaklaşık kırk kısa cümle). Araç, "şu kelimenin ardından hangi kelimeler geldi?" sorusunu bu metinden **sayar**. Son bir kelimeye bakıyorsa buna ikili (bigram), son iki kelimeye bakıyorsa üçlü (trigram) model denir. Bu, bir sinir ağı değildir; ama "bağlamdan sonraki kelimenin olasılığını çıkarmak" fikri aynıdır.

### Aracı aç
1. **Sonraki kelime ve sıcaklık** aracında bağlama "robot engeli görür ve" yaz. İki kelimeye bakan modeli seç.
2. Olasılık çubuklarına bak: "durur", "sağa", "geri" gibi adaylar ve olasılıkları görünür.
3. Bağlamı "robot sağa" yap: tek aday kalabilir (olasılık yüzde 100). Bu hedef: en olası kelimenin olasılığı %40'ın üstünde.
4. **Bir kelime üret** düğmesiyle en az üç kelime ürettir.

### Nasıl çalışıyor?
- Sayım: derlemde "robot sağa" ardından hep "döner" geldiyse "döner" olasılığı 1'dir.
- Bilmediği bir bağlamla karşılaşırsa model **geri çekilir**: daha kısa bağlama, o da yoksa cümle başı sözcüklerine bakar. Araç hangi düzeyi kullandığını yazar.
- Üretim, olasılıklara göre tohumlu bir rastgele seçimle yapılır. Aynı tohum aynı sonucu verir, tohumu değiştirince farklı cümle çıkar.

### Dene
1. Bağlam olarak derlemde hiç geçmeyen bir kelime yaz. Model ne yapıyor?
2. Bir ve iki kelimelik bağlamı karşılaştır: hangisi daha "kendinden emin"?
3. Aynı bağlamda iki farklı tohumla üret.

### Kendini sına
1. Derlemde "görür ve" ifadesinden sonra 4 kez "durur", 1 kez "sağa" gelseydi "durur" olasılığı ne olurdu?
2. Kısa bağlama bakan model neden daha az tutarlı cümleler kurar?

## Konuşalım
Bu model yalnızca kırk cümle gördü. Gerçek bir dil modeli çok daha fazlasını görüyor. Daha fazla veri, "tahmin etme" işini ne yönde değiştirir? Hangi sorunları çözmez?
