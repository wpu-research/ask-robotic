# Eş anlamlıyı yakalayamayan vektör
süre: 25

## Merak
İnsan için "mesafe" ve "uzaklık" aynı şeydir. Sayım tabanlı bir vektör için ise iki ayrı sözcüktür. Bu sınırı görmek, neden daha akıllı gömme modellerine ihtiyaç duyulduğunu anlatır.

## Etkinlik
Bu etkinlik tamamen **Yapay Zekâ Atölyesi**'nde, tarayıcında çalışır. Dış servis, hesap ya da anahtar gerekmez. Sağdaki **Hedefler** listesi yeşile döndükçe ilerlediğini görürsün.

### Sorun
Kelime sayımı ve TF-IDF yalnızca **aynı** terimleri eşleştirir. Anlamca yakın ama farklı sözcükleri birbirine bağlayamaz.

### Aracı aç
1. **Metin benzerliği** aracında "Ultrasonik sensör" belgesi mesafeden söz ediyor.
2. Sorguna "uzaklık" kelimesinin bir biçimini ekle (örneğin "uzaklığı nasıl bulur").
3. En az üç kelimelik bir sorgu kullan.
4. Hiçbir belgeyle eşleşme olmadığını gör: en yüksek benzerlik 0.

### Nasıl çalışıyor?
- Sorgudaki hiçbir terim belgelerde geçmediği için kosinüs 0'dır.
- Gömme modelleri, anlamca yakın metinleri benzer vektörlere yerleştirmeyi öğrenmiştir; bu yüzden bazen ortak kelimesi olmayan metinleri de eşleştirebilir. Bu araçtaki yöntem öyle değildir ve bunu bilerek kullanıyoruz.
- Bu sınırı hafifletmenin basit yolları: eş anlamlıları sorguya ekleme, daha iyi gövdeleme, öğrenilmiş vektörler.

### Dene
1. Aynı sorgudaki "uzaklığı" yerine "mesafeyi" yaz ve sonucu karşılaştır.
2. Yöntemi "Kelime sayımı" yap: sonuç değişiyor mu?

### Kendini sına
1. Sayım vektörü neden eş anlamlıyı bulamaz?
2. Bu sınır bir arama sisteminde hangi hatayı doğurur? (İlgili belgeyi kaçırmak mı, yanlış belgeyi getirmek mi?)

## Konuşalım
Bir okul arama kutusunda öğrenciler "ödev", "görev", "proje" sözcüklerini birbirinin yerine kullanıyor. Aramayı iyileştirmek için ne yapardın?
