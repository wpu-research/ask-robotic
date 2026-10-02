# Proje: Mini ajan
süre: 40

## Merak
Haftanın projesi: iki kez ölçüp iki kez ilerleyen bir ajan. Kalan mesafenin yarısı kadar ilerle, tekrar ölç, yüzde altmışı kadar ilerle, dur. Hesapları araçla yap.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Görev
**Ajan döngüsü**, robot koridoru:
1. `mesafe()` ile ölç.
2. `hesapla` ile kalanın yarısını bul ve o kadar ilerle.
3. Tekrar ölç; kalanın yüzde 60'ı kadar ilerle.
4. `dur()` ve `bitir(...)`.
5. Robot duvara 5 ile 20 cm kala dursun; çarpma olmasın.

### İpucu
`$1` ilk ölçümdür. `hesapla($1*0.5)` yarısını verir. Her adımın sonucuna kendi numarasıyla ulaşırsın: adımları kâğıda numaralandır.

### Rapor
1. Betiğin ve her adımın gözlemi.
2. Neden iki kez ölçtün?
3. Hata verdiğinde ne yaptın?
4. Bu ajanı gerçek bir robota bağlasan hangi ek güvenlik önlemlerini koyardın?

### Nasıl çalışıyor?
- Sonuç, hesabın gerçek sonucudur. Ajanın "model" kısmı sensin; gerçek bir ajanda kararı model verirdi ve her seferinde aynı sonuca ulaşmayabilirdi. Bu yüzden ajanlar da eval ile ölçülür.

### Kendini sına
1. Aynı ajanı 10 kez çalıştırıp 3'ünde duvara çarparsa ne yaparsın?
2. Betik yerine bir model karar verse hangi yeni risk doğar?

## Konuşalım
Bu projedeki hangi karar kuralla, hangisi modelle verilmeye daha uygun? Bir robotta modelin kararına ne kadar güvenebilirsin?
