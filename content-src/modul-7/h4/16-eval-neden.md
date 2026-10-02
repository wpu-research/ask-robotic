# Neden ölçmeliyiz?
süre: 25

## Merak
Bir prompt'u üç kez denedin ve "güzel çalışıyor" dedin. Peki yüz farklı girdide de çalışacak mı? Gerçek bir mühendislik işi, sezgiyi ölçüme çevirmektir. Buna değerlendirme, yani eval denir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Eval nedir?
Eval, bir sistemin (model, prompt ya da uygulama) beklenen davranışı ne kadar karşıladığını ölçen test setidir. Her vaka bir girdi ve beklenen çıktıdan oluşur. Sonuçta basit bir sayı elde edersin: **doğruluk = doğru sayısı / toplam vaka**.

### Önemli not
Bu etkinlikte test edilen sistem bir **model değil**: kural tabanlı küçük bir duygu sınıflandırıcısıdır. Yöntem (vaka yaz, çalıştır, ölç) ise gerçek eval'ın aynısıdır.

### Aracı aç
1. **Eval tablosu** aracında en az beş test vakası yaz. Her vaka bir yorum ve beklenen etikettir.
2. Doğruluğu izle.
3. Sistemin yanıldığı en az bir vaka bul. İpucu: "Harika, yine bozuldu" gibi alaycı cümleleri ve "Fena değil" gibi kalıpları dene.

### Nasıl çalışıyor?
- Sistem, olumlu ve olumsuz sözcük listelerine bakar; "değil" kelimesi önceki sözcüğün anlamını ters çevirir. Alay ve bilmediği sözcükler zayıf noktasıdır.
- Her vaka ayrı satırda "✓" ya da "✗" ile gösterilir. ✗ olanlar, sistemin zayıf noktalarını gösterir.

### Kendini sına
1. 8 vakadan 6'sını doğru bulan bir sistemin doğruluğu nedir?
2. Yalnız kolay vakalar yazarsan ölçüm neden yanıltır?

## Konuşalım
Bir şeyi "iyi çalışıyor" diye duyurmadan önce hangi sayıyı görmek isterdin? Tek bir sayı neleri gizleyebilir?
