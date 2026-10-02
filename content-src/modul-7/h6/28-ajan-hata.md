# Hata, sınır ve durma
süre: 30

## Merak
Sonsuza dek çalışan bir ajan hem pahalıdır hem tehlikelidir. İyi bir ajan, ne zaman duracağını bilir: sonuca ulaştığında, hata verdiğinde ya da sınıra vardığında.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Sınırlar
- **Adım sınırı:** Döngü en fazla belli sayıda adım atar. Burada 30.
- **Hata işleme:** Başarısız bir araç çağrısı, gözlem olarak ajana döner.
- **Durma:** Ajan işi bitince `bitir(...)` ile döngüyü kapatır.
- **Geri alınamaz eylemler:** Duvara çarpmak gibi sonuçlar baştan önlenmelidir.

### Aracı aç
**Ajan döngüsü** aracında dünya: sanal robot koridoru; duvar 100 cm ileride.
1. Robotu duvara çarpmadan en az 60 cm ilerlet: `tekrar 3: ileri(20)`.
2. `dur()` ile robotu durdur.
3. `bitir(tamam)` ile ajan döngüsünü kapat.
4. Robot haritası gerçek hesapla çalışır: `ileri(n)` kalan mesafeyi döndürür; duvara varırsan ÇARPAR ve ajan durur.

### Nasıl çalışıyor?
- `tekrar N: ...` bir satırı N kez tekrarlar. `tekrar 99:` yazarsan adım sınırı devreye girer; bu bir güvenlik ağıdır.
- Çarpma hatası, ajanın "yanlış planı" sonucudur: planı yazarken ilerleme toplamını hesaplamalıydın (3 × 20 = 60 < 100).

### Dene
1. `tekrar 6: ileri(20)` yaz ve çarpmayı gör.
2. `tekrar 99: hesapla(1)` yaz: adım sınırı hatasını gör.

### Kendini sına
1. Adım sınırı olmayan bir ajanın hangi riski vardır?
2. Bir araç hata verdiğinde ajanın en güvenli davranışı nedir?

## Konuşalım
Gerçek bir robotun "adım sınırı" ya da "acil durdurma" mekanizması neye benzerdi? Bunları yazılımla mı, donanımla mı sağlamak daha güvenli?
