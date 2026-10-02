# Ne zaman insan karar vermeli?
süre: 25

## Merak
Bir model hızlı, yorulmaz ve çoğu zaman yardımcıdır. Ama bazı kararlar, hata yapıldığında geri alınamaz ya da başkalarını etkiler. Bu kararları kimin vereceği bir mühendislik tasarım sorusudur.

## Etkinlik
Bu ders okuma dersidir; etkinlik aracı yoktur.

### Neyi otomatik bırakırsın?
Karar verirken şu soruları sor:
1. **Geri alınabilir mi?** Yanlış karar kolayca düzeltilebiliyorsa otomasyon daha rahat olur.
2. **Başkası etkilenir mi?** İnsanların güvenliğini, parasını ya da fırsatını etkileyen kararlar daha çok denetim ister.
3. **Hata ne kadar maliyetli?** Eval'da ölçülen hata oranı kabul edilebilir mi?
4. **Açıklanabilir mi?** Kararın nedenini söyleyebiliyor musun?

### Tasarım örüntüleri
- **İnsan döngüde (human in the loop):** Model öneri yapar, insan onaylar.
- **Güvenli varsayılan:** Emin değilse durur ya da insana sorar.
- **Kayıt ve denetim izi:** Neyin neden yapıldığı kaydedilir.
- **Sınırlar:** Hız, kuvvet, bölge, bütçe gibi sert sınırlar modelden bağımsız uygulanır.
- **Sürekli ölçüm:** Sistem değişince ve yeni veriyle eval yeniden çalıştırılır.

### Sorumluluk
Modeli kullanan kişi ve uygulamayı kuran ekip, sonuçtan sorumludur. "Model öyle dedi" bir mazeret değildir. Bunu, bir yapay zekâ çıktısını kullanmadan önce kendine sormalısın: "Bunu kendim doğruladım mı, sonucuna katlanabilir miyim?"

### Kendini sına
1. "İnsan döngüde" ne demektir? Bir örnek ver.
2. Hangi koşulda bir robotun kararını tamamen otomatik bırakırsın?
3. Model hata yaparsa kim sorumludur?

## Konuşalım
Sınıf ödevlerinde yapay zekâ kullanımı için "insan döngüde" ilkesini nasıl uygularsın? Hangi adımları kendin yapmalısın?
