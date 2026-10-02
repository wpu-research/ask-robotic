# Önce ölç, sonra hareket et
süre: 30

## Merak
Geri alınamayan bir eylemden önce bilgi toplamak ajanlar için de bir kural: önce mesafeyi ölç, sonra ilerle. Bu hem insanlar hem makineler için güvenli çalışmanın temelidir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### İzinler ve onay
Bir ajana verilen araçlar onun "yetkileridir". İyi tasarım:
- **En az yetki:** Yalnız gereken araçlar verilir.
- **Önce oku, sonra yaz:** Değiştirmeden önce bilgi topla.
- **İnsan onayı:** Geri alınamayan ya da riskli adımlar için onay istenir.

### Aracı aç
**Ajan döngüsü**, robot koridoru:
1. İlk adım `mesafe()` olsun.
2. Kalan mesafeden 20 cm eksik ilerle: `hesapla($1-20)` sonra `ileri($2)`.
3. Robot duvara 5 ile 30 cm kala dursun ve `dur()` çağrılsın.

### Nasıl çalışıyor?
- `mesafe()` 100 döndürür; `hesapla($1-20)` 80 verir; `ileri($2)` robotu 80 cm ilerletir.
- Ölçü ve hareket bağımsız adımlardır; ölçüden sonra ortam değişebilir. Gerçek robotlarda hareket sırasında da ölçmeye devam edersin.

### Dene
1. Marjı 5 cm yap: sonuç hâlâ güvenli mi?
2. Ölçümü atla ve doğrudan `ileri(90)` yaz: ne oldu?

### Kendini sına
1. Robota "ileri(N)" aracı verirken hangi önlemleri alırdın?
2. İnsan onayı hangi adımlarda gereklidir?

## Konuşalım
Bir ajana e-posta gönderme yetkisi verirsen hangi güvenlik adımlarını koyardın? Onayı her e-postada mı istemek mantıklı?
