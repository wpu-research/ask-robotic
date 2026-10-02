# Halüsinasyon dedektifi
süre: 30

## Merak
Bir model, hiç duymadığı bir kitabın yazarını söyleyebilir, hem de çok kendinden emin bir şekilde. Buna halüsinasyon denir: akıcı ve makul görünen ama kaynağı olmayan ya da yanlış bilgi.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Neden olur?
Model, olasılığı yüksek bir sonraki parçayı üretir; bir bilgiyi "bildiği" için değil, öyle yazmak makul göründüğü için de söyleyebilir. Bilgi eksikse ya da bağlamda yoksa boşluğu akıcı bir tahminle doldurabilir.

### Türler
- **Çelişki:** Kaynağın söylediğinin tersini yazmak.
- **Uydurma ayrıntı:** Kaynakta hiç olmayan bir tarih, isim ya da sayıyı eklemek.
- **Abartma:** "Kesinlikle", "her zaman" gibi kaynakta olmayan kesinlik.

### Aracı aç
**Halüsinasyon dedektifi**, sensör notu vakasıyla. Kaynak metin ve ondan "özetlenmiş" sekiz iddia var (elle yazılmış örnek, gerçek model çıktısı değil).
1. Sekiz iddiayı da işaretle.
2. En az yedisini doğru işaretle.
3. "Kaynakta yok" olan uydurma ayrıntıyı bul.
4. Cevapları kontrol et ve açıklamaları oku.

### Nasıl azaltırsın?
- Kaynağı bağlama ver (RAG) ve "yalnız kaynağa dayan" de.
- "Bilmiyorsan bilmiyorum de" talimatı ver.
- Önemli iddialar için kaynak göstermesini iste ve **kaynağı sen kontrol et**.
- Hesap ve güncel bilgi için araç kullan.
- Çıktıyı eval ile ölç.
Bunlar riski azaltır; sıfırlamaz.

### Kendini sına
1. "Kaynakta yok" ile "kaynakla çelişiyor" arasındaki fark nedir?
2. Bir modelin kendinden emin konuşması neden doğruluk kanıtı değildir?

## Konuşalım
Gerçek hayatta, bir yapay zekânın cevabına güvenip sonra yanıldığın bir an oldu mu? Bir dahaki sefere neyi farklı yapardın?
