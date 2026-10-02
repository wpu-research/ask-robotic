# İyi test vakası yazmak
süre: 25

## Merak
İyi bir sınav hem kolay hem zor sorular içerir. Test seti de öyle: sadece bildiğin cevapları değil, sistemin zorlanacağı durumları da sormalısın.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### İyi bir vaka nasıl olur?
- **Net beklenen çıktı:** İki kişi aynı etiketi koyar.
- **Farklı türler:** Kolay, zor, sınırdaki ve "ne olumlu ne olumsuz" vakalar.
- **Tekrarsız:** Aynı vakayı yinelemek ölçümü şişirir.

### Aracı aç
1. **Eval tablosu** aracında en az sekiz vaka yaz.
2. Üç etiketten de en az bir örnek bulunsun: olumlu, olumsuz ve belirsiz (ne olumlu ne olumsuz, örneğin "Toplantı saat beşte").
3. Aynı vakayı iki kez yazma.

### Nasıl çalışıyor?
- Araç boş satırları saymaz ve yinelenen vakaları işaretler.
- Etiket başına sonuç çubukları, hangi türde sistemin zorlandığını gösterir.

### Dene
1. Her etiket için bir "zor" vaka yaz.
2. İlk beş vakanı bir arkadaşına ver: o da aynı etiketi koyuyor mu?

### Kendini sına
1. "Belirsiz" etiketi neden gerekli?
2. İki kişi aynı etikete katılmıyorsa vaka hakkında ne düşünürsün?

## Konuşalım
Etiketlemek bazen kişiye göre değişir. Bir cümlenin "olumlu mu olumsuz mu" olduğu konusunda anlaşamadığınız bir örnek bul.
