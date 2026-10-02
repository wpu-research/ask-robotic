# Robotta karar: kural mı, model mi?
süre: 35

## Merak
Bir robot engeli görünce ne yapmalı: bir kural mı çalışsın ("50 cm'den yakınsa dur"), yoksa öğrenilmiş bir model mi karar versin? Cevap işe bağlı: bazen basit kural en güvenli seçenektir.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Robotikte yapay zekâ nerede?
- **Görü:** Kameradan engel, çizgi, nesne ya da insan tanıma (genellikle özel eğitilmiş görü modelleriyle yapılır).
- **Karar:** Algıya göre eylem seçmek. Kural, durum makinesi ya da öğrenilmiş bir politika olabilir.
- **Dil arayüzü:** İnsanın doğal dille verdiği komutu araç çağrılarına çevirmek. Dil modelleri burada kullanılabilir; ama komutun güvenliği ayrı bir katmanla (kurallar, sınırlar, onay) sağlanmalıdır.

### Kural ne zaman iyidir?
Kuralın davranışı öngörülebilir, test edilebilir ve açıklanabilirdir. Güvenlik açısından kritik yerlerde (ör. "çok yakınsa dur") bu özellikler önemlidir. Model, kuralla yazması zor işlerde (görüntü tanıma gibi) üstündür ama hata yapabilir ve nedenini açıklamak zordur.

### Aracı aç
**Ajan döngüsü**, robot koridoru. Betik burada senin kuralındır:
1. Robotu üç adımda ilerlet: `tekrar 3: ileri(20)`.
2. `mesafe()` ile ölç.
3. Koşullu bir satır yaz: `eğer $son < 50: dur()`.
4. Hedefler: betikte bir "eğer" var, robot koşul gerçekleşince durdu, duvara çarpmadı ve en az 50 cm ilerledi.

### Nasıl çalışıyor?
- `eğer koşul: çağrı` satırı, koşul doğruysa (hesap sonucu 0 değil) çağrıyı çalıştırır. `$son`, en son başarılı çağrının sonucudur.
- Betik ve araçlar deterministiktir: her çalıştırmada aynı sonuç. Gerçek bir model tabanlı karar bu özelliğe sahip olmayabilir, bu yüzden güvenlik kuralları modelden bağımsız kalmalıdır.

### Kendini sına
1. Hangi kararı kurala, hangisini modele bırakırsın? Neden?
2. Model "ileri git" dese bile robotu duvardan koruyan kural nerede yaşamalı?

## Konuşalım
Bir çizgi izleyen robotta çizgiyi kamerayla bulan kısmı model, motorları durduran kısmı kural yapmak mantıklı mı? Neden?
